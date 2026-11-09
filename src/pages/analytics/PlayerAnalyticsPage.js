import { usePlayerStatsEnriched } from "../../hooks/useSWACData";
import { useSearchParams } from "react-router-dom";
import { TABS, TEAM_BY_ID, DNA_TILES_BY_POSITION, CONCEPTS_BY_POSITION } from "./playerAnalytics/playerAnalyticsConfig";
import { useState, useMemo } from "react";
import PlayerAnalyticsSearchRow, { teamInDivision } from "../../components/organisms/PlayerAnalyticsSearchRow";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import PlayerAnalyticsQbMap from "../../components/organisms/PlayerAnalyticsQbMap";
import PlayerAnalyticsRushing from "../../components/organisms/PlayerAnalyticsRushing";
import { PlayerAvatar, DnaTile } from "./playerAnalytics/PlayerAnalyticsCards";
import PageShell from "../../components/layouts/PageShell";
import PlayerAnalyticsBanner from "../../components/organisms/PlayerAnalyticsBanner";

const PlayerAnalyticsPage = () => {
  const { players, isLoading } = usePlayerStatsEnriched();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = TABS.some((t) => t.id === requestedTab && t.enabled) ? requestedTab : "player";
  const [division, setDivision] = useState("all");
  const [positionPool, setPositionPool] = useState("all");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState(null);

  const activePlayer = useMemo(
    () => (players || []).find((p) => p.player_key === selectedKey) || null,
    [players, selectedKey],
  );

  const activeTeam = activePlayer ? TEAM_BY_ID[activePlayer.team] : null;
  const dnaTiles = activePlayer ? (DNA_TILES_BY_POSITION[activePlayer.position_group] || []) : [];
  const concepts = activePlayer ? (CONCEPTS_BY_POSITION[activePlayer.position_group] || []) : [];

  // "Ranked against" pool — the comparison scope for this player, not a percentile.
  // Defaults to their own position group; follows the Position Pool control if one's set.
  const rankGroup = activePlayer ? (positionPool !== "all" ? positionPool : activePlayer.position_group) : null;
  const rankPoolCount = useMemo(() => {
    if (!activePlayer) return 0;
    return (players || []).filter(
      (p) => p.position_group === rankGroup && teamInDivision(TEAM_BY_ID[p.team], division),
    ).length;
  }, [players, activePlayer, rankGroup, division]);

  const listContent = (
    <Box maxW="1400px" mx="auto" px={{ base: 1, lg: 4 }}>
      {/* Tabs */}
      <Flex gap={1} mb={8} borderBottom="1px solid" borderColor="whiteAlpha.100">
        {TABS.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <Flex
              key={t.id}
              onClick={t.enabled ? () => setSearchParams(t.id === "player" ? {} : { tab: t.id }) : undefined}
              align="center"
              gap={1.5}
              px={4}
              py={2.5}
              position="relative"
              cursor={t.enabled ? "pointer" : "not-allowed"}
              _hover={t.enabled ? { bg: "whiteAlpha.50" } : undefined}
              transition="background 0.15s"
            >
              <Text fontSize="sm" fontWeight={isActive ? "bold" : "medium"} color={isActive ? "brand.500" : "text.muted"} whiteSpace="nowrap">
                {t.label}
              </Text>
              {!t.enabled && <Lock size={11} color="var(--chakra-colors-text-muted)" />}
              {isActive && <Box position="absolute" bottom="-1px" left={0} right={0} h="2px" bg="brand.500" />}
            </Flex>
          );
        })}
      </Flex>

      {activeTab === "qb-map" && <PlayerAnalyticsQbMap division={division} />}
      {activeTab === "rushing" && <PlayerAnalyticsRushing />}

      {/* Body */}
      {activeTab === "player" && !activePlayer && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={8} textAlign="center">
          <Text fontSize="sm" color="text.muted">Search for a player above to see their profile.</Text>
        </Box>
      )}

      {activeTab === "player" && activePlayer && (
        <>
          <Flex align="stretch" mb={6} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">
            <PlayerAvatar key={activePlayer.player_key} player={activePlayer} />

            <Flex flex={1} align="center" gap={4} px={5} py={8} wrap="wrap">
              <Box flex={1} minW="17.5rem">
                <Text fontSize="4xl" fontWeight="black" color="text.primary" lineHeight={1}>{activePlayer.name_display}</Text>
                <Text fontSize="sm" color="text.secondary" mt={2}>
                  {activeTeam?.name || activePlayer.team}
                  {activeTeam?.conference && ` · ${activeTeam.conference}`}
                  {activeTeam?.division && ` · ${activeTeam.division}`}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  {activePlayer.position || activePlayer.position_group}
                  {activePlayer.class_year && ` · ${activePlayer.class_year}`}
                </Text>
              </Box>

              <Flex gap={4} align="stretch">
                <Box textAlign="right">
                  <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">PAR</Text>
                  <Text fontSize="2xl" fontWeight="black" color="brand.400">{activePlayer.par?.toFixed?.(1) ?? activePlayer.par ?? "—"}</Text>
                </Box>

                <Box w="1px" bg="whiteAlpha.100" />

                <Box textAlign="right" minW="6.25rem">
                  <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Ranked Against</Text>
                  <Text fontSize="10px" color="text.muted" mt={1}>{rankPoolCount} players</Text>
                </Box>
              </Flex>
            </Flex>
          </Flex>

          <Flex align="center" gap={2} mb={3}>
            <Text fontSize="sm" fontWeight="bold" color="text.primary" textTransform="uppercase" letterSpacing="wider">
              Player DNA
            </Text>
            <Box px={1.5} py={0.5} borderRadius="sm" bg="whiteAlpha.100">
              <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Mock Data</Text>
            </Box>
          </Flex>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap={3} mb={8}>
            {dnaTiles.map((tile) => (
              <DnaTile key={tile.label} {...tile} />
            ))}
          </Grid>

          <Text fontSize="sm" fontWeight="bold" color="text.primary" textTransform="uppercase" letterSpacing="wider" mb={3}>
            Concepts
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {concepts.map((c) => (
              <Box key={c} px={3} py={1.5} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="full" opacity={0.6} cursor="not-allowed">
                <Text fontSize="xs" color="text.muted">{c}</Text>
              </Box>
            ))}
          </Flex>
        </>
      )}
    </Box>
  );

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <PlayerAnalyticsBanner division={division} setDivision={setDivision} positionPool={positionPool} setPositionPool={setPositionPool} />
      </PageShell.Slot>
      <PageShell.Slot cols={4}>
        <PlayerAnalyticsSearchRow
          players={players}
          isLoading={isLoading}
          division={division}
          positionPool={positionPool}
          query={query}
          setQuery={setQuery}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          activePlayer={activePlayer}
          onSelectPlayer={(p) => { setSelectedKey(p.player_key); setQuery(p.name_display); }}
          onClearPlayer={() => { setSelectedKey(null); setQuery(""); }}
        />
      </PageShell.Slot>
    </PageShell>
  );
};

export default PlayerAnalyticsPage;
