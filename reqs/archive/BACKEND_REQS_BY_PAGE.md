# Backend Requests — By Page

**Compiled:** 2026-08-30 · **Format:** request string + field paths. No prose.

Path conventions follow `public/data/93-FE Docs/manifest.json`.
Status: `READY` shipping · `MISSING` does not exist · `BROKEN` exists but wrong · `PARTIAL` incomplete coverage

---

## Stats — Team Efficiency

```
GET /api/stats/team-season-avg/{season}     → shared/team_season_avg_{season}.json
GET /api/stats/team-defense-avg/{season}    → shared/team_defense_avg_{season}.json
GET /api/stats/league-avg/{season}          → shared/league_avg_{season}.json
```

| Field path | Status |
|---|---|
| `$.teams.{team_id}.rushing.successRate` | READY |
| `$.teams.{team_id}.rushing.opportunityRate` | READY |
| `$.teams.{team_id}.rushing.stuffRate` | READY |
| `$.teams.{team_id}.rushing.stopRate` | READY |
| `$.teams.{team_id}.rushing.tflRate` | READY |
| `$.teams.{team_id}.rushing.powerStopRate` | READY |
| `$.teams.{team_id}.passing.completionRate` | READY |
| `$.teams.{team_id}.passing.ypa` | READY |
| `$.teams.{team_id}.passing.explosiveRate` | READY |
| `$.teams.{team_id}.passing.pressureRate` | READY |
| `$.teams.{team_id}.epa.per_play` | **MISSING** |
| `$.teams.{team_id}.epa.per_dropback` | **MISSING** |
| `$.teams.{team_id}.epa.per_rush` | **MISSING** |
| `$.teams.{team_id}.success.overall` | **MISSING** |
| `$.teams.{team_id}.explosive.overall` | **MISSING** |
| `$.rushing.*` / `$.passing.*` (league_avg, same 10 keys) | READY |
| `$.rushing.*` / `$.passing.*` + `$.epa.*` (league_avg) | **MISSING** — needed as baseline for the 5 EPA fields above |

**Polarity — needs written confirmation, not code.** Frontend assumes
`team_season_avg.stuffRate` = "this offense got stuffed" and `team_defense_avg.stuffRate` = "this
defense stuffed opponents", and inverts the good/bad coloring between the two files. If that is
backwards, every color on the page is backwards.

**Seasons present:** 2019, 2021–2026. No 2020.

---

## Stats — Counting (team + player)

```
GET /api/stats/season-stats/{season}        → 6-stat lab/counting/season_stats.json
```

| Field path | Status |
|---|---|
| `$[*].year` `$[*].team_id` `$[*].player_key` `$[*].name_raw` | READY |
| `$[*].position` | **BROKEN** — see below |
| `$[*].rushing_*` (24 fields) | READY |
| `$[*].passing_*` (24 fields) | READY |
| `$[*].receiving_*` | **MISSING** — `$[*].categories` says `['receiving']` on 740 rows; no columns exist |
| `$[*].defense_*` | **MISSING** — `$[*].categories` says `['defense']` on 4,505 rows; no columns exist |

**`$[*].position` — BROKEN.** Actual values across all years:
```
DEF 4981 · WR 1228 · RB 810 · RET 293 · QB 190
```
Needs: `QB RB WR TE OL DL LB DB ST`. No `TE`, `OL`, `DL`, `LB`, or `DB` exists in the file today.

**`$[*].team_id` — BROKEN in 2019 only.** 4 of 23 values:
```
"HOW(3) (1-9 , 1-5)"             → meachu
"Mississippi Val. (2-6 , 1-3)"   → swacmvsu
```
2021–2025 are clean 18/18.

**TEAM-row coverage — PARTIAL.** Rows where `$[*].name_raw == "TEAM"`:
```
2019:22  2021:18  2022:18  2023:17  2024:16  2025:13   ← of 18
```

---

## Stats — Player Production

```
GET /api/stats/player-production/{season}   → 0-data/player_stats_{season}_enriched.json
```

| Field path | Status |
|---|---|
| `$.players.{key}.person_id` | READY — 957 of 1,054 (91.2%) |
| `$.players.{key}.total_production` | READY |
| `$.players.{key}.avg_production` | READY |
| `$.players.{key}.par` | READY |
| `$.players.{key}.season_components.*` | READY |
| `$.players.{key}.games[]` | READY |
| Seasons 2021, 2022, 2023, 2024 | **MISSING** — 2025 only |

---

