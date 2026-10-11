import React from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { User } from "lucide-react";

/**
 * GameProductionDefenseHavocHeat
 * 
 * PHILOSOPHY:
 *   Purpose: Display defensive impact focusing on Havoc events and spatial dominance.
 *   Grid slot: 4x2 (Compensates for both teams in a single view)
 * 
 * CONTENT TIERS:
 *   Top (4x1): "The Fortress Bar" - Three editorial Impact Pillars.
 *   Bottom Left (45%): "The Havoc Room" - 6-column leader table with player portraits.
 *   Bottom Right (55%): "The Heat Zone" - Spatial SVG field map placing havoc events.
 */

const DATA = {
  jsu: {
    meta: {
      name: "Jackson State",
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
      mascot: "Tigers",
    },
    impact: {
      stopRate: 0.67,
      disruptionGrade: "A-",
      disruptionPct: 0.132,
      explosivePrevention: 0.855,
      pressureRate: 0.20,
      stuffRate: 0.196,
      bendIndex: 21.95,
      takeaways: 3,
    },
    leaders: [
      { name: "Pulliam,R.", pos: "LB", tkl: 10.5, tfl: 0.5, sck: 0, pd: 1, ff: 0, qbh: 1 },
      { name: "Sallis,K.", pos: "DB", tkl: 9.0, tfl: 0, sck: 0, pd: 0, ff: 1, qbh: 0 },
      { name: "Hawkins,S.", pos: "DB", tkl: 7.0, tfl: 0, sck: 0, pd: 0, ff: 0, qbh: 1 },
      { name: "Ivory,Q.", pos: "DL", tkl: 4.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, qbh: 1 },
      { name: "Taylor,A.", pos: "DL", tkl: 4.0, tfl: 2.0, sck: 0, pd: 0, ff: 0, qbh: 2 },
      { name: "Williams,J.", pos: "DL", tkl: 3.5, tfl: 1.0, sck: 0, pd: 0, ff: 1, qbh: 0 },
      { name: "Brown Jr.,J.", pos: "DL", tkl: 1.0, tfl: 1.0, sck: 1.0, pd: 0, ff: 0, qbh: 0 },
    ],
    // Spatial mapping for the Star (X: 0-100 Field Width, Y: 0-100 Depth from LOS)
    // LOS is at Y=50. Backfield < 50, Secondary > 50.
    events: [
      { type: "Sck", x: 45, y: 35, player: "Brown Jr." },
      { type: "TFL", x: 20, y: 45, player: "Taylor" },
      { type: "TFL", x: 70, y: 42, player: "Williams" },
      { type: "FF", x: 55, y: 30, player: "Sallis" },
      { type: "PD", x: 15, y: 85, player: "Pulliam" },
      { type: "QBH", x: 40, y: 38, player: "Taylor" },
      { type: "QBH", x: 60, y: 40, player: "Ivory" },
    ]
  },
  pvamu: {
    meta: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFFFFF", accent: "#FFB81C" },
      mascot: "Panthers",
    },
    impact: {
      stopRate: 0.73,
      disruptionGrade: "B+",
      disruptionPct: 0.167,
      explosivePrevention: 0.881,
      pressureRate: 0.167,
      stuffRate: 0.231,
      bendIndex: 14.65,
      takeaways: 2,
    },
    leaders: [
      { name: "Starling,D.", pos: "LB", tkl: 6.0, tfl: 1.0, sck: 0.5, pd: 0, ff: 0, qbh: 0 },
      { name: "Parker,K.", pos: "DL", tkl: 5.0, tfl: 1.0, sck: 0, pd: 0, ff: 0, qbh: 0 },
      { name: "Randle,T.", pos: "DB", tkl: 4.0, tfl: 0, sck: 0, pd: 1, ff: 0, qbh: 0 },
      { name: "Amao,K.", pos: "DB", tkl: 3.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, qbh: 0 },
      { name: "Roberts,S.", pos: "LB", tkl: 1.5, tfl: 0, sck: 0, pd: 0, ff: 0, qbh: 2 },
    ],
    events: [
      { type: "Sck", x: 50, y: 38, player: "Starling" },
      { type: "TFL", x: 30, y: 48, player: "Parker" },
      { type: "PD", x: 80, y: 75, player: "Randle" },
      { type: "QBH", x: 45, y: 35, player: "Roberts" },
      { type: "QBH", x: 55, y: 35, player: "Roberts" },
    ]
  }
};

const fmtPct = (n) => `${Math.round(n * 100)}%`;

