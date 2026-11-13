# Reader test: can people spot unpaved roads without a legend?

The article says the two base levels *should* read without a legend, and that this has not been tested. This kit tests it with people who are not mappers (riders, drivers, cyclists), in about a minute of their time each.

The test is a web page, [reader-test/](../../reader-test/) (on GitHub Pages: `/reader-test/`). Answers go to a Google Sheet (see "Collecting answers"). Five pictures for a quick post are also here, picture-A.jpg to picture-E.jpg.

## Design

Five small maps: five different places, each drawn in one of the five styles. No legend. Four or five roads are numbered on each map, and people tap the ones they read as unpaved: a road not tapped is read as paved.

- **Phone-sized maps, at their real size**: 400 x 520 CSS pixels, rendered at 2x. A wider picture shrinks on a phone and the patterns vanish; at this size everyone, on a phone or a desktop, sees the map as a phone shows it.
- **A different place per map**, with its own answers, so nobody can carry an answer over from one map to the next.
- **Every style on every place**: the page picks one of five versions at random (a Latin square: version v puts style (i + v) mod 5 on place i), so no style is stuck with an easy or a hard place. The order of the five maps is shuffled for each person.
- **An unpaved main road on every map** (trunk, primary or secondary), the case the styles are made for, and **at least one minor road**, so a map is not main roads only.
- **A paved minor road on every map**, so paved is not just "the big road", and **two or three unpaved roads**, so nobody can guess a fixed number.
- **A few surfaces changed for the test** ([overrides.json](overrides.json)): in Bolivia and Alberta every street around the main road's change of surface is unpaved in OSM, and no frame elsewhere had both an unpaved main road and a paved minor road. One street in each (Bolivia 1, Alberta 3) is set to asphalt. The test measures how a drawing reads, so the answer key is what the map draws; the main roads are as in OSM. Only the reader view (`reader=1`) and the picker apply these changes: `data/` and the demo are untouched. Do not use these pictures as examples of real places.
- **One number per road**: a road that stays paved (or stays unpaved) across the frame gets one number at most. A road that changes surface can get two, one on each part (Bolivia 3 and 4, Nepal 2 and 3, Alberta 1 and 2, Namibia 4 and 5, Australia 2 and 3).
- **Two levels only**: roads tagged Off-road are drawn as unpaved (no darker tint). The answer key is the same: Off-road counts as unpaved.
- **No tracks or paths**, so they cannot be taken for unpaved roads, and **no thin roads**: roads too narrow for the pattern (service roads, mostly) would show the plain low-zoom tint, a second signal for unpaved. All this is the demo's `reader=1` view.
- **Same background** for all, OSM Carto's plain land colour (`#f2efe9`, no hillshade).
- **One tap per unpaved road**: the question is whether people spot the unpaved roads, so an unpaved road not tapped is a miss and a paved road tapped is a false alarm. No "not sure": not being able to tell is the failure being measured, and it shows as a miss.
- **Nothing required**: a map can be left with no tap, and the last question is optional, so nobody gets stuck. Grain is never the first map: it is the faintest style, and a first map where nothing seems to show puts people off.
- **First impressions**: no going back to a map once answered. The last question comes after all five maps, on a new picture (one place in all five styles, in a shuffled order), so it does not prime the answers: people tap the drawings in order, from the one that shows unpaved roads most clearly to the least clear (a partial ranking counts).
- **No answers in the page**: it only knows how many numbers each map has ([places.json](../../reader-test/places.json)).

Limits: hiding tracks means the test does not say whether unpaved roads get confused with tracks on a full map. A small frame shows few roads, so each style gets four or five answers per person.

## Answer key

Same numbers in every style (the numbers belong to the place).

