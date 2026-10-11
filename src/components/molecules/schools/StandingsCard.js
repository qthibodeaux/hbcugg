import React from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import teamsData from '../../../data/teams.json';

const allTeams = teamsData.teams;
const byShort = Object.fromEntries(allTeams.map((t) => [t.shortName, t]));

// ─── Shared mock data ─────────────────────────────────────────────────────────
export const MOCK_SWAC_WEST = [
  { shortName: 'SU',    name: 'Southern',            record: '8-2', conf: '6-1', trend: 'up',   diff: +112 },
  { shortName: 'GSU', name: 'Grambling State',   record: '7-3', conf: '5-2', trend: 'up',   diff: +56  },
  { shortName: 'PVAMU', name: 'Prairie View',         record: '6-4', conf: '4-3', trend: 'flat', diff: +18  },
  { shortName: 'TSU',   name: 'Texas Southern',       record: '4-6', conf: '3-4', trend: 'down', diff: -15  },
  { shortName: 'UAPB',  name: 'Arkansas-Pine Bluff',  record: '3-7', conf: '2-5', trend: 'down', diff: -77  },
  { shortName: 'Alcorn',name: 'Alcorn State',         record: '2-8', conf: '1-6', trend: 'down', diff: -103 },
];

export const MOCK_SWAC_EAST = [
  { shortName: 'JSU',  name: 'Jackson State',    record: '9-1', conf: '8-0', trend: 'up',   diff: +173 },
  { shortName: 'FAMU', name: 'Florida A&M',      record: '8-2', conf: '7-1', trend: 'up',   diff: +69  },
  { shortName: 'ASU',  name: 'Alabama State',    record: '7-3', conf: '6-2', trend: 'up',   diff: +44  },
  { shortName: 'AAMU', name: 'Alabama A&M',      record: '6-4', conf: '4-4', trend: 'flat', diff: -12  },
  { shortName: 'BCU',  name: 'Bethune-Cookman',  record: '5-5', conf: '3-5', trend: 'down', diff: -48  },
  { shortName: 'MVSU', name: 'Mississippi Valley',record: '1-9', conf: '0-8', trend: 'down', diff: -144 },
];

export const MOCK_MEAC = [
  { shortName: 'NCCU', name: 'N.C. Central',    record: '8-2', conf: '6-0', trend: 'up',   diff: +129 },
  { shortName: 'HU',   name: 'Howard',           record: '7-3', conf: '5-1', trend: 'up',   diff: +88  },
  { shortName: 'NSU',  name: 'Norfolk State',    record: '6-4', conf: '4-2', trend: 'flat', diff: +26  },
  { shortName: 'MSU',  name: 'Morgan State',     record: '5-5', conf: '3-3', trend: 'flat', diff: -13  },
  { shortName: 'DSU',  name: 'Delaware State',   record: '4-6', conf: '2-4', trend: 'down', diff: -59  },
  { shortName: 'SCSU', name: 'S.C. State',       record: '3-7', conf: '1-5', trend: 'down', diff: -121 },
];

const getTeam = (shortName) => byShort[shortName] || null;

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT A — CLEAN LIST
// Tight rows: rank / logo / name / conf record / trend arrow.
// Minimal, readable, functional. Current vibe closest to existing card.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT B — BRAND WASH
// School-color left-to-transparent gradient per row. Leader row emphasized.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — HEAT BAR
// Point differential bar chart per team. Visual, data-forward.
// Leader gets a pulsing dot. Negative diff shown in red.
// ─────────────────────────────────────────────────────────────────────────────
export const StandingsHeatBar = ({ title, rows, accentColor = 'brand.500' }) => {
  const navigate = useNavigate();
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.diff)));

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">

      <Flex px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" justify="space-between">
        <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
          {title}
        </Text>
        <Text fontSize="9px" color="text.muted">PTS DIFF</Text>
      </Flex>

      <VStack gap={0} align="stretch" px={3} py={2}>
        {rows.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          const pct = Math.abs(row.diff) / maxAbs;
          const isPos = row.diff >= 0;

          return (
            <Box key={row.shortName} py={2}
              borderBottom={i < rows.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Flex align="center" gap={2} mb={1}>
                {/* Rank + optional pulse dot for leader */}
                <Flex align="center" gap={1} w="22px" flexShrink={0}>
                  <Text fontSize="10px" fontWeight="black" color={i === 0 ? primary : 'whiteAlpha.300'}>{i + 1}</Text>
                  {i === 0 && (
                    <Box w="4px" h="4px" borderRadius="full" bg={primary}
                      sx={{ animation: 'hbPulse 2s infinite' }} />
                  )}
                </Flex>
                {team && <Image src={team.logo} alt="" boxSize="16px" objectFit="contain" flexShrink={0} />}
                <Text fontSize="10px" fontWeight="black" color="text.primary" textTransform="uppercase"
                  flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                  {row.shortName}
                </Text>
                <Text fontSize="10px" fontWeight="bold" color="text.secondary" flexShrink={0}>{row.record}</Text>
                <Text fontSize="9px" fontWeight="black" color={isPos ? 'green.400' : 'red.400'} w="36px" textAlign="right" flexShrink={0}>
                  {isPos ? '+' : ''}{row.diff}
                </Text>
              </Flex>

              {/* Diff bar */}
              <Flex align="center" gap={1} pl={7}>
                <Box flex={1} h="3px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="full" borderRadius="full" transition="width 0.6s ease"
                    w={`${pct * 100}%`}
                    bg={i === 0 ? primary : isPos ? 'green.700' : 'red.800'}
                  />
                </Box>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      <style>{`
        @keyframes hbPulse {
          0%   { opacity:1; transform:scale(1);   }
          50%  { opacity:0.4; transform:scale(1.8); }
          100% { opacity:1; transform:scale(1);   }
        }
      `}</style>
    </Box>
  );
};
