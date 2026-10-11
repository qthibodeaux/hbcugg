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
