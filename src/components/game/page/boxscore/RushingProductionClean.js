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


/**
 * Line yards on one carry, per the legend on Connelly's college advanced box score
 * (inspo/abs2.jpg): "a line gets 100% credit for 0-3 yards in a carry, 50% for 4-6,
 * 125% for losses." The 125% is stale — his own printed figures are 120% (Chase
 * Brice, 1 carry for -1, prints LY/Carry -1.20; Mac Jones, 1 for -2, prints -2.40),
 * so we follow the numbers. The 4.5 ceiling falls out of the tiers rather than being
 * a separate cap rule: three yards at full credit plus three at half.
 */
const lineYardsOn = (gain) =>
  gain <= 0 ? 1.2 * gain : Math.min(gain, 3) + 0.5 * Math.max(0, Math.min(gain, 6) - 3);


/**
 * Split one lane's carries into three pieces that sum exactly to its yardage.
 *
 * The 120% loss weight cannot be used for the split itself: a -4 carry would take
 * -4.8 of line credit, leaving a phantom +0.8 of "highlight" on a play where the back
 * did nothing. So losses are carried whole in their own segment and the line/highlight
 * split is taken over the gaining carries only. That keeps stuff + line + highlight
 * identically equal to the lane's real yards, which is the property the chart rests
 * on. The 120% weighting stays where it belongs — in the LY/Car figure on the table,
 * which rates the line rather than accounting for the yards.
 */
