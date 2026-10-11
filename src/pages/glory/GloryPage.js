import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import { Crown, Sparkles, AlertTriangle } from "lucide-react";
import ContentContainer from "../../components/layouts/ContentContainer";
import teamsData from "../../data/teams.json";

const fetchJsonSafe = async (path) => {
  const res = await fetch(path);
  if (!res.ok) return null;
  return res.json();
};

const fetchJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const TEAM_BY_V5 = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team.shortName;
  return acc;
}, {});

const StatCard = ({ label, value, accent = "brand.500" }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    p={4}
  >
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={2}>
      {label}
    </Text>
    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color={accent} lineHeight={1}>
      {value}
    </Text>
  </Box>
);

const GloryPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["glory", "v1"],
    queryFn: async () => {
      const [manifest, playerAnalytics, continuity] = await Promise.all([
        fetchJson("/data/manifest.json"),
        fetchJson("/data/0-data/player_analytics_2025.json"),
        fetchJson("/data/0-data/team_continuity_2021_2025.json"),
      ]);
      const gloryManifest = await fetchJsonSafe("/data/7-glory/manifest.json");
      return { manifest, playerAnalytics, continuity, gloryManifest };
    },
    staleTime: Infinity,
    retry: false,
  });

  const topPlayers = useMemo(() => {
    const board = data?.playerAnalytics?.leaderboards_enriched ?? {};
    const flattened = Object.values(board).flat();
    const deduped = Object.values(
      flattened.reduce((acc, player) => {
        const key = player.player_key ?? `${player.name_display}_${player.team}`;
        if (!acc[key] || (player.par ?? 0) > (acc[key].par ?? 0)) {
          acc[key] = player;
        }
        return acc;
      }, {}),
    );
    return deduped.sort((a, b) => (b.par ?? 0) - (a.par ?? 0)).slice(0, 12);
  }, [data]);

  const topPrograms = data?.continuity?.league_summary?.top_5 ?? [];
  const gloryFileCount = data?.manifest?.domains?.glory?.files?.length ?? 0;

  return (
    <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
      <ContentContainer py={10}>
        <Flex align="center" gap={3} mb={2}>
          <Crown size={18} color="var(--chakra-colors-brand-500)" />
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest">
            Legacy Signal
          </Text>
        </Flex>

        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="text.primary" mb={1}>
          Glory
        </Text>
        <Text fontSize="sm" color="text.secondary" mb={8} maxW="760px">
          Provisional glory board powered by current performance analytics and program continuity
          while the dedicated 7-glory dataset is being finalized.
        </Text>

        {isLoading && (
          <Flex justify="center" py={16}>
            <Spinner color="brand.500" size="lg" />
          </Flex>
        )}

        {isError && (
          <Box bg="bg.secondary" border="1px solid" borderColor="red.500" borderRadius="lg" p={5}>
            <Text color="red.300" fontWeight="bold" mb={1}>Failed to load Glory sources</Text>
            <Text color="text.muted" fontSize="sm">{String(error?.message ?? "Unknown error")}</Text>
          </Box>
        )}

        {!isLoading && !isError && (
          <>
            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mb={8}>
              <StatCard label="Glory Files" value={gloryFileCount} accent="orange.300" />
              <StatCard label="Top Players Tracked" value={topPlayers.length} />
              <StatCard label="Programs in Continuity" value={data?.continuity?.league_summary?.total_teams ?? 0} accent="yellow.300" />
              <StatCard label="Source Season" value={data?.playerAnalytics?.season ?? "2025"} accent="purple.300" />
            </Grid>

            {gloryFileCount === 0 && (
              <Flex
                mb={8}
                gap={3}
                align="center"
                bg="bg.secondary"
                border="1px solid"
                borderColor="orange.400"
                borderRadius="lg"
                px={4}
                py={3}
              >
                <AlertTriangle size={16} color="var(--chakra-colors-orange-300)" />
                <Text fontSize="sm" color="text.secondary">
                  7-glory domain is currently empty. This page is running in provisional mode from existing analytics exports.
                </Text>
              </Flex>
            )}

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
          </>
        )}
      </ContentContainer>
    </Box>
  );
};

export default GloryPage;
