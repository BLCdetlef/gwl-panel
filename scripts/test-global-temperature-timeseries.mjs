import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const source = "data/knowledge/gwl_climate_temperature_global_v0.2.json";
const seriesId = "global_temperature_hadcrut5_1850_2025";
const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8"));
const approvals = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "curve-approvals-v1.json"), "utf8"));
const exported = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const series = payload.timeSeries?.find(candidate => candidate.id === seriesId);
if (!series) throw new Error("Globale Temperaturreihe fehlt.");
if (payload.presentation?.gwlTimeSeriesDisplay !== "link_only"
  || payload.presentation?.hideTimeSeriesInKnowledgeView !== true
  || payload.presentation?.hideKnowledgePanelInKnowledgeView !== true) {
  throw new Error("Die Temperaturkurve darf im GWL nicht dargestellt werden.");
}
if (!payload.presentation?.effectSummary?.includes("14 bis 15 °C")
  || !payload.presentation.effectSummary.includes("Belastbarer ist ihre Veränderung")
  || !payload.presentation.effectSummary.includes("+1,47 °C")) {
  throw new Error("Absolute Orientierung und aktuelle Erwärmung fehlen in der GWL-Aufbereitung.");
}
if (series.dataNature !== "observed" || series.points.length !== 176 || series.points[0].year !== 1850 || series.points.at(-1).year !== 2025) {
  throw new Error("Beobachtungssegment ist unvollständig.");
}
if (Math.abs(series.points.at(-1).value - 1.4054) > 0.0001) throw new Error("HadCRUT5-2025-Wert ist nicht korrekt auf 1850–1900 bezogen.");
const historical = series.historicalSegments?.[0];
if (!historical || historical.points.length !== 150 || historical.points[0].year !== 1700 || historical.points.at(-1).year !== 1849) {
  throw new Error("PAGES2k-Rekonstruktionssegment ist unvollständig oder überlappt die Beobachtung.");
}
if (payload.projectionSeries?.length !== 3 || payload.projectionSeries.some(item => item.points.length !== 3)) {
  throw new Error("Die drei IPCC-Projektionssegmente fehlen.");
}
for (const item of [historical, series, ...payload.projectionSeries]) {
  if (!item.provenance?.sourceFile || !item.provenance?.locator || !item.provenance?.fields?.length || !item.provenance?.transformation) {
    throw new Error(`${item.id}: segmentbezogene Datenherkunft ist unvollständig.`);
  }
}
const approval = approvals.approvedCurves.find(item => item.seriesId === seriesId);
if (!approval || approval.curveRole !== "deep_dive") throw new Error("BLC-Freigabe als Vertiefung fehlt.");
const curve = exported.curves.find(item => item.seriesId === seriesId);
if (!curve || curve.curveRole !== "deep_dive") throw new Error("Temperaturkurve fehlt im BLC-Export.");
if (curve.displayHistoricalReconstruction?.length !== 1 || curve.displayProjections?.length !== 3) throw new Error("BLC-Segmente fehlen.");
if (curve.displayObservations.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 5)) {
  throw new Error("Beobachtungspunkte liegen dichter als fünf Jahre.");
}
if (curve.displayHistoricalReconstruction[0].points.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 20)) {
  throw new Error("Rekonstruktionspunkte liegen dichter als zwanzig Jahre.");
}

console.log("Globale Temperaturentwicklung gültig: GWL ohne Kurve; BLC mit Rekonstruktion, Beobachtung und drei IPCC-Projektionen.");
