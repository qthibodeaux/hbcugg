import { Flex, Text, Box, Spinner } from "@chakra-ui/react";
import { useColorScheme } from "../../../theme/colorScheme";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useRef, useState, useMemo } from "react";
import { useLeaderboardsIndex, useLeaderboardFile } from "../../../hooks/useLeaderboards";
import { useCountingPlayerStats, useCountingTeamStats } from "../../../hooks/useCountingStats";
import { PLAYER_SECTIONS, TEAM_SECTIONS } from "../../../pages/stats/leaderboardSections";
import { ZOOM_BASE } from "./leaderboards/leaderboardPresentation";
import { ExportCardButton } from "./ExportCardButton";
import { EditorialPoster } from "./leaderboards/EditorialPoster";
import { LeaderboardPoster } from "./leaderboards/LeaderboardPoster";

// ── the controls ─────────────────────────────────────────────────────────────

const Chip = ({ on, onClick, children }) => (
  <Flex as="button" type="button" onClick={onClick} px={3.5} h="2.2rem" align="center" borderRadius="md" border="1px solid"
    borderColor={on ? "brand.500" : "line.strong"} bg={on ? "line" : "transparent"} _hover={{ bg: "line" }}>
    <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{children}</Text>
  </Flex>
);

/** `kind` "player" (with `side`) or "team". `season` and `conference` come from the page's banner. */
export const LeaderboardsPanel = ({ kind, side = "offense", season, conference = "all" }) => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const { isMobile } = useLayoutDensity();
  const posterRef = useRef(null);
  const { index } = useLeaderboardsIndex();
  const entry = index?.seasons?.find((s) => s.season === Number(season)) ?? null;
  const weeks = entry?.weeks ?? [];
  const defaultWeek = Number(season) === index?.current?.season ? index.current.week : weeks[weeks.length - 1] ?? null;

  const [mode, setMode] = useState("season");
  const [pickedWeek, setPickedWeek] = useState(null);
  const week = weeks.includes(pickedWeek) ? pickedWeek : defaultWeek;
  const { file, isLoading } = useLeaderboardFile(season, mode === "week" ? week : null, mode === "week" ? week != null : true);
  const counting = useCountingPlayerStats(kind === "player" ? season : null);
  const playersById = useMemo(() => Object.fromEntries((counting.players ?? []).map((p) => [p.person_id, p])), [counting.players]);
  const countingTeams = useCountingTeamStats(kind === "team" ? season : null);
  const teamsById = useMemo(() => Object.fromEntries((countingTeams.teams ?? []).map((t) => [t.team_id, t])), [countingTeams.teams]);

  const allSections = kind === "player" ? PLAYER_SECTIONS[side] ?? [] : TEAM_SECTIONS;
  const sections = allSections.filter((s) => s[mode].length > 0);
  const [sectionId, setSectionId] = useState(null);
  const section = sections.find((s) => s.id === sectionId) ?? sections[0];

  const byConference = conference !== "all";
  const rankOf = (r) => (byConference ? r.conference_rank : r.rank);
  const boards = useMemo(() => {
    if (!file || !section) return [];
    const source = section.pool ? file.pool : kind === "player" ? file.players : file.teams;
    return section[mode]
      .map((id) => (source ?? []).find((b) => b.id === id))
      .filter(Boolean)
      .map((b) => ({ ...b, rows: byConference ? b.rows.filter((r) => String(r.conference).toUpperCase() === conference) : b.rows }));
  }, [file, section, mode, kind, conference, byConference]);

  const tag = mode === "week" ? file?.week_label ?? `Week ${week}` : `${season} Per Game`;
  const zoom = Math.max(0.25, Math.min(0.75, (window.innerWidth - (isMobile ? 16 : 520)) / ZOOM_BASE));
  const filename = () => `${kind}-leaders-${section?.id}-${season}-${mode === "week" ? `week-${week}` : "per-game"}${byConference ? `-${conference.toLowerCase()}` : ""}-${scheme}.png`;
  // A new selection is a fresh poster, so its photos are looked up again.
  const posterKey = `${section?.id}-${mode}-${week}-${conference}-${season}`;
  const posterProps = { pal, kind, section, boards, mode, week: mode === "week" ? week : defaultWeek, tag, season, playersById, teamsById, rankOf, byConference };

  return (
    <Box>
      <Flex align="center" justify="space-between" gap={3} mb={3} wrap="wrap">
        <Flex gap={2} wrap="wrap" align="center">
          <Chip on={mode === "season"} onClick={() => setMode("season")}>Per Game</Chip>
          <Chip on={mode === "week"} onClick={() => setMode("week")}>Week</Chip>
          {mode === "week" && weeks.length > 0 && (
            <Box as="select" aria-label="Week" value={String(week ?? "")} onChange={(e) => setPickedWeek(Number(e.target.value))}
              h="2.2rem" px={2} borderRadius="md" border="1px solid" borderColor="line.strong" bg="bg.secondary" color="text.primary" fontSize="sm" fontWeight="800">
              {weeks.map((w) => <option key={w} value={w} style={{ background: "var(--gg-bg-secondary)" }}>Week {w}</option>)}
            </Box>
          )}
        </Flex>
        {boards.length > 0 && <ExportCardButton target={posterRef} filename={filename} />}
      </Flex>
      <Flex gap={2} wrap="wrap" mb={5}>
        {sections.map((s) => <Chip key={s.id} on={s.id === section?.id} onClick={() => setSectionId(s.id)}>{s.label}</Chip>)}
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={16}><Spinner color="brand.500" size="lg" /></Flex>
      ) : boards.length === 0 ? (
        <Text fontSize="sm" color="text.muted" py={10} textAlign="center">No leaderboards for this selection yet.</Text>
      ) : (
        <>
          <Box w="fit-content" maxW="full" boxShadow="0 1rem 3rem rgba(0,0,0,0.5)" style={{ zoom }}>
            {section.editorial
              ? <EditorialPoster key={posterKey} pal={pal} board={boards[0]} section={section} week={week} tag={tag} season={season} rankOf={rankOf} />
              : <LeaderboardPoster key={posterKey} {...posterProps} />}
          </Box>
          {/* Export source: off screen, full size. */}
          <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
            {section.editorial
              ? <EditorialPoster key={posterKey} pal={pal} board={boards[0]} section={section} week={week} tag={tag} season={season} rankOf={rankOf} innerRef={posterRef} />
              : <LeaderboardPoster key={posterKey} {...posterProps} innerRef={posterRef} />}
          </Box>
        </>
      )}
    </Box>
  );
};

export default LeaderboardsPanel;
