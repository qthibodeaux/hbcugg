

const CLASS_YEAR_MAP = {
  "Fr.": 1, "So.": 2, "Jr.": 3, "Sr.": 4, "Gr.": 5,
  FR: 1, SO: 2, JR: 3, SR: 4, GR: 5,
  Fr: 1, So: 2, Jr: 3, Sr: 4, Gr: 5,
};

export const getClassYearNum = (classYear) => {
  if (typeof classYear === "number") return classYear;
  return CLASS_YEAR_MAP[classYear] || 1;
};

export const formatHeight = (player) => {
  if (player.height_raw && typeof player.height_raw === "string") return player.height_raw;
  const inches = Number(player.height);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
};

export const getPlayerName = (player) => {
  if (player.full_name) return player.full_name;
  if (player.first_name && player.last_name) return `${player.first_name} ${player.last_name}`;
  return "Unknown";
};

export const getRemainingYears = (classYearNum) => {
  if (classYearNum >= 4) return 1;
  return 5 - classYearNum;
};

export const TICK_KEYFRAMES = "rosterOutlookTick";

export const SQUARE_W = "1.5rem";

const SUFFIX_RE = /^(Jr|Sr|I{2,3}|IV|V)\.?$/i;

export const getLastName = (player) => {
  // A stored last_name is sometimes just the suffix ("Jr."), which is how a
  // row ended up literally labelled "Jr." — fall through to parsing the full
  // name in that case.
  if (player.last_name && !SUFFIX_RE.test(player.last_name.trim())) return player.last_name;
  const full = getPlayerName(player);
  if (full === "Unknown") return full;
  const parts = full.replace(/,/g, " ").trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIX_RE.test(parts[parts.length - 1])) parts.pop();
  return parts[parts.length - 1] || full;
};

export const MOBILE_COLUMNS = "minmax(0, 1fr) 2.4rem 2.4rem auto";

export const POSITION_GROUPS = [
  { key: "QB", label: "Quarterbacks" },
  { key: "RB", label: "Running Backs" },
  { key: "WR", label: "Wide Receivers" },
  { key: "TE", label: "Tight Ends" },
  { key: "OL", label: "Offensive Line" },
  { key: "DL", label: "Defensive Line" },
  { key: "LB", label: "Linebackers" },
  { key: "DB", label: "Defensive Backs" },
  { key: "ST", label: "Special Teams" },
];
