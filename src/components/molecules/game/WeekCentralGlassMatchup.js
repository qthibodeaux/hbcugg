import React from "react";
import { Box, Flex, Text, Heading, Image, Grid, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const fmtDate = (date) => {
  if (!date) return "TBD";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return String(date);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getTeamLogo = (team) =>
  team ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null;

const getGameSide = (game, side) => {
  const isHomeSide = side === "home";
  const teamId =
    game.home_away === side ? game.team_id : game.opponent_id;
  const score =
    game.home_away === side ? game.score_team : game.score_opp;
  const opponentName = game.home_away === side ? null : game.opponent_name;
  const team = TEAM_BY_ID[teamId];

  return {
    label: team?.shortName ?? opponentName ?? teamId ?? "TBD",
    fullName: team?.name ?? opponentName ?? "Opponent TBD",
    logo: getTeamLogo(team),
    score,
    colors: team?.colors,
    homeAway: isHomeSide ? "HOME" : "AWAY",
  };
};

const TeamPanel = ({ side, complete }) => {
  const logoFallback = side.label.slice(0, 3).toUpperCase();

  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Flex direction="column" align="center" minW={0}>
        <Box
          w={{ base: "58px", md: "80px" }}
          h={{ base: "58px", md: "80px" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          bg="rgba(255,255,255,0.06)"
          border="1px solid rgba(255,255,255,0.1)"
        >
          {side.logo ? (
            <Image
              src={side.logo}
              w={{ base: "46px", md: "66px" }}
              h={{ base: "46px", md: "66px" }}
              objectFit="contain"
              filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Text fontSize="sm" fontWeight="black" color="whiteAlpha.700">
              {logoFallback}
            </Text>
          )}
        </Box>

        <Text
          mt={3}
          fontSize={{ base: "lg", md: "2xl" }}
          fontWeight="black"
          color="white"
          lineHeight={1}
          textAlign="center"
          lineClamp={1}
        >
          {side.label}
        </Text>
        <Text fontSize="9px" color="whiteAlpha.700" fontWeight="black" mt={1}>
          {complete ? side.score ?? "-" : side.homeAway}
        </Text>
      </Flex>
    </motion.div>
  );
};

export const WeekCentralGlassMatchup = ({ game }) => {
  if (!game) {
    return (
      <Box
        w="full"
        h="full"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="bg.secondary"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="10px"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.12em"
        >
          Spotlight matchup
        </Text>
      </Box>
    );
  }

  const isComplete = Boolean(game.result);
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const home = getGameSide(game, "home");
  const away = getGameSide(game, "away");
  const accentColor = home.colors?.primary ?? away.colors?.primary ?? "#E53E3E";
  const statusLabel = isComplete ? "Final" : "Next Up";

  return (
    <Box
      w="full"
      h="full"
      bgImage="url('/pics/stadium_dusk.jpg')"
      bgSize="cover"
      bgPosition="center"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.18)"
    >
      <Box position="absolute" inset={0} bg="rgba(0,0,0,0.68)" />
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(135deg, ${accentColor}55 0%, rgba(0,0,0,0) 58%)`}
      />

      <Flex direction="column" h="full" position="relative" zIndex={2} p={5}>
        <Flex
          backdropFilter="blur(12px)"
          bg="rgba(255,255,255,0.06)"
          border="1px solid rgba(255,255,255,0.12)"
          p={3}
          borderRadius="lg"
          justify="space-between"
          align="center"
          gap={3}
          mb={4}
        >
          <VStack align="start" gap={0}>
            <Text
              fontSize="10px"
              fontWeight="black"
              color="brand.400"
              textTransform="uppercase"
            >
              {isComplete ? "Spotlight Recap" : "Marquee Matchup"}
            </Text>
            <Heading size="xs" color="white" lineClamp={1}>
              WEEK CENTRAL HUB
            </Heading>
          </VStack>
          <Box
            bg={isComplete ? "whiteAlpha.200" : "white"}
            color={isComplete ? "white" : "black"}
            px={2}
            py={1}
            borderRadius="md"
            fontSize="10px"
            fontWeight="black"
            textTransform="uppercase"
            flexShrink={0}
          >
            {statusLabel}
          </Box>
        </Flex>

        <Grid
          templateColumns="1fr auto 1fr"
          flex={1}
          alignItems="center"
          backdropFilter="blur(18px)"
          bg="rgba(255,255,255,0.04)"
          borderRadius="xl"
          border="1px solid rgba(255,255,255,0.12)"
          boxShadow="xl"
          px={{ base: 4, md: 8 }}
          minH={0}
        >
          <TeamPanel side={away} complete={isComplete} />

          <Box px={{ base: 3, md: 6 }} textAlign="center">
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="black"
              color="whiteAlpha.500"
            >
              {isComplete ? "FINAL" : "VS"}
            </Text>
          </Box>

          <TeamPanel side={home} complete={isComplete} />
        </Grid>

        <Flex mt={4} justify="center" gap={{ base: 4, md: 8 }} wrap="wrap">
          <Box textAlign="center">
            <Text fontSize="10px" color="whiteAlpha.600">
              DATE
            </Text>
            <Text fontSize="xs" fontWeight="black" color="white">
              {fmtDate(game.date)}
            </Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="10px" color="whiteAlpha.600">
              TYPE
            </Text>
            <Text fontSize="xs" fontWeight="black" color="white">
              {game.conf_game ? "CONF" : "NON-CONF"}
            </Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="10px" color="whiteAlpha.600">
              RECAP
            </Text>
            {isCorpus ? (
              <Box
                as={Link}
                to={`/game/${game.parsed_game_stem}`}
                fontSize="xs"
                fontWeight="black"
                color="brand.400"
                _hover={{ color: "white" }}
              >
                OPEN
              </Box>
            ) : (
              <Text fontSize="xs" fontWeight="black" color="white">
                {isComplete ? "N/A" : "SOON"}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
