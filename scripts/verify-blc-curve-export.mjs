import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { BLC_DOMAIN_DEFINITIONS, buildBlcDomainCatalog, resolveBlcDomain } from "./lib/blc-domain-catalog.mjs";
import { requireBlcCurveRole } from "./lib/blc-curve-roles.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const exportPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const indexPath = path.join(projectRoot, "data", "knowledge", "knowledge-index.json");
const fail = message => { throw new Error(message); };
const payload = JSON.parse(await fs.readFile(exportPath, "utf8"));

const allowedTopFields = new Set(["format", "version", "manifestVersion", "curves", "integrity"]);
for (const field of Object.keys(payload)) if (!allowedTopFields.has(field)) fail(`Unbekanntes Exportfeld: ${field}`);
if (payload.format !== "gwl-blc-curve-export-v1" || payload.version !== "1.5") fail("Unbekanntes BLC-Exportformat; für die kombinierte Mindestzeitabdeckung ist Exportversion 1.5 erforderlich.");
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
const knowledgeIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
const domainCatalog = buildBlcDomainCatalog(knowledgeIndex);
const allowedDomains = new Set(BLC_DOMAIN_DEFINITIONS.map(domain => `${domain.domainType}:${domain.domainId}`));
for (const curve of payload.curves) {
  if (!curve?.curveId || seen.has(curve.curveId)) fail(`Fehlende oder doppelte Kurven-ID: ${curve?.curveId || "–"}`);
  seen.add(curve.curveId);
  requireBlcCurveRole(curve, curve.curveId);
  const hasReferencePilotField = ["role", "qualifier", "exceedanceOperator"].some(field => field in (curve.reference || {}));
  if (curve.seriesId === "biosphere_hanpp_1910_2020" || hasReferencePilotField) {
    if (curve.reference?.role !== "boundary") fail(`${curve.curveId}: reference.role muss boundary sein.`);
    if (!["exact", "approximate"].includes(curve.reference?.qualifier)) fail(`${curve.curveId}: ungültiger reference.qualifier.`);
    if (!curve.reference?.exceedanceOperator) fail(`${curve.curveId}: reference.exceedanceOperator fehlt.`);
    if (![">", "<"].includes(curve.reference.exceedanceOperator)) fail(`${curve.curveId}: unbekannter reference.exceedanceOperator.`);
    if (!Number.isFinite(Number(curve.reference?.value))) fail(`${curve.curveId}: reference.value muss numerisch sein.`);
    if (curve.reference?.unit !== curve.unit) fail(`${curve.curveId}: Referenzeinheit stimmt nicht exakt mit der Zeitreiheneinheit überein.`);
  }
  if (!curve.source?.startsWith("data/knowledge/") || curve.source.includes("..")) fail(`${curve.curveId}: unzulässiger Quellverweis.`);
  if (!allowedDomains.has(`${curve.domainType}:${curve.domainId}`) || typeof curve.domainLabel !== "string" || !curve.domainLabel.trim()) {
    fail(`${curve.curveId}: ungültige BLC-Kategorie.`);
  }
  const expectedDomain = resolveBlcDomain(domainCatalog, curve.source);
  for (const field of ["domainType", "domainId", "domainLabel"]) {
    if (curve[field] !== expectedDomain[field]) fail(`${curve.curveId}: ${field} stimmt nicht mit dem Knowledge-Index überein.`);
  }
  if (!Array.isArray(curve.observations)) fail(`${curve.curveId}: Beobachtungsreihe fehlt.`);
  const years = [...new Set(curve.observations.map(point => Number(point?.year)))].sort((a, b) => a - b);
  if (years.length < 5) fail(`${curve.curveId}: mindestens fünf zeitlich unterschiedliche Beobachtungspunkte erforderlich.`);
  const historicalYears = (curve.historicalReconstruction || []).flatMap(segment => (segment.points || []).map(point => Number(point.year))).filter(Number.isFinite);
  const coverageStart = Math.min(years[0], ...historicalYears);
  if (years.at(-1) - coverageStart < 50) fail(`${curve.curveId}: gemeinsame Zeitabdeckung aus Beobachtung und optionaler Rekonstruktion unter 50 Jahren.`);
  if (historicalYears.some(year => year >= years[0])) fail(`${curve.curveId}: historische Rekonstruktion überlappt die direkte Beobachtungsreihe.`);
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
