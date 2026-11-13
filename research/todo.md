# To do

Updated 2026-11-13. Only what is still open. Settled decisions are in [decisions.md](decisions.md); finished work is in the task files (A to E), [LOG.md](../LOG.md) and git history.

## Waiting on feedback

- **Forum thread** (posted by Julien 2026-11-12, https://community.openstreetmap.org/t/draft-for-feedback-showing-unpaved-roads-on-osm-based-maps-without-losing-the-road-class/150052): read the replies; they feed the open style points, the article, the wiki page and the outreach below.
- **Reader test** ([reader-test/README.md](reader-test/README.md)): score again at about 30 non-mappers who saw all five maps (19 on 2026-11-13), or when answers stop coming: `python3 research/reader-test/score.py export.csv --exclude e491f01c` (Julien's own run). To confirm from the first look (2026-11-13: non-mappers found 76% of unpaved minor roads but 44% of unpaved main roads, forum mappers 80%, almost no paved road tapped): main roads as the weak point, grain best and full width worst on main roads, style 4 picture set 1 vs 2 (tan fill, answers tagged `images: 2`). Then the one-line result for the article (section 6 and Limits).
- **Unknown paved `surface` values** (`dbst`, `ottaseal`, `Blacktopped`, `tarmac`; decision 14): wiki warning lines drafted in [outreach/surface-values.md](outreach/surface-values.md), waiting for replies on the [bot-edit thread](https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/10) and the [Nepal topic](https://community.openstreetmap.org/t/surface-values-ottaseal-and-blacktopped-in-nepal/150053). Km per country: [stats/unknown-values.md](stats/unknown-values.md).
- **cycle.travel** (Richard Fairhurst, its maker, forum post #5): reply posted by Julien 2026-11-13, asking whether the tertiary turning white is on purpose and whether he would consider a paved whitelist (it lists unpaved values: `rock` drawn as paved). Findings in [outreach/forum/5-cycle-travel.md](outreach/forum/5-cycle-travel.md); added to the article (section 3, group 1) and the App reports. Left: read his answer and update the App reports row; add the A0 row; tunnels not checked.
- **AdvOSM**: the author replied 2026-11-13 (TYP and legend; A0 row, apps page and track row updated). Reply drafted and questions for the coffee on **Wednesday 2026-11-18** (Chiang Mai, near Honda BigWing) in [outreach/advosm.md](outreach/advosm.md). Credit as "AdvOSM" only, no name.
- **GmapTool** (gmaptool.eu Garmin maps): named by the AdvOSM author as the best at unpaved highways; on the author's Tanzania image it keeps the class colour with dashes. Check it and add an A0 row.

## Styles and demo

- Open points from the mockup review (LOG.md), ideally decided with forum feedback: style 5 in towns and on short ways, white caramel dash against orange, yellow Off-road hue, dark mode steps.
- Zoom behaviour: where each style starts working, and how it looks on thin roads.
- Colour tests: several earthy browns against every background, distinct from contour and boundary browns; write down why the colours were picked.
- Demo: refetch the spot data with way ids (postponed while Overpass is off, decision 11).

## Article, wiki and posts

- Article ([../article.md](../article.md), site `../index.html`, `npm run build`): draft 1 and Julien's first read-through done 2026-11-11. Left: fold in the forum feedback and the reader-test result; finish the app reports page (built as a draft).
- Legend or wiki text: one line saying broken pavement is drawn as Unpaved on purpose (decision 15), so it does not read as an error. Support if asked: Gaia GPS does the same (30 of 31 sampled paved minor roads with `smoothness` very_bad or worse drawn as tracks).
- After the forum round: a short OSM wiki page for the tag mapping only, linking to the repo; an OSM diary entry; a Facebook post pointing to the diary.

## Research left

- Contacts for the late-added countries (B).
- Wiki table and sample countries (C).
- Western contrast countries: is `surface=unpaved` used there for roads a city car can drive?

## Outreach (drafts only, send nothing)

- **Spirit PR #93** (Julien's, open): before pinging again, switch to a paved whitelist and a style that does not dash the casing (the maintainer asked about tunnel confusion; see A-providers A5 and the Shortbread row).
  - Started 2026-11-13, paused: fork cloned in `~/Workspaces/OSM/spirit` on branch `unpaved-road-casing` (4 commits behind upstream; rebase first), no code changes yet; `local/` (git-excluded) for extracts, may hold a partial Namibia download. Draft comment: [outreach/issues/5-spirit-pr93.md](outreach/issues/5-spirit-pr93.md).
  - Code: in `spirit/roads-high.sql.jinja2`, a paved whitelist on `surface` only (Spirit stores no `smoothness`; values from `classifier/classify.sql`, multiple values split on `;`); in `style/roads.glug`, drop the dashed casing and add a style 3 layer after `road_fill` (dashes in a band 60% of the fill width, darker class tint at contrast 1.3, 1.4 on red and orange, tan `#dccab0` on white roads; values in `js/style-spec.js`).
  - Render: PostGIS and osm2pgsql 2.x in Docker (Homebrew osm2pgsql 1.11 is broken, missing boost; the local PostgreSQL 17 needs a password), themepark, Tilekiln, glug; small extracts around Namutoni, switzerland-1 and thailand-3; skip the ocean polygons (none of the views needs them). Screenshots of unpaved roads next to tunnels and footways.
  - Commit locally only: no push, no comment until the forum round is over.
- **Issue drafts**, one per provider, adapted to its current rendering and tile schema, using the per-provider table of styles to avoid under A0. Open apps first (Organic Maps, OsmAnd, Americana), issue before PR, small first PR. A3 order: CyclOSM, OsmAnd #9465, Organic Maps #8485, OpenMapTiles whitelist, Kurviger forum, Tracestrack.
- **Commercial apps** through support or product teams: Komoot, Gaia GPS, Guru Maps, Ride with GPS and the others.
- **Allies**: HOT, local mapping communities, the laterite-discussion contacts.

## Low priority

- Dark mode: a variant per style, the style 4 tan fill (decision 16) and the primary that looks brown in the demo (LOG.md).
- Track rows for the remaining phone-only apps; closed apps can wait for the support contacts above. Track shots: [examples/track-spots.md](examples/track-spots.md), `examples/screenshots/track-<view>/` (local only).
- Paved `highway=track` (`tracktype=grade1` or a paved surface) drawn as a continuous line, matching the track rhythms now used by the centre line (OSM Carto already draws grade1 solid). For the future-work section, after the road classes.
- **OsmAnd Overland style** (decision 18, after everything else): requirements in [A-providers A6](A-providers.md#a6-osmand-motorcycle-style-code-review-for-the-fork-2026-11-10) ("What to change in the fork"), design brief in [E-tracks.md](E-tracks.md). Contact the OsmAnd team early. Tell the Motorcycle owner, who expected a fork ([discussion #22](https://github.com/OsmAnd-Rendering/Motorcycle/discussions/22)). Find the OsmAnd plugin he mentioned (F-Droid build).
