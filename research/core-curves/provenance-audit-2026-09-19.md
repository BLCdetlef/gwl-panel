# Provenienzaudit der Kernkurven

- **Kandidaten-ID:** core-curves-segment-provenance-2026-09-19
- **Arbeitstitel:** Segmentgenaue Datenherkunft aller BLC-Kernkurven
- **Entscheidung:** `AUFNEHMEN`
- **Kurzbegründung:** Alle neun Kernkurven besitzen eine fachlich benannte Hauptreihe; vorhandene Rekonstruktionen und Modellpfade bleiben getrennte Segmente. Für jedes Segment sind Originaldatei, Fundstelle, ausgelesene Felder, Übernahmebereich und Verarbeitung dokumentiert.
- **Recherchestand:** 19. September 2026

## Prüfkette

1. **Menschliche Aktivität/Veränderung**
   - Die Kurven bilden menschlich beeinflusste Zustände oder Belastungen der planetaren Grenzen ab. Dieser Audit verändert weder Grenzzuordnung noch Kausalitätsaussage.
   - **Evidenzstatus:** belegt durch die bereits freigegebenen Kernkurven und ihre Quellen.

2. **Vermittelnder Mechanismus**
   - Nicht neu bewertet. Der Audit betrifft ausschließlich die Herkunft und Verarbeitung der dargestellten Zahlen.

3. **Systemgrenzen-Zuordnung**
   - Klimawandel: atmosphärisches CO₂ und anthropogener effektiver Strahlungsantrieb.
   - Biosphärenintegrität: HANPP.
   - Süßwasser: ungewöhnlicher Abfluss und ungewöhnliche Wurzelzonen-Bodenfeuchte.
   - Landnutzung: verbleibende globale Waldfläche.
   - Nährstoffkreisläufe: anthropogene Stickstofffixierung und mineralischer Phosphoreinsatz.
   - Ozeanversauerung: globaler Aragonit-Sättigungszustand.

4. **Messwerte und Herleitung**

| Kernkurve/Segment | Exakte Fundstelle | Verarbeitung |
|---|---|---|
| HANPP | Planetary Health Check 2025, Figure 24 | Zwölf grafisch abgelesene Stützwerte; keine Interpolation |
| Atmosphärisches CO₂ | NOAA `co2_annmean_gl.txt`, Kopf Zeile 38, Daten ab Zeile 39 | `year`, `mean`, `unc` unverändert; nur deutsche Dezimalformatierung |
| CO₂-Rekonstruktion | NOAA/NCEI `law2018splines-noaa.txt`, Tabelle ab Zeile 120, `age_gas` und `CO2spl` | publizierter 20-Jahres-Spline, keine weitere Glättung |
| CO₂-Szenarien | IPCC AR6 WGI Annex III, Tabelle AIII.2, CO₂-Block und jeweilige SSP-Spalte | sieben publizierte Dekadenwerte je Szenario, keine Interpolation |
| Strahlungsantrieb | ClimateIndicator `data/effective_radiative_forcing/ERF_*_aggregates.csv`, Spalten `timebound_lower` und `anthro` | Bestwert sowie p05/p95 jahrgleich zusammengeführt |
| Blaues/grünes Wasser | Virkki et al. 2026, beide `PHC_*_global_land_area_with_local_deviations_annual_mean_ensemble_median_IQR.csv` | gefilterte Quellzeilen; Anteil × 100; keine Interpolation |
| Süßwasser-Rekonstruktionen | Porkka et al. 2024, ZIP-Pfade `.../global/streamflow|soilmoisture/regionid_land_area_with_local_deviations_annual_mean_ensemble_median_IQR.csv` | Anteil × 100; vorhandene Jahre 1861–1900 |
| Wald-Hauptreihe | Planetary Health Check 2025, Figure 28 | sieben grafisch abgelesene Stützwerte plus berichteter 2022-Wert |
| Wald-Rekonstruktion | Pongratz et al. 2008, Tabelle 2, Zeile `Total forest` | Waldfläche 1700/1992 geteilt durch 48,68 Mio. km² Potenzialwald |
| Stickstoff | Planetary Health Check 2025, Figure 37 | grafisch abgelesene Rand- und 5-Jahres-Stützwerte |
| Phosphor | Planetary Health Check 2025, Figure 35 | grafisch abgelesene Rand- und 5-Jahres-Stützwerte |
| OceanSODA-Hauptreihe | `OceanSODA-ETHZ_GRaCER_v2022b_annual_decomp_1982-2021.nc` | jährliche Änderungen auf publiziertes Periodenmittel 3,11 zentriert |
| NOAA/Jiang-Rekonstruktion | NCEI Accession 0259391, `Median_Std_surface`, Aragonite saturation state | publizierte globale Medianwerte unverändert |

