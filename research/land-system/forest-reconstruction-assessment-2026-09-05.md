# Kandidatendossier: historische Rekonstruktion für Waldtransition und Waldzustand

- **Kandidaten-ID:** pongratz-global-land-cover-800-1992
- **Arbeitstitel:** Globale Landbedeckungsrekonstruktion 800–1992 als historischer Vorlauf der Waldzustandskurve
- **Entscheidung:** `AUFNEHMEN`
- **Kurzbegründung:** Ein räumlich expliziter, öffentlich dokumentierter Rekonstruktionsdatensatz ist verfügbar und endet genau am Startjahr 1992 der vorhandenen Copernicus-Beobachtungsreihe. Aufgenommen wird er als gestrichelter, methodisch getrennter historischer Abschnitt mit zwei publizierten globalen Stützwerten; der Sprung 1992 wird ausdrücklich gezeigt und nicht als kontinuierliche Messreihe interpretiert. Eine harmonisierte Raster-Neuberechnung bleibt eine spätere fachliche Verbesserung.
- **Recherchestand:** 5. September 2026

## Prüfkette

1. **Menschliche Aktivität/Veränderung**
   - **Befund:** Die Rekonstruktion bildet die historische Ausdehnung von Acker- und Weideland und die daraus abgeleiteten Veränderungen natürlicher Landbedeckung ab. Für die Zeit vor 1700 nutzt sie Bevölkerung als Proxy; ab 1700 integriert sie veröffentlichte Karten und Inventare landwirtschaftlicher Flächen.
   - **Evidenzstatus:** `belegt`
   - **Quellen:** Pongratz et al. (2008); World Data Center for Climate (WDCC).

2. **Vermittelnder Mechanismus**
   - Landwirtschaftliche Expansion → Umwandlung potenzieller natürlicher Vegetation → Verringerung beziehungsweise Veränderung von Wald-Landbedeckung. Diese Kette ist für die in der Rekonstruktion modellierte landwirtschaftliche Umwandlung belegt.
   - Nicht vollständig erfasst sind historische Waldverluste und Waldzustandsänderungen durch Holzeinschlag, Feuer, Degradation, Aufforstung oder klimabedingte Mortalität, soweit sie nicht in der landwirtschaftlichen Landumwandlung repräsentiert sind. Pongratz et al. weisen ausdrücklich darauf hin, dass Holzerntedaten ergänzt werden könnten.

3. **Systemgrenzen-Zuordnung**
   - **Grenze:** Land-System-Wandel / Landnutzung
   - **Rolle:** `Zustand`
   - **Begründung und Evidenz:** Der Datensatz rekonstruiert globale Landbedeckung und natürliche Vegetationstypen unter menschlicher Landnutzung. Damit kann er einen historischen, modellbasierten Vorlauf für Waldflächenzustände liefern. Er ist jedoch kein direkter Messdatensatz und keine vollständige Rekonstruktion von Waldqualität oder Walddegradation.

4. **Messwerte**
   - **Rekonstruktionsdatensatz:** räumlich explizite globale Landnutzung und Landbedeckung, 800–1992, 30 Bogenminuten; jährliche beziehungsweise zeitlich gestufte Rekonstruktionswerte laut Datensatzdokumentation; Klassen umfassen Landwirtschaft sowie natürliche Vegetationstypen.
   - **Vorhandene Beobachtungsreihe:** Copernicus/ESA CCI, global, jährlich ab 1992, 300 m, 22 LCCS-Klassen; im Planetary Health Check 2025 als beobachtete Waldfläche ausgewertet.
   - **Kontrollvariable im Panel:** verbleibende Waldfläche relativ zur potenziellen natürlichen Waldfläche, Prozent; globale planetare Grenze 75 %, aktueller Wert rund 59 %.
   - **Referenz:** potenzielle natürliche Waldfläche. Der Planetary Health Check nennt dafür Ramankutty und Foley (1999); die Pongratz-Rekonstruktion verwendet ebenfalls eine Karte potenzieller Vegetation, aber ihre konkrete Aggregation zu den Wald-Biomen und ihr Nenner sind nicht automatisch identisch mit der PHC-Auswertung.
   - **Anschlussjahr:** 1992 liegt in beiden Produkten vor. Genau dieser Überlappungspunkt erlaubt eine notwendige Brückenprüfung, beweist aber allein noch keine methodische Kontinuität.
   - **Grenzwert:** 75 % global; 85 % tropisch und boreal; 50 % temperiert. Diese Grenzwerte gehören zum Planetary-Boundaries-Rahmen, nicht zum Rekonstruktionsdatensatz selbst.

5. **LEBEN/Gesundheit**
   - Nicht Gegenstand dieses Kandidaten. Keine Expositions- oder Krankheitslastkette und keine Marker-/Farbfreigabe.

## Integrationsbewertung

### Was technisch möglich ist

