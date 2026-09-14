import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const appSource = await fs.readFile(path.join(projectRoot, "app.js"), "utf8");

function getFunctionBody(name) {
  const signature = `function ${name}(`;
  const start = appSource.indexOf(signature);
  if (start < 0) throw new Error(`${name}: Funktion fehlt.`);
  const bodyStart = appSource.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    if (appSource[index] === "{") depth += 1;
    if (appSource[index] === "}") depth -= 1;
    if (depth === 0) return appSource.slice(bodyStart + 1, index);
  }
  throw new Error(`${name}: Funktionsende fehlt.`);
}

const body = getFunctionBody("applyKnowledgeToStandardEffect");
const resetPosition = body.indexOf("setBlcReleaseControl();");
const seriesPosition = body.indexOf("getActiveKnowledgeSeries(network)");
const eligibleRenderPosition = body.indexOf("renderKnowledgeTime(network)");

if (resetPosition < 0) throw new Error("Knowledge-Ansichten setzen eine zuvor sichtbare BLC-Freigabe nicht zurück.");
if (resetPosition > seriesPosition || resetPosition > eligibleRenderPosition) {
  throw new Error("Die BLC-Freigabe wird erst nach der Prüfung der neuen Knowledge-Ansicht zurückgesetzt.");
}

for (const source of [
  "data/knowledge/gwl_nitrat_pilot_v0.2.json",
  "data/knowledge/gwl_phosphor_pilot_v0.1.json"
]) {
  const payload = JSON.parse(await fs.readFile(path.join(projectRoot, ...source.split("/")), "utf8"));
  if (payload.timeSeries?.some(series => (series.points || series.values || []).length)) {
    throw new Error(`${source}: Testannahme verletzt; die Vertiefung besitzt inzwischen eine Zeitreihe.`);
  }
}

console.log("BLC-Ansichtswechsel gültig: Vertiefungen ohne Zeitreihe übernehmen keine vorherige Kurvenfreigabe.");
