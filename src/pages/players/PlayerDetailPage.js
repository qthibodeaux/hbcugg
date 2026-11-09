import { usePlayerProfileComparisons } from "../../hooks/usePlayerProfileComparisons";
import { TEAM_BY_EXPORT, formatHeight, CLASS_FULL, resolveProfilePlayer, findProfileRosterEntry, mapProfileSeasonGames } from "../../utils/playerProfileModel";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Activity, BarChart3, User } from "lucide-react";
import PageShell from "../../components/layouts/PageShell";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useAllPlayersByYear, usePlayerProfileDoc } from "../../hooks/useSWACData";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import PlayerProfileBanner from "../../components/organisms/player/PlayerProfileBanner";
import { PlayerProfileControlStripV2 } from "../../components/organisms/test/PlayerProfileControlStripV2";
import PlayerStatsTab from "../../components/organisms/player/PlayerStatsTab";
import PlayerAdvancedTab from "../../components/organisms/player/PlayerAdvancedTab";
import PlayerBioBackgroundPanel from "../../components/organisms/player/PlayerBioBackgroundPanel";

// Keyed by number, not AP abbreviation — player.class_year comes through the
// pipeline as a raw 1-5, not "Fr."/"So."/etc, so a string-keyed lookup here
// always missed and silently fell back to the raw number everywhere this map
// is used (PlayerDetailHero, PlayerBioBackgroundPanel).

// Team ids arrive in several shapes across the roster/stats feeds
// ("swacaamu", "swacaamu25", mixed case). Every comparison has to normalize
// or it silently matches nothing.

const TABS = [
  { id: "profile", label: "BIO & BACKGROUND", shortLabel: "BIO", icon: User },
  { id: "production", label: "SEASON STATS", shortLabel: "STATS", icon: BarChart3 },
  { id: "stats", label: "ADVANCED ANALYTICS", shortLabel: "ANALYTICS", icon: Activity },
];

const LEGACY_TAB_MAP = {
  dash: "stats",
  profile: "profile",
  production: "production",
};

