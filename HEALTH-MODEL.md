# GWL-PANEL · Gesundheitsmodell

Stand: Referenzstruktur nach erfolgreichem Nieren-Prototyp

## Zweck

Diese Datei hält die verbindliche Struktur für den Bereich **LEBEN** im GWL-PANEL fest. Die Niere ist die erste Referenzimplementierung. Neue Organe sollen dieselbe Daten- und Darstellungslogik verwenden, ohne organspezifische Sonderprogrammierung in `app.js`.

## Grundprinzip

**Die Markerfüllung ist das innere Darstellungssignal des Organmarkers. Sie bleibt neutral, wird bei belegter, aber nicht ausreichend quantifizierter Organwirkung schraffiert und erhält erst bei quantifizierter, zurechenbarer sowie organspezifisch normierter Krankheitslast eine Graustufe. Der Außenring kennzeichnet davon unabhängig einen geprüften Organbezug.**

Evidenz wird **nicht** mit Krankheitslast verrechnet. Sie ist eine Qualitäts- und Freigabeschranke.

## Evidenzstufen

- **A** – Quantifizierte, zurechenbare Krankheitslast vorhanden. Grundsätzlich für eine abgestufte Markerfüllung geeignet; eine gemeinsame Bezugsgröße ist zusätzlich erforderlich.
- **B** – Gesundheitsrisiko quantitativ beschrieben, aber keine belastbare zurechenbare Krankheitslast. Als Beitrag sichtbar, ohne abgestufte Markerfüllung.
- **C** – Wirkungspfad wissenschaftlich belegt, aber Krankheitslast nicht ausreichend quantifiziert. Als Beitrag sichtbar, ohne abgestufte Markerfüllung.

## Referenzstruktur eines Organs

Das kanonische Organregister liegt in `bodymap.json` und wird durch
`data/schema/bodymap-organ-v1.json` beschrieben. Die dortige `id` ist der
stabile Schlüssel für Bodymap, Gesundheitsstudien, Knowledge-Beiträge sowie
Links aus GRUNDLAGE und WIRKUNG. Fachlich eindeutige Bezeichnungen werden
über `aliases` aufgelöst. `legacyAliases` erhalten bestehende Verbindungen,
sollen aber nicht für neue Daten verwendet werden. Breite oder mehrdeutige
`searchTerms` unterstützen ausschließlich die Suche und aktivieren niemals
automatisch einen Organmarker. Ein Eintrag kennzeichnet außerdem mit `entityType`,
ob der Marker ein einzelnes Organ, eine Organgruppe oder ein Organsystem
repräsentiert, und ordnet ihn einem `primarySystemId` zu.
Medizinisch überlappende Systeme bleiben als Beziehung erhalten: Die Nase gehört
primär zum Atmungssystem und zusätzlich zu den Sinnesorganen; das Skelettsystem
ist ein eigenständiges System mit Bezug zum übergeordneten Bewegungsapparat.

Gesundheitsbeiträge bleiben in ihren Quelldatensätzen getrennt. Das
Organfenster führt sie über die kanonische Organ-ID zusammen, ohne
Krankheitslasten, Gewebenachweise oder Wirkungspfade rechnerisch zu vermischen.

Jedes Organ steht in `health-contributions.json` unter `organs[]`.

Pflichtlogik:

- `organId` – technische ID, passend zur Bodymap
- `organLabels` – Synonyme für robuste Zuordnung
- `contributions[]` – beliebig viele gesundheitliche Beiträge

Jeder Beitrag verwendet möglichst:

- `id` – stabile, eindeutige ID
- `label` – kurze Kausalkette für die Karte
- `icon` – Symbolschlüssel, z. B. `heat`, `chemical-pfas`
- `exposure.agent` – auslösende Exposition/Ursache
- `exposure.path` – Expositionspfad
- `healthEndpoint` – gesundheitlicher Endpunkt
- `evidenceLevel` – A, B oder C
- `burden` – Krankheitslast, falls belastbar quantifiziert
- `affectsOrganColor` – technischer Kompatibilitätsname; nur `true`, wenn die Regel für eine abgestufte Markerfüllung vollständig erfüllt ist
- `colorStatus` – maschinenlesbare Einordnung
- `whyNoColor` – technischer Kompatibilitätsname; transparente Begründung, weshalb keine Graustufe gesetzt wird
- `sourceRefs` – Verweise auf geprüfte Quellen
- `route` – Rücksprung in die passende GRUNDLAGE/Knowledge-Struktur

## Darstellung im Organfenster

Die Referenzdarstellung ist:

1. Organname
2. Organbild
3. kurzer Befund
4. Methodik
5. **Beitragende Ursachen / Pfade**
6. beliebig viele Gesundheitskarten, standardmäßig eingeklappt

Geschlossene Gesundheitskarte:

- Symbol
- Titel/Wirkungspfad
- Evidenzstufe
- Krankheitslast-Status

Geöffnete Gesundheitskarte:

- Exposition
- Gesundheitsendpunkt
- Krankheitslast
- Einordnung / Begründung der Markerfüllung
- Quelle
- Rücksprung: `→ Ursache im GWL-Panel öffnen`

## Terminologie

Einheitlich verwenden:

- **Organmarker** – anklickbares Symbol auf der Körperabbildung
- **Markerfüllung** – Oberbegriff für die neutrale, schraffierte oder grau abgestufte Innenfläche des Markers
- **Graustufe** – ausschließlich Visualisierung quantifizierter, zurechenbarer und organspezifisch normierter Krankheitslast
- **Schraffur** – belegte Organwirkung ohne ausreichend quantifizierte zurechenbare Krankheitslast
- **Außenring** – geprüfter Organbezug; unabhängig von der Markerfüllung und kein automatischer Nachweis eines ursächlichen Organschadens
- **Organfenster** – Detailfenster nach Klick auf den Organmarker
- **Gesundheitsbeitrag** – einzelner belegter Wirkungspfad auf ein Organ/System
- **Krankheitslast** – bevorzugte Zielgröße, z. B. DALYs, sofern belastbar zurechenbar

Nicht mehr verwenden:

- umgangssprachliche Bezeichnungen für die Organmarker
- „Funktionsverlust“ als allgemeine Organfarb-Skala
- frei erfundene 0–100-Gewichte

## Regel für neue Organe

Neue Organe werden grundsätzlich **datengetrieben** ergänzt:

1. Organ in `bodymap.json` vorhanden?
2. passendes Organbild vorhanden?
3. neuer Organblock in `health-contributions.json`
4. Beiträge mit Quellen, Evidenz und Rücksprung ergänzen
5. keine Änderung an `app.js`, solange kein wirklich neues Darstellungsprinzip nötig ist

## Referenz: Niere

Die Niere dient als technische Referenz. Der aktuelle Pilot zeigt zwei unterschiedliche Fälle:

- quantifizierte Krankheitslast vorhanden, aber noch nicht normiert → sichtbar, noch keine Graustufe der Markerfüllung
- gesundheitlicher Zusammenhang belegt, Krankheitslast nicht belastbar quantifiziert → sichtbar, je nach Evidenz schraffierte oder neutrale Markerfüllung

Damit ist die Architektur für weitere Organe grundsätzlich vorbereitet.
