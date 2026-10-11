# Game Page Fetch Contract

**Last updated:** 2026-09-14
**Scope:** `/game/:gameId` — every tab: Summary, Production, Data Room, Play by Play
**Companions:** [Game Page Design Doc.md](./Game%20Page%20Design%20Doc.md) (layouts, component contracts) · [Game Page Production Contract.md](./Game%20Page%20Production%20Contract.md) (non-negotiables, worked examples) · [DATA_ROOM_SPEC.md](../../../components/game/page/teamstats/DATA_ROOM_SPEC.md) (Data Room, row by row)

Request path and response **schema** per tab. The page makes one game request; every tab reads its blocks off that one payload.

**These are type contracts, not example payloads.** Field names and types only. The backend decides the values; this document fixes the keys, their types, which are nullable, and which tab reads them.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. `{ [team_id]: T }` — keyed by v5 team id (`swacfamu`, `meachu`), one entry per side. `{ [player_key]: T }` — keyed by `PERS_` id. `"a" | "b"` — exactly one of these literals.

---

## Request

**Route:** `/game/:gameId`

```text
1. GET /data/93-FE Docs/game-center/games/index.json
2. Match gameId -> { season, game_stem }      // on game_stem (lowercase) OR game_id (uppercase)
3. GET /data/93-FE Docs/game-center/games/{season}/{game_stem}.json
```

Alongside it, identity only — headshots, positions, jersey numbers. No stat on the page comes from it:

```text
GET /data/3-players/player_seasons_{season}.json    // season = the game's season
```

| Query key | Scope |
|---|---|
| `["game", gameId]` | the game payload |
| `["player-seasons", season]` | roster identity for the game's season |

**`index.json`**
```text
[]{
  game_stem: string                           // the file stem and the URL segment — "scsufamu26"
  game_id: string                             // uppercase, date-suffixed — "SCSUFAMU06092026"
  season: integer
  date: string (ISO date)
  home_team_id: string (v5 id)
  away_team_id: string (v5 id)
  home_score: integer
  away_score: integer
  site: string
}
```

| Field | Rule |
|---|---|
| `game_stem` | **The one field with no room for a different convention.** It is the file stem, the `game_path_id` every other page links on, and the URL |
| Missing stem | No page. Inbound surfaces check `game_path_id` before rendering a link |

---

## Envelope

```text
{
  game_id: string
  game_path_id: string
  route: string                               // "/game/{game_path_id}"
  season: integer
  week: integer
  status: "final" | "preview"
  status_label: string
  date: string (ISO date)
  date_label: string
  kickoff_label: string

  away_team: {
    team_id: string (v5 id)
    name: string
    short_name: string
    score: integer
    record: string                            // point-in-time, entering or after this game
    conference_record: string
    winner: boolean
  }
  home_team: { same shape as away_team }
  winner_team_id: string | null               // null on previews

  metadata: {
    site: string
    attendance: integer | null
    weather: string | null
    temperature: number | null
    officials: { [role]: string }             // "Referee", "Umpire", "Line Judge", …
  }

  venue: {
    stadium: string                           // "Simmons Bank Liberty Stadium"
    sponsor: string | null                    // the naming sponsor when the name carries one, else null
    city: string                              // "Memphis, Tennessee"
    neutral_site: boolean
    site: string                              // legacy composed string, still sent
  }
  event: {                                    // null when the game is just a game
    kind: "classic" | "homecoming" | "championship" | "bowl" | "challenge" | "theme"
    name: string                              // "Southern Heritage Classic", "Homecoming"
  } | null

  scoring_summary:    []{ … }                 // Summary
  team_box:           { [team_id]: { … } }    // Summary · Data Room
  advanced_team:      { [team_id]: { … } }    // Summary · Production · Data Room
  advanced_basics:    { … }                   // Summary
  game_leaders:       { … }                   // Summary
  notable_performers: []{ … }                 // Summary
  win_probability:    { … }                   // Summary
  epa_timeline:       { [team_id]: []{ … } }  // Summary
  individual_stats:   { [team_id]: { … } }    // Production
  production_scores:  { [team_id]: []{ … } }  // Production
  special_teams_advanced: { [team_id]: { … } }     // Production — SHIPPED, see Special Teams
  team_production:    { [team_id]: { … } }    // Production — OPEN
  data_room:          { [team_id]: { … } }    // Data Room
  drive_summary:      []{ … }                 // Play by Play · Summary
  play_by_play:       []{ … }                 // Play by Play · Summary
}
```

