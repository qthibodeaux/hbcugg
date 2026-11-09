import { getTeam } from "./gameMagazine/magazineModel";
import { Box, Grid, Text, Flex } from "@chakra-ui/react";
import { ScoreboardBanner, ScoringTimeline, KeyMoments } from "./gameMagazine/ScoreStory";
import { CardShell, SectionLabel, CollapsibleSection } from "./gameMagazine/MagazinePrimitives";
import { TeamMetricsFaceOff, SituationalBreakdown, DriveEfficiency } from "./gameMagazine/TeamMetrics";
import { GloryMVP, PlayerDuels } from "./gameMagazine/PlayerSpotlights";
import { CoachingTendencies, DefensiveIdentityCard, HeatMapGrid, SequenceModelCard } from "./gameMagazine/CoachingDefense";
import { SpecialTeamsCard, PenaltyReport } from "./gameMagazine/SpecialTeamsPenalties";
import { PlayByPlayFeed, BoxScoreTables } from "./gameMagazine/GameLogs";

/* ─── Main Page Component ─── */

export const GamePageMagazine = ({ game, imageMap = {} }) => {
  const meta = game?.metadata ?? {};
  const awayId = meta.away_team?.id;
  const homeId = meta.home_team?.id;
  const awayTeam = getTeam(awayId);
  const homeTeam = getTeam(homeId);

  const teamBox = game?.team_box ?? {};
  const advancedTeam = game?.advanced_team ?? {};
  const individualStats = game?.individual_stats ?? {};
  const productionScores = game?.production_scores ?? {};
  const drives = game?.drive_summary ?? [];
  const plays = game?.play_by_play ?? [];
  const coachingProfile = game?.coaching_profile ?? {};
  const defensiveIdentity = game?.defensive_identity ?? {};
  const heatMaps = game?.heat_maps ?? {};
  const sequenceModel = game?.sequence_model ?? {};
  const specialTeams = game?.special_teams_advanced ?? {};
  const penaltyAdvanced = game?.penalty_advanced ?? {};

  return (
    <Box bg="bg.primary" minH="100vh">
      {/* ── TIER 1: THE STORY ── */}
      <Box px={{ base: 4, lg: 8 }} py={6}>
        <ScoreboardBanner meta={meta} awayTeam={awayTeam} homeTeam={homeTeam} />
      </Box>

      <Box px={{ base: 4, lg: 8 }} pb={6}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4} mb={4}>
          <CardShell accent={awayTeam?.colors?.primary} p={4}>
            <SectionLabel label="Scoring Timeline" />
            <ScoringTimeline plays={plays} awayId={awayId} homeId={homeId} />
          </CardShell>
          <CardShell accent={homeTeam?.colors?.primary} p={4}>
            <SectionLabel label="Key Moments" />
            <KeyMoments plays={plays} />
          </CardShell>
        </Grid>

        {/* ── TIER 2: THE BATTLE ── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} mb={4}>
          <TeamMetricsFaceOff awayId={awayId} homeId={homeId} advancedTeam={advancedTeam} />
          <SituationalBreakdown awayId={awayId} homeId={homeId} teamBox={teamBox} />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} mb={4}>
          <DriveEfficiency drives={drives} awayId={awayId} homeId={homeId} />
          <GloryMVP awayId={awayId} homeId={homeId} productionScores={productionScores} imageMap={imageMap} />
        </Grid>

        {/* ── TIER 3: THE PLAYERS ── */}
        <Box mb={4}>
          <Text fontSize="lg" fontWeight="black" color="text.primary" mb={3}>Player Duels</Text>
          <PlayerDuels awayId={awayId} homeId={homeId} individualStats={individualStats} imageMap={imageMap} />
        </Box>

        {/* ── TIER 4: THE STRATEGY ── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={4} mb={4}>
          <CoachingTendencies coachingProfile={coachingProfile} teamId={awayId} />
          <CoachingTendencies coachingProfile={coachingProfile} teamId={homeId} />
          <DefensiveIdentityCard defensiveIdentity={defensiveIdentity} teamId={awayId} />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={4} mb={4}>
          <DefensiveIdentityCard defensiveIdentity={defensiveIdentity} teamId={homeId} />
          <HeatMapGrid heatMaps={heatMaps} teamId={awayId} />
          <HeatMapGrid heatMaps={heatMaps} teamId={homeId} />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} mb={4}>
          <SequenceModelCard sequenceModel={sequenceModel} teamId={awayId} />
          <SequenceModelCard sequenceModel={sequenceModel} teamId={homeId} />
        </Grid>

        {/* ── TIER 5: THE DETAILS ── */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={4} mb={4}>
          <SpecialTeamsCard specialTeams={specialTeams} teamId={awayId} />
          <SpecialTeamsCard specialTeams={specialTeams} teamId={homeId} />
          <PenaltyReport penaltyAdvanced={penaltyAdvanced} teamId={awayId} />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4} mb={4}>
          <PenaltyReport penaltyAdvanced={penaltyAdvanced} teamId={homeId} />
          <CardShell accent={awayTeam?.colors?.primary}>
            <SectionLabel label="Officials" />
            <Flex direction="column" gap={1} mt={2}>
              {meta?.officials && Object.entries(meta.officials).map(([role, name]) => (
                <Flex key={role} justify="space-between" py={1} borderBottom="1px solid" borderColor="whiteAlpha.50">
                  <Text fontSize="xs" color="text.muted">{role}</Text>
                  <Text fontSize="xs" color="text.primary">{name}</Text>
                </Flex>
              ))}
            </Flex>
          </CardShell>
        </Grid>

        {/* ── TIER 6: THE RAW FEED ── */}
        <CollapsibleSection title="Play-by-Play Feed" kicker="Every Play" count={plays.length}>
          <PlayByPlayFeed plays={plays} awayId={awayId} homeId={homeId} />
        </CollapsibleSection>

        <CollapsibleSection title="Full Box Score" kicker="All Players" count={Object.values(individualStats).reduce((acc, t) => acc + Object.values(t).flat().length, 0)}>
          <BoxScoreTables individualStats={individualStats} awayId={awayId} homeId={homeId} />
        </CollapsibleSection>
      </Box>
    </Box>
  );
};
