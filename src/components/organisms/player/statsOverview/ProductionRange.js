import { Box, Flex, Text } from "@chakra-ui/react";
import { PANEL_PAD, PANEL_BORDER, SectionHead, StatLabel, StatNum, TYPE, POSITIVE, NEGATIVE, TRACK_H, TRACK_BG } from "./OverviewPrimitives";
import { Track } from "./OverviewTracks";

export const ProductionBlock = ({ block, scaleMax, accent, isFirst }) => {
  const positive = block.par >= 0;
  return (
    <Box p={PANEL_PAD} borderTop={isFirst ? "none" : "1px solid"} borderColor={PANEL_BORDER}>
      <SectionHead accent={accent} dim={!isFirst}>{block.label}</SectionHead>

      <Flex wrap="wrap" columnGap={5} rowGap={1.5} mb={2}>
        {block.stats.map((s) => (
          <Box key={s.label}>
            <StatLabel color={accent} mb={0.5}>{s.label}</StatLabel>
            <StatNum>{s.value}</StatNum>
          </Box>
        ))}
      </Flex>

      <Flex align="center" gap={3}>
        <StatLabel flexShrink={0} whiteSpace="nowrap">Production</StatLabel>
        <Box flex={1} minW={0}>
          <Track value={block.production} min={0} max={scaleMax} baseline={block.replacement} accent={accent} />
          <Flex justify="space-between" mt={1}>
            <Flex gap={1.5} align="baseline">
              <StatLabel>Baseline</StatLabel>
              <Text fontSize={TYPE.inline} fontWeight="900" fontStyle="italic" color="whiteAlpha.900">
                {block.replacement.toFixed(1)}
              </Text>
            </Flex>
            <Flex gap={1.5} align="baseline">
              <StatLabel>Total</StatLabel>
              <Text fontSize={TYPE.inline} fontWeight="900" fontStyle="italic" color="whiteAlpha.900">
                {block.production.toFixed(1)}
              </Text>
            </Flex>
          </Flex>
        </Box>
        <StatNum color={positive ? POSITIVE : NEGATIVE}>
          {positive ? "+" : ""}{block.par.toFixed(1)}
        </StatNum>
      </Flex>
    </Box>
  );
};

export const GameRange = ({ range, rows, accent, gamesPlayed }) => {
  const span = range.max - range.min || 1;
  const pos = (v) => ((v - range.min) / span) * 100;

  return (
    <Box>
      <Box position="relative" h={TRACK_H} bg={TRACK_BG} borderRadius="full" mt={3} mb={2}>
        <Box position="absolute" left={`${pos(range.floor)}%`} w={`${pos(range.ceiling) - pos(range.floor)}%`} top={0} bottom={0} bg={accent} borderRadius="full" />
        {rows.map((g, i) => (
          <Box key={`${g.opp}-${i}`} position="absolute" left={`${pos(g.total)}%`} top="-3px" bottom="-3px" w="2px" bg="whiteAlpha.700" transform="translateX(-50%)" />
        ))}
        <Box position="absolute" left={`${pos(range.median)}%`} top="50%" transform="translate(-50%, -50%)" w="13px" h="13px" borderRadius="full" bg={accent} border="3px solid" borderColor="bg.secondary" />
      </Box>
      <Flex justify="space-between" gap={2}>
        {[
          { l: "Floor", v: range.floor },
          { l: "Median", v: range.median },
          { l: "Ceiling", v: range.ceiling },
          { l: "Std Dev", v: range.stddev },
        ].map((x) => (
          <Box key={x.l}>
            <StatNum>{x.v}</StatNum>
            <StatLabel mt={0.5}>{x.l}</StatLabel>
          </Box>
        ))}
      </Flex>
      <Flex gap={4} mt={2} pt={2} borderTop="1px solid" borderColor={PANEL_BORDER}>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={accent}>{range.aboveReplacement}/{gamesPlayed}</StatNum>
          <StatLabel>Above Repl</StatLabel>
        </Flex>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={POSITIVE}>{range.boom}</StatNum>
          <StatLabel>Boom</StatLabel>
        </Flex>
        <Flex align="baseline" gap={1.5}>
          <StatNum color={NEGATIVE}>{range.bust}</StatNum>
          <StatLabel>Bust</StatLabel>
        </Flex>
      </Flex>
    </Box>
  );
};
