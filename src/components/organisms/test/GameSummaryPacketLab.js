import { Fragment, useMemo } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Activity, BarChart3, Clock3, Flag, Gauge, Shield, Sparkles, Trophy } from "lucide-react";
import teamsData from "../../../data/teams.json";
import PageShell from "../../layouts/PageShell";

/**
 * GameSummaryPacketLab
 *
 * PHILOSOPHY:
 *   Purpose: Audition the Game Summary tab as an editorial analytics packet.
 *   Grid slot: Full page lab route, not a production PageShell child yet.
 *
 * CONTENT TIERS:
 *   Essential: final score, teams, summary tabs, core team metrics, game flow, leaders.
 *   Nice-to-have: hidden edges, why-it-happened signals, scoring timeline, drive ledger.
 *   Drop later at mobile: detailed row text, secondary labels, decorative watermarks.
 *
 * TYPOGRAPHY SCALING:
 *   Hero team names/scores use clamp().
 *   Panel labels stay compact uppercase.
 *   Dense metric text uses fixed semantic sizes for scanability.
 *
 * COMPONENT SIZING:
 *   Full-width route with bounded max width.
 *   Internal cards use CSS grid, minmax(0, 1fr), and flexible rows.
 *   No hardcoded root height.
 */

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? null;
const getTeamLabel = (id) => getTeam(id)?.shortName ?? String(id ?? "TEAM").toUpperCase();
const getTeamName = (id) => getTeam(id)?.name ?? getTeamLabel(id);
const getTeamLogo = (id) => getTeam(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id)?.colors?.primary ?? fallback;

const fmt = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Math.round(Number(value) * 100)}%`;
};

const signed = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const next = Number(value);
  return `${next > 0 ? "+" : ""}${next.toFixed(digits)}`;
};

const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((part) => part.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : String(name);
};

const readableResult = (result) => String(result ?? "Drive").replace(/([a-z])([A-Z])/g, "$1 $2");

const yardsPerPlay = (box) => {
  const plays = Number(box?.plays_offense) || 0;
  return plays ? Number(box.total_yards ?? 0) / plays : null;
};

const grade = (value, bands, higherIsBetter = true) => {
  if (value == null || Number.isNaN(Number(value))) return { label: "N/A", color: "#A1A1AA", note: "missing" };
  const v = Number(value);
  const ordered = higherIsBetter ? bands : [...bands].reverse();
  const hit = ordered.find((band) => (higherIsBetter ? v >= band.min : v <= band.max));
  return hit ?? { label: "C", color: "#A1A1AA", note: "average" };
};

const rateGrade = (value) =>
  grade(value, [
    { min: 0.55, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.45, label: "B", color: "#68D391", note: "strong" },
    { min: 0.35, label: "C", color: "#ECC94B", note: "solid" },
    { min: 0.25, label: "D", color: "#F6AD55", note: "thin" },
  ]);

const epaGrade = (value) =>
  grade(value, [
    { min: 0.18, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.08, label: "B", color: "#68D391", note: "strong" },
    { min: 0, label: "C", color: "#ECC94B", note: "neutral" },
    { min: -0.12, label: "D", color: "#F6AD55", note: "drag" },
  ]);

const deriveQuarterScores = (plays, awayId, homeId) => {
  const rows = [1, 2, 3, 4].map((quarter) => ({ quarter, away: 0, home: 0 }));
  (plays ?? []).forEach((play) => {
    if (!play?.scoring_event || !play?.scoring_points) return;
    const target = rows.find((row) => row.quarter === Number(play.quarter));
    if (!target) return;
    if (play.offense_team === awayId) target.away += Number(play.scoring_points) || 0;
    if (play.offense_team === homeId) target.home += Number(play.scoring_points) || 0;
  });
  return rows;
};

const buildModel = (game) => {
  const meta = game?.metadata ?? {};
  // Handle both string IDs and object formats
  const awayId = typeof meta.away_team === 'string' ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === 'string' ? meta.home_team : meta.home_team?.id;
  const plays = game?.play_by_play ?? [];
  const drives = game?.drive_summary ?? [];

  const scoring = plays
    .filter((play) => play.scoring_event)
    .map((play) => ({
      quarter: play.quarter,
      clock: play.clock,
      team: play.offense_team,
      type: play.scoring_type,
      points: play.scoring_points,
      awayScore: play.score_away_after,
      homeScore: play.score_home_after,
      text: play.raw_text,
    }));

  const keyPlays = plays
    .filter((play) => play.epa?.epa != null)
    .sort((a, b) => Math.abs(b.epa.epa) - Math.abs(a.epa.epa))
    .slice(0, 5);

  const productionLeaders = Object.fromEntries(
    Object.entries(game?.production_scores ?? {}).map(([teamId, players]) => [
      teamId,
      [...(players ?? [])].sort((a, b) => Number(b.production_total ?? 0) - Number(a.production_total ?? 0)).slice(0, 4),
    ]),
  );

  const teams = [awayId, homeId].filter(Boolean).map((teamId) => ({
    id: teamId,
    label: getTeamLabel(teamId),
    name: getTeamName(teamId),
    color: getTeamColor(teamId),
    score: teamId === awayId ? meta.away_team?.score : meta.home_team?.score,
    box: game?.team_box?.[teamId] ?? {},
    advanced: game?.advanced_team?.[teamId] ?? {},
    specialTeams: game?.special_teams_advanced?.[teamId] ?? {},
    penalties: game?.penalty_advanced?.[teamId] ?? {},
    sequence: game?.sequence_model?.[teamId] ?? {},
    defense: game?.defensive_identity?.[teamId] ?? {},
    pressure: game?.pressure_profile?.[teamId] ?? {},
    production: productionLeaders[teamId] ?? [],
  }));

  return {
    meta,
    awayId,
    homeId,
    teams,
    plays,
    drives,
    scoring,
    keyPlays,
    quarterScores: deriveQuarterScores(plays, awayId, homeId),
  };
};

const Panel = ({ children, accent = "#E53E3E", minH, p = 4 }) => (
  <Box
    w="full"
    h="full"
    bg="rgba(20,20,22,0.96)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
    minH={minH}
  >
    <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${accent}12 0%, transparent 46%)`} pointerEvents="none" />
    <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent} />
    <Box position="relative" zIndex={1} p={p}>
      {children}
    </Box>
  </Box>
);

