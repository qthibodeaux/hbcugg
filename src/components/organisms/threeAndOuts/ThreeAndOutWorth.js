import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import WORTH from "../../../data/threeAndOutWorth2026W7.json";

// ─────────────────────────────────────────────────────────────────────────────
// Finishing — the "Finishing" view of Team Analytics > Charts > 3 & Outs.
// 2026, once a drive survives three plays: who finishes it (offense, across)
// and who stops it (defense, up; flipped so up is fewer scores allowed).
// TEMPORARY data: the backend's chart pack (10-22, THREE_AND_OUT_CORRELATION_
// CHARTS.md, chart 7) shipped the table inline, copied to
// src/data/threeAndOutWorth2026W7.json. Swap for a published file when there
// is one. Sizes are em, so it draws the same on the page and the poster.
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});
const shortOf = (id) => TEAM_BY_V5[id]?.shortName ?? String(id ?? "").toUpperCase();
const logoOf = (id) => TEAM_BY_V5[id]?.logo ?? null;
const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;
const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const FinishingScatter = ({ pal, compact }) => {
  const fg = fgOf(pal);
  const rows = WORTH.teams_2026;
  const league = WORTH.league_scored_pct ?? 50;
  const x0 = 30, x1 = 65, y0 = 30, y1 = 68;
  const px = (v) => `${((v - x0) / (x1 - x0)) * 100}%`;
  const py = (v) => `${((v - y0) / (y1 - y0)) * 100}%`;
  const logo = compact ? "2em" : "2.4em";
  const corner = (text, pos, ink) => <Text position="absolute" fontSize="0.68em" color={ink} {...caps} style={pos}>{text}</Text>;
  return (
    <Grid templateColumns="2em minmax(0,1fr)" templateRows="minmax(0,1fr) 2em" style={{ aspectRatio: compact ? "1 / 1" : "16 / 8" }}>
      <Flex align="center" justify="center">
        <Text fontSize="0.65em" color={fg(0.6)} whiteSpace="nowrap" {...caps} style={{ transform: "rotate(-90deg)" }}>Defense: scores allowed · fewer ↑</Text>
      </Flex>
      <Box position="relative" bg={fg(0.03)} overflow="hidden">
        {[35, 40, 45, 50, 55, 60, 65].map((v) => (
          <Box key={`x${v}`} position="absolute" top={0} bottom={0} w="1px" bg={fg(0.07)} style={{ left: px(v) }}>
            <Text position="absolute" bottom="0.2em" left="0.25em" fontSize="0.58em" fontWeight="800" color={fg(0.4)}>{v}%</Text>
          </Box>
        ))}
        {[35, 40, 45, 50, 55, 60, 65].map((v) => (
          <Box key={`y${v}`} position="absolute" left={0} right={0} h="1px" bg={fg(0.07)} style={{ top: py(v) }}>
            <Text position="absolute" left="0.3em" top="0.15em" fontSize="0.58em" fontWeight="800" color={fg(0.4)}>{v}%</Text>
          </Box>
        ))}
        <Box position="absolute" top={0} bottom={0} borderLeft={`2px dashed ${pal.brand}`} opacity={0.7} style={{ left: px(league) }} />
        <Box position="absolute" left={0} right={0} borderTop={`2px dashed ${pal.brand}`} opacity={0.7} style={{ top: py(league) }} />
        {corner("Finishes and stops", { top: "0.5em", right: "0.7em" }, pal.up)}
        {corner("Finishes, can't stop", { bottom: "1.4em", right: "0.7em" }, pal.orange)}
        {corner("Stops, can't finish", { top: "0.5em", left: "2.6em" }, pal.orange)}
        {corner("Neither", { bottom: "1.4em", left: "2.6em" }, pal.down)}
        {rows.map((r) => (
          <Image key={r.team_id} src={logoOf(r.team_id)} alt={shortOf(r.team_id)} position="absolute" w={logo} h={logo} objectFit="contain"
            style={{ left: px(r.off_scored_pct), top: py(r.def_allowed_pct), transform: "translate(-50%, -50%)", filter: `drop-shadow(0 2px 3px rgba(0,0,0,${pal.shadow}))` }} />
        ))}
      </Box>
      <Box />
      <Flex align="center" justify="center">
        <Text fontSize="0.65em" color={fg(0.6)} {...caps}>Offense: drives that score · more →</Text>
      </Flex>
    </Grid>
  );
};

