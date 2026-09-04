import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { requireBlcCurveRole } from "./lib/blc-curve-roles.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "curve-approvals-v1.json"), "utf8"));
const curveExport = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));

function expectFailure(entry, pattern) {
  try {
    requireBlcCurveRole(entry, "Testkurve");
  } catch (error) {
    if (pattern.test(error.message)) return;
    throw error;
  }
  throw new Error(`Erwarteter Rollenfehler ${pattern} blieb aus.`);
}

if (requireBlcCurveRole({ curveRole: "core" }, "Kernkurve") !== "core") throw new Error("core wurde nicht akzeptiert.");
if (requireBlcCurveRole({ curveRole: "deep_dive" }, "Vertiefung") !== "deep_dive") throw new Error("deep_dive wurde nicht akzeptiert.");
expectFailure({}, /curveRole fehlt/);
expectFailure({ curveRole: "primary" }, /unbekannte curveRole primary/);

const validatorPath = path.join(projectRoot, "scripts", "validate-blc-curve-approvals.mjs");
const fixtureDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "gwl-blc-role-test-"));
async function validateManifestFixture(name, mutate, expected) {
  const fixture = structuredClone(manifest);
  mutate(fixture);
  const fixturePath = path.join(fixtureDirectory, `${name}.json`);
  await fs.writeFile(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
  const result = spawnSync(process.execPath, [validatorPath, fixturePath], { cwd: projectRoot, encoding: "utf8" });
  const output = `${result.stdout}\n${result.stderr}`;
  if (expected.success && result.status !== 0) throw new Error(`${name}: gültiges Manifest wurde abgelehnt.\n${output}`);
  if (!expected.success && (result.status === 0 || !expected.pattern.test(output))) throw new Error(`${name}: erwarteter Validatorfehler blieb aus.\n${output}`);
}

try {
  await validateManifestFixture("deep-dive-valid", fixture => { fixture.approvedCurves[0].curveRole = "deep_dive"; }, { success: true });
  await validateManifestFixture("role-missing", fixture => { delete fixture.approvedCurves[0].curveRole; }, { success: false, pattern: /curveRole fehlt/ });
  await validateManifestFixture("role-unknown", fixture => { fixture.approvedCurves[0].curveRole = "primary"; }, { success: false, pattern: /unbekannte curveRole primary/ });
} finally {
  await fs.rm(fixtureDirectory, { recursive: true, force: true });
}

if (manifest.format !== "gwl-blc-curve-approvals-v1" || manifest.version !== "1.1") throw new Error("Freigabemanifest muss Version 1.1 verwenden.");
if (curveExport.format !== "gwl-blc-curve-export-v1" || curveExport.version !== "1.5") throw new Error("Kurvenexport muss Version 1.5 verwenden.");
if (curveExport.manifestVersion !== manifest.version) throw new Error("Manifestversion ging im Export verloren.");

const expected = new Map([
  ["biosphere_hanpp_1910_2020", { curveRole: "core", domainType: "planetary_boundary", domainId: "biosphere_integrity", domainLabel: "Biosphärenintegrität" }],
  ["global_co2_noaa_annual", { curveRole: "core", domainType: "planetary_boundary", domainId: "climate_change", domainLabel: "Klimawandel" }],
  ["blue_water_streamflow", { curveRole: "core", domainType: "planetary_boundary", domainId: "freshwater_change", domainLabel: "Süßwasser" }]
]);

if (manifest.approvedCurves.length !== expected.size || curveExport.curves.length !== expected.size) throw new Error("Manifest und Export müssen genau HANPP, CO₂ und Blauwasser enthalten.");
for (const approval of manifest.approvedCurves) {
  const expectedCurve = expected.get(approval.seriesId);
  if (!expectedCurve) throw new Error(`${approval.seriesId}: unerwartete Freigabe.`);
  requireBlcCurveRole(approval, approval.curveId);
  const exported = curveExport.curves.find(curve => curve.curveId === approval.curveId);
  if (!exported) throw new Error(`${approval.curveId}: Freigabe fehlt im Export.`);
  requireBlcCurveRole(exported, exported.curveId);
  for (const field of ["curveRole", "domainType", "domainId", "domainLabel"]) {
    if (exported[field] !== expectedCurve[field] || (field === "curveRole" && exported[field] !== approval[field])) {
      throw new Error(`${approval.curveId}: ${field} ging im Weg Manifest → Export verloren oder wurde verändert.`);
    }
  }
}

console.log("BLC-Rollentest gültig: core, deep_dive, fehlende und unbekannte Rolle sowie Manifest → Export geprüft.");
