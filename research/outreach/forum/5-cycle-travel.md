# Forum reply to Richard Fairhurst (post #5, cycle.travel)

Draft, not posted. Thread: https://community.openstreetmap.org/t/draft-for-feedback-showing-unpaved-roads-on-osm-based-maps-without-losing-the-road-class/150052/5

His post: a screenshot of a secondary road in Canada (Willow Bunch, Saskatchewan) on cycle.travel, with unpaved and paved sections. The secondary keeps its yellow fill on both sections; the unpaved section has a dashed dark casing, the paved one a solid casing. Unpaved minor roads are white with a grey dashed casing.

## What we checked ourselves (2026-11-13)

Shots by Julien at z15 (desktop browser; the site blocks headless Chrome), saved as `cycle-travel.png` in `examples/screenshots/track-switzerland-{1,2,3}/`. Ways matched by projecting their OSM geometry onto the shots (cycle.travel centres the URL position to the right of its side panel, about 190 CSS px).

- Coverage: map data in Europe and North America only. The Thai and Namibian spots (all five surface spots, C48, the four Thai track views) are blank, so the paved rule on unknown values (`laterite`, `unpavedsource:geometry=strava`, `dbst`) cannot be tested there.
- Unpaved roads get a dashed casing: unclassified `fine_gravel` (Kistenpass, w1203279051), unclassified with only `tracktype=grade2` (w30277491, so `tracktype` counts), residential `fine_gravel` (Les Rochettes).
- Tertiary `fine_gravel` (w531551516): the fill turns from the tertiary cream to white with a dashed casing, so the class colour is lost on that section (the Canadian secondary kept its yellow).
- Unclassified `gravel`, `smoothness=bad`, `grade3` (w130442162): the fill turns from cream to white; the casing looks solid at this zoom. Not sure.
- Unclassified `concrete`, `smoothness=horrible` (w182013609, Off-road for us): plain white road, solid casing; `smoothness` seems unused. Medium confidence (projection off by about 20 px in that view).
- Tracks: brown dashed and dotted lines, no casing, so unpaved roads (casing) and tracks look different. Paved tracks (`grade1` asphalt or concrete, `surface=paved`) are drawn as white minor roads.
- Tunnels: not in these views, not checked.

## Second round: paved rule (spots found 2026-11-13, Overpass and the Swiss extract)

Unpaved values missing from Carto-style unpaved lists (a blacklist draws them paved), paved values missing from our whitelist (a whitelist draws them unpaved):

| Test | Way | URL (z16) |
|---|---|---|
| `grit` (unpaved) | residential Rütiweg w25815132, Schaffhausen | https://cycle.travel/map?lat=47.69855&lon=8.65436&zoom=16 |
| `rock` (unpaved) | unclassified Via Somagna w1346402798 and neighbours, near Chiavenna (IT) | https://cycle.travel/map?lat=46.15306&lon=9.52345&zoom=16 |
| `cement` (paved) | residential Via Campagna w1181292722 | https://cycle.travel/map?lat=46.03300&lon=8.78118&zoom=16 |
| `asphalt_lanes` (paved) | residential Oberer Geißkopf w29476753, Vorarlberg (AT) | https://cycle.travel/map?lat=47.42432&lon=9.81797&zoom=16 |
| tunnel (asphalt) | unclassified Längenbergstrasse w26533725, Schaffhausen | https://cycle.travel/map?lat=47.72844&lon=8.62737&zoom=16 |

Result (Julien's shots, 2026-11-13, in `examples/screenshots/cycle-travel-values/`, kept local, not in git): `rock`, `cement` and `asphalt_lanes` are drawn as plain paved roads (white, solid casing); `grit` looks paved too (projection about 30 px off, so medium confidence). So cycle.travel lists unpaved values and draws everything else as paved, like OSM Carto: unknown unpaved values such as `rock` show as paved. The tunnel spot is only a few metres under the H4 and shows nothing; tunnels still not checked.

## Draft

Thanks Richard, that's a nice example, and exactly the kind of map the article is asking for. I hadn't included cycle.travel in the review of about 30 maps, my mistake, so I've now looked at it in a few places in Switzerland where I already had reference screenshots for the others. It will be in the next version of the article.

What I like: an unpaved road still looks like a road, with a dashed casing, while tracks stay brown dashed lines, so the two can't be confused. That's the failure I see most often elsewhere (Ride with GPS, Gaia GPS and the OsmAnd Motorcycle style draw unpaved roads as tracks).

Two things I noticed, if you don't mind me asking:

1. On a tertiary with `surface=fine_gravel` near Granges Rotey, Fribourg ([way 531551516](https://www.openstreetmap.org/way/531551516), [on cycle.travel](https://cycle.travel/map?lat=46.84983&lon=7.02635&zoom=16)), the fill changes from the tertiary cream to white on the unpaved section, while your Canadian secondary keeps its yellow. Is that on purpose for tertiary roads?
2. From a few test roads, cycle.travel seems to list the unpaved values and draw anything else as paved: `surface=rock` on Via Somagna near Chiavenna ([way 1346402798](https://www.openstreetmap.org/way/1346402798), [on cycle.travel](https://cycle.travel/map?lat=46.15306&lon=9.52345&zoom=16)) shows as a normal paved road. That's the same choice as OSM Carto, and the one the article argues against: with a paved whitelist, `rock`, `laterite` or a typo would show as unpaved instead. Is that deliberate (for a cyclist, perhaps better to show an odd value as paved?), or would you consider a whitelist?
