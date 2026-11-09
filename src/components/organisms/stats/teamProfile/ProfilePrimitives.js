import { Box, Text, Flex } from "@chakra-ui/react";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";
import { OFF_TONE, DEF_TONE, POSITIVE, NEGATIVE, fmtRate } from "./profilePresentation";

const RankChip = ({ rank, total = 18 }) => {
  if (!Number.isFinite(rank)) return null;
  const good = rank <= total / 2;
  const strength = Math.min(1, Math.abs(rank - (total + 1) / 2) / ((total - 1) / 2));
  const alpha = (0.14 + strength * 0.4).toFixed(2);
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={good ? `rgba(34,197,94,${alpha})` : `rgba(168,85,247,${alpha})`} flexShrink={0}>
      <Text fontSize="9px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">#{rank}</Text>
    </Box>
  );
};

const pctFill = (pct, tone) => {
  if (!Number.isFinite(pct)) return "transparent";
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.1 + strength * 0.38).toFixed(2);
  return pct >= 50 ? `rgba(72,187,120,${alpha})` : `rgba(${tone === "def" ? "66,153,225" : "246,173,85"},${alpha})`;
};

export const Kpi = ({ label, value, rank, total, tone = "white", sub }) => (
  <Box bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} minW={0}>
    <Kicker color="whiteAlpha.500">{label}</Kicker>
    <Flex align="baseline" gap={2} mt={1.5} minW={0}>
      <Text
        fontSize="clamp(1.15rem, 2.4vw, 1.9rem)" fontWeight="900" fontStyle="italic" color={tone}
        lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1}
      >
        {value}
      </Text>
      <RankChip rank={rank} total={total} />
    </Flex>
    {sub && <Kicker color="whiteAlpha.400" mt={1.5}>{sub}</Kicker>}
  </Box>
);

export const SplitRow = ({ label, offValue, defValue, offPct, defPct, offRank, defRank, total }) => (
  <Flex align="center" gap={2} py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
    <Text flex="1" minW={0} fontSize="11px" fontWeight="700" color="whiteAlpha.800" lineClamp={1}>{label}</Text>
    <Flex w="38%" minW={0} gap={2}>
      <Flex flex="1" align="center" justify="space-between" gap={1.5} px={2} py={1} borderRadius="sm" bg={pctFill(offPct, "off")} minW={0}>
        <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{offValue}</Text>
        <RankChip rank={offRank} total={total} />
      </Flex>
      <Flex flex="1" align="center" justify="space-between" gap={1.5} px={2} py={1} borderRadius="sm" bg={pctFill(defPct, "def")} minW={0}>
        <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{defValue}</Text>
        <RankChip rank={defRank} total={total} />
      </Flex>
    </Flex>
  </Flex>
);

export const SplitHead = () => (
  <Flex align="center" gap={2} pb={1.5} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Box flex="1" />
    <Flex w="38%" gap={2}>
      <Box flex="1" textAlign="center"><Kicker color={OFF_TONE}>Offense</Kicker></Box>
      <Box flex="1" textAlign="center"><Kicker color={DEF_TONE}>Defense</Kicker></Box>
    </Flex>
  </Flex>
);

export const MetricRule = ({ label, value, unit, percentile, leagueValue, blurb }) => {
  const tone = percentile == null ? "whiteAlpha.400" : percentile >= 60 ? POSITIVE : percentile <= 40 ? NEGATIVE : "whiteAlpha.500";
  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} mb={1}>
        <Text fontSize="11px" fontWeight="700" color="whiteAlpha.800" lineClamp={1} title={blurb}>{label}</Text>
        <Flex align="baseline" gap={2} flexShrink={0}>
          <Text fontSize="12px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{fmtRate(value, unit)}</Text>
          <Text fontSize="9px" fontWeight="900" color={tone} fontVariantNumeric="tabular-nums" w="26px" textAlign="right">
            {percentile == null ? "—" : `${percentile}%`}
          </Text>
        </Flex>
      </Flex>
      <Box position="relative" h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
        <Box h="100%" borderRadius="full" bg={tone} style={{ width: `${Math.max(percentile ?? 0, 2)}%` }} />
      </Box>
      {Number.isFinite(leagueValue) && <Kicker mt={1} color="whiteAlpha.400">Lg {fmtRate(leagueValue, unit)}</Kicker>}
    </Box>
  );
};
