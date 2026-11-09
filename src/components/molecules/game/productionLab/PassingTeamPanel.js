import { Grid, Text, Box, Flex } from "@chakra-ui/react";
import { resolveTeamId, getTeam, normalizeStatsList, getPassingSplits, getPassSectors } from "../../../../utils/gameProductionLabModel";
import { useMemo, useState, Fragment } from "react";
import { usePlayerStatsEnriched } from "../../../../hooks/useSWACData";
import { SmartTable } from "./SmartTable";
import { getLastName } from "./productionNames";
import { PlayerSpotlight } from "./PlayerSpotlight";
import { DisruptionPanel } from "./DisruptionPanel";

// Existing implementation extracted along responsibility boundaries.

const PassingLedgerTable = ({ splits, color }) => {
  const renderRow = (label, data, isBold = false) => {
    const pct = data.att > 0 ? (data.cmp / data.att) * 100 : 0;
    const ypa = data.att > 0 ? data.yds / data.att : 0;
    return (
      <Grid
        templateColumns="1.6fr repeat(6, 1fr)"
        gap={1}
        py="2px"
        px="8px"
        borderBottom={isBold ? "1px solid" : "none"}
        borderColor="whiteAlpha.200"
        bg={isBold ? "rgba(255, 255, 255, 0.03)" : "transparent"}
        alignItems="center"
      >
        <Text fontSize="10.5px" fontWeight="black" color={isBold ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.02em">
          {label}
        </Text>
        <Text fontSize="11.5px" fontWeight={isBold ? "900" : "700"} color="text.primary" textAlign="center">{data.cmp}</Text>
        <Text fontSize="11.5px" fontWeight={isBold ? "900" : "700"} color="text.primary" textAlign="center">{data.att}</Text>
        <Text fontSize="11.5px" fontWeight="950" color={isBold ? color : "text.primary"} textAlign="right">{data.yds}</Text>
        <Text fontSize="11.5px" fontWeight={isBold ? "900" : "700"} color="text.primary" textAlign="right">{pct.toFixed(0)}%</Text>
        <Text fontSize="11.5px" fontWeight={isBold ? "900" : "700"} color={data.int > 0 ? "#E53E3E" : "text.muted"} textAlign="center">{data.int}</Text>
        <Text fontSize="11.5px" fontWeight="950" color="text.primary" textAlign="right">{ypa.toFixed(1)}</Text>
      </Grid>
    );
  };

  return (
    <Box w="full" bg="rgba(0,0,0,0.3)" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden">
      <Grid
        templateColumns="1.6fr repeat(6, 1fr)"
        gap={1}
        py="2px"
        px="8px"
        bg="rgba(255,255,255,0.05)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
        alignItems="center"
      >
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">Passing Downs Split</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="center" textTransform="uppercase" letterSpacing="0.04em">CMP</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="center" textTransform="uppercase" letterSpacing="0.04em">ATT</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="right" textTransform="uppercase" letterSpacing="0.04em">YDS</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="right" textTransform="uppercase" letterSpacing="0.04em">CMP%</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="center" textTransform="uppercase" letterSpacing="0.04em">INT</Text>
        <Text fontSize="9px" fontWeight="955" color="text.secondary" textAlign="right" textTransform="uppercase" letterSpacing="0.04em">YPA</Text>
      </Grid>
      {renderRow("Team Totals", splits.total, true)}
      {renderRow("Standard Downs", splits.standard)}
      {renderRow("Passing Downs", splits.passing)}
    </Box>
  );
};

export const PassingTeamPanel = ({ teamId = "", game }) => {
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

  // Extract passers list
  const passers = useMemo(() => {
    const rawList = normalizeStatsList(stats.passing).filter(p => p.name !== "TEAM");
    return rawList.map(p => ({
      ...p,
      key: `pass-${p.player_key}`,
      position: "QB",
      _isQB: true
    })).sort((a, b) => (b.yards || 0) - (a.yards || 0));
  }, [stats.passing]);

  // Extract receivers list
  const receivers = useMemo(() => {
    const rawList = normalizeStatsList(stats.receiving).filter(p => p.name !== "TEAM");
    return rawList.map(p => ({
      ...p,
      key: `rec-${p.player_key}`,
      position: "WR",
      _isQB: false
    })).sort((a, b) => (b.yards || 0) - (a.yards || 0));
  }, [stats.receiving]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedQB, setSelectedQB] = useState(null);
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
    const initialQB = passers[0] || null;
    setSelectedPlayer(initialQB || receivers[0] || null);
    setSelectedQB(initialQB);
  }

  const handleSelectPlayer = (p) => {
    setSelectedPlayer(p);
    if (p && p._isQB) {
      setSelectedQB(p);
    }
  };

  const activePlayer = selectedPlayer || passers[0] || receivers[0] || null;

  const activePlayerImg = useMemo(() => {
    if (!activePlayer) return null;
    const lookupKey = activePlayer.name.toLowerCase().trim();
    return avatarMap[lookupKey] || null;
  }, [activePlayer, avatarMap]);

  // Derived array calculations for team totals
  const totalComps = passers.reduce((sum, p) => sum + (p.completions || 0), 0);
  const totalAtts = passers.reduce((sum, p) => sum + (p.attempts || 0), 0);
  const totalYards = passers.reduce((sum, p) => sum + (p.yards || 0), 0);
  // eslint-disable-next-line no-unused-vars
  const totalTDs = passers.reduce((sum, p) => sum + (p.touchdowns || 0), 0);
  const totalINTs = passers.reduce((sum, p) => sum + (p.interceptions || 0), 0);
  // eslint-disable-next-line no-unused-vars
  const totalCompPct = totalAtts > 0 ? (totalComps / totalAtts) * 100 : 0;
  // eslint-disable-next-line no-unused-vars
  const totalYpa = totalAtts > 0 ? totalYards / totalAtts : 0;

  const passingSplits = useMemo(() => {
    return getPassingSplits(game, resolvedTeamId, totalComps, totalAtts, totalYards, totalINTs);
  }, [game, resolvedTeamId, totalComps, totalAtts, totalYards, totalINTs]);

  // Passing/Receiving spotlight data adapter
  const spotlightPlayer = useMemo(() => {
    if (!activePlayer) return null;
    const qbForSectors = selectedQB || passers[0];
    return {
      ...activePlayer,
      sectors: qbForSectors ? getPassSectors(qbForSectors, false) : {}
    };
  }, [activePlayer, selectedQB, passers]);

  const isQB = activePlayer?._isQB ?? true;

  // Set up spotlight metrics dynamically based on selected player type (QB vs. WR)
  const spotlightMetrics = isQB ? [
    { label: "COMP", value: activePlayer?.completions || 0 },
    { label: "ATT", value: activePlayer?.attempts || 0 },
    { label: "YDS", value: activePlayer?.yards || 0, color },
    { label: "CMP%", value: activePlayer?.attempts > 0 ? `${Math.round((activePlayer.completions / activePlayer.attempts) * 100)}%` : "0%" },
    { label: "Y/A", value: activePlayer?.attempts > 0 ? (activePlayer.yards / activePlayer.attempts).toFixed(1) : "0.0" },
    { label: "GLORY", value: activePlayer?.attempts > 0 ? Math.min(99, Math.round(55 + (activePlayer.yards / 7) + (activePlayer.touchdowns * 8) - (activePlayer.interceptions * 10))) : "—", color: "#ECC94B" },
  ] : [
    { label: "TGT", value: activePlayer?.targets || 0 },
    { label: "REC", value: activePlayer?.receptions || 0 },
    { label: "YDS", value: activePlayer?.yards || 0, color },
    { label: "SUCC%", value: activePlayer?.targets > 0 ? `${Math.round((activePlayer.receptions / activePlayer.targets) * 100)}%` : "0%" },
    { label: "Y/C", value: activePlayer?.receptions > 0 ? (activePlayer.yards / activePlayer.receptions).toFixed(1) : "0.0" },
    { label: "Y/T", value: activePlayer?.targets > 0 ? (activePlayer.yards / activePlayer.targets).toFixed(1) : "0.0" },
  ];

  const totalDenom = isQB ? (activePlayer?.attempts || 1) : (activePlayer?.targets || 1);
  const signatureBar = [
    { label: "SHORT", value: totalDenom > 0 ? ((spotlightPlayer?.sectors?.short?.attempts || 0) / totalDenom) * 100 : 33.3, color: "#4A90D9" },
    { label: "MED", value: totalDenom > 0 ? ((spotlightPlayer?.sectors?.medium?.attempts || 0) / totalDenom) * 100 : 33.3, color: "#48BB78" },
    { label: "DEEP", value: totalDenom > 0 ? ((spotlightPlayer?.sectors?.deep?.attempts || 0) / totalDenom) * 100 : 33.3, color: "#F6AD55" },
  ];

  // Defensive impact panel metrics
  const advOpp = game?.game_advanced?.team_advanced?.[opponentId] ?? {};
  const defId = advOpp.defensive_identity ?? {};
  const havoc = advOpp.havoc ?? {};

  const disruptionMetrics = [
    { label: "Blitz Rate", value: defId.blitz_rate ?? 0.28, displayValue: `${Math.round((defId.blitz_rate ?? 0.28) * 100)}%`, sub: "heavy rush rate", color: "#F6AD55" },
    { label: "Pressure %", value: defId.pressure_rate ?? 0.32, displayValue: `${Math.round((defId.pressure_rate ?? 0.32) * 100)}%`, sub: "hurries/QB contact", color: "#E53E3E" },
    { label: "Sacks Forced", value: (havoc.sacks || 2) / 10, displayValue: `${havoc.sacks || 2}`, sub: "total sacks", color: "#E53E3E" },
    { label: "Havoc Rate", value: havoc.havoc_rate_forced ?? 0.15, displayValue: `${Math.round((havoc.havoc_rate_forced ?? 0.15) * 100)}%`, sub: "havoc plays forced", color: "#ECC94B" },
    { label: "Contested Catches", value: defId.contested_catch_rate ?? 0.18, displayValue: `${Math.round((defId.contested_catch_rate ?? 0.18) * 100)}%`, sub: "coverage tight wins", color: "#F6AD55" },
    { label: "Passes Defended", value: (havoc.passes_defended || 4) / 10, displayValue: `${havoc.passes_defended || 4}`, sub: "breakups & PDs", color: "#48BB78" },
    { label: "Turnovers Force", value: (havoc.ints || 1) / 10, displayValue: `${havoc.ints || 1} INT`, sub: "interceptions", color: "#4A90D9" },
    { label: "3rd Down Stop", value: defId.third_down_stop_rate ?? 0.65, displayValue: `${Math.round((defId.third_down_stop_rate ?? 0.65) * 100)}%`, sub: "third down efficiency", color: "#48BB78" },
  ];

  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="rgba(0,0,0,0.15)">
      {/* ── Standardized Passing Ledger Header ── */}
      <Flex direction="column" gap="4px" p="5px" bg={team.colors?.primary || "#141416"} flexShrink={0}>
        <Text fontSize="0.688rem" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1}>
          {team.name || "TEAM"} Passing Production
        </Text>
        <PassingLedgerTable splits={passingSplits} color={color} />
      </Flex>

      {/* ── Tables & Spotlight Side-by-Side ── */}
      <Flex flex={1} minH={0} overflow="hidden">
        {/* Left Side: Stacks Passing & Receiving SmartTables */}
        <Flex w="58%" p="6px" borderRight="1px solid" borderColor="whiteAlpha.100" direction="column" gap="8px" minH={0}>
          {/* A: Passing Table */}
          <Flex direction="column" flex={1.1} minH={0} w="full">
            <Flex align="center" gap={1} mb="2px" flexShrink={0}>
              <Box w="3px" h="10px" bg="#E53E3E" borderRadius="sm" />
              <Text fontSize="0.55rem" fontWeight="950" color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">Passing</Text>
            </Flex>
            <SmartTable
              headers={["Player", "Comp", "Att", "Yds", "TD", "INT", "CMP%"]}
              data={passers}
              limit={2}
              activeKey={activePlayer?.key}
              onSelect={handleSelectPlayer}
              accentColor={color}
              renderRow={(p) => {
                const cmpPct = p.attempts > 0 ? (p.completions / p.attempts) * 100 : 0;
                return (
                  <Fragment>
                    <Box minW={0} pl="2px">
                      <Text fontSize="clamp(0.7rem, 0.8vw, 0.8rem)" fontWeight="955" color="text.primary" truncate>
                        {getLastName(p.name)}
                      </Text>
                    </Box>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.completions}</Text>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.attempts}</Text>
                    <Text fontSize="0.7rem" fontWeight="955" color="text.primary" textAlign="right">{p.yards}</Text>
                    <Text fontSize="0.7rem" fontWeight="900" color="#48BB78" textAlign="right">{p.touchdowns || p.tds || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="900" color={p.interceptions > 0 ? "#E53E3E" : "text.muted"} textAlign="right">{p.interceptions || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.muted" textAlign="right">{cmpPct.toFixed(0)}%</Text>
                  </Fragment>
                );
              }}
            />
          </Flex>

          {/* B: Receiving Table */}
          <Flex direction="column" flex={1.8} minH={0} w="full">
            <Flex align="center" gap={1} mb="2px" flexShrink={0}>
              <Box w="3px" h="10px" bg="#4A90D9" borderRadius="sm" />
              <Text fontSize="0.55rem" fontWeight="955" color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">Receiving</Text>
            </Flex>
            <SmartTable
              headers={["Player", "Rec", "Tgt", "Yds", "TD", "YPC", "YPT"]}
              data={receivers}
              limit={4}
              activeKey={activePlayer?.key}
              onSelect={handleSelectPlayer}
              accentColor="#4A90D9"
              renderRow={(p) => {
                const ypc = p.receptions > 0 ? p.yards / p.receptions : 0;
                const ypt = p.targets > 0 ? p.yards / p.targets : 0;
                return (
                  <Fragment>
                    <Box minW={0} pl="2px">
                      <Text fontSize="clamp(0.7rem, 0.8vw, 0.8rem)" fontWeight="955" color="text.primary" truncate>
                        {getLastName(p.name)}
                      </Text>
                    </Box>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.receptions || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.secondary" textAlign="right">{p.targets || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="955" color="text.primary" textAlign="right">{p.yards || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="900" color="#48BB78" textAlign="right">{p.touchdowns || p.tds || 0}</Text>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.muted" textAlign="right">{ypc.toFixed(1)}</Text>
                    <Text fontSize="0.7rem" fontWeight="800" color="text.muted" textAlign="right">{ypt.toFixed(1)}</Text>
                  </Fragment>
                );
              }}
            />
          </Flex>
        </Flex>

        {/* Right Side: Audacious Player Spotlight (QB Throw Map / WR Target Lanes) */}
        <Box w="42%" p="6px" minH={0}>
          {spotlightPlayer ? (
            <PlayerSpotlight
              player={spotlightPlayer}
              teamColors={team.colors}
              metrics={spotlightMetrics}
              signatureBar={signatureBar}
              variant="passing"
              imageUrl={activePlayerImg}
            />
          ) : (
            <Flex align="center" justify="center" h="full">
              <Text fontSize="xs" color="text.muted">Select a passer or receiver</Text>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* ── Prominent Opponent Defensive Pass Disruption Impact ── */}
      <DisruptionPanel opponentName={`${opponent?.shortName || "OPP"} OPPONENT PASS DEFENSE IMPACT`} metrics={disruptionMetrics} />
    </Flex>
  );
};
