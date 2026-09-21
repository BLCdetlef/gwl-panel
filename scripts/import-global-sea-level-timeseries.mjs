import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const outputPath = path.join(projectRoot, "data", "knowledge", "gwl_climate_sea_level_global_v0.1.json");
const reconstructionUrl = "https://zenodo.org/records/3862995/files/global_basin_timeseries.xlsx?download=1";
const explorerUrl = "https://d3qt3aobtsas2h.cloudfront.net/edge/ws/search/sealevelgovglobal?type=global&format=csv";
const projectionDatasetUrl = "https://zenodo.org/records/5914710";

// Verifizierter Auszug vom 21.09.2026. Rekonstruktion: Jahr, Mittel, Untergrenze, Obergrenze;
// Satellitenbeobachtung: Jahr, Jahresmittel; Projektionen: Jahr, Median, 17. und 83. Perzentil.
const reconstruction = [[1900,-150.432,-180.728,-118.174],[1901,-145.972,-178.189,-113.068],[1902,-157.561,-189.245,-125.385],[1903,-147.439,-179.868,-116.101],[1904,-145.891,-177.338,-114.621],[1905,-138.152,-169.302,-107.522],[1906,-152.776,-183.097,-121.66],[1907,-146.44,-178.007,-117.132],[1908,-161.283,-192.108,-129.769],[1909,-155.897,-186.158,-123.67],[1910,-154.292,-184.556,-122.7],[1911,-138.889,-168.982,-108.544],[1912,-131.236,-160.09,-101.246],[1913,-123.619,-153.477,-94.189],[1914,-121.628,-150.682,-92.546],[1915,-118.118,-146.33,-88.497],[1916,-144.429,-172.483,-115.402],[1917,-134.57,-162.197,-105.362],[1918,-130.535,-158.129,-102.324],[1919,-124.094,-152.455,-96.203],[1920,-115.467,-141.945,-87.623],[1921,-115.795,-142.645,-89.15],[1922,-117.341,-144.473,-89.839],[1923,-132.144,-159.809,-103.458],[1924,-126.886,-152.148,-100.712],[1925,-131.536,-157.78,-104.913],[1926,-132.203,-156.358,-106.717],[1927,-125.331,-149.339,-100.697],[1928,-127.808,-152.46,-102.442],[1929,-128.5,-152.883,-104.804],[1930,-123.602,-147.177,-99.298],[1931,-123.281,-147.408,-98.776],[1932,-108.964,-132.563,-84.971],[1933,-115.101,-139.317,-91.064],[1934,-128.301,-151.037,-104.566],[1935,-115.946,-140.024,-93.385],[1936,-121.766,-145.068,-99.272],[1937,-112.536,-135.439,-90.702],[1938,-103.039,-124.929,-80.837],[1939,-98.86,-119.953,-77.124],[1940,-109.529,-131.083,-88.708],[1941,-94.185,-115.26,-73.296],[1942,-94.032,-113.832,-73.449],[1943,-87.509,-107.964,-67.527],[1944,-96.043,-115.857,-76.745],[1945,-96.343,-115.732,-76.476],[1946,-81.641,-100.491,-62.027],[1947,-89.713,-108.481,-71.259],[1948,-81.778,-100.724,-63.091],[1949,-69.491,-87.825,-51.286],[1950,-73.357,-91.978,-55.344],[1951,-62.787,-81.165,-43.712],[1952,-62.749,-80.895,-44.498],[1953,-56.942,-75.06,-38.837],[1954,-67.109,-84.209,-50.172],[1955,-63.797,-81.77,-46.883],[1956,-77.211,-93.554,-60.992],[1957,-61.114,-78.417,-44.014],[1958,-62.898,-77.666,-48.812],[1959,-59.902,-74.174,-45.806],[1960,-54.039,-67.972,-40.396],[1961,-54.385,-67.461,-40.842],[1962,-56.283,-68.825,-43.475],[1963,-55.862,-69.043,-42.569],[1964,-59.923,-73.099,-46.433],[1965,-53.826,-66.912,-40.846],[1966,-59.921,-72.694,-47.08],[1967,-60.138,-72.44,-47.512],[1968,-62.166,-74.257,-49.93],[1969,-61.851,-73.998,-49.528],[1970,-62.075,-74.204,-49.515],[1971,-49.932,-61.918,-37.23],[1972,-55.659,-67.526,-42.99],[1973,-60.416,-73.196,-47.925],[1974,-53.95,-66.448,-41.407],[1975,-45.292,-56.988,-33.33],[1976,-55.267,-66.323,-43.864],[1977,-50.632,-62.01,-38.995],[1978,-55.308,-65.986,-43.898],[1979,-45.425,-57.091,-34.13],[1980,-47.727,-58.685,-36.171],[1981,-30.546,-41.463,-19.359],[1982,-38.797,-49.592,-27.848],[1983,-35.402,-46.218,-24.309],[1984,-35.723,-46.577,-25.063],[1985,-41.348,-51.182,-31.033],[1986,-34.047,-43.962,-24.1],[1987,-36.615,-46.771,-26.387],[1988,-39.237,-49.87,-28.859],[1989,-32.11,-41.668,-22.72],[1990,-28.847,-38.837,-18.393],[1991,-36.411,-50.133,-22.362],[1992,-37.052,-47.678,-26.244]];
const observations = [[1993,-33.737],[1994,-29.047],[1995,-23.946],[1996,-22.521],[1997,-20.177],[1998,-20.285],[1999,-18.132],[2000,-12.852],[2001,-7.375],[2002,-7.781],[2003,-5.287],[2004,-4.243],[2005,-0.001],[2006,1.714],[2007,2.219],[2008,6.015],[2009,10.394],[2010,12.488],[2011,11.611],[2012,21.615],[2013,24.209],[2014,26.285],[2015,35.077],[2016,37.597],[2017,37.836],[2018,40.389],[2019,46.469],[2020,49.43],[2021,53.45],[2022,55.842],[2023,61.325],[2024,64.665]];
const scenarios = {
  ssp119: [[2020,49,43,61],[2030,92,80,117],[2040,128,107,168],[2050,176,146,232],[2060,210,169,286],[2070,260,206,356],[2080,301,231,421],[2090,348,260,489],[2100,384,275,548]],
  ssp245: [[2020,49,43,61],[2030,93,80,117],[2040,142,119,180],[2050,204,173,263],[2060,262,219,343],[2070,330,273,437],[2080,403,323,540],[2090,476,378,646],[2100,556,435,759]],
  ssp585: [[2020,50,43,62],[2030,98,85,122],[2040,157,134,197],[2050,232,198,293],[2060,310,262,396],[2070,404,339,522],[2080,509,420,664],[2090,633,520,828],[2100,766,625,1011]]
};

