import { Box, Flex, Text } from "@chakra-ui/react";
import { EVENT_CARD_BG, EVENT_CARD_BORDER, FAMILY_COLOR, SectionEyebrow, TeamMark } from "./EventPrimitives";

// 1x2 slot. This season's homecomings, in date order — host, opponent,
// venue. Rows are flex: 1 so the list always fills the slot; the slot is
// one row unit wide, so cqmin = width.

export const HomecomingSlateCard = ({ homecomings, season }) => (
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
    px="5cqmin"
    pt="5cqmin"
    pb="4cqmin"
  >
    <Box mb="3cqmin" flexShrink={0}>
      <SectionEyebrow
        accent={FAMILY_COLOR.homecoming}
        right={
          <Text fontSize="3.4cqmin" fontWeight="bold" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
            {homecomings.length} · {season}
          </Text>
        }
      >
        HOMECOMING SLATE
      </SectionEyebrow>
    </Box>

    {homecomings.length === 0 ? (
      <Flex flex={1} align="center" justify="center">
        <Text fontSize="3.4cqmin" fontWeight="black" letterSpacing="0.4em" color="whiteAlpha.400">NONE ON FILE</Text>
      </Flex>
    ) : (
      <Flex direction="column" flex={1} minH={0}>
        {homecomings.map((occ, i) => {
          const accent = occ.host?.team?.colors?.primary ?? "#E53E3E";
          return (
            <Flex
              key={occ.key}
              align="center"
              gap="2.5cqmin"
              flex={1}
              minH={0}
              px="2cqmin"
              borderBottom={i === homecomings.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)"}
              bg={`linear-gradient(90deg, ${accent}1F 0%, transparent 60%)`}
            >
              <Text fontSize="3.4cqmin" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em" w="16cqmin" flexShrink={0} lineHeight={1.2}>
                {occ.dateLabel.replace(/^\w+ /, "")}
              </Text>
              <TeamMark team={occ.host?.team} teamId={occ.host?.teamId} size={8} />
              <Box minW={0} flex={1}>
                <Text fontSize="4.6cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em" lineHeight={1.1} lineClamp={1}>
                  {occ.host?.team?.shortName ?? occ.host?.teamId}
                </Text>
                <Text fontSize="3.6cqmin" color="whiteAlpha.600" lineHeight={1.2} lineClamp={1}>
                  vs {occ.opponentName ?? "TBD"}
                </Text>
              </Box>
              {occ.tags.length > 0 && (
                <Box w="1.6cqmin" h="1.6cqmin" borderRadius="full" bg={FAMILY_COLOR.theme} flexShrink={0} title={occ.tags.map((t) => t.label).join(" · ")} />
              )}
            </Flex>
          );
        })}
      </Flex>
    )}
  </Box>
);

export default HomecomingSlateCard;
