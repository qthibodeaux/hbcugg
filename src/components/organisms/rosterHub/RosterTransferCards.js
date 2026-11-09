import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Flex, Box, Text } from "@chakra-ui/react";
import { TRANSFER_COLORS, CARD_ACCENTS } from "../../../utils/rosterHubConfig";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

const TierBars = ({ data }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = (data?.tier_breakdown ?? []).filter((t) => t.count > 0);
  return (
    <Flex direction="column" h="auto" gap={isMobile ? 1.5 : 2.5}>
      {tiers.map((t) => (
        <Flex key={t.tier} align="center" gap={isMobile ? 1.5 : 2.5}>
          <Box
            px={isMobile ? 1.5 : 2}
            py="0.15rem"
            borderRadius="sm"
            flexShrink={0}
            style={{ background: `${TRANSFER_COLORS[t.tier] ?? "#718096"}33` }}
          >
            <Text
              fontSize="xs"
              fontWeight="black"
              whiteSpace="nowrap"
              style={{ color: TRANSFER_COLORS[t.tier] ?? "#718096" }}
            >
              {t.tier}
            </Text>
          </Box>
          <Box
            flex={1}
            minW={0}
            h={isMobile ? "0.6rem" : "0.7rem"}
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              borderRadius="full"
              style={{
                width: `${t.pct}%`,
                background: `linear-gradient(90deg, ${TRANSFER_COLORS[t.tier] ?? "#718096"}, ${TRANSFER_COLORS[t.tier] ?? "#718096"}8C)`,
              }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w={isMobile ? "1.4rem" : "1.625rem"}
            textAlign="right"
            flexShrink={0}
          >
            {t.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const TransferKpis = ({ data, accent = CARD_ACCENTS.transfers }) => {
  const { isMobile } = useLayoutDensity();

  return (
    <Flex direction="column" h="auto" gap={{ base: 2, lg: 3 }}>
      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0}>
          {[
            ["Transfers", data?.transfer_count ?? 0],
            ["Portal Rate", `${(data?.transfer_rate ?? 0).toFixed(0)}%`],
          ].map(([lbl, val]) => (
            <Box key={lbl} bg={`${accent}1F`} border="1px solid" borderColor={`${accent}44`} borderRadius="md" px={2.5} py={1.5}>
              <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" mb="0.15rem">
                {lbl}
              </Text>
              <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1}>
                {val}
              </Text>
            </Box>
          ))}
        </Flex>
      ) : (
        <Flex gap={3} flexShrink={0}>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {data?.transfer_count ?? 0}
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Transfers
            </Text>
          </Box>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {(data?.transfer_rate ?? 0).toFixed(0)}%
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Portal Rate
            </Text>
          </Box>
        </Flex>
      )}
      <Box flex="unset" overflow="visible" pt={isMobile ? 1 : 0} borderTop={isMobile ? "1px solid" : "none"} borderColor="whiteAlpha.100">
        <TierBars data={data} />
      </Box>
    </Flex>
  );
};