const Kicker = ({ icon: Icon, children, color = "#E53E3E" }) => (
  <Flex align="center" gap={2} mb={3}>
    {Icon && <Icon size={14} color={color} />}
    <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.16em">
      {children}
    </Text>
  </Flex>
);

const TabRail = () => {
  const tabs = ["Game Summary", "Box Score", "Play By Play", "Team Stats"];
  return (
    <Flex gap={2} wrap="wrap">
      {tabs.map((tab, index) => (
        <Box
          key={tab}
          px={3}
          py={2}
          border="1px solid"
          borderColor={index === 0 ? "brand.500" : "whiteAlpha.100"}
          bg={index === 0 ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}
        >
          <Text fontSize="10px" fontWeight="black" color={index === 0 ? "white" : "text.muted"} textTransform="uppercase" letterSpacing="0.12em">
            {tab}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

// eslint-disable-next-line no-unused-vars
const Hero = ({ model }) => {
  const away = model.teams[0];
  const home = model.teams[1];
  const winner = away?.score > home?.score ? away : home;

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" bg="#08080A" border="1px solid" borderColor="whiteAlpha.100">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${away?.color ?? "#222"}55 0%, #08080A 34%, #08080A 66%, ${home?.color ?? "#222"}55 100%)`} />
      <Text
        position="absolute"
        left="50%"
        top="-7%"
        transform="translateX(-50%)"
        fontSize="clamp(4.5rem, 13vw, 11rem)"
        lineHeight={0.8}
        fontWeight="black"
        color="whiteAlpha.100"
        textTransform="uppercase"
        whiteSpace="nowrap"
      >
        Final
      </Text>
      <Grid position="relative" zIndex={1} templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 190px minmax(0, 1fr)" }} gap={6} alignItems="center" p={{ base: 5, lg: 8 }}>
        {[away].map((team) => (
          <Flex key={team?.id} direction="row" align="center" gap={4} minW={0}>
            <Image src={getTeamLogo(team?.id)} alt="" h="clamp(56px, 8vw, 104px)" maxW="120px" objectFit="contain" opacity={0.95} />
            <Box textAlign="left" minW={0}>
              <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
                Away
              </Text>
              <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">
                {team?.label}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>
                {team?.name}
              </Text>
            </Box>
            <Text fontSize="clamp(3.2rem, 8vw, 7rem)" color="white" fontWeight="black" lineHeight={0.85} ml="auto">
              {team?.score ?? 0}
            </Text>
          </Flex>
        ))}

        <Flex direction="column" align="center" gap={3} minW={{ base: "100%", lg: "190px" }}>
          <Box px={3} py={1} bg="brand.500">
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              Final
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase" textAlign="center">
            {winner?.label} by {Math.abs(Number(away?.score ?? 0) - Number(home?.score ?? 0))}
          </Text>
          <Text fontSize="10px" color="whiteAlpha.600" textAlign="center" lineClamp={2}>
            {model.meta.date} | {model.meta.site}
          </Text>
        </Flex>

        {[home].map((team) => (
          <Flex key={team?.id} direction="row-reverse" align="center" gap={4} minW={0}>
            <Image src={getTeamLogo(team?.id)} alt="" h="clamp(56px, 8vw, 104px)" maxW="120px" objectFit="contain" opacity={0.95} />
            <Box textAlign="right" minW={0}>
              <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
                Home
              </Text>
              <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">
                {team?.label}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>
                {team?.name}
              </Text>
            </Box>
            <Text fontSize="clamp(3.2rem, 8vw, 7rem)" color="white" fontWeight="black" lineHeight={0.85} mr="auto">
              {team?.score ?? 0}
            </Text>
          </Flex>
        ))}
      </Grid>
      <Flex position="relative" zIndex={1} justify="space-between" align="center" gap={4} px={{ base: 5, lg: 8 }} pb={5} wrap="wrap">
        <TabRail />
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">
          Attendance {model.meta.attendance?.toLocaleString?.() ?? "-"} | Kick {model.meta.kickoff_time ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
};

const QuarterStrip = ({ model }) => (
  <Panel accent="#F56565" p={3}>
    <Kicker icon={Clock3}>Quarter Scoring</Kicker>
    <Grid templateColumns="1.2fr repeat(4, 1fr) 1fr" gap={2} alignItems="center" mb={3}>
      <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">Team</Text>
      {[1, 2, 3, 4].map((q) => (
        <Text key={q} fontSize="10px" color="text.muted" fontWeight="black" textAlign="center">Q{q}</Text>
      ))}
      <Text fontSize="10px" color="text.muted" fontWeight="black" textAlign="right">Final</Text>
      {model.teams.map((team) => (
        <Fragment key={team.id}>
          <Text key={`${team.id}-label`} fontSize="sm" color="white" fontWeight="black">{team.label}</Text>
          {model.quarterScores.map((row) => (
            <Text key={`${team.id}-${row.quarter}`} fontSize="sm" color="text.secondary" fontWeight="black" textAlign="center">
              {team.id === model.awayId ? row.away : row.home}
            </Text>
          ))}
          <Text key={`${team.id}-final`} fontSize="lg" color="white" fontWeight="black" textAlign="right">{team.score}</Text>
        </Fragment>
      ))}
    </Grid>
    <Box borderTop="1px solid" borderColor="whiteAlpha.100" pt={3}>
      <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" mb={1}>
        Read
      </Text>
      <Text fontSize="xs" color="text.secondary" lineClamp={3}>
        Keep this compact unless quarters gain drive-level context, lead-change markers, or scoring-run annotations.
      </Text>
    </Box>
  </Panel>
);

const metricRows = (away, home) => [
  {
    label: "EPA/Play",
    away: away.advanced.epa_per_play,
    home: home.advanced.epa_per_play,
    format: (v) => signed(v, 2),
    context: epaGrade,
  },
  {
    label: "Success Rate",
    away: away.advanced.success_rate,
    home: home.advanced.success_rate,
    format: pct,
    context: rateGrade,
  },
  {
    label: "Yards/Play",
    away: yardsPerPlay(away.box),
    home: yardsPerPlay(home.box),
    format: (v) => fmt(v, 2),
    context: (v) => grade(v, [
      { min: 6, label: "A", color: "#48BB78", note: "explosive" },
      { min: 5, label: "B", color: "#68D391", note: "efficient" },
      { min: 4, label: "C", color: "#ECC94B", note: "workable" },
      { min: 3, label: "D", color: "#F6AD55", note: "stalled" },
    ]),
  },
  {
    label: "Pass Yds/Att",
    away: away.box.yards_per_pass_attempt,
    home: home.box.yards_per_pass_attempt,
    format: (v) => fmt(v, 2),
    context: (v) => grade(v, [
      { min: 9, label: "A", color: "#48BB78", note: "vertical" },
      { min: 7, label: "B", color: "#68D391", note: "strong" },
      { min: 5.5, label: "C", color: "#ECC94B", note: "steady" },
      { min: 4, label: "D", color: "#F6AD55", note: "limited" },
    ]),
  },
  {
    label: "Rush Yds/Carry",
    away: away.box.yards_per_carry,
    home: home.box.yards_per_carry,
    format: (v) => fmt(v, 2),
    context: (v) => grade(v, [
      { min: 5.5, label: "A", color: "#48BB78", note: "gashed" },
      { min: 4.5, label: "B", color: "#68D391", note: "good" },
      { min: 3.5, label: "C", color: "#ECC94B", note: "fine" },
      { min: 2.5, label: "D", color: "#F6AD55", note: "boxed" },
    ]),
  },
  {
    label: "Explosive Play Rate",
    away: away.advanced.explosive_rate_yardage,
    home: home.advanced.explosive_rate_yardage,
    format: pct,
    context: (v) => grade(v, [
      { min: 0.14, label: "A", color: "#48BB78", note: "danger" },
      { min: 0.1, label: "B", color: "#68D391", note: "pops" },
      { min: 0.06, label: "C", color: "#ECC94B", note: "some" },
      { min: 0.03, label: "D", color: "#F6AD55", note: "flat" },
    ]),
  },
  {
    label: "3rd Down Success",
    away: away.box.third_down_conversion_rate,
    home: home.box.third_down_conversion_rate,
    format: pct,
    context: rateGrade,
  },
  {
    label: "Red Zone Points/Opp",
    away: away.advanced.red_zone_points_per_opportunity,
    home: home.advanced.red_zone_points_per_opportunity,
    format: (v) => fmt(v, 1),
    context: (v) => grade(v, [
      { min: 5, label: "A", color: "#48BB78", note: "finisher" },
      { min: 4, label: "B", color: "#68D391", note: "good" },
      { min: 3, label: "C", color: "#ECC94B", note: "mixed" },
      { min: 2, label: "D", color: "#F6AD55", note: "settled" },
    ]),
  },
  {
    label: "Def Run Stuff Rate",
    away: away.advanced.stuff_rate,
    home: home.advanced.stuff_rate,
    format: pct,
    context: (v) => grade(v, [
      { min: 0.28, label: "A", color: "#48BB78", note: "wall" },
      { min: 0.22, label: "B", color: "#68D391", note: "stout" },
      { min: 0.16, label: "C", color: "#ECC94B", note: "normal" },
      { min: 0.1, label: "D", color: "#F6AD55", note: "soft" },
    ]),
  },
  {
    label: "Havoc Rate",
    away: away.advanced.havoc_rate_forced,
    home: home.advanced.havoc_rate_forced,
    format: pct,
    context: (v) => grade(v, [
      { min: 0.2, label: "A", color: "#48BB78", note: "chaos" },
      { min: 0.15, label: "B", color: "#68D391", note: "active" },
      { min: 0.1, label: "C", color: "#ECC94B", note: "present" },
      { min: 0.06, label: "D", color: "#F6AD55", note: "quiet" },
    ]),
  },
  {
    label: "Points/Drive",
    away: away.box.points_per_drive,
    home: home.box.points_per_drive,
    format: (v) => fmt(v, 1),
    context: (v) => grade(v, [
      { min: 3, label: "A", color: "#48BB78", note: "cash" },
      { min: 2.3, label: "B", color: "#68D391", note: "good" },
      { min: 1.6, label: "C", color: "#ECC94B", note: "work" },
      { min: 1, label: "D", color: "#F6AD55", note: "low" },
    ]),
  },
];

const GradePill = ({ item }) => (
  <Box px={1.5} py={0.5} bg={`${item.color}22`} border="1px solid" borderColor={`${item.color}88`} minW="30px" textAlign="center">
    <Text fontSize="9px" color={item.color} fontWeight="black">{item.label}</Text>
  </Box>
);

const TeamMetrics = ({ model }) => {
  const away = model.teams[0];
  const home = model.teams[1];
  const rows = metricRows(away, home);
  return (
    <Panel accent="#F56565" minH="100%" p={3}>
      <Kicker icon={Gauge}>Team Metrics</Kicker>
      <Grid templateColumns="1.4fr 1fr 34px 1fr 34px" gap={2} alignItems="center">
        <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Overall</Text>
        <Text fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase">{away.label}</Text>
        <Box />
        <Text fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase">{home.label}</Text>
        <Box />
        {rows.map((row) => {
          const awayGrade = row.context(row.away);
          const homeGrade = row.context(row.home);
          return (
            <Fragment key={row.label}>
              <Text fontSize="10px" color="text.secondary" fontWeight="black" lineClamp={1}>{row.label}</Text>
              <Text fontSize="11px" color="white" fontWeight="black" textAlign="right">{row.format(row.away)}</Text>
              <GradePill item={awayGrade} />
              <Text fontSize="11px" color="white" fontWeight="black" textAlign="right">{row.format(row.home)}</Text>
              <GradePill item={homeGrade} />
            </Fragment>
          );
        })}
      </Grid>
      <Text fontSize="9px" color="text.muted" mt={3}>
        Grade pills are frontend placeholders until the pipeline ships true percentile context.
      </Text>
    </Panel>
  );
};

const HiddenEdges = ({ model }) => (
  <Panel accent="#ECC94B" minH="100%">
    <Kicker icon={Flag} color="#ECC94B">Hidden Edges</Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} bg="whiteAlpha.50" p={3} border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2} mb={3}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="sm" color="white" fontWeight="black">{team.label}</Text>
          </Flex>
          {[
            {
              label: "Avg Start",
              value: fmt(team.box.avg_start_field_position, 1),
              context: grade(team.box.avg_start_field_position, [
                { min: 35, label: "A", color: "#48BB78", note: "short field" },
                { min: 30, label: "B", color: "#68D391", note: "plus" },
                { min: 25, label: "C", color: "#ECC94B", note: "normal" },
                { min: 20, label: "D", color: "#F6AD55", note: "backed up" },
              ]),
            },
            {
              label: "Long Field",
              value: pct(team.box.long_field_rate),
              context: grade(team.box.long_field_rate, [
                { max: 0.35, label: "A", color: "#48BB78", note: "helped" },
                { max: 0.5, label: "B", color: "#68D391", note: "ok" },
                { max: 0.7, label: "C", color: "#ECC94B", note: "work" },
                { max: 0.86, label: "D", color: "#F6AD55", note: "long" },
              ], false),
            },
            {
              label: "ST Swing",
              value: signed(team.specialTeams.summary?.st_swing_yards, 0),
              context: grade(team.specialTeams.summary?.st_swing_yards, [
                { min: 20, label: "A", color: "#48BB78", note: "won edge" },
                { min: 5, label: "B", color: "#68D391", note: "plus" },
                { min: -5, label: "C", color: "#ECC94B", note: "even" },
                { min: -20, label: "D", color: "#F6AD55", note: "lost" },
              ]),
            },
            {
              label: "Penalty Cost",
              value: fmt(team.specialTeams.summary?.penalty_yards_cost ?? team.penalties.total_yards, 0),
              context: grade(team.specialTeams.summary?.penalty_yards_cost ?? team.penalties.total_yards, [
                { max: 0, label: "A", color: "#48BB78", note: "clean" },
                { max: 20, label: "B", color: "#68D391", note: "low" },
                { max: 45, label: "C", color: "#ECC94B", note: "tax" },
                { max: 70, label: "D", color: "#F6AD55", note: "costly" },
              ], false),
            },
            {
              label: "Turnover Luck",
              value: signed(team.advanced.turnover_luck, 1),
              context: grade(team.advanced.turnover_luck, [
                { min: 1.5, label: "A", color: "#48BB78", note: "favored" },
                { min: 0.5, label: "B", color: "#68D391", note: "plus" },
                { min: -0.5, label: "C", color: "#ECC94B", note: "even" },
                { min: -2, label: "D", color: "#F6AD55", note: "hurt" },
              ]),
            },
          ].map((item) => (
            <Flex key={item.label} justify="space-between" py={1.5} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Box>
                <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">{item.label}</Text>
                <Text fontSize="8px" color={item.context.color} fontWeight="black" textTransform="uppercase">{item.context.note}</Text>
              </Box>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="white" fontWeight="black">{item.value}</Text>
                <GradePill item={item.context} />
              </Flex>
            </Flex>
          ))}
        </Box>
      ))}
    </Grid>
  </Panel>
);

const ImpactLeaders = ({ model }) => (
  <Panel accent="#48BB78" minH="100%">
    <Kicker icon={Trophy} color="#48BB78">Impact Leaders</Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} minW={0}>
          <Flex align="center" gap={2} mb={2}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="sm" color="white" fontWeight="black">{team.label}</Text>
          </Flex>
          <Flex direction="column" gap={2}>
            {team.production.slice(0, 4).map((player, index) => (
              <Flex key={`${team.id}-${player.player_key}`} align="center" gap={2} p={2} bg={index === 0 ? `${team.color}22` : "whiteAlpha.50"} border="1px solid" borderColor="whiteAlpha.100">
                <Box w="3px" alignSelf="stretch" bg={team.color} />
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>{cleanName(player.name)}</Text>
                  <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">{player.position}</Text>
                </Box>
                <Text fontSize="sm" color="white" fontWeight="black">{fmt(player.production_total, 1)}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      ))}
    </Grid>
  </Panel>
);

