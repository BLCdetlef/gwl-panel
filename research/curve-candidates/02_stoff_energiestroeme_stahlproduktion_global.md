# Globale Rohstahlproduktion (1950–2050)

- **Kandidaten-ID:** global-crude-steel-production
- **Entscheidung:** AUFNEHMEN
- **Kurzbegründung:** Worldsteel liefert 28 publizierte globale Rohstahlwerte über 75 Jahre. Zwei absolute STEPS-Szenariowerte der IEA erfassen dieselbe Produktionsgröße. Quellenwechsel und Szenarioausgabe 2020 werden ausdrücklich benannt.
- **Recherchestand:** 2026-10-05

## Prüfkette

1. **Menschliche Aktivität:** Globale Herstellung von Rohstahl, einschließlich primärer und schrottbasierter Prozessrouten. Belegt durch die [worldsteel-Produktionsstatistik](https://worldsteel.org/data/world-steel-in-figures/world-steel-in-figures-2026/).
2. **Mechanismus:** Produktionsmenge beschreibt menschlichen Materialdurchsatz. Metallgewinnung und Wiederaufschmelzung gehören zur Stahlproduktion; ihre Menge allein quantifiziert keine konkrete lokale Belastung oder individuelle Exposition. Die [IEA-Roadmap](https://www.iea.org/reports/iron-and-steel-technology-roadmap) behandelt die Produktionsprozesse und ihre Energieanforderungen. Hier wird ausschließlich die Produktionsmenge übernommen.
3. **Zuordnung:** Stoff- und Energieströme → Rohstoffe, Rolle **Treiber**, vertiefender Beitrag ohne Organbezug. Keine planetare Kontrollvariable.
4. **Werte:** Global, Mio. t Rohstahl/Jahr. Historie 1950–2025: 28 veröffentlichte Stützwerte; 1950 **189**, 2025 **1849**. Vor 2011 überwiegend Fünfjahresschritte, danach jährlich. IEA STEPS, Ausgabe 2020: 2030 **2101**, 2050 **2535**. Kein Grenzwert oder Referenzwert belegt. [IEA-Diagramm](https://www.iea.org/data-and-statistics/charts/contribution-of-material-efficiency-strategies-to-reductions-in-global-steel-demand-2019-2050) definiert „Demand“ hier ausdrücklich als globale Rohstahlproduktion, einschließlich der Bedeutung von Fertigungsschrott.
5. **LEBEN:** Exposition/Dosis, Bevölkerungsgruppe, Organwirkung und zurechenbare Krankheitslast aus dieser Mengenreihe **nicht belegt**. Keine Organmarker oder Farben.

## Quellenregister

- **World Steel Association (2026), World Steel in Figures 2026.** Institutionelle Originalstatistik des Branchenverbands, Primärquelle, offen. [HTML-Tabelle](https://worldsteel.org/data/world-steel-in-figures/world-steel-in-figures-2026/), Abschnitt „World crude steel production 1950 to 2025“, Years/World. Trägt alle historischen Stützwerte. Einschränkung: Rundungen und Datenrevisionen; vor 2011 keine vollständige Jahresreihe in dieser Tabelle. Ältere Ausgaben werden nicht dazugemischt.
- **International Energy Agency (2020), Contribution of material efficiency strategies to reductions in global steel demand, 2019–2050**, zu *Iron and Steel Technology Roadmap*. Institutionelles Szenarioassessment, Primärquelle, öffentlich, CC BY 4.0. [Diagramm und Methodennotiz](https://www.iea.org/data-and-statistics/charts/contribution-of-material-efficiency-strategies-to-reductions-in-global-steel-demand-2019-2050). Trägt die Produktionsdefinition und zwei absolute STEPS-Werte. Einschränkung: Ausgabe 2020, bedingtes Szenario; keine aktuelle Prognose und keine belegte jährliche Zukunftsreihe.

## Extraktion und Gegenprüfung

[extract-global-steel.py](../../scripts/extract-global-steel.py) liest die öffentliche HTML-Welttabelle und die im IEA-Diagramm eingebettete `data-chart-chartoptions`-Konfiguration. Die Jahresgruppen 2019/2030/2050 sind über `xAxis.plotLines.label.text` belegt. Aus `series[name=STEPS].data` werden ausschließlich Index 1 (2030) und Index 5 (2050) gelesen. Wasserfall-Differenzen und SDS werden nicht übernommen. Keine Diagrammdigitalisierung, Kalibrierung, Glättung oder Ergänzung fehlender Jahreswerte. Die Rohdateien liegen temporär außerhalb des Repository; Kandidat, Provenienz und Extraktionsskript sind gespeichert.

## Unsicherheiten und Anschluss

- Historie: gerundete Verbandsstatistik einschließlich Meldungen, Schätzungen und Revisionen. Die Darstellung darf die ungleichmäßige Stützpunktdichte nicht als vollständige historische Jahresmessreihe ausgeben.
- IEA-Basisjahr 2019: **1869** Mio. t; worldsteel-Ausgabe 2026 für 2019: **1879** Mio. t. Unterschied **−10 Mio. t (−0,53 %)**; keine Niveauanpassung.
- Letzter historischer Wert 2025 → erster Szenariowert 2030: **+252 Mio. t (+13,63 %)** über fünf Jahre. Dies ist kein unmittelbarer Sprung im selben Jahr; Quellenrevision, Szenarioalter und Zeitentwicklung sind nicht separierbar.
- Produktion und Verbrauch werden nicht verwechselt. Primärstahl allein, Fertigstahl und Endverbrauch sind andere Größen und werden nicht mit der Rohstahlreihe zusammengerechnet.
- Genau eine Kurve, getrenntes STEPS-Segment; der Anschluss nutzt die bestehende gestrichelte Verbindung, Zukunft gepunktet. Allgemeine Skalierung und Navigation unverändert.

## Nächster Schritt

Die integrierte Rohstahlkurve mit historischem Segment und STEPS-Szenario auf localhost:3000 prüfen.
