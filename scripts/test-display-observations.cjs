const payload = require("../data/blc/blc-curve-export-v1.json");

function pointKey(point) {
  return `${Number(point.year)}:${Number(point.value)}`;
}

function checkDisplaySegments(curve, fullSegments, displaySegments, label) {
  if (!Array.isArray(displaySegments) || displaySegments.length !== fullSegments.length) throw new Error(`${curve.seriesId}: ${label} unvollständig.`);
  const fullById = new Map(fullSegments.map(segment => [segment.id, segment]));
  for (const segment of displaySegments) {
    const full = fullById.get(segment.id);
    if (!full) throw new Error(`${curve.seriesId}: unbekanntes Segment ${segment.id}.`);
    const originals = new Set(full.points.map(pointKey));
    if (segment.points.some(point => !originals.has(pointKey(point)))) throw new Error(`${curve.seriesId}: ${label} enthält erzeugte Zwischenwerte.`);
    if (pointKey(segment.points[0]) !== pointKey(full.points[0]) || pointKey(segment.points.at(-1)) !== pointKey(full.points.at(-1))) throw new Error(`${curve.seriesId}: Randwert in ${label} fehlt.`);
    for (let index = 1; index < segment.points.length; index += 1) {
      const gap = segment.points[index].year - segment.points[index - 1].year;
      if (gap < 20 && !(index === 1 && segment.points.length === 2)) throw new Error(`${curve.seriesId}: 20-Jahres-Abstand in ${label} verletzt.`);
    }
  }
}

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
  const minimumGap = curve.dataNature === "observed" ? 5 : 20;
  for (let index = 1; index < displayYears.length; index += 1) {
    const previous = displayYears[index - 1];
    const current = displayYears[index];
    if (current - previous < minimumGap && !(mandatory.has(previous) && mandatory.has(current))) throw new Error(`${curve.seriesId}: Mindestabstand zwischen ${previous} und ${current} verletzt.`);
  }
  checkDisplaySegments(curve, curve.historicalReconstruction, curve.displayHistoricalReconstruction, "Rekonstruktionsdarstellung");
  checkDisplaySegments(curve, curve.projections, curve.displayProjections, "Modelldarstellung");
  if (curve.displayDerivation?.interpolation !== false || curve.displayDerivation?.transformations?.length) throw new Error(`${curve.seriesId}: Herleitung muss Interpolation und Transformation ausschließen.`);
}

const ocean = payload.curves.find(curve => curve.seriesId === "global_surface_omega_arag_oceansoda_1982_2021");
if (ocean.observations.length !== 40 || ocean.displayObservations.length >= ocean.observations.length) throw new Error("OceanSODA muss vollständig erhalten und für die Punktdarstellung ausgedünnt sein.");
console.log(`Darstellungsreihen gültig: direkte Messreihen im 5-Jahres-, wissenschaftliche Schätzreihen, Rekonstruktionen und Modelle im 20-Jahres-Raster; nur vorhandene Werte, Herleitung geprüft.`);
