import { useParams, Link } from "react-router-dom";
import { HUB_CONFIG, TEAM_BY_EXPORT, loadHubData, getWeekFromStem, buildGroupedBoards, buildWeekBuckets, formatDate } from "./microHub/microHubModel";
import { useQuery } from "@tanstack/react-query";
import { Box, Text, Grid, Flex, Spinner } from "@chakra-ui/react";
import ContentContainer from "../../components/layouts/ContentContainer";
import { StatCard } from "./microHub/StatCard";
import { GameLink } from "../../components/game/GameLink";

const GameCenterMicroHubPage = ({ mode }) => {
  const { season, week, teamId } = useParams();
  const config = HUB_CONFIG[mode] ?? HUB_CONFIG.week;
  const team = teamId ? TEAM_BY_EXPORT[teamId] : null;
  const seasonValue = Number(season ?? 2025);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["game-center-micro", mode, seasonValue, week ?? null, teamId ?? null],
    queryFn: () => loadHubData({ mode, season: seasonValue, teamId, week }),
  });

  const games = data?.games ?? [];
  const standings = data?.standings ?? [];

  const visibleGames = (() => {
    if (mode === "week") {
      const requestedWeek = Number(week);
      return games
        .filter((game) => Number(game.week ?? getWeekFromStem(game.parsed_game_stem)) === requestedWeek)
        .sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
    }

    return [...games].sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
  })();

  const groupedBoards = buildGroupedBoards(standings);
  const weekBuckets = mode === "week" ? buildWeekBuckets(visibleGames) : [];
  const contextLine = [season ? `Season ${season}` : null, week ? `Week ${week}` : null, team ? team.name : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">

      <ContentContainer py={10}>
        <Box
          position="relative"
          overflow="hidden"
          mb={8}
          px={{ base: 5, md: 7 }}
          py={{ base: 7, md: 9 }}
          borderRadius="2xl"
          bg="linear-gradient(135deg, rgba(229,62,62,0.16) 0%, rgba(246,173,85,0.04) 55%, rgba(255,255,255,0.02) 100%)"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.16em" mb={2}>
            {config.kicker}
          </Text>
          <Text
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight={0.95}
            letterSpacing="-0.03em"
          >
            {config.title}
          </Text>
          <Text mt={4} maxW="760px" color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
            {config.description}
          </Text>
          {contextLine && (
            <Text mt={5} fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase" letterSpacing="0.14em">
              {contextLine}
            </Text>
          )}
        </Box>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mb={8}>
          <StatCard label="Mode" value={config.title} />
          <StatCard label="Season" value={String(seasonValue)} accent="orange.300" />
          <StatCard label="Week" value={week ?? "--"} accent="yellow.300" />
          <StatCard label="Team" value={team?.shortName ?? "League"} accent="purple.300" />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }} gap={6}>
          <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" p={6}>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={4}>
              {mode === "standings" || mode === "rankings" ? "Computed Board" : "Live Schedule Feed"}
            </Text>

            {isLoading && (
              <Flex py={10} justify="center">
                <Spinner color="brand.500" />
              </Flex>
            )}

            {isError && (
              <Text fontSize="sm" color="red.300">
                Unable to load this hub dataset right now.
              </Text>
            )}

            {!isLoading && !isError && (mode === "standings" || mode === "rankings") && (
              <Flex direction="column" gap={5}>
                {groupedBoards.map((board) => (
                  <Box key={board.id}>
                    <Text fontSize="xs" color="brand.300" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                      {board.label}
                    </Text>
                    <Flex direction="column" gap={2}>
                      {board.rows.map((row, index) => {
                        const teamMeta = TEAM_BY_EXPORT[row.teamId];
                        return (
                          <Flex
                            key={`${board.id}-${row.teamId}`}
                            justify="space-between"
                            align="center"
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                            borderRadius="lg"
                            px={4}
                            py={3}
                          >
                            <Text color="text.secondary" fontSize="sm" minW="28px">
                              {index + 1}
                            </Text>
                            <Text flex="1" color="white" fontWeight="bold" fontSize="sm" lineClamp={1}>
                              {teamMeta?.name ?? row.teamId}
                            </Text>
                            <Text color="brand.300" fontSize="xs" fontWeight="bold">
                              {row.wins}-{row.losses}
                            </Text>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            )}

            {!isLoading && !isError && mode !== "standings" && mode !== "rankings" && (
              <Flex direction="column" gap={3}>
                {mode === "week"
                  ? weekBuckets.map((bucket) => (
                      <Box key={bucket.label}>
                        <Text fontSize="xs" color="brand.300" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                          {bucket.label}
                        </Text>
                        <Flex direction="column" gap={3}>
                          {bucket.games.slice(0, 8).map((game, idx) => (
                            <Box key={`${game.team_id}-${game.game_index}-${idx}`} borderLeft="3px solid" borderColor="brand.500" pl={4} py={2}>
                              <Text fontSize="xs" color="text.muted" mb={1}>
                                {formatDate(game.date)} · {game.day_of_week ?? "TBD"}
                              </Text>
                              <Text fontSize="sm" fontWeight="bold" color="white">
                                {TEAM_BY_EXPORT[game.team_id]?.shortName ?? game.team_id} vs {game.opponent_name ?? "TBD"}
                              </Text>
                              <Text fontSize="xs" color="text.secondary" mt={1}>
                                {game.result ? `${game.result} ${game.score_team}-${game.score_opp}` : "Upcoming"}
                              </Text>
                              {game.has_parsed_game && game.parsed_game_stem && (
                                <Box mt={2}>
                                  <GameLink
                                    gameStem={game.parsed_game_stem}
                                    fromSection={mode === "week" ? "week" : mode === "schedule" ? "conference-slate" : mode === "team" ? "team" : "games"}
                                    px={3}
                                    py={1}
                                    borderRadius="md"
                                    bg="whiteAlpha.100"
                                    color="text.primary"
                                    fontSize="xs"
                                    _hover={{ bg: "whiteAlpha.200" }}
                                    display="inline-block"
                                  >
                                    Open Game Feed
                                  </GameLink>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Flex>
                      </Box>
                    ))
                  : visibleGames.slice(0, 14).map((game, idx) => (
                      <Box key={`${game.team_id}-${game.game_index}-${idx}`} borderLeft="3px solid" borderColor="brand.500" pl={4} py={2}>
                        <Text fontSize="xs" color="text.muted" mb={1}>
                          {formatDate(game.date)} · {game.day_of_week ?? "TBD"}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="white">
                          {TEAM_BY_EXPORT[game.team_id]?.shortName ?? game.team_id} vs {game.opponent_name ?? "TBD"}
                        </Text>
                        <Text fontSize="xs" color="text.secondary" mt={1}>
                          {game.result ? `${game.result} ${game.score_team}-${game.score_opp}` : "Upcoming"}
                        </Text>
                        {game.has_parsed_game && game.parsed_game_stem && (
                          <Box mt={2}>
                            <GameLink
                              gameStem={game.parsed_game_stem}
                              fromSection={mode === "week" ? "week" : mode === "schedule" ? "conference-slate" : mode === "team" ? "team" : "games"}
                              px={3}
                              py={1}
                              borderRadius="md"
                              bg="whiteAlpha.100"
                              color="text.primary"
                              fontSize="xs"
                              _hover={{ bg: "whiteAlpha.200" }}
                              display="inline-block"
                            >
                              Open Game Feed
                            </GameLink>
                          </Box>
                        )}
                      </Box>
                    ))}

                {visibleGames.length === 0 && (
                  <Text fontSize="sm" color="text.muted">
                    No games available for this filter yet.
                  </Text>
                )}
              </Flex>
            )}
          </Box>

          <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" p={6}>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={4}>
              Jump Back Into Command
            </Text>
            <Flex direction="column" gap={3}>
              <Box as={Link} to="/game-center" px={4} py={3} borderRadius="lg" bg="whiteAlpha.100" _hover={{ bg: "whiteAlpha.200" }}>
                <Text fontSize="sm" fontWeight="bold" color="white">Open Game Center Hub</Text>
              </Box>
              <GameLink gameStem="W1pvamutsu" fromSection="games" px={4} py={3} borderRadius="lg" bg="whiteAlpha.100" _hover={{ bg: "whiteAlpha.200" }} display="block">
                <Text fontSize="sm" fontWeight="bold" color="white">Open Sample Game Feed</Text>
              </GameLink>
              {mode !== "schedule" && (
                <Box
                  as={Link}
                  to={`/game-center/conferenceslate/${seasonValue}`}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  bg="whiteAlpha.100"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  <Text fontSize="sm" fontWeight="bold" color="white">Open Conference Slate</Text>
                </Box>
              )}
              <Box borderTop="1px solid" borderColor="whiteAlpha.200" pt={4} mt={2}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                  Build Targets
                </Text>
                <Flex direction="column" gap={2}>
                  {config.deliverables.map((item) => (
                    <Text key={item} fontSize="xs" color="text.secondary">
                      • {item}
                    </Text>
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Grid>
      </ContentContainer>
    </Box>
  );
};

export default GameCenterMicroHubPage;
