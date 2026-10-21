import teamsData from "../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// Team Spotlight — shared model. The page is painted in the spotlighted
// team's colours, like the school pages: the true primary for fills (bars,
// blocks, the banner), a lifted version of it for lines and text on the dark
// surface (AAMU's #660000 is too dark to read as a stroke).
// ─────────────────────────────────────────────────────────────────────────────

export const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const shortOf = (id) => TEAM_BY_V5[id]?.shortName ?? String(id ?? "").toUpperCase();

// The file's game labels use the backend's old names ("vs J-State", "vs B-CU");
// the site prints teams.json short names. Temporary, until the labels ship
// with opponent ids (Team Spotlight Fetch Contract).
const OLD_NAMES = [[/\bJ-State\b/g, "JSU"], [/\bB-CU\b/g, "BCU"], [/\bBama State\b/g, "ASU"]];
export const fixNames = (s) => OLD_NAMES.reduce((out, [re, to]) => out.replace(re, to), String(s ?? ""));

/** Lift a colour to a lightness floor, keeping its hue — for lines and text on near-black. */
export const lift = (hex, minL = 0.55) => {
  const h = String(hex ?? "").replace("#", "");
  if (h.length !== 6) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l >= minL) return hex;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.12) return "#D4D4D8";
  let hue = 0;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue = (hue * 60 + 360) % 360;
  const c = (1 - Math.abs(2 * minL - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = minL - c / 2;
  const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(hue / 60) % 6];
  return `#${seg.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
};

/** Everything a chart needs to paint in the team's colours. */
export const paletteOf = (teamId) => {
  const team = TEAM_BY_V5[teamId];
  const primary = team?.colors?.primary ?? "#A855F7";
  const secondary = team?.colors?.secondary ?? "#FFFFFF";
  return {
    team,
    primary,
    secondary,
    ink: lift(primary),          // lines, text, highlights on the dark card
    soft: lift(primary, 0.72),   // the lighter shade (FG blocks, second series)
    fill: primary,               // solid fills
  };
};

export const pct0 = (v) => (v == null ? "—" : `${Math.round(Number(v))}%`);
export const n1 = (v) => (v == null ? "—" : Number(v).toFixed(1));
export const signed1 = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(1)}`);
export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const chartOf = (spotlight, id) => spotlight?.charts?.find((c) => c.id === id) ?? null;
