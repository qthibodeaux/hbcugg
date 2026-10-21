import { Fragment, useMemo, useState } from "react";
import { MobileTeamSwitch } from "./MobileTeamSwitch";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { buildPassingData, getTeamColor, getTeamSecondary } from "../../../organisms/test/QGameBoxScore";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { useLeagueAverages } from "../../../../hooks/useSWACData";
import {
  PlainTable,
  RosterTable,
  SectionLabel,
  SpotlightCard,
  heatAccent,
  heatFill,
  lastName,
  num,
  parColumn,
  pct,
  productionIndex,
  rate,
  shadeVsLeague,
  sortByPar,
  gameParBounds,
  PASS_ZONE_YPA_SCALE,
} from "./ProductionPrimitives";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";

// ─────────────────────────────────────────────────────────────────────────────
// Passing Production — "clean" redesign, appended BELOW the existing box score
// (QGameBoxScore.Passing / PassingBoxScoreV2) for comparison, per direct request.
// Does NOT replace anything. Reuses buildPassingData() from QGameBoxScore.js so
// the underlying data/derivation is identical — this is a display-only pass.
//
// Structure:
//   1. Eyebrow — team-colour dot + the school's abbreviation, nothing else
//   2. Team's own aggregate passing stat table (Total/Standard/Passing rows)
//   3. Individual player tables — passers, then receivers, stacked
//   4. Player spotlight + zone chart, glued together, reacting to whichever
//      single player (passer or receiver) is currently active
// ─────────────────────────────────────────────────────────────────────────────

