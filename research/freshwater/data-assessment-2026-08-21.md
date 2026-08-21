# Datenprüfung: Süßwassergrenze 2024/2026

**Prüfdatum:** 2026-08-21  
**Entscheidung:** `AUFNEHMEN`  
**Geltungsbereich:** globale und regionale Zustandsdaten für blaues und grünes Wasser; keine Gesundheits- oder Organwirkung

## Ergebnis

Für neue Zeitreihen und regionale Zustände soll der Datensatz von Virkki et al. (2026) verwendet werden. Er aktualisiert die Analyse bis 2019, enthält globale Zeitreihen, Unsicherheitsintervalle und regionale Werte für 277 HydroBASINS-Gebiete. Der Datensatz ist unter CC BY 4.0 offen nutzbar.

Der Datensatz von Porkka et al. (2024) bleibt die Quelle für die publizierte Herleitung und den damaligen Status der neu gefassten Süßwassergrenze. Seine Zahlen dürfen nicht innerhalb derselben Zeitreihe mit den 2026er Ergebnissen kombiniert werden, weil Modellgeneration, Zeitraum und Referenzwerte verschieden sind.

## Geprüfte Quellen und Repositorien

### Studie und Daten 2026

- Studie: Virkki, Andersen, te Wierik et al. (2026), *Regionally divergent drivers behind transgressions of the freshwater change planetary boundary*
- DOI: https://doi.org/10.1038/s41467-026-73051-x
- Daten, versionsunabhängige Kennung: https://doi.org/10.5281/zenodo.19663530
- Geprüfte Version v1.0.0: https://doi.org/10.5281/zenodo.19663531
- Code: https://github.com/vvirkki/pb-fw-drivers
- Lizenz von Daten und Code: CC BY 4.0
- Datenformat: CSV mit Semikolon als Trennzeichen; Anteile sind als Werte zwischen 0 und 1 gespeichert.

### Studie und Daten 2024

- Studie: Porkka, Virkki, Wang-Erlandsson et al. (2024), *Notable shifts beyond pre-industrial streamflow and soil moisture conditions transgress the planetary boundary for freshwater change*
- DOI: https://doi.org/10.1038/s44221-024-00208-7
- Daten: https://doi.org/10.5281/zenodo.10531807
- Code: https://github.com/vvirkki/freshwater-pb
- Lizenz des Code-Repositoriums: CC BY 4.0
- Datenformat: ZIP mit globalen und HydroBASINS-bezogenen CSV-Ergebnissen.

## Paneltaugliche Dateien des 2026er Datensatzes

### Globale Zeitreihen

- `PHC_dis_global_land_area_with_local_deviations_annual_mean_ensemble_median_IQR.csv`
- `PHC_rootmoist_global_land_area_with_local_deviations_annual_mean_ensemble_median_IQR.csv`

Beide Dateien enthalten:

| Feld | Bedeutung im Panel |
|---|---|
| `variable` | `dis` = Abfluss/blaues Wasser; `rootmoist` = Wurzelzonen-Bodenfeuchte/grünes Wasser |
| `area` | Raumbezug, hier `global` |
| `year` | Jahr, 1901–2019 |
| `scenario` | verwendetes Modell-/Forcing-Szenario; nicht als Messort darstellen |
| `class` | hier Summe trockener und nasser lokaler Abweichungen |
| `ensemble_median` | jährlicher Anteil der eisfreien Landfläche mit lokalen Abweichungen |
| `IQR_min`, `IQR_max` | Interquartilsbereich des Modellensembles |
| `boundary_baseline` | Median der Referenzvariabilität |
| `boundary_upper_end` | obere Grenze der Referenzvariabilität |

Zur Anzeige in Prozent werden Anteile mit 100 multipliziert. Das ist eine reine Einheitenumrechnung, keine inhaltliche Neuberechnung.

### Regionale Zustände

- `PHC_dis_summed_deviations_hybas3_latest_10yr_means.csv`
- `PHC_rootmoist_summed_deviations_hybas3_latest_10yr_means.csv`

Beide Dateien enthalten:

