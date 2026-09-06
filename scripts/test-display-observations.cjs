const payload = require("../data/blc/blc-curve-export-v1.json");

for (const curve of payload.curves) {
  const fullYears = curve.observations.map(point => Number(point.year));
  const displayYears = curve.displayObservations.map(point => Number(point.year));
  const mandatory = new Set([
    fullYears[0],
    fullYears.at(-1),
    curve.thresholdAssessments.boundary.firstCrossingPoint?.year,
    curve.thresholdAssessments.highRisk.firstCrossingPoint?.year
  ].filter(Number.isFinite));
  for (const year of mandatory) if (!displayYears.includes(year)) throw new Error(`${curve.seriesId}: Pflichtjahr ${year} fehlt.`);
  for (const year of displayYears) if (!fullYears.includes(year)) throw new Error(`${curve.seriesId}: ${year} ist kein Originalpunkt.`);
  for (let index = 1; index < displayYears.length; index += 1) {
    const previous = displayYears[index - 1];
    const current = displayYears[index];
    if (current - previous < 5 && !(mandatory.has(previous) && mandatory.has(current))) throw new Error(`${curve.seriesId}: Mindestabstand zwischen ${previous} und ${current} verletzt.`);
  }
}

const ocean = payload.curves.find(curve => curve.seriesId === "global_surface_omega_arag_oceansoda_1982_2021");
if (ocean.observations.length !== 40 || ocean.displayObservations.length >= ocean.observations.length) throw new Error("OceanSODA muss vollständig erhalten und für die Punktdarstellung ausgedünnt sein.");
console.log(`Darstellungsreihen gültig: OceanSODA ${ocean.observations.length} Originalwerte → ${ocean.displayObservations.length} sichtbare Punkte; Mindestabstand und Pflichtpunkte geprüft.`);
