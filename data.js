window.GWL_DATA = {
  version: "0.9.4",
  knowledgeSources: {
    nitrate: "data/knowledge/gwl_nitrat_pilot_v0.2.json"
  },
  scopes: {
    global: { label: "Global", path: "Global" },
    europe: { label: "Europa", path: "Global → Europa" },
    germany: { label: "Deutschland", path: "Global → Europa → Deutschland" },
    sh: { label: "Schleswig-Holstein", path: "Global → Europa → Deutschland → Schleswig-Holstein" },
    luebeck: { label: "Lübeck", path: "Global → Europa → Deutschland → Schleswig-Holstein → Lübeck" },
    africa: { label: "Afrika", path: "Global → Afrika" },
    tanzania: { label: "Tansania", path: "Global → Afrika → Tansania" },
    tindigani: { label: "Tindigani · Hai District", path: "Global → Afrika → Tansania → Hai District → Tindigani" }
  },
  timePresets: {
    blc: { label: "BLC 1700–2100", min: 1700, max: 2100 }
  },
  boundaries: [
    { id: "climate", label: "Klimawandel", enabled: false },
    { id: "biosphere", label: "Biosphärenintegrität", enabled: false },
    { id: "land", label: "Landnutzung", enabled: false },
    {
      id: "freshwater",
      label: "Süßwasser",
      enabled: true,
      summary: "Die globale planetare Grenze und regionale Messreihen werden nicht vermischt: Global wird die Veränderung des Wasserkreislaufs bewertet; regional und lokal stehen konkrete Messungen, Expositionen und – sofern belegt – Gesundheitswirkungen.",
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
          uncertainty: "Modellbasierte Ensemble-Auswertung. Die Grenze beschreibt eine Abweichung von bekannten präindustriellen Bedingungen und ist kein globaler Kipppunkt. Der verwendete Studienwert bezieht sich auf 1996–2005, nicht auf das Kalenderjahr 2026.",
          lifeNote: "Aus der Überschreitung der globalen Süßwassergrenze folgt keine direkte Organwirkung. Dafür braucht es einen konkreten Expositionspfad.",
          causes: {
            ground: {
              title: "Ursachen an der Grundlage",
              intro: "Die globale Süßwassergrenze verändert sich nicht durch einen einzelnen Treiber, sondern durch das Zusammenwirken mehrerer Prozesse.",
              items: [
                { label: "Wasserentnahme und Umleitung", note: "Bewässerung, Stauseen, Umleitungen und andere Eingriffe verändern lokale und regionale Abflussregime.", meta: "direkter hydrologischer Treiber" },
                { label: "Landnutzungsänderung", note: "Entwaldung, Versiegelung und veränderte Vegetation beeinflussen Infiltration, Verdunstung und Abflussbildung.", meta: "Landoberfläche" },
                { label: "Klimawandel", note: "Erwärmung verändert Niederschlagsmuster, Verdunstung, Schneespeicher und Extremereignisse und verschiebt damit Abflüsse weltweit.", meta: "übergeordneter Treiber" }
              ]
            },
            effect: {
              title: "Ursachen im Wirkungspfad",
              intro: "Ob aus veränderten Abflüssen tatsächlich Trockenstress, Überflutung oder Nutzungskonflikte entstehen, hängt vom regionalen Kontext ab.",
              items: [
                { label: "Nutzungsdruck", note: "Hohe Entnahmen in Landwirtschaft, Industrie oder Städten verschärfen die Auswirkungen trockener Phasen.", meta: "Verstärker" },
                { label: "Infrastruktur und Management", note: "Speicher, Leitungsnetze und Wasserbewirtschaftung können Risiken dämpfen oder verstärken.", meta: "Vermittlung" }
              ]
            }
          },
          timePoints: [
            { year: 2000, label: "1996–2005 Mittel", value: "18,2 %", reference: "Grenze: 10,2 %", period: "1996–2005 (10-Jahres-Mittel)" }
          ]
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
          lifeNote: "Der globale Bodenfeuchte-Indikator ist kein Gesundheitsgrenzwert. Ein Gesundheitsbezug darf erst über belastbare Zwischenschritte hergestellt werden.",
          timePoints: [
            { year: 2000, label: "1996–2005 Mittel", value: "15,8 %", reference: "Grenze: 11,1 %", period: "1996–2005 (10-Jahres-Mittel)" }
          ]
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
          summary: "Schleswig-Holstein betreibt Landesmessstellen für Grundwasserstände. Die Messstellen liefern Zeitreihen für den regionalen Wasserhaushalt.",
          finding: "Für den Prototypen ist dies zunächst eine Datenquelle, noch kein bewerteter Zustandswert. Eine geeignete Messstelle und ein transparenter Referenzzeitraum müssen noch festgelegt werden.",
          effect: "Niederschlag und Versickerung → Grundwasserneubildung und Grundwasserstand → Verfügbarkeit für Trinkwasserversorgung, Gewässer und grundwasserabhängige Ökosysteme.",
          uncertainty: "Messstellen sind lokal und hydrogeologisch unterschiedlich. Eine einzelne Ganglinie darf nicht ohne Prüfung auf ganz Schleswig-Holstein oder auf die planetare Grenze übertragen werden.",
          lifeNote: "Eine gesundheitliche Aussage erfordert zusätzlich Informationen zu Menge, Qualität, Versorgungssituation und tatsächlicher Exposition."
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
          finding: "Noch keine Trendbewertung im Panel. Zuerst werden Datenzeitraum, Datenlücken und ein sinnvoller Referenzzeitraum geprüft.",
          effect: "Niederschlag, Verdunstung, Zuflüsse und Nutzung im Einzugsgebiet → Abfluss der Trave → Niedrig-/Hochwasser, Gewässerökologie und lokale Wasserverhältnisse.",
          uncertainty: "Ein einzelner Pegel bildet das Einzugsgebiet nur an einem Ort ab. Veränderungen können mehrere Ursachen haben und müssen getrennt von der globalen planetaren Grenzkennzahl interpretiert werden.",
          lifeNote: "Für Lübeck ist der Abfluss zunächst eine Umweltinformation. Ein direkter Gesundheitsbezug wird erst ergänzt, wenn dafür ein konkreter und belegter Expositionspfad vorliegt."
        },
        {
          id: "fluoride-tindigani",
          scope: "tindigani",
          label: "Trinkwasserfluorid · Fluorose",
          type: "Lokale Expositions- und Gesundheitsstudie",
          value: "0,45–38,59 mg/L Fluorid",
          reference: "WHO-Richtwert Trinkwasser: 1,5 mg/L",
          period: "März–Mai 2018 · publiziert 2023",
          sourceLabel: "Foat et al., Global Health: Science and Practice (2023)",
          sourceUrl: "https://doi.org/10.9745/GHSP-D-22-00342",
          summary: "Tindigani liegt im Hai District in Nordtansania am Ostafrikanischen Rift. Lokale Trinkwasserquellen enthalten teils sehr hohe natürliche Fluoridkonzentrationen; dieselbe Bevölkerung wurde 2009 und 2018 klinisch auf Skelettfluorose untersucht.",
          finding: "2018 lagen 28 untersuchte Trinkwasserquellen zwischen 0,45 und 38,59 mg/L Fluorid. Die Studie berichtet eine Prävalenz der Skelettfluorose von 3,3 %; 2009 waren es 4,4 %. Die gesundheitliche Belastung bestand trotz vermehrter Nutzung fluoridarmen Leitungswassers fort.",
          effect: "Fluoridreiche Wasserquelle → Trinken und weitere orale Aufnahme → chronisch erhöhte Fluoridexposition, besonders während Wachstum und Zahnentwicklung → Einlagerung in Zähne und Knochen → Dental- und Skelettfluorose.",
          uncertainty: "Die Ätiologie der Skelettfluorose ist multifaktoriell. Neben Trinkwasser wurden in den Studien weitere Fluoridquellen und Ernährungsfaktoren betrachtet. Die gemessene Prävalenz ist außerdem kein Maß für einen prozentualen Funktionsverlust des Skeletts.",
          lifeNote: "Hier ist der Wirkungspfad lokal ungewöhnlich gut geschlossen: Wasserquellen wurden chemisch untersucht und dieselbe Dorfgemeinschaft klinisch untersucht. Der Grad des Funktionsverlusts des Skeletts wurde jedoch nicht als einheitliche 0–100-%-Kennzahl erhoben. Deshalb wird das Skelett schraffiert und nicht mit einem erfundenen Grauwert eingefärbt.",
          causes: {
            ground: {
              title: "Ursachen an der Grundlage",
              intro: "In Tindigani ist die hohe Fluoridbelastung keine rein abstrakte Ursache, sondern eng mit Geologie und Wasserversorgung verbunden.",
              items: [
                { label: "Geologie des Ostafrikanischen Rift", note: "Fluoridhaltige vulkanische Gesteine und hydrogeochemische Bedingungen führen lokal zu sehr hohen natürlichen Fluoridkonzentrationen im Wasser.", meta: "natürlicher Haupttreiber" },
                { label: "Wahl der Wasserquelle", note: "Die frühere Nutzung fluoridreicher Brunnen und Oberflächenwässer erhöhte die Exposition; fluoridarmes Leitungswasser verringerte sie teilweise.", meta: "Versorgungsstruktur" },
                { label: "Fehlende oder begrenzte Defluoridierung", note: "Ohne technische Aufbereitung bleibt Fluorid in belasteten Quellen direkt im Trinkwasserpfad erhalten.", meta: "technische Ursache" }
              ]
            },
            effect: {
              title: "Ursachen im Wirkungspfad",
              intro: "Zwischen Wasserqualität und Organbefund liegen mehrere vermittelnde Faktoren.",
              items: [
                { label: "Langjährige orale Aufnahme", note: "Entscheidend ist nicht nur der Spitzenwert im Wasser, sondern die über Jahre wiederholte Aufnahme beim Trinken und Kochen.", meta: "Expositionsdauer" },
                { label: "Kindheit und Zahnentwicklung", note: "Besonders während Wachstum und Zahnentwicklung kann eine erhöhte Fluoridexposition spätere Dental- und Skelettbefunde prägen.", meta: "empfindliche Lebensphase" },
                { label: "Weitere Fluoridquellen", note: "Tee, Magadi und Ernährungsfaktoren wurden in den Studien als zusätzliche Einflussfaktoren berücksichtigt.", meta: "Mitursachen" }
              ]
            },
            life: {
              title: "Ursachen am Lebensbezug",
              intro: "Ob ein Gesundheitsbefund auftritt, hängt auch von individuellen und sozialen Bedingungen ab.",
              items: [
                { label: "Kumulierende Belastung", note: "Je länger Menschen hoch belastete Wasserquellen nutzen, desto wahrscheinlicher werden klinisch erkennbare Veränderungen an Zähnen und Skelett.", meta: "zeitliche Anreicherung" },
                { label: "Versorgungswandel", note: "Die teilweise Umstellung auf fluoridarmes Leitungswasser erklärt plausibel, warum die Prävalenz 2018 niedriger lag als 2009, obwohl die Belastung fortbestand.", meta: "Schutzfaktor" }
              ]
            }
          },
          health: {
            impacts: [
              {
                organ: "skeleton",
                label: "Skelett",
                functionLoss: null,
                prevalence: "Skelettfluorose 2018: 3,3 %",
                note: "Lokal klinisch nachgewiesene Skelettschädigung; Funktionsverlust nicht als 0–100-%-Wert quantifiziert."
              },
              {
                organ: "teeth",
                label: "Gebiss",
                functionLoss: null,
                prevalence: "Dentalfluorose 2018: 82,5 % der untersuchten Personen",
                note: "Lokal klinisch nachgewiesene Dentalfluorose; Prävalenz ist nicht gleich Funktionsverlust."
              }
            ]
          },
          timePoints: [
            {
              year: 2009,
              label: "Erhebung 2009",
              value: "Brunnen 9,3–35,0 mg/L · Oberflächenwasser 2,1–9,5 mg/L · Leitung 0,2 mg/L",
              reference: "WHO-Richtwert Trinkwasser: 1,5 mg/L",
              period: "April–Juli 2009 · publiziert 2013",
              sourceLabel: "Jarvis et al., Tropical Medicine & International Health (2013)",
              sourceUrl: "https://doi.org/10.1111/tmi.12027",
              finding: "2009 wurden 56 Fälle schwerer deformierender juveniler Skelettfluorose unter 1.263 musculoskeletal untersuchten Bewohnern gefunden: 4,4 % (95-%-KI 3,3–5,6). Fluorid lag in Brunnen bei 9,3–35,0 mg/L, in Oberflächenwasser bei 2,1–9,5 mg/L und im fluoridarmen Leitungswasser bei 0,2 mg/L.",
              uncertainty: "Die Studie zeigt eine starke Assoziation mit früherem Brunnenwassergebrauch, berücksichtigt aber auch Ernährung, Tee und Magadi als zusätzliche Fluoridquellen bzw. Einflussfaktoren.",
              causes: {
                life: {
                  title: "Ursachenbezug 2009",
                  intro: "Die Erhebung 2009 macht besonders sichtbar, wie frühere Exposition und fortbestehende Belastungsquellen zusammenwirken.",
                  items: [
                    { label: "Früherer Brunnenwassergebrauch", note: "Die klinisch auffälligen Fälle standen besonders mit der früheren Nutzung hoch belasteter Brunnen in Zusammenhang.", meta: "studiennahe Beobachtung" },
                    { label: "Zusätzliche Fluoridquellen", note: "Auch Ernährung, Tee und Magadi wurden als Mitverursacher bzw. Verstärker diskutiert.", meta: "Mitursachen" }
                  ]
                }
              },
              health: {
                impacts: [
                  { organ: "skeleton", label: "Skelett", functionLoss: null, prevalence: "Skelettfluorose 2009: 4,4 %", note: "56 klinisch identifizierte Fälle; kein einheitlicher 0–100-%-Funktionswert." },
                  { organ: "teeth", label: "Gebiss", functionLoss: null, prevalence: "Dentalfluorose 2009: 75,5 %", note: "Prävalenz in der untersuchten Bevölkerung; nicht mit Funktionsverlust gleichzusetzen." }
                ]
              }
            },
            {
              year: 2018,
              label: "Erhebung 2018",
              value: "0,45–38,59 mg/L Fluorid (28 Trinkwasserquellen)",
              reference: "WHO-Richtwert Trinkwasser: 1,5 mg/L",
              period: "März–Mai 2018 · publiziert 2023",
              sourceLabel: "Foat et al., Global Health: Science and Practice (2023)",
              sourceUrl: "https://doi.org/10.9745/GHSP-D-22-00342",
              finding: "2018 wurden 45 Fälle von Skelettfluorose identifiziert; die Studie gibt eine Prävalenz von 3,3 % an. 18 Fälle waren neu, 27 bereits aus der Untersuchung von 2009 bekannt. Die Fluoridwerte der 28 untersuchten Trinkwasserquellen reichten von 0,45 bis 38,59 mg/L.",
              uncertainty: "Die Exposition hat sich durch neue Wasserquellen verändert; Selbstangaben zu früheren Wasserquellen können Recall-Bias enthalten. Ein beobachteter Krankheitsanteil darf nicht als prozentualer Funktionsverlust eines Organs interpretiert werden.",
              causes: {
                life: {
                  title: "Ursachenbezug 2018",
                  intro: "2018 zeigt sich besonders der Zusammenhang zwischen veränderter Wasserversorgung und fortbestehender Restbelastung.",
                  items: [
                    { label: "Teilweise Nutzung fluoridarmen Leitungswassers", note: "Die veränderte Versorgung verringerte die Belastung für viele Menschen, beseitigte sie aber nicht vollständig.", meta: "Schutzfaktor" },
                    { label: "Fortbestehende Nutzung belasteter Quellen", note: "Ein Teil der Bevölkerung blieb weiterhin hoch fluoridierten Wasserquellen ausgesetzt.", meta: "Restursache" }
                  ]
                }
              },
              health: {
                impacts: [
                  { organ: "skeleton", label: "Skelett", functionLoss: null, prevalence: "Skelettfluorose 2018: 3,3 %", note: "Lokal klinisch nachgewiesen; Funktionsverlust nicht als 0–100-%-Wert quantifiziert." },
                  { organ: "teeth", label: "Gebiss", functionLoss: null, prevalence: "Dentalfluorose 2018: 82,5 %", note: "Lokal klinisch nachgewiesen; Prävalenz ist nicht gleich Funktionsverlust." }
                ]
              }
            }
          ]
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
