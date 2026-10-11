import { Badge, Box, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

const normalizeColor = (value) => (value || "").toString().trim().toLowerCase();

const isBlack = (value) => {
  const color = normalizeColor(value);
  return color === "#000" || color === "#000000" || color === "black" || color === "rgb(0,0,0)";
};

export const TeamBannerVariantC = ({ team, record }) => {
  if (!team) return null;

  const conferenceColor = isBlack(team.colors.primary) ? "white" : team.colors.primary;
  const locationColor = isBlack(team.colors.secondary) ? "white" : team.colors.secondary;
  const conferenceLabel = team.division ? `${team.conference} ${team.division}` : team.conference;

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={6}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h={{ base: "120px", md: "140px" }}
        bg={`linear-gradient(180deg, ${team.colors.primary}CC 0%, ${team.colors.primary}66 8%, transparent 28%)`}
        pointerEvents="none"
      />

      <Flex direction={{ base: "column", lg: "row" }} gap={8} align="center">
        <Flex align="center" gap={4} minW="280px">
          <Box
            w="80px"
            h="80px"
            bg="white"
            p={2}
            borderRadius="xl"
            border="3px solid"
            borderColor={team.colors.primary}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="md"
          >
            <img src={team.logo} alt={`${team.name} logo`} style={{ objectFit: "contain" }} />
          </Box>
          <Box>
            <Heading size="md" color="white">{team.name}</Heading>
            <Text fontSize="sm" color="whiteAlpha.700">
              <Box as="span" color={conferenceColor} fontWeight="semibold">{conferenceLabel}</Box>
              <Box as="span" color="whiteAlpha.500"> - </Box>
              <Box as="span" color={locationColor}>{team.location}</Box>
            </Text>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} flex={1} gap={4} w="full">
          {[
            { label: "Maturity", val: "Sr. Heavy", help: "12 Grads" },
            { label: "Physicality", val: "+8 lbs", help: "vs Conf Avg" },
            { label: "Identity", val: "85% TX", help: "Home Grown" },
          ].map((item) => (
            <Box
              key={item.label}
              textAlign="center"
              px={4}
              py={2}
              bg="whiteAlpha.50"
              borderRadius="lg"
            >
              <Text fontSize="2xs" color="whiteAlpha.500" textTransform="uppercase">{item.label}</Text>
              <Text fontSize="md" color="white" fontWeight="semibold">{item.val}</Text>
              <Text fontSize="2xs" color="whiteAlpha.400">{item.help}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box textAlign={{ base: "center", lg: "right" }}>
          <Badge bg={team.colors.primary} color="white" px={4} py={1} borderRadius="full">
            CHAMPIONSHIP WINDOW
          </Badge>
          <Text fontSize="2xl" fontWeight="black" color="white" mt={2}>{record}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const TeamBannerVariantC_MobileA = ({ team, record }) => {
  if (!team) return null;

  const conferenceColor = isBlack(team.colors.primary) ? "white" : team.colors.primary;
  const locationColor = isBlack(team.colors.secondary) ? "white" : team.colors.secondary;
  const conferenceLabel = team.division ? `${team.conference} ${team.division}` : team.conference;

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={4}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="70px"
        bg={`linear-gradient(180deg, ${team.colors.primary}CC 0%, ${team.colors.primary}55 15%, transparent 34%)`}
        pointerEvents="none"
      />

      <Flex justify="space-between" align="center" mb={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            w="56px"
            h="56px"
            bg="white"
            borderRadius="lg"
            border="2px solid"
            borderColor={team.colors.primary}
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="sm"
            flexShrink={0}
          >
            <img src={team.logo} alt={`${team.name} logo`} style={{ objectFit: "contain" }} />
          </Box>
          <Box minW={0}>
            <Text color="white" fontWeight="bold" fontSize="sm" lineClamp={1}>{team.name}</Text>
            <Text fontSize="11px" lineClamp={1}>
              <Box as="span" color={conferenceColor} fontWeight="semibold">{conferenceLabel}</Box>
              <Box as="span" color="whiteAlpha.500"> - </Box>
              <Box as="span" color={locationColor}>{team.location}</Box>
            </Text>
          </Box>
        </Flex>

        <Box
          bg={team.colors.primary}
          color="white"
          px={2.5}
          py={1}
          borderRadius="md"
          fontWeight="black"
          fontSize="sm"
          flexShrink={0}
        >
          {record}
        </Box>
      </Flex>

      <SimpleGrid columns={3} gap={2}>
        {[
          { label: "Maturity", val: "Sr+" },
          { label: "Physical", val: "+8 lb" },
          { label: "Identity", val: "85% TX" },
        ].map((item) => (
          <Box key={item.label} bg="whiteAlpha.50" borderRadius="md" px={2} py={2} textAlign="center">
            <Text fontSize="9px" color="whiteAlpha.500" textTransform="uppercase">{item.label}</Text>
            <Text fontSize="xs" color="white" fontWeight="semibold">{item.val}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export const TeamBannerVariantC_MobileB = ({ team, record }) => {
  if (!team) return null;

  const conferenceLabel = team.division ? `${team.conference} ${team.division}` : team.conference;

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="bg.card"
    >
      <Box
        px={4}
        py={3}
        bg={`linear-gradient(90deg, ${team.colors.primary}CC 0%, ${team.colors.primary}66 30%, transparent 100%)`}
      >
        <Flex align="center" gap={3}>
          <Box
            w="48px"
            h="48px"
            bg="white"
            p={1.5}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <img src={team.logo} alt={`${team.name} logo`} style={{ objectFit: "contain" }} />
          </Box>
          <Box>
            <Text color="white" fontSize="sm" fontWeight="bold" lineHeight={1.1}>{team.name}</Text>
            <Text color="whiteAlpha.700" fontSize="10px">{conferenceLabel}</Text>
          </Box>
        </Flex>
      </Box>

      <Box px={4} py={3}>
        <Flex justify="space-between" align="center" mb={3}>
          <Badge bg="whiteAlpha.100" color="white" borderRadius="full" px={2.5} py={0.5}>
            {team.location}
          </Badge>
          <Text color={team.colors.primary} fontWeight="black" fontSize="lg">{record}</Text>
        </Flex>

        <VStack gap={2} align="stretch">
          {[
            { label: "Maturity", val: "Senior Heavy", help: "12 Grads" },
            { label: "Physicality", val: "+8 lbs", help: "vs Conf Avg" },
            { label: "Identity", val: "85% TX", help: "Home Grown" },
          ].map((item) => (
            <Flex key={item.label} justify="space-between" align="center" bg="whiteAlpha.50" px={3} py={2} borderRadius="md">
              <Box>
                <Text fontSize="10px" color="whiteAlpha.500" textTransform="uppercase">{item.label}</Text>
                <Text fontSize="11px" color="whiteAlpha.600">{item.help}</Text>
              </Box>
              <Text fontSize="sm" color="white" fontWeight="bold">{item.val}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};
