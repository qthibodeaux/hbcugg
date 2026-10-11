import { Box, Text, Flex, Badge, Container } from "@chakra-ui/react";
import { Calendar, Trophy, TrendingUp } from "lucide-react";

const TeamHero = ({ team }) => {
  if (!team) return null;

  return (
    <Box
      position="relative"
      minH={{ base: "400px", md: "500px" }}
      display="flex"
      alignItems="flex-end"
      overflow="hidden"
      bg="bg.secondary"
    >
      {/* Background Gradient with Team Color */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(135deg, ${team.colors.primary}40 0%, ${team.colors.primary}20 50%, transparent 100%)`}
      />
      
      {/* Subtle Pattern Overlay */}
      <Box
        position="absolute"
        inset={0}
        bgImage="url('/pics/hero_stadium.jpg')"
        bgSize="cover"
        bgPosition="center"
        opacity={0.15}
      />

      {/* Team Initial Watermark */}
      <Text
        position="absolute"
        right={{ base: "-20px", md: "60px" }}
        top="50%"
        transform="translateY(-50%)"
        fontSize={{ base: "150px", md: "250px", lg: "350px" }}
        fontWeight="black"
        color={`${team.colors.primary}20`}
        lineHeight={1}
        pointerEvents="none"
        display={{ base: "none", md: "block" }}
      >
        {team.shortName}
      </Text>

      {/* Content */}
      <Container maxW="1400px" position="relative" zIndex={10} py={12} px={{ base: 4, md: 8 }}>
        {/* Badges */}
        <Flex gap={3} mb={4} wrap="wrap">
          <Badge bg={team.colors.primary} color="white" px={3} py={1} textTransform="uppercase">
            Elite Performance
          </Badge>
          <Badge variant="subtle" colorScheme="red" textTransform="uppercase">
            {team.conference}
          </Badge>
        </Flex>

        {/* Team Name */}
        <Text
          fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={0.95}
          letterSpacing="tight"
          mb={6}
        >
          {team.name}
        </Text>

        {/* Key Stats Row */}
        <Flex gap={{ base: 4, md: 8 }} wrap="wrap">
          <Box minW="140px">
            <Flex align="center" gap={2} mb={1}>
              <Trophy size={16} color={team.colors.secondary} />
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Current Record</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color="white">9-1</Text>
            <Text fontSize="xs" color={team.colors.secondary}>1st in {team.division || "Conference"}</Text>
          </Box>

          <Box minW="140px">
            <Flex align="center" gap={2} mb={1}>
              <TrendingUp size={16} color={team.colors.secondary} />
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">National Rank</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color="white">#1</Text>
            <Text fontSize="xs" color={team.colors.secondary}>HBCU Gridiron Composite</Text>
          </Box>

          <Box minW="140px">
            <Flex align="center" gap={2} mb={1}>
              <Calendar size={16} color={team.colors.secondary} />
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Next Game</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white">VS FAMU</Text>
            <Text fontSize="xs" color={team.colors.secondary}>Sat 7PM ET</Text>
          </Box>

          <Box minW="140px">
            <Flex align="center" gap={2} mb={1}>
              <Trophy size={16} color={team.colors.secondary} />
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Glory Rating</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="black" color={team.colors.secondary}>98.4</Text>
            <Text fontSize="xs" color="text.muted">Elite Tier</Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default TeamHero;
