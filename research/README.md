# Unpaved road rendering

Working folder for the proposal asking map apps to show whether a road is paved or unpaved on every road class, separately from its road class colour: two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads.

| File | Content | Status |
|---|---|---|
| [A-providers.md](A-providers.md) | Providers, existing whitelist code, issues, ranking | updated to two levels; per-provider main-road check, commercial apps and missing providers to do |
| [B-communities.md](B-communities.md) | Laterite survey respondents, allies, spec additions | done; contacts for late-added countries to do |
| [C-statistics.md](C-statistics.md) | Classifier rules, stats method, findings | done for 55 rows (two levels + mark); wiki table and sample countries to do |
| [D-examples-visuals.md](D-examples-visuals.md) | Styling mockups, sample roads, imagery review | mockups done; comparison grid of apps to do |
| [classifier/](classifier/) | Classifier in TypeScript, Lua and PostgreSQL, 59 shared test cases | done (two levels + mark) |
| [stats/](stats/) | Per-country km statistics pipeline and results ([report.md](stats/report.md), [summary.csv](stats/summary.csv), [unknown-values.md](stats/unknown-values.md), tag-combination tables in `stats/combos/`) | done: 55 rows |

Large files (`pbf/`, `work/`) are not committed.