| Feld | Bedeutung im Panel |
|---|---|
| `hybas3_id` | Verknüpfung mit `PFAF_ID` der HydroBASINS-Ebene 3 |
| `variable` | blaues oder grünes Wasser |
| `class` | Summe trockener und nasser Abweichungen |
| `boundary_upper_end` | regionsspezifische obere Referenzgrenze |
| `mean_latest_10yr` | Mittel der jüngsten zehn Jahre, hier 2010–2019 |

Der Datensatz enthält 277 Regionen. Rein rechnerisch liegt das Zehnjahresmittel in 157 Regionen beim Abfluss und in 134 Regionen bei der Bodenfeuchte oberhalb der jeweiligen regionalen Referenzgrenze. Diese Zählung ist eine technische Datenprüfung und noch keine freigegebene Panel-Kennzahl.

## Geprüfte globale Werte

Die folgenden Werte stammen aus den für den Planetary Health Check exportierten Dateien des 2026er Datensatzes:

| Größe | Blaues Wasser | Grünes Wasser |
|---|---:|---:|
| Aktualisierte obere Referenzgrenze | 12,94 % | 12,38 % |
| Mittel 2010–2019 | 22,63 % | 22,02 % |
| Einzeljahr 2019 | 22,84 % | 23,56 % |

Die Zehnjahresmittel wurden aus den publizierten jährlichen Ensemblemedianen berechnet. Vor einer Verwendung als sichtbarer Studienwert muss entschieden werden, ob das Panel ausschließlich publizierte Tabellenwerte zeigt oder einfache, reproduzierbare Aggregationen aus offenen Quelldaten zulässt.

## Nicht vermischen

Die oft zitierten Werte aus Porkka et al. (2024) lauten 18,2 % für blaues und 15,8 % für grünes Wasser bei Grenzen von 10,2 % beziehungsweise 11,1 %. Die aktualisierten 2026er Dateien liefern andere Referenzgrenzen und einen bis 2019 verlängerten Verlauf. Deshalb gelten folgende Regeln:

1. Mess-/Zustandswert und Grenzwert müssen immer aus derselben Studienversion stammen.
2. Eine Zeitreihe darf nicht 2024er und 2026er Ergebnisse aneinanderhängen.
3. Bei einer Aktualisierung muss im Panel die Quellen- und Methodenfassung sichtbar sein.
4. Regionale Werte dürfen nur mit den jeweils regionalen Grenzen verglichen werden, nicht mit der globalen Grenze.
5. HydroBASINS-Gebiete sind Flusseinzugsgebiete und dürfen nicht als Staaten oder Verwaltungsregionen bezeichnet werden.

## Empfohlenes minimales Datenobjekt

Für einen späteren Import werden mindestens folgende Felder benötigt:

```text
source_id
source_version
variable
water_component
spatial_unit_type
spatial_unit_id
year_start
year_end
aggregation
value
unit
uncertainty_low
uncertainty_high
reference_value
reference_type
scenario
method_note
```

`water_component` wird lediglich als verständliche Zuordnung aus der Quelldokumentation gespeichert: `dis` → blaues Wasser und `rootmoist` → grünes Wasser. Es wird keine Organ-, Expositions- oder Krankheitslastinformation ergänzt.

## Offene Projektentscheidung

Soll das Panel als globalen Hauptwert

- das letzte verfügbare Einzeljahr 2019,
- das robustere Mittel 2010–2019 oder
- weiterhin ausschließlich den im Fachartikel ausdrücklich berichteten Status

anzeigen? Aus fachlicher Sicht ist das Zehnjahresmittel für regionale Vergleiche am konsistentesten; als selbst berechnete Aggregation muss es jedoch ausdrücklich gekennzeichnet werden.

## Nächster Schritt

Der Probeimport wurde in `data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json` ergänzt. Die bereits vorhandenen globalen Zeitreihen wurden nicht dupliziert. Als regionale Beispiele wurden HydroBASINS L3 PFAF 172 (Nil) und PFAF 456 (Indus) mit blauem und grünem Wasser, regionsspezifischer Referenz, unverändertem Quellwert und transparenter Prozentumrechnung aufgenommen.

Nächster Schritt ist eine kompakte, klar als Probe gekennzeichnete Darstellung der beiden Regionen unterhalb der globalen Zeitreihe. Vor einer vollständigen Übernahme aller 277 Regionen wird geprüft, ob Flusseinzugsgebiete als eigener Raumtyp im bestehenden Filter verständlich bedienbar sind.
