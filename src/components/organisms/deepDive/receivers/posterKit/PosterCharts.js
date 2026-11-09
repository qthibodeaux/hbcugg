import { fgOf, tab, POSTER_W, caps } from "../../gridPosterKit";
import { Box, Grid, Text, Image } from "@chakra-ui/react";
import { Head, Who } from "./PosterTables";
import { Fragment } from "react";
import { logoOf } from "../../deepDiveModel";

export const Dumbbell = ({ pal, rows, a, b, fmt, aLabel, bLabel, name = (r) => r.name, lowerBetter = false, rowH = 50, whoW = "330px" }) => {
  const fg = fgOf(pal);
  const vals = rows.flatMap((r) => [a(r), b(r)]).filter(Number.isFinite);
  const min = Math.min(...vals), max = Math.max(...vals);
  const at = (v) => ((v - min) / (max - min || 1)) * 100;
  const cols = `${whoW} 90px minmax(0,1fr) 90px`;
  return (
    <Box>
      <Grid templateColumns={cols} columnGap="16px" pb="8px" borderBottom={`1px solid ${fg(0.12)}`}>
        <Box /><Head pal={pal}>{aLabel}</Head><Box /><Head pal={pal} align="left">{bLabel}</Head>
      </Grid>
      {rows.map((r, i) => {
        const up = lowerBetter ? b(r) < a(r) : b(r) > a(r);
        const ink = up ? pal.up : pal.down;
        const la = at(a(r)), lb = at(b(r));
        return (
          <Grid key={i} templateColumns={cols} columnGap="16px" alignItems="center" h={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
            <Who pal={pal} id={r.id} name={name(r)} />
            <Text fontSize="19px" fontWeight="800" textAlign="right" color={fg(0.6)} {...tab}>{fmt(a(r))}</Text>
            <Box position="relative" h="22px" mx="11px">
              <Box position="absolute" left={0} right={0} top="10px" h="2px" bg={fg(0.08)} />
              <Box position="absolute" top="9px" h="4px" bg={ink} style={{ left: `${Math.min(la, lb)}%`, width: `${Math.abs(la - lb)}%` }} />
              <Box position="absolute" top="3px" w="16px" h="16px" ml="-8px" borderRadius="full" bg={pal.panel} border={`3px solid ${fg(0.45)}`} style={{ left: `${la}%` }} />
              <Box position="absolute" top="1px" w="20px" h="20px" ml="-10px" borderRadius="full" bg={ink} style={{ left: `${lb}%` }} />
            </Box>
            <Text fontSize="23px" fontWeight="950" color={ink} {...tab}>{fmt(b(r))}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

const placeLabels = (points, logo, charW = 10.6, h = 20) => {
  const boxes = points.map((p) => ({ x: p.px - logo / 2, y: p.py - logo / 2, w: logo, h: logo }));
  const hit = (b) => boxes.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  return points.map((p) => {
    if (!p.text) return null;
    const w = p.text.length * charW;
    const tries = [
      { x: p.px + logo / 2 + 4, y: p.py - h / 2 }, { x: p.px - logo / 2 - 4 - w, y: p.py - h / 2 },
      { x: p.px - w / 2, y: p.py - logo / 2 - h - 1 }, { x: p.px - w / 2, y: p.py + logo / 2 + 1 },
    ];
    const spot = tries.find((t) => !hit({ ...t, w, h })) ?? tries[0];
    boxes.push({ ...spot, w, h });
    return spot;
  });
};

export const Scatter = ({ pal, rows, x, y, xFmt, yFmt, xLabel, yLabel, label, logo = 42, h = 780, w }) => {
  const fg = fgOf(pal);
  const W = w ?? POSTER_W - 112 - 56, H = h, L = 70, B = 44, T = 26, R = 20;
  const xs = rows.map(x), ys = rows.map(y);
  const pad = (lo, hi) => { const d = (hi - lo || 1) * 0.07; return [lo - d, hi + d]; };
  const [x0, x1] = pad(Math.min(...xs), Math.max(...xs));
  const [y0, y1] = pad(Math.min(...ys), Math.max(...ys));
  const px = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const py = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const points = rows.map((r) => ({ r, px: px(x(r)), py: py(y(r)), text: label ? label(r) : null }));
  const spots = placeLabels(points, logo);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <Box position="relative" w={`${W}px`} h={`${H}px`}>
      {ticks.map((t) => {
        const vx = x0 + (x1 - x0) * t, vy = y0 + (y1 - y0) * t;
        const mid = t === 0.5;
        return (
          <Fragment key={t}>
            <Box position="absolute" top={`${T}px`} bottom={`${B}px`} w={mid ? "0" : "1px"} bg={mid ? "transparent" : fg(0.06)} borderLeft={mid ? `2px dashed ${fg(0.22)}` : undefined} style={{ left: px(vx) }} />
            <Box position="absolute" left={`${L}px`} right={`${R}px`} h={mid ? "0" : "1px"} bg={mid ? "transparent" : fg(0.06)} borderTop={mid ? `2px dashed ${fg(0.22)}` : undefined} style={{ top: py(vy) }} />
            <Text position="absolute" top={`${H - B + 8}px`} fontSize="15px" fontWeight="800" color={fg(0.5)} transform="translateX(-50%)" style={{ left: px(vx) }} {...tab}>{xFmt(vx)}</Text>
            <Text position="absolute" left="0" w={`${L - 10}px`} textAlign="right" fontSize="15px" fontWeight="800" color={fg(0.5)} transform="translateY(-50%)" style={{ top: py(vy) }} {...tab}>{yFmt(vy)}</Text>
          </Fragment>
        );
      })}
      <Text position="absolute" top="0" left={`${L}px`} fontSize="15px" color={pal.orange} {...caps}>{yLabel}</Text>
      <Text position="absolute" bottom="0" right={`${R}px`} fontSize="15px" color={pal.orange} {...caps}>{xLabel}</Text>
      {points.map((p, i) => <Image key={i} src={logoOf(p.r.id)} alt="" position="absolute" w={`${logo}px`} h={`${logo}px`} objectFit="contain" style={{ left: p.px - logo / 2, top: p.py - logo / 2 }} />)}
      {points.map((p, i) => spots[i] && <Text key={i} position="absolute" fontSize="17px" fontWeight="900" lineHeight="20px" whiteSpace="nowrap" textTransform="uppercase" style={{ left: spots[i].x, top: spots[i].y }}>{p.text}</Text>)}
    </Box>
  );
};

export const Line = ({ pal, rows, y, yFmt, xLabelOf, showValues = true, w = 1232, h = 300, bands, start = 0 }) => {
  const fg = fgOf(pal);
  const L = 56, R = 16, T = 26, B = 30;
  const ys = rows.map(y).filter(Number.isFinite);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  const d = (hi - lo || 1) * 0.12;
  const px = (i) => L + (i / Math.max(rows.length - 1, 1)) * (w - L - R);
  const py = (v) => T + (1 - (v - (lo - d)) / (hi - lo + 2 * d)) * (h - T - B);
  const path = rows.map((r, i) => (Number.isFinite(y(r)) ? `${i >= start && i > 0 && Number.isFinite(y(rows[i - 1])) ? "L" : "M"}${px(i).toFixed(1)},${py(y(r)).toFixed(1)}` : "")).join(" ");
  return (
    <Box position="relative" w={`${w}px`} h={`${h}px`}>
      {(bands ?? []).map((b, i) => (
        <Fragment key={b.label}>
          {i % 2 === 0 && <Box position="absolute" top={`${T}px`} bottom={`${B}px`} bg={fg(0.04)} style={{ left: px(b.from), width: px(b.to) - px(b.from) }} />}
          <Text position="absolute" bottom="4px" fontSize="16px" fontWeight="900" color={fg(0.55)} textAlign="center" style={{ left: px(b.from), width: px(b.to) - px(b.from) }} {...tab}>{b.label}</Text>
        </Fragment>
      ))}
      {[lo, (lo + hi) / 2, hi].map((v) => (
        <Fragment key={v}>
          <Box position="absolute" left={`${L}px`} right={`${R}px`} h="1px" bg={fg(0.08)} style={{ top: py(v) }} />
          <Text position="absolute" left="0" w={`${L - 8}px`} textAlign="right" fontSize="14px" fontWeight="800" color={fg(0.5)} transform="translateY(-50%)" style={{ top: py(v) }} {...tab}>{yFmt(v)}</Text>
        </Fragment>
      ))}
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={path} fill="none" stroke={pal.brand} strokeWidth={showValues ? 4 : 3} strokeLinejoin="round" />
        {showValues && rows.map((r, i) => Number.isFinite(y(r)) && <circle key={i} cx={px(i)} cy={py(y(r))} r="6" fill={pal.brand} />)}
      </svg>
      {showValues && rows.map((r, i) => Number.isFinite(y(r)) && (
        <Text key={i} position="absolute" fontSize="17px" fontWeight="950" color={pal.orange} transform="translateX(-50%)" style={{ left: px(i), top: py(y(r)) - 27 }} {...tab}>{yFmt(y(r))}</Text>
      ))}
      {xLabelOf && rows.map((r, i) => (
        <Text key={i} position="absolute" bottom="4px" fontSize="16px" fontWeight="900" color={fg(0.55)} transform="translateX(-50%)" style={{ left: px(i) }} {...tab}>{xLabelOf(r)}</Text>
      ))}
    </Box>
  );
};
