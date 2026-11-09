

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
