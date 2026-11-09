import { Flex, Box, Text, Image } from "@chakra-ui/react";
import { SectionLabel } from "./StatusPrimitives";
import { RECENT_RESULT_COLOR } from "./statusModel";

const TeamRecordCompact = ({ team, record = {} }) => {
  const primary = team?.colors?.primary || "#1A365D";
  const secondary = team?.colors?.secondary || "#F56565";
  const overall = record.overall || record.display || "--";

  return (
    <Flex
      w="full"
      h="full"
      align="center"
      justify="space-between"
      gap={3}
      bg={primary}
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
      p={{ base: 3, lg: 4 }}
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(110deg, ${primary} 0%, rgba(11,11,13,0.84) 100%)`} />
      <Text position="absolute" right="-0.25rem" bottom="-1.1rem" fontSize="4.4rem" fontWeight="black" color="whiteAlpha.100" lineHeight={1}>
        {overall}
      </Text>
      <Box position="relative" minW={0}>
        <SectionLabel label="Season Record" color={secondary} />
        <Text mt={1} fontSize="clamp(2rem, 6vw, 3.5rem)" fontWeight="black" color="white" lineHeight={0.95}>
          {overall}
        </Text>
      </Box>
      {team?.logo && <Image src={team.logo} alt="" h="62%" maxW="28%" objectFit="contain" opacity={0.35} />}
    </Flex>
  );
};

const RecentGameRow = ({ game }) => {
  const color = RECENT_RESULT_COLOR[game.result] || "#A0AEC0";
  const prefix = game.home_away === "away" ? "@" : "vs";
  const opponent = game.opponent?.abbreviation || game.opponent?.short_name || game.opponent_name || "—";

  return (
    <Flex align="center" gap={1.5} minW={0}>
      <Box px="4px" py="1px" borderRadius="3px" bg={`${color}33`} flexShrink={0}>
        <Text fontSize="12px" fontWeight="black" color={color} lineHeight={1.3}>
          {game.result}
        </Text>
      </Box>
      <Text fontSize="12px" fontWeight="bold" color="whiteAlpha.700" flexShrink={0}>
        {prefix}
      </Text>
      <Text fontSize="12px" fontWeight="black" color="white" lineClamp={1} minW={0}>
        {opponent}
      </Text>
      <Text fontSize="12px" fontWeight="bold" color="whiteAlpha.700" ml="auto" flexShrink={0} whiteSpace="nowrap">
        {game.score_team}-{game.score_opp}
      </Text>
    </Flex>
  );
};

export const TeamRecordBlock = ({ team, record, last5 = [], variant = "standard" }) => {
  if (variant === "compact") return <TeamRecordCompact team={team} record={record} />;

  const primary = team?.colors?.primary || "#1A365D";
  const secondary = team?.colors?.secondary || "#F56565";
  const overall = record?.overall || record?.display || "--";
  const rank = record?.rank || `${team?.conference || "HBCU"} ${team?.division || "football"}`;

  // MEAC plays its conference slate later in the season than SWAC, so a team
  // can have real overall games but zero conference games played yet.
  // Conference record only becomes the headline number once it exists;
  // until then the card just shows the overall record like it always did.
  const confWins = record?.conference_wins;
  const confLosses = record?.conference_losses;
  const hasConferenceRecord = Number(confWins ?? 0) + Number(confLosses ?? 0) > 0;
  const headline = hasConferenceRecord ? `${confWins}-${confLosses}` : overall;
  const subline = hasConferenceRecord ? `${overall} overall` : "Conference play pending";

  return (
    <Box
      w="full"
      h="full"
      bg={primary}
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(110deg, ${primary} 0%, rgba(11,11,13,0.7) 100%)`} />
      <Text
        position="absolute"
        right="-0.5rem"
        bottom="-1.5rem"
        fontSize="clamp(5rem, 12vw, 8rem)"
        fontWeight="black"
        color="whiteAlpha.100"
        lineHeight={1}
        pointerEvents="none"
      >
        {headline}
      </Text>
      <Flex position="relative" zIndex={1} h="full" p={{ base: 4, lg: 5 }} gap={3}>
        <Flex flex={1} direction="column" justify="space-between" minW={0}>
          <Box minW={0}>
            <SectionLabel label={hasConferenceRecord ? "Conference Record" : "Season Record"} color={secondary} />
            <Text mt={2} fontSize="clamp(2.75rem, 8vw, 4.6rem)" fontWeight="black" color="white" lineHeight={0.9}>
              {headline}
            </Text>
            <Text mt={2} fontSize={{ base: "14px", lg: "18px" }} fontWeight="bold" color="whiteAlpha.800" lineClamp={1}>
              {subline}
            </Text>
          </Box>

          <Box
            w="full"
            px={3}
            py={2}
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="6px"
            minW={0}
          >
            <Text fontSize={{ base: "12px", lg: "15px" }} fontWeight="black" color={secondary} textTransform="uppercase" lineClamp={1}>
              {rank}
            </Text>
          </Box>
        </Flex>

        {last5.length > 0 && (
          <Flex flex={1} direction="column" gap={1.5} minW={0} pl={3} borderLeft="1px solid" borderColor="whiteAlpha.150">
            <Text fontSize={{ base: "11px", lg: "13px" }} fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.12em">
              Last 5
            </Text>
            <Flex direction="column" gap={1} justify="center" flex={1}>
              {last5.map((game) => (
                <RecentGameRow key={game.game_id || `${game.date}-${game.opponent_id}`} game={game} />
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
