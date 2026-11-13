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
| Thin pale red `#e07878` | Closed: `motorcycle`, `motor_vehicle`, `vehicle` or `access` = no, private, agricultural, forestry, destination (first key that answers). Keeps its solid or dashed pattern. Bright red with cross bars dropped: too aggressive, and it would make the ways you cannot ride the loudest on the map |

**Access rule in one sentence: red = someone said no, dots = nobody said yes** (`unknown` counts as nobody). `motorcycle=no` goes red, not grey: it is the one case where the data is certain, and a route planner needs that line. Density, measured 2026-11-13 by the first explicit key: Switzerland 13.3% of track km (`motor_vehicle=no` 3.2, `forestry` 2.7, `motorcycle=no` 1.7, `agricultural` 1.0, `private` 0.8) and 3.6% of path km; Thailand 0.2% of track km and 1.8% of path km. One Swiss track in eight in red is the test the thin pale line has to pass; the plugin's switch to hide access colouring stays as the fallback. If the Thai map ever feels too thin, a regional option "treat untagged paths as rideable" could come later; not built now.

**No "unknown" look for tracks** (2026-11-13): an untagged track (TH 19%, CH 15% of track km) and `surface=unpaved` (TH 76%, CH 2%) are both the plain brown Unpaved line, the same as a `grade2` gravel track. All three say "unpaved, nothing says it is rough", which is true tagged or not; the classifier already treats them alike (rule 5) and the roads article made the same choice. A distinct look would cover 96% of Thai tracks (the plugin's green dashes do exactly that) and sprinkle random marks over Switzerland; Carto's dash-dot for unknown `tracktype` was dropped from the road styles for the same reason. Certainty is not a property of the ground, so it does not go on the line.

**Survey toggle, off by default, for mappers** (Julien, 2026-11-13: good idea; later; drawn in the second group of [mockups/tracks-solid.png](mockups/tracks-solid.png)): fades every track and every rideable single track that has no information about its condition: no `tracktype`, no `smoothness`, and either no `surface` or only `surface=unpaved` (a surface tag, but nothing a surveyor would record; Claude's reading, to confirm). Measured 2026-11-13: tracks 94.3% in Thailand, 15.3% in Switzerland; moto paths 79.0% and 9.5%. Paths with no access answer (no tag, or `access`/`motorcycle=unknown`) fade too (Julien, 2026-11-13): unknown access is a survey question as much as unknown condition. Impassable keeps its dots (an answer), closed ways keep their red. It is the plugin's "cacher chemin sans info" done so that it works (one rendering property). Roads could join later (58% of road km have no `surface` and are assumed paved), but that belongs with the surface surveys, not with this scheme.

Finer difficulty than the vehicle ladder (grade2 vs grade3) is not drawn: `tracktype` measures firmness, not skill. Skill has its own tag, `dirtbike:scale`, defined for tracks and paths; if wanted, it becomes symbols along the line (circle, square, diamond, as ski and IMBA ratings), only where tagged. Low priority, not now (Julien, 2026-11-13): 13 km of Thai paths carry it, none in Switzerland. `mtb:scale` (12% of Swiss path km) is a bicycle scale and is left alone.

**Vehicle ladder (Julien, 2026-11-13): the article's Off-road mark is split in two for the fork.** `smoothness` is a vehicle ladder (bad or better a normal car, very_bad high clearance, horrible 4WD), so the fork draws the vehicle needed, not the surface: in Thailand many double tracks take a pickup but not a city car, and the article's single Off-road level hides that. Darker = needs more vehicle; one hue, so the order reads without a legend and holds for colour-blind readers (Julien's earlier renderer used three hues for city, pickup and 4WD: the same classes with no order). The lightest dirt level is "nothing says it is rough", not "city car": it holds the confirmed mild tracks and the 94% of Thai tracks with no information, and the survey toggle is where the two come apart. Judgment calls: `grade5` to 4WD (soft ground is a traction problem when wet, the plugin's "selon météo" idea); `very_horrible` into 4WD rather than a step of its own (rare, and no Specialized colour). Precedence as in the classifier: `smoothness`, then `tracktype`, then `surface`; `4wd_only` as a minimum. Roads in version 3 would take the same three dirt tints; not drawn yet.

Night: brighter = needs more vehicle (`#9c6a3a`, `#d1a068`, `#f7e3c6`), paved track dark grey with a lighter casing. Contrast by day: Unpaved 3.30 on land and 2.93 on forest, High clearance 6.80 and 6.05, 4WD 14.67 and 13.05, steps 2.06 and 2.16; by night 3.48, 6.85, 12.85, steps 1.97 and 1.87.

**Roads in the fork** ([mockups/roads-fork.png](mockups/roads-fork.png), five versions of Unpaved and Off-road roads next to a solid Unpaved track, white, yellow, orange and red roads at z15 and z13 widths): 1 brown fill with the class casing, 2 brown core with class-coloured edges, 3 class tint with a solid brown casing, 4 dashed fill (style 3), 5 dashed casing (style 4). Reading: 1 loses the class (yellow, orange and red look the same, and at z13 a road is a fat track); 2 reads as a track laid on a road; 4 and 5 bring the dashes back. Proposed: 3, the only version without dashes that keeps the class, and it follows the track rule (browner and darker = rougher). If Paved to Unpaved is too subtle on the phone, strengthen the tint, not add a pattern. Not decided yet; the dashed fill (4) stays a fair candidate. Light mode only; widths estimated, not OsmAnd's.

**Grain on roads, tested in OsmAnd (2026-11-13, osmand-render session).** Mockup: [mockups/roads-fork-grain.png](mockups/roads-fork-grain.png) (Julien's idea: one dirt tint, grain for High clearance and 4WD; drawn with grain on every dirt level too, since Unpaved with only a tint stays weak on orange and red). Test renders in `~/Workspaces/OSM/osmand-render/out/grain-test/` (`zoom-sheet.png` first), style `styles/grain-test.render.xml`, textures from `grain-test.py`.

- **Works in all three renderers**: a bitmap `shader` is applied to the main line stroke (layer 1; the casing stays plain) in core-legacy (`native/src/rendering.cpp` 286-291, 318-327), OsmAnd-core OpenGL (`src/Map/MapRasterizer_P.cpp` 293-301, 343-358) and the Android Java renderer (`OsmandRenderer.java` 726-733, 770-777). `pathIcon` dots along a line exist only in OpenGL (752-769), not in core-legacy, so they are no fallback.
- **Reads**: at z15 clearly on red, orange, yellow and white roads, as in the mockup; at z13 the dots survive but Unpaved and High clearance are hard to tell apart. The 4 px near-black 4WD tile is a loud checkerboard that could pass for a railway: try a lighter dot or a 5 to 6 px tile.
- **Blocker for a plugin**: the Android Java renderer loads textures only from drawables compiled into the app (`RenderingIcons.java` 277-283), so a style installed as a plugin cannot ship them (OpenGL icon provider not checked). Grain needs the images in OsmAnd's own resources, which fits the plan to redo the fork as an official OsmAnd style (todo item 28), not the first plugin release.
- **Cost**: the texture replaces the stroke colour, so one image per class colour, level and mode: 4 classes x 3 levels x 2 (day, night) = 24 images per palette. Tile periods of 4, 8 or 16 px avoid seams on 256 or 512 px tiles (the 6 px test tile does not).
- **To check on a device**: OpenGL loads textures at scale 1.0 (`MapRasterizer_P.cpp` 903-919), so on a 3x screen the dots may be a third of their size and vanish.

Next: draw the Chiang Rai and one Swiss view from the track round in scheme D from the real tags, with two or three closed-way styles, so the density of red and the Paved to Unpaved step can be judged before touching OsmAnd.

## 7. Test plan

1. **Views**: the seven track-round views in [examples/track-spots.md](examples/track-spots.md) (Chiang Rai and two more in Thailand, three in Switzerland), all with tracks of every grade, paved tracks, moto paths and Unpaved and Off-road roads side by side.
2. **Desktop render**: `~/Workspaces/OSM/osmand-render` (`render.sh`, GPX waypoints to PNGs) at z13 to z16, light and night, before and after each change.
3. **Phone check**: the arm64 Android emulator with the fork installed, then Julien's phone in the sun at Chiang Rai.
4. **Pass if**: at z15 a reader tells, without the legend, a track from an Unpaved road and a moto path from a hiking path; the three track levels are told apart at z14 and z15; no track looks like a tunnel.
5. **Data to add**: access values on Swiss tracks; the same coverage table for one or two other riding countries (Laos, Morocco) to see whether Thailand or Switzerland is the usual case.
