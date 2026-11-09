import { Box, Flex } from "@chakra-ui/react";
import { BRAND, TileMobile, Empty, Body, Rotator, TileTitle, WideRow, WideLabel, Micro, Context } from "./TilePrimitives";
import { useContext, useState, useMemo } from "react";
import { availablePresets, scatterSeries } from "../../../../pages/analytics/scatterPresets";

const ScatterPlot = ({ points, avgX, avgY, preset }) => {
  const PAD = 12;
  const span = (vals) => {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const m = (hi - lo) * 0.16 || 0.01;
    return [lo - m, hi + m];
  };
  const [x0, x1] = span(points.map((p) => p.x));
  const [y0, y1] = span(points.map((p) => p.y));
  // Same flips as the Scatter tab, so better reads right / up here too.
  const fx = (t) => (preset?.flip?.x ? 1 - t : t);
  const fy = (t) => (preset?.flip?.y ? 1 - t : t);
  const px = (v) => PAD + fx((v - x0) / (x1 - x0)) * (100 - PAD * 2);
  const py = (v) => 100 - PAD - fy((v - y0) / (y1 - y0)) * (100 - PAD * 2);
  // The dot furthest from the league average, in normalised units — the one
  // the chart is really about.
  const outlier = points.reduce((best, p) => {
    const d = ((p.x - avgX) / (x1 - x0)) ** 2 + ((p.y - avgY) / (y1 - y0)) ** 2;
    return best == null || d > best.d ? { p, d } : best;
  }, null)?.p;

  return (
    <Box w="100%" flex={1} minH={0}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: "block" }}>
        {/* crosshair = league average */}
        <line x1={px(avgX)} y1={PAD * 0.4} x2={px(avgX)} y2={100 - PAD * 0.6} stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <line x1={PAD * 0.4} y1={py(avgY)} x2={100 - PAD * 0.4} y2={py(avgY)} stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        {points.map((p) =>
          p === outlier ? null : (
            <circle key={p.id} cx={px(p.x)} cy={py(p.y)} r="2.6" fill="#3F3F46" />
          ),
        )}
        {outlier && (
          <g>
            <circle cx={px(outlier.x)} cy={py(outlier.y)} r="11" fill="rgba(10,10,12,0.75)" stroke={outlier.color ?? BRAND} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            {outlier.logo ? (
              <image href={outlier.logo} x={px(outlier.x) - 8} y={py(outlier.y) - 8} width="16" height="16" preserveAspectRatio="xMidYMid meet" />
            ) : (
              <text x={px(outlier.x)} y={py(outlier.y) + 2.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">{outlier.short}</text>
            )}
          </g>
        )}
      </svg>
    </Box>
  );
};

export const MapBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const [i, setI] = useState(0);
  const presets = useMemo(() => availablePresets(hub, season), [hub, season]);
  const preset = presets[i % Math.max(presets.length, 1)];
  const chart = useMemo(() => (preset ? scatterSeries(hub, season, preset.x, preset.y, preset.id) : { points: [] }), [hub, season, preset]);
  if (!chart.points.length) return <Empty>No season on file</Empty>;
  return (
    <Body
      cycle={i}
      live={presets.length > 1}
      top={
        <>
          <Rotator count={presets.length} onTick={() => setI((v) => (v + 1) % presets.length)} />
          <TileTitle>Charts</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.6rem">
          <Box w="4rem" h="3.9rem" flexShrink={0} display="flex"><ScatterPlot {...chart} /></Box>
          <WideLabel color="white" fontSize="0.85rem" lineClamp={2}>{preset.label}</WideLabel>
        </WideRow>
      ) : (
      <Flex direction="column" flex={1} minH={0} minW={0} gap="1cqmin">
        {!mobile && <Micro size={2.1} textAlign="center">↑ {chart.y.label}</Micro>}
        <ScatterPlot {...chart} />
        {!mobile && <Micro size={2.1} textAlign="center">{chart.x.label} →</Micro>}
        {!mobile && <Context mt="0.8cqmin" textAlign="center">{preset.label}</Context>}
      </Flex>
      )}
    </Body>
  );
};
