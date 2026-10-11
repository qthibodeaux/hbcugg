/**
 * Game utility functions for formatting and processing game data
 */

/**
 * Format a value with optional decimal places
 * @param {*} v - Value to format
 * @param {number} dec - Number of decimal places
 * @returns {string} Formatted value
 */
export const fmt = (v, dec = 0) =>
  v == null ? "—" : typeof v === "number" ? v.toFixed(dec) : v;

/**
 * Format a value as percentage
 * @param {*} v - Value to format as percentage
 * @returns {string} Formatted percentage
 */
export const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);

/**
 * Clean and format player name from comma-separated format
 * @param {string} raw - Raw name in "Last, First" format
 * @returns {string} Cleaned name in "First Last" format
 */
export const cleanName = (raw) => {
  if (!raw) return "—";
  const [last, first] = raw.split(",");
  return first ? `${first.trim()} ${last.trim()}` : raw;
};

/**
 * Convert number to ordinal suffix
 * @param {number} n - Number to convert
 * @returns {string} Ordinal string (1st, 2nd, 3rd, etc.)
 */
export const ordSuffix = (n) =>
  n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

/**
 * Calculate completion percentage
 * @param {number} completions - Number of completions
 * @param {number} attempts - Number of attempts
 * @returns {number} Completion percentage
 */
export const completionPct = (completions, attempts) => {
  if (!attempts || attempts === 0) return 0;
  return Math.round((completions / attempts) * 100);
};

/**
 * Calculate yards per carry/attempt
 * @param {number} yards - Total yards
 * @param {number} attempts - Number of attempts
 * @returns {number} Yards per attempt
 */
export const yardsPerAttempt = (yards, attempts) => {
  if (!attempts || attempts === 0) return 0;
  return Math.round((yards / attempts) * 10) / 10;
};

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted time string
 */
export const formatDuration = (minutes) => {
  if (!minutes) return "—";
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}:00`;
};

/**
 * Get team color based on team ID
 * @param {string} teamId - Team identifier
 * @param {string} homeId - Home team ID
 * @returns {string} Color identifier
 */
export const getTeamColor = (teamId, homeId) => {
  return teamId === homeId ? "green.400" : "brand.400";
};

/**
 * Normalize a team's `production_scores` block to one row shape, whichever export
 * it came from.
 *
 *   2019-2025 — an ARRAY of
 *     { player_key, name, position, production_total, components: {…}, note }
 *   2026+     — an OBJECT keyed by player_key, of
 *     { name_raw, team, position_assumed, position_source,
 *       production_score: { …same component keys…, total } }
 *
 * The component keys inside (`passing_production`, `rushing_production`,
 * `receiving_production`, `hit_production`, `hawk_production`, `scrum_production`)
 * are identical in both; only the wrapper moved. Consumers call `.find`/`.map` on
 * the result, so returning an array in both cases is the point — reading the 2026
 * object directly throws `productionRows.find is not a function`.
 *
 * @param {Array|Object} teamScores - one team's entry from `production_scores`
 * @returns {Array} rows of { player_key, name, position, production_total, components }
 */
/**
 * Team sack yardage — the yards the backend took out of rushing.
 *
 * Sacks are their own category now: `team_box.rush_yards` equals the sum of the
 * individual rushing rows and `total_yards` equals pass + rush, verified across
 * all 784 team-games in the export. So sack yardage is in neither, and unless it
 * is added back explicitly it appears nowhere on the page.
 *
 * `team_box` carries the sack COUNTS (`sacks_allowed`, `sacks_made`) but no
 * yardage. The yards live on each passer's row as `sack_yards_lost`, so a team's
 * own loss is the sum of its passers and the yardage its defence took away is the
 * sum of the OPPONENT's passers. A team-level field is on the backend ask list.
 *
 * Returns null when the team has no passing rows at all, so "no data" and "no
 * sacks" stay distinguishable.
 */
export const teamSackYards = (game, teamId) => {
  const rows = game?.individual_stats?.[teamId]?.passing;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.reduce((total, r) => total + (Number(r?.sack_yards_lost) || 0), 0);
};

export const productionEntries = (teamScores) => {
  if (Array.isArray(teamScores)) return teamScores;
  return Object.entries(teamScores ?? {}).map(([playerKey, row]) => ({
    player_key: playerKey,
    name: row.name ?? row.name_raw,
    position: row.position ?? row.position_assumed,
    production_total: row.production_total ?? row.production_score?.total,
    components: row.components ?? row.production_score ?? {},
  }));
};
