# Zoom strip for the article: one style at zoom 13, 14 and 16 at Namutoni, centre half of each demo shot.
# Usage: first render the shots (repo served on :8765):
#   node scripts/shots.mjs --spots namibia --styles dashed-fill --bgs terrain --zooms 13,14,16 --size 840x588 \
#     --center -18.81068,16.9375 --attribution --out shots/fig-zoom
# then: python3 scripts/article-zoom-strip.py   -> article/img/zoom-<z>.jpg
# Style 3 (dashed fill) shows the clearest step from the low-zoom tint to the pattern; style 4's thin outline barely
# changed between 13 and 14 at this size (2026-11-11).
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STYLE = 'dashed-fill'
for z in (13, 14, 16):
    im = Image.open(ROOT / f'shots/fig-zoom/namibia-{STYLE}-terrain-z{z}.png').convert('RGB')
    w, h = im.size
    im.crop((w // 4, h // 4, w // 4 + w // 2, h // 4 + h // 2)).save(ROOT / f'article/img/zoom-{z}.jpg', quality=88)
    print(f'zoom-{z}.jpg')
