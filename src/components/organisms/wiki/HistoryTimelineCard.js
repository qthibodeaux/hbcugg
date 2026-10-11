import React, { useState } from 'react';
import { Box, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';

const HistoryTimelineCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const milestones = wikiData.history?.historicMilestones || [];
  const total = milestones.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const handleTick = () => setActiveIdx(i => (i + 1) % (total || 1));
  const active = milestones[activeIdx] || null;

  if (!active) return (
    <Box h="full" bg="#FFFFFF" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="rgba(0,0,0,0.3)">NO HISTORY DATA</Text>
    </Box>
  );

  return (
    <Box h="full" bg="#FFFFFF" position="relative" overflow="hidden">
      {/* CSS-driven auto-advance ticker — no useEffect, fires onAnimationIteration every 7s */}
      <Box
        position="absolute" w={0} h={0} overflow="hidden" pointerEvents="none"
        style={{ animation: 'tlTick 7s linear infinite' }}
        onAnimationIteration={handleTick}
      />
      {/* watermark logo top right */}
      <Box position="absolute" top="-10px" right="-10px" zIndex={0} opacity={0.07}>
        <Image src={wikiData.logo} alt="" h="180px" w="180px" objectFit="contain"
          style={{ filter: `brightness(0) saturate(100%) invert(14%) sepia(78%) saturate(800%) hue-rotate(260deg)` }}
        />
      </Box>
      <Flex direction="column" h="full" p={{ base: 5, lg: 8 }} position="relative" zIndex={1}>
        {/* header */}
        <Box mb={5}>
          <Text fontSize="8px" fontWeight="black" letterSpacing="0.45em" color={wikiData.colors.primary} mb={1}>
            HISTORY TIMELINE
          </Text>
          <Text
            fontSize="clamp(24px,3.5vw,46px)" fontWeight="black"
            letterSpacing="-0.04em" lineHeight="0.9" color={wikiData.colors.primary}
            textTransform="uppercase"
          >
            {wikiData.shortName} Legacy
          </Text>
        </Box>

        {/* COMPACT VIEW: interactive dots + active label below */}
        <Box display={{ base: "block", lg: "none" }} flex={1}>
          <Box position="relative">
            <Box position="absolute" top="6px" left={0} right={0} h="2px" bg={`${wikiData.colors.primary}20`} />
            <HStack gap={0} align="flex-start">
              {milestones.map((m, i) => {
                const isActive = i === activeIdx;
                return (
                  <Box key={i} flex={1} minW={0} cursor="pointer" onClick={() => setActiveIdx(i)}>
                    <Flex justify="center">
                      <Box
                        w={isActive ? "14px" : "9px"} h={isActive ? "14px" : "9px"}
                        borderRadius="full"
                        mt={isActive ? "-2px" : "0px"}
                        bg={isActive ? wikiData.colors.primary : `${wikiData.colors.primary}35`}
                        border={`2px solid ${wikiData.colors.primary}`}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                    </Flex>
                    <Text
                      fontSize="8px" fontWeight="black" textAlign="center" mt={2} lineClamp={1}
                      color={isActive ? wikiData.colors.primary : `${wikiData.colors.primary}50`}
                      style={{ transition: 'color 0.3s ease' }}
                    >{m.year}</Text>
                  </Box>
                );
              })}
            </HStack>
          </Box>
          <Box mt={2} px={1}>
            <Text fontSize="8px" fontWeight="black" letterSpacing="0.25em"
              color={wikiData.colors.primary} mb={1}>{active.year}</Text>
            <Text fontSize="xs" color={`${wikiData.colors.primary}BB`} lineHeight="1.55" lineClamp={4}>
              {active.event}
            </Text>
          </Box>
          <HStack gap={1.5} mt={3} justify="center">
            {milestones.map((_, i) => (
              <Box key={i} h="2px" borderRadius="1px"
                w={i === activeIdx ? "18px" : "5px"}
                bg={i === activeIdx ? wikiData.colors.primary : `${wikiData.colors.primary}25`}
                style={{ transition: 'all 0.3s ease' }}
              />
            ))}
          </HStack>
        </Box>

        {/* LARGE VIEW: full horizontal timeline with inline event text */}
        <Box display={{ base: "none", lg: "block" }} flex={1} position="relative" overflow="hidden">
          <Box position="absolute" top="10px" left={0} right={0} h="2px" bg={`${wikiData.colors.primary}20`} />
          <HStack gap={0} align="flex-start" h="full" spacing={0}>
            {milestones.map((m, i) => (
              <Box key={i} flex={1} position="relative" minW={0}>
                <Box
                  w="10px" h="10px" borderRadius="full"
                  bg={i === 0 ? wikiData.colors.primary : `${wikiData.colors.primary}55`}
                  border={`2px solid ${wikiData.colors.primary}`}
                  mx="auto"
                />
                <Text fontSize="clamp(9px,0.9vw,13px)" fontWeight="black"
                  color={wikiData.colors.primary} letterSpacing="-0.02em"
                  textAlign="center" mt={2} mb={1} lineClamp={1}
                >{m.year}</Text>
                <Text
                  fontSize="clamp(7px,0.65vw,8.5px)" color={`${wikiData.colors.primary}88`}
                  lineHeight="1.5" textAlign="center" px={1} lineClamp={4}
                >{m.event}</Text>
              </Box>
            ))}
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default HistoryTimelineCard;
