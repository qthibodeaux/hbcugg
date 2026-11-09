// Shared status formatting and the pre-existing illustrative production fallback.
// PRODUCTION_FALLBACK is not observed team production; keep its source policy
// explicit when wiring real unit_carousel data.


const formatPct = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return `${Math.round(n > 1 ? n : n * 100)}%`;
};

export const formatDate = (value) => {
  if (!value) return "Date TBD";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatDateShort = (value) => {
  if (!value) return "Date TBD";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const teamLabel = (team) => team?.bannerShort || team?.shortName || team?.name || "Team";

export const LOGO_SIZES = {
  sm: "clamp(1.25rem, 3.5vw, 1.75rem)",
  md: "clamp(2rem, 5vw, 2.75rem)",
};

export const RECENT_RESULT_COLOR = { W: "#48BB78", L: "#F56565", T: "#A0AEC0" };

export const PRODUCTION_HOLD_SECONDS = 8;

export const ordinal = (value) => {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

export const PRODUCTION_FALLBACK = [
  {
    key: "passing",
    label: "Passing Production",
    metrics: [
      { key: "comp_pct", label: "Comp %", value: 61.4, conference_best: 68.2, conference_rank: 3, conference_size: 6 },
      { key: "yds_att", label: "Yds/Att", value: 7.8, conference_best: 9.1, conference_rank: 4, conference_size: 6 },
      { key: "passer_rtg", label: "Rtg", value: 138.2, conference_best: 161.5, conference_rank: 3, conference_size: 6 },
      { key: "td_int", label: "TD:INT", value: 3.0, conference_best: 4.2, conference_rank: 2, conference_size: 6 },
    ],
  },
  {
    key: "rushing",
    label: "Rushing Production",
    metrics: [
      { key: "yds_carry", label: "Yds/Car", value: 4.6, conference_best: 6.2, conference_rank: 4, conference_size: 6 },
      { key: "yds_game", label: "Yds/Gm", value: 142.3, conference_best: 210.8, conference_rank: 5, conference_size: 6 },
      { key: "rush_td", label: "Rush TD", value: 14, conference_best: 22, conference_rank: 3, conference_size: 6 },
      { key: "explosive", label: "10+ Yd", value: 28, conference_best: 41, conference_rank: 4, conference_size: 6 },
    ],
  },
];

export const buildTeamStatFromRoster = (team, rosterModule) => ({
  label: "Top Stat",
  value: rosterModule?.experience ? formatPct(rosterModule.experience.veteran_pct) : "--",
  sub: rosterModule?.experience
    ? `Veteran share for ${team?.shortName || team?.name || "this roster"}`
    : "Pipeline stat pending",
  accent: team?.colors?.secondary || "#F56565",
});
