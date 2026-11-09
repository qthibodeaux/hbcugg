import { useLayoutDensity, LAYOUT_DENSITY } from "../../../../hooks/useLayoutDensity";
import { havocOf, statNum, cleanName } from "../../../../utils/gameSummary/playerProductionModel";
import { getTeamAccent, getTeamLogoSrc, getTeamLabel } from "../../../../utils/gameSummary/teamIdentity";
import { Box, Flex, Image, HStack, Text, VStack, Grid } from "@chakra-ui/react";
import { resolveImages } from "../../../../utils/headshots";
import { CandidateImage } from "./CandidateImage";
import { EditorialCard, SectionLabel } from "./SummaryPrimitives";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

export const GameLeadersCard = ({ awayId, homeId, teamEntries, identity }) => {
  const { density } = useLayoutDensity();
  const isCompact = density === LAYOUT_DENSITY.COMPACT;

  const byTeam = (tid, key) => {
    const entry = teamEntries.find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? {};
  };

  const topOf = (obj, field) => {
    const entries = Object.values(obj || {});
    if (!entries.length) return null;
    return [...entries].sort((a, b) => {
      const valA = field === "havoc" ? havocOf(a) : (a[field] ?? 0);
      const valB = field === "havoc" ? havocOf(b) : (b[field] ?? 0);
      return valB - valA;
    })[0];
  };

  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);

  const categories = [
    { label: "Passing", key: "passing", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Rushing", key: "rushing", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Receiving", key: "receiving", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Tackles", key: "defense", sortBy: "tackles", format: (p) => `${statNum(p.tackles)} TKL` },
    { label: "Havoc", key: "defense", sortBy: "havoc", format: (p) => `${statNum(havocOf(p))} HVC` },
  ];

  const getLastName = (fullName) => {
    if (!fullName) return "—";
    const cleaned = cleanName(fullName);
    const parts = cleaned.split(" ");
    // Handle Jr., Sr., III etc
    if (parts.length > 2 && /^(JR|SR|III|IV|II)$/i.test(parts[parts.length - 1])) {
      return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
    }
    return parts[parts.length - 1];
  };

  // The portrait is a background element, not an avatar: it fills much of its half of the
  // row, anchored to the centre rule, and the frame is the only thing that clips. A scrim
  // fades it out toward the card's outer edge so the name and number — which sit on top of
  // it — stay readable. Athletics-site headshots are framed inconsistently, so the crop is
  // a compromise that has to hold at every frame aspect this card renders at.
  // Percent of the half, capped in rem. The desktop slot runs at half the width it used
  // to: the portrait is a background element behind the name and number, and at 72% it
  // was reading as the subject of the row rather than the setting for it. The compact
  // card keeps its own value — a half there is more than twice as wide, and the rem cap
  // is what stops the portrait swelling into a slab of face.
  const PORTRAIT_W = isCompact ? "min(66%, 11rem)" : "min(36%, 4.5rem)";
  // Bottom-anchored and short of the full row, so the portrait reads as a smaller element
  // sitting in the row rather than a column running the height of the card.
  const PORTRAIT_H = isCompact ? "100%" : "78%";
  // `cover` already scales the photo past the frame and crops it — the frame's aspect does
  // the work, so no transform is needed and the crop holds at any row height. The vertical
  // offset is what keeps a head in shot: 0% put the frame on foreheads once compact rows
  // got tall, 22% lands on head-and-shoulders whatever the aspect turns out to be.
  const PORTRAIT_FOCUS = "center 22%";

  const renderPortrait = (p, color, teamId, side) => {
    const isAway = side === "away";
    const frame = {
      position: "absolute",
      bottom: 0,
      h: PORTRAIT_H,
      w: PORTRAIT_W,
      overflow: "hidden",
      ...(isAway ? { right: 0 } : { left: 0 }),
    };
    if (!p) return <Box {...frame} bg="rgba(255,255,255,0.03)" />;
    const srcs = resolveImages(identity, p, teamId);
    return (
      <Box {...frame} bg={`${color}1a`} borderBottom="0.125rem solid" borderColor={color}>
        <CandidateImage
          key={p.player_key ?? p.name}
          srcs={srcs}
          alt=""
          w="full"
          h="full"
          objectFit="cover"
          objectPosition={PORTRAIT_FOCUS}
          // No live headshot — same logo fallback as Notable Performers, cropped by the
          // identical frame so a missing photo doesn't read as a broken one.
          fallback={
            <Flex w="full" h="full" align="center" justify="center">
              <Image src={getTeamLogoSrc(teamId)} alt="" w="58%" h="58%" objectFit="contain" opacity={0.3} />
            </Flex>
          }
        />
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bg={
            isAway
              ? "linear-gradient(to right, #141416 0%, rgba(20,20,22,0.52) 40%, rgba(20,20,22,0) 76%)"
              : "linear-gradient(to left, #141416 0%, rgba(20,20,22,0.52) 40%, rgba(20,20,22,0) 76%)"
          }
        />
      </Box>
    );
  };

  return (
    <EditorialCard position="relative" overflow="hidden" h="full">
      <Box position="relative" zIndex={1} px={isCompact ? 3 : 4} pt={isCompact ? 3 : 4} pb={0} h="full" display="flex" flexDirection="column">
        <SectionLabel
          rightContent={
            <HStack spacing={2.5} opacity={0.9}>
              <HStack spacing={1.5}>
                <Image src={getTeamLogoSrc(awayId)} w="1.125rem" h="1.125rem" objectFit="contain" />
                <Text fontSize="0.625rem" fontWeight="900" color="white" letterSpacing="0.05em">{getTeamLabel(awayId)}</Text>
              </HStack>
              <Text fontSize="0.625rem" fontWeight="900" color="whiteAlpha.300">vs</Text>
              <HStack spacing={1.5}>
                <Text fontSize="0.625rem" fontWeight="900" color="white" letterSpacing="0.05em">{getTeamLabel(homeId)}</Text>
                <Image src={getTeamLogoSrc(homeId)} w="1.125rem" h="1.125rem" objectFit="contain" />
              </HStack>
            </HStack>
          }
        >
          Game Leaders
        </SectionLabel>

        {/* No gap and every row flex:1 — the five rows split the remaining height evenly, so
            the portraits form one unbroken strip from just under the header to the card's
            bottom edge. Category labels can't sit between rows any more without breaking that
            strip, so they overlay the seam instead (see below). */}
        <VStack flex="1" minH={0} gap={0} align="stretch" mt={2}>
          {categories.map((cat, i) => {
            const awayPlayer = topOf(byTeam(awayId, cat.key), cat.sortBy);
            const homePlayer = topOf(homeId !== awayId ? byTeam(homeId, cat.key) : {}, cat.sortBy);

            return (
              <Box key={cat.label} flex="1" minH={0} position="relative" display="flex" flexDirection="column">
                {/* Overlaid on the top edge of the portrait strip rather than stacked above
                    the row — a label between rows would put a band of empty card between
                    every pair of faces, which is the spacing this layout is trying to lose.
                    It sits over headroom, not faces, because the crop is anchored to the top. */}
                <Text
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={2}
                  px="0.4rem"
                  py="0.1rem"
                  bg="rgba(10,10,12,0.82)"
                  borderBottomRadius="sm"
                  fontSize={isCompact ? "0.4375rem" : "0.5rem"}
                  fontWeight="900"
                  color="rgba(255,255,255,0.55)"
                  textTransform="uppercase"
                  letterSpacing="0.22em"
                  whiteSpace="nowrap"
                  pointerEvents="none"
                >
                  {cat.label}
                </Text>

                {/* gap 0 so each portrait runs right up to the centre rule — the away
                    player's on its right, the home player's on its left — while the name
                    and number sit hard against the card's outer edge, top-aligned. */}
                {/* gap 0 so each portrait runs right up to the centre rule — the away
                    player's on its right, the home player's on its left. The name and number
                    sit above the photo, top-aligned and hard against the card's outer edge. */}
                <Grid flex="1" minH={0} templateColumns="1fr 0.0625rem 1fr" gap={0} alignItems="stretch">
                  {/* Away — portrait behind, text outboard left */}
                  <Box position="relative" minW={0} overflow="hidden">
                    {renderPortrait(awayPlayer, awayColor, awayId, "away")}
                    <Box position="relative" zIndex={1} textAlign="left" pr={2} pt="0.15rem">
                      <Text
                        fontSize={isCompact ? "0.9rem" : "clamp(0.95rem, 1.15vw, 1.25rem)"}
                        fontWeight="900"
                        color="white"
                        lineClamp={1}
                        lineHeight={1.05}
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {awayPlayer ? getLastName(awayPlayer.name) : "—"}
                      </Text>
                      <Text
                        fontSize={isCompact ? "1rem" : "clamp(1.15rem, 1.5vw, 1.6rem)"}
                        fontWeight="950"
                        color={awayColor}
                        lineHeight={1.15}
                        whiteSpace="nowrap"
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {awayPlayer ? cat.format(awayPlayer) : "—"}
                      </Text>
                    </Box>
                  </Box>

                  <Box w="0.0625rem" bg="rgba(255,255,255,0.12)" zIndex={2} />

                  {/* Home — mirrored */}
                  <Box position="relative" minW={0} overflow="hidden">
                    {renderPortrait(homePlayer, homeColor, homeId, "home")}
                    <Box position="relative" zIndex={1} textAlign="right" pl={2} pt="0.15rem">
                      <Text
                        fontSize={isCompact ? "0.9rem" : "clamp(0.95rem, 1.15vw, 1.25rem)"}
                        fontWeight="900"
                        color="white"
                        lineClamp={1}
                        lineHeight={1.05}
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {homePlayer ? getLastName(homePlayer.name) : "—"}
                      </Text>
                      <Text
                        fontSize={isCompact ? "1rem" : "clamp(1.15rem, 1.5vw, 1.6rem)"}
                        fontWeight="950"
                        color={homeColor}
                        lineHeight={1.15}
                        whiteSpace="nowrap"
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {homePlayer ? cat.format(homePlayer) : "—"}
                      </Text>
                    </Box>
                  </Box>
                </Grid>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </EditorialCard>
  );
};
