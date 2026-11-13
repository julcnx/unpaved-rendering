# AdvOSM (Garmin maps)

The author's reply by email, 2026-11-13. Credit as **"AdvOSM"** only: the author asks to keep the real name private, so no name or email in this repo.

## What the reply says

- Coffee proposed for **Wednesday 2026-11-18** in Chiang Mai, near Honda BigWing.
- Thinks the initiative is good. Used Tanzania to check the maps, and sent a comparison of four Garmin maps there ([examples/advosm/](../examples/advosm/)). Names **GmapTool** as excellent for unpaved highways; prefers AdvOSM because it reads better on a 240 x 400 px handheld screen.
- Style rules: not published, still a work in progress; may go to GitHub one day after a cleanup. Happy to explain any rule in plain English.
- The TYP file is public in practice (it can be read from any IMG). 14 TYPs: seven languages, automotive and handheld. Sent the Thailand handheld TYP and the legend.
- Asked what "Open source: not stated" means. The map's notice reads: "(c) OpenStreetMap.org under Open Data Commons License. Designed by AdvOSM. Produced with Mkgmap."
- Edits paved/unpaved tags in OSM nearly every day while riding, where the map was wrong.

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

On the same Tanzania image: **GmapTool** keeps the class colour with dashes (green dashed trunk T8, red dashed primary near Kongwa); **AlternativasLibres** draws T8 as solid red, no unpaved signal; **BBBike** draws it grey, unclear.

## To ask at the coffee

1. Which `surface` values count as unpaved: a list of unpaved values, or a list of paved values with everything else unpaved? How is a road with no `surface` drawn?
2. Why one unpaved type for every class: Garmin type limits, or readability on the small screen? Would class-colour dashes, as GmapTool does, read well enough on 240 x 400?
3. The S points: exact `smoothness` rules, and how the length threshold is measured (one way, or joined ways).
4. Is it fine to show the Tanzania comparison and the legend images in the article or apps page, credited to AdvOSM?

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
