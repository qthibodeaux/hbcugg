import { useMemo, useState } from "react";
import { Box, Center, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { useAllCoachRows, usePlayerAnalytics, usePlayerProfileDoc, useTeamHubDoc, useTeamProfile } from "../../hooks/useSWACData";
import { useTeamRecentGames } from "../../hooks/useTeamScheduleData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { TEAM_BY_ID } from "../../utils/teamScheduleModel";
import { toRosterHubTeamId } from "./models/rosterHubModel";
import PageShell from "../../components/layouts/PageShell";
import { BannerTeamDetailPage } from "../../components/organisms/test/BannerTeamDetail";
import { TeamKPIStrip } from "../../components/molecules/schools/TeamKPIStrip";
import {
  CoachingStaffCard,
  PlayerSpotlight,
} from "../../components/molecules/schools/TeamDashComponents";
import {
  NextGameCard,
  ReviewGameCard,
  TeamProductionCard,
  TeamRecordBlock,
  TeamStatCard,
} from "../../components/molecules/schools/TeamStatusBlocks";

const PROFILE_CARD_RADIUS = "lg";

// Mobile doesn't use PageShell — PageShell's grid (autoRows forcing every
// row to a fixed height, even a banner whose real content is shorter) is a
// desktop concept. These cards are still built assuming an explicit h="full"
// from PageShell.Slot though, so mobile reproduces the same row unit here
// (same pattern as Teams.js's TeamsMobile) rather than leaving them heightless.
const PAGE_SHELL_ROW_UNIT = "clamp(160px, 20vw, 260px)";
const rowUnitHeight = (rows = 1) => (rows === 1 ? PAGE_SHELL_ROW_UNIT : `calc(${rows} * ${PAGE_SHELL_ROW_UNIT} + ${(rows - 1) * 0.25}rem)`);

const buildRecordFallback = (team) => ({
  overall: "--",
  conference: `${team?.conference || "Conference"} season record pending`,
  rank: `${team?.conference || "HBCU"}${team?.division ? ` ${team.division}` : ""}`,
});

const isSpringGame = (game) => {
  const haystack = [
    game?.game_id,
    game?.opponent_name,
    game?.opponent_short_name,
    game?.tag,
    game?.game_label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /spring game|spring-game|purple\s*&\s*gold|maroon\s*&\s*gray/.test(haystack);
};

// previous_game/next_game only carry opponent_short_name for the rare
// external (non-app) opponent — for every real 18-team matchup, opponent_id
// resolves against teams.json, which gives a true abbreviation
// (bannerShort/shortName) instead of falling through to the full name. That
// mismatch — team's own side abbreviated, opponent's side spelled out — was
// the actual cause of the lopsided-looking matchup row, not a layout bug.
const externalOpponent = (game) => {
  const known = game?.opponent_id ? TEAM_BY_ID[game.opponent_id] : null;
  if (known) {
    return {
      name: known.name,
      shortName: known.bannerShort || known.shortName || known.name,
      mascot: known.mascot,
      logo: known.logo || game?.opponent_logo,
      colors: known.colors,
      v5Id: known.exportId?.replace(/25$/, "") ?? null,
    };
  }
  return {
    name: game?.opponent_name,
    shortName: game?.opponent_short_name || game?.opponent_name,
    mascot: game?.opponent_mascot,
    logo: game?.opponent_logo,
    colors: { primary: "#2D3748" },
  };
};

const mapRecord = (team, record) => {
  if (!record) return buildRecordFallback(team);
  return {
    ...record,
    rank: record.division_rank,
    display: record.overall,
  };
};

const mapNextGame = (game) => {
  if (!game || game.next_game_available === false || isSpringGame(game)) return null;
  return {
    ...game,
    opponentTeam: externalOpponent(game),
    opponentName: game.opponent_name,
    opponentShort: game.opponent_short_name,
    gameName: game.tag,
  };
};

const mapReviewGame = (game) => {
  if (!game) return null;
  return {
    ...game,
    opponentTeam: externalOpponent(game),
    opponentName: game.opponent_name,
    opponentShort: game.opponent_name,
    headline: game.review_headline || game.game_label,
  };
};

const mapPlayer = (player) => {
  if (!player) return null;
  return {
    name: player.full_name,
    position: player.position,
    classYear: player.class_year,
    par: player.primary_stat?.value ?? player.stat_strip?.[0]?.value,
    gamesPlayed: player.stat_strip?.find((item) => item.label === "Games")?.value,
    image: player.image_url,
    rank: player.rank_label || player.spotlight_label,
  };
};

const normalizeName = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const findCoachImage = (coach, coachRows, teamV5Id) => {
  if (!coach || coach.image_url) return coach?.image_url || null;
  const byId = coachRows.find((row) => row.person_id === coach.coach_id && row.image_url);
  if (byId?.image_url) return byId.image_url;

  const coachName = normalizeName(coach.name);
  const byName = coachRows
    .filter((row) => row._teamId === teamV5Id && normalizeName(row.full_name || row.name) === coachName && row.image_url)
    .sort((a, b) => Number(b.season || 0) - Number(a.season || 0))[0];

  return byName?.image_url || null;
};

const mapCoach = (coach, coachRows, teamV5Id) => {
  if (!coach) return null;
  return {
    name: coach.name,
    title: coach.title,
    image: coach.image_url || findCoachImage(coach, coachRows, teamV5Id),
    record: coach.tenure_year ? `Y${coach.tenure_year}` : "--",
    sub: coach.stock_label || "Head coach",
  };
};

const mapTopStat = (team, topStat) => ({
  label: topStat?.label || "Top Stat",
  value: topStat?.value ?? "--",
  sub: topStat?.sub || "Pipeline stat pending",
  accent: team?.colors?.secondary || "#F56565",
});

// ─── Team Hub §1 document mappers (BACKEND_RESPONSE_SPEC.md §1) ──────────────
// One-team, one-document contract — see reqs/mock/team_hub_pvamu_2025.json.
// Only PVAMU/2025 exists today; every other team/season falls through to the
// mapXxx() functions above, unchanged.

const venueLabel = (venue) => venue?.venue_label ?? venue?.stadium_name ?? null;

const mapHubKpiStats = (header) => ({
  par: header?.avg_par,
  rosterSize: header?.roster_count,
  transfers: header?.transfer_rate != null ? `${header.transfer_rate}%` : undefined,
  transferCount: header?.transfer_count,
  veterans: header?.upperclass_pct != null ? `${Math.round(header.upperclass_pct)}%` : undefined,
});

const mapHubRecord = (conferenceRecord) =>
  conferenceRecord
    ? {
        overall: conferenceRecord.overall_label,
        conference_wins: conferenceRecord.conference_wins,
        conference_losses: conferenceRecord.conference_losses,
        rank: conferenceRecord.division_rank,
        display: conferenceRecord.overall_label,
      }
    : null;

const mapHubLast5 = (last5) =>
  (last5 ?? []).map((g) => ({
    ...g,
    game_id: g.game_path_id,
    opponent_name: g.opponent_short,
    score_opp: g.score_opponent,
  }));

const mapHubReviewGame = (previousGame) => {
  if (!previousGame) return null;
  return {
    ...previousGame,
    opponentTeam: externalOpponent(previousGame),
    opponentName: previousGame.opponent_name,
    opponentShort: previousGame.opponent_name,
    venue: venueLabel(previousGame.venue),
    route: previousGame.game_path_id ? `/game/${previousGame.game_path_id}` : null,
  };
};

const mapHubNextGame = (nextGame) => {
  if (!nextGame || isSpringGame(nextGame)) return null;
  return {
    ...nextGame,
    opponentTeam: externalOpponent(nextGame),
    opponentName: nextGame.opponent_name,
    opponentShort: nextGame.opponent_short_name,
    gameName: nextGame.tag,
    venue: venueLabel(nextGame.venue),
    // Both teams among the 18 → the preview page (Team Profile contract).
    route: nextGame.preview_path_id ? `/game/preview/${nextGame.preview_path_id}` : null,
  };
};

const mapHubSeasonSummary = (seasonSummary) =>
  seasonSummary
    ? {
        record: seasonSummary.record,
        conference_record: seasonSummary.conference_record,
        division_finish: seasonSummary.division_finish,
      }
    : null;

// Color is driven only by metric.is_improvement, never metric.direction —
// a metric can go up and be worse (defensive EPA allowed). See §1's
// coach_carousel contract rule.
const mapHubCoachCarousel = (coachCarousel) =>
  (coachCarousel ?? []).map((coach) => {
    const metric = coach.metric;
    const signed = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(3)}`;
    return {
      name: coach.name,
      role: coach.role,
      image: coach.image_url,
      statValue: metric ? (metric.display ?? signed(metric.value)) : coach.tenure_year ? `Y${coach.tenure_year}` : "--",
      statLabel: metric ? metric.label : "TENURE",
      delta: metric
        ? { direction: metric.is_improvement ? "up" : "down", value: metric.scope }
        : null,
    };
  });

const mapHubUnitCarousel = (unitCarousel) =>
  (unitCarousel?.slides ?? []).map((slide) => ({
    key: slide.unit,
    label: slide.label,
    metrics: (slide.metrics ?? []).map((m) => ({
      key: m.key,
      label: m.label,
      value: m.value,
      display: m.display ?? null,
      conference_rank: m.rank,
      conference_size: m.total,
    })),
  }));

const mapHubTopStat = (team, topStat) =>
  topStat
    ? {
        label: topStat.label,
        value: topStat.display ?? (Number.isInteger(topStat.value) ? topStat.value : Number(topStat.value).toFixed(1)),
        sub: `#${topStat.rank} of ${topStat.total}`,
        accent: team?.colors?.secondary || "#F56565",
      }
    : null;

const mapHubStarImpact = (star, imageUrl) => {
  if (!star) return null;
  const prefix = star.from_game?.home_away === "away" ? "@" : "VS";
  const week = star.from_game?.week != null ? `WEEK ${star.from_game.week} ` : "";
  return {
    player: {
      name: star.full_name,
      position: star.position,
      classYear: star.class_year,
      par: star.par_per_game,
      image: star.image_url ?? imageUrl ?? null,
      rank: null,
      profileUrl: star.profile_url ?? null,
    },
    gameContext: `LAST GAME: ${week}${prefix} ${(star.from_game?.opponent_name ?? "").toUpperCase()}`,
    keyStats: (star.stat_line ?? []).map((s) => ({ label: s.label, value: s.value })),
  };
};

// Mobile — separate render tree, not PageShell (same architecture as
// Teams.js/TeamsMobile). The banner renders at its own natural height
// instead of being forced into PageShell's fixed row unit; the KPI strip and
// every card below it keep the desktop components as-is, just stacked
// full-width with an explicit row-unit height reproduced locally so they
// don't collapse (they're built assuming PageShell.Slot gives them h="full").
const TeamDetailsMobile = ({ team, year, setSelectedYear, profileData, coachingStaffForTest }) => (
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
