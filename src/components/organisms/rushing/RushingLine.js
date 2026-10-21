import { PlotBox } from "./RushingMarker";
import { TEAM_BY_V5, ringOf, shortOfLabel } from "./rushingModel";

// The two tidbit charts from slide 8: a team's run success by week (MVSU, three
// points, each labelled with its opponent) and a team's EPA per carry by season
// (Jackson State, with a dashed zero line and a gap where 2020 has no fall
// season). Same plot frame and type as the other rushing charts.

export const LINE_W = 1000;
export const LINE_H = 560;
const PAD = { l: 84, r: 50, t: 60, b: 72 };

const niceRange = (lo, hi, step) => [Math.floor(lo / step) * step, Math.ceil(hi / step) * step];

export const RushingLine = ({ tidbit, teamId }) => {
  const color = ringOf(TEAM_BY_V5[teamId]);
  const bySeason = tidbit.series[0]?.season != null;
  const pts = tidbit.series.map((s) => (bySeason
    ? { x: s.season, y: s.epa_per_carry, top: `${s.epa_per_carry > 0 ? "+" : ""}${s.epa_per_carry.toFixed(2)}`, sub: null }
    : { x: s.week, y: s.success_rate, top: `${Math.round(s.success_rate)}%`, sub: `vs ${shortOfLabel(s.opponent)}` }));

  const left = PAD.l;
  const right = LINE_W - PAD.r;
  const top = PAD.t;
  const bottom = LINE_H - PAD.b;
  const xs = pts.map((p) => p.x);
  const xMin = Math.min(...xs) - 0.5;
  const xMax = Math.max(...xs) + 0.5;
  const step = bySeason ? 0.1 : 10;
  const [yMin, yMax] = niceRange(Math.min(...pts.map((p) => p.y), bySeason ? 0 : Infinity), Math.max(...pts.map((p) => p.y)) + step * 0.6, step);
  const px = (v) => left + ((v - xMin) / (xMax - xMin)) * (right - left);
  const py = (v) => top + (1 - (v - yMin) / (yMax - yMin)) * (bottom - top);
  const yTicks = [];
  for (let t = yMin; t <= yMax + 1e-9; t += step) yTicks.push(Number(t.toFixed(2)));
  const xTicks = bySeason ? [...Array(Math.max(...xs) - Math.min(...xs) + 1)].map((_, i) => Math.min(...xs) + i) : xs;
  const gap = bySeason ? xTicks.find((t) => !xs.includes(t)) : null;
  const yText = (t) => (bySeason ? (t > 0 ? `+${t.toFixed(1)}` : t.toFixed(1)) : `${t}%`);

  // The line breaks wherever a season is missing.
  const segments = [];
  pts.forEach((p, i) => {
    if (i && (!bySeason || p.x - pts[i - 1].x === 1)) segments[segments.length - 1].push(p);
    else segments.push([p]);
  });

  return (
    <PlotBox W={LINE_W} H={LINE_H}>
      <svg viewBox={`0 0 ${LINE_W} ${LINE_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label={tidbit.y}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={left} x2={right} y1={py(t)} y2={py(t)} stroke={bySeason && t === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.06)"} strokeDasharray={bySeason && t === 0 ? "7 6" : undefined} />
            <text x={left - 12} y={py(t) + 5} textAnchor="end" fontSize="15" fontWeight="800" fill="#A1A1AA">{yText(t)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={px(t)} y={bottom + 28} textAnchor="middle" fontSize="15" fontWeight="800" fill={t === gap ? "#71717A" : "#A1A1AA"}>{bySeason ? t : `Wk ${t}`}</text>
        ))}
        {gap != null && (
          <text x={px(gap)} y={(top + bottom) / 2} textAnchor="middle" fontSize="14" fontWeight="800" fill="#71717A">no 2020 fall season</text>
        )}
        <text x={left} y={top - 22} fontSize="17" fontWeight="900" fill="#F4F4F5">{tidbit.y} ↑</text>

        {segments.map((seg, i) => (
          <polyline key={i} points={seg.map((p) => `${px(p.x)},${py(p.y)}`).join(" ")} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {pts.map((p) => (
          <g key={p.x}>
            <circle cx={px(p.x)} cy={py(p.y)} r="9" fill={color} stroke="#0B0B0D" strokeWidth="3" />
            <text x={px(p.x)} y={py(p.y) - 22} textAnchor="middle" fontSize="18" fontWeight="900" fill="#F4F4F5" stroke="#0B0B0D" strokeWidth="4" paintOrder="stroke">{p.top}</text>
            {p.sub && <text x={px(p.x)} y={py(p.y) + 32} textAnchor="middle" fontSize="14" fontWeight="800" fill="#A1A1AA">{p.sub}</text>}
          </g>
        ))}
      </svg>
    </PlotBox>
  );
};

