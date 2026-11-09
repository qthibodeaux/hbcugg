import teamsData from "../../../../data/teams.json";

// Box-score packet team identity and source formatting helpers.

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? {};

export const getTeamLabel = (id) => getTeam(id).shortName ?? String(id ?? "TEAM").toUpperCase();

export const getTeamName = (id) => getTeam(id).name ?? getTeamLabel(id);

export const getTeamLogo = (id) => getTeam(id).logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;

export const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id).colors?.primary ?? fallback;

export const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((part) => part.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : String(name);
};

export const fmt = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

export const pct = (made, attempts) => {
  const a = Number(attempts) || 0;
  if (!a) return "-";
  return `${Math.round((Number(made) / a) * 100)}%`;
};

export const toRows = (obj) => Object.values(obj ?? {});
