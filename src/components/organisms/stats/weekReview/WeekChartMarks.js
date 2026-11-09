import { OVERSTATED, net } from "./weekReviewPresentation";
import { Box, Text } from "@chakra-ui/react";

// Chart bars, winner/loser logo placement and tooltip presentation.

export const BarShape = (props) => {
  const { x, y, width, height, payload, onSelect } = props;
  if (!payload) return null;

  const { winner, loser, edge, provisional, route } = payload;
  // Logos track bar width so nine games stay legible without nine games'
  // worth of overlap, and one game doesn't get a comically large crest.
  const size = Math.max(16, Math.min(64, width * 0.65));
  const cx = x + width / 2;
  const up = edge >= 0;

  // Recharts reports a negative bar as either (y = zero line, height > 0) or
  // (y = value, height < 0) depending on version and axis setup. Deriving the
  // edges instead of trusting either convention is what stops a downward bar
  // collapsing to a 1px line — which is exactly what it did before.
  const top = Math.min(y, y + height);
  const h = Math.max(Math.abs(height), 2);
  const bottom = top + h;

  return (
    <g
      onClick={route ? () => onSelect(route) : undefined}
      style={{ cursor: route ? "pointer" : "default" }}
    >
      {/* The bar always carries the WINNING team's colour — that is the one
          identity a reader should be able to take from the chart at a glance,
          whichever side of the line the bar falls on. */}
      <rect
        x={x}
        y={top}
        width={width}
        height={h}
        rx={2}
        fill={provisional ? "transparent" : payload.fill}
        stroke={payload.fill}
        strokeWidth={provisional ? 1 : 0.5}
        strokeDasharray={provisional ? "3 2" : undefined}
        opacity={0.92}
      />

      {/* Value, just outside the bar's outer end */}
      <text
        x={cx}
        y={up ? top - size / 2 - 5 : bottom + size / 2 + 12}
        textAnchor="middle"
        fontSize={10}
        fontWeight={900}
        fill={up ? "rgba(var(--gg-fg), 0.75)" : OVERSTATED}
      >
        {net(edge)}
      </text>

      {/* Loser on the baseline, winner on the far end. `up` decides which
          physical edge each of those is. */}
      {winner.logo && (
        <image
          href={winner.logo}
          x={cx - size / 2}
          y={(up ? top : bottom) - size / 2}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {loser.logo && (
        <image
          href={loser.logo}
          x={cx - size * 0.38}
          y={(up ? bottom : top) - size * 0.38}
          width={size * 0.76}
          height={size * 0.76}
          opacity={0.55}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </g>
  );
};

export const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const up = d.edge >= 0;
  return (
    <Box bg="bg.raised" border="1px solid" borderColor="line.strong" borderRadius="md" px={3} py={2} boxShadow="0 0.5rem 1.5rem rgba(0,0,0,0.5)">
      <Text fontSize="11px" fontWeight="900" color="var(--gg-ink)">
        {d.winner.short} {d.winner.score}, {d.loser.short} {d.loser.score}
      </Text>
      <Text fontSize="10px" color={up ? "text.secondary" : OVERSTATED} mt={0.5}>
        {d.winner.short} {net(d.edge)} net success rate vs {d.loser.short} · {up ? "scoreboard and play agree" : `${d.loser.short} out-played the winner`}
      </Text>
      {d.provisional && <Text fontSize="9px" color="text.muted" mt={1}>Provisional score — no parsed game yet</Text>}
    </Box>
  );
};
