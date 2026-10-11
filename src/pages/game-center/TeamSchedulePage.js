import { Box, Flex, Grid, Text, Spinner, Image } from '@chakra-ui/react';

import { House, Navigation } from 'lucide-react';
import PageShell from '../../components/layouts/PageShell';
import { GameLink } from '../../components/game/GameLink';
import { BannerTeamDetailPage } from '../../components/organisms/test/BannerTeamDetail';
import { BannerTeamSchedules } from '../../components/organisms/test/BannerPages';
import { TeamScheduleBannerA } from '../../components/organisms/test/TeamScheduleBannerA';
import { useTeamScheduleData } from '../../hooks/useTeamScheduleData';
import { getTeam, SCHEDULE_FILTERS } from '../../utils/teamScheduleModel';
import { useLayoutDensity } from '../../hooks/useLayoutDensity';
import { getShortOpponentName } from '../../utils/opponentName';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtDateParts = (d) => {
  if (!d) return { month: 'TBD', day: '' };
  const dt = new Date(d);
  if (isNaN(dt)) {
    const [month, day] = String(d).split(/\s+/);
    return { month: month ?? 'TBD', day: day ?? '' };
  }
  return {
    month: dt.toLocaleDateString('en-US', { month: 'short' }),
    day: dt.toLocaleDateString('en-US', { day: 'numeric' }),
  };
};

const getWeekFromStem = (stem) => {
  const m = String(stem ?? '').match(/^W(\d+)/i);
  return m ? Number(m[1]) : null;
};

const getWeekFromGame = (game) => {
  if (game.week) return Number(game.week);
  return getWeekFromStem(game.parsed_game_stem);
};

const fmtDate = (d) => {
  const parts = fmtDateParts(d);
  return `${parts.month}${parts.day ? ` ${parts.day}` : ''}`;
};

const getGameLabel = (game, opponent) => {
  const raw = game.game_name ?? game.event_name ?? game.classic_name ?? game.stage_label ?? '';
  if (raw) return raw;
  if (game.bowl_game) return 'Bowl Game';
  if (game.conf_game) return game.home_away === 'away' ? 'Road Conference' : 'Conference';
  return opponent ? 'HBCU Matchup' : 'Schedule File';
};

const getTag = (game, opponent) => {
  if (game.bowl_game) return 'BOWL';
  if (game.conf_game && opponent?.conference === 'SWAC' && opponent?.division) return `SWAC ${opponent.division}`;
  if (game.conf_game) return opponent?.conference ?? 'CONF';
  return 'NON-CONF';
};

const getVenueDetails = (game) => {
  const source = game.location ?? game.site ?? game.venue_city ?? '';
  const stadium = game.stadium ?? '';
  const match = String(stadium).match(/^(.*?)\s*\((.*?)\)\s*$/);

  if (match) {
    return {
      city: source || match[1],
      stadium: match[2],
    };
  }

  return {
    city: source || (game.home_away === 'away' ? 'Away' : 'Home'),
    stadium: stadium || (game.home_away === 'away' ? 'Road game' : 'Home game'),
  };
};

