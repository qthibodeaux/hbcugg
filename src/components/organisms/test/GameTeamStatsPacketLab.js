import { Fragment } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Database, Info } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import teamsData from "../../../data/teams.json";

/**
 * GameTeamStatsPacketLab
 *
 * PHILOSOPHY:
 *   Purpose: Team Stats tab as the full game data room.
 *   Grid slot: Full PageShell lab route.
 *
 * CONTENT TIERS:
 *   Essential: shared game banner, grouped team comparison tables, situational and advanced context.
 *   Nice-to-have: basic row tinting, edge markers, data-quality caveats.
 *   Drop later at mobile: lower-priority advanced rows and long caveat text.
 *
 * COMPONENT SIZING:
 *   Shared 4x1 game banner followed by listContent tables.
 *   Tables can be dense; scrollable sections are acceptable for this tab.
 */

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const normalizeTeamId = (value) =>
  String(value?.team_id ?? value?.id ?? value?.exportId ?? value ?? "").replace(/25$/, "");
const getTeam = (id) => TEAM_META[normalizeTeamId(id)] ?? {};
const getTeamLabel = (id) => getTeam(id).shortName ?? String(id ?? "TEAM").toUpperCase();
const getTeamName = (id) => getTeam(id).name ?? getTeamLabel(id);
const getTeamLogo = (id) => getTeam(id).logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id).colors?.primary ?? fallback;

const valueAt = (obj, path) => path.split(".").reduce((acc, key) => acc?.[key], obj);
const n = (value) => (value == null || Number.isNaN(Number(value)) ? null : Number(value));
const div = (a, b) => (n(b) ? n(a) / n(b) : null);

const fmt = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

const signed = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const next = Number(value);
  return `${next > 0 ? "+" : ""}${next.toFixed(digits)}`;
};

