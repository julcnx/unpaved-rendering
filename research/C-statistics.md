# C. Classifier and statistics

## Classifier

Model: two base levels, **Paved** and **Unpaved**, plus an optional **Off-road mark** on Unpaved roads only (decision 9, 2026-11-02). The earlier three-level model (Paved / Rough / Off-road) is archived in [stats/archive/3-levels/](stats/archive/3-levels/).

Reference implementation: [classifier/classify.ts](classifier/classify.ts). Ports with the same rules:

- [classifier/classify.lua](classifier/classify.lua): Lua (osm2pgsql flex and similar). `classify(tags)` returns level, base, base source, mark, mark source.
- [classifier/classify.sql](classifier/classify.sql): PostgreSQL functions. `road_surface_class(highway, surface, smoothness, tracktype, 4wd_only)` returns `paved`, `unpaved`, `offroad` or `specialized`.

Tests: [classifier/test-cases.json](classifier/test-cases.json) has 100 cases shared by all three. `node --test classifier/classify.test.ts classifier/ports.test.ts stats/test/road-stats.test.ts` runs everything (108 tests, the SQL one skipped without a database). The SQL test runs only when `PGHOST`/`PGPORT` point to a test database; run against a throwaway PostgreSQL 17 on 2026-11-12, all passing.

**Base level** (first tag that applies):

| Priority | Tag | Paved | Unpaved |
|---|---|---|---|
| 1 | `surface`, unpaved value | | everything not in the paved list, including typos and local values |
| 2 | unpaved evidence, even with a paved surface | | `smoothness` very_bad or worse; `4wd_only` yes, recommended or extreme |
| 3 | `surface`, paved value | paved, asphalt, chipseal, concrete, concrete:plates, paving_stones, sett, bricks, metal, cobblestone, cobblestone:flattened; wood, concrete:lanes and grass_paver only with `smoothness` bad or better | |
| 4 | `tracktype` (no surface) | grade1 | grade2 to grade8 |
| 5 | nothing | road classes | `highway=track` |

**Off-road mark** (Unpaved roads only, ignored on Paved roads):

| Priority | Tag | Off-road mark | Specialized (render as path) |
|---|---|---|---|
| 1 | `smoothness` (any known value decides) | very_bad, horrible | very_horrible, impassable |
| 2 | `tracktype` (any known value decides; grade1 to grade3 give no mark) | grade4 to grade7 | grade8 |
| 3 | `surface` | mud, rock | |
| minimum | `4wd_only` | recommended, yes | extreme |

Decisions:

1. Unknown `smoothness` or `tracktype` values (typos, legacy like `smoothness=rough`) are ignored and the next tag decides.
2. `4wd_only` is a minimum for the mark: it can raise it, never lower it.
3. The spec says `smoothness=impossible`; the documented OSM value is `impassable`. The classifier uses `impassable`.
4. `tracktype=grade6` to `grade8`: Australian local extension (from Australian mappers in the survey replies).
5. Multiple surface values (`asphalt;concrete`) are Paved only if every part is paved.
6. Good smoothness never makes a road Paved: `smoothness=excellent` + `surface=unpaved` is Unpaved. Since 2026-11-12, `smoothness` very_bad or worse and `4wd_only` make a road Unpaved even with a paved surface (a city car cannot pass); these are listed as conflicts in the stats. `tracktype` never overrules a surface (open question 12).
7. `cobblestone` and `cobblestone:flattened` are Paved (legacy value mostly used for sett; OSM Carto and Organic Maps also treat it as paved).

## Statistics pipeline

```
stats/run-country.sh <code> <extract.osm.pbf> <country.geojson> [country name]
node stats/report.ts > stats/report.md
```

All countries: `stats/run-all.sh` (or `ONLY="tl kh" stats/run-all.sh`). For each line of [stats/countries.txt](stats/countries.txt) (Geofabrik path, ISO code, name), it downloads the extract, gets the border with [stats/boundary.sh](stats/boundary.sh), runs the stats, and deletes the download. Countries with a result are skipped, so it can be restarted. Combined extracts (Senegal and Gambia) are kept until their last country is done. Shows progress (`[n/total]`, download bar) in the terminal; Ctrl-C stops cleanly, run again to continue.

