import { Box } from "@chakra-ui/react";

// Existing implementation extracted along responsibility boundaries.

export const Card = ({ children, accent = "#A855F7", bg, ...props }) => (
  <Box
    h="full"
    w="full"
    minW={0}
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={bg ?? "rgba(20,20,22,0.96)"}
    position="relative"
    _before={{
      content: '""',
      position: "absolute",
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: "3px",
      bg: accent,
      opacity: 0.9,
    }}
    {...props}
  >
    {children}
  </Box>
);
