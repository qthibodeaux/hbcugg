import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Flex, Text, Box } from "@chakra-ui/react";
import { CARD_ACCENTS } from "../../../utils/rosterHubConfig";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const StateList = ({ data, compact }) => {
  const { isMobile } = useLayoutDensity();
  const states = (data?.state_distribution ?? []).slice(0, compact ? 6 : 10);
  const max = states[0]?.count ?? 1;
  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={1.5}>
      {states.map((s) => (
        <Flex key={s.state} align="center" gap={isMobile ? 1.5 : 2.5} flex={isMobile ? "unset" : 1}>
          <Text fontSize="sm" fontWeight="black" color="white" w={isMobile ? "1.6rem" : "1.875rem"} flexShrink={0} whiteSpace="nowrap">
            {s.state}
          </Text>
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
              bg="linear-gradient(90deg, #3182ce, #3182ce8C)"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w={isMobile ? "1.6rem" : "2.125rem"}
            alignSelf="center"
            textAlign="right"
          >
            {s.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const HotspotList = ({ data, compact }) => {
  const spots = (data?.hotspots ?? []).slice(0, compact ? 6 : 8);
  const max = spots[0]?.count ?? 1;
  return (
    <Flex direction="column" h="100%" gap={1.5}>
      {spots.map((s) => (
        <Flex key={s.city} align="stretch" gap={2.5} flex={1}>
          <Text fontSize="sm" fontWeight="black" color="white" w="9rem" flexShrink={0} lineClamp={1} alignSelf="center">
            {s.city}
          </Text>
          <Box
            flex={1}
            minW={0}
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              borderRadius="full"
              bg="linear-gradient(90deg, #805AD5, #805AD58C)"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w="1.625rem"
            alignSelf="center"
            textAlign="right"
          >
            {s.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const GeoKpis = ({ data, accent = CARD_ACCENTS.geographic }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = data?.distance_tier_breakdown ?? {};
  const TIER_COLORS = { local: "#3182ce", regional: "#805AD5", national: "#38B2AC" };

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={{ base: 2, lg: 3 }}>
      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0}>
          {[
            ["In-State", `${(data?.in_state_pct ?? 0).toFixed(0)}%`],
            ["Avg Dist", `${data?.avg_recruiting_distance_miles ?? 0}mi`],
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
              {(data?.in_state_pct ?? 0).toFixed(0)}%
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              In-State
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
              {data?.avg_recruiting_distance_miles ?? 0}mi
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Avg Dist
            </Text>
          </Box>
        </Flex>
      )}

      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0} pt={1} borderTop="1px solid" borderColor="whiteAlpha.100">
          {[
            ["local", "Local"],
            ["regional", "Regional"],
            ["national", "National"],
          ].map(([k, lbl]) => {
            const color = TIER_COLORS[k];
            return (
              <Box key={k} bg={`${color}1A`} border="1px solid" borderColor={`${color}44`} borderRadius="md" px={2.5} py={1.5}>
                <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" mb="0.15rem">
                  {lbl}
                </Text>
                <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1}>
                  {tiers[k] ?? 0}
                </Text>
              </Box>
            );
          })}
        </Flex>
      ) : (
        <Flex gap={2} flexShrink={0}>
          {[
            ["local", "Local"],
            ["regional", "Regional"],
            ["national", "National"],
          ].map(([k, lbl]) => (
            <Box key={k} flex={1} textAlign="center">
              <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="black" color="white">
                {tiers[k] ?? 0}
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="text.muted">
                {lbl}
              </Text>
            </Box>
          ))}
        </Flex>
      )}

      <Box flex={isMobile ? "unset" : 1} overflow={isMobile ? "visible" : "hidden"} pt={isMobile ? 1 : 0} borderTop={isMobile ? "1px solid" : "none"} borderColor="whiteAlpha.100">
        <StateList data={data} compact />
      </Box>
    </Flex>
  );
};
