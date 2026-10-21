# Team Analytics — Fetch Contract

**Page:** `/team-analytics` and its eight tabs (`?tab=week|profile|board|map|matchup|lab|trends|glossary`, `&team=` on Profile and Trends)
**Date:** 2026-10-04 · **Status:** OPEN · supersedes the 2026-09-25 version of this file
**Cadence:** current season rebuilt **weekly**, after the week's games are processed (same run that advances `shared/football_current_context.json`). Past seasons built once and frozen.
**Seasons:** 2019, 2021, 2022, 2023, 2024, 2025, **2026**. 2020 does not exist.

---

## 0. Files

All under `93-FE Docs/stats/team-analytics/`.

| # | File | Tabs |
|---|---|---|
| 1 | `index.json` | all — season list + current season |
| 2 | `hub_{season}.json` | Leader Board, Scatter, Matchup, Rating Lab, Trends (season mode), Glossary, Profile header |
| 3 | `advanced_{season}.json` | Profile, Matchup, Scatter |
| 4 | `spatial_{season}.json` | Profile (passing / rushing / havoc maps) |
| 5 | `games_{season}.json` | Trends (game mode), Rating Lab scorecards |
| 6 | `week_review_{season}.json` | Week Review |
| 7 | `player_usage_{season}.json` | Profile (leaders, player impact) |

Counting stats for the Profile's phase sections are their own contract: [Counting Stats Fetch Contract](../../stats/md/Counting%20Stats%20Fetch%20Contract.md). This contract asks only that those files cover the same seven seasons (§8).

### Coverage by tab

| Tab | Files |
|---|---|
| Week Review | 6 |
| Team Profile | 2, 3, 4, 7, counting stats |
| Leader Board | 2 (+ 3 for the advanced columns) |
| Scatter | 2, 3 |
| Matchup | 2, 3, `game-center/games/index.json` (meetings) |
| Rating Lab | 2, 5 |
| Trends | 2 (season mode), 5 (game mode) |
| Glossary | 2, `notes` in 3 |

### Rules

1. `team_id` is the v5 id (`swacjsu`). Opponents outside the 18 carry `team_id: null` plus `name` and `short_name`.
2. `null` means "not available" and renders as `—`; `0` means zero.
3. A rate ships with its count (`plays`, `dropbacks`, `carries`, `attempts`).
4. Raw values only — no pre-signing. Every metric is the raw quantity for that side; the frontend knows which direction is good.
5. Every file carries `season`, `generated_at` (ISO-8601) and `through_week` (`null` for a finished season).
6. All 18 teams in every season file, even with zero games played (`games: 0`, metrics `null`).

---

## 1. Index

### Request

```text
GET stats/team-analytics/index.json
```

### Response

```text
{
  generated_at: ISO-8601
  current_season: integer                  // 2026
  seasons: []integer                       // ascending; [2019, 2021, 2022, 2023, 2024, 2025, 2026]
  files: {
    <season>: {
      hub: boolean
      advanced: boolean
      spatial: boolean
      games: boolean
      week_review: boolean
      player_usage: boolean
      through_week: integer | null
    }
  }
}
```

---

## 2. Hub — team-season rate metrics, percentiles, ratings, records

The twenty base metric-sides: ten rate metrics, each for offense (`o_`) and defense (`d_`).

```text
rushing.successRate     rushing.opportunityRate   rushing.stuffRate
rushing.stopRate        rushing.powerStopRate     rushing.tflRate
passing.completionRate  passing.explosiveRate     passing.pressureRate
passing.ypa
```

### Request

