import { Box, Text } from "@chakra-ui/react";
import { BarChart, Bar, CartesianGrid, Cell, LabelList, Legend, LineChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { passDefenseAxis, passDefenseChartColor } from "../../../../utils/passDefensePresentation";
import { PassDefenseTooltip } from "./PassDefenseTooltip";
import { PassDefenseScatter } from "./PassDefenseScatter";
import { passDefenseTeam } from "../../../../utils/passDefenseModel";
import { formatPassDefenseValue } from "../../../../utils/passDefenseConfig";

const TeamTick = ({ x, y, payload, rows, data, pal, series }) => {
  const row = rows.find((r) => r.label === payload.value)?.sourceRow;
  if (!row) return null;
  const team = passDefenseTeam(row.teamId ?? row.id, data.metadata);
  const samples = series.map((s) => row[s.key]?.n ?? "—").join("/");
  return (
    <g transform={`translate(${x},${y})`}>
      {team.logo && <image href={team.logo} x={-34} y={-15} width={28} height={28} />}
      <text x={team.logo ? -43 : -8} y={-2} textAnchor="end" fill={pal.ink} fontSize={row.teamId ? 13 : 17} fontWeight={900}>{payload.value}</text>
      {samples !== "—" && <text x={team.logo ? -43 : -8} y={15} textAnchor="end" fill={`rgba(${pal.fg},0.58)`} fontSize={11}>n {samples}</text>}
    </g>
  );
};

export const PassDefenseChart = ({ view, data, pal }) => {
  if (view.kind === "scatter") return <PassDefenseScatter view={view} data={data} pal={pal} />;
  const available = view.rows.filter((row) => view.series.some((s) => Number.isFinite(row[s.key]?.value)));
  const missing = view.rows.filter((row) => !view.series.some((s) => Number.isFinite(row[s.key]?.value)));
  const ordered = view.kind === "line" ? view.rows : [...available].sort((a, b) => {
    const av = a[view.series[0].key]?.value, bv = b[view.series[0].key]?.value;
    if (!Number.isFinite(av)) return 1;
    if (!Number.isFinite(bv)) return -1;
    return view.better === "higher" ? bv - av : av - bv;
  });
  const chartRows = ordered.map((row) => {
    const unranked = view.kind !== "line" && view.series.some((s) => ["Unranked sample", "Unqualified sample"].includes(row[s.key]?.qualification) && Number.isFinite(row[s.key]?.value));
    const label = `${row.name}${unranked ? " *" : ""}`;
    return { label, sourceRow: row, ...Object.fromEntries(view.series.flatMap((s) => [
      [s.key, row[s.key]?.value ?? null],
      [`${s.key}Display`, Number.isFinite(row[s.key]?.value) ? formatPassDefenseValue(row[s.key].value, view.unit) : null],
    ])) };
  });
  const lineRows = chartRows.flatMap((row) => row.sourceRow.breakBefore ? [{ label: "No published point", a: null }, row] : [row]);
  if (!available.length) return <Text py={8}>No published values for this selection. Missing opportunities are not zero.</Text>;
  const grid = `rgba(${pal.fg},0.13)`;
  const axis = { fill: pal.ink, fontSize: 15 };
  const scale = passDefenseAxis(available.flatMap((row) => view.series.map((series) => row[series.key]?.value)), { unit: view.unit, zero: view.kind !== "line" });
  const format = (value) => formatPassDefenseValue(value, view.unit);
  const tooltip = <Tooltip content={<PassDefenseTooltip view={view} pal={pal} />} cursor={{ fill: `rgba(${pal.fg},0.04)` }} />;
  return (
    <Box>
      <Box h={view.kind === "line" ? "530px" : `${Math.max(280, chartRows.length * (view.series.length > 1 ? 70 : 43) + 80)}px`} minW={0}>
        <ResponsiveContainer width="100%" height="100%">
          {view.kind === "line" ? (
            <LineChart data={lineRows} margin={{ top: 15, right: 22, left: 20, bottom: 45 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={axis} interval={0} angle={-25} textAnchor="end" height={65} />
              <YAxis tick={axis} tickFormatter={format} domain={scale.domain} ticks={scale.ticks} width={78} />
              <ReferenceLine y={0} stroke={pal.ink} ifOverflow="extendDomain" />
              {tooltip}
              <Line type="linear" dataKey="a" name={view.series[0].label} stroke={passDefenseChartColor(passDefenseTeam(data.selectedTeamId, data.metadata).colors, pal.panel)} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          ) : (
            <BarChart layout="vertical" data={chartRows} margin={{ top: 15, right: 75, left: 6, bottom: 10 }} barGap={3}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={axis} tickFormatter={format} domain={scale.domain} ticks={scale.ticks} />
              <YAxis type="category" dataKey="label" tick={(props) => <TeamTick {...props} rows={chartRows} data={data} pal={pal} series={view.series} />} width={view.unit === "count" ? 285 : 180} interval={0} />
              <ReferenceLine x={0} stroke={pal.ink} ifOverflow="extendDomain" />
              {tooltip}
              {view.series.length > 1 && <Legend wrapperStyle={{ color: pal.ink, fontSize: 15 }} />}
              {view.series.map((item) => (
                <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color ?? pal.brand} maxBarSize={22} isAnimationActive={false}>
                  {!item.color && chartRows.map((row) => <Cell key={row.sourceRow.id} fill={passDefenseChartColor(passDefenseTeam(row.sourceRow.teamId ?? row.sourceRow.id, data.metadata).colors, pal.panel)} />)}
                  <LabelList dataKey={`${item.key}Display`} position="right" fill={pal.ink} fontSize={15} />
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
      {view.kind !== "line" && view.unit !== "count" && <Text fontSize="13px" mt={3}>n is each series' published sample, in legend order. * Unranked sample; sorting does not create a rank.</Text>}
      {view.unit === "count" && <Text fontSize="13px" mt={3}>* Unqualified catch-tackle sample. Counting totals have no official rank; their display order is not a ranking.</Text>}
      {missing.length > 0 && view.kind !== "line" && <Text fontSize="13px" mt={3}>Unavailable: {missing.map((r) => `${r.name} (${view.series.map((s) => r[s.key]?.state === "null" ? "published null" : "absent bucket/measure").join(" / ")})`).join("; ")}</Text>}
    </Box>
  );
};
