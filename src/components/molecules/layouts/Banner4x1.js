import { Box, Text } from "@chakra-ui/react";

const Banner4x1 = ({ kicker, headline, description, meta, children }) => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      px={{ base: 5, md: 7 }}
      py={{ base: 7, md: 9 }}
      borderRadius="2xl"
      bg="linear-gradient(135deg, rgba(229,62,62,0.18) 0%, rgba(246,173,85,0.06) 55%, rgba(255,255,255,0.02) 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {kicker && (
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.16em" mb={2}>
          {kicker}
        </Text>
      )}

      <Text
        fontSize={{ base: "4xl", md: "6xl" }}
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={0.92}
        letterSpacing="-0.04em"
      >
        {headline}
      </Text>

      {description && (
        <Text mt={4} maxW="760px" color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
          {description}
        </Text>
      )}

      {meta && (
        <Text mt={4} fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase" letterSpacing="0.14em">
          {meta}
        </Text>
      )}

      {children}
    </Box>
  );
};

export default Banner4x1;
