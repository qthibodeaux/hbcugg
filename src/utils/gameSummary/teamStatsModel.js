import { barPct, barSegment, barRange } from "../statBars";
import { teamSackYards } from "../gameHelpers";

// Extracted from GameSummaryTabV2; statistical semantics and layout are unchanged.

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TEAM STATS — Animated advantage bars with team color dominance
// ═══════════════════════════════════════════════════════════════════════════════
/** How full a Team Stats bar is, 0–100, on the row's range (see utils/statBars). */
export const statBarPct = (value, stat) => barPct(value, stat.range);

/** The filled part of a Team Stats bar — from zero on a stat that crosses it. */
export const statBarSegment = (value, stat) => barSegment(value, stat.range);

/** The Team Stats rows for both teams. Shared by the desktop card and the mobile one. */
export const buildTeamStatRows = ({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg = null }) => {
  const aStats = teamStats?.[awayId] ?? {};
  const hStats = teamStats?.[homeId] ?? {};
  const aAdv = advancedTeam?.[awayId] ?? {};
  const hAdv = advancedTeam?.[homeId] ?? {};

  // Sacks are their own category on the export, so `total_yards` above is gross of
  // them. The yardage is on the passing rows; see teamSackYards.
  const aSackYards = teamSackYards(game, awayId);
  const hSackYards = teamSackYards(game, homeId);

  // Yards per play is the only figure here the export doesn't ship outright; everything
  // else is a straight field read. Logged as a backend ask so this division can go away.
  const perPlay = (stats) => {
    const plays = stats.plays_offense || 0;
    return plays ? (stats.total_yards || 0) / plays : 0;
  };

  const pctOf = (v) => (v || 0) * 100;
  // League entry for a row, in the row's own units (rates are shown ×100).
  const lg = (path, k = 1) => {
    const e = leagueAvg?.keys?.[path];
    if (!e || typeof e.avg !== "number") return null;
    const n = (v) => (typeof v === "number" ? v * k : null);
    return { avg: n(e.avg), min: n(e.min), max: n(e.max) };
  };
  const asPct = (v) => `${v.toFixed(0)}%`;
  const signed = (v) => (v > 0 ? "+" : "") + v.toFixed(2);

  // Every row is real. `stuff_rate` is the rate a team's OWN runs got stuffed, so a
  // defence's run-stuff rate is the opponent's figure, not its own.
  const rawStats = [
    { label: "Total Yards", fallbackMax: 600, league: lg("team_box.total_yards"), away: aStats.total_yards || 0, home: hStats.total_yards || 0, format: (v) => v.toLocaleString() },
    { label: "Total EPA", fallbackMax: 10, league: lg("advanced_team.epa_total"), away: aAdv.epa_total ?? 0, home: hAdv.epa_total ?? 0, format: (v) => (v > 0 ? "+" : "") + v.toFixed(1), allowNegative: true },
    { label: "EPA / Play", fallbackMax: 0.5, league: lg("advanced_team.epa_per_play"), away: aAdv.epa_per_play ?? 0, home: hAdv.epa_per_play ?? 0, format: signed, allowNegative: true },
    { label: "Success Rate", fallbackMax: 60, league: lg("advanced_team.success_rate", 100), away: pctOf(aAdv.success_rate), home: pctOf(hAdv.success_rate), format: asPct },
    { label: "Yards / Play", fallbackMax: 8, away: perPlay(aStats), home: perPlay(hStats), format: (v) => v.toFixed(1) },
    { label: "Explosive Rate", fallbackMax: 25, league: lg("advanced_team.explosive_rate_yardage", 100), away: pctOf(aAdv.explosive_rate_yardage), home: pctOf(hAdv.explosive_rate_yardage), format: asPct },
    { label: "3rd Down Rate", fallbackMax: 60, league: lg("team_box.third_down_conversion_rate", 100), away: pctOf(aStats.third_down_conversion_rate), home: pctOf(hStats.third_down_conversion_rate), format: asPct },
    { label: "Havoc Rate", fallbackMax: 30, league: lg("advanced_team.havoc_rate_forced", 100), away: pctOf(aAdv.havoc_rate_forced), home: pctOf(hAdv.havoc_rate_forced), format: asPct },
    { label: "Def Run Stuff", fallbackMax: 40, league: lg("advanced_team.stuff_rate", 100), away: pctOf(hAdv.stuff_rate), home: pctOf(aAdv.stuff_rate), format: asPct },
    { label: "Sack Yards Lost", fallbackMax: 30, league: lg("trenches.pass_protection.sack_yards_lost"), away: aSackYards ?? 0, home: hSackYards ?? 0, format: (v) => String(v), lowerIsBetter: true },
    { label: "Turnovers", fallbackMax: 4, league: lg("team_box.turnovers_committed"), away: aStats.turnovers_committed ?? 0, home: hStats.turnovers_committed ?? 0, format: (v) => String(v), lowerIsBetter: true },
    { label: "Avg Start", fallbackMax: 40, league: lg("team_box.avg_start_field_position"), away: aStats.avg_start_field_position ?? 0, home: hStats.avg_start_field_position ?? 0, format: (v) => v.toFixed(0) },
  ];

  // Bars run 0 (or the negative team's value) to the league max for the row, with a
  // league-average notch; `fallbackMax` stands in where the league file has no entry
  // (yards / play). See utils/statBars.
  const statsConfig = rawStats.map((s) => ({ ...s, range: barRange(s.away, s.home, s.league, s.fallbackMax) }));
  return statsConfig;
};
