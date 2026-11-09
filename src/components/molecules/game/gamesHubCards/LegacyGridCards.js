import { DashboardCardFrame } from "../../../layouts/dashboard";
import { VStack, Box, Text, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const GameOfWeekSpotlight = ({ game, teamData }) => {
  if (!game) {
    return (
      <DashboardCardFrame
        title="Game of the Week"
        isEmpty
        emptyLabel="No game assigned yet."
        minH="280px"
      />
    );
  }
  const homeTeam = teamData[game.team_id];
  return (
    <DashboardCardFrame kicker="Featured" title="Game of the Week" minH="280px">
      <VStack align="start" gap={4} h="100%">
        <Box>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
            {game.date ?? "TBD"}
          </Text>
          <Text fontSize="lg" color="text.primary" fontWeight="bold" lineClamp={2}>
            {game.opponent_name ?? "TBD"} vs {homeTeam?.shortName ?? game.team_id}
          </Text>
        </Box>
        <Box>
          <Text fontSize="2xl" color="brand.400" fontWeight="black">
            {game.result ? `${game.score_team ?? 0} - ${game.score_opp ?? 0}` : "UPCOMING"}
          </Text>
          <Text fontSize="xs" color="text.secondary" mt={1}>{game.result ?? "Scheduled"}</Text>
        </Box>
        {game.parsed_game_stem && (
          <Box mt="auto">
            <Link to={`/game/${game.parsed_game_stem}`}>
              <Box px={4} py={2} borderRadius="lg" bg="brand.500" color="white"
                fontSize="xs" fontWeight="bold" textTransform="uppercase" _hover={{ bg: "brand.400" }}>
                View Full Game
              </Box>
            </Link>
          </Box>
        )}
      </VStack>
    </DashboardCardFrame>
  );
};

export const StoryCard = ({ title, kicker, value, detail, icon: Icon }) => (
  <DashboardCardFrame kicker={kicker} title={title} minH="200px">
    <VStack align="start" gap={3} h="100%">
      {Icon && <Box color="brand.400"><Icon size={24} /></Box>}
      <Box>
        <Text fontSize="2xl" fontWeight="black" color="brand.300" lineHeight={1}>{value}</Text>
      </Box>
      {detail && <Text fontSize="xs" color="text.secondary">{detail}</Text>}
    </VStack>
  </DashboardCardFrame>
);

export const StatCarouselCard = ({ games = [], statType = "yardage" }) => {
  const displayGames = games.slice(0, 3);
  const label = statType === "yardage" ? "Total Yards" : statType === "points" ? "Total Points" : "Stat";
  return (
    <DashboardCardFrame kicker="Stat Carousel" title={label} minH="200px"
      isEmpty={displayGames.length === 0} emptyLabel="No games available.">
      <VStack align="stretch" gap={4}>
        {displayGames.map((game, idx) => {
          const gameLink = game?.parsed_game_stem ? `/game/${game.parsed_game_stem}` : null;
          return (
            <Box key={idx} as={gameLink ? Link : "div"} to={gameLink || undefined}
              cursor={gameLink ? "pointer" : "default"} p={2} borderRadius="md" transition="all 0.2s"
              _hover={gameLink ? { bg: "whiteAlpha.050" } : undefined}>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xs" color="text.secondary" fontWeight="bold">
                  {game.team_id ?? "TEAM"} vs {game.opponent_name ?? "OPP"}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="brand.400">
                  {statType === "yardage" ? Math.floor(Math.random() * 400 + 250) : Math.floor(Math.random() * 35 + 20)}
                </Text>
              </Flex>
              <Box h="6px" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden">
                <Box h="100%" bg="brand.500" w={`${Math.random() * 100}%`} />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </DashboardCardFrame>
  );
};

export const TeamPerformanceStrip = ({ games = [] }) => {
  const displayGames = games.slice(0, 5);
  return (
    <DashboardCardFrame kicker="Team Performance" title="Recent Results" minH="200px"
      isEmpty={displayGames.length === 0} emptyLabel="No games available.">
      <Flex direction="column" gap={3}>
        {displayGames.map((game, idx) => {
          const gameLink = game?.parsed_game_stem ? `/game/${game.parsed_game_stem}` : null;
          return (
            <Box key={idx} as={gameLink ? Link : "div"} to={gameLink || undefined}
              cursor={gameLink ? "pointer" : "default"} transition="all 0.2s">
              <Flex align="center" justify="space-between" gap={3} pb={2}
                borderBottom="1px solid" borderColor="whiteAlpha.50"
                _hover={gameLink ? { bg: "whiteAlpha.050", borderRadius: "md" } : undefined}
                px={gameLink ? 2 : 0}>
                <Box flex={1}>
                  <Text fontSize="xs" color="text.secondary" lineClamp={1}>vs {game.opponent_name ?? "TBD"}</Text>
                  <Text fontSize="10px" color="text.muted">{game.date ?? "TBD"}</Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="sm" fontWeight="bold" color={game.result === "W" ? "green.300" : "red.300"}>
                    {game.score_team ?? 0}-{game.score_opp ?? 0}
                  </Text>
                  <Text fontSize="10px" color="text.muted">
                    {game.result === "W" ? "WIN" : game.result === "L" ? "LOSS" : "TBD"}
                  </Text>
                </Box>
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </DashboardCardFrame>
  );
};
