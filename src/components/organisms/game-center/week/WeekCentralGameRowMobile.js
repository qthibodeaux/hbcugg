import { Box, Flex, Image, Text } from "@chakra-ui/react";

// Team row — logo ghosted large and faded behind the name/score instead of a
// small icon box, so the name gets the row's full width. Same idea as the
// existing WatermarkLogo in WeekCentralGameRowJ.js, just anchored per-row for
// a stacked layout instead of per-side of a single horizontal row. The
// background carries that same team's own color as a fading tint — the
// original component's away/home color-coded gradient, translated from a
// left/right split to a top-row/bottom-row split.
const TeamGhostRow = ({ team, score, hasScore, isWinner, selected }) => (
  <Box
    position="relative"
    overflow="hidden"
    px="0.75rem"
    py="0.5rem"
    bg={selected ? "transparent" : `linear-gradient(90deg, ${team?.color ?? "#27272A"}2E 0%, transparent 65%)`}
  >
    {team?.logo && (
      <Image
        src={team.logo}
        alt=""
        position="absolute"
        left="-1rem"
        top="50%"
        transform="translateY(-50%)"
        w="5rem"
        h="5rem"
        objectFit="contain"
        opacity={0.16}
        pointerEvents="none"
      />
    )}
    <Flex align="center" justify="space-between" position="relative" zIndex={1} gap="0.5rem">
      <Text fontSize="1rem" fontWeight="black" color={isWinner ? "white" : "whiteAlpha.700"} textTransform="uppercase" lineClamp={1} minW={0}>
        {team?.shortName ?? team?.name ?? "TEAM"}
      </Text>
      <Text fontSize="1.5rem" fontWeight="black" lineHeight={1} color={isWinner ? "white" : "whiteAlpha.700"} flexShrink={0}>
        {hasScore ? score : "—"}
      </Text>
    </Flex>
  </Box>
);

// Mobile Week Central list row — separate build from WeekCentralGameRowJ's
// compact variant, which lays teams out horizontally (logo/name/score/name/logo)
// and had no room left for team names at mobile column widths (~150px). This
// stacks away-over-home instead, so each team gets the row's full width.
export const WeekCentralGameRowMobile = ({ row, selected, onClick, highlightColor, highlightAccent }) => {
  const hasScore = row.awayScore != null && row.homeScore != null;
  const awayWinner = hasScore && row.awayScore > row.homeScore;
  const homeWinner = hasScore && row.homeScore > row.awayScore;
  const fillColor = highlightColor ?? row.away?.color ?? "#E53E3E";
  const borderAccent = highlightAccent ?? fillColor;

  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      w="full"
      textAlign="left"
      border={selected ? "0.125rem solid" : "0.0625rem solid"}
      borderColor={selected ? borderAccent : "whiteAlpha.100"}
      borderRadius="0"
      bg={selected ? fillColor : "#111114"}
      overflow="hidden"
      outline="none"
    >
      <Flex align="center" justify="space-between" px="0.75rem" pt="0.6rem">
        <Box px="0.4rem" py="0.1rem" borderRadius="0" bg="whiteAlpha.200" flexShrink={0}>
          <Text fontSize="0.55rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em">
            {row.status}
          </Text>
        </Box>
        <Text fontSize="0.55rem" fontWeight="bold" color="text.secondary" textTransform="uppercase" lineClamp={1} minW={0} textAlign="right">
          {row.gameName}
        </Text>
      </Flex>

      <Box py="0.3rem">
        <TeamGhostRow team={row.away} score={row.awayScore} hasScore={hasScore} isWinner={awayWinner} selected={selected} />
        <Box h="0.0625rem" bg="whiteAlpha.100" mx="0.75rem" />
        <TeamGhostRow team={row.home} score={row.homeScore} hasScore={hasScore} isWinner={homeWinner} selected={selected} />
      </Box>

      <Box px="0.75rem" pb="0.6rem">
        <Text fontSize="0.55rem" color="text.muted" lineClamp={1}>
          {row.displayVenue}
        </Text>
      </Box>
    </Box>
  );
};
