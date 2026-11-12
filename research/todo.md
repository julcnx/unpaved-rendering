# To do

Updated 2026-11-10. Open items from all the task files and the "Mind the Surface" brief, in one list.

## Decisions (settled 2026-11-09)

1. Third level keeps the name **Off-road** (not "High clearance").
2. `wood`, `concrete:lanes` and `grass_paver`: Unpaved unless `smoothness` is bad or better (only `very_bad` and worse mean Off-road). Done in all three ports, 68 tests pass (C-statistics decision 10).
3. `4wd_only` keeps raising the Off-road mark.
4. Stats are not rerun: the new rule moves only about 300 km out of 20 million.
5. Styles: four left after the mockups (ordered from faint to strong, 2026-11-10: 1 Grain fill, 2 Dashed centre line, 3 Dashed fill, 4 Dashed casing, which replaced open gaps, 5 Dashed fill full width, as Americana; no preference, the right one depends on the provider); brown fill and tint dropped, too hard to see or they change the class you see. No single default: each provider picks the style that fits its map.
6. Repo: a new local repo `~/Workspaces/OSM/unpaved-rendering`, pushed to `julcnx/unpaved-rendering` only after Julien's OK.
7. Screenshot spots: one per continent, no Antarctica. North America = Alberta Hwy 40 (spot 6, added 2026-11-09); backups Alberta Hwy 68 and Mexico QR 15.
8. The proposal stays OSM-specific: no generic styling guide for other data sources.
9. Off-road on roads (2026-11-10): the Unpaved pattern, only darker (measured tints), in all five styles; the "more broken" version is a backup only. Since the mockup review (2026-11-10) the signal follows the fill: darker centre line and outline in styles 2 and 4, grain twice as dense in style 1; white roads have bigger tint steps and a darker casing when their fill is tan. The dash ladder (Paved solid, Unpaved long dashes, Off-road medium dashes, Carto `grade2`/`grade3` rhythms) is kept for tracks later.
10. No Google Street View any more (2026-11-10): Mapillary only. Google images deleted, Google fields removed from the imagery scripts and data.
11. Do not rely on Overpass for now (2026-11-10): it breaks too easily. Spot data stays as cached.

## Demo and colour tests

15. Static demo page: first version done 2026-11-09 in `~/Workspaces/OSM/unpaved-rendering` (canvas, 4 styles from the mockups, side by side, 5 backgrounds incl. hillshade/contours/labels, legend, live Overpass from z14, Nominatim search, OSM attribution). Cached data for all spots done. Styles synced from the mockups (`research/mockups/styles.json`, `node scripts/sync-styles.mjs`), style chips, live Overpass anywhere (main roads from z11). Still to do: refetch the spot data with way ids (postponed: no Overpass for now, decision 11); dark-mode primary looks brown (see LOG.md).
16. Backgrounds: white, forest green, sand/desert, dark mode, and a realistic one with hillshade, contours and labels.
17. Zoom behaviour: where each style starts working, and how it looks on thin roads.
18. (dark mode moved to Low priority) Colour tests: several earthy browns against every background, distinct from contour and boundary browns; dark-mode variant per style; colour-blindness simulation (done 2026-11-10, D-examples-visuals); write down why the colours were picked.
19. Screenshot loop: first run done 2026-11-10 (5 styles x 6 spots x white, terrain x z12, 14, 16); second run the same day after the mockup review (all five backgrounds, 90 shots; findings in LOG.md). Still to do: decide on the open points from the review (style 5 in towns and on short ways, white caramel dash against orange, yellow Off-road hue, dark mode steps), ideally with forum feedback.

## Repo, article and publishing (ask before anything public)

