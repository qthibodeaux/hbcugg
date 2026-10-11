import { useRef } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { GameBannerMobile } from "./GameBannerMobile";
import { GameSectionHeader } from "./GameSectionHeader";
import { useJumpSections } from "./useJumpSections";
import { JUMP_MARGIN, Part, SUMMARY_PARTS, SummaryMobile } from "./SummaryMobile";
import { PassingProductionClean } from "../boxscore/PassingProductionClean";
import { RushingProductionClean } from "../boxscore/RushingProductionClean";
import { DefenseProductionClean } from "../boxscore/DefenseProductionClean";
import { SpecialTeamsProductionClean } from "../boxscore/SpecialTeamsProductionClean";
import { DataRoomTab, TEAM_STATS_PARTS } from "../teamstats/DataRoomTab";
import { DriveSummaryMobile } from "../summary/GameSummaryTabV2";
import { PlayByPlayTab } from "../pbp/PlayByPlayTab";

// ─────────────────────────────────────────────────────────────────────────────
// GAME PAGE — MOBILE. Its own tree, not PageShell: the banner (scoreboard,
// five sections, ticker), then the sticky section header, then the active
// section's parts one after another. Tapping the header opens the jump sheet.
// GamePageShell renders this when the layout is mobile; desktop is untouched.
// ─────────────────────────────────────────────────────────────────────────────

const PLAYER_PARTS = [
  { id: "passing", label: "Passing" },
  { id: "rushing", label: "Rushing" },
  { id: "defense", label: "Defense" },
  { id: "special", label: "Special Teams" },
];

// Drives jump by quarter, in the order the game played them.
const driveParts = (driveSummary) => {
  const seen = [];
  (Array.isArray(driveSummary) ? driveSummary : []).forEach((d) => {
    const q = d.is_overtime ? "OT" : `Q${d.quarter_start ?? "—"}`;
    if (!seen.includes(q)) seen.push(q);
  });
  return seen.map((q) => ({ id: `drives-${q}`, label: q === "OT" ? "Overtime" : `Quarter ${q.slice(1)}` }));
};

const partsFor = (tab, game) =>
  tab === "Summary" ? SUMMARY_PARTS : tab === "Player Stats" ? PLAYER_PARTS : tab === "Drives" ? driveParts(game?.drive_summary) : tab === "Team Stats" ? TEAM_STATS_PARTS : [];

export const GamePageMobile = ({
  game,
  isLoading,
  isError,
  activeTab,
  onTabChange,
  awayId,
  homeId,
  awayShort,
  homeShort,
  meta,
  teamBox,
  teamStats,
  advancedTeam,
  teamEntries,
  productionScores,
  drives,
  driveSummary,
  plays,
  playerSeasons,
  priorPlayerSeasons = [],
  leagueAvg = null,
}) => {
  const parts = partsFor(activeTab, game);
  const { current, refs, jump } = useJumpSections(parts.map((p) => p.id));
  const topRef = useRef(null);
  const awayScore = Number(game?.away_team?.score ?? meta?.away_team?.score ?? 0);
  const homeScore = Number(game?.home_team?.score ?? meta?.home_team?.score ?? 0);

  // From the sheet, a new section starts at its top.
  const switchFromSheet = (tab) => {
    onTabChange?.(tab);
    topRef.current?.scrollIntoView({ block: "start" });
  };

  const ready = !isLoading && !isError && game;
  const box = { game, playerSeasons, priorPlayerSeasons, productionScores, awayId, homeId };

  return (
    <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
      {isLoading && (
        <Flex justify="center" py={20}><Spinner color="brand.500" size="xl" /></Flex>
      )}
      {(isError || (!isLoading && !game)) && (
        <Flex justify="center" py={20}><Text color="text.muted">Game data not found.</Text></Flex>
      )}

      {ready && (
        <>
          <GameBannerMobile game={game} activeTab={activeTab} onTabChange={onTabChange} />
          <GameSectionHeader
            activeTab={activeTab}
            onTabChange={switchFromSheet}
            parts={parts}
            current={current}
            onJump={jump}
            awayId={awayId}
            homeId={homeId}
            awayScore={awayScore}
            homeScore={homeScore}
          />
          <Box ref={topRef} style={{ scrollMarginTop: JUMP_MARGIN }} />

          {activeTab === "Summary" && (
            <SummaryMobile
              game={game}
              awayId={awayId}
              homeId={homeId}
              meta={meta}
              teamStats={teamStats || teamBox}
              advancedTeam={advancedTeam}
              teamEntries={teamEntries}
              playerSeasons={playerSeasons}
              priorPlayerSeasons={priorPlayerSeasons}
              leagueAvg={leagueAvg}
              productionScores={productionScores}
              drives={driveSummary}
              plays={plays}
              refs={refs}
            />
          )}

          {activeTab === "Player Stats" && (
            <Box>
              <Part id="passing" refs={refs} tone={0}><PassingProductionClean mobile {...box} /></Part>
              <Part id="rushing" refs={refs} tone={1}><RushingProductionClean mobile {...box} /></Part>
              <Part id="defense" refs={refs} tone={0}><DefenseProductionClean mobile {...box} /></Part>
              <Part id="special" refs={refs} tone={1}><SpecialTeamsProductionClean mobile game={game} playerSeasons={playerSeasons} priorPlayerSeasons={priorPlayerSeasons} awayId={awayId} homeId={homeId} /></Part>
            </Box>
          )}

          {activeTab === "Team Stats" && <DataRoomTab awayId={awayId} homeId={homeId} game={game} refs={refs} />}
          {activeTab === "Drives" && (
            <DriveSummaryMobile
              driveSummary={game?.drive_summary}
              awayId={awayId}
              homeId={homeId}
              wrapGroup={(q, i, node) => <Part id={`drives-${q}`} refs={refs} tone={i % 2}>{node}</Part>}
            />
          )}
          {activeTab === "Play By Play" && (
            <PlayByPlayTab mobile game={game} awayId={awayId} homeId={homeId} awayShort={awayShort} homeShort={homeShort} drives={drives} />
          )}
        </>
      )}
    </Box>
  );
};

export default GamePageMobile;
