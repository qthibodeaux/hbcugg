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
      opponent: "PVAMU",
      colors: { primary: "#002147", accent: "#4A90D9" },
    },
    identity: {
      defPlays: 76,
      yppAllowed: 6.07,
      disruptionRate: 0.1316,
      explosivePrevention: 0.8553,
      bendDontBreak: 21.95,
      turnoversForced: 3,
      sacks: 1,
      pressureRate: 0.2,
      totalPressures: 6,
      havoc: 0.1316,
      tflRate: 0.0789,
      sackRate: 0.0132,
      pdRate: 0.0395,
      stuffRate: 0.1957,
      stoppedRunRate: 0.4348,
      oppThirdDown: 0.5238,
      oppRedZoneTd: 0.4,
      oppQualityDrive: 0.75,
      oppPointsPerDrive: 1.9167,
    },
    heat: {
      pass: {
        deep: {
          left: { attempts: 4, completions: 1, yards: 66, ypa: 16.5 },
          middle: { attempts: 2, completions: 1, yards: 15, ypa: 7.5 },
          right: { attempts: 5, completions: 4, yards: 121, ypa: 24.2 },
        },
        medium: {
          left: { attempts: 0, completions: 0, yards: 0, ypa: 0 },
          middle: { attempts: 2, completions: 1, yards: 23, ypa: 11.5 },
          right: { attempts: 4, completions: 1, yards: 6, ypa: 1.5 },
        },
        short: {
          left: { attempts: 7, completions: 6, yards: 51, ypa: 7.3 },
          middle: { attempts: 1, completions: 1, yards: 3, ypa: 3 },
          right: { attempts: 3, completions: 2, yards: 9, ypa: 3 },
        },
      },
      rush: {
        left: { attempts: 15, yards: 34, ypc: 2.27 },
        middle: { attempts: 25, yards: 110, ypc: 4.4 },
        right: { attempts: 8, yards: 11, ypc: 1.38 },
      },
    },
    defenders: [
      { name: "Pulliam,Reid", key: "name:pulliam,reid", tackles: 10.5, solo: 7, assists: 7, sacks: 0, tfl: 0.5, qbh: 1, int: 0, pd: 1, ff: 0, fr: 0, production: 7.4, hit: 6.4, hawk: 1, scrum: 0 },
      { name: "Sallis,Kam", key: "name:sallis,kam", tackles: 9, solo: 7, assists: 4, sacks: 0, tfl: 0, qbh: 0, int: 0, pd: 0, ff: 1, fr: 0, production: 12.73, hit: 2.84, hawk: 0, scrum: 9.89 },
      { name: "Hawkins,Shamar", key: "name:hawkins,shamar", tackles: 7, solo: 6, assists: 2, sacks: 0, tfl: 0, qbh: 1, int: 0, pd: 0, ff: 0, fr: 1, production: 17.66, hit: 4.01, hawk: 0, scrum: 13.65 },
      { name: "Ivory,Quincy", key: "name:ivory,quincy", tackles: 4.5, solo: 2, assists: 5, sacks: 0, tfl: 0.5, qbh: 1, int: 0, pd: 0, ff: 0, fr: 0, production: 4.56, hit: 4.56, hawk: 0, scrum: 0 },
      { name: "Taylor,Ashton", key: "name:taylor,ashton", tackles: 4, solo: 4, assists: 0, sacks: 0, tfl: 2, qbh: 2, int: 0, pd: 0, ff: 0, fr: 0, production: 8.92, hit: 8.92, hawk: 0, scrum: 0 },
      { name: "Washington,B.J.", key: "name:washington,b.j.", tackles: 4, solo: 2, assists: 4, sacks: 0, tfl: 0.5, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 2.45, hit: 2.45, hawk: 0, scrum: 0 },
      { name: "Williams,Jeremiah", key: "name:williams,jeremiah", tackles: 3.5, solo: 3, assists: 1, sacks: 0, tfl: 1, qbh: 0, int: 0, pd: 0, ff: 1, fr: 0, production: 12.96, hit: 3.07, hawk: 0, scrum: 9.89 },
      { name: "Chisholm,KJ", key: "name:chisholm,kj", tackles: 3, solo: 3, assists: 0, sacks: 0, tfl: 0, qbh: 0, int: 0, pd: 1, ff: 0, fr: 0, production: 1.84, hit: 0.84, hawk: 1, scrum: 0 },
      { name: "Brown Jr.,John", key: "name:brown jr.,john", tackles: 1, solo: 1, assists: 0, sacks: 1, tfl: 1, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 6.62, hit: 6.62, hawk: 0, scrum: 0 },
    ],
  },
  pvamu: {
    meta: {
      shortName: "PVAMU",
      opponent: "JSU",
      colors: { primary: "#4B0082", accent: "#FFB81C" },
    },
    identity: {
      defPlays: 42,
      yppAllowed: 6.98,
      disruptionRate: 0.1667,
      explosivePrevention: 0.881,
      bendDontBreak: 14.65,
      turnoversForced: 2,
      sacks: 1,
      pressureRate: 0.1667,
      totalPressures: 3,
      havoc: 0.1667,
      tflRate: 0.0952,
      sackRate: 0.0238,
      pdRate: 0.0476,
      stuffRate: 0.2308,
      stoppedRunRate: 0.4231,
      oppThirdDown: 0.2,
      oppRedZoneTd: 0.75,
      oppQualityDrive: 0.3333,
      oppPointsPerDrive: 2.25,
    },
    heat: {
      pass: {
        deep: {
          left: { attempts: 3, completions: 2, yards: 37, ypa: 12.33 },
          middle: { attempts: 2, completions: 1, yards: 79, ypa: 39.5 },
          right: { attempts: 3, completions: 2, yards: 63, ypa: 21 },
        },
        medium: {
          left: { attempts: 0, completions: 0, yards: 0, ypa: 0 },
          middle: { attempts: 0, completions: 0, yards: 0, ypa: 0 },
          right: { attempts: 2, completions: 0, yards: 0, ypa: 0 },
        },
        short: {
          left: { attempts: 2, completions: 2, yards: 6, ypa: 3 },
          middle: { attempts: 1, completions: 1, yards: 0, ypa: 0 },
          right: { attempts: 2, completions: 1, yards: 2, ypa: 1 },
        },
      },
      rush: {
        left: { attempts: 12, yards: 30, ypc: 2.5 },
        middle: { attempts: 11, yards: 36, ypc: 3.27 },
        right: { attempts: 3, yards: 29, ypc: 9.67 },
      },
    },
    defenders: [
      { name: "Starling,Darrell", key: "name:starling,darrell", tackles: 6, solo: 4, assists: 4, sacks: 0.5, tfl: 1, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 6.18, hit: 6.18, hawk: 0, scrum: 0 },
      { name: "Parker,Kennedy", key: "name:parker,kennedy", tackles: 5, solo: 3, assists: 4, sacks: 0, tfl: 1, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 3.73, hit: 3.73, hawk: 0, scrum: 0 },
      { name: "Randle,Travor", key: "name:randle,travor", tackles: 4, solo: 3, assists: 2, sacks: 0, tfl: 0, qbh: 0, int: 0, pd: 1, ff: 0, fr: 0, production: 2.28, hit: 1.28, hawk: 1, scrum: 0 },
      { name: "Amao,Kamren", key: "name:amao,kamren", tackles: 3.5, solo: 2, assists: 3, sacks: 0, tfl: 0.5, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 2.23, hit: 2.23, hawk: 0, scrum: 0 },
      { name: "Roberts,Sterling", key: "name:roberts,sterling", tackles: 1.5, solo: 1, assists: 1, sacks: 0, tfl: 0, qbh: 2, int: 0, pd: 0, ff: 0, fr: 0, production: 4.28, hit: 4.28, hawk: 0, scrum: 0 },
      { name: "Gucake,Malik", key: "name:gucake,malik", tackles: 0.5, solo: 0, assists: 1, sacks: 0.5, tfl: 0.5, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 3.39, hit: 3.39, hawk: 0, scrum: 0 },
      { name: "Sparks Jr.,Alajujuan", key: "name:sparks jr.,alajujuan", tackles: 1, solo: 1, assists: 0, sacks: 0, tfl: 1, qbh: 0, int: 0, pd: 0, ff: 0, fr: 0, production: 2.29, hit: 2.29, hawk: 0, scrum: 0 },
      { name: "Heckaman,Kheagian", key: "name:heckaman,kheagian", tackles: 0, solo: 0, assists: 0, sacks: 0, tfl: 0, qbh: 0, int: 0, pd: 0, ff: 0, fr: 1, production: 0, hit: 0, hawk: 0, scrum: 0 },
      { name: "Dowell,Lamagea", key: "name:dowell,lamagea", tackles: 0, solo: 0, assists: 0, sacks: 0, tfl: 0, qbh: 0, int: 0, pd: 0, ff: 0, fr: 1, production: 0, hit: 0, hawk: 0, scrum: 0 },
    ],
  },
};

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const fmt1 = (n) => (n ?? 0).toFixed(1);
const fmt2 = (n) => (n ?? 0).toFixed(2);

