# Current Data Inventory

**Status**: March 2026 - Reflecting actual implementation state
**Purpose**: Complete inventory of all metrics currently available vs. planned across the 4-pipeline architecture

---

## Conventions

### Levels
- `play` - Individual play level
- `drive` - Drive level aggregation
- `game` - Single game summary
- `season` - Season-level aggregation
- `conference` - Conference-level aggregation

### Entities
- `team` - Team-level metrics
- `player` - Individual player metrics
- `coach` - Coaching decision metrics
- `official` - Official/crew metrics (game-level only)
- `defense` - Defensive unit metrics

### Status
- `✅ ready` - Available in current output
- `🚧 derive` - Computable from existing fields (needs calculation layer)
- `⚠️ partial` - Partially implemented / some data available
- `❌ missing` - Not yet implemented

### Priority
- `P0` - Core game output contract (required)
- `P1` - Near-term website metrics (high impact)
- `P2` - Advanced metrics (needs richer parsing)
- `P3` - Cross-game modeling (season/conference level)

### Metric Quality
- `explicit` - Directly observed in parsed data
- `proxy` - Inferred/approximate from available fields

---

## 1) Pipeline A: Entity Identity Pipeline

**Location**: `0-people/`, `1-rosters/`, `2-roster-stats/`, `11-entity/`
**Status**: ✅ Active and operational

### 1.1 Player Entity Records

| Field | Level | Entity | Path | Status | Priority | Quality |
|-------|-------|--------|------|--------|----------|---------|
| person_id | season | player | `persons.json` | ✅ ready | P0 | explicit |
| player_season_id | season | player | `player_seasons_2025.json` | ✅ ready | P0 | explicit |
| name | season | player | `$.name` | ✅ ready | P0 | explicit |
| name_normalized | season | player | `$.name_normalized` | ✅ ready | P0 | explicit |
| team_id | season | player | `$.team_id` | ✅ ready | P0 | explicit |
| position | season | player | `$.position` | ✅ ready | P0 | explicit |
| position_group | season | player | `$.position_group` | ✅ ready | P1 | explicit |
| class_year | season | player | `$.class_year` | ✅ ready | P0 | explicit |
| height | season | player | `$.height` | ✅ ready | P1 | explicit |
| weight | season | player | `$.weight` | ✅ ready | P1 | explicit |
| bmi | season | player | `$.bmi` | ✅ ready | P1 | derive |
| body_type | season | player | `$.body_type` | ✅ ready | P1 | derive |
| is_transfer | season | player | `$.is_transfer` | ✅ ready | P1 | explicit |
| previous_school | season | player | `$.previous_school` | ✅ ready | P1 | explicit |
| previous_school_tier | season | player | `$.previous_school_tier` | ✅ ready | P1 | derive |
| hometown | season | player | `$.hometown` | ✅ ready | P2 | explicit |
| state | season | player | `$.state` | ✅ ready | P2 | explicit |
| in_state | season | player | `$.in_state` | ✅ ready | P2 | derive |
| experience_score | season | player | `$.experience_score` | ✅ ready | P1 | derive |
| jersey_number | season | player | `$.jersey_number` | ⚠️ partial | P2 | explicit |

### 1.2 Team Entity Records

| Field | Level | Entity | Path | Status | Priority | Quality |
|-------|-------|--------|------|--------|----------|---------|
| team_id | season | team | `teams.json` | ✅ ready | P0 | explicit |
| team_name | season | team | `$.name` | ✅ ready | P0 | explicit |
| conference | season | team | `$.conference` | ✅ ready | P0 | explicit |
| division | season | team | `$.division` | ✅ ready | P1 | explicit |
| city | season | team | `$.city` | ✅ ready | P2 | explicit |
| state | season | team | `$.state` | ✅ ready | P2 | explicit |
| mascot | season | team | `$.mascot` | ✅ ready | P2 | explicit |
| colors | season | team | `$.colors` | ✅ ready | P2 | explicit |
| fight_song | season | team | `$.fight_song` | ❌ missing | P3 | explicit |
| stadium | season | team | `$.stadium` | ❌ missing | P2 | explicit |

