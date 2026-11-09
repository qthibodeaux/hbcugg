import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { TEAM_BY_ID, label, logo, getScheduleCellDetails, isGroupGame } from "../../../utils/seasonScheduleModel";

const TeamLogo = ({ team, size = "30px" }) => (
  <Image src={logo(team)} alt={label(team)} w={size} h={size} objectFit="contain" />
);

const GameCell = ({ game, teamId }) => {
  if (!game) return <Box minH="78px" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;
  if (game.state === "idle") return <Box minH="78px" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;

  const { opponent, isAway, hasScore, winner, score, isConf } = getScheduleCellDetails(game, teamId);

  return (
    <Box minH="78px" bg="linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
      {isAway && (
        <Text position="absolute" top="4px" left="5px" color="white" fontSize="13px" fontWeight="black" lineHeight={1}>
          @
        </Text>
      )}
      <Flex h="100%" minH="78px" align="center" justify="center" px={1.5} pb="18px">
        {opponent ? (
          <TeamLogo team={opponent} size={game.conf_game ? "34px" : "25px"} />
        ) : (
          <Text fontSize="10px" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={2}>
          {game.opponent?.short_name ?? game.opponent?.name ?? game.opponent_name}
          </Text>
        )}
      </Flex>
      {!isConf && (
        <Box position="absolute" top="4px" right="5px" px="4px" py="1px" bg="whiteAlpha.200" borderRadius="2px">
          <Text fontSize="7px" color="text.secondary" fontWeight="black">NC</Text>
        </Box>
      )}
      <Box position="absolute" left={0} right={0} bottom={0} py="2px" bg={hasScore ? winner?.colors?.primary ?? "whiteAlpha.200" : "whiteAlpha.100"}>
        <Text fontSize="10px" color="white" fontWeight="black" textAlign="center" lineHeight={1.2}>
          {score}
        </Text>
      </Box>
    </Box>
  );
};

export const SeasonScheduleGrid = ({ group, includeNonConference, model }) => {
  const teamIds = model.teamIds ?? group.teams;
  return (
    <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
      <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box>
          <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Division Board
          </Text>
          <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {group.label} Schedule
          </Text>
        </Box>
        <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
          @ = away · {includeNonConference ? "all games" : "conference only"} · weeks fixed by date
        </Text>
      </Flex>

      <Box overflow="auto" h="calc(100% - 69px)">
      <Grid templateColumns="58px repeat(6, minmax(0, 1fr))" minW="0">
          <Flex position="sticky" top={0} left={0} zIndex={4} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Week</Text>
          </Flex>
          {teamIds.map((teamId) => {
            const team = TEAM_BY_ID[teamId];
            return (
              <Flex key={teamId} position="sticky" top={0} zIndex={3} direction="column" align="center" justify="center" gap={1} minH="70px" bg="bg.secondary" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <TeamLogo team={team} size="30px" />
                <Text fontSize="9px" color="white" fontWeight="black">{label(team)}</Text>
              </Flex>
            );
          })}

          {model.weeks.map((week) => [
            <Flex key={`week-${week.week}`} position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Box minW="46px" px={2} py={1} bg="black" borderRadius="full" textAlign="center">
                <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap" lineHeight={1}>{`WK ${week.week}`}</Text>
              </Box>
            </Flex>,
            ...teamIds.map((teamId) => (
              <GameCell key={`${week.week}-${teamId}`} game={model.byTeamWeek[teamId]?.[week.week]} teamId={teamId} />
            )),
          ])}
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Mobile — the actual grid, resized ──────────────────────────────────────
// Reversed course from the swipeable-card version: this reuses desktop
// GameCell's exact visual composition (square-ish logo zone, "@" for away,
// colored score banner pinned to the bottom of the cell) rather than
// flattening into a per-team list. Bolder text, tighter padding than
// desktop ("space conscious") — square corners, no decorative pill chrome.
const MobileGameCell = ({ game, teamId }) => {
  if (!game || game.state === "idle") {
    return <Box minH="4.25rem" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;
  }

  const { opponent, isAway, hasScore, winner, score, isConf } = getScheduleCellDetails(game, teamId);

  return (
    <Box minH="4.25rem" bg="linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
      {isAway && (
        <Text position="absolute" top="0.2rem" left="0.25rem" color="white" fontSize="0.7rem" fontWeight="black" lineHeight={1}>
          @
        </Text>
      )}
      <Flex h="100%" minH="4.25rem" align="center" justify="center" px="0.15rem" pb="1.1rem">
        {opponent ? (
          <Image src={logo(opponent)} alt={label(opponent)} w={isConf ? "1.9rem" : "1.4rem"} h={isConf ? "1.9rem" : "1.4rem"} objectFit="contain" />
        ) : (
          <Text fontSize="0.55rem" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={2}>
            {game.opponent?.short_name ?? game.opponent?.name ?? game.opponent_name}
          </Text>
        )}
      </Flex>
      {!isConf && (
        <Box position="absolute" top="0.2rem" right="0.2rem" px="0.2rem" bg="whiteAlpha.200">
          <Text fontSize="0.4rem" color="text.secondary" fontWeight="black">NC</Text>
        </Box>
      )}
      <Box position="absolute" left={0} right={0} bottom={0} py="0.1rem" bg={hasScore ? winner?.colors?.primary ?? "whiteAlpha.200" : "whiteAlpha.100"}>
        <Text fontSize="0.55rem" color="white" fontWeight="black" textAlign="center" lineHeight={1.2}>
          {score}
        </Text>
      </Box>
    </Box>
  );
};

export const SeasonScheduleMobileGrid = ({ group, model, confWeeksOnly = false }) => {
  const teamIds = model.teamIds ?? group.teams;
  const weeks = confWeeksOnly
    ? model.weeks.filter((w) => teamIds.some((id) => isGroupGame(model.byTeamWeek[id]?.[w.week], teamIds)))
    : model.weeks;
  return (
  <Box overflow="auto">
    <Grid templateColumns={`2.75rem repeat(${teamIds.length}, minmax(0, 1fr))`} minW="0">
      <Flex position="sticky" top={0} left={0} zIndex={4} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100" py="0.4rem">
        <Text fontSize="0.5rem" color="text.muted" fontWeight="black" textTransform="uppercase">Wk</Text>
      </Flex>
      {teamIds.map((teamId) => {
        const team = TEAM_BY_ID[teamId];
        return (
          <Flex key={teamId} position="sticky" top={0} zIndex={3} align="center" justify="center" minH="2.75rem" bg="bg.secondary" borderBottom="1px solid" borderColor="whiteAlpha.100" p="0.2rem">
            <Image src={logo(team)} alt={label(team)} w="1.6rem" h="1.6rem" objectFit="contain" />
          </Flex>
        );
      })}

      {weeks.map((week) => [
        <Flex key={`week-${week.week}`} position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="0.6rem" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap" lineHeight={1}>
            {week.week}
          </Text>
        </Flex>,
        ...teamIds.map((teamId) => (
          <MobileGameCell key={`${week.week}-${teamId}`} game={model.byTeamWeek[teamId]?.[week.week]} teamId={teamId} />
        )),
      ])}
    </Grid>
  </Box>
  );
};

