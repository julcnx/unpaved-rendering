# Reader test pictures: five places, one style each, no legend, roads numbered.
# Usage, from the repo root (served on :8765 for the shots):
#   node research/reader-test/pick-roads.mjs        -> labels.json (roads, positions, answer key)
#   render the shots: see README.md, "Rebuild"
#   python3 research/reader-test/make-images.py     -> picture-A.jpg ... picture-E.jpg
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
# Picture order mixes places and styles, and neighbours do not share a pattern family.
# White background for all: equal conditions, and no hillshade noise in the mountain spots.
PICTURES = {'A': ('bolivia', 'dashed-casing'), 'B': ('nepal', 'grain'), 'C': ('iceland', 'dashed-fill-full'),
            'D': ('namibia', 'centre-line'), 'E': ('australia', 'dashed-fill')}
FONT = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)
BIG = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 34)
BLUE = '#1d4ed8'

labels = json.loads((HERE / 'labels.json').read_text())
for letter, (spot, style) in PICTURES.items():
    z = labels[spot]['zoom']
    im = Image.open(ROOT / f'shots/reader-test/{spot}-{style}-white-z{z}.png').convert('RGB')
    d = ImageDraw.Draw(im)
    for r in labels[spot]['roads']:
        # The number sits beside the road, joined by a short line, so it does not hide the pattern.
        x, y, lx, ly = r['x'], r['y'], r['x'] + r['dx'], r['y'] + r['dy']
        d.line([(x, y), (lx, ly)], fill=BLUE, width=3)
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=BLUE, outline='white', width=2)
        d.ellipse([lx - 17, ly - 17, lx + 17, ly + 17], fill=BLUE, outline='white', width=3)
        d.text((lx, ly), str(r['n']), fill='white', font=FONT, anchor='mm')
    d.rectangle([0, 0, 66, 54], fill=BLUE)
    d.text((33, 27), letter, fill='white', font=BIG, anchor='mm')
    im.save(HERE / f'picture-{letter}.jpg', quality=88)
    unpaved = [r['n'] for r in labels[spot]['roads'] if r['unpaved']]
    print(f'picture-{letter}.jpg  {spot:10} {style:17} unpaved: {unpaved}')