### 1.3 Roster Analytics (2-roster-stats)

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| positional_depth_index | season | team | Players per position | ✅ ready | P1 |
| class_year_pyramid | season | team | FR/SO/JR/SR distribution | ✅ ready | P1 |
| transfer_rate | season | team | Transfers / total players | ✅ ready | P1 |
| juco_rate | season | team | JUCO transfers / total | ✅ ready | P1 |
| fbs_transfer_rate | season | team | FBS transfers / total | ✅ ready | P1 |
| avg_bmi_by_position | season | team | Mean BMI per position group | ✅ ready | P2 |
| size_percentile | season | player | vs conference peers | 🚧 derive | P2 |
| roster_diversity_index | season | team | State/country distribution | ✅ ready | P3 |
| recruiting_radius | season | team | Avg distance from campus | 🚧 derive | P2 |
| prototype_fit_pct | season | player | vs NFL combine avg | ❌ missing | P2 |

---

## 2) Pipeline B: Game Parsing & Play-by-Play

**Location**: `10-GameFile/` through `24-Game-Advanced/`
**Status**: 🚧 8-stage pipeline operational, enrichment ongoing

### 2.1 Stage 12-Metadata: Game Metadata

| Field | Level | Entity | Path | Status | Priority |
|-------|-------|--------|------|--------|----------|
| game_id | game | team | `$.game_metadata.game_id` | ✅ ready | P0 |
| away_team_id | game | team | `$.game_metadata.away_team.id` | ✅ ready | P0 |
| home_team_id | game | team | `$.game_metadata.home_team.id` | ✅ ready | P0 |
| away_team_name | game | team | `$.game_metadata.away_team.name` | ✅ ready | P0 |
| home_team_name | game | team | `$.game_metadata.home_team.name` | ✅ ready | P0 |
| away_abbreviation | game | team | `$.game_metadata.away_abbrev` | ✅ ready | P0 |
| home_abbreviation | game | team | `$.game_metadata.home_abbrev` | ✅ ready | P0 |
| date | game | team | `$.game_metadata.date` | ✅ ready | P0 |
| site | game | team | `$.game_metadata.site` | ✅ ready | P1 |
| attendance | game | team | `$.game_metadata.attendance` | ✅ ready | P2 |
| temperature | game | team | `$.game_metadata.temperature` | ✅ ready | P2 |
| weather | game | team | `$.game_metadata.weather` | ✅ ready | P2 |
| officials | game | official | `$.game_metadata.officials` | ⚠️ partial | P2 |
| kickoff_time | game | team | `$.game_metadata.kickoff` | ✅ ready | P1 |
| final_score_away | game | team | `$.summary.final_score.away` | 🚧 derive | P0 |
| final_score_home | game | team | `$.summary.final_score.home` | 🚧 derive | P0 |
| conference_game | game | team | `$.game_metadata.conference_game` | ❌ missing | P1 |
| rivalry_game | game | team | `$.game_metadata.rivalry_game` | ❌ missing | P3 |

### 2.2 Stage 20-Play-Parser: Play Records

