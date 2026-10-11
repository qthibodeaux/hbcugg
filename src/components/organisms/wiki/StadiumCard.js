import React from 'react';
import { Badge, Box, Flex, Grid, Image, Text, VStack } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';
import SectionLabel from './SectionLabel';

const StadiumCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const stadiumPhoto = wikiData.stadium.photo || '/stadiums/Spinks-Casem Stadium.jpg';
  return (
    <Box h="full" bg="#141416" border="1px solid rgba(255,255,255,0.07)" overflow="hidden" position="relative">
      <Box h="55%" position="relative" overflow="hidden">
        <Image
          src={stadiumPhoto}
          alt={wikiData.stadium.name}
          w="full" h="full" objectFit="cover"
          fallback={
            <Box w="full" h="full" bg={wikiData.colors.primary} opacity={0.4}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="rgba(255,255,255,0.3)" fontSize="xs" letterSpacing="0.2em">STADIUM PHOTO</Text>
            </Box>
          }
        />
        <Box position="absolute" inset={0} bgGradient="linear-gradient(to top, #141416 0%, transparent 60%)" />
        <Badge
          position="absolute" bottom={3} left={4}
          bg={wikiData.colors.primary} color={wikiData.colors.secondary}
          fontSize="8px" letterSpacing="0.15em" px={3} py={1} borderRadius="0"
          fontWeight="black"
        >
          HOME FIELD
        </Badge>
      </Box>
      <Flex h="45%" direction="column" justify="space-between" p={5}>
        <VStack align="start" gap={1}>
          <SectionLabel color={wikiData.colors.secondary}>THE FORTRESS</SectionLabel>
          <Text fontSize="xl" fontWeight="black" letterSpacing="-0.03em" color="#F4F4F5" lineHeight="1.1">
            {wikiData.stadium.name}
          </Text>
          <Text fontSize="xs" color="rgba(255,255,255,0.5)" lineHeight="1.5" mt={1}>
            {wikiData.stadium.notableFeature}
          </Text>
        </VStack>
        <Grid templateColumns="1fr 1fr" gap={3}>
          {[
            { label: "CAPACITY", value: wikiData.stadium?.capacity?.toLocaleString() || "[[TBA]]" },
            { label: "SURFACE",  value: wikiData.stadium?.surface || "[[TBA]]" },
            { label: "BUILT",    value: wikiData.stadium?.built || "[[TBA]]" },
            { label: "RECORD ATT.", value: wikiData.stadium?.recordAttendance?.toLocaleString() || "[[TBA]]" },
          ].map((s, i) => (
            <Box key={i}>
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.35)" letterSpacing="0.3em">{s.label}</Text>
              <Text fontSize="sm" fontWeight="black" color="#F4F4F5">{s.value}</Text>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export default StadiumCard;
