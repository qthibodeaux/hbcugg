// Live typography includes the mobile rem floor and green accent.
// Lab presentation is intentionally separate; shared renderer edits affect both.
import { DIM, Logo } from "./ContextPrimitives";
import { Text, Box, Flex } from "@chakra-ui/react";

export const GOLD = "#5A9F68";

export const Small = ({ children, color = DIM, size = 4, ...rest }) => (
  <Text fontSize={`max(calc(${size}cqmin * (1 + 0.3 * var(--ctx-m, 0))), calc(var(--ctx-m, 0) * 0.72rem))`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15} lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Shell = ({ title, why, mark, accent = "#A855F7", placeholder, children }) => (
  <Box position="relative" w="full" h="full" bg="#141416" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" style={{ containerType: "size" }}>
    {mark ? <Logo id={mark} size={58} position="absolute" right="-10cqmin" top="-8cqmin" opacity={0.07} pointerEvents="none" /> : null}
    <Flex position="relative" direction="column" h="full" p="5cqmin" gap="3cqmin">
      <Flex align="center" gap="2cqmin">
        <Box w="1.6cqmin" h="1.6cqmin" borderRadius="full" bg={accent} flexShrink={0} />
        <Text fontSize="4.6cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>{title}</Text>
        {placeholder ? <Text ml="auto" fontSize="3cqmin" fontWeight="black" color={GOLD} letterSpacing="0.1em">MOCK</Text> : null}
      </Flex>
      <Flex direction="column" flex={1} minH={0}>{children}</Flex>
      {why ? <Text fontSize="max(calc(3.8cqmin * (1 + 0.3 * var(--ctx-m, 0))), calc(var(--ctx-m, 0) * 0.78rem))" fontWeight="bold" color="rgba(255,255,255,0.6)" lineHeight={1.3} lineClamp={2}>{why}</Text> : null}
    </Flex>
  </Box>
);
