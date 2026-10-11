import { Box, SimpleGrid, Text, Flex, Badge } from "@chakra-ui/react";
import { MapPin, Star, Users, GraduationCap } from "lucide-react";

// Hometown data by state
const HOMETOWN_DATA = [
  { state: "TX", count: 18, pct: 24 },
  { state: "LA", count: 15, pct: 20 },
  { state: "MS", count: 12, pct: 16 },
  { state: "GA", count: 10, pct: 13 },
  { state: "AL", count: 8, pct: 11 },
  { state: "FL", count: 7, pct: 9 },
  { state: "TN", count: 3, pct: 4 },
  { state: "Other", count: 2, pct: 3 },
];

// Star breakdown
const STAR_BREAKDOWN = [
  { stars: "4-Star", count: 3, contributors: 3, pct: 100 },
  { stars: "3-Star", count: 24, contributors: 18, pct: 75 },
  { stars: "2-Star", count: 40, contributors: 22, pct: 55 },
  { stars: "Unrated", count: 8, contributors: 3, pct: 38 },
];

// Class distribution
const CLASS_DISTRIBUTION = [
  { class: "Freshman", count: 22, pct: 29, starters: 2 },
  { class: "Sophomore", count: 18, pct: 24, starters: 6 },
  { class: "Junior", count: 20, pct: 27, starters: 10 },
  { class: "Senior", count: 15, pct: 20, starters: 8 },
];

const PipelineTab = ({ team }) => {
  return (
    <Box spaceY={8}>
      <Text fontSize="xl" fontWeight="bold" color="text.primary" mb={4}>
        The Pipeline
      </Text>

      {/* Geography Breakdown */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={2} mb={4}>
          <MapPin size={20} color="#E53E3E" />
          <Text fontSize="lg" fontWeight="semibold" color="text.primary">
            Hometown Map
          </Text>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {HOMETOWN_DATA.map((state, idx) => (
            <Box key={idx} p={4} bg="bg.secondary" borderRadius="lg" textAlign="center">
              <Text fontSize="3xl" fontWeight="black" color="text.primary">{state.state}</Text>
              <Text fontSize="xl" fontWeight="bold" color="brand.500">{state.count}</Text>
              <Text fontSize="xs" color="text.muted">{state.pct}% of roster</Text>
              <Box mt={2} h={2} bg="whiteAlpha.100" borderRadius="full">
                <Box h="full" bg="brand.500" w={`${state.pct}%`} borderRadius="full" />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
        <Text fontSize="sm" color="text.muted" mt={4} textAlign="center">
          Total recruiting radius: 847 miles average from {team?.location || "campus"}
        </Text>
      </Box>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Star Power */}
        <Box flex={1} bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2} mb={4}>
            <Star size={20} color="#E53E3E" />
            <Text fontSize="lg" fontWeight="semibold" color="text.primary">
              Star Power
            </Text>
          </Flex>
          <Box spaceY={3}>
            {STAR_BREAKDOWN.map((star, idx) => (
              <Box key={idx}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                    {star.stars}
                  </Text>
                  <Text fontSize="sm" color="text.muted">
                    {star.count} players ({star.pct}% contributors)
                  </Text>
                </Flex>
                <Flex gap={2} align="center">
                  <Box flex={1} h={2} bg="whiteAlpha.100" borderRadius="full">
                    <Box
                      h="full"
                      bg={idx === 0 ? "yellow.400" : idx === 1 ? "blue.400" : idx === 2 ? "gray.400" : "whiteAlpha.400"}
                      w={`${star.count / 40 * 100}%`}
                      borderRadius="full"
                    />
                  </Box>
                  <Text fontSize="xs" color="text.muted" w={20} textAlign="right">
                    {star.contributors} play
                  </Text>
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Class Balance */}
        <Box flex={1} bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2} mb={4}>
            <GraduationCap size={20} color="#E53E3E" />
            <Text fontSize="lg" fontWeight="semibold" color="text.primary">
              Class Balance
            </Text>
          </Flex>
          <SimpleGrid columns={2} gap={3}>
            {CLASS_DISTRIBUTION.map((cls, idx) => (
              <Box key={idx} p={3} bg="bg.secondary" borderRadius="lg">
                <Text fontSize="xs" color="text.muted" textTransform="uppercase">{cls.class}</Text>
                <Text fontSize="2xl" fontWeight="bold" color="text.primary">{cls.count}</Text>
                <Text fontSize="xs" color="text.muted">{cls.pct}% | {cls.starters} starters</Text>
                <Box mt={1} h={1} bg="whiteAlpha.100" borderRadius="full">
                  <Box h="full" bg={team?.colors?.primary || "brand.500"} w={`${cls.pct}%`} borderRadius="full" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
          <Box mt={4} p={3} bg="bg.secondary" borderRadius="lg">
            <Text fontSize="sm" color="text.secondary">
              <strong>Analysis:</strong> Balanced roster with strong junior class (27%). 
              Rebuild mode: <Badge colorScheme="green">No</Badge>
            </Text>
          </Box>
        </Box>
      </Flex>

      {/* Transfer Portal Summary */}
      <Box bg="bg.card" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={2} mb={4}>
          <Users size={20} color="#E53E3E" />
          <Text fontSize="lg" fontWeight="semibold" color="text.primary">
            Transfer Portal Activity
          </Text>
        </Flex>
        <Flex gap={6} wrap="wrap">
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="black" color="green.500">+8</Text>
            <Text fontSize="sm" color="text.muted">Incoming Transfers</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="black" color="red.500">-4</Text>
            <Text fontSize="sm" color="text.muted">Outgoing Transfers</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="black" color="text.primary">3</Text>
            <Text fontName="sm" color="text.muted">FBS Transfers In</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="black" color="brand.500">+4</Text>
            <Text fontSize="sm" color="text.muted">Net Portal Gain</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default PipelineTab;
