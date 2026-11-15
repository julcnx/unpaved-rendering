# AdvOSM (Garmin maps)

The author's reply by email, 2026-11-13. Credit as **"AdvOSM"** only: the author asks to keep the real name private, so no name or email in this repo.

## What the reply says

- Coffee proposed for **Wednesday 2026-11-18** in Chiang Mai, near Honda BigWing.
- Thinks the initiative is good. Used Tanzania to check the maps, and sent a comparison of four Garmin maps there ([examples/advosm/](../examples/advosm/)). Names **GmapTool** as excellent for unpaved highways; prefers AdvOSM because it reads better on a 240 x 400 px handheld screen.
- Style rules: not published, still a work in progress; may go to GitHub one day after a cleanup. Happy to explain any rule in plain English.
- The TYP file is public in practice (it can be read from any IMG). 14 TYPs: seven languages, automotive and handheld. Sent the Thailand handheld TYP and the legend.
- Asked what "Open source: not stated" means. The map's notice reads: "(c) OpenStreetMap.org under Open Data Commons License. Designed by AdvOSM. Produced with Mkgmap."
- Edits paved/unpaved tags in OSM nearly every day while riding, where the map was wrong.

## Second reply (two emails, 2026-11-14)

- Meeting: **Wednesday 2026-11-18, 11:00 at Honda BigWing** (Chiang Mai), then walk to a coffee shop.
- No usable Garmin style rules online to start from: BBBike used to publish them and stopped; the Nightrider Southeast Asia map rules were never published; the last full public set is OpenMapChest's, which the author found poor (one rule tried did not work).
- **Why AdvOSM changes the line type instead of adding an overlay: routing.** On Garmin the line type and road class also drive the routing. An overlay changes the look only, so the router still treats an unpaved highway as paved.
- Test route, about 95% unpaved on these maps: -6.959109, 33.516026 (T8 south) to -4.841559, 34.753876 (T3 north, Singida), about 305 km, on a Garmin Montana 650 ([routing-garmin-advosm-gmaptool-alternativaslibres.jpg](../examples/advosm/routing-garmin-advosm-gmaptool-alternativaslibres.jpg), [routing-google-maps.jpg](../examples/advosm/routing-google-maps.jpg)):

| Map | Time | Distance | Average |
|---|---|---|---|
| AdvOSM | 5:56 | 305 km | 51 km/h |
| Google Maps | 5:25 | 307 km | 56 km/h |
| GmapTool | 3:30 | 306 km | 87 km/h |
| AlternativasLibres | 3:31 | 305 km | 87 km/h |

  The author's points: 87 km/h on dirt is not realistic; worse, a router that thinks a dirt primary is as fast as pavement will pick it over a paved tertiary or minor road of similar length. 51 km/h is realistic for well-graded gravel.
- **GmapTool confirmed as an overlay**: in the author's words, "hard-to-see teeth along the outside of the highway" where it is unpaved; routing unchanged.
- **Class still readable on AdvOSM through the route shields**: T8, R384 and so on stay on the line even when its colour turns to the unpaved yellow.

What it means for us: the reason is routing, not looks, and it is specific to Garmin (mkgmap), where one line carries both the look and the routing values. Our ask stays rendering only, but the Garmin row in the article should say why AdvOSM does it. Open point for the coffee: mkgmap style rules set `road_class` and `road_speed` per rule, separately from the line type, so lowering the speed of unpaved sections while keeping each class's own line type (plus an unpaved overlay or an unpaved variant per class) might give both. The limit may be the number of routable line types; to ask.

## Third reply (2026-11-15), on keeping the class line and slowing unpaved sections

- **Possible in principle**: mkgmap assigns three values separately: the road class, the road speed (a default bucket, or the OSM speed of the road rounded to the nearest bucket) and the TYP code (the look). The Garmin firmware uses at least these three to route, but how it weighs them is unknown. Only a handful of TYP codes are routable.
- **Never tried and not documented.** The author's bet: if GmapTool could have done it, it would have, since its Africa maps have been the best for years and the unpaved routing was never fixed.
- **Cost of undocumented changes**: in the author's experience they mostly fail, and the rest take days or weeks and make the style rules more complex. Example: drawing roads on top of protected-area boundaries took over two weeks, as the line drawing order is undocumented (no difference in Asia, a big one in Africa).
- mkgmap is a reverse-engineered writer for the Garmin format and the routing engine is a black box: one change often breaks something unexpected elsewhere (roundabouts, on-ramps, road names), found only by weeks of render, copy to a Garmin, test in another part of the world. So "another unknown to be researched".
- AdvOSM's current routing values (the author calls it very simplified):

| OSM highway | Road class | Default speed bucket |
|---|---|---|
| trunk | 4 Major HW/Ramp | 5 (90 km/h) |
| primary (fast) | 4 Major HW/Ramp | 4 (80) |
| primary | 3 Principal HW | 4 (80) |
| secondary (fast) | 3 Principal HW | 3 (60) |
| secondary | 2 Arterial St / Other HW | 3 (60) |
| tertiary, unclassified, minor | 1 Minor or Service road | 3 (60) |
| residential, service | 0 Residential Street/Unpaved Road/Trail | 2 (40) |
| **unpaved** (any class) | 0 | **1 (20)** |
| track | 0 | 1 (20) |

