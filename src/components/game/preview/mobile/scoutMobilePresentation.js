import { STRIP, COUNTING, EFFICIENCY } from "../GamePreviewScout";

// Mobile scout section colors, jump margin and tape field definitions.

export const PANEL = "#141416";

export const LINE = "rgba(255,255,255,0.08)";

export const DIM = "rgba(255,255,255,0.55)";

export const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";

export const ACCENT = "#A855F7";

export const TAPE = [
  { title: "Scoring & EPA", key: "strip", rows: STRIP },
  { title: "Counting", key: "counting", rows: COUNTING },
  { title: "Efficiency", key: "efficiency", rows: EFFICIENCY },
];
