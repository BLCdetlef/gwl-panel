import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const source = "data/knowledge/gwl_climate_sea_level_global_v0.1.json";
const seriesId = "global_mean_sea_level_satellite_1993_2024";
const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8"));
const approvals = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "curve-approvals-v1.json"), "utf8"));
const exported = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const series = payload.timeSeries?.find(candidate => candidate.id === seriesId);

if (!series) throw new Error("Globale Meeresspiegelreihe fehlt.");
if (payload.entry?.contributionRole !== "deepening_without_organ") throw new Error("Beitragsrolle ist nicht korrekt.");
if (payload.presentation?.gwlTimeSeriesDisplay !== "link_only"
  || payload.presentation?.hideTimeSeriesInKnowledgeView !== true
  || payload.presentation?.hideKnowledgePanelInKnowledgeView !== true) {
  throw new Error("Die Meeresspiegelkurve darf im GWL nicht dargestellt werden.");
}
if (!payload.presentation?.effectSummary?.includes("ausschließlich im BLC getrennt dargestellt")) {
  throw new Error("Die ruhige GWL-Zusammenfassung fehlt.");
}
if (series.dataNature !== "observed" || series.points.length !== 32 || series.points[0].year !== 1993 || series.points.at(-1).year !== 2024) {
  throw new Error("Satellitenbeobachtung ist unvollständig.");
}
if (Math.abs(series.points[0].value - (-3.3737)) > 0.0001 || Math.abs(series.points.at(-1).value - 6.4665) > 0.0001) {
  throw new Error("Satellitenwerte wurden nicht korrekt in Zentimeter umgerechnet.");
}
const historical = series.historicalSegments?.[0];
if (!historical || historical.points.length !== 93 || historical.points[0].year !== 1900 || historical.points.at(-1).year !== 1992) {
  throw new Error("Pegelrekonstruktion ist unvollständig oder überlappt die Satellitenbeobachtung.");
}
if (payload.projectionSeries?.length !== 3 || payload.projectionSeries.some(item => item.points.length !== 9)) {
  throw new Error("Die drei IPCC-Projektionssegmente fehlen.");
}
for (const item of [historical, series, ...payload.projectionSeries]) {
  if (!item.provenance?.sourceFile || !item.provenance?.sourceUrl || !item.provenance?.locator || !item.provenance?.fields?.length || !item.provenance?.transformation) {
    throw new Error(`${item.id}: segmentbezogene Datenherkunft ist unvollständig.`);
  }
}
const approval = approvals.approvedCurves.find(item => item.seriesId === seriesId);
if (!approval || approval.curveRole !== "deep_dive") throw new Error("BLC-Freigabe als Vertiefung fehlt.");
const curve = exported.curves.find(item => item.seriesId === seriesId);
if (!curve || curve.curveRole !== "deep_dive") throw new Error("Meeresspiegelkurve fehlt im BLC-Export.");
if (curve.displayHistoricalReconstruction?.length !== 1 || curve.displayProjections?.length !== 3) throw new Error("BLC-Segmente fehlen.");
if (curve.displayObservations.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 5)) {
  throw new Error("Beobachtungspunkte liegen dichter als fünf Jahre.");
}
if (curve.displayHistoricalReconstruction[0].points.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 20)) {
  throw new Error("Rekonstruktionspunkte liegen dichter als zwanzig Jahre.");
}

console.log("Globaler Meeresspiegel gültig: GWL ohne Kurve; BLC mit Rekonstruktion, Beobachtung und drei IPCC-Projektionen.");
