import { Flex, Image, Text, Box, Grid } from "@chakra-ui/react";
import { teamLogo } from "../../export/exportData";
import { INK, fg, short, axPct, successRateScale, UP, DOWN, pct1, SCORE_COLS, PANEL, LINE } from "./recapPresentation";
import { brandOf } from "../../preview/GamePreviewScout";
import { ColHead, Divider } from "./RecapPrimitives";

const TeamCell = ({ id, won }) => (
  <Flex align="center" gap="12px" minW={0}>
    <Image src={teamLogo(id)} alt="" w="36px" h="36px" objectFit="contain" opacity={won ? 1 : 0.5} flexShrink={0} />
    <Text fontSize="23px" fontWeight="900" color={won ? INK : fg(0.5)} textTransform="uppercase" lineClamp={1}>{short(id)}</Text>
  </Flex>
);

const ScoreCell = ({ v, won }) => (
  <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={won ? INK : fg(0.5)} fontVariantNumeric="tabular-nums" textAlign="right" letterSpacing="-0.02em">{v}</Text>
);

const ratesOf = (g, gamesById) => {
  const adv = gamesById[g.game_path_id]?.advanced_team ?? {};
  const rate = (id) => {
    const v = adv[id]?.success_rate_down_distance ?? adv[id]?.success_rate;
    return Number.isFinite(v) ? v : null;
  };
  return { away: rate(g.away.team_id), home: rate(g.home.team_id) };
};

const DumbbellCell = ({ g, r, scale }) => {
  if (r.away == null || r.home == null) return <Box />;
  const awayAhead = r.away >= r.home;
  const leadId = awayAhead ? g.away.team_id : g.home.team_id;
  const lo = Math.min(axPct(r.away, scale), axPct(r.home, scale));
  const hi = Math.max(axPct(r.away, scale), axPct(r.home, scale));
  return (
    <Box position="relative" h="40px" mx="18px">
      {scale.ticks.map((t) => <Box key={t} position="absolute" top="-10px" bottom="-10px" w="1px" bg={fg(0.08)} style={{ left: `${axPct(t, scale)}%` }} />)}
      <Box position="absolute" top="50%" h="6px" mt="-3px" bg={brandOf(leadId)} borderRadius="3px" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0.5)}%` }} />
      {[[g.away.team_id, r.away], [g.home.team_id, r.home]].map(([id, v]) => (
        <Image key={id} src={teamLogo(id)} alt="" position="absolute" top="50%" w="34px" h="34px" objectFit="contain"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,var(--rc-shadow)))" style={{ left: `${axPct(v, scale)}%`, transform: "translate(-50%, -50%)" }} />
      ))}
    </Box>
  );
};

const RatesCell = ({ r }) => {
  const awayAhead = r.away != null && r.home != null && r.away >= r.home;
  return (
    <Flex justify="flex-end" gap="8px" fontVariantNumeric="tabular-nums">
      <Text fontSize="20px" fontWeight={awayAhead ? "950" : "700"} color={awayAhead ? INK : fg(0.55)}>{pct1(r.away)}</Text>
      <Text fontSize="20px" color={fg(0.3)}>·</Text>
      <Text fontSize="20px" fontWeight={!awayAhead ? "950" : "700"} color={!awayAhead ? INK : fg(0.55)}>{pct1(r.home)}</Text>
    </Flex>
  );
};

export const MarginBoard = ({ rows, gamesById }) => {
  const sorted = [...rows].sort((a, b) => (a.net_success_edge ?? 0) - (b.net_success_edge ?? 0));
  const scale = successRateScale(rows.flatMap((g) => Object.values(ratesOf(g, gamesById))));
  const cols = `${SCORE_COLS} minmax(0,1fr) 72px 160px`;
  return (
    <Box bg={PANEL} border="1px solid" borderColor={fg(0.12)}>
      <Flex justify="space-between" px="16px" py="10px" borderBottom="1px solid" borderColor={LINE}>
        <ColHead>Final scores</ColHead>
        <ColHead>Success rate · winner net edge in percentage points</ColHead>
      </Flex>
      <Grid templateColumns={cols} columnGap="10px" px="16px" h="38px" alignItems="center" bg={fg(0.04)} borderBottom="1px solid" borderColor={fg(0.12)}>
        <ColHead>Away</ColHead>
        <ColHead align="right">Pts</ColHead>
        <ColHead>Home</ColHead>
        <ColHead align="right">Pts</ColHead>
        <Divider />
        <Box position="relative" h="100%" mx="18px">
          {scale.ticks.map((t) => (
            <ColHead key={t} position="absolute" top="50%" style={{ left: `${axPct(t, scale)}%`, transform: "translate(-50%, -50%)" }}>{Math.round(t * 100)}%</ColHead>
          ))}
        </Box>
        <ColHead align="right">Net SR</ColHead>
        <ColHead align="right">Away · Home SR</ColHead>
      </Grid>
      {sorted.map((g, i) => {
        const awayWon = g.winner_team_id === g.away.team_id;
        const r = ratesOf(g, gamesById);
        return (
          <Grid key={g.game_path_id} templateColumns={cols} columnGap="10px" px="16px" h="48px" alignItems="center" borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
            <TeamCell id={g.away.team_id} won={awayWon} />
            <ScoreCell v={g.away.score} won={awayWon} />
            <TeamCell id={g.home.team_id} won={!awayWon} />
            <ScoreCell v={g.home.score} won={!awayWon} />
            <Divider />
            <DumbbellCell g={g} r={r} scale={scale} />
            <Text textAlign="right" whiteSpace="nowrap" fontSize="18px" fontWeight="950" color={((awayWon ? r.away - r.home : r.home - r.away) >= 0) ? UP : DOWN}>
              {r.away == null || r.home == null ? "—" : `${((awayWon ? r.away - r.home : r.home - r.away) >= 0) ? "+" : "−"}${Math.abs(r.away - r.home) * 100 < 0.05 ? "0.0" : (Math.abs(r.away - r.home) * 100).toFixed(1)}`}
            </Text>
            <RatesCell r={r} />
          </Grid>
        );
      })}
    </Box>
  );
};
