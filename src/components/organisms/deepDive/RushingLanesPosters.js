import { TeamCard } from "./rushingLanes/DetailedLaneCard";
import { fgOf, POSTER_W, caps } from "./gridPosterKit";
import { Flex, Text, Box, Grid } from "@chakra-ui/react";
import { ExportWordmark } from "../../molecules/export/ExportWordmark";
import { RL_META, LEAGUE, TEAMS } from "./rushingLanes/lanePresentation";
import { SimpleCard } from "./rushingLanes/SimpleLaneCard";

// The poster frame; `Card` picks the version (SimpleCard or TeamCard, the deluxe one).
const RushingLanesPoster = ({ pal, innerRef, Card = TeamCard }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{RL_META.season} · {LEAGUE} games · Through Week {RL_META.through_week}</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
        The <Box as="span" color={pal.brand}>rushing lanes</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="14px">
        {TEAMS.map((t) => <Card key={t.team_id} pal={pal} t={t} />)}
      </Grid>
    </Flex>
  );
};

const SimplePoster = (props) => <RushingLanesPoster {...props} Card={SimpleCard} />;
const DeluxePoster = (props) => <RushingLanesPoster {...props} Card={TeamCard} />;

export const RUSHING_LANES_POSTERS = [
  { id: "simple", chip: "Simple", Poster: SimplePoster },
  { id: "lanes", chip: "Deluxe", Poster: DeluxePoster },
];

export { RL_META } from "./rushingLanes/lanePresentation";
