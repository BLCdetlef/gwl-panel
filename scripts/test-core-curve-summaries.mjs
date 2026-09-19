import fs from "node:fs";

const root = new URL("../", import.meta.url);
const approvals = JSON.parse(fs.readFileSync(new URL("data/blc/curve-approvals-v1.json", root), "utf8"));
const coreCurves = approvals.approvedCurves.filter(curve => curve.curveRole === "core" && curve.status === "approved");

if (coreCurves.length !== 9) {
  throw new Error(`Unerwartete Zahl freigegebener Kernkurven: ${coreCurves.length}.`);
}

for (const curve of coreCurves) {
  const network = JSON.parse(fs.readFileSync(new URL(curve.source, root), "utf8"));
  const series = (network.timeSeries || []).find(entry => entry.id === curve.seriesId);
  const summary = series?.effectSummary || network.presentation?.effectSummary;
  if (typeof summary !== "string" || !summary.trim()) {
    throw new Error(`${curve.seriesId}: Fließtext für die Kernbeitragskarte fehlt.`);
  }
}

console.log(`Kernkurven-Karten gültig: ${coreCurves.length} freigegebene Kernkurven besitzen einen Fließtext.`);
