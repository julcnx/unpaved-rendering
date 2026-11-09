# Screenshot locations: paved to unpaved on the same road

One verified spot per continent (2026-11-03, Iceland and Australia 2026-11-09). At each point, two ways of the same road meet, one tagged paved and one unpaved, and street-level imagery confirms the surface really changes there. Found with [transitions.ts](transitions.ts) ([transitions.json](transitions.json)).

Only apps and styles that use OSM data are listed: Google, Apple and Bing draw their own data, so this proposal cannot change them. All links open at zoom 15 on the point where the surface changes. Phone-only apps (Organic Maps, CoMaps, OsmAnd app, Calimoto, Guru Maps, Maps.me): open the `geo:` link on the phone or paste the coordinates.

Why only one per country: of 27 tag transitions checked on imagery, 13 showed a real change and 14 did not (both sides paved, or both gravel or dirt), so every spot needs a look at the images. Other verified spots (Namibia C48, C28, C26, C47, C40; Bolivia RN3 west, RN25, F48) are kept in transitions.json and `images/sheets/transitions/` as backups.

Iceland and Australia were added on 2026-11-09. Of the 10 Iceland and Australia pairs checked on Mapillary, 5 showed a real change (Iceland 85, 54, 731, 208; Australia 27), 4 did not (Iceland 63 and 60: gravel on both sides; Gibb River Road and Australia 19: dirt on both sides) and 1 was unclear (Australia 12). The other real ones are backups in `images/sheets/transitions/`.

## 1. Africa: Namibia, C38 near Etosha: asphalt to gravel

Point: **-18.81068, 16.9415** (`geo:-18.81068,16.9415?z=15`). Class: `highway=primary`, ref `C38`. Image pair: `images/sheets/transitions/11.jpg`.

Verified: Mapillary images on both sides checked: asphalt, then gravel.

