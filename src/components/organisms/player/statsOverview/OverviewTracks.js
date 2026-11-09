import { Box, Flex, Text } from "@chakra-ui/react";
import { TRACK_H, TRACK_BG, NEGATIVE, ROW_GAP, StatLabel, StatNum, Panel, TYPE } from "./OverviewPrimitives";

export const Track = ({ value, min = 0, max = 100, baseline, accent }) => {
  const span = max - min || 1;
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const hasBaseline = Number.isFinite(baseline) && baseline > min;
  const basePos = hasBaseline ? pos(baseline) : 0;
  const valPos = pos(value);
  const above = !hasBaseline || value >= baseline;
  const left = Math.min(basePos, valPos);
  const width = Math.abs(valPos - basePos);

  return (
    <Box position="relative" h={TRACK_H} bg={TRACK_BG} borderRadius="full">
      <Box
        position="absolute"
        left={`${left}%`}
        w={`${width}%`}
        top={0}
        bottom={0}
        bg={above ? accent : NEGATIVE}
        borderRadius="full"
      />
      {hasBaseline && (
        <Box position="absolute" left={`${basePos}%`} top="-6px" transform="translateX(-50%)" lineHeight={0}>
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M4.5 6L9 0H0L4.5 6Z" fill="white" fillOpacity="0.9" />
          </svg>
        </Box>
      )}
    </Box>
  );
};

export const MetricRow = ({ label, display, amount, accent, tone = "white", mb = ROW_GAP, min, max, baseline }) => (
  <Box mb={mb}>
    <Flex justify="space-between" align="baseline" gap={2} mb={1}>
      <StatLabel>{label}</StatLabel>
      <StatNum color={tone}>{display}</StatNum>
    </Flex>
    <Track value={amount} min={min} max={max} baseline={baseline} accent={accent} />
  </Box>
);

export const Sparkline = ({ series, accent }) => {
  if (series.length < 2) return null;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${30 - ((v - min) / span) * 26}`).join(" ");
  return (
    <Box w="full" h="2.75rem" my={1}>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <polyline points={`0,32 ${pts} 100,32`} fill={accent} opacity="0.15" stroke="none" />
        <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </Box>
  );
};

export const MomentRow = ({ icon: Icon, tone, label, game, value }) => (
  <Panel display="flex" alignItems="center" gap={3}>
    <Flex w="1.9rem" h="1.9rem" align="center" justify="center" borderRadius="md" bg={`${tone}26`} flexShrink={0}>
      <Icon size={15} color={tone} />
    </Flex>
    <Box flex={1} minW={0}>
      <StatLabel color={tone}>{label}</StatLabel>
      <Text fontSize={TYPE.title} fontWeight="900" color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        {game ? `${game.away ? "at" : "vs"} ${game.opp}` : "—"}
        {game?.date ? <Text as="span" fontSize={TYPE.label} fontWeight="800" color="whiteAlpha.500"> · {game.date}</Text> : null}
      </Text>
    </Box>
    <StatNum color={tone}>{value}</StatNum>
  </Panel>
);
