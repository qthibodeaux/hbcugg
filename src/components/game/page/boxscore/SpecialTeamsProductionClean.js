import { SpotlightCard } from "./ProductionSpotlight";
import { chipsFor, made, buildSpecialTeamsData } from "../../../../utils/gameProduction/specialTeamsModel";
import { Text, Box, Grid } from "@chakra-ui/react";
import { getTeamColor, getTeamSecondary } from "../../../../utils/gameBoxScore/teamIdentity";
import { heatAccent, lastName, num, rate } from "../../../../utils/productionPresentation";
import { useState, useMemo } from "react";
import { SectionLabel, RosterTable } from "./ProductionTables";
import { TeamLine } from "./SpecialTeamsLine";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { useLeagueAverages } from "../../../../hooks/useSWACData";
import { MobileTeamSwitch } from "./MobileTeamSwitch";

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
