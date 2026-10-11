import { useMemo } from "react";
import PageShell from "../../layouts/PageShell";
import {
  CoachingStaffCard,
  PlayerSpotlight,
} from "../../molecules/schools/TeamDashComponents";
import {
  NextGameCard,
  ReviewGameCard,
  TeamRecordBlock,
  TeamStatCard,
} from "../../molecules/schools/TeamStatusBlocks";
import { 
  RosterLoadoutCard, 
  ClassPipelineCard 
} from "../../molecules/schools/RosterStatusCards";
import { useAllCoachRows, useTeamProfile, useTeamAnalytics } from "../../../hooks/useSWACData";

const DEFAULT_SEASON = 2026;
const PROFILE_CARD_RADIUS = "lg";

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

const externalOpponent = (game) => ({
  name: game?.opponent_name,
  shortName: game?.opponent_short_name || game?.opponent_name,
  mascot: game?.opponent_mascot,
  logo: game?.opponent_logo,
  colors: { primary: "#2D3748" },
});

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

const DashTab = ({
  team,
  season = DEFAULT_SEASON,
  record,
  nextGame,
  reviewGame,
  spotlightPlayer,
  headCoach,
  teamStat,
  rosterDepth,
}) => {
  const teamV5Id = team?.exportId?.replace(/25$/, "");
  const { profile } = useTeamProfile(team?.exportId, season || DEFAULT_SEASON);
  const { analytics } = useTeamAnalytics(team?.exportId);
  const { coaches: coachRows } = useAllCoachRows();

  const profileData = useMemo(() => {
    return {
      record: record || mapRecord(team, profile?.record),
      nextGame: nextGame || mapNextGame(profile?.next_game),
      reviewGame: reviewGame || mapReviewGame(profile?.previous_game),
      spotlightPlayer: spotlightPlayer || mapPlayer(profile?.player_spotlight),
      headCoach: headCoach || mapCoach(profile?.head_coach, coachRows, teamV5Id),
      teamStat: teamStat || mapTopStat(team, profile?.why_cards?.top_stat),
      rosterDepth: rosterDepth || profile?.why_cards?.roster_depth?.items || [],
    };
  }, [
    headCoach,
    coachRows,
    nextGame,
    profile,
    reviewGame,
    record,
    rosterDepth,
    spotlightPlayer,
    team,
    teamV5Id,
    teamStat,
  ]);

  const coachingStaffForTest = useMemo(
    () => [
      {
        name: profileData.headCoach?.name || "Coach Feed Pending",
        role: profileData.headCoach?.title || "Head Coach",
        statValue: profileData.headCoach?.record || "Y1",
        statLabel: "TENURE",
        image: profileData.headCoach?.image || null,
      },
      {
        name: "Evan Brooks",
        role: "Special Teams Coordinator",
        statValue: "89%",
        statLabel: "FG RATE",
      },
      {
        name: "Darren Cole",
        role: "Defensive Coordinator",
        statValue: "18.2",
        statLabel: "PTS ALLOWED",
      },
    ],
    [profileData.headCoach]
  );

  return (
    <>
      <PageShell.Slot cols={2} radius={PROFILE_CARD_RADIUS}>
        <TeamRecordBlock team={team} record={profileData.record} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} radius={PROFILE_CARD_RADIUS}>
        {profileData.nextGame ? (
          <NextGameCard team={team} game={profileData.nextGame} />
        ) : (
          <ReviewGameCard team={team} game={profileData.reviewGame} />
        )}
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2} radius={PROFILE_CARD_RADIUS}>
        <PlayerSpotlight 
          team={team} 
          player={profileData.spotlightPlayer} 
          gameContext="KEY MATCHUP VS SOUTHERN"
          keyStats={[
            { label: "OVR PAR", value: "+4.2" },
            { label: "PASS YDS", value: "245.5" },
            { label: "COMP %", value: "68%" }
          ]}
        />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <ReviewGameCard team={team} game={profileData.reviewGame} variant="compact" />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <CoachingStaffCard team={team} coaches={coachingStaffForTest} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <RosterLoadoutCard team={team} analytics={analytics} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <ClassPipelineCard team={team} analytics={analytics} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} radius={PROFILE_CARD_RADIUS}>
        <TeamStatCard team={team} stat={profileData.teamStat} />
      </PageShell.Slot>
    </>
  );
};

export default DashTab;
