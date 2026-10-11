import { useState } from 'react';
import { Box, Flex, Text, VStack,  Grid } from '@chakra-ui/react';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — real 2025 values from roster_hub_2025.json
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_TEAMS = {
  swacjsu: {
    label: 'Jackson State', short: 'JSU', division: 'SWAC',
    primary: '#002147', secondary: '#A89968',
    composition: {
      total_players: 111, upperclass_pct: 50.5, underclass_pct: 35.1,
      position_distribution: [
        { group: 'OL', count: 23, pct: 20.7 }, { group: 'WR_TE', count: 18, pct: 16.2 },
        { group: 'DB', count: 18, pct: 16.2 }, { group: 'DL', count: 18, pct: 16.2 },
        { group: 'RB', count: 14, pct: 12.6 }, { group: 'LB', count: 12, pct: 10.8 },
        { group: 'ST', count: 4, pct: 3.6 },   { group: 'QB', count: 4, pct: 3.6 },
      ],
      class_distribution: [
        { class: 'Fr.', pct: 19.8 }, { class: 'So.', pct: 15.3 },
        { class: 'Jr.', pct: 12.6 }, { class: 'Sr.', pct: 14.4 }, { class: 'Gr.', pct: 23.4 },
      ],
    },
    experience: {
      veteran_pct: 37.8, upperclass_pct: 50.5,
      pyramid: [
        { class: 'Fr.', label: 'Freshman',  pct: 19.8, count: 22 },
        { class: 'So.', label: 'Sophomore', pct: 15.3, count: 17 },
        { class: 'Jr.', label: 'Junior',    pct: 12.6, count: 14 },
        { class: 'Sr.', label: 'Senior',    pct: 14.4, count: 16 },
        { class: 'Gr.', label: 'Graduate',  pct: 23.4, count: 26 },
      ],
    },
    physical: {
      overall: { height_avg: 73.2, weight_avg: 225.4 },
      by_position_group: {
        OL: { h: 75.6, w: 305.5 }, DL: { h: 73.6, w: 269.6 },
        DB: { h: 71.4, w: 181.7 }, LB: { h: 73.2, w: 216.8 },
        WR_TE: { h: 73.1, w: 199.4 }, RB: { h: 70.3, w: 200.8 },
        QB: { h: 75.8, w: 209.5 },
      },
      size_vs_conference: {
        OL: { height_z: 0.08, weight_z: 0.13 }, DL: { height_z: -0.54, weight_z: 0.15 },
        DB: { height_z: -0.39, weight_z: -0.17 }, LB: { height_z: 0.29, weight_z: -0.06 },
        WR_TE: { height_z: 0.02, weight_z: 0.09 }, RB: { height_z: 0.13, weight_z: 0.16 },
        QB: { height_z: 0.60, weight_z: 0.45 },
      },
      notables: {
        tallest:  [{ full_name: 'Bruno Zandamela', position: 'OL', height: 80, weight: 315 }],
        heaviest: [{ full_name: 'Xavion Davis',    position: 'OL', height: 76, weight: 365 }],
      },
    },
    transfers: {
      transfer_rate: 44.1,
      tier_breakdown: [
        { tier: 'FBS', count: 26, pct: 53.1 }, { tier: 'JUCO', count: 13, pct: 26.5 },
        { tier: 'FCS', count: 7,  pct: 14.3 }, { tier: 'D2/D3/NAIA', count: 3, pct: 6.1 },
      ],
      position_impact: [
        { group: 'ST', transfer_rate: 75.0 }, { group: 'DB', transfer_rate: 61.1 },
        { group: 'DL', transfer_rate: 50.0 }, { group: 'WR_TE', transfer_rate: 44.4 },
        { group: 'RB', transfer_rate: 37.5 }, { group: 'OL', transfer_rate: 30.4 },
      ],
    },
    geographic: {
      in_state_pct: 17.9, avg_recruiting_distance_miles: 505,
      state_distribution: [
        { state: 'TX', count: 10 }, { state: 'MS', count: 5 },
        { state: 'OH', count: 4 },  { state: 'GA', count: 3 }, { state: 'FL', count: 2 },
      ],
    },
  },
  swacfamu: {
    label: 'Florida A&M', short: 'FAMU', division: 'SWAC',
    primary: '#006A4E', secondary: '#F4A100',
    composition: {
      total_players: 133, upperclass_pct: 45.1, underclass_pct: 36.1,
      position_distribution: [
        { group: 'WR_TE', count: 28, pct: 21.1 }, { group: 'DL', count: 25, pct: 18.8 },
        { group: 'DB', count: 25, pct: 18.8 },    { group: 'OL', count: 21, pct: 15.8 },
        { group: 'LB', count: 14, pct: 10.5 },    { group: 'RB', count: 7,  pct: 5.3 },
        { group: 'ST', count: 6,  pct: 4.5 },     { group: 'QB', count: 6,  pct: 4.5 },
      ],
      class_distribution: [
        { class: 'Fr.', pct: 21.8 }, { class: 'So.', pct: 14.3 },
        { class: 'Jr.', pct: 15.8 }, { class: 'Sr.', pct: 15.0 }, { class: 'Gr.', pct: 14.3 },
      ],
    },
    experience: {
      veteran_pct: 29.3, upperclass_pct: 45.1,
      pyramid: [
        { class: 'Fr.', label: 'Freshman',  pct: 21.8, count: 29 },
        { class: 'So.', label: 'Sophomore', pct: 14.3, count: 19 },
        { class: 'Jr.', label: 'Junior',    pct: 15.8, count: 21 },
        { class: 'Sr.', label: 'Senior',    pct: 15.0, count: 20 },
        { class: 'Gr.', label: 'Graduate',  pct: 14.3, count: 19 },
      ],
    },
    physical: {
      overall: { height_avg: 73.5, weight_avg: 220.1 },
      by_position_group: {
        OL: { h: 75.6, w: 292.0 }, DL: { h: 75.0, w: 258.4 },
        DB: { h: 72.5, w: 189.6 }, LB: { h: 72.9, w: 216.6 },
        WR_TE: { h: 72.9, w: 195.3 }, RB: { h: 70.5, w: 201.6 },
        QB: { h: 73.5, w: 200.2 },
      },
      size_vs_conference: {
        OL: { height_z: 0.08, weight_z: -0.23 }, DL: { height_z: 0.39, weight_z: -0.20 },
        DB: { height_z: 0.28, weight_z: 0.46 },  LB: { height_z: 0.07, weight_z: -0.08 },
        WR_TE: { height_z: -0.05, weight_z: -0.05 }, RB: { height_z: 0.24, weight_z: 0.20 },
        QB: { height_z: -0.44, weight_z: -0.17 },
      },
      notables: {
        tallest:  [{ full_name: 'Christian Wingfield', position: 'OL', height: 79, weight: 335 }],
        heaviest: [{ full_name: 'Tyler Duncan',         position: 'OL', height: 74, weight: 350 }],
      },
    },
    transfers: {
      transfer_rate: 51.9,
      tier_breakdown: [
        { tier: 'FBS', count: 50, pct: 72.5 }, { tier: 'FCS', count: 11, pct: 15.9 },
        { tier: 'D2/D3/NAIA', count: 4, pct: 5.8 }, { tier: 'JUCO', count: 4, pct: 5.8 },
      ],
      position_impact: [
        { group: 'ST', transfer_rate: 66.7 }, { group: 'DB', transfer_rate: 64.0 },
        { group: 'DL', transfer_rate: 64.0 }, { group: 'QB', transfer_rate: 50.0 },
        { group: 'LB', transfer_rate: 42.9 }, { group: 'OL', transfer_rate: 38.1 },
      ],
    },
    geographic: {
      in_state_pct: 84.6, avg_recruiting_distance_miles: 188,
      state_distribution: [
        { state: 'FL', count: 22 }, { state: 'GA', count: 2 },
        { state: 'AL', count: 1 },  { state: 'OH', count: 1 }, { state: 'TX', count: 1 },
      ],
    },
  },
  swacsu: {
    label: 'Southern University', short: 'SU', division: 'SWAC',
    primary: '#002D72', secondary: '#F2A900',
    composition: {
      total_players: 108, upperclass_pct: 31.5, underclass_pct: 56.5,
      position_distribution: [
        { group: 'DB', count: 23, pct: 21.3 },    { group: 'WR_TE', count: 20, pct: 18.5 },
        { group: 'OL', count: 18, pct: 16.7 },    { group: 'DL', count: 18, pct: 16.7 },
        { group: 'LB', count: 15, pct: 13.9 },    { group: 'RB', count: 8,  pct: 7.4 },
        { group: 'QB', count: 4,  pct: 3.7 },     { group: 'ST', count: 2,  pct: 1.9 },
      ],
      class_distribution: [
        { class: 'Fr.', pct: 32.4 }, { class: 'So.', pct: 24.1 },
        { class: 'Jr.', pct: 13.9 }, { class: 'Sr.', pct: 11.1 }, { class: 'Gr.', pct: 6.5 },
      ],
    },
    experience: {
      veteran_pct: 17.6, upperclass_pct: 31.5,
      pyramid: [
        { class: 'Fr.', label: 'Freshman',  pct: 32.4, count: 35 },
        { class: 'So.', label: 'Sophomore', pct: 24.1, count: 26 },
        { class: 'Jr.', label: 'Junior',    pct: 13.9, count: 15 },
        { class: 'Sr.', label: 'Senior',    pct: 11.1, count: 12 },
        { class: 'Gr.', label: 'Graduate',  pct: 6.5,  count: 7  },
      ],
    },
    physical: {
      overall: { height_avg: 72.9, weight_avg: 215.3 },
      by_position_group: {
        OL: { h: 75.3, w: 300.5 }, DL: { h: 74.4, w: 266.2 },
        DB: { h: 72.3, w: 188.6 }, LB: { h: 72.4, w: 219.7 },
        WR_TE: { h: 72.9, w: 196.5 }, RB: { h: 69.9, w: 200.9 },
        QB: { h: 73.5, w: 201.2 },
      },
      size_vs_conference: {
        OL: { height_z: -0.05, weight_z: 0.00 }, DL: { height_z: -0.01, weight_z: 0.04 },
        DB: { height_z: 0.16, weight_z: 0.38 },  LB: { height_z: -0.29, weight_z: 0.14 },
        WR_TE: { height_z: -0.05, weight_z: -0.01 }, RB: { height_z: -0.10, weight_z: 0.16 },
        QB: { height_z: -0.44, weight_z: -0.10 },
      },
      notables: {
        tallest:  [{ full_name: 'Antonio Sanders', position: 'OL', height: 77, weight: 300 }],
        heaviest: [{ full_name: 'Jayden Rogers',   position: 'DL', height: 74, weight: 375 }],
      },
    },
    transfers: {
      transfer_rate: 36.1,
      tier_breakdown: [
        { tier: 'JUCO', count: 13, pct: 33.3 }, { tier: 'FBS', count: 12, pct: 30.8 },
        { tier: 'FCS', count: 10, pct: 25.6 },  { tier: 'D2/D3/NAIA', count: 4, pct: 10.3 },
      ],
      position_impact: [
        { group: 'RB', transfer_rate: 62.5 }, { group: 'QB', transfer_rate: 50.0 },
        { group: 'ST', transfer_rate: 50.0 }, { group: 'OL', transfer_rate: 44.4 },
        { group: 'DB', transfer_rate: 26.1 }, { group: 'DL', transfer_rate: 22.2 },
      ],
    },
    geographic: {
      in_state_pct: 59.2, avg_recruiting_distance_miles: 298,
      state_distribution: [
        { state: 'LA', count: 61 }, { state: 'TX', count: 11 },
        { state: 'GA', count: 6 },  { state: 'FL', count: 4 }, { state: 'MS', count: 4 },
      ],
    },
  },
  meacnccu: {
    label: 'N.C. Central', short: 'NCCU', division: 'MEAC',
    primary: '#8B0000', secondary: '#888B8D',
    composition: {
      total_players: 118, upperclass_pct: 31.4, underclass_pct: 57.6,
      position_distribution: [
        { group: 'DB', count: 24, pct: 20.3 },    { group: 'DL', count: 23, pct: 19.5 },
        { group: 'OL', count: 21, pct: 17.8 },    { group: 'WR_TE', count: 21, pct: 17.8 },
        { group: 'LB', count: 10, pct: 8.5 },     { group: 'RB', count: 9,  pct: 7.6 },
        { group: 'QB', count: 6,  pct: 5.1 },     { group: 'ST', count: 4,  pct: 3.4 },
      ],
      class_distribution: [
        { class: 'Fr.', pct: 32.2 }, { class: 'So.', pct: 25.4 },
        { class: 'Jr.', pct: 14.4 }, { class: 'Sr.', pct: 16.1 }, { class: 'Gr.', pct: 0.8 },
      ],
    },
    experience: {
      veteran_pct: 16.9, upperclass_pct: 31.4,
      pyramid: [
        { class: 'Fr.', label: 'Freshman',  pct: 32.2, count: 38 },
        { class: 'So.', label: 'Sophomore', pct: 25.4, count: 30 },
        { class: 'Jr.', label: 'Junior',    pct: 14.4, count: 17 },
        { class: 'Sr.', label: 'Senior',    pct: 16.1, count: 19 },
        { class: 'Gr.', label: 'Graduate',  pct: 0.8,  count: 1  },
      ],
    },
    physical: {
      overall: { height_avg: 73.0, weight_avg: 226.1 },
      by_position_group: {
        OL: { h: 74.8, w: 295.0 }, DL: { h: 74.1, w: 252.0 },
        DB: { h: 71.8, w: 185.0 }, LB: { h: 73.0, w: 218.0 },
        WR_TE: { h: 73.2, w: 193.0 }, RB: { h: 70.1, w: 198.0 },
        QB: { h: 74.0, w: 207.0 },
      },
      size_vs_conference: {
        OL: { height_z: -0.22, weight_z: -0.12 }, DL: { height_z: -0.12, weight_z: -0.18 },
        DB: { height_z: -0.10, weight_z: -0.04 }, LB: { height_z: 0.11, weight_z: 0.08 },
        WR_TE: { height_z: 0.04, weight_z: -0.12 }, RB: { height_z: 0.02, weight_z: 0.06 },
        QB: { height_z: 0.22, weight_z: 0.12 },
      },
      notables: {
        tallest:  [{ full_name: 'Taron Williams',  position: 'OL', height: 79, weight: 330 }],
        heaviest: [{ full_name: 'Khareem Thompson', position: 'DL', height: 78, weight: 240 }],
      },
    },
    transfers: {
      transfer_rate: 16.1,
      tier_breakdown: [
        { tier: 'FBS', count: 10, pct: 52.6 }, { tier: 'D2/D3/NAIA', count: 5, pct: 26.3 },
        { tier: 'JUCO', count: 3, pct: 15.8 }, { tier: 'FCS', count: 1, pct: 5.3 },
      ],
      position_impact: [
        { group: 'DB', transfer_rate: 29.2 }, { group: 'DL', transfer_rate: 26.1 },
        { group: 'OL', transfer_rate: 19.0 }, { group: 'LB', transfer_rate: 10.0 },
        { group: 'WR_TE', transfer_rate: 9.5 }, { group: 'RB', transfer_rate: 0.0 },
      ],
    },
    geographic: {
      in_state_pct: 21.1, avg_recruiting_distance_miles: 380,
      state_distribution: [
        { state: 'NC', count: 4 }, { state: 'GA', count: 3 },
        { state: 'TX', count: 3 }, { state: 'VA', count: 2 }, { state: 'OH', count: 2 },
      ],
    },
  },
};

