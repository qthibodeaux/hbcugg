# 93-FE Docs

Freshest Game Center exports. One folder per page, named after the page.
Everything here is generated -- edit the builders, not these files.

Rebuild with:

```bash
python 92-frontend/tools/build_game_center_payloads.py
python 92-frontend/tools/publish_fe_docs.py
```

## Pages

| Page | Request | File | Seasons |
|---|---|---|---|
| hub | `GET /api/game-center/hub` | `game-center/hub/game_center_hub_{season}.json` | 2026 |
| week-central | `GET /api/game-center/week-central/{season}/{week}` | `game-center/week-central/{season}/{week}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| conference-slate | `GET /api/game-center/conference-slate` | `game-center/conference-slate/conference_slate_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| season-schedule | `GET /api/game-center/season-schedule` | `game-center/season-schedule/schedule_board_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-schedules | `GET /api/game-center/team-schedule/{season}/{team_id}` | `game-center/team-schedules/{season}/{team_id}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| standings | `GET /api/game-center/standings` | `game-center/standings/standings_race_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| games-hub | `GET /api/game-center/games-hub` | `game-center/games-hub/games_hub_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| game-preview | `GET /data/93-FE Docs/game-center/game-preview/{season}/{game_id}.json` | `game-center/game-preview/{season}/{game_id}.json` | 2026 |
| roster-hub-league | `GET /api/schools/roster-hub/{season}` | `schools/roster-hub/roster_hub_{season}.json` | 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-hub | `GET /api/schools/team-hub/{season}/{team_id}` | `schools/team-hub/{season}/{team_id}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-roster | `GET /api/schools/roster-hub/{season}/{team_id}` | `schools/team-roster/{season}/{team_id}.json` | 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-full-roster | `GET /api/players/roster/{season}` | `players/roster/player_seasons_{season}.json` | 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| player-page | `GET /api/players/profile/{season}/{person_id}` | `players/profile/{season}/{person_id}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| home-stats-tile | `GET /data/93-FE Docs/home/stats-tile/current.json` | `home/stats-tile/current.json` | 2026 |
| home-teams-tile | `GET /data/93-FE Docs/home/teams-tile/current.json` | `home/teams-tile/current.json` | 2026 |
| home-players-tile | `GET /data/93-FE Docs/home/players-tile/current.json` | `home/players-tile/current.json` | 2026 |
| schools-hub | `GET /data/93-FE Docs/schools/schools-hub/current.json` | `schools/schools-hub/current.json` | 2026 |
| glory-team-of-week | `GET /data/93-FE Docs/game-center/glory-team-of-week/current.json` | `game-center/glory-team-of-week/current.json` | 2026 |
| team-analytics-index | `GET stats/team-analytics/index.json` | `stats/team-analytics/index.json` | 2026 |
| team-analytics-hub | `GET stats/team-analytics/hub_{season}.json` | `stats/team-analytics/hub_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-analytics-advanced | `GET stats/team-analytics/advanced_{season}.json` | `stats/team-analytics/advanced_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-analytics-spatial | `GET stats/team-analytics/spatial_{season}.json` | `stats/team-analytics/spatial_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-analytics-games | `GET stats/team-analytics/games_{season}.json` | `stats/team-analytics/games_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-analytics-week-review | `GET stats/team-analytics/week_review_{season}.json` | `stats/team-analytics/week_review_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-analytics-player-usage | `GET stats/team-analytics/player_usage_{season}.json` | `stats/team-analytics/player_usage_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| counting-index | `GET stats/counting/index.json` | `stats/counting/index.json` | 2026 |
| counting-team | `GET stats/counting/team_{season}.json` | `stats/counting/team_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| counting-player | `GET stats/counting/player_{season}.json` | `stats/counting/player_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| counting-penalties | `GET stats/counting/penalties_{season}.json` | `stats/counting/penalties_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| stats-hub-cards | `GET stats/hub-cards/{season}.json` | `stats/hub-cards/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| stats-par | `GET stats/par/par_{season}.json` | `stats/par/par_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| week-recap-index | `GET game-center/week-recap/index.json` | `game-center/week-recap/index.json` | 2026 |
| week-recap | `GET game-center/week-recap/{season}/{week}.json` | `game-center/week-recap/{season}/{week}.json` | 2026 |
| leaders-index | `GET stats/leaders/index.json` | `stats/leaders/index.json` | 2026 |
| leaders-week | `GET stats/leaders/{season}/week_{week}.json` | `stats/leaders/{season}/week_{week}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| leaders-season | `GET stats/leaders/{season}/season.json` | `stats/leaders/{season}/season.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| three-and-outs-index | `GET stats/three-and-outs/index.json` | `stats/three-and-outs/index.json` | 2026 |
| three-and-outs-season | `GET stats/three-and-outs/{season}.json` | `stats/three-and-outs/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| third-and-long-index | `GET stats/third-and-long/index.json` | `stats/third-and-long/index.json` | 2026 |
| third-and-long-season | `GET stats/third-and-long/{season}.json` | `stats/third-and-long/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| production-rushing-index | `GET stats/production/rushing/index.json` | `stats/production/rushing/index.json` | 2026 |
| production-rushing-season | `GET stats/production/rushing/{season}.json` | `stats/production/rushing/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| production-receiving-index | `GET stats/production/receiving/index.json` | `stats/production/receiving/index.json` | 2026 |
| production-receiving-season | `GET stats/production/receiving/{season}.json` | `stats/production/receiving/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| production-pass-defense-index | `GET stats/production/pass-defense/index.json` | `stats/production/pass-defense/index.json` | 2026 |
| production-pass-defense-season | `GET stats/production/pass-defense/{season}.json` | `stats/production/pass-defense/{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| pass-defense | `GET stats/pass-defense/{season}/{team_id}.json` | `stats/pass-defense/{season}/{team_id}.json` | 2026 |
| leaderboards-index | `GET stats/leaderboards/index.json` | `stats/leaderboards/index.json` | 2026 |
| leaderboards-season | `GET stats/leaderboards/{season}/season.json` | `stats/leaderboards/{season}/season.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| leaderboards-week | `GET stats/leaderboards/{season}/week_{week}.json` | `stats/leaderboards/{season}/week_{week}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| team-profile | `GET stats/team-profile/{season}/{team_id}.json (index.json lists the teams)` | `stats/team-profile/{season}/{team_id}.json` | 2026 |
| special-teams-situations | `GET stats/special-teams-situations/{season}.json` | `stats/special-teams-situations/{season}.json` | 2026 |
| series | `GET stats/series/{season}.json` | `stats/series/{season}.json` | 2026 |
| qb-map-index | `GET stats/player-analytics/qb-map_index.json` | `stats/player-analytics/qb-map_index.json` | 2026 |
| qb-map | `GET stats/player-analytics/qb-map_{season}.json` | `stats/player-analytics/qb-map_{season}.json` | 2019, 2021, 2022, 2023, 2024, 2025, 2026 |
| game | `GET /api/game-center/game/{game_path_id}` | `game-center/games/{season}/{game_path_id}.json` | 2019 (73), 2021 (66), 2022 (66), 2023 (67), 2024 (66), 2025 (72), 2026 (50) |

`game-center/games/index.json` lists every parsed game with its season, date, both team ids,
final score and file path -- 460 entries.

## Seasons

Game Center pages: 2019, 2021-2026 (2020 was not played). Rosters:
2015-2026 -- nothing before 2015 ships; those pages were fetched under
the wrong year and were dropped. The season list per page in the table
above is the coverage; render what is there rather than a fixed range.
An unplayed game carries dates, both teams, venue and
`status: "upcoming"`, and no scores or game page.

## Supporting files

- `shared/teams.json` - the 18-program universe: v5 id, names, conference and
  division. This is the alignment every payload groups by, and the matrix axes
  the Conference Slate is built on.
- `shared/` also carries league and team context the pages read alongside their
  payload, including `football_current_context.json`, the cross-page source of
  truth for the current season and week.
- `data-quality/` - what the build knows is wrong. Read these before filing a
  data bug: `validation_report.json` is the pass/fail, `score_mismatches.json`
  lists games where the schedule scrape and the parsed box score disagree, and
  `phantom_schedule_rows.json` lists rows dropped as another game copied onto
  the wrong school.

## Rules that hold across every payload

1. `team_id` is always a v5 id (`swacjsu`, never `jsu`). A non-covered opponent
   is `team_id: null` with an inline display name -- never a bare null.
2. Scores are numeric fields. `display_score` is additive; nothing needs parsing.
3. A game links through `game_path_id` / `route`, and `has_parsed_game` says
   whether that link resolves.

Generated 2026-11-08T13:19:40.824455-06:00.
