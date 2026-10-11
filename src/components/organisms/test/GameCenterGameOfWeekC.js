import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  GAME_OF_WEEK_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterGameOfWeekC = () => {
  const away = resolveTeam(GAME_OF_WEEK_SAMPLE.awayId);
  const home = resolveTeam(GAME_OF_WEEK_SAMPLE.homeId);
  const accent = home?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Game of the Week">
      <Flex h="100%" direction="column" justify="space-between" px={4} py={4}>
        <Box>
          <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.88}>
            {GAME_OF_WEEK_SAMPLE.awayLabel}
          </Text>
          <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.88}>
            vs {GAME_OF_WEEK_SAMPLE.homeLabel}
          </Text>
        </Box>

        <Flex align="center" justify="space-between">
          <TeamBadge team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="44px" />
          <Text fontSize="sm" color="text.muted" fontWeight="bold" textTransform="uppercase">
            {GAME_OF_WEEK_SAMPLE.dateLabel}
          </Text>
          <TeamBadge team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="44px" />
        </Flex>

        <Text fontSize="xs" color="brand.400" fontWeight="black" textTransform="uppercase">
          {GAME_OF_WEEK_SAMPLE.footer}
        </Text>
      </Flex>
    </CardShell>
  );
};
