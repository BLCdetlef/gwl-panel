# GWL / EAH-Mirror – Knoten- und Ebenenspezifikation v1.2
**Status: DRAFT / Architekturtest**

## Testfrage

Passt **Technologische & soziale Umwelt** in dieselbe Struktur, die bisher mit
Stickstoff, Phosphor und PFAS getestet wurde?

**Ergebnis: Ja – aber nicht ganz ohne Erweiterung.**

Die vorhandene Graphlogik funktioniert. Drei neue Knotentypen machen sie jedoch
deutlich sauberer:

1. `eah_system_boundary`
2. `socio_technical_state`
3. `behavioral_mediator`

---

## 1. Oberste Hierarchie wird verallgemeinert

Die neun Planetaren Grenzen bleiben unverändert:

```text
planetary_boundary
```

Unsere ergänzenden Systemgrenzen erhalten einen eigenen Typ:

```text
eah_system_boundary
```

Beide dürfen im GWL auf derselben Navigationsebene stehen, müssen aber ihre
Framework-Zugehörigkeit speichern.

Beispiel:

```text
Planetary-Boundaries-Framework
└── Süßwasser

EAH-Erweiterung
└── Technologische & soziale Umwelt
```

Damit tun wir nicht so, als sei Digitalisierung eine zehnte Planetare Grenze.

---

## 2. Warum v1.1 hier an eine Grenze stößt

Bisher funktionierte häufig:

```text
menschliche Aktivität
→ Pressure
→ physischer Umweltzustand
→ Exposition
→ biologische Wirkung
→ LEBEN
```

Bei Digitalisierung sieht ein typischer Pfad anders aus:

```text
technische / soziale Umwelt
→ Nutzung / Kontakt
→ VERHALTEN
→ biologische / psychische Wirkung
→ LEBEN
```

**Verhalten ist dabei ein echter Vermittler.**

Eine spätere Schlafenszeit ist beispielsweise weder Umweltzustand noch Krankheit.

---

## 3. Neuer Knotentyp: `socio_technical_state`

Beobachtbarer Zustand der technischen, sozialen oder informationellen Umwelt.

Beispiele:

- permanente digitale Erreichbarkeit
- algorithmisch kuratierte Informationsströme
- hohe Informationsdichte
- Verfügbarkeit interaktiver Bildschirmmedien

Nicht darunter fallen:

- individuelle Bildschirmzeit
- Schlafmangel
- Stress
- Depression

---

## 4. Neuer Knotentyp: `behavioral_mediator`

Verhalten, das zwischen Umwelt/Exposition und Wirkung vermittelt.

Beispiele:

- Smartphonenutzung im Bett
- spätere Schlafenszeit
- sitzende Freizeit
- körperlich aktives Spielen
- wiederholtes Nachrichtenprüfen / Doomscrolling

Wichtig:

> Verhalten ist nicht automatisch schädlich.

Derselbe technische Ausgangspunkt kann gegensätzliche Pfade erzeugen.

---

# Test A – Digitalisierung → Schlaf

```text
TECHNOLOGISCHE & SOZIALE UMWELT
        ↓
Digitalisierung / digitale Medien
        ↓
technische Umwelt
internetfähige Geräte
        ↓
EXPOSITION
abendliche Gerätenutzung
        ↓
VERHALTEN
Nutzung im Bett / spätere Schlafenszeit
        ↓
BIOLOGISCHE / PSYCHISCHE WIRKUNG
verkürzter / gestörter Schlaf
        ↓
LEBEN
Tagesfunktion · Wohlbefinden · Gesundheit
```

Longitudinale Studien bei Jugendlichen stützen Zusammenhänge zwischen bestimmten
Bildschirmverhaltensweisen am Abend und späteren Schlafparametern. Die Ergebnisse
zeigen zugleich, dass **Zeitpunkt und Art der Nutzung** wichtig sind.

**Architekturtest:** bestanden.

---

# Test B – Computerspiele → Bewegung

Hier wird es besonders interessant.

## Pfad 1 – sitzende Nutzung