| Field | Level | Entity | Path | Status | Priority | Quality |
|-------|-------|--------|------|--------|----------|---------|
| play_id | play | team | `$.plays[*].play_id` | ✅ ready | P0 | explicit |
| line_number | play | team | `$.plays[*].line_number` | ✅ ready | P0 | explicit |
| raw_line | play | team | `$.plays[*].raw_line` | ✅ ready | P0 | explicit |
| sequence | play | team | `$.plays[*].sequence` | ✅ ready | P0 | explicit |
| period | play | team | `$.plays[*].period` | ✅ ready | P0 | explicit |
| clock | play | team | `$.plays[*].clock` | ✅ ready | P0 | explicit |
| line_type | play | team | `$.plays[*].line_type` | ✅ ready | P0 | explicit |
| play_type | play | team | `$.plays[*].play_type` | 🚧 derive | P0 | explicit |
| offense_team | play | team | `$.plays[*].offense` | ✅ ready | P0 | explicit |
| defense_team | play | team | `$.plays[*].defense` | ✅ ready | P0 | explicit |
| state_before.down | play | team | `$.plays[*].down` | ⚠️ partial | P0 | explicit |
| state_before.distance | play | team | `$.plays[*].distance` | ⚠️ partial | P0 | explicit |
| state_before.yardline_team | play | team | `$.plays[*].yardline.team` | ✅ ready | P0 | explicit |
| state_before.yardline_num | play | team | `$.plays[*].yardline.number` | ✅ ready | P0 | explicit |
| state_before.yardline_abs | play | team | `$.plays[*].yardline.absolute` | ✅ ready | P0 | explicit |
| state_before.score_offense | play | team | `$.plays[*].score.offense` | ✅ ready | P0 | explicit |
| state_before.score_defense | play | team | `$.plays[*].score.defense` | ✅ ready | P0 | explicit |
| actions | play | player | `$.plays[*].actions` | ✅ ready | P0 | explicit |
| penalties | play | team | `$.plays[*].penalties` | ⚠️ partial | P0 | explicit |
| possession_event | play | team | `$.plays[*].possession_event` | ✅ ready | P0 | explicit |
| scoring_event | play | team | `$.plays[*].scoring_event` | ❌ missing | P0 | explicit |
| no_play_flag | play | team | `$.plays[*].flags.no_play` | ❌ missing | P1 | explicit |

### 2.3 Stage 21-Drive-Parser: Drive Records

| Field | Level | Entity | Path | Status | Priority |
|-------|-------|--------|------|--------|----------|
| drive_id | drive | team | `$.drives[*].drive_id` | ✅ ready | P0 |
| drive_number | drive | team | `$.drives[*].drive_number` | ✅ ready | P0 |
| offense_team | drive | team | `$.drives[*].team` | ✅ ready | P0 |
| defense_team | drive | team | `$.drives[*].defense` | ❌ missing | P0 |
| start_period | drive | team | `$.drives[*].start.period` | ✅ ready | P0 |
| start_clock | drive | team | `$.drives[*].start.clock` | ✅ ready | P0 |
| start_yardline_team | drive | team | `$.drives[*].start.spot_team` | ✅ ready | P0 |
| start_yardline_num | drive | team | `$.drives[*].start.spot_num` | ✅ ready | P0 |
| start_yardline_abs | drive | team | `$.drives[*].start.spot_absolute` | ✅ ready | P0 |
| end_period | drive | team | `$.drives[*].end.period` | ✅ ready | P0 |
| end_clock | drive | team | `$.drives[*].end.clock` | ✅ ready | P0 |
| end_yardline_team | drive | team | `$.drives[*].end.spot_team` | ✅ ready | P0 |
| end_yardline_num | drive | team | `$.drives[*].end.spot_num` | ✅ ready | P0 |
| end_yardline_abs | drive | team | `$.drives[*].end.spot_absolute` | ✅ ready | P0 |
| total_plays | drive | team | `$.drives[*].plays_count` | ✅ ready | P0 |
| total_yards | drive | team | `$.drives[*].yards_net` | ✅ ready | P0 |
| time_of_possession | drive | team | `$.drives[*].time_of_possession` | ⚠️ partial | P1 |
| result | drive | team | `$.drives[*].result` | ✅ ready | P0 |
| points_scored | drive | team | `$.drives[*].points` | ❌ missing | P1 |
| possession_obtained_by | drive | team | `$.drives[*].possession_obtained_by` | ✅ ready | P0 |
| is_opening_kickoff_drive | drive | team | `$.drives[*].is_opening_kickoff_drive` | ✅ ready | P1 |
| start_score_home | drive | team | `$.drives[*].start.score_home` | ✅ ready | P0 |
| start_score_away | drive | team | `$.drives[*].start.score_away` | ✅ ready | P0 |
| end_score_home | drive | team | `$.drives[*].end.score_home` | ✅ ready | P0 |
| end_score_away | drive | team | `$.drives[*].end.score_away` | ✅ ready | P0 |

### 2.4 Stage 22-Enrichment: Context Tags

