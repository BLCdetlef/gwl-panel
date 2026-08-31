import fs from "node:fs/promises";
import path from "node:path";
import { BLUE_WATER_REFERENCE_SOURCE, buildBlueWaterBoundaryReference } from "./lib/blc-reference-pilot.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const knowledge = JSON.parse(await fs.readFile(path.join(projectRoot, BLUE_WATER_REFERENCE_SOURCE), "utf8"));
const curveExport = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const series = knowledge.timeSeries.find(item => item.id === "blue_water_streamflow");
const sourceIds = new Set(["dataset-source", "src_freshwater_porkka_2024"]);

function expectFailure(options, pattern) {
  try {
    buildBlueWaterBoundaryReference(options);
  } catch (error) {
    if (pattern.test(error.message)) return;
    throw error;
  }
  throw new Error(`Erwarteter Blauwasser-Referenzfehler ${pattern} blieb aus.`);
}

const reference = buildBlueWaterBoundaryReference({ sourcePath: BLUE_WATER_REFERENCE_SOURCE, series, sourceIds });
if (reference.value !== 12.94 || reference.value === series.baseline) throw new Error("boundaryUpperEnd wurde nicht eindeutig von baseline getrennt.");
if (reference.sourceRefs.length !== 1 || reference.sourceRefs[0] !== "dataset-source") throw new Error("dataset-source fehlt als eindeutige Referenzquelle.");
if (JSON.stringify(reference).includes("10.31") || JSON.stringify(reference).includes("referenceUpperEnd")) throw new Error("Baseline oder regionale Referenz wurde übernommen.");
if (buildBlueWaterBoundaryReference({ sourcePath: "data/knowledge/andere-quelle.json", series, sourceIds }) !== undefined) throw new Error("Blauwasser-Regel wurde auf eine andere Quelle angewendet.");
expectFailure({ sourcePath: BLUE_WATER_REFERENCE_SOURCE, series: { ...series, id: "wrong_series" }, sourceIds }, /ausschließlich für blue_water_streamflow/);
expectFailure({ sourcePath: BLUE_WATER_REFERENCE_SOURCE, series: { ...series, boundaryUpperEnd: 13 }, sourceIds }, /exakt 12\.94/);
expectFailure({ sourcePath: BLUE_WATER_REFERENCE_SOURCE, series, sourceIds: new Set() }, /unbekannte Referenzquelle dataset-source/);
expectFailure({ sourcePath: BLUE_WATER_REFERENCE_SOURCE, series: { ...series, unit: "fraction" }, sourceIds }, /stimmt nicht exakt/);

if (curveExport.version !== "1.4") throw new Error("Exportversion 1.4 wurde verändert.");
if (curveExport.curves.length !== 2) throw new Error("Export muss exakt zwei freigegebene Kurven enthalten.");
const blue = curveExport.curves.find(curve => curve.seriesId === "blue_water_streamflow");
const hanpp = curveExport.curves.find(curve => curve.seriesId === "biosphere_hanpp_1910_2020");
if (!blue?.sources?.some(source => source.id === "dataset-source")) throw new Error("dataset-source fehlt im sources-Array der Blauwasser-Kurve.");
if (blue.reference?.value !== 12.94 || blue.reference?.sourceRefs?.[0] !== "dataset-source") throw new Error("Blauwasser-Referenz wurde nicht korrekt exportiert.");
if ("baseline" in blue.reference || "referenceUpperEnd" in blue.reference) throw new Error("Unzulässige Referenzfelder wurden exportiert.");
if (!hanpp || hanpp.reference?.value !== 10 || hanpp.reference?.sourceRefs?.[0] !== "src_richardson_2023") throw new Error("HANPP-Referenz wurde verändert.");
if (curveExport.curves.some(curve => curve.seriesId === "green_water_rootzone_soil_moisture")) throw new Error("Grünwasser wurde versehentlich exportiert.");

console.log("BLC-Blauwasser-Modellreferenz gültig: exakte Sonderregel, Quelle und Regression geprüft.");
