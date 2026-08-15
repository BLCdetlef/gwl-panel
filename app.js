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

let selectedBoundaryId = "freshwater";
let selectedItemId = null;
let selectedYear = null;
let timeWindow = "data";

function getSelectedScope() {
  return regionSelect.value;
}

function getBoundary(boundaryId) {
  return data.boundaries.find(boundary => boundary.id === boundaryId);
}

function getCurrentItem() {
  const boundary = getBoundary(selectedBoundaryId);
  return boundary?.items?.find(item => item.id === selectedItemId) || null;
}

function getVisibleItems(boundary) {
  if (!boundary?.items) return [];
  return boundary.items.filter(item => item.scope === getSelectedScope());
}

function getTimePoints(item) {
  return Array.isArray(item?.timePoints) ? [...item.timePoints].sort((a, b) => a.year - b.year) : [];
}

function renderRegionPath() {
  const scope = data.scopes[getSelectedScope()];
  regionPath.textContent = scope?.path || scope?.label || "–";
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
  selectedYear = null;
  focusType.textContent = `Grundlage · ${data.scopes[getSelectedScope()]?.label || ""}`;
  focusTitle.textContent = boundary.label;
  focusSummary.textContent = `Für ${data.scopes[getSelectedScope()]?.label || "diese Ebene"} ist in diesem Prototyp noch keine passende Messreihe hinterlegt. Die räumliche Ebene bleibt trotzdem Teil der späteren Struktur.`;
  setDetails(null);
  renderTime(null);
  renderHealth(null);
  renderBoundaries();
}

function selectItem(boundaryId, itemId) {
  selectedBoundaryId = boundaryId;
  selectedItemId = itemId;

  const boundary = getBoundary(boundaryId);
  const item = boundary.items.find(entry => entry.id === itemId);
  if (!item) return;

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
  renderBoundaries();
}

function mergeItemAndPoint(item, point) {
  return point ? { ...item, ...point, health: point.health || item.health } : item;
}

function setLink(label, url) {
  sourceLink.textContent = label || "–";
  if (url) {
    sourceLink.href = url;
    sourceLink.target = "_blank";
  } else {
    sourceLink.removeAttribute("href");
    sourceLink.removeAttribute("target");
  }
}

function setDetails(item, point = null, noMeasurementYear = null) {
  if (!item) {
    metricValue.textContent = "–";
    referenceValue.textContent = "–";
    periodValue.textContent = "–";
    uncertaintyValue.textContent = "–";
    findingText.textContent = "–";
    effectPath.textContent = "–";
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
    timeSlider.disabled = true;
    timeSlider.min = "0";
    timeSlider.max = "1";
    timeSlider.value = "0";
    timeReadout.textContent = item?.period || "–";
    timeStatus.textContent = "Für diese Messreihe ist noch keine punktweise Zeitnavigation hinterlegt.";
    return;
  }

  let min;
  let max;
  if (timeWindow === "blc") {
    min = blc.min;
    max = blc.max;
  } else {
    min = Math.min(...points.map(point => point.year));
    max = Math.max(...points.map(point => point.year));
  }

  const onlyOnePoint = min === max;
  if (onlyOnePoint) {
    min -= 1;
    max += 1;
  }

  timeSlider.disabled = onlyOnePoint && timeWindow === "data";
  timeSlider.min = String(min);
  timeSlider.max = String(max);
  timeSlider.step = "1";

  const fallbackYear = points[points.length - 1].year;
  if (selectedYear === null) selectedYear = fallbackYear;
  selectedYear = Math.min(max, Math.max(min, selectedYear));
  timeSlider.value = String(selectedYear);
  timeReadout.textContent = String(selectedYear);

  points
    .filter(point => point.year >= min && point.year <= max)
    .forEach(point => {
      const marker = document.createElement("span");
      marker.className = "time-marker";
      marker.textContent = String(point.year);
      const pos = ((point.year - min) / (max - min)) * 100;
      marker.style.left = `${pos}%`;
      timeMarkers.appendChild(marker);
    });

  const exact = points.find(point => point.year === selectedYear);
  if (exact) {
    timeStatus.textContent = `${exact.label || "Messpunkt"}. Markierte Jahre sind tatsächlich hinterlegte Messzeitpunkte.`;
  } else if (timeWindow === "blc") {
    timeStatus.textContent = "BLC-Zeitfenster 1700–2100. Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
  } else {
    timeStatus.textContent = "Nur markierte Jahre sind in dieser Messreihe belegt; Zwischenwerte werden nicht interpoliert.";
  }
}

function selectYear(year) {
  const item = getCurrentItem();
  if (!item) return;

  selectedYear = year;
  const points = getTimePoints(item);
  const point = points.find(entry => entry.year === year) || null;
  timeReadout.textContent = String(year);

  if (point) {
    setDetails(item, point);
    renderHealth(point.health || item.health || null);
    timeStatus.textContent = `${point.label || "Messpunkt"}. Dieser Zeitpunkt ist im Datensatz belegt.`;
  } else {
    setDetails(item, null, year);
    renderHealth(null);
    timeStatus.textContent = `Für ${year} ist kein Messpunkt hinterlegt. Keine Interpolation.`;
  }
}

function setTimeWindow(nextWindow) {
  const item = getCurrentItem();
  if (!item) return;
  timeWindow = nextWindow;
  const points = getTimePoints(item);
  if (points.length) selectedYear = points[points.length - 1].year;
  renderTime(item);
  selectYear(selectedYear);
}

function resetHealthShapes() {
  document.querySelectorAll(".organ-target").forEach(target => {
    target.classList.remove("is-active", "is-unquantified", "is-quantified");
    target.querySelectorAll(".organ-shape").forEach(shape => {
      shape.style.removeProperty("fill");
    });
  });
}

function renderHealth(health) {
  resetHealthShapes();
  const impacts = health?.impacts || [];

  if (!impacts.length) {
    organReadout.textContent = "Keine lokal belegte Organwirkung für die aktuelle Auswahl.";
    return;
  }

  const texts = [];
  impacts.forEach(impact => {
    const target = document.getElementById(`organ-${impact.organ}`);
    if (!target) return;
    target.classList.add("is-active");

    if (typeof impact.functionLoss === "number") {
      const loss = Math.max(0, Math.min(100, impact.functionLoss));
      const shade = Math.round(255 * (1 - loss / 100));
      target.classList.add("is-quantified");
      target.querySelectorAll(".organ-shape").forEach(shape => {
        shape.style.fill = `rgb(${shade}, ${shade}, ${shade})`;
      });
      texts.push(`${impact.label}: ${loss} % Funktionsverlust${impact.prevalence ? ` · ${impact.prevalence}` : ""}.`);
    } else {
      target.classList.add("is-unquantified");
      texts.push(`${impact.label}: ${impact.prevalence || "Schädigung lokal belegt"}. ${impact.note || "Der Funktionsverlust ist nicht als 0–100-%-Wert quantifiziert."}`);
    }
  });

  organReadout.textContent = texts.join(" ");
}

function chooseFirstItemForScope() {
  renderRegionPath();
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
  regionSelect.value = "global";
  timeWindow = "data";
  chooseFirstItemForScope();
}

regionSelect.addEventListener("change", chooseFirstItemForScope);
resetButton.addEventListener("click", resetPanel);
dataWindowButton.addEventListener("click", () => setTimeWindow("data"));
blcWindowButton.addEventListener("click", () => setTimeWindow("blc"));
timeSlider.addEventListener("input", event => selectYear(Number(event.target.value)));

chooseFirstItemForScope();
