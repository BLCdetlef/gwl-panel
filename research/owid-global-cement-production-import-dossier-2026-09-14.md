# Importdossier: Globale Zementproduktion (OWID/USGS)

## Kopf

- **Kandidaten-ID:** `owid-global-cement-production`
- **Arbeitstitel:** Globale Zementproduktion 1926–2024
- **Entscheidung:** `AUFNEHMEN`
- **Kurzbegründung:** Our World in Data stellt eine lückenlose globale Jahresreihe mit 99 Beobachtungspunkten bereit. Messgröße, Einheit, Raum- und Zeitbezug, Originalquellen, Verarbeitung und Nutzungsbedingungen sind dokumentiert. Die Reihe eignet sich als globaler Durchsatzindikator unter Stoff- und Energieströme, nicht als Zustands- oder Grenzwert einer Planetaren Grenze.
- **Recherchestand:** 2026-09-14

## Vorgesehener Import

- **Zieldatei:** `data/knowledge/gwl_cement_clinker_global_v0.1.json`
- **Zielobjekt:** neue beobachtete Reihe unter `timeSeries[]`
- **Empfohlene Reihen-ID:** `global_cement_production_1926_2024_owid_usgs`
- **Knoten:** `flow_global_cement_production`
- **Rolle:** beobachteter beziehungsweise amtlich geschätzter globaler Materialdurchsatz
- **Nicht Bestandteil dieses Dossiers:** Änderung von Paneldaten, Kurvenfreigabe oder BLC-Export

## Prüfkette

### 1. Menschliche Aktivität/Veränderung

- **Befund:** Die Reihe misst die jährliche globale Produktion hydraulischer Zemente aller Typen.
- **Evidenzstatus:** `belegt`
- **Quellen:** USGS Mineral Commodity Summaries und USGS Historical Statistics, durch Our World in Data harmonisiert.
- **Abgrenzung:** Zementproduktion ist nicht gleich Klinkerproduktion, Zementverbrauch, Rohstoffentnahme oder CO₂-Emission.

### 2. Vermittelnder Mechanismus

Zementnachfrage → Zement- und Klinkerproduktion → Kalzinierung karbonathaltiger Rohstoffe und Bereitstellung hoher Prozesstemperaturen → Prozess- und Energieemissionen → Beitrag zum Klimawandel.

Die Produktionsreihe belegt nur den ersten quantitativen Teil dieser Kette. Klinkeranteil und Emissionen bleiben eigenständige Messgrößen mit eigenen Quellen und Bezugsjahren.

### 3. Systemgrenzen-Zuordnung

- **Grenze:** Stoff- und Energieströme
- **Rolle:** `Treiber`
- **Begründung:** Die produzierte Materialmenge ist ein menschengemachter globaler Durchsatz.
- **Zusätzliche Kante:** Klimawandel, vermittelt über Klinkerherstellung, Kalzinierung und Prozessenergie.
- **Nicht zulässig:** Die Zementmenge selbst als planetare Kontrollvariable oder CO₂-Menge darstellen.

### 4. Messwerte und Abdeckung

- **Messgröße:** Cement production
- **Definition:** globale Produktion hydraulischer Zemente aller Typen
- **Einheit:** Tonnen pro Jahr
- **Geographie:** Welt (`OWID_WRL`)
- **Beobachtungszeitraum:** 1926–2024
- **Punktzahl:** 99 Jahreswerte
- **Lückenprüfung:** keine fehlenden Jahre zwischen 1926 und 2024
- **OWID-Indikator-ID:** `1131087`
- **OWID-Kurzname:** `production_cement_processing_tonnes`
- **OWID-Dataset-Version:** `2025-12-15`
- **Letzte Aktualisierung:** 2025-12-15
- **Nächste erwartete Aktualisierung:** 2026-12-15
- **Verarbeitungsniveau:** `major`
- **Weiterverteilung laut Metadaten:** `nonRedistributable: false`
- **Referenzwert/Grenzwert:** nicht vorhanden

Ausgewählte, direkt aus dem CSV geprüfte Werte:

| Jahr | Rohwert in t | Anzeigevorschlag |
|---:|---:|---:|
| 1926 | 62.400.000 | 62,4 Mio. t/Jahr |
| 1950 | 133.000.000 | 133 Mio. t/Jahr |
| 1970 | 571.800.000 | 571,8 Mio. t/Jahr |
| 1990 | 1.160.000.000 | 1,16 Mrd. t/Jahr |
| 2000 | 1.660.000.000 | 1,66 Mrd. t/Jahr |
| 2003 | 2.020.000.000 | 2,02 Mrd. t/Jahr |
| 2010 | 3.289.999.872 | 3,29 Mrd. t/Jahr |
| 2013 | 4.030.000.128 | 4,03 Mrd. t/Jahr |
| 2020 | 4.200.000.000 | 4,20 Mrd. t/Jahr |
| 2021 | 4.400.000.000 | 4,40 Mrd. t/Jahr |
| 2022 | 4.100.000.000 | 4,10 Mrd. t/Jahr |
| 2023 | 4.100.000.000 | 4,10 Mrd. t/Jahr |
| 2024 | 4.000.000.000 | 4,00 Mrd. t/Jahr |

