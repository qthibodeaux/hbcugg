import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { teamEntries } from "./specialTeamsLedger/ledgerData";
import { TeamPanel } from "./specialTeamsLedger/LedgerSections";

export const GameProductionSpecialTeamsC = () => (
  <Flex w="full" h="full" direction="column" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Flex align="center" justify="space-between" px="8px" py="6px" borderBottom="1px solid rgba(255,255,255,0.08)">
      <Box>
        <Text fontSize="10px" color="brand.500" fontWeight="950" textTransform="uppercase" letterSpacing="0.1em">
          Special Teams Production
        </Text>
        <Text fontSize="7px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="2px">
          field position ledger - return game - kicking distance
        </Text>
      </Box>
      <Text fontSize="7px" color="text.secondary" fontWeight="900" textTransform="uppercase">
        W15 PVAMU at JSU
      </Text>
    </Flex>
    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" flex="1" minH={0} p="6px">
      {teamEntries.map(([teamKey, team]) => (
        <TeamPanel key={teamKey} teamKey={teamKey} team={team} />
      ))}
    </Grid>
  </Flex>
);