const InitialMark = ({ label }) => (
  <Flex
    w={{ base: '50px', md: '58px', xl: '76px' }}
    h={{ base: '50px', md: '58px', xl: '76px' }}
    borderRadius="md"
    bg="whiteAlpha.100"
    border="1px solid"
    borderColor="whiteAlpha.200"
    align="center"
    justify="center"
    flexShrink={0}
  >
    <Text fontSize={{ base: 'lg', xl: '2xl' }} fontWeight="black" color="text.secondary" lineClamp={1}>
      {label}
    </Text>
  </Flex>
);

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY LIST ROW
// ─────────────────────────────────────────────────────────────────────────────
const GameRowOld = ({ game, teamId }) => {
  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const isHome = game.home_away === 'home';

  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent
    ? `/assets/${opponent.exportId.replace(/25$/, '')}.svg`
    : null;
  const opponentLabel = opponent?.shortName ?? game.opponent_name ?? 'TBD';

  const won = isComplete && game.result === 'W';
  const lost = isComplete && game.result === 'L';
  const resultColor = won ? 'green.400' : lost ? 'red.400' : 'text.muted';
  const resultLabel = won
    ? `W ${game.score_team}–${game.score_opp}`
    : lost
    ? `L ${game.score_team}–${game.score_opp}`
    : null;

  const inner = (
    <Flex align="center" gap={4} px={4} py={4}
      borderBottom="1px solid" borderColor="whiteAlpha.100"
      _hover={isCorpus ? { bg: 'whiteAlpha.50' } : {}}
      style={{ transition: 'background 0.15s' }}>

      {/* Week badge */}
      <Box flexShrink={0} w="52px">
        <Box px={2} py={1} bg="whiteAlpha.100" borderRadius="md" textAlign="center" mb={1}>
          <Text fontSize="10px" fontWeight="black" color="white">
            W{getWeekFromGame(game) ?? '—'}
          </Text>
        </Box>
        <Text fontSize="8px" color="text.muted" textAlign="center">
          {fmtDate(game.date)}
        </Text>
      </Box>

      {/* Opponent */}
      <Flex align="center" gap={3} flex={1}>
        {opponentLogo ? (
          <Box w="32px" h="32px" flexShrink={0}>
            <Image src={opponentLogo} w="32px" h="32px" objectFit="contain"
              onError={(e) => { e.target.style.display = 'none'; }} />
          </Box>
        ) : (
          <Box w="32px" h="32px" borderRadius="full" bg="whiteAlpha.100" flexShrink={0}
            display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="8px" fontWeight="black" color="text.muted">
              {opponentLabel.slice(0, 3)}
            </Text>
          </Box>
        )}
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1}>
            {opponentLabel}
          </Text>
          <Text fontSize="9px" color="text.muted">
            {isHome ? 'HOME' : 'AWAY'}{game.stadium ? ` - ${game.stadium}` : ''}
          </Text>
        </Box>
      </Flex>

      {/* Tags */}
      <Flex gap={1} flexShrink={0}>
        {game.conf_game && (
          <Box px={2} py={0.5} borderRadius="sm" bg="whiteAlpha.100">
            <Text fontSize="8px" fontWeight="black" color="text.muted">CONF</Text>
          </Box>
        )}
        {game.bowl_game && (
          <Box px={2} py={0.5} borderRadius="sm" bg="rgba(229,62,62,0.15)">
            <Text fontSize="8px" fontWeight="black" color="brand.400">BOWL</Text>
          </Box>
        )}
      </Flex>

      {/* Result / action */}
      <Box flexShrink={0} textAlign="right" w="120px">
        {isComplete ? (
          <>
            <Text fontSize="md" fontWeight="black" color={resultColor}>{resultLabel}</Text>
            {isCorpus && (
              <Text fontSize="8px" color="brand.400" textTransform="uppercase"
                letterSpacing="0.1em" mt={0.5}>View Recap -&gt;</Text>
            )}
          </>
        ) : (
          <Text fontSize="9px" color="text.muted" textTransform="uppercase"
            letterSpacing="0.1em">Upcoming</Text>
        )}
      </Box>
    </Flex>
  );

  return isCorpus
    ? <Box as={GameLink} gameStem={game.parsed_game_stem} fromSection="team" display="block">{inner}</Box>
    : inner;
};

GameRowOld.displayName = 'GameRowOld';

