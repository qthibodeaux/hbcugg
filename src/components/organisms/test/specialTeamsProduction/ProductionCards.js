import { Grid, Box, Flex, Text, VStack } from "@chakra-ui/react";
import { SPECIAL_TEAMS_PRODUCTION, signed, fmt1 } from "./productionData";
import { FieldGoalBody, KickoffBody, PuntBody, ContributorList } from "./PhaseDetails";

// Special-teams production summary and phase-card composition.

export const SummaryStrip = () => (
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" p="6px" borderBottom="1px solid rgba(255,255,255,0.08)">
    {[SPECIAL_TEAMS_PRODUCTION.pvamu, SPECIAL_TEAMS_PRODUCTION.jsu].map((team) => (
      <Box key={team.shortName} bg={`linear-gradient(90deg, ${team.colors.primary}55 0%, rgba(255,255,255,0.025) 74%)`} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" px="7px" py="6px">
        <Flex align="center" justify="space-between" mb="5px">
          <Flex align="center" gap={2}>
            <Box w="4px" h="16px" bg={team.colors.accent} borderRadius="sm" />
            <Text fontSize="clamp(12px, 1vw, 16px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
              {team.shortName} Special Teams
            </Text>
          </Flex>
          <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase">{team.side}</Text>
        </Flex>
        <Grid templateColumns="repeat(5, 1fr)" gap="4px">
          {[
            { label: "ST Plays", value: team.summary.plays, color: team.colors.accent },
            { label: "ST Swing", value: signed(team.summary.swing), color: team.summary.swing >= 0 ? "#68D391" : "#E53E3E" },
            { label: "Hidden", value: signed(team.hiddenYards), color: team.hiddenYards >= 0 ? "#68D391" : "#E53E3E" },
            { label: "Penalty", value: team.summary.penaltyCost, color: "#F6AD55" },
            { label: "Avg Start", value: fmt1(team.avgStart), color: "#63B3ED" },
          ].map((stat) => (
            <Flex key={stat.label} direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="4px" minW={0}>
              <Text fontSize="clamp(10px, 0.9vw, 13px)" color={stat.color} fontWeight="950" lineHeight={1}>{stat.value}</Text>
              <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{stat.label}</Text>
            </Flex>
          ))}
        </Grid>
      </Box>
    ))}
  </Grid>
);

export const PhaseCard = ({ team, phase }) => {
  const data = team[phase];
  const accent = team.colors.accent;
  const body = {
    fieldGoals: <FieldGoalBody data={data} accent={accent} />,
    kickoff: <KickoffBody data={data} accent={accent} />,
    punt: <PuntBody data={data} accent={accent} />,
  }[phase];

  return (
    <Grid templateColumns="minmax(0, 1.28fr) minmax(128px, 0.72fr)" gap="6px" minH={0} bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" p="6px" overflow="hidden">
      <VStack align="stretch" gap="5px" minH={0}>
        <Flex align="center" justify="space-between">
          <Text fontSize="clamp(10px, 0.86vw, 13px)" color="text.primary" fontWeight="950" textTransform="uppercase">{team.shortName}</Text>
          <Text fontSize="7px" color={accent} fontWeight="900" textTransform="uppercase">{phase === "fieldGoals" ? "FG / PAT" : phase}</Text>
        </Flex>
        {body}
      </VStack>
      <ContributorList contributors={data.contributors} accent={accent} />
    </Grid>
  );
};
