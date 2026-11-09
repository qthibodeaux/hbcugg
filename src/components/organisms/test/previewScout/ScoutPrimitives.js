import { DIM, inkOn, PANEL, LINE, BRAND, P_PANEL } from "./scoutPresentation";
import { Text, Flex, Box } from "@chakra-ui/react";
import { withAlpha } from "../../../game/export/exportData";

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

export const SheetCol = ({ title, rows, data, color, total }) => (
  <Box minW={0}>
    <Kicker mb={2}>{title}</Kicker>
    <Flex direction="column" gap={2}>
      {rows.map(([k, label]) => {
        const s = data[k];
        const fill = s.rank ? ((total - s.rank) / (total - 1)) * 100 : 0;
        return (
          <Box key={k}>
            <Flex align="center" justify="space-between" gap={2}>
              <Text fontSize="0.74rem" fontWeight="700" color="rgba(255,255,255,0.75)" lineClamp={1}>{label}</Text>
              <Flex align="center" gap={2} flexShrink={0}>
                <Text fontSize="0.9rem" fontWeight="900" color="white" fontFamily="mono">{s.display}</Text>
                <RankChip rank={s.rank} color={color} total={total} />
              </Flex>
            </Flex>
            <Box h="3px" mt={1} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <Box h="full" bg={color} opacity={0.85} style={{ width: `${Math.max(2, fill)}%` }} />
            </Box>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

export const PKick = ({ children, color = "rgba(255,255,255,0.55)", size = 11, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.15} {...rest}>{children}</Text>
);

export const PChip = ({ rank, color, w = "34px" }) => (
  <Flex align="center" justify="center" minW={w} h="20px" px="4px" borderRadius="4px" bg={rank ? color : "rgba(255,255,255,0.08)"} flexShrink={0}>
    <Text fontSize="12px" fontWeight="900" color={rank ? inkOn(color) : "white"} lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

export const PBox = ({ title, color = BRAND, right, children, ...rest }) => (
  <Flex direction="column" bg={P_PANEL} minW={0} {...rest}>
    <Flex align="center" justify="space-between" px="12px" h="26px" bg={withAlpha(color, 0.22)} borderTop={`3px solid ${color}`} flexShrink={0}>
      <PKick color="white" size={11}>{title}</PKick>
      {right}
    </Flex>
    <Box px="12px" py="8px" flex={1} minH={0}>{children}</Box>
  </Flex>
);
