import teamsData from "../data/teams.json";
import { contrastRatio } from "./teamColor";
import { passDefenseAxis, passDefenseChartColor } from "./passDefensePresentation";
import { passDefenseTeam } from "./passDefenseModel";

test("a 22.1% bar closes at 25%, while retaining the zero baseline", () => {
  const axis = passDefenseAxis([0.08, 0.14, 0.221], { zero: true });
  expect(axis.domain).toEqual([0, 0.25]);
  expect(axis.ticks).toContain(0);
  expect(axis.ticks).toContain(0.25);
});

test("red-zone and signed axes fit the data without clipping values or zero", () => {
  const redZone = passDefenseAxis([0.31, 0.48, 0.61], { zero: true });
  expect(redZone.domain[0]).toBe(0);
  expect(redZone.domain[1]).toBeGreaterThanOrEqual(0.61);
  expect(redZone.domain[1]).toBeLessThan(1);
  expect(passDefenseAxis([0, 0.3, 0.8182], { zero: true }).domain[1]).toBeCloseTo(0.9);
  const epa = passDefenseAxis([-0.2, 0.1], { unit: "epa", zero: true });
  expect(epa.domain[0]).toBeLessThanOrEqual(-0.2);
  expect(epa.domain[1]).toBeGreaterThanOrEqual(0.1);
  expect(epa.ticks).toContain(0);
});

test("zero-only and 100% samples remain valid chart values", () => {
  const zero = passDefenseAxis([0], { zero: true });
  expect(zero.domain[0]).toBe(0);
  expect(zero.domain[1]).toBeGreaterThan(0);
  expect(passDefenseAxis([0.8, 1]).domain[1]).toBe(1);
});

test("all site abbreviations override conflicting backend abbreviations", () => {
  for (const team of teamsData.teams) {
    const id = team.exportId.replace(/25$/, "");
    const identity = passDefenseTeam(id, { teams: [{ team_id: id, abbreviation: "BACKEND", school_name: "Backend name" }] });
    expect(identity.short).toBe(team.shortName);
    expect(identity.logo).toBe(team.logo);
    expect(identity.name).toBe(team.name);
  }
});

test("team hues remain visible on both poster grounds and AAMU does not become white", () => {
  for (const team of teamsData.teams) for (const bg of ["#141416", "#F7F7F9"]) {
    expect(contrastRatio(passDefenseChartColor(team.colors, bg), bg)).toBeGreaterThanOrEqual(3);
  }
  const aamu = teamsData.teams.find((t) => t.exportId === "swacaamu25");
  expect(passDefenseChartColor(aamu.colors, "#F7F7F9")).toBe("#660000");
  const night = passDefenseChartColor(aamu.colors, "#141416");
  expect(night).not.toBe("#ffffff");
  expect(parseInt(night.slice(1, 3), 16)).toBeGreaterThan(parseInt(night.slice(3, 5), 16));
});
