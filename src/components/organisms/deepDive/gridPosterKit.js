import { Box, Flex, Text } from "@chakra-ui/react";
import { lastName } from "./deepDiveModel";

// ─────────────────────────────────────────────────────────────────────────────
// Grid poster kit — what the "12 team cards" deep-dive posters share (the passing
// grid, the rushing lanes, and any that follow): the 1400px width, the palette
// helpers, number formats, the "C. Brown IV" name format, rank colours, and the
// labelled stat with its rank of 12. One definition here, so a fix lands on every
// poster at once.
// ─────────────────────────────────────────────────────────────────────────────

export const POSTER_W = 1400;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;
export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };
export const tab = { fontVariantNumeric: "tabular-nums" };

export const int = (v) => (v == null ? "—" : Number(v).toLocaleString("en-US"));
export const pct = (v) => (v == null ? "—" : `${Math.round(Number(v) * 100)}%`);
export const one = (v) => (v == null ? "—" : Number(v).toFixed(1));
export const epa = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(2)}`);

// "Armstrong,McClure" and "Cornelious Brown IV" both read "C. Brown IV".
export const person = (name) => {
  const raw = String(name ?? "").trim();
  const full = raw.includes(",") ? raw.split(",").map((s) => s.trim()).reverse().join(" ") : raw;
  const first = full.split(/\s+/)[0] ?? "";
  return `${first ? `${first[0]}. ` : ""}${lastName(full)}`.trim();
};

/** The surname alone ("Brown IV"), from "Cornelious Brown IV" or "Armstrong,McClure". */
export const surnameOf = (name) => {
  const raw = String(name ?? "").trim();
  return lastName(raw.includes(",") ? raw.split(",").map((s) => s.trim()).reverse().join(" ") : raw);
};

/** The given names ("Cornelious") from the same two name forms; "" when there are none. */
export const firstOf = (name) => {
  const raw = String(name ?? "").trim();
  const full = raw.includes(",") ? raw.split(",").map((s) => s.trim()).reverse().join(" ") : raw;
  return full.slice(0, full.length - surnameOf(raw).length).trim();
};

/** What a number means on these posters, by colour. Night: success rate teal, TD the
 *  secondary green. Light: the secondary (hunter) green is nearly black on the light
 *  page, so TD is a clear green and success a clear blue. */
const isLight = (pal) => pal.fg === "17,17,20";
export const successInk = (pal) => (isLight(pal) ? "#0369A1" : pal.teal);
export const tdInk = (pal) => (isLight(pal) ? "#15803D" : pal.orange);

/** Standard ranks of 12 for every stat in a file's `ranks_swac`, from the teams' own totals:
 *  1 + the number of teams strictly ahead, so a tie shares the best place and the next rank
 *  skips (1, 2, 2, 4). Fewest is first for interceptions and stuff rate, most for the rest,
 *  as the backend ranks them. INTERIM: the backend ships dense ranks (1, 2, 2, 3, so a last
 *  place can read #10 of 12); once its files carry standard ranks, delete this and read
 *  `t.ranks_swac` again. Returns { team_id: { stat: rank } }. */
const FEWEST_FIRST = new Set(["interceptions", "stuff_rate"]);
export const standardRanks = (teams) => {
  const out = Object.fromEntries(teams.map((t) => [t.team_id, {}]));
  Object.keys(teams[0].ranks_swac).forEach((k) => {
    teams.forEach((t) => {
      const v = t.totals[k];
      out[t.team_id][k] = v == null ? null : 1 + teams.filter((o) => (FEWEST_FIRST.has(k) ? o.totals[k] < v : o.totals[k] > v)).length;
    });
  });
  return out;
};

/** A rank's colour: the top third green, the bottom third red, the middle muted (ranks of 12). */
export const rankInk = (rank, pal) => (rank == null ? `rgba(${pal.fg}, 0.4)` : rank <= 4 ? pal.up : rank >= 9 ? pal.down : `rgba(${pal.fg}, 0.6)`);

/** The brand purple's rgb ("168,85,247") off the palette, for shading at varying strength. */
export const brandRgbOf = (pal) => {
  const hex = String(pal.brand).replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
};

/** The conference(s) in a file, from its team ids: "SWAC", "MEAC", or "SWAC + MEAC". */
export const leagueOf = (teams) => [...new Set(teams.map((t) => t.team_id.slice(0, 4).toUpperCase()))].join(" + ");

/** A small labelled number with its rank: the label above, the value and the rank below. */
export const Stat = ({ pal, label, value, rank, ink, size = 23 }) => (
  <Box minW={0}>
    <Text fontSize="10px" color={fgOf(pal)(0.55)} mb="3px" whiteSpace="nowrap" {...caps}>{label}</Text>
    <Flex align="baseline" gap="5px">
      <Text fontSize={`${size}px`} fontWeight="950" lineHeight={1} color={ink} whiteSpace="nowrap" {...tab}>{value}</Text>
      <Text fontSize="12px" fontWeight="900" color={rankInk(rank, pal)}>{rank ? `#${rank}` : ""}</Text>
    </Flex>
  </Box>
);
