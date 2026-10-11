import { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import PageShell from "../../layouts/PageShell";

/**
 * QGamePageSummary
 *
 * The "Game Summary" tab content for the QGamePage lab.
 * Receives the full game JSON and renders the summary analytics packet.
 *
 * Components to migrate from GameSummaryPacketLab (1 by 1):
 *   - TeamMetrics
 *   - QuarterStrip
 *   - RawStats
 *   - HiddenEdges
 *   - StandingsContext
 *   - ImpactLeaders
 *   - ScoringTimeline
 *   - KeyPlays
 *   - WhyItHappened
 *   - DriveLedger
 */

const buildModel = (game) => {
  const meta = game?.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id;

  return {
    meta,
    awayId,
    homeId,
    teams: [awayId, homeId].filter(Boolean),
  };
};

function QGamePageSummary({ game }) {
  const model = useMemo(() => buildModel(game), [game]);

  if (!game) {
    return (
      <Box p={6} bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
        <Text color="text.muted">No game data available</Text>
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <Box p={6} bg="bg.card" border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="text.secondary" mb={2}>
            QGamePageSummary — Game Summary Tab
          </Text>
          <Text fontSize="xs" color="text.muted">
            Away: {model.awayId} | Home: {model.homeId}
          </Text>
          <Text fontSize="xs" color="text.muted">
            Date: {model.meta.date} | Site: {model.meta.site}
          </Text>
          <Text fontSize="xs" color="text.muted" mt={2}>
            Components to migrate: TeamMetrics, QuarterStrip, RawStats, HiddenEdges,
            StandingsContext, ImpactLeaders, ScoringTimeline, KeyPlays, WhyItHappened, DriveLedger
          </Text>
        </Box>
      </PageShell.Slot>
    </PageShell>
  );
}

export default QGamePageSummary;
