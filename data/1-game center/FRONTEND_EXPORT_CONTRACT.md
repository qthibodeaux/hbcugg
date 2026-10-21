# Game Center Frontend Export Contract

Last updated: 2026-04-25

This folder contains frontend-ready JSON payloads for the Game Center experience. The frontend should consume these files directly and should not need to read backend parser outputs.

All paths below are relative to:

```text
92-frontend/1-game center/
```

Clean frontend handoff bundle:

```text
92-frontend/1-game center/current_exports/
```

Frontend implementation should prefer `current_exports/` unless actively debugging builder output. The sibling folders under `1-game center/` remain the working export root.

## Build Command

Run the full export with:

```bash
python 92-frontend/tools/build_game_center_payloads.py
```

Validate the generated payloads with:

```bash
python 92-frontend/tools/validate_game_center_payloads.py
```

Current validation output:

```text
validation_report.json -> status: ok
```

## Seasons

Most payloads are generated per season:

```text
{payload_name}_{season}.json
```

The current export includes historical seasons plus `2025` and partial `2026` schedule data. Frontend routes should request a season-specific file and handle empty arrays.

## Shared Object Shapes

### Team Object

Used across cards, standings, cells, and schedules.

```json
{
  "team_id": "swacjsu",
  "name": "Jackson State",
  "short_name": "J-State",
  "abbreviation": "JKST",
  "nickname": "Tigers",
  "colors": {
    "primary": "#002147",
    "secondary": "#FFFFFF"
  }
}
```

For non-corpus opponents, the object is still stable:

```json
{
  "team_id": null,
  "name": "Delaware",
  "short_name": "Delaware",
  "abbreviation": null,
  "nickname": null,
  "colors": {}
}
```

### Game Card Object

Used by team schedules, games hub, schedule board game lists, and similar views.

```json
{
  "game_id": "NCCUSU23082025",
  "game_path_id": "W0nccusu",
  "route": "/game/W0nccusu",
  "date": "2025-08-23",
  "week": 0,
  "week_label": "Week 0",
  "status": "final",
  "game_type": "regular_conference",
  "division_scope": null,
  "home_team": {},
  "away_team": {},
  "team": {},
  "opponent": {},
  "home_score": 14,
  "away_score": 31,
  "team_score": 31,
  "opponent_score": 14,
  "winner_team_id": "meacnccu",
  "venue": "Atlanta, Georgia (Center Parc Stadium)",
  "home_away": "home",
  "score_authority": "game_file",
  "score_mismatch": false,
  "has_parsed_game": true
}
```

Important implementation notes:

- `game_id` is always present.
- `game_path_id` is only present when a parsed game file exists.
- `route` is only present when `game_path_id` is present.
- `home_team` or `away_team` can be `null` for non-corpus games where only one side is known.
- `team` and `opponent` are always stable render objects.
- Use `score_authority` and `score_mismatch` to display confidence or warnings.

## Payload 1: Individual Game Files

Path:

```text
games/{season}/{game_path_id}.json
```

Index:

```text
games/index.json
```

Purpose:

- Full game detail pages.
- Box score, metadata, team advanced stats, play/drive sections where available.

Frontend usage:

- Build links with `route: /game/{game_path_id}` from other payloads.
- Load the game page from `games/{season}/{game_path_id}.json`.
- Use `games/index.json` for lightweight route lookup and metadata.

Key fields:

- `_schema`
- `_source_game_file`
- `metadata`
- `team_box`
- `advanced_team`
- `scoring_summary`

Known nullable areas:

- `scoring_summary` can be empty.
- Weather, temperature, and some attendance fields can be null.
- Older games may have thinner advanced data.

## Payload 2: Game Center Hub

Path:

```text
hub/game_center_hub_{season}.json
```

Purpose:

- Main Game Center landing state.
- Featured games, recent results rail, and compact standings preview.

Key fields:

