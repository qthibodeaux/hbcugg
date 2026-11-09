
// Pure normalization, names and formatting shared by the box-score models and lab panels.

export const getInitials = (name) => {
  const parts = String(name ?? "").split(",");
  return (parts[1]?.trim()[0] || "") + (parts[0]?.trim()[0] || "");
};

const getFirstName = (name) => {
  if (!name) return "";
  const str = String(name);
  if (str.includes(",")) return str.split(",")[1]?.trim() || "";
  const parts = str.trim().split(/\s+/);
  return parts.slice(0, -1).join(" ") || "";
};

const getLastName = (name) => {
  if (!name) return "";
  const str = String(name);
  if (str.includes(",")) return str.split(",")[0]?.trim() || "";
  const parts = str.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
};

export const getDisplayName = (name) => {
  if (!name) return "";
  const str = String(name);
  if (str.includes(",")) {
    const first = getFirstName(str);
    const last = getLastName(str);
    return first ? `${first} ${last}` : last;
  }
  return str;
};

export const getLastNameOnly = (name) => getLastName(name);

export const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;

export const fmt1 = (n) => (n ?? 0).toFixed(1);

export const fmt2 = (n) => (n ?? 0).toFixed(2);

export const normalizeStatsList = (statsField) => {
  if (!statsField) return [];
  const rawList = Array.isArray(statsField) ? statsField : Object.values(statsField);
  return rawList.map((p) => ({
    ...p,
    name: p.name ?? p.name_raw ?? "Unknown",
    player_key: p.player_key ?? p.player_id ?? "unknown",
  }));
};

const cleanAndSplit = (name) => {
  const parts = String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z,\s]/g, "")
    .split(/[,\s]+/)
    .filter(Boolean);
  return new Set(parts);
};

export const isMatch = (nameA, nameB) => {
  const setA = cleanAndSplit(nameA);
  const setB = cleanAndSplit(nameB);
  if (setA.size === 0 || setB.size === 0) return false;
  const [smaller, larger] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  for (const item of smaller) {
    if (!larger.has(item)) return false;
  }
  return true;
};