const TeamStatTable = ({ data }) => {
  // Columns mirror Bill Connelly's advanced box score: Comp / Att / Yards / Comp Rt /
  // INT / Sacks / Yds Att. Yds/Att is the SP+ definition — sack yardage comes off the
  // top and sacks count as attempts — so it will read lower than raw yards ÷ attempts.
  const split = (label, comp, att, yards, ints, sacks, sackYards) => ({
    label,
    comp,
    att,
    yards,
    compRate: att > 0 ? pct(comp / att) : "—",
    int: ints,
    sacks,
    ypa: att + sacks > 0 ? rate((yards - sackYards) / (att + sacks)) : "—",
  });

  const rows = [
    split(
      "Total",
      data.passing.completions,
      data.passing.attempts,
      data.passing.yards,
      data.passing.interceptions,
      data.passing.sacks ?? 0,
      data.passing.sackYards ?? 0,
    ),
    split(
      "Standard Downs",
      data.downSplit.standard.comp,
      data.downSplit.standard.att,
      data.downSplit.standard.yards,
      data.downSplit.standard.int ?? 0,
      data.downSplit.standard.sacks ?? 0,
      data.downSplit.standard.sackYards ?? 0,
    ),
    split(
      "Passing Downs",
      data.downSplit.passing.comp,
      data.downSplit.passing.att,
      data.downSplit.passing.yards,
      data.downSplit.passing.int ?? 0,
      data.downSplit.passing.sacks ?? 0,
      data.downSplit.passing.sackYards ?? 0,
    ),
  ];

  return (
    <PlainTable
      rowKey={(r) => r.label}
      columns={[
        { key: "label", label: "" },
        { key: "comp", label: "Cmp" },
        { key: "att", label: "Att" },
        { key: "yards", label: "Yds" },
        { key: "compRate", label: "Cmp%" },
        { key: "int", label: "INT" },
        { key: "sacks", label: "Sks" },
        { key: "ypa", label: "Y/A" },
      ]}
      rows={rows}
    />
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// TARGET MAP — the backend's grid (RESPONSE_BACKEND_2026-10-16_passing_grid)
// ═══════════════════════════════════════════════════════════════════════════════
// Each passer / receiver row in the game file carries `direction_breakdown`:
// depth (air yards to the catch / target / interception spot: short < 4,
// medium 4-12, deep 13+) x lane (left / middle / right, as the crew writes it),
// plus `uncharted` — throws with no depth (a crew that never spots
// incompletions) or no lane (interceptions). Cells + uncharted = every attempt.
// Read straight off the file; nothing is spread or guessed. A row with no
// breakdown (older seasons) shows no grid.
//
// Some crews never spot incompletions (RESPONSE_BACKEND_2026-10-19_call_grid).
// The file says so — `metadata.pass_spotting.incompletion_depth: "unspotted"`
// — and then the grid is `call_breakdown` instead: placed by the crew's own
// call ("pass incomplete short left"), two rows, Short and Deep, no air-yard
// ranges (the crew's "short" runs to ~19 yards).

const DEPTHS = [
  { key: "deep", label: "Deep", range: "> 12" },
  { key: "medium", label: "Med", range: "4 – 12" },
  { key: "short", label: "Short", range: "< 4" },
];
const CALL_DEPTHS = [
  { key: "deep", label: "Deep", range: null },
  { key: "short", label: "Short", range: null },
];
const DIRS = ["Left", "Middle", "Right"];
const LANES = ["left", "middle", "right"];
// Above this share of uncharted throws the grid misleads more than it shows.
const HIDE_UNCHARTED_SHARE = 0.2;

const realZones = (game, teamId, player) => {
  const isPasser = player._type === "passer";
  const rows = game?.individual_stats?.[teamId]?.[isPasser ? "passing" : "receiving"] ?? [];
  const row = rows.find((r) => r.player_key === player.key) ?? rows.find((r) => r.name === player.name);
  const byCall = game?.metadata?.pass_spotting?.incompletion_depth === "unspotted" && !!row?.call_breakdown;
  const bd = byCall ? row.call_breakdown : row?.direction_breakdown;
  if (!bd) return null;
  const depths = byCall ? CALL_DEPTHS : DEPTHS;
  const [attK, compK] = isPasser ? ["attempts", "completions"] : ["targets", "receptions"];
  const cells = depths.flatMap((d) => LANES.map((lane) => {
    const c = bd[d.key]?.[lane] ?? {};
    return { att: Number(c[attK] ?? 0), comp: Number(c[compK] ?? 0), yards: Number(c.yards ?? 0) };
  }));
  const u = bd.uncharted ?? {};
  const uncharted = Number(u.attempts ?? u.targets ?? 0);
  const total = cells.reduce((n, c) => n + c.att, 0) + uncharted;
  return {
    depths,
    cells,
    adot: typeof row.adot === "number" ? row.adot : null,
    uncharted,
    noDepth: Number(u.no_depth ?? 0),
    noLane: Number(u.no_direction ?? 0),
    total,
    hidden: total > 0 && uncharted / total > HIDE_UNCHARTED_SHARE,
  };
};

const ZoneCell = ({ cell, heat }) => {
  // Heat is yards per attempt, not completion rate: the cell already prints "1/1", so
  // colour has to carry something the numerals don't — and completion rate would paint
  // a checkdown on 3rd-and-10 the same shade as a conversion.
  const { bg, border } = heatFill(cell?.att ? cell.yards / cell.att : 0, cell?.att ?? 0, PASS_ZONE_YPA_SCALE, heat);
  const empty = !cell || cell.att === 0;
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="clamp(1.75rem, 2.6vw, 2.25rem)"
      borderRadius="sm"
      bg={bg}
      border="0.0625rem solid"
      borderColor={border}
      minW={0}
    >
      {/* Empty zones carry no numerals. Six of nine cells are usually empty in a single
          game, and at full weight they drown the three that mean something. */}
      {!empty && (
        <>
          <Text fontSize="clamp(0.6rem, 0.82vw, 0.75rem)" fontWeight="900" color="white" lineHeight={1.1}>
            {cell.comp}/{cell.att}
          </Text>
          <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="700" color="rgba(255,255,255,0.5)" lineHeight={1.2}>
            {cell.yards}y
          </Text>
        </>
      )}
    </Flex>
  );
};

const SpotlightZoneWidget = ({ game, player, accent, heat, teamId, identity, productionRows }) => {
  const zones = useMemo(() => (player ? realZones(game, teamId, player) : null), [game, teamId, player]);
  if (!player) return null;

  const isPasser = player._type === "passer";
  // The interception cost the backend books inside passing_production — shown
  // beside the INT count, never added to the components.
  const intCost = isPasser ? (productionRows ?? []).find((r) => r.player_key === player.key)?.passing_production_penalty : null;
  const chips = isPasser
    ? [
        ["Cmp/ Att", `${player.completions}/${player.attempts}`],
        ["Yds", player.yards],
        ["Cmp Rt", pct(player.compRate)],
        ["Yd/ Att", rate(player.ydsPerAtt)],
        ["Sacks", player.sacks_taken],
        ["INT", Number.isFinite(intCost) && intCost !== 0 ? `${player.interceptions} (${intCost.toFixed(1)})` : player.interceptions],
        ["TD", player.touchdowns],
        ["aDOT", rate(zones?.adot)],
        // Third row — QB only, all four straight field reads. EPA/play ships on
        // 2026 rows, third-down and deep splits on 2019-2025 rows, and success
        // rate on neither yet, so part of this row dashes out on any given game.
        // Nothing here is derived or invented; it fills in as the fields land.
        ["EPA/ Play", player.epaPerPlay == null ? "—" : player.epaPerPlay.toFixed(2)],
        ["Succ Rt", pct(player.successRate)],
        ["3rd Dn", pct(player.thirdDownRate)],
        ["Deep C-A", player.deepAttempts == null ? "—" : `${player.deepCompletions}-${player.deepAttempts}`],
      ]
    : [
        ["Ct/ Tg", `${player.receptions}/${player.targets}`],
        ["Yds", player.yards],
        ["Succ Rt", pct(player.successRate)],
        ["Yd/ Ch", rate(player.ydsPerCatch)],
        ["Yd/ Tg", rate(player.ydsPerTarget)],
        ["TD", player.touchdowns],
        ["aDOT", rate(zones?.adot)],
        // Third row — receiver only. All five are pending backend fields and dash
        // out today; they fill in on their own as the fields land.
        ["YAC", num(player.yardsAfterCatch)],
        ["YAC/ Rec", rate(player.yacPerReception)],
        ["1st Dn", num(player.firstDownReceptions)],
        ["Expl Ct", num(player.explosiveReceptions)],
        ["3rd Dn Ct", num(player.thirdDownReceptions)],
      ];

  return (
    <SpotlightCard
      name={player.name}
      playerKey={player.key}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={productionRows}
      productionComponent={isPasser ? "passing_production" : "receiving_production"}
      roleFallback={isPasser ? "QB" : "WR"}
      chips={chips}
    >
      {zones && !zones.hidden && (
        <Grid templateColumns="clamp(2rem, 3vw, 2.5rem) repeat(3, minmax(0, 1fr))" gap={1}>
          <Box />
          {DIRS.map((d) => (
            <Text key={d} fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">
              {d}
            </Text>
          ))}
          {zones.depths.map((depth, row) => (
            <Fragment key={depth.key}>
              <Flex direction="column" justify="center" minW={0}>
                <Text fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2}>
                  {depth.label}
                </Text>
                {depth.range && (
                  <Text fontSize="clamp(0.4rem, 0.55vw, 0.5rem)" fontWeight="700" color="rgba(255,255,255,0.28)" lineHeight={1.3}>
                    {depth.range}
                  </Text>
                )}
              </Flex>
              {DIRS.map((_, col) => {
                const i = row * 3 + col;
                return <ZoneCell key={i} cell={zones.cells[i]} heat={heat} />;
              })}
            </Fragment>
          ))}
        </Grid>
      )}
      {/* Throws the crew left unplaceable, counted — never spread into cells. */}
      {zones && zones.uncharted > 0 && (
        <Text mt={1} fontSize="clamp(0.5rem, 0.66vw, 0.62rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.06em">
          {zones.hidden ? `${zones.uncharted} of ${zones.total} not charted` : `${zones.uncharted} not charted`}
          {zones.noLane > 0 && zones.noDepth === 0 ? " (INT)" : ""}
        </Text>
      )}
    </SpotlightCard>
  );
};