- `year`
- `snapshot_date`
- `banner`
- `featured_games`
- `recent_results_rail`
- `standings`
- `dynamic_candidates`
- `selected_dynamic_cards`

Implementation notes:

- `dynamic_candidates` and `selected_dynamic_cards` are intentionally empty until Why Engine card logic is ready.
- Historical seasons before parsed frontend games may have empty `featured_games` and `recent_results_rail`.

## Payload 3: Week Central

Path:

```text
week_central/week_central_{season}.json
```

Purpose:

- Weekly schedule/results view.
- Week tabs, weekly KPIs, game cards, and week summaries.

Key fields:

- `season`
- `default_week`
- `updated_at`
- `weeks[]`

Each week contains:

- `week`
- `label`
- `date_range`
- `is_current`
- `kpis[]`
- `summary`
- `games[]`

Implementation notes:

- `default_week` is the recommended initial selected tab.
- `is_current` is a simple data-driven marker and can be overridden by frontend date logic if needed.
- `excitement_index`, `wpa_swing`, `why_tags`, and `story_label` are placeholders until advanced story selection is finalized.

## Payload 4: Conference Slate

Path:

```text
slate/conference_slate_{season}.json
```

Purpose:

- Conference matchup matrix and season slate.
- Deduped same-conference matchups.
- Special games such as Celebration Bowl or SWAC Championship when confidently classified.

Key fields:

- `season`
- `generated_at`
- `teams`
- `matchups[]`
- `special_games[]`
- `data_quality`

Each matchup contains:

- `date`
- `week`
- `week_label`
- `team_a_id`
- `team_b_id`
- `venue`
- `venue_type`
- `status`
- `score_display`
- `division_scope`

Implementation notes:

- `team_a_id` and `team_b_id` are sorted canonical IDs, not home/away.
- Use individual game or schedule payloads if the UI needs team perspective.
- `score_display` is schedule-row display level and should not be used as canonical box-score authority.

## Payload 5: Season Schedule Board

Path:

```text
schedule_board/season_schedule_board_{season}.json
```

Purpose:

- Weekly grid view with teams as rows and weeks as columns.
- Designed for dense schedule-board UI.

Key fields:

- `season`
- `generated_at`
- `teams[]`
- `weeks[]`
- `data_quality`

Each week contains:

- `week`
- `label`
- `summary`
- `games[]`
- `cells[]`

Each cell contains:

- `cell_id`
- `team_id`
- `team`
- `state`: `idle`, `scheduled`, or `final`
- `game_id`
- `game_path_id`
- `route`
- `date`
- `opponent`
- `home_away`
- `game_type`
- `result`
- `score`
- `has_parsed_game`
- `score_mismatch`
- `score_authority`
- `venue`

Implementation notes:

- Render `idle` cells as empty/byes.
- If `route` is null, do not link the cell to a game page.
- Use `score_mismatch` to display a small warning marker.

## Payload 6: Team Schedules

Path:

```text
team_schedules/team_schedules_{season}.json
```

Purpose:

- Team-specific schedule pages.
- Records, home/away breakdowns, and per-team game cards.

Key fields:

- `season`
- `generated_at`
- `team_count`
- `teams[]`

Each team schedule contains:

- `team`
- `conference`
- `division`
- `record`
- `conference_record`
- `division_record`
- `summary`
- `games[]`

Implementation notes:

- `games[]` uses the shared Game Card Object.
- Non-corpus opponents are still renderable through the stable `opponent` object.
- Parsed game routes only exist when `has_parsed_game` is true.

## Payload 7: Standings Race

Path:

```text
standings_race/standings_race_{season}.json
```

Purpose:

- SWAC East, SWAC West, and MEAC standings.
- Includes data-backed tiebreaker traces.

Key fields:

- `season`
- `generated_at`
- `rules`
- `groups`

Groups:

- `swac_east`
- `swac_west`
- `meac`

Each standings row contains:

- `team_id`
- `team`
- `rank`
- `record`
- `conference_record`
- `division_record`
- `wins`
- `losses`
- `conf_wins`
- `conf_losses`
- `division_wins`
- `division_losses`
- `win_pct`
- `conf_win_pct`
- `division_win_pct`
- `games_back`
- `tiebreaker_status`
- `tiebreaker_trace[]`

Tiebreaker statuses:

- `clear`: no tie at this ranking level.
- `resolved_by_head_to_head`: available head-to-head data breaks the tie.
- `resolved_by_available_rules`: available SWAC data-backed rules break the tie.
- `manual_review_needed`: official rules require outside data or human confirmation.

Implementation notes:

- SWAC and MEAC official rules include some outside-data steps. Those are surfaced in `rules.manual_review_if_needed`.
- Do not hide tied teams just because the final official tiebreaker is not computable from local data.

## Payload 8: Games Hub

Path:

```text
games_hub/games_hub_{season}.json
```

Purpose:

- Broad searchable/browsable game-card feed.
- Story-card list and lightweight stat carousel.

Key fields:

- `season`
- `generated_at`
- `summary`
- `story_cards[]`
- `stat_carousel[]`

Story cards use the shared Game Card Object plus:

- `story_label`
- `attendance`
- `kickoff_time`

Stat carousel entries contain:

- `game_id`
- `game_path_id`
- `date`
- `items[]`

Implementation notes:

- `story_label` is rule-based for now, not Why Engine generated.
- `stat_carousel` is limited and should be treated as a highlight strip, not a complete stats table.

## Supporting Files

### Enriched Schedules

Path:

```text
schedules/enriched/{season}.json
```

Purpose:

- Intermediate frontend-ready schedule rows with week, game classification, parsed-game linkage, and score authority.
- Useful for debugging or secondary UI needs.

### Score Mismatches

Path:

```text
score_mismatches.json
```

Purpose:

- Lists schedule-vs-parsed score disagreements.
- This file is intentionally surfaced for data QA.

Implementation notes:

- Do not use this file to render normal user-facing scores.
- Use it for warning badges, internal QA panels, or admin review.

### Week Assignments

Path:

```text
week_assignments.json
```

Purpose:

- Dynamic week assignment for parsed games.
- Week 0 means games before the Labor Day week boundary.

### Export Summary

Path:

```text
export_summary.json
```

Purpose:

- Shows which builder modules ran successfully.

### Validation Report

Path:

```text
validation_report.json
```

Purpose:

- Confirms expected payload files exist.
- Includes stricter 2025 render-shape checks.

## Data Quality Flags

### `score_authority`

Possible values:

- `game_file`: parsed game file is the score source.
- `schedule`: schedule row is the score source.
- `conflict`: schedule and parsed game disagree.

### `score_mismatch`

Boolean. If true, show a data-quality warning or route to an internal review affordance.

### `has_parsed_game`

Boolean. If false, no game detail page is available.

### `route`

Use only when non-null.

## Frontend Implementation Rules

- Prefer `game_id` for React keys.
- Prefer `game_path_id` for game detail file loading.
- Only link to a game page when `route` is non-null.
- Use `team` and `opponent` for team-perspective cards.
- Use `home_team` and `away_team` only when rendering box-score style layouts.
- Treat `home_team` and `away_team` as nullable.
- Treat `score_mismatch=true` as visible QA state.
- Do not infer conference/division membership in the frontend; use exported fields.
- Do not recompute standings in the frontend; use `standings_race`.

## Known Current Limitations

- Why Engine-driven dynamic cards are not populated yet.
- Some older seasons have thinner parsed game coverage.
- Some non-corpus opponents lack colors, abbreviations, or parsed game pages.
- Official standings tiebreakers can require outside data; unresolved steps are explicitly marked.
- `score_mismatches.json` still needs a separate QA pass before removing or downgrading warnings.
