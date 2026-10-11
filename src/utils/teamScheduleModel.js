import teamsData from "../data/teams.json";
import { toLegacyScheduleGame } from "./gameCenterPayloads";

export const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const DEFAULT_TEAM = null;

export const SCHEDULE_FILTERS = [
  { id: "all", label: "All" },
  { id: "hbcu", label: "HBCU Only" },
  { id: "conference", label: "Conference" },
  { id: "division", label: "Division" },
  { id: "championship", label: "Conf Champ" },
  { id: "postseason", label: "Celebration / Playoffs" },
];

export const getTeam = (id) => id ? TEAM_BY_ID[id] : null;

const getSearchText = (game) => [
  game.game_type,
  game.game_name,
  game.event_name,
  game.classic_name,
  game.stage_label,
  game.status_label,
].filter(Boolean).join(" ").toLowerCase();

export const gameMatchesFilter = (game, filter, team) => {
  if (filter === "all") return true;
  const opponent = getTeam(game.opponent_id);
  const text = getSearchText(game);

  if (filter === "hbcu") return !!opponent;
  if (filter === "conference") return !!game.conf_game;
  if (filter === "division") {
    return !!game.conf_game && !!team && !!opponent && team.conference === opponent.conference && team.division === opponent.division;
  }
  if (filter === "championship") {
    return text.includes("championship") || text.includes("champ game") || text.includes("swac champ") || text.includes("meac champ");
  }
  if (filter === "postseason") {
    return !!game.bowl_game || text.includes("celebration") || text.includes("playoff") || text.includes("bowl");
  }

  return true;
};

// Takes one team's payload, already selected. Which request produced it -
// the scoped per-team file or a slice of the wide season file - is the fetch
// layer's business; both shapes carry `games`, so the model never asks.
export const buildTeamScheduleModel = ({ teamEntry, teamId, activeFilter }) => {
  const team = TEAM_BY_ID[teamId] ?? null;
  const seasonGames = (teamEntry?.games ?? [])
    .map(toLegacyScheduleGame)
    .sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
  const filteredGames = seasonGames.filter((game) => gameMatchesFilter(game, activeFilter, team));
  const completed = filteredGames.filter((game) => game.result);
  const upcoming = filteredGames.filter((game) => !game.result);

  return {
    team,
    seasonGames,
    filteredGames,
    completed,
    upcoming,
    scheduleAccent: team?.colors?.secondary ?? "#E53E3E",
  };
};
