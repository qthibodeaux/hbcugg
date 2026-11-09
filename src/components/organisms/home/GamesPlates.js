import { useTileVariant, Micro, BigNumber } from "../../molecules/home/LiveTile";
import { CollageMobile, MobileMatchup, LookAheadMobile } from "./gamesPlates/MobilePlates";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CollageCell, WeekCell } from "./gamesPlates/CollageCells";
import { tint, Reasons } from "./gamesPlates/platePresentation";
import { WeekSide, QuarterRow, AheadSide } from "./gamesPlates/FeaturedPlates";

export const CollagePlate = ({ games, label, fallback }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <CollageMobile games={games} label={label} fallback={fallback} />;
  const cols = games.length <= 1 ? 1 : games.length <= 4 ? 2 : 3;
  const hasSpare = label && games.length % cols !== 0;
  return (
    <Box position="relative" h="100%">
      <Box display="grid" h="100%" gap="1.6cqmin" gridTemplateColumns={`repeat(${cols}, minmax(0, 1fr))`} gridAutoRows="minmax(0, 1fr)">
        {games.map((g) => <CollageCell key={g.id} game={g} />)}
        {hasSpare ? <WeekCell label={label} fallback={fallback} /> : null}
      </Box>
      {/* No spare cell to carry the label, but the games are borrowed: say so. */}
      {label && fallback && !hasSpare ? (
        <Micro position="absolute" right="0" bottom="-1.2cqmin" size={2.2} color="rgba(255,255,255,0.35)">{label.season} · Week {label.week}</Micro>
      ) : null}
    </Box>
  );
};

export const GameOfWeekPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <MobileMatchup tag="Game of the week" game={game} />;
  const awayWon = Number(game.awayScore) > Number(game.homeScore);
  const homeWon = Number(game.homeScore) > Number(game.awayScore);
  return (
    <Flex direction="column" justify="space-between" h="100%" gap="2cqmin" position="relative">
      <Box position="absolute" inset="-5cqmin" pointerEvents="none" bg={`linear-gradient(100deg, ${tint(game.away, "40")} 0%, transparent 42%, transparent 58%, ${tint(game.home, "40")} 100%)`} />
      <Flex position="relative" justify="space-between" align="baseline" gap="2cqmin">
        <Micro color="white" size={3.4}>Game of the Week</Micro>
        <Micro size={2.8}>{game.stageLabel} · {game.dateLabel}</Micro>
      </Flex>
      <Flex position="relative" align="center" justify="space-between" gap="3cqmin">
        <WeekSide side={game.away} won={awayWon} align="flex-start" />
        <Flex align="center" gap="2cqmin" flexShrink={0}>
          <BigNumber size={22} color={awayWon ? "white" : "whiteAlpha.600"}>{game.awayScore}</BigNumber>
          <Text fontSize="9cqmin" color="whiteAlpha.400" fontWeight="black">–</Text>
          <BigNumber size={22} color={homeWon ? "white" : "whiteAlpha.600"}>{game.homeScore}</BigNumber>
        </Flex>
        <WeekSide side={game.home} won={homeWon} align="flex-end" />
      </Flex>
      <Box position="relative"><Reasons lines={game.whyReasons?.length ? game.whyReasons : [game.supportingLine]} /></Box>
    </Flex>
  );
};

export const SpotlightPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <MobileMatchup tag="Spotlight" sub={game.dateLabel} game={game} />;
  const awayWon = Number(game.awayScore) > Number(game.homeScore);
  const homeWon = Number(game.homeScore) > Number(game.awayScore);
  const qCount = Math.max(game.awayByQ?.length ?? 0, game.homeByQ?.length ?? 0);
  return (
    <Flex direction="column" justify="space-between" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="baseline" gap="2cqmin">
        <Micro color="white" size={3.4}>Spotlight</Micro>
        <Micro size={2.8}>{game.stageLabel}{game.dateLabel ? ` · ${game.dateLabel}` : ""}</Micro>
      </Flex>
      <Flex direction="column" gap="3.2cqmin">
        {qCount ? (
          <Flex justify="flex-end" gap="2.4cqmin" pr="14cqmin">
            {Array.from({ length: qCount }, (_, i) => (
              <Micro key={i} size={2.4} w="5cqmin" textAlign="center" color="rgba(255,255,255,0.3)">{i < 4 ? `Q${i + 1}` : "OT"}</Micro>
            ))}
          </Flex>
        ) : null}
        <QuarterRow side={game.away} byQ={game.awayByQ} total={game.awayScore} won={awayWon} />
        <QuarterRow side={game.home} byQ={game.homeByQ} total={game.homeScore} won={homeWon} />
      </Flex>
      <Micro color="brand.300" size={3} lineClamp={2}>{game.summary}</Micro>
    </Flex>
  );
};

export const LookAheadPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <LookAheadMobile game={game} />;
  return (
  <Flex direction="column" justify="space-between" h="100%" gap="2cqmin">
    <Flex justify="space-between" align="baseline" gap="2cqmin">
      <Micro color="white" size={3.4}>Look Ahead</Micro>
      <Micro size={2.8}>{game.stageLabel}</Micro>
    </Flex>
    <Flex align="center" gap="5cqmin">
      <Flex direction="column" flexShrink={0}>
        <BigNumber size={20}>{game.dateLabel}</BigNumber>
        {game.kickoffLabel ? <Micro size={2.8} mt="1.4cqmin">{game.kickoffLabel}</Micro> : null}
      </Flex>
      <Flex direction="column" gap="3cqmin" minW={0}>
        <AheadSide side={game.away} />
        <AheadSide side={game.home} />
      </Flex>
    </Flex>
    <Reasons lines={game.whyReasons?.length ? game.whyReasons : [game.supportingLine]} />
  </Flex>
  );
};
