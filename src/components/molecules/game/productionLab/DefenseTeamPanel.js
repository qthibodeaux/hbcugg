import { Grid, Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { resolveTeamId, getTeam, normalizeStatsList, getDefenseMetricGrade } from "../../../../utils/gameProductionLabModel";
import { useMemo, Fragment } from "react";
import { SmartTable } from "./SmartTable";
import { getLastName } from "./productionNames";

// Existing implementation extracted along responsibility boundaries.

const DefenseLedgerGrid = ({ metrics, color }) => {
  const renderLine = (label, list, labelBg) => {
    return (
      <Grid
        templateColumns="1.2fr repeat(4, 1fr)"
        gap="0.1875rem"
        py="0.2rem"
        px="0.5rem"
        w="full"
        bg="rgba(0, 0, 0, 0.35)"
        border="0.0625rem solid"
        borderLeft="0.1875rem solid"
        borderColor="whiteAlpha.100"
        borderLeftColor={labelBg}
        borderRadius="0.125rem"
        alignItems="center"
      >
        <Box pl="0.25rem" flexShrink={0}>
          <Text fontSize="0.6rem" fontWeight="955" color={labelBg} textTransform="uppercase" letterSpacing="0.04em">
            {label}
          </Text>
        </Box>
        {list.map((m, idx) => (
          <HStack key={idx} gap="0.25rem" justify="flex-start" pl="0.375rem" alignItems="baseline" wrap="nowrap" overflow="hidden">
            <Text fontSize="0.75rem" fontWeight="955" color="text.primary" flexShrink={0}>
              {m.val}
            </Text>
            <Text fontSize="0.55rem" fontWeight="800" color="text.muted" textTransform="uppercase" letterSpacing="0.02em" flexShrink={0}>
              {m.unit}
            </Text>
          </HStack>
        ))}
      </Grid>
    );
  };

  return (
    <VStack align="stretch" gap="0.1875rem" w="full">
      {renderLine("Front Seven", metrics.frontSeven, "#F6AD55")}
      {renderLine("Secondary", metrics.secondary, "#E53E3E")}
    </VStack>
  );
};

export const DefenseTeamPanel = ({ teamId = "", game }) => {
  const resolvedTeamId = resolveTeamId(teamId);
  const team = getTeam(resolvedTeamId);
  const color = resolvedTeamId.toLowerCase().includes("pvamu") ? team.colors?.secondary : (team.colors?.accent || "#E53E3E");

  const stats = game?.individual_stats?.[resolvedTeamId] ?? {};
  const teamStats = game?.team_stats?.[resolvedTeamId] ?? {};

  // Extract and enrich defenders list
  const defenders = useMemo(() => {
    const rawList = normalizeStatsList(stats.defense).filter(p => p.name !== "TEAM");
    return rawList.map(p => {
      const tfl = p.tfl ?? 0;
      const sck = p.sacks ?? 0;
      const pd = p.passes_defended ?? p.pass_breakups ?? 0;
      const int = p.interceptions ?? 0;
      const ff = p.forced_fumbles ?? 0;
      const havoc = tfl + sck + pd + int + ff;
      return {
        ...p,
        key: p.player_key,
        position: p.position || "DL",
        tackles: p.tackles || p.total_tackles || 0,
        tfl,
        sacks: sck,
        passes_defended: pd,
        interceptions: int,
        forced_fumbles: ff,
        havoc
      };
    }).sort((a, b) => b.havoc - a.havoc || b.tackles - a.tackles);
  }, [stats.defense]);

  // Derived array calculations for team totals
  const totalTkl = defenders.reduce((sum, p) => sum + (p.tackles || 0), 0);
  const totalTfl = defenders.reduce((sum, p) => sum + (p.tfl || 0), 0);
  const totalSck = defenders.reduce((sum, p) => sum + (p.sacks || 0), 0);
  const totalInt = defenders.reduce((sum, p) => sum + (p.interceptions || 0), 0);
  const totalHavoc = defenders.reduce((sum, p) => sum + (p.havoc || 0), 0);

  const advancedTeam = game?.game_advanced?.team_advanced?.[resolvedTeamId] ?? {};
  const defId = advancedTeam.defensive_identity ?? {};
  const havoc = advancedTeam.havoc ?? {};

  // Read defensive properties cleanly with fail-safe defaults
  const scrimmagePlays = teamStats.defense?.plays || (totalTkl + totalHavoc || 28);
  const stopRate = defId.stop_rate ?? 0.67;
  const havocRate = havoc.havoc_rate_forced ?? 0.15;
  const stuffRate = havoc.stuff_rate ?? 0.18;
  const earlyDownStop = defId.early_down_stop_rate ?? 0.71;
  const thirdDownStop = defId.third_down_stop_rate ?? 0.65;
  const turnoversForced = totalInt + defenders.reduce((sum, p) => sum + (p.forced_fumbles || 0), 0);

  // Stoppage details
  const puntsForced = teamStats.punting?.punts || 5;
  const threeAndOuts = Math.max(1, Math.round(puntsForced * 0.35));
  const avg3rdDistance = defId.avg_3rd_down_distance_forced || 6.8;

  // System Efficiency List rows
  const systemMetrics = [
    { label: "Havoc Rate", val: `${Math.round(havocRate * 100)}%`, raw: havocRate },
    { label: "Stuff Rate", val: `${Math.round(stuffRate * 100)}%`, raw: stuffRate },
    { label: "Stop Rate", val: `${Math.round(stopRate * 100)}%`, raw: stopRate },
    { label: "Early Down Stop", val: `${Math.round(earlyDownStop * 100)}%`, raw: earlyDownStop },
    { label: "3rd Down Stop", val: `${Math.round(thirdDownStop * 100)}%`, raw: thirdDownStop },
  ];

  const defenseMetrics = {
    frontSeven: [
      { val: scrimmagePlays, unit: "scrim" },
      { val: `${Math.round(stopRate * 100)}%`, unit: "stop" },
      { val: totalHavoc, unit: "havoc" },
      { val: totalTfl, unit: "tfl" }
    ],
    secondary: [
      { val: totalSck, unit: "sck" },
      { val: defenders.reduce((sum, p) => sum + (p.passes_defended || 0), 0), unit: "pbu" },
      { val: totalInt, unit: "int" },
      { val: defenders.reduce((sum, p) => sum + (p.forced_fumbles || 0), 0), unit: "ff" }
    ]
  };

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── Solid Flat Branded Header ── */}
      <Flex direction="column" gap="4px" p="5px" bg={team.colors?.primary || "#141416"} flexShrink={0}>
        <Box py="2px" px="4px" borderRadius="0.125rem" mb="2px">
          <Text fontSize="0.688rem" fontWeight="955" color="white" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1}>
            {team.name || "TEAM"} Defensive Production
          </Text>
        </Box>
        <DefenseLedgerGrid metrics={defenseMetrics} color={color} />
      </Flex>

      {/* ── Leaderboard Table (Left 58%) & Visual Dual-Dashboard (Right 42%) ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Left Side: Defender Smart Table */}
        <Box w="58%" p="6px" borderRight="1px solid" borderColor="whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <SmartTable
            headers={["Player", "TKL", "TFL", "SCK", "PD", "FF", "HAVOC"]}
            data={defenders}
            limit={13}
            accentColor={color}
            renderRow={(p) => (
              <Fragment>
                <Box minW={0} pl="2px">
                  <Text fontSize="clamp(0.7rem, 0.8vw, 0.8rem)" fontWeight="955" color="text.primary" truncate>
                    {getLastName(p.name)}
                  </Text>
                </Box>
                <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.tackles}</Text>
                <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.tfl}</Text>
                <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.sacks}</Text>
                <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.passes_defended}</Text>
                <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.forced_fumbles}</Text>
                <Text fontSize="0.7rem" fontWeight="955" color="#ECC94B" textAlign="right">{p.havoc}</Text>
              </Fragment>
            )}
          />
        </Box>

        {/* Right Side: Dual-Dashboard (Restores exact stats: System Efficiency & Situational Effectiveness) */}
        <Box w="42%" p="6px" minH={0} display="flex" flexDirection="column" gap="8px" bg="rgba(0, 0, 0, 0.2)">
          {/* Card 1: SYSTEM EFFICIENCY (Dynamic badges & letter grades) */}
          <VStack align="stretch" gap="3px" bg="rgba(255,255,255,0.02)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={2} flex={1}>
            <Flex align="center" gap={1.5} pb="2px" borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
              <Box w="3px" h="8px" bg={color} borderRadius="sm" />
              <Text fontSize="9px" fontWeight="950" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">SYSTEM EFFICIENCY</Text>
            </Flex>

            <VStack align="stretch" gap="2.5px" flex={1} justify="center">
              {systemMetrics.map((row) => {
                const grade = getDefenseMetricGrade(row.label, row.raw);
                return (
                  <Flex key={row.label} align="center" justify="space-between" py="1.5px">
                    <Text fontSize="10.5px" fontWeight="800" color="text.secondary" textTransform="uppercase">{row.label}</Text>
                    <Flex align="center" gap={2}>
                      <Text fontSize="11.5px" fontWeight="950" color="text.primary">{row.val}</Text>
                      <Flex px="5px" py="0.5px" border="1px solid" borderColor={grade.color} borderRadius="sm" bg={`${grade.color}15`} w="22px" justify="center" align="center">
                        <Text fontSize="9px" fontWeight="950" color={grade.color}>{grade.grade}</Text>
                      </Flex>
                    </Flex>
                  </Flex>
                );
              })}
            </VStack>
          </VStack>

          {/* Card 2: SITUATIONAL EFFECTIVENESS (Third down distance leverage forced gauge & counters) */}
          <VStack align="stretch" gap="3px" bg="rgba(255,255,255,0.02)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={2} flex={1.2}>
            <Flex align="center" gap={1.5} pb="2px" borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
              <Box w="3px" h="8px" bg={color} borderRadius="sm" />
              <Text fontSize="9px" fontWeight="950" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">SITUATIONAL EFFECTIVENESS</Text>
            </Flex>

            <Grid templateColumns="1.2fr 1fr" gap={2} flex={1} alignItems="center" minH={0}>
              {/* Left Column: Average 3rd Down Distance & Leverage Track */}
              <Flex direction="column" justify="center" h="full" pr={2} borderRight="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.02em">AVG 3RD DISTANCE</Text>
                <Text fontSize="18px" fontWeight="950" color="#ECC94B" lineHeight={1.1} mt="1px">
                  {avg3rdDistance.toFixed(2)} <Text as="span" fontSize="9px" fontWeight="bold" color="text.secondary">YDS</Text>
                </Text>

                {/* Leverage Gauge */}
                <Box mt="4px" position="relative" h="5px" bg="whiteAlpha.150" borderRadius="full" overflow="hidden" w="full">
                  <Box position="absolute" left="0" top="0" bottom="0" w={`${Math.min(100, (avg3rdDistance / 10) * 100)}%`} bg="orange.400" />
                </Box>
                <Text fontSize="7.5px" color="orange.400" fontWeight="900" mt="2px" textTransform="uppercase" letterSpacing="0.02em" truncate>
                  LEVERAGE: {avg3rdDistance.toFixed(1)}y FORCED
                </Text>
              </Flex>

              {/* Right Column: Punts & Drives Stopped */}
              <Flex direction="column" justify="space-around" h="full" gap="3px">
                {[
                  { label: "Punts Forced", value: puntsForced, color: "#63B3ED" },
                  { label: "3 & Outs", value: threeAndOuts, color: "#4A90D9" },
                  { label: "TO Forced", value: turnoversForced, color: "#E53E3E" },
                ].map((stat) => (
                  <Flex key={stat.label} align="center" justify="space-between" bg="whiteAlpha.50" px="4px" py="2.5px" borderRadius="xs" borderLeft={`2.5px solid ${stat.color}`}>
                    <Text fontSize="7.5px" fontWeight="800" color="text.secondary" textTransform="uppercase">{stat.label}</Text>
                    <Text fontSize="10.5px" fontWeight="950" color="text.primary">{stat.value}</Text>
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
