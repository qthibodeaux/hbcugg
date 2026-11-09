import { rowStats } from "./recapModel";
import { tileTeamId, tileTeamInk, axPct, successRateScale } from "./recapPresentation";

test("keeps all supplied defensive stats and supplements recovery touchdowns", () => {
  const player = { person_id: "defender", team_id: "meacmsu", stat_line: [{ label: "TKL", value: 4.5 }] };
  const games = [{ individual_stats: { meacmsu: { defense: [{ player_key: "defender", tackles: 4.5, fumble_recoveries: 1, fumble_return_touchdowns: 1 }] } } }];
  expect(rowStats(player, games)).toEqual([{ label: "TKL", value: 4.5 }, { label: "FR", value: 1 }, { label: "DEF TD", value: 1 }]);
  const full = [{ label: "TKL", value: 1.5 }, { label: "TFL", value: 1 }, { label: "SACKS", value: 1 }, { label: "INT", value: 1 }, { label: "HAVOC", value: 3 }];
  expect(rowStats({ ...player, stat_line: full }, [])).toEqual(full);
});

test("fits one shared success-rate axis tightly to the slate without clipping", () => {
  const scale = successRateScale([0.167, 0.661, 0.573, 0.17, null]);
  expect(scale.min).toBe(0.15);
  expect(scale.max).toBe(0.7);
  expect(axPct(0.167, scale)).toBeLessThan(5);
  expect(axPct(0.661, scale)).toBeGreaterThan(90);
  for (const values of [[0], [1], [0.5, 0.5], []]) {
    const bounds = successRateScale(values);
    expect(bounds.max).toBeGreaterThan(bounds.min);
    expect(Number.isFinite(axPct(values[0] ?? 0.5, bounds))).toBe(true);
  }
});

test("brands game stories with the winner and the lost win chance with the loser", () => {
  const games = [{ game_path_id: "game", away: { team_id: "meacdsu" }, home: { team_id: "meacnsu" }, winner_team_id: "meacdsu" }];
  const item = { kind: "game_result", data: { game_path_id: "game" }, team_ids: ["meacnsu", "meacdsu"] };
  expect(tileTeamId(item, games)).toBe("meacdsu");
  expect(tileTeamId({ ...item, kind: "wp_swing" }, games)).toBe("meacnsu");
  expect(tileTeamId({ kind: "crowd", data: { games: [{ home_team_id: "swacaamu" }] } })).toBe("swacaamu");
});

test("team colors adapt to poster contrast and high success rates remain distinct", () => {
  expect(tileTeamInk("swacaamu", "night")).toBe("#FFFFFF");
  expect(tileTeamInk("swacaamu", "light")).toBe("#660000");
  expect(axPct(0.66)).toBeLessThan(100);
  expect(axPct(0.66)).toBeGreaterThan(axPct(0.60));
});
