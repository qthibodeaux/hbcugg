

export const fmtPct = (n) => (n ? `${(n * 100).toFixed(1)}%` : "0%");

export const fmtNum = (n) => (n === Math.floor(n) ? String(n) : n.toFixed(1));

export function getInitials(name) {
  const parts = name.split(",");
  return (parts[1]?.trim()[0] || "") + (parts[0]?.trim()[0] || "");
}

function getFirstName(name) { return name.split(",")[1]?.trim() || ""; }

function getLastName(name) { return name.split(",")[0]?.trim() || ""; }

export function getDisplayName(name) { return `${getFirstName(name)} ${getLastName(name)}`; }

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}

export function getCellColor(comp, att, primaryColor) {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(primaryColor);
  const opacity = 0.15 + rate * 0.65;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

export function getCellTextColor(comp, att) {
  if (att === 0) return "#71717A";
  const rate = comp / att;
  return rate >= 0.5 ? "#FFFFFF" : "#F4F4F5";
}
