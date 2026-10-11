import { useState, useMemo } from "react";
import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import teamsData from "../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════════════════════
// PLAY-BY-PLAY FILTERABLE — Variant C
// Wide toggle-pill filter bar + player search + collapsible rows with drive context.
// ═══════════════════════════════════════════════════════════════════════════════

const TEAM_BY_ID = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  acc[t.exportId] = t;
  return acc;
}, {});

const teamMeta = (id) => TEAM_BY_ID[id] ?? null;
const teamShort = (id) => teamMeta(id)?.shortName ?? id?.toUpperCase() ?? "TBD";
const teamLogo = (id) => teamMeta(id)?.logo ?? (id ? `/assets/${id.replace(/25$/, "")}.svg` : null);

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

const fmtDownDistance = (down, distance, ylTeam, ylNum) => {
  if (!down || !distance) return "";
  const dn = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" }[down] ?? `${down}th`;
  const yl = ylTeam && ylNum != null ? ` at ${teamShort(ylTeam)} ${ylNum}` : "";
  return `(${dn} & ${distance}${yl})`;
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PLAYS = [
  { base: { quarter: 1, clock: "15:00", down: null, distance: null, yl_team: null, yl_num: null, offense_team: "swacjsu", defense_team: "swacpvamu", raw: "Alfaro,Diego kickoff 49 yards to the JKST16. Terrell Jr.,Travis return 17 yards to the JKST33.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 17, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: null }, wp: { wp_post: 0.5313 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 33 },
  { base: { quarter: 1, clock: "14:54", down: 1, distance: 10, yl_team: "swacjsu", yl_num: 33, offense_team: "swacjsu", defense_team: "swacpvamu", raw: "Miller,Ahmad rush left for 1 yard gain to the JKST34 (Ward,Trinity), out of bounds", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 1, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.706 }, wp: { wp_post: 0.5161 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 34 },
  { base: { quarter: 1, clock: "14:54", down: 2, distance: 9, yl_team: "swacjsu", yl_num: 34, offense_team: "swacjsu", defense_team: "swacpvamu", raw: "Morgan,JaCobian pass incomplete deep left to Gardner Jr.,Jameel thrown to PVAM20.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 0, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.798 }, wp: { wp_post: 0.4962 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 34 },
  { base: { quarter: 1, clock: "14:54", down: 3, distance: 9, yl_team: "swacjsu", yl_num: 34, offense_team: "swacjsu", defense_team: "swacpvamu", raw: "Morgan,JaCobian rush left for 1 yard loss to the JKST33 (Mason,Molik; Amao,Kamren).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: -1, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -1.309 }, wp: { wp_post: 0.4713 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 33 },
  { base: { quarter: 1, clock: "14:54", down: 4, distance: 10, yl_team: "swacjsu", yl_num: 33, offense_team: null, defense_team: null, raw: "Collins,Kye punt 43 yards to the PVAM24 fair catch by Dennis,Andre at PVAM24.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: null, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: null }, wp: { wp_post: null } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 24 },
  { base: { quarter: 1, clock: "13:32", down: 1, distance: 10, yl_team: "swacpvamu", yl_num: 24, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Bingmon,Chase rush middle for 1 yard gain to the PVAM25 (Pulliam,Reid; Sallis,Kam).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 1, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.667 }, wp: { wp_post: 0.5062 } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 25 },
  { base: { quarter: 1, clock: "13:32", down: 2, distance: 9, yl_team: "swacpvamu", yl_num: 25, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass complete short right to Rockwell,Jyzaiah caught at PVAM33 for 9 yards gain to the PVAM34 (Hawthorne,Kameron).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 9, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: true }, play_advanced: { epa: { epa: 0.947 }, wp: { wp_post: 0.5241 } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 34 },
  { base: { quarter: 1, clock: "12:48", down: 1, distance: 10, yl_team: "swacpvamu", yl_num: 34, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron rush middle for 3 yards gain to the PVAM37 (Pulliam,Reid).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 3, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.412 }, wp: { wp_post: 0.5123 } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 37 },
  { base: { quarter: 1, clock: "12:48", down: 2, distance: 7, yl_team: "swacpvamu", yl_num: 37, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass incomplete short left to Dennis,Andre thrown to PVAM39.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 0, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.623 }, wp: { wp_post: 0.4951 } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 37 },
  { base: { quarter: 1, clock: "12:48", down: 3, distance: 7, yl_team: "swacpvamu", yl_num: 37, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron rush middle for 19 yards gain to the PVAM46 (Sallis,Kam; Hawthorne,Kameron).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 19, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: true }, play_advanced: { epa: { epa: 3.742 }, wp: { wp_post: 0.5891 } }, penalties: [], yl_post_team: "swacpvamu", yl_post_num: 46 },
  { base: { quarter: 1, clock: "11:52", down: 1, distance: 10, yl_team: "swacpvamu", yl_num: 46, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass complete deep right to Rockwell,Jyzaiah caught at JSU49 for 10 yards gain to the JSU49 (Hawthorne,Kameron), 1ST DOWN.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 10, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: true }, play_advanced: { epa: { epa: 2.182 }, wp: { wp_post: 0.6314 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 49 },
  { base: { quarter: 1, clock: "11:52", down: 1, distance: 10, yl_team: "swacjsu", yl_num: 49, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron rush left for 2 yards gain to the JKST47 (Pulliam,Reid).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 2, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.301 }, wp: { wp_post: 0.6218 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 47 },
  { base: { quarter: 1, clock: "11:52", down: 2, distance: 8, yl_team: "swacjsu", yl_num: 47, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass complete short middle to Dennis,Andre caught at JSU41 for 8 yards gain to the JKST41 (Hawthorne,Kameron), 1ST DOWN.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 8, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: true }, play_advanced: { epa: { epa: 1.103 }, wp: { wp_post: 0.6542 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 41 },
  { base: { quarter: 1, clock: "10:48", down: 1, distance: 10, yl_team: "swacjsu", yl_num: 41, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass complete deep right to Bonner,Cameron caught at JSU26 for 15 yards gain to the JKST26 (Hawthorne,Kameron; Sallis,Kam), 1ST DOWN.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 15, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: true }, play_advanced: { epa: { epa: 1.445 }, wp: { wp_post: 0.6912 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 26 },
  { base: { quarter: 1, clock: "10:48", down: 1, distance: 10, yl_team: "swacjsu", yl_num: 26, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron pass incomplete short left to Rockwell,Jyzaiah thrown to JKST20.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 0, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: -0.512 }, wp: { wp_post: 0.6734 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 26 },
  { base: { quarter: 1, clock: "10:48", down: 2, distance: 10, yl_team: "swacjsu", yl_num: 26, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron rush middle for 7 yards gain to the JKST19 (Pulliam,Reid).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 7, score_away: 0, score_home: 0, scoring_event: false, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: 0.234 }, wp: { wp_post: 0.6845 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 19 },
  { base: { quarter: 1, clock: "10:48", down: 3, distance: 3, yl_team: "swacjsu", yl_num: 19, offense_team: "swacpvamu", defense_team: "swacjsu", raw: "Peters,Cameron rush middle for 7 yards gain to the JKST00 TOUCHDOWN.", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: 7, score_away: 7, score_home: 0, scoring_event: true, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: 1.166 }, wp: { wp_post: 0.7123 } }, penalties: [], yl_post_team: "swacjsu", yl_post_num: 0 },
  { base: { quarter: 1, clock: "10:48", down: null, distance: null, yl_team: null, yl_num: null, offense_team: null, defense_team: null, raw: "Alfaro,Diego kick attempt good (H: Webb,Aiden, LS: Stewart,Benjamin).", is_play: true, line_type: "PLAY" }, state_after: { yards_gained: null, score_away: 7, score_home: 0, scoring_event: true, turnover: false, is_first_down: false }, play_advanced: { epa: { epa: null }, wp: { wp_post: null } }, penalties: [], yl_post_team: null, yl_post_num: null },
];

const MOCK_DRIVES = [
  { id: 1, team: "swacjsu", startQuarter: 1, startClock: "15:00", endQuarter: 1, endClock: "14:54", plays: 4, yards: 0, result: "Punt", scoring: false },
  { id: 2, team: "swacpvamu", startQuarter: 1, startClock: "13:32", endQuarter: 1, endClock: "10:48", plays: 11, yards: 76, result: "TD", scoring: true },
];

// Players extracted from the full game file
const ALL_PLAYERS = [
  "Alfaro,Diego", "Amao,Kamren", "Bingmon,Chase", "Bonner,Cameron", "Byrd,Shadrick",
  "Collins,Kye", "Dennis,Andre", "Enechukwu,Anthony", "Gardner Jr.,Jameel", "Hawkins,Shamar",
  "Ivory,Quincy", "Jackson,Jayven", "John,Ethan", "Jones,Travon", "Mason,Molik",
  "Miller,Ahmad", "Morgan,JaCobian", "Naylor,Simon", "Ojo,Rodny", "Parker,Kennedy",
  "Paul,Kobe", "Peters,Cameron", "Pulliam,Reid", "Randle,Travor", "Rembert,Nate",
  "Roberts,Sterling", "Rockwell,Jyzaiah", "Sallis,Kam", "Savage,Shemar", "Terrell Jr.,Travis",
  "Ward,Trinity", "Wells,Tymon", "Williams,Jeremiah", "Zachery,Eric",
];

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

const TeamChip = ({ teamId, size = "sm" }) => {
  const logo = teamLogo(teamId);
  const short = teamShort(teamId);
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

// ─── Play Row ─────────────────────────────────────────────────────────────────

const PlayRow = ({ play, awayId, homeId, driveInfo }) => {
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
        <Box minW="52px" flexShrink={0} display={{ base: "none", sm: "block" }}>
          <TeamChip teamId={offenseId} size="sm" />
        </Box>
        <Box minW="110px" flexShrink={0} display={{ base: "none", md: "block" }}>
          <Text fontSize="9px" color="text.muted" fontWeight="black">
            {fmtDownDistance(b.down, b.distance, b.yl_team, b.yl_num)}
          </Text>
        </Box>
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: "11px", xl: "13px" }} color="white" fontWeight="black" lineClamp={1}>
            {b.raw}
          </Text>
        </Box>
        <Box flexShrink={0}>
          <ResultBadge badge={badge} />
        </Box>
        {yards && (
          <Box minW="36px" textAlign="right" flexShrink={0}>
            <Text fontSize="11px" color={yards.color} fontWeight="black">{yards.text}</Text>
          </Box>
        )}
        <Box minW="70px" textAlign="right" flexShrink={0} display={{ base: "none", lg: "block" }}>
          <Text fontSize="9px" color="text.muted" fontWeight="black">
            {teamShort(awayId)} {sa.score_away ?? 0}, {teamShort(homeId)} {sa.score_home ?? 0}
          </Text>
        </Box>
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
                  Drive {driveInfo.id} · {teamShort(driveInfo.team)} · {driveInfo.plays} plays · {driveInfo.yards} yards · {driveInfo.result}
                </Text>
                {driveInfo.scoring && (
                  <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(74,222,128,0.12)">
                    <Text fontSize="8px" color="#4ADE80" fontWeight="black" textTransform="uppercase">Scoring Drive</Text>
                  </Box>
                )}
              </Flex>
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
                  {b.yl_team && b.yl_num != null ? `${teamShort(b.yl_team)} ${b.yl_num}` : "—"}
                  {play.yl_post_team && play.yl_post_num != null ? ` → ${teamShort(play.yl_post_team)} ${play.yl_post_num}` : ""}
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
                  {teamShort(awayId)} {sa.score_away ?? 0} · {teamShort(homeId)} {sa.score_home ?? 0}
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
      { key: "pvamu", label: "PVAMU" },
      { key: "jsu", label: "JSU" },
    ],
  },
  playType: {
    label: "Play Type",
    options: [
      { key: "bigPlays", label: "Big Plays" },
      { key: "scoringPlays", label: "Scoring Plays" },
      { key: "scoringDrives", label: "Scoring Drives" },
    ],
  },
};

const FilterBar = ({ filters, onToggle, awayColor, homeColor, playerSearch, onPlayerSearch, selectedPlayer, onClearPlayer }) => {
  const getAccent = (groupKey, optionKey) => {
    if (groupKey === "team" && optionKey === "pvamu") return awayColor;
    if (groupKey === "team" && optionKey === "jsu") return homeColor;
    return "#E53E3E";
  };

  return (
    <Box p={2} bg="rgba(255,255,255,0.02)" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, minmax(0, 1fr))" }} gap={2}>
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

        {/* Player column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Player
          </Text>
          <Box
            as="input"
            type="text"
            value={playerSearch}
            onChange={(e) => onPlayerSearch(e.target.value)}
            placeholder="Search..."
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
          {selectedPlayer && (
            <Flex align="center" gap={1} px={2} py="3px" borderRadius="md" bg="brand.500" cursor="pointer" onClick={onClearPlayer}>
              <Text fontSize="10px" color="white" fontWeight="black">{selectedPlayer}</Text>
              <X size={10} color="white" />
            </Flex>
          )}
          {playerSearch.length >= 2 && !selectedPlayer && (
            <Flex direction="column" gap="2px" maxH="100px" overflow="auto">
              {ALL_PLAYERS.filter((p) => p.toLowerCase().includes(playerSearch.toLowerCase())).slice(0, 6).map((p) => (
                <Box
                  key={p}
                  px={2}
                  py="3px"
                  borderRadius="sm"
                  bg="rgba(255,255,255,0.04)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  cursor="pointer"
                  onClick={() => onPlayerSearch(p)}
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                >
                  <Text fontSize="10px" color="white" fontWeight="black">{p}</Text>
                </Box>
              ))}
            </Flex>
          )}
        </Flex>
      </Grid>
    </Box>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const PlayByPlayFilterableC = () => {
  const awayId = "swacpvamu";
  const homeId = "swacjsu";
  const awayColor = teamMeta(awayId)?.colors?.primary ?? "#4B0082";
  const homeColor = teamMeta(homeId)?.colors?.primary ?? "#002147";

  const [filters, setFilters] = useState({});
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const toggleFilter = (group, key) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!next[group]) next[group] = {};
      next[group] = { ...next[group], [key]: !next[group][key] };
      return next;
    });
  };

  const handlePlayerSearch = (value) => {
    setPlayerSearch(value);
    // If the value exactly matches a player, select it
    const exact = ALL_PLAYERS.find((p) => p.toLowerCase() === value.toLowerCase());
    if (exact) {
      setSelectedPlayer(exact);
      setPlayerSearch("");
    }
  };

  const clearPlayer = () => {
    setSelectedPlayer(null);
    setPlayerSearch("");
  };

  const driveMap = useMemo(() => {
    const map = {};
    let currentDrive = null;
    MOCK_PLAYS.forEach((play, i) => {
      const sa = play.state_after;
      const isDriveEnd = sa.scoring_event || sa.turnover || play.base.raw.toLowerCase().includes("punt") || play.base.raw.toLowerCase().includes("field goal");
      if (currentDrive && (isDriveEnd || i === MOCK_PLAYS.length - 1)) {
        map[i] = currentDrive;
        currentDrive = null;
      }
      if (play.base.raw.toLowerCase().includes("kickoff") || (isDriveEnd && i < MOCK_PLAYS.length - 1)) {
        currentDrive = MOCK_DRIVES.find((d) => d.team === play.base.offense_team) ?? null;
      }
    });
    return map;
  }, []);

  const filteredPlays = useMemo(() => {
    const qFilters = filters.quarter ?? {};
    const tFilters = filters.team ?? {};
    const pFilters = filters.playType ?? {};

    const hasQuarter = Object.values(qFilters).some(Boolean);
    const hasTeam = Object.values(tFilters).some(Boolean);
    const hasPlayType = Object.values(pFilters).some(Boolean);
    const hasPlayer = !!selectedPlayer;

    return MOCK_PLAYS.filter((play, i) => {
      const b = play.base;
      const sa = play.state_after;
      const adv = play.play_advanced ?? {};
      const epa = adv?.epa?.epa;
      const raw = b.raw ?? "";

      if (hasQuarter) {
        const qKey = `q${b.quarter}`;
        if (!qFilters[qKey]) return false;
      }

      if (hasTeam) {
        const offShort = teamShort(b.offense_team).toLowerCase();
        const teamMatch = (tFilters.pvamu && offShort === "pvamu") || (tFilters.jsu && offShort === "jsu");
        if (!teamMatch) return false;
      }

      if (hasPlayType) {
        let typeMatch = false;
        if (pFilters.bigPlays && epa != null && epa > 1.0) typeMatch = true;
        if (pFilters.scoringPlays && sa.scoring_event) typeMatch = true;
        if (pFilters.scoringDrives && driveMap[i]?.scoring) typeMatch = true;
        if (!typeMatch) return false;
      }

      if (hasPlayer) {
        if (!raw.includes(selectedPlayer)) return false;
      }

      return true;
    });
  }, [filters, driveMap, selectedPlayer]);

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
      <FilterBar
        filters={filters}
        onToggle={toggleFilter}
        awayColor={awayColor}
        homeColor={homeColor}
        playerSearch={playerSearch}
        onPlayerSearch={handlePlayerSearch}
        selectedPlayer={selectedPlayer}
        onClearPlayer={clearPlayer}
      />

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
        <Box minW="52px" flexShrink={0} display={{ base: "none", sm: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Off</Text></Box>
        <Box minW="110px" flexShrink={0} display={{ base: "none", md: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Situation</Text></Box>
        <Box flex={1} minW={0}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Play</Text></Box>
        <Box minW="36px" textAlign="right" flexShrink={0}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Yds</Text></Box>
        <Box minW="70px" textAlign="right" flexShrink={0} display={{ base: "none", lg: "block" }}><Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Score</Text></Box>
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
          filteredPlays.map((play, i) => (
            <Box key={i} borderBottom="1px solid" borderColor="whiteAlpha.050">
              <PlayRow play={play} awayId={awayId} homeId={homeId} driveInfo={driveMap[i]} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};
