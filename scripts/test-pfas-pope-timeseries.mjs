import fs from "node:fs";

const root = new URL("../", import.meta.url);
const network = JSON.parse(fs.readFileSync(new URL("data/knowledge/gwl_pfas_pope_global_v0.1.json", root), "utf8"));
const approvals = JSON.parse(fs.readFileSync(new URL("data/blc/curve-approvals-v1.json", root), "utf8"));
const index = JSON.parse(fs.readFileSync(new URL("data/knowledge/knowledge-index.json", root), "utf8"));
const exportData = JSON.parse(fs.readFileSync(new URL("data/blc/blc-curve-export-v1.json", root), "utf8"));
const seriesId = "global_pfoa_air_emissions_pope_1951_2020";
const series = network.timeSeries?.find(candidate => candidate.id === seriesId);

if (!series) throw new Error("POPE-PFOA-Jahresreihe fehlt.");
if (series.dataNature !== "assessed_model_estimate") throw new Error("POPE-PFOA wird nicht ausdrücklich als Modellschätzung bezeichnet.");
if (series.points?.length !== 70 || series.points[0]?.year !== 1951 || series.points.at(-1)?.year !== 2020) {
  throw new Error("POPE-PFOA muss 70 Jahreswerte 1951–2020 enthalten.");
}
const cumulative = series.points.reduce((sum, point) => sum + Number(point.value), 0);
if (Math.abs(cumulative - 3957.096) > 0.001) throw new Error(`Unerwartete kumulierte PFOA-Luftemission: ${cumulative}.`);
if (!series.provenance?.fields?.length || !series.provenance.sourceFile?.includes("PFOA_BG_production.txt")) {
  throw new Error("POPE-PFOA-Provenienz ist unvollständig.");
}
if ((network.projectionSeries || []).length) throw new Error("POPE-PFOA darf keine Zukunftsprojektion erhalten.");

const curveId = `knowledge:data/knowledge/gwl_pfas_pope_global_v0.1.json#${seriesId}`;
const approval = approvals.approvedCurves.find(entry => entry.curveId === curveId);
if (!approval || approval.curveRole !== "deep_dive" || approval.status !== "approved") {
  throw new Error("POPE-PFOA ist nicht als vertiefende BLC-Kurve freigegeben.");
}

const indexedItem = index.systemBoundaries
  ?.flatMap(boundary => boundary.groups || [])
  .flatMap(group => group.items || [])
  .find(item => item.id === "pfas-pope-global-emissions");
if (!indexedItem?.menuHidden) throw new Error("Der technische POPE-Unterbeitrag muss im Menü ausgeblendet bleiben.");

const exportedCurve = exportData.curves?.find(curve => curve.curveId === curveId);
if (!exportedCurve || exportedCurve.dataNature !== "assessed_model_estimate") {
  throw new Error("POPE-PFOA fehlt im BLC-Export oder ist dort nicht als Modellschätzung gekennzeichnet.");
}
if (exportedCurve.observations?.length !== 70 || exportedCurve.displayObservations?.length !== 4) {
  throw new Error("BLC muss 70 Jahreswerte führen und daraus vier Punkte im 20-Jahres-Raster anzeigen.");
}
if (exportedCurve.displayDerivation?.observations?.intervalYears !== 20) {
  throw new Error("Das 20-Jahres-Auswahlraster der POPE-PFOA-Kurve fehlt im BLC-Export.");
}

console.log("POPE-PFOA-Zeitreihe gültig: technischer Unterbeitrag verborgen, 70 Modelljahre, vier BLC-Punkte, vollständige Herkunft.");
