import { useQuery } from "@tanstack/react-query";
import { Box, Center, Spinner, Text, Flex } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { BoxScoreBanner } from "../../components/organisms/test/boxScorePacket/TestGameBoxScoreBanner";
import { PassingTeamPanel, RushingTeamPanel, DefenseTeamPanel, SpecialTeamsTeamPanel } from "../../components/molecules/game/GameProductionPanels";

const fetchGamePayload = async () => {
  const res = await fetch("/data/1-game center/games/2025/W15pvamujsu.json");
  if (!res.ok) throw new Error("Failed to load game payload");
  return res.json();
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORTED PAGE
// ═══════════════════════════════════════════════════════════════
const TestGamePage = () => {
  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["test-gamepage-payload"],
    queryFn: fetchGamePayload,
  });

  if (isLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (isError || !game) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Text color="text.muted" fontSize="sm">Failed to load game data.</Text>
        </Center>
      </Box>
    );
  }

  const meta = game.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : (meta.away_team?.id || meta.away_team?.team_id || "");
  const homeId = typeof meta.home_team === "string" ? meta.home_team : (meta.home_team?.id || meta.home_team?.team_id || "");

  return (
    <PageShell>
      {/* Row 1: The Score Board Banner */}
      <PageShell.Slot cols={4}>
        <BoxScoreBanner game={game} />
      </PageShell.Slot>

      {/* Row 2: Standardized passing & receiving production (Side-by-Side) */}
      <PageShell.Slot cols={4} rows={2}>
        <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
          <Box flex={1} minW={0} borderRight="1px solid" borderColor="whiteAlpha.100">
            <PassingTeamPanel teamId={awayId} game={game} />
          </Box>
          <Box flex={1} minW={0}>
            <PassingTeamPanel teamId={homeId} game={game} />
          </Box>
        </Flex>
      </PageShell.Slot>

      {/* Row 3: Standardized rushing production (Side-by-Side) */}
      <PageShell.Slot cols={4} rows={2}>
        <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
          <Box flex={1} minW={0} borderRight="1px solid" borderColor="whiteAlpha.100">
            <RushingTeamPanel teamId={awayId} game={game} />
          </Box>
          <Box flex={1} minW={0}>
            <RushingTeamPanel teamId={homeId} game={game} />
          </Box>
        </Flex>
      </PageShell.Slot>

      {/* Row 4: Standardized Defensive Production (Side-by-Side) */}
      <PageShell.Slot cols={4} rows={2}>
        <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
          <Box flex={1} minW={0} borderRight="1px solid" borderColor="whiteAlpha.100">
            <DefenseTeamPanel teamId={awayId} game={game} />
          </Box>
          <Box flex={1} minW={0}>
            <DefenseTeamPanel teamId={homeId} game={game} />
          </Box>
        </Flex>
      </PageShell.Slot>

      {/* Row 5: Standardized Special Teams Production (Side-by-Side) */}
      <PageShell.Slot cols={4} rows={2}>
        <Flex w="full" h="full" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="whiteAlpha.100">
          <Box flex={1} minW={0} borderRight="1px solid" borderColor="whiteAlpha.100">
            <SpecialTeamsTeamPanel teamId={awayId} game={game} />
          </Box>
          <Box flex={1} minW={0}>
            <SpecialTeamsTeamPanel teamId={homeId} game={game} />
          </Box>
        </Flex>
      </PageShell.Slot>
    </PageShell>
  );
};

export default TestGamePage;