const TeamScheduleGameRowStandard = ({ game }) => {
  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, '')}.svg` : null;
  const opponentName = opponent?.name ?? game.opponent_name ?? 'TBD';
  const opponentShort = opponent?.shortName ?? (getShortOpponentName(game.opponent_name) || 'TBD');
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? '#E53E3E';
  const dateParts = fmtDateParts(game.date);
  const tag = getTag(game, opponent);
  const venue = getVenueDetails(game);
  const week = getWeekFromGame(game) ?? '-';
  const isAway = game.home_away === 'away';
  const LocationIcon = isAway ? Navigation : House;

  const won = isComplete && game.result === 'W';
  const lost = isComplete && game.result === 'L';
  const resultColor = won ? 'green.400' : lost ? 'red.400' : 'text.muted';
  const resultLabel = won
    ? `W ${game.score_team}-${game.score_opp}`
    : lost
    ? `L ${game.score_team}-${game.score_opp}`
    : null;
  const scoreBg = won ? 'rgba(34,197,94,0.16)' : lost ? 'rgba(248,113,113,0.16)' : 'whiteAlpha.100';
  const scoreBorder = won ? 'green.400' : lost ? 'red.300' : 'whiteAlpha.200';

  const inner = (
    <Grid
      display={{ base: 'none', lg: 'grid' }}
      minH={{ lg: '128px', xl: '148px' }}
      templateColumns={{
        lg: '82px 72px minmax(0, 2fr) minmax(0, 1.15fr) 118px 104px',
        xl: '96px 82px minmax(0, 2.1fr) minmax(0, 1.2fr) 132px 112px 108px',
      }}
      alignItems="center"
      gap={{ base: 2, xl: 4 }}
      px={{ base: 2, md: 3, xl: 4 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: 'whiteAlpha.50' } : {}}
      style={{ transition: 'background 0.15s' }}
    >
      {opponent && (
        <Box position="absolute" left={0} top={0} bottom={0} w={{ base: '4px', xl: '5px' }} bg={accent} />
      )}

      <Box textAlign="center">
        <Box
          px={2}
          py={{ lg: 2, xl: 2.5 }}
          bg={opponent ? `${accent}24` : 'whiteAlpha.100'}
          border="1px solid"
          borderColor={opponent ? `${accent}88` : 'whiteAlpha.100'}
          borderRadius="md"
          textAlign="center"
        >
          <Text fontSize={{ lg: '9px', xl: '10px' }} fontWeight="black" color="text.muted" lineHeight={1} textTransform="uppercase" letterSpacing="0.1em">
            Week
          </Text>
          <Text mt={1} fontSize={{ lg: '2xl', xl: '3xl' }} fontWeight="black" color="white" lineHeight={0.9}>
            {week}
          </Text>
        </Box>
      </Box>

      <Box textAlign="center">
        <Text fontSize={{ lg: 'sm', xl: 'md' }} color="white" fontWeight="black" lineHeight={1}>
          {dateParts.month}
        </Text>
        <Text mt={1} fontSize={{ lg: 'lg', xl: 'xl' }} color="text.secondary" fontWeight="black" lineHeight={1}>
          {dateParts.day}
        </Text>
      </Box>

      <Flex align="center" gap={{ base: 2, xl: 4 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: '58px', md: '66px', xl: '82px' }} h={{ base: '58px', md: '66px', xl: '82px' }} flexShrink={0}>
            <Image
              src={opponentLogo}
              w="100%"
              h="100%"
              objectFit="contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }} fontWeight="black" color="white" lineHeight="0.95" letterSpacing="-0.02em" lineClamp={1}>
            {opponentName}
          </Text>
        </Box>
      </Flex>

      <Flex display={{ base: 'none', lg: 'flex' }} align="center" gap={2} minW={0}>
        <LocationIcon size={17} color={opponent ? accent : '#A1A1AA'} />
        <Box minW={0}>
          <Text fontSize={{ lg: 'sm', xl: 'md' }} color="white" fontWeight="black" lineClamp={1}>
            {isAway ? 'Away' : 'Home'}
          </Text>
          <Text mt={1} fontSize={{ lg: '10px', xl: '11px' }} color="text.secondary" fontWeight="bold" lineClamp={1}>
            {venue.city}
          </Text>
          <Text mt={0.5} fontSize={{ lg: '9px', xl: '10px' }} color="text.muted" lineClamp={1}>
            {venue.stadium}
          </Text>
        </Box>
      </Flex>

      <Box display={{ base: 'none', lg: 'block' }} justifySelf="start" px={{ lg: 3, xl: 4 }} py={{ lg: 2, xl: 2.5 }} borderRadius="md" bg={opponent ? `${accent}22` : 'whiteAlpha.100'} border="1px solid" borderColor={opponent ? `${accent}88` : 'whiteAlpha.100'}>
        <Text fontSize={{ lg: '9px', xl: '10px' }} color={opponent ? accent : 'text.muted'} fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
          {tag}
        </Text>
      </Box>

      <Box justifySelf="end" borderRadius="md" bg={scoreBg} border="1px solid" borderColor={scoreBorder} px={{ base: 2, xl: 3 }} py={{ base: 2, xl: 2.5 }} minW={{ base: '74px', xl: '88px' }} textAlign="center">
        {isComplete ? (
          <>
            <Text fontSize={{ base: 'sm', xl: 'md' }} fontWeight="black" color={resultColor} lineHeight={1}>{resultLabel}</Text>
            {isCorpus && (
              <Text display={{ base: 'block', xl: 'none' }} fontSize="7px" color="text.secondary" textTransform="uppercase" fontWeight="black" mt={1}>Recap</Text>
            )}
          </>
        ) : (
          <Text fontSize={{ base: '9px', xl: '10px' }} color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">Upcoming</Text>
        )}
      </Box>

      <Flex display={{ base: 'none', xl: 'flex' }} justify="end">
        {isCorpus ? (
          <Box borderRadius="md" bg={opponent ? accent : 'brand.500'} px={3} py={2}>
            <Text fontSize="8px" color="black" fontWeight="black" textTransform="uppercase">Recap</Text>
          </Box>
        ) : (
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">No Recap</Text>
        )}
      </Flex>
    </Grid>
  );

  return inner;
};

const TeamScheduleGameRowCompact = ({ game }) => {
  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, '')}.svg` : null;
  const opponentShort = opponent?.shortName ?? (getShortOpponentName(game.opponent_name) || 'TBD');
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? '#E53E3E';
  const dateParts = fmtDateParts(game.date);
  const gameLabel = getGameLabel(game, opponent);
  const homeAway = game.home_away === 'away' ? 'Away' : 'Home';

  const won = isComplete && game.result === 'W';
  const lost = isComplete && game.result === 'L';
  const resultColor = won ? 'green.400' : lost ? 'red.400' : 'text.muted';
  const resultLabel = won
    ? `W ${game.score_team}-${game.score_opp}`
    : lost
    ? `L ${game.score_team}-${game.score_opp}`
    : null;
  const scoreBg = won ? 'rgba(34,197,94,0.16)' : lost ? 'rgba(248,113,113,0.16)' : 'whiteAlpha.100';
  const scoreBorder = won ? 'green.400' : lost ? 'red.300' : 'whiteAlpha.200';

  return (
    <Grid
      display={{ base: 'grid', lg: 'none' }}
      minH={{ base: '100px', md: '112px' }}
      templateColumns={{ base: '58px minmax(0, 1fr) 78px', md: '68px minmax(0, 1fr) 86px' }}
      alignItems="center"
      gap={{ base: 2, md: 3 }}
      px={{ base: 2, md: 3 }}
      py={{ base: 2, md: 3 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: 'whiteAlpha.50' } : {}}
      style={{ transition: 'background 0.15s' }}
    >
      {opponent && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />}

      <Flex direction="column" align="center" gap={2}>
        <Box
          w={{ base: '52px', md: '60px' }}
          px={2}
          py={1.5}
          bg={opponent ? `${accent}24` : 'whiteAlpha.100'}
          border="1px solid"
          borderColor={opponent ? `${accent}88` : 'whiteAlpha.100'}
          borderRadius="md"
          textAlign="center"
        >
          <Text fontSize={{ base: '13px', md: '14px' }} fontWeight="black" color="white" lineHeight={1}>
            W{getWeekFromGame(game) ?? '-'}
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize={{ base: '10px', md: '11px' }} color="white" fontWeight="black" lineHeight={1}>{dateParts.month}</Text>
          <Text mt={1} fontSize={{ base: '10px', md: '11px' }} color="text.secondary" fontWeight="black" lineHeight={1}>{dateParts.day}</Text>
        </Box>
      </Flex>

      <Flex align="center" gap={{ base: 2, md: 3 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: '58px', md: '68px' }} h={{ base: '58px', md: '68px' }} flexShrink={0}>
            <Image
              src={opponentLogo}
              w="100%"
              h="100%"
              objectFit="contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" color="white" lineHeight="0.92" letterSpacing="-0.02em" lineClamp={1}>
            {opponentShort}
          </Text>
          <Text mt={1} fontSize={{ base: '9px', md: '10px' }} color={opponent ? accent : 'text.muted'} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {gameLabel} / {homeAway}
          </Text>
        </Box>
      </Flex>

      <Box justifySelf="end" borderRadius="md" bg={scoreBg} border="1px solid" borderColor={scoreBorder} px={2} py={2} minW={{ base: '74px', md: '82px' }} textAlign="center">
        {isComplete ? (
          <>
            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="black" color={resultColor} lineHeight={1}>{resultLabel}</Text>
            {isCorpus && (
              <Text fontSize="7px" color="text.secondary" textTransform="uppercase" fontWeight="black" mt={1}>Recap</Text>
            )}
          </>
        ) : (
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">Upcoming</Text>
        )}
      </Box>
    </Grid>
  );
};

