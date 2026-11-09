import { Box, VStack, Icon, Heading, Text, Flex, Spinner, Grid } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { Info } from "lucide-react";
import { IS_DEMO } from "../../../../config/demo";
import { BannerGameCenter } from "../../../organisms/test/BannerGameCenter";
import { WeekRecapExport } from "../../../game/recap/WeekRecapExport";
import { GameCenterFeaturedGameCardMobile } from "../GameCenterFeaturedGameCardMobile";
import { GameCenterResultsRail } from "../GameCenterResultsRail";
import { TopThreeStandingsCardMobile } from "../TopThreeStandingsCardMobile";
import { renderContextCard } from "../GameCenterContextCard";

export const LabButton = () => (
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

export const OffSeasonMessage = ({ season }) => {
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

export const GameCenterMobile = ({ season, isLoading, isEmpty, featuredGames, scheduleRailCards, standings, contextCards = [] }) => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    {!IS_DEMO && <LabButton />}
    {isLoading ? (
      <Flex justify="center" align="center" h="12rem">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    ) : (<>
      {/* The week's "How Saturday Was Won" export rides the banner. */}
      <Box position="relative">
        <BannerGameCenter />
        <WeekRecapExport />
      </Box>
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
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0" alignItems="stretch">
            {/* The rail is a size container (it scales off its own box), so it
                needs a height: it stretches to the standings column beside it. */}
            <Box minH={0} minW={0}>
              <GameCenterResultsRail cards={scheduleRailCards} />
            </Box>
            <Flex direction="column" gap="0">
              <TopThreeStandingsCardMobile title="SWAC West" rows={standings.swacWest.rows} metric={standings.swacWest.metric} />
              <TopThreeStandingsCardMobile title="SWAC East" rows={standings.swacEast.rows} metric={standings.swacEast.metric} />
              <TopThreeStandingsCardMobile title="MEAC" rows={standings.meac.rows} metric={standings.meac.metric} />
            </Flex>
          </Grid>
        )}

        {/* Context cards, in the backend's order: the first full width (2:1, the
            desktop's double-wide), the rest two across as squares. Flush and
            square-cornered; each card sizes itself off its box. */}
        {contextCards.length > 0 && (
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0" style={{ "--ctx-m": 1 }} css={{ "& > div > div, & > div > a > div": { borderRadius: 0 } }}>
            {contextCards.map((card, index) => {
              const rendered = renderContextCard(card);
              if (!rendered) return null;
              return (
                <Box key={card.id} gridColumn={index === 0 ? "span 2" : undefined} aspectRatio={index === 0 ? "2 / 1" : "1 / 1"} minW={0}>
                  {rendered}
                </Box>
              );
            })}
          </Grid>
        )}
      </>)}
    </>)}
  </Box>
);
