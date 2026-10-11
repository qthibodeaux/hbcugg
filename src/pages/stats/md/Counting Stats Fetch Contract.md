# Counting Stats — Fetch Contract

**Pages:** `/stats/team` (Team Stats) · `/stats/player` (Player Stats)
**Date:** 2026-10-04 · **Status:** OPEN · supersedes the 2026-09-21 version of this file
**Cadence:** current season rebuilt **weekly**, after the week's games are processed (same run that advances `shared/football_current_context.json`). Past seasons built once and frozen.
**Seasons:** 2019, 2021, 2022, 2023, 2024, 2025, **2026**. 2020 does not exist.

The conference sites' season counting-stat tables (Sidearm "Team Stats" and "Individual"), on the 18-program universe: totals and per-game averages only.

### Files

All under `93-FE Docs/stats/counting/`.

| # | File | Page |
|---|---|---|
| 1 | `index.json` | both — season list + current season |
| 2 | `team_{season}.json` | `/stats/team` |
| 3 | `player_{season}.json` | `/stats/player` |
| 4 | `penalties_{season}.json` | `/stats/team` → Penalties tab |

The Team Analytics Profile tab reads files 2 and 3 as well ([Team Analytics Fetch Contract](../../analytics/md/Team%20Analytics%20Fetch%20Contract.md) §8).

### Rules

1. `team_id` is the v5 id (`swacjsu`).
2. `null` means "not available" and renders as `—`; `0` means zero.
3. A rate ships with its count.
4. Every file carries `season`, `generated_at` (ISO-8601) and `games_through` (`null` for a finished season). `games_through` agrees with `football_current_context.json`.
5. All 18 teams in every team file, even with zero games played.

---

## 0. Index

### Request

```text
GET stats/counting/index.json
```

### Response

```text
{
  generated_at: ISO-8601
  current_season: integer                  // 2026
  seasons: []integer                       // ascending
  files: { <season>: { team: boolean, player: boolean, penalties: boolean, games_through: integer | null } }
}
```

---

## 1. Team Stats

### Request

```text
GET stats/counting/team_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  games_through: { week: integer, label: string } | null   // "Week 5"

  teams: []{
    team_id: string                                      // v5 id
    name: string
    short: string
    conference: "SWAC" | "MEAC"
    division: string | null
    games: integer                                       // games played (G)

    offense: SIDE                                        // this team's own
    defense: SIDE                                        // what this team allowed — same shape, opponent's offense
  }
}

SIDE = {
  scoring:     { td, fg, xpt, two_pt, def_xp, saf, pts, avg_g }
  totals:      { rush, pass, plays, yds, avg_p, td, avg_g }
  rushing:     { att, yds, avg, td, long, avg_g }
  passing:     { att, cmp, int, pct, yds, avg_a, td, long, avg_g }
  returns: {
    pr:        { no, yds, avg, td, long }
    kr:        { no, yds, avg, td, long }
  }
  kicking: {
    punting:   { no, yds, avg, long, tb, fc, i20, blk }
    fg:        { fgm, fga, pct, long, blk, pat_made, pat_att }
  }
  defense:     { ua, a, tot, tfl, sacks, int, brup, qbh, fr, ff, blk, saf }
  conversions: {
    third:     { att, conv, pct }
    fourth:    { att, conv, pct }
    red_zone:  { att, scores, td, fg, pct }
  }
  misc:        { first_downs, fd_rush, fd_pass, fd_pen, fum, fum_lost, pen, pen_yds, top_avg }
}
```

| Field | Rule |
|---|---|
| `avg_g` / `avg_p` / `avg` / `avg_a` | One decimal, computed by the backend; the frontend never divides |
| `pct` | Fraction `0.xxx` (three decimals); the frontend prints `xx.x`. `null` when the denominator is 0 |
| `long` | Integer yards; `null` when no attempt |
| `sacks` | May be `x.5` (shared sacks) |
| `top_avg` | Seconds per game, integer; the frontend formats `mm:ss` |
| `defense` on `defense` side | The tackle line this team's *opponents* recorded — ships for symmetry; the page renders it |
| `def_xp` | Defensive two-point conversions (returned tries) |

---

## 2. Player Stats

### Request

```text
GET stats/counting/player_{season}.json
```

