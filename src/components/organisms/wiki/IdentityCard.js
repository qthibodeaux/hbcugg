import React from 'react';
import { Box, Flex, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const IdentityCard = () => {
  const wikiData = React.useContext(WikiCtx);
  return (
    <Box h="full" bg={wikiData.colors.primary} position="relative" overflow="hidden">
      {/* ghost short name watermark */}
      <Text
        position="absolute" bottom="-30px" left="-10px"
        fontSize="clamp(160px,22vw,280px)" fontWeight="black"
        color="rgba(0,0,0,0.22)" lineHeight="1" letterSpacing="-0.06em"
        userSelect="none" zIndex={0}
      >
        {wikiData.bannerShort}
      </Text>
      {/* big logo — the hero visual */}
      <Box position="absolute" right="-40px" bottom="-20px" zIndex={1}>
        <Image src={wikiData.logo} alt="" h="360px" w="360px" objectFit="contain" opacity={0.35} />
      </Box>
      <Flex h="full" direction="column" justify="space-between" p={{ base: 6, lg: 10 }} position="relative" zIndex={2}>
        {/* TOP: full name + mascot + campus nickname */}
        <VStack align="start" gap={0}>
          <Text
            fontSize="clamp(11px,1.2vw,13px)" fontWeight="black"
            letterSpacing="0.35em" color="rgba(255,255,255,0.5)" mb={1}
          >
            {wikiData.name.toUpperCase()}
          </Text>
          <Text
            fontSize="clamp(52px,8vw,96px)" fontWeight="black"
            letterSpacing="-0.05em" lineHeight="0.88" color={wikiData.colors.secondary}
            textTransform="uppercase"
          >
            {wikiData.mascot}
          </Text>
          <HStack gap={2} mt={3}>
            <Box w="28px" h="2px" bg={wikiData.colors.secondary} />
            <Text fontSize="10px" fontWeight="black" color="rgba(255,255,255,0.6)" letterSpacing="0.25em">
              {(wikiData.location?.campusNickname || '').toUpperCase()}
            </Text>
          </HStack>
          {/* Relocated from the hero banner's old kicker/subtitle — est. year
              + city/state, and the school motto — instead of dropping them
              when the banner moved to the title-only standard. */}
          <Text fontSize="9px" fontWeight="black" color="rgba(255,255,255,0.5)" letterSpacing="0.2em" mt={2}>
            EST. {wikiData.founded || '[[TBA]]'} · {(wikiData.location?.city || 'N/A').toUpperCase()}, {wikiData.location?.state || 'N/A'}
          </Text>
          {wikiData.motto && (
            <Text fontSize="xs" fontFamily="serif" fontStyle="italic" color="rgba(255,255,255,0.65)" mt={1}>
              "{wikiData.motto}"
            </Text>
          )}
        </VStack>
        {/* MID: blurb */}
        <Text fontSize={{ base: "xs", lg: "sm" }} color="rgba(255,255,255,0.82)" lineHeight="1.75" maxW={{ base: "100%", lg: "320px" }}>
          {wikiData.history.briefHistory}
        </Text>
        {/* BOTTOM: CTA */}
        <HStack
          as="a" href={wikiData.website} target="_blank" rel="noopener noreferrer"
          gap={2} alignSelf="start" px={5} py={2.5}
          bg={wikiData.colors.secondary} color="#000"
          cursor="pointer" style={{ transition: "opacity 0.15s" }}
        >
          <Text fontSize="10px" fontWeight="black" letterSpacing="0.2em">VISIT SCHOOL SITE</Text>
          <Icon as={ExternalLink} boxSize={3} />
        </HStack>
      </Flex>
    </Box>
  );
};

export default IdentityCard;
