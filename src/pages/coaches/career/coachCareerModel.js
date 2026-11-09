import teamsData from "../../../data/teams.json";

// Coach role classification, initials and canonical team-display lookup with retained legacy-ID alias.

export const TEAM_DISPLAY = teamsData.teams.reduce((acc, t) => {
  const v5Id = t.exportId.replace(/25$/, "");
  acc[v5Id] = { name: t.name, shortName: t.shortName };
  return acc;
}, {});

export const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") => /coordinator/i.test(title);

export const roleTier = (title = "") => {
  if (isHeadCoach(title)) return "hc";
  if (isCoordinator(title)) return "coord";
  return "staff";
};

TEAM_DISPLAY["meacnsuc"] = { name: "Norfolk State", shortName: "NSU" };