// ─── THE FORTRESS BAR (4x1) ───
const ImpactBar = ({ team }) => (
  <Grid templateColumns="repeat(4, 1fr)" gap="1px" bg="whiteAlpha.100" border="1px solid whiteAlpha.200" overflow="hidden">
    {/* Identity Block */}
    <Box bg={team.meta.colors.primary} p="10px" position="relative" overflow="hidden" display="flex" alignItems="center">
        <Box position="absolute" right="-10px" bottom="-10px" opacity={0.1}>
            <Text fontSize="60px" fontWeight="950" color="white" lineHeight={1}>{team.meta.shortName}</Text>
        </Box>
        <VStack align="start" gap={0} zIndex={1}>
            <Text fontSize="10px" fontWeight="900" color={team.meta.colors.accent} textTransform="uppercase" letterSpacing="0.1em">Dominance Hub</Text>
            <Text fontSize="24px" fontWeight="950" color="white" lineHeight={1} textTransform="uppercase">{team.meta.name}</Text>
        </VStack>
    </Box>

    {/* Metric Bloc 1: Grade & Stop */}
    <Flex bg="bg.secondary" px="15px" py="10px" align="center" justify="space-between" borderRight="1px solid whiteAlpha.50">
        <VStack align="start" gap={0}>
            <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase">Defensive Grade</Text>
            <Text fontSize="28px" fontWeight="950" color="white" lineHeight={1}>{team.impact.disruptionGrade}</Text>
        </VStack>
        <VStack align="end" gap={0}>
            <Text fontSize="22px" fontWeight="950" color="#68D391" lineHeight={1}>{fmtPct(team.impact.stopRate)}</Text>
            <Text fontSize="8px" fontWeight="800" color="text.muted" textTransform="uppercase">Stop Rate</Text>
        </VStack>
    </Flex>

    {/* Metric Bloc 2: Disruption & Explosive */}
    <Flex bg="bg.secondary" px="15px" py="10px" align="center" justify="space-between" borderRight="1px solid whiteAlpha.50">
        <VStack align="start" gap={0}>
            <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase">Havoc Rate</Text>
            <Text fontSize="24px" fontWeight="950" color="#E53E3E" lineHeight={1}>{fmtPct(team.impact.disruptionPct)}</Text>
        </VStack>
        <VStack align="end" gap={0}>
            <Text fontSize="22px" fontWeight="950" color="#63B3ED" lineHeight={1}>{fmtPct(team.impact.explosivePrevention)}</Text>
            <Text fontSize="8px" fontWeight="800" color="text.muted" textTransform="uppercase">Expl Prevention</Text>
        </VStack>
    </Flex>

    {/* Metric Bloc 3: Pressure & Takeaways */}
    <Flex bg="bg.secondary" px="15px" py="10px" align="center" justify="space-between">
        <VStack align="start" gap={0}>
            <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase">Pressure Rate</Text>
            <Text fontSize="24px" fontWeight="950" color="#F6AD55" lineHeight={1}>{fmtPct(team.impact.pressureRate)}</Text>
        </VStack>
        <Box px="12px" py="4px" bg={team.meta.colors.accent} borderRadius="sm">
            <Text fontSize="20px" fontWeight="950" color="white" lineHeight={1}>{team.impact.takeaways}</Text>
            <Text fontSize="8px" fontWeight="900" color="white" textTransform="uppercase" mt="1px">Takeaways</Text>
        </Box>
    </Flex>
  </Grid>
);

// ─── THE HAVOC ROOM (Leader Table) ───
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
        {team.leaders.map((p, idx) => (
            <Grid 
                key={p.name} 
                templateColumns="1.5fr repeat(6, 1fr)" 
                gap="4px" 
                py="6px" 
                borderBottom="1px solid whiteAlpha.50"
                _hover={{ bg: "whiteAlpha.50" }}
                alignItems="center"
            >
                <HStack gap={2}>
                    <Box w="24px" h="24px" bg="whiteAlpha.100" borderRadius="md" display="flex" align="center" justify="center" overflow="hidden">
                        <User size={14} color="gray" />
                    </Box>
                    <VStack align="start" gap={0}>
                        <Text fontSize="11px" fontWeight="950" color="white" lineClamp={1}>{p.name}</Text>
                        <Text fontSize="8px" fontWeight="800" color="text.muted">{p.pos}</Text>
                    </VStack>
                </HStack>
                {[p.tkl, p.tfl, p.sck, p.pd, p.ff, p.qbh].map((val, i) => (
                    <Text 
                        key={i} 
                        fontSize="12px" 
                        fontWeight={val > 0 ? "900" : "500"} 
                        color={val > 0 ? "white" : "text.muted"} 
                        textAlign="center"
                    >
                        {val > 0 ? (Number.isInteger(val) ? val : val.toFixed(1)) : "—"}
                    </Text>
                ))}
            </Grid>
        ))}
    </Box>
  </VStack>
);

