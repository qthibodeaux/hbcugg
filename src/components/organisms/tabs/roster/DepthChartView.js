import { Box, Text, Flex, Grid, Badge } from "@chakra-ui/react";
import { useMemo } from "react";



const DepthPlayerCard = ({ player, rank, accent }) => {
  const number = player.jersey_number || "—";
  const name = player.full_name || "Unknown";
  const classYear = player.class_year || "—";
  const position = player.position || player.position_abbr || "—";
  const par = player.par ?? 0;
  const isTransfer = player.is_transfer ? "Transfer" : "Recruited";
  const transferTier = player.transfer_tier ? `${player.transfer_tier}` : null;

  return (
    <Box
      bg={rank === 1 ? `linear-gradient(135deg, ${accent}22 0%, transparent 100%)` : "blackAlpha.300"}
      border="1px solid"
      borderColor={rank === 1 ? accent : "whiteAlpha.100"}
      borderRadius="lg"
      p={3}
      position="relative"
      overflow="hidden"
    >
      {rank === 1 && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg={accent}
          color="white"
          px={2}
          py={1}
          fontSize="9px"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="0.08em"
        >
          Starter
        </Box>
      )}

      <Flex justify="space-between" align="flex-start" mb={2}>
        <Flex align="center" gap={2}>
          <Box
            w="28px"
            h="28px"
            borderRadius="sm"
            bg="whiteAlpha.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
            color="text.primary"
          >
            {number}
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1}>
              {name}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {position}
              {transferTier && ` • ${transferTier}`}
            </Text>
          </Box>
        </Flex>
        <Badge colorScheme="cyan" variant="subtle" fontSize="9px" textTransform="uppercase">
          {classYear}
        </Badge>
      </Flex>

      {/* PAR Bar */}
      {par > 0 && (
        <Box mb={2}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              PAR
            </Text>
            <Text fontSize="xs" fontWeight="bold" color={accent}>
              {par.toFixed(1)}
            </Text>
          </Flex>
          <Box h="4px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
            <Box
              h="100%"
              w={`${Math.min(100, (par / 50) * 100)}%`}
              bg={accent}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>
      )}

      <Flex justify="space-between" gap={2}>
        <Text fontSize="8px" color="text.muted" textTransform="uppercase">
          {isTransfer}
        </Text>
        {player.games_played && (
          <Text fontSize="8px" color="text.muted">
            {player.games_played}GP
          </Text>
        )}
      </Flex>
    </Box>
  );
};