const RawStats = ({ model }) => (
  <Panel accent="#A0AEC0" p={3}>
    <Kicker icon={BarChart3} color="#A0AEC0">Raw Team Stats</Kicker>
    <Grid templateColumns="1.3fr 1fr 1fr" gap={2} alignItems="center">
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Stat</Text>
      {model.teams.map((team) => (
        <Text key={team.id} fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase">{team.label}</Text>
      ))}
      {[
        ["Total Yards", "total_yards"],
        ["Pass", "pass_yards"],
        ["Rush", "rush_yards"],
        ["Plays", "plays_offense"],
        ["Turnovers", "turnovers_committed"],
        ["Sacks Made", "sacks_made"],
        ["3rd Down", "third_down_conversions", "third_down_attempts"],
        ["4th Down", "fourth_down_go_conversions", "fourth_down_goes"],
      ].map(([label, key, attempts]) => (
        <Fragment key={label}>
          <Text fontSize="10px" color="text.secondary" fontWeight="black">{label}</Text>
          {model.teams.map((team) => (
            <Text key={`${team.id}-${label}`} fontSize="11px" color="white" fontWeight="black" textAlign="right">
              {attempts ? `${team.box[key] ?? 0}/${team.box[attempts] ?? 0}` : fmt(team.box[key], 0)}
            </Text>
          ))}
        </Fragment>
      ))}
    </Grid>
  </Panel>
);

