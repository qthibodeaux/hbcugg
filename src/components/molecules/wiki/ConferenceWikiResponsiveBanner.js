import { Card } from "./ConferenceWikiCard";
import { Box, Text, Flex, SimpleGrid } from "@chakra-ui/react";
import { BannerTitleArea, BannerControlStrip, BannerGhostWord } from "../../organisms/BannerControls";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// Existing implementation extracted along responsibility boundaries.

export const LEGACY_STATS = [
  ["18", "Programs"],
  ["2", "Conferences"],
  ["10", "Bowl Games"],
  ["150+", "Years"],
  ["1000+", "NFL alumni lineage"],
  ["47 of 48", "SWAC FCS attendance-leading seasons"],
];

const ConferenceWikiBannerStandard = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(100deg, rgba(111,38,51,0.7) 0%, rgba(11,11,13,0.96) 38%, rgba(75,0,130,0.72) 100%)"
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text position="absolute" left="2%" bottom="-28px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        SWAC
      </Text>
      <Text position="absolute" right="2%" top="-34px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        MEAC
      </Text>
    </Box>
    <Flex h="100%" align="center" justify="space-between" gap={8} px={{ base: 5, lg: 9 }} position="relative">
      <Box flex={1}>
        <Text
          fontSize="clamp(2.3rem, 4.5vw, 4.8rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          lineHeight={0.8}
          textTransform="uppercase"
        >
          Conference Wiki
        </Text>
        <Text mt={2} maxW="720px" fontSize="xs" color="text.secondary" lineHeight={1.4} lineClamp={2}>
          Two conferences, eighteen programs, one football culture: the rivalries, title roads,
          classics, and stages that define the HBCU game.
        </Text>
      </Box>
      <SimpleGrid columns={4} gap={3} w={{ base: "auto", lg: "480px" }}>
        {LEGACY_STATS.slice(0, 4).map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" bg="rgba(0,0,0,0.25)" borderRadius="8px" p={2}>
            <Text fontSize="xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={0.5} fontSize="7px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1} whiteSpace="nowrap" wordBreak="keep-all">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  </Card>
);

const COMPACT_LEGACY_STATS = [
  ["18", "Programs"],
  ["2", "Conferences"],
  ["10", "Bowl Games"],
  ["150+", "Years"],
];

const ConferenceWikiBannerCompact = () => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={WIKI_GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text
        position="absolute"
        left="14%"
        bottom="-18px"
        fontSize="clamp(4.8rem, 14vw, 9rem)"
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
        right="2%"
        top="-28px"
        fontSize="clamp(4.8rem, 14vw, 9rem)"
        fontWeight="black"
        color="white"
        opacity={0.06}
        lineHeight={0.78}
        letterSpacing="-0.08em"
      >
        MEAC
      </Text>
    </Box>

    <BannerTitleArea>
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Conference Wiki
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip justify="flex-start">
      {COMPACT_LEGACY_STATS.map(([value, label]) => (
        <Box
          key={label}
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          px="0.75rem"
          py="0.4rem"
        >
          <Text fontSize="md" fontWeight="black" color="white" lineHeight={1}>
            {value}
          </Text>
          <Text fontSize="9px" fontWeight="bold" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em" mt="0.1rem" whiteSpace="nowrap">
            {label}
          </Text>
        </Box>
      ))}
    </BannerControlStrip>
  </Box>
);

const WIKI_ACCENT = "#FFD100";

const WIKI_GRADIENT = "linear-gradient(100deg, rgba(111,38,51,0.78) 0%, rgba(9,9,11,0.98) 45%, rgba(75,0,130,0.86) 100%)";

const MOBILE_WIKI_STATS = [
  ["18", "Programs"],
  ["2", "Conf"],
  ["10", "Bowls"],
  ["150+", "Years"],
];

const MobileConferenceWikiBanner = () => (
  <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
    <Box
      position="relative"
      overflow="hidden"
      h="var(--app-header-height)"
      flexShrink={0}
      bg={WIKI_GRADIENT}
      display="flex"
      flexDirection="column"
    >
      <BannerTitleArea>
        <BannerGhostWord text="WIKI" />
        <Box position="relative" zIndex={1}>
          <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
            Conference Wiki
          </Text>
        </Box>
      </BannerTitleArea>
    </Box>

    <MobileSectionSwitcher accent={WIKI_ACCENT} />

    <Flex align="stretch" borderTop="1px solid" borderColor="whiteAlpha.100">
      {MOBILE_WIKI_STATS.map(([value, label], index) => (
        <Flex
          key={label}
          direction="column"
          align="center"
          justify="center"
          flex="1"
          py="0.5rem"
          borderLeft={index === 0 ? "none" : "1px solid"}
          borderColor="whiteAlpha.100"
        >
          <Text fontSize="1.1rem" fontWeight="black" color="white" lineHeight={1}>
            {value}
          </Text>
          <Text fontSize="0.55rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.06em" mt="0.15rem" lineClamp={1}>
            {label}
          </Text>
        </Flex>
      ))}
    </Flex>
  </Box>
);

export const ConferenceWikiBanner = ({ variant = "standard" }) => {
  const { isMobile } = useLayoutDensity();
  if (isMobile) return <MobileConferenceWikiBanner />;
  if (variant === "compact") return <ConferenceWikiBannerCompact />;
  return <ConferenceWikiBannerStandard />;
};
