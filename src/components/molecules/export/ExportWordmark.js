import { Text } from "@chakra-ui/react";

// The brand on every export: HBCUGG, the mobile header's wordmark — "HBCU" in
// the poster's ink, "GG" in the brand purple. Sits at the top of the image.
// Colours are passed in so it follows each poster's palette (Light / Night).

export const ExportWordmark = ({ ink = "#FFFFFF", accent = "#A855F7", size = "34px" }) => (
  <Text fontSize={size} fontWeight="900" color={ink} letterSpacing="-0.025em" lineHeight={1} whiteSpace="nowrap">
    HBCU<Text as="span" color={accent}>GG</Text>
  </Text>
);
