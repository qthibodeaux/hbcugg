import { Flex, Text, Box, Grid } from "@chakra-ui/react";
import { SWAC_TEAM_AVG, tab, fgOf, S, fix, caps, foulName, shortOf } from "./penaltyPosterModel";
import { Card, Head, Team, Tile } from "./PenaltyPosterPrimitives";

// Game-by-game flags, pre-snap direction and weekly flag-rate panels.

const GameBars = ({ pal, games, max }) => (
  <Flex align="flex-end" gap="10px" h="56px">
    {games.map((g) => {
      const ink = g.flags > SWAC_TEAM_AVG ? pal.down : pal.up;
      return (
        <Flex key={g.game_path_id} direction="column" align="center" justify="flex-end" w="52px" h="full">
          <Text fontSize="14px" fontWeight="900" color={ink} {...tab}>{g.flags}</Text>
          <Box w="full" h={`${(g.flags / max) * 34}px`} minH="2px" bg={ink} />
        </Flex>
      );
    })}
  </Flex>
);

export const Habits = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = [...S.habits_and_direction.team_summary].sort((a, b) => b.flags_per_game - a.flags_per_game);
  const log = S.habits_and_direction.game_log;
  const max = Math.max(...log.map((g) => g.flags));
  const cols = "230px 110px 330px 230px minmax(0,1fr)";
  return (
    <Card pal={pal} kicker="Flags game by game">
      <Head pal={pal} cols={cols} gap="24px" align={["left", "right", "left", "left", "left"]} labels={["", "Per game", "Each game, in order", "Pre-snap · early → late", "Most common foul"]} />
      {rows.map((r) => {
        const games = log.filter((g) => g.team_id === r.team_id).sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const d = r.pre_snap_second_half - r.pre_snap_first_half;
        return (
          <Grid key={r.team_id} templateColumns={cols} columnGap="24px" alignItems="center" h="72px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Team id={r.team_id} />
            <Text fontSize="22px" fontWeight="950" textAlign="right" {...tab}>{fix(r.flags_per_game)}</Text>
            <GameBars pal={pal} games={games} max={max} />
            <Text fontSize="20px" fontWeight="900" {...tab}>
              <Text as="span" color={fg(0.45)}>{r.pre_snap_first_half} → </Text>
              <Text as="span" color={d < 0 ? pal.up : d > 0 ? pal.down : pal.ink}>{r.pre_snap_second_half}</Text>
            </Text>
            <Text fontSize="18px" fontWeight="900" {...caps}>{foulName(r.most_common_foul)}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const HabitTiles = ({ pal }) => {
  const fg = fgOf(pal);
  const ts = Object.fromEntries(S.habits_and_direction.team_summary.map((r) => [r.team_id, r]));
  const log = (id) => S.habits_and_direction.game_log.filter((g) => g.team_id === id).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const tsu = ts.swactsu;
  const weeks = S.habits_and_direction.swac_by_week.filter((w) => w.team_games >= 6);
  const wmax = Math.max(...weeks.map((w) => w.flags_per_team_game));
  return (
    <Grid templateColumns="repeat(2, minmax(0,1fr)) minmax(0,1.4fr)" gap="2px">
      {tsu && <Tile pal={pal} value={`${tsu.pre_snap_first_half}→${tsu.pre_snap_second_half}`} ink={pal.up} title={`${shortOf("swactsu")}'s pre-snap flags`}
        text="First half of its games to the second. The fouls a team controls entirely." />}
      <Tile pal={pal} size="40px" value={log("swacmvsu").map((g) => g.flags).join("·")} ink={pal.down} title={`${shortOf("swacmvsu")}, game by game`}
        text="Already the most-flagged team, and not slowing down." />
      <Card pal={pal} kicker="SWAC flags per team, by week">
        <Flex align="flex-end" gap="10px" h="120px">
          {weeks.map((w) => (
            <Flex key={w.week} direction="column" align="center" justify="flex-end" flex={1} h="full">
              <Text fontSize="16px" fontWeight="950" {...tab}>{fix(w.flags_per_team_game)}</Text>
              <Box w="full" h={`${(w.flags_per_team_game / wmax) * 70}px`} bg={pal.brand} />
              <Text mt="4px" fontSize="12px" color={fg(0.55)} {...caps}>Wk {w.week}</Text>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Grid>
  );
};
