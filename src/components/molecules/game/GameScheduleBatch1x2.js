import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const toTicker = (team) => {
  const raw = String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (raw || "TEAM").slice(0, 4);
};

const winnerColor = (game) => {
  const home = Number(game?.homeScore);
  const away = Number(game?.awayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return "whiteAlpha.300";
  if (home > away) return game?.home?.primary ?? "whiteAlpha.300";
  if (away > home) return game?.away?.primary ?? "whiteAlpha.300";
  return "whiteAlpha.300";
};

const GameRow = ({ game, mode }) => {
  const clickTo = mode === "result" && game?.gameId ? `/game/${encodeURIComponent(game.gameId)}` : null;
  const leftLabel = `${toTicker(game?.away)} @ ${toTicker(game?.home)}`;
  const rightLabel =
    mode === "result"
      ? `${game?.awayScore ?? "--"}-${game?.homeScore ?? "--"}`
      : String(game?.dateLabel ?? "TBD").replace(" ", "");

  return (
    <Box
      as={clickTo ? RouterLink : "div"}
      to={clickTo || undefined}
      px={3}
      py={2}
      borderRadius="md"
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor={mode === "result" ? winnerColor(game) : "whiteAlpha.200"}
      cursor={clickTo ? "pointer" : "default"}
      _hover={clickTo ? { bg: "whiteAlpha.200" } : undefined}
      transition="all 0.15s ease"
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Box minW={0}>
          <Text fontSize="sm" color="white" fontWeight="bold" letterSpacing="0.04em" lineClamp={1}>
            {leftLabel}
          </Text>
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" lineClamp={1}>
            {game?.stageLabel ?? "Week --"}
          </Text>
        </Box>

        <Flex align="center" gap={2} flexShrink={0}>
          <Badge bg={mode === "result" ? "whiteAlpha.300" : "blue.500"} color="white" fontSize="9px">
            {mode === "result" ? "FINAL" : "PRE"}
          </Badge>
          <Text fontSize="sm" color="white" fontWeight="black">
            {rightLabel}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

const GameScheduleBatch1x2 = ({ title, sections = [], minHeight = "520px" }) => {
  return (
    <Box p={3} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200" bg="blackAlpha.350" minH={minHeight}>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
        {title}
      </Text>

      <Flex direction="column" gap={3}>
        {sections.map((section) => (
          <Box key={section.id}>
            <Text fontSize="10px" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
              {section.label}
            </Text>
            <Flex direction="column" gap={2}>
              {(section.games ?? []).map((game, idx) => (
                <GameRow
                  key={`${section.id}-${game?.id ?? idx}-${idx}`}
                  game={game}
                  mode={section.mode}
                />
              ))}
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default GameScheduleBatch1x2;
