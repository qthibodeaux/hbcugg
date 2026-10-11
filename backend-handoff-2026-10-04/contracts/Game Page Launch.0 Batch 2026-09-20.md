# Game Page — launch.0 contract (merged, 2026-09-20)

**Date:** 2026-09-20 · **Payload:** `92-frontend/1-game center/games/{season}/{game}.json` (`_schema` `frontend_ready_v4`) · **Sample:** `asusu25_frontend_ready_2026-09-20_sample.json`
**Supersedes:** the game-page section of `LAUNCH_0_BACKEND_NOTES.md` (2026-09-15) and `FRONTEND_HANDOFF_team_stats_2026-09-20.md`
**Companion contracts:** `Game Page Fetch Contract.md` (2026-09-20 revision), `Game Export Fetch Contract.md`, `Game Page Production Contract.md`

This is one document: the 09-20 handoff carried forward in full, with what the frontend additionally needs written next to the block it belongs to. Everything the handoff specified is kept as written; additions are marked **ADD** and asks are marked **ASK**. Nothing here is a new page. Every path cited was checked against the sample.

**Timing (from the handoff, unchanged).** The published game files are from the 2026-09-16 bundle. Everything marked *new* is in the builder now and reaches the published files at the next full regeneration; the frontend builds against the sample until then. League averages (`92-frontend/0-data/league_avg_{season}.json`, keyed by payload path) carry the new keys after the same run.

---

## 1. Rules that apply to every row

Handoff §1, adopted verbatim as the rendering rules for the Team Stats and Player Stats tabs.

1. **A rate is never shown without its count.** Every rate has its numerator and denominator next to it (`plays`, `drives`, `attempts`, `punts`, `kicks`). The count shows in the cell or on hover.
2. **Null is "—", zero is "0".** A null rate means the denominator was 0. A 0 means it happened and the answer was none. Null is never rendered as 0 or 0%.
3. **`min_n` is the backend's.** Each section file states the floor under which a rate shows "—" even when non-null; the section files carry the values.
4. **Both teams' numbers come from one file.** A team's `defense` cell is the other team's `offense` cell, `returns_faced` is the other team's `returns`. The client does not derive one from the other.
5. **Paths are the contract.** If a row is not in a `CONTRACT_1.0/NN_*.md` file it is not rendered; a row that is wanted and not there is asked for here — never guessed.

**ADD — rule 6.** *Mixed denominators are labelled.* "Plays" is `team_box.plays_offense` (box plays); "Defensive plays" is the opponent's `advanced_team.eligible_scrimmage_plays`. Both are right; the label says which.

**ASK — the section files.** Rules 3 and 5 depend on `CONTRACT_1.0/`, which the frontend does not have: `01_penalties.md`, `02_trenches.md`, `03_defensive_impact.md`, `04_coaching.md`, `05_situations.md`, `08_special_teams.md`, `PBP_row.md`, `TABLES_production_and_team_stats.md`, and the 06 / 07 sheets once written. Until they arrive the Team Stats tab applies a flat `plays < 5 → "—"` floor.

---

## 2. Page structure — panel → section → payload block

