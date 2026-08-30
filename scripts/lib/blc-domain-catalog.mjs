export const BLC_DOMAIN_DEFINITIONS = Object.freeze([
  { domainType: "planetary_boundary", domainId: "climate_change" },
  { domainType: "planetary_boundary", domainId: "biosphere_integrity" },
  { domainType: "planetary_boundary", domainId: "freshwater_change" },
  { domainType: "planetary_boundary", domainId: "land_system_change" },
  { domainType: "planetary_boundary", domainId: "nutrient_cycles" },
  { domainType: "planetary_boundary", domainId: "ocean_acidification" },
  { domainType: "planetary_boundary", domainId: "atmospheric_aerosol_loading" },
  { domainType: "planetary_boundary", domainId: "stratospheric_ozone_depletion" },
  { domainType: "planetary_boundary", domainId: "novel_entities" },
  { domainType: "influence_area", domainId: "eah_material_energy_flows" },
  { domainType: "influence_area", domainId: "eah_tech_social_environment" }
]);

const expectedDomainKeys = new Set(BLC_DOMAIN_DEFINITIONS.map(domain => `${domain.domainType}:${domain.domainId}`));

// BEFRISTETE KOMPATIBILITÄTSREGEL:
// Diese bereits produktiv verwendete Blau-/Grünwasser-Datei wird im GWL-Panel über
// einen eigenen Loader- und Navigationspfad eingebunden und ist deshalb noch nicht
// regulär im Knowledge-Index registriert. Ausschließlich für den BLC-Export wird sie
// an die vorhandene Indexgruppe planetary_boundaries/freshwater_change gebunden.
// Ablösung erst, wenn (1) Knowledge-Dateien beim Laden nach URL dedupliziert werden
// und (2) mehrere Zeitreihen derselben Knowledge-Datei im Index eindeutig
// adressierbar sind. Keine weiteren Quellen in diese Ausnahme aufnehmen.
const TRANSITIONAL_FRESHWATER_SOURCE = "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json";
const TRANSITIONAL_FRESHWATER_DOMAIN = Object.freeze({
  domainType: "planetary_boundary",
  domainId: "freshwater_change"
});

const fail = message => { throw new Error(message); };

function requireSingleBoundary(systemBoundaries, id) {
  const matches = systemBoundaries.filter(boundary => boundary?.id === id);
  if (matches.length !== 1) fail(`Knowledge-Index: ${id} muss genau einmal registriert sein; gefunden: ${matches.length}.`);
  return matches[0];
}

function registerItems(registrationsBySource, boundary, domainForGroup) {
  for (const group of boundary.groups || []) {
    const domain = domainForGroup(group);
    if (!domain?.domainId || !domain?.domainLabel) fail(`Knowledge-Index: ungültige Kategorie unter ${boundary.id}.`);
    for (const item of group.items || []) {
      if (!item?.source) continue;
      const registrations = registrationsBySource.get(item.source) || [];
      registrations.push({
        ...domain,
        registration: {
          boundaryId: boundary.id,
          groupId: group.id,
          itemId: item.id,
          source: item.source
        }
      });
      registrationsBySource.set(item.source, registrations);
    }
  }
}

export function buildBlcDomainCatalog(knowledgeIndex) {
  const systemBoundaries = Array.isArray(knowledgeIndex?.systemBoundaries) ? knowledgeIndex.systemBoundaries : [];
  const registrationsBySource = new Map();
  const domains = [];

  const planetaryBoundaries = requireSingleBoundary(systemBoundaries, "planetary_boundaries");
  for (const group of planetaryBoundaries.groups || []) {
    domains.push({ domainType: "planetary_boundary", domainId: group.id, domainLabel: group.label });
  }
  registerItems(registrationsBySource, planetaryBoundaries, group => ({
    domainType: "planetary_boundary",
    domainId: group.id,
    domainLabel: group.label
  }));

  for (const influenceAreaId of ["eah_material_energy_flows", "eah_tech_social_environment"]) {
    const influenceArea = requireSingleBoundary(systemBoundaries, influenceAreaId);
    const domain = {
      domainType: "influence_area",
      domainId: influenceArea.id,
      domainLabel: influenceArea.label
    };
    domains.push(domain);
    registerItems(registrationsBySource, influenceArea, () => domain);
  }

  const actualDomainKeys = new Set(domains.map(domain => `${domain.domainType}:${domain.domainId}`));
  if (domains.length !== BLC_DOMAIN_DEFINITIONS.length || actualDomainKeys.size !== expectedDomainKeys.size) {
    fail(`Knowledge-Index: erwartet werden genau ${BLC_DOMAIN_DEFINITIONS.length} BLC-Kategorien.`);
  }
  for (const key of expectedDomainKeys) if (!actualDomainKeys.has(key)) fail(`Knowledge-Index: BLC-Kategorie ${key} fehlt.`);
  for (const key of actualDomainKeys) if (!expectedDomainKeys.has(key)) fail(`Knowledge-Index: unbekannte BLC-Kategorie ${key}.`);

  return { domains, registrationsBySource };
}

export function resolveBlcDomain(catalog, source) {
  const matches = catalog?.registrationsBySource?.get(source) || [];
  if (matches.length > 1) {
    const positions = matches.map(match => `${match.registration.boundaryId}/${match.registration.groupId}/${match.registration.itemId}`).join(", ");
    fail(`${source}: mehrfach oder widersprüchlich im Knowledge-Index registriert (${positions}).`);
  }
  if (matches.length === 1) {
    const { domainType, domainId, domainLabel } = matches[0];
    if (source === TRANSITIONAL_FRESHWATER_SOURCE && (
      domainType !== TRANSITIONAL_FRESHWATER_DOMAIN.domainType ||
      domainId !== TRANSITIONAL_FRESHWATER_DOMAIN.domainId
    )) {
      fail(`${source}: reguläre Indexregistrierung widerspricht der erwarteten Zuordnung planetary_boundaries/freshwater_change.`);
    }
    return { domainType, domainId, domainLabel };
  }

  if (source !== TRANSITIONAL_FRESHWATER_SOURCE) {
    fail(`${source}: nicht im Knowledge-Index registriert; keine BLC-Kategorie ableitbar.`);
  }

  const transitionalDomain = catalog?.domains?.filter(domain =>
    domain.domainType === TRANSITIONAL_FRESHWATER_DOMAIN.domainType &&
    domain.domainId === TRANSITIONAL_FRESHWATER_DOMAIN.domainId
  ) || [];
  if (transitionalDomain.length !== 1) {
    fail(`${source}: Übergangszuordnung planetary_boundaries/freshwater_change ist im Knowledge-Index nicht eindeutig.`);
  }
  const { domainType, domainId, domainLabel } = transitionalDomain[0];
  return { domainType, domainId, domainLabel };
}
