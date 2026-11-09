

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