```text
GET stats/team-analytics/hub_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null

  league: {
    teams: integer                         // teams with ≥ 1 game
    metrics: { <side_metric>: float | null }      // 18-team mean, e.g. "o_rushing.successRate"
    spread:  { <side_metric>: float | null }      // standard deviation across teams
    win_pct_spread: float | null
  }

  levers: []{                              // win correlation per metric-side, this season's pool
    field: string                          // "o_rushing.successRate"
    side: "offense" | "defense"
    metric: string                         // "rushing.successRate"
    r: float                               // correlation with win pct (signed)
    r2: float
    sample: integer                        // team-seasons in the pool
  }
  levers_pool: { seasons: []integer, team_seasons: integer }   // what the correlations were fitted over

  rating: {
    metric_label: string                   // e.g. "Team rating (adj. EPA/play)"
    method: string                         // one sentence
  }

  teams: []{
    team_id: string
    games: integer
    metrics:     { <side_metric>: float | null }
    percentiles: { <side_metric>: float | null }  // 0–100, oriented so higher = better on both sides
    rating: float | null                   // the same team rating the Schools Hub ranks on
    rating_display: string | null
    rating_rank: integer | null
    record: {
      wins: integer
      losses: integer
      pct: float
      record: string                       // "5-3"
      conference_record: string            // "4-1"
      streak: string | null                // "W2"
      last5: string | null                 // "WLWWW", oldest → newest
      division_rank: integer | null
    }
  }
}
```

**One team rating sitewide.** `teams[].rating` is the rating `schools/schools-hub/current.json` ranks on (`glory_rankings_metric`), so the Schools page, the Team Profile header and this hub never disagree on who is first.

---

## 3. Advanced — EPA, success, explosiveness, drives, havoc

Team-season rollup of the per-game `advanced_team.*` and `team_box.*` the game files already carry. Both sides.

### Request

```text
GET stats/team-analytics/advanced_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null
  notes: []string                          // any definition that differs from §3.1
  league: { offense: ADVANCED, defense: ADVANCED }   // 18-team mean
  teams: []{
    team_id: string
    games: integer
    offense: ADVANCED                      // this team with the ball
    defense: ADVANCED                      // what this team allowed / forced
    ranks: {
      offense: { <ADVANCED key>: integer | null }   // 1 = best in the league for that side
      defense: { <ADVANCED key>: integer | null }
    }
  }
}

ADVANCED = {
  # Expected points
  epa_per_play: float | null
  adj_epa_per_play: float | null           // opponent/venue adjusted; null rather than unadjusted
  epa_per_pass: float | null
  epa_per_rush: float | null
  epa_per_drive: float | null
  early_down_epa: float | null             // 1st + 2nd down
  competitive_epa_per_play: float | null   // garbage time removed
  total_epa: float | null
  plays: integer | null
  dropbacks: integer | null
  carries: integer | null
  drives: integer | null

  # Success
  success_rate: float | null               // 0–1
  success_rate_pass: float | null
  success_rate_rush: float | null
  standard_down_success: float | null
  passing_down_success: float | null
  third_fourth_success: float | null
  third_down_distance: float | null        // avg yards to go on 3rd down

  # Explosiveness
  explosiveness: float | null              // avg EPA on successful plays
  explosive_rate: float | null
  explosive_rate_pass: float | null
  explosive_rate_rush: float | null

  # Rushing detail (per carry)
  line_yards: float | null
  second_level_yards: float | null
  open_field_yards: float | null
  highlight_yards: float | null
  power_success: float | null
  power_attempts: integer | null
  stuff_rate: float | null
  opportunity_rate: float | null

  # Drives and field position
  scoring_opportunities: integer | null    // drives reaching the opponent 40
  points_per_opportunity: float | null
  red_zone_td_rate: float | null
  available_yards_pct: float | null
  average_start: float | null              // own goal line = 0
  net_field_position: float | null         // our avg start − opponent avg start

  # Havoc
  havoc_rate: float | null
  havoc_front_seven: float | null
  havoc_defensive_back: float | null
  sack_rate: float | null
  turnover_luck: float | null              // actual − expected turnovers
}
```

### 3.1 Definitions

The glossary uses these. If a computation differs, say so in `notes`.

| Term | Definition |
|---|---|
| Success | play with positive EPA |
| Explosive | EPA > 2.4 on a pass, > 1.8 on a rush |
| Rush opportunity | carry of 4+ yards |
| Stuffed run | carry at or behind the line |
| Power run | 3rd/4th down, ≤ 2 to go, rush converted |
| Scoring opportunity | drive with a snap inside the opponent 40 |
| Standard / passing down | passing down = 2nd & 8+, 3rd/4th & 5+ |
| Havoc rate | (TFL + sacks + forced fumbles + passes defended + INT) ÷ plays |
| Line yards | OL line-yards credit per carry |

