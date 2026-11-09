import { SPECIAL_TEAMS_PRODUCTION } from "../GameProductionSpecialTeamsA";

// Existing special-teams ledger fixture, team selection and formatting.

const TEAMS = SPECIAL_TEAMS_PRODUCTION;

export const RETURN_DATA = {
  pvamu: {
    longFieldDriveRate: 0.667,
    kickoffValue: -2.67,
    puntNetValue: -5,
    kickReturners: [
      { name: "Kellen Stewart", ret: 2, yards: 45, avg: 22.5, long: 29 },
      { name: "Shadrick Byrd", ret: 2, yards: 0, avg: 0, long: 0, note: "2 fair catches" },
    ],
    puntReturners: [
      { name: "Andre Dennis", ret: 2, yards: 12, avg: 6, long: 7 },
    ],
  },
  jsu: {
    longFieldDriveRate: 0.833,
    kickoffValue: -1.3,
    puntNetValue: 0,
    kickReturners: [
      { name: "Errick Simmons", ret: 3, yards: 40, avg: 13.3, long: 19 },
      { name: "Travis Terrell Jr.", ret: 2, yards: 24, avg: 12, long: 24 },
      { name: "Jabari Jones", ret: 1, yards: 3, avg: 3, long: 3 },
    ],
    puntReturners: [
      { name: "Travis Terrell Jr.", ret: 2, yards: 0, avg: 0, long: 0, note: "2 fair catches" },
    ],
  },
};

export const fmtPct = (n) => (n == null ? "--" : `${Math.round(n * 100)}%`);

export const fmt1 = (n) => (n == null ? "--" : (n ?? 0).toFixed(1));

export const signed = (n) => (n > 0 ? `+${n}` : String(n));

export const tone = (n) => (n >= 0 ? "#68D391" : "#E53E3E");

export function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

export const teamEntries = [
  ["pvamu", TEAMS.pvamu],
  ["jsu", TEAMS.jsu],
];
