import { getTeam, pct, fmt } from "./magazineModel";
import { CardShell, SectionLabel } from "./MagazinePrimitives";
import { Text, Flex, Box, Grid } from "@chakra-ui/react";

export const CoachingTendencies = ({ coachingProfile, teamId }) => {
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

export const DefensiveIdentityCard = ({ defensiveIdentity, teamId }) => {
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

export const HeatMapGrid = ({ heatMaps, teamId }) => {
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

export const SequenceModelCard = ({ sequenceModel, teamId }) => {
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
