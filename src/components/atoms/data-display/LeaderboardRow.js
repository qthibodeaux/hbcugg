import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * LeaderboardRow - Leaderboard entry row with rank, player info, and PAR score
 * @param {Object} props
 * @param {Object} props.player - Player data object
 * @param {number} props.rank - Player rank
 * @param {string} props.accent - Accent color for highlights (default: "#E53E3E")
 * @param {Function} props.navigate - Navigation function
 */
const LeaderboardRow = ({ player, rank, accent = "#E53E3E", navigate }) => {
  const teamMeta = {};
  const tierColor = {};
  const parBarWidth = `${Math.min(100, (player.par / 200) * 100)}%`;
  const isTop3 = rank <= 3;

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor={isTop3 ? accent : "whiteAlpha.100"}
      borderRadius="lg"
      p={4}
      cursor="pointer"
      onClick={() =>
        navigate(
          `/player/${encodeURIComponent(`${player.name_display}__${player.team}`)}`,
        )
      }
      _hover={{
        borderColor: isTop3 ? accent : "whiteAlpha.300",
        bg: "whiteAlpha.50",
      }}
      transition="all 0.2s"
    >
      <Flex align="center" justify="space-between" gap={4}>
        {/* Rank and player info */}
        <Flex align="center" gap={3} flex={1} minW={0}>
          <Box
            w={8}
            h={8}
            borderRadius="full"
            bg={isTop3 ? accent : "whiteAlpha.100"}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="black"
          >
            {rank}
          </Box>
          <Box flex={1} minW={0}>
            <Flex align="center" gap={2} mb={1}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="text.primary"
                lineClamp={1}
              >
                {player.name_display}
              </Text>
              {player.transfer_tier && (
                <Box
                  px={2}
                  py="1px"
                  bg={tierColor[player.transfer_tier] ?? "gray"}
                  color="white"
                  fontSize="7px"
                  fontWeight="black"
                  borderRadius="full"
                  textTransform="uppercase"
                >
                  {player.transfer_tier}
                </Box>
              )}
            </Flex>
            <Flex align="center" gap={2} fontSize="xs" color="text.secondary">
              <Text>{player.position}</Text>
              <Text>·</Text>
              <Text>{teamMeta[player.team]?.shortName ?? player.team}</Text>
            </Flex>
          </Box>
        </Flex>

        {/* PAR score and bar */}
        <Box textAlign="right" flexShrink={0}>
          <Flex align="center" gap={2} mb={1}>
            <Text
              fontSize="lg"
              fontWeight="black"
              color={isTop3 ? accent : "text.primary"}
            >
              {player.par?.toFixed(1)}
            </Text>
            <Text fontSize="9px" color="text.muted">
              PAR
            </Text>
          </Flex>
          <Box
            w={20}
            h="1.5"
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              w={parBarWidth}
              bg={isTop3 ? accent : "brand.500"}
              borderRadius="full"
            />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default LeaderboardRow;
