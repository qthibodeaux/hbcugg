import { Flex, Grid } from "@chakra-ui/react";
import { Banner, Strip } from "./scout/ScoutHeader";
import { Sheets, Quarterback } from "./scout/ScoutPassing";
import { Advantage, Leaders } from "./scout/ScoutUnits";

// Panels butt together: each grid has a 1px gap over the hairline colour, so
// the seams are lines rather than gutters, inside one rounded frame.
const SEAM = { gap: "1px", bg: "rgba(168,85,247,0.35)" };

export const GamePreviewScout = ({ m }) => {
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].map((p) => p.production), 1);
  return (
    <Flex direction="column" w="full" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor="rgba(168,85,247,0.35)" {...SEAM}>
      <Banner m={m} />
      <Grid templateColumns="repeat(2, minmax(0,1fr))" {...SEAM}>
        <Strip side={m.away} />
        <Strip side={m.home} />
      </Grid>
      <Grid templateColumns="minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr)" alignItems="stretch" {...SEAM}>
        <Flex direction="column" {...SEAM}><Sheets side={m.away} total={m.ranked_teams} /><Quarterback side={m.away} /></Flex>
        <Advantage m={m} />
        <Flex direction="column" {...SEAM}><Sheets side={m.home} total={m.ranked_teams} /><Quarterback side={m.home} /></Flex>
      </Grid>
      <Grid templateColumns="repeat(2, minmax(0,1fr))" {...SEAM}>
        <Leaders side={m.away} max={max} />
        <Leaders side={m.home} max={max} />
      </Grid>
    </Flex>
  );
};

export default GamePreviewScout;

export { brandOf, inkOn, STRIP, COUNTING, EFFICIENCY } from "./scout/scoutPresentation";

export { AirYards, PassGrid } from "./scout/ScoutPassing";

export { GamePreviewScoutPoster } from "./scout/poster/GamePreviewScoutPoster";
