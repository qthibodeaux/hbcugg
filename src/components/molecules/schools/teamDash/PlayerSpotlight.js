import { splitName, asNumber } from "./teamDashModel";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { SectionLabel } from "./TeamDashPrimitives";

// Standard and compact player spotlight presentations; each retains its own sizing.

const PlayerSpotlightCompact = ({ team, player = {} }) => {
  const accent = team?.colors?.secondary || "#F56565";
  const [first, last] = splitName(player.name);

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={3}>
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}33 0%, rgba(11,11,13,0.98) 58%)`} />
      {team?.logo && <Image src={team.logo} alt="" position="absolute" right="-0.75rem" bottom="-1rem" h="75%" opacity={0.12} />}
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" minH={0}>
        <SectionLabel label="Player Spotlight" color={accent} />
        <Box minW={0}>
          <Text fontSize="xl" fontWeight="black" color="white" lineHeight={0.92} lineClamp={1}>{first}</Text>
          <Text fontSize="xl" fontWeight="black" color="white" lineHeight={0.92} lineClamp={1}>{last}</Text>
          <Text mt={1} fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" lineClamp={1}>
            {player.position || "Position TBD"} / {player.classYear || "Class TBD"}
          </Text>
        </Box>
        <Text fontSize="lg" fontWeight="black" color={accent}>{asNumber(player.par)} PAR</Text>
      </Flex>
    </Box>
  );
};

export const PlayerSpotlight = ({ team, player, variant = "standard", gameContext, keyStats = [] }) => {
  if (variant === "compact") return <PlayerSpotlightCompact team={team} player={player} />;

  const accent = team?.colors?.secondary || "#F56565";
  const displayPlayer = player || {
    name: "Featured Player",
    position: "Position TBD",
    classYear: "Class TBD",
    par: null,
    gamesPlayed: null,
    image: null,
  };
  const [first, last] = splitName(displayPlayer.name);
  const hasImage = Boolean(displayPlayer.image);

  return (
    <Box w="full" h="full" bg="#0A0A0C" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative">
      {/* Left edge accent bar */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={team?.colors?.primary || "#E53E3E"} zIndex={3} />

      {/* Layer 1: Player Image dominating the left ~70% */}
      <Box position="absolute" left={0} top={0} bottom={0} w="70%" zIndex={1} bg="#0A0A0C">
        {hasImage ? (
          <Image
            src={displayPlayer.image}
            alt={displayPlayer.name}
            w="full"
            h="full"
            objectFit="cover"
            objectPosition="top center"
          />
        ) : (
          <Flex h="full" align="center" justify="center">
            {team?.logo && <Image src={team.logo} alt="" h="60%" maxW="70%" objectFit="contain" opacity={0.2} />}
          </Flex>
        )}
        
        {/* The Fade: Smooth gradient masking the harsh right edge of the image */}
        <Box 
          position="absolute" 
          inset={0} 
          bg="linear-gradient(to right, transparent 35%, #0A0A0C 85%)" 
          pointerEvents="none"
        />
      </Box>

      {/* Layer 2: The Flat Color Information Panel overlapping the right side */}
      <Flex h="full" w="full" position="relative" zIndex={2} justify="flex-end">
        <Box 
          w={{ base: "52%", lg: "45%" }} 
          h="full" 
          bg="rgba(10, 10, 12, 0.92)" 
          borderLeft="1px solid" 
          borderColor="whiteAlpha.100" 
          p={{ base: 3, lg: 5 }} 
          display="flex" 
          flexDirection="column" 
          justifyContent="space-between" 
        >
          {/* Top Row */}
          <Flex direction="column" align="flex-start" gap={3} minW={0}>
            <SectionLabel label="Star Impact" color={accent} />
            {gameContext && (
              <Box px={2} py={1} bg={`${team?.colors?.primary || "#E53E3E"}22`} border="1px solid" borderColor={accent} borderRadius="md" maxW="full">
                <Text fontSize={{ base: "12px", lg: "13px" }} fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.2}>
                  {gameContext}
                </Text>
              </Box>
            )}
          </Flex>

          {/* Middle Content */}
          <Box minW={0} mt="auto" mb={{ base: 4, lg: 6 }}>
            <Text fontSize="clamp(1.2rem, 3vw, 2.35rem)" fontWeight="black" color="white" lineHeight={0.88} textTransform="uppercase" lineClamp={1}>
              {first}
            </Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2.35rem)" fontWeight="black" color="white" lineHeight={0.88} textTransform="uppercase" lineClamp={1}>
              {last}
            </Text>
            
            <Text mt={2} mb={3} fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {displayPlayer.position || "POSITION"} <Box as="span" color={accent} mx={1}>/</Box> {displayPlayer.classYear || "YEAR"}
            </Text>

            {/* Key Stats Row */}
            {keyStats.length > 0 && (
              <Flex gap={4} align="center" py={2} borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.200">
                {keyStats.map((stat, i) => (
                  <Box key={i} flex={1}>
                    <Text fontSize={{ base: "16px", lg: "18px" }} fontWeight="black" color="white" lineHeight={1}>{stat.value}</Text>
                    <Text fontSize="11px" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.05em" mt={1}>{stat.label}</Text>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>

          {/* Bottom Row */}
          <Flex align="end" justify="space-between" gap={3} minW={0}>
            <Box minW={0}>
              <Text fontSize={{ base: "2xl", lg: "4xl" }} fontWeight="black" color={accent} lineHeight={1}>
                {displayPlayer.gamesPlayed ? asNumber(displayPlayer.par / displayPlayer.gamesPlayed) : asNumber(displayPlayer.par)}
              </Text>
              <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" lineClamp={1}>
                PAR / G
              </Text>
            </Box>
            <Flex 
              align="center" 
              justify="center" 
              px={{ base: 2, lg: 3 }} 
              py={{ base: 1.5, lg: 2 }} 
              bg="whiteAlpha.50" 
              border="1px solid" 
              borderColor="whiteAlpha.200" 
              borderRadius="md" 
              cursor="pointer" 
              _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.400" }} 
              transition="all 0.2s"
              flexShrink={0}
            >
              <Text fontSize={{ base: "10px", lg: "11px" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.1em">
                View Profile
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
