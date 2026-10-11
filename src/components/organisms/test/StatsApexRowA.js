import React from "react";
import { Box, Flex, Text, Grid, GridItem } from "@chakra-ui/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const mockPlayer = {
  name: "Brandon Nunez",
  position: "Quarterback",
  teamColors: {
    primary: "#046A38", // MVSU Green
    secondary: "#FFFFFF",
    accent: "#000000",
  },
  stats: {
    par: 42.8,
    total_production: 85.5,
    replacement_baseline: 42.7,
    yds_from_scrimmage: 3412,
    total_td: 28,
    total_touches: 420,
    epa_per_play: 0.18,
    epa_passing: 0.15,
    epa_rushing: 0.03,
    share_of_team_production: 68, // percent
  },
};

export const StatsApexRowA = () => {
  const { stats, teamColors } = mockPlayer;

  // Shared styles for the 4 boxes
  const cardStyles = {
    bg: "bg.secondary",
    border: "1px solid",
    borderColor: "whiteAlpha.100",
    p: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  };

  // Helper for the circular gauge (cheap SVG implementation)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (stats.share_of_team_production / 100) * circumference;

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full" h="100%">
      {/* 1. Total PAR & Production */}
      <GridItem {...cardStyles}>
        {/* Subtle accent bar */}
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w="4px"
          bg={teamColors.primary}
        />
        <Box pl={2}>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">
            Impact
          </Text>
          <Flex align="baseline" mt={2} gap={3}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">
              {stats.par.toFixed(1)}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={teamColors.primary}>
              PAR
            </Text>
          </Flex>
        </Box>
        <Flex pl={2} justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              Production
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              {stats.total_production.toFixed(1)}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              Replacement
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.muted">
              {stats.replacement_baseline.toFixed(1)}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      {/* 2. Total Yardage & Touchdowns */}
      <GridItem {...cardStyles}>
        <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">
            Output
          </Text>
          <Flex align="baseline" mt={2} gap={2}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">
              {stats.yds_from_scrimmage}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.secondary">
              YDS
            </Text>
          </Flex>
        </Box>
        <Flex justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              Total Touchdowns
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="text.primary">
              {stats.total_td}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              Touches
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.muted">
              {stats.total_touches}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      {/* 3. Efficiency Rating */}
      <GridItem {...cardStyles}>
        <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">
            Efficiency
          </Text>
          <Flex align="center" mt={2} gap={3}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">
              {stats.epa_per_play.toFixed(2)}
            </Text>
            <Flex direction="column" justify="center">
              <Text fontSize="sm" fontWeight="bold" color="text.secondary" lineHeight="1">
                EPA/PLAY
              </Text>
              <Flex align="center" mt={1}>
                {stats.epa_per_play > 0 ? (
                  <ArrowUpRight size={14} color="#4ade80" />
                ) : (
                  <ArrowDownRight size={14} color="#f87171" />
                )}
                <Text fontSize="xs" color={stats.epa_per_play > 0 ? "green.400" : "red.400"} fontWeight="bold" ml={1}>
                  Above Avg
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
        <Flex justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              EPA Passing
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              +{stats.epa_passing.toFixed(2)}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
              EPA Rushing
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">
              +{stats.epa_rushing.toFixed(2)}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      {/* 4. Market Share */}
      <GridItem {...cardStyles} justifyContent="center" alignItems="center">
        <Text
          position="absolute"
          top={5}
          left={5}
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.1em"
          color="text.muted"
          textTransform="uppercase"
        >
          Workload
        </Text>
        
        <Box position="relative" mt={6} display="flex" justifyContent="center" alignItems="center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={teamColors.primary}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="square"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
            />
          </svg>
          <Box position="absolute" top="0" left="0" w="100%" h="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Text fontSize="2xl" fontWeight="900" color="text.primary" lineHeight="1">
              {stats.share_of_team_production}%
            </Text>
          </Box>
        </Box>
        
        <Text fontSize="xs" color="text.muted" mt={3} textTransform="uppercase" letterSpacing="0.05em">
          Share of Offense
        </Text>
      </GridItem>
    </Grid>
  );
};
