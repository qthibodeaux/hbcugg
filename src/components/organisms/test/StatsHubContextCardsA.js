import { WinLevers, RankGap, DeadMetric, TwinBars, Fingerprint, ConferenceSplit } from "./statsHubCards/StatsLabViews";
import { LeagueMap, MetricOfWeek, ProductionLeader, Parity } from "../../molecules/stats/contextCards/SharedStatsCards";
import PageShell from "../../layouts/PageShell";
import { STATS_HUB_CARDS_MOCK } from "./statsHubCardsMock";

// ── Registry + slots ─────────────────────────────────────────────────────────

export const STATS_HUB_CARD_VIEWS = {
  correlation_bars: { View: WinLevers, cols: 2, rows: 2 },
  scatter_map: { View: LeagueMap, cols: 2, rows: 2 },
  distribution: { View: MetricOfWeek, cols: 2, rows: 1 },
  rank_gap: { View: RankGap, cols: 1, rows: 1 },
  dumbbell: { View: DeadMetric, cols: 1, rows: 1 },
  twin_bars: { View: TwinBars, cols: 2, rows: 2 },
  radar: { View: Fingerprint, cols: 1, rows: 2 },
  rank_bars: { View: ProductionLeader, cols: 1, rows: 1 },
  conference_split: { View: ConferenceSplit, cols: 1, rows: 1 },
  season_trend: { View: Parity, cols: 1, rows: 1 },
};

export const StatsHubContextCard = ({ card }) => {
  const entry = STATS_HUB_CARD_VIEWS[card?.viz?.kind];
  return entry ? <entry.View c={card} /> : null;
};

// Lab: all eleven in their hub slots.
export const StatsHubContextCardsA = () => (
  <PageShell embedded>
    {STATS_HUB_CARDS_MOCK.cards.map((card) => {
      const entry = STATS_HUB_CARD_VIEWS[card.viz.kind];
      return (
        <PageShell.Slot key={card.card_id} cols={entry?.cols ?? 1} rows={entry?.rows ?? 1}>
          <StatsHubContextCard card={card} />
        </PageShell.Slot>
      );
    })}
  </PageShell>
);
