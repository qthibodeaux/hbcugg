import teamsData from "../../../../data/teams.json";

export const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const FALLBACK_AXES = {
  meac: ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"],
  swac_east: ["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"],
  swac_west: ["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"],
};

export const compactLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

export const logo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;

export const fmtDate = (date) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getAxis = (axes, key) => axes?.[key]?.team_ids ?? FALLBACK_AXES[key];

export const getTeamsForView = (conference, swacScope, axes) => {
  if (conference === "MEAC") return getAxis(axes, "meac");
  if (swacScope === "WEST") return getAxis(axes, "swac_west");
  if (swacScope === "EAST") return getAxis(axes, "swac_east");
  return [...getAxis(axes, "swac_east"), ...getAxis(axes, "swac_west")];
};

export const buildLookup = (games) =>
  games.reduce((acc, game) => {
    acc[[game.away, game.home].sort().join("|")] = game;
    return acc;
  }, {});

export const isFinalGame = (game) =>
  game?.status === "final" &&
  Number.isFinite(Number(game.awayScore)) &&
  Number.isFinite(Number(game.homeScore));

export const toMatrixMatchup = (matchup) => {
  const [displayAwayScore, displayHomeScore] = String(matchup.score_display ?? "").split("-").map((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  });
  const away = matchup.away_team_id ?? matchup.team_a_id;
  const home = matchup.home_team_id ?? matchup.team_b_id;
  const awayScore = Number.isFinite(Number(matchup.away_score)) ? Number(matchup.away_score) : displayAwayScore;
  const homeScore = Number.isFinite(Number(matchup.home_score)) ? Number(matchup.home_score) : displayHomeScore;
  const status = matchup.status ?? (matchup.result || matchup.winner_team_id ? "final" : "scheduled");

  return {
    id: matchup.game_path_id ?? `${away}-${home}-${matchup.date}`,
    status,
    date: matchup.date,
    away,
    home,
    awayScore,
    homeScore,
    stem: matchup.game_path_id,
  };
};
