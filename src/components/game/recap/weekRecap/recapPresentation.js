import teamsData from "../../../../data/teams.json";
import { paletteOf } from "../../../molecules/export/posterPalette";

export const POSTER_W = 1400;

export const BG = "var(--rc-bg)";

export const PANEL = "var(--rc-panel)";

export const INK = "var(--rc-ink)";

export const fg = (a) => `rgba(var(--rc-fg), ${a})`;

export const GOLD = "var(--rc-gold)";

export const HILITE = "#5A9F68";

export const UP = "var(--rc-up)";

export const DOWN = "var(--rc-down)";

export const BRAND = "var(--rc-brand)";

export const DIM = fg(0.55);

export const LINE = fg(0.1);

const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

export const short = (id) => META[id]?.shortName ?? String(id ?? "").toUpperCase();

const TEAL = "var(--rc-teal)";

export const TILE_INK = { performance: GOLD, game: BRAND, team: TEAL, crowd: TEAL, event: TEAL, race: TEAL, record: GOLD };

export const tileTeamId = (item, games = []) => {
  if (item.data?.stat_team_id) return item.data.stat_team_id;
  const game = games.find((g) => g.game_path_id === item.data?.game_path_id);
  if (item.kind === "wp_swing" && game?.winner_team_id) {
    return [game.away.team_id, game.home.team_id].find((id) => id !== game.winner_team_id);
  }
  if (item.kind === "crowd") return item.data?.games?.[0]?.home_team_id;
  return item.data?.team_id ?? game?.winner_team_id ?? item.team_ids?.[0] ?? null;
};

const luminance = (hex) => {
  const rgb = hex.replace("#", "").match(/.{2}/g).map((part) => parseInt(part, 16) / 255);
  return rgb.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
};

export const tileTeamInk = (id, scheme) => {
  const colors = META[id]?.colors;
  if (!colors) return INK;
  const bg = luminance(paletteOf(scheme).panel);
  const contrast = (hex) => {
    const lum = luminance(hex);
    return (Math.max(lum, bg) + 0.05) / (Math.min(lum, bg) + 0.05);
  };
  const choices = [colors.primary, colors.secondary].filter((c) => /^#[0-9a-f]{6}$/i.test(c));
  return choices.find((c) => contrast(c) >= 3) ?? choices.sort((a, b) => contrast(b) - contrast(a))[0] ?? INK;
};

export const SCORE_COLS = "130px 44px 130px 44px 1px";

export const pct1 = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");

const AX_LO = 0;

const AX_HI = 1;

export const successRateScale = (values) => {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return { min: AX_LO, max: AX_HI, ticks: [0.25, 0.5, 0.75] };
  const min = Math.max(0, Math.floor(Math.min(...valid) * 20) / 20);
  const max = Math.min(1, Math.max(min + 0.05, Math.ceil(Math.max(...valid) * 20) / 20));
  const lower = max === min ? Math.max(0, min - 0.05) : min;
  const ticks = Array.from({ length: 21 }, (_, i) => i / 20).filter((v) => v >= lower && v <= max);
  return { min: lower, max, ticks: ticks.filter((_, i) => ticks.length <= 7 || i % 2 === 0) };
};

export const axPct = (v, { min = AX_LO, max = AX_HI } = {}) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;

export const TICKS = [0.25, 0.5, 0.75];

export const COMP_INK = [
  ["passing_production", "#5B21B6"],
  ["receiving_production", "#8B5CF6"],
  ["rushing_production", "#C4B5FD"],
  ["hit_production", "#166534"],
  ["hawk_production", "#22C55E"],
  ["scrum_production", "#86EFAC"],
];
