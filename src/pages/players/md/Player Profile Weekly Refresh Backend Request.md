# Player Profile Weekly Refresh — Backend Request

**Date:** 2026-10-18 · **Files:** `players/profile/{season}/{person_id}.json`, `players/roster/player_seasons_{season}.json`, `schools/team-hub/{season}/{team_id}.json`
**Ask:** every weekly run regenerates the player profiles and the player roster from the same game set as the team pages, and each profile says which week it is through.

## Request

### 1. Same game set, every file

`schools/team-hub` carries `as_of_week`. After each week's games, `players/profile` and `players/roster` must be built through that same week in the same run.

Today the team pages are through Week 7 and the profiles are through Week 6. Example, `PERS_00000446` (Cornelious Brown IV, AAMU):

- `schools/team-hub/2026/swacaamu.json`: `as_of_week: 7`, previous game 2026-10-17, a win.
- `players/profile/2026/PERS_00000446.json`: `games[]` still lists week 7 (`swacgsu`) as `not_yet_played`; `spotlight.week` is 6; `season_totals.games_played` is 5; `rating` and `par` do not include the week 7 game.

For every profile, once a game is final:

- its `games[]` row moves to `played` (or `no_play_by_play`) with `result`, `score`, `par`, `stat_line` and `field_map` filled;
- `spotlight` is the most recent played game;
- `season_totals`, `rating` and `comparatives` include it;
- the matching `players/roster` row (`par`, `games_played`, `total_production`, `avg_production`, `season_components`) agrees.

### 2. Real run stamp

`generated_at` is `2026-09-01T00:00:00-05:00` on all 1,845 2026 profiles. Set it to the time the file was generated.

Add `as_of_week` to the top level of every profile, the same integer `team-hub` uses. (The roster file is a plain array, so it keeps its shape.)

## Response

Same files, same paths, same shape. The only additions:

```text
players/profile/{season}/{person_id}.json:  as_of_week: integer   // new
                                            generated_at: string  // real generation time
```

Nothing is removed.
