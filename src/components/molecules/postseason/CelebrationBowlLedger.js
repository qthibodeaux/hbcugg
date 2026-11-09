import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useMediaQuery, Box, Flex, Text, SimpleGrid, Image } from "@chakra-ui/react";
import { CELEBRATION_LEDGER_GAMES } from "../../../data/wiki_data";
import { MobileCelebrationBowlLedger } from "./celebration/MobileCelebrationBowlLedger";
import { CelebrationLedgerTile } from "./celebration/CelebrationLedgerTile";

export const CelebrationBowlLedger = () => {
  const { isMobile } = useLayoutDensity();
  const [isCompact] = useMediaQuery("(max-width: 1023px)");
  const filteredVisibleGames = CELEBRATION_LEDGER_GAMES.slice(0, 10); // Ensure exactly 10

  if (isMobile) return <MobileCelebrationBowlLedger />;
  const leftGames = filteredVisibleGames.slice(0, 5);
  const rightGames = filteredVisibleGames.slice(5, 10);

  if (isCompact) {
    return (
      <Box
        h="full"
        w="full"
        minW={0}
        overflow="hidden"
        borderRadius="8px"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="radial-gradient(circle at 50% 54%, rgba(255,75,0,0.14), transparent 28%), linear-gradient(90deg, rgba(11,11,13,1), rgba(15,15,18,0.98) 50%, rgba(11,11,13,1))"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          bg: "#FF4B00",
          opacity: 0.9,
        }}
      >
        <Flex h="100%" direction="column" gap={1.5} p={2} position="relative" zIndex={1}>
          <Flex align="center" flexShrink={0} minH="18px">
            <Text fontSize="md" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9} lineClamp={1}>
              Celebration Bowl Timeline
            </Text>
          </Flex>

          <Box flex={1} minH={0}>
            <SimpleGrid columns={5} gap={1} h="100%" alignItems="stretch">
              {leftGames.map((game) => <CelebrationLedgerTile key={game.year} game={game} compact />)}
            </SimpleGrid>
          </Box>

          <Box flex={1} minH={0}>
            <SimpleGrid columns={5} gap={1} h="100%" alignItems="stretch">
              {rightGames.map((game) => <CelebrationLedgerTile key={game.year} game={game} compact />)}
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="radial-gradient(circle at 50% 54%, rgba(255,120,0,0.12), transparent 45%), linear-gradient(90deg, rgba(11,11,13,1), rgba(15,15,18,0.98) 50%, rgba(11,11,13,1))"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FF4B00",
        opacity: 0.9,
      }}
    >
      {/* Background Decorative Text */}
      <Box position="absolute" inset={0} pointerEvents="none">
        <Text
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          fontSize="clamp(4rem, 15vw, 12rem)"
          color="white"
          fontWeight="black"
          opacity={0.015}
          lineHeight={0.8}
          letterSpacing="-0.07em"
        >
          ATLANTA
        </Text>
      </Box>

      <Flex h="100%" p={{ base: 2, xl: 3 }} position="relative" zIndex={1}>
        {/* LEFT 5 TILES */}
        <Box flex={1.2} minH={0}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} h="100%" alignItems="stretch">
            {leftGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} compact={isCompact} />
            ))}
          </SimpleGrid>
        </Box>

        {/* CENTER LOGO SLOT */}
        <Flex
          flex={0.6}
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
        >
          <Box mb={2}>
            <Image
              src="/assets/celebrationbowl.png"
              fallbackSrc="https://v5.airtableapps.com/v0.3/apps/app123/logos/cb.png"
              alt="Celebration Bowl"
              maxH="180px"
              objectFit="contain"
              filter="drop-shadow(0 0 12px rgba(255,75,0,0.4))"
            />
          </Box>
          <Text
            fontSize="10px"
            color="#FF4B00"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.2em"
            lineHeight={1}
            mb={1}
          >
            Championship Stage
          </Text>
          <Text
            fontSize="14px"
            color="white"
            fontWeight="black"
            textTransform="uppercase"
            lineHeight={1}
          >
            Timeline
          </Text>
        </Flex>

        {/* RIGHT 5 TILES */}
        <Box flex={1.2} minH={0}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} h="100%" alignItems="stretch">
            {rightGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} compact={isCompact} />
            ))}
          </SimpleGrid>
        </Box>
      </Flex>
    </Box>
  );
};
