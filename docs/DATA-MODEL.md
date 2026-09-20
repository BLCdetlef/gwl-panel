# GWL-Panel – Datenmodell

Stand: Prototyp 0.9.2

## Leitidee

Daten, Darstellung und Interpretation werden getrennt. Das Panel darf keine Zwischenwerte, Krankheitswahrscheinlichkeiten oder Funktionsverluste erfinden. Jeder angezeigte Zustand bleibt an **Raum, Zeit, Messreihe und Quelle** gebunden.

## Zentrales Regelregister

Die übergreifenden Redaktions- und Darstellungsregeln liegen maschinenlesbar in [`data/policies/presentation-rules-v1.json`](../data/policies/presentation-rules-v1.json). **Regelregister-Version: 1.2.4.** Dieses Register ist die gemeinsame Quelle für:

- die verständliche Regelerklärung im GWL unter **WIRKUNG**, einschließlich Zweck, Anwendung und Auswirkung im Programm,
- die Verknüpfung jeder Regel mit den betroffenen Datenmodellfeldern,
- sowie automatisierte Prüfungen, die Regel-IDs, Anwendungsfunktionen und Dokumentationsversion abgleichen.

Die folgenden Abschnitte beschreiben die fachliche Bedeutung der verknüpften Felder. Regeltexte werden nicht zusätzlich im HTML gepflegt, sondern aus dem Register geladen. Bei einer Regeländerung werden deshalb zuerst das Register und – falls sich Feldbedeutung oder Datenstruktur ändern – der zugehörige Abschnitt dieses Datenmodells angepasst. Eine geänderte Registerversion muss auch hier eingetragen werden; andernfalls schlägt die Regelprüfung fehl.

## Oberstruktur

`window.GWL_DATA` enthält derzeit:

- `version` – Prototyp-Version
- `scopes` – räumliche Ebenen und ihre Hierarchie
- `timePresets` – gemeinsame Zeitfenster, z. B. BLC 1700–2100
- `boundaries` – Planetare Grenzen und ihre Mess-/Analyseebenen

## Planetare Grenze

Ein Eintrag in `boundaries` besitzt mindestens `id`, `label`, `enabled` und optional `summary` sowie `items[]`.

## Mess-/Analyseobjekt (`items[]`)

Ein Item kann enthalten:

- `id`, `scope`, `label`, `type`
- `value`, `reference`, `period`
- `sourceLabel`, `sourceUrl`
- `summary`, `finding`, `effect`, `uncertainty`, `lifeNote`
- `timePoints[]` für tatsächlich belegte Messzeitpunkte
- `causes` für die optionale vierte Ebene
- `health` für den Gesundheitsbezug

## Zeitpunkte

`timePoints[]` überschreiben bei Bedarf Werte des übergeordneten Items. Es werden nur tatsächlich hinterlegte Messpunkte angezeigt; zwischen ihnen wird nicht automatisch interpoliert.

Eine Knowledge-Zeitreihe kann mit `dataNature` als `observed` oder `assessed_model_estimate` gekennzeichnet werden. Wissenschaftliche Schätzreihen müssen ihre Methode und Unsicherheit nennen und dürfen in Text, Legende und Punktdichte nicht als direkte Messungen erscheinen. Im BLC werden direkte Messreihen grundsätzlich höchstens alle fünf Jahre, wissenschaftliche Schätzreihen grundsätzlich höchstens alle 20 Jahre mit sichtbaren Punkten markiert; vollständige Reihen bleiben als Prüf- und Liniengrundlage erhalten.

Für jedes fachlich eigenständige Segment – Beobachtung, historische Rekonstruktion und einzelnes Modellszenario – kann `provenance` die genaue Herkunft dokumentieren: `sourceFile`, `sourceUrl`, `locator`, `fields`, `extraction` und `transformation`. Die Fundstelle benennt Tabelle oder Datenzeile und Spalten; die Verarbeitung hält ausdrücklich fest, ob Werte umgerechnet, interpoliert oder unverändert übernommen wurden. Das BLC zeigt diese Angaben nur für das jeweils ausgewählte Kurvensegment.

## Projektionen

Beobachtungen und Projektionen werden getrennt dargestellt. Ohne belastbare präzisierende Faktoren verwendet das Panel als Standard genau einen Projektionspfad: die Fortschreibung des jüngeren beobachteten Trends einer methodisch konsistenten Reihe. Trendfenster, jährliche Änderungsrate und Basisjahr müssen benannt werden. Geeignete veröffentlichte Fachszenarien oder belastbare Einflussfaktoren haben Vorrang; ein fachlich nicht fortschreibbarer Indikator erhält keine Projektion.

