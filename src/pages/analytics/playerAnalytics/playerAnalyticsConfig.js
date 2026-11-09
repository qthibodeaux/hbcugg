import teamsData from "../../../data/teams.json";

// Player Analytics identity/tab configuration and retained, explicitly labelled mock DNA/concept tiles.

export const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const TABS = [
  { id: "player", label: "Player", enabled: true },
  { id: "qb-map", label: "QB Map", enabled: true },
  { id: "rushing", label: "Rushing", enabled: true },
  { id: "team", label: "Team", enabled: false },
  { id: "scatter", label: "Scatter", enabled: false },
  { id: "scout", label: "Scout", enabled: false },
  { id: "compare", label: "Compare", enabled: false },
  { id: "glossary", label: "Glossary", enabled: false },
];

export const DNA_TILES_BY_POSITION = {
  QB: [
    { label: "Completion %", value: "62.4%", fill: 58 },
    { label: "Yards / Attempt", value: "8.1", fill: 71 },
    { label: "TD : INT", value: "2.3", fill: 66 },
    { label: "EPA / Play", value: "+0.14", fill: 74 },
    { label: "Success Rate", value: "47%", fill: 63 },
    { label: "Explosive Rate", value: "12%", fill: 55 },
  ],
  RB: [
    { label: "Yards / Carry", value: "4.6", fill: 60 },
    { label: "Yards After Contact", value: "2.8", fill: 68 },
    { label: "Broken Tackle Rate", value: "18%", fill: 72 },
    { label: "Explosive Rate", value: "9%", fill: 50 },
    { label: "Receiving Yards", value: "214", fill: 45 },
    { label: "Ball Security", value: "1 FUM", fill: 80 },
  ],
  WR: [
    { label: "Yards / Route", value: "1.9", fill: 65 },
    { label: "Contested Catch %", value: "54%", fill: 58 },
    { label: "YAC / Reception", value: "5.2", fill: 62 },
    { label: "Target Share", value: "22%", fill: 70 },
    { label: "Explosive Rate", value: "14%", fill: 67 },
    { label: "Drop Rate", value: "4%", fill: 75 },
  ],
  TE: [
    { label: "Yards / Route", value: "1.4", fill: 55 },
    { label: "Contested Catch %", value: "49%", fill: 52 },
    { label: "Red Zone Targets", value: "9", fill: 64 },
    { label: "YAC / Reception", value: "3.9", fill: 48 },
    { label: "Run Block Grade", value: "B", fill: 60 },
    { label: "Drop Rate", value: "6%", fill: 61 },
  ],
  OL: [
    { label: "Pressures Allowed", value: "6", fill: 58 },
    { label: "Sacks Allowed", value: "1", fill: 70 },
    { label: "Penalty Count", value: "3", fill: 55 },
    { label: "Run Block Win Rate", value: "68%", fill: 63 },
  ],
  DL: [
    { label: "Tackles for Loss", value: "8.5", fill: 66 },
    { label: "Sacks", value: "4.0", fill: 71 },
    { label: "QB Hurries", value: "11", fill: 58 },
    { label: "Havoc Rate", value: "13%", fill: 62 },
    { label: "Run Stuff Rate", value: "22%", fill: 60 },
  ],
  LB: [
    { label: "Total Tackles", value: "62", fill: 69 },
    { label: "Tackles for Loss", value: "6.0", fill: 60 },
    { label: "Sacks", value: "2.5", fill: 55 },
    { label: "Passes Defended", value: "3", fill: 50 },
    { label: "Havoc Rate", value: "10%", fill: 57 },
  ],
  DB: [
    { label: "Passes Defended", value: "9", fill: 68 },
    { label: "Interceptions", value: "3", fill: 74 },
    { label: "Total Tackles", value: "41", fill: 55 },
    { label: "Havoc Rate", value: "8%", fill: 52 },
    { label: "Coverage Grade", value: "B+", fill: 65 },
  ],
  ST: [
    { label: "FG %", value: "81%", fill: 70 },
    { label: "Punt Average", value: "42.3", fill: 60 },
    { label: "Touchbacks", value: "12", fill: 65 },
    { label: "Long FG Made", value: "48 yds", fill: 55 },
  ],
};

export const CONCEPTS_BY_POSITION = {
  QB: ["Accuracy Profile", "Arm / Deep Ball", "Pocket Poise", "Decision Making", "Mobility", "Red Zone"],
  RB: ["Vision", "Contact Balance", "Explosiveness", "Receiving", "Pass Pro", "Ball Security"],
  WR: ["Separation", "Contested Catch", "YAC Profile", "Route Tree", "Red Zone Usage"],
  TE: ["Separation", "Contested Catch", "YAC Profile", "Blocking", "Red Zone Usage"],
  OL: ["Pass Protection", "Run Blocking", "Discipline"],
  DL: ["Pass Rush", "Run Defense", "Havoc Profile"],
  LB: ["Tackling Efficiency", "Pass Rush", "Coverage", "Havoc Profile"],
  DB: ["Coverage Profile", "Tackling Efficiency", "Ball Skills", "Havoc Profile"],
  ST: ["Field Goal Profile", "Punting Profile", "Kickoff Profile"],
};
