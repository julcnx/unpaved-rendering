# Scores the reader test from a CSV export of the answers sheet (File > Download > CSV). Only the "raw" column is read.
# Usage: python3 research/reader-test/score.py answers.csv [--exclude id-prefix ...]
# Counts people who saw all five maps. Groups by link tag (src): "forum" is mappers, everything else is non-mappers.
# Main roads: trunk, primary, secondary (the case the styles are made for); minor: the rest. Answer key: labels.json.
import csv, json, statistics, sys
from collections import defaultdict
from pathlib import Path

STYLES = ['grain', 'centre-line', 'dashed-fill', 'dashed-casing', 'dashed-fill-full']
MAIN = {'trunk', 'primary', 'secondary'}
KEY = json.loads((Path(__file__).parent / 'labels.json').read_text())
ROADS = {p: {r['n']: r for r in v['roads']} for p, v in KEY.items()}

args = sys.argv[1:]
exclude = args[args.index('--exclude') + 1:] if '--exclude' in args else []
rows = [json.loads(r['raw']) for r in csv.DictReader(open(args[0], newline='', encoding='utf-8'))]
people = [r for r in rows if len(r['maps']) == 5 and not any(r['id'].startswith(x) for x in exclude)]
group = lambda r: 'mappers (forum)' if r.get('src') == 'forum' else 'non-mappers'
pct = lambda a, b: f'{a}/{b} ({100 * a / b:.0f}%)' if b else '-'

print(f"{len(rows)} rows, {len(people)} saw all five maps ({len(exclude)} excluded)")
for g in sorted({group(r) for r in people}):
    n = [r for r in people if group(r) == g]
    print(f"  {g}: {len(n)}  (src: {dict(sorted(defaultdict(int, {s: sum(r.get('src', 'none') == s for r in n) for s in {r.get('src', 'none') for r in n}}).items()))})")


def score(people, title, split_images=False):
    print(f"\n## {title} ({len(people)} people)\n")
    print('| Style | Unpaved found | Main roads | Minor roads | Paved tapped | Maps all right | Maps with no tap |')
    print('|---|---|---|---|---|---|---|')
    keys = [(s, i) for s in STYLES for i in ([1, 2] if split_images and s == 'dashed-casing' else [None])]
    for s, img in keys:
        c = defaultdict(int)
        for r in people:
            for m in r['maps']:
                if m['style'] != s or (img and r.get('images', 1) != img): continue
                c['maps'] += 1
                c['perfect'] += all((a == 'U') == ROADS[m['place']][n + 1]['unpaved'] for n, a in enumerate(m['answers']))
                c['empty'] += 'U' not in m['answers']
                for n, a in enumerate(m['answers']):
                    road = ROADS[m['place']][n + 1]
                    if road['unpaved']:
                        k = 'main' if road['highway'] in MAIN else 'minor'
                        c[k] += 1; c[k + '_hit'] += a == 'U'
                    else:
                        c['paved'] += 1; c['fa'] += a == 'U'
        name = s + (f' (pictures {img})' if img else '')
        print(f"| {name} | {pct(c['main_hit'] + c['minor_hit'], c['main'] + c['minor'])} | {pct(c['main_hit'], c['main'])} | "
              f"{pct(c['minor_hit'], c['minor'])} | {pct(c['fa'], c['paved'])} | {pct(c['perfect'], c['maps'])} | {pct(c['empty'], c['maps'])} |")


def roads(people):
    print('\nPer road (unpaved found, or paved tapped):\n')
    for p, rs in ROADS.items():
        ms = [m for r in people for m in r['maps'] if m['place'] == p]
        cells = []
        for n, road in rs.items():
            t = sum(m['answers'][n - 1] == 'U' for m in ms)
            cells.append(f"{n} {'U' if road['unpaved'] else 'P'} {road['highway']}{' ' + road['ref'] if road.get('ref') else ''}: {t}/{len(ms)}")
        print(f"- {p}: " + '; '.join(cells))


def ranking(people):
    full = [r['ranking'].split() for r in people if len(r.get('ranking', '').split()) == 5]
    print(f"\nRanking, {len(full)} full rankings (1 = clearest):\n")
    print('| Style | Average rank | Ranked first | Ranked last |')
    print('|---|---|---|---|')
    for s in sorted(STYLES, key=lambda s: statistics.mean(f.index(s) for f in full) if full else 0):
        print(f"| {s} | {statistics.mean(f.index(s) + 1 for f in full):.1f} | {sum(f[0] == s for f in full)} | {sum(f[-1] == s for f in full)} |")


def times(people):
    first = [r['maps'][0]['ms'] / 1000 for r in people]
    later = [m['ms'] / 1000 for r in people for m in r['maps'][1:]]
    print(f"\nTime per map, median: first map {statistics.median(first):.0f} s, later maps {statistics.median(later):.0f} s")
    print(f"People with at least one map left with no tap: {sum(any('U' not in m['answers'] for m in r['maps']) for r in people)}")


for g in sorted({group(r) for r in people}, reverse=True):
    ps = [r for r in people if group(r) == g]
    score(ps, g, split_images=True)
    roads(ps)
    ranking(ps)
    times(ps)