20. Done 2026-11-11 (by Julien): public repo `julcnx/unpaved-rendering` with GitHub Pages at https://julcnx.github.io/unpaved-rendering/. Was: create the public repo `julcnx/unpaved-rendering` (description and topics mention OSM), with GitHub Pages for the demo and the article.
21. Article "Mind the Surface: A Main Road Is Not Always Paved": the misconception, global evidence, the two-class ask, the optional third level, the styles, tile/zoom limits (OpenMapTiles has no `surface` below z12, so Americana, MapTiler, Stadia and OpenFreeMap cannot show unpaved there; A4), how rare the Off-road evidence is (5.9% of Unpaved km), legend wording, known limitations, future work (tracks, paths, routing, Google and Apple; one sentence saying the same paved whitelist applies to tracks and paths, their rendering is a follow-up), how to help, credits to imagico and Sommerluk. `laterite` only as an example under limits (OSM Carto's explicit lists render it as paved), no own section. The open style points of item 19 stay out of the article. Status 2026-11-11: draft 1 written (`../article.md`), the site's home page (`../index.html`, `npm run build`) with all figures (C48 hero, shaded table, photo grid, six apps, slider, live demo, styles grid, zoom strip); demo moved to `../demo/`. Julien's first read-through done 2026-11-11. App reports page: built as a draft. No Evidence page: the article links to the evidence on GitHub. C48 checked on Google satellite (2026-11-12): still unpaved, imagery from about 2025. Still to do: "Discuss on the forum · Report a correction on GitHub" line in section 9 (forum link once the thread exists).
22. Short OSM wiki page for the tag mapping only, linking to the repo; OSM diary entry; Facebook post pointing to the diary. Get feedback on the community forum first: thread posted by Julien on 2026-11-12 (General talk), https://community.openstreetmap.org/t/draft-for-feedback-showing-unpaved-roads-on-osm-based-maps-without-losing-the-road-class/150052
- Review the paved local `surface` values `dbst`, `ottaseal`, `Blacktopped` and `tarmac` (2026-11-12), and mark a warning on the wiki: they are not documented values, so the classifier draws them as Unpaved (unknown = Unpaved stays; the data should be fixed, not the classifier). Km per country: [stats/unknown-values.md](stats/unknown-values.md).
- Broken pavement drawn as Unpaved (2026-11-12, C-statistics decision 12): say in one line in the legend or wiki text that a paved road with `smoothness` very_bad or worse, or `4wd_only`, is drawn as Unpaved on purpose (a city car cannot pass), so it does not read as an error.
- Stale `smoothness` on roads paved later (2026-11-12): in the edit-history check of the 45 longest paved ways with `smoothness` very_bad or worse, 16 (about 380 km) got their `smoothness` before the paved surface. Check each on imagery, then remove or update the old `smoothness` in OSM (fix the data, not the classifier). After the stats rerun, the conflict lists in `stats/report.md` show the rest.
  - Brazil: [w194660675](https://www.openstreetmap.org/way/194660675) (67 km), [w553772613](https://www.openstreetmap.org/way/553772613) (12 km)
  - Bolivia: [w168814232](https://www.openstreetmap.org/way/168814232) (39 km), [w29049249](https://www.openstreetmap.org/way/29049249) (25 km), [w216939572](https://www.openstreetmap.org/way/216939572) (11 km). The first two got their paved surface within a day of the `smoothness`, so they may be deliberate.
  - Cameroon: [w317636639](https://www.openstreetmap.org/way/317636639) (28 km), [w44582719](https://www.openstreetmap.org/way/44582719) (26 km)
  - Ghana: [w337482155](https://www.openstreetmap.org/way/337482155) (25 km)
  - Morocco: [w412652199](https://www.openstreetmap.org/way/412652199) (24 km), [w412652613](https://www.openstreetmap.org/way/412652613) (24 km), [w192474495](https://www.openstreetmap.org/way/192474495) (22 km), [w636007876](https://www.openstreetmap.org/way/636007876) (20 km), [w428260907](https://www.openstreetmap.org/way/428260907) (15 km)
  - Ethiopia: [w562256875](https://www.openstreetmap.org/way/562256875) (20 km, `concrete` + `very_horrible`, note "4x4 mandatory for driving": may be right)
  - Colombia: [w100011194](https://www.openstreetmap.org/way/100011194) (11 km)
  - Madagascar: [w169869720](https://www.openstreetmap.org/way/169869720) (11 km)

## Outreach (drafts only, send nothing)

- Spirit PR #93 (Julien's, open): before pinging again, switch to a paved whitelist and a style that does not dash the casing (the maintainer asked about tunnel confusion; see A-providers A5 and the Shortbread row).
14. Contacts for the late-added countries (B); wiki table and sample countries (C); Western contrast countries: is `surface=unpaved` used there for roads a city car can drive?
- Track rendering per app (double line, dashed, continuous), moved up from Low priority on 2026-11-10: needed before the issue drafts, so the style picked for each provider stays distinct from how it draws tracks (unpaved roads drawn as tracks is the failure seen in Ride with GPS, OsmAnd Motorcycle and Gaia GPS). Column "How tracks are drawn" added to A0; 16 rows still to check. Not a track proposal: tracks and paths stay future work.
23. One issue draft per provider, adapted to its current rendering and tile schema. Open apps first (Organic Maps, OsmAnd, Americana), issue before PR, small first PR. A3 order: CyclOSM, OsmAnd #9465, Organic Maps #8485, OpenMapTiles whitelist, Kurviger forum, Tracestrack.
24. Commercial apps through support or product teams: Komoot, Gaia GPS, Calimoto, Guru Maps, Ride with GPS and the others.
25. Allies: HOT, local mapping communities, the laterite-discussion contacts.
29. Done 2026-11-11 (posted by Julien). Facebook post, northern Thailand (2026-11-10): road MS.4014 Pai to Wiang Haeng (view 19.540403, 98.548539, z13 to z14), carousel of a road photo plus Komoot, Google Maps, OsmAnd Off-road style, Gaia GPS and DMD2. Web screenshots in [examples/screenshots/pai-z14-portrait/](examples/screenshots/pai-z14-portrait/) (`PORTRAIT=1 ZOOM=14 node examples/screenshots.ts pai`), demo shots in `../shots/pai-portrait/`. Post text now kept by Julien in his notes. Can go before the forum feedback of item 22.

- Done 2026-11-12: Gaia GPS draws `tertiary`, `unclassified` and `residential` with `smoothness=very_bad` or worse, or `4wd_only=yes`, as tracks; never `trunk`, `primary` or `secondary`; `surface` and `tracktype` not used. Measured from the `osm_id`s in Gaia's tiles ([examples/gaia-tracks.ts](examples/gaia-tracks.ts)); A0, the app reports, D3 and the article updated.

## Low priority
- Paved `highway=track` (`tracktype=grade1` or a paved surface) drawn as a continuous line, matching the track rhythms now used by the centre line (OSM Carto already draws grade1 solid). For the future-work section, after the road classes.
- OsmAnd default vs Motorcycle screenshot at one spot (the difference is already described in A0; Komoot phone app check not needed).
28. OsmAnd Motorcycle (low priority, after everything else): the owner said yes on [discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) (2026-11-09) and suggests Julien forks it. Thanked in French on 2026-11-09 (said it comes later). Then fork and draw unpaved roads in their class colour, as the phone demo. Code review done (A-providers A6, 2026-11-10): GPL v3; roads primary to residential are repainted in track colour and width (class lost), motorway and trunk never; keep the brown/green track categories, change the road part. Find the OsmAnd plugin he mentions (F-Droid build).
