import teamsData from "../../../../data/teams.json";
import { Trophy, Flame, TrendingUp, Crown } from "lucide-react";

// Retained game-spotlight lab fixture, opponent labels, badge metadata and stat-line formatting.

const OPPONENT_ABBREV = (() => {
  const map = new Map();
  const put = (name, short) => {
    if (name && short) map.set(String(name).toLowerCase().replace(/[^a-z&]/g, ""), short);
  };
  teamsData.teams.forEach((team) => {
    put(team.name, team.shortName);
    put(team.bannerName, team.shortName);
  });
  return map;
})();

export const abbreviateOpponent = (value) => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(vs|@)\s+(.*)$/i);
  const prefix = match ? match[1] : "";
  const name = (match ? match[2] : raw).trim();
  const key = name.toLowerCase().replace(/[^a-z&]/g, "");

  let short = OPPONENT_ABBREV.get(key);
  if (!short) {
    // Mock/pipeline names are sometimes shortened ("Grambling" vs
    // "Grambling State", "Prairie View" vs "Prairie View A&M").
    for (const [candidate, abbrev] of OPPONENT_ABBREV) {
      if (candidate.startsWith(key) || key.startsWith(candidate)) {
        short = abbrev;
        break;
      }
    }
  }

  return `${prefix ? `${prefix} ` : ""}${short ?? name}`;
};

export const TICK_HOLD = 6000;

export const TICK_FADE = 400;

export const BADGE_CONFIG = {
  career: { icon: Trophy, label: "CAREER BEST", color: "#F6AD55" },
  season: { icon: Flame, label: "SEASON BEST", color: "#E53E3E" },
  recent: { icon: TrendingUp, label: "RECENT", color: "#68D391" },
  homecoming: { icon: Crown, label: "HOMECOMING", color: "#B794F4" },
};

export const MOCK_SEASON_GAMES = [
  { week: "Week 1", vs: "vs Alcorn State", result: "W 24-17", par: 8.2, stats: { tackles: 6, solo_tackles: 4, assisted_tackles: 2, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "Open-field TFL on 3rd & 2, forced punt", epa: -1.4, wpa: 0.04 } },
  { week: "Week 2", vs: "@ Texas Southern", result: "L 14-21", par: 5.1, stats: { tackles: 4, solo_tackles: 3, assisted_tackles: 1, sacks: 0, tfl: 0, qb_hurries: 0, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Missed tackle allowed 22-yd gain", epa: 1.1, wpa: -0.03 } },
  { week: "Week 3", vs: "vs Grambling", result: "W 31-10", par: 14.6, stats: { tackles: 8, solo_tackles: 6, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 1, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "PBU on 3rd & 9 in the red zone", epa: -1.9, wpa: 0.05 } },
  { week: "Week 4", vs: "vs Prairie View", result: "W 35-14", par: 22.4, tier: "season", note: "Season-high tackle total, SWAC POTW", stats: { tackles: 11, solo_tackles: 8, assisted_tackles: 3, sacks: 0.5, tfl: 1.5, qb_hurries: 1, passes_defended: 2, forced_fumbles: 0 }, highlightPlay: { description: "Sack + forced fumble, recovered by defense", epa: -3.2, wpa: 0.11 } },
  { week: "Week 5", vs: "vs Florida A&M", result: "W 21-10", par: 12.9, tier: "recent", note: "First forced fumble of the season", stats: { tackles: 7, solo_tackles: 5, assisted_tackles: 2, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 0, forced_fumbles: 1 }, highlightPlay: { description: "Forced fumble on kickoff return", epa: -2.6, wpa: 0.09 } },
  { week: "Week 6", vs: "@ Alabama A&M", result: "L 17-24", par: 3.4, stats: { tackles: 3, solo_tackles: 2, assisted_tackles: 1, sacks: 0, tfl: 0, qb_hurries: 0, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Blown coverage on go-ball TD", epa: 4.8, wpa: -0.14 } },
  { week: "Week 7", vs: "vs Southern", result: "W 28-21", par: 16.8, tier: "homecoming", note: "Homecoming shutdown performance", stats: { tackles: 9, solo_tackles: 7, assisted_tackles: 2, sacks: 1, tfl: 1, qb_hurries: 1, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Sack on 4th & 3 to end the drive", epa: -2.9, wpa: 0.1 } },
  { week: "Week 8", vs: "vs Jackson State", result: "W 28-21", par: 24.7, tier: "career", note: "Career-high tackle total", stats: { tackles: 13, solo_tackles: 10, assisted_tackles: 3, sacks: 1, tfl: 2, qb_hurries: 1, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "TFL + PBU on back-to-back snaps", epa: -2.1, wpa: 0.07 } },
  { week: "Week 9", vs: "@ Mississippi Valley", result: "W 42-7", par: 19.3, stats: { tackles: 10, solo_tackles: 8, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 0, passes_defended: 2, forced_fumbles: 0 }, highlightPlay: { description: "Pick-six on a tipped pass", epa: 5.6, wpa: 0.18 } },
  { week: "Week 10", vs: "@ Alabama State", result: "L 17-24", par: 9.5, stats: { tackles: 5, solo_tackles: 4, assisted_tackles: 1, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "TFL on 4th-down goal-line stand", epa: -3.5, wpa: 0.12 } },
  { week: "Week 11", vs: "vs Bethune-Cookman", result: "W 30-20", par: 17.2, stats: { tackles: 8, solo_tackles: 6, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 1, passes_defended: 0, forced_fumbles: 1 }, highlightPlay: { description: "Forced fumble, recovered inside the 10", epa: -3.0, wpa: 0.1 } },
  { week: "Week 12", vs: "@ Norfolk State", result: "W 26-13", par: 11.4, stats: { tackles: 6, solo_tackles: 5, assisted_tackles: 1, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "PBU to force a turnover on downs", epa: -1.7, wpa: 0.06 } },
];

const formatStatNum = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export const buildStatFields = (stats = {}) => {
  const fields = [
    { label: "TKL", value: formatStatNum(stats.tackles ?? 0) },
    { label: "TFL", value: formatStatNum(stats.tfl ?? 0) },
  ];
  if (stats.sacks) fields.push({ label: "SCK", value: formatStatNum(stats.sacks) });
  else if (stats.forced_fumbles) fields.push({ label: "FF", value: formatStatNum(stats.forced_fumbles) });
  else fields.push({ label: "PD", value: formatStatNum(stats.passes_defended ?? 0) });
  return fields;
};

export const SECONDARY_STAT_LABELS = new Set(["RUSH", "REC", "KR", "PR"]);
