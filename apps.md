# App reports

*How OpenStreetMap-based maps draw unpaved roads, November 2026*

<!--
Built into apps/index.html by scripts/build-article.py. Keep it fair and factual: app makers will read their own row.
Sources, code links and screenshots: research/A-providers.md and research/examples/screenshots/.
-->

How each map draws a road that changes from paved to unpaved. The web maps were compared on six such roads (Namibia C38, Bolivia RN3, Nepal NH48, Iceland 54, Australia 27, Alberta 40, zoom 15); the phone apps were checked by hand. The proposal and the five styles are in the [article](../).

**Data** says what the map's data or tiles know about the surface, so whether a change is a style change only. **Tracks** says how the map draws `highway=track`, which an Unpaved signal on roads must not look like. "To check" means not verified yet; corrections are welcome as a [GitHub issue](https://github.com/julcnx/unpaved-rendering/issues).

## Show it, keep the class

| Map | Open source | Unpaved on main roads | Data | Tracks | Where to ask |
|---|---|---|---|---|---|
| OSM Carto (openstreetmap.org) | yes | Every class from zoom 6: a fine grain in the class colour | Full `surface`; explicit lists of unpaved values, so unknown values such as `laterite` are drawn as paved | Brown dashes, rhythm by `tracktype` | [GitHub](https://github.com/openstreetmap-carto/openstreetmap-carto/issues) |
| Americana | yes | Every class from zoom 12: lighter dashes of the class colour | Paved or unpaved, from OpenMapTiles, only from zoom 12 | To check | [GitHub](https://github.com/osm-americana/openstreetmap-americana/issues) |
| DMD2 | no | Every class seen: dark dashes in the fill | To check | Many coloured dashes | [DMD forum](https://drivemodedashboard.com/forums/) |
| CyclOSM | yes | From zoom 14, primary and below, as cycling surface dashes. `surface=unpaved` is in none of its lists (75% of unpaved km) and trunks get no surface rule | Full `surface` and `smoothness` (explicit lists) | To check | [GitHub](https://github.com/cyclosm/cyclosm-cartocss-style/issues) |
| Tracestrack Topo | partly | Secondary and below: a dashed outline. Primary and trunk: no difference | To check | To check | [GitHub](https://github.com/tracestrack/tracestrack-maps/issues) |

## Show it, partly

| Map | Open source | Unpaved on main roads | Data | Tracks | Where to ask |
|---|---|---|---|---|---|
| AdvOSM (Garmin maps) | not stated | Every class except service: dashes across the road. Minor roads stay white; the one tertiary checked turned from orange to yellow | `surface`, `smoothness`, `tracktype` and width | To check | Contact form on [the site](https://rex8475.wixsite.com/advosm) |
| Calimoto | no | Unpaved sections drawn thinner | To check | To check | [Help center](https://support.calimoto.com/hc/en-us) |
| OsmAnd | yes | Only with the "Road surface" or "Road quality" overlay, off by default, from zoom 14 | Full `surface`, `smoothness` and `tracktype` | To check | [GitHub](https://github.com/osmandapp/OsmAnd/issues) ([#9465](https://github.com/osmandapp/OsmAnd/issues/9465)) |
| Locus Map | no | Depends on the map theme; not on the LoMaps web map | To check | To check | [Helpdesk ideas](https://help.locusmap.eu) |

## Show it, lose the class

| Map | Open source | Unpaved on main roads | Data | Tracks | Where to ask |
|---|---|---|---|---|---|
| Humanitarian (HOT) | yes | Every class from zoom 11, but the road takes the residential colour, so an unpaved primary looks like a minor street | Paved whitelist; untagged unclassified and residential roads count as unpaved | To check | [GitHub](https://github.com/hotosm/HDM-CartoCSS/issues) ([#104](https://github.com/hotosm/HDM-CartoCSS/issues/104)) |
| Ride with GPS | no | Drawn as dashed brown lines, like tracks | To check | Dashed brown line | [Help center](https://support.ridewithgps.com) |
| OsmAnd Motorcycle styles | yes | Primary to residential with a gravel or dirt surface drawn like tracks; motorway and trunk never | Full `surface` and `tracktype` | Five colour categories by surface and track type | [GitHub discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22) |
| Gaia GPS (Gaia Topo) | no | `surface` is not used. Some roads with very bad `smoothness` are drawn as tracks; the exact rule is to check. The premium Overland layer shows surfaces | To check | Dashed outline, light fill | [Community forum](https://help.gaiagps.com/hc/en-us/community/topics) |

## Do not show it

| Map | Open source | Unpaved on main roads | Data | Tracks | Where to ask |
|---|---|---|---|---|---|
| Organic Maps, CoMaps | yes | No | Paved or unpaved, with good or bad, already in the map data (used for routing only) | To check | [GitHub](https://github.com/organicmaps/organicmaps/issues) ([#8485](https://github.com/organicmaps/organicmaps/issues/8485)) |
| OSMF Shortbread (vector.openstreetmap.org) | yes | No | Full `surface` in the tiles from zoom 11 | To check | [Spirit PR #93](https://github.com/pnorman/spirit/pull/93) (open) |
| MapTiler (Streets, Outdoor) | no | No | Paved or unpaved, from OpenMapTiles, from zoom 12 | To check | [MapTiler support](https://www.maptiler.com/support/) |
| Komoot | no | No; surfaces only in the route summary | To check | Own "Track" category | [Help center](https://support.komoot.com) |
| Mapy.com (basic map) | no | No | To check | To check | [Community forum, ideas](https://community.mapy.com/category/4/ideas-for-new-features-nápady-na-nové-vychytávky) |
| Kurviger | no | Only on the planned route, not on the map | To check | To check | [Forum](https://forum.kurviger.com/t/different-colours-for-sealed-and-unsealed-roads/18588) |
| AllTrails | no | No | To check | Dashed double line | [Help center](https://support.alltrails.com) |
| Maps.me | no | No | To check | To check | [Help center](https://support.maps.me) |
| Guru Maps | no | No | To check | To check | [Documentation](https://gurumaps.app/docs/intro), support in the app |
| OpenTopoMap | yes | No; surface only on paths | Full `surface` | Dashes | [GitHub](https://github.com/der-stefan/OpenTopoMap/issues) |
| Thunderforest (OpenCycleMap, Transport, Outdoors) | no | No | To check | To check | [Contact](https://www.thunderforest.com/contact/) |
| Stadia Maps (Alidade Smooth, Outdoors) | no | No | Paved or unpaved, from OpenMapTiles, from zoom 12 (to check) | To check | [Support](https://docs.stadiamaps.com/support/) |
| Strava | no | No | To check | To check | [Community Hub ideas](https://communityhub.strava.com) |
| CalTopo | no | No | To check | To check | [Feature requests](https://help.caltopo.com/hc/en-us/community/topics/4416797631899-Feature-Requests) |
| Protomaps basemap | yes | No | No surface in the tiles: a schema change comes first | To check | [GitHub](https://github.com/protomaps/basemaps/issues) |

## Where the classifier goes

For open-source maps: where the surface is classified today, and which ready-made version of the paved whitelist fits. All versions pass the same [67 test cases](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/test-cases.json).

| Map | Where the surface is classified | Version to use |
|---|---|---|
| OSM Carto | SQL lists in `project.mml` | [SQL](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/classify.sql) |
| CyclOSM | SQL in `views.sql` | [SQL](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/classify.sql) |
| Humanitarian (HOT) | Style rules with a paved list | [SQL](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/classify.sql), to check |
| Any osm2pgsql flex or tilemaker pipeline | Lua import script | [Lua](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/classify.lua) |
| OSMF Shortbread (Spirit) | The style itself: tiles carry the raw `surface` | A whitelist expression in the style; [JavaScript](https://github.com/julcnx/unpaved-rendering/blob/master/js/classify.js) as reference |
| Americana, MapTiler, Stadia, OpenFreeMap | Upstream in OpenMapTiles (SQL) and Planetiler (Java) | Whitelist upstream; [SQL](https://github.com/julcnx/unpaved-rendering/blob/master/research/classifier/classify.sql) as reference |
| OsmAnd | Rendering style rules (the map files carry `surface`) | Rules in the rendering style |
| Organic Maps, CoMaps | The map generator already has a paved whitelist | Nothing: style change only |
| Protomaps | No surface in the tiles | Schema change first |

## Tile schemas

A style can only draw what its tiles carry.

| Schema | Used by | Surface | From zoom |
|---|---|---|---|
| OpenMapTiles | Americana, MapTiler, Stadia, OpenFreeMap | Paved or unpaved | 12 |
| Shortbread | OSMF vector tiles | Full `surface` and `tracktype` | 11 |
| OsmAnd (OBF) | OsmAnd | Full `surface`, `smoothness` and `tracktype` | 12 to 14 |
| Organic Maps (MWM) | Organic Maps, CoMaps | Paved or unpaved, good or bad | with the road |
| Protomaps | Protomaps basemap | None | |
| Mapbox Streets v8 | Mapbox-based maps | Paved or unpaved, where OSM has it | not documented |
