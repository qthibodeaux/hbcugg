

// Historical layout-lab season, destinations and card order; separate from live hub configuration.

export const LAB_SEASON = 2025;

export const SIDEBAR_TABS = [
  { id: "hub", label: "HUB", to: "/game-center" },
  { id: "games", label: "Games", to: "/game-center" },
  { id: "week", label: "Week Central", to: `/game-center/week/${LAB_SEASON}/12` },
  { id: "team", label: "Team Schedules", to: `/game-center/team/swacmjsu/${LAB_SEASON}` },
  { id: "season", label: "Conference Slate", to: `/game-center/conferenceslate/${LAB_SEASON}` },
  { id: "standings", label: "Standings", to: `/game-center/standings/${LAB_SEASON}` },
];

export const DASHGRAPH_DEFS = [
  { id: "swac-west-top3", type: "standings", title: "SWAC West Top 3" },
  { id: "swac-east-top3", type: "standings", title: "SWAC East Top 3" },
  { id: "meac-top3", type: "standings", title: "MEAC Top 3" },
  { id: "game-of-week", type: "headline", title: "Game of the Week" },
  { id: "look-ahead", type: "headline", title: "Look Ahead" },
  { id: "upcoming-stretch", type: "stretch", title: "Upcoming Stretch" },
  { id: "team-form", type: "form", title: "Team Form" },
  { id: "home-heroes", type: "split", title: "Home Town Heroes" },
  { id: "road-world", type: "split", title: "Us vs The World" },
];
