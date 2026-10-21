import { useMemo, useState } from "react";
import { MobileTeamSwitch } from "./MobileTeamSwitch";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { getTeamColor, getTeamSecondary, getTeamDisplayName } from "../../../organisms/test/QGameBoxScore";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { useLeagueAverages, useTeamSeasonAvg } from "../../../../hooks/useSWACData";
import {
  RosterTable,
  SectionLabel,
  SpotlightCard,
  heatAccent,
  lastName,
  parColumn,
  pct,
  productionIndex,
  rate,
  shadeVsLeague,
  sortByPar,
  gameParBounds,
} from "./ProductionPrimitives";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";

// ─────────────────────────────────────────────────────────────────────────────
// Rushing Production — the rushing counterpart to PassingProductionClean, on the
// same column grammar as Bill Connelly's advanced box score: Rushes-Yds, Yds/Carry,
// LY/Carry, Succ Rt, Opp Rate, Hlt/Opp, Stuff Rt.
//
// Structure:
//   1. Eyebrow — team-colour dot + the school's short name
//   2. Team aggregate table (Total / Standard Downs / Passing Downs)
//   3. Individual rusher table
//   4. Player spotlight + gap chart, reacting to whichever rusher is active
// ─────────────────────────────────────────────────────────────────────────────

const DIRS = [
  { key: "left", label: "Left" },
  { key: "middle", label: "Middle" },
  { key: "right", label: "Right" },
];


// ═══════════════════════════════════════════════════════════════════════════════
// LANES — straight off each rusher's `direction_breakdown`
// ═══════════════════════════════════════════════════════════════════════════════
// The backend ships, per rusher and per lane (left / middle / right, as the crew
// writes it), the carries, the yards and the success rate. That is what the three
// columns draw — nothing more. Which carries went which way is not in the file,
// so no per-carry split (line vs highlight) is built here; the earlier version
// partitioned the play-by-play gains to fake one.

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// Real, straight off the export:
//   • per rusher — attempts, yards, touchdowns, fumbles, yards_per_carry and the rate
//     fields, plus `direction_breakdown`: {left, middle, right} × {attempts, yards,
//     success_rate}, which the lane chart draws as is
//   • per team  — `rushing_splits[team].total`, Connelly's six rushing columns


