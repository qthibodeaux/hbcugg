import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import teamsData from "../../data/teams.json";

// Player Analytics search row — its own 4x1 PageShell.Slot, sitting below the banner.
//
// Both sides are permanent, always-visible, top-anchored panels filling the full row
// height — NOT dropdowns. No portal, no floating overlay, no click-to-open.
//
// Left: a two-tier component. Top tier is the actual text input. Bottom tier is a
// results list that's a normal in-flow part of the same box, directly beneath the
// input, filling the remaining height — it filters live as you type, it doesn't
// pop out or overlay anything.
//
// Right: a permanent scrollable team list (not a dropdown trigger) — All Teams,
// then a divider, then teams alphabetically, filtered to whichever division is
// currently selected in the banner. Click an item to change which team's players
// are in the pool.
//
// All 1,700+ players are already loaded client-side (usePlayerStatsEnriched,
// staleTime: Infinity) — typing filters an in-memory array, no per-keystroke query.

const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.id] = t;
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const teamInDivision = (team, div) => {
  if (div === "all") return true;
  if (!team) return false;
  if (div === "meac") return team.conference === "MEAC";
  if (div === "swac-west") return team.conference === "SWAC" && team.division === "West";
  if (div === "swac-east") return team.conference === "SWAC" && team.division === "East";
  return true;
};

const PlayerSearchPanel = ({ players, isLoading, division, positionPool, teamFilter, query, setQuery, activePlayer, onSelect, onClear }) => {
  const pool = (players || []).filter((p) => {
    if (positionPool !== "all" && p.position_group !== positionPool) return false;
    if (teamFilter !== "all" && p.team !== teamFilter) return false;
    if (!teamInDivision(TEAM_BY_ID[p.team], division)) return false;
    return true;
  });
  const isSearching = query.trim().length > 0;
  const filtered = isSearching
    ? pool.filter((p) => String(p.name_display || "").toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <Flex direction="column" h="full" minH={0}>
      <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider" mb={1} flexShrink={0}>
        Search Player {isLoading ? "" : `(${pool.length} in pool)`}
      </Text>

      {/* Tier 1 — the input itself */}
      <Flex align="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderTopRadius="md" px={3} flexShrink={0}>
        <Box
          as="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name…"
          flex={1}
          py={2}
          fontSize="sm"
          color="text.primary"
          bg="transparent"
          border="none"
          outline="none"
          _placeholder={{ color: "text.muted" }}
        />
        {activePlayer && (
          <Box as="button" onClick={onClear} p={1} color="text.muted" _hover={{ color: "text.primary" }} cursor="pointer">
            <X size={14} />
          </Box>
        )}
      </Flex>

      {/* Tier 2 — the results list, a normal in-flow part of this same component,
          not an overlay. Only populates once the user starts typing. */}
      <Box flex={1} minH={0} overflowY="auto" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderTop="none" borderBottomRadius="md">
        {!isSearching && (
          <Flex align="center" justify="center" h="full" px={3}>
            <Text fontSize="xs" color="text.muted">Type to search</Text>
          </Flex>
        )}
        {isSearching && (
          <>
          {filtered.length === 0 && (
            <Flex align="center" justify="center" h="full" px={3}>
              <Text fontSize="xs" color="text.muted">No matches</Text>
            </Flex>
          )}
          {filtered.slice(0, 200).map((p) => {
            const isSelected = activePlayer?.player_key === p.player_key;
            const team = TEAM_BY_ID[p.team];
            return (
              <Flex
                key={p.player_key}
                as="button"
                onClick={() => onSelect(p)}
                w="full"
                px={3}
                py={1.5}
                justify="space-between"
                align="center"
                gap={2}
                bg={isSelected ? "whiteAlpha.100" : "transparent"}
                _hover={{ bg: "whiteAlpha.100" }}
                textAlign="left"
              >
                <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"} color="text.primary" lineClamp={1}>
                  {p.name_display}
                </Text>
                <Flex align="center" gap={2} flexShrink={0}>
                  <Text fontSize="xs" color="text.muted" whiteSpace="nowrap">
                    {[p.position_group, p.class_year, p.jersey_number ? `#${p.jersey_number}` : null].filter(Boolean).join(" · ")}
                  </Text>
                  {team?.logo && <Image src={team.logo} alt="" boxSize="18px" objectFit="contain" flexShrink={0} />}
                </Flex>
              </Flex>
            );
          })}
          </>
        )}
      </Box>
    </Flex>
  );
};

const TeamListPanel = ({ division, teamFilter, setTeamFilter }) => {
  const teams = [...teamsData.teams]
    .filter((t) => teamInDivision(t, division))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Flex direction="column" h="full" minH={0}>
      <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider" mb={1} flexShrink={0}>
        Team (search only)
      </Text>
      <Box flex={1} minH={0} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflowY="auto">
        <Box
          as="button"
          onClick={() => setTeamFilter("all")}
          w="full"
          textAlign="left"
          px={3}
          py={1.5}
          bg={teamFilter === "all" ? "whiteAlpha.100" : "transparent"}
          _hover={{ bg: "whiteAlpha.100" }}
        >
          <Text fontSize="sm" fontWeight="bold" color="text.primary">All Teams</Text>
        </Box>
        <Box borderTop="1px solid" borderColor="whiteAlpha.100" />
        {teams.map((t) => {
          const value = t.exportId?.replace(/25$/, "") || t.id;
          const isSelected = teamFilter === value;
          return (
            <Box
              key={t.id}
              as="button"
              onClick={() => setTeamFilter(value)}
              w="full"
              textAlign="left"
              px={3}
              py={1.5}
              bg={isSelected ? "whiteAlpha.100" : "transparent"}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"} color="text.primary">{t.name}</Text>
            </Box>
          );
        })}
      </Box>
    </Flex>
  );
};

const PlayerAnalyticsSearchRow = ({
  players,
  isLoading,
  division,
  positionPool,
  query,
  setQuery,
  teamFilter,
  setTeamFilter,
  activePlayer,
  onSelectPlayer,
  onClearPlayer,
}) => (
  <Box bg="bg.primary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" h="full" w="full" p={4} overflow="hidden">
    <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} templateRows="1fr" gap={4} h="full" minH={0}>
      <PlayerSearchPanel
        players={players}
        isLoading={isLoading}
        division={division}
        positionPool={positionPool}
        teamFilter={teamFilter}
        query={query}
        setQuery={setQuery}
        activePlayer={activePlayer}
        onSelect={onSelectPlayer}
        onClear={onClearPlayer}
      />
      <TeamListPanel division={division} teamFilter={teamFilter} setTeamFilter={setTeamFilter} />
    </Grid>
  </Box>
);

export default PlayerAnalyticsSearchRow;
