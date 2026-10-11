import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Flag } from "lucide-react";
import { Panel, Kicker, GradePill } from "./GameSummaryPanel";
import { fmt, pct, signed, grade } from "./gameSummaryUtils";

export const HiddenEdges = ({ model }) => (
  <Panel accent="#ECC94B" minH="100%">
    <Kicker icon={Flag} color="#ECC94B">
      Hidden Edges
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
          <Flex align="center" gap={2} mb={3}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="sm" color="white" fontWeight="black">
              {team.label}
            </Text>
          </Flex>
          {[
            {
              label: "Avg Start",
              value: fmt(team.box.avg_start_field_position, 1),
              context: grade(team.box.avg_start_field_position, [
                { min: 35, label: "A", color: "#48BB78", note: "short field" },
                { min: 30, label: "B", color: "#68D391", note: "plus" },
                { min: 25, label: "C", color: "#ECC94B", note: "normal" },
                { min: 20, label: "D", color: "#F6AD55", note: "backed up" },
              ]),
            },
            {
              label: "Long Field",
              value: pct(team.box.long_field_rate),
              context: grade(
                team.box.long_field_rate,
                [
                  { max: 0.35, label: "A", color: "#48BB78", note: "helped" },
                  { max: 0.5, label: "B", color: "#68D391", note: "ok" },
                  { max: 0.7, label: "C", color: "#ECC94B", note: "work" },
                  { max: 0.86, label: "D", color: "#F6AD55", note: "long" },
                ],
                false
              ),
            },
            {
              label: "ST Swing",
              value: signed(team.specialTeams.summary?.st_swing_yards, 0),
              context: grade(team.specialTeams.summary?.st_swing_yards, [
                { min: 20, label: "A", color: "#48BB78", note: "won edge" },
                { min: 5, label: "B", color: "#68D391", note: "plus" },
                { min: -5, label: "C", color: "#ECC94B", note: "even" },
                { min: -20, label: "D", color: "#F6AD55", note: "lost" },
              ]),
            },
            {
              label: "Penalty Cost",
              value: fmt(
                team.specialTeams.summary?.penalty_yards_cost ??
                  team.penalties.total_yards,
                0
              ),
              context: grade(
                team.specialTeams.summary?.penalty_yards_cost ??
                  team.penalties.total_yards,
                [
                  { max: 0, label: "A", color: "#48BB78", note: "clean" },
                  { max: 20, label: "B", color: "#68D391", note: "low" },
                  { max: 45, label: "C", color: "#ECC94B", note: "tax" },
                  { max: 70, label: "D", color: "#F6AD55", note: "costly" },
                ],
                false
              ),
            },
            {
              label: "Turnover Luck",
              value: signed(team.advanced.turnover_luck, 1),
              context: grade(team.advanced.turnover_luck, [
                { min: 1.5, label: "A", color: "#48BB78", note: "favored" },
                { min: 0.5, label: "B", color: "#68D391", note: "plus" },
                { min: -0.5, label: "C", color: "#ECC94B", note: "even" },
                { min: -2, label: "D", color: "#F6AD55", note: "hurt" },
              ]),
            },
          ].map((item) => (
            <Flex
              key={item.label}
              justify="space-between"
              py={1.5}
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Box>
                <Text
                  fontSize="10px"
                  color="text.muted"
                  fontWeight="black"
                  textTransform="uppercase"
                >
                  {item.label}
                </Text>
                <Text
                  fontSize="8px"
                  color={item.context.color}
                  fontWeight="black"
                  textTransform="uppercase"
                >
                  {item.context.note}
                </Text>
              </Box>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="white" fontWeight="black">
                  {item.value}
                </Text>
                <GradePill item={item.context} />
              </Flex>
            </Flex>
          ))}
        </Box>
      ))}
    </Grid>
  </Panel>
);
