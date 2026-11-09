import { RPoster, Scatter, uniqueBy, DATA, lastName, fgOf, tab, caps, Card, Logo, BigStat, pct, Panels, Table, one, epa, int } from "../kit";
import { Grid, Flex, Text, Box } from "@chakra-ui/react";

// Receiver depth, after-catch, lane, sticks and down-context poster compositions.

export const DepthYac = (props) => (
  <RPoster {...props} title="Target depth × yards after the catch">
    <Scatter pal={props.pal} rows={uniqueBy([...DATA.yac_per, ...DATA.deepest], "name")} x={(r) => r.adot} y={(r) => r.yac} xFmt={(v) => v.toFixed(1)} yFmt={(v) => v.toFixed(1)} xLabel="Target depth" yLabel="Yards after the catch per catch" label={(r) => lastName(r.name)} />
  </RPoster>
);

export const Lanes = ({ pal, r, h = 96 }) => {
  const fg = fgOf(pal);
  const total = r.left + r.middle + r.right;
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" h={`${h}px`} columnGap="2px">
      {[["Left", r.left], ["Middle", r.middle], ["Right", r.right]].map(([side, y]) => {
        const share = y / total;
        return (
          <Flex key={side} direction="column" align="center" justify="center" style={{ background: `rgba(${rgb}, ${0.08 + share * 0.85})`, color: share > 0.45 ? "#FFFFFF" : pal.ink }}>
            <Text fontSize="28px" fontWeight="950" lineHeight={1} {...tab}>{y}</Text>
            <Text fontSize="12px" color={share > 0.45 ? "rgba(255,255,255,0.85)" : fg(0.6)} {...caps}>{side}</Text>
          </Flex>
        );
      })}
    </Grid>
  );
};

