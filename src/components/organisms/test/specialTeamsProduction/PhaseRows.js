import { Grid, Flex, Text } from "@chakra-ui/react";
import { PhaseCard } from "./ProductionCards";
import { SPECIAL_TEAMS_PRODUCTION } from "./productionData";

// Two-team special-teams phase row composition.

export const PhaseRow = ({ title, phase, children }) => (
  <Grid templateColumns="46px repeat(2, minmax(0, 1fr))" gap="6px" px="6px" minH={0}>
    <Flex align="center" justify="center" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm">
      <Text
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        fontSize="8px"
        color="text.muted"
        fontWeight="950"
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        {title}
      </Text>
    </Flex>
    <PhaseCard team={SPECIAL_TEAMS_PRODUCTION.pvamu} phase={phase}>{children?.pvamu}</PhaseCard>
    <PhaseCard team={SPECIAL_TEAMS_PRODUCTION.jsu} phase={phase}>{children?.jsu}</PhaseCard>
  </Grid>
);
