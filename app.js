const data = window.GWL_DATA;

const boundaryList = document.getElementById("boundaryList");
const regionSelect = document.getElementById("regionSelect");
const regionPath = document.getElementById("regionPath");
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
const closeOverlayButton = document.getElementById("closeOverlayButton");
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


async function loadKnowledgeNetworks() {
  knowledgeNetworks = {};
  const sources = data.knowledgeSources || {};
  const entries = Object.entries(sources);
  for (const [key, url] of entries) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      knowledgeNetworks[key] = await response.json();
    } catch (error) {
      console.warn("Wissensnetz konnte nicht geladen werden:", error);
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

function renderKnowledgePanel() {
  const panel = ensureKnowledgePanel();
  const state = getActiveViewState();

  syncBoundaryModeClass();
  setStandardEffectBlocksVisible(state.boundaryId !== "nutrients" && state.boundaryId !== "novel");

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
          itemButton.textContent = item.label;
          if (item.id === selectedItemId) itemButton.classList.add("active");
          itemButton.addEventListener("click", () => selectItem(boundary.id, item.id));
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
        note: "Kein belastbarer 0–100-%-Funktionswert und in der aktuellen Bodymap kein eigener Immunsystem-Kuller."
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

function ensureHealthLegend() {
  if (healthLegend?.isConnected) return healthLegend;
  const bodymapPanel = document.querySelector(".bodymap-panel");
  const readout = document.getElementById("organReadout")?.closest(".organ-readout");
  if (!bodymapPanel || !readout) return null;

  healthLegend = document.createElement("div");
  healthLegend.className = "health-legend";
  healthLegend.setAttribute("aria-label", "Legende der Organgesundheit");
  healthLegend.innerHTML = `
    <div class="health-legend-title">Organgesundheit · Graustufen</div>
    <div class="health-legend-row">
      <span class="health-scale" aria-hidden="true">
        <span style="--legend-shade:#f2f2f2"></span>
        <span style="--legend-shade:#bdbdbd"></span>
        <span style="--legend-shade:#777"></span>
        <span style="--legend-shade:#111"></span>
      </span>
      <span><strong>hell</strong> = geringe/keine quantifizierte Beeinträchtigung · <strong>dunkel</strong> = stärkere quantifizierte Beeinträchtigung</span>
    </div>
    <div class="health-legend-row health-legend-secondary">
      <span class="legend-hatched" aria-hidden="true"></span>
      <span>Schraffiert = gesundheitlicher Befund belegt, aber keine belastbare 0–100-%-Funktionsskala vorhanden.</span>
    </div>`;
  bodymapPanel.insertBefore(healthLegend, readout);
  return healthLegend;
}

function updatePrototypeVersion() {
  const version = data?.version || "0.9";
  document.title = `GWL-Panel – Prototyp ${version}`;
  const versionNode = document.querySelector(".version");
  if (versionNode) versionNode.textContent = `Prototyp ${version}`;
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
    dot.classList.remove("is-selected", "is-unquantified", "is-quantified");
    dot.classList.add("is-neutral");
    dot.style.removeProperty("--hotspot-fill");
  });
}

function renderHealth(health) {
  currentHealth = health; clearHotspotStates();
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
    if (typeof impact.functionLoss === "number") {
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

function openOrganOverlay(organId, preserveHidden = false) {
  selectedOrganId = organId;
  const def = HOTSPOTS[organId];
  const impact = getImpactForOrgan(organId);
  organOverlayTitle.textContent = ORGAN_MEDIA[organId]?.label || def?.label || organId;
  organOverlayMedia.innerHTML = ""; organOverlayMedia.appendChild(createMediaNode(organId));
  // Der Befund im Organfenster ist absichtlich identisch mit dem aktuell
  // im Feld WIRKUNG angezeigten Befund. Keine zweite Interpretationsebene.
  organOverlayFinding.textContent = findingText.textContent || "–";

  // Einordnung bleibt standardmäßig zugeklappt und verweist auf WIRKUNG,
  // statt denselben Kontext im Organfenster erneut auszuschreiben.
  organOverlayNote.innerHTML = `
    <details class="organ-context-details">
      <summary>Einordnung</summary>
      <p>Die fachliche Einordnung und der Wirkungspfad stehen im Feld <strong>WIRKUNG</strong>.</p>
    </details>`;
  document.querySelectorAll('.hotspot-dot').forEach(dot => dot.classList.toggle('is-selected', dot.dataset.organ === organId));
  if (!preserveHidden || organOverlay.hidden) organOverlay.hidden = false;
}

function closeOrganOverlay() {
  // Organfenster schließt separat; Ursachenebene bleibt davon unberührt.

  organOverlay.hidden = true;
  selectedOrganId = null;
  document.querySelectorAll('.hotspot-dot').forEach(dot => dot.classList.remove('is-selected'));
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
  if (boundaryId === "nutrients" || boundaryId === "novel") {
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
  const item = getCurrentItem(); if (!item) return; selectedYear = year;
  const points = getTimePoints(item); const point = points.find(entry => entry.year === year) || null; timeReadout.textContent = String(year);
  if (point) { setDetails(item, point); renderHealth(point.health || item.health || null); updateCauseButtons(item, point); timeStatus.textContent = `${point.label || "Messpunkt"}. Dieser Zeitpunkt ist im Datensatz belegt.`; renderKnowledgePanel(); }
  else { setDetails(item, null, year); renderHealth(null); updateCauseButtons(item, null); timeStatus.textContent = `Für ${year} ist kein Messpunkt hinterlegt. Keine Interpolation.`; renderKnowledgePanel(); }
}

function setTimeWindow(nextWindow) {
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
resetButton.addEventListener("click", resetPanel);
dataWindowButton.addEventListener("click", () => setTimeWindow("data"));
blcWindowButton.addEventListener("click", () => setTimeWindow("blc"));
timeSlider.addEventListener("input", event => selectYear(Number(event.target.value)));
closeOverlayButton.addEventListener("click", closeOrganOverlay);
causeButtonGround.addEventListener("click", () => openCauseOverlay("ground"));
causeButtonEffect.addEventListener("click", () => openCauseOverlay("effect"));
causeButtonLife.addEventListener("click", () => openCauseOverlay("life"));
document.querySelectorAll("[data-close-cause]").forEach(button => button.addEventListener("click", () => closeCauseOverlay(button.dataset.closeCause)));
async function initPanel() {
  try {
    await loadBodymapConfig();
    await loadKnowledgeNetworks();
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

initPanel();
