import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildBlcDomainCatalog, resolveBlcDomain } from "./lib/blc-domain-catalog.mjs";
import { requireBlcCurveRole } from "./lib/blc-curve-roles.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const manifestPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "data", "blc", "curve-approvals-v1.json");
const indexPath = path.join(projectRoot, "data", "knowledge", "knowledge-index.json");
const allowedTopFields = new Set(["format", "version", "approvedCurves"]);
const allowedEntryFields = new Set(["curveId", "kind", "source", "seriesId", "boundaryId", "itemId", "curveRole", "status", "note"]);
const minimumObservationPoints = 5;
const minimumObservationSpanYears = 50;

const readJson = async file => JSON.parse(await fs.readFile(file, "utf8"));
const numericPoints = series => (series?.points || series?.values || []).filter(point =>
  Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value))
);
const validateObservationCoverage = (curveId, points, historicalSegments = []) => {
  const years = [...new Set(points.map(point => Number(point.year)))].sort((a, b) => a - b);
  if (years.length < minimumObservationPoints) {
    fail(`${curveId}: mindestens ${minimumObservationPoints} zeitlich unterschiedliche Beobachtungspunkte erforderlich.`);
  }
  const historicalYears = historicalSegments.flatMap(segment => numericPoints({ points: segment.points || segment.values })).map(point => Number(point.year));
  const coverageStart = Math.min(years[0], ...historicalYears);
  const spanYears = years.at(-1) - coverageStart;
  if (spanYears < minimumObservationSpanYears) {
    fail(`${curveId}: gemeinsame Zeitabdeckung aus Beobachtung und optionaler Rekonstruktion ${spanYears} Jahre; mindestens ${minimumObservationSpanYears} Jahre erforderlich.`);
  }
};
const fail = message => { throw new Error(message); };

const manifest = await readJson(manifestPath);
if (manifest.format !== "gwl-blc-curve-approvals-v1") fail("Unbekanntes Freigabeformat.");
if (manifest.version !== "1.1") fail("Unbekannte Freigabeversion; für curveRole ist Freigabeversion 1.1 erforderlich.");
if (!Array.isArray(manifest.approvedCurves)) fail("approvedCurves muss ein Array sein.");
for (const field of Object.keys(manifest)) {
  if (!allowedTopFields.has(field)) fail(`Unbekanntes Feld im Manifest: ${field}`);
}

const knowledgeIndex = await readJson(indexPath);
const domainCatalog = buildBlcDomainCatalog(knowledgeIndex);

globalThis.window = {};
await import(`${pathToFileURL(path.join(projectRoot, "data.js")).href}?blc-validator=1`);
const legacyData = globalThis.window.GWL_DATA;
const seen = new Set();

for (const entry of manifest.approvedCurves) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) fail("Jeder Freigabeeintrag muss ein Objekt sein.");
  for (const field of Object.keys(entry)) {
    if (!allowedEntryFields.has(field)) fail(`Unbekanntes Feld bei ${entry.curveId || "unbekannter Kurve"}: ${field}`);
  }
  if (!entry.curveId || seen.has(entry.curveId)) fail(`Fehlende oder doppelte curveId: ${entry.curveId || "–"}`);
  seen.add(entry.curveId);
  if (entry.status !== "approved") fail(`${entry.curveId}: status muss approved sein.`);
  requireBlcCurveRole(entry, entry.curveId);
  if (!entry.boundaryId || !entry.itemId || !entry.seriesId) fail(`${entry.curveId}: Pflichtfelder fehlen.`);

  if (entry.kind === "knowledge") {
    resolveBlcDomain(domainCatalog, entry.source);
    if (!entry.source.startsWith("data/knowledge/") || entry.source.includes("..")) fail(`${entry.curveId}: Unzulässiger Quellpfad.`);
    const expectedId = `knowledge:${entry.source}#${entry.seriesId}`;
    if (entry.curveId !== expectedId) fail(`${entry.curveId}: curveId stimmt nicht mit Quelle und Reihe überein.`);
    const payload = await readJson(path.join(projectRoot, ...entry.source.split("/")));
    const series = (payload.timeSeries || []).find(candidate => candidate.id === entry.seriesId);
    if (!series) fail(`${entry.curveId}: Beobachtungsreihe wurde nicht gefunden.`);
    validateObservationCoverage(entry.curveId, numericPoints(series), series.historicalSegments || series.historicalSeries || []);
    continue;
  }

  if (entry.kind === "legacy") {
    if (entry.source !== "data.js") fail(`${entry.curveId}: Legacy-Quelle muss data.js sein.`);
    const expectedId = `legacy:data.js#${entry.boundaryId}/${entry.itemId}`;
    if (entry.curveId !== expectedId || entry.seriesId !== entry.itemId) fail(`${entry.curveId}: Legacy-ID ist inkonsistent.`);
    const boundary = (legacyData?.boundaries || []).find(candidate => candidate.id === entry.boundaryId);
    const item = (boundary?.items || []).find(candidate => candidate.id === entry.itemId);
    if (!item) fail(`${entry.curveId}: Legacy-Kurve wurde nicht gefunden.`);
    validateObservationCoverage(entry.curveId, numericPoints({ points: item.timePoints }));
    continue;
  }

  fail(`${entry.curveId}: kind muss knowledge oder legacy sein.`);
}

console.log(`BLC-Freigaben gültig: ${manifest.approvedCurves.length} Kurve(n).`);