| Place | Zoom | Unpaved | Paved | Roads |
|---|---|---|---|---|
| Bolivia | 15 | **2, 4** | 1, 3 | 1 residential asphalt; 2 residential unpaved; 3 trunk asphalt [F3]; 4 trunk compacted [F3] |
| Nepal | 16 | **1, 2** | 3, 4, 5 | 1 residential dirt; 2 primary gravel [NH48]; 3 primary paving_stones [NH48]; 4 residential paved; 5 unclassified asphalt |
| Alberta | 15 | **1, 4** | 2, 3 | 1 primary unpaved [40]; 2 primary asphalt [40]; 3 residential asphalt; 4 unclassified unpaved |
| Namibia | 16 | **2, 3, 4** | 1, 5 | 1 unclassified asphalt; 2 residential (no surface); 3 secondary gravel [D3646]; 4 primary gravel [C38]; 5 primary asphalt [C38] |
| Australia | 15 | **1, 3, 5** | 2, 4 | 1 unclassified unpaved; 2 secondary asphalt [27]; 3 secondary gravel [27]; 4 residential asphalt [Frew Street]; 5 unclassified gravel [Bolwarra Station Road] |

Generated from [labels.json](labels.json); if the frames or the classifier change, rebuild and regenerate this table. The post pictures are one version: A Bolivia in 4. Dashed casing, B Nepal in 1. Grain fill, C Alberta in 5. Dashed fill full width, D Namibia in 2. Dashed centre line, E Australia in 3. Dashed fill.

The frames were found by [find-frame.mjs](find-frame.mjs): four or five clear roads with the rules above, close to each spot centre; Bolivia and Alberta are on their spot centres, where the main road changes surface; Nepal is moved so its roads sit mid-frame. Iceland was dropped for Alberta: no minor road near its main roads (farms are reached by service roads, too thin to draw). Zoom 15 or more everywhere, so every numbered road shows its style's pattern; Nepal and Namibia at 16 (at 15 the mountain roads looked far away).

## Collecting answers

The page sends each finished test as one row to a Google Sheet, through a small Apps Script web app ([apps-script.gs](apps-script.gs)). Answers stay private, and people need no account.

1. Create an empty Google Sheet. Extensions > Apps Script, paste apps-script.gs, save.
2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Deploy, allow access, copy the web app URL.
3. Put the URL in `ENDPOINT` at the top of the script in [reader-test/index.html](../../reader-test/index.html), commit, push.
4. Test once from a phone: a row should appear in the sheet. Delete it before sharing the link.

With `ENDPOINT` empty, the page runs in test mode: nothing is sent, and the answers show on the last screen (also with `?debug=1`). A finished test is remembered in the browser, so a reload does not count twice. The session is kept in the browser after every tap: someone who leaves comes back to the same map, with the same answers, order and id (column `resumes` in the raw JSON), and time away does not count in the map times or tap times. Someone who leaves early and never comes back still counts: what they answered so far is sent, and their row is updated if they come back and go on (one row per person, `stage` says how far they got: map1 to map5, clarity, done). A hidden field catches simple bots (column `trap` in the raw JSON).

Picture sets: answers before 2026-11-13 saw set 1, where white unpaved roads in 4. Dashed casing have only the dashed outline; set 2 adds the light tan fill (only the dashed-casing pictures and strip changed, the answer key did not). The raw JSON has `"images":2` for set 2 and nothing for set 1. A session started on set 1 and resumed later keeps no tag but shows set 2 pictures for its remaining maps (rare). The link a person came from is in the raw JSON too, as `"src":"fb"` (links with `?src=`).

Columns: per place, the style shown, the answers in road order (U tapped as unpaved, P not tapped), the position in that person's order, the time spent, and every tap in order with its time in seconds (`3U@1.2 1U@2.1 3-@2.5`: road 3 tapped, road 1 tapped, road 3 untapped); then the five strips of the last question in the order shown, the ranking (styles from clearest to least clear), best (first ranked) and worst (last, only from a full ranking), and the taps by position shown (`3@2.1 1@3.0 -3@4.2`: strip 3 ranked, strip 1 ranked, strip 3 taken out).

## Post text (for a riders' group)

> **Quick map test, 1 minute: which roads are unpaved?**
>
> Five small maps, no legend on purpose. Each shows paved and unpaved roads drawn in different ways: tell which numbered roads you read as unpaved. Works best on a phone.
>
> (link)
>
> Anonymous. I will post the answers and what this is for in a few days. Thanks!

When posting the answers, say that a few street surfaces were changed for the test (Bolivia and Alberta).

