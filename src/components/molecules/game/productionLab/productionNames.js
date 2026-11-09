

export const getLastName = (name) => {
  if (!name) return "Unknown";
  if (!name.includes(",")) return name;
  return name.split(",")[0].trim();
};

export const getDisplayName = (name) => {
  if (!name) return "Unknown";
  if (!name.includes(",")) return name;
  const parts = name.split(",");
  return `${parts[1].trim()} ${parts[0].trim()}`;
};

export const getInitials = (name) => {
  if (!name) return "??";
  if (!name.includes(",")) return name.slice(0, 2).toUpperCase();
  const parts = name.split(",");
  return `${parts[1].trim()[0] || ""}${parts[0].trim()[0] || ""}`;
};
