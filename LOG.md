# Change log (screenshot loop)

## 2026-11-09: first version

- Four styles, as in the osm-wiki mockups: 1 Centre line, 3 Grain (OSM Carto), 5 Dashes (Americana), 6 Open gaps. Styles 2 (Brown fill) and 4 (Tint) were dropped in the mockups.
- First screenshots (Namibia, z15, white, sand, terrain, dark): all four styles show the paved/unpaved change on the C38. Tracks (thin, dashed, no casing) are not confused with any style.
- Problem found: in dark mode the paved primary fill (#7c6236) looks brown, which clashes with "brown means not paved". To fix in the colour tests.
- Terrain: hillshade works; Namibia is too flat to show contours, check on Nepal and Alberta.

## 2026-11-09: contours

- Nepal and Alberta on the terrain background: contours were full-strength brown (#c6a77f) and, in Nepal, competed with the brown unpaved signals. Now blended 45% into the land colour, as on usual topo maps. The brown of the styles must stay clearly darker or more saturated than contours: check in the colour tests.
- Terrain tiles stop at zoom 14, so at zoom 15+ contours are upscaled and look blocky. Acceptable for a demo background.

## 2026-11-09: styles from the mockups, chips, live loading anywhere

- Style values now come from the osm-wiki mockups: `make-mockups.ts` writes `mockups/styles.json`, `node scripts/sync-styles.mjs` copies it to `js/style-spec.js`. Light colours are the mockup ones (OSM Carto road colours, grain on a brownish fill, darker class-tint dashes, light brown on white roads). Dark colours stay ours until the colour tests.
- Styles renumbered 1-4 as in the mockups: centre line (lighter brown, 1 px on narrow roads), grain (1.5 x, big grain on top for Off-road), dashes (3:2 and 2:1 road widths), open gaps (36/8 px; Off-road 26/6/6/6 like the track dash-dot; darker casing on white roads).
- Style chips on the map, keys 1-4 and A (all side by side). Panel labels moved below the chips.
- Live Overpass anywhere: main roads from zoom 11 (0.2 degree cells), every highway from zoom 14 (0.02 degree cells). A saved spot only covers its own area, so panning away loads live data; before, a selected spot blocked live loading everywhere. Live loading also starts when the page opens on a place without a spot.
- Spot data will keep OSM way ids (`fetch-spots.mjs`); not refetched yet, Overpass at capacity on 2026-11-09.
- All styles side by side is now the default (`compare=0` in the URL for one style); the All chip and key A always return to it. In All mode the legend is a small table: one row per level, one sample per style, numbered like the panels.
- Labels on the realistic background: route numbers only (`ref` on trunk to tertiary), as small shields at a visible point of the road, overlapping ones skipped. Street names removed: they piled up over towns and hid the roads being compared. The loading message moved to the bottom of the map.
- Centre line in OSM Carto track rhythms: long dashes (Carto `tracktype=grade2`, 11, 4, scaled to 13, 5) for Unpaved, the track dash-dot (5, 4, 2, 4, scaled to 6, 5, 2.5, 5) for Off-road. The line stays inside the casing, so it does not read as a track beside the road (checked in the mockup references).
- Style 4 is now Dashed casing (replaces open gaps): continuous fill, dashed outline, as Gaia GPS draws tracks and DMD2 unpaved roads. Centre line and dashed casing share one track rhythm from the mockups: long dashes 15/6 for Unpaved, dash-dot 8/5/2.5/5 for Off-road (short dashes rejected for Off-road: a short-dashed casing reads as a tunnel).
- Style 3 (dashes) uses the same track rhythm as styles 1 and 4, scaled to the road width: long dashes Unpaved, dash-dot Off-road. Style 4 outline darker on red, orange and white roads (per-class `casing` in the spec).
- Style 3 reversed: the darker tint is the fill and the class colour is drawn in the rhythm on top, so the dash-dot of Off-road shows more dark than the long dashes of Unpaved (rougher looks darker).
- Off-road rhythm changed from the dash-dot to OSM Carto's `tracktype=grade4` rhythm (short dashes, longer gaps: 5.5/8), with Unpaved on `grade2` (15/6): rougher = more broken, as in Carto's track grades. The dash-dot means "no tracktype" (unknown) in Carto.
- Styles renumbered by preference (2026-11-09 ranking): 1 Centre line, 2 Dashed casing, 3 Grain, 4 Dashes. Chips, keys 1-4 and the side-by-side panels follow this order.
- Off-road rhythm: medium dashes (Carto `grade3`, 9/7), chosen by Julien as the ladder tracks will reuse later; `grade4` short sparse dashes read as dots.
- Style 4 (dashes) no longer reversed: dark tint drawn as the dashes, like the other line styles, so "more broken = rougher" holds everywhere.
- Styles renamed so each name says the signal and where it is drawn: 1 Dashed centre line, 2 Dashed casing, 3 Grain fill (no more "OSM Carto" in the name), 4 Dashed fill (key `dashed-fill`, was `dashes`). Screenshot script updated to the current four style keys.
- Ladder widened: Unpaved 22/6 (long dashes, short gaps), Off-road 8/9 (short dashes, longer gaps); 15/6 vs 9/7 looked too close.
- Styles reordered from faint to strong, with no preference (the right one depends on the provider): 1 Grain fill, 2 Dashed centre line, 3 Dashed fill (now in a centred band 60% of the road width, long dashes; full width below 6 px), 4 Dashed casing. Dash colours from the mockups (contrast 1.3, 1.4 on red and orange).
- Five styles from faint to strong: 1 Grain fill, 2 Dashed centre line, 3 Dashed fill (60% band), 4 Dashed casing, 5 Dashed fill full width (as Americana). Off-road is now the official tint version: the Unpaved pattern, only darker (darker fill in 1, 2, 4; darker dashes in 3, 5). Side by side shows three columns.
- Low zoom: below 6 px of road width every style draws a plain tint (lowTint Unpaved, offTint Off-road), measured in steps of contrast 1.2. Grain dots darker on yellow and white. Checked at Namibia z13 (primary 4.7 px).
- Style 5 (full width): lighter Unpaved dash (contrast 1.25 against the fill; white keeps the tan dash), since full width already covers most of the road.

## 2026-11-10: screenshot loop (5 styles side by side, 6 spots, white and terrain, z12/14/16)

- z12 (primary 3.2 px): every style is the plain tint, as intended. The step paved / Unpaved / Off-road is visible but subtle on thin roads; strongest on red and orange, weakest on yellow.
- z14 (6.8 px): patterns take over; the transition reads in all five styles at every spot. Nepal NH48 Off-road is clearly darker in all styles.
- z16 (14.6 px): all clear. Style 5 is the loudest, especially in towns (Bolivia, Namibia) where many minor unpaved roads get full-width dashes; style 3 (band) is calmer there.
- Wait in scripts/shots.mjs changed from network idle to a fixed delay (live Overpass loading kept the network busy).
- Yellow tints stronger for low zoom: lowTint #dfe389, offTint #c7ce31 (steps of contrast 1.25, were 1.2).
- Dark background uses the measured dark palette from the mockups (SPEC.dark): Off-road is the lighter step; primary more orange (no longer brown). Checked on Nepal NH48.
- Selected chip has a white ring (visible on dark maps); the empty side-by-side cell uses the land colour.

## 2026-11-10: demo feedback (grid, background chips)

- All styles grid: a sixth panel "No style (all paved)", the same map with no unpaved signal, as most maps today.
- The Style select in the panel is hidden in All mode (it changed nothing there).
- Backgrounds are chips at the bottom right of the map (the select is gone). With one style, an extra "All" chip shows every background side by side (`bg=all` in the URL), to see how the style fits each map. Not offered in All styles mode (too many panels).
- Backgrounds reordered: Hillshade before Dark, Dark last. Route number labels removed (only a few shields showed, they read as missing labels); the background is now "Hillshade, contours".

## 2026-11-10: mockup review (Off-road contrast, yellow tints, bends and junctions)

- Off-road in styles 2 and 4: the darker fill sat under a line or outline that kept its colour, so the rougher road had the fainter pattern (centre line 2.0 against the red Off-road fill, dashed outline 1.8 on white). The signal is now darker too: centre line `offColor` #5e4126 (3.6 to 5.4), outline `offCasing` per class (same contrast as on Unpaved). 
- Yellow tints moved from hue 63 to 58, same contrast steps: the dark steps read as olive green, a different class.
- Style 5 (full width): rhythm kept at 3.6 and 0.98 road widths. Wider gaps (2.4 and 1.2) were tried so short ways show a gap, and rejected: the blocks read as Carto construction, most of all on white roads (tan blocks, white gaps).
- New mockup `options-junction`: one road per class going Paved, Unpaved, Off-road through an S-bend, with a white Unpaved side road. Tunnel row of `references` now has style 4 next to it.
- Style 1 (grain): Off-road draws the same grain twice (second copy shifted), so the dots are twice as dense at the same size. The dots are already near black and could not get darker with the fill.
- Dark mode: on the lighter Off-road fill the centre line (`centreLineOff` #f2dcbc) and the dashed outline (`dark.offCasing`) are lighter too. The outline was 1.05 to 1.3 against the fill and vanished; now 1.7 to 2.1, as on Unpaved.
- `options-junction-forest` and `options-junction-sand`: the junction sheet on the demo's forest and sand backgrounds. Seen there: on sand the white Off-road tan was close to the land (1.27; 1.54 after the darker white tints below) and the low-zoom white Unpaved tint is nearly equal to it (1.06); on forest the yellow Off-road fill has the same luminance as the land (1.01), only hue and casing separate them.
- Colour-blind sheet redone with the new colours: `python3 mockups/check-colour-blindness.py sheet`.
- White roads with a tan tint as fill (low zoom, Off-road in styles 1 and 2) get a darker casing (`tintCasing` #8f8f8f, OSM Carto tertiary casing; #8f8f94 on dark). The light grey casing was 1.05 against the tan, so the road had no outline and nearly vanished on sand. Same casing for white Unpaved roads in style 5, where the tan dashes cover most of the road (seen in the demo, Namibia on sand).
- Yellow Off-road on forest left as is: the fill matches the land in luminance, but the casing (3.9 against the fill) and the hue keep the road clear on the forest sheet.
- Housekeeping: `scripts/sync-styles.mjs` now defaults to `research/mockups/styles.json` (was the old osm-wiki path); `research/mockups/svg2png.mjs` makes the PNGs (headless Chrome, 2 x).
- White Off-road tints darker and more saturated (`offTint` #cca979, 1.45 over the Unpaved tint; `offDash` #c18f46, 1.8 over the Unpaved dash; outline #575757): the two pale tans were hard to tell apart in styles 3 and 5 and at low zoom. Light mode only.

## 2026-11-10: screenshot loop, second run (after the mockup review)

90 shots: 6 spots x 5 backgrounds x z12, 14, 16, five styles side by side (`node scripts/shots.mjs --compare --zooms 12,14,16 --out shots/review-2026-11-10`). No page errors.

- z12 (plain tints): white Unpaved (tan) and white Off-road (darker tan) are now easy to tell apart (Bolivia). The step on orange stays the faintest (Namibia C38), as in the first run.
- z14: most white roads are still under 6 px, so they are the same plain tan in all five styles; the styles only differ on the main road. With the grey casing they read clearly against the white "No style" panel.
- z16: all five styles read at every spot on white, forest, sand and terrain. Style 5 stays the loudest in towns (Bolivia, Namibia).
- Sand: white unpaved roads no longer vanish, but at z12 they read as thin grey lines (the casing carries them, the tan fill is 1.06 against the land).
- Forest: nothing lost; yellow Off-road holds thanks to its casing.
- Terrain: a narrow white Unpaved road (tan, about 3 px) is close in colour to the contour lines (Australia, z16). The grey casing separates them, but it is the pair to watch if contours get stronger.
- Dark: Unpaved is faint in styles 1, 3 and 5 (dash 1.32 against the fill); styles 2 and 4 read well, Off-road reads in all five. Unchanged, dark stays low priority.


## 2026-11-10: Pai spot (Facebook post) and portrait shots

- New spot `pai` (Thailand, MS.4014 Pai to Wiang Haeng, 19.540403, 98.548539), cached once with `node scripts/fetch-spots.mjs pai` (187 ways). MS.4014 in the cache: about 24 km `surface=unpaved` + `smoothness=very_bad` (Unpaved with the Off-road mark), 6 km `concrete`, 2.5 km `paved`; no `laterite`. The `very_bad` explains why Gaia GPS draws it as a track.
- All-styles grid: a portrait map (taller than wide) now uses 2 columns x 3 rows instead of 3 x 2.
- `scripts/shots.mjs --portrait`: 1080 x 1350 (4:5, Facebook feed).
- Fix: `shots.mjs` without `--compare` took the all-styles grid anyway (the demo shows all styles unless `compare=0`); it now sets `compare=0`.
- Shots: `shots/pai-portrait/pai-centre-line-{white,terrain}-z14.png`, same frame as the app screenshots in `research/examples/screenshots/pai-z14-portrait/`. At z14 the five styles draw this road the same (plain tan tint), so one style is enough.
- `shots.mjs --center lat,lon`: shoot another view than the spot centre. All-styles Pai shots taken at 19.540403, 98.5635 (about 1.5 km east of the spot centre, ridge loop in the middle of each panel): `shots/pai-portrait/pai-all-{terrain,forest}-z{14,15}.png`.
- Fix: the map canvas is now absolutely positioned in `main`. Before, it kept the pixel ratio of its first frame: drawn with the sidebar (780 px wide), then stretched to 1080 px when the sidebar was hidden, it grew to 1869 px tall and the third row of the grid fell off the screenshot. Same issue for anyone resizing the window.
- Pai cache widened for portrait shots at zoom 13: optional `radius` per spot in `js/spots.js` (default 0.06), used by `fetch-spots.mjs`; `pai` has 0.12 (1530 ways). Full-frame shots of the 5 styles at Julien's view (19.54971, 98.53772, z13 and z13.04, terrain and forest): `shots/pai-portrait/pai-<style>-<bg>-z13*.png`.
