import { Box, Flex, Text } from "@chakra-ui/react";

const TeamScoreBlock = ({ label, score, align = "left" }) => (
  <Box flex={1} textAlign={align}>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={1}>
      {label || "Team"}
    </Text>
    <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" color="text.primary" lineHeight={1}>
      {score ?? 0}
    </Text>
  </Box>
);

const ScoreBanner = ({ meta }) => {
  const away = meta?.away_team ?? {};
  const home = meta?.home_team ?? {};

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      px={{ base: 5, md: 7 }}
      py={{ base: 6, md: 8 }}
      mb={8}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <TeamScoreBlock label={away.abbreviation || away.id || "Away"} score={away.score} align="left" />
        <Box textAlign="center" px={2}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={1}>
            Final
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="brand.400">
            {meta?.date || "Date TBA"}
          </Text>
          <Text fontSize="xs" color="text.secondary" mt={1} maxW="180px" lineClamp={2}>
            {meta?.site || "Location TBA"}
          </Text>
        </Box>
        <TeamScoreBlock label={home.abbreviation || home.id || "Home"} score={home.score} align="right" />
      </Flex>
    </Box>
  );
};

export default ScoreBanner;
