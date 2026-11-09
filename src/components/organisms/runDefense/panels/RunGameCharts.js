import { fgOf, tab, rgbOf, logoOf, shortOf, caps, pct1, POSTER_W } from "./runGamePresentation";
import { Flex, Text, Box, Image, Grid } from "@chakra-ui/react";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";

export const Scatter = ({ pal, side, teams, league, plays, compact }) => {
  const fg = fgOf(pal);
  const pts = teams.map((t) => ({ id: t.team_id, x: t[plays]?.explosive_rate_rush * 100, y: t[plays]?.success_rate_rush * 100 })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const lx = league.explosive_rate_rush * 100;
  const ly = league.success_rate_rush * 100;
  const span = (v) => [Math.floor((Math.min(...v) - 2) / 5) * 5, Math.ceil((Math.max(...v) + 2) / 5) * 5];
  const [x0, x1] = span(pts.map((p) => p.x).concat(lx));
  const [y0, y1] = span(pts.map((p) => p.y).concat(ly));
  // Better is right and up: for a defense (lower is better) both axes turn.
  const xPct = (v) => ((side.low ? x1 - v : v - x0) / (x1 - x0)) * 100;
  const yPct = (v) => ((side.low ? v - y0 : y1 - v) / (y1 - y0)) * 100;
  const ticks = (a, b) => Array.from({ length: Math.round((b - a) / 5) + 1 }, (_, i) => a + i * 5);
  const cx = xPct(lx);
  const cy = yPct(ly);
  const h = compact ? "26em" : "30em";
  const logo = compact ? "1.9em" : "2.3em";
  const small = { fontSize: "0.62em", fontWeight: "800", color: fg(0.45), ...tab, whiteSpace: "nowrap" };
  const title = { fontSize: "0.62em", fontWeight: "900", color: fg(0.65), textTransform: "uppercase", letterSpacing: "0.14em" };
  const corners = [
    { t: side.quads[0], pos: { top: "0.7em", left: "0.8em" }, color: fg(0.45) },
    { t: side.quads[1], pos: { top: "0.7em", right: "0.8em" }, color: pal.up, align: "right" },
    { t: side.quads[2], pos: { bottom: "0.7em", left: "0.8em" }, color: pal.down },
    { t: side.quads[3], pos: { bottom: "0.7em", right: "0.8em" }, color: fg(0.45), align: "right" },
  ];
  return (
    <Flex>
      <Flex w="1.4em" flexShrink={0} align="center" justify="center" h={h}>
        <Text whiteSpace="nowrap" style={{ transform: "rotate(-90deg)" }} {...title}>
          {side.y}{side.low ? " · less is up" : ""}
        </Text>
      </Flex>
      <Box position="relative" w="3.2em" flexShrink={0} h={h}>
        {ticks(y0, y1).map((t) => (
          <Text key={t} position="absolute" right="0.6em" top={`${yPct(t)}%`} transform="translateY(-50%)" {...small}>{t}%</Text>
        ))}
      </Box>
      <Box flex="1" minW={0}>
        <Box position="relative" h={h} w="100%" bg={fg(0.03)} borderLeft={`1px solid ${fg(0.18)}`} borderBottom={`1px solid ${fg(0.18)}`} overflow="hidden">
          <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg={`rgba(${rgbOf(pal.up)}, 0.06)`} />
          <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg={`rgba(${rgbOf(pal.down)}, 0.06)`} />
          {corners.map((q) => (
            <Text key={q.t} position="absolute" {...q.pos} textAlign={q.align ?? "left"} zIndex={1} pointerEvents="none"
              fontSize="0.62em" fontWeight="900" color={q.color} textTransform="uppercase" letterSpacing="0.12em">{q.t}</Text>
          ))}
          {ticks(x0, x1).map((t) => <Box key={`gx${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px" bg={fg(0.07)} />)}
          {ticks(y0, y1).map((t) => <Box key={`gy${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px" bg={fg(0.07)} />)}
          <Box position="absolute" left={`${cx}%`} top={0} bottom={0} w={0} borderLeft={`1px dashed rgba(${rgbOf(pal.brand)}, 0.7)`} />
          <Box position="absolute" top={`${cy}%`} left={0} right={0} h={0} borderTop={`1px dashed rgba(${rgbOf(pal.brand)}, 0.7)`} />
          {pts.map((p) => (
            <Image key={p.id} src={logoOf(p.id)} alt={shortOf(p.id)} position="absolute" w={logo} h={logo} objectFit="contain" zIndex={2}
              title={`${shortOf(p.id)} · ${p.y.toFixed(1)}% success · ${p.x.toFixed(1)}% explosive`}
              style={{ left: `${xPct(p.x)}%`, top: `${yPct(p.y)}%`, transform: "translate(-50%, -50%)", filter: `drop-shadow(0 2px 6px rgba(0,0,0,${pal.shadow}))` }} />
          ))}
        </Box>
        <Box position="relative" h="1.3em" mt="0.4em">
          {ticks(x0, x1).map((t) => (
            <Text key={t} position="absolute" left={`${xPct(t)}%`} transform="translateX(-50%)" {...small}>{t}%</Text>
          ))}
        </Box>
        <Text textAlign="center" mt="0.2em" {...title}>{side.x}{side.low ? " · less is right →" : ""}</Text>
      </Box>
    </Flex>
  );
};

export const TopBoth = ({ pal, top, compact }) => {
  const fg = fgOf(pal);
  if (!top.length) return null;
  return (
    <Box mt="1em">
      <Text mb="0.5em" fontSize="0.8em" color={fg(0.6)} {...caps}>Top 5 in both</Text>
      <Grid templateColumns={compact ? "minmax(0,1fr) minmax(0,1fr)" : `repeat(${Math.max(top.length, 4)}, minmax(0,1fr))`} gap="2px">
        {top.map((t) => (
          <Flex key={t.team_id} align="center" gap="0.7em" bg={pal.panel} px="0.9em" py="0.7em" borderLeft={`4px solid ${pal.orange}`} minW={0}>
            <Image src={logoOf(t.team_id)} alt="" w="2em" h="2em" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="1em" fontWeight="950" textTransform="uppercase" lineHeight={1.1}>{shortOf(t.team_id)}</Text>
              <Text fontSize="0.78em" fontWeight="800" color={fg(0.65)} whiteSpace="nowrap" {...tab}>
                {pct1(t.success_rate_rush)} success · {pct1(t.explosive_rate_rush)} explosive
              </Text>
            </Box>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};

export const Poster = ({ pal, view, scope, plays, innerRef }) => {
  const meta = view.side.file.meta;
  return (
  <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="22px" fontSize="22px">
    <Flex align="center" justify="space-between">
      <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
      <Text fontSize="18px" color={pal.orange} {...caps}>
        {meta.season} · Through Week {meta.through_week} · {scope === "swac" ? "SWAC" : "SWAC + MEAC"}{plays === "without_garbage_time" ? " · No garbage time" : ""}
      </Text>
    </Flex>
    <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
      {view.side.title[0]} <Box as="span" color={pal.brand}>{view.side.title[1]}</Box>
    </Text>
    <Box h="1px" bg={`rgba(${pal.fg}, 0.12)`} />
    <Scatter pal={pal} {...view} plays={plays} />
    <TopBoth pal={pal} top={view.top} />
  </Flex>
  );
};
