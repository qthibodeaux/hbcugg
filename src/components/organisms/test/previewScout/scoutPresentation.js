// Retained lab preview presentation; distinct from game/preview/GamePreviewScout.
// Its fixture provenance is documented in gamePreviewScoutMock.js.
import teamsData from "../../../../data/teams.json";

export const PANEL = "#141416";

export const LINE = "rgba(255,255,255,0.08)";

export const DIM = "rgba(255,255,255,0.5)";

export const GOLD = "#EAB308";

export const BRAND = "#A855F7";

const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

const rgb = (hex) => { const h = String(hex ?? "").replace("#", ""); return h.length === 6 ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) : null; };

const lum = (hex) => { const c = rgb(hex); return c ? 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] : 0; };

const chroma = (hex) => { const c = rgb(hex); return c ? Math.max(...c) - Math.min(...c) : 0; };

const lift = (hex, t) => { const c = rgb(hex); return c ? `#${c.map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, "0")).join("")}` : hex; };

export const brandOf = (id) => {
  const c = META[id]?.colors ?? {};
  if (c.primary && lum(c.primary) >= 70 && chroma(c.primary) > 40) return c.primary;
  const hue = [c.secondary, c.accent].find((x) => x && lum(x) >= 70 && chroma(x) > 40);
  if (hue) return hue;
  return c.primary ? lift(c.primary, 0.45) : BRAND;
};

export const inkOn = (hex) => (lum(hex) > 150 ? "#0B0B0D" : "#FFFFFF");

export const STRIP = [["off_epa", "Off EPA / play"], ["def_epa", "Def EPA / play"], ["ppg", "Points / game"], ["allowed", "Allowed / game"], ["to_margin", "Turnover margin"]];

export const COUNTING = [["ypg", "Yds / game"], ["pass_ypg", "Pass yds / game"], ["rush_ypg", "Rush yds / game"], ["turnovers", "Turnovers"], ["pen_ypg", "Pen yds / game"]];

export const EFFICIENCY = [["net_epa", "Net EPA / play"], ["o_success", "Off success rate"], ["d_success", "Def success rate"], ["net_epa_drive", "Net EPA / drive"], ["net_fp", "Net field position"]];

export const POSTER_W = 1240;

export const P_BG = "#0B0B0D";

export const P_PANEL = "#141416";

export const P_SEAM = "rgba(168,85,247,0.35)";

export const SEAM = { gap: "1px", bg: "rgba(168,85,247,0.35)" };
