import { PlainTable, SectionLabel, RosterTable } from "./ProductionTables";
import { num, pct, heatAccent, lastName } from "../../../../utils/productionPresentation";
import { Grid, Box, Text } from "@chakra-ui/react";
import { StatChip, SpotlightCard } from "./ProductionSpotlight";
import { HavocSpatialChart } from "./HavocSpatialChart";
import { getTeamColor, getTeamSecondary } from "../../../../utils/gameBoxScore/teamIdentity";
import { useMemo, useState } from "react";
import { productionIndex, sortByPar, gameParBounds } from "../../../../utils/productionScoreModel";
import { parColumn } from "./ProductionBars";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { buildDefenseData } from "../../../../utils/gameProduction/defenseModel";
import { MobileTeamSwitch } from "./MobileTeamSwitch";

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
