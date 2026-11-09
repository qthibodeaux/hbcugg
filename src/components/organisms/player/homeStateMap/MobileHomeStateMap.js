import { Box, Flex, Text } from "@chakra-ui/react";

// Mobile band — everything that floats over the map on desktop gets its own
// full-width row instead, divided by hairlines. The column has plenty of
// vertical room on a phone, so nothing needs to overlap.
const MobileRow = ({ children, ...rest }) => (
  <Flex
    align="center"
    px="0.7rem"
    py="0.45rem"
    borderBottom="1px solid rgba(255,255,255,0.08)"
    flexShrink={0}
    {...rest}
  >
    {children}
  </Flex>
);

export const StateLegend = ({ primary, secondary, ...rest }) => (
  <Flex gap="0.7rem" {...rest}>
    <Flex align="center" gap="0.25rem">
      <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={primary} />
      <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.7)" textTransform="uppercase">
        School
      </Text>
    </Flex>
    <Flex align="center" gap="0.25rem">
      <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={secondary} />
      <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.7)" textTransform="uppercase">
        Home
      </Text>
    </Flex>
  </Flex>
);

export const MobileHomeStateMap = ({ primary, secondary, hometownLabel, showStateShare, homeStateTeamCount, rosterTeamCount, homeStateName, isInState, isTwoState, mapSvg }) => {
  return (
    <Flex direction="column" h="full" w="full" minH={0}>
      <MobileRow gap="0.35rem">
        <Box w="3px" h="0.7rem" bg={primary} />
        <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Hometown
        </Text>
      </MobileRow>

      <MobileRow bg="rgba(0,0,0,0.35)">
        <Text fontSize="0.78rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.01em" lineClamp={1}>
          {hometownLabel}
        </Text>
      </MobileRow>

      {/* Roster share from this player's state. Distance-from-school miles
          would be the more natural stat, but no player carries coordinates
          — this is a real count off the roster instead of a fake radius. */}
      {showStateShare && (
        <MobileRow gap="0.3rem">
          <Text fontSize="0.7rem" fontWeight="900" color={secondary} lineHeight={1}>
            {homeStateTeamCount} of {rosterTeamCount}
          </Text>
          <Text fontSize="0.5rem" fontWeight="800" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            from {homeStateName}
          </Text>
        </MobileRow>
      )}

      {isInState != null && (
        <MobileRow>
          <Text
            fontSize="0.58rem"
            fontWeight="900"
            color={isInState ? "green.300" : "white"}
            textTransform="uppercase"
            letterSpacing="0.06em"
          >
            {isInState ? "In-State" : "Out-of-State"}
          </Text>
        </MobileRow>
      )}

      <Box flex={1} minH="8rem" position="relative" overflow="hidden" bg="rgba(0,0,0,0.35)">
        {mapSvg}
      </Box>

      {isTwoState && (
        <MobileRow borderBottom="none" borderTop="1px solid rgba(255,255,255,0.08)" justify="center">
          <StateLegend primary={primary} secondary={secondary} />
        </MobileRow>
      )}
    </Flex>
  );
};
