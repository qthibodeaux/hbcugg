# Game Center Fetch Contract

**Last updated:** 2026-08-26
**Scope:** every page under `/game-center/*`

Request path and response **schema** per page. All requests are static JSON files under `/data/1-game center/current_exports/` (`fetchJson(path)`), not a REST API.

**These are type contracts, not example payloads.** Every response block below lists field names and types only — no team, score, or date is ever specified here, because none is required. The backend decides which games, teams, and values populate a response; this document only fixes the keys, their types, and which are nullable. Full rationale, layouts, and open items live in each page's own design doc, linked per section.

**Notation:** `string` `integer` `number` `boolean` — plain types. `T | null` — nullable. `T[]` — array of `T`. `"a" | "b"` — the field's value is always exactly one of these literal strings. `{ ... }` — an inline object shape. A `v5 id` is the team id format used everywhere (`swacjsu`, never `jsu` or `swacjsu25`).

---

## Game Center Hub

**Route:** `/game-center`

**Request**
```
/data/1-game center/current_exports/hub/game_center_hub_{season}.json
```

**Response**
```text
{
  season: integer
  current_week: integer
  week_label: string
  snapshot_date: string (ISO 8601)

  featured_games: [4]{                        // exactly 4, pre-ranked, slot order
    game_id: string
    game_path_id: string
    route: string
    slot: integer                             // 1-4, display order
    status: "preview" | "final"
    status_label: string
    date_label: string
    kickoff_label: string
    stage_label: string
    conference_game: boolean
    away_team: {
      team_id: string (v5 id)
      short_name: string
      name: string
      score: integer | null
      record: string                          // point-in-time, not season total
    }
    home_team: { same shape as away_team }
    winner_team_id: string | null             // null on previews
    supporting_line: string | null

    why_score: number                         // context engine's ranking score for this pick
    why_reasons: string[]                     // record, expected competitiveness, result quality, stakes - see Hub doc section 4
  }

  results_season: integer                     // season the rail actually reflects - see results_source below
  results_source: "current_season" | "prior_season_fallback"

  recent_results_rail: [5-6]{                  // finals, newest first
    game_id: string
    game_path_id: string
    route: string
    date_label: string
    stage_label: string
    away_team: {
      team_id: string (v5 id)
      short_name: string
      score: integer
      record: string
      by_quarter: integer[4+]                 // OT appends entries; never null on a final
    }
    home_team: { same shape as away_team }
    winner_team_id: string
    summary: string
  }

  standings: {
    swac_west: { title: string, metric: "conference" | "overall", rows: [3]{
      team_id: string (v5 id)
      rank: integer
      record: string
      conference_record: string
      is_leader: boolean
    }}
    swac_east: { same shape as swac_west }
    meac: { same shape as swac_west }
  }

  context_cards: [5]{                          // context engine output - same why_score/why_reasons pattern as featured_games
    card_id: string
    card_type: string                         // ScheduleHeadlineCard | UpcomingStretchCard | TeamFormCard | RecordSplitCard - see Hub doc section 4
    title: string
    why_score: number
    why_reasons: string[]
    payload: {}                               // shape depends on card_type - see Hub doc section 4
  }
}
```

| Field | Rule |
|---|---|
| `featured_games` | Exactly 4, pre-ranked, `slot` 1-4 in display order. May mix upcoming and already-played games — the context engine ranks both pools together |
| `featured_games[].why_score` / `.why_reasons` | Same ranking mechanism as `context_cards` — one context engine, two candidate pools |
| `results_season` / `results_source` | During week 0 / preseason, when the current season has no finals yet, the rail falls back to the prior season's real results. `results_source` tells the frontend to relabel the rail rather than imply these are current-season games |
| `recent_results_rail` | 5-6 finals, newest first |
| `by_quarter` | Always 4+ entries; OT appends. Never null on a final |
| `record` | Point-in-time — the team's record as of that game, not the season total |
| `standings.*.metric` | Tells the card which record to show |
| `standings.*.rows` | Exactly 3, pre-sorted, `rank` assigned |
| `winner_team_id` | `null` on previews; set on every final |
| `context_cards` | Exactly 5, pre-ranked, in display order. Backend scores every candidate across every `card_type` and returns only the top 5 |
| Team identity | Only `team_id` is required — logo and colors join locally |

