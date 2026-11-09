import { GAME_CENTER_DEFAULT_SEASON } from "../../../components/molecules/game/SeasonSelector";
import teamsData from "../../../data/teams.json";

// Standings group/team identity, defaults and existing power-metric metadata.

export const DEFAULT_SEASON = GAME_CENTER_DEFAULT_SEASON;

export const ACCENT = {
  "swac-east": "#F4811F",
  "swac-west": "#FDB913",
  meac: "#0077C8",
};

export const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

export const GROUP_DEFS = [
  { id: "swac-east", label: "SWAC East", conference: "SWAC", division: "East" },
  { id: "swac-west", label: "SWAC West", conference: "SWAC", division: "West" },
  { id: "meac", label: "MEAC", conference: "MEAC", division: null },
];

export const SWAC_EAST = new Set(["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"]);

export const SWAC_WEST = new Set(["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"]);

export const logo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;

export const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

export const recordText = (wins, losses) => `${wins}-${losses}`;

export const POWER_METRIC = {
  key: "diff",
  label: "By Point Diff",
  format: (value) => `${value > 0 ? "+" : ""}${Math.round(value)}`,
};
