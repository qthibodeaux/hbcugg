import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  TeamBadge,
  UPCOMING_STRETCH_SAMPLE,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterUpcomingStretchC = () => {
  const team = resolveTeam(UPCOMING_STRETCH_SAMPLE.teamId);
  const accent = team?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Upcoming Stretch">
      <Flex h="100%" direction="column" justify="space-between" px={3} py={3}>
        <Flex align="center" justify="space-between">
          <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase">
            {UPCOMING_STRETCH_SAMPLE.teamLabel}
          </Text>
          <TeamBadge team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="28px" />
        </Flex>
        <Flex direction="column" gap={2}>
          {UPCOMING_STRETCH_SAMPLE.games.map((game, index) => (
            <Flex key={`${game}-${index}`} justify="space-between" align="center">
              <Text fontSize="10px" color="text.muted" fontWeight="bold">
                {index + 1}
              </Text>
              <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">
                {game}
              </Text>
            </Flex>
          ))}
        </Flex>
        <Text fontSize="10px" color="brand.400" fontWeight="black" lineClamp={2}>
          {UPCOMING_STRETCH_SAMPLE.summary}
        </Text>
      </Flex>
    </CardShell>
  );
};
