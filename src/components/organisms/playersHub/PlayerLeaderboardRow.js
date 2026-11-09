import { TEAM_BY_EXPORT, TIER_COLORS, makePlayerKey } from "../../../utils/playersHubPresentation";
import { Box, Flex, Text, Badge } from "@chakra-ui/react";

// Existing player-hub presentation, extracted without changing behavior.

export const LeaderboardRow = ({ player, rank, accent = "#E53E3E", navigate }) => {
  const teamMeta = TEAM_BY_EXPORT[player.team] ?? {};
  const tierColor = TIER_COLORS[player.transfer_tier] ?? "gray";
  const parBarWidth = `${Math.min(100, (player.par / 200) * 100)}%`;
  const isTop3 = rank <= 3;

  return (
    <Box
      bg={
        isTop3
          ? `linear-gradient(135deg, ${accent}18 0%, transparent 70%)`
          : "blackAlpha.300"
      }
      border="1px solid"
      borderColor={isTop3 ? accent + "55" : "whiteAlpha.100"}
      borderRadius="lg"
      p={3}
      position="relative"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate &&
        navigate(`/player/${makePlayerKey(player)}`, { state: { player } })
      }
      _hover={{ borderColor: isTop3 ? accent + "99" : "whiteAlpha.300" }}
      transition="border-color 0.15s"
    >
      <Flex align="center" gap={3}>
        <Box
          w="32px"
          h="32px"
          borderRadius="md"
          bg={isTop3 ? accent : "whiteAlpha.100"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Text
            fontSize="sm"
            fontWeight="black"
            color={isTop3 ? "white" : "text.muted"}
          >
            {rank}
          </Text>
        </Box>
        <Box flex={1} minW={0}>
          <Flex align="center" gap={2} mb={1} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1}>
              {player.name_display}
            </Text>
            {player.transfer_tier && (
              <Badge
                colorScheme={tierColor}
                variant="subtle"
                fontSize="8px"
                textTransform="uppercase"
              >
                {player.transfer_tier}
              </Badge>
            )}
          </Flex>
          <Flex gap={2} align="center">
            <Text fontSize="xs" color="brand.400" fontWeight="bold">
              {player.position}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {player.class_year ?? "—"}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {teamMeta.shortName ?? player.team}
            </Text>
            {player.games_played && (
              <Text fontSize="xs" color="text.muted">
                {player.games_played}G
              </Text>
            )}
          </Flex>
          <Box mt={2}>
            <Box
              h="4px"
              borderRadius="full"
              bg="whiteAlpha.100"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={parBarWidth}
                bg={`var(--chakra-colors-${tierColor}-400)`}
                transition="width 0.4s ease"
              />
            </Box>
          </Box>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text
            fontSize="lg"
            fontWeight="black"
            color={isTop3 ? accent : "white"}
            lineHeight={1}
          >
            {player.par.toFixed(1)}
          </Text>
          <Text
            fontSize="8px"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            PAR
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
