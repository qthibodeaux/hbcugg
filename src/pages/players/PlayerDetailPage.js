import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Activity, BarChart3, User } from "lucide-react";
import PageShell from "../../components/layouts/PageShell";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useAllPlayers, usePlayerProfileDoc, usePlayerStatsEnriched } from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";
import PlayerProfileBanner from "../../components/organisms/player/PlayerProfileBanner";
import { PlayerProfileControlStripV2 } from "../../components/organisms/test/PlayerProfileControlStripV2";
import PlayerStatsTab from "../../components/organisms/player/PlayerStatsTab";
import PlayerAdvancedTab from "../../components/organisms/player/PlayerAdvancedTab";
import PlayerBioBackgroundPanel from "../../components/organisms/player/PlayerBioBackgroundPanel";

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = {
    shortName: team.shortName,
    fullName: team.name,
    conference: team.conference,
    division: team.division,
    colors: team.colors,
    logo: team.logo,
    state: team.state,
  };

  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = {
    shortName: team.shortName,
    fullName: team.name,
    conference: team.conference,
    division: team.division,
    colors: team.colors,
    logo: team.logo,
    state: team.state,
  };

  return acc;
}, {});

const formatHeight = (inches) => {
  if (!inches) return "-";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

// Keyed by number, not AP abbreviation — player.class_year comes through the
// pipeline as a raw 1-5, not "Fr."/"So."/etc, so a string-keyed lookup here
// always missed and silently fell back to the raw number everywhere this map
// is used (PlayerDetailHero, PlayerBioBackgroundPanel).
const CLASS_FULL = {
  1: "Freshman",
  2: "Sophomore",
  3: "Junior",
  4: "Senior",
  5: "Graduate",
};

// Team ids arrive in several shapes across the roster/stats feeds
// ("swacaamu", "swacaamu25", mixed case). Every comparison has to normalize
// or it silently matches nothing.
const normalizeTeamId = (value) => String(value ?? "").toLowerCase().replace(/25$/, "");

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

  const { players: statPlayers, isLoading: statsLoading } = usePlayerStatsEnriched();
  const { players: rosterPlayers, isLoading: rosterLoading } = useAllPlayers();

  const isLoading = statsLoading || rosterLoading;

  const player = useMemo(() => {
    if (location.state?.player) return location.state.player;
    if (!playerKey) return null;

    const decoded = decodeURIComponent(playerKey);
    if (decoded.startsWith("PERS_")) {
      const fromStatsById = statPlayers.find((p) => p.person_id === decoded);
      if (fromStatsById) return fromStatsById;

      const fromRosterById = rosterPlayers.find((p) => p.person_id === decoded);
      if (fromRosterById) {
        return {
          ...fromRosterById,
          name_display: fromRosterById.full_name,
          team: fromRosterById.team_id,
          position: fromRosterById.position_abbr,
        };
      }
    }

    const [namePart, teamPart] = decoded.split("__");
    if (!namePart) return null;

    // Different link-builders across the app encode the team id differently
    // — some use the bare id ("swacpvamu"), some the export-style id with a
    // trailing season suffix ("swacpvamu25"). Strip it on both sides so a
    // reload (which loses location.state and forces this URL-based lookup)
    // doesn't 404 just because two components picked different formats.
    const normalizeTeam = (t) => String(t ?? "").toLowerCase().replace(/25$/, "");
    const teamKey = normalizeTeam(teamPart);

    const fromStats = statPlayers.find(
      (p) =>
        (p.name_display ?? "").toLowerCase() === namePart.toLowerCase() &&
        normalizeTeam(p.team) === teamKey,
    );
    if (fromStats) return fromStats;

    const fromRoster = rosterPlayers.find(
      (p) =>
        (p.full_name ?? "").toLowerCase() === namePart.toLowerCase() &&
        normalizeTeam(p.team_id) === teamKey,
    );
    if (!fromRoster) return null;

    return {
      ...fromRoster,
      name_display: fromRoster.full_name,
      team: fromRoster.team_id,
      position: fromRoster.position_abbr,
    };
  }, [location.state, playerKey, rosterPlayers, statPlayers]);

  const rosterEntry = useMemo(() => {
    if (!player) return null;
    return rosterPlayers.find(
      (p) =>
        (p.full_name ?? "").toLowerCase() ===
        (player.name_display ?? player.full_name ?? "").toLowerCase(),
    );
  }, [player, rosterPlayers]);

  // BACKEND_RESPONSE_SPEC.md §4.2 — one-player, one-document. Only Cameron
  // Peters (PERS_00011214, PVAMU/2025) exists on disk today; every other
  // player 404s and `profileDoc` is null, falling through to the
  // client-side roster/stats merge below unchanged.
  // player_stats_2025_enriched.json's person_id is a stale generation (see
  // BACKEND_CHANGE_NOTES.md §5 — confirmed: Cameron Peters is PERS_00003846
  // there vs the current PERS_00011214 in player_seasons_2025.json and the
  // parsed games). rosterEntry agrees with the current build; prefer it,
  // same pattern as height/weight/hometown above.
  const { doc: profileDoc } = usePlayerProfileDoc(2025, rosterEntry?.person_id ?? player?.person_id);
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
  const rankToPct = (rank, total) => (total > 1 ? 100 - ((rank - 1) / (total - 1)) * 100 : 100);
  const docComparatives = profileDoc?.comparatives;

  // §4.2's games[] (real per-game rows, one per scheduled game) replaces
  // MOCK_SEASON_GAMES for whichever player has a document. stat_line[] is
  // already position-agnostic ([{label,value}]) — GameReadout reads it
  // directly via game.statFields rather than the defense-shaped buildStatFields.
  // field_map is now per-game too (games[].field_map, {passing, rushing}) —
  // filtering to "played" games means every remaining row has real cells,
  // never the null the backend sends for an uncovered week.
  const docSeasonGames = useMemo(() => {
    if (!profileDoc?.games) return null;
    return profileDoc.games
      .filter((g) => g.data_state === "played")
      .map((g) => ({
        week: `Week ${g.week}`,
        vs: `${g.home_away === "away" ? "@" : "vs"} ${g.opponent_name}`,
        opponentId: g.opponent_id,
        result: g.score,
        par: g.par,
        statFields: (g.stat_line ?? []).map((s) => ({ label: s.label, value: String(s.value) })),
        fieldMap: g.field_map,
      }));
  }, [profileDoc]);
  // views[]/depth_bands are constant for the player, sent once on the
  // season block rather than repeated on every game row.
  const docFieldMapViews = profileDoc?.field_map?.views;
  const docDepthBands = profileDoc?.field_map?.depth_bands;

  // Percentile vs. same-position peers across the full roster — real
  // comparison, not a fabricated stat.
  const percentileRank = (list, value) => {
    const nums = list.filter((n) => Number.isFinite(n));
    if (!nums.length || !Number.isFinite(value)) return null;
    const below = nums.filter((n) => n < value).length;
    return Math.round((below / nums.length) * 100);
  };
  const positionPeers = useMemo(
    () => rosterPlayers.filter((p) => p.position_group === player?.position_group),
    [rosterPlayers, player],
  );
  // Stats-source peers (carry par/total_production/games_played, unlike the
  // roster source) for the Stats tab's conference-rank mock computation.
  const statPositionPeers = useMemo(
    () => statPlayers.filter((p) => p.position_group === player?.position_group),
    [statPlayers, player],
  );
  const heightPercentile = docComparatives
    ? Math.round(rankToPct(docComparatives.height.rank, docComparatives.height.total))
    : percentileRank(positionPeers.map((p) => p.height), Number(height));
  const weightPercentile = docComparatives
    ? Math.round(rankToPct(docComparatives.weight.rank, docComparatives.weight.total))
    : percentileRank(positionPeers.map((p) => p.weight), Number(weight));
  const average = (nums) => {
    const finite = nums.filter((n) => Number.isFinite(n));
    return finite.length ? finite.reduce((a, b) => a + b, 0) / finite.length : null;
  };
  const heightAvg = docComparatives?.height.group_avg ?? average(positionPeers.map((p) => p.height));
  const weightAvg = docComparatives?.weight.group_avg ?? average(positionPeers.map((p) => p.weight));

  // Team-scoped "1 of N" roster-context counts — per your note, this should
  // compare against the player's own team, not the whole league.
  // Was a raw `p.team_id === teamKey`, which never matched when the player
  // record came through the stats feed (different casing / trailing "25").
  // teamPeers came back empty, so every "1 of N" read "1 of 0" and the
  // position/class grid was all zeros.
  const teamPeers = useMemo(() => {
    const teamKey = normalizeTeamId(player?.team ?? player?.team_id);
    return rosterPlayers.filter((p) => normalizeTeamId(p.team_id) === teamKey);
  }, [rosterPlayers, player]);
  // §4.2's on_this_team[] ships pre-counted totals by label — the card
  // always renders "1 of {value}" regardless of the player's real rank
  // (a pre-existing simplification, unchanged here), so only the total
  // needs to come from the right source.
  const onTeamTotal = (label) =>
    docComparatives?.on_this_team?.find((c) => c.label.toUpperCase() === label)?.total;
  const positionTeamCount = onTeamTotal("QUARTERBACKS") ?? onTeamTotal(`${identity?.position_group ?? ""}S`) ??
    teamPeers.filter((p) => p.position_group === player?.position_group).length;
  const classTeamCount = onTeamTotal(`${(identity?.class_label ?? "").toUpperCase()}S`) ??
    teamPeers.filter((p) => p.class_year === classYear).length;
  const transferTeamCount = onTeamTotal("TRANSFERS") ?? teamPeers.filter((p) => p.is_transfer).length;
  const inStateTeamCount = onTeamTotal("IN-STATE PLAYERS") ?? teamPeers.filter((p) => p.is_in_state).length;
  // Teammates from this player's own home state — the mobile home-state
  // card reads "N of M from Georgia". Real distance-from-school miles do
  // not exist in the pipeline (0 of 1946 players carry it). Not part of
  // §4.2's on_this_team[] — still team-wide roster derived.
  const homeStateTeamCount = teamPeers.filter(
    (p) => String(p.home_state ?? "").toUpperCase() === String(homeState ?? "").toUpperCase()
  ).length;

  // Position-group teammates broken out by class year, for the roster
  // distribution grid. §4.2's comparatives.position_room[] ships this
  // pre-counted for whichever player has a document; team-scoped roster
  // derivation is the fallback for everyone else.
  const CLASS_TO_NUM = { "Fr.": 1, "So.": 2, "Jr.": 3, "Sr.": 4, "Gr.": 5 };
  const positionTeammates = teamPeers.filter((p) => p.position_group === player?.position_group);
  const positionClassCounts = docComparatives?.position_room
    ? docComparatives.position_room.reduce((acc, item) => {
        const num = CLASS_TO_NUM[item.class];
        if (num) acc[num] = item.count;
        return acc;
      }, {})
    : [1, 2, 3, 4, 5].reduce((acc, year) => {
        acc[year] = positionTeammates.filter((p) => p.class_year === year).length;
        return acc;
      }, {});

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
