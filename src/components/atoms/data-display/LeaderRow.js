import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * LeaderRow - Leaderboard entry with rank, player info, and PAR score
 * @param {Object} props
 * @param {number} props.rank - Player rank
 * @param {Object} props.player - Player data object
 */
const LeaderRow = ({ rank, player }) => {
  const teamName = player.team?.toUpperCase(); // Simplified for now
  const tierColor = "text.muted"; // Simplified for now
  
  return (
    <Flex
      align="center"
      gap={3}
      py={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      _last={{ borderBottom: "none" }}
    >
      <Box
        w={6}
        h={6}
        borderRadius="full"
        bg="brand.500"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="10px"
        fontWeight="black"
      >
        {rank}
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
          {player.name_display}
        </Text>
        <Flex gap={2} align="center" flexWrap="wrap">
          <Text fontSize="xs" color="brand.400">
            {player.position}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {teamName}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {player.class_year}
          </Text>
          {player.transfer_tier && player.transfer_tier !== "HS" && (
            <Text
              fontSize="9px"
              fontWeight="bold"
              color={tierColor}
              textTransform="uppercase"
            >
              {player.transfer_tier}
            </Text>
          )}
        </Flex>
      </Box>
      <Flex gap={4} align="center" flexShrink={0}>
        <Box textAlign="right">
          <Text
            fontSize="lg"
            fontWeight="black"
            color="text.primary"
            lineHeight="none"
          >
            {player.par?.toFixed(1)}
          </Text>
          <Text
            fontSize="9px"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            PAR
          </Text>
        </Box>
        <Box textAlign="right" display={{ base: "none", md: "block" }}>
          <Text fontSize="sm" fontWeight="bold" color="text.secondary">
            {player.games_played}G
          </Text>
          <Text fontSize="9px" color="text.muted">
            Games
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LeaderRow;