const splitLane = (carries) => {
  const gains = carries.filter((c) => c > 0);
  const line = gains.reduce((s, c) => s + lineYardsOn(c), 0);
  const gained = gains.reduce((s, c) => s + c, 0);
  return {
    stuff: carries.filter((c) => c <= 0).reduce((s, c) => s + c, 0), // ≤ 0, drawn below the axis
    line,
    highlight: gained - line,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK — which carry went which way
// ═══════════════════════════════════════════════════════════════════════════════
// The gains are real: every RUSH action in the play-by-play carries `net_yards` and a
// `rusher`, and the join hits on 795 of 795 rushing rows. Their DIRECTION is not real
// — `rushDirection` is null on all 5,064 RUSH actions in 2025, and direction survives
// only as the aggregate {attempts, yards} triple in `direction_breakdown` (reqs ask
// #8). So we partition a rusher's own carries into three groups that reproduce that
// aggregate exactly, and read the phase split off the groups. The totals printed under
// each bar are real; which carries built them is invented.

const sum = (list) => list.reduce((s, c) => s + c, 0);

/** Largest-remainder spread of `diff` across `values`, so the total lands exactly. */
const spread = (values, diff) => {
  if (!diff || values.length === 0) return values;
  const base = Math.trunc(diff / values.length);
  const rem = diff - base * values.length;
  const step = rem > 0 ? 1 : -1;
  return values.map((v, i) => v + base + (i < Math.abs(rem) ? step : 0));
};

/**
 * Partition `gains` into per-direction groups matching each target's attempt count and
 * yardage. Greedy fill by remaining need per slot, then trade carries between lanes
 * while a trade reduces total error. Measured across all 795 rushing rows in 2025:
 * 698 (88%) land exactly. The rest are infeasible — no partition of that carry set
 * hits those three sums — so the leftover is spread across the lane's carries rather
 * than dumped on one, which keeps the bar's total honest without inventing a 50-yard
 * run. Median distortion where that happens is 0.5 yards per carry, p90 2.0.
 */
const assignLanes = (gains, targets) => {
  const need = targets.reduce((s, t) => s + t.att, 0);
  const total = targets.reduce((s, t) => s + t.yards, 0);

  let pool = [...gains].sort((a, b) => b - a);
  // The play-by-play runs ahead of individual_stats on 15% of rows, almost always by a
  // single carry (see reqs ask #8b), and direction_breakdown disagrees with its own row
  // on another 4.4%. Trim or pad to the attempt count the bars will print, taking
  // extras off the middle of the distribution where they distort least, then true the
  // sum up so the lanes are reachable at all.
  while (pool.length > need) pool.splice(Math.floor(pool.length / 2), 1);
  while (pool.length < need) pool.splice(Math.floor(pool.length / 2), 0, 0);
  pool = spread(pool, total - sum(pool));

  const lanes = targets.map((t) => ({ ...t, carries: [] }));
  pool.forEach((gain) => {
    let best = null;
    lanes.forEach((lane) => {
      if (lane.carries.length >= lane.att) return;
      const perSlot = (lane.yards - sum(lane.carries)) / (lane.att - lane.carries.length);
      if (!best || perSlot > best.perSlot) best = { lane, perSlot };
    });
    if (best) best.lane.carries.push(gain);
  });

  const errOf = (l) => sum(l.carries) - l.yards;
  for (let iter = 0; iter < 300; iter += 1) {
    let best = null;
    lanes.forEach((A) => {
      lanes.forEach((B) => {
        if (A === B) return;
        const ea = errOf(A);
        const eb = errOf(B);
        A.carries.forEach((a, i) => {
          B.carries.forEach((b, j) => {
            const d = a - b;
            if (d === 0) return;
            // Trading a out of A for b closes A's error by d and opens B's by the same.
            const win = Math.abs(ea) + Math.abs(eb) - (Math.abs(ea - d) + Math.abs(eb + d));
            if (win > 1e-9 && (!best || win > best.win)) best = { win, A, i, B, j, a, b };
          });
        });
      });
    });
    if (!best) break;
    best.A.carries[best.i] = best.b;
    best.B.carries[best.j] = best.a;
  }

  return lanes.map((l) => {
    const carries = spread(l.carries, l.yards - sum(l.carries));
    return { key: l.key, label: l.label, att: l.att, yards: l.yards, carries, ...splitLane(carries) };
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// Real, straight off the export:
//   • per rusher — attempts, yards, touchdowns, fumbles, yards_per_carry, and (2019-2025
//     only) a `direction_breakdown` of {left, middle, right} × {attempts, yards}
//   • per rusher — every carry's net yardage, off the play-by-play RUSH actions
//   • per team  — line_yards_per_rush, highlight_yards_per_rush, rush_opportunity_rate,
//     stuff_rate, stopped_run_rate on `advanced_team` (100% populated, 144 team-games,
//     2019-2025; the 2026 export does not carry these at team level — see reqs ask #8b)
//
// MOCK for 2019-2025 only (reqs ask #8): which direction each carry went, partitioned
// from `direction_breakdown`'s aggregate. The 2026 export tags a real `direction` on
// every RUSH action — when it's there, every carry is placed by its own real direction
// and the partition step never runs; `long` still ships as null everywhere.

/** A role field on an action is a plain string pre-2026, {name_raw, team, player_id}
 *  on 2026+. Reading `.name_raw` off a string returns undefined, so this covers both. */
const roleName = (role) => (typeof role === "string" ? role : role?.name_raw ?? null);

const buildRushingData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const teamBox = game?.team_box?.[teamId] ?? {};
  const adv = game?.advanced_team?.[teamId] ?? {};
  const rushOff = game?.offensive_advanced_metrics?.[teamId]?.rush_offense ?? {};

  const rows = (stats.rushing ?? []).filter((r) => r.name !== "TEAM");

  // Per-rusher carry ledger off the play-by-play — every gain, whether it moved the
  // chains, and (2026+) which direction it actually went. Success rate and the whole
  // phase split are counted from here.
  const ledger = {};
  (game.play_by_play ?? []).forEach((play) => {
    const cleanTeam = play.offense_team ? String(play.offense_team).replace(/25$/, "") : "";
    if (play.play_type !== "RUSH" || cleanTeam !== teamId) return;
    const action = (play.actions ?? []).find((a) => a.type === "RUSH");
    const name = roleName(action?.rusher);
    if (!name) return;
    const bucket = ledger[name] ?? { gains: [], dirGains: { left: [], middle: [], right: [] }, tagged: 0 };
    const gain = action.net_yards || 0;
    bucket.gains.push(gain);
    if (action.direction && bucket.dirGains[action.direction]) {
      bucket.dirGains[action.direction].push(gain);
      bucket.tagged += 1;
    }
    ledger[name] = bucket;
  });

  const rushers = rows.map((r) => {
    const attempts = r.attempts ?? 0;
    const yards = r.yards ?? 0;
    const dir = r.direction_breakdown ?? {};
    const led = ledger[r.name];
    const gains = led?.gains ?? [];

    // Real per-carry direction, when every one of this rusher's carries carries it —
    // no partition, no mock, the bar draws exactly what happened. Falls back to
    // splitting `direction_breakdown`'s aggregate for every season before 2026.
    const hasRealDirection = gains.length > 0 && led.tagged === gains.length;
    const lanes = hasRealDirection
      ? DIRS.map((d) => {
          const carries = led.dirGains[d.key];
          return { key: d.key, label: d.label, att: carries.length, yards: sum(carries), carries, ...splitLane(carries) };
        })
      : assignLanes(
          gains,
          DIRS.map((d) => ({
            key: d.key,
            label: d.label,
            att: dir?.[d.key]?.attempts ?? 0,
            yards: dir?.[d.key]?.yards ?? 0,
          }))
        );

    return {
      key: r.player_key,
      name: r.name,
      attempts,
      yards,
      touchdowns: r.touchdowns ?? 0,
      fumbles: r.fumbles ?? 0,
      ypc: r.yards_per_carry ?? (attempts > 0 ? yards / attempts : 0),
      // Straight field reads off the rushing row (all shipped on 2026). The lane chart
      // below still splits the per-carry ledger for its own line/highlight stacking.
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
  const posMax = Math.max(0.001, ...lanes.map((l) => Math.max(0, l.line) + Math.max(0, l.highlight)));
  const negMax = Math.max(0, ...lanes.map((l) => Math.abs(Math.min(0, l.stuff))));
  const domain = posMax + negMax;
  const zeroTop = (posMax / domain) * 100;
  const h = (v) => (Math.abs(v) / domain) * 100;

  return (
    <Box>
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP}>
        {lanes.map((l) => (
          <Text
            key={`v-${l.key}`}
            textAlign="center"
            fontFamily="mono"
            fontWeight="950"
            color="white"
            lineHeight={1}
            fontSize="clamp(0.75rem, 1.05vw, 0.95rem)"
          >
            {l.att > 0 ? `${l.yards}y` : "—"}
          </Text>
        ))}
      </Grid>

      <Box position="relative" h="clamp(3rem, 4.5vw, 4rem)" mt={1}>
        {/* The axis, drawn once across all three lanes so it reads as a baseline
            rather than three unrelated ticks. */}
        <Box
          position="absolute"
          left={0}
          right={0}
          h="0.0625rem"
          bg="rgba(255,255,255,0.3)"
          zIndex={2}
          style={{ top: `${zeroTop}%` }}
        />
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP} h="full">
          {lanes.map((l) => {
            const lineH = h(l.line);
            const hlH = h(l.highlight);
            const stuffH = h(l.stuff);
            return (
              <Box key={l.key} position="relative" h="full">
                <Box
                  position="absolute"
                  left="16%"
                  right="16%"
                  bg={heat}
                  opacity={0.42}
                  style={{ top: `${zeroTop - lineH}%`, height: `${lineH}%` }}
                />
                <Box
                  position="absolute"
                  left="16%"
                  right="16%"
                  bg={heat}
                  borderRadius="0.125rem 0.125rem 0 0"
                  style={{ top: `${zeroTop - lineH - hlH}%`, height: `${hlH}%` }}
                />
                {stuffH > 0 && (
                  <Box
                    position="absolute"
                    left="16%"
                    right="16%"
                    bg={STUFF_COLOR}
                    borderRadius="0 0 0.125rem 0.125rem"
                    style={{ top: `${zeroTop}%`, height: `${stuffH}%` }}
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
            {/* The carry count travels with every lane. Zero-yard carries contribute
                nothing visible to a yardage bar, so without this the chart understates
                how often he was stopped. */}
            <Text fontSize="clamp(0.4rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.32)" mt="0.125rem">
              {l.att} car
            </Text>
          </Box>
        ))}
      </Grid>

      <Flex mt={2.5} pt={2} borderTop="0.0625rem solid" borderColor="whiteAlpha.100" gap="0.625rem" wrap="wrap">
        {[
          [STUFF_COLOR, 1, "Lost"],
          [heat, 0.42, "Line"],
          [heat, 1, "Highlight"],
        ].map(([color, opacity, label]) => (
          <Flex key={label} align="center" gap="0.3125rem" minW={0}>
            <Box w="0.4375rem" h="0.4375rem" borderRadius="0.125rem" bg={color} opacity={opacity} flexShrink={0} />
            <Text fontSize="clamp(0.4rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>
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
