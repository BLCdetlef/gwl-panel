import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const outputPath = path.join(projectRoot, "data", "knowledge", "gwl_climate_temperature_global_v0.2.json");
const pagesUrl = "https://www.ncei.noaa.gov/pub/data/paleo/pages2k/neukom2019temp/recons/Full_ensemble_median_and_95pct_range.txt";
const hadcrutUrl = "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.1.0.0/analysis/diagnostics/HadCRUT.5.1.0.0.analysis.summary_series.global.annual.csv";

const round = (value, digits = 4) => Number(Number(value).toFixed(digits));
const de = (value, digits = 2) => Number(value).toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function parseHadcrut(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines.shift().split(",").map(value => value.trim());
  const yearIndex = header.indexOf("Time");
  const anomalyIndex = header.indexOf("Anomaly (deg C)");
  const lowerIndex = header.indexOf("Lower confidence limit (2.5%)");
  const upperIndex = header.indexOf("Upper confidence limit (97.5%)");
  if ([yearIndex, anomalyIndex, lowerIndex, upperIndex].some(index => index < 0)) throw new Error("HadCRUT5: erwartete Spalten fehlen.");
  return lines.map(line => line.split(",").map(value => value.trim())).map(fields => ({
    year: Number(fields[yearIndex]),
    value: Number(fields[anomalyIndex]),
    lower: Number(fields[lowerIndex]),
    upper: Number(fields[upperIndex])
  })).filter(row => Number.isInteger(row.year) && row.year <= 2025 && [row.value, row.lower, row.upper].every(Number.isFinite));
}

function parsePages(text) {
  return text.split(/\r?\n/).filter(line => line && !line.startsWith("#")).map(line => line.split(/\t+/)).map(fields => ({
    year: Number(fields[0]),
    value: Number(fields[2]),
    lower: Number(fields[3]),
    upper: Number(fields[4])
  })).filter(row => Number.isInteger(row.year) && [row.value, row.lower, row.upper].every(Number.isFinite));
}

function rebase(rows, baseline) {
  return rows.map(row => ({ ...row, value: row.value - baseline, lower: row.lower - baseline, upper: row.upper - baseline }));
}

function point(row, sourceRef, kind) {
  const value = round(row.value);
  return {
    year: row.year,
    value,
    display: `${value >= 0 ? "+" : ""}${de(value)} °C gegenüber 1850–1900`,
    finding: `${row.year}: ${value >= 0 ? "+" : ""}${de(value)} °C gegenüber dem Mittel 1850–1900 · ${kind}.`,
    uncertainty: `95-%-Bereich ${row.lower >= 0 ? "+" : ""}${de(row.lower)} bis ${row.upper >= 0 ? "+" : ""}${de(row.upper)} °C.`,
    sourceRefs: [sourceRef]
  };
}

const projectionScenarios = [
  {
    id: "global_temperature_ipcc_ssp119",
    scenario: "SSP1-1.9",
    scenarioLabel: "SSP1-1.9 · sehr niedrige Emissionen",
    points: [[2030, 1.5, 1.2, 1.7, "2021–2040"], [2050, 1.6, 1.2, 2.0, "2041–2060"], [2090, 1.4, 1.0, 1.8, "2081–2100"]]
  },
  {
    id: "global_temperature_ipcc_ssp245",
    scenario: "SSP2-4.5",
    scenarioLabel: "SSP2-4.5 · mittlere Emissionen",
    points: [[2030, 1.5, 1.2, 1.8, "2021–2040"], [2050, 2.0, 1.6, 2.5, "2041–2060"], [2090, 2.7, 2.1, 3.5, "2081–2100"]]
  },
  {
    id: "global_temperature_ipcc_ssp585",
    scenario: "SSP5-8.5",
    scenarioLabel: "SSP5-8.5 · sehr hohe Emissionen",
    points: [[2030, 1.6, 1.3, 1.9, "2021–2040"], [2050, 2.4, 1.9, 3.0, "2041–2060"], [2090, 4.4, 3.3, 5.7, "2081–2100"]]
  }
];

