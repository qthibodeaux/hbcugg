import { Box, Flex, Spinner } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import StatsBanner from "../../components/organisms/StatsBanner";
import { useStatsHubCards } from "../../hooks/useSWACData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { StatsHubContextCard, statsHubSlotFor } from "../../components/molecules/stats/StatsHubContextCards";

// ─────────────────────────────────────────────────────────────────────────────
// STATS HUB — the banner and the context cards (Stats Hub Cards Fetch
// Contract: stats/hub-cards/{season}.json, rebuilt weekly by the backend).
//
// Launch.0 (2026-10-07): the hub is the whole page. The Team Efficiency and
// Leaderboards views, and the banner's Hub / Team Efficiency / Leaderboards
// switch, are parked for after launch (AFTER_LAUNCH_0.md §11). Their
// components (TeamEfficiencyPanel, LeaderboardCard) are untouched.
// ─────────────────────────────────────────────────────────────────────────────

const ROW_UNIT = "clamp(160px, 20vw, 260px)";
const rowUnitHeight = (rows = 1) =>
  rows === 1 ? ROW_UNIT : `calc(${rows} * ${ROW_UNIT} + ${(rows - 1) * 0.25}rem)`;

const StatsPage = () => {
  const { isMobile } = useLayoutDensity();
  const { cards, isLoading } = useStatsHubCards();
  const banner = <StatsBanner />;

  // Phones open on Team Analytics; the Hub's mobile cards are punted.
  if (isMobile) return <Navigate to="/team-analytics" replace />;

  // Mobile stacks outside the grid, so heights are spelled out explicitly.
  if (isMobile) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <Flex direction="column" gap="0.75rem" pb="0.75rem">
          {banner}
          <Box px="0.75rem">
            {isLoading ? (
              <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>
            ) : (
              <Flex direction="column" gap="0.75rem">
                {cards.map((card) => (
                  <Box key={card.card_id} h={rowUnitHeight(statsHubSlotFor(card).rows)}>
                    <StatsHubContextCard card={card} />
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>{banner}</PageShell.Slot>

      {isLoading && (
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="100%"><Spinner color="brand.500" size="lg" /></Flex>
        </PageShell.Slot>
      )}

      {!isLoading && cards.map((card) => {
        const { cols, rows } = statsHubSlotFor(card);
        return (
          <PageShell.Slot key={card.card_id} cols={cols} rows={rows}>
            <StatsHubContextCard card={card} />
          </PageShell.Slot>
        );
      })}
    </PageShell>
  );
};

export default StatsPage;
