import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const TEAM_ALIASES = teamsData.teams.reduce((acc, team) => {
  const values = [
    team.name,
    team.shortName,
    team.bannerShort,
    `${team.name} ${team.mascot}`,
  ].filter(Boolean);

  values.forEach((value) => {
    const key = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
    acc[key] = team;
  });

  return acc;
}, {});

const resolveTeam = (teamId, fallbackName) => {
  if (teamId && TEAM_BY_ID[teamId]) return TEAM_BY_ID[teamId];
  const alias = String(fallbackName ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return TEAM_ALIASES[alias] ?? null;
};

const buildSample = ({
  teamId,
  opponentId,
  opponentName,
  homeAway,
  date,
  stageLabel,
  scoreTeam,
  scoreOpp,
  confGame,
  gameStem,
  displayState,
  note,
}) => {
  const subjectTeam = resolveTeam(teamId, null);
  const opponentTeam = resolveTeam(opponentId, opponentName);

  const subjectSide = {
    team: subjectTeam,
    label:
      subjectTeam?.shortName ??
      subjectTeam?.bannerShort ??
      String(teamId ?? "TEAM").toUpperCase(),
    score: displayState === "final" ? scoreTeam : null,
  };

  const opponentSide = {
    team: opponentTeam,
    label:
      opponentTeam?.shortName ??
      opponentTeam?.bannerShort ??
      opponentName ??
      "OPP",
    score: displayState === "final" ? scoreOpp : null,
  };

  const away = homeAway === "away" ? subjectSide : opponentSide;
  const home = homeAway === "away" ? opponentSide : subjectSide;

  return {
    id: `${teamId}-${opponentId ?? opponentName}-${date}-${displayState}`,
    state: displayState,
    away,
    home,
    date,
    stageLabel,
    confGame,
    gameStem,
    note,
  };
};

export const FEATURED_GAME_CARD_SAMPLES = [
  buildSample({
    teamId: "meacdsu",
    opponentId: "meacnccu",
    opponentName: "North Carolina Central",
    homeAway: "away",
    date: "2025-10-25",
    stageLabel: "Week 9",
    scoreTeam: 35,
    scoreOpp: 26,
    confGame: true,
    gameStem: "W9dunccu",
    displayState: "final",
    note: "Hornets seize first place with a road statement.",
  }),
  buildSample({
    teamId: "meacdsu",
    opponentId: "meacnsu",
    opponentName: "Norfolk State",
    homeAway: "home",
    date: "2025-10-30",
    stageLabel: "Week 10",
    scoreTeam: 27,
    scoreOpp: 20,
    confGame: true,
    gameStem: "W10nsudsu",
    displayState: "final",
    note: "Thursday-night grinder decided in the fourth quarter.",
  }),
  buildSample({
    teamId: "meacmsu",
    opponentId: "meacscsu",
    opponentName: "South Carolina State",
    homeAway: "away",
    date: "2025-11-01",
    stageLabel: "Week 10",
    scoreTeam: 30,
    scoreOpp: 36,
    confGame: true,
    gameStem: "W10msuscsu",
    displayState: "preview",
    note: "Preview state using a real conference matchup from the schedule export.",
  }),
  buildSample({
    teamId: "meacmsu",
    opponentId: "meacdsu",
    opponentName: "Delaware State",
    homeAway: "home",
    date: "2025-11-07",
    stageLabel: "Week 11",
    scoreTeam: null,
    scoreOpp: null,
    confGame: true,
    gameStem: null,
    displayState: "preview",
    note: "Friday-night league race pressure with no recap CTA.",
  }),
];

export const MVP_LINE_BY_GAME = {
  "meacdsu-meacnccu-2025-10-25-final": "MVP: Walker Harris blurd 23.79 prod",
  "meacdsu-meacnsu-2025-10-30-final": "MVP: Otto Kuhns blurd 12.90 prod",
  "meacmsu-meacscsu-2025-11-01-preview": "MVP watch: QB duel loading",
  "meacmsu-meacdsu-2025-11-07-preview": "MVP watch: Friday night glory player",
};

export const PLAYER_SPOTLIGHT_SAMPLES = {
  "meacdsu-meacnccu-2025-10-25-final": {
    awayPlayer: {
      name: "Montrell Campbell",
      position: "DB",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/0_Montrel-Campbell.jpg",
    },
    homePlayer: {
      name: "Jaylin Peterson",
      position: "WR",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/0_Jaylin-Peterson.jpg",
    },
    glory: {
      name: "Montrell Campbell",
      position: "AAMU Spotlight",
      line: "Alabama A&M portrait test",
      image: "https://aamusports.com/images/2025/8/6/0_Montrel-Campbell.jpg",
    },
  },
  "meacdsu-meacnsu-2025-10-30-final": {
    awayPlayer: {
      name: "Duke Miller",
      position: "WR",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/1_Duke-Miller.jpg",
    },
    homePlayer: {
      name: "Kaleb Brown",
      position: "DB",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/2_Kaleb-Brown.jpg",
    },
    glory: {
      name: "Duke Miller",
      position: "AAMU Spotlight",
      line: "Alabama A&M portrait test",
      image: "https://aamusports.com/images/2025/8/6/1_Duke-Miller.jpg",
    },
  },
  "meacmsu-meacscsu-2025-11-01-preview": {
    awayPlayer: {
      name: "Donivan Wright",
      position: "WR",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/4_Donivan-Wright.jpg",
    },
    homePlayer: {
      name: "Anthony Fieldings",
      position: "DB",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/5_Anthony-Fieldings.jpg",
    },
    glory: {
      name: "Donivan Wright",
      position: "AAMU Spotlight",
      line: "Preview portrait treatment",
      image: "https://aamusports.com/images/2025/8/6/4_Donivan-Wright.jpg",
    },
  },
  "meacmsu-meacdsu-2025-11-07-preview": {
    awayPlayer: {
      name: "Myles Parker",
      position: "WR",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/5_Myles-Parker.jpg",
    },
    homePlayer: {
      name: "Lynn Pettway",
      position: "DB",
      production: null,
      par: null,
      image: "https://aamusports.com/images/2025/8/6/6_Lynn-Pettway.jpg",
    },
    glory: {
      name: "Myles Parker",
      position: "AAMU Spotlight",
      line: "Preview portrait treatment",
      image: "https://aamusports.com/images/2025/8/6/5_Myles-Parker.jpg",
    },
  },
};

export const formatGameDate = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const TeamMark = ({ side, size = "38px", tint = "whiteAlpha.100" }) => {
  const logo = side?.team?.logo;
  const label = side?.label ?? "TEAM";

  return (
    <Box
      w={size}
      h={size}
      borderRadius="12px"
      bg={tint}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      flexShrink={0}
    >
      {logo ? (
        <Image src={logo} alt={label} w="70%" h="70%" objectFit="contain" />
      ) : (
        <Text fontSize="10px" fontWeight="black" color="white">
          {String(label).slice(0, 3).toUpperCase()}
        </Text>
      )}
    </Box>
  );
};

export const TeamWatermark = ({
  side,
  size = "128px",
  top = "16px",
  left,
  right,
  opacity = 0.13,
  rotate = "0deg",
}) => {
  if (!side?.team?.logo) return null;

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
      <Image src={side.team.logo} alt={side.label} w="100%" h="100%" objectFit="contain" />
    </Box>
  );
};

