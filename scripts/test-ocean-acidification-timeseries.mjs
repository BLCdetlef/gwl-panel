import fs from "node:fs/promises";

const source = JSON.parse(await fs.readFile("data/knowledge/gwl_ocean_acidification_v0.1.json", "utf8"));
const series = source.timeSeries.find(candidate => candidate.id === "global_surface_omega_arag_oceansoda_1982_2021");
if (!series) throw new Error("OceanSODA-Kernkurve fehlt.");
if (series.points.length !== 40 || series.points[0].year !== 1982 || series.points.at(-1).year !== 2021) throw new Error("OceanSODA-Abdeckung ist inkonsistent.");
if (series.historicalSeries?.[0]?.points.length !== 15 || series.historicalSeries[0].points.at(-1).year !== 1980) throw new Error("NOAA-Rekonstruktion ist inkonsistent.");
if (series.methodBreaks?.[0]?.year !== 1982) throw new Error("Methodenwechsel 1982 fehlt.");
if (!series.uncertainty.includes("±0,014") || !series.uncertainty.includes("±0,005") || !series.uncertainty.includes("Niveauanschluss")) throw new Error("Anschlussunsicherheit ist nicht vollständig dokumentiert.");
const mean = series.points.reduce((sum, point) => sum + point.value, 0) / series.points.length;
if (Math.abs(mean - 3.11) > 1e-6) throw new Error(`OceanSODA-Periodenmittel weicht ab: ${mean}`);
const historicalEnd = series.historicalSeries[0].points.at(-1);
if (Math.abs(historicalEnd.value - series.points[0].value) < 0.05) throw new Error("Der Niveauabstand wurde unerwartet entfernt oder verdeckt.");
console.log("Ozeanversauerungs-Kurventest gültig: getrennte NOAA-/OceanSODA-Reihen, Methodenwechsel und Anschlussunsicherheit geprüft.");
