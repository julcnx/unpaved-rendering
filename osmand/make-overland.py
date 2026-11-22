#!/usr/bin/env python3
"""Writes overland.render.xml, Julien's off-road OsmAnd style (spec and merge: ../research/theme-merge.md).

An override-only style on OsmAnd's default (depends="default"): whatever is not here (labels, icons, POIs, night mode,
zooms below 12) comes from OsmAnd. No code is copied from another style.

One line is five strokes, each with its own colour attribute, transparent when its state does not apply:
  _0    paved edge (z12-13: the class colour around a dirt road, so the class is never lost)
  main  paved fill
  _2    dirt, solid, full width
  _3    class dots on dirt (z14 up)
  _4    forbidden, half width (z14 up)
Colours come from attributes; widths are written as numbers, because core-legacy mixes up "$" widths after "$" colours.

Usage: python3 make-overland.py   (writes overland.render.xml next to this file)
"""
from pathlib import Path

NULL = '#00000000'
EASY, HARD, FORBIDDEN, THIN_PAVED = '#94612f', '#2a1a0e', '#c8c4bc', '#a3a3a3'
# class: edge, fill, dot, width at z15, untagged surface. Tertiary dot lighter than the spec (#3aa39a is 5 from the
# trunk dot for protanopia, #5cc9be is 18).
CLASSES = {
    'motorway': ('#5a3f94', '#9a80cc', '#7a55b8', 16, 'paved'),
    'trunk': ('#8f2a3a', '#cf5566', '#f07c8a', 15, 'paved'),
    'primary': ('#b05a20', '#ec8a48', '#f59a4e', 14, 'paved'),
    'secondary': ('#a88a10', '#f5d64a', '#e6b800', 13, 'paved'),
    'tertiary': ('#2e7f78', '#6fbdb6', '#5cc9be', 12, 'paved'),
    'unclassified': ('#7d7d7d', '#ffffff', '#ffffff', 11, 'paved'),
    'residential': ('#8f8f8f', '#ffffff', '#ffffff', 6, 'paved'),
    'service': ('#a3a3a3', '#ffffff', None, 4, 'paved'),
    'track': ('#9a9a9a', '#ffffff', None, 6, 'easy'),
}
MAJOR = ('motorway', 'trunk', 'primary', 'secondary', 'tertiary')
LIKE_RESIDENTIAL = ('living_street', 'pedestrian', 'road')
DOT_SHARE = {'unclassified': 0.5, 'residential': 0.5}
SCALE = {12: 0.40, 13: 0.55, 14: 0.75, 15: 1.0}
EDGE = 1.5

# Values as OsmAnd's maps name them: earth is "ground", rock is "stone", tarmac is "asphalt", concrete:lanes is "concrete".
PAVED = ['asphalt', 'paved', 'concrete', 'chipseal', 'paving_stones', 'sett', 'cobblestone', 'metal']
DIRT = ['unpaved', 'gravel', 'compacted', 'fine_gravel', 'ground', 'dirt', 'sand', 'mud', 'stone', 'grass', 'grass;ground',
        'ground;grass', 'gravel;ground', 'clay', 'laterite', 'pebblestone', 'wood', 'grass_paver', 'salt', 'ice', 'snow']
PAVED_IF_SMOOTH = ['wood', 'grass_paver']

# "Hard from" setting. Unset = DEFAULT. Each test says from which settings it is hard (looser setting = fewer tests).
SETTINGS = ['bad', 'very_bad', 'horrible', 'very_horrible']
DEFAULT = 'horrible'  # Julien, 2026-11-22: horrible and worse black; very_bad and better, and surface=unpaved, brown
HARD_SURFACE = {'sand': ['bad', 'very_bad'], 'mud': ['bad', 'very_bad', 'horrible'], 'stone': ['bad', 'very_bad', 'horrible'],
                'ground': ['bad'], 'dirt': ['bad'], 'grass;ground': ['bad'], 'ground;grass': ['bad'], 'gravel;ground': ['bad']}
HARD_TRACKTYPE = {'grade1': [], 'grade2': [], 'grade3': ['bad'], 'grade4': ['bad', 'very_bad'], 'grade5': ['bad', 'very_bad', 'horrible']}
HARD_SMOOTHNESS = {'excellent': [], 'good': [], 'intermediate': [], 'bad': ['bad'], 'very_bad': ['bad', 'very_bad'],
                   'horrible': ['bad', 'very_bad', 'horrible'], 'very_horrible': SETTINGS, 'impassable': SETTINGS}