const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Math.round(Number(value) * 100)}%`;
};

const ratio = (made, attempts) => `${fmt(made, 0)}/${fmt(attempts, 0)}`;

const gameScore = (game, side, meta) => game?.final_score?.[side] ?? meta?.final_score?.[side] ?? meta?.[`${side}_points`] ?? 0;

const SharedGameBanner = ({ game, active = "Team Stats" }) => {
  const meta = game?.metadata ?? {};
  const awayId = normalizeTeamId(meta.away_team);
  const homeId = normalizeTeamId(meta.home_team);
  const awayScore = gameScore(game, "away", meta);
  const homeScore = gameScore(game, "home", meta);
  const winner = awayScore > homeScore ? awayId : homeId;
  const awayColor = getTeamColor(awayId, "#4B0082");
  const homeColor = getTeamColor(homeId, "#002147");

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" bg="#08080A" border="1px solid" borderColor="whiteAlpha.100">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}55 0%, #08080A 34%, #08080A 66%, ${homeColor}55 100%)`} />
      <Text position="absolute" left="50%" top="-7%" transform="translateX(-50%)" fontSize="clamp(4.5rem, 13vw, 11rem)" fontWeight="black" lineHeight={0.8} color="whiteAlpha.100" textTransform="uppercase" whiteSpace="nowrap">
        Final
      </Text>
      <Grid position="relative" zIndex={1} templateColumns={{ base: "1fr", lg: "minmax(0,1fr) 190px minmax(0,1fr)" }} alignItems="center" gap={6} px={{ base: 5, lg: 8 }} py={5}>
        <Flex align="center" gap={4} minW={0}>
          <Image src={getTeamLogo(awayId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0}>
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Away</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(awayId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(awayId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} ml="auto">{awayScore}</Text>
        </Flex>

        <Flex direction="column" align="center" gap={3}>
          <Box px={3} py={1} bg="brand.500">
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">Final</Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">{getTeamLabel(winner)} by {Math.abs(awayScore - homeScore)}</Text>
          <Text fontSize="10px" color="whiteAlpha.600" textAlign="center" lineClamp={2}>{meta.date} | {meta.site}</Text>
        </Flex>

        <Flex align="center" gap={4} direction="row-reverse" minW={0}>
          <Image src={getTeamLogo(homeId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0} textAlign="right">
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Home</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(homeId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(homeId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} mr="auto">{homeScore}</Text>
        </Flex>
      </Grid>
      <Flex position="relative" zIndex={1} justify="space-between" align="center" gap={4} px={{ base: 5, lg: 8 }} pb={5} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {["Game Summary", "Box Score", "Play By Play", "Team Stats"].map((tab) => (
            <Box key={tab} px={3} py={2} border="1px solid" borderColor={tab === active ? "brand.500" : "whiteAlpha.100"} bg={tab === active ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}>
              <Text fontSize="10px" color={tab === active ? "white" : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">{tab}</Text>
            </Box>
          ))}
        </Flex>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">
          Attendance {meta.attendance?.toLocaleString?.() ?? "-"} | Kick {meta.kickoff_time ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} justify="space-between" gap={3} mb={3}>
    <Box>
      <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">Team Stats</Text>
      <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>{title}</Text>
    </Box>
    {subtitle && <Text fontSize="xs" color="text.muted" maxW="460px" textAlign={{ base: "left", md: "right" }}>{subtitle}</Text>}
  </Flex>
);

const TableShell = ({ title, subtitle, rows, teams, tint = true }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
    <SectionHeader title={title} subtitle={subtitle} />
    <Box overflowX="auto">
      <Grid templateColumns="minmax(190px, 1.4fr) repeat(2, minmax(100px, 0.8fr))" minW="520px" gap={0}>
        <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>Metric</Text>
        {teams.map((teamId) => {
          const normalizedTeamId = normalizeTeamId(teamId);
          return (
          <Text key={normalizedTeamId} fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase" borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
            {getTeamLabel(normalizedTeamId)}
          </Text>
          );
        })}
        {rows.map((row) => {
          const values = teams.map((teamId) => row.value(normalizeTeamId(teamId)));
          const nums = values.map((value) => (typeof value === "number" ? value : null));
          const best = row.higherIsBetter === false ? Math.min(...nums.filter((v) => v != null)) : Math.max(...nums.filter((v) => v != null));
          return (
            <Fragment key={row.label}>
              <Text fontSize="11px" color="text.secondary" fontWeight="black" py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">{row.label}</Text>
              {teams.map((teamId, index) => {
                const normalizedTeamId = normalizeTeamId(teamId);
                const value = values[index];
                const numeric = nums[index];
                const isEdge = tint && numeric != null && numeric === best && nums.filter((v) => v != null).length > 1;
                return (
                  <Box key={`${row.label}-${normalizedTeamId}`} py={2} px={2} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={isEdge ? `${getTeamColor(normalizedTeamId)}22` : "transparent"}>
                    <Text fontSize="12px" color="white" fontWeight="black" textAlign="right">{row.format ? row.format(value, normalizedTeamId) : fmt(value, 1)}</Text>
                    {row.context && <Text fontSize="8px" color="text.muted" textAlign="right" textTransform="uppercase" fontWeight="black">{row.context(value, normalizedTeamId)}</Text>}
                  </Box>
                );
              })}
            </Fragment>
          );
        })}
      </Grid>
    </Box>
  </Box>
);

const buildRows = (game) => {
  const teamStats = game.team_stats ?? {};
  const adv = game.game_advanced?.team_advanced ?? {};
  const def = game.defensive_context ?? {};

  const ts = (teamId, key) => teamStats[teamId]?.[key];
  const av = (teamId, path) => valueAt(adv[teamId], path);
  const dc = (teamId, key) => def[teamId]?.[key];

  return {
    overview: [
      { label: "Points", value: (t) => ts(t, "points_scored"), format: (v) => fmt(v, 0) },
      { label: "Total Plays", value: (t) => ts(t, "plays_offense"), format: (v) => fmt(v, 0) },
      { label: "Total Yards", value: (t) => (ts(t, "pass_yards") ?? 0) + (ts(t, "rush_yards") ?? 0), format: (v) => fmt(v, 0) },
      { label: "Yards / Play", value: (t) => div((ts(t, "pass_yards") ?? 0) + (ts(t, "rush_yards") ?? 0), ts(t, "plays_offense")), format: (v) => fmt(v, 2) },
      { label: "EPA / Play", value: (t) => av(t, "plays.epa_per_play"), format: (v) => signed(v, 3) },
      { label: "Success Rate", value: (t) => av(t, "plays.success_rate_down_distance"), format: pct },
      { label: "Explosive Play Rate", value: (t) => av(t, "plays.explosive_rate_yardage"), format: pct },
      { label: "Turnovers", value: (t) => ts(t, "turnovers_committed"), format: (v) => fmt(v, 0), higherIsBetter: false },
    ],
    production: [
      { label: "Offensive EPA", value: (t) => av(t, "plays.epa_streams.offense.epa"), format: (v) => signed(v, 2) },
      { label: "Offensive EPA / Play", value: (t) => av(t, "plays.epa_streams.offense.epa_per_play"), format: (v) => signed(v, 3) },
      { label: "Special Teams EPA", value: (t) => av(t, "plays.epa_streams.special_teams.epa"), format: (v) => signed(v, 2) },
      { label: "Penalty EPA Overlay", value: (t) => av(t, "plays.epa_streams.penalty_overlay.epa"), format: (v) => signed(v, 2) },
      { label: "WPA Total", value: (t) => av(t, "plays.wpa_total"), format: (v) => signed(v, 3) },
      { label: "Positive WPA Play Rate", value: (t) => av(t, "plays.positive_wpa_play_rate"), format: pct },
    ],
    rushing: [
      { label: "Rush Attempts", value: (t) => ts(t, "rush_attempts"), format: (v) => fmt(v, 0) },
      { label: "Rush Yards", value: (t) => ts(t, "rush_yards"), format: (v) => fmt(v, 0) },
      { label: "Yards / Carry", value: (t) => div(ts(t, "rush_yards"), ts(t, "rush_attempts")), format: (v) => fmt(v, 2) },
      { label: "Line Yards / Rush", value: (t) => av(t, "rushing_model.line_yards_per_rush"), format: (v) => fmt(v, 2) },
      { label: "Highlight Yards / Rush", value: (t) => av(t, "rushing_model.highlight_yards_per_rush"), format: (v) => fmt(v, 2) },
      { label: "Opportunity Rate", value: (t) => av(t, "rushing_model.rush_opportunity_rate"), format: pct },
      { label: "Stuff Rate", value: (t) => av(t, "rushing_model.stuff_rate"), format: pct, higherIsBetter: false },
      { label: "Power Success Rate", value: (t) => av(t, "rushing_model.power_success_rate"), format: pct },
    ],
    situational: [
      { label: "3rd Down", value: (t) => ts(t, "third_down_conversion_rate"), format: (v, t) => `${ratio(ts(t, "third_down_conversions"), ts(t, "third_down_attempts"))} (${pct(v)})` },
      { label: "Avg 3rd Down Distance", value: (t) => ts(t, "third_down_avg_distance"), format: (v) => fmt(v, 1), higherIsBetter: false },
      { label: "4th Down Go Rate", value: (t) => ts(t, "fourth_down_go_rate"), format: pct },
      { label: "4th Down Conversion Rate", value: (t) => ts(t, "fourth_down_go_conversion_rate"), format: (v, t) => `${ratio(ts(t, "fourth_down_go_conversions"), ts(t, "fourth_down_goes"))} (${pct(v)})` },
      { label: "Standard Down Success", value: (t) => av(t, "situational.success_rate_standard_down"), format: pct },
      { label: "Passing Down Success", value: (t) => av(t, "situational.success_rate_passing_down"), format: pct },
      { label: "Early Down Success", value: (t) => av(t, "situational.success_rate_early_down"), format: pct },
      { label: "Late Down Success", value: (t) => av(t, "situational.success_rate_late_down"), format: pct },
      { label: "Two-Minute EPA / Play", value: (t) => av(t, "situational.two_minute_epa_per_play"), format: (v) => signed(v, 3) },
    ],
    drives: [
      { label: "Drives", value: (t) => ts(t, "drives_offense"), format: (v) => fmt(v, 0) },
      { label: "Points / Drive", value: (t) => ts(t, "points_per_drive"), format: (v) => fmt(v, 2) },
      { label: "Avg Start Field Position", value: (t) => ts(t, "avg_start_field_position"), format: (v) => fmt(v, 1) },
      { label: "Long Field Drives", value: (t) => ts(t, "long_field_rate"), format: (v, t) => `${fmt(ts(t, "long_field_drives"), 0)} (${pct(v)})`, higherIsBetter: false },
      { label: "Scoring Drives", value: (t) => ts(t, "scoring_drives"), format: (v) => fmt(v, 0) },
      { label: "Quality Drive Rate", value: (t) => av(t, "drives.quality_drive_rate"), format: pct },
      { label: "Explosive Drive Rate", value: (t) => av(t, "drives.explosive_drive_rate"), format: pct },
      { label: "Negative Drive Rate", value: (t) => av(t, "drives.negative_drive_rate"), format: pct, higherIsBetter: false },
    ],
    finishing: [
      { label: "Opportunities Inside 40", value: (t) => av(t, "finishing.opportunities_40"), format: (v) => fmt(v, 0) },
      { label: "Points / Opp Inside 40", value: (t) => av(t, "finishing.points_per_opportunity_40"), format: (v) => fmt(v, 1) },
      { label: "Red Zone Opportunities", value: (t) => av(t, "finishing.red_zone_opportunities"), format: (v) => fmt(v, 0) },
      { label: "Red Zone Points / Opp", value: (t) => av(t, "finishing.red_zone_points_per_opportunity"), format: (v) => fmt(v, 1) },
      { label: "Red Zone TD Rate", value: (t) => av(t, "finishing.red_zone_td_rate"), format: pct },
    ],
    defense: [
      { label: "Plays Faced", value: (t) => dc(t, "plays_faced"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "3rd Down Stops", value: (t) => div(dc(t, "third_down_stops"), dc(t, "third_down_faced")), format: (v, t) => `${ratio(dc(t, "third_down_stops"), dc(t, "third_down_faced"))} (${pct(v)})` },
      { label: "4th Down Stops", value: (t) => div(dc(t, "fourth_down_stops"), dc(t, "fourth_down_faced")), format: (v, t) => `${ratio(dc(t, "fourth_down_stops"), dc(t, "fourth_down_faced"))} (${pct(v)})` },
      { label: "Red Zone Stops", value: (t) => div(dc(t, "red_zone_stops"), dc(t, "red_zone_trips_faced")), format: (v, t) => `${ratio(dc(t, "red_zone_stops"), dc(t, "red_zone_trips_faced"))} (${pct(v)})` },
      { label: "Explosive Plays Allowed 10+", value: (t) => dc(t, "explosive_plays_allowed_10"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Sacks + Hurries", value: (t) => (dc(t, "sacks_made") ?? 0) + (dc(t, "qb_hurries_made") ?? 0), format: (v) => fmt(v, 0) },
      { label: "TFL", value: (t) => dc(t, "tfl_made"), format: (v) => fmt(v, 0) },
      { label: "Passes Defended", value: (t) => dc(t, "passes_defended_made"), format: (v) => fmt(v, 0) },
      { label: "Disruption Rate", value: (t) => av(t, "defensive_identity.disruption_rate"), format: pct },
      { label: "Explosive Prevention", value: (t) => av(t, "defensive_identity.explosive_prevention_rate"), format: pct },
    ],
    turnovers: [
      { label: "Actual Turnovers", value: (t) => av(t, "turnovers.actual_turnovers"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Expected Turnovers", value: (t) => av(t, "turnovers.expected_turnovers"), format: (v) => fmt(v, 2), higherIsBetter: false },
      { label: "Turnover Luck", value: (t) => av(t, "turnovers.turnover_luck"), format: (v) => signed(v, 2) },
      { label: "Turnovers Forced", value: (t) => ts(t, "turnovers_forced"), format: (v) => fmt(v, 0) },
      { label: "Interceptions Made", value: (t) => dc(t, "interceptions_made"), format: (v) => fmt(v, 0) },
      { label: "Forced Fumbles Made", value: (t) => dc(t, "forced_fumbles_made"), format: (v) => fmt(v, 0) },
    ],
    specialTeams: [
      { label: "ST Plays", value: (t) => av(t, "special_teams_model.st_play_count"), format: (v) => fmt(v, 0) },
      { label: "Kickoff Attempts", value: (t) => av(t, "special_teams_model.kickoff_attempts"), format: (v) => fmt(v, 0) },
      { label: "Avg Kickoff Distance", value: (t) => av(t, "special_teams_model.avg_kickoff_distance"), format: (v) => fmt(v, 1) },
      { label: "Punt Attempts", value: (t) => av(t, "special_teams_model.punt_attempts"), format: (v) => fmt(v, 0) },
      { label: "Avg Punt Distance", value: (t) => av(t, "special_teams_model.avg_punt_distance"), format: (v) => fmt(v, 1) },
      { label: "Hidden Yards", value: (t) => av(t, "special_teams_model.hidden_yards"), format: (v) => signed(v, 0) },
      { label: "ST Swing Yards", value: (t) => av(t, "special_teams_model.special_teams_swing_yards"), format: (v) => signed(v, 0) },
    ],
    penalties: [
      { label: "Accepted Penalties", value: (t) => av(t, "penalty_advanced.total_accepted"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Penalty Yards", value: (t) => av(t, "penalty_advanced.total_yards"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Penalty Rate", value: (t) => av(t, "penalty_advanced.penalty_rate"), format: pct, higherIsBetter: false },
      { label: "Pre-Snap Rate", value: (t) => av(t, "penalty_advanced.pre_snap_rate"), format: pct, higherIsBetter: false },
      { label: "High Leverage Penalties", value: (t) => av(t, "penalty_advanced.high_leverage_count"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Drive Kills", value: (t) => av(t, "penalty_advanced.drive_kill_count"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Drive Extends", value: (t) => av(t, "penalty_advanced.drive_extend_count"), format: (v) => fmt(v, 0) },
      { label: "Hidden Yards Lost", value: (t) => av(t, "penalty_advanced.hidden_yardage_lost"), format: (v) => fmt(v, 0), higherIsBetter: false },
      { label: "Hidden Yards Gained", value: (t) => av(t, "penalty_advanced.hidden_yardage_gained"), format: (v) => fmt(v, 0) },
    ],
    coaching: [
      { label: "1st Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.1.run_rate"), format: pct },
      { label: "2nd Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.2.run_rate"), format: pct },
      { label: "3rd Down Run Rate", value: (t) => av(t, "coaching_profile.run_pass_by_down.3.run_rate"), format: pct },
      { label: "Obvious Pass Success", value: (t) => av(t, "coaching_profile.obvious_situation_execution.obvious_pass_success_rate"), format: pct },
      { label: "Obvious Run Success", value: (t) => av(t, "coaching_profile.obvious_situation_execution.obvious_run_success_rate"), format: pct },
      { label: "Red Zone Run Rate", value: (t) => av(t, "coaching_profile.red_zone_tendency.run_rate"), format: pct },
      { label: "Halftime Adjustment", value: (t) => av(t, "coaching_profile.halftime_adjustment.adjustment_delta"), format: (v) => signed(v, 3) },
      { label: "Predictability Index", value: (t) => av(t, "coaching_profile.predictability_index"), format: (v) => fmt(v, 3), higherIsBetter: false },
    ],
  };
};

const DataQuality = ({ game }) => {
  const coverage = game.aggregation_coverage ?? {};
  const advanced = game.advanced_coverage ?? {};
  const summary = game.enrichment_summary ?? {};
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
      <Flex align="center" gap={2} mb={3}>
        <Info size={14} color="#E53E3E" />
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Data Quality / Coverage</Text>
      </Flex>
      <Grid templateColumns={{ base: "1fr", lg: "repeat(4, 1fr)" }} gap={3}>
        {[
          ["PBP Schema", coverage.pbp_schema_level],
          ["Play Count", summary.play_count ?? advanced.reconciliation?.play_count],
          ["Drive Count", summary.drive_count ?? advanced.reconciliation?.drive_count],
          ["Advanced Schema", advanced.schema_version],
          ["Computed Groups", (advanced.computed_metric_groups ?? []).length],
          ["Deferred Groups", (advanced.deferred_metric_groups ?? []).join(", ") || "None"],
          ["Unavailable Metrics", (coverage.metrics_unavailable ?? []).join(", ") || "None"],
          ["Mismatch Count", coverage.reconciliation_checks?.team_player_mismatch_count ?? 0],
        ].map(([label, value]) => (
          <Box key={label} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" p={3}>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>{label}</Text>
            <Text fontSize="sm" color="white" fontWeight="black" lineClamp={2}>{String(value ?? "-")}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export const GameTeamStatsPacketContent = ({ game }) => {
  const meta = game.metadata ?? {};
  const teams = [normalizeTeamId(meta.away_team), normalizeTeamId(meta.home_team)].filter(Boolean);
  const rows = buildRows(game);
  const sections = [
    ["Overview", "GOP coverage benchmark: overall production, success, explosiveness, turnovers.", rows.overview],
    ["Expected Points / Production", "EPA streams and WPA scaffolding from the current advanced payload.", rows.production],
    ["Rushing", "Line yards, opportunity, stuff, power, and modeled rushing efficiency.", rows.rushing],
    ["Situational", "Down-and-distance, third/fourth down, early/late down, two-minute splits.", rows.situational],
    ["Drives / Finishing", "Drive quality, field position, scoring, explosive and negative drive rates.", [...rows.drives, ...rows.finishing]],
    ["Defensive", "Stops, havoc, explosives allowed, red-zone defense, pressure/disruption signals.", rows.defense],
    ["Turnovers", "Actual, expected, forced, and turnover luck context.", rows.turnovers],
    ["Special Teams", "Special teams play count, distance, hidden yards, and swing-yard ledger fields.", rows.specialTeams],
    ["Penalties", "Accepted, leverage, hidden yardage, drive kill/extend, and penalty model values.", rows.penalties],
    ["Coaching / Tendencies", "Run-pass shape by down, obvious-situation execution, red-zone tendency, adjustment.", rows.coaching],
  ];

  return (
    <Box bg="bg.primary" pb={10}>
      <Box maxW="1400px" mx="auto">
        <Flex align="center" gap={2} mb={4}>
          <Database size={16} color="#E53E3E" />
          <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Full Team Stat Dump</Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
          {sections.map(([title, subtitle, sectionRows]) => (
            <TableShell key={title} title={title} subtitle={subtitle} rows={sectionRows} teams={teams} />
          ))}
        </Grid>
        <Box mt={4}>
          <DataQuality game={game} />
        </Box>
      </Box>
    </Box>
  );
};

export const GameTeamStatsPacketLab = ({ game }) => (
  <PageShell listContent={<GameTeamStatsPacketContent game={game} />}>
    <PageShell.Slot cols={4}>
      <SharedGameBanner game={game} active="Team Stats" />
    </PageShell.Slot>
  </PageShell>
);
