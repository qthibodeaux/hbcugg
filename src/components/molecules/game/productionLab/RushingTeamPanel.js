import { Grid, Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { resolveTeamId, getTeam, normalizeStatsList, getRushingPlaybookMetrics, getRushLanes } from "../../../../utils/gameProductionLabModel";
import { useMemo, useState, Fragment } from "react";
import { usePlayerStatsEnriched } from "../../../../hooks/useSWACData";
import { SmartTable } from "./SmartTable";
import { getLastName } from "./productionNames";
import { PlayerSpotlight } from "./PlayerSpotlight";
import { DisruptionPanel } from "./DisruptionPanel";

// Existing implementation extracted along responsibility boundaries.

const RushingLedgerGrid = ({ metrics, color }) => {
  const renderLine = (label, list, labelBg) => {
    return (
      <Grid
        templateColumns="1.2fr repeat(5, 1fr)"
        gap="0.1875rem"
        py="0.2rem"
        px="0.5rem"
        w="full"
        bg="rgba(0, 0, 0, 0.35)"
        border="0.0625rem solid"
        borderLeft="0.1875rem solid"
        borderColor="whiteAlpha.100"
        borderLeftColor={labelBg}
        borderRadius="0.125rem"
        alignItems="center"
      >
        <Box pl="0.25rem" flexShrink={0}>
          <Text fontSize="0.6rem" fontWeight="955" color={labelBg} textTransform="uppercase" letterSpacing="0.04em">
            {label}
          </Text>
        </Box>
        {list.map((m, idx) => (
          <HStack key={idx} gap="0.25rem" justify="flex-start" pl="0.375rem" alignItems="baseline" wrap="nowrap" overflow="hidden">
            <Text fontSize="0.75rem" fontWeight="955" color="text.primary" flexShrink={0}>
              {m.val}
            </Text>
            <Text fontSize="0.55rem" fontWeight="800" color="text.muted" textTransform="uppercase" letterSpacing="0.02em" flexShrink={0}>
              {m.unit}
            </Text>
          </HStack>
        ))}
      </Grid>
    );
  };

  return (
    <VStack align="stretch" gap="0.1875rem" w="full">
      {renderLine("Team Totals", metrics.totals, "#ECC94B")}
      {renderLine("Shared Flow", metrics.shared, "#48BB78")}
      {renderLine("RB Created", metrics.rbCreated, color)}
      {renderLine("OL Earned", metrics.olEarned, "#4A90D9")}
    </VStack>
  );
};

export const RushingTeamPanel = ({ teamId = "", game }) => {
  const resolvedTeamId = resolveTeamId(teamId);
  const team = getTeam(resolvedTeamId);
  const color = resolvedTeamId.toLowerCase().includes("pvamu") ? team.colors?.secondary : (team.colors?.accent || "#E53E3E");

  const meta = game?.metadata ?? {};
  const awayTeamId = resolveTeamId(meta.away_team);
  const homeTeamId = resolveTeamId(meta.home_team);
  const opponentId = resolvedTeamId === awayTeamId ? homeTeamId : awayTeamId;
  const opponent = getTeam(opponentId);

  const stats = game?.individual_stats?.[resolvedTeamId] ?? {};
  // eslint-disable-next-line no-unused-vars
  const teamStats = game?.team_stats?.[resolvedTeamId] ?? {};

  // Extract and enrich rushers list
  const rushers = useMemo(() => {
    const rawList = normalizeStatsList(stats.rushing).filter(p => p.name !== "TEAM");
    return rawList.map(p => ({
      ...p,
      key: p.player_key,
      position: "RB"
    })).sort((a, b) => (b.yards || 0) - (a.yards || 0));
  }, [stats.rushing]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [prevTeamId, setPrevTeamId] = useState("");

  const { players: enrichedPlayers } = usePlayerStatsEnriched();
  const avatarMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(enrichedPlayers)) return map;
    enrichedPlayers.forEach(p => {
      if (p.image_url) {
        if (p.full_name) map[p.full_name.toLowerCase().trim()] = p.image_url;
        if (p.name_display) map[p.name_display.toLowerCase().trim()] = p.image_url;
        if (p.name_raw) map[p.name_raw.toLowerCase().trim()] = p.image_url;

        const parts = p.full_name.split(" ");
        if (parts.length >= 2) {
          const lastFirst = `${parts[parts.length - 1].toLowerCase()},${parts[0].toLowerCase()}`;
          map[lastFirst] = p.image_url;
        }
      }
    });
    return map;
  }, [enrichedPlayers]);

  if (resolvedTeamId !== prevTeamId) {
    setPrevTeamId(resolvedTeamId);
    setSelectedPlayer(rushers[0] || null);
  }

  const activePlayer = selectedPlayer || rushers[0] || null;

  const activePlayerImg = useMemo(() => {
    if (!activePlayer) return null;
    const lookupKey = activePlayer.name.toLowerCase().trim();
    return avatarMap[lookupKey] || null;
  }, [activePlayer, avatarMap]);

  // Derived array calculations for team totals
  const totalCarries = rushers.reduce((sum, r) => sum + (r.attempts || 0), 0);
  const totalYards = rushers.reduce((sum, r) => sum + (r.yards || 0), 0);
  const totalYpc = totalCarries > 0 ? totalYards / totalCarries : 0;
  const totalLineYards = rushers.reduce((sum, r) => sum + (r.lineYards || Math.round((r.yards || 0) * 0.45)), 0);

  const rushingPlaybookMetrics = useMemo(() => {
    return getRushingPlaybookMetrics(game, resolvedTeamId, rushers, totalCarries, totalYards, totalYpc, totalLineYards);
  }, [game, resolvedTeamId, rushers, totalCarries, totalYards, totalYpc, totalLineYards]);

  // Lanes derived safely for selected player
  const playerLanes = useMemo(() => {
    if (!activePlayer) return { left: {}, middle: {}, right: {} };
    return getRushLanes(activePlayer, game);
  }, [activePlayer, game]);

  const totalAtt = activePlayer?.attempts || 1;

  // Calculate ground truth totals from the dynamic lanes adapter
  const successRuns = playerLanes.left.success + playerLanes.middle.success + playerLanes.right.success;
  const spotlightLineYards = playerLanes.left.lineYards + playerLanes.middle.lineYards + playerLanes.right.lineYards;
  const spotlightOpportunities = playerLanes.left.opportunity + playerLanes.middle.opportunity + playerLanes.right.opportunity;
  const spotlightStuffed = playerLanes.left.stuffed + playerLanes.middle.stuffed + playerLanes.right.stuffed;
  // eslint-disable-next-line no-unused-vars
  const spotlightStopped = playerLanes.left.stopped + playerLanes.middle.stopped + playerLanes.right.stopped;
  const highlightYards = Math.max(0, (activePlayer?.yards || 0) - spotlightLineYards);

  const blocked = Math.max(0, totalAtt - spotlightStuffed - spotlightOpportunities);

  const signatureBar = [
    { label: "STUFF", value: (spotlightStuffed / totalAtt) * 100, color: "#E53E3E" },
    { label: "BLOCK", value: (blocked / totalAtt) * 100, color: "#4A90D9" },
    { label: "EXPL", value: (spotlightOpportunities / totalAtt) * 100, color: "#48BB78" },
  ];

  const hltOpp = spotlightOpportunities > 0 ? highlightYards / spotlightOpportunities : 0;

  const spotlightMetrics = [
    { label: "Rushes-Yds", value: `${activePlayer?.attempts || 0}-${activePlayer?.yards || 0}` },
    { label: "Yds/Carry", value: activePlayer?.attempts > 0 ? (activePlayer.yards / activePlayer.attempts).toFixed(2) : "0.00" },
    { label: "LY/Carry", value: activePlayer?.attempts > 0 ? (spotlightLineYards / activePlayer.attempts).toFixed(2) : "0.00" },
    { label: "Succ. Rt.", value: activePlayer?.attempts > 0 ? `${Math.round((successRuns / activePlayer.attempts) * 100)}%` : "0%" },
    { label: "Opp Rate", value: activePlayer?.attempts > 0 ? `${Math.round((spotlightOpportunities / activePlayer.attempts) * 100)}%` : "0%" },
    { label: "Hlt/Opp", value: hltOpp.toFixed(2), color: color },
  ];

  // Defensive disruption metrics
  const advOpp = game?.game_advanced?.team_advanced?.[opponentId] ?? {};
  const defId = advOpp.defensive_identity ?? {};
  const havoc = advOpp.havoc ?? {};

  const disruptionMetrics = [
    { label: "Stop Rate", value: defId.stop_rate ?? 0.42, displayValue: `${Math.round((defId.stop_rate ?? 0.42) * 100)}%`, sub: "stuffed/failed rushes", color: "#F6AD55" },
    { label: "Stuff Rate", value: havoc.stuff_rate ?? 0.19, displayValue: `${Math.round((havoc.stuff_rate ?? 0.19) * 100)}%`, sub: "tackles behind LOS", color: "#E53E3E" },
    { label: "TFL Force", value: (havoc.tfls || 6.0) / 10, displayValue: `${havoc.tfls || 6.0}`, sub: "total backfield TFLs", color: "#E53E3E" },
    { label: "Power Stoppage", value: defId.power_success_prevented ?? 0.50, displayValue: `${Math.round((defId.power_success_prevented ?? 0.50) * 100)}%`, sub: "short yardage stops", color: "#F6AD55" },
    { label: "1D Success Allowed", value: defId.first_down_success_prevented ?? 0.38, displayValue: `${Math.round((defId.first_down_success_prevented ?? 0.38) * 100)}%`, sub: "first down leverage", color: "#48BB78" },
    { label: "Opp Allowed", value: defId.opportunity_rate_allowed ?? 0.30, displayValue: `${Math.round((defId.opportunity_rate_allowed ?? 0.30) * 100)}%`, sub: "prevent 5+ yd runs", color: "#4A90D9" },
  ];

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── Standardized Rushing Ledger Header ── */}
      <Flex direction="column" gap="4px" p="5px" bg={team.colors?.primary || "#141416"} flexShrink={0}>
        <Text fontSize="0.688rem" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1}>
          {team.name || "TEAM"} Rushing Production
        </Text>
        <RushingLedgerGrid metrics={rushingPlaybookMetrics} color={color} />
      </Flex>

      {/* ── Table & Spotlight ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Left Side: Smart Table */}
        <Box w="58%" p="6px" borderRight="1px solid" borderColor="whiteAlpha.100" display="flex" flexDirection="column" minH={0}>
          <SmartTable
            headers={["Player", "Car", "Yds", "YPC", "LY/C", "SR", "Opp %"]}
            data={rushers}
            limit={13}
            activeKey={activePlayer?.key}
            onSelect={setSelectedPlayer}
            accentColor={color}
            renderRow={(p) => {
              const ypc = p.attempts > 0 ? p.yards / p.attempts : 0;
              const lyc = p.attempts > 0 ? (p.lineYards || Math.round(p.yards * 0.45)) / p.attempts : 0;
              const sr = p.attempts > 0 ? (p.successRuns || Math.round(p.attempts * 0.45)) / p.attempts : 0;
              const oppRate = p.attempts > 0 ? (p.opportunityRuns || Math.round(p.attempts * 0.25)) / p.attempts : 0;

              return (
                <Fragment>
                  <Box minW={0} pl="2px">
                    <Text fontSize="clamp(0.7rem, 0.8vw, 0.8rem)" fontWeight="955" color="text.primary" truncate>
                      {getLastName(p.name)}
                    </Text>
                  </Box>
                  <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.attempts}</Text>
                  <Text fontSize="0.7rem" fontWeight="955" color="text.primary" textAlign="right">{p.yards}</Text>
                  <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{ypc.toFixed(1)}</Text>
                  <Text fontSize="0.7rem" fontWeight="800" color="text.muted" textAlign="right">{lyc.toFixed(1)}</Text>
                  <Text fontSize="0.7rem" fontWeight="900" color={sr >= 0.45 ? "#48BB78" : sr <= 0.25 ? "#E53E3E" : "text.secondary"} textAlign="right">{Math.round(sr * 100)}%</Text>
                  <Text fontSize="0.7rem" fontWeight="800" color="text.muted" textAlign="right">{Math.round(oppRate * 100)}%</Text>
                </Fragment>
              );
            }}
          />
        </Box>

        {/* Right Side: Visual Player Spotlight */}
        <Box w="42%" p="6px" minH={0}>
          {activePlayer ? (
            <PlayerSpotlight
              player={{ ...activePlayer, lanes: playerLanes }}
              teamColors={team.colors}
              metrics={spotlightMetrics}
              signatureBar={signatureBar}
              variant="rushing"
              imageUrl={activePlayerImg}
            />
          ) : (
            <Flex align="center" justify="center" h="full">
              <Text fontSize="xs" color="text.muted">Select a rusher to spotlight</Text>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* ── Prominent Opponent Defensive Rushing Impact ── */}
      <DisruptionPanel opponentName={`${opponent?.shortName || "OPP"} DEFENSIVE IMPACT`} metrics={disruptionMetrics} />
    </Flex>
  );
};
