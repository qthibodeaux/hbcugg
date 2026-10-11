import React from 'react';
import { Box, Flex, Grid, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Trophy } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const FootballLegacyCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const confYears = wikiData.athletics.conferenceChampionships || [];
  const hbcuYears = wikiData.athletics.nationalChampionships || [];
  const hof = wikiData.athletics.hallOfFamers?.length
    ? wikiData.athletics.hallOfFamers
    : [];
  const retired = wikiData.athletics.retiredNumbers?.length
    ? wikiData.athletics.retiredNumbers
    : [];

  return (
    <Flex direction="column" h="full" bg="#FFFFFF" overflow="hidden">
      {/* top header strip */}
      <Flex align="center" px={{ base: 4, lg: 8 }} pt={{ base: 3, lg: 6 }} pb={{ base: 3, lg: 4 }} gap={3} borderBottom={`1px solid ${wikiData.colors.primary}12`}>
        <Box w="3px" h="18px" bg={wikiData.colors.primary} flexShrink={0} />
        <Text fontSize="8px" fontWeight="black" letterSpacing="0.45em" color={wikiData.colors.primary}>
          FOOTBALL LEGACY
        </Text>
        <Box flex={1} />
        <Text fontSize="xs" fontWeight="black" letterSpacing="0.08em"
          color={`${wikiData.colors.primary}50`} textTransform="uppercase"
          display={{ base: "none", lg: "block" }}>
          Champions. Legends. Firsts.
        </Text>
      </Flex>

      {/* 4-column body */}
      <Grid templateColumns="1fr 1px 1fr 1px 1fr 1px 1fr" flex={1} minH={0} overflow="hidden">

        {/* COL 1: Conference Championships */}
        <Flex direction="column" p={{ base: 4, lg: 6 }} gap={3} overflow="hidden">
          <VStack align="start" gap={0} mb={1}>
            <Text fontSize={{ base: "9px", lg: "7px" }} fontWeight="black" letterSpacing={{ base: "0.1em", lg: "0.35em" }}
              color={`${wikiData.colors.primary}70`}>CONFERENCE TITLES</Text>
            <Text
              fontSize="clamp(44px,6vw,64px)" fontWeight="black"
              color={wikiData.colors.primary} letterSpacing="-0.06em" lineHeight="1"
            >{confYears.length}</Text>
          </VStack>
          <Box display={{ base: "none", lg: "block" }}>
            <Text fontSize="7px" fontWeight="black" letterSpacing="0.3em"
              color={`${wikiData.colors.primary}50`} mb={1}>CHAMPIONSHIP YEARS</Text>
            <Flex gap={1.5} flexWrap="wrap">
              {confYears.map(y => (
                <Box key={y} px={2} py={1} bg={wikiData.colors.primary} borderRadius="2px">
                  <Text fontSize="8px" fontWeight="black" color={wikiData.colors.secondary}
                    letterSpacing="0.04em">{y}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>

        {/* divider */}
        <Box bg={`${wikiData.colors.primary}12`} />

        {/* COL 2: HBCU National Championships */}
        <Flex direction="column" p={{ base: 4, lg: 6 }} gap={3} overflow="hidden">
          <VStack align="start" gap={0} mb={1}>
            <Text fontSize={{ base: "9px", lg: "7px" }} fontWeight="black" letterSpacing={{ base: "0.1em", lg: "0.35em" }}
              color={`${wikiData.colors.primary}70`}>HBCU NATIONAL TITLES</Text>
            <Text
              fontSize="clamp(44px,6vw,64px)" fontWeight="black"
              color={wikiData.colors.primary} letterSpacing="-0.06em" lineHeight="1"
            >{hbcuYears.length}</Text>
          </VStack>
          {hbcuYears.length > 0 ? (
            <Box display={{ base: "none", lg: "block" }}>
              <Text fontSize="7px" fontWeight="black" letterSpacing="0.3em"
                color={`${wikiData.colors.primary}50`} mb={1}>CHAMPIONSHIP YEARS</Text>
              <Flex gap={1.5} flexWrap="wrap">
                {hbcuYears.map(y => (
                  <Box key={y} px={2} py={1} bg={wikiData.colors.primary} borderRadius="2px">
                    <Text fontSize="8px" fontWeight="black" color={wikiData.colors.secondary}
                      letterSpacing="0.04em">{y}</Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          ) : (
            <Text fontSize="xs" color={`${wikiData.colors.primary}40`} fontStyle="italic" mt={1}>
              — none on record —
            </Text>
          )}
        </Flex>

        {/* divider */}
        <Box bg={`${wikiData.colors.primary}12`} />

        {/* COL 3: Hall of Famers */}
        <Flex direction="column" p={{ base: 4, lg: 6 }} gap={4} overflow="hidden">
          <VStack align="start" gap={0} mb={1}>
            <Text fontSize={{ base: "9px", lg: "7px" }} fontWeight="black" letterSpacing={{ base: "0.1em", lg: "0.35em" }}
              color={`${wikiData.colors.primary}70`}>HALL OF FAMERS</Text>
            <Text
              fontSize="clamp(44px,6vw,64px)" fontWeight="black"
              color={wikiData.colors.primary} letterSpacing="-0.06em" lineHeight="1"
            >{hof.length}</Text>
          </VStack>
          <VStack align="stretch" gap={3}>
            {hof.length > 0 ? hof.map((h, i) => (
              <HStack key={i} gap={3} pb={i < hof.length - 1 ? 3 : 0}
                borderBottom={i < hof.length - 1 ? `1px solid ${wikiData.colors.primary}12` : 'none'}>
                <Flex w="32px" h="32px" borderRadius="2px" flexShrink={0}
                  bg={wikiData.colors.primary} align="center" justify="center">
                  <Icon as={Trophy} boxSize={3.5} color={wikiData.colors.secondary} />
                </Flex>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="black" color={wikiData.colors.primary}
                    letterSpacing="-0.02em" lineHeight="1.2">{h.name}</Text>
                  <Text fontSize="8px" fontWeight="bold" color={`${wikiData.colors.primary}60`}
                    letterSpacing="0.1em">INDUCTED {h.inducted}</Text>
                </VStack>
              </HStack>
            )) : (
              <Text fontSize="xs" color={`${wikiData.colors.primary}40`} fontStyle="italic" mt={1}>
                — none on record —
              </Text>
            )}
          </VStack>
        </Flex>

        {/* divider */}
        <Box bg={`${wikiData.colors.primary}12`} />

        {/* COL 4: Retired Numbers */}
        <Flex direction="column" p={{ base: 4, lg: 6 }} gap={4} overflow="hidden">
          <VStack align="start" gap={0} mb={1}>
            <Text fontSize={{ base: "9px", lg: "7px" }} fontWeight="black" letterSpacing={{ base: "0.1em", lg: "0.35em" }}
              color={`${wikiData.colors.primary}70`}>RETIRED NUMBERS</Text>
            <Text
              fontSize="clamp(44px,6vw,64px)" fontWeight="black"
              color={wikiData.colors.primary} letterSpacing="-0.06em" lineHeight="1"
            >{retired.length}</Text>
          </VStack>
          <Flex gap={3} flexWrap="wrap">
            {retired.length > 0 ? retired.map((r, i) => (
              <Flex key={i} direction="column" align="center" gap={1}>
                <Flex
                  w="64px" h="64px" align="center" justify="center"
                  border={`2px solid ${wikiData.colors.primary}`}
                  bg={`${wikiData.colors.primary}08`}
                  borderRadius="2px"
                >
                  <Text fontSize="2xl" fontWeight="black" color={wikiData.colors.primary}
                    letterSpacing="-0.04em" lineHeight="1">#{r.number}</Text>
                </Flex>
                <Text fontSize="8px" fontWeight="black" color={wikiData.colors.primary}
                  letterSpacing="-0.01em" textAlign="center">{r.name}</Text>
                <Text fontSize="7px" color={`${wikiData.colors.primary}55`}
                  letterSpacing="0.05em" textAlign="center">{r.position} | {r.years}</Text>
              </Flex>
            )) : (
              <Text fontSize="xs" color={`${wikiData.colors.primary}40`} fontStyle="italic" mt={1}>
                — none on record —
              </Text>
            )}
          </Flex>
        </Flex>

      </Grid>
    </Flex>
  );
};

export default FootballLegacyCard;
