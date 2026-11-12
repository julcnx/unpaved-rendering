# Key image for the surface test spots: the OSM ways of a screenshot view, coloured by their surface tag,
# in the same frame as examples/screenshots (1200 x 800, centre = spot, web mercator).
# Usage: python3 -I research/tiles/surface-key.py <ways.geojsonseq> <lat> <lon> <zoom> <out.png>
import json, math, sys
from PIL import Image, ImageDraw

src, lat, lon, z, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
W, H = 1200, 800
def px(la, lo):
    n = 256 * 2 ** z
    return (lo + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(la))) / math.pi) / 2 * n
cx, cy = px(lat, lon)
COL = {'paved': '#555555', 'asphalt': '#555555', 'concrete': '#888888', '(none)': '#3b82f6',
       'unpaved': '#b45309', 'gravel': '#d97706', 'ground': '#92400e', 'dirt': '#92400e', 'compacted': '#f59e0b',
       'laterite': '#dc2626'}
img = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(img)
labels = []
for line in open(src):
    f = json.loads(line); p = f['properties']
    pts = [(x - cx + W / 2, y - cy + H / 2) for x, y in (px(la, lo) for lo, la in f['geometry']['coordinates'])]
    if all(not (0 <= x <= W and 0 <= y <= H) for x, y in pts): continue
    s = p.get('surface', '(none)')
    major = p['highway'] in ('trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential')
    d.line(pts, fill=COL.get(s, '#a21caf'), width=6 if major else 2)
    if major: labels.append((pts[len(pts) // 2], f"{p['highway']} {s}"))
for (x, y), t in labels:
    d.text((x + 6, y - 6), t, fill='black')
y = 10
for s, c in list(COL.items()) + [('other value', '#a21caf')]:
    d.rectangle([10, y, 30, y + 10], fill=c); d.text((36, y - 1), s, fill='black'); y += 16
img.save(out)
