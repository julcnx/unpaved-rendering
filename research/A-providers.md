# A. Providers

Analysis date: 2026-11-02.

Sources used:

- Provider list: `surface=*` rendering tracker in [../osm-cache/_tag-support-status.json](../osm-cache/_tag-support-status.json)
- Source clones in [../osm-tag-support-tracker/sources/](../osm-tag-support-tracker/sources/) (commit hashes in the links below)
- HOT HDM-CartoCSS fetched from GitHub (not cloned locally), commit `ff2bb32`
- GitHub issue search with `gh` on 2026-11-02

Komoot, Gaia GPS, Calimoto and Guru Maps do not appear anywhere in the workspace. Their current rendering is still to be checked in the apps (see task D).

**Model (decided 2026-11-02):** two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads only. The ask to providers is therefore small: (1) draw the paved/unpaved split on **every** road class, using a paved whitelist, and (2) optionally add the Off-road mark. Several providers already have the two levels internally; the open question per provider is whether they draw them on main road classes (primary, secondary, tertiary) or only on tracks and minor roads. That check is still to do.

## A1. Providers that already whitelist paved values

### HOT Humanitarian style (HDM-CartoCSS)

Repo: [hotosm/HDM-CartoCSS](https://github.com/hotosm/HDM-CartoCSS), file `project.yml`, [lines 343-351](https://github.com/hotosm/HDM-CartoCSS/blob/ff2bb32dc96e5e450dab052be0df0dff40f1c139/project.yml#L343-L351):

```sql
CASE
  WHEN smoothness IN ('bad', 'very_bad', 'horrible', 'very_horrible') THEN 'bad'
  ELSE 'good'
END AS condition,
CASE
  WHEN surface IN ('paved', 'paving_stones', 'asphalt', 'concrete') THEN 'paved'
  WHEN (surface IS NULL AND type IN ('trunk', 'trunk_link', 'motorway', 'motorway_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link')) THEN 'paved'
  ELSE 'unpaved'
END AS surface,
```

`condition` is used in `roads.mss` L249. Unpaved roads get a different casing and fill (`@unpaved`, `@unpaved_case` in `palette.mss`).

Same as our base level: paved whitelist, everything else unpaved, missing surface on main roads is paved.

Differences from our rule:

1. Only 4 paved values: `chipseal`, `sett`, `bricks` render as unpaved.
2. `unclassified` with no surface renders as unpaved.
3. Repo inactive since 2021-07-22. Use it as precedent and as an ally, not as a code target.

### Organic Maps (and CoMaps fork)

Repo: [organicmaps/organicmaps](https://github.com/organicmaps/organicmaps), file `generator/osm2type.cpp`:

- `pavedSurfaces` whitelist: [L579-581](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L579-L581)
- Used at: [L729](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L729) `isPaved = Has(pavedSurfaces, surface);`
- No surface and no smoothness: no `psurface` at all ([L709](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1bf97be7bf89fa3ed00fa6cf4739c40a/generator/osm2type.cpp#L709)), so drawn as normal road.

Output is 4 values: `paved_good`, `paved_bad`, `unpaved_good`, `unpaved_bad`. The paved/unpaved part matches our base level; `unpaved_bad` is close to our Off-road mark, but it is also set from surface values alone (`dirt`, `ground`, `laterite` and others), not only from evidence tags.

Differences from our rule:

1. Values are split on `;:/` before matching, so `concrete:lanes` counts as paved (matches `concrete`).
2. `cobblestone`, `stone`, `grass_paver`, `unhewn_cobblestone` are paved.
3. Smoothness without surface is handled, `very_bad` and worse gives `unpaved_bad`.

## A2. Per provider

| # | Provider | Open source | Current surface rendering | Feedback channel | Existing issues (julcnx in bold) |
|---|---|---|---|---|---|
| 1 | Organic Maps / CoMaps | yes | `psurface` 4 values, drawn on tracks and minor roads | GitHub issues | [#8485](https://github.com/organicmaps/organicmaps/issues/8485) open, 18 comments, "Render tracks similar like the Carto-Style"; [#11835](https://github.com/organicmaps/organicmaps/issues/11835) "Color mode for displaying road passability" (smoothness colour mode), closed not planned the same day, no comment; **[#13045](https://github.com/organicmaps/organicmaps/issues/13045)** closed; **[PR #13229](https://github.com/organicmaps/organicmaps/pull/13229)** |
| 2 | OsmAnd | yes | Optional "Road surface" and "Road quality" overlays, off by default, from z14: [default.render.xml L99-102](https://github.com/osmandapp/OsmAnd-resources/blob/85815c67803a53ed1e4e50b25337d678bac0fa16/rendering_styles/default.render.xml#L99-L102) | GitHub issues (OsmAnd, OsmAnd-resources) | [#9465](https://github.com/osmandapp/OsmAnd/issues/9465) open since 2020, "draw unpaved roads in the same style as tracks"; **[resources PR #1397](https://github.com/osmandapp/OsmAnd-resources/pull/1397)**; **[#25469](https://github.com/osmandapp/OsmAnd/issues/25469)** |
| 3 | OpenStreetMap Americana | yes | Dash pattern when `surface=unpaved`: [road.js L56](https://github.com/osm-americana/openstreetmap-americana/blob/dddb072aad1ba2efb2332277ff53cc72f0bcbc65/src/layer/road.js#L56). Gets paved/unpaved from the OpenMapTiles schema, which is enough for our two base levels; the optional Off-road mark would need `smoothness`, `tracktype` or `4wd_only` in the schema upstream | GitHub issues | [#216](https://github.com/osm-americana/openstreetmap-americana/issues/216) tracks/paths; **[#1434](https://github.com/osm-americana/openstreetmap-americana/issues/1434)** closed |
| 4 | OpenMapTiles / Planetiler | yes | Binary paved/unpaved in schema (`layers/transportation/class.sql`, `Transportation.java`) | GitHub issues | **[#1806](https://github.com/openmaptiles/openmaptiles/issues/1806), [PR #1807](https://github.com/openmaptiles/openmaptiles/pull/1807)**, **[PR #332](https://github.com/openmaptiles/planetiler-openmaptiles/pull/332)** all merged |
| 5 | Tracestrack Topo | partly | Unpaved style exists | GitHub issues | **[#67](https://github.com/tracestrack/tracestrack-maps/issues/67)** fixed quickly |
| 6 | CyclOSM | yes | Smoothness drawn for cycling | GitHub issues | [#566](https://github.com/cyclosm/cyclosm-cartocss-style/issues/566) finer smoothness levels |
| 7 | HOT HDM-CartoCSS | yes | Whitelist, see A1 | GitHub issues (inactive) | [#104](https://github.com/hotosm/HDM-CartoCSS/issues/104) open since 2014, "Preseance of surface and smoothness over road classification"; [#26](https://github.com/hotosm/HDM-CartoCSS/issues/26); [#177](https://github.com/hotosm/HDM-CartoCSS/issues/177) |
| 8 | Spirit / OSMF Shortbread | yes | None | GitHub issues | **[#91](https://github.com/pnorman/spirit/issues/91), [PR #93](https://github.com/pnorman/spirit/pull/93)** pinged 2026-08-17, no reply |
| 9 | OpenTopoMap | yes | Track dashes only | GitHub issues | **[#36](https://github.com/der-stefan/OpenTopoMap/issues/36), [PR #398](https://github.com/der-stefan/OpenTopoMap/pull/398)**. Project only kept online |
| 10 | OSM Carto (credit only, not a target) | yes | Subtle unpaved texture. Surface lists in `project.mml` L472-476 | | **[PR #5263](https://github.com/openstreetmap-carto/openstreetmap-carto/pull/5263)**, [#5268](https://github.com/openstreetmap-carto/openstreetmap-carto/issues/5268), [#4724](https://github.com/openstreetmap-carto/openstreetmap-carto/issues/4724). Stay passive |
| 11 | Komoot | no | To check in app | Support / feature requests (to confirm) | |
| 12 | Gaia GPS | no | To check in app | Support / feature requests (to confirm) | |
| 13 | Calimoto | no | To check in app | Support / feature requests (to confirm) | |
| 14 | Guru Maps | no | To check in app | Community forum (to confirm) | |

## A3. Ranking (most receptive first)

1. **OsmAnd**: overlays already exist, the ask is small (default-on unpaved signal on main roads). Earlier PR merged. Add to #9465.
2. **Organic Maps / CoMaps**: closest data model, good relationship. #11835 shows a full colour overlay is rejected fast, so pitch "keep class colour, add one subtle signal". Comment on #8485.
3. **Tracestrack**: small, fast to respond.
4. **Americana**: active, but blocked by OpenMapTiles schema. First PR is probably Planetiler/OpenMapTiles (merged work already there).
5. **Commercial apps** (Komoot, Gaia, Calimoto, Guru): users ride these roads, but no code to point at. Contact after the wiki page and demo exist.
6. **Long shots**: CyclOSM (bike focus), HOT HDM (inactive), Spirit, OpenTopoMap (no replies).
