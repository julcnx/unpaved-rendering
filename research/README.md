# Unpaved road rendering

Working folder for the proposal asking map apps to show whether a road is paved or unpaved on every road class, separately from its road class colour: two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads.

| File | Content | Status |
|---|---|---|
| [A-providers.md](A-providers.md) | Providers, existing whitelist code, issues, ranking | main-road check done (source code, web screenshots at 3 spots, phone apps, 2026-11-09); feedback channels for 12 providers and a z11 check to do |
| [B-communities.md](B-communities.md) | Laterite survey respondents, allies, spec additions | done; contacts for late-added countries to do |
| [C-statistics.md](C-statistics.md) | Classifier rules, stats method, findings | done for 55 rows (two levels + mark); wiki table and sample countries to do |
| [D-examples-visuals.md](D-examples-visuals.md) | Styling mockups, sample roads, imagery review | mockups done; web screenshots for 5 spots in [examples/screenshots/](examples/screenshots/); comparison grid and a demo on real map data to do |
| [classifier/](classifier/) | Classifier in TypeScript, Lua and PostgreSQL, 68 shared test cases | done (two levels + mark) |
| [stats/](stats/) | Per-country km statistics pipeline and results ([report.md](stats/report.md), [summary.csv](stats/summary.csv), [unknown-values.md](stats/unknown-values.md), tag-combination tables in `stats/combos/`) | done: 55 rows |
| [todo.md](todo.md) | Everything still to do, in one list | updated 2026-11-09 |

Large files (`pbf/`, `work/`) are not committed.
