import React from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import {  Lock, Unlock, ArrowDownCircle, Target } from "lucide-react";

/**
 * GameProductionDefenseDownFortress
 * 
 * PHILOSOPHY:
 *   Purpose: Visualize how the defense restricts movement across the 4 downs.
 *   Grid slot: 4x2
 * 
 * CONTENT TIERS:
 *   Bottom Right (55%): "The Clamped Down" - Progress-style bars showing success rate per down.
 */

const DATA = {
  jsu: {
    meta: {
      name: "Jackson State",
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    metrics: {
      avgDistance: 8.00,
      earlyDownSuccess: 0.387,
      lateDownSuccess: 0.273,
      successRateAllowed: 0.342, // PVAMU's success rate against JSU
      thirdDownConversions: 2,
      thirdDownAttempts: 10,
    },
    leaders: [
      { name: "Pulliam,R.", pos: "LB", tkl: 10.5, tfl: 0.5, sck: 0, pd: 1, ff: 0, qbh: 1 },
      { name: "Sallis,K.", pos: "DB", tkl: 9.0, tfl: 0, sck: 0, pd: 0, ff: 1, qbh: 0 },
      { name: "Hawkins,S.", pos: "DB", tkl: 7.0, tfl: 0, sck: 0, pd: 0, ff: 0, qbh: 1 },
      { name: "Ivory,Q.", pos: "DL", tkl: 4.5, tfl: 0.5, sck: 0, pd: 0, ff: 0, qbh: 1 },
      { name: "Taylor,A.", pos: "DL", tkl: 4.0, tfl: 2.0, sck: 0, pd: 0, ff: 0, qbh: 2 },
    ],
  },
  pvamu: {
    meta: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFFFFF", accent: "#FFB81C" },
    },
    metrics: {
      avgDistance: 8.38,
      earlyDownSuccess: 0.264,
      lateDownSuccess: 0.522,
      successRateAllowed: 0.333, // JSU's success rate against PVAMU
      thirdDownConversions: 11,
      thirdDownAttempts: 21,
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

const FortressStrip = ({ team }) => (
  <Grid templateColumns="repeat(4, 1fr)" gap="1px" bg="whiteAlpha.100" border="1px solid whiteAlpha.200">
    <Flex bg={team.meta.colors.primary} p="15px" align="center" gap={3}>
        <Lock size={28} color={team.meta.colors.accent} />
        <VStack align="start" gap={0}>
            <Text fontSize="10px" fontWeight="900" color="whiteAlpha.600" textTransform="uppercase">Structure</Text>
            <Text fontSize="18px" fontWeight="950" color="white" lineHeight={1} textTransform="uppercase">{team.meta.shortName} FORTRESS</Text>
        </VStack>
    </Flex>
    <Box bg="bg.secondary" p="15px" borderRight="1px solid whiteAlpha.50">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Success Alwd</Text>
        <Text fontSize="24px" fontWeight="950" color="white">{fmtPct(team.metrics.successRateAllowed)}</Text>
    </Box>
    <Box bg="bg.secondary" p="15px" borderRight="1px solid whiteAlpha.50">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Avg 3rd Distance</Text>
        <HStack align="baseline" gap={1}>
            <Text fontSize="24px" fontWeight="950" color="#F6AD55">{team.metrics.avgDistance.toFixed(2)}</Text>
            <Text fontSize="10px" fontWeight="700" color="text.muted">YDS</Text>
        </HStack>
    </Box>
    <Box bg="bg.secondary" p="15px">
        <Text fontSize="9px" fontWeight="850" color="text.muted" textTransform="uppercase" mb="2px">Stop Efficiency</Text>
        <Text fontSize="24px" fontWeight="950" color="#68D391">{(100 - (team.metrics.successRateAllowed * 100)).toFixed(1)}%</Text>
    </Box>
  </Grid>
);

const DownClamps = ({ team }) => {
  const earlyLocked = team.metrics.earlyDownSuccess < 0.35;
  const lateLocked = team.metrics.lateDownSuccess < 0.35;
  const ClampBar = ({ value, locked }) => (
    <Box h="12px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
      <Box
        h="full"
        w={`${Math.min(100, Math.max(0, value * 100))}%`}
        bg={locked ? "#68D391" : "#E53E3E"}
        borderRadius="full"
      />
    </Box>
  );

  return (
    <Box h="full" w="full" bg={"bg.secondary"} borderRadius="sm" p="20px">
        <Flex justify="space-between" align="start" mb="25px">
            <VStack align="start" gap={0}>
                <Text fontSize="16px" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.05em">The Clamped Down</Text>
                <Text fontSize="9px" fontWeight="700" color="text.muted" textTransform="uppercase">Success Rate allowed by situation</Text>
            </VStack>
            <HStack bg="whiteAlpha.50" px="8px" py="4px" borderRadius="sm">
                <Target size={12} color="#F6AD55" />
                <Text fontSize="10px" fontWeight="900" color="white">STINGY DEFENSE</Text>
            </HStack>
        </Flex>

        <VStack gap="25px" align="stretch">
            {/* Early Downs */}
            <VStack align="stretch" gap="8px">
                <Flex justify="space-between" align="center">
                    <HStack>
                        {earlyLocked ? <Lock size={14} color="#68D391" /> : <Unlock size={14} color="#E53E3E" />}
                        <Text fontSize="11px" fontWeight="950" color="white" textTransform="uppercase">Early Downs (1st & 2nd)</Text>
                    </HStack>
                    <Text fontSize="14px" fontWeight="950" color={earlyLocked ? "#68D391" : "#E53E3E"}>{fmtPct(team.metrics.earlyDownSuccess)}</Text>
                </Flex>
                <ClampBar value={team.metrics.earlyDownSuccess} locked={earlyLocked} />
                <Text fontSize="8px" color="text.muted" fontWeight="700" textTransform="uppercase">Target: Below 35% Success Allowed</Text>
            </VStack>

            {/* Late Downs */}
            <VStack align="stretch" gap="8px">
                <Flex justify="space-between" align="center">
                    <HStack>
                        {lateLocked ? <Lock size={14} color="#68D391" /> : <Unlock size={14} color="#E53E3E" />}
                        <Text fontSize="11px" fontWeight="950" color="white" textTransform="uppercase">Late Downs (3rd & 4th)</Text>
                    </HStack>
                    <Text fontSize="14px" fontWeight="950" color={lateLocked ? "#68D391" : "#E53E3E"}>{fmtPct(team.metrics.lateDownSuccess)}</Text>
                </Flex>
                <ClampBar value={team.metrics.lateDownSuccess} locked={lateLocked} />
                <Text fontSize="8px" color="text.muted" fontWeight="700" textTransform="uppercase">Critical stops required for possession shift</Text>
            </VStack>

            <Box mt="10px" p="15px" bg="whiteAlpha.50" borderRadius="md" borderTop={`2px solid ${team.meta.colors.accent}`}>
                <Text fontSize="12px" fontWeight="700" color="text.secondary" lineHeight="tall">
                    {team.metrics.lateDownSuccess < team.metrics.earlyDownSuccess 
                      ? `The ${team.meta.shortName} defense significantly tightened in late-down situations, dropping its success rate allowed by ${Math.round((team.metrics.earlyDownSuccess - team.metrics.lateDownSuccess)*100)} points.`
                      : `The ${team.meta.shortName} defense was a wall on early downs, but struggled to get off the field in late-down critical situations.`
                    }
                </Text>
            </Box>
        </VStack>
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
                      <Box w="24px" h="24px" bg="whiteAlpha.100" borderRadius="md" display="flex" align="center" justify="center" overflow="hidden"><ArrowDownCircle size={14} color="gray" /></Box>
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
        <FortressStrip team={team} />
        <Grid templateColumns="4.5fr 5.5fr" gap="10px" flex={1} minH={0}>
            <HavocTable team={team} />
            <DownClamps team={team} />
        </Grid>
      </VStack>
    );
  };

export const GameProductionDefenseDownFortress = () => {
    return (
        <Grid templateColumns="1fr 1fr" gap="20px" p="20px" bg="bg.primary" h="650px" w="full">
            <TeamPanel teamKey="jsu" />
            <TeamPanel teamKey="pvamu" />
        </Grid>
    );
};
