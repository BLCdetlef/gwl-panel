# Globaler Sandverbrauch für Gebäude

- **Kandidaten-ID:** global-building-sand-usage
- **Arbeitstitel:** Globaler Sandverbrauch für Gebäude (1970–2060)
- **Entscheidung:** AUFNEHMEN
- **Kurzbegründung:** Der Benutzer hat GloBUS gewählt und die Aufnahme beider Segmente trotz 49 Jahren historischer Abdeckung ausdrücklich freigegeben. Eine konsistente Gebäudesandkurve enthält die historische Modellschätzung 1970–2019 und den geprüften Baseline-Output 2020–2060. Die Einjahresausnahme ist im Freigabemanifest dokumentiert; die anders abgegrenzte Bauwesenstudie wird nicht eingefügt.
- **Recherchestand:** 2026-10-05

## Prüfkette

1. **Menschliche Aktivität/Veränderung:** Sandbedarf für Beton und Glas im Wohn- und Nichtwohngebäudebau. Belegt durch [Zhong et al. (2022)](https://www.nature.com/articles/s41893-022-00857-0) und dessen [GloBUS v1.0](https://zenodo.org/records/5897264). Keine natürliche Hintergrundmenge.
2. **Vermittelnder Mechanismus:** Gebäudeflächenbedarf und Ersatz abgehender Gebäude erzeugen Materialzuflüsse; Materialintensitäten für Beton und Glas bestimmen den modellierten Sandbedarf. Diese Kanten sind im veröffentlichten Modell implementiert. Die Mengenreihe allein quantifiziert keine lokale ökologische Schädigung durch Abbau.
3. **Systemgrenzen-Zuordnung:** Stoff- und Energieströme → Baustoffe, Rolle **Treiber**. Sandbedarf ist ein vorgelagerter Materialdurchsatz. Keine Gleichsetzung mit einer planetaren Zustandsgröße, einem Grenzwert oder einer individuellen Dosis.
4. **Messwerte:** Global, Mio. t Sand/Jahr, 26 IMAGE-Regionen. 50 historische Modellwerte 1970–2019, anschließend 41 Szenariowerte 2020–2060. 1970: **835,039773**; 2019: **3117,879263**; 2020: **3169,957246**; 2060: **4607,282149** Mio. t/Jahr. Historische Werte sind aus veröffentlichten Materialflüssen mit dem Rechenweg der Autoren abgeleitet, keine Messungen und keine extrahierten Werte der Studie von Zhuang. Referenzwert und Grenzwert: **nicht belegt**.
5. **LEBEN/Gesundheit:** Exposition, Dosis, Population, Organendpunkt und zurechenbare Krankheitslast: **nicht belegt**. Keine Organmarker- oder Farbfreigabe.

## Quellenregister

| Quelle | Typ und Zugang | Getragene Aussage | Einschränkung |
|---|---|---|---|
| Shurong Zhuang, Qiance Liu, Kun Sun, Stephan Lutter, Ruishan Chen, Gang Liu (2025), *Tracking five decades of global sand and gravel stocks and flows in 184 countries*, Resources, Conservation and Recycling 222, 108460; [DOI 10.1016/j.resconrec.2025.108460](https://doi.org/10.1016/j.resconrec.2025.108460) | Originalstudie; öffentliches Abstract und institutioneller [Publikationseintrag](https://research.wu.ac.at/en/publications/tracking-five-decades-of-global-sand-and-gravel-stocks-and-flows-/), Zugang zu vollständigen numerischen Daten nicht verifiziert | Historische Modellierung 1970–2019; Sand und Kies; Gebäude, Straßen, Bahn und weitere Anwendungen | Keine Zahlen aus dieser Quelle übernommen. Eine passende Gebäude-Teilreihe ist noch nicht numerisch geprüft. |
| Xiaoyang Zhong, Sebastiaan Deetman, Arnold Tukker, Paul Behrens (2022), *Increasing material efficiencies of buildings to address the global sand crisis*, Nature Sustainability 5, 389–392; [DOI 10.1038/s41893-022-00857-0](https://www.nature.com/articles/s41893-022-00857-0) | Originalstudie; Abstract öffentlich, zugehörige Daten und Code offen | Gebäudesand für Beton und Glas; Zukunft 2020–2060, middle-of-the-road baseline | Kein gesamtes Bauwesen, keine direkte statistische Messreihe |
| Xiaoyang Zhong et al. (2022), *GloBUS v1.0*; [DOI 10.5281/zenodo.5897264](https://zenodo.org/records/5897264), [Autorenrepository](https://github.com/zhxyang/GloBUS) | Offenes originales Modell- und Datenarchiv, 5,8 MB; MD5 f70774a49441a4dbb9f106162a3aecae | Numerische Materialflüsse, Sandfaktoren, Rückgewinnungsraten und veröffentlichter Sandoutput für 26 Regionen | Veröffentlichter Sandoutput beginnt erst 2020; historische Sandwerte werden durch den dokumentierten Originalrechenweg aus den Materialoutputs abgeleitet |

## Numerische Gegenprüfung

Das Skript [extract-global-building-sand.py](../../scripts/extract-global-building-sand.py) liest ausschließlich das festgelegte ZIP-Archiv. Der Modellcode wird nicht ausgeführt. Der Bedarf wird wie im Originalcode berechnet: `(Materialzufluss − min(Materialzufluss, Materialabfluss × Rückgewinnungsrate)) × Sandfaktor`, anschließend Summe über Gebäudetypen, Beton/Glas und Regionen. Sekundäre Sandfaktoren sind im gelieferten Output null. Die Zuordnung der 624 Materialzeilen wird über Region, Gebäudetyp, Gebiet und Material geprüft.

Alle **1066 regionalen Werte** für 2020–2060 stimmen innerhalb relativer Toleranz 1e-12 mit `output_sand/Sand_total.csv` überein; maximale absolute Abweichung: 2,33e-10 kt. Die Einheitenkommentare des Modellcodes weisen Materialflüsse in Millionen kg (= kt) aus; Division durch 1000 ergibt Mio. t. Historische Sandfaktoren werden im Originalcode auf dem Wert von 2020 gehalten. Keine eigene Interpolation, Digitalisierung einer Abbildung oder Trendfortschreibung.

## Unsicherheiten und Gegenprüfung

### Angefragter Vergleich verschiedener Studien (2026-10-05)

Der Benutzer hat die Aufnahme beider Segmente trotz Definitionswechsel und 49 Jahren historischer Abdeckung ausdrücklich beauftragt. Diese Zustimmung beseitigt die zeitliche Projektbeschränkung für diesen Kandidaten, ersetzt aber keine fehlenden historischen Zahlen. Die Quellenwahl wurde zur Klärung gestellt, weil die gespeicherte vollständige historische Reihe aus GloBUS stammt und nicht aus Zhuang et al.

Der [Verlagsauszug zu Zhuang et al.](https://www.sciencedirect.com/science/article/pii/S0921344925003386) nennt für 2019 **10,33 Gt extrahierten Sand**, überwiegend für Beton in Gebäuden und Infrastruktur. Der veröffentlichte GloBUS-Output nennt für 2020 **3,169957246 Gt Gebäudesandbedarf**. Ein rein numerischer Anschluss ergäbe **−7,160042754 Gt beziehungsweise −69,313095 %**. Dieser Vergleich ist vorläufig: Extraktion und modellierter Gebäudebedarf sind verschieden abgegrenzte Größen; der Sprung ist kein belegter realer Einbruch des Sandverbrauchs. Der numerische Auszug der ersten Studie enthält zudem widersprüchliche Zeitangaben (Abstract 1970–2019, Schlussabschnitt 1978–2019); die Originaltabelle muss dies klären. Die Verlagsseite ist beim Browserzugriff durch eine CAPTCHA-Abfrage gesperrt; sie wurde nicht umgangen.

Beim Anschluss der beiden bereits gespeicherten **GloBUS**-Segmente beträgt die Änderung dagegen **+52,077983 Mio. t beziehungsweise +1,670301 %** (2019 → 2020). Hier wechselt die Datenrolle von historischer Modellschätzung zu Zukunftsszenario innerhalb desselben Modells, nicht die Quelle oder die Gebäudeabgrenzung. Dieser Verlauf darf nicht als Vergleich Zhuang → Zhong ausgegeben werden.

- **Abgrenzung:** Gebäude sind nur ein Teil des Bauwesens. Weder Straßen- und Bahnbau noch sonstige Infrastruktur werden durch diese Reihe vollständig beschrieben. Sand und Kies dürfen nicht zusammengezählt und als Sand bezeichnet werden.
- **Historische Schätzung:** Flächen-, Lebensdauer- und Materialannahmen erzeugen modellierte Flüsse. Der historische Vorlauf bis 1970 ist im Modell aus älteren Bevölkerungsdaten und rückgerechneten Flächenannahmen aufgebaut. Dieser Initialisierungsvorlauf wird nicht als zusätzliche belastbare historische Reihe übernommen, um die Mindestabdeckung zu erreichen.
- **Unterschiedliche Studien:** Die historische Bauwesenstudie und das Zukunftsmodell werden nicht kalibriert oder zusammengesetzt, solange ihre Teilbereiche und Definitionen nicht numerisch geprüft sind.
- **Zeitkriterium:** Gemäß [DATA-MODEL.md](../../docs/DATA-MODEL.md) und [BLC-CURVE-EXPORT-v1.md](../../docs/BLC-CURVE-EXPORT-v1.md) zählen Zukunftswerte nicht zur historischen Mindestabdeckung. Die vorhandene dokumentierte Einjahresausnahme wird nicht stillschweigend aktiviert.
- **Szenario:** Der gelieferte Baseline-Output ist ein bedingter Modellpfad. Effizienzvarianten werden nicht mit ihm vermischt. Er beschreibt keine garantierte Entwicklung.
- **Darstellung bei späterer Freigabe:** Eine Kurve mit getrennt gekennzeichneten Modellhistorie- und Zukunftssegmenten; bestehende gemeinsame Darstellungsregeln unverändert. Kein zusätzlicher Maßstab oder automatisch geöffnetes Detailfenster.

## Nächster Schritt

Die integrierte GloBUS-Kurve im BLC prüfen: ein Diagramm mit historischer Modellschätzung, gestricheltem Anschluss 2019 → 2020 und gepunktetem Baseline-Szenario, bei unveränderten allgemeinen Darstellungsregeln.
