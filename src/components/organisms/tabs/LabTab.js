import { Box, SimpleGrid, Text, Flex } from "@chakra-ui/react";

// EPA by Quarter data
const EPA_BY_QUARTER = [
  { quarter: "Q1", offense: 0.15, defense: -0.08 },
  { quarter: "Q2", offense: 0.22, defense: -0.12 },
  { quarter: "Q3", offense: 0.08, defense: -0.05 },
  { quarter: "Q4", offense: 0.18, defense: -0.15 },
];

// Success Rate by Down
const SUCCESS_RATE = [
  { down: "1st", rate: 48, avgYards: 6.2 },
  { down: "2nd", rate: 52, avgYards: 5.8 },
  { down: "3rd", rate: 44, avgYards: 7.1 },
  { down: "4th", rate: 62, avgYards: 3.2 },
];

// Game Control data
const GAME_CONTROL = {
  wp60plus: 45, // % of game with WP > 60%
  avgWP: 58.2,
  comebackWins: 2,
  blownLeads: 1,
};

const LabTab = ({ team }) => {
  return (
    <Box spaceY={8}>
      <Text fontSize="xl" fontWeight="bold" color="text.primary" mb={4}>
        Advanced Analytics
      </Text>

      {/* EPA Breakdown by Quarter */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          EPA Breakdown by Quarter
        </Text>
        <Flex gap={4} justify="space-around">
          {EPA_BY_QUARTER.map((q, idx) => (
            <Box key={idx} textAlign="center" flex={1}>
              <Text fontSize="lg" fontWeight="bold" color="text.muted" mb={2}>{q.quarter}</Text>
              <Box position="relative" h="120px" display="flex" alignItems="flex-end" justifyContent="center" gap={1}>
                {/* Offense bar */}
                <Box
                  w="30px"
                  bg="brand.500"
                  borderRadius="sm"
                  h={`${(q.offense + 0.3) * 200}px`}
                  maxH="100px"
                  minH="10px"
                />
                {/* Defense bar */}
                <Box
                  w="30px"
                  bg="green.500"
                  borderRadius="sm"
                  h={`${Math.abs(q.defense) * 200}px`}
                  maxH="100px"
                  minH="10px"
                />
              </Box>
              <Flex justify="center" gap={2} mt={2}>
                <Text fontSize="xs" color="brand.500">+{q.offense}</Text>
                <Text fontSize="xs" color="text.muted">|</Text>
                <Text fontSize="xs" color="green.500">{q.defense}</Text>
              </Flex>
            </Box>
          ))}
        </Flex>
        <Flex justify="center" gap={6} mt={4}>
          <Flex align="center" gap={2}>
            <Box w={3} h={3} bg="brand.500" borderRadius="sm" />
            <Text fontSize="sm" color="text.secondary">Offense EPA</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box w={3} h={3} bg="green.500" borderRadius="sm" />
            <Text fontSize="sm" color="text.secondary">Defense EPA</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Success Rate Heatmap */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          Success Rate by Down
        </Text>
        <SimpleGrid columns={4} gap={4}>
          {SUCCESS_RATE.map((down, idx) => (
            <Box
              key={idx}
              p={4}
              bg={`rgba(229, 62, 62, ${down.rate / 100})`}
              borderRadius="lg"
              textAlign="center"
            >
              <Text fontSize="2xl" fontWeight="black" color={down.rate > 50 ? "white" : "text.primary"}>
                {down.rate}%
              </Text>
              <Text fontSize="sm" color={down.rate > 50 ? "whiteAlpha.800" : "text.muted"}>
                {down.down} Down
              </Text>
              <Text fontSize="xs" color={down.rate > 50 ? "whiteAlpha.600" : "text.muted"} mt={1}>
                Avg: {down.avgYards} yds
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Game Control Dial */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          Game Control
        </Text>
        <Flex gap={6} direction={{ base: "column", md: "row" }}>
          {/* Win Probability Gauge */}
          <Box flex={1} textAlign="center">
            <Box
              position="relative"
              w="150px"
              h="150px"
              mx="auto"
              borderRadius="full"
              border="15px solid"
              borderColor="whiteAlpha.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                position="absolute"
                w="full"
                h="full"
                borderRadius="full"
                border="15px solid"
                borderColor="brand.500"
                style={{
                  clipPath: `polygon(0 0, ${GAME_CONTROL.wp60plus}% 0, ${GAME_CONTROL.wp60plus}% 100%, 0 100%)`,
                }}
              />
              <Box>
                <Text fontSize="3xl" fontWeight="black" color="text.primary">{GAME_CONTROL.wp60plus}%</Text>
                <Text fontSize="xs" color="text.muted">Time w/ WP &gt; 60%</Text>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <SimpleGrid columns={2} gap={4} flex={1}>
            <Box p={4} bg="bg.secondary" borderRadius="lg">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Avg Win Probability</Text>
              <Text fontSize="2xl" fontWeight="bold" color="text.primary">{GAME_CONTROL.avgWP}%</Text>
            </Box>
            <Box p={4} bg="bg.secondary" borderRadius="lg">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Comeback Wins</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">{GAME_CONTROL.comebackWins}</Text>
            </Box>
            <Box p={4} bg="bg.secondary" borderRadius="lg">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Blown Leads</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">{GAME_CONTROL.blownLeads}</Text>
            </Box>
            <Box p={4} bg="bg.secondary" borderRadius="lg">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Explosive Play %</Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.500">12.8%</Text>
            </Box>
          </SimpleGrid>
        </Flex>
      </Box>
    </Box>
  );
};

export default LabTab;