Full doc: [Game Center Hub Design Doc.md](./Game%20Center%20Hub%20Design%20Doc.md)

---

## Week Central

**Route:** `/game-center/week`

**Request**
```
/data/1-game center/current_exports/week_central/{season}/{week}.json
```

**Response**
```text
{
  season: integer
  week: integer
  label: string
  compact_label: string
  date_range: string
  is_current_week: boolean
  updated_at: string (ISO 8601)

  weeks: []{                                   // every week in the season; rides along on every response
    week: integer
    label: string
    compact_label: string
    game_count: integer                       // 0 marks a week with nothing to show
  }

  summary: {
    total_games: integer
    hbcu_matchups: integer
    outside_games: integer
    final_games: integer
    preview_games: integer
  }

  games: []{                                   // pre-sorted; sort_order is the tiebreak
    game_id: string
    game_path_id: string
    route: string
    has_detail_page: boolean

    status: "preview" | "final"
    status_label: string
    date: string (ISO date)
    date_label: string
    kickoff_label: string
    tv: string | null

    is_covered_matchup: boolean                // true only when BOTH teams are among our 18
    tag: string
    story_label: string
    conference_game: boolean
    bowl_game: boolean
    sort_order: integer

    away_team: {
      team_id: string (v5 id)
      name: string
      short_name: string
      score: integer | null
      record: string
      conference_record: string
    }
    home_team: { same shape as away_team }     // both sides always populated - see cross-page rule 2
    winner_team_id: string | null

    venue: {
      stadium: string
      venue_label: string                     // pre-shortened for the row
      city: string
      neutral_site_name: string | null
    }

    brief: {}                                  // see Week Central doc section 5 for the full shape
  }
}
```

| Field | Rule |
|---|---|
| `weeks[]` | Rides along in every response so the week selector never needs a second request |
| `weeks[].game_count` | `0` marks a week with nothing to show — selector disables it instead of letting the user land on a dead page |
| `is_covered_matchup` | **Backend-owned — the frontend does not compute it and carries no fallback.** Drives the slate filter |
| `away_team` / `home_team` | **Both always populated.** Never a null side with no text — including neutral-site games |
| `record` | Point-in-time — the team's record entering that game, not the season total |
| `sort_order` | Tiebreak if anything re-sorts the pre-sorted `games[]` |
| `has_detail_page` | Whether `/game/{game_path_id}` has a parsed file behind it |
| `venue_label` | Pre-shortened. The frontend does not truncate |
| Team identity | Only `team_id` is required — logo and colors join locally |

Full doc: [Week Central Design Doc.md](./Week%20Central%20Design%20Doc.md)

---

## Conference Slate

**Route:** `/game-center/conferenceslate`

**Request**
```
/data/1-game center/current_exports/slate/conference_slate_{season}.json
```

**Response**
```text
{
  season: integer
  generated_at: string (ISO 8601)

  axes: {
    meac:      { label: string, conference: string, team_ids: string[] (v5 ids, ordered) }
    swac_east: { same shape as meac }
    swac_west: { same shape as meac }
  }

  matchups: []{
    matchup_id: string
    division_scope: "meac" | "swac_east" | "swac_west"   // matches an axes key
    game_type: "regular_conference" | "championship" | "bowl"

    status: "final" | "scheduled"                        // sent, never inferred from a winner
    status_label: string
    date: string (ISO date)
    date_label: string
    week: integer

    away_team_id: string (v5 id)                         // true side, never team_a/team_b
    home_team_id: string (v5 id)
    away_score: integer | null
    home_score: integer | null
    winner_team_id: string | null
    score_display: string                                // display text only — never parsed back into numbers

    game_path_id: string
    route: string
    has_game_page: boolean

    warnings: string[]
  }

  special_games: []                                       // championship/bowl games, classified separately

  data_quality: {
    score_mismatches: []
    warnings: []
  }
}
```