NO = ['no', 'private', 'agricultural', 'forestry', 'agricultural;forestry']
OPEN = ['yes', 'designated', 'permissive', 'destination', 'customers', 'delivery']
YES = ['yes', 'designated', 'permissive']
KEYS = ['motorcycle', 'motor_vehicle', 'vehicle', 'access']

out = []
def w(depth, s): out.append('\t' * depth + s)

def level(depth, tag, hard_in, e, h):
    """apply_if for one additional: easy or hard colour by the setting."""
    if e == h or not hard_in:
        w(depth, f'<apply_if additional="{tag}" attrColorValue="{e}"/>')
        return
    base = h if DEFAULT in hard_in else e
    flips = [s for s in SETTINGS if (s in hard_in) != (DEFAULT in hard_in)]
    if not flips:
        w(depth, f'<apply_if additional="{tag}" attrColorValue="{base}"/>')
        return
    w(depth, f'<apply_if additional="{tag}" attrColorValue="{base}">')
    for s in flips:
        w(depth + 1, f'<apply_if overlandHardFrom="{s}" attrColorValue="{h if s in hard_in else e}"/>')
    w(depth, '</apply_if>')

def dirt_tests(depth, e, h, surface=True):
    if surface:
        for v, hin in HARD_SURFACE.items(): level(depth, f'surface={v}', hin, e, h)
    for v, hin in HARD_TRACKTYPE.items(): level(depth, f'tracktype={v}', hin, e, h)
    for v, hin in HARD_SMOOTHNESS.items(): level(depth, f'smoothness={v}', hin, e, h)

def body(name, p, e, h, default):
    """Surface states: smoothness over tracktype over surface; tracktype never overrules a paved surface."""
    w(1, f'<renderingAttribute name="{name}">')
    w(2, '<switch>')
    for v in PAVED: w(3, f'<case additional="surface={v}"/>')
    w(3, f'<apply attrColorValue="{p}"/>')
    for v in ('very_bad', 'horrible', 'very_horrible', 'impassable'): level(3, f'smoothness={v}', HARD_SMOOTHNESS[v], e, h)
    w(2, '</switch>')
    w(2, '<switch>')
    for v in DIRT: w(3, f'<case additional="surface={v}"/>')
    w(3, f'<apply attrColorValue="{e}"/>')
    dirt_tests(3, e, h)
    for v in PAVED_IF_SMOOTH:
        w(3, f'<apply_if additional="surface={v}">')
        for s in ('excellent', 'good', 'intermediate', 'bad'): w(4, f'<apply_if additional="smoothness={s}" attrColorValue="{p}"/>')
        w(3, '</apply_if>')
    w(2, '</switch>')
    w(2, f'<case attrColorValue="{p if default == "paved" else e}">')
    w(3, f'<apply_if additional="tracktype=grade1" attrColorValue="{p}"/>')
    for v in ('grade2', 'grade3', 'grade4', 'grade5'): level(3, f'tracktype={v}', HARD_TRACKTYPE[v], e, h)
    for v, hin in HARD_SMOOTHNESS.items():
        if v in ('very_bad', 'horrible', 'very_horrible', 'impassable') or default == 'easy': level(3, f'smoothness={v}', hin, e, h)
    w(2, '</case>')
    w(1, '</renderingAttribute>')

def access(name, inner, forbidden, need_yes=False):
    """First key that answers decides. destination is not a no. Paths need a yes."""
    w(1, f'<renderingAttribute name="{name}">')
    w(2, f'<case additional="smoothness=impassable" attrColorValue="{forbidden}"/>')
    for k in KEYS:
        for v in NO: w(2, f'<case additional="{k}={v}" attrColorValue="{forbidden}"/>')
        for v in (YES if need_yes else OPEN): w(2, f'<case additional="{k}={v}" attrColorValue="{inner}"/>')
    w(2, f'<case attrColorValue="{forbidden if need_yes else inner}"/>')
    w(1, '</renderingAttribute>')

def num(x): return f'{x:.2f}'.rstrip('0').rstrip('.')

