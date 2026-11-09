import { TEAM_BY_ID, isFinalGame, logo, compactLabel } from "./slateModel";
import { Flex, Image, Text, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const TeamMatchupRow = ({ rowTeamId, opponentId, game }) => {
  const opponent = TEAM_BY_ID[opponentId];
  const isComplete = isFinalGame(game);
  const teamIsAway = game?.away === rowTeamId;
  const teamScore = game ? (teamIsAway ? game.awayScore : game.homeScore) : null;
  const oppScore = game ? (teamIsAway ? game.homeScore : game.awayScore) : null;
  const won = isComplete && Number(teamScore) > Number(oppScore);
  const lost = isComplete && Number(teamScore) < Number(oppScore);

  const content = (
    <Flex
      align="center"
      justify="space-between"
      px="0.75rem"
      py="0.6rem"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg={won ? `${opponent.colors.primary}26` : "transparent"}
    >
      <Flex align="center" gap="0.5rem" minW={0}>
        <Image src={logo(opponent)} alt="" w="1.6rem" h="1.6rem" objectFit="contain" flexShrink={0} />
        <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
          {compactLabel(opponent)}
        </Text>
      </Flex>
      <Flex align="center" gap="0.4rem" flexShrink={0}>
        {isComplete && (
          <Text fontSize="0.65rem" fontWeight="black" color={won ? "#4ADE80" : lost ? "#F87171" : "text.muted"}>
            {won ? "W" : lost ? "L" : "-"}
          </Text>
        )}
        <Text fontSize="1rem" fontWeight="black" color="white">
          {isComplete ? `${teamScore}-${oppScore}` : "TBD"}
        </Text>
      </Flex>
    </Flex>
  );

  return game?.stem ? (
    <Box as={Link} to={`/game/${game.stem}`} display="block">
      {content}
    </Box>
  ) : (
    content
  );
};

export const TeamSlateCard = ({ teamId, teamIds, lookup }) => {
  const team = TEAM_BY_ID[teamId];
  const opponents = teamIds.filter((id) => id !== teamId);

  return (
    <Box flex="0 0 100%" minW={0} style={{ scrollSnapAlign: "start" }}>
      <Flex align="center" gap="0.6rem" px="0.75rem" py="0.75rem" bg={`linear-gradient(135deg, ${team.colors.primary} 0%, rgba(10,10,12,0.95) 70%)`}>
        <Image src={logo(team)} alt="" w="2.5rem" h="2.5rem" objectFit="contain" flexShrink={0} />
        <Text fontSize="1.1rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
          {team.name ?? compactLabel(team)}
        </Text>
      </Flex>
      <Box>
        {opponents.map((oppId) => (
          <TeamMatchupRow
            key={oppId}
            rowTeamId={teamId}
            opponentId={oppId}
            game={lookup[[teamId, oppId].sort().join("|")]}
          />
        ))}
      </Box>
    </Box>
  );
};
