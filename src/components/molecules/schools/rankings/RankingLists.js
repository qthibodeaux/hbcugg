import { MOCK_GLORY_TOP6, getTeam } from "./rankingData";
import { useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Text, Image, VStack } from "@chakra-ui/react";
import { Zap } from "lucide-react";

// Existing ranking scoreboard and bar-list variants.

export const RankingsScoreboard = ({ rows = MOCK_GLORY_TOP6 }) => {
  const navigate = useNavigate();
  const [leader, ...rest] = rows;
  const leaderTeam = getTeam(leader.shortName);
  const leaderColor = leaderTeam?.colors?.primary || '#888';

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">

      {/* Header */}
      <Flex px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" justify="space-between">
        <HStack gap={2}>
          <Zap size={10} color="var(--chakra-colors-brand-500)" />
          <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
            Glory Rankings
          </Text>
        </HStack>
        <Text fontSize="9px" color="text.muted">TOP 6</Text>
      </Flex>

      {/* Leader spotlight */}
      <Box
        px={4} py={4} position="relative" overflow="hidden"
        bg={`linear-gradient(135deg, ${leaderColor}22 0%, transparent 70%)`}
        borderBottom="1px solid" borderColor="whiteAlpha.100"
        cursor="pointer" role="group"
        _hover={{ bg: `linear-gradient(135deg, ${leaderColor}33 0%, transparent 80%)` }}
        onClick={() => leaderTeam && navigate(`/teams/${leaderTeam.id}`)}
      >
        <Flex align="center" gap={4}>
          <Text fontSize="3xl" fontWeight="black" fontStyle="italic" color={leaderColor}
            lineHeight={1} letterSpacing="-0.04em">
            #1
          </Text>
          {leaderTeam && (
            <Image src={leaderTeam.logo} alt="" boxSize="40px" objectFit="contain"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
              transition="transform 0.3s"
              _groupHover={{ transform: 'scale(1.08)' }}
            />
          )}
          <Box flex={1}>
            <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em">
              {leader.name}
            </Text>
            <Text fontSize="9px" color="text.muted">{leader.shortName}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="2xl" fontWeight="black" color={leaderColor} lineHeight={1}>{leader.glory}</Text>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">GLORY</Text>
          </Box>
        </Flex>
      </Box>

      {/* Rest of rankings */}
      <VStack gap={0} align="stretch">
        {rest.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          return (
            <Flex key={row.shortName} px={4} py="10px" align="center" gap={3}
              borderBottom={i < rest.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.15s"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Text fontSize="10px" fontWeight="black" color="whiteAlpha.300" w="14px">{i + 2}</Text>
              {team && <Image src={team.logo} alt="" boxSize="18px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase"
                flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                {row.shortName}
              </Text>
              <Text fontSize="sm" fontWeight="black" color="text.secondary">{row.glory}</Text>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export const RankingsBarChart = ({ rows = MOCK_GLORY_TOP6 }) => {
  const navigate = useNavigate();
  const max = rows[0].glory;

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">

      <Flex px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" gap={2}>
        <Zap size={10} color="var(--chakra-colors-brand-500)" />
        <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em" flex={1}>
          Glory Rankings
        </Text>
        <Text fontSize="9px" color="text.muted">SCORE</Text>
      </Flex>

      <VStack gap={0} align="stretch" px={3} py={2}>
        {rows.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          const pct = row.glory / max;

          return (
            <Box key={row.shortName} py={2}
              borderBottom={i < rows.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Flex align="center" gap={2} mb={1}>
                <Text fontSize="10px" fontWeight="black" color="whiteAlpha.300" w="14px" flexShrink={0}>{i + 1}</Text>
                {team && <Image src={team.logo} alt="" boxSize="16px" objectFit="contain" flexShrink={0} />}
                <Text fontSize="10px" fontWeight="black" color="text.primary" textTransform="uppercase"
                  flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                  {row.shortName}
                </Text>
                <Text fontSize="sm" fontWeight="black" color={i === 0 ? primary : 'text.secondary'}>
                  {row.glory}
                </Text>
              </Flex>

              {/* Glory bar */}
              <Flex pl={7}>
                <Box flex={1} h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="full" borderRadius="full"
                    w={`${pct * 100}%`}
                    bg={i === 0 ? primary : `${primary}88`}
                    transition="width 0.7s ease"
                  />
                </Box>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};
