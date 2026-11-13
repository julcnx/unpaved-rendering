# Decisions

Settled decisions, moved out of [todo.md](todo.md) on 2026-11-13. Numbers 1 to 11 are the ones other files cite ("todo.md decision 5"); new decisions get the next number.

## Settled 2026-11-09 to 2026-11-10

1. Third level keeps the name **Off-road** (not "High clearance").
2. `wood`, `concrete:lanes` and `grass_paver`: Unpaved unless `smoothness` is bad or better (only `very_bad` and worse mean Off-road). Done in all three ports, 68 tests pass (C-statistics decision 10).
3. `4wd_only` keeps raising the Off-road mark.
4. Stats are not rerun: the new rule moves only about 300 km out of 20 million.
5. Styles: five left after the mockups (ordered from faint to strong, 2026-11-10: 1 Grain fill, 2 Dashed centre line, 3 Dashed fill, 4 Dashed casing, which replaced open gaps, 5 Dashed fill full width, as Americana; no preference, the right one depends on the provider); brown fill and tint dropped, too hard to see or they change the class you see. No single default: each provider picks the style that fits its map.
6. Repo: a new local repo `~/Workspaces/OSM/unpaved-rendering`, pushed to `julcnx/unpaved-rendering` only after Julien's OK. Made public by Julien on 2026-11-11, with GitHub Pages at https://julcnx.github.io/unpaved-rendering/.
7. Screenshot spots: one per continent, no Antarctica. North America = Alberta Hwy 40 (spot 6, added 2026-11-09); backups Alberta Hwy 68 and Mexico QR 15.
8. The proposal stays OSM-specific: no generic styling guide for other data sources.
9. Off-road on roads (2026-11-10): the Unpaved pattern, only darker (measured tints), in all five styles; the "more broken" version is a backup only. Since the mockup review (2026-11-10) the signal follows the fill: darker centre line and outline in styles 2 and 4, grain twice as dense in style 1; white roads have bigger tint steps and a darker casing when their fill is tan. The dash ladder (Paved solid, Unpaved long dashes, Off-road medium dashes, Carto `grade2`/`grade3` rhythms) is kept for tracks later.
10. No Google Street View any more (2026-11-10): Mapillary only. Google images deleted, Google fields removed from the imagery scripts and data.
11. Do not rely on Overpass for now (2026-11-10): it breaks too easily. Spot data stays as cached.

## Later

12. Tracks and paths are not part of the proposal (2026-11-10): future work. Track rendering per app is checked only so each provider's style stays distinct from its tracks.
13. Article scope (2026-11-11): `laterite` only as an example under Limits (OSM Carto's explicit lists render it as paved), no own section; the open style points of the screenshot review stay out; no Evidence page, the article links to the evidence on GitHub; one sentence saying the same paved whitelist applies to tracks and paths.
14. Unknown `surface` values stay Unpaved (2026-11-12): local paved values such as `dbst`, `ottaseal`, `Blacktopped` and `tarmac` are drawn as Unpaved; the data should be fixed, not the classifier.
15. Broken pavement is drawn as Unpaved on purpose (2026-11-12, C-statistics decision 12): a paved road with `smoothness` very_bad or worse, or `4wd_only`, cannot be passed by a city car.
16. Style 4 on white minor roads (Julien, 2026-11-12): white Unpaved roads get a light tan fill, Off-road keeps the darker tan, so the dashes do not read as AllTrails tracks or vanish on forest.
17. Calimoto dropped from the track checks (2026-11-12): map too light to read, tracks not visible.
18. OsmAnd (Julien, 2026-11-13): our own style, **Overland**, not a fork of the Motorcycle style. Details in [A-providers A6](A-providers.md#a6-osmand-motorcycle-style-code-review-for-the-fork-2026-11-10).