---

## 4. Spatial — pass grid, rush lanes, havoc zones

### Request

```text
GET stats/team-analytics/spatial_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null
  depth_bands: { short: string, medium: string, deep: string }   // e.g. "< 4", "4–12", "> 12"
  teams: []{
    team_id: string
    offense: SPATIAL
    defense: SPATIAL                       // what this team allowed; havoc = what it made
  }
}

SPATIAL = {
  pass_grid: []{                           // 9 cells
    depth: "short" | "medium" | "deep"
    direction: "left" | "middle" | "right"
    attempts: integer
    completions: integer
    yards: integer
    epa: float | null
    touchdowns: integer
    interceptions: integer
    players: []{                           // top 3 by targets; on defense, the 3 defenders most targeted
      person_id: string
      name: string
      position: string
      image_url: string | null
      targets: integer
      receptions: integer | null
      yards: integer | null
    }
  }
  rush_lanes: []{                          // 3 cells
    direction: "left" | "middle" | "right"
    attempts: integer
    yards: integer
    yards_per_carry: float | null
    stuff_rate: float | null
    epa: float | null
    touchdowns: integer
  }
  havoc: []{                               // defense side only; offense side []
    zone: "left" | "middle" | "right"
    tfl: integer
    sacks: float
    hurries: integer | null
    forced_fumbles: integer
    passes_defended: integer
  }
  unattributed: { pass: integer, rush: integer, havoc: integer }   // plays with no stated depth/direction
}
```

Send `players: []` on the defense side when coverage can't be assigned.

---

## 5. Games — per-game team series

### Request

```text
GET stats/team-analytics/games_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null
  teams: []{
    team_id: string
    games: []{                             // played games only, date order; byes absent
      schedule_game_id: string
      game_stem: string | null             // the parsed file, when there is one
      week: integer
      date: "YYYY-MM-DD"
      opponent_id: string | null
      opponent_name: string
      home_away: "home" | "away" | "neutral"
      conference_game: boolean
      points_for: integer
      points_against: integer
      result: "W" | "L"
      metrics: { <side_metric>: float | null }   // the twenty §2 metric-sides, this game only
      offense: GAME_ADVANCED
      defense: GAME_ADVANCED
    }
  }
}

GAME_ADVANCED = {
  epa_per_play: float | null
  success_rate: float | null
  explosiveness: float | null
  points_per_opportunity: float | null
  havoc_rate: float | null
  plays: integer | null
}
```

---

## 6. Week Review

Every week of the season, every final game between two of the 18 that has play-by-play (ruled 2026-10-10: outside opponents are scores and basic facts only). Rebuilt weekly.

### Request

```text
GET stats/team-analytics/week_review_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  default_week: integer                    // most recent week with a final game
  weeks: []{
    week: integer
    label: string                          // "Week 5"
    date_range: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
    games: []{
      schedule_game_id: string
      route: string | null                 // "/game/{game_path_id}" when parsed
      date: "YYYY-MM-DD"
      status: "final" | "scheduled"
      conference_game: boolean
      home: SIDE
      away: SIDE
      winner_id: string | null
      margin: integer | null               // winner − loser
      net_success: float | null            // winner success rate − loser success rate
      epa_diff: float | null               // winner EPA/play − loser EPA/play
      winner_edge: float | null            // = net_success (the bar); formula in `edge_method`
    }
  }
  edge_method: string
}

SIDE = { team_id: string | null, name: string, short_name: string, score: integer | null }
```

---

## 7. Player usage and leaders

### Request

```text
GET stats/team-analytics/player_usage_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  through_week: integer | null
  teams: []{
    team_id: string
    players: []{                           // everyone with a snap
      person_id: string
      player_key: string
      name: string
      last_name: string
      position: string
      image_url: string | null
      games_played: integer
      production_total: float | null
      production_per_game: float | null
      usage: {
        overall: float | null              // share of team plays
        passing: float | null
        rushing: float | null
        standard_downs: float | null
        passing_downs: float | null
      }
      game_log: []{ schedule_game_id: string, week: integer, production: float | null }
    }
    leaders: {                             // top 3 each, in the backend's order
      passing:      []LEADER
      rushing:      []LEADER
      receiving:    []LEADER
      pass_defense: []LEADER
      run_defense:  []LEADER
    }
  }
}

LEADER = {
  person_id: string
  name: string
  last_name: string
  position: string
  image_url: string | null
  value: float                             // the stat the list is ordered on
  value_label: string                      // "Passing production"
  value_display: string
  line: string | null                      // e.g. "142-218 · 1,904 yds · 14 TD"
}
```

