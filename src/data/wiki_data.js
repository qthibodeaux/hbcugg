export const SWAC = {
  key: "SWAC",
  name: "Southwestern Athletic Conference",
  logo: "/assets/swaclogo.png",
  colors: {
    primary: "#6F2633",
    secondary: "#A2AAAD",
    ink: "#0B0B0D",
    text: "#FFFFFF",
  },
  commissioner: "Dr. Charles McClelland",
  founded: "1920",
  hq: "Birmingham, AL",
  members: "12 Football Programs",
  structure: "East and West divisions",
  championPath: "East + West -> SWAC Championship -> Celebration Bowl",
  celebrationRecord: "4 Celebration Bowl wins",
  states: ["Alabama", "Arkansas", "Florida", "Louisiana", "Mississippi", "Texas"],
  cities: ["Jackson", "Birmingham", "New Orleans", "Houston", "Baton Rouge", "Little Rock", "Tallahassee", "Montgomery"],
  slogan: "Where Tradition Meets Excellence",
  titles: [
    { name: "Grambling State", count: 27, logo: "/assets/swacgsu.svg" },
    { name: "Southern", count: 19, logo: "/assets/swacsu.svg" },
    { name: "Jackson State", count: 17, logo: "/assets/swacjsu.svg" },
    { name: "Alcorn State", count: 13, logo: "/assets/swacalc.svg" },
  ],
  traditions: ["Bayou Classic", "Magic City Classic", "State Fair Classic", "Florida Classic", "Battle of the Bands"],
  identity: "Deep South, Gulf Coast, Texas, stadium energy, classics, bands, and high-visibility rivalry weekends.",
  gameStyle: "Atmosphere-heavy football with explosive skill talent, big-play Saturdays, and rivalry volatility.",
  recentChamp: { year: "2024", name: "Jackson State", logo: "/assets/swacjsu.svg" },
  stats: [
    ["12", "Football Programs"],
    ["East & West", "Divisions"],
    ["4", "Bowl Wins"],
  ],
  timeline: [
    ["1920", "Founded by athletic leaders"],
    ["1999", "Championship era begins"],
    ["2015", "Celebration Bowl begins"],
    ["2021", "FAMU and BCU join"],
    ["2025", "PVAMU wins SWAC Title"],
  ],
  media: ["SWAC Digital Network", "ESPN+ / ESPN App", "HBCU Plus", "Local TV Markets"],
};

export const MEAC = {
  key: "MEAC",
  name: "Mid-Eastern Athletic Conference",
  logo: "/assets/meaclogo.png",
  colors: {
    primary: "#4B0082",
    secondary: "#FFD100",
    ink: "#0B0B0D",
    text: "#FFFFFF",
  },
  commissioner: "Sonja Stills",
  founded: "1969",
  hq: "Norfolk, VA",
  members: "6 Football Programs",
  structure: "Regular-season champion pathway",
  championPath: "Regular Season Champion -> Celebration Bowl",
  celebrationRecord: "6 Celebration Bowl wins",
  states: ["Delaware", "D.C.", "Maryland", "North Carolina", "South Carolina", "Virginia"],
  cities: ["Washington D.C.", "Baltimore", "Norfolk", "Richmond", "Durham", "Orangeburg", "Dover", "Raleigh"],
  slogan: "The Standard For Academic & Athletic Excellence",
  titles: [
    { name: "S.C. State", count: 18, logo: "/assets/meacscsu.svg" },
    { name: "N.C. Central", count: 4, logo: "/assets/meacnccu.svg" },
    { name: "Howard", count: 4, logo: "/assets/meachu.svg" },
    { name: "Morgan State", count: 4, logo: "/assets/meacmsu.svg" },
  ],
  traditions: ["MEAC/SWAC Challenge", "Truth and Service Classic", "Aggie-Eagle legacy", "Homecoming corridor"],
  identity: "East Coast and Mid-Atlantic HBCU corridor with civic history, academic legacy, and postseason pride.",
  gameStyle: "Physical, compact, field-position football with a long defensive and special teams tradition.",
  recentChamp: { year: "2024", name: "Norfolk State", logo: "/assets/meacnsu.svg" },
  stats: [
    ["6", "Football Programs"],
    ["Single Tier", "Structure"],
    ["6", "Bowl Wins"],
  ],
  timeline: [
    ["1969", "Conference founded"],
    ["1971", "First games played"],
    ["2015", "Celebration Bowl era begins"],
    ["2021", "Membership consolidation"],
    ["2025", "SCSU wins Celebration Bowl"],
  ],
  media: ["ESPN / ESPN2 / ABC", "MEAC Digital Network", "ESPN+ Originals", "NCAA Postseason Window"],
};

