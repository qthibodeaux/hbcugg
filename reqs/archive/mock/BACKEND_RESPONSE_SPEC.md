# Backend Response Spec

Request in, response out. One section per endpoint.

---

## How this doc works

This is the **contract**: what an endpoint returns. Every field here is a
commitment, so nothing in it carries a status. `BACKEND_REQS_BY_PAGE.md` is the
**status list**: what is wrong right now. Two documents, two lifetimes. A status
column inside a contract goes stale and then the contract lies.

Rules that would otherwise live in a status — a field that is legitimately
absent sometimes — are written into the type instead
(`number | null — null when adjusted_available is false`), where they cannot
decay and do not get re-litigated each drop.

### What the backend sends with every drop

One line of intent per change, each marked `by design` or `unsure`. Shape
changes and semantics changes are called out separately — a renamed key and a
key that now measures the opposite thing look identical in a diff and identical
in a one-line changelog.

### What the backend needs back

1. **The field path and the consumer.** Which component reads it, and what it
   renders. Half of the open items resolve to a field that already exists under
   another name, and a path alone cannot say that — "the position dropdown on
   Team Full Roster" can.
2. **The literal fetch path per page.** URL and file. If it is not in
   `93-FE Docs/manifest.json`, the backend is not its source and its age is
   unknown. Counts taken from an unpublished local copy are not evidence.
3. **A date and a path on every count.** Or leave the count out.
4. **"Returns Y, expected Z" instead of "broken."** Wrong value and unexpected
   semantics are different problems with different fixes.
5. **Which of null, `0`, or absent your renderer wants.** Decided once per
   field, written into the type here.
6. **Required vs nice-to-have.** One publish and one open modelling question
   both read as MISSING; without priority they cannot be sequenced.
7. **Adapts, too — as a notice, not a request.** A frontend adapter absorbing a
   shape change is invisible to the backend, and the next export breaks it with
   nobody knowing why.

---

## Business rules that shape the data

Invisible in a payload. An absent field under any of these is by design.

- **Special teams are neither offense nor defense.** Kickoff and punt units are
  their own phase. Return stats will not be folded into `defense_*` to make a
  table symmetric, and special-teams plays are not credited to an offense or a
  defense.
- **Two coverage tiers.** Every game carries record, score and box-score
  counting stats. Only games between two covered programs carry EPA, WPA,
  drives, situational splits, PAR and the field map. Non-conference games
  against outside opponents are scraped for the score only — there is no
  play-by-play, so the absence of EPA on those games is the rule, not a gap.
- **There is no 2020 season.** A missing 2020 is never a bug.
- **2018 is a partial season** and is deliberately not published, though the
  files exist locally.
- **Opponent-adjusted ratings need a full season.** The in-progress season has
  none until it has enough games, so every `adj_*` field is null for it.
- **`person_id` is the identity key** across players, coaches and stats.
  `team_id` is the team key. Nothing else joins reliably.
- **Spring games and intrasquad scrimmages are not games** and never appear as
  a next game, a result, or a schedule row.

## Availability

Every field in this doc is a commitment. Not all of them are fetchable today, so
each endpoint carries one of three markers. This is a delivery state, not a
defect report — it resolves rather than decays, which is why it belongs here and
`BROKEN`/`PARTIAL` do not.

```
LIVE      in the published bundle now, fetch it
LOCAL     the file exists, the publish step does not copy it yet
PENDING   does not exist yet
```

| § | endpoint | state |
|---|---|---|
| 1 | `/api/schools/team-hub/{season}/{team_id}` | **LOCAL** — supersedes the old all-18-teams `team-profile` shape for this page, see §1 |
| 2 | `/api/game-center/team-schedule/{season}/{team_id}` | **LIVE** — `headline`, the four booleans and `win_probability` are PENDING within it |
| 3.1 | `/api/schools/roster-hub/{season}` | **LOCAL** — complete, needs publishing only; `class_distribution[].vs_conference_avg` PENDING within it |
| 3.2 | `/api/schools/roster-hub/{season}/{team_id}` | **LOCAL** — one file exists (PVAMU/2025); `geographic` and `transfers` PENDING within it |
| 4.1 | `/api/players/roster/{season}` | **LOCAL** — complete, needs publishing only |
| 4.2 | `/api/players/profile/{season}/{person_id}` | **PENDING** — no file exists yet, see §4.2 |
| 5 | `/api/stats/team-season-avg`, `team-defense-avg`, `league-avg` | **LIVE** |
| 6 | `/api/stats/team-epa/{season}` | **PENDING** — the ridge source exists, the endpoint does not |
| 7 | `/api/stats/season-stats/{season}` | **LOCAL** — `person_id`, `position`, `position_group`, `stat_category`, `receiving_*`, `defense_*`, `returns_*` are PENDING within it |
| 8 | `/api/stats/player-production/{season}` | **LOCAL** — 2025 only |
| 9 | `/api/schools/teams` | **LIVE** |
| 10 | `/api/game-center/game/{game_path_id}` | under construction |

