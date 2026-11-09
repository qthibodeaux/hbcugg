import { DIM, inkOn, PANEL, LINE } from "./scoutPresentation";
import { Text, Flex, Box } from "@chakra-ui/react";

// Scout label/rank/panel primitives shared by screen sections, independent of the export controller.

export const Kicker = ({ children, color = DIM, ...rest }) => (
  <Text fontSize="0.62rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.2} {...rest}>{children}</Text>
);

export const RankChip = ({ rank, color, total = 18 }) => (
  <Flex align="center" justify="center" minW="2.1rem" h="1.45rem" px="0.3rem" borderRadius="0.3rem" bg={rank ? color : "whiteAlpha.100"} flexShrink={0}
    title={rank ? `#${rank} of ${total}` : "No rank"}>
    <Text fontSize="0.72rem" fontWeight="900" color={rank ? inkOn(color) : "white"} fontVariantNumeric="tabular-nums" lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

export const Panel = ({ title, right, color = "#A855F7", bodyProps, children, ...rest }) => (
  <Box bg={PANEL} borderTop="3px solid" borderTopColor={color} overflow="hidden" {...rest}>
    <Flex align="center" justify="space-between" gap={3} px={4} py={2.5} borderBottom="1px solid" borderColor={LINE}>
      <Flex align="center" gap={2} minW={0}>
        <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={color} flexShrink={0} />
        <Text fontSize="0.7rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>{title}</Text>
      </Flex>
      {right}
    </Flex>
    <Box px={4} py={3} {...bodyProps}>{children}</Box>
  </Box>
);
