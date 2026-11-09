import { getTeamColor, getTeamSecondary } from "../../../../utils/gameBoxScore/teamIdentity";
import { heatAccent, lastName, rate, pct, shadeVsLeague } from "../../../../utils/productionPresentation";
import { useMemo, useState } from "react";
import { productionIndex, sortByPar, gameParBounds } from "../../../../utils/productionScoreModel";
import { Box, Text, Grid } from "@chakra-ui/react";
import { SectionLabel, RosterTable } from "./ProductionTables";
import { TeamRushLine } from "./RushingContextLine";
import { RusherSpotlight } from "./RushingSpotlight";
import { parColumn } from "./ProductionBars";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { buildRushingData } from "../../../../utils/gameProduction/rushingModel";
import { useLeagueAverages, useTeamSeasonAvg } from "../../../../hooks/useSWACData";
import { MobileTeamSwitch } from "./MobileTeamSwitch";

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
