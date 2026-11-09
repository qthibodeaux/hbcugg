import { getTeam, fmt, pct } from "./magazineModel";
import { CardShell, SectionLabel } from "./MagazinePrimitives";
import { Grid, Box, Text, Flex } from "@chakra-ui/react";

export const SpecialTeamsCard = ({ specialTeams, teamId }) => {
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

export const PenaltyReport = ({ penaltyAdvanced, teamId }) => {
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
