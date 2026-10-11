import { useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Section, Kicker } from "./TeamAnalyticsTabs";
import { useCountingTeamStats } from "../../../hooks/useSWACData";
import { glossaryFor, ordinal } from "../../../pages/analytics/metricGlossary";
import { contrastRatio, readableTeamColor } from "../../../utils/teamColor";
import {
  PASS_DEPTHS,
  PASS_DIRECTIONS,
  HAVOC_TYPES,
  HAVOC_ZONES,
  fmtProfile,
} from "../../../pages/analytics/teamProfileMetrics";

const POSITIVE = "#48BB78";
const NEGATIVE = "#F6AD55";
const OFF_TONE = "#ECC94B";
const DEF_TONE = "#4299E1";

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : DASH);
const n1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : DASH);
const n2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : DASH);
const signed2 = (v) => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(2)}` : DASH);
const clock = (secs) => {
  if (!Number.isFinite(secs)) return DASH;
  const m = Math.floor(secs / 60);
  return `${m}:${String(Math.round(secs - m * 60)).padStart(2, "0")}`;
};
const ratio = (made, att) => (Number.isFinite(made) && Number.isFinite(att) ? `${made} / ${att}` : DASH);

const rankTone = (rank, total) => {
  if (!Number.isFinite(rank) || !total) return "whiteAlpha.400";
  if (rank <= total / 3) return POSITIVE;
  if (rank > (total * 2) / 3) return NEGATIVE;
  return "whiteAlpha.500";
};

const Tip = ({ text, children }) => {
  if (!text) return children;
  return (
    <Box position="relative" display="inline-block" maxW="100%" _hover={{ "& > .tip": { opacity: 1, visibility: "visible" } }}>
      {children}
      <Box
        className="tip" position="absolute" bottom="calc(100% + 6px)" left={0} zIndex={30}
        w="15rem" maxW="70vw" p={2.5} borderRadius="md" bg="#09090B" border="1px solid" borderColor="whiteAlpha.200"
        boxShadow="0 12px 32px rgba(0,0,0,0.55)" opacity={0} visibility="hidden" pointerEvents="none"
        transition="opacity 0.12s ease"
      >
        <Text fontSize="10px" color="whiteAlpha.800" lineHeight={1.55}>{text}</Text>
      </Box>
    </Box>
  );
};

const Cell = ({ cell, total, tips, big }) => {
  const def = glossaryFor(cell.label);
  const tone = rankTone(cell.rank, total);
  return (
    <Box minW={0}>
      <Flex align="baseline" justify="space-between" gap={1} minW={0}>
        <Tip text={tips ? def?.text : null}>
          <Kicker
            color="whiteAlpha.400"
            borderBottom={tips && def ? "1px dotted" : undefined}
            borderColor="whiteAlpha.300"
          >
            {cell.label}
          </Kicker>
        </Tip>
        {Number.isFinite(cell.rank) && (
          <Text fontSize="8px" fontWeight="900" color={tone} flexShrink={0} fontVariantNumeric="tabular-nums">
            {ordinal(cell.rank)}
          </Text>
        )}
      </Flex>
      {big ? (
        <Text
          fontSize="clamp(0.95rem, 1.7vw, 1.45rem)" fontWeight="900" fontStyle="italic" color="white"
          lineHeight={0.95} letterSpacing="-0.03em" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}
        >
          {cell.value}
        </Text>
      ) : (
        <Text fontSize="13px" fontWeight="900" color="white" mt={1} fontVariantNumeric="tabular-nums" lineClamp={1}>
          {cell.value}
        </Text>
      )}
      {cell.note && <Text fontSize="8px" fontWeight="700" color="whiteAlpha.400" mt={0.5} lineClamp={2}>{cell.note}</Text>}
    </Box>
  );
};

const HeadCard = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0} bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} borderTop="2px solid" borderTopColor={tone}>
    <Kicker color={tone}>{label}</Kicker>
    <Grid templateColumns={{ base: "repeat(2, minmax(0,1fr))", md: "repeat(5, minmax(0,1fr))" }} gap={3} mt={2.5}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} big />)}
    </Grid>
  </Box>
);

const LeaderPortrait = ({ leader }) => (
  <Box
    key={leader.id} position="relative" w={{ base: "3.5rem", lg: "4rem" }} h={{ base: "3.5rem", lg: "4rem" }} borderRadius="md" overflow="hidden"
    border="1px solid" borderColor="whiteAlpha.300" bg="rgba(255,255,255,0.05)" flexShrink={0}
    title={leader.title || leader.name}
  >
    {leader.photo ? (
      <Image src={leader.photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
    ) : (
      <Flex align="center" justify="center" h="100%">
        <Text fontSize={{ base: "0.7rem", lg: "0.8rem" }} fontWeight="900" color="whiteAlpha.600">{leader.initials}</Text>
      </Flex>
    )}
    <Box position="absolute" left={0} right={0} bottom={0} px={1.5} py={1} bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.86) 100%)">
      <Text fontSize={{ base: "0.55rem", lg: "0.6rem" }} fontWeight="900" color="white" lineHeight={1} lineClamp={1} textTransform="uppercase" letterSpacing="0.04em">
        {leader.surname}
      </Text>
    </Box>
  </Box>
);

const PassingMapMetric = ({ value, label, accent = "white", big = false }) => (
  <Box minW={0}>
    <Text
      fontSize={big ? "clamp(1rem, 1.95vw, 1.5rem)" : "clamp(0.8rem, 1.28vw, 0.96rem)"}
      fontWeight="900" fontStyle="italic" color={accent} lineHeight={0.92}
      letterSpacing={big ? "-0.04em" : "-0.03em"} fontVariantNumeric="tabular-nums" lineClamp={1}
    >
      {value}
    </Text>
    <Kicker color="whiteAlpha.400" mt={big ? 0.15 : 0.05} fontSize="0.36rem">{label}</Kicker>
  </Box>
);

const PassingMapMiniMetric = ({ value, label, accent = "white" }) => (
  <Box minW={0}>
    <Text
      fontSize="clamp(0.8rem, 1.28vw, 0.96rem)" fontWeight="900" fontStyle="italic" color={accent}
      lineHeight={0.95} letterSpacing="-0.03em" fontVariantNumeric="tabular-nums" lineClamp={1}
    >
      {value}
    </Text>
    <Kicker color="whiteAlpha.400" mt={0.05} fontSize="0.36rem">{label}</Kicker>
  </Box>
);

const RushingMapMetric = ({ value, label, accent = "white", big = false }) => (
  <Box minW={0}>
    <Text
      fontSize={big ? "clamp(1rem, 1.95vw, 1.5rem)" : "clamp(0.8rem, 1.28vw, 0.96rem)"}
      fontWeight="900" fontStyle="italic" color={accent} lineHeight={0.92}
      letterSpacing={big ? "-0.04em" : "-0.03em"} fontVariantNumeric="tabular-nums" lineClamp={1}
    >
      {value}
    </Text>
    <Kicker color="whiteAlpha.400" mt={big ? 0.15 : 0.05} fontSize="0.36rem">{label}</Kicker>
  </Box>
);

const RUSH_BREAKDOWN_COLORS = {
  lost: "#D05A4B",
  lostAlt: "#63B3ED",
  fallbackLine: "#E8E8EC",
  fallbackHighlight: "#F4D44D",
};

const hexToRgb = (color) => {
  if (typeof color !== "string") return null;
  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const isRedLike = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  return rgb.r >= 150 && rgb.r > rgb.g * 1.22 && rgb.r > rgb.b * 1.22;
};

const isNeutralLike = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  const hi = Math.max(rgb.r, rgb.g, rgb.b);
  const lo = Math.min(rgb.r, rgb.g, rgb.b);
  return hi - lo < 20;
};

const normalizeHex = (color) => (typeof color === "string" ? color.trim().toLowerCase() : "");

const pickTeamBarColor = ({ preferred, alternate, fallback, blocked = [] }) => {
  const blockedSet = new Set(blocked.map(normalizeHex));
  const candidates = [preferred, alternate, fallback, "#FFFFFF", RUSH_BREAKDOWN_COLORS.fallbackHighlight];
  for (const color of candidates) {
    if (!color) continue;
    const norm = normalizeHex(color);
    if (blockedSet.has(norm)) continue;
    if (isRedLike(color)) continue;
    if ((contrastRatio(color, "#141416") ?? 0) < 2) continue;
    return color;
  }
  return fallback;
};

const rushBreakdownPalette = (teamColors) => {
  const primary = teamColors?.primary ?? null;
  const secondary = teamColors?.secondary ?? null;
  const contextualPrimary = isNeutralLike(primary)
    ? "#FFFFFF"
    : primary;
  const contextualSecondary = isNeutralLike(secondary)
    ? readableTeamColor({ primary: primary, secondary }, undefined, RUSH_BREAKDOWN_COLORS.fallbackHighlight)
    : secondary;
  const line = contextualPrimary || "#FFFFFF";
  const lost = isRedLike(primary) ? RUSH_BREAKDOWN_COLORS.lostAlt : RUSH_BREAKDOWN_COLORS.lost;
  const highlight = pickTeamBarColor({
    preferred: contextualSecondary,
    alternate: contextualPrimary,
    fallback: RUSH_BREAKDOWN_COLORS.fallbackHighlight,
    blocked: [lost, line],
  });
  return {
    lost,
    line: line || "#FFFFFF",
    highlight: highlight || RUSH_BREAKDOWN_COLORS.fallbackHighlight,
  };
};

const RushingLaneBreakdown = ({ lane, maxLost, maxPositive, teamColors }) => {
  const colors = rushBreakdownPalette(teamColors);
  const totalSpan = Math.max(1, maxLost + maxPositive);
  const zeroPct = (maxLost / totalSpan) * 100;
  const lostPct = ((lane.lostYards ?? 0) / totalSpan) * 100;
  const linePct = ((lane.lineYards ?? 0) / totalSpan) * 100;
  const highlightPct = ((lane.highlightYards ?? 0) / totalSpan) * 100;

  return (
    <Box minW={0} mt={0.45}>
      <Flex justify="space-between" align="center" gap={2} mb={0.45}>
        <Kicker color="whiteAlpha.650" fontSize="0.54rem">Yard Makeup</Kicker>
      </Flex>

      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.8} mb={0.45}>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.lost} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>-{n0(lane.lostYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Lost</Kicker>
        </Box>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.line} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>{n0(lane.lineYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Line-Created</Kicker>
        </Box>
        <Box minW={0}>
          <Text fontSize="1.02rem" fontWeight="900" fontStyle="italic" color={colors.highlight} lineHeight={0.95} fontVariantNumeric="tabular-nums" lineClamp={1}>{n0(lane.highlightYards)}</Text>
          <Kicker color="whiteAlpha.500" mt={0.08} fontSize="0.42rem">Highlight</Kicker>
        </Box>
      </Grid>

      <Box position="relative" h="1.6rem" borderTop="1px solid" borderColor="whiteAlpha.100" pt={0.42}>
        <Box position="absolute" left={0} right={0} top="1rem" h="0.5rem" bg="whiteAlpha.50" borderRadius="full" />
        <Box position="absolute" left={`${Math.max(0, zeroPct - lostPct)}%`} top="1rem" w={`${lostPct}%`} h="0.5rem" bg={colors.lost} borderTopLeftRadius="full" borderBottomLeftRadius="full" />
        <Box position="absolute" left={`${zeroPct}%`} top="1rem" w={`${linePct}%`} h="0.5rem" bg={colors.line} />
        <Box position="absolute" left={`${Math.min(100, zeroPct + linePct)}%`} top="1rem" w={`${highlightPct}%`} h="0.5rem" bg={colors.highlight} borderTopRightRadius="full" borderBottomRightRadius="full" />
        <Box position="absolute" left={`${zeroPct}%`} top="0.52rem" bottom="0.02rem" w="1px" bg="whiteAlpha.600" />
        <Kicker position="absolute" left={`${zeroPct}%`} top="0" transform="translateX(-50%)" color="whiteAlpha.500" fontSize="0.42rem">LOS</Kicker>
      </Box>

      <Flex justify="space-between" align="center" mt={0.28}>
        <Kicker color="whiteAlpha.500" fontSize="0.5rem">{lane.label.toUpperCase()} · {lane.att} CAR</Kicker>
        <Kicker color="whiteAlpha.400" fontSize="0.42rem">LOS</Kicker>
      </Flex>
    </Box>
  );
};

const PassingHeadCard = ({ label, tone, cells, total, tips, leaders }) => (
  <Box flex="1" minW={0} bg="rgba(255,255,255,0.04)" borderRadius="md" p={3} borderTop="2px solid" borderTopColor={tone}>
    <Flex direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "flex-start" }} justify="space-between" gap={4}>
      <Box flex="1" minW={0}>
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={3} mt={3}>
          <Flex align="flex-start" minH="100%">
            <Kicker color={tone}>{label}</Kicker>
          </Flex>
          {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} big />)}
        </Grid>
      </Box>
      <Flex gap={2} flexShrink={0} justify={{ base: "flex-start", lg: "flex-end" }} align="flex-start">
        {(leaders ?? []).slice(0, 3).map((leader) => <LeaderPortrait key={leader.id} leader={leader} />)}
      </Flex>
    </Flex>
  </Box>
);

const FullGrid = ({ label, tone, cells, total, tips }) => (
  <Box flex="1" minW={0}>
    <Flex align="center" gap={2} mb={2}>
      <Box w="8px" h="8px" borderRadius="sm" bg={tone} flexShrink={0} />
      <Kicker color="whiteAlpha.700">{label}</Kicker>
      <Box flex="1" h="1px" bg="whiteAlpha.100" />
    </Flex>
    <Grid templateColumns="repeat(auto-fit, minmax(6.4rem, 1fr))" gap={3} gapY={4}>
      {cells.map((c) => <Cell key={c.label} cell={c} total={total} tips={tips} />)}
    </Grid>
  </Box>
);

const epaFill = (epa) => {
  if (!Number.isFinite(epa)) return "rgba(0,0,0,0.35)";
  const strength = Math.min(1, Math.abs(epa) / 0.45);
  const alpha = (0.12 + strength * 0.62).toFixed(2);
  return epa >= 0 ? `rgba(72,187,120,${alpha})` : `rgba(246,173,85,${alpha})`;
};

const SideToggle = ({ value, onChange, options }) => (
  <Flex gap={2}>
    {options.map(([id, label]) => (
      <Box
        key={id} as="button" onClick={() => onChange(id)} px={3} py={1.5} borderRadius="md"
        fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
        bg={value === id ? "brand.500" : "whiteAlpha.100"} color={value === id ? "white" : "whiteAlpha.600"}
        _hover={{ bg: value === id ? "brand.500" : "whiteAlpha.200" }}
      >
        {label}
      </Box>
    ))}
  </Flex>
);

const MapHead = ({ title, side, onSide, options = [["offense", "Offense"], ["defense", "Allowed"]] }) => (
  <Flex align="center" justify="space-between" gap={3} mt={5} mb={2} wrap="wrap">
    <Kicker color="whiteAlpha.700">{title}</Kicker>
    <SideToggle value={side} onChange={onSide} options={options} />
  </Flex>
);

const TargetFace = ({ player }) => (
  <Flex direction="column" minW={0} align="stretch" justify="flex-start" gap={0.5} title={`${player.name} · ${player.position ?? ""} · ${player.targets} targets`}>
    <Box
      position="relative" w="100%" minW={0} flexShrink={0} borderRadius="sm" overflow="hidden" aspectRatio="1 / 1"
      bg="rgba(0,0,0,0.4)" border="1px solid" borderColor="whiteAlpha.300"
    >
      {player.photo ? (
        <Image src={player.photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize={{ base: "0.7rem", lg: "0.8rem" }} fontWeight="900" color="whiteAlpha.600">{player.initials}</Text>
        </Flex>
      )}
      <Flex position="absolute" left={0} right={0} bottom={0} justify="center" py={0.6} bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)">
        <Text fontSize="0.72rem" fontWeight="900" color="white" lineHeight={0.95} textAlign="center" fontVariantNumeric="tabular-nums">
          {player.badge ?? player.targets}
        </Text>
      </Flex>
    </Box>
    <Text fontSize="0.42rem" fontWeight="900" color="white" lineHeight={1} lineClamp={1} textAlign="center" textTransform="uppercase" letterSpacing="0.02em" title={player.name}>
      {player.surname}
    </Text>
  </Flex>
);

const PassFieldMap = ({ grid, targets, side }) => (
  <Box>
    <Flex gap={2} align="stretch">
      <Flex direction="column" justify="space-around" py="2px" flexShrink={0}>
        {PASS_DEPTHS.map((d) => (
          <Box key={d.key} textAlign="right">
            <Text fontSize="9px" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" lineHeight={1}>{d.label}</Text>
            <Text fontSize="8px" color="whiteAlpha.400" lineHeight={1.3}>{d.range}</Text>
          </Box>
        ))}
      </Flex>
      <Box position="relative" flex="1" minW={0}>
        <Box position="absolute" inset={0} borderRadius="md" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200" />
        <Grid position="relative" templateColumns="repeat(3, minmax(0,1fr))" templateRows="repeat(3, minmax(0,1fr))" gap="3px" p="3px">
          {PASS_DEPTHS.map((d) =>
            PASS_DIRECTIONS.map((dir) => {
              const cell = grid[d.key][dir.key];
              const faces = targets?.[d.key]?.[dir.key] ?? [];
              return (
                <Flex
                  key={`${d.key}-${dir.key}`} align="stretch" gap={1.2} px={1.5} py={1.5} borderRadius="sm"
                  bg={epaFill(cell.epa)} border="1px solid" borderColor="whiteAlpha.100"
                  minH={{ base: "5.1rem", md: "5.7rem" }}
                >
                  <Grid flex="1.34" minW={0} templateColumns="minmax(0,1.12fr) minmax(0,0.88fr) minmax(0,0.12fr)" gap={1} alignItems="stretch">
                    <Flex direction="column" justify="space-between" minW={0}>
                      <PassingMapMetric value={`${cell.comp}/${cell.att}`} label="Comp / Att" big />
                      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.75} mt={0.5}>
                        <PassingMapMiniMetric value={`${cell.yards}`} label="Yds" />
                        <PassingMapMiniMetric value={n0(cell.td)} label="TDs" />
                        <PassingMapMiniMetric value={n0(cell.int)} label="INTs" />
                      </Grid>
                    </Flex>
                    <Flex direction="column" justify="space-between" minW={0}>
                      <PassingMapMetric value={signed2(cell.epa)} label="EPA / Play" accent={cell.epa >= 0 ? POSITIVE : NEGATIVE} />
                      <PassingMapMetric value={signed2(Number.isFinite(cell.epa) && Number.isFinite(cell.att) ? cell.epa * cell.att : undefined)} label="EPA Total" accent={cell.epa >= 0 ? POSITIVE : NEGATIVE} />
                      <PassingMapMetric value={pct(cell.success)} label="Success Rate" accent={cell.success >= 0.5 ? POSITIVE : "white"} />
                    </Flex>
                    <Flex align="center" justify="center" minW={0}>
                      <Text
                        fontSize="0.42rem" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      >
                        {side === "offense" ? "Targets" : "Coverage"}
                      </Text>
                    </Flex>
                  </Grid>

                  {faces.length > 0 && (
                    <>
                      <Box alignSelf="stretch" w="1px" bg="whiteAlpha.200" flexShrink={0} />
                      <Flex flex="0.96" minW={0}>
                        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="0.22rem" flex="1" alignItems="start" minH={{ base: "4.1rem", md: "4.8rem" }}>
                          {faces.map((p) => <TargetFace key={p.id} player={p} />)}
                        </Grid>
                      </Flex>
                    </>
                  )}
                </Flex>
              );
            }),
          )}
        </Grid>
      </Box>
    </Flex>
    <Flex justify="center" gap={10} mt={2}>
      {PASS_DIRECTIONS.map((d) => <Kicker key={d.key} color="whiteAlpha.400">{d.label}</Kicker>)}
    </Flex>
  </Box>
);

const RushLaneMap = ({ lanes, leaders, side, teamColors }) => {
  const maxLost = Math.max(...lanes.map((l) => l.lostYards ?? 0), 1);
  const maxPositive = Math.max(...lanes.map((l) => (l.lineYards ?? 0) + (l.highlightYards ?? 0)), 1);
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={2}>
      {lanes.map((lane) => (
        <Box
          key={lane.key} align="stretch" gap={1.2} px={1.5} py={1.5} borderRadius="sm"
          bg="rgba(255,255,255,0.04)" border="1px solid" borderColor="whiteAlpha.100"
          position="relative" overflow="hidden" minH={{ base: "6.35rem", md: "6.85rem" }}
        >
            <Flex align="stretch" gap={1.2}>
              <Grid flex="1.34" minW={0} templateColumns="minmax(0,1.12fr) minmax(0,0.88fr) minmax(0,0.12fr)" gap={1} alignItems="stretch">
                <Flex direction="column" justify="space-between" minW={0}>
                  <RushingMapMetric value={lane.ypc.toFixed(2)} label="YPC" big />
                  <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={0.75} mt={0.5}>
                    <RushingMapMetric value={`${lane.att}`} label="Lane Car" />
                    <RushingMapMetric value={`${lane.yards}`} label="Lane Yds" />
                    <RushingMapMetric value={pct(lane.stuff)} label="Stuff %" />
                  </Grid>
                </Flex>
                <Flex direction="column" justify="space-between" minW={0}>
                  <RushingMapMetric value={signed2(lane.epa)} label="EPA / Rush" accent={lane.epa >= 0 ? POSITIVE : NEGATIVE} />
                  <RushingMapMetric value={signed2(Number.isFinite(lane.epa) && Number.isFinite(lane.att) ? lane.epa * lane.att : undefined)} label="EPA Total" accent={lane.epa >= 0 ? POSITIVE : NEGATIVE} />
                  <RushingMapMetric value={pct(lane.success)} label="Success Rate" accent={lane.success >= 0.5 ? POSITIVE : "white"} />
                </Flex>
                <Flex align="center" justify="center" minW={0}>
                  <Text
                    fontSize="0.5rem" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.12em"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {side === "offense" ? "Rushers" : "Run Fit"}
                  </Text>
                </Flex>
              </Grid>

              {(leaders?.[lane.key] ?? []).length > 0 && (
                <>
                  <Box alignSelf="stretch" w="1px" bg="whiteAlpha.200" flexShrink={0} />
                  <Flex flex="0.82" minW={0}>
                    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="0.22rem" flex="1" alignItems="start" minH={{ base: "4.1rem", md: "4.8rem" }}>
                      {(leaders?.[lane.key] ?? []).map((p) => <TargetFace key={`${lane.key}-${p.id}`} player={p} />)}
                    </Grid>
                  </Flex>
                </>
              )}
            </Flex>

          <Box mt={0.75}>
            <RushingLaneBreakdown lane={lane} maxLost={maxLost} maxPositive={maxPositive} teamColors={teamColors} />
          </Box>
        </Box>
      ))}
    </Grid>
  );
};

const HavocMap = ({ zones }) => {
  const events = [];
  HAVOC_ZONES.forEach((zone, zi) => {
    const inZone = [];
    HAVOC_TYPES.forEach((t) => {
      for (let i = 0; i < zones[zone][t.key]; i += 1) inZone.push(t);
    });
    inZone.forEach((t, i) => {
      const x = (zi * 100) / 3 + ((i + 0.5) / inZone.length) * (100 / 3);
      const wobble = ((i * 37) % 11) / 11 - 0.5;
      events.push({ key: `${zone}-${t.key}-${i}`, x, depth: t.depth + wobble * t.spread, color: t.color });
    });
  });
  const depths = events.map((e) => e.depth);
  const lo = Math.min(-12, ...depths);
  const hi = Math.max(18, ...depths);
  const yFor = (d) => ((hi - d) / (hi - lo)) * 100;
  const totals = HAVOC_TYPES.map((t) => ({ ...t, count: HAVOC_ZONES.reduce((sum, z) => sum + zones[z][t.key], 0) }));

  return (
    <Box>
      <Box position="relative" h={{ base: "220px", md: "280px" }} borderRadius="md" overflow="hidden" bg="linear-gradient(180deg, #14301a 0%, #0b1c0f 100%)" border="1px solid" borderColor="whiteAlpha.200">
        <Box position="absolute" left={0} right={0} top={`${yFor(0)}%`} h="2px" bg="rgba(255,255,255,0.45)" />
        <Text position="absolute" left="6px" top={`calc(${yFor(0)}% + 4px)`} fontSize="8px" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
          Line of scrimmage
        </Text>
        <Box position="absolute" top={0} bottom={0} left="33.33%" w="1px" bg="whiteAlpha.100" />
        <Box position="absolute" top={0} bottom={0} left="66.66%" w="1px" bg="whiteAlpha.100" />
        {events.map((e) => (
          <Box key={e.key} position="absolute" left={`${e.x}%`} top={`${yFor(e.depth)}%`} transform="translate(-50%, -50%)" w="7px" h="7px" borderRadius="full" bg={e.color} opacity={0.85} />
        ))}
        <Flex position="absolute" left={0} right={0} bottom={0} justify="space-around" py={1.5} bg="blackAlpha.500">
          {HAVOC_ZONES.map((z) => <Kicker key={z} color="whiteAlpha.500">{z}</Kicker>)}
        </Flex>
      </Box>
      <Flex gap={4} wrap="wrap" mt={3}>
        {totals.map((t) => (
          <Flex key={t.key} align="center" gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={t.color} />
            <Kicker color="whiteAlpha.600">{t.label}</Kicker>
            <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{t.count}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

const SIDES_STD = [
  { label: "Offense", root: "offense", base: "", prefix: "o" },
  { label: "Defense allowed", root: "defense", base: "", prefix: "d", flip: true },
];
const SIDES_DEFENSE = [
  { label: "Team defense", root: "offense", base: "defense.", prefix: "d" },
  { label: "Opponent defense", root: "defense", base: "defense.", prefix: "o", flip: true },
];
const SIDES_TEAM = [
  { label: "Team", root: "offense", base: "", prefix: "o" },
  { label: "Opponent", root: "defense", base: "", prefix: "d", flip: true },
];

const f = (label, src, key, fmt, opts = {}) => ({ label, src, key, fmt, ...opts });

const rz = (b) => b?.conversions?.red_zone ?? {};

const PHASES = [
  {
    id: "passing", title: "Passing", sides: SIDES_STD, map: "pass",
    head: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("EPA / Att", "tape", "epa_pass", "signed2"),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "passing.att", "n0", { high: true }),
      f("Completions", "count", "passing.cmp", "n0", { high: true }),
      f("Completion %", "count", "passing.pct", "pct", {
        high: true,
        note: (b) => (Number.isFinite(b?.passing?.att) ? `${b.passing.cmp} of ${b.passing.att}` : null),
      }),
      f("Yards", "count", "passing.yds", "n0", { high: true }),
      f("Yards / Att", "count", "passing.avg_a", "n1", { high: true }),
      f("Yards / Game", "count", "passing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "passing.td", "n0", { high: true }),
      f("Interceptions", "count", "passing.int", "n0", { high: false }),
      f("Long", "count", "passing.long", "n0", { high: true }),
      f("Completion Rate", "hub", "passing.completionRate", "pct"),
      f("Yards / Attempt", "hub", "passing.ypa", "n2"),
      f("Explosive Rate", "hub", "passing.explosiveRate", "pct"),
      f("Pressure Rate", "hub", "passing.pressureRate", "pct"),
      f("EPA / Attempt", "tape", "epa_pass", "signed2"),
      f("Success Rate", "tape", "success_pass", "pct"),
      f("Explosiveness", "adv", "explosiveness", "n2"),
    ],
  },
  {
    id: "rushing", title: "Rushing", sides: SIDES_STD, map: "rush",
    head: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
    ],
    full: [
      f("Attempts", "count", "rushing.att", "n0", { high: true }),
      f("Yards", "count", "rushing.yds", "n0", { high: true }),
      f("Yards / Carry", "count", "rushing.avg", "n1", { high: true }),
      f("Yards / Game", "count", "rushing.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "rushing.td", "n0", { high: true }),
      f("Long", "count", "rushing.long", "n0", { high: true }),
      f("Success Rate", "hub", "rushing.successRate", "pct"),
      f("Opportunity Rate", "hub", "rushing.opportunityRate", "pct"),
      f("Stuff Rate", "hub", "rushing.stuffRate", "pct"),
      f("Stop Rate", "hub", "rushing.stopRate", "pct"),
      f("Power Stop Rate", "hub", "rushing.powerStopRate", "pct"),
      f("TFL Rate", "hub", "rushing.tflRate", "pct"),
      f("Line Yards", "adv", "line_yards", "n2"),
      f("Second Level", "adv", "second_level", "n2"),
      f("Open Field", "adv", "open_field", "n2"),
      f("Power Success", "adv", "power_success", "pct"),
      f("EPA / Rush", "tape", "epa_rush", "signed2"),
    ],
  },
  {
    id: "defense", title: "Defense & havoc", sides: SIDES_DEFENSE, map: "havoc",
    head: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("Takeaways", "calc", "takeaways", "n0", { high: true, num: (b) => (b ? (b.int ?? 0) + (b.fr ?? 0) : undefined) }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
    ],
    full: [
      f("Total Tackles", "count", "tot", "n0", { high: true }),
      f("Unassisted", "count", "ua", "n0", { high: true }),
      f("Assisted", "count", "a", "n0", { high: true }),
      f("TFL", "count", "tfl", "n1", { high: true }),
      f("Sacks", "count", "sacks", "n1", { high: true }),
      f("QB Hurries", "count", "qbh", "n0", { high: true }),
      f("Interceptions", "count", "int", "n0", { high: true }),
      f("Break-ups", "count", "brup", "n0", { high: true }),
      f("Forced Fumbles", "count", "ff", "n0", { high: true }),
      f("Fumbles Recovered", "count", "fr", "n0", { high: true }),
      f("Blocked Kicks", "count", "blk", "n0", { high: true }),
      f("Safeties", "count", "saf", "n0", { high: true }),
      f("Front-Seven Havoc", "adv", "havoc_front7", "pct"),
      f("Defensive-Back Havoc", "adv", "havoc_db", "pct"),
    ],
  },
  {
    id: "scoring", title: "Scoring & drives", sides: SIDES_STD,
    head: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
      f("Red Zone TD %", "calc", "rz_td", "pct", { high: true, num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined) }),
    ],
    full: [
      f("Points", "count", "scoring.pts", "n0", { high: true }),
      f("Points / Game", "count", "scoring.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "scoring.td", "n0", { high: true }),
      f("Field Goals", "count", "scoring.fg", "n0", { high: true }),
      f("Extra Points", "count", "scoring.xpt", "n0", { high: true }),
      f("Two-Point", "count", "scoring.two_pt", "n0", { high: true }),
      f("Safeties", "count", "scoring.saf", "n0", { high: true }),
      f("Red Zone Trips", "count", "conversions.red_zone.att", "n0", { high: true }),
      f("Red Zone Scores", "calc", "rz_scores", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).scores / rz(b).att : undefined),
        text: (b) => ratio(rz(b).scores, rz(b).att),
      }),
      f("Red Zone TD", "calc", "rz_td2", "pct", {
        high: true,
        num: (b) => (rz(b).att ? rz(b).td / rz(b).att : undefined),
        text: (b) => ratio(rz(b).td, rz(b).att),
      }),
      f("Red Zone FG", "calc", "rz_fg", "pct", {
        high: false,
        num: (b) => (rz(b).att ? rz(b).fg / rz(b).att : undefined),
        text: (b) => ratio(rz(b).fg, rz(b).att),
      }),
      f("EPA / Drive", "tape", "epa_drive", "signed2"),
      f("Scoring Opportunities", "adv", "scoring_opps", "n0"),
      f("Pts / Opportunity", "adv", "points_per_opp", "n2"),
    ],
  },
  {
    id: "situational", title: "Situational", sides: SIDES_STD,
    head: [
      f("3rd Down", "count", "conversions.third.pct", "pct", { high: true }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", { high: true }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("Avg Start", "adv", "avg_start", "fp"),
    ],
    full: [
      f("3rd Down", "count", "conversions.third.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.third?.conv, b?.conversions?.third?.att),
      }),
      f("4th Down", "count", "conversions.fourth.pct", "pct", {
        high: true,
        note: (b) => ratio(b?.conversions?.fourth?.conv, b?.conversions?.fourth?.att),
      }),
      f("Avg 3rd Distance", "tape", "third_dist", "n2"),
      f("3rd/4th Success", "tape", "third_succ", "pct"),
      f("Standard-Down Success", "adv", "std_down_success", "pct"),
      f("Passing-Down Success", "adv", "pass_down_success", "pct"),
      f("Early Downs EPA", "tape", "early_epa", "signed2"),
      f("Available Yards %", "tape", "avail_yds", "pct"),
      f("First Downs", "count", "misc.first_downs", "n0", { high: true }),
      f("FD Rushing", "count", "misc.fd_rush", "n0", { high: true }),
      f("FD Passing", "count", "misc.fd_pass", "n0", { high: true }),
      f("FD Penalty", "count", "misc.fd_pen", "n0", { high: false }),
      f("Fumbles", "count", "misc.fum", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.fum_lost) ? `${b.misc.fum_lost} lost` : null),
      }),
      f("Penalties", "count", "misc.pen", "n0", {
        high: false,
        note: (b) => (Number.isFinite(b?.misc?.pen_yds) ? `${b.misc.pen_yds} yards` : null),
      }),
      f("Time of Possession", "count", "misc.top_avg", "clock", { high: true }),
      f("Average Start", "adv", "avg_start", "fp"),
    ],
  },
  {
    id: "special", title: "Special teams", sides: SIDES_TEAM,
    head: [
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Field Goals", "calc", "fg_pct", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", { high: true }),
      f("PR Avg", "count", "returns.pr.avg", "n1", { high: true }),
    ],
    full: [
      f("Punts", "count", "kicking.punting.no", "n0", { high: false }),
      f("Punt Yards", "count", "kicking.punting.yds", "n0", { high: true }),
      f("Punt Avg", "count", "kicking.punting.avg", "n1", { high: true }),
      f("Punt Long", "count", "kicking.punting.long", "n0", { high: true }),
      f("Inside 20", "count", "kicking.punting.i20", "n0", { high: true }),
      f("Touchbacks", "count", "kicking.punting.tb", "n0", { high: false }),
      f("Fair Catches", "count", "kicking.punting.fc", "n0", { high: true }),
      f("Punts Blocked", "count", "kicking.punting.blk", "n0", { high: false }),
      f("Field Goals", "calc", "fg_pct2", "pct", {
        high: true,
        num: (b) => b?.kicking?.fg?.pct,
        text: (b) => ratio(b?.kicking?.fg?.fgm, b?.kicking?.fg?.fga),
        note: (b) => pct(b?.kicking?.fg?.pct),
      }),
      f("FG Long", "count", "kicking.fg.long", "n0", { high: true }),
      f("FG Blocked", "count", "kicking.fg.blk", "n0", { high: false }),
      f("Extra Points", "calc", "pat", "pct", {
        high: true,
        num: (b) => (b?.kicking?.fg?.pat_att ? b.kicking.fg.pat_made / b.kicking.fg.pat_att : undefined),
        text: (b) => ratio(b?.kicking?.fg?.pat_made, b?.kicking?.fg?.pat_att),
      }),
      f("Kick Returns", "count", "returns.kr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.yds) ? `${b.returns.kr.yds} yards` : null),
      }),
      f("KR Avg", "count", "returns.kr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.kr?.long) ? `long ${b.returns.kr.long}` : null),
      }),
      f("KR Touchdowns", "count", "returns.kr.td", "n0", { high: true }),
      f("Punt Returns", "count", "returns.pr.no", "n0", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.yds) ? `${b.returns.pr.yds} yards` : null),
      }),
      f("PR Avg", "count", "returns.pr.avg", "n1", {
        high: true,
        note: (b) => (Number.isFinite(b?.returns?.pr?.long) ? `long ${b.returns.pr.long}` : null),
      }),
      f("PR Touchdowns", "count", "returns.pr.td", "n0", { high: true }),
    ],
  },
  {
    id: "totals", title: "Totals", sides: SIDES_STD,
    head: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
    full: [
      f("Plays", "count", "totals.plays", "n0", { high: true }),
      f("Total Yards", "count", "totals.yds", "n0", { high: true }),
      f("Yards / Play", "count", "totals.avg_p", "n1", { high: true }),
      f("Yards / Game", "count", "totals.avg_g", "n1", { high: true }),
      f("Rushing Yards", "count", "totals.rush", "n0", { high: true }),
      f("Passing Yards", "count", "totals.pass", "n0", { high: true }),
      f("Touchdowns", "count", "totals.td", "n0", { high: true }),
    ],
  },
];

const FMT = { n0, n1, n2, pct, signed2, clock, fp: (v) => fmtProfile(v, "fp") };
const getPath = (obj, path) => String(path).split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

const PassingSectionShell = ({ children }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
    {children}
  </Box>
);

const passingLabelFor = (side) => (side.root === "offense" ? "Pass Offense" : "Pass Defense");
const rushingLabelFor = (side) => (side.root === "offense" ? "Rush Offense" : "Rush Defense");

export const TeamProfilePhasesPassingCopy = ({ season, teamId, row, vals, adv, maps, tapeRanks, advRanks, hubRanks, passingLeaders, rushingLeaders, teamColors }) => {
  const [passSide, setPassSide] = useState("offense");
  const [rushSide, setRushSide] = useState("offense");
  const [tips, setTips] = useState(true);

  const { teams: countingTeams, gamesThrough } = useCountingTeamStats(season);
  const counting = useMemo(
    () => (countingTeams ?? []).find((t) => t.team_id === teamId) ?? null,
    [countingTeams, teamId],
  );
  const total = (countingTeams ?? []).length || 18;

  const cache = {};
  const countRank = (root, cacheKey, getter, high) => {
    const key = `${root}|${cacheKey}|${high}`;
    if (!cache[key]) {
      const sorted = (countingTeams ?? [])
        .map((t) => ({ id: t.team_id, v: getter(t[root]) }))
        .filter((x) => Number.isFinite(x.v))
        .sort((a, b) => (high ? b.v - a.v : a.v - b.v));
      cache[key] = Object.fromEntries(sorted.map((x, i) => [x.id, i + 1]));
    }
    return cache[key][teamId];
  };

  const resolve = (spec, side) => {
    const block = counting?.[side.root] ?? null;
    const scoped = side.base ? getPath(block, side.base.slice(0, -1)) : block;
    const fmt = FMT[spec.fmt] ?? n0;

    if (spec.src === "count" || spec.src === "calc") {
      const get = spec.src === "calc" ? spec.num : (b) => getPath(b, spec.key);
      const value = get(scoped);
      const high = side.flip ? spec.defHigh ?? !spec.high : spec.high;
      const base = side.base.slice(0, -1);
      return {
        label: spec.label,
        value: spec.text ? spec.text(scoped) : fmt(value),
        note: spec.note ? spec.note(scoped) : null,
        rank: countRank(side.root, `${spec.key}|${base}`, (b) => get(base ? getPath(b, base) : b), high),
      };
    }

    const field = `${side.prefix}_${spec.key}`;
    const source = spec.src === "hub" ? row?.metrics : spec.src === "adv" ? adv : vals;
    const ranks = spec.src === "hub" ? hubRanks : spec.src === "adv" ? advRanks : tapeRanks;
    return {
      label: spec.label,
      value: fmt(source?.[field]),
      note: spec.note ? spec.note(scoped) : null,
      rank: ranks?.[field]?.[teamId],
    };
  };

  const games = counting?.games;
  const note = <Kicker color="whiteAlpha.400">{games ? `${games} games · rank of ${total}` : season}</Kicker>;

  // A season whose feed doesn't place plays (2019–2023) ships no map; skip it.
  const mapFor = (id) => {
    if (id === "pass" && !(passSide === "offense" ? maps.passOff : maps.passDef)) return null;
    if (id === "rush" && !(rushSide === "offense" ? maps.rushOff : maps.rushDef)) return null;
    if (id === "havoc" && !maps.havoc) return null;
    if (id === "pass") {
      return (
        <>
          <MapHead title="Passing field map" side={passSide} onSide={setPassSide} options={[["offense", "Offense"], ["defense", "Defense"]]} />
          <PassFieldMap
            grid={passSide === "offense" ? maps.passOff : maps.passDef}
            targets={passSide === "offense" ? maps.targetsOff : maps.targetsDef}
            side={passSide}
          />
        </>
      );
    }
    if (id === "rush") {
      return (
        <>
          <MapHead title="Rushing lanes" side={rushSide} onSide={setRushSide} />
          <RushLaneMap
            lanes={rushSide === "offense" ? maps.rushOff : maps.rushDef}
            leaders={rushSide === "offense" ? rushingLeaders?.offense : rushingLeaders?.defense}
            side={rushSide}
            teamColors={teamColors}
          />
        </>
      );
    }
    if (id === "havoc") {
      return (
        <Box mt={5}>
          <Kicker color="whiteAlpha.700" mb={2}>Havoc map</Kicker>
          <HavocMap zones={maps.havoc} />
        </Box>
      );
    }
    return null;
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex justify="flex-end">
        <Box as="button" onClick={() => setTips((v) => !v)} px={3} py={1.5} borderRadius="md"
          bg={tips ? "whiteAlpha.100" : "brand.500"} color={tips ? "whiteAlpha.700" : "white"}
          fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
          _hover={{ bg: tips ? "whiteAlpha.200" : "brand.500" }}>
          {tips ? "Hide definitions" : "Show definitions"}
        </Box>
      </Flex>

      {!counting && (
        <Section title="Phase breakdown">
          <Text fontSize="sm" color="whiteAlpha.600">
            No counting stats on file for {season}. The rate and EPA numbers above still apply.
          </Text>
        </Section>
      )}

      {PHASES.map((phase) => {
        const isPassing = phase.id === "passing";
        const isRushing = phase.id === "rushing";
        const content = (
          <>
            <Flex gap={3} direction={{ base: "column", md: "row" }} align="stretch">
              {phase.sides.map((side, si) => {
                const tone = si ? DEF_TONE : OFF_TONE;
                const label = isPassing ? passingLabelFor(side) : isRushing ? rushingLabelFor(side) : side.label;
                if (isPassing || isRushing) {
                  return (
                    <PassingHeadCard
                      key={side.label} label={label} tone={tone} total={total} tips={tips}
                      cells={phase.head.map((spec) => resolve(spec, side))}
                      leaders={
                        isPassing
                          ? (side.root === "offense" ? passingLeaders?.offense : passingLeaders?.defense)
                          : (side.root === "offense" ? rushingLeaders?.offense?.rail ?? [] : rushingLeaders?.defense?.rail ?? [])
                      }
                    />
                  );
                }
                return (
                  <HeadCard
                    key={side.label} label={label} tone={tone} total={total} tips={tips}
                    cells={phase.head.map((spec) => resolve(spec, side))}
                  />
                );
              })}
            </Flex>
            <Flex gap={5} mt={4} direction={{ base: "column", lg: "row" }} align="flex-start">
              {phase.sides.map((side, si) => (
                <FullGrid
                  key={side.label} label={isPassing ? passingLabelFor(side) : isRushing ? rushingLabelFor(side) : side.label} tone={si ? DEF_TONE : OFF_TONE} total={total} tips={tips}
                  cells={phase.full.map((spec) => resolve(spec, side))}
                />
              ))}
            </Flex>
            {mapFor(phase.map)}
          </>
        );

        if (isPassing) return <PassingSectionShell key={phase.id}>{content}</PassingSectionShell>;
        return <Section key={phase.id} title={phase.title} right={note}>{content}</Section>;
      })}

      {gamesThrough?.label && <Kicker color="whiteAlpha.300" px={1}>Through {gamesThrough.label}</Kicker>}
    </Flex>
  );
};

export default TeamProfilePhasesPassingCopy;