import { Box, SimpleGrid, Text, Flex, Badge } from "@chakra-ui/react";

// Mock drive data
const RECENT_DRIVES = [
  { quarter: "Q1", start: "Own 25", plays: 12, yards: 75, result: "TD", time: "4:32" },
  { quarter: "Q1", start: "Own 10", plays: 8, yards: 45, result: "Punt", time: "3:15" },
  { quarter: "Q2", start: "Opp 40", plays: 6, yards: 40, result: "TD", time: "2:48" },
  { quarter: "Q2", start: "Own 35", plays: 4, yards: -5, result: "Punt", time: "1:22" },
  { quarter: "Q3", start: "Own 20", plays: 15, yards: 80, result: "TD", time: "6:45" },
  { quarter: "Q4", start: "Opp 45", plays: 7, yards: 45, result: "TD", time: "3:12" },
];

// Tendency data
const TENDENCIES = {
  overall: { run: 52, pass: 48 },
  redZone: { run: 58, pass: 42 },
  own20: { run: 45, pass: 55 },
  thirdDown: { run: 35, pass: 65 },
};

// Clutch plays
const CLUTCH_PLAYS = [
  { situation: "4th Qtr, Down 4, 3rd & 8", result: "24-yd TD Pass", wpChange: "+18%", grade: "A+" },
  { situation: "4th Qtr, Up 3, 4th & 2", result: "5-yd Rush (1st Down)", wpChange: "+12%", grade: "A" },
  { situation: "2min, Tied, 3rd & 12", result: "15-yd Completion", wpChange: "+15%", grade: "A" },
  { situation: "4th Qtr, Up 7, 3rd & 5", result: "Incomplete (Forced 4th)", wpChange: "-5%", grade: "C+" },
];

const FilmTab = ({ team }) => {
  return (
    <Box spaceY={8}>
      <Text fontSize="xl" fontWeight="bold" color="text.primary" mb={4}>
        Film Room
      </Text>

      {/* Drive Chart */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          Recent Game Drive Chart
        </Text>
        <Box spaceY={2}>
          {RECENT_DRIVES.map((drive, idx) => (
            <Flex
              key={idx}
              align="center"
              gap={4}
              p={3}
              bg="bg.secondary"
              borderRadius="lg"
              borderLeft="4px solid"
              borderLeftColor={drive.result === "TD" ? "green.500" : drive.result === "FG" ? "yellow.500" : "red.500"}
            >
              <Text fontSize="sm" fontWeight="bold" color="text.muted" w={8}>
                {drive.quarter}
              </Text>
              <Box flex={1}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="text.primary">
                    Start: {drive.start}
                  </Text>
                  <Text fontSize="sm" color={drive.result === "TD" ? "green.500" : "text.muted"}>
                    {drive.result}
                  </Text>
                </Flex>
                {/* Drive visual */}
                <Box h={2} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    bg={drive.result === "TD" ? "green.500" : drive.result === "FG" ? "yellow.500" : "red.500"}
                    w={`${Math.min((drive.yards / 100) * 100, 100)}%`}
                  />
                </Box>
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="xs" color="text.muted">{drive.plays} plays</Text>
                  <Text fontSize="xs" color="text.muted">{drive.yards} yards</Text>
                  <Text fontSize="xs" color="text.muted">{drive.time}</Text>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>

      {/* Tendency Clocks */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          Tendency Clocks
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {Object.entries(TENDENCIES).map(([key, data], idx) => (
            <Box key={idx} textAlign="center" p={4} bg="bg.secondary" borderRadius="lg">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase" mb={2}>
                {key === "own20" ? "Own 20" : key === "redZone" ? "Red Zone" : key === "thirdDown" ? "3rd Down" : "Overall"}
              </Text>
              <Box position="relative" w="80px" h="80px" mx="auto" mb={2}>
                {/* Donut chart */}
                <Box
                  w="full"
                  h="full"
                  borderRadius="full"
                  border="12px solid #E53E3E"
                  style={{
                    clipPath: `polygon(0 0, ${data.run}% 0, ${data.run}% 100%, 0 100%)`,
                  }}
                />
                <Box
                  position="absolute"
                  inset={0}
                  borderRadius="full"
                  border="12px solid #3182CE"
                  style={{
                    clipPath: `polygon(${data.run}% 0, 100% 0, 100% 100%, ${data.run}% 100%)`,
                  }}
                />
              </Box>
              <Flex justify="center" gap={3}>
                <Text fontSize="xs" color="red.500">Run {data.run}%</Text>
                <Text fontSize="xs" color="blue.500">Pass {data.pass}%</Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Clutch Factor */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
          Clutch Factor (High Leverage Plays)
        </Text>
        <Box spaceY={3}>
          {CLUTCH_PLAYS.map((play, idx) => (
            <Flex
              key={idx}
              p={4}
              bg="bg.secondary"
              borderRadius="lg"
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={2}
            >
              <Box>
                <Text fontSize="xs" color="brand.500" mb={1}>{play.situation}</Text>
                <Text fontSize="sm" fontWeight="semibold" color="text.primary">{play.result}</Text>
              </Box>
              <Flex gap={3} align="center">
                <Text fontSize="sm" color="green.500" fontWeight="bold">{play.wpChange} WP</Text>
                <Badge colorScheme={play.grade.startsWith("A") ? "green" : play.grade.startsWith("B") ? "blue" : "yellow"}>
                  {play.grade}
                </Badge>
              </Flex>
            </Flex>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FilmTab;