| Field | Rule |
|---|---|
| `away_team` / `home_team` | Both always populated with `team_id`. Every per-team block below is keyed on those two ids |
| `winner_team_id` | Sent, never inferred from scores |
| Team identity | Only `team_id` is required — logo and colors join locally |
| `venue.sponsor` / `event` | The banner renders each as its own line under the date and omits the line when null. It does not split a sponsor out of `stadium` or infer a classic from the matchup |

---

## Summary

**Response**
```text
scoring_summary: []{                          // in game order
  period: integer
  team_id: string (v5 id)
  points: integer
  clock: string
  play_type: "TOUCHDOWN" | "FIELD_GOAL" | "PAT" | "TWO_POINT" | "SAFETY"
  description: string
}

team_box: { [team_id]: {
  pass_attempts: integer
  pass_completions: integer
  pass_completion_pct: number
  pass_yards: integer
  pass_touchdowns: integer
  interceptions_thrown: integer
  yards_per_pass_attempt: number
  sacks_allowed: integer
  rush_attempts: integer
  rush_yards: integer
  rush_touchdowns: integer
  yards_per_carry: number
  total_yards: integer
  plays_offense: integer
  drives_offense: integer
  points_scored: integer
  points_per_drive: number
  turnovers_committed: integer
  turnovers_forced: integer
  turnover_margin: integer                    // direct field — the frontend does not subtract
  sacks_made: integer
  third_down_attempts: integer
  third_down_conversions: integer
  third_down_conversion_rate: number
  third_down_avg_distance: number
  fourth_down_goes: integer
  fourth_down_go_conversions: integer
  fourth_down_go_conversion_rate: number | null   // null at 0 goes
  avg_start_field_position: number
  long_field_drives: integer
  long_field_rate: number
  time_of_possession_seconds: integer
}}

advanced_team: { [team_id]: {
  epa_total: number
  epa_per_play: number
  wpa_total: number
  success_rate: number                        // one definition — down-and-distance
  eligible_scrimmage_plays: integer
  explosive_rate: number
  success_rate_standard_down: number
  success_rate_passing_down: number
  success_rate_early_down: number
  success_rate_late_down: number
  success_rate_middle_8: number
  success_rate_goal_to_go: number | null
  success_rate_two_minute: number | null
  garbage_time_play_share: number
  competitive_epa_total: number
  competitive_epa_per_play: number
  expected_turnovers: number
  actual_turnovers: integer
  turnover_luck: number
  quality_drive_rate: number
  explosive_drive_rate: number
  negative_drive_rate: number
  points_per_quality_drive: number
  red_zone_opportunities: integer
  red_zone_points_per_opportunity: number | null
  red_zone_td_rate: number | null
  opportunities_40: integer
  points_per_opportunity_40: number
  havoc_rate_forced: number
  havoc_rate_allowed: number
  tfl_rate_forced: number
  sack_rate_forced: number
  pass_defended_rate_forced: number
  line_yards_per_rush: number
  highlight_yards_per_rush: number
  rush_opportunity_rate: number
  stuff_rate: number
  stopped_run_rate: number
  power_run_attempts: integer
  power_run_success_rate: number | null
}}

advanced_basics: {
  blocks: []{                                 // "Drives" | "Turnovers" | "Per Drive" | "SR By Qtr" | "Success Rt", in display order
    label: string
    metrics: []{ key: string, label: string, away: number | null, home: number | null }
  }
}

game_leaders: {
  passing:   []{ player_key: string, name: string, team_id: string (v5 id), position: string, yards: integer, touchdowns: integer, interceptions: integer }
  rushing:   []{ player_key, name, team_id, position, carries: integer, yards: integer, touchdowns: integer }
  receiving: []{ player_key, name, team_id, position, receptions: integer, yards: integer, touchdowns: integer }
  tackles:   []{ player_key, name, team_id, position, tackles: number, solo_tackles: integer, assisted_tackles: integer }
  havoc:     []{ player_key, name, team_id, position, havoc: number, tfl: number, passes_defended: integer, interceptions: integer }
}

notable_performers: []{                       // pre-ranked, in display order
  player_key: string
  name: string
  team_id: string (v5 id)
  position: string
  production_total: number
  chips: []{ label: string, value: number | string }
}

win_probability: {
  away: number (0-1)
  home: number (0-1)
  winner_team_id: string
  final_label: string
}

epa_timeline: { [team_id]: []{              // that team's scrimmage plays, in game order
  play_number: integer                        // 1..N within this team's own offensive plays
  play_id: string                             // joins play_by_play[].play_id
  quarter: integer
  epa: number                                 // this play
  cumulative_epa: number                      // running total through this play
} }
```

