import teamsData from "../../../../data/teams.json";

// Existing mock division standings and authoritative team lookup; no ranks are recomputed.

const allTeams = teamsData.teams;

const byShort = Object.fromEntries(allTeams.map((t) => [t.shortName, t]));

export const MOCK_SWAC_WEST = [
  { shortName: 'SU',    name: 'Southern',            record: '8-2', conf: '6-1', trend: 'up',   diff: +112 },
  { shortName: 'GSU', name: 'Grambling State',   record: '7-3', conf: '5-2', trend: 'up',   diff: +56  },
  { shortName: 'PVAMU', name: 'Prairie View',         record: '6-4', conf: '4-3', trend: 'flat', diff: +18  },
  { shortName: 'TSU',   name: 'Texas Southern',       record: '4-6', conf: '3-4', trend: 'down', diff: -15  },
  { shortName: 'UAPB',  name: 'Arkansas Pine Bluff',  record: '3-7', conf: '2-5', trend: 'down', diff: -77  },
  { shortName: 'Alcorn',name: 'Alcorn State',         record: '2-8', conf: '1-6', trend: 'down', diff: -103 },
];

export const MOCK_SWAC_EAST = [
  { shortName: 'JSU',  name: 'Jackson State',    record: '9-1', conf: '8-0', trend: 'up',   diff: +173 },
  { shortName: 'FAMU', name: 'Florida A&M',      record: '8-2', conf: '7-1', trend: 'up',   diff: +69  },
  { shortName: 'ASU',  name: 'Alabama State',    record: '7-3', conf: '6-2', trend: 'up',   diff: +44  },
  { shortName: 'AAMU', name: 'Alabama A&M',      record: '6-4', conf: '4-4', trend: 'flat', diff: -12  },
  { shortName: 'BCU',  name: 'Bethune-Cookman',  record: '5-5', conf: '3-5', trend: 'down', diff: -48  },
  { shortName: 'MVSU', name: 'Mississippi Valley',record: '1-9', conf: '0-8', trend: 'down', diff: -144 },
];

export const MOCK_MEAC = [
  { shortName: 'NCCU', name: 'N.C. Central',    record: '8-2', conf: '6-0', trend: 'up',   diff: +129 },
  { shortName: 'HU',   name: 'Howard',           record: '7-3', conf: '5-1', trend: 'up',   diff: +88  },
  { shortName: 'NSU',  name: 'Norfolk State',    record: '6-4', conf: '4-2', trend: 'flat', diff: +26  },
  { shortName: 'MSU',  name: 'Morgan State',     record: '5-5', conf: '3-3', trend: 'flat', diff: -13  },
  { shortName: 'DSU',  name: 'Delaware State',   record: '4-6', conf: '2-4', trend: 'down', diff: -59  },
  { shortName: 'SCSU', name: 'S.C. State',       record: '3-7', conf: '1-5', trend: 'down', diff: -121 },
];

export const getTeam = (shortName) => byShort[shortName] || null;
