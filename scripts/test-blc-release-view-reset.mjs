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

console.log("BLC-Ansichtswechsel gültig: Knowledge-Ansichten übernehmen keine zuvor sichtbare Kurvenfreigabe.");
