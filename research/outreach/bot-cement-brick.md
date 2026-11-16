# Bot proposals: `surface=cement` → `concrete`, `surface=brick` → `bricks` (drafts, not posted)

Status 2026-11-16: drafts only, nothing posted. Mateusz Konieczny offered to run both worldwide if someone writes the proposals (forum thread and wiki page) and answers the comments ([post 12](https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12)). The local values (`dbst`, `ottaseal`, `Blacktopped`) are not part of this: see [local-values-mappers.md](local-values-mappers.md).

Order:

1. Publish both wiki pages (section 4), then post both threads (section 3) with the wiki links filled in.
2. Put each thread link into its wiki page (Discussion section and `discussion_url` in the code).
3. Send the changeset comments ([local-values-mappers.md](local-values-mappers.md)).
4. Reply to Mateusz in the bot thread (section 5) with the two thread links.

## 1. Findings

Data: every object with the value, from Postpass (Geofabrik, current OSM data, 2026-11-16). Overpass was overloaded on every public instance and the ohsome API returned 403, so Postpass replaced both. Countries from Natural Earth 50 m borders. Country totals match Geofabrik's regional taginfo. Scripts and raw data were in the session scratchpad (not kept).

### `surface=cement`

- 2,688 objects: 2,653 ways, 21 relations, 14 nodes. Flat since 2022 (3,306 in 2021, 2,412 in 2022 after the US bot and the [MapRoulette challenge](https://community.openstreetmap.org/t/mysterious-surface-cement/5158/4), 2,688 now).
- On `highway=*`: 812 objects, 118 km. Mostly footway (316), service (122), residential (110), steps (67), path (59). Only 12 secondary and 10 tertiary.
- Top countries (all objects): USA 1,078, Iran 501, Italy 202, Indonesia 139, Spain 133, Mexico 131, Greece 79, India 66, China 46, Brazil 45.
- **The US bot ran**: only 3 US `highway=*` objects still have `cement` (2 bus stops, 1 footway). The 1,078 US objects left are almost all from one 2010 park-facilities import: picnic sites (289), benches (181), waste baskets (240), drinking fountains (63), signs (35), pitches and objects with no main tag (`category=PUBLIC FACILITIES`), with notes like "STAMPED CONCRETE".
- Iran: 493 `leisure=pitch` from one mapper in 2019 (concrete courts).
- Non-plain cases found:
  - Street furniture (benches, waste baskets, fountains, signs, about 520, US import): `surface` may describe the object's material or the pad under it. Not clear, so leave out.
  - `waterway=drain` (23, US), streams: a lined channel, not a ground surface. Leave out.
  - Tracks with `tracktype=grade2` to `grade4` (6 ways, Italy, France, Spain): could be broken concrete strips or something else. Leave out. Tracks with `grade1` (Italy, Spain, Switzerland, Korea) are plain concrete farm tracks: keep.
  - No sign of cement-stabilised soil: no note, description or tag hints at it in the 2,688 objects.
- 2022 thread objections: one mapper was against a bot because `surface` can sit on roofs, retaining walls and so on ([post 29](https://community.openstreetmap.org/t/mysterious-surface-cement/5158/29)). The feature list below answers that. Several posts confirm that "cement" means concrete in everyday Swedish, German, Croatian, French and Italian use (posts 2, 5, 7, 26, 28).

### `surface=brick`

- 8,326 objects: 8,142 ways, 119 nodes, 65 relations. Growing by 700 to 900 a year (4,097 in 2020, 6,417 in 2023, 8,326 now), so a recurring run makes sense.
- On `highway=*`: 7,871 objects, 579 km. Footway 4,189 (many `footway=sidewalk`), residential 1,256, service 1,050, steps 402, pedestrian 329, path 200, tertiary 108.
- Top countries: USA 6,254 (75%), UK 936, Australia 181, Italy 156, Canada 122, Germany 117, Mexico 85, South Africa 66.
- Non-plain cases: 75 objects where `surface` likely means the object's own material (buildings 18, `barrier=wall` 6, benches 7, artwork 7, weirs, a threshing floor, objects with no main tag). For those the right fix is `material=brick` or `building:material=brick` by hand, not `bricks`.
- Taginfo projects that name the value itself (Arnis, Berliner Spielplatzkarte) also support `bricks` and `concrete`, so nothing breaks.

### Spot check

15 random objects of each (Python `random.seed(20261116)`), plus every object with `note`, `description` or `fixme` (about 55 per value), plus all cement objects with `tracktype` or bad `smoothness` (32).

- Cement sample: 5 Iran pitches, 9 from the US import (benches, waste baskets, picnic sites, one object with no main tag), 2 sidewalks (Mexico, Brazil), 1 service road (Ecuador). All plain mistakes for concrete; the furniture ones are the unclear group above.
- Brick sample: 9 footways, 4 residential and 1 tertiary street, 1 crossing node, 1 pedestrian area; 14 of 15 in the US. All plain.
- Notes and descriptions confirm the plain reading ("STAMPED CONCRETE", "Historische Ziegelpflasterstraße", "BRICK ROAD ORIGINALLY PART OF BAYBORO SUBDIVISION"). None points to a different material.

### Scope for both bots

Edit an object only if it is not a building and has one of:

- `highway=*` (any value, ways, nodes and relations), `area:highway=*`, `traffic_calming=*`
- `amenity=parking`, `parking_space`, `bicycle_parking`, `motorcycle_parking`
- `leisure=pitch`, `track`, `playground`, `sports_centre`, `park`, `outdoor_seating`, `schoolyard`
- `tourism=picnic_site`, `camp_site`, `camp_pitch`
- `place=square`, `railway=platform`, `public_transport=platform`, `man_made=pier`, `man_made=bridge`, `barrier=kerb`, `barrier=traffic_island`

Cement only: skip `highway=track` with a `tracktype` other than `grade1`.

| | All objects | Edited | Left out |
|---|---|---|---|
| `cement` | 2,688 | 1,924 (812 on `highway=*`) | 764: US import furniture and no-main-tag objects (about 670), drains, 6 tracks, buildings, a few others |
| `brick` | 8,326 | 8,251 (7,871 on `highway=*`) | 75: buildings, walls, benches, artwork, weirs, no main tag |

## 2. One thread or two

Two threads (your lean is right):

- Different risk. `brick` → `bricks` is a plural spelling fix with no meaning change. `cement` → `concrete` changes the word, has the 2022 language debate, and has a large group left out on purpose. Objections to cement should not block brick.
- Mateusz needs a "clearly accepted" result per bot, and each bot has its own wiki page and changeset `discussion_url`. One thread per bot keeps each approval clean.
- Same shape and same scope list in both, so the second costs little.

Where: [General talk](https://community.openstreetmap.org/c/general/38), tag `bot`, like Mateusz's worldwide proposals ([paved= duplicates](https://community.openstreetmap.org/t/surface-duplicated-by-paved-bot-edit-proposal/138817), [duplicate tags](https://community.openstreetmap.org/t/148926)). The code of conduct accepts the forum for a worldwide edit. Optional: one line in the United States category for brick (75% of the objects), linking the thread.

## 3. Forum posts

### 3a. Cement

Post at: https://community.openstreetmap.org/new-topic?category=general (category General talk, tag `bot`)

Title: `Proposed bot edit: surface=cement to surface=concrete worldwide (recurring)`

```markdown
I propose to replace `surface=cement` with `surface=concrete` worldwide, on roads, paths and other ground surfaces. Mateusz Konieczny would run it with his bot account, as he offered here: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12. I wrote the proposal and I will answer comments.

Wiki page: [placeholder: wiki page link]

**Background**

`surface=cement` was discussed in 2022 (https://community.openstreetmap.org/t/mysterious-surface-cement/5158) and marked deprecated on the wiki, with `concrete` as the replacement. In many languages "cement" is the everyday word for concrete. A bot already did this on US roads and paths: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_USA_roads_and_paths. Software that reads `surface` usually knows only the documented values, so these ways end up with an unknown surface (and on some maps as unpaved).

**What would change**

2,688 objects have `surface=cement` today (Iran, Italy, Indonesia, Spain, Mexico, Greece, India and others). The bot would edit about 1,920 of them: any `highway=*`, `area:highway=*`, parking, pitches, playgrounds, picnic sites, squares, platforms, piers, kerbs.

It would **not** touch:

- buildings, and anything where `surface` may mean the material of the object itself: benches, waste baskets, drinking fountains, signs (about 520, mostly one 2010 US import)
- waterways (lined drains)
- tracks with `tracktype=grade2` or worse (6 ways, to check by hand)
- objects with no clear main tag

I checked 15 random objects and every object with a `note`, `description` or `fixme`: all were plain concrete, and I found no case of cement-stabilised soil.

It would be recurring, so new `surface=cement` on these features gets fixed too.

Any objections, or features that should be added or removed from the list?
```

### 3b. Brick

Post at: https://community.openstreetmap.org/new-topic?category=general (category General talk, tag `bot`)

Title: `Proposed bot edit: surface=brick to surface=bricks worldwide (recurring)`

```markdown
I propose to replace `surface=brick` with `surface=bricks` worldwide, on roads, paths and other ground surfaces. Mateusz Konieczny would run it with his bot account, as he offered here: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12. I wrote the proposal and I will answer comments.

Wiki page: [placeholder: wiki page link]

**Background**

The documented value is `surface=bricks`; https://wiki.openstreetmap.org/wiki/Tag:surface%3Dbrick redirects there. Same meaning, only the plural is missing. Software that reads `surface` usually knows only the documented values, so `brick` streets and sidewalks end up with an unknown surface (and on some maps as unpaved). The value keeps growing: about 4,100 objects in 2020, 8,326 today.

**What would change**

The bot would edit about 8,250 objects: any `highway=*` (mostly sidewalks, residential and service roads, steps), `area:highway=*`, parking, pitches, squares, platforms, kerbs. About 75% are in the USA, 11% in the UK.

It would **not** touch about 75 objects where `surface` probably means the material of the object itself: buildings, walls, benches, artwork, weirs, objects with no clear main tag. Those need `material=brick` by hand, not `bricks`.

I checked 15 random objects and every object with a `note`, `description` or `fixme`: all were plain brick paving.

It would be recurring, so new `surface=brick` gets fixed too.

Any objections?
```

## 4. Wiki pages

Both pages go in [Category:Automated edits log](https://wiki.openstreetmap.org/wiki/Category:Automated_edits_log) (the category line is at the bottom; the Repetition include adds Category:Automated edits). Same sections as the US page. The source code mirrors the US page and uses Mateusz's library; he may replace it with his current version.

### 4a. Cement

Create at: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_worldwide

```mediawiki
__NOTOC__Page content created as advised on [[Automated_Edits_code_of_conduct#Document_and_discuss_your_plans]].

This edit will replace {{tag|surface|cement}} by {{tag|surface|concrete}} worldwide, on roads, paths and other ground surfaces.

== Who ==
[[User:Mateusz Konieczny|Mateusz Konieczny]] using [https://www.openstreetmap.org/user/Mateusz%20Konieczny%20-%20bot%20account his bot account].

The proposal was written by [[User:Julcnx|Julcnx]], who also answers the discussion.

=== contact===
About the proposal: [https://www.openstreetmap.org/message/new/julcnx message Julcnx via OSM].

About bot runs: [http://www.openstreetmap.org/message/new/Mateusz%20Konieczny message Mateusz Konieczny via OSM]. Messages to the bot account are also read, but his main account is preferable. English and Polish languages are preferable.

==What ==

This edit will replace {{tag|surface|cement}} by {{tag|surface|concrete}} worldwide, on roads, paths and other ground surfaces (see How for the list).

Buildings, street furniture, waterways and objects without a clear main tag will not be edited.

== Why ==
{{tag|surface|cement}} is deprecated, see [[Tag:surface=cement]] and https://community.openstreetmap.org/t/mysterious-surface-cement/5158 . In many languages "cement" is the everyday word for concrete, and cement alone is not used as a surface.

Data consumers usually do not know {{tag|surface|cement}}, so they treat these objects as having an unknown surface, and some maps show them as unpaved.

The same edit already runs on roads and paths in the USA: [[Mechanical Edits/Mateusz Konieczny - bot account/migrate surface=cement to surface=concrete on USA roads and paths]]. This edit extends it to the whole world and to other ground surfaces.

This value does NOT require manual review on the listed features. Random samples and all objects with {{key|note}}, {{key|description}} or {{key|fixme}} were checked in 2026-11 and were plain concrete.

==Numbers ==
As of 2026-11-16: 2,688 objects with {{tag|surface|cement}}, of which about 1,920 match the list below (812 with {{key|highway}}). Largest numbers in Iran, the USA (pitches and picnic sites only), Italy, Indonesia, Spain and Mexico.

After the first run, the number depends on how many new matches appear.

objects affected by the next run: [placeholder: overpass-turbo link]

== How ==
Each changeset contains a single element or group of close elements to avoid edits spanning across large areas.

Changeset would be described and tagged with tags that mark it as automatic, provide link to discussion approving edit and to this documentation page.

An object is edited only if it has no {{key|building}} or {{key|building:part}} tag and has one of:
* {{key|highway}} (any value), {{key|area:highway}}, {{key|traffic_calming}}
* {{tag|amenity|parking}}, {{tag|amenity|parking_space}}, {{tag|amenity|bicycle_parking}}, {{tag|amenity|motorcycle_parking}}
* {{tag|leisure|pitch}}, {{tag|leisure|track}}, {{tag|leisure|playground}}, {{tag|leisure|sports_centre}}, {{tag|leisure|park}}, {{tag|leisure|outdoor_seating}}, {{tag|leisure|schoolyard}}
* {{tag|tourism|picnic_site}}, {{tag|tourism|camp_site}}, {{tag|tourism|camp_pitch}}
* {{tag|place|square}}, {{tag|railway|platform}}, {{tag|public_transport|platform}}, {{tag|man_made|pier}}, {{tag|man_made|bridge}}, {{tag|barrier|kerb}}, {{tag|barrier|traffic_island}}

{{tag|highway|track}} with a {{key|tracktype}} other than {{tag|tracktype|grade1}} is not edited.

state before a mechanical edit: <br>

*{{Tag|surface|cement}}
*{{Tag|highway|tertiary}}

state after a mechanical edit: <br>

*{{Tag|surface|concrete}}
*{{Tag|highway|tertiary}}

=== Ignored object example ===

*{{tag|surface|cement}}
*{{tag|amenity|bench}}

will not be edited

*{{tag|surface|cement}}
*{{tag|highway|track}}
*{{tag|tracktype|grade3}}

will not be edited

== Discussion ==
* [placeholder: forum thread link]
* https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12 (offer to run it)
* https://community.openstreetmap.org/t/mysterious-surface-cement/5158 (2022 discussion, deprecation)

== Repetition ==
{{:Mechanical Edits/Mateusz Konieczny - bot account/bot edit trigger}}

== Source code ==
GPL 3.0 licensed

<pre>
from osm_bot_abstraction_layer.generic_bot_retagging import run_simple_retagging_task
import hashlib

GROUND = {
    'amenity': {'parking', 'parking_space', 'bicycle_parking', 'motorcycle_parking'},
    'leisure': {'pitch', 'track', 'playground', 'sports_centre', 'park', 'outdoor_seating', 'schoolyard'},
    'tourism': {'picnic_site', 'camp_site', 'camp_pitch'},
    'place': {'square'},
    'railway': {'platform'},
    'public_transport': {'platform'},
    'man_made': {'pier', 'bridge'},
    'barrier': {'kerb', 'traffic_island'},
}

def is_ground_surface(tags):
    if 'building' in tags or 'building:part' in tags:
        return False
    if tags.get('highway') == 'track' and tags.get('tracktype', 'grade1') != 'grade1':
        return False
    if 'highway' in tags or 'area:highway' in tags or 'traffic_calming' in tags:
        return True
    return any(tags.get(key) in values for key, values in GROUND.items())

def edit_element(tags):
    if tags.get('surface') != "cement":
        return tags
    if not is_ground_surface(tags):
        return tags
    tags["surface"] = "concrete"
    return tags

def main():
    query="""
[out:xml][timeout:1800];
nwr["surface"="cement"];
out body;
>;
out skel qt;
"""
    hashed = hashlib.sha256(query.encode('utf-8')).hexdigest()
    run_simple_retagging_task(
        max_count_of_elements_in_one_changeset=500,
        objects_to_consider_query=query,
        objects_to_consider_query_storage_file='/media/mateusz/OSM_cache/osm_bot_cache/osm_bot_edit_' + hashed + '.osm',
        is_in_manual_mode=False,
        changeset_comment='migrate surface=cement to surface=concrete on roads, paths and other ground surfaces',
        discussion_url="[placeholder: forum thread link]",
        osm_wiki_documentation_page='https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_worldwide',
        edit_element_function=edit_element,
    )

main()
</pre>

== Opt-out ==
Please write in the bot approval thread; in case of posting elsewhere, send also a PM. Note that in case of opt-out exactly the same edit may be made manually for objects where bot opt-out was used.

[[Category:Automated edits log]]
```

### 4b. Brick

Create at: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dbrick_to_surface%3Dbricks_worldwide

```mediawiki
__NOTOC__Page content created as advised on [[Automated_Edits_code_of_conduct#Document_and_discuss_your_plans]].

This edit will replace {{tag|surface|brick}} by {{tag|surface|bricks}} worldwide, on roads, paths and other ground surfaces.

== Who ==
[[User:Mateusz Konieczny|Mateusz Konieczny]] using [https://www.openstreetmap.org/user/Mateusz%20Konieczny%20-%20bot%20account his bot account].

The proposal was written by [[User:Julcnx|Julcnx]], who also answers the discussion.

=== contact===
About the proposal: [https://www.openstreetmap.org/message/new/julcnx message Julcnx via OSM].

About bot runs: [http://www.openstreetmap.org/message/new/Mateusz%20Konieczny message Mateusz Konieczny via OSM]. Messages to the bot account are also read, but his main account is preferable. English and Polish languages are preferable.

==What ==

This edit will replace {{tag|surface|brick}} by {{tag|surface|bricks}} worldwide, on roads, paths and other ground surfaces (see How for the list).

Buildings, walls, street furniture and objects without a clear main tag will not be edited.

== Why ==
The documented value is {{tag|surface|bricks}}; [[Tag:surface=brick]] redirects to it. Both mean the same, only the plural is missing.

Data consumers usually know only the documented value {{tag|surface|bricks}}, so they treat these objects as having an unknown surface, and some maps show them as unpaved.

The value keeps growing (about 4,100 objects in 2020, 8,326 in 2026-11), so the edit is recurring.

This value does NOT require manual review on the listed features. Random samples and all objects with {{key|note}}, {{key|description}} or {{key|fixme}} were checked in 2026-11 and were plain brick paving.

==Numbers ==
As of 2026-11-16: 8,326 objects with {{tag|surface|brick}}, of which about 8,250 match the list below (7,871 with {{key|highway}}). About 75% are in the USA and 11% in the UK.

After the first run, the number depends on how many new matches appear.

objects affected by the next run: [placeholder: overpass-turbo link]

== How ==
Each changeset contains a single element or group of close elements to avoid edits spanning across large areas.

Changeset would be described and tagged with tags that mark it as automatic, provide link to discussion approving edit and to this documentation page.

An object is edited only if it has no {{key|building}} or {{key|building:part}} tag and has one of:
* {{key|highway}} (any value), {{key|area:highway}}, {{key|traffic_calming}}
* {{tag|amenity|parking}}, {{tag|amenity|parking_space}}, {{tag|amenity|bicycle_parking}}, {{tag|amenity|motorcycle_parking}}
* {{tag|leisure|pitch}}, {{tag|leisure|track}}, {{tag|leisure|playground}}, {{tag|leisure|sports_centre}}, {{tag|leisure|park}}, {{tag|leisure|outdoor_seating}}, {{tag|leisure|schoolyard}}
* {{tag|tourism|picnic_site}}, {{tag|tourism|camp_site}}, {{tag|tourism|camp_pitch}}
* {{tag|place|square}}, {{tag|railway|platform}}, {{tag|public_transport|platform}}, {{tag|man_made|pier}}, {{tag|man_made|bridge}}, {{tag|barrier|kerb}}, {{tag|barrier|traffic_island}}

state before a mechanical edit: <br>

*{{Tag|surface|brick}}
*{{Tag|highway|footway}}
*{{Tag|footway|sidewalk}}

state after a mechanical edit: <br>

*{{Tag|surface|bricks}}
*{{Tag|highway|footway}}
*{{Tag|footway|sidewalk}}

=== Ignored object example ===

*{{tag|surface|brick}}
*{{tag|barrier|wall}}

will not be edited (here {{tag|material|brick}} is likely meant)

*{{tag|surface|brick}}
*{{tag|building|yes}}

will not be edited

== Discussion ==
* [placeholder: forum thread link]
* https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12 (offer to run it)

== Repetition ==
{{:Mechanical Edits/Mateusz Konieczny - bot account/bot edit trigger}}

== Source code ==
GPL 3.0 licensed

<pre>
from osm_bot_abstraction_layer.generic_bot_retagging import run_simple_retagging_task
import hashlib

GROUND = {
    'amenity': {'parking', 'parking_space', 'bicycle_parking', 'motorcycle_parking'},
    'leisure': {'pitch', 'track', 'playground', 'sports_centre', 'park', 'outdoor_seating', 'schoolyard'},
    'tourism': {'picnic_site', 'camp_site', 'camp_pitch'},
    'place': {'square'},
    'railway': {'platform'},
    'public_transport': {'platform'},
    'man_made': {'pier', 'bridge'},
    'barrier': {'kerb', 'traffic_island'},
}

def is_ground_surface(tags):
    if 'building' in tags or 'building:part' in tags:
        return False
    if 'highway' in tags or 'area:highway' in tags or 'traffic_calming' in tags:
        return True
    return any(tags.get(key) in values for key, values in GROUND.items())

def edit_element(tags):
    if tags.get('surface') != "brick":
        return tags
    if not is_ground_surface(tags):
        return tags
    tags["surface"] = "bricks"
    return tags

def main():
    query="""
[out:xml][timeout:1800];
nwr["surface"="brick"];
out body;
>;
out skel qt;
"""
    hashed = hashlib.sha256(query.encode('utf-8')).hexdigest()
    run_simple_retagging_task(
        max_count_of_elements_in_one_changeset=500,
        objects_to_consider_query=query,
        objects_to_consider_query_storage_file='/media/mateusz/OSM_cache/osm_bot_cache/osm_bot_edit_' + hashed + '.osm',
        is_in_manual_mode=False,
        changeset_comment='migrate surface=brick to surface=bricks on roads, paths and other ground surfaces',
        discussion_url="[placeholder: forum thread link]",
        osm_wiki_documentation_page='https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dbrick_to_surface%3Dbricks_worldwide',
        edit_element_function=edit_element,
    )

main()
</pre>

== Opt-out ==
Please write in the bot approval thread; in case of posting elsewhere, send also a PM. Note that in case of opt-out exactly the same edit may be made manually for objects where bot opt-out was used.

[[Category:Automated edits log]]
```

## 5. Reply to Mateusz (post after the two threads)

Post at: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361 (Reply, not quote-reply to a single post)

```markdown
[quote="Mateusz_Konieczny, post:12, topic:105361"]
I would be happy run a worldwide one or in other regions, I think it makes sense. The limit here is that proposal for bot edit needs to be made (if anyone wants, feel free to make thread proposing such edit mirroring USA one - for other limited area or worldwide one, if clearly accepted I would be happy to run bot)
[/quote]

Thanks! I wrote both proposals, with your bot account as the operator, and I'll answer the comments there:

- `cement` → `concrete`: [placeholder: cement thread link]
- `brick` → `bricks`: [placeholder: brick thread link]

Both are worldwide and recurring, limited to roads, paths and other ground surfaces. Buildings, street furniture and walls are left out. If you prefer other wording or code on the wiki pages, feel free to change them.

[quote="Mateusz_Konieczny, post:12, topic:105361"]
I would rather contact mappers using these values and ask whether they would support migration to more standard values (I do such things, but no promises on when I ask about this specific tags)
[/quote]

Agreed, no bot for `dbst`, `ottaseal` and `Blacktopped`. I asked the 18 mappers who added them (7 in Cambodia, 11 in Nepal) in changeset comments, and I'll retag by hand where they agree.

[quote="Mateusz_Konieczny, post:12, topic:105361"]
these red boxes manage to be both annoying and useless (sometimes they manage to be also wrong) so I would not encourage their use
[/quote]

OK, I dropped the PossibleSynonym idea. Thanks for adding them to your dubious-tags list.
```
