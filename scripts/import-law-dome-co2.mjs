import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const inputPath = process.argv[2];
if (!inputPath) throw new Error("Pfad zu law2018splines-noaa.txt fehlt.");
const sourceText = await fs.readFile(inputPath, "utf8");
const values = sourceText.split(/\r?\n/)
  .filter(line => line && !line.startsWith("#") && !line.startsWith("age_gas"))
  .map(line => line.trim().split(/\s+/))
  .map(columns => ({ year: Number(columns[0]), value: Number(columns[1]) }))
  .filter(point => point.year >= 1700 && point.year <= 1996);
if (values.length !== 297 || values[0]?.year !== 1700 || values.at(-1)?.year !== 1996 || values.some(point => !Number.isFinite(point.value))) throw new Error("Unerwarteter Law-Dome-Datenausschnitt.");

const knowledgePath = path.join(projectRoot, "data", "knowledge", "gwl_climate_change_pilot_v0.1.json");
const knowledge = JSON.parse(await fs.readFile(knowledgePath, "utf8"));
const series = knowledge.timeSeries.find(item => item.id === "global_co2_noaa_annual");
if (!series) throw new Error("global_co2_noaa_annual fehlt.");
series.historicalSeries = [{
  id: "law_dome_co2_20yr_spline_1700_1996",
  label: "Law-Dome-CO₂-Rekonstruktion · 20-Jahres-Spline",
  period: "1700–1996",
  method: "Veröffentlichter 20-Jahres-Spline aus age_gas und CO2spl",
  uncertainty: "Für 1700–1850 kann die zusätzliche Inter-Core-Variabilität laut Rubino et al. (2019) bis zu etwa 5 ppm betragen.",
  sourceRefs: ["src_noaa_law_dome_2018", "src_rubino_2019"],
  values
}];
const additions = [{
  id: "src_noaa_law_dome_2018", title: "Law Dome, Antarctica 2000 Year Ice Core CO₂, CH₄, N₂O and d13C-CO₂ Data — Spline Fits", authors: "Rubino et al.", publisher: "NOAA/NCEI / World Data Service for Paleoclimatology", year: 2018, type: "official_paleoclimate_dataset", url: "https://www.ncei.noaa.gov/pub/data/paleo/icecore/antarctica/law/law2018splines-noaa.txt", doi: "10.25921/dwg2-6m61", accessed: "2026-09-04", access: "open_data"
}, {
  id: "src_rubino_2019", title: "Revised records of atmospheric trace gases CO₂, CH₄, N₂O and δ13C-CO₂ over the last 2000 years from Law Dome, Antarctica", authors: "Rubino et al.", publisher: "Earth System Science Data", year: 2019, type: "peer_reviewed_publication", url: "https://doi.org/10.5194/essd-11-473-2019", doi: "10.5194/essd-11-473-2019", accessed: "2026-09-04", access: "open_full_text"
}];
knowledge.sources = knowledge.sources.filter(source => !additions.some(item => item.id === source.id));
knowledge.sources.push(...additions);
await fs.writeFile(knowledgePath, `${JSON.stringify(knowledge, null, 2)}\n`, "utf8");
console.log(`Law-Dome-Rekonstruktion importiert: ${values.length} Werte (${values[0].year}–${values.at(-1).year}).`);
