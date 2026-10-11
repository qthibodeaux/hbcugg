import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Trophy } from "lucide-react";
import { Panel, Kicker } from "./GameSummaryPanel";
import { fmt, cleanName } from "./gameSummaryUtils";

export const ImpactLeaders = ({ model }) => (
  <Panel accent="#48BB78" minH="100%">
    <Kicker icon={Trophy} color="#48BB78">
      Impact Leaders
    </Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} minW={0}>
          <Flex align="center" gap={2} mb={2}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="sm" color="white" fontWeight="black">
              {team.label}
            </Text>
          </Flex>
          <Flex direction="column" gap={2}>
            {team.production.slice(0, 4).map((player, index) => (
              <Flex
                key={`${team.id}-${player.player_key}`}
                align="center"
                gap={2}
                p={2}
                bg={index === 0 ? `${team.color}22` : "whiteAlpha.50"}
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Box w="3px" alignSelf="stretch" bg={team.color} />
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="xs"
                    color="white"
                    fontWeight="black"
                    lineClamp={1}
                  >
                    {cleanName(player.name)}
                  </Text>
                  <Text
                    fontSize="9px"
                    color="text.muted"
                    fontWeight="black"
                    textTransform="uppercase"
                  >
                    {player.position}
                  </Text>
                </Box>
                <Text fontSize="sm" color="white" fontWeight="black">
                  {fmt(player.production_total, 1)}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      ))}
    </Grid>
  </Panel>
);
