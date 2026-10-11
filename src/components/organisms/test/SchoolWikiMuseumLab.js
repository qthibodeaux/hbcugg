import React from 'react';
import { Box, Flex, Text, VStack,  Grid, Badge, Icon, HStack } from '@chakra-ui/react';
import {  Music,  Users,  Landmark, Flag } from 'lucide-react';

// MOCK DATA FROM SchoolWikiDataInventory.json
const wikiData = {
  id: "alcorn",
  name: "Alcorn State University",
  shortName: "Alcorn",
  mascot: "Braves",
  foundation: {
    year: 1871,
    motto: "Where Knowledge and Character Meet",
    mottoTranslation: "Ex Scientia Ad Magnitudinem",
    briefHistory: "Founded in 1871 as Alcorn University, it is the oldest public historically black land-grant institution in the United States.",
    famousFirsts: [
      "First black land-grant institution in the nation.",
      "Hiram R. Revels was its first president."
    ]
  },
  identity: {
    campusNickname: "The Reservation",
    colors: { primary: "#5C068C", secondary: "#FFD100" },
    landmarkSpots: [
      { name: "Oakland Chapel", significance: "Oldest building, National Historic Landmark." },
      { name: "Golden Gate", significance: "Ceremonial entrance for seniors." }
    ]
  },
  ensemble: {
    bandName: "Sounds of Dyn-O-Mite",
    bandNickname: "SOD",
    signatureSelection: "Fanfare",
    danceTeamName: "Golden Girls",
    drumMajorStyle: "High-stepping, acrobatic",
    specialEntrance: "The SOD Run-On"
  },
  rituals: {
    procession: { name: "The Brave Walk", description: "Gauntlet of fans heading to the stadium." },
    tailgate: { name: "Reservation Tailgate", signatureFood: ["Turkey Legs", "Fried Catfish"] },
    songs: { fightSong: "Alcorn Ode", almaMater: "Beneath the shade..." }
  },
  legacy: {
    notableAlumni: [
      { name: "Steve McNair", field: "Athletics", achievement: "NFL MVP." },
      { name: "Alex Haley", field: "Literature", achievement: "Author of 'Roots'." },
      { "name": "Medgar Evers", "field": "Civil Rights", "achievement": "Civil rights activist." }
    ]
  }
};

/**
 * DNA Sidebar - "The Museum Placard"
 * Slot: cols=1, rows=2
 */
const DNASidebar = () => (
  <Box 
    bg="bg.secondary" 
    h="full" 
    p={6} 
    borderLeft="4px solid" 
    borderRight="1px solid"
    borderY="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
  >
    {/* Background Watermark */}
    <Icon 
      as={Landmark} 
      position="absolute" 
      bottom="-20px" 
      right="-20px" 
      fontSize="160px" 
      color="whiteAlpha.50" 
      transform="rotate(-15deg)"
    />

    <VStack align="start" gap={6} position="relative" zIndex={1}>
      <Box>
        <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" color="text.muted" textTransform="uppercase">
          Est. {wikiData.foundation.year}
        </Text>
        <Text fontSize="2xl" fontWeight="black" lineHeight="1.1" mt={1}>
          {wikiData.shortName.toUpperCase()}
        </Text>
      </Box>

      {/* CHAKRA V3 SEPARATOR REPLACEMENT */}
      <Box w="full" h="1px" bg="whiteAlpha.200" />

      <VStack align="start" gap={1}>
        <Text fontSize="xs" color="text.muted" fontWeight="bold">MOTTO</Text>
        <Text fontSize="lg" fontFamily="serif" fontStyle="italic" color={wikiData.identity.colors.secondary}>
          "{wikiData.foundation.motto}"
        </Text>
        <Text fontSize="sm" color="text.muted">
          — {wikiData.foundation.mottoTranslation}
        </Text>
      </VStack>

      <VStack align="start" gap={1}>
        <Text fontSize="xs" color="text.muted" fontWeight="bold">NICKNAME</Text>
        <Text fontSize="xl" fontWeight="black" letterSpacing="tighter">
          {wikiData.identity.campusNickname.toUpperCase()}
        </Text>
      </VStack>

      <VStack align="start" gap={3} mt={4}>
        <Text fontSize="xs" color="text.muted" fontWeight="bold">LANDMARKS</Text>
        {wikiData.identity.landmarkSpots.map(spot => (
          <Box key={spot.name}>
            <Text fontSize="md" fontWeight="bold" color="text.primary">{spot.name}</Text>
            <Text fontSize="xs" color="text.muted">{spot.significance}</Text>
          </Box>
        ))}
      </VStack>
    </VStack>
  </Box>
);

