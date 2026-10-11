import React from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";

const LEGACY_STATS = [
  ["18", "Programs"],
  ["2", "Conferences"],
  ["10", "Bowl Games"],
  ["150+", "Years"],
];

export const ConferenceWikiBanner = () => (
  <Box
    h="full"
    w="full"
    minW={0}
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(100deg, rgba(111,38,51,0.64) 0%, rgba(9,9,11,0.98) 42%, rgba(75,0,130,0.86) 100%)"
    position="relative"
    _before={{
      content: '""',
      position: "absolute",
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: "4px",
      bg: "#FFD100",
      opacity: 0.9,
    }}
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text
        position="absolute"
        left="11%"
        bottom="-28px"
        fontSize="clamp(6rem, 15vw, 13rem)"
        fontWeight="black"
        color="white"
        opacity={0.035}
        lineHeight={0.78}
        letterSpacing="-0.08em"
      >
        SWAC
      </Text>
      <Text
        position="absolute"
        right="3%"
        top="-38px"
        fontSize="clamp(6rem, 15vw, 13rem)"
        fontWeight="black"
        color="white"
        opacity={0.055}
        lineHeight={0.78}
        letterSpacing="-0.08em"
      >
        MEAC
      </Text>
    </Box>

    <Flex h="100%" align="center" justify="space-between" gap={{ base: 5, lg: 7 }} px={{ base: 5, lg: 7 }} position="relative">
      <Box w={{ base: "45%", lg: "36%" }} minW={0}>
        <Text
          fontSize="clamp(2.35rem, 4.6vw, 4.4rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          lineHeight={0.8}
          textTransform="uppercase"
          letterSpacing="-0.045em"
        >
          Conference
          <br />
          Wiki
        </Text>
        <Text mt={2} maxW="340px" fontSize="xs" color="text.secondary" lineHeight={1.28} lineClamp={4}>
          Two conferences, eighteen programs, one football culture: the rivalries, title roads,
          classics, and stages that define the HBCU game.
        </Text>
      </Box>

      <SimpleGrid columns={4} gap={3} flex={1} maxW="520px" flexShrink={0}>
        {LEGACY_STATS.map(([value, label]) => (
          <Box
            key={label}
            border="1px solid"
            borderColor="whiteAlpha.100"
            bg="rgba(0,0,0,0.22)"
            borderRadius="8px"
            px={{ base: 2, lg: 3 }}
            py={{ base: 2, lg: 3 }}
            minW={0}
            backdropFilter="blur(2px)"
          >
            <Text fontSize={{ base: "lg", lg: "2xl" }} color="white" fontWeight="black" lineHeight={0.92} lineClamp={1}>
              {value}
            </Text>
            <Text mt={1} fontSize="7px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1.2} lineClamp={1} whiteSpace="nowrap" wordBreak="keep-all">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  </Box>
);
