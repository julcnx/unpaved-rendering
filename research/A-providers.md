# A. Providers

Analysis date: 2026-11-02.

Sources used:

- Provider list: `surface=*` rendering tracker in [../osm-cache/_tag-support-status.json](../osm-cache/_tag-support-status.json)
- Source clones in [../osm-tag-support-tracker/sources/](../osm-tag-support-tracker/sources/) (commit hashes in the links below)
- HOT HDM-CartoCSS fetched from GitHub (not cloned locally), commit `ff2bb32`
- GitHub issue search with `gh` on 2026-11-02

Komoot, Gaia GPS, Calimoto and Guru Maps do not appear anywhere in the workspace. Gaia GPS, Calimoto, Guru Maps, Maps.me, Organic Maps, CoMaps and OsmAnd were checked by Julien in the phone apps on 2026-11-09 (see A0). Komoot was checked on the web map only (the phone check was dropped).

**Model (decided 2026-11-02):** two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads only. The mark can only be decided where `smoothness`, `tracktype` or `4wd_only` is mapped: 5.8% of Unpaved km today ([stats/mark-coverage.md](stats/mark-coverage.md)), so the main ask is the two levels. The ask to providers is therefore small: (1) draw the paved/unpaved split on **every** road class, using a paved whitelist, and (2) optionally add the Off-road mark. Several providers already have the two levels internally; the open question per provider is whether they draw them on main road classes (primary, secondary, tertiary) or only on tracks and minor roads. That check is still to do.

## A0. Main-road check: who draws unpaved on primary, secondary and tertiary? (2026-11-03)

Checked in each style's source code (commits as cloned in `osm-tag-support-tracker/sources/` or fetched from GitHub on 2026-11-03), and for closed apps from their help pages and forums. Updated 2026-11-09 from the web map screenshots of the six spots (Namibia C38, Bolivia RN3, Nepal NH48, Iceland 54, Australia 27, Alberta 40, zoom 15, [examples/screenshots/](examples/screenshots/)) and from Julien's checks in the phone apps.

