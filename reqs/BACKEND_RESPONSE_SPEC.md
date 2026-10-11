# Backend Response Spec

Request in, response out. One section per endpoint.

This is a fresh pass over the whole site, not a patch on the old doc — the
previous spec, the demo files, and the one-off "req question" docs it grew
from are all in `reqs/archive/`. Six of the fifteen sections below
(§9–§12, §14, §15) already shipped against that old doc and are unchanged in
substance here, just carried forward into one place. The other nine are new.

---

## How this doc works

This is the **contract**: what an endpoint returns. Every field here is a
commitment, so nothing in it carries a status. `BACKEND_PIPELINE_TODO.md` is
the status list — what is wrong right now. Two documents, two lifetimes.

Rules that would otherwise live in a status — a field that is legitimately
absent sometimes — are written into the type instead
(`number | null — null when adjusted_available is false`), where they cannot
decay and do not get re-litigated each drop.

---

## Business rules that shape the data

- **Special teams are neither offense nor defense.** Kickoff and punt units
  are their own phase. Return stats are never folded into `defense_*`.
- **Two coverage tiers.** Every game carries record, score and box-score
  counting stats. Only games between two covered programs carry EPA, WPA,
  drives, situational splits and PAR. A game against an outside opponent is
  scraped for score only — no play-by-play, no `field_map`, no `win_probability`.
  This is the rule behind `has_parsed_game`, `opponent_class`, and
  `data_state` below — three names for the same coverage boundary, one per
  endpoint family.
- **There is no 2020 season.** **2018 is partial** and not published.
- **Opponent-adjusted ratings need a full season.** Every `adj_*` /
  `win_probability` field is null for a season without enough games played.
- **`person_id` is the identity key** for players. `team_id` is the team key.
  Nothing else joins reliably — see the `person_id` warning under §15.
- **Spring games and intrasquad scrimmages are not games.** Never a next
  game, a result, or a schedule row.
- **A conference standing is conference-play only.** `conf_wins` / `conf_losses`
  is the tiebreak-relevant record; `wins` / `losses` is the overall record.
  Neither substitutes for the other.

---

## The Game Row — shared shape

Game Center, Week Central, and Season Schedule all render the same season's
games from three different angles (a curated few, one week, the full grid).
They should all be built off the same per-game object rather than three
independently-shaped payloads the frontend adapts three separate ways. This
is that object — each of §1, §2, §4 below says only how it's wrapped and
what it adds.

```
week                integer
week_label          string    "Week 6" | "SWAC Championship" | "Celebration Bowl"
date                string    YYYY-MM-DD
game_id             string
game_path_id        string | null   null when has_parsed_game is false
team_id             string
opponent_id         string | null   null when the opponent isn't one of the
                                    18 covered programs
opponent_name       string
home_away           string    home | away | neutral
conf_game           boolean
bowl_game           boolean
game_name           string | null   "Celebration Bowl", "SWAC Championship" —
                                    null for a regular week
stadium             string
venue_city           string
result               string | null   W | L | T — null when not yet played
score_team              integer | null
score_opp                 integer | null
status                      string    final | scheduled
has_parsed_game               boolean   REQUIRED on every row — states whether
                                        a play-by-play file backs this game.
                                        Never leave the frontend to infer this
                                        from whether game_path_id is null.
```

Send every field above on every row, including `bowl_game: false` /
`conf_game: false` for an ordinary week — never omit a boolean because it
doesn't apply. `opponent_id` is the only field allowed to be null on a
`has_parsed_game: true` row (never true — a parsed game always has both
teams identified); it's null exactly when the opponent is outside the
18-program corpus.

---

## Availability

```
LIVE      in the published bundle now, fetch it
LOCAL     the file exists, the publish step does not copy it yet
PENDING   does not exist yet
STATIC    no backend endpoint today — bundled in the frontend's own
          teams.json / wiki_data.js, fine to leave that way unless noted
```

| § | endpoint | state |
|---|---|---|
| 1 | `/api/game-center/hub/{season}` | **LIVE** |
| 2 | `/api/game-center/week-central/{season}/{week}` | **LIVE, wrong shape** — see §2, still on one-file-per-season |
| 3 | `/api/game-center/conference-slate/{season}` | **LIVE** — `axes` block PENDING within it |
| 4 | `/api/game-center/season-schedule/{season}` | **LIVE** |
| 5 | `/api/game-center/team-schedule/{season}/{team_id}` | **LIVE** — identical to §11 |
| 6 | `/api/game-center/standings/{season}` | **LIVE** — `last5`/`form` and `streak` PENDING within it |
| 7 | `/api/schools/teams` | **LIVE** |
| 8 | conference wiki | **STATIC** — see §8 |
| 9 | `/api/schools/roster-hub/{season}` | **LOCAL** — complete, needs publishing; `class_distribution[].vs_conference_avg` PENDING within it |
| 10 | `/api/schools/team-hub/{season}/{team_id}` | **LOCAL** — one file exists (PVAMU/2025) |
| 11 | `/api/game-center/team-schedule/{season}/{team_id}` | **LIVE** — the four tag booleans and `win_probability` PENDING within it |
| 12 | `/api/schools/roster-hub/{season}/{team_id}` | **LOCAL** — one file exists (PVAMU/2025); see the two open questions in §12 |
| 13 | school wiki | **STATIC** — see §13 |
| 14 | `/api/players/roster/{season}` | **LOCAL** — complete, needs publishing; `par`/`games_played`/`season_components` PENDING within it, see §14 |
| 15 | `/api/players/profile/{season}/{person_id}` | **LOCAL** — one file exists (Cameron Peters, PVAMU/2025) |

**LOCAL means do not wire against a local copy for any other team/player.**
Five of these are complete and blocked only on the publish step.

---

**Types:** `string` `integer` `number` `boolean` `null`. A union means the
field is always present and may be null — code for the null. `optional`
means the field may be absent entirely.

**Season set:** 2019, 2021, 2022, 2023, 2024, 2025, 2026. No 2020.
`{season}` is a four-digit integer. `{team_id}` is the backend team key,
lowercase, conference-prefixed: `meacdsu`, `swacaamu`. 18 current programs.

---

## 1 · Game Center

```
GET /api/game-center/hub/{season}
```

