import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { DATA, InfoPoster, Scatter, Table, int, one, epa, lastName, pct, Who, chg, Line, Logo, caps, fgOf, tab, uniqueBy } from "../kit";
import { BigLogo, Butterfly, Columns, Giant, Hero, WinLadder } from "../infoParts";
import { teamFillColors } from "../../../../game/export/exportData";
import { Card as Panel, Dots, NumberTile } from "../../dlinePosters/PosterPrimitives";
import { Bars, Cols, pairWho, who15 } from "./Primitives";

// ── The leaders: a podium, then the scatter beside the rest of the list ───────

const Podium = ({ r, place, h }) => {
  const c = teamFillColors(r.id);
  return (
    <Flex direction="column" justify="flex-end" px="24px" pb="22px" pt="18px" minW={0} style={{ height: h, background: c.fill, color: c.ink }}>
      <Text fontSize="26px" fontWeight="950" fontStyle="italic" mb="auto">#{place}</Text>
      <Box w="fit-content" bg="rgba(255,255,255,0.92)" p="5px" mb="10px"><BigLogo id={r.id} size={46} /></Box>
      <Text fontSize="30px" fontWeight="950" lineHeight={1} textTransform="uppercase">{r.name}</Text>
      <Giant size={place === 1 ? 116 : 92} mt="8px">{one(r.ypg)}</Giant>
      <Text fontSize="15px" mt="8px" {...caps}>{r.catches} catches · {int(r.yards)} yds · {r.td} TD</Text>
    </Flex>
  );
};

export const LeadersInfo = ({ pal, innerRef }) => {
  const list = DATA.leaders_ypg.filter((r) => r.name !== "Zaden Jackson");
  const george = DATA.value[0], bean = DATA.td_rate[0];
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Leading" accent="Pass Catchers">
      <Cols t="repeat(3, minmax(0,1fr))" alignItems="end">
        <Podium r={list[1]} place={2} h={370} />
        <Podium r={list[0]} place={1} h={430} />
        <Podium r={list[2]} place={3} h={330} />
      </Cols>
      <Cols t="minmax(0,1.65fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="Yards per game × value per target">
          <Scatter pal={pal} rows={uniqueBy([...DATA.value, ...DATA.low_value], "name")} w={752} h={640} logo={34} x={(r) => r.ypg} y={(r) => r.epa} xFmt={(v) => v.toFixed(0)} yFmt={epa} xLabel="Yards per game" yLabel="EPA per target" label={(r) => lastName(r.name)} />
        </Panel>
        <Flex direction="column" gap="2px">
          <Panel pal={pal} kicker="The rest of the top 9">
            <Table pal={pal} rows={list.slice(3)} rowH={38} who={who15(pal)} cols={[{ label: "TD", get: (r) => r.td, w: 34 }, { label: "Per game", get: (r) => one(r.ypg), w: 84, strong: true }]} />
          </Panel>
          <Panel pal={pal} kicker="Lots of yards, low success rate">
            <Table pal={pal} rows={DATA.low_value.slice(0, 6)} rowH={38} who={who15(pal)} cols={[{ label: "Per game", get: (r) => one(r.ypg), w: 80 }, { label: "Success", get: (r) => pct(r.success), w: 72, strong: true }]} />
          </Panel>
        </Flex>
      </Cols>
      <Cols t="repeat(2, minmax(0,1fr))">
        <NumberTile pal={pal} value={epa(george.epa)} ink={pal.brand} title={`${lastName(george.name)}: the most value`} text={`EPA per target, with a ${pct(george.success)} success rate.`} />
        <NumberTile pal={pal} value={pct(bean.td_rate)} ink={pal.orange} title={`${lastName(bean.name)}: the end zone`} text={`${bean.td} touchdowns on ${bean.targets} targets.`} />
      </Cols>
      <Cols t="repeat(2, minmax(0,1fr))">
        <Panel pal={pal} kicker="First downs per target"><Columns pal={pal} rows={DATA.first_downs} get={(r) => r.conv_t} fmt={pct} h={190} sub={(r) => lastName(r.name)} /></Panel>
        <Panel pal={pal} kicker="Touchdowns per target"><Columns pal={pal} rows={DATA.td_rate} get={(r) => r.td_rate} fmt={pct} h={190} sub={(r) => lastName(r.name)} /></Panel>
      </Cols>
    </InfoPoster>
  );
};