| Field | Level | Entity | Path | Status | Priority |
|-------|-------|--------|------|--------|----------|
| garbage_time | play | team | `$.plays[*].enrichment.garbage_time` | ✅ ready | P1 |
| competitive_time | play | team | `$.plays[*].enrichment.competitive_time` | ✅ ready | P1 |
| score_differential | play | team | `$.plays[*].enrichment.score_differential` | ✅ ready | P1 |
| time_remaining_quarter | play | team | `$.plays[*].enrichment.time_remaining.quarter` | ✅ ready | P1 |
| time_remaining_half | play | team | `$.plays[*].enrichment.time_remaining.half` | ✅ ready | P1 |
| time_remaining_game | play | team | `$.plays[*].enrichment.time_remaining.game` | ✅ ready | P1 |
| field_position_value | play | team | `$.plays[*].enrichment.field_position_value` | ✅ ready | P1 |
| situation | play | team | `$.plays[*].enrichment.situation` | ✅ ready | P1 |
| red_zone | play | team | `$.plays[*].enrichment.red_zone` | ❌ missing | P1 |
| standard_down | play | team | `$.plays[*].enrichment.standard_down` | ❌ missing | P1 |
| passing_down | play | team | `$.plays[*].enrichment.passing_down` | ❌ missing | P1 |

### 2.5 Stage 23-Aggregation: Team Stats

| Field | Level | Entity | Formula | Status | Priority |
|-------|-------|--------|---------|--------|----------|
| plays_offense | game | team | Count offensive plays | ✅ ready | P0 |
| plays_defense | game | team | Count defensive plays | 🚧 derive | P0 |
| drives_offense | game | team | Count offensive drives | ✅ ready | P0 |
| points_scored | game | team | Sum scoring plays | 🚧 derive | P0 |
| points_allowed | game | team | Opponent points | 🚧 derive | P0 |
| pass_attempts | game | team | Sum pass attempts | ✅ ready | P0 |
| pass_completions | game | team | Sum completions | ✅ ready | P0 |
| pass_yards | game | team | Sum pass yards | ✅ ready | P0 |
| pass_touchdowns | game | team | Sum pass TDs | ✅ ready | P0 |
| interceptions_thrown | game | team | Sum INTs | ✅ ready | P0 |
| rush_attempts | game | team | Sum rush attempts | ✅ ready | P0 |
| rush_yards | game | team | Sum rush yards | ✅ ready | P0 |
| rush_touchdowns | game | team | Sum rush TDs | ✅ ready | P0 |
| sacks_allowed | game | team | Sum sacks taken | ✅ ready | P0 |
| sacks_made | game | team | Sum sacks by defense | ✅ ready | P0 |
| turnovers_committed | game | team | Sum all turnovers | ✅ ready | P0 |
| turnovers_forced | game | team | Sum takeaways | ✅ ready | P0 |
| points_per_drive | game | team | points / drives | 🚧 derive | P1 |
| yards_per_play | game | team | yards / plays | 🚧 derive | P0 |
| yards_per_drive | game | team | yards / drives | 🚧 derive | P0 |
| avg_start_field_position | game | team | mean drive start | 🚧 derive | P1 |

### 2.6 Stage 23-Aggregation: Individual Stats

| Category | Field | Level | Entity | Status | Priority |
|----------|-------|-------|--------|--------|----------|
| **Passing** | attempts | game | player | ✅ ready | P0 |
| **Passing** | completions | game | player | ✅ ready | P0 |
| **Passing** | yards | game | player | ✅ ready | P0 |
| **Passing** | touchdowns | game | player | ✅ ready | P0 |
| **Passing** | interceptions | game | player | ✅ ready | P0 |
| **Passing** | sacks_taken | game | player | ✅ ready | P0 |
| **Rushing** | attempts | game | player | ✅ ready | P0 |
| **Rushing** | yards | game | player | ✅ ready | P0 |
| **Rushing** | touchdowns | game | player | ✅ ready | P0 |
| **Receiving** | receptions | game | player | ⚠️ partial | P0 |
| **Receiving** | yards | game | player | ⚠️ partial | P0 |
| **Receiving** | touchdowns | game | player | ⚠️ partial | P0 |
| **Defense** | tackles | game | player | ⚠️ partial | P1 |
| **Defense** | sacks | game | player | ⚠️ partial | P1 |
| **Defense** | interceptions | game | player | ⚠️ partial | P1 |
| **Defense** | forced_fumbles | game | player | ❌ missing | P1 |
| **Defense** | passes_defended | game | player | ❌ missing | P1 |
| **Returns** | attempts | game | player | ❌ missing | P2 |
| **Returns** | yards | game | player | ❌ missing | P2 |

