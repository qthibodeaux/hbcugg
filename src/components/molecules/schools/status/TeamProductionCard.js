import { ordinal, PRODUCTION_FALLBACK, PRODUCTION_HOLD_SECONDS } from "./statusModel";
import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Cell } from "recharts";
import { SectionLabel } from "./StatusPrimitives";

const ProductionBarRow = ({ metric, color, variant }) => {
  const value = metric.value ?? null;
  const best = metric.conference_best ?? null;
  // unit_carousel (Team Hub §1) sends rank/total per metric, not a magnitude
  // to scale against — fall back to bar length by ordinal position instead
  // of leaving the bar empty. Ranking position is arguably the more honest
  // comparison across metrics with different units anyway (COMP% vs PASS TD).
  const pct = value != null && best
    ? Math.max(2, Math.min(100, (value / best) * 100))
    : metric.conference_rank && metric.conference_size > 1
      ? Math.max(2, 100 - ((metric.conference_rank - 1) / (metric.conference_size - 1)) * 100)
      : 0;
  const rankLabel = ordinal(metric.conference_rank);
  const rankText = rankLabel && metric.conference_size ? `${rankLabel} / ${metric.conference_size}` : "--";

  return (
    <Flex direction="column" justify="center" gap="2px" minH={0}>
      <Box h={variant === "compact" ? "6px" : "7px"} bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ name: metric.key, pct }]} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="pct" radius={[99, 99, 99, 99]} isAnimationActive={false}>
              <Cell fill={color} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Flex justify="space-between" align="baseline" gap={2} minW={0}>
        <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1} minW={0} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {metric.label}
        </Text>
        <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.600" flexShrink={0} whiteSpace="nowrap">
          {rankText}
        </Text>
      </Flex>
    </Flex>
  );
};

export const TeamProductionCard = ({ team, cards = [], variant = "standard" }) => {
  const items = (cards.length ? cards : PRODUCTION_FALLBACK).slice(0, 3);
  const count = items.length;
  const cycle = Math.max(1, count) * PRODUCTION_HOLD_SECONDS;
  const visible = count > 0 ? 100 / count : 100;
  const delayFor = (index) => `-${((count - index) % count) * PRODUCTION_HOLD_SECONDS}s`;
  const accent = team?.colors?.secondary || "#F56565";
  const colors = [accent, "#48BB78", "#63B3ED", "#9F7AEA"];

  return (
    <Box
      className="team-production-rotation"
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @keyframes teamProductionRotateItem {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${Math.max(4, visible - 3)}% { opacity: 1; }
          ${visible}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .team-production-rotation .tp-item,
        .team-production-rotation .tp-dot {
          animation: teamProductionRotateItem ${cycle}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .team-production-rotation .tp-item,
          .team-production-rotation .tp-dot { animation: none; opacity: 0; }
          .team-production-rotation .tp-item:first-of-type,
          .team-production-rotation .tp-dot:first-of-type { opacity: 1; }
        }
      `}</style>

      {items.map((card, index) => (
        <Flex
          key={card.key || card.label}
          className="tp-item"
          position="absolute"
          inset={0}
          p={{ base: 3, lg: variant === "compact" ? 3 : 4 }}
          pb={6}
          direction="column"
          gap={2}
          style={{ animationDelay: delayFor(index) }}
        >
          <SectionLabel label={card.label} color={accent} />
          <Grid flex={1} templateRows="repeat(4, minmax(0, 1fr))" gap={variant === "compact" ? 2.5 : 3} minH={0}>
            {(card.metrics || []).slice(0, 4).map((metric, metricIndex) => (
              <ProductionBarRow
                key={metric.key || metric.label}
                metric={metric}
                color={colors[metricIndex % colors.length]}
                variant={variant}
              />
            ))}
          </Grid>
        </Flex>
      ))}

      <Flex position="absolute" bottom={2} left={3} gap="5px">
        {items.map((card, index) => (
          <Box key={`track-${card.key || card.label}`} position="relative" w="12px" h="2px" borderRadius="full" bg="whiteAlpha.200">
            <Box className="tp-dot" position="absolute" inset={0} borderRadius="full" bg={accent} style={{ animationDelay: delayFor(index) }} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
