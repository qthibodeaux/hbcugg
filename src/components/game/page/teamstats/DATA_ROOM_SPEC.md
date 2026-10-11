# Data Room — Game Page Tab Design Spec

**Purpose:** The definitive analytics dump for a single game. Every derived metric, every split, every contextual stat — organized by category, clearly marked for data availability.

**Replaces:** "All Stats" / "Team Stats" tab

**Tab Label:** `Data Room`

---

## Data Availability Legend

| Badge | Meaning |
|-------|---------|
| ✅ `NATIVE` | Exists in backend JSON (team_box, advanced_team, etc.) |
| 🔄 `DERIVED` | Computed from play_by_play or other native fields |
| ⏳ `NEEDS_BACKEND` | Not currently in JSON; requires backend pipeline work |
| ⚠️ `NULL_BUG` | Field exists in schema but returns null (known bug) |

---

## Section 1: Game Overview

*Top-line summary. Always visible. Compact horizontal bar or mini-cards.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Final Score | `metadata.{away,home}_team.score` | ✅ NATIVE | |
| 2 | Total Plays (scrimmage) | `advanced_team.eligible_scrimmage_plays` | ✅ NATIVE | |
| 3 | Total Yards | `team_box.total_yards` | ✅ NATIVE | |
| 4 | Yards Per Play | `team_box.total_yards / plays_offense` | 🔄 DERIVED | Also in team_box as `yards_per_play` |
| 5 | Success Rate | `advanced_team.success_rate` or `success_rate_down_distance` | ✅ NATIVE | Pick one — `down_distance` is more standard |
| 6 | EPA Total | `advanced_team.epa_total` | ✅ NATIVE | |
| 7 | EPA Per Play | `advanced_team.epa_per_play` | ✅ NATIVE | |
| 8 | WPA Total | `advanced_team.wpa_total` | ✅ NATIVE | |
| 9 | Explosive Play Rate | `advanced_team.explosive_rate_yardage` | ✅ NATIVE | |
| 10 | Havoc Rate Forced | `advanced_team.havoc_rate_forced` | ✅ NATIVE | |
| 11 | Turnover Margin | `turnovers_forced - turnovers_committed` | 🔄 DERIVED | |
| 12 | Time of Possession | ⏳ NEEDS_BACKEND | | Not in current JSON; derive from drive_summary clock ranges |
| 13 | Plays Per Minute | `eligible_scrimmage_plays / TOP_minutes` | 🔄 DERIVED | Needs TOP first |
| 14 | Game Tempo | ⏳ NEEDS_BACKEND | | Plays per minute adjusted for score differential |

---

## Section 2: Expected Points & EPA Streams

*The core advanced metric breakdown. EPA is the language of modern football analytics.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Total Offensive EPA | `advanced_team.epa_total` | ✅ NATIVE | Scrimmage plays only |
| 2 | EPA Per Play | `advanced_team.epa_per_play` | ✅ NATIVE | |
| 3 | Passing EPA Total | `sum(PBP epa where play_type=PASS)` | 🔄 DERIVED | Backend missing `epa_pass_total` |
| 4 | Passing EPA Per Dropback | `passing_EPA / pass_attempts` | 🔄 DERIVED | |
| 5 | Rushing EPA Total | `sum(PBP epa where play_type=RUSH)` | 🔄 DERIVED | Backend missing `epa_rush_total` |
| 6 | Rushing EPA Per Carry | `rushing_EPA / rush_attempts` | 🔄 DERIVED | |
| 7 | Special Teams EPA | `sum(PBP epa where is_special_teams)` | 🔄 DERIVED | Backend missing `special_teams_epa` |
| 8 | Penalty EPA | `sum(PBP epa where is_penalty)` | 🔄 DERIVED | Backend missing `penalty_epa` |
| 9 | Total Game EPA | `offensive_EPA + ST_EPA + penalty_EPA` | 🔄 DERIVED | The full ledger |
| 10 | Competitive EPA | `advanced_team.competitive_epa_total` | ✅ NATIVE | Excludes garbage time |
| 11 | Competitive EPA / Play | `advanced_team.competitive_epa_per_play` | ✅ NATIVE | |
| 12 | Garbage Time Play Share | `advanced_team.garbage_time_play_share` | ✅ NATIVE | % of plays in garbage time |
| 13 | First Half EPA | `sum(PBP epa where quarter <= 2)` | 🔄 DERIVED | |
| 14 | Second Half EPA | `sum(PBP epa where quarter > 2)` | 🔄 DERIVED | |
| 15 | EPA by Quarter | `sum(PBP epa grouped by quarter)` | 🔄 DERIVED | 4 buckets |
| 16 | Positive EPA Play Rate | ⏳ NEEDS_BACKEND | | % of plays with EPA > 0 |
| 17 | EPA Variance | ⏳ NEEDS_BACKEND | | Standard dev of EPA — consistency metric |
| 18 | EPA Success Rate | `advanced_team.success_rate` | ✅ NATIVE | Plays with EPA > 0 or success flag |

