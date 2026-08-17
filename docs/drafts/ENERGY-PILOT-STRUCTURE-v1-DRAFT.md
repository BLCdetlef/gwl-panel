# GWL / EAH-Mirror – Energie-Pilotstruktur v1
**Status: DRAFT / aus Erdöl + Kohle abgeleitet**

## Ergebnis

Die beiden funktionierenden Piloten **Erdöl** und **Kohle** zeigen, dass die
Energie-Struktur generalisiert.

Wir brauchen **keine eigene Sonderarchitektur pro Energieträger**.

Die verbindliche Grundform ist:

```text
Stoff- und Energieströme
└── Energie
    └── Energieträger
        ├── Produktion / Bereitstellung
        ├── Nachfrage / Verbrauch
        ├── Nutzung / Umwandlung       optional
        ├── Emissionen / Drücke        optional
        ├── Verbindungen zu PG
        ├── Wissenslücken
        └── Handlungsspielraum
```

---

# 1. Was bei Erdöl und Kohle wirklich gleich ist

## Hierarchie

```text
EAH-Systemgrenze
Stoff- und Energieströme
        ↓
Energie
        ↓
Energieträger
```

Der Energieträger bleibt immer ein `domain_component`.

Darunter liegen die quantifizierbaren Ströme als `system_flow`.

---

# 2. `system_flow` ist die gemeinsame Basis

Erdöl:

```text
Globale Ölproduktion
101,81 Mio. Barrel/Tag
```

Kohle:

```text
Globale Kohleproduktion
9,15 Mrd. t/Jahr
```

Diese beiden Größen haben **dieselbe semantische Rolle**, obwohl ihre Einheiten
völlig verschieden sind.

Das ist ausdrücklich erlaubt.

> Die Datenstruktur harmonisiert Bedeutungen, nicht zwangsläufig Einheiten.

---

# 3. Vier Messrollen

Für Energieträger unterscheiden wir künftig vier Rollen.

## A. Produktion / Bereitstellung

```text
Erdöl → globale Ölproduktion
Kohle → globale Kohleproduktion
```

Für einen ersten Energie-Pilot ist diese Rolle Pflicht.

## B. Nachfrage / Verbrauch

```text
Erdöl → Ölnachfrage
Kohle → Kohlenachfrage
```

Diese Größe wird getrennt gespeichert.

```text
Produktion ≠ Verbrauch
```

## C. Nutzung / Umwandlung

Optional und energieträgerspezifisch.

Beispiele:

```text
Kohle → Stromerzeugung aus Kohle
Erdöl → flüssige Kraftstoffproduktion / Raffination
```

Bei späteren Energieträgern könnten hier völlig andere Größen stehen:

```text
Erdgas → Strom-/Wärmeerzeugung
Wind → Stromerzeugung
Solar → Stromerzeugung
Biomasse → Wärme / Strom / Kraftstoff
```

Die Architektur verlangt nicht, dass jeder Energieträger dieselben Messgrößen hat.

## D. Emission / Druck

Beispiel:

```text
Erdöl → CO₂ aus Ölnutzung
Kohle → CO₂ aus Kohlenutzung
```

Diese Rolle ist bereits **nachgelagert**.

Ein Produktionswert darf deshalb nie stillschweigend als Emissionswert benutzt werden.

---

# 4. Planetare Grenzen bleiben Zielknoten

Das gemeinsame Muster:

```text
Energieträger
    ↓
Prozess
    ↓
Druck / Zustand
    ↓
PG
```

Beispiel Kohle:

```text
Kohle
→ Verbrennung
→ CO₂
→ Klimawandel
```

Beispiel Erdöl:

```text
Erdöl
→ petrochemische Nutzung
→ chemische / materielle Stoffströme
→ Neue Substanzen
```

Der Energieträger wird **nicht unter der PG erneut angelegt**.

---

# 5. Eine PG = eine Verbindungskarte

Die Erdöl-Korrektur hat eine wichtige Designregel bestätigt:

