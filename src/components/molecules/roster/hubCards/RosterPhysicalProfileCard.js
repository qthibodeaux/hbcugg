import { BODY_PROFILE_BUCKETS, weightedAverage, inchesToFeet } from "./rosterCardModel";
import { CardShell } from "./RosterCardPrimitives";
import { Flex, Box, Text, SimpleGrid } from "@chakra-ui/react";

export const RosterPhysicalProfileCard = ({ model, accent }) => {
  const groups = model.physical.groups.filter((item) => item.count > 0);
  // model.physical.tiers is the backend's own LINE/BOX/SKILL grouping
  // (roster_hub_team contract) — prefer it over the client-side bucket
  // guess below when it's present, since group membership isn't identical
  // (QB lands in SKILL there, not BOX).
  const bodyProfiles = model.physical.tiers?.length
    ? model.physical.tiers.map((tier) => ({
        key: tier.key,
        label: tier.label,
        count: tier.count,
        height: tier.height_avg,
        weight: tier.weight_avg,
        groupLabel: tier.groups.join(" + "),
      }))
    : BODY_PROFILE_BUCKETS.map((bucket) => {
        const bucketGroups = groups.filter((item) => bucket.groups.includes(item.group));
        return {
          ...bucket,
          count: bucketGroups.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
          height: weightedAverage(bucketGroups, "height_avg"),
          weight: weightedAverage(bucketGroups, "weight_avg"),
          groupLabel: bucketGroups.map((item) => item.group).join(" + "),
        };
      }).filter((item) => item.count > 0);
  const largestRooms = [...groups]
    .filter((item) => item.group && item.group !== "Unknown" && Number.isFinite(Number(item.weight_avg)))
    .sort((a, b) => Number(b.weight_avg) - Number(a.weight_avg))
    .slice(0, 3);

  return (
    <CardShell title="Frame Profile" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" gap={3} minH={0}>
        <Box>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Size by body type
          </Text>
        </Box>

        <Flex direction="column" gap={2}>
          {bodyProfiles.map((item, index) => (
            <Box
              key={item.key}
              bg={index === 0 ? `${accent}22` : "whiteAlpha.100"}
              border="1px solid"
              borderColor={index === 0 ? accent : "whiteAlpha.100"}
              borderRadius="md"
              px={2.5}
              py={2}
            >
              <Flex align="center" justify="space-between" gap={2}>
                <Box minW={0}>
                  <Text fontSize="lg" color={index === 0 ? accent : "text.primary"} fontWeight="black" lineHeight="0.9" textTransform="uppercase" lineClamp={1}>
                    {item.label}
                  </Text>
                  <Text mt="3px" fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
                    {item.groupLabel}
                  </Text>
                </Box>
                <SimpleGrid columns={2} gap={2} flexShrink={0} minW="82px">
                  <Box textAlign="right">
                    <Text fontSize="8px" color="text.muted" fontWeight="black" lineHeight="1" textTransform="uppercase">
                      Hgt
                    </Text>
                    <Text mt="2px" fontSize="sm" color="text.primary" fontWeight="black" lineHeight="1">
                      {inchesToFeet(item.height)}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="8px" color="text.muted" fontWeight="black" lineHeight="1" textTransform="uppercase">
                      Wgt
                    </Text>
                    <Text mt="2px" fontSize="sm" color={accent} fontWeight="black" lineHeight="1">
                      {item.weight ? `${Math.round(item.weight)}` : "--"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Flex>
            </Box>
          ))}
        </Flex>

        <Box mt="auto">
          <Text mb={2} fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Biggest rooms
          </Text>
          <Flex direction="column" gap={1.5}>
            {largestRooms.map((item) => (
              <Flex key={item.group} align="center" justify="space-between" gap={2} borderTop="1px solid" borderColor="whiteAlpha.100" pt={1.5}>
                <Text fontSize="10px" color="text.primary" fontWeight="black">
                  {item.group}
                </Text>
                <Text fontSize="10px" color="text.secondary" fontWeight="bold">
                  {inchesToFeet(item.height_avg)}
                </Text>
                <Text fontSize="10px" color={accent} fontWeight="black">
                  {Math.round(item.weight_avg)} lbs
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </CardShell>
  );
};
