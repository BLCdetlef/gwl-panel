# GWL – Knoten- und Ebenenspezifikation v1.1
Status: DRAFT / in Prüfung

## Warum v1.1?
Der Vergleich von Stickstoff und Phosphor zeigt: Die **Knotentypen funktionieren**, aber die Vorstellung einer festen linearen Reihenfolge funktioniert nicht zuverlässig.

Darum gilt ab v1.1:

> Die Planetaren Grenzen bleiben die oberste Hierarchie. Darunter arbeitet das Modell als Graph aus typisierten Knoten.

## Gemeinsamer Start

```text
PLANETARE GRENZE
Nährstoffkreisläufe
        │
        ├── Stickstoff
        └── Phosphor
```

Ab dort verzweigen die Pfade.

## Stickstoff

```text
Nährstoffkreisläufe
→ Stickstoff
→ Landwirtschaft
→ Stickstoffüberschuss
→ Nitrifikation / Auswaschung
→ Nitrat im Grundwasser
→ Grundwasser
→ Trinkwasser
→ Methämoglobinbildung
→ LEBEN
```

Nebenpfade:

```text
Stickstoffüberschuss
├─→ N₂O → Klimawandel
└─→ Eutrophierung → Biosphärenintegrität
```

## Phosphor

```text
Nährstoffkreisläufe
→ Phosphor
→ Landwirtschaft / Abwasser
→ Phosphoreintrag
→ Abschwemmung / Erosion
→ Oberflächenwasser
→ erhöhte Phosphorverfügbarkeit
→ Eutrophierung
→ Algen-/Cyanobakterienblüte
→ Trinkwasser / Badegewässer
→ LEBEN
```

Nebenpfade:

```text
Phosphoreintrag
├─→ Flüsse → Ozean
└─→ Eutrophierung → Biosphärenintegrität
```

## Was beide Fälle bestätigen

Die vorhandenen Knotentypen reichen aus:
- `planetary_boundary`
- `domain_component`
- `human_activity`
- `pressure`
- `mechanism`
- `environmental_state`
- `environmental_medium`
- `exposure`
- `biological_effect`
- `life_outcome`
- `action_scope`

Wir brauchen für Phosphor **keinen neuen Sondertyp**.

## Was v1 korrigiert werden muss

### 1. Keine starre Ebenenfolge
`environmental_medium` kann vor oder nach einem `environmental_state` sinnvoll sein.

Beispiel Stickstoff:
```text
Nitrat im Grundwasser → Grundwasser
```

Beispiel Phosphor:
```text
Oberflächenwasser → erhöhte Phosphorverfügbarkeit
```

Beides ist logisch.

### 2. Neue Gefahren können im Pfad entstehen
Beim Phosphor ist nicht zwingend Phosphor selbst die relevante menschliche Exposition.

```text
Phosphor
→ Eutrophierung
→ Cyanobakterien
→ Cyanotoxine
→ Exposition
```

Das Modell muss deshalb erlauben, dass ein Prozess neue relevante Knoten erzeugt.

### 3. Planetare Grenzen sind Orientierung, nicht Zwangsroute
Ein Pfad startet unter einer Planetaren Grenze, kann aber später mehrere andere Grenzen berühren.

Die Verbindung wird nicht erfunden, sondern entsteht über konkrete Knoten.

### 4. Ein Knoten existiert nur einmal
`Eutrophierung` darf nicht einmal unter Stickstoff und ein zweites Mal unter Phosphor angelegt werden.

Stattdessen:

```text
Stickstoffüberschuss ─┐
                      ├─→ Eutrophierung
Phosphoreintrag ──────┘
```

Genau dadurch entsteht das Wissensnetz.

## Neue Formulierung der Architektur

Nicht mehr:

```text
Ebene 1 → Ebene 2 → Ebene 3 → ... → Ebene 11
```

Sondern:

```text
Planetare Grenze
      ↓
typisierte Knoten
      ↓
belegte Beziehungen
      ↓
mehrere mögliche Pfade
      ↓
LEBEN
```

## Darstellung im GWL

Das vollständige Netz bleibt im Hintergrund.

Vorne sieht man beispielsweise zunächst:

```text
Nährstoffkreisläufe
├── Stickstoff
└── Phosphor
```

Klick auf **Stickstoff**:

```text
Stickstoff
├── Stickstoffüberschuss
├── N₂O
└── Nitrat
```

Klick auf **Nitrat**:

```text
Nitrat
├── Grundwasser
├── Oberflächenwasser
└── Trinkwasser
```

Querverbindungen erscheinen zunächst nur als kleine Hinweise:

```text
↗ Verbindung zu Süßwasser
↗ Verbindung zu Klimawandel
```

Erst beim Öffnen wird der entsprechende Nebenpfad sichtbar.

## Ergebnis des Tests

**Bestanden mit einer wichtigen Änderung.**

Die Typisierung der Knoten funktioniert für Stickstoff und Phosphor.  
Die starre Hierarchie unterhalb der Planetaren Grenze funktioniert nicht.

Deshalb lautet die v1.1-Regel:

> Planetare Grenzen strukturieren den Einstieg.  
> Danach folgt kein Baum, sondern ein typisierter Wissensgraph.

## Nächster Härtetest

PFAS / Neue Substanzen.

PFAS ist geeignet, weil dort:
- ein Stoff mehreren Umweltmedien vorkommt,
- keine einfache globale Referenzgröße existiert,
- Expositionswege vielfältig sind,
- Gesundheitswirkungen stark evidenzabhängig sind,
- Wechselwirkungen mit Süßwasser besonders relevant werden.

Wenn PFAS ohne neue Sonderarchitektur funktioniert, kann v1.1 Richtung Freigabe gehen.
