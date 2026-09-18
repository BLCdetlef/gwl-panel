import fs from "node:fs/promises";
import path from "node:path";

const [bestPath, lowPath, highPath] = process.argv.slice(2);
if (!bestPath || !lowPath || !highPath) throw new Error("Aufruf: node scripts/import-igcc-radiative-forcing.mjs BEST P05 P95");
const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));

function parseCsv(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/).map(line => line.split(","));
  const yearIndex = header.indexOf("timebound_lower");
  const valueIndex = header.indexOf("anthro");
  if (yearIndex < 0 || valueIndex < 0) throw new Error("IGCC-Spalten timebound_lower oder anthro fehlen.");
  return rows.map(columns => ({ year: Number(columns[yearIndex]), value: Number(columns[valueIndex]) }));
}

const [best, low, high] = await Promise.all([bestPath, lowPath, highPath].map(async file => parseCsv(await fs.readFile(file, "utf8"))));
if (best.length !== 276 || low.length !== best.length || high.length !== best.length || best[0].year !== 1750 || best.at(-1).year !== 2025) {
  throw new Error("Unerwartete IGCC-Zeitabdeckung.");
}
const lowByYear = new Map(low.map(point => [point.year, point.value]));
const highByYear = new Map(high.map(point => [point.year, point.value]));
const points = best.map(point => ({
  year: point.year,
  value: Number(point.value.toFixed(6)),
  display: `${point.year}: ${point.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/m²`,
  uncertainty: `IGCC 5–95-%-Bereich: ${lowByYear.get(point.year).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bis ${highByYear.get(point.year).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/m²`,
  sourceRefs: ["src_igcc_2025_data"]
}));
const latest = points.at(-1);

