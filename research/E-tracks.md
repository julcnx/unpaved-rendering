# E. Tracks and paths (working draft, for the enduro OsmAnd renderer)

Started 2026-11-13. A private design brief for the OsmAnd Motorcycle fork ([decisions.md](decisions.md) decision 18, A-providers [A6](A-providers.md#a6-osmand-motorcycle-style-code-review-for-the-fork-2026-11-10)), not a public proposal and not part of the roads article. If it holds up in the fork, it may become a second article later.

## 1. Scope

- `highway=track` of every grade, paved tracks, and tracks with very bad `smoothness`.
- `highway=path` with motorcycle access (`motorcycle=yes`, `designated`, `permissive`): the rural riding case seen north of Chiang Rai.
- Other paths and footways only as things the track style must not look like.
- The constraint from the roads work: tracks must stay distinct from Unpaved and Off-road roads, which keep their class colour (roads article).

Out of scope: routing profiles (the fork keeps the Motorcycle ones for now), labels, POIs.

**Decision 1 (2026-11-13, Julien): the fork is for motor users, ADV, enduro and 4WD.** They read the same tags (`smoothness`, `tracktype`, `4wd_only`, `surface`) the same way, from "a city car passes" to "needs skill or a 4x4", so one ramp (Paved, Unpaved, Off-road, Specialized) serves all three. MTB is left to CyclOSM (its own `mtb:scale` and access rules; 0.7% of Thai paths have `mtb:scale`). Hikers matter only as a constraint: hiking paths must not look rideable. Who cares about surface, for the record: on roads everyone who drives (the roads article); on tracks almost only vehicle users (cyclists, motorcyclists, 4WD); on paths hikers hardly (`sac_scale` and visibility matter more), wheelchair users and strollers on urban footways (a separate accessibility topic).

## 2. Tags that matter for enduro

| Tag | What it says | Notes |
|---|---|---|
| `tracktype` grade1 to grade5 | How solid the track is | The OSM Carto rhythm and most styles key on it |
| `surface` | Material | On tracks often only `unpaved` (below) |
| `smoothness` | What vehicle can pass | Rare on tracks (1% Thailand, 4% Switzerland), but the best rider signal when present |
| `4wd_only` | 4x4 needed | Off-road evidence in our classifier |
| `motorcycle`, `motor_vehicle`, `access` | May I ride it | Legal question, separate from the surface question |
| `sac_scale`, `mtb:scale` | Hiking and MTB difficulty on paths | Used by the Motorcycle style for difficulty dots |

**How tracks are tagged in the two test countries** (measured 2026-11-13 from `pbf/<c>-ways.geojsonseq`, km of `highway=track`):

| | Thailand | Switzerland |
|---|---|---|
| Track km | 227,573 | 98,931 |
| With `tracktype` | **2.6%** | 82.9% (grade1 14.4, grade2 32.2, grade3 22.3, grade4 8.5, grade5 5.5) |
| With `surface` | 80.0%, of which `surface=unpaved` is 76.0% of all track km | 36.2% (gravel 11.3, compacted 6.7, asphalt 5.4) |
| With `smoothness` | 1.0% | 3.9% |
| No `tracktype`, `surface` or `smoothness` | 19.2% | 15.1% |
| With an access tag (`access`, `vehicle`, `motor_vehicle`, `motorcycle`) | 0.9% | 15.3% |

Paths with motorcycle access: Thailand 1,267 km (13.9% of path km; surface mostly `unpaved` 67.6%, `concrete` 10.9%, none 12.1%), Switzerland none (`motorcycle=no` on 2.0%). `sac_scale` on 10.4% of Thai and 36.1% of Swiss path km; `mtb:scale` on 0.7% and 12.1%.

The main finding: **in Thailand 96% of track km say nothing about the condition** (`surface=unpaved` or no tag at all). A style that grades tracks by `tracktype` shows almost every Thai track as "no information". Same pattern as roads, where `surface=unpaved` is 75% of Unpaved km (C-statistics).

## 3. How providers draw them

Full column in A-providers [A0](A-providers.md#a0-main-road-check-who-draws-unpaved-on-primary-secondary-and-tertiary-2026-11-03) ("How tracks and paths are drawn") and the per-provider table of styles to avoid. Summary:

- **A thin dashed line** (brown, dark or grey-green) is by far the most common track look: OSM Carto, OsmAnd default, Organic Maps, Maps.me, Guru Maps, Tracestrack, Mapy.com, Locus, MapTiler OMT, CalTopo. Most draw paths the same way, only thinner, so tracks and paths are often hard to tell apart (OsmAnd default at Chiang Rai: both thin dark dotted lines on forest).
- **Rhythm by `tracktype`**: OSM Carto, OsmAnd default and the OsmAnd Off-road style (solid for grade1, shorter dashes for worse grades, dash-dot for no grade). Organic Maps, Maps.me and Guru Maps draw every track the same.
- **A dashed casing or double dashed line**: Gaia GPS, AllTrails, Ride with GPS, OpenCycleMap, Thunderforest Outdoors. Light fills: Komoot and Strava (cream with a brown edge), HOT (the unpaved-road fill with dashes).
- **Colour by surface**: the OsmAnd Motorcycle style (brown for added material, green for bare earth), CyclOSM (dash by bike type from `smoothness`, `tracktype`, `surface`).
- **Class loss**: Gaia GPS, Ride with GPS and OsmAnd Motorcycle draw unpaved roads like tracks (Chiang Rai: the Off-road unclassified road identical to the tracks next to it).
- **Paths**: salmon, red, dark red, orange-brown or dark grey, thin dashes or dots; difficulty by `sac_scale` in Organic Maps (shorter dashes), Tracestrack (labels) and the Motorcycle style (dots).

Roads styles (D-examples-visuals) against tracks: style 1 (Grain fill) collides with no app's tracks; style 2 (Dashed centre line) is the common track look; style 4 (Dashed casing) is the track look in the Gaia family and the tunnel in Carto, Spirit and Organic Maps.

## 4. Constraint from the roads work

- Unpaved and Off-road roads keep their class colour and width, with one added signal. A road must never be redrawn as a track.
- Tracks must therefore look like no Unpaved or Off-road road in the same style. In the fork, the track look is ours to choose, so the check runs the other way too: whatever the fork draws for tracks decides which road style fits.
- The OsmAnd Off-road style draws tracks as black dashes on a tan underlay, which is close to a tan road with a dashed centre line (style 2). If the fork's tracks stay thin dashed lines, style 2 on roads is out for the fork too (as in A0 for OsmAnd); style 4 (Dashed casing, with the light tan fill on white roads) or style 3 (Dashed fill) fit.
- Same classifier for both: the fork uses our classifier (paved whitelist, unknown = Unpaved, Off-road from evidence only) on tracks as well as roads, so one rule set explains the whole map.

## 5. What the Motorcycle style does today

From A6 (code review, commit `f0676ed`):

- Five track categories: brown solid (easy: paved, compacted, fine_gravel, `grade1/2`), brown dashed (looser: gravel, rock, pebblestone, `grade3`), green solid (`grade4`), green dashed (bare ground: dirt, ground, grass, mud, sand, **`unpaved`**, `grade5`, `smoothness=horrible/very_horrible`, ford), and no information (as green dashed, or hidden by an option).
- Colour says material, dashing says looseness. The same categories drive the three routing profiles.
- Roads primary to residential with an unpaved surface are repainted in track colour and width, so the class is lost; motorway and trunk never.
- Lists only: `sand`, `mud`, `rock`, `laterite` keep the paved road look on roads, and `smoothness` is never read on roads.
- Paths: difficulty dots from `mtb:scale` and `sac_scale`; night, greyscale, IGN-like and background-map variants.

**Read again in the code on 2026-11-13** (track rules [L3797-L4070](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L3797-L4070), first match wins; mockup [mockups/tracks-enduro-plugin.png](mockups/tracks-enduro-plugin.png), `node mockups/make-track-mockups.mjs`). At z15 every track is 2.5 px; dashes 16_4 for both colours; colours `$piste` `#996600` (night `#cc9966`) and `$chemin` `#008800` (night `#00bb55`).

| Look | Tags on tracks | Thailand | Switzerland |
|---|---|---|---|
| White with a dark shadow (a small road) | `surface=asphalt` | 0.1% | 5.4% |
| Brown solid | `grade1/2`, gravel, compacted, fine_gravel, paved, concrete, sett, cobblestone, chipseal, `smoothness=bad` | 1.8% | 39.8% |
| Brown dashed | `grade3`, pebblestone | 0.6% | 22.2% |
| Green solid | `grade4`, `smoothness=very_bad`, `mtb:scale=0` | 0.7% | 9.7% |
| Green dashed | `grade5`, `smoothness` horrible or very_horrible, sand, mud, grass, `mtb:scale` 1 to 3 | 0.7% | 7.4% |
| **Green dashed, "no information"** | **no tag, and `surface` unpaved, dirt, ground, earth** (in no list on tracks: "pas de sens") | **96.1%** | 15.5% |
| Black dots 1.75 px, 5_5 (the path look) | `smoothness=impassable`, `mtb:scale` 4 to 6 | 0.0% | 0.0% |

Corrections to A6:

1. On tracks, `unpaved`, `dirt`, `ground` and `earth` are not in the bare-ground list; they fall through to "no information", which is drawn the same green dashed. Same result on screen, different reason.
2. The option "cacher chemin sans info" (hide tracks without information) **hides nothing**: it only drops the dashes ([L4051](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L4051)), so untagged tracks turn green solid and look like `grade4`.
3. Paths and bridleways are black dots (night light grey), with **no rule for `motorcycle=yes`**: a rideable path looks like a hiking path.
4. Access: any track or path with `motorcycle`, `motor_vehicle`, `motorcar`, `vehicle` or `access` = no, private, destination, agricultural or forestry, and every footway and cycleway, turns red `#ff3333` (night `#cc4f4f`) and keeps its dashes ([L4376-L4410](https://github.com/OsmAnd-Rendering/Motorcycle/blob/f0676ed/enduro.render.xml#L4376-L4410)). The red dashes seen on the phone at Chiang Rai are probably this.

So **in Thailand 96.8% of track km are green dashed** (no information plus the real bare-ground group): the five categories collapse into one where the fork will be tested, and that one look also stands for `grade5`, the hardest grade. Green is also the land colour of forest (`$foret` `#dce6d0`), which this green sits on.

## 6. Decisions for the fork (proposed answers, to check in the emulator)

### 6.1 How many track grades does a rider need to see?

**Three, plus one hidden or special case, by the same classifier as roads:**

| Level | Tags (our classifier) | Thailand | Switzerland | Look (proposal, mockup column C) |
|---|---|---|---|---|
| Paved track | paved whitelist `surface`, or `tracktype=grade1` without surface | 0.7% | 14.8% | light warm grey `#bcb3aa`, solid |
| Unpaved track (default) | everything else, including `surface=unpaved` and no tags at all | 98.0% | 71.0% | brown `#b0773a`, long dashes (22/6, the shared ladder) |
| Off-road track | `smoothness` very_bad or horrible, `tracktype` grade4 to grade7, `surface` mud or rock, `4wd_only` | 1.2% | 14.1% | dark red-brown `#7d3416`, medium dashes (8/9, the ladder chosen 2026-11-09 for tracks later) |
| Specialized | `smoothness` very_horrible or impassable, `tracktype=grade8` | 0.1% | 0.1% | near black `#2e1a12`, short dashes; an option to hide it |

Shares: km of `highway=track` per level of our classifier, Geofabrik extracts of 2026-11-12.

Why not five grades:

1. **The data cannot fill them where riders go.** 96% of Thai track km carry no condition at all; five grades would show one grade almost everywhere and suggest a precision the map does not have. In Switzerland, where the grades exist, three levels still separate the cases a rider acts on: ride it with anything, ride it, needs skill.
2. **One rule for the whole map.** Paved / Unpaved / Off-road is the roads model (decision 9). The same words and the same ladder on roads and tracks means one legend, and the phone demo matches the web demo (A6 change 5).
3. **No separate "no information" look.** OSM Carto and OsmAnd use a dash-dot for tracks without `tracktype`; in Thailand that would be the main track look. Unknown = Unpaved, as on roads. Keep the Motorcycle option to hide untagged tracks, off by default (it would hide 15 to 19% of tracks), since it is useful as mapping feedback.
4. **Roughness coded twice: colour and rhythm** (revised 2026-11-13; was one hue). Drop the brown / green material split (material is mostly unknown, and green melts into forest), but keep colour: in a specialised app roughness is the rider's first question, tracks have no class colour to lose, and colour still reads at z12 to z14 where dashes merge (the reason Off-road roads became darker, D). The colour is a **lightness ramp**, rougher = more contrast with the land: darker by day, brighter by night. Lightness, not hue, so it holds for colour-blind readers and in the greyscale mode; the dashes carry it again for screenshots and print. Roads never take the ramp: they keep their class colour (the roads article; the fork is its real-app demo).

Mockup [mockups/tracks-best-practice.png](mockups/tracks-best-practice.png) (`node mockups/make-track-mockups.mjs`): A dashes only, B colour only, C both, on land, forest and night, with the Unpaved and Off-road minor roads in style 4 as reference. A loses the levels at a glance and B loses them in greyscale; C keeps both. Luminance contrast of the ramp (printed by the script):

| | Paved | Unpaved | Off-road | Specialized |
|---|---|---|---|---|
| Day, against land `#f2efe9` | 1.80 | 3.30 | 7.71 | 14.38 |
| Day, against forest `#dce6d0` | 1.60 | 2.93 | 6.85 | 12.79 |
| Day, step from the level before | | 1.83 | 2.34 | 1.87 |
| Night (`#5a5754`, `#9c6a3a`, `#f0925e`, `#f3dcc4`), against `#202124` | 2.24 | 3.48 | 6.88 | 12.15 |
| Night, step from the level before | | 1.55 | 1.98 | 1.76 |

Under the deuteranopia simulation (`check-colour-blindness.py images`) the four steps stay apart by lightness. Weak point: the Paved track is faint on forest (1.60), on purpose (least to report) but to check in the sun. Night Off-road is orange: check it against the OsmAnd route line and GPX colours.

`grade2` and `grade3` both stay Unpaved (no mark), as in the roads classifier (decision 11); `grade3` moves out of the Motorcycle "easy" group as A6 change 3 says.

### 6.2 Should paths with `motorcycle=yes` look like tracks?

**No, but they should look rideable, unlike other paths** (revised 2026-11-13: colour now carries roughness, so access moves to opacity):

- **Ramp = rideable, and how rough.** Paths with `motorcycle` yes, designated or permissive take the track ramp and rhythm of their level. Thai moto paths are 68% `surface=unpaved`, so most get the Unpaved brown long dashes; the 14% paved (concrete, paved) get the grey solid line.
- **Width = track or singletrack.** Moto paths stay at path width, so a track reads wider than a singletrack at a glance.
- **Other paths: a cool colour off the ramp** (slate `#5d6b80`, round dots), so a hiking path never looks rideable. Not red: red is common for GPX tracks and for routes.
- **Opacity = may I ride it.** Tracks and paths with `motorcycle`, `motor_vehicle` or `access` no, private, agricultural or forestry fade to 35% and keep their look (the Motorcycle style recolours them red instead, which takes the colour away from roughness).

Why: 1,267 km in Thailand, and at Chiang Rai 8.5 km of moto paths in one z15 view, more than the Unpaved roads in it. Today every style draws them as hiking paths (Maps.me and Komoot shots), so the rideable network is invisible. Drawn as full tracks they would claim a width the way does not have. Switzerland has none, so the rule changes nothing there.

15% of Swiss track km carry an access tag (values to break down). Legal access is a bigger question than the surface in Europe, so this is the next thing to measure.

`sac_scale` and `mtb:scale` dots: keep the Motorcycle ones on paths as they are (low priority; 0.7% of Thai paths have `mtb:scale`).

### 6.3 Night mode

**Keep the rhythms identical, flip the ramp.** The dash pattern does not depend on the theme. The colour rule stays "rougher = more contrast with the land", so by night the ramp runs from dim grey to bright pale tan (values and contrasts in 6.1, Night column of the mockup); hiking paths are lifted to `#9aa8bd`. The Motorcycle night variants already exist; the fork changes their track and path colours only. The roads demo has no dark-mode Unpaved style yet (D, style 4 note), so night roads and night tracks are designed together.

### 6.4 Scheme D: decisions of 2026-11-13 (Julien), not in the article

Julien's objection to 6.1 column C: with 98% of Thai tracks Unpaved, the map is long dashes everywhere, the opposite of what an off-road rider wants. Komoot draws hiking trails as continuous lines because its audience is hikers; the fork does the same for tracks. Sheet [mockups/tracks-solid.png](mockups/tracks-solid.png) (`node mockups/make-track-mockups.mjs`). 6.1 and 6.2 above are superseded where they differ.

| Signal | Meaning |
|---|---|
| Solid line | Track: two wheel-tracks wide, a 4WD fits |
| Dashed line | Single track: a path with `motorcycle` yes, designated or permissive |
| Thin grey dots | Every path nobody said you may ride: no motorcycle answer (no `motorcycle`, `motor_vehicle`, `vehicle` or `access` tag, or the value `unknown`; 85% of Thai path km), hiking paths (`sac_scale`, `foot=designated`), and anything `smoothness=impassable`. Strict on purpose (Julien, 2026-11-13): the OSM default for a path is no motor vehicles, and in most of Europe riding one is illegal unless signed, so a grey "maybe" single track (tried first) would contradict the data and advertise untagged trails. In Thailand the ridden paths are the ones tagged `motorcycle=yes`, so the map rewards the tagging instead of guessing |
| White fill, grey casing | Paved: paved surface, or `tracktype=grade1` without surface (a narrow road; OpenTopoMap `grade1`, the plugin's asphalt tracks). Not grey: grey is the dots. TH 0.7%, CH 14.8% of track km |
| Brown `#b0773a` | Unpaved, nothing says it is rough: `smoothness` bad or better, `grade2`, `grade3`, any other surface including `unpaved`, or no tag at all. TH 98.0%, CH 71.0% |
| Dark brown `#74481f` | High clearance (a pickup passes): `smoothness=very_bad`, `grade4`, `surface=rock`, `4wd_only=recommended`. TH 0.7%, CH 8.6% |
| Near black `#2b190c` | 4WD: `smoothness` horrible or very_horrible, `grade5` to `grade8`, `surface=mud`, `4wd_only` yes or extreme. TH 0.6%, CH 5.6% |
| Thin pale red `#e07878` | Closed: `motorcycle`, `motor_vehicle`, `vehicle` or `access` = no, private, agricultural, forestry, destination (first key that answers). Keeps its solid or dashed pattern. Bright red with cross bars dropped: too aggressive, and it would make the ways you cannot ride the loudest on the map **Superseded 2026-11-19 by grey, see "Closed ways greyed out" below** |

(Superseded 2026-11-19: closed ways are now grey, see "Closed ways greyed out" below.) **Access rule in one sentence: red = someone said no, dots = nobody said yes** (`unknown` counts as nobody). `motorcycle=no` goes red, not grey: it is the one case where the data is certain, and a route planner needs that line. Density, measured 2026-11-13 by the first explicit key: Switzerland 13.3% of track km (`motor_vehicle=no` 3.2, `forestry` 2.7, `motorcycle=no` 1.7, `agricultural` 1.0, `private` 0.8) and 3.6% of path km; Thailand 0.2% of track km and 1.8% of path km. One Swiss track in eight in red is the test the thin pale line has to pass; the plugin's switch to hide access colouring stays as the fallback. If the Thai map ever feels too thin, a regional option "treat untagged paths as rideable" could come later; not built now.

**No "unknown" look for tracks** (2026-11-13): an untagged track (TH 19%, CH 15% of track km) and `surface=unpaved` (TH 76%, CH 2%) are both the plain brown Unpaved line, the same as a `grade2` gravel track. All three say "unpaved, nothing says it is rough", which is true tagged or not; the classifier already treats them alike (rule 5) and the roads article made the same choice. A distinct look would cover 96% of Thai tracks (the plugin's green dashes do exactly that) and sprinkle random marks over Switzerland; Carto's dash-dot for unknown `tracktype` was dropped from the road styles for the same reason. Certainty is not a property of the ground, so it does not go on the line.

**Survey toggle, off by default, for mappers** (Julien, 2026-11-13: good idea; later; drawn in the second group of [mockups/tracks-solid.png](mockups/tracks-solid.png)): fades every track and every rideable single track that has no information about its condition: no `tracktype`, no `smoothness`, and either no `surface` or only `surface=unpaved` (a surface tag, but nothing a surveyor would record; Claude's reading, to confirm). Measured 2026-11-13: tracks 94.3% in Thailand, 15.3% in Switzerland; moto paths 79.0% and 9.5%. Paths with no access answer (no tag, or `access`/`motorcycle=unknown`) fade too (Julien, 2026-11-13): unknown access is a survey question as much as unknown condition. Impassable keeps its dots (an answer), closed ways keep their red. It is the plugin's "cacher chemin sans info" done so that it works (one rendering property). Roads could join later (58% of road km have no `surface` and are assumed paved), but that belongs with the surface surveys, not with this scheme.

Finer difficulty than the vehicle ladder (grade2 vs grade3) is not drawn: `tracktype` measures firmness, not skill. Skill has its own tag, `dirtbike:scale`, defined for tracks and paths; if wanted, it becomes symbols along the line (circle, square, diamond, as ski and IMBA ratings), only where tagged. Low priority, not now (Julien, 2026-11-13): 13 km of Thai paths carry it, none in Switzerland. `mtb:scale` (12% of Swiss path km) is a bicycle scale and is left alone.

**Vehicle ladder (Julien, 2026-11-13): the article's Off-road mark is split in two for the fork.** `smoothness` is a vehicle ladder (bad or better a normal car, very_bad high clearance, horrible 4WD), so the fork draws the vehicle needed, not the surface: in Thailand many double tracks take a pickup but not a city car, and the article's single Off-road level hides that. Darker = needs more vehicle; one hue, so the order reads without a legend and holds for colour-blind readers (Julien's earlier renderer used three hues for city, pickup and 4WD: the same classes with no order). The lightest dirt level is "nothing says it is rough", not "city car": it holds the confirmed mild tracks and the 94% of Thai tracks with no information, and the survey toggle is where the two come apart. Judgment calls: `grade5` to 4WD (soft ground is a traction problem when wet, the plugin's "selon météo" idea); `very_horrible` into 4WD rather than a step of its own (rare, and no Specialized colour). Precedence as in the classifier: `smoothness`, then `tracktype`, then `surface`; `4wd_only` as a minimum. Roads in version 3 would take the same three dirt tints; not drawn yet.

Night: brighter = needs more vehicle (`#9c6a3a`, `#d1a068`, `#f7e3c6`), paved track dark grey with a lighter casing. Contrast by day: Unpaved 3.30 on land and 2.93 on forest, High clearance 6.80 and 6.05, 4WD 14.67 and 13.05, steps 2.06 and 2.16; by night 3.48, 6.85, 12.85, steps 1.97 and 1.87.

**Roads in the fork** ([mockups/roads-fork.png](mockups/roads-fork.png), five versions of Unpaved and Off-road roads next to a solid Unpaved track, white, yellow, orange and red roads at z15 and z13 widths): 1 brown fill with the class casing, 2 brown core with class-coloured edges, 3 class tint with a solid brown casing, 4 dashed fill (style 3), 5 dashed casing (style 4). Reading: 1 loses the class (yellow, orange and red look the same, and at z13 a road is a fat track); 2 reads as a track laid on a road; 4 and 5 bring the dashes back. Proposed: 3, the only version without dashes that keeps the class, and it follows the track rule (browner and darker = rougher). If Paved to Unpaved is too subtle on the phone, strengthen the tint, not add a pattern. Not decided yet; the dashed fill (4) stays a fair candidate. Light mode only; widths estimated, not OsmAnd's.

**Decision (Julien, 2026-11-13): roads in the fork get a solid band in the track colour.** Compared in [mockups/pairings-fork.png](mockups/pairings-fork.png) (nine road signals with the same tracks), [mockups/band-width.png](mockups/band-width.png) and [mockups/band-fixed.png](mockups/band-fixed.png). Rule:

- An Unpaved road keeps its class fill and casing and gets a continuous band down the middle in the track colour of its level (brown Unpaved, dark brown High clearance, the 4WD colour above that). No dashes, so dashes keep meaning single track.
- Band width = 60% of the road fill on coloured roads (Julien, 2026-11-13, from [mockups/band-width.png](mockups/band-width.png); about 4.2 px on a trunk, 3.9 px on a primary at z15), 40% on white roads, minimum 0.8 px. A fixed track width (2.5 px, [mockups/band-fixed.png](mockups/band-fixed.png)) and 40% or 50% ([mockups/band-percent.png](mockups/band-percent.png)) were compared and dropped: the 60% band reads stronger on main roads. Trade-off accepted: on main roads the band is wider than a track, so a track leaving the road no longer continues it at the same width.
- White roads keep their white fill (no tan): white edges against the brown core keep the road a road. Side effect accepted: a track leaving a white road (2.5 px) looks heavier than the road's band (1.8 px).
- Plugin-ready (one extra stroke, no images). Grain stays the option for an official OsmAnd style later. Not for the roads article: on general maps brown lines are tracks (OSM Carto `grade1` tracks are solid brown), so the band only works where brown means dirt everywhere.

**Grain on roads, tested in OsmAnd (2026-11-13, osmand-render session).** Mockup: [mockups/roads-fork-grain.png](mockups/roads-fork-grain.png) (Julien's idea: one dirt tint, grain for High clearance and 4WD; drawn with grain on every dirt level too, since Unpaved with only a tint stays weak on orange and red). Test renders in `~/Workspaces/OSM/osmand-render/out/grain-test/` (`zoom-sheet.png` first), style `styles/grain-test.render.xml`, textures from `grain-test.py`.

- **Works in all three renderers**: a bitmap `shader` is applied to the main line stroke (layer 1; the casing stays plain) in core-legacy (`native/src/rendering.cpp` 286-291, 318-327), OsmAnd-core OpenGL (`src/Map/MapRasterizer_P.cpp` 293-301, 343-358) and the Android Java renderer (`OsmandRenderer.java` 726-733, 770-777). `pathIcon` dots along a line exist only in OpenGL (752-769), not in core-legacy, so they are no fallback.
- **Reads**: at z15 clearly on red, orange, yellow and white roads, as in the mockup; at z13 the dots survive but Unpaved and High clearance are hard to tell apart. The 4 px near-black 4WD tile is a loud checkerboard that could pass for a railway: try a lighter dot or a 5 to 6 px tile.
- **Blocker for a plugin**: the Android Java renderer loads textures only from drawables compiled into the app (`RenderingIcons.java` 277-283), so a style installed as a plugin cannot ship them (OpenGL icon provider not checked). Grain needs the images in OsmAnd's own resources, which fits the plan to redo the fork as an official OsmAnd style (todo item 28), not the first plugin release.
- **Cost**: the texture replaces the stroke colour, so one image per class colour, level and mode: 4 classes x 3 levels x 2 (day, night) = 24 images per palette. Tile periods of 4, 8 or 16 px avoid seams on 256 or 512 px tiles (the 6 px test tile does not).
- **To check on a device**: OpenGL loads textures at scale 1.0 (`MapRasterizer_P.cpp` 903-919), so on a 3x screen the dots may be a third of their size and vanish.

**Real-data crops (2026-11-19)**: [mockups/fork-crop-chiangrai.png](mockups/fork-crop-chiangrai.png), [mockups/fork-crop-thailand-1.png](mockups/fork-crop-thailand-1.png), [mockups/fork-crop-switzerland-2.png](mockups/fork-crop-switzerland-2.png) (`node mockups/make-fork-crops.mjs`). Scheme D and the 60% / 40% band drawn from the real tags of three track-round views, 900 x 600 dp at z15, at density 2, light mode, highways only (no landuse, so forest is not tested). The access rule in code: the first of `motorcycle`, `motor_vehicle`, `vehicle`, `access` that answers (`unknown` is no answer); footways, cycleways and bridleways follow the path rule; a `motorcycle=yes` wins over hiking tags (Claude's reading). switzerland-2 was picked over -1 and -3 for its closed share (18.5% of track km in the crop, against 11.5% and 3.9%). Km in each crop are printed on the sheet. Reading (Claude, to check):

- **Roads and tracks meet well.** At junctions the road keeps its white edges and grey casing, so a track leaving it does not read as the road going on. The trade-off noted above shows: the 40% band on white roads (1.8 dp) is lighter than the 2.5 dp track joining it, most visible at Chiang Rai, where 4.7 km of High-clearance unclassified roads cross Unpaved tracks.
- **Paved tracks pass for small roads.** In switzerland-2 (9 km of paved tracks) the narrow white line with grey casing is told apart from a residential road by width only. This follows from the rule (a paved track is a narrow road). Whether a rider needs to tell them apart is still open.
- **Closed ways are dense in Thailand too**: 21.1% of the track km in the thailand-1 crop (Phuket hills, a fenced network), not only in Switzerland.
- **Closed-way styles on switzerland-2**: the thin pale red recedes but reads as a path; crimson at track width is the loudest line on the map, so the ways you cannot ride stand out most; pale red with long dashes (14/4) at track width keeps the track weight and recedes, but at a glance it is still a dashed line, which means single track. No clear winner; thin pale red and long dashes are the two to choose between.

**Closed ways greyed out (Julien, 2026-11-19).** The long dashes looked best of the three reds, but every red version drew the eye to the ways you cannot ride. Closed ways are now grey, so the access rule reads: **brown = you may ride it, grey = you may not**. A closed track is a solid light warm grey `#c4bdb4` at track width (apart from the paved-track casing `#9a9a9a` and the dots `#6b6b6b`). A closed path gets the same grey dots as a path nobody said yes to, since both mean "not for you". Dashes mean single track again and nothing else. Drawn as the fourth panel of [mockups/fork-crop-switzerland-2.png](mockups/fork-crop-switzerland-2.png) and the second of [mockups/fork-crop-thailand-1.png](mockups/fork-crop-thailand-1.png). The closed network recedes and the open tracks stand out, and a closed way still shows, so it does not read as missing data. Night grey not chosen yet.

**Routing already matches (OsmAnd-resources `routing/routing.xml`, commit 85815c678, 2026-08-19).** The motorcycle profile is derived from the car profile. Its `access` attribute takes the first rule that matches, checked in this order: `motorcycle`, then `motorcar`, `motor_vehicle`, `vehicle`, then `highway` cycleway, footway and path, then `access`. The values `no`, `agricultural`, `forestry` (and both combined) give -1 (no access). `private` gives -1 unless the "Allow private access" setting is on. `yes`, `permissive`, `designated`, `destination` and `customers` give access. So:

- Closed ways are not routed through, with no custom `routing.xml` needed. This holds for every value the fork draws grey.
- `destination` is routable, with a penalty, so it is used only to reach a place on it. Since 2026-11-19 the fork no longer draws it grey (see "Closed roads, driveways" below), so map and router agree.
- Paths are blocked unless a `motorcycle`, `motorcar`, `motor_vehicle` or `vehicle` tag says yes, so the router also follows "dots = nobody said yes".
- One mismatch, on OsmAnd's side: `motorcar=no` with no `motorcycle` tag blocks motorcycles in the router, while the map (rightly) draws the way open, since `motorcar` does not cover motorcycles. Rare; worth an issue to OsmAnd later, not a fork change.

**Riding focus (proposal, 2026-11-19; Julien's three kinds of day, values by Claude, to check).** One rendering property with three values, shown in the fork's map settings. The colour ramp, the access rule and the classifier are the same in all three; only the emphasis changes. This updates Decision 1: the audience stays adventure, enduro and 4WD with one ramp, but the map stops pretending they all look for the same lines. Drawn on the three views: [mockups/fork-focus-chiangrai.png](mockups/fork-focus-chiangrai.png), [mockups/fork-focus-thailand-1.png](mockups/fork-focus-thailand-1.png), [mockups/fork-focus-switzerland-2.png](mockups/fork-focus-switzerland-2.png) (`node mockups/make-fork-crops.mjs`).

| | Road riding | Adventure riding (and 4WD) | Trail riding |
|---|---|---|---|
| Paved roads | lead: casings one step darker on white roads | class colours | **at 60%** (2026-11-19) |
| Unpaved and Off-road roads | band at full strength: the warning that the road turns to dirt (Julien, 2026-11-19; was faded to 30%) | **lead**: band 75% of the fill (55% on white roads) | band 60% / 40% (scheme D) |
| Paved tracks | lead: darker casing | as scheme D | as scheme D |
| Dirt tracks | **hidden** (2026-11-19; was faded); paved tracks kept as narrow roads | **all kept, full vehicle ladder**, 2 dp instead of 2.5 | as scheme D |
| Single tracks, paths, bridleways | hidden | hidden | **lead**: single tracks 2.2 dp; paths grey dashed |
| Footways, cycleways | hidden | hidden | hidden (2026-11-19) |
| Closed | roads grey; closed tracks hidden | grey | grey |
| `dirtbike:scale` | | | not rendered for now (documented below) |

- **4WD fits Adventure** because Adventure keeps the whole ladder instead of fading the hard tracks: a heavy bike reads near black as "stop", a 4WD driver as the goal; same line, each reader decides. Neither uses single tracks, so both lose them.
- **Adventure keeps Unpaved tracks**: whether a dirt road is mapped as a road or a track is the mapper's choice (98% of Thai tracks say nothing about their condition), so hiding tracks would cut real routes.
- **Reading of the crops**: Road riding makes the paved village network of thailand-1 readable at once; Adventure puts the High-clearance and 4WD network of the hills first with the paved roads quiet; Trail riding is scheme D with stronger single tracks. Chiang Rai in Road and Adventure loses its 8.8 km of moto paths, as intended.
- **Default when installed: to decide** (Claude's pick: Adventure riding, the largest audience and the closest to the roads article).

**`dirtbike:scale` in OsmAnd (checked 2026-11-19, OsmAnd-resources 85815c678, core-legacy 3317961). Not rendered for now (Julien, 2026-11-19): documented only, the symbols are out of the sheets.**

- **The data is already in the maps.** `obf_creation/rendering_types.xml` (category `dirtbike:scale`, lines 3105-3114) turns every way with `dirtbike:scale` into a `route_dirtbike` line and keeps the values 0 to 5 as additional tags from z12; 6 is commented out. No map change is needed.
- **OsmAnd already draws it**, in `rendering_styles/routes.addon.render.xml` (lines 1273-1291, setting `showDirtbikeTrails`): a 6 to 13 dp line with round caps and `pathEffect` 1_20 to 1_70, which gives coloured dots along the way, green to maroon by value. That is a dash pattern, so it works in core-legacy too.
- **Symbols with dashes only**: a round cap on a near-zero dash is a dot, a butt cap with dash = width is a square, and two dashes close together make a pair. So dots, pairs and squares work in every renderer; a diamond does not (a shape needs `pathIcon`, OpenGL only, as found in the grain test). Proposal, black on a white halo, every 48 dp: 0-1 one dot, 2 two dots, 3 three dots, 4-5 a bar (10 dp). Count and length carry the level, no colour (green and blue would clash with the ramp and with water) and no shape: the first set (dots, pairs, squares) could not be told apart at 4 dp (Julien, 2026-11-19). Every mark is a round-cap dash, so the halo is the same dashes, wider. The halo is a second line layer (`strokeWidth_2`, `pathEffect_2`). Not yet tried in `osmand-render`.
- **Labels from the tag are not possible**: core-legacy text comes from name tags only (`renderText`), and `dirtbike:scale` is an additional tag, not a name, so a "2" shield cannot be drawn from it.
- **Data**: none in the three views and none in Switzerland. The symbols are shown on a sample line in the legend only.

**Paths dashed grey, not dotted (Julien, 2026-11-19).** The pattern says what kind of way it is, the colour whether you may ride it:

| | You may ride it | You may not |
|---|---|---|
| Solid (double track) | brown, by vehicle needed | grey |
| Dashed (single track, 7/3) | brown, by vehicle needed | grey |

One light warm grey `#c4bdb4` for every way you may not ride: closed tracks and paths, paths nobody said yes to (no `motorcycle`, `motor_vehicle`, `vehicle` or `access` answer), hiking paths, and `smoothness=impassable` (solid on a track, dashed on a path). No dots are left in the scheme, and the two greys of the first grey version (dark dots `#6b6b6b`, light closed tracks) become one. This replaces the dots of 2026-11-13: "nobody said yes" is no longer a look of its own, it is grey like a "no". A hiking path now reads as what it is for a rider, a single track you may not ride. Drawn in every grey panel and focus sheet; density check in [mockups/fork-crop-switzerland-1.png](mockups/fork-crop-switzerland-1.png) (55 km of paths in the crop: dots, dashes 1.75 dp, dashes 1.4 dp). Reading: the grey dashes are quieter than the dark dots, though more continuous; at Chiang Rai brown and grey dashes are clearly apart. 1.4 dp is calmer in towns; whether forbidden paths should be thinner than rideable single tracks (1.75 dp) is for Julien.

**Road casing (Julien, 2026-11-19: road strokes too soft).** The OSM Carto white-road casing (`#bbbbbb`, 0.6 dp a side) almost vanishes on the land colour. Four casings compared in [mockups/fork-casing-thailand-1.png](mockups/fork-casing-thailand-1.png) and [mockups/fork-casing-switzerland-1.png](mockups/fork-casing-switzerland-1.png): current; A `#8f8f8f` at 0.6 dp; B `#8f8f8f` at 1 dp a side; C `#6f6f6f` at 1 dp. White roads and paved tracks take the grey (a paved track is a narrow road); coloured roads keep their class casing at the new width. Reading (Claude): A is still soft; B gives every road a clear edge without turning the town into a line drawing; C is the clearest but heavy in towns, and its dark edges compete with the dark-brown tracks. **Decided: B (Julien, 2026-11-19).**

**White-road hierarchy and service roads (Julien, 2026-11-19).** Casing B, `#8f8f8f` at 1 dp a side, with steps by class, since the white class covers everything from tertiary to service:

| Class | Casing | Width (z15) |
|---|---|---|
| tertiary, unclassified | `#6f6f6f` (darker than the minor roads, Julien; tertiary goes with unclassified, Claude's reading) | 5.5, 4.5 dp |
| residential | `#8f8f8f` | 4 dp |
| service | `#a8a8a8`, the whole road at 45% opacity | 3 dp |
| paved track | `#8f8f8f` (a narrow road, as residential) | 2.5 dp |

- **Service roads faded by default**: they are often private (Julien). Driveways, parking aisles and drive-throughs are left out at z15 (OSM Carto shows them from z16). A service road whose first access answer is no, private, agricultural, forestry or destination is grey like any way you may not ride. In the crops: thailand-1 15.3 km faded and 2.3 km grey; switzerland-1 9.3 km and 2.3 km.
- **Road riding focus** darkens each step once (`#4f4f4f`, `#6f6f6f`, `#8f8f8f`) on paved white roads.
- Data: `pbf/<country>-service.geojsonseq`, extracted on 2026-11-19 from the same Geofabrik files (commands at the top of `mockups/make-fork-crops.mjs`). Every crop and focus sheet is redrawn with this; the casing comparison sheets stay as drawn.

**Closed roads, driveways, footways, and the focus changes (Julien, 2026-11-19).**

- **Closed roads grey.** A road of any class whose first access answer (`motorcycle`, `motor_vehicle`, `vehicle`, `access`) is no, private, agricultural or forestry is a solid grey `#c4bdb4` line at its own width, with no casing, class colour or band. In the crops: 1.4 km in thailand-1, 1.7 km in switzerland-1.
- **`destination` is not a no any more**, on roads, tracks and paths. It is common on residential streets, and OsmAnd routes it to reach a place on it. Closed track in switzerland-2: 17.4% of track km (was 18.5%).
- **Service roads**: faded white by default; grey when private or no; `service=driveway` grey (a driveway leads to a private house or plot), from z16 only, since driveways are too dense at z15 (OSM Carto shows them from z16). Parking aisles and drive-throughs also from z16, faded. Zoom 16 check: [mockups/fork-crop-switzerland-1-z16.png](mockups/fork-crop-switzerland-1-z16.png) (2.1 km of driveways in the crop; widths kept at their z15 values, so roads look thinner than OsmAnd would draw them).
- **Footways and cycleways hidden in every focus**: a motorbike may never ride them, and in towns they are dense clutter beside the roads (switzerland-1: paths in the crop drop from 54.8 to 16.1 km). With `motorcycle=yes` they stay a brown single track. Paths and bridleways stay grey dashed in Trail riding.
- **Road riding**: dirt tracks and closed tracks hidden, not grey, since grey says "you may not ride it", which is false for a dirt track. Paved tracks stay as narrow roads. Unpaved roads keep the band at full strength: on a road day it is the warning that the road turns to dirt (Julien, 2026-11-19).
- **Trail riding**: paved roads drawn at 60% (casing and fill), under the dirt roads, whose brown band stays at full strength. Road riding keeps the dirt band on roads at full strength: on a road day it is the warning that the road turns to dirt (Julien, 2026-11-19).

**Readability: Garmin and DMD2 review, high-visibility palette (2026-11-19).** Julien: colours hard to read; large and contrasted is easier for older riders with poor eyesight. Compared: AdvOSM and GmapTool Garmin maps of Tanzania ([examples/advosm/](examples/advosm/)), DMD2 (`examples/screenshots/*/dmd2.png`), our crops.

- **AdvOSM (Garmin) reads best**: saturated red, orange, yellow and green on white, thick lines, unpaved as a pattern (yellow with black dashes), road numbers in shields, almost nothing else drawn. GmapTool has the same data and is much harder to read, so the drawing is what works, not the data.
- **DMD2's map is not its draw**: thin lines (green tracks on a hillshade, unpaved roads as a fine yellow and black dash). Its popularity more likely comes from the app (glove-friendly buttons, roadbook and rally tools, offline maps) and the hillshade. Inferred from the screenshots, not checked with users.
- **Our fills are pastel** (OSM Carto): contrast against the land 1.06 for the secondary fill, 1.20 primary, 1.54 trunk, 1.15 white; the class reads only from the thin casing (about 4). Made for a desk screen, not a handlebar in sunlight.
- **High-visibility palette** ([mockups/fork-hivis-thailand-1.png](mockups/fork-hivis-thailand-1.png), [mockups/fork-hivis-switzerland-1.png](mockups/fork-hivis-switzerland-1.png), `HIVIS` in `mockups/make-fork-crops.mjs`): saturated fills (trunk `#e8503a`, primary `#f39c26`, secondary `#f4e04a`, darker casings), every line 1.5 x wider, a near-black edge around the dirt band inside coloured roads, road numbers in white shields (trunk to tertiary, one per ref and 260 dp apart). Contrast printed on the sheets: trunk fill 3.24, primary 1.91, trunk casing 7.58, primary casing 5.09; yellow stays low in luminance (1.17) but reads by saturation, as on the Garmin maps. Reading (Claude): the classes and numbers read at a glance; risks: the orange primary is closer in hue to the brown tracks, and 1.5 x white streets crowd towns. OsmAnd also has a "Map magnifier" setting that enlarges everything; the defaults should still be readable at 100%. Proposal: make it the fork's default palette, to confirm.

**Readability score (2026-11-19, `python3 mockups/score-readability.py`).** Seven measures, each mapped to 0-10 between a floor and a target, mean as the score. Colour distance is CIE76 Delta E, the worst of normal vision and the three colour-blind simulations (Machado 2009). AdvOSM colours sampled from its Tanzania screenshot; measures that do not apply to it are n/a. The thresholds are Claude's, so the score ranks palettes, it is not an absolute grade.

| Measure (floor -> target) | Now | High vis | High vis 2 | AdvOSM (ref.) |
|---|---|---|---|---|
| Fill contrast (1 -> 3) | 1.3 (1.27) | 5.5 (2.11) | 7.3 (2.46) | 9.5 (2.89) |
| Class separation (colour-blind) (5 -> 30) | 0.9 (7.16) | 4.1 (15.25) | 5.8 (19.48) | 7.0 (22.40) |
| Dirt signal in roads (1 -> 3) | 5.7 (2.14) | 10.0 (4.52) | 10.0 (3.65) | 10.0 (4.17) |
| Tracks apart from roads (5 -> 30) | 7.3 (23.28) | 1.0 (7.50) | 7.8 (24.38) | n/a |
| Minor road width (px) (6 -> 14) | 3.8 (9.00) | 9.4 (13.50) | 9.4 (13.50) | n/a |
| Track width (px) (4 -> 9) | 2.0 (5.00) | 7.0 (7.50) | 7.0 (7.50) | n/a |
| Road numbers (0 -> 10) | 0 (no) | 10 (yes) | 10 (yes) | 10 (yes) |
| **Score (mean)** | **3.0** | **6.7** | **8.2** | **9.1** |

- **High vis fails one measure**: its red trunk `#e8503a` and the brown Unpaved track are almost the same colour for red-green colour-blind riders (Delta E 7.5 with deuteranopia, 8.7 protanopia), and primary and secondary are close for tritanopia (15.2).
- **High vis 2** fixes both: crimson-rose trunk `#d6336c` (casing `#7a1236`) and a deeper orange primary `#ef8a1f` (casing `#8a4a08`). Score 6.7 to 8.2; AdvOSM 9.1, mostly from its white land and higher fill contrast. Drawn as the third panel of the high-visibility sheets. Trade-off: the trunk moves away from the Carto red toward pink, so motorways (not in the extract, see below) will need a colour of their own, such as a dark blue or purple.

**Decision (Julien, 2026-11-19): High vis 2 is the fork's palette.** Every crop and focus sheet is redrawn with it (`DEFAULT_P` in `mockups/make-fork-crops.mjs`; the high-visibility sheets keep the Carto palette as "Carto" for comparison).

**How to make it better (2026-11-19, Claude's proposal, to rank with Julien).** The palette is near its ceiling: pure white land lifts the fill contrast only from 2.46 to 2.83 (and white roads then have only their casing), and the weakest pair left, primary and secondary under tritanopia (Delta E 19.5), barely moves with other yellows (14.5 to 20.8). The next gains are elsewhere:

1. **Test on a real phone, outdoors.** Render the fork style in OsmAnd (`osmand-render`, then on a device at 100% and 150% magnifier) and look at it in sunlight on a handlebar mount. The score measures colours, not glare or a 6-inch screen.
2. **Reader test round 3 with riders**, including older ones: the same method as rounds 1 and 2 (find the unpaved road, find the track you may ride), on fork crops instead of article styles. The only way to know whether the score's thresholds match people.
3. **Thin out towns.** At 1.5 x widths, residential streets and service roads crowd towns (switzerland-1). Options: residential at 1.25 x instead of 1.5 x, service roads hidden below z16, or both.
4. **Generalise for z10 to 13**, where trips are planned and where the Garmin look is strongest: only trunk to tertiary, Unpaved roads and Off-road tracks, road numbers.
5. **Tracks a little wider**: 3.75 dp now (7.5 px), the score's target is 9 px (4.5 dp). Check it does not make tracks look like roads.
6. **Shields**: tested at 13.5 px text; check on the phone, and decide whether unpaved main roads get a marked shield (for example a brown border).
7. **Night version** of High vis 2 (dark land, the night ramp of 6.4).

**Track colours rated, and three changes (2026-11-19).** Rating (Claude): order readable without a legend 9, colour-blind safe (lightness only) 10, meaning (brown = dirt, near black = hard) 9, apart from roads 8 (Delta E >= 24), apart from grey 9 (Delta E 40), default Unpaved visible on the land 6 (contrast 3.3), a lone Unpaved told from High clearance 6 (2.06 between them), band edge clash 4; about 7.5 overall. Changes:

- **`smoothness=very_horrible` tracks drawn as single tracks** in the 4WD colour (Julien: only a bike, ATV or tractor gets through, it should be mapped as a path; the article classifier's "specialized"). 4WD (solid near black) keeps `horrible`, `grade5` to `grade8`, `mud` and `4wd_only`. Roads with `very_horrible` keep the solid near-black band.
- **Band edge in coloured roads: neutral dark grey `#3d3d3d`** instead of the 4WD near black, so an Unpaved trunk no longer reads as 4WD. Cost: the dirt signal inside crimson trunks drops (edge against fill 2.35, score 10 to 6.8). An edge in each road's casing colour was worse (1.3 against the band on a yellow secondary), so the grey stays.
- **Rust middle step, variant**: High clearance `#7a3a14` (deeper than option C's `#8c3a10`, which came closer to the Unpaved brown for colour-blind riders: Delta E 18.6 against 23.1). [mockups/fork-ramp-thailand-1.png](mockups/fork-ramp-thailand-1.png): grade4 tracks get a look of their own. Not adopted yet, Julien to decide.

Score after these changes (a new measure, ramp steps apart, added; the scores are not comparable with the table above):

| Measure (floor -> target) | Now | High vis | High vis 2 | High vis 2 + rust | AdvOSM (ref.) |
|---|---|---|---|---|---|
| Fill contrast (1 -> 3) | 1.3 (1.27) | 5.5 (2.11) | 7.3 (2.46) | 7.3 (2.46) | 9.5 (2.89) |
| Class separation (colour-blind) (5 -> 30) | 0.9 (7.16) | 4.1 (15.25) | 5.8 (19.48) | 5.8 (19.48) | 7.0 (22.40) |
| Dirt signal in roads (1 -> 3) | 5.7 (2.14) | 10.0 (4.52) | 6.8 (2.35) | 6.8 (2.35) | 10.0 (4.17) |
| Tracks apart from roads (5 -> 30) | 7.3 (23.28) | 1.0 (7.50) | 7.8 (24.38) | 7.8 (24.38) | n/a |
| Ramp steps apart (10 -> 30) | 5.5 (20.90) | 5.5 (20.90) | 5.5 (20.90) | 6.5 (23.06) | n/a |
| Minor road width (px) (6 -> 14) | 3.8 (9.00) | 9.4 (13.50) | 9.4 (13.50) | 9.4 (13.50) | n/a |
| Track width (px) (4 -> 9) | 2.0 (5.00) | 7.0 (7.50) | 7.0 (7.50) | 7.0 (7.50) | n/a |
| Road numbers (0 -> 10) | 0 (no) | 10 (yes) | 10 (yes) | 10 (yes) | 10 (yes) |
| **Score (mean)** | **3.3** | **6.6** | **7.4** | **7.6** | **9.1** |

**Barriers (Julien, 2026-11-19: would rather not show them; could get ugly quickly).** Proposal: do not draw `barrier=gate` and the like, except a barrier node that blocks (`access`, `motorcycle` or `motor_vehicle` = no or private): a small light grey bar across the line, from z16. Do not grey the whole track: most gates are open or passable, a closed one blocks only part of the way, and the map cannot tell which side; OsmAnd routing already reads the access tags on barrier nodes. Not drawn (barrier nodes are not in the extract).

**Still missing from the fork mockups (2026-11-19, priority order, Claude's proposal):**

1. Road numbers: drawn in the high-visibility sheets; to carry into every sheet if the palette is adopted.
2. Fuel stations, for adventure riding.
3. Zooms 10 to 13, where trips are planned (every sheet so far is z15).
4. Fords and water crossings.
5. Place names.
6. Hillshade or contours (6.5, to evaluate; part of DMD2's look).
7. Night mode for the new rules (grey, focus, hierarchy, high visibility).
8. Blocking barriers as above (z16+).
9. Motorways: not in the extract (the osmium filter stops at trunk); they need a colour apart from the new trunk.

### 6.5 Background, hillshade and contours (to evaluate)

Julien's task (2026-11-13): find the land colours, landcover, hillshade and contour lines that work best under the combined scheme ([mockups/picks-combined.png](mockups/picks-combined.png)). Preference: a **light background**, as in the OsmAnd Motorcycle plugin, Gaia GPS and cycle.travel.

Constraints from the scheme (brown carries meaning, so the background must not):

- **Contours not in the track brown**, or only far fainter and thinner. Brown contours are the classic topo look (OpenTopoMap and national topo maps), but here a brown line means a dirt track. Separate them by width (contours 0.5 to 1 px against 2.5 px tracks) and by contrast (contours barely above the land).
- **Hillshade neutral grey, not warm**, and light: a brown or ochre shade under brown tracks lowers their contrast and tints the white roads.
- **Landcover pale and low in saturation.** No tan or sand fill that competes with the Unpaved brown or with the white roads; forest a pale green.
- **Check the ramp on the darkest slope:** the contrast of each track step and of the road band against each landcover with the hillshade at its darkest, not only on flat land.

Starting point, the Motorcycle plugin (`enduro.render.xml`): forest `#dce6d0`, scrub `#e9efd9`; contours default `#333333` at about 12% opacity (`contourLineColor`, L428), with selectable schemes (white, yellow, green, red, and three browns `#886633` at 12 to 21%). So its default contours are already a faint grey, which suits the scheme.

To review: the OsmAnd Motorcycle plugin, Gaia GPS (Topo), cycle.travel; OpenTopoMap and a national topo map as the brown-contour counterexample. Same views as the track round (Chiang Rai flat, and a Swiss alpine view for slopes and contours); the track-round shots already cover Gaia GPS.

**Land colour research (2026-11-19).** Julien likes the light backgrounds of AdvOSM, Gaia GPS and the OsmAnd Motorcycle plugin. Colours read from the style sources where available, otherwise sampled from the track-round screenshots (most common colours, 4-level steps, so about +-2 per channel):

| Map | Land | Forest | Grass, meadow | Farmland | Water | Source |
|---|---|---|---|---|---|---|
| OSM Carto | `#f2efe9` | `#add19e` | `#cdebb0` | `#eef0d5` | `#aad3df` | style (forest confirmed in the screenshot, `#acd09c`) |
| OsmAnd default | `#ebe7e4` | `#87cc70` | `#94d77b` (meadow `#91d47b`) | none | `#5cc3e5` | `default.render.xml` (`defaultColor`, `woodColor`, `grassColor`, `waterColor`) |
| OsmAnd Motorcycle | `#f9f9ef` | `#dce6d0` (scrub `#e9efd9`) | `#e3f6e3` | `#f9f9ef` (as land) | `#80b0ff` | `enduro.render.xml` f0676ed (`defaultColor`, `foret`, `broussaille`, `herbe`, `culture`, `eau`); a grey mode exists (`gris`: land `#f0f0f0`, forest `#c9d6c9`) |
| AdvOSM (Garmin) | about `#fcfcfc` (white) | about `#ccf0cc` | | | about `#3090f0` | sampled, Tanzania screenshot |
| Gaia GPS | about `#f0f0dc` | about `#d6e4ce` | | | | sampled, track-round screenshots (Switzerland, Thailand); its hillshade blends in |
| Komoot (for comparison) | about `#e8ecd4` | about `#c8d498` | | | | sampled |

What the light maps share: land near white (AdvOSM pure white, Motorcycle and Gaia a faint warm or yellow cream), forest a pale green only 1.15 to 1.24 in contrast from the land (Carto 1.48, OsmAnd default 1.57), farmland not drawn or drawn as land, few other fills. OsmAnd's default is the opposite: grey-beige land and a strong green.

Contrast of the fork's colours (High vis 2) on land / on forest:

| Background | Unpaved track | Grey (may not ride) | Residential casing | White road fill | Secondary fill | Primary fill |
|---|---|---|---|---|---|---|
| Carto | 3.30 / 2.23 | 1.62 / 1.10 | 2.82 / 1.91 | 1.15 / 1.69 | 1.17 / 1.26 | 2.20 / 1.49 |
| OsmAnd default | 3.08 / 1.97 | 1.51 / 1.04 | 2.63 / 1.68 | 1.23 / 1.93 | 1.09 / 1.43 | 2.05 / 1.31 |
| Motorcycle | 3.57 / 2.93 | 1.76 / 1.44 | 3.05 / 2.51 | 1.06 / 1.29 | 1.27 / 1.04 | 2.38 / 1.95 |
| Gaia (sampled) | 3.28 / 2.86 | 1.61 / 1.40 | 2.80 / 2.44 | 1.15 / 1.33 | 1.17 / 1.02 | 2.19 / 1.90 |
| AdvOSM (sampled) | 3.79 / 3.05 | 1.86 / 1.50 | 3.23 / 2.60 | 1.00 / 1.24 | 1.35 / 1.08 | 2.52 / 2.03 |
| **Proposal** | **3.63 / 3.08** | **1.78 / 1.52** | **3.10 / 2.63** | 1.04 / 1.23 | 1.29 / 1.10 | 2.42 / 2.06 |

Reading:

- **The forest colour matters more than the land colour.** In Carto and OsmAnd forest, the Unpaved track falls to 2.2 and 2.0 and the grey of "may not ride" disappears (1.10, 1.04). Under a pale forest (Motorcycle, Gaia, AdvOSM) tracks keep about 3 and the grey stays visible. Most Thai and Swiss tracks run through forest or farmland, so this is where the map is read.
- **Lighter land helps every line a little** (Unpaved 3.30 on Carto land to 3.63 to 3.79 on near-white) and costs only the white road fill, which then has no contrast at all (1.00 to 1.06). With casing B the roads are carried by their edges, so this is acceptable, as on the Garmin maps.
- **The yellow secondary fill is weak on any light background** (1.0 to 1.35); it reads by saturation and its casing, as on AdvOSM.

**Proposal for the fork** (Claude, to check on the crops): land `#fbfaf6` (near white, a trace of warmth so it is not a blank screen in the dark), forest `#e2ebd8` (between Motorcycle and Gaia), grass and meadow `#edf3e4`, scrub as grass, farmland not drawn (as land, as Motorcycle), residential areas a very light grey `#f1f0ed` or not drawn, water `#9cc3ea` (a clear blue, lighter than AdvOSM's, still blue at a glance). Same principle as the plugin's: landcover only tells forest from open land, everything else is left to the lines. Next: extract the landcover of the crop views (osmium, landuse and natural polygons) and draw High vis 2 over Carto, Motorcycle and the proposal, which is the deliverable below.

**Decision (Julien, 2026-11-19): the proposal is the background** (land `#fbfaf6`, forest `#e2ebd8`, grass and scrub `#edf3e4`, farmland not drawn, residential `#f1f0ed`, water `#9cc3ea`): easier to read than the Motorcycle plugin's, and not taken from it. Every sheet now uses this land colour.

**Decision (Julien, 2026-11-19): Julien's own style, not a fork of the Motorcycle plugin.** The Motorcycle style (`enduro.render.xml`) is GPL v3, so a fork would have to stay GPL. The new style is written as Julien's own version: the Motorcycle plugin stays a reference for behaviour reviewed in A6 and section 5, but no code or values are copied from it; the colours and rules here are this project's own. Note: OsmAnd-resources, where `default.render.xml` lives, says it is "mainly covered by GPLv3, except some resources", so starting from OsmAnd's default style raises the same question; check which files are excepted before reusing any of it, or write the style from scratch. Not legal advice. "Fork" in the sections above now means this new style. **Confirmed (Julien, 2026-11-19): minimal, no fork.** The style stays as small as possible: an override-only style on OsmAnd's default (`depends="default"`, as OsmAnd's desert, osm-carto, snowmobile and Touring-view styles do), drawing only roads, tracks, paths, landcover and the riding focus; labels, POIs, water and buildings come from OsmAnd. First step: a test style in `osmand-render` with only the band and the brown track ramp, on the thailand-1 view. Small fixes to the Motorcycle repo (A6) stay optional, not decided.

**Drawn on real landcover (2026-11-19)**: [mockups/fork-land-thailand-1.png](mockups/fork-land-thailand-1.png), [mockups/fork-land-switzerland-1.png](mockups/fork-land-switzerland-1.png), [mockups/fork-land-switzerland-2.png](mockups/fork-land-switzerland-2.png), [mockups/fork-land-chiangrai.png](mockups/fork-land-chiangrai.png): High vis 2 over Carto, Motorcycle and the proposal, with the landcover of the Geofabrik 2026-11-12 extract (landuse, natural, waterway and leisure=park around each view: `pbf/land-<view>.geojsonseq`, commands in `mockups/make-fork-crops.mjs`; about 120 to 290 areas per view, only 17 features at Chiang Rai, where landcover is barely mapped). Reading (Claude): in Carto's forest the tracks and the grey "may not ride" ways almost disappear (Phuket hills, thailand-1), as the contrast table predicted; Motorcycle and the proposal keep the brown ramp, the grey and the white roads readable in forest; the proposal's near-white land makes open land a little crisper than Motorcycle's cream, and its forest is about the same. Proposal stands, to confirm by Julien. Hillshade and contours not drawn yet (no elevation data here).

**Water, fords and bridges (2026-11-19, Claude's advice, Julien to confirm).** All three come from OsmAnd's default style, which the minimal style inherits:

- **Rivers kept**, recoloured to the background's water `#9cc3ea` (one colour override). They are the main landmark outside towns, and a ford needs its river to make sense.
- **Fords kept as OsmAnd draws them**: its maps keep `ford=yes` and `ford=stepping_stones` from z14 (`rendering_types.xml`, which also turns `flood_prone=yes` into a ford), and `default.render.xml` draws a ford icon in a small shield on ford nodes and ways (lines 5121, 6600-6602). Check in the first test render that the icon reads on the 1.5 x tracks and at z14; scale it up only if needed. Routing already has an "avoid fords" setting (`avoid_ice_roads_fords`).
- **Bridges inherited**: they tell the rider there is no ford.

**Hillshade and contours: plan (2026-11-19, waiting for Julien).**

- In OsmAnd the style controls **contour lines** (colour, width, minimum zoom; from OsmAnd's separate contour-line downloads), but **hillshade** is a raster layer of the Terrain plugin whose opacity the rider sets. So the question for the style is how strong the hillshade may get before the ramp and the grey suffer; the answer becomes the recommended opacity in the docs.
- Data: Copernicus GLO-30 DEM, public on AWS without an account, tiles N07E098 (thailand-1), N20E099 (chiangrai), N47E008 (switzerland-1), N46E007 (switzerland-2), about 30 to 40 MB each, into the git-ignored `pbf/`.
- Tools: GDAL is installed but broken (Homebrew library mismatch: `libabsl` missing for apache-arrow). Either `brew upgrade gdal` (changes the system, Julien's call) or compute hillshade and contours in Python without GDAL.
- Variants on thailand-1 and switzerland-2 over the proposed background: A no hillshade, contours grey, faint, 0.5 dp, 20 m; B neutral grey hillshade about 25%; C about 50% plus 100 m index contours a little darker. Measure each ramp step, the grey and the road casings on the darkest slope, and add it to the score.

Deliverable: [mockups/picks-combined.png](mockups/picks-combined.png) redrawn over three or four background candidates (land and landcover, hillshade, contours), with the contrast of each ramp step measured on the darkest slope.

## 7. Test plan

1. **Views**: the seven track-round views in [examples/track-spots.md](examples/track-spots.md) (Chiang Rai and two more in Thailand, three in Switzerland), all with tracks of every grade, paved tracks, moto paths and Unpaved and Off-road roads side by side.
2. **Desktop render**: `~/Workspaces/OSM/osmand-render` (`render.sh`, GPX waypoints to PNGs) at z13 to z16, light and night, before and after each change.
3. **Phone check**: the arm64 Android emulator with the fork installed, then Julien's phone in the sun at Chiang Rai.
4. **Pass if**: at z15 a reader tells, without the legend, a track from an Unpaved road and a moto path from a hiking path; the three track levels are told apart at z14 and z15; no track looks like a tunnel.
5. **Data to add**: access values on Swiss tracks; the same coverage table for one or two other riding countries (Laos, Morocco) to see whether Thailand or Switzerland is the usual case.
