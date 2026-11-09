import { Flex, Box, Text } from "@chakra-ui/react";

export const LabSlot = ({ entry }) => {
  const Component = entry.component;
  const hideOverlay = entry.hideOverlay === true;

  return (
    <Flex h="100%" minH={0} direction="column" gap={2} position="relative">
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        minH="38px"
        px={3}
        py={2}
        borderRadius="lg"
        bg="rgba(20,20,22,0.96)"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Flex align="center" gap={2.5} minW={0}>
          <Box
            minW="34px"
            h="22px"
            px={2}
            borderRadius="md"
            bg="brand.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="9px" fontWeight="black" color="white">
              {entry.number}
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
            {entry.name}
          </Text>
        </Flex>
        <Text
          flexShrink={0}
          fontSize="10px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
        >
          {entry.size ?? "?x?"} | {entry.agent}
        </Text>
      </Flex>

      {!hideOverlay && (
        <Box position="absolute" top="46px" left={2} zIndex={2} px={2.5} py={1.5} borderRadius="lg" bg="rgba(11,11,13,0.82)" border="1px solid" borderColor="whiteAlpha.200" backdropFilter="blur(8px)" maxW="calc(100% - 16px)">
          <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            {String(entry.number).padStart(2, "0")} | {entry.size ?? "?x?"}
          </Text>
          <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>
            {entry.name}
          </Text>
        </Box>
      )}

      <Box flex="1" minH={0} w="100%">
        {Component ? (
          <Component />
        ) : (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="sm" color="red.400" fontWeight="bold">
              Component missing. Check registry import.
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
