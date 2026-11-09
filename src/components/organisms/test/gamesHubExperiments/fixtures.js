import teamsData from "../../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const SEASONS = ["2025", "2024", "2023", "2022", "2021"];

export const WEEKS = ["All", "9", "10", "11", "12"];

export const TEAM_OPTIONS = [
  { id: "", label: "All Teams" },
  { id: "meacdsu", label: "DSU" },
  { id: "meacnccu", label: "NCCU" },
  { id: "swacalc", label: "Alcorn" },
  { id: "swacsu", label: "SU" },
  { id: "swacjsu", label: "JSU" },
];

export const GAMES = [
  {
    id: "W9dunccu",
    week: 9,
    date: "Oct 25",
    label: "Durham road statement",
    away: { ...TEAM_BY_ID.meacdsu, score: 35 },
    home: { ...TEAM_BY_ID.meacnccu, score: 26 },
    note: "DSU turned a conference road trip into the front-page result.",
    linkTo: "/game/W9dunccu",
  },
  {
    id: "W10nsudsu",
    week: 10,
    date: "Oct 30",
    label: "Thursday night pressure",
    away: { ...TEAM_BY_ID.meacnsu, score: 20 },
    home: { ...TEAM_BY_ID.meacdsu, score: 27 },
    note: "A tight MEAC result with the scoreboard doing the storytelling.",
    linkTo: "/game/W10nsudsu",
  },
  {
    id: "W11dsumsu",
    week: 11,
    date: "Nov 7",
    label: "Low-score sweat",
    away: { ...TEAM_BY_ID.meacdsu, score: 14 },
    home: { ...TEAM_BY_ID.meacmsu, score: 12 },
    note: "Two points, four quarters, and a defensive headline.",
    linkTo: "/game/W11dsumsu",
  },
  {
    id: "W11sualc",
    week: 11,
    date: "Nov 8",
    label: "Braves make noise",
    away: { ...TEAM_BY_ID.swacsu, score: 17 },
    home: { ...TEAM_BY_ID.swacalc, score: 35 },
    note: "Alcorn owned the margin and made the card feel loud.",
    linkTo: "/game/W11sualc",
  },
];
