import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  LOOK_AHEAD_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterLookAheadA = () => {
  const away = resolveTeam(LOOK_AHEAD_SAMPLE.awayId);
  const home = resolveTeam(LOOK_AHEAD_SAMPLE.homeId);
  const accent = away?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Look Ahead">
      <Flex h="100%" direction="column" justify="space-between" px={3} py={3}>
        <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
          {LOOK_AHEAD_SAMPLE.awayLabel} at {LOOK_AHEAD_SAMPLE.homeLabel}
        </Text>
        <Flex align="center" justify="space-between">
          <TeamBadge team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="34px" />
          <Text fontSize="xl" color="brand.400" fontWeight="black">VS</Text>
          <TeamBadge team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="34px" />
        </Flex>
        <Text fontSize="10px" color="text.secondary" textTransform="uppercase" fontWeight="bold">
          {LOOK_AHEAD_SAMPLE.footer}
        </Text>
      </Flex>
    </CardShell>
  );
};
