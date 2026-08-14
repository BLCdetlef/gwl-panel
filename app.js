const data = window.GWL_DATA;

const boundaryList = document.getElementById("boundaryList");
const focusType = document.getElementById("focusType");
const focusTitle = document.getElementById("focusTitle");
const focusSummary = document.getElementById("focusSummary");
const metricValue = document.getElementById("metricValue");
const referenceValue = document.getElementById("referenceValue");
const uncertaintyValue = document.getElementById("uncertaintyValue");
const sourceLink = document.getElementById("sourceLink");
const effectPath = document.getElementById("effectPath");
const resetButton = document.getElementById("resetButton");
const leftModeChip = document.getElementById("leftModeChip");
const rightModeChip = document.getElementById("rightModeChip");
const organHint = document.getElementById("organHint");
const organButtons = [...document.querySelectorAll(".organ")];

let mode = "foundation";
let selectedBoundaryId = null;
let selectedItemId = null;
let selectedOrganId = null;

function renderBoundaries() {
  boundaryList.innerHTML = "";

  data.boundaries.forEach(boundary => {
    const row = document.createElement("div");
    row.className = "boundary-row";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "boundary-button";
    if (!boundary.enabled) button.classList.add("disabled");
    if (boundary.id === selectedBoundaryId) button.classList.add("active");

    button.innerHTML = `<span>${boundary.label}</span><span>${boundary.enabled ? "›" : ""}</span>`;

    if (boundary.enabled) {
      button.addEventListener("click", () => selectBoundary(boundary.id));
    }

    row.appendChild(button);

    if (boundary.items) {
      const submenu = document.createElement("div");
      submenu.className = "submenu";
      if (boundary.id === selectedBoundaryId) submenu.classList.add("open");

      boundary.items.forEach(item => {
        const itemButton = document.createElement("button");
        itemButton.type = "button";
        itemButton.textContent = item.label;
        if (item.id === selectedItemId) itemButton.classList.add("active");
        itemButton.addEventListener("click", () => selectItem(boundary.id, item.id));
        submenu.appendChild(itemButton);
      });

      row.appendChild(submenu);
    }

    boundaryList.appendChild(row);
  });
}

function selectBoundary(boundaryId) {
  mode = "foundation";
  selectedBoundaryId = boundaryId;
  selectedItemId = null;
  selectedOrganId = null;

  const boundary = data.boundaries.find(b => b.id === boundaryId);

  focusType.textContent = "Grundlage";
  focusTitle.textContent = `${boundary.label} · Lübeck · Heute`;
  focusSummary.textContent = boundary.summary || "Noch keine Zusammenfassung hinterlegt.";

  setMetrics("–", "–", "–", "–", "#");
  effectPath.textContent = "Wähle ein Unterthema, um Messwert, Referenz, Unsicherheit und Wirkungspfad zu sehen.";

  clearOrgans();
  setModeChips();
  renderBoundaries();
}

function selectItem(boundaryId, itemId) {
  mode = "foundation";
  selectedBoundaryId = boundaryId;
  selectedItemId = itemId;
  selectedOrganId = null;

  const boundary = data.boundaries.find(b => b.id === boundaryId);
  const item = boundary.items.find(i => i.id === itemId);

  focusType.textContent = "Grundlage";
  focusTitle.textContent = `${boundary.label} · ${item.label}`;
  focusSummary.textContent = `Ort: Lübeck · Zeit: Heute`;

  setMetrics(
    item.value,
    item.reference,
    item.uncertainty,
    item.sourceLabel,
    item.sourceUrl
  );

  effectPath.textContent = item.effect;
  applyOrganRelevance(item.organs);
  setModeChips();
  renderBoundaries();
}

function selectOrgan(organId) {
  const organ = data.organs[organId];
  const strongest = findStrongestBoundaryItemForOrgan(organId);

  if (!strongest) return;

  mode = "life";
  selectedOrganId = organId;
  selectedBoundaryId = strongest.boundary.id;
  selectedItemId = strongest.item.id;

  focusType.textContent = "Leben";
  focusTitle.textContent = organ.label;
  focusSummary.textContent = organ.summary;

  setMetrics(
    strongest.item.value,
    strongest.item.reference,
    strongest.item.uncertainty,
    strongest.item.sourceLabel,
    strongest.item.sourceUrl
  );

  effectPath.textContent =
    `${strongest.boundary.label} → ${strongest.item.label} → ${organ.label}: ${strongest.item.effect}`;

  clearOrgans();
  const btn = organButtons.find(b => b.dataset.organ === organId);
  if (btn) {
    btn.classList.add("strong", "selected");
  }

  setModeChips();
  renderBoundaries();
}

function findStrongestBoundaryItemForOrgan(organId) {
  let best = null;

  data.boundaries.forEach(boundary => {
    (boundary.items || []).forEach(item => {
      const weight = item.organs?.[organId] || 0;
      if (!best || weight > best.weight) {
        if (weight > 0) best = { boundary, item, weight };
      }
    });
  });

  return best;
}

function applyOrganRelevance(organs = {}) {
  clearOrgans();

  organButtons.forEach(button => {
    const weight = organs[button.dataset.organ] || 0;

    if (weight === 1) {
      button.classList.add("relevant");
    } else if (weight >= 2) {
      button.classList.add("strong");
      button.addEventListener("click", organClickHandler, { once: true });
    }
  });

  organHint.textContent =
    "Dunklere Organe zeigen im Prototyp eine stärkere hinterlegte Relevanz. Das ist keine Krankheitswahrscheinlichkeit.";
}

function organClickHandler(event) {
  selectOrgan(event.currentTarget.dataset.organ);
}

function clearOrgans() {
  organButtons.forEach(button => {
    button.classList.remove("relevant", "strong", "selected");
    const clone = button.cloneNode(true);
    button.replaceWith(clone);
  });

  // Referenzliste nach Clone neu setzen
  const refreshed = [...document.querySelectorAll(".organ")];
  organButtons.splice(0, organButtons.length, ...refreshed);
}

function setMetrics(value, reference, uncertainty, sourceLabel, sourceUrl) {
  metricValue.textContent = value;
  referenceValue.textContent = reference;
  uncertaintyValue.textContent = uncertainty;

  sourceLink.textContent = sourceLabel;
  sourceLink.href = sourceUrl || "#";

  if (!sourceUrl || sourceUrl === "#") {
    sourceLink.removeAttribute("target");
  } else {
    sourceLink.setAttribute("target", "_blank");
  }
}

function setModeChips() {
  if (mode === "foundation") {
    leftModeChip.textContent = "erkunden";
    leftModeChip.classList.remove("muted");
    rightModeChip.textContent = "Wirkung";
    rightModeChip.classList.add("muted");
  } else {
    rightModeChip.textContent = "erkunden";
    rightModeChip.classList.remove("muted");
    leftModeChip.textContent = "Zuordnung";
    leftModeChip.classList.add("muted");
  }
}

function resetPanel() {
  mode = "foundation";
  selectedBoundaryId = null;
  selectedItemId = null;
  selectedOrganId = null;

  focusType.textContent = "Aktueller Zustand";
  focusTitle.textContent = "Lübeck · Heute";
  focusSummary.textContent =
    "Wähle links eine Planetare Grenze. Danach zeigt das Panel nur die wichtigsten, wissenschaftlich begründeten Verbindungen.";

  setMetrics("–", "–", "–", "–", "#");
  effectPath.textContent = "Noch keine Auswahl.";

  clearOrgans();
  setModeChips();
  renderBoundaries();
}

resetButton.addEventListener("click", resetPanel);

renderBoundaries();
setModeChips();