Historische Vorgängerrekonstruktionen mit abweichender Methode werden nicht mit der Hauptreihe vermischt: Sie nutzen eine gestrichelte Linie. Ein `◇` auf der Zeitachse markiert den Methodenwechsel; seine Erklärung gehört in Einordnung, Methodennotiz oder zugängliche Diagrammbeschreibung. Projektionen bleiben gepunktet.

Historische Rekonstruktion, Beobachtung und Projektion dürfen aus unterschiedlichen Quellen stammen und dennoch in einem Diagramm erscheinen, wenn Messgröße, Einheit, Raumbezug und methodischer Anschluss nachvollziehbar zusammenpassen. Die Zuordnung soll bevorzugt explizit über die ID der beobachteten Reihe erfolgen; eine automatische Zuordnung ist nur bei genau einer eindeutig passenden Einheit zulässig. Inkompatible Reihen werden nie auf eine gemeinsame Skala gezwungen. Eine einzelne Messreihe bleibt standardmäßig sichtbar; mehrere fachlich getrennte Reihen eines Beitrags werden jeweils in einem eigenen, zunächst geschlossenen Abschnitt gezeigt.

Die BLC-Freigabe verlangt grundsätzlich mindestens 50 Jahre gemeinsame Abdeckung aus Beobachtung und optionaler historischer Rekonstruktion. Eine ausdrücklich im Freigabemanifest mit `coverageExceptionRuleId: "blc_documented_single_year_coverage_exception"` dokumentierte Ausnahme darf ausschließlich eine Abdeckung von 49 Jahren zulassen. Sie setzt voraus, dass Beobachtung und Rekonstruktion getrennte Segmente bleiben und Definitionsunterschiede, Datenlücke, fehlende Kalibrierung sowie Herkunft im Methodentext und in der segmentbezogenen Provenienz erklärt werden. Größere Unterschreitungen bleiben technisch gesperrt.

## Gesundheitsbezug

`health.impacts[]` verknüpft einen konkreten Umwelt-/Expositionsbefund mit Organen oder Organsystemen. Beispiel:

### Rechercheprinzip: Menge → Exposition/Dosis → Organwirkung

Für weitere Recherchen wird nach Möglichkeit dieselbe Beweiskette aufgebaut:

1. **Relevante Menge:** Produktion, Einsatz, Freisetzung oder Umweltkonzentration beschreibt den potenziellen Belastungsdruck.
2. **Belegte Exposition oder Dosis:** Aufnahmeweg, exponierte Gruppe, Dauer und – sofern verfügbar – gemessene äußere oder innere Dosis. Eine globale Einsatz- oder Produktionsmenge wird nicht selbst als Dosis bezeichnet.
3. **Nachgewiesene Organwirkung:** Ein konkreter, durch geeignete Studien oder anerkannte Bewertungen gestützter Zusammenhang mit einem Organ oder Organsystem.

Eine Mengenreihe allein begründet keine Organwirkung. Die Bodymap wird nur verknüpft, wenn Expositionspfad und gesundheitlicher Befund belastbar belegt sind; räumliche Reichweite, Evidenzstärke und rechtliche Anerkennung bleiben dabei getrennte Angaben.

```js
{
  organ: "skeleton",
  label: "Skelett",
  functionLoss: null,
  prevalence: "Skelettfluorose 2018: 3,3 %",
  note: "..."
}
```

### Darstellungsregel

- `functionLoss` ist eine Zahl von `0` bis `100` **nur wenn eine belastbare fachliche Grundlage genau diese Skala trägt**. Daraus darf der Marker als Graustufe berechnet werden.
- `functionLoss: null` bedeutet: Ein gesundheitlicher Befund kann belegt sein, aber eine einheitliche 0–100-%-Funktionsminderung ist nicht belegt. Der Marker wird dann schraffiert.
- `prevalence` ist **nicht** automatisch `functionLoss`.
- Fehlt ein belegter Gesundheitsbezug vollständig, bleibt der Marker neutral hell.

### Altersgruppen

Die Bodymap bietet genau drei grobe Ansichten: `children` (0–17 Jahre), `adults` (18–64 Jahre, Standard) und `older` (ab 65 Jahren). Feinere Altersbereiche werden nicht als zusätzliche Schalter angelegt, sondern als Studienkontext unter WIRKUNG ausgegeben.