- Die WDCC-Rekonstruktion ist als digitaler, globaler Rasterdatensatz mit dauerhaftem DOI verfügbar.
- Aus den natürlichen Vegetationsklassen kann eine Waldfläche je Jahr und Biom abgeleitet und durch eine explizit festgelegte potenzielle Waldfläche geteilt werden.
- Das Ende 1992 kann als methodisch getrennt gekennzeichneter Rekonstruktionsabschnitt unmittelbar vor der bestehenden Beobachtungsreihe liegen.
- Die vorhandene Projektspezifikation erlaubt historische Rekonstruktionen ausdrücklich als getrennten Kurvenabschnitt; sie dürfen gemeinsam mit Beobachtungen die geforderte Zeitabdeckung verlängern.

### Was für eine harmonisierte Integration weiterhin fehlt

- Eine dokumentierte Zuordnung der Pongratz-Vegetationsklassen zu tropischem, borealem und temperiertem Wald sowie zur globalen Waldfläche.
- Eine flächengewichtete Reproduktion des Werts für 1992 mit demselben Nenner und derselben Maske wie in der aktuellen PHC-/Panel-Kurve.
- Ein quantitativer Vergleich beider 1992-Werte und eine vorab definierte Akzeptanzregel. Eine nachträgliche Offset- oder Skalierungsanpassung ohne fachliche Quelle wäre unzulässig.
- Eine sichtbare Kennzeichnung, dass Werte vor 1992 modellbasierte Rekonstruktionen mit steigender Unsicherheit in der Vergangenheit sind, während Werte ab 1992 satellitenbasierte Klassifikationsprodukte darstellen.

### Grober quantitativer Anschlussvergleich ohne Raster-Neuberechnung

Pongratz et al. veröffentlichen für 1992 globale Summen von 34,60 Mio. km² verbleibendem Wald und 48,68 Mio. km² potenzieller Waldfläche. Der daraus direkt berechnete Anteil beträgt 71,08 %. Die bestehende Panelreihe verwendet für 1992 den aus Figure 28 des Planetary Health Check 2025 näherungsweise abgelesenen Wert von 60,2 %.

- **Absoluter Unterschied am Anschlussjahr:** 71,08 % − 60,2 % = **10,88 Prozentpunkte**.
- **Relativer Unterschied bezogen auf den Panelwert:** 10,88 / 60,2 = **18,1 %**.
- **Einordnung:** Der Anschlussunterschied ist rund neunmal so groß wie die gesamte in der Panelkurve dargestellte Änderung von 1992 bis 2022 (60,2 % auf 59,0 %, also 1,2 Prozentpunkte).

Dieser Vergleich ist keine unabhängige flächengewichtete Nachrechnung der Raster. Er nutzt die von Pongratz et al. publizierten globalen Summen und den bereits im Panel hinterlegten, aus der PHC-Abbildung geschätzten Wert. Er reicht aus, um ein optisch kontinuierliches Aneinanderfügen ohne Harmonisierung auszuschließen.

### Warum LUH2 nicht die erste Wahl ist

LUH2 ist ein maßgeblicher, offen zugänglicher Rekonstruktionsdatensatz für 850–2015 und liefert auch eine einfache Waldflächenabschätzung. Als direkter Vorlauf ist er hier dennoch schwächer: Er überlappt lange mit der Copernicus-Reihe, verwendet Landnutzungszustände und eigene Waldzuordnungen, und die publizierte globale potenzielle Waldfläche (47 Mio. km²) weicht von einem dort genannten Referenzwert von 52 Mio. km² ab. LUH2 eignet sich sehr gut als Sensitivitäts- oder Gegenprüfungsdatensatz, aber nicht ohne Harmonisierung als Fortsetzung derselben Kontrollvariablen.

### Warum HYDE allein nicht genügt

HYDE 3.x rekonstruiert vor allem Bevölkerung und landwirtschaftliche Flächen (Acker, Weide und weitere Landnutzungskategorien). Eine panelkompatible historische Waldkurve wäre daraus nur durch zusätzliche Modellannahmen über verdrängte Vegetation, Regeneration, Holznutzung und Walddefinition ableitbar. HYDE ist daher ein Eingangsdaten- beziehungsweise Vergleichskandidat, aber keine unmittelbar fertige Rekonstruktion der aktuellen Wald-Kontrollvariable.

## Quellenregister

### A reconstruction of global agricultural areas and land cover for the last millennium

- **Autor/Institution und Jahr:** Pongratz, J.; Reick, C.; Raddatz, T.; Claussen, M. (2008)
- **Quellentyp:** peer-reviewte Primärstudie
- **DOI:** https://doi.org/10.1029/2007GB003153
- **Primärquelle:** ja
- **Offen zugänglich:** ja, Manuskript über MPG; Verlagsseite teilweise zugangsbeschränkt
- **Trägt:** Methode, Zeitraum, menschlicher Landnutzungsantrieb, potenzielle Vegetation, Grenzen der Rekonstruktion
- **Wesentliche Einschränkung:** Schwerpunkt auf landwirtschaftlich verursachter Landbedeckungsänderung; Unsicherheit nimmt vor den inventargestützten Jahrhunderten stark zu.

### Reconstruction of global land use and land cover AD 800 to 1992

