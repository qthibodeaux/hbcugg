import { useMemo, useState } from "react";
import { Box, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import { StatSection, StatTable, StatKpiStrip } from "../../molecules/stats/StatTable";
import { useAllTeamSeasonAvg, useAllTeamDefenseAvg, useLeagueAverages } from "../../../hooks/useSWACData";
import teamsData from "../../../data/teams.json";

// team_season_avg / team_defense_avg key teams by the stripped export id
// ("swacalc"), so index teams.json the same way.
const TEAM_BY_KEY = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

// The 10 rate metrics both files carry. `higherIsBetter` is stated from the
// OFFENSE file's point of view and flips for defense — the same key means the
// opposite thing depending on which side you're reading (an offense wants a
// low stuffRate; a defense wants a high one).
const METRICS = [
  { key: "successRate", family: "rushing", label: "Rush SR%", format: "pct", higherIsBetter: true },
  { key: "opportunityRate", family: "rushing", label: "Opp%", format: "pct", higherIsBetter: true },
  { key: "stuffRate", family: "rushing", label: "Stuff%", format: "pct", higherIsBetter: false },
  { key: "stopRate", family: "rushing", label: "Stop%", format: "pct", higherIsBetter: false },
  { key: "tflRate", family: "rushing", label: "TFL%", format: "pct", higherIsBetter: false },
  { key: "powerStopRate", family: "rushing", label: "Pwr Stop%", format: "pct", higherIsBetter: false },
  { key: "completionRate", family: "passing", label: "Comp%", format: "pct", higherIsBetter: true },
  { key: "ypa", family: "passing", label: "YPA", format: "num", higherIsBetter: true },
  { key: "explosiveRate", family: "passing", label: "Expl%", format: "pct", higherIsBetter: true },
  { key: "pressureRate", family: "passing", label: "Press%", format: "pct", higherIsBetter: false },
];

// 2020 has no season — the export skips it, so the picker must too.
// 2026 arrived with the 2026-08-30 export drop.
const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2019];

const fmt = (value, format) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  return format === "pct" ? `${(n * 100).toFixed(1)}%` : n.toFixed(2);
};

const TeamCell = ({ teamKey }) => {
  const meta = TEAM_BY_KEY[teamKey];
  return (
    <Flex align="center" gap={2} minW={0}>
      <Image src={`/assets/${teamKey}.svg`} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />
      <Text fontSize="11px" fontWeight="800" color="text.primary" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>
        {meta?.shortName ?? teamKey}
      </Text>
    </Flex>
  );
};

const Toggle = ({ options, value, onChange }) => (
  <Flex gap={1} bg="bg.primary" borderRadius="sm" p="2px">
    {options.map((opt) => (
      <Box
        key={opt.value}
        as="button"
        onClick={() => onChange(opt.value)}
        px={2}
        py="2px"
        borderRadius="xs"
        bg={value === opt.value ? "brand.500" : "transparent"}
        _focusVisible={{ outline: "1px solid", outlineColor: "brand.500", outlineOffset: "1px" }}
      >
        <Text
          fontSize="9px"
          fontWeight="950"
          textTransform="uppercase"
          letterSpacing="0.06em"
          color={value === opt.value ? "white" : "text.muted"}
        >
          {opt.label}
        </Text>
      </Box>
    ))}
  </Flex>
);

