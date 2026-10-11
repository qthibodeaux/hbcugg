import React from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";


import { 
  computeGrade, 
  computeGloryScore, 
  getDefensiveIdentity 
} from "../../../utils/defenseGloryModel";

/**
 * GameProductionDefenseMasteryA
 * 
 * PHILOSOPHY:
 *   High-fidelity replica of the user-provided "Inspo" layout.
 *   Side-by-side 2x2 panels for a direct team face-off.
 *   Utilizes the "Glory Engine" (defenseGloryModel.js) for context-aware grading.
 * 
 * DATA SOURCE:
 *   W15pvamujsu.json (December 6, 2025)
 */

const DATA = {
  jsu: {
    meta: {
        id: "jsu",
        name: "JACKSON STATE — DEFENSE",
        colors: { primary: "#002147", accent: "#4A90D9" }
    },
    advanced: {
        havoc_rate_forced: 0.132,
        stuff_rate: 0.231,
        success_rate: 0.333,
        success_rate_early_down: 0.387,
        success_rate_late_down: 0.200,
        third_down_allowed_pct: 0.5238, // Added literal conversion rate allowed
        red_zone_td_rate: 0.40,
        epa_per_play: 0.012
    },
    top: {
        scrimmage: 85, 
        stopRate: 0.667, 
        havocTotal: 14, 
        havocBreakdown: "rush 6 · pass 8",
        turnoversTotal: 3,
        turnoverBreakdown: "1 INT · 2 FR/FF"
    },
    players: [
        { name: "R. Pulliam", tkl: 10.5, tfl: 0.5, sck: 0, pd: 1, ff: 0, havoc: 2 },
        { name: "K. Sallis", tkl: 9.0, tfl: 0, sck: 0, pd: 0, ff: 1, havoc: 1 },
        { name: "S. Hawkins", tkl: 7.0, tfl: 0, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "A. Taylor", tkl: 4.0, tfl: 2.0, sck: 0, pd: 0, ff: 0, havoc: 4 },
        { name: "J. Williams", tkl: 3.5, tfl: 1.0, sck: 0, pd: 0, ff: 1, havoc: 2 },
    ]
  },
  pvamu: {
    meta: {
        id: "pvamu",
        name: "PRAIRIE VIEW — DEFENSE",
        colors: { primary: "#4B0082", accent: "#FFB81C" }
    },
    advanced: {
        havoc_rate_forced: 0.167,
        stuff_rate: 0.196,
        success_rate: 0.333,
        success_rate_early_down: 0.264,
        success_rate_late_down: 0.500,
        third_down_allowed_pct: 0.200, // Added literal conversion rate allowed
        red_zone_td_rate: 0.75,
        epa_per_play: 0.134
    },
    top: {
        scrimmage: 45, 
        stopRate: 0.667, 
        havocTotal: 7, 
        havocBreakdown: "rush 4 · pass 3",
        turnoversTotal: 2,
        turnoverBreakdown: "1 INT · 1 FR"
    },
    players: [
        { name: "D. Starling", tkl: 6.0, tfl: 1.0, sck: 0.5, pd: 0, ff: 0, havoc: 2 },
        { name: "K. Parker", tkl: 5.0, tfl: 1.0, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "T. Randle", tkl: 4.0, tfl: 0, sck: 0, pd: 1, ff: 0, havoc: 1 },
        { name: "K. Amao", tkl: 3.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, havoc: 1 },
        { name: "S. Roberts", tkl: 1.5, tfl: 0, sck: 0, pd: 0, ff: 0, havoc: 2 },
    ]
  }
};

const Table = ({ children, ...props }) => (
    <VStack align="stretch" gap={0} w="full" {...props}>{children}</VStack>
);

const Thead = ({ children }) => <Box>{children}</Box>;
const Tbody = ({ children }) => <VStack align="stretch" gap={0}>{children}</VStack>;

const Tr = ({ children, ...props }) => (
    <Grid templateColumns="1.45fr repeat(5, 0.52fr) 0.7fr" gap={1} alignItems="center" {...props}>
        {children}
    </Grid>
);

const Th = ({ children, textAlign = "left", ...props }) => (
    <Text fontWeight="900" textTransform="uppercase" textAlign={textAlign} {...props}>{children}</Text>
);

const Td = ({ children, textAlign = "left", ...props }) => (
    <Box textAlign={textAlign} {...props}>{children}</Box>
);

