# Kandidatendossier: Arktische September-Meereisfläche

- **Kandidaten-ID:** arctic-september-sea-ice-area
- **Arbeitstitel:** Arktische Meereisfläche im September
- **Entscheidung:** AUFNEHMEN
- **Kurzbegründung:** Die monatlich gemittelte September-Meereisfläche ist eine gut dokumentierte Wirkung des Klimawandels und lässt sich als Rekonstruktion, Satellitenbeobachtung und Projektion methodisch getrennt darstellen. Sie ist keine Kontrollvariable der planetaren Grenze und keine direkte Messung der Erdreflexion.
- **Recherchestand:** 2026-09-21

## Prüfkette

1. **Menschliche Aktivität/Veränderung**
   - **Befund:** Anthropogene Treibhausgasemissionen erhöhen die globale Temperatur; die Arktis erwärmt sich stärker als das globale Mittel, während die sommerliche Meereisfläche abnimmt.
   - **Evidenzstatus:** belegt
   - **Quelle(n):** IPCC AR6 WGI, Kapitel 4; UHH Sea Ice Area Product.

2. **Vermittelnder Mechanismus**
   - Anthropogene Treibhausgasemissionen → positiver Strahlungsantrieb → Erwärmung von Atmosphäre und Ozean → stärkere sommerliche Eisschmelze und verzögerte Neubildung → kleinere September-Meereisfläche.
   - Kleinere helle Eisfläche → größere dunkle Wasserfläche → höhere Aufnahme kurzwelliger Strahlung → zusätzliche regionale Erwärmung. Die Septemberfläche misst diese Rückkopplung nicht direkt; Wolken, Schnee, Eisdicke und Einstrahlung wirken zusätzlich.
   - **Quellen:** [IPCC AR6 WGI Kapitel 4](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4/); [UHH-Produktbeschreibung](https://www.cen.uni-hamburg.de/en/icdc/data/cryosphere/uhh-sea-ice-area-product.html).

3. **Systemgrenzen-Zuordnung**
   - **Grenze:** Klimawandel
   - **Rolle:** Wirkung
   - **Begründung und Evidenz:** Die planetare Grenze Klimawandel wird über atmosphärisches CO₂ und Strahlungsantrieb kontrolliert. Die arktische September-Meereisfläche beschreibt eine Folge und Rückkopplung der Erwärmung und wird deshalb als Vertiefung ohne Organbezug geführt, nicht als Kernkurve.

4. **Messwerte**
   - **Größe:** monatlich gemittelte arktische Meereisfläche im September
   - **Einheit:** Mio. km²
   - **Raum:** Nordhalbkugel nördlich etwa 35° N
   - **Rekonstruktion:** 1850–1978, Variable `walsh` aus UHH v2024_fv0.01; historische Beobachtungen und aufgefüllte Lücken.
   - **Beobachtung:** 1979–2024, Variable `nsidc_cdr` aus UHH v2025_fv0.01; satellitengestütztes NOAA/NSIDC Climate Data Record.
   - **Aktueller Reihenwert:** 2024: 3,895940 Mio. km²; 1979: 6,605533 Mio. km².
   - **Projektion:** IPCC AR6 WGI Tabelle 4.4, Multi-Modell-Mittel und 5–95-%-Bereiche für 2021–2040, 2041–2060 und 2081–2100 unter SSP1-1.9, SSP2-4.5 und SSP3-7.0.
   - **Referenzwert:** Unter 1 Mio. km² wird im IPCC-Kontext als praktisch eisfreier September bezeichnet.
   - **Grenzwert:** kein Grenzwert der planetaren Grenzen.

5. **LEBEN/Gesundheit**
   - Nicht verwendet. Aus dieser Kurve allein wird kein individueller Organ- oder Gesundheitsmarker abgeleitet.

## Quellenregister

### UHH Sea Ice Area Product, Version 2024_fv0.01

- **Autor/Institution und Jahr:** Rauschenbach, Doerr, Notz und Kern; Universität Hamburg/ICDC, 2024
- **Quellentyp:** offizieller Forschungsdatensatz
- **DOI/dauerhafte URL:** [10.25592/uhhfdm.11346](https://doi.org/10.25592/uhhfdm.11346)
- **Primärquelle:** ja, für die aufbereitete Flächenreihe
- **Offen zugänglich:** ja
- **Trägt:** monatliche Walsh-Meereisfläche 1850–2017; hier September 1850–1978
- **Wesentliche Einschränkung:** historische Quellenabdeckung und Lückenfüllung ändern sich über die Zeit; kein numerisches Unsicherheitsband.

### UHH Sea Ice Area Product, Version 2025_fv0.01

- **Autor/Institution und Jahr:** Thomae, Rauschenbach, Doerr, Notz und Kern; Universität Hamburg/ICDC, 2025
- **Quellentyp:** offizieller Forschungsdatensatz
- **DOI/dauerhafte URL:** [10.25592/uhhfdm.18163](https://doi.org/10.25592/uhhfdm.18163)
- **Primärquelle:** ja, für die aufbereitete Flächenreihe
- **Offen zugänglich:** ja
- **Trägt:** monatliche satellitengestützte NOAA/NSIDC-CDR-Meereisfläche; hier September 1979–2024
- **Wesentliche Einschränkung:** kein eigenes numerisches Unsicherheitsband; Satellitenalgorithmen liefern leicht unterschiedliche Flächenwerte.

### IPCC AR6 WGI Chapter 4: Future Global Climate

- **Autor/Institution und Jahr:** Lee et al.; IPCC, 2021
- **Quellentyp:** wissenschaftlicher Sachstandsbericht
- **DOI/dauerhafte URL:** [Kapitel 4](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4/)
- **Primärquelle:** nein, bewertende Synthese und CMIP6-Auswertung
- **Offen zugänglich:** ja
- **Trägt:** Tabelle 4.4 mit September-Meereisfläche für drei 20-Jahres-Zeiträume und fünf SSPs; Definition des praktisch eisfreien Septembers
- **Wesentliche Einschränkung:** Multi-Modell- und Szenariowerte sind keine Vorhersagen einzelner Jahre.

## Unsicherheiten und Gegenprüfung

- Rekonstruktion und Satellitenbeobachtung sind keine homogene Messreihe; der Methodenwechsel 1979 bleibt sichtbar.
- Die ausgewählte Größe ist Meereisfläche, nicht Meereisausdehnung. Beide Größen dürfen nicht vermischt werden.
- Die Fläche ist nur ein Einflussfaktor der Albedo; sie darf nicht als jährlich gemittelte Reflexionsfläche der gesamten Erde bezeichnet werden.
- Die IPCC-Werte sind 20-Jahres-Mittel. Ihre Position bei 2030, 2050 und 2090 dient ausschließlich der Diagrammdarstellung.
- Eine direkte gesundheitliche oder organspezifische Zurechnung wäre aus dieser Reihe nicht belastbar.

## Nächster Schritt

Bei der nächsten veröffentlichten UHH-Produktversion prüfen, ob das Beobachtungssegment über 2024 hinaus verlängert werden kann, ohne Variable oder Flächendefinition zu wechseln.