const [pagesText, hadcrutCsv] = await Promise.all([fetchText(pagesUrl), fetchText(hadcrutUrl)]);
const pagesRaw = parsePages(pagesText);
const hadcrutRaw = parseHadcrut(hadcrutCsv);
const pagesBaselineRows = pagesRaw.filter(row => row.year >= 1850 && row.year <= 1900);
const hadcrutBaselineRows = hadcrutRaw.filter(row => row.year >= 1850 && row.year <= 1900);
if (pagesBaselineRows.length !== 51 || hadcrutBaselineRows.length !== 51) throw new Error("Bezugsperiode 1850–1900 ist nicht vollständig.");
const pagesBaseline = mean(pagesBaselineRows.map(row => row.value));
const hadcrutBaseline = mean(hadcrutBaselineRows.map(row => row.value));
const reconstruction = rebase(pagesRaw.filter(row => row.year >= 1700 && row.year <= 1849), pagesBaseline);
const observations = rebase(hadcrutRaw.filter(row => row.year >= 1850 && row.year <= 2025), hadcrutBaseline);
const currentThreeYear = mean(observations.filter(row => row.year >= 2023 && row.year <= 2025).map(row => row.value));
const latest = observations.at(-1);

const payload = {
  format: "gwl-knowledge-network-v1.3",
  version: "0.2",
  topic: "Klimawandel / globale Temperaturentwicklung",
  status: "reviewed",
  schemaRef: "data/schema/node-level-types-v1.3-draft.json",
  entry: {
    systemBoundary: "Planetare Grenzen",
    domainComponent: "Klimawandel",
    subComponent: "Globale Temperaturentwicklung",
    contributionRole: "deepening_without_organ",
    effectFocus: "Globale Temperaturänderung gegenüber 1850–1900 mit Rekonstruktion, Beobachtung und IPCC-Projektionen"
  },
  corePrinciples: [
    "Die Temperaturreihe ist eine Vertiefung und keine Kontrollvariable der planetaren Grenze Klimawandel.",
    "Die BLC-Kurve zeigt Temperaturänderungen gegenüber 1850–1900, weil Änderungen belastbarer bestimmbar sind als eine absolute globale Mitteltemperatur.",
    "Rund 15 °C ist nur eine grobe absolute Orientierung; NASA beziffert die Unsicherheit der absoluten globalen Basis auf etwa 0,5 °C.",
    "Rekonstruktion, Beobachtung und Projektionen bleiben als getrennte Segmente mit eigener Herkunft und Methode sichtbar.",
    "Ein einzelnes warmes Kalenderjahr, ein Mehrjahresmittel und das langfristige Erwärmungsniveau sind nicht gleichbedeutend."
  ],
  nodes: [
    { id: "pb_climate_change", type: "domain_component", label: "Klimawandel" },
    { id: "state_global_temperature", type: "socio_technical_state", label: "Globale Temperaturentwicklung" }
  ],
  edges: [
    { from: "pb_climate_change", to: "state_global_temperature", relationType: "contains", evidenceStatus: "strong" }
  ],
  studyEvidence: [
    {
      id: "global_temperature_reconstruction_observation_projection",
      sourceRefs: ["src_pages2k_2019", "src_hadcrut5_5100", "src_ipcc_ar6_spm"],
      design: "Zusammenstellung kompatibel referenzierter globaler Temperaturänderungen aus Proxyrekonstruktion, Beobachtungsanalyse und bewerteten Szenarien.",
      finding: `Das Mittel 2023–2025 liegt in HadCRUT5 bei +${de(currentThreeYear)} °C gegenüber 1850–1900; 2025 allein liegt bei +${de(latest.value)} °C.`,
      relationType: "assessed_global_temperature_change",
      evidenceStatus: "strong"
    }
  ],
  measurements: [
    {
      id: "global_temperature_current_orientation",
      node: "state_global_temperature",
      geography: "Global",
      period: "2023–2025",
      metric: "Globale Temperatur und Erwärmung",
      value: round(currentThreeYear, 2),
      unit: "°C above 1850–1900",
      display: `Absolute Orientierung: ungefähr 14 bis 15 °C; Erwärmung 2023–2025: +${de(currentThreeYear)} °C gegenüber 1850–1900`,
      uncertainty: "Die absolute globale Mitteltemperatur ist nur grob bestimmbar (ungefähr ±0,5 °C); die Temperaturänderung ist wesentlich genauer bestimmbar.",
      interpretation: `Das Dreijahresmittel beschreibt die aktuelle Größenordnung. Der einzelne HadCRUT5-Jahreswert 2025 beträgt +${de(latest.value)} °C und ist nicht mit dem langfristigen Paris-Erwärmungsniveau gleichzusetzen.`,
      sourceRefs: ["src_metoffice_2025_temperature", "src_nasa_absolute_temperature", "src_hadcrut5_5100"],
      displayType: "assessed_value"
    }
  ],
  presentation: {
    summaryCardMode: "narrative",
    effectSummary: `Die absolute globale Mitteltemperatur lässt sich nur grob mit etwa 14 bis 15 °C angeben. Belastbarer ist ihre Veränderung: HadCRUT5 ergibt für 2023–2025 im Mittel +${de(currentThreeYear)} °C gegenüber 1850–1900; 2025 allein lag bei +${de(latest.value)} °C. Rekonstruktion, Beobachtung und mögliche Zukunftspfade werden ausschließlich im BLC als getrennte Segmente gezeigt.`,
    primaryMeasurementId: "global_temperature_current_orientation",
    primaryTimeSeriesId: "global_temperature_hadcrut5_1850_2025",
    gwlTimeSeriesDisplay: "link_only",
    hideTimeSeriesInKnowledgeView: true,
    hideKnowledgePanelInKnowledgeView: true,
    referenceLabel: "Erwärmung gegenüber 1850–1900 · kein planetarer Grenzwert",
    finding: `Die aktuelle Erwärmung liegt in der Größenordnung von 1,5 °C gegenüber 1850–1900; das Dreijahresmittel 2023–2025 beträgt +${de(currentThreeYear)} °C.`,
    effectPath: "Anthropogener Strahlungsantrieb → globale Erwärmung → veränderte Klimabedingungen",
    uncertainty: "Die absolute globale Mitteltemperatur ist methodisch deutlich unsicherer als ihre Änderung. Projektionswerte sind bedingte Szenarien, keine Vorhersagen; Jahreswerte sind kein langfristiges Erwärmungsniveau.",
    statusYear: 2025,
    statusLabel: "2023–2025 · aktuelle Größenordnung"
  },
  pathways: [],
  healthContext: { bodymapStatus: "not_applicable_yet", systemImpacts: [], bodymapRule: "Keinen Organmarker allein aus der globalen Temperaturänderung ableiten." },
  knowledgeGaps: [],
  sources: [
    {
      id: "src_pages2k_2019",
      title: "PAGES2k 2019 Global Common Era Temperature Reconstructions · full ensemble median and 95% range",
      authors: "PAGES 2k Consortium / Neukom et al.",
      publisher: "NOAA/NCEI World Data Service for Paleoclimatology",
      year: 2019,
      type: "peer_reviewed_paleoclimate_reconstruction_dataset",
      url: pagesUrl,
      doi: "10.25921/tkxp-vn12",
      access: "open_data"
    },
    {
      id: "src_hadcrut5_5100",
      title: "HadCRUT.5.1.0.0 analysis summary series · global annual",
      authors: "Met Office Hadley Centre / Climatic Research Unit",
      publisher: "Met Office",
      year: 2026,
      type: "official_observational_dataset",
      url: hadcrutUrl,
      access: "open_data"
    },
    {
      id: "src_ipcc_ar6_spm",
      title: "IPCC AR6 WGI Summary for Policymakers · Table SPM.1",
      authors: "IPCC",
      publisher: "Intergovernmental Panel on Climate Change",
      year: 2021,
      type: "official_assessment",
      url: "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM_final.pdf",
      access: "open_full_text"
    },
    {
      id: "src_nasa_absolute_temperature",
      title: "The Elusive Absolute Surface Air Temperature",
      authors: "NASA Goddard Institute for Space Studies",
      publisher: "NASA GISS",
      year: 2022,
      type: "official_method_explanation",
      url: "https://data.giss.nasa.gov/gistemp/faq/abs_temp.html",
      access: "open_full_text"
    },
    {
      id: "src_metoffice_2025_temperature",
      title: "2025 continues series of world’s three warmest years",
      authors: "Met Office",
      publisher: "Met Office",
      year: 2026,
      type: "official_climate_assessment_update",
      url: "https://www.metoffice.gov.uk/about-us/news-and-media/media-centre/weather-and-climate-news/2026/2025-continues-series-of-worlds-three-warmest-years",
      access: "open_full_text"
    }
  ],
  navigationRule: { group: "Klimawandel", item: "Globale Temperaturentwicklung", type: "component" },
  timeSeries: [
    {
      id: "global_temperature_hadcrut5_1850_2025",
      label: "Globale Temperaturänderung · Beobachtung",
      metric: "Änderung der globalen bodennahen Oberflächentemperatur gegenüber 1850–1900",
      unit: "°C",
      geography: "Global",
      dataNature: "observed",
      worseningDirection: "increase",
      dataStartYear: 1850,
      dataEndYear: 2025,
      reference: { type: "none", display: "Bezugsperiode 1850–1900; kein eigenständiger planetarer Grenzwert" },
      sourceRefs: ["src_hadcrut5_5100", "src_metoffice_2025_temperature"],
      finding: `Das Mittel 2023–2025 beträgt +${de(currentThreeYear)} °C gegenüber 1850–1900; 2025 allein +${de(latest.value)} °C.`,
      methodNote: "HadCRUT5 verbindet Landluft- und Meeresoberflächentemperaturen. Die veröffentlichte Reihe wurde durch Abzug ihres Mittelwerts 1850–1900 auf die vorindustrielle Vergleichsperiode bezogen; keine Interpolation.",
      uncertainty: "95-%-Bereiche stammen aus HadCRUT5 und wurden um denselben konstanten Bezugswert verschoben. Die absolute Globaltemperatur wird nicht als präzise Kurvenachse ausgegeben.",
      contextNotes: [
        {
          id: "absolute_orientation",
          label: "Absolute Orientierung",
          value: "ungefähr 14 bis 15 °C",
          detail: "Die absolute globale Mitteltemperatur liegt grob im Bereich 14–15 °C. NASA weist dafür eine Unsicherheit von ungefähr 0,5 °C aus; deshalb zeigt die Kurve die genauer bestimmbare Änderung.",
          sourceRefs: ["src_nasa_absolute_temperature"]
        },
        {
          id: "current_warming",
          label: "Aktuelle Größenordnung",
          value: `2023–2025: +${de(currentThreeYear)} °C`,
          detail: `Dreijahresmittel gegenüber 1850–1900. Der Jahreswert 2025 beträgt +${de(latest.value)} °C; beides ist nicht mit dem langfristigen Paris-Erwärmungsniveau gleichzusetzen.`,
          sourceRefs: ["src_hadcrut5_5100", "src_metoffice_2025_temperature"]
        }
      ],
      provenance: {
        sourceFile: "HadCRUT.5.1.0.0.analysis.summary_series.global.annual.csv",
        sourceUrl: hadcrutUrl,
        locator: "CSV-Kopfzeile und vollständige Jahreszeilen 1850–2025.",
        fields: ["Time → Jahr", "Anomaly (deg C) → Temperaturänderung", "Lower/Upper confidence limit → 95-%-Bereich"],
        extraction: "Alle 176 vollständigen Jahreswerte 1850–2025 wurden übernommen; das unvollständige Jahr 2026 bleibt ausgeschlossen.",
        transformation: `Von jedem Wert und seinen Grenzen wurde ausschließlich das arithmetische HadCRUT5-Mittel 1850–1900 (${round(hadcrutBaseline, 6)} °C in der ursprünglichen 1961–1990-Anomalieskala) abgezogen. Keine Interpolation.`
      },
      historicalSegments: [
        {
          id: "pages2k_global_temperature_1700_1849",
          label: "Historische Rekonstruktion · PAGES2k",
          period: "1700–1849",
          method: "Median des methodenübergreifenden 7000-Mitglieder-Ensembles der PAGES2k-Rekonstruktionen.",
          uncertainty: "95-%-Bereich des vollständigen Rekonstruktionsensembles; Proxyrekonstruktion, keine direkte Messung.",
          sourceRefs: ["src_pages2k_2019"],
          provenance: {
            sourceFile: "Full_ensemble_median_and_95pct_range.txt",
            sourceUrl: pagesUrl,
            locator: "Jahreszeilen 1700–1849; Bezugszeilen 1850–1900 für die Umrechnung.",
            fields: ["Year → Jahr", "Full ensemble median → Rekonstruktionswert", "Full ensemble 2.5th/97.5th percentile → 95-%-Bereich"],
            extraction: "Übernommen wurden 150 Jahreswerte von 1700 bis 1849 aus dem vollständigen Ensemblemedian.",
            transformation: `Von jedem Wert und seinen Grenzen wurde ausschließlich das PAGES2k-Mittel 1850–1900 (${round(pagesBaseline, 6)} °C in der ursprünglichen 1961–1990-Anomalieskala) abgezogen. Keine Interpolation.`
          },
          points: reconstruction.map(row => point(row, "src_pages2k_2019", "rekonstruiert"))
        }
      ],
      points: observations.map(row => point(row, "src_hadcrut5_5100", "beobachtet"))
    }
  ],
  projectionAssessment: {
    grade: "robust_scenario_projection",
    method: "Bewertete IPCC-AR6-GSAT-Bestschätzungen für drei 20-Jahres-Zeiträume und drei exemplarische Emissionspfade.",
    scope: "Globale Temperaturänderung gegenüber 1850–1900; Szenarien sind bedingte Entwicklungspfade, keine Prognosen."
  },
  projectionSeries: projectionScenarios.map(scenario => ({
    id: scenario.id,
    observedSeriesId: "global_temperature_hadcrut5_1850_2025",
    scenario: scenario.scenario,
    scenarioLabel: scenario.scenarioLabel,
    period: "2021–2100",
    unit: "°C",
    method: "IPCC AR6 WGI, Tabelle SPM.1: bewertete Bestschätzung der GSAT-Änderung gegenüber 1850–1900.",
    uncertainty: "Sehr wahrscheinlicher Bereich der IPCC-Bewertung; jeder Punkt steht für ein 20-Jahres-Mittel, nicht für das einzelne Mittelpunktjahr.",
    sourceRefs: ["src_ipcc_ar6_spm"],
    provenance: {
      sourceFile: "IPCC_AR6_WGI_SPM_final.pdf",
      sourceUrl: "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM_final.pdf",
      locator: `Tabelle SPM.1, Zeile ${scenario.scenario}; Spalten 2021–2040, 2041–2060 und 2081–2100.`,
      fields: ["Best estimate → Kurvenwert", "Very likely range → Unsicherheitsangabe"],
      extraction: "Übernommen wurden die drei publizierten 20-Jahres-Mittel; dargestellt am jeweiligen Periodenmittelpunkt 2030, 2050 und 2090.",
      transformation: "Keine Wertumrechnung und keine Interpolation. Nur der Darstellungszeitpunkt ist der gerundete Mittelpunkt des publizierten Zeitraums."
    },
    points: scenario.points.map(([year, value, lower, upper, period]) => ({
      year,
      value,
      display: `${period}: +${de(value)} °C · ${scenario.scenario}`,
      finding: `${period}: IPCC-Bestschätzung +${de(value)} °C gegenüber 1850–1900 unter ${scenario.scenario}.`,
      uncertainty: `Sehr wahrscheinlicher Bereich +${de(lower)} bis +${de(upper)} °C.`,
      sourceRefs: ["src_ipcc_ar6_spm"]
    }))
  }))
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Globale Temperaturreihe geschrieben: ${observations.length} Beobachtungen, ${reconstruction.length} Rekonstruktionswerte, ${projectionScenarios.length} Projektionen.`);
console.log(`HadCRUT5 1850–1900 Offset: ${hadcrutBaseline}; PAGES2k Offset: ${pagesBaseline}; 2023–2025: ${currentThreeYear}; 2025: ${latest.value}`);
