import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { normalizeBlcReference } from "./lib/blc-reference-pilot.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const knowledgePath = path.join(projectRoot, "data", "knowledge", "gwl_biosphere_functional_integrity_v0.1.json");
const exportPath = path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const schemaPath = path.join(projectRoot, "data", "schema", "blc-curve-export-v1.json");
const buildPath = path.join(projectRoot, "scripts", "build-blc-curve-export.mjs");

const knowledge = JSON.parse(await fs.readFile(knowledgePath, "utf8"));
const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
const series = knowledge.timeSeries.find(item => item.id === "biosphere_hanpp_1910_2020");
const sourceIds = new Set(knowledge.sources.map(source => source.id));
const originalReference = structuredClone(series.reference);

function expectFailure(mutator, pattern) {
  const reference = structuredClone(originalReference);
  mutator(reference);
  try {
    normalizeBlcReference(reference, { series, sourceIds, requirePilot: true });
  } catch (error) {
    if (pattern.test(error.message)) return;
    throw error;
  }
  throw new Error(`Erwarteter Referenzfehler ${pattern} blieb aus.`);
}

const valid = normalizeBlcReference(originalReference, { series, sourceIds, requirePilot: true });
if (valid.role !== "boundary" || valid.qualifier !== "approximate" || valid.exceedanceOperator !== ">") {
  throw new Error("Gültige HANPP-Pilotreferenz wurde nicht unverändert normalisiert.");
}
expectFailure(reference => { delete reference.role; }, /reference\.role fehlt/);
expectFailure(reference => { reference.role = "target"; }, /unbekannte reference\.role target/);
expectFailure(reference => { delete reference.exceedanceOperator; }, /reference\.exceedanceOperator fehlt/);
expectFailure(reference => { reference.exceedanceOperator = ">="; }, /unbekannter reference\.exceedanceOperator/);
expectFailure(reference => { reference.qualifier = "estimated"; }, /ungültiger reference\.qualifier/);
expectFailure(reference => { reference.unit = "percent_of_potential_NPP"; }, /stimmt nicht exakt/);
expectFailure(reference => { reference.sourceRefs = ["src_unknown"]; }, /unbekannte Referenzquelle src_unknown/);

for (const [field, expected] of Object.entries({
  type: "planetary_boundaries_model",
  value: 10,
  unit: "%",
  display: "Grenzwert nach dem Modell der Planetaren Grenzen: etwa 10 % HANPP"
})) {
  if (originalReference[field] !== expected) throw new Error(`Bisheriger Referenzinhalt ${field} wurde verändert.`);
}
if (JSON.stringify(originalReference.sourceRefs) !== JSON.stringify(["src_richardson_2023"])) throw new Error("Bisherige Referenzquellen wurden verändert.");

const runBuild = () => {
  const result = spawnSync(process.execPath, [buildPath], { cwd: projectRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Exporterzeugung fehlgeschlagen.\n${result.stdout}\n${result.stderr}`);
};
runBuild();
const firstBytes = await fs.readFile(exportPath);
runBuild();
const secondBytes = await fs.readFile(exportPath);
if (!firstBytes.equals(secondBytes)) throw new Error("Exporterzeugung ist nicht deterministisch.");

const curveExport = JSON.parse(secondBytes.toString("utf8"));
const signedPayload = {
  format: curveExport.format,
  version: curveExport.version,
  manifestVersion: curveExport.manifestVersion,
  curves: curveExport.curves
};
const actualHash = crypto.createHash("sha256").update(JSON.stringify(signedPayload), "utf8").digest("hex");
if (actualHash !== curveExport.integrity?.hash) throw new Error("SHA-256 des Referenzpilot-Exports ist ungültig.");
if (curveExport.version !== "1.5") throw new Error("Referenzpilot muss Exportversion 1.5 verwenden.");
if (schema.properties?.version?.const !== "1.5") throw new Error("Exportschema muss Version 1.5 verlangen.");
const referenceSchema = schema.properties?.curves?.items?.properties?.reference;
if (referenceSchema?.properties?.role?.const !== "boundary") throw new Error("Schema begrenzt reference.role nicht auf boundary.");
if (!referenceSchema?.properties?.qualifier?.enum?.includes("approximate")) throw new Error("Schema erlaubt qualifier approximate nicht.");
if (!referenceSchema?.properties?.exceedanceOperator?.enum?.includes(">")) throw new Error("Schema erlaubt den Überschreitungsoperator > nicht.");
if (!schema.properties?.curves?.items?.allOf?.length) throw new Error("Schema verlangt die HANPP-Pilotfelder nicht bedingt.");
const hanpp = curveExport.curves.find(curve => curve.seriesId === "biosphere_hanpp_1910_2020");
if (!hanpp || JSON.stringify(hanpp.reference) !== JSON.stringify({
  type: "planetary_boundaries_model",
  modelName: "Planetare Grenzen",
  value: 10,
  unit: "%",
  display: "Grenzwert nach dem Modell der Planetaren Grenzen: etwa 10 % HANPP",
  sourceRefs: ["src_richardson_2023"],
  role: "boundary",
  qualifier: "approximate",
  exceedanceOperator: ">"
})) throw new Error("HANPP-Referenzinhalt ging im Export verloren oder wurde verändert.");
const blue = curveExport.curves.find(curve => curve.seriesId === "blue_water_streamflow");
if (!blue || JSON.stringify(blue.reference) !== JSON.stringify({
  type: "planetary_boundaries_model",
  modelName: "Planetare Grenzen",
  role: "boundary",
  qualifier: "approximate",
  exceedanceOperator: ">",
  value: 12.94,
  unit: "%",
  display: "Obere Modellreferenz: etwa 12,94 % der eisfreien Landfläche",
  sourceRefs: ["dataset-source"]
})) throw new Error("Blauwasser-Modellreferenz fehlt oder wurde verändert.");
if (curveExport.curves.some(curve => curve.seriesId === "green_water_rootzone_soil_moisture")) throw new Error("Grünwasser wurde versehentlich exportiert.");

console.log("BLC-HANPP-Referenzpilot gültig: Validierung, Regression, SHA-256 und Determinismus geprüft.");
