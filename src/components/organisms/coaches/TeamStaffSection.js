import teamsData from "../../../data/teams.json";
import { Box, Flex, Text, Heading, Grid } from "@chakra-ui/react";
import CoachCard from "../../atoms/cards/CoachCard";

const TEAM_DISPLAY = teamsData.teams.reduce((acc, t) => {
  const v5Id = t.exportId.replace(/25$/, "");
  acc[v5Id] = {
    name: t.name,
    shortName: t.shortName,
    conference: t.conference,
    colors: t.colors,
  };
  return acc;
}, {});

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") =>
  /coordinator/i.test(title) ||
  /offensive coordinator|defensive coordinator|oc|dc/i.test(title);

export const SectionHeader = ({ title, kicker }) => (
  <Box mb={6}>
    <Flex align="center" gap={2} mb={1}>
      <Box w="12px" h="2px" bg="brand.500" />
      <Text fontSize="10px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="0.2em">
        {kicker}
      </Text>
    </Flex>
    <Heading fontSize="2xl" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="tight">
      {title}
    </Heading>
  </Box>
);

export const TeamStaffSection = ({ teamId, coaches }) => {
  const meta = TEAM_DISPLAY[teamId] ?? { name: teamId, shortName: teamId.toUpperCase(), conference: "" };
  const hcList = coaches.filter((c) => isHeadCoach(c.title));
  const coordList = coaches.filter((c) => !isHeadCoach(c.title) && isCoordinator(c.title));
  const positionList = coaches.filter((c) => !isHeadCoach(c.title) && !isCoordinator(c.title));

  return (
    <Box mb={12}>
      <Flex align="center" justify="space-between" mb={6} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={4}>
          <Box w="4px" h="32px" bg={meta.colors?.primary || "brand.500"} />
          <Box>
            <Text fontSize="xl" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="tight">
              {meta.name}
            </Text>
            <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              {meta.conference} Staff � {coaches.length} Members
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={8}>
        {/* Leadership Pillar */}
        <Box>
           <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.2em" mb={4}>
            Command & Control
          </Text>
          <Grid gap={4}>
            {hcList.map((c) => <CoachCard key={c.person_id} coach={c} tier="hc" />)}
            {coordList.map((c) => <CoachCard key={c.person_id} coach={c} tier="coord" />)}
          </Grid>
        </Box>

        {/* Operating Staff Pillar */}
        <Box>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.2em" mb={4}>
            Operating Staff
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
            {positionList.map((c) => <CoachCard key={c.person_id} coach={c} tier="staff" />)}
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};