---

## Section 3: Success Rates & Situational

*Down-and-distance context. The backbone of efficiency analysis.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Overall Success Rate | `advanced_team.success_rate_down_distance` | ✅ NATIVE | |
| 2 | Standard Down Success | `advanced_team.success_rate_standard_down` | ✅ NATIVE | 1st down + 2nd & <= 8 |
| 3 | Passing Down Success | `advanced_team.success_rate_passing_down` | ✅ NATIVE | 3rd down + 2nd & > 8 |
| 4 | Early Down Success (1st & 2nd) | `advanced_team.success_rate_early_down` | ✅ NATIVE | |
| 5 | Late Down Success (3rd & 4th) | `advanced_team.success_rate_late_down` | ✅ NATIVE | |
| 6 | Goal-to-Go Success | `advanced_team.success_rate_goal_to_go` | ✅ NATIVE | |
| 7 | Two-Minute Success | `advanced_team.success_rate_two_minute` | ✅ NATIVE | |
| 8 | Middle 8 Success | `advanced_team.success_rate_middle_8` | ✅ NATIVE | Q2 final 4 + Q3 first 4 |
| 9 | Passing Success Rate | `sum(PBP success where PASS) / pass_plays` | 🔄 DERIVED | Backend missing |
| 10 | Rushing Success Rate | `sum(PBP success where RUSH) / rush_plays` | 🔄 DERIVED | Backend missing |
| 11 | Red Zone Success Rate | ⏳ NEEDS_BACKEND | | Scoring plays / RZ trips |
| 12 | Success Rate by Field Position | ⏳ NEEDS_BACKEND | | Own 20-40, 40-50, Opp 50-40, Opp 40-20, RZ |
| 13 | Success Rate by Score Differential | ⏳ NEEDS_BACKEND | | Leading / Tied / Trailing / Blowout |
| 14 | Success Rate by Quarter | ⏳ NEEDS_BACKEND | | Q1/Q2/Q3/Q4 split |
| 15 | Consecutive Success Streak (max) | ⏳ NEEDS_BACKEND | | Longest streak of successful plays |

---

## Section 4: Explosiveness & Big Plays

*Game-changing plays that flip field position and win games.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Explosive Plays (Total) | `sum(PBP explosive flag)` | 🔄 DERIVED | Backend missing total count |
| 2 | Explosive Pass Plays | `sum(PBP explosive where PASS)` | 🔄 DERIVED | |
| 3 | Explosive Rush Plays | `sum(PBP explosive where RUSH)` | 🔄 DERIVED | |
| 4 | Explosive Play Rate | `advanced_team.explosive_rate_yardage` | ✅ NATIVE | |
| 5 | Explosive Play Rate (EPA-based) | `advanced_team.explosive_rate_epa` | ✅ NATIVE | |
| 6 | EPA Without Explosives | `sum(PBP epa where not explosive)` | 🔄 DERIVED | Sustained efficiency |
| 7 | EPA Per Explosive Play | `explosive_EPA / explosive_count` | 🔄 DERIVED | |
| 8 | Longest Pass Play | ⏳ NEEDS_BACKEND | | Max yards on a pass |
| 9 | Longest Rush Play | ⏳ NEEDS_BACKEND | | Max yards on a rush |
| 10 | Big Play Rate (15+ yards) | ⏳ NEEDS_BACKEND | | Slightly lower threshold |
| 11 | Big Play Rate (25+ yards) | ⏳ NEEDS_BACKEND | | Higher threshold |
| 12 | IsoPPP | ⏳ NEEDS_BACKEND | | Explosiveness on successful plays only |
| 13 | Explosive Drive Rate | `advanced_team.explosive_drive_rate` | ✅ NATIVE | Drives with an explosive play |

---

## Section 5: Passing Splits

