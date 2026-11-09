// Existing special-teams production fixture and formatting; values are not recomputed.

export const SPECIAL_TEAMS_PRODUCTION = {
  pvamu: {
    shortName: "PVAMU",
    side: "Away",
    colors: { primary: "#4B0082", accent: "#FFB81C" },
    avgStart: 36.75,
    hiddenYards: -10,
    summary: { swing: -12, penaltyCost: 12, plays: 15 },
    kickoff: {
      attempts: 6,
      touchbackRate: 0,
      avgStartAllowed: 25.8,
      espa: -2.67,
      returnRateAllowed: 0.6,
      avgReturnAllowed: 20.7,
      explosivesAllowed: 1,
      contributors: [
        { name: "Alfaro,Diego", role: "K", line: "6 KO / 25.8 avg start allowed" },
        { name: "Stewart,Kellen", role: "KR", line: "29-yard return" },
        { name: "Jackson,Jayven", role: "COV", line: "coverage assist / penalty" },
      ],
    },
    punt: {
      attempts: 3,
      gross: 31.3,
      inside20: 0,
      inside10: 0,
      fairCatch: 0,
      returnRateAllowed: 1,
      avgReturnAllowed: 6,
      nyoe: -5,
      blocks: 0,
      contributors: [
        { name: "Atwell,Adam", role: "P", line: "3 punts / 31.3 gross" },
        { name: "Dennis,Andre", role: "PR", line: "2 punt returns / 12 yards" },
        { name: "Roberts,Sterling", role: "BLK", line: "PAT block impact" },
      ],
    },
    fieldGoals: {
      attempts: 4,
      made: 3,
      pct: 0.75,
      long: 42,
      trustRange: 37,
      aggression: 45,
      blocked: 0,
      patMade: 2,
      patAttempts: 2,
      patBlocked: 0,
      ranges: [
        { label: "<30", made: 1, att: 1 },
        { label: "30-39", made: 1, att: 1 },
        { label: "40-49", made: 1, att: 2 },
        { label: "50+", made: 0, att: 0 },
      ],
      contributors: [
        { name: "Villagomez,Carlos", role: "K", line: "3/4 FG / long 42" },
        { name: "Webb,Aiden", role: "H", line: "FG/PAT holder" },
        { name: "Skartvedt,Drew", role: "LS", line: "FG operation" },
      ],
    },
  },
  jsu: {
    shortName: "JSU",
    side: "Home",
    colors: { primary: "#002147", accent: "#4A90D9" },
    avgStart: 24.75,
    hiddenYards: 10,
    summary: { swing: -20, penaltyCost: 20, plays: 15 },
    kickoff: {
      attempts: 5,
      touchbackRate: 0,
      avgStartAllowed: 27.2,
      espa: -1.3,
      returnRateAllowed: 1,
      avgReturnAllowed: 14,
      explosivesAllowed: 0,
      contributors: [
        { name: "Baeza,Gerardo", role: "K", line: "5 KO / 27.2 avg start allowed" },
        { name: "Simmons,Errick", role: "KR", line: "multiple returns" },
        { name: "Hawkins,Shamar", role: "COV", line: "kick coverage tackle" },
      ],
    },
    punt: {
      attempts: 6,
      gross: 38.5,
      inside20: 0,
      inside10: 0,
      fairCatch: 0,
      returnRateAllowed: null,
      avgReturnAllowed: null,
      nyoe: 0,
      blocks: 0,
      contributors: [
        { name: "Collins,Kye", role: "P/H", line: "6 punts / 38.5 gross" },
        { name: "Fortilien,Joanes", role: "KR", line: "17-yard return" },
        { name: "Ware,Jaylan", role: "COV", line: "punt coverage tackle" },
      ],
    },
    fieldGoals: {
      attempts: 0,
      made: 0,
      pct: null,
      long: 0,
      trustRange: 0,
      aggression: 0,
      blocked: 0,
      patMade: 3,
      patAttempts: 4,
      patBlocked: 1,
      ranges: [
        { label: "<30", made: 0, att: 0 },
        { label: "30-39", made: 0, att: 0 },
        { label: "40-49", made: 0, att: 0 },
        { label: "50+", made: 0, att: 0 },
      ],
      contributors: [
        { name: "Baeza,Gerardo", role: "K", line: "3/4 PAT / 1 blocked" },
        { name: "Collins,Kye", role: "H", line: "PAT holder" },
        { name: "Burns,Hunter", role: "LS", line: "PAT operation" },
      ],
    },
  },
};

export const fmtPct = (n) => (n == null ? "—" : `${Math.round(n * 100)}%`);

export const fmt1 = (n) => (n == null ? "—" : (n ?? 0).toFixed(1));

export const signed = (n) => (n > 0 ? `+${n}` : String(n));

export function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}
