# Reader test: can people spot unpaved roads without a legend?

The article says the two base levels *should* read without a legend, and that this has not been tested. This kit tests it with people who are not mappers (riders, drivers, cyclists), in about 3 minutes of their time each.

## Design

Five pictures, A to E: five different places, each drawn in one of the five styles. No legend. Six roads are numbered on each picture, and the question is the same for all: *which numbered roads are unpaved?*

- **A different place per picture**, with its own answers, so nobody can carry an answer over from one picture to the next.
- **Mixed order**: the letters do not follow the style numbers.
- **Three or four unpaved roads per picture**, so nobody can guess a fixed number.
- **Same white background** for all, so the background does not make one picture harder.

Do not tell people which style is which, or what the article proposes, before they answer.

Limit: each place has its own roads, so some pictures are easier than others whatever the style. With a form, rotate which style goes on which place in two or three versions (see "Rebuild"); for a quick Facebook post, one version is fine, and the result is informal.

## Answer key

| Picture | Place | Style | Unpaved | Paved | Roads |
|---|---|---|---|---|---|
| A | Bolivia, zoom 15 | 4. Dashed casing | **1, 4, 5, 6** | 2, 3 | 1 tertiary unpaved; 2 trunk asphalt; 3 trunk asphalt; 4 trunk compacted; 5 unclassified ground (Off-road); 6 tertiary ground (Off-road) |
| B | Nepal, zoom 15 | 1. Grain fill | **1, 5, 6** | 2, 3, 4 | 1 primary gravel (Off-road); 2 primary concrete; 3 primary concrete; 4 unclassified asphalt; 5 primary gravel (Off-road); 6 unclassified unpaved |
| C | Iceland, zoom 14 | 5. Dashed fill, full width | **1, 2, 4, 5** | 3, 6 | 1 tertiary gravel; 2 secondary compacted; 3 primary asphalt; 4 secondary compacted; 5 primary compacted; 6 primary asphalt |
| D | Namibia, zoom 16 | 2. Dashed centre line | **1, 3, 4, 5** | 2, 6 | 1 secondary gravel (Off-road); 2 unclassified; 3 unclassified (Off-road); 4 residential; 5 primary gravel; 6 primary asphalt |
| E | Australia, zoom 15 | 3. Dashed fill | **1, 3, 6** | 2, 4, 5 | 1 secondary gravel; 2 secondary asphalt; 3 unclassified unpaved; 4 secondary asphalt; 5 secondary asphalt; 6 unclassified gravel |

Generated from [labels.json](labels.json); if the pictures are rebuilt, regenerate this table too.

Iceland (C) is at zoom 14, where tertiary and minor roads are under 6 pixels wide and show the plain low-zoom tint instead of the pattern, as on a real map; its primary and secondary roads keep the pattern. Nepal (B) uses a frame 3 km south of its spot centre, found by [find-frame.mjs](find-frame.mjs), because the centre has too few roads at zoom 15.

## How to run it

- **Best:** a short form (Google Forms or similar), one question per picture: "Which numbered roads are unpaved (gravel or dirt)?", with tick boxes 1 to 6. Answers stay private, so nobody copies the first comment.
- **Quick:** a Facebook post with the five pictures; ask people to answer before reading the comments, or by private message. Expect some copying: note how many answered before the first correct comment.
- Aim for 15 to 30 answers. Note for each person whether they map for OpenStreetMap (mappers know the conventions).

## Post text (for a riders' group)

> **Quick map test, 3 minutes: which roads are unpaved?**
>
> Five maps, no legend on purpose. For each picture (A to E), which numbered roads do you think are unpaved (gravel or dirt)? If you cannot tell, say "can't tell".
>
> Answer like this: A: 1, 2 · B: can't tell · C: …
>
> Please answer before reading the other comments. I will post the answers and what this is for in a few days. Thanks!

## Scoring

For each person and picture: one point per road classed correctly. Report per picture:

- the share of people who found all the unpaved roads with no paved road picked;
- how often people answered "can't tell";
- the most common mistake (often a white minor road, or a road with the plain low-zoom tint).

Write the result in one sentence for the article, in section 6 (the "Readable without a legend" principle) and under Limits, for example: "In an informal test with 20 riders and no legend, 15 found all the unpaved roads in style 4, and 6 in style 1 (grain)." Then remove "not tested with readers yet".

## Rebuild

From the repo root, with the repo served on :8765:

```
node research/reader-test/pick-roads.mjs        # roads, positions, answer key -> labels.json
# shots: one per place, in its style, white background, at the zoom and centre in labels.json, for example:
node scripts/shots.mjs --spots bolivia --styles dashed-casing --bgs white --zooms 15 --size 1600x900 \
  --center <lat,lon from labels.json> --attribution --out shots/reader-test
python3 research/reader-test/make-images.py     # picture-A.jpg ... picture-E.jpg
```

The style of each picture is set in `make-images.py` (`PICTURES`); for a rotated version, change it there and render the matching shots.

## Results

(none yet)
