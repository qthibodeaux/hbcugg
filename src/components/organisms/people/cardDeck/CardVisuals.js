import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { Kicker } from "./CardPrimitives";

const RadarViz = ({ viz, accent }) => {
  const R = 34;
  const CX = 50;
  const CY = 46;
  const pt = (i, scale) => {
    const angle = (-90 + i * (360 / viz.axes.length)) * (Math.PI / 180);
    return [CX + R * scale * Math.cos(angle), CY + R * scale * Math.sin(angle)];
  };
  const ring = (scale) => viz.axes.map((_, i) => pt(i, scale).join(",")).join(" ");
  const shape = viz.axes.map((a, i) => pt(i, Math.max(a.normalized, 0.02)).join(",")).join(" ");

  // Width-capped and centred. Without the cap the SVG stretches to whatever
  // the flex body gives it and the axis labels scale with it — which is what
  // made this render at poster size in the first pass.
  return (
    <Flex align="center" justify="center" w="100%" h="100%" minH="96px">
      <Box w="100%" maxW="150px">
        <svg viewBox="0 0 100 92" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
          {[0.33, 0.66, 1].map((s) => (
            <polygon key={s} points={ring(s)} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="0.6" />
          ))}
          {viz.axes.map((_, i) => {
            const [x, y] = pt(i, 1);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
          })}
          <polygon points={shape} fill={`${accent}59`} stroke={accent} strokeWidth="1.6" />
          {viz.axes.map((axis, i) => {
            const [x, y] = pt(i, 1.3);
            const live = axis.value > 1;
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6.5"
                fontWeight="800"
                fill={live ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)"}
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </Box>
    </Flex>
  );
};

const RankBarsViz = ({ viz, accent }) => {
  const max = Math.max(...viz.entries.map((e) => e.value), 1);
  return (
    <Flex align="flex-end" gap={1} h="100%" minH="76px">
      {viz.entries.slice(0, 5).map((entry, i) => (
        <Flex key={`${entry.last_name}-${i}`} direction="column" align="center" flex={1} minW={0} h="100%" justify="flex-end" gap={1}>
          <Text fontSize="9px" fontWeight="900" color={entry.is_subject ? "white" : "whiteAlpha.600"} fontVariantNumeric="tabular-nums">
            {entry.value}
          </Text>
          <Box
            w="100%"
            borderRadius="sm"
            bg={entry.is_subject ? accent : "whiteAlpha.200"}
            style={{ height: `${Math.max((entry.value / max) * 100, 6)}%` }}
          />
          <Text fontSize="8px" fontWeight="900" color={entry.is_subject ? "white" : "whiteAlpha.600"} lineClamp={1} maxW="100%" textAlign="center">
            {entry.last_name}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

const DonutViz = ({ viz, accent }) => {
  const C = 2 * Math.PI * 32;
  return (
    <Flex align="center" justify="center" h="100%" minH="84px">
      <Box position="relative" w="86px" h="86px">
        <svg viewBox="0 0 80 80" width="100%" height="100%">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${(viz.pct / 100) * C} ${C}`} transform="rotate(-90 40 40)"
          />
        </svg>
        <Flex position="absolute" inset={0} direction="column" align="center" justify="center">
          <Text fontSize="lg" fontWeight="900" fontStyle="italic" color="white" lineHeight={1}>{viz.pct}%</Text>
          <Text fontSize="7px" fontWeight="900" color="whiteAlpha.600" textTransform="uppercase">{viz.value}/{viz.total}</Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const FieldMapViz = ({ viz, accent }) => {
  const DEPTHS = ["deep", "medium", "short"];
  const DIRS = ["L", "M", "R"];
  const at = (d, dir) => viz.cells.find((c) => c.depth === d && c.direction === dir);
  const max = Math.max(...viz.cells.map((c) => c.yards), 1);
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="2px">
      {DEPTHS.flatMap((depth) =>
        DIRS.map((dir) => {
          const cell = at(depth, dir);
          const yards = cell?.yards ?? 0;
          const alpha = Math.round(40 + (yards / max) * 150).toString(16).padStart(2, "0");
          return (
            <Flex key={`${depth}-${dir}`} direction="column" align="center" justify="center" h="26px" borderRadius="sm"
              bg={yards > 0 ? `${accent}${alpha}` : "whiteAlpha.50"} border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="10px" fontWeight="900" color={yards > 0 ? "white" : "whiteAlpha.400"} lineHeight={1}>{yards}</Text>
            </Flex>
          );
        }),
      )}
    </Grid>
  );
};

const GameCurveViz = ({ viz, accent }) => {
  const values = viz.series.map((s) => s.value);
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const x = (i) => (i / (values.length - 1)) * 100;
  const y = (v) => 30 - ((v - min) / span) * 26;
  const hi = viz.highlight_index;
  return (
    <Box w="full" h="2.4rem">
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {hi >= 0 && (
          <>
            <line x1={x(hi)} y1={y(values[hi])} x2={x(hi)} y2="32" stroke={accent} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />
            <circle cx={x(hi)} cy={y(values[hi])} r="3.5" fill={accent} stroke="#0B0B0D" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </Box>
  );
};

const SplitViz = ({ viz, accent }) => {
  const total = viz.parts.reduce((s, p) => s + Math.max(0, p.value), 0) || 1;
  const tones = [accent, "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"];
  return (
    <Box>
      <Flex h="8px" borderRadius="full" overflow="hidden" bg="whiteAlpha.100">
        {viz.parts.map((p, i) => (
          <Box key={p.label} bg={tones[i] ?? tones[2]} style={{ width: `${(Math.max(0, p.value) / total) * 100}%` }} />
        ))}
      </Flex>
      <Flex gap={3} mt={1.5} wrap="wrap">
        {viz.parts.map((p, i) => (
          <Flex key={p.label} align="center" gap={1}>
            <Box w="6px" h="6px" borderRadius="sm" bg={tones[i] ?? tones[2]} flexShrink={0} />
            <Text fontSize="9px" fontWeight="900" color="white">{p.value}</Text>
            <Kicker>{p.label}</Kicker>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

const VIZ = { production_radar: RadarViz, rank_bars: RankBarsViz, donut: DonutViz, field_map_passing: FieldMapViz, game_curve: GameCurveViz, split: SplitViz };

export const Viz = ({ viz, accent }) => {
  const C = viz ? VIZ[viz.kind] : null;
  return C ? <C viz={viz} accent={accent} /> : null;
};
