import {
  Box,
  // eslint-disable-next-line no-unused-vars
  Flex,
  Text,
  VStack,
  HStack,
  // eslint-disable-next-line no-unused-vars
  Spacer,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for teams and divisions
const MOCK_TEAMS = [
  { id: "all", name: "All 18 Programs", division: "ALL" },
  { id: "swac", name: "SWAC Conference", division: "SWAC" },
  { id: "meac", name: "MEAC Conference", division: "MEAC" },
  { id: "jsu", name: "Jackson State", division: "SWAC" },
  { id: "su", name: "Southern", division: "SWAC" },
  { id: "pvamu", name: "Prairie View", division: "SWAC" },
  { id: "dsu", name: "Delaware State", division: "MEAC" },
  { id: "ncat", name: "North Carolina A&T", division: "MEAC" },
];

// Mock data modules
const MOCK_DATA = {
  composition: {
    position_distribution: [
      { group: "OL", count_a: 18, count_b: 16, pct_a: 15.5, pct_b: 14.2 },
      { group: "DB", count_a: 22, count_b: 20, pct_a: 18.9, pct_b: 17.8 },
      { group: "DL", count_a: 16, count_b: 18, pct_a: 13.8, pct_b: 16.0 },
      { group: "WR_TE", count_a: 20, count_b: 19, pct_a: 17.2, pct_b: 16.9 },
      { group: "RB", count_a: 12, count_b: 11, pct_a: 10.3, pct_b: 9.8 },
      { group: "LB", count_a: 15, count_b: 14, pct_a: 12.9, pct_b: 12.5 },
      { group: "QB", count_a: 4, count_b: 5, pct_a: 3.4, pct_b: 4.4 },
      { group: "ST", count_a: 9, count_b: 10, pct_a: 7.8, pct_b: 8.9 },
    ],
    class_distribution: [
      { class: "Fr", count_a: 28, count_b: 25, pct_a: 24.1, pct_b: 22.3 },
      { class: "So", count_a: 27, count_b: 26, pct_a: 23.3, pct_b: 23.2 },
      { class: "Jr", count_a: 31, count_b: 29, pct_a: 26.7, pct_b: 25.9 },
      { class: "Sr", count_a: 24, count_b: 27, pct_a: 20.7, pct_b: 24.1 },
      { class: "Gr", count_a: 6, count_b: 5, pct_a: 5.2, pct_b: 4.5 },
    ],
    total_players_a: 116,
    total_players_b: 112,
    upperclass_pct_a: 52.6,
    upperclass_pct_b: 54.5,
  },
  experience: {
    veteran_pct_a: 25.9,
    veteran_pct_b: 28.6,
    pyramid_a: [
      { class: "Fr", pct: 24.1 },
      { class: "So", pct: 23.3 },
      { class: "Jr", pct: 26.7 },
      { class: "Sr", pct: 20.7 },
      { class: "Gr", pct: 5.2 },
    ],
    pyramid_b: [
      { class: "Fr", pct: 22.3 },
      { class: "So", pct: 23.2 },
      { class: "Jr", pct: 25.9 },
      { class: "Sr", pct: 24.1 },
      { class: "Gr", pct: 4.5 },
    ],
  },
  physical: {
    by_position_group: {
      OL: {
        height_avg_a: 75,
        weight_avg_a: 310,
        height_avg_b: 74,
        weight_avg_b: 305,
      },
      DB: {
        height_avg_a: 71,
        weight_avg_a: 185,
        height_avg_b: 72,
        weight_avg_b: 190,
      },
      DL: {
        height_avg_a: 74,
        weight_avg_a: 285,
        height_avg_b: 75,
        weight_avg_b: 292,
      },
      WR_TE: {
        height_avg_a: 73,
        weight_avg_a: 205,
        height_avg_b: 73,
        weight_avg_b: 208,
      },
      RB: {
        height_avg_a: 70,
        weight_avg_a: 195,
        height_avg_b: 71,
        weight_avg_b: 198,
      },
      LB: {
        height_avg_a: 73,
        weight_avg_a: 225,
        height_avg_b: 73,
        weight_avg_b: 228,
      },
    },
  },
  transfers: {
    transfer_rate_a: 28,
    transfer_rate_b: 32,
    tier_breakdown_a: [
      { tier: "FBS", count: 8, pct: 25.0 },
      { tier: "FCS", count: 12, pct: 37.5 },
      { tier: "JUCO", count: 8, pct: 25.0 },
      { tier: "D2", count: 4, pct: 12.5 },
    ],
    tier_breakdown_b: [
      { tier: "FBS", count: 12, pct: 33.3 },
      { tier: "FCS", count: 10, pct: 27.8 },
      { tier: "JUCO", count: 10, pct: 27.8 },
      { tier: "D2", count: 4, pct: 11.1 },
    ],
  },
  geographic: {
    top_states_a: [
      { state: "Louisiana", count: 35 },
      { state: "Texas", count: 28 },
      { state: "Mississippi", count: 22 },
      { state: "Alabama", count: 18 },
      { state: "Georgia", count: 13 },
    ],
    top_states_b: [
      { state: "Texas", count: 42 },
      { state: "Florida", count: 31 },
      { state: "Georgia", count: 24 },
      { state: "Louisiana", count: 15 },
      { state: "Alabama", count: 12 },
    ],
    avg_distance_a: 285,
    avg_distance_b: 342,
    in_state_pct_a: 42,
    in_state_pct_b: 28,
  },
};

// Custom Tab Components
const CustomTab = ({ label, isActive, onClick, color = "brand.500" }) => (
  <Button
    size="sm"
    bg={isActive ? color : "bg.card"}
    color={isActive ? "white" : "text.primary"}
    border="1px solid"
    borderColor={isActive ? color : "whiteAlpha.200"}
    onClick={onClick}
    _hover={{
      bg: isActive ? color : "whiteAlpha.200",
      color: isActive ? "white" : "text.primary",
    }}
    px={4}
    py={2}
    fontSize="sm"
  >
    {label}
  </Button>
);

const CustomTabPanel = ({ children, isActive }) => (
  <Box display={isActive ? "block" : "none"}>{children}</Box>
);

// Helper components
const HorizontalBar = ({ value, max, color = "brand.500", height = 24 }) => {
  const width = (value / max) * 100;
  return (
    <Box
      h={`${height}px`}
      w="full"
      bg="bg.secondary"
      borderRadius="sm"
      position="relative"
    >
      <Box h="full" w={`${width}%`} bg={color} borderRadius="sm" />
    </Box>
  );
};

// eslint-disable-next-line no-unused-vars
const StackedBar = ({ segments, height = 24 }) => {
  let accumulatedWidth = 0;
  return (
    <Box
      h={`${height}px`}
      w="full"
      bg="bg.secondary"
      borderRadius="sm"
      position="relative"
      overflow="hidden"
    >
      {segments.map((segment, index) => {
        const width = segment.pct;
        const left = accumulatedWidth;
        accumulatedWidth += width;
        return (
          <Box
            key={index}
            position="absolute"
            left={`${left}%`}
            w={`${width}%`}
            h="full"
            bg={segment.color}
          />
        );
      })}
    </Box>
  );
};

// Variant 21: Classic Tabs
export const RosterComparatorA = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [selectedA, setSelectedA] = useState("all");
  const [selectedB, setSelectedB] = useState("swac");
  const [activeTab, setActiveTab] = useState(0);
  const tabNames = [
    "Composition",
    "Experience",
    "Physical",
    "Transfers",
    "Geographic",
  ];

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      p={6}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack h="full" spacing={4}>
        {/* Selectors */}
        <HStack w="full" gap={4}>
          <Box flex={1}>
            <Text
              fontSize="xs"
              color="text.muted"
              mb={2}
              textTransform="uppercase"
            >
              Panel A
            </Text>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "var(--chakra-colors-bg-card)",
                border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                borderRadius: "6px",
                color: "var(--chakra-colors-text-primary)",
              }}
            >
              {MOCK_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </Box>
          <Box flex={1}>
            <Text
              fontSize="xs"
              color="text.muted"
              mb={2}
              textTransform="uppercase"
            >
              Panel B
            </Text>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "var(--chakra-colors-bg-card)",
                border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                borderRadius: "6px",
                color: "var(--chakra-colors-text-primary)",
              }}
            >
              {MOCK_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </Box>
        </HStack>

        {/* Custom Tabs */}
        <VStack w="full" flex={1}>
          {/* Tab Navigation */}
          <HStack bg="bg.card" borderRadius="md" p={1} gap={2}>
            {tabNames.map((name, index) => (
              <CustomTab
                key={name}
                label={name}
                isActive={activeTab === index}
                onClick={() => setActiveTab(index)}
              />
            ))}
          </HStack>

          {/* Tab Content */}
          <Box flex={1}>
            <CustomTabPanel isActive={activeTab === 0}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                  Position Distribution
                </Text>
                {MOCK_DATA.composition.position_distribution.map((pos) => (
                  <HStack key={pos.group}>
                    <Text w="12" fontSize="xs">
                      {pos.group}
                    </Text>
                    <Box flex={1}>
                      <HStack gap={2}>
                        <HorizontalBar
                          value={pos.pct_a}
                          max={25}
                          color="brand.500"
                        />
                        <Text fontSize="xs" w="8">
                          {pos.pct_a}%
                        </Text>
                        <HorizontalBar
                          value={pos.pct_b}
                          max={25}
                          color="blue.500"
                        />
                        <Text fontSize="xs" w="8">
                          {pos.pct_b}%
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </CustomTabPanel>

            <CustomTabPanel isActive={activeTab === 1}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Box flex={1} textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                      {MOCK_DATA.experience.veteran_pct_a}%
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      Veteran % (A)
                    </Text>
                  </Box>
                  <Box flex={1} textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                      {MOCK_DATA.experience.veteran_pct_b}%
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      Veteran % (B)
                    </Text>
                  </Box>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                  Class Pyramid
                </Text>
                {MOCK_DATA.experience.pyramid_a.map((level, index) => (
                  <HStack key={level.class}>
                    <Text w="12" fontSize="xs">
                      {level.class}
                    </Text>
                    <HorizontalBar
                      value={level.pct}
                      max={30}
                      color="brand.500"
                    />
                    <Text fontSize="xs" w="8">
                      {level.pct}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CustomTabPanel>

            <CustomTabPanel isActive={activeTab === 2}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                  Physical Profile by Position
                </Text>
                {Object.entries(MOCK_DATA.physical.by_position_group).map(
                  ([pos, data]) => (
                    <Box key={pos}>
                      <Text fontSize="xs" fontWeight="bold" mb={2}>
                        {pos}
                      </Text>
                      <HStack>
                        <Box flex={1}>
                          <Text fontSize="xs">
                            H: {data.height_avg_a}" W: {data.weight_avg_a}lbs
                          </Text>
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="xs">
                            H: {data.height_avg_b}" W: {data.weight_avg_b}lbs
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  ),
                )}
              </VStack>
            </CustomTabPanel>

            <CustomTabPanel isActive={activeTab === 3}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Box flex={1} textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                      {MOCK_DATA.transfers.transfer_rate_a}%
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      Transfer Rate (A)
                    </Text>
                  </Box>
                  <Box flex={1} textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                      {MOCK_DATA.transfers.transfer_rate_b}%
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      Transfer Rate (B)
                    </Text>
                  </Box>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                  Tier Breakdown
                </Text>
                {MOCK_DATA.transfers.tier_breakdown_a.map((tier, index) => (
                  <HStack key={tier.tier}>
                    <Text w="12" fontSize="xs">
                      {tier.tier}
                    </Text>
                    <HorizontalBar
                      value={tier.pct}
                      max={40}
                      color="brand.500"
                    />
                    <Text fontSize="xs" w="8">
                      {tier.pct}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CustomTabPanel>

            <CustomTabPanel isActive={activeTab === 4}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                  Top Recruiting States
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      mb={2}
                      color="brand.500"
                    >
                      Panel A
                    </Text>
                    {MOCK_DATA.geographic.top_states_a.map((state, index) => (
                      <HStack key={state.state} mb={1}>
                        <Text fontSize="xs" w="4">
                          {index + 1}.
                        </Text>
                        <Text fontSize="xs" flex={1}>
                          {state.state}
                        </Text>
                        <Text fontSize="xs">{state.count}</Text>
                      </HStack>
                    ))}
                  </Box>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      mb={2}
                      color="blue.500"
                    >
                      Panel B
                    </Text>
                    {MOCK_DATA.geographic.top_states_b.map((state, index) => (
                      <HStack key={state.state} mb={1}>
                        <Text fontSize="xs" w="4">
                          {index + 1}.
                        </Text>
                        <Text fontSize="xs" flex={1}>
                          {state.state}
                        </Text>
                        <Text fontSize="xs">{state.count}</Text>
                      </HStack>
                    ))}
                  </Box>
                </SimpleGrid>
              </VStack>
            </CustomTabPanel>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export const RosterComparatorB = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [selectedA, setSelectedA] = useState("all");
  const [selectedB, setSelectedB] = useState("swac");

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      p={6}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack h="full" spacing={4}>
        {/* Selectors */}
        <HStack w="full" gap={4}>
          <Box flex={1}>
            <Text
              fontSize="xs"
              color="text.muted"
              mb={2}
              textTransform="uppercase"
            >
              Panel A
            </Text>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "var(--chakra-colors-bg-card)",
                border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                borderRadius: "6px",
                color: "var(--chakra-colors-text-primary)",
              }}
            >
              {MOCK_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </Box>
          <Box flex={1}>
            <Text
              fontSize="xs"
              color="text.muted"
              mb={2}
              textTransform="uppercase"
            >
              Panel B
            </Text>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "var(--chakra-colors-bg-card)",
                border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                borderRadius: "6px",
                color: "var(--chakra-colors-text-primary)",
              }}
            >
              {MOCK_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </Box>
        </HStack>

        {/* Split panels with simple data */}
        <HStack w="full" flex={1} gap={4}>
          {/* Panel A */}
          <Box flex={1} bg="bg.card" borderRadius="md" p={4}>
            <Text fontSize="sm" fontWeight="bold" mb={4} color="brand.500">
              Panel A Data
            </Text>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Total Players
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {MOCK_DATA.composition.total_players_a}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Veteran %
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  {MOCK_DATA.experience.veteran_pct_a}%
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Transfer Rate
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  {MOCK_DATA.transfers.transfer_rate_a}%
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Panel B */}
          <Box flex={1} bg="bg.card" borderRadius="md" p={4}>
            <Text fontSize="sm" fontWeight="bold" mb={4} color="blue.500">
              Panel B Data
            </Text>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Total Players
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {MOCK_DATA.composition.total_players_b}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Veteran %
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {MOCK_DATA.experience.veteran_pct_b}%
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  Transfer Rate
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {MOCK_DATA.transfers.transfer_rate_b}%
                </Text>
              </Box>
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};

// Variant 23: Overlay Mode
export const RosterComparatorC = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [selectedA, setSelectedA] = useState("all");
  const [selectedB, setSelectedB] = useState("swac");
  const [viewMode, setViewMode] = useState("A"); // 'A', 'B', or 'diff'

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      p={6}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack h="full" spacing={4}>
        {/* Controls */}
        <HStack w="full" justify="space-between">
          <HStack gap={4}>
            <Box>
              <Text
                fontSize="xs"
                color="text.muted"
                mb={2}
                textTransform="uppercase"
              >
                Team A
              </Text>
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                style={{
                  padding: "8px",
                  background: "var(--chakra-colors-bg-card)",
                  border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                  borderRadius: "6px",
                  color: "var(--chakra-colors-text-primary)",
                }}
              >
                {MOCK_TEAMS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Text
                fontSize="xs"
                color="text.muted"
                mb={2}
                textTransform="uppercase"
              >
                Team B
              </Text>
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                style={{
                  padding: "8px",
                  background: "var(--chakra-colors-bg-card)",
                  border: "1px solid var(--chakra-colors-whiteAlpha.200)",
                  borderRadius: "6px",
                  color: "var(--chakra-colors-text-primary)",
                }}
              >
                {MOCK_TEAMS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </Box>
          </HStack>

          <HStack gap={2}>
            <Button
              size="sm"
              bg={viewMode === "A" ? "brand.500" : "bg.card"}
              color={viewMode === "A" ? "white" : "text.primary"}
              onClick={() => setViewMode("A")}
            >
              Team A
            </Button>
            <Button
              size="sm"
              bg={viewMode === "B" ? "blue.500" : "bg.card"}
              color={viewMode === "B" ? "white" : "text.primary"}
              onClick={() => setViewMode("B")}
            >
              Team B
            </Button>
            <Button
              size="sm"
              bg={viewMode === "diff" ? "purple.500" : "bg.card"}
              color={viewMode === "diff" ? "white" : "text.primary"}
              onClick={() => setViewMode("diff")}
            >
              Delta
            </Button>
          </HStack>
        </HStack>

        {/* Single Panel with Simple Data Display */}
        <Box flex={1} w="full" bg="bg.card" borderRadius="md" p={6}>
          <VStack spacing={6} align="stretch">
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              {viewMode === "A" && "Team A - Overview"}
              {viewMode === "B" && "Team B - Overview"}
              {viewMode === "diff" && "Team Comparison"}
            </Text>

            {viewMode === "diff" ? (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box bg="bg.secondary" p={4} borderRadius="md">
                    <Text fontSize="sm" color="text.muted" mb={2}>
                      Team A
                    </Text>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="xs">
                        Players: {MOCK_DATA.composition.total_players_a}
                      </Text>
                      <Text fontSize="xs">
                        Veteran: {MOCK_DATA.experience.veteran_pct_a}%
                      </Text>
                      <Text fontSize="xs">
                        Transfers: {MOCK_DATA.transfers.transfer_rate_a}%
                      </Text>
                    </VStack>
                  </Box>
                  <Box bg="bg.secondary" p={4} borderRadius="md">
                    <Text fontSize="sm" color="text.muted" mb={2}>
                      Team B
                    </Text>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="xs">
                        Players: {MOCK_DATA.composition.total_players_b}
                      </Text>
                      <Text fontSize="xs">
                        Veteran: {MOCK_DATA.experience.veteran_pct_b}%
                      </Text>
                      <Text fontSize="xs">
                        Transfers: {MOCK_DATA.transfers.transfer_rate_b}%
                      </Text>
                    </VStack>
                  </Box>
                </SimpleGrid>

                <Box bg="bg.secondary" p={4} borderRadius="md">
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={3}
                    color="text.muted"
                  >
                    Delta Comparison
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="xs">Player Difference</Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={
                          MOCK_DATA.composition.total_players_a >
                          MOCK_DATA.composition.total_players_b
                            ? "brand.400"
                            : "blue.400"
                        }
                      >
                        {MOCK_DATA.composition.total_players_a -
                          MOCK_DATA.composition.total_players_b >
                        0
                          ? "+"
                          : ""}
                        {MOCK_DATA.composition.total_players_a -
                          MOCK_DATA.composition.total_players_b}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="xs">Veteran % Difference</Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={
                          MOCK_DATA.experience.veteran_pct_a >
                          MOCK_DATA.experience.veteran_pct_b
                            ? "brand.400"
                            : "blue.400"
                        }
                      >
                        {MOCK_DATA.experience.veteran_pct_a -
                          MOCK_DATA.experience.veteran_pct_b >
                        0
                          ? "+"
                          : ""}
                        {MOCK_DATA.experience.veteran_pct_a -
                          MOCK_DATA.experience.veteran_pct_b}
                        %
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="xs">Transfer Rate Difference</Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={
                          MOCK_DATA.transfers.transfer_rate_a >
                          MOCK_DATA.transfers.transfer_rate_b
                            ? "brand.400"
                            : "blue.400"
                        }
                      >
                        {MOCK_DATA.transfers.transfer_rate_a -
                          MOCK_DATA.transfers.transfer_rate_b >
                        0
                          ? "+"
                          : ""}
                        {MOCK_DATA.transfers.transfer_rate_a -
                          MOCK_DATA.transfers.transfer_rate_b}
                        %
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            ) : (
              <SimpleGrid columns={3} spacing={4}>
                <Box
                  bg="bg.secondary"
                  p={4}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text fontSize="xs" color="text.muted" mb={2}>
                    Total Players
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={viewMode === "A" ? "brand.500" : "blue.500"}
                  >
                    {viewMode === "A"
                      ? MOCK_DATA.composition.total_players_a
                      : MOCK_DATA.composition.total_players_b}
                  </Text>
                </Box>
                <Box
                  bg="bg.secondary"
                  p={4}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text fontSize="xs" color="text.muted" mb={2}>
                    Veteran %
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={viewMode === "A" ? "brand.500" : "blue.500"}
                  >
                    {viewMode === "A"
                      ? MOCK_DATA.experience.veteran_pct_a
                      : MOCK_DATA.experience.veteran_pct_b}
                    %
                  </Text>
                </Box>
                <Box
                  bg="bg.secondary"
                  p={4}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text fontSize="xs" color="text.muted" mb={2}>
                    Transfer Rate
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={viewMode === "A" ? "brand.500" : "blue.500"}
                  >
                    {viewMode === "A"
                      ? MOCK_DATA.transfers.transfer_rate_a
                      : MOCK_DATA.transfers.transfer_rate_b}
                    %
                  </Text>
                </Box>
              </SimpleGrid>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
