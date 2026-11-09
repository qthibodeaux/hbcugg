import { useState } from "react";
import { VStack, Grid, Flex, Image, Text, Box } from "@chakra-ui/react";
import { getInitials, getDisplayName } from "./productionNames";

const getSectorStyle = (sector, teamColor) => {
  const att = sector.attempts || 0;
  const comp = sector.completions || 0;
  const rate = att > 0 ? comp / att : 0;

  // Start color: flat really light, nearly white-type grey (#F3F4F6)
  const startR = 243;
  const startG = 244;
  const startB = 246;

  // End color: team primary color
  const hex = teamColor || "#E53E3E";
  const cleanHex = hex.replace("#", "");
  const endR = parseInt(cleanHex.substring(0, 2), 16) || 229;
  const endG = parseInt(cleanHex.substring(2, 4), 16) || 62;
  const endB = parseInt(cleanHex.substring(4, 6), 16) || 62;

  // Factor represents the progress (0 for empty or 0%, up to 1 for 100%)
  const factor = att > 0 ? rate : 0;

  const r = Math.round(startR + factor * (endR - startR));
  const g = Math.round(startG + factor * (endG - startG));
  const b = Math.round(startB + factor * (endB - startB));

  const bg = `rgb(${r}, ${g}, ${b})`;
  const borderColor = `rgba(${r}, ${g}, ${b}, 0.85)`;

  // For high contrast: use dark text on light backgrounds (factor < 0.5) and light text on dark backgrounds (factor >= 0.5)
  const isLightBg = factor < 0.5;
  const textColor = isLightBg ? "#141416" : "#FFFFFF";
  const subColor = isLightBg ? "#4A5568" : "rgba(255,255,255,0.85)";
  const hoverBg = `rgba(${r}, ${g}, ${b}, 0.9)`;

  return {
    bg,
    borderColor,
    hoverBg,
    hoverBorder: `rgb(${r}, ${g}, ${b})`,
    textColor,
    subColor
  };
};