function getFirstName(name) {
  return name.split(",")[1]?.trim() || "";
}

function getLastName(name) {
  return name.split(",")[0]?.trim() || name;
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

function allowedCellBg(value, teamColor, max = 18) {
  if (!value) return "rgba(255,255,255,0.025)";
  const rgb = hexToRgb(teamColor);
  const opacity = 0.1 + Math.min(0.62, value / max);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

const TeamDefenseLine = ({ data }) => {
  const accent = data.meta.colors.accent;
  const rows = [
    {
      title: "Identity",
      color: accent,
      cells: [
        { label: "Plays", value: data.identity.defPlays },
        { label: "YPP", value: fmt2(data.identity.yppAllowed) },
        { label: "Expl Prev", value: fmtPct(data.identity.explosivePrevention) },
      ],
    },
    {
      title: "Disruption",
      color: "#E53E3E",
      cells: [
        { label: "Havoc", value: fmtPct(data.identity.havoc) },
        { label: "TFL", value: fmtPct(data.identity.tflRate) },
        { label: "Sack", value: fmtPct(data.identity.sackRate) },
      ],
    },
    {
      title: "Pressure",
      color: "#F6AD55",
      cells: [
        { label: "Press", value: data.identity.totalPressures },
        { label: "Rate", value: fmtPct(data.identity.pressureRate) },
        { label: "Sacks", value: data.identity.sacks },
      ],
    },
    {
      title: "Finish",
      color: "#68D391",
      cells: [
        { label: "TO", value: data.identity.turnoversForced },
        { label: "3D", value: fmtPct(data.identity.oppThirdDown) },
        { label: "RZ TD", value: fmtPct(data.identity.oppRedZoneTd) },
      ],
    },
  ];

  return (
    <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="4px">
      {rows.map((row) => (
        <Box key={row.title} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" bg="rgba(255,255,255,0.025)" px="5px" py="4px" minW={0}>
          <Flex align="center" gap={1.5} mb="3px">
            <Box w="3px" h="10px" bg={row.color} borderRadius="sm" />
            <Text fontSize="7px" color="text.primary" fontWeight="900" textTransform="uppercase" truncate>{row.title}</Text>
          </Flex>
          <Grid templateColumns="repeat(3, 1fr)" gap={1}>
            {row.cells.map((cell) => (
              <Flex key={cell.label} direction="column" align="center" minW={0}>
                <Text fontSize="clamp(9px, 0.8vw, 12px)" color={row.color} fontWeight="950" lineHeight={1}>{cell.value}</Text>
                <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="2px" truncate>{cell.label}</Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      ))}
    </Grid>
  );
};

const DefenderTable = ({ defenders, selected, onSelect, accent }) => (
  <VStack gap={0} align="stretch" h="full" minH={0}>
    <Grid templateColumns="1.35fr 34px 32px 30px 30px 30px 28px 28px 42px" gap={1} py="2px" borderBottom="1px solid rgba(255,255,255,0.08)">
      {["Defender", "Tak", "Solo", "TFL", "Sck", "QBH", "PD", "TO", "Prod"].map((head) => (
        <Text key={head} fontSize="7px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign={head === "Defender" ? "left" : "right"}>{head}</Text>
      ))}
    </Grid>
    <Box overflowY="auto" flex={1} minH={0}>
      {defenders.map((player) => {
        const active = selected.key === player.key;
        const takeaways = player.int + player.ff + player.fr;
        return (
          <Grid
            key={player.key}
            as="button"
            type="button"
            templateColumns="1.35fr 34px 32px 30px 30px 30px 28px 28px 42px"
            gap={1}
            alignItems="center"
            w="full"
            py="3px"
            bg={active ? "rgba(255,255,255,0.08)" : "transparent"}
            borderLeft={active ? `3px solid ${accent}` : "3px solid transparent"}
            borderBottom="1px solid rgba(255,255,255,0.055)"
            textAlign="left"
            _hover={{ bg: "rgba(255,255,255,0.06)" }}
            onClick={() => onSelect(player)}
          >
            <Box minW={0} pl="2px">
              <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight={active ? "900" : "750"} truncate>{getDisplayName(player.name)}</Text>
              <Text fontSize="6px" color="text.muted" fontWeight="800">DEF</Text>
            </Box>
            {[fmt1(player.tackles), player.solo, fmt1(player.tfl), fmt1(player.sacks), player.qbh, player.pd, takeaways, fmt1(player.production)].map((value, index) => (
              <Text key={`${player.key}-${index}`} fontSize="clamp(8px, 0.72vw, 10px)" color={index === 7 ? accent : "text.secondary"} fontWeight={index === 7 ? "950" : "850"} textAlign="right">
                {value}
              </Text>
            ))}
          </Grid>
        );
      })}
    </Box>
  </VStack>
);

const DefenderSpotlight = ({ player, data }) => {
  const total = Math.max(0.01, player.hit + player.hawk + player.scrum);
  const takeaways = player.int + player.ff + player.fr;
  const accent = data.meta.colors.accent;
  const bars = [
    { label: "Hit", value: player.hit, color: "#E53E3E" },
    { label: "Hawk", value: player.hawk, color: "#63B3ED" },
    { label: "Scrum", value: player.scrum, color: "#F6AD55" },
  ];

  return (
    <VStack gap="6px" align="stretch" h="full" minH={0}>
      <Grid templateColumns="66px minmax(0, 1fr)" border="1px solid rgba(255,255,255,0.10)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)" minH="82px">
        <Flex align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.10)">
          <Flex w="40px" h="40px" borderRadius="md" bg={data.meta.colors.primary} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
            <Text fontSize="13px" fontWeight="950" color="white">{getInitials(player.name)}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" justify="center" minW={0} px={2}>
          <Text fontSize="clamp(13px, 1.08vw, 16px)" color="text.primary" fontWeight="950" lineHeight={1.05} truncate>{getDisplayName(player.name)}</Text>
          <Text fontSize="clamp(7px, 0.65vw, 9px)" color="text.muted" fontWeight="800" mt="3px">defensive production leader</Text>
          <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.secondary" fontWeight="850" mt="6px" lineHeight={1.25}>
            {fmt1(player.tackles)} TAK / {fmt1(player.tfl)} TFL / {fmt1(player.sacks)} SCK / {takeaways} TO
          </Text>
        </Flex>
      </Grid>

      <Grid templateColumns="repeat(3, 1fr)" gap="4px" flexShrink={0}>
        {[
          { label: "Production", value: fmt1(player.production), color: accent },
          { label: "Havoc Acts", value: fmt1(player.tfl + player.sacks + player.qbh + player.pd + takeaways), color: "#E53E3E" },
          { label: "Solo Share", value: fmtPct(player.tackles ? player.solo / player.tackles : 0), color: "#68D391" },
        ].map((stat) => (
          <Flex key={stat.label} direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="5px" minW={0}>
            <Text fontSize="clamp(12px, 1vw, 15px)" color={stat.color} fontWeight="950" lineHeight={1}>{stat.value}</Text>
            <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="3px" truncate>{stat.label}</Text>
          </Flex>
        ))}
      </Grid>

      <Box flex={1} minH={0} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" bg="rgba(255,255,255,0.025)" px="6px" py="6px">
        <Flex justify="space-between" align="center" mb="5px">
          <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase">Production profile</Text>
          <Text fontSize="7px" color="text.secondary" fontWeight="850">Hit / Hawk / Scrum</Text>
        </Flex>
        <VStack align="stretch" gap="5px">
          {bars.map((bar) => (
            <Grid key={bar.label} templateColumns="42px minmax(0, 1fr) 34px" gap="5px" alignItems="center">
              <Text fontSize="7px" color="text.secondary" fontWeight="900" textTransform="uppercase">{bar.label}</Text>
              <Box h="7px" bg="rgba(255,255,255,0.07)" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${Math.min(100, (bar.value / total) * 100)}%`} bg={bar.color} borderRadius="full" />
              </Box>
              <Text fontSize="8px" color="text.primary" fontWeight="900" textAlign="right">{fmt1(bar.value)}</Text>
            </Grid>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

const AllowedMap = ({ data }) => {
  const lanes = ["left", "middle", "right"];
  const depths = [
    { key: "deep", label: "Deep", sub: ">12" },
    { key: "medium", label: "Med", sub: "4-12" },
    { key: "short", label: "Short", sub: "<4" },
  ];
  const primary = data.meta.colors.primary;

  return (
    <Grid templateColumns="minmax(0, 1.65fr) minmax(160px, 0.8fr)" gap="6px" h="100%" minH={0}>
      <Grid templateColumns="42px minmax(0, 1fr)" gap="4px" minH={0}>
        <Grid templateRows="repeat(3, 1fr)" gap="3px" py="2px">
          {depths.map((depth) => (
            <Flex key={depth.key} direction="column" justify="center" align="flex-end" pr="2px">
              <Text fontSize="7px" color="text.secondary" fontWeight="900" textTransform="uppercase">{depth.label}</Text>
              <Text fontSize="6px" color="text.muted" fontWeight="800">{depth.sub}</Text>
            </Flex>
          ))}
        </Grid>
        <VStack gap="3px" minH={0}>
          <Grid templateRows="repeat(3, minmax(0, 1fr))" templateColumns="repeat(3, minmax(0, 1fr))" gap="3px" w="full" flex={1} minH={0}>
            {depths.map((depth) => lanes.map((lane) => {
              const cell = data.heat.pass[depth.key][lane];
              return (
                <Flex key={`${depth.key}-${lane}`} direction="column" align="center" justify="center" bg={allowedCellBg(cell.ypa, primary, 24)} border="1px solid rgba(255,255,255,0.09)" borderRadius="sm" minH={0}>
                  <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.primary" fontWeight="950" lineHeight={1}>{cell.completions}/{cell.attempts}</Text>
                  <Text fontSize="6px" color="text.muted" fontWeight="800" mt="2px">{cell.yards}y</Text>
                </Flex>
              );
            }))}
          </Grid>
          <Grid templateColumns="repeat(3, 1fr)" gap="3px" w="full">
            {lanes.map((lane) => (
              <Text key={lane} fontSize="6px" color="text.muted" fontWeight="900" textAlign="center" textTransform="uppercase">{lane}</Text>
            ))}
          </Grid>
        </VStack>
      </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap="3px" minH={0}>
        {lanes.map((lane) => {
          const item = data.heat.rush[lane];
          return (
            <Flex key={lane} direction="column" justify="center" align="center" bg={allowedCellBg(item.ypc, primary, 7)} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" px="3px" minW={0}>
              <Text fontSize="7px" color="text.secondary" fontWeight="900" textTransform="uppercase">{lane}</Text>
              <Text fontSize="clamp(11px, 0.95vw, 14px)" color="text.primary" fontWeight="950" mt="3px">{fmt1(item.ypc)}</Text>
              <Text fontSize="6px" color="text.muted" fontWeight="800">YPC</Text>
              <Text fontSize="6px" color="text.secondary" fontWeight="800" mt="4px">{item.attempts} for {item.yards}</Text>
            </Flex>
          );
        })}
      </Grid>
    </Grid>
  );
};

const TeamDefensePanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [selected, setSelected] = useState(data.defenders[0]);
  const primary = data.meta.colors.primary;
  const accent = data.meta.colors.accent;

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      <Flex
        direction="column"
        gap="5px"
        px={2}
        py="6px"
        bg={`linear-gradient(90deg, ${primary}44 0%, transparent 72%)`}
        borderBottom="1px solid rgba(255,255,255,0.08)"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box w="4px" h="18px" bg={accent} borderRadius="sm" />
          <Text fontSize="clamp(14px, 1.2vw, 18px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">{data.meta.shortName} Defensive Production</Text>
        </Flex>
        <TeamDefenseLine data={data} />
      </Flex>

      <Grid templateColumns="minmax(0, 1.08fr) minmax(270px, 0.92fr)" gap="6px" minH={0} flex={1} p="5px" borderBottom="1px solid rgba(255,255,255,0.08)">
        <DefenderTable defenders={data.defenders} selected={selected} onSelect={setSelected} accent={accent} />
        <DefenderSpotlight player={selected} data={data} />
      </Grid>

      <Box flex="0 0 28%" minH={0} px="6px" py="5px">
        <Flex align="center" justify="space-between" mb="3px">
          <Text fontSize="7px" color="text.primary" fontWeight="950" textTransform="uppercase">{data.meta.opponent} allowed map</Text>
          <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">pass completions / rush lanes</Text>
        </Flex>
        <AllowedMap data={data} />
      </Box>
    </Flex>
  );
};

export const GameProductionDefenseA = () => (
  <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Box flex={1} minW={0} borderRight="1px solid rgba(255,255,255,0.08)">
      <TeamDefensePanel teamKey="jsu" />
    </Box>
    <Box flex={1} minW={0}>
      <TeamDefensePanel teamKey="pvamu" />
    </Box>
  </Flex>
);
