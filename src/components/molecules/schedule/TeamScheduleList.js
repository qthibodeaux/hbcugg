import { TeamScheduleGameRowCompact } from "./teamScheduleRows/TeamScheduleGameRowCompact";
import { TeamScheduleGameRowStandard } from "./teamScheduleRows/TeamScheduleGameRowStandard";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const GameRow = ({ game }) => {
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;
  const content = (
    <>
      <TeamScheduleGameRowCompact game={game} />
      <TeamScheduleGameRowStandard game={game} />
    </>
  );

  return isCorpus
    ? <Box as={Link} to={game.route ?? `/game/${game.parsed_game_stem}`} display="block">{content}</Box>
    : content;
};

const ScheduleSection = ({ label, countLabel, accent, games }) => {
  const { isMobile } = useLayoutDensity();

  return (
    <Box mb={isMobile ? 0 : 6}>
      {/* Header strip is desktop-only — on mobile it reads as chrome the
          rows don't need, and square/edge-to-edge is the mobile rule. */}
      {!isMobile && (
        <Flex align="center" gap={3} mb={3}>
          <Box w="4px" h="20px" bg={accent} borderRadius="full" />
          <Text fontSize="xs" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.12em">
            {label}
          </Text>
          <Text fontSize="9px" color="text.muted">
            {countLabel}
          </Text>
          <Box flex={1} h="1px" bg="whiteAlpha.100" />
        </Flex>
      )}
      <Box
        bg="bg.secondary"
        border={isMobile ? "none" : "1px solid"}
        borderColor="whiteAlpha.100"
        borderRadius={isMobile ? 0 : "xl"}
        overflow="hidden"
      >
        {games.map((game, index) => (
          <GameRow key={game.parsed_game_stem || `${label}-${index}`} game={game} />
        ))}
      </Box>
    </Box>
  );
};

export const TeamScheduleList = ({
  accent,
  seasonGames,
  completed,
  upcoming,
  team,
  season,
}) => {
  if (!seasonGames.length) {
    return (
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={12} textAlign="center">
        <Text fontSize="lg" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
          No games for {team?.shortName ?? "this team"} in {season}
        </Text>
        <Text fontSize="sm" color="text.muted" mt={2}>
          Try a different season.
        </Text>
      </Box>
    );
  }

  return (
    <>
      {completed.length > 0 && (
        <ScheduleSection label="Results" countLabel={`${completed.length} games`} accent={accent} games={completed} />
      )}

      {upcoming.length > 0 && (
        <ScheduleSection label="Upcoming" countLabel={`${upcoming.length} games remaining`} accent="whiteAlpha.300" games={upcoming} />
      )}

      {completed.length === 0 && upcoming.length === 0 && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={10} textAlign="center">
          <Text fontSize="md" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.1em">
            No schedule rows available
          </Text>
          <Text fontSize="sm" color="text.muted" mt={2}>
            Try a different season.
          </Text>
        </Box>
      )}
    </>
  );
};