**LOCAL means do not wire against a local copy.** Four of these are complete and
blocked only on the publish step; that is the backend's next move, not a reason
to read a bundled file of unknown age.

### One live defect, called out because the spec above describes intent

`next_game` is specified as the earliest regular-season game after today, with
spring games excluded. It does not currently behave that way. Of the 28
team-seasons that carry a `next_game`, 8 point at a spring game and 6 are dated
before `previous_game`. Seven 2026 team hubs currently name an April intrasquad
scrimmage as the next game, one of them listing the team itself as the opponent.
Root cause is in schedule ingest, not the export. Do not build around the
current behaviour.

**Re-verify under the §1 rewrite below.** The repro above was against
`next_game_available`, a field the new shape drops in favor of top-level
`season_state`. Confirm the same schedule-ingest bug does or doesn't reproduce
against `season_state` / `next_game` before treating this as closed.

---

**Types:** `string` `integer` `number` `boolean` `null`. A union means the field is
always present and may be null — code for the null. A field marked `optional` may
be absent from the object entirely.

**Season set:** 2019, 2021, 2022, 2023, 2024, 2025, 2026. There is no 2020.
`{season}` is a four-digit integer. `{team_id}` is the backend team key, lowercase,
conference-prefixed: `meacdsu` `swacaamu`. 18 current programs.

---

## 1 · Team Hub

```
GET /api/schools/team-hub/{season}/{team_id}
```

Return one team, one document — not the all-18-teams `team-profile` shape.
Send every field below on every document unless marked `optional` or written
as a union with `null`. Never omit a field because it doesn't apply this
week — send `null` instead.

```
$.team_id            string
$.season              integer
$.season_state         string    in_progress | complete
```

Send `season_state`. Don't require the page to derive it from `next_game` or
any other field.

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
header.transfer_rate         number    0-100, e.g. 0.9 means 0.9%, not a 0-1 fraction
header.upperclass_pct        number    0-100, same scale as transfer_rate
```

Send every rate/pct field in this document on a `0-100` scale, not `header`
alone. Never send a `0-1` fraction.

### `conference_record`

```
conference_record.conference_label     string    "7-1" — display only, never parsed
conference_record.conference_wins      integer   REQUIRED — not in the example
conference_record.conference_losses    integer   REQUIRED — not in the example
conference_record.overall_label        string    "10-4" — display only, never parsed
conference_record.overall_wins         integer   REQUIRED — not in the example
conference_record.overall_losses       integer   REQUIRED — not in the example
conference_record.overall_ties         integer   REQUIRED — 0 default, not in the example
conference_record.division_rank        string    "1st - SWAC West"
```

Send `conference_wins` and `conference_losses` as integers, not folded into
`conference_label` alone. Send `0` for both when conference play hasn't
started yet. Never omit them.

```
conference_record.last_5[]                     array, ≤5, most recent last-week-first
conference_record.last_5[].week                integer
conference_record.last_5[].result              string    W | L | T
conference_record.last_5[].home_away           string    home | away | neutral
conference_record.last_5[].opponent_id         string | null
conference_record.last_5[].opponent_short      string
conference_record.last_5[].score_team          integer   REQUIRED — not in the example
conference_record.last_5[].score_opponent      integer   REQUIRED — not in the example
conference_record.last_5[].score               string    "L 38-40" — display only
conference_record.last_5[].game_path_id        string
```

Send `score_team` and `score_opponent` as integers on every `last_5[]` row.
Never send `score` alone.

### `previous_game`

```
previous_game                          object | null   null only when zero games played this season
previous_game.game_id                  string
previous_game.game_path_id             string
previous_game.week                     integer
previous_game.date                     string    YYYY-MM-DD
previous_game.opponent_id              string
previous_game.opponent_name            string
previous_game.result                   string    W | L | T
previous_game.score_team               integer   REQUIRED — see `conference_record.last_5[]` note above
previous_game.score_opponent           integer   REQUIRED
previous_game.score                    string    "L 38-40" — display only
previous_game.venue.stadium_name       string
previous_game.venue.venue_label        string    clean short label, "Atlanta, GA" — this is what the page renders
previous_game.venue.city               string | null   city/state text only
previous_game.venue.neutral_site_name  string | null
previous_game.tag                      string    short label, see Game tagging
previous_game.headline                 string    one sentence, never equal to tag
previous_game.is_rivalry                    boolean
previous_game.is_homecoming                 boolean
previous_game.is_conference_championship    boolean
previous_game.is_celebration_bowl           boolean
```

Fix `venue.city` at parse — it currently returns box-score header text welded
onto the city name. Send city/state only, or `null`.

See Game tagging below for the four boolean fields.

### `next_game` / `season_summary` — mutually exclusive on `season_state`

```
next_game        object | null   present with the shape below only when
                                 season_state == "in_progress" and a game
                                 remains; null in every other case
