import { Grid, Text, Tooltip, Box, Flex, VStack } from "@chakra-ui/react";
import { createContext, useContext } from "react";
import { getTeamColor, getTeamLabel } from "../utils/teamHelpers";

// Shared Data Room presentation and mobile jump-ref context.

const fNum = (v, d = 0) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(d);
};

const fPct = (v) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  return `${Math.round(Number(v) * 100)}%`;
};

const fSigned = (v, d = 1) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  return `${n > 0 ? "+" : ""}${n.toFixed(d)}`;
};

export const StatRow = ({ label, away, home, format = "num", dec = 1, lowerIsBetter, tooltip }) => {
  const awayVal = away?.value ?? away;
  const homeVal = home?.value ?? home;

  const formatVal = (v) => {
    if (v == null || v === "—") return "—";
    if (format === "pct") return fPct(v);
    if (format === "signed") return fSigned(v, dec);
    if (format === "int") return fNum(v, 0);
    if (format === "ratio") return v;
    return fNum(v, dec);
  };

  const aStr = formatVal(awayVal);
  const hStr = formatVal(homeVal);

  const aNum = Number(awayVal);
  const hNum = Number(homeVal);
  const aValid = !Number.isNaN(aNum) && awayVal != null;
  const hValid = !Number.isNaN(hNum) && homeVal != null;

  let aWins = null;
  if (aValid && hValid) {
    aWins = lowerIsBetter ? aNum <= hNum : aNum >= hNum;
  }

  const rowContent = (
    <Grid
      templateColumns="1fr 100px 100px"
      gap={2}
      px={3}
      py={2}
      alignItems="center"
      _hover={{ bg: "whiteAlpha.50" }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
    >
      <Text fontSize="11px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.02em">
        {label}
      </Text>
      <Text
        fontSize="12px"
        fontWeight="900"
        fontFamily="mono"
        color={aWins === true ? "#48BB78" : "text.primary"}
        textAlign="right"
      >
        {aStr}
      </Text>
      <Text
        fontSize="12px"
        fontWeight="900"
        fontFamily="mono"
        color={aWins === false ? "#48BB78" : "text.primary"}
        textAlign="right"
      >
        {hStr}
      </Text>
    </Grid>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} positioning={{ placement: "top" }}>
        {rowContent}
      </Tooltip>
    );
  }
  return rowContent;
};

export function jumpId(title) { return `ts-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }

const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";

export const JumpRefs = createContext(null);

export const jumpProps = (refs, id) => (refs ? { ref: refs[id], "data-jump": id, style: { scrollMarginTop: JUMP_MARGIN } } : {});

export const SectionCard = ({ title, children }) => {
  const refs = useContext(JumpRefs);
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" {...jumpProps(refs, jumpId(title))}>
      <Flex
        px={4}
        py={2.5}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        align="center"
        gap={2}
      >
        <Box w="3.5px" h="11px" bg="brand.500" borderRadius="xs" />
        <Box flex={1}>
          <Text fontSize="11px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
            {title}
          </Text>
        </Box>
      </Flex>
      <VStack gap={0} align="stretch">
        <Grid templateColumns="1fr 100px 100px" gap={2} px={3} py={1.5} bg="whiteAlpha.50" alignItems="center">
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
            Metric
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" textAlign="right" letterSpacing="0.06em">
            Away
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" textAlign="right" letterSpacing="0.06em">
            Home
          </Text>
        </Grid>
        {children}
      </VStack>
    </Box>
  );
};

export const OverviewBar = ({ away, home, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayName = getTeamLabel(awayId);
  const homeName = getTeamLabel(homeId);

  const items = [
    { label: "Plays", away: away.playsOffense, home: home.playsOffense, format: "int" },
    { label: "Yards", away: away.totalYards, home: home.totalYards, format: "int" },
    { label: "YPP", away: away.yardsPerPlay, home: home.yardsPerPlay, format: "num", dec: 1 },
    { label: "Success", away: away.successRate, home: home.successRate, format: "pct" },
    { label: "EPA", away: away.epaTotal, home: home.epaTotal, format: "signed", dec: 1 },
    { label: "EPA/Play", away: away.epaPerPlay, home: home.epaPerPlay, format: "signed", dec: 3 },
    { label: "Explosive", away: away.explosiveRate, home: home.explosiveRate, format: "pct" },
    { label: "Havoc", away: away.havocRateForced, home: home.havocRateForced, format: "pct" },
    { label: "TO Margin", away: away.turnoverMargin, home: home.turnoverMargin, format: "signed", dec: 0 },
  ];

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center" gap={3}>
          <Box w="6px" h="24px" bg={awayColor} borderRadius="sm" />
          <Text fontSize="lg" fontWeight="black" color="text.primary" letterSpacing="0.02em">{awayName}</Text>
        </Flex>
        <Text fontSize="xs" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">VS</Text>
        <Flex align="center" gap={3}>
          <Text fontSize="lg" fontWeight="black" color="text.primary" letterSpacing="0.02em">{homeName}</Text>
          <Box w="6px" h="24px" bg={homeColor} borderRadius="sm" />
        </Flex>
      </Flex>
      <Grid templateColumns={{ base: "repeat(3, 1fr)", md: "repeat(9, 1fr)" }} gap={3}>
        {items.map((item) => {
          const aNum = Number(item.away);
          const hNum = Number(item.home);
          const aValid = !Number.isNaN(aNum) && item.away != null;
          const hValid = !Number.isNaN(hNum) && item.home != null;
          let aWins = null;
          if (aValid && hValid) aWins = aNum >= hNum;

          const fmt = (v) => {
            if (v == null) return "—";
            if (item.format === "pct") return fPct(v);
            if (item.format === "signed") return fSigned(v, item.dec ?? 1);
            if (item.format === "int") return fNum(v, 0);
            return fNum(v, item.dec ?? 1);
          };

          return (
            <Box key={item.label} textAlign="center" p={2} bg="whiteAlpha.50" borderRadius="sm">
              <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
                {item.label}
              </Text>
              <Flex justify="center" gap={2}>
                <Text fontSize="sm" fontWeight="900" fontFamily="mono" color={aWins === true ? "#48BB78" : "text.primary"}>
                  {fmt(item.away)}
                </Text>
                <Text fontSize="sm" color="text.muted">|</Text>
                <Text fontSize="sm" fontWeight="900" fontFamily="mono" color={aWins === false ? "#48BB78" : "text.primary"}>
                  {fmt(item.home)}
                </Text>
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
