

export const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;

export const fmt1 = (n) => (n ?? 0).toFixed(1);

export const fmt2 = (n) => (n ?? 0).toFixed(2);

function getFirstName(name) {
  return name.split(",")[1]?.trim() || "";
}

function getLastName(name) {
  return name.split(",")[0]?.trim() || "";
}

export function getDisplayName(name) {
  return name.includes(",") ? `${getFirstName(name)} ${getLastName(name)}` : name;
}

export function getInitials(name) {
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  return `${getFirstName(name)[0] || ""}${getLastName(name)[0] || ""}`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 229, g: 62, b: 62 };
}

export function laneBg(successRate, teamColor) {
  const rgb = hexToRgb(teamColor);
  const opacity = 0.14 + Math.min(0.62, successRate * 0.62);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
