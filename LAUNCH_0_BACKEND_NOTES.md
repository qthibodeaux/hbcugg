# Launch.0 — Backend Notes

**Started:** 2026-09-15
**Purpose:** one running document for everything the backend needs to change, add, or fix on the pages that ship in launch.0. Accumulates page by page as each is tightened. Sent as a batch once every launch.0 page has been walked — *before* any new-page reqs (Stats Hub, Team Stats, per-player production) go out, so the existing contracts are settled first.

**How to read it:** each page section lists what the current drop does against its contract, then the ask. Contracts referenced are the docs the backend already has; a note here either points at a field already specified there or names a revision to that doc. Nothing here is a new page.

**Drop being evaluated:** `93-FE Docs`, generated 2026-09-14 (context file regenerated 2026-09-15).

---

## Shared

### Week markers disagree inside the drop
`shared/football_current_context.json` (09-15) says `current_week: 3`. `game-center/hub/game_center_hub_2026.json` and every `game-center/week-central/2026/*.json` (09-14) say `current_week: 2` / `default_week: 2`, with `is_current_week: true` only on `2.json`. The hub's featured games and results rail were computed for Week 2.

**Ask:** generate the context file and every page export in the same run so all files agree on the current week. The context file is the frontend's single source of "what week is it"; the page files must match it.

### Manifest
`manifest.json` in the drop was the 08-30 file; the 09-14 manifest arrived as `manifest copy.json`. Resolved locally this time.

**Ask:** ship one `manifest.json`, overwritten each drop.

---

### 2026 roster headshots are placeholder URLs
`players/roster/player_seasons_2026.json`: of 1,845 rows, **1,479** carry an `image_url` on a fake domain (`https://placeholder-swacalc.com/images/...`), 279 are real, 87 are null. 2025 is 1,900 real / 7 null. Every 2026 headshot on the site is a dead request; the frontend now falls back to initials when the image fails.

The pattern is a host swap: `https://placeholder-swacalc.com/images/2026/8/25/BUCC9563_6ecSX.JPG` is a real athletics-site path with the host replaced by `placeholder-{team_id}.com`. 704 of the 1,479 have a real 2025 headshot under the same `person_id`, which the frontend now falls back to; the other 775 render initials.

**Ask:** restore the real host on `image_url` (the path is already correct). When a headshot isn't known, send `image_url: null` — never a placeholder URL. Same rule for `players/profile/2026/*`, which carries the same value.

### `notable_performers[].chips` drop stats the row has
Diarra (LB, Alcorn, 14.5 production) ships chips `TKL 3 / TFL 0 / SACKS 0 / INT 0 / PD 0 / HAVOC 0` while his `individual_stats.defense` row has `fumble_recoveries: 1`. The chip set is fixed per position rather than built from what the player did. The frontend now builds its desktop chips off the raw rows and only uses `chips[]` at compact/mobile.

**Ask:** build `chips[]` from the stats the player actually registered (drop zeros, include FR / hurries / clutch stops when non-zero), same rule the frontend applies.

### Game-file `player_key` is now the `PERS_` id — confirm
2026 game files carry `player_key: "PERS_00007631"` on every player row (individual_stats, game_leaders, production_scores, notable_performers), matching `person_id` in the roster. The frontend joins on it first and falls back to name+team. If that's the intended contract going forward (it resolves the stable-id item in TODO.md), say so and we'll drop the name fallback.

---

## Game Center Hub — `/game-center`
Contract: [Game Center Hub Design Doc.md](src/pages/game-center/md/Game%20Center%20Hub%20Design%20Doc.md) §3–4

### `context_cards[]` — two of four card types are never generated
§4 defines four card types: `ScheduleHeadlineCard`, `UpcomingStretchCard`, `TeamFormCard`, `RecordSplitCard`. The Week 2 payload carries one `TeamFormCard` and four `RecordSplitCard`. No `ScheduleHeadlineCard` (Game of the Week / Look Ahead) and no `UpcomingStretchCard` candidates exist in the pool.

**Ask:** generate candidates for all four types every week.

### All five cards are preseason carryover
Week 2 picks: Norfolk's final five of 2025, defending champions ×2, "us vs the world" ×2. With two weeks of 2026 results on the board, nothing about the current season made the top five.

**Ask:** once `current_week >= 1`, current-season candidates outrank carryover candidates. Carryover cards should decay to zero by roughly Week 4.