---

## 8. Season coverage for counting stats

`stats/counting/team_{season}.json` and `stats/counting/player_{season}.json` ([Counting Stats contract](../../stats/md/Counting%20Stats%20Fetch%20Contract.md)) for **2019, 2021, 2022, 2023, 2024 and 2026**, with 2026 rebuilt weekly.

---

## 11. Scatter additions (2026-10-04)

Four standard scatter charts. Two run on fields already in `advanced_{season}.json` (offense vs defense `competitive_epa_per_play`; offense vs defense `havoc_rate`). The other two need these, added to **ADVANCED** on both sides:

```text
ADVANCED += {
  # Discipline — accepted penalties committed by this side of the ball
  penalties_per_game: float | null
  penalty_yards_per_game: float | null

  # Success by half — same down-and-distance rule as success_rate
  success_rate_first_half: float | null
  success_rate_second_half: float | null
  plays_first_half: integer | null
  plays_second_half: integer | null
}
```

On `defense`, the penalty fields are fouls **committed by this team's defense**, not by its opponents. The half fields are opponent success against this defense. The frontend computes net success by half as offense minus defense. The same penalty totals by side also appear in `stats/counting/penalties_{season}.json` (`by_side`), and the two must agree.

---

## 12. Rushing scatter charts (2026-10-16)

Four rushing charts join the standard scatters. Power & Stuffs runs on fields already in **ADVANCED** (`stuff_rate`, `power_success`). The other three need these, added to **ADVANCED** `offense`, every season:

```text
ADVANCED.offense += {
  # 1st & 10 — this offense's snaps on 1st and 10
  f10_run_rate: float | null              // runs ÷ (runs + dropbacks) on 1st & 10
  f10_rush_success_rate: float | null     // run success on 1st & 10 (50%-of-distance rule)

  # QB share — designed runs and scrambles by the team's quarterbacks
  qb_share_of_carries: float | null       // QB carries ÷ team carries
  qb_share_of_rush_yards: float | null    // QB rush yards ÷ team rush yards

  # Late strength — run success by half, same rule as success_rate_rush
  rush_success_first_half: float | null
  rush_success_second_half: float | null
}
```

Rates are 0–1, counted over the season's League plays and divided once, garbage time excluded, the same basis as `success_rate_rush`. A team with no League game ships nulls.

---

## 9. Index of asks

| # | Ask | File | Tabs |
|---|---|---|---|
| 1 | Season index | `index.json` | all |
| 2 | Hub: 20 metric-sides, percentiles, league mean/spread, levers, record, rating — 7 seasons incl. 2026 weekly | `hub_{season}.json` | Board, Scatter, Matchup, Lab, Trends, Glossary, Profile |
| 3 | One team rating, same as the Schools Hub ranking | `hub_{season}.json` `rating` | Profile, Board, Lab |
| 4 | Advanced block, both sides, with ranks | `advanced_{season}.json` | Profile, Matchup, Scatter |
| 5 | Confirm or correct §3.1 definitions | `advanced_{season}.json` `notes` | Glossary |
| 6 | Pass grid + top-3 players, rush lanes, havoc zones, unattributed counts | `spatial_{season}.json` | Profile |
| 7 | Per-game team series | `games_{season}.json` | Trends, Lab |
| 8 | Week review, all weeks, with `epa_diff`, weekly | `week_review_{season}.json` | Week Review |
| 9 | Player usage, game logs, leaders | `player_usage_{season}.json` | Profile |
| 10 | Counting stats for 2019, 2021–2024, 2026 | `stats/counting/*_{season}.json` | Profile |
| 11 | Penalties per game and success by half, both sides | `advanced_{season}.json` | Scatter: Discipline, Net Success by Half |

---

*Last updated: 2026-10-04*