season_summary   object | null   present only when season_state == "complete";
                                 null in every other case
```

`next_game` shape when present:

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
venue                       object    same shape as previous_game.venue above
broadcast                   string | null
tag                         string    short label, see Game tagging
headline                    string    one sentence, never equal to tag
is_rivalry                  boolean
is_homecoming               boolean
is_conference_championship  boolean
is_celebration_bowl         boolean
```

Return the earliest regular-season game with a date after today. Never return
a spring game or an intrasquad scrimmage as `next_game`.

`season_summary` shape when present:

```
season_summary.state              string    "complete"
season_summary.headline           string
season_summary.record              string    "10-4" — display only
season_summary.wins                integer   REQUIRED — not in the example, same
                                             reasoning as conference_record above
season_summary.losses              integer   REQUIRED
season_summary.conference_record   string    "7-1" — display only
season_summary.conference_wins     integer   REQUIRED
season_summary.conference_losses   integer   REQUIRED
season_summary.division_finish     string
season_summary.avg_par             number
season_summary.games_played        integer
```

### Game tagging — applies to `next_game`, `previous_game`, and Team Schedule

Send `tag` as one short label. Never collapse the four booleans into it.

Derive `is_conference_championship` from the schedule.

Derive `is_celebration_bowl` from `venue.neutral_site_name`.

Return `false` for `is_rivalry` and `is_homecoming` until a curated list
exists. Never return `null` for either.

Send `headline` (and `previous_game.headline` / `review_headline`) as a string
different from `tag`. Never duplicate the two.

### `coach_carousel[]`

Order: head coach first, then coordinators. Send every field below on every
element.

```
coach_carousel[].coach_id             string    PERS_ id
coach_carousel[].name                 string
coach_carousel[].role                 string    "Head Coach" | "Offensive Coordinator" |
                                                "Defensive Coordinator" | position title
coach_carousel[].role_title           string
coach_carousel[].role_group           string    head_coach | coordinator | position_coach.
                                                Same enum as coaching_staff[] on this
                                                same endpoint.
coach_carousel[].image_url            string | null
coach_carousel[].tenure_year          integer | null
coach_carousel[].metric               object | null    null when this coach has no
                                                        measured metric yet (first year,
                                                        no prior season)
coach_carousel[].metric.key                string
coach_carousel[].metric.label              string
coach_carousel[].metric.value              number
coach_carousel[].metric.scope              string    "vs 2024"
coach_carousel[].metric.higher_is_better   boolean
coach_carousel[].metric.is_improvement     boolean
coach_carousel[].metric.direction          string    up | down | flat
```

Send `is_improvement` as the good/bad flag. Send `direction` for display only
(which way the number moved). Never let `direction` imply good or bad — a
metric can go up and be worse (e.g. defensive EPA allowed).

### `unit_carousel`

```
unit_carousel.scope                string    "conference"
unit_carousel.scope_total          integer
unit_carousel.available_units[]    array of strings — REQUIRED single source
                                                       of truth: every unit key
                                                       in slides[] appears here,
                                                       and no key appears here
                                                       that isn't in slides[]
unit_carousel.slides[]              array, ≥2
unit_carousel.slides[].unit          string
unit_carousel.slides[].label         string
unit_carousel.slides[].metrics[]     array, exactly 4
unit_carousel.slides[].metrics[].key                string
unit_carousel.slides[].metrics[].label              string
unit_carousel.slides[].metrics[].value              number
unit_carousel.slides[].metrics[].rank               integer
unit_carousel.slides[].metrics[].total              integer   conference size
                                                              this metric was
                                                              ranked against —
                                                              may be < scope_total
unit_carousel.slides[].metrics[].higher_is_better    boolean
```

Include a unit only when all 4 of its metrics are non-null for this team.
Never send a slide with a `"--"` metric baked in — drop the whole slide from
both `slides[]` and `available_units[]` instead.

State the tie-break rule for two candidates ranked `1` in the same response
(the sample has `pass_touchdowns` and `epa_per_play` both at `rank: 1`, and
`top_stat` picked one). Give the rule: unit priority order, larger magnitude,
or hand-selected.

### `top_stat`