// ── Clutch: a hero play beside the table, then the win chance ladder ──────────

const clockSeconds = (c) => { const [m, s] = c.split(":").map(Number); return m * 60 + s; };

export const ClutchInfo = ({ pal, innerRef }) => {
  const muk = DATA.wp_catches[0], bluitt = DATA.tied_trailing[0], wright = DATA.wp_season[0];
  const byClock = [...DATA.wp_catches].sort((a, b) => clockSeconds(b.clock) - clockSeconds(a.clock));
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Who delivers" accent="when it matters">
      <Cols t="minmax(0,1fr) minmax(0,1.25fr)">
        <Hero pal={pal} kicker="The biggest swing" justify="space-between">
          <Box>
            <Giant size={150}>+{Math.round((muk.post - muk.pre) * 100)}</Giant>
            <Text fontSize="34px" fontWeight="950" textTransform="uppercase" mt="10px" lineHeight={1}>{muk.name}</Text>
            <Text fontSize="20px" fontWeight="700" mt="10px" lineHeight={1.3}>A 54 yard catch with 0:19 left took TSU from {pct(muk.pre)} to {pct(muk.post)}. Alcorn still won in overtime.</Text>
          </Box>
          <Box position="relative" h="26px" mt="20px" bg="rgba(255,255,255,0.25)">
            <Box position="absolute" top={0} bottom={0} bg="#FFFFFF" style={{ left: `${muk.pre * 100}%`, width: `${(muk.post - muk.pre) * 100}%` }} />
          </Box>
        </Hero>
        <Panel pal={pal} kicker="3rd and 4th down catches that moved the chains or scored">
          <Table pal={pal} rows={DATA.c34} rowH={40} who={who15(pal)} cols={[{ label: "Targets", get: (r) => r.targets_34, w: 76 }, { label: "Yards", get: (r) => r.y, w: 60 }, { label: "Catches", get: (r) => r.n, w: 80, strong: true }]} />
        </Panel>
      </Cols>
      <Panel pal={pal} kicker="Win chance before and after the catch, in order of the clock">
        <Box pt="30px"><WinLadder pal={pal} rows={byClock} /></Box>
      </Panel>
      <Cols t="minmax(0,1.15fr) minmax(0,1fr)">
        <Panel pal={pal} kicker="Win chance added on catches"><Bars pal={pal} rows={DATA.wp_season} get={(r) => r.wp} fmt={(v) => `+${v.toFixed(0)}`} rowH={38} /></Panel>
        <Flex direction="column" gap="2px">
          <NumberTile pal={pal} value={bluitt.y} ink={pal.up} title={`${lastName(bluitt.name)}: from behind`} text={`Yards while tied or trailing in the 4th or overtime, on ${bluitt.n} catches with ${bluitt.td} TDs.`} />
          <NumberTile pal={pal} value={`+${Math.round(wright.wp)}`} ink={pal.orange} title={`${lastName(wright.name)}: the most added`} text={`Points of win chance added on his ${wright.catches} catches.`} />
          <Hero pal={pal} tone="ink" flex={1} justify="center">
            <Text fontSize="16px" opacity={0.75} {...caps}>Touchdowns that took the lead</Text>
            <Flex gap="26px" mt="10px" wrap="wrap">
              {DATA.took_lead.slice(0, 3).map((r) => (
                <Box key={r.name}><Giant size={54}>{r.n}</Giant><Text fontSize="14px" {...caps}>{lastName(r.name)}</Text></Box>
              ))}
            </Flex>
          </Hero>
        </Flex>
      </Cols>
      <Cols t="repeat(3, minmax(0,1fr))">
        <Panel pal={pal} kicker="Last 2 minutes of a half">
          <Table pal={pal} rows={DATA.c2min.slice(0, 8)} rowH={38} who={who15(pal)} cols={[{ label: "Yds", get: (r) => r.y, w: 44 }, { label: "Rec", get: (r) => r.n, w: 44, strong: true }]} />
        </Panel>
        <Panel pal={pal} kicker="Go To Targets: Who targets when trailing in the 4th">
          <Table pal={pal} rows={DATA.trailing.slice(0, 8)} rowH={38} who={who15(pal)} cols={[{ label: "Yds", get: (r) => r.y, w: 44 }, { label: "Tgt", get: (r) => r.t, w: 44, strong: true }]} />
        </Panel>
        <Panel pal={pal} kicker="Quarterback and receiver">
          <Table pal={pal} rows={DATA.pairs_clutch} rowH={38} who={pairWho(pal)} cols={[{ label: "Yds", get: (r) => r.y, w: 44 }, { label: "Big", get: (r) => r.n, w: 40, strong: true }]} />
        </Panel>
      </Cols>
    </InfoPoster>
  );
};

