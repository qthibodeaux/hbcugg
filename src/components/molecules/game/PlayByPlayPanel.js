import { getTeamColor } from "../../game/page/utils/teamHelpers";
import { useState, useMemo } from "react";
import { displayName, RUSH_TYPES, PASS_TYPES, SPECIAL_TEAMS_TYPES, isPenaltyPlay } from "../../../utils/playByPlayModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { MobileFilterBar } from "./playByPlay/MobileFilters";
import { FilterBar } from "./playByPlay/DesktopFilters";
import { PlayRow } from "./playByPlay/PlayRow";

// ─── Main Export ──────────────────────────────────────────────────────────────

export const PlayByPlayPanel = ({
  plays = [],
  drives = [],
  awayId,
  homeId,
  teamShortFn,
  teamLogoFn,
  // Phones: the one-row chips + team → player picker (MobileFilterBar).
  mobile = false,
  productionScores = null,
}) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);

  const [filters, setFilters] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const toggleFilter = (group, key) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!next[group]) next[group] = {};
      next[group] = { ...next[group], [key]: !next[group][key] };
      return next;
    });
  };

  const clearPlayer = () => setSelectedPlayer(null);

  // Build drive map: play index -> drive info
  const driveMap = useMemo(() => {
    const map = {};
    if (!drives.length) return map;

    let currentDrive = null;
    plays.forEach((play, i) => {
      const sa = play.state_after ?? {};
      const raw = String(play.base?.raw ?? "").toLowerCase();
      const isDriveEnd = sa.scoring_event || sa.turnover || raw.includes("punt") || raw.includes("field goal");

      if (currentDrive && (isDriveEnd || i === plays.length - 1)) {
        map[i] = currentDrive;
        currentDrive = null;
      }

      const isDriveStart = raw.includes("kickoff") || (isDriveEnd && i < plays.length - 1);
      if (isDriveStart) {
        const nextOffense = plays[i + 1]?.base?.offense_team;
        currentDrive = drives.find((d) => d.team === nextOffense) ?? null;
      }
    });
    return map;
  }, [plays, drives]);

  // Player index. The export carries `players[]` ({ player_id, name, role,
  // team }) on nearly every row, so the search matches on ids and the filter
  // is exact. Rows without it fall back to the names scraped from raw text
  // (older files) — those match by substring. Either way each entry carries
  // a lowercase `search` key in both "Last,First" and "First Last" forms.
  const playerIndex = useMemo(() => {
    const byId = new Map();
    const add = (id, name, team) => {
      let entry = byId.get(id);
      if (!entry) {
        const display = displayName(name);
        entry = { id, name, display, team: team ?? null, playCount: 0, search: `${String(name).toLowerCase()} ${display.toLowerCase()}` };
        byId.set(id, entry);
      }
      entry.playCount += 1;
      if (!entry.team && team) entry.team = team;
    };
    plays.forEach((play) => {
      const structured = Array.isArray(play.players) ? play.players : [];
      if (structured.length) {
        const seen = new Set();
        structured.forEach((pl) => {
          const id = pl.player_id ?? `name:${pl.name}`;
          if (!pl.name || seen.has(id)) return;
          seen.add(id);
          add(id, pl.name, pl.team);
        });
        return;
      }
      const raw = play.base?.raw ?? "";
      const re = /([A-Z][a-zA-Z\s.]+?),([A-Z][a-zA-Z\s.]+?)(?=\s+(?:rush|pass|kickoff|punt|return|fumbled|recovered|intercepted|sacked|thrown|catch|for\s+no\s+yard|for\s+[0-9]+\s+yard|attempt|kick\s+attempt|kick\s+[0-9]))/g;
      const tackleRe = /\(([A-Z][a-zA-Z\s.]+?),([A-Z][a-zA-Z\s.]+?)(?:;|$)/g;
      const seen = new Set();
      [re, tackleRe].forEach((rx) => {
        let m;
        while ((m = rx.exec(raw)) !== null) {
          const clean = `${m[1].trim()},${m[2].trim()}`;
          if (clean.length > 3 && !clean.includes("Shotgun ") && !seen.has(clean)) {
            seen.add(clean);
            add(`name:${clean}`, clean, play.base?.offense_team ?? null);
          }
        }
      });
    });
    return [...byId.values()].sort((a, b) => b.playCount - a.playCount || a.display.localeCompare(b.display));
  }, [plays]);

  // Production by player id, for the mobile picker's ranking and positions.
  const production = useMemo(() => {
    const map = new Map();
    Object.values(productionScores ?? {}).forEach((rows) => {
      (Array.isArray(rows) ? rows : Object.entries(rows ?? {}).map(([k, r]) => ({ player_key: k, ...r }))).forEach((r) => {
        if (!r?.player_key) return;
        map.set(r.player_key, { total: r.production_total ?? r.production_score?.total ?? null, position: r.position ?? r.position_assumed ?? null });
      });
    });
    return map;
  }, [productionScores]);

  const playHasPlayer = (play, player) => {
    if (!player) return true;
    const structured = Array.isArray(play.players) ? play.players : null;
    if (structured?.length) return structured.some((pl) => (pl.player_id ?? `name:${pl.name}`) === player.id);
    return String(play.base?.raw ?? "").includes(player.name);
  };

  const filteredPlays = useMemo(() => {
    const qFilters = filters.quarter ?? {};
    const tFilters = filters.team ?? {};
    const pFilters = filters.playType ?? {};
    const hFilters = filters.highlights ?? {};

    const hasQuarter = Object.values(qFilters).some(Boolean);
    const hasTeam = Object.values(tFilters).some(Boolean);
    const hasPlayType = Object.values(pFilters).some(Boolean);
    const hasHighlights = Object.values(hFilters).some(Boolean);
    const hasPlayer = !!selectedPlayer;

    const kept = [];
    plays.forEach((play, i) => {
      const b = play.base ?? {};
      const sa = play.state_after ?? {};
      const adv = play.play_advanced ?? {};
      const epa = adv?.epa?.epa;

      if (hasQuarter) {
        const qKey = `q${b.quarter}`;
        if (!qFilters[qKey]) return;
      }

      if (hasTeam) {
        const off = b.offense_team;
        const isAway = off === awayId;
        const isHome = off === homeId;
        const teamMatch = (tFilters.away && isAway) || (tFilters.home && isHome);
        if (!teamMatch) return;
      }

      if (hasPlayType) {
        const kind = String(play.play_type ?? "").toUpperCase();
        let typeMatch = false;
        if (pFilters.rush && RUSH_TYPES.has(kind)) typeMatch = true;
        if (pFilters.pass && PASS_TYPES.has(kind)) typeMatch = true;
        if (pFilters.specialTeams && SPECIAL_TEAMS_TYPES.has(kind)) typeMatch = true;
        if (pFilters.penalty && isPenaltyPlay(play, kind)) typeMatch = true;
        if (!typeMatch) return;
      }

      if (hasHighlights) {
        let hitMatch = false;
        if (hFilters.bigPlays && epa != null && epa > 1.0) hitMatch = true;
        if (hFilters.scoringPlays && sa.scoring_event) hitMatch = true;
        if (hFilters.scoringDrives && driveMap[i]?.scoring) hitMatch = true;
        if (!hitMatch) return;
      }

      if (hasPlayer && !playHasPlayer(play, selectedPlayer)) return;

      kept.push({ play, index: i });
    });
    return kept;
  }, [plays, filters, driveMap, selectedPlayer, awayId, homeId]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach((group) => {
      Object.values(group).forEach((v) => { if (v) count++; });
    });
    if (selectedPlayer) count++;
    return count;
  }, [filters, selectedPlayer]);

  return (
    <Box w="full" h="full" bg="bg.primary" overflow="auto" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" display="flex" flexDirection="column">
      {mobile ? (
        <MobileFilterBar
          filters={filters}
          onToggle={toggleFilter}
          awayId={awayId}
          homeId={homeId}
          awayColor={awayColor}
          homeColor={homeColor}
          players={playerIndex}
          selectedPlayer={selectedPlayer}
          onSelectPlayer={setSelectedPlayer}
          onClearPlayer={clearPlayer}
          teamShortFn={teamShortFn}
          teamLogoFn={teamLogoFn}
          production={production}
        />
      ) : (
        <FilterBar
          filters={filters}
          onToggle={toggleFilter}
          awayColor={awayColor}
          homeColor={homeColor}
          players={playerIndex}
          selectedPlayer={selectedPlayer}
          onSelectPlayer={setSelectedPlayer}
          onClearPlayer={clearPlayer}
          teamShortFn={teamShortFn}
        />
      )}

      {activeFilterCount > 0 && (
        <Flex px={3} py={1} bg="rgba(229,62,62,0.08)" borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" gap={2}>
          <Text fontSize="9px" color="brand.400" fontWeight="black">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</Text>
          <Text fontSize="9px" color="text.muted" fontWeight="black">· {filteredPlays.length} play{filteredPlays.length !== 1 ? "s" : ""}</Text>
        </Flex>
      )}

      <Flex
        align="center"
        gap={{ base: 2, xl: 3 }}
        px={{ base: 2, xl: 3 }}
        py={2}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="rgba(255,255,255,0.02)"
        flexShrink={0}
      >
        <Box minW="42px" flexShrink={0}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Time</Text></Box>
        <Box minW="112px" flexShrink={0} display={{ base: "none", md: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">D&amp;D</Text></Box>
        <Box flex={1} minW={0}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Play</Text></Box>
        <Box minW="36px" textAlign="right" flexShrink={0}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Yds</Text></Box>
        <Box minW="96px" flexShrink={0} display={{ base: "none", lg: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Score</Text></Box>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">EPA</Text></Box>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">WP%</Text></Box>
        <Box w="14px" flexShrink={0} />
      </Flex>

      <Box flex={1} overflow="auto">
        {filteredPlays.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={12} gap={3}>
            <Text fontSize="sm" color="text.muted" fontWeight="black">No plays match your filters</Text>
            <Text fontSize="10px" color="whiteAlpha.500" fontWeight="black">Try removing some filters</Text>
          </Flex>
        ) : (
          filteredPlays.map(({ play, index }) => (
            <Box key={play.play_id ?? play.sequence ?? index} borderBottom="1px solid" borderColor="whiteAlpha.050">
              <PlayRow
                play={play}
                awayId={awayId}
                homeId={homeId}
                driveInfo={driveMap[index]}
                teamShortFn={teamShortFn}
                teamLogoFn={teamLogoFn}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};
