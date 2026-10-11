import { memo, useDeferredValue, useMemo, useState } from "react";
import { getTeamColor } from "../../game/page/utils/teamHelpers";
import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// PLAY-BY-PLAY PANEL — Production Component
// Filterable play-by-play list for the Game Page.
// Props: plays[], drives[], awayId, homeId, teamMeta(), teamShort(), teamLogo()
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtQuarter = (q) => {
  if (!q) return "—";
  const map = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4", 5: "OT" };
  return map[q] ?? `Q${q}`;
};

const fmtClock = (clock) => {
  if (!clock) return "";
  const parts = String(clock).split(":");
  if (parts.length === 2) return `${parts[0]}:${parts[1].padStart(2, "0")}`;
  return clock;
};

// Two lines, not one parenthetical: the down-and-distance reads as a number pair
// and the spot reads as a place, and stacking them lets the column be narrow
// without truncating either half.
const ORD = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
const fmtDownDistance = (down, distance, ylTeam, ylNum, teamShortFn, spotDisplay = null) => {
  if (!down || !distance) return null;
  return {
    dd: `${down} - ${distance}`,
    short: `${ORD[down] ?? down} & ${distance}`,
    spot: spotDisplay ? `at ${spotDisplay}` : ylTeam && ylNum != null ? `at ${teamShortFn(ylTeam)} ${ylNum}` : "",
  };
};

const fmtYards = (yards) => {
  if (yards == null) return null;
  const n = Number(yards);
  if (n > 0) return { text: `+${n}`, color: "#4ADE80" };
  if (n < 0) return { text: `${n}`, color: "#F87171" };
  return { text: "0", color: "#A1A1AA" };
};

