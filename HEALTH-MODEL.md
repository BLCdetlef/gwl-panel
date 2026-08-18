# GWL-PANEL · Gesundheitsmodell

Stand: Referenzstruktur nach erfolgreichem Nieren-Prototyp

## Zweck

Diese Datei hält die verbindliche Struktur für den Bereich **LEBEN** im GWL-PANEL fest. Die Niere ist die erste Referenzimplementierung. Neue Organe sollen dieselbe Daten- und Darstellungslogik verwenden, ohne organspezifische Sonderprogrammierung in `app.js`.

## Grundprinzip

**Die Farbe eines Organs zeigt nur quantifizierbare, zurechenbare Krankheitslast. Weitere wissenschaftlich belegte Risiken erscheinen beim Anklicken als zusätzliche Wirkungspfade, verändern die Farbe aber erst, wenn ihre Krankheitslast belastbar quantifiziert und für die Organfarbe auf eine gemeinsame organspezifische Bezugsgröße normiert werden kann.**

Evidenz wird **nicht** mit Krankheitslast verrechnet. Sie ist eine Qualitäts- und Freigabeschranke.

## Evidenzstufen

- **A** – Quantifizierte, zurechenbare Krankheitslast vorhanden. Grundsätzlich für die Organfarbe geeignet; eine gemeinsame Bezugsgröße ist zusätzlich erforderlich.
- **B** – Gesundheitsrisiko quantitativ beschrieben, aber keine belastbare zurechenbare Krankheitslast. Als Beitrag sichtbar, ohne Einfluss auf die Organfarbe.
- **C** – Wirkungspfad wissenschaftlich belegt, aber Krankheitslast nicht ausreichend quantifiziert. Als Beitrag sichtbar, ohne Einfluss auf die Organfarbe.

## Referenzstruktur eines Organs

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
- `affectsOrganColor` – nur `true`, wenn die Farbregel vollständig erfüllt ist
- `colorStatus` – maschinenlesbare Einordnung
- `whyNoColor` – transparente Begründung, wenn keine Färbung erfolgt
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
- Einordnung / Begründung der Organfarbe
- Quelle
- Rücksprung: `→ Ursache im GWL-Panel öffnen`

## Terminologie

Einheitlich verwenden:

- **Organmarker** – anklickbares Symbol auf der Körperabbildung
- **Organfarbe** – Visualisierung quantifizierter, normierter zurechenbarer Krankheitslast
- **Organfenster** – Detailfenster nach Klick auf den Organmarker
- **Gesundheitsbeitrag** – einzelner belegter Wirkungspfad auf ein Organ/System
- **Krankheitslast** – bevorzugte Zielgröße, z. B. DALYs, sofern belastbar zurechenbar

Nicht mehr verwenden:

- „Kuller“
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

- quantifizierte Krankheitslast vorhanden, aber noch nicht normiert → sichtbar, noch keine Organfarbe
- gesundheitlicher Zusammenhang belegt, Krankheitslast nicht belastbar quantifiziert → sichtbar, keine Organfarbe

Damit ist die Architektur für weitere Organe grundsätzlich vorbereitet.