| Field | Rule |
|---|---|
| `axes` | **The matrix rows and columns come from here.** Not from a frontend constant |
| `axes.*.team_ids` | Ordered as they should appear on both axes |
| `away_team_id` / `home_team_id` | True sides. Never `team_a` / `team_b` |
| `away_score` / `home_score` | Real numbers. `null` on an unplayed matchup |
| `score_display` | Display text only. **Never a data source** |
| `status` | Sent, not inferred from whether a winner exists |
| `winner_team_id` | Drives cell coloring. `null` when not final |
| `has_game_page` | Whether the cell links. `route` is ready to use when true |
| Missing matchup | Simply absent from `matchups[]`. The cell renders empty |

Full doc: [Conference Slate Design Doc.md](./Conference%20Slate%20Design%20Doc.md)

---

## Season Schedule

**Route:** `/game-center/seasonschedule`

**Request**
```
/data/1-game center/current_exports/schedule_board/{season}/{group}.json
```

**Response**
```text
{
  season: integer
  group: "swac_east" | "swac_west" | "meac"
  generated_at: string (ISO 8601)

  division: {
    label: string
    conference: string
    accent: string (hex color)
    team_ids: string[] (v5 ids, ordered)      // the board's columns come from here
  }

  weeks: []{                                   // the board's rows come from here
    week: integer
    label: string
    date_range: string
  }

  teams: []{
    team_id: string (v5 id)
    record: string
    conference_record: string
  }

  cells: []{                                    // flat; frontend keys by [team_id][week]
    week: integer
    team_id: string (v5 id)

    status: "final" | "scheduled"
    date: string (ISO date)
    date_label: string

    opponent_id: string | null                 // null only when the opponent is not one of our 18
    opponent_name: string                      // always present
    opponent_short: string                     // always present

    home_away: "home" | "away"
    neutral_site: boolean

    is_covered_matchup: boolean
    conference_game: boolean                   // separate from is_covered_matchup - drives the NC badge only
    game_type: string

    result: "W" | "L" | null
    score_team: integer | null
    score_opp: integer | null
    display_score: string                      // never parsed back into numbers
    winner_team_id: string | null

    game_id: string
    game_path_id: string
    route: string
    has_game_page: boolean
  }
  // a bye week is simply no cell for that [team_id, week] pair

  data_quality: { warnings: [] }
}
```

| Field | Rule |
|---|---|
| `division.team_ids` | **The board's columns come from here**, in display order. Not from a frontend constant |
| `weeks[]` | **The board's rows come from here.** Backend owns which weeks exist and what they're called |
| `cells[]` | Flat array. The frontend keys it by `[team_id][week]` — no derivation, just indexing |
| `opponent_id` | Required whenever the opponent is one of our 18. Never make the frontend match on name |
| `opponent_name` / `opponent_short` | **Always present**, even for our own teams, so a cell can render before any local join |
| `is_covered_matchup` | **Backend-owned — the frontend does not compute it and carries no fallback.** Drives the filter |
| `conference_game` | Drives the `NC` badge only — not a filter |
| `display_score` | Display text. Never parsed back into numbers |
| A bye week | Simply no cell for that `[team_id, week]` pair. The cell renders blank |

Full doc: [Season Schedule Design Doc.md](./Season%20Schedule%20Design%20Doc.md)

---

## Team Schedules

**Route:** `/game-center/team`

**Request**
```
/data/1-game center/current_exports/team_schedules/{season}/{team_id}.json
```

