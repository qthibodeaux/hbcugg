

// Class labels, position labels and percentile display rules for the bio panel.

export const CLASS_ORDER = [
  { year: 1, label: "Freshman" },
  { year: 2, label: "Sophomore" },
  { year: 3, label: "Junior" },
  { year: 4, label: "Senior" },
  { year: 5, label: "Graduate" },
];

export const CLASS_PLURAL = { 1: "Freshmen", 2: "Sophomores", 3: "Juniors", 4: "Seniors", 5: "Graduates" };

export const POSITION_GROUP_PLURAL = {
  QB: "Quarterbacks", RB: "Running Backs", WR: "Wide Receivers", TE: "Tight Ends",
  OL: "Offensive Linemen", DL: "Defensive Linemen", LB: "Linebackers", DB: "Defensive Backs", ST: "Special Teamers",
};

export const tierColor = (pct) => {
  if (pct == null) return "#E2E8F0";
  if (pct >= 80) return "#48BB78";
  if (pct >= 60) return "#9AE6B4";
  if (pct >= 40) return "#ECC94B";
  if (pct >= 20) return "#ED8936";
  return "#F56565";
};

export const ordinalSuffix = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[num % 10] ?? "th";
};

export const CLASS_ABBR = { 1: "FR", 2: "SO", 3: "JR", 4: "SR", 5: "GR" };