export const COMPARISON_ROWS = [
  ["Founded", SWAC.founded, MEAC.founded],
  ["Headquarters", SWAC.hq, MEAC.hq],
  ["Commissioner", SWAC.commissioner, MEAC.commissioner],
  ["Football members", "12", "6"],
  ["Football structure", "East / West divisions", "Single-table league champion"],
  ["Title route", "SWAC Championship Game", "Regular-season champion"],
  ["Bowl route", "SWAC champion to Atlanta", "MEAC champion to Atlanta"],
  ["Geography", "Deep South, Gulf, Texas", "East Coast, Mid-Atlantic, Carolinas"],
  ["Game Style", "Explosive, Skill-Heavy", "Physical, Defensive"],
  ["Signature media", "SWAC Digital Network / ESPN", "ESPN events / ABC bowl window"],
  ["NFL Legacy", "100+ Draftees", "Pro Bowl Pedigree"],
  ["Band Culture", "Battle of the Bands", "The Marching 100 Influence"],
  ["2025 Champ", "Prairie View A&M", "South Carolina State"],
  ["Realignment", "Acquired FAMU/BCU", "Consolidated to Core 6"],
  ["Status", "FCS Powerhouse", "Postseason Efficiency"],
];

export const SYSTEM_COMPARISON_ROWS = COMPARISON_ROWS.slice(0, 7);
export const COMPARISON_IMAGE = "/pics/stadium_dusk.jpg";

export const POSTSEASON_DATA = {
  meacSwacChallenge: {
    name: "MEAC/SWAC Challenge",
    seriesRecord: "MEAC leads 12-6",
    colors: { primary: "#6F2633", secondary: "#A2AAAD" },
    mission: "A Labor Day weekend tradition in Atlanta. The game serves as a celebration of HBCU culture and institutional pride on a national FBS-level stage.",
    recent: {
      year: "2024",
      winner: { id: "jackson-state", name: "Jackson State" },
      score: "37-34",
      opponent: "Florida A&M"
    }
  },
  celebrationBowl: {
    name: "Celebration Bowl",
    seriesRecord: "MEAC leads 6-4",
    colors: { primary: "#4B0082", secondary: "#FFD100" },
    history: [
      { year: 2024, winner: { id: "meacnsu", name: "Norfolk State" }, loser: { id: "swacjsu", name: "Jackson State" }, score: "24-21" },
      { year: 2023, winner: { id: "meachu", name: "Howard" }, loser: { id: "swacfamu", name: "Florida A&M" }, score: "30-26" },
      { year: 2022, winner: { id: "meacnccu", name: "NC Central" }, loser: { id: "swacjsu", name: "Jackson State" }, score: "41-34" },
      { year: 2021, winner: { id: "meacscsu", name: "S.C. State" }, loser: { id: "swacjsu", name: "Jackson State" }, score: "31-10" },
      { year: 2019, winner: { id: "meacaggies", name: "NC A&T" }, loser: { id: "swacalc", name: "Alcorn State" }, score: "64-44" },
      { year: 2018, winner: { id: "meacaggies", name: "NC A&T" }, loser: { id: "swacalc", name: "Alcorn State" }, score: "24-22" },
      { year: 2017, winner: { id: "meacaggies", name: "NC A&T" }, loser: { id: "swacgsu", name: "Grambling State" }, score: "21-14" },
      { year: 2016, winner: { id: "swacgsu", name: "Grambling State" }, loser: { id: "meacnccu", name: "NC Central" }, score: "10-9" },
      { year: 2015, winner: { id: "meacaggies", name: "NC A&T" }, loser: { id: "swacalc", name: "Alcorn State" }, score: "41-34" }
    ]
  }
};

