import fs from "node:fs";

const payload = JSON.parse(fs.readFileSync(new URL("../data/blc/blc-curve-export-v1.json", import.meta.url), "utf8"));
const requiredFields = ["sourceFile", "sourceUrl", "locator", "fields", "extraction", "transformation"];

function assertProvenance(provenance, label) {
  if (!provenance || typeof provenance !== "object") throw new Error(`${label}: Provenienz fehlt.`);
  for (const field of requiredFields) {
    if (field === "fields") {
      if (!Array.isArray(provenance.fields) || !provenance.fields.length || provenance.fields.some(value => typeof value !== "string" || !value.trim())) {
        throw new Error(`${label}: fields ist leer oder ungültig.`);
      }
    } else if (typeof provenance[field] !== "string" || !provenance[field].trim()) {
      throw new Error(`${label}: ${field} fehlt.`);
    }
  }
}

const coreCurves = payload.curves.filter(curve => curve.curveRole === "core");
if (coreCurves.length !== 9) throw new Error(`Unerwartete Zahl von Kernkurven: ${coreCurves.length}.`);

for (const curve of coreCurves) {
  assertProvenance(curve.observationProvenance, `${curve.seriesId} / Hauptreihe`);
  for (const segment of curve.historicalReconstruction || []) {
    assertProvenance(segment.provenance, `${curve.seriesId} / Rekonstruktion ${segment.id}`);
  }
  for (const segment of curve.projections || []) {
    assertProvenance(segment.provenance, `${curve.seriesId} / Modellierung ${segment.id}`);
  }
}

console.log(`Kernkurven-Provenienz gültig: ${coreCurves.length} Hauptreihen und alle Rekonstruktions-/Modellsegmente vollständig dokumentiert.`);
