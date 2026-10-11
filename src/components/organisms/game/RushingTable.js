import { Box, Flex, Grid, Text } from "@chakra-ui/react";

const RushingTable = ({ players }) => (
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
              {p.rushing_yards ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">YDS</Text>
          </Box>
        </Flex>

        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.rushing_attempts ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">ATT</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.rushing_touchdowns ?? 0}
            </Text>
            <Text fontSize="9px" color="text.muted">TD</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.rushing_average ? p.rushing_average.toFixed(1) : "0.0"}
            </Text>
            <Text fontSize="9px" color="text.muted">AVG</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {p.rushing_longest ?? "-"}
            </Text>
            <Text fontSize="9px" color="text.muted">LONG</Text>
          </Box>
        </Grid>
      </Box>
    ))}
  </Box>
);

export default RushingTable;
