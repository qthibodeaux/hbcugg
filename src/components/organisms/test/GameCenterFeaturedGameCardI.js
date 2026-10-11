import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  MVP_LINE_BY_GAME,
  TeamWatermark,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardI = ({ game }) => {
  const awayAccent = game.away.team?.colors?.primary ?? "#2a2a2f";
  const homeAccent = game.home.team?.colors?.primary ?? "#3a3a42";

  return (
    <CardFrame game={game} accent={awayAccent}>
      <Box position="relative" h="100%">
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(135deg, ${awayAccent}2A 0%, rgba(11,11,13,0.94) 42%, ${homeAccent}26 100%)`}
          zIndex={0}
        />
        <TeamWatermark side={game.away} size="150px" top="10px" left="-20px" rotate="-8deg" opacity={0.11} />
        <TeamWatermark side={game.home} size="150px" top="18px" right="-24px" rotate="8deg" opacity={0.11} />

        <Box position="relative" zIndex={1} h="100%">
          <CardTopline game={game} accent={awayAccent} rightLabel={game.state === "final" ? "Broadcast" : "Preview"} />

          <Flex align="center" justify="space-between" px={4} py={4} minH="128px">
            <Flex direction="column" gap={1} maxW="28%">
              <Text fontSize="11px" color="text.muted" fontWeight="bold" textTransform="uppercase">
                Away
              </Text>
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
                {game.away.label}
              </Text>
            </Flex>

            <Flex direction="column" align="center">
              <Text fontSize="3xl" color="white" fontWeight="black" lineHeight={1}>
                {game.state === "final" ? `${game.away.score}  {game.home.score}` : "VS"}
              </Text>
              <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase">
                Center Score
              </Text>
            </Flex>

            <Flex direction="column" gap={1} maxW="28%" align="flex-end">
              <Text fontSize="11px" color="text.muted" fontWeight="bold" textTransform="uppercase">
                Home
              </Text>
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" textAlign="right" lineHeight={0.95}>
                {game.home.label}
              </Text>
            </Flex>
          </Flex>

          <Box px={4} pb={3}>
            <Box px={3} py={2} borderRadius="full" bg="whiteAlpha.100" w="fit-content">
              <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>
                {MVP_LINE_BY_GAME[game.id]}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardI = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardI key={game.id} game={game} />
    ))}
  </CardGallery>
);
