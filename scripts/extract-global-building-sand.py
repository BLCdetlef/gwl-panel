"""Extract a research candidate from the public, pinned GloBUS v1.0 archive.

Usage: python scripts/extract-global-building-sand.py PATH_TO_ZIP
No model execution, extrapolation or panel integration is performed.
"""
import csv
import hashlib
import io
import json
import math
from pathlib import Path
import sys
import zipfile

archive = Path(sys.argv[1])
assert hashlib.md5(archive.read_bytes()).hexdigest() == "f70774a49441a4dbb9f106162a3aecae", "Unexpected source archive"
with zipfile.ZipFile(archive) as z:
    def rows(suffix):
        names = [n for n in z.namelist() if n.endswith('/' + suffix)]
        assert len(names) == 1
        return list(csv.DictReader(io.StringIO(z.read(names[0]).decode('utf-8-sig'))))

    materials = rows('output_material/concrete_glass_output.csv')
    inflow = [r for r in materials if r['flow'] == 'inflow']
    outflow = [r for r in materials if r['flow'] == 'outflow']
    recovery = rows('files_recovery_rate/recovery_rate.csv')
    factors = rows('files_sand_factor/sand_primary_per_kg.csv')
    secondary = rows('files_sand_factor/sand_secondary_per_kg.csv')
    published = rows('output_sand/Sand_total.csv')
    assert len(inflow) == len(outflow) == len(recovery) == len(factors) == 624
    assert len(published) == 26
    for a, b, c, d in zip(inflow, outflow, recovery, factors):
        assert a[''] == b[''] == c[''] == d['Region']
        assert all(a[k] == b[k] == c[k] == d[k] for k in ['type', 'area', 'material'])
    assert all(float(r[str(y)]) == 0 for r in secondary for y in range(2020, 2061))

    points = []
    max_error = 0
    for year in range(1970, 2061):
        regional = {}
        for a, b, c, d in zip(inflow, outflow, recovery, factors):
            value = (float(a[str(year)]) - min(float(a[str(year)]), float(b[str(year)]) * float(c[str(year)]))) * float(d[str(max(year, 2020))])
            regional[a['']] = regional.get(a[''], 0) + value
        total = sum(regional.values())
        if year >= 2020:
            for row in published:
                expected = float(row[str(year)])
                actual = regional[row['Region']]
                assert math.isclose(actual, expected, rel_tol=1e-12, abs_tol=1e-7)
                max_error = max(max_error, abs(actual - expected))
        points.append({'year': year, 'value': total / 1000, 'sourceValue': total, 'sourceUnit': 'kt/Jahr', 'sourceRefs': ['globus_v1']})

