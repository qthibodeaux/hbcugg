import { Box, Flex, Text } from "@chakra-ui/react";
import {
  TeamBadge,
  UPCOMING_STRETCH_SAMPLE,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterUpcomingStretchE = () => {
  const team = resolveTeam(UPCOMING_STRETCH_SAMPLE.teamId);
  const accent = team?.colors?.primary ?? "#E53E3E";

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg={`linear-gradient(180deg, rgba(255,255,255,0.04) 0%, ${accent}24 100%)`}
    >
      <Box position="absolute" left="10px" bottom="-6px" zIndex={0}>
        <Text fontSize="72px" color="whiteAlpha.100" fontWeight="black" lineHeight={0.8}>
          STRETCH
        </Text>
      </Box>
      <WatermarkLogo team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="108px" top="18px" left="-8px" rotate="-10deg" opacity={0.08} />

      <Box position="relative" zIndex={1} h="100%" px={3} py={3} display="flex" flexDirection="column" justifyContent="space-between">
        <Flex justify="space-between" align="center">
          <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase">
            Path Ahead
          </Text>
          <TeamBadge team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="28px" />
        </Flex>

        <Flex direction="column" gap={2}>
          {UPCOMING_STRETCH_SAMPLE.games.map((game, index) => (
            <Flex key={`${game}-${index}`} justify="space-between" align="center">
              <Text fontSize="9px" color="text.muted" fontWeight="bold">
                0{index + 1}
              </Text>
              <Box flex={1} h="1px" bg="whiteAlpha.200" mx={2} />
              <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase">
                {game}
              </Text>
            </Flex>
          ))}
        </Flex>

        <Text fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={2}>
          {UPCOMING_STRETCH_SAMPLE.summary}
        </Text>
      </Box>
    </Box>
  );
};
