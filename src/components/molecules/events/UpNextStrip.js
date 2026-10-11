import { Box, Flex, Text } from "@chakra-ui/react";
import { EVENT_CARD_BG, EVENT_CARD_BORDER, SectionEyebrow, TagChip, TeamMark, familyColorFor, matchupLabel } from "./EventPrimitives";

// 4x1 slot. Every remaining event this season, in date order, as a
// horizontal strip. The slot is one row unit tall, so cqmin = height.

const Tile = ({ occ }) => {
  const color = familyColorFor(occ);
  return (
    <Flex
      direction="column"
      justify="space-between"
      flexShrink={0}
      w="52cqmin"
      h="full"
      p="4cqmin"
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(160deg, ${occ.accent}2E 0%, rgba(255,255,255,0.03) 55%)`}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="0.8cqmin" bg={color} />
      <Box minW={0}>
        <Text fontSize="3.4cqmin" fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.2} lineClamp={1}>
          {occ.dateLabel}
        </Text>
        <Text fontSize="6cqmin" fontWeight="black" color="white" lineHeight={1.05} letterSpacing="-0.02em" mt="1cqmin" lineClamp={2}>
          {occ.label}
        </Text>
      </Box>
      <Box minW={0}>
        <Flex align="center" gap="1.5cqmin" mb="1.5cqmin">
          {occ.sides.map((s) => (
            <TeamMark key={s.teamId} team={s.team} teamId={s.teamId} size={7} />
          ))}
          <Text fontSize="4cqmin" fontWeight="black" color="whiteAlpha.900" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1} minW={0}>
            {matchupLabel(occ)}
          </Text>
        </Flex>
        <Text fontSize="3.4cqmin" color="whiteAlpha.600" lineClamp={1}>
          {occ.venue?.name ?? occ.stadiumName ?? "Venue TBD"}
        </Text>
        {occ.tags.length > 0 && (
          <Flex gap="1cqmin" mt="1.5cqmin" overflow="hidden">
            {occ.tags.slice(0, 2).map((t) => (
              <TagChip key={t.typeId} label={t.label} color={t.typeId === "homecoming" ? "#E53E3E" : "#63B3ED"} size={2.8} />
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export const UpNextStrip = ({ occurrences, season }) => (
  <Box
    h="100%"
    w="100%"
    containerType="size"
    bg={EVENT_CARD_BG}
    border={EVENT_CARD_BORDER}
    borderRadius="xl"
    overflow="hidden"
    display="flex"
    flexDirection="column"
  >
    <Box px="5cqmin" pt="5cqmin" pb="3cqmin" flexShrink={0}>
      <SectionEyebrow
        right={
          <Text fontSize="3.4cqmin" fontWeight="bold" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
            {occurrences.length} remaining · {season}
          </Text>
        }
      >
        UP NEXT
      </SectionEyebrow>
    </Box>

    {occurrences.length === 0 ? (
      <Flex flex={1} align="center" justify="center">
        <Text fontSize="3.4cqmin" fontWeight="black" letterSpacing="0.4em" color="whiteAlpha.400">SEASON COMPLETE</Text>
      </Flex>
    ) : (
      <Flex flex={1} minH={0} px="5cqmin" pb="5cqmin" gap="2.5cqmin" overflowX="auto" css={{ scrollbarWidth: "thin" }}>
        {occurrences.map((occ) => <Tile key={occ.key} occ={occ} />)}
      </Flex>
    )}
  </Box>
);

export default UpNextStrip;
