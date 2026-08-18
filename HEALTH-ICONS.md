# GWL-PANEL · Symbolsprache für Gesundheitsbeiträge

## Ziel

Die Symbole sollen Ursachen und Expositionen schnell unterscheidbar machen, ohne Erkrankungen, Evidenzstufen oder Krankheitslast miteinander zu verwechseln.

**Ein Symbol steht im GWL-PANEL dauerhaft für dieselbe Bedeutung.**

## Gestaltungsregeln

- eigene, neu erzeugte SVGs
- keine Übernahme fremder Icon-Sets
- einfache Liniengrafik
- quadratisches `viewBox`, bevorzugt `0 0 32 32`
- keine Schrift im Symbol
- keine Logos
- keine dekorativen Schatten oder 3D-Effekte
- wenige, gut lesbare Elemente
- gleiche optische Strichstärke
- auch bei ca. 24–32 px verständlich
- neutraler Grundstil; Farbe nur unterstützend und nie als Evidenz- oder Risikoskala

## Semantische Regel

Das Symbol bezeichnet bevorzugt **Ursache oder Exposition**, nicht den gesundheitlichen Endpunkt.

Beispiele:

- `heat` → Hitze / thermische Belastung
- `chemical-pfas` → PFAS / chemische Stoffexposition
- `air-pollution` → Luftschadstoffexposition
- `noise` → Lärmexposition
- `uv-radiation` → UV-Strahlung
- `water-contaminant` → verunreinigtes Wasser
- `pathogen` → biologische Erreger
- `unknown` → noch keine eindeutige Symbolklasse

Ein Tropfen darf nicht gleichzeitig „Süßwassergrenze“, „Trinkwasserexposition“ und „Nierenerkrankung“ bedeuten.

## Technische Einbindung

Künftig bevorzugt ein explizites Feld in `health-contributions.json`:

```json
"icon": "heat"
```

Die Anwendung übersetzt diesen Schlüssel in ein eigenes SVG. Ein Fallback `unknown` bleibt immer verfügbar.

Solange nur wenige Symbole existieren, dürfen sie als Inline-SVG in `app.js` liegen. Ab ungefähr 10–15 Symbolen sollte die Sammlung in eine eigene Datei ausgelagert werden, z. B.:

`health-icons.js`

Damit bleiben `app.js`, Daten und Symbolbibliothek getrennt.

## Prompt-Vorlage für neue SVG-Symbole

Diese Vorlage soll für neue Symbole wiederverwendet werden:

> Erzeuge ein einzelnes, eigenständiges SVG-Symbol für das GWL-PANEL zum Begriff **[BEGRIFF]**. Das Symbol steht für **[URSACHE/EXPOSITION]**, nicht für die daraus entstehende Erkrankung. Verwende eine einfache medizinisch-wissenschaftliche Liniengrafik, quadratisches ViewBox 0 0 32 32, wenige klar erkennbare Formen, einheitliche Strichstärke, runde Linienenden, keine Schrift, keine Logos, keine Schatten, keine 3D-Wirkung und keine Übernahme eines bestehenden Icon-Stils. Das Symbol muss bei 24–32 px eindeutig erkennbar sein und sich klar von folgenden bereits verwendeten Symbolen unterscheiden: **[BESTEHENDE SYMBOLE]**. Liefere nur valides, kompaktes SVG mit `currentColor` für Stroke/Fill, soweit sinnvoll.

## Prüfcheck vor Übernahme

Vor jedem neuen Symbol prüfen:

1. Wird eine Ursache/Exposition dargestellt?
2. Ist es bei 24–32 px verständlich?
3. Kann es mit einem bestehenden Symbol verwechselt werden?
4. Hat dieselbe Bildidee im Panel bereits eine andere Bedeutung?
5. Ist es vollständig eigenständig gestaltet?
6. Funktioniert es monochrom?
7. Gibt es einen eindeutigen `icon`-Schlüssel?

Wenn eine dieser Fragen problematisch ist, Symbol vor Aufnahme überarbeiten.
