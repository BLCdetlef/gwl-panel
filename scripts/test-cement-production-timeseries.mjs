import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const source = "data/knowledge/gwl_cement_clinker_global_v0.1.json";
const seriesId = "global_cement_production_1926_2024_owid_usgs";

const [index, network] = await Promise.all([
  fs.readFile(path.join(projectRoot, "data", "knowledge", "knowledge-index.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8").then(JSON.parse)
]);

const materialBoundary = index.systemBoundaries.find(boundary => boundary.id === "eah_material_energy_flows");
const constructionGroup = materialBoundary?.groups?.find(group => group.id === "construction_materials");
const cementItem = constructionGroup?.items?.find(item => item.id === "cement_clinker_global");
if (cementItem?.source !== source) throw new Error("Zement und Klinker ist im GWL-Knowledge-Index nicht korrekt eingebunden.");

const series = network.timeSeries?.find(candidate => candidate.id === seriesId);
if (!series || network.presentation?.primaryTimeSeriesId !== seriesId) throw new Error("Die Zementreihe ist nicht als primäre GWL-Zeitreihe gesetzt.");
if (series.unit !== "billion_tonnes_per_year" || series.worseningDirection !== "increase") throw new Error("Einheit oder Belastungsrichtung der Zementreihe ist ungültig.");

const years = series.points.map(point => Number(point.year));
const expectedYears = Array.from({ length: 99 }, (_, index_) => 1926 + index_);
if (years.length !== expectedYears.length || years.some((year, index_) => year !== expectedYears[index_])) {
  throw new Error("Die Zementreihe muss alle 99 Jahre von 1926 bis 2024 genau einmal und sortiert enthalten.");
}
if (series.points.some(point => !Number.isFinite(Number(point.value)))) throw new Error("Die Zementreihe enthält einen ungültigen Zahlenwert.");

const sourceIds = new Set(network.sources?.map(entry => entry.id));
for (const sourceRef of series.sourceRefs || []) {
  if (!sourceIds.has(sourceRef)) throw new Error(`Unbekannter Quellenverweis: ${sourceRef}`);
}

const estimates = new Map(series.points.filter(point => point.status === "official_estimate").map(point => [point.year, point]));
for (const year of [2020, 2021, 2022, 2024]) {
  if (!estimates.has(year)) throw new Error(`Amtliche Schätzkennzeichnung für ${year} fehlt.`);
}

console.log("GWL-Zementreihe gültig: Indexeinbindung, 99 Jahreswerte, Quellen und Schätzkennzeichnungen geprüft.");
