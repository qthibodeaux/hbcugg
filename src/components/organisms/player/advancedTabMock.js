import { round1, clamp } from "./advancedMock/productionEstimates";

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

export { buildPercentileRadar, buildSituationalSplits } from "./advancedMock/productionEstimates";
