import { Box, Flex, Image, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  PLAYER_SPOTLIGHT_SAMPLES,
} from "./GameCenterFeaturedGameCardShared";

const PlayerPanel = ({ player, align = "left" }) => (
  <Flex direction="column" align={align === "left" ? "flex-start" : "flex-end"} gap={1} flex={1} minW={0}>
    <Image
      src={player.image}
      alt={player.name}
      w="100%"
      h="74px"
      objectFit="cover"
      borderRadius="14px"
      border="1px solid"
      borderColor="whiteAlpha.200"
    />
    <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase">
      {player.position}
    </Text>
    <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
      {player.name}
    </Text>
    <Text fontSize="10px" color="brand.400" fontWeight="black">
      {player.production != null ? `${player.production.toFixed(2)} prod` : "Preview"}
    </Text>
  </Flex>
);

const FeaturedCardE = ({ game }) => {
  const accent = game.home.team?.colors?.primary ?? game.away.team?.colors?.primary ?? "#E53E3E";
  const key = game.id;
  const spotlight = PLAYER_SPOTLIGHT_SAMPLES[key];

  return (
    <CardFrame game={game} accent={accent}>
      <CardTopline game={game} accent={accent} rightLabel={game.state === "final" ? "QB vs QB" : "Glory Watch"} />

      <Box px={3} py={3}>
        <Flex align="flex-start" gap={2}>
          <PlayerPanel player={spotlight.awayPlayer} />
          <Flex direction="column" align="center" justify="center" pt={3}>
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase">
              VS
            </Text>
          </Flex>
          <PlayerPanel player={spotlight.homePlayer} align="right" />
        </Flex>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardE = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardE key={game.id} game={game} />
    ))}
  </CardGallery>
);