### `standings.{group}` — no-leader state needs two fields
Before conference play, every row is `is_leader: false` at `0-0` (SWAC East and MEAC today). The card can't show a "leader" then — nobody is one. It shows the defending champion on top and the date conference play starts underneath. Neither is in the payload.

**Ask:** add to each standings group:
```text
standings.{group}.defending_champion: {
  team_id: string                   // v5 id
  record: string                    // that season's conference record, e.g. "7-1"
  season: integer                   // e.g. 2025
} | null
standings.{group}.conference_play_begins: {
  date_label: string                // e.g. "Oct 3"
  date: string                      // ISO
} | null
```
Send both on every group, every week (`null` once conference play is underway is fine). The frontend keys the state off `is_leader`, not off these fields.

### Featured games — no forward bound
Slot 2 at Week 2 is a Week 13 preview (GSU/SU, Nov 28). §4 allows past games in the pool but sets no forward window.

**Ask:** featured pool = games from the previous two weeks through the next two weeks, plus any conference championship or Celebration Bowl regardless of distance.

### §4 payload revisions (doc revision pending — will be sent with this batch)
The current card payloads can't support the cards as designed:

- **`UpcomingStretchCard.games`** is `string[3]`. Needs objects so the card can show opponents and why the stretch is hard:
  ```text
  games: [3]{
    opponent_id: string | null        // v5 id; null for a non-covered opponent
    opponent_short: string
    home_away: "home" | "away" | "neutral"
    date_label: string
    opponent_record: string | null
  }
  ```
  The team is chosen by the engine (hardest upcoming three-game stretch), stated in `why_reasons`.
- **`TeamFormCard.results[]`** is `{ result, margin }`. Each entry needs the game behind the bar:
  ```text
  results: [5]{                       // oldest → newest, unchanged
    result: "W" | "L"
    margin: integer                   // absolute, unchanged
    opponent_id: string | null        // v5 id; null for a non-covered opponent
    opponent_short: string
    opponent_record: string | null    // opponent's record entering that game
    home_away: "home" | "away" | "neutral"
    score: { team: integer, opponent: integer }
    date_label: string
  }
  ```
  Who they played and the score are the point of the card — the bar alone says nothing. The frontend already renders these columns when present and falls back to bar-only when absent.
- **`RecordSplitCard.record`** is being sent as a count ("2 games") on the *Us vs the world* cards. `record` is the headline number and must be a W-L (`2-0`); the rate belongs in `detail`.
- **`ScheduleHeadlineCard`** has no selection rule. Rule: highest-stakes covered matchup in the coming week — SWAC/SWAC, MEAC/MEAC, or the MEAC–SWAC cross — with stakes in `why_reasons`. A second instance, if ranked, is the week after. `footer` must be a value the backend owns (record comparison, projected margin, rivalry series), not an excitement number.

---

## Week Central — `/game-center/week`
Contract: [Week Central Design Doc.md](src/pages/game-center/md/Week%20Central%20Design%20Doc.md) §3, §5

### `brief` missing on every game
§5 specifies an embedded `brief` per game (source, line score, MVP, ten metrics, five leaders). No game in any `week-central/{season}/{week}.json` carries it.

**Ask:** ship `brief` per §5. For games without a parsed file, `source: "schedule_fallback"` with the other blocks null — never omit the key.

### `story_label` missing
§3 lists `story_label` per game. Not present.

### Records are empty for opponents outside the 18
`week-central/2026/2.json`, NC A&T at NC Central: `away_team: { team_id: "meacncat", name: "NC A&T", record: "", conference_record: "" }`. Every non-covered opponent (Miami, Indiana, Bowie State, Stetson…) ships `record: ""`, so the row prints "Record TBD" next to a real 1-1 on the other side. The schedule scrape carries the opponent's record on the game page; it should be on this row too.

**Ask:** `record` for both sides on every game, entering that game. If the source genuinely has no record for a non-D1/FCS opponent, send `null` and the frontend omits the line — never `""`.

### Naming
The doc said `has_detail_page`; the drop uses `has_game_page`, consistent with every other page. Frontend is adopting `has_game_page`; the doc will be corrected. No backend change.

### League averages — two gaps for the Team Stats block
`shared/league_avg_{season}.json` is now wired as the notch (avg) and fill scale (max) on the brief's Team Stats. Two rows can't use it:

- **Yards per play** has no league key — it's derived on the frontend as `total_yards / plays_offense` (the game page does the same). Ask: ship `team_box.yards_per_play` on the game file and in `league_avg.keys`, so both the value and its context are yours.
- **Team season averages** (`shared/team_season_avg_{season}.json`) only carry `rushing / passing / defense_impact` groups, not the ten fields on this block. Fine for now — the notch is the league average — but if you want a *team's own* season average as a second mark, the file needs those keys.

### Championship placeholder rows appear as games
`week-central/2025/15.json` carries a game whose `away_team.name` is "Southwestern Athletic Conference Championship" (`team_id: null`) at FAMU — the same placeholder-row problem as Team Schedules. It renders as a matchup against a school by that name.

**Ask:** same rule as Team Schedules — placeholder rows carry `is_placeholder: true` (or are omitted from `games[]` until the matchup is set).

### Week markers
See *Shared* above: `is_current_week` / `default_week` in these files lag the context file by a week. The frontend selects the week from the context file, so the page shows Week 3 while `2.json` still claims to be current.

---

## Games Hub — `/game-center/games`
Contract: [Game Center Fetch Contract.md](src/pages/game-center/md/Game%20Center%20Fetch%20Contract.md) §Games Hub — **stale**

The page is no longer the narrative story-card layout the contract describes. It is a full-season grid of every game, updated as results land. The 214 `story_cards` + `dynamic_candidates` in `games_hub_2026.json` are not read.

**Ask:** hold on any further story-card work for this page. A replacement design doc and contract follow in this batch.

### Scores and statuses are stale *(noted 2026-10-01)*
The page needs the latest results from the backend. In `games_hub_2026.json`, games that have already been played still carry `status: "scheduled"`, no scores and `game_path_id: null` — for example `HUAAMU29082026`, `NCCUTSU29082026` and `ASUSU29082026` (all Aug 29). The games index and the team schedules both have these as final with a game page. Of 129 unplayed rows between two of the 18, 17 are in this state.

Spring rows are also present with the same team on both sides (e.g. `2026-04-18-swacgsu-swacgsu`). **Ask:** regenerate `games_hub_{season}.json` from the current results so `status`, scores, `game_path_id` and `route` match the game index; mark or drop intrasquad / spring rows.

Frontend note: unplayed games between two of the 18 now link to `/game/preview/:gameId`; the preview page redirects to the played page if the games index already has the game, so a stale row still lands somewhere correct.

### Duplicate games and spring rows — one row per game *(added 2026-10-04)*
`games_hub_2026.json` (`story_cards`, 214 rows) carries the same game more than once. **67 date + matchup pairs appear twice**, in two forms:
- the same `game_id` twice — `HUAAMU29082026`, `NCCUTSU29082026`, `ASUSU29082026`, `SCSUFAMU06092026`, `TSUPVAMU06092026`, `UAPBALC12092026`;
- one row per team's schedule with the ids mirrored — `2026-09-26-meacscsu-swacbcu` and `2026-09-26-swacbcu-meacscsu`; `2026-09-26-swacaamu-swacfamu` and `…-swacfamu-swacaamu`.

Two spring rows sit before the season with no week: `2026-04-11-meacnccu-maroon-gray-game` (away team "Maroon & Gray Game") and `2026-04-18-swacgsu-swacgsu` (GSU vs GSU).

