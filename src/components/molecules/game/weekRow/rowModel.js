

export function getWinner(row) {
  if (
    row.awayScore == null ||
    row.homeScore == null ||
    row.awayScore === row.homeScore
  )
    return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

export const getActiveColor = (row, highlightColor) => {
  const winner = getWinner(row);
  return (
    highlightColor ??
    (winner === "away"
      ? row.away.color
      : winner === "home"
        ? row.home.color
        : "#E53E3E")
  );
};

export const getDisplayData = (row) => ({
  hasScore: row.awayScore != null && row.homeScore != null,
  awayRecord: row.away.record ?? row.awayConferenceRecord ?? "Record TBD",
  homeRecord: row.home.record ?? row.homeConferenceRecord ?? "Record TBD",
  venue: row.displayVenue ?? row.stadium ?? "Site TBD",
});

export const getResultLine = (row, venue, hasScore) => {
  const status = String(
    row.status ?? (hasScore ? "Final" : "Preview"),
  ).toUpperCase();
  const place = String(venue ?? "Site TBD").toUpperCase();
  return `${status} | ${place}`;
};

const OUTSIDE_ABBREVIATIONS = {
  Monmouth: "MON",
  "Georgetown University": "GEO",
  "Savannah State University": "SAV",
  Richmond: "RICH",
  "Prairie View A&M": "PVAMU",
};

const STOP_WORDS = new Set(["the", "of", "and", "&", "university", "college"]);

export const getCompactLabel = (team) => {
  const candidate = String(team?.bannerShort ?? team?.shortName ?? "").trim();
  const name = String(team?.name ?? candidate ?? "").trim();

  if (candidate && candidate !== name && candidate.length <= 7)
    return candidate.toUpperCase();
  if (OUTSIDE_ABBREVIATIONS[name]) return OUTSIDE_ABBREVIATIONS[name];

  const words = name.split(/\s+/).filter(Boolean);
  const meaningfulWords = words.filter(
    (word) => !STOP_WORDS.has(word.toLowerCase()),
  );

  if (meaningfulWords.length > 1) {
    const acronym = meaningfulWords
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 5) return acronym;
  }

  return (meaningfulWords[0] ?? name ?? "TBD").slice(0, 4).toUpperCase();
};

export const getCompactGameTag = (gameName) => {
  const label = String(gameName ?? "Game").trim();
  const lower = label.toLowerCase();
  if (lower.includes("homecoming")) return "Homecoming";
  if (lower.includes("conference")) return "Conference";
  if (lower.includes("non-conf") || lower.includes("non conf"))
    return "Non-conf";
  if (lower.includes("championship")) return "Championship";
  if (lower.includes("celebration")) return "Celebration Bowl";
  return label.length > 18 ? `${label.slice(0, 16).trim()}...` : label;
};
