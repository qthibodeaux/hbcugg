import teamsData from "../../../../data/teams.json";

// Retained team-stats packet identity, field reads, formatting and existing row definitions.

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const normalizeTeamId = (value) =>
  String(value?.team_id ?? value?.id ?? value?.exportId ?? value ?? "").replace(/25$/, "");

const getTeam = (id) => TEAM_META[normalizeTeamId(id)] ?? {};

export const getTeamLabel = (id) => getTeam(id).shortName ?? String(id ?? "TEAM").toUpperCase();

export const getTeamName = (id) => getTeam(id).name ?? getTeamLabel(id);

export const getTeamLogo = (id) => getTeam(id).logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;

export const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id).colors?.primary ?? fallback;

const valueAt = (obj, path) => path.split(".").reduce((acc, key) => acc?.[key], obj);

const n = (value) => (value == null || Number.isNaN(Number(value)) ? null : Number(value));

const div = (a, b) => (n(b) ? n(a) / n(b) : null);

export const fmt = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

const signed = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const next = Number(value);
  return `${next > 0 ? "+" : ""}${next.toFixed(digits)}`;
};

const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Math.round(Number(value) * 100)}%`;
};

const ratio = (made, attempts) => `${fmt(made, 0)}/${fmt(attempts, 0)}`;

export const gameScore = (game, side, meta) => game?.final_score?.[side] ?? meta?.final_score?.[side] ?? meta?.[`${side}_points`] ?? 0;

export const buildRows = (game) => {
  const teamStats = game.team_stats ?? {};
  const adv = game.game_advanced?.team_advanced ?? {};
  const def = game.defensive_context ?? {};

  const ts = (teamId, key) => teamStats[teamId]?.[key];
  const av = (teamId, path) => valueAt(adv[teamId], path);
  const dc = (teamId, key) => def[teamId]?.[key];

  return {
    overview: [
      { label: "Points", value: (t) => ts(t, "points_scored"), format: (v) => fmt(v, 0) },
      { label: "Total Plays", value: (t) => ts(t, "plays_offense"), format: (v) => fmt(v, 0) },
      { label: "Total Yards", value: (t) => (ts(t, "pass_yards") ?? 0) + (ts(t, "rush_yards") ?? 0), format: (v) => fmt(v, 0) },
      { label: "Yards / Play", value: (t) => div((ts(t, "pass_yards") ?? 0) + (ts(t, "rush_yards") ?? 0), ts(t, "plays_offense")), format: (v) => fmt(v, 2) },
      { label: "EPA / Play", value: (t) => av(t, "plays.epa_per_play"), format: (v) => signed(v, 3) },
      { label: "Success Rate", value: (t) => av(t, "plays.success_rate_down_distance"), format: pct },
      { label: "Explosive Play Rate", value: (t) => av(t, "plays.explosive_rate_yardage"), format: pct },
      { label: "Turnovers", value: (t) => ts(t, "turnovers_committed"), format: (v) => fmt(v, 0), higherIsBetter: false },
    ],
    production: [
      { label: "Offensive EPA", value: (t) => av(t, "plays.epa_streams.offense.epa"), format: (v) => signed(v, 2) },
      { label: "Offensive EPA / Play", value: (t) => av(t, "plays.epa_streams.offense.epa_per_play"), format: (v) => signed(v, 3) },
      { label: "Special Teams EPA", value: (t) => av(t, "plays.epa_streams.special_teams.epa"), format: (v) => signed(v, 2) },
      { label: "Penalty EPA Overlay", value: (t) => av(t, "plays.epa_streams.penalty_overlay.epa"), format: (v) => signed(v, 2) },
      { label: "WPA Total", value: (t) => av(t, "plays.wpa_total"), format: (v) => signed(v, 3) },
      { label: "Positive WPA Play Rate", value: (t) => av(t, "plays.positive_wpa_play_rate"), format: pct },
    ],
    rushing: [
      { label: "Rush Attempts", value: (t) => ts(t, "rush_attempts"), format: (v) => fmt(v, 0) },
      { label: "Rush Yards", value: (t) => ts(t, "rush_yards"), format: (v) => fmt(v, 0) },
      { label: "Yards / Carry", value: (t) => div(ts(t, "rush_yards"), ts(t, "rush_attempts")), format: (v) => fmt(v, 2) },
      { label: "Line Yards / Rush", value: (t) => av(t, "rushing_model.line_yards_per_rush"), format: (v) => fmt(v, 2) },
      { label: "Highlight Yards / Rush", value: (t) => av(t, "rushing_model.highlight_yards_per_rush"), format: (v) => fmt(v, 2) },
      { label: "Opportunity Rate", value: (t) => av(t, "rushing_model.rush_opportunity_rate"), format: pct },
      { label: "Stuff Rate", value: (t) => av(t, "rushing_model.stuff_rate"), format: pct, higherIsBetter: false },
      { label: "Power Success Rate", value: (t) => av(t, "rushing_model.power_success_rate"), format: pct },
    ],
    situational: [
      { label: "3rd Down", value: (t) => ts(t, "third_down_conversion_rate"), format: (v, t) => `${ratio(ts(t, "third_down_conversions"), ts(t, "third_down_attempts"))} (${pct(v)})` },
      { label: "Avg 3rd Down Distance", value: (t) => ts(t, "third_down_avg_distance"), format: (v) => fmt(v, 1), higherIsBetter: false },
      { label: "4th Down Go Rate", value: (t) => ts(t, "fourth_down_go_rate"), format: pct },
      { label: "4th Down Conversion Rate", value: (t) => ts(t, "fourth_down_go_conversion_rate"), format: (v, t) => `${ratio(ts(t, "fourth_down_go_conversions"), ts(t, "fourth_down_goes"))} (${pct(v)})` },
      { label: "Standard Down Success", value: (t) => av(t, "situational.success_rate_standard_down"), format: pct },
      { label: "Passing Down Success", value: (t) => av(t, "situational.success_rate_passing_down"), format: pct },
      { label: "Early Down Success", value: (t) => av(t, "situational.success_rate_early_down"), format: pct },
      { label: "Late Down Success", value: (t) => av(t, "situational.success_rate_late_down"), format: pct },
      { label: "Two-Minute EPA / Play", value: (t) => av(t, "situational.two_minute_epa_per_play"), format: (v) => signed(v, 3) },
    ],
    drives: [
      { label: "Drives", value: (t) => ts(t, "drives_offense"), format: (v) => fmt(v, 0) },
      { label: "Points / Drive", value: (t) => ts(t, "points_per_drive"), format: (v) => fmt(v, 2) },
      { label: "Avg Start Field Position", value: (t) => ts(t, "avg_start_field_position"), format: (v) => fmt(v, 1) },
      { label: "Long Field Drives", value: (t) => ts(t, "long_field_rate"), format: (v, t) => `${fmt(ts(t, "long_field_drives"), 0)} (${pct(v)})`, higherIsBetter: false },
      { label: "Scoring Drives", value: (t) => ts(t, "scoring_drives"), format: (v) => fmt(v, 0) },
      { label: "Quality Drive Rate", value: (t) => av(t, "drives.quality_drive_rate"), format: pct },
      { label: "Explosive Drive Rate", value: (t) => av(t, "drives.explosive_drive_rate"), format: pct },
      { label: "Negative Drive Rate", value: (t) => av(t, "drives.negative_drive_rate"), format: pct, higherIsBetter: false },
    ],
    finishing: [
      { label: "Opportunities Inside 40", value: (t) => av(t, "finishing.opportunities_40"), format: (v) => fmt(v, 0) },
      { label: "Points / Opp Inside 40", value: (t) => av(t, "finishing.points_per_opportunity_40"), format: (v) => fmt(v, 1) },
      { label: "Red Zone Opportunities", value: (t) => av(t, "finishing.red_zone_opportunities"), format: (v) => fmt(v, 0) },
      { label: "Red Zone Points / Opp", value: (t) => av(t, "finishing.red_zone_points_per_opportunity"), format: (v) => fmt(v, 1) },
      { label: "Red Zone TD Rate", value: (t) => av(t, "finishing.red_zone_td_rate"), format: pct },
    ],
    defense: [
      { label: "Plays Faced", value: (t) => dc(t, "plays_faced"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "3rd Down Stops", value: (t) => div(dc(t, "third_down_stops"), dc(t, "third_down_faced")), format: (v, t) => `${ratio(dc(t, "third_down_stops"), dc(t, "third_down_faced"))} (${pct(v)})` },
      { label: "4th Down Stops", value: (t) => div(dc(t, "fourth_down_stops"), dc(t, "fourth_down_faced")), format: (v, t) => `${ratio(dc(t, "fourth_down_stops"), dc(t, "fourth_down_faced"))} (${pct(v)})` },
      { label: "Red Zone Stops", value: (t) => div(dc(t, "red_zone_stops"), dc(t, "red_zone_trips_faced")), format: (v, t) => `${ratio(dc(t, "red_zone_stops"), dc(t, "red_zone_trips_faced"))} (${pct(v)})` },
      { label: "Explosive Plays Allowed 10+", value: (t) => dc(t, "explosive_plays_allowed_10"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Sacks + Hurries", value: (t) => (dc(t, "sacks_made") ?? 0) + (dc(t, "qb_hurries_made") ?? 0), format: (v) => fmt(v, 0) },
      { label: "TFL", value: (t) => dc(t, "tfl_made"), format: (v) => fmt(v, 0) },
      { label: "Passes Defended", value: (t) => dc(t, "passes_defended_made"), format: (v) => fmt(v, 0) },
      { label: "Disruption Rate", value: (t) => av(t, "defensive_identity.disruption_rate"), format: pct },
      { label: "Explosive Prevention", value: (t) => av(t, "defensive_identity.explosive_prevention_rate"), format: pct },
    ],
    turnovers: [
      { label: "Actual Turnovers", value: (t) => av(t, "turnovers.actual_turnovers"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Expected Turnovers", value: (t) => av(t, "turnovers.expected_turnovers"), format: (v) => fmt(v, 2), higherIsBetter: false },
      { label: "Turnover Luck", value: (t) => av(t, "turnovers.turnover_luck"), format: (v) => signed(v, 2) },
      { label: "Turnovers Forced", value: (t) => ts(t, "turnovers_forced"), format: (v) => fmt(v, 0) },
      { label: "Interceptions Made", value: (t) => dc(t, "interceptions_made"), format: (v) => fmt(v, 0) },
      { label: "Forced Fumbles Made", value: (t) => dc(t, "forced_fumbles_made"), format: (v) => fmt(v, 0) },
    ],
    specialTeams: [
      { label: "ST Plays", value: (t) => av(t, "special_teams_model.st_play_count"), format: (v) => fmt(v, 0) },
      { label: "Kickoff Attempts", value: (t) => av(t, "special_teams_model.kickoff_attempts"), format: (v) => fmt(v, 0) },
      { label: "Avg Kickoff Distance", value: (t) => av(t, "special_teams_model.avg_kickoff_distance"), format: (v) => fmt(v, 1) },
      { label: "Punt Attempts", value: (t) => av(t, "special_teams_model.punt_attempts"), format: (v) => fmt(v, 0) },
      { label: "Avg Punt Distance", value: (t) => av(t, "special_teams_model.avg_punt_distance"), format: (v) => fmt(v, 1) },
      { label: "Hidden Yards", value: (t) => av(t, "special_teams_model.hidden_yards"), format: (v) => signed(v, 0) },
      { label: "ST Swing Yards", value: (t) => av(t, "special_teams_model.special_teams_swing_yards"), format: (v) => signed(v, 0) },
    ],
    penalties: [
      { label: "Accepted Penalties", value: (t) => av(t, "penalty_advanced.total_accepted"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Penalty Yards", value: (t) => av(t, "penalty_advanced.total_yards"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Penalty Rate", value: (t) => av(t, "penalty_advanced.penalty_rate"), format: pct, higherIsBetter: false },
      { label: "Pre-Snap Rate", value: (t) => av(t, "penalty_advanced.pre_snap_rate"), format: pct, higherIsBetter: false },
      { label: "High Leverage Penalties", value: (t) => av(t, "penalty_advanced.high_leverage_count"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Drive Kills", value: (t) => av(t, "penalty_advanced.drive_kill_count"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Drive Extends", value: (t) => av(t, "penalty_advanced.drive_extend_count"), format: (v) => fmt(v, 0) },
      { label: "Hidden Yards Lost", value: (t) => av(t, "penalty_advanced.hidden_yardage_lost"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Hidden Yards Gained", value: (t) => av(t, "penalty_advanced.hidden_yardage_gained"), format: (v) => fmt(v, 0) },
    ],
    coaching: [
      { label: "1st Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.1.run_rate"), format: pct },
      { label: "2nd Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.2.run_rate"), format: pct },
      { label: "3rd Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.3.run_rate"), format: pct },
      { label: "Obvious Pass Success", value: (t) => av(t, "coaching_profile.obvious_situation_execution.obvious_pass_success_rate"), format: pct },
      { label: "Obvious Run Success", value: (t) => av(t, "coaching_profile.obvious_situation_execution.obvious_run_success_rate"), format: pct },
      { label: "Red Zone Run Rate", value: (t) => av(t, "coaching_profile.red_zone_tendency.run_rate"), format: pct },
      { label: "Halftime Adjustment", value: (t) => av(t, "coaching_profile.halftime_adjustment.adjustment_delta"), format: (v) => signed(v, 3) },
      { label: "Predictability Index", value: (t) => av(t, "coaching_profile.predictability_index"), format: (v) => fmt(v, 3), higherIsBetter: false },
    ],
  };
};
