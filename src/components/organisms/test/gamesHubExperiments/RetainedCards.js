import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { LabControls, TeamLogo, GhostLogo } from "./ExperimentControls";
import { GAMES } from "./fixtures";
import { Link } from "react-router-dom";
import { Radio, BarChart3 } from "lucide-react";

export const GamesHubBannerClassicControlsE = () => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="100%"
    w="full"
    bg="linear-gradient(110deg, #E53E3E 0%, #9B1C1C 28%, #1A0505 58%, #0B0B0D 100%)"
  >
    <Text
      position="absolute"
      bottom="-20px"
      left="0"
      fontWeight="black"
      style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
      fontStyle="italic"
      color="white"
      opacity={0.05}
      textTransform="uppercase"
      lineHeight={1}
      letterSpacing="-0.05em"
      pointerEvents="none"
      userSelect="none"
      whiteSpace="nowrap"
    >
      GAMES
    </Text>

    <Flex h="100%" align="stretch">
      <Flex flex={1} align="center" pl={8} pr={6} minW={0}>
        <Box minW={0}>
          <Text
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            lineHeight={0.85}
            letterSpacing="-0.04em"
            whiteSpace="nowrap"
            style={{ fontSize: "clamp(2rem, 5.5vw, 6rem)" }}
          >
            GAMES HUB
          </Text>
          <Flex align="center" gap={3} mt={3} minW={0}>
            <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
            <Text
              fontWeight="black"
              color="rgba(255,255,255,0.58)"
              textTransform="uppercase"
              letterSpacing="0.15em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
            >
              THE SEASON'S BEST GAME STORIES
            </Text>
            <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
            <Text
              fontWeight="black"
              color="rgba(255,255,255,0.32)"
              textTransform="uppercase"
              letterSpacing="0.14em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
            >
              RESULTS | MOMENTS | RECAPS
            </Text>
          </Flex>
          <Text mt={3} maxW="720px" color="rgba(255,255,255,0.64)" fontSize="sm" fontWeight="medium" lineClamp={2}>
            A story-first archive for the games that shaped the HBCU football season, from cover-story results to box-score pressure points.
          </Text>
        </Box>
      </Flex>

      <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />

      <Flex direction="column" justify="center" px={6} flexShrink={0} w={{ base: "340px", lg: "420px" }}>
        <Text
          fontSize="8px"
          fontWeight="black"
          color="rgba(255,255,255,0.35)"
          textTransform="uppercase"
          letterSpacing="0.22em"
          mb={3}
        >
          Direct The Page
        </Text>
        <LabControls compact />
      </Flex>
    </Flex>
  </Box>
);

export const GamesHubTicketStubA = () => {
  const game = GAMES[0];
  const total = game.away.score + game.home.score;

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" w="full">
      <Grid
        h="100%"
        w="full"
        templateColumns="1fr 92px"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="#F4F0E8"
        color="#111113"
        boxShadow="0 22px 42px rgba(0,0,0,0.28)"
      >
        <Box position="relative" px={4} py={4} overflow="hidden">
          <Box
            position="absolute"
            inset={0}
            opacity={0.16}
            bg="repeating-linear-gradient(90deg, #111113 0px, #111113 1px, transparent 1px, transparent 9px)"
          />
          <Box position="relative">
            <Flex align="center" justify="space-between">
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Admit One Story
              </Text>
              <Text fontSize="9px" fontWeight="black">
                WK {game.week}
              </Text>
            </Flex>
            <Text mt={3} fontSize="2xl" lineHeight={0.9} fontWeight="black" textTransform="uppercase">
              {game.away.shortName} punches a road ticket
            </Text>
            <Flex mt={4} align="center" gap={2}>
              <TeamLogo team={game.away} size="34px" />
              <Text fontSize="4xl" fontWeight="black" lineHeight={1}>
                {game.away.score}
              </Text>
              <Text fontSize="10px" fontWeight="black" textTransform="uppercase">
                at
              </Text>
              <Text fontSize="4xl" fontWeight="black" lineHeight={1}>
                {game.home.score}
              </Text>
              <TeamLogo team={game.home} size="34px" />
            </Flex>
            <Text mt={3} fontSize="xs" fontWeight="bold" lineHeight={1.35}>
              {game.note}
            </Text>
          </Box>
        </Box>

        <Flex
          direction="column"
          align="center"
          justify="space-between"
          py={4}
          borderLeft="2px dashed"
          borderColor="rgba(17,17,19,0.35)"
          bg="#E7DED0"
        >
          <Text
            fontSize="8px"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.14em"
            style={{ writingMode: "vertical-rl" }}
          >
            Games Hub
          </Text>
          <Text fontSize="3xl" fontWeight="black" lineHeight={1}>
            {total}
          </Text>
          <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
            Total
          </Text>
        </Flex>
      </Grid>
    </Box>
  );
};

