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
let selectedItemId = null;
let selectedYear = null;
let timeWindow = "data";
let currentHealth = null;
let selectedOrganId = null;

const HOTSPOTS = {
  brain: { label: "Gehirn & Nerven", x: 58, y: 6.5, side: "right" },
  eyes: { label: "Augen", x: 57, y: 12.8, side: "right" },
  teeth: { label: "Zähne", x: 54, y: 17.2, side: "right" },
  lungs: { label: "Lunge", x: 42, y: 27.4, side: "left" },
  heart: { label: "Herz & Kreislauf", x: 53, y: 30.2, side: "right" },
  liver: { label: "Leber", x: 41, y: 37.2, side: "left" },
  kidneys: { label: "Niere", x: 42, y: 46.5, side: "left" },
  gut: { label: "Verdauung", x: 58, y: 46.0, side: "right" },
  urinary: { label: "Harnwege", x: 51, y: 56.2, side: "right" },
  femaleRepro: { label: "weibliche Geschlechtsorgane", x: 51, y: 61.8, side: "right" },
  maleRepro: { label: "männliche Geschlechtsorgane", x: 51, y: 67.0, side: "right" },
  skeleton: { label: "Skelett", x: 75.5, y: 37.8, side: "right" },
  musculoskeletal: { label: "Bewegungsapparat", x: 34.2, y: 80.4, side: "left" }
};

const ORGAN_MEDIA = {
  brain: { label: "Gehirn & Nerven", img: "assets/health/organ_brain.png", layout: "side" },
  teeth: { label: "Zähne", img: "assets/health/organ_teeth.png", layout: "stack" },
  gut: { label: "Verdauung", img: "assets/health/organ_digestive.png", layout: "stack" },
  skeleton: { label: "Skelett / Bewegungsapparat", img: "assets/health/organ_skeleton.png", layout: "side" },
  femaleRepro: { label: "weibliche Geschlechtsorgane", img: "assets/health/organ_repro_female.png", layout: "stack" },
  eyes: { label: "Augen", layout: "stack", svg: `<svg viewBox="0 0 260 180" role="img" aria-label="Augen"><ellipse class="detail-fill" cx="130" cy="90" rx="90" ry="42"></ellipse><circle class="detail-fill" cx="130" cy="90" r="28"></circle><circle class="detail-soft" cx="130" cy="90" r="12"></circle><path class="detail-line" d="M40 90 C70 45 108 32 130 32 C152 32 190 45 220 90 C190 135 152 148 130 148 C108 148 70 135 40 90 Z"/></svg>` },
  lungs: { label: "Lunge", layout: "side", svg: `<svg viewBox="0 0 260 220" role="img" aria-label="Lunge"><path class="detail-fill" d="M123 28 C97 39 81 71 77 120 C74 161 88 183 117 191 C128 173 131 149 131 110 C131 63 128 35 123 28 Z"/><path class="detail-fill" d="M137 28 C163 39 179 71 183 120 C186 161 172 183 143 191 C132 173 129 149 129 110 C129 63 132 35 137 28 Z"/><path class="detail-line" d="M130 18 L130 186 M130 52 C108 66 96 84 91 110 M130 52 C152 66 164 84 169 110"/></svg>` },
  heart: { label: "Herz & Kreislauf", layout: "stack", svg: `<svg viewBox="0 0 220 220" role="img" aria-label="Herz"><path class="detail-fill" d="M114 46 C129 20 165 28 168 62 C170 97 144 125 113 160 C82 125 56 100 55 69 C54 36 88 22 104 48 Z"/><path class="detail-line" d="M118 38 C125 24 139 18 151 18 M124 53 C133 61 140 74 141 90"/></svg>` },
  liver: { label: "Leber", layout: "stack", svg: `<svg viewBox="0 0 260 180" role="img" aria-label="Leber"><path class="detail-fill" d="M52 96 C71 55 128 33 190 54 C218 63 230 80 224 105 C213 139 166 154 116 146 C77 139 52 123 52 96 Z"/><path class="detail-soft" d="M110 65 C123 92 117 122 106 144"/></svg>` },
  kidneys: { label: "Nieren", layout: "side", svg: `<svg viewBox="0 0 240 220" role="img" aria-label="Nieren"><path class="detail-fill" d="M79 37 C49 37 30 62 30 94 C30 131 50 166 84 166 C103 166 115 150 115 132 C115 102 112 58 79 37 Z"/><path class="detail-fill" d="M161 37 C191 37 210 62 210 94 C210 131 190 166 156 166 C137 166 125 150 125 132 C125 102 128 58 161 37 Z"/><path class="detail-line" d="M120 49 L120 182"/></svg>` },
  urinary: { label: "Harnwege", layout: "stack", svg: `<svg viewBox="0 0 220 220" role="img" aria-label="Harnwege"><path class="detail-fill" d="M74 26 C52 26 38 41 38 63 C38 84 51 100 70 100 C86 100 96 89 96 72 C96 50 92 34 74 26 Z"/><path class="detail-fill" d="M146 26 C168 26 182 41 182 63 C182 84 169 100 150 100 C134 100 124 89 124 72 C124 50 128 34 146 26 Z"/><path class="detail-fill" d="M77 128 C77 106 143 106 143 128 C143 162 132 190 110 190 C88 190 77 162 77 128 Z"/><path class="detail-line" d="M77 94 L94 128 M143 94 L126 128 M110 190 L110 212"/></svg>` },
  maleRepro: { label: "männliche Geschlechtsorgane", layout: "stack", svg: `<svg viewBox="0 0 220 220" role="img" aria-label="männliche Geschlechtsorgane"><ellipse class="detail-fill" cx="83" cy="155" rx="25" ry="34"/><ellipse class="detail-fill" cx="137" cy="155" rx="25" ry="34"/><path class="detail-fill" d="M88 74 C88 51 98 34 110 34 C122 34 132 51 132 74 C132 95 123 109 110 109 C97 109 88 95 88 74 Z"/><path class="detail-line" d="M110 109 L110 198 M83 120 C83 98 94 82 110 82 M137 120 C137 98 126 82 110 82"/></svg>` },
  musculoskeletal: { label: "Bewegungsapparat", layout: "side", svg: `<svg viewBox="0 0 220 260" role="img" aria-label="Bewegungsapparat"><path class="detail-fill" d="M107 24 C125 24 142 35 150 54 C162 82 156 118 138 140 C129 152 123 172 123 195 C123 218 116 236 107 236 C98 236 91 218 91 195 C91 172 85 152 76 140 C58 118 52 82 64 54 C72 35 89 24 107 24 Z"/><circle class="detail-fill" cx="107" cy="152" r="28"/><path class="detail-line" d="M107 24 L107 236 M78 150 L136 150"/></svg>` }
};

