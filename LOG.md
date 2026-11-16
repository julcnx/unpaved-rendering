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

## 2026-11-11: article hero, Namibia C48

- New spot `c48` (Namibia C48, primary, -18.128047, 21.644354): the asphalt way w56321265 meets the gravel way w254738450 exactly there. Photo pair `transition-na-9` (tallguy, Mapillary 2019). Cached with `node scripts/fetch-spots.mjs c48` (553 ways).
- Hero mockup: full-width Komoot map of the C48 with the asphalt and gravel photos placed on each side of the road, pins A and B, "asphalt ends here" at the centre; below it a Today / Proposed slider in the same frame (style 4, white). North up, no rotation.
- Komoot does not centre the URL point: its hidden sidebar draws it about 227 px right of centre, and it uses 512 px tiles (Komoot z15 = demo z16). For a frame centred on the point, shift the longitude by 227 x 360 / (512 x 2^z) degrees: `SIZE=1600x900 CENTER=-18.128047,21.646789 ZOOM=16 APPS=komoot node examples/screenshots.ts c48`, with the demo at `node scripts/shots.mjs --spots c48 --zooms 17 --size 1600x900`. Checked by overlaying both: the lines match and the dashes start at the centre.
- New options: `SIZE` and `CENTER` in `research/examples/screenshots.ts`, `--size` in `scripts/shots.mjs`.
- "No style (all paved)" is now a style of its own in the demo (`style=none`, chip "No style", key 0), not only a panel of the all-styles grid: needed for Today / Proposed figures from the same renderer.
- `embed=1`: map only, for an iframe in the article (no sidebar; a "Click to explore the map" shield takes the first click, so scrolling the page never pans the map).
- Article "What the proposal looks like": a slider at Namibia C38 (Namutoni), hillshade, z16, `--center -18.81068,16.9329` (moved west so the unpaved C38 and D3646 cross the middle of the frame), No style vs style 4. The Komoot hero stays the problem picture: a proposal drawn by the demo next to Komoot did not match (other width, background, labels).
- Embed mode is now one large map: only the five style chips (no "No style": the slider above it already shows today vs proposed; no "All"), no key hints, the `0` and `A` keys do nothing; all five backgrounds stay. The all-styles grid stays in the full demo and becomes a static 2 x 3 image in the article.
- Fix: a hillshade shot had a blank block (one elevation tile still loading after the fixed 3 s wait). The map now counts loading tiles (`window.terrainPending`) and `scripts/shots.mjs` waits for 0 on the terrain background. Namibia slider pair re-shot.

## 2026-11-11: zoom without crawling patterns, C48 still unpaved

- Demo: during a zoom gesture the dashes (roads and tracks) and the grain scale with the map from the zoom where the gesture started, so they no longer crawl along the roads; 300 ms after the last wheel step they are redrawn at their normal size. The grain is also anchored to map coordinates instead of the canvas corner, so it no longer swims under the roads when panning. Checked with headless Chrome: a frame taken mid-zoom matches the start frame enlarged (dashes in place; only the road width differs, by design).
- Tests: the right command is `node --test test/classify.test.js` (67 pass); `node --test test/` fails to start, which an earlier check missed.
- C48 hero: Google Street View, June 2024, shows the asphalt still ending at the same point and the road unpaved beyond it. The hero credit is dated (photos 2019, map November 2026).
- Article: "I" instead of "we", byline julcnx, section 6 starts from design principles, explicit answers to "tagging for the renderer", "Carto already does this" and "unpaved is fine in Finland".

## 2026-11-11: site in the repo