const TEAM_LIST = Object.entries(MOCK_TEAMS).map(([id, t]) => ({ id, label: t.label, short: t.short, division: t.division }));

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmtH = (h) => h ? `${Math.floor(h / 12)}'${h % 12}"` : '—';
const CLASS_COLORS = { 'Fr.': '#c53030', 'So.': '#dd6b20', 'Jr.': '#d69e2e', 'Sr.': '#2c7a7b', 'Gr.': '#276749' };
const TIER_COLORS  = { FBS: '#3182ce', FCS: '#2c7a7b', JUCO: '#dd6b20', 'D2/D3/NAIA': '#d69e2e' };
const POS_ORDER    = ['OL', 'DL', 'WR_TE', 'DB', 'LB', 'RB', 'QB', 'ST'];
const TABS         = ['Composition', 'Experience', 'Physical', 'Transfers', 'Geographic'];

// ─── shared inner components ──────────────────────────────────────────────────
const DonutSVG = ({ segments, size = 72, thickness = 12 }) => {
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
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={TIER_COLORS[s.tier] || '#888'} strokeWidth={thickness}
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={offset} />;
      })}
    </svg>
  );
};

const ZBar = ({ z, color }) => {
  const maxZ = 1.5;
  const pct = Math.min(Math.abs(z || 0) / maxZ * 50, 50);
  const isPos = (z || 0) >= 0;
  return (
    <Flex w="full" h="10px" align="center" position="relative">
      <Box position="absolute" left="50%" w="1px" h="full" bg="whiteAlpha.200" transform="translateX(-50%)" />
      <Box
        position="absolute" h="8px" borderRadius="sm"
        bg={isPos ? color : 'rgba(255,255,255,0.2)'}
        left={isPos ? '50%' : `${50 - pct}%`}
        w={`${pct}%`}
        style={{ transition: 'all 0.4s ease' }}
      />
    </Flex>
  );
};

