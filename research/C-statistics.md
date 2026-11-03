# C. Classifier and statistics

## Classifier

Model: two base levels, **Paved** and **Unpaved**, plus an optional **Off-road mark** on Unpaved roads only (decision 9, 2026-11-02). The earlier three-level model (Paved / Rough / Off-road) is archived in [stats/archive/3-levels/](stats/archive/3-levels/).

Reference implementation: [classifier/classify.ts](classifier/classify.ts). Ports with the same rules:

- [classifier/classify.lua](classifier/classify.lua): Lua (osm2pgsql flex and similar). `classify(tags)` returns level, base, base source, mark, mark source.
- [classifier/classify.sql](classifier/classify.sql): PostgreSQL functions. `road_surface_class(highway, surface, smoothness, tracktype, 4wd_only)` returns `paved`, `unpaved`, `offroad` or `specialized`.

Tests: [classifier/test-cases.json](classifier/test-cases.json) has 59 cases shared by all three. `node --test classifier/classify.test.ts classifier/ports.test.ts stats/test/road-stats.test.ts` runs everything (66 tests). The SQL test runs only when `PGHOST`/`PGPORT` point to a test database; run against a throwaway PostgreSQL 17 on 2026-11-02, all passing.

**Base level** (first tag that applies):

| Priority | Tag | Paved | Unpaved |
|---|---|---|---|
| 1 | `surface` | paved, asphalt, chipseal, concrete, concrete:plates, paving_stones, sett, bricks, metal, wood, cobblestone, cobblestone:flattened | everything else, including typos and local values |
| 2 | `tracktype` (no surface) | grade1 | grade2 to grade8 |
| 3 | nothing | road classes | `highway=track` |

**Off-road mark** (Unpaved roads only, ignored on Paved roads):

| Priority | Tag | Off-road mark | Specialized (render as path) |
|---|---|---|---|
| 1 | `smoothness` (any known value decides) | very_bad, horrible | very_horrible, impassable |
| 2 | `tracktype` | grade3 to grade7 | grade8 |
| minimum | `4wd_only` | recommended, yes | extreme |

Decisions:

1. Unknown `smoothness` or `tracktype` values (typos, legacy like `smoothness=rough`) are ignored and the next tag decides.
2. `4wd_only` is a minimum for the mark: it can raise it, never lower it.
3. The spec says `smoothness=impossible`; the documented OSM value is `impassable`. The classifier uses `impassable`.
4. `tracktype=grade6` to `grade8`: Australian local extension, see [B-communities.md](B-communities.md).
5. Multiple surface values (`asphalt;concrete`) are Paved only if every part is paved.
6. Smoothness no longer decides Paved vs Unpaved (decision 9): it only gives the mark. `smoothness=excellent` + `surface=unpaved` is Unpaved. Off-road evidence on a Paved road is ignored for rendering and listed as a conflict in the stats.
7. `cobblestone` and `cobblestone:flattened` are Paved (legacy value mostly used for sett; OSM Carto and Organic Maps also treat it as paved).

## Statistics pipeline

```
stats/run-country.sh <code> <extract.osm.pbf> <country.geojson> [country name]
node stats/report.ts > stats/report.md
```

All countries: `stats/run-all.sh` (or `ONLY="tl kh" stats/run-all.sh`). For each line of [stats/countries.txt](stats/countries.txt) (Geofabrik path, ISO code, name), it downloads the extract, gets the border with [stats/boundary.sh](stats/boundary.sh), runs the stats, and deletes the download. Countries with a result are skipped, so it can be restarted. Combined extracts (Senegal and Gambia) are kept until their last country is done. Shows progress (`[n/total]`, download bar) in the terminal; Ctrl-C stops cleanly, run again to continue.

