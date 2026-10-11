# Data Pipeline Issues

Fresh issue log started for the next pipeline pass.

---

## P0 - Game Detail Page Fetch Contract And Summary Inventory

**Discovered on:** 2026-05-22  
**Page:** `/game/:gameId` Game Page  
**Example data file:** public/data/1-game center/games/2025/W15pvamujsu.json

### What We Saw

The Game Page has four built tabs:

- **Game Summary** ✅ — PageShell grid layout with 9 cards (The March, Game Info, Scoring Summary, Team Stats Comparison, Game Leaders, Notable Performers, Win Probability placeholder, Drive Summary, Scoring Plays Timeline)
- **Box Score** ✅ — Individual player stats by category (passing, rushing, receiving, defense)
- **Play By Play** ✅ — Full-width filterable play list with quarter/team/play-type/player filters
- **Team Stats / Data Room** ✅ — 14 analytic sections covering EPA, success rates, explosiveness, passing, rushing, drives, defense, turnovers, special teams, penalties, coaching, sequence

The current parsed game file has a rich payload, but future Firebase/Supabase integration should not make the frontend stitch together many backend records or recalculate canonical page facts. Supabase/Firebase can stay light on processing, but the fetch should be specific: one game-detail request should retrieve and return the exact page-shaped data the route needs.

### Target Fetch

Recommended future endpoint/function:

```text
game_detail_payload(game_id)
```

Frontend query key:

```js
["game-detail", gameId]
```

### Required Response Groups

```json
{
  "game_id": "W15pvamujsu",
  "season": 2025,
  "metadata": {},
  "teams": {},
  "summary": {},
  "box_score": {},
  "play_by_play": {},
  "team_stats": {},
  "stat_glossary": {},
  "data_quality": {}
}
```

### Summary Data Contract

Game Summary should be an executive recap, not the full stat dump. It needs these page-ready groups:

- scoreboard and context: final score, team IDs, date, site, attendance, kickoff, officials
- quarter scoring and scoring capsule
- team headline metrics: EPA/play, success, total yards, turnovers, red zone, points per drive, quality drives
- impact leaders: pass/rush/receiving/defense plus Glory MVP or production leader
- game flow: drive timeline, scoring drives, all-drives summary, decisive drive/play markers
- hidden edges: average start field position, long-field drive rate, special teams swing, penalty cost, hidden yards, turnovers
- why-it-happened signals: sequence model, defensive identity, pressure profile, coaching profile
- chart feeds: EPA timeline, win probability timeline when available, drive chart rows
- standings context if the Summary keeps a standings module

### Current Gaps In W15pvamujsu

- The displayed final score needs verification. Current file metadata says JSU 27, PVAMU 23, but design review flagged an expected PVAMU 23, JSU 21 result. The pipeline must confirm whether the app is loading the correct game file and whether score reconstruction is stale or wrong.
- `scoring_summary` is empty even though `play_by_play` has scoring events.
- `play_by_play[].wpa` is present but null, so a win probability chart is not reliable.
- `hidden_yardage.{team}` exists but key values are null.
- standings context is not embedded in the game payload.
- team display names in `metadata` are IDs; frontend should join visual identity from `teams.json`, but the payload should keep stable v5 IDs.

### Pipeline Fix Needed

- Add score validation before export:
  - compare `metadata.home_team.score` / `metadata.away_team.score` against the final scoring play score-after fields
  - compare reconstructed score against the source box score / official final when available
  - emit `data_quality.warnings[]` and fail the export when final scores disagree
  - ensure route IDs such as `W15pvamujsu` resolve to the intended source file, not an old or duplicate parse
- Populate `scoring_summary` from scoring plays.
- Export chart-ready `epa_timeline` and `win_probability_timeline`.
- Export summary-ready `impact_leaders` and `glory_mvp`.
- Export `hidden_edges` as a first-class summary group using field position, special teams, penalties, and turnovers.
- Export `significant_plays`, `significant_drives`, and optional `significant_series`.
- Export `stat_glossary` entries for all non-obvious metrics used in Summary and Box Score.
- Export `data_quality.warnings[]` for null or unavailable fields instead of letting the UI silently guess.

---