### 2.7 Stage 24-Game-Advanced: Per-Play Advanced

| Field | Level | Entity | Path | Status | Priority |
|-------|-------|--------|------|--------|----------|
| ep_pre | play | team | `$.plays[*].play_advanced.epa.ep_pre` | ✅ ready | P0 |
| ep_post | play | team | `$.plays[*].play_advanced.epa.ep_post` | ✅ ready | P0 |
| epa | play | team | `$.plays[*].play_advanced.epa.epa` | ✅ ready | P0 |
| wp_pre | play | team | `$.plays[*].play_advanced.wp.wp_pre` | ⚠️ partial | P1 |
| wp_post | play | team | `$.plays[*].play_advanced.wp.wp_post` | ⚠️ partial | P1 |
| wpa | play | team | `$.plays[*].play_advanced.wp.wpa` | ⚠️ partial | P1 |
| success | play | team | `$.plays[*].play_advanced.success.epa_based` | ✅ ready | P1 |
| explosive | play | team | `$.plays[*].play_advanced.explosive` | ⚠️ partial | P1 |
| havoc | play | team | `$.plays[*].play_advanced.havoc` | ⚠️ partial | P2 |
| xto_probability | play | team | `$.plays[*].play_advanced.xto.expected_turnover_probability` | ⚠️ partial | P2 |

### 2.8 Stage 24-Game-Advanced: Game-Level Advanced

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| team_epa_per_play | game | team | Sum EPA / plays | 🚧 derive | P0 |
| team_success_rate | game | team | Successful plays / plays | 🚧 derive | P1 |
| team_explosive_rate | game | team | Explosive plays / plays | 🚧 derive | P1 |
| team_havoc_rate | game | team | Havoc plays / defensive plays | 🚧 derive | P2 |
| team_epa_pass | game | team | EPA on pass plays / pass plays | 🚧 derive | P1 |
| team_epa_rush | game | team | EPA on rush plays / rush plays | 🚧 derive | P1 |
| team_wpa_total | game | team | Sum WPA | 🚧 derive | P2 |

---

## 3) Pipeline C: Analytics & Identity Modeling (Planned)

**Status**: 🔜 Planned - Depends on Pipeline B completion

### 3.1 Production Score & PAR (Tier 5)

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| production_score | season | player | Position-weighted linear model | ❌ missing | P1 |
| par | season | player | Production - position median | ❌ missing | P1 |
| percentile_rank | season | player | Rank within position | ❌ missing | P1 |
| par_conference_rank | season | player | Rank within conference position | ❌ missing | P2 |

### 3.2 Position-Specific Production Formulas

**QB Production Score**:
- Passing: TDs (3.00), Attempts (0.12), Completions (0.21), Yards (0.03), INTs (-5.46)
- Rushing: TDs (3.00), Attempts (0.09), Yards (0.03)

**RB Production Score**:
- Rushing: TDs (3.00), Attempts (0.09), Yards (0.03), Fumbles (-8.85)
- Receiving: TDs (3.00), Receptions (0.21), Yards (0.03)

**WR/TE Production Score**:
- Receiving: TDs (3.00), Receptions (0.21), Yards (0.03)

---

## 4) Pipeline D: Prediction & Projection (Future)

**Status**: 🔮 Future - After Pipelines A-C stabilized

### 4.1 Win Probability & Game State

| Metric | Level | Entity | Inputs | Status | Priority |
|--------|-------|--------|--------|--------|----------|
| pre_game_win_prob | game | team | Model + team ratings | ❌ missing | P2 |
| live_win_probability | play | team | Score + time + possession | ⚠️ partial | P2 |
| win_probability_added | play | team | WP change from play | ⚠️ partial | P2 |
| expected_score | game | team | EP model projection | ❌ missing | P2 |
| scoring_margin_prediction | game | team | Model projection | ❌ missing | P3 |

