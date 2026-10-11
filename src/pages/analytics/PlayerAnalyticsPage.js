import { useMemo, useState } from "react";
import PageShell from "../../components/layouts/PageShell";
import { Box, Text, Flex, Grid, Image } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PlayerAnalyticsQbMap from "../../components/organisms/PlayerAnalyticsQbMap";
import { usePlayerStatsEnriched } from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";
import PlayerAnalyticsBanner from "../../components/organisms/PlayerAnalyticsBanner";
import PlayerAnalyticsSearchRow, { teamInDivision } from "../../components/organisms/PlayerAnalyticsSearchRow";

// Player Analytics Hub — foundation build.
// Full concept, decisions, and open questions: src/pages/analytics/md/Player Analytics Hub Design Doc.md
// Banner migrated to the standard in AgentDesignBible.md §2b — first production banner
// built directly to it, since this page previously had no banner at all.
//
// What's real: player search, identity, PAR/production totals (from usePlayerStatsEnriched).
// What's mock: the "Player DNA" percentile bars. Real percentile-vs-position-pool requires a
// season-wide rollup dataset that doesn't exist yet — see the design doc. Raw numbers shown in
// each tile ARE representative/plausible for the position, but not pulled from a real player-specific
// source yet, hence the "Mock Data" badge.

const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

const TABS = [
  { id: "player", label: "Player", enabled: true },
  { id: "qb-map", label: "QB Map", enabled: true },
  { id: "team", label: "Team", enabled: false },
  { id: "scatter", label: "Scatter", enabled: false },
  { id: "scout", label: "Scout", enabled: false },
  { id: "compare", label: "Compare", enabled: false },
  { id: "glossary", label: "Glossary", enabled: false },
];

// Mock "Player DNA" tile sets — position-specific, per design doc decision.
// Bar fill is a placeholder percentile until the real position-pool dataset exists.
const DNA_TILES_BY_POSITION = {
  QB: [
    { label: "Completion %", value: "62.4%", fill: 58 },
    { label: "Yards / Attempt", value: "8.1", fill: 71 },
    { label: "TD : INT", value: "2.3", fill: 66 },
    { label: "EPA / Play", value: "+0.14", fill: 74 },
    { label: "Success Rate", value: "47%", fill: 63 },
    { label: "Explosive Rate", value: "12%", fill: 55 },
  ],
  RB: [
    { label: "Yards / Carry", value: "4.6", fill: 60 },
    { label: "Yards After Contact", value: "2.8", fill: 68 },
    { label: "Broken Tackle Rate", value: "18%", fill: 72 },
    { label: "Explosive Rate", value: "9%", fill: 50 },
    { label: "Receiving Yards", value: "214", fill: 45 },
    { label: "Ball Security", value: "1 FUM", fill: 80 },
  ],
  WR: [
    { label: "Yards / Route", value: "1.9", fill: 65 },
    { label: "Contested Catch %", value: "54%", fill: 58 },
    { label: "YAC / Reception", value: "5.2", fill: 62 },
    { label: "Target Share", value: "22%", fill: 70 },
    { label: "Explosive Rate", value: "14%", fill: 67 },
    { label: "Drop Rate", value: "4%", fill: 75 },
  ],
  TE: [
    { label: "Yards / Route", value: "1.4", fill: 55 },
    { label: "Contested Catch %", value: "49%", fill: 52 },
    { label: "Red Zone Targets", value: "9", fill: 64 },
    { label: "YAC / Reception", value: "3.9", fill: 48 },
    { label: "Run Block Grade", value: "B", fill: 60 },
    { label: "Drop Rate", value: "6%", fill: 61 },
  ],
  OL: [
    { label: "Pressures Allowed", value: "6", fill: 58 },
    { label: "Sacks Allowed", value: "1", fill: 70 },
    { label: "Penalty Count", value: "3", fill: 55 },
    { label: "Run Block Win Rate", value: "68%", fill: 63 },
  ],
  DL: [
    { label: "Tackles for Loss", value: "8.5", fill: 66 },
    { label: "Sacks", value: "4.0", fill: 71 },
    { label: "QB Hurries", value: "11", fill: 58 },
    { label: "Havoc Rate", value: "13%", fill: 62 },
    { label: "Run Stuff Rate", value: "22%", fill: 60 },
  ],
  LB: [
    { label: "Total Tackles", value: "62", fill: 69 },
    { label: "Tackles for Loss", value: "6.0", fill: 60 },
    { label: "Sacks", value: "2.5", fill: 55 },
    { label: "Passes Defended", value: "3", fill: 50 },
    { label: "Havoc Rate", value: "10%", fill: 57 },
  ],
  DB: [
    { label: "Passes Defended", value: "9", fill: 68 },
    { label: "Interceptions", value: "3", fill: 74 },
    { label: "Total Tackles", value: "41", fill: 55 },
    { label: "Havoc Rate", value: "8%", fill: 52 },
    { label: "Coverage Grade", value: "B+", fill: 65 },
  ],
  ST: [
    { label: "FG %", value: "81%", fill: 70 },
    { label: "Punt Average", value: "42.3", fill: 60 },
    { label: "Touchbacks", value: "12", fill: 65 },
    { label: "Long FG Made", value: "48 yds", fill: 55 },
  ],
};