/**
 * The Ensemble Feature - "The Persona"
 * Slot: cols=3, rows=2
 */
const EnsembleFeature = () => (
  <Box 
    bg="bg.secondary" 
    h="full" 
    position="relative" 
    border="1px solid" 
    borderColor="whiteAlpha.100"
    overflow="hidden"
  >
    <Grid templateColumns="repeat(3, 1fr)" h="full">
      {/* Visual Side (2 Cols) */}
      <Box gridColumn="span 2" h="full" position="relative" bg="black">
        {/* Placeholder for Band Image */}
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient={`linear-gradient(to right, ${wikiData.identity.colors.primary}66, transparent)`}
          zIndex={1}
        />
        <Flex position="absolute" bottom={0} left={0} p={8} zIndex={2} direction="column">
          <Badge bg={wikiData.identity.colors.primary} color="white" alignSelf="start" px={3} py={1} mb={2}>
            THE ENSEMBLE
          </Badge>
          <Text fontSize="6xl" fontWeight="black" lineHeight="0.8" letterSpacing="tighter">
            {wikiData.ensemble.bandName.toUpperCase()}
          </Text>
          <Text fontSize="xl" fontWeight="bold" mt={2} color="whiteAlpha.800">
            "{wikiData.ensemble.bandNickname}"
          </Text>
        </Flex>
      </Box>

      {/* Info Side (1 Col) */}
      <Box p={6} borderLeft="1px solid" borderColor="whiteAlpha.100">
        <VStack align="start" gap={6} h="full" justify="center">
          <Flex gap={3} align="center">
            <Icon as={Music} color={wikiData.identity.colors.secondary} />
            <Box>
              <Text fontSize="xs" color="text.muted">SIGNATURE</Text>
              <Text fontSize="md" fontWeight="bold">{wikiData.ensemble.signatureSelection}</Text>
            </Box>
          </Flex>

          <Flex gap={3} align="center">
            <Icon as={Users} color={wikiData.identity.colors.secondary} />
            <Box>
              <Text fontSize="xs" color="text.muted">DANCE TEAM</Text>
              <Text fontSize="md" fontWeight="bold">{wikiData.ensemble.danceTeamName}</Text>
            </Box>
          </Flex>

          <Flex gap={3} align="center">
            <Icon as={Flag} color={wikiData.identity.colors.secondary} />
            <Box>
              <Text fontSize="xs" color="text.muted">STYLE</Text>
              <Text fontSize="md" fontWeight="bold">{wikiData.ensemble.drumMajorStyle}</Text>
            </Box>
          </Flex>

          <Box w="full" h="1px" bg="whiteAlpha.100" />

          <Box>
            <Text fontSize="xs" color="text.muted" mb={2}>PHILOSOPHY</Text>
            <Text fontSize="sm" lineHeight="1.5">
              Blending traditional marching styles with contemporary showmanship.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Grid>
  </Box>
);

/**
 * Main Lab Container
 */
export const SchoolWikiMuseumLab = () => {
  return (
    <Box w="full" bg="bg.primary" p={4}>
      <Grid templateColumns="repeat(4, 1fr)" gap={4} h="600px">
        {/* Row 1: The Persona Breakdown */}
        <Box h="full">
          <DNASidebar />
        </Box>
        <Box gridColumn="span 3" h="full">
          <EnsembleFeature />
        </Box>
      </Grid>
      
      {/* Label for the Lab */}
      <Flex mt={6} justify="space-between" align="center">
        <HStack gap={4}>
          <Badge variant="outline" colorScheme="red">DESIGN LAB: 001</Badge>
          <Text color="text.muted" fontSize="sm" fontWeight="bold">SCHOOL WIKI — THE HERITAGE GRID</Text>
        </HStack>
        <Text color="text.muted" fontSize="xs">COMPONENTS: DNASidebar + EnsembleFeature</Text>
      </Flex>
    </Box>
  );
};
