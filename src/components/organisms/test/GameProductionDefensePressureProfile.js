import React from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
  HStack,
  // eslint-disable-next-line no-unused-vars
  CircularProgress,
} from "@chakra-ui/react";
import { ShieldCheck, Waves } from "lucide-react";

/**
 * GameProductionDefensePressureProfile
 * 
 * PHILOSOPHY:
 *   Purpose: Highlight the synergy between the pass rush and the secondary.
 *   Grid slot: 4x2
 * 
 * CONTENT TIERS:
 *   Top (4x1): "Synergy Strip" - Metrics that connect rush to coverage.
 *   Bottom Left (45%): "The Havoc Room" - Standard 6-column leader table.
 *   Bottom Right (55%): "The Pressure Funnel" - Flow visualization of dropbacks vs pressure.
 */

const DATA = {
  jsu: {
    meta: {
      name: "Jackson State",
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    metrics: {
      pressureRate: 0.207, // 6 pressures on 29 attempts
      opponentDropbacks: 29,
      pressures: 6,
      pressureCompletions: 1,
      pressureCompPct: 0.167,
      sacks: 1,
      hurries: 5,
      interceptions: 1, // Only 1 INT in box score? Wait, JSU forced 3 turnovers.
      passesDefended: 2,
    },
    leaders: [
      { name: "Pulliam,R.", pos: "LB", tkl: 10.5, tfl: 0.5, sck: 0, pd: 1, ff: 0, qbh: 1 },
      { name: "Sallis,K.", pos: "DB", tkl: 9.0, tfl: 0, sck: 0, pd: 0, ff: 1, qbh: 0 },
      { name: "Hawkins,S.", pos: "DB", tkl: 7.0, tfl: 0, sck: 0, pd: 0, ff: 0, qbh: 1 },
      { name: "Taylor,A.", pos: "DL", tkl: 4.0, tfl: 2.0, sck: 0, pd: 0, ff: 0, qbh: 2 },
      { name: "Williams,J.", pos: "DL", tkl: 3.5, tfl: 1.0, sck: 0, pd: 0, ff: 1, qbh: 0 },
    ],
  },
  pvamu: {
    meta: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFFFFF", accent: "#FFB81C" },
    },
    metrics: {
      pressureRate: 0.176, // 3 pressures on 17 attempts
      opponentDropbacks: 17,
      pressures: 3,
      pressureCompletions: 0,
      pressureCompPct: 0.0,
      sacks: 1,
      hurries: 2,
      interceptions: 1,
      passesDefended: 1,
    },
    leaders: [
      { name: "Starling,D.", pos: "LB", tkl: 6.0, tfl: 1.0, sck: 0.5, pd: 0, ff: 0, qbh: 0 },
      { name: "Parker,K.", pos: "DL", tkl: 5.0, tfl: 1.0, sck: 0, pd: 0, ff: 0, qbh: 0 },
      { name: "Randle,T.", pos: "DB", tkl: 4.0, tfl: 0, sck: 0, pd: 1, ff: 0, qbh: 0 },
      { name: "Amao,K.", pos: "DB", tkl: 3.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, qbh: 0 },
      { name: "Roberts,S.", pos: "LB", tkl: 1.5, tfl: 0, sck: 0, pd: 0, ff: 0, qbh: 2 },
    ],
  }
};

const fmtPct = (n) => `${Math.round(n * 100)}%`;

