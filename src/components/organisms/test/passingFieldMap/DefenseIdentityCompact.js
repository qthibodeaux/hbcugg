import { VStack, Flex, Text, Grid } from "@chakra-ui/react";
import { fmtPct, fmtNum } from "./passingPresentation";

export const DefenseIdentityCompact = ({ defense }) => (
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
