import fs from "node:fs";

const root = new URL("../", import.meta.url);
const index = JSON.parse(fs.readFileSync(new URL("data/knowledge/knowledge-index.json", root), "utf8"));
const appSource = fs.readFileSync(new URL("app.js", root), "utf8");
const pageSource = fs.readFileSync(new URL("index.html", root), "utf8");
const planetaryBoundaries = index.systemBoundaries.find(entry => entry.id === "planetary_boundaries");
const indexedCoreContributions = planetaryBoundaries.groups.flatMap(group =>
  (group.items || [])
    .filter(item => (item.type || "control") === "control")
    .map(item => ({ source: item.source, seriesId: null, id: item.id }))
);
const freshwaterSource = "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json";
const coreContributions = [
  ...indexedCoreContributions,
  { source: freshwaterSource, seriesId: "blue_water_streamflow", id: "blue-water-streamflow" },
  { source: freshwaterSource, seriesId: "green_water_rootzone_soil_moisture", id: "green-water-rootzone-soil-moisture" }
];

if (coreContributions.length !== 12) {
  throw new Error(`Unerwartete Zahl von PG-Kernbeiträgen: ${coreContributions.length}.`);
}

for (const contribution of coreContributions) {
  const network = JSON.parse(fs.readFileSync(new URL(contribution.source, root), "utf8"));
  const series = (network.timeSeries || []).find(entry => entry.id === contribution.seriesId);
  const summary = series?.effectSummary || network.presentation?.effectSummary;
  if (typeof summary !== "string" || !summary.trim()) {
    throw new Error(`${contribution.id}: Fließtext für die Kernbeitragskarte fehlt.`);
  }
}

if (!appSource.includes("function isCoreKnowledgeContribution")) {
  throw new Error("Zentrale Darstellungsregel für PG-Kernbeiträge fehlt.");
}
if (!appSource.includes("panel.hidden = coreContribution")) {
  throw new Error("Zusätzliche Knowledge-Panels werden für PG-Kernbeiträge nicht zentral ausgeblendet.");
}
if (!pageSource.includes('id="effectPathInfo"') || !pageSource.includes("verändert keine Kurven")) {
  throw new Error("Nutzerhinweis zur Bedeutung und technischen Wirkung von Wirkungspfaden fehlt.");
}

console.log(`Kernbeitragskarten gültig: ${coreContributions.length} PG-Kernbeiträge besitzen einen Fließtext und folgen der zentralen Wirkungspfad-Regel.`);
