import { fgOf, caps, tab, one, Logo, lastName, DATA, RPoster, Dumbbell, epa, POSTER_W, Line } from "../kit";
import { Box, Text, Flex, Grid } from "@chakra-ui/react";

export const spread = (ys, gap, lo, hi) => {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  order.forEach((o, k) => { if (k && o.y < order[k - 1].y + gap) o.y = order[k - 1].y + gap; });
  const over = order.length ? order[order.length - 1].y - hi : 0;
  if (over > 0) {
    order[order.length - 1].y = hi;
    for (let k = order.length - 2; k >= 0; k -= 1) if (order[k].y > order[k + 1].y - gap) order[k].y = order[k + 1].y - gap;
  }
  const out = [];
  order.forEach((o) => { out[o.i] = Math.max(o.y, lo); });
  return out;
};

const Slope = ({ pal, title, rows, ink, max }) => {
  const fg = fgOf(pal);
  const W = 590, H = 640, T = 34, B = 16, LX = 76, RX = 340;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const ly = spread(rows.map((r) => y(r.ypg_25)), 25, T, H - B);
  const ry = spread(rows.map((r) => y(r.ypg)), 25, T, H - B);
  return (
    <Box>
      <Text fontSize="22px" color={ink} mb="6px" {...caps}>{title}</Text>
      <Box position="relative" w={`${W}px`} h={`${H}px`}>
        <Text position="absolute" top="0" left={`${LX - 30}px`} fontSize="16px" color={fg(0.55)} {...caps}>2025</Text>
        <Text position="absolute" top="0" left={`${RX - 22}px`} fontSize="16px" color={fg(0.55)} {...caps}>2026</Text>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          {rows.map((r) => (
            <g key={r.name}>
              <line x1={LX} y1={y(r.ypg_25)} x2={RX} y2={y(r.ypg)} stroke={ink} strokeWidth="3" />
              <circle cx={LX} cy={y(r.ypg_25)} r="5" fill={ink} />
              <circle cx={RX} cy={y(r.ypg)} r="6" fill={ink} />
            </g>
          ))}
        </svg>
        {rows.map((r, i) => (
          <Text key={r.name} position="absolute" left="0" w={`${LX - 12}px`} textAlign="right" fontSize="16px" fontWeight="800" lineHeight="20px" color={fg(0.65)} style={{ top: ly[i] - 10 }} {...tab}>{one(r.ypg_25)}</Text>
        ))}
        {rows.map((r, i) => (
          <Flex key={r.name} position="absolute" align="center" gap="6px" h="24px" style={{ left: RX + 12, top: ry[i] - 12 }}>
            <Text fontSize="18px" fontWeight="950" color={ink} {...tab}>{one(r.ypg)}</Text>
            <Logo id={r.id} size={20} />
            <Text fontSize="17px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{lastName(r.name)}</Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export const RiseFall = (props) => {
  const max = Math.max(...[...DATA.rise, ...DATA.fall].flatMap((r) => [r.ypg_25, r.ypg])) * 1.04;
  return (
    <RPoster {...props} title="Yards per game, last year to this year">
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" columnGap="20px">
        <Slope pal={props.pal} title="Biggest risers" rows={DATA.rise} ink={props.pal.up} max={max} />
        <Slope pal={props.pal} title="Biggest fallers" rows={DATA.fall} ink={props.pal.down} max={max} />
      </Grid>
    </RPoster>
  );
};

export const TeamYards = (props) => (
  <RPoster {...props} title="Pass yards per game, 2025 to 2026">
    <Dumbbell pal={props.pal} rows={[...DATA.team_yoy].sort((a, b) => b.chg_ypg - a.chg_ypg)} name={() => undefined} a={(r) => r.ypg_25} b={(r) => r.ypg_26} fmt={one} aLabel="2025" bLabel="2026" rowH={46} />
  </RPoster>
);

export const TeamEpa = (props) => (
  <RPoster {...props} title="EPA per pass, 2025 to 2026">
    <Dumbbell pal={props.pal} rows={[...DATA.team_yoy].sort((a, b) => b.chg_epa - a.chg_epa)} name={() => undefined} a={(r) => r.epa_25} b={(r) => r.epa_26} fmt={epa} aLabel="2025" bLabel="2026" rowH={46} />
  </RPoster>
);

export const LeagueSeasons = (props) => {
  const { pal } = props;
  const rows = DATA.league_seasons.filter((r) => r.season !== 2020);
  const W = POSTER_W - 168;
  const Part = ({ title, y, fmt }) => (
    <Box>
      <Text fontSize="20px" color={pal.orange} mb="2px" {...caps}>{title}</Text>
      <Line pal={pal} rows={rows} y={y} yFmt={fmt} xLabelOf={(r) => r.season} w={W} h={230} />
    </Box>
  );
  return (
    <RPoster {...props} title="League passing, 2019 to 2026">
      <Flex direction="column" gap="14px">
        <Part title="EPA per attempt" y={(r) => r.epa} fmt={(v) => v.toFixed(2)} />
        <Part title="Yards per attempt" y={(r) => r.ypa} fmt={(v) => v.toFixed(1)} />
        <Part title="Completion rate" y={(r) => r.comp} fmt={(v) => `${(v * 100).toFixed(1)}%`} />
      </Flex>
    </RPoster>
  );
};

export const LeagueTimeline = (props) => {
  const { pal } = props;
  const rows = DATA.league_weeks.filter((r) => Number.isFinite(r.epa));
  const bands = [];
  rows.forEach((r, i) => {
    const last = bands[bands.length - 1];
    if (last && last.label === r.season) last.to = i;
    else bands.push({ label: r.season, from: i, to: i });
  });
  // A band runs to the next season's first week, so the shading has no gaps.
  bands.forEach((b, i) => { if (bands[i + 1]) b.to = bands[i + 1].from; });
  return (
    <RPoster {...props} title="EPA per attempt, every week since 2019">
      <Line pal={pal} rows={rows} y={(r) => r.epa} yFmt={(v) => v.toFixed(2)} showValues={false} bands={bands} w={POSTER_W - 168} h={520} />
    </RPoster>
  );
};
