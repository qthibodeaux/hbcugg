import { Box, Flex, Text } from "@chakra-ui/react";

// 4x1 slot. The 15 neutral sites as one horizontal strip of tiles — the
// venues that host the classics. Each tile: name, city, capacity, and the
// classic it hosts when venues.json names one (`known_event`). The slot is
// one row unit tall, so cqmin = height and tiles are sized off that.

const tidyEvent = (text) =>
  String(text ?? "")
    .replace(/^likely the\s+/i, "")
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/\.$/, "");

export const NeutralGroundsStrip = ({ venues, selectedId, onSelect }) => (
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
  >
    <Flex align="center" justify="space-between" px="5cqmin" pt="5cqmin" pb="3cqmin" flexShrink={0}>
      <Flex align="center" gap="1.5cqmin">
        <Box w="0.8cqmin" h="4cqmin" bg="brand.500" />
        <Text fontSize="3.4cqmin" fontWeight="black" letterSpacing="0.4em" color="text.muted">
          NEUTRAL GROUNDS
        </Text>
      </Flex>
      <Text fontSize="3.4cqmin" fontWeight="bold" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
        {venues.length} sites
      </Text>
    </Flex>

    <Flex flex={1} minH={0} px="5cqmin" pb="5cqmin" gap="2.5cqmin" overflowX="auto" css={{ scrollbarWidth: "thin" }}>
      {venues.map((v) => {
        const isSelected = v.id === selectedId;
        const event = tidyEvent(v.known_event);
        return (
          <Flex
            key={v.id}
            as="button"
            onClick={() => onSelect?.(v.id)}
            direction="column"
            justify="space-between"
            flexShrink={0}
            w="46cqmin"
            h="full"
            p="4cqmin"
            textAlign="left"
            borderRadius="md"
            border="1px solid"
            borderColor={isSelected ? "whiteAlpha.500" : "whiteAlpha.100"}
            bg={isSelected ? "whiteAlpha.100" : "rgba(255,255,255,0.03)"}
            _hover={{ bg: "whiteAlpha.100" }}
            transition="all 0.15s"
          >
            <Box minW={0}>
              <Text fontSize="6cqmin" fontWeight="black" color="white" lineHeight={1.05} letterSpacing="-0.02em" lineClamp={2}>
                {v.name}
              </Text>
              <Text fontSize="3.6cqmin" color="whiteAlpha.600" mt="1.5cqmin" lineClamp={1}>
                {v.location}
              </Text>
            </Box>
            <Box minW={0}>
              {event && (
                <Text fontSize="3.4cqmin" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2} lineClamp={2} mb="1.5cqmin">
                  {event}
                </Text>
              )}
              <Text fontSize="5.5cqmin" fontWeight="black" color={v.capacity ? "whiteAlpha.900" : "whiteAlpha.400"} lineHeight={1}>
                {v.capacity ? v.capacity.toLocaleString() : "Capacity —"}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </Flex>
  </Box>
);

export default NeutralGroundsStrip;
