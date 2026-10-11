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
    share_of_team_production: 68,
    
    // Passing Block
    dropbacks: 380,
    pass_att: 350,
    completions: 220,
    comp_pct: 62.8,
    pass_yds: 2850,
    pass_td: 22,
    int: 8,
    sacks_taken: 15,
    sack_yds_lost: 95,
    yds_per_att: 8.1,
    net_yds_per_att: 7.5,
    long_pass: 75,
    "20plus_completions": 42,
    "40plus_completions": 12,
    first_downs_passing: 130,
    fumbles: 3,
    fumbles_lost: 2,
    passing_production: 65,
    passing_par: 32,
    passing_replacement_baseline: 33,

    // Rushing Block
    rush_att: 70,
    rush_yds: 562,
    rush_td: 6,
    ypc: 8.0,
    long_rush: 45,
    scrambles: 25,
    scramble_yds: 210,
    designed_runs: 45,
    designed_run_yds: 352,
    "10plus_runs": 15,
    "20plus_runs": 5,
    first_downs_rushing: 35,
    rush_att_inside_5: 8,
    rush_td_inside_5: 4,
    rushing_production: 20.5,
    rushing_par: 10.8,
    rushing_replacement_baseline: 9.7,

    // Form / Consistency
    par_floor: -5.2,
    par_median: 14.5,
    par_ceiling: 38.1,
    boom_game_count: 3,
    bust_game_count: 1,
    last5_avg_par: 16.2,
    trend_direction: "+4.1",

    // Comparatives
    conference_rank_par: 2,
    percentile_par: 93,
    
    // Signature Moments
    best_game: {
      week: 4,
      opponent: "Jackson State",
      is_home: false,
      game_date: "2025-09-27",
      par: 38.1,
      result: "W 34-31",
      context: "GAME-WINNING DRIVE"
    },
    standout_play: {
      week: 1,
      opponent: "Alcorn State",
      is_home: true,
      game_date: "2025-08-30",
      par: 5.2,
      result: "W 24-17",
      context: "75YD TD RUN"
    }
  },
};

const Card = ({ children, borderLeftColor, ...props }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    p={5}
    position="relative"
    overflow="hidden"
    {...props}
  >
    {borderLeftColor && (
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="4px"
        bg={borderLeftColor}
      />
    )}
    {children}
  </Box>
);

const Metric = ({ label, value, color = "text.primary" }) => (
  <Box>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="bold" color={color} lineHeight="1">
      {value}
    </Text>
  </Box>
);

const ProgressBar = ({ label, value, max, color }) => (
  <Box w="full" mt={3}>
    <Flex justify="space-between" align="baseline" mb={1}>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">
        {label}
      </Text>
      <Text fontSize="10px" color="text.secondary" fontWeight="bold">{value}</Text>
    </Flex>
    <Box w="full" h="4px" bg="whiteAlpha.200" borderRadius="sm" overflow="hidden">
      <Box h="full" w={`${Math.min((value / max) * 100, 100)}%`} bg={color} />
    </Box>
  </Box>
);

