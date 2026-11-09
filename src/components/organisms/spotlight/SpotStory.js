import { ThenVsNow, RecordBook, WhenThen, RankBars, StatTiles, VsNorm } from "./story/StoryComparisonVisuals";
import { WpAnnotated, QuarterBars, OddsBar } from "./story/StoryGameVisuals";
import { People, Label } from "./story/StoryPrimitives";
import { useRef } from "react";
import { toneOf, fixNames } from "./spotlightModel";
import { ghostOf } from "./story/storyLayout";
import { Box, Text, Flex } from "@chakra-ui/react";
import { ExportCardButton } from "../stats/ExportCardButton";

const VISUAL = {
  then_vs_now: ThenVsNow,
  record_book: RecordBook,
  when_then_split: WhenThen,
  wp_timeline_annotated: WpAnnotated,
  quarter_bars: QuarterBars,
  odds_bar: OddsBar,
  rank_bars: RankBars,
  stat_tiles: StatTiles,
  dumbbell_vs_norm: VsNorm,
  player_cards: People,
  staff_cards: People,
};

export const StoryTile = ({ card, index, palette, teamId, season, tone, mobile = false, filename }) => {
  const ref = useRef(null);
  const t = toneOf(tone, palette);
  const Visual = VISUAL[card.visual?.type];
  const ghost = ghostOf(card);
  return (
    <Box ref={ref} position="relative" overflow="hidden" w="full" h={mobile ? "auto" : "full"} bg={t.bg} color={t.text}
      borderRadius={mobile ? 0 : "lg"} border={mobile ? "none" : "1px solid"} borderColor="line"
      px={mobile ? "0.85rem" : "1.1rem"} py={mobile ? "1rem" : "1rem"} display="flex" flexDirection="column" minW={0}>
      {ghost && (
        <Text position="absolute" right="-0.4rem" bottom="-1.6rem" fontSize={mobile ? "6rem" : "8rem"} fontWeight="black" fontStyle="italic" lineHeight={1}
          color={t.text} opacity={t.ghost} pointerEvents="none" whiteSpace="nowrap">{ghost}</Text>
      )}
      <Flex position="relative" align="center" justify="space-between" gap="0.6rem" mb="0.5rem">
        <Flex align="center" gap="0.45rem" minW={0}>
          <Box w="0.45rem" h="0.45rem" borderRadius="full" bg={t.accent} flexShrink={0} />
          <Label t={t} color={t.text} opacity={0.85} lineClamp={1}>{card.persona}</Label>
        </Flex>
        <ExportCardButton target={ref} filename={filename} compact />
      </Flex>
      <Text position="relative" fontSize={mobile ? "1.45rem" : "clamp(1.25rem, 1.9vw, 1.9rem)"} fontWeight="950" fontStyle="italic" textTransform="uppercase"
        letterSpacing="-0.02em" lineHeight={1} color={t.text}>
        {fixNames(card.headline)}
      </Text>
      {card.dek && (
        <Text position="relative" mt="0.45rem" fontSize={mobile ? "0.85rem" : "0.8rem"} fontWeight="600" lineHeight={1.4} color={t.muted} lineClamp={mobile ? undefined : 3}>
          {fixNames(card.dek)}
        </Text>
      )}
      {Visual && (
        <Box position="relative" mt="0.85rem" flex={mobile ? undefined : 1} minH={0}>
          <Visual v={card.visual} card={card} t={t} palette={palette} teamId={teamId} season={season} id={index} logo={palette.team?.logo} />
        </Box>
      )}
    </Box>
  );
};

export { LAYOUT } from "./story/storyLayout";
