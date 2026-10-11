import { Box, Flex, Text } from "@chakra-ui/react";

export const Panel = ({ children, accent = "#E53E3E", minH, p = 4 }) => (
  <Box
    w="full"
    h="full"
    bg="rgba(20,20,22,0.96)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
    minH={minH}
  >
    <Box
      position="absolute"
      inset={0}
      bg={`linear-gradient(135deg, ${accent}12 0%, transparent 46%)`}
      pointerEvents="none"
    />
    <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent} />
    <Box position="relative" zIndex={1} p={p}>
      {children}
    </Box>
  </Box>
);

export const Kicker = ({ icon: Icon, children, color = "#E53E3E" }) => (
  <Flex align="center" gap={2} mb={3}>
    {Icon && <Icon size={14} color={color} />}
    <Text
      fontSize="10px"
      fontWeight="black"
      color="text.muted"
      textTransform="uppercase"
      letterSpacing="0.16em"
    >
      {children}
    </Text>
  </Flex>
);

export const GradePill = ({ item }) => (
  <Box
    px={1.5}
    py={0.5}
    bg={`${item.color}22`}
    border="1px solid"
    borderColor={`${item.color}88`}
    minW="30px"
    textAlign="center"
  >
    <Text fontSize="9px" color={item.color} fontWeight="black">
      {item.label}
    </Text>
  </Box>
);
