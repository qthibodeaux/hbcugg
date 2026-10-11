// Mock generators for the Advanced (Analytics) tab — same convention as
// statsTabMock.js: real field names/shape from the inventory doc, values
// driven off the one real signal we have (par / total_production), not
// randomized. Swap-in point for real data is each function body below, once
// the backend aggregation described in PLAYER_STATS_ADVANCED_INVENTORY
// lands (percentile-vs-position-group, situational-split season sums,
// player-level havoc formula, etc. — all flagged 🚧/❌ there, not ✅).

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const round1 = (v) => Math.round(v * 10) / 10;

const RADAR_AXES = {
  QB: ["Accuracy", "Ball Security", "Explosiveness", "Pressure Response", "Mobility", "Efficiency"],
  SKILL: ["Opportunity", "Explosiveness", "Efficiency", "Reliability", "Big-Play Rate", "Versatility"],
  DEFENSE: ["Havoc", "Tackle Volume", "Pass Rush", "Coverage", "Run Defense", "Discipline"],
  ST: ["Accuracy", "Leg Strength", "Consistency", "Clutch"],
};

const familyFor = (position) => {
  if (position === "QB") return "QB";
  if (["RB", "FB", "WR", "TE"].includes(position)) return "SKILL";
  if (["DL", "LB", "DB"].includes(position)) return "DEFENSE";
  return "ST";
};

// Deterministic per-axis variation (not a flat circle) — real per-axis
// percentiles need the backend aggregation pass; this at least varies
// axis-to-axis off the same signal instead of drawing a perfect polygon.
export const buildPercentileRadar = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const family = familyFor(position);
  const labels = RADAR_AXES[family];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  return labels.map((label, i) => ({
    label,
    percentile: Math.round(clamp(35 + signal * (0.8 + 0.15 * i) + (i % 3) * 4, 8, 99)),
  }));
};

const humanize = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Per-category situational splits, matching the inventory doc's ADVANCED §2
// field list exactly (not a generic 3-bucket summary) — Rushing/Passing/
// Receiving/Defense each have their own real field names. Status per the
// doc: ✅ ready per-game, 🚧 needs season aggregation — so these are mocked
// season totals, not per-game (that's Stats tab's Game Log's job).
const SITUATIONAL_BUILDERS = {
  rushing: (signal) => ({
    red_zone_attempts: Math.round(clamp(3 + signal * 0.08, 1, 12)),
    red_zone_yards: Math.round(clamp(10 + signal * 0.3, 3, 40)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.05, 0, 8)),
    goal_line_attempts: Math.round(clamp(2 + signal * 0.05, 0, 8)),
    goal_line_touchdowns: Math.round(clamp(signal * 0.03, 0, 5)),
  }),
  passing: (signal) => ({
    red_zone_attempts: Math.round(clamp(5 + signal * 0.1, 2, 18)),
    red_zone_completions: Math.round(clamp(3 + signal * 0.08, 1, 14)),
    red_zone_yards: Math.round(clamp(20 + signal * 0.5, 8, 80)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.08, 0, 10)),
    third_down_attempts: Math.round(clamp(9 + signal * 0.15, 3, 28)),
    third_down_completions: Math.round(clamp(5 + signal * 0.1, 2, 18)),
    pressure_attempts: Math.round(clamp(7 + signal * 0.12, 3, 24)),
    pressure_completions: Math.round(clamp(3 + signal * 0.06, 1, 12)),
    pressure_yards: Math.round(clamp(18 + signal * 0.3, 5, 60)),
  }),
  receiving: (signal) => ({
    red_zone_targets: Math.round(clamp(3 + signal * 0.08, 1, 12)),
    red_zone_receptions: Math.round(clamp(2 + signal * 0.06, 0, 9)),
    red_zone_yards: Math.round(clamp(12 + signal * 0.25, 3, 40)),
    red_zone_touchdowns: Math.round(clamp(signal * 0.05, 0, 7)),
    third_down_targets: Math.round(clamp(4 + signal * 0.1, 1, 15)),
    third_down_receptions: Math.round(clamp(3 + signal * 0.07, 1, 10)),
    first_down_receptions: Math.round(clamp(6 + signal * 0.15, 2, 20)),
  }),
  defense: (signal) => ({
    third_down_stops: Math.round(clamp(2 + signal * 0.08, 0, 10)),
    clutch_stops: Math.round(clamp(1 + signal * 0.05, 0, 6)),
    sacks_third_down: round1(clamp(signal * 0.03, 0, 4)),
    tfl_third_down: round1(clamp(signal * 0.04, 0, 5)),
    red_zone_disruptions: Math.round(clamp(signal * 0.05, 0, 6)),
  }),
};

