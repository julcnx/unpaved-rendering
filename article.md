# Mind the Surface: A Main Road Is Not Always Paved

<!--
DRAFT 1 (2026-11-11). Figures are marked FIGURE; the site (index page) places them.
Numbers are quoted from research/stats/key-numbers.md only, so every text stays consistent when the stats are rerun.
Reused later for: OSM diary (short version), forum post, wiki page (tag mapping only).
-->

<!-- FIGURE hero: Namibia C48 in Komoot, pins A (Paved) and B (Unpaved), photos by tallguy (Mapillary, CC BY-SA 4.0).
Caption: "Namibia, C48, a primary road. The asphalt ends and 19 km of unpaved road begin (tagged surface=gravel). On the map, it is the same orange line." -->

Most map apps draw an unpaved main road exactly like an asphalt one. In large parts of the world that is not a detail: a quarter of the roads mapped in OpenStreetMap are unpaved, including many of the primary and secondary roads that link towns. This proposal asks map makers to keep each road's class colour and add one subtle signal for **Unpaved**. An optional **Off-road** mark can show the roughest ones, where the data supports it.

[Live demo](demo/) · [App reports](apps/) · [Evidence](evidence/)

## 1. The misconception

A red or orange road on a map reads as "a proper road". Most people take that to mean asphalt, and most maps agree with them: when a road has no `surface` tag it is drawn as paved, and when it does have one, most styles ignore it anyway.

So the map tells the same story for the C48 in Namibia on both sides of the point where the asphalt stops. A driver in a rental car, a cyclist planning a day, a rider on a road bike, an aid convoy working out how long a trip will take: all of them see one orange line, and only find out on the ground that the next 19 km are gravel.

The data to tell them is already in OpenStreetMap. Mappers have tagged millions of kilometres of road as unpaved. The map just does not show it.

## 2. How common unpaved main roads are

We classified 20.0 million km of road in 54 countries, from motorways to residential streets (tracks and service roads left out).

- **At least 26.4% is unpaved.** That counts every road without a `surface` tag as paved. Among the roads that do have a surface tag, 63.1% are unpaved.
- **Main roads too.** The share of unpaved primary roads is 87% in Gabon, 66% in Namibia, 64% in DR Congo and 58% in Bolivia. For secondary roads it reaches 95% in Namibia and 88% in Mali. In 18 of the 54 countries, more than half of the tertiary roads are unpaved.
- **In long distances.** Brazil has 41,896 km of unpaved trunk, primary and secondary roads, Namibia 28,611 km, DR Congo 27,346 km and Australia 26,918 km.
- **Not only in Africa or South America.** Iceland, Australia, Chile, New Zealand, Finland and Romania all have large unpaved shares on their secondary, tertiary or unclassified roads, and their data is well tagged, so the numbers are solid. Motorways are the exception: 41 km unpaved out of 128,817 km.

**These numbers are conservative.** We compared them with the last official road statistics of the CIA World Factbook for 34 countries. In 15 the official unpaved share falls inside our range, in 18 it is higher, in 1 it is lower. Where OSM and official figures disagree, the real world has more unpaved road, not less. And where tagging is weakest (India, Indonesia, Myanmar and Vietnam have no surface on 88 to 91% of their roads), the map looks most paved.

**The tags hold up on the ground.** We checked 55 roads tagged unpaved on street-level imagery: 41 are unpaved, 9 have been paved since (16%), 5 are mixed.

<!-- FIGURE: bar chart, unpaved share by road class for 8 to 10 countries. -->
<!-- FIGURE: photo grid, one confirmed unpaved road per country (about 12, across continents); caption per photo: road, class, author, CC BY-SA. Full grid on the Evidence page. -->

## 3. What apps show today

We checked about 30 OSM-based maps and apps: the web maps on the same six roads, each changing from paved to unpaved, and the phone apps by hand. They fall into three groups.

1. **They show it and keep the class.** OSM Carto (the default map on openstreetmap.org), Americana and DMD2 draw unpaved roads in their class colour with an added pattern. CyclOSM does it from zoom 14, for cycling.
2. **They do not show it.** Organic Maps, OsmAnd (unless an overlay is turned on), Komoot, Gaia GPS Topo, AllTrails, MapTiler, Mapy.com and many more draw the paved and the unpaved part of the same road as one identical line.
3. **They show it, but the class is lost.** Ride with GPS and the OsmAnd Motorcycle styles draw unpaved roads like tracks. The Humanitarian style gives them the colour of residential streets. Gaia GPS draws some roads with very bad smoothness as tracks.

The third group shows why the class matters. A trunk road drawn like a track no longer says that it is the main route between two towns. And when an important road looks like a track, mappers who want the map to look right may change its `highway` tag to match, which spreads wrong data. The road class says how important a road is; the surface says what it is like to drive. One signal for both makes both harder to read.

Gaia GPS shows the right instinct, a dashed outline, but applies it by turning roads into tracks. Keep the outline, keep the class.

<!-- FIGURE: one spot (Namibia C38) in 8 to 12 apps, side by side. Full set per app on the App reports page. -->

## 4. The ask: two levels

Every road gets one of two levels from its tags:

| Level | Rule |
|---|---|
| **Paved** | `surface` is a paved value, or there is no `surface` and `tracktype=grade1`, or there is no tag at all on a road |
| **Unpaved** | any other `surface` value, or no `surface` and `tracktype=grade2` or higher |

The paved values are a whitelist: `paved`, `asphalt`, `chipseal`, `concrete`, `concrete:plates`, `paving_stones`, `sett`, `bricks`, `metal`, `cobblestone` and `cobblestone:flattened`. `wood`, `concrete:lanes` and `grass_paver` count as paved only when `smoothness` is `bad` or better. A value with several parts (`asphalt;gravel`) is unpaved if any part is.

