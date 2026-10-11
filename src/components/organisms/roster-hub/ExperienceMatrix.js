import React from "react";
import { Box, Flex, Text, SimpleGrid, Icon } from "@chakra-ui/react";
import { Activity } from "lucide-react";

/**
 * ExperienceMatrix
 * Dense grid showing the class distribution (Experience Pyramid) for all programs.
 */
export const ExperienceMatrix = ({ teams }) => {
  const teamEntries = Object.entries(teams).sort((a, b) => 
    (b[1]?.experience?.veteran_pct || 0) - (a[1]?.experience?.veteran_pct || 0)
  );

  return (
    <Box mt={12} pb={20}>
      <Flex align="center" gap={3} mb={6}>
        <Icon as={Activity} color="brand.400" />
        <Text fontSize="xl" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="widest">
          League Experience Matrix
        </Text>
      </Flex>

      <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
        <Box bg="bg.secondary" px={6} py={3} borderBottom="1px solid" borderColor="whiteAlpha.200">
          <SimpleGrid columns={12} gap={4} align="center">
            <Text colSpan={3} textAlign="left" fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">Program</Text>
            <Text colSpan={1} fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">Size</Text>
            <Text colSpan={6} fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">Class Distribution (Fr → Gr)</Text>
            <Text colSpan={2} fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="right">Vet %</Text>
          </SimpleGrid>
        </Box>

        {teamEntries.map(([id, team]) => {
          const pyramid = team?.experience?.pyramid || [0, 0, 0, 0, 0];
          const total = team?.composition?.total_players || 1;
          const colors = ["#BDC3C7", "#95A5A6", "#F39C12", "#E67E22", "#E74C3C"]; // Muted class colors

          return (
            <Box 
              key={id} 
              px={6} 
              py={4} 
              bg="bg.primary" 
              _hover={{ bg: "whiteAlpha.100" }} 
              transition="all 0.15s"
              borderBottom="1px solid"
              borderColor="whiteAlpha.50"
            >
              <SimpleGrid columns={12} gap={4} align="center">
                <Box colSpan={3} textAlign="left">
                  <Text fontSize="xs" fontWeight="bold" color="text.primary">{team?.info?.name || id}</Text>
                  <Text fontSize="10px" color="text.muted">{team?.info?.conference} {team?.info?.division}</Text>
                </Box>
                
                <Text colSpan={1} fontSize="xs" fontWeight="black" color="text.secondary">
                  {total}
                </Text>

                <Flex colSpan={6} h="12px" gap="1px" align="center">
                   {pyramid.map((count, i) => (
                     <Box 
                        key={i} 
                        h="full" 
                        flex={count || 0.1} 
                        bg={colors[i]} 
                        opacity={count > 0 ? 1 : 0.2}
                        borderRadius="1px"
                        title={`${count} players`}
                     />
                   ))}
                </Flex>

                <Box colSpan={2} textAlign="right">
                  <Text fontSize="xs" fontWeight="black" color="brand.400">
                    {((team?.experience?.veteran_pct || 0) * 100).toFixed(0)}%
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