const SynergyStrip = ({ team }) => (
  <Grid templateColumns="repeat(4, 1fr)" gap="1px" bg="whiteAlpha.100" border="1px solid whiteAlpha.200">
    <Flex bg={team.meta.colors.primary} p="15px" align="center" gap={3}>
        <ShieldCheck size={28} color={team.meta.colors.accent} />
        <VStack align="start" gap={0}>
            <Text fontSize="10px" fontWeight="900" color="whiteAlpha.600" textTransform="uppercase">Unit Profile</Text>
            <Text fontSize="18px" fontWeight="950" color="white" lineHeight={1} textTransform="uppercase">{team.meta.shortName} PRESSURE</Text>
        </VStack>
    </Flex>
    {/* Pressure Rate */}
    <Box bg="bg.secondary" p="15px" borderRight="1px solid whiteAlpha.50">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Force Pressure %</Text>
        <HStack align="baseline" gap={1}>
            <Text fontSize="24px" fontWeight="950" color="#F6AD55">{fmtPct(team.metrics.pressureRate)}</Text>
            <Text fontSize="10px" fontWeight="700" color="text.muted">Rate</Text>
        </HStack>
    </Box>
    {/* Hurries & Sacks */}
    <Box bg="bg.secondary" p="15px" borderRight="1px solid whiteAlpha.50">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Total Disruption</Text>
        <HStack gap={4}>
            <VStack align="start" gap={0}>
                <Text fontSize="20px" fontWeight="950" color="white">{team.metrics.sacks}</Text>
                <Text fontSize="8px" fontWeight="900" color="text.muted" textTransform="uppercase">Sacks</Text>
            </VStack>
            <VStack align="start" gap={0}>
                <Text fontSize="20px" fontWeight="950" color="white">{team.metrics.hurries}</Text>
                <Text fontSize="8px" fontWeight="900" color="text.muted" textTransform="uppercase">Hurries</Text>
            </VStack>
        </HStack>
    </Box>
    {/* Interceptions */}
    <Box bg="bg.secondary" p="15px">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Turnover Capital</Text>
        <HStack align="center" gap={3}>
            <Text fontSize="28px" fontWeight="950" color={team.meta.colors.accent}>{team.metrics.interceptions}</Text>
            <Text fontSize="11px" fontWeight="950" color="white" textTransform="uppercase" opacity={0.6}>INTs Forced</Text>
        </HStack>
    </Box>
  </Grid>
);

const PressureFunnel = ({ team }) => {
  const compColor = team.metrics.pressureCompPct > 0.1 ? "#E53E3E" : "#68D391";
  
  return (
    <Box h="full" w="full" position="relative" bg="bg.secondary" borderRadius="sm" p="20px">
        <Flex justify="space-between" align="center" mb="20px">
            <VStack align="start" gap={0}>
                <Text fontSize="16px" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.05em">The Pressure Funnel</Text>
                <Text fontSize="9px" fontWeight="700" color="text.muted" textTransform="uppercase">How pressure suffocates the pass</Text>
            </VStack>
            <Box px="10px" py="4px" bg="whiteAlpha.100" borderRadius="md" border="1px solid whiteAlpha.100">
                <Text fontSize="10px" fontWeight="950" color="white" lineHeight={1}>{team.metrics.opponentDropbacks} Opp Dropbacks</Text>
            </Box>
        </Flex>

        <Flex h="calc(100% - 60px)" align="center" justify="center">
            {/* SVG Funnel Visualization */}
            <svg width="100%" height="150" viewBox="0 0 400 150">
                {/* Connections */}
                <path d="M 50 75 Q 125 75 200 75" stroke="rgba(255,255,255,0.1)" strokeWidth="40" fill="none" />
                <path d="M 200 75 Q 300 75 350 75" stroke="rgba(255,255,255,0.1)" strokeWidth="20" fill="none" />
                
                {/* Active Pressure Connection */}
                <path 
                  d="M 200 75 Q 300 75 350 75" 
                  stroke={compColor} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="10 5"
                  style={{ animation: "flow 2s infinite linear" }}
                />

                {/* Nodes */}
                <g transform="translate(50, 75)">
                    <circle r="30" fill="bg.primary" stroke="whiteAlpha.300" strokeWidth="1" />
                    <text textAnchor="middle" dy="-5" fontSize="12" fontWeight="950" fill="white">{team.metrics.opponentDropbacks}</text>
                    <text textAnchor="middle" dy="15" fontSize="7" fontWeight="800" fill="text.muted" textTransform="uppercase">Dropbacks</text>
                </g>

                <g transform="translate(200, 75)">
                    <circle r="35" fill="bg.primary" stroke="#F6AD55" strokeWidth="2" />
                    <text textAnchor="middle" dy="-5" fontSize="14" fontWeight="950" fill="#F6AD55">{team.metrics.pressures}</text>
                    <text textAnchor="middle" dy="15" fontSize="7" fontWeight="800" fill="text.muted" textTransform="uppercase">Pressured</text>
                </g>

                <g transform="translate(350, 75)">
                    <circle r="30" fill={compColor} opacity={0.2} />
                    <circle r="25" fill="bg.primary" stroke={compColor} strokeWidth="2" />
                    <text textAnchor="middle" dy="-5" fontSize="14" fontWeight="950" fill={compColor}>{fmtPct(team.metrics.pressureCompPct)}</text>
                    <text textAnchor="middle" dy="15" fontSize="7" fontWeight="800" fill="text.muted" textTransform="uppercase">Comp% Alwd</text>
                </g>
            </svg>
        </Flex>

        <VStack align="stretch" mt="10px" gap="10px">
            <Box p="10px" bg="whiteAlpha.50" borderRadius="md" borderLeft={`4px solid ${compColor}`}>
                <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase">Impact Summary</Text>
                <Text fontSize="13px" fontWeight="600" color="text.secondary" mt="4px">
                    The {team.meta.shortName} rush pressured {team.metrics.pressures} attempts, holding the opponent to just **{team.metrics.pressureCompletions}** completions under duress.
                </Text>
            </Box>
        </VStack>

        <style>
          {`
            @keyframes flow {
              from { stroke-dashoffset: 45; }
              to { stroke-dashoffset: 0; }
            }
          `}
        </style>
    </Box>
  );
};

