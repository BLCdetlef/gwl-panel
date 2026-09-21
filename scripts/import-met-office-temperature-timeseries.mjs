import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const accessDate = "2026-09-21";
const lastCompleteYear = 2025;

const configurations = [
  {
    output: "gwl_climate_temperature_global_v0.1.json",
    topic: "Klimawandel / globale Oberflächentemperatur",
    itemLabel: "Globale Temperaturentwicklung",
    subComponent: "Globale Oberflächentemperatur",
    seriesId: "global_surface_temperature_hadcrut5_annual",
    seriesLabel: "Globale Oberflächentemperatur · HadCRUT5",
    metric: "Globale bodennahe Oberflächentemperatur-Anomalie",
    datasetId: "src_hadcrut5_5100",
    datasetTitle: "HadCRUT.5.1.0.0 analysis summary series · global annual",
    datasetUrl: "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.1.0.0/analysis/diagnostics/HadCRUT.5.1.0.0.analysis.summary_series.global.annual.csv",
    downloadPage: "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.1.0.0/download.html",
    paperId: "src_morice_2021_hadcrut5",
    paperTitle: "An Updated Assessment of Near-Surface Temperature Change From 1850: The HadCRUT5 Data Set",
    paperAuthors: "Morice, C. P. et al.",
    paperYear: 2021,
    paperDoi: "10.1029/2019JD032361",
    paperUrl: "https://doi.org/10.1029/2019JD032361",
    yearField: "Time",
    valueField: "Anomaly (deg C)",
    lowerField: "Lower confidence limit (2.5%)",
    upperField: "Upper confidence limit (97.5%)",
    valueDescription: "HadCRUT5 verbindet Lufttemperaturen über Land mit Meeresoberflächentemperaturen und ergänzt räumliche Datenlücken statistisch.",
    scopeCaution: "Die Reihe ist ein globales Flächenmittel aus Landluft- und Meeresoberflächentemperatur; sie ist weder eine reine Lufttemperaturreihe noch das einfache arithmetische Mittel der beiden Vertiefungsreihen.",
    uncertaintyLabel: row => `95-%-Bereich ${formatSigned(row.lower)} bis ${formatSigned(row.upper)} °C`,
    effectPath: "Treibhausgasbedingter Strahlungsantrieb → Erwärmung der globalen Oberfläche → Veränderungen von Klima, Wasserhaushalt und Extremereignissen"
  },
  {
    output: "gwl_climate_temperature_ocean_v0.1.json",
    topic: "Klimawandel / globale Meeresoberflächentemperatur",
    itemLabel: "Temperaturentwicklung der Ozeane",
    subComponent: "Meeresoberflächentemperatur",
    seriesId: "global_sea_surface_temperature_hadsst4_annual",
    seriesLabel: "Globale Meeresoberflächentemperatur · HadSST4",
    metric: "Globale Meeresoberflächentemperatur-Anomalie",
    datasetId: "src_hadsst4_4200",
    datasetTitle: "HadSST.4.2.0.0 annual global sea-surface temperature anomalies",
    datasetUrl: "https://www.metoffice.gov.uk/hadobs/hadsst4/data/data/HadSST.4.2.0.0_annual_GLOBE.csv",
    downloadPage: "https://www.metoffice.gov.uk/hadobs/hadsst4/data/download.html",
    paperId: "src_kennedy_2019_hadsst4",
    paperTitle: "An Ensemble Data Set of Sea Surface Temperature Change From 1850: The Met Office Hadley Centre HadSST.4.0.0.0 Data Set",
    paperAuthors: "Kennedy, J. J. et al.",
    paperYear: 2019,
    paperDoi: "10.1029/2018JD029867",
    paperUrl: "https://doi.org/10.1029/2018JD029867",
    yearField: "year",
    valueField: "anomaly",
    totalUncertaintyField: "total_uncertainty",
    valueDescription: "HadSST4 wertet bias-korrigierte In-situ-Messungen von Schiffen und Bojen aus; die Temperatur bezieht sich auf die Meeresoberfläche.",
    scopeCaution: "Meeresoberflächentemperatur ist nicht gleichbedeutend mit dem Wärmeinhalt des gesamten Ozeans. Tiefere Wasserschichten werden von dieser Reihe nicht direkt erfasst.",
    uncertaintyLabel: row => `Gesamtunsicherheit (1σ): ±${formatNumber(row.totalUncertainty)} °C`,
    effectPath: "Treibhausgasbedingter Strahlungsantrieb → Erwärmung der Meeresoberfläche → Veränderungen mariner Ökosysteme, Verdunstung und Zirkulation"
  },
  {
    output: "gwl_climate_temperature_land_v0.1.json",
    topic: "Klimawandel / globale Landlufttemperatur",
    itemLabel: "Temperaturentwicklung an Land",
    subComponent: "Landlufttemperatur",
    seriesId: "global_land_air_temperature_crutem5_annual",
    seriesLabel: "Globale Landlufttemperatur · CRUTEM5",
    metric: "Globale bodennahe Lufttemperatur-Anomalie über Land",
    datasetId: "src_crutem5_5100",
    datasetTitle: "CRUTEM.5.1.0.0 summary series · global annual",
    datasetUrl: "https://www.metoffice.gov.uk/hadobs/crutem5/data/CRUTEM.5.1.0.0/diagnostics/CRUTEM.5.1.0.0.summary_series.global.annual.csv",
    downloadPage: "https://www.metoffice.gov.uk/hadobs/crutem5/data/CRUTEM.5.1.0.0/download.html",
    paperId: "src_osborn_2021_crutem5",
    paperTitle: "Land Surface Air Temperature Variations Across the Globe Updated to 2019: The CRUTEM5 Data Set",
    paperAuthors: "Osborn, T. J. et al.",
    paperYear: 2021,
    paperDoi: "10.1029/2019JD032352",
    paperUrl: "https://doi.org/10.1029/2019JD032352",
    yearField: "Time",
    valueField: "Anomaly (deg C)",
    lowerField: "Lower confidence limit (2.5%)",
    upperField: "Upper confidence limit (97.5%)",
    valueDescription: "CRUTEM5 bildet bodennahe Lufttemperaturen über Land aus qualitätsgeprüften Wetterstationsdaten auf einem globalen 5°-Gitter ab.",
    scopeCaution: "Die Reihe beschreibt ausschließlich Landflächen. Ozeane, Bodentemperaturen und lokale Stadtklimata sind nicht ihre Messgröße.",
    uncertaintyLabel: row => `95-%-Bereich ${formatSigned(row.lower)} bis ${formatSigned(row.upper)} °C`,
    effectPath: "Treibhausgasbedingter Strahlungsantrieb → Erwärmung der Landluft → Veränderungen von Hitze, Wasserhaushalt und terrestrischen Ökosystemen"
  }
];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map(line => Object.fromEntries(line.split(",").map((value, index) => [headers[index], value])));
}

