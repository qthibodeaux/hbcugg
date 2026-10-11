import { Box, Text, Flex, Grid } from "@chakra-ui/react";

/**
 * PassingTable - Player passing statistics table
 * @param {Object} props
 * @param {Array} props.players - Array of player passing stats
 */
const PassingTable = ({ players }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" mb={4}>
    {players.map((p, i) => (
      <Box key={i} borderTop={i > 0 ? "1px solid" : "none"} borderColor="whiteAlpha.50" p={4}>
        <Flex justify="space-between" align="flex-start" mb={3}>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.name}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {p.team}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="lg" fontWeight="black" color="text.primary">
              {p.passing_yards ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">YDS</Text>
          </Box>
        </Flex>
        
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.completions ?? 0}/{p.attempts ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">CMP/ATT</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.passing_touchdowns ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">TD</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color={p.interceptions > 0 ? "red.400" : "text.primary"}>
              {p.interceptions ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">INT</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.passer_rating ? p.passer_rating.toFixed(1) : "—"}
            </Text>
            <Text fontSize="9px" color="text.muted">RTG</Text>
          </Box>
        </Grid>
      </Box>
    ))}
  </Box>
);

export default PassingTable;