w(0, '<?xml version="1.0" encoding="utf-8"?>')
w(0, '<!-- Generated by make-overland.py: change the generator, not this file. -->')
w(0, '<renderingStyle name="Overland" depends="default" defaultColor="#fbfaf6" version="1">')
w(1, '<renderingProperty attr="overlandHardFrom" name="Hard from (smoothness)" description="From which smoothness a way is drawn as hard (near black): bad for cars, very_bad for big ADV and dual sport, horrible (default) for 4WD and enduro, very_horrible for dirt bikes" type="string" possibleValues="bad,very_bad,horrible,very_horrible" category="details"/>')
w(1, '<renderingProperty attr="overlandPower" name="Power lines" description="Show power lines and towers" type="boolean" possibleValues="" category="details"/>')
w(1, f'<renderingConstant name="null" value="{NULL}"/>')

w(1, '<!-- Land: near white, pale forest (kept from the earlier theme). Night: OsmAnd\'s own colours. -->')
for n, c in {'defaultColor': '#fbfaf6', 'woodColor': '#e2ebd8', 'forestColor': '#e2ebd8', 'grassColor': '#edf3e4', 'grasslandColor': '#edf3e4',
             'meadowColor': '#edf3e4', 'heathColor': '#edf3e4', 'farmColor': '#fbfaf6', 'landuseResidentialColor': '#f1f0ed', 'waterColor': '#a9cbe8',
             'contourLineColor': '#a7ad8c', 'contourLineColor50m': '#a7ad8c', 'contourLineColor100m': '#a7ad8c',
             **{f'{c}RoadColor': CLASSES[c][1] for c in MAJOR}}.items():
    w(1, f'<renderingAttribute name="{n}"><case nightMode="false" attrColorValue="{c}"/></renderingAttribute>')

for c, (edge, fill, dot, width, default) in CLASSES.items():
    thin = c not in MAJOR
    body(f'ov_{c}_edge_b', edge, NULL, NULL, default)
    low = fill if c in MAJOR else NULL if c == 'track' else edge
    # z12-13: class colour around dirt; under a narrow paved line (residential, service) nothing.
    body(f'ov_{c}_low_b', NULL if c in ('residential', 'service', 'track') else edge, low, low, default)
    body(f'ov_{c}_fill_b', fill, NULL, NULL, default)
    body(f'ov_{c}_dirt_b', NULL, EASY, HARD, default)
    if thin: body(f'ov_{c}_thin_b', THIN_PAVED, NULL, NULL, default)
    layers = ['edge', 'low', 'fill', 'dirt'] + (['thin'] if thin else [])
    if dot:
        body(f'ov_{c}_dot_b', NULL, dot, dot, default)
        layers.append('dot')
    for l in layers: access(f'ov_{c}_{l}', f'$ov_{c}_{l}_b', NULL)
access('ov_forbidden', NULL, FORBIDDEN)
body('ov_path_main_b', '#9a9a9a', EASY, HARD, 'easy')
body('ov_path_fill_b', '#ffffff', NULL, NULL, 'easy')
access('ov_path_main', '$ov_path_main_b', FORBIDDEN, need_yes=True)
access('ov_path_low', '$ov_path_main_b', NULL, need_yes=True)  # z13: forbidden hidden
access('ov_path_fill', '$ov_path_fill_b', NULL, need_yes=True)

LAYERS = [('layer="1"', 89), ('additional="layer=2"', 119), ('additional="layer=3"', 147), ('layer="-1"', 43), ('additional="layer=-2"', 19)]
w(1, '<order>')
w(2, '<!-- Smooth tracks above rough ones at junctions. -->')
w(2, '<case tag="highway" value="track" area="false" objectType="2" order="64">')
for v in ('tracktype=grade5', 'smoothness=horrible', 'smoothness=very_horrible'): w(3, f'<apply_if additional="{v}" order="63"/>')
for v in ['tracktype=grade1'] + [f'surface={p}' for p in PAVED]: w(3, f'<apply_if additional="{v}" order="65"/>')
for cond, o in LAYERS: w(3, f'<apply_if {cond} order="{o}"/>')
w(2, '</case>')
for v in ('path', 'bridleway'):
    w(2, f'<case tag="highway" value="{v}" area="false" objectType="2" order="62">')
    for cond, o in LAYERS: w(3, f'<apply_if {cond} order="{o}"/>')
    w(2, '</case>')