// ── Week to week: the butterfly leads, then one huge game and its neighbors ───

export const WeeklyInfo = ({ pal, innerRef }) => {
  const fg = fgOf(pal);
  const bean = DATA.best_games[0];
  const signed = (v) => `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`;
  return (
    <InfoPoster pal={pal} innerRef={innerRef} title="Who's" accent="heating up">
      <Panel pal={pal} kicker="Yards per game, last 3 games against before: cooling off, heating up">
        <Butterfly pal={pal} left={DATA.last3_down} right={DATA.last3_up.slice(0, DATA.last3_down.length)} get={(r) => r.chg} fmt={signed} />
      </Panel>
      <Cols t="minmax(0,1fr) minmax(0,1.7fr)">
        <Hero pal={pal} tone={teamFillColors(bean.id)} kicker="The best game of the year" justify="center">
          <Flex align="center" gap="12px"><Box bg="rgba(255,255,255,0.92)" p="4px"><BigLogo id={bean.id} size={46} /></Box><Text fontSize="30px" fontWeight="950" lineHeight={1} textTransform="uppercase">{bean.name}</Text></Flex>
          <Giant size={168} mt="14px">{bean.y}</Giant>
          <Text fontSize="22px" mt="10px" {...caps}>{bean.c} for {bean.t} · {bean.td} TD · Week {bean.week}</Text>
        </Hero>
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px">
          {DATA.best_games.slice(1, 10).map((g, i) => (
            <Flex key={i} direction="column" justify="center" bg={pal.panel} px="16px" py="14px" minW={0}>
              <Flex align="center" gap="8px" minW={0}><Logo id={g.id} size={26} /><Text fontSize="15px" fontWeight="950" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(g.name)}</Text></Flex>
              <Text fontSize="44px" fontWeight="950" fontStyle="italic" lineHeight={1.05} color={pal.brand} {...tab}>{g.y}</Text>
              <Text fontSize="13px" color={fg(0.6)} {...caps}>{g.c} of {g.t} · {g.td} TD</Text>
            </Flex>
          ))}
        </Grid>
      </Cols>
      <Panel pal={pal} kicker="League EPA per attempt, week by week">
        <Line pal={pal} rows={DATA.league_week} y={(r) => r.epa} yFmt={(v) => v.toFixed(2)} xLabelOf={(r) => `W${r.week}`} w={1240} h={200} />
      </Panel>
      <Cols t="repeat(3, minmax(0,1fr))">
        <Panel pal={pal} kicker="Straight games with a TD">
          {DATA.streak_td.slice(0, 5).map((r) => (
            <Box key={r.name} py="9px" borderBottom={`1px solid ${fg(0.06)}`}>
              <Who pal={pal} id={r.id} name={r.name} size={26} font="15px" />
              <Box mt="8px"><Dots pal={pal} n={r.games} filled={r.td_best} ink={pal.up} size={20} /></Box>
            </Box>
          ))}
        </Panel>
        <Panel pal={pal} kicker="Share of team targets, before to last 3">
          <Table pal={pal} rows={DATA.share_jump} rowH={46} who={who15(pal)} cols={[{ label: "Share", get: (r) => chg(pal, r.share_before, r.share_last3, pct), w: 110 }]} />
        </Panel>
        <Panel pal={pal} kicker="Team EPA per pass, before to last 3">
          <Table pal={pal} name={() => undefined} rows={DATA.team_last3.slice(0, 8)} rowH={46} cols={[{ label: "EPA", get: (r) => chg(pal, r.epa_before, r.epa_last3, epa), w: 160 }]} />
        </Panel>
      </Cols>
    </InfoPoster>
  );
};
