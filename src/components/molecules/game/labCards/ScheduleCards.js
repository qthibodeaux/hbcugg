import { DashboardCardFrame } from "../../../layouts/dashboard";
import { Text, Box, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// Retained dashboard-frame game/schedule cards and labelled lab placeholders.

export const GameSpotlightCard = ({ game, teamLabel }) => {
  if (!game) {
    return (
      <DashboardCardFrame title="Game Slot" isEmpty emptyLabel="No game assigned to this slot yet." minH="230px" />
    );
  }

  const resultLabel = game.result
    ? `${game.result} ${Number(game.score_team ?? 0)}-${Number(game.score_opp ?? 0)}`
    : "Upcoming";

  return (
    <DashboardCardFrame kicker="Games" title={teamLabel} minH="230px">
      <Text fontSize="xs" color="text.secondary" lineClamp={1}>
        vs {game.opponent_name ?? "TBD"}
      </Text>
      <Text mt={2} fontSize="xs" color="text.muted">
        {game.date ?? "TBD"}
      </Text>
      <Text mt={3} fontSize="sm" color="brand.300" fontWeight="bold">
        {resultLabel}
      </Text>
      {game.parsed_game_stem && (
        <Box mt={3}>
          <Box
            as={Link}
            to={`/game/${game.parsed_game_stem}`}
            px={3}
            py={1}
            borderRadius="md"
            bg="whiteAlpha.100"
            color="text.primary"
            fontSize="xs"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Open Feed
          </Box>
        </Box>
      )}
    </DashboardCardFrame>
  );
};

export const WeekScheduleCard = ({ weekLabel, games = [], isLoading = false, isError = false }) => {
  return (
    <DashboardCardFrame
      kicker="Week Central"
      title={weekLabel}
      isLoading={isLoading}
      error={isError ? new Error("week-load") : null}
      isEmpty={!isLoading && !isError && games.length === 0}
      emptyLabel="No games found for this week."
      minH="480px"
    >
      <Flex direction="column" gap={2}>
        {games.slice(0, 8).map((game, index) => (
          <Box key={`${game.team_id}-${game.opponent_name}-${index}`} borderLeft="2px solid" borderColor="brand.500" pl={3} py={1}>
            <Text fontSize="xs" color="text.secondary" lineClamp={1}>
              {game.team_id ?? "TEAM"} vs {game.opponent_name ?? "TBD"}
            </Text>
            <Text fontSize="10px" color="text.muted">
              {game.date ?? "TBD"}
            </Text>
          </Box>
        ))}
      </Flex>
    </DashboardCardFrame>
  );
};

export const DashgraphPlaceholderCard = ({ title, group, style = "chart" }) => {
  return (
    <DashboardCardFrame kicker={group} title={title} minH="230px">
      {style === "chart" ? (
        <Flex align="end" gap={1.5} h="120px" pt={2}>
          {[40, 65, 35, 75, 50, 82].map((height, index) => (
            <Box
              key={`${title}-${index}`}
              flex={1}
              h={`${height}%`}
              bg="whiteAlpha.200"
              borderRadius="sm"
            />
          ))}
        </Flex>
      ) : (
        <Flex direction="column" gap={2} mt={2}>
          <Text fontSize="2xl" fontWeight="black" color="brand.300" lineHeight={1}>
            --
          </Text>
          <Text fontSize="xs" color="text.secondary">
            Info tile placeholder
          </Text>
        </Flex>
      )}
    </DashboardCardFrame>
  );
};

export const ScheduleHeadlineCard = ({ title, game = null, footer = null }) => {
  if (!game) {
    return <DashboardCardFrame kicker="Games" title={title} isEmpty emptyLabel="No matchup available." minH="230px" />;
  }

  return (
    <DashboardCardFrame kicker="Games" title={title} minH="230px">
      <Text fontSize="xs" color="text.secondary" textTransform="uppercase" lineClamp={1}>
        {game.stageLabel}
      </Text>
      <Text mt={2} fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1.1} lineClamp={2}>
        {game.awayShort} vs {game.homeShort}
      </Text>
      <Text mt={2} fontSize="xs" color="text.secondary" lineClamp={1}>
        {game.dateLabel}
      </Text>
      <Text mt={3} fontSize="xs" color="brand.300" fontWeight="bold" lineClamp={1}>
        {footer ?? game.footer}
      </Text>
    </DashboardCardFrame>
  );
};

export const UpcomingStretchCard = ({ team = "TEAM", games = [], summary = "" }) => {
  return (
    <DashboardCardFrame kicker="Team Schedule" title="Upcoming Stretch" minH="230px">
      <Text fontSize="xs" color="white" fontWeight="bold" textTransform="uppercase" mb={2}>{team}</Text>
      <Flex direction="column" gap={1.5}>
        {games.slice(0, 3).map((item, index) => (
          <Text key={`${team}-stretch-${index}`} fontSize="xs" color="text.secondary" lineClamp={1}>
            {index + 1}. {item}
          </Text>
        ))}
      </Flex>
      <Text mt={3} fontSize="xs" color="brand.300" fontWeight="bold" lineClamp={2}>
        {summary}
      </Text>
    </DashboardCardFrame>
  );
};