Die nicht runden Rohwerte einzelner Jahre sind als numerische Speicherartefakte der bereitgestellten Reihe zu behandeln. Beim Import bleiben die gelieferten Zahlen unverändert; nur die Anzeige wird sachgerecht gerundet.

### 5. LEBEN/Gesundheit

- **Exposition/Dosis:** nicht belegt durch diese Reihe
- **Gesundheitsendpunkt:** nicht belegt durch diese Reihe
- **Krankheitslast/Zurechenbarkeit:** nicht belegt
- **Marker-/Farbfreigabe:** keine

Aus einer globalen Produktionsmenge darf kein individueller Expositions- oder Organstatus abgeleitet werden.

## Reproduzierbarer Abruf

- **Explorer:** <https://ourworldindata.org/explorers/minerals?Mineral=Cement&Metric=Production&Type=Processing&Share+of+global=false&country=~OWID_WRL>
- **CSV:** <https://ourworldindata.org/explorers/minerals.csv?country=~OWID_WRL&Mineral=Cement&Metric=Production&Type=Processing&Share+of+global=false>
- **Explorer-Metadaten:** <https://ourworldindata.org/explorers/minerals.metadata.json?country=~OWID_WRL&Mineral=Cement&Metric=Production&Type=Processing&Share+of+global=false>
- **Vollständige Indikator-Metadaten:** <https://api.ourworldindata.org/v1/indicators/1131087.metadata.json>
- **Abrufdatum:** 2026-09-14
- **CSV-Dateigröße beim Prüflauf:** 8.811 Byte
- **SHA-256 beim Prüflauf:** `848ed6f5170ffffc2481f37ac8316f98ddc9e546440fcc207050ef452988a326`

Der spätere Import muss die Metadaten erneut abrufen. Bei geänderter Dataset-Version oder Prüfsumme sind Zeitabdeckung, Definition, Schätzkennzeichnungen und Quellen vor der Übernahme erneut zu prüfen.

## Lizenz- und Rechteprüfung

### Ergebnis

Die vorgesehene Übernahme der numerischen Reihe ist nach den veröffentlichten Metadaten zulässig, sofern Our World in Data und die zugrunde liegenden USGS-Quellen genannt werden:

1. OWID kennzeichnet den Indikator mit `nonRedistributable: false` und die eigene wesentliche Aufbereitung als CC BY.
2. Die OWID-Nutzungsinformation erlaubt die Wiederverwendung eigener beziehungsweise wesentlich aufbereiteter Daten unter Namensnennung und verlangt zusätzlich die Nennung des ursprünglichen Datenanbieters.
3. Die USGS Historical Statistics sind in den OWID-Metadaten als Public Domain ausgewiesen.
4. Die USGS Mineral Commodity Summaries 2025 sind in den OWID-Metadaten mit CC BY 4.0 ausgewiesen.

Diese Prüfung bezieht sich auf die Datenreihe und ihre Metadaten. Sie umfasst ausdrücklich **nicht** die eigenständige Nutzung des OWID-Logos, eine Kopie der OWID-Grafik oder eine Übernahme des Grapher-Programmcodes.

### Erforderliche Attribution im Panel

Kurzform:

> USGS – Mineral Commodity Summaries (2025); USGS – Historical Statistics for Mineral and Material Commodities (2024) – with major processing by Our World in Data

Langform:

> USGS – Mineral Commodity Summaries (2025); USGS – Historical Statistics for Mineral and Material Commodities (2024) – with major processing by Our World in Data. “Cement production” [dataset]. United States Geological Survey, “Mineral Commodity Summaries”; United States Geological Survey, “Historical Statistics for Mineral and Material Commodities” [original data].

Zusätzlich sind der OWID-Explorer, die vollständigen OWID-Metadaten und die USGS-Originalquelle zu verlinken.

## Importabbildung

Empfohlene Feldabbildung für `timeSeries[]`:

| Quellfeld | Zielfeld | Regel |
|---|---|---|
| `Entity` | `geography`/Filter | ausschließlich `World` übernehmen |
| `Code` | Herkunftsmetadatum | muss `OWID_WRL` sein |
| `Year` | `points[].year` | Ganzzahl, 1926–2024 |
| `Cement production` | `points[].value` | numerischer Rohwert unverändert |
| Metadaten `unit` | `unit` | `tonnes_per_year` |
| Metadaten `lastUpdated` | Provenienz | `2025-12-15` |

Zusätzliche Regeln:

