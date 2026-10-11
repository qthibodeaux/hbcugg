import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  TeamBadge,
  UPCOMING_STRETCH_SAMPLE,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterUpcomingStretchB = () => {
  const team = resolveTeam(UPCOMING_STRETCH_SAMPLE.teamId);
  const accent = team?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Stretch">
      <Flex h="100%" direction="column" px={3} py={3}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
            {UPCOMING_STRETCH_SAMPLE.teamLabel}
          </Text>
          <TeamBadge team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="34px" />
        </Flex>
        <Box mt={3}>
          {UPCOMING_STRETCH_SAMPLE.games.map((game, index) => (
            <Text key={`${game}-${index}`} fontSize="lg" color="white" fontWeight="black" lineHeight={1.05}>
              {game}
            </Text>
          ))}
        </Box>
        <Text mt="auto" fontSize="10px" color="text.secondary" lineClamp={2}>
          {UPCOMING_STRETCH_SAMPLE.summary}
        </Text>
      </Flex>
    </CardShell>
  );
};