const payload = {
  format: "gwl-knowledge-network-v1.3",
  version: "0.1",
  topic: "Klimawandel / anthropogener effektiver Strahlungsantrieb",
  status: "reviewed-primary-sources",
  schemaRef: "data/schema/node-level-types-v1.3-draft.json",
  entry: {
    systemBoundary: "Planetare Grenzen",
    domainComponent: "Klimawandel",
    subComponent: "Anthropogener Strahlungsantrieb",
    contributionRole: "pg_core",
    effectFocus: "Gesamter anthropogener effektiver Strahlungsantrieb relativ zu 1750 als zweite Kontrollvariable der planetaren Grenze Klimawandel"
  },
  corePrinciples: [
    "Der gesamte anthropogene effektive Strahlungsantrieb umfasst erwärmende und kühlende menschliche Einflüsse; eine reine Treibhausgasreihe wäre dafür unvollständig.",
    "Die IGCC-Reihe ist eine jährlich aktualisierte, methodisch abgeleitete Schätzreihe und keine direkte Messreihe.",
    "Grenzwert und hoher Risikobereich stammen aus dem Modell der Planetaren Grenzen und sind von der IGCC-Schätzung zu trennen."
  ],
  measurements: [{
    id: "anthropogenic_erf_2025",
    metric: "Gesamter anthropogener effektiver Strahlungsantrieb relativ zu 1750",
    display: `2025: ${latest.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/m²`,
    value: latest.value,
    unit: "W/m²",
    period: "2025 relativ zu 1750",
    geography: "Global",
    interpretation: "Die zweite Klimakontrollvariable liegt deutlich oberhalb der planetaren Grenze von +1,0 W/m² und des hohen Risikobereichs von +1,5 W/m².",
    uncertainty: latest.uncertainty,
    sourceRefs: ["src_igcc_2025_data", "src_igcc_2025_paper", "src_richardson_pb_2023"]
  }],
  presentation: {
    primaryTimeSeriesId: "global_anthropogenic_erf_1750_2025",
    gwlTimeSeriesDisplay: "link_only",
    hideTimeSeriesInKnowledgeView: true,
    hidePathwaysInKnowledgeView: true,
    hideHealthContextInKnowledgeView: true,
    hideKnowledgePanelInKnowledgeView: true,
    referenceLabel: "Grenzwert nach dem Modell der Planetaren Grenzen: +1,0 W/m²",
    finding: `IGCC schätzt den gesamten anthropogenen effektiven Strahlungsantrieb 2025 auf ${latest.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/m² relativ zu 1750.`,
    effectPath: "Menschliche Emissionen und Landnutzungsänderungen → veränderte Strahlungsbilanz → Belastung der planetaren Klimagrenze",
    uncertainty: "Jährliche wissenschaftliche Schätzreihe nach IPCC-AR6-Methodik. Treibhausgase, Aerosole, Ozon, Kondensstreifen und Landnutzung werden zusammengeführt; besonders Aerosole und jüngste Emissionsdaten tragen erhebliche Unsicherheit."
  },
  timeSeries: [{
    id: "global_anthropogenic_erf_1750_2025",
    label: "Gesamter anthropogener effektiver Strahlungsantrieb · IGCC",
    metric: "Jährliche wissenschaftliche Schätzung des gesamten anthropogenen effektiven Strahlungsantriebs relativ zu 1750",
    unit: "W/m²",
    geography: "Global",
    period: "1750–2025",
    dataNature: "assessed_model_estimate",
    worseningDirection: "increase",
    reference: {
      type: "planetary_boundaries_model",
      role: "boundary",
      qualifier: "exact",
      exceedanceOperator: ">",
      value: 1,
      unit: "W/m²",
      display: "Grenzwert nach dem Modell der Planetaren Grenzen: +1,0 W/m² relativ zu 1750",
      sourceRefs: ["src_richardson_pb_2023"]
    },
    highRisk: { value: 1.5, unit: "W/m²", exceedanceOperator: ">", sourceRefs: ["src_richardson_pb_2023"] },
    finding: `2025: ${latest.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W/m²; planetare Grenze und hoher Risikobereich überschritten.`,
    uncertainty: "Abgeleitete IGCC-Schätzreihe mit 5–95-%-Unsicherheitsbereich; keine direkte Messreihe und keine Prognose.",
    methodNote: "IGCC-2025-Gesamtreihe 'anthro' nach IPCC-AR6-Methodik; jährliche Bestwerte aus ERF_best_aggregates.csv, Unsicherheiten aus ERF_p05_aggregates.csv und ERF_p95_aggregates.csv.",
    sourceRefs: ["src_igcc_2025_data", "src_igcc_2025_paper"],
    points
  }],
  pathways: [],
  healthContext: { systemImpacts: [], note: "Aus der globalen Kontrollvariable wird keine direkte Organwirkung abgeleitet." },
  knowledgeGaps: [],
  actionScope: { status: "not_part_of_boundary_measurement", methodNote: "Handlungsoptionen sind nicht Teil dieser Kontrollvariablen.", dimensions: [] },
  sources: [
    {
      id: "src_igcc_2025_data",
      title: "Indicators of Global Climate Change 2025 · Effective radiative forcing 1750–2025",
      authors: "Smith, C. et al.", publisher: "Zenodo / Climate Indicator Project", year: 2026,
      type: "open_assessed_model_dataset", doi: "10.5281/zenodo.20708818",
      url: "https://doi.org/10.5281/zenodo.20708818", access: "open_data"
    },
    {
      id: "src_igcc_2025_paper",
      title: "Indicators of Global Climate Change 2025: annual update of key indicators of the state of the climate system and human influence",
      authors: "Forster, P. M. et al.", publisher: "Earth System Science Data", year: 2026,
      type: "peer_reviewed_assessment", doi: "10.5194/essd-18-3889-2026",
      url: "https://doi.org/10.5194/essd-18-3889-2026", access: "open_full_text"
    },
    {
      id: "src_richardson_pb_2023", title: "Earth beyond six of nine planetary boundaries", authors: "Richardson, K. et al.",
      publisher: "Science Advances", year: 2023, type: "peer_reviewed_planetary_boundaries_assessment",
      doi: "10.1126/sciadv.adh2458", url: "https://doi.org/10.1126/sciadv.adh2458", access: "open_full_text"
    }
  ]
};

await fs.writeFile(path.join(projectRoot, "data", "knowledge", "gwl_climate_radiative_forcing_global_v0.1.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`IGCC-Strahlungsantrieb importiert: ${points.length} Jahreswerte, ${points[0].year}–${latest.year}, letzter Wert ${latest.value} W/m².`);
