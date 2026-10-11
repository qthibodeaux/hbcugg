import { Box, Flex, Text } from "@chakra-ui/react";
import {
  GAME_OF_WEEK_SAMPLE,
  TeamBadge,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterGameOfWeekD = () => {
  const away = resolveTeam(GAME_OF_WEEK_SAMPLE.awayId);
  const home = resolveTeam(GAME_OF_WEEK_SAMPLE.homeId);
  const awayAccent = away?.colors?.primary ?? "#1f2937";
  const homeAccent = home?.colors?.primary ?? "#7f1d1d";

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(90deg, ${awayAccent}33 0%, rgba(11,11,13,0.96) 50%, ${homeAccent}2E 100%)`}
    >
      <WatermarkLogo team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="150px" top="16px" left="-18px" rotate="-12deg" />
      <WatermarkLogo team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="150px" top="14px" right="-18px" rotate="12deg" />

      <Box position="relative" zIndex={1} h="100%" px={4} py={4} display="flex" flexDirection="column">
        <Flex justify="space-between" align="center">
          <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Game of the Week
          </Text>
          <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase">
            {GAME_OF_WEEK_SAMPLE.stageLabel}
          </Text>
        </Flex>

        <Flex flex={1} align="center" justify="space-between" gap={4}>
          <Box maxW="38%">
            <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.85}>
              {GAME_OF_WEEK_SAMPLE.awayLabel}
            </Text>
            <Flex mt={2} align="center" gap={2}>
              <TeamBadge team={away} label={GAME_OF_WEEK_SAMPLE.awayLabel} size="38px" />
              <Text fontSize="10px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                Road contender
              </Text>
            </Flex>
          </Box>

          <Flex direction="column" align="center" minW="84px">
            <Text fontSize="4xl" color="white" fontWeight="black" lineHeight={0.8}>
              VS
            </Text>
            <Box mt={2} px={3} py={1.5} borderRadius="full" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
              <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase">
                92.4
              </Text>
            </Box>
          </Flex>

          <Box maxW="38%" textAlign="right">
            <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.85}>
              {GAME_OF_WEEK_SAMPLE.homeLabel}
            </Text>
            <Flex mt={2} align="center" justify="flex-end" gap={2}>
              <Text fontSize="10px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                Home pressure
              </Text>
              <TeamBadge team={home} label={GAME_OF_WEEK_SAMPLE.homeLabel} size="38px" />
            </Flex>
          </Box>
        </Flex>

        <Text fontSize="xs" color="brand.400" fontWeight="black" textTransform="uppercase">
          {GAME_OF_WEEK_SAMPLE.footer}
        </Text>
      </Box>
    </Box>
  );
};
