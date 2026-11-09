import { useState, useMemo } from "react";
import { getTeam, fmt, getTeamLabel } from "./magazineModel";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";

export const PlayByPlayFeed = ({ plays, awayId, homeId }) => {
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

export const BoxScoreTables = ({ individualStats, awayId, homeId }) => {
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
