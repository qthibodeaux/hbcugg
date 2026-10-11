import { Box, Text, Flex,  Button, Container, SimpleGrid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Award, ChevronRight } from "lucide-react";

const FeaturedPlayer = ({ team }) => {
  const navigate = useNavigate();
  
  if (!team) return null;

  // Mock player data - will be dynamic later based on Glory Rating
  const player = {
    name: "SHE DEUR",
    lastName: "SANDERS",
    position: "Quarterback",
    class: "Junior",
    number: "#2",
    stats: {
      passYards: "3,732",
      tdInt: "40 / 3",
      qbr: "99",
    },
    isHeisman: true,
  };

  return (
    <Container maxW="1400px" px={{ base: 4, md: 8 }} py={8}>
      <Box
        bg="bg.card"
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.100"
        position="relative"
      >
        <Flex direction={{ base: "column", md: "row" }}>
          {/* Player Image Side */}
          <Box
            w={{ base: "full", md: "45%" }}
            minH={{ base: "300px", md: "400px" }}
            bg="bg.secondary"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Placeholder Player Image */}
            <Box
              w="80%"
              h="90%"
              bg="linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="6xl" fontWeight="black" color="whiteAlpha.20">
                {player.number}
              </Text>
            </Box>
            
            {/* Gradient Overlay */}
            <Box
              position="absolute"
              inset={0}
              bg={`linear-gradient(to right, transparent 0%, ${team.colors.primary}30 100%)`}
              display={{ base: "none", md: "block" }}
            />
          </Box>

          {/* Player Info Side */}
          <Box flex={1} p={{ base: 6, md: 8 }} position="relative">
            {/* Heisman Badge */}
            {player.isHeisman && (
              <Flex align="center" gap={2} mb={4}>
                <Award size={16} color={team.colors.primary} />
                <Text fontSize="xs" color={team.colors.primary} fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                  Heisman Prospect
                </Text>
              </Flex>
            )}

            {/* Name */}
            <Box mb={6}>
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="black"
                color="white"
                textTransform="uppercase"
                lineHeight={1}
              >
                {player.name}
              </Text>
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="black"
                color={team.colors.primary}
                textTransform="uppercase"
                lineHeight={1}
              >
                {player.lastName}
              </Text>
            </Box>

            {/* Details */}
            <Text fontSize="sm" color="text.muted" mb={6}>
              {player.position} • {player.class} • {player.number}
            </Text>

            {/* Stats Grid */}
            <SimpleGrid columns={3} gap={4} mb={6}>
              <Box>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" mb={1}>Pass Yards</Text>
                <Text fontSize="2xl" fontWeight="bold" color="white">{player.stats.passYards}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" mb={1}>TD / INT</Text>
                <Text fontSize="2xl" fontWeight="bold" color="white">{player.stats.tdInt}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" mb={1}>QBR</Text>
                <Text fontSize="2xl" fontWeight="bold" color={team.colors.primary}>{player.stats.qbr}</Text>
              </Box>
            </SimpleGrid>

            {/* Scout Rating & Button */}
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="xs" color="text.muted">Scout Rating</Text>
                <Flex align="center" gap={2}>
                  <Box h={2} w={20} bg="whiteAlpha.200" borderRadius="full">
                    <Box h="full" w="99%" bg={team.colors.primary} borderRadius="full" />
                  </Box>
                  <Text fontSize="sm" color="white" fontWeight="bold">99/100</Text>
                </Flex>
              </Box>
              <Button
                variant="ghost"
                color={team.colors.primary}
                rightIcon={<ChevronRight size={16} />}
                size="sm"
                onClick={() => navigate(`/player/${player.name.toLowerCase().replace(/\s/g, '-')}`)}
              >
                View Profile
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default FeaturedPlayer;
