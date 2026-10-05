import fs from "node:fs/promises";
import path from "node:path";
import { BLC_DOMAIN_DEFINITIONS, buildBlcDomainCatalog, resolveBlcDomain } from "./lib/blc-domain-catalog.mjs";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const indexPath = path.join(projectRoot, "data", "knowledge", "knowledge-index.json");
const knowledgeIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
const catalog = buildBlcDomainCatalog(knowledgeIndex);
const transitionalFreshwaterSource = "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json";

const expectedDomains = [
  ["planetary_boundary", "climate_change", "Klimawandel"],
  ["planetary_boundary", "biosphere_integrity", "Biosphärenintegrität"],
  ["planetary_boundary", "freshwater_change", "Süßwasser"],
  ["planetary_boundary", "land_system_change", "Land-System-Wandel"],
  ["planetary_boundary", "nutrient_cycles", "Nährstoffkreisläufe"],
  ["planetary_boundary", "ocean_acidification", "Ozeanversauerung"],
  ["planetary_boundary", "atmospheric_aerosol_loading", "Aerosole"],
  ["planetary_boundary", "stratospheric_ozone_depletion", "Stratosphärisches Ozon"],
  ["planetary_boundary", "novel_entities", "Neue Substanzen"],
  ["influence_area", "eah_material_energy_flows", "Stoff- und Energieströme"],
  ["influence_area", "eah_tech_social_environment", "Technologische & soziale Umwelt"]
];

if (BLC_DOMAIN_DEFINITIONS.length !== 11 || catalog.domains.length !== 11) throw new Error("Es müssen genau elf BLC-Kategorien vorhanden sein.");
for (const [domainType, domainId, domainLabel] of expectedDomains) {
  const match = catalog.domains.find(domain => domain.domainType === domainType && domain.domainId === domainId);
  if (!match || match.domainLabel !== domainLabel) throw new Error(`${domainId}: Kategorie oder Bezeichnung stimmt nicht.`);
}

const cases = [
  ["data/knowledge/gwl_biosphere_functional_integrity_v0.1.json", "planetary_boundary", "biosphere_integrity", "Biosphärenintegrität"],
  ["data/knowledge/gwl_oil_energy_pilot_v0.1b.json", "influence_area", "eah_material_energy_flows", "Stoff- und Energieströme"],
  ["data/knowledge/gwl_no2_sources_exposure_global_v0.1.json", "influence_area", "eah_tech_social_environment", "Technologische & soziale Umwelt"]
];
for (const [source, domainType, domainId, domainLabel] of cases) {
  const actual = resolveBlcDomain(catalog, source);
  if (actual.domainType !== domainType || actual.domainId !== domainId || actual.domainLabel !== domainLabel) {
    throw new Error(`${source}: falsche Kategoriezuordnung.`);
  }
}

function expectFailure(action, pattern) {
  try {
    action();
  } catch (error) {
    if (pattern.test(error.message)) return;
    throw error;
  }
  throw new Error(`Erwarteter Fehler ${pattern} blieb aus.`);
}

const freshwaterPayload = JSON.parse(await fs.readFile(path.join(projectRoot, ...transitionalFreshwaterSource.split("/")), "utf8"));
for (const seriesId of ["blue_water_streamflow", "green_water_rootzone_soil_moisture"]) {
  if (!(freshwaterPayload.timeSeries || []).some(series => series.id === seriesId)) throw new Error(`${seriesId}: Zeitreihe der Sonderquelle fehlt.`);
  const actual = resolveBlcDomain(catalog, transitionalFreshwaterSource);
  if (actual.domainType !== "planetary_boundary" || actual.domainId !== "freshwater_change" || actual.domainLabel !== "Süßwasser") {
    throw new Error(`${seriesId}: Übergangszuordnung ist falsch.`);
  }
}

expectFailure(
  () => resolveBlcDomain(catalog, "data/knowledge/not-registered-for-blc.json"),
  /nicht im Knowledge-Index registriert/
);

const duplicatedIndex = structuredClone(knowledgeIndex);
duplicatedIndex.systemBoundaries.find(boundary => boundary.id === "planetary_boundaries")
  .groups.find(group => group.id === "climate_change")
  .items.push({
    id: "duplicate-hanpp",
    label: "Doppelter Testeintrag",
    source: "data/knowledge/gwl_biosphere_functional_integrity_v0.1.json"
  });
const duplicatedCatalog = buildBlcDomainCatalog(duplicatedIndex);
expectFailure(
  () => resolveBlcDomain(duplicatedCatalog, "data/knowledge/gwl_biosphere_functional_integrity_v0.1.json"),
  /mehrfach oder widersprüchlich/
);

const conflictingIndex = structuredClone(knowledgeIndex);
conflictingIndex.systemBoundaries.find(boundary => boundary.id === "eah_material_energy_flows")
  .groups[0].items.push({
    id: "conflicting-hanpp",
    label: "Widersprüchlicher Testeintrag",
    source: "data/knowledge/gwl_biosphere_functional_integrity_v0.1.json"
  });
const conflictingCatalog = buildBlcDomainCatalog(conflictingIndex);
expectFailure(
  () => resolveBlcDomain(conflictingCatalog, "data/knowledge/gwl_biosphere_functional_integrity_v0.1.json"),
  /mehrfach oder widersprüchlich/
);

const conflictingFreshwaterIndex = structuredClone(knowledgeIndex);
conflictingFreshwaterIndex.systemBoundaries.find(boundary => boundary.id === "eah_material_energy_flows")
  .groups[0].items.push({
    id: "conflicting-freshwater-special-source",
    label: "Widersprüchliche Sonderquellenregistrierung",
    source: transitionalFreshwaterSource
  });
const conflictingFreshwaterCatalog = buildBlcDomainCatalog(conflictingFreshwaterIndex);
expectFailure(
  () => resolveBlcDomain(conflictingFreshwaterCatalog, transitionalFreshwaterSource),
  /widerspricht der erwarteten Zuordnung/
);

console.log("BLC-Kategorietest gültig: 11 Kategorien; Blau- und Grünwasser-Ausnahme sowie eindeutige, fehlende, doppelte und widersprüchliche Zuordnungen geprüft.");
