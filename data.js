window.GWL_DATA = {
  version: "0.2",
  scopes: {
    global: "Global",
    sh: "Schleswig-Holstein",
    luebeck: "Lübeck"
  },
  boundaries: [
    { id: "climate", label: "Klimawandel", enabled: false },
    { id: "biosphere", label: "Biosphärenintegrität", enabled: false },
    { id: "land", label: "Landnutzung", enabled: false },
    {
      id: "freshwater",
      label: "Süßwasser",
      enabled: true,
      summary: "Die globale planetare Grenze und regionale Messreihen werden nicht vermischt: Global wird die Veränderung des Wasserkreislaufs bewertet; regional und lokal werden konkrete Messreihen dazu gestellt.",
      items: [
        {
          id: "blue-water-global",
          scope: "global",
          label: "Blaues Wasser · Abfluss",
          type: "Planetare Grenze",
          value: "18,2 %",
          reference: "Grenze: 10,2 %",
          period: "1996–2005 (10-Jahres-Mittel)",
          sourceLabel: "Porkka et al., Nature Water (2024)",
          sourceUrl: "https://doi.org/10.1038/s44221-024-00208-7",
          summary: "Anteil der globalen eisfreien Landfläche, auf der lokale Abflüsse außerhalb der präindustriellen Variabilität liegen.",
          finding: "Der ausgewiesene Zustand liegt deutlich über dem oberen Ende der präindustriellen Variabilität. Die planetare Grenze für blaues Wasser ist damit überschritten.",
          effect: "Veränderte Abflussmuster → häufiger ungewöhnlich trockene oder nasse Bedingungen → Veränderungen von Wasserverfügbarkeit, Gewässerökosystemen und Extremrisiken.",
          uncertainty: "Modellbasierte Ensemble-Auswertung. Die Grenze beschreibt eine Abweichung von bekannten präindustriellen Bedingungen und ist kein globaler Kipppunkt. Der als aktueller Status verwendete Studienwert bezieht sich auf 1996–2005, nicht auf das Kalenderjahr 2026.",
          lifeNote: "Aus der Überschreitung der globalen Süßwassergrenze folgt keine direkte Organwirkung. Für Aussagen zur menschlichen Gesundheit braucht es zusätzlich einen konkreten lokalen Expositionspfad, z. B. Hitze, Wassermangel oder Wasserqualität."
        },
        {
          id: "green-water-global",
          scope: "global",
          label: "Grünes Wasser · Bodenfeuchte",
          type: "Planetare Grenze",
          value: "15,8 %",
          reference: "Grenze: 11,1 %",
          period: "1996–2005 (10-Jahres-Mittel)",
          sourceLabel: "Porkka et al., Nature Water (2024)",
          sourceUrl: "https://doi.org/10.1038/s44221-024-00208-7",
          summary: "Anteil der globalen eisfreien Landfläche, auf der die Bodenfeuchte im Wurzelraum außerhalb der präindustriellen Variabilität liegt.",
          finding: "Auch die grüne Komponente liegt über dem oberen Ende der präindustriellen Variabilität. Die planetare Grenze für grünes Wasser ist überschritten.",
          effect: "Veränderte Bodenfeuchte → veränderte Verdunstung und Pflanzenwasserverfügbarkeit → Rückwirkungen auf Ökosysteme, Kohlenstoffhaushalt, Landwirtschaft und regionalen Wasserkreislauf.",
          uncertainty: "Die globale Kennzahl entsteht aus räumlich aufgelösten Modellrechnungen. Trocken- und Nassabweichungen werden als Abweichung ja/nein erfasst; die Stärke der lokalen Abweichung geht nicht direkt in diese Kennzahl ein.",
          lifeNote: "Der globale Bodenfeuchte-Indikator ist kein Gesundheitsgrenzwert. Ein Gesundheitsbezug darf erst über belastbare Zwischenschritte wie Ernteausfälle, Hitze oder veränderte Wasserverfügbarkeit hergestellt werden."
        },
        {
          id: "groundwater-sh",
          scope: "sh",
          label: "Grundwasser · Landesmessnetz",
          type: "Monitoring",
          value: "Messnetz vorhanden",
          reference: "Langzeitvergleich je Messstelle",
          period: "fortlaufende Messung",
          sourceLabel: "Umweltportal Schleswig-Holstein · Grundwasserstand",
          sourceUrl: "https://umweltportal.schleswig-holstein.de/trefferanzeige?docuuid=46191c23-afca-4931-a329-921bbff58f7a",
          summary: "Schleswig-Holstein betreibt Landesmessstellen für Grundwasserstände. Die Messstellen sind mit Datenloggern ausgestattet und liefern Zeitreihen für den regionalen Wasserhaushalt.",
          finding: "Für den Prototypen ist dies zunächst eine Datenquelle, noch kein bewerteter Zustandswert. Im nächsten Schritt wird eine geeignete Messstelle im Raum Lübeck ausgewählt und ihre Ganglinie gegen einen transparent definierten Referenzzeitraum gestellt.",
          effect: "Niederschlag und Versickerung → Grundwasserneubildung und Grundwasserstand → Verfügbarkeit für Trinkwasserversorgung, Gewässer und grundwasserabhängige Ökosysteme.",
          uncertainty: "Messstellen sind lokal und hydrogeologisch unterschiedlich. Eine einzelne Ganglinie darf nicht ohne Prüfung auf ganz Schleswig-Holstein oder auf die planetare Grenze übertragen werden.",
          lifeNote: "Grundwasser ist für Versorgung und Ökosysteme zentral. Eine gesundheitliche Aussage erfordert zusätzlich Informationen zu Menge, Qualität, Versorgungssituation und tatsächlicher Exposition."
        },
        {
          id: "trave-luebeck",
          scope: "luebeck",
          label: "Trave · Abfluss Lübeck-Moisling",
          type: "Lokale Messreihe",
          value: "Pegel in Betrieb",
          reference: "Referenzzeitraum noch festzulegen",
          period: "laufender Datensatz",
          sourceLabel: "Open Data Schleswig-Holstein · Pegel Lübeck-Moisling",
          sourceUrl: "https://opendata.schleswig-holstein.de/dataset/abfluss-pegel-lubeck-moisling-trave",
          summary: "Der Pegel Lübeck-Moisling an der Trave bietet eine konkrete lokale Abflussreihe, mit der Veränderungen und Extremereignisse im Raum Lübeck untersucht werden können.",
          finding: "Noch keine Trendbewertung im Panel. Zuerst werden Datenzeitraum, Datenlücken und ein sinnvoller Referenzzeitraum geprüft; erst danach wird eine Aussage über Veränderung getroffen.",
          effect: "Niederschlag, Verdunstung, Zuflüsse und Nutzung im Einzugsgebiet → Abfluss der Trave → Niedrig-/Hochwasser, Gewässerökologie und lokale Wasserverhältnisse.",
          uncertainty: "Ein einzelner Pegel bildet das Einzugsgebiet nur an einem Ort ab. Veränderungen können mehrere Ursachen haben und müssen getrennt von der globalen planetaren Grenzkennzahl interpretiert werden.",
          lifeNote: "Für Lübeck ist der Abfluss zunächst eine Umwelt- und Versorgungsinformation. Ein direkter Gesundheitsbezug wird erst ergänzt, wenn dafür ein konkreter und belegter Expositionspfad vorliegt."
        }
      ]
    },
    { id: "nutrients", label: "Nährstoffkreisläufe", enabled: false },
    { id: "ocean", label: "Ozeanversauerung", enabled: false },
    { id: "aerosols", label: "Aerosole", enabled: false },
    { id: "ozone", label: "Stratosphärisches Ozon", enabled: false },
    { id: "novel", label: "Neue Substanzen", enabled: false }
  ]
};
