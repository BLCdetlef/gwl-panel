const data = window.GWL_DATA;
const GWL_BUILD_VERSION = "0.9.35 · B18";

const boundaryList = document.getElementById("boundaryList");
const regionSelect = document.getElementById("regionSelect");
const regionPath = document.getElementById("regionPath");
const locationInfoButton = document.getElementById("locationInfoButton");
const locationInfo = document.getElementById("locationInfo");
const focusType = document.getElementById("focusType");
const focusTitle = document.getElementById("focusTitle");
const focusSummary = document.getElementById("focusSummary");
const metricValue = document.getElementById("metricValue");
const referenceValue = document.getElementById("referenceValue");
const periodValue = document.getElementById("periodValue");
const uncertaintyValue = document.getElementById("uncertaintyValue");
const sourceLink = document.getElementById("sourceLink");
const findingText = document.getElementById("findingText");
const effectPath = document.getElementById("effectPath");
const lifeNote = document.getElementById("lifeNote");
const organReadout = document.getElementById("organReadout");
const resetButton = document.getElementById("resetButton");
const timeSlider = document.getElementById("timeSlider");
const timeReadout = document.getElementById("timeReadout");
const timeStatus = document.getElementById("timeStatus");
const timeMarkers = document.getElementById("timeMarkers");
const dataWindowButton = document.getElementById("dataWindowButton");
const blcWindowButton = document.getElementById("blcWindowButton");
const hotspotLayer = document.getElementById("hotspotLayer");
let healthLegend = null;
const organOverlay = document.getElementById("organOverlay");
const organOverlayTitle = document.getElementById("organOverlayTitle");
const organOverlayMedia = document.getElementById("organOverlayMedia");
const organOverlayFinding = document.getElementById("organOverlayFinding");
const organOverlayNote = document.getElementById("organOverlayNote");
const organOverlayContent = document.getElementById("organOverlayContent");
const organOverlayNoteHomeParent = organOverlayNote?.parentElement || null;
const organOverlayNoteHomeNextSibling = organOverlayNote?.nextSibling || null;
const closeOverlayButton = document.getElementById("closeOverlayButton");
const healthPathOverlay = document.getElementById("healthPathOverlay");
const healthPathTitle = document.getElementById("healthPathTitle");
const healthPathContent = document.getElementById("healthPathContent");
const closeHealthPathButton = document.getElementById("closeHealthPathButton");
const causeButtonGround = document.getElementById("causeButtonGround");
const causeButtonEffect = document.getElementById("causeButtonEffect");
const causeButtonLife = document.getElementById("causeButtonLife");
const causeOverlayGround = document.getElementById("causeOverlayGround");
const causeOverlayEffect = document.getElementById("causeOverlayEffect");
const causeOverlayLife = document.getElementById("causeOverlayLife");
const causeTitleGround = document.getElementById("causeTitleGround");
const causeTitleEffect = document.getElementById("causeTitleEffect");
const causeTitleLife = document.getElementById("causeTitleLife");
const causeBodyGround = document.getElementById("causeBodyGround");
const causeBodyEffect = document.getElementById("causeBodyEffect");
const causeBodyLife = document.getElementById("causeBodyLife");

let selectedBoundaryId = "freshwater";
let selectedDomainComponent = null;
let selectedItemId = null;
let selectedYear = null;
let timeWindow = "data";
let currentHealth = null;
let selectedOrganId = null;
let knowledgeNetworks = {};
let knowledgePanel = null;

let HOTSPOTS = {};
let ORGAN_MEDIA = {};

let LIFE_PROTOTYPE_MODE = true;
let LIFE_HEALTH_DATA = null;
let LIFE_PROTOTYPE_CONTRIBUTIONS = [];
let HEALTH_STUDY_IMPORT = {
  catalog: null,
  index: null,
  studies: [],
  rejected: []
};

const HEALTH_STUDY_INDEX_SOURCE = "data/health/health-study-index-v0.1.json";

function validateHealthStudyForImport(study, entry, knownRiskIds, policy) {
  const reasons = [];
  if (!policy.acceptedFormats.includes(study?.format)) reasons.push("format_not_accepted");
  if (study?.id !== entry?.id) reasons.push("index_id_mismatch");
  if (!policy.acceptedDecisions.includes(study?.review?.decision)) reasons.push("review_decision_not_accepted");
  if (!Array.isArray(study?.riskRefs) || !study.riskRefs.length) reasons.push("risk_reference_missing");
  if (policy.requireKnownRiskReference && study?.riskRefs?.some(id => !knownRiskIds.has(id))) reasons.push("unknown_risk_reference");
  if (!Array.isArray(study?.measurements) || !study.measurements.length) reasons.push("measurement_missing");
  if (!study?.scope?.level) reasons.push("spatial_scope_missing");
  if ((study?.healthEndpoints || []).length > policy.maximumVisibleEndpointsPerStudy) reasons.push("endpoint_limit_exceeded");
  return reasons;
}

function prepareHealthStudyForPanel(study, policy) {
  const scopeLevel = study.scope.level;
  const displayRole = policy.primaryDisplayScopes.includes(scopeLevel)
    ? "global_reference"
    : "spatial_context";
  const organMarkersEligible = study.review.organMappingChecked === true;

  return {
    ...study,
    panelImport: {
      displayRole,
      organMarkersEligible,
      organColorEligible: false,
      localTransferAllowed: false
    }
  };
}

