import { getDisplayName, getYearsActive, getInitials } from "./coachStaffModel";
import { Box, Image, Flex, Text, Badge, Button, Link } from "@chakra-ui/react";

// Head-coach portrait, tenure and external profile presentation.

export const HeadCoachSpotlight = ({ coach, accent, onClick }) => {
  const displayName = getDisplayName(coach);
  const tenureYears = Math.max(1, getYearsActive(coach).length);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      minH={{ base: "360px", lg: "420px" }}
      bg="black"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.2s ease"
      _hover={onClick ? { borderColor: accent, boxShadow: `0 0 20px ${accent}20` } : {}}
      onClick={onClick}
    >
      {coach?.image_url ? (
        <Image
          src={coach.image_url}
          alt={displayName}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="top"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          bg="gray.800"
        >
          <Text fontSize="7xl" fontWeight="black" color="whiteAlpha.400">
            {getInitials(displayName)}
          </Text>
        </Flex>
      )}

      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(180deg, rgba(4,8,20,0.35) 20%, rgba(4,8,20,0.96) 78%)"
      />

      <Box
        position="absolute"
        top={4}
        left={4}
        bg="blackAlpha.700"
        border="1px solid"
        borderColor="whiteAlpha.300"
        px={3}
        py={1}
        borderRadius="full"
      >
        <Text fontSize="10px" color="whiteAlpha.900" letterSpacing="0.12em" fontWeight="bold" textTransform="uppercase">
          Operational Lead
        </Text>
      </Box>

      <Box
        position="relative"
        zIndex={1}
        h="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        p={{ base: 4, md: 5 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.1em" mb={1}>
          Head Coach
        </Text>
        <Text
          fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={0.95}
          letterSpacing="-0.02em"
          mb={3}
        >
          {displayName}
        </Text>

        {/* Record Callout Box */}
        <Box
          bg="linear-gradient(135deg, rgba(229,62,62,0.15) 0%, rgba(229,62,62,0.08) 100%)"
          border="2px solid"
          borderColor={accent}
          borderRadius="lg"
          px={3}
          py={2}
          mb={4}
        >
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={accent}
            fontFamily="'Courier New', monospace"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            {tenureYears} YEARS LEADING PROGRAM
          </Text>
        </Box>

        <Text color={accent} fontWeight="semibold" textTransform="uppercase" fontSize="sm" mb={4}>
          {coach?.title || "Head Coach"}
        </Text>

        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Badge colorScheme="orange" variant="subtle" px={3} py={1}>
            {tenureYears} YR{tenureYears > 1 ? "S" : ""} ACTIVE
          </Badge>

          {coach?.bio_url && (
            <Button
              as={Link}
              href={coach.bio_url}
              isExternal
              size="sm"
              bg={accent}
              color="white"
              _hover={{ opacity: 0.9 }}
              borderRadius="md"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              View Full Profile
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
