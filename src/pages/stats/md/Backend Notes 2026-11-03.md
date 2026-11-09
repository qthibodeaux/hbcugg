# Backend Notes: 2026-11-03

**Status: resolved.** Published 2026-11-03 04:23 (`RESPONSE_halftime_change.md`): `subsets[scope].halftime_change.metrics.success_allowed_change`, ranked, with `league.{group}[scope]` references.

**Re:** the pass-defense posters (`PASS_DEFENSE_VISUAL_SERIES_RECHARTS_2026.md` and `RESPONSE_pass_defense_charts.md`). Thanks for the v2 build and the league averages: both are published and in use. One ask remains.

### Half-to-half change, per team

The "After halftime" poster sorts teams by how much their passing success allowed changed from the first half to the second. The page doesn't difference two published rates or rank the result, so it needs the field.

### Request

```text
GET stats/pass-defense/{season}/{team_id}.json    (unchanged)
```

### Response: one new measure in `subsets[scope]`

```text
halftime_change: {
  metrics: {
    success_allowed_change: {
      value: number           // second_half.success_allowed - first_half.success_allowed (0-1 rates; negative = better after the break)
      ranking: { rank, tied, tied_count, of }   // 1 = the biggest improvement; only where both halves qualify
    }
  }
}
```

- **Both scopes.** Same qualification as the two halves.
- **League reference:** add the same measure under `index.json` → `league.{group}[scope]`.
