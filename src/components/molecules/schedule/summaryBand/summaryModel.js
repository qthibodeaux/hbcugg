import { GAME_CENTER_SEASONS } from "../../game/SeasonSelector";

// Team schedule season inventory and existing record/scoring summary derivation.

export const SCHEDULE_YEARS = GAME_CENTER_SEASONS;

export const getStats = (games) => {
  const completed = games.filter((game) => game.result);
  const wins = completed.filter((game) => game.result === "W").length;
  const losses = completed.filter((game) => game.result === "L").length;
  const confWins = completed.filter((game) => game.conf_game && game.result === "W").length;
  const confLosses = completed.filter((game) => game.conf_game && game.result === "L").length;
  const homeWins = completed.filter((game) => game.home_away === "home" && game.result === "W").length;
  const homeLosses = completed.filter((game) => game.home_away === "home" && game.result === "L").length;
  const awayWins = completed.filter((game) => game.home_away === "away" && game.result === "W").length;
  const awayLosses = completed.filter((game) => game.home_away === "away" && game.result === "L").length;
  const pointsFor = completed.reduce((sum, game) => sum + Number(game.score_team ?? 0), 0);
  const pointsAgainst = completed.reduce((sum, game) => sum + Number(game.score_opp ?? 0), 0);

  const gamesPlayed = completed.length || 0;
  const avgFor = gamesPlayed ? (pointsFor / gamesPlayed).toFixed(1) : "--";
  const avgAgainst = gamesPlayed ? (pointsAgainst / gamesPlayed).toFixed(1) : "--";

  return {
    completed,
    gamesPlayed,
    wins,
    losses,
    cards: [
      { label: "Overall", value: `${wins}-${losses}` },
      { label: "Conference", value: `${confWins}-${confLosses}` },
      { label: "Home", value: `${homeWins}-${homeLosses}` },
      { label: "Away", value: `${awayWins}-${awayLosses}` },
      { label: "Scoring", value: pointsFor || "--", sub: `${avgFor} PPG` },
      { label: "Allowed", value: pointsAgainst || "--", sub: `${avgAgainst} OPP PPG` },
    ],
  };
};
