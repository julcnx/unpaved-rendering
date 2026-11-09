# To do

Updated 2026-11-09. Open items from all the task files and the "Mind the Surface" brief, in one list.

## Decisions (settled 2026-11-09)

1. Third level keeps the name **Off-road** (not "High clearance").
2. `wood`, `concrete:lanes` and `grass_paver`: Unpaved unless `smoothness` is bad or better (only `very_bad` and worse mean Off-road). Done in all three ports, 68 tests pass (C-statistics decision 10).
3. `4wd_only` keeps raising the Off-road mark.
4. Stats are not rerun: the new rule moves only about 300 km out of 20 million.
5. Styles: four left after the mockups (1 Centre line, 2 Grain, 3 Dashes, 4 Open gaps); brown fill and tint dropped, too hard to see or they change the class you see. Pick the default after the screenshot loop.
6. Repo: a new local repo `~/Workspaces/OSM/unpaved-rendering`, pushed to `julcnx/unpaved-rendering` only after Julien's OK.
7. Screenshot spots: one per continent, no Antarctica. North America = Alberta Hwy 40 (spot 6, added 2026-11-09); backups Alberta Hwy 68 and Mexico QR 15.

## Classification spec

1. Write the generic styling guide (Paved / Unpaved / third level) separate from the OSM tag mapping, so other data sources can add their own mapping.

## Research (A)

3. Track rendering per app (double line, dashed, continuous), for the future-work section.
4. Find the feedback channel for the 16 providers still marked "(to confirm)" in A2.

## Screenshots and examples (D)

6. Retry Humanitarian (HOT) for Iceland: `APPS=humanitarian node examples/screenshots.ts iceland` (tile server still down on 2026-11-09 evening).
8. Komoot in the phone app; OsmAnd default vs Motorcycle at one spot.
10. Comparison grid: one picture per app at the same spot.
11. Chiang Mai before/after, including the Mon Klui viewpoint road.

## Statistics (C)

12. Check the summary has, per country, the share of roads with `smoothness` or `tracktype` (where the third level is usable today), and a short table of a few countries for the article.
14. Contacts for the late-added countries (B); wiki table and sample countries (C); Western contrast countries: is `surface=unpaved` used there for roads a city car can drive?

## Demo and colour tests

15. Static demo page: first version done 2026-11-09 in `~/Workspaces/OSM/unpaved-rendering` (canvas, 4 styles from the mockups, side by side, 5 backgrounds incl. hillshade/contours/labels, legend, live Overpass from z14, Nominatim search, OSM attribution). Cached data for all spots done. Still to do: update the styles to the 2026-11-09 mockups (renumbered 1-4, centre line colour, grain, dash ratios and colours, gap patterns), Chiang Mai spot, dark-mode primary looks brown (see LOG.md).
16. Backgrounds: white, forest green, sand/desert, dark mode, and a realistic one with hillshade, contours and labels.
17. Zoom behaviour: where each style starts working, and how it looks on thin roads.
18. Colour tests: several earthy browns against every background, distinct from contour and boundary browns; dark-mode variant per style; colour-blindness simulation; write down why the colours were picked.
19. Playwright loop: screenshot every area x style x background x zoom, adjust, repeat, and keep a short change log.

## Repo, article and publishing (ask before anything public)

20. Create the public repo `julcnx/unpaved-rendering` (description and topics mention OSM), with GitHub Pages for the demo and the article.
21. Article "Mind the Surface: Where can my city car go?": the misconception, global evidence, the two-class ask, the optional third level, the styles, tile/zoom limits, legend wording, known limitations, future work (tracks, paths, routing, Google and Apple), the iD `surface=laterite` conflict, credits to imagico and Sommerluk.
22. Short OSM wiki page for the tag mapping only, linking to the repo; OSM diary entry; Facebook post pointing to the diary. Get feedback on the community forum first.

## Outreach (drafts only, send nothing)

23. One issue draft per provider, adapted to its current rendering and tile schema. Open apps first (Organic Maps, OsmAnd, Americana), issue before PR, small first PR. A3 order: CyclOSM, OsmAnd #9465, Organic Maps #8485, OpenMapTiles whitelist, Kurviger forum, Tracestrack.
24. Commercial apps through support or product teams: Komoot, Gaia GPS, Calimoto, Guru Maps, Ride with GPS and the others.
25. Allies: HOT, local mapping communities, the laterite-discussion contacts.

## OSM data

26. Nepal NH48: surface tags are reversed (w384304387 should be gravel; w1254665821 and the bridge are asphalt).
27. Out-of-date gravel tags in North America, paved on Mapillary: Sterling Highway AK 1 (59.78842, -151.83453), Taylor Highway AK 5 near Chicken (64.06587, -141.99553), Liard Highway NWT 7 (60.12052, -123.17274). Check the images and retag.

## Low priority
28. OsmAnd Motorcycle (low priority, after everything else): the owner said yes on [discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) (2026-11-09) and suggests Julien forks it. Thanked in French on 2026-11-09 (said it comes later). Then fork and draw unpaved roads in their class colour, as the phone demo. Find the OsmAnd plugin he mentions (F-Droid build).