```text
Süßwasser / Landnutzungsänderung
```

als kombinierte Karte war falsch.

Richtig:

```text
→ Süßwasser

→ Landnutzungsänderung
```

Deshalb gilt ab jetzt:

> **Jeder Zielknoten des Graphen erhält eine eigene Kante und eine eigene
> Verbindungskarte.**

Auch dann, wenn zwei Wirkungen aus demselben Prozess stammen.

---

# 6. Was energieträgerspezifisch bleiben darf

Erdöl besitzt beispielsweise:

```text
→ Neue Substanzen
```

Kohle besitzt:

```text
→ Atmosphärische Aerosole
```

Das ist **kein Strukturproblem**, sondern gerade der Sinn des Graphen.

Wir brauchen also keine Pflichtliste von Planetaren Grenzen pro Energieträger.

Die einzige Regel lautet:

> Eine Verbindung wird nur angelegt, wenn ein fachlich nachvollziehbarer
> Wirkungspfad vorhanden ist.

---

# 7. Einheiten

Die Piloten haben gezeigt:

```text
Erdöl       Barrel/Tag
Kohle       Tonnen/Jahr
Strom       TWh/Jahr
Energie     EJ/Jahr
CO₂         Gt CO₂/Jahr
```

Diese Werte dürfen nebeneinander existieren.

Was wir **nicht** tun dürfen:

```text
101 Mio. Barrel/Tag
vs.
9 Mrd. t/Jahr

→ daraus direkt ableiten, welcher Energieträger „größer“ ist
```

Für Vergleiche brauchen wir eine gemeinsame Bezugsgröße.

Beispiele:

- Energieinhalt in EJ
- erzeugter Strom in TWh
- CO₂ pro Energieeinheit
- Flächenbedarf pro Energieeinheit
- Wasserbedarf pro Energieeinheit

Jede solche Normierung muss separat dokumentiert werden.

---

# 8. Verbindliche Energie-Pilotstruktur

```text
ENERGIETRÄGER
│
├── system_flow: Produktion              PFLICHT
│
├── system_flow: Nachfrage/Verbrauch     empfohlen
│
├── system_flow: Nutzung/Umwandlung      optional
│
├── pressure/system_flow: Emission       optional
│
├── Wirkungspfade
│   ├── → Planetare Grenze A
│   ├── → Planetare Grenze B
│   └── → ...
│
├── Wissenslücken                         PFLICHT
│
└── Handlungsspielraum                    PFLICHT
```

---

# 9. Was nicht in diese Schablone gehört

Nicht jeder Energieträger muss:

- CO₂ emittieren;
- gefördert werden;
- verbrannt werden;
- Wasser belasten;
- Neue Substanzen erzeugen;
- dieselben Einheiten besitzen.

Darum wird beispielsweise Solar später nicht künstlich nach dem Schema
„Förderung → Verbrennung“ modelliert.

Die Schablone definiert **Rollen**, keine vorgeschriebenen Prozesse.

---

# 10. Nächster Härtetest

Mit Erdöl und Kohle haben wir zwei fossile Energieträger.

Der nächste wirklich interessante Test sollte deshalb **kein dritter fossiler
Energieträger** sein.

Am aussagekräftigsten wäre:

```text
Wind
```

oder:

```text
Solar
```

Denn dann fehlen Verbrennung und direkte Brennstoffproduktion.

Wenn auch ein solcher Energieträger in dieselbe Rollenstruktur passt, ist die
Energie-Pilotstruktur wirklich allgemein und nicht nur eine Schablone für
fossile Brennstoffe.

---

# Entscheidung

**Energie-Pilotstruktur v1: bestanden.**

Erdöl und Kohle können dieselbe Architektur verwenden.

Der einzige neue allgemeine Knotentyp bleibt:

```text
system_flow
```

Alle weiteren Unterschiede werden über konkrete Prozesse, Messrollen und
Graphverbindungen modelliert – nicht über neue Sonderstrukturen.
