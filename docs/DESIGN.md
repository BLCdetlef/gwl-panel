# GWL-Panel – Designregeln

Stand: Prototyp 0.9

## Grundprinzip

Das Panel besteht aus drei sichtbaren Perspektiven: **GRUNDLAGE – WIRKUNG – LEBEN**. Eine vierte Ebene **Ursachen** kann kontextbezogen eingeblendet werden, soll die drei Hauptfelder aber nicht dauerhaft überladen.

## LEBEN / Bodymap

- Die medizinische Körperdarstellung bleibt farbig und dient der anatomischen Orientierung.
- Organe und Organsysteme werden über nahe am Körper liegende **Kuller** ausgewählt.
- Die Kuller dürfen sich leicht überlagern, maximal etwa 50 %.
- Beschriftungen stehen klein und ohne Führungslinien direkt am jeweiligen Kuller.
- Die Kuller sind die Träger der Zustandsinformation: **hell = geringe/keine quantifizierte Beeinträchtigung; zunehmend dunkel = stärkere quantifizierte Beeinträchtigung**.
- Schwarz ist kein Standardzustand, sondern nur die dunkelste Stufe einer tatsächlich belegten quantifizierten Skala.
- Ist ein gesundheitlicher Befund belegt, aber kein belastbarer 0–100-%-Funktionswert verfügbar, wird der Kuller **schraffiert**. Es wird kein Grauwert erfunden.
- Unter der Bodymap steht dauerhaft eine kompakte Graustufen-/Schraffur-Legende.
- Ziel der Darstellung ist ein intuitiver Ersteindruck: Auffällige Organe sollen ohne vorheriges Lesen erkennbar sein.

## Organfenster

- Ein Organfenster öffnet als eigenes kleines Overlay **über dem LEBEN-Feld**, nicht als separates Fenster auf einem anderen Bildschirm.
- Das Fenster darf auf großen Bildschirmen nicht zu klein sein; Zielbreite derzeit bis etwa 640 px.
- Die medizinischen Detailgrafiken dürfen funktionale Unterteilungen zeigen. Die Verdauungssystem-Darstellung gilt dafür als Referenz.
- Feste Beschriftungen innerhalb besonders komplexer Systemgrafiken sind künftig zulässig, wenn sie die funktionale Gliederung verständlicher machen.

## Mobil / Zoom

- Auf Smartphones muss die Schrift gemeinsam mit der Oberfläche gut lesbar skalieren.
- Kleine Bildschirmbreiten dürfen nicht automatisch zu immer kleinerer Beschriftung führen.
- Kuller bleiben auch mobil ausreichend groß für Touch-Bedienung.

## Bildablage

Gesundheitsgrafiken liegen unter `assets/health/`. Dateinamen sollen beschreibend und stabil bleiben, z. B. `bodymap_main.png` oder `organ_digestive.png`.
