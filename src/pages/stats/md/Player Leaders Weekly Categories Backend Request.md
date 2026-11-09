# Player Leaders — Weekly Categories — Backend Request

**Date:** 2026-10-25 · **File:** `stats/leaders/{season}/week_{week}.json`
**Builds on:** [Player Leaders Fetch Contract.md](Player%20Leaders%20Fetch%20Contract.md) (shipped 2026-10-19).
**Ask:** the Player Stats page's Week view reads these files. Six categories ship today (passing, rushing, receiving, tackles, sacks, interceptions). Ten more are needed so every Player Stats tab has a weekly top 10.

## Request

Add these ten entries to `categories[]` in every `week_{week}.json`. Envelope, ranking, ties, row limit and the shared row fields are exactly as in the contract (§1 and its rules: rank, `person_id`, `display_name`, `position`, `class_year`, `team_id`, `image_url`, `game_path_id`, `opponent_team_id`, `home_away`, `result`, `score`, `value`). The counting stats' own counter, run on that week's games, as before.

| `id` | `side` | `label` | `unit` | `value` | tiebreak | Row fields |
|---|---|---|---|---|---|---|
| `scoring` | offense | Scoring | PTS | points | touchdowns | `touchdowns`, `field_goals`, `pats`, `two_point` |
| `punt_returns` | offense | Punt Returns | YDS | punt return yards | long | `returns`, `touchdowns`, `long` |
| `kick_returns` | offense | Kick Returns | YDS | kick return yards | long | `returns`, `touchdowns`, `long` |
| `total_offense` | offense | Total Offense | YDS | rushing + passing yards | fewer plays | `rush_yards`, `pass_yards`, `plays` |
| `all_purpose` | offense | All Purpose | YDS | all-purpose yards | rushing yards | `rush_yards`, `receiving_yards`, `punt_return_yards`, `kick_return_yards` |
| `punting` | offense | Punting | AVG | yards per punt, at least 3 punts that game | punts | `punts`, `yards`, `long`, `inside_20`, `touchbacks` |
| `field_goals` | offense | Field Goals | FGM | field goals made | long | `made`, `attempts`, `long` |
| `tfl` | defense | Tackles for Loss | TFL | tackles for loss (half credits count 0.5) | tackle-for-loss yards | `tfl_yards`, `sacks` |
| `fumbles` | defense | Fumbles | FF | forced fumbles | recoveries | `recoveries`, `recovery_yards`, `touchdowns` |
| `pass_defense` | defense | Pass Defense | PD | passes defended (break-ups + interceptions) | interceptions | `pass_breakups`, `interceptions`, `qb_hurries`, `blocks` |

- **Same category ids as the season tables.** The Player Stats page's season tables already have these (Scoring, Punt Returns, Kick Returns, Total Offense, All Purpose, Punting, FGs, Tackles for Loss, Fumbles, Pass Def); the weekly boards are their one-game versions.
- **Rows with a value of 0 are left out**, as before. A category with no qualifying row ships `rows: []` rather than being omitted.
- **Punting is a rate:** keep the floor (3 punts in the game) and say it in the category's `note`: `note: string | null` (new, optional, on any category; `null` for the existing six).
- **`season.json`:** unchanged for now; the season view uses the counting stats pages.

## Response

Same files, same paths. One addition: ten more objects in `categories[]` (and the optional `note`). Nothing is removed or renamed.
