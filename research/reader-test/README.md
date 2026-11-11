# Reader test: can people spot unpaved roads without a legend?

The article says the two base levels *should* read without a legend, and that this has not been tested. This kit tests it with people who are not mappers (riders, drivers, cyclists), in about 10 minutes of their time each.

## The pictures

[picture-A.jpg](picture-A.jpg), [picture-B.jpg](picture-B.jpg), [picture-C.jpg](picture-C.jpg): the same map (Namutoni, Namibia, zoom 16, hillshade) in three styles, with no legend and six roads numbered. Built by [make-images.py](make-images.py); road positions from [candidates.mjs](candidates.mjs).

| Picture | Style |
|---|---|
| A | 4. Dashed casing |
| B | 1. Grain fill |
| C | 3. Dashed fill |

The letters do not follow the style numbers on purpose. Do not tell people which style is which, or what the article proposes, before they answer.

## Answer key

| Road | What it is | Answer |
|---|---|---|
| 1 | C38, primary, gravel | **Unpaved** |
| 2 | Camp road, unclassified | Paved |
| 3 | Side road, residential | **Unpaved** |
| 4 | C38, primary, asphalt | Paved |
| 5 | D3646, secondary, gravel (Off-road mark) | **Unpaved** |
| 6 | Camp road, unclassified | Paved |

Unpaved: 1, 3, 5. Paved: 2, 4, 6. Same for all three pictures.

## How to run it

- **Best:** a short form (Google Forms or similar), one question per picture: "Which numbered roads are unpaved (gravel or dirt)?", with tick boxes 1 to 6. Answers stay private, so nobody copies the first comment.
- **Quick:** a Facebook post with the three pictures; ask people to answer before reading the comments, or by private message. Expect some copying: note how many answered before the first correct comment.
- Aim for 15 to 30 answers. Note for each person whether they map for OpenStreetMap (mappers know the conventions).

## Post text (for a riders' group)

> **Quick map test, 1 minute: which roads are unpaved?**
>
> Three versions of the same map, no legend on purpose. For each picture (A, B, C), which numbered roads do you think are unpaved (gravel or dirt)?
>
> Answer like this: A: 1, 2 · B: … · C: …
>
> Please answer before reading the other comments. I will post the answers and what this is for in a few days. Thanks!

## Scoring

For each person and picture: one point per road classed correctly (0 to 6). Report per picture:

- the share of people who found all three unpaved roads, with no paved road picked;
- the most common mistake (often the white side road 3, or the Off-road road 5 seen as "a different kind of road" rather than unpaved).

Write the result in one sentence for the article, in section 6 (the "Readable without a legend" principle) and under Limits, for example: "In an informal test, 12 of 15 riders found the unpaved roads in style 4 without a legend; style 1 (grain) was the hardest." Then remove "not tested with readers yet".

## Results

(none yet)
