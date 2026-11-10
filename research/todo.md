# To do

Updated 2026-11-09. Open items from all the task files and the "Mind the Surface" brief, in one list.

## Decisions (settled 2026-11-09)

1. Third level keeps the name **Off-road** (not "High clearance").
2. `wood`, `concrete:lanes` and `grass_paver`: Unpaved unless `smoothness` is bad or better (only `very_bad` and worse mean Off-road). Done in all three ports, 68 tests pass (C-statistics decision 10).
3. `4wd_only` keeps raising the Off-road mark.
4. Stats are not rerun: the new rule moves only about 300 km out of 20 million.
5. Styles: four left after the mockups (ordered from faint to strong, 2026-11-10: 1 Grain fill, 2 Dashed centre line, 3 Dashed fill, 4 Dashed casing, which replaced open gaps, 5 Dashed fill full width, as Americana; no preference, the right one depends on the provider); brown fill and tint dropped, too hard to see or they change the class you see. No single default: each provider picks the style that fits its map.
6. Repo: a new local repo `~/Workspaces/OSM/unpaved-rendering`, pushed to `julcnx/unpaved-rendering` only after Julien's OK.
7. Screenshot spots: one per continent, no Antarctica. North America = Alberta Hwy 40 (spot 6, added 2026-11-09); backups Alberta Hwy 68 and Mexico QR 15.
8. The proposal stays OSM-specific: no generic styling guide for other data sources.
9. Off-road on roads (2026-11-10): the Unpaved pattern, only darker (measured tints), in all five styles; the "more broken" version is a backup only. The dash ladder (Paved solid, Unpaved long dashes, Off-road medium dashes, Carto `grade2`/`grade3` rhythms) is kept for tracks later.

## Demo and colour tests

15. Static demo page: first version done 2026-11-09 in `~/Workspaces/OSM/unpaved-rendering` (canvas, 4 styles from the mockups, side by side, 5 backgrounds incl. hillshade/contours/labels, legend, live Overpass from z14, Nominatim search, OSM attribution). Cached data for all spots done. Styles synced from the mockups (`mockups/styles.json`, 2026-11-09), style chips, live Overpass anywhere (main roads from z11). Still to do: refetch the spot data with way ids when Overpass has capacity; dark-mode primary looks brown (see LOG.md).
16. Backgrounds: white, forest green, sand/desert, dark mode, and a realistic one with hillshade, contours and labels.
17. Zoom behaviour: where each style starts working, and how it looks on thin roads.
18. (dark mode moved to Low priority) Colour tests: several earthy browns against every background, distinct from contour and boundary browns; dark-mode variant per style; colour-blindness simulation (done 2026-11-10, D-examples-visuals); write down why the colours were picked.
19. Screenshot loop: first run done 2026-11-10 (5 styles x 6 spots x white, terrain x z12, 14, 16; findings in the demo LOG.md). Still to do: screenshot every area x style x background x zoom, adjust, repeat, and keep a short change log.

## Repo, article and publishing (ask before anything public)

20. Create the public repo `julcnx/unpaved-rendering` (description and topics mention OSM), with GitHub Pages for the demo and the article.
21. Article "Mind the Surface: A Main Road Is Not Always Paved": the misconception, global evidence, the two-class ask, the optional third level, the styles, tile/zoom limits (OpenMapTiles has no `surface` below z12, so Americana, MapTiler, Stadia and OpenFreeMap cannot show unpaved there; A4), how rare the Off-road evidence is (5.8% of Unpaved km), legend wording, known limitations, future work (tracks, paths, routing, Google and Apple), the iD `surface=laterite` conflict, credits to imagico and Sommerluk.
22. Short OSM wiki page for the tag mapping only, linking to the repo; OSM diary entry; Facebook post pointing to the diary. Get feedback on the community forum first.

## Outreach (drafts only, send nothing)

- Spirit PR #93 (Julien's, open): before pinging again, switch to a paved whitelist and a style that does not dash the casing (the maintainer asked about tunnel confusion; see A-providers A5 and the Shortbread row).
14. Contacts for the late-added countries (B); wiki table and sample countries (C); Western contrast countries: is `surface=unpaved` used there for roads a city car can drive?
23. One issue draft per provider, adapted to its current rendering and tile schema. Open apps first (Organic Maps, OsmAnd, Americana), issue before PR, small first PR. A3 order: CyclOSM, OsmAnd #9465, Organic Maps #8485, OpenMapTiles whitelist, Kurviger forum, Tracestrack.
24. Commercial apps through support or product teams: Komoot, Gaia GPS, Calimoto, Guru Maps, Ride with GPS and the others.
25. Allies: HOT, local mapping communities, the laterite-discussion contacts.

## Low priority
- Track rendering per app (double line, dashed, continuous), for the future-work section.
- Paved `highway=track` (`tracktype=grade1` or a paved surface) drawn as a continuous line, matching the track rhythms now used by the centre line (OSM Carto already draws grade1 solid). For the future-work section, after the road classes.
- OsmAnd default vs Motorcycle screenshot at one spot (the difference is already described in A0; Komoot phone app check not needed).
28. OsmAnd Motorcycle (low priority, after everything else): the owner said yes on [discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) (2026-11-09) and suggests Julien forks it. Thanked in French on 2026-11-09 (said it comes later). Then fork and draw unpaved roads in their class colour, as the phone demo. Code review done (A-providers A6, 2026-11-10): GPL v3; roads primary to residential are repainted in track colour and width (class lost), motorway and trunk never; keep the brown/green track categories, change the road part. Find the OsmAnd plugin he mentions (F-Droid build).
