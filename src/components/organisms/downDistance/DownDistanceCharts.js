import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../stats/ExportCardButton";
import { RushingPlot } from "../rushing/RushingPlot";
import { DDBars } from "./DDBars";
import { DDDots } from "./DDDots";
import { DDStatCard } from "./DDStatCard";
import { DDStacked } from "./DDStacked";
import { DDFieldMap } from "./DDFieldMap";
import { CHARTS, DATA, SUBTITLE, footerFor, niceRange } from "./ddModel";

// ─────────────────────────────────────────────────────────────────────────────
// Down & Distance — Team Analytics > Charts, the third mode beside Scatter and
// Bar. TEMPORARY (see ddModel): the eight charts of the backend's 2026-10-20
// social export, one at a time. Each exports as a 1200 x 1200 PNG built from a
// hidden fixed-size copy: title, subtitle, the chart, and the definitions it
// uses as a footer (the footer is on the PNG only, never on the page).
// Desktop only.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = "#A855F7";
const POSTER = 1200;

// The two scatters reuse the rushing scatter: it reads `x` / `y` off each point
// and needs a min / max on both axes (slide 8's file has none, so they're framed
// around the points).
const scatterChart = (slide) => {
  const c = slide.chart;
  const xs = slide.points.map((p) => p[c.x.key]);
  const ys = slide.points.map((p) => p[c.y.key]);
  const fx = c.x.min != null ? { min: c.x.min, max: c.x.max } : niceRange([...xs, c.x.reference?.value]);
  const fy = c.y.min != null ? { min: c.y.min, max: c.y.max } : niceRange([...ys, c.y.reference?.value]);
  return {
    ...c,
    x: { ...c.x, ...fx },
    y: { ...c.y, ...fy },
    points: slide.points.map((p) => ({ ...p, x: p[c.x.key], y: p[c.y.key] })),
  };
};

const Chart = ({ item, hover, setHover }) => {
  const s = item.slide;
  if (item.kind === "scatter") return <RushingPlot id={s.id} chart={scatterChart(s)} hover={hover} setHover={setHover} />;
  if (item.kind === "bar_horizontal") return <DDBars slide={s} />;
  if (item.kind === "dot_strip") return <DDDots slide={s} />;
  if (item.kind === "stat_card") return <DDStatCard slide={s} />;
  if (item.kind === "stacked_bar_horizontal") return <DDStacked slide={s} />;
  if (item.kind === "field_map") return <DDFieldMap slide={s} />;
  return null;
};

const Poster = ({ item, posterRef }) => {
  const footer = footerFor(item.id);
  return (
    <Flex ref={posterRef} direction="column" w={`${POSTER}px`} h={`${POSTER}px`} bg="#0B0B0D" color="white" px="48px" pt="44px" pb="36px">
      <Flex align="center" gap="12px" mb="8px">
        <Box w="8px" h="28px" bg={BRAND} />
        <Text fontSize="20px" fontWeight="900" letterSpacing="0.24em" textTransform="uppercase">HBCU GRIDIRON <Text as="span" color={BRAND}>GLORY</Text></Text>
      </Flex>
      <Text fontSize="60px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.035em" lineHeight={0.95}>{item.title}</Text>
      <Text fontSize="22px" fontWeight="800" color="whiteAlpha.700" mt="12px">{SUBTITLE}</Text>
      <Flex direction="column" flex={1} minH={0} mt="26px" w="1104px" justify="center">
        <Box h={item.kind === "scatter" ? "auto" : "100%"} minH={0}>
          <Chart item={item} hover={null} setHover={null} />
        </Box>
      </Flex>
      {footer.length > 0 && (
        <Flex direction="column" gap="4px" mt="18px" pt="12px" borderTop="1px solid rgba(255,255,255,0.12)">
          {footer.map((f) => (
            <Text key={f.label} fontSize="14px" fontWeight="700" color="rgba(255,255,255,0.55)" lineHeight={1.35}>
              <Text as="span" fontWeight="900" color="rgba(255,255,255,0.8)">{f.label}:</Text> {f.text}
            </Text>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export const DownDistanceCharts = () => {
  const [id, setId] = useState(CHARTS[0].id);
  const [hover, setHover] = useState(null);
  const posterRef = useRef(null);
  const item = useMemo(() => CHARTS.find((c) => c.id === id) ?? CHARTS[0], [id]);

  return (
    <Box>
      <Flex gap={2} wrap="wrap" mb={5}>
        {CHARTS.map((c) => {
          const on = c.id === item.id;
          return (
            <Flex key={c.id} as="button" type="button" onClick={() => { setHover(null); setId(c.id); }}
              px={3.5} h="2.2rem" align="center" borderRadius="md" border="1px solid"
              borderColor={on ? "brand.500" : "whiteAlpha.200"} bg={on ? "whiteAlpha.100" : "transparent"} _hover={{ bg: "whiteAlpha.100" }}>
              <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{c.chip}</Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex align="flex-end" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
          {item.title}
        </Text>
        <ExportCardButton target={posterRef} filename={() => `swac-down-distance-${item.id}-${DATA.season}-w${DATA.through_week}.png`.replace(/_/g, "-")} />
      </Flex>

      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4} h={item.kind === "scatter" ? "auto" : "640px"}>
        <Chart item={item} hover={hover} setHover={setHover} />
      </Box>

      {/* Export source: off screen, fixed size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster item={item} posterRef={posterRef} />
      </Box>
    </Box>
  );
};
