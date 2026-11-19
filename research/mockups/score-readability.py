# Readability score of the fork palettes (2026-11-19): Now (OSM Carto based) and High vis (HIVIS in
# make-fork-crops.mjs), with AdvOSM (Garmin) as a reference where a measure applies (colours sampled from
# examples/advosm/tanzania-advosm.jpg: red #e00000, orange #f09010, unpaved yellow #f0f030 with black dashes, white land).
# Each measure is mapped to 0-10 between a floor (0) and a target (10); the score is their mean.
# Colour distance: CIE76 Delta E in Lab; colour blindness: Machado et al. 2009 at severity 1, worst of the three.
# Usage (from research/): python3 mockups/score-readability.py
import numpy as np

lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
srgb = lambda c: np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, 1), 1 / 2.4) - 0.055)
h = lambda x: np.array([int(x[i:i + 2], 16) / 255 for i in (1, 3, 5)])
M = {
    'protanopia': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'deuteranopia': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'tritanopia': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}
sim = lambda rgb, m: srgb(np.clip(lin(rgb) @ np.array(m).T, 0, 1))
def lum(rgb): l = lin(rgb); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
def cr(a, b): x, y = sorted([lum(a), lum(b)]); return (y + 0.05) / (x + 0.05)
def lab(rgb):
    l = lin(rgb) @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T
    l = l / np.array([0.95047, 1, 1.08883])
    f = np.where(l > 0.008856, np.cbrt(l), 7.787 * l + 16 / 116)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])
de = lambda a, b: float(np.linalg.norm(lab(a) - lab(b)))
def de_cb(a, b): return min([de(a, b)] + [de(sim(a, m), sim(b, m)) for m in M.values()])

LAND = h('#f2efe9')
RAMP = [h('#b0773a'), h('#74481f'), h('#2b190c')]
RUST = [h('#b0773a'), h('#7a3a14'), h('#2b190c')]
P = {
    'Now': dict(land=LAND, fills=[h('#f9b29c'), h('#fcd6a4'), h('#f7fabf'), h('#ffffff')], band=h('#b0773a'), edge=None,
                minor_w=4.5, track_w=2.5, shields=False),
    'High vis': dict(land=LAND, fills=[h('#e8503a'), h('#f39c26'), h('#f4e04a'), h('#ffffff')], band=h('#b0773a'), edge=h('#2b190c'),
                     minor_w=4.5 * 1.5, track_w=2.5 * 1.5, shields=True),
    # Candidate after the first score: crimson-rose trunk and a deeper orange primary, so red-green colour-blind riders
    # can tell the trunk from the brown Unpaved track (Delta E 7.5 with #e8503a) and the primary from the secondary.
    'High vis 2': dict(land=LAND, fills=[h('#d6336c'), h('#ef8a1f'), h('#f4e04a'), h('#ffffff')], band=h('#b0773a'), edge=h('#3d3d3d'),
                       minor_w=4.5 * 1.5, track_w=2.5 * 1.5, shields=True),
    # High vis 2 with the rust middle step (2026-11-19).
    'High vis 2 + rust': dict(land=LAND, fills=[h('#d6336c'), h('#ef8a1f'), h('#f4e04a'), h('#ffffff')], band=h('#b0773a'), edge=h('#3d3d3d'),
                              minor_w=4.5 * 1.5, track_w=2.5 * 1.5, shields=True, ramp=RUST),
    'AdvOSM (ref.)': dict(land=h('#ffffff'), fills=[h('#e00000'), h('#f09010'), h('#f0f030')], band=None, edge=h('#000000'),
                          minor_w=None, track_w=None, shields=True),
}

def score(v, floor, target): return float(np.clip((v - floor) / (target - floor) * 10, 0, 10))
rows = []
for name, p in P.items():
    f = p['fills']
    m = {}
    # 1. Coloured fills against the land (luminance contrast, mean of trunk, primary, secondary): floor 1, target 3.
    m['Fill contrast'] = (np.mean([cr(c, p['land']) for c in f[:3]]), 1, 3)
    # 2. Class separation, worst pair among the class fills, worst of normal and the three simulations: floor 5, target 30.
    m['Class separation (colour-blind)'] = (min(de_cb(a, b) for i, a in enumerate(f) for b in f[i + 1:]), 5, 30)
    # 3. Dirt signal inside a road: the band (or its edge) against each coloured fill, worst case: floor 1, target 3.
    sig = p['edge'] if p['edge'] is not None else p['band']
    m['Dirt signal in roads'] = (min(cr(sig, c) for c in f[:3]), 1, 3)
    # 4. Tracks apart from roads: brown ramp against every class fill, worst pair, colour-blind: floor 5, target 30.
    if name != 'AdvOSM (ref.)':
        ramp = p.get('ramp', RAMP)
        m['Tracks apart from roads'] = (min(de_cb(r, c) for r in ramp for c in f), 5, 30)
        # 4b. Ramp steps apart from each other (worst adjacent pair, colour-blind): floor 10, target 30.
        m['Ramp steps apart'] = (min(de_cb(ramp[i], ramp[i + 1]) for i in range(2)), 10, 30)
    # 5. Line width on screen at density 2 (px): minor road, floor 6, target 14; track floor 4, target 9.
    if p['minor_w']:
        m['Minor road width (px)'] = (p['minor_w'] * 2, 6, 14)
        m['Track width (px)'] = (p['track_w'] * 2, 4, 9)
    # 6. Road numbers.
    m['Road numbers'] = (10 if p['shields'] else 0, 0, 10)
    rows.append((name, m))

measures = list(dict.fromkeys(k for _, m in rows for k in m))
print('| Measure (floor -> target) | ' + ' | '.join(n for n, _ in rows) + ' |')
print('|---|' + '---|' * len(rows))
for k in measures:
    fl = next(m[k] for _, m in rows if k in m)
    cells = []
    for _, m in rows:
        if k not in m: cells.append('n/a'); continue
        v, a, b = m[k]
        cells.append(f'{score(v, a, b):.1f} ({v:.2f})' if k != 'Road numbers' else ('10 (yes)' if v else '0 (no)'))
    print(f'| {k} ({fl[1]} -> {fl[2]}) | ' + ' | '.join(cells) + ' |')
print('| **Score (mean)** | ' + ' | '.join(f'**{np.mean([score(*m[k]) for k in m]):.1f}**' for _, m in rows) + ' |')
