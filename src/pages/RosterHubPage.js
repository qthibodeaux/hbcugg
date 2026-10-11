import React, { useState } from "react";
import PageShell from "../components/layouts/PageShell";
import { BannerGameCenter } from "../components/organisms/test/BannerGameCenter";
import { Box, Spinner, Center, Text } from "@chakra-ui/react";

/**
 * RosterHubPage
 * Dense analytics hub for the entire league's rosters.
 */
const RosterHubPage = () => {
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [contextLoading, setContextLoading] = useState(false);
    const [season, setSeason] = useState(2025);

  if (isLoading || contextLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <BannerGameCenter season={season} setSeason={setSeason} />
      </PageShell.Slot>
      
      <PageShell.Slot cols={4}>
        <Box mt={6} pt={6} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="white" mb={3}>
            Hello World
          </Text>
        </Box>
      </PageShell.Slot>
    </PageShell>
  );
};

export default RosterHubPage;
