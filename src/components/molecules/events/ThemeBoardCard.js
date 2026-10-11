import { Box, Flex, Text } from "@chakra-ui/react";
import { EVENT_CARD_BG, EVENT_CARD_BORDER, FAMILY_COLOR, SectionEyebrow, TeamMark, swatchFor } from "./EventPrimitives";

// 1x2 slot. Top half: this season's color-outs as swatches in the named
// color with the host's mark. Bottom half: every other theme type this
// season, ranked by count. Slot is one row unit wide, so cqmin = width.

export const ThemeBoardCard = ({ colorOuts, themes, season }) => {
  const otherThemes = themes.filter((t) => t.typeId !== "color_out");
  const maxCount = Math.max(1, ...otherThemes.map((t) => t.count));

  return (
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
      gap="3cqmin"
    >
      <Box flexShrink={0}>
        <SectionEyebrow
          accent={FAMILY_COLOR.theme}
          right={
            <Text fontSize="3.4cqmin" fontWeight="bold" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
              {season}
            </Text>
          }
        >
          COLOR OUTS
        </SectionEyebrow>
      </Box>

      {colorOuts.length === 0 ? (
        <Flex flex="0 0 32%" align="center" justify="center" borderRadius="md" bg="rgba(255,255,255,0.03)">
          <Text fontSize="3.2cqmin" fontWeight="black" letterSpacing="0.3em" color="whiteAlpha.400">NONE ON FILE</Text>
        </Flex>
      ) : (
        <Flex flex="0 0 32%" gap="2cqmin" minH={0}>
          {colorOuts.slice(0, 4).map((occ) => {
            const swatch = swatchFor(occ.color, occ.host?.team);
            const dark = ["#0B0B0D", "#1E3A8A", "#7F1D1D", "#7C3AED"].includes(swatch);
            return (
              <Flex key={occ.key} direction="column" justify="space-between" flex={1} minW={0} p="2.5cqmin" borderRadius="md" bg={swatch} border="1px solid rgba(255,255,255,0.12)">
                <TeamMark team={occ.host?.team} teamId={occ.host?.teamId} size={9} />
                <Box minW={0}>
                  <Text fontSize="4.2cqmin" fontWeight="black" color={dark ? "white" : "#0B0B0D"} textTransform="uppercase" lineHeight={1} lineClamp={1}>
                    {occ.color} out
                  </Text>
                  <Text fontSize="3cqmin" fontWeight="bold" color={dark ? "whiteAlpha.700" : "rgba(0,0,0,0.6)"} lineHeight={1.2} lineClamp={1}>
                    {occ.dateLabel.replace(/^\w+ /, "")}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      )}

      <Box flexShrink={0} pt="1cqmin">
        <SectionEyebrow accent={FAMILY_COLOR.theme}>THEME DAYS</SectionEyebrow>
      </Box>

      {otherThemes.length === 0 ? (
        <Flex flex={1} align="center" justify="center">
          <Text fontSize="3.2cqmin" fontWeight="black" letterSpacing="0.3em" color="whiteAlpha.400">NONE ON FILE</Text>
        </Flex>
      ) : (
        <Flex direction="column" flex={1} minH={0} gap="1cqmin">
          {otherThemes.slice(0, 8).map((t) => (
            <Flex key={t.typeId} align="center" gap="2cqmin" flex={1} minH={0}>
              <Text fontSize="3.8cqmin" fontWeight="bold" color="whiteAlpha.800" w="46%" lineClamp={1} lineHeight={1.2}>
                {t.label}
              </Text>
              <Box flex={1} minW={0}>
                <Box h="2.2cqmin" w={`${Math.max(6, Math.round((t.count / maxCount) * 100))}%`} bg={FAMILY_COLOR.theme} opacity={0.85} borderRadius="1px" />
              </Box>
              <Text fontSize="4cqmin" fontWeight="black" color="white" w="6cqmin" textAlign="right" lineHeight={1}>
                {t.count}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default ThemeBoardCard;
