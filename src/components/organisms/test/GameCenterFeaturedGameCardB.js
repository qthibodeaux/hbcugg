import { Box, Flex, Text } from "@chakra-ui/react";
import {
  CardFrame,
  CardGallery,
  CardTopline,
  FEATURED_GAME_CARD_SAMPLES,
  TeamMark,
  formatGameDate,
} from "./GameCenterFeaturedGameCardShared";

const FeaturedCardB = ({ game }) => {
  const awayAccent = game.away.team?.colors?.primary ?? "#3a3a40";
  const homeAccent = game.home.team?.colors?.primary ?? "#4a4a50";

  return (
    <CardFrame game={game} accent={homeAccent}>
      <CardTopline game={game} accent={homeAccent} rightLabel={formatGameDate(game.date)} />

      <Flex direction="column" px={3} py={3} gap={3}>
        <Flex gap={2} h="72px">
          {[game.away, game.home].map((side, index) => {
            const tint = index === 0 ? awayAccent : homeAccent;
            return (
              <Box
                key={`${game.id}-${side.label}`}
                flex={1}
                borderRadius="16px"
                border="1px solid"
                borderColor="whiteAlpha.100"
                bg={`${tint}2B`}
                px={2}
                py={2}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <TeamMark side={side} size="28px" tint="blackAlpha.250" />
                  <Text fontSize="lg" fontWeight="black" color="white">
                    {game.state === "final" ? side.score : "\u2014"}
                  </Text>
                </Flex>
                <Text fontSize="10px" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
                  {side.label}
                </Text>
              </Box>
            );
          })}
        </Flex>

        <Box
          px={2.5}
          py={2}
          borderRadius="14px"
          border="1px solid"
          borderColor="whiteAlpha.100"
          bg="whiteAlpha.050"
        >
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={1}>
            Hub Readout
          </Text>
          <Text fontSize="xs" color="white" fontWeight="bold" lineClamp={2}>
            {game.state === "final"
              ? "Completed matchup with recap-ready scoreboard emphasis."
              : "Upcoming matchup with date-first preview treatment."}
          </Text>
        </Box>
      </Flex>
    </CardFrame>
  );
};

export const GameCenterFeaturedGameCardB = () => (
  <CardGallery>
    {FEATURED_GAME_CARD_SAMPLES.map((game) => (
      <FeaturedCardB key={game.id} game={game} />
    ))}
  </CardGallery>
);
