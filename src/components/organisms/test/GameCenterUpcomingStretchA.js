import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  TeamBadge,
  UPCOMING_STRETCH_SAMPLE,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterUpcomingStretchA = () => {
  const team = resolveTeam(UPCOMING_STRETCH_SAMPLE.teamId);
  const accent = team?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Team Schedule">
      <Flex h="100%" direction="column" justify="space-between" px={3} py={3}>
        <Flex align="center" gap={2}>
          <TeamBadge team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="32px" />
          <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase">
            {UPCOMING_STRETCH_SAMPLE.title}
          </Text>
        </Flex>
        <Flex direction="column" gap={1.5}>
          {UPCOMING_STRETCH_SAMPLE.games.map((game, index) => (
            <Text key={`${game}-${index}`} fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">
              {index + 1}. {game}
            </Text>
          ))}
        </Flex>
        <Text fontSize="10px" color="brand.400" fontWeight="black">
          {UPCOMING_STRETCH_SAMPLE.summary}
        </Text>
      </Flex>
    </CardShell>
  );
};