// ─── THE HEAT ZONE (SVG Star) ───
const SpatialHeatMap = ({ team }) => {
  const getEventColor = (type) => {
    switch(type) {
      case "Sck": return "#68D391"; // Green
      case "TFL": return "#F6AD55"; // Orange
      case "FF": return "#E53E3E";  // Red
      case "PD": return "#63B3ED";  // Blue
      case "QBH": return team.meta.colors.accent;
      default: return "white";
    }
  };

  return (
    <Box h="full" w="full" position="relative" bg="bg.secondary" borderRadius="sm" p="15px">
        <Flex justify="space-between" align="start" mb="10px">
            <VStack align="start" gap={0}>
                <Text fontSize="14px" fontWeight="950" color="white" textTransform="uppercase">Havoc Spatial Log</Text>
                <Text fontSize="9px" fontWeight="700" color="text.muted" textTransform="uppercase">Impact mapping by field zone</Text>
            </VStack>
            <HStack gap="8px">
                {["Sck", "TFL", "FF", "PD", "QBH"].map(t => (
                    <HStack key={t} gap="4px">
                        <Box w="6px" h="6px" borderRadius="full" bg={getEventColor(t)} />
                        <Text fontSize="8px" fontWeight="900" color="text.muted" textTransform="uppercase">{t}</Text>
                    </HStack>
                ))}
            </HStack>
        </Flex>

        <Box position="relative" h="calc(100% - 35px)" border="1px solid whiteAlpha.100" bg="rgba(0,0,0,0.4)" borderRadius="sm" overflow="hidden">
            {/* Field Lines */}
            <Box position="absolute" top="0" bottom="0" left="0" right="0">
                {/* Yard Markers */}
                {[20, 40, 60, 80].map(y => (
                    <Box key={y} position="absolute" top={`${y}%`} left={0} right={0} h="1px" bg="whiteAlpha.100" />
                ))}
                {/* LOS Label */}
                <Box position="absolute" top="50%" left={2} zIndex={5} transform="translateY(-50%)">
                    <Text fontSize="8px" fontWeight="950" color="whiteAlpha.400" textTransform="uppercase">Line of Scrimmage</Text>
                </Box>
                <Box position="absolute" top="50%" left={0} right={0} h="2px" bg="whiteAlpha.400" borderStyle="dashed" />
                
                {/* Hash Marks */}
                <Box position="absolute" top={0} bottom={0} left="35%" w="1px" bg="whiteAlpha.50" />
                <Box position="absolute" top={0} bottom={0} left="65%" w="1px" bg="whiteAlpha.50" />
            </Box>

            {/* Backfield Label (Top) */}
            <Box position="absolute" top="10%" left="50%" transform="translateX(-50%)" opacity={0.3}>
                 <Text fontSize="40px" fontWeight="950" color="whiteAlpha.200" textTransform="uppercase" letterSpacing="0.2em">Backfield</Text>
            </Box>
            {/* Secondary Label (Bottom) */}
            <Box position="absolute" bottom="10%" left="50%" transform="translateX(-50%)" opacity={0.3}>
                 <Text fontSize="40px" fontWeight="950" color="whiteAlpha.200" textTransform="uppercase" letterSpacing="0.2em">Secondary</Text>
            </Box>

            {/* Events Mapping */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <radialGradient id="glowSck" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#68D391" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#68D391" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="glowFF" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#E53E3E" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#E53E3E" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {team.events.map((ev, i) => (
                    <g key={i}>
                        <circle cx={`${ev.x}%`} cy={`${ev.y}%`} r={ev.type === "Sck" || ev.type === "FF" ? "12" : "6"} fill={ev.type === "Sck" ? "url(#glowSck)" : ev.type === "FF" ? "url(#glowFF)" : "transparent"} />
                        <circle cx={`${ev.x}%`} cy={`${ev.y}%`} r="3" fill={getEventColor(ev.type)} />
                        <text x={`${ev.x + 1.5}%`} y={`${ev.y - 1.5}%`} fontSize="8px" fontWeight="900" fill="white" style={{ textShadow: "0px 0px 4px black" }}>{ev.type}</text>
                        <text x={`${ev.x + 1.5}%`} y={`${ev.y + 2}%`} fontSize="6px" fontWeight="700" fill="text.muted" style={{ textShadow: "0px 0px 4px black" }}>{ev.player}</text>
                    </g>
                ))}
            </svg>
        </Box>
    </Box>
  );
};

const TeamPanel = ({ teamKey }) => {
  const team = DATA[teamKey];
  return (
    <VStack align="stretch" gap="10px" h="full">
      <ImpactBar team={team} />
      <Grid templateColumns="4.5fr 5.5fr" gap="10px" flex={1} minH={0}>
          <HavocTable team={team} />
          <SpatialHeatMap team={team} />
      </Grid>
    </VStack>
  );
};

export const GameProductionDefenseHavocHeat = () => {
    return (
        <Grid templateColumns="1fr 1fr" gap="20px" p="20px" bg="bg.primary" h="650px" w="full">
            <TeamPanel teamKey="jsu" />
            <TeamPanel teamKey="pvamu" />
        </Grid>
    );
};
