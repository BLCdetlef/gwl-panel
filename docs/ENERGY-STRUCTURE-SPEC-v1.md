# EAH-Mirror / GWL – Energie-Spezifikation v1
**Status: STABLE v1**

## Zweck

Diese Spezifikation wurde aus vier funktionierenden Piloten abgeleitet:

- Erdöl
- Kohle
- Wind
- Solar

Sie definiert die gemeinsame Energie-Architektur innerhalb der ergänzenden
Systemgrenze **Stoff- und Energieströme**.

Die wichtigste Entscheidung:

> Neue Energieträger bekommen ab jetzt **keine eigene Sonderarchitektur**.
> Zuerst wird versucht, sie in diese Spezifikation einzuordnen.

Eine Änderung der Spezifikation erfolgt erst, wenn ein realer neuer Fall mit den
vorhandenen Rollen fachlich nicht korrekt darstellbar ist.

---

# 1. Stabile Hierarchie

```text
Stoff- und Energieströme
└── Energie
    └── Energieträger / Energieform
        ├── Erdöl
        ├── Kohle
        ├── Wind
        ├── Solar
        └── später weitere
```

`Stoff- und Energieströme` bleibt eine **ergänzende Systemgrenze des EAH-Mirror**,
keine Planetare Grenze.

---

# 2. Gemeinsamer Kern: `system_flow`

Die vier Piloten zeigen, dass wir nicht einen einzigen physischen Flusstyp für
alle Energieformen erzwingen dürfen.

Beispiele:

```text
Erdöl → 101,81 Mio. Barrel/Tag
Kohle  → 9,15 Mrd. t/Jahr
Wind   → 2.494 TWh/Jahr
Solar  → rund 2.000 TWh/Jahr
```

Alle sind `system_flow`, aber mit unterschiedlichen **Messrollen**.

> Wir harmonisieren die Bedeutung der Messgrößen – nicht ihre Einheiten.

---

# 3. Stabile Messrollen

Ein Energieträger darf je nach Physik und Nutzung passende Rollen verwenden.

## Produktion / Bereitstellung

Typisch für Brennstoffe:

```text
Erdölproduktion
Kohleproduktion
```

## Installierte Kapazität

Typisch für Erzeugungstechnologien:

```text
Windleistung in GW
Solarleistung in GW
```

Das ist eine **Bestands-/Infrastrukturgröße**, kein Energiefluss.

## Kapazitätszubau

```text
GW/Jahr
```

Das ist eine Ausbaugröße.

## Nachfrage / Verbrauch

```text
Ölnachfrage
Kohlenachfrage
```

Immer getrennt von Produktion.

## Energieerzeugung

```text
TWh/Jahr
```

Für Stromerzeuger ist dies die bevorzugte gemeinsame Vergleichsgröße.

## Nutzung / Umwandlung

Technologiespezifisch, z. B.:

```text
Kohleverstromung
Raffination
```

## Emission / Druck

Nachgelagerte Größe, z. B.:

```text
CO₂ aus Kohlenutzung
CO₂ aus Ölnutzung
```

Nie als Ersatz für Produktionsdaten verwenden.

## Veränderungsgröße

Beispiel:

```text
+180 TWh Windstrom gegenüber Vorjahr
```

Solche Δ-Werte sollen künftig bevorzugt **Zusatzinformationen** eines Flusses sein.
Eine eigene Messkarte ist nur sinnvoll, wenn die Veränderung selbst fachlich
zentral ist.

---

# 4. Kein Einheitenzwang

Zulässig sind beispielsweise:

```text
Barrel/Tag
Tonnen/Jahr
GW
GW/Jahr
TWh/Jahr
EJ/Jahr
Gt CO₂/Jahr
```

Nicht zulässig:

```text
Barrel/Tag direkt mit Tonnen/Jahr vergleichen
GW als erzeugte Energie behandeln
Produktion als Emission behandeln
```

Für echte Vergleiche braucht es eine gemeinsame Bezugsgröße.

Für Stromerzeuger:

```text
TWh/Jahr
```

Für breitere Energiesystemvergleiche kann später beispielsweise:

