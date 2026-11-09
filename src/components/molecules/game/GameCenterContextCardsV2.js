import { createContextCards } from "./contextCards/createContextCards";
import { GOLD, Small, Shell } from "./contextCards/ProductionPresentation";

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

export const CONTEXT_CARDS = createContextCards({ GOLD, Small, Shell });
