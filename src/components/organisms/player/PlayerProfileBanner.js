import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobilePlayerProfileBanner } from "./profileBanner/MobilePlayerProfileBanner";
import { Box, Text, Flex } from "@chakra-ui/react";
import { BannerAvatar, TagPill } from "./profileBanner/BannerIdentity";

const PlayerProfileBanner = ({
  player,
  teamMeta,
  imageUrl,
  imgErr,
  onImgErr,
  firstName,
  lastName,
  gloryRating,
  ratingLabel = "Glory Rating",
  ratingFill = gloryRating,
  ratingDisplay = gloryRating,
  ratingSuffix = "/ 100",
}) => {
  const { isMobile } = useLayoutDensity();
  const primary = teamMeta?.colors?.primary ?? "#A855F7";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";
  const shortName = teamMeta?.shortName ?? "HBCU";
  const position = player?.position ?? player?.position_abbr ?? "ATH";
  const number = player?.jersey_number != null ? `#${player.jersey_number}` : null;
  const conference = teamMeta?.division
    ? `${teamMeta.conference} ${teamMeta.division}`.toUpperCase()
    : teamMeta?.conference ?? "HBCU";
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary}66 18%, #17171c 52%, #0B0B0D 100%)`;
  const ghostWord = (lastName || shortName || "GLORY").toUpperCase();
  const longName = `${firstName ?? ""} ${lastName ?? ""}`.trim().length > 18;

  if (isMobile) {
    return (
      <MobilePlayerProfileBanner
        imageUrl={imageUrl}
        imgErr={imgErr}
        onImgErr={onImgErr}
        lastName={lastName}
        gloryRating={gloryRating}
        ratingLabel={ratingLabel}
        ratingDisplay={ratingDisplay}
        primary={primary}
        secondary={secondary}
        position={position}
        number={number}
        shortName={shortName}
      />
    );
  }

  return (
    <Box
      w="full"
      h="full"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={gradient}
    >
      <style>{`
        @keyframes playerGhostScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes playerHeadlineDrift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-4%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <Box
        position="absolute"
        bottom="-18px"
        left="0"
        pointerEvents="none"
        userSelect="none"
        style={{ animation: "playerGhostScroll 18s linear infinite" }}
        whiteSpace="nowrap"
      >
        {[0, 1].map((i) => (
          <Text
            key={i}
            as="span"
            textStyle="bannerGhost"
            color="white"
            opacity={0.05}
            pr="80px"
          >
            {ghostWord}
          </Text>
        ))}
      </Box>

      <Flex h="full" align="stretch">
        <BannerAvatar imageUrl={imageUrl} imgErr={imgErr} onImgErr={onImgErr} primary={primary} />

        <Flex flex={1} align="center" pl={{ base: 4, md: 7 }} pr={{ base: 4, md: 6 }} minW={0} overflow="hidden">
          <Box minW={0} overflow="hidden">
            <Box
              minW={0}
              style={longName ? { animation: "playerHeadlineDrift 14s ease-in-out infinite" } : undefined}
            >
              {firstName ? (
                <Text textStyle="bannerHeadline" color="white" whiteSpace="nowrap">
                  {firstName}
                </Text>
              ) : null}
              <Text textStyle="bannerHeadline" color="white" whiteSpace="nowrap">
                {lastName || shortName}
              </Text>
            </Box>

            <Flex align="center" gap={2} mt={3} flexWrap="wrap">
              <TagPill label={shortName} school primary={primary} secondary={secondary} />
              <TagPill label={position} primary={primary} secondary={secondary} />
              <TagPill label={conference} primary={primary} secondary={secondary} />
              {number ? <TagPill label={number} primary={primary} secondary={secondary} /> : null}
            </Flex>
          </Box>
        </Flex>

        <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} display={{ base: "none", md: "block" }} />

        <Flex
          direction="column"
          justify="center"
          align="center"
          px={{ base: 4, md: 8, lg: 10 }}
          py={{ base: 4, md: 0 }}
          flexShrink={0}
          minW={{ base: "120px", md: "180px" }}
          gap={1}
          display={{ base: "none", md: "flex" }}
        >
          <Text textStyle="panelLabel" color="rgba(255,255,255,0.35)" mb={1}>
            {ratingLabel}
          </Text>
          <Box
            position="relative"
            w={{ base: "160px", md: "200px", lg: "230px" }}
            h={{ base: "80px", md: "100px", lg: "115px" }}
            flexShrink={0}
          >
            <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: "visible", display: "block" }}>
              <path d="M10,95 A90,90 0 0 1 190,95" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" strokeLinecap="round" />
              <path
                d="M10,95 A90,90 0 0 1 190,95"
                fill="none"
                stroke={primary}
                strokeWidth="14"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={100 - Math.min(100, Math.max(0, ratingFill ?? 0))}
                style={{ transition: "stroke-dashoffset 0.6s ease", filter: `drop-shadow(0 0 6px ${primary}aa)` }}
              />
            </svg>
            <Flex position="absolute" inset={0} direction="column" align="center" justify="flex-end" pb={{ base: "2px", md: "4px" }}>
              <Text textStyle="heroStat" fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} color="white" lineHeight={1}>
                {ratingDisplay ?? "--"}
              </Text>
              <Text textStyle="statLabel" color="rgba(255,255,255,0.35)">
                {ratingSuffix}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PlayerProfileBanner;
