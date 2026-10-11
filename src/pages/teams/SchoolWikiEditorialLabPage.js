import React, { useState } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import WikiVariantGrid from '../../components/organisms/wiki/WikiVariantGrid';
import WikiKeyframes from '../../components/organisms/wiki/WikiKeyframes';
import { wikiDataFallback } from '../../components/organisms/wiki/WikiCtx';

// --- LAB CHROME --------------------------------------------------------------
const LabChrome = () => (
  <Box
    position="sticky" top={0} zIndex={100}
    bg="rgba(11,11,13,0.95)" borderBottom="1px solid rgba(255,255,255,0.08)"
    backdropFilter="blur(10px)"
  >
    <HStack px={8} h="44px" justify="space-between">
      <HStack gap={4}>
        <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="brand.500">PAGE LAB</Text>
        <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" />
        <Text fontSize="9px" color="rgba(255,255,255,0.35)" letterSpacing="0.2em">SCHOOL WIKI � V2</Text>
      </HStack>
      <Text fontSize="9px" color="rgba(255,255,255,0.25)" letterSpacing="0.1em" fontFamily="mono">
        {wikiDataFallback.colors.primary} � {wikiDataFallback.colors.secondary}
      </Text>
    </HStack>
  </Box>
);

// --- PAGE ---------------------------------------------------------------------
const SchoolWikiEditorialLabPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [variant, setVariant] = useState("grid");
  return (
    <Box bg="#0B0B0D" minH="100vh">
      <WikiKeyframes />
      <LabChrome />
      <WikiVariantGrid data={wikiDataFallback} />
    </Box>
  );
};

// Backward-compat re-exports for WikiTab.js (until it is updated)
export { WikiVariantGrid };
export const Keyframes = WikiKeyframes;
export default SchoolWikiEditorialLabPage;
