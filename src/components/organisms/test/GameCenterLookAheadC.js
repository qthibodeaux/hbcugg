import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  LOOK_AHEAD_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterLookAheadC = () => {
  const away = resolveTeam(LOOK_AHEAD_SAMPLE.awayId);
  const home = resolveTeam(LOOK_AHEAD_SAMPLE.homeId);
  const accent = away?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Games">
      <Flex h="100%" direction="column" justify="space-between" px={3} py={3}>
        <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
          Look Ahead
        </Text>
        <Flex direction="column" gap={2}>
          <Flex align="center" gap={2}>
            <TeamBadge team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="30px" />
            <Text fontSize="lg" color="white" fontWeight="black">{LOOK_AHEAD_SAMPLE.awayLabel}</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <TeamBadge team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="30px" />
            <Text fontSize="lg" color="white" fontWeight="black">{LOOK_AHEAD_SAMPLE.homeLabel}</Text>
          </Flex>
        </Flex>
        <Text fontSize="10px" color="text.secondary" textTransform="uppercase" fontWeight="bold">
          {LOOK_AHEAD_SAMPLE.footer}
        </Text>
      </Flex>
    </CardShell>
  );
};
