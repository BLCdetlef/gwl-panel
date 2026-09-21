import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const source = "data/knowledge/gwl_climate_arctic_september_sea_ice_v0.1.json";
const seriesId = "arctic_september_sea_ice_area_1979_2024";
const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8"));
const approvals = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "curve-approvals-v1.json"), "utf8"));
const exported = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const series = payload.timeSeries?.find(candidate => candidate.id === seriesId);

if (!series) throw new Error("Arktische September-Meereisreihe fehlt.");
if (payload.entry?.contributionRole !== "deepening_without_organ") throw new Error("Beitragsrolle ist nicht korrekt.");
if (payload.presentation?.gwlTimeSeriesDisplay !== "link_only"
  || payload.presentation?.hideTimeSeriesInKnowledgeView !== true
  || payload.presentation?.hideKnowledgePanelInKnowledgeView !== true) {
  throw new Error("Die Meereiskurve darf im GWL nicht dargestellt werden.");
}
if (!payload.presentation?.effectSummary?.includes("ausschließlich im BLC getrennt dargestellt")) {
  throw new Error("Die ruhige GWL-Zusammenfassung fehlt.");
}
if (series.metric !== "Monatlich gemittelte arktische Meereisfläche im September"
  || series.unit !== "Mio. km²" || series.worseningDirection !== "decrease") {
  throw new Error("Messgröße, Einheit oder Belastungsrichtung wurde verändert.");
}
if (series.points.length !== 46 || series.points[0].year !== 1979 || series.points.at(-1).year !== 2024) {
  throw new Error("UHH-Satellitenbeobachtung ist unvollständig.");
}
if (Math.abs(series.points[0].value - 6.605533) > 1e-6 || Math.abs(series.points.at(-1).value - 3.89594) > 1e-6) {
  throw new Error("UHH-Beobachtungswerte stimmen nicht mit dem NetCDF-Auszug überein.");
}
const historical = series.historicalSegments?.[0];
if (!historical || historical.points.length !== 129 || historical.points[0].year !== 1850 || historical.points.at(-1).year !== 1978) {
  throw new Error("UHH/Walsh-Rekonstruktion fehlt oder überlappt die Satellitenbeobachtung.");
}
if (payload.projectionSeries?.length !== 3 || payload.projectionSeries.some(item => item.points.length !== 3)) {
  throw new Error("Die drei IPCC-Projektionssegmente fehlen.");
}
const ssp245 = payload.projectionSeries.find(item => item.scenario === "SSP2-4.5");
if (ssp245?.points.at(-1)?.value !== 0.8 || ssp245?.points.at(-1)?.period !== "2081–2100") {
  throw new Error("IPCC-Tabelle 4.4 wurde nicht korrekt übernommen.");
}
for (const item of [historical, series, ...payload.projectionSeries]) {
  if (!item.provenance?.sourceFile || !item.provenance?.sourceUrl || !item.provenance?.locator
    || !item.provenance?.fields?.length || !item.provenance?.transformation) {
    throw new Error(`${item.id}: segmentbezogene Datenherkunft ist unvollständig.`);
  }
}
const approval = approvals.approvedCurves.find(item => item.seriesId === seriesId);
if (!approval || approval.curveRole !== "deep_dive") throw new Error("BLC-Freigabe als Vertiefung fehlt.");
const curve = exported.curves.find(item => item.seriesId === seriesId);
if (!curve || curve.curveRole !== "deep_dive") throw new Error("Meereiskurve fehlt im BLC-Export.");
if (curve.displayHistoricalReconstruction?.length !== 1 || curve.displayProjections?.length !== 3) {
  throw new Error("BLC-Segmente fehlen.");
}
if (curve.displayObservations.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 5)) {
  throw new Error("Beobachtungspunkte liegen dichter als fünf Jahre.");
}
if (curve.displayHistoricalReconstruction[0].points.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 20)) {
  throw new Error("Rekonstruktionspunkte liegen dichter als zwanzig Jahre.");
}
if (curve.displayProjections.some(item => item.points.some((point, index, points) => index > 0 && point.year - points[index - 1].year < 20))) {
  throw new Error("Projektionspunkte liegen dichter als zwanzig Jahre.");
}

console.log("Arktische September-Meereisfläche gültig: GWL ohne Kurve; BLC mit Rekonstruktion, Satellitenbeobachtung und drei IPCC-Projektionen.");
