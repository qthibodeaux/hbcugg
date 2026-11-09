import { lastPlayedWeek, SHINE, SHINE_CSS, withWeeks } from "./gridPresentation";
import { getGameWeek } from "../../../../utils/gamesHubModel";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { GameCell } from "./GameTile";

// Games Hub week grid and first-cell scroll ref attachment for desktop/phone layouts.

export const GamesGrid = ({ games, mobile = false, jumpRef = undefined }) => {
  const target = lastPlayedWeek(games);
  // The week after the last one played that actually has games.
  const next = games.map(getGameWeek).filter((w) => Number.isFinite(w) && (target == null || w > target)).sort((a, b) => a - b)[0] ?? null;
  const order = {};
  const shineFor = (game) => {
    const w = getGameWeek(game);
    const kind = w === target ? "recent" : w === next ? "upcoming" : null;
    if (!kind) return null;
    const i = (order[kind] = (order[kind] ?? -1) + 1);
    return { color: SHINE[kind], delay: (kind === "upcoming" ? 450 : 0) + i * 55 };
  };
  return (
  <Box bg="bg.secondary" border={mobile ? "none" : "1px solid"} borderColor="whiteAlpha.100" borderRadius={mobile ? "0" : "xl"} overflow="hidden">
    <style>{SHINE_CSS}</style>
    {games.length === 0 ? (
      <Flex justify="center" align="center" minH="120px" m={2} border="1px dashed" borderColor="whiteAlpha.200" borderRadius="lg">
        <Text color="text.muted" fontWeight="bold">No games match the current filters.</Text>
      </Flex>
    ) : (
      // Six to eight across by breakpoint. Every track is `minmax(0, 1fr)` — the
      // old `minmax(180px, 1fr)` set a 1,440px floor on eight columns, wider than
      // the container, so the last columns were clipped rather than shown.
      <Grid
        // Phones: four across, flush.
        templateColumns={mobile ? "repeat(4, minmax(0, 1fr))" : {
          base: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(6, minmax(0, 1fr))",
          lg: "repeat(7, minmax(0, 1fr))",
          xl: "repeat(8, minmax(0, 1fr))",
        }}
        gap={0}
        alignItems="stretch"
      >
        {withWeeks(games).map(({ game, tint, weekLabel }) => (
          <GameCell
            key={game.id}
            game={game}
            tint={tint}
            weekLabel={weekLabel}
            mobile={mobile}
            cellRef={weekLabel && getGameWeek(game) === target ? jumpRef : undefined}
            shine={shineFor(game)}
          />
        ))}
      </Grid>
    )}
  </Box>
  );
};
