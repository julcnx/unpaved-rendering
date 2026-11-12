# Reader test pictures, from the shots rendered by render.sh (phone frame, 2x pixels, Carto land background).
# Usage, from the repo root (served on :8765 for the shots):
#   node research/reader-test/pick-roads.mjs        -> labels.json (roads, positions, answer key)
#   sh research/reader-test/render.sh               -> shots, then this script
# Writes:
#   reader-test/img/<spot>-<style>.jpg   every place in every style, roads numbered (the web page rotates them)
#   reader-test/img/clarity-<style>.jpg  one place in every style, no numbers (the closing "clearest style" question)
#   reader-test/places.json              how many numbers each place has (no answers)
#   research/reader-test/picture-A.jpg ... E.jpg  one version with letters, for a post (PICTURES)
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SHOTS = ROOT / 'shots/reader-test'
PAGE = ROOT / 'reader-test/img'
DPR = 2  # shots are rendered at 2x; labels.json is in CSS px
BG = 'land'  # OSM Carto's plain land colour: the usual look of a map, no hillshade noise
STYLES = ['grain', 'centre-line', 'dashed-fill', 'dashed-casing', 'dashed-fill-full']
# The post version: picture order mixes places and styles, and neighbours do not share a pattern family.
PICTURES = {'A': ('bolivia', 'dashed-casing'), 'B': ('nepal', 'grain'), 'C': ('alberta', 'dashed-fill-full'),
            'D': ('namibia', 'centre-line'), 'E': ('australia', 'dashed-fill')}
FONT = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 15 * DPR, index=1)
BIG = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22 * DPR, index=1)
BLUE = '#1d4ed8'

labels = json.loads((HERE / 'labels.json').read_text())


def numbered(spot, style):
    im = Image.open(SHOTS / f'{spot}-{style}-{BG}-z{labels[spot]["zoom"]}.png').convert('RGB')
    d = ImageDraw.Draw(im)
    for r in labels[spot]['roads']:
        # The number sits beside the road, joined by a short line, so it does not hide the pattern.
        x, y, lx, ly = (v * DPR for v in (r['x'], r['y'], r['x'] + r['dx'], r['y'] + r['dy']))
        d.line([(x, y), (lx, ly)], fill=BLUE, width=2 * DPR)
        d.ellipse([x - 3 * DPR, y - 3 * DPR, x + 3 * DPR, y + 3 * DPR], fill=BLUE, outline='white', width=DPR)
        d.ellipse([lx - 12 * DPR, ly - 12 * DPR, lx + 12 * DPR, ly + 12 * DPR], fill=BLUE, outline='white', width=2 * DPR)
        d.text((lx, ly), str(r['n']), fill='white', font=FONT, anchor='mm')
    return im


PAGE.mkdir(parents=True, exist_ok=True)
for spot in labels:
    for style in STYLES:
        numbered(spot, style).save(PAGE / f'{spot}-{style}.jpg', quality=85)
for style in STYLES:
    Image.open(SHOTS / f'clarity-{style}.png').convert('RGB').save(PAGE / f'clarity-{style}.jpg', quality=85)
# The page only needs how many numbers each place has: the answer key stays out of the page source.
(PAGE.parent / 'places.json').write_text(json.dumps({spot: len(v['roads']) for spot, v in labels.items()}) + '\n')
print(f'{len(labels) * len(STYLES)} numbered and {len(STYLES)} clarity pictures in {PAGE.relative_to(ROOT)}')

for letter, (spot, style) in PICTURES.items():
    im = numbered(spot, style)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 40 * DPR, 34 * DPR], fill=BLUE)
    d.text((20 * DPR, 17 * DPR), letter, fill='white', font=BIG, anchor='mm')
    im.save(HERE / f'picture-{letter}.jpg', quality=85)
    unpaved = [r['n'] for r in labels[spot]['roads'] if r['unpaved']]
    print(f'picture-{letter}.jpg  {spot:10} {style:17} unpaved: {unpaved}')
