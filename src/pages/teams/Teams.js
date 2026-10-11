import { Box, Spinner, Flex } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { StandingsBrandWash } from "../../components/molecules/schools/StandingsCard";
import { RankingsPodium } from "../../components/molecules/schools/RankingsCard";
import { SchoolDirectoryFusion as SchoolsDirectory } from "../../components/molecules/schools/SchoolDirectory";
import { BannerSchools } from "../../components/organisms/test/BannerPages";
import {
  RosterFieldReport,
  TeamAnalyticsExplorer,
} from "../../components/molecules/schools/UtilityRows";
import { CoachesHubSchoolsSection } from "../../components/molecules/schools/CoachesHubSchoolsSection";
import { useTeams } from "../../hooks/useTeams";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useSchoolsHub } from "../../hooks/useSchoolsHub";

// These desktop cards all render h="full" and rely on PageShell.Slot's
// explicit row-unit height to resolve it — reproduce that same row unit here
// so they don't collapse when stacked in a plain auto-height column instead.
const PAGE_SHELL_ROW_UNIT = "clamp(160px, 20vw, 260px)";
const rowUnitHeight = (rows = 1) => (rows === 1 ? PAGE_SHELL_ROW_UNIT : `calc(${rows} * ${PAGE_SHELL_ROW_UNIT} + ${(rows - 1) * 0.25}rem)`);

// Mobile — separate render tree, not PageShell (same architecture as every
// other converted page). Only the banner has a mobile design so far; the
// directory / standings / rankings / utility rows below it are the same
// desktop cards, just stacked full-width for now rather than redesigned.
const TeamsMobile = ({ activeTab, swacWest, swacEast, meacStandings, gloryTop6, rankingsLabel }) => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <BannerSchools />
    {activeTab === "rosters" && (
      <Box h={rowUnitHeight(1)}><SchoolsDirectory /></Box>
    )}
    <Flex direction="column" gap="0.75rem" p="0.75rem">
      {activeTab === "rosters" && (<>
        <Box h={rowUnitHeight(2)}><StandingsBrandWash title="SWAC WEST" rows={swacWest} accentColor="yellow.400" /></Box>
        <Box h={rowUnitHeight(2)}><StandingsBrandWash title="SWAC EAST" rows={swacEast} accentColor="red.500" /></Box>
        <Box h={rowUnitHeight(2)}><StandingsBrandWash title="MEAC" rows={meacStandings} accentColor="blue.500" /></Box>
        {gloryTop6.length >= 3 && <Box h={rowUnitHeight(2)}><RankingsPodium rows={gloryTop6} title={rankingsLabel} /></Box>}
        <Box h={rowUnitHeight(1)}><RosterFieldReport /></Box>
        <Box h={rowUnitHeight(1)}><TeamAnalyticsExplorer /></Box>
      </>)}
      {activeTab === "coaches" && <Box h={rowUnitHeight(1)}><CoachesHubSchoolsSection /></Box>}
    </Flex>
  </Box>
);

const TeamsPage = () => {
  const { isLoading } = useTeams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("view") || "rosters";
  const { isMobile } = useLayoutDensity();

  // Standings and rankings are the backend's (Schools Hub file), in its order.
  const { hub } = useSchoolsHub();
  const swacWest = hub?.standings.swacWest ?? [];
  const swacEast = hub?.standings.swacEast ?? [];
  const meacStandings = hub?.standings.meac ?? [];
  const gloryTop6 = hub?.rankings ?? [];
  const rankingsLabel = hub?.rankingsLabel ?? "Team rating";

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full">
            <Spinner size="xl" color="brand.500" thickness="4px" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  if (isMobile) {
    return (
      <TeamsMobile
        activeTab={activeTab}
        swacWest={swacWest}
        swacEast={swacEast}
        meacStandings={meacStandings}
        gloryTop6={gloryTop6}
        rankingsLabel={rankingsLabel}
      />
    );
  }

  return (
    <PageShell>
      {/* Row 1: Standard Magazine Banner — 4x1 */}
      <PageShell.Slot cols={4}>
        <BannerSchools />
      </PageShell.Slot>

      {activeTab === "rosters" && (
        <>
          {/* Row 2: School directory — 4x1 */}
          <PageShell.Slot cols={4}>
            <SchoolsDirectory />
          </PageShell.Slot>

          {/* Row 3: Standings — 2x2 + 2x2 */}
          <PageShell.Slot cols={2} rows={2}>
            <StandingsBrandWash title="SWAC WEST" rows={swacWest} accentColor="yellow.400" />
          </PageShell.Slot>
          <PageShell.Slot cols={2} rows={2}>
            <StandingsBrandWash title="SWAC EAST" rows={swacEast} accentColor="red.500" />
          </PageShell.Slot>

          {/* Row 5: Standings + Rankings — 2x2 + 2x2 */}
          <PageShell.Slot cols={2} rows={2}>
            <StandingsBrandWash title="MEAC" rows={meacStandings} accentColor="blue.500" />
          </PageShell.Slot>
          <PageShell.Slot cols={2} rows={2}>
            {gloryTop6.length >= 3 ? <RankingsPodium rows={gloryTop6} title={rankingsLabel} /> : null}
          </PageShell.Slot>

          {/* Row 7: Utility row — 2x1 + 2x1 */}
          <PageShell.Slot cols={2}>
            <RosterFieldReport />
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <TeamAnalyticsExplorer />
          </PageShell.Slot>
        </>
      )}

      {activeTab === "coaches" && (
        <PageShell.Slot cols={4}>
          <CoachesHubSchoolsSection />
        </PageShell.Slot>
      )}
    </PageShell>
  );
};

export default TeamsPage;
