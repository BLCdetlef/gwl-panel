# GWL-Panel – Prototyp 0.8

GRUNDLAGE · WIRKUNG · LEBEN · URSACHEN

## Neu in Version 0.8

- Grafikordner vereinfacht: nur noch `assets/health/`
- vierte Ebene **URSACHEN** als standardmäßig unsichtbare Ebene vorbereitet
- URSACHEN kann an **GRUNDLAGE**, **WIRKUNG** und **LEBEN** andocken
- pro Bereich erscheint nur dann ein kleiner Button **„Ursachen“**, wenn für die aktuelle Auswahl tatsächlich Inhalte hinterlegt sind
- Klick auf „Ursachen“ öffnet ein kompaktes Overlay direkt im betreffenden Fenster
- Organ-Overlay aus v0.7 bleibt erhalten

## Verzeichnisstruktur

- `assets/health/bodymap_main.png`
- `assets/health/organ_brain.png`
- `assets/health/organ_digestive.png`
- `assets/health/organ_skeleton.png`
- `assets/health/organ_teeth.png`
- `assets/health/organ_repro_female.png`

## Datenlogik Ursachen

Ursachen hängen an einer Messreihe bzw. – wenn sinnvoll – an einem einzelnen Messzeitpunkt.

```js
causes: {
  ground: { title, intro, items: [{label, note, meta}] },
  effect: { title, intro, items: [...] },
  life: { title, intro, items: [...] }
}
```

- `ground` = stärkster Bezug zur Grundlage
- `effect` = vermittelnde Ursachen / Verstärker im Wirkungspfad
- `life` = Ursachenbezug am Gesundheits-/Lebensbezug

## Hinweis

Die vierte Ebene ist absichtlich zurückhaltend gehalten: Das System kann komplexer werden, die Oberfläche soll es nicht.