export const CELEBRATION_ORBIT_GAMES = [
  {
    year: "2015",
    winner: "MEAC",
    meac: "NC A&T",
    meacScore: "41",
    swac: "Alcorn State",
    swacScore: "34",
    attendance: "35,528",
    series: "MEAC 1-0",
    note: "Tarik Cohen launches the era",
  },
  {
    year: "2016",
    winner: "SWAC",
    meac: "NC Central",
    meacScore: "9",
    swac: "Grambling State",
    swacScore: "10",
    attendance: "31,096",
    series: "Tied 1-1",
    note: "Grambling squares the ledger",
  },
  {
    year: "2017",
    winner: "MEAC",
    meac: "NC A&T",
    meacScore: "21",
    swac: "Grambling State",
    swacScore: "14",
    attendance: "25,873",
    series: "MEAC 2-1",
    note: "Mercedes-Benz era begins",
  },
  {
    year: "2018",
    winner: "MEAC",
    meac: "NC A&T",
    meacScore: "24",
    swac: "Alcorn State",
    swacScore: "22",
    attendance: "31,672",
    series: "MEAC 3-1",
    note: "Aggies survive a classic",
  },
  {
    year: "2019",
    winner: "MEAC",
    meac: "NC A&T",
    meacScore: "64",
    swac: "Alcorn State",
    swacScore: "44",
    attendance: "32,968",
    series: "MEAC 4-1",
    note: "Record 108-point eruption",
  },
  {
    year: "2020",
    winner: "NONE",
    meac: "Canceled",
    meacScore: "-",
    swac: "COVID-19",
    swacScore: "-",
    attendance: "-",
    series: "Paused",
    note: "Season interruption",
  },
  {
    year: "2021",
    winner: "MEAC",
    meac: "SC State",
    meacScore: "31",
    swac: "Jackson State",
    swacScore: "10",
    attendance: "48,653",
    series: "MEAC 5-1",
    note: "Bulldogs reset the stage",
  },
  {
    year: "2022",
    winner: "MEAC",
    meac: "NC Central",
    meacScore: "41",
    swac: "Jackson State",
    swacScore: "34 OT",
    attendance: "49,670",
    series: "MEAC 6-1",
    note: "Highest-attended thriller",
  },
  {
    year: "2023",
    winner: "SWAC",
    meac: "Howard",
    meacScore: "26",
    swac: "Florida A&M",
    swacScore: "30",
    attendance: "41,108",
    series: "MEAC 6-2",
    note: "Rattlers start the response",
  },
  {
    year: "2024",
    winner: "SWAC",
    meac: "SC State",
    meacScore: "7",
    swac: "Jackson State",
    swacScore: "28",
    attendance: "36,823",
    series: "MEAC 6-3",
    note: "Jackson State closes ground",
  },
  {
    year: "2025",
    winner: "MEAC",
    meac: "SC State",
    meacScore: "40",
    swac: "PVAMU",
    swacScore: "38 4OT",
    attendance: "26,703",
    series: "MEAC 7-3",
    note: "Four-overtime title fight",
  },
];

export const CELEBRATION_TEAM_ABBREVIATIONS = {
  "NC A&T": "NCAT",
  "NC Central": "NCCU",
  "SC State": "SCSU",
  "Alcorn State": "ALCN",
  "Grambling State": "GSU",
  "Jackson State": "JSU",
  "Florida A&M": "FAMU",
  "Howard": "HOW",
  "PVAMU": "PVAMU",
};

