import teamsData from "../../../../data/teams.json";

// Week Central team identity, raw team-stat adapters and league-context formatting.

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");

export const teamMeta = (id) => TEAM_BY_ID[normalizeTeamKey(id)] ?? null;

export const teamShort = (id, fallback = "TBD") => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? fallback;

export const teamLogo = (id) => teamMeta(id)?.logo ?? (id ? `/assets/${normalizeTeamKey(id)}.svg` : null);

const pctOf = (v) => (v || 0) * 100;

const asPct = (v) => `${v.toFixed(0)}%`;

const signed2 = (v) => (v > 0 ? "+" : "") + v.toFixed(2);

const signed0 = (v) => (v > 0 ? "+" : "") + v.toFixed(0);

const perPlay = (stats) => {
  const plays = stats.plays_offense || 0;
  return plays ? (stats.total_yards || 0) / plays : 0;
};

const leagueContext = (leagueAvg, path, scale = 1) => {
  const entry = leagueAvg?.keys?.[path];
  if (!entry || entry.avg == null) return null;
  return {
    avg: Number(entry.avg) * scale,
    max: entry.max != null ? Number(entry.max) * scale : null,
    min: entry.min != null ? Number(entry.min) * scale : null,
  };
};

export const buildTeamStatRows = (parsedGame, awayId, homeId, leagueAvg = null) => {
  if (!parsedGame) return [];
  const aStats = parsedGame.team_box?.[awayId] ?? {};
  const hStats = parsedGame.team_box?.[homeId] ?? {};
  const aAdv = parsedGame.advanced_team?.[awayId] ?? {};
  const hAdv = parsedGame.advanced_team?.[homeId] ?? {};
  const ctx = (path, scale) => leagueContext(leagueAvg, path, scale);

  return [
    { label: "Total Yards", away: aStats.total_yards || 0, home: hStats.total_yards || 0, format: (v) => v.toLocaleString(), league: ctx("team_box.total_yards") },
    { label: "EPA / Play", away: aAdv.epa_per_play ?? 0, home: hAdv.epa_per_play ?? 0, format: signed2, league: ctx("advanced_team.epa_per_play"), allowNegative: true },
    { label: "Success Rate", away: pctOf(aAdv.success_rate), home: pctOf(hAdv.success_rate), format: asPct, league: ctx("advanced_team.success_rate", 100) },
    { label: "Yards / Play", away: perPlay(aStats), home: perPlay(hStats), format: (v) => v.toFixed(1), league: null },
    { label: "Explosive Rate", away: pctOf(aAdv.explosive_rate_yardage), home: pctOf(hAdv.explosive_rate_yardage), format: asPct, league: ctx("advanced_team.explosive_rate_yardage", 100) },
    { label: "3rd Down Rate", away: pctOf(aStats.third_down_conversion_rate), home: pctOf(hStats.third_down_conversion_rate), format: asPct, league: ctx("team_box.third_down_conversion_rate", 100) },
    { label: "Havoc Rate", away: pctOf(aAdv.havoc_rate_forced), home: pctOf(hAdv.havoc_rate_forced), format: asPct, league: ctx("advanced_team.havoc_rate_forced", 100) },
    { label: "Def Run Stuff", away: pctOf(hAdv.stuff_rate), home: pctOf(aAdv.stuff_rate), format: asPct, league: ctx("advanced_team.stuff_rate", 100) },
    { label: "Spec Teams Yds", away: aAdv.special_teams_hidden_yards ?? 0, home: hAdv.special_teams_hidden_yards ?? 0, format: signed0, league: ctx("advanced_team.special_teams_hidden_yards"), allowNegative: true },
    { label: "Avg Start", away: aStats.avg_start_field_position ?? 0, home: hStats.avg_start_field_position ?? 0, format: (v) => v.toFixed(0), league: ctx("team_box.avg_start_field_position") },
  ];
};
