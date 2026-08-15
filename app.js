const data = window.GWL_DATA;

const boundaryList = document.getElementById("boundaryList");
const scaleSelect = document.getElementById("scaleSelect");
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
const resetButton = document.getElementById("resetButton");

let selectedBoundaryId = "freshwater";
let selectedItemId = null;

function getSelectedScale() {
  return scaleSelect.value;
}

function getBoundary(boundaryId) {
  return data.boundaries.find(boundary => boundary.id === boundaryId);
}

function getVisibleItems(boundary) {
  if (!boundary?.items) return [];
  return boundary.items.filter(item => item.scope === getSelectedScale());
}

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
    } else {
      button.disabled = true;
    }

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

function selectBoundary(boundaryId) {
  selectedBoundaryId = boundaryId;
  const boundary = getBoundary(boundaryId);
  const items = getVisibleItems(boundary);

  if (items.length) {
    selectItem(boundaryId, items[0].id);
    return;
  }

  selectedItemId = null;
  focusType.textContent = "Grundlage";
  focusTitle.textContent = boundary.label;
  focusSummary.textContent = boundary.summary || "Noch keine Inhalte hinterlegt.";
  setDetails(null);
  renderBoundaries();
}

function selectItem(boundaryId, itemId) {
  selectedBoundaryId = boundaryId;
  selectedItemId = itemId;

  const boundary = getBoundary(boundaryId);
  const item = boundary.items.find(entry => entry.id === itemId);
  if (!item) return;

  focusType.textContent = `${item.type} · ${data.scopes[item.scope]}`;
  focusTitle.textContent = `${boundary.label} · ${item.label}`;
  focusSummary.textContent = item.summary;
  setDetails(item);
  renderBoundaries();
}

function setDetails(item) {
  if (!item) {
    metricValue.textContent = "–";
    referenceValue.textContent = "–";
    periodValue.textContent = "–";
    uncertaintyValue.textContent = "–";
    findingText.textContent = "–";
    effectPath.textContent = "–";
    lifeNote.textContent = "Gesundheitswirkungen werden erst hervorgehoben, wenn ein belastbarer Wirkungspfad von der Umweltveränderung über eine konkrete Exposition bis zum Menschen belegt ist.";
    sourceLink.textContent = "–";
    sourceLink.removeAttribute("href");
    sourceLink.removeAttribute("target");
    return;
  }

  metricValue.textContent = item.value;
  referenceValue.textContent = item.reference;
  periodValue.textContent = item.period;
  uncertaintyValue.textContent = item.uncertainty;
  findingText.textContent = item.finding;
  effectPath.textContent = item.effect;
  lifeNote.textContent = item.lifeNote;
  sourceLink.textContent = item.sourceLabel;
  sourceLink.href = item.sourceUrl;
  sourceLink.target = "_blank";
}

function chooseFirstItemForScale() {
  const boundary = getBoundary("freshwater");
  const items = getVisibleItems(boundary);
  selectedBoundaryId = "freshwater";
  selectedItemId = items[0]?.id || null;

  if (selectedItemId) {
    selectItem("freshwater", selectedItemId);
  } else {
    selectBoundary("freshwater");
  }
}

function resetPanel() {
  scaleSelect.value = "global";
  chooseFirstItemForScale();
}

scaleSelect.addEventListener("change", chooseFirstItemForScale);
resetButton.addEventListener("click", resetPanel);

chooseFirstItemForScale();
