import { buildGamesHubModel } from "./gamesHubModel";

describe("buildGamesHubModel", () => {
  const games = [
    {
      game_id: "g1",
      game_path_id: "W0jsuasu",
      date: "2025-08-23",
      week: 0,
      status: "final",
      home_team: { team_id: "swacjsu", name: "Jackson State", short_name: "JSU", abbreviation: "JSU", colors: { primary: "#002147" } },
      away_team: { team_id: "swacasu", name: "Alabama State", short_name: "ASU", abbreviation: "ASU", colors: { primary: "#000000" } },
      home_score: 21,
      away_score: 17,
      venue: "Jackson, MS",
      kickoff_time: "06:00 PM",
    },
    {
      game_id: "g2",
      game_path_id: "W1dsu_bcu",
      date: "2025-08-29",
      week: 1,
      status: "final",
      home_team: { team_id: "swacbcu", name: "Bethune-Cookman", short_name: "BCU", abbreviation: "BCU", colors: { primary: "#6F2633" } },
      away_team: { team_id: "meacdsu", name: "Delaware State", short_name: "DSU", abbreviation: "DSU", colors: { primary: "#EE3124" } },
      home_score: 24,
      away_score: 27,
      venue: "Daytona Beach, FL",
      kickoff_time: "06:00 PM",
    },
    {
      game_id: "g3",
      game_path_id: "W1jsuasu2",
      date: "2025-08-30",
      week: 1,
      status: "scheduled",
      home_team: { team_id: "swacjsu", name: "Jackson State", short_name: "JSU", abbreviation: "JSU", colors: { primary: "#002147" } },
      away_team: { team_id: "swacasu", name: "Alabama State", short_name: "ASU", abbreviation: "ASU", colors: { primary: "#000000" } },
      home_score: null,
      away_score: null,
      venue: "Montgomery, AL",
      kickoff_time: "07:00 PM",
    },
    {
      game_id: "g4",
      game_path_id: "W2msu_hu",
      date: "2025-09-06",
      week: 2,
      status: "scheduled",
      home_team: { team_id: "meacmsu", name: "Morgan State", short_name: "MSU", abbreviation: "MSU", colors: { primary: "#002D72" } },
      away_team: { team_id: "meachu", name: "Howard", short_name: "HU", abbreviation: "HU", colors: { primary: "#003A63" } },
      home_score: null,
      away_score: null,
      venue: "Baltimore, MD",
      kickoff_time: "06:00 PM",
    },
  ];

  it("sorts the season board chronologically and preserves week grouping", () => {
    const model = buildGamesHubModel({
      seasonData: { games },
      weekFilter: "all",
      teamFilter: "",
      conferenceFilter: "all",
      statusFilter: "all",
    });

    expect(model.filteredGames.map((game) => game.id)).toEqual(["g1", "g2", "g3", "g4"]);
    expect(model.groupedWeeks.map((group) => group.week)).toEqual([0, 1, 2]);
  });

  it("filters by team and upcoming status", () => {
    const model = buildGamesHubModel({
      seasonData: { games },
      weekFilter: "all",
      teamFilter: "swacjsu",
      conferenceFilter: "all",
      statusFilter: "upcoming",
    });

    expect(model.filteredGames.map((game) => game.id)).toEqual(["g3"]);
  });
});
