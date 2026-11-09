import { matchupData, directionData } from "./sfaPvamu/previewModel";
import { Box, VStack, Flex, Text, Grid } from "@chakra-ui/react";
import { StatColumn } from "./sfaPvamu/StatColumn";
import { DirectionCard } from "./sfaPvamu/DirectionCard";

export const SfaPvamuPreviewA = () => {
  // Matchup pairs: each offense sits next to the defense it will face.
  const teamOrder = [
    { key: "sfaOffense", data: matchupData.sfaOffense },
    { key: "pvamuDefense", data: matchupData.pvamuDefense },
    { key: "pvamuOffense", data: matchupData.pvamuOffense },
    { key: "sfaDefense", data: matchupData.sfaDefense },
  ];

  return (
    <Box w="100%" h="100%" bg="bg.primary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
      <VStack align="stretch" gap={0} h="100%">
        <Flex
          align="center"
          justify="space-between"
          px={4}
          py={3}
          borderBottom="1px solid"
          borderColor="whiteAlpha.100"
          bg="linear-gradient(90deg, rgba(17,17,19,0.98) 0%, rgba(25,26,29,0.96) 100%)"
        >
          <Flex align="center" gap={3} minW={0}>
            <Box
              w="26px"
              h="26px"
              borderRadius="full"
              bg="linear-gradient(135deg, #D7444B 0%, #8D4CC3 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="11px"
              fontWeight="900"
              color="white"
            >
              S
            </Box>
            <Box minW={0}>
              <Text fontSize="14px" fontWeight="900" color="text.primary" letterSpacing="0.06em" textTransform="uppercase">
                SFA vs PVAMU
              </Text>
              <Text fontSize="9px" color="text.muted" letterSpacing="0.09em" textTransform="uppercase">
                Saturday · Panther Stadium · Prairie View, TX
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={3}>
            <Box
              px={2}
              py={1}
              border="1px solid"
              borderColor="whiteAlpha.100"
              bg="rgba(255,255,255,0.02)"
              borderRadius="md"
            >
              <Text fontSize="9px" color="text.muted" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
                Weather
              </Text>
              <Text fontSize="10px" color="text.primary" fontWeight="700">
                88° / 76° · Partly cloudy
              </Text>
            </Box>
            <Box px={2} py={1} borderRadius="md" bg="rgba(255,255,255,0.02)" border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="9px" color="text.muted" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
                Kickoff
              </Text>
              <Text fontSize="10px" color="text.primary" fontWeight="700">
                6:00 PM CT
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Box px={2} py={2} bg="rgba(255,255,255,0.02)">
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2} alignItems="stretch">
            {teamOrder.map(({ key, data }, index) => (
              <StatColumn key={key} teamKey={key} data={data} isFirst={index === 0} />
            ))}
          </Grid>
        </Box>

        <Box px={2} pb={2}>
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
            {teamOrder.map(({ key, data }) => (
              <DirectionCard
                key={key}
                title={data.title}
                accent={data.accent}
                data={directionData[key]}
                isDefense={key.endsWith("Defense")}
              />
            ))}
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};
