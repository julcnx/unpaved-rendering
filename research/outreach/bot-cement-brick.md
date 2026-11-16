# Bot proposals: `surface=cement` → `concrete`, `surface=brick` → `bricks` (drafts, not posted)

Status 2026-11-16: drafts only, nothing posted. Mateusz Konieczny offered to run both worldwide if someone writes the proposals (forum thread and wiki page) and answers the comments ([post 12](https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12)). Scope: `highway=*` only, like his US cement bot (decided 2026-11-16). The local values (`dbst`, `ottaseal`, `Blacktopped`) are not part of this: see [local-values-mappers.md](local-values-mappers.md).

**Now (2026-11-16)**: changeset comments sent and Mateusz updated. Order:

1. Create both wiki pages (section 4). Their "[placeholder: forum thread link]" stays until step 3.
2. Post the merged topic (section 3, "Merged topic"), with the two wiki links filled in.
3. Put the topic link into both wiki pages (Discussion section and `discussion_url` in the code).
4. Reply in the bot thread with the topic link (section 5, updated).

Old order (two threads):

1. Publish both wiki pages (section 4), then post both threads (section 3) with the wiki links filled in.
2. Put each thread link into its wiki page (Discussion section and `discussion_url` in the code).
3. Send the changeset comments ([local-values-mappers.md](local-values-mappers.md)).
4. Reply to Mateusz in the bot thread (section 5) with the two thread links.

## 1. Findings

Data: every object with the value, from Postpass (Geofabrik, current OSM data, 2026-11-16). Overpass was overloaded on every public instance and the ohsome API returned 403, so Postpass replaced both. Countries from Natural Earth 50 m borders. Country totals match Geofabrik's regional taginfo. Scripts and raw data were in the session scratchpad (not kept).

### `surface=cement`

