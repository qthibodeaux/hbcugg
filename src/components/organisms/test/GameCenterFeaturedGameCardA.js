import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  TeamMark,
  formatGameDate,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardA = ({ game }) => {
  const accent = game.home.team?.colors?.primary ?? game.away.team?.colors?.primary ?? "#E53E3E";

  return (
    <CardFrame game={game} accent={accent}>
      <CardTopline game={game} accent={accent} />

      <Flex direction="column" gap={3} px={3} py={3}>
        {[game.away, game.home].map((side, index) => {
          const isWinner =
            game.state === "final" &&
            ((index === 0 && Number(game.away.score) > Number(game.home.score)) ||
              (index === 1 && Number(game.home.score) > Number(game.away.score)));

          return (
            <Flex key={`${game.id}-${side.label}`} align="center" justify="space-between" gap={3}>
              <Flex align="center" gap={2} minW={0}>
                <TeamMark side={side} />
                <Text
                  fontSize="sm"
                  fontWeight="black"
                  color={isWinner ? "white" : "text.secondary"}
                  textTransform="uppercase"
                  lineClamp={1}
                >
                  {side.label}
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="black" color={isWinner ? "white" : "whiteAlpha.700"}>
                {game.state === "final" ? side.score : "\u2014"}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      <Box mt="auto" px={3} pb={3}>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
          {formatGameDate(game.date)}
        </Text>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardA = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardA key={game.id} game={game} />
    ))}
  </CardGallery>
);
