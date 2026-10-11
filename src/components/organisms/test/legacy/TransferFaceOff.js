import { useState } from 'react';
import { Box, Flex, Text, Grid, Button, Stack } from '@chakra-ui/react';
import { MOCK_TEAMS } from './RosterComparatorLab';

const TEAM_LIST = Object.entries(MOCK_TEAMS).map(([id, t]) => ({ id, label: t.label, primary: t.primary, secondary: t.secondary }));
const TIER_COLORS = { FBS: '#3182ce', FCS: '#2c7a7b', JUCO: '#dd6b20', 'D2/D3/NAIA': '#d69e2e' };
const DonutSVG = ({ segments, size = 60, thickness = 10 }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
      {segments.filter(s => s.pct > 0).map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const offset = -(cum / 100) * circ;
        cum += s.pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={TIER_COLORS[s.tier] || '#888'} strokeWidth={thickness} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset} />;
      })}
    </svg>
  );
};

export function TransferFaceOff() {
  const [a, setA] = useState('swacjsu');
  const [b, setB] = useState('swacfamu');
  const teamA = MOCK_TEAMS[a];
  const teamB = MOCK_TEAMS[b];
  return (
    <Box bg="bg.card" borderRadius="xl" p={6} boxShadow="lg" minH="520px">
      <Flex gap={4} mb={4}>
        {TEAM_LIST.map(t => (
          <Button key={t.id} size="sm" variant={a === t.id ? 'solid' : 'ghost'} colorScheme="red" mr={1} onClick={() => setA(t.id)} style={{ background: a === t.id ? t.primary : undefined, color: a === t.id ? '#fff' : undefined }}>{t.label}</Button>
        ))}
        <Text fontWeight="bold" color="text.muted" mx={2}>vs</Text>
        {TEAM_LIST.map(t => (
          <Button key={t.id} size="sm" variant={b === t.id ? 'solid' : 'ghost'} colorScheme="red" mr={1} onClick={() => setB(t.id)} style={{ background: b === t.id ? t.primary : undefined, color: b === t.id ? '#fff' : undefined }}>{t.label}</Button>
        ))}
      </Flex>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
        {[teamA, teamB].map((team) => (
          <Box key={team.label} bg="bg.secondary" borderRadius="lg" p={5} boxShadow="md" borderLeftWidth={6} borderLeftColor={team.primary}>
            <Text fontSize="xl" fontWeight="black" color={team.primary} mb={2}>{team.label}</Text>
            <Text fontSize="4xl" fontWeight="black" color="brand.500">{team.transfers.transfer_rate}%</Text>
            <Text fontSize="xs" color="text.muted" mb={2}>Transfer Rate</Text>
            <Flex align="center" gap={2} mb={2}>
              <DonutSVG segments={team.transfers.tier_breakdown} size={60} thickness={10} />
              <Box>
                {team.transfers.tier_breakdown.map(seg => (
                  <Flex key={seg.tier} align="center" gap={1} fontSize="xs">
                    <Box w={2} h={2} borderRadius="full" bg={TIER_COLORS[seg.tier]} />
                    <Text color="text.secondary">{seg.tier}</Text>
                    <Text color="text.muted">{seg.pct}%</Text>
                  </Flex>
                ))}
              </Box>
            </Flex>
            <Text fontSize="sm" color="text.muted" fontWeight="bold" mt={4} mb={1}>Transfer Rate by Position</Text>
            <Stack spacing={1}>
              {team.transfers.position_impact.map(pos => (
                <Flex key={pos.group} align="center" gap={2}>
                  <Text w={12} fontSize="xs" color="text.secondary" fontWeight="bold">{pos.group}</Text>
                  <Box flex={1} h={3} borderRadius="md" bg="whiteAlpha.100" position="relative">
                    <Box h="100%" borderRadius="md" bg={team.primary} w={`${pos.transfer_rate}%`} />
                  </Box>
                  <Text fontSize="xs" color="text.muted">{pos.transfer_rate}%</Text>
                </Flex>
              ))}
            </Stack>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
