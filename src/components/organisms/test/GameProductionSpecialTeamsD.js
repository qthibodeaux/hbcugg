import React, { useMemo } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  Box, Flex, Text, Grid, VStack, HStack, Badge
} from "@chakra-ui/react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toV5 = (id) => (id || "").replace(/25$/, "");

const getTeamMeta = (game, teamId) => {
  const v5 = toV5(teamId);
  const t = game?.teams?.[v5];
  return {
    name: t?.name || teamId,
    short: t?.short_name || t?.name || teamId,
    colors: t?.colors || { primary: "#888", secondary: "#fff" },
  };
};

const fmt = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (typeof n === "number" && !Number.isInteger(n)) return n.toFixed(1);
  return String(n);
};

const safe = (obj, path, fallback = 0) => {
  try {
    return path.split(".").reduce((o, k) => (o ?? {})[k], obj) ?? fallback;
  } catch {
    return fallback;
  }
};

// eslint-disable-next-line no-unused-vars
const gradeColor = (g) => {
  const map = { A: "#22c55e", "A-": "#4ade80", "B+": "#86efac", B: "#3b82f6", "B-": "#60a5fa", "C+": "#f59e0b", C: "#f97316", "C-": "#fb923c", D: "#ef4444", F: "#dc2626" };
  return map[g] || "#A1A1AA";
};

// ─── MiniStat Card ───────────────────────────────────────────────────────────

const MiniStat = ({ label, value, sub, accent }) => (
  <VStack
    gap={0}
    align="center"
    justify="center"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="6px"
    p="8px"
    h="100%"
    minH="60px"
  >
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
    <Text fontSize="16px" fontWeight="800" color={accent || "text.primary"} lineHeight="1">{value}</Text>
    {sub && <Text fontSize="9px" color="text.muted">{sub}</Text>}
  </VStack>
);

// ─── Range Rail ──────────────────────────────────────────────────────────────

const RangeRail = ({ label, value, min, max, unit = "", accent }) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <Box w="100%">
      <Flex justify="space-between" mb="4px">
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">{label}</Text>
        <Text fontSize="11px" fontWeight="700" color={accent}>{fmt(value)}{unit}</Text>
      </Flex>
      <Box w="100%" h="4px" bg="whiteAlpha.100" borderRadius="2px" position="relative">
        <Box position="absolute" left="0" top="0" h="100%" w={`${pct}%`} bg={accent} borderRadius="2px" />
      </Box>
      <Flex justify="space-between" mt="2px">
        <Text fontSize="8px" color="text.muted">{min}{unit}</Text>
        <Text fontSize="8px" color="text.muted">{max}{unit}</Text>
      </Flex>
    </Box>
  );
};

// ─── Context Tiles ───────────────────────────────────────────────────────────

const ContextTile = ({ label, value, accent }) => (
  <VStack
    gap={1}
    align="center"
    justify="center"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="6px"
    p="8px"
    flex="1"
  >
    <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">{label}</Text>
    <Text fontSize="13px" fontWeight="700" color={accent || "text.primary"}>{value}</Text>
  </VStack>
);

// ─── Unit Half (for Kickoff/Punt rows) ───────────────────────────────────────

const UnitHalf = ({ title, stats, progress, accent }) => (
  <VStack
    gap="8px"
    align="stretch"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="8px"
    p="12px"
    flex="1"
    h="100%"
  >
    <Flex align="center" gap="8px">
      <Box w="3px" h="14px" bg={accent} borderRadius="2px" />
      <Text fontSize="11px" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">{title}</Text>
    </Flex>
    <Grid templateColumns="repeat(2, 1fr)" gap="6px" flex="1">
      {stats.map((s, i) => (
        <MiniStat key={i} {...s} />
      ))}
    </Grid>
    {progress && (
      <Box>
        <Flex justify="space-between" mb="3px">
          <Text fontSize="9px" color="text.muted">{progress.label}</Text>
          <Text fontSize="10px" fontWeight="700" color={accent}>{progress.value}{progress.unit || ""}</Text>
        </Flex>
        <Box w="100%" h="3px" bg="whiteAlpha.100" borderRadius="2px">
          <Box h="100%" w={`${Math.max(0, Math.min(100, progress.pct))}%`} bg={accent} borderRadius="2px" />
        </Box>
      </Box>
    )}
  </VStack>
);

// ─── Contributors Panel ──────────────────────────────────────────────────────

