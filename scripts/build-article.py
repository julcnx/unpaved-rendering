# Builds index.html (the article page) from article.md and article/template.html.
# Usage: python3 scripts/build-article.py   (needs the Python "markdown" package: pip install markdown)
# FIGURE comments in article.md become figures; numbers in the chart come from research/stats/summary.csv,
# photo credits from research/examples/images/credits.json. Images are in article/img/ (see LOG.md, 2026-11-11).
import csv
import json
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
IMG = 'article/img'


def heat_table():
    """Unpaved share by class, a shaded table: one hue, light = 0 %, dark = 100 %; the number is always printed."""
    pct = {}
    for r in csv.DictReader(open(ROOT / 'research/stats/summary.csv')):
        pct.setdefault(r['name'], {})[r['class']] = float(r['pct_unpaved'])
    countries = ['Gabon', 'Namibia', 'DR Congo', 'Bolivia', 'Mali', 'Mongolia', 'Peru', 'Kenya', 'Iceland', 'Australia', 'Brazil']
    classes = ['trunk', 'primary', 'secondary', 'tertiary']
    lo, hi = (0xF6, 0xF0, 0xE7), (0x6B, 0x44, 0x20)  # earthy ramp, the Unpaved brown family

    def cell(v):
        rgb = ''.join(f'{round(a + (b - a) * v / 100):02x}' for a, b in zip(lo, hi))
        ink = '#fff' if v >= 50 else 'var(--ink)'
        return f'<td style="background:#{rgb};color:{ink}" title="{v:.0f}% of km unpaved">{v:.0f}%</td>'

    rows = '<tr><th></th>' + ''.join(f'<th>{c.capitalize()}</th>' for c in classes) + '</tr>'
    rows += ''.join(f'<tr><th>{n}</th>' + ''.join(cell(pct[n][c]) for c in classes) + '</tr>' for n in countries)
    rows += '<tr class="base"><th>Denmark</th>' + ''.join(cell(pct['Denmark'][c]) for c in classes) + '</tr>'
    return ('<figure class="fig heat"><div class="scroll"><table>' + rows + '</table></div>'
            '<figcaption>Share of road length tagged unpaved, by road class. Roads without a surface tag count as paved, '
            'so these are minimums. Denmark for comparison. Source: OpenStreetMap, November 2026.</figcaption></figure>')


PHOTOS = [('na-w240603923-2', 'Namibia', 'C39', 'primary'), ('ma-w827183138-3', 'Morocco', 'RR704', 'secondary'),
          ('cg-w338830884-3', 'Congo-Brazzaville', 'P45', 'secondary'), ('ug-w27567283-0', 'Uganda', '', 'secondary'),
          ('om-w241714242-2', 'Oman', '', 'secondary'), ('kg-w1422780378-1', 'Kyrgyzstan', 'M-067', 'secondary'),
          ('ge-w81287807-2', 'Georgia', 'Sh10', 'secondary'), ('fi-w113796504-0', 'Finland', '522', 'secondary'),
          ('au-w313519144-1', 'Australia', 'Gibb River Road', 'secondary'), ('bo-w122604957-1', 'Bolivia', 'F34', 'secondary'),
          ('mx-w41680341-0', 'Mexico', 'QR 15', 'secondary'), ('gt-w293378392-0', 'Guatemala', 'RD PET-06', 'secondary')]


def photo_grid():
    """One confirmed unpaved main road per country, with the photographer's credit."""
    credits = json.load(open(ROOT / 'research/examples/images/credits.json'))
    items = ''
    for key, country, ref, cls in PHOTOS:
        c = credits[f'mapillary/{key}.jpg']
        road = f'{ref}, {cls}' if ref else cls
        items += (f'<figure><img src="{IMG}/photo-{key}.jpg" alt="{country}, {road}: unpaved road" loading="lazy">'
                  f'<figcaption><b>{country}</b> {road}<span><a href="{c["image"]}">{c["author"]}</a>, {c["captured"][:4]}</span></figcaption></figure>')
    return (f'<figure class="fig wide photos"><div class="grid">{items}</div>'
            '<figcaption>Main roads tagged unpaved, checked on street-level imagery. Photos: Mapillary contributors, CC BY-SA 4.0.</figcaption></figure>')


APPS = [('Show it, keep the class', [('americana', 'Americana'), ('dmd2', 'DMD2')]),
        ('Do not show it', [('komoot', 'Komoot'), ('mapy-com', 'Mapy.com')]),
        ('Show it, lose the class', [('humanitarian', 'Humanitarian'), ('ridewithgps', 'Ride with GPS')])]


