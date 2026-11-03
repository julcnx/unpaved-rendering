#!/usr/bin/env python3
"""Official paved and unpaved road km per country, from the CIA World Factbook (public domain).

The Factbook dropped its Transportation > Roadways field between 2025-04-10 and 2025-05-15, so this
reads the last snapshot that has it, from the github.com/factbook/factbook.json mirror.

Usage: python3 stats/official/factbook.py   (writes stats/official/factbook-roadways.json)
"""

import glob, json, os, re, urllib.request
from concurrent.futures import ThreadPoolExecutor

COMMIT = '43907b2cd0'  # 2025-04-10, last snapshot with Roadways
REPO = 'factbook/factbook.json'
HERE = os.path.dirname(os.path.abspath(__file__))
RESULTS = os.path.join(HERE, '..', 'results')
# Our names that differ from the Factbook's conventional short form.
ALIAS = {'DR Congo': 'DRC', 'Congo-Brazzaville': 'Congo (Brazzaville)', 'Ivory Coast': "Cote d'Ivoire",
         'Myanmar': 'Burma', 'Gambia': 'The Gambia', 'French Guiana': None}


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'unpaved-rendering/0.1'})
    return urllib.request.urlopen(req).read()


def km(field):
    text = (field or {}).get('text', '')
    value = re.search(r'([\d,]+)\s*km', text)
    year = re.search(r'\((\d{4})\)', text)
    return (int(value.group(1).replace(',', '')) if value else None), (year.group(1) if year else None)


tree = json.loads(get(f'https://api.github.com/repos/{REPO}/git/trees/{COMMIT}?recursive=1'))
paths = [t['path'] for t in tree['tree'] if re.match(r'^[a-z-]+/[a-z]{2}\.json$', t['path'])]
with ThreadPoolExecutor(8) as pool:
    files = dict(zip(paths, pool.map(lambda p: json.loads(get(f'https://raw.githubusercontent.com/{REPO}/{COMMIT}/{p}')), paths)))

ours = {}
for f in glob.glob(os.path.join(RESULTS, '*.json')):
    d = json.load(open(f))
    if d['country'] != 'aq':
        ours[d['country']] = d['name']

out = {}
for code, name in sorted(ours.items()):
    target = ALIAS.get(name, name)
    if target is None:
        out[code] = {'name': name, 'note': 'part of France in the Factbook'}
        continue
    match = next((p for p, d in files.items()
                  if (d.get('Government', {}).get('Country name', {}).get('conventional short form') or {}).get('text') == target), None)
    if not match:
        out[code] = {'name': name, 'note': 'not found in the Factbook'}
        continue
    roads = files[match].get('Transportation', {}).get('Roadways')
    if not roads:
        out[code] = {'name': name, 'factbook_file': match, 'note': 'no Roadways data'}
        continue
    total, y1 = km(roads.get('total'))
    paved, y2 = km(roads.get('paved'))
    unpaved, y3 = km(roads.get('unpaved'))
    out[code] = {'name': name, 'factbook_file': match, 'total_km': total, 'paved_km': paved, 'unpaved_km': unpaved,
                 'year': y3 or y2 or y1, 'raw': roads}

json.dump({'source': 'CIA World Factbook, Transportation > Roadways, via github.com/factbook/factbook.json',
           'commit': COMMIT, 'snapshot_date': '2025-04-10',
           'note': 'Last snapshot with the Roadways field (removed by 2025-05-15). Public domain.',
           'countries': out}, open(os.path.join(HERE, 'factbook-roadways.json'), 'w'), indent=1, ensure_ascii=False)
print(sum(1 for v in out.values() if v.get('paved_km') and v.get('total_km')), 'countries with total and paved km')
