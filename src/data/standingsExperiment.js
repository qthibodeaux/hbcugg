import teamsData from "./teams.json";

// Static standings-lab fixture, retained as supplied by the experiment.
// These records, scores and finish scenarios are not the live standings feed.

export const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const standingsGroups = [
  {
    id: "swac-east",
    label: "SWAC East",
    accent: "#F4811F",
    completedGames: 24,
    remainingGames: 0,
    rows: [
      { id: "swacjsu", conf: "7-1", overall: "10-2", left: 0, streak: "W6", diff: 112, form: "WWWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "swacasu", conf: "7-1", overall: "9-3", left: 0, streak: "W4", diff: 88, form: "WWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "swacfamu", conf: "4-3", overall: "7-5", left: 0, streak: "L1", diff: 41, form: "WWLWL", finish: [0, 0, 100, 0, 0, 0] },
      { id: "swacbcu", conf: "4-4", overall: "6-6", left: 0, streak: "W1", diff: 16, form: "LWLWW", finish: [0, 0, 0, 100, 0, 0] },
      { id: "swacaamu", conf: "3-5", overall: "5-7", left: 0, streak: "L2", diff: -22, form: "WLLWL", finish: [0, 0, 0, 0, 100, 0] },
      { id: "swacmvsu", conf: "1-7", overall: "2-10", left: 0, streak: "L5", diff: -104, form: "LLLLL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
  {
    id: "swac-west",
    label: "SWAC West",
    accent: "#FDB913",
    completedGames: 24,
    remainingGames: 0,
    rows: [
      { id: "swacgsu", conf: "4-3", overall: "7-5", left: 0, streak: "W2", diff: 36, form: "WLWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "swacpvamu", conf: "4-3", overall: "7-5", left: 0, streak: "W3", diff: 44, form: "LWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "swactsu", conf: "3-3", overall: "6-5", left: 0, streak: "W1", diff: 18, form: "LWWLW", finish: [0, 0, 100, 0, 0, 0] },
      { id: "swacsu", conf: "3-4", overall: "5-7", left: 0, streak: "L2", diff: -8, form: "WWLLL", finish: [0, 0, 0, 100, 0, 0] },
      { id: "swacalc", conf: "3-4", overall: "5-7", left: 0, streak: "L1", diff: -12, form: "WLWLL", finish: [0, 0, 0, 0, 100, 0] },
      { id: "swacuapb", conf: "2-5", overall: "4-8", left: 0, streak: "L1", diff: -31, form: "LLWWL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
  {
    id: "meac",
    label: "MEAC",
    accent: "#0077C8",
    completedGames: 15,
    remainingGames: 0,
    rows: [
      { id: "meacscsu", conf: "5-0", overall: "9-3", left: 0, streak: "W5", diff: 73, form: "WWWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "meacdsu", conf: "4-0", overall: "8-4", left: 0, streak: "W4", diff: 64, form: "LWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "meacnccu", conf: "3-2", overall: "7-5", left: 0, streak: "L1", diff: 38, form: "WWWLL", finish: [0, 0, 100, 0, 0, 0] },
      { id: "meachu", conf: "2-3", overall: "5-7", left: 0, streak: "L2", diff: -10, form: "WLWLL", finish: [0, 0, 0, 100, 0, 0] },
      { id: "meacnsu", conf: "1-4", overall: "4-8", left: 0, streak: "W1", diff: -39, form: "LLWLW", finish: [0, 0, 0, 0, 100, 0] },
      { id: "meacmsu", conf: "0-6", overall: "2-10", left: 0, streak: "L6", diff: -126, form: "LLLLL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
];

export const gloryTopSix = [
  { id: "swacjsu", score: 92.4, tag: "Control" },
  { id: "meacscsu", score: 89.6, tag: "Clean Sheet" },
  { id: "swacasu", score: 87.1, tag: "East Heat" },
  { id: "swacpvamu", score: 83.8, tag: "Late Push" },
  { id: "meacdsu", score: 82.5, tag: "Alive" },
  { id: "swacgsu", score: 80.9, tag: "West Edge" },
];

export const featureCards = [
  { label: "Closest Race", value: "SWAC West", sub: "Five teams still carrying paths", accent: "#FDB913" },
  { label: "Best Control", value: "SCSU", sub: "Cleanest MEAC finish profile", accent: "#0077C8" },
  { label: "East Pressure", value: "ASU / JSU", sub: "Split race at the top", accent: "#F4811F" },
  { label: "Live Paths", value: "44", sub: "Open title scenarios tracked", accent: "#F56565" },
];
