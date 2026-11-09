import { Flex, Grid } from "@chakra-ui/react";
import { SummaryStrip } from "./specialTeamsProduction/ProductionCards";
import { PhaseRow } from "./specialTeamsProduction/PhaseRows";

export const GameProductionSpecialTeamsA = () => (
  <Flex w="full" h="full" direction="column" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <SummaryStrip />
    <Grid templateRows="repeat(3, minmax(0, 1fr))" gap="6px" flex={1} minH={0} py="6px">
      <PhaseRow title="Field Goals" phase="fieldGoals" />
      <PhaseRow title="Kickoffs" phase="kickoff" />
      <PhaseRow title="Punts" phase="punt" />
    </Grid>
  </Flex>
);

export { SPECIAL_TEAMS_PRODUCTION } from "./specialTeamsProduction/productionData";
