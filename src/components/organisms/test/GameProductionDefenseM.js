import { useMemo } from "react";
import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import { GitCommit } from "lucide-react";

// Matches data from the 2025 SWAC Championship game (JSU vs PVAMU)
const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      opponent: "PVAMU",
      colors: { primary: "#002147", accent: "#4A90D9" },
    },
    team: {
      plays: 76,
      stopRate: 0.67,
      disruptionRate: 0.1316,
      explosivePrevention: 0.8553,
      bendDontBreak: 21.95,
      yppAllowed: 6.07,
      takeaways: 3,
      sacks: 1,
      tfls: 6,
      pds: 2,
      ffs: 2,
      qbhs: 5,
    },
    splits: {
      dl: 0.45,
      lb: 0.30,
      db: 0.25,
    },
    defenders: [
      { name: "Pulliam", pos: "LB", tackles: 10.5, tfl: 0.5, sacks: 0, pd: 1, ff: 0, havoc: 2.5 },
      { name: "Sallis", pos: "DB", tackles: 9.0, tfl: 0, sacks: 0, pd: 0, ff: 1, havoc: 1.0 },
      { name: "Hawkins", pos: "DB", tackles: 7.0, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 1.0 },
      { name: "Ivory", pos: "DL", tackles: 4.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 1.5 },
      { name: "Taylor", pos: "DL", tackles: 4.0, tfl: 2.0, sacks: 0, pd: 0, ff: 0, havoc: 4.0 },
      { name: "Washington", pos: "LB", tackles: 4.0, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 0.5 },
      { name: "Williams", pos: "DL", tackles: 3.5, tfl: 1.0, sacks: 0, pd: 0, ff: 1, havoc: 2.0 },
      { name: "Chisholm", pos: "DB", tackles: 3.0, tfl: 0, sacks: 0, pd: 1, ff: 0, havoc: 1.0 },
    ],
    timeline: [
      { time: "Q1 · 08:14", play: "FF Forced by Kam Sallis (DB)", key: "sallis-ff", color: "#E53E3E" },
      { time: "Q3 · 12:45", play: "FF Forced by Jeremiah Williams (DL)", key: "williams-ff", color: "#E53E3E" },
      { time: "Q4 · 02:11", play: "Pass Defended by KJ Chisholm (DB)", key: "chisholm-pd", color: "#63B3ED" },
    ],
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      opponent: "JSU",
      colors: { primary: "#4B0082", accent: "#FFB81C" },
    },
    team: {
      plays: 42,
      stopRate: 0.67,
      disruptionRate: 0.1667,
      explosivePrevention: 0.881,
      bendDontBreak: 14.65,
      yppAllowed: 6.98,
      takeaways: 2,
      sacks: 1,
      tfls: 4,
      pds: 1,
      ffs: 0,
      qbhs: 2,
    },
    splits: {
      dl: 0.50,
      lb: 0.25,
      db: 0.25,
    },
    defenders: [
      { name: "Starling", pos: "LB", tackles: 6.0, tfl: 1.0, sacks: 0.5, pd: 0, ff: 0, havoc: 1.5 },
      { name: "Parker", pos: "DL", tackles: 5.0, tfl: 1.0, sacks: 0, pd: 0, ff: 0, havoc: 1.0 },
      { name: "Randle", pos: "DB", tackles: 4.0, tfl: 0, sacks: 0, pd: 1, ff: 0, havoc: 1.0 },
      { name: "Amao", pos: "DB", tackles: 3.5, tfl: 0.5, sacks: 0, pd: 0, ff: 0, havoc: 0.5 },
      { name: "McGee", pos: "DB", tackles: 2.5, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0.0 },
      { name: "Davis", pos: "LB", tackles: 2.0, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0.0 },
      { name: "Ward", pos: "DL", tackles: 2.0, tfl: 0, sacks: 0, pd: 0, ff: 0, havoc: 0.0 },
    ],
    timeline: [
      { time: "Q2 · 09:30", play: "0.5 Sack by Darrell Starling (LB)", key: "starling-sck", color: "#68D391" },
      { time: "Q3 · 04:12", play: "Pass Defended by Travor Randle (DB)", key: "randle-pd", color: "#63B3ED" },
    ],
  },
};

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmtValue = (n) => (Number.isInteger(n) ? n : (n ?? 0).toFixed(1));

