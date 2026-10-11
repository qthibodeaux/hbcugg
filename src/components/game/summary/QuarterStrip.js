import { Box, Grid, Text } from "@chakra-ui/react";
import { Clock3 } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";

export const QuarterStrip = ({ model }) => (
  <Panel accent="#F56565" p={3}>
    <Kicker icon={Clock3}>Quarter Scoring</Kicker>
    <Grid
      templateColumns="1.2fr repeat(4, 1fr) 1fr"
      gap={2}
      alignItems="center"
      mb={3}
    >
      <Text
        fontSize="10px"
        color="text.muted"
        fontWeight="black"
        textTransform="uppercase"
      >
        Team
      </Text>
      {[1, 2, 3, 4].map((q) => (
        <Text
          key={q}
          fontSize="10px"
          color="text.muted"
          fontWeight="black"
          textAlign="center"
        >
          Q{q}
        </Text>
      ))}
      <Text
        fontSize="10px"
        color="text.muted"
        fontWeight="black"
        textAlign="right"
      >
        Final
      </Text>
      {model.teams.map((team) => (
        <>
          <Text
            key={`${team.id}-label`}
            fontSize="sm"
            color="white"
            fontWeight="black"
          >
            {team.label}
          </Text>
          {model.quarterScores.map((row) => (
            <Text
              key={`${team.id}-${row.quarter}`}
              fontSize="sm"
              color="text.secondary"
              fontWeight="black"
              textAlign="center"
            >
              {team.id === model.awayId ? row.away : row.home}
            </Text>
          ))}
          <Text
            key={`${team.id}-final`}
            fontSize="lg"
            color="white"
            fontWeight="black"
            textAlign="right"
          >
            {team.score}
          </Text>
        </>
      ))}
    </Grid>
    <Box borderTop="1px solid" borderColor="whiteAlpha.100" pt={3}>
      <Text
        fontSize="10px"
        color="text.muted"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.12em"
        mb={1}
      >
        Read
      </Text>
      <Text fontSize="xs" color="text.secondary" lineClamp={3}>
        Keep this compact unless quarters gain drive-level context, lead-change
        markers, or scoring-run annotations.
      </Text>
    </Box>
  </Panel>
);
