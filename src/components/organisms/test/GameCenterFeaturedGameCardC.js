import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  TeamMark,
  formatGameDate,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardC = ({ game }) => {
  const accent = game.away.team?.colors?.primary ?? game.home.team?.colors?.primary ?? "#E53E3E";
  const headline =
    game.state === "final"
      ? `${game.away.label} at ${game.home.label}`
      : `${game.away.label} vs ${game.home.label}`;

  return (
    <CardFrame game={game} accent={accent}>
      <CardTopline game={game} accent={accent} rightLabel={game.stageLabel} />

      <Box px={3} py={3}>
        <Text
          fontSize="lg"
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={0.95}
          letterSpacing="-0.03em"
          lineClamp={3}
          minH="52px"
        >
          {headline}
        </Text>

        <Flex align="center" justify="space-between" mt={4}>
          <Flex direction="column" gap={2}>
            {[game.away, game.home].map((side) => (
              <Flex key={`${game.id}-${side.label}`} align="center" gap={2}>
                <TeamMark side={side} size="26px" />
                <Text fontSize="11px" fontWeight="black" color="text.secondary" textTransform="uppercase" lineClamp={1}>
                  {side.label}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Flex direction="column" align="flex-end" gap={1}>
            <Text fontSize="2xl" fontWeight="black" color="white">
              {game.state === "final" ? `${game.away.score}-${game.home.score}` : "VS"}
            </Text>
            <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase">
              {formatGameDate(game.date)}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardC = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardC key={game.id} game={game} />
    ))}
  </CardGallery>
);
