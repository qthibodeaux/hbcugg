import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  GAME_OF_WEEK_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterGameOfWeekA = () => {
  const away = resolveTeam(GAME_OF_WEEK_SAMPLE.awayId);
  const home = resolveTeam(GAME_OF_WEEK_SAMPLE.homeId);
  const accent = home?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Games">
      <Flex h="100%" direction="column" justify="space-between" px={4} py={4}>
        <Box>
          <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
            {GAME_OF_WEEK_SAMPLE.title}
          </Text>
          <Text mt={1} fontSize="10px" color="text.muted" textTransform="uppercase">
            {GAME_OF_WEEK_SAMPLE.stageLabel} | {GAME_OF_WEEK_SAMPLE.dateLabel}
          </Text>
        </Box>

        <Flex align="center" justify="space-between" py={2}>
          <Flex align="center" gap={2}>
            <TeamBadge team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="34px" />
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">
              {GAME_OF_WEEK_SAMPLE.awayLabel}
            </Text>
          </Flex>
          <Text fontSize="2xl" color="brand.400" fontWeight="black">
            VS
          </Text>
          <Flex align="center" gap={2}>
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">
              {GAME_OF_WEEK_SAMPLE.homeLabel}
            </Text>
            <TeamBadge team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="34px" />
          </Flex>
        </Flex>

        <Text fontSize="xs" color="brand.400" fontWeight="black" textTransform="uppercase">
          {GAME_OF_WEEK_SAMPLE.footer}
        </Text>
      </Flex>
    </CardShell>
  );
};