*Everything through the air.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Pass Attempts | `team_box.pass_attempts` | ✅ NATIVE | |
| 2 | Completions | `team_box.pass_completions` | ✅ NATIVE | |
| 3 | Completion % | `team_box.pass_completion_pct` | ✅ NATIVE | |
| 4 | Passing Yards | `team_box.pass_yards` | ✅ NATIVE | |
| 5 | Yards Per Attempt | `team_box.yards_per_pass_attempt` | ✅ NATIVE | |
| 6 | Yards Per Completion | `pass_yards / completions` | 🔄 DERIVED | |
| 7 | Passing Touchdowns | `team_box.pass_touchdowns` | ✅ NATIVE | |
| 8 | Interceptions Thrown | `team_box.interceptions_thrown` | ✅ NATIVE | |
| 9 | Sacks Allowed | `team_box.sacks_allowed` | ✅ NATIVE | |
| 9a | Sack Yards Lost | `sum(individual_stats.passing[].sack_yards_lost)` | 🔄 DERIVED | Team-level field requested — `team_box` ships the count, not the yards |
| 10 | Sack Rate | `sacks / (attempts + sacks)` | 🔄 DERIVED | |
| 10a | Net Yards Per Dropback | `(pass_yards − sack_yards) / (attempts + sacks)` | 🔄 DERIVED | SP+ reading; sack yardage off the top |
| 11 | Passing EPA | `sum(PBP epa where PASS)` | 🔄 DERIVED | |
| 12 | EPA Per Dropback | `passing_EPA / (attempts + sacks)` | 🔄 DERIVED | Better than EPA/attempt |
| 13 | Pass Success Rate | `sum(PBP success where PASS) / pass_plays` | 🔄 DERIVED | |
| 14 | Pass Explosive Rate | `sum(PBP explosive where PASS) / pass_plays` | 🔄 DERIVED | |
| 15 | Short Pass Rate | ⏳ NEEDS_BACKEND | | From depth_breakdown in individual_stats |
| 16 | Medium Pass Rate | ⏳ NEEDS_BACKEND | | |
| 17 | Deep Pass Rate | ⏳ NEEDS_BACKEND | | 15+ air yards |
| 18 | Pressure Rate Faced | `pressure_profile.pressure_rate_faced` | ✅ NATIVE | |
| 19 | Pressure Completion % | `pressure_profile.pressure_completion_pct` | ✅ NATIVE | |
| 20 | Hurries Faced | `pressure_profile.hurries_faced` | ✅ NATIVE | |
| 21 | Pass Heat Map | `heat_maps.pass_heat_map` | ✅ NATIVE | Visual — short/left, deep/middle, etc. |
| 22 | Air Yards | ⏳ NEEDS_BACKEND | | Total air yards (before YAC) |
| 23 | YAC Total | ⏳ NEEDS_BACKEND | | Yards after catch |
| 24 | YAC Per Completion | ⏳ NEEDS_BACKEND | | |
| 25 | On-Target Throw Rate | ⏳ NEEDS_BACKEND | | Completions + drops / attempts |
| 26 | 3rd Down Pass Conversion | ⏳ NEEDS_BACKEND | | Pass plays converting 3rd down |

---

## Section 6: Rushing Splits

*Everything on the ground.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Rush Attempts | `team_box.rush_attempts` | ✅ NATIVE | |
| 2 | Rushing Yards | `team_box.rush_yards` | ✅ NATIVE | Sacks are their own category — this EXCLUDES sack yardage |
| 2a | Rushing Yards After Sacks | `rush_yards − sack_yards` | 🔄 DERIVED | The conference box-score convention, kept beside the clean figure |
| 3 | Yards Per Carry | `team_box.yards_per_carry` | ✅ NATIVE | |
| 4 | Rushing Touchdowns | `team_box.rush_touchdowns` | ✅ NATIVE | |
| 5 | Rushing EPA | `sum(PBP epa where RUSH)` | 🔄 DERIVED | |
| 6 | EPA Per Rush | `rushing_EPA / rush_attempts` | 🔄 DERIVED | |
| 7 | Rush Success Rate | `sum(PBP success where RUSH) / rush_plays` | 🔄 DERIVED | |
| 8 | Rush Explosive Rate | `sum(PBP explosive where RUSH) / rush_plays` | 🔄 DERIVED | |
| 9 | Line Yards Total | `advanced_team.line_yards_total` | ✅ NATIVE | OL performance metric |
| 10 | Line Yards Per Rush | `advanced_team.line_yards_per_rush` | ✅ NATIVE | |
| 11 | Highlight Yards Total | `advanced_team.highlight_yards_total` | ✅ NATIVE | RB-created yards |
| 12 | Highlight Yards Per Rush | `advanced_team.highlight_yards_per_rush` | ✅ NATIVE | |
| 13 | Opportunity Rate | `advanced_team.rush_opportunity_rate` | ✅ NATIVE | % of runs >= 4 yards |
| 14 | Stuff Rate | `advanced_team.stuff_rate` | ✅ NATIVE | % of runs <= 0 yards |
| 15 | Stopped Run Rate | `advanced_team.stopped_run_rate` | ✅ NATIVE | % of runs <= 2 yards |
| 16 | Power Run Attempts | `advanced_team.power_run_attempts` | ⚠️ NULL_BUG | Null in current export |
| 17 | Power Success Rate | `advanced_team.power_run_success_rate` | ⚠️ NULL_BUG | Null in current export |
| 18 | Rush Heat Map | `heat_maps.rush_heat_map` | ✅ NATIVE | Visual — left/middle/right by depth |
| 19 | First Down Run Rate | `coaching_profile.run_pass_by_down[1].run_rate` | ✅ NATIVE | |
| 20 | Broken Tackle Rate | ⏳ NEEDS_BACKEND | | From PBP action flags |
| 21 | Negative Run Rate | ⏳ NEEDS_BACKEND | | Runs losing yards |
| 22 | 10+ Yard Run Count | ⏳ NEEDS_BACKEND | | |
| 23 | Goal Line Rush Rate | ⏳ NEEDS_BACKEND | | Runs inside opponent 5 |