const TeamEfficiencyPanel = () => {
  const [season, setSeason] = useState(2025);
  const [side, setSide] = useState("offense");
  const [sortKey, setSortKey] = useState("successRate");
  const [sortDir, setSortDir] = useState("desc");

  const { teams: offense, isLoading: offLoading } = useAllTeamSeasonAvg(season);
  const { teams: defense, isLoading: defLoading } = useAllTeamDefenseAvg(season);
  const { data: league, isLoading: leagueLoading } = useLeagueAverages(season);

  const isLoading = offLoading || defLoading || leagueLoading;
  const source = side === "offense" ? offense : defense;

  // Offense polarity flips wholesale on the defensive side.
  const polarity = (metric) => (side === "offense" ? metric.higherIsBetter : !metric.higherIsBetter);

  const rows = useMemo(() => {
    if (!source) return [];
    const entries = Object.entries(source);
    const sortMetric = METRICS.find((m) => m.key === sortKey);

    const sorted = [...entries].sort(([, a], [, b]) => {
      if (!sortMetric) return 0;
      const av = a?.[sortMetric.family]?.[sortMetric.key];
      const bv = b?.[sortMetric.family]?.[sortMetric.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === "desc" ? bv - av : av - bv;
    });

    return sorted.map(([teamKey, values], i) => {
      const cells = {
        rank: { text: String(i + 1), tone: "muted" },
        team: { node: <TeamCell teamKey={teamKey} /> },
      };
      METRICS.forEach((metric) => {
        const value = values?.[metric.family]?.[metric.key];
        const baseline = league?.[metric.family]?.[metric.key];
        let tone = "default";
        if (value != null && baseline != null) {
          const above = Number(value) > Number(baseline);
          tone = above === polarity(metric) ? "good" : "bad";
        }
        cells[metric.key] = { text: fmt(value, metric.format), tone };
      });
      return { id: teamKey, cells };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, league, sortKey, sortDir, side]);

  const columns = useMemo(
    () => [
      { key: "rank", label: "Rk", w: "2.25rem", align: "left", sortable: false },
      { key: "team", label: "Team", w: "minmax(8rem, 1fr)", align: "left", sortable: false },
      ...METRICS.map((m) => ({ key: m.key, label: m.label, w: "5.25rem", align: "right" })),
    ],
    [],
  );

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  };

  const leagueItems = league
    ? [
        { label: "Rush SR%", value: fmt(league.rushing?.successRate, "pct") },
        { label: "Opp%", value: fmt(league.rushing?.opportunityRate, "pct") },
        { label: "Stuff%", value: fmt(league.rushing?.stuffRate, "pct") },
        { label: "TFL%", value: fmt(league.rushing?.tflRate, "pct") },
        { label: "Comp%", value: fmt(league.passing?.completionRate, "pct") },
        { label: "YPA", value: fmt(league.passing?.ypa, "num") },
        { label: "Expl%", value: fmt(league.passing?.explosiveRate, "pct") },
        { label: "Press%", value: fmt(league.passing?.pressureRate, "pct") },
      ]
    : [];

  return (
    <Flex direction="column" gap={4}>
      <StatSection
        title={`League Average · ${season}`}
        controls={
          <Toggle
            options={SEASONS.map((s) => ({ value: s, label: String(s) }))}
            value={season}
            onChange={setSeason}
          />
        }
      >
        <Box p={3}>
          {isLoading ? (
            <Flex justify="center" py={6}><Spinner color="brand.500" size="sm" /></Flex>
          ) : (
            <StatKpiStrip items={leagueItems} />
          )}
        </Box>
      </StatSection>

      <StatSection
        title={`Team Efficiency · ${side === "offense" ? "Offense" : "Defense"}`}
        controls={
          <Toggle
            options={[
              { value: "offense", label: "Offense" },
              { value: "defense", label: "Defense" },
            ]}
            value={side}
            onChange={setSide}
          />
        }
      >
        {isLoading ? (
          <Flex justify="center" py={16}><Spinner color="brand.500" size="lg" /></Flex>
        ) : rows.length === 0 ? (
          <Flex justify="center" py={16}>
            <Text fontSize="sm" color="text.muted">No team averages exported for {season}.</Text>
          </Flex>
        ) : (
          <StatTable columns={columns} rows={rows} onSort={handleSort} sortKey={sortKey} sortDir={sortDir} />
        )}
      </StatSection>

      <Text fontSize="10px" color="text.muted" px={1}>
        Green marks a value better than the league average for that side; orange marks worse. Rates
        carry opposite meaning on defense — a high stuff rate is good for a defense and bad for an
        offense — so the comparison flips with the toggle.
      </Text>
    </Flex>
  );
};

export default TeamEfficiencyPanel;