```text
EJ/Jahr
```

verwendet werden.

Jede Umrechnung muss dokumentiert werden.

---

# 5. Planetare Grenzen

Die Planetaren Grenzen bleiben **Zielknoten von Wirkungspfaden**.

Beispiel:

```text
Kohle
→ Verbrennung
→ CO₂
→ Klimawandel
```

oder:

```text
Wind
→ Stromerzeugung
→ mögliche Verdrängung fossiler Erzeugung
→ geringerer Druck auf Klimawandel
```

Wind und Solar erhalten dabei **keine negativen Emissionen**.

Die Richtung lautet:

```text
reduces_pressure_on_boundary
```

---

# 6. Eine Planetare Grenze = eine Karte

Festgeschriebene Regel:

> **Ein Zielknoten = eine Graphkante = eine Verbindungskarte.**

Also nicht:

```text
Süßwasser / Landnutzungsänderung
```

sondern:

```text
→ Süßwasser
→ Landnutzungsänderung
```

---

# 7. Fossil und erneuerbar dürfen verschieden bleiben

Die Spezifikation schreibt keine Prozesse vor.

Erdöl kann besitzen:

```text
Förderung
Raffination
Verbrennung
Petrochemie
```

Kohle:

```text
Bergbau
Verbrennung
Kohleverstromung
```

Wind:

```text
Installation
Kapazität
Windstromerzeugung
Netzintegration
```

Solar:

```text
Herstellung / Installation
Kapazität
Solarstromerzeugung
Dach- oder Freiflächenbezug
```

Das gemeinsame Modell besteht aus **Rollen**, nicht aus identischen Prozessketten.

---

# 8. Gesundheit

Keine direkte Kante:

```text
Kohle → Lunge
```

oder:

```text
Wind → Gesundheit
```

Stattdessen braucht es einen vollständigen Wirkungspfad:

```text
Energieträger
→ Prozess / Druck
→ Umweltmedium
→ Exposition
→ biologische / psychische Wirkung
→ LEBEN
```

Erst dann darf die Bodymap einen gesundheitlichen Marker erhalten.

---

# 9. Wissenslücken

Jeder Energie-Pilot enthält einen Pflichtblock `knowledgeGaps`.

Warum?

Weil wir bei unterschiedlichen Technologien immer wieder auf Fragen stoßen wie:

- Welche Definition ist international vergleichbar?
- Welche Einheit ist die richtige?
- Welche Wirkung ist global quantifizierbar?
- Welche Wirkung muss regional bleiben?
- Welche Untertechnologien müssen getrennt werden?

Diese Unsicherheit bleibt Teil des Wissensnetzes.

---

# 10. Handlungsspielraum

Auch `actionScope` bleibt Pflicht.

Aber:

> Handlungsspielraum ist **keine naturwissenschaftliche Messgröße**.

Er bleibt eine getrennte Orientierungsebene.

Typische Dimensionen:

```text
individuelle Nachfrage / Eigenerzeugung
direkte Systemveränderung
kollektiver Hebel
```

---

# 11. UI-Regel

Für jeden Energieträger gilt dieselbe Leserichtung:

```text
Energieträger
↓
Messwerte
↓
Verbindungen zu Planetaren Grenzen
↓
Wissenslücken
↓
Handlungsspielraum
```

Die Oberfläche zeigt den relevanten Ausschnitt.
Der Wissensgraph speichert die vollständigen Verbindungen.

---

# 12. Stabilitätsentscheidung

Die Energiearchitektur ist jetzt:

# **STABLE v1**

Das bedeutet nicht, dass sie endgültig unveränderbar ist.

Es bedeutet:

> Wir verändern das Schema nicht mehr, nur weil ein neuer Energieträger etwas
> anders aussieht.

Eine Änderung ist erst gerechtfertigt, wenn beispielsweise Wasserkraft,
Kernenergie, Biomasse, Speicher oder Netze **nachweislich nicht korrekt** mit den
vorhandenen Rollen abbildbar sind.

Damit haben wir erstmals ein stabilisiertes Modul innerhalb der ergänzenden
Systemgrenzen des EAH-Mirror.
