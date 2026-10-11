import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { House, Navigation } from "lucide-react";
import { getTeam } from "../../../utils/teamScheduleModel";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const fmtDateParts = (value) => {
  if (!value) return { month: "TBD", day: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [month, day] = String(value).split(/\s+/);
    return { month: month ?? "TBD", day: day ?? "" };
  }
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
  };
};

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getWeekFromGame = (game) => {
  if (game.week) return Number(game.week);
  return getWeekFromStem(game.parsed_game_stem);
};

const getGameLabel = (game, opponent) => {
  const raw = game.game_name ?? game.event_name ?? game.classic_name ?? game.stage_label ?? "";
  if (raw) return raw;
  if (game.bowl_game) return "Bowl Game";
  if (game.conf_game) return game.home_away === "away" ? "Road Conference" : "Conference";
  return opponent ? "HBCU Matchup" : "Schedule File";
};

const getTag = (game, opponent) => {
  if (game.bowl_game) return "BOWL";
  if (game.conf_game && opponent?.conference === "SWAC" && opponent?.division) return `SWAC ${opponent.division}`;
  if (game.conf_game) return opponent?.conference ?? "CONF";
  return "NON-CONF";
};

const getVenueDetails = (game) => {
  const source = game.location ?? game.site ?? game.venue_city ?? "";
  const stadium = game.stadium ?? "";
  const match = String(stadium).match(/^(.*?)\s*\((.*?)\)\s*$/);

  if (match) {
    return {
      city: source || match[1],
      stadium: match[2],
    };
  }

  return {
    city: source || (game.home_away === "away" ? "Away" : "Home"),
    stadium: stadium || (game.home_away === "away" ? "Road game" : "Home game"),
  };
};

const InitialMark = ({ label }) => (
  <Flex
    w={{ base: "50px", md: "58px", xl: "76px" }}
    h={{ base: "50px", md: "58px", xl: "76px" }}
    borderRadius="md"
    bg="whiteAlpha.100"
    border="1px solid"
    borderColor="whiteAlpha.200"
    align="center"
    justify="center"
    flexShrink={0}
  >
    <Text fontSize={{ base: "lg", xl: "2xl" }} fontWeight="black" color="text.secondary" lineClamp={1}>
      {label}
    </Text>
  </Flex>
);

const ScoreBox = ({ game }) => {
  const isComplete = !!game.result;
  const won = isComplete && game.result === "W";
  const lost = isComplete && game.result === "L";
  const resultColor = won ? "green.400" : lost ? "red.400" : "text.muted";
  const scoreBg = won ? "rgba(34,197,94,0.16)" : lost ? "rgba(248,113,113,0.16)" : "whiteAlpha.100";
  const scoreBorder = won ? "green.400" : lost ? "red.300" : "whiteAlpha.200";
  const resultLabel = won
    ? `W ${game.score_team}-${game.score_opp}`
    : lost
      ? `L ${game.score_team}-${game.score_opp}`
      : game.result === "T"
        ? `T ${game.score_team}-${game.score_opp}`
        : null;

  return (
    <Box
      justifySelf="end"
      borderRadius="md"
      bg={scoreBg}
      border="1px solid"
      borderColor={scoreBorder}
      px={{ base: 2, xl: 3 }}
      py={{ base: 2, xl: 2.5 }}
      minW={{ base: "74px", xl: "88px" }}
      textAlign="center"
    >
      {isComplete ? (
        <>
          <Text fontSize={{ base: "sm", xl: "md" }} fontWeight="black" color={resultColor} lineHeight={1}>
            {resultLabel}
          </Text>
          {game.has_parsed_game && game.parsed_game_stem && (
            <Text display={{ base: "block", xl: "none" }} fontSize="7px" color="text.secondary" textTransform="uppercase" fontWeight="black" mt={1}>
              Recap
            </Text>
          )}
        </>
      ) : (
        <Text fontSize={{ base: "9px", xl: "10px" }} color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">
          Upcoming
        </Text>
      )}
    </Box>
  );
};