const getReadableColor = (hex) => {
  if (!hex) return "#FFFFFF";
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If too dark (luminance < 0.35), blend with 55% white to make it a bright, high-contrast pastel hex
  if (luminance < 0.35) {
    const newR = Math.round(r + (255 - r) * 0.55);
    const newG = Math.round(g + (255 - g) * 0.55);
    const newB = Math.round(b + (255 - b) * 0.55);
    const toHex = (c) => {
      const h = c.toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
  return hex;
};

export const PlayerSpotlight = ({ player, teamColors, metrics = [], signatureBar = [], variant = "rushing", imageUrl }) => {
  const primary = teamColors?.primary || "#141416";
  const secondary = teamColors?.secondary || "#A1A1AA";
  const accent = teamColors?.accent || "#E53E3E";
  const [imgError, setImgError] = useState(false);

  const isPassing = variant === "passing";

  return (
    <VStack gap="6px" align="stretch" w="full" h="full" minH={0}>
      {/* Spotlight Header card */}
      <Grid
        templateColumns="110px 1fr"
        gap="0px"
        border="1px solid"
        borderColor="whiteAlpha.100"
        p="0px"
        borderRadius="sm"
        bg="rgba(255,255,255,0.02)"
        flexShrink={0}
        overflow="hidden"
      >
        {/* Large Initials Avatar / Real Player headshot (FLUSH WITH EDGES) */}
        <Flex
          w="110px"
          h="110px"
          bg={primary}
          align="center"
          justify="center"
          borderRight={`2px solid ${accent}`}
          flexShrink={0}
          position="relative"
        >
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={player.name}
              w="full"
              h="full"
              objectFit="cover"
              objectPosition="top"
              onError={() => setImgError(true)}
            />
          ) : (
            <Text fontSize="34px" fontWeight="950" color="white" letterSpacing="-0.06em">
              {getInitials(player.name)}
            </Text>
          )}
          <Box
            position="absolute"
            bottom="4px"
            right="4px"
            px="4px"
            py="1px"
            bg="black"
            borderRadius="xs"
            border="1px solid"
            borderColor="whiteAlpha.200"
            zIndex={2}
          >
            <Text fontSize="6px" fontWeight="900" color="text.primary">
              {player.position || "ATH"}
            </Text>
          </Box>
        </Flex>

        {/* Stats Grid & Spotlight Name */}
        <VStack align="stretch" justify="space-between" gap="4px" minW={0} py="8px" px="8px">
          <Box minW={0}>
            <Text fontSize="clamp(13px, 1.1vw, 15px)" fontWeight="955" color="text.primary" truncate>
              {getDisplayName(player.name)}
            </Text>
          </Box>

          {/* Custom stats grid: handles 2x3 grid dynamically for passing/receiving */}
          {metrics.length > 0 && (
            <Grid
              templateColumns={`repeat(${metrics.length === 6 ? 3 : metrics.length}, 1fr)`}
              gap="4px"
              py="1px"
              borderY="1px solid"
              borderColor="whiteAlpha.100"
            >
              {metrics.map((m, i) => (
                <Flex
                  key={i}
                  direction="column"
                  align="center"
                  justify="center"
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderRadius="sm"
                  py="4px"
                  px="2px"
                >
                  <Text fontSize="0.425rem" color="text.muted" fontWeight="900" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">
                    {m.label}
                  </Text>
                  <Text fontSize="0.6875rem" fontWeight="950" color={m.color || "text.primary"} mt="0.125rem" lineHeight={1} whiteSpace="nowrap">
                    {m.value}
                  </Text>
                </Flex>
              ))}
            </Grid>
          )}
        </VStack>
      </Grid>

      {/* ── Custom Tab overlays (The highly audited specialized layouts) ── */}
      <Box flex={1} minH={0} w="full">
        {isPassing ? (
          /* A: Dynamic Passing Sector Map (Highly Audacious 3x3 Heatmap with Row/Col Labels on Outside) */
          <Grid templateColumns="42px 1fr" templateRows="1fr 18px" gap="4px" h="full" w="full">
            {/* Left Column: Row Labels */}
            <VStack justify="space-around" align="flex-end" pr="6px" py="8px" h="full" gap={0}>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  DEEP
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  &gt;12
                </Text>
              </Flex>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  MED
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  4-12
                </Text>
              </Flex>
              <Flex direction="column" align="flex-end">
                <Text fontSize="7.5px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1}>
                  SHORT
                </Text>
                <Text fontSize="7px" fontWeight="900" color="text.muted" textTransform="uppercase" mt="1px">
                  &lt;4
                </Text>
              </Flex>
            </VStack>

            {/* Right Column Top: 3x3 Sector Grid */}
            <Grid templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="4px" h="full" w="full">
              {["deep", "medium", "short"].map((d) => {
                return ["left", "middle", "right"].map((dir) => {
                  const sector = player.sectors?.[d]?.[dir] || { completions: 0, attempts: 0, yards: 0 };
                  const style = getSectorStyle(sector, teamColors?.primary);

                  return (
                    <Flex
                      key={`${d}-${dir}`}
                      direction="column"
                      align="center"
                      justify="center"
                      bg={style.bg}
                      border="1px solid"
                      borderColor={style.borderColor}
                      borderRadius="sm"
                      p="2px"
                      _hover={{ bg: style.hoverBg, borderColor: style.hoverBorder }}
                      transition="all 0.15s"
                    >
                      <Text fontSize="13px" color={style.textColor} fontWeight="950" lineHeight={1}>
                        {sector.completions}/{sector.attempts}
                      </Text>
                      <Text fontSize="7.5px" color={style.subColor} fontWeight="800" textTransform="uppercase" mt="1.5px">
                        {sector.yards}y
                      </Text>
                    </Flex>
                  );
                });
              })}
            </Grid>

            {/* Bottom Left Spacer */}
            <Box />

            {/* Bottom Right Column Labels */}
            <Grid templateColumns="repeat(3, 1fr)" gap="4px" w="full" h="full" alignItems="center">
              {["LEFT", "MIDDLE", "RIGHT"].map((colLabel) => (
                <Text
                  key={colLabel}
                  fontSize="8px"
                  fontWeight="950"
                  color="text.muted"
                  textAlign="center"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  {colLabel}
                </Text>
              ))}
            </Grid>
          </Grid>
        ) : variant === "defense" ? (
          /* C: Dynamic Defensive Stoppage Cards (3x1 vertical decks) */
          <Grid templateColumns="repeat(3, 1fr)" gap="6px" h="full" w="full">
            {[
              {
                key: "run",
                label: "← RUN DEFENSE",
                value: player.tfl || 0,
                subLabel: "TACKLES FOR LOSS",
                metric1: "TACKLES",
                val1: player.tackles || 0,
                metric2: "FF / FR",
                val2: `${player.forced_fumbles || 0} / ${player.fumbles_recovered || 0}`,
                color: "#4A90D9"
              },
              {
                key: "rush",
                label: "↑ PASS RUSH",
                value: player.sacks || 0,
                subLabel: "SACKS FORCED",
                metric1: "SACKS",
                val1: player.sacks || 0,
                metric2: "HAVOC",
                val2: player.havoc || 0,
                color: "#48BB78"
              },
              {
                key: "cover",
                label: "COVER WINS →",
                value: (player.passes_defended || 0) + (player.interceptions || 0),
                subLabel: "DEFLECTIONS & INTS",
                metric1: "PBUs",
                val1: player.passes_defended || 0,
                metric2: "INTs",
                val2: player.interceptions || 0,
                color: "#ECC94B"
              }
            ].map((card) => {
              return (
                <Flex
                  key={card.key}
                  direction="column"
                  justify="space-between"
                  p="8px"
                  bg="rgba(255,255,255,0.02)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderTop={`3px solid ${card.color}`}
                  borderRadius="sm"
                  _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
                >
                  <Flex align="center" gap={1}>
                    <Box w="3px" h="3px" bg={card.color} borderRadius="full" />
                    <Text fontSize="7px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" truncate>
                      {card.label}
                    </Text>
                  </Flex>
                  <VStack align="stretch" gap={0} my="auto" py={1}>
                    <Text fontSize="clamp(18px, 1.4vw, 24px)" color="text.primary" fontWeight="950" lineHeight={1.0} letterSpacing="-0.04em">
                      {card.value}
                    </Text>
                    <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">
                      {card.subLabel}
                    </Text>
                  </VStack>
                  <VStack align="stretch" gap="3px" borderTop="1px solid" borderColor="whiteAlpha.100" pt="4px">
                    <Flex align="center" justify="space-between">
                      <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">{card.metric1}</Text>
                      <Text fontSize="7px" fontWeight="950" color="text.primary">
                        {card.val1}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="6px" color="text.muted" fontWeight="800" textTransform="uppercase">{card.metric2}</Text>
                      <Text fontSize="6.5px" color="text.secondary" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">
                        {card.val2}
                      </Text>
                    </Flex>
                  </VStack>
                </Flex>
              );
            })}
          </Grid>
        ) : (
          /* B: Dynamic Rushing Lane Cards (3x1 vertical decks with horizontal bars + stats on right) */
          <Grid templateColumns="repeat(3, 1fr)" gap="6px" h="full" w="full">
            {["left", "middle", "right"].map((k) => {
              const lane = player.lanes?.[k] || {
                attempts: 0, yards: 0, success: 0,
                powerRuns: 0, powerSuccess: 0,
                stuffed: 0, stopped: 0,
                lineYards: 0, opportunity: 0
              };
              const laneSR = lane.attempts > 0 ? lane.success / lane.attempts : 0;
              const leftYds = Math.max(0, player.lanes?.left?.yards || 0);
              const middleYds = Math.max(0, player.lanes?.middle?.yards || 0);
              const rightYds = Math.max(0, player.lanes?.right?.yards || 0);
              const totalLaneYds = leftYds + middleYds + rightYds;

              const laneYds = Math.max(0, lane.yards || 0);
              const barHeightPct = totalLaneYds > 0 ? (laneYds / totalLaneYds) * 100 : 0;

              const ly = lane.lineYards || 0;
              const hly = Math.max(0, lane.yards - ly);

              const lyPct = lane.yards > 0 ? (ly / lane.yards) * 100 : 0;
              const hlyPct = lane.yards > 0 ? (hly / lane.yards) * 100 : 0;

              const barPrimary = (primary === "#000000" || primary === "#000") ? "#4A90D9" : primary;
              const barSecondary = (secondary === "#000000" || secondary === "#000") ? "#FDB913" : secondary;

              const textPrimary = getReadableColor(barPrimary);
              const textSecondary = getReadableColor(barSecondary);

              const label = k === "left" ? "← LEFT LANE" : k === "middle" ? "↑ MIDDLE" : "RIGHT →";
              const themeColor = k === "left" ? "#4A90D9" : k === "middle" ? "#48BB78" : "#F6AD55";

              return (
                <Flex
                  key={k}
                  direction="column"
                  justify="space-between"
                  pt="0.375rem"
                  pr="0.25rem"
                  pb="0rem"
                  pl="0.125rem"
                  bg="rgba(255,255,255,0.02)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderTop={`3px solid ${themeColor}`}
                  borderRadius="sm"
                  _hover={{ bg: "rgba(255,255,255,0.04)", borderTopWidth: "4px" }}
                  transition="all 0.15s"
                >
                  <Flex align="center" gap={1} mb="2px" pl="0.125rem">
                    <Box w="0.1875rem" h="0.1875rem" bg={themeColor} borderRadius="full" />
                    <Text fontSize="0.46875rem" color="text.muted" fontWeight="955" textTransform="uppercase" letterSpacing="0.04em" truncate>
                      {label}
                    </Text>
                  </Flex>

                  {/* Two Column Layout: Proportional Bar Left (w="2.0rem"), Raw Stats Right */}
                  <Grid templateColumns="2.0rem 1fr" gap="0.25rem" alignItems="stretch" flex={1} minH={0} mt="2px">
                    {/* Column 1: Fat Bar anchored to the bottom and flush-left */}
                    <Flex
                      direction="column"
                      w="2.0rem"
                      h="full"
                      bg="rgba(255,255,255,0.03)"
                      overflow="hidden"
                      flexShrink={0}
                      borderRight="1px solid"
                      borderColor="whiteAlpha.150"
                      justifyContent="flex-end"
                    >
                      {totalLaneYds === 0 ? (
                        <Box h="full" w="full" bg="whiteAlpha.150" />
                      ) : (
                        barHeightPct > 0 && (
                          <Flex direction="column" h={`${Math.max(6, barHeightPct)}%`} w="full" justify="flex-end">
                            {/* Top Tier: Highlight Yards (Secondary Color) */}
                            {hlyPct > 0 && <Box h={`${hlyPct}%`} w="full" bg={barSecondary} borderBottom="1px solid rgba(255,255,255,0.12)" />}
                            {/* Bottom Tier: Line Yards (Primary Color) */}
                            {lyPct > 0 && <Box h={`${lyPct}%`} w="full" bg={barPrimary} />}
                          </Flex>
                        )
                      )}
                    </Flex>
                    {/* Column 2: 3 Stacks of Number (Top) + Label (Bottom) vertically */}
                    <VStack align="flex-start" justify="space-between" py="3px" pb="6px" flex={1} minW={0} h="full" gap={0}>
                      {/* Block 1: Success Rate */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color="#48BB78" lineHeight={1}>
                          {lane.attempts > 0 ? `${Math.round(laneSR * 100)}%` : "—"}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color="#48BB78" mt="1px" lineHeight={1}>
                          SR
                        </Text>
                      </VStack>

                      {/* Block 2: Highlight Yards (Secondary Color) */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color={textSecondary} lineHeight={1}>
                          {hly}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color={textSecondary} mt="1px" lineHeight={1}>
                          HL Yds
                        </Text>
                      </VStack>

                      {/* Block 3: OL Yards (Primary Color) */}
                      <VStack align="flex-start" gap={0} lineHeight={1}>
                        <Text fontSize="0.75rem" fontWeight="955" color={textPrimary} lineHeight={1}>
                          {ly}
                        </Text>
                        <Text fontSize="0.4375rem" fontWeight="800" color={textPrimary} mt="1px" lineHeight={1}>
                          OL Yds
                        </Text>
                      </VStack>
                    </VStack>
                  </Grid>
                </Flex>
              );
            })}
          </Grid>
        )}
      </Box>
    </VStack>
  );
};
