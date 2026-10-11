import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";

const TEAMS = {
  jsu: {
    meta: {
      shortName: "JSU",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    team: {
      attempts: 26,
      yards: 95,
      touchdowns: 2,
      ypc: 3.65,
      lineYards: 68.3,
      lineYpc: 2.63,
      highlightYards: 26.7,
      highlightYpc: 1.03,
      opportunityRate: 0.423,
      opportunityRuns: 11,
      stuffRate: 0.231,
      stuffedRuns: 6,
      stoppedRate: 0.423,
      successfulRuns: 10,
      rushSuccessRate: 0.385,
      firstAndTenRushes: 12,
      firstDownRuns: 5,
      explosiveRuns: 2,
      rushEpa: 1.13,
      rushEpaPerCarry: 0.04,
    },
    lanes: {
      left: { attempts: 12, yards: 30, success: 4, touchdowns: 0 },
      middle: { attempts: 11, yards: 36, success: 5, touchdowns: 1 },
      right: { attempts: 3, yards: 29, success: 1, touchdowns: 1 },
    },
    rushers: [
      {
        name: "Miller,Ahmad",
        key: "name:miller,ahmad",
        position: "RB",
        attempts: 13,
        yards: 27,
        touchdowns: 1,
        firstAndTen: 6,
        firstDowns: 3,
        explosive: 0,
        epa: 1,
        production: 4.98,
        lanes: {
          left: { attempts: 8, yards: 14, success: 3, touchdowns: 0 },
          middle: { attempts: 5, yards: 13, success: 3, touchdowns: 1 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Terrell Jr,Travis",
        key: "name:terrell jr,travis",
        position: "RB",
        attempts: 9,
        yards: 34,
        touchdowns: 0,
        firstAndTen: 6,
        firstDowns: 1,
        explosive: 1,
        epa: -0.71,
        production: 1.83,
        lanes: {
          left: { attempts: 1, yards: 11, success: 1, touchdowns: 0 },
          middle: { attempts: 6, yards: 23, success: 2, touchdowns: 0 },
          right: { attempts: 2, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Morgan,JaCobian",
        key: "name:morgan,jacobian",
        position: "QB",
        attempts: 2,
        yards: 28,
        touchdowns: 1,
        firstAndTen: 0,
        firstDowns: 1,
        explosive: 1,
        epa: 1.78,
        production: 4.14,
        lanes: {
          left: { attempts: 1, yards: -1, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 1, yards: 29, success: 1, touchdowns: 1 },
        },
      },
      {
        name: "Paul,Kobe",
        key: "name:paul,kobe",
        position: "RB",
        attempts: 1,
        yards: 2,
        touchdowns: 0,
        firstAndTen: 0,
        firstDowns: 0,
        explosive: 0,
        epa: -0.43,
        production: 0.15,
        lanes: {
          left: { attempts: 1, yards: 2, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Lockhart,Jared",
        key: "name:lockhart,jared",
        position: "QB",
        attempts: 1,
        yards: 4,
        touchdowns: 0,
        firstAndTen: 0,
        firstDowns: 0,
        explosive: 0,
        epa: -0.51,
        production: 0.27,
        lanes: {
          left: { attempts: 1, yards: 4, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
    ],
    opponent: {
      shortName: "PVAMU",
      metrics: {
      stuffRate: 0.231,
      stopRate: 0.423,
      opportunityRate: 0.423,
      tflRate: 0.095,
      havocRate: 0.167,
      explosivePrevention: 0.881,
      powerRunStopRate: 0.67,
      firstDownRushSuccessAllowed: 0.42,
      },
      stoppers: [
        { name: "Starling,Darrell", tackles: 6, tfl: 1, ff: 0 },
        { name: "Parker,Kennedy", tackles: 5, tfl: 1, ff: 0 },
        { name: "Randle,Travor", tackles: 4, tfl: 0, ff: 0 },
        { name: "Amao,Kamren", tackles: 3.5, tfl: 0.5, ff: 0 },
      ],
    },
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      colors: { primary: "#4B0082", secondary: "#FFB81C", accent: "#FFB81C" },
    },
    team: {
      attempts: 48,
      yards: 155,
      touchdowns: 1,
      ypc: 3.23,
      lineYards: 113.3,
      lineYpc: 2.46,
      highlightYards: 33.7,
      highlightYpc: 0.73,
      opportunityRate: 0.304,
      opportunityRuns: 14,
      stuffRate: 0.196,
      stuffedRuns: 9,
      stoppedRate: 0.435,
      successfulRuns: 15,
      rushSuccessRate: 0.326,
      firstAndTenRushes: 14,
      firstDownRuns: 10,
      explosiveRuns: 4,
      rushEpa: -11.52,
      rushEpaPerCarry: -0.25,
    },
    lanes: {
      left: { attempts: 15, yards: 34, success: 3, touchdowns: 0 },
      middle: { attempts: 25, yards: 110, success: 11, touchdowns: 1 },
      right: { attempts: 8, yards: 11, success: 1, touchdowns: 0 },
    },
    rushers: [
      {
        name: "Peters,Cameron",
        key: "name:peters,cameron",
        position: "QB",
        attempts: 23,
        yards: 103,
        touchdowns: 1,
        firstAndTen: 5,
        firstDowns: 9,
        explosive: 4,
        epa: -0.33,
        production: 7.54,
        lanes: {
          left: { attempts: 3, yards: 7, success: 0, touchdowns: 0 },
          middle: { attempts: 15, yards: 87, success: 8, touchdowns: 1 },
          right: { attempts: 5, yards: 9, success: 1, touchdowns: 0 },
        },
      },
      {
        name: "Bingmon,Chase",
        key: "name:bingmon,chase",
        position: "RB",
        attempts: 11,
        yards: 23,
        touchdowns: 0,
        firstAndTen: 5,
        firstDowns: 1,
        explosive: 0,
        epa: -5.95,
        production: 1.68,
        lanes: {
          left: { attempts: 6, yards: 15, success: 2, touchdowns: 0 },
          middle: { attempts: 4, yards: 10, success: 1, touchdowns: 0 },
          right: { attempts: 1, yards: -2, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Byrd,Shadrick",
        key: "name:byrd,shadrick",
        position: "QB",
        attempts: 4,
        yards: 22,
        touchdowns: 0,
        firstAndTen: 2,
        firstDowns: 1,
        explosive: 0,
        epa: 1.17,
        production: 1.26,
        lanes: {
          left: { attempts: 1, yards: 6, success: 1, touchdowns: 0 },
          middle: { attempts: 2, yards: 14, success: 2, touchdowns: 0 },
          right: { attempts: 1, yards: 2, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "McDowell,Lamagea",
        key: "name:mcdowell,lamagea",
        position: "RB",
        attempts: 5,
        yards: 6,
        touchdowns: 0,
        firstAndTen: 1,
        firstDowns: 0,
        explosive: 0,
        epa: -2.45,
        production: 0.63,
        lanes: {
          left: { attempts: 2, yards: 4, success: 0, touchdowns: 0 },
          middle: { attempts: 3, yards: 2, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
      {
        name: "Bonner,Cameron",
        key: "name:bonner,cameron",
        position: "RB",
        attempts: 1,
        yards: -6,
        touchdowns: 0,
        firstAndTen: 0,
        firstDowns: 0,
        explosive: 0,
        epa: -2.18,
        production: -0.09,
        lanes: {
          left: { attempts: 1, yards: -6, success: 0, touchdowns: 0 },
          middle: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
          right: { attempts: 0, yards: 0, success: 0, touchdowns: 0 },
        },
      },
    ],
    opponent: {
      shortName: "JSU",
      metrics: {
      stuffRate: 0.196,
      stopRate: 0.435,
      opportunityRate: 0.304,
      tflRate: 0.079,
      havocRate: 0.132,
      explosivePrevention: 0.855,
      powerRunStopRate: 0.5,
      firstDownRushSuccessAllowed: 0.31,
      },
      stoppers: [
        { name: "Pulliam,Reid", tackles: 10.5, tfl: 0.5, ff: 0 },
        { name: "Sallis,Kam", tackles: 9, tfl: 0, ff: 1 },
        { name: "Hawkins,Shamar", tackles: 7, tfl: 0, ff: 0 },
        { name: "Taylor,Ashton", tackles: 4, tfl: 2, ff: 0 },
      ],
    },
  },
};

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmt2 = (n) => (n ?? 0).toFixed(2);

function getFirstName(name) {
  return name.split(",")[1]?.trim() || "";
}

function getLastName(name) {
  return name.split(",")[0]?.trim() || "";
}

function getDisplayName(name) {
  return name.includes(",") ? `${getFirstName(name)} ${getLastName(name)}` : name;
}

function getInitials(name) {
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  return `${getFirstName(name)[0] || ""}${getLastName(name)[0] || ""}`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 229, g: 62, b: 62 };
}

function laneBg(successRate, teamColor) {
  const rgb = hexToRgb(teamColor);
  const opacity = 0.14 + Math.min(0.62, successRate * 0.62);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

const CompactRunTables = ({ data }) => {
  const accent = data.meta.colors.accent;
  const rowStyle = {
    fontSize: "clamp(8px, 0.72vw, 10px)",
    fontWeight: "800",
    color: "text.muted",
    textTransform: "uppercase",
  };

  const teamLine = {
    title: "Team Line",
    bar: "#E53E3E",
    cols: ["CAR", "YDS", "YPC", "TD", "EPA"],
    values: [data.team.attempts, data.team.yards, fmt2(data.team.ypc), data.team.touchdowns, fmt2(data.team.rushEpa)],
  };

  const attributionTables = [
    {
      title: "RB Created",
      bar: accent,
      cols: ["HL YDS", "HL/C", "OPP", "EXP", "1&10"],
      values: [fmt1(data.team.highlightYards), fmt2(data.team.highlightYpc), `${data.team.opportunityRuns} (${fmtPct(data.team.opportunityRate)})`, data.team.explosiveRuns, data.team.firstAndTenRushes],
    },
    {
      title: "Shared",
      bar: "#E53E3E",
      cols: ["SUCC", "RATE", "1D", "EXP", "EPA/C"],
      values: [data.team.successfulRuns, fmtPct(data.team.rushSuccessRate), data.team.firstDownRuns, data.team.explosiveRuns, fmt2(data.team.rushEpaPerCarry)],
    },
    {
      title: "OL Earned",
      bar: "#F6AD55",
      cols: ["LY", "LY/C", "STUFF", "RATE", "STOP"],
      values: [fmt1(data.team.lineYards), fmt2(data.team.lineYpc), data.team.stuffedRuns, fmtPct(data.team.stuffRate), fmtPct(data.team.stoppedRate)],
    },
  ];

  const renderTable = (table, columns = 5, showTitle = true) => (
    <VStack key={table.title} gap={0} align="stretch">
      {showTitle && (
        <Flex align="center" gap={1.5} py="2px" borderBottom="1px solid rgba(255,255,255,0.14)">
          <Box w="3px" h="11px" bg={table.bar} borderRadius="sm" />
          <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase" letterSpacing="0.05em">
            {table.title}
          </Text>
        </Flex>
      )}
      <Grid templateColumns={`repeat(${columns}, 1fr)`} py="2px" borderBottom="1px solid rgba(255,255,255,0.06)">
        {table.cols.map((col) => (
          <Text key={col} {...rowStyle} textAlign="center">{col}</Text>
        ))}
      </Grid>
      <Grid templateColumns={`repeat(${columns}, 1fr)`} py="3px">
        {table.values.map((value, i) => (
          <Text key={`${table.title}-${i}`} fontSize="clamp(9px, 0.82vw, 12px)" color={i === 0 ? table.bar : "text.primary"} fontWeight="900" textAlign="center">
            {value}
          </Text>
        ))}
      </Grid>
    </VStack>
  );

  return (
    <VStack gap="4px" align="stretch">
      {renderTable(teamLine, 5, false)}
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
        {attributionTables.map((table) => renderTable(table))}
      </Grid>
    </VStack>
  );
};

const LaneGrid = ({ lanes, teamColor }) => (
  <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="3px" w="full" h="full" minH={0}>
    {["left", "middle", "right"].map((lane) => {
      const item = lanes[lane];
      const successRate = item.attempts > 0 ? item.success / item.attempts : 0;
      const ypc = item.attempts > 0 ? item.yards / item.attempts : 0;
      return (
        <Box
          key={lane}
          bg={item.attempts > 0 ? laneBg(successRate, teamColor) : "whiteAlpha.50"}
          border="1px solid rgba(255,255,255,0.10)"
          borderRadius="sm"
          overflow="hidden"
          minH={0}
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" px="6px" py="4px" borderBottom="1px solid rgba(255,255,255,0.08)" flexShrink={0}>
            <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase">
              {lane === "middle" ? "Middle" : lane}
            </Text>
            <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.secondary" fontWeight="800">{fmt1(ypc)} YPC</Text>
          </Flex>
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" px="5px" py="5px" gap={1} flex={1} alignItems="center">
            {[
              { label: "Car", value: item.attempts },
              { label: "Yds", value: item.yards },
              { label: "Succ", value: fmtPct(successRate) },
              { label: "TD", value: item.touchdowns },
            ].map((stat) => (
              <Flex key={stat.label} direction="column" align="center">
                <Text fontSize="clamp(9px, 0.82vw, 12px)" color="text.primary" fontWeight="900" lineHeight={1}>{stat.value}</Text>
                <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px">{stat.label}</Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      );
    })}
  </Grid>
);

const RunnerRow = ({ player, active, accent, onSelect }) => {
  const success = Object.values(player.lanes).reduce((sum, lane) => sum + lane.success, 0);
  const successRate = player.attempts > 0 ? success / player.attempts : 0;

  return (
    <Grid
      as="button"
      type="button"
      templateColumns="1.45fr 34px 42px 38px 28px 38px 36px 32px 42px 42px"
      alignItems="center"
      gap={1.5}
      px="4px"
      py="2px"
      bg={active ? "rgba(255,255,255,0.08)" : "transparent"}
      borderLeft={active ? `3px solid ${accent}` : "3px solid transparent"}
      borderBottom="1px solid rgba(255,255,255,0.055)"
      textAlign="left"
      _hover={{ bg: "rgba(255,255,255,0.06)" }}
      onClick={() => onSelect(player)}
    >
      <Box minW={0}>
        <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight={active ? "900" : "700"} truncate>{getDisplayName(player.name)}</Text>
        <Text fontSize="6px" color="text.muted" fontWeight="800">{player.position}</Text>
      </Box>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.attempts}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textAlign="right">{player.yards}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color={player.yards / Math.max(1, player.attempts) >= 4 ? accent : "text.secondary"} fontWeight="900" textAlign="right">{fmt1(player.yards / Math.max(1, player.attempts))}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.touchdowns}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmtPct(successRate)}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.firstAndTen}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{player.firstDowns}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmt2(player.epa)}</Text>
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" textAlign="right">{fmt2(player.production)}</Text>
    </Grid>
  );
};

const RunnerSpotlightWide = ({ player, teamColor }) => {
  const success = Object.values(player.lanes).reduce((sum, lane) => sum + lane.success, 0);
  const successRate = player.attempts > 0 ? success / player.attempts : 0;

  return (
    <Grid templateColumns="64px minmax(0, 1fr)" border="1px solid rgba(255,255,255,0.10)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)" minH="76px">
      <Flex align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.10)">
        <Flex w="38px" h="38px" borderRadius="md" bg={teamColor} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
          <Text fontSize="13px" fontWeight="900" color="white">{getInitials(player.name)}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" justify="center" minW={0} px={2}>
        <Text fontSize="clamp(13px, 1.08vw, 16px)" color="text.primary" fontWeight="950" lineHeight={1.05} truncate>{getDisplayName(player.name)}</Text>
        <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.muted" fontWeight="800" mt="3px">{player.position} selected runner</Text>
        <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" mt="6px" lineHeight={1.25}>
          {player.attempts} CAR / {player.yards} YDS / {player.touchdowns} TD / {fmtPct(successRate)} Succ
        </Text>
      </Flex>
    </Grid>
  );
};

const IndividualRushing = ({ data, selected, onSelect }) => {
  const accent = data.meta.colors.accent;
  return (
    <Grid templateColumns="minmax(0, 1.04fr) minmax(294px, 0.96fr)" gap="6px" h="full" minH={0} p="5px">
      <Box minH={0} overflow="hidden">
        <Grid templateColumns="1.45fr 34px 42px 38px 28px 38px 36px 32px 42px 42px" gap={1.5} py="2px" borderBottom="1px solid rgba(255,255,255,0.08)">
          {["Runner", "Car", "Yds", "YPC", "TD", "Succ", "1&10", "1D", "EPA", "Prod"].map((head) => (
            <Text key={head} fontSize="7px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign={head === "Runner" ? "left" : "right"}>{head}</Text>
          ))}
        </Grid>
        <Box overflowY="auto" h="calc(100% - 18px)">
          {data.rushers.map((player) => (
            <RunnerRow key={player.key} player={player} active={selected.key === player.key} accent={accent} onSelect={onSelect} />
          ))}
        </Box>
      </Box>
      <Flex direction="column" minH={0} gap="6px">
        <Box flexShrink={0}>
          <RunnerSpotlightWide player={selected} teamColor={data.meta.colors.primary} />
        </Box>
        <Box flex={1} minH={0}>
          <LaneGrid lanes={selected.lanes} teamColor={data.meta.colors.primary} />
        </Box>
      </Flex>
    </Grid>
  );
};

const OpponentImpact = ({ data }) => (
  <Box px="6px" py="5px" borderTop="1px solid rgba(255,255,255,0.08)" flex="0 0 20%">
    <Flex align="center" gap={1.5} mb="3px">
      <Box w="4px" h="14px" bg="#F6AD55" borderRadius="sm" />
      <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="900" textTransform="uppercase">
        {data.opponent.shortName} Defensive Impact
      </Text>
    </Flex>
    <Grid templateColumns="repeat(3, 1fr)" templateRows="repeat(2, 1fr)" gap="3px">
      {[
        { label: "Stop Rate", value: fmtPct(data.opponent.metrics.stopRate), sub: "failed rushes", color: "#F6AD55" },
        { label: "Stuff Rate", value: fmtPct(data.opponent.metrics.stuffRate), sub: "line wins", color: "#F6AD55" },
        { label: "TFL Forced", value: fmtPct(data.opponent.metrics.tflRate), sub: "behind LOS", color: "#E53E3E" },
        { label: "Power Stop", value: fmtPct(data.opponent.metrics.powerRunStopRate), sub: "short yardage", color: "#63B3ED" },
        { label: "1D Rush Succ", value: fmtPct(data.opponent.metrics.firstDownRushSuccessAllowed), sub: "allowed", color: "#68D391" },
        { label: "Opp Allowed", value: fmtPct(data.opponent.metrics.opportunityRate), sub: "4+ yards", color: "text.primary" },
      ].map((stat) => (
        <Flex key={stat.label} direction="column" justify="center" px="6px" py="4px" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" minW={0}>
          <Text fontSize="clamp(8px, 0.72vw, 10px)" color={stat.color} fontWeight="900" lineHeight={1}>{stat.value}</Text>
          <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.primary" fontWeight="850" mt="2px" truncate>{stat.label}</Text>
          <Text fontSize="6px" color="text.muted" fontWeight="750" textTransform="uppercase" mt="1px" truncate>{stat.sub}</Text>
        </Flex>
      ))}
    </Grid>
  </Box>
);

const TeamRushingPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selected, setSelected] = useState(data.rushers[0]);
  const primary = data.meta.colors.primary;

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      <Flex
        direction="column"
        gap="4px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}44 0%, transparent 72%)`}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="4px" h="18px" bg={data.meta.colors.accent} borderRadius="sm" />
          <Text fontSize="clamp(14px, 1.2vw, 18px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">{data.meta.shortName} Rushing Production</Text>
        </Flex>
        <CompactRunTables data={data} />
      </Flex>

      <Box flex={1} minH={0}>
        <IndividualRushing data={data} selected={selected} onSelect={setSelected} />
      </Box>

      <OpponentImpact data={data} />
    </Flex>
  );
};

export const GameProductionRushing = () => (
  <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
      <TeamRushingPanel teamKey="pvamu" />
    </Box>
    <Box flex={1} minW={0}>
      <TeamRushingPanel teamKey="jsu" />
    </Box>
  </Flex>
);
