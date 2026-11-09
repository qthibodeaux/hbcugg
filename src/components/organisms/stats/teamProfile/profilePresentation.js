

export const PANEL = "bg.secondary";

export const POSITIVE = "#48BB78";

export const NEGATIVE = "#F6AD55";

export const BRAND = "#A855F7";

export const OFF_TONE = "#ECC94B";

export const DEF_TONE = "#4299E1";

export const fmtRate = (v, unit) => (!Number.isFinite(v) ? "—" : unit === "pct" ? `${(v * 100).toFixed(1)}%` : v.toFixed(2));

const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

const PARTICLES = new Set(["van", "von", "de", "del", "della", "da", "di", "la", "le", "st", "st."]);

export const surnameOf = (name) => {
  const parts = String(name ?? "").split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIXES.has(parts[parts.length - 1].replace(/\./g, "").toLowerCase())) parts.pop();
  const last = parts[parts.length - 1] ?? "";
  const before = (parts[parts.length - 2] ?? "").toLowerCase();
  return PARTICLES.has(before) ? `${parts[parts.length - 2]} ${last}` : last;
};

export const initialsOf = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export const PROFILE_PARTS = [
  { id: "overview", label: "Overview" },
  { id: "profiles", label: "Offense & Defense" },
  { id: "leaders", label: "Leaders" },
  { id: "efficiency", label: "Efficiency" },
  { id: "phases", label: "Phases" },
  { id: "units", label: "Units" },
  { id: "impact", label: "Player Impact" },
  { id: "results", label: "Results & Roster" },
];

export const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";

export const JUMP_ACCENT = "#A855F7";
