import { lastName, QUADRANT_FILL, pct, QUADRANT_INK, TEAM_BY_V5, dotColors, inkFor } from "./qbMapPresentation";

// Shared page/export SVG plot, with existing label collision layout and backend axes/quadrants.

export const QbPlot = ({ data, players, hover, setHover, W, H, R = 14, s = 1, names = true }) => {
  const { axes, quadrants } = data;
  const PAD = { l: 58 * s, r: 18 * s, t: 44 * s, b: 52 * s };
  const left = PAD.l;
  const right = W - PAD.r;
  const top = PAD.t;
  const bottom = H - PAD.b;
  const px = (v) => left + ((v - axes.x.min) / (axes.x.max - axes.x.min)) * (right - left);
  const py = (v) => top + (1 - (v - axes.y.min) / (axes.y.max - axes.y.min)) * (bottom - top);
  const xm = px(axes.x_mid);
  const ym = py(axes.y_mid);
  const nameSize = 13 * s;
  const tick = 13 * s;

  // Label layout, once per render: boxes in plot space.
  const placed = (() => {
    const dots = players.map((p) => ({ x: px(p.success_rate), y: py(p.epa_per_dropback) }));
    const boxes = dots.map((d) => ({ x0: d.x - R, x1: d.x + R, y0: d.y - R, y1: d.y + R }));
    const hit = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const out = {};
    players
      .map((p, i) => ({ p, d: dots[i] }))
      .sort((a, b) => a.d.y - b.d.y)
      .forEach(({ p, d }) => {
        const w = lastName(p.name).length * nameSize * 0.62;
        const h = nameSize * 1.1;
        const gap = R + 6 * s;
        const tries = [
          { side: 1, dy: 0 }, { side: -1, dy: 0 },
          { side: 1, dy: h }, { side: -1, dy: h }, { side: 1, dy: -h }, { side: -1, dy: -h },
        ];
        const fits = (t) => {
          const x0 = t.side > 0 ? d.x + gap : d.x - gap - w;
          const b = { x0, x1: x0 + w, y0: d.y + t.dy - h / 2, y1: d.y + t.dy + h / 2 };
          return b.x0 >= left && b.x1 <= right && !hit(b) ? b : null;
        };
        let pick = null;
        let box = null;
        for (const t of tries) {
          box = fits(t);
          if (box) { pick = t; break; }
        }
        if (!pick) {
          pick = d.x > right - 120 * s ? { side: -1, dy: 0 } : { side: 1, dy: 0 };
          box = null;
        }
        if (box) boxes.push(box);
        out[p.player_id] = pick;
      });
    return out;
  })();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Quarterback map: EPA per dropback versus success rate">
      <rect x={left} y={top} width={xm - left} height={ym - top} fill={QUADRANT_FILL.top_left} />
      <rect x={xm} y={top} width={right - xm} height={ym - top} fill={QUADRANT_FILL.top_right} />
      <rect x={left} y={ym} width={xm - left} height={bottom - ym} fill={QUADRANT_FILL.bottom_left} />
      <rect x={xm} y={ym} width={right - xm} height={bottom - ym} fill={QUADRANT_FILL.bottom_right} />

      {axes.y.ticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={left} x2={right} y1={py(t)} y2={py(t)} stroke={Math.abs(t) < 1e-9 ? "rgba(var(--gg-fg), 0.22)" : "rgba(var(--gg-fg), 0.06)"} strokeWidth={s} />
          <text x={left - 10 * s} y={py(t) + tick * 0.35} textAnchor="end" fontSize={tick} fontWeight="800" fill="#A1A1AA">{t.toFixed(2)}</text>
        </g>
      ))}
      {axes.x.ticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={px(t)} x2={px(t)} y1={top} y2={bottom} stroke="rgba(var(--gg-fg), 0.06)" strokeWidth={s} />
          <text x={px(t)} y={bottom + tick * 1.7} textAnchor="middle" fontSize={tick} fontWeight="800" fill="#A1A1AA">{pct(t)}</text>
        </g>
      ))}

      {/* Median lines, labelled where they meet the frame. */}
      <line x1={xm} x2={xm} y1={top} y2={bottom} stroke="rgba(var(--gg-fg), 0.45)" strokeDasharray={`${5 * s} ${5 * s}`} strokeWidth={s} />
      <line x1={left} x2={right} y1={ym} y2={ym} stroke="rgba(var(--gg-fg), 0.45)" strokeDasharray={`${5 * s} ${5 * s}`} strokeWidth={s} />
      <text x={xm + 6 * s} y={bottom - 6 * s} fontSize={10 * s} fontWeight="900" fill="rgba(var(--gg-fg), 0.5)" letterSpacing={s}>MEDIAN</text>
      <text x={right - 4 * s} y={ym - 6 * s} textAnchor="end" fontSize={10 * s} fontWeight="900" fill="rgba(var(--gg-fg), 0.5)" letterSpacing={s}>MEDIAN</text>

      {[
        ["top_left", left + 10 * s, top + 20 * s, "start"],
        ["top_right", right - 10 * s, top + 20 * s, "end"],
        ["bottom_left", left + 10 * s, bottom - 34 * s, "start"],
        ["bottom_right", right - 10 * s, bottom - 34 * s, "end"],
      ].map(([k, x, y, anchor]) => {
        const [a, b] = (quadrants[k] || "").split(" · ");
        return (
          <text key={k} x={x} y={y} textAnchor={anchor} fontSize={13 * s} fill={QUADRANT_INK[k]}>
            <tspan x={x} fontWeight="900">{a}</tspan>
            {b && <tspan x={x} dy={16 * s} fontWeight="600" fillOpacity="0.8">{b}</tspan>}
          </text>
        );
      })}

      {/* Axis titles: the question each axis asks, in the corner it reads from. */}
      <text x={left} y={top - 14 * s} fontSize={16 * s} fontWeight="900" fill="#F4F4F5">{axes.y.label} ↑</text>
      <text x={right} y={H - 4 * s} textAnchor="end" fontSize={16 * s} fontWeight="900" fill="#F4F4F5">{axes.x.label} →</text>

      {players
        .slice()
        .sort((a, b) => (a.rank === hover) - (b.rank === hover))
        .map((p) => {
          const team = TEAM_BY_V5[p.team_id];
          const { fill, ring } = dotColors(team);
          const on = p.rank === hover;
          const cx = px(p.success_rate);
          const cy = py(p.epa_per_dropback);
          const lab = placed[p.player_id] ?? { side: 1, dy: 0 };
          const r = on ? R + 3 * s : R;
          return (
            <g
              key={p.player_id}
              transform={`translate(${cx} ${cy})`}
              onMouseEnter={setHover ? () => setHover(p.rank) : undefined}
              onMouseLeave={setHover ? () => setHover(null) : undefined}
              style={{ cursor: "default" }}
            >
              <circle r={r + 2 * s} fill="rgba(0,0,0,0.45)" />
              <circle r={r} fill={fill} stroke={on ? "var(--gg-ink)" : ring} strokeWidth={(on ? 2.5 : 2) * s} />
              <text textAnchor="middle" y={R * 0.32} fontSize={R * 0.88} fontWeight="900" fill={inkFor(fill)} pointerEvents="none">{p.rank}</text>
              {names && (
                <text
                  x={lab.side > 0 ? R + 6 * s : -(R + 6 * s)}
                  y={lab.dy + nameSize * 0.35}
                  textAnchor={lab.side > 0 ? "start" : "end"}
                  fontSize={nameSize}
                  fontWeight="900"
                  fill="#F4F4F5"
                  stroke="var(--gg-bg-primary)"
                  strokeWidth={3 * s}
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  {lastName(p.name)}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
};