The live home page for the season — a curated few games, not the full
schedule (that's §4). Off-season (no games yet) is a real, distinct state:
send `$.games: []` and every other array empty rather than an error or a
partial payload.

```
$.season                    integer
$.featured_games[]          array, ≤4 — the Game Row, plus the two fields below
$.featured_games[].headline    string    one sentence — REQUIRED, never a
                                        placeholder like "MVP: QB 312 total yds"
$.featured_games[].tag         string    short label, see Game tagging in §10
$.recent_results_rail[]      array — Game Row, filtered to has_parsed_game:
                                    true games only, most recent first
$.standings.swac_west         object    the block below
$.standings.swac_east         object    same shape
$.standings.meac              object    same shape
```

### `standings.{group}`

```
title              string    "SWAC West"
metric              string    conference | overall — REQUIRED, states which
                              column the top-3 is actually ranked on. Never
                              leave the frontend to infer this from whether
                              enough conference games have been played.
rows[]                array, exactly 3 — the division/conference leaders
rows[].team_id          string
rows[].wins               integer
rows[].losses               integer
rows[].conference_record      string    "5-1" — display only
```

Send `metric` explicitly rather than always ranking by conference record.
Early in a season, conference decisions are too few to mean anything —
state the cutover rule (e.g. "switch to conference once 3+ conference
decisions exist per team") once here, don't leave each consumer to guess it.

### Selecting `featured_games`

State the selection rule in writing: today the frontend picks the
Celebration Bowl, then the SWAC Championship, then backfills with the two
most recent completed games — a frontend guess standing in for a real
editorial or algorithmic choice. Say what actually drives it (highest
combined PAR? rivalry flag? hand-curated?) so the frontend stops
reimplementing a heuristic that may not match the one the backend intends.

---

## 1b · Game Detail

```
GET /api/game-center/game/{game_path_id}
```

The largest payload in the app and the one the entire Game Center page is built
on — banner, Summary tab, Box Score tab, Data Room, Play by Play. It was never
written down here, which is how the two shapes below came to diverge without
anyone catching it. **Files today:** `public/data/93-FE Docs/game-center/games/
{season}/{game_path_id}.json`, indexed by `game-center/games/index.json`
(`game_stem`, `season`, `home_team_id`, `away_team_id`). The frontend resolves a
game by matching `game_stem` or `game_id` in that index, then loads the file the
index points at — it does not guess a path from the season.

**Two shapes are live at once.** 2019-2025 games carry `_schema:
"frontend_ready_v3"`; the 2026 games carry no `_schema` and a materially
different payload. Both have to render, so the frontend reads both — but every
divergence below had to be found by walking the files, and each one failed
silently rather than loudly. Please send `_schema` on every game, at every
season, and bump it when the shape moves.

### The renames that break consumers silently

These are same-meaning fields under different names. Nothing throws at the
network layer; the value simply arrives `undefined` and a card renders blank, or
sorts on nothing, or falls through to a placeholder. Ranked by blast radius.

| Block | 2019-2025 | 2026 | What broke |
|---|---|---|---|
| `production_scores[team]` | **array** of rows | **object** keyed by `player_key` | `.find`/`.sort` on the object — a hard `TypeError` in the box-score spotlight |
| ↳ row | `name` | `name_raw` | Notable Performers rendered nameless |
| ↳ row | `position` | `position_assumed` (+ new `position_source`) | position fell back to the roster guess |
| ↳ row | `production_total` | `production_score.total` | every performer sorted on `undefined` |
| ↳ row | `components: {…}` | `production_score: {…}` | component keys inside are **identical** — only the wrapper moved |
| `drive_summary[]` | `start_yardline_absolute`, `end_yardline_absolute`, `quarter_start`, `quarter_end`, `clock_start`, `clock_end` | nested `start: {spot_absolute, quarter, clock, …}` / `end: {…}` | field-position and scoring-opportunity math read `undefined` and returned a confident 0 |
| RUSH / PASS / SACK actions | `rusher` / `passer` / `receiver` are **strings** | objects `{name_raw, team, player_id}` | used as ledger keys they stringify to `"[object Object]"` and every player collapses into one bucket |

A single field for the whole `production_scores` block would settle it: either
keep one shape, or send a `schema_version` on the block so a reader can branch on
something other than duck-typing.

### Blocks the 2026 export drops entirely

Present on every 2019-2025 game, absent from all five 2026 games. Each one is a
card or a column that goes dark, so this reads as an oversight rather than a
decision — please confirm which are coming back.

| Dropped block | What it fed |
|---|---|
| `heat_maps` | pass/rush heat maps |
| `special_teams_advanced`, `special_teams_individual`, `special_teams_production` | the whole Special Teams panel |
| `defensive_analytics`, `defensive_production`, `defensive_advanced_metrics`, `defensive_identity`, `defensive_crucial_downs`, `defense_role_distribution` | the Defense panel and Data Room defensive rows |
| `offensive_advanced_metrics` | rush/pass offense splits (`rush_offense.run_success_rate_by_down`) |
| `hidden_yardage` | the Team Stats "Spec Teams Yds" row |
| `coaching_profile`, `pressure_profile`, `penalty_profile`, `sequence_model`, `field_position_timeline`, `enrichment_summary` | Data Room sections |

`advanced_team` also lost **34 of its fields** in 2026, including
`line_yards_per_rush`, `highlight_yards_per_rush`, `rush_opportunity_rate`,
`stopped_run_rate`, `special_teams_hidden_yards`, `expected_turnovers`,
`turnover_luck`, and every `success_rate_*` situational split. `epa_per_play`,
`success_rate`, `stuff_rate`, `havoc_rate_forced` and `explosive_rate_yardage`
survive. The rushing panel's team row prints dashes for LY/Car, Opp Rt and
Hlt/Opp on 2026 games as a direct result.

`individual_stats` rows are trimmed the same way — `passing` lost
`sack_yards_lost`, `sacks_taken`, `depth_breakdown`, `direction_breakdown`,
`completion_pct`, `yards_per_attempt`, `fumbles` (and gained `epa_per_play`);
`rushing` lost `direction_breakdown`, `fumbles`, `long`; `receiving` lost
`catch_rate`, `yards_per_reception`, `yards_per_target`, `deep_targets`,
`deep_receptions`, `direction_breakdown`, `fumbles`; `defense` lost
`solo_tackles`, `assisted_tackles`, `passes_defended`, `forced_fumbles`,
`fumble_recoveries`, `qb_hurries`.

Play rows also lost `epa`, `wpa`, `situation`, `garbage_time` and
`score_differential`, which is what a win-probability curve would be drawn from.

### What 2026 delivers that we had been asking for

Verified across all five 2026 games, by counting, not by reading a changelog.

| Field | Status | Note |
|---|---|---|
| RUSH action `direction` | **DELIVERED** — 338 of 339 carries (99.7%) | Closes the ask that `rushDirection` was on 0 of 5,064 carries in 2025. The rushing lane chart now places every carry by its real direction instead of partitioning an aggregate |
| PASS action `passDepth` | **DELIVERED** — 297 of 303 (98%) | |
| PASS action `targetDirection` | **DELIVERED** — 293 of 303 (96.7%) | Closes the ask that direction was regexed out of `raw_text` with a `"middle"` default |
| PASS action `airyards` | **DELIVERED** — 297 of 303 (98%) | |
| `advanced_basics.blocks[]` | **DELIVERED** | `{label, metrics[]{key, label, away, home}}` — the Advanced Basics card renders it directly. Carries the full 5-column Turnovers block (`turnovers`, `expectedTos`, `toMargin`, `expectedToMargin`, `toLuckPts`) that no client formula can produce |
| `game_leaders` | **DELIVERED** | `passing` / `rushing` / `receiving` / `tackles` / `havoc`, each with a real `position` per player |
| Nested `home_team` / `away_team` | **DELIVERED** | `{team_id, name, short_name, score, record, conference_record, winner}` |
| `classification`, `status`, `status_label`, `week`, `date_label`, `kickoff_label`, `route`, `winner_team_id` | **DELIVERED** | |

### Still open on the 2026 shape

1. **`notable_performers[].stat_summary` is a stub.** All five keys (`tackles`,
   `sacks`, `rush_yards`, `receiving_yards`, `interceptions`) are present and
   **null on all 75 leaves** across the five games. `chips` carries only
   `{label: "Total", value: <production_total>}`. Either fill it or drop it — a
   populated-looking object of nulls reads as a bug on our side.
2. **`win_probability` is a final snapshot, not a curve.** `{away, home,
   winner_team_id, final_label, source: "backend_model"}` states where it ended,
   which can't draw the in-game line the Win Probability card is. With `wpa` and
   `epa` also gone from the play rows, there is no longer any source for that
   chart. A per-play `win_probability` (or restored `wpa`) is what it needs.
3. **No league-average block** (carried over from the Stats Hub ask #10) — SP+
   prints a National Average row under every Advanced Basics block and that row
   is what makes "6.3 plays per drive" legible. The card reserves the row and
   prints dashes.
4. **`record` inside `home_team`/`away_team` doesn't reconcile.** Texas Southern
   reads `record: "0-1"` in `tsupvamu26` despite a real week-0 win over NC
   Central one game earlier, and `record` equals `conference_record` in every
   2026 file checked. State what scope `record` counts.
5. **Aggregate views lag the game files.** `tsupvamu26` and `scsufamu26` are
   complete, final games, but `schedule_board_2026.json`, `game_center_hub_2026`
   and `games_hub_2026` still show them as `status: "scheduled"` with
   `game_path_id: null` and `has_game_page: false`, and `standings_race_2026` is
   still `as_of_week: 0` with `completed_games: 0`. The games are unreachable
   from any listing — only by direct URL. Whatever regenerates those aggregates
   needs to run after a game file lands.
6. **Home/away disagree between the schedule board and the game file.** For
   `scsufamu26` the game file has SC State away and FAMU home; the schedule
   board's own cell has FAMU away and SC State home, at a neutral site. One of
   them is wrong.

---

## 2 · Week Central

```
GET /api/game-center/week-central/{season}/{week}
```

**One file per week, not one file per season.** The current export is a
single `week_central_{season}.json` covering every week; the frontend
already filters that down to one week client-side because the payload is
wrong-shaped, not because it wants to. Ship the scoped file — the frontend
is ready for it the moment it exists.

```
$.season          integer
$.week             integer
$.week_label         string
$.default_week         integer   which week loads with no user selection —
                                REQUIRED, not derived from "today" client-side
$.games[]                array — the Game Row
```

Every game in `games[]` belongs to this one week — the frontend no longer
needs to filter a season-wide array down by week once this ships.

### Non-conference toggle

The page has an "include non-conference" toggle that hides games where
`opponent_id` is null (an outside opponent). This is a pure client-side
filter over `games[]` — nothing to send for it, noted here only so it isn't
mistaken for a missing field.

---

## 3 · Conference Slate

```
GET /api/game-center/conference-slate/{season}
```

The N×N matchup grid — every team in a division against every other team in
that division, one cell per pairing.

```
$.season               integer
$.axes                  object    the block below — REQUIRED, PENDING today
$.matchups[]              array    the block below
```

### `axes`

```
axes.meac.team_ids[]        array of team_id, in the order the grid renders
axes.swac_east.team_ids[]     array
axes.swac_west.team_ids[]       array
```

Send this. The frontend currently hardcodes each division's 6-team roster as
a fallback — real for this season, wrong the moment a program moves
divisions or the corpus grows. `axes` is the source of truth; the hardcoded
list becomes a stale-data fallback only, not the primary path.

### `matchups[]`

```
matchups[].game_path_id     string | null   null when has_parsed_game is false
matchups[].date                string
matchups[].away_team_id          string
matchups[].home_team_id            string
matchups[].away_score                integer | null
matchups[].home_score                  integer | null
matchups[].status                        string    final | scheduled
```

One row per played-or-scheduled pairing within a division — not every
possible pairing. A cell with no entry in `matchups[]` renders as
"not on the schedule," which is a real and different state from 0-0.

---

## 4 · Season Schedule

```
GET /api/game-center/season-schedule/{season}
```

The full-season wall chart — every team, every week, one cell per
team/week. Grouped by division on the frontend (SWAC East / SWAC West /
MEAC), same three groups as §3's `axes`.

```
$.season          integer
$.weeks[]           array    the block below
```

```
weeks[].week          integer
weeks[].label            string
weeks[].games[]            array — the Game Row
```

A team with no game in a given week (a bye) has no row for that team in that
week's `games[]` — the frontend renders the empty cell itself. Don't send a
placeholder row for a bye.

---

## 5 · Team Schedules

The league-wide "pick a team, see its schedule" page (`/game-center/team`).
This is **the same endpoint and the same payload as §11 — Team Schedule**,
reached from a team picker instead of a team's own page. Nothing to spec
twice: see §11 for the full contract.

---

## 6 · Standings

```
GET /api/game-center/standings/{season}
```

```
$.season           integer
$.groups.swac_east    object    the block below
$.groups.swac_west      object    same shape
$.groups.meac              object    same shape
```

### `groups.{group}`

```
completed_games          integer   conference games played, this division
remaining_games             integer   conference games left, this division
scenario_count                 integer   REQUIRED if sent at all — state how
                                        it's computed (see note below)
standings[]                       array    the block below
finish_matrix[]                     array    the block below
```

### `standings[]` — one row per team

```
team_id             string
wins                  integer
losses                  integer
conf_wins                 integer
conf_losses                  integer
win_pct                         number    0-1
conf_win_pct                       number    0-1
points_for                            integer
points_against                          integer
rank                                       integer   this team's current
                                                      position within the group
record                                       string    "8-2" — display only
conference_record                              string    "5-1" — display only
last5                                            string | null   5-char W/L
                                                                 string, most
                                                                 recent last,
                                                                 e.g. "WWLWL" —
                                                                 REQUIRED, PENDING —
                                                                 not in the
                                                                 export today,
                                                                 the frontend
                                                                 shows dashes
streak                                             string | null   "W3" | "L1" —
                                                                    REQUIRED,
                                                                    PENDING,
                                                                    same as above
tiebreaker_status                                    string | null   internal
                                                                     pipeline
                                                                     note, e.g.
                                                                     "resolved_by_available_rules" —
                                                                     never
                                                                     rendered as
                                                                     a streak,
                                                                     display TBD
                                                                     or drop it
```

`last5` and `streak` are the two fields this page is missing today — the
Form Boxes column and every "hottest team" framing are dead until these
ship. Everything else in `standings[]` is live.

### `finish_matrix[]` — probability of finishing in each position

```
finish_matrix[].team_id       string
finish_matrix[].current_rank    integer
finish_matrix[].values[]          array of number, one per finish slot,
                                  0-100, sums to ~100 across the row —
                                  REQUIRED: state the model this comes
                                  from (Monte Carlo over remaining games?
                                  something else?)
finish_matrix[].counts[]            array of integer, same length as
                                    values[] — sample count backing each
                                    probability, if the model is
                                    simulation-based
```

When a division's regular season is over, `finish_matrix` collapses to
100/0 per team at their final rank — send it that way rather than omitting
the block once games run out.

Never send `scenario_count` as a bare `2^remaining_games` — that's a count
of schedule permutations, not a probability-of-scenario number, and reads
as a fabricated statistic if that's what's behind it. State what it actually
counts, or drop the field.

---

## 7 · Directory

```
GET /api/schools/teams
```

The school-picker grid (`/teams`, `/schools`) — every current program, no
season scoping.

```
$.generated_at                string
$.current_program_count       integer
$.teams[].team_id             string     join key for every other endpoint
$.teams[].school_name         string     "Delaware State University"
$.teams[].short_name          string     "Del State"
$.teams[].abbreviation        string     "DSU"
$.teams[].conference          string     MEAC | SWAC
$.teams[].division            string | null
$.teams[].is_current_program  boolean
```

Colors and logos are not on this endpoint — that stays a frontend/branding
concern, sourced from the bundled `teams.json`. `team_id` is the only field
that joins the two; if a team's `teams.json` entry needs a different id to
reconcile, that mapping needs to be written down somewhere both sides can
see it, not held in one file's field order.

---

## 8 · Wiki

The conference knowledge hub (`/schools/wiki`) — SWAC/MEAC identity,
history, rivalries, the Celebration Bowl ledger, the MEAC/SWAC Challenge.

**This is editorial content, not season data, and it is fine to leave it
STATIC** (bundled in `src/data/wiki_data.js`) rather than request an
endpoint for all of it — commissioner names, founding years, traditions,
and slogans don't change during a season and don't need a fetch.

Two pieces of it are load-bearing facts, not copy, and drift out of date
silently if left hand-maintained:

```
recentChamp.year     string    last season's conference champion — currently
recentChamp.name       string   hand-edited per conference, per season
recentChamp.logo         string
```

```
CELEBRATION_ORBIT_GAMES[]   array   the full Celebration Bowl game-by-game
                                    ledger (participants, score, winner) —
                                    currently hand-entered
```

State whether these two should instead be derived from real season results
(§4/§6 already carry the data that would answer "who won the conference"
and "what was the Celebration Bowl score") so they update themselves each
January instead of waiting on a manual edit. Everything else on this page —
history, traditions, slogans, media partners — stays hand-authored content
with no backend involvement.

---

## 9 · Roster Hub (League)

```
GET /api/schools/roster-hub/{season}
```

The league-wide directory (`/rosters`) — team grid plus league/conference
composition. Distinct from §12, which is one team's own roster page — this
endpoint needs all 18 teams at once, §12 needs exactly one.

```
$.year                  integer
$.total_players         integer
$.all                   object    league-wide, same block shape as below
$.divisions             object    keyed by division, same block shape
$.teams.{team_id}       object    the block below
```

```
team_id      string
division     string
composition  object
experience   object
physical     object
geographic   object
transfers    object
```

### `composition`

```
total_players                     integer
position_distribution[].group     string    DB DL OL WR LB RB TE QB ST HYBRID
position_distribution[].count     integer
position_distribution[].pct       number    of total_players
class_distribution[].class              string    Fr. So. Jr. Sr. Gr. Unknown
class_distribution[].label              string    Freshman Sophomore ...
class_distribution[].count              integer
class_distribution[].pct                number
class_distribution[].vs_conference_avg  number    REQUIRED — signed delta in
                                                  points against this team's
                                                  own conference average for
                                                  that class, e.g. -15 or +7
```

`HYBRID` is a real group — a player the roster lists at two positions.
Render it, don't filter it out. 1–2 players per team.

### `experience`

```
upperclass_pct                                    number
veteran_pct                                       number
pyramid[].{class,label,count,pct}                 same shape as class_distribution
by_position_group.{GROUP}.total                   integer
by_position_group.{GROUP}.breakdown[].class       string
by_position_group.{GROUP}.breakdown[].count       integer
by_position_group.{GROUP}.breakdown[].pct         number
```

### `physical`

`overall` and each entry of `by_position_group` share one shape:

```
count             integer
height_avg        number    inches
height_median     number
height_max        integer
height_min        integer
weight_avg        number    pounds
weight_median     number
weight_max        integer
weight_min        integer
height_coverage   integer   players with a height, of count
weight_coverage   integer
```

`*_coverage` runs below `count` on most teams — compute rates against
coverage, not against `count`.

### `geographic`

```
total_with_hometown                 integer
domestic_count                      integer
international_count                 integer
in_state_count                      integer
in_state_pct                        number
avg_recruiting_distance_miles       number
median_recruiting_distance_miles    number
distance_tier_breakdown.local       integer
distance_tier_breakdown.regional    integer
distance_tier_breakdown.national    integer
state_distribution[].state          string    two-letter
state_distribution[].count          integer
state_distribution[].pct            number
```

### `transfers`

```
transfer_count                             integer
transfer_rate                              number    percent
tier_breakdown[].tier                      string    P4 G5 FCS D2 JUCO HS
tier_breakdown[].count                     integer
tier_breakdown[].pct                       number
position_impact[].group                    string
position_impact[].total_players            integer
position_impact[].transfer_count           integer
position_impact[].transfer_rate            number
position_impact[].tier_breakdown           object    tier -> count
```

---

## 10 · Team Profile

```
GET /api/schools/team-hub/{season}/{team_id}
```

Return one team, one document — not an all-18-teams shape. Send every field
below on every document unless marked `optional` or written as a union with
`null`. Never omit a field because it doesn't apply this week — send `null`.

```
$.team_id            string
$.season              integer
$.season_state         string    in_progress | complete
```

Send `season_state`. Don't require the page to derive it from `next_game`.

### `header`

```
header.conference           string
header.division              string
header.division_label        string    "SWAC WEST"
header.season                integer
header.team_abbreviation     string
header.school_name           string
header.avg_par                number
header.roster_count          integer
header.transfer_count        integer
header.transfer_rate         number    0-100, e.g. 0.9 means 0.9%
header.upperclass_pct        number    0-100, same scale
```

Send every rate/pct field in this document on a `0-100` scale. Never `0-1`.

### `conference_record`

```
conference_record.conference_label     string    "7-1" — display only
conference_record.conference_wins      integer   REQUIRED
conference_record.conference_losses    integer   REQUIRED
conference_record.overall_label        string    "10-4" — display only
conference_record.overall_wins         integer   REQUIRED
conference_record.overall_losses       integer   REQUIRED
conference_record.overall_ties         integer   REQUIRED — 0 default
conference_record.division_rank        string    "1st - SWAC West"
```

Send `0` for `conference_wins`/`conference_losses` before conference play
starts. Never omit them.

```
conference_record.last_5[]                     array, ≤5, most recent last
conference_record.last_5[].week                integer
conference_record.last_5[].result              string    W | L | T
conference_record.last_5[].home_away           string    home | away | neutral
conference_record.last_5[].opponent_id         string | null
conference_record.last_5[].opponent_short      string
conference_record.last_5[].score_team          integer   REQUIRED
conference_record.last_5[].score_opponent      integer   REQUIRED
conference_record.last_5[].score               string    "L 38-40" — display only
conference_record.last_5[].game_path_id        string
```

### `previous_game`

```
previous_game                          object | null   null only when zero
                                                        games played this season
previous_game.game_id                  string
previous_game.game_path_id             string
previous_game.week                     integer
previous_game.date                     string    YYYY-MM-DD
previous_game.opponent_id              string
previous_game.opponent_name            string
previous_game.result                   string    W | L | T
previous_game.score_team               integer   REQUIRED
previous_game.score_opponent           integer   REQUIRED
previous_game.score                    string    "L 38-40" — display only
previous_game.venue.stadium_name       string
previous_game.venue.venue_label        string    "Atlanta, GA" — what the
                                                  page renders
previous_game.venue.city               string | null   city/state text only —
                                                        fix at parse: this
                                                        currently returns
                                                        box-score header text
                                                        welded onto the city
previous_game.venue.neutral_site_name  string | null
previous_game.tag                      string    short label, see §11 tagging
previous_game.headline                 string    one sentence, never equal to tag
previous_game.is_rivalry                    boolean
previous_game.is_homecoming                 boolean
previous_game.is_conference_championship    boolean
previous_game.is_celebration_bowl           boolean
```

### `next_game` / `season_summary` — mutually exclusive on `season_state`

```
next_game        object | null   present with the shape below only when
                                 season_state == "in_progress" and a game
                                 remains; null otherwise
season_summary   object | null   present only when season_state == "complete";
                                 null otherwise
```

`next_game` shape:

```
game_id                     string
date                        string    YYYY-MM-DD
kickoff                     string    "TBD" or a time
opponent_id                 string | null    null for a non-corpus opponent
opponent_name               string
opponent_short_name         string
opponent_mascot             string | null
opponent_logo               string | null
home_away                   string    home | away | neutral
venue                       object    same shape as previous_game.venue
broadcast                   string | null
tag                         string    short label, see tagging below
headline                    string    one sentence, never equal to tag
is_rivalry                  boolean
is_homecoming               boolean
is_conference_championship  boolean
is_celebration_bowl         boolean
```

Return the earliest regular-season game with a date after today. Never a
spring game or an intrasquad scrimmage.

`season_summary` shape:

```
season_summary.state              string    "complete"
season_summary.headline           string
season_summary.record              string    "10-4" — display only
season_summary.wins                integer   REQUIRED
season_summary.losses              integer   REQUIRED
season_summary.conference_record   string    "7-1" — display only
season_summary.conference_wins     integer   REQUIRED
season_summary.conference_losses   integer   REQUIRED
season_summary.division_finish     string
season_summary.avg_par             number
season_summary.games_played        integer
```

### Game tagging — applies to `next_game`, `previous_game`, and §11 Team Schedule

Send `tag` as one short label. Never collapse the four booleans into it.

Derive `is_conference_championship` from the schedule. Derive
`is_celebration_bowl` from `venue.neutral_site_name`. Return `false` for
`is_rivalry` and `is_homecoming` until a curated list exists — never `null`.
`headline` is always a different string from `tag`.

### `coach_carousel[]`

Order: head coach first, then coordinators. Send every field on every element.

```
coach_carousel[].coach_id             string    PERS_ id
coach_carousel[].name                 string
coach_carousel[].role                 string    "Head Coach" | "Offensive
                                                 Coordinator" | "Defensive
                                                 Coordinator" | position title
coach_carousel[].role_title           string
coach_carousel[].role_group           string    head_coach | coordinator |
                                                position_coach
coach_carousel[].image_url            string | null
coach_carousel[].tenure_year          integer | null
coach_carousel[].metric               object | null    null when this coach
                                                        has no measured metric
                                                        yet
coach_carousel[].metric.key                string
coach_carousel[].metric.label              string
coach_carousel[].metric.value              number
coach_carousel[].metric.scope              string    "vs 2024"
coach_carousel[].metric.higher_is_better   boolean
coach_carousel[].metric.is_improvement     boolean
coach_carousel[].metric.direction          string    up | down | flat
```

Send `is_improvement` as the good/bad flag. `direction` is display only
(which way the number moved) — never let it imply good or bad. A metric can
go up and be worse (e.g. defensive EPA allowed).

### `unit_carousel`

```
unit_carousel.scope                string    "conference"
unit_carousel.scope_total          integer
unit_carousel.available_units[]    array of strings — REQUIRED single source
                                                       of truth for slides[]
unit_carousel.slides[]              array, ≥2
unit_carousel.slides[].unit          string
unit_carousel.slides[].label         string
unit_carousel.slides[].metrics[]     array, exactly 4
unit_carousel.slides[].metrics[].key                string
unit_carousel.slides[].metrics[].label              string
unit_carousel.slides[].metrics[].value              number
unit_carousel.slides[].metrics[].rank               integer
unit_carousel.slides[].metrics[].total              integer   may be <
                                                              scope_total
unit_carousel.slides[].metrics[].higher_is_better    boolean
```

Include a unit only when all 4 of its metrics are non-null for this team.
Never send a slide with a `"--"` metric baked in — drop the whole slide.

State the tie-break rule for two candidates ranked `1` in the same response.

### `top_stat`

```
top_stat.unit           string
top_stat.key            string
top_stat.label           string
top_stat.value           number
top_stat.rank            integer
top_stat.total           integer
top_stat.display         string    sentence-case, "Passing touchdowns"
top_stat.candidates[]    array, ≥1 — REQUIRED pre-sorted best-rank-first
top_stat.candidates[].unit    string
top_stat.candidates[].key     string
top_stat.candidates[].label   string
top_stat.candidates[].value   number
top_stat.candidates[].rank    integer
```

Rank against the full conference, `/18`. Never against division.

### `star_impact`

```
star_impact                          object | null   null when zero games
                                                      played this season
star_impact.person_id                string
star_impact.full_name                string
star_impact.position                 string
star_impact.class_year               string
star_impact.from_game.game_id        string
star_impact.from_game.week           integer
star_impact.from_game.opponent_name  string
star_impact.from_game.result         string
star_impact.from_game.score          string
star_impact.game_par                 number
star_impact.season_par               number
star_impact.par_per_game             number
star_impact.stat_line[]              array    [{label, value}], position-agnostic
star_impact.profile_url              string    "/player/{person_id}/{season}"
```

Select the player with the highest `game_par` among all players with
production in the most recent completed game. State the tie-break rule.

---

## 11 · Team Schedule

```
GET /api/game-center/team-schedule/{season}/{team_id}
```

The per-team schedule tab (`/teams/{teamId}/schedule`) and, unwrapped, the
league-wide Team Schedules picker at `/game-center/team` — see §5.

```
$.team_id            string
$.season             integer
$.season_state        string    in_progress | complete
$.team_abbreviation    string
$.school_name            string
$.conference               string
$.division                   string
$.summary                      object    the block below
$.games[]                        array     the block below
```

### `summary`

```
summary.games              integer
summary.played              integer
summary.wins                  integer
summary.losses                  integer
summary.ties                      integer
summary.conference_games            integer
```

Send this pre-computed. Don't make the frontend derive win/loss counts by
filtering `games[]`.

### `games[]`

```
games[].week                          integer
games[].date                            string    YYYY-MM-DD
games[].game_id                           string
games[].game_path_id                        string | null   null when
                                                             opponent_class
                                                             is "non_hbcu"
games[].home_away                             string    home | away | neutral
games[].opponent_id                             string | null
games[].opponent_name                             string
games[].opponent_short                              string
games[].opponent_class                                string    covered | non_hbcu
games[].result                                          string | null   null
                                                                        when not
                                                                        yet played
games[].score_team                                        integer | null
games[].score_opponent                                      integer | null
games[].score                                                 string | null
games[].status                                                  string    final |
                                                                          scheduled
games[].venue.stadium_name                                        string
games[].venue.venue_label                                           string
games[].venue.city                                                    string
games[].venue.neutral_site_name                                         string | null
games[].tag                         string
games[].headline                    string
games[].is_rivalry                  boolean
games[].is_homecoming               boolean
games[].is_conference_championship  boolean
games[].is_celebration_bowl         boolean
games[].win_probability             number | null   0.0-1.0, pregame — null
                                                     for non_hbcu games and
                                                     for any season the
                                                     ratings don't cover yet
```

Send `opponent_class` on every row — states the two-tier coverage rule per
game, instead of the frontend inferring coverage from which fields happen
to be null. Tagging is identical to §10.

---

## 12 · Team Roster

```
GET /api/schools/roster-hub/{season}/{team_id}
```

One team, one document — not a slice of §9. PVAMU/2025 is the only file
live today.

```
team_id        string
season         integer
roster_size    integer
composition    object    same shape as §9's per-team composition,
                        including vs_conference_avg on class_distribution[]
frame_profile  object    the block below — replaces §9's physical.groups
                        buckets, not a rename of it
experience_by_room   object    same shape as §9's experience.by_position_group
players[]      array     the block below
```

### `frame_profile`

```
frame_profile.LINE.groups        array of strings    e.g. ["OL","DL"]
frame_profile.LINE.count         integer
frame_profile.LINE.height_avg    number    inches
frame_profile.LINE.weight_avg    number    pounds
frame_profile.BOX                object    same shape as LINE
frame_profile.SKILL              object    same shape as LINE
frame_profile.by_position_group.{GROUP}.count         integer
frame_profile.by_position_group.{GROUP}.height_avg    number
frame_profile.by_position_group.{GROUP}.weight_avg    number
```

Two open questions, still open from the first pass at this page — answer
them here rather than leaving them to be re-guessed per team:

**Is `LINE`/`BOX`/`SKILL` fixed or per-team?** PVAMU's file puts QB in
`SKILL` alongside WR and DB. Confirm that's the intended grouping everywhere,
not a PVAMU-specific artifact — it decides which card a quarterback's frame
shows up on.

**Where does special teams go?** PVAMU's `LINE` + `BOX` + `SKILL` counts sum
to 74 of `roster_size: 80` — the other 6 are the `ST` group, absent from all
three tiers. State whether that's deliberate or a gap.

### `players[]`

```
players[].full_name              string
players[].first_name             string
players[].last_name              string
players[].jersey_number          integer
players[].position               string    display label, "Wide Receiver"
players[].position_abbr          string
players[].position_group         string
players[].class_year             integer
players[].class_label            string
players[].class_year_raw         string
players[].height                 integer   inches
players[].weight                 integer   pounds
players[].hometown                string | null
players[].previous_school         string | null
players[].image_url               string | null
players[].par                     number
players[].is_transfer             boolean
players[].is_redshirt             boolean
players[].eligibility_remaining   integer
players[].eligibility_seasons[]   array of integers
players[].redshirt_used           boolean
players[].redshirt_available      boolean
```

**Geographic.** This document carries `hometown` as one free-text string
("Missouri City, Texas"), no state code, no `geographic` block. The
Recruiting Map card renders "not available" rather than guess a state from
that string. Add `home_state` per player, or a team-level `geographic` block
matching §9's shape — state which.

**Transfers.** `is_transfer` is here, but there's no `transfer_tier` per
player and no team-level `transfers` block. `transfer_rate`/`transfer_count`
compute fine from `is_transfer` alone; "where transfers came from" and
"which position rooms" show "not available." Add `transfer_tier` per player
(same enum as §14: `P4 G5 FCS D2 JUCO HS`), or a team-level `transfers`
block matching §9's shape — state which.

---

## 13 · Team School Wiki

```
GET /api/schools/wiki/{team_id}
```

**Currently STATIC** — `team.wiki` is embedded directly in the bundled
`teams.json`, not fetched. This works and can stay this way indefinitely if
this content only ever changes via a frontend deploy. Request an endpoint
only if editorial updates need to ship without one — say which.

Current shape, for reference if it does move to its own endpoint:

```
wiki.briefHistory              string
wiki.traditions.onField[]        array of strings
wiki.traditions.offField[]         array of strings
wiki.band.name                       string
wiki.band.signatureSelection           string
wiki.colorsDescription                   string
```

Everything else this page renders — founding year, enrollment, stadium name
and capacity, mascot, national championship count, colors, logo — already
comes from `teams.json`'s top-level team record (see §7's join note), not
from `wiki`. Nothing new needed there.

---

## 14 · Team Full Roster

```
GET /api/players/roster/{season}
```

Array of player-seasons, filtered to one `team_id` client-side today. 2010–
2026. 1,946 rows for 2025.

```
person_id         string             PERS_00004021   join key, 100% populated
full_name         string
first_name        string
last_name         string
team_id           string
season            integer
jersey_number     integer | null
position          string             fine-grained, 26 values incl. S CB DT
                                     K P LS EDGE STAR ATH FB and slashed pairs
position_group    string             DB DL OL WR LB RB TE QB ST HYBRID
raw_position      string             as the school printed it, "Running Back"
class_year        integer | null     1-5
class_year_raw    string | null      "So." — some rows carry a bare digit
is_redshirt       boolean
experience_score  number
is_transfer       boolean
transfer_tier     string | null      P4 G5 FCS D2 JUCO HS
transfer_inferred boolean | null
previous_school   string | null
high_school       string | null
image_url         string | null      98.9% populated
height            integer | null     inches
weight            integer | null     pounds
bmi               number | null
body_type         string | null      Lean Average Heavy "Very Heavy"
hometown          string | null      "Kennesaw, GA"
home_city         string | null
home_state        string | null
birth_place       string | null
distance_miles    number | null
distance_tier     string | null      local regional national
is_in_state       boolean | null
par                  number | null    REQUIRED, PENDING — see below
games_played           integer | null   REQUIRED, PENDING
total_production          number | null   REQUIRED, PENDING
avg_production               number | null   REQUIRED, PENDING
season_components               object | null   REQUIRED, PENDING
```

**Filter and group on `position_group`, not `position`.** `position_group`
is the ten-value enum the roster hub counts against and the one a position
dropdown should use.

**The last five fields don't exist on this endpoint today.** The Team Full
Roster page currently gets them by joining against
`player_stats_2025_enriched.json` on `person_id` — the same file §15 warns
carries a stale `person_id` for at least one player, which means every team
roster that joins against it inherits that same risk of silently attaching
one player's production numbers to a different roster row. Add `par`,
`games_played`, `total_production`, `avg_production`, and
`season_components` directly to this endpoint's own rows, keyed on this
endpoint's own `person_id`, so the join — and the bug it can reproduce —
goes away entirely rather than getting re-fixed once per consumer.

`person_id` is the join key to every other endpoint that names a player.

---

## 15 · Player Page

```
GET /api/players/profile/{season}/{person_id}
```

Key on `person_id`, not name+team. Scope: the Bio & Background tab only —
Season Stats and Advanced Analytics are separate, still client-side mock
data today. Roster join note: for a player's own `person_id`, prefer §14's
roster row over `player_stats_2025_enriched.json` — that file carries a
confirmed-stale id for at least one player (Cameron Peters:
`PERS_00003846` there vs. the correct `PERS_00011214` everywhere else),
and until it's regenerated any lookup keyed through it risks silently
resolving to the wrong player.

Send every field below on every document unless marked `optional` or
written as a union with `null`. Send `null` when a value doesn't apply —
never omit the key. Rate fields on this endpoint (`success_rate`,
`higher_is_better` thresholds) are `0-1` fractions, not the `0-100` scale
§10's `header` uses — the two conventions coexist across this doc and
neither infers the other.

```
$.person_id       string
$.season          integer
$.generated_at     string    ISO 8601 — REQUIRED populated
```

### `identity`

```
identity.person_id        string
identity.first_name       string
identity.last_name        string
identity.team_id           string
identity.team_abbreviation string
identity.conference        string
identity.division           string
identity.jersey_number      integer
identity.position            string    display label, "Quarterback"
identity.position_group      string
identity.raw_position         string
identity.class_year            integer
identity.class_label            string    "Freshman" — REQUIRED, not a bare 1-5
identity.height                  integer   inches
identity.weight                  integer   pounds
identity.home_city                 string | null
identity.home_state                 string | null
identity.is_in_state                 boolean | null
identity.previous_school              string | null
identity.high_school                    string | null
identity.image_url                       string | null
```

Send `home_city` / `home_state` only — never also a combined `hometown`
string. Send `is_in_state` here, next to them, not in a separate block.

State the hosting policy for `image_url`: absolute external URL (school
site hotlink) or a cached asset path — and what the page renders if a
hotlinked image later 404s.

### `rating`

`rating.metric` is always `"PAR"` — not a QB-only rating. PAR applies to
every position with production.

```
rating.metric                  string    always "PAR"
rating.available                boolean
rating.value                     number | null    season PAR
rating.per_game                    number | null
rating.games_played                  integer | null
rating.rank_in_position_group          integer | null
rating.position_group_total              integer | null
rating.conference_rank                     integer | null
rating.conference_total                      integer | null
rating.position_group_mean                     number | null
```

Render `rank_in_position_group`, not `conference_rank` — PAR is a volume
stat, not position-normalized. `position_group_mean` can be negative;
render negatives as negatives.

Send `available: false` with every other key `null` for a player with no
production. `games[].par` below is `0.0` in that same case, never `null` —
the bar chart draws a zero-height bar, the rating banner hides.

### `season_totals`

```
season_totals.par                  number
season_totals.total_production      number
season_totals.avg_production          number
season_totals.games_played              integer
season_totals.season_components           object    metric -> number
```

### `games[]` — one row per scheduled game, byes omitted

```
games[].week            integer
games[].game_id          string
games[].game_path_id      string | null
games[].opponent_id        string | null
games[].opponent_name        string
games[].home_away              string    home | away | neutral
games[].result                   string
games[].score                      string
games[].data_state                   string    played | no_appearance |
                                              no_play_by_play | not_yet_played
games[].par                            number    0 when data_state isn't "played"
games[].components                       object    {} when data_state isn't "played"
games[].stat_line[]                       array    [{label, value}],
                                                    position-agnostic
games[].field_map                           object | null    same shape as
                                                              field_map below,
                                                              minus views/
                                                              depth_bands —
                                                              null whenever
                                                              data_state !=
                                                              "played"
```

Row count is the team's own schedule length, not a fixed number. Send
`not_yet_played` for any game later than the one just completed.

### `spotlight` — the most recently played game

```
spotlight.week            integer
spotlight.game_id          string
spotlight.game_path_id      string
spotlight.opponent_id        string | null
spotlight.opponent_name        string
spotlight.home_away              string
spotlight.result                   string
spotlight.score                      string
spotlight.par                          number
spotlight.stat_line[]                    array    same shape as games[].stat_line
spotlight.epa_total                        number
spotlight.success_rate                       number    0-1
spotlight.top_play                             object | null    null until
                                                                play-level EPA
                                                                is attributed
                                                                to a person
spotlight.field_map                            object | null    same shape as
                                                                games[].field_map
```

### `field_map` — season, two views

```
field_map.available              boolean
field_map.views[]                  array     ["passing","rushing"] — the
                                             views this player has, in
                                             render order
field_map.depth_bands                object | null   {short,medium,deep} ->
                                                      yard ranges, passing
                                                      only
field_map.passing.available            boolean
field_map.passing.grid                   string    "3x3"
field_map.passing.cells[].depth            string    short | medium | deep
field_map.passing.cells[].direction          string    L | M | R
field_map.passing.cells[].attempts             integer
field_map.passing.cells[].completions            integer
field_map.passing.cells[].yards                    integer
field_map.rushing.available                          boolean
field_map.rushing.grid                                 string    "1x3"
field_map.rushing.cells[].direction                      string    L | M | R
field_map.rushing.cells[].attempts                         integer
field_map.rushing.cells[].yards                              integer
```

Send all nine passing cells always, zeros included — a cold zone is
information, a missing cell collapses the grid. Same for all three rushing
cells. Rushing carries no depth band and no `completions` — a real
three-cell strip, not an empty state.

Send `views: ["passing"]` and `rushing.available: false` with `cells: null`
for a player with one view and not the other. `views`/`depth_bands` are
season-level, constant for the player — not repeated per game.

Send `field_map: null` on `games[]`/`spotlight` whenever `data_state !=
"played"`, alongside `par: 0.0` and `stat_line: []`. Never key a game's
field_map to a different week's data.

### `comparatives`

```
comparatives.height.value          integer
comparatives.height.rank             integer
comparatives.height.total              integer
comparatives.height.group                string    "QB"
comparatives.height.group_avg              number
comparatives.weight                          object    same shape as height
comparatives.position_room[].class             string
comparatives.position_room[].count               integer
comparatives.on_this_team[].label                  string    "QUARTERBACKS"
comparatives.on_this_team[].rank                     integer
comparatives.on_this_team[].total                      integer
```

Send `rank`/`total` (e.g. "2nd of 5"), not a league-wide percentile — every
number here is pre-ranked, never a raw value the page has to rank itself.

### `background`

```
background.is_transfer          boolean
background.transfer_tier          string | null
background.previous_school          string | null
background.is_redshirt                boolean
background.redshirt_note                string | null
background.distance_miles                 number | null   REQUIRED populated
background.distance_tier                    string | null   REQUIRED populated
background.experience_score                   number
background.class_timeline[].class               string
background.class_timeline[].is_current            boolean
background.class_timeline[].season                   integer
```

`is_in_state` lives in `identity`, not here — don't send it in both places.
