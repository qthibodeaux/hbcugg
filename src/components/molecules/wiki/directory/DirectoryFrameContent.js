import { Text, Flex, Image, Box } from "@chakra-ui/react";
import { compactLabel, KEN_BURNS_DURATION } from "./wikiDirectoryModel";
import { User } from "lucide-react";

export const FrameContent = ({ frame, team, primaryColor, colorTreatment, isMobile }) => {
  if (frame === "abbrev") {
    return (
      <Text
        fontSize="clamp(0.9rem, 1.45vw, 1.22rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.92}
        lineClamp={1}
      >
        {compactLabel(team)}
      </Text>
    );
  }

  if (frame === "fullName") {
    return (
      <Text
        fontSize="clamp(0.7rem, 1.05vw, 0.92rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={1.02}
        lineClamp={2}
      >
        {team.name}
      </Text>
    );
  }

  if (frame === "logo") {
    // Mobile — cards are too narrow at 6-across for the logo+mascot inline
    // row (desktop layout below) to read at all. Logo dominates the square,
    // team name sits as its own caption bar pinned to the bottom instead of
    // sharing a vertically-centered row with it.
    if (isMobile) {
      return (
        <Flex direction="column" h="full" w="full" align="center" justify="space-between">
          <Flex flex="1" align="center" justify="center" minH={0} w="full">
            <Image
              src={team.logo}
              alt={team.name}
              maxW="80%"
              maxH="80%"
              objectFit="contain"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
            />
          </Flex>
          <Text
            fontSize="clamp(0.42rem, 1.6vw, 0.58rem)"
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.01em"
            lineHeight={1}
            lineClamp={1}
            textAlign="center"
            w="full"
          >
            {compactLabel(team)}
          </Text>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Image
          src={team.logo}
          alt={team.name}
          boxSize="clamp(24px, 3vw, 38px)"
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
          flexShrink={0}
        />
        <Text
          fontSize="clamp(0.45rem, 0.75vw, 0.62rem)"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
          lineHeight={1.15}
          lineClamp={2}
          minW={0}
        >
          {team.mascot}
        </Text>
      </Flex>
    );
  }

  if (frame === "player") {
    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Box
          w="clamp(24px, 3vw, 34px)"
          h="clamp(24px, 3vw, 34px)"
          borderRadius="8px"
          bg={`${primaryColor}33`}
          border="1px solid"
          borderColor={`${primaryColor}66`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <User size={14} color={primaryColor} />
        </Box>
        <Box minW={0}>
          <Text
            fontSize="clamp(0.42rem, 0.7vw, 0.56rem)"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            lineClamp={1}
          >
            {team.conference}
          </Text>
          <Text fontSize="clamp(0.58rem, 0.85vw, 0.72rem)" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
            {compactLabel(team)}
          </Text>
        </Box>
      </Flex>
    );
  }

  if (frame === "logoBig") {
    return (
      <Box position="absolute" inset={0} overflow="hidden">
        <Box
          as="img"
          src={team.logo}
          alt=""
          position="absolute"
          w="100%"
          h="100%"
          objectFit="contain"
          transformOrigin="center center"
          style={{
            animation: `kenBurns ${KEN_BURNS_DURATION}ms ease-in-out infinite alternate`,
            ...colorTreatment,
          }}
        />
      </Box>
    );
  }

  return null;
};
