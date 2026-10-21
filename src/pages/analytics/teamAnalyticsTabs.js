// The Team Analytics tab set — one list shared by the page (validation), the
// tile strip (buttons) and the sidebar (sub-items). Order here is the order
// everywhere. Icons stay with the tiles; this is ids and labels only so the
// sidebar hook doesn't have to import a component module.
export const TEAM_ANALYTICS_TABS = [
  { id: "week", label: "Week Review" },
  { id: "profile", label: "Team Profile" },
  { id: "board", label: "Leader Board" },
  { id: "map", label: "Charts" },
  { id: "matchup", label: "Matchup" },
  { id: "lab", label: "Rating Lab" },
  { id: "trends", label: "Trends" },
  { id: "glossary", label: "Glossary" },
];

export const TEAM_ANALYTICS_TAB_IDS = TEAM_ANALYTICS_TABS.map((t) => t.id);

export const DEFAULT_TEAM_ANALYTICS_TAB = "week";

// Tabs that read the URL `team` param. Profile owns a picker and lands with
// no team; Trends falls back to a default so the chart is never empty.
export const TEAM_SCOPED_TABS = new Set(["profile", "trends"]);
