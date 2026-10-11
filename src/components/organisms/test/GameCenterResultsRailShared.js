import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const GAME_CENTER_RESULTS_SAMPLES = [
  {
    id: "rail-1",
    stageLabel: "Week 9",
    dateLabel: "Oct 25",
    awayId: "meacdsu",
    awayLabel: "DSU",
    awayScore: 35,
    homeId: "meacnccu",
    homeLabel: "NCCU",
    homeScore: 24,
    summary: "Road statement win",
  },
  {
    id: "rail-2",
    stageLabel: "Week 10",
    dateLabel: "Oct 30",
    awayId: "meacnsu",
    awayLabel: "NSU",
    awayScore: 20,
    homeId: "meacdsu",
    homeLabel: "DSU",
    homeScore: 19,
    summary: "Thursday-night grinder",
  },
  {
    id: "rail-3",
    stageLabel: "Week 9",
    dateLabel: "Oct 25",
    awayId: "meacmsu",
    awayLabel: "MSU",
    awayScore: 27,
    homeId: "meachu",
    homeLabel: "HU",
    homeScore: 33,
    summary: "Bison survive late push",
  },
  {
    id: "rail-4",
    stageLabel: "Week 10",
    dateLabel: "Nov 1",
    awayId: "meacmsu",
    awayLabel: "MSU",
    awayScore: 30,
    homeId: "meacscsu",
    homeLabel: "SCSU",
    homeScore: 36,
    summary: "Bulldogs close strong",
  },
  {
    id: "rail-5",
    stageLabel: "Week 12",
    dateLabel: "Nov 15",
    awayId: "meachu",
    awayLabel: "HU",
    awayScore: 13,
    homeId: "meacdsu",
    homeLabel: "DSU",
    homeScore: 26,
    summary: "Hornets protect home field",
  },
];

export const resolveRailTeams = (game) => ({
  away: TEAM_BY_ID[game.awayId] ?? null,
  home: TEAM_BY_ID[game.homeId] ?? null,
});

export const RailLogo = ({ team, label, size = "22px" }) => (
  <Box
    w={size}
    h={size}
    borderRadius="8px"
    bg="whiteAlpha.100"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
    flexShrink={0}
  >
    {team?.logo ? (
      <Image src={team.logo} alt={label} w="72%" h="72%" objectFit="contain" />
    ) : (
      <Text fontSize="8px" fontWeight="black" color="white">
        {String(label).slice(0, 3).toUpperCase()}
      </Text>
    )}
  </Box>
);

export const RailShell = ({ title, children }) => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(11,11,13,0.96) 18%, #0b0b0d 100%)"
    overflow="hidden"
    display="flex"
    flexDirection="column"
  >
    <Flex
      align="center"
      justify="space-between"
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      flexShrink={0}
    >
      <Text fontSize="10px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
        {title}
      </Text>
      <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase">
        Latest
      </Text>
    </Flex>
    <Flex direction="column" flex={1}>
      {children}
    </Flex>
  </Box>
);
