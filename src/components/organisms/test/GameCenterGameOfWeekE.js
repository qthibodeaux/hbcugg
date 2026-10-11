import { Box, Flex, Text } from "@chakra-ui/react";
import {
  GAME_OF_WEEK_SAMPLE,
  TeamBadge,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterGameOfWeekE = () => {
  const away = resolveTeam(GAME_OF_WEEK_SAMPLE.awayId);
  const home = resolveTeam(GAME_OF_WEEK_SAMPLE.homeId);
  const accent = home?.colors?.primary ?? "#E53E3E";

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(145deg, rgba(255,255,255,0.04) 0%, ${accent}25 100%)`}
    >
      <WatermarkLogo team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="130px" top="38px" left="18px" opacity={0.08} />
      <WatermarkLogo team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="130px" top="38px" right="18px" opacity={0.08} />

      <Box position="relative" zIndex={1} h="100%" px={4} py={4} display="flex" flexDirection="column">
        <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Saturday Main Event
        </Text>

        <Flex flex={1} align="center" justify="space-between" mt={2}>
          <Flex direction="column" align="center" gap={2}>
            <TeamBadge team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="46px" />
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">
              {GAME_OF_WEEK_SAMPLE.awayLabel}
            </Text>
          </Flex>

          <Box px={4} py={3} borderRadius="20px" bg="rgba(11,11,13,0.72)" border="1px solid" borderColor="whiteAlpha.200">
            <Text fontSize="3xl" color="white" fontWeight="black" lineHeight={0.8}>
              VS
            </Text>
            <Text mt={1} fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" textAlign="center">
              Must See
            </Text>
          </Box>

          <Flex direction="column" align="center" gap={2}>
            <TeamBadge team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="46px" />
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">
              {GAME_OF_WEEK_SAMPLE.homeLabel}
            </Text>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text fontSize="10px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
            {GAME_OF_WEEK_SAMPLE.dateLabel}
          </Text>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase">
            {GAME_OF_WEEK_SAMPLE.footer}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
