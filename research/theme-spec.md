# Overland: theme spec

The design system Julien finalised in a separate session (received 2026-11-22), kept as written. The changes he confirmed the same day come first and win over the text below. The style itself: [../osmand/](../osmand/). How it compares with the earlier theme: [theme-merge.md](theme-merge.md).

## Confirmed changes (Julien, 2026-11-22)

1. **Hard is a setting**, "Hard from (smoothness)": `bad` (cars), `very_bad`, `horrible` (4WD, **default**), `very_horrible` (dirt bikes). Default: `smoothness=horrible` and worse black; `very_bad` and better, and `surface=unpaved`, brown. It replaces the rider presets; the surface and tracktype lists of each preset go with its threshold.
2. **Untagged roads are paved**; only untagged tracks and paths are easy.
3. **Land stays near white with a pale forest**: open `#fbfaf6`, forest `#e2ebd8`, grass and scrub `#edf3e4`, farmland not drawn, residential `#f1f0ed`.
4. **Class never lost**: at z12 and z13, where there are no dots, dirt roads keep an edge in the class colour.
5. **Forbidden**: the first of `motorcycle`, `motor_vehicle`, `vehicle`, `access` that answers; no, private, agricultural and forestry forbid, `destination` does not; paths need a yes (yes, designated, permissive).
6. **Tertiary dot** `#5cc9be` (the spec's `#3aa39a` is the trunk dot's twin for protanopia).
7. **Gates** at high zoom only (z17); other barriers hidden.
8. **`surface=unpaved` is easy** in every setting; so is any other unpaved value not listed.
9. Kept from the earlier theme: service roads (thin, driveways grey from z16), footways and cycleways hidden, `very_horrible` tracks as single tracks, `impassable` as forbidden, broken pavement as dirt, smooth tracks drawn above rough ones.

## Goal

Off-road theme for motorcycle and 4WD riders, readable without a legend. Dirt is the strongest signal at every road class; paved roads stay calm.

## Core rules (apply to every way type)

1. White or class colour = paved.
2. Solid surface colour at the way's normal width = unpaved. Only two unpaved levels: brown = easy, near-black = hard.
3. Way type is shown by shape: class dots = road, plain line = track, dashes = path.
4. Pale grey, thin, no edge or dots = forbidden / ignore.

## Surface colours