export const GamesHubPhotoStripA = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    {[
      { game: GAMES[0], image: "/pics/team_celebration.jpg", title: "Road Noise" },
      { game: GAMES[2], image: "/pics/action_closeup.jpg", title: "The Grind" },
      { game: GAMES[3], image: "/pics/stadium_dusk.jpg", title: "Big Margin" },
      { game: GAMES[1], image: "/pics/sideline_moment.jpg", title: "Night File" },
    ].map((item, index) => (
      <Box key={item.title} as={Link} to={item.game.linkTo} display="block" h="100%">
        <Box
          h="100%"
          position="relative"
          overflow="hidden"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          bgImage={`linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.84) 72%), url(${item.image})`}
          bgSize="cover"
          bgPosition="center"
          transform={index % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)"}
        >
          <Box position="absolute" inset={3} border="1px solid rgba(255,255,255,0.18)" borderRadius="lg" />
          <Flex h="100%" direction="column" justify="end" px={4} py={4} position="relative">
            <Flex align="center" gap={2} mb={2}>
              <TeamLogo team={item.game.away} size="24px" />
              <TeamLogo team={item.game.home} size="24px" />
            </Flex>
            <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              {item.title}
            </Text>
            <Text mt={1} fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
              {item.game.away.shortName} {item.game.away.score}, {item.game.home.shortName} {item.game.home.score}
            </Text>
          </Flex>
        </Box>
      </Box>
    ))}
  </Grid>
);

export const GamesHubBroadcastMatchupA = () => {
  const game = GAMES[3];

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="#08090C"
        position="relative"
      >
        <Grid h="100%" templateColumns="1fr 1fr">
          {[game.away, game.home].map((team, index) => (
            <Flex
              key={team.shortName}
              direction="column"
              justify="space-between"
              px={5}
              py={4}
              position="relative"
              overflow="hidden"
              bg={`linear-gradient(135deg, ${team.colors.primary}88 0%, rgba(8,9,12,0.95) 68%)`}
              borderRight={index === 0 ? "1px solid" : "none"}
              borderColor="whiteAlpha.100"
            >
              <GhostLogo team={team} side={index === 0 ? "left" : "right"} size="185px" opacity={0.16} />
              <Flex align="center" justify="space-between" position="relative">
                <TeamLogo team={team} size="46px" />
                <Text fontSize="6xl" color="white" fontWeight="black" lineHeight={0.8}>
                  {team.score}
                </Text>
              </Flex>
              <Box position="relative">
                <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.88}>
                  {team.shortName}
                </Text>
                <Text mt={1} fontSize="9px" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                  {index === 0 ? "Visitor" : "Home"}
                </Text>
              </Box>
            </Flex>
          ))}
        </Grid>
        <Flex
          position="absolute"
          left={4}
          right={4}
          bottom={4}
          h="34px"
          align="center"
          px={3}
          bg="rgba(0,0,0,0.78)"
          border="1px solid rgba(255,255,255,0.18)"
          borderRadius="md"
          gap={2}
        >
          <Radio size={14} color="#F56565" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
            Final Whistle | {game.label} | {game.note}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubScoreRhythmA = () => {
  const rows = GAMES.map((game) => ({
    ...game,
    total: game.away.score + game.home.score,
    margin: Math.abs(game.away.score - game.home.score),
  }));
  const maxTotal = Math.max(...rows.map((row) => row.total));

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(135deg, #111113 0%, #17191E 48%, #0B0B0D 100%)"
    >
      <Flex h="100%" direction="column" px={4} py={4}>
        <Flex align="center" gap={2} flexShrink={0}>
          <BarChart3 size={16} color="#F56565" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Score Rhythm
          </Text>
          <Text ml="auto" fontSize="9px" color="text.muted" fontWeight="bold">
            total points / margin
          </Text>
        </Flex>

        <Grid mt={4} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={3} alignItems="end">
          {rows.map((row) => {
            const height = `${Math.max(18, Math.round((row.total / maxTotal) * 100))}%`;
            return (
              <Flex key={row.id} direction="column" h="100%" justify="end" minW={0}>
                <Box position="relative" h="100%" display="flex" alignItems="end">
                  <Box
                    w="100%"
                    h={height}
                    borderRadius="md md 0 0"
                    bg={`linear-gradient(180deg, ${row.home.colors.primary}, ${row.away.colors.primary})`}
                    border="1px solid rgba(255,255,255,0.14)"
                  />
                  <Text position="absolute" bottom="8px" left="0" right="0" textAlign="center" fontSize="2xl" color="white" fontWeight="black">
                    {row.total}
                  </Text>
                </Box>
                <Text mt={2} fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                  {row.away.shortName}/{row.home.shortName}
                </Text>
                <Text fontSize="8px" color="text.muted">
                  margin {row.margin}
                </Text>
              </Flex>
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};
