import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Grid,
  Button,
} from "@chakra-ui/react";
import { MOCK_TEAMS } from "./RosterComparatorLab";

const TEAM_LIST = Object.entries(MOCK_TEAMS).map(([id, t]) => ({
  id,
  label: t.label,
  short: t.short,
  division: t.division,
  primary: t.primary,
  secondary: t.secondary,
}));

const CLASS_COLORS = {
  "Fr.": "#c53030",
  "So.": "#dd6b20",
  "Jr.": "#d69e2e",
  "Sr.": "#2c7a7b",
  "Gr.": "#276749",
};
const YEARS = [2021, 2022, 2023, 2024, 2025];

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — EXPERIENCE HEATMAP — Dense Grid View [Cascade | 2026-04-12]
// ─────────────────────────────────────────────────────────────────────────────
export const ExperienceHeatmap = () => {
  const [sortBy, setSortBy] = useState("veteran_pct");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [year, setYear] = useState(2025);

  const sortedTeams = useMemo(() => {
    return [...TEAM_LIST].sort((a, b) => {
      const teamA = MOCK_TEAMS[a.id];
      const teamB = MOCK_TEAMS[b.id];

      switch (sortBy) {
        case "veteran_pct":
          return (
            (teamB.experience.veteran_pct || 0) -
            (teamA.experience.veteran_pct || 0)
          );
        case "upperclass_pct":
          return (
            (teamB.experience.upperclass_pct || 0) -
            (teamA.experience.upperclass_pct || 0)
          );
        case "total_players":
          return (
            (teamB.composition.total_players || 0) -
            (teamA.composition.total_players || 0)
          );
        case "freshman_pct":
          const freshA =
            teamA.experience.pyramid?.find((p) => p.class === "Fr.")?.pct || 0;
          const freshB =
            teamB.experience.pyramid?.find((p) => p.class === "Fr.")?.pct || 0;
          return freshB - freshA;
        default:
          return 0;
      }
    });
  }, [sortBy]);

  const getVeteranColor = (pct) => {
    if (pct >= 40) return "#276749";
    if (pct >= 25) return "#d69e2e";
    return "#c53030";
  };

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Header with controls */}
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Flex flex={1} align="center" gap={4}>
          <Text fontSize="lg" fontWeight="black" color="text.primary">
            Experience Matrix
          </Text>
          <HStack gap={2}>
            {YEARS.map((y) => (
              <Button
                key={y}
                size="xs"
                variant={year === y ? "solid" : "ghost"}
                colorScheme="red"
                onClick={() => setYear(y)}
              >
                {y}
              </Button>
            ))}
          </HStack>
        </Flex>

        <Flex gap={2}>
          {[
            { key: "veteran_pct", label: "Veteran %" },
            { key: "upperclass_pct", label: "Upperclass %" },
            { key: "total_players", label: "Roster Size" },
            { key: "freshman_pct", label: "Freshman %" },
          ].map((sort) => (
            <Button
              key={sort.key}
              size="xs"
              variant={sortBy === sort.key ? "solid" : "ghost"}
              colorScheme="red"
              onClick={() => setSortBy(sort.key)}
            >
              {sort.label}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Team rows */}
      <Box flex={1} overflow="auto">
        <VStack spacing={0} align="stretch">
          {sortedTeams.map((team, index) => {
            const teamData = MOCK_TEAMS[team.id];
            const isExpanded = expandedTeam === team.id;

            return (
              <Box key={team.id}>
                <Flex
                  p={3}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.50"
                  cursor="pointer"
                  onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  bg={isExpanded ? "bg.card" : "transparent"}
                  style={{ transition: "all 0.2s ease" }}
                  _hover={{ bg: "bg.card" }}
                >
                  {/* Team info */}
                  <Flex align="center" gap={3} flex={1}>
                    <Box w="4px" h="40px" bg={team.primary} borderRadius="sm" />
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="black"
                        color="text.primary"
                      >
                        {team.label}
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        {team.division} · {teamData.composition.total_players}{" "}
                        players
                      </Text>
                    </Box>
                  </Flex>

                  {/* Experience bar */}
                  <Flex flex={2} align="center" gap={2}>
                    <Box
                      flex={1}
                      h="20px"
                      borderRadius="md"
                      overflow="hidden"
                      display="flex"
                    >
                      {teamData.experience.pyramid?.map((cls, i) => (
                        <Box
                          key={cls.class}
                          h="full"
                          bg={CLASS_COLORS[cls.class]}
                          w={`${cls.pct}%`}
                          title={`${cls.label}: ${cls.pct}%`}
                          style={{ transition: "width 0.3s ease" }}
                        />
                      ))}
                    </Box>
                  </Flex>

                  {/* Metrics */}
                  <Flex gap={6} align="center">
                    <Box textAlign="center">
                      <Text
                        fontSize="lg"
                        fontWeight="black"
                        color={getVeteranColor(teamData.experience.veteran_pct)}
                      >
                        {teamData.experience.veteran_pct}%
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        Veteran
                      </Text>
                    </Box>
                    <Box textAlign="center">
                      <Text
                        fontSize="lg"
                        fontWeight="black"
                        color="text.secondary"
                      >
                        {teamData.experience.upperclass_pct}%
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        Upperclass
                      </Text>
                    </Box>
                  </Flex>
                </Flex>

                {/* Expanded detail */}
                {isExpanded && (
                  <Box
                    p={4}
                    bg="bg.card"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.50"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text.primary"
                      mb={3}
                    >
                      Experience by Position - {team.label}
                    </Text>
                    <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                      {teamData.composition.position_distribution?.map(
                        (pos) => (
                          <Box
                            key={pos.group}
                            p={2}
                            bg="bg.secondary"
                            borderRadius="md"
                          >
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="text.secondary"
                            >
                              {pos.group}
                            </Text>
                            <Text fontSize="sm" color="text.primary">
                              {pos.count} players
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                              {pos.pct.toFixed(1)}% of roster
                            </Text>
                          </Box>
                        ),
                      )}
                    </Grid>
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — EXPERIENCE PYRAMID — Visual Metaphor View [Cascade | 2026-04-12]
// ─────────────────────────────────────────────────────────────────────────────
export const ExperiencePyramid = () => {
  const [sortBy, setSortBy] = useState("veteran_pct");
  const [expandedTeam, setExpandedTeam] = useState(null);

  const sortedTeams = useMemo(() => {
    return [...TEAM_LIST].sort((a, b) => {
      const teamA = MOCK_TEAMS[a.id];
      const teamB = MOCK_TEAMS[b.id];

      switch (sortBy) {
        case "veteran_pct":
          return (
            (teamB.experience.veteran_pct || 0) -
            (teamA.experience.veteran_pct || 0)
          );
        case "roster_size":
          return (
            (teamB.composition.total_players || 0) -
            (teamA.composition.total_players || 0)
          );
        default:
          return 0;
      }
    });
  }, [sortBy]);

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Text fontSize="lg" fontWeight="black" color="text.primary">
          Experience Pyramids
        </Text>
        <Flex ml="auto" gap={2}>
          <Button
            size="xs"
            variant={sortBy === "veteran_pct" ? "solid" : "ghost"}
            colorScheme="red"
            onClick={() => setSortBy("veteran_pct")}
          >
            Sort by Veteran %
          </Button>
          <Button
            size="xs"
            variant={sortBy === "roster_size" ? "solid" : "ghost"}
            colorScheme="red"
            onClick={() => setSortBy("roster_size")}
          >
            Sort by Size
          </Button>
        </Flex>
      </Flex>

      {/* Pyramids grid */}
      <Box flex={1} overflow="auto" p={4}>
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {sortedTeams.map((team) => {
            const teamData = MOCK_TEAMS[team.id];
            const isExpanded = expandedTeam === team.id;
            const maxRosterSize = 140; // For scaling pyramid width

            return (
              <Box
                key={team.id}
                cursor="pointer"
                onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
              >
                <Box
                  p={3}
                  bg="bg.card"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={team.primary}
                  style={{ transition: "all 0.2s ease" }}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                >
                  {/* Team header */}
                  <Flex align="center" gap={2} mb={3}>
                    <Box w="3px" h="16px" bg={team.primary} borderRadius="sm" />
                    <Box flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="black"
                        color="text.primary"
                      >
                        {team.short}
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        {team.division}
                      </Text>
                    </Box>
                    <Text
                      fontSize="lg"
                      fontWeight="black"
                      color={getVeteranColor(teamData.experience.veteran_pct)}
                    >
                      {teamData.experience.veteran_pct}%
                    </Text>
                  </Flex>

                  {/* Pyramid visualization */}
                  <Box h="120px" position="relative" mb={2}>
                    {teamData.experience.pyramid?.map((cls, index) => {
                      // eslint-disable-next-line no-unused-vars
                      const pyramidLevels = 5;
                      const levelHeight = 24;
                      const baseWidth =
                        (teamData.composition.total_players / maxRosterSize) *
                        100;
                      const widthReduction = 0.15; // Each level reduces width
                      const levelWidth =
                        baseWidth * (1 - index * widthReduction);

                      return (
                        <Box
                          key={cls.class}
                          position="absolute"
                          left={`${(100 - levelWidth) / 2}%`}
                          bottom={`${index * levelHeight}px`}
                          w={`${levelWidth}%`}
                          h={`${levelHeight - 2}px`}
                          bg={CLASS_COLORS[cls.class]}
                          borderRadius="sm"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          style={{ transition: "all 0.3s ease" }}
                          title={`${cls.label}: ${cls.pct}%`}
                        >
                          <Text fontSize="8px" fontWeight="black" color="white">
                            {cls.pct}%
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Metrics */}
                  <Flex justify="space-between" fontSize="xs">
                    <Text color="text.muted">
                      {teamData.composition.total_players} players
                    </Text>
                    <Text color="text.muted">
                      Upper: {teamData.experience.upperclass_pct}%
                    </Text>
                  </Flex>
                </Box>

                {/* Expanded detail */}
                {isExpanded && (
                  <Box
                    mt={2}
                    p={3}
                    bg="bg.card"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="text.primary"
                      mb={2}
                    >
                      Position Breakdown
                    </Text>
                    <VStack spacing={1} align="stretch">
                      {teamData.composition.position_distribution
                        ?.slice(0, 4)
                        .map((pos) => (
                          <Flex
                            key={pos.group}
                            justify="space-between"
                            fontSize="xs"
                          >
                            <Text color="text.secondary">{pos.group}</Text>
                            <Text color="text.primary">
                              {pos.count} ({pos.pct.toFixed(1)}%)
                            </Text>
                          </Flex>
                        ))}
                    </VStack>
                  </Box>
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — EXPERIENCE TUG-OF-WAR — Comparative View [Cascade | 2026-04-12]
// ─────────────────────────────────────────────────────────────────────────────
export const ExperienceTugOfWar = () => {
  const [teamA, setTeamA] = useState("swacjsu");
  const [teamB, setTeamB] = useState("swacfamu");
  const [selectedMetric, setSelectedMetric] = useState("veteran_pct");

  const teamAData = MOCK_TEAMS[teamA];
  const teamBData = MOCK_TEAMS[teamB];

  const getMetricValue = (team, metric) => {
    switch (metric) {
      case "veteran_pct":
        return team.experience.veteran_pct || 0;
      case "upperclass_pct":
        return team.experience.upperclass_pct || 0;
      case "total_players":
        return team.composition.total_players || 0;
      default:
        return 0;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getWinner = (metric) => {
    const aVal = getMetricValue(teamAData, metric);
    const bVal = getMetricValue(teamBData, metric);
    return aVal > bVal ? "A" : bVal > aVal ? "B" : "tie";
  };

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Team selectors */}
      <Flex h="80px" flexShrink={0} position="relative">
        {/* Team A side */}
        <Flex
          flex={1}
          bg={`linear-gradient(90deg, ${teamAData.primary} 0%, ${teamAData.primary}99 100%)`}
          align="center"
          px={4}
          gap={3}
        >
          <Flex direction="column">
            <Text
              fontSize="xl"
              fontWeight="black"
              color={teamAData.secondary}
              letterSpacing="-0.02em"
            >
              {teamAData.short}
            </Text>
            <Text fontSize="8px" color="rgba(255,255,255,0.6)">
              {teamAData.division}
            </Text>
          </Flex>
          <Flex gap={1} flexWrap="wrap" flex={1} justify="flex-end">
            {TEAM_LIST.filter((t) => t.division === teamAData.division).map(
              (t) => (
                <Box
                  key={t.id}
                  as="button"
                  px="6px"
                  py="2px"
                  borderRadius="full"
                  cursor="pointer"
                  bg={
                    teamA === t.id
                      ? teamAData.secondary
                      : "rgba(255,255,255,0.1)"
                  }
                  onClick={() => setTeamA(t.id)}
                >
                  <Text
                    fontSize="8px"
                    fontWeight="black"
                    color={
                      teamA === t.id
                        ? teamAData.primary
                        : "rgba(255,255,255,0.7)"
                    }
                  >
                    {t.short}
                  </Text>
                </Box>
              ),
            )}
          </Flex>
        </Flex>

        {/* VS badge */}
        <Flex
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          w="36px"
          h="36px"
          borderRadius="full"
          bg="bg.primary"
          border="2px solid"
          borderColor="whiteAlpha.300"
          align="center"
          justify="center"
          zIndex={2}
        >
          <Text fontSize="9px" fontWeight="black" color="text.muted">
            VS
          </Text>
        </Flex>

        {/* Team B side */}
        <Flex
          flex={1}
          bg={`linear-gradient(270deg, ${teamBData.primary} 0%, ${teamBData.primary}99 100%)`}
          align="center"
          px={4}
          gap={3}
          justify="flex-end"
        >
          <Flex gap={1} flexWrap="wrap" flex={1}>
            {TEAM_LIST.filter((t) => t.division === teamBData.division).map(
              (t) => (
                <Box
                  key={t.id}
                  as="button"
                  px="6px"
                  py="2px"
                  borderRadius="full"
                  cursor="pointer"
                  bg={
                    teamB === t.id
                      ? teamBData.secondary
                      : "rgba(255,255,255,0.1)"
                  }
                  onClick={() => setTeamB(t.id)}
                >
                  <Text
                    fontSize="8px"
                    fontWeight="black"
                    color={
                      teamB === t.id
                        ? teamBData.primary
                        : "rgba(255,255,255,0.7)"
                    }
                  >
                    {t.short}
                  </Text>
                </Box>
              ),
            )}
          </Flex>
          <Flex direction="column" align="flex-end">
            <Text
              fontSize="xl"
              fontWeight="black"
              color={teamBData.secondary}
              letterSpacing="-0.02em"
            >
              {teamBData.short}
            </Text>
            <Text fontSize="8px" color="rgba(255,255,255,0.6)">
              {teamBData.division}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Metric selector */}
      <Flex
        p={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="bg.primary"
        gap={2}
      >
        {[
          { key: "veteran_pct", label: "Veteran %" },
          { key: "upperclass_pct", label: "Upperclass %" },
          { key: "total_players", label: "Roster Size" },
        ].map((metric) => (
          <Button
            key={metric.key}
            size="xs"
            variant={selectedMetric === metric.key ? "solid" : "ghost"}
            colorScheme="red"
            onClick={() => setSelectedMetric(metric.key)}
          >
            {metric.label}
          </Button>
        ))}
      </Flex>

      {/* Tug-of-war visualization */}
      <Box flex={1} overflow="auto" p={6}>
        <VStack spacing={6} align="stretch">
          {/* Main metric comparison */}
          <Box>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="text.primary"
              mb={4}
              textAlign="center"
            >
              {selectedMetric === "veteran_pct"
                ? "Veteran Percentage"
                : selectedMetric === "upperclass_pct"
                  ? "Upperclass Percentage"
                  : "Total Roster Size"}
            </Text>

            <Flex
              h="60px"
              align="center"
              position="relative"
              bg="bg.card"
              borderRadius="lg"
              p={4}
            >
              <Box
                position="absolute"
                left="50%"
                w="1px"
                h="full"
                bg="whiteAlpha.200"
                transform="translateX(-50%)"
              />

              {/* Team A bar */}
              <Flex flex={1} justify="flex-end" pr={2}>
                <Box
                  h="40px"
                  borderRadius="sm"
                  bg={teamAData.primary}
                  w={`${(getMetricValue(teamAData, selectedMetric) / Math.max(getMetricValue(teamAData, selectedMetric), getMetricValue(teamBData, selectedMetric))) * 45}%`}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  pr={2}
                  style={{ transition: "all 0.4s ease" }}
                >
                  <Text fontSize="sm" fontWeight="black" color="white">
                    {getMetricValue(teamAData, selectedMetric)}
                    {selectedMetric.includes("pct") ? "%" : ""}
                  </Text>
                </Box>
              </Flex>

              {/* Center divider */}
              <Box w="60px" textAlign="center">
                <Text fontSize="xs" color="text.muted">
                  VS
                </Text>
              </Box>

              {/* Team B bar */}
              <Flex flex={1} pl={2}>
                <Box
                  h="40px"
                  borderRadius="sm"
                  bg={teamBData.primary}
                  w={`${(getMetricValue(teamBData, selectedMetric) / Math.max(getMetricValue(teamAData, selectedMetric), getMetricValue(teamBData, selectedMetric))) * 45}%`}
                  display="flex"
                  alignItems="center"
                  pl={2}
                  style={{ transition: "all 0.4s ease" }}
                >
                  <Text fontSize="sm" fontWeight="black" color="white">
                    {getMetricValue(teamBData, selectedMetric)}
                    {selectedMetric.includes("pct") ? "%" : ""}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Box>

          {/* Experience distribution comparison */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
              Experience Distribution
            </Text>
            <VStack spacing={2}>
              {teamAData.experience.pyramid?.map((cls, index) => {
                const bCls = teamBData.experience.pyramid?.find(
                  (p) => p.class === cls.class,
                );
                const winner =
                  cls.pct > (bCls?.pct || 0)
                    ? "A"
                    : (bCls?.pct || 0) > cls.pct
                      ? "B"
                      : "tie";

                return (
                  <Box key={cls.class} w="full">
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color="text.secondary">
                        {cls.label}
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        {cls.pct}% / {bCls?.pct || 0}%
                      </Text>
                    </Flex>
                    <Flex h="20px" align="center" position="relative">
                      <Box
                        position="absolute"
                        left="50%"
                        w="1px"
                        h="full"
                        bg="whiteAlpha.200"
                        transform="translateX(-50%)"
                      />

                      {/* Team A bar */}
                      <Flex flex={1} justify="flex-end" pr={1}>
                        <Box
                          h="16px"
                          borderRadius="sm"
                          bg={
                            winner === "A"
                              ? teamAData.primary
                              : "rgba(255,255,255,0.2)"
                          }
                          w={`${cls.pct * 2}%`}
                          style={{ transition: "all 0.3s ease" }}
                        />
                      </Flex>

                      {/* Team B bar */}
                      <Flex flex={1} pl={1}>
                        <Box
                          h="16px"
                          borderRadius="sm"
                          bg={
                            winner === "B"
                              ? teamBData.primary
                              : "rgba(255,255,255,0.2)"
                          }
                          w={`${(bCls?.pct || 0) * 2}%`}
                          style={{ transition: "all 0.3s ease" }}
                        />
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          </Box>

          {/* Position comparison */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
              Position Group Comparison
            </Text>
            <Grid templateColumns="1fr 1fr" gap={4}>
              {[teamAData, teamBData].map((team, teamIndex) => (
                <Box
                  key={teamIndex}
                  p={3}
                  bg="bg.card"
                  borderRadius="lg"
                  borderLeftWidth={4}
                  borderLeftColor={team.primary}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="black"
                    color={team.secondary}
                    mb={2}
                  >
                    {team.short} Position Groups
                  </Text>
                  <VStack spacing={1} align="stretch">
                    {team.composition.position_distribution
                      ?.slice(0, 4)
                      .map((pos) => (
                        <Flex
                          key={pos.group}
                          justify="space-between"
                          fontSize="xs"
                        >
                          <Text color="text.secondary">{pos.group}</Text>
                          <Text color="text.primary">{pos.count} players</Text>
                        </Flex>
                      ))}
                  </VStack>
                </Box>
              ))}
            </Grid>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

// Helper function for veteran color
const getVeteranColor = (pct) => {
  if (pct >= 40) return "#276749";
  if (pct >= 25) return "#d69e2e";
  return "#c53030";
};
