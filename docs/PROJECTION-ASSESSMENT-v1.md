# Projektionen und harmonisierte Bewertung v1

Stand: 20. August 2026

## Bewertungsregel

Für Projektionen wird grundsätzlich nur **ein fachlich bevorzugter Zukunftspfad** angezeigt. Liegen keine belastbaren präzisierenden Faktoren oder passenden Fachszenarien vor, wird der **jüngere beobachtete Trend** der methodisch konsistenten Zeitreihe fortgeschrieben. Das verwendete Trendfenster und die jährliche Änderungsrate werden im Datensatz benannt. Mehrere rein rechnerische Alternativpfade werden nicht parallel dargestellt.

Liegen veröffentlichte Fachszenarien oder belastbare Einflussfaktoren vor, die zur räumlichen Ebene sowie zur Kontroll- oder Messgröße passen, haben diese Vorrang vor der einfachen Trendfortschreibung. Beobachtung und Projektion bleiben in allen Fällen getrennte Ansichten.

- **Tragfähig:** gleiche Geografie, Messgröße und Einheit; verbleibende Quellen- oder Modellunterschiede werden sichtbar benannt.
- **Bedingt tragfähig:** fachlich relevante Szenarien, aber keine vollständig identische Messgröße. Keine direkte Änderungsrate zur Beobachtungsreihe.
- **Trendfortschreibung:** keine geeigneten präzisierenden Faktoren vorhanden; Fortschreibung des jüngeren, konsistent beobachteten Trends als einzelner Projektionspfad.
- **Nicht aufnehmen:** Der Indikator ist fachlich nicht sinnvoll fortschreibbar oder die jüngere Reihe ist dafür zu kurz, strukturell gebrochen oder methodisch inkonsistent.

## Ergebnis der Bestandsprüfung

| Messreihe | Bewertung | Entscheidung |
|---|---|---|
| Globale Energieversorgung aus Öl, Kohle, Erdgas, Wind und Solar | tragfähig, quellenübergreifend | WEO 2025 CPS, STEPS und NZE für 2035, 2040 und 2050; getrennt von der historischen Energiereihe |
| Globales atmosphärisches CO₂ | tragfähig, szenarioabhängig | IPCC-AR6-Pfade SSP1-1.9 bis SSP5-8.5 für publizierte Dekaden 2030–2090 |
| Globale Kunststoffproduktion | bedingt tragfähig, nur separat | OECD-Kunststoffnutzung 2060 für Baseline, Regional Action und Global Ambition; Produktion und Nutzung werden nicht gleichgesetzt |
| Funktionelle Biosphärenintegrität / HANPP | nicht aufnehmen | Keine im Datensatz belegte, methodisch identische globale Zukunftsreihe |
| Blaues und grünes Wasser | nicht aufnehmen | Modellierte historische Zustandsreihe; keine passende Zukunftsreihe in der verwendeten Quelle hinterlegt |
| Globaler Waldzustand | nicht aufnehmen | Vorhandene Zukunftsstudien betreffen andere Räume oder Modellgrößen; keine direkte Fortsetzung der Kontrollvariable |
| Globaler Stickstoff- und Phosphorfluss | nicht aufnehmen | Szenarien wären ohne konsistente Stoffbilanz, Systemgrenze und Quelle nicht harmonisierbar |

## Darstellungsregeln

### BLC-Freigabe für vollständige Kurven

Die BLC-Freigabe besteht aus zwei getrennten Stufen. Zuerst wird geprüft, ob eine Kurve fachlich freigabefähig ist. Danach ist eine ausdrückliche redaktionelle Freigabe am Schalter der jeweiligen Kurve erforderlich. Eine fachlich geeignete Kurve wird niemals automatisch für BLC freigegeben.

Fachliche Mindestvoraussetzung ist eine numerische Beobachtungsreihe mit mindestens fünf zeitlich unterschiedlichen direkten Messpunkten. Die Mindestzeitabdeckung von 50 Jahren darf gemeinsam durch historische Rekonstruktion und direkte Beobachtung erreicht werden; Projektionen zählen nicht mit. Historische Rekonstruktionen dürfen die direkten Beobachtungspunkte nicht ersetzen.

- Die Beobachtungsreihe wird als durchgezogene Hauptreihe dargestellt.
- Eine historische Rekonstruktion darf als methodisch getrennt gekennzeichneter Abschnitt vorangestellt werden.
- Eine fachlich qualifizierte Projektion darf als Szenarioabschnitt ergänzt werden.
- Rekonstruktionen oder Projektionen ohne Beobachtungsreihe ergeben keine BLC-Freigabe für eine vollständige Kurve.
- Ein einzelner Zustands- oder Messwert bleibt eine Punktangabe und wird nicht zur Zeitreihe erklärt.
- Der Schalter „Für BLC freigeben“ ist standardmäßig aus und bei nicht freigabefähigen Kurven deaktiviert.
- Vor einer neuen Freigabe muss redaktionell „Kernkurve“ (`core`) oder „Vertiefende Studie“ (`deep_dive`) gewählt werden; ohne gültige Rolle bleibt der Schalter deaktiviert.
- Der Schalter ist ausschließlich auf `localhost` bedienbar. Öffentliche Ansichten zeigen nur den versionierten Freigabestatus.
- Lokale Änderungen sind zunächst ein flüchtiger Redaktionsentwurf. Sie ändern weder die öffentliche Ansicht noch BLC.
- Der Redaktionsmodus exportiert eine neue `curve-approvals-v1.json` einschließlich der gewählten Rollen. Geladene Rollen bleiben bei einem erneuten Download erhalten. Erst Prüfung, Commit und Push machen die Entscheidung verbindlich.
- Das Manifest wird vor der Übernahme gegen bekannte Quellen, Kurven-IDs und die verpflichtende Beobachtungsreihe validiert.
- Nur fachlich freigabefähige und zusätzlich versioniert freigegebene Kurven dürfen später an BLC übergeben werden.

1. Szenarien sind keine Prognosen mit Eintrittswahrscheinlichkeit und keine Messwerte.
2. Szenariopfad, Quelle, Modellcharakter und Vergleichbarkeit müssen sichtbar bleiben.
3. Es gibt keine Interpolation zwischen Stützjahren.
4. Ein Grenzwertvergleich ist nur zulässig, wenn die projizierte Messgröße dieselbe Kontrollvariable und Einheit verwendet.
5. Unterschiedliche Einheiten werden nicht künstlich vereinheitlicht; harmonisiert wird die semantische Rolle.
6. Eine rechnerische Trendfortschreibung wird als solche bezeichnet; sichtbar bleiben mindestens Beobachtungsfenster, Änderungsrate und Basisjahr.
7. Ohne fachlich begründete präzisierende Faktoren wird ausschließlich der jüngere Trendpfad gezeigt, kein zusätzlicher Hoch-/Niedrig-Korridor.

## Primärquellen

- IEA, *World Energy Outlook 2025 Free Dataset*, Annex A.
- IPCC AR6 WGI, Annex III, Tabelle AIII.2.
- OECD, *Global Plastics Outlook: Policy Scenarios to 2060*.