// Four-row shell, shared with Rushing and Defense: (1) team production table,
// (2) player spotlight — full-width, horizontal (identity / chips / chart),
// (3) player production tables, full width below it. A fourth row (defensive
// impact) is planned but intentionally not built here yet — pending design.
const signed2 = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}`);
const signed1 = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}`);

const TeamPassingBlock = ({ game, gameScores, teamId, data, identity, productionRows, leagueKeys, hideLabel = false }) => {
  const color = getTeamColor(teamId);
  const heat = heatAccent(color, getTeamSecondary(teamId));

  const par = useMemo(() => productionIndex(productionRows), [productionRows]);
  // Each table is ranked and scored on its own component — a QB's rushing
  // production stays out of the passing table.
  const passers = useMemo(() => sortByPar(data.passers, par, "passing_production"), [data.passers, par]);
  const receivers = useMemo(() => sortByPar(data.receivers, par, "receiving_production"), [data.receivers, par]);

  // Comparative shading: passers against the league's team passing line,
  // receivers against the league's receiver-row baseline (individual_stats).
  const passSR = leagueKeys?.["passing_splits.total.success_rate"] ?? null;
  const passEPA = leagueKeys?.["passing_splits.total.epa_per_play"] ?? null;
  const recvSR = leagueKeys?.["individual_stats.receiving.success_rate"] ?? null;
  const recvEPA = leagueKeys?.["individual_stats.receiving.epa_per_target"] ?? null;

  const [activePlayer, setActivePlayer] = useState(
    passers[0] ? { ...passers[0], _type: "passer" } : null,
  );

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      {!hideLabel && <SectionLabel dotColor={color}>{data.meta.displayName} Passing Production</SectionLabel>}

      <Box display="flex" flexDirection="column" gap={2} pb={2}>
        {/* Row 1 — team production table, straight under the eyebrow */}
        <TeamStatTable data={data} />

        {/* Row 2 — player spotlight, full-bleed band */}
        <SpotlightZoneWidget game={game} player={activePlayer} accent={color} heat={heat} teamId={teamId} identity={identity} productionRows={productionRows} />

        {/* Row 3 — player production tables, full width */}
        <Box minW={0}>
          <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" px={3} mb={1}>Passing</Text>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={activePlayer?._type === "passer" ? activePlayer.key : null}
            onRowClick={(r) => setActivePlayer({ ...r, _type: "passer" })}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "compAtt", label: "C/A", render: (r) => `${r.completions}/${r.attempts}` },
              { key: "yards", label: "Yds" },
              { key: "touchdowns", label: "TD" },
              { key: "interceptions", label: "INT" },
              { key: "ypa", label: "Y/A", render: (r) => rate(r.ypa) },
              { key: "adot", label: "aDOT", render: (r) => rate(r.adot) },
              { key: "successRate", label: "SR%", render: (r) => pct(r.successRate), shade: (r) => shadeVsLeague(r.successRate, passSR) },
              { key: "epaTotal", label: "EPA", render: (r) => signed1(r.epaTotal) },
              { key: "epaPerPlay", label: "EPA/DB", render: (r) => signed2(r.epaPerPlay), shade: (r) => shadeVsLeague(r.epaPerPlay, passEPA) },
              parColumn(passers, par, color, PRODUCTION_UNITS.passing.label, "passing_production", gameParBounds(gameScores)),
            ]}
            rows={passers}
          />

          <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" px={3} mt={2} mb={1}>Receiving</Text>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={activePlayer?._type === "receiver" ? activePlayer.key : null}
            onRowClick={(r) => setActivePlayer({ ...r, _type: "receiver" })}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "tgtRecYds", label: "Tgt/Rec/Yds", render: (r) => `${r.targets}/${r.receptions}/${r.yards}` },
              { key: "ydsPerCatch", label: "Y/C", render: (r) => rate(r.ydsPerCatch) },
              { key: "ydsPerTarget", label: "Y/Tgt", render: (r) => rate(r.ydsPerTarget) },
              // SR, EPA and EPA/Tgt are not on the receiving row yet — they dash until
              // the backend ships them, and are never counted off the raw plays here.
              { key: "successRate", label: "SR%", render: (r) => pct(r.successRate), shade: (r) => shadeVsLeague(r.successRate, recvSR) },
              { key: "epaTotal", label: "EPA", render: (r) => signed1(r.epaTotal) },
              { key: "epaPerTarget", label: "EPA/Tgt", render: (r) => signed2(r.epaPerTarget), shade: (r) => shadeVsLeague(r.epaPerTarget, recvEPA) },
              parColumn(receivers, par, color, PRODUCTION_UNITS.receiving.label, "receiving_production", gameParBounds(gameScores)),
            ]}
            rows={receivers}
          />
        </Box>
      </Box>
    </Box>
  );
};