---

## Section 7: Drive Efficiency & Finishing

*Moving the ball is step one. Converting drives to points is what wins.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Offensive Drives | `team_box.drives_offense` | ✅ NATIVE | |
| 2 | Points Per Drive | `team_box.points_per_drive` | ✅ NATIVE | |
| 3 | Avg Start Field Position | `team_box.avg_start_field_position` | ✅ NATIVE | Yard line (1-100) |
| 4 | Long Field Drives | `team_box.long_field_drives` | ✅ NATIVE | Starting inside own 30 |
| 5 | Long Field Rate | `team_box.long_field_rate` | ✅ NATIVE | |
| 6 | Quality Drive Rate | `advanced_team.quality_drive_rate` | ✅ NATIVE | Drives reaching opp 40 |
| 7 | Explosive Drive Rate | `advanced_team.explosive_drive_rate` | ✅ NATIVE | Drives with explosive play |
| 8 | Negative Drive Rate | `advanced_team.negative_drive_rate` | ✅ NATIVE | Drives losing yards |
| 9 | Points Per Quality Drive | `advanced_team.points_per_quality_drive` | ✅ NATIVE | |
| 10 | Opportunities Inside 40 | `advanced_team.opportunities_40` | ✅ NATIVE | |
| 11 | Points Per Opp Inside 40 | `advanced_team.points_per_opportunity_40` | ✅ NATIVE | |
| 12 | Red Zone Opportunities | `advanced_team.red_zone_opportunities` | ✅ NATIVE | |
| 13 | Red Zone Points Per Opp | `advanced_team.red_zone_points_per_opportunity` | ✅ NATIVE | |
| 14 | Red Zone TD Rate | `advanced_team.red_zone_td_rate` | ✅ NATIVE | |
| 15 | Scoring Drives | ⏳ NEEDS_BACKEND | | Count from drive_summary |
| 16 | Scoring Drive Rate | ⏳ NEEDS_BACKEND | | |
| 17 | TD Drive Rate | ⏳ NEEDS_BACKEND | | |
| 18 | FG Drive Rate | ⏳ NEEDS_BACKEND | | |
| 19 | Punt Drive Rate | ⏳ NEEDS_BACKEND | | |
| 20 | Turnover Drive Rate | ⏳ NEEDS_BACKEND | | |
| 21 | Three-and-Out Rate | ⏳ NEEDS_BACKEND | | |
| 22 | Sustained Drive Rate (8+ plays) | ⏳ NEEDS_BACKEND | | |
| 23 | Available Yards % | ⏳ NEEDS_BACKEND | | Yards gained / yards available |
| 24 | Drive Success Rate | ⏳ NEEDS_BACKEND | | Score or flip field |
| 25 | Short Field Rate | ⏳ NEEDS_BACKEND | | Starting past own 50 |
| 26 | Field Position Delta Avg | ⏳ NEEDS_BACKEND | | Mean(end - start) per drive |
| 27 | Time Per Drive | ⏳ NEEDS_BACKEND | | |
| 28 | Yards Per Drive | ⏳ NEEDS_BACKEND | | |
| 29 | Plays Per Drive | ⏳ NEEDS_BACKEND | | |

---

## Section 8: Third & Fourth Downs

*Money downs. Where games are won and lost.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | 3rd Down Attempts | `team_box.third_down_attempts` | ✅ NATIVE | |
| 2 | 3rd Down Conversions | `team_box.third_down_conversions` | ✅ NATIVE | |
| 3 | 3rd Down Conversion Rate | `team_box.third_down_conversion_rate` | ✅ NATIVE | |
| 4 | Avg 3rd Down Distance | `team_box.third_down_avg_distance` | ✅ NATIVE | |
| 5 | 3rd Down Pass Success | ⏳ NEEDS_BACKEND | | |
| 6 | 3rd Down Rush Success | ⏳ NEEDS_BACKEND | | |
| 7 | 3rd & Short (1-3) Conversion | ⏳ NEEDS_BACKEND | | |
| 8 | 3rd & Medium (4-7) Conversion | ⏳ NEEDS_BACKEND | | |
| 9 | 3rd & Long (8+) Conversion | ⏳ NEEDS_BACKEND | | |
| 10 | 4th Down Goes | `team_box.fourth_down_goes` | ✅ NATIVE | |
| 11 | 4th Down Conversions | `team_box.fourth_down_go_conversions` | ✅ NATIVE | |
| 12 | 4th Down Go Rate | `team_box.fourth_down_go_rate` | ✅ NATIVE | |
| 13 | 4th Down Conversion Rate | `team_box.fourth_down_go_conversion_rate` | ✅ NATIVE | May be null if no attempts |
| 14 | 4th Down Avg Distance | ⏳ NEEDS_BACKEND | | |
| 15 | 4th Down Decision Quality | ⏳ NEEDS_BACKEND | | Go-for-it vs punt vs FG by field position |

