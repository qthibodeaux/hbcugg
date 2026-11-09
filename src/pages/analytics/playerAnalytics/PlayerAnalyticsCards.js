import { useState } from "react";
import { Box, Image, Flex, Text } from "@chakra-ui/react";

// Player Analytics avatar fallback and DNA-tile display. Existing mock labels/data remain page-owned.

export const PlayerAvatar = ({ player }) => {
  const [imgErr, setImgErr] = useState(false);
  const initials = player.name_display?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?";
  const hasImage = player.image_url && !imgErr;

  return (
    <Box position="relative" w={24} alignSelf="stretch" flexShrink={0} overflow="hidden" borderRight="1px solid" borderColor="whiteAlpha.200">
      {hasImage ? (
        <Image
          src={player.image_url}
          alt=""
          w="full"
          h="full"
          objectFit="cover"
          objectPosition="top center"
          onError={() => setImgErr(true)}
        />
      ) : (
        <Flex w="full" h="full" bg="whiteAlpha.100" align="center" justify="center">
          <Text fontSize="lg" fontWeight="black" color="text.muted">{initials}</Text>
        </Flex>
      )}
    </Box>
  );
};

export const DnaTile = ({ label, value, fill }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
    <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider" mb={1} lineClamp={1}>
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="black" color="text.primary" mb={1.5}>
      {value}
    </Text>
    <Box h="3px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
      <Box h="full" w={`${fill}%`} bg="brand.500" borderRadius="full" />
    </Box>
  </Box>
);
