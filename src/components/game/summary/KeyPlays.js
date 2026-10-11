import { Box, Flex, Text } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import { signed, getTeamLabel } from "./gameSummaryUtils";

export const KeyPlays = ({ model }) => (
  <Panel accent="#F6AD55" minH="100%">
    <Kicker icon={Sparkles} color="#F6AD55">
      Top EPA Swings
    </Kicker>
    <Flex direction="column" gap={2}>
      {model.keyPlays.map((play, index) => (
        <Box
          key={play.play_id ?? index}
          p={3}
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Flex align="center" justify="space-between" mb={1}>
            <Text
              fontSize="10px"
              color="text.muted"
              fontWeight="black"
            >
              Q{play.quarter} {play.clock} |{" "}
              {getTeamLabel(play.offense_team)}
            </Text>
            <Text
              fontSize="sm"
              color={play.epa.epa >= 0 ? "#48BB78" : "#F56565"}
              fontWeight="black"
            >
              {signed(play.epa.epa, 2)} EPA
            </Text>
          </Flex>
          <Text fontSize="xs" color="text.secondary" lineClamp={2}>
            {play.raw_text}
          </Text>
        </Box>
      ))}
    </Flex>
  </Panel>
);
