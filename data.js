window.GWL_DATA = {
  boundaries: [
    {
      id: "climate",
      label: "Klimawandel",
      enabled: false
    },
    {
      id: "biosphere",
      label: "Biosphärenintegrität",
      enabled: false
    },
    {
      id: "land",
      label: "Landnutzung",
      enabled: false
    },
    {
      id: "freshwater",
      label: "Süßwasser",
      enabled: true,
      summary: "Prototypisch werden hier lokale und überregionale Informationen zu Wasserverfügbarkeit und Wasserhaushalt zusammengeführt.",
      items: [
        {
          id: "soil-moisture",
          label: "Bodenfeuchte",
          value: "Demowert",
          reference: "Referenzbereich folgt",
          uncertainty: "noch nicht bewertet",
          sourceLabel: "Quelle folgt",
          sourceUrl: "#",
          effect: "Trockene Böden können Pflanzenstress, stärkere Aufheizung und geringere Verdunstung begünstigen. Die konkrete lokale Wirkung muss mit Messdaten belegt werden.",
          organs: {
            kidney: 2,
            heart: 1,
            brain: 1
          }
        },
        {
          id: "groundwater",
          label: "Grundwasser",
          value: "Demowert",
          reference: "Langzeitmittel folgt",
          uncertainty: "noch nicht bewertet",
          sourceLabel: "Quelle folgt",
          sourceUrl: "#",
          effect: "Grundwasser ist für Versorgung und Gewässer eng mit dem regionalen Wasserhaushalt verknüpft. Aussagen für Lübeck benötigen belastbare Messstellen und Vergleichszeiträume.",
          organs: {
            kidney: 2,
            heart: 1
          }
        },
        {
          id: "runoff",
          label: "Flüsse / Abfluss",
          value: "Demowert",
          reference: "Referenz folgt",
          uncertainty: "noch nicht bewertet",
          sourceLabel: "Quelle folgt",
          sourceUrl: "#",
          effect: "Veränderte Abflüsse können Wasserverfügbarkeit, Niedrig- und Hochwasser sowie Ökosysteme beeinflussen.",
          organs: {
            kidney: 1,
            gut: 1
          }
        },
        {
          id: "surface-water",
          label: "Oberflächenwasser",
          value: "Demowert",
          reference: "Referenz folgt",
          uncertainty: "noch nicht bewertet",
          sourceLabel: "Quelle folgt",
          sourceUrl: "#",
          effect: "Bei Oberflächengewässern müssen Wasserstand, Abfluss, Temperatur und Wasserqualität getrennt betrachtet werden.",
          organs: {
            gut: 1
          }
        }
      ]
    },
    {
      id: "nutrients",
      label: "Nährstoffkreisläufe",
      enabled: false
    },
    {
      id: "ocean",
      label: "Ozeanversauerung",
      enabled: false
    },
    {
      id: "aerosols",
      label: "Aerosole",
      enabled: false
    },
    {
      id: "ozone",
      label: "Stratosphärisches Ozon",
      enabled: false
    },
    {
      id: "novel",
      label: "Neue Substanzen",
      enabled: false
    }
  ],
  organs: {
    brain: {
      label: "Gehirn",
      summary: "Im Süßwasser-Prototyp nur über gut belegte Wirkungspfade wie starke Hitze oder Dehydrierung einbeziehen."
    },
    heart: {
      label: "Herz / Kreislauf",
      summary: "Relevanz entsteht im Süßwasser-Kontext vor allem über Hitze, Flüssigkeitsmangel und Kreislaufbelastung."
    },
    lung: {
      label: "Lunge",
      summary: "Für den Süßwasser-Prototyp ist derzeit kein direkter Hauptpfad hinterlegt."
    },
    kidney: {
      label: "Nieren",
      summary: "Die Nieren reagieren empfindlich auf Flüssigkeitsmangel und Hitzebelastung. Lokale Aussagen müssen über konkrete Expositionsdaten begründet werden."
    },
    gut: {
      label: "Darm",
      summary: "Ein Bezug kann über Wasserqualität, Hygiene und Versorgung entstehen. Das ist von der planetaren Süßwasser-Kontrollgröße zu unterscheiden."
    }
  }
};
