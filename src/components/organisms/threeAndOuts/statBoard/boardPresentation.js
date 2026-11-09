import teamsData from "../../../../data/teams.json";

// Stat-board definitions, team identity, scopes and presentation helpers.

export const POSTER_W = 1400;

const TEAM_BY_V5 = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const shortOf = (id) => TEAM_BY_V5[id]?.shortName ?? String(id ?? "").replace(/^(swac|meac)/, "").toUpperCase();

export const logoOf = (id) => TEAM_BY_V5[id]?.logo ?? null;

export const fgOf = (pal) => (a) => `rgba(${pal.fg}, ${a})`;

export const pct1 = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}%`);

export const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };

export const tab = { fontVariantNumeric: "tabular-nums" };

export const STATS = {
  threeAndOuts: {
    slug: "three-and-outs", name: "3 & out", count: "three_and_outs", n: "drives",
    sides: [
      { id: "offense", label: "Offense", title: "Offensive 3 & out rate", headline: ["Offense", "3 & Outs"] },
      { id: "defense", label: "Defense", title: "3 & outs forced", headline: ["Defense", "3 & Outs Forced"] },
    ],
    scatterHeadline: ["3 & Outs:", "Offense vs Defense"],
    xLabel: "Offense 3 & out rate · fewer →",
    yLabel: "3 & outs forced · more ↑",
    finishing: true,
  },
  thirdAndLong: {
    slug: "third-and-long", name: "3rd & long", count: "conversions", n: "attempts", allThird: true,
    sides: [
      { id: "offense", label: "Offense", title: "3rd & long conversion rate", headline: ["Offense", "3rd & Long"] },
      { id: "defense", label: "Defense", title: "3rd & long conversions allowed", headline: ["Defense", "3rd & Long Allowed"] },
    ],
    scatterHeadline: ["3rd & Long:", "Offense vs Defense"],
    xLabel: "Offense converts · more →",
    yLabel: "Defense allows · fewer ↑",
  },
};

export const SCOPES = [
  { id: "all", label: "All" },
  { id: "swac", label: "SWAC" },
  { id: "meac", label: "MEAC" },
];

export const rgbOf = (hex) => {
  const h = String(hex).replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
