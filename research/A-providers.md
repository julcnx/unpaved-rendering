# A. Providers

Analysis date: 2026-11-02.

Sources used:

- Provider list: `surface=*` rendering tracker in [../osm-cache/_tag-support-status.json](../osm-cache/_tag-support-status.json)
- Source clones in [../osm-tag-support-tracker/sources/](../osm-tag-support-tracker/sources/) (commit hashes in the links below)
- HOT HDM-CartoCSS fetched from GitHub (not cloned locally), commit `ff2bb32`
- GitHub issue search with `gh` on 2026-11-02

Komoot, Gaia GPS, Calimoto and Guru Maps do not appear anywhere in the workspace. Their current rendering is still to be checked in the apps (see task D).

**Model (decided 2026-11-02):** two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads only. The ask to providers is therefore small: (1) draw the paved/unpaved split on **every** road class, using a paved whitelist, and (2) optionally add the Off-road mark. Several providers already have the two levels internally; the open question per provider is whether they draw them on main road classes (primary, secondary, tertiary) or only on tracks and minor roads. That check is still to do.

## A0. Main-road check: who draws unpaved on primary, secondary and tertiary? (2026-11-03)

Checked in each style's source code (commits as cloned in `osm-tag-support-tracker/sources/` or fetched from GitHub on 2026-11-03), and for closed apps from their help pages and forums.

