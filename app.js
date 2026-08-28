const data = window.GWL_DATA;
const GWL_BUILD_VERSION = "0.9.73 · B58";

const boundaryList = document.getElementById("boundaryList");
const regionSelect = document.getElementById("regionSelect");
const regionPath = document.getElementById("regionPath");
const locationInfoButton = document.getElementById("locationInfoButton");
const locationInfo = document.getElementById("locationInfo");
const globalClimateInfoButton = document.getElementById("globalClimateInfoButton");
const globalClimateInfo = document.getElementById("globalClimateInfo");
const focusType = document.getElementById("focusType");
const focusTitle = document.getElementById("focusTitle");
const focusSummary = document.getElementById("focusSummary");
const metricLabel = document.getElementById("metricLabel");
const referenceLabel = document.getElementById("referenceLabel");
const metricValue = document.getElementById("metricValue");
const referenceValue = document.getElementById("referenceValue");
const periodValue = document.getElementById("periodValue");
const uncertaintyValue = document.getElementById("uncertaintyValue");
const sourceLink = document.getElementById("sourceLink");
const findingText = document.getElementById("findingText");
const findingSummary = document.getElementById("findingSummary");
const effectPath = document.getElementById("effectPath");
const lifeNote = document.getElementById("lifeNote");
const organReadout = document.getElementById("organReadout");
const ageGroupButtons = Array.from(document.querySelectorAll("[data-age-group]"));
const ageGroupStatus = document.getElementById("ageGroupStatus");
const ageEffectDetail = document.getElementById("ageEffectDetail");
const resetButton = document.getElementById("resetButton");
const panelGrid = document.querySelector(".panel-grid");
const mobileGroundHandle = document.getElementById("mobileGroundHandle");
const mobileLifeBack = document.getElementById("mobileLifeBack");
const timeSlider = document.getElementById("timeSlider");
const timeReadout = document.getElementById("timeReadout");
const timeStatus = document.getElementById("timeStatus");
const timeMarkers = document.getElementById("timeMarkers");
const timeChart = document.getElementById("timeChart");
const dataWindowButton = document.getElementById("dataWindowButton");
const projectionWindowButton = document.getElementById("projectionWindowButton");
const blcWindowButton = document.getElementById("blcWindowButton");
const scenarioControls = document.getElementById("scenarioControls");
const scenarioSelect = document.getElementById("scenarioSelect");
const blcReleaseControl = document.getElementById("blcReleaseControl");
const blcReleaseLabel = document.getElementById("blcReleaseLabel");
const blcReleaseSwitch = document.getElementById("blcReleaseSwitch");
const blcReleaseStatus = document.getElementById("blcReleaseStatus");
const blcReleaseExportButton = document.getElementById("blcReleaseExportButton");
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
const organMatrixToggle = document.getElementById("organMatrixToggle");
const causeOverlayGround = document.getElementById("causeOverlayGround");
const causeOverlayEffect = document.getElementById("causeOverlayEffect");
const causeOverlayLife = document.getElementById("causeOverlayLife");
const causeTitleGround = document.getElementById("causeTitleGround");
const causeTitleEffect = document.getElementById("causeTitleEffect");
const causeTitleLife = document.getElementById("causeTitleLife");
const causeBodyGround = document.getElementById("causeBodyGround");
const causeBodyEffect = document.getElementById("causeBodyEffect");
const causeBodyLife = document.getElementById("causeBodyLife");
const contributionRoleCard = document.getElementById("contributionRoleCard");

// Die Startansicht ist bewusst eine Gesamtübersicht: Erst eine Auswahl im
// Seitenmenü legt eine konkrete Planetare Grenze als Kontext fest.
let selectedBoundaryId = null;
let expandedBoundaryId = null;
let selectedDomainComponent = null;
let selectedItemId = null;
let selectedYear = null;
let timeWindow = "data";
let projectionScenario = "STEPS";
let currentHealth = null;
let selectedOrganId = null;
let selectedAgeGroup = "adults";
let healthMarkersEnabled = true;
let healthBoundaryFilter = "all";
let healthOrganFilter = "all";
let healthMarkerSwitch = null;
let organMatrixPanel = null;
let knowledgeNetworks = {};
let knowledgePanel = null;
let mobilePanelView = "life";
const BLC_CURVE_APPROVALS_SOURCE = "data/blc/curve-approvals-v1.json";
let blcCurveApprovalManifest = { format: "gwl-blc-curve-approvals-v1", version: "1.0", approvedCurves: [] };
const blcCurveApprovalDraft = new Map();
const blcCurveDescriptorDraft = new Map();
let activeBlcCurveApproval = null;

function isLocalBlcEditor() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

async function loadBlcCurveApprovalManifest() {
  try {
    const response = await fetch(BLC_CURVE_APPROVALS_SOURCE, { cache: "no-store" });
    if (!response.ok) throw new Error(`${BLC_CURVE_APPROVALS_SOURCE}: ${response.status}`);
    const payload = await response.json();
    if (payload?.format !== "gwl-blc-curve-approvals-v1" || !Array.isArray(payload.approvedCurves)) {
      throw new Error("Ungültiges BLC-Freigabeformat");
    }
    blcCurveApprovalManifest = payload;
  } catch (error) {
    console.warn("BLC-Kurvenfreigaben konnten nicht geladen werden:", error);
  }
}

function getCommittedBlcApproval(curveId) {
  return (blcCurveApprovalManifest.approvedCurves || []).find(entry =>
    entry.curveId === curveId && entry.status === "approved"
  ) || null;
}

function getEffectiveBlcApproval(curveId) {
  if (blcCurveApprovalDraft.has(curveId)) return blcCurveApprovalDraft.get(curveId);
  return Boolean(getCommittedBlcApproval(curveId));
}

function setBlcReleaseControl({ curveId = "", eligible = false, descriptor = null } = {}) {
  if (!blcReleaseControl || !blcReleaseSwitch || !blcReleaseStatus) return;
  if (!curveId) {
    activeBlcCurveApproval = null;
    blcReleaseControl.hidden = true;
    return;
  }
  const localEditor = isLocalBlcEditor();
  const approved = eligible && getEffectiveBlcApproval(curveId);
  activeBlcCurveApproval = { curveId, eligible, descriptor };
  if (descriptor) blcCurveDescriptorDraft.set(curveId, descriptor);
  blcReleaseControl.hidden = false;
  blcReleaseControl.classList.toggle("is-readonly", !localEditor);
  if (blcReleaseLabel) blcReleaseLabel.hidden = !localEditor;
  if (blcReleaseExportButton) blcReleaseExportButton.hidden = !localEditor;
  blcReleaseSwitch.disabled = !localEditor || !eligible;
  blcReleaseSwitch.checked = approved;
  blcReleaseControl.classList.toggle("is-approved", approved);
  blcReleaseStatus.textContent = !eligible
    ? "Nicht freigabefähig: Es fehlt eine Beobachtungsreihe mit mindestens zwei Zeitpunkten."
    : approved
      ? localEditor
        ? "Für den nächsten versionierten BLC-Export freigegeben."
        : "Versioniert für BLC freigegeben."
      : localEditor
        ? "Freigabefähig, aber noch nicht für BLC ausgewählt."
        : "Nicht für BLC freigegeben.";
}

function updateActiveBlcCurveApproval() {
  if (!activeBlcCurveApproval || !blcReleaseSwitch || blcReleaseSwitch.disabled) return;
  blcCurveApprovalDraft.set(activeBlcCurveApproval.curveId, blcReleaseSwitch.checked);
  setBlcReleaseControl(activeBlcCurveApproval);
}

function buildBlcCurveApprovalExport() {
  const approvals = new Map((blcCurveApprovalManifest.approvedCurves || []).map(entry => [entry.curveId, entry]));
  for (const [curveId, approved] of blcCurveApprovalDraft.entries()) {
    if (!approved) {
      approvals.delete(curveId);
      continue;
    }
    const descriptor = blcCurveDescriptorDraft.get(curveId) || null;
    const previous = approvals.get(curveId);
    if (descriptor || previous) approvals.set(curveId, { ...(previous || {}), ...(descriptor || {}), curveId, status: "approved" });
  }
  return {
    format: "gwl-blc-curve-approvals-v1",
    version: "1.0",
    approvedCurves: [...approvals.values()].sort((a, b) => a.curveId.localeCompare(b.curveId))
  };
}

function downloadBlcCurveApprovalManifest() {
  if (!isLocalBlcEditor()) return;
  const payload = `${JSON.stringify(buildBlcCurveApprovalExport(), null, 2)}\n`;
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "curve-approvals-v1.json";
  link.click();
  URL.revokeObjectURL(url);
}

function isMobilePanelLayout() {
  return window.matchMedia("(max-width: 820px)").matches;
}

function setMobilePanelView(view, options = {}) {
  if (!panelGrid || !["ground", "effect", "life"].includes(view)) return;
  mobilePanelView = view;
  panelGrid.dataset.mobileView = view;
  if (isMobilePanelLayout()) {
    const visibleClass = view === "ground" ? "panel-left" : view === "effect" ? "panel-center" : "panel-right";
    panelGrid.querySelectorAll(":scope > .panel").forEach(panel => panel.setAttribute("aria-hidden", String(!panel.classList.contains(visibleClass))));
  } else {
    panelGrid.querySelectorAll(":scope > .panel").forEach(panel => panel.removeAttribute("aria-hidden"));
  }
  const groundOpen = view === "ground";
  mobileGroundHandle?.setAttribute("aria-expanded", String(groundOpen));
  if (mobileGroundHandle) {
    mobileGroundHandle.querySelector("b").textContent = groundOpen ? "‹" : "›";
    mobileGroundHandle.setAttribute("aria-label", groundOpen ? "Grundlage schließen und zur Bodymap" : "Grundlage öffnen");
  }
  if (options.focus) {
    const target = view === "ground"
      ? document.querySelector(".panel-left .boundary-button.active, .panel-left .boundary-button")
      : view === "effect"
        ? document.querySelector(".panel-center .panel-heading")
        : document.querySelector(".panel-right .panel-heading");
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
}

mobileGroundHandle?.addEventListener("click", () => {
  const openGround = mobilePanelView !== "ground";
  setMobilePanelView(openGround ? "ground" : "life", { focus: openGround });
});
mobileLifeBack?.addEventListener("click", () => setMobilePanelView("life", { focus: true }));
window.matchMedia("(max-width: 820px)").addEventListener("change", event => {
  if (event.matches) setMobilePanelView("life");
  else setMobilePanelView(mobilePanelView);
});

let HOTSPOTS = {};
let ORGAN_MEDIA = {};
let ORGAN_SYSTEMS = {};
let ORGAN_ALIAS_INDEX = new Map();
let ORGAN_LEGACY_ALIAS_INDEX = new Map();
let ORGAN_SEARCH_TERM_INDEX = new Map();

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
  // Der Import allein aktiviert noch keine abgestufte Markerfüllung und keine lokale Aussage.
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
  return labels.map(resolveOrganId).find(Boolean) || null;
}