Organbezüge oder Wirkungen können optional `ageGroups[]` sowie `ageEffects.<group>` tragen. Ein stärkerer Außenring ist nur bei `status: "higher_effect"` zulässig, wenn ein altersbezogener Mehr-Effekt gegenüber Erwachsenen fachlich oder statistisch belegt ist. Die bloße Auswahl einer Altersgruppe, ihre Aufnahme in die Stichprobe oder allgemeine Vulnerabilitätsannahmen verändern die Ringstärke nicht. Fehlende Altersauswertung wird nicht als fehlendes Risiko interpretiert.

## Querverbindungen in Wirkungspfaden

Querverweise auf eine im Panel vorhandene Systemgrenze erscheinen in WIRKUNG als klickbare Chips und öffnen diese Grenze. Sie sind als getrennte Kanten mit benanntem Mechanismus zu modellieren; ein Klick bedeutet keine Gleichsetzung von Messgrößen oder automatische Gesundheitswirkung. Hinweise ohne navigierbares Ziel bleiben als nicht klickbare Kontextchips sichtbar.

### Bedeutung und technische Wirkung

Ein Wirkungspfad ist eine fachlich belegte Erklärungskette. Er beschreibt, wie ein Ausgangspunkt über Umweltveränderungen oder Expositionen zu einer möglichen Wirkung führen kann. Er ist keine Rechenregel: Wirkungspfade verändern weder Messwerte noch Kurven, Grenzbewertungen oder BLC-Freigaben.

Für Knowledge-Beiträge gelten drei getrennte Ebenen:

- `pathways[]` ist die maßgebliche strukturierte Darstellung eines Pfades. Kettenglieder, Evidenzstatus und Einschränkungen bleiben dort prüfbar gespeichert.
- `presentation.effectPath` ist ein kurzer Darstellungstext für ältere oder spezialisierte Ansichten. Er ersetzt keinen strukturierten Pfad und erzeugt keine Verknüpfung.
- `healthContext.markerSignals[]` ist eine eigenständige, strengere Freigabe für die Bodymap. Erst ein geprüftes Markersignal aktiviert einen Organbezug; ein allgemeiner Wirkungspfad genügt dafür nicht.

Verbindungen zu anderen planetaren Grenzen werden ebenfalls nicht aus frei formulierten Pfaden abgeleitet. Sie benötigen einen ausdrücklich hinterlegten Eintrag in `boundaryInteractions[]` oder eine entsprechend typisierte Graphkante. Navigation zu einer anderen Grenze ändert deren Messwerte oder Bewertung nicht.

### Einheitliche Darstellungsregel

- **Kernbeiträge zu planetaren Grenzen:** Die wesentliche Wirkung steht als kurzer, ruhiger Fließtext in der gemeinsamen Kernbeitragskarte. Separate Wirkungspfad-Karten und zusätzliche Knowledge-Panels werden für diese Beitragsrolle zentral ausgeblendet. Die strukturierten Pfade bleiben in den Quelldaten erhalten.
- **Vertiefungs- und Gesundheitsbeiträge:** Wirkungspfade werden gezeigt, wenn sie die konkrete Exposition, die Evidenzkette oder einen geprüften Organbezug verständlich machen.
- **Ergänzende Einflussbereiche:** Wirkungspfade dürfen sichtbar bleiben, wenn gerade die Verbindung zu mehreren planetaren Grenzen den fachlichen Zweck des Beitrags bildet.
- **BLC:** Der Kurvenexport übernimmt Messreihen, Quellen und Herleitung der dargestellten Werte. Wirkungspfade beeinflussen den Export nicht und werden nicht als Teil der Kurvendaten interpretiert.

Die Darstellungsregel wird aus der Beitragsrolle abgeleitet. Einzelne Kernbeiträge benötigen deshalb keine eigenen Sichtbarkeitsschalter, um dieselbe Oberfläche zu erhalten.

## Einordnung und Aussagegrenzen

Die Oberfläche trennt vier Funktionen, die nicht miteinander vermischt werden sollen:

- **Befund:** Was zeigen die Daten oder die Studie?
- **Einordnung:** Was bedeutet der Befund im Zusammenhang des Beitrags?
- **Aussagegrenze:** Was lässt sich daraus nicht ableiten oder nicht auf andere Räume, Zeiten oder Populationen übertragen?
- **Daten und Methode:** Wie wurde ein Wert erhoben, rekonstruiert, modelliert oder für die Darstellung ausgewählt?

Der sichtbare Sammelbegriff lautet **„Einordnung und Aussagegrenzen“**. „Unsicherheit“ wird im sichtbaren Text nur verwendet, wenn tatsächlich eine statistische Unsicherheit, ein Messbereich oder eine Modellspanne gemeint ist.

