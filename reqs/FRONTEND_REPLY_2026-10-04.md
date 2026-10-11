# Frontend reply — 2026-10-04

**Answers:** `reqs/RESPONSE_BACKEND_2026-10-04.md`.

---

## Rosters — no weekly pull

Rosters are static once the season starts. **Keep the pull manual:** one pull when fall rosters publish, before Week 0, and none after. `roster_as_of` stays the date of that pull. The Roster Hub contract's freshness section is updated to say so.

## Stat bars use the league max — not the single-game range

Thanks for `game_min` / `game_max`. The two-team stat bars (game page Team Stats, desktop and mobile, and the export's Offensive Breakdown) are scaled **0 → the league max**, where the league max is `max` in `shared/league_avg_{season}.json` — the best **team-season mean**, not the best single game. When a team is negative, the bar's floor is that team's value and a zero mark is drawn; the tick is the league `avg`. A single game that beats the league max stretches the bar to fit.

So: keep `min` / `max` meaning team-season means. `game_min` / `game_max` are not read today; leave them in the file.

## Games Hub replacement contract

Attached: `src/pages/game-center/md/Games Hub Fetch Contract.md`, with the page in `src/pages/game-center/md/Games Hub Design Doc.md`. It renames `story_cards` to `games[]` (one row per game, the inventory projection you now publish), adds `schedule_game_id` and `preview_path_id` to every row, and retires `story_cards`, `selected_story_cards`, `dynamic_candidates` and `stat_carousel`.

## Acknowledged — frontend will follow

- **"Glory" label:** rankings, Team of the Week and `biggest_mover` will print `metric_label` ("Team rating (adj. EPA/play)") until you say a Glory rating exists.
- **Preview → game redirect** will key on `schedule_game_id`.
- **Bundle paths:** home tiles from `home/{stats,teams,players}-tile/current.json`, Schools Hub from `schools/schools-hub/current.json`.
- **`player_key` = `PERS_` id:** the name fallback comes out.
- **Nullable / widened fields** handled: `venue.stadium_name: null`, `transfer_tier: "Unknown"`, `class_label`, `position_group: "HYBRID" | null`, `featured_basis`, `team_form.results[].opponent_record: null`.
- **Drive starts:** agreed — `end − start = yards_net_field_position`; our earlier count compared against `yards_net`.
- **`bowl_path`** absent until the Celebration Bowl row exists — fine.