function normalizeOrganLookupKey(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveOrganId(value) {
  if (!value) return null;
  if (HOTSPOTS[value]) return value;
  const key = normalizeOrganLookupKey(value);
  return ORGAN_ALIAS_INDEX.get(key) || ORGAN_LEGACY_ALIAS_INDEX.get(key) || null;
}

function resolveOrganSearchTargets(value) {
  const directId = resolveOrganId(value);
  if (directId) return [directId];
  return [...(ORGAN_SEARCH_TERM_INDEX.get(normalizeOrganLookupKey(value)) || [])];
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
      for (const rawOrganId of endpoint.organIds || []) {
        const organId = resolveOrganId(rawOrganId);
        if (!organId) continue;
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

        const foundationIds = [...new Set([
          risk?.primaryBoundaryId,
          ...(risk?.relatedBoundaryIds || [])
        ].filter(Boolean))];
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
  ORGAN_SYSTEMS = Object.fromEntries((config.systems || []).map(system => [system.id, system]));
  ORGAN_ALIAS_INDEX = new Map();
  ORGAN_LEGACY_ALIAS_INDEX = new Map();
  ORGAN_SEARCH_TERM_INDEX = new Map();
  (config.organs || []).forEach(organ => {
    HOTSPOTS[organ.id] = {
      label: organ.label,
      x: organ.x,
      y: organ.y,
      side: organ.side || "right",
      entityType: organ.entityType || "organ",
      primarySystemId: organ.primarySystemId || "",
      relatedSystemIds: organ.relatedSystemIds || [],
      aliases: organ.aliases || [],
      legacyAliases: organ.legacyAliases || [],
      searchTerms: organ.searchTerms || []
    };
    ORGAN_MEDIA[organ.id] = {
      label: organ.label,
      img: organ.image,
      systemLabel: organ.systemLabel || ORGAN_SYSTEMS[organ.primarySystemId]?.label || "",
      layout: organ.layout || "stack"
    };
    [organ.id, organ.label, ...(organ.aliases || [])].forEach(alias => {
      const key = normalizeOrganLookupKey(alias);
      if (key && !ORGAN_ALIAS_INDEX.has(key)) ORGAN_ALIAS_INDEX.set(key, organ.id);
    });
    (organ.legacyAliases || []).forEach(alias => {
      const key = normalizeOrganLookupKey(alias);
      if (key && !ORGAN_ALIAS_INDEX.has(key) && !ORGAN_LEGACY_ALIAS_INDEX.has(key)) {
        ORGAN_LEGACY_ALIAS_INDEX.set(key, organ.id);
      }
    });
    (organ.searchTerms || []).forEach(term => {
      const key = normalizeOrganLookupKey(term);
      if (!key) return;
      if (!ORGAN_SEARCH_TERM_INDEX.has(key)) ORGAN_SEARCH_TERM_INDEX.set(key, new Set());
      ORGAN_SEARCH_TERM_INDEX.get(key).add(organ.id);
    });
  });
}



const FRESHWATER_KNOWLEDGE_SOURCE = "data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json";
const BLC_CURVE_TEST_SOURCE = "data/tests/blc-curve-release-test-v1.json";

function isBlcCurveTestMode() {
  return new URLSearchParams(window.location.search).get("blcCurveTest") === "1";
}

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
      historicalSegments: (item.historicalSeries || []).map(segment => ({
        ...segment,
        points: (segment.values || []).map(point => ({
          year: Number(point.year),
          value: Number(point.value),
          display: `≈ ${String(Number(point.value).toFixed(2)).replace(".", ",")} %`,
          sourceRefs: [segment.sourceId || "src_freshwater_porkka_2024"],
          uncertainty: Number.isFinite(Number(point.iqrMin)) && Number.isFinite(Number(point.iqrMax))
            ? `Modellensemble IQR: ${String(Number(point.iqrMin).toFixed(2)).replace(".", ",")}–${String(Number(point.iqrMax).toFixed(2)).replace(".", ",")} %.`
            : "Interquartilsbereich des Modellensembles."
        }))
      })),
      methodBreaks: item.methodBreaks || [],
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
      id === "blue-water-global" ||
      id === "green-water-global" ||
      id === "blue-water-streamflow" ||
      id === "green-water-rootzone-soil-moisture" ||
      freshwaterControlLabels.has(label);

    return !isBlueGreenControl;
  });

  const freshwaterItems = [
    {
      id: "blue-water-streamflow",
      scope: "all",
      label: "Blaues Wasser · ungewöhnlicher Abfluss",
      enabled: true,
      knowledgeSource: FRESHWATER_KNOWLEDGE_SOURCE,
      knowledgeTimeSeriesId: "blue_water_streamflow",
      knowledgeEffectFocus: "Blaues Wasser: Anteil der Landfläche mit ungewöhnlich hohem oder niedrigem Abfluss. Ein höherer Wert bedeutet mehr gestörte Fläche – nicht mehr Wasser.",
      menuType: "control"
    },
    {
      id: "green-water-rootzone-soil-moisture",
      scope: "all",
      label: "Grünes Wasser · ungewöhnliche Bodenfeuchte für Pflanzen",
      enabled: true,
      knowledgeSource: FRESHWATER_KNOWLEDGE_SOURCE,
      knowledgeTimeSeriesId: "green_water_rootzone_soil_moisture",
      knowledgeEffectFocus: "Grünes Wasser: Anteil der Landfläche mit für Pflanzen ungewöhnlich trockener oder nasser Bodenfeuchte. Ein höherer Wert bedeutet mehr gestörte Fläche – nicht mehr Wasser.",
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
  if (isBlcCurveTestMode()) {
    const climateGroup = index?.systemBoundaries
      ?.find(boundary => boundary.id === "planetary_boundaries")
      ?.groups?.find(group => group.id === "climate_change");
    if (climateGroup && !(climateGroup.items || []).some(item => item.id === "blc_curve_release_test")) {
      climateGroup.items = [
        ...(climateGroup.items || []),
        {
          id: "blc_curve_release_test",
          label: "[TEST] Kurve ohne Beobachtungsreihe",
          type: "study",
          source: BLC_CURVE_TEST_SOURCE
        }
      ];
    }
  }
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
  knowledgePanel.addEventListener("click", event => {
    const routeButton = event.target.closest("[data-life-route-boundary]");
    if (routeButton) {
      followHealthRoute(routeButton);
      return;
    }
    const organButton = event.target.closest("[data-organ-route]");
    if (organButton) openOrganOverlay(organButton.dataset.organRoute);
  });

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
  const crosslinkHtml = crosslinks.map(crosslink => {
    const label = typeof crosslink === "string" ? crosslink : crosslink.label;
    const boundaryId = typeof crosslink === "string"
      ? data.boundaries.find(boundary => boundary.label === label)?.id
      : crosslink.boundaryId;
    return boundaryId && getBoundary(boundaryId)
      ? `<button type="button" class="path-crosslink" data-life-route-boundary="${boundaryId}">↗ ${label}</button>`
      : `<span class="path-crosslink">↗ ${label}</span>`;
  }).join("");

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
          ${crosslinkHtml}
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
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME</div>
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
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME</div>
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

function renderNaturalGasEnergyMainView() {
  const network = knowledgeNetworks.naturalGasEnergy;
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Erdgas-Pilotdatensatz nicht geladen.</strong></div>`;
  }

  const cards = (network.measurements || []).map(m => `
    <article class="measurement-card oil-measurement-card">
      <div class="measurement-card-label">${m.metric || m.id}</div>
      <div class="measurement-card-value">${m.display || "–"}</div>
      <div class="measurement-card-meta">${m.period || ""} · ${m.geography || ""}</div>
      <p>${m.interpretation || ""}</p>
      ${m.uncertainty ? `<p><strong>Unsicherheit:</strong> ${m.uncertainty}</p>` : ""}
      ${sourceLinksHtml(network, m.sourceRefs)}
    </article>`).join("");

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
    `<p><strong>${d.label}: ${String(d.level || "").replaceAll("_", " ")}</strong><br>${d.rationale}</p>`
  ).join("");

  return `
    <div class="oil-pilot">
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME</div>
      <h2>Energie → Erdgas</h2>
      <p class="oil-lead">
        Erdgas wird als eigener globaler <strong>system_flow</strong> geführt.
        Energieversorgung, physisches Gasvolumen, CO₂ aus Verbrennung und Methanemissionen
        entlang der Lieferkette bleiben getrennte Größen.
      </p>
      <div class="oil-path">
        <span>Stoff- und Energieströme</span><b>→</b><span>Energie</span><b>→</b><span>Erdgas</span>
      </div>
      <h3>MESSWERTE</h3>
      <div class="measurement-grid">${cards}</div>
      <h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3>
      <div class="oil-boundary-links">${linkCards}</div>
      <details><summary>Quellen · frei zugänglich</summary>${allOpenSourcesHtml(network)}</details>
      <details><summary>Wissenslücken · ${(network.knowledgeGaps || []).length}</summary>${gaps}</details>
      <details><summary>Handlungsspielraum</summary><p>${action.methodNote || ""}</p>${actionRows}</details>
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
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME</div>
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
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME</div>
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
      const indexedItems = (indexBoundary.groups || []).flatMap(group => [
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
      const waterServiceItems = [
        {
          id: "water-sanitation-services",
          scope: "all",
          label: "Wasser- & Sanitärversorgung",
          enabled: true,
          groupOnly: true,
          summary: "Technische und soziale Versorgungsbedingungen verbinden Wasserverfügbarkeit und -qualität mit konkreten gesundheitlichen Expositionen."
        },
        {
          id: "drinking-water-health",
          scope: "global",
          label: "↳ Trinkwasserzugang · Gesundheit",
          enabled: true,
          contributionRole: "deepening_with_organ",
          type: "Gesundheitsbezug",
          metricLabel: "Zugang zu sicher gemanagtem Trinkwasser",
          chartUnit: "%",
          timePointPeriod: "global",
          timeSeriesFinding: "JMP-Schätzung des globalen Anteils der Bevölkerung mit sicher gemanagtem Trinkwasser. Zugang und Gesundheitslast werden getrennt dargestellt.",
          value: "73,7 %",
          reference: "der Weltbevölkerung mit sicher gemanagtem Trinkwasser",
          period: "2024 · global",
          sourceLabel: "WHO/UNICEF JMP 2025",
          sourceUrl: "https://data.unicef.org/resources/jmp-report-2025/",
          summary: "Der Zugang zu sicherem Trinkwasser ist eine Versorgungs- und Expositionsfrage. Er gehört zur technologischen und sozialen Umwelt, nicht zur planetaren Kontrollvariable für blaues oder grünes Wasser.",
          finding: "2024 hatten weltweit 2,1 Milliarden Menschen kein sicher gemanagtes Trinkwasser. 106 Millionen Menschen nutzten direkt Oberflächenwasser.",
          effect: "Unsicheres Trinkwasser → fäkal-orale Erregerexposition → Durchfallerkrankungen → Verdauungssystem.",
          uncertainty: "Die JMP-Schätzung umfasst Zugang, Verfügbarkeit und Kontaminationsfreiheit. Sie ist nicht identisch mit der GBD-Expositionskategorie „unsichere Trinkwasserquelle“ und keine direkte Krankheitsfallzahl.",
          lifeNote: "Im Bereich LEBEN erscheint der belegte Pfad am Verdauungssystem. Der Indien-Wert ist ein nationaler Kontext und wird nicht auf andere Orte übertragen.",
          timePoints: [
            { year: 2000, value: 61.2482581100601, display: "61,2 %", label: "JMP-Schätzung 2000" },
            { year: 2001, value: 61.4811114393704, display: "61,5 %", label: "JMP-Schätzung 2001" },
            { year: 2002, value: 61.8023813703793, display: "61,8 %", label: "JMP-Schätzung 2002" },
            { year: 2003, value: 62.1281324963474, display: "62,1 %", label: "JMP-Schätzung 2003" },
            { year: 2004, value: 62.4557839969167, display: "62,5 %", label: "JMP-Schätzung 2004" },
            { year: 2005, value: 62.8072334946997, display: "62,8 %", label: "JMP-Schätzung 2005" },
            { year: 2006, value: 63.1316570759531, display: "63,1 %", label: "JMP-Schätzung 2006" },
            { year: 2007, value: 63.4492647908181, display: "63,4 %", label: "JMP-Schätzung 2007" },
            { year: 2008, value: 63.7620533556781, display: "63,8 %", label: "JMP-Schätzung 2008" },
            { year: 2009, value: 64.2906505441352, display: "64,3 %", label: "JMP-Schätzung 2009" },
            { year: 2010, value: 64.8164573458294, display: "64,8 %", label: "JMP-Schätzung 2010" },
            { year: 2011, value: 65.3227715045301, display: "65,3 %", label: "JMP-Schätzung 2011" },
            { year: 2012, value: 65.8869865001761, display: "65,9 %", label: "JMP-Schätzung 2012" },
            { year: 2013, value: 66.4713029467872, display: "66,5 %", label: "JMP-Schätzung 2013" },
            { year: 2014, value: 67.0612035289485, display: "67,1 %", label: "JMP-Schätzung 2014" },
            { year: 2015, value: 67.6504377531236, display: "67,7 %", label: "JMP-Schätzung 2015" },
            { year: 2016, value: 68.2411717345558, display: "68,2 %", label: "JMP-Schätzung 2016" },
            { year: 2017, value: 68.818921544456, display: "68,8 %", label: "JMP-Schätzung 2017" },
            { year: 2018, value: 69.3903638517939, display: "69,4 %", label: "JMP-Schätzung 2018" },
            { year: 2019, value: 69.946037359687, display: "69,9 %", label: "JMP-Schätzung 2019" },
            { year: 2020, value: 70.4784606380115, display: "70,5 %", label: "JMP-Schätzung 2020" },
            { year: 2021, value: 70.9952769597765, display: "71,0 %", label: "JMP-Schätzung 2021" },
            { year: 2022, value: 71.5080020640923, display: "71,5 %", label: "JMP-Schätzung 2022" },
            { year: 2023, value: 71.9907403245118, display: "72,0 %", label: "JMP-Schätzung 2023" },
            { year: 2024, value: 73.6686144265244, display: "73,7 %", label: "JMP-Schätzung 2024" }
          ],
          menuType: "health_context"
        },
        {
          id: "india-unsafe-water-diarrhoea",
          scope: "global",
          label: "↳ Indien · Durchfallerkrankungen bei Kindern",
          enabled: true,
          contributionRole: "deepening_with_organ",
          type: "Regionaler Gesundheitskontext",
          value: "38,6",
          reference: "Todesfälle je 100.000 Kinder unter 5 Jahren",
          period: "2019 · Indien",
          sourceLabel: "Behera & Mishra · BMC Public Health 2022",
          sourceUrl: "https://doi.org/10.1186/s12889-022-12515-3",
          summary: "Nationaler Kontext: modellierte GBD-Attribution von Durchfallsterblichkeit bei Kindern unter fünf Jahren zu unsicheren Trinkwasserquellen in Indien.",
          finding: "Für 2019 wurden in Indien 38,6 Todesfälle je 100.000 Kinder unter fünf Jahren unsicheren Trinkwasserquellen zugerechnet (95-%-Unsicherheitsintervall: 26,01–53,43).",
          effect: "Unsichere Trinkwasserquelle → fäkal-orale Erregerexposition → Durchfallerkrankungen → Verdauungssystem.",
          uncertainty: "Modellierte GBD-Schätzung für Indien; keine direkte Zählung und nicht auf andere Orte übertragbar. Unsichere Sanitärversorgung und fehlende Handwaschmöglichkeit dürfen nicht hinzugerechnet werden.",
          lifeNote: "Der Wert ist ein nationaler Kontext für Indien und keine globale oder lokale Schätzung.",
          menuType: "health_context"
        }
      ];
      boundary.items = [...indexedItems, ...waterServiceItems];
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

function genericTimeSeriesCards(network) {
  if (network?.presentation?.hideTimeSeriesInKnowledgeView) return "";
  const seriesList = network?.timeSeries || [];
  if (!seriesList.length) return "";
  const projectionList = network?.projectionSeries || [];
  const compatibleProjections = observed => projectionList.filter(projection => {
    if (projection.observedSeriesId) return projection.observedSeriesId === observed.id;
    const sameUnitSeries = seriesList.filter(series => series.unit && series.unit === projection.unit);
    return sameUnitSeries.length === 1 && sameUnitSeries[0].id === observed.id;
  });
  const cards = seriesList.map(series => {
    const points = (series.points || []).filter(point => Number.isFinite(point.year) && Number.isFinite(point.value));
    if (!points.length) return null;
    const historicalSegments = (series.historicalSeries || []).map(segment => ({
      ...segment,
      points: (segment.points || segment.values || []).filter(point => Number.isFinite(point.year) && Number.isFinite(point.value))
    })).filter(segment => segment.points.length);
    const projections = compatibleProjections(series).filter(projection => (projection.points || []).some(point => Number.isFinite(point.year) && Number.isFinite(point.value)));
    const width = 360, height = 92, pad = 8;
    const allPoints = [...historicalSegments.flatMap(segment => segment.points), ...points, ...projections.flatMap(projection => projection.points || [])];
    const years = allPoints.map(point => point.year);
    const values = allPoints.map(point => point.value);
    const minYear = Math.min(...years), maxYear = Math.max(...years);
    const minValue = Math.min(...values), maxValue = Math.max(...values);
    const spanYear = Math.max(1, maxYear - minYear);
    const spanValue = Math.max(0.000001, maxValue - minValue);
    const makePolyline = segmentPoints => segmentPoints.map(point => {
      const x = pad + ((point.year - minYear) / spanYear) * (width - pad * 2);
      const y = height - pad - ((point.value - minValue) / spanValue) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const first = points[0], latest = points[points.length - 1];
    const formatValue = point => point.display || `${Number(point.value).toLocaleString("de-DE", { maximumFractionDigits: 2 })} ${series.unit || ""}`;
    const label = series.label || series.metric || "Zeitreihe";
    return {
      label,
      period: `${minYear}–${maxYear}`,
      html: `<div class="knowledge-series-card">
      <strong>${label}</strong>
      <p>${series.metric || ""}</p>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${series.label || "Zeitreihe"}: ${minYear} bis ${maxYear}">
        ${historicalSegments.map(segment => `<polyline class="knowledge-series-historical" points="${makePolyline(segment.points)}" vector-effect="non-scaling-stroke"></polyline>`).join("")}
        <polyline class="knowledge-series-observed" points="${makePolyline(points)}" vector-effect="non-scaling-stroke"></polyline>
        ${projections.map(projection => `<polyline class="knowledge-series-projection" points="${makePolyline(projection.points)}" vector-effect="non-scaling-stroke"></polyline>`).join("")}
      </svg>
      <div class="knowledge-series-values"><span>${first.year}: <b>${formatValue(first)}</b></span><span>${latest.year}: <b>${formatValue(latest)}</b></span></div>
      ${(historicalSegments.length || projections.length) ? `<div class="knowledge-series-legend"><span class="is-observed">Beobachtung</span>${historicalSegments.length ? '<span class="is-historical">Historische Rekonstruktion</span>' : ""}${projections.length ? '<span class="is-projection">Projektion</span>' : ""}</div>` : ""}
      ${projections.map(projection => `<p><small><strong>${projection.scenarioLabel || "Projektion"}:</strong> ${projection.method || ""} ${projection.uncertainty || ""}</small></p>`).join("")}
      <p><small>${series.finding || ""} ${series.uncertainty || ""}</small></p>
    </div>`
    };
  }).filter(Boolean);
  const hasMultipleSeries = cards.length > 1;
  const seriesHtml = hasMultipleSeries
    ? `<div class="knowledge-series-collapsibles">${cards.map(card => `
        <details class="knowledge-series-details">
          <summary><strong>${card.label}</strong><span>${card.period}</span></summary>
          ${card.html}
        </details>`).join("")}</div>`
    : `<div class="knowledge-series-grid">${cards.map(card => card.html).join("")}</div>`;
  const assignedProjectionIds = new Set(seriesList.flatMap(series => compatibleProjections(series).map(projection => projection.id)));
  const unmatchedProjections = projectionList.filter(projection => !assignedProjectionIds.has(projection.id)).map(series => `
    <div class="knowledge-series-card knowledge-projection-card">
      <strong>PROJEKTION · ${series.scenarioLabel || "Trend"}</strong>
      <p>${series.method || ""}</p>
      <div class="knowledge-projection-values">${(series.points || []).map(point => `<span>${point.year}: <b>${point.display || point.value}</b></span>`).join("")}</div>
      <p><small>${series.uncertainty || ""}</small></p>
    </div>`).join("");
  const projectionHtml = unmatchedProjections
    ? `<h3>NICHT ZUGEORDNETE PROJEKTION</h3><div class="knowledge-series-grid">${unmatchedProjections}</div>`
    : "";
  return cards.length ? `<h3>MESS- UND ZEITREIHEN</h3>${seriesHtml}${projectionHtml}` : "";
}

function renderGenericPathChain(pathway) {
  const steps = (pathway.chain || pathway.path || [])
    .map(step => typeof step === "string" ? step : step.label)
    .filter(Boolean);

  return steps.map((label, index) => {
    const organId = resolveOrganId(label);
    const node = organId
      ? `<button type="button" class="effect-path-link" data-organ-route="${organId}">${label} ↗</button>`
      : `<span>${label}</span>`;
    return `${index ? '<span aria-hidden="true">→</span>' : ""}${node}`;
  }).join("");
}

function renderGenericKnowledgeView(network, indexEntry) {
  if (!network) {
    return `<div class="nutrient-choice-note"><strong>Knowledge-Datensatz nicht geladen.</strong></div>`;
  }

  const presentation = network.presentation || {};
  const primaryMeasurement = getPrimaryKnowledgeMeasurement(network);
  const hiddenMeasurementIds = new Set(presentation.hiddenMeasurementIds || []);
  const measurements = (presentation.hidePrimaryMeasurementInKnowledgeView
    ? (network.measurements || []).filter(m => m.id !== primaryMeasurement?.id)
    : (network.measurements || [])).filter(m => !hiddenMeasurementIds.has(m.id));
  const cards = measurements.map(m => genericStudyCard(network, m));
  const evidence = cards.filter(c => c.displayType === "study_evidence");
  const values = cards.filter(c => c.displayType !== "study_evidence");

  const pathways = deriveGenericPathways(network).map(p => `
    <div class="oil-boundary-link">
      <strong>${p.label === "Expositions- und Wirkungspfad" ? "Gesundheitspfad" : (p.label || "Wirkungspfad")}</strong>
      <p class="effect-path-flow">${renderGenericPathChain(p)}</p>
      ${p.evidenceStatus ? `<span>Evidenz: ${p.evidenceStatus}</span>` : ""}
      ${p.caution ? `<p><em>${p.caution}</em></p>` : ""}
    </div>`).join("");

  const boundaryInteractions = (network.boundaryInteractions || []).map(interaction => `
    <div class="oil-boundary-link">
      <strong>${interaction.boundary || (interaction.boundaries || []).join(" ↔ ") || "Verbindung"}</strong>
      <p>${interaction.mechanism || interaction.relation || ""}</p>
      ${interaction.evidenceStatus ? `<span>Evidenz: ${interaction.evidenceStatus}</span>` : ""}
      ${interaction.accountingRule ? `<p><em>${interaction.accountingRule}</em></p>` : ""}
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

  const compactKnowledgeView = presentation.compactKnowledgeView === true;

  return `
    ${compactKnowledgeView ? `
    <details class="knowledge-panel-collapsible">
      <summary>
        <span>ERGÄNZENDE STUDIENWERTE UND WIRKUNGSPFADE</span>
        <small>Bei Bedarf anzeigen</small>
      </summary>
      <div class="knowledge-panel-collapsible-content">` : ""}
    <div class="oil-pilot generic-knowledge-view">
      ${evidence.length ? `<h3>STUDIENBELEGE</h3><div class="measurement-grid">${evidence.map(c => c.html).join("")}</div>` : ""}
      ${values.length ? `${compactKnowledgeView ? "" : "<h3>STUDIENWERTE</h3>"}<div class="measurement-grid">${values.map(c => c.html).join("")}</div>` : ""}

      ${getSelectedFreshwaterRegion(network) ? "" : genericTimeSeriesCards(network)}

      <h3>WIRKUNGSPFADE</h3>
      <div class="oil-boundary-links">${pathways || "<p>Noch keine Wirkungspfade hinterlegt.</p>"}</div>

      ${boundaryInteractions ? `<h3>VERBINDUNGEN ZU PLANETAREN GRENZEN</h3><div class="oil-boundary-links">${boundaryInteractions}</div>` : ""}

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
    </div>
    ${compactKnowledgeView ? "</div></details>" : ""}`;
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
  const activeItemId = state.boundaryId === "mental-load" ? state.componentId : state.itemId;
  const item = boundary?.items?.find(entry => entry.id === activeItemId);
  if (!item?.knowledgeSource) return null;
  const rawNetwork = getKnowledgeNetworkBySource(item.knowledgeSource);
  return {
    state,
    boundary,
    item,
    network: getKnowledgeNetworkForItem(rawNetwork, item),
    indexEntry: getKnowledgeIndexEntry(state.boundaryId, activeItemId)
  };
}

const CONTRIBUTION_ROLES = {
  pg_core: {
    menu: "PG-Kernbeitrag",
    title: "PG-Kernbeitrag · Zustand & Grenze",
    note: "Dieser Beitrag beschreibt eine Kontrollvariable oder einen Zustandswert der Planetaren Grenze. Messwert, Referenz beziehungsweise Grenze, Zeitraum und Modell-/Raumbezug stehen im Vordergrund."
  },
  deepening_with_organ: {
    menu: "Vertiefung · Organbezug",
    title: "Vertiefung · belegter Organbezug",
    note: "Dieser Beitrag vertieft einen konkreten Umwelt–Expositions–Gesundheitspfad. Er kann einen Organmarker nur bei geprüftem Pfad beeinflussen; ein planetarer Grenzwert ist nicht erforderlich."
  },
  deepening_without_organ: {
    menu: "Vertiefung · ohne Organbezug",
    title: "Vertiefung · ohne Organbezug",
    note: "Dieser Beitrag vertieft einen Umwelt-, Stoff- oder Expositionszusammenhang. Ein belastbarer Organpfad ist derzeit nicht Gegenstand oder noch nicht belegt."
  },
  supplementary_context: {
    menu: "Ergänzender Kontext",
    title: "Ergänzender Einflussbereich · Kontext",
    note: "Dieser Beitrag gehört nicht zum PG-Kernmodell. Er ordnet einen menschengemachten Einflussbereich, Stoffstrom oder eine Lebensbedingung ein."
  }
};

function contributionRoleIcon(roleId) {
  const hasOrganReference = roleId === "deepening_with_organ";
  const icon = hasOrganReference ? `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle class="role-icon-marker" cx="12.25" cy="12.25" r="8.8"/>
        <circle class="role-icon-marker-inner" cx="12.25" cy="12.25" r="6.05"/>
        <circle class="role-icon-loupe" cx="22" cy="21.5" r="5.45"/>
        <path class="role-icon-overlay" d="m25.9 25.4 3 3M18.7 21.5h1.2l.8-1.7 1.2 3.35.9-2.15.65 1.1h1.65"/>
        <path class="role-icon-heart" d="M22 25.25s-3.4-2.1-3.4-4.05c0-.98.73-1.72 1.68-1.72.72 0 1.35.4 1.72 1.03.37-.63 1-1.03 1.72-1.03.95 0 1.68.74 1.68 1.72 0 1.95-3.4 4.05-3.4 4.05Z"/>
      </svg>` : `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle class="role-icon-loupe" cx="13.5" cy="13.5" r="8"/>
        <path class="role-icon-overlay" d="m19.2 19.2 7.1 7.1"/>
      </svg>`;
  const wrapper = document.createElement("span");
  wrapper.className = `contribution-role-icon is-${roleId}${hasOrganReference ? " has-organ-reference" : " is-plain-loupe"}`;
  wrapper.innerHTML = icon;
  return wrapper;
}

function contributionRoleFor(boundary, item) {
  if (item?.contributionRole && CONTRIBUTION_ROLES[item.contributionRole]) return item.contributionRole;
  const network = item?.knowledgeSource ? getKnowledgeNetworkBySource(item.knowledgeSource) : null;
  if ((network?.healthContext?.markerSignals || []).length) return "deepening_with_organ";
  if (item?.knowledgeSource && item.menuType !== "control") return "deepening_without_organ";
  if (isEahExtension(boundary)) return "supplementary_context";
  return "pg_core";
}

function updateContributionRole(boundary = null, item = null) {
  if (!contributionRoleCard) return;
  if (!boundary || !item) {
    contributionRoleCard.innerHTML = `<span class="eyebrow">Beitragsrolle</span><strong>Gesamtübersicht</strong><p>Wähle einen Beitrag in der linken Navigation. Seine Rolle bestimmt, welche Angaben in dieser Spalte fachlich erwartet werden.</p>`;
    document.querySelectorAll(".metrics .metric, .panel-center > .accordion").forEach(node => { node.hidden = false; });
    return;
  }
  const roleId = contributionRoleFor(boundary, item);
  const role = CONTRIBUTION_ROLES[roleId];
  contributionRoleCard.innerHTML = `<span class="eyebrow">Beitragsrolle</span><strong>${role.title}</strong><p>${role.note}</p>`;
  requestAnimationFrame(() => {
    if (roleId === "pg_core") {
      document.querySelectorAll(".metrics .metric, .panel-center > .accordion").forEach(node => { node.hidden = false; });
      return;
    }
    document.querySelectorAll(".metrics .metric").forEach(card => {
      const value = card.querySelector("strong, a")?.textContent?.trim();
      card.hidden = !value || value === "–";
    });
    [findingText, effectPath, uncertaintyValue].forEach(node => {
      const card = node?.closest("details");
      if (card) card.hidden = !node.textContent.trim() || node.textContent.trim() === "–";
    });
  });
}

function updateGroupOverviewRole() {
  if (!contributionRoleCard) return;
  contributionRoleCard.innerHTML = `<span class="eyebrow">Navigationsebene</span><strong>Bereichsübersicht</strong><p>Diese Auswahl bündelt untergeordnete Beiträge. Messwerte und Wirkungspfade erscheinen erst nach Auswahl eines konkreten Beitrags.</p>`;
}

function renderGroupOverview(boundary, item) {
  setBlcReleaseControl();
  updateGroupOverviewRole();
  const frameworkLabel = isEahExtension(boundary)
    ? "ERGÄNZENDER EINFLUSSBEREICH"
    : "PLANETARE GRENZE";
  if (focusType) focusType.textContent = `${frameworkLabel} · ${boundary?.label || ""}`;
  if (focusTitle) focusTitle.textContent = item?.label || "Bereichsübersicht";
  if (focusSummary) focusSummary.textContent = item?.summary || "Dieser Bereich bündelt untergeordnete Beiträge. Wähle einen konkreten Beitrag für Messwerte und Wirkungspfade.";
  setStandardEffectBlocksVisible(false);
  renderHealth(null);
  const panel = ensureKnowledgePanel();
  panel.innerHTML = "";
  panel.hidden = true;
}

function getKnowledgeSeries(network) {
  const preferredId = network?.presentation?.primaryTimeSeriesId;
  if (preferredId) {
    const preferred = (network?.timeSeries || []).find(series => series.id === preferredId);
    if (preferred) return preferred;
  }
  return (network?.timeSeries || [])[0] || null;
}

function getKnowledgeProjectionSeries(network, scenario = projectionScenario) {
  return (network?.projectionSeries || []).find(series => series.scenario === scenario)
    || (network?.projectionSeries || [])[0]
    || null;
}

function getValidTimeSeriesPoints(series) {
  return (series?.points || []).filter(point =>
    Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value))
  );
}

function hasRequiredObservationSeries(networkOrSeries) {
  const series = Array.isArray(networkOrSeries?.timeSeries)
    ? getKnowledgeSeries(networkOrSeries)
    : networkOrSeries;
  return getValidTimeSeriesPoints(series).length >= 2;
}

function getQualifiedProjectionSeries(network) {
  // BLC-Freigabe: Eine vollständige Kurve setzt eine Beobachtungsreihe voraus.
  // Historische Rekonstruktionen und Projektionen dürfen sie ergänzen, aber nie ersetzen.
  if (!hasRequiredObservationSeries(network)) return [];
  const qualifiedGrades = new Set(["robust_scenario_projection", "qualified_scenario_projection"]);
  return (network?.projectionSeries || []).filter(series => {
    const assessment = getProjectionAssessment(network, series);
    return qualifiedGrades.has(assessment?.grade) && (series.points || []).some(point =>
      Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value))
    );
  });
}

function positionTimeChartLabelNearPoint(label, pointX, pointY, plot, width, height) {
  if (!label || typeof label.getBBox !== "function") return;
  const candidates = [
    { x: pointX + 8, y: pointY - 11, anchor: "start" },
    { x: pointX - 8, y: pointY - 11, anchor: "end" },
    { x: pointX + 8, y: pointY - 25, anchor: "start" },
    { x: pointX - 8, y: pointY - 25, anchor: "end" },
    { x: pointX + 11, y: pointY, anchor: "start" },
    { x: pointX - 11, y: pointY, anchor: "end" }
  ];
  const curves = [...timeChart.querySelectorAll(".time-chart-historical, .time-chart-observed, .time-chart-projection")];

  const scoreCandidate = candidate => {
    label.setAttribute("x", candidate.x);
    label.setAttribute("y", candidate.y);
    label.setAttribute("text-anchor", candidate.anchor);
    const box = label.getBBox();
    const margin = 2;
    const outside = box.x < plot.left || box.x + box.width > width - plot.right || box.y < plot.top || box.y + box.height > height - plot.bottom;
    if (outside) return Number.POSITIVE_INFINITY;

    let intersections = 0;
    for (const curve of curves) {
      const length = curve.getTotalLength();
      const samples = Math.max(2, Math.ceil(length / 2));
      for (let index = 0; index <= samples; index += 1) {
        const point = curve.getPointAtLength(length * index / samples);
        if (
          point.x >= box.x - margin && point.x <= box.x + box.width + margin &&
          point.y >= box.y - margin && point.y <= box.y + box.height + margin
        ) intersections += 1;
      }
    }
    return intersections;
  };

  let best = candidates[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const score = scoreCandidate(candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
      if (score === 0) break;
    }
  }
  label.setAttribute("x", best.x);
  label.setAttribute("y", best.y);
  label.setAttribute("text-anchor", best.anchor);
}

function renderTimeChart(observedSeries = null, projectionSeries = []) {
  if (!timeChart) return;
  const timeCard = timeChart.closest(".time-card");
  const width = Math.max(320, Math.round(timeChart.clientWidth || 500));
  const height = 112;
  timeChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const plot = { left: 10, right: 10, top: 8, bottom: 27 };
  const xMin = 1700;
  const xMax = 2100;
  const observed = (observedSeries?.points || [])
    .filter(point => Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value)))
    .map(point => ({ ...point, year: Number(point.year), value: Number(point.value) }))
    .filter(point => point.year >= xMin && point.year <= xMax)
    .sort((a, b) => a.year - b.year);
  const projections = projectionSeries.map(series => ({
    ...series,
    points: (series.points || [])
      .filter(point => Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value)))
      .map(point => ({ ...point, year: Number(point.year), value: Number(point.value) }))
      .filter(point => point.year >= xMin && point.year <= xMax)
      .sort((a, b) => a.year - b.year)
  })).filter(series => series.points.length);
  const historicalSegments = (observedSeries?.historicalSegments || []).map(segment => ({
    ...segment,
    points: (segment.points || [])
      .filter(point => Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value)))
      .map(point => ({ ...point, year: Number(point.year), value: Number(point.value) }))
      .filter(point => point.year >= xMin && point.year <= xMax)
      .sort((a, b) => a.year - b.year)
  })).filter(segment => segment.points.length);

  if (observed.length < 2) {
    timeCard?.classList.add("no-time-series");
    timeChart.innerHTML = `<title id="timeChartTitle">Keine freigegebene Beobachtungsreihe</title><desc id="timeChartDescription">Eine vollständige BLC-Kurve wird nur mit mindestens zwei numerischen Beobachtungspunkten dargestellt. Historische Rekonstruktionen und Projektionen allein reichen nicht aus.</desc>`;
    return;
  }

  timeCard?.classList.remove("no-time-series");

  const allValues = [...observed, ...historicalSegments.flatMap(segment => segment.points), ...projections.flatMap(series => series.points)].map(point => point.value);
  const observedMin = Math.min(...observed.map(point => point.value));
  const observedMax = Math.max(...observed.map(point => point.value));
  const range = Math.max(observedMax - observedMin, Math.abs(observedMax) * .1, 1);
  const yMin = Math.min(observedMin, ...allValues);
  const yMax = Math.max(observedMax, ...allValues);
  const yRange = Math.max(yMax - yMin, 1);
  const x = year => plot.left + ((year - xMin) / (xMax - xMin)) * (width - plot.left - plot.right);
  const y = value => height - plot.bottom - ((value - yMin) / yRange) * (height - plot.top - plot.bottom);
  const makePath = points => points.map((point, index) => `${index ? "L" : "M"}${x(point.year).toFixed(2)} ${y(point.value).toFixed(2)}`).join(" ");
  const axisYears = [1700, 1800, 1900, 2000, 2100];
  const colors = ["#4c718b", "#6f657e", "#8b6a43", "#3f7c6d", "#9a5555"];
  const unit = observedSeries?.unit ? ` ${observedSeries.unit}` : "";
  const currentYear = Math.min(xMax, Math.max(xMin, new Date().getFullYear()));
  const extrema = [...observed, ...historicalSegments.flatMap(segment => segment.points), ...projections.flatMap(series => series.points)];
  const minPoint = extrema.reduce((lowest, point) => point.value < lowest.value ? point : lowest, extrema[0]);
  const maxPoint = extrema.reduce((highest, point) => point.value > highest.value ? point : highest, extrema[0]);
  const projectionMarkup = projections.map((series, index) => `<path class="time-chart-projection" style="--projection-color:${colors[index % colors.length]}" d="${makePath(series.points)}"/>`).join("");
  const historicalMarkup = historicalSegments.map(segment => `<path class="time-chart-historical" d="${makePath(segment.points)}"/>`).join("");
  const methodBreakMarkup = (observedSeries?.methodBreaks || [])
    .filter(marker => Number.isFinite(Number(marker.year)) && Number(marker.year) >= xMin && Number(marker.year) <= xMax)
    .map(marker => `<text class="time-chart-method-break" x="${x(Number(marker.year))}" y="${height - plot.bottom}" aria-hidden="true">◇</text>`)
    .join("");
  const observationMarkup = observed.map((point, index) => {
    const pointX = x(point.year);
    const before = index ? (x(observed[index - 1].year) + pointX) / 2 : Math.max(plot.left, pointX - 3);
    const after = index < observed.length - 1 ? (pointX + x(observed[index + 1].year)) / 2 : Math.min(width - plot.right, pointX + 3);
    const label = `Messwert ${point.year}: ${point.display || `${point.value}${unit}`}`;
    return `<rect class="time-chart-hit" data-time-chart-year="${point.year}" x="${before}" y="${plot.top}" width="${Math.max(1, after - before)}" height="${height - plot.top - plot.bottom}" tabindex="0" role="button" aria-label="${label}"/><circle class="time-chart-point${Number(selectedYear) === point.year ? " is-selected" : ""}" cx="${pointX}" cy="${y(point.value)}" r="3"/>`;
  }).join("");

  timeChart.innerHTML = `
    <title id="timeChartTitle">${observedSeries?.label || "Messreihe"} von 1700 bis 2100</title>
    <desc id="timeChartDescription">${historicalSegments.length ? "Gestrichelte Linie: historische Vorgängerrekonstruktion mit abweichender Methode. " : ""}Durchgezogene Linie: aktuelle Hauptreihe. ${methodBreakMarkup ? "Diamant auf der Zeitachse: Methodenwechsel. " : ""}${projections.length ? "Gepunktete Linien: wissenschaftlich qualifizierte Szenarien." : "Keine wissenschaftlich qualifizierte Projektion hinterlegt."}</desc>
    <defs><marker id="timeChartArrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 6 3 0 6Z" fill="#71807a"/></marker></defs>
    <line class="time-chart-axis" x1="${plot.left}" y1="${height - plot.bottom}" x2="${width - plot.right}" y2="${height - plot.bottom}" marker-end="url(#timeChartArrow)"/>
    <line class="time-chart-axis" x1="${plot.left}" y1="${height - plot.bottom}" x2="${plot.left}" y2="${plot.top}" marker-end="url(#timeChartArrow)"/>
    <text class="time-chart-value-label" x="${Math.min(width - plot.right, x(maxPoint.year) + 4)}" y="${Math.min(height - plot.bottom - 4, y(maxPoint.value) + 9)}">${maxPoint.value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}${unit}</text>
    <text class="time-chart-value-label" data-extrema-label="minimum" x="${x(minPoint.year)}" y="${y(minPoint.value)}">${minPoint.value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}${unit}</text>
    ${historicalMarkup}
    <path class="time-chart-observed" d="${makePath(observed)}"/>
    ${projectionMarkup}
    ${observationMarkup}
    <line class="time-chart-current-year" x1="${x(currentYear)}" y1="${plot.top}" x2="${x(currentYear)}" y2="${height - plot.bottom}"/>
    ${methodBreakMarkup}
    ${axisYears.map(year => `<text class="time-chart-axis-label${year === 1700 ? " time-chart-axis-label-start" : " time-chart-axis-label-end"}" x="${x(year)}" y="${height - 9}">${year}</text>`).join("")}
    <text class="time-chart-axis-label" x="${x(currentYear)}" y="${height - 9}">${currentYear}</text>`;
  positionTimeChartLabelNearPoint(
    timeChart.querySelector('[data-extrema-label="minimum"]'),
    x(minPoint.year),
    y(minPoint.value),
    plot,
    width,
    height
  );
  timeChart.querySelectorAll("[data-time-chart-year]").forEach(button => button.addEventListener("click", () => {
    timeWindow = "data";
    selectYear(Number(button.dataset.timeChartYear));
  }));
  timeChart.querySelectorAll("[data-time-chart-year]").forEach(button => button.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    timeWindow = "data";
    selectYear(Number(button.dataset.timeChartYear));
  }));
}

function syncProjectionScenarioOptions(network) {
  const series = network?.projectionSeries || [];
  if (!scenarioSelect || !series.length) return;

  const scenarios = series.filter((entry, index) =>
    entry?.scenario && series.findIndex(candidate => candidate.scenario === entry.scenario) === index
  );
  if (!scenarios.some(entry => entry.scenario === projectionScenario)) {
    projectionScenario = scenarios.find(entry => entry.scenario === "STEPS")?.scenario
      || scenarios[0]?.scenario
      || projectionScenario;
  }

  scenarioSelect.innerHTML = "";
  scenarios.forEach(entry => {
    const option = document.createElement("option");
    option.value = entry.scenario;
    option.textContent = entry.scenarioLabel || entry.scenario;
    scenarioSelect.appendChild(option);
  });
  scenarioSelect.value = projectionScenario;
}

function getProjectionAssessment(network, series) {
  return series?.assessment || network?.projectionAssessment || null;
}

function getActiveKnowledgeSeries(network) {
  return timeWindow === "projection"
    ? getKnowledgeProjectionSeries(network)
    : getKnowledgeSeries(network);
}

function getKnowledgeSeriesPoint(network, year) {
  const series = getActiveKnowledgeSeries(network);
  return (series?.points || []).find(point => Number(point.year) === Number(year)) || null;
}

function getKnowledgePointSource(network, point, series) {
  const ids = point?.sourceRefs || series?.sourceRefs || [];
  return (network?.sources || []).find(source => ids.includes(source.id)) || null;
}

function getSelectedFreshwaterRegion(network, activeItem = getCurrentItem()) {
  const region = (network?.regionalPilot?.regions || []).find(entry => entry.id === getSelectedScope());
  if (!region) return null;
  const seriesId = activeItem?.knowledgeTimeSeriesId || network?.presentation?.primaryTimeSeriesId;
  const component = (region.components || []).find(entry => entry.id === seriesId);
  return component ? { pilot: network.regionalPilot, region, component } : null;
}

function formatRegionalPercent(value) {
  return Number.isFinite(Number(value))
    ? `${Number(value).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
    : "–";
}

function setKnowledgePointDetails(network, activeBoundary, activeItem, point = null, noMeasurementYear = null) {
  updateContributionRole(activeBoundary, activeItem);
  const series = getActiveKnowledgeSeries(network);
  const presentation = network?.presentation || {};
  const firstPathway = (network?.pathways || [])[0];
  const regional = getSelectedFreshwaterRegion(network, activeItem);

  const frameworkLabel = activeBoundary?.framework === "eah_extension"
    ? (activeBoundary.frameworkLabel || "Ergänzender Einflussbereich").toUpperCase()
    : "PLANETARE GRENZE";
  if (focusType) focusType.textContent = `${frameworkLabel} · ${activeBoundary?.label || ""}`;
  const itemLabel = String(activeItem?.label || "").replace(/^↳\s*/, "");
  if (focusTitle) focusTitle.textContent = `${activeBoundary?.label || ""} · ${itemLabel}`;
  if (focusSummary) focusSummary.textContent =
    network?.entry?.effectFocus || network?.corePrinciples?.[0] || network?.topic || "Knowledge-Datensatz aus dem zentralen Index.";

  if (regional) {
    const { pilot, region, component } = regional;
    const source = (network?.sources || [])[0];
    const subject = component.variable === "dis"
      ? "ungewöhnlich hoher oder niedriger Abfluss"
      : "ungewöhnlich hohe oder niedrige Bodenfeuchte";
    metricLabel.textContent = "Ungewöhnlich veränderte Fläche";
    if (referenceLabel) referenceLabel.textContent = "Üblicher Vergleichsbereich";
    if (findingSummary) findingSummary.textContent = "Einordnung";
    metricValue.textContent = formatRegionalPercent(component.value);
    referenceValue.textContent = `Im Vergleichszeitraum üblich: bis ${formatRegionalPercent(component.referenceUpperEnd)}`;
    periodValue.textContent = pilot.period || "2010–2019";
    findingText.textContent = `Auf ${formatRegionalPercent(component.value)} des untersuchten ${region.label.replace(" · HydroBASINS L3", "s")} zeigte sich ${subject}. Im Vergleichszeitraum waren bis zu ${formatRegionalPercent(component.referenceUpperEnd)} üblich. Die Abweichungen waren damit ${component.value > component.referenceUpperEnd ? "räumlich weiter" : "räumlich weniger weit"} verbreitet als üblich.`;
    effectPath.textContent = presentation.effectPath || firstPathway?.label || "–";
    uncertaintyValue.textContent = `${pilot.referenceWarning || "Die regionale Referenz ist kein planetarer Grenzwert."} ${region.geographicLabelMethod || ""}`.trim();
    lifeNote.textContent = genericHealthReadout(network);
    if (source?.url) setLink(source.title || source.publisher || "Quelle", source.url);
    else setLink("–", null);
    renderHealth(null);
    updateCauseButtons(null, null);
    return;
  }

  if (referenceLabel) referenceLabel.textContent = "Referenz / Grenze";
  if (findingSummary) findingSummary.textContent = "Befund";

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
    metricLabel.textContent = timeWindow === "projection" ? "Szenariowert" : "Mess-/Zustandswert";
    metricValue.textContent = point.display || `${point.value ?? "–"} ${series.unit || ""}`.trim();
    referenceValue.textContent = series.reference?.display || presentation.referenceLabel || "–";
    periodValue.textContent = String(point.year);
    findingText.textContent = point.finding || series.finding || presentation.finding || "–";
    effectPath.textContent = presentation.effectPath || firstPathway?.label || "–";
    uncertaintyValue.textContent = point.uncertainty || series.uncertainty || presentation.uncertainty || "–";
    lifeNote.textContent = genericHealthReadout(network);
    if (source?.url) setLink(source.title || source.publisher || "Quelle", source.url);
    else setLink("–", null);
    // Globale Klimazustandswerte allein aktivieren bewusst keine Organmarker.
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

function appendTimeMarker(year, min, max, className = "", label = year) {
  const marker = document.createElement("span");
  marker.className = `time-marker ${className}`.trim();
  marker.textContent = String(label);
  marker.style.left = max === min ? "50%" : `${((year - min) / (max - min)) * 100}%`;
  timeMarkers.appendChild(marker);
}

function renderKnowledgeTime(network) {
  timeWindow = "data";
  syncProjectionScenarioOptions(network);
  const availableProjection = getKnowledgeProjectionSeries(network);
  if (timeWindow === "projection" && !availableProjection?.points?.length) timeWindow = "data";
  const series = getActiveKnowledgeSeries(network);
  const points = series?.points || [];
  const blc = data.timePresets.blc;
  const observationSeries = getKnowledgeSeries(network);
  const activeItem = getCurrentItem();
  const knowledgeSource = activeItem?.knowledgeSource || "unknown";
  const curveId = observationSeries?.id
    ? `knowledge:${knowledgeSource}#${observationSeries.id}`
    : `knowledge:${knowledgeSource}#missing`;
  setBlcReleaseControl({
    curveId,
    eligible: hasRequiredObservationSeries(observationSeries) && !getSelectedFreshwaterRegion(network),
    descriptor: observationSeries?.id ? {
      kind: "knowledge",
      source: knowledgeSource,
      seriesId: observationSeries.id,
      boundaryId: selectedBoundaryId || "unknown",
      itemId: selectedItemId || activeItem?.id || "unknown"
    } : null
  });

  dataWindowButton.classList.toggle("active", timeWindow === "data");
  projectionWindowButton.hidden = !hasRequiredObservationSeries(network)
    || !getQualifiedProjectionSeries(network).length;
  projectionWindowButton.classList.toggle("active", timeWindow === "projection");
  blcWindowButton.classList.toggle("active", timeWindow === "blc");
  scenarioControls.hidden = timeWindow !== "projection";
  scenarioSelect.value = projectionScenario;
  document.querySelector(".time-card")?.classList.toggle("projection-mode", timeWindow === "projection");
  metricLabel.textContent = timeWindow === "projection" ? "Szenariowert" : "Mess-/Zustandswert";
  timeMarkers.innerHTML = "";

  const regional = getSelectedFreshwaterRegion(network);
  dataWindowButton.disabled = Boolean(regional);
  blcWindowButton.disabled = Boolean(regional);
  projectionWindowButton.disabled = Boolean(regional);
  if (regional) {
    timeSlider.disabled = true;
    timeSlider.min = "0";
    timeSlider.max = "1";
    timeSlider.value = "0";
    timeReadout.textContent = regional.pilot.period || "2010–2019";
    timeStatus.textContent = `${regional.region.label} · Zehnjahresmittel eines modellierten Flusseinzugsgebiets; regionale Referenz, kein planetarer Grenzwert.`;
    renderTimeChart();
    return;
  }

  if (!series || !points.length) {
    timeSlider.disabled = true;
    timeSlider.min = "0";
    timeSlider.max = "1";
    timeSlider.value = "0";
    timeReadout.textContent = "–";
    timeStatus.textContent = "Für diese Knowledge-Datei ist noch keine Zeitreihe hinterlegt.";
    renderTimeChart();
    return;
  }

  let min, max;
  if (timeWindow === "projection") {
    min = Math.min(...points.map(point => Number(point.year)));
    max = Math.max(...points.map(point => Number(point.year)));
  } else if (timeWindow === "blc") {
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

  if (timeWindow === "blc") appendTimeMarker(blc.min, min, max, "time-boundary-marker");

  // Bei langen Jahresreihen nur ausgewählte Marker beschriften, damit die Anzeige lesbar bleibt.
  points.forEach((point, index) => {
    const year = Number(point.year);
    if (year < min || year > max) return;
    const showMarker = points.length <= 15 || index === 0 || index === points.length - 1 || year % 5 === 0;
    if (!showMarker) return;
    appendTimeMarker(year, min, max, timeWindow === "blc" ? "time-data-tick" : "", timeWindow === "blc" ? "" : year);
  });
  if (timeWindow === "blc") appendTimeMarker(blc.max, min, max, "time-boundary-marker");

  const exact = points.find(point => Number(point.year) === Number(selectedYear));
  if (exact && timeWindow === "projection") {
    const assessment = getProjectionAssessment(network, series);
    const assessmentText = assessment?.label ? ` · Bewertung: ${assessment.label}` : "";
    const projectionPointType = assessment?.status === "trend_extrapolation"
      ? "ein rechnerisch fortgeschriebener Stützpunkt"
      : "ein modellierter Stützpunkt";
    timeStatus.textContent = `${series.scenarioLabel || series.scenario || "Szenario"} · ${selectedYear} ist ${projectionPointType}, kein Messwert${assessmentText}.`;
  } else if (exact) {
    timeStatus.textContent = `${series.label || "Messreihe"} · ${selectedYear} ist als Messwert hinterlegt.`;
  } else if (timeWindow === "blc") {
    timeStatus.textContent = "BLC-Zeitfenster 1700–2100. Außerhalb der hinterlegten Messjahre werden keine Werte interpoliert oder projiziert.";
  } else {
    timeStatus.textContent = "Nur tatsächlich hinterlegte Messjahre werden angezeigt; keine Interpolation.";
  }
  renderTimeChart(getKnowledgeSeries(network), getQualifiedProjectionSeries(network));
}


function getKnowledgeStatusLabel(network) {
  const year = network?.presentation?.statusYear
    || network?.statusYear
    || network?.presentation?.assessmentYear
    || network?.assessmentYear;
  return year ? `Stand ${year}` : "Keine Zeitreihe";
}

function applyKnowledgeToStandardEffect(network, activeBoundary, activeItem) {
  setStandardEffectBlocksVisible(true);

  if (getSelectedFreshwaterRegion(network, activeItem)) {
    selectedYear = null;
    timeWindow = "data";
    renderKnowledgeTime(network);
    setKnowledgePointDetails(network, activeBoundary, activeItem);
    return;
  }

  const series = getActiveKnowledgeSeries(network);
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
  timeStatus.textContent = "Noch keine numerische Zeitreihe hinterlegt.";
  // Beim Wechsel darf kein Diagramm des zuvor ausgewählten Datensatzes stehen bleiben.
  renderTimeChart();
}

function renderKnowledgePanel() {
  const panel = ensureKnowledgePanel();
  const state = getActiveViewState();

  // Generischer Index-Pfad: funktioniert für Planetare Grenzen und Ergänzungen.
  const activeBoundary = getBoundary(state.boundaryId);
  const activeItem = activeBoundary?.items?.find(item => item.id === state.itemId);
  const usesSpecializedEnergyView = state.boundaryId === "materials-energy"
    && ["oil", "coal", "natural-gas", "wind", "solar"].includes(activeItem?.id);
  if (activeItem?.groupOnly && !activeItem.menuHeading) {
    syncBoundaryModeClass();
    setStandardFocusCardVisible(true);
    renderGroupOverview(activeBoundary, activeItem);
    return;
  }
  if (activeItem?.knowledgeSource && state.boundaryId !== "mental-load" && !usesSpecializedEnergyView) {
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
  const isWaterServiceHealthContext = state.boundaryId === "mental-load" && ["drinking-water-health", "india-unsafe-water-diarrhoea"].includes(state.componentId);
  setStandardEffectBlocksVisible(
    state.boundaryId !== "nutrients" &&
    state.boundaryId !== "novel" &&
    state.boundaryId !== "materials-energy" &&
    (state.boundaryId !== "mental-load" || isWaterServiceHealthContext)
  );

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
    if (focusType) focusType.textContent = "ERGÄNZENDER EINFLUSSBEREICH · STOFF- UND ENERGIESTRÖME";
    const activeEnergyNetwork = activeItem?.knowledgeSource
      ? getKnowledgeNetworkBySource(activeItem.knowledgeSource)
      : null;
    if (activeEnergyNetwork?.timeSeries?.length) {
      applyKnowledgeToStandardEffect(activeEnergyNetwork, activeBoundary, activeItem);
    } else {
      renderHealth(null);
    }

    if (state.componentId === "oil") {
      if (focusTitle) focusTitle.textContent = "Energie · Erdöl";
      if (focusSummary) focusSummary.textContent = "Messbarer globaler Stoff- und Energiestrom mit Verbindungen zu mehreren Planetaren Grenzen.";
      panel.innerHTML = renderOilEnergyMainView();
    } else if (state.componentId === "coal") {
      if (focusTitle) focusTitle.textContent = "Energie · Kohle";
      if (focusSummary) focusSummary.textContent = "Globaler Kohlefluss mit Verbindungen zu Klimawandel, Aerosolen, Süßwasser und Landnutzungsänderung.";
      panel.innerHTML = renderCoalEnergyMainView();
    } else if (state.componentId === "natural-gas") {
      if (focusTitle) focusTitle.textContent = "Energie · Erdgas";
      if (focusSummary) focusSummary.textContent = "Globaler Erdgasfluss mit getrennten Pfaden für CO₂, Methan sowie Förder-, Wasser- und Flächenwirkungen.";
      panel.innerHTML = renderNaturalGasEnergyMainView();
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
      if (focusSummary) focusSummary.textContent = "Energieflüsse werden als messbare Durchsätze erfasst. Wähle Erdöl, Kohle, Erdgas, Wind oder Solar.";
      panel.innerHTML = `
        <div class="extension-intro">
          <div class="eyebrow">STOFF- UND ENERGIESTRÖME</div>
          <h2>Energie</h2>
          <p>Energie ist der erste Teilbereich dieser ergänzenden Systemgrenze.</p>
          <div class="extension-note">
            Reale Piloten sind bereits für <strong>Erdöl</strong>, <strong>Kohle</strong>, <strong>Erdgas</strong>, <strong>Wind</strong> und <strong>Solar</strong> hinterlegt.
          </div>
        </div>`;
    }

    panel.hidden = false;
    return;
  }

  if (state.boundaryId === "mental-load") {
    if (focusType) focusType.textContent = "ERGÄNZENDER EINFLUSSBEREICH · TECHNOLOGISCHE & SOZIALE UMWELT";
    renderHealth(null);

    const indexEntry = getKnowledgeIndexEntry(state.boundaryId, state.componentId);

    if (isWaterServiceHealthContext) {
      const isIndiaContext = state.componentId === "india-unsafe-water-diarrhoea";
      if (focusTitle) focusTitle.textContent = isIndiaContext
        ? "Indien · Durchfallerkrankungen bei Kindern"
        : "Wasser- & Sanitärversorgung · Trinkwasserzugang";
      if (focusSummary) focusSummary.textContent = isIndiaContext
        ? "Nationaler Gesundheitskontext: modellierte Krankheitslast in Indien; nicht auf andere Orte übertragbar."
        : "Zugang zu sicher gemanagtem Trinkwasser ist eine soziale und technische Versorgungsbedingung mit direktem Gesundheitsbezug.";
      setDetails(activeItem);
      renderTime(activeItem);
      panel.innerHTML = `
        <div class="extension-intro">
          <div class="eyebrow">EINORDNUNG</div>
          <h2>${isIndiaContext ? "Indien · Gesundheitskontext" : "Trinkwasserzugang & Gesundheit"}</h2>
          <p>${isIndiaContext ? "Die angegebene Krankheitslast ist eine modellierte nationale GBD-Schätzung für Kinder unter fünf Jahren, keine lokale Messung." : "Der Wert beschreibt fehlenden Zugang zu sicher gemanagtem Trinkwasser. Er ist keine Kontrollvariable einer planetaren Grenze."}</p>
        </div>`;
    } else if (indexEntry?.type === "item") {
      const network = getKnowledgeNetworkBySource(indexEntry.item.source);
      if (focusTitle) focusTitle.textContent = `${indexEntry.group.label} · ${indexEntry.item.label}`;
      if (focusSummary) focusSummary.textContent = network?.corePrinciples?.[0] || network?.topic || "Konkreter menschengemachter Umwelt- und Wirkungspfad.";
      panel.innerHTML = renderGenericKnowledgeView(network, indexEntry);
      if (organReadout) organReadout.textContent = genericHealthReadout(network);
    } else {
      const groups = (getKnowledgeIndex()?.systemBoundaries?.find(item => item.id === "eah_tech_social_environment")?.groups || []).map(group =>
        `<p><strong>${group.label}</strong><br>${(group.items || []).map(item => item.label).join(" · ")}</p>`
      ).join("");

      if (focusTitle) focusTitle.textContent = "Technologische & soziale Umwelt";
      if (focusSummary) focusSummary.textContent = "Menschengemachte technische, digitale, informationelle und soziale Veränderungen werden über konkrete Umwelt- und Wirkungspfade erschlossen.";
      panel.innerHTML = `
        <div class="extension-intro">
          <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH</div>
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
function getSelectedAgeGroup() { return selectedAgeGroup; }

function ageGroupLabel(group = selectedAgeGroup) {
  return ({ children: "Kinder · 0–17 Jahre", adults: "Erwachsene · 18–64 Jahre", older: "Ältere Menschen · ab 65 Jahren" })[group] || group;
}

function rangeOverlapsAgeGroup(range, group = selectedAgeGroup) {
  if (!range || (!Number.isFinite(Number(range.min)) && !Number.isFinite(Number(range.max)))) return false;
  const min = Number.isFinite(Number(range.min)) ? Number(range.min) : 0;
  const max = Number.isFinite(Number(range.max)) ? Number(range.max) : 130;
  const bounds = { children: [0, 17.999], adults: [18, 64.999], older: [65, 130] }[group];
  return bounds ? max >= bounds[0] && min <= bounds[1] : false;
}

function getAgeEffect(entity, group = selectedAgeGroup) {
  return entity?.ageEffects?.[group] || entity?.ageEffectByGroup?.[group] || null;
}

function hasAnyHigherAgeEffect(entity) {
  const effects = entity?.ageEffects || entity?.ageEffectByGroup || {};
  return Object.values(effects).some(effect => effect?.status === "higher_effect");
}

function appliesToSelectedAgeGroup(entity) {
  return !Array.isArray(entity?.ageGroups) || !entity.ageGroups.length || entity.ageGroups.includes(selectedAgeGroup);
}

function getActiveAgeEvidence(network = getActiveKnowledgeContext()?.network) {
  const explicit = network?.ageEvidence?.[selectedAgeGroup] || network?.populationEvidence?.ageGroups?.[selectedAgeGroup];
  if (explicit) return explicit;
  const ranges = (network?.measurements || []).map(item => item?.context?.ageRange).filter(range => rangeOverlapsAgeGroup(range));
  if (ranges.length) {
    const labels = ranges.map(range => `${String(range.min).replace(".", ",")}–${String(range.max).replace(".", ",")} Jahre`);
    return { status: "group_included", detail: `Feinere Altersangabe der Studie: ${[...new Set(labels)].join(" · ")}.` };
  }
  return null;
}

function updateAgeGroupDisplay() {
  ageGroupButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.ageGroup === selectedAgeGroup)));
  const activeNetwork = getActiveKnowledgeContext()?.network;
  const activeMarkerSignals = activeNetwork?.healthContext?.markerSignals || [];
  const markerExcludedByAge = activeMarkerSignals.length > 0
    && !activeMarkerSignals.some(signal => appliesToSelectedAgeGroup(signal));
  const evidence = getActiveAgeEvidence();
  const defaultText = selectedAgeGroup === "adults"
    ? "Standardansicht · 18–64 Jahre"
    : `${ageGroupLabel()} · altersbezogene Verstärkung nur bei Beleg`;
  if (ageGroupStatus) ageGroupStatus.textContent = markerExcludedByAge
    ? `${ageGroupLabel()} · kein Organmarker aus dieser Studie`
    : evidence?.status === "higher_effect"
      ? `${ageGroupLabel()} · stärkerer Effekt belegt`
      : evidence?.status === "no_difference"
        ? `${ageGroupLabel()} · untersucht, kein Unterschied nachgewiesen`
        : evidence?.status === "group_included"
          ? `${ageGroupLabel()} · Gruppe enthalten`
          : defaultText;
  if (ageEffectDetail) {
    const markerAgeHint = markerExcludedByAge
      ? `Der Organmarker dieses Befunds gilt nur für ${[...new Set(activeMarkerSignals.flatMap(signal => signal.ageGroups || []))].map(ageGroupLabel).join(" und ")}.`
      : "";
    ageEffectDetail.hidden = !(markerAgeHint || evidence?.detail);
    ageEffectDetail.textContent = markerAgeHint || evidence?.detail || "";
  }
}

function getBoundary(id) { return data.boundaries.find(boundary => boundary.id === id); }
function getCurrentItem() { const boundary = getBoundary(selectedBoundaryId); return boundary?.items?.find(item => item.id === selectedItemId) || null; }
function getVisibleItems(boundary) {
  if (!boundary?.items) return [];
  return boundary.items.filter(item =>
    item.archived !== true && (item.scope === "all" || item.scope === getSelectedScope())
  );
}

function menuHierarchyLevel(item, items) {
  if (!item || item.menuHeading || item.groupOnly) return 0;
  const itemById = new Map();
  items.forEach(candidate => {
    itemById.set(String(candidate.id || ""), candidate);
    itemById.set(normalizeKnowledgeId(candidate.id), candidate);
  });
  let level = 0;
  let parentId = item.parentId || item.depthOf || null;
  const visited = new Set([String(item.id || "")]);

  while (parentId && !visited.has(String(parentId))) {
    level += 1;
    visited.add(String(parentId));
    const parent = itemById.get(String(parentId)) || itemById.get(normalizeKnowledgeId(parentId));
    parentId = parent?.parentId || parent?.depthOf || null;
  }

  // Ältere bzw. gruppierte Einträge tragen keine Parent-ID, markieren ihre
  // untergeordnete Rolle aber mit dem vorhandenen Pfeil oder Typ.
  if (!level && (item.menuType === "study" || /^\s*↳/.test(String(item.label || "")))) level = 1;
  return level;
}
function getTimePoints(item) { return item?.timePoints ? [...item.timePoints].sort((a,b)=>a.year-b.year) : []; }
function renderRegionPath() {
  const selectedScope = getSelectedScope();
  const scope = data.scopes[selectedScope];
  regionPath.textContent = scope?.path || scope?.label || "";
  regionPath.hidden = selectedScope === "global";
}


function isEahExtension(boundary) {
  return boundary?.framework === "eah_extension";
}

function renderExtensionView(boundary) {
  setStandardEffectBlocksVisible(false);

  if (focusType) focusType.textContent = "EAH-MIRROR · ERGÄNZENDER EINFLUSSBEREICH";
  if (focusTitle) focusTitle.textContent = boundary.label;
  if (focusSummary) focusSummary.textContent = boundary.summary || "";

  renderHealth(null);

  const panel = ensureKnowledgePanel();
  panel.innerHTML = `
    <div class="extension-intro">
      <div class="eyebrow">ERGÄNZENDER EINFLUSSBEREICH</div>
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
      divider.innerHTML = `
        <div class="boundary-info-title-row">
          <span>Ergänzende Einflussbereiche</span>
          <button class="inline-info-button boundary-context-info-button" type="button"
            aria-label="Information zum Unterschied zwischen Planetaren Grenzen und ergänzenden Einflussbereichen"
            aria-expanded="false" aria-controls="extensionBoundaryInfo">i</button>
        </div>
        <div id="extensionBoundaryInfo" class="boundary-context-info" role="note" hidden>
          <strong>Zwei unterschiedliche Perspektiven</strong>
          <p><strong>Planetare Grenzen</strong> zeigen den Zustand des Erdsystems sowie relevante Belastungen, Freisetzungen und Wirkungen.</p>
          <p><strong>Ergänzende Einflussbereiche</strong> erweitern den Blick um menschengemachte Stoffströme, Technologien und soziale Lebensbedingungen.</p>
          <p>Sie sind keine wissenschaftlich festgelegten Grenzen. Relevant werden sie durch belegte Wirkungen auf Lebensgrundlagen, Planetare Grenzen oder die menschliche Gesundheit.</p>
          <p>Ein Stoffstrom wird nur einmal erfasst und über Wirkungspfade mit den betroffenen Planetaren Grenzen verbunden.</p>
          <p class="boundary-info-example">Beispiel: Kunststoffproduktion → Stoff- und Energieströme · Mikroplastik/Freisetzung → Neue Substanzen</p>
        </div>`;
      const dividerInfoButton = divider.querySelector(".boundary-context-info-button");
      const dividerInfo = divider.querySelector(".boundary-context-info");
      dividerInfoButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleBoundaryContextInfo(dividerInfoButton, dividerInfo);
      });
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
      button.title = "Ergänzender Einflussbereich";
    }
    if (!boundary.enabled) button.classList.add("disabled");
    if (boundary.id === selectedBoundaryId) button.classList.add("active");
    button.innerHTML = `<span>${boundary.label}</span><span>${boundary.enabled ? "›" : ""}</span>`;
    if (boundary.enabled) button.addEventListener("click", () => {
      if (boundary.id === selectedBoundaryId && expandedBoundaryId === boundary.id) {
        expandedBoundaryId = null;
        renderBoundaries();
        return;
      }
      expandedBoundaryId = boundary.id;
      selectBoundary(boundary.id);
    });
    else button.disabled = true;
    row.appendChild(button);
    if (boundary.id === "mental-load") {
      row.classList.add("has-boundary-info");
      const infoButton = document.createElement("button");
      infoButton.type = "button";
      infoButton.className = "inline-info-button boundary-row-info-button boundary-context-info-button";
      infoButton.textContent = "i";
      infoButton.setAttribute("aria-label", "Information zur Technologischen und sozialen Umwelt");
      infoButton.setAttribute("aria-expanded", "false");
      infoButton.setAttribute("aria-controls", "techSocialBoundaryInfo");
      const info = document.createElement("div");
      info.id = "techSocialBoundaryInfo";
      info.className = "boundary-context-info boundary-row-context-info";
      info.setAttribute("role", "note");
      info.hidden = true;
      info.innerHTML = `
        <strong>Technologische & soziale Umwelt</strong>
        <p>Hier werden menschengemachte Lebensbedingungen und Expositionen erfasst – etwa digitale Nutzung, Arbeitsbedingungen oder soziale Strukturen.</p>
        <p>Der Bereich ist keine Planetare Grenze und kein reiner Stoffstrom. Gesundheitsbezüge entstehen erst über konkrete Expositions- und Wirkungspfade.</p>`;
      infoButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleBoundaryContextInfo(infoButton, info);
      });
      row.appendChild(infoButton);
      row.appendChild(info);
    }
    if (boundary.id === expandedBoundaryId) {
      const items = getVisibleItems(boundary);
      if (items.length) {
        const submenu = document.createElement("div");
        submenu.className = "submenu open";
        items.forEach(item => {
          const itemButton = document.createElement("button");
          itemButton.type = "button";
          const hierarchyLevel = menuHierarchyLevel(item, items);
          const isSubmenuItem = hierarchyLevel > 0;
          itemButton.textContent = isSubmenuItem
            ? String(item.label || "").replace(/^↳\s*/, "")
            : item.label;
          itemButton.style.setProperty("--menu-hierarchy-indent", `${hierarchyLevel * 14}px`);
          itemButton.dataset.menuLevel = String(hierarchyLevel);
          if (isSubmenuItem) {
            const submenuArrow = document.createElement("span");
            submenuArrow.className = "submenu-arrow";
            submenuArrow.setAttribute("aria-hidden", "true");
            itemButton.prepend(submenuArrow);
          }
          if (item.menuHeading) {
            itemButton.classList.add("submenu-heading");
            itemButton.disabled = true;
            itemButton.setAttribute("aria-label", `${item.label}, Menügruppe`);
          } else {
            if (item.id === selectedItemId) itemButton.classList.add("active");
            const contributionRole = contributionRoleFor(boundary, item);
            const role = CONTRIBUTION_ROLES[contributionRole];
            if (role && !item.groupOnly) {
              const roleIcon = contributionRoleIcon(contributionRole);
              itemButton.insertBefore(roleIcon, itemButton.querySelector(".submenu-arrow")?.nextSibling || itemButton.firstChild);
              itemButton.setAttribute("aria-label", `${role.menu}: ${itemButton.textContent.trim()}`);
            }
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

function positionBoundaryContextInfo(button, note) {
  if (window.matchMedia("(max-width: 820px)").matches) return;
  const panel = document.querySelector(".panel-left");
  const shell = document.querySelector(".app-shell");
  if (!panel || !shell) return;
  const buttonRect = button.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const shellRect = shell.getBoundingClientRect();
  const left = panelRect.left + 12;
  const availableWidth = shellRect.right - left - 12;
  const width = Math.min(Math.max(panelRect.width * 1.45, 380), availableWidth);
  note.style.left = `${left}px`;
  note.style.top = `${buttonRect.bottom + 7}px`;
  note.style.width = `${width}px`;
  note.style.maxHeight = `${Math.max(180, window.innerHeight - buttonRect.bottom - 24)}px`;
}

function toggleBoundaryContextInfo(button, note) {
  const willOpen = note.hidden;
  closeBoundaryContextInfos();
  if (!willOpen) return;
  note.hidden = false;
  button.setAttribute("aria-expanded", "true");
  positionBoundaryContextInfo(button, note);
}

function closeBoundaryContextInfos() {
  document.querySelectorAll(".boundary-context-info").forEach(note => {
    note.hidden = true;
    note.removeAttribute("style");
  });
  document.querySelectorAll(".boundary-context-info-button").forEach(button => button.setAttribute("aria-expanded", "false"));
}

function mergeItemAndPoint(item, point) { return point ? { ...item, ...point, health: point.health || item.health } : item; }
function setLink(label, url) { sourceLink.textContent = label || "–"; if (url) { sourceLink.href = url; sourceLink.target = "_blank"; } else { sourceLink.removeAttribute("href"); sourceLink.removeAttribute("target"); } }

function renderWaterServiceEffectPaths(item) {
  if (!["drinking-water-health", "india-unsafe-water-diarrhoea"].includes(item?.id)) return false;

  effectPath.innerHTML = `
    <span class="effect-path-row">
      <span class="effect-path-kind">Umwelt / Versorgung</span>
      <span class="effect-path-flow">
        <button type="button" class="effect-path-link" data-life-route-boundary="freshwater">Süßwasser ↗</button>
        <span aria-hidden="true">→</span><span>Verfügbarkeit / Qualität</span>
        <span aria-hidden="true">→</span><span>Trinkwasserversorgung</span>
      </span>
    </span>
    <span class="effect-path-row">
      <span class="effect-path-kind">Gesundheit</span>
      <span class="effect-path-flow">
        <span>Unsicheres Trinkwasser</span><span aria-hidden="true">→</span>
        <span>fäkal-orale Erregerexposition</span><span aria-hidden="true">→</span>
        <span>Durchfallerkrankungen</span><span aria-hidden="true">→</span>
        <button type="button" class="effect-path-link" data-organ-route="gut">Verdauungssystem ↗</button>
      </span>
    </span>`;
  return true;
}

function setEffectPath(item, text) {
  if (!renderWaterServiceEffectPaths(item)) effectPath.textContent = text || "–";
}


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
    updateContributionRole();
    metricValue.textContent = referenceValue.textContent = periodValue.textContent = uncertaintyValue.textContent = "–";
    findingText.textContent = effectPath.textContent = "–";
    lifeNote.textContent = "Gesundheitswirkungen werden erst hervorgehoben, wenn ein belastbarer Wirkungspfad von der Umweltveränderung über eine konkrete Exposition bis zum Menschen belegt ist.";
    setLink("–", null);
    return;
  }
  updateContributionRole(getBoundary(selectedBoundaryId), item);
  if (noMeasurementYear !== null) {
    metricValue.textContent = "kein Messpunkt";
    referenceValue.textContent = item.reference || "–";
    periodValue.textContent = String(noMeasurementYear);
    findingText.textContent = `Für ${noMeasurementYear} ist in dieser Messreihe kein Messpunkt hinterlegt. Es wird nichts interpoliert.`;
    setEffectPath(item, item.effect);
    uncertaintyValue.textContent = "Keine Zwischenwerte werden erfunden. Wähle einen markierten Messzeitpunkt oder wechsle zurück in den Datenbereich.";
    lifeNote.textContent = item.lifeNote || "–";
    setLink(item.sourceLabel, item.sourceUrl);
    return;
  }
  const view = mergeItemAndPoint(item, point);
  metricValue.textContent = view.display || view.value || "–";
  referenceValue.textContent = view.reference || "–";
  periodValue.textContent = point && item.timePointPeriod ? `${point.year} · ${item.timePointPeriod}` : (view.period || "–");
  uncertaintyValue.textContent = view.uncertainty || "–";
  findingText.textContent = point?.finding || (point && item.timeSeriesFinding) || view.finding || "–";
  setEffectPath(item, view.effect);
  lifeNote.textContent = view.lifeNote || "–";
  setLink(view.sourceLabel, view.sourceUrl);
}

function renderTime(item) {
  const points = getTimePoints(item);
  setBlcReleaseControl({
    curveId: item?.id ? `legacy:data.js#${selectedBoundaryId || "unknown"}/${item.id}` : "",
    eligible: points.filter(point => Number.isFinite(Number(point.year)) && Number.isFinite(Number(point.value))).length >= 2,
    descriptor: item?.id ? {
      kind: "legacy",
      source: "data.js",
      seriesId: item.id,
      boundaryId: selectedBoundaryId || "unknown",
      itemId: item.id
    } : null
  });
  const blc = data.timePresets.blc;
  dataWindowButton.classList.toggle("active", timeWindow === "data");
  projectionWindowButton.hidden = true;
  projectionWindowButton.classList.remove("active");
  blcWindowButton.classList.toggle("active", timeWindow === "blc");
  scenarioControls.hidden = true;
  document.querySelector(".time-card")?.classList.remove("projection-mode");
  metricLabel.textContent = item?.metricLabel || "Mess-/Zustandswert";
  timeMarkers.innerHTML = "";
  if (!item || !points.length) {
    timeSlider.disabled = true; timeSlider.min = "0"; timeSlider.max = "1"; timeSlider.value = "0";
    timeReadout.textContent = item?.period || "–"; timeStatus.textContent = "Für diese Messreihe ist noch keine punktweise Zeitnavigation hinterlegt."; renderTimeChart(); return;
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
  if (timeWindow === "blc") appendTimeMarker(blc.min, min, max, "time-boundary-marker");
  points.filter(point => point.year >= min && point.year <= max).forEach(point => {
    appendTimeMarker(point.year, min, max, timeWindow === "blc" ? "time-data-tick" : "", timeWindow === "blc" ? "" : point.year);
  });
  if (timeWindow === "blc") appendTimeMarker(blc.max, min, max, "time-boundary-marker");
  const exact = points.find(point => point.year === selectedYear);
  if (exact) timeStatus.textContent = `${exact.label || "Messpunkt"}. Markierte Jahre sind tatsächlich hinterlegte Messzeitpunkte.`;
  else if (timeWindow === "blc") timeStatus.textContent = "BLC-Zeitfenster 1700–2100. Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
  else timeStatus.textContent = "Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
  renderTimeChart({ points, unit: item?.chartUnit || "" }, []);
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
        note: "Kein belastbarer 0–100-%-Krankheitslastwert. Der vorhandene Immunsystem-Marker bleibt ohne geprüften, importierten Organpfad neutral."
      }
    ]
  };
}

function normalizeImpactOrgan(id) {
  return resolveOrganId(id) || id;
}
function getImpactForOrgan(organId) { const impacts = currentHealth?.impacts || []; return impacts.find(impact => normalizeImpactOrgan(impact.organ) === organId) || null; }

function ensureHealthLegend() {
  if (healthLegend?.isConnected) return healthLegend;
  const bodymapPanel = document.querySelector(".bodymap-panel");
  const bodymapStage = bodymapPanel?.querySelector(".bodymap-stage");
  const locationControl = document.querySelector(".location-control");
  const readout = document.getElementById("organReadout")?.closest(".organ-readout");
  if (!bodymapPanel || !bodymapStage || !readout) return null;

  const markerOverlay = document.createElement("div");
  markerOverlay.className = "marker-overlay-control";
  markerOverlay.innerHTML = `
    <button class="health-marker-switch" type="button" role="switch" aria-checked="true" aria-label="Marker-Füllungen und Außenringe"><span aria-hidden="true"></span><b>Marker an</b></button>
    <button class="marker-overlay-info" type="button" aria-label="Information zum Marker-Schalter" aria-expanded="false">i</button>
    <button class="bodymap-legend-button" type="button" aria-expanded="false">Legende</button>
    <div class="marker-overlay-note" role="note" hidden>„Aus“ neutralisiert Füllungen und Außenringe. Sobald PG, Organ, Region oder Altersgruppe geändert werden, sind die Marker wieder aktiv.</div>`;
  bodymapStage.appendChild(markerOverlay);
  healthMarkerSwitch = markerOverlay.querySelector(".health-marker-switch");
  const bodymapLegendButton = markerOverlay.querySelector(".bodymap-legend-button");
  const markerInfoButton = markerOverlay.querySelector(".marker-overlay-info");
  const markerInfoNote = markerOverlay.querySelector(".marker-overlay-note");
  healthMarkerSwitch.addEventListener("click", () => setHealthMarkersEnabled(!healthMarkersEnabled));
  markerInfoButton.addEventListener("click", event => {
    event.stopPropagation();
    markerInfoNote.hidden = !markerInfoNote.hidden;
    markerInfoButton.setAttribute("aria-expanded", String(!markerInfoNote.hidden));
  });

  healthLegend = document.createElement("div");
  healthLegend.className = "health-legend";
  healthLegend.setAttribute("aria-label", "Legende der Organgesundheit");
  healthLegend.innerHTML = `
    <div class="health-marker-controls" aria-label="Organmarkierungen filtern">
      <div class="health-marker-filters">
        <label>PG-Bezug
          <select class="health-boundary-filter"><option value="current">Aktuelle PG</option><option value="all">Alle PGs</option></select>
        </label>
        <label>Organ
          <select class="health-organ-filter"><option value="all">Alle Organe</option>${Object.entries(HOTSPOTS).map(([id, organ]) => `<option value="${id}">${organ.label}</option>`).join("")}</select>
        </label>
      </div>
    </div>
    <div class="health-legend-title-row">
      <div class="health-legend-title">Organgesundheit · Marker</div>
      <button class="inline-info-button health-legend-info-button" type="button" aria-label="Information zur Gesamtübersicht und Bedeutung der Organmarker" aria-expanded="false">i</button>
    </div>
    <p class="health-legend-summary"><strong>Gesamtübersicht:</strong> Alle im Panel geprüften Organbezüge werden gleichzeitig angezeigt.</p>
    <div class="health-legend-method inline-info-note" hidden>
      <strong>Gesamtübersicht und aktuelle Auswahl</strong>
      <p>Die Bodymap bündelt alle im Panel hinterlegten und geprüften Umwelt- und Expositionsbezüge. Die dauerhaft sichtbaren Markierungen gehören deshalb nicht nur zur aktuell ausgewählten Grundlage. Ein Organ kann angeklickt werden, um seine einzelnen Einflussfaktoren, Wirkungspfade und Quellen zu erkunden; das linke Menü erschließt dieselben Zusammenhänge vom Ausgangspunkt aus.</p>
      <div class="health-legend-row">
        <span class="health-scale" aria-hidden="true">
          <span style="--legend-shade:#f2f2f2"></span><span style="--legend-shade:#bdbdbd"></span><span style="--legend-shade:#777"></span><span style="--legend-shade:#111"></span>
        </span>
        <span><strong>Graustufe der Markerfüllung:</strong> Hell bis dunkel steht für einen niedrigen bis höheren Statuswert. Eine Graustufe wird erst gesetzt, wenn zurechenbare Krankheitslast auf eine gemeinsame organspezifische Bezugsgröße normiert ist.</span>
      </div>
      <div class="health-legend-row">
        <span class="legend-foundation-link" aria-hidden="true"></span>
        <span><strong>Außenring:</strong> Mindestens ein geprüfter Organbezug durch Gewebenachweis oder Gesundheitsstudie ist irgendwo im Panel hinterlegt. Der Außenring ist unabhängig von der Markerfüllung.</span>
      </div>
      <div class="health-legend-row health-legend-secondary">
        <span><strong>Markerziel:</strong> Ein Marker kann ein einzelnes Organ, eine Organgruppe oder ein Organsystem repräsentieren. Alle Bezeichnungen und Synonyme führen auf dieselbe stabile Organ-ID; Links aus GRUNDLAGE und WIRKUNG bleiben getrennte Beiträge im Organfenster.</span>
      </div>
      <div class="health-legend-row">
        <span class="legend-age-elevated" aria-hidden="true"></span>
        <span><strong>Stärkerer Außenring:</strong> Für mindestens eine Altersgruppe ist irgendwo im Panel ein Mehr-Effekt belegt. Der Altersschalter zeigt, für welche Gruppe die Aussage gilt.</span>
      </div>
      <div class="health-legend-row health-legend-secondary">
        <span class="legend-hatched" aria-hidden="true"></span>
        <span><strong>Schraffur der Markerfüllung:</strong> Gesundheitlicher Befund belegt, aber keine belastbare Quantifizierung der zurechenbaren Krankheitslast vorhanden.</span>
      </div>
      <div class="health-legend-row health-legend-secondary">
        <span class="exposure-influence-scale legend-example" aria-hidden="true"><i class="filled"></i><i class="filled"></i><i></i></span>
        <span><strong>Segmente unter dem Marker:</strong> geringer, mittlerer oder hoher eigener Einfluss auf die Exposition. Sie werden unter allen sichtbaren Organmarkern angezeigt.</span>
      </div>
      <div class="health-legend-row health-legend-secondary">
        <span class="exposure-influence-scale legend-example is-unassessed" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><strong>Drei leere Segmente:</strong> Einfluss auf die eigene Exposition noch nicht bewertet.</span>
      </div>
      <p><strong>Markerfüllung</strong> ist der Oberbegriff für neutral, schraffiert oder grau abgestuft. Markerfüllung und Außenring sind unabhängige Signale. Ein Ring kann auch einen Gewebenachweis oder eine klinische Assoziation kennzeichnen und beweist nicht automatisch einen ursächlichen Organschaden.</p>
    </div>`;
  const infoButton = healthLegend.querySelector(".health-legend-info-button");
  const infoNote = healthLegend.querySelector(".health-legend-method");
  const boundaryFilter = healthLegend.querySelector(".health-boundary-filter");
  const organFilter = healthLegend.querySelector(".health-organ-filter");
  // Browser können Formularwerte beim Neuladen wiederherstellen. Die Filter-
  // anzeige muss dennoch immer denselben Zustand wie die Renderlogik zeigen.
  if (boundaryFilter) boundaryFilter.value = healthBoundaryFilter;
  if (organFilter) organFilter.value = healthOrganFilter;
  boundaryFilter?.addEventListener("change", () => {
    setHealthMarkersEnabled(true);
    healthBoundaryFilter = boundaryFilter.value;
    renderHealth(currentHealth);
  });
  organFilter?.addEventListener("change", () => {
    setHealthMarkersEnabled(true);
    healthOrganFilter = organFilter.value;
    renderHealth(currentHealth);
  });
  infoNote.id = "bodymapMarkerLegend";
  infoNote.classList.add("bodymap-legend-popup");
  bodymapStage.appendChild(infoNote);
  const toggleBodymapLegend = () => {
    infoNote.hidden = !infoNote.hidden;
    infoButton.setAttribute("aria-expanded", String(!infoNote.hidden));
    bodymapLegendButton?.setAttribute("aria-expanded", String(!infoNote.hidden));
  };
  infoButton?.setAttribute("aria-controls", infoNote.id);
  bodymapLegendButton?.setAttribute("aria-controls", infoNote.id);
  infoButton?.addEventListener("click", toggleBodymapLegend);
  bodymapLegendButton?.addEventListener("click", event => {
    event.stopPropagation();
    toggleBodymapLegend();
  });
  const filterPanel = document.createElement("div");
  filterPanel.className = "life-filter-panel";
  bodymapStage.insertAdjacentElement("afterend", filterPanel);
  filterPanel.appendChild(healthLegend.querySelector(".health-marker-controls"));
  if (locationControl) {
    filterPanel.appendChild(locationControl);
    const ageControl = locationControl.querySelector(".age-group-control");
    if (ageControl) filterPanel.appendChild(ageControl);
  }
  bodymapPanel.insertBefore(healthLegend, readout);
  return healthLegend;
}

function setHealthMarkersEnabled(enabled, { resetFilters = false } = {}) {
  healthMarkersEnabled = enabled;
  healthMarkerSwitch?.setAttribute("aria-checked", String(enabled));
  const switchLabel = healthMarkerSwitch?.querySelector("b");
  if (switchLabel) switchLabel.textContent = enabled ? "Marker an" : "Marker aus";
  hotspotLayer.classList.toggle("markers-disabled", !enabled);
  if (enabled && resetFilters) {
    healthBoundaryFilter = "all";
    healthOrganFilter = "all";
    const boundaryFilter = document.querySelector(".health-boundary-filter");
    const organFilter = document.querySelector(".health-organ-filter");
    if (boundaryFilter) boundaryFilter.value = healthBoundaryFilter;
    if (organFilter) organFilter.value = healthOrganFilter;
    renderHealth(currentHealth);
  }
}

function organMatrixRows() {
  const aggregate = getPrototypeAggregateHealth();
  const impactsByOrgan = new Map((aggregate?.impacts || []).map(impact => [normalizeImpactOrgan(impact.organ), impact]));
  const signalsByOrgan = new Map();
  for (const network of Object.values(knowledgeNetworks || {})) {
    for (const signal of network?.healthContext?.markerSignals || []) {
      const organId = normalizeImpactOrgan(signal.organ);
      if (!signalsByOrgan.has(organId)) signalsByOrgan.set(organId, []);
      signalsByOrgan.get(organId).push(signal);
    }
  }

  return Object.entries(HOTSPOTS).map(([organId, organ]) => {
    const impact = impactsByOrgan.get(organId);
    const contributors = impact?.contributors || [];
    const signals = signalsByOrgan.get(organId) || [];
    const pathways = contributors.flatMap(item => item.pathways || []);
    const themeCandidates = [
      ...pathways.map(pathway => pathway.exposure),
      ...contributors.filter(item => !(item.pathways || []).length).map(item => item.exposure?.agent || item.label),
      ...signals.map(signal => signal.label)
    ].filter(Boolean);
    const themesByKey = new Map();
    themeCandidates.forEach(theme => {
      const normalizedTheme = normalizeOrganLookupKey(theme);
      const key = /(^| )(no ?2|stickstoffdioxid)( |$)/.test(normalizedTheme)
        ? "no2"
        : /(^| )(pm ?2 ?5|feinstaub)( |$)/.test(normalizedTheme)
          ? "pm25"
          : /(^| )(ozon|o3)( |$)/.test(normalizedTheme)
            ? "ozone"
            : normalizedTheme;
      if (key && !themesByKey.has(key)) themesByKey.set(key, theme);
    });
    const themes = [...themesByKey.values()];
    const hasQuantifiedBurden = typeof impact?.burdenScore === "number";
    const evidence = hasQuantifiedBurden
      ? "quantifizierte Krankheitslast"
      : contributors.length || signals.length
        ? "geprüfter Organpfad"
        : "kein direkter Organpfad";
    const connectionCount = contributors.length + signals.length;
    const coverage = themes.length
      ? `${themes.length} ${themes.length === 1 ? "Thema" : "Themen"} · ${connectionCount} ${connectionCount === 1 ? "Eintrag" : "Einträge"}`
      : "keine Einträge";
    const researchNeed = hasQuantifiedBurden
      ? "Normierung weiter prüfen"
      : themes.length > 1
        ? "Abdeckung beobachten"
        : themes.length === 1
          ? "weitere Evidenz ergänzen"
          : "nur bei konkretem Pfad ergänzen";
    const entityType = {
      organ: "Organ",
      organ_group: "Organgruppe",
      organ_system: "Organsystem"
    }[organ.entityType] || "Organ";
    const systemLabel = ORGAN_SYSTEMS[organ.primarySystemId]?.label || organ.primarySystemId || "–";
    const relatedSystems = (organ.relatedSystemIds || [])
      .map(systemId => ORGAN_SYSTEMS[systemId]?.label || systemId)
      .filter(Boolean);
    return { organId, label: organ.label, entityType, systemLabel, relatedSystems, themes, evidence, coverage, researchNeed };
  });
}

function renderOrganMatrix() {
  if (!organMatrixPanel) return;
  const rows = organMatrixRows();
  organMatrixPanel.innerHTML = `
    <section class="organ-matrix-card" role="dialog" aria-modal="false" aria-labelledby="organMatrixTitle">
      <header class="organ-matrix-head">
        <div>
          <span class="eyebrow">Fachliche Übersicht</span>
          <h2 id="organMatrixTitle">Organ-Matrix</h2>
          <p>Grundschema, direkte Organpfade und thematische Panel-Abdeckung. Die Matrix erzeugt keinen zusätzlichen Krankheitslastwert und aktiviert keine neuen Marker.</p>
        </div>
        <button class="overlay-close organ-matrix-close" type="button" aria-label="Organ-Matrix schließen">×</button>
      </header>
      <div class="organ-matrix-key">
        <span><b>Ebene</b> unterscheidet Organ, Organgruppe und Organsystem.</span>
        <span><b>Geprüfter Organpfad</b> = mindestens ein im Panel hinterlegter Expositions- oder Wirkungspfad.</span>
        <span><b>Kein direkter Organpfad</b> ist kein Urteil über die medizinische Relevanz.</span>
      </div>
      <div class="organ-matrix-table-wrap">
        <table class="organ-matrix-table">
          <thead><tr><th>Marker</th><th>Ebene &amp; System</th><th>Hinterlegte Expositions- und Wirkungsthemen</th><th>Status im Panel</th><th>Abdeckung</th><th>Nächster Bedarf</th></tr></thead>
          <tbody>${rows.map(row => `
            <tr>
              <th scope="row"><button class="organ-matrix-organ" type="button" data-organ-matrix-organ="${row.organId}">${row.label}</button></th>
              <td><span class="organ-matrix-type">${row.entityType}</span><strong class="organ-matrix-system">${row.systemLabel}</strong>${row.relatedSystems.map(system => `<small class="organ-matrix-related">auch: ${system}</small>`).join("")}</td>
              <td>${row.themes.length ? `${row.themes.slice(0, 3).map(theme => `<span class="organ-matrix-theme">${theme}</span>`).join("")}${row.themes.length > 3 ? `<small class="organ-matrix-more">+ ${row.themes.length - 3} weitere</small>` : ""}` : "–"}</td>
              <td><span class="organ-matrix-status ${row.evidence === "kein direkter Organpfad" ? "is-empty" : ""}">${row.evidence}</span></td>
              <td>${row.coverage}</td>
              <td><span class="organ-matrix-need">${row.researchNeed}</span></td>
            </tr>`).join("")}</tbody>
        </table>
      </div>
    </section>`;
  organMatrixPanel.querySelector(".organ-matrix-close")?.addEventListener("click", closeOrganMatrix);
  organMatrixPanel.querySelectorAll("[data-organ-matrix-organ]").forEach(button => button.addEventListener("click", () => {
    closeOrganMatrix();
    openOrganOverlay(button.dataset.organMatrixOrgan);
  }));
}

function openOrganMatrix() {
  if (!organMatrixPanel) {
    organMatrixPanel = document.createElement("div");
    organMatrixPanel.id = "organMatrixPanel";
    organMatrixPanel.className = "organ-matrix-panel";
    document.querySelector(".panel-grid")?.appendChild(organMatrixPanel);
  }
  closeOrganOverlay();
  renderOrganMatrix();
  organMatrixPanel.hidden = false;
  organMatrixToggle?.setAttribute("aria-expanded", "true");
}

function closeOrganMatrix() {
  if (!organMatrixPanel) return;
  organMatrixPanel.hidden = true;
  organMatrixToggle?.setAttribute("aria-expanded", "false");
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
    const label = document.createElement("button");
    label.type = "button";
    label.className = "hotspot-label";
    label.textContent = def.label;
    label.setAttribute("aria-label", `${def.label} öffnen`);
    label.addEventListener("click", () => openOrganOverlay(id));
    const exposureScale = document.createElement("span");
    exposureScale.className = "exposure-influence-scale";
    exposureScale.hidden = true;
    exposureScale.setAttribute("aria-hidden", "true");
    exposureScale.innerHTML = "<i></i><i></i><i></i>";
    wrap.appendChild(btn); wrap.appendChild(label); wrap.appendChild(exposureScale); hotspotLayer.appendChild(wrap);
  });
}

function clearHotspotStates() {
  document.querySelectorAll(".hotspot-dot").forEach(dot => {
    dot.closest(".hotspot-group").hidden = healthOrganFilter !== "all" && dot.dataset.organ !== healthOrganFilter;
    dot.classList.remove("is-selected", "is-unquantified", "is-quantified", "has-foundation-link", "is-age-elevated");
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
    if (healthBoundaryFilter === "current" && !impactLinksToSelectedFoundation(impact)) continue;
    const hasVerifiedPath = (impact?.contributors || []).some(item =>
      Boolean(item.route?.boundaryId) ||
      (item.pathways || []).some(pathway => pathway.foundationLinkEligible === true)
    );
    if (!hasVerifiedPath) continue;
    const organId = normalizeImpactOrgan(impact.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) continue;
    dot.classList.add("has-foundation-link");
    if (hasAnyHigherAgeEffect(impact)) dot.classList.add("is-age-elevated");
    dot.setAttribute("aria-label", `${HOTSPOTS[organId]?.label || impact.label}. Mindestens ein geprüfter Gesundheitspfad ist im Panel hinterlegt.`);
  }

  // In der Gesamtübersicht ergänzen wir Ringe aus allen Wissensnetzen. Bei
  // „Aktuelle PG“ würde dieser Durchlauf den Filter wieder aufheben; die
  // Marker des aktiven Netzes werden anschließend gezielt gesetzt.
  if (healthBoundaryFilter === "current") return;
  for (const network of Object.values(knowledgeNetworks || {})) {
    for (const signal of network?.healthContext?.markerSignals || []) {
      if (!appliesToSelectedAgeGroup(signal)) continue;
      const scopes = signal.scopes || (signal.scope ? [signal.scope] : []);
      if (scopes.length && !scopes.includes(getSelectedScope())) continue;
      const organId = normalizeImpactOrgan(signal.organ);
      const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
      if (!dot) continue;
      dot.classList.add("has-foundation-link");
      if (signal.fillStatus === "unquantified_organ_effect") {
        dot.classList.remove("is-neutral");
        dot.classList.add("is-unquantified");
      }
      if (hasAnyHigherAgeEffect(signal)) dot.classList.add("is-age-elevated");
    }
  }
}

function applyKnowledgeOrganLinks() {
  const network = getActiveKnowledgeContext()?.network;
  for (const signal of network?.healthContext?.markerSignals || []) {
    if (!appliesToSelectedAgeGroup(signal)) continue;
    const scopes = signal.scopes || (signal.scope ? [signal.scope] : []);
    if (scopes.length && !scopes.includes(getSelectedScope())) continue;
    const organId = normalizeImpactOrgan(signal.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) continue;
    dot.classList.add("has-foundation-link");
    if (getAgeEffect(signal)?.status === "higher_effect") dot.classList.add("is-age-elevated");
    if (signal.fillStatus === "unquantified_organ_effect") {
      dot.classList.remove("is-neutral");
      dot.classList.add("is-unquantified");
    }
    const limitation = signal.signalType === "recognized_occupational_disease"
      ? "Organwirkung belegt; keine quantifizierte zurechenbare Krankheitslast."
      : "Keine Aussage über einen ursächlichen Organschaden.";
    dot.setAttribute("aria-label", `${HOTSPOTS[organId]?.label || signal.organ}. ${signal.label || "Geprüfter Organbezug vorhanden."} ${limitation}`);
  }
}

function exposureInfluenceForActiveContext() {
  // Auch in der Gesamtübersicht bleibt die Skala sichtbar. Ohne eine
  // konkrete PG-Bewertung ist sie bewusst als „nicht bewertet“ markiert.
  if (healthBoundaryFilter !== "current") {
    return { label: "Eigener Einfluss auf die Exposition", level: "nicht bewertet", score: 0, unassessed: true };
  }
  const action = getActiveKnowledgeContext()?.network?.actionScope;
  const unassessed = { label: "Eigener Einfluss auf die Exposition", level: "nicht bewertet", score: 0, unassessed: true };
  if (!action) return unassessed;
  const dimension = (action?.dimensions || []).find(item =>
    item.id === "personal_exposure" || /eigene exposition/i.test(item.label || "")
  );
  if (!dimension) return unassessed;

  if (typeof dimension.score === "number") {
    return { ...dimension, score: Math.max(0, Math.min(3, Math.round(dimension.score))) };
  }

  const level = String(dimension.level || "").toLocaleLowerCase("de-DE");
  const score = level.includes("hoch")
    ? 3
    : level.includes("mittel")
      ? 2
      : (level.includes("gering") || level.includes("begrenzt"))
        ? 1
        : null;
  return score === null ? null : { ...dimension, score };
}

function applyExposureInfluenceIndicators() {
  const influence = exposureInfluenceForActiveContext();
  document.querySelectorAll(".exposure-influence-scale:not(.legend-example)").forEach(scale => {
    scale.hidden = true;
    scale.classList.remove("is-unassessed");
    scale.removeAttribute("title");
    scale.querySelectorAll("i").forEach(segment => segment.classList.remove("filled"));
  });
  if (!influence) return;

  document.querySelectorAll(".hotspot-dot").forEach(dot => {
    const scale = dot.closest(".hotspot-group")?.querySelector(".exposure-influence-scale");
    if (!scale) return;
    scale.hidden = false;
    scale.classList.toggle("is-unassessed", influence.unassessed === true);
    scale.title = `${influence.label}: ${String(influence.level || `${influence.score} von 3`).replaceAll("_", " ")}`;
    scale.querySelectorAll("i").forEach((segment, index) => {
      segment.classList.toggle("filled", index < influence.score);
    });
  });
}

function getActiveKnowledgeMarkerSignal(organId) {
  const network = getActiveKnowledgeContext()?.network;
  return (network?.healthContext?.markerSignals || []).find(signal => {
    if (!appliesToSelectedAgeGroup(signal)) return false;
    const scopes = signal.scopes || (signal.scope ? [signal.scope] : []);
    return normalizeImpactOrgan(signal.organ) === normalizeImpactOrgan(organId)
      && (!scopes.length || scopes.includes(getSelectedScope()));
  }) || null;
}

function getKnowledgeMarkerContextsForOrgan(organId) {
  const activeNetwork = getActiveKnowledgeContext()?.network;
  const networks = healthBoundaryFilter === "current" && activeNetwork
    ? [activeNetwork]
    : Object.values(knowledgeNetworks || {});

  return networks.flatMap(network => (network?.healthContext?.markerSignals || [])
    .filter(signal => {
      if (!appliesToSelectedAgeGroup(signal)) return false;
      const scopes = signal.scopes || (signal.scope ? [signal.scope] : []);
      return normalizeImpactOrgan(signal.organ) === normalizeImpactOrgan(organId) &&
        (!scopes.length || scopes.includes(getSelectedScope()));
    })
    .map(signal => {
      const navigation = data.boundaries.flatMap(boundary =>
        (boundary.items || []).map(item => ({ boundary, item }))
      ).find(entry => entry.item.knowledgeSource && getKnowledgeNetworkBySource(entry.item.knowledgeSource) === network);
      return { network, signal, navigation };
    })
  );
}

function renderHealth(health) {
  if (!health && LIFE_PROTOTYPE_MODE) {
    health = getPrototypeAggregateHealth();
  }

  currentHealth = health;
  clearHotspotStates();
  applyFoundationLinkRings();
  applyKnowledgeOrganLinks();
  updateAgeGroupDisplay();
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
    applyExposureInfluenceIndicators();
    if (selectedOrganId) openOrganOverlay(selectedOrganId, true);
    return;
  }
  const texts = [];
  impacts.forEach(impact => {
    if (!appliesToSelectedAgeGroup(impact)) return;
    if (healthBoundaryFilter === "current" && !impactLinksToSelectedFoundation(impact)) return;
    const organId = normalizeImpactOrgan(impact.organ);
    const dot = document.querySelector(`.hotspot-dot[data-organ="${organId}"]`);
    if (!dot) return;
    if (getAgeEffect(impact)?.status === "higher_effect") dot.classList.add("is-age-elevated");
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
        texts.push(`${impact.label}: ${impact.contributors?.length || 0} belegte Beiträge; noch keine gemeinsame normierte Krankheitslast für eine abgestufte Markerfüllung.`);
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
  applyExposureInfluenceIndicators();
  organReadout.textContent = texts.join(" ");
  if (selectedOrganId) openOrganOverlay(selectedOrganId, true);
}

function createMediaNode(organId) {
  const media = ORGAN_MEDIA[organId] || { label: HOTSPOTS[organId]?.label || organId, layout: "stack" };
  organOverlayContent.classList.remove("side-by-side");

  const block = document.createElement("div");
  block.className = `organ-system-block layout-${media.layout === "side" ? "side" : "stack"}`;
  block.dataset.organId = organId;
  block.dataset.organType = HOTSPOTS[organId]?.entityType || "organ";
  block.dataset.systemId = HOTSPOTS[organId]?.primarySystemId || "";

  const visual = document.createElement("div");
  const showSystemLabel = media.systemLabel && media.systemLabel !== media.label;
  visual.className = `organ-system-visual${showSystemLabel ? " has-system-label" : ""}`;
  if (showSystemLabel) {
    const title = document.createElement("strong");
    title.className = "organ-system-title";
    title.textContent = media.systemLabel;
    visual.appendChild(title);
  }
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
        <small><strong>Markerfüllung:</strong> ${item.whyNoColor}</small>
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
      : `${item.spatialContext ? `Regionaler Kontext · ${item.spatialContext} · ` : ""}Evidenz ${item.evidenceLevel || "–"} · ${burden ? (item.affectsOrganColor ? "Krankheitslast quantifiziert" : "Krankheitslast quantifiziert, noch nicht normiert") : "Krankheitslast noch nicht quantifiziert"}`;

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
          ${item.whyNoColor ? `<small><strong>Markerfüllung:</strong> ${item.whyNoColor}</small>` : ""}
          ${source?.url ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer">↗ Quelle öffnen</a>` : ""}
          ${routeBoundary ? `
            <button type="button" data-life-route-boundary="${routeBoundary}" data-life-route-item="${routeItem}">
              → Ursache im GWL-Panel öffnen
            </button>` : ""}
        </div>
      </details>`;
  }).join("");
}

function renderKnowledgeMarkerContributionCards(contexts) {
  return contexts.map(({ network, signal, navigation }) => `
    <article class="organ-contribution-item">
      <strong class="knowledge-marker-contribution-title">${signal.label}</strong>
      <small>${signal.note || "Geprüfter Organbezug; keine gemeinsame normierte Krankheitslast für eine abgestufte Markerfüllung."}</small>
      ${sourceLinksHtml(network, signal.sourceRefs)}
      ${navigation ? `<button type="button" data-life-route-boundary="${navigation.boundary.id}" data-life-route-item="${navigation.item.id}" aria-label="${signal.label} im GWL-Panel öffnen">Zum Beitrag in WIRKUNG</button>` : ""}
    </article>`).join("");
}

function organWindowIdentityHtml(organId) {
  const organ = HOTSPOTS[organId] || {};
  const typeLabel = {
    organ: "Organ",
    organ_group: "Organgruppe",
    organ_system: "Organsystem"
  }[organ.entityType] || "Organ";
  const primarySystem = ORGAN_SYSTEMS[organ.primarySystemId]?.label || organ.primarySystemId || "Nicht zugeordnet";
  const relatedSystems = (organ.relatedSystemIds || [])
    .map(systemId => ORGAN_SYSTEMS[systemId]?.label || systemId)
    .filter(Boolean);
  return `
    <span class="organ-window-identity">
      <span class="organ-window-chip">${typeLabel}</span>
      <span class="organ-window-chip is-system">${primarySystem}</span>
      ${relatedSystems.map(system => `<span class="organ-window-related">auch: ${system}</span>`).join("")}
    </span>`;
}

function setOrganWindowFinding(organId, status, text) {
  organOverlayFinding.innerHTML = `
    ${organWindowIdentityHtml(organId)}
    <span class="organ-window-status">${status}</span>
    <span class="organ-window-finding-text">${text}</span>`;
}

function openOrganOverlay(organId, preserveHidden = false) {
  organId = resolveOrganId(organId) || organId;
  selectedOrganId = organId;
  const def = HOTSPOTS[organId];
  const knowledgeMarkerContexts = getKnowledgeMarkerContextsForOrgan(organId);
  const activeKnowledgeSignal = getActiveKnowledgeMarkerSignal(organId);
  const impact = getImpactForOrgan(organId);
  organOverlayTitle.textContent = ORGAN_MEDIA[organId]?.label || def?.label || organId;
  organOverlayMedia.innerHTML = ""; organOverlayMedia.appendChild(createMediaNode(organId));
  organOverlayContent.classList.add("health-contribution-layout", "organ-window-layout");
  if (organOverlayNote?.parentElement !== organOverlayContent) {
    organOverlayContent.appendChild(organOverlayNote);
  }
  if (impact?.healthContributionView && Array.isArray(impact.contributors)) {
    const hasColor = typeof impact.burdenScore === "number";
    const panelContributors = impact.contributors.filter(item => !item.globalHealthReference);
    const globalContributors = impact.contributors.filter(item => item.globalHealthReference);
    setOrganWindowFinding(
      organId,
      hasColor ? "Krankheitslast quantifiziert · Markerfüllung abgestuft" : "Geprüfte Verbindungen · Markerfüllung neutral",
      hasColor
        ? `${impact.burdenScore} % normierte zurechenbare Krankheitslast aus ${impact.contributors.length} Beiträgen.`
        : `${impact.contributors.length} gesundheitlich relevante Beiträge und globale Referenzen. Für eine abgestufte Markerfüllung liegt noch keine gemeinsame normierte zurechenbare Krankheitslast vor.`
    );

    organOverlayNote.innerHTML = `
      ${panelContributors.length ? `
        <details class="organ-context-details" open>
          <summary>Direkte Gesundheitsbeiträge</summary>
          <div class="organ-contribution-list">${renderHealthContributionCards(panelContributors)}</div>
        </details>` : ""}
      ${globalContributors.length ? `
        <details class="organ-context-details global-health-reference" open>
          <summary>
            <span>Globale Gesundheitslast</span>
            <button class="inline-info-button" type="button" aria-label="Information zur globalen Gesundheitslast" aria-expanded="false">i</button>
          </summary>
          <div class="inline-info-note" hidden>Diese Werte beschreiben globale, modellierte Krankheitslast. Sie sind kein lokaler Befund für den gewählten Ort und werden nicht mit anderen Belastungen addiert.</div>
          <div class="organ-contribution-list">${renderHealthContributionCards(globalContributors)}</div>
        </details>` : ""}`;

    if (knowledgeMarkerContexts.length) {
      organOverlayNote.insertAdjacentHTML("beforeend", `
        <details class="organ-context-details" open>
          <summary>Verbindungen aus WIRKUNG</summary>
          <div class="organ-contribution-list">${renderKnowledgeMarkerContributionCards(knowledgeMarkerContexts)}</div>
        </details>`);
    }
    organOverlayNote.insertAdjacentHTML("beforeend", `
      <details class="organ-context-details organ-method-details">
        <summary>Einordnung &amp; Methodik</summary>
        <div class="organ-prototype-warning">
          <p>${LIFE_HEALTH_DATA?.methodPolicy?.organColorRule || ""}</p>
        </div>
      </details>`);

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
    const knowledgeSignal = activeKnowledgeSignal || knowledgeMarkerContexts[0]?.signal;
    const finding = impact
      ? (findingText.textContent || "–")
      : knowledgeMarkerContexts.length > 1
        ? `${knowledgeMarkerContexts.length} geprüfte Organbezüge sind in der Gesamtübersicht hinterlegt.`
        : knowledgeSignal?.label || "Für dieses Organ liegt in der aktuellen Auswahl noch kein geprüfter Gesundheitsbeitrag vor.";
    setOrganWindowFinding(
      organId,
      knowledgeMarkerContexts.length ? "Geprüfter Organpfad · Markerfüllung neutral" : "Noch kein direkter Organpfad",
      finding
    );

    organOverlayNote.innerHTML = `
      ${knowledgeMarkerContexts.length ? `
        <details class="organ-context-details" open>
          <summary>Verbindungen aus WIRKUNG</summary>
          <div class="organ-contribution-list">
            ${renderKnowledgeMarkerContributionCards(knowledgeMarkerContexts)}
          </div>
        </details>` : ""}
      <details class="organ-context-details organ-method-details" open>
        <summary>Einordnung &amp; Methodik</summary>
        <p>${impact
          ? "Die fachliche Einordnung und der Wirkungspfad stehen im Feld <strong>WIRKUNG</strong>."
          : knowledgeSignal?.note || (knowledgeSignal
            ? "Der Außenring kennzeichnet einen geprüften, aber nicht als Organstatus quantifizierten Gesundheitsbezug."
            : "Der Marker ist Teil der Bodymap, bleibt aber neutral, bis ein konkreter Umwelt–Expositions–Gesundheitspfad geprüft und importiert wurde.")}</p>
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
  if (isMobilePanelLayout()) setMobilePanelView("effect", { focus: true });
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
  if (isMobilePanelLayout() && mobilePanelView === "ground") setMobilePanelView("effect", { focus: true });

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
if (foundationText) foundationText.textContent = "Neun Planetare Grenzen bilden den wissenschaftlichen Ausgangspunkt. Ergänzende Einflussbereiche erweitern den Blick auf Lebensgrundlagen und menschliche Gesundheit.";
renderBoundaries();
  renderKnowledgePanel();
}

function selectYear(year) {
  const knowledge = getActiveKnowledgeContext();
  if (knowledge?.network && getActiveKnowledgeSeries(knowledge.network)?.points?.length) {
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
    if (!getActiveKnowledgeSeries(knowledge.network)?.points?.length) timeWindow = "data";
    const points = getActiveKnowledgeSeries(knowledge.network).points;
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
function resetPanel() { setHealthMarkersEnabled(true); regionSelect.value = "global"; selectedAgeGroup = "adults"; timeWindow = "data"; chooseFirstItemForScope(); updateAgeGroupDisplay(); }

regionSelect.addEventListener("change", () => {
  setHealthMarkersEnabled(true);
  chooseFirstItemForScope();
});
ageGroupButtons.forEach(button => button.addEventListener("click", () => {
  const nextGroup = button.dataset.ageGroup;
  if (!nextGroup || nextGroup === selectedAgeGroup) return;
  setHealthMarkersEnabled(true);
  selectedAgeGroup = nextGroup;
  closeOrganOverlay();
  renderHealth(currentHealth);
  updateAgeGroupDisplay();
}));

function setLocationInfoOpen(open) {
  if (!locationInfoButton || !locationInfo) return;
  locationInfo.hidden = !open;
  locationInfoButton.setAttribute("aria-expanded", String(open));
}

function setGlobalClimateInfoOpen(open) {
  if (!globalClimateInfoButton || !globalClimateInfo) return;
  globalClimateInfo.hidden = !open;
  globalClimateInfoButton.setAttribute("aria-expanded", String(open));
}

globalClimateInfoButton?.addEventListener("click", event => {
  event.stopPropagation();
  setGlobalClimateInfoOpen(globalClimateInfoButton.getAttribute("aria-expanded") !== "true");
});

locationInfoButton?.addEventListener("click", event => {
  event.stopPropagation();
  setLocationInfoOpen(locationInfoButton.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("click", event => {
  if (locationInfoButton?.getAttribute("aria-expanded") !== "true") return;
  if (!event.target.closest(".location-control")) setLocationInfoOpen(false);
});

document.addEventListener("click", event => {
  if (globalClimateInfoButton?.getAttribute("aria-expanded") !== "true") return;
  if (!event.target.closest(".global-climate-info-wrap")) setGlobalClimateInfoOpen(false);
});

document.addEventListener("click", event => {
  if (!event.target.closest(".boundary-context-info")) closeBoundaryContextInfos();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && healthPathOverlay && !healthPathOverlay.hidden) {
    closeHealthPathOverlay();
    return;
  }
  if (event.key === "Escape" && locationInfoButton?.getAttribute("aria-expanded") === "true") {
    setLocationInfoOpen(false);
    locationInfoButton.focus();
    return;
  }
  if (event.key === "Escape" && globalClimateInfoButton?.getAttribute("aria-expanded") === "true") {
    setGlobalClimateInfoOpen(false);
    globalClimateInfoButton.focus();
    return;
  }
  if (event.key === "Escape" && document.querySelector(".boundary-context-info:not([hidden])")) {
    closeBoundaryContextInfos();
  }
});
resetButton.addEventListener("click", resetPanel);
dataWindowButton.addEventListener("click", () => setTimeWindow("data"));
projectionWindowButton.addEventListener("click", () => setTimeWindow("projection"));
blcWindowButton.addEventListener("click", () => setTimeWindow("blc"));
scenarioSelect.addEventListener("change", event => {
  projectionScenario = event.target.value;
  setTimeWindow("projection");
});
blcReleaseSwitch?.addEventListener("change", updateActiveBlcCurveApproval);
blcReleaseExportButton?.addEventListener("click", downloadBlcCurveApprovalManifest);
timeSlider.addEventListener("input", event => {
  let year = Number(event.target.value);
  const context = getActiveKnowledgeContext();
  const series = context?.network ? getKnowledgeSeries(context.network) : null;
  const preserveMissingYears = context?.network?.timeNavigation?.preserveMissingYears === true;
  if ((timeWindow === "data" || timeWindow === "projection") && getActiveKnowledgeSeries(context?.network)?.points?.length && !preserveMissingYears) {
    year = getActiveKnowledgeSeries(context.network).points
      .map(point => Number(point.year))
      .filter(Number.isFinite)
      .reduce((nearest, candidate) =>
        Math.abs(candidate - year) < Math.abs(nearest - year) ? candidate : nearest
      );
  }
  selectYear(year);
});
let timeChartResizeFrame = null;
window.addEventListener("resize", () => {
  if (!timeChart) return;
  if (timeChartResizeFrame) cancelAnimationFrame(timeChartResizeFrame);
  timeChartResizeFrame = requestAnimationFrame(() => {
    const context = getActiveKnowledgeContext();
    if (context?.network) {
      renderTimeChart(getKnowledgeSeries(context.network), getQualifiedProjectionSeries(context.network));
      return;
    }
    renderTimeChart({ points: getTimePoints(getCurrentItem()) });
  });
});
closeOverlayButton.addEventListener("click", closeOrganOverlay);
organMatrixToggle?.addEventListener("click", () => {
  if (organMatrixPanel && !organMatrixPanel.hidden) closeOrganMatrix();
  else openOrganMatrix();
});
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
effectPath?.addEventListener("click", event => {
  const boundaryRoute = event.target.closest("[data-life-route-boundary]");
  if (boundaryRoute) {
    followHealthRoute(boundaryRoute);
    return;
  }
  const organRoute = event.target.closest("[data-organ-route]");
  if (organRoute) openOrganOverlay(organRoute.dataset.organRoute);
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
    await loadBlcCurveApprovalManifest();
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
  renderBoundaries();
  renderHealth(null);
  if (isMobilePanelLayout()) setMobilePanelView("life");
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
      grid-template-columns: 1fr !important;
      align-items: start !important;
      gap: 14px !important;
    }

    #organOverlayContent.health-contribution-layout > #organOverlayMedia,
    #organOverlayContent.health-contribution-layout > .organ-overlay-media {
      grid-column: 1 !important;
      grid-row: 1 !important;
      min-width: 0;
    }

    /* Befund und Kontext folgen immer unterhalb des Organbilds. */
    #organOverlayContent.health-contribution-layout > :not(#organOverlayMedia):not(#organOverlayNote) {
      grid-column: 1 !important;
      grid-row: 2 !important;
      min-width: 0;
    }

    /* Method and all causes now use the complete width below image + finding. */
    #organOverlayContent.health-contribution-layout > #organOverlayNote {
      grid-column: 1 !important;
      grid-row: 3 !important;
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
