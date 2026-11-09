import teamsData from "../../../../data/teams.json";

// Existing ranking fixture and authoritative team lookup; fixture scores are unchanged.

const allTeams = teamsData.teams;

const byShort = Object.fromEntries(allTeams.map((t) => [t.shortName, t]));

export const MOCK_GLORY_TOP6 = [
  { shortName: 'JSU',  name: 'Jackson State',  glory: 98, prev: 1, trend: 'hold' },
  { shortName: 'NCCU', name: 'N.C. Central',   glory: 96, prev: 3, trend: 'up'   },
  { shortName: 'FAMU', name: 'Florida A&M',    glory: 94, prev: 2, trend: 'down' },
  { shortName: 'SU',   name: 'Southern',       glory: 92, prev: 4, trend: 'up'   },
  { shortName: 'HU',   name: 'Howard',         glory: 90, prev: 5, trend: 'hold' },
  { shortName: 'ASU',  name: 'Alabama State',  glory: 88, prev: 7, trend: 'up'   },
];

export const getTeam = (shortName) => byShort[shortName] || null;
