import { getClassCount, isLightColor } from "./featureRailModel";
import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

export const RosterDnaBlock = ({ model, team, secondaryAccent }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const juniorCount = getClassCount(model, "Jr.");
  const seniorCount = getClassCount(model, "Sr.");
  const graduateCount = getClassCount(model, "Gr.");

  return (
    <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={4} py={4}>
      <Text position="absolute" right="-10px" bottom="-18px" fontSize="72px" fontWeight="black" color={primary} opacity={0.07} lineHeight="1">
        {Math.round(model.kpis.upperclassPct ?? 0)}
      </Text>
      <Flex h="100%" direction="column" justify="center" position="relative" zIndex={1}>
        <Text fontSize="8px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.16em">
          Roster DNA
        </Text>
        <Text mt={2} fontSize="3xl" fontWeight="black" color={primary} textTransform="uppercase" lineHeight="0.82">
          {model.identity}
        </Text>
        <Grid mt={3} templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {[
            ["Jr.", juniorCount],
            ["Sr.", seniorCount],
            ["Gr.", graduateCount],
          ].map(([label, count]) => (
            <Box key={label}>
              <Text fontSize="lg" fontWeight="black" color={secondaryAccent} lineHeight="1">
                {count}
              </Text>
              <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase">
                {label}
              </Text>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export const ClassStackBlock = ({ model, team, secondaryAccent }) => {
  const { isMobile } = useLayoutDensity();
  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const accent = team.colors?.accent ?? secondaryAccent;
  const readableSecondary = isLightColor(secondary) ? accent : secondary;
  const classStack = model.composition.classDistribution.filter((item) => item.count > 0);
  const colorFor = (index) => [primary, `${primary}CC`, secondaryAccent, "#111111", readableSecondary][index % 5];

  // Mobile — the horizontal segmented bar can't work in a ~110px column:
  // five segments at minW 12% land ~22px each while the count inside them
  // renders at 18px, so the numbers overlapped into an unreadable smear.
  // Each class becomes its own row instead — label, a proportional bar, and
  // the count — which reads correctly at any column width.
  if (isMobile) {
    const maxCount = Math.max(...classStack.map((item) => item.count), 1);

    return (
      <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={2} py={2}>
        <Flex h="100%" direction="column" justify="center" gap="2px">
          <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.12em" mb="2px">
            Class Stack
          </Text>
          {classStack.map((item, index) => (
            <Flex key={item.class} align="center" gap="3px" minW={0}>
              <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase" w="14px" flexShrink={0}>
                {String(item.class).replace(".", "")}
              </Text>
              <Box flex="1" h="6px" bg={`${primary}1A`} minW={0}>
                <Box h="100%" w={`${Math.round((item.count / maxCount) * 100)}%`} bg={colorFor(index)} />
              </Box>
              <Text fontSize="8px" fontWeight="black" color={primary} w="14px" textAlign="right" flexShrink={0}>
                {item.count}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  }

  return (
    <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={4} py={4}>
      <Flex h="100%" direction="column" justify="center">
        <Text fontSize="8px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.16em">
          Class Stack
        </Text>
        <Flex mt={3} h="46px" w="100%" overflow="hidden" border={`1px solid ${primary}29`}>
          {classStack.map((item, index) => {
            const bg = colorFor(index);
            return (
              <Flex
                key={item.class}
                w={`${item.pct ?? 0}%`}
                minW="12%"
                bg={bg}
                align="center"
                justify="center"
                direction="column"
                color={isLightColor(bg) ? primary : "white"}
              >
                <Text fontSize="lg" fontWeight="black" lineHeight="1">
                  {item.count}
                </Text>
                <Text fontSize="7px" fontWeight="black" textTransform="uppercase" lineHeight="1">
                  {String(item.class).replace(".", "")}
                </Text>
              </Flex>
            );
          })}
        </Flex>
        <Text mt={3} fontSize="10px" fontWeight="black" color={secondaryAccent} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
          {Math.round(model.kpis.upperclassPct ?? 0)}% upperclass players
        </Text>
      </Flex>
    </Box>
  );
};
