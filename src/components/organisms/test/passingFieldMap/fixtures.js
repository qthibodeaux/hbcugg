// Existing box-score lab sample; distinct from measured production passing data.
export const TEAMS = {
  jsu: {
    meta: {
      name: "Jackson State",
      shortName: "JSU",
      logo: "/assets/swacjsu.svg",
      colors: { primary: "#002147", secondary: "#FFFFFF", accent: "#4A90D9" },
    },
    passing: { attempts: 17, completions: 9, yards: 187, touchdowns: 2, interceptions: 1, sacks_taken: 1 },
    downSplit: {
      standard: { comp: 3, att: 4, yards: 142, int: 0, success: 3 },
      passing: { comp: 5, att: 11, yards: 45, int: 1, success: 3 },
    },
    passers: [
      {
        name: "Lockhart,Jared", key: "name:lockhart,jared",
        attempts: 9, completions: 6, yards: 183, touchdowns: 2, interceptions: 1, sacks_taken: 1,
        grid: {
          short: { left: { comp: 2, att: 2, yards: 19 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 1, att: 1, yards: 22 }, middle: { comp: 1, att: 2, yards: 79 }, right: { comp: 2, att: 2, yards: 63 } },
        },
      },
      {
        name: "Morgan,JaCobian", key: "name:morgan,jacobian",
        attempts: 6, completions: 2, yards: 4, touchdowns: 0, interceptions: 0, sacks_taken: 0,
        grid: {
          short: { left: { comp: 1, att: 1, yards: 2 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 4, yards: 2 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
        },
      },
    ],
    receivers: [
      { name: "Rembert,Nate", key: "name:rembert,nate", targets: 7, receptions: 4, yards: 107, touchdowns: 1, grid: { short: { left: { comp: 1, att: 1, yards: 4 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 3, yards: 2 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 1, att: 2, yards: 79 }, right: { comp: 1, att: 1, yards: 22 } } } },
      { name: "Dupree,Ja'Naylon", key: "name:dupree,ja'naylon", targets: 2, receptions: 2, yards: 37, touchdowns: 1, grid: { short: { left: { comp: 1, att: 1, yards: 15 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 1, att: 1, yards: 22 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Savage,Shemar", key: "name:savage,shemar", targets: 1, receptions: 1, yards: 41, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 1, yards: 41 } } } },
      { name: "Paul,Kobe", key: "name:paul,kobe", targets: 1, receptions: 1, yards: 2, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 2 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
    ],
    oppDefense: {
      team: "Prairie View A&M", shortName: "PVAMU",
      disruption_rate: 0.1667, explosive_prevention: 0.881, ypp_allowed: 6.98, bend_dont_break: 14.65,
      havoc_rate: 0.1667, tfl_rate: 0.0952, sack_rate: 0.0238, pd_rate: 0.0476,
    },
  },
  pvamu: {
    meta: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      logo: "/assets/swacpvamu.svg",
      colors: { primary: "#4B0082", secondary: "#FFB81C" },
    },
    passing: { attempts: 29, completions: 17, yards: 294, touchdowns: 1, interceptions: 1, sacks_taken: 1 },
    downSplit: {
      standard: { comp: 6, att: 14, yards: 59, int: 0, success: 4 },
      passing: { comp: 11, att: 15, yards: 235, int: 1, success: 9 },
    },
    passers: [
      {
        name: "Peters,Cameron", key: "name:peters,cameron",
        attempts: 28, completions: 17, yards: 294, touchdowns: 1, interceptions: 1, sacks_taken: 1,
        grid: {
          short: { left: { comp: 6, att: 7, yards: 51 }, middle: { comp: 3, att: 5, yards: 41 }, right: { comp: 4, att: 7, yards: 31 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 1, att: 4, yards: 66 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 3, att: 4, yards: 105 } },
        },
      },
      {
        name: "Byrd,Shadrick", key: "name:byrd,shadrick",
        attempts: 1, completions: 0, yards: 0, touchdowns: 0, interceptions: 0, sacks_taken: 0,
        grid: {
          short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } },
          medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
          deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } },
        },
      },
    ],
    receivers: [
      { name: "Rockwell,Jyzaiah", key: "name:rockwell,jyzaiah", targets: 6, receptions: 4, yards: 96, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 1, att: 1, yards: 15 }, right: { comp: 1, att: 1, yards: 16 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 2, att: 3, yards: 65 } } } },
      { name: "Jones,Travon", key: "name:jones,travon", targets: 5, receptions: 3, yards: 12, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 6 }, middle: { comp: 1, att: 1, yards: 3 }, right: { comp: 1, att: 3, yards: 3 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Dennis,Andre", key: "name:dennis,andre", targets: 5, receptions: 2, yards: 39, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 16 }, middle: { comp: 1, att: 2, yards: 23 }, right: { comp: 0, att: 1, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 1, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Ojo,Rodny", key: "name:ojo,rodny", targets: 3, receptions: 2, yards: 7, touchdowns: 0, grid: { short: { left: { comp: 2, att: 2, yards: 7 }, middle: { comp: 0, att: 1, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "John,Ethan", key: "name:john,ethan", targets: 2, receptions: 1, yards: 66, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 1, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 1, att: 1, yards: 66 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Banks,Ja'Koby", key: "name:banks,ja'koby", targets: 2, receptions: 2, yards: 12, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 2, att: 2, yards: 12 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Byrd,Shadrick", key: "name:byrd,shadrick", targets: 2, receptions: 1, yards: 11, touchdowns: 0, grid: { short: { left: { comp: 1, att: 2, yards: 11 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
      { name: "Bonner,Cameron", key: "name:bonner,cameron", targets: 1, receptions: 1, yards: 40, touchdowns: 0, grid: { short: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 1, att: 1, yards: 40 } } } },
      { name: "Bingmon,Chase", key: "name:bingmon,chase", targets: 1, receptions: 1, yards: 11, touchdowns: 0, grid: { short: { left: { comp: 1, att: 1, yards: 11 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, medium: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } }, deep: { left: { comp: 0, att: 0, yards: 0 }, middle: { comp: 0, att: 0, yards: 0 }, right: { comp: 0, att: 0, yards: 0 } } } },
    ],
    oppDefense: {
      team: "Jackson State", shortName: "JSU",
      disruption_rate: 0.1316, explosive_prevention: 0.8553, ypp_allowed: 6.07, bend_dont_break: 21.95,
      havoc_rate: 0.1316, tfl_rate: 0.0789, sack_rate: 0.0132, pd_rate: 0.0395,
    },
  },
};
