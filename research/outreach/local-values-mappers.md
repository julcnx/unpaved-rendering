# Changeset comments: undocumented local paved values (drafts, not sent)

Status 2026-11-16: drafts only, nothing sent. Following Mateusz Konieczny's advice in [post 12](https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12): no bot for these values, ask the mappers first. Values, meanings and targets come from [surface-values.md](surface-values.md); km per country in [../stats/unknown-values.md](../stats/unknown-values.md). Send after the two bot threads are up ([bot-cement-brick.md](bot-cement-brick.md)), before the reply to Mateusz.

Follow-up: if a mapper has not answered after 14 days, retag by hand only where the target is clear (`dbst` family → `chipseal`), and leave `Blacktopped` and `ottaseal` to the [Nepal topic](https://community.openstreetmap.org/t/surface-values-ottaseal-and-blacktopped-in-nepal/150053) (no replies yet on 2026-11-16).

## Method

- Ways: Postpass (Geofabrik, current OSM data, 2026-11-16), all objects with any of the nine values. Overpass was overloaded on every public instance, so no Geofabrik extracts were needed. 140 ways, all ways, matching taginfo.
- Left out: 3 `blacktop` ways outside Cambodia and Nepal (2 in the USA, 1 in Bhutan).
- For each way, the OSM API history: the version that first set the current value (start of the last unbroken run with that value), its changeset and user. 134 ways had no `surface` before, 3 had `unpaved`, 3 had `asphalt`.
- One changeset per user: the one that set the value on the most ways; if tied, the most recent.

## Template

Post as a changeset comment (open the changeset link, comment box at the bottom). Fill the `{}` parts from the table. The Nepal line is only for Nepali mappers, the split line only for the one Cambodian mapper with mixed values.

```text
Hi, and thanks for mapping these roads! In this changeset you tagged {N} road(s) with surface={value}. This value is not documented on the OSM wiki, so many maps and routers do not know it and treat these roads as unpaved.

{value} means {meaning}, so I would suggest surface={target}: {target link}

Do you agree? If yes, would you like to retag them yourself, or are you OK if I do it?

[Nepal only] I also asked other mappers in Nepal here: https://community.openstreetmap.org/t/surface-values-ottaseal-and-blacktopped-in-nepal/150053

[Split only] Two of your roads use surface=dbst_and_concreate and surface=dbst_and_gravek. Could they be split into parts with surface=chipseal and surface=concrete (or gravel)?
```

Fill-ins:

| `{value}` | `{meaning}` | `{target}` | `{target link}` |
|---|---|---|---|
| `dbst`, `DBST`, `dbst_pavement`, `double_bitumenous_surface_treatment` | double bituminous surface treatment (DBST), a two-layer chip seal | `chipseal` | https://wiki.openstreetmap.org/wiki/Tag:surface%3Dchipseal |
| `ottaseal` | Otta seal, a bitumen seal laid with graded natural gravel | `chipseal` | https://wiki.openstreetmap.org/wiki/Tag:surface%3Dchipseal |
| `Blacktopped`, `blacktop` | a road with a bitumen (black-top) surface | `asphalt` (or `chipseal` if it is a surface dressing) | https://wiki.openstreetmap.org/wiki/Tag:surface%3Dasphalt |

For a mapper with several values (first row), name the main one and add "(and {other values})".

Example, filled in (Cambodia):

```text
Hi, and thanks for mapping these roads! In this changeset you tagged 6 roads with surface=dbst. This value is not documented on the OSM wiki, so many maps and routers do not know it and treat these roads as unpaved.

dbst means double bituminous surface treatment (DBST), a two-layer chip seal, so I would suggest surface=chipseal: https://wiki.openstreetmap.org/wiki/Tag:surface%3Dchipseal

Do you agree? If yes, would you like to retag them yourself, or are you OK if I do it?
```

## Changesets to comment on

"Ways (cs)" is the number of ways whose value was set in that changeset; "Ways (all)" is all ways the user set. "Last active" is the user's latest changeset: comments to long-inactive users may get no answer.

### Cambodia (7 users, 35 ways)

| User | Changeset | Value | Ways (cs) | Ways (all) | Last active |
|---|---|---|---|---|---|
| thebMeta | [140918137](https://www.openstreetmap.org/changeset/140918137) (2023-09-07) | `dbst_pavement` (also `dbst` 7, `double_bitumenous_surface_treatment` 1) | 3 | 12 | 2026-08 |
| Somony | [189715837](https://www.openstreetmap.org/changeset/189715837) (2026-09-29) | `dbst` (also `dbst_and_concreate` 1, `dbst_and_gravek` 1): add the split line | 1 | 10 | 2026-09 |
| \_varman\_ | [175435283](https://www.openstreetmap.org/changeset/175435283) (2025-12-03) | `dbst` | 6 | 6 | 2026-10 |
| imiii | [169588361](https://www.openstreetmap.org/changeset/169588361) (2025-07-28) | `DBST` | 2 | 2 | 2026-11 |
| LeopoldCanal | [145902036](https://www.openstreetmap.org/changeset/145902036) (2024-01-05) | `dbst` | 2 | 2 | 2024-09 |
| FerganaValley | [143718703](https://www.openstreetmap.org/changeset/143718703) (2023-11-07) | `dbst` | 2 | 2 | 2025-02 |
| Theb Meta | [71085734](https://www.openstreetmap.org/changeset/71085734) (2019-06-10) | `DBST` | 1 | 1 | 2025-08 |

Notes: thebMeta and Somony map road projects (changeset comments name the World Bank disaster-risk project in Kratie and MRD rural roads) and cover 22 of the 35 ways and most of the km, so they are the ones that matter. Somony's 10 ways are in 10 changesets, one way each, so the most recent one is used. "Theb Meta" and "thebMeta" are two accounts (uid 10065077 and 17511293), maybe the same person: comment on both.

### Nepal (11 users, 102 ways)

| User | Changeset | Value | Ways (cs) | Ways (all) | Last active |
|---|---|---|---|---|---|
| prabesh chapagain | [61247913](https://www.openstreetmap.org/changeset/61247913) (2018-08-01) | `Blacktopped` | 79 | 80 | 2022-01 |
| Heinz_V | [35125079](https://www.openstreetmap.org/changeset/35125079) (2015-11-06) | `ottaseal` | 6 | 8 | 2026-03 |
| Ujjwal Dahal | [32998816](https://www.openstreetmap.org/changeset/32998816) (2015-07-31) | `ottaseal` | 1 | 3 | 2015-08 |
| srj_panthee | [169656166](https://www.openstreetmap.org/changeset/169656166) (2025-07-29) | `Blacktopped` | 2 | 2 | 2026-11 |
| cartorhythm | [77706795](https://www.openstreetmap.org/changeset/77706795) (2019-11-29) | `Blacktopped` | 1 | 2 | 2022-01 |
| Anil Basnet | [113787584](https://www.openstreetmap.org/changeset/113787584) (2021-11-15) | `ottaseal` | 1 | 2 | 2026-11 |
| Bimalpokhrel | [176343373](https://www.openstreetmap.org/changeset/176343373) (2025-12-24) | `ottaseal` | 1 | 1 | 2026-01 |
| Lalit_IAAS | [128806605](https://www.openstreetmap.org/changeset/128806605) (2022-11-12) | `ottaseal` | 1 | 1 | 2026-10 |
| Chiranshivapurnepal | [127397755](https://www.openstreetmap.org/changeset/127397755) (2022-10-12) | `Blacktopped` | 1 | 1 | 2023-12 |
| drdangi | [32998301](https://www.openstreetmap.org/changeset/32998301) (2015-07-31) | `ottaseal` | 1 | 1 | 2015-07 |
| MeghaShrestha | [32668942](https://www.openstreetmap.org/changeset/32668942) (2015-07-16) | `blacktop` | 1 | 1 | 2023-02 |

Notes: one changeset (79 of the 85 `Blacktopped` ways, comment "its actual survey data") is the main case, but that mapper has been inactive since 2022, so the Nepal topic matters more for `Blacktopped`. Heinz_V and Ujjwal Dahal hold most of the `ottaseal` km. Ujjwal Dahal and drdangi have been inactive since 2015. Three users mapped in HOT Tasking Manager projects (`#hotosm-project-...`).

Total: 18 users, 137 ways.
