# To do

Updated 2026-11-22 (forum, wiki and PR 717 checked online the same day). Only what is still open. Settled decisions are in [decisions.md](decisions.md); finished work is in the task files (A to D), [LOG.md](../LOG.md), [outreach/](outreach/) and git history. The OsmAnd style (Overland) has its own repo and todo, osmand-overland.

## Next, in this order

1. **Spirit PR #93**: code, local render, then Julien's comment with the updated commits (plan under Outreach). Needs Docker running.
2. **OsmAnd #9465 and Organic Maps #8485 comments** ([2-osmand.md](outreach/issues/2-osmand.md), [3-organic-maps.md](outreach/issues/3-organic-maps.md)): no code needed; check text, images and figures against the final styles (drafted before the main-road marks), and drop "after the forum feedback" in all the issue drafts. Julien posts.
3. **CyclOSM** ([1-cyclosm.md](outreach/issues/1-cyclosm.md)): local render first. **OpenMapTiles** ([4-openmaptiles.md](outreach/issues/4-openmaptiles.md)): size test first.
4. **Wiki page, diary entry, Facebook post** (under Article, wiki and posts).

## Waiting on feedback

- **Forum thread** ([150052](https://community.openstreetmap.org/t/draft-for-feedback-showing-unpaved-roads-on-osm-based-maps-without-losing-the-road-class/150052)): round over (Julien, 2026-11-22); last posts are our replies #14 and #15 of 2026-11-16, answer only if someone writes. Americana's [PR 717](https://github.com/osm-americana/openstreetmap-americana/pull/717) merged 2026-11-23: tracks as double dashed lines (solid when `surface=paved`); checked 2026-11-24 ([A-providers](A-providers.md), style 5 note): tracks and unpaved roads stay distinct, but the grey dashes on white minor roads barely show below z17. An Americana request would ask for a tan dash on white roads (as our style 5), not for track changes. Draft not written yet.
- **Bot proposals** `cement` → `concrete`, `brick` → `bricks` ([outreach/bot-cement-brick.md](outreach/bot-cement-brick.md)): **waiting for comments.** Merged topic posted 2026-11-23: https://community.openstreetmap.org/t/proposed-bot-edits-surface-cement-to-concrete-and-surface-brick-to-bricks-on-highways-worldwide-recurring/150534 (Mateusz pinged; he OK'd the pages in [post 15](https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/15)). Both wiki pages have the topic as `discussion_url` and in Discussion, link posted in 105361 (post 16). Next: answer comments; Mateusz runs only after an explicit OK in the topic, not silence; then an id-tagging-schema issue to deprecate both values (iD offers them), and see whether `chipseal` can be found there by "DBST", "BST" or "surface dressing".
- **Local values** `dbst`, `ottaseal`, `Blacktopped` ([outreach/local-values-mappers.md](outreach/local-values-mappers.md#answers)): 4 of 18 mappers answered on 2026-11-19, all retagged (check for new answers). From **2026-11-30**: the `dbst` family by hand without an answer; the others only with one. [Nepal topic](https://community.openstreetmap.org/t/surface-values-ottaseal-and-blacktopped-in-nepal/150053): no reply.
- **AdvOSM** ([outreach/advosm.md](outreach/advosm.md)): outcome of the meeting planned for 2026-11-18 not noted yet; questions were the fast primary and secondary in routing, the `surface` list, the S points, using the images, and the current GmapTool TYP. Credit as "AdvOSM" only, no name.

## Styles and demo

- Open points from the mockup review (LOG.md): style 5 in towns and on short ways, white caramel dash against orange, yellow Off-road hue, dark mode steps.
- Zoom behaviour: where each style starts working, and how it looks on thin roads.
- Demo: refetch the spot data with way ids (postponed while Overpass is off, decision 11).

## Article, wiki and posts

- App reports page, checked 2026-11-24 before the requests: Americana tracks and faint white-road dashes, DMD2 contact link, 109 test cases, OsmAnd surface zoom 13, cycle.travel A0 row done. Left: cycle.travel tunnels by hand (Cloudflare blocks automated browsers), e.g. https://cycle.travel/map?lat=45.8693&lon=7.1757&zoom=15 (Great St Bernard, trunk) and https://cycle.travel/map?lat=47.1269&lon=10.1883&zoom=16 (Arlberg); then fill "tunnels not checked" in apps.md and A0.
- Legend or wiki text: one line saying broken pavement is drawn as Unpaved on purpose (decision 15). Support if asked: Gaia GPS does the same (30 of 31 sampled paved minor roads with `smoothness` very_bad or worse drawn as tracks).
- A short OSM wiki page for the tag mapping only, linking to the repo; an OSM diary entry; a Facebook post pointing to the diary.

## Research left

- Contacts for the late-added countries (B).
- Wiki table and sample countries (C).
- Western contrast countries: is `surface=unpaved` used there for roads a city car can drive?

## Outreach (drafts only, send nothing)

- **Spirit PR #93** (Julien's, open): before pinging again, switch to a paved whitelist and a style that does not dash the casing (the maintainer asked about tunnel confusion; see A-providers A5 and the Shortbread row).
  - Started 2026-11-13, paused: fork cloned in `~/Workspaces/OSM/spirit` on branch `unpaved-road-casing` (4 commits behind upstream; rebase first), no code changes yet; `local/` (git-excluded) for extracts, may hold a partial Namibia download. Draft comment: [outreach/issues/5-spirit-pr93.md](outreach/issues/5-spirit-pr93.md).
  - Code: in `spirit/roads-high.sql.jinja2`, a paved whitelist on `surface` only (Spirit stores no `smoothness`; values from `classifier/classify.sql`, multiple values split on `;`); in `style/roads.glug`, drop the dashed casing and add a style 3 layer after `road_fill` (dashes in a band 60% of the fill width, darker class tint at contrast 1.3, 1.4 on red and orange, tan `#dccab0` on white roads; values in `js/style-spec.js`).
  - Render: PostGIS and osm2pgsql 2.x in Docker (Homebrew osm2pgsql 1.11 is broken, missing boost; the local PostgreSQL 17 needs a password), themepark, Tilekiln, glug; small extracts around Namutoni, switzerland-1 and thailand-3; skip the ocean polygons (none of the views needs them). Screenshots of unpaved roads next to tunnels and footways.
  - Commit locally only: no push or comment without Julien's go (the forum round no longer holds it back).
- **App reports anchors**, with the first request: one anchor per app row in apps.md (build-article.py), so each request links straight to its app's row. The reports stay a separate page from the article (Julien, 2026-11-24).
- **Issue drafts**, one per provider, adapted to its current rendering and tile schema, using the per-provider table of styles to avoid under A0. Open apps first (Organic Maps, OsmAnd, Americana), issue before PR, small first PR. A3 order: CyclOSM, OsmAnd #9465, Organic Maps #8485, OpenMapTiles whitelist, Kurviger forum, Tracestrack.
- **Commercial apps** through support or product teams: Komoot, Gaia GPS, Guru Maps, Ride with GPS and the others.
  - Ride with GPS (request #296036): developers queuing `laterite` as unpaved; tiles still `paved` on 2026-11-23 (built 2026-11-19). Recheck tile `rwgps/14/12720/7267` with `research/tiles/tile-match.mjs` (spot A).
- **Allies**: HOT, local mapping communities, the laterite-discussion contacts.

## Low priority

- Dark mode: a variant per style, the style 4 tan fill (decision 16) and the primary that looks brown in the demo (LOG.md).
- Track rows for the remaining phone-only apps; closed apps can wait for the support contacts above. Track shots: [examples/track-spots.md](examples/track-spots.md), `examples/screenshots/track-<view>/` (local only).
- Paved `highway=track` (`tracktype=grade1` or a paved surface) drawn as a continuous line in styles 1 to 5, matching the track rhythms now used by the centre line (OSM Carto already draws grade1 solid). For the future-work section, after the road classes.
- **GmapTool** (gmaptool.eu Garmin maps): A0 row lacks secondary and tertiary, the current TYP (not published; read it from an IMG or ask AdvOSM) and tracks.
