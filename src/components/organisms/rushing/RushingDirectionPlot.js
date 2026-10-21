import { PlotBox, RushingMarker } from "./RushingMarker";
import { TEAM_BY_V5, inkOn, ringOf, shortOf, tickText, ticksFor } from "./rushingModel";

// Slide 6, run direction: one row per team, three dots (L, M, R) placed at that
// direction's success rate and sized by its share of the team's runs. A dot is
// hollow when the direction has fewer than 20 carries. Rows are ordered by the
// gap between a team's best and worst direction; highlighted teams in full
// colour, the rest muted.

export const DIR_W = 1000;
export const DIR_H = 740;
const PAD = { l: 150, r: 40, t: 56, b: 52 };
const LETTER = { left: "L", middle: "M", right: "R" };

const gapOf = (row) => {
  const pool = row.directions.filter((d) => d.enough);
  const use = pool.length >= 2 ? pool : row.directions;
  const rates = use.map((d) => d.success_rate);
  return Math.max(...rates) - Math.min(...rates);
};

export const RushingDirectionPlot = ({ chart }) => {
  const rows = [...chart.rows_data].sort((a, b) => gapOf(b) - gapOf(a));
  const { x: ax } = chart;
  const left = PAD.l;
  const right = DIR_W - PAD.r;
  const top = PAD.t;
  const bottom = DIR_H - PAD.b;
  const rowH = (bottom - top) / rows.length;
  const px = (v) => left + ((v - ax.min) / (ax.max - ax.min)) * (right - left);
  const rowY = (i) => top + rowH * i + rowH / 2;
  const radius = (share) => 7 + Math.sqrt(share / 100) * 20;
  const anyHighlight = rows.some((r) => r.highlight);

  return (
    <PlotBox W={DIR_W} H={DIR_H}>
      <svg viewBox={`0 0 ${DIR_W} ${DIR_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label="Run success rate by direction, per team">
        {ticksFor(ax.min, ax.max).map((t) => (
          <g key={t}>
            <line x1={px(t)} x2={px(t)} y1={top} y2={bottom} stroke="rgba(255,255,255,0.06)" />
            <text x={px(t)} y={bottom + 26} textAnchor="middle" fontSize="15" fontWeight="800" fill="#A1A1AA">{tickText(ax)(t)}</text>
          </g>
        ))}
        <text x={right} y={DIR_H - 8} textAnchor="end" fontSize="17" fontWeight="900" fill="#F4F4F5">{ax.label} →</text>

        {rows.map((r, i) => {
          const team = TEAM_BY_V5[r.team_id];
          const color = ringOf(team);
          const dim = anyHighlight && !r.highlight;
          const y = rowY(i);
          const xs = r.directions.map((d) => px(d.success_rate));
          return (
            <g key={r.team_id} opacity={dim ? 0.38 : 1}>
              {i % 2 === 0 && <rect x={0} y={y - rowH / 2} width={DIR_W} height={rowH} fill="rgba(255,255,255,0.025)" />}
              <text x={left - 62} y={y + 6} fontSize="17" fontWeight="900" fill="#F4F4F5">{shortOf(r.team_id)}</text>
              <line x1={Math.min(...xs)} x2={Math.max(...xs)} y1={y} y2={y} stroke={color} strokeOpacity="0.5" strokeWidth="3" />
              {r.directions.map((d) => {
                const rad = radius(d.share);
                const cx = px(d.success_rate);
                return (
                  <g key={d.direction}>
                    <circle cx={cx} cy={y} r={rad} fill={d.enough ? color : "#0B0B0D"} stroke={color} strokeWidth="3" />
                    <text x={cx} y={y + 6} textAnchor="middle" fontSize={Math.max(13, rad * 0.9)} fontWeight="900" fill={d.enough ? inkOn(color) : color}>{LETTER[d.direction]}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {rows.map((r, i) => (
        <RushingMarker key={`m${r.team_id}`} x={((left - 100) / DIR_W) * 100} y={(rowY(i) / DIR_H) * 100} d={3.4} team={TEAM_BY_V5[r.team_id]} dim={anyHighlight && !r.highlight} />
      ))}
    </PlotBox>
  );
};
