import { CONTEXT_CARDS_MOCK } from "./gameCenterContextCardsMock";
import { Box, Grid, Text } from "@chakra-ui/react";
import { createContextCards } from "../../molecules/game/contextCards/createContextCards";
import { GOLD, Small, Shell } from "./contextCards/LabPresentation";

// ── 1 · Look Ahead — two schools face to face, the kickoff between them ─────

// ── 2 · Upcoming Stretch — the next three, opponent by opponent ─────────────

// ── 3 · Team Form — last five, wins up / losses down off a midline ──────────

// ── 4 · Home Town Heroes — the homegrown share, and where they come from ────

// ── 5 · Us vs The World — the record outside the two leagues, game by game ──

// ── 6 · Biggest Mover — the jump, rank to rank ──────────────────────────────

// ── 7 · Streak Watch — the run, one link per game ───────────────────────────

// ── 8 · Title Race — the top three, how far back each one is ────────────────

// ── 9 · Bowl Path — the two leaders meeting at the bowl ─────────────────────

// ── 10 · Red-Zone Edge — the TD rate inside the 20, against the league ──────

// ── 11 · Turnover Swing — the margins, best and worst, off a zero line ──────

// ── 12 · Defending Champions — the banner from the rafters ──────────────────

// ── 13 · Home & Road — the record split down the middle ─────────────────────

// ── 14 · Game of the Week — the matchup, the hook ───────────────────────────

// ── 15 · Upset Watch — the winner big, the favorite it took down ────────────

// ── Lab export ───────────────────────────────────────────────────────────────
// All 15 at the hub's 1x1 slot size, then the first one in the 2-col slot.

const TILE = "clamp(200px, 22vw, 290px)";

export const GameCenterContextCardsA = () => {
  const items = CONTEXT_CARDS_MOCK.filter((c) => CONTEXT_CARDS[c.card_type]);
  const render = (c) => {
    const Card = CONTEXT_CARDS[c.card_type];
    return <Card c={c} />;
  };
  return (
    <Box h="100%" overflowY="auto" pr={2}>
      <Grid templateColumns={`repeat(auto-fill, ${TILE})`} gap={4}>
        {items.map((c, i) => (
          <Box key={`${c.card_type}-${i}`}>
            <Box w={TILE} h={TILE}>{render(c)}</Box>
            <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mt={1}>
              {i + 1} · {c.card_type.replace(/_/g, " ")}{c.placeholder ? " · mock values" : ""}
            </Text>
          </Box>
        ))}
      </Grid>
      <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mt={6} mb={2}>2-col slot</Text>
      <Box w={`calc(${TILE} * 2 + 1rem)`} h={TILE}>{render(items[13] ?? items[0])}</Box>
    </Box>
  );
};

export const CONTEXT_CARDS = createContextCards({ GOLD, Small, Shell });