5. **LEBEN/Gesundheit**
   - Nicht Gegenstand des Audits. Es werden keine Expositions-, Organ- oder Krankheitslastaussagen ergänzt.

## Quellenregister

- **Planetary Health Check 2025**, PIK/PBScience, 2025, Assessment, https://publications.pik-potsdam.de/pubman/item/item_32589_1/component/file_32845/PlanetaryHealthCheck2025.pdf, Primärquelle für die genannten Abbildungen: nein, offen: ja. Einschränkung: mehrere Panelwerte sind grafisch abgelesene Näherungen.
- **Trends in globally-averaged CO₂**, NOAA GML, laufender Monitoringdatensatz, https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.txt, Primärquelle: ja, offen: ja.
- **Law Dome 2000 Year Ice Core Data — Spline Fits**, NOAA/NCEI, 2018, https://www.ncei.noaa.gov/pub/data/paleo/icecore/antarctica/law/law2018splines-noaa.txt, Primärquelle: ja, offen: ja.
- **IPCC AR6 WGI Annex III**, IPCC, 2021, Assessmenttabellen, https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_AnnexIII.pdf, Primärquelle für die publizierten Szenariotabellen: ja, offen: ja.
- **Indicators of Global Climate Change 2025**, Climate Indicator Project/Zenodo, 2026, https://zenodo.org/records/20708818, Primärdatensatz: ja, offen: ja.
- **Virkki et al. freshwater data**, Zenodo v1.0.0, 2026, https://zenodo.org/records/19663531, Primärdatensatz: ja, offen: ja.
- **Porkka et al. freshwater data**, Zenodo v1.0.0, 2024, https://zenodo.org/records/10531807, Primärdatensatz: ja, offen: ja.
- **Pongratz et al., A reconstruction of global agricultural areas and land cover for the last millennium**, 2008, https://pure.mpg.de/pubman/item/item_994226_9/component/file_994225/BZE_51.pdf, Primärquelle: ja, offen: ja.
- **Ma, Gregor und Gruber, OceanSODA annual decomposition data**, ETH Zurich, 2023, https://doi.org/10.3929/ethz-b-000613669, Primärdatensatz: ja, offen: ja für nichtkommerzielle Nutzung.
- **Jiang et al., Global surface ocean acidification indicators**, NOAA NCEI Accession 0259391, 2023, https://www.ncei.noaa.gov/archive/accession/download/259391, Primärdatensatz: ja, offen: ja.

## Unsicherheiten und Gegenprüfung

- Abbildungswerte werden ausdrücklich als Näherungswerte gekennzeichnet und nicht wie tabellarische Originalwerte behandelt.
- OceanSODA-Jahreswerte enthalten zusätzlich die Rundungsunsicherheit des nur auf zwei Dezimalstellen publizierten Periodenmittels.
- Historische Rekonstruktionen werden nicht rechnerisch an jüngere Hauptreihen angeglichen; sichtbare Niveauunterschiede an Methodenwechseln bleiben erhalten.
- Der automatisierte Exporttest verlangt künftig für jede Kern-Hauptreihe und jedes vorhandene Rekonstruktions- oder Modellszenario vollständige Provenienzfelder.

## Nächster Schritt

Nach fachlicher Freigabe denselben Provenienzvertrag schrittweise auf die Vertiefungskurven ausweiten.
