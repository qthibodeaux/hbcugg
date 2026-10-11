import { Box, Flex, Text, SimpleGrid, Badge, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

/**
 * 4x2 Team Grid Slot.
 * Displays all 18 HBCU teams as interactive tiles.
 */
export const TeamGrid4x2 = ({ teams = [] }) => {
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box 
      w="100%" 
      h="100%" 
      p={6} 
      bg="bg.secondary" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      position="relative"
    >
      <Flex direction="column" h="100%">
        <Flex justify="space-between" align="baseline" mb={6}>
          <Flex align="center" gap={3}>
            <Box h="15px" w="4px" bg="brand.500" />
            <Text fontSize="xs" fontWeight="black" color="text.primary" letterSpacing="0.2em" textTransform="uppercase">
              HBCU DIRECTORY
            </Text>
          </Flex>
          <Badge bg="whiteAlpha.100" color="whiteAlpha.600" fontSize="10px" fontWeight="black" py={1} px={3} borderRadius="sm">
            18 PROGRAMS / ALL CONFERENCES
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 3, md: 6, lg: 9 }} spacing={4} flex={1}>
          {sortedTeams.map((team) => (
            <Box
              key={team.id}
              as={RouterLink}
              to={`/teams/${team.id}`}
              aspectRatio="1"
              bg={`${team.colors?.primary || "#2D3748"}20`}
              backdropFilter="blur(10px)"
              position="relative"
              overflow="hidden"
              border="1px solid"
              borderColor={`${team.colors?.primary || "#202020"}40`}
              transition="all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)"
              _hover={{
                transform: "scale(1.08) translateY(-4px)",
                bg: `${team.colors?.primary || "#202020"}50`,
                borderColor: team.colors?.primary,
                boxShadow: `0 10px 30px -10px ${team.colors?.primary || "#000"}`,
                zIndex: 2,
              }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={3}
              borderRadius="sm"
            >
              <Image
                src={team.logo}
                alt={team.shortName}
                maxW="80%"
                maxH="80%"
                objectFit="contain"
                filter="drop-shadow(0 0 10px rgba(0,0,0,0.5)) grayscale(0.2)"
                _hover={{ filter: "drop-shadow(0 0 15px rgba(0,0,0,0.6)) grayscale(0)" }}
              />

              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="blackAlpha.800"
                backdropFilter="blur(4px)"
                py={1}
                px={1}
                borderTop="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Text fontSize="9px" fontWeight="black" color="white" textAlign="center" lineClamp={1} letterSpacing="0.05em">
                  {team.shortName.toUpperCase()}
                </Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

/**
 * 2x2 Standings Card.
 * Displays top 6 teams for a division/conference.
 */
export const StandingsCard2x2 = ({ title, teams = [], color = "brand.500" }) => {
  return (
    <Box 
      w="100%" 
      h="100%" 
      bg="bg.secondary" 
      p={6} 
      borderTop="1px solid" 
      borderColor="whiteAlpha.100"
      position="relative"
      transition="all 0.3s ease"
      _hover={{ borderColor: color }}
    >
      <Box position="absolute" top={0} left={0} w="4px" h="40px" bg={color} />
      
      <Flex align="center" justify="space-between" mb={6}>
        <Text fontSize="xs" fontWeight="black" color="text.muted" letterSpacing="0.2em" textTransform="uppercase">
          {title}
        </Text>
        <Box h="1px" flex={1} mx={4} bg="whiteAlpha.100" />
      </Flex>
      
      <Flex direction="column" gap={3}>
        {teams.slice(0, 6).map((item, idx) => (
          <Flex 
            key={item.teamId || item.id || idx} 
            align="center" 
            justify="space-between"
            py={2}
            px={2}
            borderRadius="sm"
            as={RouterLink}
            to={`/teams/${item.teamId || item.id}`}
            _hover={{ bg: "whiteAlpha.050", transform: "translateX(4px)" }}
            transition="all 0.2s ease"
          >
            <Flex align="center" gap={4}>
              <Text fontSize="xs" fontWeight="black" color="text.muted" w="15px" textAlign="center">
                {idx + 1}
              </Text>
              <Box w="24px" h="24px" p={1} bg="whiteAlpha.050" borderRadius="sm">
                {item.logo && (
                    <Image 
                        src={item.logo} 
                        w="100%" h="100%" 
                        objectFit="contain" 
                        filter="brightness(1.1)"
                    />
                )}
              </Box>
              <Text fontSize="sm" fontWeight="black" color="text.primary" letterSpacing="-0.01em">
                {(item.shortName || item.name).toUpperCase()}
              </Text>
            </Flex>
            <Flex gap={5} align="center">
              <Text fontSize="xs" fontWeight="bold" color="text.secondary">
                {item.record || item.season_record || "0-0"}
              </Text>
              {item.conf_record && (
                <Text fontSize="xs" fontWeight="black" color="brand.400">
                  {item.conf_record}
                </Text>
              )}
              {item.glory && (
                <Badge bg="brand.500" color="white" fontSize="9px" fontWeight="black" px={1.5} py={0} borderRadius="xs">
                  {item.glory}
                </Badge>
              )}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

/**
 * 1x1 Dash Graph Placeholder Card.
 */
export const DashGraphCard1x1 = ({ title, metric }) => {
  return (
    <Box 
      w="100%" h="100%" 
      bg="bg.secondary" 
      p={4} 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      position="relative"
      _hover={{ borderColor: "brand.500" }}
      transition="border-color 0.3s ease"
    >
       <Flex align="center" gap={2} mb={4}>
        <Box w="3px" h="10px" bg="brand.500" />
        <Text fontSize="9px" fontWeight="black" color="text.muted" letterSpacing="0.1em" textTransform="uppercase">
          {title || "PERFORMANCE"}
        </Text>
      </Flex>
      
      <Flex direction="column" justify="center" align="center" h="calc(100% - 30px)">
        <Box position="absolute" top="40%" fontSize="60px" fontWeight="black" color="whiteAlpha.020" pointerEvents="none">
          {metric?.split(" ")[0]}
        </Box>
        <Text fontSize="3xl" fontWeight="black" color="white" lineHeight="1" mb={1}>--</Text>
        <Text fontSize="9px" fontWeight="black" color="brand.500" letterSpacing="0.1em">{metric?.toUpperCase() || "NO DATA"}</Text>
      </Flex>
    </Box>
  );
};