| Field | Rule |
|---|---|
| `advanced_basics.blocks[]` | The Advanced Basics card renders these blocks in this order with these labels. The frontend does not compute a row |
| `game_leaders.*` | Each list pre-sorted, both teams mixed. The card takes the top entries |
| `notable_performers[]` | Pre-ranked. `chips[]` is the card's chip row — the backend decides a QB's chips vs a LB's |
| `turnover_margin` | Direct field |
| `success_rate` | One definition. Not two fields with different denominators |
| `time_of_possession_seconds` | Integer seconds per team; the frontend formats `mm:ss` |
| `epa_timeline` | One series per team, offense plays only, `cumulative_epa` already summed. The Game Flow card plots it as-is against `play_number`; it does not sum `play_by_play[].epa` itself |
| `power_run_*` | Required numbers; currently null |

---

## Production

Three built units — Passing, Rushing, Defense — and two open. Every unit is the same block: team table · player spotlight · roster with a Production Score column. Layout in [Design Doc §5.9](./Game%20Page%20Design%20Doc.md).

### `production_scores` — read by every unit

**Response**
```text
production_scores: { [team_id]: []{
  player_key: string                          // the join key to individual_stats rows
  name: string
  position: string
  production_total: number
  components: {                               // only the axes this player has; absent = 0
    passing_production: number
    receiving_production: number
    rushing_production: number
    turnover_production: number               // offensive turnover axis
    hit_production: number
    hawk_production: number
    scrum_production: number
    special_teams_production: number
  }
}}
```

| Field | Rule |
|---|---|
| `player_key` | Must equal the `player_key` on the same player's `individual_stats` row. The frontend joins on it and nothing else |
| `components` | Three PAR axes, each an offensive/defensive pair sharing a track: Passing/Hit · Rushing/Hawk · Turnover/Scrum. A player is one side of a pair |
| `turnover_production` | Required on offensive players. Currently absent, so an offensive bar has two segments where a defender has three |
| `special_teams_production` | Still absent on all 392 games. See Special Teams, ask 8 |
| Sort | Rosters sort by `production_total` desc |

### Passing

**Response**
```text
individual_stats: { [team_id]: {
  passing: []{
    player_key: string
    name: string
    attempts: integer
    completions: integer
    completion_pct: number
    yards: integer
    touchdowns: integer
    interceptions: integer
    sacks_taken: integer
    sack_yards_lost: integer
    yards_per_attempt: number                 // SP+ definition: sack yards off the top, sacks count as attempts
    hurries_faced: integer
    fumbles: integer
    direction_breakdown: {                    // the spotlight's target-zone chart
      [zone]: { targets: integer, completions: integer, yards: integer }
    }
  }
  receiving: []{
    player_key: string
    name: string
    targets: integer
    receptions: integer
    catch_rate: number | null                 // null at 0 targets
    yards: integer
    touchdowns: integer
    fumbles: integer
    yards_per_reception: number | null
    yards_per_target: number | null
    deep_targets: integer
    deep_receptions: integer
    direction_breakdown: { same shape }
  }
}}
```

| Field | Rule |
|---|---|
| Team table | Total / Standard Downs / Passing Downs rows from `team_box` + `advanced_team` |
| `yards_per_attempt` | SP+ definition, backend-computed. The frontend prints it |

### Rushing

**Response**
```text
individual_stats: { [team_id]: {
  rushing: []{
    player_key: string
    name: string
    attempts: integer
    yards: integer
    touchdowns: integer
    fumbles: integer
    yards_per_carry: number
    long: integer
    direction_breakdown: {                    // the spotlight's lane chart
      left:   { attempts: integer, yards: integer, success_rate: number }
      middle: { same }
      right:  { same }
    }
  }
}}

rushing_splits: { [team_id]: {                // team table rows
  total:          { attempts: integer, yards: integer, yards_per_carry: number, success_rate: number, line_yards_per_rush: number, highlight_yards_per_rush: number, stuff_rate: number }
  standard_downs: { same shape }
  passing_downs:  { same shape }
}}
```