### 4.2 Season Projections

| Metric | Level | Entity | Inputs | Status | Priority |
|--------|-------|--------|--------|--------|----------|
| projected_wins | season | team | Schedule + ratings | ❌ missing | P3 |
| playoff_probability | season | team | Record + remaining schedule | ❌ missing | P3 |
| conference_title_prob | season | team | Standings + projections | ❌ missing | P3 |
| player_breakout_probability | season | player | Trajectory + role | ❌ missing | P3 |

---

## 5) Drive-Based Metrics (Tier 3-4)

### 5.1 Basic Drive Metrics (Tier 3)

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| points_per_drive | game | team | points / drives | 🚧 derive | P1 |
| available_yards_pct | game | team | yards / available yards | ❌ missing | P1 |
| drive_success_rate | game | team | scoring or flip field / drives | ❌ missing | P1 |
| quality_drive_pct | game | team | first down inside opp 40 / drives | ❌ missing | P1 |
| short_field_rate | game | team | drives starting >50 / drives | ❌ missing | P1 |
| field_position_delta_avg | game | team | mean(end - start) | 🚧 derive | P1 |
| three_and_out_rate | game | team | 3&outs / drives | ❌ missing | P1 |
| sustained_drive_rate | game | team | 8+ play drives / drives | 🚧 derive | P1 |

### 5.2 Advanced Drive Analytics (Tier 4)

| Metric | Level | Entity | Definition | Status | Priority |
|--------|-------|--------|------------|--------|----------|
| drive_volatility | game | team | State swings snap-to-snap | ❌ missing | P2 |
| drive_fragility | game | team | Vulnerability to failure | ❌ missing | P2 |
| drive_cleanliness_rating | game | team | Penalty/turnover-free execution | ❌ missing | P2 |
| coach_bailout_index | game | team | Dependency on opponent penalties | ❌ missing | P2 |
| penalty_dependency_ratio | game | team | Drive-extending penalties | ❌ missing | P2 |
| missed_opportunity_drive_score | game | team | High-value outcomes lost | ❌ missing | P2 |
| drive_entropy | game | team | Predictability of play sequence | ❌ missing | P2 |
| possession_fragility | game | team | Turnover danger | ❌ missing | P2 |

---

## 6) Coach Decision Metrics

### 6.1 Fourth Down Decision Making

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| fourth_down_attempts | game | coach | Count 4th down go-for-it | 🚧 derive | P1 |
| fourth_down_conversions | game | coach | Count successful 4th downs | 🚧 derive | P1 |
| fourth_down_rate | game | coach | attempts / 4th downs faced | 🚧 derive | P1 |
| fourth_down_success_rate | game | coach | conversions / attempts | 🚧 derive | P1 |
| situational_aggression | game | coach | Go rate by field position | 🚧 derive | P2 |

### 6.2 Timeout & Clock Management

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| timeouts_used | game | coach | Count timeouts called | ❌ missing | P2 |
| timeout_efficiency | game | coach | Points saved per timeout | ❌ missing | P2 |
| end_of_half_management | game | coach | Points before halftime | 🚧 derive | P2 |
| delay_of_game_penalties | game | coach | Count pre-snap penalties | 🚧 derive | P2 |

### 6.3 Risk-Taking & Aggression

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| two_point_attempts | game | coach | Count 2PT attempts | 🚧 derive | P2 |
| two_point_success_rate | game | coach | 2PT made / attempts | 🚧 derive | P2 |
| fake_punt_rate | game | coach | Fake punts / punt situations | ❌ missing | P3 |
| trick_play_rate | game | coach | Trick plays / total plays | ❌ missing | P3 |
| deep_shot_rate | game | coach | 20+ yard passes / passes | 🚧 derive | P2 |

### 6.4 Red Zone & Situational

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| red_zone_pass_rate | game | coach | Pass plays in RZ / RZ plays | 🚧 derive | P1 |
| red_zone_rush_rate | game | coach | Rush plays in RZ / RZ plays | 🚧 derive | P1 |
| red_zone_td_rate | game | coach | TDs / RZ trips | 🚧 derive | P1 |
| goal_to_go_run_rate | game | coach | Runs inside 5 / plays inside 5 | 🚧 derive | P2 |
| halftime_adjustment | game | coach | 2nd half EPA - 1st half EPA | 🚧 derive | P2 |

