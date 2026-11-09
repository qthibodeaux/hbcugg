import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { spread } from "./groupNewFaces";
import { Logo, Who, caps, fgOf, lastName, logoOf, tab, teamShortName } from "./kit";

// ─────────────────────────────────────────────────────────────────────────────
// The chart types the infographics mix, so no two pages read alike: a filled hero panel, a
// waffle, vertical columns, a butterfly, rings, stacked team bars, a heat matrix, a mini slope,
// a win chance ladder, a height ladder and a field drawn from above. Colors are raw (they sit in
// SVG and in exports).
// ─────────────────────────────────────────────────────────────────────────────

// A panel filled with a strong color. `tone`: "brand" (purple), "ink" (inverted page) or any { fill, ink }.
export const Hero = ({ pal, tone = "brand", kicker, children, ...rest }) => {
  const c = tone === "brand" ? { fill: pal.brand, ink: "#FFFFFF" } : tone === "ink" ? { fill: pal.ink, ink: pal.bg } : tone;
  return (
    <Flex direction="column" px="26px" py="24px" minW={0} style={{ background: c.fill, color: c.ink }} {...rest}>
      {kicker && <Text fontSize="15px" opacity={0.8} mb="10px" {...caps}>{kicker}</Text>}
      {children}
    </Flex>
  );
};

