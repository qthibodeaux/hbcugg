import { fgOf, RPoster, Card, Logo, caps, teamShortName, DATA, tab, pct, Board, Panels, Table } from "../kit";
import { Grid, Flex, Box, Text } from "@chakra-ui/react";

const PLAYS = [
  { name: "Dayvian Bluitt", id: "swacmvsu", opp: "swactsu", at: "at", gain: "71 yard TD", when: "4th and 13", clock: "4:42 left, 4th quarter", result: "Won 38-34" },
  { name: "Armand Burris", id: "swacfamu", opp: "swacasu", at: "at", gain: "89 yard TD", when: "3rd and 7", clock: "6:03 left, 4th quarter", result: "Won 28-27" },
  { name: "Rickie Shaw II", id: "swacbcu", opp: "swacjsu", at: "vs", gain: "19 yard TD", when: "3rd and 11", clock: "0:40 left, 4th quarter", result: "Won 24-21" },
  { name: "Armon Wright", id: "swacalc", opp: "swacuapb", at: "vs", gain: "3 yard TD", when: "4th and 3", clock: "Overtime", result: "Won 53-51" },
  { name: "Tyson George", id: "swacgsu", opp: "swacalc", at: "vs", gain: "11 yard TD", when: "2nd and 10", clock: "0:19 left, 4th quarter", result: "Won 63-59" },
  { name: "Fatu Mukuba", id: "swactsu", opp: "swacalc", at: "at", gain: "54 yards", when: "2nd and 5", clock: "0:19 left, 4th quarter", result: "Lost 43-40 in OT" },
];

export const ClutchPlays = (props) => {
  const fg = fgOf(props.pal);
  return (
    <RPoster {...props} title="The catches that decided games">
      <Grid templateColumns="repeat(2, minmax(0,1fr))" gap="14px">
        {PLAYS.map((p) => (
          <Card key={p.name} pal={props.pal} gap="10px">
            <Flex align="center" gap="12px">
              <Logo id={p.id} size={52} />
              <Box minW={0}>
                <Text fontSize="26px" fontWeight="950" lineHeight={1} textTransform="uppercase">{p.name}</Text>
                <Flex align="center" gap="6px" mt="4px">
                  <Text fontSize="14px" color={fg(0.55)} {...caps}>{p.at}</Text>
                  <Logo id={p.opp} size={20} />
                  <Text fontSize="14px" color={fg(0.55)} {...caps}>{teamShortName(p.opp)}</Text>
                </Flex>
              </Box>
            </Flex>
            <Text fontSize="44px" fontWeight="950" fontStyle="italic" lineHeight={1} color={props.pal.brand} textTransform="uppercase" letterSpacing="-0.02em">{p.gain}</Text>
            <Flex justify="space-between" align="baseline" gap="12px">
              <Text fontSize="22px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{p.when}</Text>
              <Text fontSize="16px" color={fg(0.6)} {...caps}>{p.clock}</Text>
            </Flex>
            <Text fontSize="18px" color={p.result.startsWith("Won") ? props.pal.up : props.pal.down} {...caps}>{p.result}</Text>
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const WinChanceSwings = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const cols = "300px 150px minmax(0,1fr) 74px";
  return (
    <RPoster {...props} title="Win chance before and after the catch">
      {DATA.wp_catches.map((r, i) => (
        <Grid key={i} templateColumns={cols} columnGap="16px" alignItems="center" h="62px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Flex align="center" gap="10px" minW={0}>
            <Logo id={r.id} size={34} />
            <Box minW={0}>
              <Text fontSize="19px" fontWeight="900" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap">{r.name}</Text>
              <Text fontSize="13px" color={fg(0.55)} whiteSpace="nowrap" {...caps}>vs {teamShortName(r.opp_id)}</Text>
            </Box>
          </Flex>
          <Box>
            <Text fontSize="16px" fontWeight="900" lineHeight={1.1} textTransform="uppercase" whiteSpace="nowrap">{r.down === 1 ? "1st" : r.down === 2 ? "2nd" : r.down === 3 ? "3rd" : "4th"} and {r.dist}</Text>
            <Text fontSize="13px" color={fg(0.55)} {...caps}>{r.clock} left</Text>
          </Box>
          <Box position="relative" h="22px">
            <Box position="absolute" left={0} right={0} top="8px" h="6px" bg={fg(0.08)} />
            <Box position="absolute" top="6px" h="10px" bg={pal.brand} style={{ left: `${r.pre * 100}%`, width: `${(r.post - r.pre) * 100}%` }} />
            <Text position="absolute" top="-2px" fontSize="17px" fontWeight="900" color={fg(0.65)} transform="translateX(calc(-100% - 8px))" style={{ left: `${r.pre * 100}%` }} {...tab}>{pct(r.pre)}</Text>
          </Box>
          <Text fontSize="26px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{pct(r.post)}</Text>
        </Grid>
      ))}
    </RPoster>
  );
};

export const WinChanceSeason = (props) => (
  <RPoster {...props} title="Win chance added on catches">
    <Board pal={props.pal} rows={DATA.wp_season} get={(r) => r.wp} fmt={(v) => `+${v.toFixed(0)}`} label="Points" extras={[{ label: "Catches", get: (r) => r.catches }]} />
  </RPoster>
);

export const ClutchTables = (props) => (
  <RPoster {...props} title="Situational Receiving Leaders">
    <Panels>
      <Table pal={props.pal} title="3rd and 4th down, moved the chains" rows={DATA.c34} cols={[{ label: "Targets", get: (r) => r.targets_34, w: 72 }, { label: "Yds", get: (r) => r.y, w: 50 }, { label: "Catches", get: (r) => r.n, w: 78, strong: true }]} />
      <Table pal={props.pal} title="Last 2 minutes of a half" rows={DATA.c2min} cols={[{ label: "Yds", get: (r) => r.y, w: 50 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Catches", get: (r) => r.n, w: 78, strong: true }]} />
      <Table pal={props.pal} title="TD catches that took the lead" rows={DATA.took_lead} cols={[{ label: "Catches", get: (r) => r.n, w: 78, strong: true }]} />
      <Table pal={props.pal} title="Targets when trailing in the 4th" rows={DATA.trailing} cols={[{ label: "Rec", get: (r) => r.c, w: 44 }, { label: "Yds", get: (r) => r.y, w: 50 }, { label: "Targets", get: (r) => r.t, w: 78, strong: true }]} />
    </Panels>
  </RPoster>
);