Order (changed 2026-11-02): smallest download first, Western contrast last (Finland, Czechia, France; France chosen over Germany). Biggest downloads: France 4.9 GB, Brazil 2.0 GB, Indonesia 1.7 GB, India 1.6 GB. Added 2026-11-03 to reach 40 countries: Vietnam, Sri Lanka, Ivory Coast, Namibia, and a new group of developed countries with unpaved highways (Chile, New Zealand). Alaska was considered and left out. France was replaced by Denmark (474 MB instead of 4.9 GB) as the Western all-paved baseline: same role, a tenth of the download; Finland and Czechia complete the European contrast. Added 2026-11-03 to fill regional gaps (46 countries): Guatemala and Honduras (Central America), Morocco (North Africa), Kyrgyzstan (Central Asia), Ethiopia (East Africa, laterite survey list), Solomon Islands (Pacific). Second round of regional gaps (2026-11-03, smallest first): Albania, Georgia, Mali, Iran, Oman (from the Gulf-states extract, cut to Oman's border), Romania, Uganda, Mexico, Ukraine, then Canada last (6.2 GB). Ukraine and Canada put on hold the same day (commented out in the list, borders cached). Antarctica added as a special row, not a country: no border relation, so the whole extract south of 60°S is used. It has 5,700 km mapped as secondary and tertiary roads, almost all `surface=ice` (the South Pole Traverse), an extreme example of a road class that says nothing about the surface. Per continent (54 countries): Asia 16, Africa 16, Americas 11, Europe 7, Oceania 4.

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

**Untagged** means no `surface` and no known `tracktype`, so the road is assumed Paved. `smoothness` bad or better, or `4wd_only=no`, alone do not make a road tagged, because they do not decide the base level; `smoothness` very_bad or worse, or a positive `4wd_only`, makes it Unpaved. Use this wording on the wiki.

**Off-road evidence per country** (2026-11-09, rerun 2026-11-12, [stats/mark-coverage.md](stats/mark-coverage.md), from the combination tables): 5.9% of Unpaved km have `smoothness`, `tracktype` or `4wd_only`, so the Off-road mark can be decided there today; 3.1% get the mark. From 41% in Bolivia (mostly `smoothness`) and 29% in Iceland (mostly `4wd_only`) down to 2% in Brazil, which has the most Unpaved km. Includes a short table for the article.

**Spot check** (2026-11-09, [stats/spot-check.ts](stats/spot-check.ts)): the 2 longest ways of each odd-way list (unpaved main roads, Off-road mark, conflicts, unknown values) for Namibia, Bolivia, Nepal and Denmark, 28 ways, fetched again from the OSM API. All 28 have the same tags, level and length as in the results. This checks the per-way pipeline (tags, classifier, length), not the country totals.

Tests: see Classifier above (108 tests, including the stats tests on a fixture of known lengths).

## Runs

All 55 rows (54 countries plus Antarctica), from [stats/results/](stats/results/). Downloads were deleted after each run; the source extract and border relation are recorded in each result. Thailand was rerun from a fresh Geofabrik download (the first run used `unpaved-app/regions/th/clipped.osm.pbf`, data 2026-10-30).

| Code | Name | Data date | Extract | Border | Run date |
|---|---|---|---|---|---|
| al | Albania | 2026-11-11 | `albania-latest.osm.pbf` | r53292 | 2026-11-12 |
| aq | Antarctica (not a country) | 2026-11-11 | `antarctica-latest.osm.pbf` | south of 60S | 2026-11-12 |
| ar | Argentina | 2026-11-11 | `argentina-latest.osm.pbf` | r286393 | 2026-11-12 |
| au | Australia | 2026-11-11 | `australia-latest.osm.pbf` | r80500 | 2026-11-12 |
| bo | Bolivia | 2026-11-11 | `bolivia-latest.osm.pbf` | r252645 | 2026-11-12 |
| br | Brazil | 2026-11-11 | `brazil-latest.osm.pbf` | r59470 | 2026-11-12 |
| cd | DR Congo | 2026-11-11 | `congo-democratic-republic-latest.osm.pbf` | r192795 | 2026-11-12 |
| cg | Congo-Brazzaville | 2026-11-11 | `congo-brazzaville-latest.osm.pbf` | r192794 | 2026-11-12 |
| ci | Ivory Coast | 2026-11-11 | `ivory-coast-latest.osm.pbf` | r192779 | 2026-11-12 |
| cl | Chile | 2026-11-11 | `chile-latest.osm.pbf` | r167454 | 2026-11-12 |
| cm | Cameroon | 2026-11-11 | `cameroon-latest.osm.pbf` | r192830 | 2026-11-12 |
| co | Colombia | 2026-11-11 | `colombia-latest.osm.pbf` | r120027 | 2026-11-12 |
| cu | Cuba | 2026-11-11 | `cuba-latest.osm.pbf` | r307833 | 2026-11-12 |
| cz | Czechia | 2026-11-11 | `czech-republic-latest.osm.pbf` | r51684 | 2026-11-12 |
| dk | Denmark | 2026-11-11 | `denmark-latest.osm.pbf` | r50046 | 2026-11-12 |
| et | Ethiopia | 2026-11-11 | `ethiopia-latest.osm.pbf` | r192800 | 2026-11-12 |
| fi | Finland | 2026-11-11 | `finland-latest.osm.pbf` | r54224 | 2026-11-12 |
| ga | Gabon | 2026-11-11 | `gabon-latest.osm.pbf` | r192793 | 2026-11-12 |
| ge | Georgia | 2026-11-11 | `georgia-latest.osm.pbf` | r28699 | 2026-11-12 |
| gf | French Guiana | 2026-11-11 | `guyane-latest.osm.pbf` | r1260551 | 2026-11-12 |
| gh | Ghana | 2026-11-11 | `ghana-latest.osm.pbf` | r192781 | 2026-11-12 |
| gm | Gambia | 2026-11-11 | `senegal-and-gambia-latest.osm.pbf` | r192774 | 2026-11-12 |
| gt | Guatemala | 2026-11-11 | `guatemala-latest.osm.pbf` | r1521463 | 2026-11-12 |
| hn | Honduras | 2026-11-11 | `honduras-latest.osm.pbf` | r287670 | 2026-11-12 |
| id | Indonesia | 2026-11-11 | `indonesia-latest.osm.pbf` | r304751 | 2026-11-12 |
| in | India | 2026-11-11 | `india-latest.osm.pbf` | r304716 | 2026-11-12 |
| ir | Iran | 2026-11-11 | `iran-latest.osm.pbf` | r304938 | 2026-11-12 |
| is | Iceland | 2026-11-10 | `iceland-latest.osm.pbf` | r299133 | 2026-11-12 |
| ke | Kenya | 2026-11-11 | `kenya-latest.osm.pbf` | r192798 | 2026-11-12 |
| kg | Kyrgyzstan | 2026-11-11 | `kyrgyzstan-latest.osm.pbf` | r178009 | 2026-11-12 |
| kh | Cambodia | 2026-11-11 | `cambodia-latest.osm.pbf` | r49898 | 2026-11-12 |
| la | Laos | 2026-11-11 | `laos-latest.osm.pbf` | r49903 | 2026-11-12 |
| lk | Sri Lanka | 2026-11-11 | `sri-lanka-latest.osm.pbf` | r536807 | 2026-11-12 |
| ma | Morocco | 2026-11-11 | `morocco-latest.osm.pbf` | r3630439 | 2026-11-12 |
| mg | Madagascar | 2026-11-11 | `madagascar-latest.osm.pbf` | r447325 | 2026-11-12 |
| ml | Mali | 2026-11-11 | `mali-latest.osm.pbf` | r192785 | 2026-11-12 |
| mm | Myanmar | 2026-11-11 | `myanmar-latest.osm.pbf` | r50371 | 2026-11-12 |
| mn | Mongolia | 2026-11-11 | `mongolia-latest.osm.pbf` | r161033 | 2026-11-12 |
| mx | Mexico | 2026-11-11 | `mexico-latest.osm.pbf` | r114686 | 2026-11-12 |
| my | Malaysia | 2026-11-11 | `malaysia-singapore-brunei-latest.osm.pbf` | r2108121 | 2026-11-12 |
| na | Namibia | 2026-11-11 | `namibia-latest.osm.pbf` | r195266 | 2026-11-12 |
| np | Nepal | 2026-11-11 | `nepal-latest.osm.pbf` | r184633 | 2026-11-12 |
| nz | New Zealand | 2026-11-11 | `new-zealand-latest.osm.pbf` | r556706 | 2026-11-12 |
| om | Oman | 2026-11-11 | `gcc-states-latest.osm.pbf` | r305138 | 2026-11-12 |
| pe | Peru | 2026-11-11 | `peru-latest.osm.pbf` | r288247 | 2026-11-12 |
| pg | Papua New Guinea | 2026-11-11 | `papua-new-guinea-latest.osm.pbf` | r307866 | 2026-11-12 |
| ph | Philippines | 2026-11-11 | `philippines-latest.osm.pbf` | r443174 | 2026-11-12 |
| ro | Romania | 2026-11-10 | `romania-latest.osm.pbf` | r90689 | 2026-11-12 |
| sb | Solomon Islands | 2026-11-11 | `solomon-islands-latest.osm.pbf` | r1857436 | 2026-11-12 |
| sn | Senegal | 2026-11-11 | `senegal-and-gambia-latest.osm.pbf` | r192775 | 2026-11-12 |
| th | Thailand | 2026-11-11 | `thailand-latest.osm.pbf` | r2067731 | 2026-11-12 |
| tl | Timor-Leste | 2026-11-11 | `east-timor-latest.osm.pbf` | r305142 | 2026-11-12 |
| ug | Uganda | 2026-11-11 | `uganda-latest.osm.pbf` | r192796 | 2026-11-12 |
| vn | Vietnam | 2026-11-11 | `vietnam-latest.osm.pbf` | r49915 | 2026-11-12 |
| za | South Africa | 2026-11-11 | `south-africa-latest.osm.pbf` | r87565 | 2026-11-12 |

## Country notes (two-level model)

### Thailand (data 2026-11-11)

| Class | km | Paved (tagged) | Untagged | Unpaved | of which Off-road mark |
|---|--:|--:|--:|--:|--:|
| motorway | 1,656 | 36.9% | 63.1% | 0.0% | 0.0% |
| trunk | 20,105 | 60.8% | 39.2% | 0.0% | 0.0% |
| primary | 17,754 | 59.4% | 40.6% | 0.0% | 0.0% |
| secondary | 41,743 | 57.9% | 42.1% | 0.0% | 0.0% |
| tertiary | 73,471 | 46.6% | 51.1% | 2.2% | 0.2% |
| unclassified | 154,004 | 18.7% | 59.9% | 21.4% | 1.7% |
| residential | 351,625 | 6.0% | 80.6% | 13.4% | 0.0% |
| **All** | 660,360 | 19.9% | 67.7% | 12.4% | 0.4% |

1. Trunk to secondary are 0% Unpaved and tertiary only 2%: Thailand has the lowest main-road Unpaved shares of the developing countries, so using it as the main example would understate the problem.
2. Unclassified: 21% Unpaved, 60% untagged. Many untagged unclassified and residential roads are reclassified tracks (see "What Untagged means" below).
3. `surface=unpaved` is 75,541 km, 92% of Thailand's Unpaved km.
4. Route 1093 ([w283410813](https://www.openstreetmap.org/way/283410813), `surface=paved` + `smoothness=very_bad`) is Unpaved with the Off-road mark since decision 12 (2026-11-12): `smoothness` very_bad or worse makes a paved road Unpaved, and it is still listed as a conflict. Ground truth: poor tagging, likely broken concrete.
5. `smoothness=excellent` + `surface=unpaved` ([w968692295](https://www.openstreetmap.org/way/968692295)): now Unpaved, because smoothness no longer decides the base. Ground truth: the mapper forgot to remove `surface=unpaved`.
6. Thai-script surface values and typos (`as\`, `aas`, `W`) count as Unpaved: the free quality check works ([stats/unknown-values.md](stats/unknown-values.md)).

### Nepal (data 2026-11-11)

| Class | km | Paved (tagged) | Untagged | Unpaved | of which Off-road mark |
|---|--:|--:|--:|--:|--:|
| motorway | 4 | 0.0% | 100.0% | 0.0% | 0.0% |
| trunk | 2,132 | 45.6% | 53.4% | 1.0% | 0.9% |
| primary | 5,000 | 31.7% | 59.3% | 9.0% | 1.1% |
| secondary | 4,557 | 25.8% | 61.4% | 12.8% | 1.0% |
| tertiary | 15,251 | 4.7% | 73.5% | 21.7% | 0.9% |
| unclassified | 74,130 | 0.7% | 83.3% | 16.0% | 0.7% |
| residential | 27,575 | 2.3% | 88.7% | 9.0% | 0.1% |
| **All** | 128,648 | 4.4% | 81.1% | 14.6% | 0.6% |

Nepal has 4 km mapped as motorway, untagged.

1. Tertiary 22% Unpaved, primary 9%, secondary 13%, with 74 to 83% untagged: the real shares are higher.
2. Only 4.8% of tertiary km is tagged Paved. With "missing surface = Paved", most of Nepal's network is drawn as paved although the tagged part shows it often isn't.
3. National highways tagged unpaved: NH66 ([w342736414](https://www.openstreetmap.org/way/342736414), 21.8 km), NH09, NH03; NH18 ([w344160419](https://www.openstreetmap.org/way/344160419), Off-road mark from `smoothness=horrible`, note "Only small vehicles (4 x 4 jeeps) are allowed"). NH66 is paved now (Google 2025), its tag dates from 2015.
4. `surface=ground` (5,833 km) is almost as common as `unpaved` (8,647 km).
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
| residential | 78% | 5.28 M |

A missing surface tag can mean three different things:

1. **Implied paved**: the mapper saw an ordinary paved road and did not think a tag was needed. This is the usual case on main roads (motorways are 0% Unpaved wherever they are tagged).
2. **A track reclassified as a road, with an implied unpaved surface**: common in Thailand. A dirt track first mapped as `highway=track` (implied unpaved) is later changed to `unclassified` or `residential` without adding `surface=*`, so the implied unpaved surface is lost. Organised editing also added farm tracks as `highway=residential` with no surface from the start (Grab, see "Mapping history in Thailand" below). Thailand: 81% of residential km and 60% of unclassified km untagged.
3. **Mapped from imagery, surface unknown**: the mapper could see a road but not its surface, and left it out rather than guess.

The rendering rule treats all three as Paved (no per-country defaults, decision in the brief), because guessing would be worse and because an honest map gives mappers a reason to add the tag. The stats keep Untagged as its own column so the reader can see how much of each country rests on this assumption. Where Untagged is high (India, Indonesia, Myanmar, Vietnam, 88 to 91%), the Unpaved share is a minimum, not an estimate.

### Mapping history in Thailand: unpaved roads as `track`, farm tracks as `residential` (2026-11-10)

Two practices, documented on the OSM community forum, move unpaved road out of our numbers in opposite directions. Both make the Thai Unpaved share a minimum.

**1. Unpaved roads mapped as `highway=track` from the start, because renderers showed nothing else.** Not a later downgrade: some survey mappers chose `track` for rough roads, including roads between villages, when they first mapped them.

- [How we use highway=track in Thailand](https://community.openstreetmap.org/t/how-we-use-highway-track-in-thailand/74579) (January 2016, old forum topic 53213). stephankn proposed tagging by function (village links at least `unclassified`, never `track`), supported by Bernhard_Hiller and Paul_012. Survey mappers disagreed:
  - Russ_McD: a road a normal 2WD car can drive is `unclassified` + `surface`; if ruts and washouts stop normal travel it is a `track`, and "some of the mountain hamlets and settlements are connected by these ways, but in this case we dont tag as an UPR just because it connects villages".
  - crsCR, on `surface` and `tracktype`: "These don't change the visual display in any useful or usable way. (At least, not in any OSM data displaying maps I've seen.)" For that reason they did not add those tags at all, and used `track` for rough ways. They quoted the `highway=unclassified` wiki page of the time: "should be tagged as highway=track if they are unfit for standard motorcar usage".
- [Proposal for highway classification revision](https://community.openstreetmap.org/t/proposal-for-highway-classification-revision/93701) (2021), julcnx (post 36): consensus in 2016 leaned towards `track` for safety reasons, and "Most renderers will only rely on highway tag and this is why highway=track has been abused to describe unpaved/4wd conditions instead of its actual function."
- [Thailand's Minor Road Classifications Revision Proposal](https://community.openstreetmap.org/t/5805) (2022), julcnx: lists "highway=track used for anything unpaved" as a current problem.
- Today's [Tag:highway=track](https://wiki.openstreetmap.org/wiki/Tag:highway=track) page says the opposite ("Unpaved roads that are not track roads"; surface alone is not enough to classify a road).

Effect on the stats: these roads are outside our scope (tracks are left out), so unpaved km between villages is missing from the Unpaved share. This is the "tagging for the renderer" problem the project answers: once a renderer shows unpaved roads, mappers no longer need `track` to warn about the surface.

**2. Farm tracks mapped as `highway=residential` because of huts (Grab, about 2018 to 2022).** Grab's organised editing team added rural ways as `residential` when rooftops were visible on imagery; many were farm tracks, unpaved, some 4WD only, with no `surface` tag.

- [Warning: New GrabOSM campaign](https://community.openstreetmap.org/t/94805) (from December 2021):
  - julcnx (post 5): "Under the pretext of visible 'rooftops', your mappers continuously added residential roads everywhere outside of settlements. Most of these 'roads' are actually agricultural tracks leading to farms, and many are unpaved, 4WD only. Many visible 'rooftops' are often huts used for rest."
  - Grab (jinalfoflia, post 10) accepted it: "Going forward will tag the unpaved roads in the agricultural or forestry areas as tracks referring to WikiProject_Thailand."
  - Bernhard_Hiller (post 13), after a field trip: Grab ways are mapped "as a 'residential' for kilometers into rubber plantations".
- [Rules for remote organized editing teams](https://community.openstreetmap.org/t/95637) (2022), julcnx, list of issues: "farm huts are not residential houses!", "adding thru-traffic residential roads everywhere in rural/farming/agricultural areas", "changing (valid) tracks and service roads to residential".
- [GRAB - Here we bloody go again !](https://community.openstreetmap.org/t/85194) (2018): AlaskaDave says the ways "look like they're only rough tracks through a field"; Russ_McD asks Grab to stop adding "tracks across fields".
- [Grab / GlobalLogic India directed editing](https://community.openstreetmap.org/t/84849) (2018), Russ_McD on Facebook's earlier edits: "virtually everything tagged as a residential road, from tracks across fields, to peoples private drives".
- [Ending corporate vandalism: please vote!](https://community.openstreetmap.org/t/95523) (2022), Veiviseren: "Seen lot of dirt track being classified as Residential here in Nan."
- [Improvements in Thailand: Reducing the Risks of Armchair Mapping](https://community.openstreetmap.org/t/123857) (2025), julcnx: imports came from Facebook (`highway=track/unclassified`) and Grab (`highway=residential/service`), and local mappers then copied the pattern.

Effect on the stats: these ways count as Untagged and render as Paved, so "Untagged = Paved" is weakest exactly on rural residential roads, where the Malaysia pilot below found no imagery to test it.

Notes for citing: forum posts migrated from the old forum all show 2023-03-08; the dates above are the thread creation dates. Several of the clearest quotes are by julcnx (the author); the independent backing is Grab's own reply and the posts by Russ_McD, AlaskaDave, Bernhard_Hiller and Veiviseren.

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

`surface=unpaved` is 75.4% of all Unpaved km. The wiki page for the value says it "may mean everything from `surface=compacted` to `surface=mud`", and is used for armchair mapping, unknown material, and ways with changing surfaces. The image review confirms it covers everything: of 55 reviewed roads tagged as unpaved, 41 really are unpaved (about half genuinely off-road, half graded roads a normal car can drive), 9 are paved now and 5 are mixed ([examples/images/review.md](examples/images/review.md)).

How much a country relies on the generic value says a lot about how its roads were mapped:

| Share of Unpaved km tagged just `surface=unpaved` | Countries |
|---|---|
| Highest (mostly imagery mapping) | Solomon Islands 96%, Vietnam 93%, Thailand 92%, Guatemala 92%, Malaysia 91%, Madagascar 89%, Mali 89%, Argentina 88% |
| Lowest (specific values: `gravel`, `compacted`, `ground`) | Denmark 9%, Iceland 9%, Romania 11%, Mongolia 13%, Czechia 13%, Iran 33%, Kyrgyzstan 34%, New Zealand 35% |

This is why the map has only two levels (decision 9): `surface=unpaved` honestly means "not paved, condition unknown", and a three-level map would have to guess.

## Official figures and key numbers (2026-11-03)

**Key numbers**: [stats/key-numbers.md](stats/key-numbers.md) is generated by `report.ts` from the results and from [examples/images/review-summary.json](examples/images/review-summary.json). The wiki page, diary and posts should quote figures from there, so they stay consistent when the data is rerun.

**Both bounds in the tables**: the Overview in [stats/report.md](stats/report.md) now shows each class as "all km / tagged km only", and [stats/summary.csv](stats/summary.csv) has a `pct_unpaved_of_tagged` column. The first number is a minimum (untagged roads count as paved); the second is an upper bound under one assumption: mappers tag surface more often when a road is not paved. It is not a hard limit on the real share: the official figures below are above it in 18 of 34 countries, mostly because they count rural roads that OSM maps as tracks or not at all.

**Official figures**: the CIA World Factbook published total, paved and unpaved road km per country until 2025; its Roadways field was removed between 2025-04-10 and 2025-05-15. [stats/official/factbook.py](stats/official/factbook.py) reads the last snapshot with it (github.com/factbook/factbook.json, commit `43907b2cd0`, public domain) into [stats/official/factbook-roadways.json](stats/official/factbook-roadways.json). 34 of our 54 countries have both total and paved km (survey years 2001 to 2024; some countries only give a total).

| Result | Countries |
|---|---|
| Official unpaved share **inside** the OSM range (all km to tagged km) | 15: Papua New Guinea, Bolivia, Kenya, Uganda, Honduras, Laos, Peru, Cuba, Argentina, Senegal, Guatemala, Timor-Leste, Kyrgyzstan, Malaysia, Iran |
| Official share **higher** than even the OSM upper bound | 18, for example DR Congo 98% (OSM 38% / 97%), Mexico 75% (13% / 48%), Sri Lanka 85% (14% / 38%), Cambodia 76% (9% / 52%), Philippines 72% (13% / 40%) |
| Official share lower | 1: New Zealand 34% (OSM 36% / 37%), practically equal |

Conclusion: **OSM-based Unpaved shares are conservative.** Where they differ from official statistics, official figures show more unpaved road, not less. Caveats to state with the numbers: definitions differ (official "unpaved" usually includes rural roads and tracks that OSM may map as `highway=track`, which we leave out; in Thailand this includes unpaved village roads mapped as `track` on purpose, see "Mapping history in Thailand"), survey years are old in some countries (Gabon and Cuba 2001; roads have been paved since, which works against the conclusion), and OSM maps 1 to 10 times more road km than the official inventories (mostly residential and unclassified roads not counted officially). Full table: "Official figures" in [stats/report.md](stats/report.md).

## Findings, two-level model (55 rows, 2026-11-03, figures from the rerun of 2026-11-12)

54 countries plus Antarctica, about 20 million km of road. Full numbers: Overview in [stats/report.md](stats/report.md). Shares below are Unpaved km (with or without the Off-road mark) of all km in the class; "tagged only" divides by km that have a `surface` or `tracktype` (an upper bound, see the two-bounds note in the earlier findings).

1. **`surface=unpaved` is 75.4% of all Unpaved km** (then `ground` 9.9%, `gravel` 5.3%, `dirt` 4.1%, `compacted` 3.5%). This is the data behind decision 9: three quarters of unpaved road says nothing more precise than "unpaved", so a Rough vs Off-road split would mostly be a guess.
2. **The Off-road mark is rare**: about 163,000 km out of 5.3 million Unpaved km (3.1%): `smoothness` 125,000 km, `tracktype` 22,000 (`grade4` and higher only, decision 11), `4wd_only` 16,000, `surface=mud` or `rock` 700. It rewards good tagging (Iceland F-roads, Gabon `4wd_only=recommended`) but is not the headline.
3. **Main roads are unpaved far beyond Africa.** Unpaved share of primary: Gabon 87%, Namibia 66%, DR Congo 65%, Bolivia 58%, Cameroon 54%, Mali 53%, Congo-Brazzaville 46%, Peru 40%, Mongolia 37%, Kyrgyzstan 33%. Of trunk: Gabon 45%, DR Congo 43% (63% of tagged km), Cameroon 28%, Kenya 26%, Bolivia 21%.
4. **Absolute length**: unpaved trunk, primary and secondary km: Brazil 42,100, Namibia 28,600, DR Congo 27,500, Australia 27,000, Peru 20,400, Bolivia 13,700, Cameroon 13,100, South Africa 10,500.
5. **Developed countries have it too**, with very little untagged data, so the numbers are solid (in brackets: the country's untagged share over all classes): Iceland 65% of secondary (7% untagged), Australia 24% of secondary and 82% of unclassified (6% untagged), Chile 47% of tertiary and 87% of unclassified (6%), New Zealand 62% of unclassified (1%), Finland 41% of tertiary (26%), Romania 62% of unclassified (EU member). Baseline: Denmark and Czechia 0% on trunk to tertiary.
6. **Where tagging is weakest, the map looks most paved.** India, Indonesia, Myanmar and Vietnam are 88 to 91% untagged; their low Unpaved shares (tertiary 1 to 10%) say little. Among tagged km only, Myanmar tertiary is 71% unpaved, Indonesia 27%, India 9%.
7. **Tertiary, the class the mockups use**: more than half Unpaved in 18 of 54 countries (Mali 94%, Namibia 90%, Bolivia 90%, Ivory Coast 89%, Senegal 88%, Mongolia 81%, Argentina 80%, Honduras 79%, South Africa 77%, Iceland 76%, Gambia 75%, Cameroon 72%, Brazil 63%, Kenya 59%, Madagascar 58%, DR Congo 57%, Papua New Guinea 55%, Peru 54%).
8. **Motorways**: practically 0% Unpaved: 41 km out of 128,861 km.
9. **Sanity**: Bolivia's Off-road mark (27% of all km) comes from 57,554 km of `smoothness=very_bad`, likely one systematic tagging effort; check before quoting. Conflicts are small: 3,300 km of paved surface with `smoothness` very_bad or worse or `4wd_only` (drawn as Unpaved since decision 12), 2,100 km of paved surface with `tracktype=grade2` or higher (ignored), 3,800 km of `smoothness` excellent or good on unpaved surfaces.
10. **Antarctica**: the South Pole Traverse is mapped as a secondary road (`surface=ice`, `smoothness=very_bad`): Unpaved with the Off-road mark.
11. Re-run failures: Bolivia (in the main loop) and Romania (in a parallel run) failed once, most likely interrupted downloads while two runs shared the connection; both succeeded on retry.

## Open questions

Answers recorded here.

1. **Superseded by decision 9.** Was: `surface=unpaved` stays Off-road (decided 2026-11-02). Under two levels `unpaved` is simply Unpaved; the arguments below still explain why it must not be shown as Paved. Reasons: [Tag:surface=unpaved](https://wiki.openstreetmap.org/wiki/Tag:surface=unpaved) says it may mean anything from `compacted` to `mud`, and it's used for armchair mapping and unknown material, so "a normal car can make it" is not verified. Showing mud as Rough can strand a city car, while showing compacted as Off-road only costs a detour. Mappers can correct it with a specific surface or `smoothness`. Ground truth: in Thailand, `unpaved` is commonly used for roads that really are off-road (Julien's field experience). To check in the Western contrast countries: is `unpaved` used there for roads a city car can drive?
2. Multiple values: split on `;`, worst part decides (agreed).
3. Route 1093: data issue. Under decision 9 it was Paved; since decision 12 (2026-11-12) it is Unpaved with the Off-road mark, and its `smoothness=very_bad` is still listed as a conflict.
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
10. **`wood`, `concrete:lanes` and `grass_paver`** (decided 2026-11-09): Unpaved by default, Paved when `smoothness` is bad or better, since only `very_bad` and worse mean Off-road. All three look very different by region: smooth farm lanes in Europe vs broken strips with a washed-out middle in Thailand; plank bridges vs log or branch bridges; intact vs broken grass pavers. Before this, `wood` was always Paved, `concrete:lanes` and `grass_paver` always Unpaved. The stats were not rerun (the extracts are deleted): recomputed from the combo tables, about 216 km move from Paved to Unpaved (mostly `wood` in Indonesia and Brazil) and 84 km the other way (mostly `concrete:lanes` in Colombia and Indonesia), out of 20 million km in all 55 rows, so no table changes visibly.
11. **`tracktype=grade3` keeps the Off-road mark** (decided 2026-11-10, Julien). `tracktype` is about firmness and lines up with `surface`, but `grade3` (mixed hard and soft material) is considered high-clearance in practice, so the mark from `grade3` to `grade7` stays. Dropping `grade3` was tried the same day and reverted: it would have moved about 34,000 km from Off-road back to plain Unpaved (3.6% of Unpaved km to 2.9%).
   - **Reversed 2026-11-12 (Julien): `grade3` no longer gives the mark, `grade4` to `grade7` do.** Evidence from the combo tables, where mappers also rate `smoothness`: `grade3` roads are very_bad or worse on 59% of rated km, the same as plain `surface=unpaved` (61%), against 73% for `grade4` and 87% for `grade5`; `4wd_only` share 1.5%, 4.3% and 7.1%. The one `grade3` road with clear photos was a graded road (decision 14). About 34,500 km lose the mark: 195,000 to 161,000 km, 3.7% to 3.1% of Unpaved km.
   - Status (2026-11-02): mockups, classifier, Lua and SQL ports, tests, stats and report all updated. Three-level results archived in [stats/archive/3-levels/](stats/archive/3-levels/). All countries to be rerun once (Timor-Leste done). Thailand added to the country list with a fresh Geofabrik download.
12. **Unpaved evidence overrules a paved surface, `tracktype` does not** (decided 2026-11-12). `smoothness` very_bad or worse and `4wd_only` make a road Unpaved whatever the `surface` (reverses the "ignored on Paved roads" part of decision 9). `tracktype` only decides when there is no `surface`: it describes firmness, the same thing as `surface`, and mappers who pave a road update `surface` and leave `tracktype` behind. Edit history of the 45 longest ways of each kind (OSM API, 2026-11-12): with `smoothness` very_bad or worse on a paved surface, 29 are deliberate (both tags set in the same edit, or `smoothness` added after the paved surface) and 16 have a `smoothness` older than the paved surface; with `tracktype=grade3` or higher, 21 are deliberate and 24 older. `4wd_only` is a legal or signed restriction. Both kinds are listed as conflicts in the stats. From the combo tables: about 3,000 km turn Unpaved through `smoothness` or `4wd_only`, and 2,145 km with a paved surface and `tracktype=grade2` or higher stay Paved. Gaia GPS reads these tags the same way: of 31 sampled tertiary, unclassified and residential roads with a paved `surface` (asphalt, sett, cobblestone, paving stones) and `smoothness` very_bad or worse, it draws 30 as tracks, whatever the surface (A0, 2026-11-12). Here the road keeps its class.
13. **`surface=mud` and `rock` give the Off-road mark** (decided 2026-11-12), when `smoothness` and `tracktype` say nothing: about 690 km. `sand` was tried and left out: it would add 21,700 km, mappers who rate sand roads rate them like `ground` or plain `unpaved`, and it depends on the country (very_bad in Mali, mostly `bad` or better and `grade1` or `grade2` in Finland and Argentina). Sand roads that need a 4WD should carry `4wd_only` or `smoothness`.
14. **Photo check of `tracktype=grade3` and of sand and mud** (2026-11-12): of the 20 longest ways marked through `grade3` alone and 11 main roads tagged `sand` or `mud`, only 2 have Mapillary coverage, both `grade3`: Kenya [w34357586](https://www.openstreetmap.org/way/34357586) (soft sand with ruts, mark plausible) and Namibia D2186 [w28157306](https://www.openstreetmap.org/way/28157306) (graded gravel, mark too harsh). Not enough to decide; a sample drawn from ways with coverage is still to do.
15. **Legacy and local values stay unknown** (decided 2026-11-12): `smoothness=robust_wheels` and similar, `tracktype=grade3-5`, and paved local names (`dbst`, `ottaseal`, `Blacktopped`, `tarmac`) are to be fixed in the data, not accepted by the classifier. Unknown `surface` values stay Unpaved: of 4,830 km, about 3,400 km are unpaved names and at most 740 km paved ones.
16. **The results in `stats/results/` predate decisions 12 and 13** (2026-11-12): `report.md`, `summary.csv` and `key-numbers.md` still show the earlier rules until the countries are rerun (`FORCE=1 stats/run-all.sh`). `mark-coverage.md` is current, since it is computed from the combo tables.
