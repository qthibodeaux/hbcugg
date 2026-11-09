import { useNavigate } from "react-router-dom";
import { getPlayerName, formatHeight, MOBILE_COLUMNS, getLastName } from "./outlookModel";
import { Grid, Text, Box, Flex } from "@chakra-ui/react";
import { SchoolCell, EligibilityBar } from "./EligibilityCells";

export const PlayerRowStandard = ({ player, teamColors, team }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const score = player.experience_score ?? "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    <Grid
      templateColumns="2.5rem 1fr 3.5rem 4rem 3rem 6rem auto"
      alignItems="center"
      gap={3}
      py={1}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Text fontSize="md" fontWeight="black" color="text.primary" textAlign="center">
        {player.jersey_number ?? "--"}
      </Text>
      <Box as="button" type="button" onClick={goToPlayer} minW={0} textAlign="left" bg="transparent" border="none" p={0} cursor="pointer">
        <Text fontSize="lg" fontWeight="black" color="text.primary" lineClamp={1} _hover={{ textDecoration: "underline" }}>
          {name}
        </Text>
      </Box>
      <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1}>
        {height}
      </Text>
      <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1}>
        {weight} lbs
      </Text>
      <Text fontSize="lg" fontWeight="black" color="text.primary" textAlign="center">
        {score}
      </Text>
      <Flex justify="flex-end" align="center" minW={0}>
        <SchoolCell player={player} team={team} />
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} />
    </Grid>
  );
};

export const PlayerRowCompact = ({ player, teamColors, team }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const score = player.experience_score ?? "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    <Grid
      templateColumns="2rem 1fr 2.5rem 4rem auto"
      alignItems="center"
      gap={2}
      py={1}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Text fontSize="sm" fontWeight="black" color="text.primary" textAlign="center">
        {player.jersey_number ?? "--"}
      </Text>
      <Box as="button" type="button" onClick={goToPlayer} minW={0} textAlign="left" bg="transparent" border="none" p={0} cursor="pointer">
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1} _hover={{ textDecoration: "underline" }}>
          {name}
        </Text>
        <Text fontSize="9px" color="text.muted" lineClamp={1}>
          {height} / {weight} lbs
        </Text>
      </Box>
      <Text fontSize="sm" fontWeight="black" color="text.primary" textAlign="center">
        {score}
      </Text>
      <Flex justify="flex-end" align="center" minW={0}>
        <SchoolCell player={player} team={team} />
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} />
    </Grid>
  );
};

export const PlayerRowMobile = ({ player, teamColors }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    // alignItems=stretch + zero vertical padding on the grid itself: the
    // eligibility boxes run the full height of the row, edge to edge. The
    // text cells carry their own padding so they still sit centered with
    // breathing room.
    <Grid
      templateColumns={MOBILE_COLUMNS}
      alignItems="stretch"
      gap={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Flex as="button" type="button" onClick={goToPlayer} align="center" minW={0} textAlign="left" bg="transparent" border="none" px={0} py={2} cursor="pointer">
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
          {getLastName(player)}
        </Text>
      </Flex>
      <Flex align="center" justify="center" minW={0}>
        <Text fontSize="11px" color="text.muted" lineClamp={1}>{height}</Text>
      </Flex>
      <Flex align="center" justify="center" minW={0}>
        <Text fontSize="11px" color="text.muted" lineClamp={1}>{weight}</Text>
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} mobile />
    </Grid>
  );
};
