import PEN from "../../../../data/penaltiesSwac2026W8.json";
import { teamShortName } from "../../../game/export/exportData";

// Published penalty data and poster-only formatting. Statistical definitions are unchanged.
// The published crew average counts both teams; SWAC_TEAM_AVG retains the per-team display conversion.

export const PEN_META = PEN.meta;

export const S = PEN.sections;

export const shortOf = teamShortName;

export const SWAC_TEAM_AVG = S.officiating_crews.swac_flags_per_game / 2;

export const POSTER_W = 1400;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const signed = (v, d = 1) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Number(v)).toFixed(d)}`);

export const pct = (v) => (v == null ? "—" : `${Math.round(Number(v) * 100)}%`);

export const fix = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));

const FOUL = { pass_interference: "Pass interference", false_start: "False start", delay_of_game: "Delay of game", roughing_the_passer: "Roughing the passer", personal_foul: "Personal foul" };

export const foulName = (k) => FOUL[k] ?? String(k ?? "").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const lastNameOf = (name) => String(name ?? "").split(",")[0] ?? "";

const titleCase = (name) => String(name ?? "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const crewLabel = (crew) => {
  const refs = Array.isArray(crew.referees) ? crew.referees.filter(Boolean) : [];
  if (!refs.length) return `Crew ${String(crew.crew_id ?? "").replace("crew_", "")}`;
  return `${refs.map((n) => titleCase(lastNameOf(n))).join(" / ")} crew`;
};

export { PEN };
