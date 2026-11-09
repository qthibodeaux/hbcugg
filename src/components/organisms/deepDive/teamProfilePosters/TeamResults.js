import { fgOf, T, caps, tab, toneOf } from "./posterPresentation";
import { Flex, Text, Grid, Box } from "@chakra-ui/react";
import { signed, pct, leagueGames, LABEL, fmtKey } from "../teamProfileModel";
import { TeamTag, Card, Rank } from "./PosterPrimitives";
import { shortOf } from "../deepDiveModel";

const Record = ({ pal }) => {
  const fg = fgOf(pal);
  const s = T.standing;
  return (
    <Flex direction="column" justify="center" bg={pal.panel} px="24px" py="20px">
      <Text fontSize="14px" color={fg(0.55)} {...caps}>Overall</Text>
      <Text fontSize="72px" fontWeight="950" fontStyle="italic" lineHeight={0.95} letterSpacing="-0.04em" {...tab}>{s.record}</Text>
      <Text mt="8px" fontSize="18px" fontWeight="900" {...tab}>{s.conference_record} SWAC · {s.division_record} West</Text>
      <Text mt="2px" fontSize="16px" fontWeight="800" color={fg(0.6)}>{s.streak} · {signed(s.point_differential, 0)} points</Text>
    </Flex>
  );
};

const GameHead = ({ pal, g }) => {
  const fg = fgOf(pal);
  const won = g.result === "W";
  return (
    <Flex direction="column" align="center" gap="6px" py="4px">
      <Text fontSize="13px" color={fg(0.55)} {...caps}>Week {g.week} · {g.home_away === "home" ? "vs" : g.home_away === "away" ? "at" : "neutral"}</Text>
      <TeamTag id={g.opponent_team_id} name={g.opponent} size={40} font="18px" />
      <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={won ? pal.up : pal.down} lineHeight={1} {...tab}>{g.result} {g.score}</Text>
    </Flex>
  );
};

const SuccessPair = ({ pal, g }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns="1fr 1fr" columnGap="10px" w="full" mt="10px" pt="10px" borderTop={`1px solid ${fg(0.08)}`}>
      {[["Off success", g.offense.success_rate], ["Def success", g.defense.success_rate]].map(([k, v]) => (
        <Box key={k} textAlign="center">
          <Text fontSize="11px" color={fg(0.5)} {...caps}>{k}</Text>
          <Text fontSize="22px" fontWeight="950" {...tab}>{pct(v)}</Text>
        </Box>
      ))}
    </Grid>
  );
};

export const ResultsStrip = ({ pal }) => {
  const games = leagueGames();
  return (
    <Grid templateColumns={`260px repeat(${games.length}, minmax(0,1fr))`} gap="2px">
      <Record pal={pal} />
      {games.map((g) => (
        <Flex key={g.week} direction="column" align="center" bg={pal.panel} px="14px" py="18px">
          <GameHead pal={pal} g={g} />
          <SuccessPair pal={pal} g={g} />
        </Flex>
      ))}
    </Grid>
  );
};

