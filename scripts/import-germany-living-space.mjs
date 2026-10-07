import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const read = async p => JSON.parse(await fs.readFile(new URL('../' + p, import.meta.url), 'utf8'));
const write = async (p, v) => fs.writeFile(new URL('../' + p, import.meta.url), JSON.stringify(v, null, 2) + '\n');
const c = await read('research/curve-candidates/germany_living_space_per_capita.json');
assert.equal(c.observations.points.length, 45);
assert.deepEqual(c.observations.segments.flatMap(s => s.points), c.observations.points);
const source = 'data/knowledge/germany_living_space_per_capita.json';
const id = 'germany_living_space_per_capita_1950_2025';
const methodNote = c.methodNote + ' Gebietswechsel 1990; Zählungswechsel 1994 und 2010, Bevölkerungsgrundlage 2011 sowie Zensus 2022. Die frühen Stützwerte stammen aus einer UBA-Zusammenstellung amtlicher Statistik; ihre jeweiligen Erhebungsmethoden sind dort nicht vollständig ausgewiesen. Der Rückgang 2014 → 2015 ist nicht als Rückgang der gesamten Wohnfläche zu lesen: Die Kennzahl hängt auch von der Bevölkerung ab.';
const finding = '15,0 m²/Person 1950 im früheren Bundesgebiet; 49,5 m²/Person 2025 in Deutschland. Die Endpunkte haben unterschiedliche Gebietsbezüge und statistische Grundlagen.';
const n = {
  format: 'gwl-knowledge-network-v1.3', version: '0.1', status: 'reviewed',
  schemaRef: 'data/schema/node-level-types-v1.3-draft.json', topic: c.title,
  entry: { systemBoundary: c.systemBoundary, domainComponent: c.group, subComponent: c.title, contributionRole: 'deepening_without_organ', effectFocus: 'Wohnflächenbestand je Einwohner als Kennzahl der menschengemachten Wohnumwelt' },
  corePrinciples: ['Verfügbare Wohnfläche des Wohnungsbestands je Einwohner; einschließlich Leerstand. Keine Aussage über die Verteilung oder individuelle Wohnversorgung.', 'Bis 1989 früheres Bundesgebiet, ab 1990 Gesamtdeutschland; Originalwerte werden nicht aneinander kalibriert.', 'Wohnfläche ist ein Bestand, kein jährlicher Baustoffdurchsatz, Energieverbrauch oder Gesundheitsendpunkt.'],
  nodes: [{ id: 'eah_tech_social_environment', type: 'eah_system_boundary', label: c.systemBoundary, framework: 'eah_extension' }, { id: 'component_housing_environment', type: 'domain_component', label: c.group }, { id: 'state_living_space', type: 'system_state', label: c.title }],
  edges: [{ from: 'eah_tech_social_environment', to: 'component_housing_environment', relationType: 'contains', evidenceStatus: 'strong' }, { from: 'component_housing_environment', to: 'state_living_space', relationType: 'contains', evidenceStatus: 'strong' }],
  studyEvidence: [{ id: 'housing_stock_statistics', sourceRefs: c.sourceRegister.map(s => s.id), design: 'Historische veröffentlichte Statistik und amtliche Wohnungsbestandsfortschreibung mit wechselnden Zählungsgrundlagen', finding, evidenceStatus: 'strong' }],
  measurements: [{ id: 'living_space_2025', node: 'state_living_space', label: c.title, metric: c.definition, value: 49.5, unit: c.unit, year: 2025, period: '2025', geography: 'Deutschland', display: '49,5 m²/Person', sourceRefs: ['destatis_2026'] }],
  presentation: { summaryCardMode: 'narrative', primaryMeasurementId: 'living_space_2025', primaryTimeSeriesId: id, effectSummary: finding, gwlTimeSeriesDisplay: 'link_only', hideTimeSeriesInKnowledgeView: true, referenceLabel: 'Kein belegter Grenzwert · Wohnflächenbestand', finding, uncertainty: c.uncertainty },
  pathways: [], boundaryInteractions: [],
  healthContext: { bodymapStatus: 'not_applicable_from_stock_indicator', systemImpacts: [], bodymapRule: 'Keine Organmarker oder Krankheitslast aus dem nationalen Wohnflächenbestand pro Kopf ableiten.' },
  knowledgeGaps: [{ question: 'Wie vergleichbar sind die historischen Erhebungs- und Revisionsgrundlagen vor 1990?', reason: 'In der verwendeten Zusammenstellung nicht vollständig ausgewiesen.', workingDecision: 'Originalwerte und historischen Gebietsbezug bewahren.' }, { question: 'Ist eine Zukunftsprojektion belegt?', reason: 'Kein qualifiziertes Szenario recherchiert.', workingDecision: 'Keine kurze Trendfortschreibung über Zensuswechsel.' }],
  sourcePolicy: { rule: methodNote },
  navigationRule: { group: c.group, item: c.title, classification: 'housing_stock_per_capita_timeseries' },
  sources: c.sourceRegister.map(s => ({ ...s, access: 'open_full_text' })),
  timeSeries: [{ id, label: c.title, metric: c.definition, unit: c.unit, geography: c.geography, period: '1950–2025', dataStartYear: 1950, dataEndYear: 2025, dataNature: 'observed', worseningDirection: 'increase', reference: { type: 'none' }, sourceRefs: c.sourceRegister.map(s => s.id), methodNote, uncertainty: c.uncertainty, finding,
    provenance: { sourceFile: '2341.pdf; 2050300037004.pdf; 2050300167004.pdf; GENESIS 31231-0001', sourceUrl: 'https://genesis.destatis.de/datenbank/online/table/31231-0001', locator: 'Zusammengesetzte Statistikreihe; genaue Fundstellen und Quellen je observationSegments, 1990 separat aus 35 Jahre Deutsche Einheit.', fields: ['Jahr / Stichtag', 'Wohnfläche je Person / Einwohner (m²)'], extraction: '9 historische Stützwerte 1950–1989 und 36 Jahreswerte 1990–2025. Veröffentlichungsstände werden je Punkt und Segment bewahrt.', transformation: 'Originalwerte unverändert; keine Interpolation, Glättung, Niveauverschiebung oder West-Ost-Korrektur.' },
    observationSegments: c.observations.segments,
    methodBreaks: c.methodBreaks,
    contextNotes: [...c.contextNotes, { id: 'housing_source_revisions', label: 'Quellenstände und abweichende Werte', value: 'Originalwerte verschiedener Veröffentlichungsstände', detail: 'UBA-Tabelle ab 1990 wegen abweichender Angaben nicht verwendet. 2016: aktueller recherchierter GENESIS-Wert 46,3 statt 46,5 in Fachserie 2016. Abweichende Originalwerte und Quellen bleiben im Recherchekandidaten erhalten. Die frühe Reihe ist historische Statistik, keine eigene Rekonstruktion.', sourceRefs: ['uba_2003', 'destatis_2016', 'destatis_2026'] }], points: c.observations.points }],
  projectionAssessment: { grade: 'not_projectable', method: 'Kein belegtes Szenario; Gebiets- und Zensuswechsel schließen eine ungeprüfte Trendfortschreibung aus.', scope: c.geography }, projectionSeries: []
};
await write(source, n);
const index = await read('data/knowledge/knowledge-index.json');
const boundary = index.systemBoundaries.find(b => b.id === 'eah_tech_social_environment');
let group = boundary.groups.find(g => g.id === 'housing_environment');
if (!group) { group = { id: 'housing_environment', label: c.group, items: [] }; boundary.groups.push(group); }
if (!group.items.some(i => i.source === source)) group.items.push({ id: 'germany-living-space-per-capita', label: c.title, type: 'component', contributionRole: 'deepening_without_organ', source });
await write('data/knowledge/knowledge-index.json', index);
const manifest = await read('data/blc/curve-approvals-v1.json');
if (!manifest.approvedCurves.some(a => a.source === source)) manifest.approvedCurves.push({ kind: 'knowledge', source, seriesId: id, boundaryId: 'mental-load', itemId: 'germany-living-space-per-capita', curveId: `knowledge:${source}#${id}`, curveRole: 'deep_dive', status: 'approved', note: '45 Originalwerte, 75 Jahre; bis 1989 früheres Bundesgebiet, ab 1990 Deutschland. Sechs Statistiksegmente mit Quellen und Methodenwechseln. Keine Kalibrierung, Rekonstruktion, Projektion oder Organmarker.' });
await write('data/blc/curve-approvals-v1.json', manifest);
console.log('Wohnflächenreihe regulär registriert: 45 Originalwerte, 6 Statistiksegmente.');
