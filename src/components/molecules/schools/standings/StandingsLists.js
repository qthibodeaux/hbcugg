import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, VStack, Image } from "@chakra-ui/react";
import { getTeam } from "./standingsFixtures";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Existing clean and brand-wash standings card variants.

export const StandingsClean = ({ title, rows, accentColor = 'brand.500' }) => {
  const navigate = useNavigate();

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderTop="3px solid" borderTopColor={accentColor} overflow="hidden">

      <Flex px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" justify="space-between">
        <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
          {title}
        </Text>
        <Text fontSize="9px" color="text.muted">CONF</Text>
      </Flex>

      <VStack gap={0} align="stretch">
        {rows.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          return (
            <Flex
              key={row.shortName} px={4} py="10px" align="center" gap={3}
              borderBottom={i < rows.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              _hover={{ bg: 'whiteAlpha.50', transform: 'translateX(3px)' }}
              transition="all 0.15s"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Text fontSize="10px" fontWeight="black" color="whiteAlpha.300" w="14px" flexShrink={0}>{i + 1}</Text>
              {team && <Image src={team.logo} alt="" boxSize="20px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase"
                letterSpacing="0.02em" flex={1} lineClamp={1}
                _groupHover={{ color: primary }} transition="color 0.2s">
                {row.shortName}
              </Text>
              <Text fontSize="10px" fontWeight="bold" color="text.muted" flexShrink={0}>{row.conf}</Text>
              <Box flexShrink={0} w="12px">
                {row.trend === 'up'   && <TrendingUp   size={10} color="var(--chakra-colors-green-400)" />}
                {row.trend === 'down' && <TrendingDown  size={10} color="var(--chakra-colors-red-400)"   />}
                {row.trend === 'flat' && <Minus         size={10} color="var(--chakra-colors-text-muted)" />}
              </Box>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export const StandingsBrandWash = ({ title, rows, accentColor = 'brand.500' }) => {
  const navigate = useNavigate();

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden"
      display="flex" flexDirection="column">

      {/* Header */}
      <Flex px={3} py={3} align="center" gap={3} borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
        <Box w="3px" h="16px" bg={accentColor} borderRadius="full" flexShrink={0} />
        <Text fontSize="sm" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.14em" flex={1}>
          {title}
        </Text>
        <Text fontSize="xs" fontWeight="bold" color="text.muted">REC</Text>
        <Text fontSize="xs" fontWeight="bold" color="text.muted" w="36px" textAlign="right">CONF</Text>
      </Flex>

      <VStack gap={0} align="stretch" flex={1}>
        {rows.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#444';
          const secondary = team?.colors?.secondary || '#ffffff';
          const isLeader = i === 0;

          return (
            <Flex
              key={row.shortName} px={2} gap={0} flex={1} align="stretch"
              borderBottom={i < rows.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              position="relative" overflow="hidden"
              bg={`linear-gradient(90deg, ${primary}${isLeader ? '44' : '22'} 0%, transparent 60%)`}
              cursor="pointer" role="group"
              _hover={{ bg: `linear-gradient(90deg, ${primary}55 0%, transparent 70%)` }}
              transition="background 0.2s"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              {/* Rank */}
              <Flex align="center" justify="center" w="24px" flexShrink={0}>
                <Text
                  fontSize={isLeader ? 'lg' : 'md'} fontWeight="black" lineHeight={1}
                  color={secondary}
                  style={{ textShadow: isLeader ? `0 0 14px ${primary}` : 'none' }}
                >
                  {i + 1}
                </Text>
              </Flex>

              {/* Logo — full row height */}
              {team && (
                <Flex align="center" justify="center" w="36px" flexShrink={0} py={1}>
                  <Image
                    src={team.logo} alt="" h="100%" maxH="100%" w="auto" objectFit="contain"
                    transition="transform 0.2s" _groupHover={{ transform: 'scale(1.08)' }}
                    filter="drop-shadow(0 1px 4px rgba(0,0,0,0.5))"
                  />
                </Flex>
              )}

              {/* School name */}
              <Flex align="center" flex={1} minW={0} px={2}>
                <Text fontSize={isLeader ? 'md' : 'sm'} fontWeight="black" color="white"
                  textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}
                  _groupHover={{ color: secondary }} transition="color 0.2s">
                  {row.name}
                </Text>
              </Flex>

              {/* Record */}
              <Flex align="center" flexShrink={0} pr={2}>
                <Text fontSize="xs" fontWeight="bold" color="text.muted">{row.record}</Text>
              </Flex>

              {/* Conf record */}
              <Flex align="center" flexShrink={0} w="40px" justify="flex-end">
                <Text
                  fontSize={isLeader ? 'md' : 'sm'} fontWeight="black"
                  color={isLeader ? secondary : 'text.primary'}
                >
                  {row.conf}
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};
