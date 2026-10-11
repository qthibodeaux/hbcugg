
import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import teamsData from "../../../../data/teams.json";

/**
 * BoxScoreV2 - A comparison variant following the "Defensive Style" 
 * (Large values, high density, bold readability, Last Names only).
 */

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  acc[team.id] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_BY_ID[id] ?? null;
const getTeamColor = (id) => getTeam(id)?.colors?.primary ?? "#27272A";
const getTeamSecondary = (id) => getTeam(id)?.colors?.secondary ?? "#A1A1AA";

const getLastNameOnly = (name) => {
  if (!name) return "";
  const str = String(name);
  if (str.includes(",")) return str.split(",")[0]?.trim() || "";
  const parts = str.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
};

const V2PanelHeader = ({ teamId, title, color, secondary }) => (
  <Flex
    direction="column"
    bg={`linear-gradient(90deg, ${color}33 0%, transparent 72%)`}
    borderBottom="1px solid whiteAlpha.200"
    px={1}
    py="3px"
    gap="3px"
    flexShrink={0}
  >
    <Flex align="center" gap={1.5} py="2px">
      <Flex 
        w="22px" h="22px" borderRadius="sm" bg={color} 
        align="center" justify="center" flexShrink={0} 
        border="1px solid whiteAlpha.200"
      >
        <Text fontSize="9px" fontWeight="900" color={secondary || "white"}>{String(teamId ?? "TM").slice(0, 3).toUpperCase()}</Text>
      </Flex>
      <Text fontSize="14px" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">
        {title}
      </Text>
    </Flex>
  </Flex>
);

const PassingPanelV2 = ({ teamId, players = [] }) => {
  const color = getTeamColor(teamId);
  const secondary = getTeamSecondary(teamId);
  
  return (
    <Flex direction="column" w="full" h="full" minH={0} bg="bg.secondary">
      <V2PanelHeader teamId={teamId} title="PASSING PRODUCTION" color={color} secondary={secondary} />
      
      <Box flex={1} p="2px" overflowY="hidden" display="flex" flexDirection="column">
        {/* Table Head */}
        <Grid templateColumns="minmax(0, 2fr) repeat(4, 1fr)" gap={0} alignItems="center" py="4px" borderBottom="1px solid whiteAlpha.100">
           <Text fontSize="11px" fontWeight="900" color="text.muted" textTransform="uppercase" pl={3}>QUARTERBACK</Text>
           <Text fontSize="11px" fontWeight="900" color="text.muted" textAlign="center">C/A</Text>
           <Text fontSize="11px" fontWeight="900" color="text.muted" textAlign="center">YDS</Text>
           <Text fontSize="11px" fontWeight="900" color="text.muted" textAlign="center">TD</Text>
           <Text fontSize="11px" fontWeight="900" color="text.muted" textAlign="center">INT</Text>
        </Grid>

        {players.map((p) => (
          <Grid key={p.player_key} templateColumns="minmax(0, 2fr) repeat(4, 1fr)" gap={0} alignItems="center" py="8px" borderBottom="1px solid whiteAlpha.50">
            <Box pl={3}>
              <Text fontSize="15px" fontWeight="950" color="text.primary" textTransform="uppercase">
                {getLastNameOnly(p.name)}
              </Text>
              <Text fontSize="10px" color="text.muted" fontWeight="800" textTransform="uppercase">
                #{p.number || "00"} • QB
              </Text>
            </Box>
            <Text fontSize="16px" fontWeight="950" textAlign="center" color="text.primary">{p.completions}/{p.attempts}</Text>
            <Text fontSize="16px" fontWeight="950" textAlign="center" color="brand.400">{p.yards}</Text>
            <Text fontSize="16px" fontWeight="950" textAlign="center" color="white">{p.touchdowns || p.tds || 0}</Text>
            <Text fontSize="16px" fontWeight="950" textAlign="center" color={(p.interceptions || p.ints || 0) > 0 ? "red.400" : "text.muted"}>{p.interceptions || p.ints || 0}</Text>
          </Grid>
        ))}
      </Box>
    </Flex>
  );
};

export const PassingBoxScoreV2 = ({ game, awayId, homeId }) => {
  const getPassingStats = (passingField) => {
    if (!passingField) return [];
    const list = Array.isArray(passingField) ? passingField : Object.values(passingField);
    return list.filter(p => p && p.name !== "TEAM" && p.name_raw !== "TEAM");
  };

  const awayStats = getPassingStats(game?.individual_stats?.[awayId]?.passing);
  const homeStats = getPassingStats(game?.individual_stats?.[homeId]?.passing);

  return (
      <Box p={4} bg="bg.secondary" borderRadius="xl" border="2px dashed brand.500" mt={8} mb={12}>
        <Text color="brand.400" fontWeight="black" mb={4} fontSize="sm" textTransform="uppercase" letterSpacing="widest">
          V2 COMPARISON — "DEFENSIVE STYLE" UNIFICATION (Passing)
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} minH="400px">
           <Box border="1px solid whiteAlpha.200" borderRadius="lg" overflow="hidden">
              <PassingPanelV2 teamId={awayId} players={awayStats} />
           </Box>
           <Box border="1px solid whiteAlpha.200" borderRadius="lg" overflow="hidden">
              <PassingPanelV2 teamId={homeId} players={homeStats} />
           </Box>
        </Grid>
      </Box>
  );
};
