import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { buildBlcDomainCatalog, resolveBlcDomain } from "./lib/blc-domain-catalog.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const manifestPath = path.join(projectRoot, "data", "blc", "curve-approvals-v1.json");
const indexPath = path.join(projectRoot, "data", "knowledge", "knowledge-index.json");
const outputPath = path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const qualifiedProjectionGrades = new Set(["robust_scenario_projection", "qualified_scenario_projection"]);
const worseningDirections = new Set(["increase", "decrease"]);
const minimumObservationPoints = 5;
const minimumObservationSpanYears = 50;

const readJson = async file => JSON.parse(await fs.readFile(file, "utf8"));
const fail = message => { throw new Error(message); };
const cleanText = value => typeof value === "string" ? value : undefined;
const cleanStringArray = value => Array.isArray(value) ? value.filter(item => typeof item === "string") : undefined;
const safeUrl = value => typeof value === "string" && /^https:\/\//i.test(value) ? value : undefined;

function normalizeReference(reference) {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) return undefined;
  const sourceRefs = cleanStringArray(reference.sourceRefs);
  const isPlanetaryBoundariesModel = reference.type === "planetary_boundary" || reference.type === "planetary_boundaries_model";
  const normalized = {
    ...(isPlanetaryBoundariesModel
      ? { type: "planetary_boundaries_model", modelName: "Planetare Grenzen" }
      : cleanText(reference.type) ? { type: reference.type } : {}),
    ...(Number.isFinite(Number(reference.value)) ? { value: Number(reference.value) } : {}),
    ...(cleanText(reference.unit) ? { unit: reference.unit } : {}),
    ...(cleanText(reference.display) ? { display: reference.display } : {}),
    ...(sourceRefs?.length ? { sourceRefs } : {})
  };
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizePoints(points) {
  return (points || [])
    .filter(point => Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value)))
    .map(point => ({
      year: Number(point.year),
      value: Number(point.value),
      ...(cleanText(point.display) ? { display: point.display } : {}),
      ...(cleanText(point.finding) ? { finding: point.finding } : {}),
      ...(cleanText(point.uncertainty) ? { uncertainty: point.uncertainty } : {}),
      ...(cleanStringArray(point.sourceRefs)?.length ? { sourceRefs: point.sourceRefs } : {})
    }))
    .sort((a, b) => a.year - b.year);
}

function normalizeHistorical(series) {
  return (series.historicalSegments || series.historicalSeries || [])
    .map(segment => ({
      id: cleanText(segment.id) || "historical-segment",
      ...(cleanText(segment.label) ? { label: segment.label } : {}),
      ...(cleanText(segment.method) ? { method: segment.method } : {}),
      ...(cleanText(segment.sourceId) ? { sourceRefs: [segment.sourceId] } : cleanStringArray(segment.sourceRefs)?.length ? { sourceRefs: segment.sourceRefs } : {}),
      points: normalizePoints(segment.points || segment.values)
    }))
    .filter(segment => segment.points.length);
}

function normalizeProjections(payload, observedSeries) {
  const observationSeries = payload.timeSeries || [];
  return (payload.projectionSeries || [])
    .filter(projection => {
      const assessment = projection.assessment || payload.projectionAssessment;
      if (!qualifiedProjectionGrades.has(assessment?.grade)) return false;
      if (projection.observedSeriesId) return projection.observedSeriesId === observedSeries.id;
      return observationSeries.length === 1 && projection.unit === observedSeries.unit;
    })
    .map(projection => ({
      id: cleanText(projection.id) || "projection",
      ...(cleanText(projection.scenario) ? { scenario: projection.scenario } : {}),
      ...(cleanText(projection.scenarioLabel) ? { scenarioLabel: projection.scenarioLabel } : {}),
      ...(cleanText(projection.method) ? { method: projection.method } : {}),
      ...(cleanText(projection.uncertainty) ? { uncertainty: projection.uncertainty } : {}),
      grade: (projection.assessment || payload.projectionAssessment).grade,
      points: normalizePoints(projection.points)
    }))
    .filter(projection => projection.points.length);
}

function normalizeSources(payload) {
  const sources = (payload.sources || []).map(source => ({
    id: cleanText(source.id) || "source",
    ...(cleanText(source.title) ? { title: source.title } : {}),
    ...(cleanText(source.publisher) ? { publisher: source.publisher } : {}),
    ...(Number.isFinite(Number(source.year)) ? { year: Number(source.year) } : {}),
    ...(safeUrl(source.url) ? { url: source.url } : {}),
    ...(cleanText(source.doi) ? { doi: source.doi } : {}),
    ...(cleanText(source.access) ? { access: source.access } : {})
  }));
  if (payload.source && typeof payload.source === "object") {
    sources.push({
      id: "dataset-source",
      ...(cleanText(payload.source.publication) ? { title: payload.source.publication } : {}),
      ...(cleanText(payload.source.doi) ? { doi: payload.source.doi } : {}),
      ...(safeUrl(payload.source.url) ? { url: payload.source.url } : {})
    });
    if (payload.source.historicalPredecessor && typeof payload.source.historicalPredecessor === "object") {
      sources.push({
        id: "src_freshwater_porkka_2024",
        ...(cleanText(payload.source.historicalPredecessor.publication) ? { title: payload.source.historicalPredecessor.publication } : {}),
        ...(cleanText(payload.source.historicalPredecessor.publicationDoi) ? { doi: payload.source.historicalPredecessor.publicationDoi } : {})
      });
    }
  }
  return sources;
}

