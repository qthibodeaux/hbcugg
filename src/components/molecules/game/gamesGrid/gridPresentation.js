import teamsData from "../../../../data/teams.json";
import { getGameWeek } from "../../../../utils/gamesHubModel";

// Games Hub week grouping, tint, row heights and last-played-week display rules.

const WEEK_TINTS = [
  { bg: "#26262A", card: "#33333A", ink: "rgba(255,255,255,0.55)" },
  { bg: "#000000", card: "#141416", ink: "rgba(255,255,255,0.45)" },
];

const NO_WEEK_TINT = { bg: "#131317", card: "#1F1F24", ink: "rgba(255,255,255,0.4)" };

const tintForWeek = (week) => (Number.isFinite(week) ? WEEK_TINTS[week % WEEK_TINTS.length] : NO_WEEK_TINT);

export const ROW_H = {
  week: "1rem",
  date: "0.875rem",
  team: "1.25rem",
  event: "0.75rem",
  venue: "1.875rem", // two lines of 9px at 1.2, plus the 4px gap under the rule
};

export const LEAGUE_IDS = new Set(teamsData.teams.map((t) => t.exportId.replace(/25$/, "")));

export const withWeeks = (games) => {
  let current;
  return games.map((game) => {
    const week = getGameWeek(game);
    const key = Number.isFinite(week) ? week : null;
    const isFirst = key !== current;
    current = key;
    return {
      game,
      tint: tintForWeek(week),
      weekLabel: isFirst && key !== null ? `Week ${week}` : null,
    };
  });
};

export const SHINE_CSS = `
  @keyframes ghShine {
    0%   { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.2); }
    25%  { box-shadow: 0 0 0 2px var(--gh-shine), 0 0 18px var(--gh-shine); border-color: var(--gh-shine); }
    100% { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.2); }
  }
  .gh-shine { animation: ghShine 1.6s ease-out both; animation-delay: var(--gh-delay, 0ms); }
  @media (prefers-reduced-motion: reduce) { .gh-shine { animation: none; } }
`;

export const SHINE = { recent: "#A855F7", upcoming: "#F6C344" };

export const lastPlayedWeek = (games) =>
  games.reduce((max, g) => {
    const w = getGameWeek(g);
    return g.isFinal && Number.isFinite(w) && (max == null || w > max) ? w : max;
  }, null);
