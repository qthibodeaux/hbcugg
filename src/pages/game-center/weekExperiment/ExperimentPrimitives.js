import { Box, Image, Flex, Text } from "@chakra-ui/react";

export const TeamLogo = ({ team, size = "34px", muted = false }) => (
  <Box w={size} h={size} opacity={muted ? 0.34 : 1} flexShrink={0}>
    {team?.logo ? (
      <Image src={team.logo} alt={team.label ?? team.shortName ?? "Team"} w="100%" h="100%" objectFit="contain" />
    ) : (
      <Flex w="100%" h="100%" align="center" justify="center" borderRadius="md" bg="whiteAlpha.100">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {String(team?.label ?? "?").slice(0, 2).toUpperCase()}
        </Text>
      </Flex>
    )}
  </Box>
);

export const MetricPoster = ({ label, value, detail, accent = "#E53E3E" }) => (
  <Box
    h="100%"
    w="full"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    overflow="hidden"
    bg={`linear-gradient(160deg, ${accent}28 0%, rgba(15,15,18,0.96) 48%, #0B0B0D 100%)`}
  >
    <Flex h="100%" direction="column" px={4} py={4}>
      <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
        {label}
      </Text>
      <Text mt={3} fontSize="clamp(2.2rem, 4vw, 4.4rem)" color="white" fontWeight="black" lineHeight={0.82}>
        {value}
      </Text>
      <Text mt="auto" fontSize="xs" color="text.secondary" fontWeight="bold" lineHeight={1.35}>
        {detail}
      </Text>
    </Flex>
  </Box>
);