| Field | Rule |
|---|---|
| `long` | Required integer; currently null on every row |
| `direction_breakdown` | Exactly three lanes. A lane with 0 attempts still ships with zeros |
| `rushing_splits` | Direct rows. The frontend does not build Standard/Passing down rows from plays |

### Defense

**Response**
```text
individual_stats: { [team_id]: {
  defense: []{
    player_key: string
    name: string
    tackles: number                           // half-credits — 2.5 is real
    solo_tackles: integer
    assisted_tackles: integer
    sacks: number
    tfl: number
    qb_hurries: integer
    interceptions: integer
    passes_defended: integer
    forced_fumbles: integer
    fumble_recoveries: integer
    havoc: number                             // tfl + sacks + forced_fumbles + passes_defended + interceptions
    clutch_stops: integer
    red_zone_disruptions: integer
    turnovers_created: integer
    third_down_havoc: integer
  }
}}

havoc_plays: { [team_id]: []{                 // the spotlight's spatial chart
  play_id: string
  player_key: string
  category: "TFL" | "SACK" | "PBU" | "INT" | "FF"
  yardline_absolute: integer                  // 0 = offense's own goal line, 100 = opponent's
  quarter: integer
}}
```

| Field | Rule |
|---|---|
| The five detail fields | `solo_tackles`, `assisted_tackles`, `qb_hurries`, `passes_defended`, `forced_fumbles` are required on every season. Without them Havoc cannot print |
| `havoc` | Direct field per player |
| `clutch_stops` … `third_down_havoc` | Required; currently absent on every row |
| `havoc_plays` | One entry per havoc event with its location. Without it the spotlight chart is a labeled concept |
| Roster filter | Contributors only: `tackles >= 2` or any TFL / sack / INT / PD / FF |

### Sack Yardage — OPEN, 2026-09-28

**The change we are reading.** Sacks are now their own category: `team_box.rush_yards`
no longer carries sack losses. Verified across all 784 team-games in the export —
`rush_yards` equals the sum of the individual rushing rows exactly, and
`total_yards` equals `pass_yards + rush_yards` exactly. So sack yardage is in
neither total. This is the right call and the page has been updated for it.

**The gap.** `team_box` ships the sack **counts** — `sacks_allowed` and
`sacks_made` — and no yardage. The only sack yardage anywhere in the export is
`individual_stats.passing[].sack_yards_lost`, per passer. Until a team-level
field exists the frontend sums the passing rows, and sums the **opponent's**
passing rows for what a defence took away.

That sum is safe — both teams are in one file and 625 of the 632 team-games with
a sack taken carry non-zero yardage — but it is arithmetic we should not be doing,
and it breaks the moment a team's passing rows are incomplete.

**Ask.** Two fields on `team_box`, beside the counts already there:

```text
team_box[team_id]: {
  sacks_allowed: integer                   // already ships
  sack_yards_lost: integer                 // NEW — yards this team lost to sacks
  sacks_made: number                       // already ships (halves are real)
  sack_yards_forced: integer               // NEW — yards this team's defence took away
}
```

| Field | Rule |
|---|---|
| Sign | Positive yardage in both cases — a loss of 15 ships as `15`, not `-15`. The frontend applies the sign |
| `sack_yards_forced` | Must equal the opponent's `sack_yards_lost` in the same file |
| Zero vs null | `0` when there were sacks for no yardage; `null` only when the phase was not parsed. 7 of 632 team-games currently have sacks taken with no yardage recorded — confirm whether those are genuine 0-yard sacks or a parsing gap |
| Rushing | Leave `rush_yards` as it is. The clean figure is the useful one; the page derives the conference-convention number from it and the sack yardage |

**Season surfaces.** The same split has to reach the season exports
(`counting_team_stats_{season}.json`, the team analytics blocks) or a team's
season rushing total will disagree with the sum of its game pages. That
realignment is a separate piece of work and is not being asked for in this batch.

### Special Teams — RECONCILED 2026-09-27

