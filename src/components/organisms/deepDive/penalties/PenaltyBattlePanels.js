import { fgOf, S, caps, tab, signed, fix, shortOf, pct } from "./penaltyPosterModel";
import { Card, Team, Tiles, Tile, Head } from "./PenaltyPosterPrimitives";
import { Grid, Box, Flex, Text } from "@chakra-ui/react";

// Net penalty-yard comparison, benefit callouts and penalty EPA cost panels.

export const NetBattle = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = [...S.net_penalty_battle.rows].sort((a, b) => b.net_yards_per_game - a.net_yards_per_game);
  const max = Math.ceil(Math.max(...rows.map((r) => Math.abs(r.net_yards_per_game))) / 10) * 10;
  const cols = "220px minmax(0,1fr) 110px 190px";
  return (
    <Card pal={pal} kicker="Net penalty yards per game">
      <Grid templateColumns={cols} columnGap="16px" pb="8px" borderBottom={`2px solid ${fg(0.14)}`}>
        <Box />
        <Flex justify="space-between">
          <Text fontSize="13px" color={pal.down} {...caps}>◀ Team flagged more</Text>
          <Text fontSize="13px" color={pal.orange} {...caps}>Opponents flagged more ▶</Text>
        </Flex>
        <Text fontSize="13px" color={fg(0.55)} textAlign="right" {...caps}>Net</Text>
        <Text fontSize="13px" color={fg(0.55)} textAlign="right" {...caps}>Drawn / committed</Text>
      </Grid>
      {rows.map((r) => {
        const v = r.net_yards_per_game;
        const w = (Math.abs(v) / max) * 50;
        const ink = v >= 0 ? pal.orange : pal.down;
        return (
          <Grid key={r.team_id} templateColumns={cols} columnGap="16px" alignItems="center" h="52px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Team id={r.team_id} />
            <Box position="relative" h="26px">
              <Box position="absolute" left="50%" top="-13px" bottom="-13px" w="2px" bg={fg(0.35)} />
              <Box position="absolute" top={0} bottom={0} bg={ink} left={v >= 0 ? "50%" : `${50 - w}%`} w={`${Math.max(w, 0.4)}%`} />
            </Box>
            <Text fontSize="24px" fontWeight="950" color={ink} textAlign="right" {...tab}>{signed(v)}</Text>
            <Text fontSize="18px" fontWeight="800" color={fg(0.6)} textAlign="right" {...tab}>{fix(r.drawn_yards_per_game)} / {fix(r.yards_per_game)}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const BenefitTiles = ({ pal }) => {
  const rows = S.net_penalty_battle.rows;
  const top = rows.reduce((a, b) => (b.net_yards_per_game > a.net_yards_per_game ? b : a));
  const low = rows.reduce((a, b) => (b.net_yards_per_game < a.net_yards_per_game ? b : a));
  const most = rows.reduce((a, b) => (b.yards_per_game > a.yards_per_game ? b : a));
  return (
    <Tiles n={2}>
      <Tile pal={pal} value={signed(top.net_yards_per_game)} ink={pal.orange} title={`${shortOf(top.team_id)} wins the flag battle`}
        text={`Opponents are flagged for ${fix(top.drawn_yards_per_game)} yards a game, ${shortOf(top.team_id)} for ${fix(top.yards_per_game)}.`} />
      <Tile pal={pal} value={fix(most.yards_per_game)} ink={pal.down} title={`${shortOf(most.team_id)}'s penalty yards a game`}
        text={`The most in the SWAC, and a net ${signed(low.net_yards_per_game)} a game for ${shortOf(low.team_id)}.`} />
    </Tiles>
  );
};

export const TeamCost = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = [...S.team_cost.rows].sort((a, b) => a.epa_lost_per_game - b.epa_lost_per_game);
  const max = Math.max(...rows.map((r) => Math.abs(r.epa_lost_per_game)));
  const cols = "220px minmax(0,1fr) 110px 170px";
  return (
    <Card pal={pal} kicker="Points given away by flags, per game">
      <Head pal={pal} cols={cols} align={["left", "left", "right", "right"]} labels={["", "", "Flags / game", "Crucial · share"]} />
      {rows.map((r) => (
        <Grid key={r.team_id} templateColumns={cols} columnGap="16px" alignItems="center" h="50px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Team id={r.team_id} />
          <Flex align="center" gap="12px">
            <Box h="24px" w={`${(Math.abs(r.epa_lost_per_game) / max) * 82}%`} bg={pal.down} />
            <Text fontSize="21px" fontWeight="950" {...tab}>{signed(r.epa_lost_per_game, 2)}</Text>
          </Flex>
          <Text fontSize="19px" fontWeight="900" textAlign="right" {...tab}>{fix(r.flags_per_game)}</Text>
          <Text fontSize="19px" fontWeight="900" textAlign="right" {...tab}>
            {r.crucial_flags} <Text as="span" color={r.crucial_share >= 0.35 ? pal.orange : fg(0.5)}>· {pct(r.crucial_share)}</Text>
          </Text>
        </Grid>
      ))}
    </Card>
  );
};
