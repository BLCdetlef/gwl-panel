# GWL-Panel – Prototyp 0.3

## Was neu ist

- Querformat-Layout für Tablet/großen Touchscreen: **30 / 40 / 30 %**.
- **Region / Ort** sitzt rechts direkt über dem Menschen.
- Räumliche Struktur enthält jetzt zusätzlich **Europa, Deutschland, Afrika, Tansania und Tindigani**. Ebenen ohne Datensatz bleiben sichtbar, erfinden aber keinen Wert.
- **Zeitregler** im mittleren Wirkungsbereich.
- Zeitfenster **BLC 1700–2100** als fester Preset.
- Tatsächlich vorhandene Messzeitpunkte werden markiert; **keine Interpolation** zwischen nicht vorhandenen Jahren.
- `Befund`, `Wirkungspfad` und `Unsicherheit / Einordnung` sind ausklappbar.
- Mensch und Organe wurden als kleines **Inline-SVG** neu gezeichnet. Keine externe Bilddatei nötig.
- Organlogik: **weiß = 0 % Funktionsverlust, schwarz = theoretisch 100 %**. Nur wenn ein Datensatz einen echten 0–100-%-Funktionswert liefert, wird ein entsprechender Grauwert benutzt.
- Lokal belegte Schädigungen ohne quantifizierten Funktionsverlust werden **schraffiert**. So wird z. B. Prävalenz nicht fälschlich als Funktionsverlust interpretiert.
- Erster lokaler Afrika-Wirkungspfad: **Tindigani, Nordtansania – Fluorid im Trinkwasser → Dental-/Skelettfluorose** mit Messpunkten 2009 und 2018.

## Wissenschaftliche Quellen für Tindigani

- Jarvis HG et al. (2013): *Prevalence and aetiology of juvenile skeletal fluorosis in the south-west of the Hai district, Tanzania – a community-based prevalence and case–control study.* Tropical Medicine & International Health 18(2), 222–229. DOI: https://doi.org/10.1111/tmi.12027
- Foat A et al. (2023): *Prevalence of Skeletal Fluorosis in Northern Tanzania: A Follow-Up Study.* Global Health: Science and Practice 11(6):e2200342. DOI: https://doi.org/10.9745/GHSP-D-22-00342
- WHO: Richtwert für Fluorid im Trinkwasser 1,5 mg/L; höhere Konzentrationen erhöhen das Risiko für Dentalfluorose, deutlich höhere Konzentrationen für Skelettfluorose.

## Dateien

- `index.html`
- `style.css`
- `data.js`
- `app.js`
- `README.md`

Zum Aktualisieren des GitHub-Repositories die vier Webdateien ersetzen (`README.md` optional ebenfalls), dann in GitHub Desktop committen und pushen.
