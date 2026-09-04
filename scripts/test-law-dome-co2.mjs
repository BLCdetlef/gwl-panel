import fs from "node:fs/promises";
import path from "node:path";
import { normalizeHistorical } from "./build-blc-curve-export.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const knowledgePath = path.join(projectRoot, "data", "knowledge", "gwl_climate_change_pilot_v0.1.json");
const exportPath = path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const knowledge = JSON.parse(await fs.readFile(knowledgePath, "utf8"));
const curveExport = JSON.parse(await fs.readFile(exportPath, "utf8"));
const series = knowledge.timeSeries.find(item => item.id === "global_co2_noaa_annual");
if (!series) throw new Error("global_co2_noaa_annual fehlt.");
if (series.period !== "1979–2025" || series.points.length !== 47 || series.points[0].value !== 336.85 || series.points.at(-1).value !== 425.62) throw new Error("Direkte NOAA-Reihe wurde verändert.");
if ((knowledge.projectionSeries || []).length !== 5) throw new Error("CO₂-Projektionen wurden verändert.");
const historical = series.historicalSeries?.find(item => item.id === "law_dome_co2_20yr_spline_1700_1996");
if (!historical || historical.values.length !== 297) throw new Error("Law-Dome-Rekonstruktion muss 297 Werte enthalten.");
for (let index = 0; index < historical.values.length; index += 1) {
  if (historical.values[index].year !== 1700 + index || !Number.isFinite(historical.values[index].value)) throw new Error("Law-Dome-Jahresfolge ist lückenhaft oder ungültig.");
}
if (historical.values[0].value !== 275.86 || historical.values.at(-1).value !== 359.38) throw new Error("Law-Dome-Randwerte stimmen nicht mit CO2spl überein.");
if (historical.method !== "Veröffentlichter 20-Jahres-Spline aus age_gas und CO2spl") throw new Error("Spline-Methode fehlt.");
if (!historical.uncertainty.includes("1700–1850") || !historical.uncertainty.includes("5 ppm")) throw new Error("Inter-Core-Unsicherheit fehlt.");
if (JSON.stringify(historical.sourceRefs) !== JSON.stringify(["src_noaa_law_dome_2018", "src_rubino_2019"])) throw new Error("Quellenbezug der Rekonstruktion ist unvollständig.");
const sources = new Map(knowledge.sources.map(source => [source.id, source]));
if (sources.get("src_noaa_law_dome_2018")?.doi !== "10.25921/dwg2-6m61" || sources.get("src_rubino_2019")?.doi !== "10.5194/essd-11-473-2019") throw new Error("Datensatz- oder Publikations-DOI fehlt.");
for (const id of historical.sourceRefs) if (sources.get(id)?.accessed !== "2026-09-04") throw new Error(`${id}: Abrufdatum fehlt.`);
const blcHistorical = normalizeHistorical(series, series.points[0].year)[0];
if (blcHistorical.points.length !== 279 || blcHistorical.points.at(-1).year !== 1978 || series.points[0].year !== 1979) throw new Error("BLC-Überlappungsregel ist nicht erfüllt.");
if (blcHistorical.period !== "1700–1996" || !blcHistorical.uncertainty.includes("5 ppm")) throw new Error("BLC-Rekonstruktionsmetadaten fehlen.");
const exportedCo2 = curveExport.curves.find(curve => curve.seriesId === "global_co2_noaa_annual");
if (!exportedCo2 || exportedCo2.curveRole !== "core" || exportedCo2.domainId !== "climate_change") throw new Error("Freigegebene CO₂-Kurve fehlt im BLC-Export.");
if (exportedCo2.observations.length !== 47 || exportedCo2.observations[0].year !== 1979 || exportedCo2.observations.at(-1).year !== 2025) throw new Error("Direkte NOAA-Reihe ist im BLC-Export unvollständig.");
if (exportedCo2.historicalReconstruction.length !== 1 || exportedCo2.historicalReconstruction[0].points.length !== 279 || exportedCo2.historicalReconstruction[0].points.at(-1).year !== 1978) throw new Error("Law-Dome-Rekonstruktion ist im BLC-Export nicht überlappungsfrei.");
if (exportedCo2.projections.length !== 5) throw new Error("CO₂-Projektionen fehlen im BLC-Export.");
console.log("Law-Dome-CO₂-Datentest gültig: 297 Rekonstruktionswerte, Quellen, Unsicherheit und BLC-Schnitt geprüft.");