- 2,688 objects: 2,653 ways, 21 relations, 14 nodes. Flat since 2022 (3,306 in 2021, 2,412 in 2022 after the US bot and the [MapRoulette challenge](https://community.openstreetmap.org/t/mysterious-surface-cement/5158/4), 2,688 now).
- On `highway=*`: 818 objects, 118 km. Mostly footway (316), service (122), residential (110), steps (67), path (59). Only 12 secondary and 10 tertiary. Top countries: Italy 151, Indonesia 132, Mexico 117, Greece 59, India 55, Spain 46, China 41, Brazil 29.
- Top countries (all objects): USA 1,078, Iran 501, Italy 202, Indonesia 139, Spain 133, Mexico 131, Greece 79, India 66, China 46, Brazil 45.
- **The US bot ran**: only 3 US `highway=*` objects still have `cement` (2 bus stops, 1 footway). The 1,078 US objects left are almost all from one 2010 park-facilities import: picnic sites (289), benches (181), waste baskets (240), drinking fountains (63), signs (35), pitches and objects with no main tag (`category=PUBLIC FACILITIES`), with notes like "STAMPED CONCRETE".
- Iran: 493 `leisure=pitch` from one mapper in 2019 (concrete courts).
- Non-plain cases on highways: tracks with `tracktype=grade2` to `grade4` (6 ways, Italy, France, Spain) could be broken concrete strips or something else: leave out. Tracks with `grade1` (Italy, Spain, Switzerland, Korea) are plain concrete farm tracks: keep. No sign of cement-stabilised soil: no note, description or tag hints at it in the 2,688 objects.
- Non-plain cases off highways (not touched by a highway-only bot, for the record): street furniture where `surface` may mean the object's material, lined drains, buildings.
- 2022 thread objections: one mapper was against a bot because `surface` can sit on roofs, retaining walls and so on ([post 29](https://community.openstreetmap.org/t/mysterious-surface-cement/5158/29)). Highway only answers that. Several posts confirm that "cement" means concrete in everyday Swedish, German, Croatian, French and Italian use (posts 2, 5, 7, 26, 28).

### `surface=brick`

- 8,326 objects: 8,142 ways, 119 nodes, 65 relations. Growing by 700 to 900 a year (4,097 in 2020, 6,417 in 2023, 8,326 now), so a recurring run makes sense.
- On `highway=*`: 7,871 objects, 579 km. Footway 4,189 (many `footway=sidewalk`), residential 1,256, service 1,050, steps 402, pedestrian 329, path 200, tertiary 108. Countries: USA 6,038 (77%), UK 847 (11%), Italy 154, Australia 139, Canada 120, Germany 111, Mexico 85, South Africa 64.
- Off highways: 455 objects (parking, `area:highway`, traffic islands, kerbs, and about 75 where `surface` likely means the object's material: buildings, walls, benches, artwork). Not touched.
- Taginfo projects that name the value itself (Arnis, Berliner Spielplatzkarte) also support `bricks` and `concrete`, so nothing breaks.

### Spot check

15 random objects of each (Python `random.seed(20261116)`), plus every object with `note`, `description` or `fixme` (about 55 per value), plus all cement objects with `tracktype` or bad `smoothness` (32).

- Cement sample: 5 Iran pitches, 9 from the US import, 2 sidewalks (Mexico, Brazil), 1 service road (Ecuador). All plain mistakes for concrete.
- Brick sample: 9 footways, 4 residential and 1 tertiary street, 1 crossing node, 1 pedestrian area; 14 of 15 in the US. All plain.
- Notes and descriptions confirm the plain reading ("STAMPED CONCRETE", "Historische Ziegelpflasterstraße", "BRICK ROAD ORIGINALLY PART OF BAYBORO SUBDIVISION"). None points to a different material.

### Scope

Both bots: objects with `highway=*` (any value; ways, nodes and relations). Cement only: skip `highway=track` with a `tracktype` other than `grade1`. None of the highway objects is also tagged `building`.

| | All objects | Edited (`highway=*`) | Left out |
|---|---|---|---|
| `cement` | 2,688 | 812 (118 km) | 1,870 non-highway (US import, Iran pitches, others) and 6 tracks |
| `brick` | 8,326 | 7,871 (579 km) | 455 non-highway |

Non-highway objects (pitches, picnic sites, parking, `area:highway`) could be a later extension, proposed separately.

## 2. One thread or two

Two threads:

- Different risk. `brick` → `bricks` is a plural spelling fix with no meaning change. `cement` → `concrete` changes the word and has the 2022 language debate. Objections to cement should not block brick.
- Mateusz needs a "clearly accepted" result per bot, and each bot has its own wiki page and changeset `discussion_url`. One thread per bot keeps each approval clean.

Where: [General talk](https://community.openstreetmap.org/c/general/38), tag `bot`, like Mateusz's worldwide proposals ([paved= duplicates](https://community.openstreetmap.org/t/surface-duplicated-by-paved-bot-edit-proposal/138817), [duplicate tags](https://community.openstreetmap.org/t/148926)). The code of conduct accepts the forum for a worldwide edit. Optional: one line in the United States category for brick (77% of the objects), linking the thread.

## 3. Forum posts

### Merged topic (use this one)

Post at: https://community.openstreetmap.org/new-topic?category=general (category General talk, tag `bot`)

Title: `Proposed bot edits: surface=cement to concrete and surface=brick to bricks on highways worldwide (recurring)`

```markdown
I propose two small recurring bot edits, both on `highway=*` only, worldwide:

1. `surface=cement` → `surface=concrete`
2. `surface=brick` → `surface=bricks`

Mateusz Konieczny would run them with his bot account, as he offered here: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12. I wrote the proposals and I will answer comments. If one part gets objections, the other can still go ahead on its own.

Wiki pages:
- cement: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_highways_worldwide
- brick: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dbrick_to_surface%3Dbricks_on_highways_worldwide

**Why**

Software that reads `surface` usually knows only the documented values, so these roads and paths end up with an unknown surface (and on some maps as unpaved).

- `surface=cement` was discussed in 2022 (https://community.openstreetmap.org/t/mysterious-surface-cement/5158) and marked deprecated on the wiki, with `concrete` as the replacement. In many languages "cement" is the everyday word for concrete. The same edit already ran on US roads and paths: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_USA_roads_and_paths. This extends it to the whole world.
- `surface=brick` is the same as the documented `surface=bricks` (the wiki page redirects there), only the plural is missing. It keeps growing: about 4,100 objects in 2020, 8,326 today.

**What would change**

- cement: 812 objects (118 km), mostly footways, service and residential roads, steps, in Italy, Indonesia, Mexico, Greece, India, Spain, China and others. Tracks with `tracktype=grade2` or worse (6 ways) are left out, to check by hand.
- brick: 7,871 objects (579 km), mostly sidewalks, residential and service roads, steps. About 77% in the USA, 11% in the UK.

Nothing without `highway=*` is touched (pitches, parking, benches, buildings, walls and so on). Some of those use `surface` for the material of the object itself and need a check by hand.

I checked 15 random objects of each and every object with a `note`, `description` or `fixme`: all were plain concrete or brick paving, and I found no case of cement-stabilised soil.

After the edit, I'd also turn the `surface=brick` wiki redirect into a short deprecated page (replacement `surface=bricks`), like `surface=cement`, so mappers and tools see that it is a mistake.

Any objections?
```

### Earlier two-thread drafts (not used)

### 3a. Cement

Post at: https://community.openstreetmap.org/new-topic?category=general (category General talk, tag `bot`)

Title: `Proposed bot edit: surface=cement to surface=concrete on highways worldwide (recurring)`

```markdown
I propose to replace `surface=cement` with `surface=concrete` on `highway=*` worldwide. It is the same edit as the existing US one, extended to the whole world: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_USA_roads_and_paths

Mateusz Konieczny would run it with his bot account, as he offered here: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12. I wrote the proposal and I will answer comments.

Wiki page: [placeholder: wiki page link]

**Background**

`surface=cement` was discussed in 2022 (https://community.openstreetmap.org/t/mysterious-surface-cement/5158) and marked deprecated on the wiki, with `concrete` as the replacement. In many languages "cement" is the everyday word for concrete. Software that reads `surface` usually knows only the documented values, so these roads and paths end up with an unknown surface (and on some maps as unpaved).

**What would change**

812 objects with `highway=*` and `surface=cement` (118 km), mostly footways, service roads, residential roads and steps, in Italy, Indonesia, Mexico, Greece, India, Spain, China and others. The US has only 3 left, thanks to the earlier run.

It would **not** touch:

- anything without `highway=*` (pitches, picnic sites, benches, buildings and so on)
- tracks with `tracktype=grade2` or worse (6 ways, to check by hand)

I checked 15 random objects and every object with a `note`, `description` or `fixme`: all were plain concrete, and I found no case of cement-stabilised soil.

It would be recurring, so new `surface=cement` on highways gets fixed too.

Any objections?
```

### 3b. Brick

Post at: https://community.openstreetmap.org/new-topic?category=general (category General talk, tag `bot`)

Title: `Proposed bot edit: surface=brick to surface=bricks on highways worldwide (recurring)`

```markdown
I propose to replace `surface=brick` with `surface=bricks` on `highway=*` worldwide. Mateusz Konieczny would run it with his bot account, as he offered here: https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/12. I wrote the proposal and I will answer comments.

Wiki page: [placeholder: wiki page link]

**Background**

The documented value is `surface=bricks`; https://wiki.openstreetmap.org/wiki/Tag:surface%3Dbrick redirects there. Same meaning, only the plural is missing. Software that reads `surface` usually knows only the documented values, so `brick` streets and sidewalks end up with an unknown surface (and on some maps as unpaved). The value keeps growing: about 4,100 objects in 2020, 8,326 today.

**What would change**

7,871 objects with `highway=*` and `surface=brick` (579 km): mostly sidewalks, residential and service roads, steps. About 77% are in the USA, 11% in the UK.

It would **not** touch anything without `highway=*` (455 objects: parking, squares, buildings, walls and so on). Some of those mean the material of the object itself and need `material=brick` by hand, not `bricks`.

I checked 15 random objects and every object with a `note`, `description` or `fixme`: all were plain brick paving.

It would be recurring, so new `surface=brick` on highways gets fixed too.

Any objections?
```

## 4. Wiki pages

Both pages go in [Category:Automated edits log](https://wiki.openstreetmap.org/wiki/Category:Automated_edits_log) (the category line is at the bottom; the Repetition include adds Category:Automated edits). Same sections as the US page. The source code mirrors the US page and uses Mateusz's library; he may replace it with his current version.

### 4a. Cement

Create at: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_highways_worldwide

```mediawiki
__NOTOC__Page content created as advised on [[Automated_Edits_code_of_conduct#Document_and_discuss_your_plans]].

This edit will replace {{tag|surface|cement}} by {{tag|surface|concrete}} on roads and paths ({{key|highway}}) worldwide.

== Who ==
[[User:Mateusz Konieczny|Mateusz Konieczny]] using [https://www.openstreetmap.org/user/Mateusz%20Konieczny%20-%20bot%20account his bot account].

The proposal was written by [[User:Julcnx|Julcnx]], who also answers the discussion.

=== contact===
About the proposal: [https://www.openstreetmap.org/message/new/julcnx message Julcnx via OSM].

About bot runs: [http://www.openstreetmap.org/message/new/Mateusz%20Konieczny message Mateusz Konieczny via OSM]. Messages to the bot account are also read, but his main account is preferable. English and Polish languages are preferable.

==What ==

This edit will replace {{tag|surface|cement}} by {{tag|surface|concrete}} on roads and paths ({{key|highway}}) worldwide.

Objects without {{key|highway}} will not be edited.

== Why ==
{{tag|surface|cement}} is deprecated, see [[Tag:surface=cement]] and https://community.openstreetmap.org/t/mysterious-surface-cement/5158 . In many languages "cement" is the everyday word for concrete, and cement alone is not used as a road surface.

Data consumers usually do not know {{tag|surface|cement}}, so they treat these roads and paths as having an unknown surface, and some maps show them as unpaved.

The same edit already runs on roads and paths in the USA: [[Mechanical Edits/Mateusz Konieczny - bot account/migrate surface=cement to surface=concrete on USA roads and paths]]. This edit extends it to the whole world.

This value does NOT require manual review on roads and paths. Random samples and all objects with {{key|note}}, {{key|description}} or {{key|fixme}} were checked in 2026-11 and were plain concrete.

==Numbers ==
As of 2026-11-16: 812 objects with {{key|highway}} and {{tag|surface|cement}} (118 km), mostly in Italy, Indonesia, Mexico, Greece, India, Spain and China.

After the first run, the number depends on how many new matches appear.

objects affected by the next run: [placeholder: overpass-turbo link]

== How ==
Each changeset contains a single element or group of close elements to avoid edits spanning across large areas.

Changeset would be described and tagged with tags that mark it as automatic, provide link to discussion approving edit and to this documentation page.

Only objects with {{key|highway}} (any value) are edited. {{tag|highway|track}} with a {{key|tracktype}} other than {{tag|tracktype|grade1}} is not edited.

state before a mechanical edit: <br>

*{{Tag|surface|cement}}
*{{Tag|highway|tertiary}}

state after a mechanical edit: <br>

*{{Tag|surface|concrete}}
*{{Tag|highway|tertiary}}

=== Ignored object example ===

*{{tag|surface|cement}}
*{{tag|leisure|pitch}}

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

def edit_element(tags):
    if tags.get('surface') != "cement":
        return tags
    if 'highway' not in tags:
        return tags
    if tags.get('highway') == 'track' and tags.get('tracktype', 'grade1') != 'grade1':
        return tags
    tags["surface"] = "concrete"
    return tags

def main():
    query="""
[out:xml][timeout:1800];
nwr["surface"="cement"]["highway"];
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
        changeset_comment='migrate surface=cement to surface=concrete on roads and paths',
        discussion_url="[placeholder: forum thread link]",
        osm_wiki_documentation_page='https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dcement_to_surface%3Dconcrete_on_highways_worldwide',
        edit_element_function=edit_element,
    )

main()
</pre>

== Opt-out ==
Please write in the bot approval thread; in case of posting elsewhere, send also a PM. Note that in case of opt-out exactly the same edit may be made manually for objects where bot opt-out was used.

[[Category:Automated edits log]]
```

### 4b. Brick

Create at: https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dbrick_to_surface%3Dbricks_on_highways_worldwide

```mediawiki
__NOTOC__Page content created as advised on [[Automated_Edits_code_of_conduct#Document_and_discuss_your_plans]].

This edit will replace {{tag|surface|brick}} by {{tag|surface|bricks}} on roads and paths ({{key|highway}}) worldwide.

== Who ==
[[User:Mateusz Konieczny|Mateusz Konieczny]] using [https://www.openstreetmap.org/user/Mateusz%20Konieczny%20-%20bot%20account his bot account].

The proposal was written by [[User:Julcnx|Julcnx]], who also answers the discussion.

=== contact===
About the proposal: [https://www.openstreetmap.org/message/new/julcnx message Julcnx via OSM].

About bot runs: [http://www.openstreetmap.org/message/new/Mateusz%20Konieczny message Mateusz Konieczny via OSM]. Messages to the bot account are also read, but his main account is preferable. English and Polish languages are preferable.

==What ==

This edit will replace {{tag|surface|brick}} by {{tag|surface|bricks}} on roads and paths ({{key|highway}}) worldwide.

Objects without {{key|highway}} will not be edited.

== Why ==
The documented value is {{tag|surface|bricks}}; [[Tag:surface=brick]] redirects to it. Both mean the same, only the plural is missing.

Data consumers usually know only the documented value {{tag|surface|bricks}}, so they treat these roads and paths as having an unknown surface, and some maps show them as unpaved.

The value keeps growing (about 4,100 objects in 2020, 8,326 in 2026-11), so the edit is recurring.

This value does NOT require manual review on roads and paths. Random samples and all objects with {{key|note}}, {{key|description}} or {{key|fixme}} were checked in 2026-11 and were plain brick paving.

==Numbers ==
As of 2026-11-16: 7,871 objects with {{key|highway}} and {{tag|surface|brick}} (579 km). About 77% are in the USA and 11% in the UK.

After the first run, the number depends on how many new matches appear.

objects affected by the next run: [placeholder: overpass-turbo link]

== How ==
Each changeset contains a single element or group of close elements to avoid edits spanning across large areas.

Changeset would be described and tagged with tags that mark it as automatic, provide link to discussion approving edit and to this documentation page.

Only objects with {{key|highway}} (any value) are edited.

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
*{{tag|amenity|parking}}

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

def edit_element(tags):
    if tags.get('surface') != "brick":
        return tags
    if 'highway' not in tags:
        return tags
    tags["surface"] = "bricks"
    return tags

def main():
    query="""
[out:xml][timeout:1800];
nwr["surface"="brick"]["highway"];
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
        changeset_comment='migrate surface=brick to surface=bricks on roads and paths',
        discussion_url="[placeholder: forum thread link]",
        osm_wiki_documentation_page='https://wiki.openstreetmap.org/wiki/Mechanical_Edits/Mateusz_Konieczny_-_bot_account/migrate_surface%3Dbrick_to_surface%3Dbricks_on_highways_worldwide',
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

Thanks! I wrote the proposal for both, with your bot account as the operator, and I'll answer the comments there: [placeholder: topic link]

Both edits are worldwide and recurring, and limited to `highway=*` like the US one. If you prefer other wording or code on the wiki pages, feel free to change them.

[quote="Mateusz_Konieczny, post:12, topic:105361"]
I would rather contact mappers using these values and ask whether they would support migration to more standard values (I do such things, but no promises on when I ask about this specific tags)
[/quote]

Agreed, no bot for `dbst`, `ottaseal` and `Blacktopped`. I asked the 18 mappers who added them (7 in Cambodia, 11 in Nepal) in changeset comments, and I'll retag by hand where they agree.

[quote="Mateusz_Konieczny, post:12, topic:105361"]
these red boxes manage to be both annoying and useless (sometimes they manage to be also wrong) so I would not encourage their use
[/quote]

OK, I dropped the PossibleSynonym idea. Thanks for adding them to your dubious-tags list.
```