export const Direction = (props) => {
  const { pal } = props;
  return (
    <RPoster {...props} title="Where they get their yards">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px">
        {DATA.direction.map((r) => (
          <Card key={r.name} pal={pal} gap="8px" p="14px">
            <Flex align="center" gap="8px">
              <Logo id={r.id} size={30} />
              <Text fontSize="19px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{r.name}</Text>
            </Flex>
            <Lanes pal={pal} r={r} />
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const PastSticks = (props) => {
  const { pal } = props;
  return (
    <RPoster {...props} title="Past the sticks on 3rd down × conversion rate">
      <Flex gap="70px" mb="18px">
        <BigStat pal={pal} value="44.8%" label="Converted when thrown past the sticks" ink={pal.up} size={84} />
        <BigStat pal={pal} value="27.6%" label="Converted when thrown short of them" ink={pal.down} size={84} />
      </Flex>
      <Scatter pal={pal} rows={DATA.depth_by_down} x={(r) => r.past} y={(r) => r.conv} xFmt={pct} yFmt={pct} xLabel="Thrown past the sticks" yLabel="3rd down conversions" h={640} />
    </RPoster>
  );
};

export const SticksSplit = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const max = Math.max(...DATA.sticks_split.map((r) => r.n));
  return (
    <RPoster {...props} title="3rd and 4th down conversions, how they got there">
      <Grid templateColumns="330px minmax(0,1fr)" columnGap="14px" pb="8px" borderBottom={`1px solid ${fg(0.12)}`}>
        <Box />
        <Flex justify="space-between">
          <Text fontSize="15px" color={pal.brand} {...caps}>Caught past the sticks</Text>
          <Text fontSize="15px" color={pal.orange} {...caps}>Got there after the catch</Text>
        </Flex>
      </Grid>
      {DATA.sticks_split.map((r) => (
        <Grid key={r.name} templateColumns="330px minmax(0,1fr)" columnGap="14px" alignItems="center" h="58px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Flex align="center" gap="10px"><Logo id={r.id} size={34} /><Text fontSize="20px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{r.name}</Text></Flex>
          <Flex h="32px" style={{ width: `${(r.n / max) * 100}%` }} columnGap="2px">
            {r.past > 0 && <Flex flex={r.past} bg={pal.brand} align="center" justify="center"><Text fontSize="19px" fontWeight="950" color="#FFFFFF" {...tab}>{r.past}</Text></Flex>}
            {r.after > 0 && <Flex flex={r.after} bg={pal.orange} align="center" justify="center"><Text fontSize="19px" fontWeight="950" color="#FFFFFF" {...tab}>{r.after}</Text></Flex>}
          </Flex>
        </Grid>
      ))}
    </RPoster>
  );
};

export const YardsTables = (props) => (
  <RPoster {...props}>
    <Panels>
      <Table pal={props.pal} title="After the catch, per catch" rows={DATA.yac_per} cols={[{ label: "Rec", get: (r) => r.catches, w: 44 }, { label: "Total", get: (r) => r.yac_total, w: 56 }, { label: "Per", get: (r) => one(r.yac), w: 60, strong: true }]} />
      <Table pal={props.pal} title="After the catch, total" rows={DATA.yac_total} cols={[{ label: "Rec", get: (r) => r.catches, w: 44 }, { label: "Yds", get: (r) => r.yards, w: 50 }, { label: "Total", get: (r) => r.yac_total, w: 66, strong: true }]} />
      <Table pal={props.pal} title="Deepest targets" rows={DATA.deepest} cols={[{ label: "Targets", get: (r) => r.targets, w: 72 }, { label: "Deep", get: (r) => r.deep_t, w: 50 }, { label: "Depth", get: (r) => one(r.adot), w: 66, strong: true }]} />
      <Table pal={props.pal} title="Deep threats, 13+ air yards" rows={DATA.deep_threats} cols={[{ label: "Rec", get: (r) => `${r.c}/${r.t}`, w: 56 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Yds", get: (r) => r.y, w: 60, strong: true }]} />
    </Panels>
  </RPoster>
);

export const DepthLeague = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const order = ["short", "medium", "deep"];
  const rows = order.map((d) => DATA.league_depth.find((r) => r.depth === d));
  const stats = [["Completion", (r) => pct(r.comp)], ["Yards per attempt", (r) => one(r.ypa)], ["EPA per attempt", (r) => epa(r.epa)], ["Success rate", (r) => pct(r.succ)], ["After the catch", (r) => one(r.yac)], ["TD rate", (r) => pct(r.td)], ["INT rate", (r) => pct(r.ints)]];
  return (
    <RPoster {...props} title="League passing by depth">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px">
        {rows.map((r) => (
          <Card key={r.depth} pal={pal} p="22px">
            <Text fontSize="46px" fontWeight="950" fontStyle="italic" color={pal.brand} lineHeight={1} textTransform="uppercase">{r.depth}</Text>
            <Text fontSize="15px" color={fg(0.55)} mb="14px" {...caps}>{int(r.att)} attempts</Text>
            {stats.map(([label, get]) => (
              <Flex key={label} justify="space-between" align="center" h="50px" borderTop={`1px solid ${fg(0.08)}`}>
                <Text fontSize="16px" color={fg(0.65)} {...caps}>{label}</Text>
                <Text fontSize="28px" fontWeight="950" {...tab}>{get(r)}</Text>
              </Flex>
            ))}
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const DepthByDown = (props) => (
  <RPoster {...props} title="Target depth by down">
    <Table pal={props.pal} name={() => undefined} rows={DATA.depth_by_down} rowH={42} cols={[
      { label: "1st", get: (r) => one(r.d1), w: 110 }, { label: "2nd", get: (r) => one(r.d2), w: 110 }, { label: "3rd", get: (r) => one(r.d3), w: 110 }, { label: "Past the sticks", get: (r) => pct(r.past), w: 180, strong: true }, { label: "3rd down rate", get: (r) => pct(r.conv), w: 170 },
    ]} />
  </RPoster>
);
