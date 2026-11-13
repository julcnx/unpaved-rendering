# Unpaved road rendering

Working folder for the proposal asking map apps to show whether a road is paved or unpaved on every road class, separately from its road class colour: two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads.

| File | Content | Status |
|---|---|---|
| [A-providers.md](A-providers.md) | Providers, existing whitelist code, issues, ranking | done: main-road check (source code, web screenshots at 6 spots, phone apps), feedback channels, tile schemas, a z11 check and provider rules measured against ours (2026-11-09) |
| B-communities.md (private, not in the public repo) | Laterite survey respondents, allies, spec additions | done; contacts for late-added countries to do |
| [C-statistics.md](C-statistics.md) | Classifier rules, stats method, findings | done for 55 rows (two levels + mark), Off-road evidence per country, spot check; wiki table and sample countries to do |
| [D-examples-visuals.md](D-examples-visuals.md) | Styling mockups, sample roads, imagery review | mockups done (5 styles); screenshots and comparison grids for 6 spots in [examples/screenshots/](examples/screenshots/); demo in the repo root (`../index.html`), synced with the mockups |
| [E-tracks.md](E-tracks.md) | Tracks and paths: working draft for the OsmAnd enduro fork (not part of the roads proposal) | draft 2026-11-13: tag coverage in Thailand and Switzerland, proposed track levels, moto paths, night mode |
| [classifier/](classifier/) | Classifier in TypeScript, Lua and PostgreSQL, 100 shared test cases | done (two levels + mark) |
| [stats/](stats/) | Per-country km statistics pipeline and results ([report.md](stats/report.md), [summary.csv](stats/summary.csv), [unknown-values.md](stats/unknown-values.md), tag-combination tables in `stats/combos/`) | done: 55 rows |
| [todo.md](todo.md) | Everything still to do, in one list | updated 2026-11-13 |
| [decisions.md](decisions.md) | Settled decisions, numbered (cited as "decision N") | updated 2026-11-13 |

Large files (`pbf/`, `work/`) are not committed.
