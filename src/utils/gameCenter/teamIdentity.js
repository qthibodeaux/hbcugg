import teamsData from "../../data/teams.json";

// Authoritative team identity resolution, collision-safe aliases and existing display fallbacks.

export const normalizeName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/&/g, " and ")
    .replace(/university|college|state\.?/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  acc[team.exportId] = enriched;
  acc[team.exportId.replace(/25$/, "")] = enriched;
  return acc;
}, {});

const nameAliases = (team) => [team.name, team.shortName, team.mascot, `${team.name} ${team.mascot}`].map(normalizeName).filter(Boolean);

const SHARED_NAME_ALIASES = (() => {
  const seen = {};
  teamsData.teams.forEach((team) => new Set(nameAliases(team)).forEach((a) => { seen[a] = (seen[a] ?? 0) + 1; }));
  return new Set(Object.keys(seen).filter((a) => seen[a] > 1));
})();

export const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  nameAliases(team)
    .filter((alias) => !SHARED_NAME_ALIASES.has(alias))
    .forEach((alias) => {
      acc[alias] = enriched;
    });
  return acc;
}, {});

export const getTeamTicker = (team) =>
  String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "TEAM";

const localTeamById = teamsData.teams.reduce((acc, team) => {
  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

export const normalizeTeamId = (value) =>
  String(value?.team_id ?? value?.id ?? value ?? "").replace(/25$/, "");

export const toLocalTeam = (teamLike, fallbackLabel = "TEAM") => {
  const id = normalizeTeamId(teamLike);
  const local = localTeamById[id];
  const colors = teamLike?.colors ?? local?.colors ?? {};
  const label = local?.bannerShort ?? local?.shortName ?? teamLike?.short_name ?? teamLike?.abbreviation ?? fallbackLabel;

  return {
    ...(local ?? {}),
    teamId: id || null,
    id: local?.id ?? id,
    exportId: local?.exportId ?? (id ? `${id}25` : undefined),
    name: local?.name ?? teamLike?.name ?? label,
    shortName: local?.shortName ?? teamLike?.short_name ?? teamLike?.abbreviation ?? label,
    bannerShort: local?.bannerShort,
    label,
    primary: colors.primary ?? local?.colors?.primary ?? "#27272A",
    secondary: colors.secondary ?? local?.colors?.secondary ?? "#A1A1AA",
    colors: {
      primary: colors.primary ?? local?.colors?.primary ?? "#27272A",
      secondary: colors.secondary ?? local?.colors?.secondary ?? "#A1A1AA",
      accent: colors.tertiary ?? local?.colors?.accent,
    },
    logo: local?.logo ?? (id ? `/assets/${id}.svg` : null),
  };
};

export const teamScoreObjectToTeam = (value, fallbackLabel = "TEAM") => ({
  ...toLocalTeam(value, fallbackLabel),
  score: Number(value?.score ?? 0),
});

export const getScoreFromExportTeam = (value, fallback = null) => {
  if (Number.isFinite(Number(value?.score))) return Number(value.score);
  return fallback;
};

export const getTeamLabelForDensity = (team, { compact = false } = {}) => {
  if (!team) return "TEAM";
  if (compact) return team.bannerShort ?? team.shortName ?? team.name ?? "TEAM";
  return team.displayName ?? team.name ?? team.shortName ?? "TEAM";
};