async function loadHealthStudyImport() {
  const indexResponse = await fetch(HEALTH_STUDY_INDEX_SOURCE, { cache: "no-store" });
  if (!indexResponse.ok) throw new Error(`${HEALTH_STUDY_INDEX_SOURCE}: ${indexResponse.status}`);
  const index = await indexResponse.json();

  const catalogResponse = await fetch(index.catalogSource, { cache: "no-store" });
  if (!catalogResponse.ok) throw new Error(`${index.catalogSource}: ${catalogResponse.status}`);
  const catalog = await catalogResponse.json();
  const knownRiskIds = new Set([
    ...(catalog.coreRisks || []),
    ...(catalog.contextRisks || [])
  ].map(risk => risk.id));

  const enabledEntries = (index.studies || []).filter(entry => entry.enabled === true);
  const loaded = await Promise.all(enabledEntries.map(async entry => {
    try {
      const response = await fetch(entry.source, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const study = await response.json();
      const reasons = validateHealthStudyForImport(study, entry, knownRiskIds, index.importPolicy);
      return reasons.length ? { entry, reasons } : { entry, study };
    } catch (error) {
      return { entry, reasons: [`load_error: ${error.message}`] };
    }
  }));

  HEALTH_STUDY_IMPORT = {
    catalog,
    index,
    studies: loaded
      .filter(item => item.study)
      .map(item => prepareHealthStudyForPanel(item.study, index.importPolicy)),
    rejected: loaded.filter(item => !item.study)
  };

  // Bewusste Schnittstelle für die spätere, datengetriebene Gesundheitsansicht.
  // Der Import allein aktiviert noch keine Organfarbe und keine lokale Aussage.
  window.GWL_HEALTH_IMPORT = HEALTH_STUDY_IMPORT;
  if (HEALTH_STUDY_IMPORT.rejected.length) {
    console.warn("Gesundheitsstudien beim Import zurückgewiesen:", HEALTH_STUDY_IMPORT.rejected);
  }
}

async function loadHealthContributionPrototype() {
  if (!LIFE_PROTOTYPE_MODE) return;
  try {
    const response = await fetch("health-contributions.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`data/health-contributions.json: ${response.status}`);
    const payload = await response.json();
    LIFE_HEALTH_DATA = payload;
    LIFE_PROTOTYPE_CONTRIBUTIONS = Array.isArray(payload.organs) ? payload.organs : [];
  } catch (error) {
    console.warn("Health-Contributions-Prototyp konnte nicht geladen werden:", error);
    LIFE_HEALTH_DATA = null;
    LIFE_PROTOTYPE_CONTRIBUTIONS = [];
  }
}

function findHotspotIdByLabels(labels = []) {
  const wanted = labels.map(x => String(x).toLowerCase());
  for (const [id, def] of Object.entries(HOTSPOTS || {})) {
    const hay = `${id} ${def?.label || ""}`.toLowerCase();
    if (wanted.some(label => hay.includes(label))) return id;
  }
  return null;
}

function getHealthSourceById(id) {
  const prototypeSource = (LIFE_HEALTH_DATA?.sources || []).find(source => source.id === id);
  if (prototypeSource) return prototypeSource;
  for (const study of HEALTH_STUDY_IMPORT.studies || []) {
    const studySource = (study.sources || []).find(source => source.id === id);
    if (studySource) return studySource;
  }
  return null;
}

function displayHealthMeasurement(measurement) {
  if (!measurement || measurement.value === null || measurement.value === undefined) return "";
  return `${String(measurement.value).replace(".", ",")} ${measurement.unit || ""}`.trim();
}

function getImportedHealthContributionsByOrgan() {
  const endpointCards = new Map();

  for (const study of HEALTH_STUDY_IMPORT.studies || []) {
    if (!study.panelImport?.organMarkersEligible) continue;
    const risk = [
      ...(HEALTH_STUDY_IMPORT.catalog?.coreRisks || []),
      ...(HEALTH_STUDY_IMPORT.catalog?.contextRisks || [])
    ].find(candidate => candidate.id === study.riskRefs?.[0]);
    for (const endpoint of study.healthEndpoints || []) {
      for (const organId of endpoint.organIds || []) {
        const normalizedEndpoint = endpoint.label.trim().toLocaleLowerCase("de-DE");
        const cardKey = `${organId}::${normalizedEndpoint}`;
        if (!endpointCards.has(cardKey)) {
          endpointCards.set(cardKey, {
            id: `health_endpoint_${organId}_${endpoint.id}`,
            organId,
            label: endpoint.label,
            healthEndpoint: endpoint.label,
            evidenceLevel: endpoint.attributionStatus === "attributable_burden" ? "A" : "B",
            burden: null,
            affectsOrganColor: false,
            colorStatus: "multiple_exposures_not_separately_weighted",
            whyNoColor: "Mehrere Expositionen können zu diesem Gesundheitsendpunkt beitragen. Ihre Anteile werden nur gewichtet oder addiert, wenn überschneidungsfreie, vergleichbare Daten vorliegen.",
            globalHealthReference: study.panelImport.displayRole === "global_reference",
            pathways: []
          });
        }

        const foundationIds = risk?.primaryBoundaryId
          ? [risk.primaryBoundaryId]
          : (risk?.relatedBoundaryIds || []);
        const measurements = (study.measurements || [])
          .filter(item => item.value !== null && item.value !== undefined)
          .slice(0, 2);
        endpointCards.get(cardKey).pathways.push({
          id: `${study.id}_${endpoint.id}`,
          foundationIds,
          foundations: foundationIds.map(id => getBoundary(id)?.label || id),
          exposure: risk?.label || study.title,
          outcome: endpoint.label,
          organ: HOTSPOTS[organId]?.label || organId,
          measurements: measurements.map(item => ({
            label: item.metric,
            display: displayHealthMeasurement(item),
            period: item.period,
            geography: item.geography
          })),
          sourceRef: study.sources?.[0]?.id || "",
          spatialContext: `${study.scope.geography} · ${study.period.startYear}–${study.period.endYear}`,
          foundationLinkEligible:
            study.review.decision === "include" &&
            endpoint.attributionStatus !== "context_only",
          weightingStatus: "not_separately_quantified"
        });
      }
    }
  }

  const byOrgan = new Map();
  for (const card of endpointCards.values()) {
    if (!byOrgan.has(card.organId)) byOrgan.set(card.organId, []);
    byOrgan.get(card.organId).push(card);
  }
  return byOrgan;
}

function normalizedOrganBurdenScore(contributions = []) {
  // Nur explizit hinterlegte, bereits normierte zurechenbare Krankheitslast
  // darf die Graustufe bestimmen. Keine eigene Umrechnung aus DALYs, Fällen
  // oder relativen Risiken.
  const values = contributions
    .filter(item => item.affectsOrganColor === true)
    .map(item => Number(item?.burden?.normalization?.organBurdenPercent))
    .filter(Number.isFinite);

  if (!values.length) return null;

  // Mehrere Anteile dürfen nur dann addiert werden, wenn die Datenquelle sie
  // auf dieselbe organspezifische Bezugsgröße bezieht. V2 nutzt deshalb
  // standardmäßig nur die explizit gelieferten Prozentwerte und begrenzt bei 100.
  return Math.max(0, Math.min(100, values.reduce((sum, value) => sum + value, 0)));
}

function getPrototypeAggregateHealth() {
  if (!LIFE_PROTOTYPE_MODE) return null;

  const impacts = LIFE_PROTOTYPE_CONTRIBUTIONS
    .map(bundle => {
      const organId = bundle.organId && HOTSPOTS[bundle.organId]
        ? bundle.organId
        : findHotspotIdByLabels(bundle.organLabels || []);
      if (!organId) return null;

      const contributors = Array.isArray(bundle.contributions) ? bundle.contributions : [];
      if (!contributors.length) return null;

      return {
        organ: organId,
        label: HOTSPOTS[organId]?.label || bundle.organLabels?.[0] || organId,
        burdenScore: normalizedOrganBurdenScore(contributors),
        contributors,
        healthContributionView: true
      };
    })
    .filter(Boolean);

  const importedByOrgan = getImportedHealthContributionsByOrgan();
  for (const [organId, contributors] of importedByOrgan) {
    const existing = impacts.find(impact => impact.organ === organId);
    if (existing) {
      existing.contributors.push(...contributors);
    } else {
      impacts.push({
        organ: organId,
        label: HOTSPOTS[organId]?.label || organId,
        burdenScore: null,
        contributors,
        healthContributionView: true
      });
    }
  }

  return impacts.length
    ? {
        contributionModel: true,
        impacts,
        note: LIFE_HEALTH_DATA?.methodPolicy?.organColorRule || ""
      }
    : null;
}

async function loadBodymapConfig() {
  const response = await fetch("bodymap.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`bodymap.json konnte nicht geladen werden (${response.status})`);
  const config = await response.json();

  HOTSPOTS = {};
  ORGAN_MEDIA = {};
  (config.organs || []).forEach(organ => {
    HOTSPOTS[organ.id] = {
      label: organ.label,
      x: organ.x,
      y: organ.y,
      side: organ.side || "right"
    };
    ORGAN_MEDIA[organ.id] = {
      label: organ.label,
      img: organ.image,
      layout: organ.layout || "stack"
    };
  });
}



const FRESHWATER_KNOWLEDGE_SOURCE = "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json";

function normalizeFreshwaterBlueGreenKnowledge(payload) {
  if (!payload || payload.planetaryBoundary !== "Süßwasser" || !Array.isArray(payload.timeSeries)) {
    return payload;
  }

  const datasetDoi = payload?.source?.persistentIdentifiers?.datasetDOI || payload?.source?.doi || "";
  const publicationDoi = payload?.source?.persistentIdentifiers?.publicationDOI || "";
  const sourceUrl = publicationDoi ? `https://doi.org/${publicationDoi}` : (datasetDoi ? `https://doi.org/${datasetDoi}` : "");

  const series = payload.timeSeries.map(item => {
    const refValue = Number(item.boundaryUpperEnd);
    const refDisplay = Number.isFinite(refValue)
      ? `Planetare Grenze: ${String(refValue.toFixed(2)).replace(".", ",")} %`
      : "–";

    const points = (item.values || []).map(point => {
      const value = Number(point.value);
      const iqrMin = Number(point.iqrMin);
      const iqrMax = Number(point.iqrMax);
      const display = Number.isFinite(value)
        ? `≈ ${String(value.toFixed(2)).replace(".", ",")} %`
        : "–";
      const uncertainty = Number.isFinite(iqrMin) && Number.isFinite(iqrMax)
        ? `Modellensemble IQR: ${String(iqrMin.toFixed(2)).replace(".", ",")}–${String(iqrMax.toFixed(2)).replace(".", ",")} %.`
        : "Interquartilsbereich des Modellensembles.";

      return {
        year: Number(point.year),
        value,
        display,
        sourceRefs: ["src_freshwater_virkki_2026"],
        finding: `Für ${point.year} liegt der Anteil der globalen eisfreien Landfläche mit starken lokalen Abweichungen bei rund ${String(value.toFixed(2)).replace(".", ",")} %.`,
        uncertainty
      };
    });

    return {
      id: item.id,
      label: item.title,
      metric: item.measure,
      unit: item.unit || "%",
      geography: "Global",
      dataStartYear: 1901,
      dataEndYear: 2019,
      reference: {
        type: "planetary_boundary",
        value: refValue,
        unit: "%",
        display: refDisplay
      },
      sourceRefs: ["src_freshwater_virkki_2026"],
      methodNote: payload.methodNote || "",
      uncertainty: item.uncertainty || "Interquartilsbereich des Modellensembles (IQR).",
      provenance: item.provenance || {},
      points
    };
  });

  return {
    ...payload,
    topic: "Planetare Grenze Süßwasser: Blaues und Grünes Wasser",
    entry: {
      systemBoundary: "Süßwasser",
      domainComponent: "Süßwasser",
      effectFocus: "Anteil der globalen eisfreien Landfläche mit starken Abweichungen von präindustriell-ähnlicher Variabilität."
    },
    timeSeries: series,
    presentation: {
      compactKnowledgeView: true,
      primaryTimeSeriesId: series[0]?.id || null,
      effectPath: "Veränderter Süßwasserzustand → Ökosystemfunktionen und Wasserverfügbarkeit",
      uncertainty: "IQR des hydrologischen Modellensembles; Originaljahreswerte, im Panel im 5-Jahres-Raster plus 2019 dargestellt."
    },
    measurements: [],
    pathways: [
      {
        label: "Süßwasserzustand → Ökosysteme und Wasserverfügbarkeit",
        chain: ["Abweichung vom natürlichen Süßwasserzustand", "veränderte Wasserverfügbarkeit", "Ökosystemfunktionen"],
        evidenceStatus: "wissenschaftlich modellgestützt"
      }
    ],
    healthContext: { systemImpacts: [] },
    sources: [
      {
        id: "src_freshwater_virkki_2026",
        title: payload?.source?.publication || "Virkki et al. (2026)",
        publisher: "Nature Communications",
        year: 2026,
        url: sourceUrl,
        access: "open_full_text"
      }
    ],
    sourcePolicy: {
      rule: "Originaldateiname, verwendete Spalten, DOI und Panel-Auswahlregel sind in der Knowledge-Datei hinterlegt."
    }
  };
}

function getKnowledgeNetworkForItem(network, item) {
  if (!network || !item?.knowledgeTimeSeriesId) return network;
  return {
    ...network,
    entry: {
      ...(network.entry || {}),
      effectFocus: item.knowledgeEffectFocus || network.entry?.effectFocus
    },
    presentation: {
      ...(network.presentation || {}),
      primaryTimeSeriesId: item.knowledgeTimeSeriesId
    }
  };
}

function syncFreshwaterBlueGreenNavigation() {
  const boundary = data.boundaries.find(item => item.id === "freshwater");
  if (!boundary) return;

  const freshwaterControlLabels = new Set([
    "blaues wasser · abfluss",
    "grünes wasser · bodenfeuchte"
  ]);

  const keep = (boundary.items || []).filter(item => {
    const id = normalizeKnowledgeId(item.id);
    const label = String(item.label || "").trim().toLowerCase();

    const isBlueGreenControl =
      id === "blue-water-streamflow" ||
      id === "green-water-rootzone-soil-moisture" ||
      freshwaterControlLabels.has(label);

    return !isBlueGreenControl;
  });

  const freshwaterItems = [
    {
      id: "blue-water-streamflow",
      scope: "all",
      label: "Blaues Wasser · Abfluss",
      enabled: true,
      knowledgeSource: FRESHWATER_KNOWLEDGE_SOURCE,
      knowledgeTimeSeriesId: "blue_water_streamflow",
      knowledgeEffectFocus: "Blaues Wasser: Abfluss (streamflow) als Kontrollvariable der Planetaren Grenze Süßwasser.",
      menuType: "control"
    },
    {
      id: "green-water-rootzone-soil-moisture",
      scope: "all",
      label: "Grünes Wasser · Bodenfeuchte",
      enabled: true,
      knowledgeSource: FRESHWATER_KNOWLEDGE_SOURCE,
      knowledgeTimeSeriesId: "green_water_rootzone_soil_moisture",
      knowledgeEffectFocus: "Grünes Wasser: Wurzelzonen-Bodenfeuchte als Kontrollvariable der Planetaren Grenze Süßwasser.",
      menuType: "control"
    }
  ];

  boundary.items = [...freshwaterItems, ...keep];
  boundary.enabled = true;
}

async function loadKnowledgeNetworks() {
  knowledgeNetworks = {};
  data.knowledgeSources = data.knowledgeSources || {};
  data.knowledgeSources.freshwaterBlueGreen = FRESHWATER_KNOWLEDGE_SOURCE;

  async function loadSource(key, url) {
    if (!url || knowledgeNetworks[key]) return;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      const payload = await response.json();
      knowledgeNetworks[key] = url === FRESHWATER_KNOWLEDGE_SOURCE
        ? normalizeFreshwaterBlueGreenKnowledge(payload)
        : payload;
    } catch (error) {
      console.warn("Wissensnetz konnte nicht geladen werden:", error);
    }
  }

  // Zuerst die bisher explizit bekannten Quellen laden, insbesondere den Index.
  for (const [key, url] of Object.entries(data.knowledgeSources)) {
    await loadSource(key, url);
  }

  // Danach alle im Index referenzierten Knowledge-Dateien automatisch entdecken.
  // Neue Themen brauchen damit künftig keinen zusätzlichen Eintrag in data.js.
  const index = knowledgeNetworks.knowledgeIndex;
  for (const boundary of index?.systemBoundaries || []) {
    for (const group of boundary.groups || []) {
      for (const item of group.items || []) {
        if (!item.source) continue;
        const key = `index_${item.id}`;
        if (!Object.values(data.knowledgeSources).includes(item.source)) {
          data.knowledgeSources[key] = item.source;
        }
        await loadSource(key, item.source);
      }
    }
  }
}

function ensureKnowledgePanel() {
  if (knowledgePanel) return knowledgePanel;

  knowledgePanel = document.createElement("section");
  knowledgePanel.id = "knowledgePanel";
  knowledgePanel.className = "knowledge-panel connections-panel";
  knowledgePanel.hidden = true;

  // v0.9.6: Erst kommt der vollständige Zustand der ausgewählten
  // Planetaren Grenze (Messwert, Referenz, Befund, Wirkungspfad).
  // Danach folgen klar getrennt die verbundenen Wissenspfade.
  if (resetButton?.parentNode) {
    resetButton.insertAdjacentElement("beforebegin", knowledgePanel);
  }

  return knowledgePanel;
}

function evidenceLabel(status) {
  const labels = {
    strong: "stark belegt",
    moderate: "teilweise / kontextabhängig",
    weak: "schwach belegt",
    open: "offen"
  };
  return labels[status] || status || "nicht bewertet";
}

function actionDots(score, maxScore = 3) {
  const safeScore = Math.max(0, Math.min(maxScore, Number(score) || 0));
  return Array.from({ length: maxScore }, (_, index) =>
    `<span class="action-dot ${index < safeScore ? "filled" : ""}"></span>`
  ).join("");
}

function measurementValue(item) {
  if (!item) return "";
  if (item.result) return item.result;
  const parts = [item.start, item.end].filter(Boolean);
  return parts.length ? parts.join(" → ") : "";
}

function renderEvidenceSummary(network) {
  const edges = network?.edges || [];
  const strong = edges.filter(edge => edge.evidenceStatus === "strong").length;
  const moderate = edges.filter(edge => edge.evidenceStatus === "moderate").length;
  return `
    <span class="evidence-chip strong">${strong} × ${evidenceLabel("strong")}</span>
    ${moderate ? `<span class="evidence-chip moderate">${moderate} × ${evidenceLabel("moderate")}</span>` : ""}
  `;
}

function renderActionScope(network) {
  const action = network?.actionScope || {};
  const dimensions = action.dimensions || [];
  const levers = action.primaryLevers || [];

  if (!dimensions.length && !levers.length) return "";

  return `
    <details class="knowledge-details action-scope">
      <summary>${action.summaryLabel || "Handlungsspielraum"}</summary>
      <p class="action-method">${action.methodNote || ""}</p>
      <div class="action-dimensions">
        ${dimensions.map(dimension => `
          <div class="action-row">
            <div class="action-title">
              <strong>${dimension.label}</strong>
              <span>${dimension.level || ""}</span>
            </div>
            ${typeof dimension.score === "number" ? `
              <div class="action-dots" aria-label="${dimension.score} von ${dimension.maxScore || 3}">
                ${actionDots(dimension.score, dimension.maxScore || 3)}
              </div>` : ""}
            <p>${dimension.rationale || ""}</p>
          </div>
        `).join("")}
      </div>
      ${levers.length ? `
        <div class="lever-box">
          <strong>Wo liegen die größeren Hebel?</strong>
          <div class="lever-list">
            ${levers.map(lever => `<span><b>${lever.actor}</b> · ${lever.role}</span>`).join("")}
          </div>
        </div>` : ""}
      ${action.warning ? `<p class="action-warning">${action.warning}</p>` : ""}
    </details>
  `;
}

function renderKnowledgeCard(config) {
  const {
    key, network, eyebrow, title, intro, chain,
    previewMeasurements = [], interactionField = "interactions"
  } = config;

  if (!network) {
    return `
      <article class="connection-card connection-error">
        <div class="connection-card-head">
          <div>
            <div class="eyebrow">${eyebrow}</div>
            <h3>${title}</h3>
            <p>Datensatz konnte nicht geladen werden.</p>
          </div>
          <span class="knowledge-status knowledge-error">Prüfen</span>
        </div>
        <code>${data.knowledgeSources?.[key] || "Pfad fehlt"}</code>
      </article>`;
  }

  const measurements = network.measurements || [];
  const gaps = network.knowledgeGaps || [];
  const interactions = network[interactionField] || network.boundaryInteractions || [];
  const previews = previewMeasurements
    .map(id => measurements.find(item => item.id === id))
    .filter(Boolean);

  return `
    <article class="connection-card">
      <details class="connection-details">
        <summary class="connection-card-head">
          <div class="connection-copy">
            <div class="eyebrow">${eyebrow}</div>
            <h3>${title}</h3>
            <p>${intro}</p>

            <div class="connection-preview">
              ${previews.map(item => `
                <span>
                  <b>${item.node || item.metric || item.id}</b>
                  ${measurementValue(item)}
                  <small>${item.geography || ""}${item.period ? ` · ${item.period}` : ""}</small>
                </span>`).join("")}
            </div>
          </div>
          <span class="knowledge-open-label">Öffnen</span>
        </summary>

        <div class="connection-expanded">
          <div class="knowledge-chain" aria-label="vereinfachter Zusammenhang">
            ${chain.map((step, index) =>
              `<span class="knowledge-node">${step}</span>${index < chain.length - 1 ? '<span class="knowledge-arrow">→</span>' : ''}`
            ).join("")}
          </div>

          <details class="knowledge-details" open>
            <summary>Konkrete Daten</summary>
            <div class="knowledge-measurements">
              ${measurements.map(item => `
                <div class="knowledge-measurement">
                  <strong>${item.node || item.metric || item.id}</strong>
                  <span>${item.geography || ""}${item.period ? ` · ${item.period}` : ""}</span>
                  <p>${measurementValue(item) || "–"}</p>
                  ${item.interpretation ? `<small>${item.interpretation}</small>` : ""}
                  ${item.historicalContext ? `<small>${item.historicalContext}</small>` : ""}
                </div>`).join("")}
            </div>
          </details>

          <details class="knowledge-details">
            <summary>Evidenz & Wechselwirkungen</summary>
            <div class="knowledge-grid">
              <div class="knowledge-box">
                <strong>Evidenz der Verbindungen</strong>
                <p>${renderEvidenceSummary(network)}</p>
                <small>Bewertet werden einzelne Verbindungen, nicht pauschal der gesamte Pfad.</small>
              </div>
              <div class="knowledge-box">
                <strong>Verbindungen zu Planetaren Grenzen</strong>
                <ul>
                  ${interactions.slice(0, 5).map(item => `
                    <li>${(item.boundaries || []).join(" ↔ ")}
                      <br><span>${item.mechanism || ""}</span>
                    </li>`).join("") || "<li>Noch keine Wechselwirkung hinterlegt.</li>"}
                </ul>
              </div>
            </div>
          </details>

          <details class="knowledge-details">
            <summary>Wissenslücken (${gaps.length})</summary>
            <div class="knowledge-gap-list">
              ${gaps.map(gap => `
                <div class="knowledge-gap">
                  <span class="gap-priority">${String(gap.priority || "open").replaceAll("_", " ")}</span>
                  <p>${gap.question || ""}</p>
                </div>`).join("")}
            </div>
          </details>

          ${renderActionScope(network)}
        </div>
      </details>
    </article>
  `;
}


function renderSharedEutrophicationNote() {
  return `<div class="shared-node-note">
    <div class="eyebrow">GEMEINSAMER KNOTEN</div>
    <strong>Eutrophierung</strong>
    <p>Stickstoff und Phosphor können beide zur Nährstoffanreicherung und Eutrophierung beitragen. Der Knoten wird im Wissensgraphen nur einmal geführt und von beiden Pfaden erreicht.</p>
  </div>`;
}


function getMeasurement(network, id) {
  return (network?.measurements || []).find(item => item.id === id) || null;
}

function humanMeasurementLabel(item) {
  const labels = {
    de_n_surplus: "Stickstoffüberschuss Landwirtschaft",
    de_groundwater_2024: "Nitrat im Grundwasser",
    sh_surface_near: "Nitrat im oberflächennahen Grundwasser",
    sh_network_2026: "EUA-/Nitratmessnetz Schleswig-Holstein",
    de_river_p_exceedance: "Gesamtphosphor in Flüssen",
    de_river_p_orientation_values: "Ökologischer Orientierungswert",
    eu_freshwater_p_trend: "Phosphortrend in Europas Süßgewässern",
    de_drinkingwater_pfas20_limit: "Trinkwasser-Grenzwert · PFAS-20",
    de_drinkingwater_pfas4_limit: "Trinkwasser-Grenzwert · PFAS-4",
    de_drinkingwater_screening: "Trinkwasser-Stichprobe Deutschland",
    de_groundwater_monitoring_gap: "PFAS-Monitoring im Grundwasser",
    efsa_twi_pfas4: "Gesundheitsbezogene Aufnahme · PFAS-4"
  };
  return labels[item?.id] || item?.node || item?.metric || item?.id || "Messwert";
}

function renderMeasurementTile(item) {
  if (!item) return "";
  return `
    <div class="nutrient-measurement-tile">
      <span>${humanMeasurementLabel(item)}</span>
      <strong>${measurementValue(item) || "–"}</strong>
      <small>${item.geography || ""}${item.period ? ` · ${item.period}` : ""}</small>
      ${item.interpretation ? `<p>${item.interpretation}</p>` : ""}
    </div>`;
}

function renderPathCard(title, subtitle, steps, crosslinks = []) {
  return `
    <div class="nutrient-path-card">
      <div class="nutrient-path-head">
        <strong>${title}</strong>
        ${subtitle ? `<span>${subtitle}</span>` : ""}
      </div>
      <div class="nutrient-path-flow">
        ${steps.map((step, index) => `
          <span class="path-node">${step}</span>
          ${index < steps.length - 1 ? '<span class="path-arrow">→</span>' : ""}
        `).join("")}
      </div>
      ${crosslinks.length ? `
        <div class="path-crosslinks">
          ${crosslinks.map(link => `<span>↗ ${link}</span>`).join("")}
        </div>` : ""}
    </div>`;
}

function renderNutrientMainView(componentId) {
  const nitrate = knowledgeNetworks.nitrate;
  const phosphorus = knowledgeNetworks.phosphorus;

  const activeBoundary = getBoundary(state.boundaryId);
  if (isEahExtension(activeBoundary)) {
    renderExtensionView(activeBoundary);
    return;
  }

  if (componentId === "nitrogen") {
    const m1 = getMeasurement(nitrate, "de_n_surplus");
    const m2 = getMeasurement(nitrate, "de_groundwater_2024");

    return `
      <div class="nutrient-main">
        <div class="nutrient-main-head">
          <div class="eyebrow">PLANETARE GRENZE · NÄHRSTOFFKREISLÄUFE</div>
          <h2>Stickstoff</h2>
          <p>
            Menschlich erzeugte Stickstoffüberschüsse verändern den Stickstoffkreislauf.
            Daraus entstehen mehrere Wirkungspfade in Wasser, Atmosphäre, Ökosysteme und LEBEN.
          </p>
        </div>

        <div class="nutrient-measurement-grid">
          ${renderMeasurementTile(m1)}
          ${renderMeasurementTile(m2)}
        </div>

        <div class="nutrient-paths">
          ${renderPathCard(
            "Grundwasser & Trinkwasser",
            "ein Pfad über Nitrat",
            ["Stickstoffüberschuss", "Nitrat", "Auswaschung", "Grundwasser", "Trinkwasser", "LEBEN"],
            ["Süßwasser"]
          )}
          ${renderPathCard(
            "Eutrophierung",
            "gemeinsamer Pfad mit Phosphor",
            ["Stickstoffeintrag", "Nährstoffanreicherung", "Eutrophierung", "aquatische Ökosysteme"],
            ["Süßwasser", "Biosphärenintegrität"]
          )}
          ${renderPathCard(
            "Klimawirkung",
            "über Lachgas",
            ["reaktiver Stickstoff", "mikrobielle Umsetzung", "N₂O", "Klimawandel"],
            ["Klimawandel"]
          )}
        </div>

        ${renderActionScope(nitrate)}
      </div>`;
  }

  if (componentId === "phosphorus") {
    const m1 = getMeasurement(phosphorus, "de_river_p_exceedance");
    const m2 = getMeasurement(phosphorus, "de_river_p_orientation_values");

    return `
      <div class="nutrient-main">
        <div class="nutrient-main-head">
          <div class="eyebrow">PLANETARE GRENZE · NÄHRSTOFFKREISLÄUFE</div>
          <h2>Phosphor</h2>
          <p>
            Phosphoreinträge aus Landwirtschaft, Erosion und Abwasser verändern vor allem
            Oberflächengewässer und können Eutrophierung verstärken.
          </p>
        </div>

        <div class="nutrient-measurement-grid">
          ${renderMeasurementTile(m1)}
          ${renderMeasurementTile(m2)}
        </div>

        <div class="nutrient-paths">
          ${renderPathCard(
            "Oberflächenwasser & Eutrophierung",
            "zentraler Phosphorpfad",
            ["Phosphoreintrag", "Oberflächenwasser", "Eutrophierung", "Algen / Cyanobakterien", "Ökosysteme"],
            ["Süßwasser", "Biosphärenintegrität"]
          )}
          ${renderPathCard(
            "Gesundheitsrelevanter Folgepfad",
            "nur bei belastbarer Cyanotoxin-Exposition",
            ["Eutrophierung", "Cyanobakterien", "Cyanotoxine", "Trink-/Badegewässer", "Exposition", "LEBEN"],
            ["Gesundheitsbezug"]
          )}
        </div>

        ${renderActionScope(phosphorus)}
      </div>`;
  }

  return `
    <div class="nutrient-choice-note">
      <strong>Wähle Stickstoff oder Phosphor.</strong>
      <p>Danach zeigt WIRKUNG nur den passenden Ausschnitt des Wissensnetzes.</p>
    </div>`;
}


function getActiveViewState() {
  return {
    boundaryId: selectedBoundaryId || null,
    itemId: selectedItemId || null,
    componentId: selectedDomainComponent || null
  };
}

function isNutrientBoundaryActive() {
  return getActiveViewState().boundaryId === "nutrients";
}

function isFreshwaterBoundaryActive() {
  return getActiveViewState().boundaryId === "freshwater";
}

function syncBoundaryModeClass() {
  document.body.classList.toggle("nutrient-mode", isNutrientBoundaryActive());
}


function setStandardEffectBlocksVisible(visible) {
  const targets = [
    timeSlider?.closest(".time-card"),
    metricValue?.closest(".metrics"),
    findingText?.closest(".accordion"),
    effectPath?.closest(".accordion"),
    uncertaintyValue?.closest(".accordion")
  ].filter(Boolean);

  targets.forEach(element => {
    element.style.display = visible ? "" : "none";
  });
}


function setStandardFocusCardVisible(visible) {
  const focusCard =
    focusTitle?.closest(".focus-card, .effect-focus, .state-card, article, section")
    || focusTitle?.parentElement;

  if (focusCard) {
    focusCard.style.display = visible ? "" : "none";
  }
}


function renderNovelShell() {
  const state = getActiveViewState();
  if (state.boundaryId !== "novel") return;

  if (focusType) focusType.textContent = "PLANETARE GRENZE · NEUE SUBSTANZEN";
  if (focusTitle) focusTitle.textContent = state.componentId === "pfas" ? "PFAS" : "Neue Substanzen";
  if (focusSummary) {
    focusSummary.textContent = state.componentId === "pfas"
      ? "Messwerte, Expositionspfade und gesundheitliche Referenzen für PFAS."
      : "Wähle links einen Teilbereich.";
  }
}

function renderPfasMainView() {
  const network = knowledgeNetworks.pfas;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>PFAS-Datensatz konnte nicht geladen werden.</strong></div>`;
  }

  const m20 = getMeasurement(network, "de_drinkingwater_pfas20_limit");
  const mSample = getMeasurement(network, "de_drinkingwater_screening");
  const mTwi = getMeasurement(network, "efsa_twi_pfas4");

  return `
    <div class="nutrient-main">
      <div class="nutrient-main-head">
        <div class="eyebrow">PLANETARE GRENZE · NEUE SUBSTANZEN</div>
        <h2>PFAS</h2>
        <p>
          PFAS sind ein Beispiel innerhalb der Planetaren Grenze Neue Substanzen.
          Sie besitzen keine eigene planetare Kontrollgröße. Entscheidend sind konkrete
          Umweltmessungen, Expositionswege und gesundheitsbezogene Referenzen.
        </p>
      </div>

      <div class="knowledge-scope-note">
        <strong>Planetarer Kontext:</strong>
        Die Grenze Neue Substanzen gilt auf Systemebene als überschritten.
        Daraus folgt jedoch kein einzelner globaler „PFAS-Grenzwert“.
      </div>

      <div class="nutrient-measurement-grid">
        ${renderMeasurementTile(m20)}
        ${renderMeasurementTile(mSample)}
        ${renderMeasurementTile(mTwi)}
      </div>

      <div class="nutrient-paths">
        ${renderPathCard(
          "Wasserpfad",
          "Verbindung zu Süßwasser",
          ["PFAS-Nutzung / Freisetzung","Boden / Grundwasser","Trinkwasser","Exposition","LEBEN"],
          ["Süßwasser"]
        )}

        ${renderPathCard(
          "Nahrungspfad",
          "weitere wichtige Exposition",
          ["PFAS in Umwelt","Nahrungskette","Lebensmittel","Aufnahme","LEBEN"],
          []
        )}

        ${renderPathCard(
          "Gesundheitsbewertung",
          "Evidenz ist stoff- und endpunktspezifisch",
          ["PFAS-Exposition","innere Belastung","immunologische / weitere Wirkungen","Gesundheit"],
          ["WHO: weitere Bewertung läuft"]
        )}
      </div>

      ${renderActionScope(network)}

      <details class="knowledge-details">
        <summary>Wissenslücken (${(network.knowledgeGaps || []).length})</summary>
        <div class="knowledge-gap-list">
          ${(network.knowledgeGaps || []).map(gap => `
            <div class="knowledge-gap">
              <span class="gap-priority">${String(gap.priority || "open").replaceAll("_"," ")}</span>
              <p>${gap.question}</p>
            </div>`).join("")}
        </div>
      </details>
    </div>`;
}

function renderNutrientShell() {
  const state = getActiveViewState();
  if (!isNutrientBoundaryActive()) return;

  if (focusType) focusType.textContent = "PLANETARE GRENZE · NÄHRSTOFFKREISLÄUFE";

  if (focusTitle) {
    focusTitle.textContent =
      state.componentId === "nitrogen" ? "Stickstoff" :
      state.componentId === "phosphorus" ? "Phosphor" :
      "Nährstoffkreisläufe";
  }

  if (focusSummary) {
    focusSummary.textContent =
      state.componentId === "nitrogen"
        ? "Messwerte und Wirkungspfade des Stickstoffkreislaufs."
        : state.componentId === "phosphorus"
          ? "Messwerte und Wirkungspfade des Phosphorkreislaufs."
          : "Wähle links Stickstoff oder Phosphor.";
  }
}


function renderOilEnergyMainView() {
  const network = knowledgeNetworks.oilEnergy;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Öl-/Energie-Pilotdatensatz nicht geladen.</strong></div>`;
  }

  const measurementLabels = {
    world_oil_production_2023_eia: "Globale Ölproduktion",
    world_oil_demand_2024_iea: "Globale Ölnachfrage / Verbrauch",
    world_liquid_fuels_production_2024_eia: "Globale flüssige Kraftstoffproduktion",
    oil_co2_share_2024_gcb: "Öl als fossiler CO₂-Treiber"
  };

  const cards = (network.measurements || []).map(m => {
    const derived = m.derivedApproximation
      ? `<div class="oil-derived"><strong>Abgeleitet:</strong> ${m.derivedApproximation.display}<br><span>${m.derivedApproximation.warning}</span></div>`
      : "";
    return `
      <article class="measurement-card oil-measurement-card">
        <div class="measurement-card-label">${measurementLabels[m.id] || m.metric || m.id}</div>
        <div class="measurement-card-value">${m.display || "–"}</div>
        <div class="measurement-card-meta">${m.period || ""} · ${m.geography || ""}</div>
        <p>${m.interpretation || ""}</p>
        ${m.definition ? `<p class="measurement-definition">${m.definition}</p>` : ""}
        ${derived}
      </article>`;
  }).join("");

  const interactions = network.boundaryInteractions || [];
  const linkCards = interactions.map(x => `
    <div class="oil-boundary-link">
      <strong>↗ ${x.boundaries.slice(1).join(" / ")}</strong>
      <p>${x.mechanism}</p>
      <span>Evidenz: ${x.evidenceStatus || "–"}</span>
    </div>`).join("");

  const gaps = (network.knowledgeGaps || []).map(g =>
    `<p><strong>${g.question}</strong>${g.reason ? `<br><span>${g.reason}</span>` : ""}</p>`
  ).join("");

  const action = network.actionScope || {};
  const actionRows = (action.dimensions || []).map(d =>
    `<p><strong>${d.label}: ${d.level}</strong><br>${d.rationale}</p>`
  ).join("");

  return `
    <div class="oil-pilot">
      <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE · STOFF- UND ENERGIESTRÖME</div>
      <h2>Energie → Erdöl</h2>
      <p class="oil-lead">
        Dieser Pilot misst menschlichen Stoff- und Energiedurchsatz. Produktion,
        Nachfrage/Verbrauch und CO₂-Emissionen bleiben getrennte Größen.
        <strong>Barrel pro Tag ist kein planetarer Grenzwert.</strong>
      </p>

      <div class="oil-path">
        <span>Stoff- und Energieströme</span><b>→</b><span>Energie</span><b>→</b><span>Erdöl</span>
      </div>

      <h3>MESSWERTE</h3>
      <div class="measurement-grid">${cards}</div>

      <h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3>
      <div class="oil-boundary-links">${linkCards}</div>

      <details>
        <summary>Quellen · frei zugänglich</summary>
        ${allOpenSourcesHtml(network)}
      </details>

      <details>
        <summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>
        ${gaps}
      </details>

      <details>
        <summary>Handlungsspielraum</summary>
        <p>${action.methodNote || ""}</p>
        ${actionRows}
      </details>
    </div>`;
}


function renderCoalEnergyMainView() {
  const network = knowledgeNetworks.coalEnergy;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Kohle-Pilotdatensatz nicht geladen.</strong></div>`;
  }

  const labels = {
    world_coal_production_2024_iea: "Globale Kohleproduktion",
    world_coal_demand_2024_iea: "Globale Kohlenachfrage / Verbrauch",
    world_coal_power_2024_iea: "Stromerzeugung aus Kohle",
    coal_co2_share_2024_gcb: "Kohle als fossiler CO₂-Treiber"
  };

  const cards = (network.measurements || []).map(m => {
    const derived = m.derivedApproximation
      ? `<div class="oil-derived"><strong>Abgeleitet:</strong> ${m.derivedApproximation.display}<br><span>${m.derivedApproximation.warning}</span></div>`
      : "";
    return `
      <article class="measurement-card oil-measurement-card">
        <div class="measurement-card-label">${labels[m.id] || m.metric || m.id}</div>
        <div class="measurement-card-value">${m.display || "–"}</div>
        <div class="measurement-card-meta">${m.period || ""} · ${m.geography || ""}</div>
        <p>${m.interpretation || ""}</p>
        ${derived}
      </article>`;
  }).join("");

  const linkCards = (network.boundaryInteractions || []).map(x => `
    <div class="oil-boundary-link">
      <strong>↗ ${x.boundaries.slice(1).join(" / ")}</strong>
      <p>${x.mechanism}</p>
      <span>Evidenz: ${x.evidenceStatus || "–"}</span>
    </div>`).join("");

  const gaps = (network.knowledgeGaps || []).map(g =>
    `<p><strong>${g.question}</strong>${g.reason ? `<br><span>${g.reason}</span>` : ""}</p>`
  ).join("");

  const action = network.actionScope || {};
  const actionRows = (action.dimensions || []).map(d =>
    `<p><strong>${d.label}: ${String(d.level || "").replaceAll("_"," ")}</strong><br>${d.rationale}</p>`
  ).join("");

  return `
    <div class="oil-pilot">
      <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE · STOFF- UND ENERGIESTRÖME</div>
      <h2>Energie → Kohle</h2>
      <p class="oil-lead">
        Der Kohle-Pilot nutzt dieselbe <strong>system_flow</strong>-Logik wie Erdöl.
        Produktion, Nachfrage, Stromerzeugung und CO₂-Emissionen bleiben getrennte Größen.
        <strong>Tonnen pro Jahr sind kein planetarer Grenzwert.</strong>
      </p>

      <div class="oil-path">
        <span>Stoff- und Energieströme</span><b>→</b><span>Energie</span><b>→</b><span>Kohle</span>
      </div>

      <h3>MESSWERTE</h3>
      <div class="measurement-grid">${cards}</div>

      <h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3>
      <div class="oil-boundary-links">${linkCards}</div>

      <details>
        <summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>
        ${gaps}
      </details>

      <details>
        <summary>Handlungsspielraum</summary>
        <p>${action.methodNote || ""}</p>
        ${actionRows}
      </details>
    </div>`;
}


function renderWindEnergyMainView() {
  const network = knowledgeNetworks.windEnergy;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Wind-Pilotdatensatz nicht geladen.</strong></div>`;
  }

  const labels = {
    world_wind_capacity_2024_irena: "Installierte Windleistung",
    world_wind_additions_2024_irena: "Wind-Zubau 2024",
    world_wind_generation_2024_ember: "Stromerzeugung aus Wind",
    world_wind_generation_growth_2024_iea: "Zuwachs der Windstromerzeugung"
  };

  const cards = (network.measurements || []).map(m => `
    <article class="measurement-card oil-measurement-card">
      <div class="measurement-card-label">${labels[m.id] || m.metric || m.id}</div>
      <div class="measurement-card-value">${m.display || "–"}</div>
      <div class="measurement-card-meta">${m.period || ""} · ${m.geography || ""}</div>
      <p>${m.interpretation || ""}</p>
    </article>`).join("");

  const linkCards = (network.boundaryInteractions || []).map(x => `
    <div class="oil-boundary-link">
      <strong>${x.direction === "reduces_pressure_on_boundary" ? "↘" : "↗"} ${x.boundaries.slice(1).join(" / ")}</strong>
      <p>${x.mechanism}</p>
      <span>Evidenz: ${x.evidenceStatus || "–"}</span>
      ${x.caution ? `<p><em>${x.caution}</em></p>` : ""}
    </div>`).join("");

  const gaps = (network.knowledgeGaps || []).map(g =>
    `<p><strong>${g.question}</strong>${g.reason ? `<br><span>${g.reason}</span>` : ""}${g.workingDecision ? `<br><span>Arbeitsstand: ${g.workingDecision}</span>` : ""}</p>`
  ).join("");

  const action = network.actionScope || {};
  const actionRows = (action.dimensions || []).map(d =>
    `<p><strong>${d.label}: ${String(d.level || "").replaceAll("_"," ")}</strong><br>${d.rationale}</p>`
  ).join("");

  return `
    <div class="oil-pilot">
      <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE · STOFF- UND ENERGIESTRÖME</div>
      <h2>Energie → Wind</h2>
      <p class="oil-lead">
        Wind besitzt keinen Brennstoffdurchsatz. Deshalb stehen hier installierte Leistung,
        Ausbau und tatsächliche Stromerzeugung als getrennte <strong>system_flow</strong>-Größen.
      </p>

      <div class="oil-path">
        <span>Stoff- und Energieströme</span><b>→</b><span>Energie</span><b>→</b><span>Wind</span>
      </div>

      <h3>MESSWERTE</h3>
      <div class="measurement-grid">${cards}</div>

      <h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3>
      <div class="oil-boundary-links">${linkCards}</div>

      <details>
        <summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>
        ${gaps}
      </details>

      <details>
        <summary>Handlungsspielraum</summary>
        <p>${action.methodNote || ""}</p>
        ${actionRows}
      </details>
    </div>`;
}


