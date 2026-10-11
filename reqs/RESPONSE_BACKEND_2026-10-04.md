# Backend response — 2026-10-04

**Answers:** `BACKEND_HANDOFF_2026-10-04.md` (A, B1–B6, C1–C6) and the still-open asks in `LAUNCH_0_BACKEND_NOTES.md`.
**Drop:** `93-FE Docs/`, published 2026-10-04 from one weekly run. `manifest.json` is the only manifest (overwritten every publish) and lists every file with the request it answers.

**Standing rule:** the backend decides what a number is and how it is computed. Where an ask is answered "no" or "changed", the reason is given.

---

## A. Week 5 run

All of 2026 Week 5 (Sat Oct 3) is in. 12/12 finals, 0 missing scores, 0 PDFs wanted.

| Item | State |
|---|---|
| `shared/football_current_context.json` | `phase: "in_season"`, `current_week: 5`. Hub, every `week-central/2026/*.json` and the context file now come from the same run and agree (`is_current_week` only on `5.json`). |
| League games | `aamujsu26`, `asubcu26`, `uapbsu26` parsed and published, alongside `alcgsu26` and `pvamumvsu26`. 17 game files for 2026; `games/index.json` lists all 17 (drop your two hand-added rows). |
| Non-league results | All seven in the schedules (DSU, HU, MSU, NCCU, NSU, SCSU, TSU). |
| Game previews | The five Oct 3 previews are gone; 51 remain (all unplayed covered games). |
| Schools / players / home | Rebuilt in the same run; see B and C. |

**New in the weekly run** (so these stop going stale): team ratings, per-game PAR, the season PAR merge, roster hub, players hub, team roster, player pages, team profiles, the three home tiles, the Schools Hub and Team of the Week. Rosters themselves are still pulled by hand (see C3).

---

## B. Data fixes

