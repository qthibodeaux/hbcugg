import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { teamLogo, teamShort } from "../../export/exportData";

// Existing mobile/summary presentation extracted without behavior changes.

const TONES = ["#141416", "#1F1F25"];

export const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";

export const Part = ({ id, refs, tone = 0, children, ...rest }) => (
  <Box ref={refs?.[id]} data-jump={id} bg={TONES[tone % 2]} style={{ scrollMarginTop: JUMP_MARGIN, "--part-bg": TONES[tone % 2] }} borderBottom="1px solid" borderColor="whiteAlpha.100" {...rest}>
    {children}
  </Box>
);

export const Eyebrow = ({ children, accent, right }) => (
  <Flex align="center" justify="space-between" gap="0.5rem" pb="0.55rem" mb="0.35rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Flex align="center" gap="0.5rem">
      <Box w="0.4rem" h="0.4rem" bg={accent} borderRadius="full" flexShrink={0} />
      <Text fontSize="0.78rem" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em">{children}</Text>
    </Flex>
    {right}
  </Flex>
);

export const TeamKey = ({ awayId, homeId }) => (
  <Flex align="center" gap="0.6rem">
    <Flex align="center" gap="0.3rem">
      <Image src={teamLogo(awayId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
      <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(awayId)}</Text>
    </Flex>
    <Box w="1px" h="0.7rem" bg="whiteAlpha.300" />
    <Flex align="center" gap="0.3rem">
      <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(homeId)}</Text>
      <Image src={teamLogo(homeId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
    </Flex>
  </Flex>
);