- Paved side: [w551124886](https://www.openstreetmap.org/way/551124886) `surface=asphalt`, 35.1 km, [Mapillary 2017-10-24](https://www.mapillary.com/app/?pKey=319565122947004)
- Unpaved side: [w225220011](https://www.openstreetmap.org/way/225220011) `surface=gravel`, 72.3 km, [Mapillary 2017-10-24](https://www.mapillary.com/app/?pKey=684848622263848)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=M) |
| CyclOSM | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=Y) |
| Humanitarian (HOT) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=H) |
| Tracestrack Topo | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=P) |
| OSMF Shortbread (vector) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=S) |
| MapTiler OMT (OpenMapTiles) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=V) |
| OpenTopoMap | [open](https://opentopomap.org/#map=15/-18.81068/16.9415) |
| Americana | [open](https://americanamap.org/#map=15/-18.81068/16.9415) |
| Komoot | [open](https://www.komoot.com/plan/@-18.81068,16.9415,15z) |
| Mapy.com | [open](https://mapy.com/en/zakladni?x=16.9415&y=-18.81068&z=15) |
| Gaia GPS (longitude first) | [open](https://www.gaiagps.com/map/?loc=15/16.9415/-18.81068) |
| OsmAnd web | [open](https://osmand.net/map/?#15/-18.81068/16.9415) |
| OpenCycleMap (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=C) |
| Transport (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415&layers=T) |
| Locus Map (LoMaps) | [open](https://web.locusmap.app/en/plan?lat=-18.81068&lng=16.9415&z=15&map=hikeBike) |
| Strava | [open](https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#15/-18.81068/16.9415) |
| Kurviger (marker on the point, no zoom in the URL) | [open](https://kurviger.com/en/plan?point=-18.81068%2C16.9415) |
| Thunderforest Outdoors (no location in the URL: search or pan) | [open](https://www.thunderforest.com/maps/outdoors/preview/) |
| MapTiler Outdoor | [open](https://www.maptiler.com/maps/#style=outdoor-v4&mode=2d&position=15/-18.81068/16.9415) |
| MapTiler Streets | [open](https://www.maptiler.com/maps/#style=streets-v4&mode=2d&position=15/-18.81068/16.9415) |
| CalTopo (MapBuilder Topo) | [open](https://caltopo.com/map.html#ll=-18.81068,16.9415&z=15&b=mbt) |
| AllTrails (blocks automated browsers: screenshot by hand) | [open](https://www.alltrails.com/explore?b_tl_lat=-18.79568&b_tl_lng=16.91550&b_br_lat=-18.82568&b_br_lng=16.96750) |
| Stadia Alidade Smooth | [open](https://stadiamaps.com/explore-the-map/#style=alidade_smooth&map=15/-18.81068/16.9415) |
| Stadia Outdoors | [open](https://stadiamaps.com/explore-the-map/#style=outdoors&map=15/-18.81068/16.9415) |
| Protomaps basemap | [open](https://maps.protomaps.com/#map=15/-18.81068/16.9415&flavorName=light&lang=en) |
| Ride with GPS (no location in the URL: paste the coordinates in the search box) | [open](https://ridewithgps.com/routes/new) |
| DMD2 planner (no location in the URL: search the coordinates) | [open](https://hub.dmdnavigation.com/planner/) |

## 2. South America: Bolivia, RN3 near Trinidad: asphalt to dirt

Point: **-14.87824, -64.99758** (`geo:-14.87824,-64.99758?z=15`). Class: `highway=trunk`, ref `F3`. Image pair: `images/sheets/transitions/19.jpg`.

Verified: Mapillary images on both sides checked: asphalt, then dirt.

- Paved side: [w353263510](https://www.openstreetmap.org/way/353263510) `surface=asphalt`, 15.3 km, [Mapillary 2023-11-19](https://www.mapillary.com/app/?pKey=264405276700353)
- Unpaved side: [w700419617](https://www.openstreetmap.org/way/700419617) `surface=compacted`, 5.1 km, [Mapillary 2022-09-22](https://www.mapillary.com/app/?pKey=1589823008160588)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=M) |
| CyclOSM | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=Y) |
| Humanitarian (HOT) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=H) |
| Tracestrack Topo | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=P) |
| OSMF Shortbread (vector) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=S) |
| MapTiler OMT (OpenMapTiles) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=V) |
| OpenTopoMap | [open](https://opentopomap.org/#map=15/-14.87824/-64.99758) |
| Americana | [open](https://americanamap.org/#map=15/-14.87824/-64.99758) |
| Komoot | [open](https://www.komoot.com/plan/@-14.87824,-64.99758,15z) |
| Mapy.com | [open](https://mapy.com/en/zakladni?x=-64.99758&y=-14.87824&z=15) |
| Gaia GPS (longitude first) | [open](https://www.gaiagps.com/map/?loc=15/-64.99758/-14.87824) |
| OsmAnd web | [open](https://osmand.net/map/?#15/-14.87824/-64.99758) |
| OpenCycleMap (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=C) |
| Transport (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758&layers=T) |
| Locus Map (LoMaps) | [open](https://web.locusmap.app/en/plan?lat=-14.87824&lng=-64.99758&z=15&map=hikeBike) |
| Strava | [open](https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#15/-14.87824/-64.99758) |
| Kurviger (marker on the point, no zoom in the URL) | [open](https://kurviger.com/en/plan?point=-14.87824%2C-64.99758) |
| Thunderforest Outdoors (no location in the URL: search or pan) | [open](https://www.thunderforest.com/maps/outdoors/preview/) |
| MapTiler Outdoor | [open](https://www.maptiler.com/maps/#style=outdoor-v4&mode=2d&position=15/-14.87824/-64.99758) |
| MapTiler Streets | [open](https://www.maptiler.com/maps/#style=streets-v4&mode=2d&position=15/-14.87824/-64.99758) |
| CalTopo (MapBuilder Topo) | [open](https://caltopo.com/map.html#ll=-14.87824,-64.99758&z=15&b=mbt) |
| AllTrails (blocks automated browsers: screenshot by hand) | [open](https://www.alltrails.com/explore?b_tl_lat=-14.86324&b_tl_lng=-65.02358&b_br_lat=-14.89324&b_br_lng=-64.97158) |
| Stadia Alidade Smooth | [open](https://stadiamaps.com/explore-the-map/#style=alidade_smooth&map=15/-14.87824/-64.99758) |
| Stadia Outdoors | [open](https://stadiamaps.com/explore-the-map/#style=outdoors&map=15/-14.87824/-64.99758) |
| Protomaps basemap | [open](https://maps.protomaps.com/#map=15/-14.87824/-64.99758&flavorName=light&lang=en) |
| Ride with GPS (no location in the URL: paste the coordinates in the search box) | [open](https://ridewithgps.com/routes/new) |
| DMD2 planner (no location in the URL: search the coordinates) | [open](https://hub.dmdnavigation.com/planner/) |

## 3. Asia: Nepal, NH48 Beni-Lo Manthang (Mustang): asphalt to gravel jeep road

Point: **28.80567, 83.76673** (`geo:28.80567,83.76673?z=15`). Class: `highway=primary`, ref `NH48`. Image pair: `images/sheets/transitions/25.jpg`.

Verified: Mapillary images are from 2014, before the asphalt; transition confirmed by Julien on Google Street View (2026-11-03).

Google Street View at the transition point (user photosphere, May 2025, "© nepal home search"; link only, the images are copyrighted and must not be uploaded):

- [Looking north, towards the side tagged asphalt](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENmZl9nNGwzLW8wcjhLbHVFeHhBZmk.&heading=26): gravel and dirt in this view.
- [Looking south, towards the side tagged gravel](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENmZl9nNGwzLW8wcjhLbHVFeHhBZmk.&heading=213): short concrete bridge deck, then gravel.
- Local copies for checking only (not committed): `images/google/np-nh48-transition-paved.jpg`, `images/google/np-nh48-transition-unpaved.jpg`, side by side in `images/sheets/transitions/25-google.jpg`.

**Tags are reversed here (checked 2026-11-03 on three Street View panoramas, May 2025):** south of the transition, towards Jomsom, the road crosses a long concrete bridge and continues as asphalt with a centre line ([pano 150 m south, looking south](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaEFKeks1QnJWZzhLNzFzbk90RHp0b1A.&heading=213)); north, towards Kagbeni, it is gravel at the transition and 150 m further ([pano 150 m north, looking north](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENwSTZqN0RVclhCOHdGWGE5SDNhZUQ.&heading=26)). OSM has the opposite: w384304387 (north, 4.8 km) `surface=asphalt`, w1254665821 and beyond (south) `surface=gravel`. Julien confirmed the asphalt ends just before the bridge. Screenshots were taken with the OSM tags as they are (2026-11-08): the goal is to show how each map draws a paved and an unpaved OSM section side by side, not the ground truth. The tags still need fixing in OSM. Local copies: `images/sheets/transitions/25-google-north.jpg`, `25-google-south.jpg`.

- Paved side: [w384304387](https://www.openstreetmap.org/way/384304387) `surface=asphalt`, 4.8 km, [Mapillary 2014-06-25](https://www.mapillary.com/app/?pKey=170085204903842)
- Unpaved side: [w1254665821](https://www.openstreetmap.org/way/1254665821) `surface=gravel`, 4.5 km, [Mapillary 2014-06-25](https://www.mapillary.com/app/?pKey=272466534555985)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=M) |
| CyclOSM | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=Y) |
| Humanitarian (HOT) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=H) |
| Tracestrack Topo | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=P) |
| OSMF Shortbread (vector) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=S) |
| MapTiler OMT (OpenMapTiles) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=V) |
| OpenTopoMap | [open](https://opentopomap.org/#map=15/28.80567/83.76673) |
| Americana | [open](https://americanamap.org/#map=15/28.80567/83.76673) |
| Komoot | [open](https://www.komoot.com/plan/@28.80567,83.76673,15z) |
| Mapy.com | [open](https://mapy.com/en/zakladni?x=83.76673&y=28.80567&z=15) |
| Gaia GPS (longitude first) | [open](https://www.gaiagps.com/map/?loc=15/83.76673/28.80567) |
| OsmAnd web | [open](https://osmand.net/map/?#15/28.80567/83.76673) |
| OpenCycleMap (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=C) |
| Transport (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673&layers=T) |
| Locus Map (LoMaps) | [open](https://web.locusmap.app/en/plan?lat=28.80567&lng=83.76673&z=15&map=hikeBike) |
| Strava | [open](https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#15/28.80567/83.76673) |
| Kurviger (marker on the point, no zoom in the URL) | [open](https://kurviger.com/en/plan?point=28.80567%2C83.76673) |
| Thunderforest Outdoors (no location in the URL: search or pan) | [open](https://www.thunderforest.com/maps/outdoors/preview/) |
| MapTiler Outdoor | [open](https://www.maptiler.com/maps/#style=outdoor-v4&mode=2d&position=15/28.80567/83.76673) |
| MapTiler Streets | [open](https://www.maptiler.com/maps/#style=streets-v4&mode=2d&position=15/28.80567/83.76673) |
| CalTopo (MapBuilder Topo) | [open](https://caltopo.com/map.html#ll=28.80567,83.76673&z=15&b=mbt) |
| AllTrails (blocks automated browsers: screenshot by hand) | [open](https://www.alltrails.com/explore?b_tl_lat=28.82067&b_tl_lng=83.74073&b_br_lat=28.79067&b_br_lng=83.79273) |
| Stadia Alidade Smooth | [open](https://stadiamaps.com/explore-the-map/#style=alidade_smooth&map=15/28.80567/83.76673) |
| Stadia Outdoors | [open](https://stadiamaps.com/explore-the-map/#style=outdoors&map=15/28.80567/83.76673) |
| Protomaps basemap | [open](https://maps.protomaps.com/#map=15/28.80567/83.76673&flavorName=light&lang=en) |
| Ride with GPS (no location in the URL: paste the coordinates in the search box) | [open](https://ridewithgps.com/routes/new) |
| DMD2 planner (no location in the URL: search the coordinates) | [open](https://hub.dmdnavigation.com/planner/) |

## 4. Europe: Iceland, road 54 Snæfellsnesvegur: asphalt to gravel

Point: **64.99903, -22.7612** (`geo:64.99903,-22.7612?z=15`). Class: `highway=primary`, ref `54`. Image pair: `images/sheets/transitions/is-54.jpg`.

Verified: Mapillary images on both sides checked (2025-09-07): asphalt with lines and guardrails, then gravel.

- Paved side: [w190297031](https://www.openstreetmap.org/way/190297031) `surface=asphalt`, 162.5 km, [Mapillary 2025-09-07](https://www.mapillary.com/app/?pKey=1326823772617499)
- Unpaved side: [w32573487](https://www.openstreetmap.org/way/32573487) `surface=compacted`, 11.4 km, [Mapillary 2025-09-07](https://www.mapillary.com/app/?pKey=1258868666128957)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=M) |
| CyclOSM | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=Y) |
| Humanitarian (HOT) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=H) |
| Tracestrack Topo | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=P) |
| OSMF Shortbread (vector) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=S) |
| MapTiler OMT (OpenMapTiles) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=V) |
| OpenTopoMap | [open](https://opentopomap.org/#map=15/64.99903/-22.7612) |
| Americana | [open](https://americanamap.org/#map=15/64.99903/-22.7612) |
| Komoot | [open](https://www.komoot.com/plan/@64.99903,-22.7612,15z) |
| Mapy.com | [open](https://mapy.com/en/zakladni?x=-22.7612&y=64.99903&z=15) |
| Gaia GPS (longitude first) | [open](https://www.gaiagps.com/map/?loc=15/-22.7612/64.99903) |
| OsmAnd web | [open](https://osmand.net/map/?#15/64.99903/-22.7612) |
| OpenCycleMap (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=C) |
| Transport (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/64.99903/-22.7612&layers=T) |
| Locus Map (LoMaps) | [open](https://web.locusmap.app/en/plan?lat=64.99903&lng=-22.7612&z=15&map=hikeBike) |
| Strava | [open](https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#15/64.99903/-22.7612) |
| Kurviger (marker on the point, no zoom in the URL) | [open](https://kurviger.com/en/plan?point=64.99903%2C-22.7612) |
| Thunderforest Outdoors (no location in the URL: search or pan) | [open](https://www.thunderforest.com/maps/outdoors/preview/) |
| MapTiler Outdoor | [open](https://www.maptiler.com/maps/#style=outdoor-v4&mode=2d&position=15/64.99903/-22.7612) |
| MapTiler Streets | [open](https://www.maptiler.com/maps/#style=streets-v4&mode=2d&position=15/64.99903/-22.7612) |
| CalTopo (MapBuilder Topo) | [open](https://caltopo.com/map.html#ll=64.99903,-22.7612&z=15&b=mbt) |
| AllTrails (blocks automated browsers: screenshot by hand) | [open](https://www.alltrails.com/explore?b_tl_lat=65.01403&b_tl_lng=-22.78720&b_br_lat=64.98403&b_br_lng=-22.73520) |
| Stadia Alidade Smooth | [open](https://stadiamaps.com/explore-the-map/#style=alidade_smooth&map=15/64.99903/-22.7612) |
| Stadia Outdoors | [open](https://stadiamaps.com/explore-the-map/#style=outdoors&map=15/64.99903/-22.7612) |
| Protomaps basemap | [open](https://maps.protomaps.com/#map=15/64.99903/-22.7612&flavorName=light&lang=en) |
| Ride with GPS (no location in the URL: paste the coordinates in the search box) | [open](https://ridewithgps.com/routes/new) |
| DMD2 planner (no location in the URL: search the coordinates) | [open](https://hub.dmdnavigation.com/planner/) |

## 5. Oceania: Australia, Burke Developmental Road (27) in Queensland: asphalt to gravel

Point: **-17.15373, 144.51059** (`geo:-17.15373,144.51059?z=15`). Class: `highway=secondary`, ref `27`. Image pair: `images/sheets/transitions/au-27.jpg`.

Verified: Mapillary images on both sides checked (2021-07-10): asphalt with a centre line, then gravel.

- Paved side: [w686250439](https://www.openstreetmap.org/way/686250439) `surface=asphalt`, 29.7 km, [Mapillary 2021-07-10](https://www.mapillary.com/app/?pKey=130852243047290)
- Unpaved side: [w686611856](https://www.openstreetmap.org/way/686611856) `surface=gravel`, 3 km, [Mapillary 2021-07-10](https://www.mapillary.com/app/?pKey=185372890666546)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=M) |
| CyclOSM | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=Y) |
| Humanitarian (HOT) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=H) |
| Tracestrack Topo | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=P) |
| OSMF Shortbread (vector) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=S) |
| MapTiler OMT (OpenMapTiles) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=V) |
| OpenTopoMap | [open](https://opentopomap.org/#map=15/-17.15373/144.51059) |
| Americana | [open](https://americanamap.org/#map=15/-17.15373/144.51059) |
| Komoot | [open](https://www.komoot.com/plan/@-17.15373,144.51059,15z) |
| Mapy.com | [open](https://mapy.com/en/zakladni?x=144.51059&y=-17.15373&z=15) |
| Gaia GPS (longitude first) | [open](https://www.gaiagps.com/map/?loc=15/144.51059/-17.15373) |
| OsmAnd web | [open](https://osmand.net/map/?#15/-17.15373/144.51059) |
| OpenCycleMap (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=C) |
| Transport (Thunderforest) | [open](https://www.openstreetmap.org/#map=15/-17.15373/144.51059&layers=T) |
| Locus Map (LoMaps) | [open](https://web.locusmap.app/en/plan?lat=-17.15373&lng=144.51059&z=15&map=hikeBike) |
| Strava | [open](https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#15/-17.15373/144.51059) |
| Kurviger (marker on the point, no zoom in the URL) | [open](https://kurviger.com/en/plan?point=-17.15373%2C144.51059) |
| Thunderforest Outdoors (no location in the URL: search or pan) | [open](https://www.thunderforest.com/maps/outdoors/preview/) |
| MapTiler Outdoor | [open](https://www.maptiler.com/maps/#style=outdoor-v4&mode=2d&position=15/-17.15373/144.51059) |
| MapTiler Streets | [open](https://www.maptiler.com/maps/#style=streets-v4&mode=2d&position=15/-17.15373/144.51059) |
| CalTopo (MapBuilder Topo) | [open](https://caltopo.com/map.html#ll=-17.15373,144.51059&z=15&b=mbt) |
| AllTrails (blocks automated browsers: screenshot by hand) | [open](https://www.alltrails.com/explore?b_tl_lat=-17.13873&b_tl_lng=144.48459&b_br_lat=-17.16873&b_br_lng=144.53659) |
| Stadia Alidade Smooth | [open](https://stadiamaps.com/explore-the-map/#style=alidade_smooth&map=15/-17.15373/144.51059) |
| Stadia Outdoors | [open](https://stadiamaps.com/explore-the-map/#style=outdoors&map=15/-17.15373/144.51059) |
| Protomaps basemap | [open](https://maps.protomaps.com/#map=15/-17.15373/144.51059&flavorName=light&lang=en) |
| Ride with GPS (no location in the URL: paste the coordinates in the search box) | [open](https://ridewithgps.com/routes/new) |
| DMD2 planner (no location in the URL: search the coordinates) | [open](https://hub.dmdnavigation.com/planner/) |
