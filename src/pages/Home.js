import { Box, Text, Container, SimpleGrid, Flex, Button } from "@chakra-ui/react";
import { useTeams } from "../hooks/useTeams";
import { useNavigate } from "react-router-dom";
import HomeHero from "../components/organisms/home/HomeHero";
import GloryTeamOfWeek from "../components/organisms/home/GloryTeamOfWeek";


const Home = () => {
  const { data: teams, isLoading } = useTeams();
  const navigate = useNavigate();
  // const randomStats = getRandomStats();
  
  // Featured team - Florida A&M or first team
  // const featuredTeam = teams?.find(t => t.id === "florida-am") || teams?.[0];

  return (
    <Box>
      <HomeHero />

      {/* CONTENT SECTIONS - All Centered */}
      <Box py={{ base: 0, md: 16 }} bg="bg.primary">
        <Container maxW="1200px" mx="auto" px={{ base: 0, md: 6 }}>
          
          <GloryTeamOfWeek />

      {/* ALL TEAMS BANNER */}
      <Box px={{ base: 0, md: 8 }} pb={{ base: 0, md: 12 }}>
        <Container maxW="1200px" px={{ base: 0, md: 4 }}>
          <Box
            bg="brand.500"
            py={{ base: 6, md: 8 }}
            px={{ base: 4, md: 10 }}
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            gap={6}
          >
            <Text
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="black"
              color="bg.primary"
              textTransform="uppercase"
              letterSpacing="tight"
              textAlign={{ base: "center", md: "left" }}
            >
              Explore All 18 Teams
            </Text>
            <Button
              bg="bg.primary"
              color="white"
              size="lg"
              px={8}
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              _hover={{ bg: "bg.secondary", transform: "translateY(-2px)" }}
              onClick={() => navigate('/teams')}
            >
              Main Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

          {/* TEAMS GRID - Metro UI Style (3 rows of 6) */}
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="text.primary"
            mb={6}
            mt={{ base: 6, md: 0 }}
            textAlign="center"
          >
            All Teams
          </Text>

          {isLoading ? (
            <Text color="text.secondary" textAlign="center">
              Loading teams...
            </Text>
          ) : (
            <SimpleGrid 
              columns={{ base: 3, md: 6 }} 
              gap={{ base: 0, md: 3 }}
              mb={8}
            >
              {[...(teams ?? [])].sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
                <Box
                  key={team.id}
                  aspectRatio="1"
                  bg={`${team.colors.primary}30`}
                  backdropFilter="blur(10px)"
                  position="relative"
                  overflow="hidden"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: "scale(1.02)",
                    bg: `${team.colors.primary}50`,
                  }}
                  border="1px solid"
                  borderColor={`${team.colors.primary}40`}
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  {/* Logo - Centered */}
                  <Flex
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    p={3}
                  >
                    <Box
                      w="100%"
                      h="100%"
                      maxW="50px"
                      maxH="50px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "100%", 
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    </Box>
                  </Flex>

                  {/* School Name - Bottom Left (Metro UI style) */}
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={2}
                    bg="linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)"
                  >
                    <Text
                      fontSize={{ base: "11px", md: "xs" }}
                      fontWeight="bold"
                      color="white"
                      lineHeight={1.15}
                      textTransform="uppercase"
                      letterSpacing="0.02em"
                      overflowWrap="break-word"
                    >
                      {team.fullName ?? team.name}
                    </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