- The article is now the site's home page: `index.html`, built from `article.md` and `article/template.html` by `scripts/build-article.py` (`npm run build`). The demo moved to `demo/index.html`; `js/app.js` loads `data/` relative to itself, so the demo works from any page path. `scripts/shots.mjs` opens `/demo/`.
- Figures (all with a phone layout): hero (Komoot C48, landscape and portrait frames), unpaved share by class as a shaded table (11 countries and Denmark, one brown hue, number in every cell), photo grid (12 countries; Chile's 360° photo swapped for Guatemala), six apps at the Namutoni junction in three groups, Today / Proposed slider, live demo iframe, the five styles grid (landscape and portrait), zoom strip.
- Zoom strip: zoom 13, 14 and 16, each the centre half of an 840 x 588 shot shown full width, so the low-zoom tint is readable (the full frame at text width was too small). Zoom 12 dropped: its frame is wider than the cached spot data.
- Images in `article/img/` come from `research/examples/images/mapillary/`, `research/examples/screenshots/` and the demo shots (`shots/fig-grid*`, `shots/fig-zoom`, `shots/namibia-fig-w`, not committed).
- App comparison crops are now registered (`scripts/article-app-crops.py`): two C38 landmarks per screenshot (the Namutoni junction and the bend of the paved leg), scaled to the same length and cropped with the junction at the same point. Plain centre crops did not line up (Komoot and Americana use 512 px tiles; Komoot has its sidebar offset). Komoot and Americana retaken at zoom 14 (`screenshots/namibia-z14/`), which matches the others' zoom 15.
- Photo grid: Georgia Sh10 frame `-2` (frame `-0` looked like broken concrete), Morocco RR704 instead of RN23 (under works in 2022, possibly paved now). Both noted in the image review.
- Zoom strip in style 3 (dashed fill) instead of style 4: style 4's thin dashed outline barely changed between zoom 13 and 14 at figure size; style 3 goes clearly from tint (13) to a dashed band (14) to strong dashes (16). Crops: `scripts/article-zoom-strip.py`.

## 2026-11-11: App reports page, Data and methods, Last updated

- New page `apps/` (from `apps.md`, same template): one row per app in the article's groups (show it and keep the class, partly, lose the class, do not show it), with open source, what it shows on main roads, what its data carries, how it draws tracks, and where to ask; plus the tile schemas. Written for app makers to read their own row: facts only, "to check" where not verified.
- No Evidence page: the article's "Data and methods" section links to the generated key numbers, the full report, the image review and the classifier on GitHub.
- Both pages show "Last updated", from the last commit of their Markdown (today when it has uncommitted changes).
- `research/B-communities.md` (private outreach notes: mapper names and private replies) untracked and ignored; it stays local. Links to it removed from the public files. Still in the public git history until purged.

## 2026-11-11: article review 2

- Section 6: when each style fits; figures interleaved with the text (zoom strip next to "Quiet at low zoom"); the static 2 x 3 grid is off the web page (kept in `article/img/` for the diary and the forum post).
- How to help: a four-step checklist for map makers, and "What happens next" (forum thread, then one request per app).
- Honesty: official figures also count rural tracks (part of the OSM gap is definition); Limits now says the styles are untested with readers and not yet in a real app.
- Numbers in prose rounded; exact values stay in the tables and key-numbers.
- Link previews: `og:` and `twitter:` tags with `article/img/og.jpg`, the hero captured at 1200 x 630.

## 2026-11-11: map makers' box, classifier ports, reader test kit

- Article: a short box for map makers under the opening (what to change, what it costs, where to start); the checklist and Data and methods link the Lua (osm2pgsql flex, tilemaker), SQL and JavaScript classifiers. The Lua port passes the 67 shared test cases (`node --test classifier/classify.test.ts classifier/ports.test.ts` in research/, luajit); the SQL test needs a database.
- App reports: "Where the classifier goes", per open-source map.
- `research/reader-test/`: five pictures (A to E), each a different place in one of the five styles; white background, no legend, six roads numbered, three or four unpaved per picture (the first version, one map in three styles, let readers carry answers over; a control with no style was dropped: a picture where nothing can be seen as unpaved made no sense to answer). Roads picked by `pick-roads.mjs` (clear of other lines, apart from each other); answer key from `labels.json`. Alberta dropped (one main road in its frame); Nepal at zoom 15 on a frame 3 km south of the spot centre (`find-frame.mjs`). Result to go into section 6 and Limits.

## 2026-11-15: unpaved main roads, variant mockups (step 1)

Reader test: non-mappers found 43% of unpaved main roads against 78% of minor roads, with almost no false alarms, so the marks go unnoticed on coloured fills. Mark contrast measured against the fill: dashes 1.3 to 1.4 on red, orange and yellow (full width 1.25), against 1.6 for the tan dashes on white. White or land-coloured gaps are only 1.08 and 1.06 against the yellow fill.

- `research/mockups/make-mockups.ts` now also writes `main-roads-<style>.svg/png`: per style the current drawing and three variants, red, orange and yellow roads only (white minor roads unchanged). Phone frames at the reader-test size (400 x 520 CSS px, PNG at 2 x) with demo widths at z15 and z16, each road Paved then Unpaved, plus Carto construction, tunnel and track at the same scale. Existing outputs and `styles.json` unchanged.
- Variants: grain 2.25 x, on the low-zoom tint, both; centre line 30% of the fill, darker (#5e4126), shorter dashes 12/6; dashed fill dash at contrast 1.8 (red #e56c46, orange #e1932d, yellow #c3be30), wider band 80%, longer gaps; dashed casing gaps 14/8, twice as thick, "teeth" (notches through the outline); full width dash at 1.6 (#e97a58, #e7a045, #cdc949), GmapTool white gaps, gaps through the casing.
- Colour-blind simulation (check-colour-blindness.py images): every variant is a luminance step in the class hue, so it holds under protanopia, deuteranopia and tritanopia.
- Seen on the sheets: GmapTool white gaps nearly vanish on yellow (1.08), the teeth reduce to the dashed outline on yellow. The thicker dashed outline is strong but moves toward Carto tunnels (the Spirit maintainer's concern). The sheets show Paved and Unpaved side by side, which flatters every variant: noticing a mark without a comparison is what the reader test measured.
- Recommendation: (1) dashed fill with the stronger dash (A, or B with the 80% band): the largest gain on all three colours, yellow included; A is a colour-only change; no white, the dark casing is kept, so it stays apart from construction. Cost: the Off-road dash (offDash, 1.8 to 1.9) is now the Unpaved dash, so Off-road needs a further step. (2) grain, bigger, on the low-zoom tint (C): grain did best on main roads in the test (58%), and the tint shows before the dots do, the same tint as at low zoom. Risk: a tinted fill was dropped earlier for shifting the class colour; yellow turns slightly tan. Not recommended: white gaps, teeth, the thicker outline, and the centre line, where a line down a main road may read as a lane marking (a hypothesis, not tested).
- Reader-place previews: `make-mockups.ts` writes `main-roads-spec-<variant>.json` (`styles.json` with only the trunk, primary and secondary colours changed) for the colour-only variants (grain B, dashed fill A, full width A). `scripts/shots.mjs --spec <file>` serves one in place of `js/style-spec.js`, so the demo is unchanged. Not run yet (no local server). From the repo root with `python3 -m http.server 8765`, for example: `node scripts/shots.mjs --spots namibia --styles dashed-fill --bgs land --zooms 16 --size 400x520 --dpr 2 --center <labels.json centre> --attribution --reader --spec research/mockups/main-roads-spec-dashed-fill-A.json --out shots/main-roads`. Width and scale variants (band 80%, bigger grain, thicker outline) need demo code.
- Picks (Julien, 2026-11-15): 1C, 2B, 3A, 4A, 5A softened. Sheet `research/mockups/main-roads-picks.png`: current Unpaved, current Off-road, new Unpaved, new Off-road, one row per style. Each new Off-road is one step darker than the new Unpaved. Grain: twice as dense on the Off-road tint. Centre line: a darker line #382717 on the Off-road tint. Dashed fill: dash at contrast 2.45 (red #da4517, orange #d47200, yellow #aba200; step 1.36 over the new Unpaved dash, as before). Dashed casing: the 14/8 outline in the Off-road colours on the Off-road tint. Full width: softened to 1.45 (#ec8666, #ebab58, #d5d361), because 1.6 left no room for Off-road; Off-road keeps the current dash (step 1.32 on red and orange, only 1.23 on yellow).
- Picks applied (2026-11-15): the spec now has `mainRoads` (trunk, primary, secondary) and a `main` block per style. `official()` in make-mockups.ts and `js/styles.js` draw the picks on those classes, in light mode only (white roads, motorway, low-zoom tints and dark mode unchanged). Style 5 yellow Off-road dash darkened to #bcb61c, so every Off-road step is now 1.32 to 1.36. The demo legend notes mention the main-road marks. Every option, junction and reference sheet and the colour-blind sheet were regenerated; the "Current" column of `main-roads-*` keeps the reader-test style. The colour-only preview specs (`main-roads-spec-*.json`) are removed; `shots.mjs --spec` stays for comparing a spec against the demo. Not regenerated: the reader-test pictures (the first round keeps its pictures) and the article images.
- Low-zoom tint on main roads (Julien, 2026-11-15): in the demo, the Unpaved tint under 6 px (1.20 to 1.25 against the fill) was too hard to see. Now `lowZoom.main` in the spec: Unpaved at 1.5 against the fill, as white roads (red #eb8261, orange #e9a751, yellow #d2d059), and Off-road one 1.35 step darker (#e15d34, #dc8617, #bab315). Light mode only; `lowTint` and `offTint` are unchanged, since grain and the Off-road fills use them at high zoom. Sheet: `research/mockups/main-roads-low-zoom.png` (before and now). Checked in the demo, Namibia z12.

## 2026-11-16: reader test round 2 pictures, article images with the main-road marks

- Reader test picture set 3 (`IMAGES = 3`): every map and strip re-rendered with `render.sh` from the current demo; places, numbers and answer key unchanged (`places.json` identical). Links with no `?src=` are tagged `r2`.
- Article images re-rendered from the demo, same frames: `slider-proposed` (`--center -18.81068,16.9329 --size 1600x900`, style 4; `slider-today` has no style and stays), the zoom strip (`scripts/article-zoom-strip.py`), `styles-grid` and `styles-grid-portrait` (`--compare`, terrain, z16, `--center -18.81068,16.9375`, `--size 1500x840` or `--portrait`; the centre was found by matching the old images, 2% of pixels changed), and `junction.jpg` (`research/mockups/options-junction-2levels.png` scaled to 2400 px wide). JPEG quality 88.
- Style 2 on main roads (Julien, 2026-11-16): the centre line at 30% of the fill in #5e4126 outweighed the class colour (about 3 px of near-black brown at z16). Narrowed to 20%, same colours (`main.xWidth` 0.2 in make-mockups.ts). Mockups, picks sheet, colour-blind sheet and `js/style-spec.js` regenerated; reader test set 3 (only the centre-line pictures and picture-D change), the styles grids and `junction.jpg` re-rendered. Round 2 had not gone live yet, so set 3 stays set 3.
