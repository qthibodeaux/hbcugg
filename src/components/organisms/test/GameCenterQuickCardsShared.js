import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const GAME_OF_WEEK_SAMPLE = {
  title: "Game of the Week",
  awayId: "swacfamu",
  awayLabel: "FAMU",
  homeId: "swacjsu",
  homeLabel: "JSU",
  stageLabel: "Week 10",
  dateLabel: "Nov 1",
  footer: "92.4 excitement rating",
};

export const LOOK_AHEAD_SAMPLE = {
  title: "Look Ahead",
  awayId: "swacasu",
  awayLabel: "ASU",
  homeId: "swacbcu",
  homeLabel: "BCU",
  stageLabel: "Week 11",
  dateLabel: "Nov 8",
  footer: "Division pressure building",
};

export const UPCOMING_STRETCH_SAMPLE = {
  title: "Upcoming Stretch",
  teamId: "swacjsu",
  teamLabel: "JSU",
  games: ["FAMU", "ASU", "PVAMU"],
  summary: "2 of next 3 are projected top-five league matchups.",
};

export const resolveTeam = (id) => TEAM_BY_ID[id] ?? null;

export const TeamBadge = ({ team, label, size = "28px" }) => (
  <Box
    w={size}
    h={size}
    borderRadius="10px"
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

export const WatermarkLogo = ({
  team,
  label,
  size = "120px",
  top = "18px",
  left,
  right,
  opacity = 0.12,
  rotate = "0deg",
}) => {
  if (!team?.logo) return null;

  return (
    <Box
      position="absolute"
      top={top}
      left={left}
      right={right}
      w={size}
      h={size}
      opacity={opacity}
      transform={`rotate(${rotate})`}
      pointerEvents="none"
      zIndex={0}
    >
      <Image src={team.logo} alt={label} w="100%" h="100%" objectFit="contain" />
    </Box>
  );
};

export const CardShell = ({ accent = "#E53E3E", kicker = "Games", children }) => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg={`linear-gradient(160deg, ${accent}1D 0%, rgba(11,11,13,0.96) 58%, #0b0b0d 100%)`}
    overflow="hidden"
    display="flex"
    flexDirection="column"
  >
    <Flex
      align="center"
      justify="space-between"
      px={3}
      py={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      flexShrink={0}
    >
      <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
        {kicker}
      </Text>
    </Flex>
    <Box flex={1}>{children}</Box>
  </Box>
);
