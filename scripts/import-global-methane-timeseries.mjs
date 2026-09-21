import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const outputPath = path.join(projectRoot, "data", "knowledge", "gwl_climate_methane_global_v0.1.json");
const noaaDataUrl = "https://gml.noaa.gov/webdata/ccgg/trends/ch4/ch4_annmean_gl.csv";
const noaaPageUrl = "https://gml.noaa.gov/ccgg/trends_ch4/";
const lawDomeDataUrl = "https://www.ncei.noaa.gov/pub/data/paleo/icecore/antarctica/law/law2006-ch4-noaa.txt";
const projectionTableUrl = "https://gmd.copernicus.org/articles/13/3571/2020/gmd-13-3571-2020-t05.xlsx";
const projectionArticleUrl = "https://doi.org/10.5194/gmd-13-3571-2020";

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

const noaaText = await fetchText(noaaDataUrl);
const observations = noaaText.split(/\r?\n/)
  .filter(line => line && !line.startsWith("#") && /^\d{4},/.test(line))
  .map(line => line.split(","))
  .map(([year, mean, uncertainty]) => ({
    year: Number(year),
    value: Number(mean),
    uncertainty: Number(uncertainty)
  }))
  .filter(point => Number.isFinite(point.year) && Number.isFinite(point.value) && point.year <= 2025);

if (observations[0]?.year !== 1984 || observations.at(-1)?.year !== 2025 || observations.length !== 42) {
  throw new Error("Unerwarteter NOAA-CH4-Jahresdatenausschnitt.");
}

const lawDomeText = await fetchText(lawDomeDataUrl);
const reconstructionCandidates = lawDomeText.split(/\r?\n/)
  .filter(line => line && !line.startsWith("#") && !line.startsWith("sample"))
  .map(line => line.split("\t"))
  .map(([sample, age, originalScale, noaa04]) => ({
    sample: sample?.trim(),
    year: Number(age),
    originalScale: Number(originalScale),
    value: Number(noaa04)
  }))
  .filter(point => point.sample && point.sample !== "CAPE GRIM"
    && point.year >= 1700 && point.year < 1983 && Number.isFinite(point.value));
const reconstructionByYear = new Map();
for (const point of reconstructionCandidates) {
  if (!reconstructionByYear.has(point.year)) reconstructionByYear.set(point.year, point);
}
const reconstruction = [...reconstructionByYear.values()].sort((a, b) => a.year - b.year);

if (reconstruction.length < 20 || reconstruction[0]?.year > 1750 || reconstruction.at(-1)?.year < 1950) {
  throw new Error("Unerwarteter Law-Dome-CH4-Datenausschnitt.");
}

// Verifizierter Auszug aus Tabelle 5 von Meinshausen et al. (2020):
// globale Jahresmittel der CH4-Oberflächenmolenfraktion in ppb.
const scenarios = {
  ssp119: [[2025, 1875.2], [2050, 1427.9], [2075, 1184.3], [2100, 1036.4]],
  ssp245: [[2025, 1960.7], [2050, 2020.2], [2075, 1815.7], [2100, 1683.2]],
  ssp370: [[2025, 2006.5], [2050, 2472.0], [2075, 2934.1], [2100, 3372.2]]
};

const de = (value, digits = 1) => Number(value).toLocaleString("de-DE", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});
const latest = observations.at(-1);
const earliest = reconstruction[0];

