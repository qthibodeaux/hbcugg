import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Mock data based on roster_hub_2025.json structure
const MOCK_DATA = {
  total_players: 2083,
  growth_since_2021: "+32%",
  avg_roster_size: 116,
  avg_transfer_rate: 27,
  avg_veteran_pct: 38,
  yearly_totals: [
    { year: 2021, count: 1572 },
    { year: 2022, count: 1689 },
    { year: 2023, count: 1856 },
    { year: 2024, count: 1947 },
    { year: 2025, count: 2083 }
  ]
};

// Animated sparkline component
const SparklineBar = ({ value, max, height = 40 }) => {
  const width = (value / max) * 100;
  return (
    <Box h={`${height}px`} w="full" bg="bg.secondary" borderRadius="sm" position="relative" overflow="hidden">
      <Box 
        h="full" 
        w={`${width}%`} 
        bg="brand.500" 
        borderRadius="sm"
        style={{
          animation: 'growIn 0.8s ease-out forwards'
        }}
      />
      <style jsx>{`
        @keyframes growIn {
          from { width: 0%; }
          to { width: ${width}%; }
        }
      `}</style>
    </Box>
  );
};

// Variant 18: KPI Dashboard
export const RosterCommandHeaderA = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  return (
    <Box w="full" h="full" bg="bg.secondary" borderRadius="lg" p={6} border="1px solid" borderColor="whiteAlpha.100">
      <Flex h="full" align="center" gap={8}>
        {/* Left: Large stat headline */}
        <Box flex={1}>
          <Text fontSize="3xl" fontWeight="black" textTransform="uppercase" letterSpacing="-0.02em" color="text.primary">
            {MOCK_DATA.total_players.toLocaleString()} Players
          </Text>
          <Text fontSize="lg" color="text.secondary" mt={2}>
            Across 18 Programs
          </Text>
          <Box mt={3} display="inline-block">
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color="brand.400" 
              bg="rgba(245,101,101,0.1)" 
              px={3} 
              py={1} 
              borderRadius="full"
              textTransform="uppercase"
            >
              {MOCK_DATA.growth_since_2021} since 2021
            </Text>
          </Box>
        </Box>

        {/* Center: Three KPI pills */}
        <VStack spacing={4} flex={1}>
          <Box bg="bg.card" p={4} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              Avg Roster Size
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {MOCK_DATA.avg_roster_size}
            </Text>
          </Box>
          
          <Box bg="bg.card" p={4} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              Avg Transfer Rate
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {MOCK_DATA.avg_transfer_rate}%
            </Text>
          </Box>
          
          <Box bg="bg.card" p={4} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              Avg Veteran %
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="text.primary">
              {MOCK_DATA.avg_veteran_pct}%
            </Text>
          </Box>
        </VStack>

        {/* Right: Year sparkline */}
        <Box flex={1}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
            Total Players 2021→2025
          </Text>
          <VStack spacing={2} align="stretch">
            {MOCK_DATA.yearly_totals.map((year, index) => (
              <HStack key={year.year} spacing={3}>
                <Text fontSize="xs" color="text.secondary" w="12" textAlign="right">
                  {year.year}
                </Text>
                <SparklineBar value={year.count} max={2200} height={20} />
                <Text fontSize="xs" color="text.primary" w="12">
                  {year.count}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

// Variant 19: Split Layout
export const RosterCommandHeaderB = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  return (
    <Box w="full" h="full" bg="bg.secondary" borderRadius="lg" p={6} border="1px solid" borderColor="whiteAlpha.100">
      <Flex h="full" gap={8}>
        {/* Left: Large stat with growth */}
        <Box flex={1.5} display="flex" flexDirection="column" justifyContent="center">
          <Text fontSize="4xl" fontWeight="black" textTransform="uppercase" letterSpacing="-0.02em" color="text.primary">
            {MOCK_DATA.total_players.toLocaleString()}
          </Text>
          <Text fontSize="xl" color="text.secondary" mt={1}>
            Players Across 18 HBCU Programs
          </Text>
          <Flex align="center" mt={4} gap={2}>
            <Box w="4px" h="4px" bg="brand.500" borderRadius="full" />
            <Text fontSize="lg" fontWeight="bold" color="brand.400">
              {MOCK_DATA.growth_since_2021} growth since 2021
            </Text>
          </Flex>
        </Box>

        {/* Right: Stacked KPIs with mini sparkline */}
        <VStack spacing={3} flex={1} justify="center">
          <HStack bg="bg.card" p={3} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Box flex={1}>
              <Text fontSize="xs" color="text.muted">Roster Size</Text>
              <Text fontSize="xl" fontWeight="bold">{MOCK_DATA.avg_roster_size}</Text>
            </Box>
            <Box w="16">
              <SparklineBar value={MOCK_DATA.avg_roster_size} max={150} height={8} />
            </Box>
          </HStack>
          
          <HStack bg="bg.card" p={3} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Box flex={1}>
              <Text fontSize="xs" color="text.muted">Transfer Rate</Text>
              <Text fontSize="xl" fontWeight="bold">{MOCK_DATA.avg_transfer_rate}%</Text>
            </Box>
            <Box w="16">
              <SparklineBar value={MOCK_DATA.avg_transfer_rate} max={50} height={8} />
            </Box>
          </HStack>
          
          <HStack bg="bg.card" p={3} borderRadius="md" w="full" border="1px solid" borderColor="whiteAlpha.50">
            <Box flex={1}>
              <Text fontSize="xs" color="text.muted">Veteran %</Text>
              <Text fontSize="xl" fontWeight="bold">{MOCK_DATA.avg_veteran_pct}%</Text>
            </Box>
            <Box w="16">
              <SparklineBar value={MOCK_DATA.avg_veteran_pct} max={60} height={8} />
            </Box>
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
};

// Variant 20: Compact Cards
export const RosterCommandHeaderC = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  const Card = ({ title, value, subtitle, delta }) => (
    <Box 
      bg="bg.card" 
      p={6} 
      borderRadius="lg" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      h="full"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Accent border */}
      <Box position="absolute" top={0} left={0} w="4px" h="full" bg="brand.500" />
      
      <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
        {title}
      </Text>
      <Text fontSize="3xl" fontWeight="black" color="text.primary" lineHeight="1">
        {value}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="text.secondary" mt={1}>
          {subtitle}
        </Text>
      )}
      {delta && (
        <Box mt={3} display="inline-block">
          <Text 
            fontSize="xs" 
            fontWeight="bold" 
            color={delta.startsWith('+') ? 'brand.400' : 'text.muted'}
            bg={delta.startsWith('+') ? 'rgba(245,101,101,0.1)' : 'transparent'}
            px={2} 
            py={1} 
            borderRadius="sm"
          >
            {delta}
          </Text>
        </Box>
      )}
    </Box>
  );
  
  return (
    <Box w="full" h="full" p={4}>
      <HStack gap={4} h="full">
        <Card 
          title="Total Players"
          value={MOCK_DATA.total_players.toLocaleString()}
          subtitle="Across 18 Programs"
          delta={MOCK_DATA.growth_since_2021}
        />
        <Card 
          title="Avg Roster Size"
          value={MOCK_DATA.avg_roster_size}
          subtitle="Per Program"
        />
        <Card 
          title="Transfer Rate"
          value={`${MOCK_DATA.avg_transfer_rate}%`}
          subtitle="League Average"
        />
      </HStack>
    </Box>
  );
};
