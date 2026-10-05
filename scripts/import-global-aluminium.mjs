import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const candidate=JSON.parse(await fs.readFile(new URL('../research/curve-candidates/02_stoff_energiestroeme_aluminium_primaerproduktion_global.json',import.meta.url),'utf8'));
assert.deepEqual(candidate.observations.points.map(p=>p.year),Array.from({length:72},(_,i)=>1950+i));
assert.equal(candidate.projectionSeries[0].scenario,'B2DS');
const network={
  "format": "gwl-knowledge-network-v1.3",
  "version": "0.1",
  "status": "reviewed",
  "schemaRef": "data/schema/node-level-types-v1.3-draft.json",
  "topic": "Stoff- und Energieströme / globale Primäraluminiumproduktion (1950–2050)",
  "entry": {
    "systemBoundary": "Stoff- und Energieströme",
    "domainComponent": "Rohstoffe",
    "subComponent": "Globale Primäraluminiumproduktion",
    "contributionRole": "deepening_without_organ",
    "effectFocus": "Globale Gewinnung neuen Aluminiummetalls als menschlicher Materialdurchsatz"
  },
  "corePrinciples": [
    "Produktion und Verbrauch sind getrennte Größen.",
    "Recyclingproduktion und Legierungszusätze sind ausgeschlossen.",
    "Eine Materialmenge ist kein Grenzwert und keine individuelle Dosis."
  ],
  "nodes": [
    {
      "id": "eah_material_energy_flows",
      "type": "eah_system_boundary",
      "label": "Stoff- und Energieströme",
      "framework": "eah_extension"
    },
    {
      "id": "component_raw_materials",
      "type": "domain_component",
      "label": "Rohstoffe"
    },
    {
      "id": "flow_primary_aluminium",
      "type": "system_flow",
      "label": "Globale Primäraluminiumproduktion"
    }
  ],
  "edges": [
    {
      "from": "eah_material_energy_flows",
      "to": "component_raw_materials",
      "relationType": "contains",
      "evidenceStatus": "strong"
    },
    {
      "from": "component_raw_materials",
      "to": "flow_primary_aluminium",
      "relationType": "contains",
      "evidenceStatus": "strong"
    }
  ],
  "studyEvidence": [
    {
      "id": "usgs_primary_aluminium",
      "sourceRefs": [
        "usgs_ds140_aluminum_2021"
      ],
      "design": "Amtliche jährliche Produktionsstatistik einschließlich Schätzungen",
      "finding": "72 Jahreswerte 1950–2021; 1,49 auf 67,5 Mio. t Al/Jahr.",
      "evidenceStatus": "strong"
    }
  ],
  "measurements": [
    {
      "id": "aluminium_production_2021",
      "node": "flow_primary_aluminium",
      "metric": "Globale Primäraluminiumproduktion",
      "label": "Primäraluminiumproduktion",
      "value": 67.5,
      "unit": "Mio. t Al/Jahr",
      "year": 2021,
      "period": "2021",
      "geography": "Global",
      "display": "67,5 Mio. t Al/Jahr",
      "sourceRefs": [
        "usgs_ds140_aluminum_2021"
      ]
    }
  ],
  "presentation": {
    "summaryCardMode": "narrative",
    "effectSummary": "Die globale Primäraluminiumproduktion stieg von 1,49 Mio. t im Jahr 1950 auf 67,5 Mio. t im Jahr 2021 (USGS). Das getrennte IAI-B2DS-Szenario aus 2021 erreicht rund 81,46 Mio. t im Jahr 2050. Erfasst wird neues Metall aus Elektrolyse; Recyclingaluminium ist ausgeschlossen.",
    "primaryMeasurementId": "aluminium_production_2021",
    "primaryTimeSeriesId": "global_primary_aluminium_production_1950_2021",
    "gwlTimeSeriesDisplay": "link_only",
    "hideTimeSeriesInKnowledgeView": true,
    "referenceLabel": "Kein Grenzwert · globaler Materialdurchsatz",
    "finding": "Eine historische Produktionskurve mit einem getrennten, bedingten B2DS-Szenario.",
    "uncertainty": "Die USGS-Reihe umfasst gemeldete, berechnete und geschätzte Werte. Das IAI-Szenario ist bedingt und stammt aus 2021; es ist keine aktuelle bedingungslose Prognose. Quellenwerte sind nicht identisch: 2021 USGS 67,5 und IAI-Factsheet 2024 67,1 Mio. t. Keine Kalibrierung; keine Vermischung mit späteren BAU- oder 1,5-Grad-Ausgaben."
  },
  "pathways": [],
  "boundaryInteractions": [],
  "healthContext": {
    "bodymapStatus": "not_applicable_from_global_material_flow",
    "systemImpacts": [],
    "bodymapRule": "Keine Organmarker aus globaler Produktionsmenge ableiten."
  },
  "knowledgeGaps": [],
  "navigationRule": {
    "group": "Rohstoffe",
    "item": "Globale Primäraluminiumproduktion",
    "classification": "global_material_throughput_timeseries"
  },
  "sources": [
    {
      "id": "usgs_ds140_aluminum_2021",
      "title": "Aluminum – Historical Statistics (Data Series 140), 2021 update",
      "authors": "U.S. Geological Survey",
      "publisher": "U.S. Geological Survey",
      "year": 2023,
      "url": "https://www.usgs.gov/media/files/aluminum-historical-statistics-data-series-140",
      "access": "open_full_text"
    },
    {
      "id": "iai_b2ds_production_2021",
      "title": "B2DS-aligned GHG Emissions by Unit Process – Data and Methodology",
      "authors": "International Aluminium Institute",
      "publisher": "International Aluminium Institute",
      "year": 2021,
      "url": "https://international-aluminium.org/wp-content/uploads/2021/09/B2DS-aligned-GHG-Emissions-by-Unit-Process-Data-and-Methodology.zip",
      "access": "open_full_text"
    }
  ],
  "timeSeries": [
    {
      "id": "global_primary_aluminium_production_1950_2021",
      "label": "Globale Primäraluminiumproduktion",
      "metric": "Globale Primäraluminiumproduktion aus Elektrolyse",
      "unit": "Mio. t Al/Jahr",
      "geography": "Global",
      "period": "1950–2021",
      "dataNature": "assessed_model_estimate",
      "worseningDirection": "increase",
      "reference": {
        "type": "none"
      },
      "sourceRefs": [
        "usgs_ds140_aluminum_2021"
      ],
      "methodNote": "1950–2021: USGS Data Series 140, World production, globale Primärproduktion. Projektion: IAI B2DS, Ausgabe 2021, fünf Stützwerte 2030/2035/2040/2045/2050. Primärmetall aus Elektrolyse; kein Recycling und keine Legierungszusätze. Quellen- und Methodenwechsel zum Szenario, ohne Niveauanpassung.",
      "uncertainty": "Die USGS-Reihe umfasst gemeldete, berechnete und geschätzte Werte. Das IAI-Szenario ist bedingt und stammt aus 2021; es ist keine aktuelle bedingungslose Prognose. Quellenwerte sind nicht identisch: 2021 USGS 67,5 und IAI-Factsheet 2024 67,1 Mio. t. Keine Kalibrierung; keine Vermischung mit späteren BAU- oder 1,5-Grad-Ausgaben.",
      "finding": "Produktionsdurchsatz; steigende Werte bedeuten eine größere Menge neu gewonnenen Metalls, keinen quantifizierten Umweltschaden.",
      "provenance": {
        "sourceFile": "ds140-aluminum-2021.xlsx",
        "sourceUrl": "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/files/ds140-aluminum-2021.xlsx",
        "locator": "Zeilen 56–127: 1950–2021; Einheit im Tabellenkopf; eingebettetes Word-Dokument, Abschnitt World Production",
        "fields": [
          "Year (Spalte A)",
          "World production (Spalte P)"
        ],
        "extraction": "72 lückenlose Jahreswerte 1950–2021, Blatt Aluminum, Spalte P. Globale Primärproduktion in eingebetteter Methodennotiz bestätigt.",
        "transformation": "Spalte P / 1 000 000; keine Interpolation oder Glättung"
      },
      "contextNotes": [
        {
          "id": "aluminium_projection_method",
          "label": "Quellen- und Methodenwechsel",
          "value": "USGS → IAI B2DS (2021)",
          "detail": "1950–2021: USGS Data Series 140, World production, globale Primärproduktion. Projektion: IAI B2DS, Ausgabe 2021, fünf Stützwerte 2030/2035/2040/2045/2050. Primärmetall aus Elektrolyse; kein Recycling und keine Legierungszusätze. Quellen- und Methodenwechsel zum Szenario, ohne Niveauanpassung. Die USGS-Reihe umfasst gemeldete, berechnete und geschätzte Werte. Das IAI-Szenario ist bedingt und stammt aus 2021; es ist keine aktuelle bedingungslose Prognose. Quellenwerte sind nicht identisch: 2021 USGS 67,5 und IAI-Factsheet 2024 67,1 Mio. t. Keine Kalibrierung; keine Vermischung mit späteren BAU- oder 1,5-Grad-Ausgaben.",
          "sourceRefs": [
            "usgs_ds140_aluminum_2021",
            "iai_b2ds_production_2021"
          ]
        }
      ],
      "points": []
    }
  ],
  "projectionAssessment": {
    "grade": "qualified_scenario_projection",
    "method": "Veröffentlichter IAI-B2DS-Produktionspfad, Ausgabe 2021; in der Methodik Primärmetall aus Elektrolyse. Kein eigener Trendfit.",
    "scope": "Global; fünf Quellenstützwerte 2030–2050."
  },
  "projectionSeries": [
    {
      "id": "global_primary_aluminium_iai_b2ds_2030_2050",
      "observedSeriesId": "global_primary_aluminium_production_1950_2021",
      "scenario": "B2DS",
      "scenarioLabel": "IAI B2DS · Ausgabe 2021",
      "period": "2030–2050",
      "unit": "Mio. t Al/Jahr",
      "method": "IAI Production (Mt), Primary, B2DS-Spalte Q; Szenarionotiz: Average of BLS and BOS, used in the pathways documents. Methodik Abschnitt 2.0 definiert Primäraluminium als flüssiges Metall aus Elektrolyse.",
      "uncertainty": "Die USGS-Reihe umfasst gemeldete, berechnete und geschätzte Werte. Das IAI-Szenario ist bedingt und stammt aus 2021; es ist keine aktuelle bedingungslose Prognose. Quellenwerte sind nicht identisch: 2021 USGS 67,5 und IAI-Factsheet 2024 67,1 Mio. t. Keine Kalibrierung; keine Vermischung mit späteren BAU- oder 1,5-Grad-Ausgaben.",
      "sourceRefs": [
        "iai_b2ds_production_2021"
      ],
      "provenance": {
        "sourceFile": "B2DS-aligned GHG Emissions by Unit Process - Data.xlsx",
        "sourceUrl": "https://international-aluminium.org/wp-content/uploads/2021/09/B2DS-aligned-GHG-Emissions-by-Unit-Process-Data-and-Methodology.zip",
        "locator": "Sheet1!Q22,Q34,Q46,Q58,Q70; Spalte Q B2DS; Zeile Primary in den Jahrblöcken 2030/2035/2040/2045/2050. Szenarionotizen A80:A83.",
        "fields": [
          "Primary (Spalte M)",
          "B2DS (Spalte Q)",
          "IAI Production (Mt)"
        ],
        "extraction": "Fünf numerische Quellenwerte aus den zwischengespeicherten XLSX-Zellen; BLS/BOS/BRS nicht beigemischt.",
        "transformation": "Mt = Mio. t; keine numerische Umrechnung, Glättung, Interpolation oder Kalibrierung."
      },
      "points": []
    }
  ]
};
network.timeSeries[0].points=candidate.observations.points;
network.projectionSeries[0].points=candidate.projectionSeries[0].points;
await fs.writeFile(new URL('../data/knowledge/02_stoff_energiestroeme_aluminium_primaerproduktion_global.json',import.meta.url),JSON.stringify(network,null,2)+'\n');
console.log('Aluminium importiert: 72 Jahreswerte und 5 getrennte B2DS-Stützwerte.');
