import { lastName, fgOf, DATA, Card, Logo, teamShortName, caps, tab, pct, RPoster, Board, one, Table, Panels, epa } from "../kit";
import { Grid, Flex, Text, Box } from "@chakra-ui/react";

// Receiver situational trust, share and quarterback-pair panels using published source fields.

export const DOWNS = ["1st", "2nd", "3rd", "4th"];

const namesOf = (d) => {
  const last = d.names.map(lastName);
  return last.length > 2 ? `${last.slice(0, 2).join(" / ")} +${last.length - 2}` : last.join(" / ");
};

export const GoToTiles = ({ pal }) => {
  const fg = fgOf(pal);
  return (
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="10px">
        {DATA.go_by_down.map((t) => (
          <Card key={t.id} pal={pal} p="12px" gap="6px">
            <Flex align="center" gap="8px" pb="6px" borderBottom={`1px solid ${fg(0.12)}`}>
              <Logo id={t.id} size={30} />
              <Text fontSize="20px" fontWeight="950" textTransform="uppercase">{teamShortName(t.id)}</Text>
            </Flex>
            {t.downs.map((d, i) => (
              <Grid key={DOWNS[i]} templateColumns="34px minmax(0,1fr) 60px 44px" columnGap="6px" alignItems="center" h="26px">
                <Text fontSize="13px" color={fg(0.55)} {...caps}>{DOWNS[i]}</Text>
                <Text fontSize="15px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{d ? namesOf(d) : "—"}</Text>
                <Text fontSize="13px" fontWeight="800" textAlign="right" color={fg(0.6)} whiteSpace="nowrap" {...tab}>{d ? `${d.t} of ${d.of}` : ""}</Text>
                <Text fontSize="16px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{d ? pct(d.share) : ""}</Text>
              </Grid>
            ))}
          </Card>
        ))}
      </Grid>
  );
};

export const GoToGrid = (props) => (
  <RPoster {...props} title="The go to target on every down">
    <GoToTiles pal={props.pal} />
  </RPoster>
);

export const TargetShare = (props) => (
  <RPoster {...props} title="Largest share of team targets">
    <Board pal={props.pal} rows={DATA.t_share} get={(r) => r.t_share} fmt={pct} label="Targets" extras={[{ label: "Yards", get: (r) => pct(r.y_share) }, { label: "Per game", get: (r) => one(r.ypg), w: 100 }]} />
  </RPoster>
);

export const YardsShare = (props) => (
  <RPoster {...props} title="Largest share of team receiving yards">
    <Board pal={props.pal} rows={DATA.y_share} get={(r) => r.y_share} fmt={pct} label="Yards" extras={[{ label: "Targets", get: (r) => pct(r.t_share) }]} />
  </RPoster>
);

export const Situation = (props) => (
  <RPoster {...props} title="Go to target by situation">
    <Table pal={props.pal} name={() => undefined} rows={DATA.go_situation} rowH={42} cols={[
      { label: "Overall", get: (r) => r.overall, w: 196, strong: true }, { label: "1st down", get: (r) => r["1st"], w: 196 }, { label: "3rd down", get: (r) => r["3rd"], w: 196 }, { label: "Red zone", get: (r) => r.rz, w: 178 }, { label: "4th quarter", get: (r) => r.q4, w: 178 },
    ]} />
  </RPoster>
);

export const Trusted = (props) => (
  <RPoster {...props} title="Share of team targets on 3rd and 4th down">
    <Board pal={props.pal} rows={DATA.trusted} get={(r) => r.share} fmt={pct} label="Share" extras={[{ label: "Targets", get: (r) => r.t }, { label: "Converted", get: (r) => r.conv, w: 104 }, { label: "Rate", get: (r) => pct(r.rate) }]} />
  </RPoster>
);

const pairWho = (pal) => (r) => (
  <Flex align="center" gap="10px" minW={0}>
    <Logo id={r.id} size={28} />
    <Text fontSize="17px" fontWeight="900" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.qb)} to {lastName(r.wr)}</Text>
  </Flex>
);

export const QbTables = (props) => (
  <RPoster {...props} title="Who the quarterback looks for">
    <Panels>
      <Table pal={props.pal} title="Most reliable target" rows={DATA.reliable} who={pairWho(props.pal)} cols={[{ label: "Rec", get: (r) => `${r.c}/${r.t}`, w: 62 }, { label: "Rate", get: (r) => pct(r.rate), w: 64, strong: true }]} />
      <Table pal={props.pal} title="3rd and 7 or more" rows={DATA.third_long} who={pairWho(props.pal)} cols={[{ label: "Rec", get: (r) => r.c, w: 44 }, { label: "Conv", get: (r) => r.conv, w: 50 }, { label: "Targets", get: (r) => r.t, w: 74, strong: true }]} />
    </Panels>
  </RPoster>
);

export const Pairs = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  return (
    <RPoster {...props} title="The best connections">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px" mb="22px">
        {DATA.pairs.slice(0, 6).map((r) => (
          <Card key={`${r.qb}${r.wr}`} pal={pal} gap="8px">
            <Flex align="center" gap="10px">
              <Logo id={r.id} size={42} />
              <Box minW={0}>
                <Text fontSize="14px" color={fg(0.6)} whiteSpace="nowrap" {...caps}>{r.qb} to</Text>
                <Text fontSize="23px" fontWeight="950" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap">{r.wr}</Text>
              </Box>
            </Flex>
            <Flex justify="space-between" align="baseline">
              <Text fontSize="46px" fontWeight="950" fontStyle="italic" lineHeight={1} color={pal.brand} {...tab}>{r.y}</Text>
              <Text fontSize="18px" fontWeight="900" textTransform="uppercase" {...tab}>{r.td} TD · {epa(r.epa)} EPA</Text>
            </Flex>
          </Card>
        ))}
      </Grid>
      <Table pal={pal} title="Most clutch pairs" rows={DATA.pairs_clutch.slice(0, 6)} who={pairWho(pal)} rowH={42} cols={[{ label: "Yds", get: (r) => r.y, w: 70 }, { label: "Big catches", get: (r) => r.n, w: 130, strong: true }]} />
    </RPoster>
  );
};
