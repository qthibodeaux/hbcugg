import { Box, Flex, Text } from "@chakra-ui/react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, ScatterChart, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { passDefenseTeam } from "../../../../utils/passDefenseModel";
import { formatPassDefenseValue } from "../../../../utils/passDefenseConfig";
import { passDefenseAxis, passDefenseChartColor } from "../../../../utils/passDefensePresentation";
import { PassDefenseTooltip } from "./PassDefenseTooltip";

// Recharts positions the points. Team logos and abbreviations follow the
// existing Charts scatter markers; no hand-positioned chart engine.
const TeamPoint = ({ cx, cy, payload, pal, data }) => {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !payload?.sourceRow) return null;
  const team = passDefenseTeam(payload.sourceRow.id, data.metadata);
  const color = passDefenseChartColor(team.colors, pal.panel);
  const unranked = [payload.sourceRow.a, payload.sourceRow.b].some((m) => m.rank == null);
  return (
    <g opacity={unranked ? 0.65 : 1}>
      {team.logo ? <image href={team.logo} x={cx - 18} y={cy - 18} width={36} height={36} style={{ filter: `drop-shadow(0 2px 3px rgba(${pal.fg},0.2))` }} /> : <circle cx={cx} cy={cy} r={10} fill={color} />}
      <text x={cx} y={cy + 32} textAnchor="middle" fill={pal.ink} fontSize={14} fontWeight={900} stroke={pal.panel} strokeWidth={4} paintOrder="stroke">{team.short}{unranked ? " *" : ""}</text>
    </g>
  );
};

export const PassDefenseScatter = ({ view, data, pal }) => {
  const rows = view.rows.filter((r) => Number.isFinite(r.a?.value) && Number.isFinite(r.b?.value));
  const points = rows.map((r) => ({ x: r.a.value, y: r.b.value, sourceRow: r }));
  const x = passDefenseAxis(points.map((p) => p.x));
  const y = passDefenseAxis(points.map((p) => p.y));
  const shared = view.equalAxes ? passDefenseAxis(points.flatMap((p) => [p.x, p.y])) : null;
  const xAxis = shared ?? x, yAxis = shared ?? y;
  const missing = view.rows.filter((r) => !Number.isFinite(r.a?.value) || !Number.isFinite(r.b?.value));
  if (!points.length) return <Text py={10}>No paired published values for this selection.</Text>;
  return (
    <Box>
      <Flex justify="space-between" gap={4} mb={3}>
        <Text fontSize="16px" fontWeight="900" textTransform="uppercase">↑ {view.yLabel}</Text>
        <Text fontSize="14px" color={pal.orange} fontWeight="800">{view.equalAxes ? "Below diagonal = lower second-half rate" : "Lower left = fewer successes and big gains"}</Text>
      </Flex>
      <Box h="680px" bg={pal.panel}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 42, right: 60, left: 28, bottom: 45 }}>
            <CartesianGrid stroke={`rgba(${pal.fg},0.10)`} />
            <XAxis type="number" dataKey="x" domain={xAxis.domain} ticks={xAxis.ticks} tickFormatter={(v) => formatPassDefenseValue(v)} tick={{ fill: pal.ink, fontSize: 15 }} name={view.xLabel} height={40} />
            <YAxis type="number" dataKey="y" domain={yAxis.domain} ticks={yAxis.ticks} tickFormatter={(v) => formatPassDefenseValue(v)} tick={{ fill: pal.ink, fontSize: 15 }} name={view.yLabel} width={85} />
            {view.equalAxes && <ReferenceLine segment={[{ x: shared.domain[0], y: shared.domain[0] }, { x: shared.domain[1], y: shared.domain[1] }]} stroke={pal.brand} strokeDasharray="6 5" label={{ value: "Same rate in both halves", fill: pal.brand, fontSize: 13, position: "insideTopRight" }} />}
            <Tooltip content={<PassDefenseTooltip view={view} pal={pal} />} cursor={{ stroke: pal.brand, strokeDasharray: "3 3" }} />
            <Scatter data={points} shape={(props) => <TeamPoint {...props} pal={pal} data={data} />} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
      <Text textAlign="center" mt={2} fontSize="16px" fontWeight="900" textTransform="uppercase">{view.xLabel} →</Text>
      <Text fontSize="13px" mt={3}>Axes fitted to the published points. * At least one unranked sample; hover for both denominators and published ranks.</Text>
      {missing.length > 0 && <Text fontSize="13px" mt={2}>No paired values: {missing.map((r) => r.name).join(" · ")}. No point was placed at zero.</Text>}
    </Box>
  );
};
