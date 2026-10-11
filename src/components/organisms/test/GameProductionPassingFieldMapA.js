import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Grid,
} from "@chakra-ui/react";

// ═══════════════════════════════════════════════════════════════
// REAL DATA FROM W15pvamujsu.json — both teams
// ═══════════════════════════════════════════════════════════════

const TEAMS = {
  jsu: {
    meta: {
      name: "Jackson State",
      shortName: "JSU",
      logo: "/assets/swacjsu.svg",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    passing: { attempts: 17, completions: 9, yards: 187, touchdowns: 2, interceptions: 1, sacks_taken: 1 },
    downSplit: {
      standard: { comp: 3, att: 4, yards: 142, int: 0, success: 3 },
      passing: { comp: 5, att: 11, yards: 45, int: 1, success: 3 },
    },
    passers: [
      {
        name: "Lockhart,Jared", key: "name:lockhart,jared",
        attempts: 9, completions: 6, yards: 183, touchdowns: 2, interceptions: 1, sacks_taken: 1,
        grid: {
          short: { left: { comp: 2, att: 2, yards: 19 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 1, att: 1, yards: 22 }, middle: { comp: 1, att: 2, yards: 79 }, right: { comp: 2, att: 2, yards: 63 } },
        },
      },
      {
        name: "Morgan,JaCobian", key: "name:morgan,jacobian",
        attempts: 6, completions: 2, yards: 4, touchdowns: 0, interceptions: 0, sacks_taken: 0,
        grid: {
          short: { left: { comp: 1, att: 1, yards: 2 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 4, yards: 2 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
        },
      },
    ],
    receivers: [
      { name: "Rembert,Nate", key: "name:rembert,nate", targets: 7, receptions: 4, yards: 107, touchdowns: 1, grid: { short: { left: { comp: 1, att: 1, yards: 4 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 3, yards: 2 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 1, att: 2, yards: 79 }, right: { comp: 1, att: 1, yards: 22 } } } },
      { name: "Dupree,Ja'Naylon", key: "name:dupree,ja'naylon", targets: 2, receptions: 2, yards: 37, touchdowns: 1, grid: { short: { left: { comp: 1, att: 1, yards: 15 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 1, att: 1, yards: 22 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Savage,Shemar", key: "name:savage,shemar", targets: 1, receptions: 1, yards: 41, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 1, yards: 41 } } } },
      { name: "Paul,Kobe", key: "name:paul,kobe", targets: 1, receptions: 1, yards: 2, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 2 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
    ],
    oppDefense: {
      team: "Prairie View A&M", shortName: "PVAMU",
      disruption_rate: 0.1667, explosive_prevention: 0.881, ypp_allowed: 6.98, bend_dont_break: 14.65,
      havoc_rate: 0.1667, tfl_rate: 0.0952, sack_rate: 0.0238, pd_rate: 0.0476,
    },
  },
  pvamu: {
    meta: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      logo: "/assets/swacpvamu.svg",
      colors: { primary: "#4B0082", secondary: "#FFB81C" },
    },
    passing: { attempts: 29, completions: 17, yards: 294, touchdowns: 1, interceptions: 1, sacks_taken: 1 },
    downSplit: {
      standard: { comp: 6, att: 14, yards: 59, int: 0, success: 4 },
      passing: { comp: 11, att: 15, yards: 235, int: 1, success: 9 },
    },
    passers: [
      {
        name: "Peters,Cameron", key: "name:peters,cameron",
        attempts: 28, completions: 17, yards: 294, touchdowns: 1, interceptions: 1, sacks_taken: 1,
        grid: {
          short: { left: { comp: 6, att: 7, yards: 51 }, middle: { comp: 3, att: 5, yards: 41 }, right: { comp: 4, att: 7, yards: 31 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 1, att: 4, yards: 66 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 3, att: 4, yards: 105 } },
        },
      },
      {
        name: "Byrd,Shadrick", key: "name:byrd,shadrick",
        attempts: 1, completions: 0, yards: 0, touchdowns: 0, interceptions: 0, sacks_taken: 0,
        grid: {
          short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
        },
      },
    ],
    receivers: [
      { name: "Rockwell,Jyzaiah", key: "name:rockwell,jyzaiah", targets: 6, receptions: 4, yards: 96, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 1, att: 1, yards: 15 }, right: { comp: 1, att: 1, yards: 16 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 2, att: 3, yards: 65 } } } },
      { name: "Jones,Travon", key: "name:jones,travon", targets: 5, receptions: 3, yards: 12, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 6 }, middle: { comp: 1, att: 1, yards: 3 }, right: { comp: 1, att: 3, yards: 3 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Dennis,Andre", key: "name:dennis,andre", targets: 5, receptions: 2, yards: 39, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 16 }, middle: { comp: 1, att: 2, yards: 23 }, right: { comp: 0, att: 1, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Ojo,Rodny", key: "name:ojo,rodny", targets: 3, receptions: 2, yards: 7, touchdowns: 0, grid: { short: { left: { comp: 2, att: 2, yards: 7 }, middle: { comp: 0, att: 1, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "John,Ethan", key: "name:john,ethan", targets: 2, receptions: 1, yards: 66, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 1, att: 1, yards: 66 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Banks,Ja'Koby", key: "name:banks,ja'koby", targets: 2, receptions: 2, yards: 12, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 2, att: 2, yards: 12 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Byrd,Shadrick", key: "name:byrd,shadrick", targets: 2, receptions: 1, yards: 11, touchdowns: 0, grid: { short: { left: { comp: 1, att: 2, yards: 11 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Bonner,Cameron", key: "name:bonner,cameron", targets: 1, receptions: 1, yards: 40, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 1, yards: 40 } } } },
      { name: "Bingmon,Chase", key: "name:bingmon,chase", targets: 1, receptions: 1, yards: 11, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 11 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
    ],
    oppDefense: {
      team: "Jackson State", shortName: "JSU",
      disruption_rate: 0.1316, explosive_prevention: 0.8553, ypp_allowed: 6.07, bend_dont_break: 21.95,
      havoc_rate: 0.1316, tfl_rate: 0.0789, sack_rate: 0.0132, pd_rate: 0.0395,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtPct = (n) => (n ? `${(n * 100).toFixed(1)}%` : "0%");
const fmtNum = (n) => (n === Math.floor(n) ? String(n) : n.toFixed(1));

function getInitials(name) {
  const parts = name.split(",");
  return (parts[1]?.trim()[0] || "") + (parts[0]?.trim()[0] || "");
}
function getFirstName(name) { return name.split(",")[1]?.trim() || ""; }
function getLastName(name) { return name.split(",")[0]?.trim() || ""; }
function getDisplayName(name) { return `${getFirstName(name)} ${getLastName(name)}`; }

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}
function getCellColor(comp, att, primaryColor) {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(primaryColor);
  const opacity = 0.15 + rate * 0.65;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
function getCellTextColor(comp, att) {
  if (att === 0) return "#71717A";
  const rate = comp / att;
  return rate >= 0.5 ? "#FFFFFF" : "#F4F4F5";
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── COMPACT TEAM STATS TABLE ───
const PassingStatsTable = ({ team, standard, passing }) => {
  const headers = [
    { key: "comp", label: "CMP" },
    { key: "att", label: "ATT" },
    { key: "yards", label: "YDS" },
    { key: "cmpPct", label: "CMP%" },
    { key: "int", label: "INT" },
    { key: "ypa", label: "YPA" },
  ];

  const teamCmpPct = team.attempts > 0 ? ((team.completions / team.attempts) * 100).toFixed(1) + "%" : "0%";
  const teamYpa = team.attempts > 0 ? (team.yards / team.attempts).toFixed(1) : "0.0";
  const stdCmpPct = standard.att > 0 ? ((standard.comp / standard.att) * 100).toFixed(1) + "%" : "0%";
  const stdYpa = standard.att > 0 ? (standard.yards / standard.att).toFixed(1) : "0.0";
  const passCmpPct = passing.att > 0 ? ((passing.comp / passing.att) * 100).toFixed(1) + "%" : "0%";
  const passYpa = passing.att > 0 ? (passing.yards / passing.att).toFixed(1) : "0.0";

  const rows = [
    { label: "Total", comp: team.completions, att: team.attempts, yards: team.yards, cmpPct: teamCmpPct, int: team.interceptions, ypa: teamYpa, isTotal: true },
    // TODO: Sacks currently show as "—" for standard/passing splits because the data pipeline
    // does not log which down type a sack occurred on. Need to add down_context to sack events.
    { label: "Standard", comp: standard.comp, att: standard.att, yards: standard.yards, cmpPct: stdCmpPct, int: standard.int, ypa: stdYpa, isTotal: false },
    { label: "Passing", comp: passing.comp, att: passing.att, yards: passing.yards, cmpPct: passCmpPct, int: passing.int, ypa: passYpa, isTotal: false },
  ];

  return (
    <VStack gap={0} align="stretch" w="full">
      <Grid templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.200">
        <Box />
        {headers.map((h) => (
          <Flex key={h.key} align="center" justify="center">
            <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">{h.label}</Text>
          </Flex>
        ))}
      </Grid>
      {rows.map((row, idx) => (
        <Grid key={row.label} templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center"
          py="2px"
          borderBottom={idx < rows.length - 1 ? "1px solid whiteAlpha.50" : "none"}
          bg={row.isTotal ? "whiteAlpha.80" : "transparent"}
        >
          <Box pl="6px">
            <Text fontSize={row.isTotal ? "clamp(9px, 0.8vw, 11px)" : "clamp(8px, 0.7vw, 10px)"}
              fontWeight={row.isTotal ? "800" : "600"}
              color={row.isTotal ? "text.primary" : "text.secondary"}
              textTransform={row.isTotal ? "uppercase" : "none"}
            >{row.label}</Text>
          </Box>
          {headers.map((h) => (
            <Flex key={h.key} align="center" justify="center">
              <Text fontSize={row.isTotal ? "clamp(10px, 0.9vw, 13px)" : "clamp(9px, 0.8vw, 11px)"}
                fontWeight={row.isTotal ? "800" : "600"}
                color={row.isTotal ? "#E53E3E" : "text.primary"}
              >{row[h.key]}</Text>
            </Flex>
          ))}
        </Grid>
      ))}
    </VStack>
  );
};

// ─── TIGHT PLAYER TABLE ───
const PlayerTable = ({ players, activeKey, onSelect, type }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";
  const headers = isPasser
    ? ["CMP", "ATT", "YDS", "TD", "INT", "CMP%"]
    : ["REC", "TGT", "YDS", "TD", "YPC", "YPT"];

  return (
    <VStack gap={0} align="stretch" w="full">
      {/* Section header */}
      <Flex align="center" gap={1} px="4px" py="2px" borderBottom="1px solid whiteAlpha.100">
        <Box w="3px" h="10px" bg={accent} borderRadius="sm" />
        <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
          {isPasser ? "Passing" : "Receiving"}
        </Text>
      </Flex>
      {/* Header row */}
      <Grid templateColumns={`110px repeat(${headers.length}, 1fr)`} gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
        <Box pl="4px">
          <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">Player</Text>
        </Box>
        {headers.map((h) => (
          <Flex key={h} align="center" justify="center">
            <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">{h}</Text>
          </Flex>
        ))}
      </Grid>
      {/* Data rows */}
      {players.map((p) => {
        const isActive = p.key === activeKey;
        const cmpPct = isPasser && p.attempts > 0 ? ((p.completions / p.attempts) * 100).toFixed(1) + "%" : null;
        const ypc = !isPasser && p.receptions > 0 ? (p.yards / p.receptions).toFixed(1) : null;
        const ypt = !isPasser && p.targets > 0 ? (p.yards / p.targets).toFixed(1) : null;

        const cells = isPasser
          ? [p.completions, p.attempts, p.yards, p.touchdowns, p.interceptions, cmpPct]
          : [p.receptions, p.targets, p.yards, p.touchdowns, ypc, ypt];

        return (
          <Grid key={p.key}
            templateColumns={`110px repeat(${headers.length}, 1fr)`}
            gap={0} alignItems="center"
            py="2px" cursor="pointer"
            bg={isActive ? "whiteAlpha.80" : "transparent"}
            borderLeft={isActive ? `2px solid ${accent}` : "2px solid transparent"}
            _hover={{ bg: "whiteAlpha.60" }}
            onClick={() => onSelect({ ...p, _type: type })}
          >
            <Box pl="4px">
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color="text.primary" truncate>
                {getDisplayName(p.name)}
              </Text>
            </Box>
            {cells.map((v, i) => (
              <Flex key={i} align="center" justify="center">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color={isActive ? accent : "text.primary"}>
                  {v ?? "0"}
                </Text>
              </Flex>
            ))}
          </Grid>
        );
      })}
    </VStack>
  );
};

// ─── VERTICAL PAGINATION ARROWS ───
const PageArrow = ({ direction, onClick, disabled }) => {
  if (disabled) return null;
  return (
    <Flex
      w="20px"
      flex={1}
      minH="40px"
      align="center"
      justify="center"
      borderRadius="sm"
      bg="whiteAlpha.100"
      border="1px solid whiteAlpha.200"
      cursor="pointer"
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={onClick}
      flexShrink={0}
    >
      <Text fontSize="14px" fontWeight="700" color="text.secondary">
        {direction === "prev" ? "‹" : "›"}
      </Text>
    </Flex>
  );
};

// ─── 3x3 FIELD GRID WITH DEPTH LABELS ───
const FieldMapGrid = ({ grid, teamColor }) => {
  const depths = [
    { key: "deep", label: "DEEP", range: ">12" },
    { key: "medium", label: "MED", range: "4-12" },
    { key: "short", label: "SHORT", range: "<4" },
  ];
  const directions = ["left", "middle", "right"];

  return (
    <VStack gap="4px" align="stretch" w="full" h="full" minH={0}>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" alignItems="stretch" flex={1} minH={0}>
        <Grid templateRows="repeat(3, 1fr)" gap="2px">
          {depths.map((d) => (
            <Flex key={d.key} direction="column" align="flex-end" justify="center" pr="2px">
              <Text fontSize="clamp(9px, 0.78vw, 11px)" fontWeight="900" color="text.secondary" textTransform="uppercase" lineHeight={1}>
                {d.label}
              </Text>
              <Text fontSize="clamp(7px, 0.62vw, 9px)" color="text.muted" fontWeight="800" lineHeight={1.1} mt="2px">
                {d.range}
              </Text>
            </Flex>
          ))}
        </Grid>
        <Box position="relative" w="full" h="full" minH={0}>
          <Box position="absolute" inset="0" borderRadius="md" overflow="hidden"
            bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
            border="1px solid rgba(255,255,255,0.15)"
          >
            <Box position="absolute" left="0" right="0" top="33.3%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" left="0" right="0" top="66.6%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="33.3%" w="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="66.6%" w="1px" bg="rgba(255,255,255,0.12)" />
          </Box>
          <Grid position="absolute" inset="3px" templateColumns="repeat(3, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap="2px">
            {depths.map((d) =>
              directions.map((dir) => {
                const cell = grid[d.key][dir];
                const hasData = cell.att > 0;
                const bg = hasData ? getCellColor(cell.comp, cell.att, teamColor) : "rgba(0,0,0,0.35)";
                const textColor = hasData ? getCellTextColor(cell.comp, cell.att) : "text.muted";
                return (
                  <Flex key={`${d.key}-${dir}`} direction="column" align="center" justify="center"
                    bg={bg}
                    borderRadius="sm"
                    border={hasData ? `1px solid ${teamColor}66` : "1px solid rgba(255,255,255,0.06)"}
                    minW={0}
                    minH={0}
                  >
                    <Text fontSize="clamp(9px, 0.78vw, 12px)" fontWeight="800" color={textColor} lineHeight={1}>
                      {cell.comp}/{cell.att}
                    </Text>
                    <Text fontSize="clamp(6px, 0.55vw, 8px)" color={textColor} lineHeight={1} mt="1px" opacity={0.8}>
                      {cell.yards}y
                    </Text>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Box>
      </Grid>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" flexShrink={0}>
        <Box />
        <Grid templateColumns="repeat(3, 1fr)">
          {["Left", "Middle", "Right"].map((d) => (
            <Text key={d} fontSize="clamp(7px, 0.62vw, 9px)" fontWeight="900" color="text.muted" textAlign="center" textTransform="uppercase">
              {d}
            </Text>
          ))}
        </Grid>
      </Grid>
    </VStack>
  );
};

// ─── PLAYER SPOTLIGHT ───
const PlayerSpotlight = ({ player, type, teamColor }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";

  const cmpPct = isPasser && player.attempts > 0 ? ((player.completions / player.attempts) * 100).toFixed(1) + "%" : "0%";
  const ypc = !isPasser && player.receptions > 0 ? (player.yards / player.receptions).toFixed(1) : "0.0";
  const ypt = !isPasser && player.targets > 0 ? (player.yards / player.targets).toFixed(1) : "0.0";

  const statLine1 = isPasser
    ? `${player.completions} CMP · ${player.attempts} ATT · ${player.yards} YDS`
    : `${player.receptions} REC · ${player.targets} TGT · ${player.yards} YDS`;

  const statLine2 = isPasser
    ? `${player.touchdowns} TD · ${player.interceptions} INT · ${cmpPct} CMP%`
    : `${player.touchdowns} TD · ${ypc} YPC · ${ypt} YPT`;

  return (
    <VStack gap="8px" align="stretch" w="full" h="full">
      {/* ── Top: big avatar | name + position + stats ── */}
      <Grid templateColumns="72px 1fr" border="1px solid rgba(255,255,255,0.13)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)">
        <Flex minH="82px" align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.12)">
          <Flex w="48px" h="48px" borderRadius="md" bg={teamColor} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
            <Text fontSize="16px" fontWeight="900" color="white">{getInitials(player.name)}</Text>
          </Flex>
        </Flex>
        <Box minW={0} px={3} py="8px">
          <Text fontSize="clamp(15px, 1.28vw, 20px)" fontWeight="900" color="text.primary" truncate>
            {getDisplayName(player.name)}
          </Text>
          <Flex align="center" gap={1.5} mt="3px">
            <Box w="6px" h="6px" borderRadius="full" bg={accent} />
            <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.muted" fontWeight="800" textTransform="uppercase">
              {isPasser ? "Quarterback" : "Receiver"}
            </Text>
          </Flex>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="9px">
            {statLine1}
          </Text>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="2px">
            {statLine2}
          </Text>
        </Box>
      </Grid>

      {/* ── Bottom: 3x3 Field Grid ── */}
      <Flex flex={1} minH={0} align="stretch">
        <FieldMapGrid grid={player.grid} teamColor={teamColor} />
      </Flex>

      {/* ── Direction labels ── */}
    </VStack>
  );
};

const DefenseIdentityCompact = ({ defense }) => (
  <VStack gap={1} align="stretch" w="full">
    <Flex align="center" gap={1.5}>
      <Flex w="20px" h="20px" borderRadius="sm" bg="whiteAlpha.100" align="center" justify="center" flexShrink={0}>
        <Text fontSize="8px" fontWeight="800" color="text.secondary">{defense.shortName}</Text>
      </Flex>
      <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="600" color="text.secondary">Pass Defense</Text>
    </Flex>
    <Grid templateColumns="repeat(4, 1fr)" gap="2px">
      {[
        { l: "Disrupt", v: fmtPct(defense.disruption_rate) },
        { l: "Expl.Prev", v: fmtPct(defense.explosive_prevention) },
        { l: "YPP", v: fmtNum(defense.ypp_allowed) },
        { l: "BDB", v: fmtNum(defense.bend_dont_break) },
      ].map((s) => (
        <Flex key={s.l} direction="column" align="center" px={0.5} py={0.5} bg="whiteAlpha.50" borderRadius="sm">
          <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.primary">{s.v}</Text>
          <Text fontSize="clamp(6px, 0.55vw, 8px)" color="text.muted" textTransform="uppercase">{s.l}</Text>
        </Flex>
      ))}
    </Grid>
    <Flex gap="2px">
      {[
        { l: "Havoc", v: fmtPct(defense.havoc_rate), c: "#E53E3E" },
        { l: "TFL", v: fmtPct(defense.tfl_rate), c: "#F6AD55" },
        { l: "Sack", v: fmtPct(defense.sack_rate), c: "#63B3ED" },
        { l: "PD", v: fmtPct(defense.pd_rate), c: "#68D391" },
      ].map((h) => (
        <Flex key={h.l} direction="column" align="center" flex={1} px={0.5} py={0.5} bg="whiteAlpha.50" borderRadius="sm">
          <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color={h.c}>{h.v}</Text>
          <Text fontSize="clamp(6px, 0.55vw, 8px)" color="text.muted">{h.l}</Text>
        </Flex>
      ))}
    </Flex>
  </VStack>
);

// ─── SINGLE TEAM PANEL ───
const TeamPassingPanel = ({ teamKey }) => {
  const data = TEAMS[teamKey];
  const [activePlayer, setActivePlayer] = useState({ ...data.passers[0], _type: "passer" });

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* ─── HEADER: Team + Passing Stats Table ─── */}
      <Flex direction="column"
        bg={`linear-gradient(90deg, ${data.meta.colors.primary}44 0%, transparent 70%)`}
        borderBottom="1px solid whiteAlpha.100"
        px={2}
        py="6px"
        gap="4px"
        flexShrink={0}
      >
        {/* Section title — no redundant stat line */}
        <Flex align="center" gap={2}>
          <Flex w="28px" h="28px" borderRadius="sm" bg={data.meta.colors.primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
            <Text fontSize="10px" fontWeight="800" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
          </Flex>
          <Text fontSize="clamp(14px, 1.2vw, 18px)" fontWeight="800" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Passing
          </Text>
        </Flex>

        {/* Passing stats table */}
        <PassingStatsTable team={data.passing} standard={data.downSplit.standard} passing={data.downSplit.passing} />
      </Flex>

      {/* ─── MIDDLE: Player Tables (55%) + Spotlight (45%) ─── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* LEFT: Vertical pagination + Player tables */}
        <Box w="55%" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="row">
          {/* Vertical pagination column — arrows stretch full height */}
          <Flex direction="column" align="center" gap="4px" px="4px" py="4px" borderRight="1px solid whiteAlpha.100" flexShrink={0}>
            <PageArrow direction="prev" disabled />
            <PageArrow direction="next" disabled />
          </Flex>
          {/* Tables */}
          <Box flex={1} p="6px" overflow="hidden">
            <PlayerTable
              players={data.passers}
              activeKey={activePlayer._type === "passer" ? activePlayer.key : null}
              onSelect={setActivePlayer}
              type="passer"
            />
            <Box mt="4px">
              <PlayerTable
                players={data.receivers}
                activeKey={activePlayer._type === "receiver" ? activePlayer.key : null}
                onSelect={setActivePlayer}
                type="receiver"
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT: Spotlight — no scroll */}
        <Box w="45%" p="8px" overflow="hidden">
          <PlayerSpotlight
            player={activePlayer}
            type={activePlayer._type}
            teamColor={data.meta.colors.primary}
          />
        </Box>
      </Flex>

      {/* ─── FOOTER: Defense ─── */}
      <Box px={2} py="6px" borderTop="1px solid whiteAlpha.100" flexShrink={0}>
        <DefenseIdentityCompact defense={data.oppDefense} />
      </Box>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — 2×2 side-by-side
// ═══════════════════════════════════════════════════════════════
export const GameProductionPassingFieldMapA = () => {
  return (
    <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid whiteAlpha.100">
      <Box flex={1} borderRight="1px solid whiteAlpha.100">
        <TeamPassingPanel teamKey="pvamu" />
      </Box>
      <Box flex={1}>
        <TeamPassingPanel teamKey="jsu" />
      </Box>
    </Flex>
  );
};
