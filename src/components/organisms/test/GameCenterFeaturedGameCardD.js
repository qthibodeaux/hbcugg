import { Box, Flex, Image, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  TeamMark,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardD = ({ game }) => {
  const awayAccent = game.away.team?.colors?.primary ?? "#444";
  const homeAccent = game.home.team?.colors?.primary ?? "#666";

  return (
    <CardFrame game={game} accent={awayAccent}>
      <CardTopline game={game} accent={awayAccent} />

      <Flex px={3} py={3} direction="column" gap={3}>
        <Flex justify="center" align="center" gap={3} h="96px">
          <Flex direction="column" align="center" gap={2} flex={1}>
            <Box
              w="72px"
              h="72px"
              borderRadius="22px"
              bg={`${awayAccent}28`}
              border="1px solid"
              borderColor="whiteAlpha.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image src={game.away.team?.logo} alt={game.away.label} w="56px" h="56px" objectFit="contain" />
            </Box>
            <Text fontSize="11px" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
              {game.away.label}
            </Text>
          </Flex>

          <Flex direction="column" align="center" gap={1}>
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
              {game.state === "final" ? "Final" : "Preview"}
            </Text>
            <Text fontSize="2xl" color="white" fontWeight="black">
              {game.state === "final" ? `${game.away.score}-${game.home.score}` : "VS"}
            </Text>
          </Flex>

          <Flex direction="column" align="center" gap={2} flex={1}>
            <Box
              w="72px"
              h="72px"
              borderRadius="22px"
              bg={`${homeAccent}28`}
              border="1px solid"
              borderColor="whiteAlpha.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image src={game.home.team?.logo} alt={game.home.label} w="56px" h="56px" objectFit="contain" />
            </Box>
            <Text fontSize="11px" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
              {game.home.label}
            </Text>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" px={1}>
          <Flex align="center" gap={2}>
            <TeamMark side={game.away} size="22px" />
            <Text fontSize="9px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
              Away
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Text fontSize="9px" color="text.secondary" fontWeight="bold" textTransform="uppercase">
              Home
            </Text>
            <TeamMark side={game.home} size="22px" />
          </Flex>
        </Flex>
      </Flex>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardD = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardD key={game.id} game={game} />
    ))}
  </CardGallery>
);
