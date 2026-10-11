import { useMemo } from "react";
import { Box, Flex, Grid, GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { StateShape, STATE_FIPS, US_STATES_GEO_URL } from "../maps";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// "Fr." -> "FR", "So." -> "SO", etc. Deliberately NOT a first-letter slice:
// So./Sr. and Fr./Gr. collide down to one letter, which is how the old
// pipeline bars ended up with two rows both labelled "S".
const CLASS_SHORT_LABELS = {
  "Fr.": "FR",
  "So.": "SO",
  "Jr.": "JR",
  "Sr.": "SR",
  "Gr.": "GR",
};

const classShortLabel = (value) =>
  CLASS_SHORT_LABELS[value] ?? String(value ?? "").replace(/\./g, "").toUpperCase().slice(0, 2);

// Class year is an ORDERED scale (FR -> GR), so it wants one hue getting
// progressively stronger, not five unrelated hues. A single-hue ramp off the
// team's own primary stays on-brand, always reads in order, and can't
// collide the way a fixed rainbow did. Teams whose primary is near-black or
// near-white are handled by ramping toward the opposite end, so the lightest
// and darkest steps never vanish into the card background.
const buildClassRamp = (primary, steps) => {
  const { r, g, b } = hexToRgb(primary || "#71717A");
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Several teams run black or near-black as their primary. Ramping those
  // from a light tint down to the raw color would make the last steps
  // vanish into the card background, so very dark primaries start from a
  // stronger tint and never reach full black.
  const isVeryDark = luminance < 0.22;
  const from = isVeryDark ? 0.85 : 0.72;
  const to = isVeryDark ? 0.18 : 0;

  return Array.from({ length: steps }, (_, index) => {
    const t = from - (from - to) * (index / (steps - 1));
    const mix = (channel) => Math.round(channel + (255 - channel) * t);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  });
};

const CLASS_COLORS = {
  "Fr.": "#63B3ED",
  "So.": "#68D391",
  "Jr.": "#F6AD55",
  "Sr.": "#FC8181",
  "Gr.": "#B794F4",
  Unknown: "#71717A",
};

const TIER_COLORS = {
  FBS: "#63B3ED",
  FCS: "#4FD1C5",
  JUCO: "#F6AD55",
  "D2/D3/NAIA": "#FBD38D",
  Unknown: "#71717A",
};

const formatPercent = (value, digits = 0) => (value == null ? "--" : `${Number(value).toFixed(digits)}%`);
const formatNumber = (value) => (value == null ? "--" : Number(value).toLocaleString());
const normalizeHex = (hex, fallback = "#FFFFFF") => {
  const value = String(hex || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const parts = value.slice(1).split("");
    return `#${parts.map((part) => `${part}${part}`).join("")}`.toUpperCase();
  }
  return fallback;
};
const hexToRgb = (hex) => {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};
const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
const mixColors = (from, to, amount = 0.5) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
};
const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
};
const isLightColor = (hex) => {
  if (!/^#[0-9a-f]{3,6}$/i.test(String(hex || ""))) return false;
  return luminance(hex) > 170;
};
const ensureMapFillColor = (color, fallback = "#6B7280", minLift = 0.16) => {
  const normalized = normalizeHex(color, fallback);
  const value = luminance(normalized);
  if (value < 34) return mixColors(normalized, "#FFFFFF", minLift);
  if (value > 235) return mixColors(normalized, "#0B0B0D", 0.22);
  return normalized;
};
const ensureOutlineColor = (color, fallback = "#FFFFFF") => {
  const normalized = normalizeHex(color, fallback);
  const value = luminance(normalized);
  if (value < 80) return "#FFFFFF";
  if (value > 238) return "rgba(11,11,13,0.72)";
  return normalized;
};
const getRecruitingMapPalette = (accent, secondaryAccent, tertiaryAccent) => {
  const primary = normalizeHex(accent, "#6B7280");
  const tertiary = normalizeHex(tertiaryAccent, primary);
  const baseSource = luminance(primary) < 14 && luminance(tertiary) > 30 ? tertiary : primary;
  const base = ensureMapFillColor(baseSource, "#6B7280", 0.18);
  const secondary = normalizeHex(secondaryAccent, "#FFFFFF");
  const outline = ensureOutlineColor(secondary, "#FFFFFF");
  const mapBase = ensureMapFillColor(base, "#6B7280");

  return {
    topFills: [mapBase, ensureMapFillColor(secondary, "#D1D5DB", 0.08), "#FFFFFF"],
    outline,
    strongOutline: outline,
    mapBg: "#070709",
    noDataFill: "#F5F5F6",
    noDataStroke: "rgba(11,11,13,0.28)",
    low: mixColors(mapBase, "#FFFFFF", 0.7),
    mid: mixColors(mapBase, "#FFFFFF", 0.38),
    high: mixColors(mapBase, "#0B0B0D", luminance(mapBase) < 58 ? 0.04 : 0.22),
  };
};
const inchesToFeet = (value) => {
  const inches = Number(value);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
};
const BODY_PROFILE_BUCKETS = [
  { key: "trenches", label: "Line", groups: ["OL", "DL"] },
  { key: "box", label: "Box", groups: ["QB", "RB", "TE", "LB"] },
  { key: "space", label: "Skill", groups: ["WR", "DB"] },
];
const weightedAverage = (items, field) => {
  const totals = items.reduce(
    (acc, item) => {
      const value = Number(item[field]);
      const count = Number(item.count);
      if (!Number.isFinite(value) || !Number.isFinite(count) || count <= 0) return acc;
      return {
        value: acc.value + value * count,
        count: acc.count + count,
      };
    },
    { value: 0, count: 0 }
  );

  return totals.count ? totals.value / totals.count : null;
};

const CardShell = ({ title, actionLabel, onClick, accent = "#E53E3E", children }) => {
  const { isMobile } = useLayoutDensity();
  const labelColor = isLightColor(accent) ? "#0B0B0D" : "#FFFFFF";

  return (
    // Mobile: square corners, no outer border, and the content padding drops
    // so the card fills its parent edge to edge.
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "lg"}
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { borderColor: "whiteAlpha.300", bg: "whiteAlpha.100" } : undefined}
      onClick={onClick}
    >
      <Box h="5px" bg={accent} />
      <Box px={isMobile ? 2 : 4} py={isMobile ? 2 : 4} h="calc(100% - 5px)" overflow="hidden">
        <Flex justify="space-between" align="center" mb={isMobile ? 2 : 3} minH="20px">
          <Box bg={accent} px={2} py="3px" borderRadius={isMobile ? 0 : "sm"} maxW="calc(100% - 52px)">
            <Text
              fontSize="8px"
              fontWeight="black"
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="0.14em"
              lineClamp={1}
            >
              {title}
            </Text>
          </Box>
          {onClick && (
            <Flex align="center" gap={1} color={accent}>
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                {actionLabel ?? "Open"}
              </Text>
              <ArrowRight size={12} />
            </Flex>
          )}
        </Flex>
        {children}
      </Box>
    </Box>
  );
};