## P0 - Field Position Timeline for "The March" Visualization

**Discovered on:** 2026-05-29
**Page:** `/game/:gameId` Game Summary tab
**Component:** `FieldPositionMarch` (planned replacement for Score Flow)
**Example data file:** `public/data/1-game center/games/2025/W15pvamujsu.json`

### What We Need

A single continuous line chart showing field position over time, color-coded by possession team. The away team drives UP (toward Y=100), the home team drives DOWN (toward Y=0).

### Y-Coordinate Mapping

| Team | Ball at own 25 | Ball at midfield | Ball at opponent 25 | Y formula |
|------|---------------|------------------|---------------------|-----------|
| Away | Y=25 | Y=50 | Y=75 | `y = yl_abs` |
| Home | Y=75 | Y=50 | Y=25 | `y = 100 - yl_abs` |

### Required Backend Output

Add `field_position_timeline` array to the game payload. One entry per actual play (filter out `line_type === "EVENT"` and `line_type === "HEADER"`).

```json
{
  "field_position_timeline": [
    {
      "sequence": 0,
      "quarter": 1,
      "clock": "14:54",
      "clock_seconds": 894,
      "game_time_progress": 0.015,
      "offense_team": "swacjsu",
      "defense_team": "swacpvamu",
      "yl_abs": 33,
      "yl_team": "swacjsu",
      "yl_num": 33,
      "yards_gained": 0,
      "down": 1,
      "distance": 10,
      "is_scoring": false,
      "is_turnover": false,
      "is_big_play": false,
      "play_type": "RUSH",
      "possession_changed": false
    }
  ]
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | int | Play order (0-indexed) |
| `quarter` | int | 1-4 |
| `clock` | string | "MM:SS" |
| `clock_seconds` | int | Seconds remaining in quarter |
| `game_time_progress` | float | 0.0 to 1.0 across full game |
| `offense_team` | string | v5 team ID |
| `defense_team` | string | v5 team ID |
| `yl_abs` | int | Absolute yard line (1-99). Fixed reference — one end zone is 0, other is 100. |
| `yl_team` | string | Which team's side the ball is on |
| `yl_num` | int | Yard line number (1-50) |
| `yards_gained` | int | Net yards |
| `down` | int | 1-4 |
| `distance` | int | Yards to go |
| `is_scoring` | bool | TD, FG, safety |
| `is_turnover` | bool | INT, fumble lost, downs |
| `is_big_play` | bool | 20+ yard gain |
| `play_type` | string | RUSH, PASS, SACK, PENALTY, etc. |
| `possession_changed` | bool | True if offense_team differs from previous play |

### Data Quality Requirements

1. **Every play must have `yl_abs`** — infer from previous play + yards gained if missing
2. **Only actual plays** — filter out EVENT and HEADER line types
3. **Chronological order** — sorted by quarter, then clock descending
4. **Possession change markers** — explicit flag when offense_team changes

### Current Gap

In existing `play_by_play`:
- 161 `PLAY` entries exist out of 239 total rows
- Some `PLAY` entries lack `yl_abs` (kickoff returns, etc.)
- The backend must compute/infer `yl_abs` for every play

### Frontend Visualization

- **Library:** Recharts (LineChart with multiple Line segments or custom SVG)
- **X-axis:** `game_time_progress` (0 to 1, with Q1/Q2/Q3/Q4 markers)
- **Y-axis:** Computed Y-coordinate (0 to 100)
- **Line:** Single line, color changes per segment based on `offense_team`
- **Background:** Yard lines at 10-yard intervals, red zones tinted
- **Markers:** Scores (green), turnovers (red), big plays (yellow)
- **Possession changes:** Dashed vertical connector between segments

---

## P1 - Add Defensive Crucial-Down Stop Metrics To Game Payloads

**Discovered on:** 2026-05-20  
**Page:** Game production components and future defensive production panels  
**Example data file:** public/data/1-game center/games/2025/W15pvamujsu.json

### What We Saw

The payload has offensive third- and fourth-down fields in team_box, plus down/call success splits in coaching_profile. The frontend can invert those to describe defense, but that makes defensive impact harder to reason about and easy to label inconsistently.

Current example, interpreted defensively:

| Defense | 3D Allowed | 3D Allowed % | Avg 3D Dist | 4D Allowed | 4D Allowed % |
|---|---:|---:|---:|---:|---:|
| JSU defense vs PVAMU | 11/21 | 52.4% | 8.38 | 3/3 | 100% |
| PVAMU defense vs JSU | 2/10 | 20.0% | 8.00 | 1/1 | 100% |

### Current Gaps

We do not have direct defense-owned crucial-down metrics such as:

- third_down_stop_rate
- third_down_conversion_rate_allowed
- fourth_down_stop_rate
- early_down_success_rate_allowed
- average_distance_to_gain_allowed_by_down

### Pipeline Fix Needed

Add a defense-owned block to each game payload. Suggested shape:

```json
{
  "defensive_crucial_downs": {
    "swacjsu": {
      "opponent_team": "swacpvamu",
      "third_down": {
        "attempts_faced": 21,
        "conversions_allowed": 11,
        "conversion_rate_allowed": 0.5238,
        "stop_rate": 0.4762,
        "avg_distance_faced": 8.38,
        "rush_attempts_faced": 9,
        "rush_success_allowed": 0.5556,
        "pass_attempts_faced": 11,
        "pass_success_allowed": 0.4545
      }
    }
  }
}
```

---

## P2 - Standardize Defensive "Glory" & Advanced Analytics Across Game Payloads

**Discovered on:** 2026-05-21  
**Page:** Game Production / Defense Mastery & Pressure Profile panels  
**Inspiration:** src/utils/defenseGloryModel.js (Glory Engine v1)

### What We Saw

We just implemented the "Glory Engine" to move away from mock grades. However, the frontend currently has to manually map raw box score stats (Sacks, TFLs, PDs) to calculate composite metrics like **Havoc Rate** and **Stuff Rate**. 

While these calculations are relatively inexpensive, keeping the "Source of Truth" for what constitutes an "A" grade or an "Elite" performance in the frontend code makes it difficult to update benchmarks globally without a code deploy.

### Current Gaps

- **Lack of EPA:** epa_per_play is the gold standard for efficiency, but it's currently hardcoded or estimated because the pipeline doesn't yet export per-play expectation data to the game JSONs.
- **Dynamic Benchmarking:** The frontend "Glory" logic uses static thresholds (e.g., Havoc > 18% = A). These should ideally be relative to the specific season's league average or the specific conference (SWAC vs MEAC).
- **Identity Labels:** Labels like "IRON CURTAIN" or "CHAOS ENGINE" are generated by a JS utility. Moving these to the pipeline allows for the "Why Engine" to explain *why* a team received that tag (e.g., "JSU is a Chaos Engine tonight because their Front 7 forced a TFL on 25% of run plays").

### Pipeline Fix Needed

Create a defensive_analytics block in the game payload that pre-computes advanced metrics and Glory Benchmarks.

```json
{
  "defensive_analytics": {
    "performance_capsule": {
      "swacjsu": {
        "glory_score": 88,
        "identity": "CHAOS ENGINE",
        "primary_trait": "Disruption",
        "metrics": {
          "havoc_rate": 0.132,
          "stuff_rate": 0.231,
          "success_rate_allowed": 0.333,
          "epa_per_play_allowed": 0.012,
          "points_per_opportunity_allowed": 1.25
        },
        "grades": {
          "overall": "A-",
          "front_seven": "A",
          "secondary": "B+",
          "red_zone": "A"
        }
      }
    }
  }
}
```

By moving this to the pipeline, we can ensure that every game—historical or live—is evaluated against the same "Glory" criteria without the frontend needing to know the mathematical thresholds.

---

## P3 - Coach Profiling via Play-by-Play Analysis

**Discovered on:** 2026-05-21  
**Goal:** Derive a "Coaching Fingerprint" from raw game event sequences to characterize aggression, pace, and situational awareness.

### Objective
Moving beyond raw wins/losses to characterize *how* a coach manages a game. We can derive a high-fidelity profile using the following 8 markers from play-by-play data:

1.  **4th Down Decisions:** Binary choices (Go vs. Punt/Kick). Map attempt rate and conversion rate, specifically split by field position (own territory vs. opponent territory).
2.  **2-Point Conversion Logic:** Frequency of attempt vs. point-after-touchdown (PAT) decisions and success correlation.
3.  **Critical Decision Trees (4th & Short):** Specifically in the 4th quarter, analyzing the choice between a Field Goal and a "Go-For-It" scenario.
4.  **Timeout Economics:** Timing of timeout usage (pre-halftime drive management vs. late-game clock stops vs. "wasted" early timeouts).
5.  **Pace & Tempo:** Average "seconds between plays" tracking. Identify if a coach accelerates tempo after scoring, when trailing, or maintains a consistent high-pace identity.
6.  **Playcalling Evolution (1H vs 2H):** Run/Pass ratio splits by half. Identifies coaches who "abandon the run" or successfully open up the passing game when chasing points.
7.  **Red Zone Philosophy:** Run vs. Pass distribution inside the 20-yard line (Power/Pound-it-in vs. Spread/Finesse).
8.  **Turnover Response:** Drive results immediately following a giveaway. Quantifies offensive resilience and mental coaching/discipline.

### Expected Outcome
A "Coaching Fingerprint" dashboard that visualizes:
- **Aggression Level** (4th down/2-pt rates)
- **Pace Preference** (Tempo metrics)
- **Situational Composure** (Timeout/Turnover response)
- **Playcalling Identity** (RZ/Half splits)

This provides fans with a "human chess match" perspective that transcends basic box score stats.

---

## P1 - Special Teams Production Contract For Game Detail Pages

**Discovered on:** 2026-05-27  
**Page:** Game detail production report, Box Score tab  
**Example data file:** public/data/1-game center/games/2025/W15pvamujsu.json

### What We Saw

The current game payload already has a useful `special_teams_advanced` block, but the frontend needs clearer, page-ready fields and player-level special teams stats directly delivered via fetch. The frontend should **never** parse play-by-play logs or do roster merges to calculate player stats on the fly. 

The special teams panel will be redesigned into a horizontal three-layer dashboard (Field Goals, Kickoff, Punts), with each layer featuring a dedicated **Specialists Table (People Column)** on the right listing all accounted players for that unit and their exact game stats.

### Target Special Teams UI Layout

#### 1. Top Ledger KPI Pills (5 Columns)
- **Avg Drive Start**: Offense starting yardline vs. Opponent starting yardline.
- **Long Field %**: Percentage of drives starting inside the 20 yard line.
- **Hidden Yards**: Net field position swing yards (`summary.st_swing_yards`).
- **ST Play Count**: Total special teams snaps.
- **Penalty Cost**: Total special teams penalty yards and count.

#### 2. Field Goal Layer (2 Columns)
- **Left Column - Stats Grid (2 rows x 4 columns):**
  - *Row 1 (Top pills):* `FG Made/Att` (e.g. `[x]/[y]`), `FG Percentage`, `Long FG`, `PATs`
  - *Row 2 (Bottom pills - Custom ranges):* `<15` yards, `15-30` yards, `30-45` yards, `>45` yards
- **Right Column - Specialists Table:**
  - Simple column table listing the kicker(s) and their exact game performance (e.g., `Baeza (K): 3/5 FG, 45 Lg, 3/3 PAT`).

#### 3. Kickoff Layer (3 Columns)
- **Left Column - Kickoff Offense Stats:** Kickoffs, touchbacks, avg stats, kickoff field position added (EPA replacement).
- **Middle Column - Kickoff Defense/Return Stats:** Returns, touchbacks, avg start allowed, KO field position, turnovers, etc.
- **Right Column - Specialists Table:**
  - Simple table listing the kickoff specialist and kickoff returners and their exact game stats (e.g., `Alfaro (KO): 5 KO, 40% TB`; `Fortilien (RET): 4 returns, 59 yards, 1 TD`).

#### 4. Punt Layer (3 Columns)
- **Left Column - Punt Offense Stats:** Number of punts, touchbacks, avg distance, out of bounds, inside 20, gross yards, blocks.
- **Middle Column - Punt Defense/Coverage Stats:** Return yards given up, return yards, return yards avg, muffs recovered, blocks.
- **Right Column - Specialists Table:**
  - Simple table listing the punter and punt returners and their exact game stats (e.g., `Noll (P): 5 punts, 42.1 avg, 52 long`; `Fortilien (PR): 2 returns, 14 yards, 7.0 avg`).

### Pipeline Fix Needed

Add a pre-computed `special_teams_production` object to every parsed game file. The backend agent **must** build this structure and populate the players' stats directly so that the frontend can fetch it.

```json
{
  "special_teams_production": {
    "summary": {
      "avg_drive_start_overall": "Own 33",
      "avg_drive_start_on_returns": "Own 38",
      "opp_drive_start_overall": "Own 24",
      "opp_drive_start_on_returns": "Own 27",
      "long_field_pct": 0.42,
      "opponent_drives_pinned_u20": 3,
      "opponent_drives_pinned_u10": 1,
      "field_flipping_plays_count": 2,
      "hidden_yards": 20,
      "st_play_count": 16,
      "penalty_cost_yards": -20,
      "penalty_count": 2,
      "penalty_yards_by_unit": {
        "kickoff": 0,
        "kickoff_return": 10,
        "punt": 10,
        "punt_return": 0
      }
    },
    "field_goals": {
      "overall": {
        "made": 3,
        "attempts": 4,
        "pct": 0.75,
        "long": 48,
        "pat_made": 3,
        "pat_attempts": 3
      },
      "ranges": {
        "u15": { "made": 0, "attempts": 0 },
        "15_30": { "made": 2, "attempts": 2 },
        "30_45": { "made": 1, "attempts": 2 },
        "o45": { "made": 0, "attempts": 0 }
      },
      "specialists": [
        {
          "player_key": "name:baeza,gerardo",
          "name": "Baeza, Gerardo",
          "jersey": "39",
          "role": "K",
          "stats_summary": "3/4 FG, 48 Long, 3/3 PAT"
        }
      ]
    },
    "kickoffs": {
      "offense": {
        "kickoffs": 5,
        "touchbacks": 2,
        "avg_yards": 62.0,
        "ko_field_pos_added": 1.3,
        "turnovers_forced": 1
      },
      "defense": {
        "kickoffs_faced": 6,
        "return_attempts": 4,
        "touchbacks": 0,
        "avg_start_allowed": 27.2,
        "return_yards_allowed": 84,
        "touchdowns_allowed": 0
      },
      "specialists": [
        {
          "player_key": "name:alfaro,diego",
          "name": "Alfaro, Diego",
          "jersey": "42",
          "role": "KO",
          "stats_summary": "5 KO, 40% TB, 62.0 Avg"
        },
        {
          "player_key": "name:fortilien,joanes",
          "name": "Fortilien, Joanes",
          "jersey": "17",
          "role": "RET",
          "stats_summary": "4 returns, 59 yards, 1 TD"
        }
      ]
    },
    "punts": {
      "offense": {
        "punts": 7,
        "touchbacks": 0,
        "avg_distance": 36.9,
        "out_of_bounds_count": 1,
        "inside_20": 1,
        "gross_yards": 258,
        "blocks_allowed": 0,
        "downed_count": 2,
        "turnovers_forced": 0
      },
      "defense": {
        "punts_faced": 7,
        "return_attempts": 3,
        "return_yards_allowed": 46,
        "avg_return_allowed": 15.3,
        "muffs_recovered": 0,
        "blocks": 0
      },
      "specialists": [
        {
          "player_key": "name:noll,matt",
          "name": "Noll, Matt",
          "jersey": "10",
          "role": "P",
          "stats_summary": "7 punts, 36.9 Avg, 51 Long, 1 In20"
        },
        {
          "player_key": "name:fortilien,joanes",
          "name": "Fortilien, Joanes",
          "jersey": "17",
          "role": "PR",
          "stats_summary": "2 returns, 14 yards, 7.0 Avg"
        }
      ]
    }
  }
}
```

### Validation Rules

- [ ] **Touchback Avg Start Split**: The pipeline must split average starts into `overall` and `on_returns` (excluding touchbacks) for both offense and defense to accurately weigh coverage vs. touchback value.
- [ ] **Turnovers/Muffs Attribution**: Turnovers forced on special teams (like fumbled returns) must be credited to the kicking coverage unit (`kickoffs.offense.turnovers_forced` / `punts.offense.turnovers_forced`) rather than the defense block.
- [ ] **Punts Out of Bounds & Downed**: The pipeline must parse and output `out_of_bounds_count` and `downed_count` for punt offense. These are crucial, zero-return safety nets and pinning events.
- [ ] **Punt Return Attempts**: `defense.return_attempts` must be modeled as actual return tries, distinct from `punts_faced` (total opponent punts). The "True Return Rate" is defined as `return_attempts / punts_faced`.
- [ ] **Detailed Penalty Yards**: Penalties on special teams must be detailed by sub-unit (`penalty_yards_by_unit`) to isolate punt coverage errors from kickoff return errors.
- [ ] **Flipped Field & Drive Pinning**: Track concrete drive-starts metrics: `opponent_drives_pinned_u20`, `opponent_drives_pinned_u10`, and `field_flipping_plays_count` (returns >30y, punts >50y) instead of nebulous point estimations.
- [ ] Field goal ranges **must** be categorized into `<15`, `15-30`, `30-45`, and `>45` yards.
- [ ] Kicker, punter, kickoff, and return specialists **must** be pre-compiled into the `specialists` array for each layer with game-specific stats.

---

## P3 - Box Score Passing Directional Grid Must Be Pre-Computed

**Discovered on:** 2026-05-23
**Page:** `/game/:gameId` Box Score tab — Passing Production module
**Example data file:** `public/data/1-game center/current_exports/games/2025/W15pvamujsu.json`

### What We Saw

The Box Score Passing module displays a 3×3 field map grid showing completions/attempts/yards by:
- **Depth**: short (<4), medium (4-12), deep (>12)
- **Direction**: left, middle, right

The current game payload provides `individual_stats.{team}.passing[].depth_breakdown` with only depth (short/medium/deep), **no direction**.

The frontend currently derives direction by regex-parsing `play_by_play[].raw_text` for patterns like `"pass complete short left to..."`. This is:
- Fragile (depends on raw text formatting)
- Expensive (requires scanning entire play-by-play array)
- Inconsistent (not all plays have explicit direction markers)

### Current Gaps

- `individual_stats.{team}.passing[].direction_breakdown` does not exist
- `individual_stats.{team}.receiving[].direction_breakdown` does not exist
- No structured grid data for passers or receivers

### Pipeline Fix Needed

Add pre-computed directional grids to each passer and receiver row:

```json
{
  "individual_stats": {
    "swacjsu": {
      "passing": [
        {
          "player_key": "name:lockhart,jared",
          "name": "Lockhart,Jared",
          "attempts": 9,
          "completions": 6,
          "yards": 183,
          "depth_breakdown": { "short": {...}, "medium": {...}, "deep": {...} },
          "direction_breakdown": {
            "short": { "left": { "attempts": 1, "completions": 1, "yards": 4 }, "middle": { "attempts": 0, "completions": 0, "yards": 0 }, "right": { "attempts": 0, "completions": 0, "yards": 0 } },
            "medium": { "left": { "attempts": 0, "completions": 0, "yards": 0 }, "middle": { "attempts": 0, "completions": 0, "yards": 0 }, "right": { "attempts": 1, "completions": 0, "yards": 0 } },
            "deep":   { "left": { "attempts": 2, "completions": 2, "yards": 37 }, "middle": { "attempts": 2, "completions": 1, "yards": 79 }, "right": { "attempts": 2, "completions": 2, "yards": 63 } }
          }
        }
      ],
      "receiving": [
        {
          "player_key": "name:rembert,nate",
          "name": "Rembert,Nate",
          "targets": 7,
          "receptions": 4,
          "yards": 107,
          "direction_breakdown": {
            "short": { "left": { "targets": 1, "receptions": 1, "yards": 4 }, "middle": { "targets": 0, "receptions": 0, "yards": 0 }, "right": { "targets": 1, "receptions": 1, "yards": 2 } },
            "medium": { "left": { "targets": 0, "receptions": 0, "yards": 0 }, "middle": { "targets": 1, "receptions": 0, "yards": 0 }, "right": { "targets": 0, "receptions": 0, "yards": 0 } },
            "deep":   { "left": { "targets": 0, "receptions": 0, "yards": 0 }, "middle": { "targets": 2, "receptions": 1, "yards": 79 }, "right": { "targets": 2, "receptions": 1, "yards": 22 } }
          }
        }
      ]
    }
  }
}
```

**Validation rules:**
- Every passer with `attempts > 0` must have a `direction_breakdown`
- Every receiver with `targets > 0` must have a `direction_breakdown`
- Direction must be one of: `left`, `middle`, `right`
- Depth must be one of: `short`, `medium`, `deep`
- If direction cannot be determined from play data, use `middle` as default and emit a `data_quality.warnings[]` entry
- The frontend should **never** parse `raw_text` to derive structured data

---

## P0 - Game W15pvamujsu JSON Payload Mismatch & Broken Data

**Discovered on:** 2026-05-25  
**Page:** `/game/W15pvamujsu` Game Page  
**Target JSON File:** `public/data/1-game center/games/2025/W15pvamujsu.json`

### What We Saw

Upon restoring the standard, fully-expanded side-by-side Passing Production view on desktop, we observed that the raw data in the JSON file loaded for this game (`W15pvamujsu.json`) is severely broken:
1. **Broken Down-Type Splits**: In both the PVAMU and JSU passing tables, the `Standard` and `Passing` rows are completely zeroed out (`0 CMP`, `0 ATT`, `0 YDS`, `0% CMP%`, `0 INT`, `0.0 YPA`). This is because the raw play-by-play action tree is either missing or lacks standard/passing down classification attributes.
2. **Corrupted Aggregate Team Totals**: For JSU Passing, the player sum is 8/15 CMP/ATT and 187 yards. However, the aggregate header shows `1 CMP`, `2 ATT`, `0 YDS` (`50.0% CMP%`). This is caused by a corrupted `"TEAM"` row in the raw passing array of the database export, which overrides the player sum due to frontend fallback logic.
3. **Empty 3x3 Directional Maps**: All cells in the 3x3 passing grid for both teams display as `0/0 0y` because the pipeline does not pre-compute `direction_breakdown` for players, and the raw text parser has nothing to scan.

### Pipeline Fix Needed

- We need a **proper fetch and database re-export for this game file**. The pipeline must parse and enrich `W15pvamujsu.json` with the correct canonical splits, accurate player-summed aggregate records, and pre-computed `direction_breakdown` fields for both passers and receivers.


---

## P2 - Contextual Stat Grading System — League & Team Season Averages

**Discovered on:** 2026-05-25  
**Page:** `/game/:gameId` Box Score tab — Rushing Production module  
**Component:** `QGameBoxScore.Rushing` → `DefensiveImpactPills`  
**Files:** `src/components/organisms/test/QGameBoxScore.js`, `src/utils/rushingGrades.js`

### What We Saw

The `DefensiveImpactPills` component renders 6 defensive-impact cards per team showing how the opposing defense performed against the run. Each pill needs:
- A **grade** (A-F) computed from the game value vs the **league average**
- Two **directional arrows** comparing the game value vs the team's own **offensive season average** and the opponent's **defensive season average**

Currently:
- `LEAGUE_AVG_RUSHING` in `src/utils/rushingGrades.js` is **hardcoded placeholder constants**
- `offenseSeasonAvg` and `defenseSeasonAvg` in `buildRushingData()` are **hardcoded `null`**
- Arrows show "—" (no data) because baselines are null
- Grades use static thresholds instead of real season-relative benchmarks

### Required Pipeline Output Files

The frontend will fetch three JSON files per season. These must be generated by the data pipeline and placed in `public/data/0-data/`.

#### 1. `league_avg_{season}.json` — League-wide season averages

```json
{
  "season": 2025,
  "generated_at": "2026-05-25T00:00:00Z",
  "rushing": {
    "stopRate": 0.30,
    "stuffRate": 0.18,
    "tflRate": 0.05,
    "powerStopRate": 0.40,
    "successRate": 0.42,
    "opportunityRate": 0.45
  },
  "passing": {
    "pressureRate": 0.15,
    "explosiveRate": 0.12,
    "completionRate": 0.58,
    "ypa": 7.2
  }
}
```

**How to compute:** Aggregate all `advanced_team` entries across every game for the season. Average each rate metric. `power_stop_rate` is computed as `stopped_run_rate * 0.8` when null in the source game JSON.

**Metrics needed for rushing:**
| JSON key | Source field |
|---|---|
| `stopRate` | `advanced_team.{teamId}.stopped_run_rate` |
| `stuffRate` | `advanced_team.{teamId}.stuff_rate` |
| `tflRate` | `advanced_team.{teamId}.tfl_rate_forced` |
| `powerStopRate` | `stopped_run_rate * 0.8` (computed) |
| `successRate` | `advanced_team.{teamId}.success_rate` |
| `opportunityRate` | `advanced_team.{teamId}.rush_opportunity_rate` |

#### 2. `team_season_avg_{season}.json` — Per-team offensive season averages

```json
{
  "season": 2025,
  "teams": {
    "swacjsu": {
      "rushing": {
        "stopRate": 0.25,
        "stuffRate": 0.15,
        "tflRate": 0.03,
        "powerStopRate": 0.35,
        "successRate": 0.48,
        "opportunityRate": 0.50
      },
      "passing": { "...": "..." }
    }
  }
}
```

**How to compute:** For each team, collect all their `advanced_team` entries from games where they were on **offense** (their own `advanced_team` block), average each metric. Apply `power_stop_rate = stopped_run_rate * 0.8` at the game level before aggregation.

#### 3. `team_defense_avg_{season}.json` — Per-team defensive season averages

```json
{
  "season": 2025,
  "teams": {
    "swacjsu": {
      "rushing": {
        "stopRate": 0.28,
        "stuffRate": 0.20,
        "tflRate": 0.06,
        "powerStopRate": 0.42,
        "successRate": 0.38,
        "opportunityRate": 0.40
      },
      "passing": { "...": "..." }
    }
  }
}
```

**How to compute:** For each team, collect all `advanced_team` entries from games where they were on **defense** (i.e., their opponent's `advanced_team` block), average each metric. Apply `power_stop_rate = stopped_run_rate * 0.8` at the game level before aggregation.

### Team ID Coverage

All 18 programs must be present:
- **SWAC (12):** swacalc, swacaamu, swacasu, swacbcu, swacfamu, swacjsu, swacmvsu, swacpvamu, swacsu, swactsu, swacuapb, swacgsu
- **MEAC (6):** meacdsu, meachu, meacmsu, meacnccu, meacnsu, meacscsu

### Frontend Fetch Contract

The frontend will add these hooks to `src/hooks/useSWACData.js`:

```js
export const useLeagueAverages = (season = 2025) => useQuery({
  queryKey: ["league-avg", season],
  queryFn: fetcher(`/data/0-data/league_avg_${season}.json`),
  staleTime: Infinity,
});