function getSelectedScope() { return regionSelect.value; }
function getBoundary(id) { return data.boundaries.find(boundary => boundary.id === id); }
function getCurrentItem() { const boundary = getBoundary(selectedBoundaryId); return boundary?.items?.find(item => item.id === selectedItemId) || null; }
function getVisibleItems(boundary) { return boundary?.items ? boundary.items.filter(item => item.scope === getSelectedScope()) : []; }
function getTimePoints(item) { return item?.timePoints ? [...item.timePoints].sort((a,b)=>a.year-b.year) : []; }
function renderRegionPath() { const scope = data.scopes[getSelectedScope()]; regionPath.textContent = scope?.path || scope?.label || "Global"; }

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

function normalizeImpactOrgan(id) {
  if (id === "reproduction") return "femaleRepro";
  if (id === "gut") return "gut";
  return id;
}
function getImpactForOrgan(organId) { const impacts = currentHealth?.impacts || []; return impacts.find(impact => normalizeImpactOrgan(impact.organ) === organId) || null; }

function renderHotspots() {
  hotspotLayer.innerHTML = "";
  Object.entries(HOTSPOTS).forEach(([id, def]) => {
    const wrap = document.createElement("div"); wrap.className = `hotspot-group ${def.side === "left" ? "left" : "right"}`;
    wrap.style.left = `${def.x}%`; wrap.style.top = `${def.y}%`;
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "hotspot-dot"; btn.dataset.organ = id; btn.setAttribute("aria-label", def.label);
    btn.addEventListener("click", () => openOrganOverlay(id));
    const label = document.createElement("span"); label.className = "hotspot-label"; label.textContent = def.label;
    wrap.appendChild(btn); wrap.appendChild(label); hotspotLayer.appendChild(wrap);
  });
}

function clearHotspotStates() {
  document.querySelectorAll(".hotspot-dot").forEach(dot => {
    dot.classList.remove("is-selected", "is-unquantified", "is-quantified");
    dot.style.removeProperty("--hotspot-fill");
  });
}

function renderHealth(health) {
  currentHealth = health; clearHotspotStates();
  const impacts = health?.impacts || [];
  if (!impacts.length) {
    organReadout.textContent = "Keine lokal belegte Organwirkung für die aktuelle Auswahl.";
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
      dot.classList.add("is-quantified"); dot.style.setProperty("--hotspot-fill", `rgb(${shade}, ${shade}, ${shade})`);
      texts.push(`${impact.label}: ${loss} % Funktionsverlust${impact.prevalence ? ` · ${impact.prevalence}` : ""}.`);
    } else {
      dot.classList.add("is-unquantified"); texts.push(`${impact.label}: ${impact.prevalence || "Schädigung lokal belegt"}.`);
    }
  });
  organReadout.textContent = texts.join(" ");
  if (selectedOrganId) openOrganOverlay(selectedOrganId, true);
}

