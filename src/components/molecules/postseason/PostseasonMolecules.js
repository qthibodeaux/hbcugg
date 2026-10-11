import React from "react";
import { Box, Flex, Grid, Image, Text, SimpleGrid } from "@chakra-ui/react";
import { Trophy } from "lucide-react";
import teamsData from "../../../data/teams.json";
import { 
  POSTSEASON_DATA 
} from "../../../data/wiki_data";

const TEAMS = teamsData.teams;
const TEAM_BY_ID = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

export const MeacSwacChallengeBanner = () => {
  const challengeData = POSTSEASON_DATA.meacSwacChallenge;
  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${challengeData.colors.primary}44 0%, rgba(20,20,22,1) 48%, rgba(11,11,13,1) 100%)`}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: challengeData.colors.primary,
        opacity: 0.9,
      }}
    >
      <Box h="100%" p={5} position="relative" zIndex={1} display="flex" flexDirection="column">
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">Season Kickoff Showcase</Text>
            <Text fontSize="4xl" color="white" fontWeight="black" lineHeight={1} textTransform="uppercase" letterSpacing="-0.02em">
              {challengeData.name}
            </Text>
            <Text fontSize="11px" color={challengeData.colors.secondary} fontWeight="black" mt={1} textTransform="uppercase">
              The Official HBCU Season Opener
            </Text>
          </Box>
          <Box bg="whiteAlpha.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">Record Series</Text>
            <Text fontSize="md" color="white" fontWeight="black">{challengeData.seriesRecord}</Text>
          </Box>
        </Flex>

        <SimpleGrid columns={2} spacing={6} flex={1}>
           <Box bg="rgba(0,0,0,0.4)" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
             <Text fontSize="10px" fontWeight="black" color="brand.400" textTransform="uppercase" mb={3}>Strategic Mission</Text>
             <Text fontSize="sm" color="text.primary" lineHeight={1.5}>
               {challengeData.mission}
             </Text>
           </Box>
           <Box bg="whiteAlpha.50" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
             <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={3}>Latest Result</Text>
             <Flex align="center" gap={3}>
               <Image src={TEAM_BY_ID[challengeData.recent.winner.id]?.logo} boxSize="32px" />
               <Box>
                 <Text fontSize="12px" fontWeight="black" color="white">{challengeData.recent.year}: {challengeData.recent.winner.name}</Text>
                 <Text fontSize="10px" color="text.secondary">{challengeData.recent.score} vs {challengeData.recent.opponent}</Text>
               </Box>
             </Flex>
           </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export const CelebrationBowlLedger = () => {
  const bowlData = POSTSEASON_DATA.celebrationBowl;
  return (
    <Box
      h="full"
      w="full"
      minW={0}
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="bg.secondary"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Flex align="center" justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
        <Flex align="center" gap={2.5}>
           <Trophy size={18} color="#FFD100" />
           <Text fontSize="12px" fontWeight="black" textTransform="uppercase" color="white" letterSpacing="0.08em">Celebration Bowl Ledger</Text>
        </Flex>
        <Box px={2} py={0.5} borderRadius="md" border="1px solid" borderColor="whiteAlpha.200" bg="whiteAlpha.50">
          <Text fontSize="9px" color="text.muted" fontWeight="bold">The HBCU National Championship</Text>
        </Box>
      </Flex>
      
      <Box flex={1} overflowY="auto">
        {bowlData.history.map((game, idx) => (
          <Grid key={game.year} templateColumns="60px 1fr 60px 1fr" bg={idx % 2 === 0 ? "transparent" : "whiteAlpha.50"} borderBottom="1px solid" borderColor="whiteAlpha.100" minH="50px">
            <Flex align="center" justify="center" borderRight="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="11px" fontWeight="black" color="white">{game.year}</Text>
            </Flex>
            <Flex align="center" px={3} gap={3}>
              <Image src={TEAM_BY_ID[game.winner.id]?.logo} boxSize="20px" />
              <Text fontSize="11px" fontWeight="black" color="brand.400">{game.winner.name}</Text>
            </Flex>
            <Flex align="center" justify="center" bg="rgba(0,0,0,0.3)">
              <Text fontSize="11px" fontWeight="black" color="white">{game.score}</Text>
            </Flex>
            <Flex align="center" px={3} gap={3}>
              <Image src={TEAM_BY_ID[game.loser.id]?.logo} boxSize="20px" opacity={0.6} />
              <Text fontSize="11px" fontWeight="bold" color="text.muted">{game.loser.name}</Text>
            </Flex>
          </Grid>
        ))}
      </Box>
    </Box>
  );
};
