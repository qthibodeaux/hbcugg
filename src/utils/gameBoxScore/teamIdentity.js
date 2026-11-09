import teamsData from "../../data/teams.json";

// Team identity for box-score consumers. Keep the legacy ID aliases and fallback colors.

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  acc[team.id] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_BY_ID[id] ?? null;

export const getTeamColor = (id) => getTeam(id)?.colors?.primary ?? "#27272A";

export const getTeamSecondary = (id) => getTeam(id)?.colors?.secondary ?? "#A1A1AA";

export const getTeamAccent = (id) => getTeam(id)?.colors?.accent ?? "#4A90D9";

export const getTeamName = (id) => getTeam(id)?.shortName ?? String(id ?? "TEAM").toUpperCase();

export const getTeamDisplayName = (id) =>
  getTeam(id)?.displayName ?? getTeam(id)?.name ?? getTeamName(id);
