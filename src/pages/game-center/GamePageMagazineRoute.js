import { useQuery } from "@tanstack/react-query";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { GamePageMagazine } from "../../components/organisms/test/GamePageMagazine";
import { gameCenterPaths } from "../../utils/gameCenterPayloads";

const fetchGame = async (gameId) => {
  const indexRes = await fetch(gameCenterPaths.gamesIndex());
  if (!indexRes.ok) throw new Error("Failed to load game index");
  const gameIndex = await indexRes.json();
  const requested = String(gameId ?? "").trim();
  const requestedUpper = requested.toUpperCase();

  let match = gameIndex.find(
    (e) =>
      String(e.game_stem).toLowerCase() === requested.toLowerCase() ||
      String(e.game_id).toUpperCase() === requestedUpper,
  );

  if (!match && requested.toLowerCase() === "pvamutsu") {
    match =
      gameIndex.find((e) => e.game_stem === "W1pvamutsu") ??
      [...gameIndex]
        .filter((e) => String(e.game_stem).toLowerCase().includes("pvamutsu"))
        .sort((a, b) => Number(b.season) - Number(a.season))[0];
  }

  if (!match) throw new Error("Game data not found");
  const res = await fetch(gameCenterPaths.gameFile(match.season, match.game_stem));
  if (!res.ok) throw new Error("Failed to load game payload");
  return res.json();
};

const fetchPlayerImages = async () => {
  const res = await fetch("/data/2-schools/ALL_2025_teams_frontend_ready_v2.json");
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  Object.values(data.teams ?? {}).forEach((team) =>
    (team.roster ?? []).forEach((p) => { if (p.id && p.image_url) map[p.id] = p.image_url; }),
  );
  return map;
};

const GamePageMagazineRoute = () => {
  const { gameId = "W15pvamujsu" } = useParams();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => fetchGame(gameId),
  });

  const { data: imageMap = {} } = useQuery({
    queryKey: ["playerImages"],
    queryFn: fetchPlayerImages,
    staleTime: Infinity,
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

  return <GamePageMagazine game={game} imageMap={imageMap} />;
};

export default GamePageMagazineRoute;
