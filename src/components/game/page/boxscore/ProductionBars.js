import { Box, Flex, Text } from "@chakra-ui/react";
import { withAlpha } from "../../../../utils/productionPresentation";
import { PAR_NEGATIVE, productionOf } from "../../../../utils/productionScoreModel";
import { productionScale } from "../../../../utils/productionBars";

// Extracted from ProductionPrimitives; existing behavior is preserved.

// The three PAR axes, exactly as the stat card's legend pairs them: an offensive
// meaning and a defensive one sharing a track. A player is only ever one side of
// a pair — offence ships {passing|receiving, rushing}, defence ships {hit, hawk,
// scrum} — so summing both sides of an axis can't double-count anybody.
//
// Every value below is read straight off `components`. Nothing here is invented:
// offensive turnover impact has no component on any player in any export, so an
// offensive bar simply carries two segments where a defender carries three, and
// the gap is filed as a backend ask rather than mocked in.
const PAR_AXES = [
  { key: "pass_hit", label: "Passing/Hit", keys: ["passing_production", "receiving_production", "hit_production"] },
  { key: "rush_hawk", label: "Rushing/Hawk", keys: ["rushing_production", "hawk_production"] },
  { key: "turnover_scrum", label: "Turnover/Scrum", keys: ["scrum_production"] },
];

// One accent, three intensities — the segments are tiers of the same team colour
// rather than three unrelated hues, so the bar still reads as one player's score.
const SEGMENT_ALPHA = [1, 0.62, 0.34];

const parSegments = (entry) => {
  const components = entry?.components ?? {};
  return PAR_AXES.map((axis, tier) => ({
    key: axis.key,
    label: axis.label,
    tier,
    value: axis.keys.reduce((sum, k) => sum + (typeof components[k] === "number" ? components[k] : 0), 0),
  })).filter((s) => s.value !== 0);
};

const Segment = ({ seg, color }) => (
  <Box flex={`${Math.abs(seg.value)} 0 0`} bg={withAlpha(color, SEGMENT_ALPHA[seg.tier])} title={`${seg.label} ${seg.value.toFixed(2)}`} />
);

/**
 * PAR bar — the score, then a stacked track drawn against the domain its whole
 * table shares. Positive segments stack rightward from zero, negative ones
 * leftward, so a player who was a net drag reads as a bar on the wrong side of
 * the line rather than a short one. Colour marks sign and nothing else
 * (AgentDesignBible §6b): red is only ever a negative.
 */
export const ProductionBar = ({ total, segments, scale, accent }) => {
  if (total == null) return <Box h="0.375rem" />;
  const pos = segments.filter((s) => s.value > 0);
  const neg = segments.filter((s) => s.value < 0);
  const extent = (list) => list.reduce((sum, s) => sum + Math.abs(s.value), 0);
  const posWidth = (extent(pos) / scale.span) * 100;
  const negWidth = (extent(neg) / scale.span) * 100;

  return (
    <Flex align="center" gap={1.5} minW={0}>
      <Text
        w="2rem"
        flexShrink={0}
        textAlign="right"
        fontFamily="mono"
        fontWeight="900"
        fontSize="11px"
        color={total < 0 ? PAR_NEGATIVE : "text.primary"}
      >
        {total.toFixed(1)}
      </Text>
      {/* The track is clipped so the segments keep the rounded ends; the zero
          axis lives outside it, in this unclipped wrapper, so it can stand
          taller than the bar and read as an axis rather than a seam inside it. */}
      <Box position="relative" flex="1" minW={0} h="0.375rem">
        <Box position="absolute" inset={0} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
          <Flex position="absolute" top={0} bottom={0} style={{ left: `${scale.zeroPct}%`, width: `${posWidth}%` }}>
            {pos.map((s) => (
              <Segment key={s.key} seg={s} color={accent} />
            ))}
          </Flex>
          <Flex direction="row-reverse" position="absolute" top={0} bottom={0} style={{ right: `${100 - scale.zeroPct}%`, width: `${negWidth}%` }}>
            {neg.map((s) => (
              <Segment key={s.key} seg={s} color={PAR_NEGATIVE} />
            ))}
          </Flex>
        </Box>
        {/* Drawn only in a table that actually holds a negative. With everything
            positive — which is most tables — zero is the left edge and an axis
            there would be chrome marking nothing. */}
        {scale.hasNegative && (
          <Box
            position="absolute" top="-0.3rem" bottom="-0.3rem" w="2px" zIndex={1}
            bg="rgba(255,255,255,0.7)" borderRadius="full" pointerEvents="none"
            style={{ left: `calc(${scale.zeroPct}% - 1px)` }}
          />
        )}
      </Box>
    </Flex>
  );
};

/**
 * The PAR column for one roster table. Every bar in the table is drawn against a
 * single domain built from that table's own rows — the real [min, max], so zero
 * lands where the data puts it rather than at a reserved mark. Most tables have
 * no negative at all, and those get zero at the left edge and the whole track
 * for their positives.
 */
const segmentsFor = (entry, componentKey, label) => {
  if (!componentKey) return parSegments(entry);
  const v = entry?.components?.[componentKey];
  return typeof v === "number" && v !== 0 ? [{ key: componentKey, label, tier: 0, value: v }] : [];
};

export const parColumn = (rows, index, accent, label = "PAR", componentKey = null, bounds = null) => {
  const segmentsOf = new Map();
  const totalOf = new Map();
  let min = bounds?.min ?? 0;
  let max = bounds?.max ?? 0;

  rows.forEach((r) => {
    const entry = productionOf(index, r);
    // A unit table (passing, rushing, receiving) scores the player on THAT unit's
    // component alone — a QB's rushing production doesn't belong in the passing
    // table. The component is read straight off `components`; nothing is split here.
    const total = componentKey
      ? (typeof entry?.components?.[componentKey] === "number" ? entry.components[componentKey] : null)
      : entry?.total ?? null;
    const segs = segmentsFor(entry, componentKey, label);
    const rowKey = r.key ?? r.name;
    segmentsOf.set(rowKey, segs);
    totalOf.set(rowKey, total);
    const pos = segs.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const neg = segs.reduce((sum, s) => sum + Math.min(0, s.value), 0);
    if (pos > max) max = pos;
    if (neg < min) min = neg;
  });

  const scale = productionScale({ min, max });

  return {
    key: "par",
    label,
    flex: true,
    // Floor, not a target: the number gutter, its gap, and enough track left to
    // read a bar against. Everything past this is leftover the column absorbs.
    minPx: 116,
    render: (r) => (
      <ProductionBar total={totalOf.get(r.key ?? r.name) ?? null} segments={segmentsOf.get(r.key ?? r.name) ?? []} scale={scale} accent={accent} />
    ),
  };
};
