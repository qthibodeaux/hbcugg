import teamsData from "../../../../data/teams.json";
import RUN_O from "../../../../data/runOffense2026W8.json";
import RUN_D from "../../../../data/runDefense2026W8.json";

export const POSTER_W = 1400;

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const shortOf = (id) => TEAM_BY_V5[id]?.shortName ?? String(id ?? "").toUpperCase();

export const logoOf = (id) => TEAM_BY_V5[id]?.logo ?? null;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const pct1 = (v) => (v == null ? "—" : `${(Number(v) * 100).toFixed(1)}%`);

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const rgbOf = (hex) => {
  const n = parseInt(String(hex).replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const SCOPES = [{ id: "swac", label: "SWAC" }, { id: "all_18", label: "All 18" }];

export const PLAYS = [{ id: "all", label: "All plays" }, { id: "without_garbage_time", label: "No garbage time" }];

const SIDES = {
  offense: {
    file: RUN_O, low: false, title: ["Who runs", "it best"], slug: "run-offense",
    y: "Rushing success", x: "Explosive runs (12+ yards)",
    // Corners: top left, top right, bottom left, bottom right.
    quads: ["Steady, few big runs", "Runs it well", "Can't run it", "Big runs, little else"],
  },
  defense: {
    file: RUN_D, low: true, title: ["Who stops", "the run"], slug: "run-defense",
    y: "Rushing success allowed", x: "Explosive runs allowed (12+ yards)",
    quads: ["Bends, then breaks", "Stops the run", "Gets run on", "Leaks yards, no big runs"],
  },
};

export const SIDE_OPTIONS = [{ id: "offense", label: "Offense" }, { id: "defense", label: "Defense" }];

export const viewOf = (sideId, scope, plays) => {
  const side = SIDES[sideId];
  const teams = side.file.teams.filter((t) => scope === "all_18" || t.conference === "swac");
  const top = side.file.top_5_in_both?.[`${scope}_${plays}`] ?? [];
  return { side, teams, top, league: side.file.league_average_18?.[plays] ?? {} };
};
