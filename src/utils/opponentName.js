// Shared opponent-name shortener — used by any page that renders games
// against non-roster opponents (schools outside the 18-team SWAC/MEAC
// database). Those come through as raw schedule text — "Delaware State
// University", "Florida International University", sometimes even a stray
// "#17 " ranking prefix — with no curated short form the way roster teams
// get from teams.json. A single hand-written map for every school that
// shows up on a schedule would be large and go stale; this strips the
// generic filler that makes names long (ranking prefixes, "University
// of"/"University"/"College") and only falls back to an explicit override
// for the handful of names that are still too long, or wrong, after that.
//
// Originally built inside weekCentralAdapter.js — pulled out here once a
// second page (TeamSchedulePage) needed the same fix, since each page
// resolves opponent names through its own independent data path and none
// of them should carry their own copy of this logic.

const OPPONENT_NAME_OVERRIDES = {
  "florida international university": "FIU",
  "florida international": "FIU",
  "university of south alabama": "South Alabama",
  "university of south florida": "South Florida",
  "university of south carolina": "South Carolina",
  "university of arkansas - pine bluff": "Ark.-Pine Bluff",
  "arkansas - pine bluff": "Ark.-Pine Bluff",
  "arkansas-pine bluff": "Ark.-Pine Bluff",
  "southern connecticut state": "So. Conn. St.",
  "charleston southern university": "Charleston So.",
  "charleston southern": "Charleston So.",
  "north carolina a&t state university": "NC A&T",
  "north carolina a&t": "NC A&T",
  "east texas a&m university": "East Texas A&M",
  "northwestern state university": "Northwestern St.",
  "university of texas rio - grande valley": "UTRGV",
  "virginia university of lynchburg": "VA Univ. of Lynchburg",
  "university of the cumberlands": "Cumberlands",
};

const stripRankingPrefix = (value) => value.replace(/^#\d+\s+/, "");
const stripFillerWords = (value) => value
  .replace(/^University of\s+/i, "")
  .replace(/\s+University$/i, "")
  .replace(/\s+College$/i, "")
  .trim();

export const getShortOpponentName = (rawName) => {
  const cleaned = stripRankingPrefix(String(rawName ?? "").trim());
  if (!cleaned) return cleaned;

  const directOverride = OPPONENT_NAME_OVERRIDES[cleaned.toLowerCase()];
  if (directOverride) return directOverride;

  const stripped = stripFillerWords(cleaned);
  const strippedOverride = OPPONENT_NAME_OVERRIDES[stripped.toLowerCase()];
  if (strippedOverride) return strippedOverride;

  return stripped || cleaned;
};
