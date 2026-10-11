import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import ContentContainer from "../../components/layouts/ContentContainer";
import { GameLink } from "../../components/game/GameLink";
import teamsData from "../../data/teams.json";
import { gameCenterPaths, fetchJson, toLegacyScheduleGame } from "../../utils/gameCenterPayloads";

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const TEAM_GROUPS = [
  { id: "swac-west", label: "SWAC West", filter: (team) => team?.conference === "SWAC" && team?.division === "West" },
  { id: "swac-east", label: "SWAC East", filter: (team) => team?.conference === "SWAC" && team?.division === "East" },
  { id: "meac", label: "MEAC", filter: (team) => team?.conference === "MEAC" },
];

const HUB_CONFIG = {
  week: {
    kicker: "League-Wide Telemetry",
    title: "Week Central",
    description: "This hub will become the live Saturday board: active matchups, upset alerts, slate segmentation, and fast paths into each game feed.",
    deliverables: ["Live scoreboard grid", "Critical alerts rail", "Best matchup spotlight"],
  },
  schedule: {
    kicker: "Conference Matrix",
    title: "Conference Slate",
    description: "This hub holds the league matchup matrix for conference games only, with MEAC, SWAC East, SWAC West, and full SWAC views.",
    deliverables: ["Conference toggles", "Away-at-home matrix", "Game result anchors"],
  },
  team: {
    kicker: "Team Campaign View",
    title: "Team Schedule",
    description: "This hub will track a single team's full campaign with completed recaps, upcoming previews, form, and strength-of-schedule context.",
    deliverables: ["Completed vs upcoming rails", "Team calendar mode", "Schedule strength blocks"],
  },
  standings: {
    kicker: "Conference Race",
    title: "Standings",
    description: "This hub will power SWAC East, SWAC West, and MEAC tables with division leaders, streaks, points for and against, and title race context.",
    deliverables: ["Division tabs", "Leader spotlight", "Streak and scoring metrics"],
  },
  rankings: {
    kicker: "Power Board",
    title: "Rankings",
    description: "This hub will publish the league power board with tiering, movers, elite-zone callouts, and the signature glory score ladder.",
    deliverables: ["Top team hero", "Tiered ranking table", "Mover and elite-zone cards"],
  },
};

const StatCard = ({ label, value, accent = "brand.500" }) => (
  <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4}>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
      {label}
    </Text>
    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color={accent} lineHeight={1}>
      {value}
    </Text>
  </Box>
);

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const formatDate = (dateLike) => {
  if (!dateLike) return "TBD";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return String(dateLike);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const toDateSortValue = (dateLike) => {
  const date = new Date(dateLike ?? "");
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
};

const toDayGroupKey = (dateLike, dayName) => {
  const date = new Date(dateLike ?? "");
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  if (dayName) return String(dayName);
  return "TBD";
};

const computeStandings = (games) => {
  const standings = new Map();

  for (const game of games ?? []) {
    const teamId = game.team_id;
    if (!teamId) continue;

    if (!standings.has(teamId)) {
      standings.set(teamId, {
        teamId,
        wins: 0,
        losses: 0,
        confWins: 0,
        confLosses: 0,
        pf: 0,
        pa: 0,
      });
    }

    const row = standings.get(teamId);
    if (game.result === "W") row.wins += 1;
    if (game.result === "L") row.losses += 1;
    if (game.conf_game && game.result === "W") row.confWins += 1;
    if (game.conf_game && game.result === "L") row.confLosses += 1;

    row.pf += Number(game.score_team ?? 0);
    row.pa += Number(game.score_opp ?? 0);
  }

  return [...standings.values()]
    .map((row) => ({
      ...row,
      gamesPlayed: row.wins + row.losses,
      winPct: row.wins + row.losses > 0 ? row.wins / (row.wins + row.losses) : 0,
      confGames: row.confWins + row.confLosses,
      confPct: row.confWins + row.confLosses > 0 ? row.confWins / (row.confWins + row.confLosses) : 0,
      diff: row.pf - row.pa,
    }))
    .sort((a, b) => b.winPct - a.winPct || b.confPct - a.confPct || b.diff - a.diff || b.pf - a.pf);
};

const buildGroupedBoards = (standingsRows) => {
  const standingsByTeamId = new Map((standingsRows ?? []).map((row) => [row.teamId, row]));

  return TEAM_GROUPS.map((group) => {
    const groupRows = teamsData.teams
      .filter(group.filter)
      .map((team) => {
        const standing = standingsByTeamId.get(team.exportId) ?? standingsByTeamId.get(team.exportId.replace(/25$/, ""));
        return (
          standing ?? {
            teamId: team.exportId,
            wins: 0,
            losses: 0,
            confWins: 0,
            confLosses: 0,
            pf: 0,
            pa: 0,
            gamesPlayed: 0,
            winPct: 0,
            confGames: 0,
            confPct: 0,
            diff: 0,
          }
        );
      })
      .sort((a, b) => b.winPct - a.winPct || b.confPct - a.confPct || b.diff - a.diff || b.pf - a.pf);

    return { id: group.id, label: group.label, rows: groupRows };
  });
};

const buildWeekBuckets = (games) => {
  const buckets = new Map();

  for (const game of games ?? []) {
    const key = toDayGroupKey(game.date, game.day_of_week);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(game);
  }

  return [...buckets.entries()]
    .map(([label, bucketGames]) => ({
      label,
      games: bucketGames.sort((a, b) => toDateSortValue(a.date) - toDateSortValue(b.date)),
      sortValue: Math.min(...bucketGames.map((game) => toDateSortValue(game.date))),
    }))
    .sort((a, b) => a.sortValue - b.sortValue);
};

const loadHubData = async ({ mode, season, teamId, week }) => {
  const seasonValue = Number(season ?? 2025);

  if (mode === "team" && teamId) {
    const payload = await fetchJson(gameCenterPaths.teamSchedules(seasonValue));
    const seasonGames = ((payload.teams ?? []).find((entry) => entry.team?.team_id === teamId)?.games ?? []).map(toLegacyScheduleGame);
    return { games: seasonGames, standings: computeStandings(seasonGames) };
  }

  if (mode === "standings" || mode === "rankings") {
    const payload = await fetchJson(gameCenterPaths.standingsRace(seasonValue));
    const standings = Object.values(payload.groups ?? {})
      .flatMap((group) => group.standings ?? group.rows ?? [])
      .filter((row) => TEAM_BY_EXPORT[row.team_id])
      .map((row) => ({
        teamId: row.team_id,
        wins: row.wins,
        losses: row.losses,
        confWins: row.conf_wins,
        confLosses: row.conf_losses,
        pf: 0,
        pa: 0,
        gamesPlayed: Number(row.wins ?? 0) + Number(row.losses ?? 0),
        winPct: row.win_pct ?? 0,
        confGames: Number(row.conf_wins ?? 0) + Number(row.conf_losses ?? 0),
        confPct: row.conf_win_pct ?? 0,
        diff: 0,
      }));
    return { games: [], standings };
  }

  if (mode === "schedule") {
    const payload = await fetchJson(gameCenterPaths.scheduleBoard(seasonValue));
    const games = (payload.weeks ?? []).flatMap((weekData) => (weekData.games ?? []).map(toLegacyScheduleGame));
    return { games, standings: computeStandings(games) };
  }

  // Per-week file on the new tree; this legacy page reads that week's games only.
  const payload = await fetchJson(gameCenterPaths.weekCentral(seasonValue, week));
  const games = (payload.games ?? []).map(toLegacyScheduleGame);
  return { games, standings: computeStandings(games) };
};

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
