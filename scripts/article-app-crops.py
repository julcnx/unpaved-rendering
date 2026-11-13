# Crops of six apps at the Namibia C38 junction (Namutoni) for the article, registered so they share one frame.
# Usage: python3 scripts/article-app-crops.py   -> article/img/app-<app>.png
# Each app has its own zoom convention and centre (Komoot and Americana use 512 px tiles, Komoot has a sidebar offset),
# so a plain centre crop does not line up. Two landmarks are read on each screenshot: J, the C38 junction at the
# Namutoni gate, and K, the bend where the paved leg turns east. Each screenshot is scaled so J-K is the same length,
# then cropped with J at the same point.
# Komoot and Americana come from the zoom 14 shots (screenshots/namibia-z14): their 14 shows the scale of the others' 15.
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'research/examples/screenshots'
LANDMARKS = {  # app: (screenshot, J, K) in pixels of the 1200 x 800 screenshot, read on a 50 px grid (2026-11-11)
    'americana': ('namibia-z14/americana.png', (600, 400), (712, 598)),
    'dmd2': ('namibia/dmd2.png', (600, 400), (700, 558)),
    'komoot': ('namibia-z14/komoot.png', (818, 398), (935, 598)),
    'mapy-com': ('namibia/mapy-com.png', (400, 400), (515, 600)),
    'humanitarian': ('namibia/humanitarian.png', (600, 400), (722, 600)),
    'ridewithgps': ('namibia/ridewithgps.png', (598, 330), (712, 545)),
    # OsmAnd Motorcycle style, desktop render (research/examples/osmand-desktop.sh); landmarks read on the paved red leg
    'osmand-motorcycle': ('namibia/osmand-desktop-enduro.png', (600, 400), (716, 598)),
}
W, H = 640, 400        # output frame
JX, JY = 300, 110      # where J lands in it
LENGTH = 300           # J-K length in the output

for app, (src, j, k) in LANDMARKS.items():
    im = Image.open(SRC / src).convert('RGB')
    f = LENGTH / math.dist(j, k)
    big = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    x0, y0 = round(j[0] * f - JX), round(j[1] * f - JY)
    assert x0 >= 0 and y0 >= 0 and x0 + W <= big.width and y0 + H <= big.height, f'{app}: frame outside the screenshot'
    big.crop((x0, y0, x0 + W, y0 + H)).save(ROOT / f'article/img/app-{app}.png')
    print(f'{app}: scale {f:.2f}')
