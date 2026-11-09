import { Panel, Kicker } from "./PacketPrimitives";
import { Trophy, BarChart3, Flag } from "lucide-react";
import { Grid, Box, Flex, Text } from "@chakra-ui/react";
import { cleanName, fmt } from "./packetModel";
import { Fragment } from "react";

export const ImpactLeaders = ({ model }) => (
  <Panel accent="#48BB78" minH="100%">
    <Kicker icon={Trophy} color="#48BB78">Impact Leaders</Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} minW={0}>
          <Flex align="center" gap={2} mb={2}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="sm" color="white" fontWeight="black">{team.label}</Text>
          </Flex>
          <Flex direction="column" gap={2}>
            {team.production.slice(0, 4).map((player, index) => (
              <Flex key={`${team.id}-${player.player_key}`} align="center" gap={2} p={2} bg={index === 0 ? `${team.color}22` : "whiteAlpha.50"} border="1px solid" borderColor="whiteAlpha.100">
                <Box w="3px" alignSelf="stretch" bg={team.color} />
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>{cleanName(player.name)}</Text>
                  <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">{player.position}</Text>
                </Box>
                <Text fontSize="sm" color="white" fontWeight="black">{fmt(player.production_total, 1)}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      ))}
    </Grid>
  </Panel>
);

export const RawStats = ({ model }) => (
  <Panel accent="#A0AEC0" p={3}>
    <Kicker icon={BarChart3} color="#A0AEC0">Raw Team Stats</Kicker>
    <Grid templateColumns="1.3fr 1fr 1fr" gap={2} alignItems="center">
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Stat</Text>
      {model.teams.map((team) => (
        <Text key={team.id} fontSize="9px" color="text.muted" fontWeight="black" textAlign="right" textTransform="uppercase">{team.label}</Text>
      ))}
      {[
        ["Total Yards", "total_yards"],
        ["Pass", "pass_yards"],
        ["Rush", "rush_yards"],
        ["Plays", "plays_offense"],
        ["Turnovers", "turnovers_committed"],
        ["Sacks Made", "sacks_made"],
        ["3rd Down", "third_down_conversions", "third_down_attempts"],
        ["4th Down", "fourth_down_go_conversions", "fourth_down_goes"],
      ].map(([label, key, attempts]) => (
        <Fragment key={label}>
          <Text fontSize="10px" color="text.secondary" fontWeight="black">{label}</Text>
          {model.teams.map((team) => (
            <Text key={`${team.id}-${label}`} fontSize="11px" color="white" fontWeight="black" textAlign="right">
              {attempts ? `${team.box[key] ?? 0}/${team.box[attempts] ?? 0}` : fmt(team.box[key], 0)}
            </Text>
          ))}
        </Fragment>
      ))}
    </Grid>
  </Panel>
);

export const StandingsContext = ({ model }) => (
  <Panel accent="#63B3ED" p={3}>
    <Kicker icon={Flag} color="#63B3ED">Bigger Picture</Kicker>
    <Flex direction="column" gap={3}>
      <Text fontSize="sm" color="white" fontWeight="black" lineHeight={1.25}>
        Standings context should live here once the game-detail payload includes a game-week snapshot.
      </Text>
      {model.teams.map((team) => (
        <Flex key={team.id} align="center" justify="space-between" bg="whiteAlpha.50" p={2} border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={2}>
            <Box w="8px" h="8px" bg={team.color} />
            <Text fontSize="xs" color="white" fontWeight="black">{team.name}</Text>
          </Flex>
          <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">snapshot pending</Text>
        </Flex>
      ))}
    </Flex>
  </Panel>
);
