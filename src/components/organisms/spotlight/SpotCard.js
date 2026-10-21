import { useRef } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../stats/ExportCardButton";

// The card every spotlight chart sits in: a 4px team-colour bar on the left of
// the title, the team's mark ghosted in the corner, and its own Export (the
// card as it looks on screen, at 2x). Mobile: flush, square, no gaps.

export const SpotCard = ({ title, palette, filename, mobile = false, children }) => {
  const ref = useRef(null);
  return (
    <Box
      ref={ref}
      position="relative"
      overflow="hidden"
      bg="bg.secondary"
      border={mobile ? "none" : "1px solid"}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius={mobile ? 0 : "xl"}
      px={mobile ? "0.75rem" : 5}
      py={mobile ? "0.85rem" : 4}
      minW={0}
      bgImage={`linear-gradient(135deg, ${palette.fill}26 0%, transparent 45%)`}
    >
      {palette.team?.logo && (
        <Image src={palette.team.logo} alt="" position="absolute" right="-1.5rem" top="-1.5rem" w={mobile ? "6rem" : "9rem"} h={mobile ? "6rem" : "9rem"} objectFit="contain" opacity={0.06} pointerEvents="none" />
      )}
      <Flex position="relative" align="center" justify="space-between" gap={3} mb={mobile ? "0.75rem" : 4}>
        <Flex align="center" gap="0.6rem" minW={0}>
          <Box w="4px" h={mobile ? "1.2rem" : "1.4rem"} bg={palette.ink} flexShrink={0} />
          <Text fontSize={mobile ? "1.05rem" : "lg"} fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineClamp={1}>{title}</Text>
        </Flex>
        <ExportCardButton target={ref} filename={filename} compact={mobile} />
      </Flex>
      <Box position="relative">{children}</Box>
    </Box>
  );
};
