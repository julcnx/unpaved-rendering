# Findings measured with the three-level model (Paved / Rough / Off-road)

Moved from C-statistics.md on 2026-11-03, when all analysis was updated to two levels plus the Off-road mark. History only. The Unpaved share equals the old Rough + Off-road share.

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

