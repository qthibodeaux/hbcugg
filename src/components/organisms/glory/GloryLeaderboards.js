import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Crown, Sparkles } from "lucide-react";
import teamsData from "../../../data/teams.json";

const TEAM_BY_V5 = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team.shortName;
  return acc;
}, {});

export const GloryLeaderboards = ({ topPlayers, topPrograms }) => (
  <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" gap={2} mb={4}>
        <Sparkles size={16} color="var(--chakra-colors-brand-500)" />
        <Text fontSize="sm" color="text.primary" fontWeight="bold">Top Player Glory Signals</Text>
      </Flex>
      <Flex direction="column" gap={2}>
        {topPlayers.map((player, index) => (
          <Flex
            key={player.player_key ?? `${player.name_display}_${index}`}
            align="center"
            justify="space-between"
            py={2}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
            _last={{ borderBottom: "none" }}
          >
            <Box>
              <Text fontSize="sm" color="text.primary" fontWeight="bold">
                {index + 1}. {player.name_display}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {(TEAM_BY_V5[player.team] ?? player.team ?? "Unknown")} · {player.position ?? "ATH"}
              </Text>
            </Box>
            <Text fontSize="sm" fontWeight="black" color="brand.400">
              {(player.par ?? 0).toFixed(2)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>

    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" gap={2} mb={4}>
        <Crown size={16} color="var(--chakra-colors-brand-500)" />
        <Text fontSize="sm" color="text.primary" fontWeight="bold">Program Stability Leaders</Text>
      </Flex>
      <Flex direction="column" gap={2}>
        {topPrograms.map((team, index) => (
          <Flex
            key={`${team.team}_${index}`}
            align="center"
            justify="space-between"
            py={2}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
            _last={{ borderBottom: "none" }}
          >
            <Box>
              <Text fontSize="sm" color="text.primary" fontWeight="bold">
                {index + 1}. {TEAM_BY_V5[team.team] ?? team.team}
              </Text>
              <Text fontSize="xs" color="text.muted">Continuity grade {team.grade}</Text>
            </Box>
            <Text fontSize="sm" fontWeight="black" color="yellow.300">
              {Math.round((team.score ?? 0) * 100)}%
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Grid>
);