function renderSolarEnergyMainView() {
  const network = knowledgeNetworks.solarEnergy;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Solar-Pilotdatensatz nicht geladen.</strong></div>`;
  }

  const labels = {
    world_solar_capacity_2024_irena: "Installierte Solarleistung",
    world_solar_additions_2024_irena: "Solar-Zubau 2024",
    world_solar_generation_2024_iea: "Stromerzeugung aus Solar PV"
  };

  const cards = (network.measurements || []).map(m => `
    <article class="measurement-card oil-measurement-card">
      <div class="measurement-card-label">${labels[m.id] || m.metric || m.id}</div>
      <div class="measurement-card-value">${m.display || "–"}</div>
      <div class="measurement-card-meta">${m.period || ""} · ${m.geography || ""}</div>
      <p>${m.interpretation || ""}</p>
      ${m.shareOfGlobalElectricity != null
        ? `<p><strong>Anteil an globaler Stromerzeugung:</strong> ${m.shareOfGlobalElectricity} %</p>`
        : ""}
    </article>`).join("");

  const linkCards = (network.boundaryInteractions || []).map(x => `
    <div class="oil-boundary-link">
      <strong>${x.direction === "reduces_pressure_on_boundary" ? "↘" : "↗"} ${x.boundaries.slice(1).join(" / ")}</strong>
      <p>${x.mechanism}</p>
      <span>Evidenz: ${x.evidenceStatus || "–"}</span>
      ${x.caution ? `<p><em>${x.caution}</em></p>` : ""}
    </div>`).join("");

  const gaps = (network.knowledgeGaps || []).map(g =>
    `<p><strong>${g.question}</strong>${g.reason ? `<br><span>${g.reason}</span>` : ""}${g.workingDecision ? `<br><span>Arbeitsstand: ${g.workingDecision}</span>` : ""}</p>`
  ).join("");

  const action = network.actionScope || {};
  const actionRows = (action.dimensions || []).map(d =>
    `<p><strong>${d.label}: ${String(d.level || "").replaceAll("_"," ")}</strong><br>${d.rationale}</p>`
  ).join("");

  return `
    <div class="oil-pilot">
      <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE · STOFF- UND ENERGIESTRÖME</div>
      <h2>Energie → Solar</h2>
      <p class="oil-lead">
        Solar besitzt keinen Brennstoffdurchsatz. Installierte Leistung, Ausbau und
        tatsächliche Stromerzeugung bleiben deshalb getrennte <strong>system_flow</strong>-Größen.
      </p>

      <div class="oil-path">
        <span>Stoff- und Energieströme</span><b>→</b><span>Energie</span><b>→</b><span>Solar</span>
      </div>

      <h3>MESSWERTE</h3>
      <div class="measurement-grid">${cards}</div>

      <h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3>
      <div class="oil-boundary-links">${linkCards}</div>

      <details>
        <summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>
        ${gaps}
      </details>

      <details>
        <summary>Handlungsspielraum</summary>
        <p>${action.methodNote || ""}</p>
        ${actionRows}
      </details>
    </div>`;
}



function sourceMap(network) {
  return Object.fromEntries((network?.sources || []).map(source => [source.id, source]));
}

function sourceLinksHtml(network, sourceRefs = []) {
  const sources = sourceMap(network);
  const links = sourceRefs
    .map(id => sources[id])
    .filter(Boolean)
    .filter(source => source.access === "open_full_text" && source.url)
    .map(source => {
      const author = source.authors
        ? source.authors.split(",")[0].replace(" et al.", "")
        : source.publisher || "Quelle";
      const venue = source.journal || source.publisher || "";
      const label = `${author}${source.year ? ` et al. (${source.year})` : ""}${venue ? ` · ${venue}` : ""}`;
      return `<a class="study-source-link" href="${source.url}" target="_blank" rel="noopener noreferrer">↗ ${label} · freier Volltext</a>`;
    });

  return links.length
    ? `<div class="study-source-links">${links.join("")}</div>`
    : `<div class="study-source-missing">Keine öffentlich zugängliche Volltextquelle hinterlegt – dieser Studienwert darf nicht angezeigt werden.</div>`;
}

function allOpenSourcesHtml(network) {
  return (network?.sources || [])
    .filter(source => source.access === "open_full_text" && source.url)
    .map(source => {
      const title = source.title || source.id;
      const meta = [source.authors || source.publisher, source.journal, source.year].filter(Boolean).join(" · ");
      return `<p class="source-list-item"><a href="${source.url}" target="_blank" rel="noopener noreferrer">↗ ${title}</a><br><span>${meta}</span></p>`;
    }).join("");
}


function getKnowledgeIndex() {
  return knowledgeNetworks.knowledgeIndex || null;
}

function normalizeKnowledgeId(value) {
  return String(value || "").trim().toLowerCase().replaceAll("_", "-");
}

function findDataBoundaryForIndexGroup(indexBoundary, group) {
  const aliases = {
    "climate-change": "climate",
    "biosphere-integrity": "biosphere",
    "land-system-change": "land",
    "freshwater-change": "freshwater",
    "biogeochemical-flows": "nutrients",
    "ocean-acidification": "ocean",
    "atmospheric-aerosol-loading": "aerosols",
    "stratospheric-ozone-depletion": "ozone",
    "novel-entities": "novel"
  };

  if (indexBoundary?.id === "eah_tech_social_environment") {
    return data.boundaries.find(item => item.id === "mental-load") || null;
  }
  if (indexBoundary?.id === "eah_material_energy_flows") {
    return data.boundaries.find(item => item.id === "materials-energy") || null;
  }

  const groupId = normalizeKnowledgeId(group?.id);
  const aliasId = aliases[groupId];
  if (aliasId) return data.boundaries.find(item => item.id === aliasId) || null;

  const groupLabel = String(group?.label || "").toLowerCase();
  return data.boundaries.find(boundary =>
    normalizeKnowledgeId(boundary.id) === groupId ||
    String(boundary.label || "").toLowerCase() === groupLabel
  ) || null;
}

function syncKnowledgeNavigationFromIndex() {
  const index = getKnowledgeIndex();
  if (!index?.systemBoundaries?.length) return;

  for (const indexBoundary of index.systemBoundaries) {
    if (indexBoundary.id === "eah_tech_social_environment") {
      const boundary = data.boundaries.find(item => item.id === "mental-load");
      if (!boundary) continue;
      boundary.enabled = true;
      boundary.items = (indexBoundary.groups || []).flatMap(group => [
        {
          id: normalizeKnowledgeId(group.id),
          scope: "all",
          label: group.label,
          enabled: true,
          groupOnly: true,
          knowledgeBoundaryId: indexBoundary.id,
          knowledgeGroupId: group.id
        },
        ...(group.items || []).map(item => ({
          id: normalizeKnowledgeId(item.id),
          scope: "all",
          label: `↳ ${item.label}`,
          enabled: true,
          knowledgeSource: item.source,
          knowledgeItemId: item.id,
          knowledgeGroupId: group.id,
          knowledgeBoundaryId: indexBoundary.id
        }))
      ]);
      continue;
    }

    if (indexBoundary.id === "eah_material_energy_flows") {
      const boundary = data.boundaries.find(item => item.id === "materials-energy");
      if (!boundary) continue;
      const existing = (boundary.items || []).filter(item => !item.knowledgeSource);
      const indexedGroups = (indexBoundary.groups || []).flatMap(group => [
        {
          id: normalizeKnowledgeId(group.id),
          scope: "all",
          label: group.label,
          enabled: true,
          groupOnly: true,
          menuHeading: true,
          knowledgeBoundaryId: indexBoundary.id,
          knowledgeGroupId: group.id
        },
        ...(group.items || []).map(item => ({
          id: normalizeKnowledgeId(item.id),
          scope: "all",
          label: `↳ ${item.label}`,
          enabled: true,
          knowledgeSource: item.source,
          knowledgeItemId: item.id,
          knowledgeGroupId: group.id,
          knowledgeBoundaryId: indexBoundary.id,
          menuType: item.type || "component"
        }))
      ]);
      boundary.items = [...existing, ...indexedGroups];
      boundary.enabled = true;
      continue;
    }

    for (const group of indexBoundary.groups || []) {
      const boundary = findDataBoundaryForIndexGroup(indexBoundary, group);
      if (!boundary) continue;
      let indexedItems = (group.items || []).map(item => ({
        id: normalizeKnowledgeId(item.id),
        scope: "all",
        label: item.label,
        enabled: true,
        knowledgeSource: item.source,
        knowledgeItemId: item.id,
        knowledgeGroupId: group.id,
        knowledgeBoundaryId: indexBoundary.id,
        menuType: item.type || "control",
        parentId: item.parentId || null,
        depthOf: item.parentId || item.depthOf || null
      }));
      if (!indexedItems.length) continue;

      // Der Knowledge-Index ist für gleichnamige Unterpunkte die maßgebliche Quelle.
      // Bereits fest programmierte Legacy-Einträge mit derselben ID werden ersetzt,
      // statt zusätzlich neben dem Index-Eintrag stehen zu bleiben.
      const indexedIds = new Set(indexedItems.map(item => normalizeKnowledgeId(item.id)));
      const existing = (boundary.items || []).filter(item =>
        !item.knowledgeSource &&
        !indexedIds.has(normalizeKnowledgeId(item.id))
      );
      boundary.items = [...existing, ...indexedItems];
      boundary.enabled = true;
    }
  }
}

function getKnowledgeIndexEntry(boundaryId, componentId) {
  const boundary = data.boundaries.find(item => item.id === boundaryId);
  const selectedItem = boundary?.items?.find(item => item.id === componentId);
  if (selectedItem?.knowledgeSource) {
    const index = getKnowledgeIndex();
    for (const indexBoundary of index?.systemBoundaries || []) {
      for (const group of indexBoundary.groups || []) {
        const item = (group.items || []).find(candidate => candidate.source === selectedItem.knowledgeSource);
        if (item) return { type: "item", boundary: indexBoundary, group, item };
      }
    }
  }

  const normalized = normalizeKnowledgeId(componentId);
  for (const indexBoundary of getKnowledgeIndex()?.systemBoundaries || []) {
    for (const group of indexBoundary.groups || []) {
      if (normalizeKnowledgeId(group.id) === normalized) {
        return { type: "group", boundary: indexBoundary, group };
      }
      for (const item of group.items || []) {
        if (normalizeKnowledgeId(item.id) === normalized) {
          return { type: "item", boundary: indexBoundary, group, item };
        }
      }
    }
  }
  return null;
}

function getKnowledgeNetworkBySource(source) {
  if (!source) return null;
  const key = Object.keys(data.knowledgeSources || {}).find(
    name => data.knowledgeSources[name] === source
  );
  return key ? knowledgeNetworks[key] : null;
}

function genericStudyCard(network, m) {
  const displayType = m.displayType ||
    (m.unit === "participants" ? "study_evidence" : "study_value");
  const age = m.context?.ageRange
    ? `${m.context.ageRange.min}–${m.context.ageRange.max} Jahre`
    : "";
  return {
    displayType,
    html: `
      <article class="measurement-card oil-measurement-card">
        <div class="measurement-card-label">${m.metric || m.id}</div>
        <div class="measurement-card-value">${m.display || "–"}</div>
        <div class="measurement-card-meta">${[m.period, m.geography, age].filter(Boolean).join(" · ")}</div>
        ${m.interpretation ? `<p>${m.interpretation}</p>` : ""}
        ${m.uncertainty ? `<p><strong>Unsicherheit:</strong> ${m.uncertainty}</p>` : ""}
        ${sourceLinksHtml(network, m.sourceRefs)}
      </article>`
  };
}

function deriveGenericPathways(network) {
  if (Array.isArray(network.pathways) && network.pathways.length) return network.pathways;

  const labels = Object.fromEntries((network.nodes || []).map(n => [n.id, n.label]));
  const outgoing = new Map();
  for (const edge of network.edges || []) {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    outgoing.get(edge.from).push(edge);
  }

  const paths = [];
  for (const start of (network.nodes || []).filter(n => n.type === "exposure").slice(0, 3)) {
    const chain = [start.id];
    const seen = new Set(chain);
    let current = start.id;

    for (let depth = 0; depth < 5; depth++) {
      const next = (outgoing.get(current) || []).find(edge => !seen.has(edge.to));
      if (!next) break;
      chain.push(next.to);
      seen.add(next.to);
      current = next.to;
    }

    if (chain.length >= 3) {
      paths.push({
        label: labels[start.id] || "Wirkungspfad",
        chain: chain.map(id => labels[id] || id),
        evidenceStatus: "aus Graphstruktur abgeleitet"
      });
    }
  }
  return paths;
}

function genericHealthReadout(network) {
  const impacts = network?.healthContext?.systemImpacts || [];
  if (!impacts.length) {
    return "Kein direkter Organmarker. Gesundheitsbezüge werden erst über konkrete Wirkungspfade dargestellt.";
  }
  return `${impacts.map(x => x.label || x.system).join(" · ")}: systemischer Gesundheitsbezug; kein Organmarker allein aufgrund des Oberthemas.`;
}

function renderGenericKnowledgeView(network, indexEntry) {
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Knowledge-Datensatz nicht geladen.</strong></div>`;
  }

  const presentation = network.presentation || {};
  const primaryMeasurement = getPrimaryKnowledgeMeasurement(network);
  const measurements = presentation.hidePrimaryMeasurementInKnowledgeView
    ? (network.measurements || []).filter(m => m.id !== primaryMeasurement?.id)
    : (network.measurements || []);
  const cards = measurements.map(m => genericStudyCard(network, m));
  const evidence = cards.filter(c => c.displayType === "study_evidence");
  const values = cards.filter(c => c.displayType !== "study_evidence");

  const pathways = deriveGenericPathways(network).map(p => `
    <div class="oil-boundary-link">
      <strong>${p.label || "Wirkungspfad"}</strong>
      <p>${(p.chain || p.path || []).map(x => typeof x === "string" ? x : x.label).filter(Boolean).join(" → ")}</p>
      ${p.evidenceStatus ? `<span>Evidenz: ${p.evidenceStatus}</span>` : ""}
      ${p.caution ? `<p><em>${p.caution}</em></p>` : ""}
    </div>`).join("");

  const gaps = (network.knowledgeGaps || []).map(g => `
    <p><strong>${g.question}</strong>
      ${g.workingDecision ? `<br><span>Arbeitsstand: ${g.workingDecision}</span>` : ""}
      ${g.reason ? `<br><span>${g.reason}</span>` : ""}
    </p>`).join("");

  const action = network.actionScope || {};
  const actionRows = (action.dimensions || []).map(d =>
    `<p><strong>${d.label}: ${String(d.level || "").replaceAll("_", " ")}</strong><br>${d.rationale}</p>`
  ).join("");

  const boundaryLabel = indexEntry?.boundary?.label || network.entry?.systemBoundary || "Knowledge";
  const groupLabel = indexEntry?.group?.label || network.entry?.domainComponent || "Knowledge";
  const itemLabel = indexEntry?.item?.label || network.entry?.subComponent || network.topic || "Thema";
  const isExtension = indexEntry?.boundary?.id?.startsWith("eah_");

  return `
    <div class="oil-pilot generic-knowledge-view">
      ${presentation.compactKnowledgeView ? `<div class="eyebrow">ERGÄNZENDE STUDIENWERTE UND WIRKUNGSPFADE</div>` : `
        <div class="eyebrow">${isExtension ? "ERGÄNZENDE SYSTEMGRENZE" : "PLANETARE GRENZE"} · ${boundaryLabel}</div>
        <h2>${groupLabel} → ${itemLabel}</h2>
        <p class="oil-lead">${network.corePrinciples?.[0] || network.topic || ""}</p>
        <div class="oil-path">
          <span>${boundaryLabel}</span><b>→</b>
          <span>${groupLabel}</span><b>→</b><span>${itemLabel}</span>
        </div>
      `}

      ${evidence.length ? `<h3>STUDIENBELEGE</h3><div class="measurement-grid">${evidence.map(c => c.html).join("")}</div>` : ""}
      ${values.length ? `${presentation.compactKnowledgeView ? "" : "<h3>STUDIENWERTE</h3>"}<div class="measurement-grid">${values.map(c => c.html).join("")}</div>` : ""}

      <h3>WIRKUNGSPFADE</h3>
      <div class="oil-boundary-links">${pathways || "<p>Noch keine Wirkungspfade hinterlegt.</p>"}</div>

      ${network.sourcePolicy?.rule ? `<div class="extension-note"><strong>Quellenregel:</strong> ${network.sourcePolicy.rule}</div>` : ""}

      <div class="extension-note"><strong>Gesundheitsbezug:</strong> ${genericHealthReadout(network)}</div>

      <details>
        <summary>Quellen · frei zugänglich</summary>
        ${allOpenSourcesHtml(network)}
      </details>

      <details>
        <summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>
        ${gaps}
      </details>

      <details>
        <summary>Handlungsspielraum</summary>
        <p>${action.methodNote || ""}</p>
        ${actionRows}
      </details>
    </div>`;
}

