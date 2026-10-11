import { useMemo, useState } from "react";
import { MobileTeamSwitch } from "./MobileTeamSwitch";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { getTeamColor, getTeamSecondary, getTeamDisplayName } from "../../../organisms/test/QGameBoxScore";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { useLeagueAverages } from "../../../../hooks/useSWACData";
import {
  RosterTable,
  SectionLabel,
  SpotlightCard,
  heatAccent,
  lastName,
  num,
  pct,
  rate,
} from "./ProductionPrimitives";

// ─────────────────────────────────────────────────────────────────────────────
// Special Teams Production — the fourth panel on the Production tab, on the same
// four-row shell as passing / rushing / defense: eyebrow, team line, spotlight,
// roster tables.
//
// Everything is a straight read off the game file:
//   • team line      — `special_teams[team]` (punting, kickoffs, both return
//                      units, field goals), each with a league-max meter from
//                      the league file's `special_teams.*` keys
//   • roster tables  — `special_teams_individual[team].{kickers, punters,
//                      returners_ko, returners_punt, coverage, blockers}`
//   • spotlight      — the active row's chips; holders / long snappers fold into
//                      the kicking table as a note rather than their own table
//
// `production_scores` carries no special-teams component, so there is no
// production column here — logged as an ask, not invented.
// ─────────────────────────────────────────────────────────────────────────────

const made = (m, a) => (m == null || a == null ? "—" : `${m}/${a}`);
const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const rowsOf = (v) => (Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []);

