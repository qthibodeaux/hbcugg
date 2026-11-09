import { useMemo, useState } from "react";
import { PassingSpotlight } from "./PassingSpotlight";
import { MobileTeamSwitch } from "./MobileTeamSwitch";
import { Box, Grid, Text } from "@chakra-ui/react";
import { buildPassingData } from "../../../../utils/gameBoxScore/passingModel";
import { getTeamColor, getTeamSecondary } from "../../../../utils/gameBoxScore/teamIdentity";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { useLeagueAverages } from "../../../../hooks/useSWACData";
import { PlainTable, RosterTable, SectionLabel } from "./ProductionTables";
import { heatAccent, lastName, pct, rate, shadeVsLeague } from "../../../../utils/productionPresentation";
import { parColumn } from "./ProductionBars";
import { productionIndex, sortByPar, gameParBounds } from "../../../../utils/productionScoreModel";
import { PRODUCTION_UNITS } from "../../../../utils/productionBars";

// Game passing production: team totals, selectable player tables, and spotlight.
// Shared by BoxScoreTab and GamePageMobile; chart adaptation lives in gamePassingZones.

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
        <PassingSpotlight game={game} player={activePlayer} accent={color} heat={heat} teamId={teamId} identity={identity} productionRows={productionRows} />

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