Order (changed 2026-11-02): smallest download first, Western contrast last (Finland, Czechia, France; France chosen over Germany). Biggest downloads: France 4.9 GB, Brazil 2.0 GB, Indonesia 1.7 GB, India 1.6 GB. Added 2026-11-03 to reach 40 countries: Vietnam, Sri Lanka, Ivory Coast, Namibia, and a new group of developed countries with unpaved highways (Chile, New Zealand). Alaska was considered and left out. France was replaced by Denmark (474 MB instead of 4.9 GB) as the Western all-paved baseline: same role, a tenth of the download; Finland and Czechia complete the European contrast. Added 2026-11-03 to fill regional gaps (46 countries): Guatemala and Honduras (Central America), Morocco (North Africa), Kyrgyzstan (Central Asia), Ethiopia (East Africa, laterite survey list), Solomon Islands (Pacific). Second round of regional gaps (2026-11-03, smallest first): Albania, Georgia, Mali, Iran, Oman (from the Gulf-states extract, cut to Oman's border), Romania, Uganda, Mexico, Ukraine, then Canada last (6.2 GB). Ukraine and Canada put on hold the same day (commented out in the list, borders cached). Antarctica added as a special row, not a country: no border relation, so the whole extract south of 60°S is used. It has 5,700 km mapped as secondary and tertiary roads, almost all `surface=ice` (the South Pole Traverse), an extreme example of a road class that says nothing about drivability. Per continent: Asia 13, Africa 12, Americas 9, Europe 4, Oceania 3.

**Borders** (changed 2026-11-02): the border is the complete country relation downloaded from the OSM API (`/api/0.6/relation/<id>/full`), not the relation inside the extract. Geofabrik extracts can miss border ways at sea: the Papua New Guinea extract had 100 of the 104 ways of [r307866](https://www.openstreetmap.org/relation/307866), so no polygon could be built. Relation ids are listed in [stats/country-relations.txt](stats/country-relations.txt) (found with Overpass by `ISO3166-1`, lowest `admin_level`; French Guiana is `admin_level=3`). Borders are cached in `borders/` (not committed). The script waits and retries when the API rate limit is hit. The first 8 countries (tl, kh, la, np, mm, ga, cg, mn) used the extract's relation, which was complete for them.

**Tag-combination tables** (added 2026-11-02): each run also writes `stats/combos/<code>.json`, the km per combination of `highway`, `surface`, `smoothness`, `tracktype`, `4wd_only`. After a rule change, a country can be recomputed without its extract: `COMBOS_IN=stats/combos/<code>.json node stats/road-stats.ts <code> <date> <name>` (km tables only; the odd-way lists need a full run).

Per country, [stats/run-country.sh](stats/run-country.sh):

1. `osmium tags-filter` to `highway=motorway,trunk,primary,secondary,tertiary,unclassified,residential` (`*_link` not included).
2. `osmium extract --strategy=simple` with the country border. Ways crossing the border are cut, so km are not counted in two countries.
3. `osmium export -f geojsonseq` into [stats/road-stats.ts](stats/road-stats.ts), which classifies each way with `classify.ts` and sums haversine km.
4. Result in `stats/results/<code>.json`. Intermediate files in `work/` are deleted.

Buckets:

- **Paved (tagged)**: Paved, decided by `surface` or `tracktype`.
- **Untagged**: no `surface` and no known `tracktype`, assumed Paved. Kept separate in the stats.
- **Unpaved**, and **of which Off-road mark**: Paved (tagged) + Untagged + Unpaved = 100%.
- **Rough**, **Off-road**: as classified. Specialized is folded into Off-road in the tables and CSV (near zero on roads), raw km stay in the JSON.

Reusable summary: [stats/summary.csv](stats/summary.csv), one row per country and class (plus `all`), with km and % per bucket. Regenerated by `report.ts`.

Each result also has:

- `run`: run date, classifier hash (first 12 characters of the SHA-256 of `classify.ts`), osmium version, source extract and boundary, so numbers can be reproduced.
- `coverage_km`: km with each of `surface`, `smoothness`, `tracktype`, `4wd_only` present (any value), per class.
- `source_km`, `value_km`: which tag and value decided the level.
- Sanity material: unknown values, smoothness vs surface conflicts, and the longest odd ways (0.5 km minimum, with the deciding tag and any `note`, `description`, `fixme`).
- `run.pipeline_sha256`: hash of `classify.ts`, `road-stats.ts` and `run-country.sh` together. If it differs between two results, they were made with different code. `run.data_date_source`: `header` (extract replication timestamp) or `newest_object` (fallback when the header has no date).

`coverage_km`, `source_km` and `value_km` are split per class and have an `all` entry.

**Untagged** means no usable tag: no `surface`, `smoothness`, `tracktype` or `4wd_only` value the classifier knows. A road with only an unknown value (for example `smoothness=rough`) is Untagged. Use this wording on the wiki.

Tests: `node --test classifier/classify.test.ts stats/test/road-stats.test.ts` (55 classifier cases, 4 stats tests on a fixture of known lengths).

## Runs

| Code | Source extract | Data date | Run date |
|---|---|---|---|
| th | `unpaved-app/regions/th/clipped.osm.pbf` (Geofabrik, already clipped; `latest.osm.pbf` there was truncated) | 2026-10-30 | 2026-11-02 |
| np | Geofabrik `asia/nepal-latest.osm.pbf`, border r184633 from the extract ([stats/boundary.sh](stats/boundary.sh)), download deleted | 2026-11-01 | 2026-11-02 |

**Note (2026-11-02):** the findings below were measured with the three-level model and are kept as history. They will be updated from the new runs. The Unpaved share equals the old Rough + Off-road share, so those numbers stay valid; only the Rough vs Off-road split changes meaning.

## Thailand findings

Full output: [stats/report.md](stats/report.md).

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 1,655 | 36.9% | 63.1% | 0.0% | 0.0% |
| trunk | 20,104 | 60.8% | 39.2% | 0.0% | 0.0% |
| primary | 17,689 | 59.3% | 40.5% | 0.2% | 0.0% |
| secondary | 41,714 | 57.2% | 42.0% | 0.8% | 0.0% |
| tertiary | 73,345 | 44.8% | 50.9% | 2.4% | 1.9% |
| unclassified | 154,090 | 18.1% | 59.9% | 2.3% | 19.7% |
| residential | 351,573 | 5.9% | 80.6% | 0.3% | 13.2% |
| **All** | 660,170 | 19.5% | 67.6% | 1.0% | 11.9% |

Observations:

1. Tertiary: 95.7% Paved or untagged, confirms "tertiary nearly 100% paved".
2. Unclassified: 22% Rough or Off-road, 60% untagged.
3. `surface=unpaved` is 27,649 km, about 86% of all Off-road km. The "`unpaved` means Off-road" rule drives the result.
4. Potholed paved roads go Off-road through smoothness: for example route 1093 ([w283410813](https://www.openstreetmap.org/way/283410813), secondary, `surface=paved` + `smoothness=very_bad`, 7.8 km). Ground truth: poor tagging, likely broken concrete that should be `smoothness=bad`. Data issue, rule unchanged.
5. Multi-values used to fall into Off-road (`asphalt;concrete` on the Outer Ring Road, [w77077108](https://www.openstreetmap.org/way/77077108)). Fixed: worst part decides.
6. `smoothness=excellent` + `surface=unpaved` gives Paved (smoothness wins): [w968692295](https://www.openstreetmap.org/way/968692295), 6.2 km. Ground truth: mapper forgot to remove `surface=unpaved`. Strict precedence kept.
8. Residential: 80.6% untagged, 13.2% Off-road (73,154 km of `surface=unpaved` across all classes, most of it residential and unclassified).
7. Thai-script surface values and typos (`as\`, `aas`, `W`) fall into Off-road: the free quality check works.

## Nepal findings

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | | | | |
| trunk | 2,132 | 45.4% | 53.4% | 0.2% | 1.0% |
| primary | 5,000 | 31.5% | 59.3% | 3.3% | 5.9% |
| secondary | 4,556 | 25.3% | 61.3% | 5.1% | 8.2% |
| tertiary | 15,252 | 4.5% | 73.4% | 4.7% | 17.4% |
| unclassified | 74,104 | 0.8% | 83.2% | 3.6% | 12.4% |
| residential | 27,561 | 2.3% | 88.7% | 1.8% | 7.2% |
| **All** | 128,606 | 4.4% | 81.0% | 3.3% | 11.3% |

Observations:

1. Tertiary: 22% Rough or Off-road (Thailand: 4.3%). Even primary is 9%, secondary 13%.
2. Untagged is 81% of km, 73% of tertiary, 83% of unclassified. Only 4.5% of tertiary km is tagged Paved. With "missing surface = Paved", most of Nepal's network would be drawn as paved although the tagged part shows it often isn't. This is the strongest case for "mappers should tag the exceptions" and for showing untagged separately in the stats.
3. National highways tagged `surface=unpaved` go Off-road: NH66 ([w342736414](https://www.openstreetmap.org/way/342736414), 21.8 km), NH09, NH03. NH18 ([w344160419](https://www.openstreetmap.org/way/344160419)) has a note confirming it: "Only small vehicles (4 x 4 jeeps) are allowed".
4. `surface=ground` is almost as common as `unpaved` on Off-road roads (5,634 km vs 6,169 km).
5. Local paved values fall into Off-road (kept as found, see open question 8): `ottaseal` 63 km (Otta seal, a sprayed bitumen seal similar to chipseal), `Blacktopped` 36, `bitumin` 15, `premix` 4, `blacktop` 1: about 120 km of paved road shown as Off-road. Typos: `surface=3.5` (width in the surface tag), `surface=G`.
6. `smoothness=very_horrible` on a district road tagged `compacted` (69DR016, [w335759934](https://www.openstreetmap.org/way/335759934), 11.9 km) gives Specialized.

## Early cross-country findings (18 countries, 2026-11-02)

Full numbers: Overview in [stats/report.md](stats/report.md).

1. **Two bounds, not one number.** The "all km" share of Rough + Off-road treats untagged roads as Paved, so it is a lower bound. The share among tagged km only is biased the other way, because mappers tag surface more often when a road is not paved. The truth is in between. Tertiary, lower bound / tagged only: Myanmar 9% / 72%, Cambodia 18% / 58%, Nepal 22% / 83%, Ghana 43% / 75%, Thailand 4% / 9%.
2. **Tertiary**: 12 of 18 countries have more than 25% of all tertiary km Rough or Off-road (lower bound). In 15 of 18, more than half of tagged tertiary km is Rough or Off-road (exceptions: Thailand, Cuba, French Guiana).
3. **Main roads are not safe either.** Gabon: 44% of trunk and 80% of primary km Rough or Off-road, national routes RN4 ([w449286536](https://www.openstreetmap.org/way/449286536), 79 km) and RN5 tagged unpaved or dirt; 214 km of primary tagged `4wd_only=recommended`. Bolivia: 58% of primary, RN39 trunk ([w455824340](https://www.openstreetmap.org/way/455824340), 108 km, `ground` + `smoothness=very_bad`). Cameroon: 53% of primary.
4. **Iceland shows why Rough and Off-road must be separate.** Secondary: 48% Rough (`gravel`, `compacted`) and 17% Off-road. The Off-road part is mostly F-roads with `4wd_only=yes` (428 km), for example F26 Sprengisandsleið ([w319372206](https://www.openstreetmap.org/way/319372206)): `surface=gravel` alone would give Rough, `4wd_only=yes` raises it to Off-road. A paved/unpaved split would show F26 like any gravel road.
5. **Motorways**: 0% Rough or Off-road in every country with motorways. Untagged motorway really is paved, which supports "missing surface = Paved" on major classes.
6. **Thailand is the exception, not the rule**: lowest Rough + Off-road shares of all 18 countries on trunk to tertiary. Using Thailand as the main example would understate the problem.
7. **`surface=laterite` is already used on main roads**: Cameroon 307 km of primary and 339 km of secondary, classified Off-road.
8. **`surface=ground`** is the main Off-road value in Mongolia (608 km of primary) and second in Cameroon and Senegal.
9. **Credibility check**: Bolivia has only 10% untagged km and Iceland 7%, so their high shares come from real tagging, not from a few tagged roads.

## What "Untagged" and `surface=unpaved` really mean (2026-11-03)

These two are the weakest parts of the data and must be explained on the wiki page, not hidden.

### Untagged (no `surface`, no known `tracktype`)

58% of all road km in the 54 countries has no surface tag (11.6 million of 20.0 million km). The share grows as the class gets smaller:

| Class | Untagged | Untagged km |
|---|--:|--:|
| motorway | 16% | 0.02 M |
| trunk | 32% | 0.22 M |
| primary | 34% | 0.26 M |
| secondary | 36% | 0.42 M |
| tertiary | 49% | 1.38 M |
| unclassified | 53% | 4.04 M |
| residential | 79% | 5.28 M |

A missing surface tag can mean three different things:

1. **Implied paved**: the mapper saw an ordinary paved road and did not think a tag was needed. This is the usual case on main roads (motorways are 0% Unpaved wherever they are tagged).
2. **A track reclassified as a road, with an implied unpaved surface**: common in Thailand. A dirt track first mapped as `highway=track` (implied unpaved) is later changed to `unclassified` or `residential` without adding `surface=*`, so the implied unpaved surface is lost. Imports and AI-assisted editing (Meta/Grab RapiD) also add rural ways as `highway=residential` with no surface. Thailand: 81% of residential km and 60% of unclassified km untagged.
3. **Mapped from imagery, surface unknown**: the mapper could see a road but not its surface, and left it out rather than guess.

The rendering rule treats all three as Paved (no per-country defaults, decision in the brief), because guessing would be worse and because an honest map gives mappers a reason to add the tag. The stats keep Untagged as its own column so the reader can see how much of each country rests on this assumption. Where Untagged is high (India, Indonesia, Myanmar, Vietnam, 88 to 91%), the Unpaved share is a minimum, not an estimate.

### Ground-truth pilot: untagged roads in Malaysia (2026-11-03)

Test of "Untagged = Paved" in a mostly paved country (Malaysia chosen instead of Thailand to avoid the author's own mapping area). [examples/untagged-sample.ts](examples/untagged-sample.ts) draws random untagged ways of 0.3 km or more, weighted by km (fixed seed), and keeps those with a Mapillary image within 25 m of the midpoint. Sample and verdicts: [examples/untagged/my.json](examples/untagged/my.json), images `examples/images/mapillary/untagged-my-*.jpg`.

| Class | Untagged km | Ways tried | With imagery | Paved | Unpaved | No verdict |
|---|--:|--:|--:|--:|--:|--:|
| tertiary | 14,813 | 277 | 9 | 9 | 0 | 0 |
| unclassified | 53,873 | 298 | 1 | 0 | 0 | 1 (road not visible) |
| residential | 86,280 | 297 | 7 | 7 | 0 | 0 |

Result: every untagged road we could see was paved (16 of 16). But only 17 of 872 random untagged ways (2%) have street-level imagery at all, and just 1 of 298 unclassified ways, so the sample only shows the roads people drive with cameras: main roads and towns. It supports "Untagged = Paved" for untagged tertiary and residential roads with traffic, and says nothing about the rural unclassified network, where reclassified tracks would be. A wider radius or more tries would not fix this bias; ground truth for rural untagged roads needs local mappers.

### Unpaved roads that are paved now (2026-11-03)

Across the three image rounds, 55 roads tagged as unpaved were checked on street-level imagery ([examples/images/review.md](examples/images/review.md)). **9 (16%) are clearly paved now**, and 5 more (9%) are partly paved or under improvement (Ghana IR11, Ethiopia, Timor-Leste Lospalos-Malahara, two in Vietnam). The way history shows when the current surface tag was set:

| Road | Surface tag | Tag set | Imagery showing pavement |
|---|---|---|---|
| Nepal NH66 ([w342736414](https://www.openstreetmap.org/way/342736414)) | `unpaved` | 2015 | Google 2025 |
| New Zealand Purerua Road ([w164770191](https://www.openstreetmap.org/way/164770191)) | `gravel` | 2012 | Mapillary 2022 |
| Timor-Leste Viqueque-Baucau ([w40678552](https://www.openstreetmap.org/way/40678552)) | `unpaved` | 2020 | Mapillary and Google 2025 |
| Timor-Leste Baucau-Lautém ([w40628148](https://www.openstreetmap.org/way/40628148)) | `unpaved` | 2020 | Google 2024, Mapillary 2025 |
| Papua New Guinea Baiyer Road ([w841361566](https://www.openstreetmap.org/way/841361566)) | `dirt` | 2021 | Mapillary 2023 |
| Uganda Akokoro Road ([w518566598](https://www.openstreetmap.org/way/518566598)) | `unpaved` | 2023 | Mapillary 2024 |
| Mongolia Тамын trunk ([w1449651789](https://www.openstreetmap.org/way/1449651789)) | `ground` | 2026 | Mapillary 2024 (potholed asphalt) |
| Myanmar Moe Pyin-Mat Man ([w377792665](https://www.openstreetmap.org/way/377792665)) | `ground` | 2026 | Mapillary 2022 (concrete) |
| Finland 522 ([w22733235](https://www.openstreetmap.org/way/22733235)) | `compacted` | 2025 | Mapillary 2019 |

Two different stories:

1. **Paved after it was tagged (6 of 9)**: the unpaved tag is older than the imagery showing pavement, often by a few years (Timor-Leste 2020 to 2024-2025, Uganda 2023 to 2024, Papua New Guinea 2021 to 2023). This supports "the developing world is paving fast": surface tags go stale, and rendering based on them needs mappers to keep them fresh.
2. **Tagged unpaved after imagery already showed pavement (3 of 9)**: Mongolia, Myanmar and Finland got their current tag in 2025-2026, while street-level imagery from 2019-2024 already shows asphalt or concrete. Most likely armchair edits from satellite imagery. Rendering unpaved roads gives a reason to check street-level imagery before tagging.

Caution: roads with street-level imagery are often the more important, recently improved ones, so 16% is probably higher than across the whole network.

### `surface=unpaved`

`surface=unpaved` is 75.5% of all Unpaved km. The wiki page for the value says it "may mean everything from `surface=compacted` to `surface=mud`", and is used for armchair mapping, unknown material, and ways with changing surfaces. The image review confirms it covers everything: of 29 reviewed roads tagged `unpaved`, `dirt` or `ground`, 13 were really off-road, 5 were graded roads a normal car could drive, and 6 were already paved.

How much a country relies on the generic value says a lot about how its roads were mapped:

| Share of Unpaved km tagged just `surface=unpaved` | Countries |
|---|---|
| Highest (mostly imagery mapping) | Solomon Islands 96%, Vietnam 93%, Thailand 92%, Guatemala 92%, Malaysia 91%, Madagascar 89%, Mali 89%, Argentina 88% |
| Lowest (specific values: `gravel`, `compacted`, `ground`) | Denmark 9%, Iceland 9%, Romania 11%, Mongolia 13%, Czechia 13%, Iran 33%, Kyrgyzstan 34%, New Zealand 35% |

This is why the map has only two levels (decision 9): `surface=unpaved` honestly means "not paved, condition unknown", and a three-level map would have to guess.

## Findings, two-level model (55 rows, 2026-11-03)

54 countries plus Antarctica, about 20 million km of road. Full numbers: Overview in [stats/report.md](stats/report.md). Shares below are Unpaved km (with or without the Off-road mark) of all km in the class; "tagged only" divides by km that have a `surface` or `tracktype` (an upper bound, see the two-bounds note in the earlier findings).

1. **`surface=unpaved` is 75.5% of all Unpaved km** (then `ground` 9.9%, `gravel` 5.3%, `dirt` 4.1%, `compacted` 3.5%). This is the data behind decision 9: three quarters of unpaved road says nothing more precise than "unpaved", so a Rough vs Off-road split would mostly be a guess.
2. **The Off-road mark is rare**: about 190,000 km out of 5.3 million Unpaved km (3.6%): `smoothness` 120,000 km, `tracktype` 56,000, `4wd_only` 15,000. It rewards good tagging (Iceland F-roads, Gabon `4wd_only=recommended`) but is not the headline.
3. **Main roads are unpaved far beyond Africa.** Unpaved share of primary: Gabon 87%, Namibia 66%, DR Congo 64%, Bolivia 58%, Cameroon 54%, Mali 50%, Peru 40%, Mongolia 35%, Kyrgyzstan 33%. Of trunk: Gabon 45%, DR Congo 43% (63% of tagged km), Cameroon 27%, Kenya 26%, Bolivia 21%.
4. **Absolute length**: unpaved trunk, primary and secondary km: Brazil 41,900, Namibia 28,600, DR Congo 27,300, Australia 26,900, Peru 20,400, Bolivia 13,600, Cameroon 13,000, South Africa 10,300.
5. **Developed countries have it too**, with very little untagged data, so the numbers are solid: Iceland 65% of secondary (7% untagged), Australia 24% of secondary and 82% of unclassified (6% untagged), Chile 47% of tertiary and 87% of unclassified (6%), New Zealand 62% of unclassified (1%), Finland 41% of tertiary (26%), Romania 62% of unclassified (EU member). Baseline: Denmark and Czechia 0% on trunk to tertiary.
6. **Where tagging is weakest, the map looks most paved.** India, Indonesia, Myanmar and Vietnam are 88 to 91% untagged; their low Unpaved shares (tertiary 1 to 10%) say little. Among tagged km only, Myanmar tertiary is 71% unpaved, Indonesia 27%, India 9%.
7. **Tertiary, the class the mockups use**: more than half Unpaved in 18 of 54 countries (Mali 94%, Namibia 90%, Bolivia 89%, Ivory Coast 88%, Senegal 88%, Mongolia 81%, Argentina 80%, Honduras 79%, South Africa 77%, Iceland 76%, Gambia 75%, Cameroon 72%, Brazil 63%, Kenya 59%, Madagascar 58%, DR Congo 57%, Papua New Guinea 55%, Peru 54%).
8. **Motorways**: still 0% Unpaved everywhere.
9. **Sanity**: Bolivia's Off-road mark (29% of all km) comes from 57,265 km of `smoothness=very_bad`, likely one systematic tagging effort; check before quoting. Conflicts are small: 7,400 km of off-road evidence on paved roads (ignored), 3,800 km of `smoothness` excellent or good on unpaved surfaces.
10. **Antarctica**: the South Pole Traverse is mapped as a secondary road (`surface=ice`, `smoothness=very_bad`): Unpaved with the Off-road mark.
11. Re-run failures: Bolivia (in the main loop) and Romania (in a parallel run) failed once, most likely interrupted downloads while two runs shared the connection; both succeeded on retry.

## Open questions

Answers recorded here.

1. **`surface=unpaved` stays Off-road** (decided 2026-11-02). Reasons: [Tag:surface=unpaved](https://wiki.openstreetmap.org/wiki/Tag:surface=unpaved) says it may mean anything from `compacted` to `mud`, and it's used for armchair mapping and unknown material, so "a normal car can make it" is not verified. Showing mud as Rough can strand a city car, while showing compacted as Off-road only costs a detour. Mappers can correct it with a specific surface or `smoothness`. Ground truth: in Thailand, `unpaved` is commonly used for roads that really are off-road (Julien's field experience). To check in the Western contrast countries: is `unpaved` used there for roads a city car can drive?
2. Multiple values: split on `;`, worst part decides (agreed).
3. Route 1093: data issue, rule unchanged.
4. Strict precedence: smoothness over other tags, except `4wd_only` (agreed).
5. Scope: `*_link` excluded, `motorway` and `residential` included. Specialized column removed from tables, folded into Off-road.
6. `smoothness=impassable` (spec wording corrected).
7. Per-country table format agreed. Stored in [stats/summary.csv](stats/summary.csv) for reuse.
8. **Unknown and local values** (decided 2026-11-02): no whitelist change and no retagging or community contact for now. They are documented in [stats/unknown-values.md](stats/unknown-values.md), regenerated by `report.ts` across all countries. First pattern: chipseal-type paved surfaces under local names fall into Off-road, `ottaseal` (Nepal, 63 km) and `dbst` variants (Cambodia, about 155 km).
9. **Two levels plus an optional Off-road mark** (decided 2026-11-02, replaces the three levels Paved / Rough / Off-road). Reason: `surface=unpaved`, the most common non-paved value, can mean either Rough or Off-road (image review: 13 confirmed Off-road, 5 graded roads a car could drive, 6 now paved), so a three-level split would mostly show a guess. Routers, which see whole routes and the length of unpaved road, are better placed to judge difficulty. Rules to implement:
   - **Base**: surface whitelist gives Paved, any other surface Unpaved. No surface: `tracktype=grade1` Paved, `grade2` and higher Unpaved. Nothing: Paved on road classes, Unpaved on `highway=track`.
   - **Off-road mark**, on **Unpaved roads only**, only with positive evidence: `smoothness=very_bad` or `horrible`, `tracktype=grade3` to `grade7`, `4wd_only=yes` or `recommended`. On Paved roads these tags are ignored for rendering (routers can still use them). Paved + Off-road was rejected: a paved road with the mark makes no sense; such cases (route 1093, potholed asphalt) are tagging issues.
   - **Specialized** (render as path): `smoothness=very_horrible` or `impassable`, `tracktype=grade8`, `4wd_only=extreme`.
   - Smoothness no longer decides Paved vs Unpaved (reverses decision 4 for the base level).
   - Stats columns: Paved (tagged), Untagged, Unpaved, Off-road mark.
   - Status (2026-11-02): mockups, classifier, Lua and SQL ports, tests, stats and report all updated. Three-level results archived in [stats/archive/3-levels/](stats/archive/3-levels/). All countries to be rerun once (Timor-Leste done). Thailand added to the country list with a fresh Geofabrik download.
