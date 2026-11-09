import { PROFILE } from "../teamProfileModel";

export const POSTER_W = 1400;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const hexA = (hex, a) => {
  const h = String(hex).replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
};

export const T = PROFILE.team;

export const P = PROFILE.players;

export const toneOf = (pal, r) => {
  if (!r?.rank || !r?.of) return pal.ink;
  const third = Math.round(r.of / 3);
  return r.rank <= third ? pal.up : r.rank > r.of - third ? pal.down : pal.ink;
};
