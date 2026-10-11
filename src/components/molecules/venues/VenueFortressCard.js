import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

// 1x2 slot — the wiki's StadiumCard ("THE FORTRESS") re-cut for the venues
// file. Photo (or a team-color block when public/stadiums/ has none) on top,
// identity and a stat grid below. Every value is from venues.json; the four
// fields the wiki card shows as [[TBA]] (surface, built, record attendance)
// are simply not here, so they aren't shown.
//
// Sized in cqmin: the slot is one row unit wide, so 1cqmin = 1% of width.

const Stat = ({ label, value }) => (
  <Box minW={0}>
    <Text fontSize="3.4cqmin" fontWeight="black" color="rgba(255,255,255,0.35)" letterSpacing="0.3em" lineHeight={1.2}>
      {label}
    </Text>
    <Text fontSize="6.5cqmin" fontWeight="black" color="#F4F4F5" lineHeight={1.15} lineClamp={1}>
      {value}
    </Text>
  </Box>
);

export const VenueFortressCard = ({ venue }) => {
  if (!venue) {
    return (
      <Box h="100%" w="100%" bg="#141416" border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xs" fontWeight="black" letterSpacing="0.4em" color="whiteAlpha.400">NO VENUE</Text>
      </Box>
    );
  }

  const accent = venue.accent ?? "#2D3748";
  const secondary = venue.secondary ?? "#FFFFFF";
  const badge = venue.isNeutral ? "NEUTRAL SITE" : "HOME FIELD";
  const aliases = (venue.aliases ?? []).filter((a) => a !== venue.name);

  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      bg="#141416"
      border="1px solid rgba(255,255,255,0.07)"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      {/* Photo tier — 40% of the card */}
      <Box flex="0 0 40%" position="relative" overflow="hidden" bg={accent}>
        {venue.photo ? (
          <Image src={venue.photo} alt={venue.name} w="full" h="full" objectFit="cover" />
        ) : (
          <Box w="full" h="full" bg={`linear-gradient(135deg, ${accent} 0%, ${accent}66 60%, #141416 100%)`} />
        )}
        {venue.logo && (
          <Image
            src={venue.logo}
            alt=""
            position="absolute"
            right="-12cqmin"
            top="50%"
            transform="translateY(-50%)"
            w="55cqmin"
            h="55cqmin"
            objectFit="contain"
            opacity={venue.photo ? 0.25 : 0.35}
            pointerEvents="none"
          />
        )}
        <Box position="absolute" inset={0} bg="linear-gradient(to top, #141416 0%, transparent 60%)" />
        <Box
          position="absolute"
          bottom="4cqmin"
          left="5cqmin"
          bg={venue.isNeutral ? "whiteAlpha.900" : accent}
          color={venue.isNeutral ? "#141416" : secondary}
          fontSize="3.4cqmin"
          letterSpacing="0.15em"
          px="3cqmin"
          py="1cqmin"
          fontWeight="black"
          lineHeight={1.3}
        >
          {badge}
        </Box>
      </Box>

      {/* Body tier */}
      <Flex flex={1} minH={0} direction="column" justify="space-between" px="6cqmin" pt="4cqmin" pb="5cqmin" gap="3cqmin">
        <Box minW={0}>
          <Flex align="center" gap="1.5cqmin" mb="2cqmin">
            <Box w="0.8cqmin" h="4cqmin" bg={venue.isNeutral ? "brand.500" : secondary} />
            <Text fontSize="3.4cqmin" fontWeight="black" letterSpacing="0.4em" color="text.muted">
              THE FORTRESS
            </Text>
          </Flex>
          <Text fontSize="9cqmin" fontWeight="black" letterSpacing="-0.03em" color="#F4F4F5" lineHeight={1.05} lineClamp={3}>
            {venue.name}
          </Text>
          <Text fontSize="4.5cqmin" color="rgba(255,255,255,0.6)" lineHeight={1.4} mt="1.5cqmin" lineClamp={1}>
            {venue.location}
          </Text>
          {venue.team && (
            <Flex align="center" gap="2cqmin" mt="2cqmin">
              <Image src={venue.team.logo} alt="" w="7cqmin" h="7cqmin" objectFit="contain" />
              <Text fontSize="4.5cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
                {venue.team.name}
              </Text>
            </Flex>
          )}
        </Box>

        <Box>
          {(venue.known_event || venue.notes) && (
            <Text fontSize="4.2cqmin" color="rgba(255,255,255,0.55)" lineHeight={1.4} lineClamp={3} mb="3cqmin">
              {venue.known_event ?? venue.notes}
            </Text>
          )}
          <Grid templateColumns="1fr 1fr" gap="3cqmin">
            <Stat label="CAPACITY" value={venue.capacity ? venue.capacity.toLocaleString() : "—"} />
            <Stat label="TYPE" value={venue.isNeutral ? "Neutral" : "Campus"} />
            <Stat label="STATE" value={venue.state ?? "—"} />
            <Stat label="ALSO KNOWN AS" value={aliases[0] ?? "—"} />
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

export default VenueFortressCard;