const ContributorsPanel = ({ title, players, accent }) => {
  if (!players || players.length === 0) return null;
  return (
    <VStack
      gap="6px"
      align="stretch"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="8px"
      p="12px"
      w="200px"
      flexShrink={0}
      h="100%"
    >
      <Flex align="center" gap="8px">
        <Box w="3px" h="14px" bg={accent} borderRadius="2px" />
        <Text fontSize="10px" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">{title}</Text>
      </Flex>
      <VStack gap="4px" align="stretch">
        {players.map((p, i) => (
          <Flex key={i} justify="space-between" align="center" py="3px" borderBottom={i < players.length - 1 ? "1px solid" : "none"} borderColor="whiteAlpha.50">
            <VStack gap={0} align="flex-start">
              <Text fontSize="11px" fontWeight="600" color="text.primary">{p.name}</Text>
              <Text fontSize="9px" color="text.muted">{p.position} · #{p.number || "—"}</Text>
            </VStack>
            <HStack gap="8px">
              {p.stats.map((s, j) => (
                <VStack key={j} gap={0} align="center">
                  <Text fontSize="10px" fontWeight="700" color={accent}>{s.value}</Text>
                  <Text fontSize="8px" color="text.muted">{s.label}</Text>
                </VStack>
              ))}
            </HStack>
          </Flex>
        ))}
      </VStack>
    </VStack>
  );
};

// ─── Data Extraction ─────────────────────────────────────────────────────────

const extractTeamSTData = (game, teamId) => {
  const adv = safe(game, `game_advanced.team_advanced.${toV5(teamId)}.special_teams_advanced`, {});
  const ind = safe(game, `individual_stats.${toV5(teamId)}`, {});
  const returns = ind.returns || [];

  return {
    // FG
    fgMade: safe(adv, "field_goals.made", 0),
    fgAtt: safe(adv, "field_goals.attempted", 0),
    fgLong: safe(adv, "field_goals.long", 0),
    fgPct: safe(adv, "field_goals.percentage", 0),
    fgBlocked: safe(adv, "field_goals.blocked", 0),
    fg0_19: safe(adv, "field_goals.range_0_19", 0),
    fg20_29: safe(adv, "field_goals.range_20_29", 0),
    fg30_39: safe(adv, "field_goals.range_30_39", 0),
    fg40_49: safe(adv, "field_goals.range_40_49", 0),
    fg50_plus: safe(adv, "field_goals.range_50_plus", 0),

    // Kickoff
    koTotal: safe(adv, "kickoffs.total", 0),
    koTouchbacks: safe(adv, "kickoffs.touchbacks", 0),
    koOutOfBounds: safe(adv, "kickoffs.out_of_bounds", 0),
    koOnsideAttempts: safe(adv, "kickoffs.onside_attempts", 0),
    koOnsideSuccess: safe(adv, "kickoffs.onside_successful", 0),
    koAvgYardLine: safe(adv, "kickoffs.avg_yard_line", 0),
    koReturnYards: safe(adv, "kickoffs.return_yards", 0),
    koReturnTD: safe(adv, "kickoffs.return_touchdowns", 0),

    // Punt
    punts: safe(adv, "punts.total", 0),
    puntYards: safe(adv, "punts.yards", 0),
    puntAvg: safe(adv, "punts.average", 0),
    puntLong: safe(adv, "punts.long", 0),
    puntIn20: safe(adv, "punts.inside_20", 0),
    puntTouchbacks: safe(adv, "punts.touchbacks", 0),
    puntBlocked: safe(adv, "punts.blocked", 0),
    puntReturnYards: safe(adv, "punts.return_yards", 0),
    puntReturnTD: safe(adv, "punts.return_touchdowns", 0),
    puntFairCatches: safe(adv, "punts.fair_catches", 0),

    // Returns (from individual_stats)
    returners: returns.map((r) => ({
      name: r.name || r.player || "Unknown",
      position: r.position || "RET",
      number: r.number || r.jersey || "",
      attempts: r.attempts || 0,
      yards: r.yards || 0,
      avg: r.average || (r.attempts ? (r.yards / r.attempts).toFixed(1) : "0.0"),
      td: r.touchdowns || 0,
      long: r.long || 0,
    })),
  };
};

// ─── Ledger Header ───────────────────────────────────────────────────────────