function createMediaNode(organId) {
  const media = ORGAN_MEDIA[organId] || { label: HOTSPOTS[organId]?.label || organId, layout: "stack" };
  organOverlayContent.classList.toggle("side-by-side", media.layout === "side");
  if (media.img) {
    const img = document.createElement("img"); img.src = media.img; img.alt = media.label; return img;
  }
  if (media.svg) {
    const holder = document.createElement("div"); holder.innerHTML = media.svg.trim(); return holder.firstChild;
  }
  const fallback = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  fallback.setAttribute("viewBox", "0 0 220 180"); fallback.innerHTML = `<rect x="26" y="26" width="168" height="128" rx="24" class="detail-fill"></rect><path d="M58 90 H162" class="detail-line"></path><path d="M110 58 V122" class="detail-line"></path>`; return fallback;
}

function openOrganOverlay(organId, preserveHidden = false) {
  selectedOrganId = organId;
  const def = HOTSPOTS[organId];
  const impact = getImpactForOrgan(organId);
  organOverlayTitle.textContent = ORGAN_MEDIA[organId]?.label || def?.label || organId;
  organOverlayMedia.innerHTML = ""; organOverlayMedia.appendChild(createMediaNode(organId));
  if (impact) {
    organOverlayFinding.textContent = impact.prevalence || "Für dieses Organ ist in der aktuellen Auswahl eine Schädigung belegt.";
    organOverlayNote.textContent = impact.note || "Der Befund ist lokal belegt; die genaue Funktionsminderung ist nicht als 0–100-%-Wert quantifiziert.";
  } else {
    organOverlayFinding.textContent = "Für die aktuelle Region, Messreihe und Zeit ist noch kein lokaler Befund zu diesem Organ hinterlegt.";
    organOverlayNote.textContent = "Das Organ bleibt dennoch direkt auswählbar. Sobald eine belastbare Wirkungskette vorliegt, kann hier ein konkreter Befund ergänzt werden.";
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

function selectBoundary(boundaryId) {
  selectedBoundaryId = boundaryId;
  const boundary = getBoundary(boundaryId);
  const items = getVisibleItems(boundary);
  closeOrganOverlay();
  closeAllCauseOverlays();
  if (items.length) { selectItem(boundaryId, items[0].id); return; }
  selectedItemId = null; selectedYear = null;
  focusType.textContent = `Grundlage · ${data.scopes[getSelectedScope()]?.label || ""}`;
  focusTitle.textContent = boundary.label;
  focusSummary.textContent = `Für ${data.scopes[getSelectedScope()]?.label || "diese Ebene"} ist in diesem Prototyp noch keine passende Messreihe hinterlegt. Die räumliche Ebene bleibt trotzdem Teil der späteren Struktur.`;
  setDetails(null); renderTime(null); renderHealth(null); renderBoundaries();
}

function selectItem(boundaryId, itemId) {
  closeOrganOverlay();
  closeAllCauseOverlays();
  selectedBoundaryId = boundaryId; selectedItemId = itemId;
  const boundary = getBoundary(boundaryId);
  const item = boundary.items.find(entry => entry.id === itemId); if (!item) return;
  const points = getTimePoints(item); selectedYear = points.length ? points[points.length - 1].year : null; timeWindow = "data";
  focusType.textContent = `${item.type} · ${data.scopes[item.scope]?.label || item.scope}`;
  focusTitle.textContent = `${boundary.label} · ${item.label}`;
  focusSummary.textContent = item.summary;
  const point = points.find(entry => entry.year === selectedYear) || null;
  setDetails(item, point); renderTime(item); renderHealth(point?.health || item.health || null); updateCauseButtons(item, point); renderBoundaries();
}

function selectYear(year) {
  const item = getCurrentItem(); if (!item) return; selectedYear = year;
  const points = getTimePoints(item); const point = points.find(entry => entry.year === year) || null; timeReadout.textContent = String(year);
  if (point) { setDetails(item, point); renderHealth(point.health || item.health || null); updateCauseButtons(item, point); timeStatus.textContent = `${point.label || "Messpunkt"}. Dieser Zeitpunkt ist im Datensatz belegt.`; }
  else { setDetails(item, null, year); renderHealth(null); updateCauseButtons(item, null); timeStatus.textContent = `Für ${year} ist kein Messpunkt hinterlegt. Keine Interpolation.`; }
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
renderHotspots(); chooseFirstItemForScope();
