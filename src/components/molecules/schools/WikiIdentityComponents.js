import { Box, Flex, Text, Image, Icon, SimpleGrid } from "@chakra-ui/react";
import { Calendar, Users, MapPin, Building, ChevronRight, Triangle } from "lucide-react";

/**
 * SectionHeader
 * Editorial section header with numbered anchors
 */
export const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <Box mb={4} mt={8} borderLeft="3px solid" borderColor="brand.500" pl={4}>
    <Text fontSize="10px" fontWeight="black" color="brand.500" letterSpacing="0.4em" mb={0}>
      {eyebrow.toUpperCase()}
    </Text>
    <Text fontSize="3xl" fontWeight="black" color="text.primary" letterSpacing="tight" lineHeight="1">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="xs" color="text.muted" mt={1}>
        {subtitle}
      </Text>
    )}
  </Box>
);

/**
 * SchoolIdentityPlate
 * High-identity selector tile for the school grid
 */
export const SchoolIdentityPlate = ({ team, onClick }) => (
  <Box
    as="button"
    onClick={() => onClick(team.id)}
    position="relative"
    overflow="hidden"
    borderRadius="xl"
    bg="#111216"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderLeft={`4px solid ${team.colors.primary}`}
    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
    h="full"
    w="full"
    textAlign="left"
    _hover={{
      transform: "translateX(4px)",
      borderColor: team.colors.primary,
      boxShadow: `0 0 24px ${team.colors.primary}33`,
      bg: "whiteAlpha.100",
    }}
    className="group"
  >
    {/* Background Watermark */}
    <Text
      position="absolute"
      right="-5px"
      bottom="-10px"
      fontSize="52px"
      fontWeight="900"
      color="whiteAlpha.100"
      pointerEvents="none"
      lineHeight="1"
      transition="all 0.3s"
      _groupHover={{ color: "whiteAlpha.200", transform: "scale(1.1)" }}
    >
      {team.shortName}
    </Text>

    <Flex h="full" align="center" px={4} gap={4} position="relative" zIndex={1}>
      <Image 
        src={team.logo} 
        boxSize="48px" 
        objectFit="contain"
        transition="all 0.3s"
        _groupHover={{ transform: "scale(1.1) rotate(-5deg)" }}
      />
      <Box>
        <Text fontSize="md" fontWeight="900" color="white" lineHeight="1.1">
          {team.name.toUpperCase()}
        </Text>
        <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
          {team.mascot}
        </Text>
      </Box>
    </Flex>
  </Box>
);

/**
 * ProgramWikiCard
 * Editorial detail card for the school directory
 */
export const ProgramWikiCard = ({ team, onClick }) => (
  <Box
    borderRadius="2xl"
    bg="#111216"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderTop={`4px solid ${team.colors.primary}`}
    position="relative"
    overflow="hidden"
    transition="all 0.3s"
    _hover={{ 
      borderColor: team.colors.primary, 
      boxShadow: `0 0 30px ${team.colors.primary}33`,
      transform: "translateY(-4px)"
    }}
    h="full"
    w="full"
  >
    {/* Identity Wash */}
    <Box
      position="absolute"
      inset={0}
      bg={`radial-gradient(circle at top right, ${team.colors.primary}15, transparent 40%)`}
      pointerEvents="none"
    />

    {/* Focal Watermark */}
    <Text
      position="absolute"
      left="-10px"
      top="-10px"
      fontSize="80px"
      fontWeight="900"
      color="whiteAlpha.50"
      pointerEvents="none"
      lineHeight="1"
      letterSpacing="-0.05em"
      opacity={0.3}
    >
      {team.shortName}
    </Text>

    <Box p={6} position="relative" zIndex={1}>
      <Flex align="center" gap={4} mb={6}>
        <Box 
          w="60px" 
          h="60px" 
          borderRadius="xl" 
          bg="whiteAlpha.200" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          p={2}
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Image src={team.logo} boxSize="44px" objectFit="contain" />
        </Box>
        <Box>
          <Text fontSize="xl" fontWeight="900" color="text.primary" lineHeight="1">
            {team.name.toUpperCase()}
          </Text>
          <Text fontSize="sm" color="brand.400" fontWeight="black" letterSpacing="widest">
            {team.mascot.toUpperCase()}
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={2} spacing={4} mb={6}>
        <WikiStat icon={Calendar} label="Founded" value={team.founded || "1800s"} />
        <WikiStat icon={Users} label="Enrollment" value={team.enrollment?.toLocaleString() || "6,000+"} />
        <WikiStat icon={Building} label="Stadium" value={team.stadium || "Home Field"} />
        <WikiStat icon={MapPin} label="Capacity" value={team.stadiumCapacity?.toLocaleString() || "20,000"} />
      </SimpleGrid>

      <Box
        as="button"
        onClick={() => onClick(team.id)}
        w="full"
        py={3}
        bg="whiteAlpha.100"
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        transition="all 0.2s"
        _hover={{ bg: team.colors.primary, color: "white" }}
      >
        <Text fontSize="xs" fontWeight="black" letterSpacing="widest">VIEW PROGRAM WIKI</Text>
        <ChevronRight size={14} />
      </Box>
    </Box>
  </Box>
);

const WikiStat = ({ icon, label, value }) => (
  <Flex align="flex-start" gap={2}>
    <Icon as={icon} size={14} color="text.muted" mt={1} />
    <Box>
      <Text fontSize="9px" color="text.muted" textTransform="uppercase" fontWeight="bold" letterSpacing="0.1em">
        {label}
      </Text>
      <Text fontSize="xs" fontWeight="black" color="text.primary" lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

/**
 * ConferenceIdentityCard
 * Large identity block for SWAC/MEAC
 */
export const ConferenceIdentityCard = ({ confKey, meta }) => (
  <Box
    h="full"
    borderRadius="3xl"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
  >
    {/* Large Background Text */}
    <Text
      position="absolute"
      right="-30px"
      bottom="-50px"
      fontSize="180px"
      fontWeight="black"
      color="white"
      opacity={0.03}
      pointerEvents="none"
      lineHeight="1"
    >
      {confKey}
    </Text>

    <Box
      p={8}
      bg={`linear-gradient(135deg, ${meta.accent}22 0%, transparent 60%)`}
      h="full"
    >
      <Flex direction="column" h="full">
        <Box mb={6}>
          <Text fontSize="10px" fontWeight="black" color={meta.accent} textTransform="uppercase" letterSpacing="0.25em" mb={1}>
            {meta.full}
          </Text>
          <Text fontSize="4xl" fontWeight="black" color="text.primary" lineHeight="1">
            {confKey}
          </Text>
        </Box>

        <Text fontSize="sm" color="text.secondary" lineHeight="1.6" mb={8} maxW="90%">
          {meta.blurb}
        </Text>

        <SimpleGrid columns={2} spacing={6} mb={8}>
          {meta.facts.slice(0, 4).map((f) => (
            <Box key={f.label}>
              <Text fontSize="9px" color="text.muted" textTransform="uppercase" fontWeight="bold">
                {f.label}
              </Text>
              <Text fontSize="md" fontWeight="black" color="text.primary">
                {f.value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box mt="auto">
            <Flex align="center" gap={2}>
                <Triangle size={12} color={meta.accent} fill={meta.accent} />
                <Text fontSize="xs" fontWeight="black" letterSpacing="0.1em">SIGNATURE: CELEBRATION BOWL</Text>
            </Flex>
        </Box>
      </Flex>
    </Box>
  </Box>
);