const LedgerHeader = ({ awayData, homeData }) => {
  const awayMeta = getTeamMeta(awayData._game, awayData._teamId);
  const homeMeta = getTeamMeta(homeData._game, homeData._teamId);

  const tiles = [
    { label: "FG Made", away: awayData.fgMade, home: homeData.fgMade },
    { label: "Punts", away: awayData.punts, home: homeData.punts },
    { label: "Kickoffs", away: awayData.koTotal, home: homeData.koTotal },
    { label: "Return Yds", away: awayData.koReturnYards + awayData.puntReturnYards, home: homeData.koReturnYards + homeData.puntReturnYards },
    { label: "TBs", away: awayData.koTouchbacks + awayData.puntTouchbacks, home: homeData.koTouchbacks + homeData.puntTouchbacks },
  ];

  return (
    <Grid templateColumns="1fr auto 1fr" gap="16px" alignItems="center" w="100%">
      {/* Away */}
      <VStack gap="6px" align="flex-end">
        <Text fontSize="14px" fontWeight="800" color={awayMeta.colors.primary}>{awayMeta.name}</Text>
        <Text fontSize="10px" color="text.muted">{awayMeta.short}</Text>
      </VStack>

      {/* Tiles */}
      <HStack gap="8px">
        {tiles.map((t, i) => (
          <VStack
            key={i}
            gap="2px"
            align="center"
            bg="bg.secondary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="8px"
            p="10px 14px"
            minW="70px"
          >
            <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">{t.label}</Text>
            <HStack gap="8px" align="baseline">
              <Text fontSize="16px" fontWeight="800" color={awayMeta.colors.primary}>{t.away}</Text>
              <Text fontSize="10px" color="text.muted">vs</Text>
              <Text fontSize="16px" fontWeight="800" color={homeMeta.colors.primary}>{t.home}</Text>
            </HStack>
          </VStack>
        ))}
      </HStack>

      {/* Home */}
      <VStack gap="6px" align="flex-start">
        <Text fontSize="14px" fontWeight="800" color={homeMeta.colors.primary}>{homeMeta.name}</Text>
        <Text fontSize="10px" color="text.muted">{homeMeta.short}</Text>
      </VStack>
    </Grid>
  );
};

// ─── Field Goal Section ──────────────────────────────────────────────────────

const FieldGoalSection = ({ data, accent }) => {
  const attempts = data.fgAtt || 0;
  const made = data.fgMade || 0;
  const pct = attempts > 0 ? ((made / attempts) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Made", value: made, sub: `/${attempts}`, accent },
    { label: "Pct", value: `${pct}%`, sub: null, accent },
    { label: "Long", value: data.fgLong || "—", sub: "yds", accent },
    { label: "Blocked", value: data.fgBlocked || 0, sub: null, accent: data.fgBlocked > 0 ? "#ef4444" : "text.muted" },
  ];

  const ranges = [
    { label: "0-19", value: data.fg0_19 || 0 },
    { label: "20-29", value: data.fg20_29 || 0 },
    { label: "30-39", value: data.fg30_39 || 0 },
    { label: "40-49", value: data.fg40_49 || 0 },
    { label: "50+", value: data.fg50_plus || 0 },
  ];

  return (
    <VStack gap="10px" align="stretch" w="100%">
      <Flex align="center" gap="8px">
        <Box w="3px" h="16px" bg={accent} borderRadius="2px" />
        <Text fontSize="12px" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">Field Goals</Text>
      </Flex>

      <Grid templateColumns="repeat(4, 1fr)" gap="8px">
        {stats.map((s, i) => (
          <MiniStat key={i} label={s.label} value={s.value} sub={s.sub} accent={s.accent} />
        ))}
      </Grid>

      <RangeRail
        label="Accuracy Range"
        value={parseFloat(pct)}
        min={0}
        max={100}
        unit="%"
        accent={accent}
      />

      <HStack gap="8px" w="100%">
        {ranges.map((r, i) => (
          <ContextTile key={i} label={r.label} value={r.value} accent={r.value > 0 ? accent : "text.muted"} />
        ))}
      </HStack>
    </VStack>
  );
};

// ─── Kickoff Row ─────────────────────────────────────────────────────────────

const KickoffRow = ({ data, accent }) => {
  const coverStats = [
    { label: "Total", value: data.koTotal, sub: "kicks" },
    { label: "Touchbacks", value: data.koTouchbacks, sub: null },
    { label: "Out of Bnds", value: data.koOutOfBounds, sub: null },
    { label: "Avg Line", value: fmt(data.koAvgYardLine), sub: "yrd ln" },
  ];

  const returnStats = [
    { label: "Ret Yds", value: data.koReturnYards, sub: null },
    { label: "Ret TD", value: data.koReturnTD, sub: null },
    { label: "Onside Att", value: data.koOnsideAttempts, sub: null },
    { label: "Onside Succ", value: data.koOnsideSuccess, sub: null },
  ];

  const tbPct = data.koTotal > 0 ? (data.koTouchbacks / data.koTotal) * 100 : 0;

  const returnPlayers = data.returners
    .filter((r) => r.attempts > 0)
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      position: r.position,
      number: r.number,
      stats: [
        { label: "ATT", value: r.attempts },
        { label: "YDS", value: r.yards },
        { label: "AVG", value: r.avg },
      ],
    }));

  return (
    <VStack gap="10px" align="stretch" w="100%">
      <Flex align="center" gap="8px">
        <Box w="3px" h="16px" bg={accent} borderRadius="2px" />
        <Text fontSize="12px" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">Kickoffs</Text>
      </Flex>

      <Flex gap="10px" align="stretch">
        <UnitHalf
          title="Coverage Unit"
          stats={coverStats}
          progress={{ label: "Touchback Rate", value: tbPct.toFixed(0), unit: "%", pct: tbPct }}
          accent={accent}
        />
        <UnitHalf
          title="Return Unit"
          stats={returnStats}
          progress={null}
          accent={accent}
        />
        <ContributorsPanel
          title="Returners"
          players={returnPlayers}
          accent={accent}
        />
      </Flex>
    </VStack>
  );
};