const StandingsContext = ({ model }) => (
  <Panel accent="#63B3ED" p={3}>
    <Kicker icon={Flag} color="#63B3ED">Bigger Picture</Kicker>
    <Flex direction="column" gap={3}>
      <Text fontSize="sm" color="white" fontWeight="black" lineHeight={1.25}>
        Standings context should live here once the game-detail payload includes a game-week snapshot.
      </Text>
      {model.teams.map((team) => (
        <Flex key={team.id} align="center" justify="space-between" bg="whiteAlpha.50" p={2} border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="xs" color="white" fontWeight="black">{team.name}</Text>
          </Flex>
          <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">snapshot pending</Text>
        </Flex>
      ))}
    </Flex>
  </Panel>
);

const ScoringTimeline = ({ model }) => (
  <Panel accent="#63B3ED" minH="100%">
    <Kicker icon={Activity} color="#63B3ED">Game Flow Capsule</Kicker>
    <Flex direction="column" gap={2}>
      {model.scoring.slice(0, 10).map((play, index) => (
        <Grid key={`${play.quarter}-${play.clock}-${index}`} templateColumns="58px 1fr auto" gap={3} alignItems="center" py={2} borderTop={index === 0 ? "0" : "1px solid"} borderColor="whiteAlpha.100">
          <Box>
            <Text fontSize="10px" color="text.muted" fontWeight="black">Q{play.quarter}</Text>
            <Text fontSize="10px" color="text.secondary">{play.clock}</Text>
          </Box>
          <Box minW={0}>
            <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>
              {getTeamLabel(play.team)} {play.type} | {play.points} pts
            </Text>
            <Text fontSize="10px" color="text.muted" lineClamp={1}>{play.text}</Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black">{play.awayScore}-{play.homeScore}</Text>
        </Grid>
      ))}
    </Flex>
  </Panel>
);

