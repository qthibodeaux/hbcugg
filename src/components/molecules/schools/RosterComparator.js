import React from "react";
import { Box, Flex, Text, SimpleGrid, Select } from "@chakra-ui/react";

/**
 * RosterComparatorPanel
 * Individual panel for selecting a target (Team, Division, League) and viewing its KPIs.
 */
export const RosterComparatorPanel = ({ 
  label, 
  value, 
  onChange, 
  teams, 
  stats, 
  teamData 
}) => {
  const isTeam = value && value !== "ALL" && value !== "SWAC" && value !== "MEAC";
  const currentData = isTeam ? teamData[value] : stats;

  return (
    <Box 
      bg="bg.secondary" 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100" 
      p={5} 
      h="full"
      transition="all 0.2s"
      _hover={{ borderColor: "whiteAlpha.300" }}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest">
          {label}
        </Text>
        <Select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          size="xs"
          variant="outline"
          w="140px"
          bg="bg.primary"
          borderColor="whiteAlpha.200"
        >
          <option value="ALL">All 18 Programs</option>
          <optgroup label="Conferences">
            <option value="SWAC">SWAC (12 Teams)</option>
            <option value="MEAC">MEAC (6 Teams)</option>
          </optgroup>
          <optgroup label="SWAC East">
            {Object.entries(teamData)
              .filter(([_, t]) => t?.info?.division === "East" && t?.info?.conference === "SWAC")
              .map(([id, t]) => <option key={id} value={id}>{t?.info?.name || id}</option>)}
          </optgroup>
          {/* Add more groups similarly or keep it simple for now */}
        </Select>
      </Flex>

      {currentData ? (
        <Flex direction="column" gap={8}>
          <Box>
            <Text fontSize="4xl" fontWeight="black" color="text.primary" lineHeight="1">
              {currentData?.composition?.total_players || 0}
            </Text>
            <Text fontSize="9px" color="text.muted" textTransform="uppercase" fontWeight="bold">Total Personnel</Text>
          </Box>

          <SimpleGrid columns={2} gap={4}>
            <Box>
              <Text fontSize="xl" fontWeight="black" color="brand.400">
                {((currentData?.experience?.upperclass_pct || 0) * 100).toFixed(0)}%
              </Text>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase">Upperclassmen</Text>
            </Box>
            <Box>
              <Text fontSize="xl" fontWeight="black" color="text.primary">
                {((currentData?.transfers?.transfer_rate || 0) * 100).toFixed(0)}%
              </Text>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase">Transfer Rate</Text>
            </Box>
          </SimpleGrid>

          <Box pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
             <Text fontSize="9px" color="text.muted" textTransform="uppercase" fontWeight="black" mb={3} letterSpacing="widest">
              Position Mix
            </Text>
            <Flex direction="column" gap={2}>
              {currentData?.composition?.position_distribution?.slice(0, 5).map(pos => (
                <Flex key={pos.group} align="center" gap={3}>
                  <Text fontSize="10px" fontWeight="bold" color="text.secondary" w="24px">{pos.group}</Text>
                  <Box flex={1} h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                    <Box 
                      h="full" 
                      bg="brand.500" 
                      w={`${(pos.count / currentData.composition.total_players) * 100 * 2}%`} // scaled for visibility
                    />
                  </Box>
                  <Text fontSize="10px" color="text.muted">{pos.count}</Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Flex>
      ) : (
        <Flex h="100%" align="center" justify="center">
          <Text color="text.muted" fontSize="xs" fontStyle="italic">Select a target to begin analysis</Text>
        </Flex>
      )}
    </Box>
  );
};
