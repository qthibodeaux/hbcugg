import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  GAME_OF_WEEK_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterGameOfWeekB = () => {
  const away = resolveTeam(GAME_OF_WEEK_SAMPLE.awayId);
  const home = resolveTeam(GAME_OF_WEEK_SAMPLE.homeId);
  const accent = away?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Spotlight">
      <Flex h="100%" direction="column" px={4} py={4}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase" fontWeight="bold">
          {GAME_OF_WEEK_SAMPLE.stageLabel}
        </Text>
        <Text mt={2} fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
          {GAME_OF_WEEK_SAMPLE.awayLabel} at {GAME_OF_WEEK_SAMPLE.homeLabel}
        </Text>

        <Flex mt="auto" justify="space-between" align="flex-end">
          <Flex direction="column" gap={2}>
            <TeamBadge team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="40px" />
            <Text fontSize="lg" color="white" fontWeight="black">
              {GAME_OF_WEEK_SAMPLE.awayLabel}
            </Text>
          </Flex>
          <Text fontSize="3xl" color="brand.400" fontWeight="black">
            VS
          </Text>
          <Flex direction="column" gap={2} align="flex-end">
            <TeamBadge team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="40px" />
            <Text fontSize="lg" color="white" fontWeight="black">
              {GAME_OF_WEEK_SAMPLE.homeLabel}
            </Text>
          </Flex>
        </Flex>

        <Text mt={3} fontSize="xs" color="text.secondary" fontWeight="bold">
          {GAME_OF_WEEK_SAMPLE.footer}
        </Text>
      </Flex>
    </CardShell>
  );
};
