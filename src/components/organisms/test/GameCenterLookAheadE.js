import { Box, Flex, Text } from "@chakra-ui/react";
import {
  LOOK_AHEAD_SAMPLE,
  TeamBadge,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterLookAheadE = () => {
  const away = resolveTeam(LOOK_AHEAD_SAMPLE.awayId);
  const home = resolveTeam(LOOK_AHEAD_SAMPLE.homeId);
  const homeAccent = home?.colors?.primary ?? "#E53E3E";

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(135deg, rgba(255,255,255,0.04) 0%, ${homeAccent}28 100%)`}
    >
      <WatermarkLogo team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="118px" top="40px" right="-8px" rotate="10deg" opacity={0.1} />
      <Box position="relative" zIndex={1} h="100%" px={3} py={3} display="flex" flexDirection="column">
        <Flex justify="space-between" align="center">
          <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase">
            {LOOK_AHEAD_SAMPLE.stageLabel}
          </Text>
          <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase">
            Danger Ahead
          </Text>
        </Flex>

        <Flex flex={1} direction="column" justify="center">
          <Flex align="center" gap={2}>
            <TeamBadge team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="28px" />
            <Text fontSize="xl" color="white" fontWeight="black">{LOOK_AHEAD_SAMPLE.awayLabel}</Text>
          </Flex>
          <Text mt={1} fontSize="3xl" color="brand.400" fontWeight="black" lineHeight={0.8}>
            NEXT
          </Text>
          <Flex align="center" justify="flex-end" gap={2}>
            <Text fontSize="xl" color="white" fontWeight="black">{LOOK_AHEAD_SAMPLE.homeLabel}</Text>
            <TeamBadge team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="28px" />
          </Flex>
        </Flex>

        <Text fontSize="10px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
          {LOOK_AHEAD_SAMPLE.dateLabel} | {LOOK_AHEAD_SAMPLE.footer}
        </Text>
      </Box>
    </Box>
  );
};
