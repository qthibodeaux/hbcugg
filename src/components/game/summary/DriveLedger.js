import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { BarChart3 } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import {  readableResult, getTeamColor, getTeamLabel } from "./gameSummaryUtils";

export const DriveLedger = ({ model }) => (
  <Panel accent="#CBD5E0" p={3}>
    <Kicker icon={BarChart3} color="#CBD5E0">
      All Drives Ledger
    </Kicker>
    <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={2}>
      {model.drives.map((drive, index) => {
        const color = getTeamColor(drive.offense_team, "#CBD5E0");
        const scored = Number(drive.points) > 0;
        return (
          <Box
            key={drive.drive_id ?? index}
            bg={scored ? `${color}33` : "whiteAlpha.50"}
            border="1px solid"
            borderColor={scored ? color : "whiteAlpha.100"}
            p={2}
            minH="74px"
          >
            <Flex justify="space-between" align="center" mb={1}>
              <Text
                fontSize="9px"
                color="text.muted"
                fontWeight="black"
              >
                D{index + 1}
              </Text>
              <Text fontSize="9px" color="white" fontWeight="black">
                {getTeamLabel(drive.offense_team)}
              </Text>
            </Flex>
            <Text
              fontSize="xs"
              color="white"
              fontWeight="black"
              lineClamp={1}
            >
              {readableResult(drive.result)}
            </Text>
            <Text fontSize="10px" color="text.muted" lineClamp={1}>
              {drive.plays_total} plays | {drive.yards_net} yds
            </Text>
            <Text
              fontSize="10px"
              color={scored ? "white" : "text.muted"}
              fontWeight="black"
            >
              {drive.points} pts
            </Text>
          </Box>
        );
      })}
    </Grid>
  </Panel>
);
