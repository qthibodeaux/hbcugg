import { useState, useMemo } from 'react';
import { Box, Flex, Text, VStack, HStack, Grid, Button } from '@chakra-ui/react';
import { MOCK_TEAMS } from './RosterComparatorLab';

const TEAM_LIST = Object.entries(MOCK_TEAMS).map(([id, t]) => ({ 
  id, 
  label: t.label, 
  short: t.short, 
  division: t.division,
  primary: t.primary,
  secondary: t.secondary 
}));

const CLASS_COLORS = { 'Fr.': '#c53030', 'So.': '#dd6b20', 'Jr.': '#d69e2e', 'Sr.': '#2c7a7b', 'Gr.': '#276749' };

const getVeteranColor = (pct) => {
  if (pct >= 40) return '#276749';
  if (pct >= 25) return '#d69e2e';
  return '#c53030';
};

const getExperienceStory = (team) => {
  const vet = team.experience.veteran_pct || 0;
  const upper = team.experience.upperclass_pct || 0;
  
  if (vet >= 40) return "Championship Core";
  if (vet >= 25 && upper >= 45) return "Balanced Experience";
  if (upper >= 50) return "Upperclass Heavy";
  if (vet < 20) return "Youth Movement";
  return "Transition Roster";
};

const getRosterSizeStory = (total) => {
  if (total >= 130) return "Deep Depth";
  if (total >= 110) return "Full Roster";
  if (total >= 90) return "Standard Size";
  return "Compact Squad";
};