const SITUATIONAL_CATEGORIES = {
  QB: ["passing", "rushing"], RB: ["rushing", "receiving"], FB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"], TE: ["receiving"],
  DL: ["defense"], LB: ["defense"], DB: ["defense"],
};

export const buildSituationalSplits = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const categories = SITUATIONAL_CATEGORIES[position] ?? ["defense"];
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  return categories.map((key) => {
    const stats = SITUATIONAL_BUILDERS[key](signal);
    return {
      key,
      label: humanize(key),
      fields: Object.entries(stats).map(([fieldKey, value]) => ({ key: fieldKey, label: humanize(fieldKey), value })),
    };
  });
};

// ❌ unbuilt in the inventory doc (ADVANCED §3) — blocked on a real join
// (play-participant × enriched.derived situational tags) that doesn't exist
// yet. Shown as a real, labeled preview of the intended shape instead of
// being silently dropped, so the taxonomy stays visible even where the data
// isn't ready.
export const buildCalledUponShare = () => ({
  blocked: true,
  reason: "Needs a play-participant × situational-taxonomy join (money_down, third_and_short/medium/long, standard_down, early_down, is_garbage_time_sp_plus) that doesn't exist yet.",
  buckets: [
    { key: "early_down_standard_distance", label: "Early Down, Standard Distance" },
    { key: "money_down", label: "Money Down" },
  ],
});

// ❌ unbuilt for player level (ADVANCED §4) — the team-level as_of_rating
// exists inside formula1_ridge_panel.py but is discarded after averaging;
// needs per-game exposure + a join to the player's game log by date.
export const buildOpponentAdjusted = (player) => {
  const games = Array.isArray(player?.games) ? player.games : [];
  return {
    blocked: true,
    reason: "Team-level opponent strength (as_of_rating) is computed but discarded after averaging — needs per-game exposure + a join to this player's log by date.",
    rows: games.slice(0, 5).map((g, i) => ({ week: i + 1, gameId: g.game_id ?? null })),
  };
};

// Career/transfer linkage is flagged ✅ ready in the inventory (ADVANCED §9)
// via career_profiles.json — we don't have that file wired in yet, so this
// reconstructs the same shape from the real transfer/redshirt/class fields
// already threaded through Bio, rather than fabricating unrelated numbers.
export const buildTrajectory = (player) => ({
  isTransfer: Boolean(player?.is_transfer),
  transferTier: player?.transfer_tier ?? null,
  isRedshirt: Boolean(player?.is_redshirt),
  classYear: player?.class_year ?? null,
  roleChangeStatus: "Blocked on Called-Upon Share (ADVANCED §3) — needs real usage-by-week history, not just raw stat trend.",
  coachingContinuityStatus: "team_trajectories.json has coaching-continuity signals at team level — not yet joined to a player timeline.",
});

// Position-gated extras — only the modules that make sense for this
// player's position render anything.
export const buildPositionModules = (player) => {
  const position = String(player?.position_group ?? "ATH").toUpperCase();
  const rawPosition = String(player?.position ?? player?.position_abbr ?? "").toUpperCase();
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));
  const modules = [];

  if (position === "DL" || position === "LB" || position === "DB") {
    modules.push({
      key: "havoc",
      label: "Havoc Score",
      value: round1(clamp(signal * 1.3, 0, 30)),
      caption: "TFL + Sacks + FF + PBU, forced — player-level formula not built yet; season totals only.",
    });
  }
  if (position === "QB") {
    modules.push({
      key: "pocket",
      label: "Pocket Management",
      value: Math.round(clamp(18 - signal * 0.15, 5, 30)),
      caption: "Sacks taken this season — split out from the rest of the passing line.",
    });
  }
  if (rawPosition === "K") {
    modules.push({
      key: "fg_range",
      label: "FG by Range",
      ranges: [
        { label: "u30", made: Math.round(clamp(3 + signal * 0.1, 1, 8)), att: Math.round(clamp(3 + signal * 0.1, 1, 8)) },
        { label: "30-39", made: Math.round(clamp(4 + signal * 0.15, 1, 10)), att: Math.round(clamp(5 + signal * 0.15, 2, 11)) },
        { label: "40-49", made: Math.round(clamp(3 + signal * 0.1, 0, 8)), att: Math.round(clamp(4 + signal * 0.12, 1, 9)) },
        { label: "50+", made: Math.round(clamp(1 + signal * 0.05, 0, 5)), att: Math.round(clamp(2 + signal * 0.06, 0, 6)) },
      ],
    });
  }
  if (rawPosition === "P") {
    modules.push({
      key: "punt_splits",
      label: "Punt Splits",
      value: Math.round(clamp(8 + signal * 0.2, 2, 20)),
      caption: "Inside-20 punts this season.",
    });
  }

  return modules;
};
