import { Box, Flex, Image, Text } from "@chakra-ui/react";

// 1x2 slot. The 19 campus stadiums as one bar each, largest to smallest,
// bar length = capacity / largest capacity, bar color = home team primary.
// Rows are flex: 1 so the ladder always fills the slot exactly; the type
// is in cqmin (1% of the slot's width) so it scales with the column.

export const CapacityLadderCard = ({ venues, selectedId, onSelect }) => {
  const max = Math.max(1, ...venues.map((v) => v.capacity ?? 0));

  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      bg="#141416"
      border="1px solid rgba(255,255,255,0.07)"
      borderRadius="xl"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      px="5cqmin"
      pt="5cqmin"
      pb="4cqmin"
    >
      <Flex align="center" gap="1.5cqmin" mb="3cqmin" flexShrink={0}>
        <Box w="0.8cqmin" h="4cqmin" bg="brand.500" />
        <Text fontSize="3.4cqmin" fontWeight="black" letterSpacing="0.4em" color="text.muted">
          CAPACITY LADDER
        </Text>
      </Flex>

      <Flex direction="column" flex={1} minH={0} gap="0.6cqmin">
        {venues.map((v) => {
          const pct = Math.max(4, Math.round(((v.capacity ?? 0) / max) * 100));
          const isSelected = v.id === selectedId;
          return (
            <Flex
              key={v.id}
              as="button"
              onClick={() => onSelect?.(v.id)}
              align="center"
              gap="2cqmin"
              flex={1}
              minH={0}
              px="1.5cqmin"
              borderRadius="sm"
              bg={isSelected ? "whiteAlpha.100" : "transparent"}
              _hover={{ bg: "whiteAlpha.50" }}
              textAlign="left"
              w="full"
            >
              {v.logo ? (
                <Image src={v.logo} alt="" w="6cqmin" h="6cqmin" objectFit="contain" flexShrink={0} />
              ) : (
                <Box w="6cqmin" h="6cqmin" flexShrink={0} />
              )}
              <Box flex={1} minW={0}>
                <Box h="2.4cqmin" w={`${pct}%`} bg={v.accent ?? "#E53E3E"} borderRadius="1px" opacity={isSelected ? 1 : 0.85} />
              </Box>
              <Text fontSize="4cqmin" fontWeight="black" color={isSelected ? "white" : "whiteAlpha.800"} lineHeight={1} flexShrink={0} minW="13cqmin" textAlign="right">
                {(v.capacity ?? 0).toLocaleString()}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default CapacityLadderCard;
