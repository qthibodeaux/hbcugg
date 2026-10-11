import React from 'react';
import { Box, Flex, Grid, Text,  Badge } from '@chakra-ui/react';
import { ArrowRight, TrendingUp, Users, GitMerge, Clock } from 'lucide-react';

// --- MOCK DATA (Extracted/Simulated from Real Patterns) ---

const MOCK_COACH_MOVEMENT = [
  {
    person_id: "PERS_00002111",
    full_name: "Lee Hull",
    from_season: 2021,
    to_season: 2022,
    from_team: "HU",
    to_team: "DSU",
    from_title: "Offensive Coordinator",
    to_title: "Head Coach",
    movement_type: "promotion_external",
  },
  {
    person_id: "PERS_00001839",
    full_name: "Vernon Hargreaves",
    from_season: 2021,
    to_season: 2022,
    from_team: "HU",
    to_team: "HU",
    from_title: "Defensive Line Coach",
    to_title: "ST Coordinator / DL Coach",
    movement_type: "promotion_internal",
  }
];

const MOCK_TREES = [
  {
    hc_name: "Deion Sanders",
    hc_team: "JSU",
    hc_years: "2020-2022",
    protégés: [
      { name: "Brett Bartolone", title: "OC", current: "Colorado (OC)", status: "ascended" },
      { name: "Tim Brewster", title: "TE", current: "Charlotte (Assistant)", status: "lateral" },
    ]
  },
  {
    hc_name: "Eddie Robinson Jr.",
    hc_team: "ASU",
    hc_years: "2022-Pres",
    protégés: [
      { name: "Duane Taylor", title: "OC", current: "ASU (OC)", status: "stable" }
    ]
  }
];

const MOCK_TENURE = [
  { name: "Fred McNair", team: "Alcorn", seasons: 8, record: "48-33", status: "Active" },
  { name: "Chennis Berry", team: "SCSU", seasons: 1, record: "0-0", status: "New Hire" },
  { name: "Bubba McDowell", team: "PVAMU", seasons: 3, record: "18-15", status: "Active" }
];

// --- COMPONENTS ---

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <Flex align="center" gap={3} mb={6}>
    <Box p={2} bg="brand.500" borderRadius="md">
      <Icon size={18} color="white" />
    </Box>
    <Box>
      <Text fontSize="xl" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="tight">
        {title}
      </Text>
      <Text fontSize="xs" color="text.muted">
        {subtitle}
      </Text>
    </Box>
  </Flex>
);

const MovementCard = ({ movement }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4} borderRadius="xl" position="relative" overflow="hidden">
    <Flex justify="space-between" align="start" mb={3}>
      <Box>
        <Text fontSize="sm" fontWeight="bold" color="text.primary">{movement.full_name}</Text>
        <Badge variant="subtle" colorScheme={movement.movement_type.includes('promotion') ? 'green' : 'blue'} fontSize="9px">
          {movement.movement_type.replace('_', ' ')}
        </Badge>
      </Box>
      <Text fontSize="10px" color="text.muted">{movement.from_season} → {movement.to_season}</Text>
    </Flex>
    
    <Flex align="center" gap={3}>
      <Box flex={1}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">{movement.from_team}</Text>
        <Text fontSize="xs" color="text.primary" lineClamp={1}>{movement.from_title}</Text>
      </Box>
      <Box color="brand.500">
        <ArrowRight size={14} />
      </Box>
      <Box flex={1}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">{movement.to_team}</Text>
        <Text fontSize="xs" color="text.primary" lineClamp={1}>{movement.to_title}</Text>
      </Box>
    </Flex>
  </Box>
);

const CoachingTreeCard = ({ tree }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4} borderRadius="xl">
    <Flex justify="space-between" align="center" mb={4}>
      <Flex align="center" gap={3}>
        <Box w={10} h={10} bg="whiteAlpha.100" borderRadius="full" display="flex" align={ "center"} justify={ "center"}>
            <Users size={20} color="#F56565" />
        </Box>
        <Box>
          <Text fontSize="md" fontWeight="black" color="brand.400">{tree.hc_name}</Text>
          <Text fontSize="xs" color="text.muted">{tree.hc_team} ({tree.hc_years})</Text>
        </Box>
      </Flex>
      <GitMerge size={16} color="#71717A" />
    </Flex>
    <Box borderLeft="2px solid" borderColor="brand.500" pl={4} ml={5}>
      {tree.protégés.map((p, i) => (
        <Flex key={i} align="center" justify="space-between" mb={2} last={{ mb: 0 }}>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="text.primary">{p.name}</Text>
            <Text fontSize="10px" color="text.muted">{p.title} → {p.current}</Text>
          </Box>
          <Badge size="sm" variant="outline" borderColor="whiteAlpha.200" color="text.muted" fontSize="8px">
            {p.status}
          </Badge>
        </Flex>
      ))}
    </Box>
  </Box>
);

const TenureRow = ({ coach, index }) => (
  <Flex align="center" p={3} bg={index % 2 === 0 ? "whiteAlpha.50" : "transparent"} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Flex flex={2} align="center" gap={3}>
      <Text fontSize="sm" fontWeight="bold" color="text.primary">{coach.name}</Text>
      <Badge colorScheme={coach.status === 'New Hire' ? 'orange' : 'gray'} fontSize="9px">{coach.team}</Badge>
    </Flex>
    <Box flex={1} textAlign="center">
      <Text fontSize="sm" fontWeight="black" color="brand.400">{coach.seasons}</Text>
    </Box>
    <Box flex={1} textAlign="right">
      <Text fontSize="xs" color="text.muted">{coach.record}</Text>
    </Box>
  </Flex>
);

export const CoachesHubExpA = () => {
    return (
        <Box bg="bg.primary" minH="100vh" p={6}>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={10}>
                
                {/* Column 1: Carousel / Movement Tracker */}
                <Box>
                    <SectionHeader 
                        icon={TrendingUp} 
                        title="Movement Tracker" 
                        subtitle="Latest promotions and lateral shifts"
                    />
                    <Grid gap={4}>
                        {MOCK_COACH_MOVEMENT.map((m, i) => (
                            <MovementCard key={i} movement={m} />
                        ))}
                    </Grid>
                </Box>

                {/* Column 2: Coaching Trees */}
                <Box>
                    <SectionHeader 
                        icon={GitMerge} 
                        title="Coaching Trees" 
                        subtitle="HC influence and assistant pipelines"
                    />
                    <Grid gap={4}>
                        {MOCK_TREES.map((t, i) => (
                            <CoachingTreeCard key={i} tree={t} />
                        ))}
                    </Grid>
                </Box>

                {/* Column 3: Longevity & Tenure */}
                <Box>
                    <SectionHeader 
                        icon={Clock} 
                        title="Program Tenure" 
                        subtitle="Longest serving active coaches"
                    />
                    <Box bg="bg.secondary" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
                        <Flex bg="whiteAlpha.100" p={2} px={3}>
                            <Text flex={2} fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase">Coach</Text>
                            <Text flex={1} fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" textAlign="center">Yrs</Text>
                            <Text flex={1} fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" textAlign="right">W-L</Text>
                        </Flex>
                        {MOCK_TENURE.map((c, i) => (
                            <TenureRow key={i} coach={c} index={i} />
                        ))}
                        <Flex p={3} justify="center" borderTop="1px solid" borderColor="whiteAlpha.100">
                             <Text fontSize="xs" color="brand.400" fontWeight="bold">View Full Registry</Text>
                        </Flex>
                    </Box>
                </Box>

            </Grid>
        </Box>
    );
};