| # | Answer |
|---|---|
| **B1** Drive start spots | **Fixed** (anchor bug: a drive took the previous drive's header). `uapbalc26` D011 now starts at 11 and D012 at 62. **Check against `yards_net_field_position`, not `yards_net`.** On all 428 2026 drives, `end_yardline_absolute − start_yardline_absolute = yards_net_field_position` exactly. `yards_net` is *credited* yards, and the two differ by design on 56 drives: a turnover drive ends at the spot where the ball changed hands, and a penalty can move the ball without crediting yards. |
| **B2** PBP sentences | **Fixed.** `description` is present on every row of all 17 games, the six named included. `spot.display` is null on 39 rows across the 17 games: 37 are the half-opening kickoffs ("Start of 1st quarter, clock 15:00. … kickoff 65 yards"), whose crew line names no spot, and 2 are PATs. We don't fill an assumed 35-yard line. |
| **B3** Duplicates and spring rows | **Fixed at the source.** `games_hub_{season}.json` was the last export still built from the per-team schedules. It is now projected from the season inventory, like every other page: **one row per game under one canonical `game_id`, no spring or intrasquad rows** (2026: 144 games, 82 final, 62 scheduled). The validator now fails the publish if a game_id, or a date plus pair of sides, appears twice. The schedule board and team schedules were already inventory-built: one cell per team per week, keyed `[team_id][week]`, so a game between two of the 18 appears once on each team's row by design. The ranked `selected_story_cards` / `dynamic_candidates` are removed per your hold. `story_cards` stays as the grid's row list until the replacement contract renames it. |
| **B4** Team profiles frozen at week 0 | **Fixed; see C4.** Cause: the builder was not in the weekly run, it read records from a file nothing rebuilt, and its coach source stopped at 2025 because of a hardcoded year list. |
| **B5** Stale statuses | **Fixed by B3.** Status, scores, `game_path_id` and `route` come from the inventory, the same source as the games index. `HUAAMU29082026`, `NCCUTSU29082026` and `ASUSU29082026` are final with routes. |
| **B6** Headshots | **Fixed.** The roster parser was joining relative image paths onto an invented host (`placeholder-{team}.com`) whenever a season had no URL key. It now uses the team's real athletics domain. Stand-in images are also nulled: a file shared by 3+ players on a roster, a logo filename, or ESPN `nophoto` (the Delaware State logo PNG had been the "headshot" of 30 players). 2026: **1,712 real, 133 null, 0 placeholder**. A full scan of the bundle finds no placeholder host in any file, any season. Coach `image_url` gets the same rule. |

---

## C. New and revised contracts

### Paths

Every page is published under the bundle's page-named layout, as before. The contracts name `/data/0-data/...` and `/data/1-game center/...`; map these locally:

| Contract request | Bundle path |
|---|---|
| `0-data/home-stats-tile/current.json` | `home/stats-tile/current.json` |
| `0-data/home-teams-tile/current.json` | `home/teams-tile/current.json` |
| `0-data/home-players-tile/current.json` | `home/players-tile/current.json` |
| `0-data/schools-hub/current.json` | `schools/schools-hub/current.json` |
| `1-game center/glory-team-of-week/current.json` | `game-center/glory-team-of-week/current.json` |

### The "Glory" rating (ruling, applies to C2, C5 and C6)

**There is no team Glory rating yet.** The redesign has not produced one, and the old engine (`why_glory`) is retired. The rankings, Team of the Week and the `biggest_mover` card therefore rank on the **opponent-adjusted EPA team rating**: the same ridge model behind the Game Preview's `net_adj_epa` and the schedules' win probabilities. It is labelled honestly on every surface:

```text
metric_key:   "adj_epa_net_predictive"
metric_label: "Team rating (adj. EPA/play)"
```

- It is the *predictive* rating: this season's fit blended toward last season's final, weighted by evidence (three games' worth). That is the version the backtest scored, and it rates all 18 from week 0.
- "Previous" = the same rating refit on games through the end of the previous week, recomputed rather than remembered.
- Values are EPA per play, roughly ±0.05 across the league; displays use three places (`"+0.041"`).
- Print the label, not "Glory", until we tell you a Glory rating exists. The key names (`glory`, `glory_rankings`) are kept so nothing on your side has to move when it does.

### C1 — Home tiles

All three are live. Each has exactly five keys, each once, in `rotation` order; an item that cannot be computed is left out of both lists. Team rates come from **League games only** (games with play-by-play), counted then divided once, from the published game files. Records are all-games.

**Stats.** `metric_of_week` rotates by week number through EPA/play, success rate, havoc rate (defense), points per drive, explosive-drive rate and red-zone TD rate. Week 5: red-zone TD rate, J-State 90%. The other four items lead with the league's best team; a team needs 2+ League games to lead a rate. `explosive` is the drive flag (7.5+ net yards a snap). `havoc_plays` / `snaps` are the defense's havoc snaps and the opponent's snaps.

**Teams.**
- `division_race`: the group with the smallest gap between 1st and 2nd once conference play has started. `games_total` is the leader's conference schedule length.
- `hot_streak`: the longest active win streak. `results` is the last five, oldest first.
- `rivalry`: the next named series game between two of the 18 (Magic City Classic, Oct 31). The series counts every meeting in the published seasons, so `series_from` is the first season we hold (2019), not the series' real start.
- `home_field`: the best home record with 2+ home games. `image_url` is `null`: there is no stadium image source.
- `band`: the home side of the next homecoming, then the next classic, then the next covered home game. Week 5 picks Alcorn, homecoming Oct 10. **We have no band data**, so the choice is calendar-driven and `why` says so.

**Players.** Every figure is the season production score in League games, from the same rows as the player pages.
- `collage`: the top 16 season production totals.
- `player_of_week`: the highest single-game PAR of the week. Tie-break: production, then name. `line` is 3–5 cells built from what the player did.
- `breakout`: the biggest rise in production per game over last season, with 2+ games in each season.
- `transfer_impact`: the highest production per game among transfers. A transfer with a season at another of the 18 is preferred, so `before` is a real number. Otherwise `before` is `{label: "2025", display: "Not tracked"}`.
- `freshman`: the top freshman by production per game. `freshmen` counts every freshman with any production.

### C2 — Schools Hub

Live at `schools/schools-hub/current.json`.

- **`directory`:** all 18 schools. `head_coach` is this season's staff. 2026 coach roles did not exist until this run, and Southern's "Head Coach Assistant" had been counted as a second head coach; both are fixed, 18 of 18. `featured_players` are the school's top 5 season production totals on the current roster. **Three schools have no League game yet** (Delaware State, Morgan State, Norfolk State). They feature current-roster players ranked by last season's production. The new top-level `featured_basis: { team_id: "current_season" | "prior_season_production" }` says which basis was used.
- **`standings`:** the inventory's three groups, in its tiebreaker order. `trend` compares each place with the previous week's published hub, which the builder now snapshots weekly. This first week has no snapshot, so every row is `"flat"`.
- **`glory_rankings`:** all 18, on the team rating above, with `trend` and `previous_rank` against the prior week's refit. `glory_rankings_metric` carries the key and label.
- **`coaches`:** one row per school; `staff_count` is this season's staff on the roster page.

### C3 — Roster Hub

`roster_hub_{season}.json` now carries `season`, `generated_at` and `roster_as_of`; `year` is kept for one release. `total_players` equals the `player_seasons` row count (2026: 1,845 = 1,845). Both files come from the same roster pull.

- **`roster_as_of` is the date of the roster pull**, from the newest raw roster page: 2026-08-29. Rosters are pulled by hand, not by the weekly run, so this date only moves when someone re-pulls. If you want rosters refreshed weekly, tell us and we will schedule the pull.
- **`class_year`** stays the 1–5 integer that every consumer sorts on. **New: `class_label`** (`"Fr."`, `"So."`, `"Jr."`, `"Sr."`, `"Gr."`), the contract's string. `class_year_raw` is the school's own text (`"Rf."`, `"2nd"`).
- **`transfer_tier` / `tier_breakdown`:** these also carry **`"Unknown"`**, which is outside your enum. A transfer inferred from roster continuity, where the previous school is not named, has no tier. We will not guess one.
- **`position_group`:** 9 rows are `HYBRID` and 9 are null in 2026: the roster lists no usable position.

### C4 — Team Profile

Every 2026 document is rebuilt from this season's data and stamped with `as_of_week: 5` and `generated_at`. It is in the weekly run now.

- **Records** come from the season inventory (all games). PVAMU reads 2-4, 2-1, "1st - SWAC West". `last_5` is this season only, **oldest first, most recent last**.
- **`previous_game`** is the most recent completed game; for every team it is now Oct 3. **`next_game`** is the earliest scheduled game on or after the build date. `preview_path_id` equals the game's id when both teams are among the 18, else `null`. `opponent_mascot` comes from the team registry; `opponent_logo` and `broadcast` stay null (no source).
- **`coach_carousel`:** head coach, OC, DC. `role_group` is one of your three values; `image_url` is real or null. `metric` is the change in that side's opponent-adjusted EPA/play from last season (net, offense, defense), signed so that up is better on every side. It is **null until the team has 3 rated games this season**, the same floor the Game Preview uses, so 11 teams show no metric yet.
- **`unit_carousel`:** five units (Passing Production, Rushing Production, Defensive Havoc, Offensive Efficiency, Special Teams), exactly 4 metrics each. A unit appears only when all 4 have a value. `display` is now the printed value and rates are 0–100. Ranks use standard competition ranking (ties share a rank, the next rank skips), against every team with play-by-play (`total` ≤ 18). Units come from League games only; the three teams with none have no slides and `top_stat: null`.
- **`top_stat`:** the best-ranked metric. Tie-break: furthest above the league mean, then unit order. `sentence` is the metric's sentence-case name.
- **`star_impact`:** the highest game PAR in the team's **most recent game with play-by-play**; a game against an outside opponent has no PAR. Tie-break: production, then name. Adds `last_name`, `image_url`, `from_game.game_path_id`. `class_year` is the `"Sr."` form. `par_per_game` = season PAR ÷ games. `stat_line` has 3–6 cells drawn from what the player did: three for his main line (e.g. count, yards, TD), a secondary line folded into one cell. A defender's tackle line is kept even at zero when his game was a single turnover. `profile_url` = `/player/{person_id}`.
- **`header.avg_par`:** the mean season PAR of the school's players with production. It is null before the first League game (Delaware State, Morgan State and Norfolk State today).
- **`venue.stadium_name`** can be **null**. See *Team Schedules* below.

### C5 — Game Center Hub context cards

`context_cards` is now drawn from **all 15 card types**; the four `*Card` names are retired. Each card's `why_score` is a base weight per type times how strong the case is, and `why_reasons[0]` states that case. The pool is ranked on the last week with results; the forward-looking types read the week after it. Five are picked, **one per type and at most two per team**.

- **Carryover decays:** `defending_champs` goes to zero by week 4, so it is out of the pool from week 4 on. Week 5's five cards are all this season: `upset_watch` (MVSU, 17th in the team rating, beat PVAMU, 1st), `schedule_headline` (J-State 5-0 at Grambling 3-2), `title_race` (SWAC West), `look_ahead` (B-CU at AAMU), `team_form` (J-State 5-0).
- **`schedule_headline`:** next week's highest-stakes game between two of the 18. Conference and division games, records and named series count. `footer` is the record comparison. **`look_ahead`** is the second-ranked game, so the two never show the same matchup.
- **`team_form`:** `results[]` carry the fields from your 09-15 revision (opponent, score, home/away, date) as well as `{result, margin}`. `opponent_record` is null because the record entering each game is not yet carried on that row.
- **`upcoming_stretch`:** `games[].opponent` is an object, as in §4.
- **`bowl_path` is never generated yet.** The Celebration Bowl row stays off the schedule until both sides clinch (ruling of 09-15), so there is no date or venue to print. It joins the pool the week the game exists.
- **Standings** (09-15 ask): every group now carries `defending_champion: {team_id, record, season}` (last season's group champion and conference record) and `conference_play_begins: {date_label, date}`, which is null once a conference game in the group has been played. Today only the MEAC has a date (Oct 23).
- **Featured games** (09-15 ask): the pool is the previous two weeks through the next two, plus any conference championship or Celebration Bowl at any distance.

### C6 — Glory Team of the Week · Game Preview

**Team of the Week** is live.

- **Pick:** among teams that won a League game this week, the biggest rise in the team rating. Tie-break: margin, then team id. Week 5: **MVSU**, 28-27 over PVAMU, up from 17th to 13th.
- **Highlight:** of five per-game numbers (success rate, EPA/play, havoc rate, explosive-drive rate, points per drive), the one where the team's game ranked best. **`rank` is among that week's League performances (10 this week), not among 18**, and `context` says so ("4th of 10 League performances this week").
- **Extra fields:** `team.glory` adds `metric_key`, `metric_label`, `display` and `delta_display`.
- **`copy.headline`** is null; only `summary` is written.

**Game Preview** is unchanged, and still current season and unplayed games only.

**New id field (affects the redirect):** a played game's `game_id` switches from the schedule form (`2026-10-03_swacpvamu_at_swacmvsu`, which is also the preview file's name) to the parsed form (`PVAMUMVSU03102026`) once its play-by-play lands. Every inventory-built game row now carries **`schedule_game_id`**, the schedule-form id, which never changes; it is on `games-hub` rows today. Key the preview → game redirect on it, not on `game_id`.

### Optional: single-game min/max in league averages

**Done.** Every key in `shared/league_avg_{season}.json` adds `game_min` / `game_max` over single-game team performances. `min` / `max` stay as the team-season means, and `definition.game_min_max` says so.

---

## Older asks from `LAUNCH_0_BACKEND_NOTES.md` closed in this drop

| Ask | Answer |
|---|---|
| Week markers disagree | Fixed: one run, one week (A). |
| Manifest | One `manifest.json`, overwritten every publish. |
| `player_key` is the `PERS_` id | **Confirmed** as the contract going forward, on every player row of every game file. Drop the name fallback. |
| Week Central `brief` | **Shipped** on every game. Parsed games (`source: "parsed"`) carry: `line_score`; `mvp`, the top single-game production score (`glory` carries that number and `glory_metric: "production_score"` names it); ten `metrics` (by league-average key path, with `format`); and five `leaders` (passing, rushing, receiving by yards; defense and top producer by production score, because tackles are not in `game_leaders`). Every other game ships `source: "schedule_fallback"` with null blocks. The key is never omitted. |
| Week Central `story_label` | **Shipped**: the named series / championship / bowl, else Division game, Conference game, MEAC vs SWAC, HBCU matchup, Non-conference. |
| Week Central opponent records `""` | **Now `null`**, never `""`. The schedule scrape does not carry an outside opponent's record, so there is nothing to send. |
| Championship placeholder rows | Gone from every page (ruling of 09-15; verified on 2025 Week Central and every team schedule). |
| Team Schedules `stadium_name` = city | **Fixed with one shared rule** (team schedules, games hub, team profile). The registry name is used when the venue resolves. Otherwise the scraped string is used only if it names a ground ("Stadium", "Field", …); "Chicago, Illinois Soldier Field" splits into stadium and city. Anything else (a city, or promo text such as "WEAR BLACK") gives `stadium_name: null` and `city` set. The contract types `stadium_name` as `string`; it is `string | null`. |

**Still open, not in this drop:** the Games Hub replacement contract (waiting on yours); `team_season_avg` rushing-defense keys (season contract, ours to shape, next piece); the Special Teams sit-down.

---

## Verified before sending

- `validate_game_center_payloads.py`: 0 errors. It now also fails the publish on a duplicated game, an unknown card type, or a card type shown twice.
- `validate_game_previews.py`: 51 files, 0 errors.
- Drive starts: 428/428 2026 drives satisfy `end − start = yards_net_field_position`.
- Headshots: 0 placeholder hosts anywhere in `93-FE Docs`.
- Person ids: the roster rerun moved no `PERS_` id (2025 and 2026 compared row by row) and the person count is unchanged (10,787).
- PAR now covers all 17 2026 games (636 players with a season PAR). Season PAR values moved slightly in every season: this was the first PAR rebuild since the 10-02 play-definition regen. Cameron Peters 2025: 104.88, 19.85 a game, 1st of 52 QBs (was 102.54 / 19.72 / 1st of 51).