```
top_stat.unit           string
top_stat.key            string
top_stat.label           string
top_stat.value           number
top_stat.rank            integer
top_stat.total           integer
top_stat.display         string    sentence-case, "Passing touchdowns"
top_stat.candidates[]    array, ≥1 — REQUIRED: pre-sorted best-rank-first,
                                    frontend does not re-sort
top_stat.candidates[].unit    string
top_stat.candidates[].key     string
top_stat.candidates[].label   string
top_stat.candidates[].value   number
top_stat.candidates[].rank    integer
```

Rank against the full conference, `/18`. Never rank against division.

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
star_impact.stat_line[]              array    [{label, value}], position-agnostic,
                                              same pattern as the player-page contract
star_impact.profile_url              string    "/player/{person_id}/{season}"
```

Select the player with the highest `game_par` among all players with
production in the most recent completed game. State the tie-break rule. State
whether position affects selection at equal `game_par`.

---

## 2 · Team Schedule

```
GET /api/game-center/team-schedule/{season}/{team_id}
```

```
$.games[].tag                         string
$.games[].headline                    string
$.games[].is_rivalry                  boolean
$.games[].is_homecoming               boolean
$.games[].is_conference_championship  boolean
$.games[].is_celebration_bowl         boolean
$.games[].win_probability             number | null   0.0-1.0, pregame
```

Tagging is identical to Team Hub — same fields, same semantics, one source.

`win_probability` is a **pregame** number derived from opponent-adjusted team
ratings, not the in-game win probability on the play-by-play. It is null for any
season the ratings do not cover, which today means 2026 until the season has
enough games to fit.

---

## 3 · Roster Hub

Two documents, two pages. `3.1` is the league-wide directory (team grid +
league/conference composition — the Rosters Hub landing page). `3.2` is one
team's own roster page (Team Roster Hub / Team Full Roster). Don't collapse
them into one endpoint — the directory needs all 18 teams at once, the team
page needs exactly one and nothing else.

### 3.1 · League Directory

```
GET /api/schools/roster-hub/{season}
```

```
$.year                  integer
$.total_players         integer
$.all                   object    league-wide, same block shape
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

`HYBRID` is a real group — a player the roster lists at two positions across
units. Render it; do not filter it. It is 1–2 players per team.

Send `vs_conference_avg` on every `class_distribution[]` row. The directory's
composition donut shows each class against its conference average
("-15 vs SWAC avg"); don't make the frontend compute conference means from
`3.1`'s own `$.divisions` block to get a number this endpoint already has.

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

`*_coverage` is below `count` on most teams. Compute rates against the coverage
number, not against `count`.

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

`transfer_count` currently undercounts. The number returned is a floor.

### 3.2 · Per-Team Document

```
GET /api/schools/roster-hub/{season}/{team_id}
```

One team, one document — not a slice of `3.1`. Built against
`roster_hub_pvamu_2025_demo.json`; PVAMU/2025 is the only file live today,
copied to `public/data/2-schools/roster_hub_team/2025/swacpvamu.json` so the
frontend has something real to render against while every other team/season
waits on this endpoint.

