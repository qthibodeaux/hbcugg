import { useMemo, useState } from "react";
import { MobileTeamSwitch } from "./MobileTeamSwitch";
import { Box, Grid, Text } from "@chakra-ui/react";
import { getTeamColor, getTeamSecondary, getTeamDisplayName } from "../../../organisms/test/QGameBoxScore";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { HavocSpatialChart, toHavocEvents } from "./HavocSpatialChart";
import {
  PlainTable,
  RosterTable,
  SectionLabel,
  SpotlightCard,
  StatChip,
  heatAccent,
  lastName,
  num,
  parColumn,
  pct,
  productionIndex,
  sortByPar,
  gameParBounds,
} from "./ProductionPrimitives";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";

// ─────────────────────────────────────────────────────────────────────────────
// Defense Production — the defensive counterpart to Passing/Rushing Production.
//
// Structure:
//   1. Eyebrow — team-colour dot + the school's short name
//   2. Team defense table (single row — no down split established for defense yet)
//   3. Individual defender table
//   4. Player spotlight, reacting to whichever defender is active
//
// Every field below is read directly off the export — nothing here scans
// `play_by_play` to reconstruct a stat the payload doesn't already carry. Passes
// defended, forced fumbles and QB hurries ship on `individual_stats.defense` for
// 2019-2025 and print real; the 2026 export drops all three from that block (see
// BACKEND_RESPONSE_SPEC.md §1b), so those three columns dash out on a 2026 game
// rather than being counted back out of the raw plays.
//
// The havoc spatial chart reads `havoc_events[]` off the defender's row — lane and
// yards-from-LOS are the backend's to compute (LAUNCH_0_BACKEND_NOTES.md, Game Page);
// the frontend only plots the coordinate. Empty until the field ships.
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// Real on every season: tackles, tfl, sacks, interceptions (individual_stats.defense),
// havoc_rate_forced (advanced_team, 100% populated both schemas).
// Real on 2019-2025 only, absent from 2026's individual_stats.defense entirely:
// solo_tackles, assisted_tackles, passes_defended, forced_fumbles, qb_hurries.

