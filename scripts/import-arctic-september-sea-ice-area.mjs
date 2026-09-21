import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const outputPath = path.join(projectRoot, "data", "knowledge", "gwl_climate_arctic_september_sea_ice_v0.1.json");

const uhhPageUrl = "https://www.cen.uni-hamburg.de/en/icdc/data/cryosphere/uhh-sea-ice-area-product.html";
const uhhHistoricalRecordUrl = "https://www.fdr.uni-hamburg.de/record/11346";
const uhhObservationRecordUrl = "https://www.fdr.uni-hamburg.de/record/18163";
const ipccChapterUrl = "https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4/";
const ipccPdfUrl = "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter04.pdf";

// Verifizierter September-Auszug aus der Variable `walsh` der UHH-Datei
// SeaIceArea__NorthernHemisphere__monthly__UHH__v2024_fv0.01.nc (MD5
// d959e75624e061f76a1f909e0b4bb64a). Die Werte sind monatliche Mittel in 10^6 km².
const reconstructionRows = [[1850,6.937448],[1851,7.091296],[1852,7.372265],[1853,6.962368],[1854,5.954253],[1855,7.27373],[1856,7.088126],[1857,6.619237],[1858,6.651466],[1859,6.938847],[1860,6.637902],[1861,6.905279],[1862,6.939741],[1863,6.733167],[1864,7.209791],[1865,6.802237],[1866,6.986041],[1867,6.972791],[1868,7.661385],[1869,7.232626],[1870,6.733281],[1871,6.944733],[1872,7.014557],[1873,7.076022],[1874,6.985013],[1875,7.093856],[1876,6.908729],[1877,6.900338],[1878,6.725902],[1879,7.003499],[1880,6.779938],[1881,6.702284],[1882,7.297424],[1883,6.645472],[1884,6.620799],[1885,6.723223],[1886,7.120011],[1887,7.124816],[1888,7.148962],[1889,6.957317],[1890,6.993237],[1891,6.963606],[1892,6.971614],[1893,7.132581],[1894,6.866391],[1895,7.017221],[1896,6.95475],[1897,6.794268],[1898,7.231614],[1899,6.698191],[1900,6.618501],[1901,6.88708],[1902,6.755697],[1903,6.968579],[1904,6.403144],[1905,6.857943],[1906,6.784803],[1907,6.999119],[1908,7.096754],[1909,6.679428],[1910,7.045686],[1911,7.312946],[1912,7.352044],[1913,6.50049],[1914,7.323347],[1915,6.515518],[1916,7.3823],[1917,6.852439],[1918,6.819104],[1919,6.778855],[1920,6.092945],[1921,7.212191],[1922,7.093281],[1923,6.916941],[1924,6.892466],[1925,7.212191],[1926,7.212191],[1927,7.212191],[1928,7.0721],[1929,7.031874],[1930,6.941288],[1931,7.212191],[1932,6.934961],[1933,6.602304],[1934,6.132984],[1935,5.785536],[1936,7.102834],[1937,6.070695],[1938,6.708268],[1939,6.928624],[1940,6.514159],[1941,6.31345],[1942,6.784041],[1943,6.00389],[1944,6.463967],[1945,6.442587],[1946,6.163537],[1947,6.815235],[1948,6.976916],[1949,6.514781],[1950,6.351754],[1951,6.29105],[1952,5.968121],[1953,6.511192],[1954,6.942221],[1955,6.75688],[1956,7.163299],[1957,7.179328],[1958,6.941944],[1959,6.310411],[1960,6.394365],[1961,6.255726],[1962,7.618507],[1963,7.858218],[1964,7.388805],[1965,7.470191],[1966,7.249628],[1967,7.475221],[1968,6.59439],[1969,7.579748],[1970,7.420423],[1971,6.550889],[1972,6.883382],[1973,6.970366],[1974,6.750642],[1975,7.05053],[1976,6.649753],[1977,6.482363],[1978,7.072116]];