## Team Roster Hub — `/teams/:teamId/roster`
## Team Full Roster — `/teams/:teamId/roster/full`

```
GET /api/schools/roster-hub/{season}        → 2-schools/roster_hub_{season}.json
```

| Field path | Status |
|---|---|
| `$.teams.{team_id}.composition.position_distribution[].group` | **BROKEN** |
| `$.teams.{team_id}.composition.position_distribution[].count` | READY |
| `$.teams.{team_id}.composition.class_distribution[]` | READY |
| `$.teams.{team_id}.experience.*` | READY |
| `$.teams.{team_id}.physical.*` | READY |
| `$.teams.{team_id}.geographic.*` | READY |
| `$.teams.{team_id}.transfers.transfer_count` | **BROKEN** — undercounts, see `BACKEND_PIPELINE_TODO.md` |

**`position_distribution[].group` — BROKEN.** Delaware State, `roster_hub_2025.json`:
```json
[{"group":"Unknown","count":97,"pct":99.0},{"group":"DL","count":1,"pct":1.0}]
```
Needs real groups on all 18 teams. Audit every team for the same failure.

**Consumers that break:** Biggest Position Groups, Depth Snapshot, Portal Profile position rows,
Experience By Room, and the position dropdown on Team Full Roster (now the only filter on that page).

---

## Team Hub — `/teams/:teamId`

```
GET /api/schools/team-profile/{season}      → 2-schools/team_profile/team_profile_{season}.json
```

| Field path | Status |
|---|---|
| `$.teams.{team_id}.record.*` | READY |
| `$.teams.{team_id}.head_coach.{coach_id,name,title,image_url,tenure_year,start_year,previous_stop,alma_mater,stock_label,staff_return_rate,coach_profile_url}` | READY |
| `$.teams.{team_id}.coaching_staff[]` | **MISSING** |
| `$.teams.{team_id}.next_game.tag` | **BROKEN** — only ever `"Season Opener"` or `"Conference Game"`, all 6 seasons |
| `$.teams.{team_id}.next_game.headline` | **MISSING** — field absent from `next_game` |
| `$.teams.{team_id}.previous_game.review_headline` | READY |
| `$.teams.{team_id}.previous_game.tag` | **MISSING** — field absent from `previous_game` |
| `$.teams.{team_id}.why_cards.team_production.cards[]` | **MISSING** |

**`coaching_staff[]` — required shape:**
```
coaching_staff[].coach_id      string
coaching_staff[].name          string
coaching_staff[].role          string   Head Coach | Offensive Coordinator | Defensive Coordinator | position
coaching_staff[].image         string | null
coaching_staff[].stat_value    string | null
coaching_staff[].stat_label    string | null
coaching_staff[].delta         { direction: "up"|"down"|"flat", value: string } | null
```
Precedent that `delta` is computable: `4-coaches/coach_position_impact_by_school_season.json`
(`current_metrics` / `previous_metrics` / `deltas`).

**`why_cards.team_production.cards[]` — required shape:**
```
cards[].key                        string
cards[].label                      string   short — long labels truncate to one line
cards[].metrics[4].key             string
cards[].metrics[4].label           string   short
cards[].metrics[4].value           number | null
cards[].metrics[4].conference_best number | null
cards[].metrics[4].conference_rank integer | null
cards[].metrics[4].conference_size integer | null
```
Which 2–3 categories appear is a backend/Why-Engine selection. Frontend renders `cards[]` as given.

**Game tagging — required on both `next_game` and `previous_game`:**
```
tag        string    short classification
headline   string    sentence
```
Plus either a richer `tag` vocabulary or booleans:
`is_rivalry` · `is_homecoming` · `is_conference_championship` · `is_celebration_bowl`

Today `tag` and `review_headline` ship the same string on many rows — the frontend rendered it
twice and clipped the card. Keep them distinct.

**Carried forward, unchanged:** position data for Alcorn/ASU/DSU/Morgan State · transfer data for
Alcorn/MVSU/DSU/Morgan State · in-state + distance for 7 teams · win probability per game.

---

## Team Schedule — `/teams/:teamId/schedule`

```
GET /api/game-center/team-schedule/{season}/{team_id}
  → game-center/team-schedules/{season}/{team_id}.json
```

| Field path | Status |
|---|---|
| `$.games[].tag` | **BROKEN** — same two-value vocabulary as Team Hub |
| `$.games[].win_probability` | **MISSING** |

Same fix as Team Hub game tagging. One change serves both pages.

