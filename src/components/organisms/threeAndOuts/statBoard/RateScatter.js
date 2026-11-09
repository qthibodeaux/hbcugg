import { fgOf, caps, rgbOf, tab, logoOf, shortOf } from "./boardPresentation";
import { Grid, Flex, Text, Box, Image } from "@chakra-ui/react";

// Offense/defense rate scatter; published axis direction and league anchors are preserved.

export const Scatter = ({ pal, stat, file, rows, compact }) => {
  const fg = fgOf(pal);
  const off = Object.fromEntries((file.offense?.rows ?? []).map((r) => [r.team_id, r]));
  const def = Object.fromEntries((file.defense?.rows ?? []).map((r) => [r.team_id, r]));
  const pts = rows.map((r) => r.team_id).filter((id) => off[id] && def[id]).map((id) => ({ id, x: off[id].rate_pct, y: def[id].rate_pct }));
  const lx = file.offense?.league?.rate_pct ?? 0;
  const ly = file.defense?.league?.rate_pct ?? 0;
  const xs = pts.map((p) => p.x).concat(lx);
  const ys = pts.map((p) => p.y).concat(ly);
  const span = (v) => [Math.floor((Math.min(...v) - 3) / 5) * 5, Math.ceil((Math.max(...v) + 3) / 5) * 5];
  const [x0, x1] = span(xs);
  const [y0, y1] = span(ys);
  // Each axis turns so the better end is right / up.
  const xLow = file.offense?.better === "lower";
  const yLow = file.defense?.better === "lower";
  const px = (v) => `${((xLow ? x1 - v : v - x0) / (x1 - x0)) * 100}%`;
  const py = (v) => `${((yLow ? v - y0 : y1 - v) / (y1 - y0)) * 100}%`;
  const ticks = (a, b) => Array.from({ length: Math.round((b - a) / 5) + 1 }, (_, i) => a + i * 5);
  const logo = compact ? "2em" : "2.6em";
  return (
    <Grid templateColumns="2.4em minmax(0,1fr)" templateRows="minmax(0,1fr) 2.6em" w="100%" style={{ aspectRatio: compact ? "1 / 1" : "16 / 10" }}>
      <Flex align="center" justify="center">
        <Text fontSize="0.78em" color={fg(0.65)} whiteSpace="nowrap" {...caps} style={{ transform: "rotate(-90deg)" }}>{stat.yLabel}</Text>
      </Flex>
      <Box position="relative" bg={pal.panel} overflow="hidden">
        <Box position="absolute" top={0} right={0} bg={`rgba(${rgbOf(pal.up)}, 0.08)`} style={{ left: px(lx), height: py(ly) }} />
        <Box position="absolute" bottom={0} left={0} bg={`rgba(${rgbOf(pal.down)}, 0.07)`} style={{ width: px(lx), top: py(ly) }} />
        {ticks(x0, x1).map((v) => (
          <Box key={`x${v}`} position="absolute" top={0} bottom={0} w="1px" bg={fg(0.07)} style={{ left: px(v) }}>
            <Text position="absolute" bottom="0.3em" left="0.3em" fontSize="0.7em" fontWeight="800" color={fg(0.45)} {...tab}>{v}%</Text>
          </Box>
        ))}
        {ticks(y0, y1).map((v) => (
          <Box key={`y${v}`} position="absolute" left={0} right={0} h="1px" bg={fg(0.07)} style={{ top: py(v) }}>
            <Text position="absolute" left="0.4em" top="0.2em" fontSize="0.7em" fontWeight="800" color={fg(0.45)} {...tab}>{v}%</Text>
          </Box>
        ))}
        <Box position="absolute" top={0} bottom={0} borderLeft={`2px dashed ${pal.brand}`} opacity={0.7} style={{ left: px(lx) }} />
        <Box position="absolute" left={0} right={0} borderTop={`2px dashed ${pal.brand}`} opacity={0.7} style={{ top: py(ly) }} />
        <Text position="absolute" top="0.6em" right="0.8em" fontSize="0.8em" color={pal.up} {...caps}>Better on both</Text>
        <Text position="absolute" bottom="1.8em" left="3em" fontSize="0.8em" color={pal.down} {...caps}>Worse on both</Text>
        {pts.map((p) => (
          <Image key={p.id} src={logoOf(p.id)} alt={shortOf(p.id)} position="absolute" w={logo} h={logo} objectFit="contain"
            style={{ left: px(p.x), top: py(p.y), transform: "translate(-50%, -50%)", filter: `drop-shadow(0 2px 3px rgba(0,0,0,${pal.shadow}))` }} />
        ))}
      </Box>
      <Box />
      <Flex align="center" justify="center">
        <Text fontSize="0.78em" color={fg(0.65)} {...caps}>{stat.xLabel}</Text>
      </Flex>
    </Grid>
  );
};
