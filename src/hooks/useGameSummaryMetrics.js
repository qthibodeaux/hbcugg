import { useMemo } from "react";
import { shortKey, headFor, buildBasics, BASIC_BLOCKS } from "../utils/gameSummary/metricsModel";

// Extracted from GameSummaryTabV2; statistical semantics and layout are unchanged.

/** The Metrics blocks for both teams — the export's `advanced_basics` when present
 *  (every 2026 game), otherwise the fallback block list derived from drives/plays.
 *  Shared by the desktop card and the mobile one. */
export const useMetricBlocks = ({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg }) => {
  // Real beats derived: when the export ships `advanced_basics.blocks` (every 2026 game),
  // use it directly — same shape this card was designed around, plus the two Turnover
  // columns (Expected TOs, TO Luck) no client formula can produce. Every earlier season
  // falls back to the block list + play-by-play derivation above.
  const isReal = !!advancedBasics?.blocks?.length;

  return useMemo(() => {
    if (isReal) {
      return advancedBasics.blocks.map((b) => ({
        label: b.label,
        metrics: b.metrics.map((m) => {
          const key = shortKey(m.key);
          const entry = leagueAvg?.keys?.[m.key];
          const league = typeof entry?.avg === "number"
            ? { avg: entry.avg, min: typeof entry.min === "number" ? entry.min : null, max: typeof entry.max === "number" ? entry.max : null }
            : null;
          return { key, label: headFor(key, m.label), away: m.away, home: m.home, league };
        }),
      }));
    }
    const away = buildBasics(drives, plays, awayId, teamStats?.[awayId]);
    const home = buildBasics(drives, plays, homeId, teamStats?.[homeId]);
    return BASIC_BLOCKS.map((b) => ({
      label: b.label,
      metrics: b.metrics.map((m) => ({ key: m.key, label: headFor(m.key, m.label), away: away[m.key], home: home[m.key], league: null })),
    }));
  }, [isReal, advancedBasics, drives, plays, awayId, homeId, teamStats, leagueAvg]);
};