const ProductionBlock = ({ title, stats, teamColors, type }) => {
  const isPassing = type === "passing";
  
  return (
    <Card borderLeftColor={teamColors.primary} h="full" display="flex" flexDirection="column">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" fontWeight="900" letterSpacing="0.1em" color="text.secondary" textTransform="uppercase">
          {title}
        </Text>
        <Flex gap={3} align="baseline">
          <Text fontSize="xs" color="text.muted">PAR</Text>
          <Text fontSize="md" fontWeight="bold" color="text.primary">{isPassing ? stats.passing_par : stats.rushing_par}</Text>
        </Flex>
      </Flex>

      {/* Main Counting Stats Grid */}
      <Grid templateColumns="repeat(4, 1fr)" gap={2} mb={6}>
        <Metric label={isPassing ? "COMP/ATT" : "ATT"} value={isPassing ? `${stats.completions}/${stats.pass_att}` : stats.rush_att} />
        <Metric label="YDS" value={isPassing ? stats.pass_yds : stats.rush_yds} />
        <Metric label="TD" value={isPassing ? stats.pass_td : stats.rush_td} />
        <Metric label={isPassing ? "INT" : "FUM"} value={isPassing ? stats.int : stats.fumbles} />
      </Grid>

      {/* Secondary Metrics Grid */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={6}>
        <Metric label={isPassing ? "YPA" : "YPC"} value={isPassing ? stats.yds_per_att : stats.ypc} />
        <Metric label="LONG" value={isPassing ? stats.long_pass : stats.long_rush} />
        <Metric label="1ST DOWN" value={isPassing ? stats.first_downs_passing : stats.first_downs_rushing} />
      </Grid>

      <Box mt="auto">
        {isPassing ? (
          <>
            <ProgressBar label="Completion %" value={`${stats.comp_pct}%`} max={100} color={teamColors.primary} />
            <ProgressBar label="20+ Yd Plays" value={stats["20plus_completions"]} max={60} color={teamColors.primary} />
          </>
        ) : (
          <>
            <ProgressBar label="Scramble Yds" value={stats.scramble_yds} max={stats.rush_yds} color={teamColors.primary} />
            <ProgressBar label="10+ Yd Runs" value={stats["10plus_runs"]} max={30} color={teamColors.primary} />
          </>
        )}
      </Box>
    </Card>
  );
};


const FloorCeilingCard = ({ stats, teamColors }) => {
  // Normalize the scale from floor to ceiling (plus padding)
  const min = Math.min(0, stats.par_floor) - 10;
  const max = Math.max(stats.par_ceiling) + 10;
  const range = max - min;
  
  const getPos = (val) => `${((val - min) / range) * 100}%`;

  return (
    <Card h="full" display="flex" flexDirection="column" gap={6}>
      <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">
        Consistency & Floor
      </Text>

      {/* Bullet Graph */}
      <Box w="full" mt={2}>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="10px" color="text.muted">{min} PAR</Text>
          <Text fontSize="10px" color="text.muted">Median {stats.par_median}</Text>
          <Text fontSize="10px" color="text.muted">{max} PAR</Text>
        </Flex>
        <Box position="relative" h="24px" w="full">
          {/* Base track */}
          <Box position="absolute" top="10px" left="0" w="full" h="4px" bg="whiteAlpha.100" />
          
          {/* Zero line */}
          <Box position="absolute" top="6px" left={getPos(0)} w="1px" h="12px" bg="whiteAlpha.400" />
          
          {/* Floor to Ceiling Range */}
          <Box 
            position="absolute" 
            top="10px" 
            left={getPos(stats.par_floor)} 
            w={`${((stats.par_ceiling - stats.par_floor) / range) * 100}%`} 
            h="4px" 
            bg="whiteAlpha.300" 
          />
          
          {/* Median Dot */}
          <Box 
            position="absolute" 
            top="6px" 
            left={getPos(stats.par_median)} 
            transform="translateX(-50%)"
            w="12px" 
            h="12px" 
            borderRadius="full"
            bg={teamColors.primary}
            border="2px solid"
            borderColor="bg.secondary"
          />
        </Box>
        <Flex justify="space-between" mt={2}>
           <Text fontSize="xs" color="text.secondary">Floor: <Box as="span" color="text.primary" fontWeight="bold">{stats.par_floor}</Box></Text>
           <Text fontSize="xs" color="text.secondary">Ceiling: <Box as="span" color="text.primary" fontWeight="bold">{stats.par_ceiling}</Box></Text>
        </Flex>
      </Box>

      <Flex align="center" gap={6} mt="auto">
        <Box>
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em" mb={1}>Boom Games</Text>
          <Text fontSize="xl" fontWeight="bold" color="green.400">{stats.boom_game_count}</Text>
        </Box>
        <Box>
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em" mb={1}>Bust Games</Text>
          <Text fontSize="xl" fontWeight="bold" color="text.muted">{stats.bust_game_count}</Text>
        </Box>
        <Box ml="auto" textAlign="right">
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.05em" mb={1}>Last 5 Avg</Text>
          <Flex align="center" gap={1}>
             <ArrowUpRight size={12} color="#4ade80" />
             <Text fontSize="xl" fontWeight="bold" color="text.primary">{stats.last5_avg_par.toFixed(1)}</Text>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

const TrophyTicket = ({ game, teamColors }) => (
  <Box 
    border="1px solid" 
    borderColor="whiteAlpha.200" 
    p={3} 
    position="relative"
    bg={`linear-gradient(135deg, ${teamColors.primary}11 0%, transparent 60%)`}
  >
    <Flex justify="space-between" align="center" mb={1}>
      <Text fontSize="xs" fontWeight="bold" color={teamColors.primary} textTransform="uppercase" letterSpacing="0.05em">
        {game.context}
      </Text>
      <Text fontSize="xs" color="text.muted">
        Wk {game.week}
      </Text>
    </Flex>
    <Text fontSize="md" fontWeight="bold" color="text.primary" mb={2}>
      {game.is_home ? "vs" : "@"} {game.opponent}
    </Text>
    <Flex justify="space-between" align="baseline">
       <Box px={2} py={0.5} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="sm">
         <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.800">{game.result}</Text>
       </Box>
       <Text fontSize="sm" fontWeight="bold" color="text.secondary">{game.par} PAR</Text>
    </Flex>
  </Box>
);

const SignatureMomentsCard = ({ stats, teamColors }) => (
  <Card h="full" display="flex" flexDirection="column">
    <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase" mb={4}>
      Signature Moments
    </Text>
    <Flex direction="column" gap={3}>
      <TrophyTicket game={stats.best_game} teamColors={teamColors} />
      <TrophyTicket game={stats.standout_play} teamColors={teamColors} />
    </Flex>
  </Card>
);


export const StatsOverviewFullSectionA = () => {
  const { stats, teamColors } = mockPlayer;

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

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.share_of_team_production / 100) * circumference;

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full" h="100%">
      {/* --- ROW 1: APEX (cols=4) --- */}
      <GridItem {...cardStyles}>
        <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={teamColors.primary} />
        <Box pl={2}>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">
            Impact
          </Text>
          <Flex align="baseline" mt={2} gap={3}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">
              {stats.par.toFixed(1)}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={teamColors.primary}>PAR</Text>
          </Flex>
        </Box>
        <Flex pl={2} justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">Production</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">{stats.total_production.toFixed(1)}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">Replacement</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.muted">{stats.replacement_baseline.toFixed(1)}</Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem {...cardStyles}>
        <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">Output</Text>
          <Flex align="baseline" mt={2} gap={2}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">{stats.yds_from_scrimmage}</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.secondary">YDS</Text>
          </Flex>
        </Box>
        <Flex justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">Total Touchdowns</Text>
            <Text fontSize="lg" fontWeight="bold" color="text.primary">{stats.total_td}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">Touches</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.muted">{stats.total_touches}</Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem {...cardStyles}>
        <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">Efficiency</Text>
          <Flex align="center" mt={2} gap={3}>
            <Text fontSize="6xl" fontWeight="900" lineHeight="1" color="text.primary">{stats.epa_per_play.toFixed(2)}</Text>
            <Flex direction="column" justify="center">
              <Text fontSize="sm" fontWeight="bold" color="text.secondary" lineHeight="1">EPA/PLAY</Text>
              <Flex align="center" mt={1}>
                {stats.epa_per_play > 0 ? <ArrowUpRight size={14} color="#4ade80" /> : <ArrowDownRight size={14} color="#f87171" />}
                <Text fontSize="xs" color={stats.epa_per_play > 0 ? "green.400" : "red.400"} fontWeight="bold" ml={1}>Above Avg</Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
        <Flex justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">EPA Passing</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">+{stats.epa_passing.toFixed(2)}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">EPA Rushing</Text>
            <Text fontSize="sm" fontWeight="bold" color="text.primary">+{stats.epa_rushing.toFixed(2)}</Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem {...cardStyles} justifyContent="center" alignItems="center">
        <Text position="absolute" top={5} left={5} fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="text.muted" textTransform="uppercase">Workload</Text>
        <Box position="relative" mt={6} display="flex" justifyContent="center" alignItems="center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke={teamColors.primary} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="square" transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }} />
          </svg>
          <Box position="absolute" top="0" left="0" w="100%" h="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Text fontSize="2xl" fontWeight="900" color="text.primary" lineHeight="1">{stats.share_of_team_production}%</Text>
          </Box>
        </Box>
        <Text fontSize="xs" color="text.muted" mt={3} textTransform="uppercase" letterSpacing="0.05em">Share of Offense</Text>
      </GridItem>


      {/* --- ROW 2: PRODUCTION ENGINE (cols=2) --- */}
      <GridItem colSpan={2}>
        <ProductionBlock title="Passing Production" stats={stats} teamColors={teamColors} type="passing" />
      </GridItem>
      <GridItem colSpan={2}>
        <ProductionBlock title="Rushing Production" stats={stats} teamColors={teamColors} type="rushing" />
      </GridItem>


      {/* --- ROW 3: ANALYTICS (cols=2, cols=2) --- */}
      <GridItem colSpan={2}>
        <FloorCeilingCard stats={stats} teamColors={teamColors} />
      </GridItem>
      
      <GridItem colSpan={2}>
        <SignatureMomentsCard stats={stats} teamColors={teamColors} />
      </GridItem>
    </Grid>
  );
};
