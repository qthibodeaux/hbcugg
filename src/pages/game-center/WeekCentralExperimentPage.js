import { useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import teamsData from "../../data/teams.json";

const DEFAULT_SEASON = 2025;
const SEASONS = [2025, 2024, 2023, 2022, 2021];

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const fetcher = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getGameWeek = (game) => {
  if (game?.week != null) return Number(game.week);
  return getWeekFromStem(game?.parsed_game_stem);
};

const fmtDate = (value) => {
  if (!value) return "TBD";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const dedupeGames = (games) => {
  const seen = new Map();
  for (const game of games) {
    const stem = game.parsed_game_stem;
    if (stem) {
      if (!seen.has(stem)) seen.set(stem, game);
    } else {
      const key = `${[game.team_id, game.opponent_id || game.opponent_name].sort().join("-")}-${game.date}`;
      if (!seen.has(key)) seen.set(key, game);
    }
  }
  return [...seen.values()];
};

const getMatchup = (game) => {
  const homeTeamId = game.home_away === "home" ? game.team_id : game.opponent_id;
  const awayTeamId = game.home_away === "away" ? game.team_id : game.opponent_id;
  const homeScore = game.home_away === "home" ? Number(game.score_team ?? 0) : Number(game.score_opp ?? 0);
  const awayScore = game.home_away === "away" ? Number(game.score_team ?? 0) : Number(game.score_opp ?? 0);
  const homeFallback = game.home_away === "home" ? null : game.opponent_name;
  const awayFallback = game.home_away === "away" ? null : game.opponent_name;
  const homeTeam = TEAM_BY_ID[homeTeamId] ?? TEAM_BY_ID[normalizeTeamKey(homeTeamId)];
  const awayTeam = TEAM_BY_ID[awayTeamId] ?? TEAM_BY_ID[normalizeTeamKey(awayTeamId)];
  const isFinal = !!game.result;
  const totalPoints = isFinal ? homeScore + awayScore : null;
  const margin = isFinal ? Math.abs(homeScore - awayScore) : null;

  return {
    game,
    week: getGameWeek(game),
    dateLabel: fmtDate(game.date),
    isFinal,
    totalPoints,
    margin,
    linkTo: game.parsed_game_stem ? `/game/${game.parsed_game_stem}` : null,
    homeScore,
    awayScore,
    home: {
      ...homeTeam,
      label: homeTeam?.shortName ?? homeFallback ?? "HOME",
      logo: homeTeam?.logo,
    },
    away: {
      ...awayTeam,
      label: awayTeam?.shortName ?? awayFallback ?? "AWAY",
      logo: awayTeam?.logo,
    },
  };
};

const TeamLogo = ({ team, size = "34px", muted = false }) => (
  <Box w={size} h={size} opacity={muted ? 0.34 : 1} flexShrink={0}>
    {team?.logo ? (
      <Image src={team.logo} alt={team.label ?? team.shortName ?? "Team"} w="100%" h="100%" objectFit="contain" />
    ) : (
      <Flex w="100%" h="100%" align="center" justify="center" borderRadius="md" bg="whiteAlpha.100">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {String(team?.label ?? "?").slice(0, 2).toUpperCase()}
        </Text>
      </Flex>
    )}
  </Box>
);

const WeekBoardBanner = ({ season, setSeason, week, setWeek, weeks, slate }) => (
  <Box
    h="100%"
    w="full"
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(112deg, #E53E3E 0%, #9B1C1C 30%, #151115 62%, #0B0B0D 100%)"
  >
    <Text
      position="absolute"
      bottom="-26px"
      left="0"
      fontSize="clamp(80px, 16vw, 178px)"
      lineHeight={1}
      fontWeight="black"
      fontStyle="italic"
      color="white"
      opacity={0.045}
      textTransform="uppercase"
      letterSpacing="-0.05em"
      pointerEvents="none"
    >
      CENTRAL
    </Text>

    <Grid h="100%" position="relative" templateColumns="1fr 380px">
      <Flex direction="column" justify="center" pl={8} pr={6} minW={0}>
        <Flex align="end" gap={3}>
          <Text
            fontSize="clamp(2.2rem, 5.4vw, 6rem)"
            color="white"
            fontWeight="black"
            fontStyle="italic"
            textTransform="uppercase"
            lineHeight={0.82}
            whiteSpace="nowrap"
          >
            WEEK CENTRAL
          </Text>
          <Box bg="white" px={3} py={1} borderRadius="md" mb="6px" flexShrink={0}>
            <Text fontSize="xl" color="#E53E3E" fontWeight="black" lineHeight={1}>
              {String(week).padStart(2, "0")}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={3} mt={3}>
          <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
          <Text fontSize="9px" color="rgba(255,255,255,0.58)" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Weekly HBCU scoreboard board
          </Text>
          <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
          <Text fontSize="9px" color="rgba(255,255,255,0.32)" fontWeight="black" textTransform="uppercase" letterSpacing="0.15em">
            {slate.length} games on the slate
          </Text>
        </Flex>
      </Flex>

      <Flex direction="column" justify="center" px={6} borderLeft="1px solid" borderColor="whiteAlpha.200">
        <Text fontSize="8px" color="rgba(255,255,255,0.35)" fontWeight="black" textTransform="uppercase" letterSpacing="0.22em" mb={3}>
          Board Controls
        </Text>
        <Flex gap={2} wrap="wrap">
          {SEASONS.map((item) => (
            <Box
              key={item}
              as="button"
              onClick={() => setSeason(item)}
              px={2.5}
              py={1}
              borderRadius="sm"
              border="1px solid"
              borderColor={season === item ? "rgba(255,255,255,0.55)" : "transparent"}
              bg={season === item ? "rgba(255,255,255,0.18)" : "transparent"}
              cursor="pointer"
            >
              <Text fontSize="9px" color={season === item ? "white" : "rgba(255,255,255,0.34)"} fontWeight="black">
                {item}
              </Text>
            </Box>
          ))}
        </Flex>
        <Flex mt={3} gap={1.5} wrap="wrap" maxH="58px" overflow="hidden">
          {weeks.map((item) => (
            <Box
              key={item}
              as="button"
              onClick={() => setWeek(item)}
              px={2}
              py={1}
              borderRadius="sm"
              border="1px solid"
              borderColor={week === item ? "brand.400" : "whiteAlpha.100"}
              bg={week === item ? "rgba(229,62,62,0.22)" : "rgba(255,255,255,0.04)"}
              cursor="pointer"
            >
              <Text fontSize="8px" color={week === item ? "white" : "text.muted"} fontWeight="black">
                W{item}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Grid>
  </Box>
);

const MetricPoster = ({ label, value, detail, accent = "#E53E3E" }) => (
  <Box
    h="100%"
    w="full"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    overflow="hidden"
    bg={`linear-gradient(160deg, ${accent}28 0%, rgba(15,15,18,0.96) 48%, #0B0B0D 100%)`}
  >
    <Flex h="100%" direction="column" px={4} py={4}>
      <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
        {label}
      </Text>
      <Text mt={3} fontSize="clamp(2.2rem, 4vw, 4.4rem)" color="white" fontWeight="black" lineHeight={0.82}>
        {value}
      </Text>
      <Text mt="auto" fontSize="xs" color="text.secondary" fontWeight="bold" lineHeight={1.35}>
        {detail}
      </Text>
    </Flex>
  </Box>
);

const TopBillingCard = ({ matchup }) => {
  if (!matchup) return null;
  const accent = matchup.home?.colors?.primary ?? "#E53E3E";
  const inner = (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(135deg, ${matchup.away?.colors?.primary ?? "#111113"}55 0%, #0B0B0D 48%, ${accent}66 100%)`}
    >
      <Box position="absolute" inset={0} opacity={0.12} bg="repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 9px)" />
      <Flex h="100%" position="relative" direction="column" px={5} py={4}>
        <Flex align="center" justify="space-between">
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Top Billing
          </Text>
          <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase">
            {matchup.dateLabel}
          </Text>
        </Flex>

        <Text mt={4} fontSize="clamp(2.1rem, 4vw, 4.8rem)" color="white" fontWeight="black" lineHeight={0.82} textTransform="uppercase">
          {matchup.isFinal ? `${matchup.totalPoints} Point File` : "Preview Board"}
        </Text>

        <Grid mt="auto" templateColumns="1fr 118px" gap={4} alignItems="end">
          <Flex direction="column" gap={3}>
            {[matchup.away, matchup.home].map((team) => (
              <Flex key={team.label} align="center" gap={3}>
                <TeamLogo team={team} size="44px" />
                <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                  {team.label}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Box textAlign="right">
            <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
              {matchup.isFinal ? matchup.awayScore : "--"}
            </Text>
            <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
              {matchup.isFinal ? matchup.homeScore : "--"}
            </Text>
            <Text mt={2} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              {matchup.isFinal ? `margin ${matchup.margin}` : "upcoming"}
            </Text>
          </Box>
        </Grid>
      </Flex>
    </Box>
  );

  return matchup.linkTo ? (
    <Box as={Link} to={matchup.linkTo} display="block" h="100%">
      {inner}
    </Box>
  ) : (
    inner
  );
};

const ConferenceRibbon = ({ slate }) => {
  const confGames = slate.filter((game) => game.game.conf_game);
  const nonConfGames = slate.length - confGames.length;

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="#F4F0E8" color="#111113" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={4}>
        <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Conference Ledger
        </Text>
        <Flex mt={4} align="end" gap={3}>
          <Text fontSize="5xl" fontWeight="black" lineHeight={0.8}>
            {confGames.length}
          </Text>
          <Text fontSize="xs" fontWeight="black" textTransform="uppercase" pb={1}>
            conf games
          </Text>
        </Flex>
        <Box mt={4} h="10px" bg="rgba(17,17,19,0.14)" overflow="hidden">
          <Box h="100%" w={`${slate.length ? (confGames.length / slate.length) * 100 : 0}%`} bg="#E53E3E" />
        </Box>
        <Text mt="auto" fontSize="xs" fontWeight="bold">
          {nonConfGames} non-conference or special slate games in this week view.
        </Text>
      </Flex>
    </Box>
  );
};

const HelmetWall = ({ slate }) => {
  const teams = [];
  slate.forEach((matchup) => {
    [matchup.away, matchup.home].forEach((team) => {
      if (team?.logo && !teams.some((item) => item.label === team.label)) teams.push(team);
    });
  });

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={4}>
        <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Teams Active
        </Text>
        <Grid mt={4} templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
          {teams.slice(0, 12).map((team) => (
            <Flex key={team.label} align="center" justify="center" h="34px" borderRadius="md" bg="whiteAlpha.100">
              <TeamLogo team={team} size="24px" />
            </Flex>
          ))}
        </Grid>
        <Text mt="auto" fontSize="xs" color="text.secondary" fontWeight="bold">
          {teams.length} unique HBCU programs appear on this week's board.
        </Text>
      </Flex>
    </Box>
  );
};

const SlateGameCard = ({ matchup }) => {
  const winner =
    matchup.isFinal && matchup.awayScore !== matchup.homeScore
      ? matchup.awayScore > matchup.homeScore
        ? matchup.away.label
        : matchup.home.label
      : null;

  const content = (
    <Box
      h="100%"
      minH="150px"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      bg="linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(13,13,16,0.98) 52%, rgba(229,62,62,0.10) 100%)"
    >
      <Flex h="100%" direction="column" px={4} py={3}>
        <Flex align="center" justify="space-between">
          <Text fontSize="9px" color={matchup.isFinal ? "text.muted" : "brand.400"} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            {matchup.isFinal ? "Final" : "Upcoming"}
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="bold">
            {matchup.dateLabel}
          </Text>
        </Flex>

        {[matchup.away, matchup.home].map((team, index) => {
          const score = index === 0 ? matchup.awayScore : matchup.homeScore;
          const won = winner === team.label;
          return (
            <Flex key={`${team.label}-${index}`} mt={3} align="center" gap={3}>
              <TeamLogo team={team} size="30px" muted={matchup.isFinal && winner && !won} />
              <Text flex={1} fontSize="lg" color={won || !winner ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {team.label}
              </Text>
              <Text fontSize="2xl" color={won || !winner ? "white" : "text.muted"} fontWeight="black" lineHeight={1}>
                {matchup.isFinal ? score : "--"}
              </Text>
            </Flex>
          );
        })}

        <Text mt="auto" fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.08em">
          {matchup.game.conf_game ? "Conference game" : matchup.game.game_name ?? "Week slate"}
        </Text>
      </Flex>
    </Box>
  );

  return matchup.linkTo ? (
    <Box as={Link} to={matchup.linkTo} display="block">
      {content}
    </Box>
  ) : (
    content
  );
};

const WeeklySlateBoard = ({ slate }) => {
  const finals = slate.filter((matchup) => matchup.isFinal).length;
  const upcoming = slate.length - finals;

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(10,10,12,0.98) 44%, rgba(229,62,62,0.10) 100%)"
    >
      <Flex h="100%" direction="column">
        <Flex px={5} py={4} align="center" gap={3} flexShrink={0} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Box px={2} py={1} bg="brand.500">
            <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Weekly Slate
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">
            {slate.length} games on the board
          </Text>
          <Text fontSize="xs" color="text.muted" fontWeight="bold">
            {finals} final | {upcoming} upcoming
          </Text>
          <Box h="1px" flex={1} bg="whiteAlpha.100" />
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Schedule-first experiment
          </Text>
        </Flex>

        <Grid flex={1} minH={0} templateColumns="repeat(3, minmax(0, 1fr))" autoRows="minmax(0, 1fr)" gap={1} p={1}>
          {slate.slice(0, 9).map((matchup) => (
            <SlateGameCard key={matchup.game.parsed_game_stem ?? `${matchup.game.team_id}-${matchup.game.date}`} matchup={matchup} />
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

const ResultsHeadlineStrip = ({ completed }) => {
  const rows = completed.slice(0, 4);

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="#F4F0E8" color="#111113" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={3}>
        <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Final Results Tape
        </Text>
        <Grid mt={3} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={2} alignItems="stretch">
          {rows.map((matchup) => {
            const winner = matchup.awayScore > matchup.homeScore ? matchup.away : matchup.home;
            const loser = matchup.awayScore > matchup.homeScore ? matchup.home : matchup.away;
            const winScore = matchup.awayScore > matchup.homeScore ? matchup.awayScore : matchup.homeScore;
            const loseScore = matchup.awayScore > matchup.homeScore ? matchup.homeScore : matchup.awayScore;

            return (
              <Box key={matchup.game.parsed_game_stem ?? `${winner.label}-${loser.label}`} borderLeft="3px solid #E53E3E" pl={2} minW={0}>
                <Flex align="center" gap={1.5}>
                  <TeamLogo team={winner} size="22px" />
                  <Text fontSize="lg" fontWeight="black" lineHeight={1} lineClamp={1}>
                    {winner.label}
                  </Text>
                </Flex>
                <Text mt={1} fontSize="2xl" fontWeight="black" lineHeight={0.9}>
                  {winScore}-{loseScore}
                </Text>
                <Text mt={1} fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
                  over {loser.label} | margin {matchup.margin}
                </Text>
              </Box>
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};

const UpcomingPreviewStrip = ({ upcoming }) => {
  const rows = upcoming.slice(0, 4);

  return (
    <Box h="100%" w="full" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden">
      <Flex h="100%" direction="column" px={4} py={3}>
        <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Upcoming Preview Tape
        </Text>
        <Grid mt={3} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
          {rows.length === 0 ? (
            <Flex gridColumn="span 4" align="center" justify="center">
              <Text fontSize="xs" color="text.muted" fontWeight="bold">
                No upcoming games left in this selected week.
              </Text>
            </Flex>
          ) : (
            rows.map((matchup) => (
              <Box key={matchup.game.parsed_game_stem ?? `${matchup.away.label}-${matchup.home.label}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" px={3} py={2} minW={0}>
                <Flex align="center" justify="center" gap={2}>
                  <TeamLogo team={matchup.away} size="24px" />
                  <Text fontSize="8px" color="text.muted" fontWeight="black">
                    VS
                  </Text>
                  <TeamLogo team={matchup.home} size="24px" />
                </Flex>
                <Text mt={2} fontSize="sm" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={1}>
                  {matchup.away.label} / {matchup.home.label}
                </Text>
                <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textAlign="center">
                  {matchup.dateLabel}
                </Text>
              </Box>
            ))
          )}
        </Grid>
      </Flex>
    </Box>
  );
};

const WeekCentralExperimentPage = () => {
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [activeWeek, setActiveWeek] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["week-central-experiment", season],
    queryFn: () => fetcher(`/data/1-game center/schedules/by_year/${season}.json`),
    staleTime: Infinity,
    retry: false,
  });

  const { weeks, selectedWeek, slate, completed, upcoming, topBilling, closeGame, avgMargin, activeTeams } = useMemo(() => {
    const games = dedupeGames(data?.games ?? []);
    const weeks = [...new Set(games.map(getGameWeek).filter(Boolean))].sort((a, b) => a - b);
    const defaultWeek = weeks.includes(11) ? 11 : weeks[Math.max(0, weeks.length - 1)];
    const selectedWeek = activeWeek && weeks.includes(activeWeek) ? activeWeek : defaultWeek;
    const slate = games.filter((game) => getGameWeek(game) === selectedWeek).map(getMatchup);
    const completed = slate.filter((game) => game.isFinal);
    const upcoming = slate.filter((game) => !game.isFinal);
    const topBilling = [...completed].sort((a, b) => (b.totalPoints ?? -1) - (a.totalPoints ?? -1))[0] ?? slate[0] ?? null;
    const closeGame = [...completed].sort((a, b) => (a.margin ?? 999) - (b.margin ?? 999))[0] ?? null;
    const margins = completed.map((game) => game.margin).filter((value) => value != null);
    const avgMargin = margins.length ? (margins.reduce((sum, value) => sum + value, 0) / margins.length).toFixed(1) : "--";
    const activeTeams = new Set();
    slate.forEach((game) => {
      if (game.away?.logo) activeTeams.add(game.away.label);
      if (game.home?.logo) activeTeams.add(game.home.label);
    });

    return { weeks, selectedWeek, slate, completed, upcoming, topBilling, closeGame, avgMargin, activeTeams: activeTeams.size };
  }, [data, activeWeek]);

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex h="100%" align="center" justify="center">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <WeekBoardBanner season={season} setSeason={setSeason} week={selectedWeek} setWeek={setActiveWeek} weeks={weeks} slate={slate} />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={3}>
        <WeeklySlateBoard slate={slate} />
      </PageShell.Slot>

      <PageShell.Slot cols={2}>
        <ResultsHeadlineStrip completed={completed} />
      </PageShell.Slot>
      <PageShell.Slot cols={2}>
        <UpcomingPreviewStrip upcoming={upcoming} />
      </PageShell.Slot>

      <PageShell.Slot cols={1}>
        <MetricPoster label="Games This Week" value={slate.length} detail={`${completed.length} final, ${upcoming.length} upcoming in the selected week.`} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Teams Active" value={activeTeams} detail="Unique HBCU programs represented in this weekly slate." accent="#4A90D9" />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Average Margin" value={avgMargin} detail="Calculated only from completed games in the selected week." accent="#F4811F" />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <MetricPoster label="Closest File" value={closeGame?.margin ?? "--"} detail={closeGame ? `${closeGame.away.label} at ${closeGame.home.label}` : "No completed games in this slate."} accent="#A89968" />
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2}>
        <TopBillingCard matchup={topBilling} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <ConferenceRibbon slate={slate} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <HelmetWall slate={slate} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default WeekCentralExperimentPage;
