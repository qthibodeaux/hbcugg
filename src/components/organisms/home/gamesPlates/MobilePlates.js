import { Text, Flex, Box } from "@chakra-ui/react";
import { tint } from "./platePresentation";
import { Mark } from "../../../molecules/home/LiveTile";

// Phone Games tile collage, matchup and look-ahead presentation.

const abbr = (side) => side?.label ?? side?.shortName ?? side?.name ?? "";

const bleed = "calc(-1 * var(--hl-pad, 5cqmin))";

const MobileTag = ({ children }) => (
  <Text fontSize="6cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>{children}</Text>
);

const MobileRow = ({ side, score, won, decided }) => (
  <Flex align="center" gap="3cqmin" minW={0} bg={tint(side, won ? "40" : "1A")} px="4cqmin" flex={1} minH={0}>
    <Mark logo={side.logo} label={side.label} size={20} />
    <Text flex={1} minW={0} fontSize="11cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={1} color={!decided || won ? "white" : "whiteAlpha.600"} lineClamp={1}>
      {abbr(side)}
    </Text>
    {score != null && score !== "" ? (
      <Text fontSize="19cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" color={!decided || won ? "white" : "whiteAlpha.500"}>
        {score}
      </Text>
    ) : null}
  </Flex>
);

export const MobileMatchup = ({ tag, sub, game }) => {
  const a = Number(game.awayScore);
  const h = Number(game.homeScore);
  const decided = Number.isFinite(a) && Number.isFinite(h) && game.awayScore !== "" && game.homeScore !== "";
  return (
    <Flex direction="column" h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed}>
      <Flex justify="space-between" align="center" px="4cqmin" py="3.4cqmin" gap="2cqmin" bg="rgba(0,0,0,0.35)">
        <MobileTag>{tag}</MobileTag>
        {sub ? <Text fontSize="5cqmin" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" flexShrink={0}>{sub}</Text> : null}
      </Flex>
      <MobileRow side={game.away} score={decided ? game.awayScore : null} won={decided && a > h} decided={decided} />
      <Box h="1px" bg="rgba(0,0,0,0.5)" />
      <MobileRow side={game.home} score={decided ? game.homeScore : null} won={decided && h > a} decided={decided} />
    </Flex>
  );
};

export const CollageMobile = ({ games, label, fallback }) => {
  const four = games.slice(0, 4);
  return (
    <Box h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed} display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gridTemplateRows="repeat(2, minmax(0, 1fr))">
      {four.map((g) => (
        <Flex key={g.id} direction="column" minW={0} minH={0} borderRight="1px solid rgba(0,0,0,0.5)" borderBottom="1px solid rgba(0,0,0,0.5)">
          {[g.away, g.home].map((side) => {
            const won = g.winnerTeamId && side.teamId === g.winnerTeamId;
            return (
              <Flex key={side.teamId} flex={1} align="center" justify="space-between" gap="1.5cqmin" px="2.5cqmin" bg={tint(side, won ? "40" : "14")} minH={0}>
                <Mark logo={side.logo} label={side.label} size={11} />
                <Text fontSize="13cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" color={won ? "white" : "whiteAlpha.500"}>
                  {side.score}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      ))}
      {label && four.length < 4 ? (
        <Flex direction="column" align="center" justify="center">
          <Text fontSize="6cqmin" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase">{fallback ? label.season : "Week"}</Text>
          <Text fontSize="22cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} color="white">{label.week}</Text>
        </Flex>
      ) : null}
    </Box>
  );
};

export const LookAheadMobile = ({ game }) => (
  <Flex direction="column" h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed}>
    <Flex direction="column" justify="center" px="4cqmin" py="3cqmin" bg="rgba(0,0,0,0.35)">
      <MobileTag>Look ahead</MobileTag>
      <Text fontSize="15cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1} mt="1.5cqmin" textTransform="uppercase" lineClamp={1}>{game.dateLabel}</Text>
    </Flex>
    <MobileRow side={game.away} decided={false} />
    <Box h="1px" bg="rgba(0,0,0,0.5)" />
    <MobileRow side={game.home} decided={false} />
  </Flex>
);