**Response**
```text
{
  season: integer
  team_id: string (v5 id)                      // matches the request
  generated_at: string (ISO 8601)

  team: {
    team_id: string (v5 id)
    name: string
    short_name: string
    conference: string
    division: string
    division_label: string                     // display-ready, e.g. "SWAC East"
    record: string
    conference_record: string
    division_record: string
  }

  summary: {
    games: integer
    final_games: integer
    upcoming_games: integer
    home_games: integer
    away_games: integer
    neutral_games: integer
    conference_games: integer
    games_with_recap: integer
  }

  games: []{                                    // pre-sorted by date
    game_id: string
    game_path_id: string
    route: string
    has_recap: boolean

    status: "final" | "scheduled"
    status_label: string
    date: string (ISO date)
    date_label: string
    week: integer
    week_label: string
    kickoff_label: string

    opponent: {
      team_id: string | null                    // null only when not one of our 18
      name: string
      short_name: string
      display_short: string                     // always present - the only identity for outside opponents
      opponent_class: "covered" | "hbcu_external" | "non_hbcu"
    }

    home_away: "home" | "away"
    neutral_site: boolean
    venue: {
      stadium_name: string
      venue_label: string                       // pre-shortened
      city: string
      neutral_site_name: string | null
    }

    is_covered_matchup: boolean
    conference_scope: "conference" | "non_conference"
    division_scope: "division" | "cross_division" | "not_applicable"
    game_type: string
    event: { kind: "classic" | "homecoming", name: string } | null

    result: "W" | "L" | null                    // from the selected team's perspective
    team_score: integer | null
    opponent_score: integer | null
    display_score: string
    winner_team_id: string | null
  }
}
```

| Field | Rule |
|---|---|
| `team.division_label` | Display-ready, not the export-shaped lowercase form |
| `games[]` | Pre-sorted by date. The frontend splits into results/upcoming on `status` |
| `opponent.display_short` | **Always present.** For outside opponents this is the only identity a row has |
| `venue.venue_label` | Pre-shortened for the row. The frontend does not truncate |
| `venue.city` / `stadium_name` | Split fields — one mixed string forces the row to guess |
| `result` / `team_score` / `opponent_score` | Selected team's perspective throughout |
| `has_recap` | Whether the row links to `/game/{game_path_id}` |
| Classification block | Five fields, all backend-owned — see [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md) |

Full doc: [Team Schedules Design Doc.md](./Team%20Schedules%20Design%20Doc.md)

---

## Standings

**Route:** `/game-center/standings`

**Request**
```
/data/1-game center/current_exports/standings_race/standings_race_{season}.json
```

**Response**
```text
{
  season: integer
  generated_at: string (ISO 8601)
  as_of_week: integer                           // what the table reflects, so a stale export is visible

  rules: { tiebreaker_summary: string }

  context_cards: [3-4]{                          // KPI slot 1 rotation - see Standings doc section 5
    label: string
    value: string
    sub: string
    accent: string (hex color)
  }

  summary_cards: []{
    label: string
    value: string
    sub: string
    team_id: string (v5 id)
  }

  groups: {
    swac_east: {
      id: string
      label: string
      conference: string
      division: string
      completed_games: integer
      remaining_games: integer
      scenario_count: integer
      unresolved_tiebreakers: []

      standings: []{                            // pre-sorted, rank assigned - frontend never sorts
        team_id: string (v5 id)
        rank: integer
        clinched: "division" | "conference" | "playoff" | null

        record: string
        conference_record: string
        division_record: string
        wins: integer
        losses: integer
        conf_wins: integer
        conf_losses: integer
        win_pct: number (0-1)
        conf_win_pct: number (0-1)

        points_for: integer
        points_against: integer
        point_differential: integer             // direct field - never make the frontend subtract

        games_back: number
        last5: string (5 chars, oldest to newest, "W"/"L"/"-")
        streak: string                          // e.g. "W2", "L1", "-"

        epa_per_play: number
        epa_rank: integer
        epa_combined: number                    // drives the Power Rankings board

        tiebreaker_trace: []
        tiebreaker_status: string
      }

      finish_matrix: []{
        team_id: string (v5 id)
        probabilities: number[] (one per finish position, 1st to last, sums to 1.0)
      }
    }
    swac_west: { same shape as swac_east }
    meac: { same shape as swac_east }
  }
}
```

| Field | Rule |
|---|---|
| `groups.*.standings[]` | **Pre-sorted, `rank` assigned.** The frontend never sorts or breaks ties |
| `last5` / `streak` | Backend-computed |
| `games_back` | Backend-computed against the group leader |
| `point_differential` | Direct field. Never make the frontend subtract |
| `epa_combined` | Drives the Power Rankings board — see Standings doc section 4 |
| `finish_matrix[].probabilities` | One entry per finish position, ordered 1st→last, summing to 1.0 |
| `context_cards[]` | 3-4 rotation items for KPI slot 1 — see Standings doc section 5 |
| `summary_cards[]` | Card-ready. The frontend does not pick leaders out of the standings |

