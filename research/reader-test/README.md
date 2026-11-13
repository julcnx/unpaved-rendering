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

(none yet)