const EpaLines = ({ pal, games, W, H, pad = 70, centered = false }) => {
  const fg = fgOf(pal);
  const vals = games.flatMap((g) => [g.offense.epa_per_play, g.defense.epa_per_play]);
  const m = Math.ceil(Math.max(0.1, ...vals.map(Math.abs)) * 10) / 10;
  const T0 = 26, B = centered ? 18 : 40;
  const x = centered
    ? (i) => ((i + 0.5) / games.length) * W
    : (i) => pad + (i / Math.max(1, games.length - 1)) * (W - pad * 2 - 90);
  const y = (v) => T0 + ((m - v) / (2 * m)) * (H - T0 - B);
  const series = [
    { key: "offense", label: "Offense", ink: pal.brand },
    { key: "defense", label: "Defense allowed", ink: pal.orange },
  ];
  const last = games.length - 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {[m, 0, -m].map((v) => (
        <g key={v}>
          <line x1={centered ? 0 : pad - 10} x2={W} y1={y(v)} y2={y(v)} stroke={fg(v === 0 ? 0.3 : 0.08)} strokeWidth={v === 0 ? 2 : 1} />
          {!centered && <text x={pad - 18} y={y(v) + 5} textAnchor="end" fontSize="14" fontWeight="800" fill={fg(0.5)}>{signed(v, 1)}</text>}
        </g>
      ))}
      {series.map((s) => (
        <g key={s.key}>
          <polyline points={games.map((g, i) => `${x(i)},${y(g[s.key].epa_per_play)}`).join(" ")} fill="none" stroke={s.ink} strokeWidth="4" strokeLinejoin="round" />
          {games.map((g, i) => {
            const v = g[s.key].epa_per_play;
            const up = s.key === "offense" ? v >= g.defense.epa_per_play : v > g.offense.epa_per_play;
            return (
              <g key={i}>
                <circle cx={x(i)} cy={y(v)} r="7" fill={s.ink} stroke={pal.panel} strokeWidth="2" />
                <text x={x(i)} y={y(v) + (up ? -14 : 26)} textAnchor="middle" fontSize="16" fontWeight="900" fill={s.ink}>{signed(v, 2)}</text>
              </g>
            );
          })}
          {!centered && <text x={x(last) + 20} y={y(games[last][s.key].epa_per_play) + 5} fontSize="15" fontWeight="900" fill={s.ink}>{s.label.toUpperCase()}</text>}
        </g>
      ))}
      {!centered && games.map((g, i) => (
        <text key={g.week} x={x(i)} y={H - 10} textAnchor="middle" fontSize="15" fontWeight="900" fill={fg(0.6)}>{`W${g.week} ${shortOf(g.opponent_team_id)}`}</text>
      ))}
    </svg>
  );
};

export const TrendCard = ({ pal }) => (
  <Card pal={pal} kicker="EPA per play · league games">
    <EpaLines pal={pal} games={leagueGames()} W={1240} H={260} />
  </Card>
);

export const ResultsTrend = ({ pal }) => {
  const fg = fgOf(pal);
  const games = leagueGames();
  return (
    <Grid templateColumns="230px minmax(0,1fr)" gap="2px">
      <Record pal={pal} />
      <Flex direction="column" bg={pal.panel} px="10px" pt="18px" pb="12px" minW={0}>
        <Grid templateColumns={`repeat(${games.length}, minmax(0,1fr))`}>
          {games.map((g) => <GameHead key={g.week} pal={pal} g={g} />)}
        </Grid>
        <Box mt="10px" pt="6px" borderTop={`1px solid ${fg(0.08)}`}>
          <Flex gap="18px" px="10px" mb="2px">
            <Text fontSize="13px" color={pal.brand} {...caps}>Offense EPA / play</Text>
            <Text fontSize="13px" color={pal.orange} {...caps}>Defense EPA / play allowed</Text>
          </Flex>
          <EpaLines pal={pal} games={games} W={800} H={200} centered />
        </Box>
      </Flex>
    </Grid>
  );
};

const VS_LABEL = { offense: "Off", defense: "Def", team: "Team" };

export const VsLeague = ({ pal }) => {
  const fg = fgOf(pal);
  return (
    <Card pal={pal} kicker="Against the league">
      <Flex direction="column" gap="9px">
        {T.vs_league.map((r) => {
          const share = r.of > 1 ? (r.of - r.rank) / (r.of - 1) : 0;
          return (
            <Box key={`${r.side}-${r.key}`}>
              <Flex justify="space-between" align="baseline">
                <Text fontSize="14px" fontWeight="800" color={fg(0.75)}>{VS_LABEL[r.side]} · {LABEL[r.key] ?? r.key}</Text>
                <Flex gap="10px" align="baseline">
                  <Text fontSize="15px" fontWeight="900" {...tab}>{fmtKey(r.key, r.value)}</Text>
                  <Rank pal={pal} r={r} size="15px" />
                </Flex>
              </Flex>
              <Box mt="4px" h="8px" bg={fg(0.08)}>
                <Box h="full" w={`${Math.max(4, share * 100)}%`} bg={toneOf(pal, r) === pal.ink ? fg(0.45) : toneOf(pal, r)} />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Card>
  );
};