- **Autor/Institution und Jahr:** Pongratz, J.; Reick, C.; Raddatz, T.; Claussen, M. / World Data Center for Climate (2007)
- **Quellentyp:** institutioneller Primärdatensatz
- **DOI:** https://doi.org/10.1594/WDCC/RECON_LAND_COVER_800-1992
- **Primärquelle:** ja
- **Offen zugänglich:** ja
- **Trägt:** digitale Verfügbarkeit, globale räumliche Abdeckung, Zeitraum und Auflösung
- **Wesentliche Einschränkung:** ältere Modell- und Eingangsdaten; keine fertige Zeitreihe der heutigen PHC-Kontrollvariable.

### Land cover classification gridded maps from 1992 to present derived from satellite observations

- **Autor/Institution und Jahr:** Copernicus Climate Change Service / Climate Data Store (laufender Datensatz; Erstveröffentlichung 2019)
- **Quellentyp:** institutioneller Beobachtungsdatensatz
- **DOI:** https://doi.org/10.24381/cds.006f2c9a
- **Primärquelle:** ja
- **Offen zugänglich:** ja, lizenzgebunden
- **Trägt:** globale jährliche Beobachtungsreihe ab 1992, 300-m-Auflösung, 22 LCCS-Klassen, Qualitätsinformationen
- **Wesentliche Einschränkung:** Klassifikationsgenauigkeit und Sensor-/Prozessierungsabhängigkeit; keine vor 1992 reichende Rekonstruktion.

### Planetary Health Check 2025

- **Autor/Institution und Jahr:** Planetary Boundaries Science / PIK und Partner (2025)
- **Quellentyp:** maßgebliches wissenschaftliches Assessment
- **URL:** https://www.planetaryhealthcheck.org/wp-content/uploads/PlanetaryHealthCheck2025.pdf
- **Primärquelle:** nein
- **Offen zugänglich:** ja
- **Trägt:** aktuelle Kontrollvariable, globaler Wert rund 59 %, Grenzwert 75 %, Verwendung von Copernicus-Beobachtungen und Ramankutty–Foley-Potenzialwald
- **Wesentliche Einschränkung:** Die veröffentlichte Kurve enthält keine direkt mitgelieferte numerische Jahrestabelle der im Panel verwendeten Aggregation.

### Harmonization of global land use change and management for the period 850–2100 (LUH2) for CMIP6

- **Autor/Institution und Jahr:** Hurtt et al. (2020)
- **Quellentyp:** peer-reviewte Primärstudie und institutioneller Datensatz
- **DOI:** https://doi.org/10.5194/gmd-13-5425-2020
- **Primärquelle:** ja
- **Offen zugänglich:** ja
- **Trägt:** alternativer Rekonstruktionskandidat 850–2015, jährliche Rasterdaten, einfache Waldflächenabschätzung und dokumentierte Unsicherheitsvarianten
- **Wesentliche Einschränkung:** andere Zustandsklassen und Walddefinition; nicht direkt dieselbe Kontrollvariable wie die PHC-/Copernicus-Kurve.

### HYDE-Datensätze

- **Autor/Institution und Jahr:** Copernicus Land Change Lab / Utrecht University; Klein Goldewijk und Mitwirkende (laufende Versionen)
- **Quellentyp:** institutionelle historische Landnutzungsrekonstruktion
- **URL:** https://landuse.sites.uu.nl/datasets/
- **Primärquelle:** ja
- **Offen zugänglich:** ja
- **Trägt:** langfristige landwirtschaftliche Landnutzungsrekonstruktionen und Unsicherheitsvarianten; Eingangsdaten für LUH-Produkte
- **Wesentliche Einschränkung:** kein unmittelbar fertiger Datensatz der verbleibenden Waldfläche relativ zur potenziellen natürlichen Waldfläche.

## Unsicherheiten und Gegenprüfung

- Landwirtschaftliche Flächenausdehnung ist nicht gleich gesamter Waldverlust; historische Holznutzung, Feuer, Degradation und Regeneration können fehlen oder anders repräsentiert sein.
- „Wald“ ist zwischen potenzieller Vegetationskarte, Pongratz-PFTs und Copernicus-LCCS-Klassen nicht automatisch identisch.
- Die Auflösungen 30 Bogenminuten und 300 m erzeugen unterschiedliche Rand-, Mosaik- und Kleinflächenanteile.
- Der gemeinsame Zeitpunkt 1992 kann wegen verschiedener Eingangsdaten und Klassifikationsregeln einen methodischen Sprung enthalten.
- Frühere Werte beruhen zunehmend auf Proxyannahmen und sind keine Messungen.
- Eine parallele Anzeige von Pongratz und LUH2 als gleichwertige Hauptrekonstruktionen könnte den Eindruck mehrerer beobachteter Verläufe erzeugen; LUH2 sollte höchstens als Sensitivitätsband oder Gegenprüfung dienen.

## Nächster Schritt

Den WDCC-Datensatz für 1992 flächengewichtet mit einer vorab dokumentierten Waldklassen-Zuordnung und exakt dem im Panel verwendeten Potenzialwald-Nenner aggregieren und den resultierenden Anschlusswert quantitativ gegen den Copernicus-/PHC-Wert 1992 prüfen.
