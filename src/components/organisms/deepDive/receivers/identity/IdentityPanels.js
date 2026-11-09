import { fgOf, RPoster, Card, caps, DATA, Logo, teamShortName, tab, one, Scatter, pct, epa, Dumbbell, Panels, Table, Board, int } from "../kit";
import { Grid, Text, Box, Flex } from "@chakra-ui/react";
import { DOWNS } from "../trust/TrustPanels";

// Receiver type, depth, game-context, class and tendency panels.

const TYPE_ORDER = ["Deep Shot", "Quick Game", "Spread It Around", "One-Man Show", "Balanced"];

const typeLabel = (t) => t.replace("One-Man", "One Man");

export const Types = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  return (
    <RPoster {...props} title="What kind of passing offense is it">
      <Grid templateColumns="repeat(5, minmax(0,1fr))" gap="10px" alignItems="start">
        {TYPE_ORDER.map((type) => (
          <Card key={type} pal={pal} p="14px" gap="4px">
            <Text fontSize="22px" fontWeight="950" fontStyle="italic" lineHeight={1} minH="46px" color={pal.brand} textTransform="uppercase">{typeLabel(type)}</Text>
            <Grid templateColumns="minmax(0,1fr) 54px" pb="4px" borderBottom={`1px solid ${fg(0.12)}`}>
              <Box />
              <Text fontSize="12px" textAlign="right" color={fg(0.5)} {...caps}>Depth</Text>
            </Grid>
            {DATA.types.filter((t) => t.type === type).map((t) => (
              <Grid key={t.id} templateColumns="minmax(0,1fr) 54px" alignItems="center" h="56px" borderBottom={`1px solid ${fg(0.06)}`}>
                <Flex align="center" gap="6px" minW={0}>
                  <Logo id={t.id} size={32} />
                  <Text fontSize="15px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{teamShortName(t.id)}</Text>
                </Flex>
                <Text fontSize="19px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{one(t.adot)}</Text>
              </Grid>
            ))}
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const DeepEpa = (props) => (
  <RPoster {...props} title="Deep throw rate × EPA per pass">
    <Scatter pal={props.pal} rows={DATA.depth_team} x={(r) => r.deep_rate} y={(r) => r.epa} xFmt={pct} yFmt={epa} xLabel="Share of throws 13+ air yards" yLabel="EPA per pass" />
  </RPoster>
);

export const ByScore = (props) => (
  <RPoster {...props} title="Neutral down pass rate, leading and trailing">
    <Dumbbell pal={props.pal} rows={DATA.by_score} name={() => undefined} a={(r) => r.lead} b={(r) => r.trail} fmt={pct} aLabel="Leading" bLabel="Trailing" rowH={46} />
  </RPoster>
);

export const GroupGrid = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  return (
    <RPoster {...props} title="Who gets the targets">
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="10px">
        {DATA.group_use.map((t) => (
          <Card key={t.id} pal={pal} p="14px" gap="8px">
            <Flex align="center" gap="8px">
              <Logo id={t.id} size={30} />
              <Text fontSize="19px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap">{teamShortName(t.id)}</Text>
            </Flex>
            <Flex h="20px" columnGap="2px">
              <Box bg={fg(0.2)} style={{ flex: t.share_WR ?? 0 }} />
              {t.share_TE > 0 && <Box bg={pal.brand} style={{ flex: t.share_TE }} />}
              {t.share_RB > 0 && <Box bg={pal.orange} style={{ flex: t.share_RB }} />}
            </Flex>
            <Grid templateColumns="repeat(3, minmax(0,1fr))">
              <Text fontSize="16px" fontWeight="900" color={fg(0.65)} {...tab}>WR {pct(t.share_WR)}</Text>
              <Text fontSize="16px" fontWeight="900" textAlign="center" color={pal.brand} {...tab}>TE {pct(t.share_TE)}</Text>
              <Text fontSize="16px" fontWeight="900" textAlign="right" color={pal.orange} {...tab}>RB {pct(t.share_RB)}</Text>
            </Grid>
          </Card>
        ))}
      </Grid>
    </RPoster>
  );
};

export const TeBacks = (props) => (
  <RPoster {...props} title="Tight ends and backs">
    <Panels>
      <Table pal={props.pal} title="Top tight ends" rows={DATA.top_te} cols={[{ label: "Yds", get: (r) => r.yards, w: 50 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Per game", get: (r) => one(r.ypg), w: 92, strong: true }]} />
      <Table pal={props.pal} title="Top pass catching backs" rows={DATA.top_rb} cols={[{ label: "Yds", get: (r) => r.yards, w: 50 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Per game", get: (r) => one(r.ypg), w: 92, strong: true }]} />
    </Panels>
    <Box mt="28px">
      <Table pal={props.pal} title="Tight ends on 3rd down and in the red zone" rows={DATA.te_third} cols={[{ label: "Targets", get: (r) => r.t, w: 90 }, { label: "Catches", get: (r) => r.c, w: 90 }, { label: "Converted", get: (r) => r.conv, w: 110 }, { label: "TD", get: (r) => r.td, w: 70, strong: true }]} />
    </Box>
  </RPoster>
);

const CLASS_NAMES = { 1: "Freshmen", 2: "Sophomores", 3: "Juniors", 4: "Seniors", 5: "Grads" };

export const ClassLeague = (props) => (
  <RPoster {...props} title="Receiving yards by class year">
    <Board pal={props.pal} rows={DATA.class_league.filter((r) => CLASS_NAMES[r.class_year])} name={(r) => CLASS_NAMES[r.class_year]} get={(r) => r.yards} fmt={int} label="Yards" extras={[{ label: "Players", get: (r) => r.players }, { label: "TD", get: (r) => r.td }]} rowH={70} />
  </RPoster>
);

export const Profile = (props) => (
  <RPoster {...props} title="Early down pass rate, and what came of it">
    <Table pal={props.pal} name={() => undefined} rows={DATA.profile} rowH={42} cols={[
      { label: "Neutral", get: (r) => pct(r.pass_rate), w: 110, strong: true }, { label: "1st and 10", get: (r) => pct(r.first10), w: 130 }, { label: "EPA all", get: (r) => epa(r.epa_all), w: 110 }, { label: "EPA pass", get: (r) => epa(r.epa_pass), w: 110 }, { label: "EPA run", get: (r) => epa(r.epa_rush), w: 110 }, { label: "Pass success", get: (r) => pct(r.succ_pass), w: 140 }, { label: "Run success", get: (r) => pct(r.succ_rush), w: 130 },
    ]} />
  </RPoster>
);

const BANDS = ["short", "medium", "long"];

export const Tendency = (props) => {
  const { pal } = props;
  const fg = fgOf(pal);
  const rgb = String(pal.brand).replace("#", "").match(/../g).map((h) => parseInt(h, 16)).join(",");
  const at = (d, b) => DATA.tendency.find((r) => r.down === d && r.band === b);
  return (
    <RPoster {...props} title="League pass rate by down and distance">
      <Grid templateColumns="120px repeat(3, minmax(0,1fr))" gap="4px">
        <Box />
        {BANDS.map((b) => <Text key={b} fontSize="20px" textAlign="center" color={fg(0.6)} {...caps}>{b}</Text>)}
        {[1, 2, 3, 4].map((d) => (
          <Box key={d} display="contents">
            <Flex align="center"><Text fontSize="30px" fontWeight="950" fontStyle="italic" textTransform="uppercase">{DOWNS[d - 1]}</Text></Flex>
            {BANDS.map((b) => {
              const c = at(d, b);
              return (
                <Flex key={b} h="130px" align="center" justify="center" style={{ background: `rgba(${rgb}, ${c ? 0.06 + c.mean * 0.9 : 0.04})`, color: c && c.mean > 0.5 ? "#FFFFFF" : pal.ink }}>
                  <Text fontSize="46px" fontWeight="950" {...tab}>{c ? pct(c.mean) : "—"}</Text>
                </Flex>
              );
            })}
          </Box>
        ))}
      </Grid>
    </RPoster>
  );
};

export const SecondShort = (props) => (
  <RPoster {...props} title="2nd and short, by team">
    <Table pal={props.pal} name={() => undefined} rows={DATA.second_short} rowH={42} cols={[{ label: "Snaps", get: (r) => r.snaps, w: 150 }, { label: "Deep shots", get: (r) => r.shots, w: 170 }, { label: "Pass rate", get: (r) => pct(r.pass_rate), w: 170, strong: true }]} />
  </RPoster>
);
