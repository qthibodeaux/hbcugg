// ═══════════════════════════════════════════════════════════════════════════════
// RUSHING GRADES — League averages + contextual grading for defensive impact
// ═══════════════════════════════════════════════════════════════════════════════
//
// This module supports both:
//   1. Static fallback constants (LEAGUE_AVG_RUSHING)
//   2. Dynamic fetched league averages via gradeVsLeagueWithContext()
//
// The pipeline produces:
//   /data/93-FE Docs/shared/league_avg_{season}.json
//   /data/93-FE Docs/shared/team_season_avg_{season}.json
//   /data/93-FE Docs/shared/team_defense_avg_{season}.json
// ═══════════════════════════════════════════════════════════════════════════════

// Fallback constants used when fetched data is not yet available.
// These are overwritten by real pipeline-generated values at build time.
export const LEAGUE_AVG_RUSHING = {
  stopRate: 0.30,
  stuffRate: 0.18,
  tflRate: 0.05,
  havocRate: 0.08,
  successRate: 0.42,
  explosiveRate: 0.12,
  opportunityRate: 0.45,
  powerStopRate: 0.40,
  firstDownSuccRate: 0.55,
};

/**
 * Map a defense-impact category to its league average key.
 */
const CATEGORY_TO_LEAGUE_KEY = {
  run_stop: "stopRate",
  line_play: "stuffRate",
  disruption: "tflRate",
  short_yardage: "powerStopRate",
  down_success: "successRate",
  explosive_prevention: "opportunityRate",
};

/**
 * Grade a defensive metric vs the league average.
 * Defense perspective: higher value = better grade.
 *
 * @param {number} value      — the metric value (0–1)
 * @param {string} category   — defenseImpact category key
 * @param {object} leagueAvg  — optional fetched league averages (defaults to LEAGUE_AVG_RUSHING)
 * @returns {{grade: string, color: string, arrow: string}}
 */
export const gradeVsLeague = (value, category, leagueAvg = null) => {
  const leagueKey = CATEGORY_TO_LEAGUE_KEY[category];
  const baseline = leagueAvg?.rushing?.[leagueKey] ?? LEAGUE_AVG_RUSHING[leagueKey] ?? 0;
  const diff = value - baseline;

  if (diff >= 0.10) return { grade: "A+", color: "#48BB78", arrow: "▲▲" };
  if (diff >= 0.05) return { grade: "A",  color: "#48BB78", arrow: "▲" };
  if (diff >= 0.02) return { grade: "B",  color: "#ECC94B", arrow: "▲" };
  if (diff >= -0.02) return { grade: "C",  color: "#A1A1AA", arrow: "→" };
  if (diff >= -0.05) return { grade: "D",  color: "#ED8936", arrow: "▼" };
  return { grade: "F", color: "#E53E3E", arrow: "▼▼" };
};

/**
 * Compare a game value against a season baseline.
 * Returns placeholder "—" when baseline is null (pipeline not ready).
 *
 * @param {number|null} gameValue     — value from this game
 * @param {number|null} baselineValue — season average (null = placeholder)
 * @returns {{arrow: string, color: string, label: string}}
 */
export const arrowVsBaseline = (gameValue, baselineValue) => {
  if (baselineValue == null) {
    return { arrow: "—", color: "#71717A", label: "No data" };
  }
  const diff = gameValue - baselineValue;
  if (diff > 0.03) return { arrow: "▲", color: "#48BB78", label: "Above avg" };
  if (diff < -0.03) return { arrow: "▼", color: "#E53E3E", label: "Below avg" };
  return { arrow: "→", color: "#A1A1AA", label: "On par" };
};

/**
 * Get the league average for a given category.
 * Useful when you need the raw number for display.
 *
 * @param {string} category   — defenseImpact category key
 * @param {object} leagueAvg  — optional fetched league averages object
 */
export const getLeagueAvg = (category, leagueAvg = null) => {
  const key = CATEGORY_TO_LEAGUE_KEY[category];
  if (leagueAvg?.rushing?.[key] != null) return leagueAvg.rushing[key];
  return key ? LEAGUE_AVG_RUSHING[key] : 0;
};