Handoff §2, with the panel list resolved into the order the tab renders (the reference layout is GameOnPaper's team-stats page). The last column points at the row list in §7.

| Panel | Section | Reads | Status (handoff) | Row list |
|---|---|---|---|---|
| Overall — percentile strip | 06 (pending) | `advanced_team`, `passing_splits`, `rushing_splits`, `situations`, `trenches` + `league_avg` distribution | keep; fix TOP | §7.1 |
| Expected points | 06 Offense core (sheet not yet written) | `advanced_team.epa_ledger` (*new*), competitive / WPA rates | rows exist today; phantom keys die | §7.2 |
| Production | 06 | `team_box`, `passing_splits`, `rushing_splits` (Total / Standard / Passing downs) | rows exist today | §7.3 |
| Rushing — trenches | 02 Trenches (`02_trenches.md`, locked) | `trenches.{team}.run_blocking` | shipped 09-13; page not reading it | §7.4 |
| Pass protection · pass rush | 02 Trenches (locked) | `trenches.{team}.{pass_protection, pass_rush}` | shipped 09-13 | §7.5 |
| Explosiveness | 06 | `advanced_team` explosive counts, `explosive_by_down` (*new*) | rows exist today | §7.6 |
| Situational | **05 Situations & response** (`05_situations.md`) | `situations.{team}` (*new*), `sequence_model.{team}` | built, awaiting mark-up → **§7.7 is the mark-up** | §7.7 |
| Drives | 07 Drives / 3rd–4th / turnovers (sheet not yet written) | `team_box` (+ `drive_results`, drive counts — *new*), `advanced_team` (+ `available_yards` — *new*), `situations.drives`, `drive_summary[]`, `time_of_possession` | rows exist today | §7.8 |
| Third & fourth downs | 07 | `team_box` (+ `fourth_down_snaps`, `two_point_*` — *new*), `coaching_profile.fourth_down_decisions`, `special_teams.two_point` | rows exist today | §7.9 |
| Defensive | 03 Defensive impact (`03_defensive_impact.md`, locked) | `defensive_impact.{team}`, `trenches.run_defense` | shipped 09-16; replace the panel wholesale | §7.10 |
| Turnovers | 07 | `team_box`, `advanced_team` (+ `competitive_turnovers` — *new*), `situations.drives.response` | rows exist today | §7.11 |
| Penalties | 01 Penalties (`01_penalties.md`, locked) | `penalty_profile.{team}`, `uncounted` | shipped 09-13; page reads retired keys | §7.12 |
| Coaching | 04 Coaching (`04_coaching.md`, drafted) | `coaching_profile.{team}` | reshaped block ships; awaiting mark-up → **§7.13** | §7.13 |
| Special teams | **08 Special teams** (`08_special_teams.md`) | `special_teams.{team}` (*new*), `special_teams_individual.{team}` | built, awaiting mark-up → **§7.14 and §8** | §7.14 · §8 |
| Data quality & coverage | all | `time_of_possession.status`, `penalty_profile.{team}.data_quality`, `special_teams.{team}.kicks_without_kicker`, `special_teams_individual.{team}.unattributed`, `enrichment_summary` | one panel | §7.15 |

Per-player tables: `CONTRACT_1.0/TABLES_production_and_team_stats.md`. Play-by-play row: `CONTRACT_1.0/PBP_row.md`. Venue and event entities: `FRONTEND_HANDOFF_coverage_2026-09-15.md` §7 — **ADD**: the venue / event shape the frontend renders is restated in §5.2 of this document, because the sample does not match the coverage handoff.

---

## 3. What is new in the payload (2026-09-20)

Handoff §3, reproduced in full. Frontend additions follow each block.

### 3.1 `situations.{team}` — the situation taxonomy (section 05)

```text
situations.{team}
  definitions.{situation}             {label, rule}        the 13 situations in football words
  splits.offense.{all|pass|rush}.{situation}
  splits.defense.{all|pass|rush}.{situation}               what this team allowed
        cell = {plays, successes, success_rate, epa_total, epa_per_play, explosive_plays, explosive_rate}
        third_down adds avg_distance; the `all` unit adds penalty_epa_plays / penalty_epa when present
  havoc.{forced|allowed}.{situation|pass|rush}             {plays, havoc_plays, rate}
  drives.drives, drives.overtime_drives
  drives.field_position.{short_field|favorable|normal|negative|backed_up}      ledger
  drives.score_state.{leading|tied|trailing|one_score}                          ledger
  drives.leverage.{faced_crucial_down|survived_first_crucial_down|red_zone|goal_line|clutch|two_minute}   ledger
  drives.leverage_totals   {crucial_snaps, crucial_snaps_per_drive, survival_streak_sum, longest_survival_streak}
  drives.hardship          {drives_with_hardship, hardship_total, per_drive, negated_touchdown_net_loss, backed_up, negative_field_pos}
  drives.opportunity       {drives_with_opportunity, opportunity_total, takeaway_received}
  drives.response.{after_own_turnover|after_takeaway|after_opponent_score|after_defensive_stop|after_halftime}   ledger
  drives.response.drives_with_trigger, stack_total
  drives.load              {total, per_drive, max, drives_by_load: {"0","1-2","3-5","6+"}}
        ledger = {drives, points, scoring_drives, touchdowns, score_rate, points_per_drive}
```

Situations: all · standard_down · passing_down · early_down · late_down · third_down · fourth_down · red_zone · goal_to_go · two_minute · middle_8 · competitive_time · garbage_time. `competitive_time + garbage_time = all`.

Display (05 §A–F): a situational-efficiency table (rows = situations, columns = plays · success · EPA/play · explosive, offense | defense; pass / rush on expand); a field-position ledger; the response triggers as rows (drives · points · score rate, with `sequence_model` supplying after-3-and-out, sudden change, stabilization and the lead-change row); an under-pressure ledger (score state, crucial downs faced / survived, red zone, clutch, two-minute, hardship); one situational-load line **as context, never as a grade**.

**ADD — how the frontend renders it:** exactly the display above; the row list is §7.7 and §7.8. `definitions.{situation}.rule` is shown verbatim on hover of the row label. **ASK:** `05_situations.md` for `min_n`. **ASK:** the engine's `advanced_team.competitive_epa_per_play` and `situations.splits.offense.all.competitive_time.epa_per_play` differ by ~0.01 (handoff §6) — the frontend reads the `situations` one; drop or reconcile the `advanced_team` copy at the regeneration.

### 3.2 `special_teams.{team}` — the 08 block

```text
special_teams.{team}
  punting        {punts, avg_gross, avg_net, avg_start_allowed, returns_faced, avg_return_allowed,
                  explosives_allowed, touchbacks, inside_20, inside_10, downed, fair_catches_forced,
                  out_of_bounds, vs_touchback{kicks, yards, avg}, epa_per_punt, wpa_per_punt,
                  flip{same}, pin{same}, unzoned, blocked, turnovers_forced}
  punt_return    {punts_fielded, returns, return_yards, avg_return, explosive_returns, explosive_threshold (12),
                  avg_catch_spot, fair_catches, touchbacks_received, muffs, fumbles_lost, touchdowns,
                  vs_touchback{kicks, yards, avg, beat_touchback}, epa_per_return, wpa_per_return,
                  epa_per_kick_faced, wpa_per_kick_faced}
  kickoffs       {kickoffs, returns_faced, return_rate, touchbacks, fair_catches, avg_kick_distance,
                  avg_catch_spot_allowed, return_yards_allowed, avg_return_allowed, explosives_allowed,
                  avg_start_allowed, out_of_bounds, onside{attempts, recovered}, vs_touchback, epa_per_kick, wpa_per_kick}
  kick_return    {kickoffs_fielded, returns, return_yards, avg_return, explosive_returns, explosive_threshold (25),
                  avg_catch_spot, fair_catches, touchbacks_taken, muffs, fumbles_lost, touchdowns,
                  vs_touchback, epa_per_return, wpa_per_return, epa_per_kick_faced, wpa_per_kick_faced}
  field_goals    {attempts, made, long, blocked, clutch{attempts, made},
                  by_distance{under_30, 30_to_45, over_45: {attempts, made}}, unknown_distance,
                  epa_per_attempt, wpa_per_attempt, total_wpa, log[]}
  pat            {attempts, made, blocked}
  two_point      {attempts, made, log[{quarter, clock, overtime, overtime_round, mandatory,
                                       score_diff_before, method, play, made, result, attempter, play_id}]}
  kicks_without_kicker
```

Definitions carried into labels: **flip** = punt snapped on the punter's own side of the 50 (the job is distance), **pin** = snapped past the 50 (the job is to die it short; a touchback is the failure). **Net** is NCAA net (gross − return − 20 on a touchback; a blocked punt is counted in `blocked`, not in the averages). **vs touchback** is the "touchback diff": punting side, 20 − where the opponent started (positive = better than a touchback); return side, where the return ended − 20 (punt) / 25 (kickoff), `beat_touchback` = returns that ended past the line. **Start allowed** is where the opponent's drive actually began (after any flag on the kick). **Explosive return** = 12+ on a punt, 25+ on a kickoff. **Clutch kick** = 4th quarter or overtime within one score. `mandatory` on a two-point try = from the second overtime on, by rule (shown separately from decisions).

`wpa_per_*` is null in files parsed before 2026-09-20 (the play-level WPA stamp is new); populated after the regeneration.

**ADD — `field_goals.log[]` row shape as shipped** (not in the handoff text; from the sample): `{quarter, clock, distance, good, blocked, clutch, score_diff_before, kicker{player_id, name_raw, team}, epa, wpa, play_id}`. The frontend renders the log as the kick sequence on the FG card.

**ADD — the specialist block this pairs with, `special_teams_individual.{team}`** (shipped, keyed by `PERS_` id):

```text
special_teams_individual.{team}
  kickers.{id}         {player_id, name, short_name,
                        fg{attempts, made, blocked, long, clutch{attempts, made, pct}, by_distance{…}, epa_total, epa_per_attempt, wpa_total, wpa_per_attempt, pct},
                        kickoffs{kicks, touchbacks, fair_catches, …}, pat{attempts, made, blocked}}
  punters.{id}         {player_id, name, short_name, punts, gross_yards, net_yards, long, inside_20, inside_10, touchbacks, fair_catches,
                        downed, out_of_bounds, blocked, returns_faced, return_yards_allowed, explosives_allowed, vs_touchback,
                        avg_gross, avg_net, avg_return_allowed, avg_start_allowed, epa_total, epa_per_punt, wpa_total, wpa_per_punt,
                        zone{flip{same}, pin{same}}}
  returners_ko.{id}    {player_id, name, short_name, fielded, returns, return_yards, long, explosive_returns, tds, muffs, fumbles_lost,
                        fair_catches, vs_touchback{returns, yards, beat_touchback, avg}, avg_return, avg_catch_spot,
                        epa_total, epa_per_return, wpa_total, wpa_per_return}
  returners_punt.{id}  same as returners_ko
  coverage.{id}        {player_id, name, short_name, tackles, punt, kickoff, avg_stop_spot}
  blockers.{id}        {player_id, name, short_name, blocks, punt, field_goal, pat}
  holders.{id}         {player_id, name, short_name, attempts, made, blocked, fg, pat, success_rate}
  long_snappers.{id}   same as holders
  unattributed         {punt_returns, kick_returns, …}      // *new* keys: returns the feed wrote without a returner
```

The Player Stats special-teams mark-up on this block is §8.

**ASK — retire the two superseded blocks.** `special_teams_advanced` and `special_teams_production` still ship beside these, with different names for the same phases (`return_yards_allowed` vs `avg_return_yards`; `avg_start_allowed` under both offense and defense with different values) and `special_teams_production.field_goals.specialists[].player_key` still in the `name:` form. The frontend reads only `special_teams` and `special_teams_individual`; drop the other two from the file.

**ASK — special-teams production score.** Every specialist row now carries `epa_total` and `wpa_total`, the input the score needs:

```text
production_scores[].components.special_teams_production: number       // on kickers, punters, returners; 0 elsewhere
special_teams_individual.{team}.{kickers|punters|returners_ko|returners_punt}.{id}.production_total: number
```
Or state that special teams stays outside `production_scores` — one answer, so the Production leaderboard is consistent.

**ASK:** `kickers.{id}.kickoffs` carries `epa_per_kick` / `wpa_per_kick` after the regeneration, same as the team block.

### 3.3 Additions to blocks already read

`advanced_team.{team}` — all *new*:
`explosive_plays`, `explosive_pass_plays`, `explosive_rush_plays`, `explosive_epa_plays` (the counts behind the rates the page already shows);
`wpa_per_play`, `positive_wpa_play_rate`, `high_leverage_play_rate`, `turnover_play_rate`;
`epa_ledger.{total|offense|special_teams|kickoff|punt|field_goal|pat|penalty_overlay}` = `{plays, epa, epa_per_play}` — **this is the "Passing EPA / Special Teams EPA / Penalty EPA / Total Game EPA" ledger** (`total = offense + special_teams`; `special_teams = kickoff + punt + field_goal + pat`; `penalty_overlay` is inside `offense`);
`success_rate_competitive_time`, `competitive_wpa_total`, `competitive_wpa_per_play`; `available_yards{available, gained, pct}`;
`competitive_turnovers{expected, actual, luck}`;
`explosive_by_down.{offense|defense}.{1..4}` = `{plays, explosive_plays, explosive_rate}`; `havoc_rate_forced_pass/rush`, `havoc_rate_allowed_pass/rush`, `forced_fumble_rate_forced`.

`team_box.{team}` — *new*: `fourth_down_snaps` (every 4th-down snap, punts and kicks included — `fourth_down_goes` is the subset the offense stayed on the field for), `two_point_attempts` / `two_point_successes` (from the play rows), `scoring_drives`, `explosive_drives`, `negative_drives`, `drive_results{TD, FG, Punt, INT, FUMB, Downs, MissedFG, BlockedFG, EndHalf, EndGame, Safety, …}` (sums to `drives_offense`).

`drive_summary[]` — *new* on every row: `situation` is now an object — `tags{opportunity, adversity, leverage, response}` (the four lists the chips already read) plus `start_zone`, `opportunity_count`, `hardship_count`, `crucial_snaps`, `survival_streak`, `score_state`, `one_score`, `red_zone`, `goal_line`, `clutch`, `two_minute`, `response_stack`, `load`; and `is_scoring_drive`, `is_red_zone_drive`, `is_quality_drive`, `is_explosive_drive`, `is_negative_drive`, `available_yards_pct`, `start_spot{team, yardline}` / `end_spot{team, yardline}` (the crew's spelling, e.g. ASU 30), `yards_net_field_position`, `is_opening_kickoff_drive`, `is_second_half_kickoff_drive`.
**Breaking:** `situation` was `{opportunity: [], adversity: [], …}`; the lists are now under `situation.tags`. **ADD:** adopted; the Drives tab reads `situation.tags.*`.

`special_teams_individual.{team}.unattributed` — *new* keys `punt_returns`, `kick_returns` (returns the feed wrote without a returner; rows + this = the team block).

`coaching_profile.{team}.two_point_conversions` now reads the same play-based count as `team_box` and `special_teams.two_point`.

**ADD — also new on the sample and adopted:** `time_of_possession.{teams.{team}.{seconds, display, share}, status, accounted_seconds, unaccounted_seconds, drives_unresolved, overtime_drives, possessions_missing}`; `drive_summary[].time_of_possession_seconds` + `clock_source{start, end}`; `scoring_plays[].{period_label, overtime, ot_number}` and `scoring_plays[].drive.time_of_possession_seconds` populated; `play_by_play[].players[] {player_id, name, role, team}`; `play_by_play[].situation{…}` (the per-play flags: `standard_down`, `passing_down`, `early_down`, `late_down`, `red_zone`, `goal_to_go`, `middle_8`, `money_down`, `third_and_short/medium/long`, `fourth_down_attempt`, `two_minute`, `clutch`, `competitive_time`, `special_teams_play`, `game_phase`, `time_remaining_in_game`).

**ASK — six fields that fall out of the Team Stats row list (§7):**

```text
team_box.{team}.yards_per_play                                   // §7.1, §7.3 — currently total_yards ÷ plays_offense on the client
passing_splits.{team}.total.yards_per_dropback                   // §7.1 — sack yards included
passing_splits.{team}.total.pass_share                           // §7.3 — attempts ÷ eligible scrimmage plays
rushing_splits.{team}.total.rush_share                           // §7.3
trenches.{team}.run_blocking.highlight_yards_per_opportunity     // §7.4 — Connelly's column; per_rush stays
league_avg_{season}.keys.{path}.{p10, p25, p50, p75, p90}        // §7.1 — see §6.2
```

---

## 4. Rows on the current page that stop rendering, and why

Handoff §4, reproduced in full and **accepted without exception**. The Team Stats tab is rebuilt from §7; none of these rows survive.

**Reads of keys that do not exist — re-pointed per the right-hand column**

| Row on the page | What it read | What to read instead |
|---|---|---|
| Passing EPA · EPA per dropback · Pass success rate · Pass explosive rate | `advanced_team.passing_epa` etc. (never existed) | `passing_splits.{team}.total.{epa_total, epa_per_play, success_rate}`; explosive: `advanced_team.explosive_pass_plays` ÷ `passing_splits.total.attempts` |
| Rushing EPA · EPA per rush · Rush success rate · Rush explosive rate | same pattern | `rushing_splits.{team}.total.{epa_total, epa_per_play, success_rate}`; `advanced_team.explosive_rush_plays` |
| Explosive plays (total / pass / rush) | counts were never shipped | `advanced_team.explosive_plays / explosive_pass_plays / explosive_rush_plays` |
| Special Teams EPA · Penalty EPA · Total Game EPA · H1 EPA · H2 EPA | never existed | `advanced_team.epa_ledger.*` (no half split exists; H1/H2 EPA is not measured) |
| Positive EPA play rate | never existed | `advanced_team.positive_wpa_play_rate` (WPA, not EPA — labelled as such) |
| EPA without explosives · EPA per explosive play | never existed at team level | not in a section file → not rendered |
| Time of possession | computed client-side (wrong by ~26 min per team) | `time_of_possession.teams.{team}.display`, `share`, and `status` |
| After 3-and-out · After own turnover · Sudden change defense · Stabilization after explosive | `sequence_model.*` is an object, the row expected a scalar | those objects, or `situations.drives.response.*` for the five drive triggers |
| Penalties & Discipline (all 21 rows) | retired `hidden_yardage*` and pre-01 keys | `penalty_profile.{team}` per `01_penalties.md`; erased value from `uncounted` |
| Coaching & Tendencies (all rows) | pre-04 keys | `coaching_profile.{team}` per `04_coaching.md` |
| Power run attempts · Power success | `advanced_team.power_*` (not there) | `trenches.{team}.run_blocking.power.{attempts, made, rate}` |

**Cut by ruling — removed**

| Row | Ruling |
|---|---|
| Kicker Trust Range · Coach Aggression Threshold | 08 §E: cut |
| 1st Down Run Rate | 01: a tautology; `coaching_profile.tendencies.run_pass_by_down` has the number |
| Hidden Yardage Lost / Gained · ST Hidden Yards | 01: retired; the uncounted engine owns "erased" |
| Explosive Prevention (= 1 − explosive rate allowed) | 03 has explosive plays allowed with counts; a complement of a rate is not a row |
| Bend-Don't-Break Index · Disruption Rate (capsule) | 03: the capsule bundle is not a rendered row |
| Goal-to-Go Success 100% · Two-Minute Success 100% (with no n) | rule 1 — shown with `situations.splits…goal_to_go.plays`; "—" under `min_n` |

**Mixed denominators** — labelled per rule 6.

**ADD — also removed on the frontend, not in the handoff list:** every row that read the six retired defensive blocks (`defensive_identity`, `defense_role_distribution`, `pressure_profile`, `defensive_production`, `defensive_advanced_metrics`, `defensive_crucial_downs`) — replaced by `defensive_impact` (§7.10); every row that read `penalty_advanced`; the client-side `useGameAnalytics` derivation layer as a whole.

---

## 4b. Display strings — the backend composes, the frontend renders

The sample ships presentation strings alongside the numbers, and the frontend renders each verbatim rather than composing its own. The play-by-play row is the clearest case:

```text
play_by_play[]
  description: string           // rewritten sentence — "C.McCoy to M.Jackson for 19 yards (J.Lenore, T.Phillips), 1st down."
                                //   penalty rows: "… — PENALTY SOU personal foul, 15 yds, no play"
                                //   kicks: "H.Tuck punt 44 yds, fair catch by D.Morris."
  raw_text: string              // crew text, unchanged — shown on expand only
  spot:        { team_id, abbreviation, yardline, absolute, display: "ALST 37" } | null
  spot_after:  { team_id, abbreviation, yardline, absolute, display: "ALST 44" } | null
  penalties[]: { team_id, type, foul, category, yards, yards_source, yards_suspect, declined, ejected, … }
  first_down: boolean
  yards_gained: integer | null
  actions[]:   { type, net_yards, passDepth, isComplete, passer, receiver, rusher, tacklers[]{player_id, name} }
  players[]:   { player_id, name, role, team }
  situation:   { … }            // per-play flags, §3.3
```

**ADD — the row renders `description`; `raw_text` is the expand.** `spot.display` / `spot_after.display` are the "at" line. `penalties[]`, `first_down`, `yards_gained` are read as fields. The frontend no longer derives side-of-field from `yardline_absolute`, no longer regexes `PENALTY …` out of the crew text, and no longer computes first down or yards gained from the two yardlines.

**ASK:** `description` on every row type, including administrative / no-play rows (timeouts, end of quarter), so the column never falls back to `raw_text`; and `spot: null` (not a partial object) when a row has no line of scrimmage.

The other strings on the file, all rendered the same way:

| String | Path | Rendered as |
|---|---|---|
| Time of possession | `time_of_possession.teams.{id}.display` (`"29:04"`) | the TOP cell |
| Period | `scoring_plays[].period_label` (`"Q1"`, `"OT2"`), `week_label` | period column, banner |
| Final | `win_probability.final_label` (`"SOU 7, ALST 30"`) | WP card footer |
| Ticker | `ticker[].{label, text}` | banner ticker |
| Situation labels and rules | `situations.definitions.{situation}.{label, rule}` | row label + hover |
| Metric labels | `advanced_basics.blocks[].label`, `metrics[].label` | Advanced Basics card |
| Player short form | `*.short_name` (`"B.Gilliam"`) | compact tables |
| Play sentence | `game_export.biggest_plays[].description` (`"M.Harris II rush right for 47 yards, TOUCHDOWN."`) | poster rows |

**ADD — rule 7.** *Where the payload carries a display string, it is the only string rendered; the frontend never composes a competing one from the numbers.* Where a string is missing, the frontend dashes and the string is asked for here.

**ASK — make the strings consistent:**

```text
scoring_plays[].description            // the rewritten sentence, same form as biggest_plays[].description —
                                       //   not the crew text with "clock 01:41." appended; keep crew text as raw_text if wanted
*.display_name                         // "Brandon Gilliam" on every player row that has `name` (crew form) / `short_name`:
                                       //   individual_stats, special_teams_individual, production_scores, game_leaders,
                                       //   notable_performers, scoring_plays[].players[], play_by_play[].players[], *.leaders[]
drive_summary[].start_spot.label       // "ASU 30" beside {team, yardline}; same on end_spot
special_teams_individual.{unit}.{id}.stat_line   // the one-line summary now only in the retired block ("3/4 FG, 37 Long, 3/3 PAT")
venue.site                             // fix the composed form (§5.2) or drop it — the frontend reads stadium / city / sponsor
```

---

## 5. What stays as is — and what is still missing from it

### 5.1 Stays (handoff §5)

`team_box` core rows, `advanced_team` rates that already had counts, `trenches`, `defensive_impact`, `penalty_profile` + `uncounted`, `passing_splits` / `rushing_splits` (Total / Standard / Passing downs), `drive_summary` columns from 09-14 (epa, 3rd/4th, explosives, penalties, score_after, TOP seconds + `clock_source`), `time_of_possession`, `win_probability`, `scoring_plays`, `advanced_basics` (whose `definitions` block carries the words for each key).

### 5.2 Open asks on blocks that stay — carried from the 09-15 notes, checked against the sample

**Scoring plays**

```text
scoring_plays[]
  yards: integer | null            // pass / rush / return distance, FG distance; null when the text has none
  try: {                           // on TD rows only; null when no try was attempted
    type: "PAT" | "TWO_POINT"
    result: "good" | "failed" | "blocked"
    players: []{ role, player_id, name }
    play_id: string
  } | null
```
Either nest the try, or keep tries as their own rows **and** add failed tries with `points: 0`. Today a missed PAT leaves no row at all. One or the other.

**Defense rows — havoc coordinates**

```text
individual_stats.{team}.defense[]
  havoc_events: []{
    play_id: string
    category: "TFL" | "SACK" | "PBU" | "INT" | "FF"
    lane: "left" | "middle" | "right"
    yards_from_los: integer          // event spot − LOS, signed
  }                                  // [] for a defender with no havoc plays
```

**Unit totals**

```text
passing_splits.{team}.total   + yards_per_completion, explosive_completions, epa_per_target
rushing_splits.{team}.total   + explosive_carries            // confirm threshold is 10+
```

**Receiving**

```text
receiving_splits.{team}.total { targets, receptions, yards, touchdowns, success_rate, epa_total, epa_per_target, adot, explosive_receptions }
league_avg_{season}.keys      + "receiving_splits.total.success_rate", "receiving_splits.total.epa_per_target"
```

**Production components**

```text
production_scores[].components.passing_production_penalty: number   // ≤ 0; the INT / lost-fumble cost, shown beside the net
```
(`special_teams_production` — see §3.2.)

**`notable_performers[].chips`** — the sample still ships zero-valued chips (`TKL 0, TFL 0, SACKS 0, INT 0, PD 0`). Build `chips[]` from the stats the player registered; drop zeros.

**Venue** (Fetch Contract 09-20 revision)

```text
venue: {
  stadium: string                 // "A.W. Mumford Stadium"
  sponsor: string | null          // naming sponsor when the name carries one ("Simmons Bank"), else null
  city: string | null             // "Baton Rouge, Louisiana" — city and state; null when unknown, never the state alone
  neutral_site: boolean
  site: string                    // legacy composed string, still sent
}
```
The sample has `city: "Louisiana"` and `site: ", Louisiana (A.W. Mumford Stadium)"` — the city slot is empty.

**Event** — the revision asked for one object; the builder shipped `events[]` + `headline_event`. Either is fine; settle on one and send a classic (any 2026 Southern Heritage / Bayou / Florida Classic file) so the populated shape is on record. If it stays a list:

```text
events: []{ kind: "classic" | "homecoming" | "championship" | "bowl" | "challenge" | "theme", name: string, sponsor: string | null }
headline_event: events[0] | null
```

**EPA timeline** (Fetch Contract 09-20 revision; Summary → Game Flow card)

```text
epa_timeline: { [team_id]: []{
  play_number: integer            // 1..N within this team's own offensive plays
  play_id: string
  quarter: integer
  epa: number
  cumulative_epa: number          // running total through this play
} }
```

**Play-by-play flags** (per-row, same footing as `big_play`; `play_by_play[].situation` already carries the down/leverage flags — these three are the outcome flags)

```text
play_by_play[]
  success: boolean | null          // the play's success-rate outcome; null on non-scrimmage rows
  stuffed: boolean | null          // rush for ≤ 0; null on non-rush rows
  tfl: boolean | null              // a tackle for loss was recorded on the play
```

**Shared files**

```text
shared/national_avg_{season}.json          // same { keys: { path: { avg, min, max } } } shape as league_avg; say FCS or FCS+FBS
shared/team_season_avg_{season}.json
  teams.{team}.rushing          + yardsPerCarry, lineYardsPerRush, highlightYardsPerRush
  teams.{team}.rushing_defense  { yardsPerCarryAllowed, lineYardsPerRushAllowed, successRateAllowed,
                                  opportunityRateAllowed, highlightYardsPerRushAllowed, stuffRateAllowed }
league_avg_{season}.keys        + "series_summary.conversion_rate"
```

### 5.3 Closed by the 09-20 builder (struck from the 09-15 notes)

Per-drive TOP · team TOP with `status` · `start_spot` / `end_spot` · OT labelling on scoring rows · `scoring_plays[].drive.time_of_possession_seconds` · per-kick log · two-point block · kicker trust / aggression / hidden yards / swing yards cut · specialists keyed by `PERS_` id with proper casing · `players[]` on every play · explosive counts · EPA ledger · drive results · `ALCN` adopted.

---

## 6. Known gaps (handoff §6) and what the frontend does with each

| Gap (handoff) | Frontend handling | ASK |
|---|---|---|
| 689 of 4,307 returns corpus-wide have no returner (2017–23 feeds; 2025 has none). The team block counts them; the specialist rows carry them as `unattributed`. Parser fix lands with a later reparse. | Each return card shows one line "N returns with no returner named" from `unattributed`. | none |
| 64% of rushes are lane "middle" because the feed usually states no lane; no rush-direction visual (05 open call 3). | `trenches.*.by_direction` renders as a table, never a lane graphic. `havoc_events[].lane` (§5.2) is only asked for plays where the text states a direction; `"middle"` otherwise. | none |
| `wpa_per_*` on kicks is null until the regeneration. | Dashes. | regeneration date |
| Overtime: `situations.drives.overtime_drives` says how many drives in the ledgers are OT; `drive_summary[].is_overtime` marks them. | Adopted. | **regenerate `uapbalc26` (2OT) on the 09-20 builder as the second sample** — open on it: `drive_summary[]` through OT2; `score_after` = score once the drive and its try are over; `win_probability.timeline` points for OT plays with `quarter: 5, 6…`; `game_export.biggest_plays` OT rows carrying `ot_number` |
| `advanced_team.competitive_epa_per_play` vs `situations…competitive_time.epa_per_play` differ by ~0.01 (05 open call 2). | Reads the `situations` one. | reconcile or drop the `advanced_team` copy |

### 6.1 Regenerated league file

`league_avg_{season}.json` with the new paths: `advanced_team.epa_ledger.*`, `situations.*`, `special_teams.*`, `trenches.*`, `defensive_impact.*`, `penalty_profile.*`.

### 6.2 Distribution per key (for the Overall strip, §7.1)

```text
league_avg_{season}.keys.{path}: { avg, min, max, p10, p25, p50, p75, p90 }   // over single-game team performances, this season
```
Cell colour on the Overall strip is the percentile of this game's value within that distribution. The frontend places the value; it does not build the distribution.

---

## 7. Team Stats — the row list (the 05 · 08 mark-up and the 06 · 07 sheets)

Panel order per §2. Each row is a path in the payload; `(count)` names the count shown beside a rate per rule 1. **ASK** rows are not in the sample (collected in §3.3). Rows in §4 are gone and are not re-listed.

### 7.1 Overall — percentile strip

| Row | Path | count |
|---|---|---|
| EPA / play | `advanced_team.epa_per_play` | `eligible_scrimmage_plays` |
| Success rate | `advanced_team.success_rate` | `eligible_scrimmage_plays` |
| Yards / play | **ASK** `team_box.yards_per_play` | `plays_offense` |
| EPA / dropback | `passing_splits.total.epa_per_play` | `passing_splits.total.dropbacks` |
| EPA / rush | `rushing_splits.total.epa_per_play` | `rushing_splits.total.attempts` |
| Yards / dropback | **ASK** `passing_splits.total.yards_per_dropback` | `dropbacks` |
| Explosive play rate | `advanced_team.explosive_rate_yardage` | `explosive_plays` |
| 3rd-down success rate | `situations.splits.offense.all.third_down.success_rate` | `.plays` |
| Red-zone success rate | `situations.splits.offense.all.red_zone.success_rate` | `.plays` |
| Def. run stuff rate | `trenches.run_defense.stuff_rate` | `.stuffs / .rushes_faced` |
| Havoc rate | `advanced_team.havoc_rate_forced` | `defensive_impact.havoc.havoc_plays` |

Colour = percentile within the §6.2 distribution.

### 7.2 Expected points

| Row | Path |
|---|---|
| Total plays · Total EPA · EPA / play | `advanced_team.epa_ledger.total` |
| Offensive EPA | `epa_ledger.offense` |
| Special teams EPA | `epa_ledger.special_teams` (expand: `kickoff`, `punt`, `field_goal`, `pat`) |
| Penalty EPA | `epa_ledger.penalty_overlay` (labelled "inside offense") |
| Competitive-time EPA · WPA | `advanced_team.competitive_epa_total`, `competitive_epa_per_play`, `competitive_wpa_total`, `competitive_wpa_per_play` |
| WPA / play · positive-WPA play rate · high-leverage play rate | `advanced_team.wpa_per_play`, `positive_wpa_play_rate`, `high_leverage_play_rate` |

### 7.3 Production

| Row | Path |
|---|---|
| Scrimmage plays · yards · yards/play · EPA · EPA/play | `advanced_team.eligible_scrimmage_plays`, `team_box.total_yards`, **ASK** `yards_per_play`, `epa_ledger.offense` |
| Passes (share) · yards · yards/att · EPA · EPA/play · success | `passing_splits.total.{attempts, yards, yards_per_attempt, epa_total, epa_per_play, success_rate}`; **ASK** `pass_share` |
| Rushes (share) · yards · YPC · EPA · EPA/play · success | `rushing_splits.total.{attempts, yards, yards_per_carry, epa_total, epa_per_play, success_rate}`; **ASK** `rush_share` |
| Standard / passing downs split | `passing_splits.{standard_downs, passing_downs}`, `rushing_splits.{standard_downs, passing_downs}` (as shipped) |

### 7.4 Rushing — trenches

| Row | Path |
|---|---|
| Power run attempts · successful (rate) | `trenches.run_blocking.power.{attempts, made, rate}` |
| And-1 | `trenches.run_blocking.and_1` |
| Stuffed runs (rate) | `trenches.run_blocking.{stuffs, stuff_rate}` |
| Opportunity runs (rate) | `trenches.run_blocking.{opportunities, opportunity_rate}` |
| Line yards · per carry | `trenches.run_blocking.{line_yards_total, line_yards_per_rush}` |
| Highlight yards · per rush · per opportunity | `trenches.run_blocking.{highlight_yards_total, highlight_yards_per_rush}`; **ASK** `highlight_yards_per_opportunity` |
| By down | `trenches.run_blocking.by_down` |
| By direction | `trenches.run_blocking.by_direction` — table, not a lane visual (§6) |

### 7.5 Pass protection · pass rush — trenches

| Row | Path |
|---|---|
| Dropbacks · sacks allowed · sack yards | `trenches.pass_protection.{dropbacks, sacks_allowed, sack_yards_lost}` |
| Pressures allowed (rate) · hurries | `trenches.pass_protection.{pressures_allowed, pressure_rate_allowed, hurries_allowed}` |
| Clean-pocket completion % | `trenches.pass_protection.clean_pocket_completion_pct` |
| Sack rate by down | `trenches.pass_protection.sack_rate_by_down` |
| Opp. dropbacks · sacks · pressures (rate) · pressure-to-sack | `trenches.pass_rush.{opp_dropbacks, sacks, pressures, pressure_rate, pressure_to_sack}` |
| TFL (rate) · run disruption · havoc (rate) | `trenches.pass_rush.{tfl, tfl_rate, run_disruption_rate, havoc, havoc_rate}` |

### 7.6 Explosiveness

| Row | Path |
|---|---|
| Explosive plays · pass · rush (with rates) | `advanced_team.{explosive_plays, explosive_pass_plays, explosive_rush_plays, explosive_rate_yardage}` |
| Explosive by EPA | `advanced_team.{explosive_epa_plays, explosive_rate_epa}` |
| By down, offense and defense | `advanced_team.explosive_by_down.{offense, defense}.{1..4}` |
| Explosive drives (rate) | `team_box.explosive_drives`, `advanced_team.explosive_drive_rate` |

### 7.7 Situational — section 05 mark-up

One table, rows = the 13 situations, columns = plays · success · EPA/play · explosive, offense | defense; pass / rush on expand.

| Cell | Path |
|---|---|
| Offense | `situations.splits.offense.{all|pass|rush}.{situation}` |
| Defense (allowed) | `situations.splits.defense.{all|pass|rush}.{situation}` |
| 3rd-down avg distance | `…third_down.avg_distance` |
| Penalty EPA on the `all` unit | `…{situation}.{penalty_epa_plays, penalty_epa}` when present |
| Havoc by situation | `situations.havoc.{forced, allowed}.{situation|pass|rush}` |
| Labels and rules | `situations.definitions.{situation}.{label, rule}` — on hover, verbatim |

`min_n` from `05_situations.md` once received.

### 7.8 Drives — section 07 sheet

| Row | Path |
|---|---|
| Drives · scoring · explosive · negative | `team_box.{drives_offense, scoring_drives, explosive_drives, negative_drives}` |
| Drive results | `team_box.drive_results` (as a bar, every key) |
| Points / drive · avg start · long-field drives (rate) | `team_box.{points_per_drive, avg_start_field_position, long_field_drives, long_field_rate}` |
| Available yards (gained / available, %) | `advanced_team.available_yards.{gained, available, pct}` |
| Quality drive rate · points / quality drive | `advanced_team.{quality_drive_rate, points_per_quality_drive}` |
| Red-zone trips · points / trip · TD rate | `advanced_team.{red_zone_opportunities, red_zone_points_per_opportunity, red_zone_td_rate}` |
| Inside-40 trips · points / trip | `advanced_team.{opportunities_40, points_per_opportunity_40}` |
| Field-position ledger | `situations.drives.field_position.{short_field, favorable, normal, negative, backed_up}` |
| Score-state ledger | `situations.drives.score_state.{leading, tied, trailing, one_score}` |
| Under pressure | `situations.drives.leverage.*`, `leverage_totals`, `hardship`, `opportunity` |
| Response triggers | `situations.drives.response.*` (drives · points · score rate) + `sequence_model.{after_3_and_out, sudden_change_defense, stabilization_after_explosive_allowed}` |
| Situational load | `situations.drives.load` — one line, context only |
| Time of possession | `time_of_possession.teams.{team}.display` + `share`; `status` shown when not `ok` |
| Overtime drives | `situations.drives.overtime_drives`; `drive_summary[].is_overtime` |

### 7.9 Third and fourth downs

| Row | Path |
|---|---|
| 3rd-down attempts · conversions (rate) · avg distance | `team_box.{third_down_attempts, third_down_conversions, third_down_conversion_rate, third_down_avg_distance}` |
| 4th-down snaps · goes · conversions (go rate, conversion rate) | `team_box.{fourth_down_snaps, fourth_down_goes, fourth_down_go_conversions, fourth_down_go_rate, fourth_down_go_conversion_rate}` |
| 4th-down decisions | `coaching_profile.fourth_down_decisions.{went_for_it, punted, attempted_fg, other, go_rate, punt_rate, fg_rate}` + `decision_log[]` |
| Two-point | `team_box.{two_point_attempts, two_point_successes}`; `special_teams.two_point.log[]` (mandatory tries separated) |

### 7.10 Defensive — section 03

| Row | Path |
|---|---|
| Plays faced · yards · yards/play · success allowed · EPA/play allowed · explosive allowed | `defensive_impact.line.*` |
| Drives faced · points · points/drive · 3-and-outs | `defensive_impact.line.{drives_faced, points_allowed, points_per_drive_allowed, three_and_outs}` |
| Havoc plays · TFL · sacks · PD · INT · FF · FR · takeaways · defensive scores · coverage disruption | `defensive_impact.havoc.*` |
| Havoc rate (pass / rush) | `advanced_team.{havoc_rate_forced, havoc_rate_forced_pass, havoc_rate_forced_rush}` |
| Pass defense | `defensive_impact.pass_defense.*` |
| Crucial downs | `defensive_impact.crucial.{third_down, third_down_by_distance, third_down_by_type, fourth_down, red_zone, sudden_change}` |
| Drives | `defensive_impact.drives.{faced, ended, stops, average_start_allowed, short_field_stands, backed_up_stands}` |
| Run defense | `trenches.run_defense.{rushes_faced, yards_per_carry_allowed, stuff_rate, opportunity_rate_allowed, line_yards_allowed_per_rush, power, suffocation_rate, third_down_rush_stop_rate}` |
| Leaders | `defensive_impact.leaders.{tackles, havoc, coverage, crucial_down_stops}` |

### 7.11 Turnovers

| Row | Path |
|---|---|
| Committed · forced · margin | `team_box.{turnovers_committed, turnovers_forced, turnover_margin}` |
| Expected · actual · luck | `advanced_team.{expected_turnovers, actual_turnovers, turnover_luck}` |
| Competitive-time expected · actual · luck | `advanced_team.competitive_turnovers.{expected, actual, luck}` |
| Turnover play rate · forced-fumble rate | `advanced_team.{turnover_play_rate, forced_fumble_rate_forced}` |
| After own turnover · after takeaway | `situations.drives.response.{after_own_turnover, after_takeaway}` |

### 7.12 Penalties — section 01

| Row | Path |
|---|---|
| Accepted · yards · per 100 plays · yards/penalty | `penalty_profile.discipline_overview.*` |
| Pre-snap rate · live-ball rate | `discipline_overview.{pre_snap_rate, live_ball_rate}` |
| Declined · offsetting · drawn (yards) · net yards | `discipline_overview.{declined_count, offsetting_count, drawn_count, drawn_yards, net_penalty_yards}` |
| Situational flags | `penalty_profile.situational_flags.*` |
| Drive impact | `penalty_profile.drive_impact.*` |
| Identity | `penalty_profile.penalty_identity.{top_penalty_types, top_offenders, repeat_type_penalty_rate, aggression_tax, discipline_tax}` |
| Officiating environment | `penalty_profile.officiating_environment.*` |
| Erased | `uncounted.teams.{team}.{harmed, benefited, net_points, net_epa, net_wpa, drive_outcomes}` |

### 7.13 Coaching — section 04 mark-up

| Row | Path |
|---|---|
| Run / pass by down | `coaching_profile.tendencies.run_pass_by_down` |
| Efficiency by call · obvious-situation execution | `tendencies.{efficiency_by_down_call, obvious_situation_execution}` |
| Red-zone · short-yardage tendency | `tendencies.{red_zone_tendency, short_yardage_tendency}` |
| Halftime adjustment · predictability · boom-or-bust · air-raid tax | `tendencies.{halftime_adjustment, predictability_index, boom_or_bust_index, air_raid_tax}` |
| Fourth-down decisions | §7.9 |
| Two-point | `coaching_profile.two_point_conversions` |
| Coaches | `coaching_profile.coaches[]` |

**ASK:** `04_coaching.md` definitions for `predictability_index`, `boom_or_bust_index`, `air_raid_tax`; those three rows render only with the definition on hover.

### 7.14 Special teams — section 08 mark-up (team)

Six unit cards, each with its own count column; the specialist rows under each card are §8.

| Unit | Path | Hero |
|---|---|---|
| Punting | `special_teams.punting.*` + `flip` / `pin` splits, `unzoned`, `blocked`, `turnovers_forced` | `avg_net` with `vs_touchback.avg` |
| Punt return | `special_teams.punt_return.*` | `avg_return` with `vs_touchback.beat_touchback` |
| Kickoffs | `special_teams.kickoffs.*` + `onside` | `avg_start_allowed` with `vs_touchback.avg` |
| Kick return | `special_teams.kick_return.*` | `avg_return` |
| Field goals | `special_teams.field_goals.*` + `by_distance`, `clutch`, `unknown_distance`, `log[]` | `made / attempts`, `long` |
| PAT · two-point | `special_teams.pat`, `special_teams.two_point` + `log[]` | `made / attempts` |

`epa_per_*` and `wpa_per_*` on every unit; `wpa_per_*` dashes until the regeneration. `kicks_without_kicker` goes to §7.15.

### 7.15 Data quality & coverage

One panel: `time_of_possession.status` (+ `unaccounted_seconds`, `drives_unresolved`, `possessions_missing` when non-zero), `penalty_profile.{team}.data_quality`, `special_teams.{team}.kicks_without_kicker`, `special_teams_individual.{team}.unattributed`, `enrichment_summary`.

---

## 8. Player Stats — special teams production mark-up

`special_teams_individual.{team}` (§3.2) is the per-specialist block the Production tab's special-teams section renders. One card per unit; every row keyed by `player_id`, sorted by attempts. Counts beside every rate. Team lines on each card come from `special_teams.{team}.*` (§7.14) so the specialist rows and the team line are the same numbers.

| Unit card | Rows from | Columns |
|---|---|---|
| Kicking | `kickers.{id}.fg` | att · made · pct · long · blocked · clutch (`clutch.made / attempts`) · by distance (`under_30`, `30_to_45`, `over_45`) · EPA/att · WPA/att · EPA total · WPA total |
| Kickoffs | `kickers.{id}.kickoffs` | kicks · touchbacks · fair catches · OOB · onside · avg distance · avg start allowed · EPA/kick · WPA/kick |
| PAT | `kickers.{id}.pat` | att · made · blocked |
| Punting | `punters.{id}` | punts · gross · net · long · in20 · in10 · TB · FC · downed · OOB · blocked · returns faced · return yds allowed · explosives allowed · vs touchback (`vs_touchback.avg`) · avg start allowed · EPA/punt · WPA/punt |
| Punting — flip / pin | `punters.{id}.zone.{flip, pin}` | same columns, two sub-rows under the punter (expand) |
| Kick returns | `returners_ko.{id}` | fielded · returns · yds · avg · long · explosive · TD · muffs · fumbles lost · FC · beat touchback (`vs_touchback.beat_touchback / returns`) · avg catch spot · EPA/ret · WPA/ret |
| Punt returns | `returners_punt.{id}` | same as kick returns |
| Coverage | `coverage.{id}` | tackles · on punts · on kickoffs · avg stop spot |
| Blocks | `blockers.{id}` | blocks · punt · FG · PAT |
| Holders · long snappers | `holders.{id}`, `long_snappers.{id}` | attempts · made · blocked · FG · PAT · success rate |
| Unattributed | `unattributed.{punt_returns, kick_returns, …}` | one line per unit card: "N returns with no returner named" |

Asks for this block are in §3.2 (retire the two old blocks; `special_teams_production` score component; kickoff EPA/WPA per kicker).

---

## 9. Ask index

Every **ASK** in this document, in one place.

| # | Ask | Section |
|---|---|---|
| 1 | `CONTRACT_1.0/` section files (01–05, 08, PBP_row, TABLES; 06 / 07 when written) | §1 |
| 2 | Reconcile or drop `advanced_team.competitive_epa_per_play` vs the `situations` value | §3.1, §6 |
| 3 | Retire `special_teams_advanced` and `special_teams_production` | §3.2 |
| 4 | `production_scores[].components.special_teams_production` + `production_total` on specialist rows — or a ruling that ST is outside the score | §3.2 |
| 5 | `kickers.{id}.kickoffs.{epa_per_kick, wpa_per_kick}` | §3.2 |
| 6 | `team_box.yards_per_play` · `passing_splits.total.yards_per_dropback` · `pass_share` · `rush_share` · `run_blocking.highlight_yards_per_opportunity` | §3.3 |
| 7 | `scoring_plays[].yards`; nested `try{}` or failed-try rows | §5.2 |
| 8 | `individual_stats.defense[].havoc_events[]` | §5.2 |
| 9 | Unit totals: `passing_splits.total.{yards_per_completion, explosive_completions, epa_per_target}`, `rushing_splits.total.explosive_carries` | §5.2 |
| 10 | `receiving_splits.{team}.total` + league keys | §5.2 |
| 11 | `components.passing_production_penalty` | §5.2 |
| 12 | `notable_performers[].chips` without zeros | §5.2 |
| 13 | `venue.city` real city (null when unknown); `venue.sponsor` | §5.2 |
| 14 | `events[]` / `headline_event` — settle the shape; send one classic file | §5.2 |
| 15 | `epa_timeline` | §5.2 |
| 16 | `play_by_play[].{success, stuffed, tfl}` | §5.2 |
| 17 | `shared/national_avg_{season}.json`; `team_season_avg` rushing + `rushing_defense`; `league_avg` `series_summary.conversion_rate` | §5.2 |
| 18 | Regenerate `uapbalc26` (2OT) as the second sample; verify OT2 drives, `score_after`, WP OT points, `biggest_plays` OT rows | §6 |
| 19 | `league_avg_{season}.json` regenerated with the new paths | §6.1 |
| 20 | `league_avg` percentile distribution per key | §6.2 |
| 21 | `04_coaching.md` definitions for `predictability_index`, `boom_or_bust_index`, `air_raid_tax` | §7.13 |
| 22 | `05_situations.md` `min_n` | §7.7 |
| 23 | `scoring_plays[].description` in the rewritten form | §4b |
| 24 | `display_name` on every player row | §4b |
| 25 | `start_spot.label` / `end_spot.label` | §4b |
| 26 | `special_teams_individual.*.stat_line` (before the old block is dropped) | §4b |
| 27 | `venue.site` fixed or dropped | §4b |
| 28 | `play_by_play[].description` on every row type; `spot: null` when there is no LOS | §4b |

---

*Frontend · 2026-09-20*
