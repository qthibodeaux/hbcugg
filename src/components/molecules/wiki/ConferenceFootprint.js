import { Box, Grid, VStack } from "@chakra-ui/react";
import { SharedFootprintMap } from "./footprint/SharedFootprintMap";
import { CONFERENCES } from "./footprint/footprintModel";
import { CompactConferenceLegend, ConferenceLegend } from "./footprint/FootprintLegends";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { StateFootprintExplorer } from "./footprint/StateFootprintExplorer";

const ConferenceFootprintCompact = () => {
  return (
    <Box h="full" w="full" minW={0} overflow="hidden" borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(11,11,13,1)" boxShadow="inset 4px 0 0 #E53E3E" position="relative">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)" pointerEvents="none" />

      <Grid h="full" position="relative" zIndex={1} templateColumns="3fr 1fr">
        <Box minW={0} display="flex" flexDirection="column">
          <Box flex={1} minH={0}>
            <SharedFootprintMap compact />
          </Box>
        </Box>

        <VStack align="stretch" gap={2.5} minW={0} minH={0} h="full" overflow="hidden" p={3}>
          {CONFERENCES.map((conf) => (
            <Box key={conf.key} flex="1" minH={0}>
              <CompactConferenceLegend conf={conf} />
            </Box>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
};

export const ConferenceFootprint = ({ compact = false }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <StateFootprintExplorer />;
  if (compact) return <ConferenceFootprintCompact />;
  return (
    <Box h="full" w="full" minW={0} overflow="hidden" borderRadius="8px" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(11,11,13,1)" boxShadow="inset 4px 0 0 #E53E3E" position="relative">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 18%, rgba(111,38,51,0.22), transparent 34%), radial-gradient(circle at 88% 22%, rgba(75,0,130,0.22), transparent 32%)" pointerEvents="none" />

      <Grid h="full" position="relative" zIndex={1} templateColumns={{ base: "1fr", md: "3fr 1fr", xl: "2.15fr 1fr" }}>
        <Box minW={0} display="flex" flexDirection="column">
          <Box flex={1} minH={0}>
            <SharedFootprintMap />
          </Box>
        </Box>

        <VStack align="stretch" gap={3} minW={0} minH={0} h="full" overflow="hidden" p={{ base: 0, md: 0 }}>
          {CONFERENCES.map((conf) => (
            <Box key={conf.key} flex="1" minH={0}>
              <ConferenceLegend conf={conf} />
            </Box>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
};

export default ConferenceFootprint;
