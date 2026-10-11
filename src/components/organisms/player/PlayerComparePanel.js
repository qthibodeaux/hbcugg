import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import PlayerComparisonCard from "../../molecules/visualizations/PlayerComparisonCard";

const PlayerComparePanel = ({ player, teamMeta, parScore, gloryRating, leagueAvgs, onCompare }) => (
  <Grid templateColumns={{ base: "1fr", md: "1fr 300px" }} gap={6} pb={12}>
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={6}
    >
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center" gap={2}>
          <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="white"
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            vs Position Average
          </Text>
        </Flex>
        <Flex gap={4} align="center">
          <Flex align="center" gap={1}>
            <Box w="10px" h="3px" bg="brand.500" borderRadius="full" />
            <Text fontSize="9px" color="text.muted">
              {player.name_display?.split(" ").pop()}
            </Text>
          </Flex>
          <Flex align="center" gap={1}>
            <Box w="10px" h="3px" bg="whiteAlpha.300" borderRadius="full" />
            <Text fontSize="9px" color="text.muted">
              Avg
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <PlayerComparisonCard
        comparisons={[
          {
            label: "PAR Rating",
            playerVal: parseFloat(parScore.toFixed(1)),
            leagueVal: leagueAvgs.par,
          },
          {
            label: "Glory Index",
            playerVal: gloryRating,
            leagueVal: Math.round(50 + leagueAvgs.par * 0.8),
          },
          {
            label: "Games Played",
            playerVal: player.games_played ?? 0,
            leagueVal: Math.round(leagueAvgs.games),
          },
        ]}
        playerName={player.name_display}
      />
    </Box>

    <Box>
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={5}
        mb={4}
      >
        <Text
          fontSize="9px"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb={3}
        >
          Position Rank Context
        </Text>
        <Text fontSize="3xl" fontWeight="black" color="white" lineHeight={1}>
          {player.position ?? "—"}
        </Text>
        <Text fontSize="xs" color="text.muted" mt={1}>
          {teamMeta.conference ?? "HBCU"}
        </Text>
      </Box>

      <Box
        as="button"
        w="100%"
        bg="brand.500"
        color="white"
        borderRadius="xl"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        _hover={{ bg: "brand.600" }}
        transition="all 0.15s"
        onClick={onCompare}
      >
        <Box textAlign="left">
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Compare Players
          </Text>
          <Text fontSize="9px" color="whiteAlpha.700" mt={1}>
            Launch VS Protocol
          </Text>
        </Box>
        <ChevronRight size={18} />
      </Box>
    </Box>
  </Grid>
);

export default PlayerComparePanel;
