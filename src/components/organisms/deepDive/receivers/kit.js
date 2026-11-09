// ─────────────────────────────────────────────────────────────────────────────
// Stats > Deep Dive: the receiver series' shared parts. A poster is 1400 wide, HBCUGG on
// top, the headline on the image (the user's call for this series), then the panel. No legends
// or footnotes.
//
// The numbers are the backend's exploration (zThinking/explorations/
// 2026-11-06_receiver_deep_dive), copied into src/data/receiverDeepDive2026W9.json. Nothing
// here computes a stat; the parts only draw what the file holds.
// ─────────────────────────────────────────────────────────────────────────────

export { default as DATA } from "../../../../data/receiverDeepDive2026W9.json";
export { POSTER_W, caps, epa, fgOf, int, one, pct, tab } from "../gridPosterKit";
export { lastName, logoOf } from "../deepDiveModel";
export { teamShortName } from "../../../game/export/exportData";

export const uniqueBy = (rows, key) => {
  const seen = new Set();
  return rows.filter((r) => (seen.has(r[key]) ? false : seen.add(r[key])));
};

export { RPoster, InfoPoster, Panels, BigStat, Card } from "./posterKit/PosterFrames";

export { chg, Logo, Who, Board, Table } from "./posterKit/PosterTables";

export { Dumbbell, Scatter, Line } from "./posterKit/PosterCharts";
