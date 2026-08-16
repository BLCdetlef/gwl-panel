# GWL-Panel – Datenmodell

Stand: Prototyp 0.9

## Leitidee

Daten, Darstellung und Interpretation werden getrennt. Das Panel darf keine Zwischenwerte, Krankheitswahrscheinlichkeiten oder Funktionsverluste erfinden. Jeder angezeigte Zustand bleibt an **Raum, Zeit, Messreihe und Quelle** gebunden.

## Oberstruktur

`window.GWL_DATA` enthält derzeit:

- `version` – Prototyp-Version
- `scopes` – räumliche Ebenen und ihre Hierarchie
- `timePresets` – gemeinsame Zeitfenster, z. B. BLC 1700–2100
- `boundaries` – Planetare Grenzen und ihre Mess-/Analyseebenen

## Planetare Grenze

Ein Eintrag in `boundaries` besitzt mindestens:

- `id`
- `label`
- `enabled`
- optional `summary`
- optional `items[]`

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

`health.impacts[]` verknüpft einen konkreten Umwelt-/Expositionsbefund mit Organen oder Organsystemen. Ein Impact kann enthalten:

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
- `prevalence` ist **nicht** automatisch `functionLoss`. Erkrankungs-/Befundhäufigkeit darf nicht als prozentualer Funktionsverlust dargestellt werden.
- Fehlt ein belegter Gesundheitsbezug vollständig, bleibt der Kuller neutral hell.

## Ursachenebene

`causes` kann an `ground`, `effect` und/oder `life` andocken. Die Ebene bleibt zunächst unsichtbar und wird nur angeboten, wenn Daten für den jeweiligen Kontext vorhanden sind.

## Weiterentwicklung

Neue Felder sollen nur ergänzt werden, wenn sie eine fachliche Aussage tragen. Vor Änderungen an der Datenstruktur wird diese Datei zusammen mit dem Code aktualisiert.
