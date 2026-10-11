import React, { useState } from 'react';
import { Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';

const RivalryCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const [idx, setIdx] = useState(0);
  const rivalries = wikiData.athletics?.rivalries || [];
  const r = rivalries[idx] || null;
  const total = rivalries.length;

  if (!r) return (
    <Box h="full" bg="#0a0014" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="rgba(255,255,255,0.3)">NO RIVALRY DATA</Text>
    </Box>
  );

  const parts = r.seriesRecord ? r.seriesRecord.split('-') : ['0','0'];
  const teamW = parseInt(parts[0]) || 0;
  const oppW  = parseInt(parts[1]) || 0;
  const leading = r.leader || (teamW > oppW ? wikiData.shortName : r.teamName);
  const meetings = r.meetings || (teamW + oppW + (parseInt(parts[2]) || 0));

  return (
    <Box h="full" bg="#0a0014" position="relative" overflow="hidden">
      {/* large bg team logos */}
      <Image
        src={wikiData.logo} alt=""
        position="absolute" left="-10%" top="50%" transform="translateY(-50%)"
        h="85%" w="auto" objectFit="contain" opacity={0.18}
        style={{ filter: `brightness(0) saturate(100%) invert(14%) sepia(78%) saturate(1000%) hue-rotate(280deg)` }}
      />
      <Image
        src={r.logo} alt=""
        position="absolute" right="-10%" top="50%" transform="translateY(-50%)"
        h="85%" w="auto" objectFit="contain" opacity={0.12}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      {/* dark center vignette */}
      <Box
        position="absolute" inset={0}
        bg="radial-gradient(ellipse at center, rgba(10,0,20,0.55) 0%, rgba(10,0,20,0.1) 100%)"
      />
      <Flex direction="column" h="full" p={{ base: 3, lg: 5 }} justify="space-between" position="relative" zIndex={2}>
        {/* top: label + dots */}
        <HStack justify="space-between">
          <Text fontSize="8px" fontWeight="black" letterSpacing="0.4em" color="#E53E3E">RIVALRIES</Text>
          <HStack gap={1.5}>
            {Array.from({ length: total }).map((_, i) => (
              <Box
                key={i} h="5px" borderRadius="3px" cursor="pointer"
                w={i === idx ? "14px" : "5px"}
                bg={i === idx ? wikiData.colors.secondary : "rgba(255,255,255,0.25)"}
                onClick={() => setIdx(i)}
                style={{ transition: 'all 0.2s' }}
              />
            ))}
          </HStack>
        </HStack>
        {/* center: game name + logo vs logo */}
        <VStack gap={3} align="center">
          <Text
            fontSize="clamp(11px,1.2vw,13px)" fontWeight="black"
            letterSpacing="0.35em" color={wikiData.colors.secondary} textAlign="center"
          >
            {(r.gameName || 'RIVALRY GAME').toUpperCase()}
          </Text>
          <HStack gap={4} align="center">
            {/* home logo */}
            <Flex direction="column" align="center" gap={2}>
              <Box
                w={{ base: "44px", lg: "64px" }} h={{ base: "44px", lg: "64px" }} p={1.5}
                bg={`${wikiData.colors.primary}33`}
                border={`2px solid ${wikiData.colors.primary}88`}
              >
                <Image src={wikiData.logo} alt={wikiData.shortName} w="full" h="full" objectFit="contain" />
              </Box>
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.6)" letterSpacing="0.2em" display={{ base: "none", lg: "block" }}>
                {wikiData.shortName.toUpperCase()}
              </Text>
            </Flex>
            <Text fontSize={{ base: "md", lg: "2xl" }} fontWeight="black" color="rgba(255,255,255,0.25)" letterSpacing="0.1em">VS</Text>
            {/* away logo */}
            <Flex direction="column" align="center" gap={2}>
              <Box
                w={{ base: "44px", lg: "64px" }} h={{ base: "44px", lg: "64px" }} p={1.5}
                bg="rgba(255,255,255,0.06)"
                border="2px solid rgba(255,255,255,0.15)"
              >
                <Image src={r.logo} alt={r.teamName} w="full" h="full" objectFit="contain" />
              </Box>
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.6)" letterSpacing="0.2em" display={{ base: "none", lg: "block" }}>
                {r.teamName.toUpperCase()}
              </Text>
            </Flex>
          </HStack>
        </VStack>
        {/* bottom: stats strip */}
        <Box borderTop="1px solid rgba(255,255,255,0.1)" pt={3}>
          {/* compact: series only */}
          <Box display={{ base: "block", lg: "none" }}>
            <VStack gap={0} align="center">
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.3)" letterSpacing="0.25em">ALL-TIME SERIES</Text>
              <Text fontSize="lg" fontWeight="semibold" color="#F4F4F5" letterSpacing="0">{r.seriesRecord}</Text>
              <Text fontSize="8px" fontWeight="black" color={wikiData.colors.secondary} letterSpacing="0.15em">LEADS: {leading.toUpperCase()}</Text>
            </VStack>
          </Box>
          {/* large: full three-stat strip */}
          <HStack justify="space-around" display={{ base: "none", lg: "flex" }}>
            <VStack gap={0} align="center">
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.3)" letterSpacing="0.25em">MEETINGS</Text>
              <Text fontSize="lg" fontWeight="black" color="#F4F4F5" letterSpacing="-0.03em">{meetings}</Text>
            </VStack>
            <Box w="1px" h="28px" bg="rgba(255,255,255,0.1)" />
            <VStack gap={0} align="center">
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.3)" letterSpacing="0.25em">SERIES</Text>
              <Text fontSize="lg" fontWeight="black" color="#F4F4F5" letterSpacing="-0.03em">{r.seriesRecord}</Text>
            </VStack>
            <Box w="1px" h="28px" bg="rgba(255,255,255,0.1)" />
            <VStack gap={0} align="center">
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.3)" letterSpacing="0.25em">LEADS</Text>
              <Text fontSize="sm" fontWeight="black" color={wikiData.colors.secondary} letterSpacing="-0.02em">{leading}</Text>
            </VStack>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default RivalryCard;
