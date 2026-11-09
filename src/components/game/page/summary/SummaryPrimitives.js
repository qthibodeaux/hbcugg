import { SectionEyebrow } from "../../../atoms/SectionEyebrow";
import { Box, Text } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

export const SectionLabel = SectionEyebrow;

export const EditorialCard = ({ children, position = "relative", overflow = "hidden", ...props }) => (
  <Box
    w="full"
    h="full"
    bg="var(--part-bg, #141416)"
    borderRadius="xl"
    position={position}
    overflow={overflow}
    {...props}
  >
    {children}
  </Box>
);

export const MicroLabel = ({ children, color = "rgba(255,255,255,0.35)" }) => (
  <Text
    fontSize="clamp(0.5rem, 0.6vw, 0.65rem)"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.2em"
    lineHeight={1.2}
  >
    {children}
  </Text>
);
