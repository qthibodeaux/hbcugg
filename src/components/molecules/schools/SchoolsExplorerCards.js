import { Box, Flex, Text, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ChevronRight, Database, BarChart2 } from "lucide-react";

export const RosterFieldReport = () => (
  <Box
    as={RouterLink}
    to="/rosters"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    {/* Left panel */}
    <Flex direction="column" justify="center" p={6} flex={1} zIndex={1}>
      <Text
        fontSize="2xl"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={1}
        mb={3}
      >
        Roster
        <br />
        Explorer
      </Text>
      <HStack gap={1}>
        <Text fontSize="xs" fontWeight="black" color="brand.400">
          EXPLORE
        </Text>
        <ChevronRight size={12} color="var(--chakra-colors-brand-400)" />
      </HStack>
    </Flex>

    {/* Right: jersey number art */}
    <Flex
      align="center"
      justify="center"
      w="200px"
      flexShrink={0}
      position="relative"
    >
      <Text
        fontSize="180px"
        fontWeight="black"
        fontStyle="italic"
        lineHeight={1}
        color="whiteAlpha.50"
        letterSpacing="-0.06em"
        userSelect="none"
        position="absolute"
        right="-20px"
      >
        #1
      </Text>
      <Database
        size={32}
        color="var(--chakra-colors-brand-500)"
        style={{ position: "relative", zIndex: 1 }}
      />
    </Flex>

    {/* Bottom accent line */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="2px"
      bg="linear-gradient(90deg, var(--chakra-colors-brand-500), transparent)"
    />
  </Box>
);

export const TeamAnalyticsExplorer = () => (
  <Box
    as={RouterLink}
    to="/team-analytics"
    w="100%"
    h="100%"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    position="relative"
    overflow="hidden"
    cursor="pointer"
    display="flex"
    _hover={{ borderColor: "brand.500" }}
    transition="border-color 0.2s"
  >
    {/* Left panel */}
    <Flex direction="column" justify="center" p={6} flex={1} zIndex={1}>
      <Text
        fontSize="2xl"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={1}
        mb={3}
      >
        Team
        <br />
        Analytics
      </Text>
      <HStack gap={1}>
        <Text fontSize="xs" fontWeight="black" color="brand.400">
          EXPLORE
        </Text>
        <ChevronRight size={12} color="var(--chakra-colors-brand-400)" />
      </HStack>
    </Flex>

    {/* Right: bar-chart mark art, same treatment as the ghost jersey number */}
    <Flex
      align="center"
      justify="center"
      w="200px"
      flexShrink={0}
      position="relative"
    >
      <Text
        fontSize="180px"
        fontWeight="black"
        fontStyle="italic"
        lineHeight={1}
        color="whiteAlpha.50"
        letterSpacing="-0.06em"
        userSelect="none"
        position="absolute"
        right="-20px"
      >
        %
      </Text>
      <BarChart2
        size={32}
        color="var(--chakra-colors-brand-500)"
        style={{ position: "relative", zIndex: 1 }}
      />
    </Flex>

    {/* Bottom accent line */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="2px"
      bg="linear-gradient(90deg, var(--chakra-colors-brand-500), transparent)"
    />
  </Box>
);