const buildDefenseData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const adv = game?.advanced_team?.[teamId] ?? {};
  const rows = (stats.defense ?? []).filter((r) => r.name !== "TEAM");

  const defenders = rows.map((r) => {
    const tackles = r.tackles ?? 0;
    const tfl = r.tfl ?? 0;
    const sacks = r.sacks ?? 0;
    const interceptions = r.interceptions ?? 0;
    const passesDefended = r.passes_defended ?? null;
    const forcedFumbles = r.forced_fumbles ?? null;
    const hurries = r.qb_hurries ?? null;
    // The house havoc formula: tfl + sacks + forced fumbles + passes defended +
    // interceptions. Only computed when every input is a real number for this
    // season — on 2026, forcedFumbles/passesDefended are null, so havoc is null
    // rather than a quietly wrong total missing two of its five terms.
    const havoc =
      forcedFumbles != null && passesDefended != null
        ? tfl + sacks + forcedFumbles + passesDefended + interceptions
        : null;

    return {
      key: r.player_key,
      name: r.name,
      tackles,
      soloTackles: r.solo_tackles ?? null,
      assistedTackles: r.assisted_tackles ?? null,
      tfl,
      sacks,
      interceptions,
      passesDefended,
      forcedFumbles,
      hurries,
      havoc,
      // Backend-provided, none of it shipping yet on any season — checked across
      // 31,836 defense rows, 2019-2026. Read null and dash out; nothing here is
      // reassembled from raw plays. See STATS_HUB_CARD_INVENTORY.md.
      clutchStops: r.clutch_stops ?? null,
      redZoneDisruptions: r.red_zone_disruptions ?? null,
      turnoversCreated: r.turnovers_created ?? null,
      thirdDownHavoc: r.third_down_havoc ?? null,
      havocEvents: toHavocEvents(r.havoc_events),
    };
  });

  const sumOrNull = (list, key) => (list.some((d) => d[key] == null) ? null : list.reduce((s, d) => s + d[key], 0));

  const totals = {
    tackles: defenders.reduce((s, d) => s + d.tackles, 0),
    tfl: defenders.reduce((s, d) => s + d.tfl, 0),
    sacks: defenders.reduce((s, d) => s + d.sacks, 0),
    interceptions: defenders.reduce((s, d) => s + d.interceptions, 0),
    passesDefended: sumOrNull(defenders, "passesDefended"),
    forcedFumbles: sumOrNull(defenders, "forcedFumbles"),
    havoc: sumOrNull(defenders, "havoc"),
  };

  // Table shows contributors, not the full roster — bench/special-teams-only
  // names with a single assisted tackle just add scroll. Checked against the
  // raw counts, not the possibly-null `havoc` total, so a 2026 game (PD/FF
  // missing) doesn't lose a real TFL/sack/INT guy because havoc came out null.
  const isContributor = (d) =>
    d.tackles >= 2 || d.tfl > 0 || d.sacks > 0 || d.interceptions > 0 || (d.passesDefended ?? 0) > 0 || (d.forcedFumbles ?? 0) > 0;

  return {
    meta: { displayName: getTeamDisplayName(teamId) },
    totals,
    havocRate: adv.havoc_rate_forced ?? null,
    // Tackles order the list here only as a stable base — the panel re-sorts by
    // PAR, and a defender with no production row falls to the bottom in that
    // order rather than into an arbitrary one. Not sorted on havoc: it is null
    // on any season missing PD/FF, and a key that disappears by season isn't one.
    defenders: defenders.filter(isContributor).sort((a, b) => b.tackles - a.tackles),
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════════════════════

const TeamDefenseTable = ({ data }) => (
  <>
    <PlainTable
      rowKey={(r) => r.label}
      columns={[
        { key: "label", label: "" },
        { key: "tackles", label: "Tkl" },
        { key: "havoc", label: "Hvc" },
        { key: "tfl", label: "TFL" },
        { key: "sacks", label: "Sks" },
        { key: "pd", label: "PD" },
        { key: "ff", label: "FF" },
        { key: "int", label: "INT" },
      ]}
      rows={[
        {
          label: "Total",
          tackles: num(data.totals.tackles),
          tfl: num(data.totals.tfl),
          sacks: num(data.totals.sacks),
          pd: num(data.totals.passesDefended),
          ff: num(data.totals.forcedFumbles),
          int: num(data.totals.interceptions),
          havoc: num(data.totals.havoc),
        },
      ]}
    />
    <Grid templateColumns="repeat(1, minmax(0, 1fr))" gap={2} px={3} pt={2}>
      <StatChip label="Havoc Rate" value={pct(data.havocRate)} />
    </Grid>
  </>
);

const DefenderSpotlight = ({ player, accent, teamId, identity, productionRows }) => {
  if (!player) return null;

  const chips = [
    ["Tkl", num(player.tackles)],
    ["TFL", num(player.tfl)],
    ["Sacks", num(player.sacks)],
    ["INT", num(player.interceptions)],
    ["PD", num(player.passesDefended)],
    ["FF", num(player.forcedFumbles)],
    ["Hrry", num(player.hurries)],
    ["Havoc", num(player.havoc)],
    // Third row — pending backend fields, all dashing out today.
    ["Clutch", num(player.clutchStops)],
    ["RZ Disr", num(player.redZoneDisruptions)],
    ["TO Crtd", num(player.turnoversCreated)],
    ["3rd Hvc", num(player.thirdDownHavoc)],
  ];

  return (
    <SpotlightCard
      name={player.name}
      playerKey={player.key}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={productionRows}
      roleFallback="DEF"
      chips={chips}
    >
      {/* One dot per havoc play this defender made — lane on x, yards from the LOS on y. */}
      <HavocSpatialChart events={player.havocEvents ?? []} />
    </SpotlightCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL
// ═══════════════════════════════════════════════════════════════════════════════

// Four-row shell, shared with Passing and Rushing: (1) team production table,
// (2) player spotlight — full-width, horizontal (identity / chips / chart),
// (3) player production table, full width below it. Row 4 (defensive impact)
// is planned but intentionally not built here yet — pending design.
const TeamDefenseBlock = ({ gameScores, teamId, data, identity, productionRows, hideLabel = false }) => {
  const color = getTeamColor(teamId);
  const heat = heatAccent(color, getTeamSecondary(teamId));

  const par = useMemo(() => productionIndex(productionRows), [productionRows]);
  const defenders = useMemo(() => sortByPar(data.defenders, par), [data.defenders, par]);

  const [active, setActive] = useState(defenders[0] ?? null);

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      {!hideLabel && <SectionLabel dotColor={color}>{data.meta.displayName} Defensive Production</SectionLabel>}

      <Box display="flex" flexDirection="column" gap={2} pb={2}>
        {/* Row 1 — team production table, straight under the eyebrow */}
        <TeamDefenseTable data={data} />

        {/* Row 2 — player spotlight, full-bleed band */}
        <DefenderSpotlight
          player={active}
          accent={heat}
          teamId={teamId}
          identity={identity}
          productionRows={productionRows}
        />

        {/* Row 3 — player production table, full width */}
        <Box minW={0}>
          <Text fontSize="9px" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" px={3} mb={1}>
            Defense
          </Text>
          <RosterTable
            rowKey={(r) => r.key}
            activeKey={active?.key ?? null}
            onRowClick={(r) => setActive(r)}
            columns={[
              { key: "name", label: "Player", render: (r) => lastName(r.name) },
              { key: "tackles", label: "Tkl" },
              { key: "havoc", label: "Hvc", render: (r) => num(r.havoc) },
              { key: "tfl", label: "TFL" },
              { key: "sacks", label: "Sks" },
              { key: "passesDefended", label: "PD", render: (r) => num(r.passesDefended) },
              // Interceptions come off the column list to hold the table at six
              // stats — they still count, inside Hvc.
              { key: "forcedFumbles", label: "FF", render: (r) => num(r.forcedFumbles) },
              parColumn(defenders, par, heat, PRODUCTION_UNITS.defense.label, null, gameParBounds(gameScores)),
            ]}
            rows={defenders}
          />
        </Box>

        {/* Row 4 — defensive impact: pending design, intentionally left off. */}
      </Box>
    </Box>
  );
};

export const DefenseProductionClean = ({ game, playerSeasons, priorPlayerSeasons = [], productionScores, awayId, homeId, mobile = false }) => {
  const [shown, setShown] = useState(null);
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const awayData = useMemo(() => buildDefenseData(game, awayId), [game, awayId]);
  const homeData = useMemo(() => buildDefenseData(game, homeId), [game, homeId]);
  if (!awayData || !homeData) return null;

  // Phones: one team at a time under a switcher, no outer margins.
  if (mobile) {
    const team = shown ?? awayId;
    const isHome = team === homeId;
    return (
      <Box w="full">
        <MobileTeamSwitch title="Defensive Production" awayId={awayId} homeId={homeId} value={team} onChange={setShown} />
        {isHome ? <TeamDefenseBlock gameScores={productionScores} hideLabel teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} /> : <TeamDefenseBlock gameScores={productionScores} hideLabel teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} />}
      </Box>
    );
  }

  return (
    <Box w="full" mt={8} mb={12}>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={1.5}>
        <TeamDefenseBlock gameScores={productionScores} teamId={awayId} data={awayData} identity={identity} productionRows={productionScores?.[awayId]} />
        <TeamDefenseBlock gameScores={productionScores} teamId={homeId} data={homeData} identity={identity} productionRows={productionScores?.[homeId]} />
      </Grid>
    </Box>
  );
};

export default DefenseProductionClean;
