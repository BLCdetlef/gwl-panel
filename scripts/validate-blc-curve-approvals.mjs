import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const manifestPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "data", "blc", "curve-approvals-v1.json");
const indexPath = path.join(projectRoot, "data", "knowledge", "knowledge-index.json");
const allowedTopFields = new Set(["format", "version", "approvedCurves"]);
const allowedEntryFields = new Set(["curveId", "kind", "source", "seriesId", "boundaryId", "itemId", "status", "note"]);

const readJson = async file => JSON.parse(await fs.readFile(file, "utf8"));
const numericPoints = series => (series?.points || series?.values || []).filter(point =>
  Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value))
);
const fail = message => { throw new Error(message); };

const manifest = await readJson(manifestPath);
if (manifest.format !== "gwl-blc-curve-approvals-v1") fail("Unbekanntes Freigabeformat.");
if (manifest.version !== "1.0") fail("Unbekannte Freigabeversion.");
if (!Array.isArray(manifest.approvedCurves)) fail("approvedCurves muss ein Array sein.");
for (const field of Object.keys(manifest)) {
  if (!allowedTopFields.has(field)) fail(`Unbekanntes Feld im Manifest: ${field}`);
}

const knowledgeIndex = await readJson(indexPath);
const indexedSources = new Set();
for (const boundary of knowledgeIndex.systemBoundaries || []) {
  for (const group of boundary.groups || []) {
    for (const item of group.items || []) {
      if (item.source) indexedSources.add(item.source);
    }
  }
}
indexedSources.add("data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json");

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
  if (!entry.boundaryId || !entry.itemId || !entry.seriesId) fail(`${entry.curveId}: Pflichtfelder fehlen.`);

  if (entry.kind === "knowledge") {
    if (!indexedSources.has(entry.source)) fail(`${entry.curveId}: Knowledge-Quelle ist nicht im freigegebenen Index.`);
    if (!entry.source.startsWith("data/knowledge/") || entry.source.includes("..")) fail(`${entry.curveId}: Unzulässiger Quellpfad.`);
    const expectedId = `knowledge:${entry.source}#${entry.seriesId}`;
    if (entry.curveId !== expectedId) fail(`${entry.curveId}: curveId stimmt nicht mit Quelle und Reihe überein.`);
    const payload = await readJson(path.join(projectRoot, ...entry.source.split("/")));
    const series = (payload.timeSeries || []).find(candidate => candidate.id === entry.seriesId);
    if (!series) fail(`${entry.curveId}: Beobachtungsreihe wurde nicht gefunden.`);
    if (numericPoints(series).length < 2) fail(`${entry.curveId}: Mindestens zwei Beobachtungspunkte sind erforderlich.`);
    continue;
  }

  if (entry.kind === "legacy") {
    if (entry.source !== "data.js") fail(`${entry.curveId}: Legacy-Quelle muss data.js sein.`);
    const expectedId = `legacy:data.js#${entry.boundaryId}/${entry.itemId}`;
    if (entry.curveId !== expectedId || entry.seriesId !== entry.itemId) fail(`${entry.curveId}: Legacy-ID ist inkonsistent.`);
    const boundary = (legacyData?.boundaries || []).find(candidate => candidate.id === entry.boundaryId);
    const item = (boundary?.items || []).find(candidate => candidate.id === entry.itemId);
    if (!item) fail(`${entry.curveId}: Legacy-Kurve wurde nicht gefunden.`);
    if (numericPoints({ points: item.timePoints }).length < 2) fail(`${entry.curveId}: Mindestens zwei Beobachtungspunkte sind erforderlich.`);
    continue;
  }

  fail(`${entry.curveId}: kind muss knowledge oder legacy sein.`);
}

console.log(`BLC-Freigaben gültig: ${manifest.approvedCurves.length} Kurve(n).`);
