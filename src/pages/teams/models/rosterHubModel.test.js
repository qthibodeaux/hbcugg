import fs from "fs";
import path from "path";
import { buildTeamRosterHubModelFromDoc } from "./rosterHubModel";
import teams from "../../../data/teams.json";

jest.mock("../../../components/molecules/game/SeasonSelector", () => ({
  GAME_CENTER_SEASONS: [2026, 2025, 2024, 2023, 2022, 2021, 2019],
}));

const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/data/93-FE Docs/schools", file), "utf8"));
const team = teams.teams.find((item) => item.id === "texas-southern");
const doc = read("team-roster/2026/swactsu.json");
const hub = read("roster-hub/roster_hub_2026.json");

test.each([2019, 2021, 2022, 2023, 2024, 2025, 2026])("wires all published program roster cards for %s", (year) => {
  const seasonHub = read(`roster-hub/roster_hub_${year}.json`);
  teams.teams.forEach((program) => {
    const id = program.exportId.replace(/25$/, "");
    const file = `team-roster/${year}/${id}.json`;
    if (!fs.existsSync(path.join(process.cwd(), "public/data/93-FE Docs/schools", file))) return;
    const rosterDoc = read(file);
    const model = buildTeamRosterHubModelFromDoc({ team: program, doc: rosterDoc, hub: seasonHub, year });
    expect(model.composition.totalPlayers).toBe(rosterDoc.roster_size);
    expect(model.players).toHaveLength(rosterDoc.players.length);
    expect(model.geographic.stateDistribution).toEqual(seasonHub.teams[id].geographic.state_distribution);
    expect(model.transfers.tierBreakdown).toHaveLength(seasonHub.teams[id].transfers.tier_breakdown.length);
    expect(model.transfers.positionImpact).toHaveLength(seasonHub.teams[id].transfers.position_impact.length);
  });
});

test("Texas Southern receives the missing map and portal sections", () => {
  const model = buildTeamRosterHubModelFromDoc({ team, doc, hub, year: 2026 });
  expect(model.kpis.transferCount).toBe(50);
  expect(model.geographic.stateDistribution).toHaveLength(16);
  expect(model.transfers.tierBreakdown).toHaveLength(6);
  expect(model.transfers.positionImpact.find((row) => row.group === "DL").transfer_rate).toBe(70.6);
});

test("never supplements from another season or team", () => {
  const wrongSeason = buildTeamRosterHubModelFromDoc({ team, doc, hub: { ...hub, year: 2025 }, year: 2026 });
  expect(wrongSeason.geographic.stateDistribution).toEqual([]);
  expect(wrongSeason.kpis.avgDistance).toBeNull();
  const wrongTeam = buildTeamRosterHubModelFromDoc({ team: teams.teams.find((item) => item.id === "jackson-state"), doc, hub, year: 2026 });
  expect(wrongTeam.transfers.tierBreakdown).toEqual([]);
});

test("explicit document data, including empty arrays and zeros, takes precedence", () => {
  const model = buildTeamRosterHubModelFromDoc({ team, doc: { ...doc, geographic: { state_distribution: [], in_state_pct: 0 }, transfers: { tier_breakdown: [], transfer_count: 0 } }, hub, year: 2026 });
  expect(model.geographic.stateDistribution).toEqual([]);
  expect(model.kpis.inStatePct).toBe(0);
  expect(model.transfers.tierBreakdown).toEqual([]);
  expect(model.kpis.transferCount).toBe(0);
});