const KeyPlays = ({ model }) => (
  <Panel accent="#F6AD55" minH="100%">
    <Kicker icon={Sparkles} color="#F6AD55">Top EPA Swings</Kicker>
    <Flex direction="column" gap={2}>
      {model.keyPlays.map((play, index) => (
        <Box key={play.play_id ?? index} p={3} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="10px" color="text.muted" fontWeight="black">Q{play.quarter} {play.clock} | {getTeamLabel(play.offense_team)}</Text>
            <Text fontSize="sm" color={play.epa.epa >= 0 ? "#48BB78" : "#F56565"} fontWeight="black">{signed(play.epa.epa, 2)} EPA</Text>
          </Flex>
          <Text fontSize="xs" color="text.secondary" lineClamp={2}>{play.raw_text}</Text>
        </Box>
      ))}
    </Flex>
  </Panel>
);

const WhyItHappened = ({ model }) => (
  <Panel accent="#9F7AEA" minH="100%">
    <Kicker icon={Shield} color="#9F7AEA">Why It Happened</Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} bg="whiteAlpha.50" p={3} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="white" fontWeight="black" mb={2}>{team.label}</Text>
          {[
            ["Disruption", pct(team.defense.disruption_rate)],
            ["Explosive Prev", pct(team.defense.explosive_prevention_rate)],
            ["Pressure", pct(team.pressure.pressure_rate_forced)],
            ["Q4 Lead Takes", fmt(team.sequence.q4_lead_takes, 0)],
            ["Consec Scores", fmt(team.sequence.max_consecutive_scoring_drives, 0)],
          ].map(([label, value]) => (
            <Flex key={label} justify="space-between" py={1.5} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">{label}</Text>
              <Text fontSize="sm" color="white" fontWeight="black">{value}</Text>
            </Flex>
          ))}
        </Box>
      ))}
    </Grid>
  </Panel>
);