w(2, '<!-- Footways, cycleways and steps hidden unless a motorcycle may use them. -->')
for v in ('footway', 'cycleway', 'steps'):
    w(2, f'<case tag="highway" value="{v}" area="false" objectType="2" order="-1">')
    for y in YES: w(3, f'<apply_if additional="motorcycle={y}" order="62"/>')
    w(2, '</case>')
w(2, '<case tag="highway" value="service" additional="service=driveway" maxzoom="15" area="false" objectType="2" order="-1"/>')
w(2, '<case tag="highway" value="service" additional="service=parking_aisle" maxzoom="15" area="false" objectType="2" order="-1"/>')
w(2, '<!-- Gates at high zoom only; other barrier icons hidden. -->')
for v in ('gate', 'lift_gate', 'swing_gate', 'sliding_gate'):
    w(2, f'<case tag="barrier" value="{v}" point="true" objectType="1" maxzoom="16" order="-1"/>')
    w(2, f'<case tag="barrier" value="{v}" point="true" objectType="1" minzoom="17" order="128"/>')
w(2, '<case tag="barrier" value="" point="true" objectType="1" order="-1"/>')
w(2, '<!-- Power lines off by default. -->')
for v in ('line', 'minor_line', 'cable'): w(2, f'<case tag="power" value="{v}" objectType="2" order="-1"><apply_if overlandPower="true" minzoom="14" order="175"/></case>')
for v in ('tower', 'pole', 'portal'): w(2, f'<case tag="power" value="{v}" objectType="1" order="-1"><apply_if overlandPower="true" minzoom="15" order="128"/></case>')
w(1, '</order>')

w(1, '<polygon>')
w(2, '<switch nightMode="false">')
w(3, '<case minzoom="11" tag="natural" value="scrub" color="#edf3e4"/>')
for v in ('sand', 'beach', 'dune', 'shoal'): w(3, f'<case minzoom="9" tag="natural" value="{v}" color="#efe3c4"/>')
w(3, '<case minzoom="12" tag="natural" value="bare_rock" color="#efeeeb"/>')
w(3, '<case minzoom="12" tag="natural" value="scree" color="#efeeeb"/>')
w(2, '</switch>')
w(1, '</polygon>')

def zooms(z): return f'minzoom="{z}" maxzoom="{z}"' if z < 15 else 'minzoom="15"'

def road(depth, tag, c, factor=1.0, cond=''):
    edge, fill, dot, width, default = CLASSES[c]
    major = c in MAJOR
    for z, k in SCALE.items():
        if z == 12 and c in ('residential', 'service'): 
            w(depth, f'<case {zooms(z)} tag="highway" value="{tag}"{cond} strokeWidth="0"/>')
            continue
        W = width * factor * k
        if z < 14: W = max(W, 3 if major else (2 if c == 'track' else 1.6))
        a = [f'<case {zooms(z)} tag="highway" value="{tag}"{cond}']
        thin = not major and W < 3.5
        e = EDGE * (k if z < 15 else 1)
        if major and W < 4: e = 0
        # Paved: edge and fill, or one light grey line when narrow.
        if thin:
            a.append(f'color="$ov_{c}_thin" strokeWidth="{num(W)}" cap="ROUND"')
            if z < 14 and c != 'track': a.append(f'color_0="$ov_{c}_low" strokeWidth_0="{num(W)}" cap_0="BUTT"')
        else:
            a.append(f'color="$ov_{c}_fill" strokeWidth="{num(W - 2 * e)}" cap="ROUND"')
            a.append(f'color_0="$ov_{c}_{"low" if z < 14 else "edge"}" strokeWidth_0="{num(W)}" cap_0="BUTT"')
        # Dirt: full width; at z12-13 narrower on roads, so the class colour shows as an edge.
        D = W if (z >= 14 or c == 'track') else W - 2 * min(1.5, W * 0.22)
        a.append(f'color_2="$ov_{c}_dirt" strokeWidth_2="{num(D)}" cap_2="ROUND"')
        if dot and z >= 14: a.append(f'color_3="$ov_{c}_dot" strokeWidth_3="{num(W * DOT_SHARE.get(c, 0.55))}" pathEffect_3="1_40" cap_3="ROUND"')
        if z >= 14: a.append(f'color_4="$ov_forbidden" strokeWidth_4="{num(max(3 if z >= 15 else 2, W / 2))}" cap_4="ROUND"')
        w(depth, ' '.join(a) + '>')
        if z >= 14: w(depth + 1, f'<apply_if additional="bridge=yes" color__1="#555555" strokeWidth__1="{num(W + 2.5)}" cap__1="BUTT"/>')
        w(depth + 1, '<apply_if additional="tunnel=yes" pathEffect_0="4_3"/>')
        w(depth, '</case>')

