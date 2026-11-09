import { teamMeta } from "../../../game/export/exportData";
import RL from "../../../../data/swacRushingLanes2026W8.json";
import { fgOf, leagueOf, standardRanks } from "../gridPosterKit";

export const RL_META = RL.meta;

export const LANES = [["left", "Left"], ["middle", "Mid"], ["right", "Right"]];

export const LEAGUE = leagueOf(RL.teams);

export const RANKS = standardRanks(RL.teams);

export const TEAMS = [...RL.teams].sort((a, b) => b.totals.yards - a.totals.yards);

const ALL_LANES = TEAMS.flatMap((t) => t.lanes);

const GAIN_MAX = Math.max(...ALL_LANES.map((l) => l.line_yards_on_gains + l.highlight_yards_on_gains));

const LOSS_MAX = Math.abs(Math.min(...ALL_LANES.map((l) => l.loss_yards)));

export const SPAN = GAIN_MAX + LOSS_MAX;

export const ZERO = (LOSS_MAX / SPAN) * 100;

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(String(hex).slice(i, i + 2), 16));

const lumOf = (hex) => {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const teamPairOf = (id, pal) => {
  const c = teamMeta(id)?.colors ?? {};
  const night = pal.fg === "255,255,255";
  const grey = fgOf(pal)(0.4);
  let a = c.primary ?? pal.brand;
  let b = c.secondary ?? grey;
  if (night && lumOf(a) < 0.06) [a, b] = [b, grey];
  if (!night && lumOf(b) > 0.85) b = grey;
  if (!night && lumOf(a) > 0.85) a = pal.ink;
  return [a, b];
};

export const inkOn = (color, pal) => (String(color).startsWith("#") ? (lumOf(color) > 0.55 ? "#111114" : "#FFFFFF") : pal.ink);