const CONCEPTS_BY_POSITION = {
  QB: ["Accuracy Profile", "Arm / Deep Ball", "Pocket Poise", "Decision Making", "Mobility", "Red Zone"],
  RB: ["Vision", "Contact Balance", "Explosiveness", "Receiving", "Pass Pro", "Ball Security"],
  WR: ["Separation", "Contested Catch", "YAC Profile", "Route Tree", "Red Zone Usage"],
  TE: ["Separation", "Contested Catch", "YAC Profile", "Blocking", "Red Zone Usage"],
  OL: ["Pass Protection", "Run Blocking", "Discipline"],
  DL: ["Pass Rush", "Run Defense", "Havoc Profile"],
  LB: ["Tackling Efficiency", "Pass Rush", "Coverage", "Havoc Profile"],
  DB: ["Coverage Profile", "Tackling Efficiency", "Ball Skills", "Havoc Profile"],
  ST: ["Field Goal Profile", "Punting Profile", "Kickoff Profile"],
};

// Full-bleed avatar column — same pattern as PlayerAvatar in
// src/components/organisms/test/BannerPlayer.js (borrowed, not rebuilt):
// stretches to the card's full height, touches top/left/bottom with no
// padding, objectFit cover top-center. Falls back to initials on a bad/
// missing image_url — remounted per player via `key` on the caller.
const PlayerAvatar = ({ player }) => {
  const [imgErr, setImgErr] = useState(false);
  const initials = player.name_display?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?";
  const hasImage = player.image_url && !imgErr;

  return (
    <Box position="relative" w={24} alignSelf="stretch" flexShrink={0} overflow="hidden" borderRight="1px solid" borderColor="whiteAlpha.200">
      {hasImage ? (
        <Image
          src={player.image_url}
          alt=""
          w="full"
          h="full"
          objectFit="cover"
          objectPosition="top center"
          onError={() => setImgErr(true)}
        />
      ) : (
        <Flex w="full" h="full" bg="whiteAlpha.100" align="center" justify="center">
          <Text fontSize="lg" fontWeight="black" color="text.muted">{initials}</Text>
        </Flex>
      )}
    </Box>
  );
};

const DnaTile = ({ label, value, fill }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
    <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider" mb={1} lineClamp={1}>
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="black" color="text.primary" mb={1.5}>
      {value}
    </Text>
    <Box h="3px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
      <Box h="full" w={`${fill}%`} bg="brand.500" borderRadius="full" />
    </Box>
  </Box>
);

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