function renderTechSocialGroupIntro(group) {
  return `
    <div class="extension-intro">
      <div class="eyebrow">TECHNOLOGISCHE & SOZIALE UMWELT</div>
      <h2>${group?.label || "Bereich"}</h2>
      <p>Dieser Bereich wird über konkrete Expositionen und Wirkungspfade erschlossen.</p>
      <div class="extension-note">
        <strong>Bereits hinterlegte Knowledge:</strong>
        ${(group?.items || []).map(item => `<p>${item.label}</p>`).join("")}
      </div>
    </div>`;
}


function getKnowledgeSource(network, measurement) {
  const ids = measurement?.sourceRefs || [];
  return (network?.sources || []).find(source => ids.includes(source.id)) || null;
}

function getPrimaryKnowledgeMeasurement(network) {
  const preferredId = network?.presentation?.primaryMeasurementId;
  if (preferredId) {
    const preferred = (network.measurements || []).find(item => item.id === preferredId);
    if (preferred) return preferred;
  }
  return (network?.measurements || []).find(item => item.displayType !== "study_evidence")
    || (network?.measurements || [])[0]
    || null;
}


function getActiveKnowledgeContext() {
  const state = getActiveViewState();
  const boundary = getBoundary(state.boundaryId);
  const item = boundary?.items?.find(entry => entry.id === state.itemId);
  if (!item?.knowledgeSource || state.boundaryId === "mental-load") return null;
  const rawNetwork = getKnowledgeNetworkBySource(item.knowledgeSource);
  return {
    state,
    boundary,
    item,
    network: getKnowledgeNetworkForItem(rawNetwork, item),
    indexEntry: getKnowledgeIndexEntry(state.boundaryId, state.itemId)
  };
}

function getKnowledgeSeries(network) {
  const preferredId = network?.presentation?.primaryTimeSeriesId;
  if (preferredId) {
    const preferred = (network?.timeSeries || []).find(series => series.id === preferredId);
    if (preferred) return preferred;
  }
  return (network?.timeSeries || [])[0] || null;
}

function getKnowledgeSeriesPoint(network, year) {
  const series = getKnowledgeSeries(network);
  return (series?.points || []).find(point => Number(point.year) === Number(year)) || null;
}

function getKnowledgePointSource(network, point, series) {
  const ids = point?.sourceRefs || series?.sourceRefs || [];
  return (network?.sources || []).find(source => ids.includes(source.id)) || null;
}

function setKnowledgePointDetails(network, activeBoundary, activeItem, point = null, noMeasurementYear = null) {
  const series = getKnowledgeSeries(network);
  const presentation = network?.presentation || {};
  const firstPathway = (network?.pathways || [])[0];

  const frameworkLabel = activeBoundary?.framework === "eah_extension"
    ? (activeBoundary.frameworkLabel || "Ergänzende Systemgrenze").toUpperCase()
    : "PLANETARE GRENZE";
  if (focusType) focusType.textContent = `${frameworkLabel} · ${activeBoundary?.label || ""}`;
  const itemLabel = String(activeItem?.label || "").replace(/^↳\s*/, "");
  if (focusTitle) focusTitle.textContent = `${activeBoundary?.label || ""} · ${itemLabel}`;
  if (focusSummary) focusSummary.textContent =
    network?.entry?.effectFocus || network?.topic || "Knowledge-Datensatz aus dem zentralen Index.";

  if (noMeasurementYear !== null) {
    metricValue.textContent = "kein Messpunkt";
    referenceValue.textContent = series?.reference?.display || presentation.referenceLabel || "–";
    periodValue.textContent = String(noMeasurementYear);
    findingText.textContent = `Für ${noMeasurementYear} ist in dieser Knowledge-Zeitreihe kein Messpunkt hinterlegt. Es wird nichts interpoliert.`;
    effectPath.textContent = presentation.effectPath || firstPathway?.label || "–";
    uncertaintyValue.textContent = "Keine Zwischenwerte werden erfunden. Wähle einen tatsächlich hinterlegten Messzeitpunkt.";
    lifeNote.textContent = genericHealthReadout(network);
    setLink("–", null);
    renderHealth(null);
    updateCauseButtons(null, null);
    return;
  }

  if (point && series) {
    const source = getKnowledgePointSource(network, point, series);
    metricValue.textContent = point.display || `${point.value ?? "–"} ${series.unit || ""}`.trim();
    referenceValue.textContent = series.reference?.display || presentation.referenceLabel || "–";
    periodValue.textContent = String(point.year);
    findingText.textContent = point.finding || series.finding || presentation.finding || "–";
    effectPath.textContent = presentation.effectPath || firstPathway?.label || "–";
    uncertaintyValue.textContent = point.uncertainty || series.uncertainty || presentation.uncertainty || "–";
    lifeNote.textContent = genericHealthReadout(network);
    if (source?.url) setLink(source.title || source.publisher || "Quelle", source.url);
    else setLink("–", null);
    // Globale Klimazustandswerte allein aktivieren bewusst keine Organkuller.
    renderHealth(null);
    updateCauseButtons(null, null);
    return;
  }

  const measurement = getPrimaryKnowledgeMeasurement(network);
  const source = getKnowledgeSource(network, measurement);
  metricValue.textContent = measurement?.display || measurementValue(measurement) || "–";
  referenceValue.textContent = presentation.referenceLabel || "–";
  periodValue.textContent = measurement?.period || "–";
  findingText.textContent = presentation.finding || measurement?.interpretation || "–";
  effectPath.textContent = presentation.effectPath || firstPathway?.label || "–";
  uncertaintyValue.textContent = presentation.uncertainty || measurement?.uncertainty || "–";
  lifeNote.textContent = genericHealthReadout(network);
  if (source?.url) setLink(source.title || source.publisher || "Quelle", source.url);
  else setLink("–", null);
  renderHealth(null);
  updateCauseButtons(null, null);
}

