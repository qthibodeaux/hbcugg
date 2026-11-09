import { Flex, Text } from "@chakra-ui/react";
import { tint } from "./platePresentation";
import { Mark, Micro } from "../../../molecules/home/LiveTile";

// Home Games collage matchup and spare-week cells.

export const CollageCell = ({ game }) => (
  <Flex
    direction="column"
    justify="center"
    gap="1cqmin"
    minW={0}
    minH={0}
    px="2cqmin"
    py="1.4cqmin"
    borderRadius="lg"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={`linear-gradient(100deg, ${tint(game.away)} 0%, #1A1A1D 48%, ${tint(game.home)} 100%)`}
  >
    {[game.away, game.home].map((side) => {
      const won = game.winnerTeamId && side.teamId === game.winnerTeamId;
      return (
        <Flex key={side.teamId} align="center" justify="space-between" gap="1.2cqmin" minW={0}>
          <Flex align="center" gap="1.4cqmin" minW={0}>
            <Mark logo={side.logo} label={side.label} size={6.4} />
            <Text fontSize="3cqmin" fontWeight="black" textTransform="uppercase" letterSpacing="0.04em" color={won ? "white" : "whiteAlpha.600"} lineClamp={1}>
              {side.label}
            </Text>
          </Flex>
          <Text fontSize="6.4cqmin" fontWeight="black" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={won ? "white" : "whiteAlpha.500"}>
            {side.score}
          </Text>
        </Flex>
      );
    })}
  </Flex>
);

export const WeekCell = ({ label, fallback }) => (
  <Flex direction="column" justify="center" align="center" minW={0} minH={0} borderRadius="lg" border="1px dashed" borderColor="whiteAlpha.200">
    <Micro size={2.6} color="rgba(255,255,255,0.4)">{fallback ? label.season : "Week"}</Micro>
    <Text fontSize="9cqmin" fontWeight="black" fontStyle="italic" lineHeight={1} color="white" fontVariantNumeric="tabular-nums">
      {fallback ? `Wk ${label.week}` : label.week}
    </Text>
  </Flex>
);
