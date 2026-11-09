import { useState } from "react";
import { fmtPct, getDisplayName } from "../../../../utils/gameBoxScore/statHelpers";
import { Flex, Text, Box, Grid, VStack } from "@chakra-ui/react";

// Existing lab presentation extracted from QGameBoxScore; compact/standard JSX is preserved.

const getDefenseMetricGrade = (label, val) => {
  if (label === "Havoc Rate") {
    if (val >= 0.18) return { grade: "A", color: "#48BB78" };
    if (val >= 0.14) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.10) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.07) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Stuff Rate") {
    if (val >= 0.25) return { grade: "A", color: "#48BB78" };
    if (val >= 0.20) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.15) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.10) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Stop Rate") {
    if (val >= 0.65) return { grade: "A", color: "#48BB78" };
    if (val >= 0.58) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.50) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.40) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "Early Down Stop") {
    if (val >= 0.75) return { grade: "A", color: "#48BB78" };
    if (val >= 0.70) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.65) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.55) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  if (label === "3rd Down Stop") {
    if (val >= 0.75) return { grade: "A", color: "#48BB78" };
    if (val >= 0.68) return { grade: "B", color: "#63B3ED" };
    if (val >= 0.60) return { grade: "C", color: "#ECC94B" };
    if (val >= 0.50) return { grade: "D", color: "#ED8936" };
    return { grade: "F", color: "#E53E3E" };
  }
  return { grade: "B", color: "#63B3ED" };
};