function renderKnowledgeTime(network) {
  const series = getKnowledgeSeries(network);
  const points = series?.points || [];
  const blc = data.timePresets.blc;

  dataWindowButton.classList.toggle("active", timeWindow === "data");
  blcWindowButton.classList.toggle("active", timeWindow === "blc");
  timeMarkers.innerHTML = "";

  if (!series || !points.length) {
    timeSlider.disabled = true;
    timeSlider.min = "0";
    timeSlider.max = "1";
    timeSlider.value = "0";
    timeReadout.textContent = "–";
    timeStatus.textContent = "Für diese Knowledge-Datei ist noch keine Zeitreihe hinterlegt.";
    return;
  }

  let min, max;
  if (timeWindow === "blc") {
    min = blc.min;
    max = blc.max;
  } else {
    min = Number.isFinite(Number(series.dataStartYear))
      ? Number(series.dataStartYear)
      : Math.min(...points.map(point => Number(point.year)));
    max = Number.isFinite(Number(series.dataEndYear))
      ? Number(series.dataEndYear)
      : Math.max(...points.map(point => Number(point.year)));
  }

  timeSlider.disabled = false;
  timeSlider.min = String(min);
  timeSlider.max = String(max);
  timeSlider.step = "1";

  const fallbackYear = Number(points[points.length - 1].year);
  if (selectedYear === null || selectedYear < min || selectedYear > max) selectedYear = fallbackYear;
  timeSlider.value = String(selectedYear);
  timeReadout.textContent = String(selectedYear);

  // Bei langen Jahresreihen nur ausgewählte Marker beschriften, damit die Anzeige lesbar bleibt.
  points.forEach((point, index) => {
    const year = Number(point.year);
    if (year < min || year > max) return;
    const showMarker = points.length <= 15 || index === 0 || index === points.length - 1 || year % 5 === 0;
    if (!showMarker) return;
    const marker = document.createElement("span");
    marker.className = "time-marker";
    marker.textContent = String(year);
    marker.style.left = `${((year - min) / (max - min)) * 100}%`;
    timeMarkers.appendChild(marker);
  });

  const exact = points.find(point => Number(point.year) === Number(selectedYear));
  if (exact) {
    timeStatus.textContent = `${series.label || "Messreihe"} · ${selectedYear} ist als Messwert hinterlegt.`;
  } else if (timeWindow === "blc") {
    timeStatus.textContent = "BLC-Zeitfenster 1700–2100. Außerhalb der hinterlegten Messjahre werden keine Werte interpoliert oder projiziert.";
  } else {
    timeStatus.textContent = "Nur tatsächlich hinterlegte Messjahre werden angezeigt; keine Interpolation.";
  }
}


function getKnowledgeStatusLabel(network) {
  const year = network?.presentation?.statusYear
    || network?.statusYear
    || network?.presentation?.assessmentYear
    || network?.assessmentYear;
  return year ? `Stand ${year}` : "Stand der Grundlagenstudie";
}

function applyKnowledgeToStandardEffect(network, activeBoundary, activeItem) {
  setStandardEffectBlocksVisible(true);

  const series = getKnowledgeSeries(network);
  if (series?.points?.length) {
    if (selectedYear === null) selectedYear = Number(series.points[series.points.length - 1].year);
    renderKnowledgeTime(network);
    const point = getKnowledgeSeriesPoint(network, selectedYear);
    setKnowledgePointDetails(network, activeBoundary, activeItem, point, point ? null : selectedYear);
    return;
  }

  setKnowledgePointDetails(network, activeBoundary, activeItem);
  timeSlider.disabled = true;
  timeSlider.min = "0";
  timeSlider.max = "1";
  timeSlider.value = "0";
  timeMarkers.innerHTML = "";
  timeReadout.textContent = getKnowledgeStatusLabel(network);
  timeStatus.textContent = "Noch keine Zeitreihe hinterlegt. Angezeigt wird der Stand der Grundlagenstudie.";
}

function renderKnowledgePanel() {
  const panel = ensureKnowledgePanel();
  const state = getActiveViewState();

  // Generischer Index-Pfad: funktioniert für Planetare Grenzen und Ergänzungen.
  const activeBoundary = getBoundary(state.boundaryId);
  const activeItem = activeBoundary?.items?.find(item => item.id === state.itemId);
  if (activeItem?.knowledgeSource && state.boundaryId !== "mental-load") {
    const indexEntry = getKnowledgeIndexEntry(state.boundaryId, state.itemId);
    const rawNetwork = getKnowledgeNetworkBySource(activeItem.knowledgeSource);
    const network = getKnowledgeNetworkForItem(rawNetwork, activeItem);

    if (state.boundaryId === "nutrients") {
      // Nährstoffkreisläufe sollen dieselbe Grundstruktur wie Landnutzung zeigen:
      // Titelblock + vier Standardfelder + Befund/Wirkung/Unsicherheit.
      // nutrient-mode wird entfernt, damit diese Felder nicht per CSS ausgeblendet werden.
      document.body.classList.remove("nutrient-mode");
      setStandardFocusCardVisible(true);
      setStandardEffectBlocksVisible(true);
      applyKnowledgeToStandardEffect(network, activeBoundary, activeItem);
    } else {
      setStandardFocusCardVisible(true);
      applyKnowledgeToStandardEffect(network, activeBoundary, activeItem);
    }

    panel.innerHTML = renderGenericKnowledgeView(network, indexEntry);
    panel.hidden = false;
    return;
  }

  syncBoundaryModeClass();
  setStandardFocusCardVisible(true);
  setStandardEffectBlocksVisible(state.boundaryId !== "nutrients" && state.boundaryId !== "novel" && state.boundaryId !== "materials-energy" && state.boundaryId !== "mental-load");

  const nitrate = knowledgeNetworks.nitrate;
  const phosphorus = knowledgeNetworks.phosphorus;

  if (state.boundaryId === "nutrients") {
    renderNutrientShell();

    panel.innerHTML = state.componentId
      ? renderNutrientMainView(state.componentId)
      : `
        <div class="nutrient-choice-note">
          <strong>Wähle links Stickstoff oder Phosphor.</strong>
          <p>Die Unterbereiche stehen direkt unter der Planetaren Grenze Nährstoffkreisläufe.</p>
        </div>`;

    panel.hidden = false;
    return;
  }

  if (state.boundaryId === "novel") {
    renderNovelShell();

    panel.innerHTML = state.componentId === "pfas"
      ? renderPfasMainView()
      : `
        <div class="nutrient-choice-note">
          <strong>Wähle links PFAS.</strong>
        </div>`;

    panel.hidden = false;
    return;
  }

  if (state.boundaryId === "materials-energy") {
    if (focusType) focusType.textContent = "ERGÄNZENDE SYSTEMGRENZE · STOFF- UND ENERGIESTRÖME";
    renderHealth(null);

    if (state.componentId === "oil") {
      if (focusTitle) focusTitle.textContent = "Energie · Erdöl";
      if (focusSummary) focusSummary.textContent = "Messbarer globaler Stoff- und Energiestrom mit Verbindungen zu mehreren Planetaren Grenzen.";
      panel.innerHTML = renderOilEnergyMainView();
    } else if (state.componentId === "coal") {
      if (focusTitle) focusTitle.textContent = "Energie · Kohle";
      if (focusSummary) focusSummary.textContent = "Globaler Kohlefluss mit Verbindungen zu Klimawandel, Aerosolen, Süßwasser und Landnutzungsänderung.";
      panel.innerHTML = renderCoalEnergyMainView();
    } else if (state.componentId === "wind") {
      if (focusTitle) focusTitle.textContent = "Energie · Wind";
      if (focusSummary) focusSummary.textContent = "Windstrom ohne Brennstoffdurchsatz: Kapazität, Ausbau, Erzeugung sowie Klima-, Flächen- und Biodiversitätspfade.";
      panel.innerHTML = renderWindEnergyMainView();
    } else if (state.componentId === "solar") {
      if (focusTitle) focusTitle.textContent = "Energie · Solar";
      if (focusSummary) focusSummary.textContent = "Solarstrom ohne Brennstoffdurchsatz: Kapazität, Ausbau, Erzeugung sowie Klima-, Flächen- und Materialpfade.";
      panel.innerHTML = renderSolarEnergyMainView();
    } else {
      if (focusTitle) focusTitle.textContent = "Energie";
      if (focusSummary) focusSummary.textContent = "Energieflüsse werden als messbare Durchsätze erfasst. Wähle Erdöl, Kohle, Wind oder Solar.";
      panel.innerHTML = `
        <div class="extension-intro">
          <div class="eyebrow">STOFF- UND ENERGIESTRÖME</div>
          <h2>Energie</h2>
          <p>Energie ist der erste Teilbereich dieser ergänzenden Systemgrenze.</p>
          <div class="extension-note">
            Reale Piloten sind bereits für <strong>Erdöl</strong>, <strong>Kohle</strong>, <strong>Wind</strong> und <strong>Solar</strong> hinterlegt.
          </div>
        </div>`;
    }

    panel.hidden = false;
    return;
  }

  if (state.boundaryId === "mental-load") {
    if (focusType) focusType.textContent = "ERGÄNZENDE SYSTEMGRENZE · TECHNOLOGISCHE & SOZIALE UMWELT";
    renderHealth(null);

    const indexEntry = getKnowledgeIndexEntry(state.boundaryId, state.componentId);

    if (indexEntry?.type === "item") {
      const network = getKnowledgeNetworkBySource(indexEntry.item.source);
      if (focusTitle) focusTitle.textContent = `${indexEntry.group.label} · ${indexEntry.item.label}`;
      if (focusSummary) focusSummary.textContent = network?.topic || "Konkreter menschengemachter Umwelt- und Wirkungspfad.";
      panel.innerHTML = renderGenericKnowledgeView(network, indexEntry);
      if (organReadout) organReadout.textContent = genericHealthReadout(network);
    } else if (indexEntry?.type === "group") {
      if (focusTitle) focusTitle.textContent = indexEntry.group.label;
      if (focusSummary) focusSummary.textContent = "Umwelt- und Expositionsbereich innerhalb der ergänzenden Systemgrenze.";
      panel.innerHTML = renderTechSocialGroupIntro(indexEntry.group);
    } else {
      const groups = (getKnowledgeIndex()?.systemBoundaries?.find(item => item.id === "eah_tech_social_environment")?.groups || []).map(group =>
        `<p><strong>${group.label}</strong><br>${(group.items || []).map(item => item.label).join(" · ")}</p>`
      ).join("");

      if (focusTitle) focusTitle.textContent = "Technologische & soziale Umwelt";
      if (focusSummary) focusSummary.textContent = "Menschengemachte technische, digitale, informationelle und soziale Veränderungen werden über konkrete Umwelt- und Wirkungspfade erschlossen.";
      panel.innerHTML = `
        <div class="extension-intro">
          <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE</div>
          <h2>Technologische & soziale Umwelt</h2>
          <p>Die Navigation trennt Umweltbereiche von ihren gesundheitlichen Wirkungen.</p>
          <div class="extension-note">${groups}</div>
        </div>`;
    }

    panel.hidden = false;
    return;
  }

  if (state.boundaryId === "freshwater") {
    panel.innerHTML = `
      <div class="connections-head">
        <div>
          <div class="eyebrow">VERBUNDENE ZUSAMMENHÄNGE</div>
          <h2>Was mit Süßwasser zusammenhängt</h2>
          <p>
            Diese Karten stammen fachlich aus <strong>Nährstoffkreisläufe</strong>.
            Ihre Messwerte und Referenzen gehören nicht zum oben dargestellten
            Zustandswert der Planetaren Grenze Süßwasser.
          </p>
        </div>
      </div>

      <div class="connections-boundary-note">
        <span class="boundary-origin">Ursprung: Nährstoffkreisläufe</span>
        <span>↘ Verbindung zu Süßwasser</span>
      </div>

      <div class="connection-list">
        ${renderKnowledgeCard({
          key: "nitrate",
          network: nitrate,
          eyebrow: "NÄHRSTOFFKREISLÄUFE · STICKSTOFF",
          title: "Stickstoff → Nitrat im Grundwasser",
          intro: "Ein Stickstoffpfad erreicht über Auswaschung das Grundwasser. Stickstoff trägt daneben auch zur Eutrophierung und über N₂O zum Klimawandel bei.",
          chain: ["Stickstoff","Stickstoffüberschuss","Auswaschung","Nitrat im Grundwasser","Grundwasser","Trinkwasser","LEBEN"],
          previewMeasurements: ["de_n_surplus","de_groundwater_2024"],
          interactionField: "interactions"
        })}

        ${renderKnowledgeCard({
          key: "phosphorus",
          network: phosphorus,
          eyebrow: "NÄHRSTOFFKREISLÄUFE · PHOSPHOR",
          title: "Phosphor → Oberflächenwasser → Eutrophierung",
          intro: "Phosphor gelangt über Abschwemmung, Erosion und Abwasser in Oberflächengewässer. Eutrophierung ist ein gemeinsamer Folgeprozess von Stickstoff und Phosphor.",
          chain: ["Phosphor","Eintrag","Oberflächenwasser","Eutrophierung","Cyanobakterien","Exposition","LEBEN"],
          previewMeasurements: ["de_river_p_exceedance","de_river_p_orientation_values"],
          interactionField: "boundaryInteractions"
        })}
      </div>
    `;

    panel.hidden = false;
    return;
  }

  panel.hidden = true;
}

function getSelectedScope() { return regionSelect.value; }
function getBoundary(id) { return data.boundaries.find(boundary => boundary.id === id); }
function getCurrentItem() { const boundary = getBoundary(selectedBoundaryId); return boundary?.items?.find(item => item.id === selectedItemId) || null; }
function getVisibleItems(boundary) {
  if (!boundary?.items) return [];
  return boundary.items.filter(item =>
    item.scope === "all" || item.scope === getSelectedScope()
  );
}
function getTimePoints(item) { return item?.timePoints ? [...item.timePoints].sort((a,b)=>a.year-b.year) : []; }
function renderRegionPath() { const scope = data.scopes[getSelectedScope()]; regionPath.textContent = scope?.path || scope?.label || "Global"; }


function isEahExtension(boundary) {
  return boundary?.framework === "eah_extension";
}

function renderExtensionView(boundary) {
  setStandardEffectBlocksVisible(false);

  if (focusType) focusType.textContent = "EAH-MIRROR · ERGÄNZENDE SYSTEMGRENZE";
  if (focusTitle) focusTitle.textContent = boundary.label;
  if (focusSummary) focusSummary.textContent = boundary.summary || "";

  renderHealth(null);

  const panel = ensureKnowledgePanel();
  panel.innerHTML = `
    <div class="extension-intro">
      <div class="eyebrow">ERGÄNZENDE SYSTEMGRENZE</div>
      <h2>${boundary.label}</h2>
      <p>${boundary.summary || ""}</p>
      <div class="extension-note">
        Diese Kategorie gehört <strong>nicht</strong> zum klassischen Modell der neun Planetaren Grenzen.
        Sie wird im EAH-Mirror auf derselben Navigationsebene geführt, weil sie für Lebensgrundlagen,
        Gesundheit und Handlungsspielraum systemisch relevant ist.
      </div>
      <div class="extension-status">
        <strong>Status:</strong> Struktur angelegt · Messgrößen und Referenzwerte noch in Entwicklung
      </div>
    </div>`;
  panel.hidden = false;
}

function renderBoundaries() {
  boundaryList.innerHTML = "";
  let extensionSectionInserted = false;
  data.boundaries.forEach(boundary => {
    if (isEahExtension(boundary) && !extensionSectionInserted) {
      const divider = document.createElement("div");
      divider.className = "boundary-section-divider";
      divider.textContent = "Ergänzende Systemgrenzen";
      boundaryList.appendChild(divider);
      extensionSectionInserted = true;
    }
    const row = document.createElement("div");
    row.className = "boundary-row";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "boundary-button";
    if (isEahExtension(boundary)) {
      button.classList.add("extension-boundary");
      button.title = "Ergänzende Systemgrenze";
    }
    if (!boundary.enabled) button.classList.add("disabled");
    if (boundary.id === selectedBoundaryId) button.classList.add("active");
    button.innerHTML = `<span>${boundary.label}</span><span>${boundary.enabled ? "›" : ""}</span>`;
    if (boundary.enabled) button.addEventListener("click", () => selectBoundary(boundary.id));
    else button.disabled = true;
    row.appendChild(button);
    if (boundary.id === selectedBoundaryId) {
      const items = getVisibleItems(boundary);
      if (items.length) {
        const submenu = document.createElement("div");
        submenu.className = "submenu open";
        items.forEach(item => {
          const itemButton = document.createElement("button");
          itemButton.type = "button";
          itemButton.textContent = item.menuType === "study"
            ? `↳ ${String(item.label || "").replace(/^↳\s*/, "")}`
            : item.label;
          if (item.depthOf) itemButton.classList.add("submenu-depth");
          if (item.menuHeading) {
            itemButton.classList.add("submenu-heading");
            itemButton.disabled = true;
            itemButton.setAttribute("aria-label", `${item.label}, Menügruppe`);
          } else {
            if (item.id === selectedItemId) itemButton.classList.add("active");
            itemButton.addEventListener("click", () => selectItem(boundary.id, item.id));
          }
          submenu.appendChild(itemButton);
        });
        row.appendChild(submenu);
      }
    }
    boundaryList.appendChild(row);
  });
}

function mergeItemAndPoint(item, point) { return point ? { ...item, ...point, health: point.health || item.health } : item; }
function setLink(label, url) { sourceLink.textContent = label || "–"; if (url) { sourceLink.href = url; sourceLink.target = "_blank"; } else { sourceLink.removeAttribute("href"); sourceLink.removeAttribute("target"); } }


