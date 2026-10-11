// ─────────────────────────────────────────────────────────────────────────────
// Demo build — `npm run build:demo` sets REACT_APP_DEMO=1. The GitHub Pages demo
// ships the current season only (scripts/prune_demo_build.js trims the data),
// so every season picker offers 2026 alone, routes are hash-based (Pages has
// no server rewrites), and the lab pages are left out. A normal build is
// untouched.
// ─────────────────────────────────────────────────────────────────────────────

export const IS_DEMO = process.env.REACT_APP_DEMO === "1";
export const DEMO_SEASON = 2026;

/** A season list as the demo sees it: just the demo season, when the list has it. */
export const demoSeasons = (list) => {
  if (!IS_DEMO) return list;
  const only = (list ?? []).filter((s) => Number(s) === DEMO_SEASON);
  return only.length ? only : list;
};
