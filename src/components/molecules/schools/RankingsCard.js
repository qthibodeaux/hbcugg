import React from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import teamsData from '../../../data/teams.json';
import { useLayoutDensity } from '../../../hooks/useLayoutDensity';

const allTeams = teamsData.teams;
const byShort = Object.fromEntries(allTeams.map((t) => [t.shortName, t]));

// ─── Mock Glory Rankings ──────────────────────────────────────────────────────
export const MOCK_GLORY_TOP6 = [
  { shortName: 'JSU',  name: 'Jackson State',  glory: 98, prev: 1, trend: 'hold' },
  { shortName: 'NCCU', name: 'N.C. Central',   glory: 96, prev: 3, trend: 'up'   },
  { shortName: 'FAMU', name: 'Florida A&M',    glory: 94, prev: 2, trend: 'down' },
  { shortName: 'SU',   name: 'Southern',       glory: 92, prev: 4, trend: 'up'   },
  { shortName: 'HU',   name: 'Howard',         glory: 90, prev: 5, trend: 'hold' },
  { shortName: 'ASU',  name: 'Alabama State',  glory: 88, prev: 7, trend: 'up'   },
];

const getTeam = (shortName) => byShort[shortName] || null;

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT A — GLORY SCOREBOARD
// Big glory number front and center. Leader spotlit with school color.
// Clean rank list below leader.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT B — GLORY BAR CHART
// Horizontal bar scaled to glory score. Full name + score label.
// Visual comparison at a glance.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — GLORY PODIUM
// Top 3 on a visual podium (1st center/tallest, 2nd left, 3rd right).
// Remaining 3 as a compact list below.
// ─────────────────────────────────────────────────────────────────────────────
export const RankingsPodium = ({ rows = MOCK_GLORY_TOP6, title = "Glory Rankings" }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const [first, second, third, ...rest] = rows;

  // Podium order: 2nd | 1st | 3rd
  const podium = [
    { row: second, rank: 2, h: '64px' },
    { row: first,  rank: 1, h: '88px' },
    { row: third,  rank: 3, h: '48px' },
  ];

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">

      <Flex px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" gap={2}>
        <Zap size={12} color="var(--chakra-colors-brand-500)" />
        {/* Matches the standings card header treatment (StandingsBrandWash):
            sm / black / white / 0.14em tracking. */}
        <Text fontSize="sm" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.14em" flex={1}>
          {title}
        </Text>
      </Flex>

      {/* Podium */}
      <Flex px={5} pt={5} pb={4} align="flex-end" justify="center" gap={3}>
        {podium.map(({ row, rank, h }) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          const secondary = team?.colors?.secondary || '#ffffff';
          return (
            <Flex key={row.shortName} direction="column" align="center" gap={2} flex={1}
              cursor="pointer" role="group"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              {/* Logo above podium */}
              {team && (
                <Image src={team.logo} alt="" boxSize={rank === 1 ? '44px' : '34px'} objectFit="contain"
                  filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                  transition="transform 0.25s" _groupHover={{ transform: 'scale(1.1)' }}
                />
              )}
              <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase">{row.shortName}</Text>
              {/* Podium block */}
              <Box
                w="full" h={h} borderRadius="md 4px 0 0" position="relative" overflow="hidden"
                bg={`${primary}CC`} borderBottom="none"
              >
                <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={0}>
                  <Text
                    fontSize={rank === 1 ? '3xl' : '2xl'} fontWeight="black" fontStyle="italic"
                    color={secondary} lineHeight={1} letterSpacing="-0.04em"
                    style={{ textShadow: `0 1px 6px rgba(0,0,0,0.4)` }}
                  >
                    {rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD'}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color={secondary} opacity={0.6} mt="2px">{row.glory}</Text>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </Flex>

      {/* Remaining 3 — mobile collapses the three full-width rows into one
          3-column strip showing just rank number + logo, since the podium
          above already carries the identity and the stacked rows ate most
          of the card's height on a phone. */}
      {isMobile ? (
        <Flex borderTop="1px solid" borderColor="whiteAlpha.100">
          {rest.map((row, i) => {
            const team = getTeam(row.shortName);
            return (
              <Flex
                key={row.shortName}
                flex={1}
                align="center"
                justify="center"
                gap={2}
                py={3}
                borderLeft={i > 0 ? '1px solid' : 'none'}
                borderColor="whiteAlpha.50"
                cursor="pointer"
                _hover={{ bg: 'whiteAlpha.50' }}
                transition="background 0.15s"
                onClick={() => team && navigate(`/teams/${team.id}`)}
              >
                <Text fontSize="sm" fontWeight="black" color="white" flexShrink={0}>
                  {i + 4}
                </Text>
                {team && <Image src={team.logo} alt={row.name} boxSize="26px" objectFit="contain" flexShrink={0} />}
              </Flex>
            );
          })}
        </Flex>
      ) : (
      <Box borderTop="1px solid" borderColor="whiteAlpha.100">
        {rest.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          return (
            <Flex key={row.shortName} px={5} py={3} align="center" gap={3}
              borderBottom={i < rest.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.15s"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Text fontSize="md" fontWeight="black" color="white" w="22px" flexShrink={0}>{i + 4}</Text>
              {team && <Image src={team.logo} alt="" boxSize="24px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="sm" fontWeight="black" color="text.primary" textTransform="uppercase"
                letterSpacing="0.02em" flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                {row.name}
              </Text>
              <Text fontSize="md" fontWeight="black" color="white">{row.glory}</Text>
            </Flex>
          );
        })}
      </Box>
      )}
    </Box>
  );
};
