import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import ContentContainer from "../../components/layouts/ContentContainer";
import TeamAnalyticsBanner from "../../components/organisms/TeamAnalyticsBanner";
import { useTeamAnalyticsHub, useWeekReview, useGamesIndex } from "../../hooks/useSWACData";
import {
  BoardTab, MapTab, MatchupTab, RatingLabTab, TrendsTab, GlossaryTab,
} from "../../components/organisms/stats/TeamAnalyticsTabs";
import WeekReviewTab from "../../components/organisms/stats/WeekReviewTab";
import { TeamAnalyticsTabBar, TeamAnalyticsTileStrip } from "../../components/organisms/stats/TeamAnalyticsTileStrip";
import { ProfileTab } from "../../components/organisms/stats/TeamProfileTab";
import { TeamProfilePicker } from "../../components/organisms/stats/TeamProfilePicker";
import { TEAM_ANALYTICS_TAB_IDS, DEFAULT_TEAM_ANALYTICS_TAB } from "./teamAnalyticsTabs";
import { LEAGUE_ID } from "../../components/organisms/stats/MatchupPicker";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM ANALYTICS HUB
//
// Tabs are analytical LENSES; the unit taxonomy (Run Game / Pass Game / Run
// Defense / Pass Defense, + four units with no data yet) is the CONTENT
// structure inside Profile. See TeamAnalyticsTabs.js for why that split.
//
// Structure matches PlayerAnalyticsPage exactly — banner in a 4-wide slot,
// everything else in listContent — so the two analytics pages are the same
// page with different content. Season and team scope live in the banner
// control strip (AgentDesignBible §2b), which is what retired the 18-chip
// team picker that used to head the Profile and Trends tabs.
//
// Tabs live in the URL (`?tab=`) and, since 2026-09-20, the sidebar lists them
// as sub-items of TEAM ANALYTICS with the picked team nested under Profile —
// see useRouteSideNav. Tab and team are both URL state so the sidebar (a pure
// function of the URL) and the page always agree.
//
// Profile lands with NO team: the picker slot under the tiles is the
// directory, and the profile only renders once a team is chosen. Trends is
// the other team-scoped tab and falls back to a default so it is never blank.
// ─────────────────────────────────────────────────────────────────────────────

// Week leads the strip and is the landing tab. A weekly view is the one people
// come back to; a season-summary view is one people read once. The tab list
// (order, labels) is shared from ./teamAnalyticsTabs.
const DEFAULT_TAB = DEFAULT_TEAM_ANALYTICS_TAB;
const FALLBACK_TEAM = "swacpvamu";

// Which tabs read the season control. The banner's only control is season;
// it dims rather than hides on tabs that span every season. Week is absent
// on purpose: it is the Week tab's own control, not the page's.
const IGNORES_SEASON = new Set(["week", "trends", "glossary"]);

// Matchup default: two at random from the 18 plus the league average —
// drawn fresh on load and every time the Matchup tab is opened.
const drawPair = (teams) => {
  const pool = [...Object.keys(teams ?? {}), LEAGUE_ID];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { a: pool[0] ?? null, b: pool[1] ?? null };
};

const TeamAnalyticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useLayoutDensity();
  const hub = useTeamAnalyticsHub();
  // The current season's week review (backend, weekly).
  const review = useWeekReview();
  // Head-to-head history for the Matchup tab — real parsed games, 2019-2026.
  const gamesIndex = useGamesIndex();

  const tab = TEAM_ANALYTICS_TAB_IDS.includes(searchParams.get("tab")) ? searchParams.get("tab") : DEFAULT_TAB;
  // `team` is only honoured when the hub actually has it; a stale or mistyped
  // id reads as "no team" rather than crashing the profile.
  const teamParam = searchParams.get("team");
  const teamId = teamParam && hub.teams?.[teamParam] ? teamParam : null;
  const scopedTeamId = teamId ?? FALLBACK_TEAM;
  const setTeamId = (next) => setSearchParams(next ? { tab, team: next } : { tab });
  const selectTab = (id) => {
    if (id === "matchup") setPicks(drawPair(hub.teams));
    setSearchParams(teamId ? { tab: id, team: teamId } : { tab: id });
  };
  // Opens on the backend's current season; the banner can pick any other.
  const [pickedSeason, setSeason] = useState(null);
  const season = pickedSeason ?? hub.currentSeason ?? 2025;
  const firstPair = useMemo(() => drawPair(hub.teams), [hub.teams]);
  const [picks, setPicks] = useState(null);
  const teamA = (picks ?? firstPair).a;
  const teamB = (picks ?? firstPair).b;
  // Functional updates: the picker's swap sets both slots back to back.
  const setTeamA = (v) => setPicks((p) => ({ ...(p ?? firstPair), a: v }));
  const setTeamB = (v) => setPicks((p) => ({ ...(p ?? firstPair), b: v }));

  if (hub.isLoading) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>
      </Box>
    );
  }

  if (!hub.teams) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <ContentContainer py={10}>
          <Text fontSize="sm" color="text.muted">
            Team analytics data is not available yet.
          </Text>
        </ContentContainer>
      </Box>
    );
  }

  const body = (
    <Flex direction="column" gap={isMobile ? 0 : 5}>
      {tab === "week" && (
        review.isLoading
          ? <Flex justify="center" py={16}><Spinner color="brand.500" size="lg" /></Flex>
          : <WeekReviewTab review={review} />
      )}
      {tab === "profile" && (
        teamId
          ? <ProfileTab hub={hub} season={season} teamId={teamId} />
          : (
            <Text fontSize="sm" color="whiteAlpha.500" fontStyle="italic" py={6} textAlign="center">
              Pick a team above to open their profile.
            </Text>
          )
      )}
      {tab === "board" && <BoardTab hub={hub} season={season} />}
      {tab === "map" && <MapTab hub={hub} season={season} />}
      {tab === "matchup" && (
        <MatchupTab hub={hub} season={season} teamA={teamA} setTeamA={setTeamA} teamB={teamB} setTeamB={setTeamB} games={gamesIndex.games} />
      )}
      {tab === "lab" && <RatingLabTab hub={hub} season={season} games={gamesIndex.games} />}
      {tab === "trends" && <TrendsTab hub={hub} teamId={scopedTeamId} season={season} games={gamesIndex.games} />}
      {tab === "glossary" && <GlossaryTab hub={hub} season={season} />}
    </Flex>
  );

  const banner = (
    <TeamAnalyticsBanner
      logo={tab === "week" ? null : hub.teams[scopedTeamId]?.identity?.logo}
      season={season}
      setSeason={setSeason}
      seasons={hub.seasons}
      seasonDisabled={IGNORES_SEASON.has(tab)}
    />
  );
  const tileProps = { tab, onSelect: selectTab, hub, review, season, teamId: scopedTeamId, teamA, teamB };

  // Mobile: its own stack, not PageShell — banner, the tab bar (the active
  // tab's live face; tap for the sheet of all eight), the profile picker on
  // Profile, then the tab. Everything flush: no page padding, no gaps.
  if (isMobile) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        {banner}
        <Box h="4.5rem"><TeamAnalyticsTabBar {...tileProps} /></Box>
        {tab === "profile" && <TeamProfilePicker hub={hub} season={season} teamId={teamId} onChange={setTeamId} mobile />}
        <Box pb="2.5rem">{body}</Box>
      </Box>
    );
  }

  return (
    <PageShell listContent={body}>
      <PageShell.Slot cols={4}>{banner}</PageShell.Slot>

      {/* Tab row as a 4x1 of live tiles — each tile is the tab button and a
          preview of that tab, off the same data the tab reads. */}
      <PageShell.Slot cols={4}>
        <TeamAnalyticsTileStrip {...tileProps} />
      </PageShell.Slot>

      {/* Profile's directory — the schedule-page picker, catered: pills to
          pick, a headline card once picked, and the profile itself renders
          below in listContent. Lands empty on purpose. */}
      {tab === "profile" && (
        <PageShell.Slot cols={4}>
          <TeamProfilePicker hub={hub} season={season} teamId={teamId} onChange={setTeamId} />
        </PageShell.Slot>
      )}
    </PageShell>
  );
};

export default TeamAnalyticsPage;
