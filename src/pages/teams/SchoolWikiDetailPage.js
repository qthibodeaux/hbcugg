import React from "react";
import { useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import WikiVariantGrid from "../../components/organisms/wiki/WikiVariantGrid";
import WikiKeyframes from "../../components/organisms/wiki/WikiKeyframes";
import { Box, Text, Center, Spinner } from "@chakra-ui/react";

/**
 * SchoolWikiDetailPage
 * Separates the school-specific wiki from the TeamDetails dashboard.
 * Provides a full-screen, grid-compliant editorial experience.
 */
const SchoolWikiDetailPage = () => {
  const { teamId } = useParams();
  const { data: team, isLoading: teamLoading } = useTeam(teamId);

  // We no longer use useWikiData(teamId) which fetches a separate wiki.json file.
  // We pull the "wiki" object directly from the team metadata in teams.json.
  const wikiData = team?.wiki || {};

  if (teamLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Text color="text.primary" fontWeight="black" letterSpacing="widest">SCHOOL NOT FOUND</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="bg.primary" minH="100vh" pt="60px">
      <WikiKeyframes />
      <WikiVariantGrid team={team} data={wikiData} />
    </Box>
  );
};

export default SchoolWikiDetailPage;