function formatNumber(value) {
  return Number(value).toLocaleString("de-DE", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function formatSigned(value) {
  const numeric = Number(value);
  return `${numeric >= 0 ? "+" : ""}${formatNumber(numeric)}`;
}

function buildNetwork(config, rows) {
  const points = rows
    .map(row => ({
      year: Number(row[config.yearField]),
      rawValue: row[config.valueField],
      value: Number(row[config.valueField]),
      lower: config.lowerField ? Number(row[config.lowerField]) : null,
      upper: config.upperField ? Number(row[config.upperField]) : null,
      totalUncertainty: config.totalUncertaintyField ? Number(row[config.totalUncertaintyField]) : null
    }))
    .filter(row => Number.isInteger(row.year)
      && row.year <= lastCompleteYear
      && String(row.rawValue ?? "").trim() !== ""
      && Number.isFinite(row.value))
    .sort((a, b) => a.year - b.year);
  if (points.length < 50) throw new Error(`${config.seriesId}: zu wenige gültige Jahreswerte.`);
  const first = points[0];
  const latest = points.at(-1);
  const sourceRefs = [config.datasetId, config.paperId];
  const pointRecords = points.map(point => ({
    year: point.year,
    value: Number(point.value.toFixed(6)),
    display: `${formatSigned(point.value)} °C`,
    finding: `${point.year}: ${formatSigned(point.value)} °C gegenüber dem Mittel 1961–1990.`,
    uncertainty: config.uncertaintyLabel(point),
    sourceRefs: [config.datasetId]
  }));

  return {
    format: "gwl-knowledge-network-v1.3",
    version: "0.1",
    topic: config.topic,
    status: "reviewed",
    schemaRef: "data/schema/node-level-types-v1.3-draft.json",
    entry: {
      systemBoundary: "Planetare Grenzen",
      domainComponent: "Klimawandel",
      subComponent: config.subComponent,
      contributionRole: "deepening_without_organ",
      effectFocus: `${config.metric} als beobachtungsbasierte Vertiefung zum Klimawandel`
    },
    corePrinciples: [
      "Die Temperaturreihe ist eine Vertiefung und keine Kontrollvariable der planetaren Grenze Klimawandel.",
      "Alle Werte sind Anomalien gegenüber dem Mittel 1961–1990 und keine absoluten Temperaturen.",
      "Jahreswerte, langfristiger Klimatrend und die 1,5-°C-Grenze des Pariser Abkommens werden nicht gleichgesetzt.",
      config.scopeCaution,
      "Aus der globalen Temperaturreihe allein wird kein Organmarker abgeleitet."
    ],
    nodes: [
      { id: "pb_climate_change", type: "domain_component", label: "Klimawandel" },
      { id: "state_temperature", type: "socio_technical_state", label: config.subComponent },
      { id: "effect_climate_impacts", type: "environmental_effect", label: "Veränderte Klimabedingungen" }
    ],
    edges: [
      { from: "pb_climate_change", to: "state_temperature", relationType: "contains", evidenceStatus: "strong" },
      { from: "state_temperature", to: "effect_climate_impacts", relationType: "contributes_to", evidenceStatus: "strong" }
    ],
    studyEvidence: [
      {
        id: `${config.seriesId}_evidence`,
        sourceRefs,
        design: "Globale beobachtungsbasierte Jahresreihe mit dokumentierter Qualitätskontrolle und Unsicherheitsabschätzung.",
        finding: `${first.year} bis ${latest.year}: Anstieg der Anomalie von ${formatSigned(first.value)} °C auf ${formatSigned(latest.value)} °C gegenüber 1961–1990.`,
        relationType: "observed_global_timeseries",
        evidenceStatus: "strong"
      }
    ],
    measurements: [
      {
        id: `${config.seriesId}_latest`,
        node: "state_temperature",
        geography: "Global",
        period: String(latest.year),
        metric: config.metric,
        value: Number(latest.value.toFixed(6)),
        unit: "°C anomaly relative to 1961–1990",
        display: `${formatSigned(latest.value)} °C gegenüber 1961–1990`,
        reference: { type: "none", display: "Kein eigenständiger planetarer Grenzwert für diese Vertiefungsreihe" },
        uncertainty: config.uncertaintyLabel(latest),
        interpretation: config.scopeCaution,
        sourceRefs,
        displayType: "observed_value"
      }
    ],
    presentation: {
      summaryCardMode: "narrative",
      effectSummary: `${config.valueDescription} Die Reihe reicht von ${first.year} bis ${latest.year}; ${latest.year} lag die globale Anomalie bei ${formatSigned(latest.value)} °C gegenüber 1961–1990. ${config.scopeCaution}`,
      primaryMeasurementId: `${config.seriesId}_latest`,
      primaryTimeSeriesId: config.seriesId,
      referenceLabel: "Bezugsperiode 1961–1990 · kein planetarer Grenzwert",
      finding: `Die Reihe zeigt eine langfristige Erwärmung; kurzfristige Schwankungen einzelner Jahre bleiben sichtbar.`,
      effectPath: config.effectPath,
      uncertainty: `Die Unsicherheit verändert sich mit Messnetz, räumlicher Abdeckung und Korrekturverfahren. Die jüngste vollständige Jahresangabe ist ${latest.year}; ein bereits veröffentlichter Teilwert für 2026 wird nicht übernommen.`,
      statusYear: latest.year,
      statusLabel: `${latest.year} · vollständiges Kalenderjahr`
    },
    pathways: [
      {
        id: `${config.seriesId}_path`,
        label: config.effectPath,
        nodes: ["state_temperature", "effect_climate_impacts"],
        evidenceStatus: "strong",
        caution: "Die globale Temperaturreihe quantifiziert nicht automatisch regionale oder gesundheitliche Folgen."
      }
    ],
    healthContext: {
      bodymapStatus: "not_applicable_yet",
      systemImpacts: [],
      bodymapRule: "Keinen Organmarker allein aus einer globalen Temperatur-Anomalie ableiten."
    },
    knowledgeGaps: [],
    sources: [
      {
        id: config.datasetId,
        title: config.datasetTitle,
        authors: "Met Office Hadley Centre / Climatic Research Unit",
        publisher: "Met Office",
        year: 2026,
        type: "official_observational_dataset",
        url: config.datasetUrl,
        landingPage: config.downloadPage,
        accessed: accessDate,
        access: "open_data"
      },
      {
        id: config.paperId,
        title: config.paperTitle,
        authors: config.paperAuthors,
        publisher: "Journal of Geophysical Research: Atmospheres",
        year: config.paperYear,
        type: "peer_reviewed_dataset_description",
        url: config.paperUrl,
        doi: config.paperDoi,
        access: "open_full_text"
      }
    ],
    navigationRule: {
      group: "Klimawandel",
      item: config.itemLabel,
      type: "component"
    },
    timeSeries: [
      {
        id: config.seriesId,
        label: config.seriesLabel,
        metric: config.metric,
        unit: "°C",
        geography: "Global",
        dataNature: "observed",
        worseningDirection: "increase",
        dataStartYear: first.year,
        dataEndYear: latest.year,
        reference: { type: "none", display: "Bezugsperiode 1961–1990; kein eigenständiger planetarer Grenzwert" },
        sourceRefs,
        finding: `Beobachtungsbasierte Temperatur-Anomalie ${first.year}–${latest.year} gegenüber 1961–1990.`,
        methodNote: `${config.valueDescription} Übernommen werden ausschließlich vollständige Kalenderjahre bis ${latest.year}; es wird nicht interpoliert und nicht auf 1850–1900 umgerechnet.`,
        uncertainty: `${config.scopeCaution} Punktbezogene Unsicherheiten stammen unverändert aus der veröffentlichten Jahresreihe.`,
        contextNotes: [
          {
            id: "reference_period",
            label: "Bezugsperiode",
            value: "1961–1990",
            detail: "Die Null-Linie bezeichnet das Mittel 1961–1990. Sie ist kein Grenzwert und nicht mit der vorindustriellen Bezugsperiode 1850–1900 gleichzusetzen.",
            sourceRefs: [config.datasetId]
          },
          {
            id: "curve_role",
            label: "Rolle im BLC",
            value: "Vertiefende Studie",
            detail: "Die Reihe zeigt eine Klimawirkung. Die beiden Kontrollvariablen der planetaren Grenze bleiben atmosphärisches CO₂ und Strahlungsantrieb.",
            sourceRefs: [config.paperId]
          }
        ],
        provenance: {
          sourceFile: new URL(config.datasetUrl).pathname.split("/").at(-1),
          sourceUrl: config.datasetUrl,
          locator: `CSV-Kopfzeile und Jahreszeilen ${first.year}–${latest.year}.`,
          fields: config.totalUncertaintyField
            ? ["year → Jahr", "anomaly → Temperatur-Anomalie", "total_uncertainty → Gesamtunsicherheit (1σ)"]
            : [`${config.yearField} → Jahr`, `${config.valueField} → Temperatur-Anomalie`, `${config.lowerField} / ${config.upperField} → 95-%-Vertrauensbereich`],
          extraction: `Ausgelesen wurden alle ${pointRecords.length} gültigen globalen Jahreszeilen von ${first.year} bis ${latest.year}.`,
          transformation: "Die numerischen Quellwerte bleiben erhalten. Nur die Anzeige wird auf drei Dezimalstellen gerundet. Leere Zeilen und das noch unvollständige Kalenderjahr 2026 werden ausgeschlossen; keine Interpolation und keine Änderung der Bezugsperiode."
        },
        points: pointRecords
      }
    ]
  };
}

for (const config of configurations) {
  const response = await fetch(config.datasetUrl);
  if (!response.ok) throw new Error(`${config.datasetUrl}: HTTP ${response.status}`);
  const payload = buildNetwork(config, parseCsv(await response.text()));
  const outputPath = path.join(projectRoot, "data", "knowledge", config.output);
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const series = payload.timeSeries[0];
  console.log(`${config.output}: ${series.points.length} Werte · ${series.dataStartYear}–${series.dataEndYear}`);
}
