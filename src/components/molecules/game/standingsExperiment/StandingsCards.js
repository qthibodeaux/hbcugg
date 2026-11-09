import { TEAM_BY_ID, gloryTopSix } from "../../../../data/standingsExperiment";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { TeamLogo, teamLabel, FormRail } from "./StandingsPrimitives";

// Division standings and Glory ranking cards for the standings experiment.

export const DivisionStandingsCard = ({ group }) => {
  const leader = group.rows[0];
  const leaderTeam = TEAM_BY_ID[leader.id];

  return (
    <Box
      h="100%"
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${leaderTeam.colors.primary}33 0%, transparent 54%)`} />
      <Flex position="relative" direction="column" h="100%" p={4}>
        <Flex align="center" justify="space-between" mb={4}>
          <Box>
            <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Division Table
            </Text>
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
              {group.label}
            </Text>
          </Box>
          <Flex align="center" gap={2}>
            <TeamLogo team={leaderTeam} size="34px" />
            <Box textAlign="right">
              <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase">
                Leader
              </Text>
              <Text fontSize="xl" color="white" fontWeight="black" lineHeight={1}>
                {teamLabel(leaderTeam)}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Grid templateColumns="28px minmax(0, 1fr) 50px 54px 44px 60px" gap={2} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
          {["#", "Team", "Conf", "All", "Diff", "Last 5"].map((item) => (
            <Text key={item} fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign={item === "Team" ? "left" : "right"}>
              {item}
            </Text>
          ))}
        </Grid>

        <Flex direction="column" flex={1} justify="space-evenly">
          {group.rows.map((row, index) => {
            const team = TEAM_BY_ID[row.id];
            const isLeader = index === 0;
            return (
              <Grid key={row.id} templateColumns="28px minmax(0, 1fr) 50px 54px 44px 60px" gap={2} alignItems="center">
                <Text fontSize="xs" color={isLeader ? group.accent : "text.muted"} fontWeight="black" textAlign="right">
                  {index + 1}
                </Text>
                <Flex align="center" gap={2} minW={0}>
                  <TeamLogo team={team} size="22px" />
                  <Box minW={0}>
                    <Text fontSize="sm" color="white" fontWeight={isLeader ? "black" : "bold"} lineClamp={1}>
                      {teamLabel(team)}
                    </Text>
                    <Text fontSize="8px" color={row.streak.startsWith("W") ? "green.300" : "text.muted"} fontWeight="black">
                      {row.streak}
                    </Text>
                  </Box>
                </Flex>
                <Text fontSize="sm" color="white" fontWeight="black" textAlign="right">
                  {row.conf}
                </Text>
                <Text fontSize="xs" color="text.secondary" fontWeight="bold" textAlign="right">
                  {row.overall}
                </Text>
                <Text fontSize="xs" color={row.diff >= 0 ? "green.300" : "red.300"} fontWeight="black" textAlign="right">
                  {row.diff > 0 ? "+" : ""}{row.diff}
                </Text>
                <FormRail form={row.form} />
              </Grid>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

export const GloryRankingsCard = () => (
  <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" p={4}>
    <Flex align="end" justify="space-between" mb={4}>
      <Box>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Top 6
        </Text>
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          Glory Rankings
        </Text>
      </Box>
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
        Composite board
      </Text>
    </Flex>

    <Flex direction="column" h="calc(100% - 50px)" justify="space-evenly">
      {gloryTopSix.map((row, index) => {
        const team = TEAM_BY_ID[row.id];
        return (
          <Grid key={row.id} templateColumns="28px 32px 1fr 56px" gap={2} alignItems="center">
            <Text fontSize="xs" color={index === 0 ? "brand.400" : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
            <TeamLogo team={team} size="26px" />
            <Box minW={0}>
              <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                {teamLabel(team)}
              </Text>
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {row.tag}
              </Text>
            </Box>
            <Text fontSize="lg" color="white" fontWeight="black" textAlign="right">
              {row.score.toFixed(1)}
            </Text>
          </Grid>
        );
      })}
    </Flex>
  </Box>
);
