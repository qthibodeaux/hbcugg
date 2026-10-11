# Backend Handoff — 2026-10-04

Everything the frontend needs from the backend after the 2026-10-01 → 10-04 sessions, in one place. Three parts: **(A) this week's data run**, **(B) data fixes**, **(C) new and revised requests**. Every item points at the doc that holds the detail; nothing here is new beyond what those docs say.

---

## A. This week's data run — Week 5 (Oct 3) games are in

The drop on disk stops at Week 2–4 depending on the file. Run the full weekly export so every file agrees on the current week.

**Week 5 games (Sat Oct 3):**

| Game | Game file |
|---|---|
| PVAMU at MVSU | `pvamumvsu26` — on disk; frontend added it to `games/index.json` by hand |
| Alcorn at Grambling | `alcgsu26` — on disk; frontend added it to `games/index.json` by hand |
| AAMU at JSU | **missing** |
| Alabama State at BCU | **missing** |
| UAPB at Southern | **missing** |
| DSU at UAlbany · HU at Hampton · MSU at Villanova · Campbell at NCCU · NSU at Robert Morris · The Citadel at SCSU · TSU at Florida Atlantic | non-league opponents — results into the schedules |

**Regenerate, in one run:**
1. `shared/football_current_context.json` — still says `phase: "offseason", week: 0`. Should be in-season, current week.
2. `game-center/games/index.json` — add every Week 5 game (replace the two hand-added rows with yours).
3. `game-center/games/2026/*` — the three missing league game files above.
4. `game-center/hub/game_center_hub_2026.json` — says Week 2.
5. `game-center/games-hub/games_hub_2026.json`, `season-schedule/schedule_board_2026.json`, `team-schedules/2026/*`, `week-central/2026/*`, standings.
6. `game-center/game-preview/2026/*` — drop the preview files for games now played (`2026-10-03_swacpvamu_at_swacmvsu`, `2026-10-03_swacalc_at_swacgsu`, and the rest); the preview page forwards to the game page when its file is gone.
7. `schools/team-hub/2026/*` — all 18 (see B4).
8. `shared/league_avg_2026.json`, `players/profile/2026/*`, the home tile files (C1).

---

## B. Data fixes — all written up in `LAUNCH_0_BACKEND_NOTES.md`

| # | Fix | Where |
|---|---|---|
| B1 | **Drive start spots slip one drive.** 140 of 364 2026 drives have a `start_yardline_absolute` that doesn't match end − yards (uapbalc26 D010–D012 is the clear case). Set each from its own first snap. | Game Page § `drive_summary[].start_yardline_absolute` |
| B2 | **Play-by-play sentences missing on 6 games** (`asusu26`, `huaamu26`, `nccutsu26`, `scsufamu26`, `tsupvamu26`, `uapbalc26`): no `description` / `spot.display`. Regenerate with the §4b strings. | Game Page § Play-by-play `description` |
| B3 | **Duplicate games and spring rows.** 67 games appear twice in `games_hub_2026.json` (same id twice, or mirrored per-team ids); NCCU "Maroon & Gray Game" and GSU vs GSU are in the season. One row per game; no spring/intrasquad. Same check on the schedule board and team schedules. | Games Hub § Duplicate games |
| B4 | **Team profile docs frozen at week 0.** All 18 show last season's records (PVAMU 10-4), one-game `last_5`, Aug previous / Sep next game; `coach_carousel`, `star_impact`, `avg_par` empty on all 18. Rebuild weekly per C4. | Schools § Team profile docs |
| B5 | **Stale games hub statuses** — played games still `scheduled` with no score. | Games Hub § Scores and statuses |
| B6 | **2026 headshots are placeholder URLs** — 1,479 of 1,845 roster rows. Restore the real host; `null` when unknown. Applies to the new contracts too. | Shared § 2026 roster headshots |

---

## C. New and revised requests — the contracts

| # | Request | File | What's new |
|---|---|---|---|
| C1 | Home tiles — Stats / Teams / Players | `src/pages/stats/md/Home Stats Tile Fetch Contract.md` · `src/pages/teams/md/Home Teams Tile Fetch Contract.md` · `src/pages/players/md/Home Players Tile Fetch Contract.md` | **Revised:** each tile is now exactly **5 keys**, each once. Stats: `metric_of_week`, `efficiency_king`, `points_per_drive`, `explosive_drives`, `havoc_leader`. Teams: `division_race`, `hot_streak`, `rivalry`, `home_field`, `band`. Players: `collage`, `player_of_week`, `breakout`, `transfer_impact`, `freshman`. |
| C2 | **Schools Hub** (new) | `src/pages/teams/md/Schools Hub Fetch Contract.md` | One weekly file `GET /data/0-data/schools-hub/current.json`: directory tiles (this week's head coach + 3–5 featured players per school, current roster only), the three standings, Glory rankings, coaches summary. Replaces typed-in standings/rankings and 2025 people. |
| C3 | **Roster Hub** (revised) | `src/pages/players/md/Roster Hub Fetch Contract.md` | Same two files (`roster_hub_{season}`, `player_seasons_{season}`); adds `generated_at` / `roster_as_of`, one roster pull for both, rebuilt whenever rosters change (weekly in season). |
| C4 | **Team Profile** (revised) | `src/pages/teams/md/Team Profile Fetch Contract.md` | Supersedes `reqs/BACKEND_RESPONSE_SPEC.md` §10. Adds `as_of_week`, `generated_at`, `next_game.preview_path_id`, star `image_url` / `last_name`; everything from this season's games only; all 18 rebuilt weekly. |
| C5 | **Game Center Hub context cards** (revised) | `src/pages/game-center/md/Game Center Hub Design Doc.md` §4 | The 5 `context_cards` now come from **15 card types** with payload shapes (`look_ahead`, `upcoming_stretch`, `team_form`, `home_town_heroes`, `us_vs_world`, `biggest_mover`, `streak_watch`, `title_race`, `bowl_path`, `red_zone_edge`, `turnover_swing`, `defending_champs`, `record_split`, `schedule_headline`, `upset_watch`). The four old `*Card` names map onto these. |
| C6 | Glory Team of the Week · Game Preview | `src/pages/game-center/md/Glory Team of the Week Fetch Contract.md` · `Game Preview Fetch Contract.md` | Unchanged since 10-01 — included so the batch is complete. |

---

## D. Not needed for launch.0

Postponed on our side — no backend work needed now: Stadiums, Classics & Homecoming (events), School Stats (`/teams/:id/stats`), Player Analytics, School Wiki data, the Team section's stat taxonomy (in progress on your side), and the Data Room's Data Quality panel. See `AFTER_LAUNCH_0.md`.

**Optional, if easy:** single-game min / max per stat in `league_avg_{season}.json`. The stat bars use the league max of team-season averages today, which a single good game passes.
