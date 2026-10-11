# QB Map — Fetch Contract

**Page:** Player Analytics → QB Map (scatter of every qualified quarterback: EPA per dropback × success rate, numbered key beside it)
**Date:** 2026-10-11 · **Status:** OPEN
**Cadence:** current season rebuilt **weekly**, after the week's games are processed (same run that advances `shared/football_current_context.json`). Past seasons built once and frozen.
**Seasons:** 2019, 2021, 2022, 2023, 2024, 2025, **2026**. 2020 does not exist.

**These are type contracts, not example payloads.**

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array. Team ids are v5 ids (`swacjsu`). Rates are 0–1. `null` means not available and renders `—`; `0` means zero.

**Data ownership rule:** the backend decides who qualifies, the order, the rank, the axis ranges and the quadrant lines. The frontend plots what it is given and joins only team identity from `src/data/teams.json` by `team_id`.

---

## Request

```text
GET /data/93-FE Docs/stats/player-analytics/qb-map_{season}.json
GET /data/93-FE Docs/stats/player-analytics/qb-map_index.json
```

---

## Index Response

```text
generated_at: string                    // ISO 8601 with offset
current_season: integer
seasons: integer[]                      // ascending
```

---

## Season Response

```text
season: integer
generated_at: string                    // ISO 8601 with offset
through_week: integer | null            // null for a finished season
through_date: string                    // "2026-10-10"

qualification: {
  min_dropbacks: integer                // 50
  garbage_time_excluded: boolean
  qualified: integer                    // quarterbacks plotted
  pool: string                          // "HBCU — 12 SWAC + 6 MEAC"
}

axes: {
  x: { key: "success_rate", label: string, min: number, max: number, ticks: number[] }
  y: { key: "epa_per_dropback", label: string, min: number, max: number, ticks: number[] }
  x_mid: number                         // vertical quadrant line
  y_mid: number                         // horizontal quadrant line
  mid_basis: string                     // "pool median" / "pool mean" — as it prints
}

quadrants: {
  top_left: string                      // "Higher EPA per dropback · Lower success rate"
  top_right: string
  bottom_left: string
  bottom_right: string
}

measure: [{ label: string, text: string }]    // the "How we measure" footer lines, backend-written

players: Player[]                       // rank order: epa_per_dropback descending
```

### Player

```text
rank: integer                           // 1-based, the number printed on the dot and in the key
player_id: string
name: string
team_id: string
class_year: string | null               // "Fr.", "So.", "Jr.", "Sr.", "Gr."
jersey_number: integer | null
image_url: string | null                // headshot; null falls back to the team mark

dropbacks: integer                      // pass attempts + sacks, scrambles excluded, garbage time excluded
epa_per_dropback: number
success_rate: number
quadrant: "top_left" | "top_right" | "bottom_left" | "bottom_right"

games: integer
attempts: integer
completions: integer
pass_yards: integer
pass_tds: integer
interceptions: integer
sacks_taken: integer
```

---

## Rules

1. Every player in `players` is plotted; the backend applies `min_dropbacks`. Nobody below the threshold ships.
2. `rank` is unique and contiguous from 1. The key and the dots read the same number.
3. `x_mid` / `y_mid` are the pool's own lines for that season, so the quadrants rebalance as the season fills in.
4. `axes` min/max/ticks are chosen to contain every plotted player with padding; the frontend does not clamp or rescale.
5. A player who transferred mid-season carries the team they have most dropbacks for.
6. Early in the season with no one qualified: `players: []`, `qualification.qualified: 0`.
