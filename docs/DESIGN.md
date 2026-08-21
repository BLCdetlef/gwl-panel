# GWL-Panel – Designregeln

Stand: Prototyp 0.9.2

## Grundprinzip

Das Panel besteht aus drei sichtbaren Perspektiven: **GRUNDLAGE – WIRKUNG – LEBEN**. Eine vierte Ebene **Ursachen** kann kontextbezogen eingeblendet werden, soll die drei Hauptfelder aber nicht dauerhaft überladen.

## LEBEN / Bodymap

- Die medizinische Körperdarstellung bleibt farbig und dient der anatomischen Orientierung.
- Organe und Organsysteme werden über nahe am Körper liegende **Marker** ausgewählt.
- Die Marker dürfen sich leicht überlagern, maximal etwa 50 %.
- Beschriftungen stehen klein und ohne Führungslinien direkt am jeweiligen Marker.
- Die Marker sind die Träger der Zustandsinformation: **hell = geringe/keine quantifizierte Beeinträchtigung; zunehmend dunkel = stärkere quantifizierte Beeinträchtigung**.
- Schwarz ist kein Standardzustand, sondern nur die dunkelste Stufe einer tatsächlich belegten quantifizierten Skala.
- Ist ein gesundheitlicher Befund belegt, aber kein belastbarer 0–100-%-Funktionswert verfügbar, wird der Marker **schraffiert**. Es wird kein Grauwert erfunden.
- Unter der Bodymap steht dauerhaft eine kompakte Graustufen-/Schraffur-Legende.
- Ziel der Darstellung ist ein intuitiver Ersteindruck: Auffällige Organe sollen ohne vorheriges Lesen erkennbar sein.

## Organfenster

- Ein Organfenster öffnet als eigenes Overlay **über dem LEBEN-Feld**.
- Das Fenster darf auf großen Bildschirmen nicht zu klein sein; Zielbreite derzeit bis etwa 640 px.
- Das Organ-/Systembild ist eine **medizinische, farbige Übersicht mit statischen anatomischen Beschriftungen direkt im Bild**.
- Zusätzliche Listen „Funktionale Teilbereiche“ werden vorerst **nicht** unter dem Bild angezeigt. Für Laien wären sie ohne weiteren Kontext eher Zusatzlast als Hilfe.
- Unter dem Bild steht nur **BEFUND**. Dieser Text ist identisch mit dem aktuell im Feld **WIRKUNG** angezeigten Befund.
- Darunter steht **EINORDNUNG** standardmäßig eingeklappt. Sie verweist auf das Feld WIRKUNG; die fachliche Einordnung wird nicht doppelt ausformuliert.
- Graustufen des Gesundheitszustands gehören ausschließlich in die Marker der Bodymap, nicht in das Organbild.

## Bildablage und Dateinamen

Gesundheitsgrafiken liegen unter `assets/health/`.

- Bodymap: `bodymap_main.png`
- Organ-/Systembilder: `organ_<englischer-kurzname>.jpg`
- Zielgröße der Organbilder: **maximal 500 kB je Datei**.
- Medizinische Bilddateien enthalten keine dynamischen Befund-, Wirkungs- oder Zustandsangaben.

### Aktuelle Zuordnung Bodymap → Bilddatei

- Gehirn & Nerven → `organ_brain.jpg`
- Augen → `organ_senses.jpg`
- Zähne → derzeit neutrale interne Ersatzgrafik; in der aktuellen Bildserie fehlt noch ein eigenes Zahnmotiv
- Lunge → `organ_respiratory.jpg`
- Herz & Kreislauf → `organ_circulatory.jpg`
- Leber → `organ_digestive.jpg`
- Nieren → `organ_urinary.jpg`
- Verdauung → `organ_digestive.jpg`
- Harnwege → `organ_urinary.jpg`
- weibliche Geschlechtsorgane → `organ_repro_female.jpg`
- männliche Geschlechtsorgane → `organ_repro_male.jpg`
- Skelett → `organ_skeleton.jpg`
- Bewegungsapparat → `organ_skeleton.jpg`

Weitere bereits vorhandene Systembilder (`organ_endocrine.jpg`, `organ_immune.jpg`, `organ_skin.jpg`, `organ_blood_lymph.jpg`, `organ_connective.jpg`) bleiben für spätere Marker-/Systemerweiterungen verfügbar.

## Mobil / Zoom

- Auf Smartphones muss die Schrift gemeinsam mit der Oberfläche gut lesbar skalieren.
- Kleine Bildschirmbreiten dürfen nicht automatisch zu immer kleinerer Beschriftung führen.
- Marker bleiben auch mobil ausreichend groß für Touch-Bedienung.


## Bodymap – Organmarker (ab v0.9.3)

- Position, Beschriftung und Bildzuordnung der Organmarker stehen zentral in `bodymap.json`.
- Marker sollen anatomisch möglichst nah an der zugehörigen Struktur liegen.
- Beschriftungen werden abwechselnd links/rechts angeordnet, um Überlagerungen und eine senkrechte Marker-Kette zu vermeiden.
- Sinnesorgane werden getrennt dargestellt: Auge, Ohr, Nase, Zunge.
- `Zähne` heißt in der Benutzeroberfläche `Gebiss`; technische Organ-ID bleibt `teeth`.
- `Skelett` und `Bewegungsapparat` sind getrennte Systeme:
  - Skelett → `organ_skeleton.jpg`
  - Bewegungsapparat → `organ_musculoskeletal.jpg`
