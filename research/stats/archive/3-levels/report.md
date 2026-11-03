# Road drivability statistics

## Overview

Share of km that is Rough or Off-road per class, sorted by tertiary. Untagged: share of all road km.

| Country | Data | Trunk R+O | Primary R+O | Secondary R+O | Tertiary R+O | Unclassified R+O | Untagged | km |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Bolivia | 2026-11-01 | 24% | 58% | 75% | 91% | 96% | 9.6% | 218,843 |
| Senegal | 2026-11-01 | 2% | 9% | 67% | 88% | 72% | 29.5% | 113,498 |
| Mongolia | 2026-11-01 | 3% | 35% | 60% | 81% | 68% | 27.6% | 113,512 |
| Gambia | 2026-11-01 | 8% | 18% | 48% | 76% | 39% | 60.7% | 14,814 |
| Iceland | 2026-11-01 | 0% | 9% | 65% | 76% | 73% | 7.2% | 17,665 |
| Papua New Guinea | 2026-11-01 | 0% | 11% | 24% | 55% | 58% | 43.9% | 49,577 |
| Gabon | 2026-11-01 | 44% | 80% | 77% | 55% | 65% | 26.9% | 18,635 |
| Laos | 2026-11-01 | 12% | 24% | 28% | 51% | 53% | 48.2% | 61,549 |
| Ghana | 2026-11-01 | 8% | 18% | 26% | 43% | 37% | 68.7% | 133,499 |
| Congo-Brazzaville | 2026-11-01 | 14% | 46% | 31% | 35% | 36% | 70.2% | 33,915 |
| Timor-Leste | 2026-11-01 | 0% | 18% | 23% | 27% | 26% | 71.6% | 9,492 |
| Cuba | 2026-11-01 | 0% | 5% | 2% | 23% | 70% | 49.6% | 65,592 |
| Nepal | 2026-11-01 | 1% | 9% | 13% | 22% | 16% | 81.0% | 128,606 |
| Cambodia | 2026-11-01 | 5% | 2% | 8% | 18% | 13% | 82.5% | 100,695 |
| Myanmar | 2026-11-01 | 9% | 4% | 8% | 9% | 6% | 91.2% | 339,127 |
| Thailand | 2026-10-30 | 0% | 0% | 1% | 4% | 22% | 67.6% | 660,170 |
| French Guiana | 2026-11-01 | - | 0% | 9% | 1% | 38% | 34.2% | 2,498 |

## Bolivia (bo), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `bolivia-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 22 | 100.0% | 0.0% | 0.0% | 0.0% |
| trunk | 13,674 | 75.0% | 0.7% | 9.5% | 14.9% |
| primary | 4,035 | 38.9% | 3.0% | 16.4% | 41.7% |
| secondary | 11,627 | 20.4% | 4.6% | 14.9% | 60.2% |
| tertiary | 30,731 | 5.7% | 3.7% | 12.9% | 77.6% |
| unclassified | 113,468 | 0.1% | 4.3% | 3.1% | 92.5% |
| residential | 45,286 | 10.7% | 31.7% | 1.7% | 55.8% |
| **All** | 218,843 | 9.6% | 9.6% | 5.5% | 75.3% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 100.0% | 99.1% | 0.0% | 0.0% |
| trunk | 99.3% | 12.1% | 0.6% | 0.0% |
| primary | 97.0% | 16.6% | 1.6% | 0.0% |
| secondary | 95.4% | 31.3% | 1.8% | 0.0% |
| tertiary | 96.2% | 44.3% | 1.2% | 0.0% |
| unclassified | 95.3% | 42.1% | 5.8% | 0.0% |
| residential | 67.9% | 1.6% | 1.8% | 0.0% |
| **All** | 90.1% | 31.1% | 3.7% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.9% | 99.1% | 0.0% | 0.0% | 0.0% |
| trunk | 86.7% | 12.1% | 0.6% | 0.0% | 0.7% |
| primary | 80.4% | 16.6% | 0.0% | 0.0% | 3.0% |
| secondary | 63.0% | 31.1% | 1.4% | 0.0% | 4.6% |
| tertiary | 51.4% | 44.1% | 0.8% | 0.0% | 3.7% |
| unclassified | 49.5% | 42.1% | 4.2% | 0.0% | 4.3% |
| residential | 65.1% | 1.6% | 1.6% | 0.0% | 31.7% |
| **All** | 56.6% | 31.1% | 2.7% | 0.0% | 9.6% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 798, `surface=compacted` 436, `surface=gravel` 31 | `surface=unpaved` 1,649, `smoothness=very_bad` 260, `tracktype=grade4` 76 |
| primary | `surface=compacted` 376, `smoothness=bad` 244, `surface=unhewn_cobblestone` 18 | `surface=unpaved` 1,125, `smoothness=very_bad` 373, `surface=ground` 183 |
| secondary | `smoothness=bad` 1,270, `surface=compacted` 302, `surface=unhewn_cobblestone` 59 | `surface=unpaved` 3,886, `smoothness=very_bad` 2,200, `surface=ground` 647 |
| tertiary | `smoothness=bad` 3,141, `surface=compacted` 505, `surface=gravel` 131 | `smoothness=very_bad` 9,974, `surface=unpaved` 9,864, `surface=ground` 3,192 |
| unclassified | `smoothness=bad` 2,476, `tracktype=grade2` 551, `surface=compacted` 439 | `smoothness=very_bad` 44,181, `surface=unpaved` 33,717, `surface=ground` 21,502 |
| residential | `surface=compacted` 232, `smoothness=bad` 160, `tracktype=grade2` 140 | `surface=unpaved` 19,785, `surface=ground` 4,210, `tracktype=grade3` 538 |
| **All** | `smoothness=bad` 8,089, `surface=compacted` 2,289, `tracktype=grade2` 761 | `surface=unpaved` 70,026, `smoothness=very_bad` 57,410, `surface=ground` 29,773 |

All Paved values: `surface=asphalt` 11,090, `surface=paved` 4,524, `surface=concrete` 2,142, `surface=concrete:plates` 1,119, `surface=paving_stones` 742, `smoothness=good` 709, `surface=cobblestone` 355, `surface=sett` 102

