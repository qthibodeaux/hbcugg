import { DATA, fgOf, RPoster, BigStat, pct, tab, int, caps, Card, Logo, one, Board, Who, Table, Panels, teamShortName } from "../kit";
import { Grid, Box, Text, Flex } from "@chakra-ui/react";

const FY = DATA.first_year;

export const Pipeline = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const max = Math.max(...FY.tiers.map((t) => t.yards));
  return (
    <RPoster {...props} title="Where the yards came from">
      <Grid templateColumns="330px minmax(0,1fr)" columnGap="44px" alignItems="center" mb="22px">
        <BigStat pal={pal} value={pct(FY.yards / FY.of)} label="Of all receiving yards came from first year transfers" size={120} />
        <Box>
          {FY.tiers.map((t) => (
            <Grid key={t.tier} templateColumns="130px minmax(0,1fr) 90px 100px" columnGap="14px" alignItems="center" h="44px" borderBottom={`1px solid ${fg(0.06)}`}>
              <Text fontSize="20px" fontWeight="950" textTransform="uppercase">{t.tier}</Text>
              <Box h="18px" bg={fg(0.06)}><Box h="100%" bg={pal.brand} style={{ width: `${(t.yards / max) * 100}%` }} /></Box>
              <Text fontSize="22px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{int(t.yards)}</Text>
              <Text fontSize="15px" textAlign="right" color={fg(0.6)} {...caps}>{t.players} players</Text>
            </Grid>
          ))}
        </Box>
      </Grid>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px">
        {FY.top.filter((r) => r.from).slice(0, 6).map((r) => (
          <Card key={r.name} pal={pal} gap="6px">
            <Flex align="center" gap="10px">
              <Logo id={r.id} size={40} />
              <Text fontSize="21px" fontWeight="950" lineHeight={1.05} textTransform="uppercase">{r.name}</Text>
            </Flex>
            <Flex justify="space-between" align="baseline" gap="10px">
              <Text fontSize="15px" color={fg(0.6)} {...caps}>From {r.from}</Text>
              <Text fontSize="26px" fontWeight="950" color={pal.orange} whiteSpace="nowrap" {...tab}>{one(r.ypg)}</Text>
            </Flex>
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const TransferShare = (props) => (
  <RPoster {...props} title="Receiving yards from first year transfers">
    <Board pal={props.pal} rows={FY.teams} name={() => undefined} get={(r) => r.share} fmt={pct} label="Share" rowH={46} />
  </RPoster>
);

export const TransferBoard = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const max = Math.max(...FY.top.map((r) => r.ypg));
  const cols = "44px 310px 270px minmax(0,1fr) 90px";
  return (
    <RPoster {...props} title="Yards per game, first year at the school">
      <Grid templateColumns={cols} columnGap="14px" pb="8px" borderBottom={`1px solid ${fg(0.12)}`}>
        <Box /><Box />
        <Text fontSize="14px" color={fg(0.5)} {...caps}>Transferred from</Text>
        <Box />
        <Text fontSize="14px" textAlign="right" color={fg(0.5)} {...caps}>Per game</Text>
      </Grid>
      {FY.top.map((r, i) => (
        <Grid key={r.name} templateColumns={cols} columnGap="14px" alignItems="center" h="56px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Text fontSize="20px" fontWeight="900" color={fg(0.45)} {...tab}>{i + 1}</Text>
          <Who pal={pal} id={r.id} name={r.name} />
          <Text fontSize="21px" fontWeight="950" fontStyle="italic" textTransform="uppercase" whiteSpace="nowrap" color={pal.brand}>{r.from ?? "—"}</Text>
          <Box h="16px" bg={fg(0.06)}><Box h="100%" bg={pal.brand} style={{ width: `${(r.ypg / max) * 100}%` }} /></Box>
          <Text fontSize="24px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{one(r.ypg)}</Text>
        </Grid>
      ))}
    </RPoster>
  );
};

export const TransferTable = (props) => (
  <RPoster {...props} title="Top first year transfers">
    <Table pal={props.pal} rows={FY.top} cols={[
      { label: "From", get: (r) => r.from ?? "—", w: 220 }, { label: "Level", get: (r) => r.tier ?? "—", w: 70 }, { label: "G", get: (r) => r.games, w: 40 }, { label: "Yds", get: (r) => r.yards, w: 60 }, { label: "TD", get: (r) => r.td, w: 40 }, { label: "Per game", get: (r) => one(r.ypg), w: 100, strong: true },
    ]} />
  </RPoster>
);

export const YoungTable = (props) => {
  const cols = [{ label: "Yds", get: (r) => r.yards, w: 50 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Share", get: (r) => pct(r.t_share), w: 56 }, { label: "Per game", get: (r) => one(r.ypg), w: 92, strong: true }];
  return (
    <RPoster {...props} title="Top freshmen and sophomores">
      <Panels>
        <Table pal={props.pal} title="Freshmen" rows={DATA.young_fr} cols={cols} />
        <Table pal={props.pal} title="Sophomores" rows={DATA.young_so} cols={cols} />
      </Panels>
    </RPoster>
  );
};

export const ClassGrid = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  return (
    <RPoster {...props} title="Receiving yards by class">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="10px">
        {DATA.class_team.map((t) => {
          const total = t.returning_y + t.senior_y;
          return (
            <Card key={t.id} pal={pal} gap="8px" p="14px">
              <Flex align="center" gap="8px">
                <Logo id={t.id} size={30} />
                <Text flex={1} fontSize="19px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{teamShortName(t.id)}</Text>
                <Text fontSize="24px" fontWeight="950" color={pal.orange} {...tab}>{pct(t.leaving)}</Text>
              </Flex>
              <Flex h="18px" bg={fg(0.06)}>
                <Box bg={pal.brand} style={{ width: `${(t.senior_y / total) * 100}%` }} />
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="14px" color={fg(0.6)} {...caps}>Seniors {int(t.senior_y)}</Text>
                <Text fontSize="14px" color={fg(0.6)} {...caps}>Younger {int(t.returning_y)}</Text>
              </Flex>
            </Card>
          );
        })}
      </Grid>
    </RPoster>
  );
};
