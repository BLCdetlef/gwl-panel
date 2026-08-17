# GWL – Knoten- und Ebenenspezifikation v1
Status: DRAFT / in Prüfung

## Zweck
Planetare Grenzen bleiben die oberste fachliche Hierarchie. Darunter werden Stoffe, Prozesse, Umweltzustände, Expositionen und Wirkungen als eigenständige Knoten gespeichert. Knoten werden nicht doppelt angelegt, nur weil sie in mehreren Wirkungspfaden vorkommen.

**Grundregel:** Der Graph darf kompliziert sein. Die Ansicht darf es nicht sein.

## Ebenenmodell
1. `planetary_boundary` – Planetare Grenze
2. `domain_component` – Teilbereich / Stoff / Kontrollgröße
3. `human_activity` – Menschliche Aktivität / Treiber
4. `pressure` – Druck / Eintrag / Entnahme
5. `mechanism` – Prozess / Mechanismus
6. `environmental_state` – Umweltzustand / Messbarer Zustand
7. `environmental_medium` – Betroffenes System / Medium
8. `exposure` – Exposition / Kontakt
9. `biological_effect` – Biologische / psychische Wirkung
10. `life_outcome` – LEBEN / Ergebnis
11. `action_scope` – Handlungsspielraum (Orientierungsebene, keine naturwissenschaftliche Wirkungsebene)

## Knoten
Jeder Knoten besitzt mindestens:
```json
{"id":"state_groundwater_nitrate","type":"environmental_state","label":"Nitrat im Grundwasser"}
```

IDs bleiben stabil, auch wenn sich sichtbare Bezeichnungen ändern.

## Verbindungen
Jede Verbindung ist ein eigenes Objekt:
```json
{
  "from":"pressure_n_surplus",
  "to":"state_groundwater_nitrate",
  "relationType":"contributes_to",
  "mechanismRef":"mechanism_leaching",
  "direction":"increase",
  "evidenceStatus":"strong"
}
```

## Relationstypen
Hierarchie:
- `contains`
- `part_of`
- `belongs_to_boundary`

Ursache / Prozess:
- `causes`
- `contributes_to`
- `increases`
- `decreases`
- `transforms_into`
- `transported_by`
- `diluted_by`
- `concentrated_by`

System:
- `occurs_in`
- `affects`
- `amplifies`
- `reduces`
- `interacts_with`

Mensch / Wirkung:
- `exposes_via`
- `triggers`
- `impairs`
- `protects`
- `associated_with`

Orientierung:
- `modifiable_by`
- `regulated_by`
- `influenced_by_actor`

## Evidenzstatus
- `strong`
- `moderate`
- `weak`
- `open`
- `conflicting`

Evidenz bewertet den einzelnen Pfeil, nicht pauschal den ganzen Pfad.

## Wechselwirkungen zwischen Planetaren Grenzen
Wechselwirkungen werden nicht als abstrakte Direktverbindungen erfunden, sondern entstehen durch gemeinsame Knoten und belegte Mechanismen.

Beispiel:

```text
Nährstoffkreisläufe
  ↓
Stickstoff
  ↓
Stickstoffüberschuss
  ↓
Auswaschung
  ↓
Nitrat im Grundwasser
  ↓
Grundwasser
  ↓
Süßwasser
```

Weitere Verzweigung:
```text
Stickstoffüberschuss
  ├─→ Nitrat im Grundwasser → Süßwasser
  ├─→ Eutrophierung → Biosphärenintegrität
  └─→ N₂O → Klimawandel
```

## Beispielpfad Stickstoff / Nitrat
```text
Nährstoffkreisläufe
→ Stickstoff
→ Landwirtschaft
→ Stickstoffüberschuss
→ Nitrifikation / Auswaschung
→ Nitrat im Grundwasser
→ Grundwasser / Süßwasser
→ Trinkwasser
→ Methämoglobinbildung
→ gesundheitliche Wirkung
```

## Beispielpfad Phosphor
```text
Nährstoffkreisläufe
→ Phosphor
→ Landwirtschaft / Abwasser
→ Phosphoreintrag
→ Oberflächenwasser
→ Eutrophierung
→ Sauerstoffmangel / Algenblüten
→ Biosphärenintegrität / Wasserqualität
→ indirekte Wirkung auf LEBEN
```

## Regeln gegen Unübersichtlichkeit
1. Das Datenmodell speichert das vollständige Netz.
2. Die Oberfläche zeigt nie das vollständige Netz gleichzeitig.
3. Startpunkt ist eine Planetare Grenze oder ein ausgewählter Knoten.
4. Im ersten Schritt erscheinen höchstens 3–5 direkte Folge-Knoten.
5. Nebenpfade werden erst nach Interaktion eingeblendet.
6. Querverbindungen erscheinen zunächst nur als Hinweis, z. B. „Verbindung zu Süßwasser“.

## Validierungsregeln
Warnen, wenn:
- eine Planetare Grenze direkt mit einem Organ verbunden wird,
- ein Umweltzustand ohne nötige Exposition direkt zur Gesundheitswirkung springt,
- ein Pfeil keinen Mechanismus oder keine Quelle besitzt,
- ein Knoten doppelt angelegt wird,
- ein Messwert mit falscher Einheit verknüpft wird,
- eine Erdsystemgrenze als Gesundheitsgrenze dargestellt wird.

## Datenbankfähigkeit
Kernobjekte:
- `nodes`
- `edges`
- `measurements`
- `sources`
- `locations`
- `time_ranges`
- `action_scopes`

Für den Pilot kann JSON bleiben. Später bietet sich PostgreSQL an; Graphabfragen können darauf aufsetzen.

## Offene Fragen vor Freigabe
1. Brauchen wir `environmental_medium` wirklich als eigene Ebene?
2. Funktioniert `human_activity` vs. `pressure` bei allen Planetaren Grenzen?
3. Wo liegen gesellschaftliche Wirkungen ohne direkten Körper-/Psychepfad?
4. Wie integrieren wir Technik & Lebensweise?
5. Wie integrieren wir Stoff- und Energieströme?
6. Wie modellieren wir psychische Belastungen?
7. Welche Relationstypen brauchen wir wirklich?

## Freigaberegel
Diese Spezifikation bleibt DRAFT, bis:
- Stickstoff/Nitrat funktioniert,
- Phosphor funktioniert,
- mindestens ein völlig anderer Pfad (z. B. PFAS oder Hitze) ohne Sonderregeln funktioniert,
- die Darstellung für Nicht-Fachleute nachvollziehbar bleibt.
