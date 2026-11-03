# Road drivability rendering

Working folder for the proposal asking map apps to render how drivable a road is, separately from its road class: two levels, Paved and Unpaved, plus an optional Off-road mark on Unpaved roads.

| File | Content | Status |
|---|---|---|
| [A-providers.md](A-providers.md) | Providers, existing whitelist code, issues, ranking | done |
| [B-communities.md](B-communities.md) | Laterite survey respondents, allies, spec additions | done |
| [C-statistics.md](C-statistics.md) | Classifier rules, stats method, findings | rerun in progress (new model) |
| [D-examples-visuals.md](D-examples-visuals.md) | Styling mockups, sample roads | mockups v1, sample candidates |
| [classifier/](classifier/) | Classifier in TypeScript, Lua and PostgreSQL, 59 shared test cases | done (two levels + mark) |
| [stats/](stats/) | Per-country km statistics pipeline and results ([report.md](stats/report.md), [summary.csv](stats/summary.csv), [unknown-values.md](stats/unknown-values.md), tag-combination tables in `stats/combos/`) | rerun in progress (Timor-Leste done) |

Large files (`pbf/`, `work/`) are not committed.