| Provider | Unpaved on main road classes? | How | Classification | Gap for our ask |
|---|---|---|---|---|
| **OSM Carto** (credit only) | **Yes, every class**, motorway to service, from z6 on major roads | Line pattern (`symbols/unpaved/*.svg`) inside the fill: [style/roads.mss](https://github.com/gravitystorm/openstreetmap-carto/blob/d13d8dbbdb8e2cb3e6b21964870537ebf478fcf1/style/roads.mss#L1437-L1452) | Two explicit lists in `project.mml`: unknown and local values render as **paved** | Whitelist instead of lists (unknown values become paved today) |
| **Americana** | **Yes, every class**, from z4 | Dashed overlay (dash 4, gap 4) in a lighter tint of the road's own class colour, so the class colour is kept (light pink dashes on a red trunk), on a generic road layer with no class filter; legend entry "Unpaved road" ([road.js L477-L500](https://github.com/osm-americana/openstreetmap-americana/blob/dddb072aad1ba2efb2332277ff53cc72f0bcbc65/src/layer/road.js#L477-L500)); test `surface == "unpaved"` | OpenMapTiles/Planetiler normalise to paved/unpaved upstream (explicit unpaved list) | Whitelist upstream in OpenMapTiles; nothing else needed for two levels |
| **Humanitarian (HOT)** | **Yes, every class**, from z11 | Unpaved casing, and the fill becomes the residential colour ([roads.mss L80-L95, L221](https://github.com/hotosm/HDM-CartoCSS/blob/ff2bb32dc96e5e450dab052be0df0dff40f1c139/roads.mss#L80-L95)): an unpaved primary **loses its class colour** | Paved whitelist (4 values); untagged unclassified counts as unpaved | Keep the class colour; repo inactive since 2021 |
| **CyclOSM** | **Yes, from z14**, as bike-type dashes (road / cyclocross / mtb) | `surface_type` in [views.sql L153-L172](https://github.com/cyclosm/cyclosm-cartocss-style/blob/588e9c7b/views.sql#L153-L172) | Explicit lists; **`surface=unpaved` is in no list**, so 75% of unpaved km gets no mark | Add `unpaved` (or a whitelist) |
| **OsmAnd** | **Optional only**: "Road surface" and "Road quality" overlays, **off by default**, from z14 | Coloured overlay line ([default.render.xml L99-L102](https://github.com/osmandapp/OsmAnd-resources/blob/85815c67803a53ed1e4e50b25337d678bac0fa16/rendering_styles/default.render.xml#L99-L102)) | Per-value colours | A default-on Unpaved signal on roads |
| **Organic Maps / CoMaps** | **No.** No style file (default, outdoors, vehicle) uses `psurface` or `surface`; `psurface` is used for routing only | (none) | Paved whitelist exists in the generator | Render `psurface` paved vs unpaved: biggest gap among open apps. Corrects the earlier tracker note that said rendering used it |
| **OpenTopoMap** | **No** on roads; `surface` only separates asphalt from non-asphalt on paths, footways, bridleways, plus ice and snow | `styles-otm/roads-*.xml` | (n/a) | Project only kept online |
| **OSMF Shortbread** (vector.openstreetmap.org) | **No** in the deployed style | (none) | The Shortbread schema already exports the raw `surface` on streets from z11 ([schema 1.0](https://shortbread-tiles.org/schema/1.0/)) | Style change only, no schema change (Spirit PR #93) |
| **Tracestrack Topo** | Has an unpaved style (issue #67); class scope not checked (closed style) | | | Check in app |
| **Komoot** (closed) | **No** surface on the map: legend is by road type ("Track" category); surfaces only in the route summary ("Way types & surfaces") | | | Map rendering of unpaved roads |
| **Mapy.com** (closed, formerly Mapy.cz) | **No** on the basic map (`zakladni`): at all three screenshot spots (Namibia C38, Bolivia RN3, Nepal NH48, 2026-11-08) the paved and unpaved sides are the same solid orange line; the outdoor map is not checked yet | (none seen) | (unknown) | Paved/unpaved split on main roads; check the outdoor map |
| **Calimoto** (closed) | **Yes, partly**: support legend says off-road segments get a light brown background; routing avoids them | | | Check which classes and tags |
| **Kurviger** (OSM-based motorbike app) | **No on the base map**: unpaved shown only on the planned route (red); users keep asking ([forum: different colours for sealed and unsealed roads](https://forum.kurviger.com/t/different-colours-for-sealed-and-unsealed-roads/18588), [enhance visibility of unpaved roads](https://forum.kurviger.com/t/enhance-visibility-of-offroad-tracks-and-unpaved-roads/19355)) | | | Base-map rendering; existing feature requests to join |
| **Gaia GPS** (closed) | Not confirmed for Gaia Topo; the separate premium **Gaia Overland** layer shows road surfaces | | | Check in app |
| **Guru Maps**, **Locus Map / LoMaps** (closed or theme-based) | Not confirmed; Locus depends on the theme (the Voluntary theme shows surfaces) | | | Check in app |

Summary:

1. **Already on every class**: OSM Carto, Americana, HOT; CyclOSM from z14 for cycling. Their gaps are the classification (explicit lists instead of a whitelist; CyclOSM misses `surface=unpaved`) or the styling (HOT drops the class colour).
2. **Not at all, or only on request**: Organic Maps, CoMaps, OsmAnd (overlay off by default), OpenTopoMap, Shortbread, Komoot, Kurviger, Mapy.com (basic map). These are the main targets, and Organic Maps and OsmAnd are the most used open apps among riders.
3. Sources for the closed apps: [Komoot help: map legend](https://www.komoot.com/help/map), [calimoto legend](https://support.calimoto.com/hc/articles/9447607082140), [Gaia Overland map](https://expeditionportal.com/gaia-gps-launches-new-overlanding-map/), Kurviger forum links above.

### Prior work: Julien's 2022 draft (to reuse and move)

Julien's own earlier page (written as CMoffroad): [User:Julcnx/Unpaved_Rendering](https://wiki.openstreetmap.org/wiki/User:Julcnx/Unpaved_Rendering) (moved from User:CMoffroad/Unpaved_Rendering, draft, table "last updated March 2022", page last edited 2026-03-18) already argued for unpaved rendering on all road classes, with a four-profile model ("Normal roads", "Drive with care", "4WD only", "Impassable"), a support table for 10 apps (OSM Carto, CyclOSM, OpenCycleMap, OpenTopoMap, Komoot, AllTrails, Mapy.cz, OsmAnd, Maps.me, Organic Maps) and contact channels (GitHub issues; email for Komoot and AllTrails). It planned a move to `Rendering/Unpaved_Roads`. Decided 2026-11-03: reuse this page and move it to the main namespace as the "Unpaved road rendering" page, updated to the simpler model (two levels plus the mark) and the data behind it. The 2022 support table becomes the A0 table above. Earlier community discussion: [In Michigan, unpaved roads look like paved roads](https://community.openstreetmap.org/t/in-michigan-unpaved-roads-look-like-paved-roads/67886) (2014, Garmin maps, no outcome).

## A1. Providers that already whitelist paved values

### HOT Humanitarian style (HDM-CartoCSS)

Repo: [hotosm/HDM-CartoCSS](https://github.com/hotosm/HDM-CartoCSS), file `project.yml`, [lines 343-351](https://github.com/hotosm/HDM-CartoCSS/blob/ff2bb32dc96e5e450dab052be0df0dff40f1c139/project.yml#L343-L351):

```sql
CASE
  WHEN smoothness IN ('bad', 'very_bad', 'horrible', 'very_horrible') THEN 'bad'
  ELSE 'good'
END AS condition,
CASE
  WHEN surface IN ('paved', 'paving_stones', 'asphalt', 'concrete') THEN 'paved'
  WHEN (surface IS NULL AND type IN ('trunk', 'trunk_link', 'motorway', 'motorway_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link')) THEN 'paved'
  ELSE 'unpaved'
END AS surface,
```

`condition` is used in `roads.mss` L249. Unpaved roads get a different casing and fill (`@unpaved`, `@unpaved_case` in `palette.mss`).

Same as our base level: paved whitelist, everything else unpaved, missing surface on main roads is paved.

Differences from our rule:

1. Only 4 paved values: `chipseal`, `sett`, `bricks` render as unpaved.
2. `unclassified` with no surface renders as unpaved.
3. Repo inactive since 2021-07-22. Use it as precedent and as an ally, not as a code target.

### Organic Maps (and CoMaps fork)

Repo: [organicmaps/organicmaps](https://github.com/organicmaps/organicmaps), file `generator/osm2type.cpp`:

- `pavedSurfaces` whitelist: [L579-581](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L579-L581)
- Used at: [L729](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L729) `isPaved = Has(pavedSurfaces, surface);`
- No surface and no smoothness: no `psurface` at all ([L709](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L709)), so drawn as normal road.

Output is 4 values: `paved_good`, `paved_bad`, `unpaved_good`, `unpaved_bad`. The paved/unpaved part matches our base level; `unpaved_bad` is close to our Off-road mark, but it is also set from surface values alone (`dirt`, `ground`, `laterite` and others), not only from evidence tags.

Differences from our rule:

1. Values are split on `;:/` before matching, so `concrete:lanes` counts as paved (matches `concrete`).
2. `cobblestone`, `stone`, `grass_paver`, `unhewn_cobblestone` are paved.
3. Smoothness without surface is handled, `very_bad` and worse gives `unpaved_bad`.

## A2. Per provider

| # | Provider | Open source | Current surface rendering | Feedback channel | Existing issues (julcnx in bold) |
|---|---|---|---|---|---|
| 1 | Organic Maps / CoMaps | yes | **No surface rendering** in any style (see A0); `psurface` 4 values used for routing only | GitHub issues | [#8485](https://github.com/organicmaps/organicmaps/issues/8485) open, 18 comments, "Render tracks similar like the Carto-Style"; [#11835](https://github.com/organicmaps/organicmaps/issues/11835) "Color mode for displaying road passability" (smoothness colour mode), closed not planned the same day, no comment; **[#13045](https://github.com/organicmaps/organicmaps/issues/13045)** closed; **[PR #13229](https://github.com/organicmaps/organicmaps/pull/13229)** |
| 2 | OsmAnd | yes | Optional "Road surface" and "Road quality" overlays, off by default, from z14: [default.render.xml L99-102](https://github.com/osmandapp/OsmAnd-resources/blob/85815c67803a53ed1e4e50b25337d678bac0fa16/rendering_styles/default.render.xml#L99-L102) | GitHub issues (OsmAnd, OsmAnd-resources) | [#9465](https://github.com/osmandapp/OsmAnd/issues/9465) open since 2020, "draw unpaved roads in the same style as tracks"; **[resources PR #1397](https://github.com/osmandapp/OsmAnd-resources/pull/1397)**; **[#25469](https://github.com/osmandapp/OsmAnd/issues/25469)** |
| 3 | OpenStreetMap Americana | yes | Dash pattern when `surface=unpaved`: [road.js L56](https://github.com/osm-americana/openstreetmap-americana/blob/dddb072aad1ba2efb2332277ff53cc72f0bcbc65/src/layer/road.js#L56). Gets paved/unpaved from the OpenMapTiles schema, which is enough for our two base levels; the optional Off-road mark would need `smoothness`, `tracktype` or `4wd_only` in the schema upstream | GitHub issues | [#216](https://github.com/osm-americana/openstreetmap-americana/issues/216) tracks/paths; **[#1434](https://github.com/osm-americana/openstreetmap-americana/issues/1434)** closed |
| 4 | OpenMapTiles / Planetiler | yes | Binary paved/unpaved in schema (`layers/transportation/class.sql`, `Transportation.java`) | GitHub issues | **[#1806](https://github.com/openmaptiles/openmaptiles/issues/1806), [PR #1807](https://github.com/openmaptiles/openmaptiles/pull/1807)**, **[PR #332](https://github.com/openmaptiles/planetiler-openmaptiles/pull/332)** all merged |
| 5 | Tracestrack Topo | partly | Unpaved style exists | GitHub issues | **[#67](https://github.com/tracestrack/tracestrack-maps/issues/67)** fixed quickly |
| 6 | CyclOSM | yes | Smoothness drawn for cycling | GitHub issues | [#566](https://github.com/cyclosm/cyclosm-cartocss-style/issues/566) finer smoothness levels |
| 7 | HOT HDM-CartoCSS | yes | Whitelist, see A1 | GitHub issues (inactive) | [#104](https://github.com/hotosm/HDM-CartoCSS/issues/104) open since 2014, "Preseance of surface and smoothness over road classification"; [#26](https://github.com/hotosm/HDM-CartoCSS/issues/26); [#177](https://github.com/hotosm/HDM-CartoCSS/issues/177) |
| 8 | Spirit / OSMF Shortbread | yes | None | GitHub issues | **[#91](https://github.com/pnorman/spirit/issues/91), [PR #93](https://github.com/pnorman/spirit/pull/93)** pinged 2026-08-17, no reply |
| 9 | OpenTopoMap | yes | Track dashes only | GitHub issues | **[#36](https://github.com/der-stefan/OpenTopoMap/issues/36), [PR #398](https://github.com/der-stefan/OpenTopoMap/pull/398)**. Project only kept online |
| 10 | OSM Carto (credit only, not a target) | yes | Subtle unpaved texture. Surface lists in `project.mml` L472-476 | | **[PR #5263](https://github.com/openstreetmap-carto/openstreetmap-carto/pull/5263)**, [#5268](https://github.com/openstreetmap-carto/openstreetmap-carto/issues/5268), [#4724](https://github.com/openstreetmap-carto/openstreetmap-carto/issues/4724). Stay passive |
| 11 | Komoot | no | To check in app | Support / feature requests (to confirm) | |
| 12 | Gaia GPS | no | To check in app | Support / feature requests (to confirm) | |
| 13 | Calimoto | no | To check in app | Support / feature requests (to confirm) | |
| 14 | Guru Maps | no | To check in app | Community forum (to confirm) | |

## A3. Ranking (updated 2026-11-03 after the main-road check)

1. **CyclOSM**: quick win. It already renders surface on roads; `surface=unpaved` (75% of unpaved km) is missing from its lists. A one-line PR adding `unpaved` to the `cyclocross` or `mtb` list, or a whitelist, fixes most of the gap.
2. **OsmAnd**: the overlay already exists, off by default and from z14. Ask for a default-on Unpaved signal on roads. Add to [#9465](https://github.com/osmandapp/OsmAnd/issues/9465). Earlier PR merged.
3. **Organic Maps / CoMaps**: no surface rendering at all, but the paved whitelist already exists in the generator (`psurface`). Ask to draw paved vs unpaved; pitch it as "keep the class colour, add one subtle signal" (a full colour mode was closed as not planned in #11835). Comment on [#8485](https://github.com/organicmaps/organicmaps/issues/8485).
4. **OpenMapTiles / Planetiler (for Americana and MapTiler)**: Americana already dashes unpaved roads of every class. Ask upstream to switch the explicit unpaved list to a paved whitelist, so unknown and local values count as unpaved.
5. **Kurviger**: OSM-based motorbike app, unpaved only shown on routes; users already ask on its forum. Join the existing threads.
6. **Shortbread / Spirit**: schema already has `surface`; style change only (PR #93 waiting).
7. **Commercial apps** (Komoot, Gaia GPS, Calimoto, Guru Maps, Locus): after the wiki page and demo exist. Calimoto already shows off-road segments; Komoot shows surface only in route summaries.
8. **No action**: OSM Carto (credit only, staying passive), HOT (inactive, but its whitelist is the precedent), OpenTopoMap (kept online only), Tracestrack (already renders unpaved; check its class scope in the app).
