import { Flex, Text } from "@chakra-ui/react";
import {
  CardShell,
  LOOK_AHEAD_SAMPLE,
  TeamBadge,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterLookAheadB = () => {
  const away = resolveTeam(LOOK_AHEAD_SAMPLE.awayId);
  const home = resolveTeam(LOOK_AHEAD_SAMPLE.homeId);
  const accent = home?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent} kicker="Upcoming">
      <Flex h="100%" direction="column" px={3} py={3}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">{LOOK_AHEAD_SAMPLE.stageLabel}</Text>
        <Text mt={2} fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
          {LOOK_AHEAD_SAMPLE.awayLabel}
        </Text>
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
          {LOOK_AHEAD_SAMPLE.homeLabel}
        </Text>
        <Flex mt="auto" justify="space-between" align="center">
          <TeamBadge team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="32px" />
          <TeamBadge team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="32px" />
        </Flex>
        <Text mt={2} fontSize="10px" color="brand.400" fontWeight="black">{LOOK_AHEAD_SAMPLE.dateLabel}</Text>
      </Flex>
    </CardShell>
  );
};