**Status change.** This section previously asked for a `special_teams_production`
block and said a counter-shape was an acceptable answer. **A counter-shape
shipped**: `special_teams_advanced`, and it is better than what was asked for.
It is on **392 of 392 game files**, every season 2019–2025. This section is now
the reconciliation — what is accepted, what needs correcting, and what is still
missing — rather than a request.

Read this first if nothing else:

| | Block | Games |
|---|---|---|
| Accepted, becomes the source | `special_teams_advanced` | **392 / 392** |
| Legacy, being dropped | `special_teams_production` | 60 / 392 |
| Legacy, still the ONLY per-player ST data | `special_teams_individual` | 60 / 392 |
| Ships empty | `hidden_yardage` (all six fields `null`) | 392 / 392 |
| Never shipped | `production_scores.components.special_teams_production` | 0 / 392 |

The two legacy blocks exist for **0** games in 2019, 2021 and 2023, **1** in
2022, 30 in 2024 and 29 in 2025. The panel was built on them, which is why it is
blank or thin on 332 of 392 games. That is the frontend's error to fix, not the
backend's — noted here so the history is not lost.

#### 1. Accepted as shipped — do not change these

`special_teams_advanced[team_id]` carries these groups per team. All present and
populated on every file checked:

```text
summary:          st_swing_yards · penalty_yards_cost · st_play_count
                  penalty_by_unit { kickoff, punt, field_goal, pat }
kickoff_offense:  attempts · touchback_rate · out_of_bounds_count
                  avg_start_allowed · espa · avg_net_yards
                  onside_attempts · onside_recovery_rate
kickoff_defense:  attempts · return_rate · avg_return_yards · explosives
                  turnovers_forced · touchdowns · avg_net_yards_allowed
                  onside_attempts · onside_recovery_rate
punt_offense:     attempts · avg_gross_yards · avg_net_yards
                  inside_20_rate · inside_10_rate · block_rate
                  fair_catch_rate · downed_count
punt_defense:     attempts · return_rate · avg_return_yards · avg_net_yards
                  nyoe · muffs_recovered · blocks
fg_offense:       attempts · made · pct · long · blocked
                  clutch_attempts · clutch_made · clutch_pct
                  by_range { u30, 30_39, 40_49, 50p } each { att, made, pct }
                  kicker_talent_trust_range · coach_aggression_threshold
fg_defense:       attempts_against · made_against · blocks
pat_offense:      attempts · made · pct · blocked · clutch_attempts/made/pct
pat_defense:      attempts_against · made_against · blocks
hidden_penalty_yards
```

Three things in here are better than what was originally asked for and should be
kept: **`by_range` on the standard u30 / 30-39 / 40-49 / 50+ boundaries** (the
contract had asked for u15 / 15-30 / 30-45 / o45 — the backend's buckets are the
ones the sport actually uses, so the contract is amended to theirs); the
**clutch** split on both FG and PAT; and
**`kicker_talent_trust_range` against `coach_aggression_threshold`**, which is
the only field in the export that describes a coaching decision rather than an
outcome.

#### 2. Naming — confirm, because it reads backwards

In this block **`_defense` means "the phase when the opponent executes it"**, so
`kickoff_defense` is **our kick-return unit**, not our coverage unit. Verified on
`W0hufamu`: FAMU has `kickoff_offense.attempts = 5` and
`kickoff_defense.attempts = 1`, against HU's 1 and 5 — the mirror image, and FAMU
kicked off five times.

**Ask 1.** Confirm that reading. If `kickoff_defense` is instead meant as the
coverage unit, every return number on the page is attributed to the wrong team,
and we need to know before launch rather than after.

#### 3. Corrections needed

**Ask 2 — rates ship without their counts.** House rule: *a rate never ships
without its count.* These are rates with no numerator on file, so the page can
print a percentage but never "3 of 5":

| Field | Needs |
|---|---|
| `kickoff_offense.touchback_rate` | `touchbacks` (count) |
| `punt_offense.inside_20_rate` · `inside_10_rate` | `inside_20` · `inside_10` (counts) |
| `punt_offense.fair_catch_rate` | `fair_catches` (count) |
| `punt_offense.block_rate` | `blocked` (count) |
| `kickoff_defense.return_rate` · `punt_defense.return_rate` | `returns` (count) |
| `onside_recovery_rate` | `onside_recovered` (count) |