function setNutrientPlaceholderState() {
  focusType.textContent = "PLANETARE GRENZE · NÄHRSTOFFKREISLÄUFE";
  focusTitle.textContent = selectedDomainComponent
    ? (selectedDomainComponent === "nitrogen" ? "Stickstoff" : "Phosphor")
    : "Nährstoffkreisläufe";
  focusSummary.textContent = selectedDomainComponent
    ? "Die konkreten Messwerte und Wirkungspfade werden direkt darunter aus dem Wissensnetz gezeigt."
    : "Wähle Stickstoff oder Phosphor, um die zugehörigen Messwerte und Wirkungspfade zu öffnen.";

  metricValue.textContent = "–";
  referenceValue.textContent = "–";
  periodValue.textContent = "–";
  uncertaintyValue.textContent = "–";
  findingText.textContent = "–";
  effectPath.textContent = "–";
  lifeNote.textContent = "–";
  setLink("–", null);
}
function setDetails(item, point = null, noMeasurementYear = null) {
  if (!item) {
    metricValue.textContent = referenceValue.textContent = periodValue.textContent = uncertaintyValue.textContent = "–";
    findingText.textContent = effectPath.textContent = "–";
    lifeNote.textContent = "Gesundheitswirkungen werden erst hervorgehoben, wenn ein belastbarer Wirkungspfad von der Umweltveränderung über eine konkrete Exposition bis zum Menschen belegt ist.";
    setLink("–", null);
    return;
  }
  if (noMeasurementYear !== null) {
    metricValue.textContent = "kein Messpunkt";
    referenceValue.textContent = item.reference || "–";
    periodValue.textContent = String(noMeasurementYear);
    findingText.textContent = `Für ${noMeasurementYear} ist in dieser Messreihe kein Messpunkt hinterlegt. Es wird nichts interpoliert.`;
    effectPath.textContent = item.effect || "–";
    uncertaintyValue.textContent = "Keine Zwischenwerte werden erfunden. Wähle einen markierten Messzeitpunkt oder wechsle zurück in den Datenbereich.";
    lifeNote.textContent = item.lifeNote || "–";
    setLink(item.sourceLabel, item.sourceUrl);
    return;
  }
  const view = mergeItemAndPoint(item, point);
  metricValue.textContent = view.value || "–";
  referenceValue.textContent = view.reference || "–";
  periodValue.textContent = view.period || "–";
  uncertaintyValue.textContent = view.uncertainty || "–";
  findingText.textContent = view.finding || "–";
  effectPath.textContent = view.effect || "–";
  lifeNote.textContent = view.lifeNote || "–";
  setLink(view.sourceLabel, view.sourceUrl);
}

function renderTime(item) {
  const points = getTimePoints(item);
  const blc = data.timePresets.blc;
  dataWindowButton.classList.toggle("active", timeWindow === "data");
  blcWindowButton.classList.toggle("active", timeWindow === "blc");
  timeMarkers.innerHTML = "";
  if (!item || !points.length) {
    timeSlider.disabled = true; timeSlider.min = "0"; timeSlider.max = "1"; timeSlider.value = "0";
    timeReadout.textContent = item?.period || "–"; timeStatus.textContent = "Für diese Messreihe ist noch keine punktweise Zeitnavigation hinterlegt."; return;
  }
  let min, max;
  if (timeWindow === "blc") { min = blc.min; max = blc.max; }
  else { min = Math.min(...points.map(p => p.year)); max = Math.max(...points.map(p => p.year)); }
  const onlyOnePoint = min === max;
  if (onlyOnePoint) { min -= 1; max += 1; }
  timeSlider.disabled = onlyOnePoint && timeWindow === "data";
  timeSlider.min = String(min); timeSlider.max = String(max); timeSlider.step = "1";
  const fallbackYear = points[points.length - 1].year;
  if (selectedYear === null) selectedYear = fallbackYear;
  selectedYear = Math.min(max, Math.max(min, selectedYear)); timeSlider.value = String(selectedYear); timeReadout.textContent = String(selectedYear);
  points.filter(point => point.year >= min && point.year <= max).forEach(point => {
    const marker = document.createElement("span"); marker.className = "time-marker"; marker.textContent = String(point.year);
    marker.style.left = `${((point.year - min) / (max - min)) * 100}%`; timeMarkers.appendChild(marker);
  });
  const exact = points.find(point => point.year === selectedYear);
  if (exact) timeStatus.textContent = `${exact.label || "Messpunkt"}. Markierte Jahre sind tatsächlich hinterlegte Messzeitpunkte.`;
  else if (timeWindow === "blc") timeStatus.textContent = "BLC-Zeitfenster 1700–2100. Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
  else timeStatus.textContent = "Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
}


function getCurrentPoint(item = getCurrentItem()) {
  if (!item) return null;
  return getTimePoints(item).find(entry => entry.year === selectedYear) || null;
}

function getCurrentCauses(slot, item = getCurrentItem(), point = getCurrentPoint(item)) {
  if (point?.causes?.[slot]) return point.causes[slot];
  if (item?.causes?.[slot]) return item.causes[slot];
  return null;
}

function closeAllCauseOverlays() {
  causeOverlayGround.hidden = true;
  causeOverlayEffect.hidden = true;
  causeOverlayLife.hidden = true;
}

function renderCauseEntry(entry) {
  return `<div class="cause-entry"><strong>${entry.label || "Ursache"}</strong><p>${entry.note || ""}</p>${entry.meta ? `<div class="cause-meta">${entry.meta}</div>` : ""}</div>`;
}

function updateCauseButtons(item = getCurrentItem(), point = getCurrentPoint(item)) {
  const slots = {
    ground: { button: causeButtonGround },
    effect: { button: causeButtonEffect },
    life: { button: causeButtonLife }
  };
  Object.entries(slots).forEach(([slot, ref]) => {
    const content = getCurrentCauses(slot, item, point);
    ref.button.hidden = !content;
  });
}

function openCauseOverlay(slot) {
  const map = {
    ground: { overlay: causeOverlayGround, title: causeTitleGround, body: causeBodyGround },
    effect: { overlay: causeOverlayEffect, title: causeTitleEffect, body: causeBodyEffect },
    life: { overlay: causeOverlayLife, title: causeTitleLife, body: causeBodyLife }
  };
  const target = map[slot];
  const content = getCurrentCauses(slot);
  if (!target || !content) return;
  closeAllCauseOverlays();
  target.title.textContent = content.title || "Ursachen";
  target.body.innerHTML = `${content.intro ? `<p class="cause-hint">${content.intro}</p>` : ""}${(content.items || []).map(renderCauseEntry).join("")}`;
  target.overlay.hidden = false;
}

function closeCauseOverlay(slot) {
  if (slot === "ground") causeOverlayGround.hidden = true;
  if (slot === "effect") causeOverlayEffect.hidden = true;
  if (slot === "life") causeOverlayLife.hidden = true;
}


function getPfasHealthView() {
  const network = knowledgeNetworks.pfas;
  if (!network) return null;

  const critical = network.healthContext?.efsaCriticalEffect || "immunologische Wirkung";
  return {
    impacts: [],
    systemImpacts: [
      {
        system: "immune",
        label: "Immunsystem",
        evidence: `EFSA: ${critical}.`,
        note: "Kein belastbarer 0–100-%-Krankheitslastwert und in der aktuellen Bodymap kein eigener Immunsystem-Organmarker."
      }
    ]
  };
}

function normalizeImpactOrgan(id) {
  if (id === "reproduction") return "femaleRepro";
  if (id === "eyes") return "eye";
  if (id === "gut") return "gut";
  return id;
}
function getImpactForOrgan(organId) { const impacts = currentHealth?.impacts || []; return impacts.find(impact => normalizeImpactOrgan(impact.organ) === organId) || null; }

function normalizeImpactOrgan(id) {
  if (id === "reproduction") return "femaleRepro";
  if (id === "eyes") return "eye";
  if (id === "gut") return "gut";
  return id;
}
function getImpactForOrgan(organId) { const impacts = currentHealth?.impacts || []; return impacts.find(impact => normalizeImpactOrgan(impact.organ) === organId) || null; }

function ensureHealthLegend() {
  if (healthLegend?.isConnected) return healthLegend;
  const bodymapPanel = document.querySelector(".bodymap-panel");
  const readout = document.getElementById("organReadout")?.closest(".organ-readout");
  if (!bodymapPanel || !readout) return null;

  healthLegend = document.createElement("div");
  healthLegend.className = "health-legend";
  healthLegend.setAttribute("aria-label", "Legende der Organgesundheit");
  healthLegend.innerHTML = `
    <div class="health-legend-title-row">
      <div class="health-legend-title">Organgesundheit · Marker</div>
      <button class="inline-info-button health-legend-info-button" type="button" aria-label="Information zur Bedeutung von Außenring und Organfüllung" aria-expanded="false">i</button>
    </div>
    <div class="health-legend-row">
      <span class="health-scale" aria-hidden="true">
        <span style="--legend-shade:#f2f2f2"></span>
        <span style="--legend-shade:#bdbdbd"></span>
        <span style="--legend-shade:#777"></span>
        <span style="--legend-shade:#111"></span>
      </span>
      <span><strong>hell</strong> = niedriger · <strong>dunkel</strong> = höherer Statuswert. Eine Graustufe wird erst gesetzt, wenn zurechenbare Krankheitslast auf eine gemeinsame organspezifische Bezugsgröße normiert ist.</span>
    </div>
    <div class="health-legend-row">
      <span class="legend-foundation-link" aria-hidden="true"></span>
      <span><strong>Außenring</strong> = Zur aktuellen Auswahl besteht ein geprüfter Organbezug durch Gewebenachweis oder Gesundheitsstudie.</span>
    </div>
    <div class="health-legend-row health-legend-secondary">
      <span class="legend-hatched" aria-hidden="true"></span>
      <span>Schraffiert = gesundheitlicher Befund belegt, aber keine belastbare Quantifizierung der zurechenbaren Krankheitslast vorhanden.</span>
    </div>
    <div class="health-legend-method inline-info-note" hidden>
      <strong>Zwei unabhängige Signale</strong>
      <p>Der Außenring zeigt nur einen geprüften Organbezug. Das kann ein Gewebenachweis, eine klinische Assoziation oder ein geprüfter Gesundheitspfad sein; es beweist nicht automatisch einen ursächlichen Organschaden. Die Organfüllung bleibt ausschließlich quantifizierter, normierter und zurechenbarer Krankheitslast vorbehalten.</p>
    </div>`;
  const infoButton = healthLegend.querySelector(".health-legend-info-button");
  const infoNote = healthLegend.querySelector(".health-legend-method");
  infoButton?.addEventListener("click", () => {
    infoNote.hidden = !infoNote.hidden;
    infoButton.setAttribute("aria-expanded", String(!infoNote.hidden));
  });
  bodymapPanel.insertBefore(healthLegend, readout);
  return healthLegend;
}

function updatePrototypeVersion() {
  const version = data?.version || "0.9";
  document.title = `GWL-Panel – Prototyp ${version}`;
  const versionNode = document.querySelector(".version");
  if (versionNode) versionNode.textContent = `Prototyp ${version}`;
}

function updatePrototypeVersion() {
  const version = GWL_BUILD_VERSION || data?.version || "0.9";
  document.title = `GWL-Panel – Prototyp ${version}`;

  let versionNode = document.querySelector(".version");

  if (!versionNode) {
    const header = document.querySelector("header, .app-header, .topbar, .panel-header");
    if (header) {
      versionNode = document.createElement("div");
      versionNode.className = "version";
      versionNode.style.marginLeft = "auto";
      versionNode.style.fontSize = "12px";
      versionNode.style.fontWeight = "400";
      versionNode.style.opacity = "0.75";
      versionNode.style.whiteSpace = "nowrap";
      header.appendChild(versionNode);
    }
  }

  if (versionNode) {
    versionNode.textContent = `Prototyp ${version}`;
  }
}

function renderHotspots() {
  hotspotLayer.innerHTML = "";
  Object.entries(HOTSPOTS).forEach(([id, def]) => {
    const wrap = document.createElement("div"); wrap.className = `hotspot-group ${def.side === "left" ? "left" : "right"}`;
    wrap.style.left = `${def.x}%`; wrap.style.top = `${def.y}%`;
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "hotspot-dot is-neutral"; btn.dataset.organ = id; btn.setAttribute("aria-label", def.label);
    btn.addEventListener("click", () => openOrganOverlay(id));
    const label = document.createElement("span"); label.className = "hotspot-label"; label.textContent = def.label;
    wrap.appendChild(btn); wrap.appendChild(label); hotspotLayer.appendChild(wrap);
  });
}

function clearHotspotStates() {
  document.querySelectorAll(".hotspot-dot").forEach(dot => {
    dot.classList.remove("is-selected", "is-unquantified", "is-quantified", "has-foundation-link");
    dot.classList.add("is-neutral");
    dot.style.removeProperty("--hotspot-fill");
    const organId = dot.dataset.organ;
    if (HOTSPOTS[organId]?.label) dot.setAttribute("aria-label", HOTSPOTS[organId].label);
  });
}

function impactLinksToSelectedFoundation(impact) {
  return (impact?.contributors || []).some(item =>
    item.route?.boundaryId === selectedBoundaryId ||
    (item.pathways || []).some(pathway =>
      pathway.foundationLinkEligible === true && pathway.foundationIds?.includes(selectedBoundaryId)
    )
  );
}

function applyFoundationLinkRings() {
  const aggregate = getPrototypeAggregateHealth();
  for (const impact of aggregate?.impacts || []) {
    if (!impactLinksToSelectedFoundation(impact)) continue;
    const organId = normalizeImpactOrgan(impact.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) continue;
    dot.classList.add("has-foundation-link");
    dot.setAttribute("aria-label", `${HOTSPOTS[organId]?.label || impact.label}. Geprüfter Gesundheitspfad zur gewählten Grundlage vorhanden.`);
  }
}

function applyKnowledgeOrganLinks() {
  const network = getActiveKnowledgeContext()?.network;
  for (const signal of network?.healthContext?.markerSignals || []) {
    const organId = normalizeImpactOrgan(signal.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) continue;
    dot.classList.add("has-foundation-link");
    dot.setAttribute("aria-label", `${HOTSPOTS[organId]?.label || signal.organ}. ${signal.label || "Geprüfter Organbezug vorhanden."} Keine Aussage über einen ursächlichen Organschaden.`);
  }
}

function renderHealth(health) {
  if (!health && LIFE_PROTOTYPE_MODE) {
    health = getPrototypeAggregateHealth();
  }

  currentHealth = health;
  clearHotspotStates();
  applyFoundationLinkRings();
  applyKnowledgeOrganLinks();
  const impacts = health?.impacts || [];
  if (!impacts.length) {
    const systemImpacts = health?.systemImpacts || [];
    if (systemImpacts.length) {
      organReadout.textContent = systemImpacts.map(impact =>
        `${impact.label}: ${impact.evidence || "gesundheitsrelevanter Systembezug"} ${impact.note || ""}`
      ).join(" ");
    } else {
      organReadout.textContent = "Keine lokal belegte Organwirkung für die aktuelle Auswahl.";
    }
    if (selectedOrganId) openOrganOverlay(selectedOrganId, true);
    return;
  }
  const texts = [];
  impacts.forEach(impact => {
    const organId = normalizeImpactOrgan(impact.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) return;
    if (impact.healthContributionView) {
      if (typeof impact.burdenScore === "number") {
        const score = Math.max(0, Math.min(100, impact.burdenScore));
        const shade = Math.round(255 * (1 - score / 100));
        dot.classList.remove("is-neutral");
        dot.classList.add("is-quantified");
        dot.style.setProperty("--hotspot-fill", `rgb(${shade}, ${shade}, ${shade})`);
        texts.push(`${impact.label}: ${score} % normierte zurechenbare Krankheitslast · ${impact.contributors?.length || 0} Beiträge.`);
      } else {
        dot.classList.remove("is-neutral");
        dot.classList.add("is-unquantified");
        texts.push(`${impact.label}: ${impact.contributors?.length || 0} belegte Beiträge; noch keine gemeinsame normierte Krankheitslast für die Organfarbe.`);
      }
    } else if (typeof impact.functionLoss === "number") {
      const loss = Math.max(0, Math.min(100, impact.functionLoss));
      const shade = Math.round(255 * (1 - loss / 100));
      dot.classList.remove("is-neutral"); dot.classList.add("is-quantified"); dot.style.setProperty("--hotspot-fill", `rgb(${shade}, ${shade}, ${shade})`);
      texts.push(`${impact.label}: ${loss} % Funktionsverlust${impact.prevalence ? ` · ${impact.prevalence}` : ""}.`);
    } else {
      dot.classList.remove("is-neutral"); dot.classList.add("is-unquantified"); texts.push(`${impact.label}: ${impact.prevalence || "Schädigung lokal belegt"}.`);
    }
  });
  organReadout.textContent = texts.join(" ");
  if (selectedOrganId) openOrganOverlay(selectedOrganId, true);
}

function createMediaNode(organId) {
  const media = ORGAN_MEDIA[organId] || { label: HOTSPOTS[organId]?.label || organId, layout: "stack" };
  organOverlayContent.classList.toggle("side-by-side", media.layout === "side");

  const block = document.createElement("div");
  block.className = "organ-system-block";

  const visual = document.createElement("div");
  visual.className = "organ-system-visual";
  if (media.img) {
    const img = document.createElement("img"); img.src = media.img; img.alt = media.label; visual.appendChild(img);
  } else if (media.svg) {
    const holder = document.createElement("div"); holder.className = "organ-system-svg"; holder.innerHTML = media.svg.trim(); visual.appendChild(holder.firstChild);
  } else {
    const fallback = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fallback.setAttribute("viewBox", "0 0 220 180"); fallback.innerHTML = `<rect x="26" y="26" width="168" height="128" rx="24" class="detail-fill"></rect><path d="M58 90 H162" class="detail-line"></path><path d="M110 58 V122" class="detail-line"></path>`; visual.appendChild(fallback);
  }
  block.appendChild(visual);


  return block;
}