---

## 7) Defensive Metrics

### 7.1 Team Defense (Drive-Level)

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| defensive_stop_rate | game | defense | No score drives / opp drives | 🚧 derive | P1 |
| points_allowed_per_drive | game | defense | Points allowed / opp drives | 🚧 derive | P1 |
| yards_allowed_per_drive | game | defense | Yards allowed / opp drives | 🚧 derive | P1 |
| plays_allowed_per_drive | game | defense | Plays allowed / opp drives | 🚧 derive | P1 |
| three_and_out_forced_rate | game | defense | 3&outs forced / opp drives | 🚧 derive | P1 |

### 7.2 Disruption Metrics

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| havoc_rate | game | defense | (TFL + sacks + PBU + FF + INT) / plays | 🚧 derive | P2 |
| tfl_rate | game | defense | TFLs / defensive plays | ⚠️ partial | P2 |
| sack_rate | game | defense | Sacks / pass attempts faced | 🚧 derive | P1 |
| pressure_rate | game | defense | Pressures / dropbacks | ❌ missing | P2 |
| pass_breakup_rate | game | defense | PBUs / pass attempts | ❌ missing | P2 |

### 7.3 Situational Defense

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| third_down_stop_rate | game | defense | Stops on 3rd / 3rd downs faced | 🚧 derive | P1 |
| fourth_down_stop_rate | game | defense | Stops on 4th / 4th downs faced | 🚧 derive | P1 |
| red_zone_stop_rate | game | defense | No TD in RZ / RZ trips allowed | 🚧 derive | P1 |
| goal_to_go_stop_rate | game | defense | Stops inside 5 / GTG situations | 🚧 derive | P2 |
| two_minute_defense_efficiency | game | defense | EPA allowed final 2 min | 🚧 derive | P2 |

---

## 8) Special Teams Metrics

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| punt_epa | game | team | Sum EPA on punts | 🚧 derive | P2 |
| kickoff_return_epa | game | team | Sum EPA on returns | 🚧 derive | P2 |
| fg_epa | game | team | EPA on FG attempts | ❌ missing | P2 |
| punt_return_avg | game | team | Return yards / returns | ❌ missing | P2 |
| kickoff_return_avg | game | team | Return yards / returns | ❌ missing | P2 |
| net_punting | game | team | Gross - return yards | ❌ missing | P2 |
| hidden_yards | game | team | ST field position advantage | ❌ missing | P2 |

---

## 9) Fun Engagement Metrics

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| chaos_score | game | team | Composite of swings, turnovers, trick plays | ❌ missing | P1 |
| spice_rating | game | team | 0-100 rating (explosives + tempo + penalties + TOs) | ❌ missing | P1 |
| spice_level | game | team | mild/medium/hot/fire categories | ❌ missing | P1 |

### Chaos Score Formula
```
Chaos = (explosive_plays_20+ * 2) + 
        (turnovers * 3) + 
        (trick_plays * 5) + 
        (backward_passes * 2) + 
        (special_teams_tds * 4) + 
        (penalties_on_scores * 1)
Normalized per 100 plays
```

### Spice Rating Formula
```
Spice = (explosive_rate * 30) + 
        (tempo_plays_per_min * 10) + 
        (penalty_yards_per_play * 15) + 
        (turnover_rate * 25) + 
        (big_play_rate_30+ * 20)
Capped at 100
```

---

## 10) Official/Referee Metrics (Game-Level)

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| penalties_per_game | game | official | Total penalties called | 🚧 derive | P2 |
| penalty_yards_per_game | game | official | Sum enforced yards | 🚧 derive | P2 |
| penalty_type_distribution | game | official | By holding/PI/false start/etc | ❌ missing | P2 |
| live_ball_penalty_rate | game | official | Live / total penalties | ❌ missing | P2 |
| offense_vs_defense_skew | game | official | Off penalties / def penalties | 🚧 derive | P2 |
| third_down_penalty_rate | game | official | 3rd down penalties / total | 🚧 derive | P2 |
| red_zone_penalty_rate | game | official | RZ penalties / total | 🚧 derive | P2 |
| drive_extending_penalty_rate | game | official | Auto-first penalties / total | ❌ missing | P2 |