**Ask 3 — define `espa` and `nyoe`.** Both are on all 392 files and neither is
defined anywhere. `kickoff_offense.espa` appears to be expected points added on
the kickoff phase; `punt_defense.nyoe` appears to be net yards over expected on
punt returns. One line each, and whether the sign is from our point of view.
Both go straight into the glossary — we will not publish a number whose
definition we guessed.

**Ask 4 — `punt_defense` has no explosive count.** `kickoff_defense` carries
`explosives`, `turnovers_forced` and `touchdowns`; the punt-return side carries
none of the three. Add all three to `punt_defense` for symmetry, with one
explosive threshold used for both phases, and state that threshold.

**Ask 5 — `kickoff_offense` has no gross.** Punts ship gross and net; kickoffs
ship only `avg_net_yards`. Add `avg_gross_yards` (or `avg_kick_distance`) so the
coverage unit can be told apart from the leg.

**Ask 6 — `hidden_yardage` ships empty.** All six fields — `yards_negated`,
`yards_gifted`, `net_hidden_yards`, `penalty_first_downs_against`,
`negated_first_downs`, `penalty_swing_yards` — are `null` on **all 392 games**.
`advanced_team.special_teams_hidden_yards` and `special_teams_swing_yards` carry
real numbers, so either populate `hidden_yardage` or drop the key and tell us
`advanced_team` is its home. An all-null block reads as a broken pipeline.

#### 4. Still missing — the one real gap

**Ask 7 — per-player special teams, for every game.** There is no individual
kicking, punting, returning or coverage data outside `special_teams_individual`,
which exists for 60 of 392 games. `individual_stats.returns` **is present on all
392 files and empty on all 392**. So the kicker, punter, returner and coverage
tables have nothing to draw on for 85% of the schedule, and no spotlight player.

Populate `individual_stats.returns`, and add `kicking` and `punting` beside it,
on every game:

```text
individual_stats[team_id].returns: []{
  player_key · name · type: "KO" | "PUNT"
  returns · yards · avg · long · touchdowns · muffs · fair_catches
}
individual_stats[team_id].kicking: []{
  player_key · name
  fg_made · fg_attempts · fg_long · pat_made · pat_attempts
  kickoffs · touchbacks · out_of_bounds · avg_kickoff_yards
}
individual_stats[team_id].punting: []{
  player_key · name
  punts · gross_yards · net_yards · avg_gross · avg_net
  long · inside_20 · inside_10 · touchbacks · fair_catches · blocked
}
```

Same keying as the other `individual_stats` categories, so nothing new is needed
on our side to read it.

**Ask 8 — a special-teams production component.** `production_scores.components`
carries `passing_production`, `rushing_production`, `receiving_production`,
`hit_production`, `hawk_production` and `scrum_production` — and no ST component
on any of 392 games. Without it the special-teams panel is the only production
panel with no production column. Add `special_teams_production` to `components`,
scoped the way the others are: the phase and its own turnovers, so a muffed
return charges the returner and a missed kick charges the kicker.

#### 5. Index of special-teams asks

| # | Ask | Blocks |
|---|---|---|
| 1 | Confirm `_defense` = the opponent's phase (our return unit) | Correct attribution of every return number |
| 2 | Counts alongside the eight rates | "3 of 5" instead of "60%" |
| 3 | Define `espa` and `nyoe` | Publishing either number at all |
| 4 | `explosives` / `turnovers_forced` / `touchdowns` on `punt_defense` | Punt-return symmetry with kick return |
| 5 | `avg_gross_yards` on `kickoff_offense` | Telling the leg apart from the coverage |
| 6 | Populate or drop `hidden_yardage` | The hidden-yardage card |
| 7 | Per-player returns / kicking / punting on all 392 games | All four roster tables and the spotlight |
| 8 | `special_teams_production` in `production_scores.components` | The production column on the ST panel |

### Team Production — OPEN

**What the unit needs.** Not agreed yet. The panel expects a per-team roll-up of the same axes the player bars use, so the team bar and the player bars share a domain.

**Proposed response**
```text
team_production: { [team_id]: {
  total: number
  components: {
    passing_production: number
    receiving_production: number
    rushing_production: number
    turnover_production: number
    hit_production: number
    hawk_production: number
    scrum_production: number
    special_teams_production: number
  }
  leaders: {                                  // top player per axis, for the panel's chip row
    [axis]: { player_key: string, name: string, value: number }
  }
}}
```

