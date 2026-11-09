import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { User } from "lucide-react";

// Player banner avatar/image fallback and identity tags.

export const BannerAvatar = ({ imageUrl, imgErr, onImgErr, primary }) => (
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

export const TagPill = ({ label, school, primary, secondary }) => (
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
