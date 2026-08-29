import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const exportPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const fail = message => { throw new Error(message); };
const payload = JSON.parse(await fs.readFile(exportPath, "utf8"));

const allowedTopFields = new Set(["format", "version", "manifestVersion", "curves", "integrity"]);
for (const field of Object.keys(payload)) if (!allowedTopFields.has(field)) fail(`Unbekanntes Exportfeld: ${field}`);
if (payload.format !== "gwl-blc-curve-export-v1" || payload.version !== "1.1") fail("Unbekanntes BLC-Exportformat.");
if (!Array.isArray(payload.curves)) fail("curves muss ein Array sein.");
if (payload.integrity?.algorithm !== "SHA-256" || !/^[a-f0-9]{64}$/.test(payload.integrity?.hash || "")) fail("Ungültiger Integritätsblock.");

const signedPayload = {
  format: payload.format,
  version: payload.version,
  manifestVersion: payload.manifestVersion,
  curves: payload.curves
};
const actualHash = crypto.createHash("sha256").update(JSON.stringify(signedPayload), "utf8").digest("hex");
if (actualHash !== payload.integrity.hash) fail("SHA-256-Prüfung fehlgeschlagen: Export wurde verändert oder beschädigt.");

const seen = new Set();
for (const curve of payload.curves) {
  if (!curve?.curveId || seen.has(curve.curveId)) fail(`Fehlende oder doppelte Kurven-ID: ${curve?.curveId || "–"}`);
  seen.add(curve.curveId);
  if (!curve.source?.startsWith("data/knowledge/") || curve.source.includes("..")) fail(`${curve.curveId}: unzulässiger Quellverweis.`);
  if (!Array.isArray(curve.observations)) fail(`${curve.curveId}: Beobachtungsreihe fehlt.`);
  const years = [...new Set(curve.observations.map(point => Number(point?.year)))].sort((a, b) => a - b);
  if (years.length < 5) fail(`${curve.curveId}: mindestens fünf zeitlich unterschiedliche Beobachtungspunkte erforderlich.`);
  if (years.at(-1) - years[0] < 50) fail(`${curve.curveId}: Beobachtungsdauer unter 50 Jahren.`);
  if (!["increase", "decrease"].includes(curve.worseningDirection)) fail(`${curve.curveId}: ungültige Belastungsrichtung.`);
  if (curve.observationCoverage?.startYear !== years[0] || curve.observationCoverage?.endYear !== years.at(-1) || curve.observationCoverage?.spanYears !== years.at(-1) - years[0] || curve.observationCoverage?.pointCount !== years.length) {
    fail(`${curve.curveId}: inkonsistente Beobachtungsabdeckung.`);
  }
  if (curve.reference?.type === "planetary_boundaries_model" && curve.reference?.modelName !== "Planetare Grenzen") {
    fail(`${curve.curveId}: Modellreferenz ist unvollständig.`);
  }
  const sourceIds = new Set((curve.sources || []).map(source => source?.id).filter(Boolean));
  if (!Array.isArray(curve.observationSourceRefs) || !curve.observationSourceRefs.length) fail(`${curve.curveId}: Quellenbezug der Beobachtungsreihe fehlt.`);
  for (const sourceRef of curve.observationSourceRefs) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Beobachtungsquelle ${sourceRef}.`);
  for (const sourceRef of curve.reference?.sourceRefs || []) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Modellreferenzquelle ${sourceRef}.`);
  for (const segment of curve.historicalReconstruction || []) {
    for (const sourceRef of segment.sourceRefs || []) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Rekonstruktionsquelle ${sourceRef}.`);
  }
  for (const point of curve.observations) {
    if (!Number.isFinite(Number(point?.year)) || !Number.isFinite(Number(point?.value))) fail(`${curve.curveId}: ungültiger Beobachtungspunkt.`);
  }
  for (const projection of curve.projections || []) {
    if (!["robust_scenario_projection", "qualified_scenario_projection"].includes(projection.grade)) {
      fail(`${curve.curveId}: nicht qualifizierte Projektion im Export.`);
    }
  }
}

console.log(`BLC-Export verifiziert: ${payload.curves.length} Kurve(n), SHA-256 ${actualHash}`);
