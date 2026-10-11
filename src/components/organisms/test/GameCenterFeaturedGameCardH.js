import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  MVP_LINE_BY_GAME,
  TeamWatermark,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardH = ({ game }) => {
  const awayAccent = game.away.team?.colors?.primary ?? "#2a2a2f";
  const homeAccent = game.home.team?.colors?.primary ?? "#3a3a42";

  return (
    <CardFrame game={game} accent={homeAccent}>
      <Box position="relative" h="100%">
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(90deg, ${awayAccent}33 0%, rgba(8,8,10,0.92) 48%, ${homeAccent}33 100%)`}
          zIndex={0}
        />
        <TeamWatermark side={game.away} size="118px" top="38px" left="-18px" rotate="-18deg" opacity={0.12} />
        <TeamWatermark side={game.home} size="118px" top="36px" right="-18px" rotate="18deg" opacity={0.12} />

        <Box position="relative" zIndex={1} h="100%">
          <CardTopline game={game} accent={homeAccent} rightLabel="Featured Game" />

          <Flex direction="column" justify="space-between" px={4} py={4} minH="132px">
            <Flex justify="space-between" align="center">
              <Text fontSize="2xl" fontWeight="black" color="white" textTransform="uppercase">
                {game.away.label}
              </Text>
              <Text fontSize="2xl" fontWeight="black" color="whiteAlpha.800">
                {game.state === "final" ? game.away.score : "\u2014"}
              </Text>
            </Flex>

            <Box h="1px" bg="whiteAlpha.200" />

            <Flex justify="space-between" align="center">
              <Text fontSize="2xl" fontWeight="black" color="white" textTransform="uppercase">
                {game.home.label}
              </Text>
              <Text fontSize="2xl" fontWeight="black" color="whiteAlpha.800">
                {game.state === "final" ? game.home.score : "\u2014"}
              </Text>
            </Flex>
          </Flex>

          <Box px={4} pb={3}>
            <Text fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={1}>
              {MVP_LINE_BY_GAME[game.id]}
            </Text>
          </Box>
        </Box>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardH = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardH key={game.id} game={game} />
    ))}
  </CardGallery>
);
