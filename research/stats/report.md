# Road drivability statistics

## Overview

Share of km that is Unpaved per class (with or without the Off-road mark), sorted by tertiary. Off-road mark and Untagged: share of all road km.

| Country | Data | Trunk | Primary | Secondary | Tertiary | Unclassified | Off-road mark | Untagged | km |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Timor-Leste | 2026-11-01 | 0% | 18% | 22% | 27% | 25% | 0.2% | 71.6% | 9,492 |

## Timor-Leste (tl), data 2026-11-01

Run 2026-11-02, classifier `0a018a8853bb`, pipeline `9767283de3b6`, osmium version 1.19.1, extract `east-timor-latest.osm.pbf`, data date from header.

| Class | km | Paved (tagged) | Untagged | Unpaved | of which Off-road mark |
|---|--:|--:|--:|--:|--:|
| motorway | 62 | 0.0% | 100.0% | 0.0% | 0.0% |
| trunk | 40 | 97.5% | 2.5% | 0.0% | 0.0% |
| primary | 1,189 | 29.9% | 52.2% | 17.8% | 0.0% |
| secondary | 359 | 6.9% | 70.8% | 22.3% | 0.1% |
| tertiary | 987 | 3.4% | 69.9% | 26.6% | 0.0% |
| unclassified | 5,408 | 1.4% | 73.1% | 25.5% | 0.4% |
| residential | 1,447 | 1.7% | 84.2% | 14.2% | 0.1% |
| **All** | 9,492 | 5.8% | 71.6% | 22.5% | 0.2% |

Untagged: no `surface` and no known `tracktype`, so the road is assumed paved. Paved (tagged) + Untagged + Unpaved = 100%. The Off-road mark is the part of Unpaved with off-road evidence (`smoothness`, `tracktype`, `4wd_only`).

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

| Class | Base: `surface` | Base: `tracktype` | Base: none | Mark: `smoothness` | Mark: `tracktype` | Mark: `4wd_only` |
|---|--:|--:|--:|--:|--:|--:|
| motorway | 0.0% | 0.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| trunk | 97.5% | 0.0% | 2.5% | 0.0% | 0.0% | 0.0% |
| primary | 47.8% | 0.0% | 52.2% | 0.0% | 0.0% | 0.0% |
| secondary | 29.2% | 0.0% | 70.8% | 0.1% | 0.0% | 0.0% |
| tertiary | 30.1% | 0.0% | 69.9% | 0.0% | 0.0% | 0.0% |
| unclassified | 26.6% | 0.3% | 73.1% | 0.3% | 0.1% | 0.0% |
| residential | 15.8% | 0.0% | 84.2% | 0.0% | 0.0% | 0.0% |
| **All** | 28.2% | 0.2% | 71.6% | 0.2% | 0.1% | 0.0% |

### Deciding values for Unpaved and the Off-road mark (km, top 3)

| Class | Unpaved | Off-road mark |
|---|---|---|
| motorway | none | none |
| trunk | none | none |
| primary | `surface=unpaved` 191, `surface=gravel` 20, `surface=ground` 0 | none |
| secondary | `surface=unpaved` 69, `surface=compacted` 8, `surface=gravel` 2 | `smoothness=very_bad` 0 |
| tertiary | `surface=unpaved` 147, `surface=ground` 75, `surface=dirt` 29 | none |
| unclassified | `surface=ground` 747, `surface=unpaved` 587, `surface=dirt` 22 | `smoothness=very_bad` 14, `tracktype=grade4` 7, `smoothness=very_horrible` 1 |
| residential | `surface=ground` 107, `surface=unpaved` 78, `surface=gravel` 18 | `smoothness=very_bad` 1, `tracktype=grade3` 0 |
| **All** | `surface=unpaved` 1,072, `surface=ground` 929, `surface=gravel` 63 | `smoothness=very_bad` 15, `tracktype=grade4` 7, `smoothness=very_horrible` 1 |

### Unknown values (typos, local values): `surface=ohne` 0, `surface=בלתי_סלול` 0, `surface=unpaved_pathway` 0

### Conflicts (km): `paved (surface=asphalt) + tracktype=grade4` 8

### Longest Unpaved motorway, trunk, primary, secondary

- [w40678552](https://www.openstreetmap.org/way/40678552) primary, 23.6 km, **unpaved**: `surface=unpaved`
- [w170259503](https://www.openstreetmap.org/way/170259503) secondary, 15.6 km, **unpaved**: `surface=unpaved`
- [w40678547](https://www.openstreetmap.org/way/40678547) primary, 13.6 km, **unpaved**: `surface=gravel`
- [w168739844](https://www.openstreetmap.org/way/168739844) primary, 11.7 km, **unpaved**: `surface=unpaved`
- [w432830293](https://www.openstreetmap.org/way/432830293) secondary, 11.3 km, **unpaved**: `surface=unpaved`
- [w371812497](https://www.openstreetmap.org/way/371812497) primary, 10.2 km, **unpaved**: `surface=unpaved`
- [w40619777](https://www.openstreetmap.org/way/40619777) secondary, 8.8 km, **unpaved**: `surface=unpaved`
- [w40628111](https://www.openstreetmap.org/way/40628111) primary, 8.4 km, **unpaved**: `surface=unpaved`
- [w150773592](https://www.openstreetmap.org/way/150773592) primary, 7.9 km, **unpaved**: `surface=unpaved`
- [w550548492](https://www.openstreetmap.org/way/550548492) primary, 7.6 km, **unpaved**: `surface=unpaved`

### Longest ways with the Off-road mark

- [w650377682](https://www.openstreetmap.org/way/650377682) unclassified, 7 km, **offroad**: `surface=dirt` `smoothness=very_bad` `tracktype=grade2`
- [w296128192](https://www.openstreetmap.org/way/296128192) unclassified, 5.4 km, **offroad**: `tracktype=grade4`
- [w1003341065](https://www.openstreetmap.org/way/1003341065) unclassified, 3.6 km, **offroad**: `surface=unpaved` `smoothness=very_bad`
- [w650837122](https://www.openstreetmap.org/way/650837122) unclassified, 3.5 km, **offroad**: `surface=gravel` `smoothness=very_bad` `tracktype=grade2`
- [w1086017771](https://www.openstreetmap.org/way/1086017771) unclassified, 0.9 km, **offroad**: `tracktype=grade4`
- [w917236343](https://www.openstreetmap.org/way/917236343) residential, 0.7 km, **offroad**: `surface=dirt` `smoothness=very_bad` `tracktype=grade2`

### Longest conflicts (off-road evidence on paved roads, smoothness excellent or good on unpaved)

- [w1104497784](https://www.openstreetmap.org/way/1104497784) unclassified, 3.9 km, **paved**: `surface=asphalt` `tracktype=grade4`
- [w1083681969](https://www.openstreetmap.org/way/1083681969) unclassified, 2.2 km, **paved**: `surface=asphalt` `tracktype=grade4`
- [w1126287032](https://www.openstreetmap.org/way/1126287032) unclassified, 1.3 km, **paved**: `surface=asphalt` `tracktype=grade4`
- [w1104497789](https://www.openstreetmap.org/way/1104497789) unclassified, 0.9 km, **paved**: `surface=asphalt` `tracktype=grade4`

### Longest ways with unknown values

None of 0.5 km or more.

