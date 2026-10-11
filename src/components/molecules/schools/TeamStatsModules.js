import React from "react";
import { Box, Table, Text, Badge, SimpleGrid, Flex } from "@chakra-ui/react";

/**
 * Philosophy: TeamStatCard and TeamIndividualLeaderCard
 * Modular analytical cards for the Stats page.
 * Logic: One card reflects program-wide rankings, the other highlights per-stat leaders.
 * Scalability: Future tiers will include trend arrows and "vs Conference Average" overlays.
 */

export const TeamRankingsCard = ({ stats }) => {
  return (
    <Box 
      bg="bg.card" 
      p={5} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      h="full"
    >
      <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={4} textTransform="uppercase" letterSpacing="wider">
        Team Rankings
      </Text>
      <Box overflowX="auto">
        <Table.Root size="sm" variant="simple">
          <Table.Header>
            <Table.Row borderColor="whiteAlpha.50">
              <Table.ColumnHeader color="text.muted" fontSize="10px">CATEGORY</Table.ColumnHeader>
              <Table.ColumnHeader color="text.muted" fontSize="10px" textAlign="right">VALUE</Table.ColumnHeader>
              <Table.ColumnHeader color="text.muted" fontSize="10px" textAlign="center">RANK</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {stats.map((stat, idx) => (
              <Table.Row key={idx} borderColor="whiteAlpha.50">
                <Table.Cell>
                  <Text fontWeight="bold" color="text.primary" fontSize="sm">{stat.category}</Text>
                  <Text fontSize="10px" color="text.muted" textTransform="uppercase">{stat.avg}</Text>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Text fontWeight="black" color="text.primary" fontSize="sm">{stat.value}</Text>
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <Badge 
                    variant="subtle"
                    colorPalette={stat.rank <= 3 ? "green" : stat.rank <= 8 ? "yellow" : "gray"}
                    fontSize="10px"
                    fontWeight="black"
                  >
                    #{stat.rank}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};

export const IndividualLeadersGrid = ({ leaders }) => {
  return (
    <Box 
      bg="bg.card" 
      p={5} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      h="full"
    >
      <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={4} textTransform="uppercase" letterSpacing="wider">
        Stat Leaders
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        {leaders.map((leader, idx) => (
          <Box key={idx} p={3} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.50">
            <Text fontSize="10px" color="text.muted" textTransform="uppercase" fontWeight="bold" mb={1}>{leader.category}</Text>
            <Flex justify="space-between" align="baseline">
              <Text fontSize="md" fontWeight="black" color="text.primary">{leader.player}</Text>
              <Badge size="xs" variant="outline" colorPalette="cyan" fontSize="9px">#{leader.rank}</Badge>
            </Flex>
            <Text fontSize="sm" color="brand.400" fontWeight="bold" mt={1}>{leader.stat}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};