Every player with at least one stat line in any block; players with no lines are omitted.

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  games_through: { week: integer, label: string } | null
  floors: { <block>: { <field>: number } }              // rank eligibility, e.g. { rushing: { att: 10 } }

  players: []{
    person_id: string                                    // PERS_ id — the player page route
    name: string                                         // crew form "Renfro,Athean"
    display_name: string                                 // "Athean Renfro"
    team_id: string                                      // v5 id
    position: string
    jersey: integer | null
    class_year: string | null                            // "Jr.", "Gr."
    image_url: string | null
    games: integer

    rushing:       { att, yds, avg, td, long, avg_g } | null
    passing:       { att, cmp, int, pct, yds, td, long, effic, avg_g } | null
    receiving:     { rec, yds, td, long, avg_c, rec_g, avg_g } | null
    scoring:       { td, fg, pat, two_pt, pts, avg_g } | null
    returns: {
      pr:          { no, yds, avg, td, long } | null
      kr:          { no, yds, avg, td, long } | null
    } | null
    total_offense: { rush, pass, plays, total, yds_g } | null
    all_purpose:   { rush, rcv, pr, kr, yds, yds_g } | null
    punting:       { no, yds, avg, long, tb, fc, i20, fifty_plus, blk } | null
    fgs:           { fgm, fga, pct, r0_19, r20_29, r30_39, r40_49, r50, long, blk } | null
    defense: {
      ua, a, tot, tot_g,
      tfl, tfl_yds, tfl_g,
      sacks, sack_yds, sacks_g,
      int, int_yds, int_td, int_long,
      ff, fr, fr_yds, fr_td,
      brup, pd, qbh, blk, saf
    } | null
  }
}
```

| Field | Rule |
|---|---|
| A block is `null` when the player has no line in it | The frontend filters on the block, never on position |
| `fgs.r0_19` … `r50` | Made-attempted strings `"1-2"`, as the source prints them |
| `effic` | NCAA passing efficiency, one decimal |
| `pd` | Passes defended = `brup + int` |
| `tot_g` / `tfl_g` / `sacks_g` | Per game, backend-computed |
| Rows | Every player ships; `floors` decides who ranks |

### `floors` — expected values

| Table | Floor |
|---|---|
| Rushing | 10 att |
| Passing | 15 att |
| Receiving | 5 rec |
| Scoring | 6 pts |
| Punt / kick returns | 3 returns |
| Total offense | 15 plays |
| All purpose | 50 yds |
| Punting | 5 punts |
| FGs | 1 attempt |
| Tackles | 5 total |
| TFL / sacks | 1 TFL / 0.5 sack |
| Interceptions / fumbles | 1 |
| Pass defense | 1 PD |

---

## 3. Penalty matrix — every foul, every team

Page: `/stats/team?tab=penalties`. A foul × team matrix: every foul down the side,
18 teams across, one cell per pair, filterable by phase and by side of the ball.
The by-side totals also feed the Team Analytics **Discipline** scatter.

### Request

```text
GET stats/counting/penalties_{season}.json
```

### Response

```text
{
  season: integer
  generated_at: ISO-8601
  games_through: { week: integer, label: string } | null

  fouls: []{                               // the league's vocabulary, once
    key: string                            // stable snake_case id
    label: string                          // "Illegal block in the back"
    phase: "pre" | "live" | "dead"         // pre-snap, live ball, dead ball
    league_total: integer
  }

  teams: []{
    team_id: string                        // v5 id
    games: integer
    total_flags: integer                   // accepted + declined + offsetting
    accepted: integer
    total_yards: integer                   // accepted penalty yards
    counts: { <foul key>: integer }        // every foul key, 0 where none
    by_side: {                             // who committed it: this team's offense, defense, or kicking units
      offense:       SIDE_PENALTIES
      defense:       SIDE_PENALTIES
      special_teams: SIDE_PENALTIES
    }
  }
}
```

SIDE_PENALTIES = {
  flags: integer
  accepted: integer
  yards: integer                           // accepted yards
  flags_per_game: float
  yards_per_game: float
  counts: { <foul key>: integer }
}

| Field | Rule |
|---|---|
| `by_side` | `offense + defense + special_teams` sums to the team totals, field by field |
| Foul vocabulary | Backend owns it. One entry per real foul, spelling variants already merged. The frontend renders whatever `fouls` contains and never renames or merges anything |
| `counts` | Every key in `fouls`, including zeros — an absent key and a zero must not be ambiguous |
| Unmapped flags | If a penalty cannot be classified, ship it under a single `"unknown"` foul key rather than dropping it, so `sum(counts) === total_flags` holds and the page can say how much is unattributed |
| What counts | Every flag thrown on the team, declined and offsetting included — not just accepted. `penalty_advanced.total_accepted` is a narrower number and the two will not match |
| `phase` | Drives the pre-snap / live-ball / dead-ball filter. Backend's call on the boundary cases |

---

## 4. Index of asks

| # | Ask | File | Page |
|---|---|---|---|
| 1 | Season index | `index.json` | both |
| 2 | Team counting stats, both sides, 7 seasons, 2026 weekly | `team_{season}.json` | `/stats/team`, Team Analytics Profile |
| 3 | Player counting stats, with `floors`, `class_year`, `image_url` | `player_{season}.json` | `/stats/player`, Team Analytics Profile |
| 4 | Penalty matrix: every foul, every team, normalised vocabulary | `penalties_{season}.json` | `/stats/team` Penalties tab |

---

*Last updated: 2026-10-04*
