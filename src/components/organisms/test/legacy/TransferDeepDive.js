import { useState } from 'react';
import { Box, Flex, Text, Button, Stack } from '@chakra-ui/react';
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

export function TransferDeepDive() {
  const [team, setTeam] = useState('swacjsu');
  const t = MOCK_TEAMS[team];
  // Philosophy tag logic
  const fbs = t.transfers.tier_breakdown.find(x => x.tier === 'FBS')?.pct || 0;
  const juco = t.transfers.tier_breakdown.find(x => x.tier === 'JUCO')?.pct || 0;
  let tag = '';
  if (fbs > 50) tag = 'Portal Raiders';
  else if (juco > 40) tag = 'JUCO Pipeline';
  else if (t.transfers.transfer_rate < 20) tag = 'Developer';
  else if (t.transfers.transfer_rate < 35) tag = 'Selective';
  else tag = 'Balanced';
  return (
    <Box bg="bg.card" borderRadius="xl" p={6} boxShadow="lg" minH="520px">
      <Flex gap={2} mb={4}>
        {TEAM_LIST.map(ti => (
          <Button key={ti.id} size="sm" variant={team === ti.id ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setTeam(ti.id)} style={{ background: team === ti.id ? ti.primary : undefined, color: team === ti.id ? '#fff' : undefined }}>{ti.label}</Button>
        ))}
      </Flex>
      <Box bg="bg.secondary" borderRadius="lg" p={5} boxShadow="md" borderLeftWidth={6} borderLeftColor={t.primary}>
        <Text fontSize="xl" fontWeight="black" color={t.primary} mb={2}>{t.label}</Text>
        <Text fontSize="4xl" fontWeight="black" color="brand.500">{t.transfers.transfer_rate}%</Text>
        <Text fontSize="xs" color="text.muted" mb={2}>Transfer Rate</Text>
        <Box as="span" px={3} py={1} borderRadius="md" bg="brand.500" color="white" fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="0.08em" ml={2}>{tag}</Box>
        <Flex align="center" gap={2} mb={2} mt={4}>
          <DonutSVG segments={t.transfers.tier_breakdown} size={60} thickness={10} />
          <Box>
            {t.transfers.tier_breakdown.map(seg => (
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
          {t.transfers.position_impact.map(pos => (
            <Flex key={pos.group} align="center" gap={2}>
              <Text w={12} fontSize="xs" color="text.secondary" fontWeight="bold">{pos.group}</Text>
              <Box flex={1} h={3} borderRadius="md" bg="whiteAlpha.100" position="relative">
                <Box h="100%" borderRadius="md" bg={t.primary} w={`${pos.transfer_rate}%`} />
              </Box>
              <Text fontSize="xs" color="text.muted">{pos.transfer_rate}%</Text>
            </Flex>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
