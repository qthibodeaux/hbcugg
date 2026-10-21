import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { PlotBox, RushingMarker } from "./RushingMarker";
import { DATA, EXTRAS, TEAM_BY_V5, lastName, ringOf, shortOf, tickText, ticksFor } from "./rushingModel";

// Scatter and bubble: slides 1-5 and 7. One component, driven by the chart
// object — axes with min/max/reference lines, quadrant corner labels, a y = x
// diagonal, a reversed x axis, coloured quadrants, an off-chart strip,
// highlighted points at full colour with a label and the rest muted.
// Points are the team mark, or a player's face (`srcsFor`) when it has one.

export const PLOT_W = 1000;
export const PLOT_H = 720;
const PAD = { l: 74, r: 34, t: 58, b: 72 };
const GREY = "rgba(255,255,255,0.42)";
// Each quadrant its own colour: a light wash, and the corner label in the same hue.
const QUAD = {
  top_left: { fill: "rgba(214,190,120,0.09)", ink: "#D6BE78" },
  top_right: { fill: "rgba(72,187,120,0.11)", ink: "#68D391" },
  bottom_left: { fill: "rgba(229,62,62,0.10)", ink: "#FC8181" },
  bottom_right: { fill: "rgba(99,130,190,0.10)", ink: "#93A9D6" },
};
const LABEL_SIZE = 15;

const valueText = (axis, v) => (v == null ? "—" : axis?.format === "percent" ? `${Number(v).toFixed(1)}%` : Number(v).toFixed(2));