def app_grid():
    """One junction in six apps, two per group."""
    groups = ''
    for title, apps in APPS:
        cards = ''.join(f'<figure><img src="{IMG}/app-{k}.png" alt="{n} at Namutoni" loading="lazy"><figcaption>{n}</figcaption></figure>' for k, n in apps)
        groups += f'<div class="group"><h3>{title}</h3><div class="pair">{cards}</div></div>'
    return (f'<figure class="fig wide apps">{groups}'
            '<figcaption>Namibia, C38 at Namutoni (Etosha): unpaved to the west and north, paved to the east. '
            'Screenshots of each web map, November 2026, © OpenStreetMap contributors. Every app at all six roads: App reports.</figcaption></figure>')


SLIDER = f'''<figure class="fig wide"><div class="slider">
<img src="{IMG}/slider-proposed.jpg" alt="Proposed: unpaved roads keep their class colour and get a dashed outline">
<img class="top" src="{IMG}/slider-today.jpg" alt="Today: every road drawn as paved">
<span class="lab l"><b>Today</b><span>, no surface signal</span></span>
<span class="lab r"><b>Proposed</b><span>, style 4</span></span>
<span class="bar"></span><span class="knob">⇆</span>
<input type="range" min="0" max="100" value="50" aria-label="Drag to compare today and proposed">
</div><figcaption>Drag to compare. Namibia, C38 at Namutoni (Etosha). Left: every road drawn as paved, as most maps do today. Right: the same map with style 4, a dashed outline on unpaved roads; the class colours stay.</figcaption></figure>'''

EMBED = '''<figure class="fig wide">
<iframe class="demo" src="demo/?embed=1&amp;spot=namibia&amp;style=dashed-casing&amp;bg=terrain&amp;z=16&amp;lat=-18.81068&amp;lon=16.9375" loading="lazy" title="Live demo: the five styles"></iframe>
<figcaption>Live demo with real OpenStreetMap data. Switch between the five styles; pick a background at the bottom right. <a href="demo/?spot=namibia">Open the full demo</a>, with search and every sample spot.</figcaption></figure>'''

STYLES_GRID = (f'<figure class="fig wide"><picture><source media="(max-width: 760px)" srcset="{IMG}/styles-grid-portrait.jpg">'
               f'<img src="{IMG}/styles-grid.jpg" alt="The five styles and No style, side by side, at Namutoni" loading="lazy"></picture>'
               '<figcaption>The five styles and the same map with no surface signal, at Namutoni (demo, hillshade, zoom 16).</figcaption></figure>')

ZOOM_STRIP = ('<figure class="fig wide zoom"><div class="row">' + ''.join(
    f'<figure><img src="{IMG}/zoom-{z}.jpg" alt="Style 3 at zoom {z}" loading="lazy"><figcaption>Zoom {z}</figcaption></figure>' for z in (13, 14, 16)) +
    '</div><figcaption>Style 3 from overview to detail, at Namutoni. At zoom 13 the road is under 6 pixels wide, so unpaved shows as a plain, '
    'darker tint; from zoom 14 the dashes take over. © OpenStreetMap contributors.</figcaption></figure>')

FIGURES = {'slider': SLIDER, 'live demo': EMBED, 'chart': heat_table, 'photo grid': photo_grid, 'apps': app_grid,
           'the five styles side by side': STYLES_GRID, 'one road at zoom': ZOOM_STRIP}


def figure(m):
    text = m.group(1).strip()
    if text.startswith('hero'):
        return ''  # in the template, above the article
    for key, fig in FIGURES.items():
        if text.startswith(key):
            return '\n\n' + (fig() if callable(fig) else fig) + '\n\n'
    raise SystemExit(f'No figure for: {text[:60]}')


md = (ROOT / 'article.md').read_text()
md = re.sub(r'^# .*\n', '', md, count=1)  # the title and byline are in the template
md = re.sub(r'^\*By .*\*\n', '', md, count=1, flags=re.M)
md = re.sub(r'<!--\s*DRAFT.*?-->', '', md, flags=re.S)
md = re.sub(r'<!--\s*FIGURE:?\s*(.*?)-->', figure, md, flags=re.S)
body = markdown.markdown(md, extensions=['tables'])
body = re.sub(r'<table>(\s*<thead>\s*<tr>\s*<th>Country)', r'<table class="num">\1', body)  # number tables align right

# Section ids and the table of contents
slug = lambda t: 's-' + re.sub(r'[^a-z0-9]+', '-', re.sub(r'<.*?>', '', t).lower()).strip('-')
heads = re.findall(r'<h2>(.*?)</h2>', body)
for h in heads:
    body = body.replace(f'<h2>{h}</h2>', f'<h2 id="{slug(h)}">{h}</h2>', 1)
toc = '<nav class="toc" aria-label="Contents"><p>Contents</p>' + ''.join(f'<a href="#{slug(h)}">{h}</a>' for h in heads) + '</nav>'

page = (ROOT / 'article/template.html').read_text().replace('{{BODY}}', body).replace('{{TOC}}', toc)
(ROOT / 'index.html').write_text(page)
print('wrote index.html')
