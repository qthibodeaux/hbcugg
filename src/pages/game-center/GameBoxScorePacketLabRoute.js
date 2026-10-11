import { useQuery } from "@tanstack/react-query";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { GameBoxScorePacketLab } from "../../components/organisms/test/GameBoxScorePacketLab";

const fetchGame = async (gameId) => {
  const requested = String(gameId || "W15pvamujsu").trim();
  const res = await fetch(`/data/1-game center/games/2025/${requested}.json`);
  if (!res.ok) throw new Error("Failed to load game payload");
  return res.json();
};

const GameBoxScorePacketLabRoute = () => {
  const { gameId = "W15pvamujsu" } = useParams();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game-box-score-packet-lab", gameId],
    queryFn: () => fetchGame(gameId),
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
          <Text color="text.muted" fontSize="sm">Game data not found.</Text>
        </Center>
      </Box>
    );
  }

  return <GameBoxScorePacketLab game={game} />;
};

export default GameBoxScorePacketLabRoute;
