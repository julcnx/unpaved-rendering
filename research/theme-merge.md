# Theme spec against the existing theme: comparison and merge proposal

2026-11-22. **Confirmed by Julien the same day and built**: [../osmand/](../osmand/) (the XML, generator, checks) from [theme-spec.md](theme-spec.md), whose first section lists the confirmed changes. Answers: C3 becomes a setting (from which smoothness a way is hard; default `horrible`), C18 gates at high zoom only, everything else as proposed. The comparison below is kept as it was.

- **Spec**: the design system finalised by Julien in a separate session (pasted 2026-11-22).
- **Mine**: the theme in this repo. There is **no rendering XML yet**: the style ([decisions.md](decisions.md) 18, "Overland"; own minimal style on `depends="default"`) exists only as [E-tracks.md](E-tracks.md) and the mockup scripts, mainly [mockups/make-fork-crops.mjs](mockups/make-fork-crops.mjs). Values below are that script's defaults. The `.render.xml` files in `~/Workspaces/OSM/osmand-render/styles/` are OsmAnd's own styles, the GPL Motorcycle style and test copies of it.
- **Status of mine**: "decided" = chosen by Julien; "default" = in the script; "proposal" = drawn, never confirmed (design #11 for main roads, the pale yellow tertiary, the outline system for white roads, slate blue). The script default for main roads is still b (darker class shade).
- Widths of mine are totals at z15 with the edge, in dp (1.5 x already applied).

## 1. Matches

| Topic | Both |
|---|---|
| Paved | white or class colour with a darker edge |
| Dirt colour | brown for the common level, near black for the hardest (`#94612f` / `#2a1a0e` against `#b0773a` / `#2b190c`) |
| Tracks | plain solid line, as wide as a paved track with its edge (6 against 6.75) |
| Paths | dashes; paved path = white dashes with grey edges |
| Forbidden | one pale grey, flat, no edge, paths dashed (`#c8c4bc` against `#c4bdb4`) |
| No "unknown" look | yes (mine keeps a survey toggle as a later idea, see conflicts) |
| Unclassified wider than residential | yes |
| Precedence | `smoothness` over `surface` |
| Motorway, trunk, primary, secondary order and hue family | purple (missing in mine), red, orange, yellow |
| Contours not brown, water blue, fords as icons | yes |
| Dropped | blue or slate for a condition, red for closed ways, `dirtbike:scale` symbols, full-width dashes |

## 2. Conflicts

"Deliberate" = a choice Julien made in mine, so it needs his answer before the spec replaces it.

| # | Topic | Spec | Mine | Deliberate? | Proposal |
|---|---|---|---|---|---|
| C1 | Untagged unclassified and smaller roads | easy (brown) | paved; only tracks are dirt when untagged (classifier, article) | **yes** | keep mine |
| C2 | Dirt levels | two, set by a rider preset | three: Car friendly, Unpaved, 4WD (confirmed ladder, 2026-11-20) | **yes** | spec |
| C3 | `smoothness=very_bad` | hard in Dual sport (default) | brown, as every unconfirmed way (2026-11-20, after Chiang Rai) | **yes** | easy in Dual sport |
| C4 | Class at z13 and below | no dots, so dirt roads lose their class | class always kept ([E-tracks 4](E-tracks.md#4-constraint-from-the-roads-work)) | **yes** | class-colour edge at z12-13 |
| C5 | Dirt on main roads | solid dirt colour, class dots | class fill, darker band (b, default); #11 proposal | b was decided | spec |
| C6 | Dirt on unclassified, residential | solid dirt colour, white dots | white, brown edges or band (v3) | v3 was decided | spec |
| C7 | Trunk | red `#cf5566`, dot `#f07c8a` | crimson `#d6336c`, moved off red for colour-blind riders | **yes** | spec fill, checked dots (section 5) |
| C8 | Tertiary | teal | white (default); pale yellow only a proposal | no | spec, lighter dot (section 5) |
| C9 | Primary, secondary | `#ec8a48`, `#f5d64a` toned down | `#ef8a1f`, `#f4e04a` (High vis 2, decided) | **yes**, mild | spec |
| C10 | Land | open `#eef0e6`, forest `#c9ddb2`, farmland `#e9e3cf`, residential `#e4dfdc` | `#fbfaf6`, `#e2ebd8`, not drawn, `#f1f0ed` ("keep my proposal, easier to read") | **yes** | keep mine |
| C11 | Forbidden width | half the way's width, min 3 | closed roads and tracks at full fill width, paths 2.6 | no | spec |
| C12 | Forbidden tags | not defined | first answer of `motorcycle`, `motor_vehicle`, `vehicle`, `access`; `destination` is not a no; paths need a yes | **yes** | keep mine |
| C13 | Presets | Car, Dual sport, Enduro: change easy and hard | riding focus Road, Adventure, Trail: change emphasis and hide ways | **yes** | presets; park the focus |
| C14 | Residential width | 6 (same as track) | 9 | no | spec |
| C15 | Trunk, primary, secondary, tertiary, unclassified widths | 15, 14, 13, 12, 11 | 13.5, 12.75, 12, 11.25, 11.25 | no | spec |
| C16 | Path | 3, dash 12/3 | 2.6, dash 10.5/4.5 | no | spec |
| C17 | Minor paved edges | `#7d7d7d`, `#8f8f8f`, track `#9a9a9a` | `#6f6f6f`, `#8f8f8f`, track `#8f8f8f` (casing B, decided) | yes, mild | spec |
| C18 | Barriers and gates | icons on | not drawn unless they block (Julien: "rather not show them") | **yes** | ask |
| C19 | Sand | `#efe3c4` with dots | pale `#f6f1e2`, chosen only to keep the tan level readable; the tan is gone | no | spec, plain fill |
| C20 | Survey toggle | removed, do not reintroduce | off-by-default idea in E-tracks | idea only | spec: drop it |
| C21 | Centre stripe | decided against | Car friendly centre line and the band of b | superseded | spec |
| C22 | Light yellow | decided against | pale yellow tertiary proposal | proposal | spec |

## 3. Missing in mine

Motorways (not in the extracts); railways; power lines; international borders; drawn contours (planned only); the low-zoom rules (every sheet is z15, one z16); the rider preset setting; the dot pattern and its strip fallback.

## 4. Only in mine

| Topic | Mine | Proposal |
|---|---|---|
| Service roads | faded 45%, driveways grey from z16, parking aisles hidden at z15 (decided) | keep the rules, thin white with `#a3a3a3` edge instead of fading (spec rejects fading) |
| Footways, cycleways | hidden unless `motorcycle=yes` (decided) | keep |
| `very_horrible` tracks | drawn as a single track, hard (decided) | keep |
| `smoothness=impassable` | forbidden look (decided) | keep |
| Broken pavement (paved, `very_bad` or worse) | dirt ([decisions.md](decisions.md) 15) | keep: hard |
| Drawing order | hard below easy below paved at junctions (decided) | keep |
| Road numbers | shields | keep (OsmAnd default draws them) |
| Scrub, grass, rock landcover | yes | keep |
| Paved whitelist | any other `surface` is dirt | keep |

## 5. Checked: colours

Contrast and colour distance as in `mockups/score-readability.py` (CIE76, worst of normal vision and the three simulations).

- **Confirmed**: easy against hard is 3.2 in contrast and 40 in distance. Easy on the spec's land 4.55, forest 3.61 (mine: 3.63 and 3.08 on its own land). The darker brown is better.
- **Colour-blind check is not fully passed.** Trunk and tertiary dots are 5 apart for protanopia: on dirt, where the dots carry the class, they look the same. Trunk and primary dots are 12 apart for tritanopia. A lighter teal dot fixes the first: `#5cc9be` gives 18 from trunk and 23 from the white dots, `#7fd6cc` 23 and 17.
- **Motorway dot on easy brown**: contrast 1.05 (seen by hue only); `#a98be0` gives 1.86 and stays apart from the others. Dirt motorways are close to nonexistent.
- **Trunk paved fill against easy brown**: 19 for deuteranopia (mine, crimson against its own brown: 29).
- **Secondary paved fill on the spec's forest**: contrast 1.01, carried by its edge only.
- **Forbidden on the spec's forest**: 1.20 (1.42 on mine; `#b9b4ab` 1.42 on the spec's).
- **Tertiary teal against rivers** `#8fb8e0`: 11 for tritanopia, 16 from lakes for deuteranopia.

## 6. Checked: data (Geofabrik 2026-11-12, km)

| Rule | Thailand | Switzerland |
|---|---|---|
| C1: residential with no surface, tracktype, smoothness or 4wd_only | 283,368 of 351,666 (81%) | 11,964 of 27,432 (44%) |
| C1: unclassified, the same | 92,298 of 154,302 (60%) | 8,901 of 20,605 (43%) |
| `surface=unpaved` with no smoothness or tracktype, on tracks | 170,888 of 227,318 (75%) | 204 of 98,820 |
| the same on roads | 73,414 of 82,003 dirt km (90%) | 116 of 739 |
| surface and tracktype disagree in Dual sport | 517 | 1,693 |
| paths with no yes | 7,834 of 9,112 (86%) | 54,500 of 54,592 (99.8%) |

- **`surface=unpaved` is in no preset**, and it is most of the dirt in Thailand. If it counts as "unknown", unpaved tertiary and larger roads are drawn paved. Proposal: easy in every preset.
- Order for the disagreements: `smoothness`, then `tracktype`, then `surface` (mine). Other unpaved values not listed (clay, laterite, grass, pebblestone): easy.

## 7. Checked: OsmAnd

Throwaway style rendered with `osmand-render` (core-legacy, Thailand map of 2026-11-01), plus `rendering_types.xml` (85815c678) and `rendering.cpp` (3317961). Not tested: the OpenGL renderer and a phone.

| Question | Answer |
|---|---|
| Dots, `1_40` with round caps | drawn, on a second layer over the solid line |
| Layers | eight strokes per line (`__2` to `_5`), each with its own width, colour, dash and cap |
| Dash offset | no offset setting (the phase is fixed at 0), but a leading zero-length dash does it: `0_1_10_4` over `12_3` gives the white dashes with closed grey ends |
| Preset setting | a `renderingProperty` of type string with `possibleValues`, tested with `apply_if riderPreset="enduro"`: changes the render |
| Dirt at z13 | works |
| **Dirt at z12** | **`surface` is not in the map at z12** (every way came out as "no surface"); `tracktype` is. So z12 dirt can only come from `tracktype`, and untagged defaults |
| Access at z12 | `motorcycle` and `motor_vehicle` are listed from z13 (read in the rules, not rendered): a closed track cannot be told at z12 |
| `4wd_only` | routing only, cannot be drawn by any style |
| Values renamed in the map | `rock` to `stone`, `earth` to `ground`, `concrete:lanes` to `concrete` (paved), `tarmac` to `asphalt`; `grade6` to `grade8` absent |
| Corners | no round joins: wide solid lines show spikes at sharp bends, worst at z12 to z14 |
| Dash cache | the cache key looks lossy in the source (a float appended as a character), so two patterns could be mixed up; not seen in the test |

## 8. Gaps and contradictions inside the spec

1. At z13 and below there are no dots, so an unpaved trunk, unclassified road and track differ by width only, and residential equals track (rule 3 stops working). C4.
2. z14 keeps dots but gives no spacing; widths do not say whether they include the edge.
3. The dot fallback (strips along the centre) is close to the rejected centre stripe.
4. Paved tracks at z13 are 3.3 px, so they become the single grey line `#a3a3a3`, 13 from the forbidden grey.
5. Service roads, links, living streets, footways, cycleways and which tags mean forbidden or paved are not defined.

## 9. Merge proposal

1. Take the spec for everything not marked deliberate, and for C2, C5, C6, C9, C13 and C17 once confirmed.
2. Keep mine for C1, C10 and C12, and everything in section 4.
3. Adjust the spec for C3 (very_bad easy in Dual sport), C4 (class-colour edge at z12 and z13), C7 and C8 (dots), `surface=unpaved` easy, z12 rules.
4. Then write `overland.render.xml` (new, `depends="default"`), not an edit of an existing file.