Full doc: [Standings Design Doc.md](./Standings%20Design%20Doc.md)

---

## Games Hub

**Route:** `/game-center/games`

**Request**
```
/data/1-game center/current_exports/games_hub/games_hub_{season}.json
```

**Response**
```text
{
  season: integer
  generated_at: string (ISO 8601)

  summary: {
    games: integer
    final_games: integer
    scheduled_games: integer
    games_with_recap: integer
  }

  weeks: []{ week: integer, label: string, game_count: integer }

  story_cards: []{                               // pre-ranked, in display order - frontend never sorts
    card_id: string
    slot: "cover" | "wild_finish" | "statement" | "look_ahead"
    rank: integer
    why_score: number
    why_reasons: string[]
    headline: string                             // backend-authored - never composed from scores
    supporting_line: string

    game_id: string
    game_path_id: string
    route: string
    has_recap: boolean

    status: "final" | "scheduled"
    date_label: string
    week: integer
    week_label: string

    away_team: { team_id: string (v5 id), short_name: string, score: integer }
    home_team: { same shape as away_team }
    winner_team_id: string | null

    is_covered_matchup: boolean
    conference_scope: string
    division_scope: string
    game_type: string
    event: { kind: string, name: string } | null
  }

  stat_carousel: []{
    card_id: string
    label: string
    value: string
    unit: string
    player_id: string | null
    player_name: string
    team_id: string (v5 id)
    route: string
  }
}
```

| Field | Rule |
|---|---|
| `story_cards[]` | **Pre-ranked, in display order.** The frontend never sorts by margin or anything else |
| `why_score` / `why_reasons` | The Why Engine's ranking and its stated reasons |
| `headline` / `supporting_line` | **Backend-authored copy.** The frontend never composes narrative from scores |
| `weeks[]` | Drives the week filter without deriving it from the game list |
| Classification block | Standard five fields — see [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md) |
| `stat_carousel[]` | Pre-selected highlights, each linking back to its game |

**This page is hidden for launch.0** — the contract above is the target shape; nothing here ships until the Why Engine exists. Full doc: [Games Hub Design Doc.md](./Games%20Hub%20Design%20Doc.md)

---

## Game Page

**Route:** `/game/:gameId`

**Request** (multi-step — index lookup, then game file)
```text
1. GET /data/1-game center/games/index.json
2. Match gameId -> { season, game_stem }
3. GET /data/1-game center/games/{season}/{game_stem}.json
```

Full contract: [Game Page Fetch Contract.md](./Game%20Page%20Fetch%20Contract.md) — response schema per tab. Design: [Game Page Design Doc.md](./Game%20Page%20Design%20Doc.md).

---

## Cross-page rules

1. `team_id` fields are v5 ids (`swacjsu`). Non-HBCU opponents: `team_id: null` + required `name`/`opponent_name`/`display_short`.
2. Both sides of every game are resolved — `team_id` or display text, never a null side with no text, neutral-site included.
3. Scores are direct numeric fields. Never parse `display_score` to recover `home_score`/`away_score`.
4. `queryKey` must include every param the request is scoped by (e.g. `["week-central", season, week]`, `["team-schedule", season, teamId]`).
5. Classification fields (`opponent_class`, `is_covered_matchup`, `conference_scope`, `division_scope`, `game_type`, `event`) ship on every game object that any page filters by. See [Game Classification Vocabulary.md](./Game%20Classification%20Vocabulary.md).
6. Game-page link flag: standardize on `has_game_page` (not `has_detail_page` / `has_recap` / `has_parsed_game`), paired with `game_path_id` and `route`.
7. League structure (conference/division membership) is backend-owned — `axes`, `division.team_ids`, `groups`. `teams.json` is visual identity only (logos/colors/names), never structure.