```
team_id        string
season         integer
roster_size    integer
composition    object    same shape as 3.1's per-team composition block,
                        including vs_conference_avg on class_distribution[]
frame_profile  object    the block below — replaces 3.1's physical.groups
                        buckets, not a rename of it
experience_by_room   object    same shape as 3.1's experience.by_position_group
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

State whether `LINE` / `BOX` / `SKILL` group membership is fixed or can vary
by team. In the PVAMU file, `SKILL` includes QB alongside WR and DB — confirm
that's the intended grouping for every team, not a PVAMU-specific artifact,
since it changes which card a quarterback's frame shows up on.

State whether a fourth tier (or an "unclassified" bucket) covers special
teams. PVAMU's `LINE` + `BOX` + `SKILL` counts sum to 74 of `roster_size: 80`
— the other 6 are the `ST` position group, absent from all three tiers. If
that's deliberate (special teams doesn't fit a body-type tier), say so; if
it's a gap, add the bucket.

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

Two open questions from wiring this page against the PVAMU file — state the
answers in this section rather than leaving them for the frontend to guess a
second time on every other team:

**Geographic.** This document carries `hometown` as one free-text string
("Missouri City, Texas"), not a state code, and there is no `geographic`
block at all. The page's Recruiting Map card currently renders "Geographic
data not available for this team yet" rather than guess a state from that
string. Add `home_state` (two-letter) per player, or a team-level
`geographic` block matching `3.1`'s shape — state which. Until one of those
ships, this card stays empty on every team, not just the ones with thin data.

**Transfers.** `players[].is_transfer` is here, but there is no
`transfer_tier` per player and no team-level `transfers` block (tier
breakdown, per-position transfer rate). The page's Portal Profile card
computes `transfer_rate` / `transfer_count` from `is_transfer` directly — those
two numbers are real — but shows "not available" for where transfers came
from and which position rooms they landed in. Add `transfer_tier` per player
(same enum as `4.1`'s roster: `P4 G5 FCS D2 JUCO HS`), or a team-level
`transfers` block matching `3.1`'s shape — state which.

---

## 4 · Players

Two documents, two pages, same split as §3. `4.1` is the full roster array —
every player, one season, for list/filter/leaderboard pages. `4.2` is one
player's own document — the profile page's bio tab. Don't build `4.2` by
having the frontend `.find()` one player out of `4.1` and a second stats
file — that's exactly the pattern this section replaces.

### 4.1 · Roster

```
GET /api/players/roster/{season}
```

Array of player-seasons. 2010–2026. 1,946 rows for 2025.

```
person_id         string             PERS_00004021   join key, 100% populated
full_name         string
first_name        string
last_name         string
team_id           string
season            integer
jersey_number     integer | null
position          string             fine-grained, 26 values incl. S CB DT K P
                                     LS EDGE STAR ATH FB and slashed pairs
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
```

**Filter and group on `position_group`, not `position`.** `position_group` is the
ten-value enum the roster hub counts against and the one the position dropdown
should use. `position` is the finer label for display on a card — it carries
`S`, `CB`, `DT`, `K`, `P`, `LS`, `EDGE`, `STAR`, `ATH`, `FB` and slashed pairs
like `K/P` and `TE/OL`.

`person_id` is the join key to every other endpoint that names a player.

### 4.2 · Profile (Bio tab)

```
GET /api/players/profile/{season}/{person_id}
```

Key on `person_id`, not name+team. Scope: the Bio & Background tab only —
Season Stats and Advanced Analytics are separate, out of scope here, and are
still `advancedTabMock.js` / a client-side game log on the frontend today.

Send every field below on every document unless marked `optional` or written
as a union with `null`. Send `null` when a value doesn't apply — never omit
the key. Rate fields in this endpoint (`success_rate`, `higher_is_better`
thresholds, etc.) are `0-1` fractions, not the `0-100` scale used in §1's
`header` block — state this once here since the two conventions coexist
across this spec and neither infers the other.

```
$.person_id       string
$.season          integer
$.generated_at     string    ISO 8601 — REQUIRED populated, not null
```

### `identity`

```
identity.person_id        string
identity.first_name       string
identity.last_name        string
identity.team_id          string
identity.team_abbreviation string
identity.conference        string
identity.division           string
identity.jersey_number      integer
identity.position            string    display label, "Quarterback"
identity.position_group      string
identity.raw_position         string
identity.class_year            integer
identity.class_label            string    "Freshman" — REQUIRED, not a bare 1-5.
                                          Four separate frontend files hold
                                          their own {1:"Freshman",...} lookup
                                          today because this doesn't exist.
identity.height                  integer   inches
identity.weight                  integer   pounds
identity.home_city                 string | null
identity.home_state                 string | null
identity.is_in_state                 boolean | null
identity.previous_school              string | null
identity.high_school                    string | null
identity.image_url                       string | null
```

Send `home_city` / `home_state` only. Never also send a combined `hometown`
string — pick one format for the page to render, not two that can disagree.

Send `is_in_state` here, next to `home_city` / `home_state`. Don't split it
into a separate `background` block the page has to re-assemble.

State the hosting policy for `image_url`: an absolute external URL (school
site hotlink, as in the PVAMU sample) or a cached asset path. If hotlinked,
say what the page renders when the school's CMS moves or deletes the image.

### `rating` — replaces `glory`

**This block is a contract change.** The `glory` block in the earlier draft is
gone. `rating.metric` is `"PAR"`. The numbers behind the switch are in
`BACKEND_CHANGE_NOTES.md` §1; the short version is that Glory was fitted for
quarterbacks only — 57 of 1,946 players in 2025 — so the banner was empty for
97% of the roster, and its bands were cut against a scale this conference does
not sit on.

```
rating.metric                  string    always "PAR"
rating.available               boolean
rating.value                     number | null    season PAR
rating.per_game                    number | null
rating.games_played                  integer | null
rating.rank_in_position_group          integer | null
rating.position_group_total              integer | null
rating.conference_rank                     integer | null
rating.conference_total                      integer | null
rating.position_group_mean                     number | null
```

**Render `rank_in_position_group`, not `conference_rank`.** PAR is a volume
stat and it is not position-normalized — a quarterback accumulates far more of
it than a cornerback does. Cameron Peters is `conference_rank 1 of 1054`, which
is true and useless: it says "quarterback", not "good". His
`rank_in_position_group` is `1 of 43`, which is the claim worth putting on a
banner. `conference_total` is sent so the page can show the size of the field,
not so it can rank across positions.

There are no bands and no confidence stars. A rank inside a named group is the
whole claim — nothing is bucketed into WEAK/MID/ELITE against an outside scale.

`position_group_mean` can be negative. PAR is production above a replacement
baseline, so a group whose median player sits below that baseline has a negative
mean; Peters' group mean is `-9.74`. Render negatives as negatives.

Send `available: false` with every other key `null` when a player has no
production. Note the deliberate asymmetry with `games[].par`, which is `0.0` and
never `null`: the bar chart draws a zero-height bar, the rating banner hides.

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
games[].home_away              string    home | away | neutral — REQUIRED,
                                        not in the sample; the readout can't
                                        render "vs" / "@" without it
games[].result                   string
games[].score                      string
games[].data_state                   string    played | no_appearance |
                                              no_play_by_play | not_yet_played
games[].par                            number    0 when data_state isn't "played"
games[].components                       object    {} when data_state isn't "played"
games[].stat_line[]                       array    [{label, value}], position-agnostic —
                                                   same pattern for every position,
                                                   the labels change, the shape doesn't
games[].field_map                           object | null    per-game spatial
                                                             breakdown, see below.
                                                             null whenever
                                                             data_state != "played"
```

