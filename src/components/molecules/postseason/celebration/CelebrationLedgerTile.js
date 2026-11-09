import { MEAC, CELEBRATION_TEAM_COLORS } from "../../../../data/wiki_data";
import { Box, Text, Flex, Image } from "@chakra-ui/react";

// One historical game in compact, mobile or desktop presentation.
// Keep the density-specific sizes separate so mobile changes do not alter desktop tiles.

export const CelebrationLedgerTile = ({ game, compact = false, mobile = false }) => {
  const winnerColor = game.winner === "MEAC" ? MEAC.colors.secondary : "#E53E3E";
  const winnerBg =
    game.winner === "MEAC"
      ? "linear-gradient(135deg, rgba(255,209,0,0.18), rgba(11,11,13,0.96))"
      : "linear-gradient(135deg, rgba(229,62,62,0.2), rgba(11,11,13,0.96))";
  const meacWon = game.winner === "MEAC";
  const teamColor = CELEBRATION_TEAM_COLORS[game.winnerAbbrev] || winnerColor;

  if (compact) {
    return (
      <Box
        minW={0}
        borderRadius="8px"
        bg="rgba(11,11,13,0.92)"
        border="1px solid"
        borderColor={`${winnerColor}66`}
        borderLeft="3px solid"
        borderLeftColor={winnerColor}
        position="relative"
        overflow="hidden"
        h="full"
        px={1.5}
        py={1}
      >
        <Text fontSize="10px" color={winnerColor} fontWeight="black" lineHeight={1} mb={1}>
          {game.year}
        </Text>
        <Flex align="center" justify="space-between" gap={1} minW={0}>
          <Text fontSize="10px" color={meacWon ? winnerColor : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.meacAbbrev}
          </Text>
          <Text fontSize="11px" color={meacWon ? winnerColor : "text.muted"} fontWeight="black" lineHeight={1}>
            {game.meacScore}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between" gap={1} minW={0} mt={0.5}>
          <Text fontSize="10px" color={!meacWon ? winnerColor : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.swacAbbrev}
          </Text>
          <Text fontSize="11px" color={!meacWon ? winnerColor : "text.muted"} fontWeight="black" lineHeight={1}>
            {game.swacScore}
          </Text>
        </Flex>
      </Box>
    );
  }

  // Mobile — same hero-card content as the full desktop tile (photo, score,
  // repeat-champion badge), just sized for one full-width swipe-strip card
  // instead of a 1/5-width grid cell. We have real vertical room here since
  // this isn't boxed into a PageShell row unit, so the card gets to be tall.
  if (mobile) {
    return (
      <Box
        minW={0}
        h="18rem"
        borderRadius="8px"
        bg={winnerBg}
        border="1px solid"
        borderColor={`${winnerColor}66`}
        borderLeft="4px solid"
        borderLeftColor={winnerColor}
        boxShadow={`0 0 18px ${winnerColor}14`}
        position="relative"
        overflow="hidden"
      >
        <Text position="absolute" right="-4px" top="18px" fontSize="52px" color="white" fontWeight="black" opacity={0.035} lineHeight={1}>
          {game.winner}
        </Text>
        <Box position="relative" zIndex={1} h="40%" px="0.9rem" pt="0.9rem">
          <Flex align="center" justify="space-between" gap={2} mb="0.4rem">
            <Text fontSize="1.2rem" color={winnerColor} fontWeight="black" lineHeight={1}>
              {game.year}
            </Text>
            <Text fontSize="0.6rem" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
              {game.winner}
            </Text>
          </Flex>
          <Flex align="center" justify="space-between" gap={2}>
            <Text fontSize="0.9rem" color={meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
              {game.meacAbbrev}
            </Text>
            <Text fontSize="1.15rem" color={meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
              {game.meacScore}
            </Text>
          </Flex>
          <Box h="1px" bg="whiteAlpha.100" my="0.35rem" />
          <Flex align="center" justify="space-between" gap={2}>
            <Text fontSize="0.9rem" color={!meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
              {game.swacAbbrev}
            </Text>
            <Text fontSize="1.15rem" color={!meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
              {game.swacScore}
            </Text>
          </Flex>
        </Box>

        <Box position="absolute" left={0} right={0} bottom={0} h="62%" overflow="hidden">
          <Image
            src={game.photo}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="center center"
            opacity={0.85}
            filter="contrast(1.08) saturate(1.02)"
          />
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.55) 18%, rgba(9,9,11,0.1) 44%, rgba(9,9,11,0.04) 70%, rgba(0,0,0,0.5) 100%)" />
          <Box position="absolute" inset={0} bg={`linear-gradient(0deg, ${winnerColor}22, transparent 44%)`} />
          <Text
            position="absolute"
            left="50%"
            bottom="0.5rem"
            transform="translateX(-50%)"
            w="90%"
            fontSize="1.5rem"
            color={teamColor}
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="-0.03em"
            lineHeight={0.9}
            textAlign="center"
            whiteSpace="nowrap"
            overflow="hidden"
            textShadow="0 2px 8px rgba(0,0,0,0.9)"
            lineClamp={1}
          >
            {game.winnerDisplay}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      minW={0}
      p={0}
      borderRadius="8px"
      bg={winnerBg}
      border="1px solid"
      borderColor={`${winnerColor}66`}
      borderLeft="3px solid"
      borderLeftColor={winnerColor}
      boxShadow={`0 0 18px ${winnerColor}14`}
      position="relative"
      overflow="hidden"
      h="full"
    >
      <Text
        position="absolute"
        right="-4px"
        top="18px"
        fontSize="36px"
        color="white"
        fontWeight="black"
        opacity={0.035}
        lineHeight={1}
      >
        {game.winner}
      </Text>
      <Box position="relative" zIndex={1} h="52%" px={{ base: 2, xl: 2.5 }} pt={{ base: 2, xl: 2.5 }}>
        <Flex align="center" justify="space-between" gap={2} mb={1.5}>
          <Text fontSize={{ base: "13px", xl: "15px" }} color={winnerColor} fontWeight="black" lineHeight={1}>
            {game.year}
          </Text>
          <Text fontSize={{ base: "8px", xl: "9px" }} color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
            {game.winner}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize={{ base: "11px", xl: "13px" }} color={meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.meacAbbrev}
          </Text>
          <Text fontSize={{ base: "14px", xl: "16px" }} color={meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.meacScore}
          </Text>
        </Flex>
        <Box h="1px" bg="whiteAlpha.100" my={1} />
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize={{ base: "11px", xl: "13px" }} color={!meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.swacAbbrev}
          </Text>
          <Text fontSize={{ base: "14px", xl: "16px" }} color={!meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.swacScore}
          </Text>
        </Flex>
      </Box>

      <Box position="absolute" left={0} right={0} bottom={0} h="58%" overflow="hidden">
        <Image
          src={game.photo}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center center"
          opacity={0.82}
          filter="contrast(1.08) saturate(1.02)"
        />
        <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.58) 18%, rgba(9,9,11,0.12) 46%, rgba(9,9,11,0.04) 72%, rgba(0,0,0,0.42) 100%)" />
        <Box position="absolute" inset={0} bg={`linear-gradient(0deg, ${winnerColor}22, transparent 44%)`} />
        <Text
          position="absolute"
          left="50%"
          bottom={0.25}
          transform="translateX(-50%)"
          w="82%"
          fontSize="clamp(0.9rem, 1.55vw, 1.35rem)"
          color={teamColor}
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="-0.07em"
          lineHeight={0.84}
          textAlign="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="clip"
          textShadow="0 2px 8px rgba(0,0,0,0.9)"
          lineClamp={1}
        >
          {game.winnerDisplay}
        </Text>
      </Box>
    </Box>
  );
};