def path(depth, tag, cond=''):
    for z, (width, fill, dash, inner) in {13: (1.6, 0, '10_4', None), 14: (2.4, 1.2, '10_4', '0_1_8_5'), 15: (3, 1.6, '12_3', '0_1_10_4')}.items():
        a = f'<case {zooms(z)} tag="highway" value="{tag}"{cond} color="$ov_path_{"low" if z == 13 else "main"}" strokeWidth="{num(width)}" pathEffect="{dash}" cap="BUTT"'
        if inner: a += f' color_2="$ov_path_fill" strokeWidth_2="{num(fill)}" pathEffect_2="{inner}" cap_2="BUTT"'
        w(depth, a + '/>')
    w(depth, f'<case minzoom="12" maxzoom="12" tag="highway" value="{tag}"{cond} strokeWidth="0"/>')

w(1, '<line>')
w(2, '<switch nightMode="false">')
w(3, '<!-- very_horrible tracks are drawn as single tracks. -->')
for z in (14, 15):
    w(3, f'<case {zooms(z)} tag="highway" value="track" additional="smoothness=very_horrible" color="$ov_path_vh" strokeWidth="{3 if z == 15 else 2.4}" pathEffect="{"12_3" if z == 15 else "10_4"}" cap="BUTT"/>')
w(3, '<!-- Driveways: forbidden look from z16. -->')
w(3, f'<case minzoom="16" tag="highway" value="service" additional="service=driveway" color="{FORBIDDEN}" strokeWidth="3" cap="ROUND"/>')
for c in CLASSES:
    road(3, c, c)
    if c in MAJOR: road(3, c + '_link', c, 0.7)
for t in LIKE_RESIDENTIAL: road(3, t, 'residential')
for t in ('path', 'bridleway', 'footway', 'cycleway', 'steps'): path(3, t)
w(3, '<!-- Water lines, railway, power. -->')
for t, col, ws in (('river', '#8fb8e0', {12: 1.2, 13: 1.8, 14: 2.5, 15: 3}), ('canal', '#8fb8e0', {12: 1.2, 13: 1.8, 14: 2.5, 15: 3}), ('stream', '#7fb0de', {13: 0.9, 14: 1.4, 15: 2})):
    for z, x in ws.items():
        w(3, f'<case {zooms(z)} tag="waterway" value="{t}" color="{col}" strokeWidth="{x}" cap="ROUND"><apply_if additional="intermittent=yes" pathEffect="8_5" cap="BUTT"/><apply_if additional="tunnel=yes" pathEffect="4_3" cap="BUTT"/></case>')
for t in ('rail', 'light_rail', 'narrow_gauge', 'preserved'):
    w(3, f'<case minzoom="12" tag="railway" value="{t}" color="#5f5f5f" strokeWidth="1.4" color_2="#5f5f5f" strokeWidth_2="5.5" pathEffect_2="1_12" cap_2="BUTT"><apply_if additional="tunnel=yes" pathEffect="4_3" color_2="$null"/></case>')
for t in ('line', 'minor_line'): w(3, f'<case minzoom="14" tag="power" value="{t}" color="#a9a1c4" strokeWidth="1"/>')
w(2, '</switch>')
w(1, '</line>')
w(0, '</renderingStyle>')

# very_horrible single track: hard, or forbidden by access. Inserted with the other attributes.
i = next(k for k, l in enumerate(out) if l.strip() == '<order>')
saved, out = out, []
access('ov_path_vh', HARD, FORBIDDEN)
saved[i:i] = out
Path(__file__).with_name('overland.render.xml').write_text('\n'.join(saved) + '\n')
print(len(saved), 'lines')
