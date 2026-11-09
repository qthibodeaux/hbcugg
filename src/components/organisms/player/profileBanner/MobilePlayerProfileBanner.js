import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { User } from "lucide-react";

// Mobile full-bleed player photo and overlaid identity/rating plate.

export const MobilePlayerProfileBanner = ({
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