Die vorhandenen Datenfelder bleiben nach ihrer fachlichen Ebene getrennt:

- `presentation.uncertainty` beschreibt die beitragsweite Einordnung oder Aussagegrenze.
- `measurements[].uncertainty` gilt nur für den jeweiligen Studien- oder Messwert.
- `timeSeries[].uncertainty`, punktbezogene `uncertainty` und Unsicherheiten von Szenarien gelten nur für das jeweilige Kurvensegment beziehungsweise den ausgewählten Wert.
- `pathways[].caution` beschreibt ausschließlich die Aussagegrenze des betreffenden Wirkungspfads.
- `knowledgeGaps[]` enthält offene Forschungsfragen und wird nicht als Synonym für Unsicherheit verwendet.

Beitragsweite Aussagen werden nicht noch einmal an jedem Messwert wiederholt. Identische Texte werden bei der Darstellung unterdrückt. Spezifische Einschränkungen bleiben direkt bei dem Messwert, der Studie, dem Szenario oder dem Wirkungspfad, auf den sie sich beziehen.

Für Kernbeiträge steht die Einordnung eingeklappt in der großen gemeinsamen Karte. Kurvenbezogene technische Details bleiben im BLC am jeweiligen Segment. Vertiefungsbeiträge verwenden dieselbe Bezeichnung und Reihenfolge; zusätzliche studien- oder pfadspezifische Aussagegrenzen stehen unmittelbar am jeweiligen Beleg.

### Vertiefungsbeiträge: schrittweise Offenlegung

Vertiefungen verwenden eine feste, themenunabhängige Reihenfolge: kurze Einordnung, höchstens drei nach Evidenzart bezeichnete Überblickszeilen, Wirkung und Gesundheit, Einordnung und Aussagegrenzen, Wissenslücken sowie Handlungsspielraum. Nicht vorhandene Bereiche werden ausgelassen. Jede Überblickszeile verwendet denselben Schalter „Details anzeigen“ und hält ihre Quellen und Aussagegrenzen unmittelbar bei der betreffenden Evidenzart. Ein zusätzliches beitragsweites Quellenpaket ist nur für echte Querschnittsquellen vorgesehen.

Die Überblickszeilen dürfen unterschiedliche Größen nicht zu einer gemeinsamen Messreihe vermischen. Insbesondere bleiben gesetzliche Grenz- oder Richtwerte, empirische Stichproben, modellierte Inventare und gesundheitliche Referenzwerte ausdrücklich getrennt. Die Auswahl der Überblickszeilen ändert keine Quelldaten; weitere Werte bleiben in den Detailbereichen erhalten.

Vorhandene Kurven- und Gesundheitsbezüge sind Fähigkeiten eines Beitrags, keine pauschale Eigenschaft seines Themas:

- Ein untergeordneter Kurvenbeitrag bleibt aus der Übersicht direkt erreichbar. Ein BLC-Link wird nur erzeugt, wenn `timeSeries[]` tatsächlich eine stabile Kurven-ID liefert. Ist der Unterbeitrag nur der technische Träger der Kurve, kann `knowledge-index.items[].menuHidden: true` seinen zusätzlichen Menüeintrag unterdrücken; Direktlink, Datenregistrierung und BLC-Export bleiben erhalten.
- Ein Eintrag in `healthContext` kann einen Gesundheitsbezug beschreiben. Erst `healthContext.markerSignals[]` erlaubt nach der Regel `explicit_links_only` einen Organstatus.
- `boundaryInteractions[]` steuert ausdrücklich modellierte Querverbindungen zu anderen Systemgrenzen.

Die generische Darstellung wird durch `renderDeepeningOverview` aufgebaut. Themen wie PFAS liefern nur die fachlichen Inhalte und die vorhandenen Fähigkeiten; Aufbau und Offenlegungsreihenfolge bleiben zentral geregelt.

### Neue Substanzen: fachliche Hierarchie

Die Navigation unter `novel_entities` bildet nicht bloß eine Liste von Stoffen und Studien. Sie trennt drei Ebenen:

1. Der Kernbeitrag `novel-entities-boundary-status` beschreibt ausschließlich die offizielle Kontrollvariable, den planetaren Grenzwert und den globalen Bewertungsstatus.
2. Einträge mit `groupOnly: true` bündeln Beiträge nach Stoff- beziehungsweise Materialfamilie. Sie besitzen selbst keine Messreihe und keine Gesundheitsbewertung.
3. Untergeordnete Beiträge werden über `parentId` als ergänzender Produktions-, Einsatz- oder Emissionsindikator, als Fallstudie oder als Gesundheitsevidenz eingeordnet.