const DriveLedger = ({ model }) => (
  <Panel accent="#CBD5E0" p={3}>
    <Kicker icon={BarChart3} color="#CBD5E0">All Drives Ledger</Kicker>
    <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={2}>
      {model.drives.map((drive, index) => {
        const color = getTeamColor(drive.offense_team, "#CBD5E0");
        const scored = Number(drive.points) > 0;
        return (
          <Box key={drive.drive_id ?? index} bg={scored ? `${color}33` : "whiteAlpha.50"} border="1px solid" borderColor={scored ? color : "whiteAlpha.100"} p={2} minH="74px">
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontSize="9px" color="text.muted" fontWeight="black">D{index + 1}</Text>
              <Text fontSize="9px" color="white" fontWeight="black">{getTeamLabel(drive.offense_team)}</Text>
            </Flex>
            <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>{readableResult(drive.result)}</Text>
            <Text fontSize="10px" color="text.muted" lineClamp={1}>{drive.plays_total} plays | {drive.yards_net} yds</Text>
            <Text fontSize="10px" color={scored ? "white" : "text.muted"} fontWeight="black">{drive.points} pts</Text>
          </Box>
        );
      })}
    </Grid>
  </Panel>
);

export const GameSummaryPacketContent = ({ game, includeBanner = false, embedded = false }) => {
  const model = useMemo(() => buildModel(game), [game]);

  const slots = (
    <>
      <PageShell.Slot cols={2} rows={2}>
        <TeamMetrics model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <QuarterStrip model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <RawStats model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <HiddenEdges model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1}>
        <StandingsContext model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={2} rows={2}>
        <ImpactLeaders model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={2} rows={2}>
        <ScoringTimeline model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1} rows={2}>
        <KeyPlays model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={1} rows={2}>
        <WhyItHappened model={model} />
      </PageShell.Slot>
      <PageShell.Slot cols={4} rows={2}>
        <DriveLedger model={model} />
      </PageShell.Slot>
    </>
  );

  if (embedded) return slots;
  return <PageShell>{slots}</PageShell>;
};

export const GameSummaryPacketLab = ({ game }) => (
  <GameSummaryPacketContent game={game}  />
);
