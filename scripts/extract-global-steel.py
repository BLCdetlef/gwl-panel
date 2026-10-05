"""Extract worldsteel 2026 HTML and IEA roadmap chart HTML into a candidate.
Usage: python scripts/extract-global-steel.py WORLDSTEEL_HTML IEA_HTML
"""
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys

class Tables(HTMLParser):
    def __init__(self):
        super().__init__(); self.tables=[]; self.current=None; self.cell=None
    def handle_starttag(self,tag,attrs):
        if tag=='table': self.current=[]
        elif tag in ('td','th') and self.current is not None: self.cell=''
    def handle_data(self,data):
        if self.cell is not None: self.cell+=data
    def handle_endtag(self,tag):
        if tag in ('td','th') and self.cell is not None:
            self.current.append(self.cell.strip()); self.cell=None
        elif tag=='table' and self.current is not None:
            self.tables.append(self.current); self.current=None

p=Tables(); p.feed(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
tables=[t for t in p.tables if '1950' in t and '2025' in t and 'World' in t]
assert len(tables)==1, 'Historical table not uniquely identified'
t=tables[0]; values=[]
for i in range(0,len(t),2):
    cell=t[i]
    if re.fullmatch(r'(19|20)\d{2}',cell) and i+1<len(t):
        v=t[i+1].replace(' ','').replace('\xa0','').replace(',','')
        assert v.isdigit()
        values.append({'year':int(cell),'value':int(v),'sourceRefs':['worldsteel_2026']})
assert len(values)==28 and values[0]['value']==189 and values[-1]['value']==1849
s=Path(sys.argv[2]).read_text(encoding='utf-8-sig')
options=json.loads(html.unescape(re.search(r'data-chart-chartoptions="([^"]*)"',s).group(1)).replace('\\"','"'))
assert [a['label']['text'] for a in options['xAxis']['plotLines']]==['2019','2030','2050']
steps=next(a for a in options['series'] if a['name']=='STEPS')
assert steps['data'][1]==2101 and steps['data'][5]==2535
history_url='https://worldsteel.org/data/world-steel-in-figures/world-steel-in-figures-2026/'
future_url='https://www.iea.org/data-and-statistics/charts/contribution-of-material-efficiency-strategies-to-reductions-in-global-steel-demand-2019-2050'
c={'format':'gwl-curve-research-candidate-v1','candidateId':'global-crude-steel-production','researchedAt':'2026-10-05','decision':'AUFNEHMEN','title':'Globale Rohstahlproduktion (1950–2050)','systemBoundary':'Stoff- und Energieströme','group':'Rohstoffe','role':'Treiber','geography':'Global','unit':'Mio. t Rohstahl/Jahr','definition':'Globale Rohstahlproduktion einschließlich primärer und schrottbasierter Routen; keine Fertigstahlproduktion, kein Stahlverbrauch und keine reine Primärproduktion.','observations':{'dataNature':'observed','period':'1950–2025','points':values,'provenance':{'sourceFile':'World Steel in Figures 2026 (HTML)','sourceUrl':history_url,'locator':'World crude steel production 1950 to 2025; Tabelle Years / World','fields':['Years','World (million tonnes)'],'extraction':'28 publizierte Stützwerte; 1950–2010 überwiegend Fünfjahresschritte, 2011–2025 jährlich. Einheitlich Ausgabe 2026 einschließlich Revisionen.','transformation':'Keine Umrechnung, Glättung oder Interpolation; nur Rohstahl-Welttabelle.'}},'projection':{'scenario':'STEPS','edition':2020,'period':'2030–2050','points':[{'year':y,'value':steps['data'][i],'sourceRefs':['iea_steel_roadmap_2020']} for y,i in [(2030,1),(2050,5)]],'provenance':{'sourceFile':'IEA-Diagramm, data-chart-chartoptions','sourceUrl':future_url,'locator':'Erstes data-chart-chartoptions: series[name=STEPS].data[1] = 2030 und data[5] = 2050; Jahresgruppen über xAxis.plotLines.label.text','fields':['STEPS','Mt/year','2030','2050'],'extraction':'Zwei absolute Rohstahl-Produktionswerte aus eingebetteter Diagrammkonfiguration; keine Wasserfall-Differenzen oder SDS-Werte übernommen.','transformation':'Mt/year = Mio. t/Jahr; keine Digitalisierung, Interpolation, Kalibrierung oder eigene Fortschreibung.'}},'ieaHistoricalBaseline2019':1869,'worldsteelHistorical2019':next(a['value'] for a in values if a['year']==2019),'eligibility':{'historicalSpanYears':75,'approvedForBlc':True,'healthMarkers':False,'reference':None,'threshold':None},'sourceRegister':[{'id':'worldsteel_2026','title':'World Steel in Figures 2026','authors':'World Steel Association','publisher':'worldsteel','year':2026,'url':history_url,'access':'open_full_text'},{'id':'iea_steel_roadmap_2020','title':'Contribution of material efficiency strategies to reductions in global steel demand, 2019–2050; Iron and Steel Technology Roadmap','authors':'International Energy Agency','publisher':'IEA','year':2020,'url':future_url,'access':'open_full_text'}]}
destination=Path(__file__).resolve().parents[1]/'research/curve-candidates/02_stoff_energiestroeme_stahlproduktion_global.json'
destination.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('28 historische Stützwerte, 75 Jahre; IEA STEPS 2030=2101, 2050=2535 Mio. t/Jahr.')