const de = (value, digits = 1) => Number(value).toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const cm = millimetres => millimetres / 10;
const latest = observations.at(-1);
const riseSince1993 = latest[1] - observations[0][1];

const payload = {
  format: "gwl-knowledge-network-v1.3",
  version: "0.1",
  topic: "Klimawandel / globaler Meeresspiegelanstieg",
  status: "reviewed",
  schemaRef: "data/schema/node-level-types-v1.3-draft.json",
  entry: {
    systemBoundary: "Planetare Grenzen",
    domainComponent: "Klimawandel",
    subComponent: "Globaler Meeresspiegelanstieg",
    contributionRole: "deepening_without_organ",
    effectFocus: "Globaler mittlerer Meeresspiegel mit Rekonstruktion, Satellitenbeobachtung und IPCC-Projektionen"
  },
  corePrinciples: [
    "Der Meeresspiegelanstieg ist eine Klimawirkung und keine Kontrollvariable der planetaren Grenze Klimawandel.",
    "Historische Rekonstruktion, Satellitenbeobachtung und Projektionen bleiben als getrennte Segmente sichtbar.",
    "Alle dargestellten Werte sind Änderungen des globalen Mittels gegenüber 2005, keine lokalen Küstenpegel.",
    "Projektionspfade sind bedingte Szenarien und keine Vorhersagen."
  ],
  nodes: [
    { id: "pb_climate_change", type: "domain_component", label: "Klimawandel" },
    { id: "state_global_mean_sea_level", type: "socio_technical_state", label: "Globaler Meeresspiegelanstieg" }
  ],
  edges: [
    { from: "pb_climate_change", to: "state_global_mean_sea_level", relationType: "contains", evidenceStatus: "strong" }
  ],
  studyEvidence: [
    {
      id: "global_mean_sea_level_reconstruction_observation_projection",
      sourceRefs: ["src_frederikse_2020", "src_nasa_worldbank_explorer", "src_ipcc_ar6_sea_level"],
      design: "Zusammenstellung des globalen mittleren Meeresspiegels aus Pegelrekonstruktion, Satellitenaltimetrie und bewerteten IPCC-Szenarien.",
      finding: `Das Satelliten-Jahresmittel stieg von 1993 bis ${latest[0]} um ${de(cm(riseSince1993))} cm.`,
      relationType: "assessed_global_mean_sea_level_change",
      evidenceStatus: "strong"
    }
  ],
  measurements: [
    {
      id: "global_mean_sea_level_current_change",
      node: "state_global_mean_sea_level",
      geography: "Global",
      period: `1993–${latest[0]}`,
      metric: "Änderung des globalen mittleren Meeresspiegels",
      value: Number(cm(riseSince1993).toFixed(2)),
      unit: "cm",
      display: `1993–${latest[0]}: +${de(cm(riseSince1993))} cm`,
      uncertainty: "Jährliche Satellitenmittel; die zugrunde liegende Reihe wird methodisch aktualisiert. Regionale relative Meeresspiegel können deutlich vom globalen Mittel abweichen.",
      interpretation: "Der Wert beschreibt die Änderung zwischen den beiden Jahresmitteln und keinen lokalen Wasserstand.",
      sourceRefs: ["src_nasa_worldbank_explorer"],
      displayType: "observed_value"
    }
  ],
  presentation: {
    summaryCardMode: "narrative",
    effectSummary: `Der globale mittlere Meeresspiegel ist seit Beginn des 20. Jahrhunderts um rund 20 cm gestiegen. Satellitenbeobachtungen zeigen von 1993 bis ${latest[0]} einen weiteren Anstieg um ${de(cm(riseSince1993))} cm. Ursache sind vor allem die Ausdehnung des wärmer werdenden Meerwassers und der Verlust von Landeis. Rekonstruktion, Beobachtung und mögliche Zukunftspfade werden ausschließlich im BLC getrennt dargestellt.`,
    primaryMeasurementId: "global_mean_sea_level_current_change",
    primaryTimeSeriesId: "global_mean_sea_level_satellite_1993_2024",
    gwlTimeSeriesDisplay: "link_only",
    hideTimeSeriesInKnowledgeView: true,
    hideKnowledgePanelInKnowledgeView: true,
    referenceLabel: "Änderung gegenüber 2005 · kein planetarer Grenzwert",
    finding: `Die Satellitenreihe zeigt von 1993 bis ${latest[0]} einen Anstieg um ${de(cm(riseSince1993))} cm.`,
    effectPath: "Globale Erwärmung → thermische Ausdehnung und Landeisverlust → Meeresspiegelanstieg",
    uncertainty: "Der globale Mittelwert ist kein lokaler Küstenpegel. Rekonstruktionen und Satellitenbeobachtungen verwenden unterschiedliche Verfahren; Szenarien sind keine Prognosen.",
    statusYear: latest[0],
    statusLabel: `1993–${latest[0]} · Satellitenbeobachtung`
  },
  pathways: [
    {
      id: "warming_to_sea_level",
      title: "Erwärmung → Ausdehnung und Eisschmelze → Meeresspiegelanstieg",
      chain: ["Globale Erwärmung", "Thermische Ausdehnung und Verlust von Landeis", "Anstieg des globalen mittleren Meeresspiegels"],
      evidenceStatus: "strong",
      caution: "Die globale Temperatur und der Meeresspiegel verlaufen wegen Wärmespeicherung, verzögerter Eisreaktion und natürlicher Schwankungen nicht Jahr für Jahr parallel.",
      sourceRefs: ["src_ipcc_ar6_wg1"]
    }
  ],
  healthContext: {
    bodymapStatus: "not_applicable_yet",
    systemImpacts: [],
    bodymapRule: "Keinen Organmarker allein aus dem globalen Meeresspiegel ableiten; dafür wären regionale Expositions- und Gesundheitsdaten erforderlich."
  },
  knowledgeGaps: [],
  sources: [
    {
      id: "src_frederikse_2020",
      title: "Global and basin mean sea level time series · data supplement to The causes of sea-level rise since 1900",
      authors: "Frederikse et al.",
      publisher: "Zenodo / Nature",
      year: 2020,
      type: "peer_reviewed_reconstruction_dataset",
      url: reconstructionUrl,
      doi: "10.5281/zenodo.3862995",
      access: "open_data"
    },
    {
      id: "src_nasa_worldbank_explorer",
      title: "Sea Level Explorer · Global observations and projections export",
      authors: "NASA / World Bank",
      publisher: "World Bank with NASA",
      year: 2026,
      type: "official_data_export",
      url: explorerUrl,
      access: "open_data"
    },
    {
      id: "src_ipcc_ar6_sea_level",
      title: "IPCC AR6 Sea Level Projections · Version 20210809",
      authors: "Garner et al.",
      publisher: "Zenodo / IPCC AR6",
      year: 2021,
      type: "official_projection_dataset",
      url: projectionDatasetUrl,
      doi: "10.5281/zenodo.5914709",
      access: "open_data"
    },
    {
      id: "src_ipcc_ar6_wg1",
      title: "IPCC AR6 WGI · Ocean, Cryosphere and Sea Level Change",
      authors: "Fox-Kemper et al.",
      publisher: "Intergovernmental Panel on Climate Change",
      year: 2021,
      type: "official_assessment",
      url: "https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/",
      access: "open_full_text"
    }
  ],
  navigationRule: { group: "Klimawandel", item: "Globaler Meeresspiegelanstieg", type: "component" },
  timeSeries: [
    {
      id: "global_mean_sea_level_satellite_1993_2024",
      label: "Globaler mittlerer Meeresspiegel · Satellitenbeobachtung",
      metric: "Änderung des globalen mittleren Meeresspiegels gegenüber 2005",
      unit: "cm",
      geography: "Global",
      dataNature: "observed",
      worseningDirection: "increase",
      dataStartYear: 1993,
      dataEndYear: latest[0],
      reference: { type: "none", display: "Bezugsjahr 2005; kein eigenständiger planetarer Grenzwert" },
      sourceRefs: ["src_nasa_worldbank_explorer"],
      finding: `Von 1993 bis ${latest[0]} stieg das Satelliten-Jahresmittel um ${de(cm(riseSince1993))} cm.`,
      methodNote: "Monatliche Satellitenaltimetrie wurde zu arithmetischen Jahresmitteln zusammengefasst. Nur vollständige Kalenderjahre bis 2024 wurden übernommen.",
      uncertainty: "Der NASA-Datensatz wird methodisch fortgeschrieben. Der sichtbare Wechsel 1993 trennt Pegelrekonstruktion und Satellitenaltimetrie; die Segmente werden nicht interpoliert.",
      provenance: {
        sourceFile: "Sea Level Explorer global export.xlsx",
        sourceUrl: explorerUrl,
        locator: "Arbeitsblatt Observations; Zeilen global; Spalten Satellite Altimetry Year und Satellite Altimetry.",
        fields: ["Satellite Altimetry Year → Dezimaljahr", "Satellite Altimetry → globaler Meeresspiegel in mm gegenüber 2005"],
        extraction: "Die monatlichen Werte 1993–2024 wurden nach dem ganzzahligen Kalenderjahr gruppiert; nur Jahre mit zwölf Werten wurden übernommen.",
        transformation: "Arithmetisches Jahresmittel; anschließend Division durch 10 von Millimetern in Zentimeter. Keine Interpolation."
      },
      historicalSegments: [
        {
          id: "frederikse_global_mean_sea_level_1900_1992",
          label: "Historische Pegelrekonstruktion · Frederikse et al.",
          period: "1900–1992",
          method: "Virtuelle Stationsmethode zur globalen Zusammenführung jährlicher Pegelbeobachtungen.",
          uncertainty: "5.–95.-Perzentil der Rekonstruktion; keine direkte flächendeckende Messung.",
          sourceRefs: ["src_frederikse_2020"],
          provenance: {
            sourceFile: "global_basin_timeseries.xlsx",
            sourceUrl: reconstructionUrl,
            locator: "Arbeitsblatt Global; Jahreszeilen 1900–1992; Spalten Observed GMSL [lower], [mean], [upper]; Bezugszeile 2005.",
            fields: ["erste Spalte → Jahr", "Observed GMSL [mean] → Rekonstruktionswert", "Observed GMSL [lower]/[upper] → 5.–95.-Perzentil"],
            extraction: "Übernommen wurden alle 93 veröffentlichten Jahreswerte von 1900 bis 1992.",
            transformation: "Von Mittel- und Intervallwerten wurde ausschließlich der veröffentlichte Mittelwert des Jahres 2005 (−22,8293 mm auf der ursprünglichen Skala) abgezogen; anschließend Division durch 10 in Zentimeter. Keine Interpolation."
          },
          points: reconstruction.map(([year, value, lower, upper]) => ({
            year,
            value: Number(cm(value).toFixed(4)),
            display: `${year}: ${value >= 0 ? "+" : ""}${de(cm(value))} cm gegenüber 2005 · rekonstruiert`,
            finding: `${year}: rekonstruierter globaler mittlerer Meeresspiegel ${value >= 0 ? "+" : ""}${de(cm(value))} cm gegenüber 2005.`,
            uncertainty: `5.–95.-Perzentil ${de(cm(lower))} bis ${de(cm(upper))} cm.`,
            sourceRefs: ["src_frederikse_2020"]
          }))
        }
      ],
      methodBreaks: [{ year: 1993, label: "Beginn der Satellitenaltimetrie" }],
      points: observations.map(([year, value]) => ({
        year,
        value: Number(cm(value).toFixed(4)),
        display: `${year}: ${value >= 0 ? "+" : ""}${de(cm(value))} cm gegenüber 2005 · beobachtet`,
        finding: `${year}: Satelliten-Jahresmittel ${value >= 0 ? "+" : ""}${de(cm(value))} cm gegenüber 2005.`,
        uncertainty: "Jahresmittel aus zwölf monatlichen Satellitenwerten.",
        sourceRefs: ["src_nasa_worldbank_explorer"]
      }))
    }
  ],
  projectionAssessment: {
    grade: "robust_scenario_projection",
    method: "IPCC-AR6-Median sowie wahrscheinlicher Bereich (17.–83. Perzentil) für drei exemplarische SSP-Pfade.",
    scope: "Globaler mittlerer Meeresspiegel gegenüber 2005; Szenarien sind bedingte Entwicklungspfade, keine Prognosen."
  },
  projectionSeries: Object.entries(scenarios).map(([key, rows]) => {
    const labels = {
      ssp119: ["SSP1-1.9", "SSP1-1.9 · sehr niedrige Emissionen"],
      ssp245: ["SSP2-4.5", "SSP2-4.5 · mittlere Emissionen"],
      ssp585: ["SSP5-8.5", "SSP5-8.5 · sehr hohe Emissionen"]
    };
    const [scenario, scenarioLabel] = labels[key];
    return {
      id: `global_mean_sea_level_ipcc_${key}`,
      observedSeriesId: "global_mean_sea_level_satellite_1993_2024",
      scenario,
      scenarioLabel,
      period: "2020–2100",
      unit: "cm",
      method: "IPCC AR6: Median und wahrscheinlicher Bereich des globalen mittleren Meeresspiegels gegenüber 2005.",
      uncertainty: "17.–83. Perzentil der IPCC-AR6-Projektion; bedingtes Szenario, keine Vorhersage.",
      sourceRefs: ["src_ipcc_ar6_sea_level", "src_nasa_worldbank_explorer"],
      provenance: {
        sourceFile: "Sea Level Explorer global export.xlsx",
        sourceUrl: explorerUrl,
        locator: `Arbeitsblatt Future-Total; process=total, confidence=medium, scenario=${key}; quantile 17, 50 und 83; Spalten 2020–2100.`,
        fields: ["Jahresspalten → Jahr", "quantile 50 → Median", "quantile 17/83 → wahrscheinlicher Bereich"],
        extraction: "Übernommen wurden die veröffentlichten Dekadenwerte 2020 bis 2100.",
        transformation: "Division durch 10 von Millimetern in Zentimeter. Keine Interpolation."
      },
      points: rows.map(([year, value, lower, upper]) => ({
        year,
        value: cm(value),
        display: `${year}: +${de(cm(value))} cm · ${scenario} · modelliert`,
        finding: `${year}: IPCC-Median +${de(cm(value))} cm gegenüber 2005 unter ${scenario}.`,
        uncertainty: `Wahrscheinlicher Bereich +${de(cm(lower))} bis +${de(cm(upper))} cm.`,
        sourceRefs: ["src_ipcc_ar6_sea_level", "src_nasa_worldbank_explorer"]
      }))
    };
  })
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Meeresspiegelreihe geschrieben: ${observations.length} Beobachtungsjahre, ${reconstruction.length} Rekonstruktionswerte, ${Object.keys(scenarios).length} Projektionen.`);