const PlayerDetailPage = () => {
  const { isMobile } = useLayoutDensity();
  const { playerKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [imgErr, setImgErr] = useState(false);

  // The season on screen is the football current season (shared/football_current_context.json),
  // so the page follows each weekly drop. The roster rows for that season carry
  // PAR, games played and production, so one source covers what the old
  // 2025-only "stats enriched" file did; the profile document adds the rest.
  const { currentSeason: season } = useFootballCurrentContext();
  const { players: seasonRows, isLoading } = useAllPlayersByYear(season);
  // Use the current rows even when a season/update has the same player count.
  const rosterPlayers = seasonRows;
  const statPlayers = useMemo(
    () => rosterPlayers.map((p) => ({ ...p, name_display: p.full_name, team: p.team_id, position: p.position_abbr ?? p.position })),
    [rosterPlayers],
  );

  const player = useMemo(() => resolveProfilePlayer({ state: location.state, playerKey, rosterPlayers, statPlayers }), [location.state, playerKey, rosterPlayers, statPlayers]);

  const rosterEntry = useMemo(() => findProfileRosterEntry({ player, rosterPlayers }), [player, rosterPlayers]);

  // BACKEND_RESPONSE_SPEC.md §4.2 — one-player, one-document, for the season on
  // screen (players/profile/{season}/{person_id}.json). A player without one
  // 404s and `profileDoc` is null, falling through to the roster merge below.
  const { doc: profileDoc, isLoading: isLoadingGames } = usePlayerProfileDoc(season, rosterEntry?.person_id ?? player?.person_id);
  const identity = profileDoc?.identity;

  const height = identity?.height ?? rosterEntry?.height ?? player?.height;
  const weight = identity?.weight ?? rosterEntry?.weight ?? player?.weight;
  const imageUrl = identity?.image_url ?? player?.image_url ?? rosterEntry?.image_url;
  // These only exist in the roster source (player_seasons_{year}.json) — the
  // enriched stats source doesn't carry them, so rosterEntry is primary.
  // NOTE: distance_miles/distance_tier exist as fields but are unpopulated
  // for every player in the current data (checked: 0 of 1946) — not used.
  const homeCity = identity?.home_city ?? rosterEntry?.home_city ?? player?.home_city;
  const homeState = identity?.home_state ?? rosterEntry?.home_state ?? player?.home_state;
  const isInState = identity?.is_in_state ?? rosterEntry?.is_in_state ?? player?.is_in_state;
  const highSchool = identity?.high_school ?? rosterEntry?.high_school ?? player?.high_school;
  const previousSchool = identity?.previous_school ?? rosterEntry?.previous_school ?? player?.previous_school;
  // The enriched stats source frequently has class_year: null (confirmed
  // against the raw data) — roster source is reliable, so prefer it, same
  // pattern as height/weight/hometown above. Fixes "1 of 0 Same Class"-style
  // bugs downstream that were silently comparing against a null value.
  const classYear = identity?.class_year ?? rosterEntry?.class_year ?? player?.class_year;

  const teamMeta = TEAM_BY_EXPORT[player?.team ?? player?.team_id] ?? {};
  const parScore = player?.par ?? 0;
  const gloryRating = Math.min(99, Math.round(50 + parScore * 0.8));

  // §4.2's `rating` block (PAR, ranked within position group) replaces the
  // old Glory dial — see BACKEND_CHANGE_NOTES.md §1. Falls back to the old
  // formula above when no document exists for this player.
  const rating = profileDoc?.rating;
  const ratingAvailable = rating?.available;
  const ratingLabel = ratingAvailable ? `${rating.metric} Rank` : "Glory Rating";
  const ratingFill = ratingAvailable
    ? rating.position_group_total > 1
      ? 100 - ((rating.rank_in_position_group - 1) / (rating.position_group_total - 1)) * 100
      : 100
    : gloryRating;
  const ratingDisplay = ratingAvailable ? rating.rank_in_position_group : gloryRating;
  const ratingSuffix = ratingAvailable
    ? `of ${rating.position_group_total} ${identity?.position_group ?? ""}`.trim()
    : "/ 100";

  // §4.2's comparatives ship pre-ranked (rank/total), not a percentile — an
  // ordinal-to-percentile conversion drives the existing PercentileBar so
  // the panel doesn't need its own rendering path for the two shapes.

  const { statPositionPeers, heightPercentile, weightPercentile, heightAvg, weightAvg, teamPeers, positionTeamCount, classTeamCount, transferTeamCount, inStateTeamCount, homeStateTeamCount, positionClassCounts } = usePlayerProfileComparisons({ profileDoc, rosterPlayers, statPlayers, player, height, weight, identity, classYear, homeState });

  // §4.2's games[] provides the per-game rows. stat_line[] is
  // already position-agnostic ([{label,value}]) — GameReadout reads it
  // directly via game.statFields rather than the defense-shaped buildStatFields.
  // field_map is now per-game too (games[].field_map, {passing, rushing}) —
  // filtering to "played" games means every remaining row has real cells,
  // never the null the backend sends for an uncovered week.
  const docSeasonGames = useMemo(() => mapProfileSeasonGames(profileDoc), [profileDoc]);
  // views[]/depth_bands are constant for the player, sent once on the
  // season block rather than repeated on every game row.
  const docFieldMapViews = profileDoc?.field_map?.views;
  const docDepthBands = profileDoc?.field_map?.depth_bands;

  // Percentile vs. same-position peers across the full roster — real
  // comparison, not a fabricated stat.

  // Stats-source peers (carry par/total_production/games_played, unlike the
  // roster source) for the Stats tab's conference-rank mock computation.

  // Team-scoped "1 of N" roster-context counts — per your note, this should
  // compare against the player's own team, not the whole league.
  // Was a raw `p.team_id === teamKey`, which never matched when the player
  // record came through the stats feed (different casing / trailing "25").
  // teamPeers came back empty, so every "1 of N" read "1 of 0" and the
  // position/class grid was all zeros.

  // §4.2's on_this_team[] ships pre-counted totals by label — the card
  // always renders "1 of {value}" regardless of the player's real rank
  // (a pre-existing simplification, unchanged here), so only the total
  // needs to come from the right source.

  // Teammates from this player's own home state — the mobile home-state
  // card reads "N of M from Georgia". Real distance-from-school miles do
  // not exist in the pipeline (0 of 1946 players carry it). Not part of
  // §4.2's on_this_team[] — still team-wide roster derived.

  // Position-group teammates broken out by class year, for the roster
  // distribution grid. §4.2's comparatives.position_room[] ships this
  // pre-counted for whichever player has a document; team-scoped roster
  // derivation is the fallback for everyone else.

  if (isLoading) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <Flex justify="center" align="center" h="50vh">
          <Spinner color="brand.500" size="xl" />
        </Flex>
      </Box>
    );
  }

  if (!player) {
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
        <Box maxW="1400px" mx="auto" px={{ base: "4px", md: "4px", lg: "16px" }} py={12}>
          <Text color="text.muted" mb={4}>
            Player not found.
          </Text>
          <Box as={Link} to="/players" color="brand.400" fontSize="sm">
            Back to Players Hub
          </Box>
        </Box>
      </Box>
    );
  }

  const displayName = (player.name_display ?? player.full_name ?? "").toUpperCase();
  // Trailing generational suffixes are not the surname — taking the last
  // token blindly rendered "JD Davis II" as a player named "II".
  const nameParts = displayName.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const surnameParts = [...nameParts];
  while (surnameParts.length > 1 && /^(JR|SR|I{2,3}|IV|V)\.?$/i.test(surnameParts[surnameParts.length - 1])) {
    surnameParts.pop();
  }
  // §4.2 ships first_name/last_name split already — bypasses the suffix
  // regex above entirely for whichever player has a document.
  const firstName = identity?.first_name?.toUpperCase() ?? surnameParts.slice(0, -1).join(" ");
  const lastName = identity?.last_name?.toUpperCase() ?? surnameParts.slice(-1)[0] ?? "";
  const tabParam = searchParams.get("tab");
  const sectionParam = searchParams.get("section");
  const requestedTab = tabParam ?? LEGACY_TAB_MAP[sectionParam] ?? sectionParam;
  const activeTab = TABS.some((tab) => tab.id === requestedTab) ? requestedTab : "profile";
  const classLabel = identity?.class_label ?? (classYear ? (CLASS_FULL[classYear] ?? classYear) : null);
  const setActiveTab = (tabId) => {
    const next = new URLSearchParams(searchParams);
    next.delete("section");
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  const banner = (
    <PlayerProfileBanner
      player={player}
      teamMeta={teamMeta}
      imageUrl={imageUrl}
      imgErr={imgErr}
      onImgErr={() => setImgErr(true)}
      firstName={firstName}
      lastName={lastName}
      gloryRating={gloryRating}
      ratingLabel={ratingLabel}
      ratingFill={ratingFill}
      ratingDisplay={ratingDisplay}
      ratingSuffix={ratingSuffix}
      parScore={parScore}
      classLabel={classLabel}
    />
  );

  const controlStrip = (
    <PlayerProfileControlStripV2
      player={player}
      teamMeta={teamMeta}
      classLabel={classLabel}
      height={height}
      weight={weight}
      homeCity={homeCity}
      homeState={homeState}
      highSchool={highSchool}
      previousSchool={previousSchool}
      seasonGames={docSeasonGames}
      isLoadingGames={isLoadingGames}
      fieldMapViews={docFieldMapViews}
      depthBands={docDepthBands}
      productionComponents={profileDoc?.season_totals?.season_components}
      tabs={TABS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onBack={() => navigate(-1)}
    />
  );

  const tabPanels = (
    <>
      {activeTab === "profile" && (
        <PlayerBioBackgroundPanel
          player={player}
          height={height}
          weight={weight}
          homeCity={homeCity}
          homeState={homeState}
          isInState={isInState}
          highSchool={highSchool}
          previousSchool={previousSchool}
          classYear={classYear}
          heightPercentile={heightPercentile}
          weightPercentile={weightPercentile}
          heightAvg={heightAvg}
          weightAvg={weightAvg}
          positionTeamCount={positionTeamCount}
          classTeamCount={classTeamCount}
          transferTeamCount={transferTeamCount}
          inStateTeamCount={inStateTeamCount}
          homeStateTeamCount={homeStateTeamCount}
          rosterTeamCount={teamPeers.length}
          positionClassCounts={positionClassCounts}
          teamMeta={teamMeta}
          formatHeight={formatHeight}
        />
      )}
      {activeTab === "production" && (
        <PlayerStatsTab player={player} teamMeta={teamMeta} positionPeers={statPositionPeers} />
      )}
      {activeTab === "stats" && <PlayerAdvancedTab player={player} teamMeta={teamMeta} />}
    </>
  );

  // Mobile — no PageShell: the square photo banner sizes to its own content
  // instead of being forced into the shared row unit.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {banner}
        {controlStrip}
        {tabPanels}
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>{banner}</PageShell.Slot>
      <PageShell.Slot cols={4}>{controlStrip}</PageShell.Slot>
      {tabPanels}
    </PageShell>
  );
};

export default PlayerDetailPage;
