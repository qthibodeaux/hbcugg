import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { previewPath } from "../../../utils/gamePreview";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { getTeamLabelForDensity } from "../../../utils/gameCenterPayloads";

const getShortStageLabel = (label) => {
  const normalized = String(label ?? "").toLowerCase();
  if (normalized.includes("swac championship")) return "SCG";
  if (normalized.includes("celebration bowl")) return "CB";
  return label;
};

// Every dimension below is in cqw — a fraction of the card's own width. The
// card lives in a square PageShell slot, so width and height scale together and
// nothing needs a px floor or a viewport breakpoint.
const TeamMark = ({ team, label }) => (
  <Box
    w="22cqw"
    h="22cqw"
    borderRadius="5cqw"
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
      <Text fontSize="5cqw" fontWeight="black" color="white">
        {String(label ?? "TEAM").slice(0, 3).toUpperCase()}
      </Text>
    )}
  </Box>
);

export const GameCenterFeaturedGameCard = ({ game }) => {
  const { isCompact } = useLayoutDensity();
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
      h="100%"
      display="flex"
      flexDirection="column"
      containerType="inline-size"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      bg={`linear-gradient(180deg, ${accent}1F 0%, rgba(11,11,13,0.96) 44%, #0b0b0d 100%)`}
      boxShadow="0 18px 40px rgba(0,0,0,0.28)"
    >
      {/* Top bar is a quarter of the card — flex-basis, not padding — so it
          scales with the slot instead of sitting at a fixed strip height. */}
      <Flex
        align="center"
        justify="space-between"
        gap="2cqw"
        px="5cqw"
        flex="0 0 25%"
        minH={0}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg={`${accent}21`}
      >
        <Flex align="center" gap="3cqw" minW={0}>
          <Box px="3cqw" py="1.5cqw" borderRadius="full" bg="whiteAlpha.200" flexShrink={0}>
            <Text
              fontSize="4.5cqw"
              fontWeight="black"
              letterSpacing="0.12em"
              color="white"
              textTransform="uppercase"
              lineHeight={1}
            >
              {isFinal ? "Final" : "Preview"}
            </Text>
          </Box>
          {game.confGame ? (
            <Text fontSize="4cqw" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1}>
              Conf
            </Text>
          ) : null}
        </Flex>
        <Text fontSize="4cqw" color="text.secondary" textTransform="uppercase" fontWeight="bold" letterSpacing="0.06em" lineHeight={1.15} lineClamp={2} textAlign="right" minW={0}>
          {getShortStageLabel(game.stageLabel)}
        </Text>
      </Flex>

      {/* Matchup — two rows split whatever height the top bar and footer leave. */}
      <Flex direction="column" gap="2cqw" px="5cqw" py="2cqw" flex={1} minH={0} justify="center">
        {[game.away, game.home].map((side, index) => {
          const isWinner =
            isFinal &&
            ((index === 0 && Number(game.awayScore) > Number(game.homeScore)) ||
              (index === 1 && Number(game.homeScore) > Number(game.awayScore)));

          return (
            <Flex key={`${game.id}-${side.label}`} align="center" justify="space-between" gap="3cqw" flex={1} minH={0}>
              <Flex align="center" gap="3cqw" minW={0}>
                <TeamMark team={side} label={side.label} />
                {/* Full names wrap (up to three lines) instead of cutting off. */}
                <Text
                  fontSize="6cqw"
                  fontWeight="black"
                  color={isWinner ? "white" : "text.secondary"}
                  textTransform="uppercase"
                  lineClamp={3}
                  lineHeight={1}
                  letterSpacing="-0.01em"
                  overflowWrap="anywhere"
                >
                  {getTeamLabelForDensity(side, { compact: isCompact })}
                </Text>
              </Flex>
              <Text
                fontSize="14cqw"
                lineHeight={1}
                fontWeight="black"
                color={isWinner ? "white" : "whiteAlpha.700"}
                flexShrink={0}
              >
                {isFinal ? side.score : "—"}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex direction="column" gap="1cqw" px="5cqw" pb="3.5cqw" flexShrink={0}>
        <Text fontSize="4.5cqw" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineClamp={3} lineHeight={1.2}>
          {game.supportingLine}
        </Text>
        <Text fontSize="4cqw" color="text.muted" lineClamp={1} lineHeight={1.2}>
          {game.dateLabel}
        </Text>
      </Flex>
    </Box>
  );

  return linkTo ? (
    <Box as={Link} to={linkTo} display="block" h="100%">
      {content}
    </Box>
  ) : (
    content
  );
};