| Field | Rule |
|---|---|
| `total` / `components` | Backend roll-up. The frontend does not sum `production_scores` rows |
| Placement | Production tab header above Passing, or Summary beside Notable Performers — frontend decision once the shape is confirmed |

**Open:** confirm or counter this shape.

---

## Data Room

The full ledger — 13 cards of away/home rows. Row-by-row in [DATA_ROOM_SPEC.md](../../../components/game/page/teamstats/DATA_ROOM_SPEC.md); this section fixes the block.

**Response**
```text
data_room: { [team_id]: {
  epa: {
    pass_epa_total: number
    pass_epa_per_dropback: number
    rush_epa_total: number
    rush_epa_per_carry: number
    special_teams_epa: number
    penalty_epa: number
    total_game_epa: number
  }
  situational: {
    third_down_short_rate: number | null      // 1-3
    third_down_medium_rate: number | null     // 4-6
    third_down_long_rate: number | null       // 7+
    red_zone_trips: integer
    red_zone_td_rate: number | null
    goal_to_go_success_rate: number | null
  }
  explosiveness: {
    explosive_plays: integer
    explosive_pass_plays: integer
    explosive_rush_plays: integer
    longest_play_yards: integer
    explosive_rate: number
  }
  passing_splits:  { [split]: { attempts: integer, completions: integer, yards: integer, touchdowns: integer, interceptions: integer, success_rate: number, epa_per_play: number } }   // by depth, by pressure, by down type
  rushing_splits:  { [split]: { attempts: integer, yards: integer, success_rate: number, line_yards_per_rush: number, stuff_rate: number } }                                          // by down type, by direction
  drives: {
    drives: integer
    plays_per_drive: number
    yards_per_drive: number
    points_per_drive: number
    three_and_outs: integer
    scoring_drive_rate: number
    avg_start_field_position: number
    time_of_possession_seconds: integer
  }
  defense: {
    yards_per_play_allowed: number
    success_rate_allowed: number
    havoc_rate: number
    pressure_rate: number
    pressures: integer
    stuff_rate: number
    third_down_stop_rate: number | null
    fourth_down_stop_rate: number | null
    red_zone_stop_rate: number | null
    drive_stop_rate: number
  }
  turnovers: {
    committed: integer
    forced: integer
    margin: integer
    expected: number
    luck: number
    fumbles: integer
    fumbles_lost: integer
    fumble_opportunities: integer
  }
  special_teams: { same shape as special_teams_advanced[team_id], minus the per-player rows }
  penalties: {
    count: integer
    yards: integer
    first_downs_given: integer
    negated_yards: integer
    net_hidden_yards: number
    pre_snap: integer
    post_snap: integer
  }
  coaching: {
    fourth_down_go_rate: number | null
    fourth_down_go_rate_expected: number | null
    pass_rate_standard_downs: number
    pass_rate_passing_downs: number
    tempo_seconds_per_play: number
  }
  sequence: {
    after_takeaway:        { drives: integer, points: integer, epa_per_play: number }
    after_own_turnover:    { same }
    after_opponent_score:  { same }
    after_three_and_out:   { same }
    lead_changes: integer
    q4_lead_changes: integer
    max_consecutive_scoring_drives: integer
  }
}}
```

| Field | Rule |
|---|---|
| One block | The Data Room reads `data_room[team_id]` and nothing else beyond `team_box` / `advanced_team`. Everything modeled — EPA by play type, expected turnovers, tempo, sequence — arrives here as a direct number |
| Rates | 0–1. Null where the denominator is 0 |
| `special_teams` | The same shape the Production unit reads, so the two never disagree |
| Row list | Which rows each card prints, and their order, is `DATA_ROOM_SPEC.md`. That doc names the field for every row against this block |

---

## Play by Play

