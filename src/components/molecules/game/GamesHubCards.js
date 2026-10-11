import { Box, Flex, Text, VStack, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { DashboardCardFrame } from "../../layouts/dashboard";

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY — kept for GridTestPage compatibility
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return 'TBD';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getWeekFromStem = (stem) => {
  const m = String(stem ?? '').match(/^W(\d+)/i);
  return m ? Number(m[1]) : null;
};

const getWeekFromGame = (g) => {
  if (g.week) return Number(g.week);
  return getWeekFromStem(g.parsed_game_stem);
};

const Logo = ({ team, size = '28px' }) => {
  const src = team ? `/assets/${team.exportId.replace(/25$/, '')}.svg` : null;
  if (!src) return (
    <Box w={size} h={size} borderRadius="full" bg="whiteAlpha.100" flexShrink={0}
      display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="7px" fontWeight="black" color="text.muted">?</Text>
    </Box>
  );
  return (
    <Box w={size} h={size} flexShrink={0}>
      <Image src={src} w={size} h={size} objectFit="contain"
        onError={(e) => { e.target.style.display = 'none'; }} />
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GameCardBroadcast — 1x1 featured game result/upcoming card
// ─────────────────────────────────────────────────────────────────────────────
export const GameCardBroadcast = ({ game, teamData = {} }) => {
  if (!game) return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">No Game</Text>
    </Box>
  );

  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;

  const homeTeamId = game.home_away === 'home' ? game.team_id : game.opponent_id;
  const awayTeamId = game.home_away === 'away' ? game.team_id : game.opponent_id;
  const homeScore  = game.home_away === 'home' ? game.score_team : game.score_opp;
  const awayScore  = game.home_away === 'away' ? game.score_team : game.score_opp;
  const homeOppName = game.home_away === 'home' ? null : game.opponent_name;
  const awayOppName = game.home_away === 'away' ? null : game.opponent_name;

  const homeTeam = teamData[homeTeamId] ?? teamData[String(homeTeamId).replace(/25$/, '')];
  const awayTeam = teamData[awayTeamId] ?? teamData[String(awayTeamId).replace(/25$/, '')];
  const homeLabel = homeTeam?.shortName ?? homeOppName ?? homeTeamId ?? 'TBD';
  const awayLabel = awayTeam?.shortName ?? awayOppName ?? awayTeamId ?? 'TBD';

  const accentColor = homeTeam?.colors?.primary ?? '#E53E3E';
  const homeWon = isComplete && homeScore > awayScore;
  const awayWon = isComplete && awayScore > homeScore;

  const week = getWeekFromGame(game);
  const stageLabel = game.bowl_game && game.game_name ? game.game_name
    : week ? `Week ${week}` : 'Game';

  const inner = (
    <Box h="100%" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl"
      overflow="hidden" display="flex" flexDirection="column"
      style={{ background: `linear-gradient(160deg, ${accentColor}1a 0%, #12121400 45%)` }}>

      {/* Status bar */}
      <Flex px={4} py={2} justify="space-between" align="center"
        borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em"
          color={isComplete ? 'text.muted' : 'brand.400'}>
          {isComplete ? 'FINAL' : 'UPCOMING'}
        </Text>
        <Flex gap={2} align="center">
          {game.conf_game && (
            <Box px={2} py={0.5} bg="whiteAlpha.100" borderRadius="sm">
              <Text fontSize="7px" fontWeight="black" color="text.muted">CONF</Text>
            </Box>
          )}
          <Text fontSize="8px" color="text.muted">{stageLabel}</Text>
        </Flex>
      </Flex>

      {/* Matchup */}
      <Flex flex={1} align="center" justify="center" px={4} py={3} gap={3}>
        {/* Away */}
        <Flex direction="column" align="center" gap={2} flex={1}>
          <Logo team={awayTeam} size="32px" />
          <Text fontSize="xl" fontWeight="black" color={awayWon ? 'white' : 'text.secondary'} lineHeight={1}>
            {isComplete ? (awayScore ?? '—') : '—'}
          </Text>
          <Text fontSize="9px" fontWeight="black" color={awayWon ? 'white' : 'text.muted'}
            textTransform="uppercase" letterSpacing="0.05em" lineClamp={1}>{awayLabel}</Text>
        </Flex>

        <Box>
          <Text fontSize="8px" fontWeight="black" color="text.muted">
            {isComplete ? 'FINAL' : 'VS'}
          </Text>
          {!isComplete && (
            <Text fontSize="8px" color="text.muted" textAlign="center">{fmtDate(game.date)}</Text>
          )}
        </Box>

        {/* Home */}
        <Flex direction="column" align="center" gap={2} flex={1}>
          <Logo team={homeTeam} size="32px" />
          <Text fontSize="xl" fontWeight="black" color={homeWon ? 'white' : 'text.secondary'} lineHeight={1}>
            {isComplete ? (homeScore ?? '—') : '—'}
          </Text>
          <Text fontSize="9px" fontWeight="black" color={homeWon ? 'white' : 'text.muted'}
            textTransform="uppercase" letterSpacing="0.05em" lineClamp={1}>{homeLabel}</Text>
        </Flex>
      </Flex>

      {/* Footer */}
      <Box px={4} py={2} borderTop="1px solid" borderColor="whiteAlpha.100">
        {isCorpus ? (
          <Text fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase"
            letterSpacing="0.1em" textAlign="center">View Recap →</Text>
        ) : (
          <Text fontSize="8px" color="text.muted" textAlign="center">
            {isComplete ? 'No game file' : 'Preview coming soon'}
          </Text>
        )}
      </Box>
    </Box>
  );

  return isCorpus
    ? <Box as={Link} to={`/game/${game.parsed_game_stem}`} display="block" h="100%">{inner}</Box>
    : inner;
};

// ─────────────────────────────────────────────────────────────────────────────
// ScheduleRailList — 3x3 scrollable recent results
// ─────────────────────────────────────────────────────────────────────────────
export const ScheduleRailList = ({ games = [], teamData = {} }) => {
  const RailRow = ({ game }) => {
    const isComplete = !!game.result;
    const isCorpus = game.has_parsed_game && game.parsed_game_stem;

    const homeTeamId = game.home_away === 'home' ? game.team_id : game.opponent_id;
    const awayTeamId = game.home_away === 'away' ? game.team_id : game.opponent_id;
    const homeScore  = game.home_away === 'home' ? game.score_team : game.score_opp;
    const awayScore  = game.home_away === 'away' ? game.score_team : game.score_opp;
    const homeOppName = game.home_away === 'home' ? null : game.opponent_name;
    const awayOppName = game.home_away === 'away' ? null : game.opponent_name;

    const homeTeam = teamData[homeTeamId] ?? teamData[String(homeTeamId ?? '').replace(/25$/, '')];
    const awayTeam = teamData[awayTeamId] ?? teamData[String(awayTeamId ?? '').replace(/25$/, '')];
    const homeLabel = homeTeam?.shortName ?? homeOppName ?? '?';
    const awayLabel = awayTeam?.shortName ?? awayOppName ?? '?';

    const homeWon = isComplete && homeScore > awayScore;
    const awayWon = isComplete && awayScore > homeScore;
    const week = getWeekFromGame(game);

    const inner = (
      <Flex align="center" gap={3} px={4} py={3}
        borderBottom="1px solid" borderColor="whiteAlpha.100"
        _hover={isCorpus ? { bg: 'whiteAlpha.50' } : {}}
        style={{ transition: 'background 0.15s' }}>

        {/* Week / date */}
        <Box flexShrink={0} w="44px">
          <Text fontSize="9px" fontWeight="black" color="brand.500"
            textTransform="uppercase" letterSpacing="0.1em">W{week ?? '—'}</Text>
          <Text fontSize="8px" color="text.muted">{fmtDate(game.date)}</Text>
        </Box>

        {/* Away */}
        <Flex align="center" gap={1.5} flex={1} minW={0}>
          <Logo team={awayTeam} size="20px" />
          <Text fontSize="xs" fontWeight={awayWon ? 'black' : 'normal'}
            color={awayWon ? 'white' : 'text.secondary'} lineClamp={1}>{awayLabel}</Text>
          {isComplete && (
            <Text fontSize="xs" fontWeight="black" color={awayWon ? 'white' : 'text.muted'} ml="auto">
              {awayScore ?? '—'}
            </Text>
          )}
        </Flex>

        <Text fontSize="8px" color="text.muted" flexShrink={0}>@</Text>

        {/* Home */}
        <Flex align="center" gap={1.5} flex={1} minW={0}>
          <Logo team={homeTeam} size="20px" />
          <Text fontSize="xs" fontWeight={homeWon ? 'black' : 'normal'}
            color={homeWon ? 'white' : 'text.secondary'} lineClamp={1}>{homeLabel}</Text>
          {isComplete && (
            <Text fontSize="xs" fontWeight="black" color={homeWon ? 'white' : 'text.muted'} ml="auto">
              {homeScore ?? '—'}
            </Text>
          )}
        </Flex>

        {/* Status */}
        <Box flexShrink={0} w="40px" textAlign="right">
          <Text fontSize="8px" fontWeight="black" textTransform="uppercase"
            color={isComplete ? 'text.muted' : 'brand.400'}>
            {isComplete ? 'FINAL' : 'UPCOMING'}
          </Text>
        </Box>
      </Flex>
    );

    return isCorpus
      ? <Box as={Link} to={`/game/${game.parsed_game_stem}`} display="block">{inner}</Box>
      : inner;
  };

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" overflow="hidden" display="flex" flexDirection="column">

      {/* Header */}
      <Flex px={4} py={3} align="center" gap={3}
        borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
        <Box w="3px" h="14px" bg="brand.500" borderRadius="full" />
        <Text fontSize="9px" fontWeight="black" color="white" textTransform="uppercase"
          letterSpacing="0.14em">Recent Results</Text>
        <Text fontSize="8px" color="text.muted">{games.length} games</Text>
      </Flex>

      {/* Scrollable list */}
      <Box flex={1} overflowY="auto">
        {games.length === 0 ? (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="9px" color="text.muted" textTransform="uppercase">No results yet</Text>
          </Flex>
        ) : (
          games.map((game, i) => (
            <RailRow key={game.parsed_game_stem || `rail-${i}`} game={game} />
          ))
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TopThreeStandingsCard — 1x1 division top 3
// ─────────────────────────────────────────────────────────────────────────────
export const TopThreeStandingsCard = ({ title, rows = [], accent = '#E53E3E', teamData = {} }) => (
  <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
    borderRadius="xl" overflow="hidden" display="flex" flexDirection="column">

    {/* Header */}
    <Flex px={4} py={3} align="center" gap={2}
      borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}
      style={{ background: `linear-gradient(90deg, ${accent}22 0%, transparent 60%)` }}>
      <Box w="3px" h="14px" borderRadius="full" style={{ background: accent }} />
      <Text fontSize="9px" fontWeight="black" color="white" textTransform="uppercase"
        letterSpacing="0.14em">{title}</Text>
    </Flex>

    {/* Rows */}
    <Flex direction="column" flex={1} justify="space-around" px={4} py={3} gap={2}>
      {rows.length === 0 ? (
        <Text fontSize="9px" color="text.muted" textAlign="center">No data</Text>
      ) : rows.map((row, i) => {
        const team = row.team ?? teamData[row.id] ?? teamData[String(row.id).replace(/25$/, '')];
        const logo = team ? `/assets/${team.exportId.replace(/25$/, '')}.svg` : null;
        const label = team?.shortName ?? row.id;
        const confRecord = `${row.cw}–${row.cl}`;
        const isLeader = i === 0;

        return (
          <Flex key={row.id} align="center" gap={2}>
            <Text fontSize="9px" fontWeight="black" w="14px" textAlign="center"
              color={isLeader ? accent : 'text.muted'}>{i + 1}</Text>
            {logo && (
              <Box w="20px" h="20px" flexShrink={0}>
                <Image src={logo} w="20px" h="20px" objectFit="contain"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </Box>
            )}
            <Text fontSize="xs" fontWeight={isLeader ? 'black' : 'normal'}
              color={isLeader ? 'white' : 'text.secondary'} flex={1} lineClamp={1}>{label}</Text>
            <Text fontSize="xs" fontWeight="black" color={isLeader ? 'white' : 'text.muted'}
              flexShrink={0}>{confRecord}</Text>
          </Flex>
        );
      })}
    </Flex>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// ScheduleHeadlineCard — 1x1 upcoming game spotlight
// ─────────────────────────────────────────────────────────────────────────────
export const ScheduleHeadlineCard = ({ title = 'Game of the Week', game, footer }) => {
  if (!game) return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">No Game</Text>
    </Box>
  );

  const week = getWeekFromGame(game);

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" overflow="hidden" display="flex" flexDirection="column"
      style={{ background: 'linear-gradient(160deg, rgba(229,62,62,0.08) 0%, #12121400 50%)' }}>

      {/* Header */}
      <Flex px={4} py={3} align="center" gap={2}
        borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box w="3px" h="14px" bg="brand.500" borderRadius="full" />
        <Text fontSize="8px" fontWeight="black" color="brand.400" textTransform="uppercase"
          letterSpacing="0.14em">{title}</Text>
      </Flex>

      {/* Content */}
      <Flex flex={1} direction="column" align="center" justify="center" px={4} py={4} gap={3}>
        <Flex align="center" gap={2} w="100%">
          <Text fontSize="lg" fontWeight="black" color="text.secondary" flex={1} textAlign="right"
            textTransform="uppercase" lineClamp={1}>
            {game.awayShort ?? game.opponent_name ?? 'TBD'}
          </Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted">VS</Text>
          <Text fontSize="lg" fontWeight="black" color="white" flex={1} textAlign="left"
            textTransform="uppercase" lineClamp={1}>
            {game.homeShort ?? game.team_id ?? 'TBD'}
          </Text>
        </Flex>
        <Flex gap={3} align="center">
          {week && (
            <Box px={2} py={0.5} bg="whiteAlpha.100" borderRadius="sm">
              <Text fontSize="8px" fontWeight="black" color="text.muted">WK {week}</Text>
            </Box>
          )}
          <Text fontSize="9px" color="text.muted">{fmtDate(game.date)}</Text>
        </Flex>
      </Flex>

      {/* Footer */}
      {footer && (
        <Box px={4} py={2} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="8px" color="text.muted" textAlign="center">{footer}</Text>
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UpcomingStretchCard — 1x1 team's next 3 opponents
// ─────────────────────────────────────────────────────────────────────────────
export const UpcomingStretchCard = ({ team, games = [], summary }) => (
  <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
    borderRadius="xl" overflow="hidden" display="flex" flexDirection="column">

    {/* Header */}
    <Flex px={4} py={3} align="center" gap={2}
      borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Box w="3px" h="14px" bg="brand.500" borderRadius="full" />
      <Text fontSize="8px" fontWeight="black" color="brand.400" textTransform="uppercase"
        letterSpacing="0.14em">Upcoming Stretch</Text>
    </Flex>

    {/* Team + opponents */}
    <Flex flex={1} direction="column" px={4} py={4} gap={3}>
      <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase"
        letterSpacing="0.08em">{team?.shortName ?? team ?? 'TBD'}</Text>

      <Flex direction="column" gap={2}>
        {games.length === 0 ? (
          <Text fontSize="9px" color="text.muted">No upcoming games</Text>
        ) : games.map((g, i) => {
          const opp = g.opponent_name ?? g.awayShort ?? '?';
          const isHome = g.home_away === 'home';
          return (
            <Flex key={i} align="center" gap={2}>
              <Box w="16px" h="16px" borderRadius="sm" bg="whiteAlpha.100"
                display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                <Text fontSize="7px" fontWeight="black" color="text.muted">{i + 1}</Text>
              </Box>
              <Text fontSize="xs" color="text.secondary" lineClamp={1} flex={1}>{opp}</Text>
              <Text fontSize="7px" color="text.muted">{isHome ? 'H' : 'A'}</Text>
              <Text fontSize="8px" color="text.muted">{fmtDate(g.date)}</Text>
            </Flex>
          );
        })}
      </Flex>

      {summary && (
        <Text fontSize="9px" color="text.muted" mt="auto">{summary}</Text>
      )}
    </Flex>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// TeamFormCard — 1x1 last 5 results form
// ─────────────────────────────────────────────────────────────────────────────
export const TeamFormCard = ({ team, results = [] }) => {
  const last5 = results.slice(-5);

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" overflow="hidden" display="flex" flexDirection="column">

      {/* Header */}
      <Flex px={4} py={3} align="center" gap={2}
        borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box w="3px" h="14px" bg="brand.500" borderRadius="full" />
        <Text fontSize="8px" fontWeight="black" color="brand.400" textTransform="uppercase"
          letterSpacing="0.14em">Team Form</Text>
      </Flex>

      <Flex flex={1} direction="column" px={4} py={4} gap={4}>
        <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase"
          letterSpacing="0.08em">{team?.shortName ?? team ?? 'TBD'}</Text>

        {/* Form dots */}
        <Flex gap={2} align="center">
          {last5.length === 0 ? (
            <Text fontSize="9px" color="text.muted">No results</Text>
          ) : last5.map((r, i) => {
            const won = r.result === 'W';
            const margin = r.margin ?? (won ? r.score_team - r.score_opp : r.score_opp - r.score_team);
            return (
              <Flex key={i} direction="column" align="center" gap={1}>
                <Box w="28px" h="28px" borderRadius="full"
                  bg={won ? 'green.500' : 'red.600'}
                  display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="9px" fontWeight="black" color="white">{r.result ?? '?'}</Text>
                </Box>
                {margin != null && (
                  <Text fontSize="7px" color="text.muted" textAlign="center">
                    {won ? `+${Math.abs(margin)}` : `-${Math.abs(margin)}`}
                  </Text>
                )}
              </Flex>
            );
          })}
        </Flex>

        <Text fontSize="9px" color="text.muted">
          {last5.filter(r => r.result === 'W').length}W–{last5.filter(r => r.result === 'L').length}L last {last5.length}
        </Text>
      </Flex>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RecordSplitCard — 1x1 home or road record
// ─────────────────────────────────────────────────────────────────────────────
export const RecordSplitCard = ({ title, team, games = [], type = 'home' }) => {
  const relevant = games.filter(g => g.home_away === type && g.result);
  const wins = relevant.filter(g => g.result === 'W').length;
  const losses = relevant.filter(g => g.result === 'L').length;
  const record = `${wins}–${losses}`;
  const pf = relevant.reduce((s, g) => s + Number(g.score_team ?? 0), 0);
  const pa = relevant.reduce((s, g) => s + Number(g.score_opp ?? 0), 0);
  const gp = relevant.length;
  const ppg = gp > 0 ? (pf / gp).toFixed(1) : '—';

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" overflow="hidden" display="flex" flexDirection="column">

      {/* Header */}
      <Flex px={4} py={3} align="center" gap={2}
        borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box w="3px" h="14px" bg="brand.500" borderRadius="full" />
        <Text fontSize="8px" fontWeight="black" color="brand.400" textTransform="uppercase"
          letterSpacing="0.14em">{title ?? (type === 'home' ? 'Home Town Heroes' : 'Us vs The World')}</Text>
      </Flex>

      <Flex flex={1} direction="column" px={4} py={4} gap={2} justify="center">
        <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase"
          letterSpacing="0.08em">{team?.shortName ?? team ?? 'TBD'}</Text>

        <Text fontSize="4xl" fontWeight="black" color="white" lineHeight={1}>{record}</Text>

        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
          {type === 'home' ? 'HOME' : 'ROAD'} · {gp} games
        </Text>

        {gp > 0 && (
          <Flex gap={3} mt={1}>
            <Box>
              <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">PPG</Text>
              <Text fontSize="sm" fontWeight="black" color="text.secondary">{ppg}</Text>
            </Box>
            <Box>
              <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">PAPG</Text>
              <Text fontSize="sm" fontWeight="black" color="text.secondary">
                {gp > 0 ? (pa / gp).toFixed(1) : '—'}
              </Text>
            </Box>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
