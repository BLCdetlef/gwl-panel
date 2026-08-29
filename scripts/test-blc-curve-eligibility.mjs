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
    expected: false
  },
  {
    source: "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json",
    seriesId: "blue_water_streamflow",
    expected: true
  },
  {
    source: "data/knowledge/gwl_land_system_change_pilot_v0.1.json",
    seriesId: "global_forest_cover_1992_2022",
    expected: false
  }
];

function eligibility(series) {
  const points = series?.points || series?.values || [];
  const years = [...new Set(points
    .filter(point => Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value)))
    .map(point => Number(point.year)))].sort((a, b) => a - b);
  const spanYears = years.length ? years.at(-1) - years[0] : 0;
  return { eligible: years.length >= 5 && spanYears >= 50, pointCount: years.length, spanYears };
}

for (const testCase of cases) {
  const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...testCase.source.split("/")), "utf8"));
  const series = (payload.timeSeries || []).find(candidate => candidate.id === testCase.seriesId);
  if (!series) throw new Error(`${testCase.seriesId}: Testreihe fehlt.`);
  const result = eligibility(series);
  if (result.eligible !== testCase.expected) {
    throw new Error(`${testCase.seriesId}: erwartet ${testCase.expected}, erhalten ${result.eligible}.`);
  }
  console.log(`${result.eligible ? "freigabefähig" : "gesperrt"}: ${testCase.seriesId} · ${result.pointCount} Punkte · ${result.spanYears} Jahre`);
}
