import { Flex, Text, Grid, VStack } from "@chakra-ui/react";
import { fmtPct, fmt1 } from "../../../../utils/gameBoxScore/statHelpers";

// Existing lab presentation extracted from QGameBoxScore; compact/standard JSX is preserved.

const calculateGrade = (label, val) => {
  if (label === "Disrupt") {
    const rate = val * 100;
    if (rate >= 18) return "A";
    if (rate >= 15) return "B";
    if (rate >= 12) return "C";
    if (rate >= 9) return "D";
    return "F";
  }
  if (label === "Expl. Prev") {
    const rate = val * 100;
    if (rate >= 92) return "A";
    if (rate >= 86) return "B";
    if (rate >= 80) return "C";
    if (rate >= 74) return "D";
    return "F";
  }
  if (label === "Havoc") {
    const rate = val * 100;
    if (rate >= 16) return "A";
    if (rate >= 13) return "B";
    if (rate >= 10) return "C";
    if (rate >= 7) return "D";
    return "F";
  }
  if (label === "Sack") {
    const rate = val * 100;
    if (rate >= 10) return "A";
    if (rate >= 7) return "B";
    if (rate >= 4) return "C";
    if (rate >= 2) return "D";
    return "F";
  }
  if (label === "YPP") {
    if (val <= 5.5) return "A";
    if (val <= 6.8) return "B";
    if (val <= 7.8) return "C";
    if (val <= 8.8) return "D";
    return "F";
  }
  if (label === "BDB") {
    if (val >= 16) return "A";
    if (val >= 12) return "B";
    if (val >= 8) return "C";
    if (val >= 5) return "D";
    return "F";
  }
  if (label === "TFL") {
    if (val >= 10) return "A";
    if (val >= 7) return "B";
    if (val >= 5) return "C";
    if (val >= 3) return "D";
    return "F";
  }
  if (label === "PD") {
    if (val >= 6) return "A";
    if (val >= 4) return "B";
    if (val >= 3) return "C";
    if (val >= 2) return "D";
    return "F";
  }
  return "B";
};

const getContextArrow = (label, val) => {
  if (label === "YPP") {
    return val <= 6.8 ? "▼" : "▲";
  }
  if (val >= 0.15 || val > 7) return "▲";
  if (val <= 0.05 || val < 3) return "▼";
  return "═";
};

export const DefenseIdentityCompact = ({ defense, isCompact }) => {
  if (isCompact) {
    return (
      <Flex align="center" justify="space-between" bg={`${defense.colors.primary}12`} borderTop={`1px solid ${defense.colors.primary}25`} px={1.5} py="3px" gap={1.5} w="full">
        <Flex align="center" gap={1} flexShrink={0}>
          <Flex w="16px" h="16px" borderRadius="xs" bg={defense.colors.primary} align="center" justify="center" border="1px solid whiteAlpha.200">
            <Text fontSize="7px" fontWeight="900" color={defense.colors.secondary}>{defense.shortName}</Text>
          </Flex>
          <Text fontSize="7px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">DEF</Text>
        </Flex>

        <Grid templateColumns="repeat(4, 1fr)" gap={2} flex={1} maxW="280px">
          {[
            { label: "DRPT", value: fmtPct(defense.disruption_rate), color: "text.primary" },
            { label: "EXPL", value: fmtPct(defense.explosive_prevention), color: "text.primary" },
            { label: "HVC", value: fmtPct(defense.havoc_rate), color: "#E53E3E" },
            { label: "SCK", value: fmtPct(defense.sack_rate), color: "#63B3ED" },
          ].map((stat) => (
            <Flex key={stat.label} align="baseline" justify="center" gap={0.5}>
              <Text fontSize="5.5px" fontWeight="700" color="text.muted" textTransform="uppercase">{stat.label}:</Text>
              <Text fontSize="8.5px" fontWeight="950" color={stat.color}>{stat.value}</Text>
            </Flex>
          ))}
        </Grid>
      </Flex>
    );
  }

  return (
    <VStack gap={1} align="stretch" w="full" bg={`${defense.colors.primary}08`} p={1.5} borderRadius="md" border={`1px solid ${defense.colors.primary}20`}>
      <Flex align="center" gap={1.5}>
        <Flex w="18px" h="18px" borderRadius="xs" bg={defense.colors.primary} align="center" justify="center" border="1px solid whiteAlpha.200" flexShrink={0}>
          <Text fontSize="8.5px" fontWeight="950" color={defense.colors.secondary}>{defense.shortName}</Text>
        </Flex>
        <Text fontSize="10px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">Opponent Pass Defense Impact</Text>
      </Flex>
      <Grid templateColumns="repeat(4, 1fr)" gap={1.5}>
        {[
          { dispLabel: "DRPT", label: "Disrupt", raw: defense.disruption_rate, value: fmtPct(defense.disruption_rate) },
          { dispLabel: "EXPL", label: "Expl. Prev", raw: defense.explosive_prevention, value: fmtPct(defense.explosive_prevention) },
          { dispLabel: "HVC", label: "Havoc", raw: defense.havoc_rate, value: fmtPct(defense.havoc_rate), color: "#E53E3E" },
          { dispLabel: "SCK", label: "Sack", raw: defense.sack_rate, value: fmtPct(defense.sack_rate), color: "#63B3ED" },
          { dispLabel: "YPP", label: "YPP", raw: defense.ypp, value: fmt1(defense.ypp) },
          { dispLabel: "BDB", label: "BDB", raw: defense.bdb, value: defense.bdb },
          { dispLabel: "TFL", label: "TFL", raw: defense.tfl, value: defense.tfl },
          { dispLabel: "PD", label: "PD", raw: defense.pd, value: defense.pd },
        ].map((stat) => {
          const grade = calculateGrade(stat.label, stat.raw);
          const arrow = getContextArrow(stat.label, stat.raw);
          const gradeColor =
            grade === "A"
              ? "#48BB78"
              : grade === "B"
                ? "#38A169"
                : grade === "C"
                  ? "#ECC94B"
                  : grade === "D"
                    ? "#ED8936"
                    : "#E53E3E";

          return (
            <Flex
              key={stat.label}
              direction="column"
              bg="whiteAlpha.50"
              border="1px solid whiteAlpha.100"
              borderRadius="sm"
              p={1}
              align="center"
              justify="space-between"
              minH="42px"
            >
              <Flex w="full" align="center" justify="space-between" px={0.5}>
                <Text fontSize="7.5px" fontWeight="800" color="text.muted" textTransform="uppercase">
                  {stat.dispLabel}
                </Text>
                <Text fontSize="7px" fontWeight="900" color={arrow === "▲" ? "#48BB78" : arrow === "▼" ? "#E53E3E" : "text.muted"}>
                  {arrow}
                </Text>
              </Flex>
              <Flex w="full" align="baseline" justify="space-between" px={0.5} mt="2px">
                <Text fontSize="12px" fontWeight="950" color={stat.color ?? "text.primary"}>
                  {stat.value}
                </Text>
                <Text fontSize="9px" fontWeight="950" color={gradeColor}>
                  {grade}
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </VStack>
  );
};
