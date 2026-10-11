import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const game = {
  label: "Road Noise",
  linkTo: "/game/W13gsuuapb",
  away: { ...TEAM_BY_ID.swacgsu, score: 20 },
  home: { ...TEAM_BY_ID.swacuapb, score: 16 },
  player: {
    name: "Keith Jones Jr.",
    line: "big game on the road",
    imageUrl: "https://gsutigers.com/images/2025/8/20/KeithJonesJr_0ikIk.jpg",
  },
};

const compactLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

export const GamesHubRoadNoiseA = () => (
  <Box as={Link} to={game.linkTo} display="block" h="100%" w="full">
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      bg="bg.secondary"
      color="white"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(130deg, ${game.away.colors.primary}44 0%, rgba(11,11,13,0.96) 42%, ${game.home.colors.primary}33 100%)`} />
      <Box
        position="absolute"
        right="-20px"
        top="18px"
        bottom="-16px"
        w="58%"
        opacity={0.42}
        borderRadius="24px 0 0 24px"
        overflow="hidden"
        filter="drop-shadow(0 0 18px rgba(0,0,0,0.72))"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          boxShadow: "inset 10px 0 16px #141416, inset 0 10px 16px #141416, inset 0 -10px 16px #141416",
          borderRadius: "24px 0 0 24px",
        }}
      >
        <Image
          src={game.player.imageUrl}
          alt={game.player.name}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center top"
          filter="grayscale(0.15) contrast(1.05)"
        />
      </Box>
      <Box position="absolute" right="0" top="0" bottom="0" w="55%" bg="linear-gradient(90deg, #141416 0%, rgba(20,20,22,0.24) 34%, rgba(20,20,22,0) 100%)" />
      <Box position="absolute" left="50%" top="0" bottom="0" w="1px" bg="whiteAlpha.100" />

      <Flex h="100%" direction="column" position="relative" px={4} py={4}>
        <Text
          fontSize="10px"
          color="brand.400"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.14em"
        >
          {game.label}
        </Text>

        <Flex mt="auto" mb={4} direction="column" gap={0.5} w="74%" maxW="74%">
          {[game.away, game.home].map((team) => (
            <Flex key={team.exportId} align="baseline" justify="space-between" gap={3}>
              <Text
                fontSize="clamp(1.45rem, 3.45vw, 2.18rem)"
                color="white"
                fontWeight="black"
                textTransform="uppercase"
                lineHeight={0.86}
                letterSpacing="-0.02em"
              >
                {compactLabel(team)}
              </Text>
              <Text
                fontSize="clamp(0.95rem, 1.95vw, 1.25rem)"
                color="whiteAlpha.900"
                fontWeight="black"
                lineHeight={1}
              >
                {team.score}
              </Text>
            </Flex>
          ))}
        </Flex>

        <Flex align="center" gap={2} maxW="78%">
          <Box h="2px" w="22px" bg="brand.500" flexShrink={0} />
          <Text
            fontSize="clamp(0.62rem, 1vw, 0.75rem)"
            color="text.secondary"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.03em"
            lineHeight={1.25}
            lineClamp={3}
          >
            {game.player.name} {game.player.line}
          </Text>
        </Flex>
      </Flex>
    </Box>
  </Box>
);
