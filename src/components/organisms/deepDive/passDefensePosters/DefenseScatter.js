import { fgOf, tab, caps, rgbOf, metricOf, rankOf, leagueOf } from "./posterModel";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { logoOf } from "../deepDiveModel";
import { teamShortName } from "../../../game/export/exportData";
import { usePD } from "./usePassDefensePosterData";
import { Poster, Card, KickerRight, Waiting } from "./PosterPrimitives";

// Pass-defense scatter geometry and module-initialized scatter-poster factory.

const DefenseScatter = ({ pal, pts, avgX, avgY, xLabel, yLabel, xFmt, yFmt, xStep, yStep, quads }) => {
  const fg = fgOf(pal);
  const span = (v, step) => [Math.floor((Math.min(...v) - step / 2) / step) * step, Math.ceil((Math.max(...v) + step / 2) / step) * step];
  const [x0, x1] = span(pts.map((p) => p.x).concat(Number.isFinite(avgX) ? [avgX] : []), xStep);
  const [y0, y1] = span(pts.map((p) => p.y).concat(Number.isFinite(avgY) ? [avgY] : []), yStep);
  const xPct = (v) => ((x1 - v) / (x1 - x0)) * 100;
  const yPct = (v) => ((v - y0) / (y1 - y0)) * 100;
  const ticks = (a, b, step) => Array.from({ length: Math.round((b - a) / step) + 1 }, (_, i) => +(a + i * step).toFixed(6));
  const cx = xPct(avgX);
  const cy = yPct(avgY);
  const H = "760px";
  const small = { fontSize: "16px", fontWeight: "800", color: fg(0.5), whiteSpace: "nowrap", ...tab };
  const title = { fontSize: "15px", color: fg(0.7), ...caps, letterSpacing: "0.14em" };
  const corners = [
    { t: quads[0], pos: { top: "14px", left: "16px" }, color: fg(0.5) },
    { t: quads[1], pos: { top: "14px", right: "16px" }, color: pal.up, align: "right" },
    { t: quads[2], pos: { bottom: "14px", left: "16px" }, color: pal.down },
    { t: quads[3], pos: { bottom: "14px", right: "16px" }, color: fg(0.5), align: "right" },
  ];
  return (
    <Flex>
      <Flex w="30px" flexShrink={0} align="center" justify="center" h={H}>
        <Text whiteSpace="nowrap" style={{ transform: "rotate(-90deg)" }} {...title}>{yLabel} · less is up</Text>
      </Flex>
      <Box position="relative" w="70px" flexShrink={0} h={H}>
        {ticks(y0, y1, yStep).map((t) => (
          <Text key={t} position="absolute" right="12px" top={`${yPct(t)}%`} transform="translateY(-50%)" {...small}>{yFmt(t)}</Text>
        ))}
      </Box>
      <Box flex="1" minW={0}>
        <Box position="relative" h={H} w="100%" bg={fg(0.03)} borderLeft={`2px solid ${fg(0.2)}`} borderBottom={`2px solid ${fg(0.2)}`} overflow="hidden">
          <Box position="absolute" left={`${cx}%`} right={0} top={0} h={`${cy}%`} bg={`rgba(${rgbOf(pal.up)}, 0.07)`} />
          <Box position="absolute" left={0} w={`${cx}%`} bottom={0} top={`${cy}%`} bg={`rgba(${rgbOf(pal.down)}, 0.07)`} />
          {corners.map((q) => (
            <Text key={q.t} position="absolute" {...q.pos} textAlign={q.align ?? "left"} zIndex={1} fontSize="15px" color={q.color} {...caps} letterSpacing="0.12em">{q.t}</Text>
          ))}
          {ticks(x0, x1, xStep).map((t) => <Box key={`gx${t}`} position="absolute" left={`${xPct(t)}%`} top={0} bottom={0} w="1px" bg={fg(0.07)} />)}
          {ticks(y0, y1, yStep).map((t) => <Box key={`gy${t}`} position="absolute" top={`${yPct(t)}%`} left={0} right={0} h="1px" bg={fg(0.07)} />)}
          <Box position="absolute" left={`${cx}%`} top={0} bottom={0} w={0} borderLeft={`2px dashed rgba(${rgbOf(pal.brand)}, 0.75)`} />
          <Box position="absolute" top={`${cy}%`} left={0} right={0} h={0} borderTop={`2px dashed rgba(${rgbOf(pal.brand)}, 0.75)`} />
          {pts.map((p) => (
            <Image key={p.id} src={logoOf(p.id)} alt={teamShortName(p.id)} position="absolute" w="58px" h="58px" objectFit="contain" zIndex={2} opacity={p.faded ? 0.45 : 1}
              style={{ left: `${xPct(p.x)}%`, top: `${yPct(p.y)}%`, transform: "translate(-50%, -50%)", filter: `drop-shadow(0 3px 7px rgba(0,0,0,${pal.shadow}))` }} />
          ))}
        </Box>
        <Box position="relative" h="26px" mt="8px">
          {ticks(x0, x1, xStep).map((t) => (
            <Text key={t} position="absolute" left={`${xPct(t)}%`} transform="translateX(-50%)" {...small}>{xFmt(t)}</Text>
          ))}
        </Box>
        <Text textAlign="center" mt="4px" {...title}>{xLabel} · less is right →</Text>
      </Box>
    </Flex>
  );
};

export const scatterPoster = ({ title, accent, kicker, x, y, xLabel, yLabel, xFmt, yFmt, xStep, yStep, quads }) => {
  const ScatterPoster = ({ pal, innerRef }) => {
  const { docs, index, ready, error } = usePD();
  const pts = docs.map((d) => {
    const mx = metricOf(d, x[0], x[1]);
    const my = metricOf(d, y[0], y[1]);
    return { id: d.team_id, x: mx?.value, y: my?.value, faded: !d.team_id.startsWith("swac") && (rankOf(mx) == null || rankOf(my) == null) };
  }).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  return (
    <Poster pal={pal} innerRef={innerRef} title={title} accent={accent}>
      <Card pal={pal} kicker={kicker} right={<KickerRight pal={pal}>Dashed = The 18 avg</KickerRight>}>
        {ready && pts.length ? (
          <DefenseScatter pal={pal} pts={pts} avgX={leagueOf(index, x[0], x[1])} avgY={leagueOf(index, y[0], y[1])}
            xLabel={xLabel} yLabel={yLabel} xFmt={xFmt} yFmt={yFmt} xStep={xStep} yStep={yStep} quads={quads} />
        ) : <Waiting pal={pal} error={error} empty={ready && !pts.length} />}
      </Card>
    </Poster>
  );
  };
  return ScatterPoster;
};