---

## Game Page — `/game/:gameId`

```
GET /api/game-center/game/{game_path_id}    → game-center/games/{season}/{game_path_id}.json
GET /api/game-center/games-index            → game-center/games/index.json
```

Deployed export ships the **flat** play shape. `backend/W0sample_master.json` ships the **nested**
shape and is correct. Frontend bridges them in `src/components/game/page/utils/normalizePlays.js` —
delete that file once the master shape ships.

| Field path (master shape) | Status |
|---|---|
| `$.play_by_play[*].base.is_play` | **MISSING from deployed** |
| `$.play_by_play[*].base.line_type` | **MISSING from deployed** |
| `$.play_by_play[*].events[]` | **MISSING from deployed** |
| `$.play_by_play[*].base.{raw,quarter,clock,down,distance,yl_team,yl_num,yl_abs,offense_team,defense_team}` | master READY / deployed flat |
| `$.play_by_play[*].state_after.{yards_gained,is_first_down,down_next,distance_next,turnover,scoring_event}` | master READY / deployed flat |
| `$.play_by_play[*].play_advanced.epa.{ep_pre,ep_post,epa}` | READY |
| `$.play_by_play[*].play_advanced.wp.{wp_pre,wp_post,wpa}` | **BROKEN** — null on all 256 deployed plays; 122/241 in master |
| `$.play_by_play[*].play_advanced.situational.{garbage_time,competitive_time,standard_down,passing_down,middle_8}` | **MISSING from deployed** — marked ✅ ready in `CURRENT_DATA_INVENTORY.md` §2.4, arrives 0/177 |
| `$.play_by_play[*].enriched.drive_context.drive_id` | **PARTIAL** — 125 of 241 |
| `$.play_by_play[*].enriched.drive_context.play_index_in_drive` | **PARTIAL** — 125 of 241 |
| `$.play_by_play[*].actions[].tacklers[].player_id` | **MISSING from deployed** — 95 actions in master |
| `$.play_by_play[*].actions[].{passer,receiver,rusher,kicker,returner}.player_id` | **MISSING from deployed** — 197 refs in master |
| `$.play_by_play[*].penalties[]` | **MISSING from deployed** — scraped out of `raw_text` today |
| `$.drive_summary[].play_ids[]` | **PARTIAL** — covers 125 plays; `base.is_play` is true for 160 |
| `$.drive_summary[].enriched.{drive_number,drive_points,is_scoring_drive,is_red_zone_drive,available_yards_pct,is_quality_drive,is_explosive_drive,is_negative_drive}` | master READY / **MISSING from deployed** |

**Deployed non-play rows:** 79 of 256 (`play_type: null` ×40, `play_type: "DOWN_DISTANCE"` ×39).
2 rows weld admin text onto a real play. `base.is_play` + `events[]` fixes this.

**Drive→play linkage:** ~35 real plays belong to no drive. Both inference routes fail — raw-text
regex is fragile; clock-window matching assigns 176/177 but per-drive counts are off by up to 7
because drive boundaries share a clock value. Needs `drive_id` on every play.

---

## Game Center Hub — `/game-center`

```
GET /api/game-center/hub                    → game-center/hub/game_center_hub_{season}.json
```

Live document, backend-controlled. Season control removed from the frontend 2026-08-30.
Manifest lists **1 season** for this page and 7 for every other Game Center page — keep it that way.

| Field path | Status |
|---|---|
| `$.featured_games[].{game_id,game_path_id,route,status,stage_label,winner_team_id,supporting_line}` | READY |
| `$.featured_games[].{home_team,away_team}.{team_id,name,short_name,score,record}` | READY |
| `$.recent_results_rail[].{game_id,game_path_id,route,date_label,stage_label,winner_team_id,summary}` | READY |
| `$.recent_results_rail[].{home_team,away_team}.{team_id,name,short_name,score,record}` | READY |
| `$.recent_results_rail[].{home_by_q,away_by_q}` | **CONDITIONAL — by design, no action** |
| `$.standings.{swac_east,swac_west,meac}.rows[]` | READY |

**`home_by_q` / `away_by_q` — not a request.** Out-of-conference games have no quarter
breakdown: when one of the 18 plays a team outside the league, the export sends teams and the
final score only. Send the arrays when they exist, omit them when they don't — the rail drops its
quarter columns and renders final-score-only for those rows (handled 2026-08-30 in
`GameCenterResultsRail.js`). Send `number[4]`, or 5+ for overtime; the frontend renders what it
is given.