// Verifizierter September-Auszug aus `nsidc_cdr` der UHH-Datei
// SeaIceArea__NorthernHemisphere__monthly__UHH__v2025_fv0.01.nc (MD5
// 2e51a0e75d689ad84889beb656e6901d). Die Werte sind monatliche Mittel in 10^6 km².
const observationRows = [[1979,6.605533],[1980,7.21995],[1981,6.709891],[1982,6.849255],[1983,6.958425],[1984,6.516269],[1985,6.459449],[1986,7.012281],[1987,6.92436],[1988,6.932963],[1989,6.452644],[1990,5.760085],[1991,6.035515],[1992,7.016528],[1993,5.928469],[1994,6.651188],[1995,5.687191],[1996,7.12476],[1997,6.198224],[1998,5.900806],[1999,5.507864],[2000,5.70428],[2001,6.076285],[2002,5.361971],[2003,5.562851],[2004,5.575222],[2005,5.057753],[2006,5.300524],[2007,3.81505],[2008,4.20845],[2009,4.788727],[2010,4.324258],[2011,4.074991],[2012,3.098967],[2013,4.75081],[2014,4.686462],[2015,4.162618],[2016,3.934255],[2017,4.364444],[2018,4.273009],[2019,3.92193],[2020,3.556619],[2021,4.383532],[2022,4.388343],[2023,3.812721],[2024,3.89594]];

// IPCC AR6 WGI, Kapitel 4, Tabelle 4.4: Multi-Modell-Mittel und 5–95-%-Bereich.
// Die Diagrammjahre sind ausschließlich Darstellungspositionen in der Mitte der
// ausgewiesenen 20-Jahres-Zeiträume; sie sind keine Einzeljahreswerte.
const scenarioRows = {
  ssp119: [[2030,2.6,1.1,6.5,"2021–2040"],[2050,2.2,0.3,6.5,"2041–2060"],[2090,2.4,0.2,6.2,"2081–2100"]],
  ssp245: [[2030,2.8,0.7,6.4,"2021–2040"],[2050,1.7,0.1,5.6,"2041–2060"],[2090,0.8,0.0,4.6,"2081–2100"]],
  ssp370: [[2030,3.1,1.1,6.4,"2021–2040"],[2050,1.7,0.1,5.7,"2041–2060"],[2090,0.5,0.0,3.3,"2081–2100"]]
};

if (reconstructionRows.length !== 129 || reconstructionRows[0][0] !== 1850 || reconstructionRows.at(-1)[0] !== 1978) {
  throw new Error("Unerwarteter UHH-Walsh-Rekonstruktionsauszug.");
}
if (observationRows.length !== 46 || observationRows[0][0] !== 1979 || observationRows.at(-1)[0] !== 2024) {
  throw new Error("Unerwarteter UHH-NOAA/NSIDC-CDR-Beobachtungsauszug.");
}

const de = (value, digits = 2) => Number(value).toLocaleString("de-DE", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});
const latest = observationRows.at(-1);
const firstObserved = observationRows[0];

