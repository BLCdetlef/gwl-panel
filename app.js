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
const boundaryView = document.getElementById("boundaryView");
const organDetailView = document.getElementById("organDetailView");
const backToBoundaryButton = document.getElementById("backToBoundaryButton");
const organDetailTitle = document.getElementById("organDetailTitle");
const organDetailSvg = document.getElementById("organDetailSvg");
const organDetailFinding = document.getElementById("organDetailFinding");
const organDetailNote = document.getElementById("organDetailNote");
const organDetailMain = document.getElementById("organDetailMain");

let selectedBoundaryId = "freshwater";
let selectedItemId = null;
let selectedYear = null;
let timeWindow = "data";
let selectedOrganId = null;
let currentHealth = null;

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
  return item?.timePoints ? [...item.timePoints].sort((a, b) => a.year - b.year) : [];
}

function renderRegionPath() {
  const scope = data.scopes[getSelectedScope()];
  regionPath.textContent = scope?.path || scope?.label || "Global";
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
      marker.style.left = `${((point.year - min) / (max - min)) * 100}%`;
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

const ORGAN_UI = {
  brain: { label: "Gehirn & Nerven", layout: "stack", svg: `<path class="detail-fill" d="M70 118 C54 103 61 80 81 75 C83 53 108 43 126 54 C143 37 174 48 177 70 C198 74 208 98 194 113 C203 135 185 157 164 155 C151 173 119 172 108 155 C87 161 65 144 70 118 Z"/><path class="detail-soft" d="M103 62 C91 82 94 111 108 126 M129 55 C124 81 126 118 132 149 M155 59 C171 79 170 108 156 129"/>` },
  eyes: { label: "Augen", layout: "stack", svg: `<path class="detail-fill" d="M35 114 C62 80 102 80 129 114 C102 148 62 148 35 114 Z"/><circle class="detail-fill" cx="82" cy="114" r="20"/><circle cx="82" cy="114" r="7" fill="#333"/><path class="detail-fill" d="M131 114 C158 80 198 80 225 114 C198 148 158 148 131 114 Z"/><circle class="detail-fill" cx="178" cy="114" r="20"/><circle cx="178" cy="114" r="7" fill="#333"/>` },
  teeth: { label: "Zähne", layout: "stack", svg: `<path class="detail-fill" d="M65 63 C86 48 111 45 130 55 C149 45 174 48 195 63 C194 92 183 119 166 145 C157 158 145 161 130 149 C115 161 103 158 94 145 C77 119 66 92 65 63 Z"/><path class="detail-line" d="M81 73 C111 88 149 88 179 73 M94 91 L98 133 M116 94 L117 143 M139 94 L139 143 M162 91 L157 133"/>` },
  lungs: { label: "Lunge", layout: "side", svg: `<path class="detail-fill" d="M121 62 C88 57 63 86 59 127 C55 171 75 199 112 193 C123 169 127 127 121 62 Z"/><path class="detail-fill" d="M139 62 C172 57 197 86 201 127 C205 171 185 199 148 193 C137 169 133 127 139 62 Z"/><path class="detail-line" d="M130 35 L130 146 M130 66 C112 73 99 89 94 110 M130 66 C148 73 161 89 166 110"/>` },
  heart: { label: "Herz & Kreislauf", layout: "side", svg: `<path class="detail-fill" d="M132 82 C146 53 184 60 187 93 C190 130 164 159 128 188 C91 158 68 130 72 96 C76 64 115 56 132 82 Z"/><path class="detail-line" d="M134 78 C144 58 154 44 170 34 M123 78 C114 61 103 48 89 40 M128 188 C131 151 136 119 151 93"/><path class="detail-soft" d="M102 90 C111 103 121 111 132 117 C144 108 153 96 160 82"/>` },
  liver: { label: "Leber", layout: "side", svg: `<path class="detail-fill" d="M45 95 C73 61 125 53 180 69 C203 76 220 92 219 113 C217 147 177 167 125 161 C92 157 63 144 46 122 C40 114 40 104 45 95 Z"/><path class="detail-soft" d="M142 71 C139 99 142 130 153 155 M94 77 C104 95 112 119 112 153"/>` },
  kidneys: { label: "Nieren", layout: "side", svg: `<path class="detail-fill" d="M86 68 C58 61 43 89 49 122 C55 156 81 169 103 147 C118 127 118 83 86 68 Z"/><path class="detail-fill" d="M174 68 C202 61 217 89 211 122 C205 156 179 169 157 147 C142 127 142 83 174 68 Z"/><path class="detail-line" d="M130 52 L130 171 M104 118 C117 117 124 123 130 132 M156 118 C143 117 136 123 130 132"/>` },
  gut: { label: "Verdauung", layout: "side", svg: `<path class="detail-fill" d="M75 58 C49 78 52 109 75 119 C52 137 56 166 84 174 C78 199 101 215 124 200 C141 222 174 209 173 184 C203 180 208 147 183 135 C205 112 191 79 165 82 C151 55 103 42 75 58 Z"/><path class="detail-line" d="M79 86 C118 69 160 88 153 109 C147 126 110 122 101 144 C94 162 124 177 157 163 M91 190 C112 171 141 172 162 191"/>` },
  femaleRepro: { label: "Weibliche Geschlechtsorgane", layout: "stack", svg: `<path class="detail-fill" d="M111 96 C105 72 87 61 67 65 C47 69 37 84 40 100 C44 117 61 127 80 123 C96 120 106 108 111 96 Z"/><path class="detail-fill" d="M149 96 C155 72 173 61 193 65 C213 69 223 84 220 100 C216 117 199 127 180 123 C164 120 154 108 149 96 Z"/><path class="detail-fill" d="M111 96 C111 124 116 152 130 174 C144 152 149 124 149 96 C138 89 122 89 111 96 Z"/><path class="detail-line" d="M111 96 C91 94 78 85 69 70 M149 96 C169 94 182 85 191 70 M130 174 L130 204"/>` },
  maleRepro: { label: "Männliche Geschlechtsorgane", layout: "stack", svg: `<ellipse class="detail-fill" cx="99" cy="153" rx="29" ry="38"/><ellipse class="detail-fill" cx="161" cy="153" rx="29" ry="38"/><path class="detail-fill" d="M106 91 C106 70 118 56 130 56 C142 56 154 70 154 91 C154 112 143 124 130 124 C117 124 106 112 106 91 Z"/><path class="detail-line" d="M130 124 L130 204 M99 115 C99 87 112 72 130 72 M161 115 C161 87 148 72 130 72"/>` },
  skin: { label: "Haut", layout: "stack", svg: `<path class="detail-fill" d="M40 62 H220 V180 H40 Z"/><path class="detail-line" d="M40 86 C70 74 91 98 120 86 C151 73 175 99 220 82 M40 116 C82 102 114 127 150 111 C177 100 198 116 220 110 M40 149 C78 134 110 159 145 144 C171 133 199 145 220 141"/><path class="detail-soft" d="M92 83 C92 112 80 130 73 161 M158 84 C160 111 174 130 181 160"/>` },
  bloodLymph: { label: "Blut- & Lymphsystem", layout: "stack", svg: `<path class="detail-line" d="M130 32 C126 70 129 104 130 135 C131 167 130 194 130 210 M130 75 C105 82 87 101 75 125 M130 75 C155 82 173 101 185 125 M130 123 C104 137 90 161 82 188 M130 123 C156 137 170 161 178 188"/><circle class="detail-fill" cx="130" cy="32" r="10"/><circle class="detail-fill" cx="75" cy="125" r="8"/><circle class="detail-fill" cx="185" cy="125" r="8"/><circle class="detail-fill" cx="82" cy="188" r="8"/><circle class="detail-fill" cx="178" cy="188" r="8"/>` },
  skeleton: { label: "Skelett / Bewegungsapparat", layout: "side", svg: `<circle class="detail-fill" cx="130" cy="32" r="18"/><path class="detail-line" d="M130 50 L130 136 M130 66 C106 67 90 78 80 96 M130 66 C154 67 170 78 180 96 M130 79 C110 82 99 92 94 105 M130 79 C150 82 161 92 166 105 M130 94 C111 98 102 107 99 118 M130 94 C149 98 158 107 161 118 M130 136 C116 142 108 151 105 164 M130 136 C144 142 152 151 155 164 M107 164 L98 219 M153 164 L162 219 M80 96 L63 167 M180 96 L197 167 M98 219 L92 227 M162 219 L168 227"/><path class="detail-soft" d="M105 164 C119 174 141 174 155 164"/>` }
};

function normalizeImpactOrgan(id) {
  if (id === "reproduction") return "femaleRepro";
  return id;
}

function getImpactForOrgan(organId) {
  const impacts = currentHealth?.impacts || [];
  return impacts.find(impact => normalizeImpactOrgan(impact.organ) === organId) || null;
}

function showBoundaryView() {
  selectedOrganId = null;
  boundaryView.hidden = false;
  organDetailView.hidden = true;
  document.querySelectorAll(".body-hotspot").forEach(node => node.classList.remove("is-selected"));
}

function showOrganDetail(organId) {
  const ui = ORGAN_UI[organId];
  if (!ui) return;
  selectedOrganId = organId;
  const impact = getImpactForOrgan(organId);

  boundaryView.hidden = true;
  organDetailView.hidden = false;
  organDetailTitle.textContent = ui.label;
  organDetailSvg.innerHTML = ui.svg;
  organDetailMain.classList.toggle("side-by-side", ui.layout === "side");

  if (impact) {
    organDetailFinding.textContent = impact.prevalence || "Für dieses Organ ist in der aktuellen Auswahl eine Schädigung belegt.";
    organDetailNote.textContent = impact.note || "Der Befund ist lokal belegt; die genaue Funktionsminderung ist nicht als 0–100-%-Wert quantifiziert.";
  } else {
    organDetailFinding.textContent = "Für die aktuelle Region, Messreihe und Zeit ist kein lokaler Befund zu diesem Organ hinterlegt.";
    organDetailNote.textContent = "Das Organ bleibt dennoch direkt auswählbar. Sobald eine belastbare Wirkungskette vorliegt, kann der Befund hier ergänzt werden.";
  }

  document.querySelectorAll(".body-hotspot").forEach(node => {
    node.classList.toggle("is-selected", node.dataset.organ === organId);
  });
}

function resetHealthShapes() {
  document.querySelectorAll(".body-hotspot").forEach(target => {
    target.classList.remove("is-unquantified", "is-quantified", "is-relevant");
    target.style.removeProperty("--hotspot-fill");
  });
}

function renderHealth(health) {
  currentHealth = health;
  resetHealthShapes();
  const impacts = health?.impacts || [];

  if (!impacts.length) {
    organReadout.textContent = "Keine lokal belegte Organwirkung für die aktuelle Auswahl.";
    if (selectedOrganId) showOrganDetail(selectedOrganId);
    return;
  }

  const texts = [];
  impacts.forEach(impact => {
    const organId = normalizeImpactOrgan(impact.organ);
    const target = document.querySelector(`.body-hotspot[data-organ="${organId}"]`);
    if (!target) return;
    target.classList.add("is-relevant");

    if (typeof impact.functionLoss === "number") {
      const loss = Math.max(0, Math.min(100, impact.functionLoss));
      const shade = Math.round(255 * (1 - loss / 100));
      target.classList.add("is-quantified");
      target.style.setProperty("--hotspot-fill", `rgb(${shade}, ${shade}, ${shade})`);
      texts.push(`${impact.label}: ${loss} % Funktionsverlust${impact.prevalence ? ` · ${impact.prevalence}` : ""}.`);
    } else {
      target.classList.add("is-unquantified");
      texts.push(`${impact.label}: ${impact.prevalence || "Schädigung lokal belegt"}.`);
    }
  });

  organReadout.textContent = texts.join(" ");
  if (selectedOrganId) showOrganDetail(selectedOrganId);
}

function bindBodymap() {
  document.querySelectorAll(".body-hotspot").forEach(target => {
    const activate = () => showOrganDetail(target.dataset.organ);
    target.addEventListener("click", activate);
    target.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

function selectBoundary(boundaryId) {
  showBoundaryView();
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
  showBoundaryView();
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

function chooseFirstItemForScope() {
  showBoundaryView();
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
backToBoundaryButton.addEventListener("click", showBoundaryView);
bindBodymap();

chooseFirstItemForScope();