const TeamFingerprintStrip = ({ data }) => {
  const metrics = [
    { label: "Snaps", value: data.team.plays, color: data.meta.colors.accent },
    { label: "Stop%", value: fmtPct(data.team.stopRate), color: "#68D391" },
    { label: "Disrupt%", value: fmtPct(data.team.disruptionRate), color: "#E53E3E" },
    { label: "Expl Prevent", value: fmtPct(data.team.explosivePrevention), color: "#68D391" },
    { label: "YPP Alwd", value: `${fmtValue(data.team.yppAllowed)}y`, color: "#F6AD55" },
    { label: "Bend Indx", value: fmtValue(data.team.bendDontBreak), color: "#63B3ED" },
  ];

  return (
    <Box 
      px="6px" 
      py="5px" 
      bg={`linear-gradient(180deg, rgba(20, 20, 22, 0.6) 0%, rgba(20, 20, 22, 0.3) 100%)`}
      borderBottom="1px solid rgba(255,255,255,0.08)"
    >
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="4px">
        {metrics.map((metric) => (
          <Flex 
            key={metric.label} 
            direction="column" 
            align="center"
            justify="center"
            bg="rgba(255,255,255,0.02)" 
            border="1px solid rgba(255,255,255,0.05)" 
            borderRadius="xs" 
            py="3px"
          >
            <Text fontSize="clamp(9.5px, 0.85vw, 12px)" color={metric.color} fontWeight="950" lineHeight={1}>{metric.value}</Text>
            <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1.5px" truncate>{metric.label}</Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

const PlayerTable = ({ data }) => {
  const players = useMemo(() => {
    return data.defenders.filter((p) => p.tackles >= 2 || p.havoc > 0);
  }, [data.defenders]);

  return (
    <VStack align="stretch" gap={0} h="full" minH={0} bg="rgba(20, 20, 22, 0.2)" borderRight="1px solid rgba(255,255,255,0.08)" p="5px">
      <Flex align="center" justify="space-between" mb="3px">
        <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          Defender Havoc Breakdown
        </Text>
      </Flex>
      <Grid templateColumns="1.3fr 0.5fr repeat(6, 1fr)" gap={1} py="3px" borderBottom="2px solid rgba(255,255,255,0.12)">
        {["Player", "Pos", "Tkl", "TFL", "Sck", "PD", "FF", "Havoc"].map((head) => (
          <Text 
            key={head} 
            fontSize="6.5px" 
            color="text.muted" 
            fontWeight="950" 
            textTransform="uppercase" 
            textAlign={head === "Player" || head === "Pos" ? "left" : "right"}
          >
            {head}
          </Text>
        ))}
      </Grid>
      <Box flex={1} minH={0} overflowY="auto">
        {players.map((player) => (
          <Grid 
            key={player.name} 
            templateColumns="1.3fr 0.5fr repeat(6, 1fr)" 
            gap={1} 
            alignItems="center" 
            py="4px" 
            borderBottom="1px solid rgba(255,255,255,0.06)" 
            _hover={{ bg: "rgba(255,255,255,0.03)" }}
            borderLeft={player.havoc >= 2 ? `2px solid ${data.meta.colors.accent}` : "2px solid transparent"}
          >
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color="text.primary" fontWeight="900" truncate pl="1px">
              {player.name}
            </Text>
            <Text fontSize="6.5px" color="text.muted" fontWeight="800">
              {player.pos}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color="text.secondary" fontWeight="850" textAlign="right">
              {fmtValue(player.tackles)}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.tfl > 0 ? data.meta.colors.accent : "text.muted"} fontWeight="850" textAlign="right">
              {player.tfl > 0 ? fmtValue(player.tfl) : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.sacks > 0 ? "#68D391" : "text.muted"} fontWeight="900" textAlign="right">
              {player.sacks > 0 ? fmtValue(player.sacks) : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.pd > 0 ? "#63B3ED" : "text.muted"} fontWeight="850" textAlign="right">
              {player.pd > 0 ? player.pd : "-"}
            </Text>
            <Text fontSize="clamp(8px, 0.65vw, 9.5px)" color={player.ff > 0 ? "#E53E3E" : "text.muted"} fontWeight="850" textAlign="right">
              {player.ff > 0 ? player.ff : "-"}
            </Text>
            <Text 
              fontSize="clamp(8.5px, 0.65vw, 9.5px)" 
              color={player.havoc >= 2 ? data.meta.colors.accent : "text.secondary"} 
              fontWeight="950" 
              textAlign="right"
            >
              {player.havoc > 0 ? fmtValue(player.havoc) : "-"}
            </Text>
          </Grid>
        ))}
      </Box>
    </VStack>
  );
};

const DisruptionVisuals = ({ data }) => {
  return (
    <Grid templateRows="auto 1fr" gap="4px" h="full" minH={0} p="6px">
      {/* Visual A: Havoc Sector Splits */}
      <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="6px">
        <Flex justify="space-between" align="center" mb="3px">
          <Text fontSize="7.5px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
            Havoc Levels (DL vs LB vs DB)
          </Text>
        </Flex>
        {/* Dynamic Horizontal Split Bar */}
        <Box h="8px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden" display="flex">
          <Box h="full" w={`${data.splits.dl * 100}%`} bg="#F56565" title={`DL: ${fmtPct(data.splits.dl)}`} />
          <Box h="full" w={`${data.splits.lb * 100}%`} bg="#F6AD55" title={`LB: ${fmtPct(data.splits.lb)}`} />
          <Box h="full" w={`${data.splits.db * 100}%`} bg="#63B3ED" title={`DB: ${fmtPct(data.splits.db)}`} />
        </Box>
        <Flex justify="space-between" mt="2px">
          <Text fontSize="6px" color="#F56565" fontWeight="850">DL {fmtPct(data.splits.dl)}</Text>
          <Text fontSize="6px" color="#F6AD55" fontWeight="850">LB {fmtPct(data.splits.lb)}</Text>
          <Text fontSize="6px" color="#63B3ED" fontWeight="850">DB {fmtPct(data.splits.db)}</Text>
        </Flex>
      </Box>

      {/* Visual B & C in side-by-side columns */}
      <Grid templateColumns="1fr 1fr" gap="4px" minH={0}>
        {/* Visual B: Havoc Chemistry Grid */}
        <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="4px" display="flex" direction="column">
          <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" mb="3px">
            Havoc Grid
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap="2px" flex={1}>
            {[
              { label: "Sck", val: data.team.sacks, color: "#68D391" },
              { label: "TFL", val: data.team.tfls, color: "#F6AD55" },
              { label: "PD", val: data.team.pds, color: "#63B3ED" },
              { label: "FF", val: data.team.ffs, color: "#E53E3E" },
              { label: "QBH", val: data.team.qbhs, color: "#F6AD55" },
              { label: "TKW", val: data.team.takeaways, color: "#68D391" },
            ].map((chem) => (
              <Flex 
                key={chem.label} 
                direction="column" 
                align="center" 
                justify="center" 
                bg="rgba(255,255,255,0.02)" 
                border={`1px solid ${chem.color}22`} 
                borderRadius="xs"
                py="1px"
              >
                <Text fontSize="10px" color={chem.color} fontWeight="950" lineHeight={1}>{chem.val}</Text>
                <Text fontSize="5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1px">{chem.label}</Text>
              </Flex>
            ))}
          </Grid>
        </Box>

        {/* Visual C: Momentum Turnover Timeline */}
        <Box border="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.01)" borderRadius="sm" p="4px" display="flex" direction="column" minH={0}>
          <Text fontSize="7.5px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" mb="3px">
            Takeaway Ledger
          </Text>
          <VStack align="stretch" gap="3px" flex={1} overflowY="auto" pr="1px">
            {data.timeline.length > 0 ? (
              data.timeline.map((item) => (
                <Flex key={item.key} align="center" gap="3px">
                  <GitCommit size={6} color={item.color} style={{ flexShrink: 0 }} />
                  <Box minW={0}>
                    <Text fontSize="5.5px" color="text.muted" fontWeight="850">{item.time}</Text>
                    <Text fontSize="6.5px" color="text.primary" fontWeight="900" truncate>{item.play}</Text>
                  </Box>
                </Flex>
              ))
            ) : (
              <Flex justify="center" align="center" h="full">
                <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">
                  No Takeaways
                </Text>
              </Flex>
            )}
          </VStack>
        </Box>
      </Grid>
    </Grid>
  );
};

const TeamPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  return (
    <Flex direction="column" h="full" minH={0}>
      {/* Visual Title strip for side-by-side context */}
      <Flex px="8px" py="4px" bg={data.meta.colors.primary} borderBottom="1px solid rgba(255,255,255,0.08)" align="center" gap={1.5}>
        <Box w="3px" h="10px" bg={data.meta.colors.accent} borderRadius="full" />
        <Text fontSize="9px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
          {data.meta.shortName} Defensive DNA
        </Text>
      </Flex>
      <TeamFingerprintStrip data={data} />
      <Grid templateColumns="minmax(0, 1.45fr) minmax(0, 1.75fr)" gap="0" flex={1} minH={0}>
        <Box h="full" minH={0}>
          <PlayerTable data={data} />
        </Box>
        <Box h="full" minH={0}>
          <DisruptionVisuals data={data} />
        </Box>
      </Grid>
    </Flex>
  );
};

export const GameProductionDefenseM = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
      {/* Side by Side Split panels - Always horizontal to fit the 4x2 aspect ratio */}
      <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)" h="full">
        <TeamPanel teamKey="jsu" />
      </Box>
      <Box flex={1} minW={0} h="full">
        <TeamPanel teamKey="pvamu" />
      </Box>
    </Flex>
  );
};
