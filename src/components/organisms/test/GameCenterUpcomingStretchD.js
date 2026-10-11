import { Box, Flex, Text } from "@chakra-ui/react";
import {
  TeamBadge,
  UPCOMING_STRETCH_SAMPLE,
  WatermarkLogo,
  resolveTeam,
} from "./GameCenterQuickCardsShared";

export const GameCenterUpcomingStretchD = () => {
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
      bg={`linear-gradient(145deg, ${accent}26 0%, rgba(11,11,13,0.96) 62%, #0b0b0d 100%)`}
    >
      <WatermarkLogo team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="120px" top="50px" right="-10px" opacity={0.09} />
      <Box position="relative" zIndex={1} h="100%" px={3} py={3} display="flex" flexDirection="column">
        <Flex justify="space-between" align="center">
          <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Upcoming Stretch
          </Text>
          <TeamBadge team={team} label={UPCOMING_STRETCH_SAMPLE.teamLabel} size="30px" />
        </Flex>

        <Flex flex={1} direction="column" justify="center" gap={3}>
          {UPCOMING_STRETCH_SAMPLE.games.map((game, index) => (
            <Flex key={`${game}-${index}`} align="center" gap={2}>
              <Box w="10px" h="10px" borderRadius="full" bg="brand.500" flexShrink={0} />
              <Box flex={1} h="2px" bg="whiteAlpha.200" />
              <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase" minW="fit-content">
                {game}
              </Text>
            </Flex>
          ))}
        </Flex>

        <Text fontSize="10px" color="brand.400" fontWeight="black" lineClamp={2}>
          {UPCOMING_STRETCH_SAMPLE.summary}
        </Text>
      </Box>
    </Box>
  );
};
