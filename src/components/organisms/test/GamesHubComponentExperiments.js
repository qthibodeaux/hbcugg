// The tested-designs route imports the five retained cards directly from gamesHubExperiments.
// Remaining historical variants have no current source consumers; retain for archive review.
import { useState } from "react";
import useMountEffect from "../../../hooks/useMountEffect";
import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { LabControls, GhostLogo, TeamLogo } from "./gamesHubExperiments/ExperimentControls";
import { GAMES } from "./gamesHubExperiments/fixtures";
import { Link } from "react-router-dom";
import { Newspaper, Flame, Trophy, BarChart3, Radio } from "lucide-react";

const STORY_LINES = [
  "Cover-story games, ranked moments, and scorelines that deserve another look.",
  "Built for recap reading: who landed the headline, who survived, who traveled.",
  "A game archive with editorial weight instead of a plain schedule table.",
];

const useRotatingLine = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    let current = 0;
    let holdTimer;
    let fadeTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % lines.length;
          setIndex(current);
          cycle();
        }, 420);
      }, 3200);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { line: lines[index], visible };
};

export const GamesHubBannerMastheadA = () => {
  const { line, visible } = useRotatingLine(STORY_LINES);

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(112deg, #0B0B0D 0%, #191114 44%, #5A1010 72%, #E53E3E 140%)"
    >
      <Text
        position="absolute"
        left="18px"
        bottom="-28px"
        fontSize="clamp(6rem, 15vw, 13rem)"
        lineHeight={0.8}
        fontWeight="black"
        color="white"
        opacity={0.045}
        textTransform="uppercase"
        pointerEvents="none"
      >
        Games
      </Text>

      <Flex h="100%" position="relative" align="stretch">
        <Flex flex={1} direction="column" justify="center" px={{ base: 5, lg: 8 }} minW={0}>
          <Flex align="center" gap={3} mb={3}>
            <Box h="2px" w="48px" bg="brand.500" />
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.2em">
              Game Center Dispatch
            </Text>
          </Flex>
          <Text
            fontSize="clamp(2.6rem, 6vw, 6.2rem)"
            color="white"
            fontWeight="black"
            textTransform="uppercase"
            lineHeight={0.82}
          >
            Games Hub
          </Text>
          <Text
            mt={3}
            color="text.secondary"
            fontSize="clamp(0.72rem, 1.2vw, 0.95rem)"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
            maxW="720px"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 420ms ease" }}
          >
            {line}
          </Text>
        </Flex>

        <Box w="1px" bg="whiteAlpha.200" my={5} flexShrink={0} />

        <Flex
          w={{ base: "280px", lg: "420px" }}
          flexShrink={0}
          direction="column"
          justify="center"
          px={{ base: 4, lg: 6 }}
          bg="rgba(0,0,0,0.22)"
        >
          <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" mb={3}>
            Direct the Page
          </Text>
          <LabControls />
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubBannerScorestripB = () => {
  const lead = GAMES[0];

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(120deg, ${lead.away.colors.primary}44 0%, #0B0B0D 36%, ${lead.home.colors.primary}55 100%)`}
    >
      <GhostLogo team={lead.away} side="left" size="190px" opacity={0.11} />
      <GhostLogo team={lead.home} side="right" size="190px" opacity={0.11} />

      <Flex h="100%" position="relative" direction="column" px={{ base: 5, lg: 7 }} py={4}>
        <Flex align="start" justify="space-between" gap={5} minH={0}>
          <Box minW={0}>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Story Wall
            </Text>
            <Text
              mt={1}
              fontSize="clamp(2.2rem, 5vw, 5.4rem)"
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.82}
            >
              Front Page Games
            </Text>
          </Box>

          <Flex align="center" gap={4} flexShrink={0} display={{ base: "none", md: "flex" }}>
            <Flex align="center" gap={2}>
              <TeamLogo team={lead.away} size="44px" />
              <Text fontSize="4xl" color="white" fontWeight="black">
                {lead.away.score}
              </Text>
            </Flex>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Final
            </Text>
            <Flex align="center" gap={2}>
              <Text fontSize="4xl" color="white" fontWeight="black">
                {lead.home.score}
              </Text>
              <TeamLogo team={lead.home} size="44px" />
            </Flex>
          </Flex>
        </Flex>

        <Flex mt="auto" align="end" justify="space-between" gap={4}>
          <Box minW={0}>
            <Text fontSize="11px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
              {lead.away.shortName} at {lead.home.shortName} | {lead.label}
            </Text>
            <Text mt={1} fontSize="xs" color="text.secondary" lineClamp={1}>
              {lead.note}
            </Text>
          </Box>
          <Box flexShrink={0} maxW="470px">
            <LabControls compact />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubCoverStoryTearsheetA = () => {
  const story = GAMES[0];

  return (
    <Box as={Link} to={story.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg={`linear-gradient(135deg, ${story.away.colors.primary}4D 0%, rgba(11,11,13,0.97) 42%, ${story.home.colors.primary}3D 100%)`}
      >
        <GhostLogo team={story.away} side="left" size="210px" opacity={0.12} />
        <GhostLogo team={story.home} side="right" size="220px" opacity={0.12} />
        <Grid h="100%" templateColumns="1.15fr 0.85fr" position="relative">
          <Flex direction="column" px={5} py={5} minW={0}>
            <Flex align="center" gap={2}>
              <Newspaper size={15} color="#F56565" />
              <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Cover Story
              </Text>
            </Flex>
            <Text
              mt={4}
              fontSize="clamp(2rem, 4vw, 4.6rem)"
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.84}
            >
              Hornets Own The Week
            </Text>
            <Text mt={4} fontSize="sm" color="text.secondary" lineHeight={1.5} maxW="520px">
              {story.note} This is the lead story treatment: big headline first, score second, why-it-mattered underneath.
            </Text>
            <Text mt="auto" fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Week {story.week} | {story.date} | Click through to game file
            </Text>
          </Flex>

          <Flex direction="column" justify="center" px={5} py={5} borderLeft="1px solid" borderColor="whiteAlpha.100">
            {[story.away, story.home].map((team) => (
              <Flex key={team.shortName} align="center" justify="space-between" gap={3} py={3}>
                <Flex align="center" gap={3} minW={0}>
                  <TeamLogo team={team} size="48px" />
                  <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                    {team.shortName}
                  </Text>
                </Flex>
                <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.9}>
                  {team.score}
                </Text>
              </Flex>
            ))}
            <Box mt={4} borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
              <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Why it mattered
              </Text>
              <Text mt={2} fontSize="xs" color="text.secondary">
                Road win, conference pressure, and a result that can anchor the Games Hub instead of reading like a box score.
              </Text>
            </Box>
          </Flex>
        </Grid>
      </Box>
    </Box>
  );
};

const StoryTile = ({ game, kicker, headline, icon: Icon }) => {
  const accent = game.home.colors.primary;

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" minH={0}>
      <Box
        h="100%"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg={`linear-gradient(180deg, ${accent}30 0%, rgba(14,14,17,0.98) 38%, #0B0B0D 100%)`}
      >
        <GhostLogo team={game.home} side="right" size="120px" opacity={0.1} />
        <Flex h="100%" direction="column" position="relative" px={4} py={4}>
          <Flex align="center" justify="space-between">
            <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              {kicker}
            </Text>
            {Icon ? <Icon size={16} color="#F56565" /> : null}
          </Flex>
          <Text mt={3} fontSize="2xl" color="white" fontWeight="black" lineHeight={0.92} textTransform="uppercase">
            {headline}
          </Text>
          <Text mt={3} fontSize="xs" color="text.secondary" lineHeight={1.45}>
            {game.note}
          </Text>
          <Flex mt="auto" align="center" justify="space-between" gap={3}>
            <Flex align="center" gap={1.5}>
              <TeamLogo team={game.away} size="24px" />
              <TeamLogo team={game.home} size="24px" />
            </Flex>
            <Text fontSize="xl" color="white" fontWeight="black">
              {game.away.score}-{game.home.score}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubStoryTileRowA = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    <StoryTile game={GAMES[2]} kicker="Wild Finish" headline="Two-Point Drama" icon={Flame} />
    <StoryTile game={GAMES[3]} kicker="Statement Win" headline="Alcorn Hits Loud" icon={Trophy} />
    <StoryTile game={GAMES[0]} kicker="Road Heat" headline="Durham Test Passed" icon={Newspaper} />
    <StoryTile game={GAMES[1]} kicker="Night File" headline="DSU Closes Late" icon={BarChart3} />
  </Grid>
);

export const GamesHubResultsLedgerPressA = () => {
  const maxTotal = Math.max(...GAMES.map((game) => game.away.score + game.home.score));

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(11,11,13,0.98) 42%, rgba(229,62,62,0.14) 100%)"
    >
      <Flex h="100%" direction="column">
        <Flex px={4} py={3} align="center" gap={2} borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box w="3px" h="16px" bg="brand.500" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Results Ledger
          </Text>
          <Text ml="auto" fontSize="9px" color="text.muted" fontWeight="bold">
            Ranked editorial rail
          </Text>
        </Flex>

        <Flex flex={1} direction="column" px={3} py={2}>
          {GAMES.map((game, index) => {
            const total = game.away.score + game.home.score;
            const pct = Math.max(18, Math.round((total / maxTotal) * 100));

            return (
              <Box
                key={game.id}
                as={Link}
                to={game.linkTo}
                flex={1}
                display="flex"
                alignItems="center"
                borderBottom={index === GAMES.length - 1 ? "none" : "1px solid"}
                borderColor="whiteAlpha.100"
                px={2}
                minH={0}
              >
                <Grid templateColumns="34px 1fr 90px" gap={3} alignItems="center" w="full">
                  <Text fontSize="2xl" color="whiteAlpha.300" fontWeight="black" lineHeight={1}>
                    {index + 1}
                  </Text>
                  <Box minW={0}>
                    <Flex align="center" gap={2} minW={0}>
                      <TeamLogo team={game.away} size="22px" />
                      <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                        {game.away.shortName}
                      </Text>
                      <Text fontSize="10px" color="text.muted">@</Text>
                      <TeamLogo team={game.home} size="22px" />
                      <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                        {game.home.shortName}
                      </Text>
                    </Flex>
                    <Box mt={1.5} h="5px" bg="whiteAlpha.100" overflow="hidden" borderRadius="full">
                      <Box h="100%" w={`${pct}%`} bg={`linear-gradient(90deg, ${game.away.colors.primary}, ${game.home.colors.primary})`} />
                    </Box>
                    <Text mt={1} fontSize="9px" color="text.muted" lineClamp={1}>
                      {game.label}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
                      {game.away.score}-{game.home.score}
                    </Text>
                    <Text mt={1} fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase">
                      {total} pts
                    </Text>
                  </Box>
                </Grid>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubBannerNewsprintC = () => {
  const { line, visible } = useRotatingLine(STORY_LINES);

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="#111113"
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.14}
        bg="repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 5px)"
      />
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(100deg, rgba(245,101,101,0.28) 0%, rgba(11,11,13,0.72) 38%, rgba(255,255,255,0.06) 100%)"
      />
      <Text
        position="absolute"
        right="-18px"
        bottom="-34px"
        fontSize="clamp(5.5rem, 14vw, 12rem)"
        color="white"
        opacity={0.05}
        fontWeight="black"
        textTransform="uppercase"
        lineHeight={0.8}
      >
        Extra
      </Text>

      <Grid position="relative" h="100%" templateColumns={{ base: "1fr", lg: "1fr 390px" }}>
        <Flex direction="column" justify="center" px={{ base: 5, lg: 8 }} py={4} minW={0}>
          <Flex align="center" gap={3} mb={3}>
            <Box px={2} py={1} bg="white" transform="rotate(-2deg)">
              <Text fontSize="9px" color="#111113" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Saturday Edition
              </Text>
            </Box>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Games Hub
            </Text>
          </Flex>
          <Text
            fontSize="clamp(2.7rem, 6vw, 6.5rem)"
            color="white"
            fontWeight="black"
            textTransform="uppercase"
            lineHeight={0.78}
            maxW="760px"
          >
            The Games That Made Noise
          </Text>
          <Text
            mt={3}
            fontSize="clamp(0.75rem, 1.2vw, 0.95rem)"
            color="text.secondary"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
            maxW="760px"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 420ms ease" }}
          >
            {line}
          </Text>
        </Flex>

        <Flex
          direction="column"
          justify="center"
          px={5}
          py={4}
          borderLeft={{ base: "none", lg: "1px solid" }}
          borderColor="whiteAlpha.200"
          bg="rgba(0,0,0,0.25)"
        >
          <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" mb={3}>
            Page Controls
          </Text>
          <LabControls />
        </Flex>
      </Grid>
    </Box>
  );
};

export const GamesHubBannerSidelineD = () => {
  const lead = GAMES[3];

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(90deg, ${lead.home.colors.primary} 0%, #0B0B0D 38%, #0B0B0D 100%)`}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="40%" bg="rgba(255,255,255,0.08)" transform="skewX(-12deg) translateX(-55px)" />
      <GhostLogo team={lead.home} side="left" size="230px" opacity={0.16} />
      <GhostLogo team={lead.away} side="right" size="210px" opacity={0.08} />

      <Flex h="100%" position="relative" align="center" px={{ base: 5, lg: 7 }} gap={5}>
        <Flex direction="column" flex={1} minW={0}>
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.2em">
            Field Pass | Filterable Story Board
          </Text>
          <Text mt={2} fontSize="clamp(2.4rem, 5.4vw, 5.8rem)" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.8}>
            Games Hub
          </Text>
          <Flex mt={4} align="center" gap={3}>
            <TeamLogo team={lead.away} size="38px" />
            <Text fontSize="3xl" color="white" fontWeight="black">
              {lead.away.score}
            </Text>
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Final
            </Text>
            <Text fontSize="3xl" color="white" fontWeight="black">
              {lead.home.score}
            </Text>
            <TeamLogo team={lead.home} size="38px" />
            <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineClamp={1}>
              {lead.label}
            </Text>
          </Flex>
        </Flex>

        <Box w={{ base: "330px", lg: "460px" }} flexShrink={0}>
          <LabControls compact />
        </Box>
      </Flex>
    </Box>
  );
};

export const GamesHubCoverStoryPosterB = () => {
  const story = GAMES[3];

  return (
    <Box as={Link} to={story.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="#0B0B0D"
      >
        <Box position="absolute" inset={0} bg={`linear-gradient(145deg, ${story.home.colors.primary}66 0%, transparent 44%, ${story.away.colors.primary}55 100%)`} />
        <Box
          position="absolute"
          inset={0}
          opacity={0.12}
          bg="repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 7px)"
        />
        <GhostLogo team={story.home} side="left" size="260px" opacity={0.2} />

        <Flex h="100%" position="relative" direction="column" px={6} py={5}>
          <Flex align="center" justify="space-between">
            <Box px={2} py={1} bg="brand.500">
              <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Cover Story
              </Text>
            </Box>
            <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase">
              Week {story.week} | {story.date}
            </Text>
          </Flex>

          <Text mt={4} fontSize="clamp(2.4rem, 4.8vw, 5.2rem)" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.78}>
            Braves Put It In Ink
          </Text>

          <Grid mt="auto" templateColumns="1fr 132px" gap={5} alignItems="end">
            <Box>
              <Text fontSize="sm" color="white" fontWeight="bold" lineHeight={1.45}>
                {story.note} The poster variant treats a result like an event cover: louder, simpler, and more collectible.
              </Text>
              <Flex mt={4} align="center" gap={2}>
                <TeamLogo team={story.away} size="30px" />
                <Text fontSize="xs" color="text.secondary" fontWeight="black" textTransform="uppercase">
                  {story.away.shortName}
                </Text>
                <Text fontSize="10px" color="text.muted">@</Text>
                <TeamLogo team={story.home} size="30px" />
                <Text fontSize="xs" color="white" fontWeight="black" textTransform="uppercase">
                  {story.home.shortName}
                </Text>
              </Flex>
            </Box>
            <Box textAlign="right">
              <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
                {story.home.score}
              </Text>
              <Text fontSize="lg" color="text.muted" fontWeight="black">
                to {story.away.score}
              </Text>
            </Box>
          </Grid>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubStoryTilesTabloidB = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    {[
      { game: GAMES[0], kicker: "Road Heat", headline: "DSU Shakes Durham", icon: Radio },
      { game: GAMES[2], kicker: "Defensive Clipping", headline: "14-12 In The Mud", icon: Newspaper },
      { game: GAMES[3], kicker: "Statement", headline: "Alcorn Goes Bold", icon: Trophy },
      { game: GAMES[1], kicker: "Night Desk", headline: "Hornets Finish It", icon: Flame },
    ].map((card, index) => (
      <Box key={card.kicker} transform={index % 2 === 0 ? "rotate(-0.35deg)" : "rotate(0.35deg)"} minH={0}>
        <StoryTile {...card} />
      </Box>
    ))}
  </Grid>
);

export { GamesHubBannerClassicControlsE, GamesHubTicketStubA, GamesHubPhotoStripA, GamesHubBroadcastMatchupA, GamesHubScoreRhythmA } from "./gamesHubExperiments/RetainedCards";