export const RushingPlot = ({ id, chart, hover = null, setHover = null, srcsFor = () => [] }) => {
  const { x: ax, y: ay } = chart;
  const left = PAD.l;
  const right = PLOT_W - PAD.r;
  const top = PAD.t;
  const bottom = PLOT_H - PAD.b;
  const flip = !!chart.x_reversed;
  const px = (v) => (flip ? right - ((v - ax.min) / (ax.max - ax.min)) * (right - left) : left + ((v - ax.min) / (ax.max - ax.min)) * (right - left));
  const py = (v) => top + (1 - (v - ay.min) / (ay.max - ay.min)) * (bottom - top);
  const bubble = chart.type === "bubble";

  const carries = (chart.points || []).map((p) => p.carries).filter((c) => c != null);
  const cMin = Math.min(...carries, 0);
  const cMax = Math.max(...carries, 1);
  const radius = (p) => (bubble ? 17 + 17 * Math.sqrt(Math.max(0, (p.carries - cMin) / ((cMax - cMin) || 1))) : 20);

  const pts = (chart.points || []).map((p) => ({
    ...p,
    key: p.player_id ?? p.team_id,
    team: TEAM_BY_V5[p.team_id],
    name: p.player_name ?? p.name,
    short: p.player_name ? lastName(p.player_name) : shortOf(p.team_id),
    cx: px(p.x),
    cy: py(p.y),
    r: radius(p),
  }));
  const anyHighlight = pts.some((p) => p.highlight);
  const labelled = (p) => id === "power_and_stuffs" || !anyHighlight || p.highlight;
  const dimmed = (p) => anyHighlight && !p.highlight;
  const labelText = (p) => (id === "power_and_stuffs" ? p.power : p.short);

  // Labels go right of the marker, else left, else a step up or down — whichever
  // is the first spot that stays in the frame and off every marker and label.
  const placed = (() => {
    const boxes = pts.map((p) => ({ x0: p.cx - p.r, x1: p.cx + p.r, y0: p.cy - p.r, y1: p.cy + p.r }));
    const hit = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const out = {};
    pts.filter(labelled).sort((a, b) => a.cy - b.cy).forEach((p) => {
      const w = String(labelText(p) ?? "").length * LABEL_SIZE * 0.62;
      const h = LABEL_SIZE * 1.15;
      const gap = p.r + 7;
      const tries = [{ side: 1, dy: 0 }, { side: -1, dy: 0 }, { side: 1, dy: h }, { side: -1, dy: h }, { side: 1, dy: -h }, { side: -1, dy: -h }];
      let pick = null;
      for (const t of tries) {
        const x0 = t.side > 0 ? p.cx + gap : p.cx - gap - w;
        const b = { x0, x1: x0 + w, y0: p.cy + t.dy - h / 2, y1: p.cy + t.dy + h / 2 };
        if (b.x0 >= left && b.x1 <= right && !hit(b)) { boxes.push(b); pick = t; break; }
      }
      out[p.key] = pick ?? (p.cx > right - 140 ? { side: -1, dy: 0 } : { side: 1, dy: 0 });
    });
    return out;
  })();

  const xRef = ax.reference;
  const yRef = ay.reference;
  const xTicks = ticksFor(ax.min, ax.max);
  const yTicks = ticksFor(ay.min, ay.max);

  // y = x, across the part of both ranges the axes share.
  const dLo = Math.max(ax.min, ay.min);
  const dHi = Math.min(ax.max, ay.max);

  // Quadrants split at the reference lines (the frame's middle where an axis has none).
  const qx = xRef ? px(xRef.value) : (left + right) / 2;
  const qy = yRef ? py(yRef.value) : (top + bottom) / 2;

  const hovered = hover ? pts.find((p) => p.key === hover) : null;
  const extras = EXTRAS[id] ?? [];

  return (
    <Box>
      <PlotBox W={PLOT_W} H={PLOT_H}>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label={`${ay.label} versus ${ax.label}`}>

          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={left} x2={right} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,0.06)" />
              <text x={left - 12} y={py(t) + 5} textAnchor="end" fontSize="15" fontWeight="800" fill="#A1A1AA">{tickText(ay)(t)}</text>
            </g>
          ))}
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={px(t)} x2={px(t)} y1={top} y2={bottom} stroke="rgba(255,255,255,0.06)" />
              <text x={px(t)} y={bottom + 26} textAnchor="middle" fontSize="15" fontWeight="800" fill="#A1A1AA">{tickText(ax)(t)}</text>
            </g>
          ))}
          {chart.quadrants && (
            <g>
              <rect x={left} y={top} width={qx - left} height={qy - top} fill={QUAD.top_left.fill} />
              <rect x={qx} y={top} width={right - qx} height={qy - top} fill={QUAD.top_right.fill} />
              <rect x={left} y={qy} width={qx - left} height={bottom - qy} fill={QUAD.bottom_left.fill} />
              <rect x={qx} y={qy} width={right - qx} height={bottom - qy} fill={QUAD.bottom_right.fill} />
            </g>
          )}
          <rect x={left} y={top} width={right - left} height={bottom - top} fill="none" stroke="rgba(255,255,255,0.14)" />

          {chart.quadrants && [
            ["top_left", left + 12, top + 24, "start"],
            ["top_right", right - 12, top + 24, "end"],
            ["bottom_left", left + 12, bottom - 14, "start"],
            ["bottom_right", right - 12, bottom - 14, "end"],
          ].map(([k, lx, ly, anchor]) => (chart.quadrants[k] ? <text key={k} x={lx} y={ly} textAnchor={anchor} fontSize="14" fontWeight="900" fill={QUAD[k].ink}>{chart.quadrants[k]}</text> : null))}

          {xRef && (
            <g>
              <line x1={px(xRef.value)} x2={px(xRef.value)} y1={top} y2={bottom} stroke="rgba(255,255,255,0.5)" strokeDasharray="6 6" />
              <text x={px(xRef.value) + 7} y={bottom - 8} fontSize="12" fontWeight="900" letterSpacing="1" fill="rgba(255,255,255,0.55)">{xRef.label.toUpperCase()}</text>
            </g>
          )}
          {yRef && (
            <g>
              <line x1={left} x2={right} y1={py(yRef.value)} y2={py(yRef.value)} stroke="rgba(255,255,255,0.5)" strokeDasharray="6 6" />
              <text x={right - 6} y={py(yRef.value) - 7} textAnchor="end" fontSize="12" fontWeight="900" letterSpacing="1" fill="rgba(255,255,255,0.55)">{yRef.label.toUpperCase()}</text>
            </g>
          )}

          {chart.diagonal && dHi > dLo && (
            <g>
              <line x1={px(dLo)} y1={py(dLo)} x2={px(dHi)} y2={py(dHi)} stroke="rgba(255,255,255,0.4)" strokeDasharray="8 6" strokeWidth="1.5" />
              <text x={right - 12} y={bottom - 40} textAnchor="end" fontSize="14" fontWeight="800" fill={GREY}>{chart.diagonal.label}</text>
            </g>
          )}


          <text x={left} y={top - 20} fontSize="17" fontWeight="900" fill="#F4F4F5">{ay.label} ↑</text>
          <text x={right} y={PLOT_H - 8} textAnchor="end" fontSize="17" fontWeight="900" fill="#F4F4F5">{ax.label} →</text>

          {pts.filter(labelled).map((p) => {
            const lab = placed[p.key] ?? { side: 1, dy: 0 };
            return (
              <text
                key={`l${p.key}`}
                x={lab.side > 0 ? p.cx + p.r + 7 : p.cx - p.r - 7}
                y={p.cy + lab.dy + LABEL_SIZE * 0.35}
                textAnchor={lab.side > 0 ? "start" : "end"}
                fontSize={LABEL_SIZE}
                fontWeight="900"
                fill="#F4F4F5"
                stroke="#0B0B0D"
                strokeWidth="4"
                paintOrder="stroke"
                opacity={dimmed(p) ? 0.55 : 1}
              >
                {labelText(p)}
              </text>
            );
          })}
        </svg>

        {pts.map((p) => (
          <RushingMarker
            key={p.key}
            x={(p.cx / PLOT_W) * 100}
            y={(p.cy / PLOT_H) * 100}
            d={(p.r * 2 / PLOT_W) * 100}
            team={p.team}
            srcs={srcsFor(p)}
            dim={dimmed(p)}
            active={hover === p.key}
            tag={p.position === "QB" ? "QB" : null}
            onEnter={setHover ? () => setHover(p.key) : undefined}
            onLeave={setHover ? () => setHover(null) : undefined}
          />
        ))}

        {hovered && (
          <Box position="absolute" top={3} right={3} zIndex={8} bg="bg.primary" border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" px={3} py={2} pointerEvents="none">
            <Text fontSize="sm" fontWeight="900" color="text.primary">{hovered.name}</Text>
            <Text fontSize="xs" color="text.secondary" mt={1}>{ax.label}: {valueText(ax, hovered.x)}</Text>
            <Text fontSize="xs" color="text.secondary">{ay.label}: {valueText(ay, hovered.y)}</Text>
            {extras.map(([k, label, fmt]) => (hovered[k] != null ? <Text key={k} fontSize="xs" color="text.secondary">{label}: {fmt(hovered[k])}</Text> : null))}
          </Box>
        )}
      </PlotBox>

      {chart.off_chart?.length > 0 && (
        <Flex wrap="wrap" gap={5} mt={3} px={2}>
          {chart.off_chart.map((o) => {
            const n = parseInt(o.power, 10);
            const team = TEAM_BY_V5[o.team_id];
            return (
              <Flex key={o.team_id} align="center" gap={2}>
                {team?.logo && <Image src={team.logo} alt="" boxSize="1.4rem" objectFit="contain" />}
                <Text fontSize="sm" fontWeight="800" style={{ color: ringOf(team) }}>{shortOf(o.team_id)}</Text>
                <Text fontSize="sm" fontWeight="700" color="text.secondary">· {Math.round(o.stuff_rate)}% stuffed · {n} power run{n === 1 ? "" : "s"}</Text>
              </Flex>
            );
          })}
        </Flex>
      )}
    </Box>
  );
};
