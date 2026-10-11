import { Box, Grid, Text, Flex } from "@chakra-ui/react";
import { Activity } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import { getTeamLabel } from "./gameSummaryUtils";

export const ScoringTimeline = ({ model }) => (
  <Panel accent="#63B3ED" minH="100%">
    <Kicker icon={Activity} color="#63B3ED">
      Game Flow Capsule
    </Kicker>
    <Flex direction="column" gap={2}>
      {model.scoring.slice(0, 10).map((play, index) => (
        <Grid
          key={`${play.quarter}-${play.clock}-${index}`}
          templateColumns="58px 1fr auto"
          gap={3}
          alignItems="center"
          py={2}
          borderTop={index === 0 ? "0" : "1px solid"}
          borderColor="whiteAlpha.100"
        >
          <Box>
            <Text fontSize="10px" color="text.muted" fontWeight="black">
              Q{play.quarter}
            </Text>
            <Text fontSize="10px" color="text.secondary">
              {play.clock}
            </Text>
          </Box>
          <Box minW={0}>
            <Text
              fontSize="xs"
              color="white"
              fontWeight="black"
              lineClamp={1}
            >
              {getTeamLabel(play.team)} {play.type} | {play.points} pts
            </Text>
            <Text fontSize="10px" color="text.muted" lineClamp={1}>
              {play.text}
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black">
            {play.awayScore}-{play.homeScore}
          </Text>
        </Grid>
      ))}
    </Flex>
  </Panel>
);
