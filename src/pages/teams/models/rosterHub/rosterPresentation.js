import { GAME_CENTER_SEASONS } from "../../../../components/molecules/game/SeasonSelector";

// Roster hub scope, ordering, rounding, classification and weighted-average helpers.

export const ROSTER_HUB_YEARS = GAME_CENTER_SEASONS;

export const DEFAULT_ROSTER_HUB_YEAR = 2025;

const POSITION_ORDER = ["QB", "RB", "WR", "WR_TE", "TE", "OL", "DL", "LB", "DB", "ST", "Unknown"];

const CLASS_ORDER = ["Fr.", "So.", "Jr.", "Sr.", "Gr.", "Unknown"];

export const normalizeRosterHubYear = (year) => {
  const numericYear = Number(year);
  return ROSTER_HUB_YEARS.includes(numericYear) ? numericYear : DEFAULT_ROSTER_HUB_YEAR;
};

export const toRosterHubTeamId = (exportId) => exportId?.replace(/25$/, "") ?? null;

export const byPositionOrder = (a, b) => {
  const aIndex = POSITION_ORDER.indexOf(a.group);
  const bIndex = POSITION_ORDER.indexOf(b.group);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
};

export const byClassOrder = (a, b) => {
  const aIndex = CLASS_ORDER.indexOf(a.class);
  const bIndex = CLASS_ORDER.indexOf(b.class);
  return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
};

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const round = (value, digits = 0) => {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
};

export const classifyRoster = ({ totalPlayers, veteranPct, transferRate }) => {
  if (transferRate >= 40) return "Portal-driven build";
  if (veteranPct >= 40) return "Veteran core";
  if (totalPlayers >= 115) return "Deep roster room";
  if (veteranPct < 25) return "Youth movement";
  return "Balanced construction";
};

export const getCountByClass = (classDistribution, classKey) =>
  classDistribution.find((item) => item.class === classKey)?.count ?? 0;

export const VETERAN_CLASSES = ["Sr.", "Gr."];

export const weightedAverage = (items, field) => {
  const totals = items.reduce(
    (acc, item) => {
      const value = Number(item[field]);
      const count = Number(item.count);
      if (!Number.isFinite(value) || !Number.isFinite(count) || count <= 0) return acc;
      return { value: acc.value + value * count, count: acc.count + count };
    },
    { value: 0, count: 0 },
  );
  return totals.count ? totals.value / totals.count : null;
};