const StatBlock = ({ label, value, subtext }) => (
    <VStack align="start" gap={0} flex={1}>
        <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" mb="4px" borderBottom="1px solid whiteAlpha.100" w="full" pb="2px">{label}</Text>
        <Text fontSize="28px" fontWeight="950" color="white" lineHeight={1}>{value}</Text>
        <Text fontSize="10px" fontWeight="700" color="text.muted" mt="2px">{subtext}</Text>
    </VStack>
);

const SectionHeader = ({ title }) => (
    <HStack gap={3} mb="15px">
        <Box w="4px" h="14px" bg="brand.500" />
        <Text fontSize="11px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">{title}</Text>
    </HStack>
);

const TeamPanel = ({ teamKey }) => {
    const team = DATA[teamKey];
    const gloryScore = computeGloryScore(team.advanced);
    const identity = getDefensiveIdentity(team.advanced);

    const metricsToGrade = [
        { label: "Havoc rate", key: "havoc_rate", val: (team.advanced.havoc_rate_forced * 100).toFixed(1) + "%", raw: team.advanced.havoc_rate_forced },
        { label: "Stuff rate", key: "stuff_rate", val: (team.advanced.stuff_rate * 100).toFixed(1) + "%", raw: team.advanced.stuff_rate },
        { label: "Stop rate", key: "stop_rate", val: (team.top.stopRate * 100).toFixed(0) + "%", raw: team.top.stopRate },
        { label: "Early down", key: "early_down", val: ((1 - team.advanced.success_rate_early_down) * 100).toFixed(1) + "%", raw: (1 - team.advanced.success_rate_early_down) },
        { label: "3rd Down Stop", key: "third_down_stop", val: ((1 - team.advanced.third_down_allowed_pct) * 100).toFixed(1) + "%", raw: (1 - team.advanced.third_down_allowed_pct) },
        { label: "Late Down", key: "late_down_stop", val: ((1 - team.advanced.success_rate_late_down) * 100).toFixed(1) + "%", raw: (1 - team.advanced.success_rate_late_down) },
        { label: "Red Zone TD", key: "red_zone_td_pct", val: (team.advanced.red_zone_td_rate * 100).toFixed(0) + "%", raw: team.advanced.red_zone_td_rate },
    ];

    return (
        <Box flex={1} bg="bg.secondary" borderRadius="xl" p="24px" border="1px solid whiteAlpha.100" position="relative" overflow="hidden">
            {/* Watermark Logo */}
            <Box position="absolute" bottom="-20px" right="-20px" opacity={0.03} transform="rotate(-15deg)">
                 <Text fontSize="120px" fontWeight="950" color="white">{team.meta.id.toUpperCase()}</Text>
            </Box>

            {/* Glory Badge */}
            <Box position="absolute" top="24px" right="24px" textAlign="right" zIndex={2}>
                <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Unit Glory</Text>
                <Text fontSize="32px" fontWeight="1000" color={team.meta.colors.accent} lineHeight={0.9} my="4px">{gloryScore}</Text>
                <Box px="6px" py="2px" bg="whiteAlpha.100" borderRadius="sm" display="inline-block">
                    <Text fontSize="9px" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.05em">{identity}</Text>
                </Box>
            </Box>

            {/* Header */}
            <HStack mb="24px" gap={4}>
                <Box px="12px" py="4px" bg={team.meta.colors.primary} borderRadius="md" border={`1px solid ${team.meta.colors.accent}33`}>
                    <Text fontSize="14px" fontWeight="1000" color="white" letterSpacing="0.1em">{team.meta.id.toUpperCase()}</Text>
                </Box>
                <VStack align="start" gap={0}>
                    <Text fontSize="20px" fontWeight="1000" color="white" letterSpacing="0.05em" textTransform="uppercase">{team.meta.name}</Text>
                    <Text fontSize="10px" fontWeight="800" color="text.muted" textTransform="uppercase">Defensive Production Cluster A</Text>
                </VStack>
            </HStack>

            {/* Counting Stats Tier */}
            <Box mb="30px" position="relative" zIndex={2}>
                <HStack align="start" gap={8} divider={<Box w="1px" h="40px" bg="whiteAlpha.100" alignSelf="center" />}>
                   <StatBlock label="Scrimmage Plays" value={team.top.scrimmage} subtext="opposition volume" />
                   <StatBlock label="Stop Rate" value={`${Math.round(team.top.stopRate * 100)}%`} subtext="success denial" />
                   <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" mb="4px" borderBottom="1px solid whiteAlpha.100" w="full" pb="2px">Havoc Plays</Text>
                        <Text fontSize="32px" fontWeight="1000" color="#F56565" lineHeight={1}>{team.top.havocTotal}</Text>
                        <Text fontSize="9px" fontWeight="700" color="text.muted" mt="4px" textTransform="uppercase">{team.top.havocBreakdown}</Text>
                   </VStack>
                   <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase" mb="4px" borderBottom="1px solid whiteAlpha.100" w="full" pb="2px">Takeaways</Text>
                        <Text fontSize="32px" fontWeight="1000" color="#F6AD55" lineHeight={1}>{team.top.turnoversTotal}</Text>
                        <Text fontSize="9px" fontWeight="700" color="text.muted" mt="4px" textTransform="uppercase">{team.top.turnoverBreakdown}</Text>
                   </VStack>
                </HStack>
            </Box>

            {/* Players & Grades Split */}
            <Grid templateColumns="1.3fr 1fr" gap="30px" position="relative" zIndex={2}>
                {/* Players Table */}
                <Box>
                    <SectionHeader title="Havoc Contributions" />
                    <Table variant="unstyled" size="sm">
                        <Thead>
                            <Tr borderBottom="2px solid whiteAlpha.200">
                                <Th color="text.muted" fontSize="10px" px={0} letterSpacing="0.1em">INDIVIDUAL</Th>
                                <Th color="text.muted" fontSize="10px" textAlign="center" px={1}>TKL</Th>
                                <Th color="text.muted" fontSize="10px" textAlign="center" px={1}>TFL</Th>
                                <Th color="text.muted" fontSize="10px" textAlign="center" px={1}>SAC</Th>
                                <Th color="text.muted" fontSize="10px" textAlign="center" px={1}>PD</Th>
                                <Th color="text.muted" fontSize="10px" textAlign="right" px={0}>TOTAL</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {team.players.map((p, idx) => (
                                <Tr key={idx} borderBottom="1px solid whiteAlpha.50" _hover={{ bg: "whiteAlpha.50" }} transition="all 0.2s">
                                    <Td px={0} py="12px">
                                        <Text fontSize="14px" fontWeight="900" color="white" lineHeight="1.1">{p.name}</Text>
                                    </Td>
                                    <Td textAlign="center" px={1}><Text fontSize="14px" fontWeight="800" color="white">{p.tkl}</Text></Td>
                                    <Td textAlign="center" px={1}><Text fontSize="12px" fontWeight="700" color="whiteAlpha.600">{p.tfl || '·'}</Text></Td>
                                    <Td textAlign="center" px={1}><Text fontSize="12px" fontWeight="700" color="whiteAlpha.600">{p.sck || '·'}</Text></Td>
                                    <Td textAlign="center" px={1}><Text fontSize="12px" fontWeight="700" color="whiteAlpha.600">{p.pd || '·'}</Text></Td>
                                    <Td textAlign="right" px={0}>
                                        <Text fontSize="16px" fontWeight="1000" color={p.havoc > 2 ? team.meta.colors.accent : "white"}>{p.havoc}</Text>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {/* Unit Grades */}
                <Box>
                    <SectionHeader title="System Efficiency" />
                    <VStack align="stretch" gap="12px">
                        {metricsToGrade.map((m, idx) => {
                            const { grade, color } = computeGrade(m.key, m.raw);
                            return (
                                <Flex key={idx} justify="space-between" align="center" py="6px" borderBottom="1px solid whiteAlpha.50">
                                    <Text fontSize="12px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">{m.label}</Text>
                                    <HStack gap={4}>
                                        <Text fontSize="15px" fontWeight="900" color="white">{m.val}</Text>
                                        <Box w="36px" h="28px" display="flex" alignItems="center" justifyContent="center" borderRadius="md" bg="whiteAlpha.100" border={`1px solid ${color}`}>
                                            <Text fontSize="14px" fontWeight="1000" color={color}>{grade}</Text>
                                        </Box>
                                    </HStack>
                                </Flex>
                            );
                        })}
                    </VStack>
                    
                    <Box mt="24px" p="12px" bg="whiteAlpha.50" borderRadius="md" borderLeft={`4px solid ${team.meta.colors.accent}`}>
                         <Text fontSize="9px" fontWeight="900" color="text.muted" textTransform="uppercase" mb="4px">Model Note</Text>
                         <Text fontSize="11px" fontWeight="700" color="whiteAlpha.800" lineHeight="1.4">
                            Efficiency grades are benchmarked against 2025 SWAC defensive averages ($n=12$).
                         </Text>
                    </Box>
                </Box>
            </Grid>
        </Box>
    );
};

export const GameProductionDefenseMasteryA = () => {
    return (
        <Flex direction="row" gap="20px" p="4px" h="full" w="full" bg="bg.primary">
            <TeamPanel teamKey="pvamu" />
            <TeamPanel teamKey="jsu" />
        </Flex>
    );
};
