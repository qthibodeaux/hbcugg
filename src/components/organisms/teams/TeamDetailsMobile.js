import { Box, Flex, Grid } from "@chakra-ui/react";
import { BannerTeamDetailPage } from "../test/BannerTeamDetail";
import { TeamKPIStrip } from "../../molecules/schools/TeamKPIStrip";
import { TeamRecordBlock, ReviewGameCard, NextGameCard, TeamProductionCard, TeamStatCard } from "../../molecules/schools/TeamStatusBlocks";
import { PlayerSpotlight, CoachingStaffCard } from "../../molecules/schools/TeamDashComponents";

// Existing team-profile mapping/layout extracted without behavior changes.

const PAGE_SHELL_ROW_UNIT = "clamp(160px, 20vw, 260px)";

const rowUnitHeight = (rows = 1) => (rows === 1 ? PAGE_SHELL_ROW_UNIT : `calc(${rows} * ${PAGE_SHELL_ROW_UNIT} + ${(rows - 1) * 0.25}rem)`);

export const TeamDetailsMobile = ({ team, year, setSelectedYear, profileData, coachingStaffForTest }) => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <BannerTeamDetailPage team={team} season={year} setSeason={setSelectedYear} />

    {/* Mobile: no page padding, no gap, no rounded corners — cards run
        edge-to-edge against the viewport and stack flush against each other,
        same as every other converted mobile page. */}
    <Flex direction="column">
      <Box h={rowUnitHeight(1)}>
        <TeamKPIStrip team={team} season={year} stats={profileData.kpiStats} />
      </Box>

      <Box h={rowUnitHeight(1)}>
        <TeamRecordBlock team={team} record={profileData.record} last5={profileData.last5} />
      </Box>

      <Box h={rowUnitHeight(1)}>
        <ReviewGameCard team={team} game={profileData.reviewGame} />
      </Box>

      <Box h={rowUnitHeight(2)}>
        <PlayerSpotlight
          team={team}
          player={profileData.spotlightPlayer}
          gameContext={profileData.gameContext}
          keyStats={profileData.keyStats}
        />
      </Box>

      {/* The four small cards (cols={1} on desktop) pair off into an equal
          50/50 two-column grid on mobile instead of four stacked full-width
          rows — they carry little enough content each that a full row per
          card wasted most of the height. */}
      <Grid templateColumns="repeat(2, minmax(0, 1fr))">
        <Box h={rowUnitHeight(1)}>
          <NextGameCard team={team} game={profileData.nextGame} opponentStat={profileData.nextGameOpponentStat} seasonSummary={profileData.seasonSummary} variant="compact" />
        </Box>

        <Box h={rowUnitHeight(1)}>
          <CoachingStaffCard team={team} coaches={coachingStaffForTest} />
        </Box>

        <Box h={rowUnitHeight(1)}>
          <TeamProductionCard team={team} cards={profileData.teamProduction} variant="compact" />
        </Box>

        <Box h={rowUnitHeight(1)}>
          <TeamStatCard team={team} stat={profileData.teamStat} />
        </Box>
      </Grid>
    </Flex>
  </Box>
);
