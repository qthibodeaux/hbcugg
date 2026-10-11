import React from 'react';
import { Box, Flex, Grid, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Music } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const TraditionsBanner = () => {
  const wikiData = React.useContext(WikiCtx);
  return (
    <Box h="full" bg={wikiData.colors.secondary} position="relative" overflow="hidden">
      <Text
        position="absolute" top="-20px" right="-10px"
        fontSize="clamp(80px,14vw,180px)" fontWeight="black"
        color="rgba(0,0,0,0.1)" lineHeight="1"
        letterSpacing="-0.06em" userSelect="none"
      >
        TRADITION
      </Text>
      <Grid templateColumns="auto 1fr 1fr 1fr 1fr" h="full" position="relative" zIndex={2}>
        {/* COL 0: GAME DAY label */}
        <Flex align="center" px={{ base: 4, md: 6, lg: 10 }} borderRight="1px solid rgba(0,0,0,0.15)">
          <VStack align="start" gap={1}>
            <Text fontSize="7px" fontWeight="black" letterSpacing="0.4em" color="rgba(0,0,0,0.45)">{(wikiData.gameday?.traditionTitle || 'GAME DAY').toUpperCase()}</Text>
            <Text fontSize={{ base: "xl", lg: "3xl" }} fontWeight="black" letterSpacing="-0.04em" color="#000" lineHeight="0.9">GAME{"\n"}DAY</Text>
          </VStack>
        </Flex>
        {/* COL 1: The Procession */}
        <Flex direction="column" justify="center" px={{ base: 3, md: 5, lg: 8 }} borderRight="1px solid rgba(0,0,0,0.15)" gap={{ base: 1, lg: 2 }}>
          <Text fontSize="7px" fontWeight="black" color="rgba(0,0,0,0.4)" letterSpacing="0.3em">THE PROCESSION</Text>
          <Text fontSize={{ base: "sm", lg: "lg" }} fontWeight="black" color="#000" letterSpacing="-0.02em" lineHeight="1.1">{(wikiData.gameday?.teamWalk?.name || '—').toUpperCase()}</Text>
          <Text fontSize="xs" color="rgba(0,0,0,0.6)" lineHeight="1.5" display={{ base: "none", lg: "block" }}>{wikiData.gameday?.teamWalk?.description || ''}</Text>
        </Flex>
        {/* COL 2: The Repast */}
        <Flex direction="column" justify="center" px={{ base: 3, md: 5, lg: 8 }} borderRight="1px solid rgba(0,0,0,0.15)" gap={{ base: 1, lg: 2 }}>
          <Text fontSize="7px" fontWeight="black" color="rgba(0,0,0,0.4)" letterSpacing="0.3em">THE REPAST</Text>
          <Text fontSize={{ base: "sm", lg: "lg" }} fontWeight="black" color="#000" letterSpacing="-0.02em" lineHeight="1.1">{(wikiData.gameday?.tailgateCulture?.name || '—').toUpperCase()}</Text>
          <Text fontSize="xs" color="rgba(0,0,0,0.6)" lineHeight="1.5" display={{ base: "none", lg: "block" }}>{wikiData.gameday?.tailgateCulture?.signatureFood || ''}</Text>
        </Flex>
        {/* COL 3: The Anthem */}
        <Flex direction="column" justify="center" px={{ base: 3, md: 5, lg: 8 }} borderRight="1px solid rgba(0,0,0,0.15)" gap={{ base: 1, lg: 2 }}>
          <Text fontSize="7px" fontWeight="black" color="rgba(0,0,0,0.4)" letterSpacing="0.3em">THE ANTHEM</Text>
          <Text fontSize={{ base: "sm", lg: "lg" }} fontWeight="black" color="#000" letterSpacing="-0.02em" lineHeight="1.1">"{(wikiData.gameday?.fightSong || '—').toUpperCase()}"</Text>
          <HStack gap={1} mt={1} display={{ base: "none", lg: "flex" }}>
            <Icon as={Music} boxSize={3} color="rgba(0,0,0,0.5)" />
            <Text fontSize="9px" fontWeight="black" color="rgba(0,0,0,0.5)" letterSpacing="0.1em">FIGHT SONG</Text>
          </HStack>
        </Flex>
        {/* COL 4: The Call */}
        <Flex direction="column" justify="center" px={{ base: 3, md: 5, lg: 8 }} gap={{ base: 1, lg: 2 }}>
          <Text fontSize="7px" fontWeight="black" color="rgba(0,0,0,0.4)" letterSpacing="0.3em">THE CALL</Text>
          <Text fontSize={{ base: "sm", lg: "lg" }} fontWeight="black" color="#000" letterSpacing="-0.02em" lineHeight="1.1">{(wikiData.gameday.rallyCry || wikiData.gameday.signatureChants?.[0]?.name || 'BRAVELAND').toUpperCase()}</Text>
          <Text fontSize="xs" color="rgba(0,0,0,0.6)" lineHeight="1.5" display={{ base: "none", lg: "block" }}>{wikiData.gameday.rallyCryContext || wikiData.gameday.signatureChants?.[0]?.cue || ''}</Text>
        </Flex>
      </Grid>
    </Box>
  );
};

export default TraditionsBanner;