---

## Section 9: Defensive Performance

*What the defense generated — not just what the opponent did.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Sacks Made | `team_box.sacks_made` | ✅ NATIVE | |
| 1a | Sack Yards Forced | `sum(OPPONENT individual_stats.passing[].sack_yards_lost)` | 🔄 DERIVED | Both teams are in one file, so the mirror is available |
| 2 | Sack Rate Forced | `advanced_team.sack_rate_forced` | ✅ NATIVE | |
| 3 | TFL Rate Forced | `advanced_team.tfl_rate_forced` | ✅ NATIVE | |
| 4 | Havoc Rate Forced | `advanced_team.havoc_rate_forced` | ✅ NATIVE | |
| 5 | Havoc Rate Allowed | `advanced_team.havoc_rate_allowed` | ✅ NATIVE | |
| 6 | Pass Defended Rate Forced | `advanced_team.pass_defended_rate_forced` | ✅ NATIVE | |
| 7 | Disruption Rate | `defensive_identity.disruption_rate` | ✅ NATIVE | |
| 8 | Explosive Prevention Rate | `defensive_identity.explosive_prevention_rate` | ✅ NATIVE | |
| 9 | Yards Per Play Allowed | `defensive_identity.yards_per_play_allowed` | ✅ NATIVE | |
| 10 | Bend-Don't-Break Index | `defensive_identity.bend_dont_break_index` | ✅ NATIVE | |
| 11 | Defensive Plays | `defensive_identity.def_plays` | ✅ NATIVE | |
| 12 | Pressure Rate Forced | `pressure_profile.pressure_rate_forced` | ✅ NATIVE | |
| 13 | Total Pressures Forced | `pressure_profile.total_pressures_forced` | ✅ NATIVE | |
| 14 | QB Hurries Forced | `pressure_profile.qb_hurries_forced` | ✅ NATIVE | |
| 15 | Sacks Forced | `pressure_profile.sacks_forced` | ✅ NATIVE | |
| 16 | Defense Role Distribution | `defense_role_distribution` | ✅ NATIVE | Pass rush % DL, coverage % DB, etc. |
| 17 | 3rd Down Stops | ⏳ NEEDS_BACKEND | | From defensive_context (missing in v3) |
| 18 | 3rd Down Stop Rate | ⏳ NEEDS_BACKEND | | |
| 19 | Red Zone Stops | ⏳ NEEDS_BACKEND | | |
| 20 | Red Zone Stop Rate | ⏳ NEEDS_BACKEND | | |
| 21 | Drives Faced | ⏳ NEEDS_BACKEND | | |
| 22 | Drives Stopped (Punt) | ⏳ NEEDS_BACKEND | | |
| 23 | Drives Stopped (Turnover) | ⏳ NEEDS_BACKEND | | |
| 24 | Drives Stopped (Downs) | ⏳ NEEDS_BACKEND | | |
| 25 | Drives Allowed TD | ⏳ NEEDS_BACKEND | | |
| 26 | Drives Allowed FG | ⏳ NEEDS_BACKEND | | |
| 27 | Three-and-Outs Forced | ⏳ NEEDS_BACKEND | | |
| 28 | Points Allowed Per Drive | ⏳ NEEDS_BACKEND | | |
| 29 | Yards Allowed Per Drive | ⏳ NEEDS_BACKEND | | |

---

## Section 10: Turnovers & Luck

*The random element that decides close games.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Turnovers Committed | `team_box.turnovers_committed` | ✅ NATIVE | |
| 2 | Turnovers Forced | `team_box.turnovers_forced` | ✅ NATIVE | |
| 3 | Expected Turnovers | `advanced_team.expected_turnovers` | ✅ NATIVE | Model-based expectation |
| 4 | Actual Turnovers | `advanced_team.actual_turnovers` | ✅ NATIVE | |
| 5 | Turnover Luck | `advanced_team.turnover_luck` | ✅ NATIVE | Actual - Expected |
| 6 | Fumbles Lost | ⏳ NEEDS_BACKEND | | team_box missing this field |
| 7 | Interceptions Thrown | `team_box.interceptions_thrown` | ✅ NATIVE | |
| 8 | Interceptions Made | ⏳ NEEDS_BACKEND | | From defensive_context |
| 9 | Forced Fumbles | ⏳ NEEDS_BACKEND | | |
| 10 | Turnover Score Rate | `sequence_model.turnover_score_rate` | ✅ NATIVE | Points scored after takeaway |
| 11 | Turnover TD Count | `sequence_model.turnover_td_count` | ✅ NATIVE | |
| 12 | Turnover TD Rate | `sequence_model.turnover_td_rate` | ✅ NATIVE | |
| 13 | Sudden Change Defense | `sequence_model.sudden_change_defense` | ✅ NATIVE | Stops after own turnover |
| 14 | Stabilization After Explosive Allowed | `sequence_model.stabilization_after_explosive_allowed` | ✅ NATIVE | |