const payload = {
  format: "gwl-knowledge-network-v1.3",
  version: "0.1",
  topic: "Klimawandel / arktische September-Meereisfläche",
  status: "reviewed",
  schemaRef: "data/schema/node-level-types-v1.3-draft.json",
  entry: {
    systemBoundary: "Planetare Grenzen",
    domainComponent: "Klimawandel",
    subComponent: "Arktische Meereisfläche im September",
    contributionRole: "deepening_without_organ",
    effectFocus: "Monatlich gemittelte arktische September-Meereisfläche mit historischer Rekonstruktion, Satellitenbeobachtung und CMIP6-Projektionen"
  },
  corePrinciples: [
    "Die September-Meereisfläche ist eine Klimafolge und keine Kontrollvariable der planetaren Grenze Klimawandel.",
    "Dargestellt wird Fläche, nicht Ausdehnung und nicht die Reflexionsfähigkeit der Erde.",
    "Walsh-Rekonstruktion, satellitengestützte NOAA/NSIDC-CDR-Beobachtung und CMIP6-Projektionen bleiben methodisch getrennte Segmente.",
    "Die Projektionspunkte stehen für 20-Jahres-Mittel; ihre Position in der Periodenmitte ist nur eine Darstellungsregel und keine zeitliche Interpolation."
  ],
  nodes: [
    { id: "pb_climate_change", type: "domain_component", label: "Klimawandel" },
    { id: "state_arctic_september_sea_ice_area", type: "ecological_state", label: "Arktische September-Meereisfläche" }
  ],
  edges: [
    { from: "pb_climate_change", to: "state_arctic_september_sea_ice_area", relationType: "contains_deepening", evidenceStatus: "strong" }
  ],
  studyEvidence: [
    {
      id: "arctic_september_sea_ice_reconstruction_observation_projection",
      sourceRefs: ["src_uhh_sia_2024", "src_uhh_sia_2025", "src_ipcc_ar6_ch4"],
      design: "Zusammenstellung monatlicher Septembermittel aus der UHH-Walsh-Rekonstruktion, dem NOAA/NSIDC Climate Data Record und IPCC-bewerteten CMIP6-Szenarien.",
      finding: `Das satellitengestützte Septembermittel sank von ${de(firstObserved[1])} Mio. km² im Jahr ${firstObserved[0]} auf ${de(latest[1])} Mio. km² im Jahr ${latest[0]}.`,
      relationType: "assessed_arctic_sea_ice_change",
      evidenceStatus: "strong"
    }
  ],
  measurements: [
    {
      id: "arctic_september_sea_ice_area_latest",
      node: "state_arctic_september_sea_ice_area",
      geography: "Arktis / Nordhalbkugel nördlich etwa 35° N",
      period: String(latest[0]),
      metric: "Monatlich gemittelte arktische Meereisfläche im September",
      value: latest[1],
      unit: "Mio. km²",
      display: `${latest[0]}: ${de(latest[1])} Mio. km²`,
      uncertainty: "Das UHH-Produkt veröffentlicht für diese Reihe keine eigene numerische Unsicherheit. Unterschiede zwischen Satellitenalgorithmen werden deshalb nicht in ein scheinbar exaktes Fehlerband umgerechnet.",
      interpretation: "Der Wert beschreibt die mit der Eiskonzentration gewichtete Fläche. Er ist weder Meereisausdehnung noch planetare Albedo und kein Grenzwert der planetaren Grenzen.",
      sourceRefs: ["src_uhh_sia_2025"],
      displayType: "observed_value"
    }
  ],
  presentation: {
    summaryCardMode: "narrative",
    effectSummary: `Die arktische Meereisfläche erreicht im September gewöhnlich ihr jahreszeitliches Minimum. Das satellitengestützte Monatsmittel sank von ${de(firstObserved[1])} Mio. km² im Jahr ${firstObserved[0]} auf ${de(latest[1])} Mio. km² im Jahr ${latest[0]}. Die Reihe zeigt eine wichtige Wirkung der Erwärmung und eine Rückkopplung über die geringere Reflexion heller Eisflächen, ist aber keine eigene Kontrollvariable der planetaren Grenze. Rekonstruktion, Beobachtung und mögliche Zukunftspfade werden ausschließlich im BLC getrennt dargestellt.`,
    primaryMeasurementId: "arctic_september_sea_ice_area_latest",
    primaryTimeSeriesId: "arctic_september_sea_ice_area_1979_2024",
    gwlTimeSeriesDisplay: "link_only",
    hideTimeSeriesInKnowledgeView: true,
    hideKnowledgePanelInKnowledgeView: true,
    uncertainty: "Historische Werte beruhen auf heterogenen und teils lückenhaften Beobachtungsquellen; die Satellitenreihe beginnt 1979. Die CMIP6-Werte sind Szenario- und Modellmittel für 20-jährige Zeiträume, keine Vorhersagen einzelner Jahre."
  },
  pathways: [
    {
      id: "warming_to_arctic_sea_ice_feedback",
      label: "Erwärmung → weniger arktisches Meereis → geringere Rückstrahlung → zusätzliche Erwärmung",
      mechanism: "Steigende Luft- und Wassertemperaturen verkürzen und schwächen die sommerliche Meereisbedeckung. Offenes dunkles Wasser nimmt mehr Sonnenenergie auf als helles Eis und verstärkt dadurch die regionale Erwärmung.",
      evidenceStatus: "strong",
      caution: "Die Septemberfläche misst die Rückkopplung nicht direkt; Wolken, Schnee, Eisdicke und jahreszeitliche Strahlungsverhältnisse beeinflussen die tatsächliche Albedo zusätzlich."
    }
  ],
  sources: [
    {
      id: "src_uhh_sia_2024",
      title: "UHH Sea Ice Area Product, Version 2024_fv0.01",
      authors: "Rauschenbach, Doerr, Notz und Kern",
      publisher: "Universität Hamburg, ICDC",
      year: 2024,
      type: "official_research_dataset",
      url: uhhHistoricalRecordUrl,
      doi: "10.25592/uhhfdm.11346",
      accessed: "2026-09-21",
      access: "open_data"
    },
    {
      id: "src_uhh_sia_2025",
      title: "UHH Sea Ice Area Product, Version 2025_fv0.01",
      authors: "Thomae, Rauschenbach, Doerr, Notz und Kern",
      publisher: "Universität Hamburg, ICDC",
      year: 2025,
      type: "official_research_dataset",
      url: uhhObservationRecordUrl,
      doi: "10.25592/uhhfdm.18163",
      accessed: "2026-09-21",
      access: "open_data"
    },
    {
      id: "src_ipcc_ar6_ch4",
      title: "IPCC AR6 WGI Chapter 4: Future Global Climate",
      authors: "Lee et al.",
      publisher: "Intergovernmental Panel on Climate Change",
      year: 2021,
      type: "assessment_report",
      url: ipccChapterUrl,
      accessed: "2026-09-21",
      access: "open_full_text"
    }
  ],
  navigationRule: { group: "Klimawandel", item: "Arktische Meereisfläche im September", type: "component" },
  timeSeries: [
    {
      id: "arctic_september_sea_ice_area_1979_2024",
      label: "Arktische September-Meereisfläche · Satellitenbeobachtung",
      metric: "Monatlich gemittelte arktische Meereisfläche im September",
      unit: "Mio. km²",
      geography: "Nordhalbkugel nördlich etwa 35° N",
      dataNature: "observed",
      worseningDirection: "decrease",
      dataStartYear: firstObserved[0],
      dataEndYear: latest[0],
      reference: { type: "none", display: "Kein Grenzwert der planetaren Grenzen; unter 1 Mio. km² gilt als praktisch eisfreier September" },
      sourceRefs: ["src_uhh_sia_2025"],
      finding: `Das Septembermittel des NOAA/NSIDC-CDR sank von ${de(firstObserved[1])} Mio. km² (${firstObserved[0]}) auf ${de(latest[1])} Mio. km² (${latest[0]}).`,
      methodNote: "UHH berechnet die monatliche Meereisfläche als Summe aus Gitterzellfläche mal Eiskonzentration. Für das Beobachtungssegment wird ausschließlich die Variable nsidc_cdr verwendet.",
      uncertainty: "Keine numerische Produktunsicherheit veröffentlicht; algorithmische Unterschiede und verbleibende räumliche beziehungsweise zeitliche Datenlücken sind zu berücksichtigen.",
      provenance: {
        sourceFile: "SeaIceArea__NorthernHemisphere__monthly__UHH__v2025_fv0.01.nc",
        sourceUrl: uhhObservationRecordUrl,
        locator: "NetCDF-Variable nsidc_cdr; Zeitdimension mit Monat 09; Jahre 1979–2024.",
        fields: ["time → Jahr und Monat", "nsidc_cdr → monatliche Meereisfläche der Nordhalbkugel in 10^6 km²"],
        extraction: `Ausgelesen wurden alle ${observationRows.length} Septemberwerte 1979–2024 aus nsidc_cdr. Quelldatei geprüft mit MD5 2e51a0e75d689ad84889beb656e6901d.`,
        transformation: "Keine Glättung, Mittelung oder Interpolation im GWL-Import; 10^6 km² wird nur als Mio. km² beschriftet."
      },
      historicalSegments: [
        {
          id: "arctic_september_sea_ice_area_walsh_1850_1978",
          label: "Historische Walsh-Rekonstruktion",
          period: "1850–1978",
          method: "UHH-Meereisfläche aus monatlichen Walsh-v2-Konzentrationsfeldern, die historische Schiffs-, Boden-, Luft- und Eisservice-Beobachtungen zusammenführen und Lücken füllen.",
          uncertainty: "Quellendichte und räumliche Abdeckung ändern sich stark über die Zeit; UHH veröffentlicht für diese Reihe kein numerisches Unsicherheitsband.",
          sourceRefs: ["src_uhh_sia_2024"],
          provenance: {
            sourceFile: "SeaIceArea__NorthernHemisphere__monthly__UHH__v2024_fv0.01.nc",
            sourceUrl: uhhHistoricalRecordUrl,
            locator: "NetCDF-Variable walsh; Zeitdimension mit Monat 09; Jahre 1850–1978.",
            fields: ["time → Jahr und Monat", "walsh → monatliche Meereisfläche der Nordhalbkugel in 10^6 km²"],
            extraction: `Ausgelesen wurden alle ${reconstructionRows.length} Septemberwerte 1850–1978 aus walsh. Quelldatei geprüft mit MD5 d959e75624e061f76a1f909e0b4bb64a.`,
            transformation: "Keine Glättung oder Interpolation; das Segment endet vor Beginn des satellitengestützten Beobachtungssegments."
          },
          points: reconstructionRows.map(([year, value]) => ({
            year,
            value,
            display: `${year} · ${de(value)} Mio. km² · UHH/Walsh · rekonstruiert`,
            finding: `${year}: rekonstruiertes Septembermittel ${de(value)} Mio. km².`,
            uncertainty: "Historische Rekonstruktion mit zeitlich wechselnder Quellenabdeckung; keine direkte Satellitenmessung.",
            sourceRefs: ["src_uhh_sia_2024"]
          }))
        }
      ],
      methodBreaks: [{ year: 1979, label: "Beginn des satellitengestützten NOAA/NSIDC-CDR-Segments" }],
      points: observationRows.map(([year, value]) => ({
        year,
        value,
        display: `${year} · ${de(value)} Mio. km² · NOAA/NSIDC CDR · beobachtet`,
        finding: `${year}: satellitengestütztes Septembermittel ${de(value)} Mio. km².`,
        uncertainty: "UHH veröffentlicht keine eigene numerische Unsicherheit für diesen Reihenwert.",
        sourceRefs: ["src_uhh_sia_2025"]
      }))
    }
  ],
  projectionAssessment: {
    grade: "robust_scenario_projection",
    method: "IPCC-bewertete CMIP6-Multi-Modell-Mittel der arktischen September-Meereisfläche; 5–95-%-Modellbereiche sind punktbezogen dokumentiert.",
    scope: "Drei ausgewählte SSPs und drei 20-Jahres-Zeiträume. Die Diagrammpositionen 2030, 2050 und 2090 markieren nur die Periodenmitte."
  },
  projectionSeries: Object.entries(scenarioRows).map(([key, rows]) => {
    const labels = {
      ssp119: ["SSP1-1.9", "SSP1-1.9 · sehr niedrige Emissionen"],
      ssp245: ["SSP2-4.5", "SSP2-4.5 · mittlere Emissionen"],
      ssp370: ["SSP3-7.0", "SSP3-7.0 · hohe Emissionen"]
    };
    const [scenario, scenarioLabel] = labels[key];
    return {
      id: `arctic_september_sea_ice_area_${key}`,
      observedSeriesId: "arctic_september_sea_ice_area_1979_2024",
      scenario,
      scenarioLabel,
      period: "2021–2100",
      unit: "Mio. km²",
      method: "CMIP6-Multi-Modell-Mittel der arktischen September-Meereisfläche für 20-jährige Zeiträume aus IPCC AR6 WGI Tabelle 4.4.",
      uncertainty: "Die angegebenen Spannen sind 5–95-%-Bereiche über die verwendeten Modelle; interne Variabilität und Modellunterschiede bleiben enthalten.",
      sourceRefs: ["src_ipcc_ar6_ch4"],
      provenance: {
        sourceFile: "IPCC_AR6_WGI_Chapter04.pdf",
        sourceUrl: ipccPdfUrl,
        locator: `Tabelle 4.4; Zeilen September; Spalte ${scenario}; Zeiträume 2021–2040, 2041–2060 und 2081–2100.`,
        fields: ["Zeitraum → 20-Jahres-Fenster", `${scenario} → Multi-Modell-Mittel und 5–95-%-Bereich in 10^6 km²`],
        extraction: "Übernommen wurden Mittelwert sowie untere und obere Modellspanne für die drei veröffentlichten September-Zeiträume.",
        transformation: "Mio. km² unverändert; nur die Darstellungsposition wird auf die Periodenmitte 2030, 2050 beziehungsweise 2090 gesetzt. Keine Interpolation zwischen den Punkten."
      },
      points: rows.map(([year, value, low, high, period]) => ({
        year,
        value,
        period,
        low,
        high,
        display: `${period} · ${de(value, 1)} Mio. km² · ${scenario} · modelliert`,
        finding: `${period}: Multi-Modell-Mittel ${de(value, 1)} Mio. km²; 5–95-%-Bereich ${de(low, 1)}–${de(high, 1)} Mio. km².`,
        uncertainty: `5–95-%-Modellbereich ${de(low, 1)}–${de(high, 1)} Mio. km²; Szenario, keine Einzeljahresprognose.`,
        sourceRefs: ["src_ipcc_ar6_ch4"]
      }))
    };
  })
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`September-Meereisfläche geschrieben: ${observationRows.length} Beobachtungsjahre, ${reconstructionRows.length} Rekonstruktionsjahre, ${Object.keys(scenarioRows).length} Projektionen.`);