const buildSpecialTeamsData = (game, teamId) => {
  const ind = game?.special_teams_individual?.[teamId];
  const st = game?.special_teams?.[teamId];
  if (!ind && !st) return null;

  const fg = st?.field_goals ?? {};
  const ko = st?.kickoffs ?? {};
  const punts = st?.punting ?? {};
  const kr = st?.kick_return ?? {};
  const pr = st?.punt_return ?? {};

  const kickers = rowsOf(ind?.kickers).map((r, i) => ({
    key: `k-${r.name ?? i}`,
    name: r.name,
    role: "K",
    fgMade: r.fg_made ?? null,
    fgAtt: r.fg_attempts ?? null,
    fgLong: r.fg_long ?? null,
    patMade: r.pat_made ?? null,
    patAtt: r.pat_attempts ?? null,
    kickoffs: r.kickoffs?.kicks ?? r.attempts ?? null,
    touchbacks: r.kickoffs?.touchbacks ?? r.touchbacks ?? null,
    koAvg: r.kickoffs?.avg_distance ?? r.avg_yards ?? null,
    oob: r.kickoffs?.out_of_bounds ?? r.oob ?? null,
  }));

  const punters = rowsOf(ind?.punters).map((r, i) => ({
    key: `p-${r.name ?? i}`,
    name: r.name,
    role: "P",
    punts: r.attempts ?? null,
    gross: r.avg_gross ?? null,
    net: r.avg_net ?? null,
    inside20: r.inside_20 ?? null,
    inside10: r.inside_10 ?? null,
    fairCatches: r.fair_catches ?? null,
    touchbacks: r.touchbacks ?? null,
    blocked: r.blocked ?? null,
  }));

  const returners = [
    ...rowsOf(ind?.returners_ko).map((r, i) => ({
      key: `kr-${r.name ?? i}`,
      name: r.name,
      role: "KR",
      type: "KO",
      returns: r.attempts ?? null,
      yards: r.yards ?? null,
      avg: r.avg_yards ?? null,
      tds: r.tds ?? null,
      muffs: null,
    })),
    ...rowsOf(ind?.returners_punt).map((r, i) => ({
      key: `pr-${r.name ?? i}`,
      name: r.name,
      role: "PR",
      type: "Punt",
      returns: r.attempts ?? null,
      yards: r.yards ?? null,
      avg: r.avg_yards ?? null,
      tds: r.tds ?? null,
      muffs: r.muffs ?? null,
    })),
  ];

  const coverage = [
    ...rowsOf(ind?.coverage).map((r, i) => ({ key: `c-${r.name ?? i}`, name: r.name, role: "COV", tackles: r.tackles ?? null, blocks: null })),
    ...rowsOf(ind?.blockers).map((r, i) => ({ key: `b-${r.name ?? i}`, name: r.name, role: "BLK", tackles: null, blocks: r.blocks ?? null })),
  ].sort((a, b) => (b.tackles ?? 0) + (b.blocks ?? 0) * 2 - ((a.tackles ?? 0) + (a.blocks ?? 0) * 2));

  const snapOps = [...rowsOf(ind?.holders), ...rowsOf(ind?.long_snappers)];
  const opsAtt = snapOps.reduce((s, r) => s + (r.attempts ?? 0), 0);
  const opsMade = snapOps.reduce((s, r) => s + (r.made ?? 0), 0);

  return {
    meta: { displayName: getTeamDisplayName(teamId) },
    line: {
      puntNet: asNum(punts.avg_net),
      puntStart: asNum(punts.avg_start_allowed),
      koStart: asNum(ko.avg_start_allowed),
      krAvg: asNum(kr.avg_return),
      prAvg: asNum(pr.avg_return),
      fgMade: fg.made ?? null,
      fgAtt: fg.attempts ?? null,
      fgLong: asNum(fg.long),
    },
    kickers,
    punters,
    returners,
    coverage,
    snapOps: snapOps.length ? { attempts: opsAtt, made: opsMade } : null,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM LINE — six figures, each with a league-max meter
// ═══════════════════════════════════════════════════════════════════════════════
const ST_LINE = [
  { key: "puntNet", label: "Punt Net", fmt: rate, league: "special_teams.punting.avg_net" },
  { key: "puntStart", label: "Opp Start · Punt", fmt: rate, league: "special_teams.punting.avg_start_allowed", lowerIsBetter: true },
  { key: "koStart", label: "Opp Start · KO", fmt: rate, league: "special_teams.kickoffs.avg_start_allowed", lowerIsBetter: true },
  { key: "krAvg", label: "KR Avg", fmt: rate, league: "special_teams.kick_return.avg_return" },
  { key: "prAvg", label: "PR Avg", fmt: rate, league: "special_teams.punt_return.avg_return" },
  // FG prints made/att; its meter reads the long, the one FG figure the league file ranges.
  { key: "fgLong", label: "FG", fmt: null, league: "special_teams.field_goals.long" },
];

const Meter = ({ value, league, color, signed = false }) => {
  const v = asNum(value);
  const max = asNum(league?.max);
  const min = asNum(league?.min);
  const avg = asNum(league?.avg);
  // Signed stats (field-position margin) span the league's min→max with zero
  // inside the track; everything else fills from zero to the league max.
  const lo = signed ? Math.min(min ?? 0, v ?? 0, 0) : 0;
  const hi = Math.max(max ?? 0, v ?? 0, avg ?? 0, 0.0001);
  const span = hi - lo || 0.0001;
  const x = (n) => `${Math.min(100, Math.max(0, ((n - lo) / span) * 100))}%`;
  const zero = x(0);
  return (
    <Box position="relative" h="0.3rem" w="full" bg="whiteAlpha.100" borderRadius="full" mt="0.3rem">
      {v != null && (
        v >= 0
          ? <Box position="absolute" top={0} bottom={0} left={zero} w={`calc(${x(v)} - ${zero})`} bg={color} borderRadius="full" />
          : <Box position="absolute" top={0} bottom={0} left={x(v)} w={`calc(${zero} - ${x(v)})`} bg={color} opacity={0.35} borderRadius="full" />
      )}
      {avg != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(avg)} w="2px" bg="rgba(255,255,255,0.85)" transform="translateX(-1px)" />}
    </Box>
  );
};

const TeamLine = ({ data, color, leagueKeys }) => {
  const line = data.line;
  const hasLeague = ST_LINE.some((c) => asNum(leagueKeys?.[c.league]?.avg) != null);
  return (
    <Box px={3} pt={2}>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" columnGap={2}>
        {ST_LINE.map((c) => {
          const value = line[c.key];
          const text = c.key === "fgLong" ? made(line.fgMade, line.fgAtt) : c.fmt(value);
          return (
            <Box key={c.key} minW={0}>
              <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={2}>
                {c.label}
              </Text>
              <Text fontSize="clamp(0.8rem, 1.1vw, 1rem)" fontWeight="950" color="white" lineHeight={1.1} mt="0.15rem">
                {text}
              </Text>
              <Meter value={value} league={leagueKeys?.[c.league]} color={color} signed={c.signed} />
            </Box>
          );
        })}
      </Grid>
      {hasLeague && (
        <Flex gap={3} mt={2}>
          <Flex align="center" gap={1}>
            <Box w="0.7rem" h="0.25rem" bg={color} borderRadius="full" />
            <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Fill = vs league max</Text>
          </Flex>
          <Flex align="center" gap={1}>
            <Box w="2px" h="0.5rem" bg="rgba(255,255,255,0.85)" />
            <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">League avg</Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPOTLIGHT — chips per role, no chart
// ═══════════════════════════════════════════════════════════════════════════════
const chipsFor = (p) => {
  if (!p) return [];
  if (p.role === "K") {
    return [
      ["FG", made(p.fgMade, p.fgAtt)],
      ["Long", num(p.fgLong)],
      ["PAT", made(p.patMade, p.patAtt)],
      ["Kickoffs", num(p.kickoffs)],
      ["Touchbacks", num(p.touchbacks)],
      ["KO Avg", rate(p.koAvg)],
      ["OOB", num(p.oob)],
    ];
  }
  if (p.role === "P") {
    return [
      ["Punts", num(p.punts)],
      ["Gross", rate(p.gross)],
      ["Net", rate(p.net)],
      ["In 20", num(p.inside20)],
      ["In 10", num(p.inside10)],
      ["Fair Ct", num(p.fairCatches)],
      ["TB", num(p.touchbacks)],
      ["Blocked", num(p.blocked)],
    ];
  }
  if (p.role === "KR" || p.role === "PR") {
    return [
      ["Type", p.type],
      ["Returns", num(p.returns)],
      ["Yds", num(p.yards)],
      ["Avg", rate(p.avg)],
      ["TD", num(p.tds)],
      ["Muffs", num(p.muffs)],
    ];
  }
  return [
    ["Cov Tkl", num(p.tackles)],
    ["Blocks", num(p.blocks)],
  ];
};

const SpecialistSpotlight = ({ player, accent, teamId, identity }) => {
  if (!player) return null;
  return (
    <SpotlightCard
      name={player.name}
      playerKey={null}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={null}
      roleFallback={player.role}
      chips={chipsFor(player)}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const TableLabel = ({ children, mt = 0 }) => (
  <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" px={3} mt={mt} mb={1}>
    {children}
  </Text>
);

const TeamSpecialTeamsBlock = ({ teamId, data, identity, leagueKeys, hideLabel = false }) => {
  const color = getTeamColor(teamId);
  const heat = heatAccent(color, getTeamSecondary(teamId));
  const first = data.kickers[0] ?? data.punters[0] ?? data.returners[0] ?? data.coverage[0] ?? null;
  const [active, setActive] = useState(first);

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      {!hideLabel && <SectionLabel dotColor={color}>{data.meta.displayName} Special Teams Production</SectionLabel>}

      <Box display="flex" flexDirection="column" gap={2} pb={2}>
        <TeamLine data={data} color={color} leagueKeys={leagueKeys} />

        <SpecialistSpotlight player={active} accent={heat} teamId={teamId} identity={identity} />

        <Box minW={0}>
          <TableLabel>Kicking</TableLabel>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "fg", label: "FG", render: (r) => made(r.fgMade, r.fgAtt) },
              { key: "fgLong", label: "Long", render: (r) => num(r.fgLong) },
              { key: "pat", label: "PAT", render: (r) => made(r.patMade, r.patAtt) },
              { key: "kickoffs", label: "KO", render: (r) => num(r.kickoffs) },
              { key: "touchbacks", label: "TB", render: (r) => num(r.touchbacks) },
              { key: "koAvg", label: "KO Avg", render: (r) => rate(r.koAvg) },
            ]}
            rows={data.kickers}
          />
          {data.snapOps && (
            <Text px={3} mt={1} fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.08em">
              Snap → hold operations {data.snapOps.made}/{data.snapOps.attempts}
            </Text>
          )}

          <TableLabel mt={2}>Punting</TableLabel>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "punts", label: "Punts", render: (r) => num(r.punts) },
              { key: "gross", label: "Gross", render: (r) => rate(r.gross) },
              { key: "net", label: "Net", render: (r) => rate(r.net) },
              { key: "inside20", label: "In 20", render: (r) => num(r.inside20) },
              { key: "inside10", label: "In 10", render: (r) => num(r.inside10) },
              { key: "fairCatches", label: "FC", render: (r) => num(r.fairCatches) },
              { key: "blocked", label: "Blk", render: (r) => num(r.blocked) },
            ]}
            rows={data.punters}
          />

          <TableLabel mt={2}>Returns</TableLabel>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "type", label: "Type" },
              { key: "returns", label: "Ret", render: (r) => num(r.returns) },
              { key: "yards", label: "Yds", render: (r) => num(r.yards) },
              { key: "avg", label: "Avg", render: (r) => rate(r.avg) },
              { key: "tds", label: "TD", render: (r) => num(r.tds) },
              { key: "muffs", label: "Muffs", render: (r) => num(r.muffs) },
            ]}
            rows={data.returners}
          />

          <TableLabel mt={2}>Coverage</TableLabel>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "role", label: "Unit", render: (r) => (r.role === "BLK" ? "Block" : "Coverage") },
              { key: "tackles", label: "Tkl", render: (r) => num(r.tackles) },
              { key: "blocks", label: "Blocks", render: (r) => num(r.blocks) },
            ]}
            rows={data.coverage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export const SpecialTeamsProductionClean = ({ game, playerSeasons, priorPlayerSeasons = [], awayId, homeId, mobile = false }) => {
  const [shown, setShown] = useState(null);
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const { data: leagueAvg } = useLeagueAverages(Number(game?.season) || undefined);
  const leagueKeys = leagueAvg?.keys ?? null;
  const awayData = useMemo(() => buildSpecialTeamsData(game, awayId), [game, awayId]);
  const homeData = useMemo(() => buildSpecialTeamsData(game, homeId), [game, homeId]);
  if (!awayData || !homeData) return null;

  // Phones: one team at a time under a switcher, no outer margins.
  if (mobile) {
    const team = shown ?? awayId;
    const isHome = team === homeId;
    return (
      <Box w="full">
        <MobileTeamSwitch title="Special Teams Production" awayId={awayId} homeId={homeId} value={team} onChange={setShown} />
        {isHome ? <TeamSpecialTeamsBlock hideLabel teamId={homeId} data={homeData} identity={identity} leagueKeys={leagueKeys} /> : <TeamSpecialTeamsBlock hideLabel teamId={awayId} data={awayData} identity={identity} leagueKeys={leagueKeys} />}
      </Box>
    );
  }

  return (
    <Box w="full" mt={8} mb={12}>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={1.5}>
        <TeamSpecialTeamsBlock teamId={awayId} data={awayData} identity={identity} leagueKeys={leagueKeys} />
        <TeamSpecialTeamsBlock teamId={homeId} data={homeData} identity={identity} leagueKeys={leagueKeys} />
      </Grid>
    </Box>
  );
};

export default SpecialTeamsProductionClean;
