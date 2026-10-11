import { Box, Flex, Grid, Spinner, Text, Heading, VStack, Icon } from "@chakra-ui/react";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { GameCenterFeaturedGameCard } from "../../components/molecules/game/GameCenterFeaturedGameCard";
import { GameCenterFeaturedGameCardMobile } from "../../components/molecules/game/GameCenterFeaturedGameCardMobile";
import { TopThreeStandingsCardMobile } from "../../components/molecules/game/TopThreeStandingsCardMobile";
import { GameCenterResultsRail } from "../../components/molecules/game/GameCenterResultsRail";
import { BannerGameCenter } from "../../components/organisms/test/BannerGameCenter";
import { TopThreeStandingsCard } from "../../components/molecules/game/GameCenterLabCards";
import { useGameCenterHubData } from "../../hooks/useGameCenterHubData";
import { renderContextCard } from "../../components/molecules/game/GameCenterContextCard";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { IS_DEMO } from "../../config/demo";

// TEMPORARY — the lab lost its header link; this gets us there until launch.0.
const LabButton = () => (
  <Box
    as={Link}
    to="/lab/components"
    position="fixed"
    right={4}
    bottom={4}
    zIndex={1400}
    px={4}
    py={2}
    bg="brand.500"
    color="white"
    fontSize="xs"
    fontWeight="black"
    textTransform="uppercase"
    letterSpacing="0.12em"
    borderRadius="md"
    boxShadow="0 8px 24px rgba(0,0,0,0.5)"
    _hover={{ bg: "brand.400", textDecoration: "none" }}
  >
    Component Lab
  </Box>
);

const OffSeasonMessage = ({ season }) => {
  const { isMobile } = useLayoutDensity();
  return (
  <VStack
    spacing={4}
    py={12}
    px={6}
    bg="bg.secondary"
    borderRadius={isMobile ? "0" : "xl"}
    border="1px solid"
    borderColor="whiteAlpha.100"
    textAlign="center"
  >
    <Icon as={Info} w={10} h={10} color="brand.400" />
    <VStack spacing={1}>
      <Heading size="md" color="text.primary" textTransform="uppercase" letterSpacing="widest">
        Off-Season Mode: {season}
      </Heading>
      <Text color="text.secondary" fontSize="sm">
        The {season} schedule is currently pending. check back later for game assignments.
      </Text>
    </VStack>
  </VStack>
  );
};

// Mobile — separate render tree, not PageShell. PageShell's grid (fixed row
// units, page padding) is a desktop concern; mobile pages get built fresh
// here component by component as they're ready. Only the banner is ready so far.
const GameCenterMobile = ({ season, isLoading, isEmpty, featuredGames, scheduleRailCards, standings }) => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    {!IS_DEMO && <LabButton />}
    {isLoading ? (
      <Flex justify="center" align="center" h="12rem">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    ) : (<>
      <BannerGameCenter />
      {isEmpty ? (
        <Box px={4} py={6}>
          <OffSeasonMessage season={season} />
        </Box>
      ) : (<>
        <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0" p="0" mt="0.5rem">
          {featuredGames.slice(0, 4).map((game) => (
            <GameCenterFeaturedGameCardMobile key={game.id} game={game} />
          ))}
        </Grid>

        {standings && (
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0" alignItems="start">
            <Box>
              <GameCenterResultsRail cards={scheduleRailCards} />
            </Box>
            <Flex direction="column" gap="0">
              <TopThreeStandingsCardMobile title="SWAC West" rows={standings.swacWest.rows} metric={standings.swacWest.metric} />
              <TopThreeStandingsCardMobile title="SWAC East" rows={standings.swacEast.rows} metric={standings.swacEast.metric} />
              <TopThreeStandingsCardMobile title="MEAC" rows={standings.meac.rows} metric={standings.meac.metric} />
            </Flex>
          </Grid>
        )}
      </>)}
    </>)}
  </Box>
);

const GameCenterPage = () => {
  const {
    season,
    isLoading,
    featuredGames,
    scheduleRailCards,
    standings,
    contextCards,
    isEmpty,
  } = useGameCenterHubData();
  const { isMobile } = useLayoutDensity();

  if (isMobile) {
    return (
      <GameCenterMobile
        season={season}
        isLoading={isLoading}
        isEmpty={isEmpty}
        featuredGames={featuredGames}
        scheduleRailCards={scheduleRailCards}
        standings={standings}
      />
    );
  }

  return (
    <PageShell>
      {!IS_DEMO && <LabButton />}
      {isLoading ? (
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      ) : (<>
        {/* ── Row 1: Banner ── the hub is a live document; no season control. */}
        <PageShell.Slot cols={4}>
          <BannerGameCenter />
        </PageShell.Slot>

        {isEmpty ? (
          <PageShell.Slot cols={4}>
            <OffSeasonMessage season={season} />
          </PageShell.Slot>
        ) : standings ? (<>
          {/* ── Row 2: Featured game cards ── */}
          {featuredGames.map((game, index) => (
            <PageShell.Slot key={`game-${index + 1}`} cols={1}>
              <GameCenterFeaturedGameCard game={game} />
            </PageShell.Slot>
          ))}

          {/* ── Rows 3-5, col 1: Vertical schedule rail ── */}
          <PageShell.Slot cols={1} rows={3}>
            <GameCenterResultsRail cards={scheduleRailCards} />
          </PageShell.Slot>

          {/* ── Row 3, cols 2-4: Standings ── */}
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="SWAC West" rows={standings.swacWest.rows} metric={standings.swacWest.metric} defendingChampion={standings.swacWest.defendingChampion} conferencePlayBegins={standings.swacWest.conferencePlayBegins} />
          </PageShell.Slot>
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="SWAC East" rows={standings.swacEast.rows} metric={standings.swacEast.metric} defendingChampion={standings.swacEast.defendingChampion} conferencePlayBegins={standings.swacEast.conferencePlayBegins} />
          </PageShell.Slot>
          <PageShell.Slot cols={1}>
            <TopThreeStandingsCard title="MEAC" rows={standings.meac.rows} metric={standings.meac.metric} defendingChampion={standings.meac.defendingChampion} conferencePlayBegins={standings.meac.conferencePlayBegins} />
          </PageShell.Slot>

          {/* ── Rows 4-5, cols 2-4: Context cards ── backend-ranked, rendered
              in arrival order (Hub Design Doc §4). Slot budget is one
              double-wide then four single; fewer than five cards and the
              trailing slots collapse. */}
          {contextCards.map((card, index) => {
            const rendered = renderContextCard(card);
            if (!rendered) return null;
            return (
              <PageShell.Slot key={card.id} cols={index === 0 ? 2 : 1}>
                {rendered}
              </PageShell.Slot>
            );
          })}
        </>) : null}
      </>)}
    </PageShell>
  );
};

export default GameCenterPage;
