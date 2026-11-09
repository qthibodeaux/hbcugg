

// Extracted from the live PlayByPlayPanel; behavior preserved.

export const fmtQuarter = (q) => {
  if (!q) return "—";
  const map = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4", 5: "OT" };
  return map[q] ?? `Q${q}`;
};

export const fmtClock = (clock) => {
  if (!clock) return "";
  const parts = String(clock).split(":");
  if (parts.length === 2) return `${parts[0]}:${parts[1].padStart(2, "0")}`;
  return clock;
};

const ORD = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

export const fmtDownDistance = (down, distance, ylTeam, ylNum, teamShortFn, spotDisplay = null) => {
  if (!down || !distance) return null;
  return {
    dd: `${down} - ${distance}`,
    short: `${ORD[down] ?? down} & ${distance}`,
    spot: spotDisplay ? `at ${spotDisplay}` : ylTeam && ylNum != null ? `at ${teamShortFn(ylTeam)} ${ylNum}` : "",
  };
};

export const fmtYards = (yards) => {
  if (yards == null) return null;
  const n = Number(yards);
  if (n > 0) return { text: `+${n}`, color: "#4ADE80" };
  if (n < 0) return { text: `${n}`, color: "#F87171" };
  return { text: "0", color: "#A1A1AA" };
};

export const getResultBadge = (play) => {
  const sa = play?.state_after ?? {};
  const adv = play?.play_advanced ?? {};
  const epa = adv?.epa?.epa;

  if (sa.scoring_event) return { label: "TD", color: "#4ADE80", bg: "rgba(74,222,128,0.12)" };
  if (sa.turnover) return { label: "TURNOVER", color: "#F87171", bg: "rgba(248,113,113,0.12)" };
  if (play?.penalties?.length > 0 && play?.no_play) return { label: "PENALTY", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" };
  if (sa.is_first_down) return { label: "1ST DOWN", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" };
  if (epa != null && epa > 1.0) return { label: "BIG PLAY", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" };
  return null;
};

export const getPlayCategory = (play) => {
  const raw = play?.base?.raw ?? "";
  const lower = raw.toLowerCase();
  if (lower.includes("pass")) return "pass";
  if (lower.includes("rush") || lower.includes("run")) return "rush";
  if (lower.includes("kickoff")) return "kickoff";
  if (lower.includes("punt")) return "punt";
  if (lower.includes("field goal")) return "fg";
  if (play?.penalties?.length > 0) return "penalty";
  return "other";
};

export const categoryColor = {
  pass: "#60A5FA",
  rush: "#34D399",
  kickoff: "#A78BFA",
  punt: "#F472B6",
  fg: "#FBBF24",
  penalty: "#F59E0B",
  other: "#71717A",
};

export const displayName = (name) => {
  const [last, first] = String(name ?? "").split(",").map((x) => x.trim());
  return first ? `${first} ${last}` : last;
};

export const FILTER_GROUPS = {
  quarter: {
    label: "Quarter",
    options: [
      { key: "q1", label: "Q1" },
      { key: "q2", label: "Q2" },
      { key: "q3", label: "Q3" },
      { key: "q4", label: "Q4" },
    ],
  },
  team: {
    label: "Team",
    options: [
      { key: "away", label: "Away" },
      { key: "home", label: "Home" },
    ],
  },
  // Two kinds of filter share this column. The first three ask what KIND of play
  // it was and read the export's own `play_type`; the last three ask what the
  // play DID and read outcome fields. Both are inclusive-or within the group, so
  // "Rush + Scoring Plays" means either, matching how quarter and team behave.
  // Play Type asks what KIND of play it was, off the export's own `play_type`.
  playType: {
    label: "Play Type",
    options: [
      { key: "rush", label: "Rush" },
      { key: "pass", label: "Pass" },
      { key: "specialTeams", label: "Special Teams" },
      { key: "penalty", label: "Penalty" },
    ],
  },
  // Highlights asks what the play DID, off outcome fields. Kept separate from
  // Play Type because they are different questions: within a group the options
  // are an or, across groups they are an and — so Rush + Scoring Plays now means
  // "rushes that scored", which is what picking both is asking for. As one group
  // it meant "rushes, or anything that scored", which is nearly no filter at all.
  highlights: {
    label: "Highlights",
    options: [
      { key: "bigPlays", label: "Big Plays" },
      { key: "scoringPlays", label: "Scoring Plays" },
      { key: "scoringDrives", label: "Scoring Drives" },
    ],
  },
};

export const RUSH_TYPES = new Set(["RUSH", "KNEEL"]);

export const PASS_TYPES = new Set(["PASS", "SACK", "SPIKE"]);

export const SPECIAL_TEAMS_TYPES = new Set(["KICKOFF", "PUNT", "FIELD_GOAL", "PAT", "RETURN"]);

export const isPenaltyPlay = (play, kind) => kind === "PENALTY" || (Array.isArray(play?.penalties) && play.penalties.length > 0);