---

## 11) Advanced Box Score Metrics

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| iso_ppp | game | team | Explosiveness on successful plays | ❌ missing | P2 |
| line_yards | game | team | Weighted rush yard formula | ❌ missing | P2 |
| highlight_yards | game | team | Rush yards - line yards | ❌ missing | P2 |
| opportunity_rate | game | team | Runs >= 4 yards / runs | 🚧 derive | P1 |
| stuff_rate | game | team | Runs <= 0 / runs | 🚧 derive | P1 |
| success_rate_standard_down | game | team | Success / standard downs | ❌ missing | P1 |
| success_rate_passing_down | game | team | Success / passing downs | ❌ missing | P1 |

---

## 12) Cross-Game Aggregation (Season/Conference)

### 12.1 Season-Level Team

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| season_epa_per_play | season | team | Mean EPA/play across games | ❌ missing | P1 |
| season_success_rate | season | team | Mean success rate | ❌ missing | P1 |
| season_points_per_drive | season | team | Mean PPD | ❌ missing | P1 |
| season_win_loss | season | team | W-L record | ❌ missing | P0 |
| season_conference_record | season | team | Conference W-L | ❌ missing | P0 |
| season_offensive_rating | season | team | Composite offensive score | ❌ missing | P2 |
| season_defensive_rating | season | team | Composite defensive score | ❌ missing | P2 |

### 12.2 Conference Rankings

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| conference_rank_epa | conference | team | Rank by EPA/play | ❌ missing | P2 |
| conference_rank_ppd | conference | team | Rank by PPD | ❌ missing | P2 |
| conference_rank_defense | conference | team | Rank by defensive EPA | ❌ missing | P2 |
| conference_par_leaders | conference | player | Top PAR by position | ❌ missing | P2 |

---

## 13) Player Development Metrics

| Metric | Level | Entity | Formula | Status | Priority |
|--------|-------|--------|---------|--------|----------|
| year_over_year_epa_growth | season | player | (Current - Previous) / Previous | ❌ missing | P2 |
| player_improvement_rate | season | player | % of players improving | ❌ missing | P2 |
| breakout_rate | season | player | % with >40% improvement | ❌ missing | P2 |
| sophomore_jump_rate | season | player | SO improvement over FR | ❌ missing | P2 |

---

## Summary: Implementation Coverage

### By Pipeline

| Pipeline | Total Metrics | ✅ Ready | 🚧 Derive | ⚠️ Partial | ❌ Missing |
|----------|---------------|----------|-----------|------------|------------|
| A - Entity Identity | 35 | 31 | 2 | 2 | 0 |
| B - Game Parsing | 120 | 65 | 25 | 15 | 15 |
| C - Analytics/PAR | 4 | 0 | 0 | 0 | 4 |
| D - Prediction | 10 | 0 | 0 | 2 | 8 |

### By Priority

| Priority | Total | ✅ Ready | 🚧 Derive | ⚠️ Partial | ❌ Missing |
|----------|-------|----------|-----------|------------|------------|
| P0 - Core | 45 | 35 | 8 | 2 | 0 |
| P1 - Website | 75 | 30 | 15 | 10 | 20 |
| P2 - Advanced | 60 | 15 | 5 | 10 | 30 |
| P3 - Future | 25 | 5 | 0 | 5 | 15 |

### Next 5 Metrics to Implement

1. **scoring_event** (play) - P0 - Enable points calculation
2. **fourth_down_rate** (coach) - P1 - Key differentiator metric
3. **chaos_score** (game) - P1 - Fan engagement
4. **spice_rating** (game) - P1 - Brand differentiation
5. **red_zone_success_rate** (team) - P1 - Situational analysis

---

*Last Updated: March 2026*
*Based on: AgentReadme.md, CurrentPipelineCodeMap.md, 23-Aggregation contract, Legacy inventory*
