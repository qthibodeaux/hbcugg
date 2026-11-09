import { Flex, Box, Text } from "@chakra-ui/react";
import { tierColor, ordinalSuffix, CLASS_ORDER, CLASS_ABBR } from "./bioBackgroundModel";
import { Minus, ChevronUp, ChevronDown } from "lucide-react";

// Bio column framing, comparative rows, percentile bars and class-count presentation.

export const CardTitle = ({ icon: Icon, primary, children }) => (
  <Flex align="center" gap={2} mb={4}>
    <Box w="3px" h="16px" bg={primary ?? "brand.500"} borderRadius="full" />
    {Icon && <Icon size={13} color="var(--chakra-colors-text-muted)" />}
    <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
      {children}
    </Text>
  </Flex>
);

export const Column = ({ children, last = false, p = 6, ...rest }) => (
  <Box
    h="full"
    p={p}
    position="relative"
    overflow="hidden"
    borderRight={last ? "none" : "1px solid"}
    borderColor="whiteAlpha.100"
    {...rest}
  >
    {children}
  </Box>
);

const PercentileBar = ({ pct }) => {
  if (pct == null) return null;
  const color = tierColor(pct);
  return (
    <Box position="relative" h="6px" bg="whiteAlpha.100" borderRadius="full" mt={2.5}>
      <Box position="absolute" left={0} top={0} bottom={0} w={`${pct}%`} bg={color} opacity={0.75} borderRadius="full" />
      <Box
        position="absolute"
        left={`${pct}%`}
        top="50%"
        transform="translate(-50%, -50%)"
        w="10px"
        h="10px"
        borderRadius="full"
        bg={color}
        border="2px solid"
        borderColor="#0B0B0D"
      />
    </Box>
  );
};

export const ComparativeRow = ({ label, value, delta, deltaUnit, pct }) => {
  const hasDelta = Number.isFinite(delta);
  const isEven = hasDelta && delta === 0;
  const deltaColor = isEven ? "text.muted" : delta > 0 ? "green.300" : "orange.300";
  const DeltaIcon = isEven ? Minus : delta > 0 ? ChevronUp : ChevronDown;

  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} minW={0}>
        <Text fontSize="10px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em" whiteSpace="nowrap">
          {label}
        </Text>
        {pct != null && (
          <Text fontSize="10px" fontWeight="700" color="text.muted" whiteSpace="nowrap">
            {pct}
            {ordinalSuffix(pct)}
          </Text>
        )}
      </Flex>

      <Flex align="baseline" gap={2} mt={0.5} minW={0}>
        <Text fontSize="xl" fontWeight="black" color={tierColor(pct)} lineHeight={1} whiteSpace="nowrap">
          {value}
        </Text>
        {hasDelta && (
          <Flex align="center" gap="1px" color={deltaColor} flexShrink={0}>
            <DeltaIcon size={13} />
            <Text fontSize="11px" fontWeight="900" whiteSpace="nowrap">
              {isEven ? "avg" : `${Math.abs(delta)}${deltaUnit ?? ""}`}
            </Text>
          </Flex>
        )}
      </Flex>

      <PercentileBar pct={pct} />
    </Box>
  );
};

export const CountChip = ({ value, label }) => (
  <Flex align="baseline" gap={1.5} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="full" px={3} py={1.5}>
    <Text fontSize="sm" fontWeight="black" color="white">
      1 of {value}
    </Text>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.04em">
      {label}
    </Text>
  </Flex>
);

export const PositionClassGrid = ({ positionLabel, counts, classYear, primary, secondary }) => (
  <Box>
    <Text fontSize="11px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.02em" mb={2}>
      {positionLabel} on Roster
    </Text>
    <Flex border="1px solid" borderColor={primary} borderRadius="md" overflow="hidden">
      {CLASS_ORDER.map((c, i) => {
        const isCurrent = classYear === c.year;
        return (
          <Flex
            key={c.year}
            flex={1}
            direction="column"
            align="center"
            justify="center"
            gap="2px"
            py={3}
            bg={isCurrent ? primary : "transparent"}
            borderLeft={i > 0 ? "1px solid" : "none"}
            borderColor={primary}
          >
            <Text fontSize="xl" fontWeight="black" color={isCurrent ? secondary : "white"} lineHeight={1}>
              {counts?.[c.year] ?? 0}
            </Text>
            <Text fontSize="9px" fontWeight="800" color={isCurrent ? secondary : "text.muted"} textTransform="uppercase">
              {CLASS_ABBR[c.year]}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  </Box>
);
