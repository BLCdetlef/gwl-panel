# Sicherer Kurvenexport GWL → BLC

Stand: 4. September 2026 · Freigabevertrag 1.1 · Exportvertrag 1.5

## Sicherheitsmodell

BLC übernimmt keine Kurven aus Local Storage, URL-Parametern oder einer öffentlichen Laufzeit-API. Maßgeblich ist ausschließlich das im GWL-Repository versionierte Freigabemanifest `data/blc/curve-approvals-v1.json`.

Der Generator akzeptiert nur dort ausdrücklich freigegebene Kurven aus bekannten, im Knowledge-Index registrierten Dateien. Testverzeichnisse, unbekannte Quellen, Pfadwechsel aus dem Knowledge-Verzeichnis und doppelte IDs führen zum Abbruch.

### Elf fachliche Kategorien

Exportversion 1.2 ergänzt jede Kurve additiv um `domainType`, `domainId` und `domainLabel`. Diese Angaben werden nicht in Knowledge-Dateien oder im Freigabemanifest gepflegt, sondern ausschließlich aus der eindeutigen Position der Kurvenquelle in `knowledge-index.json` abgeleitet.

Exportversion 1.4 ergänzt ausschließlich für die vorhandene HANPP-Modellreferenz die Felder `role`, `qualifier` und `exceedanceOperator`. Der Pilot speichert keinen berechneten Status und führt kein allgemeines Grenzwertmodell ein. Bei `value: 10` und `exceedanceOperator: ">"` gilt für einen späteren Verbraucher: letzter gültiger Beobachtungswert unter 10 = nicht überschritten, gleich 10 = Modellgrenze erreicht, über 10 = Modellgrenze überschritten. Für die aktuelle Statusbestimmung darf ausschließlich der letzte gültige Punkt der Beobachtungsreihe verwendet werden; historische Rekonstruktionen und Zukunftsszenarien sind davon ausdrücklich ausgeschlossen.

Exportversion 1.5 ändert ausschließlich die Eignungsregel für die Zeitabdeckung: Mindestens fünf direkte Beobachtungspunkte bleiben verpflichtend, während die geforderten 50 Jahre gemeinsam aus historischer Rekonstruktion und anschließender Beobachtungsreihe erreicht werden dürfen. `observationCoverage` beschreibt weiterhin nur die direkte Messreihe.

Für `planetary_boundaries` bestimmt die jeweilige Gruppe die Kategorie. Für die beiden ergänzenden Einflussbereiche bestimmt dagegen der gesamte Einflussbereich die Kategorie; interne Gruppen wie Energie oder Luftverschmutzung werden nicht als eigene BLC-Kategorien exportiert.

Die elf stabilen Kategorie-IDs sind:

- `climate_change`
- `biosphere_integrity`
- `freshwater_change`
- `land_system_change`
- `nutrient_cycles`
- `ocean_acidification`
- `atmospheric_aerosol_loading`
- `stratospheric_ozone_depletion`
- `novel_entities`
- `eah_material_energy_flows`
- `eah_tech_social_environment`

Nicht registrierte Quellen sowie mehrfache oder widersprüchliche Registrierungen führen zum vollständigen Abbruch. Eine manuelle Kategorie im Freigabemanifest ist nicht zulässig.

#### Befristete Blau-/Grünwasser-Kompatibilitätsregel

Die bereits im GWL-Panel über einen eigenen Lade- und Navigationspfad verwendete Quelle `data/knowledge/gwl_freshwater_blue_green_timeseries_v0.2.json` ist vorübergehend die einzige Ausnahme von der erforderlichen Quellenregistrierung. Der Export bindet ausschließlich diesen exakten Pfad an die vorhandene Indexgruppe `planetary_boundaries/freshwater_change`; Typ, ID und sichtbare Bezeichnung werden aus dieser Indexgruppe gelesen. Die Freigabe bleibt weiterhin zeitserienspezifisch: Eine freigegebene Blauwasser-Reihe gibt die Grünwasser-Reihe derselben Datei nicht mit frei.

Die Ausnahme ist abzulösen, sobald der Knowledge-Import Dateien nach URL dedupliziert und mehrere Zeitreihen derselben Knowledge-Datei im Index eindeutig adressiert werden können. Jede andere nicht registrierte Quelle bleibt gesperrt; doppelte oder widersprüchliche reguläre Registrierungen bleiben Fehler.

### Redaktionelle Kurvenrolle

Freigabeversion 1.1 verlangt für jede freigegebene Zeitreihe genau eine ausdrücklich redaktionell gewählte `curveRole`:

- `core`: zentrale Kurve einer Planetaren Grenze oder eines ergänzenden Einflussbereichs
- `deep_dive`: vertiefende Studie oder ergänzende Messreihe

Die Rolle wird weder aus Kategorie, Beschriftung, Dateiname noch Kurvenwerten abgeleitet. Eine fehlende oder unbekannte Rolle sperrt Manifest und Export. Exportversion 1.3 übernimmt die Rolle unverändert pro Kurve; sie ist unabhängig von `domainType`, `domainId` und `domainLabel` und dient BLC26 später ausschließlich zur visuellen Gewichtung.

Eine reguläre BLC-Kurve benötigt mindestens fünf zeitlich unterschiedliche direkte Beobachtungspunkte. Die Zeitabdeckung von mindestens 50 Jahren darf sich aus der historischen Rekonstruktion und der anschließenden direkten Beobachtungsreihe zusammensetzen; Projektionen zählen nicht mit. Eine Rekonstruktion ersetzt niemals die verpflichtende Beobachtungsreihe. Die physische Richtung der Messgröße bleibt erhalten: Steigende Messwerte werden steigend, sinkende Messwerte sinkend ausgegeben.

Grenzwerte des Planetary-Boundaries-Ansatzes werden als **Modellreferenz nach dem Modell der Planetaren Grenzen** bezeichnet und mit einer konkreten Quelle verbunden. Der Export stellt sie nicht als unumstrittene Naturgrenzen dar. Beobachtungsreihe, Modellreferenz und historische Rekonstruktionen tragen jeweils überprüfbare Quellenverweise.

Das erzeugte Paket `data/blc/blc-curve-export-v1.json` ist rein lesbar und enthält einen SHA-256-Integritätswert. BLC muss Format und Integrität vor dem Import prüfen und bei Abweichungen vollständig abbrechen. Eine Integritätsprüfung ersetzt nicht den Schutz der GitHub-Schreibrechte; sie erkennt jedoch beschädigte oder nachträglich veränderte Übergabepakete.

## Komfortabler Redaktionsablauf

1. GWL lokal über `localhost` öffnen.
2. Für jede geeignete Kurve ausdrücklich „Kernkurve“ oder „Vertiefende Studie“ auswählen.
3. Die Kurve mit „Für BLC freigeben“ auswählen.
4. `curve-approvals-v1.json` herunterladen und in `data/blc/` übernehmen.
5. Manifest prüfen:

   ```powershell
   node scripts/validate-blc-curve-approvals.mjs
   ```

6. Export neu erzeugen:

   ```powershell
   node scripts/build-blc-curve-export.mjs
   ```

7. Export unabhängig verifizieren:

   ```powershell
   node scripts/verify-blc-curve-export.mjs
   ```

8. Manifest, Export und gegebenenfalls geänderte Quelldaten gemeinsam committen und pushen.

## Übergaberegel

Erst nach erfolgreicher Validierung, Erzeugung, Verifikation und Git-Versionierung gilt ein Export als für die spätere BLC-Übernahme bereit. BLC26 wird durch diesen Prozess noch nicht verändert.