Produktions-, Einsatz- und Emissionskurven dürfen im GWL und BLC erhalten bleiben, sind aber keine unmittelbare Messung der planetaren Kontrollvariable. Gesundheitsmarker werden unabhängig davon weiterhin ausschließlich aus `healthContext.markerSignals[]` abgeleitet. Die Reihenfolge der Stoffgruppen dient der verständlichen Navigation und stellt keine quantitative Risikorangfolge dar.

Thematische Haupt- und Vertiefungsbeiträge können mit `presentation.summaryCardMode: "narrative"` dieselbe ruhige Kartenzusammenfassung wie Kernbeiträge verwenden, ohne dadurch zum Kernbeitrag zu werden. `presentation.effectSummary` verbindet dafür Messgröße, zeitlichen Bezug, fachliche Bedeutung und wesentliche Aussagegrenze in einem kurzen Fließtext. Kurvenkontrolle und BLC-Link bleiben in der Karte; Studienbelege und Gesundheitsbezüge bleiben als nachgeordnete Details erhalten.

Enthält die Kartenzusammenfassung bereits die notwendige Orientierung, fasst `presentation.compactKnowledgeView: true` die ausführlichen Belege, Wirkungspfade und Querverbindungen in einem zunächst geschlossenen Detailbereich zusammen. `presentation.knowledgePanelLabel` kann dessen sachliche Beschriftung festlegen. Das ist keine Entfernung oder Zusammenrechnung von Evidenz: Die Detaildaten bleiben unverändert und werden nur nach Bedarf offengelegt.

## Bodymap-IDs und medizinische Bilder

Die Bodymap arbeitet mit stabilen Organ-/System-IDs. `ORGAN_MEDIA` in `app.js` ordnet diesen IDs eine statische medizinische Bilddatei zu. Mehrere Marker dürfen dasselbe Systembild verwenden, wenn es fachlich dieselbe Systemübersicht darstellt, z. B. `liver` und `gut` → `organ_digestive.jpg`.

Aktuell:

```text
brain            -> organ_brain.jpg
eyes             -> organ_senses.jpg
teeth            -> interne neutrale Ersatzgrafik
lungs            -> organ_respiratory.jpg
heart            -> organ_circulatory.jpg
liver            -> organ_digestive.jpg
kidneys          -> organ_urinary.jpg
gut              -> organ_digestive.jpg
urinary          -> organ_urinary.jpg
femaleRepro      -> organ_repro_female.jpg
maleRepro        -> organ_repro_male.jpg
skeleton         -> organ_skeleton.jpg
musculoskeletal  -> organ_skeleton.jpg
```

Die beiden Geschlechtsorgane bleiben zwei getrennte Bodymap-Marker und zwei getrennte Bilddateien.

## Organfenster: dynamischer Inhalt

Das Bild ist statisch. Der darunter angezeigte **Befund wird nicht separat im Organmodell gespeichert**, sondern direkt aus dem aktuell sichtbaren `finding` der WIRKUNG-Perspektive übernommen. Dadurch können Organfenster und WIRKUNG nicht versehentlich unterschiedliche Befundtexte zeigen.

Die **Einordnung** ist nur ein eingeklappter Verweis zurück auf WIRKUNG und keine zweite Datenkopie.

## Ursachenebene

`causes` kann an `ground`, `effect` und/oder `life` andocken. Die Ebene bleibt zunächst unsichtbar und wird nur angeboten, wenn Daten für den jeweiligen Kontext vorhanden sind.

## Weiterentwicklung

Neue Felder sollen nur ergänzt werden, wenn sie eine fachliche Aussage tragen. Vor Änderungen an der Datenstruktur wird diese Datei zusammen mit dem Code aktualisiert.


## Bodymap-Konfiguration (ab v0.9.3)

`bodymap.json` ist die zentrale Zuordnung zwischen Bodymap und Organfenstern.

Jeder Eintrag unter `organs` besitzt:
- `id`: stabile technische Organ-ID
- `label`: sichtbare Beschriftung
- `x`, `y`: Position des Markers in Prozent der Bodymap
- `side`: Seite der Beschriftung (`left` oder `right`)
- `image`: Bilddatei des Organfensters
- `layout`: Darstellungsmodus des Organbildes

Die vier Sinnesorgane verwenden die IDs `eye`, `ear`, `nose`, `tongue`.
Die ID `teeth` bleibt aus Kompatibilitätsgründen bestehen, die sichtbare Bezeichnung lautet `Gebiss`.
