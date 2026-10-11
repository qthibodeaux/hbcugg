import React, { useState } from 'react';
import { Box, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';

// Fallback alumni roster — used when live wiki data has no alumniRoster entries
const ALUMNI_FALLBACK = [
  {
    name: "[[DATA PENDING]]",
    field: "TBA",
    role: "Check back for updates",
    photo: null,
    initials: "??",
    years: "TBA",
  }
];

const NotableAlumniCard = () => {
  const wikiData = React.useContext(WikiCtx);
  
  // MERGE LOGIC: Use team-specific data from teams.json metadata
  const roster = wikiData.alumniRoster?.length 
    ? wikiData.alumniRoster.map(alum => ({
        ...alum,
        photo: alum.image || alum.photo || null // Handle both image (teams.json) and photo (legacy) keys
      }))
    : wikiData.history?.notableAlumni?.length
      ? wikiData.history.notableAlumni.map(alum => ({
          name: alum.name,
          field: alum.bio?.split(' · ')[0] || "Alumnus",
          role: alum.bio || "Notable Graduate",
          photo: alum.image || null,
          initials: alum.name.split(' ').map(n => n[0]).join(''),
          years: alum.year
        }))
      : ALUMNI_FALLBACK;

  const [idx, setIdx] = useState(0);
  const alum = roster[idx];
  const total = roster.length;

  return (
    <Box h="full" position="relative" overflow="hidden" bg="#0a0014">
      {/* full-bleed photo */}
      {alum.photo ? (
        <Image
          src={alum.photo} alt={alum.name}
          position="absolute" inset={0} w="full" h="full"
          objectFit="cover" objectPosition="top"
        />
      ) : (
        <Flex position="absolute" inset={0} align="center" justify="center"
          bg={`${wikiData.colors.primary}22`}>
          <Text fontSize="8xl" fontWeight="black" color={`${wikiData.colors.primary}44`}
            letterSpacing="-0.06em">{alum.initials}</Text>
        </Flex>
      )}
      {/* gradient overlay */}
      <Box
        position="absolute" inset={0}
        bg="linear-gradient(to top, rgba(5,0,12,0.97) 0%, rgba(5,0,12,0.55) 45%, transparent 80%)"
      />
      {/* school color top stripe */}
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={wikiData.colors.secondary} />
      {/* top label */}
      <Box position="absolute" top={4} left={5}>
        <Text fontSize="7px" fontWeight="black" letterSpacing="0.4em" color="rgba(255,255,255,0.5)">
          NOTABLE ALUMNI
        </Text>
      </Box>
      {/* bottom content */}
      <Flex
        direction="column" position="absolute" bottom={0} left={0} right={0}
        px={5} pb={5} gap={1}
      >
        {/* field badge */}
        <Box alignSelf="start" px={2} py={0.5} bg={wikiData.colors.secondary}>
          <Text fontSize="7px" fontWeight="black" letterSpacing="0.2em" color="#000">
            {alum.field.toUpperCase()}
          </Text>
        </Box>
        {/* name */}
        <Text fontSize="clamp(18px,2.2vw,28px)" fontWeight="black"
          letterSpacing="-0.03em" lineHeight="1.05" color="#FFFFFF">
          {alum.name}
        </Text>
        {/* class year + role */}
        <Text fontSize="xs" color={wikiData.colors.secondary} fontWeight="bold" letterSpacing="0.05em">
          &lsquo;{alum.years.split('–')[1] || alum.years} &middot; {alum.role.split('·')[0].trim()}
        </Text>
        {/* carousel dots */}
        <HStack gap={1.5} mt={2}>
          {Array.from({ length: total }).map((_, i) => (
            <Box
              key={i} h="3px" borderRadius="2px" cursor="pointer"
              w={i === idx ? "20px" : "5px"}
              bg={i === idx ? wikiData.colors.secondary : "rgba(255,255,255,0.25)"}
              onClick={() => setIdx(i)}
              style={{ transition: 'all 0.2s' }}
            />
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default NotableAlumniCard;