candidate = {
    'format': 'gwl-curve-research-candidate-v1',
    'candidateId': 'global-building-sand-usage',
    'researchedAt': '2026-10-05',
    'decision': 'ZURÜCKSTELLEN',
    'status': 'coherent_building_model_series_verified_not_integrated',
    'title': 'Globaler Sandverbrauch für Gebäude (1970–2060)',
    'requestedTitle': 'Globaler Sandverbrauch des Bauwesens',
    'systemBoundary': 'Stoff- und Energieströme',
    'domainId': 'eah_material_energy_flows',
    'group': 'Baustoffe', 'role': 'Treiber', 'geography': 'Global', 'unit': 'Mio. t/Jahr',
    'definition': 'Sandbedarf für Beton und Glas in Wohn- und Nichtwohngebäuden; globale Summe über 26 IMAGE-Regionen. Kein Gesamtverbrauch des Bauwesens; Straßen, Bahntrassen und weitere Infrastruktur sind nicht enthalten. Kies ist ausgeschlossen.',
    'historicalEstimates': {'dataNature': 'assessed_model_estimate', 'period': '1970–2019', 'points': points[:50], 'publishedSandOutput': False, 'derivation': 'Aus veröffentlichten Materialflüssen mit dem Sandrechenweg der Autoren abgeleitet; keine direkte Messreihe. Historische Sandintensitäten werden im Originalcode konstant auf dem Stand 2020 gehalten.'},
    'projection': {'dataNature': 'scenario_projection', 'period': '2020–2060', 'scenario': 'GloBUS v1.0 veröffentlichter Baseline-Output', 'scenarioNote': 'Studie beschreibt einen middle-of-the-road baseline scenario; keine eigene Trendfortschreibung und keine Kombination von Effizienzvarianten.', 'points': points[50:]},
    'provenance': {'sourceUrl': 'https://zenodo.org/records/5897264', 'sourceFile': 'Zh-xy/GloBUS-v1.0.zip', 'archiveMd5': 'f70774a49441a4dbb9f106162a3aecae', 'locator': 'output_material/concrete_glass_output.csv; files_recovery_rate/recovery_rate.csv; files_sand_factor/sand_primary_per_kg.csv; output_sand/Sand_total.csv; GloBUS.py, Sandberechnung', 'transformation': 'Pro Region und Gebäudetyp: (Materialzufluss − min(Materialzufluss, Materialabfluss × Rückgewinnungsrate)) × Sandfaktor. Summe über alle Gebäudetypen, Beton/Glas und 26 Regionen. kt / 1000 → Mio. t. Historische Faktoren 2020 wie im Originalcode. Keine Interpolation oder zusätzliche Extrapolation.', 'verification': {'regionalProjectionValuesChecked': 26 * 41, 'maxAbsoluteErrorKt': max_error, 'relativeTolerance': 1e-12, 'historicalYears': 50, 'historicalSpanYears': 49}},
    'eligibility': {'approvedForBlc': False, 'historicalCoverageMeets50YearRule': False, 'scopeCompatibleWithZhuang2025WholeConstruction': False, 'metricDefinitionVerified': True, 'numericProjectionVerified': True, 'healthMarkers': False, 'reference': None, 'threshold': None},
    'sourceRegister': [
        {'id': 'globus_v1', 'title': 'GloBUS v1.0', 'authors': 'Xiaoyang Zhong et al.', 'year': 2022, 'doi': '10.5281/zenodo.5897264', 'url': 'https://zenodo.org/records/5897264', 'primarySource': True, 'openAccess': True},
        {'id': 'zhong_2022', 'title': 'Increasing material efficiencies of buildings to address the global sand crisis', 'authors': 'Xiaoyang Zhong, Sebastiaan Deetman, Arnold Tukker, Paul Behrens', 'year': 2022, 'doi': '10.1038/s41893-022-00857-0', 'url': 'https://www.nature.com/articles/s41893-022-00857-0', 'primarySource': True, 'openAccess': 'Öffentliches Abstract; Code und Daten offen'},
        {'id': 'zhuang_2025', 'title': 'Tracking five decades of global sand and gravel stocks and flows in 184 countries', 'authors': 'Shurong Zhuang, Qiance Liu, Kun Sun, Stephan Lutter, Ruishan Chen, Gang Liu', 'year': 2025, 'doi': '10.1016/j.resconrec.2025.108460', 'url': 'https://www.sciencedirect.com/science/article/pii/S0921344925003386', 'primarySource': True, 'numericDataAccess': 'Nicht verifiziert; keine Werte aus dieser Studie übernommen'}
    ]
}
destination = Path(__file__).resolve().parents[1] / 'research/curve-candidates/02_stoff_energiestroeme_sand_gebaeude_global.json'
if destination.exists():
    previous = json.loads(destination.read_text(encoding='utf-8'))
    if previous.get('status') == 'integrated_with_user_approved_single_year_exception':
        for key in ['decision', 'status', 'approvalNote', 'projectionTransitionPercent']:
            candidate[key] = previous[key]
        candidate['eligibility']['approvedForBlc'] = True
        candidate['eligibility']['coverageExceptionRuleId'] = previous['eligibility']['coverageExceptionRuleId']
destination.write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(points)} Jahreswerte; {26 * 41} regionale Zukunftswerte geprüft; maximale Abweichung {max_error:.3g} kt. Kandidat gespeichert.')
