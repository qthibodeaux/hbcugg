import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GameCenterFeaturedGameCard } from "../../molecules/game/GameCenterFeaturedGameCard";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const featuredGames = [
  {
    id: "W9dunccu",
    status: "final",
    confGame: true,
    stageLabel: "Week 9",
    gamePathId: "W9dunccu",
    away: { ...TEAM_BY_ID.meacdsu, label: "DSU", score: 35 },
    home: { ...TEAM_BY_ID.meacnccu, label: "NCCU", score: 26 },
    supportingLine: "Hornets take a road statement in Durham",
    dateLabel: "Oct 25",
  },
  {
    id: "W10nsudsu",
    status: "final",
    confGame: true,
    stageLabel: "Week 10",
    gamePathId: "W10nsudsu",
    away: { ...TEAM_BY_ID.meacnsu, label: "NSU", score: 20 },
    home: { ...TEAM_BY_ID.meacdsu, label: "DSU", score: 27 },
    supportingLine: "Thursday-night pressure under the lights",
    dateLabel: "Oct 30",
  },
  {
    id: "W11dsumsu",
    status: "final",
    confGame: true,
    stageLabel: "Week 11",
    gamePathId: "W11dsumsu",
    away: { ...TEAM_BY_ID.meacdsu, label: "DSU", score: 14 },
    home: { ...TEAM_BY_ID.meacmsu, label: "MSU", score: 12 },
    supportingLine: "A two-point grinder for the clipping wall",
    dateLabel: "Nov 7",
  },
  {
    id: "W11sualc",
    status: "final",
    confGame: true,
    stageLabel: "Week 11",
    gamePathId: "W11sualc",
    away: { ...TEAM_BY_ID.swacsu, label: "SU", score: 17 },
    home: { ...TEAM_BY_ID.swacalc, label: "ALC", score: 35 },
    supportingLine: "Braves put a statement win on the front page",
    dateLabel: "Nov 8",
  },
];

const coverStory = {
  away: { ...TEAM_BY_ID.meacdsu, label: "DSU", score: 35 },
  home: { ...TEAM_BY_ID.meacnccu, label: "NCCU", score: 26 },
  title: "Hornets Own The Week",
  kicker: "Cover Story",
  strap: "A real 2025 road result turned into a magazine-style season cover.",
  linkTo: "/game/W9dunccu",
};

const clippingCards = [
  {
    kicker: "Wild Finish",
    headline: "14-12 Drama",
    subline: "Delaware State and Morgan State produced a true low-scoring sweat.",
    away: TEAM_BY_ID.meacdsu,
    home: TEAM_BY_ID.meacmsu,
    score: "14-12",
    linkTo: "/game/W11dsumsu",
    accent: "#A89968",
  },
  {
    kicker: "Statement Win",
    headline: "Alcorn Make A Point",
    subline: "A 35-17 conference result with enough margin to read like a headline.",
    away: TEAM_BY_ID.swacsu,
    home: TEAM_BY_ID.swacalc,
    score: "35-17",
    linkTo: "/game/W11sualc",
    accent: "#5C068C",
  },
  {
    kicker: "Road Heat",
    headline: "Durham Test Passed",
    subline: "The Hornets' 35-26 win is the type of result this page should celebrate.",
    away: TEAM_BY_ID.meacdsu,
    home: TEAM_BY_ID.meacnccu,
    score: "35-26",
    linkTo: "/game/W9dunccu",
    accent: "#EE3124",
  },
];

const TeamGhost = ({ team, side = "left", size = "92px", opacity = 0.12 }) => (
  <Box
    position="absolute"
    top={side === "left" ? "-6px" : "auto"}
    bottom={side === "right" ? "-8px" : "auto"}
    left={side === "left" ? "-10px" : "auto"}
    right={side === "right" ? "-10px" : "auto"}
    w={size}
    h={size}
    opacity={opacity}
    pointerEvents="none"
  >
    {team?.logo ? <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" /> : null}
  </Box>
);

const CoverCard = ({ story }) => {
  const content = (
    <Box
      h="100%"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      position="relative"
      boxShadow="0 24px 48px rgba(0,0,0,0.28)"
      bg={`linear-gradient(135deg, ${story.away?.colors?.primary ?? "#1a1a1d"}44 0%, rgba(11,11,13,0.96) 42%, ${story.home?.colors?.primary ?? "#E53E3E"}33 100%)`}
    >
      <TeamGhost team={story.away} side="left" size="150px" opacity={0.14} />
      <TeamGhost team={story.home} side="right" size="150px" opacity={0.14} />
      <Flex position="relative" h="100%" direction="column" px={5} py={4}>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          {story.kicker}
        </Text>
        <Text mt={3} fontSize="clamp(2rem, 3vw, 3.5rem)" lineHeight={0.92} color="white" fontWeight="black" textTransform="uppercase" maxW="80%">
          {story.title}
        </Text>

        <Flex mt={5} justify="space-between" align="center" gap={4}>
          <Flex direction="column" gap={3} flex={1}>
            {[story.away, story.home].map((team) => (
              <Flex key={team.shortName} align="center" gap={3}>
                <Image src={team.logo} alt={team.shortName} w="42px" h="42px" objectFit="contain" />
                <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">
                  {team.shortName}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Text fontSize="5xl" lineHeight={0.9} color="white" fontWeight="black">
            {story.away.score}-{story.home.score}
          </Text>
        </Flex>

        <Text mt="auto" fontSize="11px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          {story.strap}
        </Text>
      </Flex>
    </Box>
  );

  return (
    <Box as={Link} to={story.linkTo} display="block" h="100%">
      {content}
    </Box>
  );
};

const ClippingCard = ({ card }) => (
  <Box as={Link} to={card.linkTo} display="block" h="100%">
    <Box
      h="100%"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      position="relative"
      bg={`linear-gradient(180deg, ${card.accent}24 0%, rgba(17,17,19,0.98) 34%, #0f1013 100%)`}
      boxShadow="0 16px 32px rgba(0,0,0,0.24)"
    >
      <TeamGhost team={card.away} side="left" />
      <TeamGhost team={card.home} side="right" />
      <Flex position="relative" h="100%" direction="column" px={4} py={4}>
        <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          {card.kicker}
        </Text>
        <Text mt={2} fontSize="2xl" lineHeight={0.95} color="white" fontWeight="black" textTransform="uppercase">
          {card.headline}
        </Text>
        <Text mt={3} fontSize="xs" color="text.secondary" lineHeight={1.5}>
          {card.subline}
        </Text>
        <Text mt="auto" fontSize="10px" color="text.muted" fontWeight="bold">
          {card.score}
        </Text>
      </Flex>
    </Box>
  </Box>
);

export const GamesHubMagazineWallA = () => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="bg.primary"
    p={1}
  >
    <Grid templateColumns="repeat(4, minmax(0, 1fr))" autoRows="minmax(120px, 1fr)" gap={1} h="100%">
      {featuredGames.map((game) => (
        <Box key={game.id} minH={0}>
          <GameCenterFeaturedGameCard game={game} />
        </Box>
      ))}

      <Box gridColumn="span 2" gridRow="span 2" minH={0}>
        <CoverCard story={coverStory} />
      </Box>

      {clippingCards.map((card) => (
        <Box key={card.kicker} minH={0}>
          <ClippingCard card={card} />
        </Box>
      ))}
    </Grid>
  </Box>
);
