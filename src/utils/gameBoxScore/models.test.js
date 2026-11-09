import teamsData from "../../data/teams.json";
import { buildPassingData } from "./passingModel";
import { buildRushingData } from "./rushingModel";
import { buildDefenseData } from "./defenseModel";
import { getTeamColor, getTeamDisplayName, getTeamName } from "./teamIdentity";

// Small contract fixtures, not production display data.
const [team, opponent] = teamsData.teams;
const teamId = team.exportId.replace(/25$/, "");
const opponentId = opponent.exportId.replace(/25$/, "");
const gameWith = (stats, plays = []) => ({
  metadata: { away_team: teamId, home_team: opponentId },
  individual_stats: { [teamId]: stats, [opponentId]: {} },
  play_by_play: plays,
});

test("team identity accepts route, export and v5 IDs", () => {
  for (const item of teamsData.teams) {
    for (const id of [item.id, item.exportId, item.exportId.replace(/25$/, "")]) {
      expect(getTeamColor(id)).toBe(item.colors.primary);
      expect(getTeamName(id)).toBe(item.shortName);
      expect(getTeamDisplayName(id)).toBe(item.displayName ?? item.name ?? item.shortName);
    }
  }
});

test("missing team data stays unavailable in all three models", () => {
  for (const build of [buildPassingData, buildRushingData, buildDefenseData]) {
    expect(build({}, teamId)).toBeNull();
    expect(build(null, teamId)).toBeNull();
  }
});

test("passing totals honor the TEAM row without treating it as a player", () => {
  const result = buildPassingData(gameWith({ passing: [
    { name: "QB", player_key: "qb", attempts: 2, completions: 1, yards: 12 },
    { name: "TEAM", attempts: 3, completions: 2, yards: 20, sacks_taken: 1, sack_yards_lost: 5 },
  ] }), teamId);
  expect(result.passers).toHaveLength(1);
  expect(result.passing).toMatchObject({ attempts: 3, completions: 2, yards: 20, sacks: 1, sackYards: 5 });
});

test("object-shaped rows normalize names/keys and preserve sack-adjusted versus raw YPA", () => {
  const result = buildPassingData(gameWith({ passing: {
    qb: { name_raw: "QB", player_id: "qb", attempts: 4, completions: 2, yards: 24, sacks_taken: 2, sack_yards_lost: 6 },
  } }), teamId);
  expect(result.passers[0]).toMatchObject({ name: "QB", key: "qb", ydsPerAtt: 3, ypa: 6 });
  expect(result.passing).toMatchObject({ attempts: 4, yards: 24, sacks: 2 });
});

test("down splits count sacks and interceptions independently of completions", () => {
  const result = buildPassingData(gameWith({ passing: [] }, [
    { offense_team: teamId, play_type: "SACK", down: 2, distance: 7, actions: [{ type: "SACK", net_yards: -5 }] },
    { offense_team: teamId, play_type: "PASS", down: 3, distance: 9, actions: [{ type: "PASS", isComplete: false }, { type: "INTERCEPTION" }] },
    { offense_team: opponentId, play_type: "SACK", actions: [{ type: "SACK", net_yards: -20 }] },
  ]), teamId);
  expect(result.downSplit.standard).toMatchObject({ sacks: 1, sackYards: 5, att: 0 });
  expect(result.downSplit.passing).toMatchObject({ att: 1, comp: 0, int: 1, sacks: 0 });
});

test("receiving metrics distinguish missing values from explicit zero", () => {
  const result = buildPassingData(gameWith({ receiving: [
    { name: "Missing" },
    { name: "Zero", success_rate: 0, epa_total: 0, yards_after_catch: 0 },
  ] }), teamId);
  expect(result.receivers[0]).toMatchObject({ successRate: null, epaTotal: null, yardsAfterCatch: null });
  expect(result.receivers[1]).toMatchObject({ successRate: 0, epaTotal: 0, yardsAfterCatch: 0 });
});

test("rushing preserves supplied season contexts and object rusher identities", () => {
  const result = buildRushingData(gameWith({ rushing: [{ name: "Runner", player_key: "rb" }] }, [
    { offense_team: teamId, play_type: "RUSH", actions: [{ type: "RUSH", rusher: { name_raw: "Runner" }, direction: "right", net_yards: 7 }] },
  ]), teamId, null, { rushing: { sample: "offense" } }, { rushing: { sample: "defense" } });
  expect(result.rushers[0].lanes.right).toEqual({ attempts: 1, yards: 7 });
  expect(result.context).toEqual({ offenseSeasonAvg: { sample: "offense" }, defenseSeasonAvg: { sample: "defense" } });
});

test("defense excludes TEAM rows and retains fractional player credits", () => {
  const result = buildDefenseData(gameWith({ defense: [
    { name: "TEAM", tackles: 100, sacks: 100 },
    { name: "Defender", tackles: 3, sacks: 0.5, tfl: 0.5 },
  ] }), teamId);
  expect(result.players).toHaveLength(1);
  expect(result.players[0]).toMatchObject({ tackles: 3, sacks: 0.5, tfl: 0.5 });
  expect(result.totals).toMatchObject({ sacks: 0.5, tfl: 0.5 });
});
