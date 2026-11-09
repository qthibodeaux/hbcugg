import teamsData from "../data/teams.json";

// Existing player-hub presentation, extracted without changing behavior.

export const PAGE_SIZE = 96;

export const POSITION_GROUPS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "ST"];

export const CLASS_YEARS = ["Fr.", "So.", "Jr.", "Sr.", "Gr."];

export const YEARS = ["2021", "2022", "2023", "2024", "2025"];

export const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    conference: t.conference.toLowerCase(),
    division: t.division,
    colors: t.colors,
    logo: t.logo,
  };
  const v5 = t.exportId.replace(/25$/, "");
  acc[v5] = {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    conference: t.conference.toLowerCase(),
    division: t.division,
    colors: t.colors,
    logo: t.logo,
  };
  return acc;
}, {});

export const TIER_COLORS = {
  FBS: "blue.400",
  FCS: "purple.400",
  JUCO: "orange.400",
  HS: "green.400",
};

export const TIER_ORDER = ["FBS", "FCS", "JUCO", "HS"];

export const TIER_LABELS = {
  FBS: "FBS",
  FCS: "FCS",
  JUCO: "JUCO",
  HS: "High School",
};

export const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "ST"];

export const POSITION_LABELS = {
  QB: "Quarterback",
  RB: "Running Back",
  WR: "Wide Receiver",
  TE: "Tight End",
  OL: "Offensive Line",
  DL: "Defensive Line",
  LB: "Linebacker",
  DB: "Defensive Back",
  ST: "Special Teams",
};

export const makePlayerKey = (player) =>
  encodeURIComponent(
    `${player.name_display || player.full_name}__${player.team || player.team_id}`,
  );