The row count is the team's own schedule length, not a fixed 12 — Prairie View
2025 has 14, including a bowl. Count the rows, don't assume them.

Send `not_yet_played` for any game later in the season than the one just
completed — a future game is not the same state as a covered game where the
player didn't appear. This is the one addition to the `data_state` enum
already agreed for this contract.

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
                                                                is attributed to
                                                                a person — known
                                                                gap, not required
                                                                for launch
```

### `field_map` — season, two views

Answering the two asks directly: **per-game `field_map` is pure aggregation and
is now built**, and **a rushing spatial breakdown does exist**. Neither needs new
source data.

`pass_heat_map` and `rush_heat_map` are both on every parsed game — all 10 of
Cameron Peters' covered games carry both. The season grid the page renders today
is a sum of the per-game maps, so shipping them per game is a matter of not
summing them. The season pass grid reconciles exactly against what the page
renders now: 246 attempts / 165 completions / 2,439 yards.

**The two views are different shapes.** Rushing is not an empty state, and it is
not a 3x3 with two rows dropped:

```
passing   3x3   depth x direction   attempts, completions, yards
rushing   1x3           direction   attempts, yards
```

Rushing carries no depth band because the parse does not record one for a carry,
and no `completions` because the field is meaningless on a carry. It is a
three-cell strip, and it is real data.

```
field_map.available              boolean
field_map.views[]                  array     ["passing","rushing"] — the views
                                             this player actually has, in
                                             render order
field_map.depth_bands                object | null   {short,medium,deep} -> the
                                                     yard ranges, for the axis
                                                     labels. Passing only.
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

Depth bands, sent so the axis is labeled from the data rather than hardcoded:

```
short   < 4 yards        medium   4-12 yards        deep   > 12 yards
```

All nine passing cells are always sent, zeros included — a cold zone is
information, and a missing cell collapses the grid. Same for all three rushing
cells.

A player with one view and not the other gets `views: ["passing"]` and
`rushing.available: false` with `cells: null`. `field_map.available` is `false`
only when neither view exists.

### `games[].field_map` — same shape, per game

Identical to the block above minus the season-level wrapper keys:

```
games[].field_map.passing    same object as field_map.passing
games[].field_map.rushing    same object as field_map.rushing
```

`views` and `depth_bands` are not repeated per game — they are constant for the
player, so read them off the season block.

**`null` whenever `data_state != "played"`.** Peters' four `no_play_by_play`
weeks (2, 3, 4 and 9 — non-conference opponents outside the corpus) send
`field_map: null` alongside `par: 0.0` and `stat_line: []`. That is the two-tier
coverage rule, not missing data.

That null matters more than it looks. While building this the backend hit a
loop-variable leak: the per-game map was assigned only inside the "parsed file
exists" branch, so uncovered weeks silently inherited the previous week's map —
week 2 rendered week 1's grid while correctly reporting `no_play_by_play`.
Caught and fixed before the mock shipped, but it is exactly the failure the
frontend was avoiding by refusing to synthesize a grid: a wrong map looks like a
real one. If a week reports `no_play_by_play` and still carries cells, that is a
bug on this side — report it rather than rendering it.

Never send a computed or estimated grid. This block replaces a frontend version
that multiplied season totals by fixed ratios; the real backing data makes that
unnecessary.

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

Send `rank` / `total` (e.g. "2nd of 5"), not a league-wide percentile. Every
number here is pre-computed and pre-ranked — never a raw value the page has
to rank against a roster it also had to fetch.

