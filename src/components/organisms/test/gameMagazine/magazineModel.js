import teamsData from "../../../../data/teams.json";

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const getTeam = (id) => TEAM_META[id] ?? null;

export const getTeamLabel = (id) => getTeam(id)?.shortName ?? id?.toUpperCase() ?? "—";

export const getTeamLogo = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;

export const fmt = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));

export const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);

export const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((s) => s.trim());
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  return name;
};
