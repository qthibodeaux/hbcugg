import React, { useState } from 'react';
import { Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const FunFactsCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const facts = wikiData.history?.funFacts || [];
  const total = facts.length;
  const [factIdx, setFactIdx] = useState(0);
  const handleFactTick = () => setFactIdx(i => (i + 1) % (total || 1));

  if (!total) return (
    <Box h="full" bg="#FFFFFF" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="rgba(0,0,0,0.3)">NO FUN FACTS</Text>
    </Box>
  );

  return (
    <Box h="full" bg="#FFFFFF" overflow="hidden">
      {/* CSS-driven carousel ticker — no useEffect */}
      <Box
        position="absolute" w={0} h={0} overflow="hidden" pointerEvents="none"
        display={{ base: "block", lg: "none" }}
        style={{ animation: 'tlTick 5s linear infinite' }}
        onAnimationIteration={handleFactTick}
      />
      <Flex direction="column" h="full" p={{ base: 4, lg: 7 }} gap={{ base: 3, lg: 4 }}>
        <HStack gap={2.5}>
          <Icon as={Star} boxSize={4} color={wikiData.colors.primary} />
          <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color={wikiData.colors.primary}>
            FUN FACTS
          </Text>
          {/* compact: fact counter */}
          <Box display={{ base: "block", lg: "none" }} ml="auto">
            <Text fontSize="8px" fontWeight="black" color={`${wikiData.colors.primary}50`} letterSpacing="0.1em">
              {String(factIdx + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}
            </Text>
          </Box>
        </HStack>
        <Box h="2px" bg={`${wikiData.colors.primary}15`} />

        {/* COMPACT: single rotating fact */}
        <Box display={{ base: "flex", lg: "none" }} flex={1} direction="column" justify="center">
          <Flex flex={1} align="center" gap={3}>
            <Flex w="32px" h="32px" borderRadius="full" flexShrink={0}
              bg={wikiData.colors.primary} align="center" justify="center">
              <Text fontSize="11px" fontWeight="black" color={wikiData.colors.secondary}>
                {String(factIdx + 1).padStart(2, '0')}
              </Text>
            </Flex>
            <Text fontSize="sm" color={`${wikiData.colors.primary}DD`} lineHeight="1.6" flex={1}>
              {facts[factIdx]}
            </Text>
          </Flex>
          {/* progress dots */}
          <HStack gap={1.5} mt={3} justify="center">
            {facts.map((_, i) => (
              <Box key={i} h="2px" borderRadius="1px" cursor="pointer"
                w={i === factIdx ? "18px" : "5px"}
                bg={i === factIdx ? wikiData.colors.primary : `${wikiData.colors.primary}25`}
                style={{ transition: 'all 0.3s ease' }}
                onClick={() => setFactIdx(i)}
              />
            ))}
          </HStack>
        </Box>

        {/* LARGE: full scrollable list */}
        <Box display={{ base: "none", lg: "block" }} flex={1} overflowY="auto" minH={0}>
          <VStack gap={4} align="stretch" justify="space-around">
            {facts.map((fact, i) => (
              <HStack key={i} gap={3} align="start">
                <Flex w="22px" h="22px" borderRadius="full" flexShrink={0}
                  bg={`${wikiData.colors.primary}15`} align="center" justify="center">
                  <Text fontSize="8px" fontWeight="black" color={wikiData.colors.primary}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </Flex>
                <Text fontSize="xs" color={`${wikiData.colors.primary}CC`} lineHeight="1.6">{fact}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <HStack gap={1} mt={1} display={{ base: "none", lg: "flex" }}>
          <Text fontSize="8px" fontWeight="black" letterSpacing="0.2em" color={wikiData.colors.primary}>
            MORE FUN FACTS
          </Text>
          <Text fontSize="8px" fontWeight="black" color={wikiData.colors.primary}>&rarr;</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default FunFactsCard;
