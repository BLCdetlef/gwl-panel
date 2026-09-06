const payload = require("../data/blc/blc-curve-export-v1.json");

const expected = new Map([
  ["biosphere_hanpp_1910_2020", ["already_crossed_at_start", 1910, "crossed", 1970]],
  ["global_co2_noaa_annual", ["crossed", 1988, "not_crossed", null]],
  ["blue_water_streamflow", ["already_crossed_at_start", 1905, "not_crossed", null]],
  ["global_forest_cover_1992_2022", ["already_crossed_at_start", 1992, "not_crossed", null]],
  ["global_surface_omega_arag_oceansoda_1982_2021", ["series_ends_before_known_crossing", null, "not_crossed", null]]
]);

if (payload.curves.length !== expected.size) throw new Error("Es werden genau fünf Kernkurven erwartet.");
for (const curve of payload.curves) {
  const wanted = expected.get(curve.seriesId);
  if (!wanted) throw new Error(`${curve.seriesId}: unerwartete Kurve.`);
  const boundary = curve.thresholdAssessments?.boundary;
  const highRisk = curve.thresholdAssessments?.highRisk;
  if (boundary?.status !== wanted[0] || (boundary.firstCrossingPoint?.year ?? null) !== wanted[1]) throw new Error(`${curve.seriesId}: unerwarteter Grenzstatus.`);
  if (highRisk?.status !== wanted[2] || (highRisk.firstCrossingPoint?.year ?? null) !== wanted[3]) throw new Error(`${curve.seriesId}: unerwarteter Hochrisikostatus.`);
}

const ocean = payload.curves.find(curve => curve.seriesId === "global_surface_omega_arag_oceansoda_1982_2021");
if (ocean.thresholdAssessments.boundary.lastCheckedPoint.year !== 2021 || ocean.thresholdAssessments.boundary.knownCrossingPoint.year !== 2025) {
  throw new Error("Ozeanversauerung muss Reihenende 2021 und separat belegte Überschreitung 2025 unterscheiden.");
}

console.log("Grenzstatus gültig: fünf Kernkurven, Erstüberschreitungen und Sonderfall Ozean 2021/2025 geprüft.");