const PositionGroupSection = ({ group, accent }) => {
  // Sort by PAR if available, else by experience_score
  const sorted = [...(group.players || [])].sort((a, b) => {
    const aPar = a.par ?? 0;
    const bPar = b.par ?? 0;
    if (aPar !== bPar) return bPar - aPar;

    const aXp = a.experience_score ?? 0;
    const bXp = b.experience_score ?? 0;
    return bXp - aXp;
  });

  const starters = sorted.slice(0, 2);
  const backups = sorted.slice(2, 4);
  const reserves = sorted.slice(4);

  return (
    <Box mb={8}>
      {/* Position Header */}
      <Flex align="center" gap={3} mb={4}>
        <Box
          w="4px"
          h="24px"
          bg={accent}
          borderRadius="full"
        />
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" textTransform="uppercase">
            {group.label}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {sorted.length} players
          </Text>
        </Box>
      </Flex>

      {/* Starters */}
      {starters.length > 0 && (
        <Box mb={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Starters
          </Text>
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={2}
          >
            {starters.map((player, idx) => (
              <DepthPlayerCard
                key={`${player.person_id || idx}`}
                player={player}
                rank={idx + 1}
                accent={accent}
              />
            ))}
          </Grid>
        </Box>
      )}

      {/* Backups */}
      {backups.length > 0 && (
        <Box mb={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Backups
          </Text>
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={2}
          >
            {backups.map((player, idx) => (
              <DepthPlayerCard
                key={`${player.person_id || idx}`}
                player={player}
                rank={idx + 3}
                accent={accent}
              />
            ))}
          </Grid>
        </Box>
      )}

      {/* Reserves */}
      {reserves.length > 0 && (
        <Box>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Reserves ({reserves.length})
          </Text>
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" }}
            gap={2}
          >
            {reserves.map((player, idx) => (
              <Box
                key={`${player.person_id || idx}`}
                p={2}
                bg="blackAlpha.300"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="md"
                textAlign="center"
              >
                <Text fontSize="11px" fontWeight="bold" color="white" lineClamp={1}>
                  #{player.jersey_number || "—"}
                </Text>
                <Text fontSize="9px" color="text.muted" lineClamp={1}>
                  {player.full_name}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

const RosterMetricsPanel = ({ roster, accent }) => {
  const metrics = useMemo(() => {
    if (!roster || roster.length === 0) return null;

    // Class breakdown
    const classCounts = {};
    let totalXp = 0;
    let xpCount = 0;
    let transferCount = 0;
    let totalPar = 0;
    let parCount = 0;

    roster.forEach((p) => {
      const cls = p.class_year || "Unknown";
      classCounts[cls] = (classCounts[cls] || 0) + 1;

      if (typeof p.experience_score === "number") {
        totalXp += p.experience_score;
        xpCount++;
      }

      if (p.is_transfer) transferCount++;

      if (typeof p.par === "number") {
        totalPar += p.par;
        parCount++;
      }
    });

    const avgXp = xpCount > 0 ? (totalXp / xpCount).toFixed(1) : null;
    const avgPar = parCount > 0 ? (totalPar / parCount).toFixed(1) : null;
    const classes = Object.entries(classCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      avgXp,
      avgPar,
      transferCount,
      transferPct: ((transferCount / roster.length) * 100).toFixed(0),
      classes,
    };
  }, [roster]);

  if (!metrics) return null;

  return (
    <Box mb={8}>
      <Flex align="center" gap={3} mb={4}>
        <Box w="4px" h="24px" bg={accent} borderRadius="full" />
        <Text fontSize="lg" fontWeight="bold" color="white" textTransform="uppercase">
          Roster Intelligence
        </Text>
      </Flex>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3}>
        {/* Total Size */}
        <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Roster Size
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="white">
            {roster.length}
          </Text>
          <Text fontSize="9px" color="text.muted" mt={1}>
            Total active players
          </Text>
        </Box>

        {/* Avg Experience */}
        {metrics.avgXp && (
          <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
              Avg Experience
            </Text>
            <Text fontSize="2xl" fontWeight="black" color={accent}>
              {metrics.avgXp}
            </Text>
            <Text fontSize="9px" color="text.muted" mt={1}>
              Experience score
            </Text>
          </Box>
        )}

        {/* Avg PAR */}
        {metrics.avgPar && (
          <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
              Avg PAR
            </Text>
            <Text fontSize="2xl" fontWeight="black" color={accent}>
              {metrics.avgPar}
            </Text>
            <Text fontSize="9px" color="text.muted" mt={1}>
              Player performance rating
            </Text>
          </Box>
        )}

        {/* Transfer Rate */}
        <Box bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Transfers
          </Text>
          <Text fontSize="2xl" fontWeight="black" color={accent}>
            {metrics.transferPct}%
          </Text>
          <Text fontSize="9px" color="text.muted" mt={1}>
            {metrics.transferCount} of {roster.length}
          </Text>
        </Box>
      </Grid>

      {/* Class Breakdown */}
      <Box mt={4} bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
        <Text fontSize="sm" fontWeight="bold" color="white" mb={3} textTransform="uppercase" letterSpacing="0.05em">
          Class Composition
        </Text>
        <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={2}>
          {metrics.classes.map(([cls, count]) => {
            const pct = ((count / roster.length) * 100).toFixed(0);
            return (
              <Box key={cls}>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {cls}
                  </Text>
                  <Text fontSize="xs" color={accent} fontWeight="bold">
                    {pct}%
                  </Text>
                </Flex>
                <Box h="6px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
                  <Box
                    h="100%"
                    w={`${pct}%`}
                    bg={accent}
                    transition="width 0.3s ease"
                  />
                </Box>
                <Text fontSize="8px" color="text.muted" mt={1}>
                  {count} players
                </Text>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

const DepthChartView = ({ roster = [], team }) => {
  const accent = team?.colors?.primary || "#E53E3E";

  const POSITION_GROUPS = [
    { key: "QB", label: "Quarterbacks" },
    { key: "RB", label: "Running Backs" },
    { key: "WR", label: "Wide Receivers" },
    { key: "TE", label: "Tight Ends" },
    { key: "OL", label: "Offensive Line" },
    { key: "DL", label: "Defensive Line" },
    { key: "LB", label: "Linebackers" },
    { key: "DB", label: "Defensive Backs" },
    { key: "K", label: "Kickers" },
    { key: "P", label: "Punters" },
    { key: "ST", label: "Special Teams" },
    { key: "__other__", label: "Other" },
  ];

  const groupedRoster = useMemo(() => {
    const byGroup = roster.reduce((acc, player) => {
      const pg = player.position_group || "__other__";
      if (!acc[pg]) acc[pg] = [];
      acc[pg].push(player);
      return acc;
    }, {});

    return POSITION_GROUPS.map((group) => ({
      ...group,
      players: byGroup[group.key] ?? [],
    })).filter((group) => group.players.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster]);

  return (
    <Box>
      {/* Roster Metrics */}
      <RosterMetricsPanel roster={roster} accent={accent} />

      {/* Position Groups */}
      {groupedRoster.map((group) => (
        <PositionGroupSection
          key={group.key}
          group={group}
          accent={accent}
        />
      ))}
    </Box>
  );
};

export default DepthChartView;
