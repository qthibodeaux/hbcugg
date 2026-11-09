import { getTeamDisplayName } from "../gameBoxScore/teamIdentity";

// Extracted from the live production panel; existing semantics are preserved.

// ─────────────────────────────────────────────────────────────────────────────
// Rushing Production — the rushing counterpart to PassingProductionClean, on the
// same column grammar as Bill Connelly's advanced box score: Rushes-Yds, Yds/Carry,
// LY/Carry, Succ Rt, Opp Rate, Hlt/Opp, Stuff Rt.
//
// Structure:
//   1. Eyebrow — team-colour dot + the school's short name
//   2. Team aggregate table (Total / Standard Downs / Passing Downs)
//   3. Individual rusher table
//   4. Player spotlight + gap chart, reacting to whichever rusher is active
// ─────────────────────────────────────────────────────────────────────────────
const DIRS = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LANES — straight off each rusher's `direction_breakdown`
// ═══════════════════════════════════════════════════════════════════════════════
// The backend ships, per rusher and per lane (left / middle / right, as the crew
// writes it), the carries, the yards and the success rate. That is what the three
// columns draw — nothing more. Which carries went which way is not in the file,
// so no per-carry split (line vs highlight) is built here; the earlier version
// partitioned the play-by-play gains to fake one.
// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// Real, straight off the export:
//   • per rusher — attempts, yards, touchdowns, fumbles, yards_per_carry and the rate
//     fields, plus `direction_breakdown`: {left, middle, right} × {attempts, yards,
//     success_rate}, which the lane chart draws as is
//   • per team  — `rushing_splits[team].total`, Connelly's six rushing columns
export const buildRushingData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const teamBox = game?.team_box?.[teamId] ?? {};
  const adv = game?.advanced_team?.[teamId] ?? {};
  const rushOff = game?.offensive_advanced_metrics?.[teamId]?.rush_offense ?? {};

  const rows = (stats.rushing ?? []).filter((r) => r.name !== "TEAM");

  const rushers = rows.map((r) => {
    const attempts = r.attempts ?? 0;
    const yards = r.yards ?? 0;
    const dir = r.direction_breakdown ?? {};

    const hasLanes = DIRS.some((d) => dir?.[d.key]);
    const lanes = hasLanes
      ? DIRS.map((d) => ({
          key: d.key,
          label: d.label,
          att: dir?.[d.key]?.attempts ?? 0,
          yards: dir?.[d.key]?.yards ?? 0,
          successRate: dir?.[d.key]?.success_rate ?? null,
          // Shipped 2026-10-18: line + highlight = the lane's yards; stuffed =
          // carries for zero or less. Null until a game file carries them.
          line: dir?.[d.key]?.line_yards ?? null,
          highlight: dir?.[d.key]?.highlight_yards ?? null,
          stuffed: dir?.[d.key]?.stuffed ?? null,
        }))
      : null;

    return {
      key: r.player_key,
      name: r.name,
      attempts,
      yards,
      touchdowns: r.touchdowns ?? 0,
      fumbles: r.fumbles ?? 0,
      ypc: r.yards_per_carry ?? (attempts > 0 ? yards / attempts : 0),
      // Straight field reads off the rushing row (all shipped on 2026).
      successRate: r.success_rate ?? null,
      lineYards: r.line_yards_per_carry ?? null,
      oppRate: r.opportunity_rate ?? null,
      highlight: r.highlight_yards_per_opportunity ?? null,
      stuffRate: r.stuff_rate ?? null,
      epaTotal: r.epa_total ?? null,
      // Backend-provided, none of it shipping yet on any season — checked across
      // 8,172 rushing rows, 2019-2026. Power and stop rates divide two shipped
      // fields when they arrive; nothing here is counted off the raw plays.
      powerSuccesses: r.power_successes ?? null,
      powerAttempts: r.power_attempts ?? null,
      explosive10: r.explosive_carries_10 ?? null,
      explosive20: r.explosive_carries_20 ?? null,
      epaPerCarry: r.epa_per_play ?? null,
      stoppedCarries: r.stopped_carries ?? null,
      lanes,
    };
  });

  // Team line straight off `rushing_splits[team].total` — Connelly's six rushing
  // columns are all fields on it. Highlight yards ship per RUSH here (his sheet
  // prints them per opportunity), so the column is labelled Hlt/Rush.
  const tot = game.rushing_splits?.[teamId]?.total ?? game.rushing_splits?.[`${teamId}25`]?.total ?? null;
  const line = tot ? {
    ypc: tot.yards_per_carry ?? null,
    lineYards: tot.line_yards_per_rush ?? null,
    successRate: tot.success_rate ?? null,
    oppRate: tot.opportunity_rate ?? null,
    highlight: tot.highlight_yards_per_rush ?? null,
    stuffRate: tot.stuff_rate ?? null,
  } : null;

  return {
    meta: {
      shortName: getTeamDisplayName(teamId),
      displayName: getTeamDisplayName(teamId),
    },
    team: {
      attempts: teamBox.rush_attempts ?? 0,
      yards: teamBox.rush_yards ?? 0,
      touchdowns: teamBox.rush_touchdowns ?? 0,
      ypc: teamBox.yards_per_carry ?? 0,
      lineYards: adv.line_yards_per_rush ?? null,
      highlight: adv.highlight_yards_per_rush ?? null,
      oppRate: adv.rush_opportunity_rate ?? null,
      stuffRate: adv.stuff_rate ?? null,
      successByDown: rushOff.run_success_rate_by_down ?? null,
    },
    line,
    rushers,
  };
};
