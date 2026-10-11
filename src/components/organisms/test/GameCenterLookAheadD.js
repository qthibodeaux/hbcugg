import { Box, Flex, Text } from "@chakra-ui/react";
import {
  LOOK_AHEAD_SAMPLE,
  TeamBadge,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterLookAheadD = () => {
  const away = resolveTeam(LOOK_AHEAD_SAMPLE.awayId);
  const home = resolveTeam(LOOK_AHEAD_SAMPLE.homeId);
  const accent = away?.colors?.primary ?? "#E53E3E";

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(160deg, ${accent}26 0%, rgba(11,11,13,0.96) 58%, #0b0b0d 100%)`}
    >
      <WatermarkLogo team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="110px" top="54px" left="-12px" rotate="-16deg" opacity={0.11} />
      <Box position="absolute" right="10px" top="12px" zIndex={0}>
        <Text fontSize="64px" color="whiteAlpha.100" fontWeight="black" lineHeight={0.8}>
          NEXT
        </Text>
      </Box>

      <Box position="relative" zIndex={1} h="100%" px={3} py={3} display="flex" flexDirection="column" justifyContent="space-between">
        <Box>
          <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Look Ahead
          </Text>
          <Text mt={2} fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.88}>
            {LOOK_AHEAD_SAMPLE.awayLabel}
          </Text>
          <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
            at {LOOK_AHEAD_SAMPLE.homeLabel}
          </Text>
        </Box>

        <Flex justify="space-between" align="center">
          <TeamBadge team={away} label={LOOK_AHEAD_SAMPLE.awayLabel} size="34px" />
          <Text fontSize="10px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
            {LOOK_AHEAD_SAMPLE.footer}
          </Text>
          <TeamBadge team={home} label={LOOK_AHEAD_SAMPLE.homeLabel} size="34px" />
        </Flex>
      </Box>
    </Box>
  );
};
