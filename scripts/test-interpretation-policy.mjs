import fs from "node:fs";

const root = new URL("../", import.meta.url);
const index = JSON.parse(fs.readFileSync(new URL("data/knowledge/knowledge-index.json", root), "utf8"));
const appSource = fs.readFileSync(new URL("app.js", root), "utf8");
const pageSource = fs.readFileSync(new URL("index.html", root), "utf8");
const dataModelSource = fs.readFileSync(new URL("docs/DATA-MODEL.md", root), "utf8");
const rules = JSON.parse(fs.readFileSync(new URL("data/policies/presentation-rules-v1.json", root), "utf8"));

const indexedContributions = index.systemBoundaries.flatMap(boundary =>
  (boundary.groups || []).flatMap(group =>
    (group.items || []).filter(item => item.source)
  )
);

for (const contribution of indexedContributions) {
  const payload = JSON.parse(fs.readFileSync(new URL(contribution.source, root), "utf8"));
  const network = payload.network || payload;
  const hasInterpretation = Boolean(
    network.presentation?.uncertainty
    || (network.measurements || []).some(item => item.uncertainty)
    || [...(network.timeSeries || []), ...(network.projectionSeries || [])].some(series =>
      series.uncertainty || (series.points || series.values || []).some(point => point.uncertainty)
    )
    || (network.pathways || []).some(pathway => pathway.caution)
    || (network.knowledgeGaps || []).length
  );
  if (!hasInterpretation) {
    throw new Error(`${contribution.id}: Einordnung oder Aussagegrenze fehlt vollständig.`);
  }
}

if (!appSource.includes("function getContributionInterpretation")) {
  throw new Error("Zentrale Auswahl der beitragsweiten Einordnung fehlt.");
}
if (!appSource.includes("function distinctStatements")) {
  throw new Error("Schutz vor wortgleichen Wiederholungen fehlt.");
}
if (!pageSource.includes("Einordnung und Aussagegrenzen")) {
  throw new Error("Einheitliche sichtbare Bezeichnung fehlt.");
}
if (pageSource.includes("Unsicherheit / Einordnung")) {
  throw new Error("Alte uneinheitliche Bezeichnung ist noch vorhanden.");
}

if (rules.format !== "gwl-presentation-rules" || !rules.version || !rules.rules?.length) {
  throw new Error("Zentrales Regelregister fehlt oder ist ungültig.");
}
if (!dataModelSource.includes("data/policies/presentation-rules-v1.json")
  || !dataModelSource.includes(`Regelregister-Version: ${rules.version}`)) {
  throw new Error("Datenmodell und Regelregister-Version sind nicht miteinander verknüpft.");
}
for (const rule of rules.rules) {
  if (!rule.id || !rule.label || !rule.reason || !rule.application) {
    throw new Error("Eine Regel besitzt keine vollständige Erklärung von Zweck und Anwendung.");
  }
  if (!(rule.dataModelFields || []).length) {
    throw new Error(`${rule.id}: Verknüpfung zum Datenmodell fehlt.`);
  }
  for (const functionName of rule.appliedBy || []) {
    if (!appSource.includes(`function ${functionName}`)) {
      throw new Error(`${rule.id}: Anwendungsfunktion ${functionName} fehlt.`);
    }
  }
}
if (!appSource.includes("loadPresentationRules") || !pageSource.includes('id="effectRulesList"')) {
  throw new Error("Das GWL verwendet das zentrale Regelregister nicht sichtbar.");
}
const deepeningRule = rules.rules.find(rule => rule.id === "deepening_progressive_disclosure");
if (!deepeningRule
  || !appSource.includes("function renderDeepeningOverview")
  || !deepeningRule.programEffects?.some(text => text.includes("tatsächlich eine Zeitreihe"))) {
  throw new Error("Die regelbasierte, schrittweise Darstellung von Vertiefungen ist nicht vollständig verknüpft.");
}
const deepeningNavigationRule = rules.rules.find(rule => rule.id === "deepening_curve_navigation_hierarchy");
if (!deepeningNavigationRule
  || !appSource.includes("function isDeepeningCurveMenuItem")
  || !appSource.includes("menuHierarchyLevel(boundary, item, items)")
  || !deepeningNavigationRule.programEffects?.some(text => text.includes("Kernbeiträge bleiben auf der ersten Menüebene"))) {
  throw new Error("Die übergreifende Navigationsregel für Vertiefungskurven ist nicht vollständig verknüpft.");
}

console.log(`Einordnungsregel gültig: ${indexedContributions.length} indexierte Beiträge und ${rules.rules.length} zentrale Regeln geprüft.`);