const ExperienceMatrixShell = ({ title, subtitle, children, controls }) => (
  <Box w="full" h="full" display="flex" flexDirection="column" overflow="hidden"
    bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">
    
    <Flex flexShrink={0} p={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Flex flex={1} align="center" gap={4}>
        <Box w="4px" h="24px" bg="brand.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{title}</Text>
          <Text fontSize="sm" color="text.muted">{subtitle}</Text>
        </VStack>
      </Flex>
      {controls}
    </Flex>

    <Box flex={1} overflow="auto">
      {children}
    </Box>
  </Box>
);

const EnhancedTeamStoryCard = ({ team, isExpanded, onToggle, index }) => {
  const story = getExperienceStory(team);
  const sizeStory = getRosterSizeStory(team.composition.total_players);
  const vetColor = getVeteranColor(team.experience.veteran_pct);
  
  return (
    <Box key={team.id}>
      <Flex 
        p={4} 
        borderBottom="1px solid" 
        borderColor="whiteAlpha.50"
        cursor="pointer"
        onClick={onToggle}
        bg={isExpanded ? 'bg.card' : 'transparent'}
        style={{ transition: 'all 0.2s ease' }}
        _hover={{ bg: 'bg.card' }}
      >
        <Flex align="center" gap={3} flex={1}>
          <Box w="40px" textAlign="center">
            <Text fontSize="2xl" fontWeight="black" color="text.muted">#{index + 1}</Text>
            <Box px={2} py={1} borderRadius="md" bg={`${team.primary}20`} mt={1}>
              <Text fontSize="8px" color={team.primary} fontWeight="black" textTransform="uppercase">
                {team.division}
              </Text>
            </Box>
          </Box>
          <Box w="4px" h="40px" bg={team.primary} borderRadius="sm" />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="md" fontWeight="black" color="text.primary">{team.label}</Text>
            <Flex gap={3}>
              <Text fontSize="xs" color="text.muted">{team.composition.total_players} players</Text>
              <Text fontSize="xs" color="text.muted">Transfer: {team.transfers?.transfer_rate || 0}%</Text>
            </Flex>
          </VStack>
        </Flex>

        <VStack align="center" spacing={1} px={4}>
          <Text fontSize="3xl" fontWeight="black" color={vetColor} lineHeight={1}>
            {team.experience.veteran_pct}%
          </Text>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
            Veteran
          </Text>
        </VStack>

        <Flex flex={2} align="center" px={4}>
          <Box flex={1} h="28px" borderRadius="md" overflow="hidden" display="flex" boxShadow="sm">
            {team.experience.pyramid?.map((cls, i) => (
              <Box 
                key={cls.class}
                h="full" 
                bg={CLASS_COLORS[cls.class]}
                w={`${cls.pct}%`}
                title={`${cls.label}: ${cls.pct}%`}
                style={{ transition: 'width 0.3s ease' }}
              />
            ))}
          </Box>
        </Flex>

        <VStack align="end" spacing={1} px={4}>
          <Box px={3} py={2} borderRadius="md" bg={`${vetColor}20`} border="1px solid" borderColor={vetColor}>
            <Text fontSize="xs" fontWeight="black" color={vetColor} textTransform="uppercase" letterSpacing="0.05em">
              {story}
            </Text>
          </Box>
          <Flex gap={2} align="center">
            <Text fontSize="xs" color="text.muted">Upper: {team.experience.upperclass_pct}%</Text>
            <Text fontSize="xs" color="text.muted">·</Text>
            <Text fontSize="xs" color="text.muted">{sizeStory}</Text>
          </Flex>
        </VStack>
      </Flex>

      {isExpanded && (
        <Box p={4} bg="bg.card" borderBottom="1px solid" borderColor="whiteAlpha.50">
          <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={3}>
            Position Experience Breakdown - {team.label}
          </Text>
          <Grid templateColumns="repeat(4, 1fr)" gap={3}>
            {team.composition.position_distribution?.map(pos => (
              <Box key={pos.group} p={3} bg="bg.secondary" borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="xs" fontWeight="bold" color="text.secondary" textTransform="uppercase">{pos.group}</Text>
                <Text fontSize="sm" fontWeight="black" color="text.primary">{pos.count}</Text>
                <Text fontSize="xs" color="text.muted">{pos.pct.toFixed(1)}% of roster</Text>
                {team.transfers?.position_impact && (
                  <Text fontSize="xs" color="text.muted" mt={1}>
                    Transfer: {team.transfers.position_impact.find(p => p.group === pos.group)?.transfer_rate || 0}%
                  </Text>
                )}
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export const ExperienceHeatmapClean = () => {
  const [sortBy, setSortBy] = useState('veteran_pct');
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [conferenceFilter, setConferenceFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedTeams = useMemo(() => {
    let filtered = [...TEAM_LIST];
    
    if (conferenceFilter !== 'all') {
      filtered = filtered.filter(team => team.division === conferenceFilter.toUpperCase());
    }
    
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(team => {
        const vetPct = MOCK_TEAMS[team.id]?.experience?.veteran_pct || 0;
        switch(experienceFilter) {
          case 'mature': return vetPct >= 40;
          case 'developing': return vetPct >= 25 && vetPct < 40;
          case 'rebuilding': return vetPct < 25;
          default: return true;
        }
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.short.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const teamA = MOCK_TEAMS[a.id];
      const teamB = MOCK_TEAMS[b.id];
      
      switch(sortBy) {
        case 'veteran_pct':
          return (teamB.experience.veteran_pct || 0) - (teamA.experience.veteran_pct || 0);
        case 'upperclass_pct':
          return (teamB.experience.upperclass_pct || 0) - (teamA.experience.upperclass_pct || 0);
        case 'total_players':
          return (teamB.composition.total_players || 0) - (teamA.composition.total_players || 0);
        case 'alphabetical':
          return teamA.label.localeCompare(teamB.label);
        default:
          return 0;
      }
    });
  }, [sortBy, conferenceFilter, experienceFilter, searchTerm]);

  const controls = (
    <VStack spacing={3} align="stretch">
      <Flex gap={4} align="center" wrap="wrap">
        <VStack align="start" spacing={1}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
            Conference
          </Text>
          <HStack gap={1}>
            <Button size="xs" variant={conferenceFilter === 'all' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setConferenceFilter('all')} h="20px" minW="32px">
              All
            </Button>
            <Button size="xs" variant={conferenceFilter === 'swac' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setConferenceFilter('swac')} h="20px" minW="32px">
              SWAC
            </Button>
            <Button size="xs" variant={conferenceFilter === 'meac' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setConferenceFilter('meac')} h="20px" minW="32px">
              MEAC
            </Button>
          </HStack>
        </VStack>

        <VStack align="start" spacing={1}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
            Experience Level
          </Text>
          <HStack gap={1}>
            <Button size="xs" variant={experienceFilter === 'all' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setExperienceFilter('all')} h="20px" minW="32px">
              All
            </Button>
            <Button size="xs" variant={experienceFilter === 'mature' ? 'solid' : 'ghost'} colorScheme="green" onClick={() => setExperienceFilter('mature')} h="20px" minW="32px" bg={experienceFilter === 'mature' ? 'green.500' : undefined}>
              40%+
            </Button>
            <Button size="xs" variant={experienceFilter === 'developing' ? 'solid' : 'ghost'} colorScheme="yellow" onClick={() => setExperienceFilter('developing')} h="20px" minW="32px" bg={experienceFilter === 'developing' ? 'yellow.500' : undefined}>
              25-39%
            </Button>
            <Button size="xs" variant={experienceFilter === 'rebuilding' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setExperienceFilter('rebuilding')} h="20px" minW="32px" bg={experienceFilter === 'rebuilding' ? 'red.500' : undefined}>
              &lt;25%
            </Button>
          </HStack>
        </VStack>

        <VStack align="start" spacing={1}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
            Search
          </Text>
          <Box>
            <input
              type="text"
              placeholder="Team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '12px',
                color: '#F4F4F5',
                width: '120px'
              }}
            />
          </Box>
        </VStack>
      </Flex>

      <Flex justify="space-between" align="center">
        <HStack gap={1}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
            Sort by:
          </Text>
          {[
            { key: 'veteran_pct', label: 'Veteran %' },
            { key: 'upperclass_pct', label: 'Upperclass %' },
            { key: 'total_players', label: 'Size' },
            { key: 'alphabetical', label: 'Name' }
          ].map(sort => (
            <Button key={sort.key} size="xs" variant={sortBy === sort.key ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setSortBy(sort.key)} fontSize="xs" h="20px">
              {sort.label}
            </Button>
          ))}
        </HStack>
        
        <Text fontSize="xs" color="text.muted">
          {filteredAndSortedTeams.length} of {TEAM_LIST.length} teams
        </Text>
      </Flex>
    </VStack>
  );

  return (
    <ExperienceMatrixShell 
      title="Experience Matrix"
      subtitle="Complete roster experience data for all 18 teams - filter, sort, explore"
      controls={controls}
    >
      <VStack spacing={0} align="stretch">
        {filteredAndSortedTeams.map((team, index) => {
          const isExpanded = expandedTeam === team.id;
          return (
            <EnhancedTeamStoryCard 
              key={team.id}
              team={MOCK_TEAMS[team.id]}
              isExpanded={isExpanded}
              onToggle={() => setExpandedTeam(isExpanded ? null : team.id)}
              index={index}
            />
          );
        })}
      </VStack>
    </ExperienceMatrixShell>
  );
};
