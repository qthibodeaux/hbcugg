import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { previewPath } from "../../../utils/gamePreview";

// Everything sizes off the card's width (the card is an inline-size container),
// floored in rem for a narrow phone and capped for a tablet:
// clamp(min, share of card, max).
const SZ = {
  mark: "clamp(2.2rem, 22cqw, 4.5rem)",
  name: "clamp(0.95rem, 9cqw, 1.8rem)",
  score: "clamp(1.6rem, 16cqw, 3.2rem)",
  small: "clamp(0.6rem, 4.2cqw, 0.95rem)",
  pad: "clamp(0.65rem, 4cqw, 1.1rem)",
  rowGap: "clamp(0.7rem, 5cqw, 1.3rem)",
  inGap: "clamp(0.5rem, 3.5cqw, 0.9rem)",
};

const TeamMark = ({ team, label }) => (
  <Box
    w={SZ.mark}
    h={SZ.mark}
    borderRadius="0"
    bg="whiteAlpha.100"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
    flexShrink={0}
    border="1px solid"
    borderColor="whiteAlpha.200"
  >
    {team?.logo ? (
      <Image src={team.logo} alt={label} w="74%" h="74%" objectFit="contain" />
    ) : (
      <Text fontSize="0.55rem" fontWeight="black" color="white">
        {String(label ?? "TM").slice(0, 3).toUpperCase()}
      </Text>
    )}
  </Box>
);

// Square mobile game card — separate build from GameCenterFeaturedGameCard
// (the desktop card is a tall two-row list shape, not square). Sizes with
// aspect-ratio + container units (SZ) so the card AND its contents scale with
// its grid cell, no fixed px.
export const GameCenterFeaturedGameCardMobile = ({ game }) => {
  if (!game) return null;

  const accent = game.home?.primary ?? game.away?.primary ?? "#E53E3E";
  const isFinal = game.status === "final";
  // A played game opens its game page; an upcoming one has no game file, so it
  // opens the preview page, keyed on the schedule's game_id.
  const linkTo = game.gamePathId
    ? `/game/${encodeURIComponent(game.gamePathId)}`
    : game.status !== "final" && game.id ? previewPath(game.id) : null;

  const content = (
    <Box
      w="full"
      aspectRatio="1"
      containerType="inline-size"
      display="flex"
      flexDirection="column"
      borderRadius="0"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      bg={`linear-gradient(160deg, ${accent}33 0%, rgba(11,11,13,0.96) 55%, #0b0b0d 100%)`}
    >
      {/* Header — thin, low-weight strip. minW=0 on the label lets it truncate instead
          of fighting the pill for space (long labels like "Cross-Division Showdown"
          were overflowing/crowding the pill before). */}
      <Flex flexShrink={0} align="center" justify="space-between" gap="0.4rem" px={SZ.pad} py="clamp(0.5rem, 3cqw, 0.85rem)">
        <Box flexShrink={0} px="0.4rem" py="0.1rem" borderRadius="0" bg="whiteAlpha.200">
          <Text fontSize={SZ.small} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em">
            {isFinal ? "Final" : "Preview"}
          </Text>
        </Box>
        <Text fontSize={SZ.small} fontWeight="bold" color="text.secondary" textTransform="uppercase" lineClamp={1} minW={0} textAlign="right">
          {game.stageLabel}
        </Text>
      </Flex>

      {/* Body — the two team rows. flex=1 so this section, not the header/footer, owns the square. */}
      <Flex flex="1" minH={0} direction="column" justify="center" gap={SZ.rowGap} px={SZ.pad}>
        {[game.away, game.home].map((side, index) => {
          const isWinner =
            isFinal &&
            ((index === 0 && Number(game.awayScore) > Number(game.homeScore)) ||
              (index === 1 && Number(game.homeScore) > Number(game.awayScore)));

          return (
            <Flex key={`${game.id}-${side.label}`} align="center" justify="space-between" gap={SZ.inGap}>
              <Flex align="center" gap={SZ.inGap} minW={0}>
                <TeamMark team={side} label={side.label} />
                <Text
                  fontSize={SZ.name}
                  fontWeight="black"
                  color={isWinner ? "white" : "text.secondary"}
                  textTransform="uppercase"
                  lineClamp={1}
                >
                  {side.label}
                </Text>
              </Flex>
              <Text fontSize={SZ.score} fontWeight="black" lineHeight={1} color={isWinner ? "white" : "whiteAlpha.700"}>
                {isFinal ? side.score : "—"}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      {/* Footer — thin, low-weight strip, matches the header's proportions. */}
      <Box flexShrink={0} px={SZ.pad} py="clamp(0.5rem, 3cqw, 0.85rem)">
        <Text fontSize={SZ.small} color="text.muted" lineClamp={1}>
          {game.dateLabel}
        </Text>
      </Box>
    </Box>
  );

  return linkTo ? (
    <Box as={Link} to={linkTo} display="block">
      {content}
    </Box>
  ) : (
    content
  );
};
