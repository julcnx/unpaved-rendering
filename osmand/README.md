# Overland: OsmAnd style

Off-road style for motorcycle and 4WD riders. Spec: [../research/theme-spec.md](../research/theme-spec.md); how it was merged with the earlier theme: [../research/theme-merge.md](../research/theme-merge.md).

- [overland.render.xml](overland.render.xml): the style, an override on OsmAnd's default (`depends="default"`). Generated: change [make-overland.py](make-overland.py), not the XML. No code copied from another style.
- [render-test.sh](render-test.sh): generates and renders [test.gpx](test.gpx) (from [test.gpx.py](test.gpx.py)) with `~/Workspaces/OSM/osmand-render` into `out/` (not in git).
- [preview.png](preview.png): some of the results.

## Settings

Default: `smoothness=horrible` and worse black; `very_bad` and better, and `surface=unpaved`, brown (Julien, 2026-11-22).

| Hard from (smoothness) | Also hard by tracktype | Also hard by surface |
|---|---|---|
| `bad` (cars) | grade3 to 5 | sand, mud, rock, dirt, ground |
| `very_bad` (big ADV, dual sport) | grade4, 5 | sand, mud, rock |
| `horrible` (4WD, enduro), **default** | grade5 | mud, rock |
| `very_horrible` (dirt bikes) | none | none |

`smoothness` wins over `tracktype`, which wins over `surface`. The last row is extrapolated: the spec stops at Enduro / 4WD. Power lines: off by default, a second setting.

## Checked (core-legacy on a Mac, 2026-11-22)

Views in Thailand, Namibia and Luxembourg, z12 to z15: dots, solid dirt, forbidden, class edge at z13, the four settings (black pixels at Phuket z15, strictest first: 15,932, 7,130, 5,576, 16; Chiang Rai, where the roads are `very_bad`: 9,613, 9,613, 0, 0), power switch, night falling back to OsmAnd's own colours, broken asphalt drawn as dirt (road 1334).

## Known limits

- Not tested on a phone, nor in the OpenGL renderer. Size 470 KB: speed on a phone unknown.
- No `surface` in OsmAnd's maps at z12, no access tags either: at z12 dirt comes from `tracktype` only, and closed tracks look open.
- `4wd_only` cannot be drawn (routing only).
- Spikes at sharp bends of wide lines, worst at z12 to z14 (no round joins). Thin seams where the edges of two paved roads cross.
- Towns are heavy at z13: residential streets are 3.3 wide in `#a3a3a3`, as in the spec.
- Contours: colour only (widths are OsmAnd's setting); not tested, no contour file here. Gate icon not in the test rig. Towers use OsmAnd's icon. Sand is a plain fill, not tested (no sand in the views).
- Parks, cemeteries, admin boundaries and construction keep OsmAnd's default look.
- Night: OsmAnd's default roads, dirt not marked.