```text
Computerspiele
→ längere sitzende Spielzeit
→ sitzende Freizeit / mögliche Verdrängung von Bewegung
→ körperliche Aktivität / Fitness
→ LEBEN
```

## Pfad 2 – aktive Spiele

```text
aktive Videospiele / Exergames
→ körperlich aktives Spielen
→ zusätzliche körperliche Aktivität
→ Fitness / motorische Funktion
→ LEBEN
```

### Erkenntnis

Wir dürfen nicht speichern:

```text
Computerspiele = gesundheitsschädlich
```

Sondern:

```text
Computerspiele
├── Nutzungsform A → Pfad A
└── Nutzungsform B → Pfad B
```

**Architekturtest:** bestanden.

---

# Test C – Informationsumwelt / Desinformation

```text
TECHNOLOGISCHE & SOZIALE UMWELT
        ↓
Informationsumwelt
        ↓
SYSTEMZUSTAND
hohe Informationsdichte /
algorithmische Verbreitung
        ↓
EXPOSITION
belastende oder falsche Inhalte
        ↓
VERHALTEN
wiederholtes Prüfen /
Doomscrolling / Weiterverbreitung
        ↓
PSYCHISCHE WIRKUNG
Stress · Unsicherheit · Belastung
        ↓
LEBEN
Wohlbefinden /
gesundheitsrelevante Entscheidungen
```

Hier ist die wichtigste Regel:

> Nicht aus einer beobachteten Assoziation automatisch einen kausalen Pfeil machen.

Bei Informationsumwelt und psychischer Gesundheit sind Kontext, Selbstselektion,
Ausgangsgesundheit und Nutzungsmuster besonders wichtig.

**Architekturtest:** bestanden – mit erhöhter Kausalitätsvorsicht.

---

# 5. Die v1.2-Knotentypen

```text
TOP-HIERARCHIE
├── planetary_boundary
└── eah_system_boundary          NEU

UNTERTEILUNG
└── domain_component

TREIBER
└── human_activity

DRUCK / PROZESS
├── pressure
└── mechanism

ZUSTAND
├── environmental_state
├── environmental_medium
└── socio_technical_state        NEU

KONTAKT
└── exposure

VERMITTLUNG
└── behavioral_mediator          NEU

WIRKUNG
├── biological_effect
└── life_outcome

ORIENTIERUNG
└── action_scope
```

---

# 6. Was bleibt gleich?

Die wichtigste v1.1-Regel bleibt bestehen:

> Der Graph speichert die Komplexität.  
> Die Oberfläche zeigt nur den relevanten Ausschnitt.

Auch Wechselwirkungen funktionieren weiterhin über gemeinsame Knoten.

Beispiel:

```text
Digitalisierung
       ↓
sitzendes Verhalten
       ↓
Bewegungsmangel
       ↓
körperliche Gesundheit
       ↑
       │
Stadtstruktur / Mobilität
```

Zwei völlig verschiedene Ausgangssysteme können also über denselben
Verhaltens- oder Gesundheitsknoten zusammentreffen.

---

# 7. Neue Validierungsregeln

Das System sollte warnen, wenn:

- `Digitalisierung` direkt mit `Depression` verbunden wird, ohne belegte Zwischenknoten;
- Bildschirmzeit pauschal als schädlich codiert wird;
- Computerspiele als ein einziger homogener Expositionstyp behandelt werden;
- psychische Belastung wieder als oberste Ursache statt als Wirkung gespeichert wird;
- Desinformation direkt mit einer Erkrankung verknüpft wird;
- eine Assoziation als Kausalität beschriftet wird;
- Alters- und Entwicklungskontext bei Kindern/Jugendlichen fehlt.

---

# 8. Ergebnis

**Technologische & soziale Umwelt passt in unsere Struktur.**

Aber der Test zeigt, dass unser bisheriger Graph stark auf physische Umweltpfade
zugeschnitten war.

Mit drei Ergänzungen:

```text
eah_system_boundary
socio_technical_state
behavioral_mediator
```

wird daraus ein deutlich allgemeineres Modell:

```text
ERDSYSTEM / TECHNISCHE & SOZIALE UMWELT
               ↓
         Bedingungen
               ↓
           Exposition
               ↓
     Verhalten / Vermittlung
               ↓
   biologische / psychische Wirkung
               ↓
              LEBEN
```

Das ist vermutlich der bisher wichtigste Architekturtest, weil der Graph damit
nicht nur Stoffe und Umweltparameter, sondern auch **technischen und gesellschaftlichen
Wandel** modellieren kann.

---

## Quellen für den Architekturtest

- Chen et al. (2024): longitudinaler Zusammenhang verschiedener Bildschirmaktivitäten mit Schlafqualität und Insomnie.
- Nagata et al. (2024): prospektive Zusammenhänge von Bildschirmverhalten zur Schlafenszeit mit Schlafdauer/-störung bei Jugendlichen.
- Puolitaival et al. (2020): populationsbasierte Untersuchung von Gaming und Gesundheits-/Bewegungsverhalten.
- Braz et al. (2023): Exposition gegenüber COVID-19-Informationsflut und psychischer Belastung; Beobachtungsstudie.

Diese Quellen dienen hier **nur dazu zu testen, ob reale empirische Zusammenhänge in das Schema passen**.
v1.2 ist noch kein vollständiger fachlicher Datensatz zu Digitalisierung.


# 9. Alter und Lebensphase als Kontext

Alter wird **nicht als eigene Ebene im Wissensgraphen** eingeführt.

Das würde sonst dazu führen, dass derselbe Wirkungspfad mehrfach angelegt wird:

```text
Pfad für Kinder
Pfad für Jugendliche
Pfad für Erwachsene
Pfad für ältere Menschen
```

Stattdessen bleibt der Pfad einmal bestehen und erhält dort Alterskontext, wo er
wissenschaftlich relevant ist.

Beispiel:

```text
abendliche Gerätenutzung
        ↓
spätere Schlafenszeit
        ↓
gestörter / verkürzter Schlaf
        ↓
LEBEN
```

Die zugehörige Evidenz kann zusätzlich tragen:

```json
{
  "context": {
    "lifeStage": ["adolescence"],
    "ageRange": {
      "min": 12,
      "max": 17,
      "unit": "years"
    }
  }
}
```

## Vorgesehene Lebensphasen

```text
prenatal
early_childhood
childhood
adolescence
adulthood
older_adulthood
```

Diese Kategorien sind **Orientierungsklassen**, keine Ersatzwerte für die
Altersdefinition einer Studie.

Wenn eine Quelle beispielsweise 11- bis 14-Jährige untersucht, wird genau dieser
Bereich zusätzlich gespeichert.

## Wo Alterskontext hängen darf

- an einer Studie / Evidenz
- an einer Verbindung (`edge`)
- an einer Exposition
- an einer biologischen / psychischen Wirkung
- an einem LEBEN-Ergebnis

Nicht sinnvoll ist eine pauschale Zuordnung wie:

```text
PFAS = Kinder
Digitalisierung = Jugendliche
Hitze = ältere Menschen
```

Stattdessen wird gespeichert, **welcher konkrete Wirkungspfad** in einer bestimmten
Lebensphase besonders relevant, empfindlich oder gut untersucht ist.

## Darstellung in der Oberfläche

Alter bleibt standardmäßig im Hintergrund.

Nur wenn es für die Aussage wichtig ist, erscheint ein kleiner Hinweis, zum Beispiel:

```text
Besonders relevant: Jugendalter
```

oder:

```text
Evidenz basiert überwiegend auf 12–17-Jährigen.
```

oder:

```text
Empfindliche Lebensphase: Schwangerschaft
```

Damit bleibt das Datenmodell differenziert, ohne für jede Altersgruppe einen
eigenen Graphen zu erzeugen.

## Neue Validierungsregel

> Alter ist Kontext, nicht Ursache.

Das System soll warnen, wenn ein Thema pauschal einer Altersgruppe zugeordnet wird,
ohne dass Quelle, Mechanismus oder Expositionskontext diese Zuordnung stützen.