*Also not requests — the frontend adapts to these:* `standings.swac_west_top3` → `swac_west`;
scores and records moving from `home_score`/`home_record` into `home_team.score`/`home_team.record`.

---

## Week Central — `/game-center/week`

```
GET /api/game-center/week-central/{season}/{week}
  → game-center/week-central/{season}/{week}.json
```

| Field path | Status |
|---|---|
| `$.weeks[].{week,label,compact_label,game_count}` | READY — week selector, 17 stubs, file is self-sufficient |
| `$.games[].{game_id,game_path_id,route,has_game_page,status,status_label,date,date_label,kickoff_label,tv,tag,conference_game,bowl_game,winner_team_id,sort_order}` | READY |
| `$.games[].{home_team,away_team}.{team_id,name,short_name,score,record,conference_record}` | READY |
| `$.games[].venue.{stadium,city,venue_label,neutral_site_name}` | READY |
| `$.games[].brief` | **MISSING** — required, see below |

**`$.games[].brief` — required shape:**
```
brief.quarter_scores.home   number[4]   omit for out-of-conference, per the hub rule
brief.quarter_scores.away   number[4]
brief.mvp                   object | null
brief.metrics               object
brief.leaders               array
```
`WeekCentralBrief.js` is built entirely on this object. The legacy export populated it on
**72 of 219** games; the 2026-08-30 export drops the field on all of them. Inside it, only
`quarter_scores` ever carried real content — `mvp` was `null`, `metrics` `{}` and `leaders` `[]`
on every populated row. **If the Brief feature is being retired, say so and the component gets
deleted** — otherwise `quarter_scores` at minimum needs to come back.

**Not requests — improvements, or fields nothing consumed:**
- `venue_city` / `stadium_name` → now richer as `venue.city` / `venue.stadium`
- `home_score` / `away_score` → now `home_team.score` / `away_team.score`
- `home_team.record` + `conference_record` are **new** — this closes the "Record TBD" item in
  `BACKEND_PIPELINE_TODO.md` for Week Central
- `story_label` was populated on **0 of 219** rows — correctly dropped
- `display_score` dropped — makes the placeholder-text item in `BACKEND_PIPELINE_TODO.md` moot
- `quarter_scores` (top level), `excitement_index`, `wpa_swing`, `why_tags`, `weeks[].kpis` —
  no frontend consumer

**Frontend work, not a request:** the fetch signature changes from one file per season to one per
week. `WeekCentralProvider` and `GameCenterMicroHubPage` still point at the legacy path.

---

## Schools Directory — `/schools`

```
GET /api/schools/teams                      → shared/teams.json
GET /api/stats/player-production/{season}   → 0-data/player_stats_{season}_enriched.json
```

| Field path | Status |
|---|---|
| `$.players.{key}.image_url` | **PARTIAL** — see crosswalk below |
| `$.teams[].{id,exportId,shortName,colors,logo}` | READY |

Tiles now hide a frame rather than render a placeholder icon, so headshot gaps are visible in the UI.

---

## Player identity crosswalk — affects 4 pages

```
individual_stats[].player_key    PERS_00011465
roster players[].id              meacdsu25100001
→ zero overlap
```

Name-matching `"Last,First"` resolves 57 of 65 (88%). Failures:
```
"Murray Jr,Quinton"                suffix
"Thompson,Darmarcus QB hurried"    parser leak in the export itself
```

**Required:** one identifier carries the other's key, or emit a crosswalk table.
Affects Team Full Roster (card view is all photos), Schools Directory, Game Page player cards,
Player Page.

---

## No open requests

| Page | Note |
|---|---|
| `/player/:playerKey` | Bugs were frontend (raw vs normalized team ids). Position quality depends on the roster-hub `position_distribution` fix. |
| `/teams/:teamId/wiki` | Reads bundled `teams.json`, no pipeline dependency. Field names must match schema exactly — `marching_band`, never `band`. |

---

## Frontend bugs (not backend work)

```
src/pages/game-center/GamePage.js — fetchPlayerImages()
  requests  /data/2-schools/ALL_2025_teams_frontend_ready_v2.json
  actual    /assets/ALL_2025_teams_frontend_ready_v2.json
  reads     team.roster     actual key: team.players
  swallows the 404 → imageMap is {} on every render
  2,005 of 2,061 players have an unused image_url

src/.../TeamDashComponents.js — unused useMountEffect import, fails CI=true builds
```

---

*Last updated: 2026-08-30*