const payload = {
  format: "gwl-knowledge-network-v1.3",
  version: "0.1",
  topic: "Klimawandel / atmosphärische Methankonzentration",
  status: "reviewed",
  schemaRef: "data/schema/node-level-types-v1.3-draft.json",
  entry: {
    systemBoundary: "Planetare Grenzen",
    domainComponent: "Klimawandel",
    subComponent: "Atmosphärisches Methan",
    contributionRole: "deepening_without_organ",
    effectFocus: "Atmosphärische Methankonzentration mit Rekonstruktion, globaler Beobachtung und methanspezifischen SSP-Projektionen"
  },
  corePrinciples: [
    "Methan ist ein wichtiger Klimatreiber, aber keine der beiden Kontrollvariablen der planetaren Grenze Klimawandel.",
    "Law-Dome-Rekonstruktion, globales NOAA-Mittel und SSP-Projektionen bleiben als methodisch getrennte Segmente sichtbar.",
    "Alle Konzentrationen werden unverändert in ppb wiedergegeben; es wird nicht zwischen den Quellwerten interpoliert.",
    "Die SSP-Pfade sind bedingte Szenarien und keine Vorhersagen. SSP3-7.0 bildet den höchsten Methanpfad der drei ausgewählten Szenarien."
  ],
  nodes: [
    { id: "pb_climate_change", type: "domain_component", label: "Klimawandel" },
    { id: "state_atmospheric_methane", type: "socio_technical_state", label: "Atmosphärische Methankonzentration" }
  ],
  edges: [
    { from: "pb_climate_change", to: "state_atmospheric_methane", relationType: "contains_deepening", evidenceStatus: "strong" }
  ],
  studyEvidence: [
    {
      id: "global_methane_reconstruction_observation_projection",
      sourceRefs: ["src_law_dome_ch4", "src_noaa_global_ch4", "src_meinshausen_ssp_ch4"],
      design: "Zusammenstellung historischer Law-Dome-Luftproben, global gemittelter NOAA-Beobachtungen und modellierter SSP-Konzentrationspfade.",
      finding: `Das globale NOAA-Jahresmittel liegt ${latest.year} bei ${de(latest.value, 2)} ppb; vorindustrielle Law-Dome-Proben lagen in der Größenordnung von 700 ppb.`,
      relationType: "assessed_atmospheric_methane_change",
      evidenceStatus: "strong"
    }
  ],
  measurements: [
    {
      id: "global_methane_current_concentration",
      node: "state_atmospheric_methane",
      geography: "Global",
      period: String(latest.year),
      metric: "Global gemittelte atmosphärische Methankonzentration",
      value: latest.value,
      unit: "ppb",
      display: `${latest.year}: ${de(latest.value, 2)} ppb CH4`,
      uncertainty: `NOAA gibt für das Jahresmittel ${latest.year} eine Unsicherheit von ±${de(latest.uncertainty, 2)} ppb an. Jüngste Werte können durch Qualitätskontrolle geringfügig revidiert werden.`,
      interpretation: "Der Wert ist ein globales Mittel mariner Hintergrundstationen und kein Grenzwert der planetaren Grenzen.",
      sourceRefs: ["src_noaa_global_ch4"],
      displayType: "observed_value"
    }
  ],
  presentation: {
    summaryCardMode: "narrative",
    effectSummary: `Die atmosphärische Methankonzentration ist seit der vorindustriellen Zeit stark gestiegen: Law-Dome-Luftproben lagen in der Größenordnung von 700 ppb, das globale NOAA-Jahresmittel erreichte ${latest.year} ${de(latest.value, 2)} ppb. Methan verstärkt den Strahlungsantrieb, ist aber keine eigene Kontrollvariable der planetaren Grenze. Rekonstruktion, direkte Beobachtung und mögliche Zukunftspfade werden ausschließlich im BLC getrennt dargestellt.`,
    primaryMeasurementId: "global_methane_current_concentration",
    primaryTimeSeriesId: "global_methane_noaa_annual_1984_2025",
    gwlTimeSeriesDisplay: "link_only",
    hideTimeSeriesInKnowledgeView: true,
    hideKnowledgePanelInKnowledgeView: true,
    uncertainty: "Die historischen Werte stammen aus antarktischen Eis- und Firnluftproben; die NOAA-Reihe ist dagegen ein global berechnetes Mittel. Beide Segmente werden nicht zu einer homogenen Messreihe umgedeutet. SSP-Werte sind modellierte Szenarien."
  },
  pathways: [
    {
      id: "methane_to_climate_forcing",
      label: "Methanquellen → atmosphärische Konzentration → Strahlungsantrieb → Erwärmung",
      mechanism: "Emissionen aus menschlichen und natürlichen Quellen erhöhen zusammen mit atmosphärischen Senken die Methankonzentration; Methan absorbiert Wärmestrahlung und beeinflusst zusätzlich Ozon und stratosphärischen Wasserdampf.",
      evidenceStatus: "strong",
      caution: "Die Konzentrationsreihe allein trennt anthropogene und natürliche Quellen nicht und erlaubt keine direkte Zuordnung einzelner Gesundheitsfolgen."
    }
  ],
  sources: [
    {
      id: "src_noaa_global_ch4",
      title: "Trends in globally-averaged CH4",
      authors: "Lan, Thoning und Dlugokencky",
      publisher: "NOAA Global Monitoring Laboratory",
      year: 2026,
      type: "official_monitoring_dataset",
      url: noaaPageUrl,
      doi: "10.15138/P8XG-AA10",
      accessed: "2026-09-21",
      access: "open_data"
    },
    {
      id: "src_law_dome_ch4",
      title: "Law Dome Ice Core 2000-Year CO2, CH4, and N2O Data",
      authors: "MacFarling Meure et al.",
      publisher: "NOAA/NCEI World Data Service for Paleoclimatology",
      year: 2006,
      type: "official_paleoclimate_dataset",
      url: lawDomeDataUrl,
      doi: "10.25921/g6kd-k189",
      accessed: "2026-09-21",
      access: "open_data"
    },
    {
      id: "src_meinshausen_ssp_ch4",
      title: "The shared socio-economic pathway (SSP) greenhouse gas concentrations and their extensions to 2500",
      authors: "Meinshausen et al.",
      publisher: "Geoscientific Model Development",
      year: 2020,
      type: "peer_reviewed_publication",
      url: projectionArticleUrl,
      doi: "10.5194/gmd-13-3571-2020",
      accessed: "2026-09-21",
      access: "open_full_text"
    }
  ],
  navigationRule: { group: "Klimawandel", item: "Atmosphärisches Methan", type: "component" },
  timeSeries: [
    {
      id: "global_methane_noaa_annual_1984_2025",
      label: "Atmosphärisches Methan · globale NOAA-Beobachtung",
      metric: "Global gemittelte atmosphärische Methankonzentration",
      unit: "ppb",
      geography: "Global",
      dataNature: "observed",
      worseningDirection: "increase",
      dataStartYear: observations[0].year,
      dataEndYear: latest.year,
      reference: { type: "none", display: "Kein eigener Grenzwert im Modell der planetaren Grenzen" },
      sourceRefs: ["src_noaa_global_ch4"],
      finding: `Das globale Jahresmittel stieg von ${de(observations[0].value, 2)} ppb im Jahr ${observations[0].year} auf ${de(latest.value, 2)} ppb im Jahr ${latest.year}.`,
      methodNote: "NOAA glättet die Stationsreihen, bildet zu 48 Zeitpunkten pro Jahr einen Breitenquerschnitt und berechnet daraus flächengewichtete globale Mittelwerte.",
      uncertainty: "Die Stationsabdeckung und analytische Unsicherheit werden per Bootstrap und Monte Carlo bewertet; die jüngsten Werte können revidiert werden.",
      provenance: {
        sourceFile: "ch4_annmean_gl.csv",
        sourceUrl: noaaDataUrl,
        locator: `Datenzeilen ${observations[0].year}–${latest.year}; Spalten year, mean und uncertainty.`,
        fields: ["year → Jahr", "mean → globales Jahresmittel in ppb", "uncertainty → 1-Sigma-Unsicherheit in ppb"],
        extraction: `Übernommen wurden alle ${observations.length} veröffentlichten Jahresmittel von ${observations[0].year} bis ${latest.year}.`,
        transformation: "Keine Werttransformation und keine Interpolation; Dezimalpunkte werden nur für die deutsche Anzeige formatiert."
      },
      historicalSegments: [
        {
          id: "law_dome_methane_samples_1700_1982",
          label: "Law-Dome-Rekonstruktion · Eis- und Firnluftproben",
          period: `${Math.ceil(earliest.year)}–${Math.floor(reconstruction.at(-1).year)}`,
          method: "Direkte Analyse eingeschlossener Luft aus Law-Dome-Eisbohrkernen und Firn; Verwendung der auf NOAA04 skalierten CH4-Spalte.",
          uncertainty: "Messpräzision 4,1 ppb für Eisproben und 2 ppb für Firnluft; die Luftalter sind je nach Kern über mehrere Jahre verteilt und datierungsunsicher.",
          sourceRefs: ["src_law_dome_ch4"],
          provenance: {
            sourceFile: "law2006-ch4-noaa.txt",
            sourceUrl: lawDomeDataUrl,
            locator: "Nicht kommentierte Datenzeilen; sample ungleich CAPE GRIM; age_CE 1700 bis kleiner 1983; Spalte CH4_NOAA04.",
            fields: ["sample → Probenort oder Kern", "age_CE → Gasalter in Jahren CE", "CH4_NOAA04 → Methankonzentration in ppb auf NOAA04-Skala"],
            extraction: `Übernommen wurden ${reconstruction.length} veröffentlichte Eis- und Firnluftwerte; Cape-Grim-Instrumentenwerte wurden ausgeschlossen. Bei identischem Gasalter bleibt die zuerst gelistete Probe erhalten.`,
            transformation: "Keine Mittelung, keine Kalibrierung zwischen Segmenten und keine Interpolation; die ausgewählten veröffentlichten Dezimaljahre und NOAA04-Werte bleiben erhalten."
          },
          points: reconstruction.map(point => ({
            year: point.year,
            value: point.value,
            display: `${de(point.year, 1)} · ${de(point.value, 1)} ppb · Law Dome · rekonstruiert`,
            finding: `${point.sample}, Gasalter ${de(point.year, 1)}: ${de(point.value, 1)} ppb CH4 auf NOAA04-Skala.`,
            uncertainty: "Eis- und Firnluftwerte besitzen eine vom Kern abhängige Altersverteilung; kein globales Jahresmittel.",
            sourceRefs: ["src_law_dome_ch4"]
          }))
        }
      ],
      methodBreaks: [{ year: 1984, label: "Beginn des globalen NOAA-Jahresmittels" }],
      points: observations.map(point => ({
        year: point.year,
        value: point.value,
        display: `${point.year} · ${de(point.value, 2)} ppb · NOAA-Messreihe · beobachtet`,
        finding: `${point.year}: globales NOAA-Jahresmittel ${de(point.value, 2)} ppb CH4.`,
        uncertainty: `NOAA-Unsicherheit ±${de(point.uncertainty, 2)} ppb.`,
        sourceRefs: ["src_noaa_global_ch4"]
      }))
    }
  ],
  projectionAssessment: {
    grade: "robust_scenario_projection",
    method: "MAGICC7-Konzentrationspfade aus harmonisierten SSP-Emissionen; globale Jahresmittel der Oberflächenmolenfraktion.",
    scope: "Drei methanspezifisch ausgewählte Pfade; SSP3-7.0 statt SSP5-8.5 bildet den höchsten CH4-Pfad. Szenarien sind keine Prognosen."
  },
  projectionSeries: Object.entries(scenarios).map(([key, rows]) => {
    const labels = {
      ssp119: ["SSP1-1.9", "SSP1-1.9 · starke Methanminderung"],
      ssp245: ["SSP2-4.5", "SSP2-4.5 · mittlerer Methanpfad"],
      ssp370: ["SSP3-7.0", "SSP3-7.0 · hoher Methanpfad"]
    };
    const [scenario, scenarioLabel] = labels[key];
    return {
      id: `global_methane_${key}`,
      observedSeriesId: "global_methane_noaa_annual_1984_2025",
      scenario,
      scenarioLabel,
      period: "2025–2100",
      unit: "ppb",
      method: "MAGICC7-Projektion der global gemittelten CH4-Oberflächenmolenfraktion aus dem jeweiligen SSP-Emissionspfad.",
      uncertainty: "Bedingter Konzentrationspfad ohne Wahrscheinlichkeitsaussage; die Szenarien beginnen 2015 und können vom später beobachteten NOAA-Wert abweichen.",
      sourceRefs: ["src_meinshausen_ssp_ch4"],
      provenance: {
        sourceFile: "gmd-13-3571-2020-t05.xlsx",
        sourceUrl: projectionTableUrl,
        locator: `Worksheet 1; Block ${scenario}; Zeile CH4 / ppb / GL; Spalten 2025, 2050, 2075 und 2100.`,
        fields: ["Spaltenkopf → Jahr", "CH4 / ppb / GL → globale mittlere Methankonzentration"],
        extraction: "Übernommen wurden die vier in Tabelle 5 veröffentlichten Werte von 2025 bis 2100.",
        transformation: "Keine Werttransformation und keine Interpolation; Auswahl der globalen GL-Zeile."
      },
      points: rows.map(([year, value]) => ({
        year,
        value,
        display: `${year} · ${de(value, 1)} ppb · ${scenario} · modelliert`,
        finding: `${year}: ${de(value, 1)} ppb CH4 im globalen ${scenario}-Konzentrationspfad.`,
        uncertainty: "Bedingtes SSP-Szenario; keine Prognose und kein Konfidenzintervall.",
        sourceRefs: ["src_meinshausen_ssp_ch4"]
      }))
    };
  })
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Methanreihe geschrieben: ${observations.length} Beobachtungsjahre, ${reconstruction.length} Rekonstruktionswerte, ${Object.keys(scenarios).length} Projektionen.`);
