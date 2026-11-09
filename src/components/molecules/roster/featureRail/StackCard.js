import { DECK, DECK_OPACITY } from "./featureRailModel";
import { Box, Text, Flex, Image } from "@chakra-ui/react";

export const StackCard = ({ slide, team, variant = "standard", active = false, offset = 0, onClick }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const isRoom = slide.type === "room";
  const compact = variant === "compact";
  const deck = compact ? DECK.compact : DECK.standard;

  return (
    <Box
      as="button"
      onClick={onClick}
      position="absolute"
      left={`${deck.inset}%`}
      top={`${offset * deck.drop}%`}
      h={`${100 - offset * deck.shrink}%`}
      aspectRatio={deck.aspect}
      opacity={DECK_OPACITY[offset] ?? 0.25}
      overflow="hidden"
      bg={isRoom ? primary : "#f4f0f7"}
      border="1px solid"
      borderColor={active ? `${primary}1F` : "transparent"}
      cursor="pointer"
      textAlign="left"
      zIndex={8 - offset}
      boxShadow={active ? `16px 0 34px ${primary}24` : `10px 0 24px ${primary}18`}
      style={{
        transform: `translateX(${offset * deck.peek}%)`,
        transition: "transform 360ms ease, height 360ms ease, top 360ms ease, opacity 360ms ease",
      }}
      _hover={{ borderColor: secondary }}
    >
      <Text
        position="absolute"
        top={active ? "-20px" : "-12px"}
        left={active ? "-10px" : "-8px"}
        fontSize={active ? "116px" : "76px"}
        fontWeight="black"
        color={isRoom ? "white" : primary}
        opacity={isRoom ? 0.08 : 0.1}
        lineHeight="1"
        zIndex={1}
      >
        {slide.jersey}
      </Text>

      {isRoom ? (
        <Flex position="relative" zIndex={2} h="100%" direction="column" justify="center" px={5}>
          <Text fontSize="9px" fontWeight="black" color={secondary} textTransform="uppercase" letterSpacing="0.16em">
            Position group
          </Text>
          <Text mt={2} fontSize={active ? "3xl" : "xl"} fontWeight="black" color="white" textTransform="uppercase" lineHeight="0.86">
            {slide.name}
          </Text>
          <Text mt={3} fontSize="sm" fontWeight="black" color={secondary} textTransform="uppercase">
            {slide.stats[0]}
          </Text>
        </Flex>
      ) : (
        <Image
          src={slide.image}
          alt={slide.name}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="top center"
          position="relative"
          zIndex={0}
        />
      )}

      <Box position="absolute" inset={0} zIndex={2} bg={`linear-gradient(180deg, transparent 56%, ${primary}22 76%, #ffffff 100%)`} />

      {/* Softened from a 22%/0.5 wash — with the fanned geometry the only
          part of a deck card you see IS its right edge, so the old overlay
          bleached the very sliver it's meant to reveal. Depth fading is
          handled by the card's own opacity now; this just feathers the edge. */}
      {!active && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w="14%"
          zIndex={4}
          bg="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 100%)"
          pointerEvents="none"
        />
      )}

      {!isRoom && (
        <Text
          position="absolute"
          left={3}
          bottom={2}
          zIndex={3}
          fontSize={active ? "12px" : "10px"}
          color={primary}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight="1"
          lineClamp={1}
        >
          #{slide.jersey} {slide.pos}
        </Text>
      )}
    </Box>
  );
};
