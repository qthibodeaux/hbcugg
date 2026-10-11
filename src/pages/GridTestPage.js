import React from "react";
import { Box } from "@chakra-ui/react";
import { Trophy, Zap, Flame, Shield } from "lucide-react";
import { BannerTeamDetail } from "../components/organisms/test/BannerTeamDetail";
import { WeekCentralGameCardA } from "../components/organisms/test/WeekCentralGameCardA";
import { GameCard2x1SplitBanner } from "../components/organisms/test/GameCard2x1_SplitBanner";
import { GameCard2x1StackedOverlay } from "../components/organisms/test/GameCard2x1_StackedOverlay";
import { GameCard2x1HeroStrip } from "../components/organisms/test/GameCard2x1_HeroStrip";
import {
  GameOfWeekSpotlight,
  StoryCard,
  StatCarouselCard,
  TeamPerformanceStrip,
} from "../components/molecules/game/GamesHubCards";

// ─── Mock data (extracted from real schedule/teams data) ─────────────────────
const MOCK_TEAM_DATA = {
  swacjsu25: { shortName: "JSU", exportId: "swacjsu25", colors: { primary: "#002147", secondary: "#FFFFFF" } },
  swacfamu25: { shortName: "FAMU", exportId: "swacfamu25", colors: { primary: "#006747", secondary: "#F4811F" } },
};
const MOCK_SPOTLIGHT_GAME = {
  team_id: "swacjsu25",
  opponent_name: "FAMU Rattlers",
  date: "2025-11-01",
  result: "W",
  score_team: 24,
  score_opp: 21,
  parsed_game_stem: null,
};
const MOCK_STAT_GAMES = [
  { team_id: "swacjsu25", opponent_name: "Alcorn", result: "W", score_team: 38, score_opp: 14, parsed_game_stem: null },
  { team_id: "swacfamu25", opponent_name: "PVAMU", result: "W", score_team: 42, score_opp: 28, parsed_game_stem: null },
  { team_id: "swacpvamu25", opponent_name: "SU", result: "L", score_team: 17, score_opp: 24, parsed_game_stem: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// GRID TEST PAGE
// Visualizes the 4-column grid system at md and lg breakpoints.
// Row unit uses clamp() — scales with viewport, bounded by min/max.
// Minimal gap at md, more breathing room at lg.
// ─────────────────────────────────────────────────────────────────────────────

const ROW_UNIT = "clamp(160px, 18vw, 260px)";
const GAP = { md: "4px", lg: "10px" };



const GridTestPage = () => (<>
  <Box bg="bg.primary" minH="100vh" pt="var(--app-header-height)" pb={10}>
    <Box px={{ md: "4px", lg: "10px" }} pt={{ md: "4px", lg: "10px" }}>

      {/* 4-column grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        gridAutoRows={ROW_UNIT}
        gap={GAP}
      >
        {/* Row 1 — 4x1 banner */}
        <Box gridColumn="span 4" gridRow="span 1" minH={0}>
          <BannerTeamDetail />
        </Box>

        {/* Row 2 — four 1x1s: mimic Game Center Hub main cards */}
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          {/* Celebration Bowl */}
          <WeekCentralGameCardA />
        </Box>
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          {/* SWAC Championship */}
          <GameCard2x1SplitBanner />
        </Box>
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          {/* Week 13 Final */}
          <GameCard2x1StackedOverlay />
        </Box>
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          {/* Misc/Spotlight */}
          <GameCard2x1HeroStrip />
        </Box>

        {/* Rows 3-4, col 1-2: Game of the Week Spotlight 2×2 */}
        <Box gridColumn="span 2" gridRow="span 2" minH={0}>
          <GameOfWeekSpotlight game={MOCK_SPOTLIGHT_GAME} teamData={MOCK_TEAM_DATA} />
        </Box>

        {/* Row 3, cols 3-4: Story cards */}
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          <StoryCard kicker="Spotlight" title="Game of the Year" value="JSU 24, FAMU 21" detail="Classic SWAC instant classic with Celebration Bowl implications." icon={Trophy} />
        </Box>
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          <StoryCard kicker="Standout" title="Best Individual" value="5 TDs" detail="Elite QB night: 5 passing TDs, 312 total yards, 0 INTs." icon={Zap} />
        </Box>

        {/* Row 4, cols 3-4: Story cards */}
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          <StoryCard kicker="Offense" title="Explosion" value="654 Yards" detail="Offensive clinic from start to finish with multiple big-play drives." icon={Flame} />
        </Box>
        <Box gridColumn="span 1" gridRow="span 1" minH={0}>
          <StoryCard kicker="Defense" title="Dominance" value="8 Sacks" detail="Relentless pass rush and three turnovers forced on road campaign." icon={Shield} />
        </Box>

        {/* Row 5: Stat Carousel 2×1 + Team Performance 2×1 */}
        <Box gridColumn="span 2" gridRow="span 1" minH={0}>
          <StatCarouselCard games={MOCK_STAT_GAMES} statType="yardage" />
        </Box>
        <Box gridColumn="span 2" gridRow="span 1" minH={0}>
          <TeamPerformanceStrip games={MOCK_STAT_GAMES} />
        </Box>
      </Box>
    </Box>
  </Box>
</>);

export default GridTestPage;
