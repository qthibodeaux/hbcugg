import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import SeasonVelocityCard from "../../molecules/visualizations/SeasonVelocityCard";

const PlayerSeasonStatsPanel = ({ player, parScore, gloryRating }) => (
  <Grid
    templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 300px" }}
    gap={6}
    pb={12}
  >
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={5}
    >
      <Flex align="center" gap={2} mb={5}>
        <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Production Overview
        </Text>
      </Flex>
      <Grid templateColumns="1fr 1fr" gap={4}>
        {[
          { label: "PAR Score", value: parScore.toFixed(1), color: "brand.400" },
          { label: "Games", value: player.games_played ?? "—", color: "white" },
          {
            label: "Position",
            value: player.position ?? player.position_abbr ?? "—",
            color: "brand.400",
          },
          { label: "Class", value: player.class_year ?? "—", color: "white" },
        ].map(({ label, value, color }) => (
          <Box key={label}>
            <Text
              fontSize="9px"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={1}
            >
              {label}
            </Text>
            <Text fontSize="xl" fontWeight="black" color={color} lineHeight={1}>
              {value}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>

    <SeasonVelocityCard par={parScore} games={player.games_played} />

    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={5}
    >
      <Text
        fontSize="9px"
        color="text.muted"
        textTransform="uppercase"
        letterSpacing="0.1em"
        mb={4}
      >
        Conference Standing
      </Text>
      <Box mb={3}>
        <Text fontSize="4xl" fontWeight="black" color="brand.400" lineHeight={1}>
          {gloryRating}
        </Text>
        <Text fontSize="xs" color="text.muted">
          Glory Rating
        </Text>
      </Box>
      <Box mb={3}>
        <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>
          {parScore.toFixed(1)}
        </Text>
        <Text fontSize="xs" color="text.muted">
          PAR Score
        </Text>
      </Box>
      <Box
        mt={4}
        pt={4}
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
        as="button"
        w="100%"
        textAlign="left"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        color="brand.400"
        _hover={{ color: "brand.300" }}
        transition="color 0.15s"
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        Full Prospect Deep-Dive
        <ChevronRight size={14} />
      </Box>
    </Box>
  </Grid>
);

export default PlayerSeasonStatsPanel;
