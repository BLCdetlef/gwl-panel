import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));

const cases = [
  {
    source: "data/knowledge/gwl_biosphere_functional_integrity_v0.1.json",
    seriesId: "biosphere_hanpp_1910_2020",
    expected: true
  },
  {
    source: "data/knowledge/gwl_climate_change_pilot_v0.1.json",
    seriesId: "global_co2_noaa_annual",
    expected: true
  },
  {
    source: "data/knowledge/gwl_climate_temperature_global_v0.1.json",
    seriesId: "global_surface_temperature_hadcrut5_annual",
    expected: true
  },
  {
    source: "data/knowledge/gwl_climate_temperature_ocean_v0.1.json",
    seriesId: "global_sea_surface_temperature_hadsst4_annual",
    expected: true
  },
  {
    source: "data/knowledge/gwl_climate_temperature_land_v0.1.json",
    seriesId: "global_land_air_temperature_crutem5_annual",
    expected: true
  },
  {
    source: "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json",
    seriesId: "green_water_rootzone_soil_moisture",
    expected: true
  },
  {
    source: "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json",
    seriesId: "blue_water_streamflow",
    expected: true
  },
  {
    source: "data/knowledge/gwl_nutrient_cycles_nitrogen_v0.2.json",
    seriesId: "nitrogen_fixation_1961_2022",
    expected: true
  },
  {
    source: "data/knowledge/gwl_nutrient_cycles_phosphorus_v0.2.json",
    seriesId: "phosphorus_cropland_1961_2022",
    expected: true
  },
  {
    source: "data/knowledge/gwl_land_system_change_pilot_v0.1.json",
    seriesId: "global_forest_cover_1992_2022",
    expected: true
  },
  {
    source: "data/knowledge/gwl_ocean_acidification_v0.1.json",
    seriesId: "global_surface_omega_arag_oceansoda_1982_2021",
    expected: true
  },
  {
    source: "data/knowledge/gwl_pfas_pope_global_v0.1.json",
    seriesId: "global_pfoa_air_emissions_pope_1951_2020",
    expected: true
  },
  {
    source: "data/knowledge/gwl_pesticides_global_v0.1.json",
    seriesId: "global_pesticide_use_fao_annual",
    coverageExceptionRuleId: "blc_documented_single_year_coverage_exception",
    expected: true
  }
];

function eligibility(series, coverageExceptionRuleId) {
  const points = series?.points || series?.values || [];
  const years = [...new Set(points
    .filter(point => Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value)))
    .map(point => Number(point.year)))].sort((a, b) => a - b);
  const historicalYears = (series?.historicalSeries || series?.historicalSegments || []).flatMap(segment => (segment.points || segment.values || []).map(point => Number(point.year)).filter(Number.isFinite));
  const spanYears = years.length ? years.at(-1) - Math.min(years[0], ...historicalYears) : 0;
  const documentedSingleYearException = spanYears === 49
    && coverageExceptionRuleId === "blc_documented_single_year_coverage_exception";
  return { eligible: years.length >= 5 && (spanYears >= 50 || documentedSingleYearException), pointCount: years.length, spanYears };
}

const syntheticCases = [
  {
    label: "Rekonstruktion ersetzt keine fünf Beobachtungspunkte",
    series: { points: [2000, 2001, 2002, 2003].map(year => ({ year, value: 1 })), historicalSeries: [{ values: [{ year: 1900, value: 1 }] }] },
    expected: false
  },
  {
    label: "Gemeinsame Abdeckung unter 50 Jahren",
    series: { points: [2000, 2005, 2010, 2015, 2020].map(year => ({ year, value: 1 })), historicalSeries: [{ values: [{ year: 1971, value: 1 }] }] },
    expected: false
  },
  {
    label: "Projektion zählt nicht zur Abdeckung",
    series: { points: [2000, 2005, 2010, 2015, 2020].map(year => ({ year, value: 1 })), projectionSeries: [{ points: [{ year: 2100, value: 1 }] }] },
    expected: false
  },
  {
    label: "Rekonstruktion plus fünf Beobachtungspunkte erfüllen 50 Jahre",
    series: { points: [2000, 2005, 2010, 2015, 2020].map(year => ({ year, value: 1 })), historicalSeries: [{ values: [{ year: 1970, value: 1 }] }] },
    expected: true
  },
  {
    label: "Dokumentierte Ausnahme erlaubt genau 49 Jahre",
    series: { points: [2000, 2005, 2010, 2015, 2020].map(year => ({ year, value: 1 })), historicalSeries: [{ values: [{ year: 1971, value: 1 }] }] },
    coverageExceptionRuleId: "blc_documented_single_year_coverage_exception",
    expected: true
  },
  {
    label: "Dokumentierte Ausnahme erlaubt keine 48 Jahre",
    series: { points: [2000, 2005, 2010, 2015, 2020].map(year => ({ year, value: 1 })), historicalSeries: [{ values: [{ year: 1972, value: 1 }] }] },
    coverageExceptionRuleId: "blc_documented_single_year_coverage_exception",
    expected: false
  }
];

for (const testCase of syntheticCases) {
  const result = eligibility(testCase.series, testCase.coverageExceptionRuleId);
  if (result.eligible !== testCase.expected) throw new Error(`${testCase.label}: erwartet ${testCase.expected}, erhalten ${result.eligible}.`);
}

for (const testCase of cases) {
  const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...testCase.source.split("/")), "utf8"));
  const series = (payload.timeSeries || []).find(candidate => candidate.id === testCase.seriesId);
  if (!series) throw new Error(`${testCase.seriesId}: Testreihe fehlt.`);
  const result = eligibility(series, testCase.coverageExceptionRuleId);
  if (result.eligible !== testCase.expected) {
    throw new Error(`${testCase.seriesId}: erwartet ${testCase.expected}, erhalten ${result.eligible}.`);
  }
  console.log(`${result.eligible ? "freigabefähig" : "gesperrt"}: ${testCase.seriesId} · ${result.pointCount} Punkte · ${result.spanYears} Jahre`);
}