const getResultBadge = (play) => {
  const sa = play?.state_after ?? {};
  const adv = play?.play_advanced ?? {};
  const epa = adv?.epa?.epa;

  if (sa.scoring_event) return { label: "TD", color: "#4ADE80", bg: "rgba(74,222,128,0.12)" };
  if (sa.turnover) return { label: "TURNOVER", color: "#F87171", bg: "rgba(248,113,113,0.12)" };
  if (play?.penalties?.length > 0 && play?.no_play) return { label: "PENALTY", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" };
  if (sa.is_first_down) return { label: "1ST DOWN", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" };
  if (epa != null && epa > 1.0) return { label: "BIG PLAY", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" };
  return null;
};

const getPlayCategory = (play) => {
  const raw = play?.base?.raw ?? "";
  const lower = raw.toLowerCase();
  if (lower.includes("pass")) return "pass";
  if (lower.includes("rush") || lower.includes("run")) return "rush";
  if (lower.includes("kickoff")) return "kickoff";
  if (lower.includes("punt")) return "punt";
  if (lower.includes("field goal")) return "fg";
  if (play?.penalties?.length > 0) return "penalty";
  return "other";
};

const categoryColor = {
  pass: "#60A5FA",
  rush: "#34D399",
  kickoff: "#A78BFA",
  punt: "#F472B6",
  fg: "#FBBF24",
  penalty: "#F59E0B",
  other: "#71717A",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children, color = "text.muted" }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const ResultBadge = ({ badge }) => {
  if (!badge) return null;
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={badge.bg} border="1px solid" borderColor={`${badge.color}44`}>
      <Text fontSize="8px" color={badge.color} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
        {badge.label}
      </Text>
    </Box>
  );
};

const TeamChip = ({ teamId, teamShortFn, teamLogoFn, size = "sm" }) => {
  const logo = teamLogoFn(teamId);
  const short = teamShortFn(teamId);
  const dim = size === "sm" ? "16px" : "22px";
  return (
    <Flex align="center" gap={1}>
      <Box w={dim} h={dim} borderRadius="sm" overflow="hidden" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200">
        <Image src={logo} alt={short} w="100%" h="100%" objectFit="contain" />
      </Box>
      <Text fontSize={size === "sm" ? "10px" : "11px"} color="white" fontWeight="black">{short}</Text>
    </Flex>
  );
};

// ─── Wide Toggle Pill ───────────────────────────────────────────────────────────

const TogglePill = ({ label, checked, onChange, accent }) => (
  <Flex
    align="center"
    justify="center"
    gap={1.5}
    px={3}
    py={1.5}
    borderRadius="md"
    bg={checked ? `${accent}22` : "rgba(255,255,255,0.03)"}
    border="1px solid"
    borderColor={checked ? `${accent}88` : "whiteAlpha.100"}
    cursor="pointer"
    onClick={onChange}
    transition="all 0.15s ease"
    _hover={{ bg: checked ? `${accent}28` : "rgba(255,255,255,0.06)" }}
    flex={1}
    minW="60px"
    maxW="120px"
  >
    {checked && (
      <Box w="6px" h="6px" borderRadius="full" bg={accent} flexShrink={0} />
    )}
    <Text fontSize="10px" color={checked ? "white" : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" textAlign="center">
      {label}
    </Text>
  </Flex>
);

// One half of the running scoreboard. The team's own colour carries which side
// is which, so the abbreviation can sit quiet above the number.
const ScoreCell = ({ teamId, score, teamShortFn }) => (
  <Flex direction="column" align="center" justify="center" flex="1" minW={0} bg={getTeamColor(teamId)} px={1} py="2px">
    <Text fontSize="7px" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1} lineClamp={1}>
      {teamShortFn(teamId)}
    </Text>
    <Text fontSize="12px" fontWeight="black" color="white" lineHeight={1.1} fontFamily="mono">
      {score}
    </Text>
  </Flex>
);

// ─── Play Row ─────────────────────────────────────────────────────────────────

const PlayRow = memo(({ play, awayId, homeId, driveInfo, teamShortFn, teamLogoFn }) => {
  const [expanded, setExpanded] = useState(false);
  const b = play?.base ?? {};
  const sa = play?.state_after ?? {};
  const adv = play?.play_advanced ?? {};
  const epa = adv?.epa?.epa;
  const wpPost = adv?.wp?.wp_post;

  const offenseId = b.offense_team;
  const category = getPlayCategory(play);
  const badge = getResultBadge(play);
  const yards = fmtYards(sa.yards_gained);
  const downDistance = fmtDownDistance(b.down, b.distance, b.yl_team, b.yl_num, teamShortFn, b.spot_display);
  // The row reads the backend's sentence; the crew text is only the fallback
  // for files without one (and is shown on expand when there is one).
  const line = b.description ?? b.raw;
  const isBigPlay = epa != null && epa > 1.0;
  const isNegative = epa != null && epa < -0.8;
  const leftBorder = categoryColor[category] ?? "#71717A";

  return (
    <Box>
      <Flex
        align="center"
        gap={{ base: 2, xl: 3 }}
        px={{ base: 2, xl: 3 }}
        py={{ base: "10px", xl: "14px" }}
        borderLeft="3px solid"
        borderColor={leftBorder}
        bg={isBigPlay ? "rgba(167,139,250,0.04)" : isNegative ? "rgba(248,113,113,0.03)" : "transparent"}
        _hover={{ bg: "rgba(255,255,255,0.03)" }}
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
        transition="background 0.15s ease"
      >
        <Box minW="42px" flexShrink={0}>
          <Text fontSize="9px" color="text.muted" fontWeight="black">{fmtQuarter(b.quarter)}</Text>
          <Text fontSize="10px" color="white" fontWeight="black">{fmtClock(b.clock)}</Text>
        </Box>
        {/* D&D — the offense is carried by its own mark behind the down and
            distance rather than by a separate chip column. Two columns became
            one, and whose ball it is now reads at a glance instead of needing
            an abbreviation parsed. */}
        <Box
          position="relative"
          minW="112px"
          h="34px"
          flexShrink={0}
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          overflow="hidden"
        >
          {offenseId && (
            <Box
              as="img"
              src={teamLogoFn(offenseId)}
              alt=""
              position="absolute"
              left="-6px"
              top="50%"
              h="190%"
              transform="translateY(-50%)"
              objectFit="contain"
              opacity={0.22}
              pointerEvents="none"
            />
          )}
          {downDistance && (
            <Box position="relative" minW={0}>
              <Text fontSize="11px" color="white" fontWeight="black" letterSpacing="0.02em" lineHeight={1.15} lineClamp={1}>
                {downDistance.dd}
              </Text>
              {downDistance.spot && (
                <Text fontSize="9px" color="text.muted" fontWeight="black" letterSpacing="0.02em" lineHeight={1.15} lineClamp={1}>
                  {downDistance.spot}
                </Text>
              )}
            </Box>
          )}
        </Box>
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: "12px", xl: "13px" }} color="white" fontWeight="black" lineClamp={{ base: 2, xl: 1 }} lineHeight={1.25}>
            {line}
          </Text>
          {/* Phones hide the down-and-distance column, so it rides under the sentence. */}
          {downDistance && (
            <Text display={{ base: "block", md: "none" }} fontSize="10px" color="text.muted" fontWeight="black" mt="2px" letterSpacing="0.02em">
              {downDistance.short}{downDistance.spot ? ` · ${downDistance.spot}` : ""}
            </Text>
          )}
        </Box>
        <Box flexShrink={0}>
          <ResultBadge badge={badge} />
        </Box>
        {yards && (
          <Box minW="36px" textAlign="right" flexShrink={0}>
            <Text fontSize="11px" color={yards.color} fontWeight="black">{yards.text}</Text>
          </Box>
        )}
        {/* Running score as a two-cell scoreboard, each half in its own team's
            colour, rather than one grey "DSU 0, MSU 0" string. */}
        <Flex minW="96px" flexShrink={0} display={{ base: "none", lg: "flex" }} borderRadius="3px" overflow="hidden">
          <ScoreCell teamId={awayId} score={sa.score_away ?? 0} teamShortFn={teamShortFn} />
          <ScoreCell teamId={homeId} score={sa.score_home ?? 0} teamShortFn={teamShortFn} />
        </Flex>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}>
          {epa != null ? (
            <Text fontSize="11px" color={epa >= 0 ? "#4ADE80" : "#F87171"} fontWeight="black">
              {epa > 0 ? "+" : ""}{epa.toFixed(2)}
            </Text>
          ) : (
            <Text fontSize="11px" color="text.muted" fontWeight="black">—</Text>
          )}
        </Box>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}>
          {wpPost != null ? (
            <Text fontSize="11px" color="whiteAlpha.700" fontWeight="black">
              {(wpPost * 100).toFixed(1)}%
            </Text>
          ) : (
            <Text fontSize="11px" color="text.muted" fontWeight="black">—</Text>
          )}
        </Box>
        <Box flexShrink={0} color="whiteAlpha.400">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Box>
      </Flex>

      {expanded && (
        <Box px={{ base: 3, xl: 4 }} py={3} bg="rgba(0,0,0,0.22)" borderLeft="3px solid" borderColor={leftBorder}>
          {driveInfo && (
            <Box mb={3} p={2} borderRadius="sm" bg="rgba(255,255,255,0.03)" border="1px solid" borderColor="whiteAlpha.100">
              <Flex align="center" gap={2} wrap="wrap">
                <SectionLabel>Drive Context</SectionLabel>
                <Text fontSize="10px" color="white" fontWeight="black">
                  Drive {driveInfo.id} · {teamShortFn(driveInfo.team)} · {driveInfo.plays} plays · {driveInfo.yards} yards · {driveInfo.result}
                </Text>
                {driveInfo.scoring && (
                  <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(74,222,128,0.12)">
                    <Text fontSize="8px" color="#4ADE80" fontWeight="black" textTransform="uppercase">Scoring Drive</Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          {b.description && b.raw && (
            <Box mb={3}>
              <SectionLabel>Official Play Text</SectionLabel>
              <Text fontSize="10px" color="whiteAlpha.700" fontWeight="bold" mt={1} lineHeight={1.4}>{b.raw}</Text>
            </Box>
          )}

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: 3, xl: 4 }}>
            <Flex direction="column" gap={2}>
              <SectionLabel>Play Physics</SectionLabel>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Play Type</Text>
                <Text fontSize="10px" color="white" fontWeight="black" textTransform="capitalize">{category}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Yards Gained</Text>
                <Text fontSize="10px" color={yards?.color ?? "whiteAlpha.700"} fontWeight="black">{yards?.text ?? "—"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Field Position</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {b.yl_team && b.yl_num != null ? `${teamShortFn(b.yl_team)} ${b.yl_num}` : "—"}
                  {play.yl_post_team && play.yl_post_num != null ? ` → ${teamShortFn(play.yl_post_team)} ${play.yl_post_num}` : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Down & Distance</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {b.down ? `${b.down} & ${b.distance}` : "—"}
                  {sa.is_first_down ? " → 1ST DOWN" : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Possession</Text>
                <Text fontSize="10px" color="white" fontWeight="black">{sa.possession_changed ? "CHANGED" : "Retained"}</Text>
              </Flex>
            </Flex>

            <Flex direction="column" gap={2}>
              <SectionLabel>Situational</SectionLabel>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Score (After)</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {teamShortFn(awayId)} {sa.score_away ?? 0} · {teamShortFn(homeId)} {sa.score_home ?? 0}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Win Probability</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {adv?.wp?.wp_pre != null ? `${(adv.wp.wp_pre * 100).toFixed(1)}%` : "—"}
                  {adv?.wp?.wp_post != null ? ` → ${(adv.wp.wp_post * 100).toFixed(1)}%` : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Expected Points</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {adv?.epa?.ep_pre != null ? `${adv.epa.ep_pre.toFixed(2)}` : "—"}
                  {adv?.epa?.ep_post != null ? ` → ${adv.epa.ep_post.toFixed(2)}` : ""}
                  {epa != null ? ` (${epa > 0 ? "+" : ""}${epa.toFixed(2)})` : ""}
                </Text>
              </Flex>
              {sa.turnover && (
                <Flex justify="space-between">
                  <Text fontSize="10px" color="text.muted" fontWeight="black">Turnover</Text>
                  <Text fontSize="10px" color="#F87171" fontWeight="black">{sa.turnover_type ?? "Yes"}</Text>
                </Flex>
              )}
              {play?.penalties?.length > 0 && (
                <Flex justify="space-between">
                  <Text fontSize="10px" color="text.muted" fontWeight="black">Penalty</Text>
                  <Text fontSize="10px" color="#FBBF24" fontWeight="black">
                    {play.penalties.map((p) => p.text ?? "Penalty").join("; ")}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Grid>
        </Box>
      )}
    </Box>
  );
});

PlayRow.displayName = "PlayRow";

// ─── Player Search ────────────────────────────────────────────────────────────
// Owns its own query state so typing re-renders this box and nothing else —
// the panel only hears about a selection. Suggestions come off the deferred
// value, so a fast typist never waits on the list.

const displayName = (name) => {
  const [last, first] = String(name ?? "").split(",").map((x) => x.trim());
  return first ? `${first} ${last}` : last;
};

const PlayerSearch = ({ players, selected, onSelect, onClear, teamShortFn }) => {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const suggestions = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter((p) => p.search.includes(q))
      .slice(0, 8);
  }, [players, deferred]);

  const pick = (player) => {
    onSelect(player);
    setQuery("");
  };

  return (
    <Flex direction="column" gap={1} position="relative">
      <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
        Player
      </Text>
      {selected ? (
        <Flex align="center" justify="space-between" gap={1} px={2} py="3px" borderRadius="md" bg="brand.500" cursor="pointer" onClick={onClear}>
          <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{selected.display}</Text>
          <X size={10} color="white" />
        </Flex>
      ) : (
        <Box
          as="input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) pick(suggestions[0]);
            if (e.key === "Escape") setQuery("");
          }}
          placeholder={players.length ? "Search..." : "No players on file"}
          disabled={players.length === 0}
          w="full"
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="md"
          px={2}
          py="3px"
          fontSize="11px"
          color="white"
          fontWeight="black"
          outline="none"
          _focus={{ borderColor: "brand.500" }}
          _placeholder={{ color: "text.muted" }}
        />
      )}
      {!selected && deferred.trim().length >= 2 && (
        <Flex
          direction="column"
          gap="2px"
          maxH="160px"
          overflow="auto"
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={5}
          mt={1}
          p={1}
          bg="#141416"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          boxShadow="0 12px 30px rgba(0,0,0,0.5)"
        >
          {suggestions.length === 0 ? (
            <Text px={2} py="3px" fontSize="10px" color="text.muted" fontWeight="black">No match</Text>
          ) : suggestions.map((p) => (
            <Flex
              key={p.id}
              align="center"
              justify="space-between"
              gap={2}
              px={2}
              py="3px"
              borderRadius="sm"
              cursor="pointer"
              onClick={() => pick(p)}
              _hover={{ bg: "rgba(255,255,255,0.08)" }}
            >
              <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{p.display}</Text>
              <Text fontSize="9px" color="text.muted" fontWeight="black" flexShrink={0}>
                {p.team ? `${teamShortFn?.(p.team) ?? ""} · ` : ""}{p.playCount}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FILTER_GROUPS = {
  quarter: {
    label: "Quarter",
    options: [
      { key: "q1", label: "Q1" },
      { key: "q2", label: "Q2" },
      { key: "q3", label: "Q3" },
      { key: "q4", label: "Q4" },
    ],
  },
  team: {
    label: "Team",
    options: [
      { key: "away", label: "Away" },
      { key: "home", label: "Home" },
    ],
  },
  // Two kinds of filter share this column. The first three ask what KIND of play
  // it was and read the export's own `play_type`; the last three ask what the
  // play DID and read outcome fields. Both are inclusive-or within the group, so
  // "Rush + Scoring Plays" means either, matching how quarter and team behave.
  // Play Type asks what KIND of play it was, off the export's own `play_type`.
  playType: {
    label: "Play Type",
    options: [
      { key: "rush", label: "Rush" },
      { key: "pass", label: "Pass" },
      { key: "specialTeams", label: "Special Teams" },
      { key: "penalty", label: "Penalty" },
    ],
  },
  // Highlights asks what the play DID, off outcome fields. Kept separate from
  // Play Type because they are different questions: within a group the options
  // are an or, across groups they are an and — so Rush + Scoring Plays now means
  // "rushes that scored", which is what picking both is asking for. As one group
  // it meant "rushes, or anything that scored", which is nearly no filter at all.
  highlights: {
    label: "Highlights",
    options: [
      { key: "bigPlays", label: "Big Plays" },
      { key: "scoringPlays", label: "Scoring Plays" },
      { key: "scoringDrives", label: "Scoring Drives" },
    ],
  },
};

// `play_type` off the export, counted across all 392 exported games. SACK and
// SPIKE are their own types rather than being filed under PASS — 1,736 sacks
// would drop out of a pass filter that only matched "PASS", which is most of a
// game's pressure story. A kneel is a rush by any reading. Penalty is its own
// option (added 2026-09-20): it matches the standalone PENALTY rows and any
// play carrying a `penalties[]` entry, so a flagged rush shows under both
// Rush and Penalty — within the group that's an or, which is what a fan
// asking "show me the flags" wants.
const RUSH_TYPES = new Set(["RUSH", "KNEEL"]);
const PASS_TYPES = new Set(["PASS", "SACK", "SPIKE"]);
const SPECIAL_TEAMS_TYPES = new Set(["KICKOFF", "PUNT", "FIELD_GOAL", "PAT", "RETURN"]);
const isPenaltyPlay = (play, kind) => kind === "PENALTY" || (Array.isArray(play?.penalties) && play.penalties.length > 0);

const FilterBar = ({ filters, onToggle, awayColor, homeColor, players, selectedPlayer, onSelectPlayer, onClearPlayer, teamShortFn }) => {
  const getAccent = (groupKey, optionKey) => {
    if (groupKey === "team" && optionKey === "away") return awayColor;
    if (groupKey === "team" && optionKey === "home") return homeColor;
    return "#E53E3E";
  };

  return (
    <Box p={2} bg="rgba(255,255,255,0.02)" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" }} gap={2}>
        {/* Quarter column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Quarter
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.quarter.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.quarter?.[opt.key]}
                onChange={() => onToggle("quarter", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Team column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Team
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.team.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.team?.[opt.key]}
                onChange={() => onToggle("team", opt.key)}
                accent={getAccent("team", opt.key)}
              />
            ))}
          </Flex>
        </Flex>

        {/* Play Type column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Play Type
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.playType.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.playType?.[opt.key]}
                onChange={() => onToggle("playType", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Highlights column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Highlights
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.highlights.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.highlights?.[opt.key]}
                onChange={() => onToggle("highlights", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Player column */}
        <PlayerSearch players={players} selected={selectedPlayer} onSelect={onSelectPlayer} onClear={onClearPlayer} teamShortFn={teamShortFn} />
      </Grid>
    </Box>
  );
};

// ─── Mobile filters ───────────────────────────────────────────────────────────
// Phones: the four categories side by side in one row, each stacking its options,
// then a Player row.
// Player is no longer a text search — tap it, pick a team, then pick from that
// team's players in this game, ranked by production score or grouped by position.

const MobileChip = ({ label, checked, onChange, accent = "#A855F7", logo = null }) => (
  <Flex
    as="button"
    type="button"
    onClick={onChange}
    align="center"
    justify="center"
    gap="0.3rem"
    w="full"
    minW={0}
    px="0.3rem"
    py="0.4rem"
    borderRadius="md"
    bg={checked ? `${accent}2E` : "rgba(255,255,255,0.04)"}
    border="1px solid"
    borderColor={checked ? accent : "whiteAlpha.100"}
  >
    {logo ? <Image src={logo} alt="" w="0.95rem" h="0.95rem" objectFit="contain" flexShrink={0} /> : null}
    <Text fontSize="0.64rem" fontWeight="black" color={checked ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.03em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
      {label}
    </Text>
  </Flex>
);

const MobileColumn = ({ label, children }) => (
  <Flex direction="column" gap="0.3rem" minW={0}>
    <Text fontSize="0.55rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">{label}</Text>
    {children}
  </Flex>
);

const POSITION_ORDER = ["QB", "RB", "FB", "WR", "TE", "OL", "DL", "DE", "DT", "LB", "DB", "CB", "S", "K", "P", "LS"];
const posRank = (pos) => {
  const i = POSITION_ORDER.indexOf(String(pos ?? "").toUpperCase());
  return i === -1 ? POSITION_ORDER.length : i;
};

const PickerRow = ({ p, onPick }) => (
  <Flex as="button" type="button" onClick={() => onPick(p)} w="full" align="center" gap="0.6rem" px="0.75rem" py="0.55rem" borderBottom="1px solid" borderColor="whiteAlpha.50" textAlign="left">
    <Text w="2.2rem" fontSize="0.62rem" fontWeight="black" color="whiteAlpha.500" flexShrink={0}>{p.position ?? "—"}</Text>
    <Text flex={1} minW={0} fontSize="0.85rem" fontWeight="black" color="white" lineClamp={1}>{p.display}</Text>
    <Text fontSize="0.62rem" fontWeight="900" color="whiteAlpha.400" flexShrink={0}>{p.playCount} plays</Text>
    <Text w="2.6rem" textAlign="right" fontFamily="mono" fontSize="0.8rem" fontWeight="950" color={p.score == null ? "whiteAlpha.300" : "white"} flexShrink={0}>
      {p.score == null ? "—" : p.score.toFixed(1)}
    </Text>
  </Flex>
);

const MobilePlayerPicker = ({ players, selected, onSelect, onClear, awayId, homeId, teamShortFn, teamLogoFn, production }) => {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState(null);
  const [mode, setMode] = useState("score");

  const roster = useMemo(() => {
    if (!team) return [];
    return players
      .filter((p) => p.team === team)
      .map((p) => {
        const prod = production.get(p.id) ?? null;
        return { ...p, position: prod?.position ?? null, score: typeof prod?.total === "number" ? prod.total : null };
      })
      .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || b.playCount - a.playCount);
  }, [players, team, production]);

  const groups = useMemo(() => {
    if (mode !== "position") return [];
    const map = new Map();
    roster.forEach((p) => {
      const k = p.position ? String(p.position).toUpperCase() : "Other";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    });
    return [...map.entries()].sort((a, b) => posRank(a[0]) - posRank(b[0]));
  }, [roster, mode]);

  const pick = (p) => {
    onSelect(p);
    setOpen(false);
  };

  return (
    <Box borderTop="1px solid" borderColor="whiteAlpha.100">
      {selected ? (
        <Flex as="button" type="button" onClick={onClear} w="full" align="center" gap="0.5rem" px="0.75rem" py="0.6rem" bg="rgba(168,85,247,0.18)">
          <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">Player</Text>
          {selected.team && teamLogoFn ? <Image src={teamLogoFn(selected.team)} alt="" w="1rem" h="1rem" objectFit="contain" /> : null}
          <Text flex={1} textAlign="left" fontSize="0.85rem" fontWeight="black" color="white" lineClamp={1}>{selected.display}</Text>
          <X size={14} color="white" />
        </Flex>
      ) : (
        <Flex as="button" type="button" onClick={() => setOpen((v) => !v)} w="full" align="center" gap="0.5rem" px="0.75rem" py="0.6rem" disabled={players.length === 0}>
          <Text fontSize="0.72rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.12em">Player</Text>
          <Text flex={1} textAlign="left" fontSize="0.68rem" fontWeight="900" color="whiteAlpha.500">{players.length ? "Pick a team, then a player" : "No players on file"}</Text>
          <Box transform={open ? "rotate(180deg)" : "none"} transition="transform 0.15s" display="flex"><ChevronDown size={15} color="rgba(255,255,255,0.6)" /></Box>
        </Flex>
      )}

      {open && !selected && (
        <Box borderTop="1px solid" borderColor="whiteAlpha.100">
          <Grid templateColumns="repeat(2, minmax(0, 1fr))">
            {[awayId, homeId].map((id) => {
              const on = id === team;
              return (
                <Flex key={id} as="button" type="button" onClick={() => setTeam(id)} align="center" justify="center" gap="0.45rem" py="0.6rem" bg={on ? "whiteAlpha.100" : "rgba(0,0,0,0.3)"} borderBottom="3px solid" borderColor={on ? getTeamColor(id) : "transparent"}>
                  {teamLogoFn ? <Image src={teamLogoFn(id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" opacity={on ? 1 : 0.5} /> : null}
                  <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.500"} textTransform="uppercase">{teamShortFn?.(id) ?? id}</Text>
                </Flex>
              );
            })}
          </Grid>

          {team && (
            <>
              <Flex px="0.75rem" py="0.5rem" gap="0.4rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <MobileChip label="By Score" checked={mode === "score"} onChange={() => setMode("score")} />
                <MobileChip label="By Position" checked={mode === "position"} onChange={() => setMode("position")} />
              </Flex>
              <Box maxH="45vh" overflowY="auto">
                {roster.length === 0 ? (
                  <Text px="0.75rem" py="0.8rem" fontSize="0.75rem" color="whiteAlpha.500" fontWeight="black">No players on file</Text>
                ) : mode === "score" ? (
                  roster.map((p) => <PickerRow key={p.id} p={p} onPick={pick} />)
                ) : (
                  groups.map(([pos, list]) => (
                    <Box key={pos}>
                      <Text px="0.75rem" py="0.35rem" bg="rgba(255,255,255,0.04)" fontSize="0.62rem" fontWeight="black" color="whiteAlpha.700" letterSpacing="0.14em">{pos}</Text>
                      {list.map((p) => <PickerRow key={p.id} p={p} onPick={pick} />)}
                    </Box>
                  ))
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const MOBILE_LABEL = { specialTeams: "Spec Tms", bigPlays: "Big Plays", scoringPlays: "Scores", scoringDrives: "Scr Drives" };

const MobileFilterBar = ({ filters, onToggle, awayId, homeId, awayColor, homeColor, players, selectedPlayer, onSelectPlayer, onClearPlayer, teamShortFn, teamLogoFn, production }) => {
  const on = (g, k) => !!filters[g]?.[k];
  return (
    <Box bg="rgba(255,255,255,0.02)" borderBottom="1px solid" borderColor="whiteAlpha.100">
      {/* One row of four columns — each category stacks its options */}
      <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="0.35rem" px="0.5rem" py="0.6rem" alignItems="start">
        <MobileColumn label="Quarter">
          {FILTER_GROUPS.quarter.options.map((o) => (
            <MobileChip key={o.key} label={o.label} checked={on("quarter", o.key)} onChange={() => onToggle("quarter", o.key)} />
          ))}
        </MobileColumn>
        <MobileColumn label="Team">
          <MobileChip label={teamShortFn?.(awayId) ?? "Away"} logo={teamLogoFn?.(awayId)} checked={on("team", "away")} onChange={() => onToggle("team", "away")} accent={awayColor} />
          <MobileChip label={teamShortFn?.(homeId) ?? "Home"} logo={teamLogoFn?.(homeId)} checked={on("team", "home")} onChange={() => onToggle("team", "home")} accent={homeColor} />
        </MobileColumn>
        <MobileColumn label="Play Type">
          {FILTER_GROUPS.playType.options.map((o) => (
            <MobileChip key={o.key} label={MOBILE_LABEL[o.key] ?? o.label} checked={on("playType", o.key)} onChange={() => onToggle("playType", o.key)} />
          ))}
        </MobileColumn>
        <MobileColumn label="Highlights">
          {FILTER_GROUPS.highlights.options.map((o) => (
            <MobileChip key={o.key} label={MOBILE_LABEL[o.key] ?? o.label} checked={on("highlights", o.key)} onChange={() => onToggle("highlights", o.key)} />
          ))}
        </MobileColumn>
      </Grid>
      <MobilePlayerPicker
        players={players}
        selected={selectedPlayer}
        onSelect={onSelectPlayer}
        onClear={onClearPlayer}
        awayId={awayId}
        homeId={homeId}
        teamShortFn={teamShortFn}
        teamLogoFn={teamLogoFn}
        production={production}
      />
    </Box>
  );
};

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