export const Giant = ({ children, size = 120, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="950" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" whiteSpace="nowrap" {...tab} {...rest}>{children}</Text>
);

// 100 squares, `share` of them filled.
export const Waffle = ({ share, on, off, size = 26, gap = 4 }) => {
  const filled = Math.round(share * 100);
  return (
    <Grid templateColumns={`repeat(10, ${size}px)`} gap={`${gap}px`} w="fit-content">
      {Array.from({ length: 100 }, (_, i) => <Box key={i} h={`${size}px`} style={{ background: i < filled ? on : off }} />)}
    </Grid>
  );
};

// Vertical columns, a logo under each.
export const Columns = ({ pal, rows, get, fmt, h = 240, logo = 34, sub }) => {
  const fg = fgOf(pal);
  const max = Math.max(...rows.map(get), 0.0001);
  return (
    <Flex align="flex-end" gap="6px">
      {rows.map((r, i) => (
        <Flex key={i} direction="column" align="center" flex={1} minW={0}>
          <Text fontSize="16px" fontWeight="950" color={pal.orange} mb="4px" whiteSpace="nowrap" {...tab}>{fmt(get(r))}</Text>
          <Box w="100%" bg={i === 0 ? pal.brand : fg(0.22)} style={{ height: Math.max(3, (get(r) / max) * h) }} />
          <Box mt="8px"><Logo id={r.id} size={logo} /></Box>
          {sub && <Text mt="4px" fontSize="12px" fontWeight="900" textTransform="uppercase" textAlign="center" lineHeight={1.05} whiteSpace="nowrap">{sub(r)}</Text>}
        </Flex>
      ))}
    </Flex>
  );
};

// Two lists growing out from the middle: left falls, right rises.
export const Butterfly = ({ pal, left, right, get, fmt, rowH = 50 }) => {
  const fg = fgOf(pal);
  const max = Math.max(...[...left, ...right].map((r) => Math.abs(get(r))));
  const n = Math.max(left.length, right.length);
  return (
    <Box>
      {Array.from({ length: n }, (_, i) => {
        const l = left[i], r = right[i];
        return (
          <Grid key={i} templateColumns="minmax(0,1fr) 2px minmax(0,1fr)" alignItems="center" h={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
            <Grid templateColumns="190px 56px minmax(0,1fr)" columnGap="8px" alignItems="center">
              {l ? <Who pal={pal} id={l.id} name={l.name} size={26} font="15px" /> : <Box />}
              {l ? <Text fontSize="18px" fontWeight="950" color={pal.down} textAlign="right" {...tab}>{fmt(get(l))}</Text> : <Box />}
              <Flex justify="flex-end">{l && <Box h="22px" bg={pal.down} style={{ width: `${(Math.abs(get(l)) / max) * 100}%` }} />}</Flex>
            </Grid>
            <Box h="100%" bg={fg(0.3)} />
            <Grid templateColumns="minmax(0,1fr) 56px 190px" columnGap="8px" alignItems="center">
              <Flex>{r && <Box h="22px" bg={pal.up} style={{ width: `${(Math.abs(get(r)) / max) * 100}%` }} />}</Flex>
              {r ? <Text fontSize="18px" fontWeight="950" color={pal.up} {...tab}>{fmt(get(r))}</Text> : <Box />}
              {r ? <Who pal={pal} id={r.id} name={r.name} size={26} font="15px" /> : <Box />}
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
};

// A ring filled to `share`, its number in the middle.
export const Ring = ({ share, color, track, size = 150, width = 18, label, labelSize = 36, ink }) => {
  const r = (size - width) / 2, c = 2 * Math.PI * r;
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={width} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={width} strokeDasharray={`${c * share} ${c}`} />
      </svg>
      <Flex position="absolute" inset={0} align="center" justify="center">
        <Text fontSize={`${labelSize}px`} fontWeight="950" color={ink} {...tab}>{label}</Text>
      </Flex>
    </Box>
  );
};

// Win chance as vertical ranges on a 0 to 100 scale, one column per catch.
export const WinLadder = ({ pal, rows, h = 300 }) => {
  const fg = fgOf(pal);
  return (
    <Flex gap="4px">
      {rows.map((r, i) => (
        <Flex key={i} direction="column" align="center" flex={1} minW={0}>
          <Box position="relative" w="100%" style={{ height: h }}>
            <Box position="absolute" left="50%" ml="-1px" top={0} bottom={0} w="2px" bg={fg(0.08)} />
            <Box position="absolute" left="50%" ml="-17px" w="34px" bg={pal.brand} style={{ top: (1 - r.post) * h, height: (r.post - r.pre) * h }} />
            <Text position="absolute" left={0} right={0} textAlign="center" fontSize="20px" fontWeight="950" color={pal.orange} style={{ top: (1 - r.post) * h - 26 }} {...tab}>{Math.round(r.post * 100)}%</Text>
            <Text position="absolute" left={0} right={0} textAlign="center" fontSize="15px" fontWeight="800" color={fg(0.6)} style={{ top: (1 - r.pre) * h + 4 }} {...tab}>{Math.round(r.pre * 100)}%</Text>
          </Box>
          <Box mt="26px"><Logo id={r.id} size={36} /></Box>
          <Text mt="4px" fontSize="14px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{lastName(r.name)}</Text>
          <Text fontSize="13px" color={fg(0.55)} whiteSpace="nowrap" {...caps}>{r.clock} left</Text>
        </Flex>
      ))}
    </Flex>
  );
};

// One bar per team, split into top target, second target and everyone else.
export const StackedTeams = ({ pal, rows, rowH = 44 }) => {
  const fg = fgOf(pal);
  return rows.map((t) => (
    <Grid key={t.id} templateColumns="190px minmax(0,1fr) 54px" columnGap="10px" alignItems="center" h={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
      <Who pal={pal} id={t.id} name={lastName(t.top)} size={26} font="15px" />
      <Flex h="24px" columnGap="2px">
        <Box bg={pal.brand} style={{ flex: t.top_share }} />
        <Box bg={pal.orange} style={{ flex: t.top2 - t.top_share }} />
        <Box bg={fg(0.14)} style={{ flex: 1 - t.top2 }} />
      </Flex>
      <Text fontSize="20px" fontWeight="950" textAlign="right" color={pal.brand} {...tab}>{Math.round(t.top_share * 100)}%</Text>
    </Grid>
  ));
};

// Rows by columns, each cell shaded by its share. `cell` returns { text, sub, share }.
export const HeatMatrix = ({ pal, rows, cols, cell, rowHead, rowH = 44, headW = "170px", font = "15px", scale = 1 }) => {
  const fg = fgOf(pal);
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  const template = `${headW} repeat(${cols.length}, minmax(0,1fr))`;
  return (
    <Box>
      <Grid templateColumns={template} columnGap="3px" pb="6px">
        <Box />
        {cols.map((c) => <Text key={c} fontSize="15px" textAlign="center" color={fg(0.6)} {...caps}>{c}</Text>)}
      </Grid>
      {rows.map((r, i) => (
        <Grid key={i} templateColumns={template} columnGap="3px" alignItems="stretch" mb="3px" style={{ minHeight: rowH }}>
          <Flex align="center" minW={0}>{rowHead(r)}</Flex>
          {cols.map((c, j) => {
            const v = cell(r, j);
            const strong = v && v.share * scale > 0.5;
            return (
              <Flex key={c} align="center" justify="center" gap="8px" px="8px" minW={0} style={{ background: v ? `rgba(${rgb}, ${0.05 + v.share * scale * 0.85})` : fg(0.03), color: strong ? "#FFFFFF" : pal.ink }}>
                <Text fontSize={font} fontWeight="950" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" {...tab}>{v ? v.text : "—"}</Text>
                {v?.sub && <Text fontSize="14px" fontWeight="800" opacity={0.8} {...tab}>{v.sub}</Text>}
              </Flex>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

// A small slope chart between two states.
export const MiniSlope = ({ pal, rows, a, b, fmt, aLabel, bLabel, w = 400, h = 420 }) => {
  const fg = fgOf(pal);
  const T = 30, B = 12, LX = 60, RX = 210;
  const vals = rows.flatMap((r) => [a(r), b(r)]);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (h - T - B);
  const ly = spread(rows.map((r) => y(a(r))), 23, T, h - B);
  const ry = spread(rows.map((r) => y(b(r))), 26, T, h - B);
  return (
    <Box position="relative" w={`${w}px`} h={`${h}px`}>
      <Text position="absolute" top="0" left={`${LX - 40}px`} fontSize="14px" color={fg(0.55)} {...caps}>{aLabel}</Text>
      <Text position="absolute" top="0" left={`${RX - 26}px`} fontSize="14px" color={fg(0.55)} {...caps}>{bLabel}</Text>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        {rows.map((r, i) => (
          <g key={i}>
            <line x1={LX} y1={y(a(r))} x2={RX} y2={y(b(r))} stroke={pal.brand} strokeWidth="3" />
            <circle cx={LX} cy={y(a(r))} r="4" fill={pal.brand} />
            <circle cx={RX} cy={y(b(r))} r="5" fill={pal.brand} />
          </g>
        ))}
      </svg>
      {rows.map((r, i) => <Text key={i} position="absolute" left="0" w={`${LX - 8}px`} textAlign="right" fontSize="14px" fontWeight="800" lineHeight="18px" color={fg(0.6)} style={{ top: ly[i] - 9 }} {...tab}>{fmt(a(r))}</Text>)}
      {rows.map((r, i) => (
        <Flex key={i} position="absolute" align="center" gap="6px" h="24px" style={{ left: RX + 10, top: ry[i] - 12 }}>
          <Text fontSize="17px" fontWeight="950" color={pal.orange} {...tab}>{fmt(b(r))}</Text>
          <Logo id={r.id} size={22} />
          <Text fontSize="14px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{teamShortName(r.id)}</Text>
        </Flex>
      ))}
    </Box>
  );
};

// Five groups standing side by side, each taller than the last. Rows of numbers sit inside.
export const HeightLadder = ({ pal, groups, stats, base = 250, step = 42 }) => {
  const fg = fgOf(pal);
  return (
    <Flex align="flex-end" gap="6px">
      {groups.map((g, i) => (
        <Flex key={g} direction="column" flex={1} minW={0} bg={fg(0.06)} borderTop={`6px solid ${pal.brand}`} px="10px" pt="12px" pb="12px" justify="flex-end" style={{ height: base + step * i }}>
          <Text fontSize="20px" fontWeight="950" fontStyle="italic" textAlign="center" textTransform="uppercase" lineHeight={1.05} mb="auto">{g}</Text>
          {stats.map(([label, rows, get, fmt]) => {
            const best = Math.max(...rows.map(get));
            return (
              <Box key={label} textAlign="center" mt="10px">
                <Text fontSize="32px" fontWeight="950" lineHeight={1} color={get(rows[i]) === best ? pal.up : undefined} {...tab}>{fmt(get(rows[i]))}</Text>
                <Text fontSize="12px" color={fg(0.6)} lineHeight={1.1} {...caps}>{label}</Text>
              </Box>
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

// The field from above: deep at the top, the line of scrimmage at the bottom.
export const FieldBands = ({ pal, rows, stats, bandH = 148 }) => {
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  const strength = { deep: 0.95, medium: 0.5, short: 0.2 };
  return (
    <Box>
      {rows.map((r) => {
        const strong = strength[r.depth] > 0.45;
        return (
          <Flex key={r.depth} align="center" justify="space-between" px="22px" h={`${bandH}px`} borderBottom="2px solid rgba(255,255,255,0.5)" style={{ background: `rgba(${rgb}, ${strength[r.depth]})`, color: strong ? "#FFFFFF" : pal.ink }}>
            <Text fontSize="38px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={1}>{r.depth}</Text>
            <Flex gap="24px">
              {stats.map(([label, get]) => (
                <Box key={label} textAlign="center">
                  <Text fontSize="32px" fontWeight="950" lineHeight={1} {...tab}>{get(r)}</Text>
                  <Text fontSize="12px" opacity={0.8} {...caps}>{label}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        );
      })}
      <Box h="6px" bg={pal.ink} />
    </Box>
  );
};

// A logo at any size, for filled panels.
export const BigLogo = ({ id, size }) => <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" />;