---

## Section 11: Special Teams

*Hidden yardage and field position battles.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | ST Play Count | `special_teams_advanced.summary.st_play_count` | ✅ NATIVE | |
| 2 | ST Swing Yards | `special_teams_advanced.summary.st_swing_yards` | ✅ NATIVE | |
| 3 | ST Hidden Yards | `advanced_team.special_teams_hidden_yards` | ✅ NATIVE | |
| 4 | Penalty Yards Cost (ST) | `special_teams_advanced.summary.penalty_yards_cost` | ✅ NATIVE | |
| 5 | FG Attempts | `special_teams_advanced.fg_offense.attempts` | ✅ NATIVE | |
| 6 | FG Made | `special_teams_advanced.fg_offense.made` | ✅ NATIVE | |
| 7 | FG % | `special_teams_advanced.fg_offense.pct` | ✅ NATIVE | |
| 8 | FG Long | `special_teams_advanced.fg_offense.long` | ✅ NATIVE | |
| 9 | FG Blocked | `special_teams_advanced.fg_offense.blocked` | ✅ NATIVE | |
| 10 | FG By Range | `special_teams_advanced.fg_offense.by_range` | ✅ NATIVE | u30, 30-39, 40-49, 50+ |
| 11 | Kicker Trust Range | `special_teams_advanced.fg_offense.kicker_talent_trust_range` | ✅ NATIVE | |
| 12 | Coach Aggression Threshold | `special_teams_advanced.fg_offense.coach_aggression_threshold` | ✅ NATIVE | |
| 13 | Punt Attempts | `special_teams_advanced.punt_offense` | ✅ NATIVE | |
| 14 | Punt Net Yards | ⏳ NEEDS_BACKEND | | |
| 15 | Punt Average | ⏳ NEEDS_BACKEND | | |
| 16 | Punt Inside 20 | ⏳ NEEDS_BACKEND | | |
| 17 | Punt Touchbacks | ⏳ NEEDS_BACKEND | | |
| 18 | Kickoff Attempts | `special_teams_advanced.kickoff_offense` | ✅ NATIVE | |
| 19 | Kickoff Average | ⏳ NEEDS_BACKEND | | |
| 20 | Kickoff Touchbacks | ⏳ NEEDS_BACKEND | | |
| 21 | Return Yards (Kickoff) | ⏳ NEEDS_BACKEND | | |
| 22 | Return Yards (Punt) | ⏳ NEEDS_BACKEND | | |
| 23 | Return Average | ⏳ NEEDS_BACKEND | | |
| 24 | PAT Attempts | `special_teams_advanced.pat_offense` | ✅ NATIVE | |
| 25 | PAT Made | ⏳ NEEDS_BACKEND | | |
| 26 | PAT % | ⏳ NEEDS_BACKEND | | |
| 27 | FG ESPA | ⏳ NEEDS_BACKEND | | Expected points added on FG decisions |
| 28 | Punt ESPA | ⏳ NEEDS_BACKEND | | Expected points added on punt decisions |
| 29 | Kickoff Return EPA | ⏳ NEEDS_BACKEND | | |
| 30 | Punt Return EPA | ⏳ NEEDS_BACKEND | | |

---

## Section 12: Penalties & Discipline

