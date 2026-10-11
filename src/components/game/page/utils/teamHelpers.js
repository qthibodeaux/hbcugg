import teamsData from "../../../../data/teams.json";

export const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const getTeamLabel = (id) => TEAM_META[id]?.shortName ?? id?.toUpperCase() ?? "—";
export const getTeamColor = (id, fallback = "#E53E3E") => TEAM_META[id]?.colors?.primary ?? fallback;
export const getTeamLogoSrc = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;
