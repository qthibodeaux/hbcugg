import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { CELEBRATION_LEDGER_GAMES } from "../../../../data/wiki_data";
import { CelebrationLedgerTile } from "./CelebrationLedgerTile";

// Mobile championship header and horizontal game-card filmstrip.

export const MobileCelebrationBowlLedger = () => (
  <Box
    overflow="hidden"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="radial-gradient(circle at 50% 20%, rgba(255,120,0,0.14), transparent 45%), linear-gradient(180deg, rgba(11,11,13,1), rgba(15,15,18,0.98))"
    position="relative"
    borderTop="3px solid"
    borderTopColor="#FF4B00"
  >
    <Flex direction="column" align="center" py="0.85rem" gap="0.15rem">
      <Image
        src="/assets/celebrationbowl.png"
        fallbackSrc="https://v5.airtableapps.com/v0.3/apps/app123/logos/cb.png"
        alt="Celebration Bowl"
        maxH="4.5rem"
        objectFit="contain"
        filter="drop-shadow(0 0 12px rgba(255,75,0,0.4))"
      />
      <Text fontSize="0.6rem" color="#FF4B00" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" lineHeight={1}>
        Championship Stage
      </Text>
      <Text fontSize="0.85rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
        Timeline
      </Text>
    </Flex>

    <Flex overflowX="auto" gap="0.6rem" px="0.75rem" pb="0.85rem" style={{ scrollSnapType: "x mandatory" }}>
      {CELEBRATION_LEDGER_GAMES.map((game) => (
        <Box key={game.year} flexShrink={0} w="82%" style={{ scrollSnapAlign: "center" }}>
          <CelebrationLedgerTile game={game} mobile />
        </Box>
      ))}
    </Flex>
  </Box>
);
