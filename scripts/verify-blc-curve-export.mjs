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
if (payload.format !== "gwl-blc-curve-export-v1" || payload.version !== "1.9") fail("Unbekanntes BLC-Exportformat; für segmentbezogene Herkunftsnachweise ist Exportversion 1.9 erforderlich.");
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
const allowedThresholdStatuses = new Set(["crossed", "already_crossed_at_start", "not_crossed", "series_ends_before_known_crossing", "not_assessable"]);
const minimumObservationSpanYears = 50;
const singleYearCoverageExceptionRuleId = "blc_documented_single_year_coverage_exception";

function pointKey(point) {
  return `${Number(point?.year)}:${Number(point?.value)}`;
}

function countSegmentPoints(segments) {
  return segments.reduce((total, segment) => total + (segment.points || []).length, 0);
}

function verifyDisplaySegments(curveId, fullSegments, displaySegments, label, minimumGapYears = 20) {
  if (!Array.isArray(displaySegments) || displaySegments.length !== fullSegments.length) fail(`${curveId}: Darstellungssegmente für ${label} fehlen oder sind unvollständig.`);
  const fullById = new Map(fullSegments.map(segment => [segment.id, segment]));
  for (const displaySegment of displaySegments) {
    const fullSegment = fullById.get(displaySegment.id);
    if (!fullSegment) fail(`${curveId}: unbekanntes Darstellungssegment ${displaySegment.id} für ${label}.`);
    const fullPoints = fullSegment.points || [];
    const displayPoints = displaySegment.points || [];
    if (!fullPoints.length || !displayPoints.length) fail(`${curveId}: leeres Segment für ${label}.`);
    const originalPoints = new Set(fullPoints.map(pointKey));
    if (displayPoints.some(point => !originalPoints.has(pointKey(point)))) fail(`${curveId}: ${label} enthält einen nicht belegten Zwischenwert.`);
    if (pointKey(displayPoints[0]) !== pointKey(fullPoints[0]) || pointKey(displayPoints.at(-1)) !== pointKey(fullPoints.at(-1))) {
      fail(`${curveId}: erster oder letzter Wert fehlt in ${label}.`);
    }
    for (let index = 1; index < displayPoints.length; index += 1) {
      const gap = Number(displayPoints[index].year) - Number(displayPoints[index - 1].year);
      const endpointsOnly = index === 1 && displayPoints.length === 2;
      if (gap < minimumGapYears && !endpointsOnly) fail(`${curveId}: sichtbare Punkte für ${label} unterschreiten ${minimumGapYears} Jahre Abstand.`);
    }
  }
}

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
  if (!Array.isArray(curve.displayObservations) || curve.displayObservations.length < 2) fail(`${curve.curveId}: Darstellungsreihe fehlt.`);
  const years = [...new Set(curve.observations.map(point => Number(point?.year)))].sort((a, b) => a - b);
  const displayYears = curve.displayObservations.map(point => Number(point?.year)).sort((a, b) => a - b);
  if (!["observed", "assessed_model_estimate"].includes(curve.dataNature)) fail(`${curve.curveId}: Art der Hauptreihe fehlt oder ist ungültig.`);
  const primaryIntervalYears = curve.dataNature === "observed" ? 5 : 20;
  const observationYearSet = new Set(years);
  if (displayYears.some(year => !observationYearSet.has(year))) fail(`${curve.curveId}: Darstellungsreihe enthält keinen Originalbeobachtungspunkt.`);
  if (displayYears[0] !== years[0] || displayYears.at(-1) !== years.at(-1)) fail(`${curve.curveId}: erster oder letzter Beobachtungspunkt fehlt in der Darstellungsreihe.`);
  if (years.length < 5) fail(`${curve.curveId}: mindestens fünf zeitlich unterschiedliche Beobachtungspunkte erforderlich.`);
  const historicalYears = (curve.historicalReconstruction || []).flatMap(segment => (segment.points || []).map(point => Number(point.year))).filter(Number.isFinite);
  const coverageStart = Math.min(years[0], ...historicalYears);
  const combinedSpanYears = years.at(-1) - coverageStart;
  if (curve.coverageExceptionRuleId && curve.coverageExceptionRuleId !== singleYearCoverageExceptionRuleId) fail(`${curve.curveId}: unbekannte Ausnahme von der Mindestabdeckung.`);
  if (curve.coverageExceptionRuleId && combinedSpanYears !== minimumObservationSpanYears - 1) fail(`${curve.curveId}: unzulässige oder unnötige Ausnahme von der Mindestabdeckung.`);
  if (combinedSpanYears < minimumObservationSpanYears
    && !(combinedSpanYears === minimumObservationSpanYears - 1 && curve.coverageExceptionRuleId === singleYearCoverageExceptionRuleId)) {
    fail(`${curve.curveId}: gemeinsame Zeitabdeckung aus Beobachtung und optionaler Rekonstruktion unter 50 Jahren.`);
  }
  const visibleBreakYears = new Set((curve.methodBreaks || []).filter(marker => marker.showValues === true).map(marker => Number(marker.year)));
  if (historicalYears.some(year => year > years[0] || (year === years[0] && !visibleBreakYears.has(year)))) {
    fail(`${curve.curveId}: historische Rekonstruktion überlappt die direkte Beobachtungsreihe außerhalb eines sichtbar markierten Methodenwechsels.`);
  }
  if (!["increase", "decrease"].includes(curve.worseningDirection)) fail(`${curve.curveId}: ungültige Belastungsrichtung.`);
  for (const kind of ["boundary", "highRisk"]) {
    const assessment = curve.thresholdAssessments?.[kind];
    if (!assessment || !allowedThresholdStatuses.has(assessment.status)) fail(`${curve.curveId}: ungültiger Grenzstatus für ${kind}.`);
    if (["crossed", "already_crossed_at_start"].includes(assessment.status) && !assessment.firstCrossingPoint) fail(`${curve.curveId}: erster Überschreitungspunkt für ${kind} fehlt.`);
    if (assessment.status === "series_ends_before_known_crossing" && (!assessment.lastCheckedPoint || !assessment.knownCrossingPoint)) fail(`${curve.curveId}: Reihenende oder extern belegter Überschreitungspunkt für ${kind} fehlt.`);
    if (assessment.status === "not_assessable" && !assessment.reason) fail(`${curve.curveId}: Begründung für nicht beurteilbaren Grenzstatus ${kind} fehlt.`);
    if (assessment.firstCrossingPoint && !displayYears.includes(Number(assessment.firstCrossingPoint.year))) fail(`${curve.curveId}: Überschreitungspunkt für ${kind} fehlt in der Darstellungsreihe.`);
  }
  const mandatoryDisplayYears = new Set([years[0], years.at(-1), curve.thresholdAssessments.boundary.firstCrossingPoint?.year, curve.thresholdAssessments.highRisk.firstCrossingPoint?.year].filter(Number.isFinite));
  for (let index = 1; index < displayYears.length; index += 1) {
    if (displayYears[index] - displayYears[index - 1] < primaryIntervalYears && !(mandatoryDisplayYears.has(displayYears[index]) && mandatoryDisplayYears.has(displayYears[index - 1]))) {
      fail(`${curve.curveId}: sichtbare Punkte der Hauptreihe unterschreiten ohne fachliche Ausnahme den Mindestabstand von ${primaryIntervalYears} Jahren.`);
    }
  }
  verifyDisplaySegments(curve.curveId, curve.historicalReconstruction || [], curve.displayHistoricalReconstruction, "historische Rekonstruktionen");
  verifyDisplaySegments(curve.curveId, curve.projections || [], curve.displayProjections, "Modellprojektionen");
  const derivation = curve.displayDerivation;
  if (!derivation || derivation.interpolation !== false || !Array.isArray(derivation.transformations) || derivation.transformations.length) {
    fail(`${curve.curveId}: transparente Darstellungsherleitung ohne Interpolation fehlt.`);
  }
  const expectedDerivation = {
    observations: [curve.observations.length, curve.displayObservations.length, primaryIntervalYears],
    historicalReconstruction: [countSegmentPoints(curve.historicalReconstruction || []), countSegmentPoints(curve.displayHistoricalReconstruction || []), 20],
    projections: [countSegmentPoints(curve.projections || []), countSegmentPoints(curve.displayProjections || []), 20]
  };
  for (const [kind, [inputPointCount, outputPointCount, intervalYears]] of Object.entries(expectedDerivation)) {
    const rule = derivation[kind];
    if (rule?.inputPointCount !== inputPointCount || rule?.outputPointCount !== outputPointCount || rule?.intervalYears !== intervalYears || typeof rule?.rule !== "string" || !rule.rule.trim()) {
      fail(`${curve.curveId}: inkonsistente Darstellungsherleitung für ${kind}.`);
    }
  }
  if (curve.seriesId === "global_surface_omega_arag_oceansoda_1982_2021") {
    if (!curve.uncertainty?.includes("Niveauanschluss") || !curve.methodNote?.includes("nicht verbunden oder gegeneinander verschoben")) {
      fail(`${curve.curveId}: Anschlussunsicherheit fehlt im Übergabepaket.`);
    }
    if (!curve.historicalReconstruction?.[0]?.uncertainty?.includes("Niveauanschluss")) {
      fail(`${curve.curveId}: Unsicherheit der historischen Rekonstruktion fehlt.`);
    }
  }
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
  for (const sourceRef of curve.highRisk?.sourceRefs || []) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Quelle des hohen Risikobereichs ${sourceRef}.`);
  for (const sourceRef of curve.knownBoundaryCrossing?.sourceRefs || []) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Quelle des belegten Überschreitungspunkts ${sourceRef}.`);
  for (const note of curve.contextNotes || []) {
    if (!note?.id || !note?.label || !note?.value || !note?.detail || !Array.isArray(note.sourceRefs) || !note.sourceRefs.length) {
      fail(`${curve.curveId}: unvollständiger ergänzender Kontext.`);
    }
    for (const sourceRef of note.sourceRefs) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Kontextquelle ${sourceRef}.`);
  }
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
    for (const sourceRef of projection.sourceRefs || []) if (!sourceIds.has(sourceRef)) fail(`${curve.curveId}: unbekannte Projektionsquelle ${sourceRef}.`);
  }
}

const landForest = payload.curves.find(curve => curve.seriesId === "global_forest_cover_1992_2022");
const landContextIds = new Set((landForest?.contextNotes || []).map(note => note.id));
if (!landContextIds.has("biome_forest_boundaries") || !landContextIds.has("forest_cover_trend_1992_2022")) {
  fail("Waldzustand: biomspezifische Grenzwerte oder Trendeinordnung fehlen im BLC-Export.");
}

console.log(`BLC-Export verifiziert: ${payload.curves.length} Kurve(n), SHA-256 ${actualHash}`);
