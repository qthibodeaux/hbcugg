import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Shield } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import { fmt, pct } from "./gameSummaryUtils";

export const WhyItHappened = ({ model }) => (
  <Panel accent="#9F7AEA" minH="100%">
    <Kicker icon={Shield} color="#9F7AEA">
      Why It Happened
    </Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box
          key={team.id}
          bg="whiteAlpha.50"
          p={3}
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="sm" color="white" fontWeight="black" mb={2}>
            {team.label}
          </Text>
          {[
            ["Disruption", pct(team.defense.disruption_rate)],
            ["Explosive Prev", pct(team.defense.explosive_prevention_rate)],
            ["Pressure", pct(team.pressure.pressure_rate_forced)],
            ["Q4 Lead Takes", fmt(team.sequence.q4_lead_takes, 0)],
            [
              "Consec Scores",
              fmt(team.sequence.max_consecutive_scoring_drives, 0),
            ],
          ].map(([label, value]) => (
            <Flex
              key={label}
              justify="space-between"
              py={1.5}
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text
                fontSize="10px"
                color="text.muted"
                fontWeight="black"
                textTransform="uppercase"
              >
                {label}
              </Text>
              <Text fontSize="sm" color="white" fontWeight="black">
                {value}
              </Text>
            </Flex>
          ))}
        </Box>
      ))}
    </Grid>
  </Panel>
);
