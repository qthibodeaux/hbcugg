import { Box, Flex, Text } from "@chakra-ui/react";
// eslint-disable-next-line no-unused-vars
import { Link } from "react-router-dom";

/**
 * Enhanced Schools Hub Banner with tagline and typography improvements.
 */
export const SchoolsHeroBanner = ({ 
  title = "THE SCHOOLS", 
  tagline = "HBCU GRIDIRON GLORY", 
  description = "A comprehensive directory for Historical Black Colleges and Universities across the SWAC and MEAC conferences.",
}) => {
  return (
    <Box 
      w="100%" 
      h="100%" 
      position="relative" 
      bg="bg.secondary" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      overflow="hidden"
      p={8}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      {/* Background Watermark/Accent */}
      <Box 
        position="absolute" 
        top="-10px" 
        right="-20px" 
        fontSize="120px" 
        fontWeight="black" 
        color="whiteAlpha.050"
        pointerEvents="none"
        userSelect="none"
        lineHeight="1"
        transform="rotate(-5deg)"
      >
        HBCU
      </Box>

      <Flex direction="column" zIndex={1} maxW="700px">
        <Flex align="center" gap={3} mb={1}>
          <Box h="2px" w="40px" bg="brand.500" />
          <Text 
            fontSize="xs" 
            fontWeight="black" 
            color="brand.500" 
            letterSpacing="0.4em" 
            textTransform="uppercase"
          >
            {tagline}
          </Text>
        </Flex>

        <Text 
          fontSize={{ base: "4xl", md: "6xl" }} 
          fontWeight="black" 
          color="white" 
          lineHeight="0.9" 
          mb={4}
          letterSpacing="-0.02em"
        >
          {title.split(" ").map((word, i) => (
            <Box as="span" key={i} mr={3} display="inline-block">
              {word === "SCHOOLS" ? <Box as="span" color="white" fontStyle="italic">{word}</Box> : word}
            </Box>
          ))}
        </Text>

        <Text 
          fontSize="sm" 
          color="text.secondary" 
          fontWeight="medium" 
          maxW="500px" 
          lineHeight="tall"
          borderLeft="2px solid"
          borderColor="whiteAlpha.200"
          pl={4}
        >
          {description}
        </Text>
      </Flex>
    </Box>
  );
};
