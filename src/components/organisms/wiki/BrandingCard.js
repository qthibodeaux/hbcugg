import React from 'react';
import { Box, Flex, Image, Text, VStack } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';

const BrandingCard = () => {
  const wikiData = React.useContext(WikiCtx);
  
  // Dynamic color names from hex or metadata
  const primaryName = wikiData.colors.primary === '#660000' ? 'MAROON' : 
                      wikiData.colors.primary === '#312A26' ? 'BROWN' : 
                      wikiData.colors.primary === '#5C068C' ? 'PURPLE' : 'PRIMARY';
  const secondaryName = wikiData.colors.secondary === '#FFFFFF' ? 'WHITE' : 
                        wikiData.colors.secondary === '#FFD100' ? 'GOLD' : 'SECONDARY';

  return (
    <Box h="full" overflow="hidden" position="relative">
      {/* top half — primary color full bleed */}
      <Box h="50%" bg={wikiData.colors.primary} position="relative" overflow="hidden">
        <Text
          position="absolute" bottom="-16px" right="-8px"
          fontSize={{ base: "clamp(40px,8vw,70px)", lg: "clamp(60px,10vw,110px)" }} fontWeight="black"
          color="rgba(0,0,0,0.12)" letterSpacing="-0.06em" userSelect="none" lineHeight="1"
        >
          {primaryName}
        </Text>
        <Flex h="full" align="flex-start" justify="space-between" p={5}>
          <VStack align="start" gap={0}>
            <Text fontSize={{ base: "8px", lg: "7px" }} fontWeight="black" color="rgba(255,255,255,0.45)" letterSpacing={{ base: "0.2em", lg: "0.35em" }}>PRIMARY</Text>
            <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="black" color="#fff" letterSpacing="-0.03em">{primaryName}</Text>
            <Text fontSize={{ base: "10px", lg: "9px" }} color="rgba(255,255,255,0.6)" fontFamily="mono">{wikiData.colors.primary}</Text>
          </VStack>
          <Box w="48px" h="48px" p={1.5} bg="rgba(255,255,255,0.1)">
            <Image src={wikiData.logo} alt={wikiData.shortName} w="full" h="full" objectFit="contain" />
          </Box>
        </Flex>
      </Box>
      {/* bottom half — secondary color full bleed */}
      <Box h="50%" bg={wikiData.colors.secondary} position="relative" overflow="hidden">
        <Text
          position="absolute" bottom="-16px" right="-8px"
          fontSize={{ base: "clamp(40px,8vw,70px)", lg: "clamp(60px,10vw,110px)" }} fontWeight="black"
          color="rgba(0,0,0,0.08)" letterSpacing="-0.06em" userSelect="none" lineHeight="1"
        >
          {secondaryName}
        </Text>
        <Flex h="full" direction="column" justify="space-between" p={5}>
          <VStack align="start" gap={0}>
            <Text fontSize={{ base: "8px", lg: "7px" }} fontWeight="black" color="rgba(0,0,0,0.45)" letterSpacing={{ base: "0.2em", lg: "0.35em" }}>SECONDARY</Text>
            <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="black" color="#000" letterSpacing="-0.03em">{secondaryName}</Text>
            <Text fontSize={{ base: "10px", lg: "9px" }} color="rgba(0,0,0,0.6)" fontFamily="mono">{wikiData.colors.secondary}</Text>
          </VStack>
          <Text fontSize="9px" color="rgba(0,0,0,0.55)" fontStyle="italic" lineHeight="1.4"
            display={{ base: "block", lg: "none" }} mt={1} lineClamp={3}>
            "{wikiData.colorsDescription}"
          </Text>
          <Text fontSize="9px" color="rgba(0,0,0,0.55)" fontStyle="italic" lineHeight="1.5" maxW="180px"
            display={{ base: "none", lg: "block" }}>
            "{wikiData.colorsDescription}"
          </Text>
        </Flex>
      </Box>
      {/* center divider strip */}
      <Box
        position="absolute" left={0} top="50%" transform="translateY(-50%)"
        w="full" h="2px" bg="rgba(255,255,255,0.25)"
      />
    </Box>
  );
};

export default BrandingCard;
