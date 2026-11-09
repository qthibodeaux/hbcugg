import { Box, Text, Badge, Flex, Image } from "@chakra-ui/react";
import { getDisplayName, getYearsActive, getInitials } from "./coachStaffModel";

// Staff overview statistics and coordinator/position coach cards.

export const IntelStatCard = ({ label, value, tone = "white" }) => (
  <Box
    bg="linear-gradient(180deg, rgba(14,20,40,0.95) 0%, rgba(9,14,28,0.95) 100%)"
    border="1px solid"
    borderColor="whiteAlpha.200"
    borderRadius="lg"
    p={4}
    minH="132px"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em" fontWeight="bold">
      {label}
    </Text>
    <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color={tone} lineHeight={1}>
      {value}
    </Text>
  </Box>
);

export const StaffCard = ({ coach, badgeLabel, accent, onClick }) => {
  const displayName = getDisplayName(coach);
  const tenureYears = Math.max(1, getYearsActive(coach).length);

  return (
    <Box
      bg="linear-gradient(160deg, rgba(15,24,48,0.96) 0%, rgba(10,16,33,0.96) 100%)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      p={3}
      position="relative"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.2s ease"
      _hover={onClick ? { borderColor: accent, bg: "linear-gradient(160deg, rgba(15,24,48,0.98) 0%, rgba(10,16,33,0.98) 100%)" } : {}}
      onClick={onClick}
    >
      <Box position="absolute" top={2} right={2}>
        <Badge variant="subtle" colorScheme="purple" fontSize="9px" textTransform="uppercase" letterSpacing="0.08em">
          {badgeLabel}
        </Badge>
      </Box>

      <Flex align="center" gap={3} mb={2} pr={16}>
        <Box
          w="46px"
          h="46px"
          borderRadius="md"
          overflow="hidden"
          bg="whiteAlpha.100"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {coach.image_url ? (
            <Image
              src={coach.image_url}
              alt={displayName}
              w="100%"
              h="100%"
              objectFit="cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Text fontSize="xs" fontWeight="bold" color="text.muted">
              {getInitials(displayName)}
            </Text>
          )}
        </Box>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
            {displayName}
          </Text>
          <Text fontSize="xs" color={accent} lineHeight="short" lineClamp={2}>
            {coach.title}
          </Text>
        </Box>
      </Flex>

      <Flex justify="space-between" align="center" mt={2}>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em">
          Tenure
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="text.primary">
          {tenureYears} yr{tenureYears > 1 ? "s" : ""}
        </Text>
      </Flex>
    </Box>
  );
};
