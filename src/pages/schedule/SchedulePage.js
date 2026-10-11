import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Box, Text, Flex, Spinner, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ContentContainer from "../../components/layouts/ContentContainer";

const fetchJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const GameCard = ({ game }) => {
  const winner = game.away.score > game.home.score ? "away" : "home";
  return (
    <Link to={`/game/${game.stem}`} style={{ display: "block" }}>
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={5}
        _hover={{ borderColor: "brand.500", bg: "whiteAlpha.50" }}
        transition="all 0.15s"
        maxW="480px"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text
            fontSize="xs"
            color="brand.400"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {game.week}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {game.date}
          </Text>
        </Flex>

        <Flex align="center" justify="space-between" mb={3}>
          {/* Away */}
          <Box flex={1}>
            <Text
              fontSize="xl"
              fontWeight="black"
              color={winner === "away" ? "text.primary" : "text.muted"}
            >
              {game.away.label}
            </Text>
            <Text fontSize="xs" color="text.muted">
              Away
            </Text>
          </Box>

          {/* Score */}
          <Flex align="center" gap={3} mx={4}>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color={winner === "away" ? "text.primary" : "text.muted"}
            >
              {game.away.score}
            </Text>
            <Text fontSize="lg" color="whiteAlpha.300">
              –
            </Text>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color={winner === "home" ? "text.primary" : "text.muted"}
            >
              {game.home.score}
            </Text>
          </Flex>

          {/* Home */}
          <Box flex={1} textAlign="right">
            <Text
              fontSize="xl"
              fontWeight="black"
              color={winner === "home" ? "text.primary" : "text.muted"}
            >
              {game.home.label}
            </Text>
            <Text fontSize="xs" color="text.muted">
              Home
            </Text>
          </Box>
        </Flex>

        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="text.muted">
            {game.site}
          </Text>
          <Flex align="center" gap={1} color="brand.400">
            <Text fontSize="xs" fontWeight="bold">
              Full Recap
            </Text>
            <ArrowRight size={12} />
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
};

const SchedulePage = () => <SchedulePageContent />;

const SchedulePageContent = () => {
  const [selectedSeason, setSelectedSeason] = useState(2025);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["schedule-page", "master"],
    queryFn: async () => {
      const [scheduleMaster, gameIndex] = await Promise.all([
        fetchJson(
          "/data/1-game center/schedules/schedule_master_frontend.json",
        ),
        fetchJson("/data/1-game center/games/index.json"),
      ]);
      return { scheduleMaster, gameIndex };
    },
    staleTime: Infinity,
    retry: false,
  });

  const seasons = useMemo(() => {
    const rows = data?.scheduleMaster?.games ?? [];
    const unique = new Set(
      rows.map((row) => Number(row.season)).filter(Boolean),
    );
    return [...unique].sort((a, b) => b - a);
  }, [data]);

  const effectiveSeason = seasons.includes(selectedSeason)
    ? selectedSeason
    : (seasons[0] ?? 2025);

  const weekByStem = useMemo(() => {
    const rows = data?.scheduleMaster?.games ?? [];
    return rows.reduce((acc, row) => {
      if (Number(row.season) !== Number(effectiveSeason)) return acc;
      if (!row.parsed_game_stem) return acc;
      if (!acc[row.parsed_game_stem]) {
        acc[row.parsed_game_stem] = row.week ?? null;
      }
      return acc;
    }, {});
  }, [data, effectiveSeason]);

  const games = useMemo(() => {
    const indexRows = data?.gameIndex ?? [];
    return indexRows
      .filter((row) => Number(row.season) === Number(effectiveSeason))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 30)
      .map((row) => ({
        stem: row.game_stem,
        date: row.date,
        site: row.site,
        week: weekByStem[row.game_stem]
          ? `Week ${weekByStem[row.game_stem]}`
          : "Non-Conference",
        away: {
          label: String(row.away_team_id ?? "AWAY")
            .replace(/^swac|^meac/i, "")
            .toUpperCase(),
          score: row.away_score ?? 0,
        },
        home: {
          label: String(row.home_team_id ?? "HOME")
            .replace(/^swac|^meac/i, "")
            .toUpperCase(),
          score: row.home_score ?? 0,
        },
      }));
  }, [data, effectiveSeason, weekByStem]);

  return (
    <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
      <ContentContainer py={10}>
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="widest"
          mb={2}
        >
          {effectiveSeason} Season
        </Text>
        <Text fontSize="3xl" fontWeight="black" color="text.primary" mb={1}>
          Schedule
        </Text>
        <Text fontSize="sm" color="text.secondary" mb={6}>
          Data-backed feed from game center schedules and parsed game payload
          index.
        </Text>

        {isLoading && (
          <Flex justify="center" py={16}>
            <Spinner color="brand.500" size="lg" />
          </Flex>
        )}

        {isError && (
          <Box
            bg="bg.secondary"
            border="1px solid"
            borderColor="red.500"
            borderRadius="lg"
            p={5}
          >
            <Text color="red.300" fontWeight="bold" mb={1}>
              Failed to load schedule exports
            </Text>
            <Text color="text.muted" fontSize="sm">
              {String(error?.message ?? "Unknown error")}
            </Text>
          </Box>
        )}

        {!isLoading && !isError && (
          <>
            <Flex gap={2} wrap="wrap" mb={8}>
              {seasons.map((season) => (
                <Button
                  key={season}
                  size="sm"
                  onClick={() => setSelectedSeason(season)}
                  bg={
                    Number(season) === Number(effectiveSeason)
                      ? "brand.500"
                      : "bg.secondary"
                  }
                  color={
                    Number(season) === Number(effectiveSeason)
                      ? "white"
                      : "text.secondary"
                  }
                  border="1px solid"
                  borderColor={
                    Number(season) === Number(effectiveSeason)
                      ? "brand.500"
                      : "whiteAlpha.100"
                  }
                  _hover={{
                    bg:
                      Number(season) === Number(effectiveSeason)
                        ? "brand.600"
                        : "whiteAlpha.100",
                  }}
                >
                  {season}
                </Button>
              ))}
            </Flex>

            <Flex direction="column" gap={4}>
              {games.map((game) => (
                <GameCard key={game.stem} game={game} />
              ))}
            </Flex>
          </>
        )}
      </ContentContainer>
    </Box>
  );
};

export default SchedulePage;