export const CELEBRATION_TEAM_COLORS = {
  NCAT: "#FDB515",
  NCCU: "#8A1538",
  SCSU: "#900027",
  ALCN: "#FFD100",
  GSU: "#FDB913",
  JSU: "#4A90D9",
  FAMU: "#F4811F",
  HOW: "#E31837",
  PVAMU: "#FFB81C",
};

export const CELEBRATION_LEDGER_GAMES = CELEBRATION_ORBIT_GAMES.filter((game) => game.winner !== "NONE").reduce(
  (games, game) => {
    const meacAbbrev = CELEBRATION_TEAM_ABBREVIATIONS[game.meac] || game.meac;
    const swacAbbrev = CELEBRATION_TEAM_ABBREVIATIONS[game.swac] || game.swac;
    const winnerAbbrev = game.winner === "MEAC" ? meacAbbrev : swacAbbrev;
    const titleCount = (games.counts[winnerAbbrev] || 0) + 1;

    games.counts[winnerAbbrev] = titleCount;
    games.rows.push({
      ...game,
      meacAbbrev,
      swacAbbrev,
      winnerAbbrev,
      titleCount,
      winnerDisplay: titleCount > 1 ? `${winnerAbbrev} x${titleCount}` : winnerAbbrev,
      swacScore: game.swacScore.replace(" OT", "").replace(" 4OT", ""),
      photo: `/assets/cb/${game.year}cb.jpg`,
    });

    return games;
  },
  { rows: [], counts: {} },
).rows;

export const RIVALRIES = [
  {
    name: "Bayou Classic",
    teamA: "grambling",
    teamB: "southern",
    desc: "New Orleans spectacle and one of HBCU football's defining stages.",
  },
  {
    name: "Magic City Classic",
    teamA: "alabama-am",
    teamB: "alabama-state",
    desc: "Birmingham rivalry weekend with massive FCS attendance gravity.",
  },
  {
    name: "Florida Classic",
    teamA: "florida-am",
    teamB: "bethune-cookman",
    desc: "Florida HBCU rivalry carried from MEAC history into the SWAC era.",
  },
  {
    name: "State Fair Classic",
    teamA: "grambling",
    teamB: "pvam",
    desc: "Dallas classic embedded in the State Fair of Texas weekend.",
  },
  {
    name: "Labor Day Classic",
    teamA: "pvam",
    teamB: "texas-southern",
    desc: "Houston-area rivalry stage with Texas HBCU stakes.",
  },
  {
    name: "Soul Bowl",
    teamA: "jackson-state",
    teamB: "alcorn",
    desc: "Mississippi rivalry with SWAC East gravity.",
  },
  {
    name: "BoomBox Classic",
    teamA: "jackson-state",
    teamB: "southern",
    desc: "Two high-visibility SWAC brands and band cultures in one frame.",
  },
  {
    name: "Capital City Classic",
    teamA: "jackson-state",
    teamB: "alcorn",
    desc: "Legacy Mississippi classic identity around JSU and Alcorn State.",
  },
  {
    name: "Morgan-Howard Classic",
    teamA: "morgan-state",
    teamB: "howard",
    desc: "MEAC corridor rivalry between Baltimore and Washington, D.C.",
  },
  {
    name: "MEAC Championship Standard",
    teamA: "sc-state",
    teamB: "nccu",
    desc: "Recent title-stage tension between two MEAC powers.",
  },
  {
    name: "Spartan-Bison Clash",
    teamA: "norfolk-state",
    teamB: "howard",
    desc: "MEAC table stakes with coastal and capital-city identities.",
  },
  {
    name: "SWAC East Heat",
    teamA: "florida-am",
    teamB: "southern",
    desc: "A modern SWAC brand clash with postseason atmosphere.",
  },
  {
    name: "Delta Duel",
    teamA: "mvsu",
    teamB: "uapb",
    desc: "Regional SWAC meeting built on Delta and Arkansas identity.",
  },
];

export const TITLE_PATH_BUCKETS = [
  {
    id: "foundations",
    range: "1920-1971",
    title: "Foundations",
    tone: "#E53E3E",
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
