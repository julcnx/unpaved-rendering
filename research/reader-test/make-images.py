# Reader test images: the Namutoni frame in three styles, no legend, six roads numbered.
# Usage: render the shots first (repo served on :8765):
#   node scripts/shots.mjs --spots namibia --styles grain,dashed-fill,dashed-casing --bgs terrain --zooms 16 \
#     --size 1600x900 --center -18.81068,16.9329 --attribution --out shots/reader-test
# then: python3 research/reader-test/make-images.py   -> research/reader-test/picture-{A,B,C}.jpg
# Road positions come from candidates.mjs (same frame and projection). The answer key is in README.md.
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
# Picture letters do not follow the style numbers, so readers are not primed by the order.
PICTURES = {'A': 'dashed-casing', 'B': 'grain', 'C': 'dashed-fill'}
# number: (x, y) on the road in the 1600 x 900 frame, and where the label sits relative to it (away from other lines)
LABELS = {1: ((939, 550), (-34, -34)), 2: ((1298, 254), (-44, -14)), 3: ((1349, 503), (30, -36)),
          4: ((1291, 619), (40, -12)), 5: ((1037, 335), (-30, -38)), 6: ((1200, 185), (-40, -20))}
FONT = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)

for letter, style in PICTURES.items():
    im = Image.open(ROOT / f'shots/reader-test/namibia-{style}-terrain-z16.png').convert('RGB')
    d = ImageDraw.Draw(im)
    for n, ((x, y), (dx, dy)) in LABELS.items():
        # The number sits beside the road, joined by a short line, so it does not hide the pattern.
        lx, ly = x + dx, y + dy
        d.line([(x, y), (lx, ly)], fill='#1d4ed8', width=3)
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill='#1d4ed8', outline='white', width=2)
        d.ellipse([lx - 17, ly - 17, lx + 17, ly + 17], fill='#1d4ed8', outline='white', width=3)
        d.text((lx, ly), str(n), fill='white', font=FONT, anchor='mm')
    d.rectangle([0, 0, 66, 54], fill='#1d4ed8')
    d.text((33, 27), letter, fill='white', font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 34), anchor='mm')
    im.save(OUT / f'picture-{letter}.jpg', quality=88)
    print(f'picture-{letter}.jpg ({style})')
