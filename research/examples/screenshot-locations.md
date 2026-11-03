# Screenshot locations: paved to unpaved on the same road

One verified spot per continent (2026-11-03). At each point, two ways of the same road meet, one tagged paved and one unpaved, and street-level imagery confirms the surface really changes there. Found with [transitions.ts](transitions.ts) ([transitions.json](transitions.json)).

Only apps and styles that use OSM data are listed: Google, Apple and Bing draw their own data, so this proposal cannot change them. All links open at zoom 15 on the point where the surface changes. Phone-only apps (Organic Maps, CoMaps, OsmAnd app, Calimoto, Kurviger, Guru Maps, Locus): open the `geo:` link on the phone or paste the coordinates.

Why only one per country: of 27 tag transitions checked on imagery, 13 showed a real change and 14 did not (both sides paved, or both gravel or dirt), so every spot needs a look at the images. Other verified spots (Namibia C48, C28, C26, C47, C40; Bolivia RN3 west, RN25, F48) are kept in transitions.json and `images/sheets/transitions/` as backups.

Still to add: Europe (Iceland) and Oceania (Australia), search in progress.

## 1. Africa: Namibia, C38 near Etosha: asphalt to gravel

Point: **-18.81068, 16.9415** (`geo:-18.81068,16.9415?z=15`). Class: `highway=primary`, ref `C38`. Image pair: `images/sheets/transitions/11.jpg`.

Verified: Mapillary images on both sides checked: asphalt, then gravel.

- Paved side: [w551124886](https://www.openstreetmap.org/way/551124886) `surface=asphalt`, 35.1 km, [Mapillary 2017-10-24](https://www.mapillary.com/app/?pKey=319565122947004)
- Unpaved side: [w225220011](https://www.openstreetmap.org/way/225220011) `surface=gravel`, 72.3 km, [Mapillary 2017-10-24](https://www.mapillary.com/app/?pKey=684848622263848)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/-18.81068/16.9415) |
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

## 2. South America: Bolivia, RN3 near Trinidad: asphalt to dirt

Point: **-14.87824, -64.99758** (`geo:-14.87824,-64.99758?z=15`). Class: `highway=trunk`, ref `F3`. Image pair: `images/sheets/transitions/19.jpg`.

Verified: Mapillary images on both sides checked: asphalt, then dirt.

- Paved side: [w353263510](https://www.openstreetmap.org/way/353263510) `surface=asphalt`, 15.3 km, [Mapillary 2023-11-19](https://www.mapillary.com/app/?pKey=264405276700353)
- Unpaved side: [w700419617](https://www.openstreetmap.org/way/700419617) `surface=compacted`, 5.1 km, [Mapillary 2022-09-22](https://www.mapillary.com/app/?pKey=1589823008160588)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/-14.87824/-64.99758) |
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

## 3. Asia: Nepal, NH48 Beni-Lo Manthang (Mustang): asphalt to gravel jeep road

Point: **28.80567, 83.76673** (`geo:28.80567,83.76673?z=15`). Class: `highway=primary`, ref `NH48`. Image pair: `images/sheets/transitions/25.jpg`.

Verified: Mapillary images are from 2014, before the asphalt; transition confirmed by Julien on Google Street View (2026-11-03).

Google Street View at the transition point (user photosphere, May 2025, "© nepal home search"; link only, the images are copyrighted and must not be uploaded):

- [Looking north, towards the side tagged asphalt](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENmZl9nNGwzLW8wcjhLbHVFeHhBZmk.&heading=26): gravel and dirt in this view.
- [Looking south, towards the side tagged gravel](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENmZl9nNGwzLW8wcjhLbHVFeHhBZmk.&heading=213): short concrete bridge deck, then gravel.
- Local copies for checking only (not committed): `images/google/np-nh48-transition-paved.jpg`, `images/google/np-nh48-transition-unpaved.jpg`, side by side in `images/sheets/transitions/25-google.jpg`.

**Tags are reversed here (checked 2026-11-03 on three Street View panoramas, May 2025):** south of the transition, towards Jomsom, the road crosses a long concrete bridge and continues as asphalt with a centre line ([pano 150 m south, looking south](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaEFKeks1QnJWZzhLNzFzbk90RHp0b1A.&heading=213)); north, towards Kagbeni, it is gravel at the transition and 150 m further ([pano 150 m north, looking north](https://www.google.com/maps/@?api=1&map_action=pano&pano=CAoSHENJQUJJaENwSTZqN0RVclhCOHdGWGE5SDNhZUQ.&heading=26)). OSM has the opposite: w384304387 (north, 4.8 km) `surface=asphalt`, w1254665821 and beyond (south) `surface=gravel`. Julien confirmed the asphalt ends just before the bridge. **Fix the tags in OSM first, then take the screenshots** after the tiles update. Local copies: `images/sheets/transitions/25-google-north.jpg`, `25-google-south.jpg`.

- Paved side: [w384304387](https://www.openstreetmap.org/way/384304387) `surface=asphalt`, 4.8 km, [Mapillary 2014-06-25](https://www.mapillary.com/app/?pKey=170085204903842)
- Unpaved side: [w1254665821](https://www.openstreetmap.org/way/1254665821) `surface=gravel`, 4.5 km, [Mapillary 2014-06-25](https://www.mapillary.com/app/?pKey=272466534555985)

| App | Link |
|---|---|
| OSM Carto (Standard) | [open](https://www.openstreetmap.org/#map=15/28.80567/83.76673) |
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