- Alle 99 Weltpunkte übernehmen; keine Interpolation oder nachträgliche Glättung.
- `2024` als `official_estimate` kennzeichnen.
- Die USGS-Metadaten nennen auch 2020–2022 als geschätzt; diese Information in einer Reihen- oder Methodenbeschreibung erhalten und nicht punktweise erfinden, falls das Schema keine belegte Punktannotation unterstützt.
- Keine Vermischung mit dem vorhandenen USGS-Statuswert für 2025, dem IEA-Klinker-Zement-Verhältnis oder den CO₂-Prozessemissionen.
- `worseningDirection` nicht automatisch setzen: Mehr Produktion ist ein größerer Materialdurchsatz, aber ohne normativen Referenzwert keine eigenständige Grenzüberschreitung.
- Keine Projektion ableiten.
- Vor einer BLC-Freigabe den erzeugten Knowledge-Datensatz und den Export mit den vorhandenen Validatoren prüfen.

## Quellenregister

### Our World in Data – Cement production

- **Institution/Jahr:** Global Change Data Lab / Our World in Data, Dataset-Version 2025-12-15
- **Quellentyp:** harmonisierter Sekundärdatensatz mit wesentlicher Verarbeitung
- **Primärquelle:** nein
- **Offen zugänglich:** ja
- **URL:** <https://ourworldindata.org/explorers/minerals?Mineral=Cement&Metric=Production&Type=Processing&Share+of+global=false&country=~OWID_WRL>
- **Trägt:** vollständige harmonisierte Jahresreihe, Einheit, Datenversion, Quellen- und Verarbeitungshinweise
- **Einschränkung:** OWID priorisiert USGS und verwendet BGS ausnahmsweise zur Ergänzung beziehungsweise Gegenprüfung; die Weltreihe beginnt trotz eines allgemeinen Metadaten-Timespans 1900 erst 1926.

### USGS – Mineral Commodity Summaries 2025

- **Institution/Jahr:** National Minerals Information Center, U.S. Geological Survey, 2025
- **Quellentyp:** amtliche globale Mineralstatistik
- **Primärquelle:** ja
- **Offen zugänglich:** ja
- **DOI:** <https://doi.org/10.5066/P13XCP3R>
- **Trägt:** jüngste globale Produktionswerte und Schätzkennzeichnungen
- **Einschränkung:** 2024 ist geschätzt; die Reihe misst Zement, nicht ausschließlich Klinker.

### USGS – Historical Statistics for Mineral and Material Commodities

- **Institution/Jahr:** U.S. Geological Survey, von OWID 2024 abgerufen
- **Quellentyp:** amtliche historische Statistik
- **Primärquelle:** ja
- **Offen zugänglich:** ja
- **URL:** <https://www.usgs.gov/centers/national-minerals-information-center/historical-statistics-mineral-and-material-commodities>
- **Trägt:** historische Weltreihe ab 1926
- **Einschränkung:** globale Produktionsstatistiken fehlen für 1900–1925; Produktdefinitionen und enthaltene Zementarten änderten sich historisch.

### Lizenzinformationen

- **OWID Wiederverwendung und Attribution:** <https://ourworldindata.org/faqs#can-i-reuse-or-republish-your-data>
- **USGS öffentliche Verfügbarkeit:** <https://www.usgs.gov/faqs/what-usgs-products-are-already-publicly-available>
- **Trägt:** Zulässigkeit der Datenwiederverwendung und erforderliche Quellenangaben
- **Einschränkung:** Die Lizenzangaben müssen bei jeder späteren Aktualisierung erneut gegen die dann aktuellen Metadaten geprüft werden.

## Unsicherheiten und Gegenprüfung

- Die Weltwerte 1926–2024 sind lückenlos, aber nicht alle Jahre sind direkte Messungen; mehrere jüngere Angaben sind amtliche Schätzungen.
- Die historische Definition von hydraulischem Zement umfasst je nach Zeitraum unterschiedliche Zementgruppen.
- Die OWID-Beschreibung für „Processing“ ist mineralienübergreifend und weniger präzise als die zementspezifischen USGS-Hinweise.
- OWID führt in den allgemeinen Dimensionsmetadaten Jahre ab 1900, für die Entität `World` liegen Zementwerte jedoch erst ab 1926 vor.
- Produktion darf nicht mit Verbrauch oder Nachfrageverantwortung gleichgesetzt werden.
- Zementmenge, Klinkeranteil und CO₂-Emissionen dürfen nicht auf eine gemeinsame Einheit umgerechnet oder als ein einziger Messwert behandelt werden.
- Ein späterer Import darf den bereits vorhandenen 2025-USGS-Statuswert nicht unbemerkt durch den 2024-Endpunkt ersetzen; Zeitreihe und aktueller Statuswert benötigen eine klar dokumentierte Rollenentscheidung.

## Nächster Schritt

Die 99 OWID/USGS-Weltpunkte in einer getrennten, reproduzierbaren Importänderung als beobachtete Reihe in `gwl_cement_clinker_global_v0.1.json` übernehmen und dabei den bestehenden 2025-Statuswert als eigenständige jüngere Schätzung erhalten.
