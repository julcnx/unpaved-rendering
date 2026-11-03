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

Order (changed 2026-11-02): smallest download first, Western contrast last (Finland, Czechia, France; France chosen over Germany). Biggest downloads: France 4.9 GB, Brazil 2.0 GB, Indonesia 1.7 GB, India 1.6 GB. Added 2026-11-03 to reach 40 countries: Vietnam, Sri Lanka, Ivory Coast, Namibia, and a new group of developed countries with unpaved highways (Chile, New Zealand). Alaska was considered and left out. France was replaced by Denmark (474 MB instead of 4.9 GB) as the Western all-paved baseline: same role, a tenth of the download; Finland and Czechia complete the European contrast. Added 2026-11-03 to fill regional gaps (46 countries): Guatemala and Honduras (Central America), Morocco (North Africa), Kyrgyzstan (Central Asia), Ethiopia (East Africa, laterite survey list), Solomon Islands (Pacific). Second round of regional gaps (2026-11-03, smallest first): Albania, Georgia, Mali, Iran, Oman (from the Gulf-states extract, cut to Oman's border), Romania, Uganda, Mexico, Ukraine, then Canada last (6.2 GB). Ukraine and Canada put on hold the same day (commented out in the list, borders cached). Antarctica added as a special row, not a country: no border relation, so the whole extract south of 60°S is used. It has 5,700 km mapped as secondary and tertiary roads, almost all `surface=ice` (the South Pole Traverse), an extreme example of a road class that says nothing about the surface. Per continent: Asia 13, Africa 12, Americas 9, Europe 4, Oceania 3.

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
- Specialized (render as path) is folded into the Off-road mark in the tables and CSV (near zero on roads); raw km stay in the JSON.

Reusable summary: [stats/summary.csv](stats/summary.csv), one row per country and class (plus `all`), with km and % per bucket. Regenerated by `report.ts`.

Each result also has:

- `run`: run date, classifier hash (first 12 characters of the SHA-256 of `classify.ts`), osmium version, source extract and boundary, so numbers can be reproduced.
- `coverage_km`: km with each of `surface`, `smoothness`, `tracktype`, `4wd_only` present (any value), per class.
- `base_source_km`, `mark_source_km`, `value_km`: which tag and value decided the base level and the mark.
- Sanity material: unknown values, conflicts (off-road evidence on paved roads, `smoothness` excellent or good on unpaved surfaces), and the longest odd ways (unpaved main roads, ways with the Off-road mark, conflicts, unknown values; 0.5 km minimum, with any `note`, `description`, `fixme`).
- `run.pipeline_sha256`: hash of `classify.ts`, `road-stats.ts` and `run-country.sh` together. If it differs between two results, they were made with different code. `run.data_date_source`: `header` (extract replication timestamp) or `newest_object` (fallback when the header has no date).

`coverage_km`, `base_source_km`, `mark_source_km` and `value_km` are split per class and have an `all` entry.

**Untagged** means no `surface` and no known `tracktype`, so the road is assumed Paved. `smoothness` or `4wd_only` alone do not make a road tagged, because they never decide the base level. Use this wording on the wiki.

Tests: see Classifier above (66 tests, including 5 stats tests on a fixture of known lengths).

## Runs

All 55 rows (54 countries plus Antarctica), from [stats/results/](stats/results/). Downloads were deleted after each run; the source extract and border relation are recorded in each result. Thailand was rerun from a fresh Geofabrik download (the first run used `unpaved-app/regions/th/clipped.osm.pbf`, data 2026-10-30).

| Code | Name | Data date | Extract | Border | Run date |
|---|---|---|---|---|---|
| al | Albania | 2026-11-02 | `albania-latest.osm.pbf` | r53292 | 2026-11-03 |
| aq | Antarctica (not a country) | 2026-11-02 | `antarctica-latest.osm.pbf` | south of 60S | 2026-11-03 |
| ar | Argentina | 2026-11-02 | `argentina-latest.osm.pbf` | r286393 | 2026-11-03 |
| au | Australia | 2026-11-02 | `australia-latest.osm.pbf` | r80500 | 2026-11-03 |
| bo | Bolivia | 2026-11-02 | `bolivia-latest.osm.pbf` | r252645 | 2026-11-03 |
| br | Brazil | 2026-11-02 | `brazil-latest.osm.pbf` | r59470 | 2026-11-03 |
| cd | DR Congo | 2026-11-02 | `congo-democratic-republic-latest.osm.pbf` | r192795 | 2026-11-03 |
| cg | Congo-Brazzaville | 2026-11-02 | `congo-brazzaville-latest.osm.pbf` | r192794 | 2026-11-03 |
| ci | Ivory Coast | 2026-11-02 | `ivory-coast-latest.osm.pbf` | r192779 | 2026-11-03 |
| cl | Chile | 2026-11-02 | `chile-latest.osm.pbf` | r167454 | 2026-11-03 |
| cm | Cameroon | 2026-11-02 | `cameroon-latest.osm.pbf` | r192830 | 2026-11-03 |
| co | Colombia | 2026-11-02 | `colombia-latest.osm.pbf` | r120027 | 2026-11-03 |
| cu | Cuba | 2026-11-02 | `cuba-latest.osm.pbf` | r307833 | 2026-11-03 |
| cz | Czechia | 2026-11-01 | `czech-republic-latest.osm.pbf` | r51684 | 2026-11-03 |
| dk | Denmark | 2026-11-01 | `denmark-latest.osm.pbf` | r50046 | 2026-11-03 |
| et | Ethiopia | 2026-11-02 | `ethiopia-latest.osm.pbf` | r192800 | 2026-11-03 |
| fi | Finland | 2026-11-02 | `finland-latest.osm.pbf` | r54224 | 2026-11-03 |
| ga | Gabon | 2026-11-02 | `gabon-latest.osm.pbf` | r192793 | 2026-11-03 |
| ge | Georgia | 2026-11-01 | `georgia-latest.osm.pbf` | r28699 | 2026-11-03 |
| gf | French Guiana | 2026-11-01 | `guyane-latest.osm.pbf` | r1260551 | 2026-11-02 |
| gh | Ghana | 2026-11-02 | `ghana-latest.osm.pbf` | r192781 | 2026-11-03 |
| gm | Gambia | 2026-11-02 | `senegal-and-gambia-latest.osm.pbf` | r192774 | 2026-11-03 |
| gt | Guatemala | 2026-11-02 | `guatemala-latest.osm.pbf` | r1521463 | 2026-11-03 |
| hn | Honduras | 2026-11-02 | `honduras-latest.osm.pbf` | r287670 | 2026-11-03 |
| id | Indonesia | 2026-11-02 | `indonesia-latest.osm.pbf` | r304751 | 2026-11-03 |
| in | India | 2026-11-02 | `india-latest.osm.pbf` | r304716 | 2026-11-03 |
| ir | Iran | 2026-11-02 | `iran-latest.osm.pbf` | r304938 | 2026-11-03 |
| is | Iceland | 2026-11-01 | `iceland-latest.osm.pbf` | r299133 | 2026-11-03 |
| ke | Kenya | 2026-11-02 | `kenya-latest.osm.pbf` | r192798 | 2026-11-03 |
| kg | Kyrgyzstan | 2026-11-02 | `kyrgyzstan-latest.osm.pbf` | r178009 | 2026-11-03 |
| kh | Cambodia | 2026-11-02 | `cambodia-latest.osm.pbf` | r49898 | 2026-11-03 |
| la | Laos | 2026-11-02 | `laos-latest.osm.pbf` | r49903 | 2026-11-03 |
| lk | Sri Lanka | 2026-11-02 | `sri-lanka-latest.osm.pbf` | r536807 | 2026-11-03 |
| ma | Morocco | 2026-11-02 | `morocco-latest.osm.pbf` | r3630439 | 2026-11-03 |
| mg | Madagascar | 2026-11-02 | `madagascar-latest.osm.pbf` | r447325 | 2026-11-03 |
| ml | Mali | 2026-11-02 | `mali-latest.osm.pbf` | r192785 | 2026-11-03 |
| mm | Myanmar | 2026-11-02 | `myanmar-latest.osm.pbf` | r50371 | 2026-11-03 |
| mn | Mongolia | 2026-11-02 | `mongolia-latest.osm.pbf` | r161033 | 2026-11-03 |
| mx | Mexico | 2026-11-01 | `mexico-latest.osm.pbf` | r114686 | 2026-11-03 |
| my | Malaysia | 2026-11-02 | `malaysia-singapore-brunei-latest.osm.pbf` | r2108121 | 2026-11-03 |
| na | Namibia | 2026-11-02 | `namibia-latest.osm.pbf` | r195266 | 2026-11-03 |
| np | Nepal | 2026-11-02 | `nepal-latest.osm.pbf` | r184633 | 2026-11-03 |
| nz | New Zealand | 2026-11-02 | `new-zealand-latest.osm.pbf` | r556706 | 2026-11-03 |
| om | Oman | 2026-11-02 | `gcc-states-latest.osm.pbf` | r305138 | 2026-11-03 |
| pe | Peru | 2026-11-02 | `peru-latest.osm.pbf` | r288247 | 2026-11-03 |
| pg | Papua New Guinea | 2026-11-02 | `papua-new-guinea-latest.osm.pbf` | r307866 | 2026-11-03 |
| ph | Philippines | 2026-11-02 | `philippines-latest.osm.pbf` | r443174 | 2026-11-03 |
| ro | Romania | 2026-11-01 | `romania-latest.osm.pbf` | r90689 | 2026-11-03 |
| sb | Solomon Islands | 2026-11-02 | `solomon-islands-latest.osm.pbf` | r1857436 | 2026-11-03 |
| sn | Senegal | 2026-11-02 | `senegal-and-gambia-latest.osm.pbf` | r192775 | 2026-11-03 |
| th | Thailand | 2026-11-02 | `thailand-latest.osm.pbf` | r2067731 | 2026-11-03 |
| tl | Timor-Leste | 2026-11-01 | `east-timor-latest.osm.pbf` | r305142 | 2026-11-02 |
| ug | Uganda | 2026-11-02 | `uganda-latest.osm.pbf` | r192796 | 2026-11-03 |
| vn | Vietnam | 2026-11-02 | `vietnam-latest.osm.pbf` | r49915 | 2026-11-03 |
| za | South Africa | 2026-11-02 | `south-africa-latest.osm.pbf` | r87565 | 2026-11-03 |

## Country notes (two-level model)

### Thailand (data 2026-11-02)

| Class | km | Paved (tagged) | Untagged | Unpaved | of which Off-road mark |
|---|--:|--:|--:|--:|--:|
| motorway | 1,655 | 36.9% | 63.1% | 0.0% | 0.0% |
| trunk | 20,104 | 60.8% | 39.2% | 0.0% | 0.0% |
| primary | 17,705 | 59.5% | 40.5% | 0.0% | 0.0% |
| secondary | 41,729 | 57.9% | 42.1% | 0.0% | 0.0% |
| tertiary | 73,425 | 46.7% | 51.1% | 2.2% | 0.1% |
| unclassified | 154,033 | 18.7% | 59.9% | 21.3% | 1.7% |
| residential | 351,583 | 6.0% | 80.6% | 13.4% | 0.0% |
| **All** | 660,234 | 19.9% | 67.7% | 12.4% | 0.4% |

1. Trunk to secondary are 0% Unpaved and tertiary only 2%: Thailand has the lowest main-road Unpaved shares of the developing countries, so using it as the main example would understate the problem.
2. Unclassified: 21% Unpaved, 60% untagged. Many untagged unclassified and residential roads are reclassified tracks (see "What Untagged means" below).
3. `surface=unpaved` is 75,619 km, 92% of Thailand's Unpaved km.
4. Route 1093 ([w283410813](https://www.openstreetmap.org/way/283410813), `surface=paved` + `smoothness=very_bad`) is now Paved: off-road evidence on a paved road is ignored and listed as a conflict. Ground truth: poor tagging, likely broken concrete.
5. `smoothness=excellent` + `surface=unpaved` ([w968692295](https://www.openstreetmap.org/way/968692295)): now Unpaved, because smoothness no longer decides the base. Ground truth: the mapper forgot to remove `surface=unpaved`.
6. Thai-script surface values and typos (`as\`, `aas`, `W`) count as Unpaved: the free quality check works ([stats/unknown-values.md](stats/unknown-values.md)).

### Nepal (data 2026-11-02)

| Class | km | Paved (tagged) | Untagged | Unpaved | of which Off-road mark |
|---|--:|--:|--:|--:|--:|
| trunk | 2,132 | 45.5% | 54.3% | 0.1% | 0.0% |
| primary | 5,000 | 32.2% | 59.3% | 8.4% | 0.7% |
| secondary | 4,556 | 25.8% | 61.4% | 12.8% | 1.2% |
| tertiary | 15,252 | 4.8% | 73.5% | 21.7% | 1.1% |
| unclassified | 74,106 | 0.7% | 83.3% | 16.0% | 1.0% |
| residential | 27,563 | 2.3% | 88.7% | 9.0% | 0.3% |
| **All** | 128,609 | 4.4% | 81.1% | 14.5% | 0.8% |

Nepal has no motorway.

1. Tertiary 22% Unpaved, primary 8%, secondary 13%, with 74 to 83% untagged: the real shares are higher.
2. Only 4.8% of tertiary km is tagged Paved. With "missing surface = Paved", most of Nepal's network is drawn as paved although the tagged part shows it often isn't.
3. National highways tagged unpaved: NH66 ([w342736414](https://www.openstreetmap.org/way/342736414), 21.8 km), NH09, NH03; NH18 ([w344160419](https://www.openstreetmap.org/way/344160419), Off-road mark from `smoothness=horrible`, note "Only small vehicles (4 x 4 jeeps) are allowed"). NH66 is paved now (Google 2025), its tag dates from 2015.
4. `surface=ground` (5,832 km) is almost as common as `unpaved` (8,647 km).
5. Local paved values count as Unpaved: `ottaseal` 63 km (a sprayed bitumen seal similar to chipseal), `Blacktopped` 36, `bitumin` 15, `premix` 4 (kept as found, decision 8).

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

`surface=unpaved` is 75.5% of all Unpaved km. The wiki page for the value says it "may mean everything from `surface=compacted` to `surface=mud`", and is used for armchair mapping, unknown material, and ways with changing surfaces. The image review confirms it covers everything: of 55 reviewed roads tagged as unpaved, 41 really are unpaved (about half genuinely off-road, half graded roads a normal car can drive), 9 are paved now and 5 are mixed ([examples/images/review.md](examples/images/review.md)).

How much a country relies on the generic value says a lot about how its roads were mapped:

| Share of Unpaved km tagged just `surface=unpaved` | Countries |
|---|---|
| Highest (mostly imagery mapping) | Solomon Islands 96%, Vietnam 93%, Thailand 92%, Guatemala 92%, Malaysia 91%, Madagascar 89%, Mali 89%, Argentina 88% |
| Lowest (specific values: `gravel`, `compacted`, `ground`) | Denmark 9%, Iceland 9%, Romania 11%, Mongolia 13%, Czechia 13%, Iran 33%, Kyrgyzstan 34%, New Zealand 35% |

This is why the map has only two levels (decision 9): `surface=unpaved` honestly means "not paved, condition unknown", and a three-level map would have to guess.

## Official figures and key numbers (2026-11-03)

**Key numbers**: [stats/key-numbers.md](stats/key-numbers.md) is generated by `report.ts` from the results and from [examples/images/review-summary.json](examples/images/review-summary.json). The wiki page, diary and posts should quote figures from there, so they stay consistent when the data is rerun.

**Both bounds in the tables**: the Overview in [stats/report.md](stats/report.md) now shows each class as "all km / tagged km only", and [stats/summary.csv](stats/summary.csv) has a `pct_unpaved_of_tagged` column. The first number is a minimum (untagged roads count as paved); the second is an upper bound (mappers tag surface more often when a road is not paved).

**Official figures**: the CIA World Factbook published total, paved and unpaved road km per country until 2025; its Roadways field was removed between 2025-04-10 and 2025-05-15. [stats/official/factbook.py](stats/official/factbook.py) reads the last snapshot with it (github.com/factbook/factbook.json, commit `43907b2cd0`, public domain) into [stats/official/factbook-roadways.json](stats/official/factbook-roadways.json). 34 of our 54 countries have both total and paved km (survey years 2001 to 2024; some countries only give a total).

| Result | Countries |
|---|---|
| Official unpaved share **inside** the OSM range (all km to tagged km) | 15: Papua New Guinea, Bolivia, Kenya, Uganda, Honduras, Laos, Peru, Cuba, Argentina, Senegal, Guatemala, Timor-Leste, Kyrgyzstan, Malaysia, Iran |
| Official share **higher** than even the OSM upper bound | 18, for example DR Congo 98% (OSM 38% / 97%), Mexico 75% (13% / 48%), Sri Lanka 85% (14% / 38%), Cambodia 76% (9% / 52%), Philippines 72% (13% / 40%) |
| Official share lower | 1: New Zealand 34% (OSM 36% / 37%), practically equal |

Conclusion: **OSM-based Unpaved shares are conservative.** Where they differ from official statistics, official figures show more unpaved road, not less. Caveats to state with the numbers: definitions differ (official "unpaved" usually includes rural roads and tracks that OSM may map as `highway=track`, which we leave out), survey years are old in some countries (Gabon and Cuba 2001; roads have been paved since, which works against the conclusion), and OSM maps 1 to 10 times more road km than the official inventories (mostly residential and unclassified roads not counted officially). Full table: "Official figures" in [stats/report.md](stats/report.md).

## Findings, two-level model (55 rows, 2026-11-03)

54 countries plus Antarctica, about 20 million km of road. Full numbers: Overview in [stats/report.md](stats/report.md). Shares below are Unpaved km (with or without the Off-road mark) of all km in the class; "tagged only" divides by km that have a `surface` or `tracktype` (an upper bound, see the two-bounds note in the earlier findings).

1. **`surface=unpaved` is 75.5% of all Unpaved km** (then `ground` 9.9%, `gravel` 5.3%, `dirt` 4.1%, `compacted` 3.5%). This is the data behind decision 9: three quarters of unpaved road says nothing more precise than "unpaved", so a Rough vs Off-road split would mostly be a guess.
2. **The Off-road mark is rare**: about 190,000 km out of 5.3 million Unpaved km (3.6%): `smoothness` 120,000 km, `tracktype` 56,000, `4wd_only` 15,000. It rewards good tagging (Iceland F-roads, Gabon `4wd_only=recommended`) but is not the headline.
3. **Main roads are unpaved far beyond Africa.** Unpaved share of primary: Gabon 87%, Namibia 66%, DR Congo 64%, Bolivia 58%, Cameroon 54%, Mali 50%, Peru 40%, Mongolia 35%, Kyrgyzstan 33%. Of trunk: Gabon 45%, DR Congo 43% (63% of tagged km), Cameroon 27%, Kenya 26%, Bolivia 21%.
4. **Absolute length**: unpaved trunk, primary and secondary km: Brazil 41,900, Namibia 28,600, DR Congo 27,300, Australia 26,900, Peru 20,400, Bolivia 13,600, Cameroon 13,000, South Africa 10,300.
5. **Developed countries have it too**, with very little untagged data, so the numbers are solid: Iceland 65% of secondary (7% untagged), Australia 24% of secondary and 82% of unclassified (6% untagged), Chile 47% of tertiary and 87% of unclassified (6%), New Zealand 62% of unclassified (1%), Finland 41% of tertiary (26%), Romania 62% of unclassified (EU member). Baseline: Denmark and Czechia 0% on trunk to tertiary.
6. **Where tagging is weakest, the map looks most paved.** India, Indonesia, Myanmar and Vietnam are 88 to 91% untagged; their low Unpaved shares (tertiary 1 to 10%) say little. Among tagged km only, Myanmar tertiary is 71% unpaved, Indonesia 27%, India 9%.
7. **Tertiary, the class the mockups use**: more than half Unpaved in 18 of 54 countries (Mali 94%, Namibia 90%, Bolivia 89%, Ivory Coast 88%, Senegal 88%, Mongolia 81%, Argentina 80%, Honduras 79%, South Africa 77%, Iceland 76%, Gambia 75%, Cameroon 72%, Brazil 63%, Kenya 59%, Madagascar 58%, DR Congo 57%, Papua New Guinea 55%, Peru 54%).
8. **Motorways**: practically 0% Unpaved: 41 km out of 128,817 km.
9. **Sanity**: Bolivia's Off-road mark (29% of all km) comes from 57,265 km of `smoothness=very_bad`, likely one systematic tagging effort; check before quoting. Conflicts are small: 7,400 km of off-road evidence on paved roads (ignored), 3,800 km of `smoothness` excellent or good on unpaved surfaces.
10. **Antarctica**: the South Pole Traverse is mapped as a secondary road (`surface=ice`, `smoothness=very_bad`): Unpaved with the Off-road mark.
11. Re-run failures: Bolivia (in the main loop) and Romania (in a parallel run) failed once, most likely interrupted downloads while two runs shared the connection; both succeeded on retry.

## Open questions

Answers recorded here.

1. **Superseded by decision 9.** Was: `surface=unpaved` stays Off-road (decided 2026-11-02). Under two levels `unpaved` is simply Unpaved; the arguments below still explain why it must not be shown as Paved. Reasons: [Tag:surface=unpaved](https://wiki.openstreetmap.org/wiki/Tag:surface=unpaved) says it may mean anything from `compacted` to `mud`, and it's used for armchair mapping and unknown material, so "a normal car can make it" is not verified. Showing mud as Rough can strand a city car, while showing compacted as Off-road only costs a detour. Mappers can correct it with a specific surface or `smoothness`. Ground truth: in Thailand, `unpaved` is commonly used for roads that really are off-road (Julien's field experience). To check in the Western contrast countries: is `unpaved` used there for roads a city car can drive?
2. Multiple values: split on `;`, worst part decides (agreed).
3. Route 1093: data issue. Under decision 9 it is Paved, and its `smoothness=very_bad` is listed as a conflict.
4. **Partly superseded by decision 9**: smoothness no longer decides Paved vs Unpaved. Strict precedence still applies to the Off-road mark (smoothness over tracktype, `4wd_only` as a minimum).
5. Scope: `*_link` excluded, `motorway` and `residential` included. Specialized column removed from tables, folded into the Off-road mark.
6. `smoothness=impassable` (spec wording corrected).
7. Per-country table format agreed. Stored in [stats/summary.csv](stats/summary.csv) for reuse.
8. **Unknown and local values** (decided 2026-11-02): no whitelist change and no retagging or community contact for now. They are documented in [stats/unknown-values.md](stats/unknown-values.md), regenerated by `report.ts` across all countries. First pattern: chipseal-type paved surfaces under local names fall into Off-road, `ottaseal` (Nepal, 63 km) and `dbst` variants (Cambodia, about 155 km).
9. **Two levels plus an optional Off-road mark** (decided 2026-11-02, replaces the three levels Paved / Rough / Off-road). Reason: `surface=unpaved`, the most common non-paved value, can mean a graded road or a real off-road track (first image review: 13 confirmed off-road, 5 graded roads a car could drive, 6 now paved), so a three-level split would mostly show a guess. Routers, which see whole routes and the length of unpaved road, are better placed to judge difficulty. Rules to implement:
   - **Base**: surface whitelist gives Paved, any other surface Unpaved. No surface: `tracktype=grade1` Paved, `grade2` and higher Unpaved. Nothing: Paved on road classes, Unpaved on `highway=track`.
   - **Off-road mark**, on **Unpaved roads only**, only with positive evidence: `smoothness=very_bad` or `horrible`, `tracktype=grade3` to `grade7`, `4wd_only=yes` or `recommended`. On Paved roads these tags are ignored for rendering (routers can still use them). Paved + Off-road was rejected: a paved road with the mark makes no sense; such cases (route 1093, potholed asphalt) are tagging issues.
   - **Specialized** (render as path): `smoothness=very_horrible` or `impassable`, `tracktype=grade8`, `4wd_only=extreme`.
   - Smoothness no longer decides Paved vs Unpaved (reverses decision 4 for the base level).
   - Stats columns: Paved (tagged), Untagged, Unpaved, Off-road mark.
   - Status (2026-11-02): mockups, classifier, Lua and SQL ports, tests, stats and report all updated. Three-level results archived in [stats/archive/3-levels/](stats/archive/3-levels/). All countries to be rerun once (Timor-Leste done). Thailand added to the country list with a fresh Geofabrik download.
