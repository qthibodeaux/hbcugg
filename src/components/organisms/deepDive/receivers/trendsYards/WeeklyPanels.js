import { RPoster, Dumbbell, DATA, one, pct, fgOf, Card, Logo, caps, tab, Panels, Table, epa, POSTER_W, Line } from "../kit";
import { Grid, Flex, Box, Text } from "@chakra-ui/react";

// Receiver recent-form, share-change, single-game, streak and league-week posters.

export const Last3 = (props) => (
  <RPoster {...props} title="Yards per game, last 3 games against before">
    <Dumbbell pal={props.pal} rows={[...DATA.last3_up, ...DATA.last3_down]} a={(r) => r.before} b={(r) => r.last3} fmt={one} aLabel="Before" bLabel="Last 3" rowH={46} />
  </RPoster>
);

export const ShareJump = (props) => (
  <RPoster {...props} title="Share of team targets, last 3 games against before">
    <Dumbbell pal={props.pal} rows={DATA.share_jump} a={(r) => r.share_before} b={(r) => r.share_last3} fmt={pct} aLabel="Before" bLabel="Last 3" />
  </RPoster>
);

export const BestGames = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  return (
    <RPoster {...props} title="Best single games of 2026">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px">
        {DATA.best_games.map((g, i) => (
          <Card key={i} pal={pal} gap="8px">
            <Flex align="center" gap="10px">
              <Logo id={g.id} size={38} />
              <Box minW={0}>
                <Text fontSize="19px" fontWeight="950" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap">{g.name}</Text>
                <Text fontSize="13px" color={fg(0.55)} {...caps}>Week {g.week}</Text>
              </Box>
            </Flex>
            <Flex align="baseline" justify="space-between" gap="10px">
              <Text fontSize="58px" fontWeight="950" fontStyle="italic" lineHeight={1} color={pal.brand} letterSpacing="-0.03em" {...tab}>{g.y}</Text>
              <Text fontSize="17px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" {...tab}>{g.c} of {g.t} · {g.td} TD</Text>
            </Flex>
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const Streaks = (props) => {
  const cols = (k, label) => [{ label, get: (r) => r[k], w: 80, strong: true }];
  return (
    <RPoster {...props} title="Streaks">
      <Panels>
        <Table pal={props.pal} title="100 yard games" rows={DATA.streak_100} cols={cols("y100", "Games")} />
        <Table pal={props.pal} title="Straight games with a TD" rows={DATA.streak_td} cols={cols("td_best", "Games")} />
        <Table pal={props.pal} title="Straight games with 5+ catches" rows={DATA.streak_c5} cols={cols("c5_best", "Games")} />
        <Table pal={props.pal} title="Straight games with 50+ yards" rows={DATA.streak_50} cols={cols("y50_best", "Games")} />
      </Panels>
    </RPoster>
  );
};

export const TeamLast3 = (props) => (
  <RPoster {...props} title="EPA per pass, last 3 games against before">
    <Dumbbell pal={props.pal} rows={DATA.team_last3} name={() => undefined} a={(r) => r.epa_before} b={(r) => r.epa_last3} fmt={epa} aLabel="Before" bLabel="Last 3" />
  </RPoster>
);

export const LeagueWeeks = (props) => {
  const { pal } = props;
  const W = POSTER_W - 168;
  const Part = ({ title, y, fmt }) => (
    <Box>
      <Text fontSize="20px" color={pal.orange} mb="2px" {...caps}>{title}</Text>
      <Line pal={pal} rows={DATA.league_week} y={y} yFmt={fmt} xLabelOf={(r) => `W${r.week}`} w={W} h={250} />
    </Box>
  );
  return (
    <RPoster {...props} title="League passing by week, 2026">
      <Flex direction="column" gap="14px">
        <Part title="EPA per attempt" y={(r) => r.epa} fmt={(v) => v.toFixed(2)} />
        <Part title="Yards per attempt" y={(r) => r.ypa} fmt={(v) => v.toFixed(1)} />
        <Part title="Completion rate" y={(r) => r.comp} fmt={(v) => `${(v * 100).toFixed(1)}%`} />
      </Flex>
    </RPoster>
  );
};
