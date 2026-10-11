import { useState, useMemo } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import teamsData from "../../../data/teams.json";

/**
 * GamePageMagazine
 *
 * PHILOSOPHY:
 *   Purpose: Full game deep-dive with tiered data hierarchy.
 *   All 20+ data sections visible on a single scrollable page.
 *   No tabs. No hidden content. Every data bit surfaced.
 *
 * CONTENT TIERS:
 *   Tier 1 — The Story: scoreboard, scoring timeline, key moments
 *   Tier 2 — The Battle: team metrics, drive efficiency, field position, red zone, 3rd down
 *   Tier 3 — The Players: passing duel, rushing, receiving, defense, glory MVP
 *   Tier 4 — The Strategy: coaching tendencies, defensive identity, heat maps, sequence
 *   Tier 5 — The Details: special teams, penalties, hidden yardage, officials
 *   Tier 6 — The Raw Feed: play-by-play, drive log, full box score tables
 *
 * TYPOGRAPHY SCALING:
 *   Hero numbers: clamp(2.5rem, 6vw, 4rem)
 *   Section titles: clamp(1.2rem, 3vw, 1.8rem)
 *   Card labels: 9px uppercase
 *   Body: 11px–13px
 */

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? null;
const getTeamLabel = (id) => getTeam(id)?.shortName ?? id?.toUpperCase() ?? "—";
const getTeamLogo = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;

const fmt = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));
const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((s) => s.trim());
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  return name;
};

/* ─── Shared Components ─── */

const SectionLabel = ({ label, color = "brand.500" }) => (
  <Flex align="center" gap={2} mb={2}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} />
    <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
      {label}
    </Text>
  </Flex>
);

const CardShell = ({ children, accent = "#E53E3E", p = 4 }) => (
  <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative">
    <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent} />
    <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${accent}08 0%, transparent 50%)`} pointerEvents="none" />
    <Box position="relative" zIndex={1} p={p} h="full">
      {children}
    </Box>
  </Box>
);

const CollapsibleSection = ({ title, kicker, count, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" mb={4}>
      <Flex
        align="center" justify="space-between" px={5} py={4}
        borderBottom={collapsed ? "none" : "1px solid"} borderColor="whiteAlpha.100"
        bg="linear-gradient(90deg, rgba(229,62,62,0.06) 0%, transparent 60%)"
        cursor="pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Box>
          <Text fontSize="9px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="widest">{kicker}</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{title}</Text>
        </Box>
        <Flex align="center" gap={3}>
          {count != null && <Text fontSize="10px" color="text.muted" textTransform="uppercase">{count} items</Text>}
          <Box w="28px" h="28px" borderRadius="full" border="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50" display="flex" alignItems="center" justifyContent="center">
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Box>
        </Flex>
      </Flex>
      {!collapsed && <Box p={4}>{children}</Box>}
    </Box>
  );
};

/* ─── Tier 1: The Story ─── */

const ScoreboardBanner = ({ meta, awayTeam, homeTeam }) => {
  const away = meta?.away_team ?? {};
  const home = meta?.home_team ?? {};
  const awayColor = awayTeam?.colors?.primary ?? "#1A365D";
  const homeColor = homeTeam?.colors?.primary ?? "#1A365D";

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" borderRadius="xl">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}44 0%, #0B0B0D 35%, #0B0B0D 65%, ${homeColor}44 100%)`} />
      <Flex position="relative" zIndex={1} h="full" align="center" justify="space-between" px={{ base: 4, lg: 8 }} py={4}>
        {/* Away */}
        <Flex align="center" gap={4} flex={1}>
          <Image src={getTeamLogo(away.id)} alt="" h="clamp(3rem, 6vw, 5rem)" objectFit="contain" />
          <Box>
            <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">Away</Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2rem)" fontWeight="black" color="white" lineClamp={1}>{getTeamLabel(away.id)}</Text>
          </Box>
          <Text fontSize="clamp(2.5rem, 6vw, 4rem)" fontWeight="black" color="white" ml="auto">{away.score ?? 0}</Text>
        </Flex>

        {/* Center */}
        <Flex direction="column" align="center" px={{ base: 4, lg: 8 }} flexShrink={0}>
          <Text fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase">Final</Text>
          <Text fontSize="xs" color="whiteAlpha.600" mt={1}>{meta?.date}</Text>
          <Text fontSize="10px" color="whiteAlpha.400" textAlign="center" maxW="140px" lineClamp={2}>{meta?.site}</Text>
          {meta?.attendance && <Text fontSize="9px" color="whiteAlpha.400" mt={0.5}>{meta.attendance.toLocaleString()} Attendance</Text>}
        </Flex>

        {/* Home */}
        <Flex align="center" gap={4} flex={1} direction="row-reverse">
          <Image src={getTeamLogo(home.id)} alt="" h="clamp(3rem, 6vw, 5rem)" objectFit="contain" />
          <Box textAlign="right">
            <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">Home</Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2rem)" fontWeight="black" color="white" lineClamp={1}>{getTeamLabel(home.id)}</Text>
          </Box>
          <Text fontSize="clamp(2.5rem, 6vw, 4rem)" fontWeight="black" color="white" mr="auto">{home.score ?? 0}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

