"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { readRequest, resolve, select } = require("../direct-link.js");

const boundaries = [
  { id: "ocean", items: [{ id: "global-surface-aragonite-saturation" }] },
  { id: "biosphere", items: [{ id: "functional-integrity-hanpp" }] },
  { id: "climate", items: [{ id: "global-warming" }, { id: "radiative-forcing" }] }
];

const aragonite = readRequest("?boundary=ocean&item=global-surface-aragonite-saturation");
assert.deepEqual(aragonite, {
  boundaryId: "ocean",
  itemId: "global-surface-aragonite-saturation",
  curveId: null
});
assert.equal(resolve(boundaries, aragonite).status, "ok");
assert.equal(resolve(boundaries, aragonite).boundary.id, "ocean");
assert.equal(resolve(boundaries, aragonite).item.id, "global-surface-aragonite-saturation");

for (const request of [
  { boundaryId: "biosphere", itemId: "functional-integrity-hanpp" },
  { boundaryId: "climate", itemId: "global-warming" },
  { boundaryId: "climate", itemId: "radiative-forcing" }
]) assert.equal(resolve(boundaries, request).status, "ok");

assert.equal(resolve(boundaries, { boundaryId: "removed", itemId: "anything" }).status, "unknown_boundary");
assert.equal(resolve(boundaries, { boundaryId: "ocean", itemId: "removed" }).status, "unknown_item");

const calls = [];
const handlers = {
  selectBoundary: boundaryId => calls.push(["boundary", boundaryId]),
  selectItem: (boundaryId, itemId) => calls.push(["item", boundaryId, itemId])
};
select(resolve(boundaries, aragonite), handlers);
select(resolve(boundaries, { boundaryId: "biosphere", itemId: "functional-integrity-hanpp" }), handlers);
assert.deepEqual(calls, [
  ["boundary", "ocean"],
  ["item", "ocean", "global-surface-aragonite-saturation"],
  ["boundary", "biosphere"],
  ["item", "biosphere", "functional-integrity-hanpp"]
]);

const projectRoot = path.resolve(__dirname, "..");
const index = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "knowledge", "knowledge-index.json"), "utf8"));
const curveExport = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json"), "utf8"));
const oceanGroup = index.systemBoundaries
  .find(entry => entry.id === "planetary_boundaries").groups
  .find(group => group.id === "ocean_acidification");
const panelItemId = oceanGroup.items[0].id.replaceAll("_", "-");
const exported = curveExport.curves.find(curve => curve.seriesId === "global_surface_omega_arag_oceansoda_1982_2021");
assert.equal(panelItemId, "global-surface-aragonite-saturation");
assert.equal(exported.boundaryId, "ocean");
assert.equal(exported.itemId, panelItemId);

const climateGroup = index.systemBoundaries
  .find(entry => entry.id === "planetary_boundaries").groups
  .find(group => group.id === "climate_change");
const forcingItemId = climateGroup.items.find(item => item.id === "radiative_forcing").id.replaceAll("_", "-");
const forcingExport = curveExport.curves.find(curve => curve.seriesId === "global_anthropogenic_erf_1750_2025");
assert.equal(forcingItemId, "radiative-forcing");
assert.equal(forcingExport.boundaryId, "climate");
assert.equal(forcingExport.itemId, forcingItemId);

console.log("GWL-Direktlinks gültig: Aragonit, Strahlungsantrieb, weitere Grenzen, Fehlerfälle, Auswahlreihenfolge und Linkwechsel geprüft.");
