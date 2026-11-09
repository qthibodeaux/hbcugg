import { Flex, Text, Box } from "@chakra-ui/react";
import { PANEL_BORDER, PANEL_PAD, HeroNum, StatLabel, ROW_GAP, StatNum } from "./OverviewPrimitives";
import { Track } from "./OverviewTracks";

export const SnapshotCard = ({ hero, heroLabel, metrics, base, accent }) => (
  <Flex
    position="relative"
    overflow="hidden"
    borderRadius="md"
    bg={`linear-gradient(150deg, ${base}4D 0%, rgba(255,255,255,0.02) 72%)`}
    border="1px solid"
    borderColor={PANEL_BORDER}
    p={PANEL_PAD}
    gap={3}
    align="center"
    h="full"
  >
    <Text
      position="absolute"
      right="-0.4rem"
      bottom="-1.4rem"
      fontSize="clamp(3.6rem, 7.5vw, 6rem)"
      fontWeight="900"
      fontStyle="italic"
      color="whiteAlpha.100"
      lineHeight={0.8}
      letterSpacing="-0.05em"
      pointerEvents="none"
      aria-hidden="true"
    >
      {hero}
    </Text>

    <Box position="relative" zIndex={1} flex="1 1 0" minW={0}>
      <HeroNum>{hero}</HeroNum>
      <StatLabel color={accent} mt={1.5}>{heroLabel}</StatLabel>
    </Box>

    <Box position="relative" zIndex={1} flex="0 0 36%" minW={0}>
      {metrics.map((m, i) => (
        <Box key={m.label} mt={i === 0 ? 0 : ROW_GAP}>
          <StatNum>{m.value}</StatNum>
          <StatLabel mt={0.5} mb={1}>{m.label}</StatLabel>
          <Track value={m.pct} accent={accent} />
        </Box>
      ))}
    </Box>
  </Flex>
);
