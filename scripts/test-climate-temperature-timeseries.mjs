import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const cases = [
  {
    file: "gwl_climate_temperature_global_v0.1.json",
    id: "global_surface_temperature_hadcrut5_annual",
    firstYear: 1850,
    count: 176,
    latest: 1.04803,
    sourceFile: "HadCRUT.5.1.0.0.analysis.summary_series.global.annual.csv"
  },
  {
    file: "gwl_climate_temperature_ocean_v0.1.json",
    id: "global_sea_surface_temperature_hadsst4_annual",
    firstYear: 1850,
    count: 176,
    latest: 0.839189,
    sourceFile: "HadSST.4.2.0.0_annual_GLOBE.csv"
  },
  {
    file: "gwl_climate_temperature_land_v0.1.json",
    id: "global_land_air_temperature_crutem5_annual",
    firstYear: 1857,
    count: 169,
    latest: 1.432146,
    sourceFile: "CRUTEM.5.1.0.0.summary_series.global.annual.csv"
  }
];

const approvals = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "curve-approvals-v1.json"), "utf8"));
const exported = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));

for (const testCase of cases) {
  const source = `data/knowledge/${testCase.file}`;
  const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8"));
  const series = payload.timeSeries?.find(candidate => candidate.id === testCase.id);
  if (!series) throw new Error(`${testCase.id}: Reihe fehlt.`);
  if (series.dataNature !== "observed" || series.worseningDirection !== "increase") throw new Error(`${testCase.id}: Datenart oder Richtung fehlt.`);
  if (series.reference?.type !== "none" || !series.reference?.display?.includes("kein eigenständiger planetarer Grenzwert")) throw new Error(`${testCase.id}: Abgrenzung vom planetaren Grenzwert fehlt.`);
  if (series.points.length !== testCase.count || series.points[0].year !== testCase.firstYear || series.points.at(-1).year !== 2025) throw new Error(`${testCase.id}: Zeitabdeckung stimmt nicht.`);
  if (Math.abs(series.points.at(-1).value - testCase.latest) > 0.000001) throw new Error(`${testCase.id}: 2025-Wert stimmt nicht.`);
  if (series.points.some(point => point.year === 2026)) throw new Error(`${testCase.id}: unvollständiges Kalenderjahr 2026 wurde übernommen.`);
  if (series.provenance?.sourceFile !== testCase.sourceFile || !series.provenance?.fields?.length || !series.provenance?.transformation?.includes("keine Interpolation")) throw new Error(`${testCase.id}: Provenienz unvollständig.`);
  const approval = approvals.approvedCurves.find(entry => entry.seriesId === testCase.id);
  if (!approval || approval.curveRole !== "deep_dive") throw new Error(`${testCase.id}: BLC-Freigabe als Vertiefung fehlt.`);
  const curve = exported.curves.find(entry => entry.seriesId === testCase.id);
  if (!curve || curve.curveRole !== "deep_dive" || curve.reference) throw new Error(`${testCase.id}: BLC-Export fehlt oder enthält fälschlich einen Grenzwert.`);
  if (curve.displayObservations.some((point, index, points) => index > 0 && index < points.length - 1 && point.year - points[index - 1].year < 5)) throw new Error(`${testCase.id}: sichtbare BLC-Punkte liegen dichter als fünf Jahre.`);
}

console.log("Klimawandel-Vertiefungen gültig: globale Oberfläche, Meeresoberfläche und Landluft mit Herkunft, Unsicherheit und BLC-Rolle geprüft.");
