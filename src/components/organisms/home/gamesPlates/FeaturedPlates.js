import { Flex, Text, Box } from "@chakra-ui/react";
import { Mark, Micro, BigNumber } from "../../../molecules/home/LiveTile";

// Home Games tile team identities and quarter-score rows.

export const WeekSide = ({ side, won, align }) => (
  <Flex direction="column" align={align} gap="2cqmin" minW={0} flex={1}>
    <Mark logo={side.logo} label={side.label} size={22} />
    <Text fontSize="5.4cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1} color={won ? "white" : "whiteAlpha.700"} lineClamp={1} textAlign={align === "flex-end" ? "right" : "left"}>
      {side.shortName ?? side.name}
    </Text>
    {side.record ? <Micro size={2.6} color="rgba(255,255,255,0.4)">{side.record}</Micro> : null}
  </Flex>
);

export const QuarterRow = ({ side, byQ, total, won }) => (
  <Flex align="center" gap="2.4cqmin" minW={0}>
    <Mark logo={side.logo} label={side.label} size={11} />
    <Text fontSize="5cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={won ? "white" : "whiteAlpha.700"} lineClamp={1} flex={1} minW={0}>
      {side.shortName ?? side.name}
    </Text>
    {(byQ ?? []).map((q, i) => (
      <Text key={i} fontSize="3.6cqmin" fontWeight="bold" color="whiteAlpha.600" w="5cqmin" textAlign="center" fontVariantNumeric="tabular-nums">{q}</Text>
    ))}
    <BigNumber size={11} color={won ? "white" : "whiteAlpha.600"} w="14cqmin" textAlign="right">{total}</BigNumber>
  </Flex>
);

export const AheadSide = ({ side }) => (
  <Flex align="center" gap="3cqmin" minW={0}>
    <Mark logo={side.logo} label={side.label} size={15} />
    <Box minW={0}>
      <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1} lineClamp={1}>
        {side.shortName ?? side.name}
      </Text>
      {side.record ? <Micro size={2.6} color="rgba(255,255,255,0.4)" mt="1cqmin">{side.record}</Micro> : null}
    </Box>
  </Flex>
);