### `background`

```
background.is_transfer          boolean
background.transfer_tier          string | null
background.previous_school          string | null
background.is_redshirt                boolean
background.redshirt_note                string | null
background.distance_miles                 number | null   populated: 1,771 of
                                                          1,946 players in 2025
background.distance_tier                    string | null   populated, same
                                                            coverage as above
background.experience_score                   number
background.class_timeline[].class               string
background.class_timeline[].is_current            boolean
background.class_timeline[].season                   integer
```

`is_in_state` lives in `identity`, not here — see above. Don't send it in
both places.

---

## 5 · Stats — Team Efficiency

```
GET /api/stats/team-season-avg/{season}
GET /api/stats/team-defense-avg/{season}
GET /api/stats/league-avg/{season}
```

```
$.season        integer
$.generated_at  string
$.teams.{team_id}   (team files)   /   $.rushing $.passing $.defense_impact (league file)
```

### `rushing` and `passing` — the ten keys

```
rushing.successRate       number
rushing.opportunityRate   number
rushing.stuffRate         number
rushing.stopRate          number
rushing.tflRate           number
rushing.powerStopRate     number
passing.completionRate    number
passing.ypa               number
passing.explosiveRate     number
passing.pressureRate      number
```

**Polarity — confirmed, and the frontend's reading is correct.**

Both files are built from the same per-game dict. It is appended to the team
that ran the plays, and to that team's opponent:

| file | subject |
|---|---|
| `team_season_avg[T]` | what **T's offense** did |
| `team_defense_avg[T]` | what **T's defense allowed** |

So in `team_season_avg`, high is good for `successRate` `opportunityRate`
`completionRate` `ypa` `explosiveRate`, and low is good for `stuffRate`
`stopRate` `tflRate` `powerStopRate` `pressureRate`. In `team_defense_avg` every
one of those inverts. Invert the coloring between the two files, as you are
doing now.

`powerStopRate` is named from the defense's side in both files. In
`team_season_avg` it is the rate at which this offense was stopped on a power
down — low is good. The name reads the other way; the value does not.

### `defense_impact`

Present on `team_season_avg` and `league_avg`. **Not** on `team_defense_avg` —
it already describes the team's own defense, so there is nothing to invert.

```
defense_impact.disruptionRate              number
defense_impact.explosivePreventionRate     number
defense_impact.havocRateForced             number
defense_impact.sackRateForced              number
defense_impact.yardsPerPlayAllowed         number
defense_impact.bendDontBreakIndex          number
defense_impact.tflRateForced               number
defense_impact.passDefendedRateForced      number
```

---

## 6 · Stats — Team EPA

```
GET /api/stats/team-epa/{season}
```

```
$.season                              integer
$.adjusted_available                  boolean   false when the ratings do not
                                                cover this season
$.league.epa_per_play                 number
$.league.success_rate                 number
$.league.explosive_rate               number
$.teams.{team_id}.epa_per_play        number
$.teams.{team_id}.success_rate        number
$.teams.{team_id}.explosive_rate      number
$.teams.{team_id}.adj_off_epa         number | null
$.teams.{team_id}.adj_def_epa         number | null
$.teams.{team_id}.raw_off_epa         number | null
$.teams.{team_id}.raw_def_epa         number | null
$.teams.{team_id}.off_games           integer | null
$.teams.{team_id}.def_games           integer | null
```

`adj_off_epa` and `adj_def_epa` are opponent-adjusted, fitted by ridge
regression across the season. They are the right number for ranking teams
against each other — an unadjusted EPA average ranks schedule strength as much
as it ranks teams.

The four `adj_*` / `raw_*` fields and both `*_games` are null when
`adjusted_available` is false. That is 2026 today. `epa_per_play`,
`success_rate` and `explosive_rate` are never null.

The same team-season also carries these, available on request:

```
success_rate_early_down     success_rate_late_down      success_rate_standard_down
success_rate_passing_down   success_rate_goal_to_go     success_rate_two_minute
power_success_rate          stuff_rate                  havoc_rate_forced
havoc_rate_allowed          quality_drive_rate          explosive_drive_rate
negative_drive_rate         red_zone_td_rate            red_zone_opportunities
turnover_luck               two_minute_epa_per_play     two_minute_wpa_per_play
```

Name the ones the page wants and they go into the response.

---

## 7 · Stats — Counting

```
GET /api/stats/season-stats/{season}
```

Array of player-season stat rows. Seasons 2019, 2021–2025.