Aim for 15 to 30 answers. Do not tell people which style is which, or what the article proposes, before they answer.

## Scoring

For each person and map: hits (unpaved roads tapped) and false alarms (paved roads tapped). Report per style, over all places:

- the share of maps where people found all the unpaved roads with no paved road taken for unpaved;
- the hit rate and the false-alarm rate, and how often people changed their mind (taps);
- the time per map and to the first tap, as medians: a tab left open behind another window keeps counting, so ignore single times over about 60 s;
- the most common mistake (often a white minor road);
- the average rank of each style in the last question, next to its correct-answer rate;

Write the result in one sentence for the article, in section 6 (the "Readable without a legend" principle) and under Limits, for example: "In an informal test with 20 riders and no legend, 15 found all the unpaved roads in style 4, and 6 in style 1 (grain)." Then remove "not tested with readers yet".

## Rebuild

From the repo root, with the repo served on :8765 (`python3 -m http.server 8765`):

```
node research/reader-test/pick-roads.mjs   # frames (CENTER, ZOOM), roads, answer key -> labels.json
sh research/reader-test/render.sh          # 25 shots + 5 clarity strips, then make-images.py:
                                           # reader-test/img/, reader-test/places.json, picture-A.jpg ... E.jpg
```

## Results

Closed 2026-11-13 with fewer answers than the 30 aimed for: 35 people started, 28 saw all five maps. Julien's own run is left out (`--exclude e491f01c`). Groups by link tag: 22 non-mappers (12 friends from the first link, no tag; 6 `enduro`, a riders' chat; 4 `fb`, a public Facebook post) and 6 mappers (`forum`, the OSM community forum). Scored with [score.py](score.py); the answers stay in the sheet, not in the repo.

**Non-mappers miss unpaved main roads.** They found 78% of the unpaved minor roads (103/132) but 43% of the unpaved main roads (57/132; Fisher p < 0.001). On every map the paved part of a main road was never tapped, and its unpaved part was found by 6 to 12 of 22 people: Australia 27 6/22, Bolivia F3 8/22, Namibia C38 9/22, Alberta 40 10/22, Nepal NH48 and Namibia D3646 12/22. Where a highway changes from asphalt to gravel, most did not notice. Mappers found 81% of the unpaved main roads (29/36): they know what to look for.

**Almost no false alarms.** A paved road was tapped 4% of the time (10/242): the marks do not make a paved road look unpaved; when they fail, they go unnoticed.

Per style, non-mappers (unpaved roads found; each person saw each style once, on a different place):

| Style | All unpaved | Main roads | Minor roads | Paved tapped |
|---|---|---|---|---|
| 1. Grain fill | 67% (34/51) | 58% (14/24) | 74% (20/27) | 4% |
| 2. Dashed centre line | 62% (31/50) | 42% (11/26) | 83% (20/24) | 4% |
| 3. Dashed fill | 59% (32/54) | 39% (11/28) | 81% (21/26) | 4% |
| 4. Dashed casing, pictures 1 | 63% (17/27) | 53% (8/15) | 75% (9/12) | 0% |
| 4. Dashed casing, pictures 2 (tan fill) | 61% (17/28) | 33% (4/12) | 81% (13/16) | 4% |
| 5. Dashed fill full width | 54% (29/54) | 33% (9/27) | 74% (20/27) | 6% |

No style clearly beats the others. Grain did best on main roads and full width worst, but with about 25 main roads each the gap may be chance (p ≈ 0.1). The tan fill of style 4 made no measurable difference (11 people on each picture set).

Clearest drawing, 17 full rankings by non-mappers: dashed casing (average rank 2.6, first 7 times, last 4), grain (2.8, first 7, last 6: it splits people), centre line and dashed fill (3.1), full width (3.4, never first).

Other: 6 of 22 non-mappers left at least one map with no tap ("I see no difference"); median time 27 s on the first map, 9 s on the next ones; 7 of 35 people stopped early, 5 of them on map 1.

**In short.** On white minor roads every style was read by most people; on coloured main roads, fewer than half of the unpaved parts were noticed. A second round of this test can check any change to the styles.
