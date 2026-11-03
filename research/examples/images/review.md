# Street-level image review

Reviewed 2026-11-02 by looking at every downloaded image (contact sheets: `sheets/`, kept locally, not committed because they include Google images).
Images: `mapillary/` (CC BY-SA 4.0: reusable on the wiki with author credit on the File page) and `google/` (copyrighted: for checking only, never upload, not committed). Authors and capture dates: [credits.json](credits.json).

Verdict: does the image match the class the rule gives the road?

| # | Road | Rule says | Images show | Verdict | Best image |
|---|---|---|---|---|---|
| 1 | Congo-Brazzaville P1 (primary) | Off-road (`unpaved`) | Narrow red laterite, deep cuts, erosion gullies across the road | **Good, confirmed**, wiki-usable | `mapillary/cg-w339788648-0.jpg` (Hebrew, 2026) |
| 2 | Mongolia A0503 (primary) | Off-road (`unpaved`) | Several parallel dirt tracks across the steppe, no built road | **Good, confirmed** | `google/mn-w76695032-3.jpg` (2015) |
| 3 | Iceland Kjalvegur 35 (secondary) | Off-road (`4wd_only=yes`) | Rough stony gravel across a highland desert | **Good, confirmed** | `google/is-w620383908-2.jpg` (2024) |
| 4 | Australia Gibb River Road (secondary) | Off-road (`unpaved`) | Corrugated red dirt, loose stones, wide | **Good**, wiki-usable (dashcam date overlay) | `mapillary/au-w313519144-2.jpg` (bob3bob3, 2019) |
| 5 | Papua New Guinea Vanimo-Green River (secondary) | Off-road (`unpaved`) | Rough grey gravel and dirt through rainforest, raw cut banks | **Good**, wiki-usable (360 camera, vehicle bonnet visible) | `mapillary/pg-w844126856-2.jpg` (PNGDOWH, 2025) |
| 6 | Senegal R.06.1 (secondary) | Off-road (`ground`) | Red laterite, dusty, burnt bush, dry season | **Good**. Material is laterite: `surface=laterite` would fit better than `ground` | `google/sn-w305374480-2.jpg` (2021) |
| 7 | Bolivia F4 Puerto Suárez-Puerto Busch (secondary) | Off-road (`unpaved`) | Red dirt road through forest, wet season | **Plausible**, only 2 images, wiki-usable | `mapillary/bo-w55203670-1.jpg` (Danyvd91, 2024) |
| 8 | Ghana R131 (secondary) | Off-road (`unpaved`) | Wide graded laterite, some ruts, rainy season | **Plausible**, borderline Rough when freshly graded | `google/gh-w79123562-5.jpg` (2026) |
| 9 | Senegal R071 (secondary) | Off-road (`unpaved`) | Smooth graded red laterite, dry season | **Borderline**: looks drivable by a normal car when dry. Laterite turns impassable when wet, which supports Off-road | `google/sn-w301425265-0.jpg` (2021) |
| 10 | Ghana IR11 (primary) | Off-road (`unpaved`) | Laterite on 3 points, fresh asphalt on 1 | **Mixed**: part of the way is now paved, the way should be split | |
| 11 | Australia Birdsville Track (secondary) | Off-road (`unpaved`) | Very wide, smooth graded gravel and sand | **Too harsh**: looks Rough in the dry season. `surface=compacted` or `gravel` would be more accurate than `unpaved` | `google/au-w186428588-6.jpg` (2024) |
| 12 | Australia Diamantina Developmental Road | Off-road (`unpaved`) | Wide graded gravel, same as Birdsville | **Too harsh**, same as #11 | |
| 13 | Timor-Leste Lospalos-Malahara (secondary) | Off-road (`unpaved`) | White compacted gravel and narrow paved sections | **Too harsh**: Rough. `surface=compacted` would fit | |
| 14 | Nepal NH66 (primary) | Off-road (`unpaved`) | **Paved asphalt** mountain road (Google 2025) | **Tag out of date** | `google/np-w342736414-2.jpg` |
| 15 | Timor-Leste Viqueque-Baucau (primary) | Off-road (`unpaved`) | **New asphalt** with centre line and barriers (2025) | **Tag out of date** | `mapillary/tl-w40678552-3.jpg` (kahbeng, 2025) |

