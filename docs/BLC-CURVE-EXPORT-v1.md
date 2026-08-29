# Sicherer Kurvenexport GWL → BLC

Stand: 29. August 2026 · Exportvertrag 1.1

## Sicherheitsmodell

BLC übernimmt keine Kurven aus Local Storage, URL-Parametern oder einer öffentlichen Laufzeit-API. Maßgeblich ist ausschließlich das im GWL-Repository versionierte Freigabemanifest `data/blc/curve-approvals-v1.json`.

Der Generator akzeptiert nur dort ausdrücklich freigegebene Kurven aus bekannten, im Knowledge-Index registrierten Dateien. Testverzeichnisse, unbekannte Quellen, Pfadwechsel aus dem Knowledge-Verzeichnis und doppelte IDs führen zum Abbruch.

Eine reguläre BLC-Kurve benötigt mindestens fünf zeitlich unterschiedliche Beobachtungspunkte über mindestens 50 Jahre. Historische Rekonstruktionen und Projektionen dürfen die Beobachtungsreihe ergänzen, zählen aber nicht zu dieser Mindestdauer. Die physische Richtung der Messgröße bleibt erhalten: Steigende Messwerte werden steigend, sinkende Messwerte sinkend ausgegeben.

Grenzwerte des Planetary-Boundaries-Ansatzes werden als **Modellreferenz nach dem Modell der Planetaren Grenzen** bezeichnet und mit einer konkreten Quelle verbunden. Der Export stellt sie nicht als unumstrittene Naturgrenzen dar. Beobachtungsreihe, Modellreferenz und historische Rekonstruktionen tragen jeweils überprüfbare Quellenverweise.

Das erzeugte Paket `data/blc/blc-curve-export-v1.json` ist rein lesbar und enthält einen SHA-256-Integritätswert. BLC muss Format und Integrität vor dem Import prüfen und bei Abweichungen vollständig abbrechen. Eine Integritätsprüfung ersetzt nicht den Schutz der GitHub-Schreibrechte; sie erkennt jedoch beschädigte oder nachträglich veränderte Übergabepakete.

## Komfortabler Redaktionsablauf

1. GWL lokal über `localhost` öffnen.
2. Geeignete Kurven mit „Für BLC freigeben“ auswählen.
3. `curve-approvals-v1.json` herunterladen und in `data/blc/` übernehmen.
4. Manifest prüfen:

   ```powershell
   node scripts/validate-blc-curve-approvals.mjs
   ```

5. Export neu erzeugen:

   ```powershell
   node scripts/build-blc-curve-export.mjs
   ```

6. Export unabhängig verifizieren:

   ```powershell
   node scripts/verify-blc-curve-export.mjs
   ```

7. Manifest, Export und gegebenenfalls geänderte Quelldaten gemeinsam committen und pushen.

## Übergaberegel

Erst nach erfolgreicher Validierung, Erzeugung, Verifikation und Git-Versionierung gilt ein Export als für die spätere BLC-Übernahme bereit. BLC26 wird durch diesen Prozess noch nicht verändert.