**Ask:** one row per real game, keyed by one canonical `game_id` (away/home order, not per-team), with the played/unplayed state from the game index. Leave spring and intrasquad games out of the season schedule entirely (or put them in their own list with `game_type: "spring"` if they're wanted elsewhere). The frontend's existing id-based dedupe can't catch mirrored ids, and it won't grow matchup-guessing or spring filtering on top of it. The same check should run on `schedule_board_{season}.json` and the team schedule files.

---

## Team Schedules — `/game-center/team`, `/teams/:teamId/schedule`
Contract: [Team Schedules Design Doc.md](src/pages/game-center/md/Team%20Schedules%20Design%20Doc.md), Response Spec §11

### Conference-championship placeholder rendered as an opponent
Alabama State 2026 has a Dec 5 row with `opponent.name: "Southwestern Athletic Conference"`, `team_id: null`, `opponent_class: "non_hbcu"`. It renders as a game against a school named "Southwestern Athletic Conference".

**Ask:** placeholder rows ship as `opponent: { team_id: null, name: "TBD" }` with `is_placeholder: true` (or `event.kind: "conference_championship"` and `opponent` null). The frontend will not name-match on the opponent string.

### `venue.stadium_name` carries the city on 2026 rows
`team-schedules/2026/swacjsu.json` game 1: `venue: { stadium_name: "Nashville, Tenn.", venue_label: "John Merritt Classic", city: "Nashville, Tenn." }`. 2025 rows have the same pattern in places (`stadium_name: "Stripe Out"`). The card prints `stadium_name` as the stadium line, so it reads "Nashville, Tenn." twice.

**Ask:** `stadium_name` is the stadium; `city` is the city; `venue_label` is the event/classic name. When the stadium isn't known, send `null`, not the city.

---

## Game Page — `/game/:gameId`
Contract: [Game Page Fetch Contract.md](src/pages/game-center/md/Game%20Page%20Fetch%20Contract.md) (2026-09-14)

### Summary tab — now reading `score_by_quarter`, `win_probability`, `drive_summary`
All three ship on every 2026 file and are wired. Checked against `uapbalc26` (2OT, ALCN 53–UAPB 51):

- **`score_by_quarter`** — correct, `labels[]` carries `OT1`/`OT2`, `verified_against_final: true`. No ask.
- **`drive_summary[]` stops after OT1.** 28 drives; the last two are the OT1 touchdowns (`score_after` 38-44, 44-45). The OT2 possessions (UAPB 6, ALCN 8) are not in the list. **Ask:** every possession through the end of the game, OT included.
- **`drive_summary[].score_after` lags on scoring drives.** D001 (ALCN TD) → `{home: 0, away: 0}`; D004 (UAPB TD +PAT) → `12-3` when it should be `12-10`; D027 (OT TD) → `38-44` instead of `38-45`. Non-scoring drives are right, and D002/D003 are right. It reads as "score after the last play in `play_ids`" with the scoring play or PAT excluded. **Ask:** `score_after` = the score once the drive and its try are over.
- **`drive_summary[].time_of_possession` missing.** Both clocks are there; the elapsed time isn't. The TOP column dashes. **Ask:** `time_of_possession: "m:ss"` per drive.
- **`drive_summary[].penalties.yards` sign.** D001 has `penalties: {count: 2, yards: -10}` and `yards_net_penalty: -10`; D028 has `{count: 3, yards: 5}`. Confirm: negative = against the offense, positive = against the defense? The column shows `count · |yards|` until this is settled.
- **`is_overtime` drives carry `quarter_start: 4`, `clock_start: "15:00"`.** Fine for the table (the row is labelled OT off the flag), but see win probability below.
- **`win_probability.timeline` ends at Q4 0:00 with the score 44-45.** 157 points, last `sequence: 299`, OT plays are either absent or tagged `quarter: 4` with a restarted clock. The chart spaces points by play order so it can't fold back on itself, but the OT swings never appear — the line ends near 50% and `final.home: 1.0` is a cliff. **Ask:** timeline points for OT plays with `quarter: 5, 6…` (or `period: "OT1"`), so the chart can draw and label them.
- **`win_probability.source: "model"`** — the card shows "Pregame ALCN 51%" from `pregame_home` instead of a source badge. If you'd rather it say which model, send a display string.
- **Spot labels** (`ALCN 14`, `UAPB 9`) are composed on the frontend from `start/end_yardline_absolute` (own side ≤ 50). If you'd prefer to own the string, ship `start_spot` / `end_spot`; otherwise no change.

### `scoring_plays[]` — wired; three asks
Now driving the Scoring Plays card (`period`, `clock`, `team_id`, `points`, `scoring_type`, `play_type`, `players[]`, `score_after`, `drive{}`). Checked against every 2026 file (106 rows).

- **No yardage field.** The headline wants "Kelly 28 Yd Pass from Tolbert"; the 28 lives only inside `description`. The card prints "Kelly Pass from Tolbert" until it ships. **Ask:** `yards: integer | null` on every row (pass/rush/return distance, FG distance).
- **Tries ship as separate rows.** Each PAT / two-point row follows its TD with the same `period`/`clock`. The frontend folds the try into the touchdown (points add, kicker becomes the parenthetical, running score is the try's). Missed tries don't appear at all, so a 6-point row is the only signal a PAT failed. **Ask (either):** nest the try on the TD row as `try: { type: "PAT" | "TWO_POINT", result: "good" | "failed", players[] }`, or keep the rows and add failed tries with `points: 0`. One of the 2026 PAT rows (`uapbalc26`, Q4 14:44) has `drive_id: null` while its TD has `D017`.
- **OT2 rows are missing** — same cut-off as `drive_summary`: the file ends at 45-45 after OT1; the OT2 scores (UAPB 6, ALCN 8) aren't there.
- **`drive.time_of_possession_seconds` is `null` on all 106 rows.** Column dashes.
- **`scoring_summary[]`** is a strict subset of `scoring_plays[]` (six of its twelve keys). Not read; drop it or leave it.

### Metrics card (`advanced_basics.blocks`) — national average row
The card now reads `advanced_basics.blocks` by field path and fills its third row from `shared/league_avg_{season}.keys[path].avg` — all 21 paths resolve for 2026, so "Lg Avg" is real. That is the 18-team league average. The reference sheet (Connelly's advanced box score) prints a **national** average under every block, which is the number that tells a reader whether 6.4 plays per drive is good.

**Ask:** a national (FCS, or FCS+FBS — say which) average per key, alongside the league one. Suggested: `shared/national_avg_{season}.json` with the same `{ keys: { path: { avg, min, max } } }` shape, or a `national_avg` field beside `avg` in the existing file. The card will label the row "Natl Avg" once it's there; "Lg Avg" stays as-is until then.

Also: `advanced_basics.blocks[].metrics[].key` is the field path (`derived.plays_per_drive`) while the Fetch Contract shows short keys (`playsPerDrive`). Frontend maps the path — no change needed, but the doc will be corrected to the path form since it doubles as the league-avg key.

### Rushing Production team line — season context (`shared/team_season_avg_{season}.json`)
The team line is now Connelly's six rushing columns off `rushing_splits[team].total` (YPC, LY/rush, success rate, opportunity rate, highlight/rush, stuff rate), each with a meter: fill vs league max (all six keys resolve in `league_avg`), a notch at the team's season average, and a second notch at what the opposing defense allows. Two gaps in the season file:

- **`teams[team].rushing`** carries `successRate`, `opportunityRate`, `stuffRate` — three of the six. **Ask:** add `yardsPerCarry`, `lineYardsPerRush`, `highlightYardsPerRush` (season-to-date, same definitions as `rushing_splits.total`).
- **No defense-allowed block.** **Ask:** `teams[team].rushing_defense` with `yardsPerCarryAllowed`, `lineYardsPerRushAllowed`, `successRateAllowed`, `opportunityRateAllowed`, `highlightYardsPerRushAllowed`, `stuffRateAllowed` (the defense's own stuff rate). The frontend already reads these keys; the notch draws the day they ship.
- Note `highlight_yards_per_rush` is per rush; Connelly's sheet prints highlight yards per *opportunity*. If you can ship `highlight_yards_per_opportunity` too, the column goes back to his label.

### Series cards — `series_summary` — SHIPPED (uapbalc26 drop, 2026-09-16)
`series_summary[team]` landed exactly as the Game Export Fetch Contract specced it (`series`, `chains_moved_on`, `results`, `conversion_rate`); the two Summary-tab cards and the Drives poster read it now. It sits both at the top level and under `game_export.series_summary` — one copy is enough (the frontend reads the top level). Still open: a league line for `series_summary.conversion_rate` (`league_avg.keys`) — the Offense poster's "Series Conversion" row has no Lg Avg without it.

### Game Export — `game_export` block — SHIPPED with three follow-ups
The four export posters (`/game/:gameId/export`) now read the drop. What came in vs. the contract (`src/pages/game-center/md/Game Export Fetch Contract.md`):

- **`game_export.biggest_plays`** ships split as `.regulation` / `.overtime`, each with its own top-3 positive / top-3 negative, instead of one game-wide list. The poster folds the two into a game top 3 (any play in the game's top 3 is in its period's top 3, so this is a pick, not a recompute). Overtime rows carry `quarter: 4, clock: "00:00"` — the poster labels them "OT" from the list they came from. **Ask:** either a `period: "OT1" | "OT2"` field on the play, or the actual overtime number so the row can say which OT.
- **`game_export.regulation` / `.overtime`** carry the whole Image 1 stat list per period. Backend (2026-09-16): Yards / Play and Red Zone EPA / Play are to be read from `game_export.regulation[team].yards_per_play` and `.red_zone.epa_per_play` — wired, both rows fill now — and the league file will carry those two (plus the rest of `game_export`'s rows) by the same path at the next regen. **One thing to settle:** those two rows are regulation-only while the other twelve rows read the whole-game blocks (`advanced_team`, `team_box`, `passing_splits`…). For an OT game the poster mixes bases. Once the regulation league keys land, the clean fix is to read all of Image 1 off `game_export.regulation` — say if you'd rather we keep whole-game and ship `game_export.total` instead.
- **Receiving efficiency shipped** — `success_rate`, `epa_total`, `epa_per_target`, `adot`, `explosive_receptions` are on every receiving row now and the Production tab / Boxscore poster columns light up. **Still missing the league line:** `league_avg.keys` has no `receiving_splits.total.success_rate` / `.epa_per_target`, so receiving SR% / EPA/Tgt cells don't shade.
- Rushing row explosive field is `explosive_carries` (the contract wrote `explosive_carries_10`) — frontend reads `explosive_carries`; confirm the threshold is 10+.
- **Team Total rows on the Boxscore posters.** The receiving Team Total reads `passing_splits[team].total` — `success_rate` and `epa_total` fill, but there's no `yards_per_completion`, `explosive_receptions`, or `epa_per_target` on the block, so Yds/Rec, Expl and EPA/Tgt dash. Rushing Team Total reads `rushing_splits[team].total`, which has no `explosive_carries`. **Ask:** add those four to the unit totals.
- New on the drop and not yet used anywhere: `time_of_possession` (per-team `seconds` / `display` / `share` — a team total, so the Drive Summary's per-drive TOP column still dashes; the per-drive ask stands), `defensive_impact`.

### Production tab — player rows
The passing / rushing / receiving roster tables now read straight fields and score each on its own `components` entry (`passing_production` in the passing table, `rushing_production` in rushing, `receiving_production` in receiving — no more QB rushing points in the passing table). Three asks:

- ~~Receiving rows have no efficiency.~~ **Shipped 2026-09-16** — `success_rate`, `epa_total`, `epa_per_target`, `adot` on every receiving row.
- **League baseline for receiving — still open.** `league_avg.keys` has `passing_splits.total.*` and `rushing_splits.total.*`; the receiving columns shade against `receiving_splits.total.success_rate` / `.epa_per_target`, which don't exist. **Ask:** add them (or point us at the key you'd rather we use).
- **Interceptions in `passing_production`.** Confirm the component already penalises INTs and lost fumbles. Either way, **ask:** ship the penalty as its own number — `components.passing_production_penalty` (negative) — so the table can show what an INT cost, not just the net.

### Havoc spatial chart — `havoc_events[]` on the defense row
The Defensive Production spotlight plots one dot per havoc play the defender made: the play's **lane** on x, the event's **yards from the line of scrimmage** on y. The chart only places coordinates; the computation is yours. Per-play `havoc` / `havoc_components` / `players[].role` already identify the plays and the defender — this just needs the coordinate on the player.

**Ask:** on every `individual_stats[team].defense[]` row:
```text
havoc_events: [{
  play_id: string
  category: "TFL" | "SACK" | "PBU" | "INT" | "FF"
  lane: "left" | "middle" | "right"       // the play's direction (rush direction; pass direction; a sack = middle unless the call says otherwise)
  yards_from_los: integer                 // event spot − LOS, signed, in absolute yardline terms
}]
```
Worked example, UAPBALC12092026-… "2nd and 8 at APB28 … pass incomplete short right to Griffin thrown to APB15 broken up by Henderson": LOS abs 72, thrown-to abs 85 → `{ category: "PBU", lane: "right", yards_from_los: 13 }`. A TFL "rush left for 4 yards loss" → `{ "TFL", "left", -4 }`. A sack for −4 with no direction → `{ "SACK", "middle", -4 }`. An INT is measured at the interception spot; an FF at the fumble spot. Send `[]` for a defender with no havoc plays.

**Follow-up *(2026-10-04)*:** shipped on every 2026 defense row, as `yards` rather than `yards_from_los` (the frontend now reads either). `yards` is `null` on every PBU (101) and every FF (14) across the 17 games, so those plays can't be placed. **Ask:** fill `yards` for PBU (thrown-to spot − LOS, per the worked example above) and FF (fumble spot − LOS).

### Special Teams — contract review needed before the panel is designed
The contract's Special Teams block ([Game Page Fetch Contract → Special Teams Production](src/pages/game-center/md/Game%20Page%20Fetch%20Contract.md), marked OPEN) asked for five phases at the unit level plus `net_field_position` as the hero. The drop counters with three blocks — `special_teams_production`, `special_teams_advanced`, `special_teams_individual` — and many more fields than the ask. Several read as ideas rather than defined metrics. **Frontend and backend need to sit down on this block together** before the panel is designed; until then the frontend surfaces the plain counts only. Specific items:

- **Per-attempt kick log — the ask that matters most.** Every kick is an aggregate. For `uapbalc26` the story is a sequence — three failed PATs (Q1 10:51, Q1 4:35, Q4 12:14), a 30-yard miss at the half, a 21-yard block by Henderson at 0:00 in regulation that would have won the game — and none of it is a field; it lives in `raw_text`. **Ask:** per team, `special_teams_production[team].kicks[]` (or per phase): `{ play_id, quarter, clock, kind: "FG" | "PAT" | "TWO_POINT", distance, result: "good" | "no_good" | "blocked" | "failed", blocked_by: player_key | null, kicker: player_key, wpa, epa }`. Same shape idea for punts and kickoffs if you have it — but kicks first.
- **`summary.hidden_yards: 0` and `special_teams_advanced.summary.st_swing_yards: 0.0`** for both teams in this game, while `kickoff_offense.espa` is −6.07 / +3.79 and Alcorn's kicks cost −0.41 WPA. Either these measure something narrower than the names suggest, or they're not computing. Define them or drop them.
- **`fg_offense.kicker_talent_trust_range`, `coach_aggression_threshold`, `coach_aggression_gap`** — undocumented. Definition, units, and what a reader is meant to do with them, or drop.
- **`by_situation` on kicks** (clutch / one_score / goal_line / two_minute_drill) and **`zone.flip` / `zone.pin` on punts** — define the buckets (what makes a kick "clutch"; where the flip/pin boundary is). Not surfaced until defined.
- **EPA / WPA per phase** (`avg_*_per_attempt`, `total_*`) — these are the most useful numbers in the block (Alcorn `fg_offense.total_wpa −0.41` is the game). Confirm the sign convention is "positive = good for this team" in every phase, including the defense/return ones.
- **Two-point conversions** — no block anywhere. The scoring rows carry `TWO_POINT`; the special-teams blocks don't. **Ask:** `two_point: { attempts, made, by_type: { pass, rush } }` per team, plus the attempts in the kick log above.
- **Kickoff defense** — `special_teams_production.kickoffs.defense` and `special_teams_advanced.kickoff_defense` overlap but don't match names (`return_yards_allowed` vs `avg_return_yards`; `avg_start_allowed` appears under both offense and defense with different values). One shape per phase, same names in both blocks.
- **No `special_teams_production` component** in `production_scores[].components` — the contract asked for it. Ship it or say special teams is out of the score.
- **`special_teams_individual` rows are name-only**, no `player_key`; `punters[].name` is lowercased ("wiles-khoehler,george"). Every other unit's rows carry `PERS_` ids. Same ids, same casing.

### Team abbreviation for Alcorn
The game file uses `short_name: "ALCN"` / `abbreviation: "ALCN"` for Alcorn. The frontend's `teams.json` still carries `ASU` for Alcorn (collides with Alabama State). Adopting `ALCN` — no backend change.

### `drive_summary[].start_yardline_absolute` slips one drive *(added 2026-10-04)*
In `uapbalc26`, from D010 on, each drive's start spot is the previous drive's: D011 (Alcorn, after a punt) ships `start: 43` — D010's first snap was at APB 43 — and D012 (UAPB, after a punt) ships `start: 11`, which is D011's first snap at ALC 11. D012 actually began at ALC 38 (offense-relative 62): 3 plays, 38 yards, TD. `end_yardline_absolute`, `yards_net`, `epa` and the result are correct; only the start is shifted.

Across the 14 games in `game-center/games/2026/`, **140 of 364 drives** have a start that doesn't equal `end_yardline_absolute − yards_net` (some of that may be penalty yardage, but the uapbalc26 shift is unambiguous). Worst: `aamufamu26` 18/33, `mvsuasu26` 18/29, `scsufamu26` 15/26.

Everything drawn from the start spot is wrong on those drives: the drive bars (mobile + desktop Drives), the Scoring Plays field strip (`scoring_plays[].drive.start_yardline_absolute` — check it shares the bug), and the drive detail's start spot.

**Ask:** set each drive's `start_yardline_absolute` from that drive's own first scrimmage snap (offense-relative, same scale as `end_yardline_absolute`), and regenerate the 2026 game files. The frontend will not re-derive it from the play-by-play.

### Play-by-play `description` / `spot` missing on six 2026 games *(added 2026-10-04)*
The rewritten play sentence (`play_by_play[].description`) and `spot.display` (Batch 2026-09-20 §4b) ship on 8 of the 14 game files in `game-center/games/2026/`. These six carry neither — every row is crew text only ("1st and 10 at ALC14 No Huddle-Shotgun Tolbert,Jaylon pass…"): `asusu26`, `huaamu26`, `nccutsu26`, `scsufamu26`, `tsupvamu26`, `uapbalc26` (all from the 09-14/09-16 drops).

The frontend now renders `description` (with `raw_text` on expand) and falls back to `raw_text` only where `description` is absent.

**Ask:** regenerate those six with the §4b strings, and keep `description` on every row type (timeouts, end of quarter included) going forward.

*Remaining tabs (Player Production, Team Stats, Play-by-Play) — pending walk.*

---

## Conference Slate · Season Schedule · Standings
*Pending walk.*

---

## Schools · Team Hub · Rosters · Player

New requests for this section *(2026-10-04)*: [Schools Hub Fetch Contract.md](src/pages/teams/md/Schools%20Hub%20Fetch%20Contract.md) (new weekly file), [Roster Hub Fetch Contract.md](src/pages/players/md/Roster%20Hub%20Fetch%20Contract.md) (adds `generated_at` / `roster_as_of` and refresh rules to the existing files), [Team Profile Fetch Contract.md](src/pages/teams/md/Team%20Profile%20Fetch%20Contract.md) (supersedes `reqs/BACKEND_RESPONSE_SPEC.md` §10, adds `as_of_week` / `generated_at` / `preview_path_id`, star `image_url`).

### Team profile docs are frozen at the start of the season *(added 2026-10-04)*
All 18 files in `schools/team-hub/2026/` were built around week 0 and never rebuilt:
- **Records are last season's.** PVAMU ships `10-4`, conf `7-1`, "1st - SWAC West"; JSU `9-3`; SCSU `10-3` — the 2025 finals, while 2026 is ~4 games in.
- **`last_5` holds one game** (BCU none); `previous_game` is Aug 27–29 for every team and `next_game` is Sep 10–19, though Alcorn, GSU, MVSU and PVAMU have played through Oct 3.
- **Empty on all 18:** `coach_carousel` (`[]`), `star_impact` (`null`), `header.avg_par` (`null`). `top_stat` and `unit_carousel.slides` exist for only 6 teams (AAMU, ASU, HU, NCCU, SU, TSU).

**Ask:** rebuild every team document weekly per the Team Profile contract — this season's results through `as_of_week`, previous = most recent completed game, next = next scheduled game, and the coach / star / unit / top-stat blocks filled once a team has played.

---

## Game Preview — `/game/preview/:gameId` *(added 2026-10-01)*
Contract: [Game Preview Fetch Contract.md](src/pages/game-center/md/Game%20Preview%20Fetch%20Contract.md) — **new, one export per upcoming game**

The page is live but its unit-matchup table is placeholder and its kickoff, series and event history rest on client workarounds.

**Ask:** build `game-preview/{season}/{game_id}.json` (shape in the contract). The three that matter most: kickoff as an ISO timestamp with offset; real unit stats with league ranks and `games_played`; series and event history resolved on the backend, with every covered opponent carrying a v5 `team_id`. The contract also lists seven known data problems the page works around today, and the freshness rules (rebuild every upcoming-game preview whenever a game is played or parsed).

---

## Team Analytics — follow-ups on the 2026-10-04 drop
- **`hub_2019.json` carries 19 teams** (`meacncat`, NC A&T). The frontend filters to the 18; drop it from the file or confirm it is intentional.
- **MEAC `conference_record` is 0-0 for all six in 2026**, so `division_rank` 1–6 is alphabetical. **Ask:** `division_rank: null` until a team has a conference game, or rank on overall record and say so.
- **Definitions** (success, explosive, havoc): frontend decision pending on whether the glossary changes or the files switch.