const ScoringTimeline = ({ plays, awayId, homeId }) => {
  const scoring = useMemo(() => {
    return (plays ?? [])
      .filter((p) => p.scoring_event === true)
      .map((p) => ({
        quarter: p.quarter,
        clock: p.clock,
        type: p.scoring_type,
        awayScore: p.score_away_after,
        homeScore: p.score_home_after,
        team: p.offense_team,
        text: p.raw_text?.slice(0, 80) + "...",
      }));
  }, [plays]);

  if (!scoring.length) return <Text color="text.muted" fontSize="sm">No scoring data.</Text>;

  return (
    <Flex direction="column" gap={3}>
      {scoring.map((s, i) => {
        const isAway = s.team === awayId;
        const color = isAway ? getTeam(awayId)?.colors?.primary : getTeam(homeId)?.colors?.primary;
        return (
          <Flex key={i} align="center" gap={3}>
            <Box w="3px" h="full" minH="40px" bg={color} borderRadius="full" />
            <Box flex={1}>
              <Flex align="center" gap={2}>
                <Text fontSize="10px" fontWeight="black" color="text.muted">Q{s.quarter} {s.clock}</Text>
                <Text fontSize="10px" fontWeight="bold" color={color} textTransform="uppercase">{s.type}</Text>
              </Flex>
              <Text fontSize="xs" color="text.primary" lineClamp={1}>{s.text}</Text>
            </Box>
            <Text fontSize="sm" fontWeight="black" color="text.primary">
              {s.awayScore} – {s.homeScore}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

const KeyMoments = ({ plays }) => {
  const moments = useMemo(() => {
    return (plays ?? [])
      .filter((p) => p.epa && p.epa.epa != null)
      .sort((a, b) => Math.abs(b.epa.epa) - Math.abs(a.epa.epa))
      .slice(0, 5)
      .map((p) => ({
        quarter: p.quarter,
        clock: p.clock,
        epa: p.epa.epa,
        text: p.raw_text?.slice(0, 100) + "...",
      }));
  }, [plays]);

  if (!moments.length) return <Text color="text.muted" fontSize="sm">No EPA data available.</Text>;

  return (
    <Flex direction="column" gap={3}>
      {moments.map((m, i) => (
        <Box key={i} p={3} bg="whiteAlpha.50" borderRadius="lg">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="10px" fontWeight="black" color="text.muted">Q{m.quarter} {m.clock}</Text>
            <Text fontSize="sm" fontWeight="black" color={m.epa > 0 ? "#48BB78" : "#F56565"}>
              EPA {m.epa > 0 ? "+" : ""}{fmt(m.epa, 2)}
            </Text>
          </Flex>
          <Text fontSize="xs" color="text.primary" lineClamp={2}>{m.text}</Text>
        </Box>
      ))}
    </Flex>
  );
};

/* ─── Tier 2: The Battle ─── */

const DualBar = ({ label, awayVal, homeVal, awayColor, homeColor, format, lowerIsBetter }) => {
  const f = format ?? ((v) => fmt(v, 1));
  const total = (Number(awayVal) || 0) + (Number(homeVal) || 0);
  const awayPct = total > 0 ? ((Number(awayVal) || 0) / total) * 100 : 50;
  const awayWins = awayVal != null && homeVal != null
    ? lowerIsBetter ? awayVal <= homeVal : awayVal >= homeVal
    : null;

  return (
    <Box py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
      <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center" mb={1.5}>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === true ? "text.primary" : "text.muted"} textAlign="left">
          {f(awayVal)}
        </Text>
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" textAlign="center" minW="90px">{label}</Text>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === false ? "text.primary" : "text.muted"} textAlign="right">
          {f(homeVal)}
        </Text>
      </Grid>
      <Flex h="4px" borderRadius="full" overflow="hidden">
        <Box flex={`0 0 ${awayPct}%`} bg={awayWins !== false ? awayColor : "whiteAlpha.100"} />
        <Box flex={`0 0 ${100 - awayPct}%`} bg={awayWins === false ? homeColor : "whiteAlpha.100"} />
      </Flex>
    </Box>
  );
};

const TeamMetricsFaceOff = ({ awayId, homeId, advancedTeam }) => {
  const a = advancedTeam[awayId] ?? {};
  const h = advancedTeam[homeId] ?? {};
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";
  const homeColor = getTeam(homeId)?.colors?.primary ?? "#E53E3E";

  const metrics = [
    { label: "EPA / Play", ak: "epa_per_play", dec: 3 },
    { label: "Success Rate", ak: "success_rate", format: pct },
    { label: "Explosive Rate", ak: "explosive_rate_yardage", format: pct },
    { label: "Havoc Rate Forced", ak: "havoc_rate_forced", format: pct },
    { label: "Havoc Rate Allowed", ak: "havoc_rate_allowed", format: pct, lowerIsBetter: true },
    { label: "Stuff Rate", ak: "stuff_rate", format: pct, lowerIsBetter: true },
    { label: "Red Zone TD%", ak: "red_zone_td_rate", format: pct },
    { label: "Quality Drive Rate", ak: "quality_drive_rate", format: pct },
    { label: "Turnover Luck", ak: "turnover_luck", dec: 2 },
    { label: "Competitive EPA", ak: "competitive_epa_per_play", dec: 3 },
  ];

  return (
    <CardShell accent={awayColor}>
      <SectionLabel label="Team Metrics Face-Off" />
      <Grid templateColumns="1fr 1fr" gap={0} mb={2}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {metrics.map((m) => (
        <DualBar key={m.label} label={m.label} awayVal={a[m.ak]} homeVal={h[m.ak]} awayColor={awayColor} homeColor={homeColor} format={m.format} lowerIsBetter={m.lowerIsBetter} />
      ))}
    </CardShell>
  );
};

const DriveEfficiency = ({ drives, awayId, homeId }) => {
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";
  const homeColor = getTeam(homeId)?.colors?.primary ?? "#E53E3E";

  const normalized = useMemo(() => {
    return (drives ?? []).map((d, i) => ({
      id: i,
      team: d.offense_team,
      quarter: d.quarter_start,
      yards: d.yards_net ?? 0,
      result: d.result,
      plays: d.plays_total,
      time: d.clock_start,
    }));
  }, [drives]);

  const maxYards = Math.max(1, ...normalized.map((d) => Math.abs(d.yards)));

  return (
    <CardShell accent={awayColor}>
      <SectionLabel label="Drive Efficiency" />
      <Flex direction="column" gap={2} mt={2}>
        {normalized.map((d) => {
          const isAway = d.team === awayId;
          const color = isAway ? awayColor : homeColor;
          const pct = (Math.abs(d.yards) / maxYards) * 100;
          return (
            <Flex key={d.id} align="center" gap={2}>
              <Text fontSize="9px" color="text.muted" w="24px" textAlign="center">Q{d.quarter}</Text>
              <Box flex={1} h="20px" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden" position="relative">
                <Box h="full" w={`${pct}%`} bg={color} borderRadius="sm" />
                <Text position="absolute" inset={0} display="flex" alignItems="center" px={2} fontSize="10px" fontWeight="bold" color="white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                  {d.yards > 0 ? "+" : ""}{d.yards} yds · {d.plays} plays · {d.result}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Flex>
    </CardShell>
  );
};

const SituationalBreakdown = ({ awayId, homeId, teamBox }) => {
  const a = teamBox[awayId] ?? {};
  const h = teamBox[homeId] ?? {};
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";

  const rows = [
    { label: "Total Yards", av: a.total_yards, hv: h.total_yards },
    { label: "Points Scored", av: a.points_scored, hv: h.points_scored },
    { label: "Turnovers", av: a.turnovers_committed, hv: h.turnovers_committed, lowerIsBetter: true },
    { label: "3rd Down", av: a.third_down_conversion_rate, hv: h.third_down_conversion_rate, format: pct },
    { label: "4th Down", av: a.fourth_down_go_conversion_rate, hv: h.fourth_down_go_conversion_rate, format: pct },
    { label: "Yards / Play", av: a.plays_offense > 0 ? a.total_yards / a.plays_offense : null, hv: h.plays_offense > 0 ? h.total_yards / h.plays_offense : null, dec: 1 },
    { label: "Points / Drive", av: a.points_per_drive, hv: h.points_per_drive, dec: 2 },
    { label: "Avg Start Field Pos", av: a.avg_start_field_position, hv: h.avg_start_field_position, dec: 1 },
  ];

  return (
    <CardShell accent={awayColor}>
      <SectionLabel label="Situational Breakdown" />
      {rows.map((r) => (
        <DualBar key={r.label} label={r.label} awayVal={r.av} homeVal={r.hv} awayColor={awayColor} homeColor={getTeam(homeId)?.colors?.primary} format={r.format ?? ((v) => fmt(v, r.dec ?? 0))} lowerIsBetter={r.lowerIsBetter} />
      ))}
    </CardShell>
  );
};

/* ─── Tier 3: The Players ─── */

const PlayerFaceOffCard = ({ category, awayPlayer, homePlayer, awayColor, homeColor, imageMap }) => {
  const Side = ({ player, isHome }) => {
    if (!player) return <Text color="text.muted" fontSize="sm">—</Text>;
    const img = imageMap?.[player.playerKey];
    return (
      <Flex direction={isHome ? "row-reverse" : "row"} align="center" gap={3} flex={1}>
        <Box w="48px" h="48px" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0} border="1px solid" borderColor="whiteAlpha.200">
          {img ? <Image src={img} w="full" h="full" objectFit="cover" /> : <Flex w="full" h="full" align="center" justify="center"><Text fontSize="lg" fontWeight="black" color="text.muted">{cleanName(player.name)?.[0]}</Text></Flex>}
        </Box>
        <Box textAlign={isHome ? "right" : "left"} minW={0}>
          <Text fontSize="xl" fontWeight="black" color={isHome ? homeColor : awayColor} lineHeight={1}>{player.statValue}</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary" lineClamp={1}>{cleanName(player.name)}</Text>
          <Text fontSize="9px" color="text.muted">{player.statLine}</Text>
        </Box>
      </Flex>
    );
  };

  return (
    <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center" mb={3}>{category}</Text>
      <Flex align="center" gap={4}>
        <Side player={awayPlayer} isHome={false} />
        <Box w="1px" h="40px" bg="whiteAlpha.100" />
        <Side player={homePlayer} isHome={true} />
      </Flex>
    </Box>
  );
};

const PlayerDuels = ({ awayId, homeId, individualStats, imageMap }) => {
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";
  const homeColor = getTeam(homeId)?.colors?.primary ?? "#E53E3E";

  const byTeam = (tid, key) => {
    const entry = Object.entries(individualStats ?? {}).find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const topOf = (arr, field) => [...arr].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

  const ap = topOf(byTeam(awayId, "passing"), "yards");
  const hp = topOf(byTeam(homeId, "passing"), "yards");
  const ar = topOf(byTeam(awayId, "rushing"), "yards");
  const hr = topOf(byTeam(homeId, "rushing"), "yards");
  const arec = topOf(byTeam(awayId, "receiving"), "yards");
  const hrec = topOf(byTeam(homeId, "receiving"), "yards");

  const havocScore = (p) => (p.tfl ?? 0) + (p.sacks ?? 0) + (p.passes_defended ?? 0) + (p.interceptions ?? 0) + (p.forced_fumbles ?? 0);
  const ah = [...byTeam(awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const hh = [...byTeam(homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];

  const duels = [
    {
      category: "Passing Yards",
      away: ap ? { playerKey: ap.player_key, name: ap.name, statValue: `${ap.yards ?? 0}`, statLine: `${ap.completions ?? 0}/${ap.attempts ?? 0}, ${ap.touchdowns ?? 0} TD` } : null,
      home: hp ? { playerKey: hp.player_key, name: hp.name, statValue: `${hp.yards ?? 0}`, statLine: `${hp.completions ?? 0}/${hp.attempts ?? 0}, ${hp.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Rushing Yards",
      away: ar ? { playerKey: ar.player_key, name: ar.name, statValue: `${ar.yards ?? 0}`, statLine: `${ar.attempts ?? 0} car, ${ar.touchdowns ?? 0} TD` } : null,
      home: hr ? { playerKey: hr.player_key, name: hr.name, statValue: `${hr.yards ?? 0}`, statLine: `${hr.attempts ?? 0} car, ${hr.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Receiving Yards",
      away: arec ? { playerKey: arec.player_key, name: arec.name, statValue: `${arec.yards ?? 0}`, statLine: `${arec.receptions ?? 0} rec, ${arec.touchdowns ?? 0} TD` } : null,
      home: hrec ? { playerKey: hrec.player_key, name: hrec.name, statValue: `${hrec.yards ?? 0}`, statLine: `${hrec.receptions ?? 0} rec, ${hrec.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Havoc Leader",
      away: ah ? { playerKey: ah.player_key, name: ah.name, statValue: `${havocScore(ah)}`, statLine: `${ah.tfl ?? 0} TFL, ${ah.sacks ?? 0} SK` } : null,
      home: hh ? { playerKey: hh.player_key, name: hh.name, statValue: `${havocScore(hh)}`, statLine: `${hh.tfl ?? 0} TFL, ${hh.sacks ?? 0} SK` } : null,
    },
  ];

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={3}>
      {duels.map((d) => (
        <PlayerFaceOffCard key={d.category} {...d} awayColor={awayColor} homeColor={homeColor} imageMap={imageMap} />
      ))}
    </Grid>
  );
};

const GloryMVP = ({ awayId, homeId, productionScores, imageMap }) => {
  const allPlayers = [
    ...(productionScores[awayId] ?? []),
    ...(productionScores[homeId] ?? []),
  ].sort((a, b) => (b.production_total ?? 0) - (a.production_total ?? 0));

  const mvp = allPlayers[0];
  if (!mvp) return <Text color="text.muted">No production data.</Text>;

  const mvpTeamId = Object.entries(productionScores).find(([, players]) => players.some((p) => p.player_key === mvp.player_key))?.[0];
  const img = imageMap?.[mvp.player_key];
  const accent = getTeam(mvpTeamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Glory MVP" color={accent} />
      <Flex align="center" gap={4} mt={2}>
        <Box w="64px" h="64px" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0} border="1px solid" borderColor="whiteAlpha.200">
          {img ? <Image src={img} w="full" h="full" objectFit="cover" /> : <Flex w="full" h="full" align="center" justify="center"><Text fontSize="2xl" fontWeight="black" color="text.muted">{cleanName(mvp.name)?.[0]}</Text></Flex>}
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{cleanName(mvp.name)}</Text>
          <Text fontSize="xs" color="text.muted">{mvp.position} · {getTeamLabel(mvpTeamId)}</Text>
          <Text fontSize="3xl" fontWeight="black" color={accent} lineHeight={1}>{fmt(mvp.production_total, 1)}</Text>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Production Score</Text>
        </Box>
      </Flex>
      {mvp.components && (
        <Grid templateColumns="1fr 1fr" gap={2} mt={3}>
          {Object.entries(mvp.components).map(([k, v]) => (
            <Box key={k} p={2} bg="whiteAlpha.50" borderRadius="md">
              <Text fontSize="9px" color="text.muted" textTransform="uppercase">{k.replace(/_/g, " ")}</Text>
              <Text fontSize="sm" fontWeight="black" color="text.primary">{fmt(v, 1)}</Text>
            </Box>
          ))}
        </Grid>
      )}
    </CardShell>
  );
};

/* ─── Tier 4: The Strategy ─── */

const CoachingTendencies = ({ coachingProfile, teamId }) => {
  const cp = coachingProfile?.[teamId] ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";
  const rp = cp.run_pass_by_down ?? {};

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Coaching Tendencies" />
      <Text fontSize="xs" fontWeight="bold" color="text.primary" mb={2}>Run Rate by Down</Text>
      <Flex direction="column" gap={2}>
        {[1, 2, 3, 4].map((down) => {
          const data = rp[down];
          if (!data) return null;
          const rate = data.run_rate ?? 0;
          return (
            <Flex key={down} align="center" gap={3}>
              <Text fontSize="xs" fontWeight="black" color="text.primary" w="40px">{down}st</Text>
              <Box flex={1} h="16px" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden">
                <Box h="full" w={`${rate * 100}%`} bg={accent} borderRadius="sm" />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="text.primary" w="40px" textAlign="right">{pct(rate)}</Text>
            </Flex>
          );
        })}
      </Flex>
      {cp.halftime_adjustment && (
        <Box mt={3} p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Halftime Adjustment</Text>
          <Text fontSize="xs" color="text.primary">H1 Success: {pct(cp.halftime_adjustment.h1_success_rate)} → H2: {pct(cp.halftime_adjustment.h2_success_rate)}</Text>
        </Box>
      )}
    </CardShell>
  );
};

const DefensiveIdentityCard = ({ defensiveIdentity, teamId }) => {
  const di = defensiveIdentity?.[teamId] ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Defensive Identity" />
      <Grid templateColumns="1fr 1fr" gap={3} mt={2}>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Disruption Rate</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{pct(di.disruption_rate)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Explosive Prevention</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{pct(di.explosive_prevention_rate)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Yards / Play Allowed</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{fmt(di.yards_per_play_allowed, 2)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Bend-Don't-Break</Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{fmt(di.bend_dont_break_index, 1)}</Text>
        </Box>
      </Grid>
    </CardShell>
  );
};

const HeatMapGrid = ({ heatMaps, teamId }) => {
  const hm = heatMaps?.[teamId]?.pass_heat_map ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";

  const zones = [
    ["short_left", "short_middle", "short_right"],
    ["medium_left", "medium_middle", "medium_right"],
    ["deep_left", "deep_middle", "deep_right"],
  ];
  // const labels = { short: "Short", medium: "Medium", deep: "Deep" };

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Passing Heat Map" />
      <Grid templateColumns="repeat(3, 1fr)" gap={1} mt={2}>
        {zones.flat().map((zone) => {
          const data = hm[zone];
          const attempts = data?.attempts ?? 0;
          const maxAttempts = Math.max(1, ...Object.values(hm).map((z) => z?.attempts ?? 0));
          const opacity = attempts / maxAttempts;
          return (
            <Box key={zone} p={2} bg={`rgba(229,62,62,${0.1 + opacity * 0.5})`} borderRadius="md" textAlign="center">
              <Text fontSize="lg" fontWeight="black" color="text.primary">{attempts}</Text>
              <Text fontSize="9px" color="text.muted">{data?.completions ?? 0}/{attempts}</Text>
            </Box>
          );
        })}
      </Grid>
      <Flex justify="space-between" mt={1}>
        <Text fontSize="8px" color="text.muted">Left</Text>
        <Text fontSize="8px" color="text.muted">Middle</Text>
        <Text fontSize="8px" color="text.muted">Right</Text>
      </Flex>
    </CardShell>
  );
};

const SequenceModelCard = ({ sequenceModel, teamId }) => {
  const sm = sequenceModel?.[teamId] ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Sequence Model" />
      <Flex direction="column" gap={2} mt={2}>
        {sm.after_own_turnover && (
          <Flex justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
            <Text fontSize="xs" color="text.primary">After Own Turnover</Text>
            <Text fontSize="xs" fontWeight="bold" color="text.primary">{sm.after_own_turnover.points} pts / {pct(sm.after_own_turnover.score_rate)}</Text>
          </Flex>
        )}
        {sm.after_3_and_out && (
          <Flex justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
            <Text fontSize="xs" color="text.primary">After 3 & Out</Text>
            <Text fontSize="xs" fontWeight="bold" color="text.primary">{pct(sm.after_3_and_out.score_rate)} score rate</Text>
          </Flex>
        )}
        {sm.stabilization_after_explosive_allowed && (
          <Flex justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
            <Text fontSize="xs" color="text.primary">Post-Explosive Stabilization</Text>
            <Text fontSize="xs" fontWeight="bold" color="text.primary">{pct(sm.stabilization_after_explosive_allowed.success_rate)} success</Text>
          </Flex>
        )}
        <Flex justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="xs" color="text.primary">Turnover → TD Rate</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{pct(sm.turnover_td_rate)}</Text>
        </Flex>
        <Flex justify="space-between" p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="xs" color="text.primary">Max Consecutive Scoring Drives</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{sm.max_consecutive_scoring_drives ?? 0}</Text>
        </Flex>
      </Flex>
    </CardShell>
  );
};

/* ─── Tier 5: The Details ─── */

const SpecialTeamsCard = ({ specialTeams, teamId }) => {
  const st = specialTeams?.[teamId] ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Special Teams" />
      <Grid templateColumns="1fr 1fr" gap={2} mt={2}>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">ST Swing Yards</Text>
          <Text fontSize="sm" fontWeight="black" color={st.summary?.st_swing_yards > 0 ? "#48BB78" : st.summary?.st_swing_yards < 0 ? "#F56565" : "text.primary"}>{st.summary?.st_swing_yards ?? 0}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">ST Plays</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{st.summary?.st_play_count ?? 0}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Kickoff Avg Start</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{fmt(st.kickoff_offense?.avg_start_allowed, 1)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Punt Gross Avg</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{fmt(st.punt_offense?.avg_gross_yards, 1)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">PAT %</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{pct(st.pat_offense?.pct)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">FG Against</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{st.fg_defense?.made_against ?? 0}/{st.fg_defense?.attempts_against ?? 0}</Text>
        </Box>
      </Grid>
    </CardShell>
  );
};

const PenaltyReport = ({ penaltyAdvanced, teamId }) => {
  const pa = penaltyAdvanced?.[teamId] ?? {};
  const accent = getTeam(teamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Penalty Report" />
      <Grid templateColumns="1fr 1fr" gap={2} mt={2}>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Total / Yards</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{pa.total_accepted ?? 0} / {pa.total_yards ?? 0}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Penalty Rate</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{pct(pa.penalty_rate)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Pre-snap / Live</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{pct(pa.pre_snap_rate)} / {pct(pa.live_ball_rate)}</Text>
        </Box>
        <Box p={2} bg="whiteAlpha.50" borderRadius="md">
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Drive Kills / Extends</Text>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{pa.drive_kill_count ?? 0} / {pa.drive_extend_count ?? 0}</Text>
        </Box>
      </Grid>
      {pa.top_penalty_types?.length > 0 && (
        <Box mt={2}>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" mb={1}>Top Penalty Types</Text>
          {pa.top_penalty_types.slice(0, 3).map((pt, i) => (
            <Flex key={i} justify="space-between" py={1} borderBottom="1px solid" borderColor="whiteAlpha.50">
              <Text fontSize="xs" color="text.primary">{pt.penalty_type}</Text>
              <Text fontSize="xs" fontWeight="bold" color="text.primary">{pt.count}</Text>
            </Flex>
          ))}
        </Box>
      )}
    </CardShell>
  );
};

/* ─── Tier 6: The Raw Feed ─── */

const PlayByPlayFeed = ({ plays, awayId, homeId }) => {
  const [quarter, setQuarter] = useState("all");
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";
  const homeColor = getTeam(homeId)?.colors?.primary ?? "#E53E3E";

  const filtered = useMemo(() => {
    const meaningful = (plays ?? []).filter((p) => {
      const raw = String(p?.raw_text ?? "").trim();
      if (!raw) return false;
      const lowered = raw.toLowerCase();
      if (lowered.includes("drive start at")) return false;
      if (lowered.startsWith("end of game")) return false;
      if (/^[a-z .'-]+ at \d{2}:\d{2}$/i.test(raw)) return false;
      return p?.play_type != null || p?.down != null || p?.no_play === true;
    });
    if (quarter === "all") return meaningful;
    return meaningful.filter((p) => p.quarter === quarter);
  }, [plays, quarter]);

  const quarters = ["all", 1, 2, 3, 4, 5];

  return (
    <Box>
      <Flex wrap="wrap" gap={2} mb={4}>
        {quarters.map((q) => {
          const active = quarter === q;
          return (
            <Box key={q} as="button" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor={active ? "brand.500" : "whiteAlpha.100"} bg={active ? "brand.500" : "transparent"} color={active ? "white" : "text.secondary"} onClick={() => setQuarter(q)}>
              <Text fontSize="10px" fontWeight="black" textTransform="uppercase">{q === "all" ? "All" : `Q${q}`}</Text>
            </Box>
          );
        })}
      </Flex>
      <Flex direction="column" gap={1}>
        {filtered.map((p, i) => {
          const isAway = p.offense_team === awayId;
          const borderColor = isAway ? awayColor : homeColor;
          const isScoring = p.scoring_event === true;
          return (
            <Flex key={i} gap={3} p={3} bg="bg.secondary" borderLeft="3px solid" borderColor={borderColor} borderRadius="md">
              <Box minW="60px">
                <Text fontSize="xs" fontWeight="bold" color="text.primary">Q{p.quarter}</Text>
                <Text fontSize="10px" color="text.muted">{p.clock ?? "—"}</Text>
              </Box>
              <Box flex={1}>
                <Text fontSize="xs" color="text.primary" lineHeight={1.5}>{p.raw_text}</Text>
                {isScoring && <Text fontSize="10px" fontWeight="bold" color="green.300" mt={1}>+{p.scoring_points} pts · {p.scoring_type}</Text>}
                {p.epa?.epa != null && (
                  <Text fontSize="10px" color={p.epa.epa > 0 ? "#48BB78" : "#F56565"} mt={0.5}>EPA: {p.epa.epa > 0 ? "+" : ""}{fmt(p.epa.epa, 2)}</Text>
                )}
              </Box>
              <Box minW="80px" textAlign="right">
                <Text fontSize="xs" fontWeight="bold" color="brand.400">{p.score_away_after ?? 0} – {p.score_home_after ?? 0}</Text>
              </Box>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

const BoxScoreTables = ({ individualStats, awayId, homeId }) => {
  const byTeam = (tid, key) => {
    const entry = Object.entries(individualStats ?? {}).find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const Table = ({ title, rows, cols }) => (
    <Box mb={4}>
      <Text fontSize="sm" fontWeight="black" color="text.primary" mb={2}>{title}</Text>
      <Box overflowX="auto">
        <Box minW="600px">
          <Grid templateColumns={cols.map((c) => c.width).join(" ")} gap={2} px={3} py={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
            {cols.map((c) => <Text key={c.key} fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">{c.label}</Text>)}
          </Grid>
          {rows.map((r, i) => (
            <Grid key={i} templateColumns={cols.map((c) => c.width).join(" ")} gap={2} px={3} py={2} borderBottom="1px solid" borderColor="whiteAlpha.50" alignItems="center">
              {cols.map((c) => <Text key={c.key} fontSize="xs" color="text.primary" lineClamp={1}>{c.format ? c.format(r[c.key]) : r[c.key] ?? "—"}</Text>)}
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );

  const passCols = [
    { key: "name", label: "Player", width: "1.5fr" },
    { key: "completions", label: "Comp", width: "60px" },
    { key: "attempts", label: "Att", width: "60px" },
    { key: "yards", label: "Yds", width: "60px" },
    { key: "touchdowns", label: "TD", width: "50px" },
    { key: "interceptions", label: "INT", width: "50px" },
    { key: "yards_per_attempt", label: "YPA", width: "60px", format: (v) => fmt(v, 1) },
  ];

  const rushCols = [
    { key: "name", label: "Player", width: "1.5fr" },
    { key: "attempts", label: "Att", width: "60px" },
    { key: "yards", label: "Yds", width: "60px" },
    { key: "yards_per_carry", label: "YPC", width: "60px", format: (v) => fmt(v, 1) },
    { key: "touchdowns", label: "TD", width: "50px" },
    { key: "fumbles", label: "Fum", width: "50px" },
  ];

  const recCols = [
    { key: "name", label: "Player", width: "1.5fr" },
    { key: "receptions", label: "Rec", width: "60px" },
    { key: "targets", label: "Tgt", width: "60px" },
    { key: "yards", label: "Yds", width: "60px" },
    { key: "yards_per_reception", label: "YPR", width: "60px", format: (v) => fmt(v, 1) },
    { key: "touchdowns", label: "TD", width: "50px" },
  ];

  const defCols = [
    { key: "name", label: "Player", width: "1.5fr" },
    { key: "tackles", label: "Tkl", width: "60px" },
    { key: "solo_tackles", label: "Solo", width: "60px" },
    { key: "tfl", label: "TFL", width: "50px" },
    { key: "sacks", label: "Sack", width: "50px" },
    { key: "passes_defended", label: "PD", width: "50px" },
    { key: "interceptions", label: "INT", width: "50px" },
  ];

  return (
    <Box>
      {[awayId, homeId].map((tid) => (
        <Box key={tid} mb={6}>
          <Text fontSize="md" fontWeight="black" color="text.primary" mb={3}>{getTeamLabel(tid)} Box Score</Text>
          <Table title="Passing" rows={byTeam(tid, "passing").filter((p) => p.player_key !== `${tid}_TEAM`)} cols={passCols} />
          <Table title="Rushing" rows={byTeam(tid, "rushing")} cols={rushCols} />
          <Table title="Receiving" rows={byTeam(tid, "receiving")} cols={recCols} />
          <Table title="Defense" rows={byTeam(tid, "defense")} cols={defCols} />
        </Box>
      ))}
    </Box>
  );
};

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
