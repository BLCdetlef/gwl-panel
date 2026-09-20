import fs from "node:fs";

const root = new URL("../", import.meta.url);
const readJson = relativePath => JSON.parse(fs.readFileSync(new URL(relativePath, root), "utf8"));
const index = readJson("data/knowledge/knowledge-index.json");
const appSource = fs.readFileSync(new URL("app.js", root), "utf8");
const approvals = readJson("data/blc/curve-approvals-v1.json");

const group = index.systemBoundaries
  .find(boundary => boundary.id === "planetary_boundaries")
  ?.groups?.find(candidate => candidate.id === "novel_entities");
if (!group) throw new Error("Indexgruppe Neue Substanzen fehlt.");

const items = group.items || [];
const byId = new Map(items.map(item => [item.id, item]));
const requiredOrder = [
  "novel-entities-boundary-status",
  "plastics-microplastics",
  "microplastics-human-liver-2022",
  "microplastics-pe-liver-mouse-2026",
  "pesticides-biocides",
  "pesticides-global",
  "pesticides-parkinson-occupational",
  "facade_biocides_burkhardt",
  "pfas",
  "pfas-pope-global-emissions"
];
if (items.map(item => item.id).join("|") !== requiredOrder.join("|")) {
  throw new Error("Die vereinbarte Reihenfolge unter Neue Substanzen ist nicht stabil hinterlegt.");
}

if (byId.get("novel-entities-boundary-status")?.contributionRole !== "pg_core") {
  throw new Error("Der Grenzstatus ist nicht als PG-Kernbeitrag gekennzeichnet.");
}
for (const groupId of ["pesticides-biocides"]) {
  const item = byId.get(groupId);
  if (!item?.groupOnly || item.source) throw new Error(`${groupId}: Themenfamilie ist kein reiner Navigationsknoten.`);
}
if (!byId.get("plastics-microplastics")?.source || byId.get("plastics-microplastics")?.groupOnly) {
  throw new Error("Kunststoffe und Mikroplastik muss als anklickbarer Themenbeitrag mit Gesundheitsbezügen erhalten bleiben.");
}
const expectedParents = new Map([
  ["microplastics-human-liver-2022", "plastics-microplastics"],
  ["microplastics-pe-liver-mouse-2026", "plastics-microplastics"],
  ["pesticides-global", "pesticides-biocides"],
  ["pesticides-parkinson-occupational", "pesticides-global"],
  ["facade_biocides_burkhardt", "pesticides-biocides"],
  ["pfas-pope-global-emissions", "pfas"]
]);
for (const [itemId, parentId] of expectedParents) {
  if (byId.get(itemId)?.parentId !== parentId) throw new Error(`${itemId}: erwartete Zuordnung zu ${parentId} fehlt.`);
}
if (!byId.get("pfas")?.source || !byId.get("pfas-pope-global-emissions")?.menuHidden) {
  throw new Error("PFAS-Hauptbeitrag oder technischer POPE-Unterbeitrag ist nicht korrekt registriert.");
}

const core = readJson(byId.get("novel-entities-boundary-status").source);
const coreMeasurement = core.measurements?.find(item => item.id === "novel_entities_status_2025");
if (coreMeasurement?.reference?.value !== 0 || coreMeasurement?.reference?.unit !== "%") {
  throw new Error("Offizielle Kontrollvariable oder 0-%-Grenze fehlt im Kernbeitrag.");
}
if ((core.timeSeries || []).length) throw new Error("Der nicht bezifferte Grenzstatus darf keine erfundene Kernkurve erhalten.");