const manifest = await readJson(manifestPath);
if (manifest.format !== "gwl-blc-curve-approvals-v1" || !Array.isArray(manifest.approvedCurves)) {
  fail("Ungültiges BLC-Freigabemanifest.");
}

const knowledgeIndex = await readJson(indexPath);
const domainCatalog = buildBlcDomainCatalog(knowledgeIndex);

const curves = [];
const seen = new Set();
for (const approval of manifest.approvedCurves) {
  if (approval.status !== "approved") fail(`${approval.curveId || "Unbekannte Kurve"}: nicht freigegeben.`);
  if (approval.kind !== "knowledge") fail(`${approval.curveId}: Legacy-Kurven werden noch nicht exportiert.`);
  const domain = resolveBlcDomain(domainCatalog, approval.source);
  if (!approval.source.startsWith("data/knowledge/") || approval.source.includes("..")) fail(`${approval.curveId}: unzulässiger Quellpfad.`);
  const expectedId = `knowledge:${approval.source}#${approval.seriesId}`;
  if (approval.curveId !== expectedId || seen.has(approval.curveId)) fail(`${approval.curveId}: inkonsistente oder doppelte Kurven-ID.`);
  seen.add(approval.curveId);

  const sourcePath = path.resolve(projectRoot, ...approval.source.split("/"));
  const knowledgeRoot = `${path.resolve(projectRoot, "data", "knowledge")}${path.sep}`;
  if (!sourcePath.startsWith(knowledgeRoot)) fail(`${approval.curveId}: Quelle liegt außerhalb des Knowledge-Verzeichnisses.`);
  const payload = await readJson(sourcePath);
  const series = (payload.timeSeries || []).find(candidate => candidate.id === approval.seriesId);
  if (!series) fail(`${approval.curveId}: Beobachtungsreihe fehlt.`);
  const observations = normalizePoints(series.points || series.values);
  const observationYears = [...new Set(observations.map(point => point.year))];
  if (observationYears.length < minimumObservationPoints) fail(`${approval.curveId}: mindestens ${minimumObservationPoints} zeitlich unterschiedliche Beobachtungspunkte erforderlich.`);
  const observationSpanYears = Math.max(...observationYears) - Math.min(...observationYears);
  if (observationSpanYears < minimumObservationSpanYears) fail(`${approval.curveId}: Beobachtungsdauer ${observationSpanYears} Jahre; mindestens ${minimumObservationSpanYears} Jahre erforderlich.`);
  if (!worseningDirections.has(series.worseningDirection)) fail(`${approval.curveId}: worseningDirection muss increase oder decrease sein.`);
  const observationSourceRefs = cleanStringArray(series.sourceRefs)?.length ? series.sourceRefs : ["dataset-source"];

  curves.push({
    curveId: approval.curveId,
    boundaryId: approval.boundaryId,
    itemId: approval.itemId,
    seriesId: approval.seriesId,
    source: approval.source,
    ...domain,
    label: cleanText(series.label) || cleanText(series.title) || approval.seriesId,
    metric: cleanText(series.metric) || cleanText(series.measure) || "",
    unit: cleanText(series.unit) || "",
    geography: cleanText(series.geography) || "Global",
    worseningDirection: series.worseningDirection,
    observationCoverage: {
      startYear: Math.min(...observationYears),
      endYear: Math.max(...observationYears),
      spanYears: observationSpanYears,
      pointCount: observationYears.length
    },
    observationSourceRefs,
    ...(normalizeReference(series.reference) ? { reference: normalizeReference(series.reference) } : {}),
    observations,
    historicalReconstruction: normalizeHistorical(series),
    projections: normalizeProjections(payload, series),
    methodBreaks: Array.isArray(series.methodBreaks) ? series.methodBreaks.filter(marker => Number.isFinite(Number(marker?.year))).map(marker => ({ year: Number(marker.year) })) : [],
    sources: normalizeSources(payload)
  });
}

curves.sort((a, b) => a.curveId.localeCompare(b.curveId));
const signedPayload = {
  format: "gwl-blc-curve-export-v1",
  version: "1.2",
  manifestVersion: manifest.version,
  curves
};
const canonical = JSON.stringify(signedPayload);
const output = {
  ...signedPayload,
  integrity: {
    algorithm: "SHA-256",
    scope: "UTF-8 JSON.stringify({format,version,manifestVersion,curves})",
    hash: crypto.createHash("sha256").update(canonical, "utf8").digest("hex")
  }
};

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`BLC-Export erzeugt: ${curves.length} Kurve(n), SHA-256 ${output.integrity.hash}`);
