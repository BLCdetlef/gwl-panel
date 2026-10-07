# Wohnfläche je Einwohner · Deutschland

- **Kandidaten-ID:** germany-living-space-per-capita
- **Entscheidung:** AUFNEHMEN
- **Kurzbegründung:** 45 veröffentlichte Originalwerte über 75 Jahre, mit nachvollziehbaren Quellen und dokumentierten statistischen Wechseln. Historische Werte bleiben unverändert; die Reihe beschreibt den Wohnflächenbestand je Einwohner.
- **Recherchestand:** 2026-10-07; bewahrte Recherche aus dem BLC-Chat „BLC-Kurven mit drei Segmenten zeigen“, Daten aus dem zurückgenommenen Commit `0fa3dcf`.

## Prüfkette

1. **Menschliche Veränderung:** Bereitstellung und Nutzung von Wohnraum; Bestand aus Bautätigkeit, Bestandsänderungen und Abgängen. Amtliche Fortschreibung: [Destatis, Fachserie 2016, Methodik S. 3](https://www.statistischebibliothek.de/mir/servlets/MCRFileNodeServlet/DEHeft_derivate_00033055/2050300167004.pdf#page=3). Evidenz: belegt.
2. **Mechanismus:** Wohnraum bildet eine menschengemachte Lebensbedingung. Bau und Betrieb beanspruchen Materialien, Fläche und Energie; die Kennzahl selbst quantifiziert diese Wirkungen nicht. [UBA-Sektorstudie, Kapitel 2.2](https://www.umweltbundesamt.de/sites/default/files/medien/publikation/long/2341.pdf#page=20).
3. **Zuordnung:** Technologische & soziale Umwelt → Wohnumwelt; Rolle **Zustand** der gebauten Wohnumwelt, BLC-Vertiefungskurve. Keine planetare Kontrollvariable. Wohnflächenbestand nicht mit jährlichem Materialdurchsatz oder individueller Versorgung gleichsetzen.
4. **Messwerte:** m²/Person. Neun Stützwerte 1950–1989 für das frühere Bundesgebiet, 36 Jahreswerte 1990–2025 für Gesamtdeutschland. Endpunkte 15,0 und 49,5, mit unterschiedlichen Gebiets- und Methodenbezügen. Verfügbare Bestandsfläche einschließlich Leerstand, ab 2010 einschließlich Wohnheimen, geteilt durch die Einwohnerzahl. Kein belegter Referenz- oder Grenzwert. Vollständige Zahlen, Punktquellen und Abschnittsprovenienz stehen im benachbarten JSON.
5. **Gesundheit:** Individuelle Exposition, Organwirkung und zurechenbare Krankheitslast nicht belegt. Keine Marker- oder Farbfreigabe.

## Quellenregister und Statistikabschnitte

| Abschnitt | Quelle und genaue Fundstelle | Einschränkung |
|---|---|---|
| 1950–1989, früheres Bundesgebiet | UBA/ifo, **Berücksichtigung von Umweltgesichtspunkten bei Subventionen – Sektorstudie Wohnungsbau**, 2003, [Tabelle 2.2-1, gedruckte S. 7 / PDF-S. 23](https://www.umweltbundesamt.de/sites/default/files/medien/publikation/long/2341.pdf#page=23). Institutionelle Zusammenstellung, Originalquellen Destatis und BBR 2000, öffentlich. | Sekundärüberlieferung amtlicher Werte; einzelne frühe Erhebungsmethoden nicht vollständig erläutert. Abweichende Werte ab 1990 werden archiviert, nicht in die Deutschlandreihe übernommen. |
| 1990, Deutschland | Destatis, **35 Jahre Deutsche Einheit**, 2025, [Abschnitt Wohnfläche pro Kopf](https://www.destatis.de/DE/Themen/Querschnitt/35-Jahre-Deutsche-Einheit/_inhalt.html). Amtliche Primärquelle, öffentlich. | Vergleich im selben Jahr: West 36,4, Ost 28,2, Deutschland 34,8. Keine pauschale Anpassung früherer Werte. |
| 1991–2003 | Destatis, **Bestand an Wohnungen 2003 – Fachserie 5 Reihe 3**, 2004, [Tabelle 1.1, PDF-S. 5](https://www.statistischebibliothek.de/mir/servlets/MCRFileNodeServlet/DEHeft_derivate_00005698/2050300037004.pdf#page=5); Methodik PDF-S. 3. Amtliche Primärquelle, öffentlich. | Osten bis 1993 Zählung 1981, ab Berichtsjahr 1994 GWZ 1995; Westen GWZ 1987. |
| 2004–2014 | Destatis, **Bestand an Wohnungen 2016 – Fachserie 5 Reihe 3**, 2017, [Tabelle 1.1, PDF-S. 6](https://www.statistischebibliothek.de/mir/servlets/MCRFileNodeServlet/DEHeft_derivate_00033055/2050300167004.pdf#page=6). Amtliche Primärquelle, öffentlich. | Ab 2010 Wohnungsgrundlage GWZ 2011 einschließlich Wohnheime; ab 2011 zusätzlich neue Bevölkerungsgrundlage. |
| 2015–2025 | Destatis, **GENESIS 31231-0001**, recherchierter Stand 16.07.2026, [Datenzugang](https://genesis.destatis.de/datenbank/online/table/31231-0001), [Zeitvergleich mit Fußnoten](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Wohnen/Tabellen/liste-wohnungsbestand.html). Amtliche Primärquelle, öffentlich. [Veröffentlichung für 2025](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/07/PD26_250_31231.html). | 2016 revidiert auf 46,3, ältere Fachserie 46,5 bewahrt. Ab 2022 Zensus 2022 für Bestand und Bevölkerung; Sprung 47,7 → 48,9 ist kein reiner Flächenzuwachs. |

Sechs statistische Abschnitte: 1950–1989, 1990–1993, 1994–2009, 2010, 2011–2021 und 2022–2025. Der Einzelwert 2010 bleibt erhalten. Originalwerte verschiedener Quellenstände werden nicht neu kalibriert oder geglättet. Bevölkerungsänderungen beeinflussen auch innerhalb der Abschnitte den Quotienten; insbesondere 2014 → 2015 ist kein Rückgang der gesamten Wohnfläche.

## Unsicherheiten und Gegenprüfung

- Die UBA-Zusammenstellung nennt ab 1990 trotz Deutschland-Fußnote 36,5 statt 34,8. Diese Werte und 1998 = 39,0 bleiben als ausgeschlossene Originalangaben im JSON erhalten; amtliche Deutschlandwerte haben Vorrang.
- Der frühe Verlauf ist keine gesamtdeutsche Rückrechnung. Keine Interpolation, West-Ost-Korrektur oder Berechnung einer Wachstumsrate über Gebietssprünge.
- Wohnfläche ist weder Grundstücksfläche noch Wohnverteilung. Die Reihe erlaubt keine direkte Ableitung von Emissionen, Energieverbrauch oder Krankheitslast.
- Die aktuellen Destatis-Seiten lieferten beim direkten Webabruf teilweise 403/Fehler; aktuelle Werte wurden über indexierte amtliche Quellen gegengeprüft. Die bereits recherchierten Originalwerte und Quellenstände bleiben erhalten. PDF-Textfundstellen wurden geprüft; die Web-PDF-Screenshotfunktion war nicht verfügbar.
- Keine Zukunftsprojektion belegt; kurze Zensusabschnitte werden nicht ungeprüft fortgeschrieben.

## Nächster Schritt

Den regulären GWL-Export im BLC-Projekt übernehmen und dort Statistiksegmente mit der vorhandenen Segmentdarstellung und Tooltips prüfen.