```
year              integer
team_id           string
player_key        string
name_raw          string             "TEAM" on a team-total row
person_id         string | null      join key to the roster
position          string | null      roster position, joined on person_id
position_group    string | null      DB DL OL WR LB RB TE QB ST HYBRID
stat_category     string             which stat block produced this row:
                                     passing rushing receiving defense returns
rushing_*         integer | number   24 fields
passing_*         integer | number   24 fields
receiving_*       integer | number
defense_*         integer | number
returns_*         integer | number
```

**`stat_category` is not a position.** It says which stat block the row came
from. It is the field previously named `position`, which is why it only ever
held `QB RB WR DEF RET` — nobody in an OL or DB room produces a rushing or
passing line. Real position comes from the roster join and is returned as
`position` / `position_group` above.

`receiving_*`, `defense_*` and `returns_*` do not exist yet. `stat_category`
already names those rows: 1,948 receiving, 5,492 defense, 852 returns.

**Return stats are their own phase.** Kickoff and punt units are neither offense
nor defense in this pipeline, and `returns_*` will follow that. They will not be
folded into `defense_*` to make the table symmetric.

Two known gaps in the returned data:

- `team_id` in 2019 carries the school's record on four rows —
  `"HOW(3) (1-9 , 1-5)"`, `"Mississippi Val. (2-6 , 1-3)"`,
  `"SC State (6-3 , 4-2)"`, `"Texas Southern (0-8 , 0-4)"`. 2021–2025 are clean.
- `name_raw == "TEAM"` rows are incomplete: 2023 has 17, 2024 has 16, 2025 has
  13, of 18.

---

## 8 · Stats — Player Production

```
GET /api/stats/player-production/{season}
```

Currently 2025 only.

```
$.season                                        integer
$.player_count                                  integer
$.enriched_count                                integer
$.person_matched_count                          integer
$.match_rate                                    number
$.players.{player_key}.person_id                string | null   91.2% populated
$.players.{player_key}.player_key               string
$.players.{player_key}.name_raw                 string
$.players.{player_key}.name_display             string
$.players.{player_key}.team                     string
$.players.{player_key}.position                 string
$.players.{player_key}.position_group           string
$.players.{player_key}.position_assumed         boolean
$.players.{player_key}.total_production         number
$.players.{player_key}.avg_production           number
$.players.{player_key}.par                      number
$.players.{player_key}.games_played             integer
$.players.{player_key}.season_components        object   metric -> number
$.players.{player_key}.games[].game_id          string
$.players.{player_key}.games[].total            number
$.players.{player_key}.games[].components       object   metric -> number
$.players.{player_key}.class_year               string
$.players.{player_key}.jersey_number            string
$.players.{player_key}.height                   integer | null
$.players.{player_key}.weight                   integer | null
$.players.{player_key}.bmi                      number | null
$.players.{player_key}.body_type                string | null
$.players.{player_key}.home_state               string | null
$.players.{player_key}.is_transfer              boolean
$.players.{player_key}.transfer_tier            string | null
$.players.{player_key}.experience_score         number
```

**There are no headshots on this endpoint.** `image_url` is present and empty on
all 1,054 rows. Headshots come from `/api/players/roster/{season}`, joined on
`person_id`, at 98.9%.

The rows with a null `person_id` are stat lines that did not resolve to a roster
person — mostly opponent players in non-conference games, plus two name defects
the parser is being fixed for: a suffix case (`"Murray Jr,Quinton"`) and stat
text welded into a name (`"Thompson,Darmarcus QB hurried"`).

---

## 9 · Schools Directory

```
GET /api/schools/teams
```

```
$.generated_at              string
$.current_program_count     integer
$.teams[].team_id           string     join key for every other endpoint
$.teams[].school_name       string     "Delaware State University"
$.teams[].short_name        string     "Del State"
$.teams[].abbreviation      string     "DSU"
$.teams[].conference        string     MEAC | SWAC
$.teams[].division          string | null
$.teams[].is_current_program boolean
```

Colors and logos are not on this endpoint. The backend returns identity and
conference membership; branding assets stay a frontend concern.

`team_id` is the only key that joins the backend. If the bundled frontend
`teams.json` is being used for this page, join through whichever of its fields
carries the backend key — the two tables do not otherwise share one, and
reconciling them is scheduled after launch.

---

## 10 · Game Page

Under construction. Endpoint and response shape to follow.

```
GET /api/game-center/game/{game_path_id}
GET /api/game-center/games-index
```

---

## 11 · What is published

The published bundle at `93-FE Docs/` is the contract. The manifest at
`93-FE Docs/manifest.json` is its inventory: `pages[]` gives request string,
path template, and the seasons present for each. Anything not in the manifest is
not a contract, whatever a bundled copy in the frontend repo contains.

Endpoints 1, 3, 4, 6, 7 and 8 are being added to that bundle. Until they land,
any local copy of those files is a snapshot of unknown age.
