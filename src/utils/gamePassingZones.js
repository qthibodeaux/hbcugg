// ═══════════════════════════════════════════════════════════════════════════════
// TARGET MAP — the backend's grid (RESPONSE_BACKEND_2026-10-16_passing_grid)
// ═══════════════════════════════════════════════════════════════════════════════
// Each passer / receiver row in the game file carries `direction_breakdown`:
// depth (air yards to the catch / target / interception spot: short < 4,
// medium 4-12, deep 13+) x lane (left / middle / right, as the crew writes it),
// plus `uncharted` — throws with no depth (a crew that never spots
// incompletions) or no lane (interceptions). Cells + uncharted = every attempt.
// Read straight off the file; nothing is spread or guessed. A row with no
// breakdown (older seasons) shows no grid.
//
// Some crews never spot incompletions (RESPONSE_BACKEND_2026-10-19_call_grid).
// The file says so — `metadata.pass_spotting.incompletion_depth: "unspotted"`
// — and then the grid is `call_breakdown` instead: placed by the crew's own
// call ("pass incomplete short left"), two rows, Short and Deep, no air-yard
// ranges (the crew's "short" runs to ~19 yards).

const DEPTHS = [
  { key: "deep", label: "Deep", range: "> 12" },
  { key: "medium", label: "Med", range: "4 – 12" },
  { key: "short", label: "Short", range: "< 4" },
];
const CALL_DEPTHS = [
  { key: "deep", label: "Deep", range: null },
  { key: "short", label: "Short", range: null },
];
const LANES = ["left", "middle", "right"];
// Above this share of uncharted throws the grid misleads more than it shows.
const HIDE_UNCHARTED_SHARE = 0.2;

export const buildGamePassingZones = (game, teamId, player) => {
  const isPasser = player._type === "passer";
  const rows = game?.individual_stats?.[teamId]?.[isPasser ? "passing" : "receiving"] ?? [];
  const row = rows.find((r) => r.player_key === player.key) ?? rows.find((r) => r.name === player.name);
  const byCall = game?.metadata?.pass_spotting?.incompletion_depth === "unspotted" && !!row?.call_breakdown;
  const bd = byCall ? row.call_breakdown : row?.direction_breakdown;
  if (!bd) return null;
  const depths = byCall ? CALL_DEPTHS : DEPTHS;
  const [attK, compK] = isPasser ? ["attempts", "completions"] : ["targets", "receptions"];
  const cells = depths.flatMap((d) => LANES.map((lane) => {
    const c = bd[d.key]?.[lane] ?? {};
    return { att: Number(c[attK] ?? 0), comp: Number(c[compK] ?? 0), yards: Number(c.yards ?? 0) };
  }));
  const u = bd.uncharted ?? {};
  const uncharted = Number(u.attempts ?? u.targets ?? 0);
  const total = cells.reduce((n, c) => n + c.att, 0) + uncharted;
  return {
    depths,
    cells,
    adot: typeof row.adot === "number" ? row.adot : null,
    uncharted,
    noDepth: Number(u.no_depth ?? 0),
    noLane: Number(u.no_direction ?? 0),
    total,
    hidden: total > 0 && uncharted / total > HIDE_UNCHARTED_SHARE,
  };
};