| Provider | Unpaved on main road classes? | How | Classification | Gap for our ask |
|---|---|---|---|---|
| **OSM Carto** (credit only) | **Yes, every class**, motorway to service, from z6 on major roads | Line pattern (`symbols/unpaved/*.svg`) inside the fill: [style/roads.mss](https://github.com/gravitystorm/openstreetmap-carto/blob/d13d8dbbdb8e2cb3e6b21964870537ebf478fcf1/style/roads.mss#L1437-L1452) | Two explicit lists in `project.mml`: unknown and local values render as **paved** | Whitelist instead of lists (unknown values become paved today); small today: the lists cover 99.4% of Unpaved km, the gap is mostly `laterite` and `tracktype` without surface (A5) |
| **Americana** | **Yes, every class**, from z12: the style has a dash layer from z4, but OpenMapTiles has no `surface` below z12 (see A4), and the z11 screenshots show no dashes at any spot; clear dashes at all six spots at z15 (2026-11-09) | Dashed overlay (dash 4, gap 4) in a lighter tint of the road's own class colour, so the class colour is kept (light pink dashes on a red trunk), on a generic road layer with no class filter; legend entry "Unpaved road" ([road.js L477-L500](https://github.com/osm-americana/openstreetmap-americana/blob/dddb072aad1ba2efb2332277ff53cc72f0bcbc65/src/layer/road.js#L477-L500)); test `surface == "unpaved"` | OpenMapTiles/Planetiler normalise to paved/unpaved upstream (explicit unpaved list) | Whitelist upstream in OpenMapTiles; nothing else needed for two levels |
| **Humanitarian (HOT)** | **Yes, every class**, from z11 | Unpaved casing, and the fill becomes the residential colour ([roads.mss L80-L95, L221](https://github.com/hotosm/HDM-CartoCSS/blob/ff2bb32dc96e5e450dab052be0df0dff40f1c139/roads.mss#L80-L95)): an unpaved primary **loses its class colour**; screenshots: Australia 27, Alberta 40 and Iceland 54 (tiles only partly loaded, tile server slow) change to the thin land-coloured line on the unpaved side | Paved whitelist (4 values); untagged unclassified counts as unpaved | Keep the class colour; repo inactive since 2021 |
| **CyclOSM** | **Yes, from z14**, as bike-type dashes (road / cyclocross / mtb) | `surface_type` in [views.sql L153-L172](https://github.com/cyclosm/cyclosm-cartocss-style/blob/588e9c7b/views.sql#L153-L172); screenshots: dashes on the Namibia gravel and Iceland `surface=compacted` sides; no mark on the Bolivia `surface=compacted`, Australia `surface=gravel` (secondary) and Alberta `surface=unpaved` sides. All three explained by the code (live tiles checked 2026-11-09): Alberta is the `unpaved` gap; the Bolivia unpaved side is `highway=trunk`, and motorway/trunk get no surface rule (dashes start at primary, [roads.mss L2432-L2530](https://github.com/cyclosm/cyclosm-cartocss-style/blob/7b446ca8/roads.mss#L2432-L2530)); the Australia road has `smoothness=good`, which CyclOSM ranks above `surface`, so gravel counts as "road" (a deliberate cycling choice) | Explicit lists; **`surface=unpaved` is in no list**, so 75% of unpaved km gets no mark; no surface rule on trunk and motorway | Add `unpaved` (or a whitelist), and the surface rule on trunk |
| **OsmAnd** | **Optional only**: "Road surface" and "Road quality" overlays, **off by default**, from z14. The OsmAnd web map (osmand.net/map) shows a subtle texture like OSM Carto at all six screenshot spots (2026-11-09) | Coloured overlay line ([default.render.xml L99-L102](https://github.com/osmandapp/OsmAnd-resources/blob/85815c67803a53ed1e4e50b25337d678bac0fa16/rendering_styles/default.render.xml#L99-L102)) | Per-value colours | A default-on Unpaved signal on roads |
| **OsmAnd Motorcycle styles** ([OsmAnd-Rendering/Motorcycle](https://github.com/OsmAnd-Rendering/Motorcycle), third-party) | **Yes, but the class is lost**: unpaved roads are drawn the same as tracks (checked in app 2026-11-09); in the code, primary to residential with gravel or dirt surfaces are repainted in track colour and width, motorway and trunk never (A6) | Track style | (not checked) | Keep the road class and add an Unpaved signal; asked in [discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) |
| **Organic Maps / CoMaps** | **No** (confirmed in both apps 2026-11-09). No style file (default, outdoors, vehicle) uses `psurface` or `surface`; `psurface` is used for routing only | (none) | Paved whitelist exists in the generator | Render `psurface` paved vs unpaved: biggest gap among open apps. Corrects the earlier tracker note that said rendering used it |
| **OpenTopoMap** | **No** on roads; `surface` only separates asphalt from non-asphalt on paths, footways, bridleways, plus ice and snow | `styles-otm/roads-*.xml` | (n/a) | Project only kept online |
| **OSMF Shortbread** (vector.openstreetmap.org) | **No** in the deployed style | (none) | The Shortbread schema already exports the raw `surface` on streets from z11 ([schema 1.0](https://shortbread-tiles.org/schema/1.0/)) | Style change only, no schema change. [Spirit PR #93](https://github.com/pnorman/spirit/pull/93) (Julien's, open): dashes the road casing for an explicit unpaved list. The maintainer (2026-08-20) wants to check confusion with tunnels and with non-motorised ways first; a dashed casing is how OSM Carto draws tunnels (see the mockup references), and the list is not a paved whitelist |
| **Tracestrack Topo** | **Partly**: dashed casing on the unpaved side of Australia 27 (`highway=secondary`), but the same line on both sides of the primary roads (Namibia, Bolivia, Nepal, Iceland, Alberta; 2026-11-09). The unpaved style from issue #67 reaches secondary, not primary or trunk | (none seen) | (closed style) | Extend the unpaved style to main road classes |
| **Komoot** (closed) | **No** surface on the map: legend is by road type ("Track" category); surfaces only in the route summary ("Way types & surfaces") | | | Map rendering of unpaved roads |
| **Mapy.com** (closed, formerly Mapy.cz) | **No** on the basic map (`zakladni`): at all three screenshot spots (Namibia C38, Bolivia RN3, Nepal NH48, 2026-11-08) the paved and unpaved sides are the same solid orange line, and the same at Iceland, Australia and Alberta (2026-11-09); the outdoor map is not checked yet | (none seen) | (unknown) | Paved/unpaved split on main roads; check the outdoor map |
| **Calimoto** (closed) | **Yes, partly**: unpaved segments are drawn thinner (checked in app 2026-11-09); support legend says off-road segments get a light brown background; routing avoids them. Not a serious choice for off-road riding | Thinner line | (unknown) | Check which classes and tags |
| **Kurviger** (OSM-based motorbike app) | **No on the base map**: unpaved shown only on the planned route (red); users keep asking ([forum: different colours for sealed and unsealed roads](https://forum.kurviger.com/t/different-colours-for-sealed-and-unsealed-roads/18588), [enhance visibility of unpaved roads](https://forum.kurviger.com/t/enhance-visibility-of-offroad-tracks-and-unpaved-roads/19355)) | | | Base-map rendering; existing feature requests to join |
| **Gaia GPS** (closed) | **No paved/unpaved split** on Gaia Topo (checked in app 2026-11-09, and same orange line on both sides in the web screenshots): `surface` is not used. But a road with `smoothness=very_bad` or worse is drawn **as a track** (dashed casing, light fill), so the class is lost; Julien sees this on any class (observed by Julien, 2026-11-09; Bolivia [w183429883](https://www.openstreetmap.org/way/183429883), `highway=unclassified`, `surface=ground`, `smoothness=very_bad`). Exception seen: the F10 trunk next to it stays a normal road on both its `smoothness=bad` and `very_bad` parts, so the exact rule is not confirmed ([w251644518](https://www.openstreetmap.org/way/251644518), [w251644517](https://www.openstreetmap.org/way/251644517)). The separate premium **Gaia Overland** layer shows road surfaces | Roads drawn as tracks (dashed casing) | (unknown) | Paved/unpaved split on main roads in Gaia Topo, keeping the class (see D3: credit the dashed outline, not the class change) |
| **Guru Maps** (closed) | **No** (checked in app 2026-11-09) | (none) | (unknown) | Paved/unpaved split on main roads |
| **Maps.me** (closed) | **No** (checked in app 2026-11-09) | (none) | (unknown) | Paved/unpaved split on main roads |
| **Locus Map / LoMaps** (theme-based) | **No** on the web map (LoMaps hikeBike, screenshots 2026-11-09); in the app it depends on the theme (the Voluntary theme shows surfaces) | (none seen) | | Check app themes |
| **Ride with GPS** (closed) | **Yes, but the class is lost**: unpaved roads are drawn as dashed brown lines, the same as tracks (screenshots 2026-11-09, confirmed by Julien), like the OsmAnd Motorcycle styles | Track style | (unknown) | Keep the road class and add an Unpaved signal |
| **MapTiler** (Outdoor, Streets, OMT layer on osm.org) (closed styles) | **No**: same line on both sides (screenshots 2026-11-09, confirmed by Julien) | (none) | OpenMapTiles has paved/unpaved in the schema | Style change only: the schema already has it |
| **DMD2** (closed, motorbike navigation app and web planner) | **Yes, every class seen**, and the **class colour is kept**: unpaved sides of C38 (Namibia), F3 (Bolivia), NH48 (Nepal), road 54 (Iceland), Burke Developmental Road (Australia) and Hwy 40 (Alberta) keep the class colour and get dark dashes in the fill (a dashed fill, corrected by Julien 2026-11-10; screenshots of the web planner by Julien, 2026-11-09). Main roads readable; tracks and paths drawn with many coloured dashes, busy and hard to tell apart | Dark dashes in the fill, class colour kept (dashed fill) | (unknown) | Lighter styling only; the two levels are already there |
| **AllTrails** (closed) | **No**: same solid white line on both sides at all six spots (screenshots by Julien, 2026-11-09). Only tracks are drawn as dashed double lines | (none seen) | (unknown) | Paved/unpaved split on main roads |
| **CalTopo, OpenCycleMap, Transport, Thunderforest Outdoors, Stadia (Alidade Smooth, Outdoors), Protomaps, Strava** | **No**: same line on both sides at all six screenshot spots (2026-11-09) | (none) | | Paved/unpaved split on main roads |

Summary:

1. **Already on every class**: OSM Carto, Americana, HOT, DMD2 (keeps the class colour; tracks and paths busy); CyclOSM from z14 for cycling. Their gaps are the classification (explicit lists instead of a whitelist; CyclOSM misses `surface=unpaved`) or the styling (HOT drops the class colour).
2. **Not at all, or only on request**: Organic Maps, CoMaps, Maps.me, Guru Maps, Gaia GPS (Topo), OsmAnd (overlay off by default; the third-party Motorcycle styles draw unpaved roads like tracks, so the class is lost), OpenTopoMap, Shortbread, Komoot, Kurviger, Mapy.com (basic map), AllTrails. Also no difference in the screenshots: MapTiler (Outdoor, Streets, OMT), Tracestrack (primary and trunk; secondary is dashed), Locus web, CalTopo, OpenCycleMap, Transport, Thunderforest Outdoors, Stadia, Protomaps, Strava. These are the main targets, and Organic Maps and OsmAnd are the most used open apps among riders.
3. **Drawn, but the class is lost**: Ride with GPS and the OsmAnd Motorcycle styles draw unpaved roads like tracks; HOT gives them the residential colour. This is the case our ask "keep the class colour, add one signal" is for.
4. Sources for the closed apps: [Komoot help: map legend](https://www.komoot.com/help/map), [calimoto legend](https://support.calimoto.com/hc/articles/9447607082140), [Gaia Overland map](https://expeditionportal.com/gaia-gps-launches-new-overlanding-map/), Kurviger forum links above.

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
| 11 | Komoot | no | None on the web map (screenshots 2026-11-09) | [Help center, Submit a request](https://support.komoot.com) (no public ideas board) | |
| 12 | Gaia GPS | no | Gaia Topo ignores `surface`; minor roads with `smoothness=very_bad` or worse drawn as tracks, class lost; trunks are not (2026-11-09); premium Overland layer shows surfaces | [Help center community forum](https://help.gaiagps.com/hc/en-us/community/topics); staff treat a post as the official feature request | |
| 13 | Calimoto | no | Unpaved segments drawn thinner (checked in app 2026-11-09) | [Help center](https://support.calimoto.com/hc/en-us) (request form); no public ideas board found | |
| 14 | Guru Maps | no | None (checked in app 2026-11-09) | Support email or Contact Support in the app settings ([docs](https://gurumaps.app/docs/intro)); no official forum | |
| 15 | Maps.me | no | None (checked in app 2026-11-09) | [Help center](https://support.maps.me), then `feedback@maps.me` | |
| 16 | OsmAnd Motorcycle styles | yes | Unpaved roads drawn like tracks, class lost (checked in app 2026-11-09) | GitHub discussions | **[discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22)**: owner agrees (2026-11-09), suggests Julien forks and edits it |
| 17 | Ride with GPS | no | Unpaved roads drawn like tracks (dashed brown), class lost (screenshots 2026-11-09) | [Help center](https://support.ridewithgps.com), Contact Us; no public ideas board found | |
| 18 | Kurviger | no | None on the base map, only on planned routes | Forum | [sealed and unsealed roads](https://forum.kurviger.com/t/different-colours-for-sealed-and-unsealed-roads/18588), [visibility of unpaved roads](https://forum.kurviger.com/t/enhance-visibility-of-offroad-tracks-and-unpaved-roads/19355) |
| 19 | Mapy.com | no | None on the basic map (screenshots 2026-11-08) | In-app feedback (Tools, feedback on Mapy.com: ideas) and the [community forum](https://community.mapy.com/category/4/ideas-for-new-features-nápady-na-nové-vychytávky), ideas category, staff reply there | |
| 20 | MapTiler (Outdoor, Streets, OMT) | no | None (screenshots 2026-11-09); OpenMapTiles schema already has paved/unpaved | MapTiler support for its styles; the schema through [OpenMapTiles GitHub](https://github.com/openmaptiles/openmaptiles/issues) | |
| 21 | Thunderforest (OpenCycleMap, Transport, Outdoors) | no | None (screenshots 2026-11-09) | Email `support (at) thunderforest (dot) com` ([contact](https://www.thunderforest.com/contact/)); no public tracker | |
| 22 | Locus Map / LoMaps | no | None on the web map (screenshots 2026-11-09); app depends on the theme | [Helpdesk ideas](https://help.locusmap.eu), users vote on ideas there | |
| 23 | Strava | no | None (screenshots 2026-11-09) | [Community Hub Ideas board](https://communityhub.strava.com), staff send suggestions there for voting | |
| 24 | CalTopo | no | None (screenshots 2026-11-09) | [Help center forum, Feature Requests](https://help.caltopo.com/hc/en-us/community/topics/4416797631899-Feature-Requests), read by staff | |
| 25 | Stadia Maps (Alidade Smooth, Outdoors) | no | None (screenshots 2026-11-09) | `support@stadiamaps.com`, Discord, OSM US Slack `#stadia-maps` ([support page](https://docs.stadiamaps.com/support/)); no public style repo | |
| 26 | Protomaps basemap | yes | None (screenshots 2026-11-09) | [GitHub issues](https://github.com/protomaps/basemaps/issues) (open, 44 issues) | |
| 27 | AllTrails | no | No paved/unpaved split on main roads (screenshots 2026-11-09) | `support@alltrails.com` or [help center](https://support.alltrails.com); map data questions are often sent back to OSM | |
| 28 | DMD2 | no | Unpaved on every class seen, class colour kept, dark dashes in the fill (screenshots 2026-11-09) | [DMD forum](https://drivemodedashboard.com/forums/) (developer answers requests there); one forum post says talk moved to Discord, not checked | |

## A3. Ranking (updated 2026-11-09 after the screenshots and phone app checks)

1. **CyclOSM**: quick win. It already renders surface on roads; `surface=unpaved` (75% of unpaved km) is missing from its lists. A one-line PR adding `unpaved` to the `cyclocross` or `mtb` list, or a whitelist, fixes most of the gap. Second, smaller gap: trunk roads get no surface dashes at all (Bolivia RN3, a trunk, screenshots and live tiles 2026-11-09). Leave `smoothness` over `surface` alone: it is right for cycling.
2. **OsmAnd**: the overlay already exists, off by default and from z14. Ask for a default-on Unpaved signal on roads. Add to [#9465](https://github.com/osmandapp/OsmAnd/issues/9465). Earlier PR merged.
3. **Organic Maps / CoMaps**: no surface rendering at all, but the paved whitelist already exists in the generator (`psurface`). Ask to draw paved vs unpaved; pitch it as "keep the class colour, add one subtle signal" (a full colour mode was closed as not planned in #11835). Comment on [#8485](https://github.com/organicmaps/organicmaps/issues/8485).
4. **OpenMapTiles / Planetiler (for Americana, MapTiler and Stadia)**: Americana already dashes unpaved roads of every class. Main ask: keep `surface` below z12 on main roads (today it starts at z12, see A4). Second: a paved whitelist, so unknown and local values count as unpaved (small today: the list already covers 99.4% of Unpaved km, A5). MapTiler and Stadia use the same schema but draw no difference: for them it is a style change only, the data is already in their tiles.
5. **Kurviger**: OSM-based motorbike app, unpaved only shown on routes; users already ask on its forum. Join the existing threads.
6. **Shortbread / Spirit**: schema already has `surface`; style change only. Julien's PR #93 is waiting on the maintainer, who asked about tunnel confusion. Before pinging again, update it: a paved whitelist instead of the unpaved list, and a style that does not dash the casing (one of the four mockup styles).
7. **Tracestrack**: fixed issue #67 quickly, and the unpaved style reaches secondary roads (Australia 27 dashed) but not primary or trunk (screenshots 2026-11-09). Ask to extend it to primary and trunk.
8. **OsmAnd Motorcycle styles**: unpaved roads drawn like tracks, so the class is lost. The owner replied on [discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) (2026-11-09): he likes a better look for major unpaved roads, but he is not a developer and suggests Julien clones the project and changes it; he will help, use and promote it. The style and routing are already shipped by the OsmAnd team as a plugin (F-Droid build). He warns that the code is full of hacks around the official style, and that routing matters more to him. Next: Julien's fork with unpaved roads in their class colour, as the phone demo.
9. **Commercial apps**: after the wiki page and demo exist. Ride with GPS draws unpaved roads like tracks (class lost); Calimoto draws them thinner; Gaia GPS (Topo) ignores `surface` but draws minor roads (not trunks) with `smoothness=very_bad` or worse as tracks (class lost, and only on the 5.8% of Unpaved km with evidence at most); Guru Maps, Maps.me, Mapy.com, Thunderforest, Strava and CalTopo show nothing; Komoot shows surface only in route summaries; Locus depends on the theme. Protomaps (open source): check first whether its tile schema exports `surface` at all.
10. **No action**: OSM Carto (credit only, staying passive), HOT (inactive, but its whitelist is the precedent), OpenTopoMap (kept online only), DMD2 (already shows unpaved on every class with the class colour kept: cite it as a precedent from a motorbike app).

## A4. Tile schemas: what surface data reaches the style (2026-11-09)

A style can only draw what its tiles carry. Checked in each schema's source or docs.

| Schema (used by) | Surface | Smoothness, tracktype | From zoom | Source |
|---|---|---|---|---|
| **OpenMapTiles** (Americana, MapTiler, Stadia, OpenFreeMap) | `surface` = `paved` or `unpaved`, from `surface`, else `tracktype`; explicit lists, values in no list get no surface | not kept | **z12** (NULL at z4-11) | [transportation.yaml L205-L210](https://github.com/openmaptiles/openmaptiles/blob/6c11838d3/layers/transportation/transportation.yaml#L205-L210), [transportation.sql L398-L402](https://github.com/openmaptiles/openmaptiles/blob/6c11838d3/layers/transportation/transportation.sql#L398-L402); Planetiler build the same, `setAttrWithMinzoom(..., 12)` ([Transportation.java L537](https://github.com/openmaptiles/planetiler-openmaptiles/blob/5a837b161/src/main/java/org/openmaptiles/layers/Transportation.java#L537)) |
| **Shortbread** 1.0 (OSMF vector tiles) | full `surface` value | `tracktype` kept; no `smoothness` | z11 | [schema 1.0, layer streets](https://github.com/shortbread-tiles/shortbread-docs/blob/897acdf/shortbread-website/content/schema/1.0.md) |
| **Protomaps** basemap | none | none | | [Roads.java](https://github.com/protomaps/basemaps/blob/42ffaaa4a/tiles/src/main/java/com/protomaps/basemap/layers/Roads.java) has no surface field |
| **Mapbox Streets v8** | `surface` = `paved` or `unpaved` "where this data is available from OpenStreetMap" (only in the v7 to v8 changelog, not in the field list) | none (track `type` values `track:grade1-5` exist, origin not stated) | not documented | [Mapbox Streets v8 reference](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/) |
| **OsmAnd** (OBF) | full `surface` values (61 types) | `smoothness` and `tracktype` kept | surface z14, smoothness z13, tracktype z12 | [rendering_types.xml L2592, L2738, L2810](https://github.com/osmandapp/OsmAnd-resources/blob/85815c678/obf_creation/rendering_types.xml#L2738) |
| **Organic Maps / CoMaps** (MWM) | `psurface` = `paved_good`, `paved_bad`, `unpaved_good`, `unpaved_bad`, from `surface` and `smoothness` | folded into `psurface` | with the road | [osm2type.cpp L291-L294, L754](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1b/generator/osm2type.cpp#L754) |

What this means for the ask:

1. **OpenMapTiles has no surface below z12.** Every map on it (Americana, MapTiler, Stadia, OpenFreeMap) can draw unpaved only from z12, whatever the style says. The OpenMapTiles ask is now two things: a paved whitelist, and `surface` at lower zooms on main roads.
2. **Shortbread and OsmAnd already carry the full values**, so a whitelist can be done in the style alone.
3. **Protomaps needs a schema change** before any style can draw unpaved.
4. **Off-road mark:** only OsmAnd and Organic Maps (as `unpaved_bad`) carry what it needs. Shortbread has `tracktype` but not `smoothness`.

### z11 check (2026-11-09)

Screenshots at zoom 11 of the six spots for the apps that draw unpaved at z15 ([examples/screenshots/](examples/screenshots/), folders `<spot>-z11`; `ZOOM=11 node examples/screenshots.ts`). HOT left out (tile server down), Ride with GPS left out (it picks its own zoom after a search).

| App | Unpaved at z11? |
|---|---|
| OSM Carto, OsmAnd web map | **Yes**: the unpaved side is a dotted line in the class colour (low-zoom pattern) in Namibia, Nepal, Iceland and Alberta; faint in Bolivia; Australia's secondary road is too thin to tell |
| Americana | **No** at any spot: OpenMapTiles has no `surface` below z12 |
| Tracestrack | **No** at any spot |
| CyclOSM | No (its surface dashes start at z14 in the code) |

## A5. Provider rules measured against ours (2026-11-09)

Each open provider's paved/unpaved rule, copied from its source, run on the same 20 million km as our stats: [stats/provider-gaps.md](stats/provider-gaps.md) (`node stats/provider-gaps.ts`). Data side only: zoom limits and unstyled classes come on top.

| Provider | Covers our Unpaved, main roads | Covers, all classes | Main gap |
|---|---:|---:|---|
| OSM Carto | 99.5% | 99.4% | Explicit list: misses `surface=laterite` (1,314 km on main roads, 1,972 km in all) and `tracktype` without surface (22,600 km, mostly minor roads) |
| OpenMapTiles (Americana, MapTiler, Stadia) | 99.6% | 99.4% | Same: `tracktype` without surface; the list already has `laterite`. The real gap is zoom: no `surface` below z12 (A4) |
| CyclOSM | 35.2% | 25.7% | **`surface=unpaved` missing: 3.9 million km**, 740,000 km of it on main roads; plus no dashes on trunk |
| Organic Maps / CoMaps (data only) | 99.8% | 99.5% | Data is ready (paved whitelist); nothing is drawn. Small: `concrete:plates` counted as unpaved (3,800 km) |
| HOT Humanitarian | 99.8% | 100% | Over-marks: untagged unclassified and residential count as unpaved (9.3 million km), and `chipseal`, `sett`, `concrete:plates` too |

What this changes:

1. **The whitelist ask is small for OSM Carto and OpenMapTiles**: their lists already cover 99.4% of Unpaved km. A whitelist mainly protects against new and local values; the measurable gains are `laterite` (Carto) and `tracktype` without surface. For OpenMapTiles the zoom limit matters more.
2. **CyclOSM is the one big data gap**: adding `unpaved` takes it from 26% to about 99% of Unpaved km. Still the best first PR.
3. **Organic Maps needs styling only**: its data already matches ours.
4. **HOT is a warning, not a model**: assuming untagged minor roads are unpaved turns 9 million km brown.

## A6. OsmAnd Motorcycle style: code review for the fork (2026-11-10)

Repo [OsmAnd-Rendering/Motorcycle](https://github.com/OsmAnd-Rendering/Motorcycle), commit `f0676ed` (2026-09-05), cloned in `osm-tag-support-tracker/sources/Motorcycle` (wiki in `Motorcycle.wiki`). Licence **GPL v3**: a fork is allowed and must stay GPL v3. Main file `enduro.render.xml` (about 5,000 lines), plus three routing profiles (`gros_trail.xml`, `petit_trail.xml`, `enduro.xml`) and an installer (`installation.osf`). French comments and option names.

**How ways are sorted** ([wiki: hiérarchie des chemins](https://github.com/OsmAnd-Rendering/Motorcycle/wiki/hi%C3%A9rarchie-des-chemins)): five categories, used both for drawing and by the three routing profiles. Two signals: **colour** (brown = material added, green = bare earth) and **dashing** (dashed = looser within the colour).

| Category | Look | Tags |
|---|---|---|
| 1. Easy, drivable | brown `#996600`, solid | `surface` paved, asphalt, concrete, compacted, fine_gravel, chipseal, paving_stones, metal, wood, unhewn_cobblestone; `tracktype=grade1/2` |
| 2. Easy but looser | brown, dashed | `surface` gravel, rock, pebblestone, cobblestone; `grade3` |
| 3. Depends on weather | green `#008800`, solid | `grade4` |
| 4. Bare ground | green, dashed | `surface` dirt, earth, ground, grass, mud, sand, **unpaved**; `grade5`; `smoothness=horrible/very_horrible`; `ford=yes` |
| 5. No information | as 4, or hidden | tracks with none of these tags (option "cacher chemin sans info") |

Colours: `$piste` brown and `$chemin` green ([L242-L261](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L242-L261)), with night, greyscale, "IGN-like" and background-map variants. Tag classes for routing hints: [L520-L570](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L520-L570).

**Roads, the part that loses the class** ([L3640-L3681](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L3640-L3681)): after the road blocks for primary, secondary, tertiary, unclassified and residential, two rules repaint any such road with gravel, compacted, fine_gravel or `grade2/3` in the track brown and track width (`$piste_trait`), and any with ground, dirt, earth, **unpaved** or `grade4/5` in the track green and width (`$chemin_trait`). The road's class colour and width are lost: an unpaved primary looks like a track. Motorway and trunk are in a separate block ([L3327-L3340](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L3327-L3340)) and are never repainted.

What is worth keeping for the fork:

1. **Two signals that read at once**: colour for the kind of surface, dashing for how loose it is. Clear on a phone in the sun (screenshots in the README and `photos.md`).
2. **One classification for map and routing**: the same categories drive the drawing and the three profiles, so what you see is what the router avoids.
3. **"If dry" routing switch** (`gros_trail`): moves categories up one level in dry weather. A good idea for the Off-road mark later.
4. **Option to hide tracks with no information**, and the wiki asking mappers to add `tracktype`, `smoothness` and `surface`: the map as feedback for mapping.
5. **Path difficulty dots** from `mtb:scale` and `sac_scale` (green, orange, red, black), and night, greyscale and iOS low-memory variants.

What to change in the fork (our model):

1. **Keep the class on roads**: do not repaint roads in track colour and width. Keep the class colour and width, and add our Unpaved signal (dashed centre line or dashed casing) on top. Tracks can keep the five categories.
2. **`surface=unpaved` is not bare ground**: it is 75% of unpaved km on main roads and says nothing about roughness. In the fork it is plain Unpaved (no Off-road mark), not green.
3. **Off-road from evidence only**: `smoothness` very_bad or worse, `tracktype` grade4 or worse, `4wd_only` (our classifier, C-statistics decision 11). Now in line with the style: `grade3` is in its easy brown group and gets no mark from us either; `grade4` and `grade5` are its green bare-earth groups.
4. **Explicit lists**: values in no list fall through to the normal road look (paved). Use a paved whitelist, as in our classifier.
5. **Match the shared ladder** (decision 9): solid, long dashes, medium dashes, so the phone demo looks like the web demo.