export const PassingProductionClean = ({ game, playerSeasons, priorPlayerSeasons = [], productionScores, awayId, homeId, mobile = false }) => {
  const [shown, setShown] = useState(null);
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const { data: leagueAvg } = useLeagueAverages(Number(game?.season) || undefined);
  const leagueKeys = leagueAvg?.keys ?? null;
  const awayData = buildPassingData(game, awayId);
  const homeData = buildPassingData(game, homeId);
  if (!awayData || !homeData) return null;

  // Phones: one team at a time under a switcher, no outer margins.
  if (mobile) {
    const team = shown ?? awayId;
    const isHome = team === homeId;
    return (
      <Box w="full">
        <MobileTeamSwitch title="Passing Production" awayId={awayId} homeId={homeId} value={team} onChange={setShown} />
        {isHome ? <TeamPassingBlock game={game} gameScores={productionScores} hideLabel teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} leagueKeys={leagueKeys} /> : <TeamPassingBlock game={game} gameScores={productionScores} hideLabel teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} leagueKeys={leagueKeys} />}
      </Box>
    );
  }

  return (
    <Box w="full" mt={8} mb={12}>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={1.5}>
        <TeamPassingBlock game={game} gameScores={productionScores} teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} leagueKeys={leagueKeys} />
        <TeamPassingBlock game={game} gameScores={productionScores} teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} leagueKeys={leagueKeys} />
      </Grid>
    </Box>
  );
};

export default PassingProductionClean;
