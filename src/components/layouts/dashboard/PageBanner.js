import { Box, Text } from "@chakra-ui/react";

const PageBanner = ({ kicker, title, description, meta, children }) => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      mb={6}
      px={{ base: 5, md: 7 }}
      py={{ base: 6, md: 8 }}
      borderRadius="2xl"
      bg="linear-gradient(135deg, rgba(229,62,62,0.16) 0%, rgba(246,173,85,0.04) 55%, rgba(255,255,255,0.02) 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      {kicker && (
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.16em" mb={2}>
          {kicker}
        </Text>
      )}

      <Text
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={0.95}
        letterSpacing="-0.03em"
      >
        {title}
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

export default PageBanner;
