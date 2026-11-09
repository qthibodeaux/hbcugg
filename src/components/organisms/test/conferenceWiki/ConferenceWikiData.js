import { POSTSEASON_DATA } from "../../../../data/wiki_data";
import teamsData from "../../../../data/teams.json";

// Existing implementation extracted along responsibility boundaries.

export const CELEBRATION_RESULTS = POSTSEASON_DATA.celebrationBowl.history.map(game => [
  game.year.toString(),
  game.winner.id.startsWith('swac') ? "SWAC" : "MEAC",
  `${game.winner.name} over ${game.loser.name}`
]);

export const TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

const TEAM_BY_ID = Object.fromEntries(TEAMS.map((team) => [team.id, team]));

export const getTeamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TBD";

export const resolveRivalryTeams = (rivalry) => ({
  ...rivalry,
  a: TEAM_BY_ID[rivalry.teamA],
  b: TEAM_BY_ID[rivalry.teamB],
});

export const TITLE_PATH_BUCKETS = [
  {
    id: "foundations",
    range: "1920-1971",
    title: "Foundations",
    tone: "#A855F7",
    events: [
      { year: "1920", label: "SWAC Founded", detail: "Houston meeting creates the Southwestern Athletic Conference." },
      { year: "1970", label: "MEAC Confirmed", detail: "East Coast HBCU institutions organize the MEAC." },
      { year: "1971", label: "Morgan State", detail: "First MEAC football season ends with Morgan State as champion." },
    ],
  },
  {
    id: "pelican",
    range: "1972-1975",
    title: "Pelican Bowl",
    tone: "#FDB913",
    events: [
      { year: "1972", label: "First Pelican Bowl", detail: "Grambling defeats North Carolina Central, 56-6." },
      { year: "1974", label: "High-Water Mark", detail: "Grambling beats South Carolina State before 30,120 fans." },
      { year: "1975", label: "Final Pelican", detail: "Southern edges South Carolina State in the Superdome." },
    ],
  },
  {
    id: "bridge",
    range: "1976-1979",
    title: "Bridge Years",
    tone: "#007A5E",
    events: [
      { year: "1976-80", label: "Gold Bowl Era", detail: "MEAC champion meets the CIAA champion in Richmond." },
      { year: "1978", label: "MEAC Division I", detail: "The MEAC reaches NCAA Division I classification." },
      { year: "1979", label: "MEAC Expands", detail: "Bethune-Cookman and Florida A&M are voted into the MEAC." },
    ],
  },
  {
    id: "heritage",
    range: "1991-1999",
    title: "Heritage Bowl",
    tone: "#8A1538",
    events: [
      { year: "1991", label: "Heritage Begins", detail: "The SWAC vs MEAC postseason concept returns." },
      { year: "1994", label: "True Champions", detail: "SCSU beats Grambling in the top-seed Heritage Bowl matchup." },
      { year: "1999", label: "Heritage Ends", detail: "The Heritage Bowl closes after uneven champion participation." },
    ],
  },
  {
    id: "showcase",
    range: "1999-2015",
    title: "Modern Showcase",
    tone: "#4A90D9",
    events: [
      { year: "1999", label: "SWAC Title Game", detail: "Southern defeats Jackson State, 31-30, at Legion Field." },
      { year: "2005", label: "MEAC/SWAC Challenge", detail: "The conferences gain a regular-season showcase window." },
      { year: "2015", label: "Celebration Era", detail: "SWAC and MEAC champions commit to the Atlanta title stage." },
    ],
  },
  {
    id: "modern-map",
    range: "2020-2021",
    title: "Modern Map",
    tone: "#FFFFFF",
    events: [
      { year: "2020", label: "Realignment Set", detail: "FAMU and BCU are added to the SWAC East; Alcorn moves West." },
      { year: "2021", label: "Florida Joins", detail: "Florida A&M and Bethune-Cookman officially enter the SWAC." },
      { year: "2021", label: "MEAC Resets", detail: "The MEAC football map resets around a smaller core." },
    ],
  },
];

export const MEMBERSHIP = {
  swacEast: ["Alabama A&M", "Alabama State", "Bethune-Cookman", "Florida A&M", "Jackson State", "Mississippi Valley State"],
  swacWest: ["Alcorn State", "Grambling State", "Prairie View A&M", "Southern", "Texas Southern", "Arkansas-Pine Bluff"],
  meacFootball: ["Delaware State", "Howard", "Morgan State", "North Carolina Central", "Norfolk State", "South Carolina State"],
  meacNonFootball: ["Coppin State", "Maryland Eastern Shore"],
  formerContext: ["Florida A&M", "Bethune-Cookman", "North Carolina A&T", "Hampton"],
};

export const SHARED_TIMELINE = [
  ["1890s", "HBCU football origins and first intercollegiate games."],
  ["1970s", "FCS landscape solidifies with MEAC founding."],
  ["2005", "MEAC/SWAC Challenge launches the season."],
  ["2015", "Celebration Bowl creates the unified title stage."],
  ["2020s", "National TV windows and HBCU GO expansion."],
  ["Modern", "18 programs defining the FCS HBCU universe."],
];