- Easy unpaved: `#94612f`
- Hard unpaved: `#2a1a0e`
- Forbidden: `#c8c4bc` (flat line at about 50% of the way's width, min 3px; paths dashed)
- Unknown surface: no special style. Use the class default: motorway to tertiary = paved, unclassified and smaller = easy (brown). (Changed: see 2 above.)

## Major roads

Paved edge / paved fill / dot colour on dirt / width at z15:

| Class | Edge | Fill | Dot | Width |
|---|---|---|---|---|
| Motorway | `#5a3f94` | `#9a80cc` | `#7a55b8` | 16 |
| Trunk | `#8f2a3a` | `#cf5566` | `#f07c8a` | 15 |
| Primary | `#b05a20` | `#ec8a48` | `#f59a4e` | 14 |
| Secondary | `#a88a10` | `#f5d64a` | `#e6b800` | 13 |
| Tertiary | `#2e7f78` | `#6fbdb6` | `#3aa39a` (changed: see 6) | 12 |

Paved: 1.5px darker edge, class fill inside. Unpaved: solid surface colour at class width + round class-colour dots, diameter about 55% of road width, every 40px. Paved fills are deliberately toned down about 20% so dirt dominates; dots stay saturated so they read on brown and black.

## Minor roads and small ways

- Unclassified (11px): paved = white, edge `#7d7d7d`. Unpaved = surface colour + white dots (about 50% width, every 40px).
- Residential (6px): paved = white, edge `#8f8f8f`. Unpaved = surface colour + white dots.
- Track (6px, same as residential because tracks are the focus): paved = white, edge `#9a9a9a`. Unpaved = solid surface colour, NO dots (dots or no dots is what separates residential from track).
- Path (3px): dash 12 on / 3 off. Paved = short white dashes, each with its own grey `#9a9a9a` edge (grey 12/3, white 10/5 offset 1), transparent gaps. Unpaved = dashed surface colour.

## Rider presets for easy against hard (user setting; changed: see 1)

- Car / big ADV: easy = gravel, compacted, fine_gravel, grade1-2. Hard = dirt, ground, earth, sand, mud, grade3+, smoothness bad or worse.
- Dual sport (default): easy = gravel, dirt, ground, grade1-3. Hard = sand, mud, rock, grade4-5, smoothness very_bad or worse.
- Enduro / 4WD: hard only = rock, mud, grade5, smoothness horrible or worse.

Smoothness overrides surface where tagged.

## Context layers (defaults)

| Layer | Default | Design |
|---|---|---|
| Water | on | lakes `#a9cbe8`, rivers `#8fb8e0`, streams `#7fb0de` 2px; fords as icon |
| Contours | on | thin grey-olive `#a7ad8c`, 0.8px, every third 1.4px; must not be brown |
| Sand (`natural=sand`, river bars) | on | `#efe3c4` with a sparse `#cdb98c` dot pattern (plain fill acceptable) |
| Railway | on | `#5f5f5f` 1.4px line with cross-ticks (5.5px wide, 1 on / 12 off) |
| Power lines | off | if on: `#a9a1c4` 1px with `#8d84ad` tower dots |
| Gates, barriers | icons on | (changed: see 7) |
| International borders | on | |
| Land | | open `#eef0e6`, forest `#c9ddb2`, farmland `#e9e3cf`, residential `#e4dfdc` (changed: see 3) |

## Low zoom rules

- z15+: 100% widths, dots every 40px, paths 12/3.
- z14: 75% widths, dots kept, paths 10/4.
- z13: 55% widths (min 3px major, 1.6px minor), no dots, paths 10/4 thin, forbidden hidden.
- z12: 40% widths (same minimums), no dots; residential, paths and forbidden hidden; tracks kept at min 2px.
- Paved white road narrower than 3.5px: single light grey line `#a3a3a3`.
- Paved major road narrower than 4px: drop the edge, fill only.

## Colour-blind check

As written: "Palette above is already the fixed version (simulated protan, deutan, tritan). Core paved/easy/hard signal works for all types because it relies on lightness. Forbidden is intentionally low contrast; if too faint on device, try `#b9b4ab`." Rechecked 2026-11-22: the core signal holds; the class dots did not all pass ([theme-merge.md](theme-merge.md) section 5).

## Decided against (don't reintroduce without asking)

- Survey/unknown mode: removed, pink clashed with trunk. Use an Overpass/JOSM filter for mapping instead.
- Three unpaved levels (olive/sand): too many colours; replaced by two levels + presets.
- Faded forbidden: looked like an invitation to ride.
- Slate for paved: unnecessary once small ways use white + grey edge.
- Full-width dashes, centre stripe, cross bars: class competes with dirt.
- Light yellow anywhere.

## OsmAnd implementation notes / risks

- Dots = dash with about 1px length (not 0) + round cap, gap 40. Verify the renderer draws them.
- Dash patterns restart at each way; expect uneven dot spacing on fragmented ways.
- Fallback if dots fail: short class-colour strips along the centre (about 45% width, 10 on / 30 off, butt caps). Visually very close, plain dash pattern.
- Paved path needs two aligned dash layers with a 1px offset; if offsets aren't supported, use the same pattern on both layers (edge on sides only, open ends).

What the renderer actually does: [theme-merge.md](theme-merge.md) section 7.

## Still open

1. Device test in OsmAnd on a busy Chiang Mai area with labels and POIs.
2. Night palette (brown, near-black and dark greys need light equivalents).
3. Confirm exact OsmAnd rendering-property syntax for the preset setting and layer limits.
