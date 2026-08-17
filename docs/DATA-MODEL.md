# GWL-Panel – Datenmodell

Stand: Prototyp 0.9.2

## Leitidee

Daten, Darstellung und Interpretation werden getrennt. Das Panel darf keine Zwischenwerte, Krankheitswahrscheinlichkeiten oder Funktionsverluste erfinden. Jeder angezeigte Zustand bleibt an **Raum, Zeit, Messreihe und Quelle** gebunden.

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

## Gesundheitsbezug

`health.impacts[]` verknüpft einen konkreten Umwelt-/Expositionsbefund mit Organen oder Organsystemen. Beispiel:

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

- `functionLoss` ist eine Zahl von `0` bis `100` **nur wenn eine belastbare fachliche Grundlage genau diese Skala trägt**. Daraus darf der Kuller als Graustufe berechnet werden.
- `functionLoss: null` bedeutet: Ein gesundheitlicher Befund kann belegt sein, aber eine einheitliche 0–100-%-Funktionsminderung ist nicht belegt. Der Kuller wird dann schraffiert.
- `prevalence` ist **nicht** automatisch `functionLoss`.
- Fehlt ein belegter Gesundheitsbezug vollständig, bleibt der Kuller neutral hell.

## Bodymap-IDs und medizinische Bilder

Die Bodymap arbeitet mit stabilen Organ-/System-IDs. `ORGAN_MEDIA` in `app.js` ordnet diesen IDs eine statische medizinische Bilddatei zu. Mehrere Kuller dürfen dasselbe Systembild verwenden, wenn es fachlich dieselbe Systemübersicht darstellt, z. B. `liver` und `gut` → `organ_digestive.jpg`.

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

Die beiden Geschlechtsorgane bleiben zwei getrennte Bodymap-Kuller und zwei getrennte Bilddateien.

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
- `x`, `y`: Position des Kullers in Prozent der Bodymap
- `side`: Seite der Beschriftung (`left` oder `right`)
- `image`: Bilddatei des Organfensters
- `layout`: Darstellungsmodus des Organbildes

Die vier Sinnesorgane verwenden die IDs `eye`, `ear`, `nose`, `tongue`.
Die ID `teeth` bleibt aus Kompatibilitätsgründen bestehen, die sichtbare Bezeichnung lautet `Gebiss`.
