import { CARD_ACCENTS, POS_ORDER, MEAC_TEAM_IDS, SWAC_TEAM_IDS, ALL_TEAM_IDS, PHYSICAL_POSITION_LIST } from "../../../utils/rosterHubConfig";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Flex, Box, Text } from "@chakra-ui/react";
import { inchesToFtIn, computePositionRange, computePlayerPositionRange, readableTextColor } from "../../../utils/rosterHubModel";
import { useState, useMemo } from "react";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const PhysicalRows = ({ data, accent = CARD_ACCENTS.physical, twoColumn = false }) => {
  const { isMobile } = useLayoutDensity();
  const useTwoColumn = twoColumn && !isMobile;
  const byGroup = data?.by_position_group ?? {};
  const overall = data?.overall ?? {};
  const groups = Object.entries(byGroup)
    .filter(([g]) => g !== "Unknown")
    .sort((a, b) => (POS_ORDER[a[0]] ?? 9) - (POS_ORDER[b[0]] ?? 9))
    .slice(0, 8);
  const maxW = Math.max(...groups.map(([, s]) => s.weight_avg ?? 0), 1);
  const maxH = Math.max(...groups.map(([, s]) => s.height_avg ?? 0), 1);
  // Bars are scaled between the shortest/lightest and tallest/heaviest
  // position actually shown here, not from zero — every position's height
  // sits within a narrow 70"-78" band, so a 0-anchored scale left every bar
  // looking nearly full with no real spread.
  const minW = Math.min(...groups.map(([, s]) => s.weight_avg ?? Infinity).filter(Number.isFinite));
  const minH = Math.min(...groups.map(([, s]) => s.height_avg ?? Infinity).filter(Number.isFinite));
  const wSpan = maxW - minW || 1;
  const hSpan = maxH - minH || 1;
  const HEIGHT_BAR_COLOR = "#63B3ED";

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={1}>
      {/* Overall header */}
      <Flex
        gap={isMobile ? 1.5 : 3}
        pb={2}
        mb={1}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Box flex={1} textAlign="center" bg={`${accent}1A`} borderRadius="md" py={isMobile ? 1 : 2}>
          <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
            {inchesToFtIn(Math.round(overall.height_avg ?? 0))}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
            Avg Ht
          </Text>
        </Box>
        <Box flex={1} textAlign="center" bg={`${accent}1A`} borderRadius="md" py={isMobile ? 1 : 2}>
          <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
            {Math.round(overall.weight_avg ?? 0)}lb
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
            Avg Wt
          </Text>
        </Box>
      </Flex>
      {/* By position — 3 lines per position: a label/measurement header
          row, then a height bar, then a weight bar, each scaled between
          the min and max of that metric across these positions (not from
          zero) so the spread actually reads. Same shape on desktop and
          mobile now, just bigger type/bars on desktop. twoColumn splits
          the 8 positions into two balanced columns instead of one long
          stack — only worth it in wide contexts (League mode), so it's
          opt-in per caller rather than tied to isMobile. */}
      <Box
        display={useTwoColumn ? "grid" : "block"}
        gridTemplateColumns={useTwoColumn ? "repeat(2, 1fr)" : undefined}
        columnGap={useTwoColumn ? "2rem" : undefined}
      >
        {groups.map(([group, stats]) => (
          <Box key={group} py={isMobile ? 1.5 : 2} borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Flex justify="space-between" align="baseline" mb={isMobile ? 1 : 1.5}>
              <Text fontSize={isMobile ? "sm" : "md"} fontWeight="black" color="white">
                {group}
              </Text>
              <Text fontSize={isMobile ? "xs" : "sm"} fontWeight="bold" color="text.muted">
                {inchesToFtIn(Math.round(stats.height_avg))} <Box as="span" opacity={0.5}>·</Box> {Math.round(stats.weight_avg ?? 0)}lb
              </Text>
            </Flex>
            <Box bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden" h={isMobile ? "0.4rem" : "0.55rem"} mb={isMobile ? "0.3rem" : "0.4rem"}>
              <Box
                h="100%"
                borderRadius="full"
                bg={`linear-gradient(90deg, ${HEIGHT_BAR_COLOR}, ${HEIGHT_BAR_COLOR}8C)`}
                style={{ width: `${Math.max((((stats.height_avg ?? 0) - minH) / hSpan) * 100, 4)}%` }}
              />
            </Box>
            <Box bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden" h={isMobile ? "0.4rem" : "0.55rem"}>
              <Box
                h="100%"
                borderRadius="full"
                bg={`linear-gradient(90deg, ${accent}, ${accent}8C)`}
                style={{ width: `${Math.max((((stats.weight_avg ?? 0) - minW) / wSpan) * 100, 4)}%` }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
  );
};

const RANGE_METRIC_PLAYER_FIELD = { height_avg: "height", weight_avg: "weight" };

const RANGE_METRICS = [
  { id: "height_avg", label: "Height" },
  { id: "weight_avg", label: "Weight" },
];

const RANGE_SCOPES = [
  { id: "all", label: "All Teams" },
  { id: "conference", label: "Conference" },
];

export const PositionRangeChart = ({ mod, teamEntry, teamsMap, players, accent }) => {
  const [metric, setMetric] = useState("height_avg");
  const [scope, setScope] = useState("all");
  const { isMobile } = useLayoutDensity();

  const teamIds = scope === "conference"
    ? (teamEntry.conference === "MEAC" ? MEAC_TEAM_IDS : SWAC_TEAM_IDS)
    : ALL_TEAM_IDS;
  const scopeLabel = scope === "conference" ? teamEntry.conference : "League";

  const teamAvgStats = useMemo(
    () => computePositionRange(teamIds, teamsMap, metric),
    [teamIds, teamsMap, metric],
  );
  const playerStats = useMemo(
    () => computePlayerPositionRange(players, teamIds, RANGE_METRIC_PLAYER_FIELD[metric]),
    [players, teamIds, metric],
  );

  const formatValue = metric === "height_avg"
    ? (v) => inchesToFtIn(Math.round(v))
    : (v) => `${Math.round(v)}lb`;

  // Mobile — one row per position (offense QB→OL, then defense DL→DB, same
  // PHYSICAL_POSITION_LIST order as desktop) instead of 8 columns squeezed
  // side by side. The axis rotates 90°: min/max tick labels sit at the ends
  // of a horizontal track instead of top/bottom of a vertical one, same
  // bar-segment/marker math either way.
  if (isMobile) {
    return (
      <Box h="auto" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderLeft="4px solid" borderLeftColor={accent} borderRadius={0} overflow="hidden" display="flex" flexDirection="column">
        <Box px={3} pt={3} pb={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Text textStyle="kicker" color="text.muted">Athletic Profile</Text>
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em" mb="0.75rem">
            <Box as="span" color={accent} mr={1}>▸</Box>
            Physical — {scopeLabel} Range
          </Text>
          <Flex direction="column" gap="0.5rem">
            <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
              {RANGE_METRICS.map((m) => (
                <Box key={m.id} as="button" type="button" flex={1} onClick={() => setMetric(m.id)} px="0.75rem" py="0.5rem" borderRadius="sm" bg={metric === m.id ? accent : "transparent"}>
                  <Text fontSize="sm" fontWeight="black" color={metric === m.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase" textAlign="center">
                    {m.label}
                  </Text>
                </Box>
              ))}
            </Flex>
            <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
              {RANGE_SCOPES.map((s) => (
                <Box key={s.id} as="button" type="button" flex={1} onClick={() => setScope(s.id)} px="0.75rem" py="0.5rem" borderRadius="sm" bg={scope === s.id ? accent : "transparent"}>
                  <Text fontSize="sm" fontWeight="black" color={scope === s.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase" textAlign="center">
                    {s.id === "conference" ? teamEntry.conference : s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Box>

        <Flex direction="column" px={3} py={1}>
          {PHYSICAL_POSITION_LIST.map((pos, idx) => {
            const axis = playerStats[pos];
            const avgRange = teamAvgStats[pos];
            const teamValue = mod?.physical?.by_position_group?.[pos]?.[metric];
            const axisSpan = axis ? (axis.max - axis.min || 1) : 1;
            const barLeftPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.min - axis.min) / axisSpan) * 100)) : null;
            const barRightPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.max - axis.min) / axisSpan) * 100)) : null;
            const teamPct = axis && Number.isFinite(teamValue)
              ? Math.min(100, Math.max(0, ((teamValue - axis.min) / axisSpan) * 100))
              : null;

            return (
              <Flex key={pos} align="center" gap="0.75rem" py="0.75rem" borderTop={idx === 0 ? "none" : "1px solid"} borderColor="whiteAlpha.100">
                <Box w="3.75rem" flexShrink={0}>
                  <Text fontSize="xl" fontWeight="black" color="white" lineHeight={1}>{pos}</Text>
                  {teamValue != null && (
                    <Text fontSize="sm" fontWeight="black" color={accent} mt="0.15rem">{formatValue(teamValue)}</Text>
                  )}
                </Box>

                <Flex direction="column" flex={1} minW={0} gap="0.35rem">
                  <Box position="relative" h="1.5rem" w="100%">
                    <Box position="absolute" top="50%" left={0} right={0} h="0.25rem" transform="translateY(-50%)" bg="whiteAlpha.300" borderRadius="full" />
                    <Box position="absolute" top="50%" left={0} h="1.5rem" w="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translate(-50%, -50%)" />
                    <Box position="absolute" top="50%" right={0} h="1.5rem" w="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translate(50%, -50%)" />
                    {barLeftPct != null && (
                      <Box
                        position="absolute"
                        top="50%"
                        left={`${barLeftPct}%`}
                        width={`${Math.max(barRightPct - barLeftPct, 1.5)}%`}
                        h="100%"
                        transform="translateY(-50%)"
                        bg={`${accent}55`}
                        border="0.0625rem solid"
                        borderColor={`${accent}88`}
                        borderRadius="full"
                      />
                    )}
                    {teamPct != null && (
                      <Box
                        position="absolute"
                        top="50%"
                        left={`${teamPct}%`}
                        transform="translate(-50%, -50%)"
                        boxSize="1.1rem"
                        borderRadius="full"
                        bg="white"
                        border="0.2rem solid"
                        borderColor={accent}
                        boxShadow="0 0 0 0.125rem #0B0B0D, 0 0 0.75rem rgba(0,0,0,0.6)"
                        zIndex={2}
                      />
                    )}
                  </Box>
                  <Flex justify="space-between" gap="0.5rem">
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1}>{axis ? formatValue(axis.min) : "—"}</Text>
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1} textAlign="center">
                      {avgRange ? `avg ${formatValue(avgRange.min)}–${formatValue(avgRange.max)}` : ""}
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1}>{axis ? formatValue(axis.max) : "—"}</Text>
                  </Flex>
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      </Box>
    );
  }

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" display="flex" flexDirection="column">
      <Flex px={{ base: 3, lg: 4 }} pt={{ base: 3, lg: 4 }} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100" align="flex-start" justify="space-between" wrap="wrap" gap={2}>
        <Flex align="center" gap="0.5rem">
          <Box w="0.1875rem" h="1.1rem" bg={accent} borderRadius="full" flexShrink={0} />
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em">
            Physical — {scopeLabel} Range
          </Text>
        </Flex>

        <Flex gap="0.5rem" wrap="wrap">
          <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
            {RANGE_METRICS.map((m) => (
              <Box
                key={m.id}
                as="button"
                type="button"
                onClick={() => setMetric(m.id)}
                px="0.75rem"
                py="0.35rem"
                borderRadius="sm"
                bg={metric === m.id ? accent : "transparent"}
              >
                <Text fontSize="xs" fontWeight="black" color={metric === m.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase">
                  {m.label}
                </Text>
              </Box>
            ))}
          </Flex>
          <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
            {RANGE_SCOPES.map((s) => (
              <Box
                key={s.id}
                as="button"
                type="button"
                onClick={() => setScope(s.id)}
                px="0.75rem"
                py="0.35rem"
                borderRadius="sm"
                bg={scope === s.id ? accent : "transparent"}
              >
                <Text fontSize="xs" fontWeight="black" color={scope === s.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase">
                  {s.id === "conference" ? teamEntry.conference : s.label}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex flex={1} minH={0} px={{ base: 3, lg: 4 }} py={{ base: 3, lg: 4 }} align="stretch" justify="space-between" gap="0.5rem">
        {PHYSICAL_POSITION_LIST.map((pos) => {
          const axis = playerStats[pos];
          const avgRange = teamAvgStats[pos];
          const teamValue = mod?.physical?.by_position_group?.[pos]?.[metric];
          const axisSpan = axis ? (axis.max - axis.min || 1) : 1;

          // Bar bottom/top are the team-average min/max positioned as a
          // percentage *within* the full individual-player axis — the bar
          // is a segment of the axis, not the axis itself.
          const barBottomPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.min - axis.min) / axisSpan) * 100)) : null;
          const barTopPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.max - axis.min) / axisSpan) * 100)) : null;
          const teamPct = axis && Number.isFinite(teamValue)
            ? Math.min(100, Math.max(0, ((teamValue - axis.min) / axisSpan) * 100))
            : null;

          return (
            <Flex key={pos} direction="column" align="center" flex={1} minW={0}>
              {/* Top tick label — tallest/heaviest player recorded at this position */}
              <Text fontSize="xl" fontWeight="black" color="white" lineClamp={1} mb="0.4rem">
                {axis ? formatValue(axis.max) : "—"}
              </Text>

              <Box position="relative" flex={1} minH={0} w="100%" maxW="3.25rem">
                {/* Full axis — shortest/lightest to tallest/heaviest player recorded */}
                <Box position="absolute" left="50%" top={0} bottom={0} w="0.25rem" transform="translateX(-50%)" bg="whiteAlpha.300" borderRadius="full" />
                {/* End-cap ticks marking the true top and bottom of the axis */}
                <Box position="absolute" left="50%" top={0} w="1.5rem" h="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translateX(-50%)" />
                <Box position="absolute" left="50%" bottom={0} w="1.5rem" h="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translateX(-50%)" />
                {/* Bar segment — lowest team average to highest team average */}
                {barBottomPct != null && (
                  <Box
                    position="absolute"
                    left="50%"
                    bottom={`${barBottomPct}%`}
                    height={`${Math.max(barTopPct - barBottomPct, 1.5)}%`}
                    w="100%"
                    transform="translateX(-50%)"
                    bg={`${accent}55`}
                    border="0.0625rem solid"
                    borderColor={`${accent}88`}
                    borderRadius="full"
                  />
                )}
                {teamPct != null && (
                  <Box
                    position="absolute"
                    left="50%"
                    bottom={`${teamPct}%`}
                    transform="translate(-50%, 50%)"
                    boxSize="1.1rem"
                    borderRadius="full"
                    bg="white"
                    border="0.2rem solid"
                    borderColor={accent}
                    boxShadow="0 0 0 0.125rem #0B0B0D, 0 0 0.75rem rgba(0,0,0,0.6)"
                    zIndex={2}
                  />
                )}
              </Box>

              {/* Bottom tick label — shortest/lightest player recorded */}
              <Text fontSize="xl" fontWeight="black" color="white" lineClamp={1} mt="0.4rem">
                {axis ? formatValue(axis.min) : "—"}
              </Text>

              <Text mt="1rem" fontSize="2xl" fontWeight="black" color="white">{pos}</Text>
              <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1} mt="0.15rem">
                {avgRange ? `avg ${formatValue(avgRange.min)}–${formatValue(avgRange.max)}` : ""}
              </Text>
              {teamValue != null && (
                <Text fontSize="lg" fontWeight="black" color={accent} lineClamp={1}>
                  {formatValue(teamValue)}
                </Text>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
