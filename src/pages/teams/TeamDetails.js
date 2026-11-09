import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useState, useMemo } from "react";
import { useTeamProfile, useAllCoachRows, usePlayerAnalytics, useTeamHubDoc, usePlayerProfileDoc } from "../../hooks/useSWACData";
import { useTeamRecentGames } from "../../hooks/useTeamScheduleData";
import { toRosterHubTeamId } from "./models/rosterHubModel";
import { mapHubStarImpact, mapHubRecord, mapHubLast5, mapHubNextGame, mapHubSeasonSummary, mapHubReviewGame, mapHubCoachCarousel, mapHubTopStat, mapHubUnitCarousel, mapHubKpiStats, mapNextGame, mapRecord, mapReviewGame, mapPlayer, mapCoach, mapTopStat } from "./models/teamProfileAdapters";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { TeamDetailsMobile } from "../../components/organisms/teams/TeamDetailsMobile";
import PageShell from "../../components/layouts/PageShell";
import { BannerTeamDetailPage } from "../../components/organisms/test/BannerTeamDetail";
import { TeamKPIStrip } from "../../components/molecules/schools/TeamKPIStrip";
import { TeamRecordBlock, ReviewGameCard, NextGameCard, TeamProductionCard, TeamStatCard } from "../../components/molecules/schools/TeamStatusBlocks";
import { PlayerSpotlight, CoachingStaffCard } from "../../components/molecules/schools/TeamDashComponents";

const PROFILE_CARD_RADIUS = "lg";

const TeamDetails = () => {
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeam(teamId);
  const { currentSeason, isLoading: contextLoading } = useFootballCurrentContext();
  const { isMobile } = useLayoutDensity();
  const [selectedYear, setSelectedYear] = useState(null);
  const year = selectedYear ?? currentSeason;
  const teamV5Id = team?.exportId?.replace(/25$/, "");
  const { profile } = useTeamProfile(team?.exportId, year);
  const { coaches: coachRows } = useAllCoachRows();
  const { recentGames } = useTeamRecentGames(team?.exportId, year);
  // player_analytics_2025.json is not year-parameterized (2025 only) — same
  // caveat as TeamKPIStrip. Only offer an opponent stat when it's real for
  // the season actually being viewed; otherwise the next-game card just
  // shows generic info (date/venue/tag) instead of a mislabeled number.
  const { teamAnalytics } = usePlayerAnalytics();
  // BACKEND_RESPONSE_SPEC.md §1 — one-team, one-document. Only PVAMU/2025
  // exists today; every other team/season 404s and `hubDoc` is null, which
  // falls through to the old team-profile mapping below unchanged.
  const rosterTeamId = toRosterHubTeamId(team?.exportId);
  const { doc: hubDoc, isLoading: hubDocLoading } = useTeamHubDoc(year, rosterTeamId);
  // star_impact carries no image_url (known gap, see BACKEND_RESPONSE_SPEC.md
  // §1) — person_id is the stated join key, so pull the photo from that
  // player's own profile document rather than leave the card on its
  // team-logo fallback.
  const { doc: starPlayerDoc } = usePlayerProfileDoc(year, hubDoc?.star_impact?.person_id);

  const profileData = useMemo(() => {
    if (hubDoc) {
      const star = mapHubStarImpact(hubDoc.star_impact, starPlayerDoc?.identity?.image_url);
      return {
        record: mapHubRecord(hubDoc.conference_record),
        last5: mapHubLast5(hubDoc.conference_record?.last_5),
        nextGame: mapHubNextGame(hubDoc.next_game),
        nextGameOpponentStat: null,
        seasonSummary: mapHubSeasonSummary(hubDoc.season_summary),
        reviewGame: mapHubReviewGame(hubDoc.previous_game),
        spotlightPlayer: star?.player ?? null,
        gameContext: star?.gameContext,
        keyStats: star?.keyStats ?? [],
        coachCarousel: mapHubCoachCarousel(hubDoc.coach_carousel),
        teamStat: mapHubTopStat(team, hubDoc.top_stat),
        teamProduction: mapHubUnitCarousel(hubDoc.unit_carousel),
        kpiStats: mapHubKpiStats(hubDoc.header),
      };
    }

    const nextGame = mapNextGame(profile?.next_game);
    const opponentV5Id = nextGame?.opponentTeam?.v5Id;
    const opponentPar = Number(year) === 2025 ? teamAnalytics?.[opponentV5Id]?.avg_par : null;

    return {
      record: mapRecord(team, profile?.record),
      last5: recentGames,
      nextGame,
      nextGameOpponentStat: opponentV5Id && Number.isFinite(opponentPar)
        ? { label: "Avg PAR", value: opponentPar.toFixed(1) }
        : null,
      seasonSummary: null,
      reviewGame: mapReviewGame(profile?.previous_game),
      spotlightPlayer: mapPlayer(profile?.player_spotlight),
      gameContext: "LAST GAME: WEEK 4 @ SOUTHERN",
      keyStats: [
        { label: "OVR PAR", value: "+4.2" },
        { label: "PASS YDS", value: "245" },
        { label: "COMP %", value: "68%" },
      ],
      headCoach: mapCoach(profile?.head_coach, coachRows, teamV5Id),
      coachCarousel: null,
      teamStat: mapTopStat(team, profile?.why_cards?.top_stat),
      teamProduction: profile?.why_cards?.team_production?.cards || [],
      kpiStats: null,
    };
  }, [coachRows, hubDoc, profile, recentGames, starPlayerDoc, team, teamV5Id, teamAnalytics, year]);

  const coachingStaffForTest = useMemo(
    () =>
      profileData.coachCarousel ?? [
        {
          name: profileData.headCoach?.name || "Coach Feed Pending",
          role: profileData.headCoach?.title || "Head Coach",
          statValue: profileData.headCoach?.record || "Y1",
          statLabel: "TENURE",
          image: profileData.headCoach?.image || null,
        },
        // Coordinators come only from the team-hub doc's coach_carousel — no
        // stand-in names or numbers here.
      ],
    [profileData.coachCarousel, profileData.headCoach]
  );

  if (isLoading || contextLoading || hubDocLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Text color="text.primary" fontWeight="black" letterSpacing="widest">
            TEAM NOT FOUND
          </Text>
        </Center>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <TeamDetailsMobile
        team={team}
        year={year}
        setSelectedYear={setSelectedYear}
        profileData={profileData}
        coachingStaffForTest={coachingStaffForTest}
      />
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <BannerTeamDetailPage team={team} season={year} setSeason={setSelectedYear} />
      </PageShell.Slot>

      <PageShell.Slot cols={4}>
        <TeamKPIStrip team={team} season={year} stats={profileData.kpiStats} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} radius={PROFILE_CARD_RADIUS}>
        <TeamRecordBlock team={team} record={profileData.record} last5={profileData.last5} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} radius={PROFILE_CARD_RADIUS}>
        <ReviewGameCard team={team} game={profileData.reviewGame} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2} radius={PROFILE_CARD_RADIUS}>
        <PlayerSpotlight
          team={team}
          player={profileData.spotlightPlayer}
          gameContext={profileData.gameContext}
          keyStats={profileData.keyStats}
        />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <NextGameCard team={team} game={profileData.nextGame} opponentStat={profileData.nextGameOpponentStat} seasonSummary={profileData.seasonSummary} variant="compact" />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <CoachingStaffCard team={team} coaches={coachingStaffForTest} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <TeamProductionCard team={team} cards={profileData.teamProduction} variant="compact" />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <TeamStatCard team={team} stat={profileData.teamStat} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default TeamDetails;