const HavocTable = ({ team }) => (
    <VStack align="stretch" gap={0} h="full" bg="rgba(0,0,0,0.2)" p="10px">
      <Flex align="center" gap={2} mb="8px">
          <Box w="4px" h="14px" bg={team.meta.colors.accent} borderRadius="full" />
          <Text fontSize="12px" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.05em">Havoc Producers</Text>
      </Flex>
      <Grid templateColumns="1.5fr repeat(6, 1fr)" gap="4px" borderBottom="1px solid whiteAlpha.200" pb="4px" mb="4px">
          <Text fontSize="9px" fontWeight="900" color="text.muted" textTransform="uppercase">Player</Text>
          {["Tkl", "TFL", "Sck", "PD", "FF", "QBH"].map(h => (
              <Text key={h} fontSize="9px" fontWeight="900" color="text.muted" textTransform="uppercase" textAlign="center">{h}</Text>
          ))}
      </Grid>
      <Box flex={1} overflowY="auto" pr="4px">
          {team.leaders.map((p) => (
              <Grid key={p.name} templateColumns="1.5fr repeat(6, 1fr)" gap="4px" py="6px" borderBottom="1px solid whiteAlpha.50" _hover={{ bg: "whiteAlpha.50" }} alignItems="center">
                  <HStack gap={2}>
                      <Box w="24px" h="24px" bg="whiteAlpha.100" borderRadius="md" display="flex" align="center" justify="center" overflow="hidden"><Waves size={14} color="gray" /></Box>
                      <VStack align="start" gap={0}>
                          <Text fontSize="11px" fontWeight="950" color="white" lineClamp={1}>{p.name}</Text>
                          <Text fontSize="8px" fontWeight="800" color="text.muted">{p.pos}</Text>
                      </VStack>
                  </HStack>
                  {[p.tkl, p.tfl, p.sck, p.pd, p.ff, p.qbh].map((val, i) => (
                      <Text key={i} fontSize="12px" fontWeight={val > 0 ? "900" : "500"} color={val > 0 ? "white" : "text.muted"} textAlign="center">{val > 0 ? (Number.isInteger(val) ? val : val.toFixed(1)) : "—"}</Text>
                  ))}
              </Grid>
          ))}
      </Box>
    </VStack>
  );

const TeamPanel = ({ teamKey }) => {
    const team = DATA[teamKey];
    return (
      <VStack align="stretch" gap="10px" h="full">
        <SynergyStrip team={team} />
        <Grid templateColumns="4.5fr 5.5fr" gap="10px" flex={1} minH={0}>
            <HavocTable team={team} />
            <PressureFunnel team={team} />
        </Grid>
      </VStack>
    );
  };

export const GameProductionDefensePressureProfile = () => {
    return (
        <Grid templateColumns="1fr 1fr" gap="20px" p="20px" bg="bg.primary" h="650px" w="full">
            <TeamPanel teamKey="jsu" />
            <TeamPanel teamKey="pvamu" />
        </Grid>
    );
};
