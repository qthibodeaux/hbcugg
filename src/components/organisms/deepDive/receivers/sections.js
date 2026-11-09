import { CLUTCH_GROUP, LEADERS_GROUP } from "./groupLeaders";
import { NEW_FACES_GROUP, THEN_NOW_GROUP } from "./groupNewFaces";
import { WEEKLY_GROUP, YARDS_GROUP } from "./groupTrendsYards";
import { IDENTITY_GROUP, TRUST_GROUP } from "./groupTrustIdentity";
import { ClutchInfo, IdentityInfo, LeadersInfo, NewFacesInfo, ThenNowInfo, TrustInfo, WeeklyInfo, YardsInfo } from "./infographics";

// ─────────────────────────────────────────────────────────────────────────────
// This series' format (the user's call for this one, 2026-11-06): each section is two isos
// and an infographic. Only infographics print a headline (the user, 2026-11-06, removed them from
// the single chart cards); the strings here aren't drawn. The group's other posters show alongside
// them, for the user to pick from.
// ─────────────────────────────────────────────────────────────────────────────

const section = (group, isos, Info) => {
  const picked = isos.map(([id, headline]) => ({ ...group.posters.find((p) => p.id === id), headline }));
  return {
    id: group.id,
    label: group.label,
    posters: [...picked, { id: "infographic", chip: "Infographic", Poster: Info }],
    spares: group.posters.filter((p) => !isos.some(([id]) => id === p.id)),
  };
};

export const SECTIONS = [
  section(LEADERS_GROUP, [["value", "Big yards don't always | mean big value"], ["first-downs", ""]], LeadersInfo),
  section(CLUTCH_GROUP, [["swings", "One catch | changes everything"], ["added", "Who adds the most | win chance"]], ClutchInfo),
  section(NEW_FACES_GROUP, [["share", "Built by | the portal"], ["top-board", "The best | first year transfers"]], NewFacesInfo),
  section(THEN_NOW_GROUP, [["rise-fall", "The biggest jumps | and drops"], ["timeline", "Every week of league passing | since 2019"]], ThenNowInfo),
  section(WEEKLY_GROUP, [["last3", "Heating up, | cooling off"], ["share", "Suddenly | the go to"]], WeeklyInfo),
  section(YARDS_GROUP, [["depth-yac", "Downfield or | after the catch"], ["sticks", "Throw it | past the sticks"]], YardsInfo),
  section(TRUST_GROUP, [["target-share", "The one man | offenses"], ["trusted", "Trusted on | the biggest downs"]], TrustInfo),
  section(IDENTITY_GROUP, [["deep-epa", "Throw deep, | pass better"], ["by-score", "Who changes | with the score"]], IdentityInfo),
];
