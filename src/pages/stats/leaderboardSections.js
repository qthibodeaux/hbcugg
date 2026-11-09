// Leaderboards — which boards make up each selectable section on /stats/player and
// /stats/team. A section is one poster: its boards are the columns. `season` and `week` are
// board ids in stats/leaderboards/{season}/season.json and week_{n}.json. A section with no
// boards in the chosen range doesn't show. `pool` reads the week file's "what stood out" boards.

export const PLAYER_SECTIONS = {
  offense: [
    { id: "yards", label: "Passing · Rushing · Receiving", title: "Offensive Leaders", photos: true, season: ["passing_yards", "rushing_yards", "receiving_yards"], week: ["passing_yards", "rushing_yards", "receiving_yards"] },
    { id: "overall", label: "Total · All-Purpose · Receptions", title: "Overall Leaders", season: ["total_offense", "all_purpose", "receptions"], week: ["total_offense", "all_purpose", "receptions"] },
    { id: "scoring", label: "Points · Touchdowns", title: "Scoring Leaders", season: ["points", "touchdowns"], week: ["touchdowns"] },
    // The "what stood out" boards: one magazine-style poster each, top 3.
    { id: "yac", label: "Yards After Catch", title: "Yards After the Catch", season: [], week: ["yards_after_catch"], pool: true, editorial: true },
    { id: "big", label: "20+ Plays", title: "Plays of 20+ Yards", season: [], week: ["big_plays"], pool: true, editorial: true },
    { id: "conversions", label: "3rd & 4th Conversions", title: "3rd & 4th Down Conversions", season: [], week: ["third_fourth_conversions"], pool: true, editorial: true },
    { id: "winchance", label: "Win Chance", title: "Win Chance Added", season: [], week: ["game_changers"], pool: true, editorial: true },
  ],
  defense: [
    { id: "core", label: "Tackles · Sacks · Interceptions", title: "Defensive Leaders", season: ["tackles", "sacks", "interceptions"], week: ["tackles", "sacks", "interceptions"] },
    { id: "disruption", label: "TFL · Pass Breakups", title: "Disruption Leaders", season: ["tackles_for_loss", "pass_breakups"], week: ["tackles_for_loss", "pass_breakups"] },
  ],
};

export const TEAM_SECTIONS = [
  { id: "offense", label: "Scoring · Yards · Per Play", title: "Team Offense", season: ["points_per_game", "yards_per_game", "yards_per_play"], week: ["points", "yards", "yards_per_play"] },
  { id: "defense", label: "Points · Yards · Per Play Allowed", title: "Team Defense", season: ["points_allowed_per_game", "yards_allowed_per_game", "yards_per_play_allowed"], week: ["points_allowed", "yards_allowed"] },
  { id: "run_pass", label: "Rushing · Passing", title: "Run & Pass Offense", season: ["rush_yards_per_game", "pass_yards_per_game"], week: ["rush_yards", "pass_yards"] },
  { id: "run_pass_d", label: "Rush · Pass Defense", title: "Run & Pass Defense", season: ["rush_yards_allowed_per_game", "pass_yards_allowed_per_game"], week: ["rush_yards_allowed", "pass_yards_allowed"] },
  { id: "third", label: "3rd Down", title: "3rd Down", season: ["third_down_pct", "third_down_pct_allowed"], week: [] },
  { id: "redzone", label: "Red Zone", title: "Red Zone", season: ["red_zone_score_pct", "red_zone_score_pct_allowed"], week: [] },
  { id: "chances", label: "Scoring Chances", title: "Scoring Chances", season: ["points_per_opportunity", "points_per_opportunity_allowed"], week: [] },
  { id: "epa", label: "EPA", title: "EPA Per Play", season: ["epa_per_play", "epa_per_play_allowed"], week: [] },
  { id: "adj_epa", label: "Adjusted EPA", title: "Adjusted EPA", season: ["adj_epa_per_play", "adj_epa_per_play_allowed"], week: [] },
  { id: "success", label: "Success Rate", title: "Success Rate", season: ["success_rate", "success_rate_allowed"], week: [] },
  { id: "explosive", label: "Explosive Plays", title: "Explosive Plays", season: ["explosive_rate", "explosive_rate_allowed"], week: [] },
  { id: "margins", label: "Turnovers · Penalties", title: "Margins", season: ["turnover_margin_per_game", "penalty_yards_per_game"], week: [] },
  { id: "havoc", label: "Havoc · Sacks", title: "Havoc", season: ["havoc_rate", "sack_rate"], week: [] },
];

// Column headings where the file's label is too long for a poster column.
export const BOARD_LABELS = {
  third_down_pct: "3rd Down Offense",
  third_down_pct_allowed: "3rd Down Defense",
  red_zone_score_pct: "Red Zone Offense",
  red_zone_score_pct_allowed: "Red Zone Defense",
  points_per_opportunity: "Points / Chance",
  points_per_opportunity_allowed: "Points / Chance Allowed",
  adj_epa_per_play: "Adj. EPA / Play",
  adj_epa_per_play_allowed: "Adj. EPA / Play Allowed",
  epa_per_play: "EPA / Play",
  epa_per_play_allowed: "EPA / Play Allowed",
  turnover_margin_per_game: "Turnover Margin / Game",
  penalty_yards_per_game: "Penalty Yards / Game",
};

// The team boards carry no unit, so the poster names what each number is.
export const TEAM_UNITS = {
  points_per_game: "PTS/G", points_allowed_per_game: "PTS/G",
  yards_per_game: "YDS/G", yards_allowed_per_game: "YDS/G",
  rush_yards_per_game: "YDS/G", rush_yards_allowed_per_game: "YDS/G",
  pass_yards_per_game: "YDS/G", pass_yards_allowed_per_game: "YDS/G",
  yards_per_play: "YDS/PLAY", yards_per_play_allowed: "YDS/PLAY",
  penalty_yards_per_game: "YDS/G", turnover_margin_per_game: "PER G",
  points_per_opportunity: "PTS", points_per_opportunity_allowed: "PTS",
  points: "PTS", points_allowed: "PTS",
  yards: "YDS", yards_allowed: "YDS", rush_yards: "YDS", rush_yards_allowed: "YDS", pass_yards: "YDS", pass_yards_allowed: "YDS",
};

// How a team board's value prints; the team boards carry no unit. Everything else: one decimal
// on season boards, as sent on week boards.
const PCT = new Set(["third_down_pct", "third_down_pct_allowed", "red_zone_score_pct", "red_zone_score_pct_allowed", "success_rate", "success_rate_allowed", "explosive_rate", "explosive_rate_allowed", "havoc_rate", "sack_rate"]);
const SIGNED_3 = new Set(["epa_per_play", "epa_per_play_allowed", "adj_epa_per_play", "adj_epa_per_play_allowed"]);

export const formatTeamValue = (id, v) => {
  if (v == null) return "—";
  if (PCT.has(id)) return `${(v * 100).toFixed(1)}%`;
  if (SIGNED_3.has(id)) return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(3)}`;
  if (id === "turnover_margin_per_game") return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2)}`;
  return Number.isInteger(v) ? String(v) : Number(v).toFixed(id === "points_per_opportunity" || id === "points_per_opportunity_allowed" ? 2 : 1);
};