What it means for us: keeping the class colour on Garmin without breaking routing is a research question, not a style change, and only a Garmin map maker with devices to test on can answer it. Our ask to Garmin makers stays a suggestion; the article should say so and give AdvOSM's routing reason.

## What the TYP and legend show (Thailand, handheld)

| Line type | Drawn as | Legend |
|---|---|---|
| 0x01 | white fill, blue edges | Motorway |
| 0x02 | red, dark red edges | Primary road, paved (trunk too, from the Tanzania image) |
| 0x03 | green | Secondary road, paved |
| 0x00 | orange | Tertiary road, paved |
| 0x04 | yellow, grey edges, 3 + 2 px | Minor, residential, unclassified, paved |
| **0x05** | **yellow dashes 12 px, grey gaps 4 px, grey edges, 5 px** | **Unpaved road: every class except service** |
| 0x06 | white dashes, grey gaps and edges, 4 px | Track or unpaved service road |
| 0x10015 | red dashes, grey gaps and edges | Track or service road closed to vehicles |
| 0x07 | solid grey, 3 px | Service road, paved or untagged |
| 0x10014 | red dashes, no edge | Trail or footpath |

So the class is lost on unpaved roads: an unpaved trunk (T8, Rungwa to Makongolosi) is the same line as an unpaved village road. The earlier reading from the MS.4014 image (minor roads white, tertiary turned yellow) is replaced by this.

Warning points on sections over a length (2 km for level 2, 1 km for level 3, 500 m for 4 and 5): S2 to S5 for `smoothness` (intermediate, bad, very_bad/horrible, very_horrible/impassable; one icon set for pavement, one for earth), G2 to G5 for `tracktype`, N2 to N4 for narrow roads (width 3 m or one lane for two-way, 2 m, 1 m; also `narrow=yes`), fords and weirs.

On the same Tanzania image: **GmapTool** keeps the class colour with an unpaved overlay (green trunk T8, red primary near Kongwa; the author calls it "hard-to-see teeth along the outside"), routing unchanged; **AlternativasLibres** draws T8 as solid red, no unpaved signal; **BBBike** draws it grey, unclear.

## To ask at the coffee

1. Which `surface` values count as unpaved: a list of unpaved values, or a list of paved values with everything else unpaved? How is a road with no `surface` drawn?
2. Answered 2026-11-14 and 2026-11-15: one unpaved type for routing; keeping each class line and lowering only the speed is possible in principle (class, speed and TYP code are separate in mkgmap) but untested, and only a few TYP codes are routable. Left: what makes a primary or secondary "(fast)"? The test route averaged 51 km/h while unpaved roads default to 20 km/h: OSM `maxspeed` on the T8, or does the firmware weigh class over speed? Would class-colour dashes read well enough on 240 x 400?
3. The S points: exact `smoothness` rules, and how the length threshold is measured (one way, or joined ways).
4. GmapTool: answered 2026-11-14, it is an overlay, so routing is unchanged. Still open: do its secondary and tertiary get it too, and has the author read its TYP?
5. Is it fine to show the Tanzania comparison and the legend images in the article or apps page, credited to AdvOSM?

## Reply draft

Sent by Julien 2026-11-13.

---

Hi,

Wednesday the 18th works, coffee or lunch near Honda BigWing. I'm free any time between 9:30 and 3 (school runs in Mae Rim, I live in Mae Jo), so pick what suits you.

Thanks for the TYP and the legend, they answer what I was unsure about. Every unpaved road becomes the same yellow dashed line, so the T8 between Rungwa and Makongolosi looks like the village roads around it. GmapTool, the one you point to, does what my draft asks: it keeps the trunk green and dashes it. I'd like to hear why you went for one unpaved line, whether it is a Garmin limit or a choice for the small screen.

"Open source: not stated" was my shorthand for "are the style rules published so others can reuse them". I've changed it to "no: style rules not published (the TYP file can be read from any map)", and I credit the maps as AdvOSM only, no name.

Good to know you fix paved/unpaved tags as you ride, that is exactly the data these maps depend on.

See you Wednesday,
Julien

## Reply draft 2

Sent by Julien 2026-11-14 or 15 (answered 2026-11-15).

---

Hi,

11 at BigWing on Wednesday is perfect.

The routing point is a good one, I hadn't thought of it: on Garmin the line does both jobs, so an overlay like GmapTool's leaves you with 87 km/h on dirt. Your Google comparison makes it clear, 5.5 hours there and 6 on AdvOSM.

One thing I'd like to understand on Wednesday: can mkgmap's road_speed slow the unpaved sections while each road keeps its own class line, so the map keeps the class colour and still gives you the 6 hours? You'll know far better than me whether the Garmin type limits allow it.

See you Wednesday,
Julien
