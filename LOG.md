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
