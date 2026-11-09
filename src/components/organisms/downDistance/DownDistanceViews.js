import { niceRange, footerFor, SUBTITLE } from "./ddModel";
import { RushingPlot } from "../rushing/RushingPlot";
import { DDBars } from "./DDBars";
import { DDDots } from "./DDDots";
import { DDStatCard } from "./DDStatCard";
import { DDStacked } from "./DDStacked";
import { DDFieldMap } from "./DDFieldMap";
import { Flex, Box, Text } from "@chakra-ui/react";

const BRAND = "#A855F7";

const POSTER = 1200;

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

export const Chart = ({ item, hover, setHover }) => {
  const s = item.slide;
  if (item.kind === "scatter") return <RushingPlot id={s.id} chart={scatterChart(s)} hover={hover} setHover={setHover} />;
  if (item.kind === "bar_horizontal") return <DDBars slide={s} />;
  if (item.kind === "dot_strip") return <DDDots slide={s} />;
  if (item.kind === "stat_card") return <DDStatCard slide={s} />;
  if (item.kind === "stacked_bar_horizontal") return <DDStacked slide={s} />;
  if (item.kind === "field_map") return <DDFieldMap slide={s} />;
  return null;
};

export const Poster = ({ item, posterRef }) => {
  const footer = footerFor(item.id);
  return (
    <Flex ref={posterRef} direction="column" w={`${POSTER}px`} h={`${POSTER}px`} bg="var(--gg-bg-primary)" color="var(--gg-ink)" px="48px" pt="44px" pb="36px">
      <Flex align="center" gap="12px" mb="8px">
        <Box w="8px" h="28px" bg={BRAND} />
        <Text fontSize="20px" fontWeight="900" letterSpacing="0.24em" textTransform="uppercase">HBCU GRIDIRON <Text as="span" color={BRAND}>GLORY</Text></Text>
      </Flex>
      <Text fontSize="60px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.035em" lineHeight={0.95}>{item.title}</Text>
      <Text fontSize="22px" fontWeight="800" color="text.secondary" mt="12px">{SUBTITLE}</Text>
      <Flex direction="column" flex={1} minH={0} mt="26px" w="1104px" justify="center">
        <Box h={item.kind === "scatter" ? "auto" : "100%"} minH={0}>
          <Chart item={item} hover={null} setHover={null} />
        </Box>
      </Flex>
      {footer.length > 0 && (
        <Flex direction="column" gap="4px" mt="18px" pt="12px" borderTop="1px solid rgba(var(--gg-fg), 0.12)">
          {footer.map((f) => (
            <Text key={f.label} fontSize="14px" fontWeight="700" color="rgba(var(--gg-fg), 0.55)" lineHeight={1.35}>
              <Text as="span" fontWeight="900" color="rgba(var(--gg-fg), 0.8)">{f.label}:</Text> {f.text}
            </Text>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
