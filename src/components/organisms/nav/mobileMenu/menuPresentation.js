// Existing mobile-menu identities and face labels. This local analytics face
// mapping is distinct from the canonical sidebar tab configuration.
import teamsData from "../../../../data/teams.json";

export const Z_BACKDROP = 1400;

export const Z_CONTENT = 1401;

export const BRAND = "#A855F7";

export const INFO = "#A1A1AA";

export const TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

export const v5 = (t) => String(t.exportId).replace(/25$/, "");

export const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [v5(t), t]));

export const itemOf = (payload, key) => payload?.items?.find((i) => i.key === key) ?? null;

export const abbr = (t) => t?.bannerShort ?? t?.shortName ?? "";

export const colorOf = (t) => t?.colors?.primary ?? "#27272A";

export const ANALYTICS_TABS = [
  { id: "week", label: "Week Review", key: "biggest_mover" },
  { id: "profile", label: "Team Profile", key: "one_of_a_kind" },
  { id: "board", label: "Leader Board", key: "metric_of_week" },
  { id: "map", label: "Scatter", key: "league_map" },
  { id: "matchup", label: "Matchup", key: "statistical_twins" },
  { id: "lab", label: "Rating Lab", key: "adjusted_leader" },
  { id: "trends", label: "Trends", key: "parity_meter" },
  { id: "glossary", label: "Glossary", key: null },
];

export const matchupLabel = (g) => `${g?.away?.label ?? g?.away?.shortName ?? ""} · ${g?.home?.label ?? g?.home?.shortName ?? ""}`;
