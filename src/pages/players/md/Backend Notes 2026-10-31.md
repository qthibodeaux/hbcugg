# Player overview counting-data concern

Reviewed: 2026-10-31. Reviewed by: Codex (cleanup chat).

The live PlayerStatsOverview model now lives in
`components/organisms/player/statsOverview/overviewModel.js`. Its existing
`mockCountingStats` function generates counting lines from component production.
Every displayed production block calls this function; these are not observed
attempts, completions, yards, touchdowns, interceptions or defensive totals.
The cleanup preserved this behavior and did not introduce these formulas.

Before requesting a new export, identify whether the selected player's existing
season/counting payload already provides these totals and map its person ID,
team and season explicitly. This review does not establish a backend data gap.
If the fields are absent, the contract should supply typed counting totals and
an availability indicator for each production type. Preserve real zero values;
missing data must remain distinguishable from zero and estimated values.

The component also apportions replacement production by each component's share.
That is a frontend approximation, not a backend component replacement metric.
Confirm the intended statistical definition before treating it as an observed
component baseline.

Replacing these displays requires a separate data-wiring/unavailable-state pass
and review of the player Stats Overview on desktop and phone. No backend files
or scripts were changed or run.