const BarRow = ({ label, value, pct, color = "brand.500", valueLabel, size = "md" }) => (
  <Box>
    <Flex justify="space-between" align="center" mb={1}>
      <Text fontSize="10px" fontWeight="black" color="text.secondary" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="10px" fontWeight="black" color="text.primary">
        {valueLabel ?? value}
      </Text>
    </Flex>
    <Box h={size === "lg" ? "12px" : "9px"} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
      <Box h="full" borderRadius="full" bg={color} style={{ width: `${Math.max(3, Math.min(100, pct ?? 0))}%` }} />
    </Box>
  </Box>
);

const ContextRing = ({ pct = 0, color = "#FFFFFF", track = "rgba(255,255,255,0.18)", inner = "#141416", size = 50 }) => (
  <Box
    w={`${size}px`}
    h={`${size}px`}
    borderRadius="full"
    flexShrink={0}
    bg={`conic-gradient(${color} 0deg ${Math.max(0, Math.min(100, pct)) * 3.6}deg, ${track} 0deg 360deg)`}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box w={`${Math.round(size * 0.7)}px`} h={`${Math.round(size * 0.7)}px`} borderRadius="full" bg={inner} />
  </Box>
);

export const RosterKpiCard = ({ title, value, detail, tone = "default", onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.62)" : "rgba(255,255,255,0.66)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const color = tone === "alert" ? "#FC8181" : isColor || isWhite ? textColor : accent ?? (tone === "accent" ? "brand.400" : "text.primary");
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const valueSize = valueText.length > 4 ? "clamp(3rem, 4.6vw, 5.2rem)" : "clamp(4.7rem, 7vw, 7.5rem)";
  const valueShadow = isWhite
    ? `3px 3px 0 ${accent}, 6px 6px 0 rgba(11,11,13,0.12)`
    : `3px 3px 0 ${accent}, 6px 6px 0 rgba(11,11,13,0.28)`;

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      border="1px solid"
      borderColor={isWhite ? "rgba(0,0,0,0.12)" : "whiteAlpha.100"}
      borderRadius="lg"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { filter: "brightness(0.95)" } : undefined}
      onClick={onClick}
      position="relative"
    >
      <Box position="absolute" right="-20px" bottom="-22px" fontSize="clamp(5rem, 7vw, 8rem)" fontWeight="black" opacity={isWhite ? 0.07 : 0.1} lineHeight="1">
        {value}
      </Box>
      <Box position="absolute" top={4} right={4} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
        />
      </Box>
      <Flex direction="column" justify="space-between" h="full" p={4} pr="72px" position="relative" zIndex={1}>
        <Text fontSize="8px" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          {title}
        </Text>

        <Flex flex="1" align="center" minH={0}>
          <Text
            fontSize={valueSize}
            fontWeight="black"
            color={color}
            lineHeight="0.82"
            letterSpacing="0"
            textShadow={valueShadow}
            lineClamp={1}
          >
            {valueText}
          </Text>
        </Flex>

        <Flex align="end" justify="space-between" gap={3} minH="34px">
          <Text fontSize="xs" color={mutedColor} fontWeight="black" lineHeight="1.2" lineClamp={2}>
            {detail}
          </Text>
          {onClick && (
            <Flex align="center" gap={1} color={ringColor} flexShrink={0}>
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                View
              </Text>
              <ArrowRight size={12} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

// Mobile — the four roster KPIs read as one strip of cells, matching
// TeamKPIStrip on the team pages, instead of four stacked full-width cards
// that ate most of the page. Same sizing language: tiny label, centered
// value, small ring tucked into the corner, square edges.
const RosterKpiCardMobile = ({ title, value, detail, onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.66)" : "rgba(255,255,255,0.68)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const detailText = String(detail ?? "")
    .replace(" in the 2025 roster file", "")
    .replace("Junior, senior, and graduate roster share", "Upperclass share");
  const valueSize = valueText.length > 4 ? "clamp(0.95rem, 4vw, 1.4rem)" : "clamp(1.3rem, 5.6vw, 1.9rem)";

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      position="relative"
      overflow="hidden"
      p={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor={isWhite ? "blackAlpha.100" : "whiteAlpha.100"}
      _last={{ borderRight: "none" }}
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
    >
      <Box position="absolute" top={1.5} right={1.5} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
          size={26}
        />
      </Box>

      <Text fontSize="0.5rem" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.12em" lineClamp={1} position="relative" zIndex={1}>
        {title}
      </Text>

      <Flex flex="1" align="center" justify="center" minH={0} mt={3} position="relative" zIndex={1}>
        <Text fontSize={valueSize} fontWeight="black" color={textColor} lineHeight="0.86" textAlign="center" lineClamp={1}>
          {valueText}
        </Text>
      </Flex>

      <Text fontSize="0.5rem" color={mutedColor} fontWeight="bold" lineHeight="1.15" lineClamp={2} position="relative" zIndex={1}>
        {detailText}
      </Text>
    </Box>
  );
};

const RosterKpiCardCompact = ({ title, value, detail, tone = "default", onClick, accent, bgMode = "dark", contextPct = 0 }) => {
  const isWhite = bgMode === "white";
  const isColor = bgMode === "primary" || bgMode === "secondary";
  const bg = isWhite ? "#FFFFFF" : isColor ? accent : "bg.secondary";
  const textColor = isWhite || (isColor && isLightColor(accent)) ? "#0B0B0D" : "#FFFFFF";
  const mutedColor = isWhite || (isColor && isLightColor(accent)) ? "rgba(11,11,13,0.66)" : "rgba(255,255,255,0.68)";
  const ringColor = isWhite ? accent : bgMode === "dark" ? accent : textColor;
  const color = tone === "alert" ? "#FC8181" : isColor || isWhite ? textColor : accent ?? (tone === "accent" ? "brand.400" : "text.primary");
  const ringInner = isWhite ? "#FFFFFF" : isColor ? bg : "#141416";
  const valueText = String(value ?? "--");
  const detailText = String(detail ?? "").replace(" in the 2025 roster file", "").replace("Junior, senior, and graduate roster share", "Upperclass roster share");
  const valueSize = valueText.length > 4 ? "clamp(2.5rem, 5.4vw, 3.2rem)" : "clamp(3.35rem, 7.1vw, 4.65rem)";

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      border="1px solid"
      borderColor={isWhite ? "rgba(0,0,0,0.12)" : "whiteAlpha.100"}
      borderRadius="lg"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={onClick ? { filter: "brightness(0.95)" } : undefined}
      onClick={onClick}
      position="relative"
    >
      <Box position="absolute" right="-10px" bottom="-14px" fontSize="4.5rem" fontWeight="black" opacity={isWhite ? 0.06 : 0.08} lineHeight="1">
        {valueText}
      </Box>
      <Box position="absolute" top={3} right={3} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={isWhite ? "rgba(11,11,13,0.12)" : "rgba(255,255,255,0.2)"}
          inner={ringInner}
          size={38}
        />
      </Box>
      <Flex direction="column" h="full" p={3} pr="46px" position="relative" zIndex={1}>
        <Text fontSize="7px" fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
          {title}
        </Text>

        <Flex flex="1" align="center" minH={0} mt={1}>
          <Text
            fontSize={valueSize}
            fontWeight="black"
            color={color}
            lineHeight="0.86"
            letterSpacing="0"
            textShadow={isWhite ? `2px 2px 0 ${accent}` : "none"}
            lineClamp={1}
          >
            {valueText}
          </Text>
        </Flex>

        <Flex align="end" justify="space-between" gap={2} minH="32px">
          <Text fontSize="10px" color={mutedColor} fontWeight="black" lineHeight="1.08" lineClamp={3}>
            {detailText}
          </Text>
          {onClick && (
            <Flex align="center" gap={1} color={ringColor} flexShrink={0}>
              <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
                View
              </Text>
              <ArrowRight size={10} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export const RosterKpiTile = ({ variant = "standard", ...props }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <RosterKpiCardMobile {...props} />;
  if (variant === "compact") return <RosterKpiCardCompact {...props} />;
  return <RosterKpiCard {...props} />;
};

const RosterCompositionCompact = ({ model, accent }) => {
  const { isMobile } = useLayoutDensity();
  const rows = useMemo(() => {
    return (model.composition.positionDistribution || [])
      .filter((item) => item.count > 0 && item.group !== "Unknown")
      // `group` already ships as a position code ("DL", "DB", "WR", "OL") —
      // the old acronym transform (split on spaces, take first letters) was
      // written for multi-word names and reduced every code to a single
      // letter, so DL and DB both rendered as "D". Use the code as-is.
      .map(item => ({ ...item, label: String(item.group).toUpperCase() }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [model]);

  const total = model.kpis.totalPlayers || "--";

  return (
    <CardShell title="Biggest Position Groups" accent={accent}>
      <Box position="relative" h="full" overflow="hidden">
        {/* Background Watermark */}
        <Text 
          position="absolute" 
          right="-0.75rem" 
          bottom="-1.5rem" 
          fontSize="5.5rem" 
          fontWeight="black" 
          color="whiteAlpha.50" 
          lineHeight={1}
          pointerEvents="none"
          zIndex={0}
        >
          {total}
        </Text>

        <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={1} position="relative" zIndex={1}>
          {rows.map((group) => (
            <GridItem key={group.group} bg="whiteAlpha.50" p={2} borderRadius={isMobile ? 0 : "md"} borderLeft="2px solid" borderColor={accent}>
              <Flex justify="space-between" align="baseline">
                <Text fontSize="10px" fontWeight="bold" color="text.muted">{group.label}</Text>
                <Text fontSize="16px" fontWeight="black" color="text.primary">{group.count}</Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>

        <Text mt={2} fontSize="9px" fontWeight="bold" color="text.muted" position="relative" zIndex={1}>
          Four deepest position groups by player count
        </Text>
      </Box>
    </CardShell>
  );
};

export const RosterCompositionCard = ({ model, accent, variant = "standard" }) => {
  if (variant === "compact") return <RosterCompositionCompact model={model} accent={accent} />;

  const rows = model.composition.positionDistribution.filter((item) => item.count > 0).slice(0, 7);

  return (
    <CardShell title="Roster Build" accent={accent}>
      <Flex direction="column" gap={2}>
        {rows.map((item) => (
          <BarRow
            key={item.group}
            label={item.group}
            value={item.count}
            pct={item.pct}
            color={accent}
            valueLabel={`${item.count} - ${formatPercent(item.pct)}`}
          />
        ))}
      </Flex>
    </CardShell>
  );
};

// Class Pipeline — five fixed rows (FR, SO, JR, SR, GR), bar length scaled
// against the roster total so the axis means something, count at the end of
// each bar, colors alternating primary/secondary. No upperclass footer.
const CLASS_PIPELINE_ORDER = ["Fr.", "So.", "Jr.", "Sr.", "Gr."];

const RosterExperienceCompact = ({ model, accent, palette = [] }) => {
  const { isMobile } = useLayoutDensity();
  const secondary = palette[1] ?? accent;

  const classes = useMemo(() => {
    const byClass = new Map(
      (model.composition.classDistribution || []).map((item) => [item.class, item.count ?? 0]),
    );
    // Always all five rows, even at zero — a missing class should read as an
    // empty bar, not a silently shorter chart.
    return CLASS_PIPELINE_ORDER.map((cls) => ({
      key: cls,
      shortLabel: classShortLabel(cls),
      count: byClass.get(cls) ?? 0,
    }));
  }, [model]);

  // Max is the roster total, so every bar is read against the same whole and
  // bar lengths are comparable across teams.
  const rosterTotal = Math.max(
    Number(model.kpis.totalPlayers) || 0,
    classes.reduce((sum, item) => sum + item.count, 0),
    1,
  );

  return (
    <CardShell title="Class Pipeline" accent={accent}>
      {/* Desktop's slot has a real resolved height, so h="full" fills it.
          The mobile card is auto-height, and a percentage height does NOT
          resolve against min-height — ResponsiveContainer measured 0 and
          rendered nothing (sized frame, no bars). Mobile therefore gets a
          definite rem height instead of relying on a floor. */}
      <Box
        h={isMobile ? `${CLASS_PIPELINE_ORDER.length * 1.6}rem` : "full"}
        w="full"
        pb="0.5rem"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={classes}
            layout="vertical"
            margin={{ top: 2, right: 30, bottom: 2, left: 0 }}
            barCategoryGap="14%"
          >
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
            {/* Ticks only at 0 and the roster total, so the right-hand
                gridline is explicitly labelled as the full roster — the bars
                are read against that whole, not against each other. */}
            <XAxis
              type="number"
              domain={[0, rosterTotal]}
              ticks={[0, rosterTotal]}
              axisLine={false}
              tickLine={false}
              height={14}
              tick={{ fill: "#71717A", fontSize: "0.58rem", fontWeight: 900 }}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              // interval={0} forces all five labels — Recharts auto-skips
              // ticks it thinks will collide, which was blanking every other
              // class label (FR, _, JR, _, GR).
              interval={0}
              // Recharts sizes axes in SVG user units, so this prop has to
              // stay numeric — everything else here is rem.
              width={30}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: "0.68rem", fontWeight: 900 }}
            />
            <Bar dataKey="count" radius={0} isAnimationActive={false}>
              {classes.map((item, index) => (
                <Cell key={item.key} fill={index % 2 === 0 ? accent : secondary} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fill: "#FFFFFF", fontSize: "0.68rem", fontWeight: 900 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </CardShell>
  );
};

export const RosterExperienceCard = ({ model, accent, palette = [], variant = "standard" }) => {
  if (variant === "compact") return <RosterExperienceCompact model={model} accent={accent} palette={palette} />;

  const classes = model.composition.classDistribution.filter((item) => item.count > 0);
  const classColor = (item, index) => palette[index % palette.length] ?? CLASS_COLORS[item.class] ?? CLASS_COLORS.Unknown;

  return (
    <CardShell title="Class Balance" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" justify="space-between" gap={4}>
        <Box>
          <Flex h="14px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100" mb={4}>
            {classes.map((item, index) => (
              <Box
                key={item.class}
                h="full"
                bg={classColor(item, index)}
                style={{ width: `${item.pct ?? 0}%` }}
              />
            ))}
          </Flex>
          <SimpleGrid columns={2} gap={2}>
            {classes.map((item, index) => (
              <Flex key={item.class} align="center" justify="space-between" gap={2}>
                <Flex align="center" gap={2} minW={0}>
                  <Box w="7px" h="7px" borderRadius="full" bg={classColor(item, index)} />
                  <Text fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={1}>
                    {item.label ?? item.class}
                  </Text>
                </Flex>
                <Text fontSize="10px" color="text.primary" fontWeight="black">
                  {item.count}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={2} gap={3}>
          <Box>
            <Text fontSize="2xl" color={accent} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.upperclassPct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Upperclass
            </Text>
          </Box>
          <Box>
            <Text fontSize="2xl" color="text.primary" fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.veteranPct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Senior + Grad
            </Text>
          </Box>
        </SimpleGrid>
      </Flex>
    </CardShell>
  );
};

export const RosterPhysicalProfileCard = ({ model, accent }) => {
  const groups = model.physical.groups.filter((item) => item.count > 0);
  // model.physical.tiers is the backend's own LINE/BOX/SKILL grouping
  // (roster_hub_team contract) — prefer it over the client-side bucket
  // guess below when it's present, since group membership isn't identical
  // (QB lands in SKILL there, not BOX).
  const bodyProfiles = model.physical.tiers?.length
    ? model.physical.tiers.map((tier) => ({
        key: tier.key,
        label: tier.label,
        count: tier.count,
        height: tier.height_avg,
        weight: tier.weight_avg,
        groupLabel: tier.groups.join(" + "),
      }))
    : BODY_PROFILE_BUCKETS.map((bucket) => {
        const bucketGroups = groups.filter((item) => bucket.groups.includes(item.group));
        return {
          ...bucket,
          count: bucketGroups.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
          height: weightedAverage(bucketGroups, "height_avg"),
          weight: weightedAverage(bucketGroups, "weight_avg"),
          groupLabel: bucketGroups.map((item) => item.group).join(" + "),
        };
      }).filter((item) => item.count > 0);
  const largestRooms = [...groups]
    .filter((item) => item.group && item.group !== "Unknown" && Number.isFinite(Number(item.weight_avg)))
    .sort((a, b) => Number(b.weight_avg) - Number(a.weight_avg))
    .slice(0, 3);

  return (
    <CardShell title="Frame Profile" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" gap={3} minH={0}>
        <Box>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Size by body type
          </Text>
        </Box>

        <Flex direction="column" gap={2}>
          {bodyProfiles.map((item, index) => (
            <Box
              key={item.key}
              bg={index === 0 ? `${accent}22` : "whiteAlpha.100"}
              border="1px solid"
              borderColor={index === 0 ? accent : "whiteAlpha.100"}
              borderRadius="md"
              px={2.5}
              py={2}
            >
              <Flex align="center" justify="space-between" gap={2}>
                <Box minW={0}>
                  <Text fontSize="lg" color={index === 0 ? accent : "text.primary"} fontWeight="black" lineHeight="0.9" textTransform="uppercase" lineClamp={1}>
                    {item.label}
                  </Text>
                  <Text mt="3px" fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
                    {item.groupLabel}
                  </Text>
                </Box>
                <SimpleGrid columns={2} gap={2} flexShrink={0} minW="82px">
                  <Box textAlign="right">
                    <Text fontSize="8px" color="text.muted" fontWeight="black" lineHeight="1" textTransform="uppercase">
                      Hgt
                    </Text>
                    <Text mt="2px" fontSize="sm" color="text.primary" fontWeight="black" lineHeight="1">
                      {inchesToFeet(item.height)}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="8px" color="text.muted" fontWeight="black" lineHeight="1" textTransform="uppercase">
                      Wgt
                    </Text>
                    <Text mt="2px" fontSize="sm" color={accent} fontWeight="black" lineHeight="1">
                      {item.weight ? `${Math.round(item.weight)}` : "--"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Flex>
            </Box>
          ))}
        </Flex>

        <Box mt="auto">
          <Text mb={2} fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Biggest rooms
          </Text>
          <Flex direction="column" gap={1.5}>
            {largestRooms.map((item) => (
              <Flex key={item.group} align="center" justify="space-between" gap={2} borderTop="1px solid" borderColor="whiteAlpha.100" pt={1.5}>
                <Text fontSize="10px" color="text.primary" fontWeight="black">
                  {item.group}
                </Text>
                <Text fontSize="10px" color="text.secondary" fontWeight="bold">
                  {inchesToFeet(item.height_avg)}
                </Text>
                <Text fontSize="10px" color={accent} fontWeight="black">
                  {Math.round(item.weight_avg)} lbs
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </CardShell>
  );
};

export const RosterTransferCard = ({ model, accent, palette = [] }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = model.transfers.tierBreakdown;
  const secondary = palette[1] ?? accent;
  // "Unknown" is the pipeline's unclassified bucket — for most teams it's a
  // single player at a meaningless 100% rate, which sorted straight to the
  // top of this list and pushed out a real position group.
  // Desktop shows more groups than mobile: the slot is 2x2 and four rows
  // left most of it empty, so the extra height is filled with real position
  // groups rather than stretched whitespace.
  const positionImpact = model.transfers.positionImpact
    .filter((item) => item.group !== "Unknown")
    .slice(0, isMobile ? 4 : 8)
    // Precomputed label — LabelList's formatter args vary by Recharts
    // version, so the text is built here and read off the row by dataKey.
    .map((item) => ({
      ...item,
      rateLabel: `${Math.round(item.transfer_rate ?? 0)}% (${item.transfer_count ?? 0})`,
    }));
  const tierColor = (item, index) => palette[index % palette.length] ?? TIER_COLORS[item.tier] ?? TIER_COLORS.Unknown;

  return (
    <CardShell title="Portal Profile" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" gap={4}>
        <SimpleGrid columns={2} gap={3}>
          <Box>
            <Text fontSize="3xl" color={accent} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.transferRate)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Transfer Rate
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color="text.primary" fontWeight="black" lineHeight="1">
              {model.kpis.transferCount ?? "--"}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Transfers
            </Text>
          </Box>
        </SimpleGrid>

        {/* The tier strip had no legend at all — it read as decorative
            stripes. It's actually where the transfers came from, so it now
            says so and every segment is named. */}
        <Box>
          <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb="0.35rem">
            Where transfers came from
          </Text>
          {tiers.length ? (
            <>
              <Flex h="0.625rem" overflow="hidden" bg="whiteAlpha.100">
                {tiers.map((item, index) => (
                  <Box key={item.tier} h="full" bg={tierColor(item, index)} style={{ width: `${item.pct ?? 0}%` }} />
                ))}
              </Flex>
              <Flex mt="0.35rem" gap="0.6rem" wrap="wrap">
                {tiers.map((item, index) => (
                  <Flex key={item.tier} align="center" gap="0.25rem" minW={0}>
                    <Box w="0.45rem" h="0.45rem" bg={tierColor(item, index)} flexShrink={0} />
                    <Text fontSize="0.55rem" fontWeight="black" color="text.secondary" textTransform="uppercase">
                      {item.tier} {item.count}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </>
          ) : (
            <Text fontSize="10px" color="text.muted" fontWeight="bold">
              Transfer source tiers not available for this team yet.
            </Text>
          )}
        </Box>

        {/* Recharts, matching the Class Pipeline treatment: position group
            on the axis, bar scaled 0-100% of that room, rate and headcount
            at the end of the bar. Height is driven by row count in rem so
            it resolves in both the fixed-height desktop slot and the
            auto-height mobile card. */}
        {/* Desktop: this section grows into all the height the KPI row and
            tier strip don't use, so the chart fills the 2x2 slot instead of
            sitting at a fixed row-count height with dead space beneath it.
            Mobile keeps a definite rem height — its card is auto-height, and
            a percentage height won't resolve there. */}
        <Flex direction="column" gap={2} flex={isMobile ? undefined : 1} minH={0}>
          <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
            Share of each position room that transferred in
          </Text>
          {!positionImpact.length ? (
            <Flex flex={1} align="center" justify="center" minH="4rem">
              <Text fontSize="10px" color="text.muted" fontWeight="bold">
                Position-level transfer data not available for this team yet.
              </Text>
            </Flex>
          ) : (
          <Box
            h={isMobile ? `${Math.max(positionImpact.length, 1) * 1.6}rem` : "full"}
            minH={`${Math.max(positionImpact.length, 1) * 1.9}rem`}
            w="full"
            flex={isMobile ? undefined : 1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={positionImpact}
                layout="vertical"
                margin={{ top: 2, right: 62, bottom: 2, left: 0 }}
                barCategoryGap="16%"
              >
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  height={14}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: "#71717A", fontSize: "0.55rem", fontWeight: 900 }}
                />
                <YAxis
                  type="category"
                  dataKey="group"
                  interval={0}
                  width={32}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A1A1AA", fontSize: "0.62rem", fontWeight: 900 }}
                />
                <Bar dataKey="transfer_rate" radius={0} isAnimationActive={false}>
                  {positionImpact.map((item, index) => (
                    <Cell key={item.group} fill={index % 2 === 0 ? accent : secondary} />
                  ))}
                  <LabelList
                    dataKey="rateLabel"
                    position="right"
                    style={{ fill: "#FFFFFF", fontSize: "0.58rem", fontWeight: 900 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          )}
        </Flex>
      </Flex>
    </CardShell>
  );
};

export const RosterGeographyCard = ({ model, accent, secondaryAccent, tertiaryAccent }) => {
  const { isMobile } = useLayoutDensity();
  const states = model.geographic.stateDistribution.filter((item) => STATE_FIPS[item.state]).slice(0, 18);

  if (!states.length) {
    return (
      <CardShell title="Recruiting Map" accent={accent}>
        <Flex h="calc(100% - 24px)" align="center" justify="center">
          <Text fontSize="11px" color="text.muted" fontWeight="bold" textAlign="center" maxW="70%">
            Geographic data not available for this team yet.
          </Text>
        </Flex>
      </CardShell>
    );
  }
  const topStates = states.slice(0, 3);
  const otherStates = states.slice(3);
  const maxCount = topStates[0]?.count || 1;
  const countByState = new Map(states.map((item) => [item.state, item.count]));
  const topStateIds = new Set(topStates.map((item) => STATE_FIPS[item.state]));
  const mapPalette = getRecruitingMapPalette(accent, secondaryAccent, tertiaryAccent);
  const topColors = mapPalette.topFills;
  const topTextColors = topColors.map((color) => (isLightColor(color) ? "#0B0B0D" : "#FFFFFF"));
  const heatColor = (stateAbbr) => {
    const count = countByState.get(stateAbbr) ?? 0;
    if (count <= 0) return mapPalette.noDataFill;
    const strength = Math.max(0.12, Math.min(1, count / maxCount));
    if (strength > 0.72) return mapPalette.high;
    if (strength > 0.34) return mixColors(mapPalette.mid, mapPalette.high, (strength - 0.34) / 0.38);
    return mixColors(mapPalette.low, mapPalette.mid, strength / 0.34);
  };

  return (
    <CardShell title="Recruiting Map" accent={mapPalette.topFills[0]}>
      <Flex direction="column" h="calc(100% - 24px)" gap={3} minH={0}>
        <SimpleGrid columns={3} gap={3}>
          <Box>
            <Text fontSize="3xl" color={mapPalette.topFills[0]} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.inStatePct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              In-State
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color="text.primary" fontWeight="black" lineHeight="1">
              {model.kpis.avgDistance ? formatNumber(model.kpis.avgDistance) : "--"}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Avg Miles
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color={mapPalette.topFills[1]} fontWeight="black" lineHeight="1">
              {model.geographic.stateDistribution.length}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              States
            </Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={3} gap={2} minH="116px">
          {topStates.map((item, index) => (
            <Flex key={item.state} direction="column" minW={0} minH={0} overflow="hidden">
              <Box flex="1" minH="72px">
                <StateShape
                  state={item.state}
                  fill={topColors[index]}
                  stroke={index === 2 ? mapPalette.outline : mapPalette.strongOutline}
                  strokeWidth={1.1}
                  padding={5}
                />
              </Box>
              <Box pt={1} color={topTextColors[index]}>
                {/* Was "{state}-{count}" — the hyphen made "AL-55" read as a
                    single code rather than a state and its player count. */}
                <Text fontSize="lg" fontWeight="black" lineHeight="0.95" textTransform="uppercase" color={topColors[index]} lineClamp={1}>
                  {item.state}: {item.count}
                </Text>
                <Text mt="2px" fontSize="7px" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" color="text.secondary" lineClamp={1}>
                  players
                </Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>

        <Box flex="1" minH="150px" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" bg={mapPalette.mapBg}>
          <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
            <Geographies geography={US_STATES_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const id = String(geo.id).padStart(2, "0");
                  const stateAbbr = Object.keys(STATE_FIPS).find((key) => STATE_FIPS[key] === id);
                  const hasData = stateAbbr ? (countByState.get(stateAbbr) ?? 0) > 0 : false;
                  const fill = stateAbbr ? heatColor(stateAbbr) : mapPalette.noDataFill;
                  const stroke = topStateIds.has(id)
                    ? mapPalette.strongOutline
                    : hasData
                      ? mapPalette.outline
                      : mapPalette.noDataStroke;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={topStateIds.has(id) ? 1.25 : hasData ? 0.7 : 0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </Box>

        <Flex gap={1.5} wrap="wrap">
          {otherStates.map((item) => (
            <Box key={item.state} px={2} py="3px" borderRadius={isMobile ? 0 : "sm"} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="9px" color="text.secondary" fontWeight="black" textTransform="uppercase">
                {item.state}: {item.count}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </CardShell>
  );
};

// Experience By Room — for each position group, the class-year makeup of
// that room as a 100% stacked bar, plus the room's headcount.
//
// The old version colored each segment by indexing the TEAM palette by the
// class's position in CLASS_COLORS, modulo palette length. The palette only
// holds 3-4 team colors against 5 classes, so colors wrapped and repeated —
// Fr. and Sr. could come out identical. That's why the bars read as random
// stripes: the colors genuinely didn't encode anything. Class year needs its
// own fixed scale (CLASS_COLORS), not the team's colors, and it needs a
// legend saying so.
export const RosterDepthSnapshotCard = ({ model, accent, teamPrimary }) => {
  const { isMobile } = useLayoutDensity();
  const ramp = useMemo(
    () => buildClassRamp(teamPrimary ?? accent, CLASS_PIPELINE_ORDER.length),
    [teamPrimary, accent],
  );

  const rows = useMemo(() => {
    return model.experience.positionExperience
      .filter((item) => item.total > 0)
      .slice(0, 6)
      .map((item) => {
        const row = { group: item.group, total: item.total };
        CLASS_PIPELINE_ORDER.forEach((cls) => {
          const entry = item.breakdown.find((b) => b.class === cls);
          row[classShortLabel(cls)] = entry?.pct ?? 0;
        });
        return row;
      });
  }, [model]);

  return (
    <CardShell title="Experience By Room" accent={accent}>
      <Flex direction="column" h="full" minH={0} gap={2}>
        <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
          Class makeup of each position room
        </Text>

        <Box
          h={isMobile ? `${Math.max(rows.length, 1) * 1.7}rem` : "full"}
          minH={`${Math.max(rows.length, 1) * 1.7}rem`}
          w="full"
          flex={isMobile ? undefined : 1}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 2, right: 26, bottom: 2, left: 0 }} barCategoryGap="20%">
              <XAxis type="number" hide domain={[0, 100]} />
              {/* Custom tick renders the room and its headcount together.
                  The total used to be a LabelList on the last stacked
                  segment (GR), so any room with no grad students rendered
                  no total at all — QB and RB were silently blank. */}
              <YAxis
                type="category"
                dataKey="group"
                interval={0}
                width={54}
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload, index }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text x={-40} y={0} dy={4} textAnchor="start" fill="#A1A1AA" fontSize="0.62rem" fontWeight="900">
                      {payload.value}
                    </text>
                    <text x={-6} y={0} dy={4} textAnchor="end" fill="#FFFFFF" fontSize="0.6rem" fontWeight="900">
                      {rows[index]?.total ?? ""}
                    </text>
                  </g>
                )}
              />
              {CLASS_PIPELINE_ORDER.map((cls, index) => (
                <Bar
                  key={classShortLabel(cls)}
                  dataKey={classShortLabel(cls)}
                  stackId="room"
                  fill={ramp[index]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend — without this the stack colors mean nothing to a reader. */}
        <Flex gap="0.6rem" wrap="wrap" flexShrink={0}>
          {CLASS_PIPELINE_ORDER.map((cls, index) => (
            <Flex key={cls} align="center" gap="0.25rem">
              <Box w="0.45rem" h="0.45rem" bg={ramp[index]} flexShrink={0} />
              <Text fontSize="0.55rem" fontWeight="black" color="text.secondary">
                {classShortLabel(cls)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </CardShell>
  );
};