**Why a whitelist.** Most styles today list the unpaved values instead. Any value missing from that list, a local material, a new value, a typo, is then drawn as paved. With a whitelist, it is drawn as unpaved, which is the safer mistake.

**Why only two levels.** Three quarters of all unpaved km (75.5%) are tagged simply `surface=unpaved`. On the ground that can mean a smooth graded road or a muddy track; the photos confirm both. Any finer split on the map would mostly be a guess. Routers, which see the whole route and how much of it is unpaved, are better placed to judge how hard a trip is.

**Untagged roads stay paved.** The proposal only draws what mappers have tagged. It never guesses that a road is unpaved.

## 5. Optional: the Off-road mark

On unpaved roads only, a map can add a mark for roads that need a high-clearance vehicle, when the tags say so:

- `smoothness=very_bad` or worse
- `tracktype=grade3` or higher
- `4wd_only=yes`, `recommended` or `extreme`

The mark is never shown on paved roads: a potholed asphalt road is still paved, and routers can still use its `smoothness`.

The mark is optional because the evidence is rare. Only 5.8% of unpaved km carry `smoothness`, `tracktype` or `4wd_only`, and 3.6% get the mark. In some countries it is common (36% of unpaved km in Bolivia, 25% in Iceland, where the F-roads are tagged `4wd_only`); in most it is close to zero. A mark that appears only where someone added a tag looks patchy, so the two base levels are the real ask.

| Country | Unpaved km | With evidence | Off-road mark |
|---|---:|---:|---:|
| Bolivia | 175,701 | 41.0% | 36.4% |
| Iceland | 8,472 | 28.7% | 25.0% |
| Nepal | 18,627 | 21.8% | 5.8% |
| Namibia | 46,985 | 10.4% | 4.2% |
| Australia | 459,377 | 4.8% | 3.6% |
| Brazil | 1,535,920 | 2.0% | 1.0% |

## 6. How to draw it

The principle: **the class colour stays, the surface adds one signal.** The two base levels should be readable without a legend.

<!-- FIGURE: slider, Namibia C38 at Namutoni, No style vs style 4 (demo, hillshade, z16). -->

We drew five styles, from faint to strong:

1. **Grain fill**: a fine grain inside the road fill. This is the approach of OSM Carto, and the most subtle.
2. **Dashed centre line**: a thin dashed line along the middle of the road. Not meant for OSM Carto, which already uses the middle of the road for access restrictions, but a good fit for maps where fill patterns are hard to draw.
3. **Dashed fill**: dashes in a band along the middle of the fill.
4. **Dashed casing**: the outline is dashed, the fill stays continuous.
5. **Dashed fill, full width**: dashes across the whole road, as Americana does.

There is no single default. Each map should pick the style that fits its design, and above all one that stays distinct from how it draws tracks, tunnels (often a dashed outline) and roads under construction (often a dashed fill).

The **Off-road** mark uses the same pattern, only darker. The legend needs two short words: **Unpaved** and **Off-road**.

All styles keep each class's colour and were tuned per class on white, forest, sand, hillshade and dark backgrounds, and checked for colour blindness. When a road is thinner than about 6 pixels, at low zoom, patterns blur, so every style becomes a plain tint of the class colour.

<!-- FIGURE: live demo (iframe, one map, five style chips, five backgrounds). Link: open the full demo. -->
<!-- FIGURE: the five styles side by side (static 2 x 3 grid image, for the diary and print). -->
<!-- FIGURE: one road at zoom 12, 14 and 16 (low-zoom tint). -->

## 7. Limits

- **Tile data.** A style can only draw what its tiles carry. OpenMapTiles, used by Americana, MapTiler, Stadia and OpenFreeMap, has no surface below zoom 12, so these maps cannot show unpaved roads in an overview, whatever the style says. Protomaps has no surface at all. Shortbread, OsmAnd and Organic Maps already carry it, so for them it is a style change only.
- **Lists of unpaved values.** OSM Carto lists unpaved values one by one. `surface=laterite`, a common material in Africa and Asia, is not on its list, so 1,314 km of laterite main roads are drawn as paved. A paved whitelist avoids this by default.
- **The data.** Roads without a surface tag are drawn as paved, and some unpaved tags are out of date (16% in our photo check). `surface=unpaved` says nothing about how rough a road is.

## 8. Future work

- **Tracks and paths.** The same paved whitelist applies to them. How to draw them is a separate proposal. It will also cover the very worst roads (`smoothness=very_horrible` or `impassable`, `4wd_only=extreme`), which could be drawn like a path; until then they get the Off-road mark.
- **Routing.** Routers already use `surface` and `smoothness`. The map should agree with the route.
- **Google Maps and Apple Maps.** They do not use OpenStreetMap, but they have the same gap.
- **One request per app.** We will open an issue for each app, adapted to its style and tiles. Progress is tracked on the App reports page.

## 9. How to help

- **Mappers:** add `surface` to main roads, fix tags that are out of date, and add `smoothness` where a road really is rough.
- **Map and app makers:** pick a style, switch to a paved whitelist, and tell us what does not fit your map.
- **Map users:** comment on or vote for the open issue of the app you use.

## Credits

- Christoph Hormann (imagico), who designed the unpaved grain of OSM Carto and wrote about road styling in OSM maps.
- Lukas Sommer (Sommerluk), for the fill pattern of OSM Carto (PR 3399).
- The mappers and survey respondents of the `surface=laterite` discussion.
- Map data © OpenStreetMap contributors (ODbL). Official road statistics: CIA World Factbook (public domain). Street-level photos: Mapillary contributors (CC BY-SA 4.0), credited with each photo.