const pesticide = readJson(byId.get("pesticides-global").source);
const plastics = readJson(byId.get("plastics-microplastics").source);
const humanLiver = readJson(byId.get("microplastics-human-liver-2022").source);
const mouseLiver = readJson(byId.get("microplastics-pe-liver-mouse-2026").source);
const parkinson = readJson(byId.get("pesticides-parkinson-occupational").source);
const facadeBiocides = readJson(byId.get("facade_biocides_burkhardt").source);
const pfasPope = readJson(byId.get("pfas-pope-global-emissions").source);
if (plastics.presentation?.summaryCardMode !== "narrative" || !plastics.presentation?.effectSummary) {
  throw new Error("Kunststoffe und Mikroplastik besitzt keine einheitliche Kartenzusammenfassung.");
}
if (plastics.presentation?.compactKnowledgeView !== true
  || plastics.presentation?.knowledgePanelLabel !== "BELEGE, WIRKUNGSPFADE UND VERBINDUNGEN") {
  throw new Error("Die ausführlichen Kunststoffbelege sind nicht als gemeinsamer, einklappbarer Detailbereich gekennzeichnet.");
}
if (humanLiver.presentation?.summaryCardMode !== "narrative"
  || !humanLiver.presentation?.effectSummary?.includes("11 menschliche Leberproben")
  || !humanLiver.presentation?.effectSummary?.includes("weder, dass Mikroplastik die Zirrhose verursacht")) {
  throw new Error("Die Leberstudie besitzt keine einheitliche, aussagebegrenzte Kartenzusammenfassung.");
}
for (const [network, label, requiredText] of [
  [mouseLiver, "PE-Mikroplastik-Mausmodell", "kein Beleg dafür, dass Mikroplastik beim Menschen eine Fettleber verursacht"],
  [pesticide, "globaler Pestizideinsatz", "weder die Kontrollvariable der planetaren Grenze noch ein vollständiges Risikomaß"],
  [parkinson, "berufliche Parkinson-Exposition", "kein allgemeiner biologischer Grenzwert"],
  [facadeBiocides, "Fassadenbiozid-Fallstudie", "keinen menschlichen Organbezug"]
]) {
  if (network.presentation?.summaryCardMode !== "narrative"
    || !network.presentation?.effectSummary?.includes(requiredText)) {
    throw new Error(`${label}: einheitliche, evidenzgerechte Kartenzusammenfassung fehlt.`);
  }
}
if (!pesticide.timeSeries?.some(series => series.id === "global_pesticide_use_fao_annual")) {
  throw new Error("Die Pestizidkurve ging bei der Neuordnung verloren.");
}
const pesticideSeries = pesticide.timeSeries.find(series => series.id === "global_pesticide_use_fao_annual");
const pesticide2024 = pesticideSeries.points?.find(point => point.year === 2024);
if (pesticideSeries.period !== "1990–2024"
  || pesticideSeries.points?.length !== 35
  || pesticide2024?.value !== 3.918094
  || !pesticideSeries.provenance?.sourceFile?.includes("Normalized")) {
  throw new Error("Die aktuelle FAOSTAT-Pestizidreihe 1990–2024 oder ihre Herkunftsdokumentation ist unvollständig.");
}
const pesticideHistory = pesticideSeries.historicalSeries?.find(series => series.id === "unido_global_pesticide_consumption_1975_1985");
if (JSON.stringify(pesticideHistory?.points?.map(point => [point.year, point.value])) !== JSON.stringify([
  [1975, 2.0732],
  [1980, 2.3678],
  [1985, 2.4464]
]) || !pesticideHistory?.provenance?.locator?.includes("Tabelle 8")) {
  throw new Error("Die globale UNIDO-Pestizidrekonstruktion oder ihre Fundstelle fehlt.");
}
const pesticideProjection = pesticide.projectionSeries?.find(series => series.id === "global_pesticide_use_recent_trend");
if (pesticideProjection?.baseYear !== 2024 || pesticideProjection?.trendWindow !== "2014–2024") {
  throw new Error("Die Pestizid-Trendfortschreibung verwendet nicht den aktuellen FAOSTAT-Datenstand.");
}
for (const [network, label] of [[pesticide, "Pestizid"], [plastics, "Kunststoff"]]) {
  if (network.presentation?.gwlTimeSeriesDisplay !== "link_only" || network.presentation?.hideTimeSeriesInKnowledgeView !== true) {
    throw new Error(`${label}kurve muss erhalten bleiben, darf unter WIRKUNG aber nicht als Diagramm erscheinen.`);
  }
}
for (const [network, seriesId] of [
  [plastics, "global_plastics_production_1950_2019"],
  [pfasPope, "global_pfoa_air_emissions_pope_1951_2020"]
]) {
  if (!network.timeSeries?.some(series => series.id === seriesId)) throw new Error(`${seriesId}: Kurve ging bei der Neuordnung verloren.`);
  if (!approvals.approvedCurves.some(entry => entry.seriesId === seriesId && entry.curveRole === "deep_dive")) {
    throw new Error(`${seriesId}: BLC-Freigabe als Vertiefungskurve fehlt.`);
  }
}

const healthExpectations = [
  ["pesticides-parkinson-occupational", "brain"],
  ["plastics-microplastics", "heart"],
  ["microplastics-human-liver-2022", "liver"],
  ["microplastics-pe-liver-mouse-2026", "liver"]
];
for (const [itemId, organ] of healthExpectations) {
  const network = readJson(byId.get(itemId).source);
  if (!network.healthContext?.markerSignals?.some(signal => signal.organ === organ)) {
    throw new Error(`${itemId}: Gesundheitsbezug zu ${organ} ging bei der Neuordnung verloren.`);
  }
}

for (const requiredMapping of [
  "groupOnly: item.groupOnly === true",
  "contributionRole: item.contributionRole || null",
  "summary: item.summary || \"\""
]) {
  if (!appSource.includes(requiredMapping)) throw new Error(`Indexabbildung fehlt: ${requiredMapping}`);
}

console.log("Neue-Substanzen-Struktur gültig: Kernstatus, drei Themenfamilien, Kurven und Gesundheitsbezüge geprüft.");