*Self-inflicted wounds and hidden yardage.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Penalties Committed | `team_box.penalties` | ✅ NATIVE | |
| 2 | Penalty Yards | `team_box.penalty_yards` | ✅ NATIVE | |
| 3 | Total Accepted | `penalty_advanced.total_accepted` | ✅ NATIVE | |
| 4 | Total Yards | `penalty_advanced.total_yards` | ✅ NATIVE | |
| 5 | Penalty Rate | `penalty_advanced.penalty_rate` | ✅ NATIVE | |
| 6 | Pre-Snap Rate | `penalty_advanced.pre_snap_rate` | ✅ NATIVE | |
| 7 | Live Ball Rate | `penalty_advanced.live_ball_rate` | ✅ NATIVE | |
| 8 | High Leverage Penalties | `penalty_advanced.high_leverage_count` | ✅ NATIVE | |
| 9 | Drive Kills | `penalty_advanced.drive_kill_count` | ✅ NATIVE | |
| 10 | Drive Extends | `penalty_advanced.drive_extend_count` | ✅ NATIVE | |
| 11 | Hidden Yardage Lost | `penalty_advanced.hidden_yardage_lost` | ✅ NATIVE | |
| 12 | Hidden Yardage Gained | `penalty_advanced.hidden_yardage_gained` | ✅ NATIVE | |
| 13 | Auto First Downs Given | `penalty_advanced.auto_first_downs_given` | ✅ NATIVE | |
| 14 | Auto First on Critical Down | `penalty_advanced.auto_first_on_critical_down` | ✅ NATIVE | |
| 15 | False Start on 3rd Down | `penalty_advanced.false_start_3rd_down` | ✅ NATIVE | |
| 16 | Holding on Passing Down | `penalty_advanced.holding_on_passing_down` | ✅ NATIVE | |
| 17 | Penalties in Red Zone | `penalty_advanced.in_red_zone` | ✅ NATIVE | |
| 18 | Penalties in Clutch Time | `penalty_advanced.in_clutch_time` | ✅ NATIVE | |
| 19 | Penalties on 3rd Down | `penalty_advanced.on_3rd_down` | ✅ NATIVE | |
| 20 | Penalties on 4th Down | `penalty_advanced.on_4th_down` | ✅ NATIVE | |
| 21 | Accepted Penalty EPA Sum | `penalty_advanced.accepted_penalty_epa_sum` | ✅ NATIVE | |
| 22 | Drives with Accepted Penalty | `penalty_advanced.drives_with_accepted_penalty` | ✅ NATIVE | |
| 23 | Repeat Offender Players | `penalty_advanced.repeat_offender_players` | ✅ NATIVE | List |
| 24 | Top Penalty Types | `penalty_advanced.top_penalty_types` | ✅ NATIVE | List with counts |
| 25 | Yards Per Game | `penalty_advanced.yards_per_game` | ✅ NATIVE | |
| 26 | Hidden Yardage (Net) | `hidden_yardage.net_hidden_yards` | ⚠️ NULL_BUG | Null in current export |
| 27 | Penalty First Downs Against | `hidden_yardage.penalty_first_downs_against` | ⚠️ NULL_BUG | Null |
| 28 | Negated First Downs | `hidden_yardage.negated_first_downs` | ⚠️ NULL_BUG | Null |
| 29 | Penalty Swing Yards | `hidden_yardage.penalty_swing_yards` | ⚠️ NULL_BUG | Null |

---

## Section 13: Coaching & Tendencies

*What the coaches called and when.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | 1st Down Run Rate | `coaching_profile.run_pass_by_down[1].run_rate` | ✅ NATIVE | |
| 2 | 2nd Down Run Rate | `coaching_profile.run_pass_by_down[2].run_rate` | ✅ NATIVE | |
| 3 | 3rd Down Run Rate | `coaching_profile.run_pass_by_down[3].run_rate` | ✅ NATIVE | |
| 4 | 1st Down Run Count | `coaching_profile.run_pass_by_down[1].runs` | ✅ NATIVE | |
| 5 | 1st Down Pass Count | `coaching_profile.run_pass_by_down[1].passes` | ✅ NATIVE | |
| 6 | Red Zone Run Rate | `coaching_profile.red_zone_tendency.run_rate` | ✅ NATIVE | |
| 7 | Red Zone Runs | `coaching_profile.red_zone_tendency.runs` | ✅ NATIVE | |
| 8 | Red Zone Passes | `coaching_profile.red_zone_tendency.passes` | ✅ NATIVE | |
| 9 | Obvious Pass Success | `coaching_profile.obvious_situation_execution.obvious_pass_success_rate` | ✅ NATIVE | |
| 10 | Obvious Run Success | `coaching_profile.obvious_situation_execution.obvious_run_success_rate` | ✅ NATIVE | |
| 11 | Predictability Index | `coaching_profile.predictability_index` | ✅ NATIVE | Higher = more predictable |
| 12 | Halftime Adjustment | `coaching_profile.halftime_adjustment.adjustment_delta` | ✅ NATIVE | H2 - H1 success rate |
| 13 | H1 Success Rate | `coaching_profile.halftime_adjustment.h1_success_rate` | ✅ NATIVE | |
| 14 | H2 Success Rate | `coaching_profile.halftime_adjustment.h2_success_rate` | ✅ NATIVE | |
| 15 | Short Yardage Tendency | `coaching_profile.short_yardage_tendency` | ✅ NATIVE | |
| 16 | Efficiency by Down Call | `coaching_profile.efficiency_by_down_call` | ✅ NATIVE | EPA by run vs pass per down |
| 17 | 4th Down Aggression Score | ⏳ NEEDS_BACKEND | | Go rate weighted by WP |
| 18 | Deep Shot Rate | ⏳ NEEDS_BACKEND | | 20+ yard passes / total passes |
| 19 | Play Action Rate | ⏳ NEEDS_BACKEND | | |
| 20 | No-Huddle Rate | ⏳ NEEDS_BACKEND | | From PBP raw_text |
| 21 | Tempo (Seconds Per Play) | ⏳ NEEDS_BACKEND | | |
| 22 | Script Adherence | ⏳ NEEDS_BACKEND | | Opening drive script success |

