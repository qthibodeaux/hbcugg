import { Box, Flex, Text, Grid, Spinner, Icon } from "@chakra-ui/react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSchoolsHub } from "../../../hooks/useSchoolsHub";
import teamsData from "../../../data/teams.json";
import { Users, ChevronRight } from "lucide-react";

/**
 * CoachesHubSchoolsSection
 * A condensed 4x1 summary of league coaching staff for the Schools Hub.
 * Shows staff counts per program and featured coaching analytics.
 */

const TEAM_MAP = teamsData.teams.reduce((acc, t) => {
  const v5Id = t.exportId.replace(/25$/, "");
  acc[v5Id] = t;
  return acc;
}, {});


export const CoachesHubSchoolsSection = () => {
  // This season's head coach and staff size per school, from the Schools Hub file.
  const { hub, isLoading } = useSchoolsHub();

  const teamSummaries = useMemo(
    () =>
      (hub?.coaches ?? [])
        .map((c) => ({
          id: c.teamId,
          ...TEAM_MAP[c.teamId],
          headCoach: c.headCoach?.name ?? null,
          count: c.staffCount ?? 0,
        }))
        .filter((t) => t.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [hub],
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex align="center" gap={3} mb={6}>
        <Icon as={Users} color="brand.500" boxSize={5} />
        <Box>
          <Text fontSize="xl" fontWeight="black" color="text.primary" letterSpacing="tight">
            COACHES HUB
          </Text>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase">
            Staff Intelligence & Leadership Trackers
          </Text>
        </Box>
        <Flex as={Link} to="/coaches" ml="auto" align="center" gap={1} color="brand.400" _hover={{ color: "brand.300" }}>
          <Text fontSize="xs" fontWeight="bold">FULL DIRECTORY</Text>
          <ChevronRight size={14} />
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
        {teamSummaries.map((team) => (
          <Flex
            key={team.id}
            as={Link}
            to={`/teams/${team.id}/coaches`}
            bg="bg.secondary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="xl"
            p={4}
            align="center"
            justify="space-between"
            transition="all 0.2s"
            _hover={{ borderColor: "brand.500", transform: "translateY(-2px)", bg: "whiteAlpha.50" }}
          >
            <Box>
              <Text fontSize="sm" fontWeight="black" color="text.primary">
                {team.shortName} <Text as="span" color="text.muted" fontWeight="normal" ml={1}>{team.mascot}</Text>
              </Text>
              <Text fontSize="xs" color="text.secondary" lineClamp={1}>
                HC: {team.headCoach || "TBD"}
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="xl" fontWeight="black" color="brand.400" lineHeight="1">
                {team.count}
              </Text>
              <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase">
                STAFF
              </Text>
            </Box>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
};