## Second round (Mapillary only, no Google images)

Screening of 198 more candidates (top 15 Off-road major roads per country, 4 points each): 60 have some coverage. 14 were picked for a Mapillary-only download (free, CC BY-SA 4.0).

| # | Road | Rule says | Images show | Verdict | Best image |
|---|---|---|---|---|---|
| 16 | Congo-Brazzaville P45 ([w338830884](https://www.openstreetmap.org/way/338830884), secondary) | Off-road (`ground`) | Narrow red laterite through rainforest | **Good, confirmed** (laterite tagged `ground`) | `mapillary/cg-w338830884-*.jpg` |
| 17 | Congo-Brazzaville ([w594633876](https://www.openstreetmap.org/way/594633876), primary) | Off-road (`unpaved`) | Red laterite in forest, muddy puddles, rain | **Good, confirmed** | `mapillary/cg-w594633876-*.jpg` |
| 18 | Gambia ([w376175462](https://www.openstreetmap.org/way/376175462), secondary) | Off-road (`unpaved`) | Dusty red laterite, baobabs, dry-season haze | **Good, confirmed** | `mapillary/gm-w376175462-*.jpg` |
| 19 | Timor-Leste Umaboco-Viqueque ([w550548492](https://www.openstreetmap.org/way/550548492), primary) | Off-road (`unpaved`) | Stony gravel, muddy potholes, wet season | **Good, confirmed** | `mapillary/tl-w550548492-*.jpg` |
| 20 | Iceland F208 ([w620397373](https://www.openstreetmap.org/way/620397373), secondary) | Off-road (`4wd_only=yes`) | Gravel track through highland valley, rain | **Good, confirmed** (dark images) | `mapillary/is-w620397373-*.jpg` |
| 21 | Bolivia F34 ([w122604957](https://www.openstreetmap.org/way/122604957), secondary) | Off-road (`ground`) | Red sandy dirt road through scrub | **Good**, 1 image | `mapillary/bo-w122604957-*.jpg` |
| 22 | Senegal R.05.0 ([w220163316](https://www.openstreetmap.org/way/220163316), secondary) | Off-road (`unpaved`) | Dusty dirt road, dry season | **Plausible**, 1 image | |
| 23 | Timor-Leste Loti-Betano ([w150773592](https://www.openstreetmap.org/way/150773592), primary) | Off-road (`unpaved`) | Dirt, broken stone paving, compacted sections | **Plausible**, mixed surface | |
| 24 | Ghana Offuman-Wenchi ([w240464670](https://www.openstreetmap.org/way/240464670), secondary) | Off-road (`unpaved`) | Red dirt at a village edge | **Plausible**, 1 image | |
| 25 | Laos 4508 ([w27336563](https://www.openstreetmap.org/way/27336563), secondary) | Off-road (`unpaved`) | Smooth compacted gravel (from a motorbike) | **Too harsh**: Rough, `compacted` would fit | |
| 26 | Timor-Leste Baucau-Lautém ([w40628148](https://www.openstreetmap.org/way/40628148), primary) | Off-road (`unpaved`) | **New asphalt**, centre line, barriers (2025) | **Tag out of date** | |
| 27 | Mongolia Тамын ([w1449651789](https://www.openstreetmap.org/way/1449651789), trunk) | Off-road (`ground`) | **Asphalt with potholes** across the steppe (2024) | **Tag wrong**: paved, `smoothness=bad` would fit (Rough) | |
| 28 | Papua New Guinea Baiyer Road ([w841361566](https://www.openstreetmap.org/way/841361566), secondary) | Off-road (`dirt`) | **Asphalt** with centre line (2023) | **Tag out of date** | |
| 29 | Myanmar Moe Pyin-Mat Man ([w377792665](https://www.openstreetmap.org/way/377792665), secondary) | Off-road (`ground`) | **Concrete** road (2022) | **Tag out of date** | |

## Third round: late-added countries (2026-11-03, Mapillary only)

Screening of 304 more roads (top 15 Unpaved major roads per late-added country, 4 points each, `GOOGLE=0`): 57 have Mapillary coverage. 26 were picked (best coverage, up to 2 per country) and downloaded. No coverage on unpaved major roads: Sri Lanka, Honduras, Albania, Iran, Solomon Islands, Antarctica, Denmark, Czechia. Review sheets: `sheets/review-round3/` (local only).

Under the two-level model the question is only: is the road really Unpaved?

| # | Road | Tags | Images show | Verdict |
|---|---|---|---|---|
| 30 | Ivory Coast ([w37793428](https://www.openstreetmap.org/way/37793428)) | secondary, `ground` | Red laterite through villages and forest | **Unpaved, confirmed** (laterite tagged `ground`) |
| 31 | Ivory Coast B303 ([w489172575](https://www.openstreetmap.org/way/489172575)) | secondary, `unpaved` | Narrow red laterite with ruts in forest | **Unpaved, confirmed**, off-road-like (no mark: no evidence tags) |
| 32 | Chile 243 ([w339066661](https://www.openstreetmap.org/way/339066661)) | secondary, `fine_gravel` | Graded gravel through hills | **Unpaved, confirmed**, car-drivable |
| 33 | Chile A-97-B ([w28319080](https://www.openstreetmap.org/way/28319080)) | secondary, `compacted` | Wide dusty gravel on the altiplano (4,400 m) | **Unpaved, confirmed**, car-drivable |
| 34 | Ethiopia ([w113114612](https://www.openstreetmap.org/way/113114612)) | secondary, `unpaved` | Laterite in one image, new gravel or seal in others | **Mixed**: road under improvement |
| 35 | Finland 522 ([w113796504](https://www.openstreetmap.org/way/113796504)) | secondary, `compacted` | Smooth gravel forest road | **Unpaved, confirmed**, car-drivable (Western example) |
| 36 | Finland 522 ([w22733235](https://www.openstreetmap.org/way/22733235)) | secondary, `compacted` | **Asphalt** | **Tag out of date**: paved now |
| 37 | Georgia Sh1 ([w111431030](https://www.openstreetmap.org/way/111431030)) | primary, `gravel` | Rough gravel mountain road | **Unpaved, confirmed** |
| 38 | Georgia Sh10 ([w81287807](https://www.openstreetmap.org/way/81287807)) | secondary, `gravel` | Stony track with deep puddles | **Unpaved, confirmed**, off-road-like (no mark) |
| 39 | Guatemala RD PET-06 ([w293378392](https://www.openstreetmap.org/way/293378392)) | secondary, `unpaved` | White compacted gravel through villages | **Unpaved, confirmed** |
| 40 | Kyrgyzstan M-067 ([w1422780378](https://www.openstreetmap.org/way/1422780378)) | secondary, `gravel` | Gravel highway in a mountain valley | **Unpaved, confirmed** |
| 41 | Morocco RN23 ([w475929890](https://www.openstreetmap.org/way/475929890)) | primary, `gravel` | Gravel mountain road, works in progress | **Unpaved, confirmed** |
| 42 | Morocco RR704 ([w827183138](https://www.openstreetmap.org/way/827183138)) | secondary, `unpaved` | Rocky desert track (cyclist) | **Unpaved, confirmed**, off-road-like (no mark) |
| 43 | Mali RR15 ([w41268427](https://www.openstreetmap.org/way/41268427)) | secondary, `unpaved` | Rough red dirt road | **Unpaved, confirmed** |
| 44 | Mali RR13 ([w41268399](https://www.openstreetmap.org/way/41268399)) | secondary, `compacted` | Wide red laterite road | **Unpaved, confirmed** |
| 45 | Mexico QR 15 ([w41680341](https://www.openstreetmap.org/way/41680341)) | secondary, `unpaved` | White sand and limestone track in jungle, wet, 4x4 vehicle | **Unpaved, confirmed**, off-road-like (no mark) |
| 46 | Namibia C15/M33 ([w22726347](https://www.openstreetmap.org/way/22726347)) | primary, `unpaved` | Wide graded gravel; Roadroid roughness survey images show 50 to 89 km/h | **Unpaved, confirmed**, car-drivable |
| 47 | Namibia C39 ([w240603923](https://www.openstreetmap.org/way/240603923)) | primary, `dirt` | Wide graded gravel | **Unpaved, confirmed**, car-drivable |
| 48 | New Zealand Purerua Road ([w164770191](https://www.openstreetmap.org/way/164770191)) | secondary, `gravel` | **Sealed** (dark chipseal or asphalt) | **Tag out of date**: paved now |
| 49 | New Zealand Waikaremoana Road ([w229002044](https://www.openstreetmap.org/way/229002044)) | secondary, `unpaved` | Gravel road through bush (motorbike) | **Unpaved, confirmed** |
| 50 | Oman ([w241714242](https://www.openstreetmap.org/way/241714242)) | secondary, `unpaved` | Graded gravel desert road | **Unpaved, confirmed**, car-drivable |
| 51 | Romania DJ131A ([w342739997](https://www.openstreetmap.org/way/342739997)) | secondary, `gravel` | Gravel road through forest | **Unpaved, confirmed** (EU member) |
| 52 | Uganda ([w27567283](https://www.openstreetmap.org/way/27567283)) | secondary, `unpaved` | Wide red laterite through villages | **Unpaved, confirmed** |
| 53 | Uganda Akokoro Road ([w518566598](https://www.openstreetmap.org/way/518566598)) | secondary, `unpaved` | **Fresh asphalt** | **Tag out of date**: paved now |
| 54 | Vietnam QL.14D ([w1265032009](https://www.openstreetmap.org/way/1265032009)) | trunk, `gravel` | Broken concrete or asphalt with mud patches | **Mixed**: degraded pavement, not gravel |
| 55 | Vietnam Bùi Thị Xuân ([w291750523](https://www.openstreetmap.org/way/291750523)) | secondary, `compacted` | Dirt and gravel in an industrial area, patches of pavement | **Mixed** |

Summary: **20 of 26 confirm Unpaved**, 3 are paved now but still tagged unpaved or gravel (Finland 522, New Zealand Purerua Road, Uganda Akokoro Road), 3 are mixed (Ethiopia, two in Vietnam). 8 of the confirmed roads are graded and clearly car-drivable (Chile, Finland, Namibia, Oman): good evidence for the "Unpaved" label rather than "Off-road". 4 look off-road (Ivory Coast B303, Georgia Sh10, Morocco RR704, Mexico QR 15) but get no mark because nothing tags `smoothness` or `4wd_only` on them: examples of where better tagging would show on the map.

## What the images tell us

Totals over both rounds (29 roads): **13 confirm Off-road** (1 to 7, 16 to 21), 5 plausible or borderline (8, 9, 22 to 24), 5 too harsh (graded or compacted roads tagged `unpaved`: 10 to 13, 25), **6 are paved now but tagged unpaved, dirt or ground** (14, 15, 26 to 29).

1. **The Off-road class is confirmed on 13 roads in 9 countries.** First round: 7 of 15 (1 to 7), 2 borderline (8, 9).
2. **4 of 15 are `unpaved` on graded roads that look Rough** (11, 12, 13, partly 10). The rule works as designed: `unpaved` says nothing precise, so the road is shown as Off-road until someone tags `compacted`, `gravel` or `smoothness`. These are good examples of "honest rendering gives mappers a reason to fix tags", and a fair point for critics.
3. **6 of 29 roads are paved now but still tagged `unpaved`, `dirt` or `ground`** (14, 15, 26 to 29), in Nepal, Timor-Leste, Mongolia, Papua New Guinea and Myanmar. Caution: roads with street-level imagery are often the more important, recently improved ones, so this share is probably higher than across the whole network. Supports "the developing world is paving fast" and the Kenya survey reply about recency. Any rendering based on surface needs fresh data, and these are easy wins for mappers.
4. Senegal R.06.1 is a clear laterite road tagged `ground`: a direct link to the `surface=laterite` work.

## For the wiki

Wiki-usable (Mapillary, CC BY-SA 4.0, credit the author on the File page): #16 and #17 Congo-Brazzaville, #18 Gambia, #19 Timor-Leste Umaboco-Viqueque, #20 Iceland F208, #21 Bolivia F34, #1 Congo-Brazzaville P1, #4 Gibb River Road, #5 Papua New Guinea, #7 Bolivia, #15 Timor-Leste (as "tag out of date"). Google images (#2, #3, #6, #8, #9, #11, #14) can only be linked, not uploaded.