const TeamScheduleGameRowStandard = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, "")}.svg` : null;
  const opponentName = opponent?.name ?? game.opponent_name ?? "TBD";
  const opponentShort = opponent?.shortName ?? game.opponent_name ?? "TBD";
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? "#FFFFFF";
  const dateParts = fmtDateParts(game.date);
  const tag = getTag(game, opponent);
  const venue = getVenueDetails(game);
  const week = getWeekFromGame(game) ?? "-";
  const isAway = game.home_away === "away";
  const LocationIcon = isAway ? Navigation : House;

  return (
    <Grid
      display={{ base: "none", lg: "grid" }}
      minH={{ lg: "128px", xl: "148px" }}
      templateColumns={{
        lg: "82px 72px minmax(0, 2fr) minmax(0, 1.15fr) 118px 104px",
        xl: "96px 82px minmax(0, 2.1fr) minmax(0, 1.2fr) 132px 112px 108px",
      }}
      alignItems="center"
      gap={{ base: 2, xl: 4 }}
      px={{ base: 2, md: 3, xl: 4 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: "whiteAlpha.50" } : undefined}
      style={{ transition: "background 0.15s" }}
    >
      {opponent && <Box position="absolute" left={0} top={0} bottom={0} w={{ base: "4px", xl: "5px" }} bg={accent} />}

      <Box textAlign="center">
        <Box px={2} py={{ lg: 2, xl: 2.5 }} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md">
          <Text fontSize={{ lg: "9px", xl: "10px" }} fontWeight="black" color="text.muted" lineHeight={1} textTransform="uppercase" letterSpacing="0.1em">
            Week
          </Text>
          <Text mt={1} fontSize={{ lg: "2xl", xl: "3xl" }} fontWeight="black" color="white" lineHeight={0.9}>
            {week}
          </Text>
        </Box>
      </Box>

      <Box textAlign="center">
        <Text fontSize={{ lg: "sm", xl: "md" }} color="white" fontWeight="black" lineHeight={1}>
          {dateParts.month}
        </Text>
        <Text mt={1} fontSize={{ lg: "lg", xl: "xl" }} color="text.secondary" fontWeight="black" lineHeight={1}>
          {dateParts.day}
        </Text>
      </Box>

      <Flex align="center" gap={{ base: 2, xl: 4 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: "58px", md: "66px", xl: "82px" }} h={{ base: "58px", md: "66px", xl: "82px" }} flexShrink={0}>
            <Image src={opponentLogo} w="100%" h="100%" objectFit="contain" onError={(event) => { event.target.style.display = "none"; }} />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: "2xl", md: "3xl", xl: "4xl" }} fontWeight="black" color="white" lineHeight="0.95" letterSpacing="-0.02em" lineClamp={1}>
            {opponentName}
          </Text>
        </Box>
      </Flex>

      <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2} minW={0}>
        <LocationIcon size={17} color={accent} />
        <Box minW={0}>
          <Text fontSize={{ lg: "sm", xl: "md" }} color="white" fontWeight="black" lineClamp={1}>
            {isAway ? "Away" : "Home"}
          </Text>
          <Text mt={1} fontSize={{ lg: "10px", xl: "11px" }} color="text.secondary" fontWeight="bold" lineClamp={1}>
            {venue.city}
          </Text>
          <Text mt={0.5} fontSize={{ lg: "9px", xl: "10px" }} color="text.muted" lineClamp={1}>
            {venue.stadium}
          </Text>
        </Box>
      </Flex>

      <Box display={{ base: "none", lg: "block" }} justifySelf="start" px={{ lg: 3, xl: 4 }} py={{ lg: 2, xl: 2.5 }} borderRadius="md" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
        <Text fontSize={{ lg: "9px", xl: "10px" }} color={accent} fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
          {tag}
        </Text>
      </Box>

      <ScoreBox game={game} />

      <Flex display={{ base: "none", xl: "flex" }} justify="end">
        {isCorpus ? (
          <Box borderRadius="md" bg={accent} px={3} py={2}>
            <Text fontSize="8px" color="black" fontWeight="black" textTransform="uppercase">
              Recap
            </Text>
          </Box>
        ) : (
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
            No Recap
          </Text>
        )}
      </Flex>
    </Grid>
  );
};

const TeamScheduleGameRowCompact = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const opponent = getTeam(game.opponent_id);
  const opponentLogo = opponent ? `/assets/${opponent.exportId.replace(/25$/, "")}.svg` : null;
  const opponentShort = opponent?.shortName ?? game.opponent_name ?? "TBD";
  const accent = opponent?.colors?.secondary ?? opponent?.colors?.accent ?? "#FFFFFF";
  const dateParts = fmtDateParts(game.date);
  const gameLabel = getGameLabel(game, opponent);
  const homeAway = game.home_away === "away" ? "Away" : "Home";

  return (
    <Grid
      display={{ base: "grid", lg: "none" }}
      minH={{ base: "100px", md: "112px" }}
      templateColumns={{ base: "58px minmax(0, 1fr) 78px", md: "68px minmax(0, 1fr) 86px" }}
      alignItems="center"
      gap={{ base: 2, md: 3 }}
      px={{ base: 2, md: 3 }}
      py={{ base: 2, md: 3 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.98)"
      position="relative"
      overflow="hidden"
      _hover={isCorpus ? { bg: "whiteAlpha.50" } : undefined}
      style={{ transition: "background 0.15s" }}
    >
      {opponent && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />}

      <Flex direction="column" align="center" gap={2}>
        <Box w={{ base: "52px", md: "60px" }} px={2} py={1.5} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" textAlign="center">
          <Text fontSize={{ base: "13px", md: "14px" }} fontWeight="black" color="white" lineHeight={1}>
            W{getWeekFromGame(game) ?? "-"}
          </Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize={{ base: "10px", md: "11px" }} color="white" fontWeight="black" lineHeight={1}>
            {dateParts.month}
          </Text>
          <Text mt={1} fontSize={{ base: "10px", md: "11px" }} color="text.secondary" fontWeight="black" lineHeight={1}>
            {dateParts.day}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap={{ base: 2, md: 3 }} minW={0}>
        {opponentLogo ? (
          <Box w={{ base: "58px", md: "68px" }} h={{ base: "58px", md: "68px" }} flexShrink={0}>
            <Image src={opponentLogo} w="100%" h="100%" objectFit="contain" onError={(event) => { event.target.style.display = "none"; }} />
          </Box>
        ) : (
          <InitialMark label={opponentShort.slice(0, 3)} />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="white" lineHeight="0.92" lineClamp={1}>
            {opponentShort}
          </Text>
          <Text mt={1} fontSize={{ base: "9px", md: "10px" }} color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {gameLabel} / {homeAway}
          </Text>
        </Box>
      </Flex>

      <ScoreBox game={game} />
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
    ? <Box as={Link} to={game.route ?? `/game/${game.parsed_game_stem}`} display="block">{content}</Box>
    : content;
};

const ScheduleSection = ({ label, countLabel, accent, games }) => {
  const { isMobile } = useLayoutDensity();

  return (
    <Box mb={isMobile ? 0 : 6}>
      {/* Header strip is desktop-only — on mobile it reads as chrome the
          rows don't need, and square/edge-to-edge is the mobile rule. */}
      {!isMobile && (
        <Flex align="center" gap={3} mb={3}>
          <Box w="4px" h="20px" bg={accent} borderRadius="full" />
          <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.12em">
            {label}
          </Text>
          <Text fontSize="9px" color="text.muted">
            {countLabel}
          </Text>
          <Box flex={1} h="1px" bg="whiteAlpha.100" />
        </Flex>
      )}
      <Box
        bg="bg.secondary"
        border={isMobile ? "none" : "1px solid"}
        borderColor="whiteAlpha.100"
        borderRadius={isMobile ? 0 : "xl"}
        overflow="hidden"
      >
        {games.map((game, index) => (
          <GameRow key={game.parsed_game_stem || `${label}-${index}`} game={game} />
        ))}
      </Box>
    </Box>
  );
};

export const TeamScheduleList = ({
  accent,
  seasonGames,
  completed,
  upcoming,
  team,
  season,
}) => {
  if (!seasonGames.length) {
    return (
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={12} textAlign="center">
        <Text fontSize="lg" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
          No games for {team?.shortName ?? "this team"} in {season}
        </Text>
        <Text fontSize="sm" color="text.muted" mt={2}>
          Try a different season.
        </Text>
      </Box>
    );
  }

  return (
    <>
      {completed.length > 0 && (
        <ScheduleSection label="Results" countLabel={`${completed.length} games`} accent={accent} games={completed} />
      )}

      {upcoming.length > 0 && (
        <ScheduleSection label="Upcoming" countLabel={`${upcoming.length} games remaining`} accent="whiteAlpha.300" games={upcoming} />
      )}

      {completed.length === 0 && upcoming.length === 0 && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={10} textAlign="center">
          <Text fontSize="md" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.1em">
            No schedule rows available
          </Text>
          <Text fontSize="sm" color="text.muted" mt={2}>
            Try a different season.
          </Text>
        </Box>
      )}
    </>
  );
};
