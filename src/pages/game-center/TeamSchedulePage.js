import { Box, Flex, Grid, Text, Spinner, Image } from '@chakra-ui/react';

import { House, Navigation } from 'lucide-react';
import PageShell from '../../components/layouts/PageShell';
import { GameLink } from '../../components/game/GameLink';
import { BannerTeamDetailPage } from '../../components/organisms/test/BannerTeamDetail';
import { BannerTeamSchedules } from "../../components/molecules/banners/TeamSchedulesBanner";
import { TeamScheduleBannerA } from '../../components/molecules/schedule/teamScheduleBanner/TeamScheduleBanner';
import { useTeamScheduleData } from '../../hooks/useTeamScheduleData';
import { getTeam, SCHEDULE_FILTERS } from '../../utils/teamScheduleModel';
import { useLayoutDensity } from '../../hooks/useLayoutDensity';
import { getShortOpponentName } from '../../utils/opponentName';

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

const getResultDetails = (game, isComplete) => {
  const won = isComplete && game.result === 'W';
  const lost = isComplete && game.result === 'L';

  return {
    resultColor: won ? 'green.400' : lost ? 'red.400' : 'text.muted',
    resultLabel: won
      ? `W ${game.score_team}-${game.score_opp}`
      : lost
      ? `L ${game.score_team}-${game.score_opp}`
      : null,
    scoreBg: won ? 'rgba(34,197,94,0.16)' : lost ? 'rgba(248,113,113,0.16)' : 'whiteAlpha.100',
    scoreBorder: won ? 'green.400' : lost ? 'red.300' : 'whiteAlpha.200',
  };
};