**Response**
```text
drive_summary: []{                            // in game order
  drive_id: string
  offense_team: string (v5 id)
  defense_team: string (v5 id)
  quarter_start: integer
  clock_start: string
  start_yardline_absolute: integer            // 0 = offense's own goal line, 100 = opponent's
  quarter_end: integer
  clock_end: string
  end_yardline_absolute: integer
  possession_obtained_by: string
  plays_total: integer
  yards_net: integer
  result: "TD" | "FG" | "Punt" | "Turnover" | "Downs" | "Missed FG" | "End of Half" | "End of Game" | "Safety"
  points: integer
}

play_by_play: []{                             // in game order; sequence is the sort key
  play_id: string
  drive_id: string                            // matches drive_summary[].drive_id
  sequence: integer
  quarter: integer
  clock: string | null
  down: integer | null                        // null on kickoffs, PATs, administrative rows
  distance: integer | null
  yardline_absolute: integer | null           // pre-snap, offense-relative
  yardline_after_absolute: integer | null
  yards_gained: integer | null
  offense_team: string (v5 id) | null
  defense_team: string (v5 id) | null
  play_type: "RUSH" | "PASS" | "SACK" | "SPIKE" | "KNEEL" | "KICKOFF" | "PUNT" | "FIELD_GOAL" | "PAT" | "TWO_POINT" | "RETURN" | "PENALTY" | "TIMEOUT" | "ADMIN"
  raw_text: string
  no_play: boolean
  first_down: boolean
  scoring_event: boolean
  scoring_type: string | null
  scoring_points: integer
  turnover: boolean
  turnover_type: string | null
  score_home_after: integer
  score_away_after: integer
  epa: { ep_pre: number | null, ep_post: number | null, epa: number | null }
  wpa: number | null
  wp_after: number | null
  garbage_time: boolean
  penalties: []{
    team_id: string (v5 id)
    text: string
    yards: integer
    declined: boolean
  }
  actions: []{                                // one per thing that happened; every action names its player
    type: "PASS" | "RUSH" | "SACK" | "SPIKE" | "KNEEL" | "KICKOFF" | "PUNT" | "FIELD_GOAL" | "PAT" | "TWO_POINT"
        | "KICKOFF_RETURN" | "PUNT_RETURN" | "INTERCEPTION" | "INTERCEPTION_RETURN" | "FUMBLE" | "FORCED_FUMBLE"
        | "FUMBLE_RETURN" | "RECOVERY" | "MUFF" | "MUFF_RETURN" | "BLOCKED_KICK" | "BLOCKED_KICK_RETURN" | "LATERAL" | "TACKLE"
    player_key: string | null
    player_name: string | null
    net_yards: integer | null
    // type-specific:
    passDepth: "short" | "intermediate" | "deep" | null
    isComplete: boolean | null
    receiver_key: string | null
    receiver_name: string | null
    pressure_detected: boolean | null
    is_tfl: boolean | null
    kick_distance: integer | null
    assisted: boolean | null                  // TACKLE
  }
}
```

| Field | Rule |
|---|---|
| `drive_id` on the play | Required. The frontend groups plays by it; it does not walk offense changes |
| `first_down` | Required boolean on every scrimmage play |
| `penalties[]` | Required, empty array when none. The frontend never parses `raw_text` for a penalty |
| `actions[].player_key` / `player_name` | Every action names its player — tackler, returner, kicker, interceptor included. The frontend never parses `raw_text` for a name. The player filter is built from these |
| `yards_gained` | Direct field |
| `epa.epa` | > +1.0 is a big play, < −0.8 is negative. Null on administrative rows |
| `wpa` / `wp_after` | Required numbers on scrimmage plays; currently null |
| `play_type` buckets | Rush = `RUSH, KNEEL` · Pass = `PASS, SACK, SPIKE` · Special Teams = `KICKOFF, PUNT, FIELD_GOAL, PAT, RETURN`. `PENALTY` is an outcome, in none |
| Order | `sequence` is the order. Quarter / clock are display |

---

## Cross-tab rules

1. One request, one payload. No tab fetches; every tab reads its blocks off `["game", gameId]`. `player_seasons` is identity only.
2. Per-team blocks are keyed by v5 `team_id`. Per-player rows carry `player_key`; every join is on `player_key`.
3. Direct numeric values for everything shown. The frontend does not subtract, divide, sum player rows, or parse `raw_text` to recover a stat.
4. Rates ship as rates (0–1), null where the denominator is 0. Counts are integers.
5. Everything ranked or ordered arrives ranked or ordered: `notable_performers`, `game_leaders`, `scoring_summary`, `drive_summary`, `play_by_play`.
6. `game_stem` / `game_path_id` / `route` is the one convention with no room to move — every index row, link, and URL on the site depends on it.
