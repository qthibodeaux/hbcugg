import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { User } from "lucide-react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

// Mobile — no traditional banner. A square, full-bleed player photo leads
// the page; identity sits on a plate beneath it: a small position pill, then
// last name / jersey number on one justified row, then position / glory
// rating on the next. Modeled on inspo/sharing/roster/player.jpg.
const MobilePlayerProfileBanner = ({
  imageUrl,
  imgErr,
  onImgErr,
  lastName,
  gloryRating,
  ratingLabel = "Glory Rating",
  ratingDisplay = gloryRating,
  primary,
  secondary,
  position,
  number,
  shortName,
}) => (
  // The identity plate is absolutely positioned over the bottom of the photo
  // rather than stacked beneath it, so the photo keeps its full square and
  // the name/stat rows sit on the image like the reference.
  <Box w="full" bg="bg.secondary" position="relative" overflow="hidden">
    <Box position="relative" w="full" aspectRatio={1} bg="whiteAlpha.50" overflow="hidden">
      {imageUrl && !imgErr ? (
        <Image src={imageUrl} alt={lastName} w="100%" h="100%" objectFit="cover" objectPosition="top center" onError={onImgErr} />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <User size={64} color="var(--chakra-colors-whiteAlpha-300)" />
        </Flex>
      )}

      {/* Scrim so the overlaid text stays legible against any photo */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bg={`linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 62%, ${primary}66 82%, rgba(10,10,12,0.92) 100%)`}
      />

      <Box position="absolute" left={0} right={0} bottom={0} px="0.9rem" pb="0.75rem" zIndex={1}>
      <Flex
        display="inline-flex"
        bg={primary}
        px="0.5rem"
        py="0.15rem"
        mb="0.4rem"
        align="center"
      >
        <Text fontSize="0.6rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.12em">
          {shortName} / {position}
        </Text>
      </Flex>

      <Flex align="flex-end" justify="space-between" gap="0.75rem">
        <Text
          fontSize="clamp(1.9rem, 9vw, 2.9rem)"
          fontWeight="black"
          fontStyle="italic"
          color="white"
          textTransform="uppercase"
          letterSpacing="-0.03em"
          lineHeight="0.9"
          lineClamp={1}
          minW={0}
        >
          {lastName}
        </Text>
        {number && (
          <Text fontSize="1.5rem" fontWeight="black" fontStyle="italic" color={secondary} lineHeight="0.9" flexShrink={0}>
            {number}
          </Text>
        )}
      </Flex>

      <Flex align="flex-end" justify="space-between" gap="0.75rem" mt="0.5rem" pt="0.5rem" borderTop="1px solid" borderColor="whiteAlpha.200">
        <Box minW={0}>
          <Text fontSize="0.52rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em">
            Position
          </Text>
          <Text fontSize="1rem" fontWeight="black" color="white" textTransform="uppercase" lineHeight="1.1" lineClamp={1}>
            {position}
          </Text>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="0.52rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em">
            {ratingLabel}
          </Text>
          <Text fontSize="1.5rem" fontWeight="black" color={secondary} lineHeight="1" fontStyle="italic">
            {ratingDisplay ?? "--"}
          </Text>
        </Box>
      </Flex>
      </Box>
    </Box>
  </Box>
);

const BannerAvatar = ({ imageUrl, imgErr, onImgErr, primary }) => (
  <Box position="relative" w={{ base: "96px", md: "140px", lg: "160px" }} flexShrink={0} alignSelf="stretch">
    <Box
      position="absolute"
      inset="-2px"
      style={{
        background: `linear-gradient(to top, ${primary} 0%, ${primary}33 45%, transparent 100%)`,
        filter: "blur(6px)",
        opacity: 0.55,
      }}
      pointerEvents="none"
    />
    <Box
      w="full"
      h="full"
      overflow="hidden"
      position="relative"
      borderRight="1px solid"
      borderColor={`${primary}40`}
      bg="rgba(255,255,255,0.03)"
    >
      {imageUrl && !imgErr ? (
        <Image
          src={imageUrl}
          w="full"
          h="full"
          objectFit="cover"
          objectPosition="top center"
          onError={onImgErr}
        />
      ) : (
        <Flex
          w="full"
          h="full"
          bg={`linear-gradient(180deg, #16161a 0%, ${primary}26 100%)`}
          align="center"
          justify="center"
        >
          <User size={42} color="rgba(255,255,255,0.35)" />
        </Flex>
      )}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="60%"
        style={{ background: `linear-gradient(to top, ${primary}cc 0%, transparent 100%)` }}
        pointerEvents="none"
      />
    </Box>
  </Box>
);

const TagPill = ({ label, school, primary, secondary }) => (
  <Box
    px={2}
    py="3px"
    borderRadius="sm"
    bg={school ? secondary : "transparent"}
    border="1px solid"
    borderColor={school ? secondary : `${primary}80`}
  >
    <Text textStyle="pill" color={school ? primary : "white"}>
      {label}
    </Text>
  </Box>
);

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
