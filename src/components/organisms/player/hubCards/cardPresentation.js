import teamsData from "../../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const teamOf = (id) => TEAM_BY_ID[String(id ?? "").replace(/25$/, "")] ?? null;

const luminance = (hex) => {
  const v = String(hex ?? "").replace("#", "");
  if (v.length !== 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

export const accentFor = (teamId) => {
  const team = teamOf(teamId);
  if (luminance(team?.colors?.primary) >= 45) return team.colors.primary;
  if (luminance(team?.colors?.secondary) >= 45) return team.colors.secondary;
  return "#A855F7";
};

export const PANEL_BG = "bg.secondary";

export const hrefFor = (player) => player?.profile_url ?? player?.href ?? "/players";

export const fmt = (v, d = 1) => (Number.isFinite(Number(v)) ? Number(v).toFixed(d) : "—");