export const useTeamSeasonAvg = (teamId, season = 2025) => useQuery({
  queryKey: ["team-season-avg", teamId, season],
  queryFn: fetcher(`/data/0-data/team_season_avg_${season}.json`),
  staleTime: Infinity,
});

export const useTeamDefenseAvg = (teamId, season = 2025) => useQuery({
  queryKey: ["team-defense-avg", teamId, season],
  queryFn: fetcher(`/data/0-data/team_defense_avg_${season}.json`),
  staleTime: Infinity,
});
```

These will be consumed by `buildRushingData(game, teamId, leagueAvg, teamSeasonAvg, teamDefenseAvg)` in `QGameBoxScore.js` to populate the `defenseImpact` pills with real grades and arrows.

### Extensibility

The JSON shape must support future categories as sibling keys to `"rushing"` and `"passing"`:
- `specialTeams` — FG%, punt avg, kickoff touchback %
- `margins` — points per game, yards per play, turnover margin

### Validation Rules

- [ ] All 6 rushing metrics present in every file
- [ ] All 18 teams present in `team_season_avg` and `team_defense_avg`
- [ ] Values are floats 0–1 (rates, not percentages)
- [ ] `power_stop_rate` computed from `stopped_run_rate * 0.8` when null
- [ ] `generated_at` ISO timestamp for cache-busting
- [ ] Build script is reproducible (re-runnable after new games added)


---



