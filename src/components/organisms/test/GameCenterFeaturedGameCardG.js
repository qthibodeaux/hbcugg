import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  MVP_LINE_BY_GAME,
  TeamWatermark,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardG = ({ game }) => {
  const awayAccent = game.away.team?.colors?.primary ?? "#2a2a2f";
  const homeAccent = game.home.team?.colors?.primary ?? "#3a3a42";

  return (
    <CardFrame game={game} accent={awayAccent}>
      <Box position="relative" h="100%">
        <TeamWatermark side={game.away} size="124px" top="24px" left="-10px" rotate="-12deg" opacity={0.15} />
        <TeamWatermark side={game.home} size="124px" top="18px" right="-8px" rotate="10deg" opacity={0.15} />

        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(90deg, ${awayAccent}2E 0%, rgba(11,11,13,0.15) 46%, ${homeAccent}26 100%)`}
          zIndex={0}
        />

        <Box position="relative" zIndex={1} h="100%">
          <CardTopline game={game} accent={awayAccent} rightLabel={game.stageLabel} />

          <Flex align="center" justify="space-between" px={4} py={5} minH="132px">
            <Text fontSize="xl" fontWeight="black" color="white" textTransform="uppercase" maxW="32%">
              {game.away.label}
            </Text>
            <Text fontSize="3xl" fontWeight="black" color="white">
              {game.state === "final" ? `${game.away.score}-${game.home.score}` : "VS"}
            </Text>
            <Text fontSize="xl" fontWeight="black" color="white" textTransform="uppercase" textAlign="right" maxW="32%">
              {game.home.label}
            </Text>
          </Flex>

          <Box px={4} pb={3}>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
              {MVP_LINE_BY_GAME[game.id]}
            </Text>
          </Box>
        </Box>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardG = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardG key={game.id} game={game} />
    ))}
  </CardGallery>
);