export const CardGallery = ({ children }) => (
  <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={3} h="100%">
    {children}
  </Grid>
);

export const CardFrame = ({ game, accent, children }) => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    overflow="hidden"
    bg={`linear-gradient(180deg, ${accent}1F 0%, rgba(11,11,13,0.96) 44%, #0b0b0d 100%)`}
    boxShadow="0 18px 40px rgba(0,0,0,0.28)"
  >
    {children}
    <Box px={3} pb={2}>
      <Text fontSize="10px" color="text.muted" lineClamp={2}>
        {game.note}
      </Text>
    </Box>
  </Box>
);

export const CardTopline = ({ game, accent, rightLabel }) => (
  <Flex
    align="center"
    justify="space-between"
    px={3}
    py={2}
    borderBottom="1px solid"
    borderColor="whiteAlpha.100"
    bg={`${accent}21`}
  >
    <Flex align="center" gap={2}>
      <Box px={2} py={0.5} borderRadius="full" bg="whiteAlpha.200">
        <Text
          fontSize="8px"
          fontWeight="black"
          letterSpacing="0.12em"
          color="white"
          textTransform="uppercase"
        >
          {game.state === "final" ? "Final" : "Preview"}
        </Text>
      </Box>
      {game.confGame ? (
        <Text fontSize="8px" fontWeight="bold" color="text.secondary" textTransform="uppercase">
          Conf
        </Text>
      ) : null}
    </Flex>
    <Text fontSize="9px" color="text.secondary" textTransform="uppercase" fontWeight="bold">
      {rightLabel ?? game.stageLabel}
    </Text>
  </Flex>
);
