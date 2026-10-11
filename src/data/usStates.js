// US Census FIPS state codes + approximate geographic centers, keyed by
// 2-letter abbreviation. Centers are rough (good enough for centering a
// small single-state map card), not survey-grade centroids.
export const US_STATES = {
  AL: { name: "Alabama", fips: "01", center: [-86.8, 32.8] },
  AK: { name: "Alaska", fips: "02", center: [-152.0, 64.0] },
  AZ: { name: "Arizona", fips: "04", center: [-111.6, 34.2] },
  AR: { name: "Arkansas", fips: "05", center: [-92.3, 34.9] },
  CA: { name: "California", fips: "06", center: [-119.4, 36.8] },
  CO: { name: "Colorado", fips: "08", center: [-105.5, 39.0] },
  CT: { name: "Connecticut", fips: "09", center: [-72.7, 41.6] },
  DE: { name: "Delaware", fips: "10", center: [-75.5, 39.0] },
  DC: { name: "D.C.", fips: "11", center: [-77.0, 38.9] },
  FL: { name: "Florida", fips: "12", center: [-81.5, 27.8] },
  GA: { name: "Georgia", fips: "13", center: [-83.5, 32.9] },
  HI: { name: "Hawaii", fips: "15", center: [-155.5, 19.9] },
  ID: { name: "Idaho", fips: "16", center: [-114.6, 44.4] },
  IL: { name: "Illinois", fips: "17", center: [-89.2, 40.0] },
  IN: { name: "Indiana", fips: "18", center: [-86.3, 39.8] },
  IA: { name: "Iowa", fips: "19", center: [-93.5, 42.0] },
  KS: { name: "Kansas", fips: "20", center: [-98.4, 38.5] },
  KY: { name: "Kentucky", fips: "21", center: [-84.9, 37.5] },
  LA: { name: "Louisiana", fips: "22", center: [-91.9, 31.0] },
  ME: { name: "Maine", fips: "23", center: [-69.0, 45.4] },
  MD: { name: "Maryland", fips: "24", center: [-76.7, 39.0] },
  MA: { name: "Massachusetts", fips: "25", center: [-71.5, 42.3] },
  MI: { name: "Michigan", fips: "26", center: [-84.7, 44.3] },
  MN: { name: "Minnesota", fips: "27", center: [-94.3, 46.3] },
  MS: { name: "Mississippi", fips: "28", center: [-89.7, 32.7] },
  MO: { name: "Missouri", fips: "29", center: [-92.5, 38.5] },
  MT: { name: "Montana", fips: "30", center: [-109.6, 47.0] },
  NE: { name: "Nebraska", fips: "31", center: [-99.8, 41.5] },
  NV: { name: "Nevada", fips: "32", center: [-116.9, 39.5] },
  NH: { name: "New Hampshire", fips: "33", center: [-71.6, 43.7] },
  NJ: { name: "New Jersey", fips: "34", center: [-74.7, 40.2] },
  NM: { name: "New Mexico", fips: "35", center: [-106.1, 34.5] },
  NY: { name: "New York", fips: "36", center: [-75.5, 43.0] },
  NC: { name: "North Carolina", fips: "37", center: [-79.4, 35.6] },
  ND: { name: "North Dakota", fips: "38", center: [-100.5, 47.5] },
  OH: { name: "Ohio", fips: "39", center: [-82.8, 40.3] },
  OK: { name: "Oklahoma", fips: "40", center: [-97.5, 35.5] },
  OR: { name: "Oregon", fips: "41", center: [-120.6, 44.0] },
  PA: { name: "Pennsylvania", fips: "42", center: [-77.8, 40.9] },
  RI: { name: "Rhode Island", fips: "44", center: [-71.5, 41.7] },
  SC: { name: "South Carolina", fips: "45", center: [-81.0, 33.9] },
  SD: { name: "South Dakota", fips: "46", center: [-100.2, 44.4] },
  TN: { name: "Tennessee", fips: "47", center: [-86.4, 35.9] },
  TX: { name: "Texas", fips: "48", center: [-99.3, 31.5] },
  UT: { name: "Utah", fips: "49", center: [-111.7, 39.3] },
  VT: { name: "Vermont", fips: "50", center: [-72.6, 44.0] },
  VA: { name: "Virginia", fips: "51", center: [-78.2, 37.5] },
  WA: { name: "Washington", fips: "53", center: [-121.0, 47.3] },
  WV: { name: "West Virginia", fips: "54", center: [-80.6, 38.9] },
  WI: { name: "Wisconsin", fips: "55", center: [-89.6, 44.6] },
  WY: { name: "Wyoming", fips: "56", center: [-107.5, 43.0] },
};

const TINY_STATES = new Set(["DC", "RI"]);
const SMALL_STATES = new Set(["DE", "CT", "NJ", "MD", "MA", "NH", "VT", "HI"]);
const LARGE_STATES = new Set([
  "CA", "MT", "TX", "MN", "NM", "AZ", "NV", "CO", "OR", "WY",
  "ID", "KS", "NE", "UT", "IA", "IL", "WI", "GA", "NC", "MI", "FL",
]);

export const stateMapScale = (abbr) => {
  if (abbr === "AK") return 1300;
  if (TINY_STATES.has(abbr)) return 22000;
  if (SMALL_STATES.has(abbr)) return 10000;
  if (LARGE_STATES.has(abbr)) return 2100;
  return 5200;
};