---

## Section 14: Sequence & Momentum

*How teams responded to game events.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | After 3-and-Out | `sequence_model.after_3_and_out` | ✅ NATIVE | Next drive result |
| 2 | After Own Turnover | `sequence_model.after_own_turnover` | ✅ NATIVE | Next drive result |
| 3 | Max Consecutive Scoring Drives | `sequence_model.max_consecutive_scoring_drives` | ✅ NATIVE | |
| 4 | Q4 Go-Ahead Drives | `sequence_model.q4_go_ahead_drives` | ✅ NATIVE | |
| 5 | Q4 Lead Changes | `sequence_model.q4_lead_changes` | ✅ NATIVE | |
| 6 | Q4 Lead Takes | `sequence_model.q4_lead_takes` | ✅ NATIVE | |
| 7 | Momentum Shifts | ⏳ NEEDS_BACKEND | | Count of 10+ EPA swing sequences |
| 8 | Response to Deficit | ⏳ NEEDS_BACKEND | | EPA/play when trailing |
| 9 | Response to Lead | ⏳ NEEDS_BACKEND | | EPA/play when leading |
| 10 | Comeback Factor | ⏳ NEEDS_BACKEND | | Max deficit overcome |

---

## Section 15: Data Quality & Coverage

*Transparency panel. Shows what's real vs derived.*

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 1 | Schema Version | `_schema` | ✅ NATIVE | |
| 2 | Play Count | `enrichment_summary.play_count` | ✅ NATIVE | |
| 3 | Drive Count | `enrichment_summary.drive_count` | ✅ NATIVE | |
| 4 | Enrichment Version | `enrichment_summary.enrichment_version` | ✅ NATIVE | |
| 5 | Generated At | `enrichment_summary.generated_at` | ✅ NATIVE | |
| 6 | Native Metrics Count | 🔄 DERIVED | | Count of ✅ fields displayed |
| 7 | Derived Metrics Count | 🔄 DERIVED | | Count of 🔄 fields displayed |
| 8 | Missing Metrics Count | 🔄 DERIVED | | Count of ⏳ fields displayed |
| 9 | Coverage Score | 🔄 DERIVED | | % of total metrics that are native |

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  DATA ROOM — [Away] vs [Home]                               │
├─────────────────────────────────────────────────────────────┤
│  [Overview Bar: Score | Plays | Yards | EPA | Success | TO] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 2. EPA Streams      │  │ 3. Success Rates    │          │
│  │ 4. Explosiveness    │  │ 5. Passing          │          │
│  ├─────────────────────┤  ├─────────────────────┤          │
│  │ 6. Rushing          │  │ 7. Drive Efficiency │          │
│  │ 8. Third & Fourth   │  │ 9. Defense          │          │
│  ├─────────────────────┤  ├─────────────────────┤          │
│  │ 10. Turnovers       │  │ 11. Special Teams   │          │
│  │ 12. Penalties       │  │ 13. Coaching        │          │
│  ├─────────────────────┤  ├─────────────────────┤          │
│  │ 14. Sequence        │  │ 15. Data Quality    │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

- 2-column grid on desktop, 1-column on mobile
- Each section is a collapsible card (default: expanded)
- Each row: Label | Away Value | Home Value | Better team highlighted
- Missing fields show `—` with tooltip: "Coming in next data update"
- Derived fields show small `*` with tooltip: "Calculated from play-by-play"

---

## Backend Request Summary

**High Priority (P1) — add to game export:**

| Field | Section | Why |
|-------|---------|-----|
| `time_of_possession` | Overview | Fundamental stat |
| `epa_pass_total` / `epa_rush_total` | EPA Streams | Currently derived; should be native |
| `special_teams_epa` | EPA Streams | Currently derived |
| `penalty_epa` | EPA Streams | Currently derived |
| `success_rate_passing` / `success_rate_rushing` | Success Rates | Currently derived |
| `explosive_plays_total` / `explosive_passes` / `explosive_rushes` | Explosiveness | Currently derived |
| `fumbles_lost` | Turnovers | Missing from team_box |
| `power_run_attempts` / `power_run_success_rate` | Rushing | Null bug — fix calculation |
| `hidden_yardage.*` fields | Penalties | Null bug — fix calculation |
| `defensive_context` object | Defense | Missing entirely in v3 schema |
| `drive_summary` with results | Drive Efficiency | Need scoring results per drive |

**Medium Priority (P2):**
- Air yards / YAC breakdown
- Pressure details (hits, knockdowns)
- Special teams: punt net, return averages, touchbacks
- Tempo / seconds per play
- No-huddle rate
- Play action rate
- Deep shot rate

---

*Spec Version: 1.0*
*Date: 2026-05-27*
*Based on: frontend_ready_v3 schema, W0hufamu.json sample*
