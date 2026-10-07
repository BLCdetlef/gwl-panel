import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = async name => JSON.parse(await fs.readFile(new URL(name, root), 'utf8'));
const write = async (name, value) => fs.writeFile(new URL(name, root), JSON.stringify(value, null, 2) + '\n');
const csv = await fs.readFile(new URL('research/curve-candidates/world-population/population-with-projections.csv', root), 'utf8');
const rows = csv.trim().split(/\r?\n/).slice(1).filter(line => line.startsWith('World,OWID_WRL,')).map(line => {
  const [, , year, future, past] = line.split(',');
  return { year: Number(year), past: past === '' ? null : Number(past), future: future === '' ? null : Number(future) };
}).filter(row => row.year >= 1700 && row.year <= 2100);
assert.ok(rows.length > 300);
const unit = 'Mrd. Menschen';
const seriesId = 'world_population_un_1950_2023';
const source = 'data/knowledge/world_population_global.json';
const sourceUrl = 'https://ourworldindata.org/grapher/population-with-projections.csv';
const display = value => `${value.toLocaleString('de-DE', { maximumFractionDigits: 3 })} ${unit}`;
const points = (start, end, field, ref) => rows.filter(row => row.year >= start && row.year <= end && row[field] !== null).map(row => ({year: row.year, value: row[field] / 1e9, display: display(row[field] / 1e9), sourceRefs: [ref]}));
const provenance = (start, end, column) => ({sourceFile: 'research/curve-candidates/world-population/population-with-projections.csv', sourceUrl, locator: `Entity=World, Code=OWID_WRL, Year=${start}–${end}; ${column}. Metadaten: population-with-projections.metadata.json, Download 07.10.2026.`, fields: ['Entity', 'Code', 'Year', column], extraction: 'Nur publizierte World-Zeilen und der angegebene Zeitraum; keine eigene Länderaggregation.', transformation: 'Personenzahl / 1.000.000.000 = Milliarden Menschen. Keine Interpolation, Glättung oder Kalibrierung.'});
const observed = points(1950, 2023, 'past', 'un_wpp_2024');
const projected = points(2024, 2100, 'future', 'un_wpp_2024');
assert.equal(observed.length, 74);
assert.equal(projected.length, 77);
const uncertainty = 'Demografische Schätzungen, keine jährliche Vollzählung. Quellenwechsel 1800 und 1950 ohne Kalibrierung. Bevölkerungszahl allein beschreibt weder Umweltbelastung noch eine ökologische Tragfähigkeitsgrenze oder individuelle Gesundheitswirkung.';
const methodNote = '1700–1799: publizierte HYDE-3.3-Stützwerte; 1800–1949: Gapminder v7, Weltaggregation durch OWID; 1950–2023: UN WPP 2024, Bevölkerung zur Jahresmitte; 2024–2100: UN WPP 2024, mittlere Projektion. Bezug der World-Reihen über OWID, keine eigene Länderaggregation. Alle Abschnitte ohne zeitliche Überlappung; nur Originalstützwerte, Umrechnung in Milliarden Menschen.';
const history = [
  {id: 'world_population_hyde_1700_1799', label: 'Historische Rekonstruktion · HYDE 3.3', period: '1700–1799 · verfügbare Stützwerte', method: 'HYDE 3.3 (2023), globale historische Rekonstruktion via OWID.', sourceRefs: ['hyde_2023'], provenance: provenance(1700, 1799, 'Population'), points: points(1700, 1799, 'past', 'hyde_2023'), uncertainty: 'Historische Rekonstruktion mit unregelmäßigen Stützjahren; keine ergänzten Zwischenwerte.'},
  {id: 'world_population_gapminder_1800_1949', label: 'Historische Rekonstruktion · Gapminder v7', period: '1800–1949', method: 'Gapminder v7 (2022); publizierte Weltaggregation von OWID.', sourceRefs: ['gapminder_v7'], provenance: provenance(1800, 1949, 'Population'), points: points(1800, 1949, 'past', 'gapminder_v7'), uncertainty: 'Historische Schätzungen; Anschluss an HYDE und UN ohne Niveaukorrektur.'}
];
const last = observed.at(-1);
const network = {
  format: 'gwl-knowledge-network-v1.3', version: '0.1', status: 'reviewed', schemaRef: 'data/schema/node-level-types-v1.3-draft.json', topic: 'Weltbevölkerung / demografische Entwicklung',
  entry: {systemBoundary: 'Technologische & soziale Umwelt', domainComponent: 'Bevölkerung', subComponent: 'Weltbevölkerung – UN', contributionRole: 'deepening_without_organ', effectFocus: 'Übergreifende demografische Kontextgröße und Bezugsgröße für Pro-Kopf-Indikatoren'},
  corePrinciples: ['Bevölkerungsschätzung ist keine direkte jährliche Messung.', 'Historische Rekonstruktion, UN-Schätzungen und Zukunftsprojektion bleiben getrennt und überlappen nicht.', 'Aus Bevölkerungszahlen werden weder Umweltgrenzwerte noch Gesundheitsmarker abgeleitet.'],
  nodes: [{id: 'eah_tech_social_environment', type: 'eah_system_boundary', label: 'Technologische & soziale Umwelt'}, {id: 'world_population', type: 'socio_technical_state', label: 'Weltbevölkerung'}],
  edges: [{from: 'eah_tech_social_environment', to: 'world_population', relationType: 'contains_deepening', evidenceStatus: 'strong'}],
  studyEvidence: [{id: 'un_population_estimates', sourceRefs: ['un_wpp_2024', 'owid_population'], design: 'Institutionelle demografische Schätzreihe aus Volkszählungen, Registern und Befragungen.', finding: `2023: ${display(last.value)}; historische Schätzreihe 1950–2023.`, evidenceStatus: 'strong'}],
  measurements: [{id: 'world_population_2023', node: 'world_population', label: 'UN-Bevölkerungsschätzung', metric: 'Weltbevölkerung zur Jahresmitte', value: last.value, unit, year: 2023, period: '2023', geography: 'Global', display: display(last.value), sourceRefs: ['un_wpp_2024'], uncertainty: 'Demografische Schätzung der UN-Revision 2024.'}],
  presentation: {summaryCardMode: 'narrative', effectSummary: 'Die Weltbevölkerung stieg nach UN-Schätzungen von rund 2,49 Milliarden im Jahr 1950 auf 8,09 Milliarden im Jahr 2023. Historische Rekonstruktionen erweitern die Kurve ab 1700; die mittlere UN-Projektion reicht von 2024 bis 2100. Die Bevölkerungszahl dient als demografische Kontextgröße.', primaryMeasurementId: 'world_population_2023', primaryTimeSeriesId: seriesId, gwlTimeSeriesDisplay: 'link_only', hideTimeSeriesInKnowledgeView: true, referenceLabel: 'Demografische Kontextgröße · kein Grenzwert', finding: 'Weltbevölkerung – UN; Rekonstruktion und Projektion als getrennte Abschnitte.', uncertainty},
  pathways: [], boundaryInteractions: [], healthContext: {bodymapStatus: 'not_applicable', systemImpacts: [], markerSignals: [], bodymapRule: 'Keine Organmarker aus der globalen Bevölkerungszahl ableiten.'}, knowledgeGaps: [],
  sources: [
    {id: 'un_wpp_2024', title: 'World Population Prospects 2024', publisher: 'United Nations DESA, Population Division', year: 2024, url: 'https://population.un.org/wpp/', access: 'open_full_text'},
    {id: 'hyde_2023', title: 'History Database of the Global Environment 3.3', publisher: 'PBL / Utrecht University', year: 2023, url: 'https://landuse.sites.uu.nl/hyde/', access: 'open_full_text'},
    {id: 'gapminder_v7', title: 'Population, version 7', publisher: 'Gapminder', year: 2022, url: 'https://www.gapminder.org/data/documentation/gd003/', access: 'open_full_text'},
    {id: 'owid_population', title: 'Population – HYDE, Gapminder, UN; source documentation and processing', publisher: 'Our World in Data', year: 2024, url: 'https://ourworldindata.org/population-sources', access: 'open_full_text'}
  ],
  navigationRule: {group: 'Bevölkerung', item: 'Weltbevölkerung – UN', classification: 'demographic_context'},
  timeSeries: [{id: seriesId, label: 'Weltbevölkerung – UN', metric: 'Weltbevölkerung zur Jahresmitte', unit, geography: 'Global', period: '1950–2023 · UN-Bevölkerungsschätzung', dataNature: 'assessed_model_estimate', worseningDirection: 'increase', reference: {type: 'none'}, sourceRefs: ['un_wpp_2024'], provenance: provenance(1950, 2023, 'Population'), methodNote, uncertainty, finding: 'Bevölkerungsgröße; steigende Werte bedeuten mehr Menschen, keine bewertete Verschlechterung.', methodBreaks: [{year: 1800, label: 'Quellenwechsel HYDE → Gapminder', detail: 'Historische Rekonstruktionen unterschiedlicher Herkunft; keine Kalibrierung.'}, {year: 1950, label: 'Quellenwechsel Gapminder → UN', detail: 'Beginn der demografischen UN-Schätzreihe.'}, {year: 2024, label: 'Beginn der UN-Projektion', detail: 'Ab 2024 mittlere Projektion der Revision 2024, keine historischen Schätzwerte.'}], historicalSeries: history, points: observed}],
  projectionAssessment: {grade: 'qualified_scenario_projection', method: 'Publizierte mittlere UN-Projektion, WPP 2024.', scope: 'Global; 2024–2100'},
  projectionSeries: [{id: 'world_population_un_medium_2024_2100', observedSeriesId: seriesId, scenario: 'UN_MEDIUM', scenarioLabel: 'UN WPP 2024 · mittlere Projektion', period: '2024–2100', unit, sourceRefs: ['un_wpp_2024'], method: 'Publizierte UN-Medium-Variante via OWID. Keine eigene Trendfortschreibung.', uncertainty: 'Bedingte demografische Projektion. Der verwendete OWID-Download enthält ausschließlich den mittleren Pfad und keine numerischen probabilistischen Intervallgrenzen; daher wird kein Unsicherheitsband erzeugt.', provenance: provenance(2024, 2100, 'Population (projections) (Projected)'), points: projected}]
};
await write(source, network);
const index = await read('data/knowledge/knowledge-index.json');
const boundary = index.systemBoundaries.find(b => b.id === 'eah_tech_social_environment');
let group = boundary.groups.find(g => g.id === 'population');
if (!group) { group = {id: 'population', label: 'Bevölkerung', items: []}; boundary.groups.push(group); }
if (!group.items.some(item => item.id === 'world-population')) group.items.push({id: 'world-population', label: 'Weltbevölkerung – UN', type: 'component', contributionRole: 'deepening_without_organ', source});
await write('data/knowledge/knowledge-index.json', index);
const manifest = await read('data/blc/curve-approvals-v1.json');
const curveId = `knowledge:${source}#${seriesId}`;
if (!manifest.approvedCurves.some(c => c.curveId === curveId)) manifest.approvedCurves.push({kind: 'knowledge', source, seriesId, boundaryId: 'mental-load', itemId: 'world-population', curveId, curveRole: 'deep_dive', status: 'approved', note: 'Übernahme vom Benutzer am 07.10.2026 beauftragt. Demografische Kontextgröße: Rekonstruktion 1700–1949, UN-Schätzungen 1950–2023, mittlere UN-Projektion 2024–2100; keine Überlappung, kein Grenzwert und keine Gesundheitsmarker.'});
await write('data/blc/curve-approvals-v1.json', manifest);
console.log(`Weltbevölkerung importiert: ${history.reduce((n, h) => n + h.points.length, 0)} historische Stützwerte, 74 UN-Schätzwerte, 77 Projektionswerte.`);
