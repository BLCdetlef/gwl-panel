# Gesundheitsdaten-Import v0.1

Der Import ist bewusst dreistufig:

1. `gbd-environmental-risk-catalog-v0.1.json` begrenzt die zulässigen Umweltrisiken.
2. `health-study-index-v0.1.json` entscheidet, welche Studien technisch eingelesen werden.
3. Die einzelnen Dateien unter `data/health/studies/` enthalten Messwerte, Zeitbezug, Raumbezug, Endpunkte und Quellen.

Beim Laden werden Format, Studien-ID, Freigabeentscheidung, Risikoverweise, Messwerte und Raumebene geprüft. Abgelehnte Dateien bleiben außerhalb der Darstellung und werden in der Browserkonsole begründet.

Jede angenommene Studie erhält beim Import zusätzlich eine interne `panelImport`-Einordnung:

- `displayRole`: `global_reference` oder `spatial_context`,
- `organMarkersEligible`: nur nach geprüfter Organzuordnung,
- `organColorEligible`: zunächst immer `false`,
- `localTransferAllowed`: immer `false`.

## Räumliche Regel

- `global` und `multi_region` bilden den primären Referenzkontext.
- `national_context` und `local_context` dienen nur der Einordnung des gewählten Orts.
- Ein Wert wird niemals von einer übergeordneten Ebene auf einen kleineren Ort übertragen.
- Fehlt eine passende lokale Studie, bleibt die lokale Gesundheitsanzeige neutral.

## Begrenzung

- höchstens drei Studien je Risiko und Raumebene,
- höchstens fünf sichtbare Gesundheitsendpunkte je Studie,
- keine automatische Addition überlappender Krankheitslasten,
- keine Organmarker ohne geprüfte Organzuordnung,
- der reine Import aktiviert weder Organfarbe noch lokale Kausalitätsaussagen.

Die geladene, aber noch nicht dargestellte Registrierung steht für die nächste Ausbaustufe unter `window.GWL_HEALTH_IMPORT` bereit.
