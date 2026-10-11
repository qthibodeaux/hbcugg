# Stats Hub Cards — Fetch Contract

**Page:** `/stats` (Hub tab), the context cards under the banner
**Date:** 2026-10-07 · **Status:** OPEN · replaces `0-data/stats_hub_cards_2025.json` (frontend-built, 2025 only)
**Cadence:** current season rebuilt **weekly**, in the same run as `stats/team-analytics/`. Past seasons built once.
**Seasons:** 2019, 2021–2026.

---

## Request

```text
GET stats/hub-cards/{season}.json
```

## Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null
  cards: []CARD                            // in display order; one card per archetype below
}

CARD = {
  card_id: string                          // stable per archetype + season
  archetype: string                        // the table below
  title: string                            // eyebrow, e.g. "What Wins"
  headline: string                         // one sentence
  why: string | null                       // one supporting line
  stat: { value: number | string, display: string, label: string, team_id: string | null }
  viz: VIZ                                 // shape by archetype
}
```

Every number comes from the same season's `stats/team-analytics/` files (hub levers, metrics, percentiles, ratings, records; `player_usage` for production). `team_id` is the v5 id; only the 18.

## Archetypes and `viz`

| # | archetype | Card | `viz` |
|---|---|---|---|
| 1 | `win_levers` | What Wins: the 10 strongest levers | `{ kind: "correlation_bars", entries: []{ label, short, r } }` (by \|r\| desc) |
| 2 | `league_map` | League Map: every team on the strongest offense lever × strongest defense lever | `{ kind: "scatter_map", x: AXIS, y: AXIS, league: { x, y }, points: []{ team_id, x, y } }` |
| 3 | `metric_of_week` | Metric of the Week: one metric-side, every team | `{ kind: "distribution", metric, unit, league, entries: []{ team_id, value, record } }` (desc) |
| 4 | `record_ahead` | Doesn't Add Up: record well ahead of rating | `{ kind: "rank_gap", record_rank, rating_rank, total, record, rating_display }` |
| 5 | `rating_ahead` | Doesn't Add Up: rating well ahead of record | same as 4 |
| 6 | `dead_metric` | Doesn't Matter: weakest lever against the strongest | `{ kind: "dumbbell", rows: [ { label, r, tone: "muted" }, { label, r, tone: "accent" } ] }` |
| 7 | `statistical_twins` | Statistical Twins: closest pair across the top-8 levers | `{ kind: "twin_bars", a: team_id, b: team_id, axes: []{ label, a, b } }` (percentiles 0–100) |
| 8 | `team_fingerprint` | Team Fingerprint: furthest from average across the top-8 levers | `{ kind: "radar", team_id, axes: []{ label, value } }` (percentiles 0–100) |
| 9 | `production_leader` | Production Leader: season production, top 6 | `{ kind: "rank_bars", person: { name, last_name, image_url, team_id, position }, entries: []{ label, team_id, value, is_subject } }` |
| 10 | `conference_gap` | SWAC vs MEAC: the metric-side the conferences split on most | `{ kind: "conference_split", metric, unit, better: "high" \| "low", groups: [ { label: "SWAC", value, teams }, { label: "MEAC", value, teams } ] }` |
| 11 | `parity_index` | Parity Index: win % spread by season | `{ kind: "season_trend", entries: []{ label, value, highlight } }` |

```text
AXIS = { label: string, unit: "pct" | "num", better: "high" | "low" }
```

| Field | Rule |
|---|---|
| `stat.display` | Printed as-is; the frontend never formats `stat.value` |
| `unit` | `"pct"` values are 0–1; `"num"` is the raw value |
| Selection | The backend picks the team, pair, metric and wording; the frontend renders what ships |
| Small samples | A team with `games` < 2 is left out of 4, 5, 7 and 8 |
| Missing | An archetype with no qualifying subject is omitted from `cards`, not shipped empty |

---

*Last updated: 2026-10-07*
