import { Flex, Image, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  PLAYER_SPOTLIGHT_SAMPLES,
  TeamMark,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardF = ({ game }) => {
  const accent = game.away.team?.colors?.primary ?? game.home.team?.colors?.primary ?? "#E53E3E";
  const spotlight = PLAYER_SPOTLIGHT_SAMPLES[game.id];
  const glory = spotlight.glory;

  return (
    <CardFrame game={game} accent={accent}>
      <CardTopline game={game} accent={accent} rightLabel="Glory Player" />

      <Flex px={3} py={3} gap={3}>
        <Image
          src={glory.image}
          alt={glory.name}
          w="82px"
          h="108px"
          objectFit="cover"
          borderRadius="18px"
          border="1px solid"
          borderColor="whiteAlpha.200"
          flexShrink={0}
        />

        <Flex direction="column" minW={0} flex={1}>
          <Text fontSize="9px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em">
            {glory.position}
          </Text>
          <Text fontSize="lg" color="white" fontWeight="black" lineHeight={0.95} lineClamp={3}>
            {glory.name}
          </Text>
          <Text mt={2} fontSize="11px" color="brand.400" fontWeight="black">
            {glory.line}
          </Text>

          <Flex mt="auto" justify="space-between" align="center">
            <Flex align="center" gap={1.5}>
              <TeamMark side={game.away} size="20px" />
              <Text fontSize="9px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                {game.away.label}
              </Text>
            </Flex>
            <Text fontSize="10px" color="white" fontWeight="black">
              {game.state === "final" ? `${game.away.score}-${game.home.score}` : "Preview"}
            </Text>
            <Flex align="center" gap={1.5}>
              <Text fontSize="9px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                {game.home.label}
              </Text>
              <TeamMark side={game.home} size="20px" />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardF = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardF key={game.id} game={game} />
    ))}
  </CardGallery>
);
