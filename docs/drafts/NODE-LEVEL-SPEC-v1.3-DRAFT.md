# GWL / EAH-Mirror – Knoten- und Ebenenspezifikation v1.3
**Status: DRAFT / Architekturtest**

## Testfrage

Passt **Stoff- und Energieströme** in unsere v1.2-Struktur, ohne sich mit den
Planetaren Grenzen zu überschneiden?

**Ergebnis: Ja.** Der Test braucht nur eine kleine, aber wichtige Erweiterung:

```text
system_flow
```

Damit können wir reale Stoff- und Energiedurchsätze messen, ohne daraus künstlich
eine Planetare Grenze zu machen.

---

# 1. Grundregel

```text
ERGÄNZENDE SYSTEMGRENZE
Stoff- und Energieströme
        ↓
menschlicher Durchsatz / Treiber
        ↓
Prozesse / Emissionen / Umweltveränderungen
        ↓
Verbindung zu einer oder mehreren PG
        ↓
Erdsystemzustand
        ↓
Exposition / Wirkung
        ↓
LEBEN
```

Die Trennung lautet:

> **Stoff- und Energieströme beschreibt, was Menschen materiell und energetisch
> durch ihre Systeme bewegen. Planetare Grenzen beschreiben, was dadurch im
> Erdsystem verändert wird und wo dessen Belastbarkeit liegt.**

Damit sind beide Ebenen komplementär und nicht konkurrierend.

---

# 2. Neuer Knotentyp `system_flow`

Ein `system_flow` ist ein quantifizierbarer Stoff- oder Energiestrom.

Beispiele:

- globale Erdölproduktion
- globaler Primärenergieverbrauch
- Materialextraktion
- Kunststoffproduktion

Eine Einheit wie `Barrel/Tag` ist dabei **kein Grenzwert**.

Sie ist ein Messwert am Flow-Knoten.

```json
{
  "id": "global_oil_production",
  "type": "system_flow",
  "label": "Globale Ölproduktion",
  "measurement": {
    "value": null,
    "unit": "barrel/day",
    "scope": "global",
    "time": null,
    "source": null
  }
}
```

Der Zahlenwert bleibt im Architekturtest absichtlich leer. v1.3 legt zunächst
fest, **wo** ein später verifizierter Datensatz hingehört.

---

# 3. Pilot: globale Ölproduktion

```text
Stoff- und Energieströme
        ↓
Energie
        ↓
Erdöl
        ↓
SYSTEM FLOW
Globale Ölproduktion
[Mio. Barrel/Tag]
```

Von hier verzweigt der Graph.

## Klimapfad

```text
Globale Ölproduktion
→ Raffination / Bereitstellung
→ Verbrennung
→ CO₂-Emissionen
→ PG Klimawandel
```

Wichtig:

```text
Globale Ölproduktion ≠ CO₂-Emissionen
```

Ein Produktionswert in Barrel/Tag darf niemals ohne belastbare Umrechnung als
Emissionswert behandelt werden.

---

## Förderpfad

```text
Erdölförderung
→ Flächen- / Wasserbeanspruchung
├→ PG Süßwasser
└→ PG Landnutzungsänderung
```

Die konkreten Kanten benötigen jeweils eigene Evidenz. Die Architektur erlaubt
sie, behauptet mit diesem Test aber noch keine globale Wirkungsgröße.

---

## Petrochemischer Pfad

```text
Erdöl
→ Raffination
→ petrochemische Nutzung
→ chemische / materielle Stoffströme
→ PG Neue Substanzen
```

Auch hier gilt: Nicht `Erdöl → Neue Substanzen` als verkürzte Behauptung speichern,
sondern den tatsächlichen Prozessweg erhalten.

---

# 4. Warum es keine Doppelung mit Klimawandel gibt

**Erdöl wird nur einmal gespeichert.**

Unter `Stoff- und Energieströme` liegt der Ursprungs- und Durchsatzknoten.

`Klimawandel` erhält eine eingehende Verbindung:

```text
Stoff- und Energieströme
└─ Erdöl
   └─ Verbrennung
      └─ CO₂
         ───────────────→ PG Klimawandel
```

Wenn der Nutzer dagegen bei `Klimawandel` startet, kann die Oberfläche denselben
Graphen rückwärts lesen:

```text
PG Klimawandel
↑
CO₂
↑
Verbrennung fossiler Energieträger
↑
Treiber: Stoff- und Energieströme
```

**Kein zweiter Erdölknoten nötig.**

---

# 5. Mehrfachverbindungen sind ausdrücklich erwünscht

Ein Stoffstrom kann mehrere Systeme beeinflussen:

```text
Erdöl
├→ Verbrennung → CO₂ → Klimawandel
├→ Förderung → Wasser → Süßwasser
├→ Förderung → Fläche → Landnutzungsänderung
└→ Petrochemie → Stoffströme → Neue Substanzen
```

Genau dafür bauen wir einen Wissensgraphen.

---

# 6. Messwert, Referenzwert und Grenzwert

Diese drei Rollen dürfen nicht vermischt werden.

```text
MESSWERT
globale Ölproduktion
x Mio. Barrel/Tag

REFERENZWERT
z. B. Vergleichsjahr / Szenario / politisches Ziel
(nur wenn fachlich passend)

GRENZWERT
nur wenn für genau diese Größe ein wissenschaftlich oder regulatorisch
definierter Grenzwert existiert
```

Für Ölproduktion selbst wird in v1.3 **kein planetarer Grenzwert erfunden**.

---

# 7. Neue Validierungsregeln

Das System soll warnen, wenn:

- Ölproduktion als Planetare Grenze bezeichnet wird;
- Erdöl unter mehreren PGs dupliziert wird;
- Barrel/Tag direkt als CO₂-Emission interpretiert wird;
- Förderung, Raffination und Verbrennung zu einem einzigen Prozessknoten verschmelzen;
- Messwert, Referenzwert und Grenzwert verwechselt werden;
- ein PG-Link den wissenschaftlich relevanten Zwischenmechanismus überspringt;
- aus einer möglichen Verbindung bereits eine quantifizierte globale Wirkung abgeleitet wird.

---

# 8. Ergebnis des Architekturtests

```text
v1.1
physische Umweltpfade

        +

v1.2
technische / soziale Umwelt
+ Verhalten
+ Alterskontext

        +

v1.3
materielle / energetische Durchsätze
+ system_flow
+ PG-übergreifende Treiber
```

**Stoff- und Energieströme passt.**

Die zusätzliche Ebene konkurriert nicht mit den Planetaren Grenzen, sondern macht
sichtbar, **welche menschlichen Stoff- und Energieströme mehrere planetare
Belastungen gleichzeitig antreiben können.**

Das Beispiel globale Ölproduktion zeigt außerdem, dass ein realer Messwert wie
`Barrel pro Tag` sauber in das Modell passt, ohne ihn zu einem Grenzwert
umzudeuten.