// ─── Punt Row ────────────────────────────────────────────────────────────────

const PuntRow = ({ data, accent }) => {
  const teamStats = [
    { label: "Punts", value: data.punts, sub: null },
    { label: "Yards", value: data.puntYards, sub: null },
    { label: "Average", value: fmt(data.puntAvg), sub: "yds" },
    { label: "Long", value: data.puntLong, sub: "yds" },
  ];

  const returnStats = [
    { label: "In 20", value: data.puntIn20, sub: null },
    { label: "Touchbacks", value: data.puntTouchbacks, sub: null },
    { label: "Blocked", value: data.puntBlocked, sub: null },
    { label: "Fair Catch", value: data.puntFairCatches, sub: null },
  ];

  const in20Pct = data.punts > 0 ? (data.puntIn20 / data.punts) * 100 : 0;

  const returnPlayers = data.returners
    .filter((r) => r.attempts > 0)
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      position: r.position,
      number: r.number,
      stats: [
        { label: "ATT", value: r.attempts },
        { label: "YDS", value: r.yards },
        { label: "AVG", value: r.avg },
      ],
    }));

  return (
    <VStack gap="10px" align="stretch" w="100%">
      <Flex align="center" gap="8px">
        <Box w="3px" h="16px" bg={accent} borderRadius="2px" />
        <Text fontSize="12px" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">Punts</Text>
      </Flex>

      <Flex gap="10px" align="stretch">
        <UnitHalf
          title="Punt Unit"
          stats={teamStats}
          progress={{ label: "Inside 20 Rate", value: in20Pct.toFixed(0), unit: "%", pct: in20Pct }}
          accent={accent}
        />
        <UnitHalf
          title="Return Allowed"
          stats={returnStats}
          progress={null}
          accent={accent}
        />
        <ContributorsPanel
          title="Returners"
          players={returnPlayers}
          accent={accent}
        />
      </Flex>
    </VStack>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const GameProductionSpecialTeamsD = ({ game, awayId, homeId }) => {
  const awayData = useMemo(() => {
    const d = extractTeamSTData(game, awayId);
    d._game = game;
    d._teamId = awayId;
    return d;
  }, [game, awayId]);

  const homeData = useMemo(() => {
    const d = extractTeamSTData(game, homeId);
    d._game = game;
    d._teamId = homeId;
    return d;
  }, [game, homeId]);

  const awayMeta = getTeamMeta(game, awayId);
  const homeMeta = getTeamMeta(game, homeId);

  return (
    <VStack
      gap="16px"
      align="stretch"
      bg="bg.primary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="12px"
      p="16px"
      w="100%"
    >
      <LedgerHeader awayData={awayData} homeData={homeData} />

      <Box h="1px" bg="whiteAlpha.100" w="100%" />

      {/* Away Team Sections */}
      <VStack gap="14px" align="stretch">
        <Text fontSize="13px" fontWeight="800" color={awayMeta.colors.primary}>{awayMeta.name} Special Teams</Text>
        <FieldGoalSection data={awayData} accent={awayMeta.colors.primary} />
        <KickoffRow data={awayData} accent={awayMeta.colors.primary} />
        <PuntRow data={awayData} accent={awayMeta.colors.primary} />
      </VStack>

      <Box h="1px" bg="whiteAlpha.100" w="100%" />

      {/* Home Team Sections */}
      <VStack gap="14px" align="stretch">
        <Text fontSize="13px" fontWeight="800" color={homeMeta.colors.primary}>{homeMeta.name} Special Teams</Text>
        <FieldGoalSection data={homeData} accent={homeMeta.colors.primary} />
        <KickoffRow data={homeData} accent={homeMeta.colors.primary} />
        <PuntRow data={homeData} accent={homeMeta.colors.primary} />
      </VStack>
    </VStack>
  );
};

export default GameProductionSpecialTeamsD;
