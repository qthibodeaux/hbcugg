import React from "react";
import { WikiCtx } from "./WikiCtx";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileWikiHeroBanner } from "./MobileWikiHeroBanner";
import { Box, Text, Image } from "@chakra-ui/react";
import { BannerTitleArea, BannerControlStrip } from "../BannerControls";

// Migrated onto the current banner standard: title tier on top (just the
// school name, no "EST. ... · campus nickname · city, state" kicker line,
// no motto subtitle), opaque bottom control strip below holding the 4 stat
// pills that used to float in a right-side HStack. The kicker/motto text
// didn't disappear — it moved into IdentityCard's 2x2 alongside the campus
// nickname it was already showing.
const WikiHeroBanner = () => {
  const wikiData = React.useContext(WikiCtx);
  const { isMobile } = useLayoutDensity();

  const stats = [
    { label: 'CONF. TITLES', value: (wikiData.athletics.conferenceChampionships || []).length },
    { label: 'NFL PICKS', value: wikiData.athletics.nflDraftPicks || '0' },
    { label: 'ENROLLMENT', value: wikiData.enrollment?.toLocaleString() || '[[PENDING]]' },
    { label: 'FOUNDED', value: wikiData.founded || '[[TBA]]' },
  ];

  const gradient = `linear-gradient(110deg, ${wikiData.colors.primary} 0%, ${wikiData.colors.primary} 28%, #111113 58%, #0B0B0D 100%)`;

  if (isMobile) {
    return <MobileWikiHeroBanner wikiData={wikiData} stats={stats} gradient={gradient} />;
  }

  return (
    <Box h="full" w="full" bg={gradient} position="relative" overflow="hidden" display="flex" flexDirection="column" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
      <Text
        position="absolute" top="50%" left="3%"
        transform="translateY(-50%)"
        fontSize="clamp(100px,18vw,260px)" fontWeight="black"
        color="rgba(255,255,255,0.07)" lineHeight="1"
        letterSpacing="-0.08em" userSelect="none" zIndex={0}
      >
        {wikiData.founded}
      </Text>
      {/* Corner logo — standardized to the School Schedule banner's spec:
          right="-38px", 220/300px, opacity 0.18. Every school-specific
          banner should match this instead of drifting per-component. */}
      <Image
        src={wikiData.logo}
        alt=""
        position="absolute"
        right="-38px"
        top="50%"
        transform="translateY(-50%)"
        w={{ base: '220px', xl: '300px' }}
        h={{ base: '220px', xl: '300px' }}
        objectFit="contain"
        opacity={0.18}
        pointerEvents="none"
      />

      <BannerTitleArea>
        <Box position="relative" zIndex={2}>
          <Text
            fontSize="clamp(2.6rem, 7vw, 7.5rem)" fontWeight="black" fontStyle="italic"
            letterSpacing="-0.04em" lineHeight="0.85" color="#FFFFFF"
            textTransform="uppercase" whiteSpace="nowrap"
          >
            {wikiData.name}
          </Text>
        </Box>
      </BannerTitleArea>

      <BannerControlStrip justify="flex-start">
        {stats.map((stat) => (
          <Box
            key={stat.label}
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="md"
            px="0.75rem"
            py="0.4rem"
          >
            <Text fontSize="7px" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
              {stat.label}
            </Text>
            <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1.2}>
              {stat.value}
            </Text>
          </Box>
        ))}
      </BannerControlStrip>
    </Box>
  );
};

export default WikiHeroBanner;
