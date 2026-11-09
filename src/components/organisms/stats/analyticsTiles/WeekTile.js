import { useContext, useMemo, useState } from "react";
import { TileMobile, BRAND, POS, NEG, WideRow, WideLogo, WideNum, fmtSigned, Mark, hfs, Empty, Body, Rotator, TileTitle } from "./TilePrimitives";
import { Box, Flex, Text } from "@chakra-ui/react";

const WeekBar = ({ winner, loser, edge, cycle }) => {
  const mobile = useContext(TileMobile);
  const color = winner?.primary && winner.primary !== "#000000" ? winner.primary : BRAND;
  const numberColor = Number.isFinite(edge) ? (edge >= 0 ? POS : NEG) : "rgba(255,255,255,0.6)";
  // Wide: the bar turns on its side — winner, the edge on a bar of the
  // winner's colour, the loser trailing behind.
  if (mobile) {
    return (
      <WideRow gap="0.55rem">
        <Box key={`w-${cycle}`} className="ta-tile-drop"><WideLogo team={winner} size="2.5rem" /></Box>
        <Flex
          key={`bar-${cycle}`}
          className="ta-tile-grow-right"
          flex={1}
          minW={0}
          h="2.6rem"
          bg={color}
          align="center"
          justify="center"
          boxShadow={`0 0 1rem ${color}55`}
        >
          <WideNum key={`n-${cycle}`} className="ta-tile-pop" color={numberColor} size="1.7rem" textShadow="0 0 0.5rem rgba(0,0,0,0.9)">
            {fmtSigned(edge, 3)}
          </WideNum>
        </Flex>
        <Box key={`l-${cycle}`} className="ta-tile-rise"><WideLogo team={loser} size="1.6rem" dim /></Box>
      </WideRow>
    );
  }
  return (
    <Flex direction="column" align="center" h={mobile ? "100%" : "40cqmin"} w="100%">
      <Box key={`w-${cycle}`} className="ta-tile-drop" flexShrink={0}>
        <Mark logo={winner?.logo} label={winner?.short} size={9} />
      </Box>
      <Box h="0.5cqmin" w="100%" bg="rgba(255,255,255,0.6)" borderRadius="full" mt="1.2cqmin" flexShrink={0} />
      <Flex
        key={`bar-${cycle}`}
        className="ta-tile-grow-down ta-tile-breathe"
        flex={1}
        minH={0}
        w="62%"
        bg={color}
        borderBottomRadius="1cqmin"
        align="center"
        justify="center"
        boxShadow={`0 0 3cqmin ${color}55`}
      >
        <Text
          key={`n-${cycle}`}
          className="ta-tile-pop"
          fontSize={hfs(8)}
          fontWeight="black"
          color={numberColor}
          lineHeight={1}
          letterSpacing="-0.04em"
          fontVariantNumeric="tabular-nums"
          textShadow="0 0 1.2cqmin rgba(0,0,0,0.9), 0 0.3cqmin 0.8cqmin rgba(0,0,0,0.8)"
        >
          {fmtSigned(edge, 3)}
        </Text>
      </Flex>
      <Box key={`l-${cycle}`} className="ta-tile-rise" mt="1.5cqmin" flexShrink={0}>
        <Mark logo={loser?.logo} label={loser?.short} size={6} />
      </Box>
    </Flex>
  );
};

export const WeekBody = ({ review }) => {
  const games = useMemo(() => {
    const weeks = Array.isArray(review?.weeks) ? review.weeks : [];
    const played = weeks.filter((w) => w.played && w.games?.length);
    const preferred = review?.defaultWeek ?? review?.default_week;
    const week = played.find((w) => w.week === preferred) ?? played[played.length - 1] ?? null;
    if (!week) return { week: null, list: [] };
    const list = week.games
      .map((g) => ({ ...g, edge: Number.isFinite(g.winner_edge) ? g.winner_edge : null }))
      .filter((g) => g.winner_id)
      .sort((a, b) => (a.edge ?? Infinity) - (b.edge ?? Infinity))
      .slice(0, 3);
    return { week, list };
  }, [review]);
  const [i, setI] = useState(0);
  const g = games.list[i % Math.max(1, games.list.length)];
  if (!g) return <Empty>No games yet</Empty>;

  const winner = g.winner_id === g.home?.id ? g.home : g.away;
  const loser = winner === g.home ? g.away : g.home;

  return (
    <Body
      cycle={i}
      live={games.list.length > 1}
      top={
        <>
          <Rotator count={games.list.length} onTick={() => setI((v) => (v + 1) % games.list.length)} />
          <TileTitle>{games.week.label}</TileTitle>
        </>
      }
    >
      <WeekBar winner={winner} loser={loser} edge={g.edge} cycle={i} />
    </Body>
  );
};