// ─── tab content renderers ────────────────────────────────────────────────────
const CompositionContent = ({ a, b, aColor, bColor }) => {
  const maxPct = 25;
  return (
    <Flex gap={6} h="full" direction="column" overflow="auto" px={4} py={3}>
      {/* KPI row */}
      <Flex gap={4}>
        {[
          { label: 'Total Players', aVal: a.composition.total_players, bVal: b.composition.total_players, fmt: v => v },
          { label: 'Upperclass %', aVal: a.composition.upperclass_pct, bVal: b.composition.upperclass_pct, fmt: v => `${v}%` },
          { label: 'Underclass %', aVal: a.composition.underclass_pct, bVal: b.composition.underclass_pct, fmt: v => `${v}%` },
        ].map(kpi => (
          <Flex key={kpi.label} flex={1} direction="column" align="center" bg="whiteAlpha.50" borderRadius="md" py={3}>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={1}>{kpi.label}</Text>
            <Flex gap={4} align="baseline">
              <Text fontSize="lg" fontWeight="black" color={aColor}>{kpi.fmt(kpi.aVal)}</Text>
              <Text fontSize="xs" color="text.muted">vs</Text>
              <Text fontSize="lg" fontWeight="black" color={bColor}>{kpi.fmt(kpi.bVal)}</Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      {/* Position distribution */}
      <Box>
        <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Position Groups</Text>
        <Grid templateColumns="1fr 1fr" gap={3}>
          {POS_ORDER.map(pos => {
            const aP = a.composition.position_distribution.find(p => p.group === pos);
            const bP = b.composition.position_distribution.find(p => p.group === pos);
            const aPct = aP ? aP.pct : 0;
            const bPct = bP ? bP.pct : 0;
            return (
              <Box key={pos}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="9px" fontWeight="black" color="text.secondary">{pos}</Text>
                  <Text fontSize="9px" color="text.muted">{aPct.toFixed(1)}% / {bPct.toFixed(1)}%</Text>
                </Flex>
                <Flex direction="column" gap={1}>
                  <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                    <Box h="full" borderRadius="full" bg={aColor} w={`${(aPct / maxPct) * 100}%`} style={{ transition: 'width 0.5s ease' }} />
                  </Box>
                  <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                    <Box h="full" borderRadius="full" bg={bColor} w={`${(bPct / maxPct) * 100}%`} style={{ transition: 'width 0.5s ease' }} />
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Grid>
      </Box>

      {/* Class distribution stacked bars */}
      <Box>
        <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Class Distribution</Text>
        {[a, b].map((team, ti) => (
          <Box key={ti} mb={2}>
            <Text fontSize="9px" color="text.muted" mb={1}>{ti === 0 ? a.label : b.label}</Text>
            <Flex h="18px" borderRadius="md" overflow="hidden" gap="1px">
              {team.composition.class_distribution.map(cd => (
                <Box key={cd.class} h="full" bg={CLASS_COLORS[cd.class] || '#444'} w={`${cd.pct}%`}
                  title={`${cd.class}: ${cd.pct}%`}
                  style={{ transition: 'width 0.5s ease', flexShrink: 0 }}
                />
              ))}
            </Flex>
          </Box>
        ))}
        <Flex gap={3} mt={2} flexWrap="wrap">
          {Object.entries(CLASS_COLORS).map(([cls, clr]) => (
            <Flex key={cls} align="center" gap={1}>
              <Box w="8px" h="8px" bg={clr} borderRadius="sm" />
              <Text fontSize="8px" color="text.muted">{cls}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

const ExperienceContent = ({ a, b, aColor, bColor }) => {
  const vetColor = (pct) => pct >= 40 ? '#276749' : pct >= 25 ? '#d69e2e' : '#c53030';
  return (
    <Flex gap={6} h="full" direction="column" overflow="auto" px={4} py={3}>
      {/* Veteran KPIs */}
      <Flex gap={4}>
        {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
          <Flex key={team.short} flex={1} direction="column" align="center" bg="whiteAlpha.50" borderRadius="md" py={3} gap={1}>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Veteran % (Sr+Gr)</Text>
            <Text fontSize="3xl" fontWeight="black" color={vetColor(team.experience.veteran_pct)} lineHeight={1}>
              {team.experience.veteran_pct}%
            </Text>
            <Text fontSize="9px" color={color} fontWeight="bold">{team.label}</Text>
          </Flex>
        ))}
      </Flex>

      {/* Pyramid comparison */}
      <Box>
        <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={3}>Class Pyramid</Text>
        {a.experience.pyramid.map((row, i) => {
          const bRow = b.experience.pyramid[i];
          return (
            <Flex key={row.class} align="center" gap={2} mb={2}>
              {/* A bar — grows left from center */}
              <Flex flex={1} justify="flex-end">
                <Box h="20px" borderRadius="sm" bg={aColor} opacity={0.85}
                  w={`${row.pct * 2.5}%`} display="flex" alignItems="center" justifyContent="flex-end" pr={1}>
                  <Text fontSize="8px" fontWeight="black" color="white">{row.pct}%</Text>
                </Box>
              </Flex>
              {/* Label */}
              <Text fontSize="9px" fontWeight="black" color="text.secondary" w="28px" textAlign="center">{row.class}</Text>
              {/* B bar — grows right */}
              <Flex flex={1}>
                <Box h="20px" borderRadius="sm" bg={bColor} opacity={0.85}
                  w={`${(bRow?.pct || 0) * 2.5}%`} display="flex" alignItems="center" pl={1}>
                  <Text fontSize="8px" fontWeight="black" color="white">{bRow?.pct}%</Text>
                </Box>
              </Flex>
            </Flex>
          );
        })}
        <Flex justify="space-between" mt={1}>
          <Text fontSize="9px" color={aColor} fontWeight="bold">{a.short}</Text>
          <Text fontSize="9px" color={bColor} fontWeight="bold">{b.short}</Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const PhysicalContent = ({ a, b, aColor, bColor }) => (
  <Flex gap={6} h="full" direction="column" overflow="auto" px={4} py={3}>
    {/* Notables */}
    <Flex gap={3}>
      {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
        <Flex key={team.short} flex={1} direction="column" gap={2}>
          <Text fontSize="9px" fontWeight="black" color={color} textTransform="uppercase">{team.short} Notables</Text>
          {[
            { label: 'Tallest', player: team.physical.notables.tallest[0], val: fmtH(team.physical.notables.tallest[0]?.height) },
            { label: 'Heaviest', player: team.physical.notables.heaviest[0], val: `${team.physical.notables.heaviest[0]?.weight} lbs` },
          ].map(n => (
            <Box key={n.label} bg="whiteAlpha.50" borderRadius="md" p={2}>
              <Text fontSize="8px" color="text.muted" textTransform="uppercase">{n.label}</Text>
              <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>{n.player?.full_name}</Text>
              <Text fontSize="xs" color={color} fontWeight="bold">{n.val} · {n.player?.position}</Text>
            </Box>
          ))}
        </Flex>
      ))}
    </Flex>

    {/* Height/weight per position */}
    <Box>
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Avg Weight by Position (lbs)</Text>
      {POS_ORDER.filter(pos => a.physical.by_position_group[pos] && b.physical.by_position_group[pos]).map(pos => {
        const aW = a.physical.by_position_group[pos]?.w || 0;
        const bW = b.physical.by_position_group[pos]?.w || 0;
        const max = 340;
        return (
          <Box key={pos} mb={2}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="9px" fontWeight="black" color="text.secondary">{pos}</Text>
              <Text fontSize="9px" color="text.muted">{Math.round(aW)} / {Math.round(bW)}</Text>
            </Flex>
            <Flex direction="column" gap={1}>
              <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                <Box h="full" borderRadius="full" bg={aColor} w={`${(aW / max) * 100}%`} />
              </Box>
              <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                <Box h="full" borderRadius="full" bg={bColor} w={`${(bW / max) * 100}%`} />
              </Box>
            </Flex>
          </Box>
        );
      })}
    </Box>

    {/* Z-score comparison */}
    <Box>
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Size vs Conference Avg (weight z-score)</Text>
      {POS_ORDER.filter(pos => a.physical.size_vs_conference[pos]).map(pos => {
        const aZ = a.physical.size_vs_conference[pos]?.weight_z || 0;
        const bZ = b.physical.size_vs_conference[pos]?.weight_z || 0;
        return (
          <Box key={pos} mb={2}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="9px" color="text.secondary">{pos}</Text>
              <Text fontSize="8px" color="text.muted">{aZ > 0 ? '+' : ''}{aZ.toFixed(2)} / {bZ > 0 ? '+' : ''}{bZ.toFixed(2)}</Text>
            </Flex>
            <Flex direction="column" gap={1}>
              <ZBar z={aZ} color={aColor} />
              <ZBar z={bZ} color={bColor} />
            </Flex>
          </Box>
        );
      })}
    </Box>
  </Flex>
);

const TransferContent = ({ a, b, aColor, bColor }) => (
  <Flex gap={6} h="full" direction="column" overflow="auto" px={4} py={3}>
    {/* Transfer rate hero */}
    <Flex gap={4}>
      {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
        <Flex key={team.short} flex={1} direction="column" align="center" bg="whiteAlpha.50" borderRadius="md" py={3}>
          <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={1}>Transfer Rate</Text>
          <Text fontSize="3xl" fontWeight="black" color={color} lineHeight={1}>{team.transfers.transfer_rate}%</Text>
          <Text fontSize="9px" color="text.muted" mt={1}>of roster</Text>
        </Flex>
      ))}
    </Flex>

    {/* Tier donuts */}
    <Flex gap={4}>
      {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
        <Flex key={team.short} flex={1} direction="column" align="center" gap={2}>
          <Text fontSize="9px" fontWeight="black" color={color} textTransform="uppercase">{team.short} Portal Tier Mix</Text>
          <Flex align="center" gap={3}>
            <DonutSVG segments={team.transfers.tier_breakdown} />
            <VStack gap={1} align="flex-start">
              {team.transfers.tier_breakdown.map(t => (
                <Flex key={t.tier} align="center" gap={1}>
                  <Box w="6px" h="6px" borderRadius="sm" bg={TIER_COLORS[t.tier] || '#888'} />
                  <Text fontSize="8px" color="text.muted">{t.tier} {t.pct.toFixed(0)}%</Text>
                </Flex>
              ))}
            </VStack>
          </Flex>
        </Flex>
      ))}
    </Flex>

    {/* Position impact */}
    <Box>
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Transfer Rate by Position</Text>
      {a.transfers.position_impact.map(row => {
        const bRow = b.transfers.position_impact.find(r => r.group === row.group);
        return (
          <Box key={row.group} mb={2}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="9px" fontWeight="black" color="text.secondary">{row.group}</Text>
              <Text fontSize="9px" color="text.muted">{row.transfer_rate}% / {bRow?.transfer_rate || 0}%</Text>
            </Flex>
            <Flex direction="column" gap={1}>
              <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                <Box h="full" borderRadius="full" bg={aColor} w={`${row.transfer_rate}%`} />
              </Box>
              <Box h="5px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                <Box h="full" borderRadius="full" bg={bColor} w={`${bRow?.transfer_rate || 0}%`} />
              </Box>
            </Flex>
          </Box>
        );
      })}
    </Box>
  </Flex>
);

const GeoContent = ({ a, b, aColor, bColor }) => {
  const distDelta = a.geographic.avg_recruiting_distance_miles && b.geographic.avg_recruiting_distance_miles
    ? Math.abs(a.geographic.avg_recruiting_distance_miles - b.geographic.avg_recruiting_distance_miles)
    : null;
  const farther = a.geographic.avg_recruiting_distance_miles > (b.geographic.avg_recruiting_distance_miles || 0) ? a.short : b.short;
  return (
    <Flex gap={6} h="full" direction="column" overflow="auto" px={4} py={3}>
      {/* Distance KPIs */}
      <Flex gap={4}>
        {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
          <Flex key={team.short} flex={1} direction="column" bg="whiteAlpha.50" borderRadius="md" p={3} gap={2}>
            <Text fontSize="9px" fontWeight="black" color={color} textTransform="uppercase">{team.short}</Text>
            <Flex gap={3}>
              <Box>
                <Text fontSize="8px" color="text.muted">In-State</Text>
                <Text fontSize="lg" fontWeight="black" color={color}>{team.geographic.in_state_pct}%</Text>
              </Box>
              <Box>
                <Text fontSize="8px" color="text.muted">Avg Distance</Text>
                <Text fontSize="lg" fontWeight="black" color="white">
                  {team.geographic.avg_recruiting_distance_miles ? `${team.geographic.avg_recruiting_distance_miles} mi` : '—'}
                </Text>
              </Box>
            </Flex>
          </Flex>
        ))}
      </Flex>
      {distDelta && (
        <Box bg="whiteAlpha.50" borderRadius="md" p={3} textAlign="center">
          <Text fontSize="xs" color="text.muted">{farther} pulls from <Text as="span" color="white" fontWeight="black">{distDelta} miles further</Text> on average</Text>
        </Box>
      )}

      {/* Top states */}
      <Flex gap={4}>
        {[{ team: a, color: aColor }, { team: b, color: bColor }].map(({ team, color }) => (
          <Box key={team.short} flex={1}>
            <Text fontSize="9px" fontWeight="black" color={color} textTransform="uppercase" mb={2}>{team.short} Top States</Text>
            {team.geographic.state_distribution.slice(0, 5).map((s, i) => {
              const maxCount = team.geographic.state_distribution[0].count;
              return (
                <Flex key={s.state} align="center" gap={2} mb={2}>
                  <Text fontSize="9px" color="text.muted" w="20px">#{i + 1}</Text>
                  <Text fontSize="xs" fontWeight="black" color="white" w="24px">{s.state}</Text>
                  <Box flex={1} h="8px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                    <Box h="full" borderRadius="full" bg={color} w={`${(s.count / maxCount) * 100}%`} />
                  </Box>
                  <Text fontSize="9px" color="text.muted" w="16px">{s.count}</Text>
                </Flex>
              );
            })}
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

const TAB_CONTENT = [CompositionContent, ExperienceContent, PhysicalContent, TransferContent, GeoContent];

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT A — DUAL PANEL [2026-04-12]
// Classic side-by-side. Each panel has its own team selector. Tab bar spans
// full width. Tab content fills the space below, split into two columns.
// ─────────────────────────────────────────────────────────────────────────────
export const RosterComparatorAltA = () => {
  const [aId, setAId] = useState('swacjsu');
  const [bId, setBId] = useState('swacfamu');
  const [tab, setTab] = useState(0);
  const a = MOCK_TEAMS[aId];
  const b = MOCK_TEAMS[bId];
  const Content = TAB_CONTENT[tab];

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="lg" overflow="hidden" display="flex" flexDirection="column">

      {/* Header — team selectors */}
      <Flex borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
        {[{ id: aId, set: setAId, color: a.primary, sec: a.secondary, team: a, side: 'A' },
          { id: bId, set: setBId, color: b.primary, sec: b.secondary, team: b, side: 'B' }].map(({ id, set, color, sec, team, side }) => (
          <Flex key={side} flex={1} direction="column" p={3}
            borderRight={side === 'A' ? '1px solid' : 'none'} borderColor="whiteAlpha.100"
            bg={`linear-gradient(135deg, ${color}33 0%, transparent 60%)`}>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Panel {side}</Text>
            <Flex gap={2} flexWrap="wrap">
              {TEAM_LIST.map(t => (
                <Box key={t.id} as="button" px={2} py={1} borderRadius="full"
                  bg={id === t.id ? sec : 'whiteAlpha.100'}
                  border="1px solid" borderColor={id === t.id ? sec : 'whiteAlpha.200'}
                  onClick={() => set(t.id)} cursor="pointer"
                  style={{ transition: 'all 0.15s ease' }}>
                  <Text fontSize="9px" fontWeight="black"
                    color={id === t.id ? color : 'text.secondary'}>{t.short}</Text>
                </Box>
              ))}
            </Flex>
            <Text fontSize="sm" fontWeight="black" color="white" mt={2}>{team.label}</Text>
            <Text fontSize="9px" color="text.muted">{team.composition.total_players} players · {team.division}</Text>
          </Flex>
        ))}
      </Flex>

      {/* Tab bar */}
      <Flex borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0} px={3} gap={1} py={2}>
        {TABS.map((t, i) => (
          <Box key={t} as="button" px={3} py={1} borderRadius="full" cursor="pointer"
            bg={tab === i ? 'brand.500' : 'whiteAlpha.100'}
            onClick={() => setTab(i)} style={{ transition: 'background 0.15s' }}>
            <Text fontSize="9px" fontWeight="black" color={tab === i ? 'white' : 'text.muted'}>{t}</Text>
          </Box>
        ))}
      </Flex>

      {/* Content */}
      <Box flex={1} overflow="hidden">
        <Content a={a} b={b} aColor={a.secondary} bColor={b.secondary} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT B — FACE-OFF [2026-04-12]
// More dramatic. Team colors dominate each half. Metric rows show a "tug of
// war" bar where the winner side glows. Team selector as logo chips at top.
// ─────────────────────────────────────────────────────────────────────────────
export const RosterComparatorAltB = () => {
  const [aId, setAId] = useState('swacjsu');
  const [bId, setBId] = useState('swacsu');
  const [tab, setTab] = useState(0);
  const a = MOCK_TEAMS[aId];
  const b = MOCK_TEAMS[bId];
  const Content = TAB_CONTENT[tab];

  return (
    <Box w="full" h="full" overflow="hidden" display="flex" flexDirection="column"
      bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">

      {/* Split header */}
      <Flex h="80px" flexShrink={0} position="relative">
        {/* A side */}
        <Flex flex={1} bg={`linear-gradient(90deg, ${a.primary} 0%, ${a.primary}99 100%)`}
          align="center" px={4} gap={3}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="black" color={a.secondary} letterSpacing="-0.02em">{a.short}</Text>
            <Text fontSize="8px" color="rgba(255,255,255,0.6)">{a.division}</Text>
          </Flex>
          <Flex gap={1} flexWrap="wrap" flex={1} justify="flex-end">
            {TEAM_LIST.map(t => (
              <Box key={t.id} as="button" px="6px" py="2px" borderRadius="full" cursor="pointer"
                bg={aId === t.id ? a.secondary : 'rgba(255,255,255,0.1)'}
                onClick={() => setAId(t.id)}>
                <Text fontSize="8px" fontWeight="black" color={aId === t.id ? a.primary : 'rgba(255,255,255,0.7)'}>{t.short}</Text>
              </Box>
            ))}
          </Flex>
        </Flex>

        {/* VS badge */}
        <Flex position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)"
          w="36px" h="36px" borderRadius="full" bg="bg.primary" border="2px solid"
          borderColor="whiteAlpha.300" align="center" justify="center" zIndex={2}>
          <Text fontSize="9px" fontWeight="black" color="text.muted">VS</Text>
        </Flex>

        {/* B side */}
        <Flex flex={1} bg={`linear-gradient(270deg, ${b.primary} 0%, ${b.primary}99 100%)`}
          align="center" px={4} gap={3} justify="flex-end">
          <Flex gap={1} flexWrap="wrap" flex={1}>
            {TEAM_LIST.map(t => (
              <Box key={t.id} as="button" px="6px" py="2px" borderRadius="full" cursor="pointer"
                bg={bId === t.id ? b.secondary : 'rgba(255,255,255,0.1)'}
                onClick={() => setBId(t.id)}>
                <Text fontSize="8px" fontWeight="black" color={bId === t.id ? b.primary : 'rgba(255,255,255,0.7)'}>{t.short}</Text>
              </Box>
            ))}
          </Flex>
          <Flex direction="column" align="flex-end">
            <Text fontSize="xl" fontWeight="black" color={b.secondary} letterSpacing="-0.02em">{b.short}</Text>
            <Text fontSize="8px" color="rgba(255,255,255,0.6)">{b.division}</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Tab bar */}
      <Flex borderBottom="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100"
        flexShrink={0} px={3} gap={1} py={2} bg="bg.primary">
        {TABS.map((t, i) => (
          <Box key={t} as="button" px={3} py={1} borderRadius="full" cursor="pointer"
            bg={tab === i ? 'whiteAlpha.200' : 'transparent'}
            border="1px solid" borderColor={tab === i ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => setTab(i)}>
            <Text fontSize="9px" fontWeight="black" color={tab === i ? 'white' : 'text.muted'}>{t}</Text>
          </Box>
        ))}
      </Flex>

      {/* Content */}
      <Box flex={1} overflow="hidden" bg="bg.primary">
        <Content a={a} b={b} aColor={a.secondary} bColor={b.secondary} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — ANALYST BOARD [2026-04-12]
// Both teams in one unified chart space. Left rail = team selectors + tab nav
// as a vertical list. Right = dense side-by-side metric rows. Maximum data
// density, no wasted space, fastest to scan across all 5 categories.
// ─────────────────────────────────────────────────────────────────────────────
export const RosterComparatorAltC = () => {
  const [aId, setAId] = useState('swacjsu');
  const [bId, setBId] = useState('meacnccu');
  const [tab, setTab] = useState(0);
  const a = MOCK_TEAMS[aId];
  const b = MOCK_TEAMS[bId];
  const Content = TAB_CONTENT[tab];

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="lg" overflow="hidden" display="flex">

      {/* Left rail */}
      <Flex direction="column" w="160px" flexShrink={0} borderRight="1px solid" borderColor="whiteAlpha.100"
        bg="bg.primary" overflow="hidden">

        {/* Team A */}
        <Box px={3} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100"
          bg={`linear-gradient(180deg, ${a.primary}44 0%, transparent 100%)`}>
          <Text fontSize="8px" color={a.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" mb={2}>Team A</Text>
          <VStack gap={1} align="stretch">
            {TEAM_LIST.map(t => (
              <Box key={t.id} as="button" px={2} py={1} borderRadius="md" cursor="pointer" textAlign="left"
                bg={aId === t.id ? `${a.primary}66` : 'transparent'}
                borderLeft={aId === t.id ? `2px solid ${a.secondary}` : '2px solid transparent'}
                onClick={() => setAId(t.id)}>
                <Text fontSize="9px" fontWeight={aId === t.id ? 'black' : 'normal'} color={aId === t.id ? 'white' : 'text.muted'}>{t.label}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Team B */}
        <Box px={3} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100"
          bg={`linear-gradient(180deg, ${b.primary}44 0%, transparent 100%)`}>
          <Text fontSize="8px" color={b.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" mb={2}>Team B</Text>
          <VStack gap={1} align="stretch">
            {TEAM_LIST.map(t => (
              <Box key={t.id} as="button" px={2} py={1} borderRadius="md" cursor="pointer" textAlign="left"
                bg={bId === t.id ? `${b.primary}66` : 'transparent'}
                borderLeft={bId === t.id ? `2px solid ${b.secondary}` : '2px solid transparent'}
                onClick={() => setBId(t.id)}>
                <Text fontSize="9px" fontWeight={bId === t.id ? 'black' : 'normal'} color={bId === t.id ? 'white' : 'text.muted'}>{t.label}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Tab nav — vertical */}
        <Box px={3} py={3} flex={1}>
          <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={2}>View</Text>
          <VStack gap={1} align="stretch">
            {TABS.map((t, i) => (
              <Box key={t} as="button" px={2} py={2} borderRadius="md" cursor="pointer" textAlign="left"
                bg={tab === i ? 'brand.500' : 'transparent'}
                onClick={() => setTab(i)}>
                <Text fontSize="9px" fontWeight="black" color={tab === i ? 'white' : 'text.muted'}>{t}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Legend */}
        <Box px={3} py={3} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2} mb={1}>
            <Box w="16px" h="3px" bg={a.secondary} borderRadius="full" />
            <Text fontSize="8px" color="text.muted" lineClamp={1}>{a.short}</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box w="16px" h="3px" bg={b.secondary} borderRadius="full" />
            <Text fontSize="8px" color="text.muted" lineClamp={1}>{b.short}</Text>
          </Flex>
        </Box>
      </Flex>

      {/* Main content */}
      <Box flex={1} overflow="hidden">
        <Content a={a} b={b} aColor={a.secondary} bColor={b.secondary} />
      </Box>
    </Box>
  );
};

export { MOCK_TEAMS };
