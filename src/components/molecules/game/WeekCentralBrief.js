import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { UpcomingBrief } from "./weekBrief/UpcomingBrief";
import { buildBriefData, DEFAULT_IMAGE } from "./weekBrief/briefModel";
import { Panel, SectionLabel, StatusPill } from "./weekBrief/BriefPrimitives";
import { Flex, Box, Image, Text } from "@chakra-ui/react";
import { LineScoreTable } from "./weekBrief/LineScoreTable";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BriefPerformers, BriefTeamStats } from "./WeekCentralBriefBlocks";
import { LeaderRowMobile, LeaderRow } from "./weekBrief/LeaderRows";

export const WeekCentralBrief = ({
  selectedGame,
  parsedGame,
  playerSeasons = [],
  priorPlayerSeasons = [],
  leagueAvg = null,
  isLoading = false,
  selectedColor = "#E53E3E",
  selectedAccent = "#FFFFFF",
}) => {
  const { isMobile } = useLayoutDensity();

  if (selectedGame?.status !== "final") {
    return (
      <UpcomingBrief
        selectedGame={selectedGame}
        selectedColor={selectedColor}
        selectedAccent={selectedAccent}
      />
    );
  }

  const game = buildBriefData({ selectedGame, parsedGame, playerSeasons, priorPlayerSeasons, leagueAvg });
  const awayColor = game.away.accent ?? game.away.secondary ?? game.away.color;
  const homeColor = game.home.accent ?? game.home.secondary ?? game.home.color;

  return (
    <Panel selectedColor={selectedColor}>
      <Flex
        h="100%"
        direction="column"
        bg={selectedColor}
      >
        <Box h="7.375rem" position="relative" overflow="hidden">
          <Image src={DEFAULT_IMAGE} alt="Default stadium" w="100%" h="100%" objectFit="cover" transform={isMobile ? "scale(1.35)" : "none"} />
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(8,23,38,0.08) 0%, rgba(8,23,38,0.82) 100%)" />
          <Flex position="absolute" inset={0} direction="column" align="center" justify="center" gap="0.35rem" px="1rem" textAlign="center">
            <SectionLabel color="whiteAlpha.700">{game.label}</SectionLabel>
            <Flex align="center" gap="0.5rem">
              <Text fontSize="xl" color="white" fontWeight="black">{game.away.shortName}</Text>
              <Text fontSize="0.625rem" color="whiteAlpha.600" fontWeight="black">AT</Text>
              <Text fontSize="xl" color="white" fontWeight="black">{game.home.shortName}</Text>
            </Flex>
            <StatusPill>{game.tag}</StatusPill>
          </Flex>
        </Box>

        <Flex direction="column" gap={{ base: 3, xl: 4 }} px={{ base: 3, xl: 4 }} py={{ base: 3, xl: 4 }} overflow="auto">
          {isLoading && (
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Loading game file...
            </Text>
          )}

          {game.lineScore.length > 0 && <LineScoreTable game={game} selectedAccent={selectedAccent} />}

          {/* The way into the full game: one bar, edge to edge across the panel. */}
          {selectedGame?.route && (
            <Flex
              as={Link}
              to={selectedGame.route}
              mx={{ base: -3, xl: -4 }}
              h="3rem"
              align="center"
              justify="center"
              gap="0.5rem"
              bg="white"
              color="black"
              textDecoration="none"
              _hover={{ bg: selectedAccent, color: "black", textDecoration: "none" }}
              transition="background 0.15s"
            >
              <Text fontSize="0.9rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">Go to game</Text>
              <ArrowRight size={18} strokeWidth={3} />
            </Flex>
          )}

          <BriefPerformers
            performers={game.performers}
            homeId={game.home.id}
            awayColor={awayColor}
            homeColor={homeColor}
            accent={selectedAccent}
          />

          <BriefTeamStats
            rows={game.teamStats}
            awayId={game.away.id}
            homeId={game.home.id}
            awayColor={awayColor}
            homeColor={homeColor}
            accent={selectedAccent}
          />

          <Box>
            <SectionLabel color={selectedAccent}>Game Leaders</SectionLabel>
            <Box
              mt={{ base: 2, xl: 3 }}
              bg="rgba(0,0,0,0.18)"
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor="rgba(255,255,255,0.14)"
              mx={isMobile ? -3 : 0}
            >
              {game.leaders.map((leader) => (
                isMobile
                  ? <LeaderRowMobile key={leader.label} item={leader} awayColor={awayColor} homeColor={homeColor} />
                  : <LeaderRow key={leader.label} item={leader} awayColor={awayColor} homeColor={homeColor} />
              ))}
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Panel>
  );
};