const buildRushingData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const teamBox = game?.team_box?.[teamId] ?? {};
  const adv = game?.advanced_team?.[teamId] ?? {};
  const rushOff = game?.offensive_advanced_metrics?.[teamId]?.rush_offense ?? {};

  const rows = (stats.rushing ?? []).filter((r) => r.name !== "TEAM");

  const rushers = rows.map((r) => {
    const attempts = r.attempts ?? 0;
    const yards = r.yards ?? 0;
    const dir = r.direction_breakdown ?? {};

    const hasLanes = DIRS.some((d) => dir?.[d.key]);
    const lanes = hasLanes
      ? DIRS.map((d) => ({
          key: d.key,
          label: d.label,
          att: dir?.[d.key]?.attempts ?? 0,
          yards: dir?.[d.key]?.yards ?? 0,
          successRate: dir?.[d.key]?.success_rate ?? null,
          // Shipped 2026-10-18: line + highlight = the lane's yards; stuffed =
          // carries for zero or less. Null until a game file carries them.
          line: dir?.[d.key]?.line_yards ?? null,
          highlight: dir?.[d.key]?.highlight_yards ?? null,
          stuffed: dir?.[d.key]?.stuffed ?? null,
        }))
      : null;

    return {
      key: r.player_key,
      name: r.name,
      attempts,
      yards,
      touchdowns: r.touchdowns ?? 0,
      fumbles: r.fumbles ?? 0,
      ypc: r.yards_per_carry ?? (attempts > 0 ? yards / attempts : 0),
      // Straight field reads off the rushing row (all shipped on 2026).
      successRate: r.success_rate ?? null,
      lineYards: r.line_yards_per_carry ?? null,
      oppRate: r.opportunity_rate ?? null,
      highlight: r.highlight_yards_per_opportunity ?? null,
      stuffRate: r.stuff_rate ?? null,
      epaTotal: r.epa_total ?? null,
      // Backend-provided, none of it shipping yet on any season — checked across
      // 8,172 rushing rows, 2019-2026. Power and stop rates divide two shipped
      // fields when they arrive; nothing here is counted off the raw plays.
      powerSuccesses: r.power_successes ?? null,
      powerAttempts: r.power_attempts ?? null,
      explosive10: r.explosive_carries_10 ?? null,
      explosive20: r.explosive_carries_20 ?? null,
      epaPerCarry: r.epa_per_play ?? null,
      stoppedCarries: r.stopped_carries ?? null,
      lanes,
    };
  });

  // Team line straight off `rushing_splits[team].total` — Connelly's six rushing
  // columns are all fields on it. Highlight yards ship per RUSH here (his sheet
  // prints them per opportunity), so the column is labelled Hlt/Rush.
  const tot = game.rushing_splits?.[teamId]?.total ?? game.rushing_splits?.[`${teamId}25`]?.total ?? null;
  const line = tot ? {
    ypc: tot.yards_per_carry ?? null,
    lineYards: tot.line_yards_per_rush ?? null,
    successRate: tot.success_rate ?? null,
    oppRate: tot.opportunity_rate ?? null,
    highlight: tot.highlight_yards_per_rush ?? null,
    stuffRate: tot.stuff_rate ?? null,
  } : null;

  return {
    meta: {
      shortName: getTeamDisplayName(teamId),
      displayName: getTeamDisplayName(teamId),
    },
    team: {
      attempts: teamBox.rush_attempts ?? 0,
      yards: teamBox.rush_yards ?? 0,
      touchdowns: teamBox.rush_touchdowns ?? 0,
      ypc: teamBox.yards_per_carry ?? 0,
      lineYards: adv.line_yards_per_rush ?? null,
      highlight: adv.highlight_yards_per_rush ?? null,
      oppRate: adv.rush_opportunity_rate ?? null,
      stuffRate: adv.stuff_rate ?? null,
      successByDown: rushOff.run_success_rate_by_down ?? null,
    },
    line,
    rushers,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM LINE — Connelly's six rushing columns, each with a context bar
// ═══════════════════════════════════════════════════════════════════════════════
// Value, then a hairline meter: fill is the game value against the LEAGUE MAX for
// that stat (shared/league_avg_{season}.keys), a white notch is this team's SEASON
// average (shared/team_season_avg_{season}.teams[team].rushing), a red notch is what
// the OPPOSING DEFENSE allows on average this season. Nothing estimated: where a file
// doesn't carry the number the notch is simply not drawn (today the season file has
// success, opportunity and stuff rate only, and no defense-allowed block at all — both
// on the backend ask list; the keys below are the ones asked for).
const RUSH_LINE = [
  { key: "ypc", label: "Yds/ Carry", fmt: rate, league: "rushing_splits.total.yards_per_carry", season: "yardsPerCarry", allowed: "yardsPerCarryAllowed" },
  { key: "lineYards", label: "LY/ Carry", fmt: rate, league: "rushing_splits.total.line_yards_per_rush", season: "lineYardsPerRush", allowed: "lineYardsPerRushAllowed" },
  { key: "successRate", label: "Succ. Rt", fmt: pct, league: "rushing_splits.total.success_rate", season: "successRate", allowed: "successRateAllowed" },
  { key: "oppRate", label: "Opp Rate", fmt: pct, league: "rushing_splits.total.opportunity_rate", season: "opportunityRate", allowed: "opportunityRateAllowed" },
  { key: "highlight", label: "Hlt/ Rush", fmt: rate, league: "rushing_splits.total.highlight_yards_per_rush", season: "highlightYardsPerRush", allowed: "highlightYardsPerRushAllowed" },
  { key: "stuffRate", label: "Stuff Rt", fmt: pct, league: "rushing_splits.total.stuff_rate", season: "stuffRate", allowed: "stuffRateAllowed" },
];

const SEASON_NOTCH = "rgba(255,255,255,0.85)";
const ALLOWED_NOTCH = "#ef4444";

const asNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const ContextMeter = ({ value, max, season, allowed, color }) => {
  const scale = Math.max(asNum(max) ?? 0, asNum(value) ?? 0, asNum(season) ?? 0, asNum(allowed) ?? 0, 0.0001);
  const x = (v) => `${Math.min(100, Math.max(0, (v / scale) * 100))}%`;
  return (
    <Box position="relative" h="0.3rem" w="full" bg="whiteAlpha.100" borderRadius="full" mt="0.3rem">
      {asNum(value) != null && <Box position="absolute" left={0} top={0} bottom={0} w={x(value)} bg={color} borderRadius="full" />}
      {asNum(season) != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(season)} w="2px" bg={SEASON_NOTCH} transform="translateX(-1px)" />}
      {asNum(allowed) != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" left={x(allowed)} w="2px" bg={ALLOWED_NOTCH} transform="translateX(-1px)" />}
    </Box>
  );
};

const TeamRushLine = ({ data, color, context }) => {
  const line = data.line;
  const hasSeason = RUSH_LINE.some((c) => asNum(context?.season?.[c.season]) != null);
  const hasAllowed = RUSH_LINE.some((c) => asNum(context?.allowed?.[c.allowed]) != null);
  const hasLeague = RUSH_LINE.some((c) => asNum(context?.league?.[c.league]?.max) != null);

  return (
    <Box px={3} pt={2}>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" columnGap={2}>
        {RUSH_LINE.map((c) => {
          const value = line?.[c.key] ?? null;
          return (
            <Box key={c.key} minW={0}>
              <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} overflowWrap="normal" wordBreak="keep-all">
                {c.label}
              </Text>
              <Text fontSize="clamp(0.8rem, 1.1vw, 1rem)" fontWeight="950" color="white" lineHeight={1.1} mt="0.15rem">
                {c.fmt(value)}
              </Text>
              <ContextMeter
                value={value}
                max={context?.league?.[c.league]?.max}
                season={context?.season?.[c.season]}
                allowed={context?.allowed?.[c.allowed]}
                color={color}
              />
            </Box>
          );
        })}
      </Grid>

      {(hasLeague || hasSeason || hasAllowed) && (
        <Flex gap={3} mt={2} flexWrap="wrap">
          {hasLeague && (
            <Flex align="center" gap={1}>
              <Box w="0.7rem" h="0.25rem" bg={color} borderRadius="full" />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Fill = vs league max</Text>
            </Flex>
          )}
          {hasSeason && (
            <Flex align="center" gap={1}>
              <Box w="2px" h="0.5rem" bg={SEASON_NOTCH} />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Season avg</Text>
            </Flex>
          )}
          {hasAllowed && (
            <Flex align="center" gap={1}>
              <Box w="2px" h="0.5rem" bg={ALLOWED_NOTCH} />
              <Text fontSize="clamp(0.4rem, 0.52vw, 0.48rem)" fontWeight="800" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">Opp defense allows</Text>
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAP CHART
// ═══════════════════════════════════════════════════════════════════════════════
// Three bars, one per direction, each stacked into the three things a carry can be
// made of. Height is raw yardage: bar length is what he produced running that way,
// and the split is who earned it — line credit against the axis, then the yards he
// added past it riding on top, in the order the yards were actually gained. Losses
// hang below the axis, so a direction he was stopped in dips rather than just being
// short. One domain across the three bars, so they are comparable to each other and
// the axis sits at the same height in every lane.

const STUFF_COLOR = "#C0453A";
const LANE_GAP = "0.5rem";

const LaneChart = ({ lanes, heat }) => {
  if (!lanes) return null;
  const posMax = Math.max(0.001, ...lanes.map((l) => Math.max(0, l.yards)));
  const negMax = Math.max(0, ...lanes.map((l) => Math.abs(Math.min(0, l.yards))));
  const domain = posMax + negMax;
  const zeroTop = (posMax / domain) * 100;
  const h = (v) => (Math.abs(v) / domain) * 100;

  return (
    <Box>
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP}>
        {lanes.map((l) => (
          <Text key={`v-${l.key}`} textAlign="center" fontFamily="mono" fontWeight="950" color="white" lineHeight={1} fontSize="clamp(0.75rem, 1.05vw, 0.95rem)">
            {l.att > 0 ? `${l.yards}y` : "—"}
          </Text>
        ))}
      </Grid>

      <Box position="relative" h="clamp(3rem, 4.5vw, 4rem)" mt={1}>
        <Box position="absolute" left={0} right={0} h="0.0625rem" bg="rgba(255,255,255,0.3)" zIndex={2} style={{ top: `${zeroTop}%` }} />
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP} h="full">
          {lanes.map((l) => {
            const up = l.yards >= 0;
            const barH = h(l.yards);
            // The backend's split, when it ships: line yards (lighter) under
            // highlight yards (solid), stacked to the lane's total.
            const split = up && l.line != null && l.highlight != null && l.yards > 0;
            if (split) {
              const lineH = h(Math.max(0, l.line));
              const hlH = Math.max(0, barH - lineH);
              return (
                <Box key={l.key} position="relative" h="full">
                  <Box position="absolute" left="16%" right="16%" bg={heat} opacity={0.42} style={{ top: `${zeroTop - lineH}%`, height: `${lineH}%` }} />
                  <Box position="absolute" left="16%" right="16%" bg={heat} borderRadius="0.125rem 0.125rem 0 0" style={{ top: `${zeroTop - lineH - hlH}%`, height: `${hlH}%` }} />
                </Box>
              );
            }
            return (
              <Box key={l.key} position="relative" h="full">
                {barH > 0 && (
                  <Box
                    position="absolute"
                    left="16%"
                    right="16%"
                    bg={up ? heat : STUFF_COLOR}
                    borderRadius={up ? "0.125rem 0.125rem 0 0" : "0 0 0.125rem 0.125rem"}
                    style={up ? { top: `${zeroTop - barH}%`, height: `${barH}%` } : { top: `${zeroTop}%`, height: `${barH}%` }}
                  />
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>

      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP} mt={1.5}>
        {lanes.map((l) => (
          <Box key={`l-${l.key}`} textAlign="center" minW={0}>
            <Text fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
              {l.label}
            </Text>
            <Text fontSize="clamp(0.4rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.32)" mt="0.125rem">
              {l.att} car{l.att > 0 && l.successRate != null ? ` · ${Math.round(l.successRate * 100)}% succ` : ""}{l.stuffed ? ` · ${l.stuffed} stuffed` : ""}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const RusherSpotlight = ({ player, accent, heat, teamId, identity, productionRows }) => {
  if (!player) return null;

  const chips = [
    ["Rush-Yds", `${player.attempts}-${player.yards}`],
    ["Yd/ Car", rate(player.ypc)],
    ["Succ Rt", pct(player.successRate)],
    ["TD", player.touchdowns],
    ["LY/ Car", rate(player.lineYards)],
    ["Opp Rt", pct(player.oppRate)],
    ["Hlt/ Opp", rate(player.highlight)],
    ["Stuff Rt", pct(player.stuffRate)],
    // Third row — pending backend fields, all dashing out today. Stop rate is a
    // wider net than stuff rate: 0-2 yards rather than 0 or less.
    ["Power Rt", pct(player.powerAttempts > 0 ? player.powerSuccesses / player.powerAttempts : null)],
    ["Exp 10/ 20", player.explosive10 == null ? "—" : `${player.explosive10}/${player.explosive20 ?? "—"}`],
    ["EPA/ Car", player.epaPerCarry == null ? "—" : player.epaPerCarry.toFixed(2)],
    ["Stop Rt", pct(player.stoppedCarries != null && player.attempts > 0 ? player.stoppedCarries / player.attempts : null)],
  ];

  return (
    <SpotlightCard
      name={player.name}
      playerKey={player.key}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={productionRows}
      productionComponent="rushing_production"
      roleFallback="RB"
      chips={chips}
    >
      <LaneChart lanes={player.lanes} heat={heat} />
    </SpotlightCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL
// ═══════════════════════════════════════════════════════════════════════════════

// Four-row shell, shared with Passing and Defense: (1) team production table,
// (2) player spotlight — full-width, horizontal (identity / chips / chart),
// (3) player production table, full width below it. A fourth row (defensive
// impact) is planned but intentionally not built here yet — pending design.
const signed2 = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}`);
const signed1 = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}`);

const TeamRushBlock = ({ gameScores, teamId, data, identity, productionRows, context, hideLabel = false }) => {
  const color = getTeamColor(teamId);
  const heat = heatAccent(color, getTeamSecondary(teamId));

  const par = useMemo(() => productionIndex(productionRows), [productionRows]);
  // Ranked and scored on rushing production alone — a back's receiving stays out.
  const rushers = useMemo(() => sortByPar(data.rushers, par, "rushing_production"), [data.rushers, par]);
  const rushSR = context?.league?.["rushing_splits.total.success_rate"] ?? null;
  const rushEPA = context?.league?.["rushing_splits.total.epa_per_play"] ?? null;

  const [active, setActive] = useState(rushers[0] ?? null);

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      {!hideLabel && <SectionLabel dotColor={color}>{data.meta.displayName} Rushing Production</SectionLabel>}

      <Box display="flex" flexDirection="column" gap={2} pb={2}>
        {/* Row 1 — the team line, straight under the eyebrow */}
        <TeamRushLine data={data} color={color} context={context} />

        {/* Row 2 — player spotlight, full-bleed band */}
        <RusherSpotlight
          player={active}
          accent={color}
          heat={heat}
          teamId={teamId}
          identity={identity}
          productionRows={productionRows}
        />

        {/* Row 3 — player production table, full width */}
        <Box minW={0}>
          <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" px={3} mb={1}>
            Rushing
          </Text>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "carries", label: "C-Yd", render: (r) => `${r.attempts}-${r.yards}` },
              { key: "ypc", label: "YPC", render: (r) => rate(r.ypc) },
              { key: "lineYards", label: "LY/C", render: (r) => rate(r.lineYards) },
              { key: "successRate", label: "SR%", render: (r) => pct(r.successRate), shade: (r) => shadeVsLeague(r.successRate, rushSR) },
              { key: "oppRate", label: "Opp%", render: (r) => pct(r.oppRate) },
              { key: "epaTotal", label: "EPA", render: (r) => signed1(r.epaTotal) },
              { key: "epaPerCarry", label: "EPA/Att", render: (r) => signed2(r.epaPerCarry), shade: (r) => shadeVsLeague(r.epaPerCarry, rushEPA) },
              parColumn(rushers, par, color, PRODUCTION_UNITS.rushing.label, "rushing_production", gameParBounds(gameScores)),
            ]}
            rows={rushers}
          />
        </Box>
      </Box>
    </Box>
  );
};

export const RushingProductionClean = ({ game, playerSeasons, priorPlayerSeasons = [], productionScores, awayId, homeId, mobile = false }) => {
  const [shown, setShown] = useState(null);
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const awayData = useMemo(() => buildRushingData(game, awayId), [game, awayId]);
  const homeData = useMemo(() => buildRushingData(game, homeId), [game, homeId]);

  // Season context for the team line: league max off the league file, each team's own
  // season rushing averages, and — once the backend ships `rushing_defense` on the
  // season file — what each defense allows, read for the OTHER team's line.
  const season = Number(game?.season) || undefined;
  const { data: leagueAvg } = useLeagueAverages(season);
  const { data: awaySeason } = useTeamSeasonAvg(awayId, season);
  const { data: homeSeason } = useTeamSeasonAvg(homeId, season);
  const awayContext = { league: leagueAvg?.keys ?? null, season: awaySeason?.rushing ?? null, allowed: homeSeason?.rushing_defense ?? null };
  const homeContext = { league: leagueAvg?.keys ?? null, season: homeSeason?.rushing ?? null, allowed: awaySeason?.rushing_defense ?? null };

  if (!awayData || !homeData) return null;

  // Phones: one team at a time under a switcher, no outer margins.
  if (mobile) {
    const team = shown ?? awayId;
    const isHome = team === homeId;
    return (
      <Box w="full">
        <MobileTeamSwitch title="Rushing Production" awayId={awayId} homeId={homeId} value={team} onChange={setShown} />
        {isHome ? <TeamRushBlock gameScores={productionScores} hideLabel teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} context={homeContext} /> : <TeamRushBlock gameScores={productionScores} hideLabel teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} context={awayContext} />}
      </Box>
    );
  }

  return (
    <Box w="full" mt={8} mb={12}>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={1.5}>
        <TeamRushBlock gameScores={productionScores} teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} context={awayContext} />
        <TeamRushBlock gameScores={productionScores} teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} context={homeContext} />
      </Grid>
    </Box>
  );
};

export default RushingProductionClean;