export const DefensePanel = ({ data, isCompact }) => {
  const [defPageIndex, setDefPageIndex] = useState(0);

  // State sync during render to prevent 0/0 grid de-sync bug when game/team changes
  const [prevTeamId, setPrevTeamId] = useState(null);
  if (data.meta.shortName !== prevTeamId) {
    setPrevTeamId(data.meta.shortName);
    setDefPageIndex(0);
  }

  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;
  const totals = data.totals;

  // Categories grid
  const metrics = [
    { label: "Scrimmage Plays", val: totals.scrimmagePlays, color: "text.primary" },
    { label: "Stop Rate", val: fmtPct(totals.stopRate), color: "#48BB78" },
    { label: "Havoc Created", val: totals.havocCreated, color: "#ECC94B" },
    { label: "TFL Generated", val: totals.tfl, color: accent },
    { label: "Sacks", val: totals.sacks, color: accent },
    { label: "Passes Defended", val: totals.pd, color: "#63B3ED" },
    { label: "Interceptions", val: totals.interceptions, color: "#4A90D9" },
    { label: "Fumbles Forced", val: totals.ff, color: "#E53E3E" },
  ];

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* Header */}
      <Flex direction="column"
        bg={isCompact ? `linear-gradient(90deg, ${primary}33 0%, transparent 72%)` : primary}
        borderBottom="1px solid whiteAlpha.200"
        px={isCompact ? 1 : 2.5}
        py={isCompact ? "3px" : "2.5px"}
        gap={isCompact ? "3px" : "0.5px"}
        flexShrink={0}
      >
        <Flex align="center" gap={1.5} py={isCompact ? "2px" : "1px"}>
          <Flex w={isCompact ? "22px" : "18px"} h={isCompact ? "22px" : "18px"} borderRadius="sm" bg={primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
            <Text fontSize={isCompact ? "9px" : "8px"} fontWeight="900" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
          </Flex>
          <Text fontSize={isCompact ? "13px" : "12px"} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">DEFENSIVE PRODUCTION</Text>
        </Flex>
      </Flex>

      {/* Top 2x4 Metric Grid */}
      <Box p={1.5} borderBottom="1px solid whiteAlpha.100" bg="rgba(0,0,0,0.15)">
        <Grid templateColumns="repeat(4, 1fr)" gap="4px">
          {metrics.map((m) => (
            <Flex
              key={m.label}
              direction="column"
              bg="bg.card"
              border="1px solid whiteAlpha.100"
              borderLeft={`3px solid ${primary}`}
              borderRadius="sm"
              p="4px"
              justify="center"
              minH="38px"
            >
              <Text fontSize="16px" fontWeight="950" color={m.color} lineHeight={1}>
                {m.val}
              </Text>
              <Text fontSize="8px" fontWeight="900" color="text.secondary" textTransform="uppercase" mt="2px" lineHeight={1.1} truncate>
                {m.label}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Box>

      {/* Middle Section: Table (Left 55%) + Visual Card Placeholder (Right 45%) */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Left: Player Leaderboard Table */}
        <Flex w="55%" borderRight="1px solid whiteAlpha.100" minH={0} position="relative">
          {(() => {
            const maxDefCapacity = 12;
            const hasDefOverflow = data.players.length > maxDefCapacity;
            const totalDefPages = Math.ceil(data.players.length / maxDefCapacity);
            const startIndex = defPageIndex * maxDefCapacity;
            const visiblePlayers = hasDefOverflow
              ? data.players.slice(startIndex, startIndex + maxDefCapacity)
              : data.players;

            return (
              <>
                {/* Scroll buttons */}
                {hasDefOverflow && !isCompact && (
                  <Flex direction="column" w="18px" bg="rgba(0,0,0,0.3)" borderRight="1px solid whiteAlpha.100" flexShrink={0} h="full">
                    <Flex flex={1} align="center" justify="center" cursor="pointer"
                      opacity={defPageIndex > 0 ? 1 : 0.2}
                      pointerEvents={defPageIndex > 0 ? "auto" : "none"}
                      _hover={{ bg: "whiteAlpha.150" }}
                      onClick={() => {
                        if (defPageIndex > 0) setDefPageIndex(defPageIndex - 1);
                      }}
                    >
                      <Text color="text.secondary" fontSize="11px" fontWeight="black">▲</Text>
                    </Flex>
                    <Box h="1px" bg="whiteAlpha.100" w="full" />
                    <Flex flex={1} align="center" justify="center" cursor="pointer"
                      opacity={defPageIndex < totalDefPages - 1 ? 1 : 0.2}
                      pointerEvents={defPageIndex < totalDefPages - 1 ? "auto" : "none"}
                      _hover={{ bg: "whiteAlpha.150" }}
                      onClick={() => {
                        if (defPageIndex < totalDefPages - 1) setDefPageIndex(defPageIndex + 1);
                      }}
                    >
                      <Text color="text.secondary" fontSize="11px" fontWeight="black">▼</Text>
                    </Flex>
                  </Flex>
                )}

                {/* Table list */}
                <Box flex={1} p="2px" overflowY="hidden" display="flex" flexDirection="column" minH={0}>
                  <Grid templateColumns="minmax(0, 1.8fr) repeat(6, 0.5fr)" gap={0} alignItems="center" py="3px" borderBottom="1px solid whiteAlpha.50">
                    <Flex align="center" gap={1} pl="2px">
                      <Box w="2px" h="8px" bg={accent} borderRadius="sm" />
                      <Text fontSize="11px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">DEFENDER</Text>
                    </Flex>
                    {["TKL", "TFL", "SCK", "PD", "FF", "HAVOC"].map((h) => (
                      <Text key={h} fontSize="11px" fontWeight="900" color={h === "HAVOC" ? "#ECC94B" : "text.muted"} textAlign="center" textTransform="uppercase">{h}</Text>
                    ))}
                  </Grid>
                  {visiblePlayers.map((p) => {
                    return (
                      <Grid key={p.player_key} templateColumns="minmax(0, 1.8fr) repeat(6, 0.5fr)" gap={0} alignItems="center"
                        py="5px"
                        borderBottom="1px solid whiteAlpha.50"
                        _hover={{ bg: "whiteAlpha.100" }}
                      >
                        <Box minW={0} pl="2px">
                          <Text fontSize="13px" fontWeight="900" color="text.primary" truncate>{getDisplayName(p.name)}</Text>
                          <Text fontSize="9px" color="text.muted" fontWeight="800" textTransform="uppercase">{p.position}</Text>
                        </Box>
                        <Text fontSize="13px" fontWeight="850" color="text.secondary" textAlign="center">{p.tackles}</Text>
                        <Text fontSize="13px" fontWeight="850" color="text.secondary" textAlign="center">{p.tfl}</Text>
                        <Text fontSize="13px" fontWeight="850" color="text.secondary" textAlign="center">{p.sacks}</Text>
                        <Text fontSize="13px" fontWeight="850" color="text.secondary" textAlign="center">{p.passes_defended}</Text>
                        <Text fontSize="13px" fontWeight="850" color="text.secondary" textAlign="center">{p.forced_fumbles}</Text>
                        <Text fontSize="13px" fontWeight="950" color="#ECC94B" textAlign="center">{p.havoc}</Text>
                      </Grid>
                    );
                  })}
                </Box>
              </>
            );
          })()}
        </Flex>

        {/* Right: 2-Tiered Defensive Impact Analysis */}
        <Box w="45%" p={2} minH={0} display="flex" flexDirection="column" gap="6px" bg="rgba(0, 0, 0, 0.15)">
          {/* Tier 1: SYSTEM EFFICIENCY */}
          <VStack align="stretch" gap="3px" bg="rgba(0,0,0,0.2)" border="1px solid whiteAlpha.100" borderRadius="md" p={2} flex={1}>
            <Flex align="center" gap={1.5} pb="2px" borderBottom="1px solid whiteAlpha.100">
              <Box w="2px" h="8px" bg={accent} borderRadius="sm" />
              <Text fontSize="10px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">SYSTEM EFFICIENCY</Text>
            </Flex>
            
            {[
              { label: "Havoc Rate", val: fmtPct(totals.havocRate) },
              { label: "Stuff Rate", val: fmtPct(totals.stuffRate) },
              { label: "Stop Rate", val: fmtPct(totals.stopRate) },
              { label: "Early Down Stop", val: fmtPct(totals.earlyDownStop) },
              { label: "3rd Down Stop", val: fmtPct(totals.thirdDownStop) },
            ].map((row) => {
              const grade = getDefenseMetricGrade(row.label, parseFloat(row.val) / 100);
              return (
                <Flex key={row.label} align="center" justify="space-between" py="2.5px" borderBottom="1px solid rgba(255,255,255,0.04)">
                  <Text fontSize="11px" fontWeight="800" color="text.secondary" textTransform="uppercase">{row.label}</Text>
                  <Flex align="center" gap={3}>
                    <Text fontSize="12px" fontWeight="950" color="text.primary">{row.val}</Text>
                    <Flex px="6px" py="1px" border="1px solid" borderColor={grade.color} borderRadius="sm" bg={`${grade.color}18`} w="24px" justify="center" align="center">
                      <Text fontSize="10px" fontWeight="950" color={grade.color}>{grade.grade}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
          </VStack>

          {/* Tier 2: SITUATIONAL IMPACT */}
          <VStack align="stretch" gap="3px" bg="rgba(0,0,0,0.2)" border="1px solid whiteAlpha.100" borderRadius="md" p={2} flex={1.2}>
            <Flex align="center" gap={1.5} pb="2px" borderBottom="1px solid whiteAlpha.100">
              <Box w="2px" h="8px" bg={accent} borderRadius="sm" />
              <Text fontSize="10px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">SITUATIONAL EFFECTIVENESS</Text>
            </Flex>

            <Grid templateColumns="1.2fr 1fr" gap={2} flex={1} alignItems="center" pt="2px">
              {/* Left Column: Average 3rd Down Distance & Leverage Track */}
              <Flex direction="column" justify="center" h="full" pr={1} borderRight="1px solid whiteAlpha.100">
                <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase" letterSpacing="0.02em">AVG 3RD DISTANCE</Text>
                <Text fontSize="20px" fontWeight="950" color="#ECC94B" lineHeight={1.1} mt="2px">
                  {totals.avg3rdDistance.toFixed(2)} <Text as="span" fontSize="10px" fontWeight="bold" color="text.secondary">YDS</Text>
                </Text>
                
                {/* Leverage visual track (yard line gauge) */}
                <Box mt="6px" position="relative" h="6px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" w="full">
                  <Box position="absolute" left="0" top="0" bottom="0" w={`${Math.min(100, (totals.avg3rdDistance / 10) * 100)}%`} bg="orange.400" />
                </Box>
                <Text fontSize="8px" color="orange.400" fontWeight="900" mt="2px" textTransform="uppercase" letterSpacing="0.02em" truncate>
                  LEVERAGE: {totals.avg3rdDistance.toFixed(1)}y FORCED
                </Text>
              </Flex>

              {/* Right Column: Punts & Drives Stopped */}
              <Flex direction="column" justify="space-around" h="full" gap="4px" pl={1}>
                {[
                  { label: "Punts Forced", value: totals.puntsForced, color: "#63B3ED" },
                  { label: "3 & Outs", value: totals.threeAndOuts, color: "#4A90D9" },
                  { label: "TO Forced", value: totals.turnoversForced, color: "#E53E3E" },
                ].map((stat) => (
                  <Flex key={stat.label} align="center" justify="space-between" bg="whiteAlpha.50" px="5px" py="3px" borderRadius="xs" borderLeft={`2.5px solid ${stat.color}`}>
                    <Text fontSize="8.5px" fontWeight="800" color="text.secondary" textTransform="uppercase">{stat.label}</Text>
                    <Text fontSize="11px" fontWeight="950" color="text.primary">{stat.value}</Text>
                  </Flex>
                ))}
              </Flex>
            </Grid>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};
