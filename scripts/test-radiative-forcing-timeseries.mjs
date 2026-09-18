import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const knowledge = JSON.parse(await fs.readFile(path.join(root, "data", "knowledge", "gwl_climate_radiative_forcing_global_v0.1.json"), "utf8"));
const exported = JSON.parse(await fs.readFile(path.join(root, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const series = knowledge.timeSeries?.find(item => item.id === "global_anthropogenic_erf_1750_2025");
if (!series || series.dataNature !== "assessed_model_estimate") throw new Error("IGCC-Reihe muss als wissenschaftliche Schätzreihe gekennzeichnet sein.");
if (series.points.length !== 276 || series.points[0].year !== 1750 || series.points.at(-1).year !== 2025) throw new Error("IGCC-Zeitabdeckung muss 1750–2025 mit 276 Jahreswerten umfassen.");
if (series.points.at(-1).value !== 3.103549 || !series.points.at(-1).uncertainty.includes("2,35 bis 3,83")) throw new Error("IGCC-Bestwert oder 5–95-%-Bereich für 2025 stimmt nicht.");
if (series.reference?.value !== 1 || series.highRisk?.value !== 1.5) throw new Error("Grenzwert und hoher Risikobereich fehlen.");
const curve = exported.curves.find(item => item.seriesId === series.id);
if (!curve || curve.curveRole !== "core" || curve.domainId !== "climate_change" || curve.dataNature !== "assessed_model_estimate") throw new Error("Strahlungsantrieb fehlt als Klimakernkurve im BLC-Export.");
if (curve.displayDerivation.observations.intervalYears !== 20 || curve.displayObservations.length !== 14) throw new Error("Schätzreihe muss im 20-Jahres-Raster dargestellt werden.");
if (curve.thresholdAssessments.boundary.firstCrossingPoint?.year !== 1986 || curve.thresholdAssessments.highRisk.firstCrossingPoint?.year !== 1996) throw new Error("Belegte erste Grenzübertritte fehlen.");
const original = new Set(curve.observations.map(point => `${point.year}:${point.value}`));
if (curve.displayObservations.some(point => !original.has(`${point.year}:${point.value}`))) throw new Error("Darstellung enthält einen erfundenen Zwischenwert.");
console.log("IGCC-Strahlungsantrieb gültig: 276 Schätzwerte, 20-Jahres-Darstellung, Unsicherheit und Grenzübertritte geprüft.");
