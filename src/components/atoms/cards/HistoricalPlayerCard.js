import { Box, Text, Flex, Badge, Grid } from "@chakra-ui/react";

/**
 * HistoricalPlayerCard - Player card for historical data view
 * @param {Object} props
 * @param {Object} props.player - Historical player data
 */
const HistoricalPlayerCard = ({ player }) => {
  const teamMeta = {}; // Would normally use TEAM_BY_EXPORT lookup
  
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
    >
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
            {player.name}
          </Text>
          <Flex align="center" gap={2} fontSize="xs" color="text.secondary">
            <Text>{player.position}</Text>
            <Text>·</Text>
            <Text>{teamMeta[player._teamId]?.shortName ?? player._teamId}</Text>
            <Text>·</Text>
            <Text>{player._year}</Text>
          </Flex>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="lg" fontWeight="black" color="brand.400">
            {player.par?.toFixed(1)}
          </Text>
          <Text fontSize="9px" color="text.muted">PAR</Text>
        </Box>
      </Flex>
      
      {/* Stats */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={3}>
        <Box textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="text.primary">
            {player.games_played || "—"}
          </Text>
          <Text fontSize="8px" color="text.muted" textTransform="uppercase">Games</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="text.primary">
            {player._classYear || "—"}
          </Text>
          <Text fontSize="8px" color="text.muted" textTransform="uppercase">Class</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="text.primary">
            {player._transferTier || "—"}
          </Text>
          <Text fontSize="8px" color="text.muted" textTransform="uppercase">Transfer</Text>
        </Box>
      </Grid>
      
      {/* Bottom badges */}
      <Flex gap={1} flexWrap="wrap">
        {player._transferTier && player._transferTier !== "HS" && (
          <Badge
            colorScheme="yellow"
            variant="subtle"
            fontSize="7px"
            px={2} py="1px"
            borderRadius="full"
            textTransform="uppercase"
          >
            {player._transferTier}
          </Badge>
        )}
        {player._classYear && (
          <Badge
            bg="whiteAlpha.100"
            color="text.secondary"
            fontSize="7px"
            px={2} py="1px"
            borderRadius="full"
            textTransform="uppercase"
          >
            {player._classYear}
          </Badge>
        )}
        <Badge
          bg="whiteAlpha.50"
          color="text.muted"
          fontSize="7px"
          px={2} py="1px"
          borderRadius="full"
        >
          {player._year}
        </Badge>
      </Flex>
    </Box>
  );
};

export default HistoricalPlayerCard;
