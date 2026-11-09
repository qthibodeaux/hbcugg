import { fmt, getTeam, pct, getTeamLabel } from "./magazineModel";
import { Box, Grid, Text, Flex } from "@chakra-ui/react";
import { CardShell, SectionLabel } from "./MagazinePrimitives";
import { useMemo } from "react";

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

export const TeamMetricsFaceOff = ({ awayId, homeId, advancedTeam }) => {
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

export const DriveEfficiency = ({ drives, awayId, homeId }) => {
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

export const SituationalBreakdown = ({ awayId, homeId, teamBox }) => {
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