### Unknown values (typos, local values): `smoothness=robust_wheels` 68, `smoothness=very_good` 13, `smoothness=nad` 9, `smoothness=vety_bad` 7, `smoothness=very_back` 5, `smoothness=ver_bad` 3, `smoothness=very_band` 2, `surface=artificial_turf` 2, `smoothness=futina` 1, `surface=dirt/sand` 1, `surface=sin_pavimentar_(_proceso)_(calle_principal_)` 1, `surface=stone` 1

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 113, `smoothness=very_bad + surface=concrete` 18, `smoothness=good + surface=ground` 11, `smoothness=very_bad + surface=cobblestone` 9, `smoothness=very_bad + surface=paved` 5, `smoothness=good + surface=unpaved` 2, `smoothness=horrible + surface=concrete` 0, `smoothness=very_bad + surface=paving_stones` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w455824340](https://www.openstreetmap.org/way/455824340) trunk, 107.6 km, **offroad** by smoothness: `ref=F39` `surface=ground` `smoothness=very_bad`
- [w315713950](https://www.openstreetmap.org/way/315713950) secondary, 107 km, **offroad** by smoothness: `surface=ground` `smoothness=very_bad`
- [w55203670](https://www.openstreetmap.org/way/55203670) secondary, 104.7 km, **offroad** by surface: `ref=F4` `surface=unpaved`
- [w220365490](https://www.openstreetmap.org/way/220365490) secondary, 90.8 km, **offroad** by surface: `ref=F65` `surface=unpaved`
- [w122604957](https://www.openstreetmap.org/way/122604957) secondary, 82.7 km, **offroad** by surface: `ref=F34` `surface=ground`
- [w409406953](https://www.openstreetmap.org/way/409406953) secondary, 79.4 km, **offroad** by surface: `surface=unpaved`
- [w574542011](https://www.openstreetmap.org/way/574542011) primary, 77.8 km, **offroad** by smoothness: `ref=F6` `surface=ground` `smoothness=very_bad`
- [w312032672](https://www.openstreetmap.org/way/312032672) secondary, 75.1 km, **offroad** by surface: `ref=F9` `surface=unpaved`
- [w638977013](https://www.openstreetmap.org/way/638977013) trunk, 75 km, **offroad** by smoothness: `ref=F10` `surface=ground` `smoothness=very_bad`
- [w187079525](https://www.openstreetmap.org/way/187079525) secondary, 65.7 km, **offroad** by smoothness: `surface=unpaved` `smoothness=very_bad`

### Longest smoothness vs surface conflicts

- [w168814232](https://www.openstreetmap.org/way/168814232) secondary, 38.8 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w29049249](https://www.openstreetmap.org/way/29049249) tertiary, 24.9 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w282947981](https://www.openstreetmap.org/way/282947981) secondary, 12.8 km, **offroad** by smoothness: `ref=F47` `surface=asphalt` `smoothness=very_bad`
- [w216939572](https://www.openstreetmap.org/way/216939572) secondary, 11.4 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w282947968](https://www.openstreetmap.org/way/282947968) secondary, 9.7 km, **offroad** by smoothness: `ref=F47` `surface=asphalt` `smoothness=very_bad`
- [w306827570](https://www.openstreetmap.org/way/306827570) unclassified, 9.3 km, **paved** by smoothness: `surface=ground` `smoothness=good`
- [w794999526](https://www.openstreetmap.org/way/794999526) tertiary, 8.5 km, **offroad** by smoothness: `ref=D4201` `surface=cobblestone` `smoothness=very_bad`
- [w384801120](https://www.openstreetmap.org/way/384801120) secondary, 4.6 km, **offroad** by smoothness: `ref=F47` `surface=asphalt` `smoothness=very_bad`
- [w128184269](https://www.openstreetmap.org/way/128184269) tertiary, 4.1 km, **offroad** by smoothness: `surface=paved` `smoothness=very_bad`
- [w417141452](https://www.openstreetmap.org/way/417141452) tertiary, 3.6 km, **offroad** by smoothness: `surface=concrete` `smoothness=very_bad`

### Longest ways with unknown values

- [w251911258](https://www.openstreetmap.org/way/251911258) tertiary, 40.2 km, **offroad** by surface: `surface=unpaved` `smoothness=robust_wheels`
- [w170097790](https://www.openstreetmap.org/way/170097790) tertiary, 8.8 km, **offroad** by surface: `surface=ground` `smoothness=nad`
- [w522645101](https://www.openstreetmap.org/way/522645101) secondary, 7.6 km, **offroad** by surface: `ref=F62` `surface=unpaved` `smoothness=very_good`
- [w280440789](https://www.openstreetmap.org/way/280440789) unclassified, 6.4 km, **offroad** by surface: `surface=unpaved` `smoothness=robust_wheels`
- [w280440783](https://www.openstreetmap.org/way/280440783) tertiary, 6.1 km, **offroad** by surface: `surface=unpaved` `smoothness=robust_wheels`
- [w337108681](https://www.openstreetmap.org/way/337108681) unclassified, 5.8 km, **offroad** by surface: `surface=ground` `smoothness=vety_bad`
- [w641686240](https://www.openstreetmap.org/way/641686240) unclassified, 5.2 km, **offroad** by surface: `surface=ground` `smoothness=very_back`
- [w1238511686](https://www.openstreetmap.org/way/1238511686) trunk, 4.7 km, **offroad** by surface: `ref=F35` `surface=unpaved` `smoothness=robust_wheels`
- [w183132307](https://www.openstreetmap.org/way/183132307) secondary, 4.6 km, **rough** by surface: `surface=gravel` `smoothness=robust_wheels`
- [w498896094](https://www.openstreetmap.org/way/498896094) secondary, 4.4 km, **offroad** by surface: `ref=F62` `surface=unpaved` `smoothness=very_good`

## Congo-Brazzaville (cg), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `congo-brazzaville-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 2,189 | 45.6% | 40.4% | 2.4% | 11.6% |
| primary | 817 | 31.4% | 22.7% | 1.1% | 44.7% |
| secondary | 2,610 | 18.1% | 51.0% | 7.6% | 23.2% |
| tertiary | 6,367 | 3.3% | 61.3% | 2.5% | 32.9% |
| unclassified | 10,534 | 0.8% | 63.7% | 0.6% | 34.9% |
| residential | 11,398 | 0.7% | 94.7% | 0.1% | 4.5% |
| **All** | 33,915 | 6.2% | 70.2% | 1.4% | 22.2% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 59.6% | 5.5% | 0.0% | 0.0% |
| primary | 77.3% | 0.1% | 0.0% | 0.0% |
| secondary | 48.5% | 3.9% | 0.0% | 0.0% |
| tertiary | 38.7% | 0.1% | 0.0% | 0.0% |
| unclassified | 36.1% | 0.2% | 0.3% | 0.0% |
| residential | 5.2% | 0.1% | 0.0% | 0.0% |
| **All** | 29.6% | 0.8% | 0.1% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 54.1% | 5.5% | 0.0% | 0.0% | 40.4% |
| primary | 77.2% | 0.1% | 0.0% | 0.0% | 22.7% |
| secondary | 45.1% | 3.9% | 0.0% | 0.0% | 51.0% |
| tertiary | 38.6% | 0.1% | 0.0% | 0.0% | 61.3% |
| unclassified | 35.8% | 0.2% | 0.3% | 0.0% | 63.7% |
| residential | 5.1% | 0.1% | 0.0% | 0.0% | 94.7% |
| **All** | 28.9% | 0.8% | 0.1% | 0.0% | 70.2% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 53 | `surface=unpaved` 154, `surface=sand` 55, `smoothness=very_horrible` 20 |
| primary | `surface=gravel` 9, `smoothness=bad` 1 | `surface=unpaved` 361, `surface=ground` 4, `smoothness=horrible` 0 |
| secondary | `surface=gravel` 101, `smoothness=bad` 98 | `surface=unpaved` 464, `surface=ground` 134, `surface=sand` 8 |
| tertiary | `surface=gravel` 156, `smoothness=intermediate` 1, `smoothness=bad` 0 | `surface=unpaved` 1,235, `surface=ground` 770, `surface=sand` 74 |
| unclassified | `surface=gravel` 60, `smoothness=bad` 1, `surface=compacted` 0 | `surface=unpaved` 2,468, `surface=ground` 1,030, `surface=sand` 118 |
| residential | `smoothness=bad` 4, `surface=gravel` 1, `surface=compacted` 1 | `surface=sand` 210, `surface=unpaved` 186, `surface=ground` 100 |
| **All** | `surface=gravel` 326, `smoothness=bad` 157, `surface=compacted` 1 | `surface=unpaved` 4,868, `surface=ground` 2,045, `surface=sand` 465 |

All Paved values: `surface=asphalt` 1,861, `surface=paved` 195, `smoothness=good` 30, `surface=paving_stones` 6, `smoothness=excellent` 4, `surface=concrete` 2, `surface=sett` 2, `surface=wood` 0

### Unknown values (typos, local values): none

### Smoothness vs surface conflicts (km): none

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w300235810](https://www.openstreetmap.org/way/300235810) secondary, 101.8 km, **offroad** by surface: `surface=unpaved`
- [w339788648](https://www.openstreetmap.org/way/339788648) primary, 46.9 km, **offroad** by surface: `ref=P1` `surface=unpaved`
- [w296090511](https://www.openstreetmap.org/way/296090511) secondary, 45.5 km, **offroad** by surface: `surface=unpaved`
- [w194557644](https://www.openstreetmap.org/way/194557644) secondary, 44.6 km, **offroad** by surface: `surface=unpaved`
- [w246850727](https://www.openstreetmap.org/way/246850727) secondary, 43.9 km, **offroad** by surface: `ref=P45` `surface=ground`
- [w322119531](https://www.openstreetmap.org/way/322119531) trunk, 43 km, **offroad** by surface: `ref=RN 3` `surface=unpaved`
- [w338830884](https://www.openstreetmap.org/way/338830884) secondary, 40.9 km, **offroad** by surface: `ref=P45` `surface=ground`
- [w282527445](https://www.openstreetmap.org/way/282527445) secondary, 37.7 km, **offroad** by surface: `surface=unpaved`
- [w1516247513](https://www.openstreetmap.org/way/1516247513) secondary, 33.8 km, **offroad** by surface: `surface=unpaved`
- [w93187937](https://www.openstreetmap.org/way/93187937) secondary, 26.5 km, **offroad** by surface: `ref=P45` `surface=unpaved`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

None of 0.5 km or more.

## Cuba (cu), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `cuba-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 1,054 | 43.8% | 56.2% | 0.0% | 0.0% |
| trunk | 1,656 | 40.1% | 59.8% | 0.1% | 0.0% |
| primary | 3,284 | 38.3% | 57.1% | 4.6% | 0.0% |
| secondary | 6,268 | 27.0% | 70.5% | 1.6% | 0.9% |
| tertiary | 8,475 | 39.0% | 38.0% | 11.5% | 11.5% |
| unclassified | 24,169 | 6.5% | 23.1% | 22.3% | 48.1% |
| residential | 20,687 | 8.6% | 76.6% | 1.7% | 13.0% |
| **All** | 65,592 | 16.4% | 49.6% | 10.6% | 23.4% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 43.8% | 0.0% | 0.0% | 0.0% |
| trunk | 40.2% | 0.8% | 0.0% | 0.0% |
| primary | 40.9% | 7.5% | 0.0% | 0.0% |
| secondary | 29.2% | 3.4% | 0.0% | 0.0% |
| tertiary | 61.3% | 3.7% | 0.8% | 0.0% |
| unclassified | 71.2% | 1.3% | 23.6% | 0.0% |
| residential | 22.6% | 1.0% | 1.1% | 0.0% |
| **All** | 47.8% | 2.0% | 9.1% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 43.8% | 0.0% | 0.0% | 0.0% | 56.2% |
| trunk | 39.4% | 0.8% | 0.0% | 0.0% | 59.8% |
| primary | 35.4% | 7.5% | 0.0% | 0.0% | 57.1% |
| secondary | 26.0% | 3.4% | 0.0% | 0.0% | 70.5% |
| tertiary | 57.5% | 3.7% | 0.8% | 0.0% | 38.0% |
| unclassified | 52.3% | 1.3% | 23.3% | 0.0% | 23.1% |
| residential | 21.3% | 1.0% | 1.1% | 0.0% | 76.6% |
| **All** | 39.4% | 2.0% | 9.0% | 0.0% | 49.6% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=intermediate` 1, `surface=gravel` 0 | none |
| primary | `smoothness=bad` 111, `smoothness=intermediate` 40 | `surface=unpaved` 0 |
| secondary | `surface=gravel` 53, `smoothness=intermediate` 28, `smoothness=bad` 19 | `smoothness=very_bad` 45, `surface=unpaved` 4, `surface=sand` 2 |
| tertiary | `surface=compacted` 571, `smoothness=bad` 193, `surface=gravel` 122 | `surface=unpaved` 870, `smoothness=very_bad` 40, `surface=ground` 32 |
| unclassified | `tracktype=grade2` 4,312, `surface=compacted` 681, `smoothness=bad` 210 | `surface=unpaved` 10,366, `tracktype=grade4` 552, `tracktype=grade3` 302 |
| residential | `tracktype=grade2` 153, `surface=compacted` 77, `smoothness=bad` 61 | `surface=unpaved` 2,453, `surface=ground` 86, `surface=dirt` 49 |
| **All** | `tracktype=grade2` 4,535, `surface=compacted` 1,331, `smoothness=bad` 594 | `surface=unpaved` 13,693, `tracktype=grade4` 582, `tracktype=grade3` 337 |

All Paved values: `surface=asphalt` 9,389, `tracktype=grade1` 472, `surface=paved` 321, `smoothness=good` 311, `surface=concrete` 160, `smoothness=excellent` 67, `surface=cobblestone` 10, `surface=concrete:plates` 10

### Unknown values (typos, local values): `surface=afalto` 1, `surface=rocky` 0, `surface=steel` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 27, `smoothness=good + surface=unpaved` 3, `smoothness=horrible + surface=asphalt` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w305160228](https://www.openstreetmap.org/way/305160228) secondary, 8.9 km, **offroad** by smoothness: `ref=5-166` `surface=compacted` `smoothness=very_bad`
- [w195857725](https://www.openstreetmap.org/way/195857725) secondary, 7.2 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w633460521](https://www.openstreetmap.org/way/633460521) secondary, 5.9 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=ground` `smoothness=very_bad`
- [w505428871](https://www.openstreetmap.org/way/505428871) secondary, 5.6 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=ground` `smoothness=very_bad`
- [w39824801](https://www.openstreetmap.org/way/39824801) secondary, 5 km, **offroad** by smoothness: `ref=CS` `surface=asphalt` `smoothness=very_bad`
- [w235498838](https://www.openstreetmap.org/way/235498838) secondary, 4.4 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w1193879119](https://www.openstreetmap.org/way/1193879119) secondary, 2.5 km, **offroad** by smoothness: `ref=5-166` `smoothness=very_bad`
- [w807879816](https://www.openstreetmap.org/way/807879816) secondary, 2.3 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w633665109](https://www.openstreetmap.org/way/633665109) secondary, 2.2 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=ground` `smoothness=very_bad`
- [w756566014](https://www.openstreetmap.org/way/756566014) secondary, 2 km, **offroad** by surface: `surface=sand`

### Longest smoothness vs surface conflicts

- [w195857725](https://www.openstreetmap.org/way/195857725) secondary, 7.2 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w39824801](https://www.openstreetmap.org/way/39824801) secondary, 5 km, **offroad** by smoothness: `ref=CS` `surface=asphalt` `smoothness=very_bad`
- [w235498838](https://www.openstreetmap.org/way/235498838) secondary, 4.4 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w234954647](https://www.openstreetmap.org/way/234954647) tertiary, 2.8 km, **paved** by smoothness: `surface=unpaved` `smoothness=good`
- [w807879816](https://www.openstreetmap.org/way/807879816) secondary, 2.3 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w842211142](https://www.openstreetmap.org/way/842211142) unclassified, 1.2 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w633665098](https://www.openstreetmap.org/way/633665098) secondary, 1.1 km, **offroad** by smoothness: `ref=CN;1-I-3` `surface=asphalt` `smoothness=very_bad`
- [w807879724](https://www.openstreetmap.org/way/807879724) tertiary, 1.1 km, **offroad** by smoothness: `ref=6-401` `surface=asphalt` `smoothness=very_bad`
- [w476205940](https://www.openstreetmap.org/way/476205940) unclassified, 0.9 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w320099072](https://www.openstreetmap.org/way/320099072) residential, 0.8 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`

### Longest ways with unknown values

- [w118276862](https://www.openstreetmap.org/way/118276862) tertiary, 0.6 km, **offroad** by surface: `surface=afalto`

## Gabon (ga), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `gabon-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 3,555 | 54.2% | 1.9% | 17.7% | 26.3% |
| primary | 2,130 | 19.4% | 0.7% | 39.2% | 40.7% |
| secondary | 1,344 | 20.7% | 2.1% | 25.0% | 52.2% |
| tertiary | 972 | 26.0% | 19.5% | 8.8% | 45.7% |
| unclassified | 7,666 | 4.5% | 30.3% | 3.6% | 61.6% |
| residential | 2,968 | 6.2% | 80.3% | 5.4% | 8.1% |
| **All** | 18,635 | 18.2% | 26.9% | 12.5% | 42.4% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 98.1% | 54.2% | 0.0% | 3.3% |
| primary | 99.3% | 71.4% | 6.4% | 17.6% |
| secondary | 97.9% | 61.6% | 8.1% | 28.6% |
| tertiary | 80.4% | 17.2% | 1.8% | 3.9% |
| unclassified | 69.3% | 9.9% | 5.2% | 8.6% |
| residential | 19.6% | 8.5% | 0.0% | 0.1% |
| **All** | 73.0% | 29.3% | 3.5% | 8.4% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 43.9% | 51.8% | 0.0% | 2.4% | 1.9% |
| primary | 27.6% | 59.0% | 0.4% | 12.3% | 0.7% |
| secondary | 33.0% | 59.3% | 3.3% | 2.3% | 2.1% |
| tertiary | 61.5% | 14.3% | 1.8% | 2.9% | 19.5% |
| unclassified | 56.2% | 6.7% | 3.0% | 3.8% | 30.3% |
| residential | 11.2% | 8.3% | 0.0% | 0.1% | 80.3% |
| **All** | 42.0% | 25.7% | 1.6% | 3.8% | 26.9% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=intermediate` 494, `smoothness=bad` 135, `tracktype=grade2` 0 | `surface=unpaved` 642, `smoothness=very_bad` 127, `4wd_only=recommended` 84 |
| primary | `smoothness=intermediate` 831, `surface=compacted` 3 | `surface=unpaved` 546, `4wd_only=recommended` 214, `smoothness=very_bad` 50 |
| secondary | `smoothness=intermediate` 322, `smoothness=bad` 14, `surface=gravel` 1 | `surface=unpaved` 381, `smoothness=very_bad` 216, `tracktype=grade5` 44 |
| tertiary | `smoothness=intermediate` 76, `surface=compacted` 8, `smoothness=bad` 2 | `surface=unpaved` 251, `surface=ground` 128, `4wd_only=yes` 29 |
| unclassified | `smoothness=intermediate` 163, `surface=compacted` 75, `tracktype=grade2` 37 | `surface=unpaved` 3,641, `smoothness=very_bad` 299, `surface=ground` 259 |
| residential | `smoothness=intermediate` 99, `smoothness=bad` 51, `surface=compacted` 7 | `surface=unpaved` 208, `surface=ground` 14, `smoothness=very_bad` 7 |
| **All** | `smoothness=intermediate` 1,985, `smoothness=bad` 206, `surface=compacted` 93 | `surface=unpaved` 5,668, `smoothness=very_bad` 707, `4wd_only=recommended` 550 |

All Paved values: `smoothness=good` 1,790, `surface=asphalt` 1,385, `surface=paved` 96, `smoothness=excellent` 95, `surface=paving_stones` 17, `surface=concrete` 6, `tracktype=grade1` 5, `surface=wood` 0

### Unknown values (typos, local values): none

### Smoothness vs surface conflicts (km): `smoothness=good + surface=unpaved` 232, `smoothness=good + surface=dirt` 30, `smoothness=horrible + surface=asphalt` 14, `smoothness=very_bad + surface=asphalt` 2, `smoothness=good + surface=stone` 0, `smoothness=good + surface=concrete:lanes` 0, `smoothness=very_bad + surface=concrete` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w449286536](https://www.openstreetmap.org/way/449286536) trunk, 79.4 km, **offroad** by surface: `ref=RN4` `surface=unpaved`
- [w326713695](https://www.openstreetmap.org/way/326713695) primary, 76.8 km, **offroad** by 4wd_only: `ref=RN8` `surface=compacted` `smoothness=intermediate` `4wd_only=recommended`
- [w447270369](https://www.openstreetmap.org/way/447270369) trunk, 68.1 km, **offroad** by surface: `ref=RN4` `surface=unpaved`
- [w30064261](https://www.openstreetmap.org/way/30064261) trunk, 61.7 km, **offroad** by smoothness: `ref=RN5` `surface=dirt` `smoothness=very_bad`
- [w354417583](https://www.openstreetmap.org/way/354417583) primary, 61.3 km, **offroad** by surface: `surface=unpaved`
- [w354443426](https://www.openstreetmap.org/way/354443426) secondary, 61.2 km, **offroad** by surface: `surface=unpaved`
- [w697178914](https://www.openstreetmap.org/way/697178914) secondary, 53.3 km, **offroad** by smoothness: `ref=RD7301` `surface=dirt` `smoothness=very_bad`
- [w599525993](https://www.openstreetmap.org/way/599525993) trunk, 52.4 km, **offroad** by 4wd_only: `ref=RN5` `surface=compacted` `smoothness=intermediate` `4wd_only=recommended`
- [w288438995](https://www.openstreetmap.org/way/288438995) trunk, 51.4 km, **offroad** by surface: `ref=RN4` `surface=unpaved`
- [w345486784](https://www.openstreetmap.org/way/345486784) trunk, 50.8 km, **offroad** by surface: `ref=RN6` `surface=unpaved`

### Longest smoothness vs surface conflicts

- [w377965028](https://www.openstreetmap.org/way/377965028) secondary, 64.2 km, **paved** by smoothness: `ref=RD9104` `surface=unpaved` `smoothness=good` `tracktype=grade3`
- [w356868472](https://www.openstreetmap.org/way/356868472) primary, 43.5 km, **paved** by smoothness: `ref=RP902` `surface=unpaved` `smoothness=good`
- [w377617034](https://www.openstreetmap.org/way/377617034) primary, 36.4 km, **paved** by smoothness: `ref=RP902` `surface=unpaved` `smoothness=good`
- [w385428637](https://www.openstreetmap.org/way/385428637) unclassified, 23.8 km, **offroad** by 4wd_only: `surface=unpaved` `smoothness=good` `4wd_only=yes`
- [w378121603](https://www.openstreetmap.org/way/378121603) unclassified, 23.3 km, **paved** by smoothness: `ref=RP209` `surface=unpaved` `smoothness=good`
- [w79538833](https://www.openstreetmap.org/way/79538833) trunk, 20.4 km, **paved** by smoothness: `ref=RN3` `surface=dirt` `smoothness=good`
- [w1074624217](https://www.openstreetmap.org/way/1074624217) unclassified, 14.3 km, **offroad** by smoothness: `surface=asphalt` `smoothness=horrible` `tracktype=grade5`
- [w377627648](https://www.openstreetmap.org/way/377627648) secondary, 11.6 km, **paved** by smoothness: `ref=RD9102` `surface=unpaved` `smoothness=good`
- [w1227683382](https://www.openstreetmap.org/way/1227683382) trunk, 10.7 km, **paved** by smoothness: `ref=RN6` `surface=unpaved` `smoothness=good`
- [w79538728](https://www.openstreetmap.org/way/79538728) trunk, 9.6 km, **paved** by smoothness: `ref=RN3` `surface=dirt` `smoothness=good`

### Longest ways with unknown values

None of 0.5 km or more.

## French Guiana (gf), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `guyane-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| primary | 485 | 87.2% | 12.8% | 0.0% | 0.0% |
| secondary | 101 | 90.4% | 0.1% | 0.4% | 9.1% |
| tertiary | 418 | 44.2% | 54.8% | 0.2% | 0.8% |
| unclassified | 465 | 29.4% | 32.8% | 8.8% | 28.9% |
| residential | 1,030 | 41.8% | 39.9% | 2.5% | 15.7% |
| **All** | 2,498 | 50.7% | 34.2% | 2.7% | 12.4% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 0.0% | 0.0% | 0.0% | 0.0% |
| primary | 87.2% | 9.8% | 0.0% | 0.0% |
| secondary | 99.8% | 29.9% | 0.0% | 0.0% |
| tertiary | 45.2% | 4.0% | 0.0% | 0.0% |
| unclassified | 60.0% | 5.7% | 8.3% | 0.0% |
| residential | 59.3% | 5.3% | 1.2% | 0.0% |
| **All** | 64.2% | 7.1% | 2.0% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| primary | 77.4% | 9.8% | 0.0% | 0.0% | 12.8% |
| secondary | 69.9% | 29.9% | 0.0% | 0.0% | 0.1% |
| tertiary | 41.2% | 4.0% | 0.0% | 0.0% | 54.8% |
| unclassified | 57.3% | 5.7% | 4.1% | 0.0% | 32.8% |
| residential | 53.6% | 5.3% | 1.2% | 0.0% | 39.9% |
| **All** | 57.5% | 7.1% | 1.3% | 0.0% | 34.2% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | none | none |
| primary | `smoothness=intermediate` 0 | none |
| secondary | `smoothness=intermediate` 0 | `smoothness=very_bad` 9 |
| tertiary | `smoothness=intermediate` 1, `smoothness=bad` 0 | `surface=unpaved` 4 |
| unclassified | `smoothness=bad` 21, `tracktype=grade2` 18, `surface=compacted` 2 | `surface=unpaved` 120, `surface=ground` 13, `tracktype=grade3` 1 |
| residential | `surface=compacted` 14, `tracktype=grade2` 5, `smoothness=intermediate` 5 | `surface=unpaved` 142, `surface=dirt` 10, `surface=ground` 6 |
| **All** | `tracktype=grade2` 23, `smoothness=bad` 22, `surface=compacted` 16 | `surface=unpaved` 266, `surface=ground` 19, `surface=dirt` 10 |

All Paved values: `surface=asphalt` 1,039, `smoothness=excellent` 91, `surface=paved` 53, `smoothness=good` 48, `surface=concrete` 30, `tracktype=grade1` 5, `surface=paving_stones` 0, `surface=wood` 0

### Unknown values (typos, local values): none

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=concrete` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w285854418](https://www.openstreetmap.org/way/285854418) secondary, 6.2 km, **offroad** by smoothness: `surface=unpaved` `smoothness=very_bad`
- [w1302654315](https://www.openstreetmap.org/way/1302654315) secondary, 3 km, **offroad** by smoothness: `surface=unpaved` `smoothness=very_bad`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

None of 0.5 km or more.

## Ghana (gh), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `ghana-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 41 | 99.8% | 0.2% | 0.0% | 0.0% |
| trunk | 4,161 | 71.6% | 20.1% | 1.0% | 7.3% |
| primary | 3,810 | 46.5% | 35.1% | 4.3% | 14.1% |
| secondary | 6,483 | 36.4% | 37.5% | 5.1% | 21.0% |
| tertiary | 14,835 | 14.0% | 43.3% | 6.9% | 35.9% |
| unclassified | 45,882 | 1.4% | 61.8% | 1.2% | 35.6% |
| residential | 58,287 | 2.1% | 89.8% | 1.0% | 7.1% |
| **All** | 133,499 | 8.3% | 68.7% | 2.0% | 21.0% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 99.8% | 0.0% | 0.0% | 0.0% |
| trunk | 78.0% | 14.6% | 0.0% | 0.2% |
| primary | 53.1% | 17.3% | 0.0% | 0.0% |
| secondary | 54.4% | 12.0% | 0.0% | 0.0% |
| tertiary | 49.5% | 10.7% | 0.1% | 0.0% |
| unclassified | 35.5% | 3.6% | 0.3% | 0.0% |
| residential | 10.1% | 0.3% | 0.0% | 0.0% |
| **All** | 28.7% | 4.1% | 0.1% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 99.8% | 0.0% | 0.0% | 0.0% | 0.2% |
| trunk | 65.5% | 14.2% | 0.0% | 0.2% | 20.1% |
| primary | 47.6% | 17.3% | 0.0% | 0.0% | 35.1% |
| secondary | 50.5% | 12.0% | 0.0% | 0.0% | 37.5% |
| tertiary | 45.9% | 10.7% | 0.1% | 0.0% | 43.3% |
| unclassified | 34.4% | 3.6% | 0.3% | 0.0% | 61.8% |
| residential | 9.9% | 0.3% | 0.0% | 0.0% | 89.8% |
| **All** | 27.1% | 4.0% | 0.1% | 0.0% | 68.7% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `surface=compacted` 34, `smoothness=bad` 7 | `surface=unpaved` 203, `smoothness=very_bad` 45, `surface=ground` 43 |
| primary | `smoothness=bad` 94, `smoothness=intermediate` 44, `surface=gravel` 17 | `surface=unpaved` 262, `smoothness=very_bad` 189, `surface=ground` 87 |
| secondary | `surface=compacted` 140, `smoothness=bad` 140, `smoothness=intermediate` 33 | `surface=ground` 510, `surface=unpaved` 490, `smoothness=very_bad` 264 |
| tertiary | `surface=compacted` 693, `smoothness=bad` 249, `smoothness=intermediate` 43 | `surface=unpaved` 3,104, `smoothness=very_bad` 989, `surface=ground` 941 |
| unclassified | `surface=compacted` 279, `smoothness=bad` 183, `surface=gravel` 31 | `surface=unpaved` 11,804, `surface=ground` 2,800, `smoothness=very_bad` 1,169 |
| residential | `surface=compacted` 450, `surface=fine_gravel` 55, `smoothness=intermediate` 37 | `surface=unpaved` 2,946, `surface=dirt` 527, `surface=ground` 481 |
| **All** | `surface=compacted` 1,605, `smoothness=bad` 695, `smoothness=intermediate` 181 | `surface=unpaved` 18,809, `surface=ground` 4,861, `smoothness=very_bad` 2,682 |

All Paved values: `surface=asphalt` 7,144, `surface=paved` 2,365, `smoothness=good` 1,326, `smoothness=excellent` 217, `surface=concrete` 32, `surface=paving_stones` 16, `surface=sett` 2, `surface=concrete:plates` 1

### Unknown values (typos, local values): `smoothness=very_good` 8, `surface=artificial_turf` 1, `surface=soil` 0, `surface=Bing` 0, `surface=metal_grate` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 114, `smoothness=good + surface=unpaved` 31, `smoothness=very_bad + surface=paved` 23, `smoothness=good + surface=ground` 17, `smoothness=excellent + surface=sand` 1, `smoothness=good + surface=grass_paver` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w166252951](https://www.openstreetmap.org/way/166252951) primary, 67.4 km, **offroad** by surface: `ref=IR11` `surface=unpaved`
- [w164461564](https://www.openstreetmap.org/way/164461564) secondary, 53.4 km, **offroad** by surface: `ref=R54` `surface=unpaved`
- [w79123562](https://www.openstreetmap.org/way/79123562) secondary, 48.8 km, **offroad** by surface: `ref=R131` `surface=unpaved`
- [w29972739](https://www.openstreetmap.org/way/29972739) trunk, 43.3 km, **offroad** by surface: `ref=N13` `surface=unpaved`
- [w170674905](https://www.openstreetmap.org/way/170674905) secondary, 42.2 km, **offroad** by surface: `surface=unpaved`
- [w169253519](https://www.openstreetmap.org/way/169253519) secondary, 39.3 km, **offroad** by surface: `surface=ground`
- [w510857040](https://www.openstreetmap.org/way/510857040) secondary, 38.5 km, **offroad** by smoothness: `smoothness=very_bad`
- [w164461570](https://www.openstreetmap.org/way/164461570) secondary, 36.2 km, **offroad** by surface: `surface=unpaved`
- [w164461566](https://www.openstreetmap.org/way/164461566) secondary, 35.5 km, **offroad** by surface: `surface=ground`
- [w166303683](https://www.openstreetmap.org/way/166303683) secondary, 33.3 km, **offroad** by smoothness: `ref=R72` `smoothness=very_bad`

### Longest smoothness vs surface conflicts

- [w337482155](https://www.openstreetmap.org/way/337482155) secondary, 24.6 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w168135061](https://www.openstreetmap.org/way/168135061) tertiary, 14.7 km, **paved** by smoothness: `surface=unpaved` `smoothness=good`
- [w170306278](https://www.openstreetmap.org/way/170306278) tertiary, 14 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w447310814](https://www.openstreetmap.org/way/447310814) primary, 11.8 km, **offroad** by smoothness: `ref=IR3` `surface=asphalt` `smoothness=very_bad`
- [w970590575](https://www.openstreetmap.org/way/970590575) secondary, 11.4 km, **paved** by smoothness: `ref=R61` `surface=ground` `smoothness=good`
- [w337490711](https://www.openstreetmap.org/way/337490711) trunk, 9.1 km, **offroad** by smoothness: `ref=N2` `surface=asphalt` `smoothness=very_bad`
- [w13286035](https://www.openstreetmap.org/way/13286035) secondary, 9 km, **offroad** by smoothness: `surface=paved` `smoothness=very_bad`
- [w168261025](https://www.openstreetmap.org/way/168261025) primary, 8.8 km, **offroad** by smoothness: `ref=R41` `surface=asphalt` `smoothness=very_bad`
- [w168135029](https://www.openstreetmap.org/way/168135029) secondary, 8.3 km, **paved** by smoothness: `ref=R32` `surface=unpaved` `smoothness=good`
- [w447291156](https://www.openstreetmap.org/way/447291156) trunk, 7.3 km, **offroad** by smoothness: `ref=N13` `surface=asphalt` `smoothness=very_bad`

### Longest ways with unknown values

- [w623962641](https://www.openstreetmap.org/way/623962641) trunk, 5.3 km, **paved** by surface: `ref=N10` `surface=asphalt` `smoothness=very_good`
- [w406732161](https://www.openstreetmap.org/way/406732161) trunk, 2.7 km, **paved** by surface: `ref=N10` `surface=asphalt` `smoothness=very_good`

## Gambia (gm), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `senegal-and-gambia-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 844 | 91.6% | 0.1% | 8.3% | 0.0% |
| primary | 116 | 78.4% | 3.5% | 18.1% | 0.0% |
| secondary | 193 | 44.5% | 7.6% | 19.8% | 28.1% |
| tertiary | 808 | 18.8% | 4.8% | 20.2% | 56.2% |
| unclassified | 6,460 | 0.5% | 60.0% | 1.5% | 37.9% |
| residential | 6,394 | 0.5% | 79.1% | 1.1% | 19.2% |
| **All** | 14,814 | 7.9% | 60.7% | 3.1% | 28.3% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 100.0% | 10.4% | 0.0% | 0.0% |
| primary | 96.5% | 18.1% | 0.0% | 0.0% |
| secondary | 92.4% | 8.1% | 0.0% | 0.0% |
| tertiary | 90.7% | 11.7% | 10.0% | 0.0% |
| unclassified | 35.1% | 0.7% | 7.6% | 0.0% |
| residential | 18.2% | 0.6% | 3.4% | 0.0% |
| **All** | 35.8% | 2.1% | 5.3% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 89.5% | 10.4% | 0.0% | 0.0% | 0.1% |
| primary | 78.4% | 18.1% | 0.0% | 0.0% | 3.5% |
| secondary | 87.2% | 5.2% | 0.0% | 0.0% | 7.6% |
| tertiary | 74.7% | 11.7% | 8.8% | 0.0% | 4.8% |
| unclassified | 31.8% | 0.7% | 7.5% | 0.0% | 60.0% |
| residential | 16.9% | 0.6% | 3.3% | 0.0% | 79.1% |
| **All** | 32.1% | 2.0% | 5.2% | 0.0% | 60.7% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 69, `surface=gravel` 1 | `surface=unpaved` 0 |
| primary | `smoothness=intermediate` 21 | none |
| secondary | `surface=compacted` 38 | `surface=unpaved` 24, `surface=dirt` 23, `smoothness=very_bad` 7 |
| tertiary | `tracktype=grade2` 61, `smoothness=bad` 53, `surface=compacted` 49 | `surface=unpaved` 378, `smoothness=very_bad` 35, `surface=ground` 16 |
| unclassified | `tracktype=grade2` 70, `smoothness=bad` 14, `surface=compacted` 13 | `surface=unpaved` 1,575, `tracktype=grade3` 377, `surface=ground` 280 |
| residential | `tracktype=grade2` 37, `smoothness=bad` 32, `surface=gravel` 1 | `surface=unpaved` 871, `tracktype=grade3` 150, `surface=ground` 115 |
| **All** | `smoothness=bad` 169, `tracktype=grade2` 168, `surface=compacted` 100 | `surface=unpaved` 2,849, `tracktype=grade3` 537, `surface=ground` 410 |

All Paved values: `surface=asphalt` 1,071, `surface=paved` 73, `smoothness=good` 22, `surface=concrete` 3, `smoothness=excellent` 1, `tracktype=grade1` 0

### Unknown values (typos, local values): `smoothness=very_good` 6, `surface=Sandy` 1, `tracktype=grade3; grade2` 1, `surface=unpaved_sand` 0

### Smoothness vs surface conflicts (km): `smoothness=good + surface=unpaved` 1

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w189024257](https://www.openstreetmap.org/way/189024257) secondary, 21.5 km, **offroad** by surface: `surface=dirt`
- [w168106911](https://www.openstreetmap.org/way/168106911) secondary, 8.7 km, **offroad** by surface: `surface=unpaved`
- [w366451293](https://www.openstreetmap.org/way/366451293) secondary, 8.5 km, **offroad** by surface: `surface=unpaved`
- [w92972750](https://www.openstreetmap.org/way/92972750) secondary, 7 km, **offroad** by smoothness: `surface=unpaved` `smoothness=very_bad`
- [w255807200](https://www.openstreetmap.org/way/255807200) secondary, 4.6 km, **offroad** by surface: `surface=unpaved`
- [w376175462](https://www.openstreetmap.org/way/376175462) secondary, 2.3 km, **offroad** by surface: `surface=unpaved`
- [w1209339226](https://www.openstreetmap.org/way/1209339226) secondary, 1.6 km, **offroad** by surface: `surface=dirt`

### Longest smoothness vs surface conflicts

- [w32115242](https://www.openstreetmap.org/way/32115242) unclassified, 0.8 km, **paved** by smoothness: `surface=unpaved` `smoothness=good`

### Longest ways with unknown values

- [w32114375](https://www.openstreetmap.org/way/32114375) secondary, 5.5 km, **paved** by surface: `surface=asphalt` `smoothness=very_good`
- [w497865726](https://www.openstreetmap.org/way/497865726) unclassified, 0.5 km, **offroad** by surface: `surface=Sandy`
- [w255786989](https://www.openstreetmap.org/way/255786989) residential, 0.5 km, **paved** by default: `tracktype=grade3; grade2`

## Iceland (is), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `iceland-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 1,479 | 99.7% | 0.0% | 0.3% | 0.0% |
| primary | 3,023 | 91.2% | 0.0% | 8.7% | 0.1% |
| secondary | 4,295 | 35.1% | 0.1% | 47.8% | 17.0% |
| tertiary | 3,083 | 18.2% | 5.4% | 39.9% | 36.5% |
| unclassified | 3,919 | 10.6% | 16.0% | 50.0% | 23.3% |
| residential | 1,868 | 59.7% | 25.6% | 11.9% | 2.7% |
| **All** | 17,665 | 44.4% | 7.2% | 32.4% | 16.0% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 100.0% | 1.8% | 0.0% | 0.0% |
| primary | 100.0% | 16.4% | 0.0% | 0.0% |
| secondary | 99.9% | 8.3% | 0.6% | 10.7% |
| tertiary | 94.5% | 12.3% | 0.4% | 30.3% |
| unclassified | 83.7% | 11.8% | 1.1% | 11.8% |
| residential | 74.2% | 0.3% | 0.2% | 0.0% |
| **All** | 92.7% | 9.8% | 0.5% | 10.5% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 98.2% | 1.8% | 0.0% | 0.0% | 0.0% |
| primary | 83.6% | 16.4% | 0.0% | 0.0% | 0.0% |
| secondary | 81.6% | 8.3% | 0.0% | 10.0% | 0.1% |
| tertiary | 61.3% | 6.1% | 0.4% | 26.8% | 5.4% |
| unclassified | 67.5% | 6.4% | 0.7% | 9.4% | 16.0% |
| residential | 73.9% | 0.3% | 0.2% | 0.0% | 25.6% |
| **All** | 75.8% | 7.5% | 0.2% | 9.2% | 7.2% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=intermediate` 4 | none |
| primary | `surface=gravel` 117, `smoothness=bad` 46, `smoothness=intermediate` 45 | `surface=unpaved` 3 |
| secondary | `surface=gravel` 1,466, `surface=compacted` 430, `smoothness=bad` 76 | `4wd_only=yes` 428, `surface=unpaved` 133, `smoothness=very_bad` 105 |
| tertiary | `surface=gravel` 1,079, `smoothness=bad` 89, `surface=compacted` 32 | `4wd_only=yes` 825, `surface=unpaved` 163, `smoothness=horrible` 49 |
| unclassified | `surface=gravel` 1,796, `surface=compacted` 75, `smoothness=bad` 41 | `4wd_only=yes` 370, `surface=unpaved` 324, `smoothness=horrible` 123 |
| residential | `surface=gravel` 207, `surface=fine_gravel` 7, `smoothness=bad` 3 | `surface=unpaved` 41, `surface=grass` 7, `surface=pebblestone` 2 |
| **All** | `surface=gravel` 4,665, `surface=compacted` 582, `smoothness=bad` 254 | `4wd_only=yes` 1,623, `surface=unpaved` 665, `smoothness=horrible` 212 |

All Paved values: `surface=asphalt` 7,168, `smoothness=good` 387, `smoothness=excellent` 163, `surface=paved` 75, `surface=concrete` 26, `surface=concrete:plates` 7, `surface=paving_stones` 6, `surface=wood` 1

### Unknown values (typos, local values): `surface=rocks` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 0, `smoothness=very_horrible + surface=gravel` 0, `smoothness=very_bad + surface=concrete` 0, `smoothness=horrible + surface=asphalt` 0, `smoothness=horrible + surface=concrete` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w319372206](https://www.openstreetmap.org/way/319372206) secondary, 54.9 km, **offroad** by 4wd_only: `ref=F26` `surface=gravel` `4wd_only=yes`
- [w620383908](https://www.openstreetmap.org/way/620383908) secondary, 54.1 km, **offroad** by 4wd_only: `ref=35` `surface=gravel` `4wd_only=yes`
- [w26118339](https://www.openstreetmap.org/way/26118339) secondary, 39.7 km, **offroad** by smoothness: `ref=550` `surface=gravel` `smoothness=horrible`
- [w229617014](https://www.openstreetmap.org/way/229617014) secondary, 37.1 km, **offroad** by 4wd_only: `ref=756` `surface=gravel` `4wd_only=yes`
- [w48426337](https://www.openstreetmap.org/way/48426337) secondary, 29.7 km, **offroad** by 4wd_only: `ref=F26` `surface=gravel` `4wd_only=yes`
- [w439502875](https://www.openstreetmap.org/way/439502875) secondary, 23.7 km, **offroad** by 4wd_only: `ref=F26` `surface=gravel` `4wd_only=yes`
- [w64757699](https://www.openstreetmap.org/way/64757699) secondary, 22.8 km, **offroad** by 4wd_only: `ref=35` `surface=gravel` `4wd_only=yes`
- [w26144607](https://www.openstreetmap.org/way/26144607) secondary, 21.9 km, **offroad** by surface: `ref=608` `surface=dirt`
- [w620397389](https://www.openstreetmap.org/way/620397389) secondary, 20.8 km, **offroad** by smoothness: `ref=208` `surface=gravel` `smoothness=very_bad` `tracktype=grade2`
- [w539935048](https://www.openstreetmap.org/way/539935048) secondary, 20.3 km, **offroad** by 4wd_only: `ref=578` `surface=gravel` `4wd_only=yes`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

None of 0.5 km or more.

## Cambodia (kh), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `cambodia-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 374 | 64.7% | 35.3% | 0.0% | 0.0% |
| trunk | 2,710 | 32.0% | 63.4% | 4.2% | 0.4% |
| primary | 3,969 | 51.3% | 47.0% | 1.6% | 0.1% |
| secondary | 6,197 | 30.9% | 61.5% | 3.0% | 4.7% |
| tertiary | 10,655 | 13.4% | 68.4% | 2.5% | 15.7% |
| unclassified | 29,649 | 1.4% | 85.3% | 1.3% | 11.9% |
| residential | 47,141 | 2.4% | 91.2% | 0.9% | 5.5% |
| **All** | 100,695 | 8.0% | 82.5% | 1.4% | 8.0% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 64.7% | 0.0% | 0.0% | 0.0% |
| trunk | 36.4% | 16.3% | 0.0% | 0.0% |
| primary | 53.0% | 6.5% | 0.0% | 0.0% |
| secondary | 38.3% | 4.1% | 0.4% | 0.0% |
| tertiary | 31.6% | 2.8% | 0.4% | 0.1% |
| unclassified | 14.6% | 0.5% | 0.8% | 0.0% |
| residential | 8.7% | 0.2% | 0.6% | 0.0% |
| **All** | 17.4% | 1.5% | 0.6% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 64.7% | 0.0% | 0.0% | 0.0% | 35.3% |
| trunk | 20.3% | 16.3% | 0.0% | 0.0% | 63.4% |
| primary | 46.5% | 6.5% | 0.0% | 0.0% | 47.0% |
| secondary | 34.1% | 4.1% | 0.4% | 0.0% | 61.5% |
| tertiary | 28.4% | 2.8% | 0.4% | 0.0% | 68.4% |
| unclassified | 13.4% | 0.5% | 0.8% | 0.0% | 85.3% |
| residential | 8.0% | 0.2% | 0.6% | 0.0% | 91.2% |
| **All** | 15.4% | 1.5% | 0.6% | 0.0% | 82.5% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=intermediate` 113 | `surface=ground` 8, `surface=dirt` 2 |
| primary | `smoothness=intermediate` 63 | `surface=unpaved` 5 |
| secondary | `smoothness=intermediate` 132, `smoothness=bad` 36, `tracktype=grade2` 7 | `surface=unpaved` 194, `surface=dbst` 36, `smoothness=very_bad` 24 |
| tertiary | `surface=gravel` 131, `smoothness=intermediate` 66, `smoothness=bad` 39 | `surface=unpaved` 1,356, `surface=dirt` 97, `surface=dbst` 70 |
| unclassified | `tracktype=grade2` 134, `smoothness=bad` 94, `surface=compacted` 86 | `surface=unpaved` 2,748, `surface=dirt` 466, `surface=ground` 180 |
| residential | `surface=compacted` 198, `tracktype=grade2` 89, `smoothness=intermediate` 60 | `surface=unpaved` 1,803, `surface=ground` 283, `surface=dirt` 262 |
| **All** | `smoothness=intermediate` 463, `surface=compacted` 307, `tracktype=grade2` 248 | `surface=unpaved` 6,106, `surface=dirt` 836, `surface=ground` 504 |

All Paved values: `surface=asphalt` 4,855, `surface=concrete` 1,252, `surface=paved` 1,114, `smoothness=good` 738, `surface=concrete:plates` 31, `smoothness=excellent` 28, `tracktype=grade1` 18, `surface=paving_stones` 4

### Unknown values (typos, local values): `surface=dbst` 110, `surface=dbst_pavement` 15, `surface=dbst_and_concreate` 14, `surface=DBST` 9, `surface=double_bitumenous_surface_treatment` 7, `surface=residential` 6, `surface=concrete,_gravel` 3, `surface=dirt/sand` 3, `surface=dbst_and_gravek` 1, `surface=bamboo` 1, `surface=unpa` 0, `surface=paved/sand` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 20, `smoothness=very_horrible + surface=concrete` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w764575856](https://www.openstreetmap.org/way/764575856) secondary, 29.5 km, **offroad** by surface: `ref=50C` `surface=unpaved`
- [w346430318](https://www.openstreetmap.org/way/346430318) secondary, 22.2 km, **offroad** by surface: `ref=95` `surface=dbst`
- [w194623015](https://www.openstreetmap.org/way/194623015) secondary, 21.5 km, **offroad** by smoothness: `surface=dbst` `smoothness=very_bad`
- [w158537356](https://www.openstreetmap.org/way/158537356) secondary, 21.2 km, **offroad** by surface: `surface=unpaved`
- [w53571968](https://www.openstreetmap.org/way/53571968) secondary, 15.9 km, **offroad** by surface: `ref=301` `surface=unpaved`
- [w524557800](https://www.openstreetmap.org/way/524557800) secondary, 14.6 km, **offroad** by surface: `surface=unpaved`
- [w257768953](https://www.openstreetmap.org/way/257768953) secondary, 12.3 km, **offroad** by surface: `ref=78A` `surface=unpaved`
- [w1016782918](https://www.openstreetmap.org/way/1016782918) secondary, 9.8 km, **offroad** by surface: `surface=unpaved` description: "Bamnok <=> Phnom Toteung Tngai"
- [w1022153404](https://www.openstreetmap.org/way/1022153404) secondary, 9.4 km, **offroad** by surface: `ref=43` `surface=unpaved`
- [w207077623](https://www.openstreetmap.org/way/207077623) secondary, 9.2 km, **offroad** by surface: `ref=004-T2 MRD (24 km)` `surface=dbst`

### Longest smoothness vs surface conflicts

- [w389984012](https://www.openstreetmap.org/way/389984012) tertiary, 2.8 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w214562676](https://www.openstreetmap.org/way/214562676) secondary, 2.5 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad` description: "Regularly used by locals on scooters. Deep ruts and washed out passages may turn"
- [w389984008](https://www.openstreetmap.org/way/389984008) tertiary, 1.9 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389984011](https://www.openstreetmap.org/way/389984011) tertiary, 1.7 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389984009](https://www.openstreetmap.org/way/389984009) tertiary, 1.5 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389983985](https://www.openstreetmap.org/way/389983985) tertiary, 1.5 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389983987](https://www.openstreetmap.org/way/389983987) tertiary, 1.2 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389983983](https://www.openstreetmap.org/way/389983983) tertiary, 1 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389984010](https://www.openstreetmap.org/way/389984010) tertiary, 0.9 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389983981](https://www.openstreetmap.org/way/389983981) tertiary, 0.8 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`

### Longest ways with unknown values

- [w194615397](https://www.openstreetmap.org/way/194615397) tertiary, 33.9 km, **offroad** by surface: `ref=349-T2` `surface=dbst`
- [w346430318](https://www.openstreetmap.org/way/346430318) secondary, 22.2 km, **offroad** by surface: `ref=95` `surface=dbst`
- [w255434144](https://www.openstreetmap.org/way/255434144) tertiary, 14 km, **offroad** by surface: `surface=dbst_and_concreate`
- [w374346334](https://www.openstreetmap.org/way/374346334) tertiary, 10.5 km, **offroad** by surface: `surface=dbst`
- [w320763591](https://www.openstreetmap.org/way/320763591) tertiary, 9.2 km, **offroad** by surface: `surface=dbst`
- [w207077623](https://www.openstreetmap.org/way/207077623) secondary, 9.2 km, **offroad** by surface: `ref=004-T2 MRD (24 km)` `surface=dbst`
- [w477833815](https://www.openstreetmap.org/way/477833815) tertiary, 8.4 km, **offroad** by surface: `surface=dbst_pavement` description: "10 km of roads in Kratie Province (road lines KR3 from PK 0+000 to 10+000) inclu"
- [w374346327](https://www.openstreetmap.org/way/374346327) tertiary, 6.8 km, **offroad** by surface: `surface=double_bitumenous_surface_treatment`
- [w320763592](https://www.openstreetmap.org/way/320763592) tertiary, 6.8 km, **offroad** by surface: `surface=dbst`
- [w434958969](https://www.openstreetmap.org/way/434958969) tertiary, 5.9 km, **offroad** by surface: `surface=DBST`

## Laos (la), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `laos-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 213 | 26.0% | 74.0% | 0.0% | 0.0% |
| trunk | 7,499 | 37.6% | 49.9% | 3.4% | 9.1% |
| primary | 739 | 41.9% | 34.1% | 6.3% | 17.7% |
| secondary | 1,341 | 27.2% | 44.9% | 3.2% | 24.8% |
| tertiary | 7,986 | 16.5% | 32.8% | 4.1% | 46.7% |
| unclassified | 31,178 | 1.8% | 44.9% | 3.8% | 49.5% |
| residential | 12,593 | 2.8% | 65.8% | 3.2% | 28.2% |
| **All** | 61,549 | 9.4% | 48.2% | 3.7% | 38.8% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 4.6% | 26.0% | 0.0% | 0.0% |
| trunk | 49.9% | 5.2% | 0.0% | 0.0% |
| primary | 65.9% | 0.1% | 17.3% | 0.0% |
| secondary | 55.1% | 4.5% | 0.0% | 0.0% |
| tertiary | 66.6% | 4.1% | 0.8% | 0.0% |
| unclassified | 54.5% | 3.9% | 3.4% | 0.0% |
| residential | 33.8% | 3.5% | 0.8% | 0.0% |
| **All** | 51.3% | 4.1% | 2.2% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 26.0% | 0.0% | 0.0% | 74.0% |
| trunk | 44.9% | 5.2% | 0.0% | 0.0% | 49.9% |
| primary | 48.5% | 0.1% | 17.3% | 0.0% | 34.1% |
| secondary | 50.6% | 4.5% | 0.0% | 0.0% | 44.9% |
| tertiary | 62.5% | 4.1% | 0.6% | 0.0% | 32.8% |
| unclassified | 48.1% | 3.9% | 3.1% | 0.0% | 44.9% |
| residential | 30.0% | 3.5% | 0.7% | 0.0% | 65.8% |
| **All** | 45.8% | 4.1% | 2.0% | 0.0% | 48.2% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=intermediate` 174, `smoothness=bad` 35, `surface=gravel` 26 | `surface=unpaved` 561, `surface=dirt` 118 |
| primary | `tracktype=grade2` 46, `surface=gravel` 0 | `tracktype=grade3` 66, `surface=unpaved` 42, `surface=dirt` 23 |
| secondary | `surface=gravel` 16, `surface=compacted` 16, `smoothness=intermediate` 10 | `surface=dirt` 178, `surface=unpaved` 132, `smoothness=very_bad` 22 |
| tertiary | `smoothness=bad` 125, `surface=gravel` 101, `tracktype=grade2` 43 | `surface=unpaved` 2,930, `surface=dirt` 674, `smoothness=very_bad` 69 |
| unclassified | `smoothness=bad` 533, `tracktype=grade2` 291, `surface=gravel` 218 | `surface=unpaved` 12,176, `surface=dirt` 1,871, `smoothness=very_bad` 507 |
| residential | `smoothness=bad` 310, `smoothness=intermediate` 32, `surface=gravel` 31 | `surface=unpaved` 2,933, `surface=dirt` 459, `smoothness=very_bad` 70 |
| **All** | `smoothness=bad` 1,004, `tracktype=grade2` 405, `surface=gravel` 392 | `surface=unpaved` 18,774, `surface=dirt` 3,322, `smoothness=very_bad` 668 |

All Paved values: `surface=asphalt` 3,072, `surface=paved` 1,614, `surface=concrete` 538, `smoothness=good` 341, `tracktype=grade1` 128, `smoothness=excellent` 86, `surface=wood` 1, `surface=paving_stones` 1

### Unknown values (typos, local values): `surface=unpaved,gravel` 8, `surface=dirt/sand` 4, `surface=písčitý` 4, `surface=harm` 0, `surface=steel` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=concrete` 3, `smoothness=good + surface=unpaved` 3, `smoothness=horrible + surface=paved` 1, `smoothness=horrible + surface=concrete` 1, `smoothness=very_bad + surface=asphalt` 1, `smoothness=very_bad + surface=paved` 1, `smoothness=very_bad + surface=wood` 0, `smoothness=impassable + surface=wood` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w205900283](https://www.openstreetmap.org/way/205900283) trunk, 48.1 km, **offroad** by surface: `ref=1G` `surface=unpaved`
- [w194259538](https://www.openstreetmap.org/way/194259538) trunk, 42.3 km, **offroad** by surface: `ref=14B` `surface=unpaved`
- [w14000127](https://www.openstreetmap.org/way/14000127) trunk, 37.3 km, **offroad** by surface: `ref=1G` `surface=unpaved`
- [w616135467](https://www.openstreetmap.org/way/616135467) trunk, 34 km, **offroad** by surface: `ref=14C` `surface=unpaved`
- [w435976367](https://www.openstreetmap.org/way/435976367) trunk, 29.2 km, **offroad** by surface: `ref=14B` `surface=unpaved`
- [w231961442](https://www.openstreetmap.org/way/231961442) trunk, 29.2 km, **offroad** by surface: `ref=1G` `surface=unpaved`
- [w229385042](https://www.openstreetmap.org/way/229385042) primary, 22.8 km, **offroad** by surface: `surface=dirt`
- [w369101927](https://www.openstreetmap.org/way/369101927) trunk, 21.8 km, **offroad** by surface: `ref=1F` `surface=dirt`
- [w253189280](https://www.openstreetmap.org/way/253189280) trunk, 18.6 km, **offroad** by surface: `ref=17` `surface=unpaved`
- [w435982777](https://www.openstreetmap.org/way/435982777) trunk, 18.5 km, **offroad** by surface: `ref=14B` `surface=unpaved`

### Longest smoothness vs surface conflicts

- [w45076995](https://www.openstreetmap.org/way/45076995) unclassified, 3.2 km, **offroad** by smoothness: `surface=concrete` `smoothness=very_bad`
- [w1304374731](https://www.openstreetmap.org/way/1304374731) unclassified, 1.2 km, **offroad** by smoothness: `surface=paved` `smoothness=horrible`
- [w452579643](https://www.openstreetmap.org/way/452579643) unclassified, 0.9 km, **paved** by smoothness: `surface=unpaved` `smoothness=good`
- [w193848166](https://www.openstreetmap.org/way/193848166) unclassified, 0.6 km, **paved** by smoothness: `surface=unpaved` `smoothness=good`
- [w527244672](https://www.openstreetmap.org/way/527244672) unclassified, 0.6 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`
- [w389197301](https://www.openstreetmap.org/way/389197301) unclassified, 0.5 km, **offroad** by smoothness: `surface=concrete` `smoothness=horrible` note: "Badly damaged path!"

### Longest ways with unknown values

- [w213774318](https://www.openstreetmap.org/way/213774318) unclassified, 7.5 km, **offroad** by surface: `surface=unpaved,gravel`
- [w1255150341](https://www.openstreetmap.org/way/1255150341) unclassified, 3.2 km, **offroad** by surface: `surface=písčitý`
- [w1182269465](https://www.openstreetmap.org/way/1182269465) unclassified, 1.3 km, **offroad** by surface: `surface=dirt/sand`
- [w1182269459](https://www.openstreetmap.org/way/1182269459) unclassified, 0.6 km, **offroad** by surface: `surface=dirt/sand`

## Myanmar (mm), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `myanmar-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 1,137 | 36.9% | 63.1% | 0.0% | 0.0% |
| trunk | 16,040 | 24.1% | 66.5% | 1.8% | 7.6% |
| primary | 4,606 | 37.1% | 58.8% | 2.0% | 2.1% |
| secondary | 11,827 | 19.2% | 72.7% | 0.5% | 7.7% |
| tertiary | 42,920 | 3.7% | 86.9% | 0.8% | 8.6% |
| unclassified | 163,734 | 0.4% | 94.0% | 0.3% | 5.3% |
| residential | 98,862 | 0.8% | 96.6% | 0.2% | 2.4% |
| **All** | 339,127 | 3.4% | 91.2% | 0.4% | 5.0% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 36.9% | 0.0% | 0.0% | 0.0% |
| trunk | 33.5% | 2.9% | 0.2% | 0.0% |
| primary | 41.2% | 3.8% | 0.0% | 0.0% |
| secondary | 27.3% | 1.4% | 0.0% | 0.0% |
| tertiary | 13.0% | 0.7% | 0.2% | 0.0% |
| unclassified | 6.0% | 0.2% | 0.1% | 0.0% |
| residential | 3.4% | 0.2% | 0.1% | 0.0% |
| **All** | 8.7% | 0.5% | 0.1% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 36.9% | 0.0% | 0.0% | 0.0% | 63.1% |
| trunk | 30.4% | 2.9% | 0.2% | 0.0% | 66.5% |
| primary | 37.4% | 3.8% | 0.0% | 0.0% | 58.8% |
| secondary | 26.0% | 1.4% | 0.0% | 0.0% | 72.7% |
| tertiary | 12.2% | 0.7% | 0.2% | 0.0% | 86.9% |
| unclassified | 5.8% | 0.2% | 0.1% | 0.0% | 94.0% |
| residential | 3.2% | 0.2% | 0.1% | 0.0% | 96.6% |
| **All** | 8.2% | 0.5% | 0.1% | 0.0% | 91.2% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 105, `smoothness=intermediate` 93, `surface=gravel` 93 | `surface=unpaved` 952, `surface=dirt` 193, `smoothness=very_bad` 44 |
| primary | `smoothness=bad` 85, `smoothness=intermediate` 5 | `surface=unpaved` 99 |
| secondary | `smoothness=bad` 30, `surface=compacted` 20, `smoothness=intermediate` 6 | `surface=unpaved` 718, `surface=dirt` 112, `surface=ground` 74 |
| tertiary | `smoothness=bad` 163, `surface=gravel` 88, `smoothness=intermediate` 60 | `surface=unpaved` 2,648, `surface=dirt` 465, `surface=ground` 367 |
| unclassified | `surface=gravel` 234, `smoothness=bad` 129, `surface=compacted` 88 | `surface=unpaved` 6,398, `surface=ground` 1,200, `surface=earth` 446 |
| residential | `surface=gravel` 53, `surface=compacted` 52, `smoothness=intermediate` 29 | `surface=unpaved` 1,807, `surface=ground` 380, `surface=dirt` 92 |
| **All** | `smoothness=bad` 533, `surface=gravel` 471, `smoothness=intermediate` 257 | `surface=unpaved` 12,621, `surface=ground` 2,032, `surface=dirt` 1,272 |

All Paved values: `surface=asphalt` 8,153, `surface=paved` 1,242, `surface=concrete` 1,186, `smoothness=good` 583, `tracktype=grade1` 85, `surface=paving_stones` 80, `smoothness=excellent` 36, `surface=concrete:plates` 2

### Unknown values (typos, local values): `surface=dirt/sand` 6, `surface=asphalt_concrete` 2, `surface=unou` 0, `surface=Dirt_Road` 0, `surface=bamboo` 0, `surface=street` 0

### Smoothness vs surface conflicts (km): `smoothness=horrible + surface=asphalt` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w504154807](https://www.openstreetmap.org/way/504154807) trunk, 89.4 km, **offroad** by surface: `ref=NH3` `surface=unpaved`
- [w352827661](https://www.openstreetmap.org/way/352827661) trunk, 45.4 km, **offroad** by surface: `ref=NH48` `surface=dirt`
- [w300841775](https://www.openstreetmap.org/way/300841775) primary, 44.6 km, **offroad** by surface: `ref=A20` `surface=unpaved`
- [w24212255](https://www.openstreetmap.org/way/24212255) trunk, 44.3 km, **offroad** by smoothness: `ref=NH43` `surface=unpaved` `smoothness=very_bad`
- [w397611094](https://www.openstreetmap.org/way/397611094) trunk, 42 km, **offroad** by surface: `ref=NH46` `surface=dirt`
- [w307005840](https://www.openstreetmap.org/way/307005840) secondary, 36.4 km, **offroad** by surface: `surface=unpaved`
- [w241354153](https://www.openstreetmap.org/way/241354153) trunk, 35.9 km, **offroad** by surface: `ref=NH48` `surface=unpaved`
- [w112326508](https://www.openstreetmap.org/way/112326508) trunk, 33.1 km, **offroad** by surface: `ref=NH46` `surface=dirt`
- [w355457543](https://www.openstreetmap.org/way/355457543) trunk, 32.9 km, **offroad** by surface: `ref=NH42` `surface=unpaved`
- [w377792665](https://www.openstreetmap.org/way/377792665) secondary, 31 km, **offroad** by surface: `surface=ground`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

- [w756164472](https://www.openstreetmap.org/way/756164472) unclassified, 2.4 km, **offroad** by surface: `surface=dirt/sand`
- [w1336989809](https://www.openstreetmap.org/way/1336989809) trunk, 2.2 km, **offroad** by surface: `ref=NH12` `surface=asphalt_concrete`
- [w506950880](https://www.openstreetmap.org/way/506950880) unclassified, 1.6 km, **offroad** by surface: `surface=dirt/sand`
- [w588550206](https://www.openstreetmap.org/way/588550206) unclassified, 0.9 km, **offroad** by surface: `surface=dirt/sand`
- [w1486494109](https://www.openstreetmap.org/way/1486494109) residential, 0.7 km, **offroad** by surface: `surface=dirt/sand`
- [w1486494108](https://www.openstreetmap.org/way/1486494108) residential, 0.5 km, **offroad** by surface: `surface=dirt/sand`

## Mongolia (mn), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `mongolia-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 61 | 100.0% | 0.0% | 0.0% | 0.0% |
| trunk | 6,471 | 94.5% | 3.0% | 1.3% | 1.2% |
| primary | 4,406 | 58.9% | 6.0% | 9.2% | 25.9% |
| secondary | 3,742 | 27.1% | 12.4% | 29.0% | 31.5% |
| tertiary | 26,210 | 4.1% | 15.0% | 9.0% | 71.9% |
| unclassified | 59,250 | 2.5% | 29.1% | 2.9% | 65.5% |
| residential | 13,373 | 2.2% | 69.1% | 0.4% | 28.3% |
| **All** | 113,512 | 11.1% | 27.6% | 5.0% | 56.3% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 100.0% | 0.0% | 0.0% | 0.0% |
| trunk | 97.0% | 5.4% | 0.0% | 0.0% |
| primary | 94.0% | 3.4% | 0.1% | 0.0% |
| secondary | 87.2% | 1.9% | 0.5% | 0.0% |
| tertiary | 84.8% | 4.0% | 1.9% | 0.0% |
| unclassified | 70.6% | 3.3% | 2.6% | 0.0% |
| residential | 30.9% | 0.1% | 0.4% | 0.0% |
| **All** | 72.2% | 3.1% | 1.8% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 100.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 91.6% | 5.4% | 0.0% | 0.0% | 3.0% |
| primary | 90.5% | 3.4% | 0.1% | 0.0% | 6.0% |
| secondary | 85.5% | 1.9% | 0.2% | 0.0% | 12.4% |
| tertiary | 79.6% | 4.0% | 1.4% | 0.0% | 15.0% |
| unclassified | 65.4% | 3.3% | 2.2% | 0.0% | 29.1% |
| residential | 30.4% | 0.1% | 0.4% | 0.0% | 69.1% |
| **All** | 67.7% | 3.1% | 1.5% | 0.0% | 27.6% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 69, `surface=compacted` 8, `surface=gravel` 7 | `surface=ground` 77, `surface=dirt` 1, `surface=unpaved` 0 |
| primary | `surface=gravel` 293, `smoothness=bad` 105, `smoothness=intermediate` 9 | `surface=ground` 608, `surface=unpaved` 531 |
| secondary | `surface=gravel` 1,075, `smoothness=bad` 9 | `surface=ground` 755, `surface=unpaved` 229, `surface=dirt` 124 |
| tertiary | `surface=gravel` 1,760, `smoothness=bad` 534, `tracktype=grade2` 37 | `surface=ground` 15,009, `surface=unpaved` 2,060, `surface=dirt` 717 |
| unclassified | `surface=gravel` 1,242, `smoothness=bad` 245, `tracktype=grade2` 106 | `surface=ground` 29,669, `surface=unpaved` 4,297, `surface=dirt` 1,391 |
| residential | `surface=gravel` 44, `tracktype=grade2` 2, `smoothness=bad` 2 | `surface=unpaved` 1,819, `surface=dirt` 1,232, `surface=ground` 661 |
| **All** | `surface=gravel` 4,420, `smoothness=bad` 964, `tracktype=grade2` 145 | `surface=ground` 46,779, `surface=unpaved` 8,937, `surface=dirt` 3,464 |

All Paved values: `surface=asphalt` 11,641, `surface=paved` 551, `smoothness=excellent` 295, `smoothness=good` 91, `tracktype=grade1` 24, `surface=concrete` 23, `surface=paving_stones` 1, `surface=cobblestone` 1

### Unknown values (typos, local values): `surface=ground,_sand` 114, `surface=offroad` 32, `surface=ground,_dirt,_mud` 7, `surface=ground,_mud` 6, `surface=unpaved,_dirt` 1, `surface=unpvaed,_dirt` 1, `surface=dirt/sand` 1, `surface=2` 1, `surface=artificial_turf` 0, `surface=d` 0, `surface=unsaved` 0, `surface=ground,_dirt` 0

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 8

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w76695032](https://www.openstreetmap.org/way/76695032) primary, 142.8 km, **offroad** by surface: `ref=A0503` `surface=unpaved`
- [w28925732](https://www.openstreetmap.org/way/28925732) secondary, 133.2 km, **offroad** by surface: `surface=ground`
- [w560753121](https://www.openstreetmap.org/way/560753121) secondary, 132 km, **offroad** by surface: `surface=ground`
- [w226326914](https://www.openstreetmap.org/way/226326914) primary, 126.6 km, **offroad** by surface: `surface=ground`
- [w835447040](https://www.openstreetmap.org/way/835447040) primary, 106.8 km, **offroad** by surface: `ref=A1103` `surface=ground`
- [w382236654](https://www.openstreetmap.org/way/382236654) primary, 79.8 km, **offroad** by surface: `surface=unpaved`
- [w524291607](https://www.openstreetmap.org/way/524291607) secondary, 78.6 km, **offroad** by surface: `ref=A0901` `surface=ground`
- [w188189597](https://www.openstreetmap.org/way/188189597) secondary, 73.5 km, **offroad** by surface: `surface=ground`
- [w380563931](https://www.openstreetmap.org/way/380563931) secondary, 66.8 km, **offroad** by surface: `surface=unpaved`
- [w1259511363](https://www.openstreetmap.org/way/1259511363) primary, 60.6 km, **offroad** by surface: `ref=A1701` `surface=unpaved` fixme: "highway"

### Longest smoothness vs surface conflicts

- [w62363686](https://www.openstreetmap.org/way/62363686) unclassified, 8.1 km, **offroad** by smoothness: `surface=asphalt` `smoothness=very_bad`

### Longest ways with unknown values

- [w1215920788](https://www.openstreetmap.org/way/1215920788) unclassified, 52.8 km, **offroad** by surface: `surface=ground,_sand`
- [w999823018](https://www.openstreetmap.org/way/999823018) unclassified, 31.8 km, **offroad** by surface: `surface=offroad`
- [w1215919874](https://www.openstreetmap.org/way/1215919874) unclassified, 25.2 km, **offroad** by surface: `surface=ground,_sand`
- [w1215907278](https://www.openstreetmap.org/way/1215907278) tertiary, 17 km, **offroad** by surface: `surface=ground,_sand`
- [w1215921170](https://www.openstreetmap.org/way/1215921170) unclassified, 10.2 km, **offroad** by surface: `surface=ground,_sand`
- [w1215931052](https://www.openstreetmap.org/way/1215931052) unclassified, 6.5 km, **offroad** by surface: `surface=ground,_dirt,_mud`
- [w1215928269](https://www.openstreetmap.org/way/1215928269) unclassified, 5.8 km, **offroad** by surface: `surface=ground,_mud`
- [w1215920821](https://www.openstreetmap.org/way/1215920821) unclassified, 5.7 km, **offroad** by surface: `surface=ground,_sand`
- [w1215921321](https://www.openstreetmap.org/way/1215921321) unclassified, 2.7 km, **offroad** by surface: `surface=ground,_sand`

## Nepal (np), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `nepal-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 2,132 | 45.4% | 53.4% | 0.2% | 1.0% |
| primary | 5,000 | 31.5% | 59.3% | 3.3% | 5.9% |
| secondary | 4,556 | 25.3% | 61.3% | 5.1% | 8.2% |
| tertiary | 15,252 | 4.5% | 73.4% | 4.7% | 17.4% |
| unclassified | 74,104 | 0.8% | 83.2% | 3.6% | 12.4% |
| residential | 27,561 | 2.3% | 88.7% | 1.8% | 7.2% |
| **All** | 128,606 | 4.4% | 81.0% | 3.3% | 11.3% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 45.6% | 1.8% | 0.1% | 0.0% |
| primary | 40.4% | 2.0% | 1.0% | 0.0% |
| secondary | 37.9% | 2.6% | 1.2% | 0.0% |
| tertiary | 25.6% | 1.7% | 1.7% | 0.0% |
| unclassified | 15.5% | 2.9% | 1.6% | 0.0% |
| residential | 10.6% | 0.8% | 1.0% | 0.0% |
| **All** | 17.9% | 2.3% | 1.4% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 44.7% | 1.8% | 0.1% | 0.0% | 53.4% |
| primary | 37.8% | 2.0% | 0.9% | 0.0% | 59.3% |
| secondary | 34.9% | 2.6% | 1.2% | 0.0% | 61.3% |
| tertiary | 23.3% | 1.7% | 1.6% | 0.0% | 73.4% |
| unclassified | 12.3% | 2.9% | 1.5% | 0.0% | 83.2% |
| residential | 9.5% | 0.8% | 1.0% | 0.0% | 88.7% |
| **All** | 15.3% | 2.3% | 1.4% | 0.0% | 81.0% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 4, `surface=gravel` 1 | `smoothness=horrible` 18, `surface=unpaved` 2, `smoothness=very_horrible` 1 |
| primary | `surface=gravel` 81, `tracktype=grade2` 33, `surface=compacted` 20 | `surface=unpaved` 190, `smoothness=very_bad` 36, `smoothness=horrible` 18 |
| secondary | `surface=gravel` 157, `surface=compacted` 26, `smoothness=bad` 22 | `surface=unpaved` 171, `surface=dirt` 53, `surface=ground` 30 |
| tertiary | `surface=gravel` 410, `tracktype=grade2` 174, `smoothness=bad` 87 | `surface=unpaved` 1,012, `surface=ground` 958, `surface=earth` 323 |
| unclassified | `smoothness=bad` 1,695, `tracktype=grade2` 541, `surface=gravel` 386 | `surface=unpaved` 3,993, `surface=ground` 3,709, `surface=dirt` 444 |
| residential | `smoothness=intermediate` 170, `tracktype=grade2` 148, `surface=gravel` 142 | `surface=ground` 921, `surface=unpaved` 802, `surface=dirt` 94 |
| **All** | `smoothness=bad` 1,847, `surface=gravel` 1,176, `tracktype=grade2` 912 | `surface=unpaved` 6,169, `surface=ground` 5,634, `surface=dirt` 723 |

All Paved values: `surface=asphalt` 3,215, `surface=paved` 1,748, `tracktype=grade1` 295, `surface=concrete` 145, `smoothness=good` 132, `surface=paving_stones` 25, `smoothness=excellent` 22, `surface=cobblestone` 14

### Unknown values (typos, local values): `surface=ottaseal` 63, `surface=Blacktopped` 36, `surface=bitumin` 15, `surface=G` 14, `surface=3.5` 11, `smoothness=off_road_wheels` 6, `surface=premix` 4, `surface=stone` 3, `surface=dryriver` 2, `surface=steel` 2, `surface=EarthenTE228` 1, `surface=blacktop` 1

### Smoothness vs surface conflicts (km): `smoothness=very_bad + surface=asphalt` 24, `smoothness=very_horrible + surface=compacted` 18, `smoothness=good + surface=ground` 9, `smoothness=very_bad + surface=paving_stones` 6, `smoothness=excellent + surface=ground` 5, `smoothness=horrible + surface=asphalt` 4, `smoothness=very_bad + surface=paved` 1, `smoothness=good + surface=unpaved` 1

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w342736414](https://www.openstreetmap.org/way/342736414) primary, 21.8 km, **offroad** by surface: `ref=NH66` `surface=unpaved`
- [w363255785](https://www.openstreetmap.org/way/363255785) secondary, 19.5 km, **offroad** by surface: `ref=50A002R` `surface=ottaseal`
- [w330470159](https://www.openstreetmap.org/way/330470159) secondary, 15 km, **offroad** by surface: `surface=bitumin`
- [w357846464](https://www.openstreetmap.org/way/357846464) primary, 13.6 km, **offroad** by surface: `ref=NH09` `surface=unpaved`
- [w453093939](https://www.openstreetmap.org/way/453093939) primary, 12 km, **offroad** by surface: `ref=NH03` `surface=unpaved`
- [w335759934](https://www.openstreetmap.org/way/335759934) secondary, 11.9 km, **specialized** by smoothness: `ref=69DR016` `surface=compacted` `smoothness=very_horrible`
- [w191192587](https://www.openstreetmap.org/way/191192587) secondary, 11.8 km, **offroad** by surface: `ref=F20` `surface=dirt`
- [w491321734](https://www.openstreetmap.org/way/491321734) secondary, 11.7 km, **offroad** by surface: `ref=13DR009` `surface=unpaved`
- [w344160419](https://www.openstreetmap.org/way/344160419) primary, 10.7 km, **offroad** by smoothness: `ref=NH18` `surface=unpaved` `smoothness=horrible` note: "No previous smoothness tag. Only small vehicles (4 x 4 jeeps) are allowed. Cauti"
- [w515806937](https://www.openstreetmap.org/way/515806937) secondary, 10.2 km, **offroad** by surface: `surface=dirt` description: "one bus daily from hatbazar diktel at 3 pm to khotangbazar. Duration 5 hours"

### Longest smoothness vs surface conflicts

- [w335759934](https://www.openstreetmap.org/way/335759934) secondary, 11.9 km, **specialized** by smoothness: `ref=69DR016` `surface=compacted` `smoothness=very_horrible`
- [w246173479](https://www.openstreetmap.org/way/246173479) primary, 7.1 km, **offroad** by smoothness: `ref=NH18` `surface=asphalt` `smoothness=very_bad`
- [w515888245](https://www.openstreetmap.org/way/515888245) secondary, 6.1 km, **specialized** by smoothness: `ref=69DR016` `surface=compacted` `smoothness=very_horrible`
- [w28836698](https://www.openstreetmap.org/way/28836698) primary, 4.8 km, **offroad** by smoothness: `ref=NH05` `surface=asphalt` `smoothness=very_bad`
- [w1430236631](https://www.openstreetmap.org/way/1430236631) primary, 4.8 km, **offroad** by smoothness: `ref=NH05` `surface=asphalt` `smoothness=very_bad`
- [w341151347](https://www.openstreetmap.org/way/341151347) residential, 4.7 km, **paved** by smoothness: `surface=ground` `smoothness=excellent`
- [w425291499](https://www.openstreetmap.org/way/425291499) tertiary, 3.8 km, **offroad** by smoothness: `ref=40DR001` `surface=paving_stones` `smoothness=very_bad` `tracktype=grade3`
- [w1427088903](https://www.openstreetmap.org/way/1427088903) primary, 2.7 km, **offroad** by smoothness: `ref=NH05` `surface=asphalt` `smoothness=very_bad`
- [w28836696](https://www.openstreetmap.org/way/28836696) primary, 2.7 km, **offroad** by smoothness: `ref=NH05` `surface=asphalt` `smoothness=very_bad`
- [w814783438](https://www.openstreetmap.org/way/814783438) residential, 2.4 km, **paved** by smoothness: `surface=ground` `smoothness=good`

### Longest ways with unknown values

- [w363255785](https://www.openstreetmap.org/way/363255785) secondary, 19.5 km, **offroad** by surface: `ref=50A002R` `surface=ottaseal`
- [w330470159](https://www.openstreetmap.org/way/330470159) secondary, 15 km, **offroad** by surface: `surface=bitumin`
- [w336384441](https://www.openstreetmap.org/way/336384441) tertiary, 10.4 km, **offroad** by surface: `ref=52A002R` `surface=3.5`
- [w363250756](https://www.openstreetmap.org/way/363250756) tertiary, 10.1 km, **offroad** by surface: `ref=50A003R` `surface=ottaseal`
- [w377893237](https://www.openstreetmap.org/way/377893237) tertiary, 8 km, **offroad** by surface: `ref=56A003` `surface=ottaseal`
- [w522970295](https://www.openstreetmap.org/way/522970295) tertiary, 7.9 km, **offroad** by surface: `ref=56A003` `surface=ottaseal`
- [w363249935](https://www.openstreetmap.org/way/363249935) tertiary, 6.1 km, **offroad** by surface: `ref=50A004R` `surface=ottaseal`
- [w628619990](https://www.openstreetmap.org/way/628619990) unclassified, 4.3 km, **offroad** by surface: `surface=G`
- [w961716082](https://www.openstreetmap.org/way/961716082) unclassified, 3.1 km, **offroad** by surface: `surface=G`
- [w612839033](https://www.openstreetmap.org/way/612839033) tertiary, 3 km, **offroad** by surface: `surface=Blacktopped`

## Papua New Guinea (pg), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `papua-new-guinea-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 0 | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 1,074 | 51.5% | 48.5% | 0.0% | 0.0% |
| primary | 2,210 | 22.8% | 66.6% | 8.1% | 2.6% |
| secondary | 3,089 | 20.0% | 55.6% | 9.5% | 14.9% |
| tertiary | 12,461 | 3.8% | 41.3% | 3.1% | 51.7% |
| unclassified | 23,367 | 0.4% | 41.7% | 1.8% | 56.2% |
| residential | 7,378 | 2.2% | 43.0% | 1.2% | 53.6% |
| **All** | 49,577 | 4.8% | 43.9% | 2.8% | 48.5% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 51.5% | 0.0% | 0.0% | 0.0% |
| primary | 33.4% | 0.4% | 0.0% | 0.0% |
| secondary | 44.4% | 0.0% | 0.0% | 0.0% |
| tertiary | 57.8% | 1.3% | 0.3% | 0.1% |
| unclassified | 58.1% | 0.9% | 0.8% | 0.0% |
| residential | 56.9% | 0.1% | 0.3% | 0.0% |
| **All** | 55.7% | 0.8% | 0.5% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 51.5% | 0.0% | 0.0% | 0.0% | 48.5% |
| primary | 33.0% | 0.4% | 0.0% | 0.0% | 66.6% |
| secondary | 44.4% | 0.0% | 0.0% | 0.0% | 55.6% |
| tertiary | 57.1% | 1.3% | 0.3% | 0.0% | 41.3% |
| unclassified | 56.7% | 0.9% | 0.7% | 0.0% | 41.7% |
| residential | 56.6% | 0.1% | 0.3% | 0.0% | 43.0% |
| **All** | 54.8% | 0.8% | 0.5% | 0.0% | 43.9% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | none | none |
| primary | `surface=gravel` 163, `smoothness=intermediate` 8, `surface=compacted` 8 | `surface=dirt` 56 |
| secondary | `surface=gravel` 246, `surface=compacted` 48 | `surface=unpaved` 267, `surface=dirt` 172, `surface=ground` 20 |
| tertiary | `surface=gravel` 364, `smoothness=bad` 16, `smoothness=intermediate` 3 | `surface=unpaved` 4,677, `surface=dirt` 1,290, `surface=ground` 288 |
| unclassified | `surface=gravel` 354, `surface=compacted` 36, `tracktype=grade2` 23 | `surface=unpaved` 8,234, `surface=dirt` 3,480, `surface=ground` 906 |
| residential | `surface=gravel` 76, `tracktype=grade2` 5, `smoothness=bad` 3 | `surface=unpaved` 2,016, `surface=dirt` 1,502, `surface=ground` 373 |
| **All** | `surface=gravel` 1,204, `surface=compacted` 95, `tracktype=grade2` 28 | `surface=unpaved` 15,193, `surface=dirt` 6,500, `surface=ground` 1,587 |

All Paved values: `surface=asphalt` 1,392, `surface=paved` 894, `smoothness=good` 72, `tracktype=grade1` 38, `surface=concrete` 1, `surface=metal` 1, `surface=wood` 1, `surface=cobblestone` 1

### Unknown values (typos, local values): `surface=uno` 2, `surface=dirt/sand` 1, `surface=gound` 0

### Smoothness vs surface conflicts (km): `smoothness=good + surface=concrete:lanes` 1

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w41780128](https://www.openstreetmap.org/way/41780128) secondary, 37.3 km, **offroad** by surface: `surface=unpaved`
- [w844126856](https://www.openstreetmap.org/way/844126856) secondary, 34.4 km, **offroad** by surface: `surface=unpaved`
- [w531352027](https://www.openstreetmap.org/way/531352027) secondary, 33.3 km, **offroad** by surface: `surface=unpaved`
- [w219754577](https://www.openstreetmap.org/way/219754577) secondary, 24.8 km, **offroad** by surface: `surface=dirt`
- [w841361566](https://www.openstreetmap.org/way/841361566) secondary, 19.7 km, **offroad** by surface: `surface=dirt`
- [w316305541](https://www.openstreetmap.org/way/316305541) secondary, 17.3 km, **offroad** by surface: `surface=ground`
- [w428222204](https://www.openstreetmap.org/way/428222204) secondary, 16.7 km, **offroad** by surface: `surface=dirt`
- [w404374087](https://www.openstreetmap.org/way/404374087) secondary, 14.4 km, **offroad** by surface: `surface=dirt`
- [w803766319](https://www.openstreetmap.org/way/803766319) secondary, 14.3 km, **offroad** by surface: `surface=dirt`
- [w546431892](https://www.openstreetmap.org/way/546431892) secondary, 14.1 km, **offroad** by surface: `surface=dirt`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

- [w936827286](https://www.openstreetmap.org/way/936827286) residential, 1.6 km, **offroad** by surface: `surface=uno`
- [w1060995609](https://www.openstreetmap.org/way/1060995609) residential, 0.6 km, **offroad** by surface: `surface=dirt/sand`

## Senegal (sn), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `senegal-and-gambia-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 624 | 62.5% | 37.5% | 0.0% | 0.0% |
| trunk | 1,865 | 94.7% | 2.9% | 1.7% | 0.7% |
| primary | 3,200 | 90.3% | 0.9% | 3.5% | 5.3% |
| secondary | 4,227 | 30.2% | 2.5% | 25.9% | 41.4% |
| tertiary | 9,633 | 8.6% | 3.3% | 28.6% | 59.5% |
| unclassified | 57,523 | 0.5% | 27.7% | 4.1% | 67.7% |
| residential | 36,425 | 1.4% | 46.1% | 0.4% | 52.1% |
| **All** | 113,498 | 7.0% | 29.5% | 5.7% | 57.8% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 62.5% | 0.0% | 0.0% | 0.0% |
| trunk | 97.1% | 4.7% | 0.0% | 0.0% |
| primary | 99.1% | 6.2% | 0.6% | 0.0% |
| secondary | 97.4% | 8.6% | 9.9% | 0.0% |
| tertiary | 95.1% | 7.2% | 13.3% | 0.0% |
| unclassified | 70.6% | 2.8% | 7.0% | 0.0% |
| residential | 53.4% | 0.1% | 1.0% | 0.0% |
| **All** | 69.3% | 2.7% | 5.4% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 62.5% | 0.0% | 0.0% | 0.0% | 37.5% |
| trunk | 93.8% | 3.4% | 0.0% | 0.0% | 2.9% |
| primary | 94.2% | 4.4% | 0.5% | 0.0% | 0.9% |
| secondary | 84.3% | 8.6% | 4.5% | 0.0% | 2.5% |
| tertiary | 78.5% | 7.2% | 11.0% | 0.0% | 3.3% |
| unclassified | 63.8% | 2.8% | 5.7% | 0.0% | 27.7% |
| residential | 52.8% | 0.1% | 0.9% | 0.0% | 46.1% |
| **All** | 63.6% | 2.6% | 4.3% | 0.0% | 29.5% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 26, `smoothness=intermediate` 6 | `surface=unpaved` 12 |
| primary | `smoothness=bad` 52, `surface=compacted` 43, `tracktype=grade2` 18 | `surface=unpaved` 144, `surface=ground` 26 |
| secondary | `surface=compacted` 731, `smoothness=bad` 219, `tracktype=grade2` 139 | `surface=unpaved` 1,437, `surface=ground` 160, `smoothness=very_bad` 66 |
| tertiary | `surface=compacted` 1,535, `tracktype=grade2` 671, `smoothness=bad` 467 | `surface=unpaved` 3,743, `surface=ground` 1,140, `tracktype=grade3` 294 |
| unclassified | `tracktype=grade2` 1,178, `surface=compacted` 585, `smoothness=bad` 516 | `surface=unpaved` 21,051, `surface=ground` 12,850, `tracktype=grade3` 1,632 |
| residential | `tracktype=grade2` 54, `surface=compacted` 32, `surface=gravel` 29 | `surface=ground` 6,744, `surface=unpaved` 6,574, `surface=dirt` 4,333 |
| **All** | `surface=compacted` 2,926, `tracktype=grade2` 2,060, `smoothness=bad` 1,294 | `surface=unpaved` 32,960, `surface=ground` 20,920, `surface=dirt` 6,025 |

All Paved values: `surface=asphalt` 7,475, `smoothness=good` 208, `surface=paved` 185, `smoothness=excellent` 26, `surface=concrete` 16, `surface=paving_stones` 15, `tracktype=grade1` 13, `surface=wood` 1

### Unknown values (typos, local values): `smoothness=very_good` 82, `surface=dirt/sand` 5, `surface=sea shells` 5, `surface=unpaved_sand` 4, `surface=unpaved,_sand` 2, `surface=route` 1, `surface=bad` 1, `surface=ohne_straßenbelag22` 0, `surface=dirt2w2w` 0, `surface=d14_100` 0

### Smoothness vs surface conflicts (km): `smoothness=good + surface=unpaved` 49, `smoothness=excellent + surface=ground` 3, `smoothness=good + surface=cement` 1, `smoothness=good + surface=sand` 0, `smoothness=very_bad + surface=asphalt` 0, `smoothness=horrible + surface=concrete` 0

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w305374480](https://www.openstreetmap.org/way/305374480) secondary, 70.3 km, **offroad** by surface: `ref=R.06.1` `surface=ground`
- [w301425265](https://www.openstreetmap.org/way/301425265) secondary, 53.4 km, **offroad** by surface: `ref=R071` `surface=unpaved`
- [w340231331](https://www.openstreetmap.org/way/340231331) secondary, 48.3 km, **offroad** by surface: `ref=R.04.1` `surface=unpaved`
- [w186222987](https://www.openstreetmap.org/way/186222987) secondary, 45.1 km, **offroad** by surface: `ref=R.090` `surface=unpaved`
- [w178240339](https://www.openstreetmap.org/way/178240339) primary, 43.7 km, **offroad** by surface: `ref=N9` `surface=unpaved`
- [w220695201](https://www.openstreetmap.org/way/220695201) secondary, 38.8 km, **offroad** by surface: `ref=R.075` `surface=unpaved`
- [w31469115](https://www.openstreetmap.org/way/31469115) secondary, 32.9 km, **offroad** by surface: `ref=D11 100` `surface=unpaved`
- [w31281080](https://www.openstreetmap.org/way/31281080) secondary, 31.8 km, **offroad** by surface: `surface=unpaved`
- [w216521300](https://www.openstreetmap.org/way/216521300) secondary, 30.6 km, **offroad** by surface: `surface=unpaved`
- [w409556978](https://www.openstreetmap.org/way/409556978) secondary, 29.7 km, **offroad** by surface: `surface=unpaved`

### Longest smoothness vs surface conflicts

- [w286636828](https://www.openstreetmap.org/way/286636828) secondary, 44.3 km, **paved** by smoothness: `ref=R120` `surface=unpaved` `smoothness=good`
- [w301434742](https://www.openstreetmap.org/way/301434742) secondary, 2.8 km, **paved** by smoothness: `ref=R110` `surface=ground` `smoothness=excellent`
- [w371944339](https://www.openstreetmap.org/way/371944339) secondary, 0.9 km, **paved** by smoothness: `ref=R120` `surface=unpaved` `smoothness=good`
- [w371944343](https://www.openstreetmap.org/way/371944343) secondary, 0.7 km, **paved** by smoothness: `ref=R120` `surface=unpaved` `smoothness=good`
- [w371945212](https://www.openstreetmap.org/way/371945212) secondary, 0.6 km, **paved** by smoothness: `ref=R120` `surface=unpaved` `smoothness=good`

### Longest ways with unknown values

- [w410449685](https://www.openstreetmap.org/way/410449685) primary, 24.8 km, **paved** by surface: `ref=N 3` `surface=asphalt` `smoothness=very_good`
- [w409847729](https://www.openstreetmap.org/way/409847729) primary, 11.9 km, **paved** by surface: `ref=N 3` `surface=asphalt` `smoothness=very_good`
- [w23514340](https://www.openstreetmap.org/way/23514340) primary, 9.8 km, **paved** by surface: `ref=N 3` `surface=asphalt` `smoothness=very_good`
- [w681044583](https://www.openstreetmap.org/way/681044583) trunk, 9.5 km, **paved** by surface: `surface=asphalt` `smoothness=very_good`
- [w372992901](https://www.openstreetmap.org/way/372992901) trunk, 7.5 km, **paved** by surface: `surface=asphalt` `smoothness=very_good`
- [w683852042](https://www.openstreetmap.org/way/683852042) primary, 7.2 km, **paved** by surface: `ref=N 3` `surface=asphalt` `smoothness=very_good`
- [w372989418](https://www.openstreetmap.org/way/372989418) trunk, 7 km, **paved** by surface: `surface=asphalt` `smoothness=very_good`
- [w445673111](https://www.openstreetmap.org/way/445673111) unclassified, 4.1 km, **offroad** by surface: `surface=unpaved_sand`
- [w683852039](https://www.openstreetmap.org/way/683852039) primary, 3 km, **paved** by surface: `ref=N 3` `surface=asphalt` `smoothness=very_good`
- [w987517615](https://www.openstreetmap.org/way/987517615) unclassified, 1.7 km, **offroad** by surface: `surface=unpaved,_sand`

## Thailand (th), data 2026-10-30

Run 2026-11-02, classifier `892814b74563`, pipeline `a23eb48558d7`, osmium version 1.19.1, extract `clipped.osm.pbf`, data date from newest_object.

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

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 36.9% | 0.0% | 0.0% | 0.0% |
| trunk | 60.8% | 3.6% | 0.0% | 0.0% |
| primary | 59.5% | 5.5% | 0.0% | 0.0% |
| secondary | 57.9% | 6.0% | 0.0% | 0.0% |
| tertiary | 48.9% | 4.1% | 0.1% | 0.0% |
| unclassified | 39.9% | 2.8% | 0.9% | 0.0% |
| residential | 19.4% | 0.1% | 0.1% | 0.0% |
| **All** | 32.3% | 1.8% | 0.3% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 36.9% | 0.0% | 0.0% | 0.0% | 63.1% |
| trunk | 57.2% | 3.6% | 0.0% | 0.0% | 39.2% |
| primary | 54.0% | 5.5% | 0.0% | 0.0% | 40.5% |
| secondary | 52.1% | 6.0% | 0.0% | 0.0% | 42.0% |
| tertiary | 44.9% | 4.1% | 0.0% | 0.0% | 50.9% |
| unclassified | 36.8% | 2.8% | 0.6% | 0.0% | 59.9% |
| residential | 19.2% | 0.1% | 0.1% | 0.0% | 80.6% |
| **All** | 30.4% | 1.8% | 0.2% | 0.0% | 67.6% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | `smoothness=bad` 2, `smoothness=intermediate` 2 | none |
| primary | `smoothness=intermediate` 28, `smoothness=bad` 10, `tracktype=grade2` 1 | none |
| secondary | `smoothness=bad` 274, `smoothness=intermediate` 53, `tracktype=grade2` 3 | `smoothness=very_bad` 8, `surface=unpaved` 6, `surface=aas` 0 |
| tertiary | `smoothness=bad` 1,383, `surface=gravel` 160, `smoothness=intermediate` 157 | `surface=unpaved` 1,184, `smoothness=very_bad` 84, `surface=dirt` 79 |
| unclassified | `surface=gravel` 1,665, `smoothness=bad` 1,184, `tracktype=grade2` 327 | `surface=unpaved` 26,459, `smoothness=very_bad` 2,162, `surface=dirt` 808 |
| residential | `surface=gravel` 411, `surface=compacted` 200, `tracktype=grade2` 125 | `surface=unpaved` 45,505, `surface=dirt` 609, `surface=ground` 119 |
| **All** | `smoothness=bad` 2,935, `surface=gravel` 2,239, `tracktype=grade2` 465 | `surface=unpaved` 73,154, `smoothness=very_bad` 2,284, `surface=dirt` 1,496 |

All Paved values: `surface=asphalt` 63,127, `surface=paved` 43,107, `surface=concrete` 16,006, `smoothness=good` 3,323, `smoothness=excellent` 2,614, `tracktype=grade1` 371, `surface=concrete:plates` 119, `surface=paving_stones` 52

### Unknown values (typos, local values): `smoothness=rough` 14, `surface=dirt/sand` 10, `surface=as\` 3, `surface=partial unpaved` 3, `surface=residential` 3, `surface=ไม่ปรับผิวแ` 2, `surface=d` 2, `surface=gruspukk` 2, `smoothness=e4` 2, `surface=ถนน_ค.ส.ล.` 2, `smoothness=poor` 1, `surface=cement` 1

### Smoothness vs surface conflicts (km): `smoothness=horrible + surface=asphalt` 84, `smoothness=very_bad + surface=paved` 31, `smoothness=very_bad + surface=concrete` 24, `smoothness=excellent + surface=unpaved` 6, `smoothness=horrible + surface=concrete` 4, `smoothness=very_bad + surface=asphalt` 2, `smoothness=horrible + surface=paved` 1, `smoothness=good + surface=aas` 1

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w283410813](https://www.openstreetmap.org/way/283410813) secondary, 7.8 km, **offroad** by smoothness: `ref=1093` `surface=paved` `smoothness=very_bad`
- [w803763872](https://www.openstreetmap.org/way/803763872) secondary, 3.7 km, **offroad** by surface: `ref=4258` `surface=unpaved`
- [w766802650](https://www.openstreetmap.org/way/766802650) secondary, 1.3 km, **offroad** by surface: `ref=4276` `surface=unpaved`

### Longest smoothness vs surface conflicts

- [w285739641](https://www.openstreetmap.org/way/285739641) tertiary, 8.8 km, **offroad** by smoothness: `ref=กจ.3091` `surface=concrete` `smoothness=very_bad` description: "no surface 30km !!! (2023)"
- [w1446182984](https://www.openstreetmap.org/way/1446182984) unclassified, 8.4 km, **offroad** by smoothness: `surface=paved` `smoothness=very_bad`
- [w283410813](https://www.openstreetmap.org/way/283410813) secondary, 7.8 km, **offroad** by smoothness: `ref=1093` `surface=paved` `smoothness=very_bad`
- [w108883265](https://www.openstreetmap.org/way/108883265) unclassified, 6.3 km, **offroad** by smoothness: `surface=asphalt` `smoothness=horrible` note: "Cant find on DRR DB so unclassified."
- [w968692295](https://www.openstreetmap.org/way/968692295) unclassified, 6.2 km, **paved** by smoothness: `ref=ลป.4033` `surface=unpaved` `smoothness=excellent`
- [w117157431](https://www.openstreetmap.org/way/117157431) tertiary, 5 km, **offroad** by smoothness: `ref=ขก.2119` `surface=asphalt` `smoothness=horrible`
- [w164041755](https://www.openstreetmap.org/way/164041755) tertiary, 4.8 km, **offroad** by smoothness: `ref=ขก.3018` `surface=asphalt` `smoothness=horrible`
- [w108083183](https://www.openstreetmap.org/way/108083183) tertiary, 4.2 km, **offroad** by smoothness: `ref=ขก.3051` `surface=asphalt` `smoothness=horrible`
- [w1446182988](https://www.openstreetmap.org/way/1446182988) unclassified, 4.2 km, **offroad** by smoothness: `surface=paved` `smoothness=very_bad`
- [w157810206](https://www.openstreetmap.org/way/157810206) tertiary, 3.4 km, **offroad** by smoothness: `ref=ขก.3051` `surface=asphalt` `smoothness=horrible`

### Longest ways with unknown values

- [w758370819](https://www.openstreetmap.org/way/758370819) unclassified, 5.6 km, **offroad** by surface: `surface=dirt/sand`
- [w348763605](https://www.openstreetmap.org/way/348763605) unclassified, 3.5 km, **paved** by default: `smoothness=rough`
- [w231260566](https://www.openstreetmap.org/way/231260566) unclassified, 3.4 km, **offroad** by surface: `surface=as\`
- [w651342841](https://www.openstreetmap.org/way/651342841) unclassified, 2.8 km, **offroad** by surface: `surface=dirt/sand`
- [w528000707](https://www.openstreetmap.org/way/528000707) tertiary, 2.5 km, **paved** by surface: `surface=paved` `smoothness=rough` note: "Blue signs erected"
- [w656495391](https://www.openstreetmap.org/way/656495391) tertiary, 2.5 km, **paved** by surface: `ref=ลป.3045` `surface=asphalt` `smoothness=rough` note: "Potholed rough section, not exactly sure of start or finish."
- [w614975238](https://www.openstreetmap.org/way/614975238) residential, 2.4 km, **offroad** by surface: `surface=residential`
- [w538065687](https://www.openstreetmap.org/way/538065687) unclassified, 2 km, **offroad** by surface: `surface=ไม่ปรับผิวแ`
- [w626237739](https://www.openstreetmap.org/way/626237739) residential, 2 km, **offroad** by surface: `surface=d`
- [w1028568284](https://www.openstreetmap.org/way/1028568284) unclassified, 1.9 km, **offroad** by surface: `surface=gruspukk`

## Timor-Leste (tl), data 2026-11-01

Run 2026-11-02, classifier `892814b74563`, pipeline `fa32fb9837bf`, osmium version 1.19.1, extract `east-timor-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Rough | Off-road |
|---|--:|--:|--:|--:|--:|
| motorway | 62 | 0.0% | 100.0% | 0.0% | 0.0% |
| trunk | 40 | 97.5% | 2.5% | 0.0% | 0.0% |
| primary | 1,189 | 29.7% | 52.2% | 2.0% | 16.1% |
| secondary | 359 | 6.1% | 70.8% | 3.6% | 19.5% |
| tertiary | 988 | 3.2% | 69.9% | 3.1% | 23.7% |
| unclassified | 5,408 | 1.3% | 73.0% | 0.5% | 25.1% |
| residential | 1,447 | 1.6% | 84.2% | 1.4% | 12.8% |
| **All** | 9,492 | 5.6% | 71.6% | 1.2% | 21.5% |

Untagged: no usable `surface`, `smoothness`, `tracktype` or `4wd_only` value (includes unknown values with nothing else). Rendered as Paved.

### Tag coverage (% of km with the tag, any value)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` |
|---|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% |
| trunk | 97.5% | 0.0% | 0.0% | 0.0% |
| primary | 47.8% | 5.1% | 0.0% | 0.0% |
| secondary | 29.2% | 0.9% | 0.0% | 0.0% |
| tertiary | 30.1% | 1.0% | 1.9% | 0.0% |
| unclassified | 26.6% | 0.6% | 0.8% | 0.0% |
| residential | 15.8% | 0.1% | 0.1% | 0.0% |
| **All** | 28.2% | 1.1% | 0.7% | 0.0% |

### Deciding tag (% of km)

| Class | `surface` | `smoothness` | `tracktype` | `4wd_only` | none |
|---|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% |
| trunk | 97.5% | 0.0% | 0.0% | 0.0% | 2.5% |
| primary | 42.7% | 5.1% | 0.0% | 0.0% | 52.2% |
| secondary | 28.3% | 0.9% | 0.0% | 0.0% | 70.8% |
| tertiary | 27.4% | 1.0% | 1.6% | 0.0% | 69.9% |
| unclassified | 25.8% | 0.6% | 0.6% | 0.0% | 73.0% |
| residential | 15.6% | 0.1% | 0.1% | 0.0% | 84.2% |
| **All** | 26.8% | 1.1% | 0.5% | 0.0% | 71.6% |

### Deciding values for Rough and Off-road (km, top 3)

| Class | Rough | Off-road |
|---|---|---|
| motorway | none | none |
| trunk | none | none |
| primary | `surface=gravel` 18, `smoothness=intermediate` 3, `smoothness=bad` 3 | `surface=unpaved` 191, `surface=ground` 0 |
| secondary | `surface=compacted` 8, `smoothness=bad` 3, `surface=gravel` 2 | `surface=unpaved` 68, `surface=ground` 1, `smoothness=very_bad` 0 |
| tertiary | `tracktype=grade2` 16, `smoothness=bad` 10, `surface=gravel` 5 | `surface=unpaved` 147, `surface=ground` 75, `surface=dirt` 13 |
| unclassified | `smoothness=bad` 16, `surface=gravel` 7, `tracktype=grade2` 7 | `surface=ground` 733, `surface=unpaved` 580, `tracktype=grade4` 15 |
| residential | `surface=gravel` 18, `smoothness=intermediate` 1, `tracktype=grade2` 1 | `surface=ground` 106, `surface=unpaved` 78, `smoothness=very_bad` 1 |
| **All** | `surface=gravel` 49, `smoothness=bad` 31, `tracktype=grade2` 23 | `surface=unpaved` 1,064, `surface=ground` 915, `surface=dirt` 25 |

All Paved values: `surface=asphalt` 337, `surface=paved` 135, `smoothness=excellent` 40, `smoothness=good` 15, `tracktype=grade1` 9, `surface=concrete` 0, `surface=concrete:plates` 0, `surface=metal` 0

### Unknown values (typos, local values): `surface=ohne` 0, `surface=בלתי_סלול` 0, `surface=unpaved_pathway` 0

### Smoothness vs surface conflicts (km): none

### Motorway, trunk, primary, secondary classified Off-road or worse

- [w40678552](https://www.openstreetmap.org/way/40678552) primary, 23.6 km, **offroad** by surface: `surface=unpaved`
- [w170259503](https://www.openstreetmap.org/way/170259503) secondary, 15.6 km, **offroad** by surface: `surface=unpaved`
- [w168739844](https://www.openstreetmap.org/way/168739844) primary, 11.7 km, **offroad** by surface: `surface=unpaved`
- [w432830293](https://www.openstreetmap.org/way/432830293) secondary, 11.3 km, **offroad** by surface: `surface=unpaved`
- [w371812497](https://www.openstreetmap.org/way/371812497) primary, 10.2 km, **offroad** by surface: `surface=unpaved`
- [w40619777](https://www.openstreetmap.org/way/40619777) secondary, 8.8 km, **offroad** by surface: `surface=unpaved`
- [w40628111](https://www.openstreetmap.org/way/40628111) primary, 8.4 km, **offroad** by surface: `surface=unpaved`
- [w150773592](https://www.openstreetmap.org/way/150773592) primary, 7.9 km, **offroad** by surface: `surface=unpaved`
- [w550548492](https://www.openstreetmap.org/way/550548492) primary, 7.6 km, **offroad** by surface: `surface=unpaved`
- [w40628148](https://www.openstreetmap.org/way/40628148) primary, 7.3 km, **offroad** by surface: `surface=unpaved`

### Longest smoothness vs surface conflicts

None of 0.5 km or more.

### Longest ways with unknown values

None of 0.5 km or more.

