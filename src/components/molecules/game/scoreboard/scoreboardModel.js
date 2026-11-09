import teamsData from "../../../../data/teams.json";

// Scoreboard identity, retained default fixture and ticker field reads.

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const getTeam = (id) => TEAM_META[id] ?? null;

export const getTeamLabel = (id) => getTeam(id)?.shortName ?? id?.toUpperCase() ?? "—";

export const getTeamName = (id) => getTeam(id)?.name ?? "";

export const getTeamLogo = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;

export const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id)?.colors?.primary ?? fallback;

export const MOCK_GAME = {
  metadata: {
    game_id: "PVAMUJSU06122025",
    home_team: "swacjsu25",
    away_team: "swacpvamu25",
    away_points: 23,
    home_points: 21,
    date: "12/06/2025",
    site: "Jackson, Mississippi (Veterans Memorial Stadium)",
    attendance: 32187,
    kickoff_time: "01:11 PM",
  },
};

export const buildTickerItems = (game) => {
  const rows = Array.isArray(game?.ticker) ? game.ticker : [];
  return rows
    .filter((row) => row && row.label && row.text)
    .map((row) => [String(row.label).toUpperCase(), String(row.text)]);
};
