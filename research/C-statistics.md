# C. Classifier and statistics

## Classifier

Model: two base levels, **Paved** and **Unpaved**, plus an optional **Off-road mark** on Unpaved roads only (decision 9, 2026-11-02). The earlier three-level model (Paved / Rough / Off-road) is archived in [stats/archive/3-levels/](stats/archive/3-levels/).

Reference implementation: [classifier/classify.ts](classifier/classify.ts). Ports with the same rules:

- [classifier/classify.lua](classifier/classify.lua): Lua (osm2pgsql flex and similar). `classify(tags)` returns level, base, base source, mark, mark source.
- [classifier/classify.sql](classifier/classify.sql): PostgreSQL functions. `drivability(highway, surface, smoothness, tracktype, 4wd_only)` returns `paved`, `unpaved`, `offroad` or `specialized`.

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

Order (changed 2026-11-02): smallest download first, Western contrast last (Finland, Czechia, France; France chosen over Germany). Biggest downloads: France 4.9 GB, Brazil 2.0 GB, Indonesia 1.7 GB, India 1.6 GB. Added 2026-11-03 to reach 40 countries: Vietnam, Sri Lanka, Ivory Coast, Namibia, and a new group of developed countries with unpaved highways (Chile, New Zealand). Alaska was considered and left out. France was replaced by Denmark (474 MB instead of 4.9 GB) as the Western all-paved baseline: same role, a tenth of the download; Finland and Czechia complete the European contrast. Added 2026-11-03 to fill regional gaps (46 countries): Guatemala and Honduras (Central America), Morocco (North Africa), Kyrgyzstan (Central Asia), Ethiopia (East Africa, laterite survey list), Solomon Islands (Pacific). Antarctica added as a special row, not a country: no border relation, so the whole extract south of 60°S is used. It has 5,700 km mapped as secondary and tertiary roads, almost all `surface=ice` (the South Pole Traverse), an extreme example of a road class that says nothing about drivability. Per continent: Asia 13, Africa 12, Americas 9, Europe 4, Oceania 3.

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