const buildGameRowViewModel = (game) => {
  const isComplete = !!game.result;
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);

  return {
    isComplete,
    isCorpus,
    opponent,
    opponentLogo: opponent ? `/assets/${opponent.exportId.replace(/25$/, '')}.svg` : null,
    opponentName: opponent?.name ?? game.opponent_name ?? 'TBD',
    opponentShort: opponent?.shortName ?? (getShortOpponentName(game.opponent_name) || 'TBD'),
    accent: opponent?.colors?.secondary ?? opponent?.colors?.accent ?? '#E53E3E',
    dateParts: fmtDateParts(game.date),
    gameLabel: getGameLabel(game, opponent),
    tag: getTag(game, opponent),
    venue: getVenueDetails(game),
    week: getWeekFromGame(game) ?? '-',
    isAway: game.home_away === 'away',
    homeAway: game.home_away === 'away' ? 'Away' : 'Home',
    ...getResultDetails(game, isComplete),
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

const TeamScheduleGameRowStandard = ({ row }) => {
  const LocationIcon = row.isAway ? Navigation : House;

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
      _hover={row.isCorpus ? { bg: 'whiteAlpha.50' } : {}}
      style={{ transition: 'background 0.15s' }}
    >
      {row.opponent && (
        <Box position="absolute" left={0} top={0} bottom={0} w={{ base: '4px', xl: '5px' }} bg={row.accent} />
      )}

      <Box textAlign="center">
        <Box
          px={2}
          py={{ lg: 2, xl: 2.5 }}
          bg={row.opponent ? `${row.accent}24` : 'whiteAlpha.100'}
          border="1px solid"
          borderColor={row.opponent ? `${row.accent}88` : 'whiteAlpha.100'}
          borderRadius="md"
          textAlign="center"
        >
          <Text fontSize={{ lg: '9px', xl: '10px' }} fontWeight="black" color="text.muted" lineHeight={1} textTransform="uppercase" letterSpacing="0.1em">
            Week
          </Text>
          <Text mt={1} fontSize={{ lg: '2xl', xl: '3xl' }} fontWeight="black" color="white" lineHeight={0.9}>
            {row.week}
          </Text>
        </Box>
      </Box>

      <Box textAlign="center">
        <Text fontSize={{ lg: 'sm', xl: 'md' }} color="white" fontWeight="black" lineHeight={1}>
          {row.dateParts.month}
        </Text>
        <Text mt={1} fontSize={{ lg: 'lg', xl: 'xl' }} color="text.secondary" fontWeight="black" lineHeight={1}>
          {row.dateParts.day}
        </Text>
      </Box>

      <Flex align="center" gap={{ base: 2, xl: 4 }} minW={0}>
        {row.opponentLogo ? (
          <Box w={{ base: '58px', md: '66px', xl: '82px' }} h={{ base: '58px', md: '66px', xl: '82px' }} flexShrink={0}>
            <Image
              src={row.opponentLogo}
              w="100%"
              h="100%"
              objectFit="contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        ) : (
          <InitialMark label={row.opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }} fontWeight="black" color="white" lineHeight="0.95" letterSpacing="-0.02em" lineClamp={1}>
            {row.opponentName}
          </Text>
        </Box>
      </Flex>

      <Flex display={{ base: 'none', lg: 'flex' }} align="center" gap={2} minW={0}>
        <LocationIcon size={17} color={row.opponent ? row.accent : '#A1A1AA'} />
        <Box minW={0}>
          <Text fontSize={{ lg: 'sm', xl: 'md' }} color="white" fontWeight="black" lineClamp={1}>
            {row.isAway ? 'Away' : 'Home'}
          </Text>
          <Text mt={1} fontSize={{ lg: '10px', xl: '11px' }} color="text.secondary" fontWeight="bold" lineClamp={1}>
            {row.venue.city}
          </Text>
          <Text mt={0.5} fontSize={{ lg: '9px', xl: '10px' }} color="text.muted" lineClamp={1}>
            {row.venue.stadium}
          </Text>
        </Box>
      </Flex>

      <Box display={{ base: 'none', lg: 'block' }} justifySelf="start" px={{ lg: 3, xl: 4 }} py={{ lg: 2, xl: 2.5 }} borderRadius="md" bg={row.opponent ? `${row.accent}22` : 'whiteAlpha.100'} border="1px solid" borderColor={row.opponent ? `${row.accent}88` : 'whiteAlpha.100'}>
        <Text fontSize={{ lg: '9px', xl: '10px' }} color={row.opponent ? row.accent : 'text.muted'} fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
          {row.tag}
        </Text>
      </Box>

      <Box justifySelf="end" borderRadius="md" bg={row.scoreBg} border="1px solid" borderColor={row.scoreBorder} px={{ base: 2, xl: 3 }} py={{ base: 2, xl: 2.5 }} minW={{ base: '74px', xl: '88px' }} textAlign="center">
        {row.isComplete ? (
          <>
            <Text fontSize={{ base: 'sm', xl: 'md' }} fontWeight="black" color={row.resultColor} lineHeight={1}>{row.resultLabel}</Text>
            {row.isCorpus && (
              <Text display={{ base: 'block', xl: 'none' }} fontSize="7px" color="text.secondary" textTransform="uppercase" fontWeight="black" mt={1}>Recap</Text>
            )}
          </>
        ) : (
          <Text fontSize={{ base: '9px', xl: '10px' }} color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">Upcoming</Text>
        )}
      </Box>

      <Flex display={{ base: 'none', xl: 'flex' }} justify="end">
        {row.isCorpus ? (
          <Box borderRadius="md" bg={row.opponent ? row.accent : 'brand.500'} px={3} py={2}>
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

const TeamScheduleGameRowCompact = ({ row }) => {
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
      _hover={row.isCorpus ? { bg: 'whiteAlpha.50' } : {}}
      style={{ transition: 'background 0.15s' }}
    >
      {row.opponent && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={row.accent} />}

      <Flex direction="column" align="center" gap={2}>
        <Box
          w={{ base: '52px', md: '60px' }}
          px={2}
          py={1.5}
          bg={row.opponent ? `${row.accent}24` : 'whiteAlpha.100'}
          border="1px solid"
          borderColor={row.opponent ? `${row.accent}88` : 'whiteAlpha.100'}
          borderRadius="md"
          textAlign="center"
        >
          <Text fontSize={{ base: '13px', md: '14px' }} fontWeight="black" color="white" lineHeight={1}>
            W{row.week}
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize={{ base: '10px', md: '11px' }} color="white" fontWeight="black" lineHeight={1}>{row.dateParts.month}</Text>
          <Text mt={1} fontSize={{ base: '10px', md: '11px' }} color="text.secondary" fontWeight="black" lineHeight={1}>{row.dateParts.day}</Text>
        </Box>
      </Flex>

      <Flex align="center" gap={{ base: 2, md: 3 }} minW={0}>
        {row.opponentLogo ? (
          <Box w={{ base: '58px', md: '68px' }} h={{ base: '58px', md: '68px' }} flexShrink={0}>
            <Image
              src={row.opponentLogo}
              w="100%"
              h="100%"
              objectFit="contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        ) : (
          <InitialMark label={row.opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" color="white" lineHeight="0.92" letterSpacing="-0.02em" lineClamp={1}>
            {row.opponentShort}
          </Text>
          <Text mt={1} fontSize={{ base: '9px', md: '10px' }} color={row.opponent ? row.accent : 'text.muted'} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {row.gameLabel} / {row.homeAway}
          </Text>
        </Box>
      </Flex>

      <Box justifySelf="end" borderRadius="md" bg={row.scoreBg} border="1px solid" borderColor={row.scoreBorder} px={2} py={2} minW={{ base: '74px', md: '82px' }} textAlign="center">
        {row.isComplete ? (
          <>
            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="black" color={row.resultColor} lineHeight={1}>{row.resultLabel}</Text>
            {row.isCorpus && (
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
  const row = buildGameRowViewModel(game);
  const content = (
    <>
      <TeamScheduleGameRowCompact row={row} />
      <TeamScheduleGameRowStandard row={row} />
    </>
  );

  return row.isCorpus
    ? <Box as={GameLink} gameStem={game.parsed_game_stem} fromSection="team" display="block">{content}</Box>
    : content;
};

const GameRowsSection = ({ games, keyPrefix }) => (
  <Box mb={6}>
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
      {games.map((game, i) => (
        <GameRow key={game.parsed_game_stem || `${keyPrefix}-${i}`} game={game} />
      ))}
    </Box>
  </Box>
);

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
  const hasTeam = !!teamId;
  const hasGames = seasonGames.length > 0;

  const listContent = (
    <>
      {hasTeam && isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}

      {hasTeam && isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
          borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load schedule for this team.</Text>
        </Box>
      )}

      {hasTeam && !isLoading && !isError && hasGames && (
        <>
          <ScheduleFilterBar
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            accent={scheduleAccent}
            total={seasonGames.length}
            filteredTotal={filteredGames.length}
          />

          {completed.length > 0 && (
            <GameRowsSection games={completed} keyPrefix="comp" />
          )}

          {upcoming.length > 0 && (
            <GameRowsSection games={upcoming} keyPrefix="up" />
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

      {hasTeam && !isLoading && !isError && !hasGames && (
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
