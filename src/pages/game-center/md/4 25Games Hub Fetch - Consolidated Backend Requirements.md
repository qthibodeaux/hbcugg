# Game Center Hubs - Consolidated Frontend Fetch Contracts

**Last updated:** 2026-05-03  
**Scope:** Game Center Hub, Games Hub, Week Central, Conference Slate, Season Schedule, Team Schedules, Standings, Game Page.

This document is the cross-page index. The page-specific design docs in this folder are the authoritative inventories for each hub.

---

## Current Export Base

All Game Center hub contracts should use:

```text
/data/1-game center/current_exports
```

Shared helper:

```js
// src/utils/gameCenterPayloads.js
export const GAME_CENTER_EXPORT_BASE = "/data/1-game center/current_exports";
```

---

## Current Frontend Fetch Table

| Hub | Route | Production file/component | Current fetch path |
|---|---|---|---|
| Game Center Hub | `/game-center` | `GameCenterPage.js` | `/data/1-game center/current_exports/hub/game_center_hub_{season}.json` |
| Games Hub | `/game-center/games` | `GamesHubPage.js` | `/data/1-game center/current_exports/games_hub/games_hub_{season}.json` |
| Week Central | `/game-center/week` | `WeekCentralPage.js` -> `components/organisms/game-center/week/` | `/data/1-game center/current_exports/week_central/week_central_{season}.json` plus `/current_exports/games/{season}/{stem}.json` for selected parsed briefs |
| Conference Slate | `/game-center/conferenceslate` | `ConferenceSlateMatrix.js` | `/data/1-game center/current_exports/slate/conference_slate_{season}.json` |
| Season Schedule | `/game-center/seasonschedule` | `SeasonSchedulePage.js` | `/data/1-game center/current_exports/schedule_board/season_schedule_board_{season}.json` |
| Team Schedules | `/game-center/team` | `TeamSchedulePage.js` | `/data/1-game center/current_exports/team_schedules/team_schedules_{season}.json` |
| Standings | `/game-center/standings` | `StandingsPage.js` | `/data/1-game center/current_exports/standings_race/standings_race_{season}.json` |
| Game Page | `/game/:gameId` | `GamePage.js` | current legacy lookup through `/data/1-game center/games/index.json`, then `/data/1-game center/games/{season}/{stem}.json` |

---

## Contract Status Summary

| Hub | Status | Main Gap |
|---|---|---|
| Game Center Hub | current export wired | verify selected dynamic card content against final page design |
| Games Hub | current export wired | selected story-card manifest is present; Why scores remain future state |
| Week Central | current export wired | add compact `brief` data to avoid full parsed fetch for the right panel |
| Conference Slate | current export wired | current export has home/away, scores, winner, and link authority |
| Season Schedule | current export wired | make `weeks[].cells` the authoritative board contract |
| Team Schedules | current export wired | add normalized filter booleans and venue split fields |
| Standings | current export wired | group objects are present; `finish_matrix[]` currently needs full probability `values[]` when scenarios are modeled |
| Game Page | legacy parsed-game fetch wired | move toward one page-shaped game-detail payload containing Summary, Box Score, Play By Play, and Team Stats groups |

---

## Shared Data Rules

1. Team IDs should be v5 ids such as `swacjsu`, `meacdsu`.
2. Frontend visual identity joins come from `src/data/teams.json`.
3. Route-ready game links should use `game_path_id` and/or `route`.
4. Parsed game file links should point into:

```text
/data/1-game center/current_exports/games/{season}/{game_path_id}.json
```

5. Payloads should include direct score fields instead of requiring score parsing from display strings.
6. Data quality should be explicit: counts are useful, but per-row warnings are better.
7. Page payloads should be page-ready. Each page-specific design doc must explicitly list the fields and nested shapes the frontend needs so production components do not perform deep payload cleanup.

---

## Supabase Query Shape Rule

Future Supabase endpoints/functions should return the page shape directly. The frontend should make one intentional query per committed page context where practical.

Example for Week Central:

```text
week_central_week_payload(season, week)
```

Expected behavior:

- season/week dropdowns use draft state
- `Go` commits the selected season/week
- React Query refetches by query key `["week-central", season, week]`
- response includes that week's visible games plus embedded `brief` data
- clicking games changes only selected client state; it should not trigger another database request

Frontend adapters remain thin defensive normalizers, not substitutes for backend shaping.

Example for Game Page:

```text
game_detail_payload(game_id)
```

Expected behavior:

- `/game/:gameId` is already a committed context, so no draft/commit control is needed.
- React Query refetches by query key `["game-detail", gameId]`.
- The response should include tab-ready groups: `summary`, `box_score`, `play_by_play`, and `team_stats`.
- Supabase/Firebase should retrieve the exact records needed for that game and return the page shape. It should not perform arbitrary frontend-style UI logic, but the payload should contain canonical derived data such as quarter scoring, leaders, glossary entries, scoring plays, drive rows, EPA timeline, and data-quality warnings.
- The frontend still joins visual identity from `src/data/teams.json` and performs thin defensive normalization.

---

## Immediate Pipeline Priorities

1. Add page-ready `brief` objects to Week Central game rows and support a committed season/week payload.
2. Normalize side/team fields across hub payloads:
   - `home_team_id`
   - `away_team_id`
   - `home_score`
   - `away_score`
   - `winner_team_id`
3. Add route/link authority fields:
   - `game_path_id`
   - `route`
   - `has_parsed_game`
4. Keep page-ready dynamic manifests populated:
   - Game Center Hub: `dynamic_candidates[]`, `selected_dynamic_cards[]`
   - Games Hub: `selected_story_cards[]`, `dynamic_candidates[]`
5. Keep schedule-specific normalized fields populated:
   - `is_hbcu_opponent`
   - `is_conference_championship`
   - `is_postseason`
   - `venue_city`
   - `stadium_name`
6. Add Standings object groups with `standings[]`, `finish_matrix[]`, and summary cards.
7. Add a Game Page detail export/function shape:
   - `metadata`
   - `summary`
   - `box_score`
   - `play_by_play`
   - `team_stats`
   - `stat_glossary`
   - `data_quality`
