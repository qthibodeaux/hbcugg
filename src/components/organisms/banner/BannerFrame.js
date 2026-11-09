import { Text, Flex, Box } from "@chakra-ui/react";

// Shared production banner surfaces, title framing, ghost word and opaque control strip.

export const BANNER_STRIP_BG = "#0B0B0D";

export const BANNER_PILL_BG = "#1C1C1F";

export const BANNER_OUTER_PX = "clamp(1rem, 2vw, 1.5rem)";

export const BannerGhostWord = ({ text, size = "clamp(6rem, 18vw, 13rem)", left = "1.25rem", bottom = "-0.5rem" }) => (
  <Text
    position="absolute"
    left={left}
    bottom={bottom}
    fontSize={size}
    fontWeight="black"
    fontStyle="italic"
    color="whiteAlpha.100"
    lineHeight={0.8}
    letterSpacing="-0.02em"
    whiteSpace="nowrap"
    pointerEvents="none"
    userSelect="none"
    zIndex={0}
  >
    {text}
  </Text>
);

export const BannerControlStrip = ({
  children,
  justify = "start",
  bg = BANNER_STRIP_BG,
  borderTop = "2px solid",
  borderColor = "whiteAlpha.200",
  py = "0.75rem",
}) => (
  <Flex
    flexShrink={0}
    w="full"
    gap="0.6rem"
    bg={bg}
    borderTop={borderTop}
    borderColor={borderColor}
    px={BANNER_OUTER_PX}
    py={py}
    align="center"
    justify={justify}
    flexWrap="wrap"
    position="relative"
    zIndex={2}
  >
    {children}
  </Flex>
);

export const BannerTitleArea = ({ children }) => (
  <Box flex="1" minH={0} position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center" px={BANNER_OUTER_PX} py="0.75rem">
    {children}
  </Box>
);