function renderGlobalEndpointCard(item) {
  return `
    <details class="organ-contribution-item is-global-reference health-endpoint-card" data-health-endpoint-id="${item.id}">
      <summary class="organ-contribution-summary">
        <span class="organ-contribution-icon" data-icon="${gwlHealthIconKey(item)}">${gwlHealthIconSvg(gwlHealthIconKey(item))}</span>
        <span class="organ-contribution-summary-title">${item.label}</span>
        <span class="organ-contribution-summary-meta">${item.pathways.length} ${item.pathways.length === 1 ? "belegter Expositionspfad" : "belegte Expositionspfade"}</span>
      </summary>
      <div class="organ-contribution-body">
        <div class="health-pathway-list">
          ${item.pathways.map(pathway => {
            const primaryFoundationId = pathway.foundationIds[0] || "";
            const primaryFoundation = pathway.foundations[0] || "Umweltbezug";
            const relatedFoundations = pathway.foundations.slice(1);
            const source = getHealthSourceById(pathway.sourceRef);
            return `
              <section class="health-pathway">
                <div class="health-pathway-flow" aria-label="Wirkungspfad von der Grundlage zum Organ">
                  <button type="button" class="health-pathway-node is-foundation" data-life-route-boundary="${primaryFoundationId}">${primaryFoundation}</button>
                  <span class="health-pathway-arrow" aria-hidden="true">→</span>
                  <span class="health-pathway-node">${pathway.exposure}</span>
                  <span class="health-pathway-arrow" aria-hidden="true">→</span>
                  <span class="health-pathway-node">${pathway.outcome}</span>
                  <span class="health-pathway-arrow" aria-hidden="true">→</span>
                  <span class="health-pathway-node is-organ">${pathway.organ}</span>
                </div>
                ${relatedFoundations.length ? `<small><strong>Weitere Bezüge:</strong> ${relatedFoundations.join(" · ")}</small>` : ""}
                <small><strong>Gewichtung:</strong> Anteil dieses Pfades nicht getrennt quantifiziert.</small>
                ${pathway.measurements.length ? `
                  <div class="health-pathway-measurements">
                    <strong>Risikoweite globale Krankheitslast:</strong>
                    ${pathway.measurements.map(value => `<span>${value.display} · ${value.period} · ${value.geography}</span>`).join("")}
                    <small>Nicht ausschließlich diesem einzelnen Gesundheitsendpunkt zugeordnet.</small>
                  </div>` : ""}
                ${source?.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">↗ Quelle öffnen</a>` : ""}
              </section>`;
          }).join("")}
        </div>
        <small><strong>Organfarbe:</strong> ${item.whyNoColor}</small>
      </div>
    </details>`;
}

function renderHealthPathDialog(item) {
  return `
    <p class="health-path-dialog-intro">Jeder belegte Expositionspfad bleibt getrennt. Fehlende Gewichte werden nicht ergänzt und risikoweite Krankheitslasten nicht dem einzelnen Endpunkt zugerechnet.</p>
    <div class="health-path-dialog-list">
      ${item.pathways.map(pathway => {
        const primaryFoundationId = pathway.foundationIds[0] || "";
        const primaryFoundation = pathway.foundations[0] || "Umweltbezug";
        const relatedFoundations = pathway.foundations.slice(1);
        const source = getHealthSourceById(pathway.sourceRef);
        return `
          <section class="health-path-dialog-path">
            <div class="health-path-dialog-flow">
              <button type="button" class="health-path-dialog-node is-foundation" data-life-route-boundary="${primaryFoundationId}">
                <small>Grundlage</small><strong>${primaryFoundation}</strong>
              </button>
              <span class="health-path-dialog-arrow" aria-hidden="true">→</span>
              <span class="health-path-dialog-node"><small>Exposition</small><strong>${pathway.exposure}</strong></span>
              <span class="health-path-dialog-arrow" aria-hidden="true">→</span>
              <span class="health-path-dialog-node"><small>Gesundheitslast</small><strong>${pathway.outcome}</strong></span>
              <span class="health-path-dialog-arrow" aria-hidden="true">→</span>
              <span class="health-path-dialog-node is-organ"><small>Organ</small><strong>${pathway.organ}</strong></span>
            </div>
            <div class="health-path-dialog-meta">
              <span><strong>Gewichtung:</strong> Anteil dieses Pfades nicht getrennt quantifiziert.</span>
              ${relatedFoundations.length ? `<span><strong>Weitere Bezüge:</strong> ${relatedFoundations.join(" · ")}</span>` : ""}
              ${pathway.measurements.length ? `<span><strong>Risikoweite globale Krankheitslast:</strong> ${pathway.measurements.map(value => `${value.display} (${value.period})`).join(" · ")}</span>` : ""}
              ${source?.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">↗ Quelle öffnen</a>` : ""}
            </div>
          </section>`;
      }).join("")}
    </div>`;
}

function openHealthPathOverlay(item) {
  if (!healthPathOverlay || !healthPathContent || !item?.pathways) return;
  healthPathTitle.textContent = item.label;
  healthPathContent.innerHTML = renderHealthPathDialog(item);
  healthPathOverlay.hidden = false;
  closeHealthPathButton?.focus();
}

function closeHealthPathOverlay() {
  if (!healthPathOverlay) return;
  healthPathOverlay.hidden = true;
  healthPathContent.innerHTML = "";
}

function renderHealthContributionCards(items) {
  return items.map(item => {
    if (Array.isArray(item.pathways)) return renderGlobalEndpointCard(item);
    const source = getHealthSourceById(item.sourceRefs?.[0]);
    const burden = item.burden;
    const routeBoundary = item.route?.boundaryId || "";
    const routeItem = item.route?.itemId || "";
    const burdenHtml = burden
      ? `<span><strong>Krankheitslast:</strong> ${burden.display || ""}${burden.period ? ` · ${burden.period}` : ""}${burden.geography ? ` · ${burden.geography}` : ""}</span>
         ${burden.secondary ? `<small>${burden.secondary}</small>` : ""}`
      : `<span><strong>Krankheitslast:</strong> noch nicht belastbar quantifiziert</span>`;
    const statusText = item.globalHealthReference
      ? `Globale Referenz${item.spatialContext ? ` · ${item.spatialContext}` : ""}`
      : `Evidenz ${item.evidenceLevel || "–"} · ${burden ? (item.affectsOrganColor ? "Krankheitslast quantifiziert" : "Krankheitslast quantifiziert, noch nicht normiert") : "Krankheitslast noch nicht quantifiziert"}`;

    return `
      <details class="organ-contribution-item${item.globalHealthReference ? " is-global-reference" : ""}">
        <summary class="organ-contribution-summary">
          <span class="organ-contribution-icon" data-icon="${gwlHealthIconKey(item)}">${gwlHealthIconSvg(gwlHealthIconKey(item))}</span>
          <span class="organ-contribution-summary-title">${item.label}</span>
          <span class="organ-contribution-summary-meta">${statusText}</span>
        </summary>
        <div class="organ-contribution-body">
          ${item.exposure?.path ? `<small><strong>Exposition:</strong> ${item.exposure.path}</small>` : ""}
          ${item.healthEndpoint ? `<small><strong>Endpunkt:</strong> ${item.healthEndpoint}</small>` : ""}
          ${burdenHtml}
          ${item.whyNoColor ? `<small><strong>Organfarbe:</strong> ${item.whyNoColor}</small>` : ""}
          ${source?.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">↗ Quelle öffnen</a>` : ""}
          ${routeBoundary ? `
            <button type="button" data-life-route-boundary="${routeBoundary}" data-life-route-item="${routeItem}">
              → Ursache im GWL-Panel öffnen
            </button>` : ""}
        </div>
      </details>`;
  }).join("");
}

function openOrganOverlay(organId, preserveHidden = false) {
  selectedOrganId = organId;
  const def = HOTSPOTS[organId];
  const impact = getImpactForOrgan(organId);
  organOverlayTitle.textContent = ORGAN_MEDIA[organId]?.label || def?.label || organId;
  organOverlayMedia.innerHTML = ""; organOverlayMedia.appendChild(createMediaNode(organId));
  if (impact?.healthContributionView && Array.isArray(impact.contributors)) {
    organOverlayContent.classList.add("health-contribution-layout");
    if (organOverlayNote?.parentElement !== organOverlayContent) {
      organOverlayContent.appendChild(organOverlayNote);
    }

    const hasColor = typeof impact.burdenScore === "number";
    const panelContributors = impact.contributors.filter(item => !item.globalHealthReference);
    const globalContributors = impact.contributors.filter(item => item.globalHealthReference);
    organOverlayFinding.textContent = hasColor
      ? `${impact.burdenScore} % normierte zurechenbare Krankheitslast aus ${impact.contributors.length} Beiträgen.`
      : `${impact.contributors.length} gesundheitlich relevante Beiträge und globale Referenzen. Für die Organfarbe liegt noch keine gemeinsame normierte zurechenbare Krankheitslast vor.`;

    organOverlayNote.innerHTML = `
      <div class="organ-prototype-warning">
        <strong>METHODIK</strong>
        <p>${LIFE_HEALTH_DATA?.methodPolicy?.organColorRule || ""}</p>
      </div>
      <details class="organ-context-details" open>
        <summary>Beitragende Ursachen / Pfade</summary>
        <div class="organ-contribution-list">
          ${renderHealthContributionCards(panelContributors)}
        </div>
      </details>
      ${globalContributors.length ? `
        <details class="organ-context-details global-health-reference" open>
          <summary>
            <span>Globale Gesundheitslast</span>
            <button class="inline-info-button" type="button" aria-label="Information zur globalen Gesundheitslast" aria-expanded="false">i</button>
          </summary>
          <div class="inline-info-note" hidden>Diese Werte beschreiben globale, modellierte Krankheitslast. Sie sind kein lokaler Befund für den gewählten Ort und werden nicht mit anderen Belastungen addiert.</div>
          <div class="organ-contribution-list">${renderHealthContributionCards(globalContributors)}</div>
        </details>` : ""}`;

    organOverlayNote.querySelectorAll(".inline-info-button").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const note = button.closest("details")?.querySelector(".inline-info-note");
        if (!note) return;
        note.hidden = !note.hidden;
        button.setAttribute("aria-expanded", String(!note.hidden));
      });
    });
    organOverlayNote.querySelectorAll(".health-endpoint-card > summary").forEach(summary => {
      summary.addEventListener("click", event => {
        if (!window.matchMedia("(min-width: 821px)").matches) return;
        event.preventDefault();
        const endpointId = summary.closest(".health-endpoint-card")?.dataset.healthEndpointId;
        const endpoint = impact.contributors.find(item => item.id === endpointId);
        if (endpoint?.pathways) openHealthPathOverlay(endpoint);
      });
    });
  } else {
    organOverlayContent.classList.remove("health-contribution-layout");
    if (organOverlayNoteHomeParent && organOverlayNote?.parentElement !== organOverlayNoteHomeParent) {
      if (organOverlayNoteHomeNextSibling && organOverlayNoteHomeNextSibling.parentNode === organOverlayNoteHomeParent) {
        organOverlayNoteHomeParent.insertBefore(organOverlayNote, organOverlayNoteHomeNextSibling);
      } else {
        organOverlayNoteHomeParent.appendChild(organOverlayNote);
      }
    }

    organOverlayFinding.textContent = impact
      ? (findingText.textContent || "–")
      : "Für dieses Organ liegt in der aktuellen Auswahl noch kein geprüfter Gesundheitsbeitrag vor.";

    organOverlayNote.innerHTML = `
      <details class="organ-context-details">
        <summary>Einordnung</summary>
        <p>${impact
          ? "Die fachliche Einordnung und der Wirkungspfad stehen im Feld <strong>WIRKUNG</strong>."
          : "Der Marker ist Teil der Bodymap, bleibt aber neutral, bis ein konkreter Umwelt–Expositions–Gesundheitspfad geprüft und importiert wurde."}</p>
      </details>`;
  }
  document.querySelectorAll('.hotspot-dot').forEach(dot => dot.classList.toggle('is-selected', dot.dataset.organ === organId));
  if (!preserveHidden || organOverlay.hidden) organOverlay.hidden = false;
}

function closeOrganOverlay() {
  // Organfenster schließt separat; Ursachenebene bleibt davon unberührt.

  organOverlay.hidden = true;
  selectedOrganId = null;
  document.querySelectorAll('.hotspot-dot').forEach(dot => dot.classList.remove('is-selected'));
}

function followHealthRoute(routeButton) {
  const boundaryId = routeButton?.dataset.lifeRouteBoundary;
  const itemId = routeButton?.dataset.lifeRouteItem || "";
  if (!boundaryId || !getBoundary(boundaryId)) return;
  closeHealthPathOverlay();
  closeOrganOverlay();
  if (itemId) selectItem(boundaryId, itemId);
  else selectBoundary(boundaryId);
  document.querySelector(`[data-boundary="${boundaryId}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function selectBoundary(boundaryId) {
  selectedBoundaryId = boundaryId;
  selectedItemId = null;
  selectedDomainComponent = null;
  syncBoundaryModeClass();
const boundary = getBoundary(boundaryId);
  const items = getVisibleItems(boundary);
  closeOrganOverlay();
  closeAllCauseOverlays();
  if (items.length) { selectItem(boundaryId, items[0].id); return; }

  if (isEahExtension(boundary)) {
    selectedItemId = null;
    selectedYear = null;
    closeAllCauseOverlays();
    renderBoundaries();
    renderExtensionView(boundary);
    return;
  }

  selectedItemId = null; selectedYear = null;
  focusType.textContent = `Grundlage · ${data.scopes[getSelectedScope()]?.label || ""}`;
  focusTitle.textContent = boundary.label;
  focusSummary.textContent = `Für ${data.scopes[getSelectedScope()]?.label || "diese Ebene"} ist in diesem Prototyp noch keine passende Messreihe hinterlegt. Die räumliche Ebene bleibt trotzdem Teil der späteren Struktur.`;
  setDetails(null); renderTime(null); renderHealth(null); renderBoundaries(); renderKnowledgePanel();
}

function selectItem(boundaryId, itemId) {
  closeOrganOverlay();
  closeAllCauseOverlays();

  selectedBoundaryId = boundaryId;
  selectedItemId = itemId;

  const boundary = getBoundary(boundaryId);
  const item = boundary?.items?.find(entry => entry.id === itemId);
  if (!item) return;

  // Nährstoffkreisläufe: Stickstoff/Phosphor sind echte Untermenüs in GRUNDLAGE.
  // Die Messdaten stammen aus dem Wissensnetz, nicht aus dem Standard-PG-Itemmodell.
  if (item.knowledgeSource || boundaryId === "nutrients" || boundaryId === "novel" || boundaryId === "materials-energy" || boundaryId === "mental-load") {
    selectedDomainComponent = itemId;
    selectedYear = null;
    renderHealth(boundaryId === "novel" && itemId === "pfas" ? getPfasHealthView() : null);
    renderBoundaries();
    renderKnowledgePanel();
    return;
  }

  selectedDomainComponent = null;
  const points = getTimePoints(item);
  selectedYear = points.length ? points[points.length - 1].year : null;
  timeWindow = "data";

  focusType.textContent = `${item.type} · ${data.scopes[item.scope]?.label || item.scope}`;
  focusTitle.textContent = `${boundary.label} · ${item.label}`;
  focusSummary.textContent = item.summary;

  const point = points.find(entry => entry.year === selectedYear) || null;
  setDetails(item, point);
  renderTime(item);
  renderHealth(point?.health || item.health || null);
  updateCauseButtons(item, point);
  const foundationText = Array.from(document.querySelectorAll(".panel p, .column p, p")).find(p => p.textContent.includes("Planetare Grenzen und dazu passende Messreihen"));
if (foundationText) foundationText.textContent = "Neun Planetare Grenzen bilden den wissenschaftlichen Ausgangspunkt. Ergänzende Systemgrenzen erweitern den Blick auf Lebensgrundlagen und menschliche Gesundheit.";
renderBoundaries();
  renderKnowledgePanel();
}

function selectYear(year) {
  const knowledge = getActiveKnowledgeContext();
  if (knowledge?.network && getKnowledgeSeries(knowledge.network)?.points?.length) {
    selectedYear = year;
    timeReadout.textContent = String(year);
    const point = getKnowledgeSeriesPoint(knowledge.network, year);
    setKnowledgePointDetails(
      knowledge.network,
      knowledge.boundary,
      knowledge.item,
      point,
      point ? null : year
    );
    renderKnowledgeTime(knowledge.network);
    renderKnowledgePanel();
    return;
  }

  const item = getCurrentItem(); if (!item) return; selectedYear = year;
  const points = getTimePoints(item); const point = points.find(entry => entry.year === year) || null; timeReadout.textContent = String(year);
  if (point) { setDetails(item, point); renderHealth(point.health || item.health || null); updateCauseButtons(item, point); timeStatus.textContent = `${point.label || "Messpunkt"}. Dieser Zeitpunkt ist im Datensatz belegt.`; renderKnowledgePanel(); }
  else { setDetails(item, null, year); renderHealth(null); updateCauseButtons(item, null); timeStatus.textContent = `Für ${year} ist kein Messpunkt hinterlegt. Keine Interpolation.`; renderKnowledgePanel(); }
}

function setTimeWindow(nextWindow) {
  const knowledge = getActiveKnowledgeContext();
  if (knowledge?.network && getKnowledgeSeries(knowledge.network)?.points?.length) {
    timeWindow = nextWindow;
    const points = getKnowledgeSeries(knowledge.network).points;
    selectedYear = Number(points[points.length - 1].year);
    renderKnowledgeTime(knowledge.network);
    selectYear(selectedYear);
    return;
  }

  const item = getCurrentItem(); if (!item) return; timeWindow = nextWindow;
  const points = getTimePoints(item); if (points.length) selectedYear = points[points.length - 1].year; renderTime(item); selectYear(selectedYear);
}

function chooseFirstItemForScope() {
  renderRegionPath(); closeOrganOverlay(); closeAllCauseOverlays();
  const boundary = getBoundary("freshwater"); const items = getVisibleItems(boundary);
  selectedBoundaryId = "freshwater"; selectedItemId = items[0]?.id || null;
  if (selectedItemId) selectItem("freshwater", selectedItemId); else selectBoundary("freshwater");
}
function resetPanel() { regionSelect.value = "global"; timeWindow = "data"; chooseFirstItemForScope(); }

regionSelect.addEventListener("change", chooseFirstItemForScope);

function setLocationInfoOpen(open) {
  if (!locationInfoButton || !locationInfo) return;
  locationInfo.hidden = !open;
  locationInfoButton.setAttribute("aria-expanded", String(open));
}

locationInfoButton?.addEventListener("click", event => {
  event.stopPropagation();
  setLocationInfoOpen(locationInfoButton.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("click", event => {
  if (locationInfoButton?.getAttribute("aria-expanded") !== "true") return;
  if (!event.target.closest(".location-control")) setLocationInfoOpen(false);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && healthPathOverlay && !healthPathOverlay.hidden) {
    closeHealthPathOverlay();
    return;
  }
  if (event.key === "Escape" && locationInfoButton?.getAttribute("aria-expanded") === "true") {
    setLocationInfoOpen(false);
    locationInfoButton.focus();
  }
});
resetButton.addEventListener("click", resetPanel);
dataWindowButton.addEventListener("click", () => setTimeWindow("data"));
blcWindowButton.addEventListener("click", () => setTimeWindow("blc"));
timeSlider.addEventListener("input", event => {
  let year = Number(event.target.value);
  const context = getActiveKnowledgeContext();
  const series = context?.network ? getKnowledgeSeries(context.network) : null;
  const preserveMissingYears = context?.network?.timeNavigation?.preserveMissingYears === true;
  if (timeWindow === "data" && series?.points?.length && !preserveMissingYears) {
    year = series.points
      .map(point => Number(point.year))
      .filter(Number.isFinite)
      .reduce((nearest, candidate) =>
        Math.abs(candidate - year) < Math.abs(nearest - year) ? candidate : nearest
      );
  }
  selectYear(year);
});
closeOverlayButton.addEventListener("click", closeOrganOverlay);
closeHealthPathButton?.addEventListener("click", closeHealthPathOverlay);
causeButtonGround.addEventListener("click", () => openCauseOverlay("ground"));
causeButtonEffect.addEventListener("click", () => openCauseOverlay("effect"));
causeButtonLife.addEventListener("click", () => openCauseOverlay("life"));
document.querySelectorAll("[data-close-cause]").forEach(button => button.addEventListener("click", () => closeCauseOverlay(button.dataset.closeCause)));
organOverlayContent?.addEventListener("click", event => {
  const routeButton = event.target.closest("[data-life-route-boundary]");
  if (!routeButton) return;
  followHealthRoute(routeButton);
});
healthPathOverlay?.addEventListener("click", event => {
  const routeButton = event.target.closest("[data-life-route-boundary]");
  if (routeButton) {
    followHealthRoute(routeButton);
    return;
  }
  if (event.target === healthPathOverlay) closeHealthPathOverlay();
});
async function initPanel() {
  try {
    await loadBodymapConfig();
    await loadHealthContributionPrototype();
    await loadHealthStudyImport();
    await loadKnowledgeNetworks();
    syncKnowledgeNavigationFromIndex();
    syncFreshwaterBlueGreenNavigation();
  } catch (error) {
    console.error(error);
    organReadout.textContent = "Bodymap-Konfiguration konnte nicht geladen werden.";
    return;
  }
  renderHotspots();
  ensureHealthLegend();
  updatePrototypeVersion();
  chooseFirstItemForScope();
}


/* GWL_HEALTH_OVERLAY_COMPACT_V1 */
(function installCompactHealthOverlayStyles() {
  if (document.getElementById("gwl-health-overlay-compact-style")) return;
  const style = document.createElement("style");
  style.id = "gwl-health-overlay-compact-style";
  style.textContent = `
    /* Organfenster: bewusst größer als der frühere schmale Prototyp */
    .organ-overlay,
    #organOverlay,
    .organ-detail-overlay {
      width: min(600px, calc(100% - 12px)) !important;
      max-width: min(600px, calc(100% - 12px)) !important;
    }

    .organ-overlay-card,
    .organ-overlay-panel,
    #organOverlay > div {
      width: 100%;
      box-sizing: border-box;
    }

    .organ-contribution-list {
      display: grid;
      gap: 10px;
      margin-top: 10px;
    }

    .organ-contribution-button {
      display: grid;
      gap: 5px;
      padding: 12px 14px;
      border: 1px solid #d3d3ce;
      border-radius: 12px;
      background: #fff;
      line-height: 1.32;
      overflow-wrap: anywhere;
    }

    .organ-contribution-button > span:first-child strong {
      display: block;
      font-size: 1rem;
      line-height: 1.2;
    }

    .organ-contribution-button > span:nth-child(2) {
      width: fit-content;
      padding: 2px 7px;
      border: 1px solid #d3d3ce;
      border-radius: 999px;
      font-size: .78rem;
    }

    .organ-contribution-button small {
      display: block;
      font-size: .82rem;
      line-height: 1.35;
    }

    .organ-contribution-button a {
      width: fit-content;
      font-size: .86rem;
    }

    .organ-contribution-button button {
      justify-self: start;
      width: auto;
      max-width: 100%;
      margin-top: 3px;
      padding: 7px 10px;
      border: 1px solid #aaa;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font: inherit;
      font-size: .86rem;
    }

    .organ-prototype-warning {
      margin: 8px 0 12px;
      padding: 10px 12px;
      border: 1px solid #d3d3ce;
      border-radius: 10px;
    }

    .organ-prototype-warning p {
      margin: 4px 0 0;
      line-height: 1.35;
    }

    @media (max-width: 760px) {
      .organ-overlay,
      #organOverlay,
      .organ-detail-overlay {
        width: calc(100vw - 16px) !important;
        max-width: calc(100vw - 16px) !important;
      }
      .organ-contribution-button {
        padding: 10px 11px;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* GWL_HEALTH_OVERLAY_LAYOUT_V2 */
(function installHealthOverlayLayoutV2() {
  if (document.getElementById("gwl-health-overlay-layout-v2")) return;
  const style = document.createElement("style");
  style.id = "gwl-health-overlay-layout-v2";
  style.textContent = `
    #organOverlayContent.health-contribution-layout {
      display: grid !important;
      grid-template-columns: minmax(250px, 40%) minmax(0, 1fr) !important;
      align-items: start !important;
      gap: 14px 18px !important;
    }

    #organOverlayContent.health-contribution-layout > #organOverlayMedia,
    #organOverlayContent.health-contribution-layout > .organ-overlay-media {
      grid-column: 1 !important;
      grid-row: 1 !important;
      min-width: 0;
    }

    /* The existing text block remains beside the image for the short finding. */
    #organOverlayContent.health-contribution-layout > :not(#organOverlayMedia):not(#organOverlayNote) {
      min-width: 0;
    }

    /* Method and all causes now use the complete width below image + finding. */
    #organOverlayContent.health-contribution-layout > #organOverlayNote {
      grid-column: 1 / -1 !important;
      width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box;
    }

    #organOverlayContent.health-contribution-layout .organ-context-details {
      width: 100%;
      box-sizing: border-box;
    }

    #organOverlayContent.health-contribution-layout .organ-contribution-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }

    #organOverlayContent.health-contribution-layout .organ-contribution-button {
      min-width: 0;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: auto;
    }

    @media (max-width: 760px) {
      #organOverlayContent.health-contribution-layout {
        grid-template-columns: 1fr !important;
      }

      #organOverlayContent.health-contribution-layout > #organOverlayMedia,
      #organOverlayContent.health-contribution-layout > #organOverlayNote {
        grid-column: 1 !important;
      }

      #organOverlayContent.health-contribution-layout .organ-contribution-list {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* GWL_MAIN_COLUMNS_RIGHT_PRIORITY_V1 */
(function installRightPriorityMainColumns() {
  const TARGET = "26% 33% 41%";

  function findHeading(text) {
    return Array.from(document.querySelectorAll("h1,h2,h3,.panel-title,.section-title"))
      .find(node => (node.textContent || "").trim().toUpperCase() === text);
  }

  function directChildUnder(ancestor, node) {
    let current = node;
    while (current && current.parentElement !== ancestor) current = current.parentElement;
    return current;
  }

  function applyMainColumns() {
    const groundHeading = findHeading("GRUNDLAGE");
    const effectHeading = findHeading("WIRKUNG");
    const lifeHeading = findHeading("LEBEN");
    if (!groundHeading || !effectHeading || !lifeHeading) return false;

    let ancestor = groundHeading.parentElement;
    while (ancestor && ancestor !== document.body) {
      const g = directChildUnder(ancestor, groundHeading);
      const e = directChildUnder(ancestor, effectHeading);
      const l = directChildUnder(ancestor, lifeHeading);

      if (g && e && l && g !== e && g !== l && e !== l) {
        const style = getComputedStyle(ancestor);
        if (style.display === "grid") {
          ancestor.style.gridTemplateColumns = TARGET;
          ancestor.style.setProperty("--gwl-ground-column", "26%");
          ancestor.style.setProperty("--gwl-effect-column", "33%");
          ancestor.style.setProperty("--gwl-life-column", "41%");
          ancestor.classList.add("gwl-right-priority-columns");
          return true;
        }
      }
      ancestor = ancestor.parentElement;
    }
    return false;
  }

  function installResponsiveRule() {
    if (document.getElementById("gwl-main-columns-right-priority-style")) return;
    const style = document.createElement("style");
    style.id = "gwl-main-columns-right-priority-style";
    style.textContent = `
      @media (max-width: 980px) {
        .gwl-right-priority-columns {
          grid-template-columns: 1fr !important;
        }
      }

      .gwl-right-priority-columns > * {
        min-width: 0;
      }
    `;
    document.head.appendChild(style);
  }

  installResponsiveRule();

  if (!applyMainColumns()) {
    requestAnimationFrame(() => applyMainColumns());
    window.addEventListener("load", applyMainColumns, { once: true });
  }
})();


/* GWL_HEALTH_CONTRIBUTIONS_COLLAPSIBLE_V1 */
(function installCollapsibleHealthContributions() {
  if (document.getElementById("gwl-health-contributions-collapsible")) return;
  const style = document.createElement("style");
  style.id = "gwl-health-contributions-collapsible";
  style.textContent = `
    .organ-overlay,
    #organOverlay,
    .organ-detail-overlay,
    #organOverlayContent,
    #organOverlayContent * {
      box-sizing: border-box;
    }

    .organ-overlay,
    #organOverlay,
    .organ-detail-overlay {
      overflow-x: hidden !important;
    }

    #organOverlayContent.health-contribution-layout {
      overflow-x: hidden !important;
    }

    #organOverlayContent.health-contribution-layout .organ-contribution-list {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 8px !important;
      width: 100% !important;
      min-width: 0 !important;
    }

    .organ-contribution-item {
      width: 100%;
      min-width: 0;
      border: 1px solid #d3d3ce;
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
    }

    .organ-contribution-summary {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px 14px;
      align-items: center;
      padding: 10px 12px;
      cursor: pointer;
      list-style: none;
      user-select: none;
    }

    .organ-contribution-summary::-webkit-details-marker {
      display: none;
    }

    .organ-contribution-summary::after {
      content: "＋";
      font-size: 1rem;
      line-height: 1;
    }

    .organ-contribution-item[open] .organ-contribution-summary::after {
      content: "−";
    }

    .organ-contribution-summary-title {
      min-width: 0;
      font-weight: 700;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .organ-contribution-summary-meta {
      grid-column: 1 / -1;
      font-size: .78rem;
      color: #555;
      line-height: 1.25;
    }

    .organ-contribution-body {
      display: grid;
      gap: 6px;
      padding: 0 12px 12px;
      border-top: 1px solid #ecece8;
      min-width: 0;
    }

    .organ-contribution-body small,
    .organ-contribution-body a,
    .organ-contribution-body button {
      max-width: 100%;
      overflow-wrap: anywhere;
    }

    .organ-contribution-body a {
      width: fit-content;
    }

    .organ-contribution-body button {
      justify-self: start;
      width: auto;
      padding: 7px 10px;
      border: 1px solid #aaa;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font: inherit;
      font-size: .86rem;
    }
  `;
  document.head.appendChild(style);
})();


/* GWL_HEALTH_ICON_SYSTEM_V1 */
function gwlHealthIconKey(item = {}) {
  const text = `${item.label || ""} ${item.exposure?.path || ""} ${item.healthEndpoint || ""}`.toLowerCase();
  if (/(hitze|heat|dehydrat|temperatur)/.test(text)) return "heat";
  if (/(pfas|pfoa|pfos|chem|stoff)/.test(text)) return "chemical-pfas";
  return "unknown";
}

function gwlHealthIconSvg(key) {
  const common = `viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"`;
  if (key === "heat") {
    return `<svg ${common} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 5a3 3 0 0 1 6 0v13.1a6 6 0 1 1-6 0V5Z"/>
      <path d="M16 8v13"/><path d="M23 7h4M23 12h3M5 7h4M6 12h3"/>
      <circle cx="16" cy="24" r="2.5" fill="currentColor" stroke="none"/>
    </svg>`;
  }
  if (key === "chemical-pfas") {
    return `<svg ${common} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="7" cy="16" r="3"/><circle cx="15" cy="8" r="3"/><circle cx="24" cy="12" r="3"/>
      <circle cx="17" cy="22" r="3"/><circle cx="27" cy="24" r="2.5"/>
      <path d="M9.5 14 12.7 10.4M17.8 8.9l3.3 1.7M9.8 17.5l4.5 3M19.8 20.9l4.8 2M17.5 11l-.2 8"/>
    </svg>`;
  }
  return `<svg ${common} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="16" r="11"/><path d="M13 12a3.5 3.5 0 0 1 6.5 1.8c0 3-3.5 3.1-3.5 6"/><path d="M16 24h.01"/>
  </svg>`;
}


/* GWL_HEALTH_CARDS_VISUAL_LANGUAGE_V1 */
(function installHealthCardVisualLanguage() {
  if (document.getElementById("gwl-health-cards-visual-language")) return;
  const style = document.createElement("style");
  style.id = "gwl-health-cards-visual-language";
  style.textContent = `
    #organOverlayContent.health-contribution-layout .organ-contribution-list {
      gap: 7px !important;
    }

    .organ-contribution-item {
      background: #f7f7f5 !important;
      border-color: #d8d8d3 !important;
      border-radius: 9px !important;
    }

    .organ-contribution-summary {
      display: grid !important;
      grid-template-columns: 36px minmax(0, 1fr) minmax(125px, 28%) 18px !important;
      grid-template-rows: auto auto !important;
      column-gap: 10px !important;
      row-gap: 2px !important;
      min-height: 54px !important;
      padding: 7px 10px !important;
      align-items: center !important;
    }

    .organ-contribution-summary::after {
      grid-column: 4 !important;
      grid-row: 1 / 3 !important;
      align-self: center;
      justify-self: center;
      content: "⌄" !important;
      font-size: 1.05rem !important;
      font-weight: 700;
    }

    .organ-contribution-item[open] .organ-contribution-summary::after {
      content: "⌃" !important;
    }

    .organ-contribution-icon {
      grid-column: 1 !important;
      grid-row: 1 / 3 !important;
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      color: #555;
    }

    .organ-contribution-icon[data-icon="heat"] {
      color: #b65b18;
    }

    .organ-contribution-icon[data-icon="chemical-pfas"] {
      color: #6b58a8;
    }

    .organ-contribution-summary-title {
      grid-column: 2 !important;
      grid-row: 1 !important;
      font-size: .9rem !important;
      line-height: 1.18 !important;
    }

    .organ-contribution-summary-meta {
      grid-column: 2 / 4 !important;
      grid-row: 2 !important;
      font-size: .71rem !important;
      line-height: 1.15 !important;
      color: #62625d !important;
    }

    .organ-contribution-summary-meta::first-letter {
      text-transform: uppercase;
    }

    .organ-contribution-body {
      background: #fbfbfa;
      padding: 8px 12px 10px 48px !important;
      gap: 5px !important;
      font-size: .84rem;
    }

    @media (max-width: 560px) {
      .organ-contribution-summary {
        grid-template-columns: 34px minmax(0, 1fr) 18px !important;
      }
      .organ-contribution-summary-meta {
        grid-column: 2 !important;
      }
      .organ-contribution-summary::after {
        grid-column: 3 !important;
      }
      .organ-contribution-body {
        padding-left: 10px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* GWL_ORGAN_OVERLAY_CONTAINMENT_V1 */
(function installOrganOverlayContainment() {
  if (document.getElementById("gwl-organ-overlay-containment")) return;
  const style = document.createElement("style");
  style.id = "gwl-organ-overlay-containment";
  style.textContent = `
    .bodymap-panel,
    .bodymap-panel > *,
    #organOverlay,
    #organOverlayContent,
    #organOverlayContent > * {
      min-width: 0 !important;
      max-width: 100%;
      box-sizing: border-box;
    }

    .bodymap-panel {
      overflow-x: hidden !important;
    }

    #organOverlay {
      width: min(600px, calc(100% - 12px)) !important;
      max-width: min(600px, calc(100% - 12px)) !important;
      overflow-x: hidden !important;
      margin-left: auto;
      margin-right: 6px;
    }

    #organOverlayContent {
      width: 100% !important;
      overflow-x: hidden !important;
    }

    #organOverlayContent img {
      max-width: 100% !important;
      height: auto;
    }

    .organ-contribution-summary,
    .organ-contribution-body,
    .organ-prototype-warning,
    .organ-context-details {
      min-width: 0 !important;
      max-width: 100% !important;
    }
  `;
  document.head.appendChild(style);
})();


/* GWL_HIDE_HEALTH_CONTEXT_ACCORDION_V1 */
(function hideHealthContextAccordion() {
  function hideIt() {
    const nodes = Array.from(document.querySelectorAll("summary,button,h3,h4,div,span"));
    const heading = nodes.find(el =>
      (el.textContent || "").trim() === "Einordnung Gesundheit"
    );
    if (!heading) return false;

    const container =
      heading.closest("details") ||
      heading.closest(".accordion-item") ||
      heading.closest(".organ-readout") ||
      heading.parentElement;

    if (container) {
      container.style.display = "none";
      container.setAttribute("aria-hidden", "true");
      return true;
    }
    return false;
  }

  if (!hideIt()) {
    requestAnimationFrame(hideIt);
    window.addEventListener("load", hideIt, { once: true });
  }
})();

initPanel();
