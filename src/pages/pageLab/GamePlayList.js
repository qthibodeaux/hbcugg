import { Box, Flex, Text } from "@chakra-ui/react";
import { PANEL, LINE } from "./gameTablesPresentation";
import { Kicker } from "./GameTableBlocks";

// Lab play lists with existing empty-state, EPA and WPA presentation.

export const PlayList = ({ title, plays, note }) => (
  <Box bg={PANEL} border="1px solid" borderColor={LINE} borderRadius="md" mb={3}>
    <Flex align="center" justify="space-between" px={3} py={2} borderBottom="1px solid" borderColor={LINE}>
      <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.1em">{title}</Text>
      {note && <Kicker>{note}</Kicker>}
    </Flex>
    {!plays.length ? (
      <Text fontSize="10px" color="whiteAlpha.500" px={3} py={3}>Not available — see the gap list.</Text>
    ) : (
      plays.map((p, i) => (
        <Flex key={i} gap={3} px={3} py={2} borderBottom={i === plays.length - 1 ? "none" : "1px solid"} borderColor="rgba(255,255,255,0.04)" align="flex-start">
          <Box w="4.2rem" flexShrink={0}>
            <Text fontSize="10px" fontWeight="900" color="whiteAlpha.700" fontVariantNumeric="tabular-nums">{p.time}</Text>
            <Kicker>{p.offense}</Kicker>
          </Box>
          <Text fontSize="10px" color="whiteAlpha.700" lineHeight={1.5} flex="1" minW={0}>{p.text}</Text>
          <Box w="3rem" textAlign="right" flexShrink={0}>
            <Text
              fontSize="11px"
              fontWeight="900"
              fontVariantNumeric="tabular-nums"
              color={p.epa === "—" ? "whiteAlpha.400" : Number(p.epa) >= 0 ? "#48BB78" : "#F6AD55"}
            >
              {p.epa ?? "—"}
            </Text>
            <Kicker>{p.points != null ? `${p.points} pts` : "EPA"}</Kicker>
          </Box>
          {p.wpa != null && (
            <Box w="3.2rem" textAlign="right" flexShrink={0}>
              <Text fontSize="11px" fontWeight="900" color="whiteAlpha.800" fontVariantNumeric="tabular-nums">
                {p.wpa}
              </Text>
              <Kicker>WPA</Kicker>
            </Box>
          )}
        </Flex>
      ))
    )}
  </Box>
);