const GameRow = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const content = (
    <>
      <TeamScheduleGameRowCompact game={game} />
      <TeamScheduleGameRowStandard game={game} />
    </>
  );

  return isCorpus
    ? <Box as={GameLink} gameStem={game.parsed_game_stem} fromSection="team" display="block">{content}</Box>
    : content;
};

const ScheduleFilterBar = ({ activeFilter, onChange, accent, total, filteredTotal }) => (
  <Flex
    mb={4}
    gap={2}
    align="center"
    overflowX="auto"
    pb={1}
    css={{
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {SCHEDULE_FILTERS.map((filter) => {
      const active = activeFilter === filter.id;
      return (
        <Box
          key={filter.id}
          as="button"
          type="button"
          flexShrink={0}
          px={{ base: 3, md: 4 }}
          py={{ base: 2, md: 2.5 }}
          borderRadius="md"
          bg={active ? accent : 'whiteAlpha.100'}
          border="1px solid"
          borderColor={active ? accent : 'whiteAlpha.200'}
          color={active ? 'black' : 'text.secondary'}
          onClick={() => onChange(filter.id)}
          _hover={{ borderColor: accent, color: active ? 'black' : 'white' }}
          style={{ transition: 'border-color 0.15s, color 0.15s, background 0.15s' }}
        >
          <Text fontSize={{ base: '9px', md: '10px' }} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
            {filter.label}
          </Text>
        </Box>
      );
    })}
    <Text ml={2} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
      {filteredTotal} / {total}
    </Text>
  </Flex>
);


// ─────────────────────────────────────────────────────────────────────────────
// TEAM SCHEDULE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const TeamSchedulePage = () => {
  const {
    teamId,
    season,
    setSeason,
    activeFilter,
    setActiveFilter,
    handleTeamChange,
    team,
    seasonGames,
    filteredGames,
    completed,
    upcoming,
    scheduleAccent,
    isLoading,
    isError,
  } = useTeamScheduleData();

  const listContent = (
    <>

      {!teamId && null}

      {teamId && isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}

      {teamId && isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
          borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load schedule for this team.</Text>
        </Box>
      )}

      {teamId && !isLoading && !isError && seasonGames.length > 0 && (
        <>
          <ScheduleFilterBar
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            accent={scheduleAccent}
            total={seasonGames.length}
            filteredTotal={filteredGames.length}
          />

          {completed.length > 0 && (
            <Box mb={6}>
              <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
                borderRadius="xl" overflow="hidden">
                {completed.map((game, i) => (
                  <GameRow key={game.parsed_game_stem || `comp-${i}`} game={game} />
                ))}
              </Box>
            </Box>
          )}

          {upcoming.length > 0 && (
            <Box mb={6}>
              <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
                borderRadius="xl" overflow="hidden">
                {upcoming.map((game, i) => (
                  <GameRow key={game.parsed_game_stem || `up-${i}`} game={game} />
                ))}
              </Box>
            </Box>
          )}

          {filteredGames.length === 0 && (
            <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
              borderRadius="xl" p={10} textAlign="center">
              <Text fontSize="md" fontWeight="black" color="text.secondary"
                textTransform="uppercase" letterSpacing="0.1em">
                No games match this filter
              </Text>
              <Text fontSize="sm" color="text.muted" mt={2}>Try a broader schedule view.</Text>
            </Box>
          )}
        </>
      )}

      {teamId && !isLoading && !isError && seasonGames.length === 0 && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
          borderRadius="xl" p={12} textAlign="center">
          <Text fontSize="lg" fontWeight="black" color="text.muted"
            textTransform="uppercase" letterSpacing="0.1em">
            No games for {team?.shortName ?? 'this team'} in {season}
          </Text>
          <Text fontSize="sm" color="text.muted" mt={2}>Try a different season.</Text>
        </Box>
      )}
    </>
  );

  const { isMobile } = useLayoutDensity();

  // Mobile — bypasses PageShell so the banner reaches the true edge (same
  // fix as every other converted page). Only the banner itself has had the
  // mobile treatment here — BannerTeamDetailPage (shown once a team is
  // picked), TeamScheduleBannerA, and the game list below are still their
  // original desktop rendering, just stacked in a plain column for now.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {team
          ? <BannerTeamDetailPage team={team} season={season} setSeason={setSeason} />
          : <BannerTeamSchedules season={season} setSeason={setSeason} />
        }
        <TeamScheduleBannerA
          team={team}
          season={season}
          setSeason={setSeason}
          selectedId={teamId}
          onChange={handleTeamChange}
          seasonGames={seasonGames}
        />
        <Box px={4} py={4}>
          {listContent}
        </Box>
      </Box>
    );
  }

  return (
    <PageShell listContent={listContent}>


      {/* Row 1: neutral hub banner until a team is picked */}
      <PageShell.Slot cols={4}>
        {team
          ? <BannerTeamDetailPage team={team} season={season} setSeason={setSeason} />
          : <BannerTeamSchedules season={season} setSeason={setSeason} />
        }
      </PageShell.Slot>

      {/* Row 2: Team selector pills + stats panel */}
      <PageShell.Slot cols={4}>
        <TeamScheduleBannerA
          team={team}
          season={season}
          setSeason={setSeason}
          selectedId={teamId}
          onChange={handleTeamChange}
          seasonGames={seasonGames}
        />
      </PageShell.Slot>
    </PageShell>
  );
};

export default TeamSchedulePage;
